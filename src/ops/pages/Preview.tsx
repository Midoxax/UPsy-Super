import { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/router-compat";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Activity, Brain, Zap, Shield, Radio, Database, Cpu, Layers, Lock, Quote, Target, Compass, Flag, Mail, Phone, Globe, Linkedin, Instagram, Youtube } from "lucide-react";
import "./preview.css";

/**
 * UPSY OS — Cinematic prototype.
 * Scoped to /ops/preview. Cyan/black sovereign aesthetic per CSO spec.
 * CSS + Framer Motion only — no Three.js (memory constraint).
 */
export const Preview = () => {
  return (
    <div className="upsy-os">
      <NeuralField />
      <CursorSpotlight />
      <SectionRail />
      <NavBar />
      <Hero />
      <SignalFeed />
      <PositioningReveal />
      <ManifestoMarquee />
      <EcosystemMap />
      <ArchitectureStack />
      <ThreeModes />
      <CopilotShowcase />
      <OutcomeMetrics />
      <VoicesOfSystem />
      <RoadmapHorizon />
      <AccessTiers />
      <TrustSignals />
      <FinalCTA />
      <FooterStrip />
    </div>
  );
};

/* ─── Cursor spotlight (mouse-tracked radial glow) ──────────────────────── */
const CursorSpotlight = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e: MouseEvent) => {
      el.style.setProperty("--mx", `${e.clientX}px`);
      el.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return <div ref={ref} className="uos-spotlight" aria-hidden />;
};

/* ─── Left section rail (scroll progress index) ─────────────────────────── */
const RAIL: { label: string; sel: string }[] = [
  { label: "HERO",      sel: ".uos-hero" },
  { label: "SIGNAL",    sel: ".uos-signal" },
  { label: "POSITION",  sel: "#positioning" },
  { label: "ECOSYSTEM", sel: "#ecosystem" },
  { label: "ARCH",      sel: ".uos-stack" },
  { label: "MODES",     sel: "#modes" },
  { label: "COPILOT",   sel: "#copilot" },
  { label: "TIERS",     sel: "#tiers" },
  { label: "TRUST",     sel: ".uos-trust" },
  { label: "ENTER",     sel: ".uos-final" },
];
const SectionRail = () => {
  const { scrollYProgress } = useScroll();
  const h = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;
      let idx = 0;
      RAIL.forEach((r, i) => {
        const el = document.querySelector(r.sel);
        if (!el) return;
        const top = (el as HTMLElement).getBoundingClientRect().top;
        if (top < vh * 0.5) idx = i;
      });
      setActive(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <aside className="uos-rail" aria-hidden>
      <div className="uos-rail-track"><motion.div className="uos-rail-fill" style={{ height: h }} /></div>
      <ul className="uos-rail-list">
        {RAIL.map((r, i) => (
          <li key={r.label} className={i === active ? "is-active" : ""}>
            <span className="uos-mono uos-rail-idx">{String(i + 1).padStart(2, "0")}</span>
            <span className="uos-mono uos-rail-lbl">{r.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

/* ─── Ambient neural environment (CSS-only, fakes Three.js) ─────────────── */
const NeuralField = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 2000], [0, -300]);
  const y2 = useTransform(scrollY, [0, 2000], [0, -120]);
  return (
    <>
      <motion.div className="uos-field uos-field-1" style={{ y: y1 }} aria-hidden />
      <motion.div className="uos-field uos-field-2" style={{ y: y2 }} aria-hidden />
      <div className="uos-grid-overlay" aria-hidden />
      <div className="uos-vignette" aria-hidden />
    </>
  );
};

/* ─── Sticky global header ──────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Système", href: "#positioning" },
  { label: "Écosystème", href: "#ecosystem" },
  { label: "Modes", href: "#modes" },
  { label: "Copilote", href: "#copilot" },
  { label: "Tarifs", href: "#tiers" },
  { label: "Témoignages", href: "#voices" },
];

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className={`uos-nav${scrolled ? " is-scrolled" : ""}${mobileOpen ? " is-mobile-open" : ""}`}>
      <div className="uos-nav-inner">
        <a href="#" className="uos-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <span className="uos-brand-mark"><span className="uos-brand-dot" /></span>
          <span className="uos-brand-name">UPSY<span className="uos-brand-os">/OS</span></span>
        </a>

        <nav className="uos-nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => handleAnchor(e, l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="uos-nav-cta">
          <Link to="/contact" className="uos-btn-ghost uos-btn-sm">Book a Call</Link>
          <Link to="/auth" className="uos-btn-primary uos-btn-sm">Start Free</Link>
        </div>

        <button
          className={`uos-nav-toggle${mobileOpen ? " is-open" : ""}`}
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile slide-out overlay */}
      <div
        className={`uos-nav-overlay${mobileOpen ? " is-open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      {/* Mobile slide-out panel */}
      <div className={`uos-nav-drawer${mobileOpen ? " is-open" : ""}`}>
        <div className="uos-nav-drawer-head">
          <span className="uos-mono uos-nav-drawer-label">NAVIGATION</span>
          <button
            className="uos-nav-drawer-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <span /><span />
          </button>
        </div>
        <nav className="uos-nav-drawer-links">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleAnchor(e, l.href)}
              style={{ transitionDelay: mobileOpen ? `${80 + i * 40}ms` : "0ms" }}
            >
              <span className="uos-mono uos-nav-drawer-num">{String(i + 1).padStart(2, "0")}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="uos-nav-drawer-cta">
          <Link to="/contact" className="uos-btn-ghost">Book a Call</Link>
          <Link to="/auth" className="uos-btn-primary">Start Free</Link>
        </div>
      </div>
    </header>
  );
};

/* ─── Section 1: Hero ───────────────────────────────────────────────────── */
const Hero = () => (
  <section className="uos-hero">
    <div className="uos-hero-grid">
      <div className="uos-hero-left">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="uos-eyebrow"
        >
          <Radio size={11} /> UPSY OPERATING SYSTEM · v1.0
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, filter: "blur(8px)", y: 24 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="uos-hero-title"
        >
          L'infrastructure psychologique<br />
          <span className="uos-accent-text">de demain.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="uos-hero-sub"
        >
          Clinique. Sport. Développement. Gouverné par UPSY.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="uos-hero-ctas"
        >
          <Link to="/auth" className="uos-btn-primary">
            Entrer dans l'écosystème <ArrowUpRight size={14} />
          </Link>
          <Link to="/contact" className="uos-btn-ghost">Réserver un appel</Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="uos-telemetry"
        >
          {[
            ["UPTIME", "99.97%"], ["WORKSPACES", "12"],
            ["AI CALLS / 24H", "2,184"], ["LATENCY P95", "84ms"],
          ].map(([k, v]) => (
            <div key={k as string} className="uos-telem-item">
              <div className="uos-telem-k">{k}</div>
              <div className="uos-telem-v">{v}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right: ambient instrument panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="uos-hero-instrument"
      >
        <InstrumentPanel />
      </motion.div>
    </div>

    <div className="uos-scroll-cue">
      <span>SCROLL</span>
      <div className="uos-scroll-line"><div className="uos-scroll-dot" /></div>
    </div>
  </section>
);

const InstrumentPanel = () => (
  <div className="uos-instr">
    <div className="uos-instr-header">
      <span className="uos-mono uos-instr-tag">SYSTEM · LIVE</span>
      <span className="uos-instr-dot uos-pulse" />
    </div>

    {/* Orbital radar */}
    <div className="uos-radar">
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <radialGradient id="radarG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(192, 100%, 50%)" stopOpacity="0.25" />
            <stop offset="70%" stopColor="hsl(192, 100%, 50%)" stopOpacity="0.02" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="180" fill="url(#radarG)" />
        {[60, 110, 160].map((r, i) => (
          <motion.circle
            key={r} cx="200" cy="200" r={r}
            stroke="rgba(0,212,255,0.18)" strokeWidth="1" fill="none"
            animate={{ r: [r, r + 4, r] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        {/* Orbiting nodes */}
        {[
          { r: 60, dur: 18, label: "LSSPM" },
          { r: 110, dur: 26, label: "UFC GYM" },
          { r: 110, dur: 26, label: "BEING", offset: 180 },
          { r: 160, dur: 38, label: "UIC" },
          { r: 160, dur: 38, label: "CLINIQUES", offset: 120 },
          { r: 160, dur: 38, label: "INSTIT.", offset: 240 },
        ].map((n, i) => (
          <g key={i}>
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: n.dur, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "200px 200px", transformBox: "fill-box" }}
            >
              <g transform={`rotate(${n.offset ?? 0} 200 200)`}>
                <circle cx={200 + n.r} cy="200" r="3" fill="hsl(192, 100%, 60%)" />
                <text x={200 + n.r + 8} y="204" fontSize="8" fontFamily="JetBrains Mono"
                  fill="rgba(240,240,245,0.6)" letterSpacing="1.5">{n.label}</text>
              </g>
            </motion.g>
          </g>
        ))}
        {/* Core */}
        <circle cx="200" cy="200" r="6" fill="hsl(192, 100%, 70%)" />
        <circle cx="200" cy="200" r="14" stroke="hsl(192, 100%, 60%)" strokeWidth="1" fill="none" opacity="0.4" />
      </svg>
    </div>

    <div className="uos-instr-grid">
      <div className="uos-instr-cell">
        <span className="uos-mono uos-cell-k">CHARGE</span>
        <div className="uos-bar"><motion.div className="uos-bar-fill" initial={{ width: 0 }} animate={{ width: "68%" }} transition={{ delay: 1, duration: 1.4 }} /></div>
        <span className="uos-mono uos-cell-v">68%</span>
      </div>
      <div className="uos-instr-cell">
        <span className="uos-mono uos-cell-k">BURN RISK</span>
        <span className="uos-mono uos-cell-tag uos-tag-ok">LOW</span>
      </div>
      <div className="uos-instr-cell">
        <span className="uos-mono uos-cell-k">FLAGGED CASES</span>
        <span className="uos-mono uos-cell-tag uos-tag-alert">2</span>
      </div>
    </div>
  </div>
);

/* ─── Section 2: Positioning reveal ─────────────────────────────────────── */
const PositioningReveal = () => {
  const lines = [
    "UPSY n'est pas un outil.",
    "UPSY est votre système opérationnel.",
    "Psychologie. Performance. Infrastructure.",
  ];
  return (
    <section id="positioning" className="uos-positioning">
      <div className="uos-positioning-inner">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={i === 2 ? "uos-pos-line uos-pos-accent" : "uos-pos-line"}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </section>
  );
};

/* ─── Section 3: Ecosystem map ──────────────────────────────────────────── */
const ECOSYSTEM = [
  { name: "LSSPM", desc: "Coordination clinique nationale", angle: 0 },
  { name: "UFC GYM MOROCCO", desc: "Performance athlétique", angle: 60 },
  { name: "SOLETERRE / BEING", desc: "Programmes humanitaires", angle: 120 },
  { name: "INSTITUTIONS", desc: "Gouvernance & exécution", angle: 180 },
  { name: "CLINIQUES", desc: "Opérations cliniques privées", angle: 240 },
  { name: "UIC", desc: "Recherche & formation", angle: 300 },
];
const EcosystemMap = () => {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section id="ecosystem" className="uos-section">
      <div className="uos-section-head">
        <span className="uos-mono uos-section-k">/ ÉCOSYSTÈME</span>
        <h2>Six workspaces. Un seul système nerveux.</h2>
      </div>
      <div className="uos-eco-stage">
        <div className="uos-eco-core">
          <div className="uos-eco-core-inner">
            <span className="uos-mono">UPSY</span>
            <span className="uos-mono uos-eco-core-sub">OS · CORE</span>
          </div>
          <div className="uos-eco-core-ring" />
        </div>
        {ECOSYSTEM.map((n, i) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * 36;
          const y = 50 + Math.sin(rad) * 36;
          return (
            <motion.button
              key={n.name}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              className={`uos-eco-node ${hover === i ? "is-hover" : ""}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              <span className="uos-eco-dot" />
              <span className="uos-eco-label">{n.name}</span>
              {hover === i && <span className="uos-eco-desc">{n.desc}</span>}
            </motion.button>
          );
        })}
        {/* connecting lines */}
        <svg className="uos-eco-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {ECOSYSTEM.map((n) => {
            const rad = (n.angle * Math.PI) / 180;
            const x = 50 + Math.cos(rad) * 36;
            const y = 50 + Math.sin(rad) * 36;
            return <line key={n.name} x1="50" y1="50" x2={x} y2={y} stroke="rgba(0,212,255,0.15)" strokeWidth="0.15" />;
          })}
        </svg>
      </div>
    </section>
  );
};

/* ─── Section 4: Three modes ────────────────────────────────────────────── */
const MODES = [
  { tag: "01", label: "FOCUS MODE", who: "Pour les psychologues",
    items: ["Session active", "Notes IA · révisables", "Zéro distraction"], icon: Brain },
  { tag: "02", label: "OPERATIONS MODE", who: "Pour les coordinateurs",
    items: ["Coordination temps réel", "Flux opérationnel", "Alertes & escalades"], icon: Activity },
  { tag: "03", label: "INTELLIGENCE MODE", who: "Pour les directions",
    items: ["KPIs stratégiques", "Prévisions IA", "Tableau exécutif"], icon: Zap },
];
const ThreeModes = () => (
  <section id="modes" className="uos-section">
    <div className="uos-section-head">
      <span className="uos-mono uos-section-k">/ MODES OPÉRATIONNELS</span>
      <h2>Une interface. Trois postures.</h2>
    </div>
    <div className="uos-modes-grid">
      {MODES.map((m, i) => (
        <motion.div key={m.label}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="uos-mode-card"
        >
          <div className="uos-mode-head">
            <span className="uos-mono uos-mode-tag">{m.tag}</span>
            <m.icon size={16} className="uos-mode-icon" />
          </div>
          <h3 className="uos-mode-label">{m.label}</h3>
          <p className="uos-mode-who">{m.who}</p>
          <ul className="uos-mode-list">
            {m.items.map(it => <li key={it}><span className="uos-mode-bullet" />{it}</li>)}
          </ul>
          <div className="uos-mode-accent" />
        </motion.div>
      ))}
    </div>
  </section>
);

/* ─── Section 5: AI Copilot showcase ────────────────────────────────────── */
const CopilotShowcase = () => {
  const draft = "Patient présente diminution marquée du score d'alliance (-12pts). Recommandation : revoir cadre thérapeutique session N+1. Signaux de retrait détectés sur les 3 dernières sessions. Risque modéré de dropout sous 30 jours.";
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const id = setInterval(() => {
      i++; setTyped(draft.slice(0, i));
      if (i >= draft.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [started]);

  return (
    <section id="copilot" className="uos-section">
      <div className="uos-section-head">
        <span className="uos-mono uos-section-k">/ COPILOTE CLINIQUE</span>
        <h2>Transparent. Éthique. Humain.</h2>
      </div>
      <div className="uos-copilot-grid">
        <motion.div
          initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          onViewportEnter={() => setStarted(true)}
          className="uos-copilot-left"
        >
          <div className="uos-copilot-scenario">
            <span className="uos-mono uos-copilot-k">SCÉNARIO · CAS #4827</span>
            <p>Session 6 / 12. Le patient a manqué deux rendez-vous. Notes cliniques en attente. Évaluation de l'alliance thérapeutique à compléter.</p>
            <div className="uos-copilot-meta">
              <span><Shield size={11} /> Données chiffrées · workspace LSSPM</span>
              <span><Activity size={11} /> 3 signaux de risque détectés</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 }}
          className="uos-copilot-output"
        >
          <div className="uos-copilot-output-head">
            <span className="uos-mono">IA · DRAFT</span>
            <span className="uos-mono uos-copilot-stamp">RÉVISABLE · JAMAIS AUTO-ENREGISTRÉ</span>
          </div>
          <p className="uos-copilot-text">
            {typed}<span className="uos-caret">▍</span>
          </p>
          <div className="uos-copilot-actions">
            <button className="uos-btn-ghost">Réécrire</button>
            <button className="uos-btn-primary">Accepter et éditer <ArrowUpRight size={12} /></button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Section 6: Trust signals ──────────────────────────────────────────── */
const TrustSignals = () => (
  <section className="uos-section uos-trust">
    <h3 className="uos-trust-title">Adopté par les institutions qui définissent le standard.</h3>
    <div className="uos-trust-logos">
      {["UFC GYM MOROCCO", "UIC", "SOLETERRE", "LSSPM"].map(l => (
        <span key={l} className="uos-logo">{l}</span>
      ))}
    </div>
    <div className="uos-trust-counters">
      {[
        ["PSYCHOLOGUES", "240+"], ["SESSIONS", "18,420"],
        ["INSTITUTIONS", "12"], ["PAYS", "4"],
      ].map(([k, v]) => (
        <motion.div key={k as string} className="uos-trust-counter"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="uos-trust-v">{v}</div>
          <div className="uos-mono uos-trust-k">{k}</div>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ─── Section 7: Final CTA ──────────────────────────────────────────────── */
const FinalCTA = () => (
  <section className="uos-final">
    <div className="uos-final-glow" aria-hidden />
    <motion.h2
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 1 }}
      className="uos-final-title"
    >
      Rejoignez l'infrastructure.
    </motion.h2>
    <div className="uos-final-ctas">
      <Link to="/contact" className="uos-btn-primary uos-btn-lg">Demander une démo <ArrowUpRight size={14} /></Link>
      <Link to="/auth" className="uos-btn-ghost uos-btn-lg">Créer un compte</Link>
    </div>
  </section>
);

/* ─── Global Footer ─────────────────────────────────────────────────────── */
const FooterStrip = () => (
  <footer className="uos-foot">
    <div className="uos-foot-inner">
      {/* Column 1: Brand + Bio */}
      <div className="uos-foot-col uos-foot-brand">
        <div className="uos-foot-brandmark">
          <span className="uos-brand-mark"><span className="uos-brand-dot" /></span>
          <span className="uos-foot-brandname">UPSY<span className="uos-brand-os">/OS</span></span>
        </div>
        <p className="uos-foot-bio">
          U.Psy est le système d'exploitation de la psychologie de performance. Infrastructure souveraine, conforme Law 09-08, pour praticiens, cliniques et institutions au Maroc et au-delà.
        </p>
        <div className="uos-foot-socials">
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={16} /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={16} /></a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={16} /></a>
        </div>
      </div>

      {/* Column 2: Contact */}
      <div className="uos-foot-col">
        <span className="uos-mono uos-foot-col-title">CONTACT</span>
        <a href="mailto:contact@upsy.ma" className="uos-foot-link">
          <Mail size={13} /> contact@upsy.ma
        </a>
        <a href="https://wa.me/212000000000" target="_blank" rel="noopener noreferrer" className="uos-foot-link">
          <Phone size={13} /> WhatsApp
        </a>
      </div>

      {/* Column 3: Navigation */}
      <div className="uos-foot-col">
        <span className="uos-mono uos-foot-col-title">NAVIGATION</span>
        <a href="#positioning" className="uos-foot-link">Système</a>
        <a href="#ecosystem" className="uos-foot-link">Écosystème</a>
        <a href="#modes" className="uos-foot-link">Modes</a>
        <a href="#tiers" className="uos-foot-link">Tarifs</a>
      </div>

      {/* Column 4: Legal */}
      <div className="uos-foot-col">
        <span className="uos-mono uos-foot-col-title">LÉGAL</span>
        <Link to="/privacy" className="uos-foot-link">Politique de confidentialité</Link>
        <Link to="/terms" className="uos-foot-link">Conditions d'utilisation</Link>
        <Link to="/legal" className="uos-foot-link">Mentions légales</Link>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="uos-foot-bar">
      <span className="uos-mono">UPSY OS · v1.0 · CASABLANCA → MENA → ∞</span>
      <span className="uos-mono">SECURE · TENANT-ISOLATED · LAW 09-08</span>
      <div className="uos-foot-lang">
        <Globe size={11} />
        <span className="uos-mono">FR</span>
        <span className="uos-mono uos-foot-lang-dim">EN · AR</span>
      </div>
    </div>
  </footer>
);

export default Preview;

/* ─── Manifesto marquee ────────────────────────────────────────────────── */
const MANIFESTO = [
  "MESURER CE QUI COMPTE",
  "PROTÉGER CE QUI EST FRAGILE",
  "GOUVERNER CE QUI EST CRITIQUE",
  "AUTOMATISER L'OPÉRATIONNEL",
  "LAISSER LE CLINIQUE AU CLINICIEN",
  "AUDITER CHAQUE DÉCISION",
];
const ManifestoMarquee = () => (
  <section className="uos-manifesto" aria-label="Manifesto">
    <div className="uos-manifesto-track">
      {[...MANIFESTO, ...MANIFESTO].map((m, i) => (
        <span key={i} className="uos-manifesto-item">
          <span className="uos-manifesto-dot" />
          {m}
        </span>
      ))}
    </div>
  </section>
);

/* ─── Outcome metrics (big animated counters) ───────────────────────────── */
const useCountUp = (target: number, start: boolean, duration = 1600) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return n;
};
const Counter = ({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) => {
  const [vis, setVis] = useState(false);
  const n = useCountUp(value, vis);
  return (
    <motion.span onViewportEnter={() => setVis(true)} viewport={{ once: true }}>
      {n.toFixed(decimals)}{suffix}
    </motion.span>
  );
};
const OUTCOMES = [
  { v: 73, s: "%", k: "RÉDUCTION TEMPS ADMIN", note: "vs. process manuel" },
  { v: 4.2, s: "x", d: 1, k: "VITESSE D'ESCALADE", note: "détection → action" },
  { v: 99.97, s: "%", d: 2, k: "DISPONIBILITÉ SYSTÈME", note: "12 mois glissants" },
  { v: 0, s: "", k: "FUITES DE DONNÉES", note: "depuis le déploiement" },
];
const OutcomeMetrics = () => (
  <section className="uos-section uos-outcomes">
    <div className="uos-section-head">
      <span className="uos-mono uos-section-k">/ RÉSULTATS</span>
      <h2>Mesuré. Pas raconté.</h2>
    </div>
    <div className="uos-outcomes-grid">
      {OUTCOMES.map((o, i) => (
        <motion.div key={o.k}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: i * 0.1, duration: 0.7 }}
          className="uos-outcome">
          <div className="uos-outcome-v">
            <Counter value={o.v} suffix={o.s} decimals={o.d ?? 0} />
          </div>
          <div className="uos-outcome-k uos-mono">{o.k}</div>
          <div className="uos-outcome-note">{o.note}</div>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ─── Voices of the system ──────────────────────────────────────────────── */
const VOICES = [
  { q: "Pour la première fois, notre coordination clinique ne dépend plus d'un Excel partagé. Le système tient.", who: "Directrice médicale", org: "Réseau clinique · Casablanca" },
  { q: "On a vu un cas escalader en 11 minutes au lieu de 48 heures. Ça change ce qu'on peut promettre aux familles.", who: "Coordinateur d'urgence", org: "Programme humanitaire" },
  { q: "Le copilote ne décide rien. Il pré-mâche. Mes psychologues récupèrent leur soirée. Personne ne se sent remplacé.", who: "Responsable de cellule", org: "Institution sportive" },
];
const VoicesOfSystem = () => (
  <section id="voices" className="uos-section">
    <div className="uos-section-head">
      <span className="uos-mono uos-section-k">/ VOIX DU SYSTÈME</span>
      <h2>Ceux qui l'opèrent en parlent.</h2>
    </div>
    <div className="uos-voices">
      {VOICES.map((v, i) => (
        <motion.figure key={i} className="uos-voice"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <Quote size={18} className="uos-voice-icon" />
          <blockquote>{v.q}</blockquote>
          <figcaption>
            <span className="uos-voice-who">{v.who}</span>
            <span className="uos-mono uos-voice-org">{v.org}</span>
          </figcaption>
        </motion.figure>
      ))}
    </div>
  </section>
);

/* ─── Roadmap horizon (4-step timeline) ─────────────────────────────────── */
const HORIZON = [
  { tag: "T0", icon: Target, label: "FONDATIONS", desc: "Workspaces, copilote, opérations temps-réel.", state: "LIVE" },
  { tag: "T+1", icon: Compass, label: "SCORING UNIFIÉ", desc: "Cohortes, signaux faibles, alertes prédictives.", state: "Q2" },
  { tag: "T+2", icon: Layers, label: "INTÉGRATIONS SOUVERAINES", desc: "EMR, paie, biofeedback, dossiers institutionnels.", state: "Q3" },
  { tag: "T+3", icon: Flag, label: "MENA → ∞", desc: "Multi-pays, multi-langue, gouvernance régionale.", state: "2026" },
];
const RoadmapHorizon = () => (
  <section className="uos-section">
    <div className="uos-section-head">
      <span className="uos-mono uos-section-k">/ HORIZON</span>
      <h2>Une trajectoire. Pas un backlog.</h2>
    </div>
    <div className="uos-horizon">
      <div className="uos-horizon-line" />
      {HORIZON.map((h, i) => (
        <motion.div key={h.label} className="uos-horizon-step"
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ delay: i * 0.12, duration: 0.7 }}>
          <div className="uos-horizon-node">
            <h.icon size={14} />
          </div>
          <span className="uos-mono uos-horizon-tag">{h.tag} · {h.state}</span>
          <h3 className="uos-horizon-label">{h.label}</h3>
          <p className="uos-horizon-desc">{h.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ─── Signal feed (terminal stream between hero and positioning) ────────── */
const FEED_LINES = [
  ["02:14:08", "LSSPM", "session.completed", "alliance +3"],
  ["02:14:11", "UFC-GYM", "biofeedback.sync", "HRV nominal"],
  ["02:14:14", "BEING", "intake.received", "triage queued"],
  ["02:14:18", "UIC", "cohort.scored", "GAD-7 cohort #14"],
  ["02:14:22", "LSSPM", "risk.flag", "case #4827 → escalate"],
  ["02:14:25", "OS", "router.ok", "p95 84ms · 12 ws"],
  ["02:14:29", "CLINIC", "note.draft", "ai · revisable"],
  ["02:14:33", "OS", "vault.seal", "session #18420 sealed"],
];
const SignalFeed = () => (
  <section className="uos-signal" aria-label="Live signal feed">
    <div className="uos-signal-inner">
      <div className="uos-signal-head">
        <span className="uos-mono">/ LIVE SIGNAL · UPSY/OS BUS</span>
        <span className="uos-mono uos-signal-rate">~ 2,184 EVT / 24H</span>
      </div>
      <div className="uos-signal-stream">
        <div className="uos-signal-track">
          {[...FEED_LINES, ...FEED_LINES].map((row, i) => (
            <div key={i} className="uos-signal-row">
              <span className="uos-mono uos-sig-t">{row[0]}</span>
              <span className="uos-mono uos-sig-w">{row[1]}</span>
              <span className="uos-mono uos-sig-e">{row[2]}</span>
              <span className="uos-mono uos-sig-v">{row[3]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ─── Architecture stack (4 protocol layers) ────────────────────────────── */
const STACK = [
  { tag: "L4", label: "GOVERNANCE", desc: "Tenants, rôles, conformité 09-08, audit",
    items: ["RLS strict", "Audit ledger", "Sceau de session"], icon: Lock },
  { tag: "L3", label: "INTELLIGENCE", desc: "Copilote, scoring, prévisions, signaux",
    items: ["Gemini 2.5", "GPT-5", "Modèles in-house"], icon: Cpu },
  { tag: "L2", label: "OPERATIONS", desc: "Tâches, routage, SLA, escalades, événements",
    items: ["Bus temps-réel", "Workflows SOP", "Webhooks"], icon: Layers },
  { tag: "L1", label: "DATA", desc: "Sessions, dossiers, biofeedback, cohortes",
    items: ["Postgres chiffré", "Vault", "Object storage"], icon: Database },
];
const ArchitectureStack = () => (
  <section className="uos-section">
    <div className="uos-section-head">
      <span className="uos-mono uos-section-k">/ ARCHITECTURE</span>
      <h2>Quatre couches. Aucune ambiguïté.</h2>
    </div>
    <div className="uos-stack">
      {STACK.map((s, i) => (
        <motion.div key={s.label} className="uos-stack-row"
          initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <div className="uos-stack-tag">
            <span className="uos-mono">{s.tag}</span>
            <s.icon size={14} />
          </div>
          <div className="uos-stack-body">
            <div className="uos-stack-head">
              <h3>{s.label}</h3>
              <p>{s.desc}</p>
            </div>
            <div className="uos-stack-items">
              {s.items.map(it => <span key={it} className="uos-stack-chip uos-mono">{it}</span>)}
            </div>
          </div>
          <div className="uos-stack-bar"><span style={{ width: `${(STACK.length - i) * 22 + 12}%` }} /></div>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ─── Access tiers ──────────────────────────────────────────────────────── */
const TIERS = [
  { name: "STANDARD", price: "Sur invitation", who: "Praticiens indépendants",
    feat: ["Focus Mode", "Copilote clinique", "1 workspace", "Support email"] },
  { name: "PRO", price: "Contrat annuel", who: "Cliniques & cabinets",
    feat: ["Operations Mode", "Multi-praticiens", "5 workspaces", "Routage & SLA", "SSO"], featured: true },
  { name: "SOVEREIGN", price: "Sur mesure", who: "Institutions & écosystèmes",
    feat: ["Intelligence Mode", "Workspaces illimités", "Données souveraines", "Intégrations sur mesure", "Account director"] },
];
const AccessTiers = () => (
  <section id="tiers" className="uos-section">
    <div className="uos-section-head">
      <span className="uos-mono uos-section-k">/ ACCÈS</span>
      <h2>Trois niveaux d'engagement.</h2>
    </div>
    <div className="uos-tiers">
      {TIERS.map((t, i) => (
        <motion.div key={t.name}
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ delay: i * 0.1, duration: 0.7 }}
          className={`uos-tier ${t.featured ? "is-featured" : ""}`}>
          {t.featured && <span className="uos-mono uos-tier-badge">RECOMMANDÉ</span>}
          <div className="uos-tier-head">
            <span className="uos-mono uos-tier-name">{t.name}</span>
            <span className="uos-mono uos-tier-price">{t.price}</span>
          </div>
          <p className="uos-tier-who">{t.who}</p>
          <ul className="uos-tier-list">
            {t.feat.map(f => <li key={f}><span className="uos-tier-tick" />{f}</li>)}
          </ul>
          <Link to="/contact" className={t.featured ? "uos-btn-primary" : "uos-btn-ghost"}>
            Demander l'accès <ArrowUpRight size={12} />
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);