import {
  Activity,
  CalendarRange,
  Flag,
  Gauge,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { LIGHT } from "@/lib/performance/metrics";

const ICONS = [Gauge, Activity, SlidersHorizontal, Flag, CalendarRange, Users];

const COPY = {
  fr: {
    eyebrow: "Centre de performance",
    title: "Préparez votre mental comme une écurie prépare sa voiture.",
    sub: "Entre les séances avec votre psychologue, un centre de développement complet. Chaque outil repose sur une méthode reconnue en psychologie du sport.",
    modules: [
      [
        "Muret des stands",
        "Trois voyants et les notes de l'ingénieur : ce qui demande votre attention aujourd'hui.",
      ],
      [
        "Télémétrie",
        "Disponibilité face à votre propre normale, charge par RPE de séance (Foster), sommeil et VFC.",
      ],
      [
        "Fiche de réglages",
        "Profil de performance (Butler & Hardy) : vos qualités, votre cible, vos priorités.",
      ],
      [
        "Week-end de course",
        "Zone d'activation (IZOF), routine minutée, plans si-alors, check avant départ, débrief.",
      ],
      [
        "Saison",
        "Les phases de préparation et les compétitions sur une même ligne du temps.",
      ],
      [
        "Équipe",
        "Vous choisissez ce que voit votre psychologue, rubrique par rubrique.",
      ],
    ],
    cta: "Ouvrir mon Centre de performance",
    demoNext: "Prochaine compétition",
    lights: ["Disponibilité", "Charge", "Récupération"],
    states: ["Attaquer", "Gérer", "Attaquer"],
  },
  en: {
    eyebrow: "Performance Center",
    title: "Prepare your mind the way a race team prepares its car.",
    sub: "Between sessions with your psychologist, a full development hub. Every tool rests on an established sport-psychology method.",
    modules: [
      [
        "Pit wall",
        "Three lights and the engineer's notes: what needs your attention today.",
      ],
      [
        "Telemetry",
        "Readiness against your own normal, load by session RPE (Foster), sleep and HRV.",
      ],
      [
        "Setup sheet",
        "Performance profiling (Butler & Hardy): your qualities, your target, your priorities.",
      ],
      [
        "Race weekend",
        "Activation zone (IZOF), timed routine, if-then plans, pre-race check, debrief.",
      ],
      ["Season", "Preparation phases and competitions on one timeline."],
      [
        "Pit crew",
        "You choose what your psychologist sees, section by section.",
      ],
    ],
    cta: "Open my Performance Center",
    demoNext: "Next competition",
    lights: ["Readiness", "Load", "Recovery"],
    states: ["Push", "Manage", "Push"],
  },
  ar: {
    eyebrow: "مركز الأداء",
    title: "حضّر ذهنك كما يحضّر فريق السباق سيارته.",
    sub: "بين جلساتك مع أخصائيك، مركز تطوير متكامل. كل أداة مبنية على منهج معترف به في علم النفس الرياضي.",
    modules: [
      [
        "جدار الصيانة",
        "ثلاثة مؤشرات وملاحظات المهندس: ما يحتاج انتباهك اليوم.",
      ],
      [
        "القياس عن بُعد",
        "الجاهزية مقارنة بمعدّلك المعتاد، الحِمل حسب تقدير الجهد (Foster)، النوم وتقلب النبض.",
      ],
      ["ورقة الإعدادات", "ملف الأداء (Butler & Hardy): صفاتك، هدفك، أولوياتك."],
      [
        "عطلة السباق",
        "منطقة التنشيط (IZOF)، روتين مؤقت، خطط إذا-فإن، فحص ما قبل الانطلاق، تقييم.",
      ],
      ["الموسم", "مراحل الإعداد والمنافسات على خط زمني واحد."],
      ["الفريق", "تختار ما يراه أخصائيك، قسمًا بقسم."],
    ],
    cta: "افتح مركز الأداء",
    demoNext: "المنافسة القادمة",
    lights: ["الجاهزية", "الحِمل", "الاسترجاع"],
    states: ["انطلق", "تحكّم", "انطلق"],
  },
};

const DEMO = [62, 66, 64, 70, 72, 69, 74, 71, 76, 73, 78, 80];

/** The Performance Center presented on the athletes' page, with a small
 *  illustrative pit wall (sample values, not anyone's data). */
export default function PerformanceShowcase() {
  const { locale } = useLocale();
  const c = COPY[locale === "en" || locale === "ar" ? locale : "fr"];
  const path = DEMO.map(
    (v, i) =>
      `${i === 0 ? "M" : "L"}${(i / (DEMO.length - 1)) * 100},${45 - (v - 60) * 2}`,
  ).join(" ");

  return (
    <section
      className="relative overflow-hidden bg-[#0b0c10] text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 90% 10%, rgba(255,179,0,0.16), transparent 45%), radial-gradient(circle at 0% 100%, rgba(109,15,34,0.5), transparent 50%)",
      }}
    >
      <div className="container-custom grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {c.eyebrow}
          </p>
          <h2 className="font-display text-3xl leading-tight md:text-5xl">
            {c.title}
          </h2>
          <p className="max-w-xl text-white/70">{c.sub}</p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {c.modules.map(([title, body], i) => {
              const Icon = ICONS[i];
              return (
                <li key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-white/60">{body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Button size="lg" variant="primary" asChild>
            <Link to={addLocalePrefix("/athlete-hub", locale)}>{c.cta}</Link>
          </Button>
        </div>

        {/* Illustrative pit wall */}
        <div
          aria-hidden
          className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl"
        >
          <div className="grid grid-cols-3 gap-2">
            {c.lights.map((l, i) => {
              const tone = i === 1 ? LIGHT.amber : LIGHT.green;
              return (
                <div key={l} className="rounded-2xl bg-black/30 p-3">
                  <span
                    className="mb-2 block h-3 w-3 rounded-full"
                    style={{ background: tone, boxShadow: `0 0 12px ${tone}` }}
                  />
                  <p className="text-[10px] uppercase tracking-widest text-white/50">
                    {l}
                  </p>
                  <p className="text-sm font-semibold">{c.states[i]}</p>
                </div>
              );
            })}
          </div>
          <div className="rounded-2xl bg-black/30 p-4">
            <svg
              viewBox="0 0 100 50"
              className="h-24 w-full"
              preserveAspectRatio="none"
            >
              <path
                d={path}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-black/30 p-4">
            <span className="text-sm text-white/60">{c.demoNext}</span>
            <span className="font-display text-3xl text-primary" dir="ltr">
              {locale === "fr" ? "J-4" : "D-4"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
