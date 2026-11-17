import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCanHost } from "@/lib/live/useCanHost";
import { useSeriesCopy } from "@/lib/live/seriesCopy";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Series = Tables<"live_series">;
type Item = Tables<"live_series_items"> & {
  recording: {
    id: string;
    title: string | null;
    title_fr: string | null;
    status: string;
  } | null;
};

const CATEGORIES = [
  "cbt",
  "schema-therapy",
  "act",
  "stress",
  "anxiety",
  "sport",
  "workplace",
  "leadership",
  "other",
];
const AUDIENCES = [
  "general",
  "athletes",
  "professionals",
  "organisations",
  "students",
];
const selectCls =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

/** Host workspace for series: create, order the sessions, publish. */
export default function LiveSeriesManage() {
  const { user, loading } = useAuth();
  const { locale } = useLocale();
  const { t } = useSeriesCopy();
  const loc = useLocalizedField();
  const { data: canHost, isLoading } = useCanHost();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Series | "new" | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const { data: series = [] } = useQuery({
    queryKey: ["live-series-manage", user?.id],
    enabled: !!canHost,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_series")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading || isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!user || !canHost)
    return <Navigate to={addLocalePrefix("/learn/live", locale)} replace />;

  const remove = async (s: Series) => {
    if (!window.confirm(t.deleteConfirm)) return;
    const { error } = await supabase
      .from("live_series")
      .delete()
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["live-series-manage"] });
  };

  return (
    <>
      <SEOHead path="/learn/live/manage/series" title={`${t.manage} | U.Psy`} />
      <main className="container-custom py-8 md:py-12 space-y-6">
        <Link
          to={addLocalePrefix("/learn/live/manage", locale)}
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> {t.backLive}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-display">{t.title}</h1>
          <Button onClick={() => setEditing("new")}>
            <Plus className="me-2 h-4 w-4" /> {t.newSeries}
          </Button>
        </div>

        {editing && (
          <SeriesForm
            initial={editing === "new" ? null : editing}
            onDone={() => setEditing(null)}
          />
        )}

        {series.length === 0 ? (
          <p className="text-muted-foreground">{t.noSeries}</p>
        ) : (
          <ul className="space-y-3">
            {series.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl border border-border p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold">{loc(s, "title")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={s.is_published ? "default" : "outline"}>
                        {s.is_published ? t.published : t.draft}
                      </Badge>
                      <Badge variant="outline">
                        {s.language.toUpperCase()}
                      </Badge>
                      {s.category && (
                        <Badge variant="outline">{s.category}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(s)}
                    >
                      {t.editSeries}
                    </Button>
                    <Button
                      size="sm"
                      variant={open === s.id ? "default" : "outline"}
                      onClick={() => setOpen(open === s.id ? null : s.id)}
                    >
                      {t.items}
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link
                        to={addLocalePrefix(
                          `/learn/live/series/${s.id}`,
                          locale,
                        )}
                      >
                        {t.watch}
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(s)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t.delete}</span>
                    </Button>
                  </div>
                </div>
                {open === s.id && <Items s={s} />}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function SeriesForm({
  initial,
  onDone,
}: {
  initial: Series | null;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const { t } = useSeriesCopy();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    title_fr: initial?.title_fr ?? "",
    title: initial?.title ?? "",
    title_ar: initial?.title_ar ?? "",
    description_fr: initial?.description_fr ?? "",
    description: initial?.description ?? "",
    language: initial?.language ?? "fr",
    category: initial?.category ?? "",
    audience: initial?.audience ?? "",
    tags: (initial?.tags ?? []).join(", "),
    course_id: initial?.course_id ?? "",
    is_published: initial?.is_published ?? false,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((p) => ({ ...p, [k]: v }));
  const { data: courses = [] } = useQuery({
    queryKey: ["live-courses"],
    queryFn: async () =>
      (
        await supabase
          .from("courses")
          .select("id, title, title_fr")
          .order("title")
      ).data ?? [],
  });

  const save = async () => {
    if (!f.title_fr.trim()) return toast.error(t.required);
    setBusy(true);
    const row: TablesInsert<"live_series"> = {
      title: f.title.trim() || f.title_fr.trim(),
      title_fr: f.title_fr.trim(),
      title_ar: f.title_ar.trim() || null,
      description: f.description.trim() || null,
      description_fr: f.description_fr.trim() || null,
      language: f.language,
      category: f.category || null,
      audience: f.audience || null,
      tags: f.tags
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean),
      course_id: f.course_id || null,
      is_published: f.is_published,
      host_id: initial?.host_id ?? user!.id,
    };
    const { error } = initial
      ? await supabase.from("live_series").update(row).eq("id", initial.id)
      : await supabase.from("live_series").insert(row);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.saved);
    qc.invalidateQueries({ queryKey: ["live-series-manage"] });
    qc.invalidateQueries({ queryKey: ["live-series-public"] });
    onDone();
  };

  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4">
      <h2 className="font-semibold">{initial ? t.editSeries : t.newSeries}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t.fTitleFr}>
          <Input
            value={f.title_fr}
            onChange={(e) => set("title_fr", e.target.value)}
          />
        </Field>
        <Field label={t.fTitleEn}>
          <Input
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>
        <Field label={t.fTitleAr}>
          <Input
            dir="rtl"
            value={f.title_ar}
            onChange={(e) => set("title_ar", e.target.value)}
          />
        </Field>
        <Field label={t.fLanguage}>
          <select
            className={selectCls}
            value={f.language}
            onChange={(e) => set("language", e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="ar">العربية / Darija</option>
            <option value="en">English</option>
          </select>
        </Field>
        <Field label={t.fDescFr}>
          <Textarea
            rows={3}
            value={f.description_fr}
            onChange={(e) => set("description_fr", e.target.value)}
          />
        </Field>
        <Field label={t.fDescEn}>
          <Textarea
            rows={3}
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <Field label={t.fCategory}>
          <select
            className={selectCls}
            value={f.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">—</option>
            {CATEGORIES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.fAudience}>
          <select
            className={selectCls}
            value={f.audience}
            onChange={(e) => set("audience", e.target.value)}
          >
            <option value="">—</option>
            {AUDIENCES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.fTags}>
          <Input value={f.tags} onChange={(e) => set("tags", e.target.value)} />
        </Field>
        <Field label={t.fCourse}>
          <select
            className={selectCls}
            value={f.course_id}
            onChange={(e) => set("course_id", e.target.value)}
          >
            <option value="">{t.noneOpt}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title_fr || c.title}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <label className="flex items-start gap-3 text-sm">
        <Switch
          checked={f.is_published}
          onCheckedChange={(v) => set("is_published", v)}
        />
        <span>{t.publishedHint}</span>
      </label>
      <div className="flex gap-2">
        <Button onClick={save} disabled={busy}>
          {busy && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {t.save}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          {t.cancel}
        </Button>
      </div>
    </section>
  );
}

function Items({ s }: { s: Series }) {
  const { t } = useSeriesCopy();
  const loc = useLocalizedField();
  const qc = useQueryClient();
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["live-series-items", s.id],
    queryFn: async () =>
      ((
        await supabase
          .from("live_series_items")
          .select(
            "*, recording:live_class_recordings(id, title, title_fr, status)",
          )
          .eq("series_id", s.id)
          .order("position")
      ).data ?? []) as unknown as Item[],
  });
  // Every stored recording the host can manage.
  const { data: recordings = [] } = useQuery({
    queryKey: ["live-recordings-mine"],
    queryFn: async () =>
      (
        await supabase
          .from("live_class_recordings")
          .select(
            "id, title, title_fr, created_at, live_classes(title, title_fr)",
          )
          .eq("status", "stored")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const inSeries = new Set(items.map((i) => i.recording_id));
  const available = recordings.filter((r) => !inSeries.has(r.id));
  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["live-series-items", s.id] });

  const add = async () => {
    if (!pick) return;
    setBusy(true);
    const { error } = await supabase.from("live_series_items").insert({
      series_id: s.id,
      recording_id: pick,
      position: items.length + 1,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setPick("");
    refresh();
  };
  const removeItem = async (it: Item) => {
    await supabase.from("live_series_items").delete().eq("id", it.id);
    refresh();
  };
  const move = async (i: number, dir: -1 | 1) => {
    const ids = items.map((x) => x.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    const { error } = await supabase.rpc("reorder_live_series", {
      _series: s.id,
      _item_ids: ids,
    });
    if (error) return toast.error(error.message);
    refresh();
  };
  const relabel = async (it: Item, label_fr: string) => {
    await supabase
      .from("live_series_items")
      .update({ label_fr: label_fr || null })
      .eq("id", it.id);
  };
  const recName = (r: { title: string | null; title_fr: string | null }) =>
    loc(r, "title") || "—";

  return (
    <div className="border-t pt-4 space-y-4">
      <h3 className="font-semibold">{t.items}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <ol className="space-y-2">
          {items.map((it, i) => (
            <li
              key={it.id}
              className="rounded-xl border border-border p-3 flex flex-wrap items-center gap-2"
            >
              <span className="text-xs text-muted-foreground w-6">
                {i + 1}.
              </span>
              <span className="font-medium flex-1 min-w-[10rem]">
                {it.recording ? recName(it.recording) : "—"}
              </span>
              <Input
                className="h-8 w-56"
                placeholder={t.label}
                defaultValue={it.label_fr ?? ""}
                onBlur={(e) => relabel(it, e.target.value.trim())}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={t.up}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                aria-label={t.down}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeItem(it)}
                aria-label={t.remove}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ol>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <select
          className={`${selectCls} w-auto min-w-[16rem]`}
          value={pick}
          onChange={(e) => setPick(e.target.value)}
        >
          <option value="">{t.addRecording}</option>
          {available.map((r) => (
            <option key={r.id} value={r.id}>
              {recName(r)}
              {r.live_classes
                ? ` · ${recName(r.live_classes as { title: string | null; title_fr: string | null })}`
                : ""}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={add} disabled={!pick || busy}>
          {busy && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {t.add}
        </Button>
        {available.length === 0 && items.length === 0 && (
          <span className="text-xs text-muted-foreground">
            {t.noRecordings}
          </span>
        )}
      </div>
    </div>
  );
}
