import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePendingInvitations, useRespondToInvitation } from "@/hooks/useProposeSession";
import { CalendarClock, Check, X, Loader2, Video, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import SessionStatusTimeline from "@/components/dashboard/SessionStatusTimeline";

const typeIcon = {
  video: Video,
  in_person: MapPin,
  phone: Phone,
};

export const PendingInvitationsCard = () => {
  const { toast } = useToast();
  const { data: invitations = [], isLoading } = usePendingInvitations();
  const respond = useRespondToInvitation();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const handle = async (id: string, action: "accept" | "decline", reason?: string) => {
    setPendingId(id);
    try {
      await respond.mutateAsync({ bookingId: id, action, reason });
      toast({
        title: action === "accept" ? "Session confirmed" : "Invitation declined",
        description:
          action === "accept"
            ? "Your psychologist has been notified."
            : "The invitation has been declined.",
      });
      setDecliningId(null);
      setDeclineReason("");
    } catch (err: any) {
      toast({
        title: "Action failed",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  if (isLoading) return null;
  if (invitations.length === 0) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          Pending session invitations
          <Badge variant="secondary">{invitations.length}</Badge>
        </CardTitle>
        <CardDescription>
          Your psychologist has proposed the following session{invitations.length > 1 ? "s" : ""}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {invitations.map((inv: any) => {
          const Icon = typeIcon[inv.session_type as keyof typeof typeIcon] ?? Video;
          const isPending = pendingId === inv.id;
          const isDeclining = decliningId === inv.id;
          return (
            <div
              key={inv.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage src={inv.psychologist?.photo_url ?? undefined} />
                  <AvatarFallback>
                    {(inv.psychologist?.full_name ?? "P").slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {inv.psychologist?.full_name ?? "Your psychologist"}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Icon className="h-3.5 w-3.5" />
                    {format(new Date(inv.scheduled_at), "EEE d MMM · HH:mm")} ·{" "}
                    {inv.duration_minutes} min
                  </p>
                  {inv.patient_notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{inv.patient_notes}"
                    </p>
                  )}
                  <SessionStatusTimeline status="proposed" className="mt-2" />
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                {isDeclining ? (
                  <div className="w-full sm:w-72 space-y-2">
                    <Textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value.slice(0, 500))}
                      placeholder="Reason (optional, max 500 chars)"
                      rows={2}
                      className="text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setDecliningId(null); setDeclineReason(""); }}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handle(inv.id, "decline", declineReason.trim() || undefined)}
                        disabled={isPending}
                      >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        Confirm decline
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setDecliningId(inv.id); setDeclineReason(""); }}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => handle(inv.id, "accept")}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Accept
                </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PendingInvitationsCard;