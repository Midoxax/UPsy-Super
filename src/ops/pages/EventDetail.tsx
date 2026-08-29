import { useParams } from "@/lib/router-compat";
import { useOpsEvent, updateTaskState, type OpsTaskState } from "../hooks/useOps";
import StateBadge from "../components/StateBadge";
import { motion } from "framer-motion";
import { ShieldAlert, ChevronLeft, CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";
import { Link } from "@/lib/router-compat";

const NEXT: Partial<Record<OpsTaskState, OpsTaskState>> = {
  pending: "active", active: "completed", blocked: "active", delayed: "active", escalated: "active",
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  draft:     { label: "DRAFT",     color: "text-white/50" },
  planning:  { label: "PLANNING",  color: "text-cyan-300" },
  active:    { label: "ACTIVE",    color: "text-emerald-300" },
  completed: { label: "COMPLETED", color: "text-blue-300" },
  archived:  { label: "ARCHIVED",  color: "text-white/30" },
};

export const EventDetail = () => {
  const { workspace: slug, eventId } = useParams<{ workspace: string; eventId: string }>();
  const { event, phases, tasks, loading } = useOpsEvent(eventId);

  if (loading) return (
    <div className="p-8">
      <div className="ops-mono text-xs text-white/40 animate-pulse">LOADING OPERATIONAL DATA…</div>
    </div>
  );
  if (!event) return (
    <div className="p-8">
      <div className="ops-mono text-xs text-white/40">EVENT NOT FOUND IN REGISTRY.</div>
    </div>
  );

  const statusMeta = STATUS_META[event.status] ?? STATUS_META.draft;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => ["completed","validated"].includes(t.state)).length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const blockedCount = tasks.filter(t => ["blocked","delayed","escalated"].includes(t.state)).length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to={`/ops/${slug}/events`} className="inline-flex items-center gap-1 ops-mono text-[11px] text-white/30 hover:text-white/60 transition mb-6">
          <ChevronLeft className="h-3 w-3" /> BACK TO REGISTRY
        </Link>
      </motion.div>

      {/* Event header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="ops-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">
            {event.event_type.replace(/_/g, " ")}
          </span>
          <span className={`ops-mono text-[9px] tracking-[0.15em] px-2 py-0.5 rounded-sm border border-white/10 ${statusMeta.color}`}>
            {statusMeta.label}
          </span>
        </div>
        <h1 className="ops-display text-4xl">{event.title}</h1>
      </motion.header>

      {/* Progress dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="ops-glass p-6 mb-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Progress ring */}
          <div className="col-span-2 md:col-span-1">
            <div className="ops-label mb-2">OVERALL PROGRESS</div>
            <div className="relative w-20 h-20 mx-auto md:mx-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path
                  className="text-[hsl(var(--ops-accent))]"
                  strokeDasharray={`${progress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.8s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="ops-display text-lg">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="ops-label">TASKS</div>
            <div className="ops-display text-3xl mt-1">{totalTasks}</div>
            <div className="ops-mono text-[10px] text-white/30 mt-1">{completedTasks} COMPLETED</div>
          </div>
          <div>
            <div className="ops-label">PHASES</div>
            <div className="ops-display text-3xl mt-1">{phases.length}</div>
            <div className="ops-mono text-[10px] text-white/30 mt-1">OPERATIONAL SEGMENTS</div>
          </div>
          <div>
            <div className="ops-label">BLOCKED</div>
            <div className={`ops-display text-3xl mt-1 ${blockedCount > 0 ? "text-orange-300" : ""}`}>{blockedCount}</div>
            <div className="ops-mono text-[10px] text-white/30 mt-1">REQUIRES ATTENTION</div>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="mt-6">
          <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--ops-accent))] to-[hsl(var(--ops-accent)/0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Phases */}
      <div className="space-y-6">
        {phases.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ops-glass p-8 text-center"
          >
            <Circle className="h-6 w-6 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No phases generated yet.</p>
          </motion.div>
        )}
        {phases.map((p, i) => {
          const phaseTasks = tasks.filter(t => t.phase_id === p.id);
          const phaseDone = phaseTasks.filter(t => ["completed","validated"].includes(t.state)).length;
          const phaseProgress = phaseTasks.length === 0 ? 0 : Math.round((phaseDone / phaseTasks.length) * 100);

          return (
            <motion.section
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              className="ops-glass p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="ops-mono text-[10px] tracking-[0.3em] text-[hsl(var(--ops-accent))]">
                      PHASE {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="ops-mono text-[10px] text-white/30">
                      {phaseDone}/{phaseTasks.length} TASKS
                    </span>
                  </div>
                  <h2 className="ops-display text-2xl">{p.title}</h2>
                  {p.description && <p className="text-white/50 text-sm mt-2 max-w-2xl">{p.description}</p>}
                </div>
                {/* Mini progress */}
                <div className="hidden md:block w-24">
                  <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--ops-accent))]"
                      style={{ width: `${phaseProgress}%`, transition: "width 0.6s ease" }}
                    />
                  </div>
                  <div className="ops-mono text-[9px] text-white/30 mt-1 text-right">{phaseProgress}%</div>
                </div>
              </div>

              <ul className="divide-y divide-white/5">
                {phaseTasks.map(t => (
                  <li key={t.id} className="py-3 flex items-start justify-between gap-4 group">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/90 text-sm group-hover:text-white transition-colors">{t.title}</span>
                        {t.psych_safety_flag && (
                          <ShieldAlert className="h-3.5 w-3.5 text-orange-300" aria-label="Psychological safety flag" />
                        )}
                      </div>
                      <div className="ops-mono text-[10px] text-white/40 mt-1 flex gap-3 flex-wrap">
                        {t.owner_role && <span>OWNER · {t.owner_role}</span>}
                        {t.deadline && (
                          <span className={`flex items-center gap-1 ${new Date(t.deadline) < new Date() && t.state !== "completed" ? "text-red-300" : ""}`}>
                            <Clock className="h-2.5 w-2.5" />
                            DUE · {new Date(t.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {t.description && <p className="text-white/45 text-xs mt-1.5">{t.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StateBadge state={t.state} />
                      {NEXT[t.state] && (
                        <button
                          className="ops-btn ops-btn-ghost text-[10px] py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => updateTaskState(t.id, NEXT[t.state]!)}
                        >
                          → {NEXT[t.state]}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
                {phaseTasks.length === 0 && (
                  <li className="py-4 text-white/20 text-xs ops-mono text-center">NO TASKS IN THIS PHASE</li>
                )}
              </ul>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
};

export default EventDetail;
