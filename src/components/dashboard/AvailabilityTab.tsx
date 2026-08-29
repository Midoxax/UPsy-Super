import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Calendar,
  Plus,
  Trash2,
  Save,
  Clock,
  Copy,
  Eye,
  Settings2,
  X,
  AlertCircle,
} from "lucide-react";
import { usePsychologistSlots, usePsychologistBookings } from "@/hooks/useBooking";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-500/15 text-amber-600 border-amber-500/30",
  confirmed: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  completed: "bg-green-500/15 text-green-600 border-green-500/30",
  cancelled: "bg-red-500/15 text-red-500 border-red-500/30",
  no_show:   "bg-gray-500/15 text-gray-500 border-gray-500/30",
  proposed:  "bg-purple-500/15 text-purple-600 border-purple-500/30",
};

type Range = { start: string; end: string };
type WeekMap = Record<number, Range[]>;

const emptyWeek = (): WeekMap => ({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });

const toHHMM = (t: string) => t.slice(0, 5);

function rangesOverlap(a: Range, b: Range) {
  return a.start < b.end && b.start < a.end;
}

function dayHasInvalidRange(ranges: Range[]): boolean {
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    if (!r.start || !r.end || r.end <= r.start) return true;
    for (let j = i + 1; j < ranges.length; j++) {
      if (rangesOverlap(r, ranges[j])) return true;
    }
  }
  return false;
}

export const AvailabilityTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: slots = [], isLoading: slotsLoading } = usePsychologistSlots();
  const { data: bookings = [], isLoading: bookingsLoading } = usePsychologistBookings();

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.scheduled_at) >= new Date() && b.status !== "cancelled"
  );

  // Local draft ranges, initialised from the DB
  const [draft, setDraft] = useState<WeekMap>(emptyWeek());
  const [dirty, setDirty] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [view, setView] = useState<"template" | "preview">("template");

  useEffect(() => {
    const next = emptyWeek();
    for (const s of slots) {
      next[s.day_of_week] = [
        ...next[s.day_of_week],
        { start: toHHMM(s.start_time), end: toHHMM(s.end_time) },
      ];
    }
    for (const k of Object.keys(next)) {
      next[Number(k)].sort((a, b) => a.start.localeCompare(b.start));
    }
    setDraft(next);
    setDirty({});
  }, [slots]);

  const markDirty = (day: number) => setDirty((d) => ({ ...d, [day]: true }));

  const updateRange = (day: number, idx: number, patch: Partial<Range>) => {
    setDraft((d) => ({
      ...d,
      [day]: d[day].map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
    markDirty(day);
  };

  const addRange = (day: number) => {
    setDraft((d) => ({
      ...d,
      [day]: [...d[day], { start: "09:00", end: "10:00" }],
    }));
    markDirty(day);
  };

  const removeRange = (day: number, idx: number) => {
    setDraft((d) => ({
      ...d,
      [day]: d[day].filter((_, i) => i !== idx),
    }));
    markDirty(day);
  };

  const copyMondayToWeekdays = () => {
    const monday = draft[1] ?? [];
    setDraft((d) => ({
      ...d,
      2: [...monday],
      3: [...monday],
      4: [...monday],
      5: [...monday],
    }));
    setDirty((dd) => ({ ...dd, 2: true, 3: true, 4: true, 5: true }));
    toast({ title: "Copied Monday to Tue–Fri" });
  };

  const clearWeek = () => {
    setDraft(emptyWeek());
    setDirty({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true });
  };

  const saveDay = async (day: number) => {
    const ranges = draft[day];
    if (dayHasInvalidRange(ranges)) {
      toast({
        title: "Invalid ranges",
        description: "End must be after start and ranges cannot overlap.",
        variant: "destructive",
      });
      return;
    }
    setSaving(day);
    try {
      const { error } = await supabase.rpc("replace_availability_for_day", {
        _day: day,
        _ranges: ranges.map((r) => ({ start: r.start, end: r.end })) as any,
      });
      if (error) throw error;
      setDirty((d) => ({ ...d, [day]: false }));
      queryClient.invalidateQueries({ queryKey: ["psy-slots"] });
      toast({ title: `Saved ${DAYS[day]}` });
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const saveAll = async () => {
    setSavingAll(true);
    try {
      for (let day = 0; day < 7; day++) {
        if (!dirty[day]) continue;
        if (dayHasInvalidRange(draft[day])) {
          throw new Error(`${DAYS[day]}: ranges are invalid`);
        }
        const { error } = await supabase.rpc("replace_availability_for_day", {
          _day: day,
          _ranges: draft[day].map((r) => ({ start: r.start, end: r.end })) as any,
        });
        if (error) throw error;
      }
      setDirty({});
      queryClient.invalidateQueries({ queryKey: ["psy-slots"] });
      toast({ title: "All changes saved" });
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message, variant: "destructive" });
    } finally {
      setSavingAll(false);
    }
  };

  const anyDirty = Object.values(dirty).some(Boolean);
  const invalidDays = useMemo(
    () =>
      Object.fromEntries(
        [0, 1, 2, 3, 4, 5, 6].map((d) => [d, dayHasInvalidRange(draft[d])]),
      ) as Record<number, boolean>,
    [draft],
  );

  return (
    <div className="space-y-6">
      <Card className="bg-surface border-border">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly availability
              </CardTitle>
              <CardDescription>
                Add multiple time ranges per day. Clients can only book inside these windows.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={view === "template" ? "default" : "outline"}
                onClick={() => setView("template")}
              >
                <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                My week
              </Button>
              <Button
                size="sm"
                variant={view === "preview" ? "default" : "outline"}
                onClick={() => setView("preview")}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                What clients see
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {slotsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : view === "template" ? (
            <>
              {slots.length === 0 && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      Set your weekly hours first
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Clients can't book an empty calendar — add at least one time range below,
                      then share your booking link from the Profile tab.
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {DAYS.map((label, day) => {
                  const ranges = draft[day];
                  const invalid = invalidDays[day];
                  return (
                    <div
                      key={day}
                      className="flex items-start gap-4 py-3 border-b border-border/50 last:border-0"
                    >
                      <div className="w-12 text-sm font-medium text-muted-foreground pt-2">
                        {label}
                      </div>
                      <div className="flex-1 flex flex-wrap items-center gap-2">
                        {ranges.length === 0 && (
                          <span className="text-xs text-muted-foreground italic">
                            (no availability)
                          </span>
                        )}
                        {ranges.map((r, idx) => {
                          const bad =
                            !r.start || !r.end || r.end <= r.start ||
                            ranges.some((o, i) => i !== idx && rangesOverlap(r, o));
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm",
                                bad
                                  ? "border-destructive/50 bg-destructive/10"
                                  : "border-primary/20 bg-primary/5",
                              )}
                            >
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <input
                                type="time"
                                value={r.start}
                                onChange={(e) =>
                                  updateRange(day, idx, { start: e.target.value })
                                }
                                className="bg-transparent outline-hidden text-xs w-[70px]"
                              />
                              <span className="text-muted-foreground text-xs">–</span>
                              <input
                                type="time"
                                value={r.end}
                                onChange={(e) =>
                                  updateRange(day, idx, { end: e.target.value })
                                }
                                className="bg-transparent outline-hidden text-xs w-[70px]"
                              />
                              <button
                                type="button"
                                onClick={() => removeRange(day, idx)}
                                className="ml-1 text-muted-foreground hover:text-destructive"
                                aria-label="Remove range"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => addRange(day)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/40 rounded-lg px-3 py-1.5 transition-all"
                        >
                          <Plus className="h-3 w-3" />
                          Add range
                        </button>
                        {dirty[day] && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => saveDay(day)}
                            disabled={saving === day || invalid}
                          >
                            {saving === day ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={copyMondayToWeekdays}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy Mon → Tue–Fri
                </Button>
                <Button size="sm" variant="ghost" onClick={clearWeek}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Clear week
                </Button>
                <div className="flex-1" />
                <Button
                  size="sm"
                  onClick={saveAll}
                  disabled={!anyDirty || savingAll}
                >
                  {savingAll ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Save all changes
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Times are interpreted in <strong>Africa/Casablanca</strong>. Overlapping
                ranges are highlighted in red and cannot be saved.
              </p>
            </>
          ) : (
            <ClientPreview psychologistId={user?.id ?? ""} />
          )}
        </CardContent>
      </Card>

      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Upcoming sessions
            {upcomingBookings.length > 0 && (
              <Badge className="ml-auto bg-primary/10 text-primary border-primary/20">
                {upcomingBookings.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Your confirmed and pending sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No upcoming sessions yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Set your availability above so patients can book with you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background"
                >
                  <div className="w-14 text-center flex-shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(booking.scheduled_at), "EEE")}
                    </p>
                    <p className="text-xl font-bold leading-none">
                      {format(new Date(booking.scheduled_at), "d")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(booking.scheduled_at), "MMM")}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {(booking as any).patient_name ?? "Anonymous patient"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(booking.scheduled_at), "HH:mm")} · {booking.duration_minutes}min · {booking.session_type}
                    </p>
                    {booking.patient_notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                        "{booking.patient_notes}"
                      </p>
                    )}
                  </div>
                  <Badge className={cn("text-xs border flex-shrink-0", STATUS_STYLES[booking.status] || "")}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ── Preview: next 14 days of bookable slots, as clients would see ────────────
function ClientPreview({ psychologistId }: { psychologistId: string }) {
  const [rows, setRows] = useState<
    { date: Date; slots: { slot_start: string; is_available: boolean }[] }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!psychologistId) return;
      setLoading(true);
      const out: typeof rows = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + i);
        const dateStr = format(d, "yyyy-MM-dd");
        const { data } = await supabase.rpc("get_available_slots", {
          p_psychologist_id: psychologistId,
          p_date: dateStr,
        });
        out.push({
          date: d,
          slots: ((data ?? []) as any[]).filter((s) => s.is_available),
        });
      }
      if (!cancelled) {
        setRows(out);
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [psychologistId]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalSlots = rows.reduce((n, r) => n + r.slots.length, 0);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Showing the next 14 days ({totalSlots} bookable slots) — exactly what
        clients see on your profile.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {rows.map((r) => (
          <div
            key={r.date.toISOString()}
            className="rounded-lg border border-border bg-background p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">{format(r.date, "EEE d MMM")}</p>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  r.slots.length === 0 && "text-muted-foreground",
                )}
              >
                {r.slots.length} slot{r.slots.length === 1 ? "" : "s"}
              </Badge>
            </div>
            {r.slots.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No availability
              </p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {r.slots.slice(0, 10).map((s) => (
                  <span
                    key={s.slot_start}
                    className="text-xs rounded-md bg-primary/10 text-primary px-2 py-0.5"
                  >
                    {format(new Date(s.slot_start), "HH:mm")}
                  </span>
                ))}
                {r.slots.length > 10 && (
                  <span className="text-xs text-muted-foreground">
                    +{r.slots.length - 10}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
