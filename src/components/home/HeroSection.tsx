// src/components/home/HeroSection.tsx — Editorial magazine hero (v7) with 3D orb backdrop
import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/lib/motion";
import { useLocale } from "@/contexts/LocaleContext";
import { getHomeCopy } from "@/lib/i18n/homeCopy";
import { getHeroVariantCopy } from "@/lib/i18n/heroVariants";
import { HOME_HERO_EXPERIMENT, type HomeHeroVariant } from "@/lib/experiments/config";
import { useExperimentExposure, useExperimentVariant } from "@/lib/experiments/useExperiment";
import { trackCTAClick } from "@/lib/analytics/gtm";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Spread-merge helper: a variant that omits a field must inherit the control's
 * value, but a plain spread would overwrite it with `undefined`.
 */
function withSearch(path: string, search?: Record<string, string>): string {
  if (!search || Object.keys(search).length === 0) return path;
  return `${path}?${new URLSearchParams(search).toString()}`;
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

const HeroScene = lazy(() => import("@/components/three/HeroScene"));

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type NetworkInfo = { saveData?: boolean; effectiveType?: string };
type CapabilityNavigator = Navigator & {
  connection?: NetworkInfo;
  deviceMemory?: number;
};
type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * The orb costs ~850 KB of Three.js — roughly half the homepage's JavaScript —
 * to render decoration. That is a fair trade on a laptop and a bad one on a
 * mid-range phone over mobile data, where it delays the copy and the CTA that
 * the page actually exists to deliver. So we ask whether this visitor can
 * afford it rather than assuming they can.
 */
function canAffordHeroScene(): boolean {
  if (prefersReducedMotion) return false;
  if (typeof navigator === "undefined") return false;

  const nav = navigator as CapabilityNavigator;

  // Data Saver is an explicit request not to spend the user's bytes.
  if (nav.connection?.saveData) return false;
  // Below 4g, the scene alone is measured in seconds.
  if (nav.connection?.effectiveType && nav.connection.effectiveType !== "4g") return false;
  // Low-memory handsets struggle with WebGL even on a good connection.
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return false;

  return true;
}

const HeroSection = () => {
  const { locale } = useLocale();
  const base = getHomeCopy(locale).hero;
  const [showScene, setShowScene] = useState(false);

  // home_hero_v1: headline / subhead / CTA are under test. The variant is
  // resolved server-side, so this renders identically on SSR and hydration.
  const variant = useExperimentVariant<HomeHeroVariant>(HOME_HERO_EXPERIMENT);
  useExperimentExposure(HOME_HERO_EXPERIMENT.id, variant);
  const v = getHeroVariantCopy(variant, locale);

  const { ctaPrimary: vPrimary, ctaSecondary: vSecondary, ctaFootnote, ...vText } = v;
  const c = { ...base, ...stripUndefined(vText) };

  const primaryTo = withSearch(vPrimary?.to ?? "/free-score", vPrimary?.search);
  const secondaryTo = withSearch(vSecondary?.to ?? "/get-matched", vSecondary?.search);
  const primaryLabel = vPrimary?.label ?? base.ctaPrimary;
  const secondaryLabel = vSecondary?.label ?? base.ctaSecondary;

  const trackCta = (label: string, destination: string) =>
    trackCTAClick(label, "home_hero", "/", {
      experiment_id: HOME_HERO_EXPERIMENT.id,
      experiment_variant: variant,
      destination,
    });

  useEffect(() => {
    if (!canAffordHeroScene()) return;

    // Load only once the browser is idle, so the orb never competes with the
    // hero copy for bandwidth or main-thread time during first paint.
    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      const handle = w.requestIdleCallback(() => setShowScene(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(() => setShowScene(true), 1200);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-[#0D0406] text-[#FAFAFA] font-body selection:bg-[hsl(var(--gold-accent))] selection:text-[#0D0406]">
      {/* --- Layer 1: existing 3D orb + starfield backdrop --- */}
      <div className="absolute inset-0" aria-hidden="true">
        {showScene && (
          <div className="absolute inset-0">
            {/*
              The 3D backdrop is purely decorative, so it must never be able to
              take the page down with it. Without this boundary a WebGL failure
              (no GPU, blocked context, driver crash) or a rejected asset fetch
              propagates past Suspense to the app-level ErrorBoundary and
              replaces the entire landing page with "Something went wrong".
              Degrading to the gradient + vignette behind it is invisible to
              almost everyone.
            */}
            <ErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <HeroScene />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
        {/* Vignette so foreground stays readable */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 62% 55% at 18% 50%, rgba(13,4,6,0.92) 0%, rgba(13,4,6,0.45) 48%, transparent 78%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#0D0406]" />
      </div>

      {/* --- Layer 2: tactical wireframe grid overlay --- */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" aria-hidden="true">
        <defs>
          <pattern id="hero-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="hsl(var(--gold-accent))" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* --- Layer 3: scanlines --- */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 50%, rgba(242,183,5,0.03) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* --- Left vertical ticker (desktop) --- */}
      <div className="absolute left-4 top-0 bottom-0 w-8 hidden xl:flex flex-col overflow-hidden opacity-20 pointer-events-none border-x border-[hsl(var(--gold-accent))]/10 z-10">
        <div className="flex flex-col gap-8 py-4 animate-[ticker-vertical_22s_linear_infinite]">
          {c.tickerItems.map((s, i) => (
            <span
              key={i}
              className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-[hsl(var(--gold-accent))] tracking-widest uppercase"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* --- Layer 4: content grid --- */}
      <div className="container-custom relative z-10 py-24 md:py-28">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* LEFT — editorial headline column */}
          <div className="lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4 uppercase tracking-[0.3em] text-[hsl(var(--gold-accent))] text-[10px] font-black"
            >
              <span className="w-12 h-[2px] bg-[hsl(var(--gold-accent))]" />
            <span>{c.eyebrow}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-5"
            >
              <h1 className="font-display font-semibold leading-[0.9] tracking-tight text-[clamp(2.75rem,7.5vw,6rem)] text-[#FAFAFA]">
                {c.headlineLine1}
                <br />
                <span className="relative italic font-bold text-gold-gradient">
                  {c.headlineLine2}
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-[hsl(var(--gold-accent))]/20" />
                </span>
              </h1>
              <p className="font-display italic text-xl md:text-2xl text-[#FAFAFA]/80">
                {c.tagline}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="max-w-lg text-lg text-[#FAFAFA]/70 leading-relaxed font-light"
            >
              {c.body}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <MagneticButton strength={0.3}>
                <Button
                  asChild
                  size="lg"
                  className="group h-14 px-8 text-[11px] tracking-[0.2em] font-bold bg-[hsl(var(--gold-accent))] text-[#0D0406] hover:bg-[hsl(var(--gold-accent))]/90 rounded-none shadow-[0_20px_50px_-15px_hsl(45_96%_60%/0.55)]"
                >
                  <Link
                    to={primaryTo}
                    className="inline-flex items-center gap-2"
                    onClick={() => trackCta(primaryLabel, primaryTo)}
                  >
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </MagneticButton>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-14 px-8 text-[11px] tracking-[0.2em] font-bold text-[#FAFAFA] border border-white/20 hover:bg-white/5 rounded-none"
              >
                <Link
                  to={secondaryTo}
                  onClick={() => trackCta(secondaryLabel, secondaryTo)}
                >
                  {secondaryLabel}
                </Link>
              </Button>
            </motion.div>
            {ctaFootnote ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="text-xs tracking-wide text-[#FAFAFA]/70 font-body"
              >
                {ctaFootnote}
              </motion.p>
            ) : null}
          </div>

          {/* RIGHT — floating metrics dashboard (desktop only) */}
          <div className="hidden lg:flex lg:col-span-6 relative h-[620px] items-center justify-center">
            <div className="relative w-[480px] h-[480px]">
              {/* Central Sync Index core */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full flex flex-col items-center justify-center border border-[hsl(var(--gold-accent))]/50 z-20 backdrop-blur-md"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, hsl(348 60% 20% / 0.9), hsl(348 60% 6% / 0.9) 70%)",
                  boxShadow: "0 0 100px hsl(45 96% 50% / 0.3)",
                }}
              >
                <span className="font-mono text-5xl text-[#FAFAFA] font-bold tabular-nums tracking-tighter">
                  98.4
                </span>
                <span className="text-[10px] text-[hsl(var(--gold-accent))] font-black tracking-[0.3em] uppercase mt-1">
                  {c.syncIndex}
                </span>
                <div className="absolute -top-3 -left-3 text-[hsl(var(--gold-accent))] text-xs font-mono opacity-60">+</div>
                <div className="absolute -bottom-3 -right-3 text-[hsl(var(--gold-accent))] text-xs font-mono opacity-60">+</div>
              </motion.div>

              {/* Card — Adrenaline Buffer */}
              <MetricCard
                className="absolute -top-4 left-1/2 -translate-x-1/2 w-52"
                label={c.adrenalineBuffer}
                delay={0.6}
                anim="float-a"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-mono text-[hsl(var(--gold-accent))] uppercase tracking-wider">
                    {c.adrenalineBuffer}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[hsl(var(--gold-accent))] animate-ping" />
                </div>
                <div className="text-xl font-bold text-white font-mono">{c.adrenalineActive}</div>
                <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-[hsl(var(--gold-accent))] h-full w-[88%]" />
                </div>
              </MetricCard>

              {/* Card — Decision Latency */}
              <MetricCard
                className="absolute top-1/2 -right-16 -translate-y-1/2 w-44"
                label={c.decisionLatency}
                delay={0.75}
                anim="float-b"
              >
                <span className="text-[8px] font-mono text-[#FAFAFA]/50 uppercase tracking-wider block mb-1">
                  {c.decisionLatency}
                </span>
                <div className="text-2xl font-bold text-white font-mono tabular-nums">
                  140<span className="text-xs text-[hsl(var(--gold-accent))] ml-0.5">ms</span>
                </div>
                <div className="text-[9px] text-emerald-400 font-bold mt-1 uppercase">
                  {c.decisionDelta}
                </div>
              </MetricCard>

              {/* Card — Cognitive Load */}
              <MetricCard
                className="absolute bottom-0 -left-12 w-52"
                label={c.cognitiveLoad}
                delay={0.9}
                anim="float-c"
              >
                <span className="text-[8px] font-mono text-[#FAFAFA]/50 uppercase tracking-wider block mb-1">
                  {c.cognitiveLoad}
                </span>
                <div className="flex items-end gap-1">
                  <div className="w-3 h-6 bg-[hsl(var(--gold-accent))]" />
                  <div className="w-3 h-4 bg-[hsl(var(--gold-accent))]/40" />
                  <div className="w-3 h-2 bg-[hsl(var(--gold-accent))]/20" />
                  <span className="ml-3 text-xl font-bold text-white font-mono">{c.cognitiveLow}</span>
                </div>
              </MetricCard>

              {/* Decorative rotating ring */}
              <div className="absolute inset-0 border border-[hsl(var(--gold-accent))]/10 rounded-full pointer-events-none animate-[spin_45s_linear_infinite]">
                <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-[hsl(var(--gold-accent))] rounded-full -translate-x-1/2" />
                <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-[hsl(var(--gold-accent))] rounded-full -translate-x-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Bottom trust bar --- */}
      <div className="absolute bottom-0 left-0 w-full border-t border-white/5 py-6 bg-[#0D0406]/80 backdrop-blur-sm z-10">
        <div className="container-custom flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-[#FAFAFA]/40 uppercase tracking-[0.4em] font-black">
            {c.performanceTiers}
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-2">
            {c.tiers.map((tier) => (
              <span key={tier} className="font-display italic text-[#FAFAFA]/45 text-sm">
                {tier}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Local keyframes */}
      <style>{`
        @keyframes ticker-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes float-a { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -10px); } }
        @keyframes float-b { 0%,100% { transform: translateY(-50%); } 50% { transform: translateY(calc(-50% - 12px)); } }
        @keyframes float-c { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </section>
  );
};

function MetricCard({
  children,
  className = "",
  label,
  delay = 0,
  anim,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
  delay?: number;
  anim: "float-a" | "float-b" | "float-c";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className={`group p-4 bg-[#0D0406]/60 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:border-[hsl(var(--gold-accent))]/60 hover:shadow-[0_0_30px_hsl(45_96%_50%/0.25)] ${className}`}
      style={{ animation: `${anim} 5s ease-in-out infinite ${delay}s` }}
      aria-label={label}
    >
      <div className="absolute -top-2 -left-2 w-2 h-2 border-t border-l border-[hsl(var(--gold-accent))]/40" />
      <div className="absolute -bottom-2 -right-2 w-2 h-2 border-b border-r border-[hsl(var(--gold-accent))]/40" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export default HeroSection;