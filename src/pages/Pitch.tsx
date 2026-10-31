// The pitch: four acts (problem, solution, added value, call to action),
// rewritten for whoever opens the link, read as a deck of panels. A 3D cloud
// behind the copy changes shape with the panel on screen; every figure links to its source; the share
// panel builds a personal link with UTM tags, so replies land in the CRM's
// content report under campaign "pitch".
import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { animate, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileDown,
  Linkedin,
  Mail,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import mehdiPhoto from "@/assets/mehdi-felji.webp";
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

// The deck reads one panel at a time: arrows, keyboard, swipe, or one wheel
// notch per panel. Panels taller than the screen scroll inside before the
// wheel moves on. Citation links jump to the references panel.
const CiteContext = createContext<(n: number) => void>(() => {});

export default function Pitch() {
  const { locale } = useLocale();
  const lang = pitchLang(locale);
  const rtl = lang === "ar";
  const { ui, audiences } = pitchCopy(lang);
  const [params, setParams] = useSearchParams();
  const audience = parseAudience(params.get("for"));
  const recipient = cleanRecipient(params.get("to"));
  const p = audiences[audience];
  const path = addLocalePrefix("/pitch", locale);
  const to = (href: string) => addLocalePrefix(href, locale);

  const [webgl, setWebgl] = useState(false);
  useEffect(() => {
    if (!canAffordWebGL()) return;
    const id = window.setTimeout(() => setWebgl(true), 600);
    return () => window.clearTimeout(id);
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

  const audienceLabels = Object.fromEntries(
    AUDIENCES.map((a) => [a, audiences[a].label]),
  ) as Record<Audience, string>;

  const labels = [
    ui.deck.intro,
    ui.acts[0],
    ui.acts[1],
    ui.acts[2],
    ui.team.label,
    ui.acts[3],
    ui.deck.send,
    ui.references,
  ];
  const COUNT = labels.length;
  const REFS = COUNT - 1;
  // Which 3D shape each panel shows: intro sphere, problem, solution, value,
  // the calm sphere behind the founder, the portal for the call to action and
  // "send", the sphere again behind the references.
  const SCENE = [0, 1, 2, 3, 0, 4, 4, 0];

  const [cur, setCur] = useState(0);
  const slides = useRef<(HTMLElement | null)[]>([]);
  const deck = useRef<HTMLDivElement>(null);
  const go = useCallback(
    (i: number) => setCur(Math.max(0, Math.min(COUNT - 1, i))),
    [COUNT],
  );

  // Deep links: /pitch#3 opens the third panel; the hash follows the reader.
  useEffect(() => {
    const n = Number(window.location.hash.slice(1));
    if (n >= 1 && n <= COUNT) setCur(n - 1);
  }, [COUNT]);
  useEffect(() => {
    const { pathname, search } = window.location;
    window.history.replaceState(
      window.history.state,
      "",
      cur ? `${pathname}${search}#${cur + 1}` : `${pathname}${search}`,
    );
    slides.current[cur]?.scrollTo({ top: 0 });
  }, [cur]);

  // Keyboard: arrows follow the reading direction, so → goes back in Arabic.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable=true]")) return;
      const fwd = rtl ? "ArrowLeft" : "ArrowRight";
      const back = rtl ? "ArrowRight" : "ArrowLeft";
      if (e.key === fwd || e.key === "PageDown") go(cur + 1);
      else if (e.key === back || e.key === "PageUp") go(cur - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(COUNT - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cur, go, rtl, COUNT]);

  // Wheel: one notch, one panel, unless the panel itself still scrolls.
  // Non-passive so the page behind does not scroll at the same time.
  useEffect(() => {
    const el = deck.current;
    if (!el) return;
    let locked = false;
    const onWheel = (e: WheelEvent) => {
      const dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const down = dy > 0;
      const slide = slides.current[cur];
      if (slide) {
        const canScroll = down
          ? slide.scrollTop + slide.clientHeight < slide.scrollHeight - 2
          : slide.scrollTop > 2;
        if (canScroll) return;
      }
      // Let the page scroll on to the footer past the last panel.
      if ((down && cur === COUNT - 1) || (!down && cur === 0)) return;
      e.preventDefault();
      if (locked || Math.abs(dy) < 12) return;
      locked = true;
      go(cur + (down ? 1 : -1));
      window.setTimeout(() => (locked = false), 850);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [cur, go, COUNT]);

  // Swipe: horizontal only, so vertical scrolling inside a panel still works.
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const forward = rtl ? dx > 0 : dx < 0;
    go(cur + (forward ? 1 : -1));
  };

  // The deck fills the screen under the site header.
  const [height, setHeight] = useState<string>("calc(100svh - 5rem)");
  useEffect(() => {
    const fit = () => {
      const header = document.querySelector("header");
      const top = header ? header.getBoundingClientRect().bottom : 80;
      setHeight(`${Math.max(window.innerHeight - Math.max(top, 0), 520)}px`);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const cite = useCallback(
    (n: number) => {
      go(REFS);
      window.setTimeout(
        () =>
          document
            .getElementById(`ref-${n}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" }),
        750,
      );
    },
    [go, REFS],
  );

  const stage = SCENE[cur] ?? 0;
  const dir = rtl ? -1 : 1;

  const panels: React.ReactNode[] = [
    // 0 · Intro
    <div key="intro" className="mx-auto w-full max-w-6xl">
      <div className="max-w-3xl">
        {recipient && (
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm backdrop-blur">
            <span className="text-white/60">{ui.preparedFor}</span>
            <span className="font-semibold" style={{ color: GOLD }}>
              {recipient}
            </span>
          </p>
        )}
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">
          {ui.eyebrow} · {ui.readTime}
        </p>
        <motion.h1
          key={audience + "h"}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-5 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl"
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
          labels={audienceLabels}
        />
        <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={() => go(1)}
            className="group inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-[#0D0406] transition hover:brightness-110"
            style={{ background: GOLD }}
          >
            {ui.deck.start}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:rotate-180" />
          </button>
          <Link
            to={to(p.cta.primary.to)}
            onClick={() => track(p.cta.primary.label, "hero", p.cta.primary.to)}
            className="inline-flex min-h-12 items-center rounded-full border border-white/20 px-6 text-sm text-white/85 hover:bg-white/5"
          >
            {p.cta.primary.label}
          </Link>
        </div>
        <p className="mt-6 text-xs text-white/45 print:hidden">
          {ui.deck.hint}
        </p>
      </div>
    </div>,

    // 1–3 · Problem, solution, added value
    ...[p.problem, p.solution, p.value].map((act, i) => (
      <ActBlock
        key={`act-${i}`}
        index={i + 1}
        kicker={ui.acts[i]}
        act={act}
        audience={audience}
        lang={lang}
      />
    )),

    // 4 · Who's behind it
    <div
      key="team"
      className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="order-2 lg:order-1">
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">
          {ui.team.label}
        </p>
        <h2 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">
          {ui.team.title}
        </h2>
        <blockquote
          className="mt-6 border-s-2 ps-5 font-display text-xl italic leading-snug text-white/90 sm:text-2xl"
          style={{ borderColor: GOLD }}
        >
          {lang === "en" ? `“${ui.team.quote}”` : `« ${ui.team.quote} »`}
        </blockquote>
        <ul className="mt-6 space-y-2">
          {ui.team.fields.map((f) => (
            <li
              key={f}
              className="flex gap-3 text-sm text-white/80 sm:text-base"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: GOLD }}
              />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {ui.team.proofs.map((pr) => (
            <div
              key={pr.v}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
            >
              <p
                className="font-display text-3xl leading-none"
                style={{ color: GOLD }}
              >
                {pr.k}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                {pr.v}
              </p>
            </div>
          ))}
        </div>
        <Link
          to={to("/founder")}
          onClick={() => track(ui.team.link, "team", "/founder")}
          className="mt-6 inline-flex items-center gap-2 text-sm underline decoration-white/30 underline-offset-4 hover:decoration-current print:hidden"
          style={{ color: GOLD }}
        >
          {ui.team.link}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
      <figure className="relative order-1 mx-auto w-full max-w-[320px] lg:order-2 lg:max-w-none">
        <div
          className="absolute -inset-3 rounded-[2rem] opacity-60 blur-2xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(242,183,5,0.35), transparent)",
          }}
          aria-hidden="true"
        />
        <img
          src={mehdiPhoto}
          alt={ui.team.photoAlt}
          loading="lazy"
          decoding="async"
          className="relative aspect-[4/5] w-full rounded-[1.75rem] object-cover object-top ring-1 ring-white/15"
        />
        <figcaption className="absolute inset-x-0 bottom-0 rounded-b-[1.75rem] bg-gradient-to-t from-[#0D0406] via-[#0D0406]/80 to-transparent p-5 pt-16">
          <p className="font-display text-xl">{ui.team.name}</p>
          <p className="text-xs text-white/70">{ui.team.role}</p>
        </figcaption>
      </figure>
    </div>,

    // 5 · Call to action
    <div key="cta" className="mx-auto w-full max-w-6xl">
      <div className="max-w-2xl">
        <Kicker index={4} label={ui.acts[3]} />
        <h2 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">
          {p.cta.title}
        </h2>
        <p className="mt-5 text-base text-white/80 sm:text-lg">{p.cta.body}</p>

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
                          go(0);
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
    </div>,

    // 6 · Send, media and resources
    <div key="send" className="mx-auto w-full max-w-6xl space-y-10">
      <SharePanel
        ui={ui.share}
        audience={audience}
        audienceLabels={audienceLabels}
        path={path}
        onShare={(channel) => track(channel, "share", channel)}
      />
      <div>
        <h2 className="font-display text-2xl sm:text-3xl">{ui.resources}</h2>
        <p className="mt-2 text-white/70">{ui.resourcesSub}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>,

    // 7 · References
    <div key="refs" className="mx-auto w-full max-w-6xl">
      <h2 className="font-display text-2xl sm:text-3xl">{ui.references}</h2>
      <p className="mt-2 text-sm text-white/65">{ui.referencesNote}</p>
      <ol className="mt-8 space-y-4" dir="ltr">
        {REFERENCES.map((r) => (
          <li key={r.id} id={`ref-${r.id}`} className="flex gap-4 text-sm">
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
    </div>,
  ];

  return (
    <CiteContext.Provider value={cite}>
      <div
        dir={rtl ? "rtl" : "ltr"}
        className="pitch relative bg-[#0D0406] text-[#FAFAFA] font-body selection:bg-[hsl(var(--gold-accent))] selection:text-[#0D0406]"
      >
        <SEOHead path="/pitch" />
        <style>{PRINT_CSS}</style>

        <div
          ref={deck}
          // Lenis (site-wide smooth scroll) would scroll the page on the
          // same wheel event that turns the panel.
          data-lenis-prevent
          className="pitch-deck relative overflow-hidden"
          style={{ height }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="region"
          aria-roledescription="carousel"
          aria-label={ui.eyebrow}
        >
          {/* Backdrop: decorative, never able to take the page down. */}
          <div
            className="pitch-backdrop pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
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

          {panels.map((node, i) => (
            <section
              key={i}
              ref={(el) => {
                slides.current[i] = el;
              }}
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${COUNT} · ${labels[i]}`}
              aria-hidden={i !== cur}
              inert={i !== cur}
              className="pitch-page absolute inset-0 overflow-y-auto overscroll-contain px-4 pb-28 pt-10 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-16 lg:px-24"
              style={{
                transform: `translateX(${(i - cur) * 100 * dir}%)`,
                opacity: i === cur ? 1 : 0,
              }}
            >
              <div className="flex min-h-full items-center">{node}</div>
            </section>
          ))}

          <DeckControls
            cur={cur}
            labels={labels}
            go={go}
            prevLabel={ui.deck.prev}
            nextLabel={ui.deck.next}
          />
        </div>
      </div>
    </CiteContext.Provider>
  );
}

/**
 * Side arrows on large screens, a bottom bar everywhere: previous, a
 * segmented progress bar (one segment per panel, clickable), next. Left and
 * right swap meaning in Arabic, like the keyboard.
 */
function DeckControls({
  cur,
  labels,
  go,
  prevLabel,
  nextLabel,
}: {
  cur: number;
  labels: string[];
  go: (i: number) => void;
  prevLabel: string;
  nextLabel: string;
}) {
  const last = labels.length - 1;
  const round =
    "items-center justify-center rounded-full border border-white/20 bg-[#0D0406]/60 text-white backdrop-blur transition hover:border-white/50 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-25";
  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={() => go(cur - 1)}
        disabled={cur === 0}
        aria-label={prevLabel}
        className={`${round} absolute start-4 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 lg:inline-flex`}
      >
        <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => go(cur + 1)}
        disabled={cur === last}
        aria-label={nextLabel}
        className={`${round} absolute end-4 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 lg:inline-flex`}
      >
        <ChevronRight className="h-6 w-6 rtl:rotate-180" />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#0D0406] via-[#0D0406]/85 to-transparent px-4 pb-4 pt-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <button
            type="button"
            onClick={() => go(cur - 1)}
            disabled={cur === 0}
            aria-label={prevLabel}
            className={`${round} inline-flex h-11 w-11 shrink-0`}
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-baseline justify-between gap-3 text-xs">
              <span className="truncate text-white/80">{labels[cur]}</span>
              <span className="shrink-0 font-mono text-white/50" dir="ltr">
                {String(cur + 1).padStart(2, "0")} /{" "}
                {String(labels.length).padStart(2, "0")}
              </span>
            </div>
            <div className="flex gap-1.5">
              {labels.map((l, i) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${i + 1}. ${l}`}
                  aria-current={i === cur ? "step" : undefined}
                  title={l}
                  className="group flex h-6 flex-1 items-center"
                >
                  <span
                    className="block h-1 w-full rounded-full transition-colors"
                    style={{
                      background: i <= cur ? GOLD : "rgba(255,255,255,0.18)",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => go(cur + 1)}
            disabled={cur === last}
            aria-label={nextLabel}
            className={`${round} inline-flex h-11 w-11 shrink-0`}
            style={
              cur < last
                ? {
                    background: GOLD,
                    color: "#0D0406",
                    borderColor: "transparent",
                  }
                : undefined
            }
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>
      </div>
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
    <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
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
      {act.stats?.length ? (
        <div className="space-y-3">
          <StatCard stat={act.stats[0]} lang={lang} />
          {act.stats.length > 1 && (
            <div className="grid grid-cols-2 gap-3">
              {act.stats.slice(1).map((st) => (
                <StatCard key={st.label} stat={st} lang={lang} small />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  stat,
  lang,
  small,
}: {
  stat: Stat;
  lang: PitchLang;
  small?: boolean;
}) {
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
      className={`rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl ${small ? "p-4" : "p-7 shadow-[0_0_80px_rgba(242,183,5,0.08)]"}`}
    >
      <p
        className={`font-display leading-none ${small ? "text-3xl" : "text-6xl sm:text-7xl"}`}
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
      <p
        className={`leading-relaxed text-white/75 ${small ? "mt-2 text-xs" : "mt-4 text-sm"}`}
      >
        <CitedText text={stat.label} />
      </p>
    </div>
  );
}

/** Renders [n] markers as superscript links to the reference list. */
function CitedText({ text }: { text: Cited }) {
  const parts = useMemo(() => splitCitations(text), [text]);
  const cite = useContext(CiteContext);
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
                onClick={(e) => {
                  e.preventDefault();
                  cite(n);
                }}
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
    <section className="print:hidden">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-10">
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

// Printed or saved as PDF: every panel, one per page, light background, no chrome.
const PRINT_CSS = `
@media print {
  header, footer, nav, .pitch-backdrop, [aria-labelledby="consent-title"] { display: none !important; }
  .pitch { background: #fff !important; color: #111 !important; }
  .pitch * { color: #111 !important; opacity: 1 !important; transform: none !important; box-shadow: none !important; text-shadow: none !important; backdrop-filter: none !important; }
  .pitch .pitch-deck { height: auto !important; overflow: visible !important; }
  .pitch .pitch-page { position: static !important; overflow: visible !important; padding-bottom: 2rem !important; page-break-after: always; break-after: page; }
  .pitch [class*="bg-white/"] { background: #f6f3ee !important; border-color: #ddd !important; }
}
`;
