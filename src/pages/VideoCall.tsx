import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Video, PhoneOff, ArrowLeft, Loader2, ShieldAlert, Wifi, WifiOff, RefreshCw, Clock, Check, X, CalendarClock, AlertTriangle, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { useRespondToInvitation } from "@/hooks/useProposeSession";
import SessionStatusTimeline from "@/components/dashboard/SessionStatusTimeline";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

// Allow joining the room from T-10min until T+duration+5min.
const JOIN_EARLY_MS = 10 * 60 * 1000;
const JOIN_LATE_BUFFER_MS = 5 * 60 * 1000;
const JITSI_DOMAIN = "meet.jit.si";
const JITSI_SCRIPT_SRC = `https://${JITSI_DOMAIN}/external_api.js`;

interface BookingRow {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  session_type: string;
  video_room_id: string | null;
  patient_id: string;
  psychologist_id: string;
}

const loadJitsiScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const timeout = setTimeout(
      () => reject(new Error("Jitsi script load timed out — check your network or ad-blocker.")),
      15000,
    );
    const finish = (fn: () => void) => () => { clearTimeout(timeout); fn(); };
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${JITSI_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", finish(() => resolve()));
      existing.addEventListener("error", finish(() => reject(new Error("Failed to load Jitsi"))));
      return;
    }
    const s = document.createElement("script");
    s.src = JITSI_SCRIPT_SRC;
    s.async = true;
    s.onload = finish(() => resolve());
    s.onerror = finish(() => reject(new Error("Failed to load Jitsi")));
    document.body.appendChild(s);
  });

const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
};

const VideoCall = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [psyName, setPsyName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [embedReady, setEmbedReady] = useState(false);
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [now, setNow] = useState(Date.now());
  const [reconnectKey, setReconnectKey] = useState(0);
  const respond = useRespondToInvitation();
  const [respondError, setRespondError] = useState<string | null>(null);
  const [declineMode, setDeclineMode] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [embedError, setEmbedError] = useState<string | null>(null);

  // Tick once a second so the countdown updates
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user || !sessionId) return;

    const loadBooking = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchErr } = await supabase
        .from("bookings")
        .select("id, scheduled_at, duration_minutes, status, session_type, video_room_id, patient_id, psychologist_id")
        .eq("id", sessionId)
        .maybeSingle();

      if (fetchErr || !data) {
        setError("Session not found.");
        setLoading(false);
        return;
      }

      // Authorization
      if (data.patient_id !== user.id && data.psychologist_id !== user.id) {
        setError("You are not authorized to join this session.");
        setLoading(false);
        return;
      }

      // Status must be active
      if (!["confirmed", "pending", "in_progress", "proposed"].includes(data.status)) {
        setError(`This session is ${data.status}.`);
        setLoading(false);
        return;
      }

      // End-of-window check
      const startsAt = new Date(data.scheduled_at).getTime();
      const duration = (data.duration_minutes ?? 50) * 60 * 1000;
      if (Date.now() > startsAt + duration + JOIN_LATE_BUFFER_MS) {
        setError("This session has ended.");
        setLoading(false);
        return;
      }

      setBooking(data as BookingRow);

      // Best-effort fetch of psychologist display name
      const { data: psy } = await supabase
        .from("psychologist_profiles")
        .select("full_name")
        .eq("id", data.psychologist_id)
        .maybeSingle();
      setPsyName(psy?.full_name ?? "");

      setLoading(false);
    };

    loadBooking();
  }, [user, sessionId]);

  const isPatient = !!booking && !!user && booking.patient_id === user.id;
  const isPsychologist = !!booking && !!user && booking.psychologist_id === user.id;

  const handleAcceptInvite = async () => {
    if (!booking) return;
    setRespondError(null);
    try {
      await respond.mutateAsync({ bookingId: booking.id, action: "accept" });
      toast.success("Session confirmed");
      // Refetch booking to update status / mount Jitsi if window is open
      const { data } = await supabase
        .from("bookings")
        .select("id, scheduled_at, duration_minutes, status, session_type, video_room_id, patient_id, psychologist_id")
        .eq("id", booking.id)
        .maybeSingle();
      if (data) setBooking(data as BookingRow);
    } catch (e: any) {
      setRespondError(e?.message ?? "Could not confirm. Please try again.");
    }
  };

  const handleDeclineInvite = async () => {
    if (!booking) return;
    setRespondError(null);
    try {
      await respond.mutateAsync({
        bookingId: booking.id,
        action: "decline",
        reason: declineReason.trim() || undefined,
      });
      toast("Invitation declined");
      navigate("/my-space");
    } catch (e: any) {
      setRespondError(e?.message ?? "Could not decline. Please try again.");
    }
  };

  // Derived window state
  const windowState = useMemo(() => {
    if (!booking) return { phase: "loading" as const, opensInMs: 0 };
    const startsAt = new Date(booking.scheduled_at).getTime();
    if (now < startsAt - JOIN_EARLY_MS) {
      return { phase: "early" as const, opensInMs: startsAt - JOIN_EARLY_MS - now };
    }
    return { phase: "open" as const, opensInMs: 0 };
  }, [booking, now]);

  // Log a session event (best-effort).
  const logEvent = useCallback(
    async (eventType: string, metadata?: Record<string, unknown>) => {
      if (!user || !booking) return;
      try {
        await supabase.from("session_events").insert([
          {
            booking_id: booking.id,
            session_id: null,
            user_id: user.id,
            event_type: eventType,
            metadata: (metadata ?? null) as any,
          },
        ]);
      } catch (e) {
        console.warn("session_events insert failed", e);
      }
    },
    [user, booking],
  );

  // Mount Jitsi External API once we have a roomId AND we're inside the join window
  useEffect(() => {
    if (!booking || !user || !containerRef.current) return;
    if (booking.status === "proposed") return; // not joinable yet
    if (windowState.phase !== "open") return;
    if (!booking.video_room_id) {
      setError("This session has no video room. Please contact your specialist.");
      return;
    }
    let cancelled = false;
    setConnectionState("connecting");
    setEmbedReady(false);
    setEmbedError(null);

    (async () => {
      try {
        await loadJitsiScript();
        if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;

        const displayName = user.user_metadata?.full_name || user.email || "Participant";
        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: booking.video_room_id,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName, email: user.email ?? undefined },
          configOverwrite: {
            prejoinPageEnabled: true,
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            enableClosePage: false,
            requireDisplayName: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: "#0F0F0F",
            TOOLBAR_BUTTONS: [
              "microphone", "camera", "desktop", "fullscreen",
              "fodeviceselection", "hangup", "chat", "raisehand",
              "videoquality", "tileview", "settings",
            ],
          },
        });
        apiRef.current = api;

        api.addListener("videoConferenceJoined", () => {
          setConnectionState("connected");
          setEmbedReady(true);
          logEvent("joined");
        });
        api.addListener("videoConferenceLeft", () => {
          setConnectionState("disconnected");
          logEvent("left");
          toast("Session ended");
          setTimeout(() => navigate("/my-space"), 800);
        });
        api.addListener("readyToClose", () => {
          navigate("/my-space");
        });
      } catch (e) {
        console.error(e);
        setEmbedError(
          (e as Error)?.message ??
            "Could not load the meeting room. Please check your connection and retry.",
        );
        setConnectionState("disconnected");
        logEvent("connection_failed", { reason: (e as Error).message });
      }
    })();

    return () => {
      cancelled = true;
      try {
        apiRef.current?.dispose();
      } catch {
        /* ignore */
      }
      apiRef.current = null;
    };
  }, [booking, user, navigate, logEvent, windowState.phase, reconnectKey]);

  const handleLeave = () => {
    try {
      apiRef.current?.executeCommand("hangup");
    } catch {
      /* ignore */
    }
    navigate("/my-space");
  };

  const handleReconnect = () => {
    setError(null);
    setEmbedError(null);
    setReconnectKey((k) => k + 1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-h2 mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to join a video session.</p>
          <SocialAuthButtons className="mb-4" />
          <Button variant="primary" asChild className="w-full">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-h2 mb-2">Cannot Join</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handleReconnect}>
              <RefreshCw className="h-4 w-4 mr-1" /> Try again
            </Button>
            <Button variant="primary" onClick={() => navigate("/my-space")}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Proposed booking — show inline Accept/Decline (patient) or waiting state (specialist)
  if (booking && booking.status === "proposed") {
    const dt = new Date(booking.scheduled_at);
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-10 text-center max-w-md w-full">
          <CalendarClock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-h2 mb-2">
            {isPatient ? "Confirm your session" : "Waiting for client"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {isPatient
              ? "Your specialist proposed this session. Accept to unlock the room."
              : "This invitation is awaiting your client's reply. The room will open once they accept."}
          </p>
          <div className="flex justify-center mb-4">
            <SessionStatusTimeline status="proposed" />
          </div>
          <div className="rounded-xl border border-border p-4 text-left mb-5 bg-muted/20">
            <p className="text-sm">
              <span className="text-muted-foreground">With: </span>
              <span className="font-medium">{psyName || "Your specialist"}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">When: </span>
              {dt.toLocaleString(undefined, {
                weekday: "short", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
            <p className="text-sm capitalize">
              <span className="text-muted-foreground">Type: </span>
              {booking.session_type.replace("_", " ")} · {booking.duration_minutes} min
            </p>
          </div>
          {respondError && (
            <p className="text-sm text-destructive mb-3">{respondError}</p>
          )}
          {isPatient ? (
            declineMode ? (
              <div className="space-y-3 text-left">
                <label className="text-xs text-muted-foreground" htmlFor="decline-reason">
                  Reason for declining (optional)
                </label>
                <Textarea
                  id="decline-reason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value.slice(0, 500))}
                  placeholder="Let your specialist know why, if you'd like"
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => { setDeclineMode(false); setDeclineReason(""); }}
                    disabled={respond.isPending}
                  >
                    Back
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeclineInvite}
                    disabled={respond.isPending}
                  >
                    {respond.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-1" />
                    )}
                    Confirm decline
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setDeclineMode(true)}
                  disabled={respond.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAcceptInvite}
                  disabled={respond.isPending}
                >
                  {respond.isPending && respond.variables?.action === "accept" ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Accept
                </Button>
              </div>
            )
          ) : (
            <Button variant="outline" onClick={() => navigate("/my-space")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to dashboard
            </Button>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Conformément à la loi 09-08, vos données personnelles sont protégées.
          </p>
        </div>
      </div>
    );
  }

  // Suppress lint: isPsychologist used implicitly above via !isPatient branch
  void isPsychologist;

  // Pre-window waiting screen with live countdown
  if (booking && windowState.phase === "early") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-12 text-center max-w-md">
          <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-h2 mb-2">Room opens soon</h2>
          <p className="text-muted-foreground mb-2">
            The session room unlocks 10 minutes before the start time.
          </p>
          <p className="text-3xl font-semibold text-primary tabular-nums my-4">
            {formatCountdown(windowState.opensInMs)}
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Session with {psyName || "your specialist"} ·{" "}
            {new Date(booking.scheduled_at).toLocaleString(undefined, {
              weekday: "short", month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
          <Button variant="outline" onClick={() => navigate("/my-space")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/my-space")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
          <div className="hidden sm:flex items-center gap-3">
            <Video className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Session with {psyName || "Psychologist"}
            </span>
            {booking && (
              <SessionStatusTimeline
                status={connectionState === "connected" ? "in_progress" : booking.status}
              />
            )}
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              {connectionState === "connected" ? (
                <><Wifi className="h-3 w-3 text-primary" /> Connected</>
              ) : connectionState === "connecting" ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Connecting…</>
              ) : (
                <><WifiOff className="h-3 w-3 text-destructive" /> Disconnected</>
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connectionState === "disconnected" && (
            <Button variant="outline" size="sm" onClick={handleReconnect}>
              <RefreshCw className="h-4 w-4 mr-1" /> Reconnect
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={handleLeave}>
            <PhoneOff className="h-4 w-4 mr-1" /> Leave
          </Button>
        </div>
      </div>

      {/* Jitsi External API mount */}
      <div className="flex-1 relative bg-black">
        {embedError && (
          <div className="absolute inset-x-0 top-0 z-20 px-4 py-3">
            <div className="mx-auto max-w-3xl rounded-xl border border-destructive/40 bg-destructive/10 backdrop-blur p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Meeting room failed to load</p>
                  <p className="text-muted-foreground mt-0.5">
                    Check your internet, then tap retry. If the issue persists, contact support.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={handleReconnect}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Retry
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/my-space?tab=support">
                    <LifeBuoy className="h-4 w-4 mr-1" /> Contact support
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
        {!embedReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 text-white">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Preparing your secure room…</p>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full absolute inset-0" />
      </div>
    </div>
  );
};

export default VideoCall;
