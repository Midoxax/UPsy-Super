import { Locale, normalizeLocale } from "./i18n.ts";
import {
  callout,
  escapeHtml,
  p as para,
  renderEmail,
  toText,
} from "../../email/layout.ts";

interface RejectionParams {
  locale: unknown;
  fullName: string;
  /** Raw text; escaped here. */
  reason?: string;
}

const COPY = {
  en: {
    subject: "Update on your U.Psy application",
    greeting: (n: string) => `Thank you for your interest, ${n}`,
    intro: "Thank you for applying to join U.Psy's network of professionals.",
    decline:
      "After careful review, we are unable to approve your application at this time.",
    feedbackLabel: "Feedback",
    encourage:
      "We encourage you to reapply in the future as our needs and requirements evolve.",
    questions: "If you have any questions, please don't hesitate to reach out.",
    closing: "Best regards,<br>The U.Psy Team",
  },
  fr: {
    subject: "Mise à jour de votre candidature U.Psy",
    greeting: (n: string) => `Merci pour votre intérêt, ${n}`,
    intro:
      "Merci d'avoir postulé pour rejoindre le réseau de professionnels U.Psy.",
    decline:
      "Après examen attentif, nous ne sommes pas en mesure d'approuver votre candidature pour le moment.",
    feedbackLabel: "Retour",
    encourage:
      "Nous vous encourageons à postuler à nouveau, nos besoins et critères évoluent régulièrement.",
    questions: "Si vous avez des questions, n'hésitez pas à nous contacter.",
    closing: "Cordialement,<br>L'équipe U.Psy",
  },
  ar: {
    subject: "تحديث بشأن طلبك في U.Psy",
    greeting: (n: string) => `شكراً لاهتمامك، ${n}`,
    intro: "شكراً لتقدّمك للانضمام إلى شبكة المختصين في U.Psy.",
    decline: "بعد مراجعة دقيقة، لا يمكننا الموافقة على طلبك في الوقت الحالي.",
    feedbackLabel: "ملاحظات",
    encourage: "نشجعك على إعادة التقديم مستقبلاً مع تطور متطلباتنا.",
    questions: "في حال وجود أي استفسار، لا تتردد في التواصل معنا.",
    closing: "مع أطيب التحيات,<br>فريق U.Psy",
  },
};

export function buildRejectionEmail(p: RejectionParams): {
  subject: string;
  html: string;
  text: string;
} {
  const locale: Locale = normalizeLocale(p.locale);
  const c = COPY[locale];
  const body =
    para(c.intro, locale) +
    para(c.decline, locale) +
    (p.reason
      ? callout(
          `<strong>${escapeHtml(c.feedbackLabel)}</strong><br>${escapeHtml(p.reason)}`,
          locale,
        )
      : "") +
    para(c.encourage, locale) +
    para(c.questions, locale) +
    para(c.closing, locale);
  const html = renderEmail({
    locale,
    preheader: c.intro,
    title: c.greeting(p.fullName),
    body,
  });
  return { subject: c.subject, html, text: toText(html) };
}
