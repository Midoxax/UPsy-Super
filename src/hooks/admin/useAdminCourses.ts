import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdminCourses = () =>
  useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useAdminCourseModules = (courseId: string | null) =>
  useQuery({
    queryKey: ["admin-course-modules", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId!)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useEnrollmentStats = (courseId: string | null) =>
  useQuery({
    queryKey: ["course-enrollment-stats", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("progress_percent, completed_at")
        .eq("course_id", courseId!);
      if (error) throw error;
      const rows = data ?? [];
      const count = rows.length;
      const completed = rows.filter((r) => r.completed_at).length;
      const avgProgress = count
        ? Math.round(rows.reduce((s, r) => s + Number(r.progress_percent ?? 0), 0) / count)
        : 0;
      return { count, completed, avgProgress };
    },
  });

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export const useSaveCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (course: any) => {
      const payload = {
        ...course,
        slug: course.slug || `${slugify(course.title)}-${Math.random().toString(36).slice(2, 8)}`,
      };
      if (course.id) {
        const { error } = await supabase.from("courses").update(payload).eq("id", course.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useSaveModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mod: any) => {
      if (mod.id) {
        const { error } = await supabase.from("course_modules").update(mod).eq("id", mod.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("course_modules").insert(mod);
        if (error) throw error;
      }
    },
    onSuccess: (_d, vars: any) => {
      qc.invalidateQueries({ queryKey: ["admin-course-modules", vars.course_id] });
      toast.success("Module saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; courseId: string }) => {
      const { error } = await supabase.from("course_modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-course-modules", vars.courseId] });
      toast.success("Module deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};