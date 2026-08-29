import type { ComponentType } from "react";
import { useParams } from "@/lib/router-compat";
import { useOpsWorkspaces, useOpsWorkspaceTasks, updateTaskState, type OpsTaskState } from "../hooks/useOps";
import StateBadge from "../components/StateBadge";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle2, Circle, Pause, ArrowUpCircle } from "lucide-react";

const COLUMNS: { key: OpsTaskState; label: string; icon: ComponentType<{ className?: string }>; accent: string }[] = [
  { key: "pending",   label: "PENDING",   icon: Circle,         accent: "border-white/15" },
  { key: "active",    label: "ACTIVE",    icon: ArrowUpCircle,  accent: "border-[hsl(var(--ops-accent)/0.5)]" },
  { key: "blocked",   label: "BLOCKED",   icon: Pause,          accent: "border-yellow-500/40" },
  { key: "escalated", label: "ESCALATED", icon: AlertTriangle,  accent: "border-red-500/50" },
  { key: "completed", label: "DONE",      icon: CheckCircle2,   accent: "border-emerald-500/40" },
];

export const Tasks = () => {
  const { workspace: slug } = useParams<{ workspace: string }>();
  const { current } = useOpsWorkspaces(slug);
  const { tasks, loading } = useOpsWorkspaceTasks(current?.id);

  const total = tasks.length;
  const completed = tasks.filter(t => ["completed", "validated"].includes(t.state)).length;
  const blocked = tasks.filter(t => ["blocked", "delayed", "escalated"].includes(t.state)).length;

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="ops-mono text-xs tracking-[0.3em] text-white/40">/ ACCOUNTABILITY MATRIX</div>
        <div className="flex items-end justify-between mt-1">
          <h1 className="ops-display text-4xl">Task Control</h1>
          <div className="flex gap-6 ops-mono text-[11px] text-white/30">
            <span>TOTAL · <span className="text-white/60">{total}</span></span>
            <span>DONE · <span className="text-emerald-300/80">{completed}</span></span>
            <span>BLOCKED · <span className={blocked > 0 ? "text-orange-300" : "text-white/60"}>{blocked}</span></span>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="ops-mono text-xs text-white/40 animate-pulse">LOADING TASK MATRIX…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {COLUMNS.map((col, ci) => {
            const items = tasks.filter(t => t.state === col.key);
            const Icon = col.icon;

            return (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: ci * 0.06 }}
                className={`ops-glass p-4 min-h-[400px] flex flex-col ${col.accent} border-t-2 border-t-current`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${
                      col.key === "active" ? "text-[hsl(var(--ops-accent))]" :
                      col.key === "escalated" ? "text-red-300" :
                      col.key === "blocked" ? "text-yellow-300" :
                      col.key === "completed" ? "text-emerald-300" :
                      "text-white/40"
                    }`} />
                    <StateBadge state={col.key} />
                  </div>
                  <motion.span
                    key={items.length}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="ops-mono text-[11px] text-white/40"
                  >
                    {items.length}
                  </motion.span>
                </div>

                {/* Task cards */}
                <div className="space-y-2 flex-1">
                  {items.map((t, ti) => {
                    const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.state !== "completed";
                    
                    return (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: ti * 0.03 }}
                        className={`p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[hsl(var(--ops-accent)/0.3)] hover:bg-white/[0.04] transition-all duration-200 group ${
                          isOverdue ? "border-l-2 border-l-red-400/60" : ""
                        }`}
                      >
                        <div className="text-sm text-white/85 group-hover:text-white transition-colors">{t.title}</div>
                        <div className="ops-mono text-[10px] text-white/30 mt-1 flex items-center gap-1.5">
                          <span className="truncate">{t.event_title}</span>
                        </div>
                        {t.deadline && (
                          <div className={`ops-mono text-[9px] mt-1.5 flex items-center gap-1 ${isOverdue ? "text-red-300" : "text-white/25"}`}>
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(t.deadline).toLocaleDateString()}
                            {isOverdue && <span className="text-red-300/80">· OVERDUE</span>}
                          </div>
                        )}
                        {/* Action buttons */}
                        <div className="flex gap-1 mt-2 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
                          {col.key !== "completed" && col.key !== "escalated" && (
                            <button
                              className="text-[10px] px-2 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-300/80 hover:bg-emerald-500/20 transition"
                              onClick={() => updateTaskState(t.id, "completed")}
                            >
                              ✓ done
                            </button>
                          )}
                          {col.key === "active" && (
                            <button
                              className="text-[10px] px-2 py-0.5 rounded-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-300/80 hover:bg-yellow-500/20 transition"
                              onClick={() => updateTaskState(t.id, "blocked")}
                            >
                              blocked
                            </button>
                          )}
                          {col.key === "blocked" && (
                            <>
                              <button
                                className="text-[10px] px-2 py-0.5 rounded-sm bg-red-500/10 border border-red-500/20 text-red-300/80 hover:bg-red-500/20 transition"
                                onClick={() => updateTaskState(t.id, "escalated")}
                              >
                                escalate
                              </button>
                              <button
                                className="text-[10px] px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition"
                                onClick={() => updateTaskState(t.id, "active")}
                              >
                                resume
                              </button>
                            </>
                          )}
                          {col.key === "escalated" && (
                            <button
                              className="text-[10px] px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition"
                              onClick={() => updateTaskState(t.id, "active")}
                            >
                              resolve
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="text-white/15 text-xs ops-mono py-8 text-center flex flex-col items-center gap-2">
                      <Icon className="h-5 w-5 opacity-30" />
                      EMPTY
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;
