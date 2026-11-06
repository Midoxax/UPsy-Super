/**
 * The one U.Psy email layout. Every email the platform sends (sign-in,
 * bookings, reminders, accreditation, newsletter, admin alerts) is built
 * from these pieces, so they all look like one brand.
 *
 * Built for real inboxes, not browsers: table layout, inline styles, no web
 * fonts required (Georgia and Helvetica fallbacks), a bulletproof button,
 * a hidden preheader, light colour scheme declared so dark-mode clients do
 * not invert the brand colours, and right-to-left for Arabic.
 */
import { escapeHtml } from "../html.ts";

export { escapeHtml };
export type Locale = "fr" | "en" | "ar";

export const BRAND = {
  maroon: "#6D0F22",
  maroonDeep: "#4E0A18",
  gold: "#F2B705",
  goldSoft: "#FFF4D1",
  ivory: "#F6F1E9",
  card: "#FFFFFF",
  ink: "#1A1A1A",
  body: "#3B3631",
  muted: "#7A7268",
  line: "#E7E0D5",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  arabic: "Tahoma, 'Segoe UI', Arial, sans-serif",
};

const SITE = "https://upsy.ma";

const FOOTER: Record<
  Locale,
  {
    tagline: string;
    why: string;
    privacy: string;
    help: string;
    unsubscribe: string;
  }
> = {
  fr: {
    tagline: "Psychologues et préparation mentale au Maroc",
    why: "Vous recevez cet e-mail en lien avec votre compte U.Psy.",
    privacy: "Confidentialité",
    help: "Aide",
    unsubscribe: "Se désabonner",
  },
  en: {
    tagline: "Psychologists and mental performance in Morocco",
    why: "You are receiving this email about your U.Psy account.",
    privacy: "Privacy",
    help: "Help",
    unsubscribe: "Unsubscribe",
  },
  ar: {
    tagline: "أخصائيون نفسيون وإعداد ذهني في المغرب",
    why: "تصلك هذه الرسالة بخصوص حسابك على U.Psy.",
    privacy: "الخصوصية",
    help: "المساعدة",
    unsubscribe: "إلغاء الاشتراك",
  },
};

export const normaliseLocale = (value: unknown): Locale => {
  const v = String(value ?? "")
    .toLowerCase()
    .slice(0, 2);
  return v === "ar" || v === "en" ? v : "fr";
};

/**
 * The site locale a URL points at: /fr/… and /ar/… carry a prefix, while
 * unprefixed pages are the English site. Unparseable → French.
 */
export const localeFromUrl = (url: string | null | undefined): Locale => {
  try {
    const seg = new URL(url ?? "", SITE).pathname.split("/")[1];
    return seg === "ar" || seg === "fr" ? seg : "en";
  } catch {
    return "fr";
  }
};

const fontFor = (locale: Locale) =>
  locale === "ar" ? BRAND.arabic : BRAND.sans;
const align = (locale: Locale) => (locale === "ar" ? "right" : "left");

// ---------- building blocks (all return HTML strings) ----------

/** A paragraph of plain text (escaped). Use `rich` for trusted HTML. */
export const p = (text: string, locale: Locale = "fr") =>
  rich(escapeHtml(text), locale);

/** A paragraph of trusted HTML (already escaped by the caller). */
export const rich = (html: string, locale: Locale = "fr") =>
  `<p style="margin:0 0 16px;font-family:${fontFor(locale)};font-size:15px;line-height:1.65;color:${BRAND.body};text-align:${align(locale)};">${html}</p>`;

/** Primary call to action: a bulletproof button that works in Outlook. */
export const button = (label: string, url: string, locale: Locale = "fr") => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;${locale === "ar" ? "margin-left:auto;" : ""}">
  <tr><td bgcolor="${BRAND.maroon}" style="border-radius:10px;background:${BRAND.maroon};">
    <a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:15px 28px;font-family:${fontFor(locale)};font-size:15px;font-weight:700;letter-spacing:0.2px;color:#FFFFFF;text-decoration:none;border-radius:10px;border-bottom:3px solid ${BRAND.gold};">${escapeHtml(label)}&nbsp;&nbsp;${locale === "ar" ? "&larr;" : "&rarr;"}</a>
  </td></tr>
</table>`;

/** Two side-by-side choices: a filled primary and an outlined secondary. */
export const buttonPair = (
  primary: { label: string; url: string },
  secondary: { label: string; url: string },
  locale: Locale = "fr",
) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;${locale === "ar" ? "margin-left:auto;" : ""}">
  <tr>
    <td bgcolor="${BRAND.maroon}" style="border-radius:10px;background:${BRAND.maroon};">
      <a href="${escapeHtml(primary.url)}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${fontFor(locale)};font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:10px;border-bottom:3px solid ${BRAND.gold};">${escapeHtml(primary.label)}</a>
    </td>
    <td style="width:12px;font-size:0;">&nbsp;</td>
    <td style="border-radius:10px;border:1.5px solid ${BRAND.maroon};">
      <a href="${escapeHtml(secondary.url)}" target="_blank" style="display:inline-block;padding:13px 24px;font-family:${fontFor(locale)};font-size:15px;font-weight:700;color:${BRAND.maroon};text-decoration:none;border-radius:10px;">${escapeHtml(secondary.label)}</a>
    </td>
  </tr>
</table>`;

/** A quiet text link under the button, for clients that block buttons. */
export const fallbackLink = (
  lead: string,
  url: string,
  locale: Locale = "fr",
) =>
  `<p style="margin:0 0 20px;font-family:${fontFor(locale)};font-size:12px;line-height:1.6;color:${BRAND.muted};text-align:${align(locale)};">${escapeHtml(lead)}<br><a href="${escapeHtml(url)}" style="color:${BRAND.maroon};word-break:break-all;">${escapeHtml(url)}</a></p>`;

/** Key facts as label / value rows (date, time, specialist, amount…). */
export const details = (
  rows: Array<[string, string]>,
  locale: Locale = "fr",
) => {
  const body = rows
    .filter(([, v]) => v !== "" && v != null)
    .map(
      ([k, v], i) => `<tr>
  <td style="padding:12px 16px;${i ? `border-top:1px solid ${BRAND.line};` : ""}font-family:${fontFor(locale)};font-size:12px;letter-spacing:0.6px;text-transform:uppercase;color:${BRAND.muted};width:38%;text-align:${align(locale)};vertical-align:top;">${escapeHtml(k)}</td>
  <td style="padding:12px 16px;${i ? `border-top:1px solid ${BRAND.line};` : ""}font-family:${fontFor(locale)};font-size:15px;font-weight:600;color:${BRAND.ink};text-align:${align(locale)};">${escapeHtml(v)}</td>
</tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px;border:1px solid ${BRAND.line};border-radius:12px;border-collapse:separate;background:#FCFAF6;">${body}</table>`;
};

/** A highlighted note: gold for information, maroon for what needs action. */
export const callout = (
  html: string,
  locale: Locale = "fr",
  tone: "info" | "action" = "info",
) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px;"><tr><td style="background:${tone === "info" ? BRAND.goldSoft : "#FBEFF1"};border-${locale === "ar" ? "right" : "left"}:4px solid ${tone === "info" ? BRAND.gold : BRAND.maroon};border-radius:8px;padding:14px 18px;font-family:${fontFor(locale)};font-size:14px;line-height:1.6;color:${BRAND.body};text-align:${align(locale)};">${html}</td></tr></table>`;

/** A one-time code shown large and spaced, easy to read and copy. */
export const code = (value: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr><td style="background:${BRAND.ivory};border:1px solid ${BRAND.line};border-radius:12px;padding:16px 28px;font-family:'Courier New',Courier,monospace;font-size:30px;font-weight:700;letter-spacing:10px;color:${BRAND.maroon};" dir="ltr">${escapeHtml(value)}</td></tr></table>`;

/** A thin divider between sections. */
export const divider = () =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ${BRAND.line};font-size:0;line-height:0;padding:0 0 20px;">&nbsp;</td></tr></table>`;

/** A small heading inside the body. */
export const subheading = (text: string, locale: Locale = "fr") =>
  `<p style="margin:8px 0 10px;font-family:${BRAND.serif};font-size:18px;font-weight:700;color:${BRAND.ink};text-align:${align(locale)};">${escapeHtml(text)}</p>`;

// ---------- the page ----------

export interface EmailOptions {
  locale?: Locale;
  /** Shown in the inbox list after the subject; never shown in the body. */
  preheader: string;
  /** Small gold label above the title (e.g. "Booking confirmed"). */
  eyebrow?: string;
  title: string;
  /** Body HTML built from the blocks above. */
  body: string;
  /** Marketing emails must carry an unsubscribe link. */
  unsubscribeUrl?: string;
  /** Replaces the default "why you receive this" line. */
  footerNote?: string;
}

export function renderEmail(o: EmailOptions): string {
  const locale = o.locale ?? "fr";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const f = FOOTER[locale];
  const font = fontFor(locale);
  const a = align(locale);
  const pre = escapeHtml(o.preheader);

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(o.title)}</title>
<style>
  @media (max-width:620px){ .u-card{padding:28px 22px !important;} .u-title{font-size:24px !important;} }
  a{color:${BRAND.maroon};}
</style>
</head>
<body style="margin:0;padding:0;background:${BRAND.ivory};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${pre}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.ivory}" style="background:${BRAND.ivory};">
<tr><td align="center" style="padding:32px 12px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;" dir="${dir}">
    <tr><td style="padding:0 6px 18px;text-align:${a};">
      <a href="${SITE}${locale === "fr" ? "/fr" : locale === "ar" ? "/ar" : ""}" style="text-decoration:none;font-family:${BRAND.serif};font-size:26px;font-weight:700;color:${BRAND.maroon};letter-spacing:-0.3px;" dir="ltr">U<span style="color:${BRAND.gold};">.</span>Psy</a>
    </td></tr>
    <tr><td bgcolor="${BRAND.card}" style="background:${BRAND.card};border:1px solid ${BRAND.line};border-radius:18px;overflow:hidden;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="height:5px;line-height:5px;font-size:0;background:${BRAND.maroon};border-top-left-radius:18px;border-top-right-radius:18px;"><span style="display:block;width:96px;height:5px;background:${BRAND.gold};${locale === "ar" ? "margin-left:auto;" : ""}"></span></td></tr>
        <tr><td class="u-card" style="padding:40px 44px 36px;text-align:${a};">
          ${o.eyebrow ? `<p style="margin:0 0 10px;font-family:${font};font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#A07800;">${escapeHtml(o.eyebrow)}</p>` : ""}
          <h1 class="u-title" style="margin:0 0 20px;font-family:${locale === "ar" ? font : BRAND.serif};font-size:28px;line-height:1.25;font-weight:700;color:${BRAND.ink};">${escapeHtml(o.title)}</h1>
          ${o.body}
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 10px 0;text-align:center;font-family:${font};font-size:12px;line-height:1.7;color:${BRAND.muted};">
      <p style="margin:0 0 6px;font-family:${BRAND.serif};font-size:14px;color:${BRAND.maroon};font-weight:700;" dir="ltr">U<span style="color:${BRAND.gold};">.</span>Psy</p>
      <p style="margin:0 0 6px;">${escapeHtml(f.tagline)} &middot; Casablanca</p>
      <p style="margin:0 0 10px;">${escapeHtml(o.footerNote ?? f.why)}</p>
      <p style="margin:0;">
        <a href="${SITE}/privacy" style="color:${BRAND.muted};text-decoration:underline;">${escapeHtml(f.privacy)}</a>
        &nbsp;&middot;&nbsp;
        <a href="mailto:contact@upsy.ma" style="color:${BRAND.muted};text-decoration:underline;">${escapeHtml(f.help)}</a>
        ${o.unsubscribeUrl ? `&nbsp;&middot;&nbsp;<a href="${escapeHtml(o.unsubscribeUrl)}" style="color:${BRAND.muted};text-decoration:underline;">${escapeHtml(f.unsubscribe)}</a>` : ""}
      </p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

/** Plain-text version for clients that do not render HTML. */
export function toText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<div style="display:none[\s\S]*?<\/div>/i, "")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, t) => {
      const label = t.replace(/<[^>]+>/g, "").trim();
      return href.startsWith("mailto:") || label === href
        ? label
        : `${label} (${href})`;
    })
    .replace(/<\/(p|h1|tr|table)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<td[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&middot;/g, "·")
    .replace(/&rarr;|&larr;/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#\d+;/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}
