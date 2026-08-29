import { Check, Clock, X, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type Status =
  | "proposed"
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "declined";

interface Props {
  status: Status | string;
  className?: string;
  /** Compact horizontal layout (default true) */
  compact?: boolean;
}

interface Step {
  key: "proposed" | "decision" | "open";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Visual timeline for a session: Proposed → Confirmed/Declined → Open.
 * Pure presentation; safe to drop into any card.
 */
export default function SessionStatusTimeline({ status, className, compact = true }: Props) {
  const declined = status === "cancelled" || status === "declined";
  const confirmed = status === "confirmed" || status === "in_progress" || status === "completed";
  const proposed = status === "proposed" || status === "pending";

  const steps: Step[] = [
    { key: "proposed", label: "Proposed", icon: Clock },
    {
      key: "decision",
      label: declined ? "Declined" : "Confirmed",
      icon: declined ? X : Check,
    },
    { key: "open", label: "Open", icon: Video },
  ];

  // Determine step states
  const stepState = (key: Step["key"]): "done" | "current" | "todo" | "error" => {
    if (key === "proposed") {
      if (proposed) return "current";
      return "done";
    }
    if (key === "decision") {
      if (declined) return "error";
      if (confirmed) return "done";
      return "todo";
    }
    // open
    if (status === "in_progress") return "current";
    if (status === "completed") return "done";
    if (confirmed) return "current";
    return "todo";
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs",
        compact ? "" : "gap-3 text-sm",
        className,
      )}
      aria-label="Session status timeline"
    >
      {steps.map((step, i) => {
        const state = stepState(step.key);
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2 py-1 transition-colors",
                state === "done" && "border-primary/40 bg-primary/10 text-primary",
                state === "current" && "border-primary bg-primary text-primary-foreground",
                state === "error" && "border-destructive/40 bg-destructive/10 text-destructive",
                state === "todo" && "border-border text-muted-foreground bg-muted/20",
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="font-medium">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-4 sm:w-6",
                  state === "done" || state === "current"
                    ? "bg-primary/40"
                    : state === "error"
                    ? "bg-destructive/40"
                    : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
