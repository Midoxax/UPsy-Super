// Newsletter emails: the monthly digest and the sign-up confirmation.
import {
  BRAND,
  button,
  escapeHtml,
  p,
  renderEmail,
  toText,
} from "../email/layout.ts";

export type Lang = "en" | "fr" | "ar";

export interface DigestItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  readMinutes: number;
  url: string;
  image: string | null;
}

const T = {
  en: {
    preview: (n: number) =>
      `${n} new article${n > 1 ? "s" : ""} from U.Psy this month`,
    title: "This month on U.Psy",
    hello: "Hello,",
    intro: "Here are the articles our psychologists published this month.",
    read: "Read",
    minutes: "min read",
    cta: "Find a psychologist",
    footer: "You receive this because you subscribed to the U.Psy newsletter.",
    unsubscribe: "Unsubscribe",
    confirmPreview: "Confirm your subscription to the U.Psy newsletter",
    confirmTitle: "One click to confirm",
    confirmBody:
      "Confirm your address to receive one email a month with our new articles on mental health and performance. If you did not ask for this, ignore this email.",
    confirmCta: "Confirm my subscription",
  },
  fr: {
    preview: (n: number) =>
      `${n} nouvel${n > 1 ? "s" : ""} article${n > 1 ? "s" : ""} U.Psy ce mois-ci`,
    title: "Ce mois-ci sur U.Psy",
    hello: "Bonjour,",
    intro: "Voici les articles publiés ce mois-ci par nos psychologues.",
    read: "Lire",
    minutes: "min de lecture",
    cta: "Trouver un psychologue",
    footer:
      "Vous recevez cet email car vous êtes inscrit(e) à la newsletter U.Psy.",
    unsubscribe: "Se désinscrire",
    confirmPreview: "Confirmez votre inscription à la newsletter U.Psy",
    confirmTitle: "Un clic pour confirmer",
    confirmBody:
      "Confirmez votre adresse pour recevoir un email par mois avec nos nouveaux articles sur la santé mentale et la performance. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
    confirmCta: "Confirmer mon inscription",
  },
  ar: {
    preview: (n: number) => `${n} مقالات جديدة من U.Psy هذا الشهر`,
    title: "هذا الشهر على U.Psy",
    hello: "مرحباً،",
    intro: "إليك المقالات التي نشرها أخصائيونا هذا الشهر.",
    read: "اقرأ",
    minutes: "دقائق قراءة",
    cta: "ابحث عن أخصائي",
    footer: "تتلقى هذا البريد لأنك مشترك في نشرة U.Psy.",
    unsubscribe: "إلغاء الاشتراك",
    confirmPreview: "أكّد اشتراكك في نشرة U.Psy",
    confirmTitle: "نقرة واحدة للتأكيد",
    confirmBody:
      "أكّد عنوانك لتتلقى بريداً واحداً في الشهر بمقالاتنا الجديدة حول الصحة النفسية والأداء. إن لم تطلب ذلك، تجاهل هذا البريد.",
    confirmCta: "تأكيد اشتراكي",
  },
};

export const digestSubject = (lang: Lang, period: string) => {
  const d = new Date(period + "-01T12:00:00Z");
  const month = d.toLocaleDateString(
    lang === "en" ? "en-GB" : lang === "fr" ? "fr-FR" : "ar-MA",
    {
      month: "long",
      year: "numeric",
    },
  );
  return lang === "en"
    ? `U.Psy — the ${month} newsletter`
    : lang === "fr"
      ? `U.Psy — la newsletter de ${month}`
      : `U.Psy — نشرة ${month}`;
};

export const confirmSubject = (lang: Lang) =>
  lang === "en"
    ? "Confirm your U.Psy newsletter subscription"
    : lang === "fr"
      ? "Confirmez votre inscription à la newsletter U.Psy"
      : "أكّد اشتراكك في نشرة U.Psy";

/** An upcoming live class or League webinar, for the training block. */
export interface DigestWebinar {
  title: string;
  startsAt: string;
  url: string;
  league: boolean;
  /** "Gratuit", "250 MAD", "Membres"… already in the reader's language. */
  price: string;
  speaker: string | null;
}

/** Topics readers can vote for, in the order shown. */
export const VOTE_TOPICS = [
  "stress",
  "sleep",
  "performance",
  "relationships",
] as const;

const X = {
  en: {
    readOnline: "Read online",
    issue: "Newsletter",
    featured: "This month's read",
    more: "Also this month",
    training: "Coming up in the training center",
    league: "LSSPM",
    register: "Register",
    voteTitle: "Your say: what should we write about next month?",
    voteHint: "One click is enough. We count every vote.",
    topics: {
      stress: "Stress & anxiety",
      sleep: "Sleep",
      performance: "Performance",
      relationships: "Relationships",
    },
    bandTitle: "Where are you right now?",
    bandText:
      "Take the free 2-minute score, or talk to a verified psychologist in your language.",
    bandScore: "Take the free score",
    bandFind: "Find a psychologist",
  },
  fr: {
    readOnline: "Lire en ligne",
    issue: "Newsletter",
    featured: "L'article du mois",
    more: "Aussi ce mois-ci",
    training: "Bientôt au centre de formation",
    league: "LSSPM",
    register: "S'inscrire",
    voteTitle: "À vous : de quoi parle-t-on le mois prochain ?",
    voteHint: "Un clic suffit. Chaque vote compte.",
    topics: {
      stress: "Stress et anxiété",
      sleep: "Sommeil",
      performance: "Performance",
      relationships: "Relations",
    },
    bandTitle: "Où en êtes-vous en ce moment ?",
    bandText:
      "Faites le point en 2 minutes avec le score gratuit, ou parlez à un psychologue vérifié, dans votre langue.",
    bandScore: "Faire le score gratuit",
    bandFind: "Trouver un psychologue",
  },
  ar: {
    readOnline: "اقرأ على الموقع",
    issue: "النشرة",
    featured: "مقال الشهر",
    more: "أيضًا هذا الشهر",
    training: "قريبًا في مركز التكوين",
    league: "LSSPM",
    register: "سجّل",
    voteTitle: "رأيك: عن ماذا نكتب الشهر المقبل؟",
    voteHint: "نقرة واحدة تكفي. كل صوت يُحتسب.",
    topics: {
      stress: "التوتر والقلق",
      sleep: "النوم",
      performance: "الأداء",
      relationships: "العلاقات",
    },
    bandTitle: "أين أنت الآن؟",
    bandText:
      "قيّم حالتك في دقيقتين مع المؤشر المجاني، أو تحدّث مع أخصائي موثَّق بلغتك.",
    bandScore: "المؤشر المجاني",
    bandFind: "ابحث عن أخصائي",
  },
};

const fontFor = (lang: Lang) => (lang === "ar" ? BRAND.arabic : BRAND.sans);
const headFor = (lang: Lang) => (lang === "ar" ? BRAND.arabic : BRAND.serif);
const alignFor = (lang: Lang) => (lang === "ar" ? "right" : "left");
const arrow = (lang: Lang) => (lang === "ar" ? "&larr;" : "&rarr;");

function monthLabel(lang: Lang, period: string) {
  return new Date(period + "-01T12:00:00Z").toLocaleDateString(
    lang === "en" ? "en-GB" : lang === "fr" ? "fr-FR" : "ar-MA",
    { month: "long", year: "numeric" },
  );
}

/** Full-width hero: the brand image, then the issue and its lead article. */
function hero(o: {
  lang: Lang;
  period: string;
  image: string;
  lead: DigestItem | undefined;
  readOnlineUrl?: string;
}) {
  const x = X[o.lang];
  const a = alignFor(o.lang);
  const f = fontFor(o.lang);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td><img src="${escapeHtml(o.image)}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>
<tr><td bgcolor="${BRAND.maroonDeep}" style="background:${BRAND.maroonDeep};padding:28px 44px 30px;text-align:${a};">
  <p style="margin:0 0 10px;font-family:${f};font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:${BRAND.gold};">${escapeHtml(x.issue)} &middot; ${escapeHtml(monthLabel(o.lang, o.period))}${o.readOnlineUrl ? ` &nbsp;&middot;&nbsp; <a href="${escapeHtml(o.readOnlineUrl)}" style="color:${BRAND.goldSoft};text-decoration:underline;font-weight:400;letter-spacing:0;text-transform:none;">${escapeHtml(x.readOnline)}</a>` : ""}</p>
  ${
    o.lead
      ? `<p style="margin:0 0 14px;font-family:${headFor(o.lang)};font-size:28px;line-height:1.2;font-weight:700;color:#FFFFFF;"><a href="${escapeHtml(o.lead.url)}" style="color:#FFFFFF;text-decoration:none;">${escapeHtml(o.lead.title)}</a></p>
  <p style="margin:0 0 20px;font-family:${f};font-size:15px;line-height:1.6;color:#F3E6E8;">${escapeHtml(o.lead.description)}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="${o.lang === "ar" ? "margin-left:auto;" : ""}"><tr><td bgcolor="${BRAND.gold}" style="border-radius:10px;background:${BRAND.gold};"><a href="${escapeHtml(o.lead.url)}" style="display:inline-block;padding:13px 24px;font-family:${f};font-size:15px;font-weight:700;color:${BRAND.maroonDeep};text-decoration:none;border-radius:10px;">${escapeHtml(x.featured)} ${arrow(o.lang)}</a></td></tr></table>`
      : ""
  }
</td></tr></table>`;
}

function sectionTitle(text: string, lang: Lang) {
  return `<p style="margin:8px 0 14px;font-family:${fontFor(lang)};font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#A07800;text-align:${alignFor(lang)};">${escapeHtml(text)}</p>`;
}

/** A compact article row: thumbnail beside the text, the whole row clickable. */
function articleRow(it: DigestItem, lang: Lang, t: (typeof T)["en"]) {
  const a = alignFor(lang);
  const thumb = it.image
    ? `<td width="112" style="width:112px;padding:0 ${lang === "ar" ? "0 0 16px" : "16px 0 0"};vertical-align:top;"><a href="${escapeHtml(it.url)}"><img src="${escapeHtml(it.image)}" alt="" width="112" height="84" style="display:block;width:112px;height:84px;object-fit:cover;border:0;border-radius:10px;"></a></td>`
    : "";
  const text = `<td style="vertical-align:top;text-align:${a};">
  <p style="margin:0 0 4px;font-family:${BRAND.sans};font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(it.category)} &middot; <span dir="ltr">${it.readMinutes}</span> ${escapeHtml(t.minutes)}</p>
  <p style="margin:0 0 6px;font-family:${headFor(lang)};font-size:17px;line-height:1.3;font-weight:700;"><a href="${escapeHtml(it.url)}" style="color:${BRAND.ink};text-decoration:none;">${escapeHtml(it.title)}</a></p>
  <p style="margin:0;font-family:${fontFor(lang)};font-size:13px;line-height:1.55;color:${BRAND.body};">${escapeHtml(it.description)} <a href="${escapeHtml(it.url)}" style="color:${BRAND.maroon};font-weight:700;text-decoration:none;white-space:nowrap;">${escapeHtml(t.read)} ${arrow(lang)}</a></p>
</td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;" dir="${lang === "ar" ? "rtl" : "ltr"}"><tr>${thumb}${text}</tr></table>`;
}

/** An upcoming class: a date tile, the title and a register link. */
function webinarRow(w: DigestWebinar, lang: Lang) {
  const x = X[lang];
  const d = new Date(w.startsAt);
  const tz = { timeZone: "Africa/Casablanca" } as const;
  const loc = lang === "en" ? "en-GB" : lang === "fr" ? "fr-FR" : "ar-MA";
  const day = d.toLocaleDateString("en-GB", { ...tz, day: "2-digit" });
  const mon = d.toLocaleDateString(loc, { ...tz, month: "short" });
  const time = d.toLocaleTimeString("fr-FR", {
    ...tz,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;border:1px solid ${BRAND.line};border-radius:12px;border-collapse:separate;" dir="${lang === "ar" ? "rtl" : "ltr"}"><tr>
  <td width="64" style="width:64px;padding:12px;vertical-align:top;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${BRAND.ivory}" style="width:56px;border-radius:10px;background:${BRAND.ivory};text-align:center;padding:8px 0;">
    <p style="margin:0;font-family:${BRAND.serif};font-size:22px;font-weight:700;line-height:1;color:${BRAND.maroon};" dir="ltr">${escapeHtml(day)}</p>
    <p style="margin:4px 0 0;font-family:${fontFor(lang)};font-size:11px;font-weight:700;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(mon)}</p>
  </td></tr></table></td>
  <td style="padding:12px 14px 12px 0;vertical-align:top;text-align:${alignFor(lang)};">
    <p style="margin:0 0 4px;font-family:${fontFor(lang)};font-size:12px;color:${BRAND.muted};"><span dir="ltr">${escapeHtml(time)}</span>${w.league ? ` &middot; <span style="color:#2E5B8C;font-weight:700;">${escapeHtml(x.league)}</span>` : ""} &middot; ${escapeHtml(w.price)}</p>
    <p style="margin:0 0 4px;font-family:${headFor(lang)};font-size:16px;line-height:1.3;font-weight:700;"><a href="${escapeHtml(w.url)}" style="color:${BRAND.ink};text-decoration:none;">${escapeHtml(w.title)}</a></p>
    ${w.speaker ? `<p style="margin:0 0 6px;font-family:${fontFor(lang)};font-size:13px;color:${BRAND.body};">${escapeHtml(w.speaker)}</p>` : ""}
    <a href="${escapeHtml(w.url)}" style="font-family:${fontFor(lang)};font-size:13px;font-weight:700;color:${BRAND.maroon};text-decoration:none;">${escapeHtml(x.register)} ${arrow(lang)}</a>
  </td></tr></table>`;
}

/** One-click vote: each topic is a link that records the reader's choice. */
function vote(lang: Lang, voteUrl: (topic: string) => string) {
  const x = X[lang];
  const pills = VOTE_TOPICS.map(
    (k) =>
      `<a href="${escapeHtml(voteUrl(k))}" style="display:inline-block;margin:0 6px 8px 0;padding:9px 16px;border:1.5px solid ${BRAND.maroon};border-radius:999px;font-family:${fontFor(lang)};font-size:14px;font-weight:700;color:${BRAND.maroon};text-decoration:none;">${escapeHtml(x.topics[k])}</a>`,
  ).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0 24px;"><tr><td bgcolor="${BRAND.goldSoft}" style="background:${BRAND.goldSoft};border-radius:14px;padding:20px 22px;text-align:${alignFor(lang)};">
  <p style="margin:0 0 4px;font-family:${headFor(lang)};font-size:18px;font-weight:700;color:${BRAND.ink};">${escapeHtml(x.voteTitle)}</p>
  <p style="margin:0 0 14px;font-family:${fontFor(lang)};font-size:13px;color:${BRAND.body};">${escapeHtml(x.voteHint)}</p>
  ${pills}
</td></tr></table>`;
}

/** Closing call to action on maroon: the free score, or a psychologist. */
function band(lang: Lang, scoreUrl: string, findUrl: string) {
  const x = X[lang];
  const f = fontFor(lang);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;"><tr><td bgcolor="${BRAND.maroon}" style="background:${BRAND.maroon};border-radius:14px;padding:26px 24px;text-align:center;">
  <p style="margin:0 0 6px;font-family:${headFor(lang)};font-size:22px;font-weight:700;color:#FFFFFF;">${escapeHtml(x.bandTitle)}</p>
  <p style="margin:0 0 18px;font-family:${f};font-size:14px;line-height:1.6;color:#F3E6E8;">${escapeHtml(x.bandText)}</p>
  <a href="${escapeHtml(scoreUrl)}" style="display:inline-block;margin:0 4px 8px;padding:12px 20px;border-radius:10px;background:${BRAND.gold};font-family:${f};font-size:14px;font-weight:700;color:${BRAND.maroonDeep};text-decoration:none;">${escapeHtml(x.bandScore)}</a>
  <a href="${escapeHtml(findUrl)}" style="display:inline-block;margin:0 4px 8px;padding:11px 19px;border-radius:10px;border:1.5px solid #FFFFFF;font-family:${f};font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;">${escapeHtml(x.bandFind)}</a>
</td></tr></table>`;
}

export function renderDigest(o: {
  lang: Lang;
  intro?: string | null;
  items: DigestItem[];
  siteUrl: string;
  unsubscribeUrl: string;
  /** "2026-12": the issue's month (hero label, web version, vote). */
  period?: string;
  webinars?: DigestWebinar[];
  /** Link recording a vote for a topic (per reader). */
  voteUrl?: (topic: string) => string;
}) {
  const t = T[o.lang];
  const prefix = o.lang === "en" ? "" : `/${o.lang}`;
  const utm = (path: string, content: string) =>
    `${o.siteUrl}${prefix}${path}?utm_source=newsletter&utm_medium=email&utm_campaign=${o.period ?? "digest"}&utm_content=${content}`;
  const [lead, ...rest] = o.items;
  const period = o.period ?? new Date().toISOString().slice(0, 7);
  const readOnline = o.period
    ? `${o.siteUrl}${prefix}/newsletter/${o.period}`
    : undefined;

  const body =
    p(t.hello, o.lang) +
    p(o.intro?.trim() || t.intro, o.lang) +
    (rest.length
      ? sectionTitle(X[o.lang].more, o.lang) +
        rest.map((it) => articleRow(it, o.lang, t)).join("")
      : "") +
    (o.webinars?.length
      ? sectionTitle(X[o.lang].training, o.lang) +
        o.webinars.map((w) => webinarRow(w, o.lang)).join("")
      : "") +
    (o.voteUrl ? vote(o.lang, o.voteUrl) : "") +
    band(
      o.lang,
      utm("/free-score", "band-score"),
      utm("/psychologists", "band-find"),
    );

  const html = renderEmail({
    locale: o.lang,
    preheader: lead
      ? `${lead.title} — ${t.preview(o.items.length)}`
      : t.preview(o.items.length),
    title: t.title,
    body,
    unsubscribeUrl: o.unsubscribeUrl,
    footerNote: t.footer,
    hero: hero({
      lang: o.lang,
      period,
      image: `${o.siteUrl}/campaign/newsletter/hero-email.jpg`,
      lead,
      readOnlineUrl: readOnline,
    }),
  });
  return { html, text: toText(html) };
}

export function renderConfirm(o: { lang: Lang; confirmUrl: string }) {
  const t = T[o.lang];
  const html = renderEmail({
    locale: o.lang,
    preheader: t.confirmPreview,
    eyebrow: "Newsletter",
    title: t.confirmTitle,
    body: p(t.confirmBody, o.lang) + button(t.confirmCta, o.confirmUrl, o.lang),
  });
  return { html, text: toText(html) };
}
