import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { format, addDays, startOfDay, isSameDay, isPast } from "date-fns";
import { fr, ar } from "date-fns/locale";
import { Calendar, Clock, Video, MapPin, Phone, ChevronLeft, ChevronRight, Loader2, CheckCircle, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAvailableSlots, useCreateBooking } from "@/hooks/useBooking";
import { cn } from "@/lib/utils";

interface BookingWidgetProps {
  psychologistId: string;
  psychologistName: string;
  hourlyRate?: number;
  offersOnline?: boolean;
  offersInPerson?: boolean;
}

const SESSION_TYPES = [
  { value: "video", label: "Video call", icon: Video },
  { value: "in_person", label: "In person", icon: MapPin },
  { value: "phone", label: "Phone call", icon: Phone },
] as const;

type SessionType = "video" | "in_person" | "phone";

const PENDING_KEY = "upsy.pendingBooking";

type PendingBooking = {
  psychologistId: string;
  scheduled_at: string;
  session_type: SessionType;
  notes: string;
  amount_mad?: number;
  return_path: string;
};

export const BookingWidget = ({
  psychologistId,
  psychologistName,
  hourlyRate,
  offersOnline = true,
  offersInPerson = false,
}: BookingWidgetProps) => {
  const { locale } = useLocale();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const dateLocale = locale === "fr" ? fr : locale === "ar" ? ar : undefined;

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<SessionType>("video");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"date" | "slot" | "confirm" | "success">("date");

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfDay(new Date()), weekOffset * 7 + i)
  );

  const { data: slots = [], isLoading: slotsLoading } = useAvailableSlots(
    psychologistId,
    selectedDate
  );
  const createBooking = useCreateBooking();

  const availableSlots = slots.filter((s) => s.is_available);

  // Resume a pending booking after sign-in/sign-up
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!user || resumedRef.current) return;
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (!raw) return;
      const pending: PendingBooking = JSON.parse(raw);
      if (pending.psychologistId !== psychologistId) return;
      resumedRef.current = true;
      sessionStorage.removeItem(PENDING_KEY);
      setSelectedDate(new Date(pending.scheduled_at));
      setSelectedSlot(pending.scheduled_at);
      setSessionType(pending.session_type);
      setNotes(pending.notes || "");
      setStep("confirm");
      (async () => {
        try {
          await createBooking.mutateAsync({
            psychologist_id: psychologistId,
            scheduled_at: pending.scheduled_at,
            session_type: pending.session_type,
            duration_minutes: 50,
            patient_notes: pending.notes || undefined,
            amount_mad: pending.amount_mad,
          });
          setStep("success");
          toast({
            title: "Slot reserved",
            description: "We saved the time you picked before you signed in.",
          });
        } catch (err) {
          toast({
            title: "Couldn't finalize your slot",
            description: err instanceof Error ? err.message : "Please pick a time again.",
            variant: "destructive",
          });
          setStep("confirm");
        }
      })();
    } catch {
      /* ignore corrupted state */
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, psychologistId]);

  const handleDateSelect = (date: Date) => {
    if (isPast(date) && !isSameDay(date, new Date())) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep("slot");
  };

  const handleSlotSelect = (slotStart: string) => {
    setSelectedSlot(slotStart);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;

    // Slot-before-signup: stash intent, send to auth, resume on return.
    if (!user) {
      const pending: PendingBooking = {
        psychologistId,
        scheduled_at: selectedSlot,
        session_type: sessionType,
        notes,
        amount_mad: hourlyRate ?? undefined,
        return_path: `${window.location.pathname}#booking`,
      };
      try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
      } catch {
        /* ignore quota */
      }
      toast({
        title: "Slot held for you",
        description: "Create your account to confirm. Your time won't be given away.",
      });
      navigate(`/auth?redirect=${encodeURIComponent(pending.return_path)}`);
      return;
    }

    try {
      await createBooking.mutateAsync({
        psychologist_id: psychologistId,
        scheduled_at: selectedSlot,
        session_type: sessionType,
        duration_minutes: 50,
        patient_notes: notes || undefined,
        amount_mad: hourlyRate ?? undefined,
      });
      setStep("success");
    } catch (err) {
      toast({
        title: "Booking failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Session requested</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {psychologistName} will confirm your session on{" "}
            {selectedDate && format(selectedDate, "EEEE d MMMM", { locale: dateLocale })} at{" "}
            {selectedSlot && format(new Date(selectedSlot), "HH:mm")}.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          You'll receive a confirmation email once the psychologist accepts.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStep("date");
            setSelectedDate(null);
            setSelectedSlot(null);
            setNotes("");
          }}
        >
          Book another session
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {format(weekDays[0], "MMM d", { locale: dateLocale })} –{" "}
          {format(weekDays[6], "MMM d, yyyy", { locale: dateLocale })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWeekOffset((w) => w + 1)}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => {
          const past = isPast(day) && !isSameDay(day, new Date());
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateSelect(day)}
              disabled={past}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-2 text-center transition-all",
                "hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed",
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary"
                  : "text-foreground"
              )}
            >
              <span className="text-[10px] uppercase tracking-wide opacity-60">
                {format(day, "EEE", { locale: dateLocale }).slice(0, 2)}
              </span>
              <span className="text-sm font-semibold">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {step !== "date" && selectedDate && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {format(selectedDate, "EEEE, MMMM d", { locale: dateLocale })}
            </span>
          </div>

          {slotsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No available slots on this day. Try another date.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => {
                const time = format(new Date(slot.slot_start), "HH:mm");
                const isSelectedSlot = selectedSlot === slot.slot_start;
                return (
                  <button
                    key={slot.slot_start}
                    onClick={() => handleSlotSelect(slot.slot_start)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all",
                      isSelectedSlot
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation step */}
      {step === "confirm" && selectedSlot && (
        <div className="space-y-4 border border-border rounded-xl p-4 bg-background">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Session type
            </p>
            <div className="flex gap-2 flex-wrap">
              {SESSION_TYPES.filter(
                (t) => t.value !== "in_person" || offersInPerson
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSessionType(value as SessionType)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all",
                    sessionType === value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm space-y-1.5 text-muted-foreground font-sans">
            <p><span className="text-foreground font-medium">With:</span> <span className="font-display">{psychologistName}</span></p>
            <p>
              <span className="text-foreground font-medium">When:</span>{" "}
              <span className="font-mono tabular-nums text-foreground/90">
                {format(new Date(selectedSlot), "EEEE d MMMM 'at' HH:mm", { locale: dateLocale })}
              </span>
            </p>
            <p><span className="text-foreground font-medium">Duration:</span> <span className="font-mono tabular-nums">50</span> minutes</p>
            {hourlyRate && (
              <p><span className="text-foreground font-medium">Fee:</span> <span className="font-mono tabular-nums text-foreground">{Math.round((hourlyRate * 50 / 60) * 100) / 100}</span> MAD</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Notes for the psychologist (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief description of what you'd like to work on..."
              rows={3}
              className="bg-surface text-sm resize-none"
            />
          </div>

          {!user && (
            <div className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
              <span>
                Pick your time now — we'll hold it while you create your account.
                Free rebook if it's not the right fit.
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setStep("slot")} className="flex-1">
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              disabled={createBooking.isPending}
              className="flex-1"
            >
              {createBooking.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : user ? (
                "Confirm booking"
              ) : (
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Continue to book
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingWidget;
