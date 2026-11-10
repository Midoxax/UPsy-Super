import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import NotFound from "@/pages/NotFound";
import {
  ArrowLeft,
  CalendarClock,
  Loader2,
  PlayCircle,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { formatWhen, useLiveCopy } from "@/lib/live/liveCopy";

const PUBLIC_JITSI = "meet.jit.si";
const HEARTBEAT_MS = 60_000;

interface JoinConfig {
  configured: boolean;
  domain?: string;
  room: string;
  jwt?: string;
  attendance_id: string | null;
  moderator: boolean;
  recording: boolean;
  error?: string;
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script"));
    document.body.appendChild(s);
  });
}

/** One live class: details, the video room, and its recordings. */
export default function LiveClassRoom() {
  const { id = "" } = useParams<{ id: string }>();
  const { t, locale } = useLiveCopy();
  const loc = useLocalizedField();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ dispose: () => void } | null>(null);
  const [joining, setJoining] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [cfg, setCfg] = useState<JoinConfig | null>(null);
  const [playing, setPlaying] = useState<{ id: string; url: string } | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["live-class", id, user?.id],
    enabled: !!id,
    queryFn: async () => {
      const { data: c } = await supabase
        .from("live_classes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!c) return null;
      const { data: recs } = user
        ? await supabase
            .from("live_class_recordings")
            .select(
              "id, title, title_fr, title_ar, summary, summary_fr, status, is_published, category, tags, created_at",
            )
            .eq("class_id", id)
            .order("created_at")
        : { data: [] };
      return { c, recs: recs ?? [] };
    },
  });

  // Attendance heartbeat while in the room.
  useEffect(() => {
    if (!inRoom || !cfg?.attendance_id) return;
    const beat = () =>
      supabase.functions.invoke("live-class", {
        body: { action: "heartbeat", attendance_id: cfg.attendance_id },
      });
    const h = setInterval(beat, HEARTBEAT_MS);
    return () => {
      clearInterval(h);
      beat();
    };
  }, [inRoom, cfg?.attendance_id]);

  useEffect(
    () => () => {
      try {
        apiRef.current?.dispose();
      } catch {
        /* ignore */
      }
    },
    [],
  );

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!data) return <NotFound />;
  const { c, recs } = data;

  const join = async () => {
    setJoining(true);
    const { data: res, error } = await supabase.functions.invoke<JoinConfig>(
      "live-class",
      { body: { action: "join", class_id: c.id } },
    );
    if (error || !res || res.error) {
      setJoining(false);
      let msg = t.roomError;
      try {
        const ctx = (error as { context?: Response } | null)?.context;
        const body = ctx ? await ctx.json() : null;
        if (body?.error) msg = body.error;
      } catch {
        /* keep default */
      }
      return toast.error(res?.error ?? msg);
    }
    setCfg(res);
    setInRoom(true);
    // Wait for the container to render.
    await new Promise((r) => setTimeout(r, 0));
    const domain = res.configured ? res.domain! : PUBLIC_JITSI;
    try {
      await loadScript(
        res.configured
          ? `https://${domain}/${res.room.split("/")[0]}/external_api.js`
          : `https://${domain}/external_api.js`,
      );
      const toolbar = [
        "microphone",
        "camera",
        "desktop",
        "fullscreen",
        "hangup",
        "chat",
        "raisehand",
        "tileview",
        "participants-pane",
        "settings",
        ...(res.recording ? ["recording"] : []),
      ];
      const api = new window.JitsiMeetExternalAPI(domain, {
        roomName: res.room,
        ...(res.configured ? { jwt: res.jwt } : {}),
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: {
          displayName:
            user?.user_metadata?.full_name || user?.email || "Participant",
          email: user?.email ?? undefined,
        },
        configOverwrite: {
          prejoinPageEnabled: true,
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          disableDeepLinking: true,
          toolbarButtons: toolbar,
        },
        interfaceConfigOverwrite: { TOOLBAR_BUTTONS: toolbar },
      });
      api.addListener("videoConferenceJoined", () => {
        if (res.configured && res.moderator)
          api.executeCommand("toggleLobby", true);
      });
      api.addListener("readyToClose", () => {
        api.dispose();
        setInRoom(false);
      });
      apiRef.current = api;
    } catch {
      toast.error(t.roomError);
      setInRoom(false);
    } finally {
      setJoining(false);
    }
  };

  const watch = async (recId: string) => {
    const { data: res } = await supabase.functions.invoke<{ url?: string }>(
      "live-class",
      { body: { action: "recording_url", recording_id: recId } },
    );
    if (res?.url) setPlaying({ id: recId, url: res.url });
    else toast.error(t.noReplay);
  };

  const stored = recs.filter((r) => r.status === "stored");

  return (
    <>
      <SEOHead
        path={`/learn/live/${c.id}`}
        title={`${loc(c, "title")} | U.Psy Academy`}
        description={loc(c, "description") || t.subtitle}
      />
      <main className="container-custom py-8 md:py-12 space-y-6">
        <Link
          to={addLocalePrefix("/learn/live", locale)}
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> {t.back}
        </Link>
        <header className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {c.recording_enabled ? t.recorded : t.notRecorded}
            </Badge>
            <Badge variant="outline">{c.language.toUpperCase()}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-display">
            {loc(c, "title")}
          </h1>
          <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
            <CalendarClock className="h-4 w-4" />{" "}
            {formatWhen(c.starts_at, locale)} · {c.duration_minutes} {t.minutes}
          </p>
          {loc(c, "description") && (
            <p className="text-muted-foreground max-w-2xl whitespace-pre-line">
              {loc(c, "description")}
            </p>
          )}
        </header>

        {inRoom ? (
          <section className="space-y-2">
            {cfg?.moderator && (
              <p className="text-xs text-muted-foreground">{t.hostNote}</p>
            )}
            {cfg && !cfg.configured && (
              <p className="text-xs text-muted-foreground">{t.fallbackNote}</p>
            )}
            <div
              ref={containerRef}
              className="w-full h-[70vh] min-h-[420px] rounded-2xl overflow-hidden bg-black"
            />
          </section>
        ) : user ? (
          <div className="space-y-2">
            <Button onClick={join} disabled={joining}>
              {joining ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <Video className="me-2 h-4 w-4" />
              )}
              {t.join}
            </Button>
            <p className="text-xs text-muted-foreground">{t.opensAt}</p>
          </div>
        ) : (
          <Button asChild>
            <Link to={addLocalePrefix("/auth", locale)}>{t.signIn}</Link>
          </Button>
        )}

        {user && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{t.replays}</h2>
            {stored.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noReplay}</p>
            ) : (
              <ul className="space-y-3">
                {stored.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-border p-4 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {loc(r, "title") || loc(c, "title")}
                        </p>
                        {loc(r, "summary") && (
                          <p className="text-sm text-muted-foreground">
                            {loc(r, "summary")}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => watch(r.id)}
                      >
                        <PlayCircle className="me-2 h-4 w-4" /> {t.watch}
                      </Button>
                    </div>
                    {playing?.id === r.id && (
                      <video
                        src={playing.url}
                        controls
                        className="w-full rounded-lg bg-black"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </>
  );
}
