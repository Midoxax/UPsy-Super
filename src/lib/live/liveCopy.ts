import { useLocale } from "@/contexts/LocaleContext";

const en = {
  title: "Live classes",
  subtitle:
    "Join an Academy class live with a psychologist. Ask your questions, practise together, and replay it afterwards.",
  upcoming: "Upcoming classes",
  past: "Past classes",
  none: "No class scheduled yet. Come back soon.",
  manage: "Manage my classes",
  minutes: "min",
  seatsLeft: (n: number) => `${n} seat${n === 1 ? "" : "s"} left`,
  full: "Full",
  recorded: "Recorded",
  notRecorded: "Not recorded",
  signIn: "Sign in to register",
  register: "Register",
  registered: "You're registered",
  cancel: "Cancel my registration",
  join: "Join the class",
  opensAt: "The room opens 10 minutes before the start.",
  consent:
    "I agree that this educational class is recorded (video and voice) and that the recording is shared with participants and Academy members. I can turn off my camera and microphone at any time.",
  consentNeeded: "Please accept the recording notice to register.",
  errFull: "This class is full.",
  errPast: "This class has already taken place.",
  errUnavailable: "This class is not open for registration.",
  replays: "Recordings",
  noReplay: "No recording available yet.",
  watch: "Watch",
  back: "All live classes",
  leave: "Leave",
  hostNote: "You're the host: you can admit people and start the recording.",
  loading: "Loading…",
  roomError: "Could not open the room.",
  fallbackNote: "Using the public video server: this session is not recorded.",
  course: "Linked course",
};

type Copy = typeof en;

const fr: Copy = {
  title: "Cours en direct",
  subtitle:
    "Suivez un cours de l'Académie en direct avec un psychologue. Posez vos questions, pratiquez ensemble, et revoyez-le ensuite.",
  upcoming: "Prochains cours",
  past: "Cours passés",
  none: "Aucun cours programmé pour l'instant. Revenez bientôt.",
  manage: "Gérer mes cours",
  minutes: "min",
  seatsLeft: (n) => `${n} place${n > 1 ? "s" : ""} restante${n > 1 ? "s" : ""}`,
  full: "Complet",
  recorded: "Enregistré",
  notRecorded: "Non enregistré",
  signIn: "Connectez-vous pour vous inscrire",
  register: "S'inscrire",
  registered: "Vous êtes inscrit",
  cancel: "Annuler mon inscription",
  join: "Rejoindre le cours",
  opensAt: "La salle ouvre 10 minutes avant le début.",
  consent:
    "J'accepte que ce cours éducatif soit enregistré (image et voix) et que l'enregistrement soit partagé avec les participants et les membres de l'Académie. Je peux couper ma caméra et mon micro à tout moment.",
  consentNeeded:
    "Merci d'accepter la mention d'enregistrement pour vous inscrire.",
  errFull: "Ce cours est complet.",
  errPast: "Ce cours a déjà eu lieu.",
  errUnavailable: "Les inscriptions à ce cours ne sont pas ouvertes.",
  replays: "Enregistrements",
  noReplay: "Aucun enregistrement disponible pour l'instant.",
  watch: "Regarder",
  back: "Tous les cours en direct",
  leave: "Quitter",
  hostNote:
    "Vous animez ce cours : vous pouvez admettre les participants et lancer l'enregistrement.",
  loading: "Chargement…",
  roomError: "Impossible d'ouvrir la salle.",
  fallbackNote:
    "Serveur vidéo public utilisé : cette séance n'est pas enregistrée.",
  course: "Cours associé",
};

const ar: Copy = {
  title: "الدروس المباشرة",
  subtitle:
    "تابع درساً من الأكاديمية مباشرة مع أخصائي نفسي. اطرح أسئلتك، تدرّب مع الآخرين، وأعد مشاهدته لاحقاً.",
  upcoming: "الدروس القادمة",
  past: "الدروس السابقة",
  none: "لا توجد دروس مبرمجة حالياً. عد قريباً.",
  manage: "إدارة دروسي",
  minutes: "د",
  seatsLeft: (n) => `${n} مقاعد متبقية`,
  full: "مكتمل",
  recorded: "مسجَّل",
  notRecorded: "غير مسجَّل",
  signIn: "سجّل الدخول للتسجيل",
  register: "سجّل",
  registered: "أنت مسجَّل",
  cancel: "إلغاء تسجيلي",
  join: "انضم إلى الدرس",
  opensAt: "تُفتح القاعة قبل 10 دقائق من البداية.",
  consent:
    "أوافق على تسجيل هذا الدرس التعليمي (صورة وصوت) ومشاركة التسجيل مع المشاركين وأعضاء الأكاديمية. يمكنني إيقاف الكاميرا والميكروفون في أي وقت.",
  consentNeeded: "يرجى قبول إشعار التسجيل للتسجيل في الدرس.",
  errFull: "هذا الدرس مكتمل.",
  errPast: "هذا الدرس انتهى.",
  errUnavailable: "التسجيل في هذا الدرس غير مفتوح.",
  replays: "التسجيلات",
  noReplay: "لا يوجد تسجيل متاح بعد.",
  watch: "شاهد",
  back: "كل الدروس المباشرة",
  leave: "مغادرة",
  hostNote: "أنت المنشط: يمكنك قبول المشاركين وبدء التسجيل.",
  loading: "جارٍ التحميل…",
  roomError: "تعذّر فتح القاعة.",
  fallbackNote: "يُستخدم خادم الفيديو العام: هذه الجلسة غير مسجَّلة.",
  course: "الدورة المرتبطة",
};

export function useLiveCopy() {
  const { locale } = useLocale();
  return { t: locale === "ar" ? ar : locale === "en" ? en : fr, locale };
}

/** Date and time in the reader's locale and time zone. */
export function formatWhen(iso: string, locale: string) {
  const tag = locale === "ar" ? "ar-MA" : locale === "en" ? "en-GB" : "fr-FR";
  return new Intl.DateTimeFormat(tag, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function registerError(code: string, t: Copy) {
  if (code === "full") return t.errFull;
  if (code === "past") return t.errPast;
  if (code === "consent_required") return t.consentNeeded;
  return t.errUnavailable;
}
