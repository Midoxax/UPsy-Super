// The pitch: four acts (problem, solution, added value, call to action),
// rewritten for whoever opens the link. A 3D cloud behind the copy changes
// shape with the act on screen; every figure links to its source; the share
// panel builds a personal link with UTM tags, so replies land in the CRM's
// content report under campaign "pitch".
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  FileDown,
  Linkedin,
  Mail,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useSearchParams } from "@/lib/router-compat";
import SEOHead from "@/components/SEOHead";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { SITE_URL } from "@/config/site";
import { trackCTAClick } from "@/lib/analytics/gtm";
import { canAffordWebGL } from "@/lib/motion/canAffordWebGL";
import {
  AUDIENCES,
  REFERENCES,
  cleanRecipient,
  parseAudience,
  pitchCopy,
  pitchLang,
  pitchUrl,
  splitCitations,
  type Act,
  type Audience,
  type Cited,
  type PitchLang,
  type ShareChannel,
  type Stat,
} from "@/lib/pitch/content";

const PitchScene = lazy(() => import("@/components/three/PitchScene"));

// Fallback glow per stage when WebGL is skipped: same story, in gradients.
const GLOW = [
  "radial-gradient(60% 50% at 70% 40%, rgba(139,30,45,0.55), transparent 70%)",
  "radial-gradient(70% 60% at 75% 45%, rgba(224,69,58,0.35), transparent 70%)",
  "radial-gradient(55% 45% at 70% 45%, rgba(242,183,5,0.30), transparent 70%)",
  "radial-gradient(40% 70% at 72% 50%, rgba(246,211,101,0.30), transparent 70%)",
  "radial-gradient(45% 45% at 50% 50%, rgba(255,244,194,0.35), transparent 70%)",
];

const GOLD = "hsl(var(--gold-accent))";

export default function Pitch() {
  const { locale } = useLocale();
  const lang = pitchLang(locale);
  const { ui, audiences } = pitchCopy(lang);
  const [params, setParams] = useSearchParams();
  const audience = parseAudience(params.get("for"));
  const recipient = cleanRecipient(params.get("to"));
  const p = audiences[audience];
  const path = addLocalePrefix("/pitch", locale);
  const to = (href: string) => addLocalePrefix(href, locale);

  const [stage, setStage] = useState(0);
  const [webgl, setWebgl] = useState(false);
  useEffect(() => {
    if (!canAffordWebGL()) return;
    const id = window.setTimeout(() => setWebgl(true), 600);
    return () => window.clearTimeout(id);
  }, []);

  const sections = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting)
            setStage(Number((e.target as HTMLElement).dataset.stage));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of sections.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  const setAudience = (a: Audience) => {
    const next = new URLSearchParams(params);
    if (a === "all") next.delete("for");
    else next.set("for", a);
    setParams(next, { replace: true });
  };

  const track = (label: string, where: string, destination: string) =>
    trackCTAClick(label, `pitch_${where}`, "/pitch", {
      audience,
      destination,
    });

  const acts: { key: "problem" | "solution" | "value"; act: Act }[] = [
    { key: "problem", act: p.problem },
    { key: "solution", act: p.solution },
    { key: "value", act: p.value },
  ];

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`pitch relative bg-[#0D0406] text-[#FAFAFA] font-body overflow-x-clip selection:bg-[hsl(var(--gold-accent))] selection:text-[#0D0406]`}
    >
      <SEOHead path="/pitch" />
      <style>{PRINT_CSS}</style>

      {/* Backdrop: a viewport-tall layer that follows the reader. The
          page transition wrapper is transformed, which breaks "fixed";
          a sticky layer inside a page-tall box still follows the viewport and
          stops at the end of the page. Decorative, and never able to
          take the page down. */}
      <div
        className="pitch-backdrop pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div
            className="absolute inset-0 transition-[background] duration-1000"
            style={{ background: GLOW[stage] }}
          />
          {webgl && (
            <ErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <div className="absolute inset-0 opacity-90 md:translate-x-[18%] rtl:md:-translate-x-[18%]">
                  <PitchScene stage={stage} />
                </div>
              </Suspense>
            </ErrorBoundary>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0406] via-[#0D0406]/70 to-transparent rtl:bg-gradient-to-l" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 print:hidden">
        <div className="sticky top-0 h-[100svh]">
          <ProgressRail stage={stage} labels={ui.acts} />
        </div>
      </div>

      {/* Hero */}
      <section
        ref={(el) => {
          sections.current[0] = el;
        }}
        data-stage={0}
        className="pitch-page relative z-10 min-h-[100svh] flex items-center px-4 sm:px-8"
      >
        <div className="mx-auto w-full max-w-6xl pt-28 pb-16">
          <div className="max-w-3xl">
            {recipient && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm backdrop-blur"
              >
                <span className="text-white/60">{ui.preparedFor}</span>
                <span className="font-semibold" style={{ color: GOLD }}>
                  {recipient}
                </span>
              </motion.p>
            )}
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">
              {ui.eyebrow} · {ui.readTime}
            </p>
            <motion.h1
              key={audience + "h"}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-5 font-display text-4xl leading-[1.05] sm:text-6xl lg:text-[4.25rem]"
            >
              {p.hero.title}{" "}
              <span className="block" style={{ color: GOLD }}>
                {p.hero.accent}
              </span>
            </motion.h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              <CitedText text={p.hero.sub} />
            </p>

            <AudiencePicker
              label={ui.audienceLabel}
              value={audience}
              onChange={setAudience}
              labels={
                Object.fromEntries(
                  AUDIENCES.map((a) => [a, audiences[a].label]),
                ) as Record<Audience, string>
              }
            />

            <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
              <Link
                to={to(p.cta.primary.to)}
                onClick={() =>
                  track(p.cta.primary.label, "hero", p.cta.primary.to)
                }
                className="group inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-[#0D0406] transition hover:brightness-110"
                style={{ background: GOLD }}
              >
                {p.cta.primary.label}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:rotate-180" />
              </Link>
              <a
                href="#act-1"
                className="inline-flex min-h-12 items-center rounded-full border border-white/20 px-6 text-sm text-white/85 hover:bg-white/5"
              >
                {ui.scroll}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Acts 1–3 */}
      {acts.map(({ key, act }, i) => (
        <section
          key={key}
          id={`act-${i + 1}`}
          ref={(el) => {
            sections.current[i + 1] = el;
          }}
          data-stage={i + 1}
          className="pitch-page relative z-10 min-h-[100svh] flex items-center px-4 sm:px-8 scroll-mt-16"
        >
          <ActBlock
            index={i + 1}
            kicker={ui.acts[i]}
            act={act}
            audience={audience}
            lang={lang}
          />
        </section>
      ))}

      {/* Act 4: call to action */}
      <section
        id="act-4"
        ref={(el) => {
          sections.current[4] = el;
        }}
        data-stage={4}
        className="pitch-page relative z-10 min-h-[100svh] flex items-center px-4 sm:px-8 scroll-mt-16"
      >
        <div className="mx-auto w-full max-w-6xl py-24">
          <div className="max-w-2xl">
            <Kicker index={4} label={ui.acts[3]} />
            <h2 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">
              {p.cta.title}
            </h2>
            <p className="mt-5 text-base text-white/80 sm:text-lg">
              {p.cta.body}
            </p>

            {audience === "all" ? (
              <div className="mt-8">
                <p className="mb-4 text-sm uppercase tracking-widest text-white/60">
                  {ui.doorsTitle}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {AUDIENCES.filter((a) => a !== "all").map((a) => {
                    const door = audiences[a];
                    return (
                      <div
                        key={a}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md"
                      >
                        <p
                          className="text-sm font-semibold"
                          style={{ color: GOLD }}
                        >
                          {door.label}
                        </p>
                        <p className="mt-1 text-sm text-white/75">
                          {door.cta.title}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                          <Link
                            to={to(door.cta.primary.to)}
                            onClick={() =>
                              track(
                                door.cta.primary.label,
                                `door_${a}`,
                                door.cta.primary.to,
                              )
                            }
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-[#0D0406]"
                            style={{ background: GOLD }}
                          >
                            {door.cta.primary.label}
                            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setAudience(a);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 text-sm text-white/80 hover:bg-white/5"
                          >
                            {ui.audienceLabel} {door.label.toLowerCase()}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-8 flex flex-wrap gap-3 print:hidden">
                <Link
                  to={to(p.cta.primary.to)}
                  onClick={() =>
                    track(p.cta.primary.label, "cta", p.cta.primary.to)
                  }
                  className="group inline-flex min-h-14 items-center gap-2 rounded-full px-8 text-base font-semibold text-[#0D0406] shadow-[0_0_40px_rgba(242,183,5,0.35)] transition hover:brightness-110"
                  style={{ background: GOLD }}
                >
                  {p.cta.primary.label}
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5 rtl:rotate-180" />
                </Link>
                <Link
                  to={to(p.cta.secondary.to)}
                  onClick={() =>
                    track(
                      p.cta.secondary.label,
                      "cta_secondary",
                      p.cta.secondary.to,
                    )
                  }
                  className="inline-flex min-h-14 items-center rounded-full border border-white/25 px-8 text-base text-white/90 hover:bg-white/5"
                >
                  {p.cta.secondary.label}
                </Link>
              </div>
            )}
            <p className="mt-5 flex items-center gap-2 text-sm text-white/70">
              <Check className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
              {p.cta.reassurance}
            </p>
            {/* Printed copies keep the way back in. */}
            <p className="mt-4 hidden text-sm print:block">
              {SITE_URL.replace(/^https?:\/\//, "")}
              {to(p.cta.primary.to)}
            </p>
          </div>
        </div>
      </section>

      <SharePanel
        ui={ui.share}
        audience={audience}
        audienceLabels={
          Object.fromEntries(
            AUDIENCES.map((a) => [a, audiences[a].label]),
          ) as Record<Audience, string>
        }
        path={path}
        onShare={(channel) => track(channel, "share", channel)}
      />

      {/* Resources and media */}
      <section className="relative z-10 px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl sm:text-3xl">{ui.resources}</h2>
          <p className="mt-2 text-white/70">{ui.resourcesSub}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ui.resourceItems.map((r) => (
              <Link
                key={r.to}
                to={to(r.to)}
                onClick={() => track(r.title, "resources", r.to)}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                <p className="flex items-center justify-between font-semibold">
                  {r.title}
                  <ArrowRight className="h-4 w-4 opacity-50 transition group-hover:opacity-100 rtl:rotate-180" />
                </p>
                <p className="mt-1 text-sm text-white/65">{r.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* References */}
      <section id="references" className="relative z-10 px-4 pb-28 sm:px-8">
        <div className="mx-auto max-w-6xl border-t border-white/10 pt-12">
          <h2 className="font-display text-2xl sm:text-3xl">{ui.references}</h2>
          <p className="mt-2 text-sm text-white/65">{ui.referencesNote}</p>
          <ol className="mt-8 space-y-4" dir="ltr">
            {REFERENCES.map((r) => (
              <li
                key={r.id}
                id={`ref-${r.id}`}
                className="flex gap-4 scroll-mt-24 text-sm"
              >
                <span className="font-mono text-white/50">[{r.id}]</span>
                <span className="text-white/80">
                  {r.authors} ({r.year}). {r.title}. <em>{r.source}</em>.{" "}
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline decoration-white/30 underline-offset-2 hover:decoration-current"
                    style={{ color: GOLD }}
                  >
                    {r.url.replace("https://", "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

function Kicker({ index, label }: { index: number; label: string }) {
  return (
    <p className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/60">
      <span
        className="font-display text-2xl tracking-normal"
        style={{ color: GOLD }}
      >
        {String(index).padStart(2, "0")}
      </span>
      <span className="h-px w-10 bg-white/25" />
      {label}
    </p>
  );
}

function ActBlock({
  index,
  kicker,
  act,
  audience,
  lang,
}: {
  index: number;
  kicker: string;
  act: Act;
  audience: Audience;
  lang: PitchLang;
}) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 py-24 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
      <motion.div
        key={audience}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <Kicker index={index} label={kicker} />
        <h2 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">
          {act.title}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">
          <CitedText text={act.body} />
        </p>
        <ul className="mt-7 space-y-3">
          {act.points.map((pt) => (
            <li
              key={pt}
              className="flex gap-3 text-sm text-white/85 sm:text-base"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: GOLD }}
              />
              <span>
                <CitedText text={pt} />
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
      {act.stat && <StatCard stat={act.stat} lang={lang} />}
    </div>
  );
}

function StatCard({ stat, lang }: { stat: Stat; lang: PitchLang }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [shown, setShown] = useState(stat.value);
  const decimals = stat.decimals ?? 0;

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(stat.value);
      return;
    }
    const c = animate(0, stat.value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setShown,
    });
    return () => c.stop();
  }, [inView, stat.value]);

  return (
    <div
      ref={ref}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl shadow-[0_0_80px_rgba(242,183,5,0.08)]"
    >
      <p
        className="font-display text-6xl leading-none sm:text-7xl"
        style={{ color: GOLD }}
        dir="ltr"
      >
        {stat.prefix}
        {shown.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {stat.suffix}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-white/75">
        <CitedText text={stat.label} />
      </p>
    </div>
  );
}

/** Renders [n] markers as superscript links to the reference list. */
function CitedText({ text }: { text: Cited }) {
  const parts = useMemo(() => splitCitations(text), [text]);
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <sup key={i} className="ms-0.5">
            {part.map((n, j) => (
              <a
                key={n}
                href={`#ref-${n}`}
                className="font-mono text-[0.7em] hover:underline"
                style={{ color: GOLD }}
              >
                {j > 0 ? "," : "["}
                {n}
                {j === part.length - 1 ? "]" : ""}
              </a>
            ))}
          </sup>
        ),
      )}
    </>
  );
}

function AudiencePicker({
  label,
  value,
  onChange,
  labels,
}: {
  label: string;
  value: Audience;
  onChange: (a: Audience) => void;
  labels: Record<Audience, string>;
}) {
  return (
    <div className="mt-8 print:hidden">
      <p className="mb-2 text-xs uppercase tracking-widest text-white/50">
        {label}
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {AUDIENCES.map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={value === a}
            onClick={() => onChange(a)}
            className={`min-h-10 rounded-full border px-4 text-sm transition ${
              value === a
                ? "border-transparent font-semibold text-[#0D0406]"
                : "border-white/20 text-white/80 hover:bg-white/5"
            }`}
            style={value === a ? { background: GOLD } : undefined}
          >
            {labels[a]}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgressRail({ stage, labels }: { stage: number; labels: string[] }) {
  return (
    <nav
      aria-label={labels.join(" · ")}
      className="pointer-events-auto absolute end-6 top-1/2 hidden -translate-y-1/2 flex-col gap-4 lg:flex"
    >
      {labels.map((l, i) => (
        <a
          key={l}
          href={`#act-${i + 1}`}
          className="group flex items-center justify-end gap-3"
        >
          <span
            className={`text-xs transition ${
              stage === i + 1
                ? "text-white"
                : "text-white/0 group-hover:text-white/60"
            }`}
          >
            {l}
          </span>
          <span
            className="block h-2.5 w-2.5 rounded-full border border-white/40 transition"
            style={
              stage >= i + 1
                ? { background: GOLD, borderColor: "transparent" }
                : undefined
            }
          />
        </a>
      ))}
    </nav>
  );
}

function SharePanel({
  ui,
  audience,
  audienceLabels,
  path,
  onShare,
}: {
  ui: ReturnType<typeof pitchCopy>["ui"]["share"];
  audience: Audience;
  audienceLabels: Record<Audience, string>;
  path: string;
  onShare: (c: ShareChannel | "print") => void;
}) {
  const [forWho, setForWho] = useState<Audience>(audience);
  const [name, setName] = useState("");
  useEffect(() => setForWho(audience), [audience]);

  const url = (c: ShareChannel) => pitchUrl(SITE_URL, path, forWho, name, c);
  const text = `${ui.message} `;

  const copy = async () => {
    onShare("copy");
    try {
      await navigator.clipboard.writeText(url("copy"));
      toast.success(ui.copied);
    } catch {
      window.prompt(ui.copy, url("copy"));
    }
  };

  const btn =
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm text-white/90 hover:bg-white/5";

  return (
    <section className="relative z-10 px-4 py-16 sm:px-8 print:hidden">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-10">
        <h2 className="font-display text-2xl sm:text-3xl">{ui.title}</h2>
        <p className="mt-2 max-w-2xl text-white/70">{ui.sub}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-white/60">{ui.for}</span>
            <select
              value={forWho}
              onChange={(e) => setForWho(e.target.value as Audience)}
              className="mt-1 block min-h-11 w-full rounded-xl border border-white/15 bg-[#1a0a0d] px-3 text-white"
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {audienceLabels[a]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-white/60">{ui.name}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder={ui.namePlaceholder}
              className="mt-1 block min-h-11 w-full rounded-xl border border-white/15 bg-[#1a0a0d] px-3 text-white placeholder:text-white/35"
            />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={copy} className={btn}>
            <Copy className="h-4 w-4" /> {ui.copy}
          </button>
          <a
            className={btn}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShare("whatsapp")}
            href={`https://wa.me/?text=${encodeURIComponent(text + url("whatsapp"))}`}
          >
            <MessageCircle className="h-4 w-4" /> {ui.whatsapp}
          </a>
          <a
            className={btn}
            onClick={() => onShare("email")}
            href={`mailto:?subject=${encodeURIComponent(ui.subject)}&body=${encodeURIComponent(
              text + "\n\n" + url("email"),
            )}`}
          >
            <Mail className="h-4 w-4" /> {ui.email}
          </a>
          <a
            className={btn}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShare("linkedin")}
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              url("linkedin"),
            )}`}
          >
            <Linkedin className="h-4 w-4" /> {ui.linkedin}
          </a>
          <button
            type="button"
            className={btn}
            onClick={() => {
              onShare("print");
              window.print();
            }}
          >
            <FileDown className="h-4 w-4" /> {ui.print}
          </button>
        </div>
      </div>
    </section>
  );
}

// Printed or saved as PDF: one act per page, light background, no chrome.
const PRINT_CSS = `
@media print {
  header, footer, nav, .pitch-backdrop { display: none !important; }
  .pitch { background: #fff !important; color: #111 !important; }
  .pitch * { color: #111 !important; opacity: 1 !important; transform: none !important; box-shadow: none !important; text-shadow: none !important; backdrop-filter: none !important; }
  .pitch .pitch-page { min-height: auto !important; page-break-after: always; break-after: page; }
  .pitch [class*="bg-white/"] { background: #f6f3ee !important; border-color: #ddd !important; }
}
`;
