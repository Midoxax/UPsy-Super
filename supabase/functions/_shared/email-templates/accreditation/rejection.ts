import { Locale, normalizeLocale, shellHtml } from "./i18n.ts";

interface RejectionParams {
  locale: unknown;
  fullName: string;
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
    intro: "Merci d'avoir postulé pour rejoindre le réseau de professionnels U.Psy.",
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
    decline:
      "بعد مراجعة دقيقة، لا يمكننا الموافقة على طلبك في الوقت الحالي.",
    feedbackLabel: "ملاحظات",
    encourage:
      "نشجعك على إعادة التقديم مستقبلاً مع تطور متطلباتنا.",
    questions: "في حال وجود أي استفسار، لا تتردد في التواصل معنا.",
    closing: "مع أطيب التحيات,<br>فريق U.Psy",
  },
};

export function buildRejectionEmail(p: RejectionParams): { subject: string; html: string } {
  const locale: Locale = normalizeLocale(p.locale);
  const c = COPY[locale];
  const feedback = p.reason
    ? `<p style="background:#FAF7F2;padding:12px 16px;border-${locale === "ar" ? "right" : "left"}:3px solid #6B1F2A;border-radius:4px;"><strong>${c.feedbackLabel}:</strong> ${p.reason}</p>`
    : "";

  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;color:#6B1F2A;">${c.greeting(p.fullName)}</h1>
    <p>${c.intro}</p>
    <p>${c.decline}</p>
    ${feedback}
    <p>${c.encourage}</p>
    <p>${c.questions}</p>
    <p style="margin-top:24px;">${c.closing}</p>
  `;

  return { subject: c.subject, html: shellHtml({ locale, title: c.subject, body }) };
}