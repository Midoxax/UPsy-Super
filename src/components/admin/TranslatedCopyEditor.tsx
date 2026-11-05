import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen,
  Crown,
  Library,
  Loader2,
  Save,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Admin editor for database copy kept in English, French and Arabic sibling
 * columns (`name`, `name_fr`, `name_ar`, …). Only those columns are written;
 * an empty French or Arabic field falls back to English on the public page.
 */

type Row = Record<string, string | number | boolean | null>;

interface Config {
  table:
    | "membership_plans"
    | "community_spaces"
    | "courses"
    | "resources"
    | "resource_topics";
  /** Stamp `updated_at` on save (the table has the column). */
  stamp?: boolean;
  /** Column that identifies a row in the update. */
  idColumn: string;
  /** Column shown as the row's label. */
  label: string;
  /** Boolean column; false shows the row as hidden. */
  visible?: string;
  order: string;
  /** English column names; `_fr` and `_ar` siblings are edited alongside. */
  fields: { column: string; label: string; multiline?: boolean }[];
  invalidate: string[][];
  icon: LucideIcon;
  title: string;
  description: string;
}

const LANGS = [
  { suffix: "", lang: "English", dir: "ltr" },
  { suffix: "_fr", lang: "French", dir: "ltr" },
  { suffix: "_ar", lang: "Arabic", dir: "rtl" },
] as const;

const TEXT = {
  save: "Save",
  hidden: "hidden",
  saved: "Saved",
  failed: "Could not save",
  required: "The English %s is required",
  filter: "Filter…",
};

function TranslatedCopyEditor(cfg: Config) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, Row>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const columns = cfg.fields.flatMap((f) =>
    LANGS.map((l) => f.column + l.suffix),
  );
  const queryKey = ["admin-copy", cfg.table];

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const cols = [
        ...new Set(
          [cfg.idColumn, cfg.label, cfg.visible, ...columns].filter(Boolean),
        ),
      ];
      const { data, error } = await supabase
        .from(cfg.table)
        .select(cols.join(", "))
        .order(cfg.order);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  useEffect(() => {
    setDrafts(
      Object.fromEntries(rows.map((r) => [String(r[cfg.idColumn]), r])),
    );
  }, [rows, cfg.idColumn]);

  const set = (id: string, column: string, value: string) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [column]: value } }));

  const save = async (id: string) => {
    const draft = drafts[id];
    const first = cfg.fields[0];
    if (!String(draft?.[first.column] ?? "").trim()) {
      toast({
        title: TEXT.required.replace("%s", first.label.toLowerCase()),
        variant: "destructive",
      });
      return;
    }
    setSaving(id);
    const patch = Object.fromEntries(
      columns.map((c) => [c, String(draft[c] ?? "").trim() || null]),
    );
    const { error } = await supabase
      .from(cfg.table)
      .update(
        (cfg.stamp
          ? { ...patch, updated_at: new Date().toISOString() }
          : patch) as never,
      )
      .eq(cfg.idColumn, id as never);
    setSaving(null);
    if (error) {
      toast({
        title: TEXT.failed,
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: TEXT.saved });
    qc.invalidateQueries({ queryKey });
    cfg.invalidate.forEach((k) => qc.invalidateQueries({ queryKey: k }));
  };

  const Icon = cfg.icon;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {cfg.title}
        </CardTitle>
        <CardDescription>{cfg.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            {rows.length > 10 && (
              <Input
                placeholder={TEXT.filter}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            )}
            {rows
              .filter((row) =>
                [cfg.label, ...columns].some((c) =>
                  String(row[c] ?? "")
                    .toLowerCase()
                    .includes(filter.toLowerCase()),
                ),
              )
              .map((row) => {
                const id = String(row[cfg.idColumn]);
                const d = drafts[id];
                if (!d) return null;
                return (
                  <div
                    key={id}
                    className="rounded-lg border border-border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {String(row[cfg.label])}
                        {cfg.visible &&
                          !row[cfg.visible] &&
                          ` · ${TEXT.hidden}`}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => save(id)}
                        disabled={saving === id}
                      >
                        {saving === id ? (
                          <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="me-2 h-4 w-4" />
                        )}
                        {TEXT.save}
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {LANGS.map((l) => (
                        <div key={l.lang} className="space-y-2">
                          {cfg.fields.map((f) => {
                            const column = f.column + l.suffix;
                            const Field = f.multiline ? Textarea : Input;
                            return (
                              <div key={column} className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  {`${f.label} · ${l.lang}`}
                                </Label>
                                <Field
                                  dir={l.dir}
                                  rows={f.multiline ? 3 : undefined}
                                  value={String(d[column] ?? "")}
                                  onChange={(e) =>
                                    set(id, column, e.target.value)
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </>
        )}
      </CardContent>
    </Card>
  );
}

const PLANS: Config = {
  table: "membership_plans",
  idColumn: "tier",
  label: "tier",
  visible: "is_active",
  order: "sort_order",
  fields: [
    { column: "name", label: "Name" },
    { column: "tagline", label: "Tagline" },
  ],
  stamp: true,
  invalidate: [["membership-plans"]],
  icon: Crown,
  title: "Membership plans: names and taglines",
  description:
    "Shown on the membership page in each language. Leave French or Arabic empty to show the English.",
};

const SPACES: Config = {
  table: "community_spaces",
  idColumn: "slug",
  label: "slug",
  visible: "is_published",
  order: "name",
  fields: [
    { column: "name", label: "Name" },
    { column: "description", label: "Description", multiline: true },
  ],
  stamp: true,
  invalidate: [["community-spaces"], ["community-space"]],
  icon: Users,
  title: "Community spaces: names and descriptions",
  description:
    "Shown in the Training Center in each language. Leave French or Arabic empty to show the English.",
};

const COURSES: Config = {
  table: "courses",
  idColumn: "slug",
  label: "slug",
  visible: "is_published",
  order: "title",
  fields: [
    { column: "title", label: "Title" },
    { column: "description", label: "Description", multiline: true },
  ],
  invalidate: [
    ["admin-courses"],
    ["public-courses"],
    ["homepage-courses"],
    ["learn-course"],
    ["continue-learning"],
  ],
  icon: BookOpen,
  title: "Courses: titles and descriptions",
  description:
    "Shown on Learn, the course pages and dashboards in each language. Leave French or Arabic empty to show the English.",
};

const RESOURCES: Config = {
  table: "resources",
  stamp: true,
  idColumn: "slug",
  label: "slug",
  visible: "is_published",
  order: "title",
  fields: [
    { column: "title", label: "Title" },
    { column: "summary", label: "Summary", multiline: true },
  ],
  invalidate: [["resources"]],
  icon: Library,
  title: "Resources: titles and summaries",
  description:
    "Shown in the resource library in each language. Leave French or Arabic empty to show the English.",
};

const TOPICS: Config = {
  table: "resource_topics",
  idColumn: "slug",
  label: "slug",
  order: "sort_order",
  fields: [{ column: "name", label: "Name" }],
  invalidate: [["resource-topics"]],
  icon: Tags,
  title: "Resource topics: names",
  description:
    "Topic filters in the resource library. Leave French or Arabic empty to show the English.",
};

export const MembershipPlanCopyEditor = () => (
  <TranslatedCopyEditor {...PLANS} />
);
export const CommunitySpaceCopyEditor = () => (
  <TranslatedCopyEditor {...SPACES} />
);
export const CourseCopyEditor = () => <TranslatedCopyEditor {...COURSES} />;
export const ResourceCopyEditor = () => <TranslatedCopyEditor {...RESOURCES} />;
export const ResourceTopicCopyEditor = () => (
  <TranslatedCopyEditor {...TOPICS} />
);
