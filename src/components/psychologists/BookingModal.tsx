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
  CheckCircle2,
  Video,
  Building2,
  Loader2,
  Mail,
  MessageSquarePlus,
} from "lucide-react";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { ar, fr } from "date-fns/locale";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { hasAnyOAuth } from "@/config/auth";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAvailableSlots, useCreateBooking } from "@/hooks/useBooking";
import DataPrivacyNotice from "@/components/DataPrivacyNotice";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { addLocalePrefix } from "@/lib/i18n/utils";
import {
  clearPendingBooking,
  loadPendingBooking,
  savePendingBooking,
} from "@/lib/booking/pendingBooking";
import {
  FUNNELS,
  trackFunnelStep,
  trackFunnelCompleted,
  trackFunnelFailed,
  resetFunnel,
  priceBucket,
} from "@/lib/analytics/funnel";

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
  officeAddress?: string | null;
  depositPercentage?: number | null;
}

// Two screens: pick a slot (type, day and time together), then confirm.
type BookingStep = "slot" | "confirm" | "success";

// Choices an anonymous visitor made before being sent to sign up; restored
// when they come back to this profile signed in (?book=1 reopens the modal).
const PENDING_KEY = "upsy.pendingBookingModal";

type PendingModalBooking = {
  psychologistId: string;
  sessionType: "online" | "in_person";
  date: string;
  slot: { start: string; end: string; at: string; duration: number };
  notes: string;
  address: string;
};

const BookingModal = ({
  open,
  onClose,
  psychologistId,
  psychologistName,
  hourlyRate,
  offersOnline,
  offersInPerson,
  city,
  officeAddress,
  depositPercentage,
}: BookingModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [step, setStep] = useState<BookingStep>("slot");
  const dfLocale = locale === "fr" ? fr : locale === "ar" ? ar : undefined;
  const fmt = (d: Date, pattern: string) =>
    format(d, pattern, { locale: dfLocale });
  const [showNotes, setShowNotes] = useState(false);
  const scrollRef = useScrollResetOnOpen<HTMLDivElement>(open, [step]);
  const [sessionType, setSessionType] = useState<"online" | "in_person">(
    offersOnline ? "online" : "in_person",
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string;
    end: string;
    at: string;
    duration: number;
  } | null>(null);
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [addressCoords, setAddressCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
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
      setStep("slot");
      setSelectedDate(null);
      setSelectedSlot(null);
      setNotes("");
      // A visitor who closes the modal and opens it again is a second attempt,
      // and the second attempt is the interesting one: it is the same person
      // getting past whatever stopped them. Without this reset the retry
      // records no steps at all.
      resetFunnel(FUNNELS.booking);
    }
  }, [open]);

  // Resume a choice saved before sign-up: pre-fill and land on the summary so
  // the visitor only has to press "Send request".
  useEffect(() => {
    if (!open || !user) return;
    const pending = loadPendingBooking<PendingModalBooking>(PENDING_KEY);
    if (!pending || pending.psychologistId !== psychologistId) return;
    clearPendingBooking(PENDING_KEY);
    setSessionType(pending.sessionType);
    setSelectedDate(new Date(pending.date));
    setSelectedSlot(pending.slot);
    setNotes(pending.notes || "");
    setAddress(pending.address || "");
    setStep("confirm");
  }, [open, user, psychologistId]);

  // The step union is exactly the declared funnel, so one effect covers every
  // path through the modal — including the back buttons, which a per-click
  // call site would miss.
  useEffect(() => {
    if (!open) return;
    trackFunnelStep(FUNNELS.booking, step, {
      session_type: sessionType,
      is_authenticated: !!user,
      price_bucket: priceBucket(hourlyRate),
    });
  }, [open, step, sessionType, user, hourlyRate]);

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

  // Open on the first bookable day so times show without an extra tap.
  useEffect(() => {
    if (open && !selectedDate && availableDates.length)
      setSelectedDate(availableDates[0]);
  }, [open, selectedDate, availableDates]);

  // Real, still-free slots for the chosen day (get_open_slots).
  const { data: openSlots = [], isLoading: timesLoading } = useAvailableSlots(
    psychologistId,
    selectedDate,
  );
  const createBooking = useCreateBooking();
  const timeSlots = useMemo(
    () =>
      openSlots.map((s) => {
        const startAt = new Date(s.slot_start);
        const endAt = new Date(startAt.getTime() + s.duration_minutes * 60_000);
        return {
          start: format(startAt, "HH:mm"),
          end: format(endAt, "HH:mm"),
          at: s.slot_start,
          duration: s.duration_minutes,
        };
      }),
    [openSlots],
  );

  // Keep the choice (localStorage, 24h) and come back to it after sign-up
  // or Google sign-in instead of starting over.
  const savePending = () => {
    if (selectedDate && selectedSlot)
      savePendingBooking<PendingModalBooking>(PENDING_KEY, {
        psychologistId,
        sessionType,
        date: selectedDate.toISOString(),
        slot: selectedSlot,
        notes,
        address,
      });
  };
  const returnPath = () => `${window.location.pathname}?book=1`;

  const handleBook = async () => {
    if (!user) {
      // The single most actionable drop-off in the flow: someone who chose a
      // psychologist, a date and a time, then hit a wall. Counting it tells us
      // what an earlier sign-in prompt would be worth.
      trackFunnelFailed(FUNNELS.booking, "not_authenticated", {
        session_type: sessionType,
        price_bucket: priceBucket(hourlyRate),
      });
      savePending();
      navigate(
        `${addLocalePrefix("/auth", locale)}?mode=signup&redirect=${encodeURIComponent(returnPath())}`,
      );
      return;
    }
    if (!selectedDate || !selectedSlot) return;

    setLoading(true);
    try {
      // Pay at the session: this records a request the specialist confirms.
      await createBooking.mutateAsync({
        psychologist_id: psychologistId,
        scheduled_at: selectedSlot.at,
        duration_minutes: selectedSlot.duration,
        session_type: sessionType === "online" ? "video" : "in_person",
        patient_notes: notes || undefined,
        patient_address:
          sessionType === "in_person" && address ? address : undefined,
        patient_lat:
          sessionType === "in_person"
            ? (addressCoords.lat ?? undefined)
            : undefined,
        patient_lng:
          sessionType === "in_person"
            ? (addressCoords.lng ?? undefined)
            : undefined,
      });
      toast({
        title: t("booking.requestSent"),
        description: t("booking.requestSentDesc"),
      });
      trackFunnelCompleted(FUNNELS.booking, {
        session_type: sessionType,
        is_authenticated: true,
        price_bucket: priceBucket(hourlyRate),
      });
      setStep("success");
    } catch (err: any) {
      console.error(err);
      trackFunnelFailed(FUNNELS.booking, "request_failed", {
        session_type: sessionType,
        price_bucket: priceBucket(hourlyRate),
      });
      toast({
        title: t("booking.bookingFailed"),
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSlot = () => (
    <div className="space-y-5">
      {offersOnline && offersInPerson && (
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["online", Video, t("booking.onlineOption")],
              ["in_person", Building2, city || t("booking.inPersonOption")],
            ] as const
          ).map(([value, Icon, label]) => {
            const on = sessionType === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={on}
                onClick={() => setSessionType(value)}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-xl p-3 text-sm font-medium transition-all ${on ? "ring-2 ring-primary bg-primary/10 text-primary" : "bg-muted/40 text-foreground hover:bg-muted"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {slotsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : availableDates.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            {t("booking.noAvailableDates")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("booking.contactAlternative")}
          </p>
        </div>
      ) : (
        <>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {availableDates.map((date) => {
              const on = !!selectedDate && isSameDay(date, selectedDate);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  className={`shrink-0 rounded-xl px-3 py-2 text-center transition-all ${on ? "ring-2 ring-primary bg-primary/10 text-primary" : "bg-muted/40 text-foreground hover:bg-muted"}`}
                >
                  <span className="block text-[11px] font-medium capitalize opacity-80">
                    {fmt(date, "EEE")}
                  </span>
                  <span className="block text-lg font-bold leading-tight">
                    {fmt(date, "d")}
                  </span>
                  <span className="block text-[10px] capitalize opacity-80">
                    {fmt(date, "MMM")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground first-letter:uppercase">
              {selectedDate && fmt(selectedDate, "EEEE d MMMM")}
            </p>
            {timesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : timeSlots.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t("booking.noTimeSlots")}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.at}
                    type="button"
                    onClick={() => {
                      setSelectedSlot(slot);
                      setStep("confirm");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-muted/40 p-3 text-sm font-medium text-foreground transition-all hover:bg-primary/10 hover:text-primary"
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {slot.start.slice(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderConfirm = () => (
    <div className="space-y-5">
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-semibold text-foreground">
          {t("booking.bookingSummary")}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("booking.psychologist")}
            </span>
            <span className="text-foreground font-medium">
              {psychologistName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("booking.type")}</span>
            <Badge variant="outline" className="text-xs">
              {sessionType === "online" ? (
                <>
                  <Globe className="mr-1 h-3 w-3" /> {t("booking.onlineOption")}
                </>
              ) : (
                <>
                  <MapPin className="mr-1 h-3 w-3" />{" "}
                  {t("booking.inPersonOption")}
                </>
              )}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("booking.date")}</span>
            <span className="text-foreground font-medium">
              {selectedDate && fmt(selectedDate, "EEE d MMM yyyy")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("booking.time")}</span>
            <span className="text-foreground font-medium">
              {selectedSlot?.start.slice(0, 5)} –{" "}
              {selectedSlot?.end.slice(0, 5)}
            </span>
          </div>
          {hourlyRate && (
            <div
              className="flex justify-between pt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-muted-foreground">
                {t("booking.sessionFee")}
              </span>
              <span className="text-primary font-bold text-lg">
                {/* What is charged: the hourly rate prorated to the session,
                    as bookings_patient_insert_guard computes it. */}
                {Math.round((hourlyRate * (selectedSlot?.duration ?? 60)) / 60)}{" "}
                MAD
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {t("booking.payAtSession")}
          </p>
        </div>
      </div>

      {sessionType === "in_person" && (officeAddress || city) && (
        <div className="glass-card p-4 flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("profile.location")}
            </p>
            <p className="text-xs text-muted-foreground">
              {officeAddress || city}
            </p>
          </div>
        </div>
      )}

      {sessionType === "in_person" && (
        <div>
          <label className="text-sm text-muted-foreground block mb-1.5">
            {t("booking.yourAddressLabel")}
          </label>
          <AddressAutocomplete
            value={address}
            onChange={setAddress}
            onSelect={({ address: a, lat, lng }) => {
              setAddress(a);
              setAddressCoords({ lat, lng });
            }}
            placeholder={t("booking.yourAddressPlaceholder")}
          />
        </div>
      )}

      {showNotes || notes ? (
        <div>
          <label className="text-sm text-muted-foreground block mb-1.5">
            {t("booking.notesLabel")}
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("booking.notesPlaceholder")}
            rows={3}
            maxLength={500}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className="flex items-center gap-2 text-sm text-primary"
        >
          <MessageSquarePlus className="h-4 w-4" />
          {t("booking.addNote")}
        </button>
      )}

      {/* Actions stack full-width: long labels never run off a phone screen. */}
      <div className="space-y-2 pt-1">
        {user ? (
          <Button
            variant="primary"
            className="w-full"
            onClick={handleBook}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {t("booking.confirming")}
              </>
            ) : (
              t("booking.sendRequest")
            )}
          </Button>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground">
              {t("booking.signupToFinishNotice")}
            </p>
            {hasAnyOAuth() && (
              // Google signs in without a confirmation email; save the
              // choice first so the summary is waiting on the way back.
              <div onClickCapture={savePending}>
                <SocialAuthButtons redirect={returnPath()} />
              </div>
            )}
            <Button
              variant={hasAnyOAuth() ? "secondary" : "primary"}
              className="w-full"
              onClick={handleBook}
            >
              <Mail className="mr-2 h-4 w-4" />
              {t("booking.continueWithEmail")}
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setStep("slot")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("booking.changeTime")}
        </Button>
      </div>

      <DataPrivacyNotice />
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-5 py-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
        style={{
          background: "rgba(255,179,0,0.1)",
          border: "2px solid rgba(255,179,0,0.3)",
        }}
      >
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-h3 mb-1">{t("booking.requestSent")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("booking.requestSentWith").replace("{name}", psychologistName)}
        </p>
      </div>
      <div className="glass-card p-4 text-sm space-y-1.5">
        <p className="text-foreground font-medium">
          {selectedDate && fmt(selectedDate, "EEEE d MMMM yyyy")}
        </p>
        <p className="text-muted-foreground">
          {selectedSlot?.start.slice(0, 5)} – {selectedSlot?.end.slice(0, 5)} ·{" "}
          {sessionType === "online"
            ? t("booking.onlineOption")
            : t("booking.inPersonOption")}
        </p>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <Button variant="primary" asChild>
          <Link to="/dashboard">{t("dashboard.goToDashboard")}</Link>
        </Button>
        <Button variant="ghost" onClick={onClose}>
          {t("booking.close")}
        </Button>
      </div>
    </div>
  );

  const stepTitles: Record<BookingStep, string> = {
    slot: t("booking.chooseSlot"),
    confirm: t("booking.confirmBooking"),
    success: t("booking.requestSent"),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        ref={scrollRef}
        className="max-w-md max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{stepTitles[step]}</DialogTitle>
          <DialogDescription>
            {step !== "success"
              ? `${t("psychologists.book")} — ${psychologistName}`
              : psychologistName}
          </DialogDescription>
        </DialogHeader>
        {step === "slot" && renderSlot()}
        {step === "confirm" && renderConfirm()}
        {step === "success" && renderSuccess()}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
