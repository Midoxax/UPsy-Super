import { useEffect, useState } from "react";
import { Copy, RefreshCw, CalendarSync } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/** A private feed URL that keeps the user's calendar app in step with their
 *  UPSY sessions (Google, Outlook and Apple all poll subscribed feeds). */
export const CalendarSyncCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("calendar_feeds")
      .select("token")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setToken(data?.token ?? null));
  }, [user]);

  const create = async (rotate = false) => {
    if (!user) return;
    setBusy(true);
    if (rotate)
      await supabase.from("calendar_feeds").delete().eq("user_id", user.id);
    const { data, error } = await supabase
      .from("calendar_feeds")
      .insert({ user_id: user.id })
      .select("token")
      .single();
    setBusy(false);
    if (error) {
      toast({ title: "Could not create the link", variant: "destructive" });
      return;
    }
    setToken(data.token);
    if (rotate)
      toast({ title: "New link created. The old one no longer works." });
  };

  const https = token
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-feed?token=${token}`
    : "";
  const webcal = https.replace(/^https:/, "webcal:");

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: "var(--glass-bg)", border: "var(--glass-border)" }}
    >
      <div className="flex items-center gap-2">
        <CalendarSync className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">Sync with your calendar</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Subscribe once and your sessions appear in Google, Outlook or Apple
        Calendar, updated automatically. Keep this link private.
      </p>
      {!token ? (
        <Button size="sm" onClick={() => create()} disabled={busy}>
          Create my calendar link
        </Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <a
              href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Add to Google Calendar
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={webcal}>Apple / Outlook</a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigator.clipboard
                .writeText(https)
                .then(() => toast({ title: "Link copied" }))
            }
          >
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy link
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => create(true)}
            disabled={busy}
            title="Create a new link and disable the old one"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
        </div>
      )}
    </div>
  );
};
