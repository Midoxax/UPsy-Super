import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  ArrowUp,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useTrainingsCopy } from "@/lib/academy/trainingsCopy";

type Training = Tables<"trainings"> & {
  training_courses: Tables<"training_courses">[];
};

/** Admin: build trainings from existing courses, order them, publish. */
export default function TrainingsManager() {
  const { t } = useTrainingsCopy();
  const [editing, setEditing] = useState<Training | "new" | null>(null);
  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ["admin-trainings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("*, training_courses(*)")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Training[];
    },
  });

  return (
    <section className="space-y-3 rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold flex items-center gap-2">
          <GraduationCap className="h-4 w-4" /> {t.manage}
        </h3>
        <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4 me-1" /> {t.newTraining}
        </Button>
      </div>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {trainings.map((tr) => (
            <button
              key={tr.id}
              onClick={() => setEditing(tr)}
              className="rounded-lg border px-3 py-2 text-sm text-start hover:border-primary/40"
            >
              {tr.title_fr || tr.title}{" "}
              <Badge variant={tr.is_published ? "default" : "secondary"}>
                {tr.training_courses.length}
              </Badge>
            </button>
          ))}
        </div>
      )}
      {editing && (
        <TrainingForm
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? null : editing}
          onDone={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function TrainingForm({
  initial,
  onDone,
}: {
  initial: Training | null;
  onDone: () => void;
}) {
  const { t } = useTrainingsCopy();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    title_fr: initial?.title_fr ?? "",
    title_ar: initial?.title_ar ?? "",
    description: initial?.description ?? "",
    description_fr: initial?.description_fr ?? "",
    audience: initial?.audience ?? "public",
    level: initial?.level ?? "beginner",
    cpd_hours: initial?.cpd_hours ? String(initial.cpd_hours) : "",
    is_published: initial?.is_published ?? false,
  });
  const [items, setItems] = useState(
    [...(initial?.training_courses ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ course_id: c.course_id, required: c.required })),
  );
  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses-light"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, title_fr")
        .order("title");
      if (error) throw error;
      return data ?? [];
    },
  });
  const name = (id: string) => {
    const c = courses.find((x) => x.id === id);
    return c ? c.title_fr || c.title : id.slice(0, 8);
  };
  const set = (k: keyof typeof f, v: string | boolean) =>
    setF((p) => ({ ...p, [k]: v }));
  const move = (i: number, d: -1 | 1) =>
    setItems((xs) => {
      const j = i + d;
      if (j < 0 || j >= xs.length) return xs;
      const next = [...xs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    setBusy(true);
    const row: TablesInsert<"trainings"> = {
      slug: f.slug.trim(),
      title: f.title.trim() || f.title_fr.trim(),
      title_fr: f.title_fr.trim() || null,
      title_ar: f.title_ar.trim() || null,
      description: f.description.trim() || null,
      description_fr: f.description_fr.trim() || null,
      audience: f.audience,
      level: f.level,
      cpd_hours: f.cpd_hours ? Number(f.cpd_hours) : null,
      is_published: f.is_published,
    };
    const res = initial
      ? await supabase
          .from("trainings")
          .update(row)
          .eq("id", initial.id)
          .select("id")
          .single()
      : await supabase.from("trainings").insert(row).select("id").single();
    if (res.error) {
      setBusy(false);
      toast.error(res.error.message);
      return;
    }
    const id = res.data.id;
    // Replace the course list in one go: small lists, admin-only.
    const del = await supabase
      .from("training_courses")
      .delete()
      .eq("training_id", id);
    const ins = items.length
      ? await supabase.from("training_courses").insert(
          items.map((x, i) => ({
            training_id: id,
            course_id: x.course_id,
            required: x.required,
            position: i + 1,
          })),
        )
      : { error: null };
    setBusy(false);
    if (del.error || ins.error) {
      toast.error((del.error ?? ins.error)!.message);
      return;
    }
    toast.success(t.saved);
    qc.invalidateQueries({ queryKey: ["admin-trainings"] });
    qc.invalidateQueries({ queryKey: ["trainings-public"] });
    onDone();
  };

  const remove = async () => {
    if (!initial) return;
    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", initial.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-trainings"] });
    onDone();
  };

  const field = "h-9 rounded-md border bg-background px-2 text-sm w-full";
  return (
    <div className="space-y-3 rounded-xl border border-dashed p-4">
      <Input
        placeholder={t.fSlug}
        value={f.slug}
        onChange={(e) => set("slug", e.target.value.toLowerCase())}
      />
      <div className="grid gap-2 md:grid-cols-3">
        <Input
          placeholder={t.fTitleFr}
          value={f.title_fr}
          onChange={(e) => set("title_fr", e.target.value)}
        />
        <Input
          placeholder={t.fTitleEn}
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <Input
          placeholder={t.fTitleAr}
          value={f.title_ar}
          onChange={(e) => set("title_ar", e.target.value)}
        />
      </div>
      <Textarea
        rows={2}
        placeholder={t.fDescFr}
        value={f.description_fr}
        onChange={(e) => set("description_fr", e.target.value)}
      />
      <Textarea
        rows={2}
        placeholder={t.fDescEn}
        value={f.description}
        onChange={(e) => set("description", e.target.value)}
      />
      <div className="grid gap-2 md:grid-cols-3">
        <select
          aria-label={t.fAudience}
          className={field}
          value={f.audience}
          onChange={(e) => set("audience", e.target.value)}
        >
          <option value="public">{t.public}</option>
          <option value="professional">{t.professional}</option>
        </select>
        <select
          aria-label={t.fLevel}
          className={field}
          value={f.level}
          onChange={(e) => set("level", e.target.value)}
        >
          {Object.entries(t.levels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <Input
          type="number"
          min={0}
          step={0.5}
          placeholder={t.fHours}
          value={f.cpd_hours}
          onChange={(e) => set("cpd_hours", e.target.value)}
        />
      </div>

      <ol className="space-y-2">
        {items.map((x, i) => (
          <li
            key={x.course_id}
            className="flex items-center gap-2 rounded-lg border p-2 text-sm"
          >
            <span className="w-5 text-muted-foreground">{i + 1}</span>
            <span className="flex-1 truncate">{name(x.course_id)}</span>
            <label className="flex items-center gap-1 text-xs text-muted-foreground">
              <Switch
                checked={x.required}
                onCheckedChange={(c) =>
                  setItems((xs) =>
                    xs.map((y, k) => (k === i ? { ...y, required: c } : y)),
                  )
                }
              />
              {t.required}
            </label>
            <Button size="icon" variant="ghost" onClick={() => move(i, -1)}>
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => move(i, 1)}>
              <ArrowDown className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setItems((xs) => xs.filter((_, k) => k !== i))}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </li>
        ))}
      </ol>
      <select
        aria-label={t.addCourse}
        className={field}
        value=""
        onChange={(e) =>
          e.target.value &&
          setItems((xs) => [
            ...xs,
            { course_id: e.target.value, required: true },
          ])
        }
      >
        <option value="">{`${t.addCourse} : ${t.pickCourse}`}</option>
        {courses
          .filter((c) => !items.some((x) => x.course_id === c.id))
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.title_fr || c.title}
            </option>
          ))}
      </select>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={f.is_published}
            onCheckedChange={(c) => set("is_published", c)}
          />
          {t.fPublished}
        </label>
        <div className="flex gap-2">
          {initial && (
            <Button size="sm" variant="ghost" onClick={remove}>
              <Trash2 className="h-4 w-4 me-1" /> {t.delete}
            </Button>
          )}
          <Button size="sm" onClick={save} disabled={busy || !f.slug}>
            {busy && <Loader2 className="h-4 w-4 me-1 animate-spin" />}
            {t.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
