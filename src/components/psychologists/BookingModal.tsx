import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useScrollResetOnOpen } from "@/hooks/useScrollResetOnOpen";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  Globe,
  MapPin,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Video,
  Building2,
  Loader2,
} from "lucide-react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { Link } from "@/lib/router-compat";
import DataPrivacyNotice from "@/components/DataPrivacyNotice";
import { SignInPrompt } from "@/components/auth/SocialAuthButtons";

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  psychologistId: string;
  psychologistName: string;
  hourlyRate?: number | null;
  offersOnline?: boolean;
  offersInPerson?: boolean;
  city?: string | null;
  depositPercentage?: number | null;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type BookingStep = "type" | "date" | "time" | "confirm" | "success";

const BookingModal = ({
  open,
  onClose,
  psychologistId,
  psychologistName,
  hourlyRate,
  offersOnline,
  offersInPerson,
  city,
  depositPercentage,
}: BookingModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLocale();
  const [step, setStep] = useState<BookingStep>("type");
  const scrollRef = useScrollResetOnOpen<HTMLDivElement>(open, [step]);
  const [sessionType, setSessionType] = useState<"online" | "in_person">(
    offersOnline ? "online" : "in_person"
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchSlots = async () => {
      setSlotsLoading(true);
      const { data } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("psychologist_id", psychologistId)
        .eq("is_available", true);
      setSlots(data || []);
      setSlotsLoading(false);
    };
    fetchSlots();
  }, [open, psychologistId]);

  useEffect(() => {
    if (!open) {
      setStep("type");
      setSelectedDate(null);
      setSelectedSlot(null);
      setNotes("");
    }
  }, [open]);

  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    const availableDows = new Set(slots.map((s) => s.day_of_week));
    for (let i = 1; i <= 21 && dates.length < 14; i++) {
      const d = addDays(today, i);
      if (availableDows.has(d.getDay())) dates.push(d);
    }
    return dates;
  }, [slots]);

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dow = selectedDate.getDay();
    return slots
      .filter((s) => s.day_of_week === dow)
      .map((s) => ({ start: s.start_time, end: s.end_time }))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [selectedDate, slots]);

  const handleBook = async () => {
    if (!user) {
      toast({ title: t('booking.signInRequired'), description: t('booking.signInRequiredDesc'), variant: "destructive" });
      return;
    }
    if (!selectedDate || !selectedSlot) return;

    setLoading(true);
    try {
      const [hours, minutes] = selectedSlot.start.split(":").map(Number);
      const dateTime = new Date(selectedDate);
      dateTime.setHours(hours, minutes, 0, 0);

      // Step 1: create booking + pending deposit transaction (mock provider)
      const createRes = await supabase.functions.invoke("create-booking-payment", {
        body: {
          psychologistId,
          scheduledAt: dateTime.toISOString(),
          durationMinutes: 50,
          sessionType,
          patientNotes: notes || undefined,
        },
      });
      if (createRes.error) throw new Error(createRes.error.message);
      const { transactionId, breakdown } = createRes.data as { transactionId: string; breakdown: any };

      // Step 2: simulate the payment webhook (mock — would be real PSP callback in prod)
      const webhookRes = await supabase.functions.invoke("simulate-payment-webhook", {
        body: { transactionId, outcome: "succeeded" },
      });
      if (webhookRes.error) throw new Error(webhookRes.error.message);

      toast({
        title: "Deposit paid (mock)",
        description: `${breakdown.deposit_amount_mad} MAD captured · Balance ${breakdown.balance_amount_mad} MAD due after session`,
      });
      setStep("success");
    } catch (err: any) {
      console.error(err);
      toast({ title: t('booking.bookingFailed'), description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderSessionType = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">{t('booking.howAttend')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {offersOnline && (
          <button
            onClick={() => setSessionType("online")}
            className={`p-5 rounded-2xl text-left transition-all ${sessionType === "online" ? "ring-2 ring-primary bg-primary/10" : ""}`}
            style={sessionType !== "online" ? { background: "var(--glass-bg)", border: "var(--glass-border)" } : {}}
          >
            <Video className={`w-6 h-6 mb-2 ${sessionType === "online" ? "text-primary" : "text-muted-foreground"}`} />
            <p className="font-medium text-foreground">{t('booking.onlineOption')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('booking.onlineDesc')}</p>
          </button>
        )}
        {offersInPerson && (
          <button
            onClick={() => setSessionType("in_person")}
            className={`p-5 rounded-2xl text-left transition-all ${sessionType === "in_person" ? "ring-2 ring-primary bg-primary/10" : ""}`}
            style={sessionType !== "in_person" ? { background: "var(--glass-bg)", border: "var(--glass-border)" } : {}}
          >
            <Building2 className={`w-6 h-6 mb-2 ${sessionType === "in_person" ? "text-primary" : "text-muted-foreground"}`} />
            <p className="font-medium text-foreground">{t('booking.inPersonOption')}</p>
            <p className="text-xs text-muted-foreground mt-1">{city || t('booking.atOffice')}</p>
          </button>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <Button variant="primary" onClick={() => setStep("date")}>
          {t('booking.continue')} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderDatePicker = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">{t('booking.selectDateDesc')}</p>
      {slotsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : availableDates.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">{t('booking.noAvailableDates')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('booking.contactAlternative')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableDates.map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-xl text-center transition-all ${isSelected ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/40"}`}
                style={!isSelected ? { background: "var(--glass-bg)", border: "var(--glass-border)" } : {}}
              >
                <p className={`text-xs font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>{DAY_NAMES[date.getDay()]}</p>
                <p className={`text-lg font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>{format(date, "d")}</p>
                <p className={`text-[10px] ${isSelected ? "text-primary" : "text-muted-foreground"}`}>{format(date, "MMM")}</p>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={() => setStep("type")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('booking.back')}
        </Button>
        <Button variant="primary" onClick={() => setStep("time")} disabled={!selectedDate}>
          {t('booking.continue')} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderTimePicker = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        {selectedDate && `${t('booking.availableTimesFor')} ${format(selectedDate, "EEEE, MMMM d")}`}
      </p>
      {timeSlots.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">{t('booking.noTimeSlots')}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {timeSlots.map((slot) => {
            const isSelected = selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;
            return (
              <button
                key={slot.start}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 rounded-xl text-center transition-all ${isSelected ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/40"}`}
                style={!isSelected ? { background: "var(--glass-bg)", border: "var(--glass-border)" } : {}}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>{slot.start.slice(0, 5)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={() => setStep("date")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('booking.back')}
        </Button>
        <Button variant="primary" onClick={() => setStep("confirm")} disabled={!selectedSlot}>
          {t('booking.continue')} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderConfirm = () => (
    <div className="space-y-5">
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-semibold text-foreground">{t('booking.bookingSummary')}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('booking.psychologist')}</span>
            <span className="text-foreground font-medium">{psychologistName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('booking.type')}</span>
            <Badge variant="outline" className="text-xs">
              {sessionType === "online" ? (
                <><Globe className="mr-1 h-3 w-3" /> {t('booking.onlineOption')}</>
              ) : (
                <><MapPin className="mr-1 h-3 w-3" /> {t('booking.inPersonOption')}</>
              )}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('booking.date')}</span>
            <span className="text-foreground font-medium">{selectedDate && format(selectedDate, "EEE, MMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('booking.time')}</span>
            <span className="text-foreground font-medium">{selectedSlot?.start.slice(0, 5)} – {selectedSlot?.end.slice(0, 5)}</span>
          </div>
          {hourlyRate && (
            <div className="flex justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-muted-foreground">{t('booking.sessionFee')}</span>
              <span className="text-primary font-bold text-lg">{hourlyRate} MAD</span>
            </div>
          )}
          {hourlyRate && typeof depositPercentage === "number" && depositPercentage > 0 && depositPercentage < 100 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit due now ({depositPercentage}%)</span>
                <span className="text-foreground font-semibold">{Math.round(hourlyRate * depositPercentage / 100)} MAD</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Balance after session</span>
                <span className="text-muted-foreground">{Math.round(hourlyRate * (1 - depositPercentage / 100))} MAD</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1.5">{t('booking.notesLabel')}</label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('booking.notesPlaceholder')} rows={3} maxLength={500} />
      </div>

      {!user && <SignInPrompt message={t('booking.signInToBook')} />}

      <DataPrivacyNotice />

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={() => setStep("time")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('booking.back')}
        </Button>
        <Button variant="primary" onClick={handleBook} disabled={loading || !user}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('booking.confirming')}</>
          ) : (
            t('booking.confirmBookingBtn')
          )}
        </Button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-5 py-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
        style={{ background: "rgba(255,179,0,0.1)", border: "2px solid rgba(255,179,0,0.3)" }}
      >
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-h3 mb-1">{t('booking.sessionBooked')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('booking.sessionConfirmedWith').replace('{name}', psychologistName)}
        </p>
      </div>
      <div className="glass-card p-4 text-sm space-y-1.5">
        <p className="text-foreground font-medium">{selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
        <p className="text-muted-foreground">
          {selectedSlot?.start.slice(0, 5)} – {selectedSlot?.end.slice(0, 5)} ·{" "}
          {sessionType === "online" ? t('booking.onlineOption') : t('booking.inPersonOption')}
        </p>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <Button variant="primary" asChild>
          <Link to="/dashboard">{t('dashboard.goToDashboard')}</Link>
        </Button>
        <Button variant="ghost" onClick={onClose}>{t('booking.close')}</Button>
      </div>
    </div>
  );

  const stepTitles: Record<BookingStep, string> = {
    type: t('booking.chooseType'),
    date: t('booking.selectDate'),
    time: t('booking.selectTime'),
    confirm: t('booking.confirmBooking'),
    success: t('booking.bookingConfirmed'),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent ref={scrollRef} className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{stepTitles[step]}</DialogTitle>
          <DialogDescription>
            {step !== "success"
              ? `${t('psychologists.book')} — ${psychologistName}`
              : t('booking.bookingConfirmed')}
          </DialogDescription>
        </DialogHeader>
        {step === "type" && renderSessionType()}
        {step === "date" && renderDatePicker()}
        {step === "time" && renderTimePicker()}
        {step === "confirm" && renderConfirm()}
        {step === "success" && renderSuccess()}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;