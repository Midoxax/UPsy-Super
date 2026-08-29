import type { OpsTaskState } from "../hooks/useOps";

const META: Record<OpsTaskState, { label: string; cls: string }> = {
  pending:   { label: "PENDING",   cls: "border-white/20 text-white/50" },
  active:    { label: "ACTIVE",    cls: "border-[hsl(var(--ops-accent)/0.5)] text-[hsl(var(--ops-accent))] ops-pulse" },
  blocked:   { label: "BLOCKED",   cls: "border-yellow-500/40 text-yellow-300" },
  delayed:   { label: "DELAYED",   cls: "border-orange-500/40 text-orange-300" },
  escalated: { label: "ESCALATED", cls: "border-red-500/50 text-red-300 ops-pulse" },
  validated: { label: "VALIDATED", cls: "border-emerald-500/40 text-emerald-300" },
  completed: { label: "DONE",      cls: "border-emerald-500/30 text-emerald-200/70" },
  archived:  { label: "ARCHIVED",  cls: "border-white/10 text-white/30" },
};

export const StateBadge = ({ state }: { state: OpsTaskState }) => {
  const m = META[state];
  return (
    <span className={`ops-mono inline-flex items-center px-2 py-[3px] rounded-sm border text-[10px] tracking-[0.12em] ${m.cls}`}>
      {m.label}
    </span>
  );
};

export default StateBadge;