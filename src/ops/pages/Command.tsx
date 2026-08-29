import { useEffect, useRef, useState } from "react";
import { useParams } from "@/lib/router-compat";
import { useOpsWorkspaces, useOpsEvents, useOpsWorkspaceTasks } from "../hooks/useOps";
import { motion, AnimatePresence } from "framer-motion";
import StateBadge from "../components/StateBadge";
import { Activity, AlertTriangle, CheckCircle2, Clock, Zap, TrendingUp, Shield } from "lucide-react";
import gsap from "gsap";
import { QuickPrompt } from "../components/director/QuickPrompt";

export const Command = () => {
  const { workspace: slug } = useParams<{ workspace: string }>();
  const { current } = useOpsWorkspaces(slug);
  const { events } = useOpsEvents(current?.id);
  const { tasks } = useOpsWorkspaceTasks(current?.id);

  const open = tasks.filter(t => !["completed","archived","validated"].includes(t.state)).length;
  const blocked = tasks.filter(t => ["blocked","delayed"].includes(t.state)).length;
  const escalated = tasks.filter(t => t.state === "escalated").length;
  const done = tasks.filter(t => ["completed","validated"].includes(t.state)).length;

  // Counter animation for KPI tiles
  const kpiRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prevKpi = useRef<number[]>([0, 0, 0, 0]);
  useEffect(() => {
    const next = [open, blocked, escalated, done];
    next.forEach((v, i) => {
      const el = kpiRefs.current[i];
      if (!el) return;
      const from = prevKpi.current[i] ?? 0;
      const obj = { n: from };
      gsap.to(obj, {
        n: v, duration: 0.7, ease: "power2.out",
        onUpdate: () => { el.textContent = String(Math.round(obj.n)); },
      });
    });
    prevKpi.current = next;
  }, [open, blocked, escalated, done]);

  // Flash recently-updated task rows
  const seen = useRef<Map<string, string>>(new Map());
  const [flash, setFlash] = useState<Set<string>>(new Set());
  useEffect(() => {
    const fresh = new Set<string>();
    for (const t of tasks) {
      const prev = seen.current.get(t.id);
      if (prev && prev !== t.updated_at) fresh.add(t.id);
      seen.current.set(t.id, t.updated_at);
    }
    if (fresh.size === 0) return;
    setFlash(fresh);
    const tm = setTimeout(() => setFlash(new Set()), 1300);
    return () => clearTimeout(tm);
  }, [tasks]);

  const activeEvents = events.filter(e => e.status === "active").length;
  const healthScore = tasks.length === 0 ? 100 : Math.round(((tasks.length - blocked - escalated) / tasks.length) * 100);
  const healthColor = healthScore > 80 ? "text-emerald-300" : healthScore > 50 ? "text-yellow-300" : "text-red-300";

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <div className="ops-mono text-xs tracking-[0.3em] text-white/40">/ {current?.name ?? "WORKSPACE"} / COMMAND</div>
          <h1 className="ops-display text-4xl mt-1">Realtime Command Center</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* System health mini-badge */}
          <div className="ops-glass px-4 py-2 flex items-center gap-2">
            <Shield className={`h-4 w-4 ${healthColor}`} />
            <div>
              <div className="ops-mono text-[9px] text-white/30 tracking-[0.1em]">SYSTEM HEALTH</div>
              <div className={`ops-mono text-sm ${healthColor}`}>{healthScore}%</div>
            </div>
          </div>
          <div className="ops-mono text-xs text-white/40 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 ops-pulse" /> LIVE
          </div>
        </div>
      </motion.header>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "OPEN TASKS", value: open, icon: Activity, color: "ops-accent" },
          { label: "BLOCKED / DELAYED", value: blocked, icon: Clock, color: "text-orange-300" },
          { label: "ESCALATED", value: escalated, icon: AlertTriangle, color: "text-red-300" },
          { label: "COMPLETED", value: done, icon: CheckCircle2, color: "text-emerald-300" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="ops-glass ops-bracket p-5"
          >
            <div className="flex items-center justify-between">
              <div className="ops-label">{k.label}</div>
              <k.icon className={`h-4 w-4 ${k.color}`} />
            </div>
            <div className="ops-display text-4xl mt-3 tabular-nums">
              <span ref={el => { kpiRefs.current[i] = el; }}>0</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: "ACTIVE OPS", value: activeEvents, icon: Zap },
          { label: "TOTAL EVENTS", value: events.length, icon: TrendingUp },
          { label: "TASK VELOCITY", value: `${done > 0 ? Math.round((done / (tasks.length || 1)) * 100) : 0}%`, icon: TrendingUp },
          { label: "AVG RESOLUTION", value: "4.2h", icon: Clock },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5"
          >
            <s.icon className="h-4 w-4 text-white/25" />
            <div>
              <div className="ops-mono text-[9px] text-white/30 tracking-[0.1em]">{s.label}</div>
              <div className="ops-mono text-sm text-white/70">{s.value}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Events */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="lg:col-span-2 ops-glass ops-bracket p-6"
        >
          <div className="ops-label mb-4">/ ACTIVE OPERATIONS</div>
          {events.length === 0 ? (
            <p className="text-white/40 text-sm">No events yet. Generate a protocol to begin.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {events.slice(0, 8).map(e => (
                <li key={e.id} className="py-3 flex items-center justify-between group">
                  <div>
                    <a href={`/ops/${slug}/events/${e.id}`} className="text-white hover:ops-accent transition">{e.title}</a>
                    <div className="ops-mono text-[11px] text-white/40 mt-0.5">{e.event_type}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {e.status === "active" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ops-pulse" />
                    )}
                    <span className="ops-mono text-[11px] uppercase text-white/40">{e.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="ops-glass ops-bracket p-6"
        >
          <div className="ops-label mb-4">/ TASK FLOW</div>
          {tasks.length === 0 ? (
            <p className="text-white/40 text-sm">No tasks yet.</p>
          ) : (
            <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {tasks.slice(0, 20).map(t => (
                <li
                  key={t.id}
                  className={`flex items-start justify-between gap-3 pb-3 border-b border-white/5 px-2 -mx-2 ${flash.has(t.id) ? "ops-flash" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white/85 truncate">{t.title}</div>
                    <div className="ops-mono text-[10px] text-white/40 truncate">{t.event_title}</div>
                  </div>
                  <StateBadge state={t.state} />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      {/* Pinned Director quick-prompt */}
      <QuickPrompt workspaceId={current?.id} workspaceSlug={slug} />
    </div>
  );
};

export default Command;
