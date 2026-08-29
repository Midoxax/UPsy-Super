import type { ComponentType } from "react";
import { useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import { useOpsWorkspaces, useOpsEvents } from "../hooks/useOps";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Activity, Calendar, Clock, Users, Target, ChevronRight
} from "lucide-react";

const STATUS_META: Record<string, { label: string; color: string; glow: string }> = {
  draft:     { label: "DRAFT",     color: "text-white/50",     glow: "border-white/15" },
  planning:  { label: "PLANNING",  color: "text-cyan-300",     glow: "border-cyan-400/40" },
  active:    { label: "ACTIVE",    color: "text-emerald-300",  glow: "border-emerald-400/50" },
  completed: { label: "COMPLETED", color: "text-blue-300",     glow: "border-blue-400/40" },
  archived:  { label: "ARCHIVED",  color: "text-white/30",     glow: "border-white/10" },
};

const TYPE_ICON: Record<string, ComponentType<{ className?: string }>> = {
  trauma_workshop: Target,
  national_conference: Users,
  athletic_camp: Activity,
  corporate_offsite: Users,
  training_program: Target,
  public_lecture: Users,
  clinical_supervision: Target,
  humanitarian_mission: Activity,
};

export const Events = () => {
  const { workspace: slug } = useParams<{ workspace: string }>();
  const { current } = useOpsWorkspaces(slug);
  const { events, loading } = useOpsEvents(current?.id);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? events : events.filter(e => e.status === filter);
  const counts = {
    all: events.length,
    active: events.filter(e => e.status === "active").length,
    planning: events.filter(e => e.status === "planning").length,
    draft: events.filter(e => e.status === "draft").length,
    completed: events.filter(e => e.status === "completed").length,
  };

  const filters = [
    { key: "all", label: "ALL OPS" },
    { key: "active", label: "ACTIVE" },
    { key: "planning", label: "PLANNING" },
    { key: "draft", label: "DRAFT" },
    { key: "completed", label: "DONE" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <div className="ops-mono text-xs tracking-[0.3em] text-white/40">/ OPERATIONS REGISTRY</div>
          <h1 className="ops-display text-4xl mt-1">Mission Control</h1>
        </div>
        <Link to={`/ops/${slug}/events/new`} className="ops-btn">
          <Plus className="h-4 w-4" /> New Protocol
        </Link>
      </motion.header>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex gap-2 mb-8 flex-wrap"
      >
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-[11px] ops-mono tracking-[0.1em] border transition-all duration-200 ${
              filter === f.key
                ? "bg-[hsl(var(--ops-accent)/0.12)] border-[hsl(var(--ops-accent)/0.5)] text-[hsl(var(--ops-accent))]"
                : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
            }`}
          >
            {f.label} · {counts[f.key as keyof typeof counts]}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="ops-glass p-12 text-center">
          <div className="ops-mono text-xs text-white/40 animate-pulse">INITIALIZING DATA STREAM…</div>
        </div>
      ) : events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ops-glass p-16 text-center"
        >
          <Activity className="h-8 w-8 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm mb-2">No operations in this workspace.</p>
          <p className="text-white/30 text-xs ops-mono mb-6">Generate a protocol to begin the mission.</p>
          <Link to={`/ops/${slug}/events/new`} className="ops-btn">Generate first protocol</Link>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((e, i) => {
              const meta = STATUS_META[e.status] ?? STATUS_META.draft;
              const Icon = TYPE_ICON[e.event_type] ?? Target;
              const intake = (e.intake ?? {}) as Record<string, any>;
              const participants = intake.participants ?? "—";
              const duration = intake.duration_days ?? "—";
              const city = intake.city ?? "—";
              const isActive = e.status === "active";

              return (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link
                    to={`/ops/${slug}/events/${e.id}`}
                    className={`ops-glass ops-glass-hover p-6 block relative overflow-hidden group`}
                  >
                    {/* Status glow border */}
                    <div className={`absolute inset-0 rounded-[14px] border ${meta.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                    
                    {/* Live pulse for active events */}
                    {isActive && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ops-pulse" />
                        <span className="ops-mono text-[9px] tracking-[0.15em] text-emerald-300/80">LIVE</span>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-white/40" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`ops-mono text-[9px] tracking-[0.15em] px-1.5 py-0.5 rounded-sm border ${meta.glow} ${meta.color}`}>
                            {meta.label}
                          </span>
                          <span className="ops-mono text-[10px] text-white/30 uppercase">{e.event_type.replace(/_/g, " ")}</span>
                        </div>
                        <h3 className="ops-display text-xl text-white/90 truncate group-hover:text-[hsl(var(--ops-accent))] transition-colors">
                          {e.title}
                        </h3>
                      </div>
                    </div>

                    {/* Meta strip */}
                    <div className="mt-5 flex items-center gap-5 ops-mono text-[10px] text-white/35">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(e.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {participants}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {duration}d
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Target className="h-3 w-3" />
                        {city}
                      </span>
                    </div>

                    {/* Arrow hint */}
                    <div className="mt-4 flex items-center gap-1 text-[10px] ops-mono text-white/20 group-hover:text-[hsl(var(--ops-accent))]/60 transition-colors">
                      <span>OPEN PROTOCOL</span>
                      <ChevronRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Events;
