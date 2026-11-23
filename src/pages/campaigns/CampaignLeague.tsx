import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  type Variants,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  Percent,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trophy,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";
import SEOHead from "@/components/SEOHead";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import UpsyLogo, { withLogo } from "@/components/UpsyLogo";
import LsspmLogo from "@/components/league/LsspmLogo";
import { CATEGORY_COLORS } from "@/lib/league/memberDocs";
import { LEAGUE_NAME } from "@/lib/league/membershipCopy";
import { useLeagueLandingCopy } from "@/lib/league/landingCopy";
import { CampaignLeadForm, type CampaignConfig } from "./CampaignLanding";

// The 3D scene is decorative and heavy: loaded on its own, after the page.
const LeagueScene = lazy(() => import("@/components/three/LeagueScene"));

const PERK_ICONS: LucideIcon[] = [
  BadgeCheck,
  FileCheck2,
  Percent,
  BookOpen,
  GraduationCap,
  Stethoscope,
  ScrollText,
  Megaphone,
  Trophy,
  HeartHandshake,
];
const POTENTIAL_ICONS: LucideIcon[] = [HeartHandshake, UsersRound, Sparkles];
const LEAGUE_BLUE = "#1d4e89";

const EASE = [0.22, 1, 0.36, 1] as const;
const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

function Section({
  id,
  kicker,
  title,
  children,
  className = "",
}: {
  id?: string;
  kicker?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative py-20 md:py-28 ${className}`}>
      <div className="container-custom">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-3xl"
        >
          {kicker && (
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {kicker}
            </p>
          )}
          <h2 className="mt-3 font-display text-3xl md:text-5xl leading-[1.08] tracking-tight">
            {title}
          </h2>
        </motion.div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

/** A number that counts up when it scrolls into view. */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const still = useReducedMotion();
  const [n, setN] = useState(still ? value : 0);
  useEffect(() => {
    if (!inView || still) return;
    const c = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => c.stop();
  }, [inView, still, value]);
  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}

/** A card that tilts in 3D towards the pointer. */
function Tilt({
  children,
  className = "",
  max = 10,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const still = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), {
    stiffness: 200,
    damping: 18,
  });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), {
    stiffness: 200,
    damping: 18,
  });
  const glareX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);
  const glare = useTransform(
    glareX,
    (g) =>
      `radial-gradient(circle at ${g} 30%, hsl(0 0% 100% / 0.22), transparent 55%)`,
  );
  return (
    <motion.div
      className={`relative [transform-style:preserve-3d] ${className}`}
      style={
        still
          ? undefined
          : { rotateX: rx, rotateY: ry, transformPerspective: 900 }
      }
      onPointerMove={(e) => {
        if (still) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
      {!still && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glare }}
        />
      )}
    </motion.div>
  );
}

/** A real QR code to this page: scanning the sample card opens it. */
function SampleQr() {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    import("qrcode").then(({ toDataURL }) =>
      toDataURL("https://upsy.ma/fr/campaigns/lsspm", {
        margin: 1,
        width: 160,
        color: { dark: "#1d4e89", light: "#ffffff" },
      }).then(setSrc),
    );
  }, []);
  return (
    <div className="h-[74px] w-[74px] rounded-md bg-white p-1">
      {src && <img src={src} alt="" className="h-full w-full" />}
    </div>
  );
}

function MemberCardPreview() {
  const { t } = useLeagueLandingCopy();
  const still = useReducedMotion();
  const cats = ["official", "founder", "honorary", "supporter"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (still) return;
    const id = setInterval(() => setI((v) => (v + 1) % cats.length), 2600);
    return () => clearInterval(id);
  }, [still, cats.length]);
  const cat = cats[i];
  const c = CATEGORY_COLORS[cat];
  return (
    <Tilt className="rounded-2xl" max={14}>
      <div
        className="w-[min(92vw,380px)] aspect-[1.586] rounded-2xl overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10 flex flex-col"
        style={{
          background: `linear-gradient(135deg, ${LEAGUE_BLUE}, #0f2f57)`,
        }}
      >
        <div
          className="flex items-center gap-2 px-4 pt-4"
          style={{ transform: "translateZ(30px)" }}
        >
          <LsspmLogo className="h-9 w-9 rounded-full bg-white p-0.5" />
          <p className="text-[9px] font-semibold uppercase leading-tight text-white/90">
            {LEAGUE_NAME} — LSSPM
          </p>
        </div>
        <div
          className="flex flex-1 items-center gap-3 px-4"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="h-[72px] w-[58px] rounded-md bg-gradient-to-b from-sky-200 to-sky-400/70 flex items-end justify-center overflow-hidden">
            <div className="h-[38px] w-[44px] rounded-t-full bg-[#173f70]" />
          </div>
          <div className="flex-1 text-white">
            <p className="font-semibold">{t.cardName}</p>
            <p className="font-mono text-[11px] text-white/80">
              LSSPM-2027-00042
            </p>
            <p className="text-[11px] text-white/80">{t.cardValid}</p>
          </div>
          <SampleQr />
        </div>
        <motion.div
          key={cat}
          initial={still ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 text-xs font-bold uppercase tracking-widest"
          style={{ background: c.accent, color: c.ink }}
        >
          {t.cardCategories[cat]}
        </motion.div>
      </div>
    </Tilt>
  );
}

function Journey() {
  const { t } = useLeagueLandingCopy();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  return (
    <ol ref={ref} className="relative mx-auto max-w-3xl space-y-10 ps-12">
      <div
        className="absolute start-[18px] top-1 bottom-1 w-px bg-border"
        aria-hidden
      />
      <motion.div
        aria-hidden
        className="absolute start-[18px] top-1 bottom-1 w-px origin-top bg-gradient-to-b from-primary to-[#3b82d6]"
        style={{ scaleY }}
      />
      {t.journey.map((s, i) => (
        <motion.li
          key={s.title}
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="relative"
        >
          <span className="absolute -start-12 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-background font-mono text-sm text-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.6)]">
            {i + 1}
          </span>
          <h3 className="font-display text-xl">{s.title}</h3>
          <p className="mt-1 text-foreground/70">{s.text}</p>
        </motion.li>
      ))}
    </ol>
  );
}

function Fees() {
  const { t, lang } = useLeagueLandingCopy();
  const { data: plans = [] } = useQuery({
    queryKey: ["league-plans-public"],
    queryFn: async () => {
      const { data } = await supabase
        .from("league_membership_plans")
        .select(
          "id, label_fr, label_en, label_ar, amount_mad, category, self_service, position",
        )
        .eq("is_active", true)
        .order("position");
      return data ?? [];
    },
  });
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p, i) => {
          const c = CATEGORY_COLORS[p.category] ?? CATEGORY_COLORS.official;
          const label =
            (lang === "en" && p.label_en) ||
            (lang === "ar" && p.label_ar) ||
            p.label_fr;
          const amount = Number(p.amount_mad);
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <Tilt className="h-full rounded-2xl" max={6}>
                <div className="h-full rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur">
                  <div
                    className="h-1.5 w-12 rounded-full"
                    style={{
                      background: c.accent === "#ffffff" ? "#3b82d6" : c.accent,
                    }}
                  />
                  <p className="mt-4 min-h-[3rem] font-medium">{label}</p>
                  <p className="mt-3 font-display text-4xl text-primary">
                    {amount > 0 ? amount : "—"}{" "}
                    {amount > 0 && (
                      <span className="text-base text-foreground/60">
                        {t.perYear}
                      </span>
                    )}
                  </p>
                  {!p.self_service && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {amount > 0 ? t.granted : t.optional}
                    </p>
                  )}
                </div>
              </Tilt>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
        {t.feesNote}
      </p>
    </>
  );
}

export default function CampaignLeague() {
  const { t } = useLeagueLandingCopy();
  const still = !!useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const heroInView = useInView(heroRef);
  const [showScene, setShowScene] = useState(false);
  // Start the 3D scene once the page has painted, never during first load.
  useEffect(() => {
    const id = window.setTimeout(() => setShowScene(true), 300);
    return () => window.clearTimeout(id);
  }, []);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const config: CampaignConfig = {
    slug: "lsspm",
    source: "campaign_lsspm",
    audience: "specialist",
    seoTitle: t.seoTitle,
    seoDescription: t.seoDescription,
    eyebrow: t.eyebrow,
    headline: t.title,
    headlineAccent: t.titleAccent,
    subheadline: t.lead,
    offerLabel: "",
    bullets: [],
    proof: [],
    primaryCta: { label: t.formCta, href: "#" },
    formTitle: t.formTitle,
    formSubtitle: t.formSubtitle,
    successTitle: t.successTitle,
    successBody: t.successBody,
    successCta: { label: t.successCta, href: "/apply/wizard?source=lsspm" },
    askPhone: true,
    askOrg: true,
    labels: t.formLabels,
  };

  return (
    <main className="flex-1 marketing-night min-h-screen overflow-x-clip bg-background text-foreground">
      <SEOHead
        path="/campaigns/lsspm"
        title={t.seoTitle}
        description={t.seoDescription}
      />

      {/* Hero: the partnership in 3D */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] flex items-center overflow-hidden"
      >
        <div className="absolute inset-0" aria-hidden="true">
          {showScene && (
            <ErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <div className="absolute inset-x-0 bottom-0 top-[42%] opacity-45 md:top-0 md:start-[55%] md:opacity-100">
                  <LeagueScene active={heroInView} still={still} />
                </div>
              </Suspense>
            </ErrorBoundary>
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 15% 50%, hsl(var(--background) / 0.95) 0%, hsl(var(--background) / 0.55) 50%, transparent 80%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        </div>

        <motion.div
          style={still ? undefined : { y: heroY, opacity: heroOpacity }}
          className="container-custom relative py-28"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-primary backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {withLogo(t.eyebrow, "h-[1.4em] mx-0.5")}
          </motion.div>
          <div className="mt-8 flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <LsspmLogo className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white p-1 shadow-[0_0_40px_-6px_#3b82d6]" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl text-foreground/50"
            >
              ×
            </motion.span>
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: 20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: EASE,
              }}
              className="rounded-2xl bg-white px-3 py-2 shadow-[0_0_40px_-6px_#F2B705]"
            >
              <UpsyLogo className="h-10 md:h-12" />
            </motion.div>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-8 max-w-2xl font-display text-4xl md:text-7xl leading-[1.02] tracking-tight"
          >
            {t.title}{" "}
            <span className="italic accent-italic bg-gradient-to-r from-primary via-amber-200 to-[#7fb2ef] bg-clip-text text-transparent">
              {t.titleAccent}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 max-w-xl text-lg text-foreground/75 leading-relaxed"
          >
            {t.lead}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Button
              asChild
              size="lg"
              className="shadow-[0_0_40px_-8px_hsl(var(--primary))]"
            >
              <a href="#join">
                {t.ctaJoin}{" "}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-background/40 backdrop-blur"
            >
              <Link to="/lsspm">
                <ScrollText className="me-2 h-4 w-4" /> {t.ctaRules}
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <a
          href="#stats"
          className="absolute bottom-8 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex flex-col items-center gap-1 text-xs text-foreground/60"
        >
          {t.scroll}
          <ArrowDown className={`h-4 w-4 ${still ? "" : "animate-bounce"}`} />
        </a>
      </section>

      {/* Figures */}
      <section
        id="stats"
        className="relative border-y border-border/50 bg-card/40 backdrop-blur"
      >
        <div className="container-custom grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {t.stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl md:text-5xl text-primary">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm text-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partnership */}
      <Section kicker={t.partnershipKicker} title={t.partnershipTitle}>
        <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {[
            {
              title: t.leagueBrings,
              items: t.leagueItems,
              logo: (
                <LsspmLogo className="h-10 w-10 rounded-full bg-white p-0.5" />
              ),
              glow: "#3b82d6",
            },
            null,
            {
              title: t.upsyBrings,
              items: t.upsyItems,
              logo: <UpsyLogo className="h-7" />,
              glow: "#F2B705",
            },
          ].map((col, i) =>
            col ? (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <Tilt className="h-full rounded-3xl" max={6}>
                  <div
                    className="h-full rounded-3xl border border-border/60 bg-card/70 p-7 backdrop-blur"
                    style={{ boxShadow: `0 30px 80px -40px ${col.glow}` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 items-center rounded-xl bg-white px-2">
                        {col.logo}
                      </span>
                      <h3 className="font-display text-2xl">
                        {/* The badge beside it already shows the brand. */}
                        {col.title.replace("U.Psy", "").trim()}
                      </h3>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {col.items.map((it) => (
                        <li
                          key={it}
                          className="flex items-start gap-3 text-foreground/80"
                        >
                          <Check
                            className="mt-0.5 h-5 w-5 shrink-0"
                            style={{ color: col.glow }}
                          />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tilt>
              </motion.div>
            ) : (
              <motion.div
                key="together"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col items-center justify-center gap-3 text-center lg:w-56"
              >
                <div className="relative flex h-24 w-24 items-center justify-center">
                  {/* The two rings draw together: the partnership. */}
                  {[
                    { c: "border-[#3b82d6]", from: -18 },
                    { c: "border-primary", from: 18 },
                  ].map((r) => (
                    <motion.span
                      key={r.c}
                      className={`absolute inset-0 rounded-full border-2 ${r.c}`}
                      initial={{ x: r.from }}
                      animate={
                        still
                          ? { x: r.from / 1.6 }
                          : { x: [r.from, r.from / 2.4, r.from] }
                      }
                      transition={
                        still
                          ? { duration: 0 }
                          : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                      }
                    />
                  ))}
                  <ShieldCheck className="relative h-8 w-8 text-foreground" />
                </div>
                <p className="font-display text-xl text-primary">
                  {t.together}
                </p>
                <p className="text-sm text-foreground/70">{t.togetherText}</p>
              </motion.div>
            ),
          )}
        </div>

        <h3 className="mt-20 font-display text-2xl md:text-3xl">
          {t.potentialTitle}
        </h3>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {t.potential.map((p, i) => {
            const Icon = POTENTIAL_ICONS[i];
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group rounded-2xl border border-border/60 bg-card/60 p-6"
              >
                <span className="icon-3d flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h4 className="mt-4 font-display text-xl">{p.title}</h4>
                <p className="mt-2 text-foreground/70">{p.text}</p>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Perks */}
      <Section
        kicker={t.perksKicker}
        title={t.perksTitle}
        className="bg-gradient-to-b from-transparent via-[#1d4e89]/10 to-transparent"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {t.perks.map((p, i) => {
            const Icon = PERK_ICONS[i] ?? Check;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30, rotateX: -20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (i % 5) * 0.07, duration: 0.6 }}
                style={{ transformPerspective: 800 }}
              >
                <Tilt className="h-full rounded-2xl" max={8}>
                  <div className="group h-full rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur transition-colors hover:border-primary/50">
                    <span className="icon-3d flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-medium leading-snug">
                      {withLogo(
                        p.title,
                        "h-[0.9em] rounded bg-white px-1 py-0.5 box-content",
                      )}
                    </h3>
                    <p className="mt-2 text-sm text-foreground/65">{p.text}</p>
                  </div>
                </Tilt>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Why: a demanding membership */}
      <Section kicker={t.whyKicker} title={t.whyTitle}>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <motion.p
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-lg text-foreground/75 leading-relaxed"
          >
            {t.whyText}
          </motion.p>
          <ul className="space-y-3">
            {t.whyItems.map((w, i) => (
              <motion.li
                key={w}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-4"
              >
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-foreground/85">{w}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Journey */}
      <Section kicker={t.journeyKicker} title={t.journeyTitle}>
        <Journey />
      </Section>

      {/* Card */}
      <Section
        kicker={t.cardKicker}
        title={t.cardTitle}
        className="overflow-hidden"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <p className="text-lg text-foreground/75 leading-relaxed">
              {t.cardText}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {Object.entries(t.cardCategories).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: CATEGORY_COLORS[k].accent,
                    color: CATEGORY_COLORS[k].ink,
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">{t.cardHint}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, rotateY: -40, y: 40 }}
            whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
            style={{ transformPerspective: 1000 }}
            className="flex justify-center"
          >
            <MemberCardPreview />
          </motion.div>
        </div>
      </Section>

      {/* Fees */}
      <Section kicker={t.feesKicker} title={t.feesTitle}>
        <Fees />
      </Section>

      {/* FAQ */}
      <Section kicker={t.faqKicker} title={t.faqTitle}>
        <Accordion type="single" collapsible className="max-w-3xl">
          {t.faq.map((f, i) => (
            <AccordionItem key={f.title} value={`q${i}`}>
              <AccordionTrigger className="text-start">
                {f.title}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/75 leading-relaxed">
                {f.text}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* Join */}
      <section id="join" className="relative py-20 md:py-28">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 30% 40%, #1d4e8933, transparent 70%), radial-gradient(ellipse 50% 60% at 80% 60%, hsl(var(--primary) / 0.15), transparent 70%)",
          }}
        />
        <div className="container-custom grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="font-display text-3xl md:text-5xl leading-tight">
              {t.finalTitle}
            </h2>
            <p className="mt-4 text-lg text-foreground/75">{t.finalText}</p>
            <div className="mt-8 flex items-center gap-4">
              <LsspmLogo className="h-14 w-14 rounded-full bg-white p-0.5" />
              <span className="font-display text-2xl text-foreground/50">
                ×
              </span>
              <span className="rounded-xl bg-white px-2 py-1.5">
                <UpsyLogo className="h-8" />
              </span>
            </div>
            <ul className="mt-8 space-y-2">
              {t.journey.slice(0, 3).map((s, i) => (
                <li
                  key={s.title}
                  className="flex items-center gap-3 text-foreground/80"
                >
                  <Users className="h-4 w-4 text-primary" />
                  <span>
                    {i + 1}. {s.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <CampaignLeadForm config={config} />
          </div>
        </div>
      </section>
    </main>
  );
}
