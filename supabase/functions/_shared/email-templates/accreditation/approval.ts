import { Locale, normalizeLocale } from "./i18n.ts";
import {
  button,
  callout,
  details,
  escapeHtml,
  p as para,
  renderEmail,
  subheading,
  toText,
} from "../../email/layout.ts";

interface ApprovalParams {
  locale: unknown;
  fullName: string;
  email: string;
  loginUrl: string;
  isNewUser: boolean;
  /** One-time link to choose a password. Preferred over tempPassword. */
  setupUrl?: string;
  tempPassword?: string;
}

const COPY = {
  en: {
    subject: "Welcome to U.Psy — your psychologist account is ready",
    greeting: (n: string) => `Welcome, ${n}!`,
    intro: "Congratulations — your application has been approved.",
    credsNew: "Your account is ready. Use these credentials to log in:",
    credsExisting: (e: string) =>
      `Your existing account (${e}) has been upgraded with psychologist access. Use your current password — or reset it from the login page.`,
    emailLabel: "Email",
    passLabel: "Temporary password",
    changeOnLogin: "Please change this password the first time you log in.",
    setupNew: (e: string) =>
      `Your account (${e}) is ready. Choose your password with the button below. The link can be used once and expires.`,
    setupCta: "Choose my password",
    cta: "Log in to U.Psy",
    nextHeading: "Next steps",
    steps: [
      "Complete your profile (bio, photo, specialties, languages)",
      "Set your availability and booking link",
      "Configure your hourly rate",
      "Publish your profile to appear in the directory",
    ],
    closing: "Welcome to the team.",
  },
  fr: {
    subject: "Bienvenue chez U.Psy — votre compte psychologue est prêt",
    greeting: (n: string) => `Bienvenue, ${n} !`,
    intro: "Félicitations — votre dossier a été approuvé.",
    credsNew:
      "Votre compte est prêt. Utilisez ces identifiants pour vous connecter :",
    credsExisting: (e: string) =>
      `Votre compte existant (${e}) a été enrichi avec l'accès psychologue. Utilisez votre mot de passe actuel — ou réinitialisez-le depuis la page de connexion.`,
    emailLabel: "Email",
    passLabel: "Mot de passe temporaire",
    changeOnLogin:
      "Merci de changer ce mot de passe lors de votre première connexion.",
    setupNew: (e: string) =>
      `Votre compte (${e}) est prêt. Choisissez votre mot de passe avec le bouton ci-dessous. Le lien est à usage unique et expire.`,
    setupCta: "Choisir mon mot de passe",
    cta: "Se connecter à U.Psy",
    nextHeading: "Prochaines étapes",
    steps: [
      "Complétez votre profil (bio, photo, spécialités, langues)",
      "Réglez vos disponibilités et votre lien de réservation",
      "Configurez votre tarif horaire",
      "Publiez votre profil pour apparaître dans l'annuaire",
    ],
    closing: "Bienvenue dans l'équipe.",
  },
  ar: {
    subject: "مرحباً بك في U.Psy — حسابك كأخصائي نفسي جاهز",
    greeting: (n: string) => `مرحباً ${n}!`,
    intro: "تهانينا — تمت الموافقة على طلبك.",
    credsNew: "حسابك جاهز. استخدم بيانات الدخول التالية:",
    credsExisting: (e: string) =>
      `تم ترقية حسابك الحالي (${e}) بصلاحيات الأخصائي النفسي. استخدم كلمة المرور الحالية — أو أعِد ضبطها من صفحة تسجيل الدخول.`,
    emailLabel: "البريد الإلكتروني",
    passLabel: "كلمة المرور المؤقتة",
    changeOnLogin: "يرجى تغيير كلمة المرور هذه عند أول تسجيل دخول.",
    setupNew: (e: string) =>
      `حسابك (${e}) جاهز. اختر كلمة المرور عبر الزر أدناه. الرابط صالح لمرة واحدة وتنتهي صلاحيته.`,
    setupCta: "اختيار كلمة المرور",
    cta: "تسجيل الدخول إلى U.Psy",
    nextHeading: "الخطوات التالية",
    steps: [
      "أكمل ملفك الشخصي (السيرة، الصورة، التخصصات، اللغات)",
      "حدد أوقات توفرك ورابط الحجز",
      "اضبط سعر الجلسة",
      "انشر ملفك ليظهر في الدليل",
    ],
    closing: "مرحباً بك في الفريق.",
  },
};

export function buildApprovalEmail(p: ApprovalParams): {
  subject: string;
  html: string;
  text: string;
} {
  const locale: Locale = normalizeLocale(p.locale);
  const c = COPY[locale];
  const useSetupLink = p.isNewUser && !!p.setupUrl;
  const credsBlock = useSetupLink
    ? para(c.setupNew(p.email), locale)
    : p.isNewUser
      ? para(c.credsNew, locale) +
        details(
          [
            [c.emailLabel, p.email],
            [c.passLabel, p.tempPassword ?? ""],
          ],
          locale,
        ) +
        callout(escapeHtml(c.changeOnLogin), locale, "action")
      : para(c.credsExisting(p.email), locale);
  const ctaUrl = useSetupLink ? p.setupUrl! : p.loginUrl;
  const ctaLabel = useSetupLink ? c.setupCta : c.cta;
  const steps = c.steps
    .map(
      (s, i) =>
        `<tr><td style="width:34px;vertical-align:top;padding:6px 0;"><span style="display:inline-block;width:24px;height:24px;line-height:24px;border-radius:12px;background:#FFF4D1;color:#6D0F22;font-weight:700;font-size:13px;text-align:center;font-family:Arial,sans-serif;">${i + 1}</span></td><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#3B3631;">${escapeHtml(s)}</td></tr>`,
    )
    .join("");

  const body =
    para(c.intro, locale) +
    credsBlock +
    button(ctaLabel, ctaUrl, locale) +
    subheading(c.nextHeading, locale) +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;" dir="${locale === "ar" ? "rtl" : "ltr"}">${steps}</table>` +
    para(c.closing, locale);

  const html = renderEmail({
    locale,
    preheader: c.intro,
    eyebrow:
      locale === "fr"
        ? "Dossier approuvé"
        : locale === "ar"
          ? "تمت الموافقة"
          : "Application approved",
    title: c.greeting(p.fullName),
    body,
  });
  return { subject: c.subject, html, text: toText(html) };
}
