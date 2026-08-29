import { useEffect, useState } from "react";
import { useParams, Link } from "@/lib/router-compat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Check, X, CalendarClock, AlertTriangle, Video, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { fetchProposalByToken, respondToProposalByToken } from "@/hooks/useProposeSession";

const typeIcon = {
  video: Video,
  in_person: MapPin,
  phone: Phone,
};

const BookingResponse = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"accept" | "decline" | null>(null);
  const [result, setResult] = useState<"confirmed" | "cancelled" | null>(null);

  useEffect(() => {
    if (!token) {
      setError("missing_token");
      setLoading(false);
      return;
    }
    fetchProposalByToken(token)
      .then((p) => {
        if (!p) setError("invalid_token");
        else if (p.proposal_expires_at && new Date(p.proposal_expires_at) < new Date())
          setError("expired");
        else if (p.status !== "proposed") setError("already_responded");
        else setProposal(p);
      })
      .catch(() => setError("invalid_token"))
      .finally(() => setLoading(false));
  }, [token]);

  const handle = async (action: "accept" | "decline") => {
    if (!token) return;
    setSubmitting(action);
    try {
      const res = await respondToProposalByToken(token, action);
      if (!res.ok) {
        setError(res.error ?? "unknown");
      } else {
        setResult(action === "accept" ? "confirmed" : "cancelled");
      }
    } catch {
      setError("unknown");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-12">
      {loading ? (
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : result ? (
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {result === "confirmed" ? (
                <Check className="h-6 w-6 text-primary" />
              ) : (
                <X className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <CardTitle>
              {result === "confirmed" ? "Session confirmed" : "Invitation declined"}
            </CardTitle>
            <CardDescription>
              {result === "confirmed"
                ? "Your psychologist has been notified. You'll receive a reminder before the session."
                : "The psychologist has been notified. You can request another time anytime."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link to="/my-space">Go to my space</Link>
            </Button>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>
              {error === "expired"
                ? "This invitation has expired"
                : error === "already_responded"
                ? "Invitation already answered"
                : "Invalid link"}
            </CardTitle>
            <CardDescription>
              {error === "expired"
                ? "Session proposals expire after 72 hours. Contact your psychologist to reschedule."
                : error === "already_responded"
                ? "This invitation has already been accepted or declined."
                : "We couldn't find this invitation. The link may be malformed."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      ) : proposal ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Session invitation
            </CardTitle>
            <CardDescription>
              Your psychologist has proposed a session. Please accept or decline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
              <Avatar className="h-14 w-14 border border-border">
                <AvatarImage src={proposal.psychologist?.photo_url ?? undefined} />
                <AvatarFallback>
                  {(proposal.psychologist?.full_name ?? "P").slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">
                  {proposal.psychologist?.full_name ?? "Your psychologist"}
                </p>
                <p className="text-sm text-muted-foreground">
                  has proposed a session with you
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs uppercase text-muted-foreground">When</p>
                <p className="font-semibold mt-1">
                  {format(new Date(proposal.scheduled_at), "EEEE d MMMM yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(proposal.scheduled_at), "HH:mm")} ·{" "}
                  {proposal.duration_minutes} minutes
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs uppercase text-muted-foreground">Type</p>
                <p className="font-semibold mt-1 flex items-center gap-2 capitalize">
                  {(() => {
                    const Icon =
                      typeIcon[proposal.session_type as keyof typeof typeIcon] ?? Video;
                    return <Icon className="h-4 w-4" />;
                  })()}
                  {proposal.session_type.replace("_", " ")}
                </p>
              </div>
            </div>

            {proposal.patient_notes && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs uppercase text-muted-foreground">Note from psychologist</p>
                <p className="text-sm mt-1 italic">"{proposal.patient_notes}"</p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => handle("decline")}
                disabled={!!submitting}
              >
                {submitting === "decline" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                Decline
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => handle("accept")}
                disabled={!!submitting}
              >
                {submitting === "accept" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Accept
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Conformément à la loi 09-08, vos données personnelles sont protégées.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
};

export default BookingResponse;