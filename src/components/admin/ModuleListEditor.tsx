import { useState } from "react";
import { useAdminCourseModules, useSaveModule, useDeleteModule } from "@/hooks/admin/useAdminCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export default function ModuleListEditor({ courseId }: { courseId: string }) {
  const { data: modules = [], isLoading } = useAdminCourseModules(courseId);
  const save = useSaveModule();
  const del = useDeleteModule();
  const [drafts, setDrafts] = useState<Record<string, any>>({});

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;

  const list = modules.map((m: any) => ({ ...m, ...(drafts[m.id] ?? {}) }));

  const move = (mod: any, dir: -1 | 1) => {
    const idx = list.findIndex((m) => m.id === mod.id);
    const target = list[idx + dir];
    if (!target) return;
    save.mutate({ ...mod, order_index: target.order_index, course_id: courseId });
    save.mutate({ ...target, order_index: mod.order_index, course_id: courseId });
  };

  return (
    <div className="space-y-3">
      {list.map((m: any) => (
        <div key={m.id} className="rounded-lg border p-3 space-y-2 bg-surface/30">
          <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(m, -1)}>
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(m, 1)}>
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Module title"
                value={m.title ?? ""}
                onChange={(e) => setDrafts({ ...drafts, [m.id]: { ...drafts[m.id], title: e.target.value } })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Video URL"
                  value={m.video_url ?? ""}
                  onChange={(e) => setDrafts({ ...drafts, [m.id]: { ...drafts[m.id], video_url: e.target.value } })}
                />
                <Input
                  type="number"
                  placeholder="Duration min"
                  value={m.duration_minutes ?? ""}
                  onChange={(e) => setDrafts({ ...drafts, [m.id]: { ...drafts[m.id], duration_minutes: Number(e.target.value) } })}
                />
              </div>
              <Textarea
                rows={2}
                placeholder="Content / notes"
                value={m.content ?? ""}
                onChange={(e) => setDrafts({ ...drafts, [m.id]: { ...drafts[m.id], content: e.target.value } })}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => del.mutate({ id: m.id, courseId })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" onClick={() => save.mutate({ ...m, course_id: courseId })}>
                  Save
                </Button>
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