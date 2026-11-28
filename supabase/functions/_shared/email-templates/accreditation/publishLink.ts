import { type Locale, normalizeLocale } from "./i18n.ts";
import { button, p as para, renderEmail, toText } from "../../email/layout.ts";

/** Sent from the admin to an approved psychologist whose profile is not
 *  published yet: the profile prepared from their application, published
 *  in one click. */
const COPY: Record<
  Locale,
  {
    subject: string;
    eyebrow: string;
    title: (n: string) => string;
    body: string[];
    cta: string;
  }
> = {
  fr: {
    subject: "Votre profil U.Psy est prêt à être publié",
    eyebrow: "Votre profil",
    title: (n) => `${n}, votre profil est prêt`,
    body: [
      "Nous avons préparé votre profil public à partir de votre dossier : présentation, tarif, langues, spécialités et photo.",
      "Vérifiez-le et publiez-le en un clic, sans vous connecter. Les patients pourront alors vous trouver et réserver ; vous recevrez chaque demande par e-mail.",
      "Vous pourrez tout modifier ensuite depuis votre tableau de bord.",
    ],
    cta: "Vérifier et publier mon profil",
  },
  en: {
    subject: "Your U.Psy profile is ready to publish",
    eyebrow: "Your profile",
    title: (n) => `${n}, your profile is ready`,
    body: [
      "We prepared your public profile from your application: introduction, rate, languages, specialties and photo.",
      "Check it and publish it in one click, no login needed. Patients can then find you and book; you receive each request by email.",
      "You can change everything later from your dashboard.",
    ],
    cta: "Check and publish my profile",
  },
  ar: {
    subject: "ملفك على U.Psy جاهز للنشر",
    eyebrow: "ملفك",
    title: (n) => `${n}، ملفك جاهز`,
    body: [
      "أعددنا ملفك العام انطلاقًا من طلبك: التقديم، التعريفة، اللغات، التخصصات والصورة.",
      "راجعه وانشره بنقرة واحدة دون تسجيل الدخول. بعدها يستطيع المرضى إيجادك والحجز، وتتوصل بكل طلب عبر البريد.",
      "يمكنك تعديل كل شيء لاحقًا من لوحة التحكم.",
    ],
    cta: "راجع ملفي وانشره",
  },
};

export function buildPublishLinkEmail(o: {
  locale: unknown;
  fullName: string;
  publishUrl: string;
}): { subject: string; html: string; text: string } {
  const locale = normalizeLocale(o.locale);
  const c = COPY[locale];
  const html = renderEmail({
    locale,
    preheader: c.body[0],
    eyebrow: c.eyebrow,
    title: c.title(o.fullName),
    body:
      para(c.body[0], locale) +
      para(c.body[1], locale) +
      button(c.cta, o.publishUrl, locale) +
      para(c.body[2], locale),
  });
  return { subject: c.subject, html, text: toText(html) };
}
