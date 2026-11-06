/**
 * Booking emails: a new request for the specialist, the confirmation for
 * both sides, and the cancellation notice. French, English and Arabic.
 */
import {
  button,
  callout,
  details,
  escapeHtml,
  type Locale,
  p,
  renderEmail,
  rich,
  toText,
} from "./layout.ts";

export type BookingMailKind =
  | "request_to_specialist"
  | "confirmed_to_client"
  | "confirmed_to_specialist"
  | "cancelled_to_specialist"
  | "cancelled_to_client";

export interface BookingContext {
  start: Date;
  durationMin: number;
  online: boolean;
  city?: string | null;
  specialistName: string;
  clientName: string;
  paid: boolean;
  reason?: string | null;
  joinUrl: string;
  /** Where the main button leads. */
  ctaUrl: string;
}

const DATE_LOCALE: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  ar: "ar-MA",
};

export function formatWhen(d: Date, locale: Locale) {
  const tz = { timeZone: "Africa/Casablanca" } as const;
  return {
    date: d.toLocaleDateString(DATE_LOCALE[locale], {
      ...tz,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: d.toLocaleTimeString(DATE_LOCALE[locale], {
      ...tz,
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

const L = {
  fr: {
    date: "Date",
    time: "Heure (Maroc)",
    duration: "Durée",
    format: "Format",
    specialist: "Spécialiste",
    client: "Client",
    payment: "Paiement",
    reason: "Motif",
    minutes: (n: number) => `${n} min`,
    online: "En ligne (vidéo)",
    inPerson: (c?: string | null) => `Au cabinet${c ? `, ${c}` : ""}`,
    paid: "Réglée",
    unpaid: "À régler",
    request: {
      subject: (c: string) => `Nouvelle demande de séance · ${c}`,
      pre: "Une demande attend votre réponse.",
      eyebrow: "Nouvelle demande",
      title: "Une séance vous est demandée",
      intro: (c: string) =>
        `${c} souhaite réserver une séance avec vous. Confirmez ou refusez depuis votre tableau de bord : le client est prévenu immédiatement.`,
      cta: "Répondre à la demande",
      tip: "Une réponse rapide fait la différence : la plupart des clients choisissent le premier spécialiste qui confirme.",
    },
    confClient: {
      subject: (s: string) => `Séance confirmée avec ${s}`,
      pre: "Votre séance est confirmée. Tous les détails à l'intérieur.",
      eyebrow: "Séance confirmée",
      title: "Votre séance est confirmée",
      intro: (s: string) =>
        `${s} a confirmé votre séance. L'invitation pour votre agenda est jointe à cet e-mail.`,
      ctaPay: "Régler et sécuriser ma séance",
      ctaJoin: "Rejoindre la séance",
      ctaOpen: "Voir ma séance",
      payNote:
        "Sécurisez votre créneau : réglez par virement, CashPlus ou Wafacash et déposez votre reçu. Vous pouvez aussi régler lors de la séance.",
      onlineNote:
        "Le lien de la séance s'ouvre 10 minutes avant le début. Prévoyez un endroit calme et une bonne connexion.",
      inPersonNote:
        "Votre spécialiste vous confirmera l'adresse exacte du cabinet.",
    },
    confPsy: {
      subject: (c: string) => `Séance confirmée · ${c}`,
      pre: "La séance est dans votre agenda.",
      eyebrow: "Séance confirmée",
      title: "La séance est confirmée",
      intro: (c: string) =>
        `Votre séance avec ${c} est confirmée. L'invitation pour votre agenda est jointe.`,
      cta: "Ouvrir mon tableau de bord",
    },
    cancelPsy: {
      subject: "Séance annulée",
      pre: "Le client a annulé la séance.",
      eyebrow: "Annulation",
      title: "Une séance a été annulée",
      intro: (c: string) =>
        `${c} a annulé la séance ci-dessous. Le créneau est de nouveau disponible.`,
      cta: "Voir mes créneaux",
    },
    cancelClient: {
      subject: "Votre séance a été annulée",
      pre: "Votre spécialiste a dû annuler.",
      eyebrow: "Annulation",
      title: "Votre séance a été annulée",
      intro: (s: string) =>
        `${s} a dû annuler la séance ci-dessous. Aucun montant ne vous sera demandé pour cette séance.`,
      cta: "Trouver un autre créneau",
      note: "Besoin d'aide pour choisir ? Répondez à cet e-mail, nous vous orientons.",
    },
  },
  en: {
    date: "Date",
    time: "Time (Morocco)",
    duration: "Duration",
    format: "Format",
    specialist: "Specialist",
    client: "Client",
    payment: "Payment",
    reason: "Reason",
    minutes: (n: number) => `${n} min`,
    online: "Online (video)",
    inPerson: (c?: string | null) => `In person${c ? `, ${c}` : ""}`,
    paid: "Paid",
    unpaid: "To pay",
    request: {
      subject: (c: string) => `New session request · ${c}`,
      pre: "A request is waiting for your answer.",
      eyebrow: "New request",
      title: "You have a session request",
      intro: (c: string) =>
        `${c} would like to book a session with you. Confirm or decline from your dashboard: the client is told right away.`,
      cta: "Answer the request",
      tip: "A quick answer matters: most clients go with the first specialist who confirms.",
    },
    confClient: {
      subject: (s: string) => `Session confirmed with ${s}`,
      pre: "Your session is confirmed. All the details inside.",
      eyebrow: "Session confirmed",
      title: "Your session is confirmed",
      intro: (s: string) =>
        `${s} confirmed your session. The calendar invite is attached to this email.`,
      ctaPay: "Pay and secure my session",
      ctaJoin: "Join the session",
      ctaOpen: "View my session",
      payNote:
        "Secure your slot: pay by bank transfer, CashPlus or Wafacash and upload your receipt. You can also pay at the session.",
      onlineNote:
        "The session link opens 10 minutes before the start. Find a quiet place and a good connection.",
      inPersonNote:
        "Your specialist will confirm the exact address of the practice.",
    },
    confPsy: {
      subject: (c: string) => `Session confirmed · ${c}`,
      pre: "The session is in your calendar.",
      eyebrow: "Session confirmed",
      title: "The session is confirmed",
      intro: (c: string) =>
        `Your session with ${c} is confirmed. The calendar invite is attached.`,
      cta: "Open my dashboard",
    },
    cancelPsy: {
      subject: "Session cancelled",
      pre: "The client cancelled the session.",
      eyebrow: "Cancellation",
      title: "A session was cancelled",
      intro: (c: string) =>
        `${c} cancelled the session below. The slot is open again.`,
      cta: "See my slots",
    },
    cancelClient: {
      subject: "Your session was cancelled",
      pre: "Your specialist had to cancel.",
      eyebrow: "Cancellation",
      title: "Your session was cancelled",
      intro: (s: string) =>
        `${s} had to cancel the session below. You will not be charged for it.`,
      cta: "Find another slot",
      note: "Need help choosing? Reply to this email and we will guide you.",
    },
  },
  ar: {
    date: "التاريخ",
    time: "الساعة (توقيت المغرب)",
    duration: "المدة",
    format: "الصيغة",
    specialist: "الأخصائي",
    client: "المراجع",
    payment: "الأداء",
    reason: "السبب",
    minutes: (n: number) => `${n} دقيقة`,
    online: "عن بُعد (فيديو)",
    inPerson: (c?: string | null) => `حضورياً${c ? `، ${c}` : ""}`,
    paid: "مؤدّاة",
    unpaid: "في انتظار الأداء",
    request: {
      subject: (c: string) => `طلب جلسة جديد · ${c}`,
      pre: "طلب ينتظر ردّك.",
      eyebrow: "طلب جديد",
      title: "لديك طلب جلسة",
      intro: (c: string) =>
        `يرغب ${c} في حجز جلسة معك. أكّد أو اعتذر من لوحة التحكم: سيُبلَّغ المراجع فوراً.`,
      cta: "الرد على الطلب",
      tip: "سرعة الرد مهمة: يختار أغلب المراجعين أول أخصائي يؤكّد.",
    },
    confClient: {
      subject: (s: string) => `تم تأكيد جلستك مع ${s}`,
      pre: "تم تأكيد جلستك. كل التفاصيل في الداخل.",
      eyebrow: "جلسة مؤكّدة",
      title: "تم تأكيد جلستك",
      intro: (s: string) => `أكّد ${s} جلستك. دعوة التقويم مرفقة بهذه الرسالة.`,
      ctaPay: "أداء الجلسة وتأمينها",
      ctaJoin: "الانضمام إلى الجلسة",
      ctaOpen: "عرض جلستي",
      payNote:
        "أمّن موعدك: ادفع بالتحويل البنكي أو CashPlus أو Wafacash وارفع الوصل. يمكنك أيضاً الأداء يوم الجلسة.",
      onlineNote:
        "يُفتح رابط الجلسة قبل 10 دقائق من موعدها. اختر مكاناً هادئاً واتصالاً جيداً.",
      inPersonNote: "سيؤكّد لك الأخصائي العنوان الدقيق للعيادة.",
    },
    confPsy: {
      subject: (c: string) => `جلسة مؤكّدة · ${c}`,
      pre: "الجلسة في تقويمك.",
      eyebrow: "جلسة مؤكّدة",
      title: "تم تأكيد الجلسة",
      intro: (c: string) => `تم تأكيد جلستك مع ${c}. دعوة التقويم مرفقة.`,
      cta: "فتح لوحة التحكم",
    },
    cancelPsy: {
      subject: "تم إلغاء جلسة",
      pre: "ألغى المراجع الجلسة.",
      eyebrow: "إلغاء",
      title: "تم إلغاء جلسة",
      intro: (c: string) =>
        `ألغى ${c} الجلسة أدناه. أصبح الموعد متاحاً من جديد.`,
      cta: "عرض مواعيدي",
    },
    cancelClient: {
      subject: "تم إلغاء جلستك",
      pre: "اضطر الأخصائي إلى الإلغاء.",
      eyebrow: "إلغاء",
      title: "تم إلغاء جلستك",
      intro: (s: string) =>
        `اضطر ${s} إلى إلغاء الجلسة أدناه. لن يُطلب منك أي مبلغ عنها.`,
      cta: "إيجاد موعد آخر",
      note: "تحتاج مساعدة في الاختيار؟ ردّ على هذه الرسالة وسنرشدك.",
    },
  },
} as const;

export function bookingEmail(
  kind: BookingMailKind,
  locale: Locale,
  c: BookingContext,
) {
  const t = L[locale];
  const w = formatWhen(c.start, locale);
  const rows = (
    who: "specialist" | "client",
    withPayment = false,
  ): Array<[string, string]> => [
    [t.date, w.date],
    [t.time, w.time],
    [t.duration, t.minutes(c.durationMin)],
    [t.format, c.online ? t.online : t.inPerson(c.city)],
    who === "specialist"
      ? [t.specialist, c.specialistName]
      : [t.client, c.clientName],
    ...(withPayment
      ? [[t.payment, c.paid ? t.paid : t.unpaid] as [string, string]]
      : []),
    ...(c.reason ? [[t.reason, c.reason] as [string, string]] : []),
  ];

  let subject: string,
    pre: string,
    eyebrow: string,
    title: string,
    body: string;
  switch (kind) {
    case "request_to_specialist": {
      const k = t.request;
      [subject, pre, eyebrow, title] = [
        k.subject(c.clientName),
        k.pre,
        k.eyebrow,
        k.title,
      ];
      body =
        p(k.intro(c.clientName), locale) +
        details(rows("client"), locale) +
        button(k.cta, c.ctaUrl, locale) +
        callout(escapeHtml(k.tip), locale);
      break;
    }
    case "confirmed_to_client": {
      const k = t.confClient;
      [subject, pre, eyebrow, title] = [
        k.subject(c.specialistName),
        k.pre,
        k.eyebrow,
        k.title,
      ];
      const cta = c.paid ? (c.online ? k.ctaJoin : k.ctaOpen) : k.ctaPay;
      body =
        p(k.intro(c.specialistName), locale) +
        details(rows("specialist", true), locale) +
        button(cta, c.ctaUrl, locale) +
        (c.paid ? "" : callout(escapeHtml(k.payNote), locale, "action")) +
        callout(escapeHtml(c.online ? k.onlineNote : k.inPersonNote), locale);
      break;
    }
    case "confirmed_to_specialist": {
      const k = t.confPsy;
      [subject, pre, eyebrow, title] = [
        k.subject(c.clientName),
        k.pre,
        k.eyebrow,
        k.title,
      ];
      body =
        p(k.intro(c.clientName), locale) +
        details(rows("client"), locale) +
        button(k.cta, c.ctaUrl, locale);
      break;
    }
    case "cancelled_to_specialist": {
      const k = t.cancelPsy;
      [subject, pre, eyebrow, title] = [k.subject, k.pre, k.eyebrow, k.title];
      body =
        p(k.intro(c.clientName), locale) +
        details(rows("client"), locale) +
        button(k.cta, c.ctaUrl, locale);
      break;
    }
    case "cancelled_to_client": {
      const k = t.cancelClient;
      [subject, pre, eyebrow, title] = [k.subject, k.pre, k.eyebrow, k.title];
      body =
        p(k.intro(c.specialistName), locale) +
        details(rows("specialist"), locale) +
        button(k.cta, c.ctaUrl, locale) +
        p(k.note, locale);
      break;
    }
  }
  const html = renderEmail({ locale, preheader: pre, eyebrow, title, body });
  return { subject, html, text: toText(html) };
}

export { rich };
