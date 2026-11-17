import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useModuleStudioCopy } from "@/lib/academy/moduleStudioCopy";
import {
  useAdminCourseModules,
  useSaveModule,
  useDeleteModule,
} from "@/hooks/admin/useAdminCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";

type Draft = {
  title_fr: string;
  title_en: string;
  content_fr: string;
  content_en: string;
  minutes: number;
  review_notes: string[];
};

/** Stored class recordings an admin can attach to a module. */
function useStoredRecordings() {
  return useQuery({
    queryKey: ["admin-stored-recordings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_class_recordings")
        .select("id, title, title_fr, created_at")
        .eq("status", "stored")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export default function ModuleListEditor({ courseId }: { courseId: string }) {
  const { data: modules = [], isLoading } = useAdminCourseModules(courseId);
  const save = useSaveModule();
  const del = useDeleteModule();
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const { data: recordings = [] } = useStoredRecordings();
  const c = useModuleStudioCopy();
  const patch = (id: string, fields: Record<string, unknown>) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...fields } }));

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;

  const list = modules.map((m: any) => ({ ...m, ...(drafts[m.id] ?? {}) }));

  const move = (mod: any, dir: -1 | 1) => {
    const idx = list.findIndex((m) => m.id === mod.id);
    const target = list[idx + dir];
    if (!target) return;
    save.mutate({
      ...mod,
      order_index: target.order_index,
      course_id: courseId,
    });
    save.mutate({
      ...target,
      order_index: mod.order_index,
      course_id: courseId,
    });
  };

  return (
    <div className="space-y-3">
      {list.map((m: any) => (
        <div
          key={m.id}
          className="rounded-lg border p-3 space-y-2 bg-surface/30"
        >
          <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => move(m, -1)}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => move(m, 1)}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Module title"
                value={m.title ?? ""}
                onChange={(e) =>
                  setDrafts({
                    ...drafts,
                    [m.id]: { ...drafts[m.id], title: e.target.value },
                  })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Video URL"
                  value={m.video_url ?? ""}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [m.id]: { ...drafts[m.id], video_url: e.target.value },
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Duration min"
                  value={m.duration_minutes ?? ""}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [m.id]: {
                        ...drafts[m.id],
                        duration_minutes: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <Input
                placeholder={c.titleFr}
                value={m.title_fr ?? ""}
                onChange={(e) => patch(m.id, { title_fr: e.target.value })}
              />
              <select
                aria-label={c.recording}
                className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                value={m.recording_id ?? ""}
                onChange={(e) =>
                  patch(m.id, { recording_id: e.target.value || null })
                }
              >
                <option value="">{`${c.recording} : ${c.noRecording}`}</option>
                {recordings.map((r) => (
                  <option key={r.id} value={r.id}>
                    {`${r.title_fr || r.title || r.id.slice(0, 8)} · ${new Date(r.created_at).toLocaleDateString()}`}
                  </option>
                ))}
              </select>
              <Textarea
                rows={4}
                placeholder={c.contentFr}
                value={m.content_fr ?? ""}
                onChange={(e) => patch(m.id, { content_fr: e.target.value })}
              />
              <Textarea
                rows={2}
                placeholder="Content / notes"
                value={m.content ?? ""}
                onChange={(e) =>
                  setDrafts({
                    ...drafts,
                    [m.id]: { ...drafts[m.id], content: e.target.value },
                  })
                }
              />
              <AiDraft moduleId={m.id} onDraft={(d) => patch(m.id, d)} />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={!!m.is_free_preview}
                    onCheckedChange={(c) =>
                      setDrafts({
                        ...drafts,
                        [m.id]: { ...drafts[m.id], is_free_preview: c },
                      })
                    }
                  />
                  Free preview
                </label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => del.mutate({ id: m.id, courseId })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => save.mutate({ ...m, course_id: courseId })}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          save.mutate({
            course_id: courseId,
            title: "New module",
            order_index: list.length,
          })
        }
      >
        <Plus className="h-4 w-4 mr-1" /> Add module
      </Button>
    </div>
  );
}

/** Fable drafts the lesson; the result goes into the form, not the database. */
function AiDraft({
  moduleId,
  onDraft,
}: {
  moduleId: string;
  onDraft: (fields: Record<string, unknown>) => void;
}) {
  const c = useModuleStudioCopy();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<string[]>([]);

  const run = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke<Draft>(
      "academy-draft-module",
      { body: { module_id: moduleId, notes } },
    );
    setBusy(false);
    if (error || !data) {
      toast.error(error?.message ?? "AI error");
      return;
    }
    onDraft({
      title_fr: data.title_fr,
      title: data.title_en,
      content_fr: data.content_fr,
      content: data.content_en,
      duration_minutes: data.minutes,
    });
    setReview(data.review_notes);
    toast.success(c.drafted);
  };

  if (!open)
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Sparkles className="h-3.5 w-3.5 mr-1" /> {c.draft}
      </Button>
    );
  return (
    <div className="rounded-md border border-dashed p-2 space-y-2">
      <Textarea
        rows={3}
        placeholder={c.notes}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Button size="sm" onClick={run} disabled={busy}>
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 mr-1" />
        )}
        {busy ? c.drafting : c.draft}
      </Button>
      {review.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">{c.review}</p>
          <ul className="list-disc ps-4">
            {review.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
