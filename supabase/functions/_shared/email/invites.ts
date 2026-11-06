/**
 * Invitations a specialist sends a client: a proposed session to accept or
 * decline, and a direct video-session link. FR / EN / AR.
 */
import {
  button,
  buttonPair,
  callout,
  details,
  escapeHtml,
  fallbackLink,
  type Locale,
  p,
  renderEmail,
  toText,
} from "./layout.ts";
import { formatWhen } from "./booking.ts";

const T = {
  fr: {
    date: "Date",
    time: "Heure (Maroc)",
    duration: "Durée",
    format: "Format",
    min: (n: number) => `${n} min`,
    formats: {
      video: "En ligne (vidéo)",
      in_person: "Au cabinet",
      phone: "Par téléphone",
    } as Record<string, string>,
    now: "Maintenant",
    proposal: {
      subject: (s: string) => `${s} vous propose une séance`,
      pre: "Acceptez ou refusez en un clic.",
      eyebrow: "Invitation",
      title: (s: string) => `${s} vous propose une séance`,
      intro:
        "Votre spécialiste vous propose le créneau ci-dessous. Répondez en un clic : votre réponse lui est transmise immédiatement.",
      accept: "Accepter",
      decline: "Refuser",
      expires: "Cette invitation expire dans 72 heures.",
    },
    meeting: {
      subject: (s: string) => `${s} vous invite à une séance vidéo`,
      pre: "Votre lien de séance sécurisé.",
      eyebrow: "Séance vidéo",
      title: (s: string) => `${s} vous invite à une séance vidéo`,
      intro:
        "Rejoignez la salle vidéo sécurisée depuis votre navigateur, sans créer de compte.",
      join: "Rejoindre la séance",
      fallback: "Ou copiez ce lien dans votre navigateur :",
      note: "Le lien reste actif jusqu'à la fin de la séance. Une question ? Répondez simplement à cet e-mail.",
    },
    message: "Message de votre spécialiste",
  },
  en: {
    date: "Date",
    time: "Time (Morocco)",
    duration: "Duration",
    format: "Format",
    min: (n: number) => `${n} min`,
    formats: {
      video: "Online (video)",
      in_person: "In person",
      phone: "By phone",
    } as Record<string, string>,
    now: "Now",
    proposal: {
      subject: (s: string) => `${s} proposed a session`,
      pre: "Accept or decline in one click.",
      eyebrow: "Invitation",
      title: (s: string) => `${s} proposed a session`,
      intro:
        "Your specialist proposed the slot below. Answer in one click: they hear back right away.",
      accept: "Accept",
      decline: "Decline",
      expires: "This invitation expires in 72 hours.",
    },
    meeting: {
      subject: (s: string) => `${s} invites you to a video session`,
      pre: "Your secure session link.",
      eyebrow: "Video session",
      title: (s: string) => `${s} invites you to a video session`,
      intro: "Join the secure video room from your browser, no account needed.",
      join: "Join the session",
      fallback: "Or paste this link into your browser:",
      note: "The link stays active until the session ends. Questions? Just reply to this email.",
    },
    message: "Message from your specialist",
  },
  ar: {
    date: "التاريخ",
    time: "الساعة (توقيت المغرب)",
    duration: "المدة",
    format: "الصيغة",
    min: (n: number) => `${n} دقيقة`,
    formats: {
      video: "عن بُعد (فيديو)",
      in_person: "حضورياً",
      phone: "عبر الهاتف",
    } as Record<string, string>,
    now: "الآن",
    proposal: {
      subject: (s: string) => `يقترح عليك ${s} جلسة`,
      pre: "اقبل أو اعتذر بنقرة واحدة.",
      eyebrow: "دعوة",
      title: (s: string) => `يقترح عليك ${s} جلسة`,
      intro:
        "اقترح عليك أخصائيك الموعد أدناه. أجب بنقرة واحدة: يصله ردّك فوراً.",
      accept: "قبول",
      decline: "اعتذار",
      expires: "تنتهي صلاحية هذه الدعوة بعد 72 ساعة.",
    },
    meeting: {
      subject: (s: string) => `يدعوك ${s} إلى جلسة فيديو`,
      pre: "رابط جلستك الآمن.",
      eyebrow: "جلسة فيديو",
      title: (s: string) => `يدعوك ${s} إلى جلسة فيديو`,
      intro: "انضم إلى غرفة الفيديو الآمنة من متصفحك دون إنشاء حساب.",
      join: "الانضمام إلى الجلسة",
      fallback: "أو انسخ هذا الرابط في متصفحك:",
      note: "يبقى الرابط نشطاً حتى نهاية الجلسة. سؤال؟ ردّ على هذه الرسالة.",
    },
    message: "رسالة من أخصائيك",
  },
} as const;

const note = (
  text: string | null | undefined,
  label: string,
  locale: Locale,
) =>
  text
    ? callout(
        `<strong>${escapeHtml(label)}</strong><br>${escapeHtml(text)}`,
        locale,
      )
    : "";

export function proposalEmail(o: {
  locale: Locale;
  specialist: string;
  start: Date;
  durationMin: number;
  sessionType: string;
  notes?: string | null;
  acceptUrl: string;
  declineUrl: string;
}) {
  const t = T[o.locale],
    k = t.proposal,
    w = formatWhen(o.start, o.locale);
  const body =
    p(k.intro, o.locale) +
    details(
      [
        [t.date, w.date],
        [t.time, w.time],
        [t.duration, t.min(o.durationMin)],
        [t.format, t.formats[o.sessionType] ?? o.sessionType],
      ],
      o.locale,
    ) +
    note(o.notes, t.message, o.locale) +
    buttonPair(
      { label: k.accept, url: o.acceptUrl },
      { label: k.decline, url: o.declineUrl },
      o.locale,
    ) +
    p(k.expires, o.locale);
  const html = renderEmail({
    locale: o.locale,
    preheader: k.pre,
    eyebrow: k.eyebrow,
    title: k.title(o.specialist),
    body,
  });
  return {
    subject: k.subject(o.specialist.replace(/[\r\n<>]/g, " ")),
    html,
    text: toText(html),
  };
}

export function meetingLinkEmail(o: {
  locale: Locale;
  specialist: string;
  start: Date;
  isNow: boolean;
  durationMin: number;
  notes?: string | null;
  joinUrl: string;
}) {
  const t = T[o.locale],
    k = t.meeting,
    w = formatWhen(o.start, o.locale);
  const rows: Array<[string, string]> = o.isNow
    ? [
        [t.date, t.now],
        [t.duration, t.min(o.durationMin)],
      ]
    : [
        [t.date, w.date],
        [t.time, w.time],
        [t.duration, t.min(o.durationMin)],
      ];
  const body =
    p(k.intro, o.locale) +
    details(rows, o.locale) +
    note(o.notes, t.message, o.locale) +
    button(k.join, o.joinUrl, o.locale) +
    fallbackLink(k.fallback, o.joinUrl, o.locale) +
    p(k.note, o.locale);
  const html = renderEmail({
    locale: o.locale,
    preheader: k.pre,
    eyebrow: k.eyebrow,
    title: k.title(o.specialist),
    body,
  });
  return {
    subject: k.subject(o.specialist.replace(/[\r\n<>]/g, " ")),
    html,
    text: toText(html),
  };
}

const R = {
  fr: {
    psyAccepted: (c: string) => `${c} a accepté votre séance`,
    psyDeclined: (c: string) => `${c} a décliné votre séance`,
    clientAccepted: (s: string) => `Votre séance avec ${s} est confirmée`,
    clientDeclined: (s: string) => `Vous avez décliné la séance avec ${s}`,
    psyAcceptedText: "La séance est confirmée. La salle vidéo est prête.",
    psyDeclinedText: "Le créneau est de nouveau disponible.",
    clientAcceptedText:
      "Gardez ce lien : la salle ouvre 10 minutes avant le début.",
    clientDeclinedText:
      "Nous avons prévenu votre spécialiste. Vous pouvez choisir un autre créneau à tout moment.",
    reason: "Motif",
    noReason: "Aucun motif n'a été donné.",
    join: "Rejoindre la séance",
    open: "Ouvrir la séance",
    find: "Voir les créneaux",
    dash: "Ouvrir mon tableau de bord",
  },
  en: {
    psyAccepted: (c: string) => `${c} accepted your session`,
    psyDeclined: (c: string) => `${c} declined your session`,
    clientAccepted: (s: string) => `Your session with ${s} is confirmed`,
    clientDeclined: (s: string) => `You declined the session with ${s}`,
    psyAcceptedText: "The session is confirmed. The video room is ready.",
    psyDeclinedText: "The slot is open again.",
    clientAcceptedText:
      "Keep this link: the room opens 10 minutes before the start.",
    clientDeclinedText:
      "We let your specialist know. You can pick another slot at any time.",
    reason: "Reason",
    noReason: "No reason was given.",
    join: "Join the session",
    open: "Open the session",
    find: "See available slots",
    dash: "Open my dashboard",
  },
  ar: {
    psyAccepted: (c: string) => `قبل ${c} جلستك`,
    psyDeclined: (c: string) => `اعتذر ${c} عن جلستك`,
    clientAccepted: (s: string) => `تم تأكيد جلستك مع ${s}`,
    clientDeclined: (s: string) => `اعتذرت عن الجلسة مع ${s}`,
    psyAcceptedText: "تم تأكيد الجلسة. غرفة الفيديو جاهزة.",
    psyDeclinedText: "أصبح الموعد متاحاً من جديد.",
    clientAcceptedText:
      "احتفظ بهذا الرابط: تُفتح الغرفة قبل 10 دقائق من البداية.",
    clientDeclinedText: "أبلغنا أخصائيك. يمكنك اختيار موعد آخر في أي وقت.",
    reason: "السبب",
    noReason: "لم يُذكر أي سبب.",
    join: "الانضمام إلى الجلسة",
    open: "فتح الجلسة",
    find: "عرض المواعيد",
    dash: "فتح لوحة التحكم",
  },
} as const;

export function proposalResponseEmail(o: {
  locale: Locale;
  to: "specialist" | "client";
  accepted: boolean;
  specialist: string;
  client: string;
  start: Date;
  durationMin: number;
  sessionType: string;
  reason?: string | null;
  joinUrl: string;
  fallbackUrl: string;
}) {
  const t = T[o.locale],
    r = R[o.locale],
    w = formatWhen(o.start, o.locale);
  const psy = o.to === "specialist";
  const title = psy
    ? o.accepted
      ? r.psyAccepted(o.client)
      : r.psyDeclined(o.client)
    : o.accepted
      ? r.clientAccepted(o.specialist)
      : r.clientDeclined(o.specialist);
  const text = psy
    ? o.accepted
      ? r.psyAcceptedText
      : r.psyDeclinedText
    : o.accepted
      ? r.clientAcceptedText
      : r.clientDeclinedText;
  const rows: Array<[string, string]> = [
    [t.date, w.date],
    [t.time, w.time],
    [t.duration, t.min(o.durationMin)],
    [t.format, t.formats[o.sessionType] ?? o.sessionType],
  ];
  if (psy && !o.accepted) rows.push([r.reason, o.reason?.trim() || r.noReason]);
  const cta = o.accepted
    ? button(psy ? r.join : r.open, o.joinUrl, o.locale)
    : button(psy ? r.dash : r.find, o.fallbackUrl, o.locale);
  const html = renderEmail({
    locale: o.locale,
    preheader: text,
    title,
    body: p(text, o.locale) + details(rows, o.locale) + cta,
  });
  return { subject: `${title} · U.Psy`, html, text: toText(html) };
}
