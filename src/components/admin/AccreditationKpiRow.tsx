import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export type KpiFilter = "all" | "pending" | "approved" | "rejected" | "failed";

interface Props {
  counts: { pending: number; approved: number; rejected: number; failed: number };
  active: KpiFilter;
  onChange: (k: KpiFilter) => void;
}

const items: Array<{ key: KpiFilter; label: string; icon: any; tone: string }> = [
  { key: "pending",  label: "Pending",            icon: Clock,         tone: "text-amber-500 border-amber-500/30 bg-amber-500/5" },
  { key: "approved", label: "Approved",           icon: CheckCircle2,  tone: "text-green-500 border-green-500/30 bg-green-500/5" },
  { key: "rejected", label: "Rejected",           icon: XCircle,       tone: "text-red-500 border-red-500/30 bg-red-500/5" },
  { key: "failed",   label: "Provisioning fails", icon: AlertTriangle, tone: "text-orange-500 border-orange-500/30 bg-orange-500/5" },
];

export const AccreditationKpiRow = ({ counts, active, onChange }: Props) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {items.map(({ key, label, icon: Icon, tone }) => {
      const isActive = active === key;
      const value = counts[key as keyof typeof counts] ?? 0;
      return (
        <button
          key={key}
          onClick={() => onChange(isActive ? "all" : key)}
          className={cn(
            "text-left p-4 rounded-xl border transition-all",
            isActive ? "ring-2 ring-primary border-primary bg-primary/5" : "border-border hover:border-primary/40",
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <div className={cn("p-1.5 rounded-md border", tone)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </button>
      );
    })}
  </div>
);

export default AccreditationKpiRow;