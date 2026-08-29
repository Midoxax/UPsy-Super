import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveCourse, useDeleteCourse, useEnrollmentStats } from "@/hooks/admin/useAdminCourses";
import ModuleListEditor from "./ModuleListEditor";
import { Trash2 } from "lucide-react";

interface Props {
  course: any | null;
  open: boolean;
  onClose: () => void;
}

const EMPTY = {
  title: "",
  description: "",
  category: "general",
  difficulty_level: "beginner",
  duration_hours: 1,
  thumbnail_url: "",
  is_published: false,
  learning_path: "mental-health",
};

export default function CourseEditDrawer({ course, open, onClose }: Props) {
  const [form, setForm] = useState<any>(EMPTY);
  const save = useSaveCourse();
  const del = useDeleteCourse();
  const stats = useEnrollmentStats(course?.id ?? null);

  useEffect(() => {
    setForm(course ? { ...course } : EMPTY);
  }, [course?.id, open]);

  const handleSave = () => {
    save.mutate(form, { onSuccess: () => onClose() });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{course?.id ? "Edit course" : "New course"}</SheetTitle>
          <SheetDescription>{course?.id ?? "Draft a new learning module"}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Learning path</Label>
              <Select value={form.learning_path} onValueChange={(v) => setForm({ ...form, learning_path: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mental-health">Mental health</SelectItem>
                  <SelectItem value="performance">Performance (athletes)</SelectItem>
                  <SelectItem value="clinical-cpd">Clinical CPD (specialists)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={form.difficulty_level} onValueChange={(v) => setForm({ ...form, difficulty_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Duration (hours)</Label>
              <Input type="number" step="0.25" value={form.duration_hours ?? 0} onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thumbnail URL</Label>
            <Input value={form.thumbnail_url ?? ""} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://…" />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Published</p>
              <p className="text-xs text-muted-foreground">Visible to clients on /learn</p>
            </div>
            <Switch checked={!!form.is_published} onCheckedChange={(c) => setForm({ ...form, is_published: c })} />
          </div>

          {course?.id && (
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium mb-1">Enrollment stats</p>
              <p className="text-muted-foreground text-xs">
                {stats.data?.count ?? 0} learner(s) · {stats.data?.completed ?? 0} completed · avg {stats.data?.avgProgress ?? 0}% progress
              </p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button onClick={handleSave}>Save</Button>
            {course?.id && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Delete this course and all its modules?")) {
                    del.mutate(course.id, { onSuccess: () => onClose() });
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
          </div>

          {course?.id && (
            <div className="pt-6 border-t">
              <h3 className="font-semibold text-sm mb-3">Modules</h3>
              <ModuleListEditor courseId={course.id} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}