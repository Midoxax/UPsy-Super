import { Link } from "@/lib/router-compat";
import { motion } from "framer-motion";
import {
  ArrowRight, Activity, Network, ShieldAlert, Cpu, Radio, Sparkles,
} from "lucide-react";
import "../ops-theme.css";
import { HeroField } from "../components/HeroField";

const modules = [
  { icon: Network, title: "Dynamic SOP Engine", desc: "Generate operational protocols from event context. Phases, tasks, dependencies, escalation paths." },
  { icon: Activity, title: "Realtime Command Center", desc: "Single-screen tactical view. Live task pulses. Cross-operator awareness." },
  { icon: Cpu, title: "AI Operations Director", desc: "Claude-powered orchestration. Rewires protocols on demand. Knows your event context." },
  { icon: ShieldAlert, title: "Psychological Safety Layer", desc: "Sensitivity flags, calm-room protocols, escalation chains baked into every SOP." },
];

export const OpsLanding = () => {
  return (
    <div className="ops-theme min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="relative h-screen flex flex-col">
        <HeroField />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(var(--ops-bg))]" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md border border-[hsl(var(--ops-accent)/0.5)] bg-[hsl(var(--ops-accent)/0.08)] flex items-center justify-center">
              <Radio className="h-3.5 w-3.5 ops-accent ops-pulse" />
            </div>
            <span className="ops-mono text-[10px] tracking-[0.3em] text-white/40">U.PSY //</span>
            <span className="ops-display text-2xl">UPSY <span className="ops-accent ops-glow">OPS</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="ops-btn ops-btn-ghost">U.Psy site</Link>
            <Link to="/ops/lsspm/command" className="ops-btn">Enter Command <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>

        {/* Centered headline */}
        <div className="relative z-10 flex-1 flex items-center px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="ops-mono text-xs tracking-[0.3em] ops-accent mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(var(--ops-accent)/0.35)] bg-[hsl(var(--ops-accent)/0.06)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ops-accent))] ops-pulse" />
              OPERATIONAL NERVOUS SYSTEM · v1.0 · ONLINE
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="ops-display text-6xl md:text-7xl leading-[1.05] mt-6"
            >
              The operating system<br />
              for <span className="ops-accent ops-glow">institutional operations.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-6 text-lg text-white/60 max-w-xl"
            >
              AI-orchestrated workflows. Realtime accountability. Psychological safety as infrastructure.
              Built for federations, universities, NGOs, and clinics operating inside U.Psy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex gap-4"
            >
              <Link to="/ops/lsspm/command" className="ops-btn">Enter Command Center <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/ops/lsspm/events/new" className="ops-btn ops-btn-ghost">
                <Sparkles className="h-4 w-4" /> Generate Protocol
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Live KPIs strip */}
        <div className="relative z-10 border-t border-white/5 px-8 py-5 ops-mono text-xs grid grid-cols-2 md:grid-cols-4 gap-6 bg-[hsl(var(--ops-bg)/0.5)] backdrop-blur-sm">
          {[
            ["TENANTS ONLINE", "12", true],
            ["ACTIVE OPS", "47", true],
            ["AI INVOCATIONS / DAY", "2,184", false],
            ["UPTIME", "99.97%", false],
          ].map(([k, v, live]) => (
            <motion.div
              key={k as string}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            >
              <div className="text-white/30 flex items-center gap-1.5">
                {live ? <span className="h-1 w-1 rounded-full bg-[hsl(var(--ops-accent))] ops-pulse" /> : null}
                {k}
              </div>
              <div className="ops-accent text-lg mt-1 ops-display">{v}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Module grid */}
      <section className="px-8 py-24 max-w-6xl mx-auto">
        <div className="ops-mono text-xs tracking-[0.3em] text-white/40 mb-4">/ CAPABILITIES</div>
        <h2 className="ops-display text-4xl max-w-2xl">An infrastructure layer, not another dashboard.</h2>
        <div className="grid md:grid-cols-2 gap-5 mt-12">
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="ops-glass ops-glass-hover p-7"
            >
              <m.icon className="h-6 w-6 ops-accent" />
              <div className="ops-display text-2xl mt-4">{m.title}</div>
              <p className="text-white/55 mt-3 text-sm leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-8 py-6 ops-mono text-xs text-white/30 flex justify-between">
        <div>U.PSY // UPSY OPS</div>
        <div>SECURE · TENANT-ISOLATED · MOROCCO LAW 09-08</div>
      </footer>
    </div>
  );
};

export default OpsLanding;