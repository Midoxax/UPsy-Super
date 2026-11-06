/**
 * Sign-in emails sent by Supabase Auth through auth-email-hook: confirm a new
 * account, magic link, password reset, email change, invitation and one-time
 * code. French, English and Arabic.
 */
import {
  button,
  callout,
  code,
  fallbackLink,
  type Locale,
  p,
  renderEmail,
  rich,
  escapeHtml,
  toText,
} from "./layout.ts";

export type AuthEmailType =
  | "signup"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "invite"
  | "reauthentication";

interface Copy {
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  lines: string[];
  cta?: string;
  note: string;
}

const T: Record<
  Locale,
  Record<AuthEmailType, Copy> & { fallback: string; expires: string }
> = {
  fr: {
    fallback:
      "Le bouton ne s'ouvre pas ? Copiez ce lien dans votre navigateur :",
    expires:
      "Pour votre sécurité, ce lien expire dans 1 heure et ne sert qu'une fois.",
    signup: {
      subject: "Confirmez votre adresse e-mail · U.Psy",
      preheader: "Un clic pour activer votre espace U.Psy.",
      eyebrow: "Bienvenue",
      title: "Activez votre espace U.Psy",
      lines: [
        "Merci de nous rejoindre. Votre espace vous permet de trouver un psychologue vérifié, de réserver en ligne et de suivre votre progression, en toute confidentialité.",
        "Confirmez votre adresse pour commencer :",
      ],
      cta: "Confirmer mon e-mail",
      note: "Vous n'avez pas créé de compte ? Ignorez simplement ce message.",
    },
    magiclink: {
      subject: "Votre lien de connexion · U.Psy",
      preheader: "Connectez-vous sans mot de passe, en un clic.",
      eyebrow: "Connexion",
      title: "Votre lien de connexion",
      lines: [
        "Cliquez ci-dessous pour vous connecter à U.Psy. Aucun mot de passe n'est nécessaire.",
      ],
      cta: "Me connecter",
      note: "Vous n'avez rien demandé ? Ignorez ce message : sans ce lien, personne ne peut se connecter.",
    },
    recovery: {
      subject: "Réinitialisez votre mot de passe · U.Psy",
      preheader: "Choisissez un nouveau mot de passe en une minute.",
      eyebrow: "Sécurité du compte",
      title: "Choisissez un nouveau mot de passe",
      lines: [
        "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte U.Psy.",
      ],
      cta: "Choisir un nouveau mot de passe",
      note: "Ce n'était pas vous ? Ignorez ce message : votre mot de passe actuel reste valable.",
    },
    email_change: {
      subject: "Confirmez votre nouvelle adresse · U.Psy",
      preheader: "Validez le changement d'adresse de votre compte.",
      eyebrow: "Sécurité du compte",
      title: "Confirmez votre nouvelle adresse",
      lines: [
        "Vous avez demandé à remplacer l'adresse e-mail de votre compte U.Psy. Confirmez ce changement :",
      ],
      cta: "Confirmer le changement",
      note: "Ce n'était pas vous ? Ne cliquez pas et écrivez-nous à contact@upsy.ma.",
    },
    invite: {
      subject: "Vous êtes invité sur U.Psy",
      preheader: "Votre accès à U.Psy vous attend.",
      eyebrow: "Invitation",
      title: "Vous êtes invité sur U.Psy",
      lines: [
        "Un accès à U.Psy a été créé pour vous. Acceptez l'invitation pour choisir votre mot de passe et ouvrir votre espace.",
      ],
      cta: "Accepter l'invitation",
      note: "Vous ne vous attendiez pas à cette invitation ? Ignorez ce message.",
    },
    reauthentication: {
      subject: "Votre code de vérification · U.Psy",
      preheader: "Votre code à usage unique.",
      eyebrow: "Vérification",
      title: "Votre code de vérification",
      lines: ["Saisissez ce code pour confirmer qu'il s'agit bien de vous :"],
      note: "Ne communiquez ce code à personne, même à l'équipe U.Psy.",
    },
  },
  en: {
    fallback: "Button not working? Paste this link into your browser:",
    expires: "For your security, this link expires in 1 hour and works once.",
    signup: {
      subject: "Confirm your email · U.Psy",
      preheader: "One click to activate your U.Psy space.",
      eyebrow: "Welcome",
      title: "Activate your U.Psy space",
      lines: [
        "Thank you for joining. Your space lets you find a vetted psychologist, book online and follow your progress, in full confidence.",
        "Confirm your address to get started:",
      ],
      cta: "Confirm my email",
      note: "Didn't create an account? Simply ignore this email.",
    },
    magiclink: {
      subject: "Your sign-in link · U.Psy",
      preheader: "Sign in without a password, in one click.",
      eyebrow: "Sign in",
      title: "Your sign-in link",
      lines: ["Click below to sign in to U.Psy. No password needed."],
      cta: "Sign me in",
      note: "Didn't ask for this? Ignore it: without this link, nobody can sign in.",
    },
    recovery: {
      subject: "Reset your password · U.Psy",
      preheader: "Choose a new password in a minute.",
      eyebrow: "Account security",
      title: "Choose a new password",
      lines: [
        "We received a request to reset the password of your U.Psy account.",
      ],
      cta: "Choose a new password",
      note: "Wasn't you? Ignore this email: your current password still works.",
    },
    email_change: {
      subject: "Confirm your new email · U.Psy",
      preheader: "Approve the change of address on your account.",
      eyebrow: "Account security",
      title: "Confirm your new email",
      lines: [
        "You asked to change the email address of your U.Psy account. Confirm the change:",
      ],
      cta: "Confirm the change",
      note: "Wasn't you? Don't click, and write to contact@upsy.ma.",
    },
    invite: {
      subject: "You're invited to U.Psy",
      preheader: "Your access to U.Psy is waiting.",
      eyebrow: "Invitation",
      title: "You're invited to U.Psy",
      lines: [
        "An account on U.Psy has been created for you. Accept the invitation to choose your password and open your space.",
      ],
      cta: "Accept the invitation",
      note: "Weren't expecting this? Ignore this email.",
    },
    reauthentication: {
      subject: "Your verification code · U.Psy",
      preheader: "Your one-time code.",
      eyebrow: "Verification",
      title: "Your verification code",
      lines: ["Enter this code to confirm it's you:"],
      note: "Never share this code, not even with the U.Psy team.",
    },
  },
  ar: {
    fallback: "الزر لا يعمل؟ انسخ هذا الرابط في متصفحك:",
    expires:
      "حفاظاً على أمانك، تنتهي صلاحية هذا الرابط بعد ساعة ويُستعمل مرة واحدة.",
    signup: {
      subject: "أكّد بريدك الإلكتروني · U.Psy",
      preheader: "نقرة واحدة لتفعيل فضائك على U.Psy.",
      eyebrow: "مرحباً بك",
      title: "فعّل فضاءك على U.Psy",
      lines: [
        "شكراً لانضمامك. يتيح لك فضاؤك إيجاد أخصائي نفسي موثّق، والحجز عبر الإنترنت، ومتابعة تقدّمك بسرية تامة.",
        "أكّد عنوانك لتبدأ:",
      ],
      cta: "تأكيد بريدي",
      note: "لم تُنشئ حساباً؟ تجاهل هذه الرسالة ببساطة.",
    },
    magiclink: {
      subject: "رابط الدخول · U.Psy",
      preheader: "ادخل دون كلمة مرور بنقرة واحدة.",
      eyebrow: "تسجيل الدخول",
      title: "رابط الدخول الخاص بك",
      lines: ["انقر أدناه لتسجيل الدخول إلى U.Psy دون كلمة مرور."],
      cta: "تسجيل الدخول",
      note: "لم تطلب ذلك؟ تجاهل الرسالة: دون هذا الرابط لا يمكن لأحد الدخول.",
    },
    recovery: {
      subject: "إعادة تعيين كلمة المرور · U.Psy",
      preheader: "اختر كلمة مرور جديدة في دقيقة.",
      eyebrow: "أمان الحساب",
      title: "اختر كلمة مرور جديدة",
      lines: ["تلقّينا طلباً لإعادة تعيين كلمة مرور حسابك على U.Psy."],
      cta: "اختيار كلمة مرور جديدة",
      note: "لست أنت؟ تجاهل الرسالة: كلمة مرورك الحالية تبقى صالحة.",
    },
    email_change: {
      subject: "أكّد عنوانك الجديد · U.Psy",
      preheader: "وافق على تغيير عنوان بريد حسابك.",
      eyebrow: "أمان الحساب",
      title: "أكّد بريدك الجديد",
      lines: [
        "طلبت تغيير عنوان البريد الإلكتروني لحسابك على U.Psy. أكّد هذا التغيير:",
      ],
      cta: "تأكيد التغيير",
      note: "لست أنت؟ لا تنقر، واكتب لنا على contact@upsy.ma.",
    },
    invite: {
      subject: "دعوة للانضمام إلى U.Psy",
      preheader: "وصولك إلى U.Psy في انتظارك.",
      eyebrow: "دعوة",
      title: "أنت مدعو إلى U.Psy",
      lines: [
        "تم إنشاء حساب لك على U.Psy. اقبل الدعوة لاختيار كلمة المرور وفتح فضائك.",
      ],
      cta: "قبول الدعوة",
      note: "لم تكن تتوقع هذه الدعوة؟ تجاهل الرسالة.",
    },
    reauthentication: {
      subject: "رمز التحقق · U.Psy",
      preheader: "رمزك المخصّص للاستعمال مرة واحدة.",
      eyebrow: "التحقق",
      title: "رمز التحقق الخاص بك",
      lines: ["أدخل هذا الرمز لتأكيد هويتك:"],
      note: "لا تشارك هذا الرمز مع أي أحد، حتى فريق U.Psy.",
    },
  },
};

export function authEmail(
  type: AuthEmailType,
  locale: Locale,
  d: { confirmationUrl: string; token?: string; newEmail?: string },
): { subject: string; html: string; text: string } {
  const t = T[locale];
  const c = t[type];
  let body = c.lines.map((l) => p(l, locale)).join("");
  if (type === "email_change" && d.newEmail)
    body += rich(`<strong>${escapeHtml(d.newEmail)}</strong>`, locale);
  if (type === "reauthentication") {
    body += code(d.token ?? "");
  } else if (c.cta) {
    body += button(c.cta, d.confirmationUrl, locale);
    body += callout(escapeHtml(t.expires), locale);
    body += fallbackLink(t.fallback, d.confirmationUrl, locale);
  }
  body += p(c.note, locale);
  const html = renderEmail({
    locale,
    preheader: c.preheader,
    eyebrow: c.eyebrow,
    title: c.title,
    body,
  });
  return { subject: c.subject, html, text: toText(html) };
}

export const isAuthEmailType = (v: string): v is AuthEmailType =>
  [
    "signup",
    "magiclink",
    "recovery",
    "email_change",
    "invite",
    "reauthentication",
  ].includes(v);
