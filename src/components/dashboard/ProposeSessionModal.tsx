import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useProposeSession } from "@/hooks/useProposeSession";
import { useSendMeetingLink } from "@/hooks/useSendMeetingLink";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Video,
  Copy,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  defaultName?: string;
  /** "link" = send confirmed link now, "propose" = ask client to accept */
  defaultMode?: "propose" | "link";
}

type Mode = "propose" | "link";

// Format a Date as the value expected by <input type="date"> / <input type="time">
const toDateInput = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const toTimeInput = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(11, 16);
};

export const ProposeSessionModal = ({
  open,
  onOpenChange,
  defaultEmail = "",
  defaultName = "",
  defaultMode = "link",
}: Props) => {
  const { toast } = useToast();
  const propose = useProposeSession();
  const sendLink = useSendMeetingLink();

  const [mode, setMode] = useState<Mode>(defaultMode);
  const [clientEmail, setClientEmail] = useState(defaultEmail);
  const [clientName, setClientName] = useState(defaultName);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("50");
  const [type, setType] = useState<"video" | "in_person" | "phone">("video");
  const [notes, setNotes] = useState("");
  const [slotCheck, setSlotCheck] = useState<{ status: "idle" | "checking" | "ok" | "bad"; reason?: string }>({
    status: "idle",
  });
  const [lastSent, setLastSent] = useState<{ join_url: string; whatsapp_deeplink?: string; ics_data_url?: string } | null>(null);

  // Reset whenever the modal opens
  useEffect(() => {
    if (!open) return;
    setMode(defaultMode);
    setClientEmail(defaultEmail);
    setClientName(defaultName);
    setDate("");
    setTime("");
    setDuration("50");
    setType("video");
    setNotes("");
    setSlotCheck({ status: "idle" });
    setLastSent(null);
  }, [open, defaultMode, defaultEmail, defaultName]);

  const minDate = useMemo(() => toDateInput(new Date()), []);

  const scheduledAtIso = useMemo(() => {
    if (!date || !time) return null;
    const iso = new Date(`${date}T${time}`);
    return isNaN(iso.getTime()) ? null : iso.toISOString();
  }, [date, time]);

  // Quick-fill helpers — these write directly into date+time so there is one source of truth
  const fillRelative = (minutesFromNow: number) => {
    const d = new Date(Date.now() + minutesFromNow * 60_000);
    setDate(toDateInput(d));
    setTime(toTimeInput(d));
  };

  // Live slot validation via RPC (runs for both modes)
  useEffect(() => {
    if (!scheduledAtIso) {
      setSlotCheck({ status: "idle" });
      return;
    }
    let cancelled = false;
    setSlotCheck({ status: "checking" });
    const run = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data, error } = await supabase.rpc("check_proposal_slot", {
        _psy: auth.user.id,
        _start: scheduledAtIso,
        _duration: parseInt(duration, 10),
      });
      if (cancelled) return;
      if (error) {
        setSlotCheck({ status: "bad", reason: "check_failed" });
        return;
      }
      const res = data as { ok: boolean; reason?: string } | null;
      if (res?.ok) setSlotCheck({ status: "ok" });
      else setSlotCheck({ status: "bad", reason: res?.reason });
    };
    const t = setTimeout(run, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [scheduledAtIso, duration]);

  const reasonMessage = (r?: string) => {
    switch (r) {
      case "too_soon": return "Must be at least 1 hour in the future.";
      case "outside_availability": return "Outside your configured weekly availability.";
      case "slot_conflict": return "Overlaps with an existing booking.";
      default: return "This slot can't be used.";
    }
  };

  // For "Send link now", the backend allows sub-1h scheduling. We only block clearly invalid (past) times.
  const submitDisabled = (() => {
    if (propose.isPending || sendLink.isPending) return true;
    if (!clientEmail || !date || !time) return true;
    if (!scheduledAtIso) return true;
    if (new Date(scheduledAtIso) <= new Date()) return true;
    if (slotCheck.status === "checking") return true;
    // For "propose" we strictly require slotCheck.ok; for "link" we allow proceeding (sub-1h is fine).
    if (mode === "propose" && slotCheck.status === "bad") return true;
    return false;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !scheduledAtIso) {
      toast({
        title: "Missing information",
        description: "Please provide client email, date and time.",
        variant: "destructive",
      });
      return;
    }
    if (new Date(scheduledAtIso) <= new Date()) {
      toast({
        title: "Invalid date",
        description: "The session must be scheduled in the future.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (mode === "propose") {
        await propose.mutateAsync({
          client_email: clientEmail.trim().toLowerCase(),
          client_name: clientName.trim() || undefined,
          scheduled_at: scheduledAtIso,
          duration_minutes: parseInt(duration, 10),
          session_type: type,
          notes: notes.trim() || undefined,
        });
        toast({
          title: "Invitation sent",
          description: "Your client will receive an email with the proposed time.",
        });
        onOpenChange(false);
      } else {
        const res = await sendLink.mutateAsync({
          client_email: clientEmail.trim().toLowerCase(),
          client_name: clientName.trim() || undefined,
          scheduled_at: scheduledAtIso,
          duration_minutes: parseInt(duration, 10),
          notes: notes.trim() || undefined,
        });
        setLastSent({
          join_url: res.join_url,
          whatsapp_deeplink: res.whatsapp_deeplink,
          ics_data_url: res.ics_data_url,
        });
        toast({
          title: "Meeting link sent",
          description: `Sent to ${clientEmail}. The session is confirmed.`,
        });
      }
    } catch (err: any) {
      toast({
        title: mode === "propose" ? "Could not send proposal" : "Could not send meeting link",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyLink = () => {
    if (!lastSent?.join_url) return;
    navigator.clipboard?.writeText(lastSent.join_url);
    toast({ title: "Link copied", description: "Paste it anywhere." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            New session
          </DialogTitle>
          <DialogDescription>
            Set the time, then choose whether to send a confirmed link now or propose the time for the client to accept.
          </DialogDescription>
        </DialogHeader>

        {lastSent ? (
          /* Success panel — replaces the form once the link is sent */
          <div className="space-y-4 mt-2">
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-700 dark:text-green-400">Meeting link sent</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We emailed it to {clientEmail}. You can also share through other channels:
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-3 text-xs flex items-center gap-2 break-all bg-muted/30">
              <span className="flex-1 font-mono">{lastSent.join_url}</span>
              <Button type="button" size="sm" variant="outline" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={lastSent.join_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open room
                </a>
              </Button>
              {lastSent.whatsapp_deeplink && (
                <Button asChild size="sm" variant="outline">
                  <a href={lastSent.whatsapp_deeplink} target="_blank" rel="noreferrer">
                    Send via WhatsApp
                  </a>
                </Button>
              )}
              {lastSent.ics_data_url && (
                <Button asChild size="sm" variant="outline">
                  <a href={lastSent.ics_data_url} download="session.ics">
                    Add to calendar
                  </a>
                </Button>
              )}
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client-email">Client email *</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-name">Client name</Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>When *</Label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => fillRelative(1)}>Now</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => fillRelative(15)}>+15 min</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => fillRelative(60)}>+1 hour</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => fillRelative(60 * 24)}>Tomorrow</Button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Input
                  type="date"
                  value={date}
                  min={minDate}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="50">50 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Session type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)} disabled={mode === "link"}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video call</SelectItem>
                    <SelectItem value="in_person">In person</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
                {mode === "link" && (
                  <p className="text-[10px] text-muted-foreground">"Send link now" always creates a video session.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Note for client (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Follow-up on last week's exercise…"
                rows={2}
                maxLength={500}
              />
            </div>

            {/* Mode selector */}
            <div className="rounded-lg border p-3 space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Delivery</Label>
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as Mode)} className="space-y-1.5">
                <label htmlFor="mode-link" className="flex items-start gap-3 cursor-pointer text-sm">
                  <RadioGroupItem value="link" id="mode-link" className="mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Send confirmed meeting link now</p>
                    <p className="text-xs text-muted-foreground">Creates the session and emails the join link immediately. No client confirmation needed.</p>
                  </div>
                </label>
                <label htmlFor="mode-propose" className="flex items-start gap-3 cursor-pointer text-sm">
                  <RadioGroupItem value="propose" id="mode-propose" className="mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Propose time (client must accept)</p>
                    <p className="text-xs text-muted-foreground">Sends an Accept / Decline link. Expires in 72h. Must be ≥ 1h in the future.</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Slot status — single source of truth */}
            {slotCheck.status !== "idle" && (
              <div
                className={
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs " +
                  (slotCheck.status === "ok"
                    ? "border-green-500/30 bg-green-500/10 text-green-600"
                    : slotCheck.status === "checking"
                    ? "border-border bg-muted/40 text-muted-foreground"
                    : "border-destructive/30 bg-destructive/10 text-destructive")
                }
              >
                {slotCheck.status === "ok" && <CheckCircle2 className="h-3.5 w-3.5" />}
                {slotCheck.status === "checking" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {slotCheck.status === "bad" && <AlertTriangle className="h-3.5 w-3.5" />}
                <span>
                  {slotCheck.status === "ok" && "Slot is available ✓"}
                  {slotCheck.status === "checking" && "Checking availability…"}
                  {slotCheck.status === "bad" && (
                    mode === "link"
                      ? `${reasonMessage(slotCheck.reason)} (you can still send the link)`
                      : reasonMessage(slotCheck.reason)
                  )}
                </span>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">
              Conformément à la loi 09-08, les données personnelles sont protégées.
            </p>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={propose.isPending || sendLink.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitDisabled}>
                {(propose.isPending || sendLink.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "link" ? "Send meeting link" : "Send invitation"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProposeSessionModal;
