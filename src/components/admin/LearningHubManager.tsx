import { useState } from "react";
import { useAdminCourses } from "@/hooks/admin/useAdminCourses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import CourseEditDrawer from "./CourseEditDrawer";
import { cn } from "@/lib/utils";

const PATH_STYLE: Record<string, string> = {
  "mental-health": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "performance": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "clinical-cpd": "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export default function LearningHubManager() {
  const { data: courses = [], isLoading, isError, error, refetch, isFetching } = useAdminCourses();
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pathFilter, setPathFilter] = useState<string>("all");

  const filtered = courses.filter((c: any) => {
    if (pathFilter !== "all" && c.learning_path !== pathFilter) return false;
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses…" className="pl-9 bg-surface" />
        </div>
        <div className="flex gap-1">
          {["all", "mental-health", "performance", "clinical-cpd"].map((p) => (
            <button
              key={p}
              onClick={() => setPathFilter(p)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-all capitalize",
                pathFilter === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {p === "all" ? "All paths" : p.replace("-", " ")}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New course
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Loading courses…</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Couldn't load courses</h3>
          </div>
          <p className="text-xs text-muted-foreground break-words">
            {(error as Error)?.message ?? "Unknown error. Check your connection or RLS policies."}
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isFetching && "animate-spin")} />
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl">
          <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No courses yet. Create your first course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c: any) => (
            <button
              key={c.id}
              onClick={() => { setEditing(c); setOpen(true); }}
              className="text-left rounded-2xl border border-border bg-surface hover:border-primary/40 transition-colors p-4 space-y-2"
            >
              <div className="flex justify-between gap-2">
                <h3 className="font-semibold text-sm">{c.title}</h3>
                <Badge className={cn("text-[10px] border", PATH_STYLE[c.learning_path] ?? "")}>{c.learning_path}</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{c.description ?? "No description"}</p>
              <div className="flex gap-2 items-center text-[11px] text-muted-foreground pt-1">
                <span>{c.difficulty_level}</span>·
                <span>{c.duration_hours ?? 0}h</span>·
                <Badge variant={c.is_published ? "default" : "secondary"} className="text-[10px]">
                  {c.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      <CourseEditDrawer course={editing} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}