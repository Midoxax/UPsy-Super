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

function articleCard(it: DigestItem, lang: Lang, t: (typeof T)["en"]) {
  const a = lang === "ar" ? "right" : "left";
  const img = it.image
    ? `<tr><td><a href="${escapeHtml(it.url)}"><img src="${escapeHtml(it.image)}" alt="" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-top-left-radius:12px;border-top-right-radius:12px;"></a></td></tr>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;border:1px solid ${BRAND.line};border-radius:12px;border-collapse:separate;overflow:hidden;">${img}
<tr><td style="padding:18px 20px;text-align:${a};">
  <p style="margin:0 0 6px;font-family:${BRAND.sans};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#A07800;">${escapeHtml(it.category)}</p>
  <p style="margin:0 0 8px;font-family:${lang === "ar" ? BRAND.arabic : BRAND.serif};font-size:19px;line-height:1.3;font-weight:700;"><a href="${escapeHtml(it.url)}" style="color:${BRAND.ink};text-decoration:none;">${escapeHtml(it.title)}</a></p>
  <p style="margin:0 0 12px;font-family:${lang === "ar" ? BRAND.arabic : BRAND.sans};font-size:14px;line-height:1.6;color:${BRAND.body};">${escapeHtml(it.description)}</p>
  <p style="margin:0;font-family:${BRAND.sans};font-size:13px;color:${BRAND.muted};"><span dir="ltr">${it.readMinutes}</span> ${escapeHtml(t.minutes)} &nbsp;&middot;&nbsp; <a href="${escapeHtml(it.url)}" style="color:${BRAND.maroon};font-weight:700;text-decoration:none;">${escapeHtml(t.read)} ${lang === "ar" ? "&larr;" : "&rarr;"}</a></p>
</td></tr></table>`;
}

export function renderDigest(o: {
  lang: Lang;
  intro?: string | null;
  items: DigestItem[];
  siteUrl: string;
  unsubscribeUrl: string;
}) {
  const t = T[o.lang];
  const prefix = o.lang === "en" ? "" : `/${o.lang}`;
  const body =
    p(t.hello, o.lang) +
    p(o.intro?.trim() || t.intro, o.lang) +
    o.items.map((it) => articleCard(it, o.lang, t)).join("") +
    button(
      t.cta,
      `${o.siteUrl}${prefix}/psychologists?utm_source=newsletter`,
      o.lang,
    );
  const html = renderEmail({
    locale: o.lang,
    preheader: t.preview(o.items.length),
    eyebrow: "Newsletter",
    title: t.title,
    body,
    unsubscribeUrl: o.unsubscribeUrl,
    footerNote: t.footer,
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
