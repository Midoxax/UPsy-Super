import { Skeleton } from "@/components/ui/skeleton";

export const PsychologistCardSkeleton = () => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4 bg-muted" />
          <Skeleton className="h-4 w-1/2 bg-muted" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-5 w-20 bg-muted" />
        <Skeleton className="h-5 w-24 bg-muted" />
      </div>
      <Skeleton className="h-4 w-2/3 bg-muted" />
      <Skeleton className="h-4 w-1/2 bg-muted" />
      <Skeleton className="h-10 w-full bg-muted" />
    </div>
  );
};
