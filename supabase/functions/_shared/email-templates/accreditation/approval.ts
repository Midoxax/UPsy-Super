import { Locale, normalizeLocale, shellHtml } from "./i18n.ts";

interface ApprovalParams {
  locale: unknown;
  fullName: string;
  email: string;
  loginUrl: string;
  isNewUser: boolean;
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
    credsNew: "Votre compte est prêt. Utilisez ces identifiants pour vous connecter :",
    credsExisting: (e: string) =>
      `Votre compte existant (${e}) a été enrichi avec l'accès psychologue. Utilisez votre mot de passe actuel — ou réinitialisez-le depuis la page de connexion.`,
    emailLabel: "Email",
    passLabel: "Mot de passe temporaire",
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

export function buildApprovalEmail(p: ApprovalParams): { subject: string; html: string } {
  const locale: Locale = normalizeLocale(p.locale);
  const c = COPY[locale];
  const credsBlock = p.isNewUser
    ? `<p>${c.credsNew}</p>
       <table role="presentation" cellpadding="8" style="background:#FAF7F2;border-radius:8px;margin:8px 0;">
         <tr><td style="color:#6B7280;font-size:13px;">${c.emailLabel}</td><td style="font-weight:600;">${p.email}</td></tr>
         <tr><td style="color:#6B7280;font-size:13px;">${c.passLabel}</td><td style="font-weight:600;font-family:monospace;">${p.tempPassword ?? ""}</td></tr>
       </table>`
    : `<p>${c.credsExisting(p.email)}</p>`;

  const stepsList = c.steps.map((s) => `<li>${s}</li>`).join("");

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#6B1F2A;">${c.greeting(p.fullName)}</h1>
    <p>${c.intro}</p>
    ${credsBlock}
    <p style="margin:24px 0;">
      <a href="${p.loginUrl}" style="display:inline-block;background:#6B1F2A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">${c.cta}</a>
    </p>
    <h3 style="color:#6B1F2A;font-size:16px;margin:24px 0 8px;">${c.nextHeading}</h3>
    <ol style="padding-${locale === "ar" ? "right" : "left"}:20px;margin:0;">${stepsList}</ol>
    <p style="margin-top:24px;color:#6B7280;">${c.closing}</p>
  `;

  return { subject: c.subject, html: shellHtml({ locale, title: c.subject, body }) };
}