import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  Calendar,
  Clock,
  MapPin,
  Globe,
  User,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useToast } from "@/hooks/use-toast";
import { format, isPast } from "date-fns";
import { useState as useStateReact } from "react";
import AnamnesisDrawer from "@/components/anamnesis/AnamnesisDrawer";
import { ClipboardList, CalendarPlus } from "lucide-react";
import ProposeSessionModal from "@/components/dashboard/ProposeSessionModal";

interface Session {
  id: string;
  date_time: string;
  session_type: string;
  status: string;
  duration_minutes: number;
  video_room_id: string | null;
  notes: string | null;
  client_id: string;
  client_profile: { full_name: string | null } | null;
}

/** The specialist's bookings: requests to answer, upcoming, past. Each
 *  confirmed booking is also a session (same id) for notes and plans. */
export const SessionsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [anamnesisFor, setAnamnesisFor] = useStateReact<{
    clientId: string;
    name?: string;
  } | null>(null);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings_with_details")
        .select(
          "id, scheduled_at, session_type, status, duration_minutes, video_room_id, patient_notes, patient_id, patient_name",
        )
        .eq("psychologist_id", user.id)
        .order("scheduled_at", { ascending: false })
        .limit(200);
      if (error) {
        toast({
          title: "Could not load sessions",
          description: error.message,
          variant: "destructive",
        });
      }
      setSessions(
        (data ?? [])
          .filter((b) => b.id && b.scheduled_at && b.patient_id)
          .map((b) => ({
            id: b.id!,
            date_time: b.scheduled_at!,
            session_type: b.session_type ?? "video",
            status: b.status ?? "pending",
            duration_minutes: b.duration_minutes ?? 50,
            video_room_id: b.video_room_id,
            notes: b.patient_notes,
            client_id: b.patient_id!,
            client_profile: { full_name: b.patient_name },
          })),
      );
      setLoading(false);
    };
    load();
  }, [user, toast]);

  const updateStatus = async (
    sessionId: string,
    status: string,
    reason?: string,
  ) => {
    const { error } = await supabase
      .from("bookings")
      .update({
        status,
        ...(reason ? { decline_reason: reason } : {}),
      })
      .eq("id", sessionId);
    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status } : s)),
    );
  };

  const requests = sessions.filter(
    (s) => s.status === "pending" && !isPast(new Date(s.date_time)),
  );
  const upcoming = sessions
    .filter((s) => !isPast(new Date(s.date_time)) && s.status === "confirmed")
    .reverse();
  const past = sessions.filter(
    (s) =>
      (isPast(new Date(s.date_time)) && s.status !== "cancelled") ||
      s.status === "completed",
  );
  const cancelled = sessions.filter((s) => s.status === "cancelled");

  const renderSession = (s: Session, showActions = false) => {
    const dt = new Date(s.date_time);
    const isOnline = s.session_type !== "in_person";
    const isUpcoming = !isPast(dt) && s.status === "confirmed";

    return (
      <div
        key={s.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
        style={{ background: "var(--glass-bg)", border: "var(--glass-border)" }}
      >
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">
              <User className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
              {s.client_profile?.full_name || "Client"}
            </p>
            <Badge variant="outline" className="text-[10px]">
              {isOnline ? (
                <>
                  <Globe className="mr-1 h-2.5 w-2.5" /> Online
                </>
              ) : (
                <>
                  <MapPin className="mr-1 h-2.5 w-2.5" /> In-Person
                </>
              )}
            </Badge>
            <Badge
              variant={
                s.status === "confirmed"
                  ? "default"
                  : s.status === "completed"
                    ? "secondary"
                    : s.status === "pending"
                      ? "outline"
                      : "destructive"
              }
              className="text-[10px]"
            >
              {s.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(dt, "EEE, MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(dt, "h:mm a")} · {s.duration_minutes}min
            </span>
          </div>
          {s.notes && (
            <p className="text-xs text-muted-foreground/70 flex items-start gap-1 mt-1">
              <FileText className="w-3 h-3 mt-0.5 shrink-0" />
              <span className="truncate">{s.notes}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isUpcoming && isOnline && s.video_room_id && (
            <Button variant="primary" size="sm" asChild>
              <Link to={`/session/${s.id}`}>
                <Video className="h-4 w-4 mr-1" /> Join Call
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setAnamnesisFor({
                clientId: s.client_id,
                name: s.client_profile?.full_name || undefined,
              })
            }
            title="Open clinical anamnesis"
          >
            <ClipboardList className="h-3.5 w-3.5 mr-1" /> Anamnesis
          </Button>
          {showActions && s.status === "pending" && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateStatus(s.id, "confirmed")}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Confirm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() =>
                  updateStatus(s.id, "cancelled", "Declined by the specialist")
                }
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
              </Button>
            </>
          )}
          {showActions && s.status === "confirmed" && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateStatus(s.id, "completed")}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => updateStatus(s.id, "cancelled")}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Sessions
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setProposeOpen(true)}
              >
                <CalendarPlus className="h-4 w-4 mr-1" />
                Propose session
              </Button>
              <Button size="sm" onClick={() => setLinkOpen(true)}>
                <Video className="h-4 w-4 mr-1" />
                Send meeting link
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue={requests.length > 0 ? "requests" : "upcoming"}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="requests">
                Requests ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({cancelled.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No requests waiting for you.
                  </p>
                </div>
              ) : (
                requests.map((s) => renderSession(s, true))
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-3">
              {upcoming.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming sessions.
                  </p>
                </div>
              ) : (
                upcoming.map((s) => renderSession(s, true))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-3">
              {past.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No past sessions yet.
                  </p>
                </div>
              ) : (
                past.map((s) => renderSession(s))
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-3">
              {cancelled.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No cancelled sessions.
                  </p>
                </div>
              ) : (
                cancelled.map((s) => renderSession(s))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {anamnesisFor && user && (
        <AnamnesisDrawer
          open={!!anamnesisFor}
          onOpenChange={(v) => !v && setAnamnesisFor(null)}
          clientId={anamnesisFor.clientId}
          clientName={anamnesisFor.name}
          psychologistId={user.id}
          isTherapistView
        />
      )}
      <ProposeSessionModal open={proposeOpen} onOpenChange={setProposeOpen} />
      <ProposeSessionModal
        open={linkOpen}
        onOpenChange={setLinkOpen}
        defaultMode="link"
      />
    </>
  );
};
