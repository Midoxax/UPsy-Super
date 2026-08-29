import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Calendar, Video, Star, ChevronRight, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";

interface Booking {
  id: string;
  scheduled_at: string;
  status: string;
  session_type: string;
  duration_minutes: number;
  video_room_id: string | null;
  psychologist_id: string;
  psychologist_name?: string | null;
}

export default function SessionsTimeline() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [upcoming, setUpcoming] = useState<Booking | null>(null);
  const [past, setPast] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const now = new Date().toISOString();

    const [upRes, pastRes] = await Promise.all([
      supabase
        .from("bookings_with_details")
        .select("*")
        .eq("patient_id", user!.id)
        .gte("scheduled_at", now)
        .in("status", ["confirmed", "pending", "proposed"])
        .order("scheduled_at", { ascending: true })
        .limit(1),
      supabase
        .from("bookings_with_details")
        .select("*")
        .eq("patient_id", user!.id)
        .lt("scheduled_at", now)
        .order("scheduled_at", { ascending: false })
        .limit(3),
    ]);

    if (upRes.data?.[0]) setUpcoming(upRes.data[0] as Booking);
    if (pastRes.data) setPast(pastRes.data as Booking[]);
    setLoading(false);
  };

  const canJoin = (b: Booking) => {
    const start = new Date(b.scheduled_at).getTime();
    const now = Date.now();
    return now >= start - 10 * 60 * 1000 && now <= start + b.duration_minutes * 60 * 1000;
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-h3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {t("dashboard.sessionsTimeline") || "Sessions"}
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/psychologists">
            {t("dashboard.book") || "Book"} <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">…</div>
      ) : upcoming ? (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-xs text-primary uppercase tracking-wide font-medium mb-1">
            {t("dashboard.nextSession") || "Next session"}
          </p>
          <p className="text-sm font-medium text-foreground">
            {upcoming.psychologist_name || "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{formatDateTime(upcoming.scheduled_at)}</p>
          <div className="flex gap-2 mt-3">
            {upcoming.status === "proposed" ? (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/session/${upcoming.id}`}>
                  <CalendarClock className="w-3.5 h-3.5 mr-1" />
                  {t("dashboard.confirmInvitation") || "Confirm invitation"}
                </Link>
              </Button>
            ) : canJoin(upcoming) && upcoming.video_room_id ? (
              <Button variant="primary" size="sm" asChild>
                <Link to={`/session/${upcoming.id}`}>
                  <Video className="w-3.5 h-3.5 mr-1" />
                  {t("dashboard.join") || "Join"}
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" disabled>
                <Video className="w-3.5 h-3.5 mr-1" />
                {t("dashboard.joinAvailable") || "Join opens 10 min before"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground p-4 rounded-2xl bg-muted/20 text-center">
          {t("dashboard.noUpcoming") || "No upcoming sessions"}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            {t("dashboard.recentSessions") || "Recent"}
          </p>
          {past.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
              <div>
                <p className="text-sm font-medium text-foreground">{b.psychologist_name || "—"}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(b.scheduled_at)}</p>
              </div>
              {b.status === "completed" && (
                <Button variant="ghost" size="sm">
                  <Star className="w-3.5 h-3.5 mr-1" />
                  {t("dashboard.review") || "Review"}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
