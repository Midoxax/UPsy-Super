import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Film } from "lucide-react";
import { useModuleStudioCopy } from "@/lib/academy/moduleStudioCopy";

/** Turns a live-class series into a draft course, one module per recording. */
export default function SeriesToCourse({
  onCreated,
}: {
  onCreated: (course: { id: string }) => void;
}) {
  const c = useModuleStudioCopy();
  const qc = useQueryClient();
  const [seriesId, setSeriesId] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: series = [] } = useQuery({
    queryKey: ["admin-live-series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_series")
        .select("id, title, title_fr, course_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  if (series.length === 0) return null;

  const create = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("course_from_live_series", {
      _series: seriesId,
    });
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "Error");
      return;
    }
    toast.success(c.created);
    setSeriesId("");
    await qc.invalidateQueries({ queryKey: ["admin-courses"] });
    qc.invalidateQueries({ queryKey: ["admin-live-series"] });
    const course = qc
      .getQueryData<{ id: string }[]>(["admin-courses"])
      ?.find((x) => x.id === data);
    if (course) onCreated(course);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3">
      <Film className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm">{c.fromSeries}</span>
      <select
        aria-label={c.pickSeries}
        className="h-9 rounded-md border bg-background px-2 text-sm flex-1 min-w-[180px]"
        value={seriesId}
        onChange={(e) => setSeriesId(e.target.value)}
      >
        <option value="">{c.pickSeries}</option>
        {series.map((s) => (
          <option key={s.id} value={s.id}>
            {(s.title_fr || s.title) +
              (s.course_id ? ` (${c.alreadyLinked})` : "")}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={create} disabled={!seriesId || busy}>
        {busy && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
        {c.create}
      </Button>
    </div>
  );
}
