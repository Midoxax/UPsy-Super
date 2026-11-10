import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2, Plus, Users, Film } from "lucide-react";
import { formatWhen } from "@/lib/live/liveCopy";
import { useCanHost } from "@/lib/live/useCanHost";
import { useManageCopy } from "@/lib/live/manageCopy";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type LiveClass = Tables<"live_classes">;
type Recording = Tables<"live_class_recordings">;

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

/**
 * Host workspace for U.Psy's psychologists and admins. Create and publish classes, see who registered and attended,
 * export the roster, and classify recordings before publishing them.
 */
export default function LiveClassManage() {
  const { user, loading } = useAuth();
  const { locale } = useLocale();
  const t = useManageCopy();
  const { data: canHost, isLoading } = useCanHost();
  const [editing, setEditing] = useState<LiveClass | "new" | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ["live-manage", user?.id],
    enabled: !!canHost,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_classes")
        .select("*")
        .order("starts_at", { ascending: false });
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

  return (
    <>
      <SEOHead path="/learn/live/manage" title={t.pageTitle} />
      <main className="container-custom py-8 md:py-12 space-y-6">
        <Link
          to={addLocalePrefix("/learn/live", locale)}
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> {t.back}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-display">{t.heading}</h1>
          <Button onClick={() => setEditing("new")}>
            <Plus className="me-2 h-4 w-4" /> {t.newClass}
          </Button>
        </div>

        {editing && (
          <ClassForm
            initial={editing === "new" ? null : editing}
            onDone={() => setEditing(null)}
          />
        )}

        {classes.length === 0 ? (
          <p className="text-muted-foreground">{t.empty}</p>
        ) : (
          <ul className="space-y-3">
            {classes.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-border p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold">{c.title_fr || c.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatWhen(c.starts_at, locale)} · {c.duration_minutes}{" "}
                      min
                      {c.capacity ? ` · ${c.capacity} ${t.places}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={c.is_published ? "default" : "outline"}>
                        {c.is_published ? t.published : t.draft}
                      </Badge>
                      {c.status !== "scheduled" && (
                        <Badge variant="outline">
                          {c.status === "ended" ? t.ended : t.cancelled}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {c.recording_enabled ? t.recorded : t.notRecorded}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(c)}
                    >
                      {t.edit}
                    </Button>
                    <Button
                      size="sm"
                      variant={open === c.id ? "default" : "outline"}
                      onClick={() => setOpen(open === c.id ? null : c.id)}
                    >
                      <Users className="me-2 h-4 w-4" /> {t.roster}
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={addLocalePrefix(`/learn/live/${c.id}`, locale)}>
                        {t.openRoom}
                      </Link>
                    </Button>
                  </div>
                </div>
                {open === c.id && (
                  <div className="grid gap-6 lg:grid-cols-2 border-t pt-4">
                    <Roster c={c} />
                    <Recordings c={c} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ClassForm({
  initial,
  onDone,
}: {
  initial: LiveClass | null;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const t = useManageCopy();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    title_fr: initial?.title_fr ?? "",
    title: initial?.title ?? "",
    title_ar: initial?.title_ar ?? "",
    description_fr: initial?.description_fr ?? "",
    description: initial?.description ?? "",
    starts_at: initial ? toLocalInput(initial.starts_at) : "",
    duration_minutes: initial?.duration_minutes ?? 60,
    capacity: initial?.capacity ?? ("" as number | ""),
    language: initial?.language ?? "fr",
    recording_enabled: initial?.recording_enabled ?? true,
    is_published: initial?.is_published ?? false,
    course_id: initial?.course_id ?? "",
    status: initial?.status ?? "scheduled",
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
    if (!f.title_fr.trim() || !f.starts_at) return toast.error(t.required);
    setBusy(true);
    const row: TablesInsert<"live_classes"> = {
      title: f.title.trim() || f.title_fr.trim(),
      title_fr: f.title_fr.trim(),
      title_ar: f.title_ar.trim() || null,
      description: f.description.trim() || null,
      description_fr: f.description_fr.trim() || null,
      starts_at: new Date(f.starts_at).toISOString(),
      duration_minutes: Number(f.duration_minutes),
      capacity: f.capacity === "" ? null : Number(f.capacity),
      language: f.language,
      recording_enabled: f.recording_enabled,
      is_published: f.is_published,
      course_id: f.course_id || null,
      status: f.status,
      host_id: initial?.host_id ?? user!.id,
    };
    const { error } = initial
      ? await supabase.from("live_classes").update(row).eq("id", initial.id)
      : await supabase.from("live_classes").insert(row);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.saved);
    qc.invalidateQueries({ queryKey: ["live-manage"] });
    qc.invalidateQueries({ queryKey: ["live-classes"] });
    onDone();
  };

  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4">
      <h2 className="font-semibold">{initial ? t.editClass : t.newClass}</h2>
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
        <Field label={t.fWhen}>
          <Input
            type="datetime-local"
            value={f.starts_at}
            onChange={(e) => set("starts_at", e.target.value)}
          />
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
        <Field label={t.fDuration}>
          <Input
            type="number"
            min={15}
            max={300}
            value={f.duration_minutes}
            onChange={(e) => set("duration_minutes", Number(e.target.value))}
          />
        </Field>
        <Field label={t.fCapacity}>
          <Input
            type="number"
            min={1}
            value={f.capacity}
            onChange={(e) =>
              set(
                "capacity",
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
          />
        </Field>
        <Field label={t.fLanguage}>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={f.language}
            onChange={(e) => set("language", e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="ar">العربية / Darija</option>
            <option value="en">English</option>
          </select>
        </Field>
        <Field label={t.fCourse}>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={f.course_id}
            onChange={(e) => set("course_id", e.target.value)}
          >
            <option value="">{t.none}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title_fr || c.title}
              </option>
            ))}
          </select>
        </Field>
        {initial && (
          <Field label={t.fStatus}>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={f.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="scheduled">{t.scheduled}</option>
              <option value="ended">{t.ended}</option>
              <option value="cancelled">{t.cancelled}</option>
            </select>
          </Field>
        )}
      </div>
      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm">
          <Switch
            checked={f.recording_enabled}
            onCheckedChange={(v) => set("recording_enabled", v)}
          />
          <span>{t.recordable}</span>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <Switch
            checked={f.is_published}
            onCheckedChange={(v) => set("is_published", v)}
          />
          <span>{t.publishedHint}</span>
        </label>
      </div>
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

function Roster({ c }: { c: LiveClass }) {
  const t = useManageCopy();
  const { data = [], isLoading } = useQuery({
    queryKey: ["live-roster", c.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("live_class_roster", {
        _class: c.id,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
  const active = data.filter((r) => !r.cancelled_at);
  const attended = active.filter((r) => r.minutes_attended > 0).length;

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      t.csvHeaders,
      ...data.map((r) => [
        r.full_name,
        r.email,
        r.registered_at,
        r.cancelled_at,
        r.recording_consent_at,
        r.minutes_attended,
      ]),
    ];
    const blob = new Blob(
      ["﻿" + rows.map((r) => r.map(esc).join(";")).join("\n")],
      {
        type: "text/csv;charset=utf-8",
      },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `participants-${c.id.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">
          {t.participants(active.length, attended)}
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={exportCsv}
          disabled={data.length === 0}
        >
          <Download className="me-2 h-4 w-4" /> CSV
        </Button>
      </div>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.noRegistrations}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-start text-xs text-muted-foreground">
                <th className="py-1 text-start">{t.name}</th>
                <th className="py-1 text-start">{t.email}</th>
                <th className="py-1 text-end">{t.attendance}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr
                  key={r.user_id}
                  className={r.cancelled_at ? "opacity-50" : ""}
                >
                  <td className="py-1">{r.full_name || "—"}</td>
                  <td className="py-1">{r.email}</td>
                  <td className="py-1 text-end">
                    {r.cancelled_at
                      ? t.cancelledShort
                      : `${r.minutes_attended} min`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">{t.privacy}</p>
    </div>
  );
}

function Recordings({ c }: { c: LiveClass }) {
  const t = useManageCopy();
  const { data = [], isLoading } = useQuery({
    queryKey: ["live-recs", c.id],
    queryFn: async () =>
      (
        await supabase
          .from("live_class_recordings")
          .select("*")
          .eq("class_id", c.id)
          .order("created_at")
      ).data ?? [],
  });
  return (
    <div className="space-y-3">
      <h3 className="font-semibold inline-flex items-center gap-2">
        <Film className="h-4 w-4" /> {t.recordings}
      </h3>
      {!c.recording_enabled ? (
        <p className="text-sm text-muted-foreground">{t.notRecordable}</p>
      ) : isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.recordingHint}</p>
      ) : (
        data.map((r) => <RecordingForm key={r.id} r={r} />)
      )}
    </div>
  );
}

function RecordingForm({ r }: { r: Recording }) {
  const t = useManageCopy();
  const { locale } = useLocale();
  const dateTag =
    locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR";
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    title_fr: r.title_fr ?? "",
    title: r.title ?? "",
    summary_fr: r.summary_fr ?? "",
    category: r.category ?? "",
    topic: r.topic ?? "",
    audience: r.audience ?? "",
    language: r.language ?? "fr",
    tags: (r.tags ?? []).join(", "),
    is_published: r.is_published,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("live_class_recordings")
      .update({
        title_fr: f.title_fr || null,
        title: f.title || null,
        summary_fr: f.summary_fr || null,
        category: f.category || null,
        topic: f.topic || null,
        audience: f.audience || null,
        language: f.language || null,
        tags: f.tags
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        is_published: f.is_published,
      })
      .eq("id", r.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.classified);
    qc.invalidateQueries({ queryKey: ["live-recs", r.class_id] });
  };

  return (
    <div className="rounded-xl border border-border p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge
          variant={
            r.status === "stored"
              ? "default"
              : r.status === "failed"
                ? "destructive"
                : "outline"
          }
        >
          {r.status === "stored"
            ? t.stored
            : r.status === "failed"
              ? t.failed
              : t.copying}
        </Badge>
        {r.size_bytes ? (
          <span>
            {Math.round(r.size_bytes / 1e6)} {t.mb}
          </span>
        ) : null}
        <span className="text-muted-foreground">
          {new Date(r.created_at).toLocaleString(dateTag)}
        </span>
      </div>
      {r.status === "failed" && (
        <p className="text-xs text-destructive">
          {r.error}
          {r.source_link &&
            r.source_expires_at &&
            new Date(r.source_expires_at) > new Date() && (
              <>
                {" "}
                —{" "}
                <a
                  href={r.source_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {t.downloadOriginal}
                </a>{" "}
                ({t.linkUntil}{" "}
                {new Date(r.source_expires_at).toLocaleString(dateTag)})
              </>
            )}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t.rTitleFr}>
          <Input
            value={f.title_fr}
            onChange={(e) => set("title_fr", e.target.value)}
          />
        </Field>
        <Field label={t.rTitleEn}>
          <Input
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>
        <Field label={t.category}>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
        <Field label={t.audience}>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
        <Field label={t.topic}>
          <Input
            value={f.topic}
            onChange={(e) => set("topic", e.target.value)}
          />
        </Field>
        <Field label={t.tags}>
          <Input value={f.tags} onChange={(e) => set("tags", e.target.value)} />
        </Field>
      </div>
      <Field label={t.summaryFr}>
        <Textarea
          rows={2}
          value={f.summary_fr}
          onChange={(e) => set("summary_fr", e.target.value)}
        />
      </Field>
      <label className="flex items-center gap-3 text-sm">
        <Switch
          checked={f.is_published}
          onCheckedChange={(v) => set("is_published", v)}
          disabled={r.status !== "stored"}
        />
        <span>{t.publishRec}</span>
      </label>
      <Button size="sm" onClick={save} disabled={busy}>
        {busy && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
        {t.saveClass}
      </Button>
    </div>
  );
}
