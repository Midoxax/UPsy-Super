import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "@/lib/router-compat";
import { useOpsWorkspaces } from "../hooks/useOps";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Sparkles, ArrowRight, ArrowLeft, Check, Target,
  Users, MapPin, Calendar, DollarSign, ShieldAlert, Brain,
  Radio, Activity, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const EVENT_TYPES = [
  { id: "trauma_workshop", label: "Trauma workshop" },
  { id: "national_conference", label: "National conference" },
  { id: "athletic_camp", label: "Athletic camp" },
  { id: "corporate_offsite", label: "Corporate offsite" },
  { id: "training_program", label: "Training program" },
  { id: "public_lecture", label: "Public lecture" },
  { id: "clinical_supervision", label: "Clinical supervision" },
  { id: "humanitarian_mission", label: "Humanitarian mission" },
];

const RISK_LEVELS = [
  { id: "low", label: "Low", desc: "Routine ops, established team", color: "ops-ok" },
  { id: "medium", label: "Medium", desc: "Moderate complexity", color: "ops-warn" },
  { id: "high", label: "High", desc: "Elevated exposure or sensitivity", color: "ops-warn" },
  { id: "critical", label: "Critical", desc: "Crisis / trauma-acute context", color: "ops-danger" },
] as const;

const PSYCH_LEVELS = ["low", "medium", "high", "trauma-informed"] as const;

const FLAGS = [
  { k: "overnight", label: "Overnight stay" },
  { k: "media_exposure", label: "Media exposure" },
  { k: "vip_presence", label: "VIP presence" },
  { k: "public_event", label: "Public event" },
] as const;

const STEPS = [
  { id: 0, label: "Mission",  icon: Target,       desc: "Define operation" },
  { id: 1, label: "Scope",    icon: Users,        desc: "Logistics & scale" },
  { id: 2, label: "Risk",     icon: ShieldAlert,  desc: "Threat profile" },
  { id: 3, label: "Launch",   icon: Sparkles,     desc: "Generate protocol" },
] as const;

export const NewEvent = () => {
  const { workspace: slug } = useParams<{ workspace: string }>();
  const { current } = useOpsWorkspaces(slug);
  const { user } = useAuth();
  const nav = useNavigate();

  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [genStage, setGenStage] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    event_type: "trauma_workshop",
    participants: 30,
    duration_days: 1,
    budget_mad: 50000,
    city: "Casablanca",
    overnight: false,
    media_exposure: false,
    vip_presence: false,
    public_event: false,
    psych_sensitivity: "high",
    risk_level: "medium",
    notes: "",
  });

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  // Live risk score
  const riskScore = useMemo(() => {
    let s = 0;
    s += { low: 10, medium: 35, high: 65, critical: 90 }[form.risk_level as "low"] ?? 30;
    s += { low: 0, medium: 5, high: 10, "trauma-informed": 15 }[form.psych_sensitivity as "low"] ?? 0;
    if (form.media_exposure) s += 6;
    if (form.vip_presence) s += 6;
    if (form.public_event) s += 4;
    if (form.overnight) s += 3;
    if (form.participants > 100) s += 5;
    return Math.min(100, s);
  }, [form]);

  const riskTone =
    riskScore >= 75 ? { color: "var(--ops-danger)", label: "CRITICAL" } :
    riskScore >= 50 ? { color: "var(--ops-warn)",   label: "ELEVATED" } :
    riskScore >= 25 ? { color: "var(--ops-accent)", label: "MODERATE" } :
                      { color: "var(--ops-ok)",     label: "NOMINAL" };

  // Cinematic generate phases
  useEffect(() => {
    if (!busy) { setGenStage(0); return; }
    const phases = ["Parsing intake", "Mapping risk vectors", "Synthesizing phases", "Allocating roles", "Compiling protocol"];
    let i = 0;
    const id = setInterval(() => { i = (i + 1) % phases.length; setGenStage(i); }, 900);
    return () => clearInterval(id);
  }, [busy]);
  const genPhases = ["PARSING INTAKE", "MAPPING RISK VECTORS", "SYNTHESIZING PHASES", "ALLOCATING ROLES", "COMPILING PROTOCOL"];

  const generate = async () => {
    if (!current || !user) return;
    setBusy(true); setErr(null);
    try {
      const { data, error } = await supabase.functions.invoke("ops-generate-protocol", {
        body: { workspace_id: current.id, intake: form },
      });
      if (error) throw error;
      const payload = data as any;
      if (payload?.error === 'rate_limited' || payload?.error === 'payment_required') {
        throw new Error(payload.message);
      }
      const eventId = payload?.event_id;
      if (!eventId) throw new Error("No event returned");
      nav(`/ops/${slug}/events/${eventId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Generation failed");
      setBusy(false);
    }
  };

  const canAdvance =
    step === 0 ? form.title.trim().length > 2 :
    step === 1 ? form.participants > 0 && form.duration_days > 0 :
    step === 2 ? true : true;

  return (
    <div className="relative px-6 py-6 max-w-6xl mx-auto">
      <div className="ops-mono text-[10px] tracking-[0.35em] text-white/40 flex items-center gap-2">
        <Radio className="h-3 w-3 ops-accent" /> / SOP ENGINE · INTAKE PROTOCOL
      </div>
      <h1 className="ops-display text-4xl mt-2">Initiate Operation</h1>
      <p className="text-white/50 mt-2 max-w-xl text-sm">
        Calibrate mission parameters. The Director synthesizes phases, tasks, dependencies, and escalation paths.
      </p>

      {/* PROGRESS RAIL */}
      <div className="mt-8 relative">
        <div className="absolute top-5 left-0 right-0 h-px bg-[hsl(var(--ops-border))]" />
        <motion.div
          className="absolute top-5 left-0 h-px bg-[hsl(var(--ops-accent))]"
          initial={false}
          animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{ boxShadow: "0 0 12px hsl(var(--ops-accent) / 0.7)" }}
        />
        <div className="relative grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => {
            const reached = i <= step;
            const active = i === step;
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className="flex flex-col items-center gap-2 text-center group"
              >
                <motion.div
                  animate={{
                    scale: active ? 1.1 : 1,
                    borderColor: reached ? "hsl(var(--ops-accent))" : "hsl(var(--ops-border))",
                  }}
                  className="h-10 w-10 rounded-full border-2 flex items-center justify-center"
                  style={{
                    background: reached ? "hsl(var(--ops-accent) / 0.15)" : "hsl(var(--ops-bg-elev))",
                    boxShadow: active ? "0 0 24px hsl(var(--ops-accent) / 0.45)" : undefined,
                  }}
                >
                  {i < step ? (
                    <Check className="h-4 w-4 ops-accent" />
                  ) : (
                    <Icon className={`h-4 w-4 ${reached ? "ops-accent" : "text-white/30"}`} />
                  )}
                </motion.div>
                <div>
                  <div className={`ops-mono text-[10px] tracking-[0.2em] ${reached ? "ops-accent" : "text-white/40"}`}>
                    {String(i + 1).padStart(2, "0")} · {s.label.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-white/30 mt-0.5">{s.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-8">
        <div className="ops-glass ops-bracket p-7 min-h-[420px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div className="space-y-5">
                  <SectionHead icon={Target} title="Mission identity" sub="What are we deploying?" />
                  <div>
                    <label className="ops-label">Operation title</label>
                    <input className="ops-input" autoFocus value={form.title} onChange={e => update("title", e.target.value)}
                      placeholder="e.g. LSSPM Trauma Recovery Workshop — Rabat" />
                  </div>
                  <div>
                    <label className="ops-label">Operation type</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {EVENT_TYPES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => update("event_type", t.id)}
                          className={`text-left p-3 rounded-lg border text-xs transition ${
                            form.event_type === t.id
                              ? "border-[hsl(var(--ops-accent))] bg-[hsl(var(--ops-accent)/0.1)] text-white"
                              : "border-[hsl(var(--ops-border))] text-white/60 hover:border-[hsl(var(--ops-accent)/0.5)]"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <SectionHead icon={Users} title="Scope & logistics" sub="Scale, location, schedule" />
                  <div className="grid grid-cols-2 gap-4">
                    <Field icon={MapPin} label="City">
                      <input className="ops-input" value={form.city} onChange={e => update("city", e.target.value)} />
                    </Field>
                    <Field icon={Users} label="Participants">
                      <input type="number" className="ops-input" value={form.participants} onChange={e => update("participants", +e.target.value)} />
                    </Field>
                    <Field icon={Calendar} label="Duration (days)">
                      <input type="number" className="ops-input" value={form.duration_days} onChange={e => update("duration_days", +e.target.value)} />
                    </Field>
                    <Field icon={DollarSign} label="Budget (MAD)">
                      <input type="number" className="ops-input" value={form.budget_mad} onChange={e => update("budget_mad", +e.target.value)} />
                    </Field>
                  </div>
                  <div>
                    <label className="ops-label">Operational flags</label>
                    <div className="grid grid-cols-2 gap-2">
                      {FLAGS.map(f => {
                        const on = (form as any)[f.k];
                        return (
                          <button
                            key={f.k}
                            onClick={() => update(f.k as any, !on as any)}
                            className={`flex items-center justify-between p-3 rounded-lg border text-sm transition ${
                              on
                                ? "border-[hsl(var(--ops-accent))] bg-[hsl(var(--ops-accent)/0.1)] text-white"
                                : "border-[hsl(var(--ops-border))] text-white/60 hover:border-[hsl(var(--ops-accent)/0.4)]"
                            }`}
                          >
                            <span>{f.label}</span>
                            <span className={`ops-mono text-[10px] ${on ? "ops-accent" : "text-white/30"}`}>
                              {on ? "● ENABLED" : "○ OFF"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <SectionHead icon={ShieldAlert} title="Risk profile" sub="Threat surface & psychological sensitivity" />
                  <div>
                    <label className="ops-label">Operational risk level</label>
                    <div className="grid grid-cols-4 gap-2">
                      {RISK_LEVELS.map(r => (
                        <button
                          key={r.id}
                          onClick={() => update("risk_level", r.id)}
                          className={`p-3 rounded-lg border text-left transition ${
                            form.risk_level === r.id
                              ? "border-[hsl(var(--ops-accent))] bg-[hsl(var(--ops-accent)/0.08)]"
                              : "border-[hsl(var(--ops-border))] hover:border-[hsl(var(--ops-accent)/0.4)]"
                          }`}
                        >
                          <div className="ops-mono text-[10px] tracking-[0.2em]" style={{ color: `hsl(var(--${r.color}))` }}>
                            {r.label.toUpperCase()}
                          </div>
                          <div className="text-[11px] text-white/50 mt-1">{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="ops-label">Psychological sensitivity</label>
                    <div className="grid grid-cols-4 gap-2">
                      {PSYCH_LEVELS.map(p => (
                        <button
                          key={p}
                          onClick={() => update("psych_sensitivity", p)}
                          className={`p-2.5 rounded-lg border text-xs transition ${
                            form.psych_sensitivity === p
                              ? "border-[hsl(var(--ops-accent))] bg-[hsl(var(--ops-accent)/0.1)] text-white"
                              : "border-[hsl(var(--ops-border))] text-white/60 hover:border-[hsl(var(--ops-accent)/0.4)]"
                          }`}
                        >
                          <Brain className="h-3.5 w-3.5 inline mr-1.5" />
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="ops-label">Operational notes</label>
                    <textarea className="ops-textarea" rows={3} value={form.notes} onChange={e => update("notes", e.target.value)}
                      placeholder="Context the Director should weigh — known stressors, stakeholders, prior incidents." />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <SectionHead icon={Sparkles} title="Final calibration" sub="Confirm and dispatch to Director" />

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Summary label="Title"        value={form.title || "—"} />
                    <Summary label="Type"         value={form.event_type.replace(/_/g, " ")} />
                    <Summary label="Location"     value={form.city} />
                    <Summary label="Participants" value={String(form.participants)} />
                    <Summary label="Duration"     value={`${form.duration_days} day(s)`} />
                    <Summary label="Budget"       value={`${form.budget_mad.toLocaleString()} MAD`} />
                    <Summary label="Risk"         value={form.risk_level} />
                    <Summary label="Sensitivity"  value={form.psych_sensitivity} />
                  </div>

                  {busy ? (
                    <div className="ops-glass p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[hsl(var(--ops-accent))] ops-pulse" />
                        <span className="ops-mono text-xs ops-accent tracking-[0.2em]">
                          {genPhases[genStage]}…
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-[hsl(var(--ops-border))] overflow-hidden">
                        <motion.div
                          className="h-full bg-[hsl(var(--ops-accent))]"
                          animate={{ width: `${((genStage + 1) / genPhases.length) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          style={{ boxShadow: "0 0 12px hsl(var(--ops-accent) / 0.8)" }}
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {genPhases.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 rounded-sm ${i <= genStage ? "bg-[hsl(var(--ops-accent))]" : "bg-white/10"}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="ops-glass p-4 flex items-start gap-3 text-xs text-white/60">
                      <Activity className="h-4 w-4 ops-accent shrink-0 mt-0.5" />
                      <span>
                        Director will synthesize phases, tasks, RACI assignments, and escalation triggers
                        within ~15 seconds.
                      </span>
                    </div>
                  )}

                  {err && (
                    <div className="flex items-center gap-2 text-red-300 text-xs ops-mono p-3 rounded-lg border border-red-500/30 bg-red-500/5">
                      <AlertTriangle className="h-3.5 w-3.5" /> {err}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* NAV */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/5">
            <button
              className="ops-btn ops-btn-ghost"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0 || busy}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                className="ops-btn"
                onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                disabled={!canAdvance}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                className="ops-btn"
                onClick={generate}
                disabled={busy || !form.title}
              >
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="h-4 w-4" /> Generate Protocol</>}
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR — Live risk gauge */}
        <div className="space-y-4">
          <div className="ops-glass ops-bracket p-5">
            <div className="ops-mono text-[10px] tracking-[0.25em] text-white/40 mb-3">
              / LIVE RISK SCORE
            </div>
            <RiskGauge score={riskScore} tone={riskTone} />
          </div>

          <div className="ops-glass ops-bracket p-5 space-y-3">
            <div className="ops-mono text-[10px] tracking-[0.25em] text-white/40">
              / INTAKE SUMMARY
            </div>
            <MiniRow label="TITLE"    value={form.title || "—"} />
            <MiniRow label="TYPE"     value={form.event_type.replace(/_/g, " ")} />
            <MiniRow label="CITY"     value={form.city} />
            <MiniRow label="SCALE"    value={`${form.participants} pax · ${form.duration_days}d`} />
            <MiniRow label="BUDGET"   value={`${form.budget_mad.toLocaleString()} MAD`} />
            <MiniRow label="FLAGS"    value={
              FLAGS.filter(f => (form as any)[f.k]).map(f => f.label).join(", ") || "none"
            } />
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHead = ({ icon: Icon, title, sub }: any) => (
  <div className="flex items-start gap-3 mb-2">
    <div className="h-10 w-10 rounded-lg border border-[hsl(var(--ops-accent)/0.4)] bg-[hsl(var(--ops-accent)/0.08)] flex items-center justify-center">
      <Icon className="h-4 w-4 ops-accent" />
    </div>
    <div>
      <div className="ops-display text-xl">{title}</div>
      <div className="text-xs text-white/40">{sub}</div>
    </div>
  </div>
);

const Field = ({ icon: Icon, label, children }: any) => (
  <div>
    <label className="ops-label flex items-center gap-1.5">
      <Icon className="h-3 w-3" /> {label}
    </label>
    {children}
  </div>
);

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div className="ops-glass p-3">
    <div className="ops-mono text-[9px] tracking-[0.25em] text-white/40">{label}</div>
    <div className="text-white/90 text-sm mt-1 capitalize truncate">{value}</div>
  </div>
);

const MiniRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="ops-mono text-[9px] tracking-[0.2em] text-white/35">{label}</div>
    <div className="text-xs text-white/80 capitalize truncate">{value}</div>
  </div>
);

const RiskGauge = ({ score, tone }: { score: number; tone: { color: string; label: string } }) => {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="rotate-[-90deg]">
        <circle cx="70" cy="70" r={r} stroke="hsl(var(--ops-border))" strokeWidth="6" fill="none" />
        <motion.circle
          cx="70" cy="70" r={r}
          stroke={`hsl(${tone.color})`}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px hsl(${tone.color} / 0.6))` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="ops-display text-3xl" style={{ color: `hsl(${tone.color})` }}>
          {score}
        </div>
        <div className="ops-mono text-[9px] tracking-[0.25em] text-white/40">SCORE / 100</div>
      </div>
      <div
        className="ops-mono text-[10px] tracking-[0.3em] mt-2 px-3 py-1 rounded-full border"
        style={{ color: `hsl(${tone.color})`, borderColor: `hsl(${tone.color} / 0.4)`, background: `hsl(${tone.color} / 0.08)` }}
      >
        {tone.label}
      </div>
    </div>
  );
};

export default NewEvent;