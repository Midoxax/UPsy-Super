/** Session reminders (24 hours, 1 hour, 5 minutes before). FR / EN / AR. */
import {
  button,
  callout,
  details,
  escapeHtml,
  fallbackLink,
  type Locale,
  p,
  renderEmail,
  toText,
} from "./layout.ts";
import { formatWhen } from "./booking.ts";

export type Wave = "24h" | "1h" | "5min";

const T = {
  fr: {
    eyebrow: {
      "24h": "Demain",
      "1h": "Dans 1 heure",
      "5min": "C'est maintenant",
    },
    title: {
      "24h": "Votre séance a lieu demain",
      "1h": "Votre séance commence dans 1 heure",
      "5min": "Votre séance commence",
    },
    subject: (w: Wave, who: string) =>
      ({
        "24h": `Demain · séance avec ${who}`,
        "1h": `Dans 1 heure · séance avec ${who}`,
        "5min": `Maintenant · séance avec ${who}`,
      })[w],
    introClient: (s: string) =>
      `Petit rappel : votre séance avec ${s} approche.`,
    introPsy: (c: string) => `Rappel : votre séance avec ${c} approche.`,
    date: "Date",
    time: "Heure (Maroc)",
    duration: "Durée",
    with: "Avec",
    min: (n: number) => `${n} min`,
    join: "Rejoindre la séance",
    room: "Ouvrir la salle de consultation",
    fallback: "Ou copiez ce lien dans votre navigateur :",
    pay: "Pas encore réglée ? Réglez par virement, CashPlus ou Wafacash et déposez votre reçu pour sécuriser votre créneau.",
    payCta: "Régler ma séance",
    prep: "Quelques minutes avant : un endroit calme, des écouteurs, et un verre d'eau.",
    sub: "Rappel de séance",
  },
  en: {
    eyebrow: { "24h": "Tomorrow", "1h": "In 1 hour", "5min": "Starting now" },
    title: {
      "24h": "Your session is tomorrow",
      "1h": "Your session starts in 1 hour",
      "5min": "Your session is starting",
    },
    subject: (w: Wave, who: string) =>
      ({
        "24h": `Tomorrow · session with ${who}`,
        "1h": `In 1 hour · session with ${who}`,
        "5min": `Now · session with ${who}`,
      })[w],
    introClient: (s: string) =>
      `A quick reminder: your session with ${s} is coming up.`,
    introPsy: (c: string) => `Reminder: your session with ${c} is coming up.`,
    date: "Date",
    time: "Time (Morocco)",
    duration: "Duration",
    with: "With",
    min: (n: number) => `${n} min`,
    join: "Join the session",
    room: "Open the consultation room",
    fallback: "Or paste this link into your browser:",
    pay: "Not paid yet? Pay by bank transfer, CashPlus or Wafacash and upload your receipt to secure your slot.",
    payCta: "Pay for my session",
    prep: "A few minutes before: a quiet place, headphones and a glass of water.",
    sub: "Session reminder",
  },
  ar: {
    eyebrow: { "24h": "غداً", "1h": "بعد ساعة", "5min": "الآن" },
    title: {
      "24h": "جلستك غداً",
      "1h": "تبدأ جلستك بعد ساعة",
      "5min": "جلستك تبدأ الآن",
    },
    subject: (w: Wave, who: string) =>
      ({
        "24h": `غداً · جلسة مع ${who}`,
        "1h": `بعد ساعة · جلسة مع ${who}`,
        "5min": `الآن · جلسة مع ${who}`,
      })[w],
    introClient: (s: string) => `تذكير سريع: جلستك مع ${s} تقترب.`,
    introPsy: (c: string) => `تذكير: جلستك مع ${c} تقترب.`,
    date: "التاريخ",
    time: "الساعة (توقيت المغرب)",
    duration: "المدة",
    with: "مع",
    min: (n: number) => `${n} دقيقة`,
    join: "الانضمام إلى الجلسة",
    room: "فتح غرفة الاستشارة",
    fallback: "أو انسخ هذا الرابط في متصفحك:",
    pay: "لم تؤدِّ بعد؟ ادفع بالتحويل البنكي أو CashPlus أو Wafacash وارفع الوصل لتأمين موعدك.",
    payCta: "أداء جلستي",
    prep: "قبل دقائق: مكان هادئ، سماعات، وكوب ماء.",
    sub: "تذكير بالجلسة",
  },
} as const;

export function reminderEmail(o: {
  wave: Wave;
  locale: Locale;
  isSpecialist: boolean;
  otherName: string;
  start: Date;
  durationMin: number;
  joinUrl: string;
  payUrl?: string;
}) {
  const t = T[o.locale];
  const w = formatWhen(o.start, o.locale);
  let body =
    p(
      o.isSpecialist ? t.introPsy(o.otherName) : t.introClient(o.otherName),
      o.locale,
    ) +
    details(
      [
        [t.date, w.date],
        [t.time, w.time],
        [t.duration, t.min(o.durationMin)],
        [t.with, o.otherName],
      ],
      o.locale,
    ) +
    button(o.isSpecialist ? t.room : t.join, o.joinUrl, o.locale) +
    fallbackLink(t.fallback, o.joinUrl, o.locale);
  if (o.payUrl)
    body += callout(
      `${escapeHtml(t.pay)} <a href="${escapeHtml(o.payUrl)}" style="font-weight:700;">${escapeHtml(t.payCta)}</a>`,
      o.locale,
      "action",
    );
  if (!o.isSpecialist) body += callout(escapeHtml(t.prep), o.locale);
  const html = renderEmail({
    locale: o.locale,
    preheader: t.title[o.wave],
    eyebrow: t.eyebrow[o.wave],
    title: t.title[o.wave],
    body,
  });
  return { subject: t.subject(o.wave, o.otherName), html, text: toText(html) };
}
