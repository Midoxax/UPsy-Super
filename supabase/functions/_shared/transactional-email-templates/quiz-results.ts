/** Mental Performance Score results, sent after the free score. FR / EN / AR. */
import {
  BRAND,
  button,
  callout,
  escapeHtml,
  type Locale,
  normaliseLocale,
  p,
  renderEmail,
  rich,
  subheading,
  toText,
} from "../email/layout.ts";
import type { TemplateEntry } from "./registry.ts";

type Pillar = "focus" | "regulation" | "recovery" | "meaning";

interface Props {
  name?: string;
  score?: number;
  pillars?: Record<Pillar, number>;
  weakestPillar?: Pillar;
  lang?: string;
  bookingUrl?: string;
  matchUrl?: string;
  resultsUrl?: string;
}

const PILLAR: Record<Pillar, Record<Locale, string>> = {
  focus: { en: "Focus", fr: "Concentration", ar: "التركيز" },
  regulation: {
    en: "Emotional regulation",
    fr: "Régulation émotionnelle",
    ar: "التنظيم الانفعالي",
  },
  recovery: {
    en: "Recovery and energy",
    fr: "Récupération et énergie",
    ar: "التعافي والطاقة",
  },
  meaning: {
    en: "Meaning and connection",
    fr: "Sens et lien",
    ar: "المعنى والتواصل",
  },
};

// What working on this area usually involves. No promised results.
const PILLAR_WORK: Record<Pillar, Record<Locale, string>> = {
  focus: {
    en: "A specialist can help you build an attention routine for training, competition and daily work.",
    fr: "Un spécialiste peut vous aider à construire une routine d'attention pour l'entraînement, la compétition et le quotidien.",
    ar: "يمكن لأخصائي مساعدتك على بناء روتين للانتباه في التدريب والمنافسة والحياة اليومية.",
  },
  regulation: {
    en: "Approaches such as CBT and ACT are used to work on stress, worry and pressure moments.",
    fr: "Des approches comme la TCC et l'ACT sont utilisées pour travailler le stress, les ruminations et les moments de pression.",
    ar: "تُستعمل مقاربات مثل العلاج المعرفي السلوكي وعلاج القبول والالتزام للعمل على الضغط والقلق ولحظات الضغط.",
  },
  recovery: {
    en: "Work on sleep, recovery routines and energy management is a common starting point.",
    fr: "Le travail sur le sommeil, les routines de récupération et la gestion de l'énergie est un point de départ fréquent.",
    ar: "العمل على النوم وروتين التعافي وتدبير الطاقة نقطة انطلاق شائعة.",
  },
  meaning: {
    en: "Values-based work and the quality of your relationships are explored together with a specialist.",
    fr: "Le travail sur vos valeurs et la qualité de vos relations s'explore avec un spécialiste.",
    ar: "يُستكشف العمل على قيمك وجودة علاقاتك رفقة أخصائي.",
  },
};

const T = {
  en: {
    subject: (s: number) => `Your Mental Performance Score: ${s}/100`,
    pre: "Your score, your four areas and your next step.",
    eyebrow: "Mental Performance Score",
    title: "Your results are in",
    hi: (n?: string) => (n ? `Hi ${n},` : "Hi,"),
    intro:
      "Thank you for taking the Mental Performance Score. Here is your snapshot across the four areas it measures.",
    overall: "Overall score",
    breakdown: "Your four areas",
    priority: "Where to start",
    next: "Your next step",
    nextText:
      "Answer a few questions and we suggest specialists suited to what you want to work on.",
    cta: "Find my specialist",
    browse: "Or browse all specialists",
    note: "This summary comes from a short questionnaire. It is not a clinical assessment or a diagnosis.",
  },
  fr: {
    subject: (s: number) => `Votre score de performance mentale : ${s}/100`,
    pre: "Votre score, vos quatre axes et votre prochaine étape.",
    eyebrow: "Score de performance mentale",
    title: "Vos résultats sont prêts",
    hi: (n?: string) => (n ? `Bonjour ${n},` : "Bonjour,"),
    intro:
      "Merci d'avoir passé le Score de performance mentale. Voici votre bilan sur les quatre axes qu'il mesure.",
    overall: "Score global",
    breakdown: "Vos quatre axes",
    priority: "Par où commencer",
    next: "Votre prochaine étape",
    nextText:
      "Répondez à quelques questions et nous vous proposons des spécialistes adaptés à ce que vous voulez travailler.",
    cta: "Trouver mon spécialiste",
    browse: "Ou parcourir tous les spécialistes",
    note: "Ce bilan provient d'un court questionnaire. Ce n'est ni une évaluation clinique ni un diagnostic.",
  },
  ar: {
    subject: (s: number) => `نتيجتك في الأداء الذهني: ${s}/100`,
    pre: "نتيجتك ومحاورك الأربعة وخطوتك التالية.",
    eyebrow: "مؤشر الأداء الذهني",
    title: "نتائجك جاهزة",
    hi: (n?: string) => (n ? `مرحباً ${n}،` : "مرحباً،"),
    intro:
      "شكراً لإجرائك مؤشر الأداء الذهني. إليك ملخصك على المحاور الأربعة التي يقيسها.",
    overall: "النتيجة الإجمالية",
    breakdown: "محاورك الأربعة",
    priority: "من أين تبدأ",
    next: "خطوتك التالية",
    nextText:
      "أجب عن بضعة أسئلة ونقترح عليك أخصائيين يناسبون ما تريد العمل عليه.",
    cta: "إيجاد أخصائيي",
    browse: "أو تصفّح جميع الأخصائيين",
    note: "هذا الملخص مستخلص من استبيان قصير. ليس تقييماً سريرياً ولا تشخيصاً.",
  },
};

const clamp = (n: unknown) =>
  Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

function scorePanel(score: number, label: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px;"><tr><td align="center" style="background:${BRAND.maroon};border-radius:14px;padding:26px 16px;">
  <p style="margin:0 0 4px;font-family:${BRAND.sans};font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND.gold};">${escapeHtml(label)}</p>
  <p style="margin:0;font-family:${BRAND.serif};font-size:56px;line-height:1;font-weight:700;color:#FFFFFF;" dir="ltr">${score}<span style="font-size:22px;color:#E9C9CF;">&nbsp;/ 100</span></p>
</td></tr></table>`;
}

function bars(
  pillars: Record<Pillar, number>,
  weakest: Pillar,
  locale: Locale,
) {
  const rows = (Object.keys(PILLAR) as Pillar[])
    .map((k) => {
      const v = clamp(pillars[k]);
      const color = k === weakest ? BRAND.maroon : BRAND.gold;
      return `<tr><td style="padding:8px 0 2px;font-family:${BRAND.sans};font-size:14px;color:${BRAND.ink};font-weight:${k === weakest ? 700 : 400};">${escapeHtml(PILLAR[k][locale])}</td><td style="padding:8px 0 2px;font-family:${BRAND.sans};font-size:14px;font-weight:700;color:${BRAND.ink};text-align:${locale === "ar" ? "left" : "right"};" dir="ltr">${v}</td></tr>
<tr><td colspan="2" style="padding:0 0 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${BRAND.line};border-radius:4px;height:8px;font-size:0;line-height:0;"><table role="presentation" width="${Math.max(v, 2)}%" cellpadding="0" cellspacing="0" border="0" ${locale === "ar" ? 'align="right"' : ""}><tr><td style="background:${color};border-radius:4px;height:8px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr></table></td></tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;" dir="${locale === "ar" ? "rtl" : "ltr"}">${rows}</table>`;
}

export function renderQuizResults(d: Props) {
  const locale = normaliseLocale(d.lang ?? "fr");
  const t = T[locale];
  const score = clamp(d.score);
  const pillars = d.pillars ?? {
    focus: 0,
    regulation: 0,
    recovery: 0,
    meaning: 0,
  };
  const weakest = d.weakestPillar ?? "focus";
  const body =
    p(t.hi(d.name), locale) +
    p(t.intro, locale) +
    scorePanel(score, t.overall) +
    subheading(t.breakdown, locale) +
    bars(pillars, weakest, locale) +
    subheading(
      `${t.priority}${locale === "fr" ? " : " : ": "}${PILLAR[weakest][locale]}`,
      locale,
    ) +
    p(PILLAR_WORK[weakest][locale], locale) +
    subheading(t.next, locale) +
    p(t.nextText, locale) +
    button(t.cta, d.bookingUrl ?? "https://upsy.ma/get-matched", locale) +
    rich(
      `<a href="${escapeHtml(d.matchUrl ?? "https://upsy.ma/psychologists")}" style="color:${BRAND.maroon};font-weight:700;">${escapeHtml(t.browse)}</a>`,
      locale,
    ) +
    callout(escapeHtml(t.note), locale);
  const html = renderEmail({
    locale,
    preheader: t.pre,
    eyebrow: t.eyebrow,
    title: t.title,
    body,
  });
  return { subject: t.subject(score), html, text: toText(html) };
}

export const template: TemplateEntry = {
  render: renderQuizResults,
  displayName: "Quiz Results",
  previewData: {
    name: "Salma",
    score: 68,
    pillars: { focus: 55, regulation: 72, recovery: 60, meaning: 80 },
    weakestPillar: "focus",
    lang: "fr",
  },
};
