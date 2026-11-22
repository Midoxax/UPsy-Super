import { useState } from "react";
import { toast } from "sonner";
import { withLogo } from "@/components/UpsyLogo";
import { CalendarPlus, Clock, MapPin, Phone, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRecruitmentCopy } from "@/lib/recruitment/recruitmentCopy";
import { downloadIcs, interviewIcs } from "@/lib/recruitment/ics";
import SlotPicker from "./SlotPicker";

export type Invitation = Tables<"recruitment_invitations"> & {
  recruitment_slots: Tables<"recruitment_slots">[];
};

/**
 * One interview invitation, seen from one side ("candidate" or "recruiter"):
 * pick a slot the other side proposed, propose your own, add the confirmed
 * interview to your calendar, reschedule or cancel.
 */
export default function InvitationCard({
  inv,
  side,
  counterpart,
  onChange,
}: {
  inv: Invitation;
  side: "candidate" | "recruiter";
  counterpart?: string | null;
  onChange: () => void;
}) {
  const { t, locale } = useRecruitmentCopy();
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [proposing, setProposing] = useState(false);
  const fmt = (d: string) =>
    new Date(d).toLocaleString(
      locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  const now = Date.now();
  const slots = [...inv.recruitment_slots]
    .filter((s) => new Date(s.starts_at).getTime() > now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const theirs = slots.filter((s) => s.proposed_by !== side);
  const mine = slots.filter((s) => s.proposed_by === side);
  const open = inv.status === "proposed";
  const ModeIcon =
    inv.mode === "phone" ? Phone : inv.mode === "in_person" ? MapPin : Video;

  const call = async (
    fn: () => PromiseLike<{ error: { message: string } | null }>,
    ok: string,
  ) => {
    setBusy(true);
    const { error } = await fn();
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("conflict") ? t.conflict : error.message,
      );
      return false;
    }
    toast.success(ok);
    onChange();
    return true;
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{withLogo(inv.title)}</p>
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
            {counterpart && (
              <span>
                {t.with} {withLogo(counterpart)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <ModeIcon className="h-3 w-3" /> {t.modes[inv.mode]}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {t.minutes(inv.duration_minutes)}
            </span>
          </p>
        </div>
        <Badge variant={inv.status === "scheduled" ? "default" : "secondary"}>
          {t.status[inv.status] ?? inv.status}
        </Badge>
      </div>
      {inv.message && (
        <p className="text-sm whitespace-pre-line">{inv.message}</p>
      )}

      {inv.status === "scheduled" && inv.scheduled_at && (
        <div className="space-y-2 rounded-lg bg-muted/40 p-3 text-sm">
          <p className="font-medium">{t.scheduledFor(fmt(inv.scheduled_at))}</p>
          {inv.location && (
            <p className="text-muted-foreground">{inv.location}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {inv.meeting_url && (
              <Button size="sm" asChild>
                <a
                  href={inv.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Video className="h-4 w-4 me-1" /> {t.join}
                </a>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                downloadIcs(
                  "entretien-upsy",
                  interviewIcs({
                    id: inv.id,
                    title: inv.title,
                    start: new Date(inv.scheduled_at!),
                    minutes: inv.duration_minutes,
                    location: inv.location,
                    url: inv.meeting_url,
                    description: inv.message,
                  }),
                )
              }
            >
              <CalendarPlus className="h-4 w-4 me-1" /> {t.addToCalendar}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                call(
                  () =>
                    supabase.rpc("recruitment_reschedule", {
                      _invitation: inv.id,
                    }),
                  t.reschedule,
                )
              }
            >
              {t.reschedule}
            </Button>
          </div>
        </div>
      )}

      {open && (
        <>
          {theirs.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium">{t.theirSlots}</p>
              {theirs.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-2 text-sm"
                >
                  <span>{fmt(s.starts_at)}</span>
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      call(
                        () =>
                          supabase.rpc("recruitment_confirm", { _slot: s.id }),
                        t.confirmed,
                      )
                    }
                  >
                    {t.choose}
                  </Button>
                </div>
              ))}
            </div>
          )}
          {mine.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t.yourSlots}</p>
              <ul className="text-sm list-disc ps-5">
                {mine.map((s) => (
                  <li key={s.id}>{fmt(s.starts_at)}</li>
                ))}
              </ul>
            </div>
          )}
          {proposing ? (
            <SlotPicker
              submitLabel={t.proposeSend}
              busy={busy}
              onSubmit={(iso) =>
                call(
                  () =>
                    supabase.rpc("recruitment_propose", {
                      _invitation: inv.id,
                      _slots: iso,
                    }),
                  t.proposed,
                ).then((ok) => ok && setProposing(false))
              }
            />
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProposing(true)}
            >
              {t.proposeOwn}
            </Button>
          )}
        </>
      )}

      {(open || inv.status === "scheduled") && (
        <div className="flex flex-wrap gap-2 border-t pt-3">
          <Input
            className="flex-1 min-w-[180px]"
            placeholder={t.reason}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              call(
                () =>
                  supabase.rpc("recruitment_cancel", {
                    _invitation: inv.id,
                    _reason: reason,
                  }),
                t.cancelled,
              )
            }
          >
            {side === "candidate" && open ? t.decline : t.cancel}
          </Button>
        </div>
      )}
      {inv.cancel_reason &&
        (inv.status === "cancelled" || inv.status === "declined") && (
          <p className="text-xs text-muted-foreground">{inv.cancel_reason}</p>
        )}
    </Card>
  );
}
