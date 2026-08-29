import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays } from "date-fns";

interface SlotSuggestion {
  day: string;
  hour: string;
  demand: number; // requests / views in window
  reason: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SmartSchedulingCard = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SlotSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = subDays(new Date(), 60).toISOString();

      // 1) demand from leads (when do prospects reach out?)
      const { data: leads } = await supabase
        .from("leads")
        .select("created_at")
        .eq("psychologist_id", user.id)
        .gte("created_at", since);

      // 2) bookings — when do clients actually book?
      const { data: bookings } = await supabase
        .from("bookings")
        .select("scheduled_at, status")
        .eq("psychologist_id", user.id)
        .gte("scheduled_at", since)
        .neq("status", "cancelled");

      // 3) current availability — to find demand WITHOUT supply
      const { data: slots } = await supabase
        .from("availability_slots")
        .select("day_of_week, start_time, end_time, is_available")
        .eq("psychologist_id", user.id);

      // Bucket demand into (day, hour) cells
      const cells = new Map<string, number>();
      [...(leads ?? []), ...(bookings ?? [])].forEach((row: any) => {
        const ts = new Date(row.created_at ?? row.scheduled_at);
        const key = `${ts.getDay()}-${ts.getHours()}`;
        cells.set(key, (cells.get(key) ?? 0) + 1);
      });

      // Existing supply set
      const supply = new Set<string>();
      (slots ?? []).forEach((s: any) => {
        if (!s.is_available) return;
        const startH = parseInt(String(s.start_time).slice(0, 2), 10);
        const endH = parseInt(String(s.end_time).slice(0, 2), 10);
        for (let h = startH; h < endH; h++) supply.add(`${s.day_of_week}-${h}`);
      });

      // Top demand cells NOT covered by current availability
      const ranked: SlotSuggestion[] = [...cells.entries()]
        .filter(([key]) => !supply.has(key))
        .map(([key, count]) => {
          const [d, h] = key.split("-").map(Number);
          return {
            day: DAYS[d],
            hour: `${String(h).padStart(2, "0")}:00`,
            demand: count,
            reason:
              h >= 18 ? "After-work demand spike" :
              h <= 9 ? "Early-morning interest" :
              "Mid-day inquiries",
          };
        })
        .sort((a, b) => b.demand - a.demand)
        .slice(0, 4);

      setSuggestions(ranked);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <Card className="p-5 animate-pulse">
        <div className="h-4 w-40 bg-muted rounded-sm mb-3" />
        <div className="h-3 w-full bg-muted rounded-sm" />
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground">Smart scheduling</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Time windows where demand exceeds your current availability.
      </p>

      {suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Your availability covers current demand well.
        </p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {s.day} · {s.hour}
                </p>
                <p className="text-xs text-muted-foreground">{s.reason}</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {s.demand}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default SmartSchedulingCard;
