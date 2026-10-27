// Study settings and the participant-facing text (consent included).
// Changing the consent wording means bumping CONSENT_VERSION: every
// enrolment records the version the participant agreed to.
import { useLocale } from "@/contexts/LocaleContext";
import type { Locale } from "@/lib/i18n/utils";

export const STUDY = {
  CONSENT_VERSION: "2026-10-v1",
  /** Ethics committee reference, shown in the consent once granted. */
  ETHICS_REF: null as string | null,
  INVESTIGATOR: "Mehdi Felji",
  CONTACT: "contact@upsy.ma",
};

const en = {
  nav: "Study",
  title: "U.Psy Athlete Well-being Study",
  pitch:
    "A longitudinal study of how well-being, stress, sleep and burnout move with training and competition. Your answers help build the first sport psychology dataset of its kind in Morocco and Africa.",
  bullets: [
    "About 3 minutes a week, plus your daily check-in",
    "Validated questionnaires: WHO-5, PSS-10, ABQ, MTI and sleep",
    "Pseudonymised: researchers see a code, never your name",
    "Leave whenever you want, with or without your data",
  ],
  learnMore: "Read the information sheet and join",
  consentTitle: "Information and consent",
  consent: [
    [
      "Purpose",
      "To describe how athletes' well-being, perceived stress, sleep, burnout and mental toughness change over a season, and how they relate to daily readiness and competition performance.",
    ],
    [
      "What you do",
      "Answer short questionnaires in the Athlete Hub: sleep every week, well-being every two weeks, stress and burnout every four weeks, mental toughness every twelve weeks. Your daily readiness check-ins and the importance and self-rating of your competitions are included. Names, places, results and anything you write in free text are not.",
    ],
    [
      "Your data",
      "You get a participant code. The research export contains that code, your birth year, sex, sport and level, and your answers. It never contains your name, email or account. Data are stored on U.Psy's servers and handled under Moroccan Law 09-08 on personal data.",
    ],
    [
      "Voluntary",
      "Taking part is voluntary and has no effect on any service you use at U.Psy. You can skip a questionnaire, and you can withdraw at any time from this page. When you withdraw you choose whether the answers given so far may still be used or must be deleted.",
    ],
    [
      "Risks and support",
      "Some questions are about mood and stress. If your answers suggest you are struggling, the Hub will show you support options. This study is not a clinical service and nobody on the research team monitors individual answers. In an emergency in Morocco call 141 (medical) or 19 (police).",
    ],
    [
      "Who runs it",
      `U.Psy, under the responsibility of ${STUDY.INVESTIGATOR}, clinical sport psychologist. Questions: ${STUDY.CONTACT}.`,
    ],
  ] as [string, string][],
  ethics: (ref: string | null) =>
    ref
      ? `Ethics approval: ${ref}.`
      : "Ethics committee review is in progress; findings will only be published after approval.",
  about: "About you",
  birthYear: "Birth year",
  sex: "Sex",
  sexes: {
    female: "Female",
    male: "Male",
    other: "Other",
    undisclosed: "Prefer not to say",
  },
  sport: "Main sport",
  level: "Level",
  levels: {
    recreational: "Recreational",
    competitive: "Competitive (club)",
    national: "National",
    international: "International",
  },
  checks: [
    "I am 18 or older.",
    "I have read the information above and had the chance to ask questions.",
    "I agree to take part and to my pseudonymised data being used for research.",
  ],
  join: "Join the study",
  joining: "Joining…",
  under18: "The study is open to adults (18+) only.",
  joined: "Welcome to the study",
  code: "Your participant code",
  due: "Due now",
  upToDate: "You're up to date. Thank you.",
  next: (d: string) => `Next on ${d}`,
  answer: "Answer",
  minutes: (n: number) => `~${n} min`,
  of: (i: number, n: number) => `${i} of ${n}`,
  back: "Back",
  submit: "Submit",
  saved: "Saved. Thank you.",
  sleepHours: "On average, how many hours did you sleep per night?",
  sleepQuality: "How would you rate your sleep quality overall?",
  sleepQualityEnds: ["Terrible", "Excellent"] as [string, string],
  sleepTrouble:
    "On how many nights did you have trouble falling or staying asleep?",
  hoursUnit: "hours",
  nightsUnit: "nights",
  readinessNote: "Your daily check-in (module 1) counts for the study too.",
  urgent:
    "Your answers suggest you have been feeling low for a while. You don't have to carry this alone: talking to a psychologist can help.",
  notice:
    "Your answers suggest a heavy period. A session with a psychologist or a recovery protocol could help.",
  book: "See a psychologist",
  emergency: "In an emergency in Morocco: 141 (medical) or 19 (police).",
  withdraw: "Leave the study",
  withdrawTitle: "Leave the study?",
  withdrawDesc:
    "You can leave at any time without giving a reason. What should happen to the answers you have already given?",
  withdrawKeep: "Leave, my answers may be used",
  withdrawDelete: "Leave and delete my study answers",
  cancel: "Cancel",
  withdrawn: (d: string) => `You left the study on ${d}.`,
  rejoin: "Join again",
  error: "Something went wrong. Please try again.",
};

type StudyCopy = typeof en;

const fr: StudyCopy = {
  ...en,
  nav: "Étude",
  title: "Étude U.Psy sur le bien-être des athlètes",
  pitch:
    "Une étude longitudinale sur l'évolution du bien-être, du stress, du sommeil et de l'épuisement au fil des entraînements et des compétitions. Vos réponses construisent la première base de données de psychologie du sport de ce type au Maroc et en Afrique.",
  bullets: [
    "Environ 3 minutes par semaine, plus votre check-in quotidien",
    "Questionnaires validés : WHO-5, PSS-10, ABQ, MTI et sommeil",
    "Pseudonymisé : les chercheurs voient un code, jamais votre nom",
    "Vous pouvez partir quand vous voulez, avec ou sans vos données",
  ],
  learnMore: "Lire la notice d'information et participer",
  consentTitle: "Information et consentement",
  consent: [
    [
      "Objectif",
      "Décrire comment le bien-être, le stress perçu, le sommeil, l'épuisement et la robustesse mentale des athlètes évoluent au cours d'une saison, et leurs liens avec la disponibilité quotidienne et la performance en compétition.",
    ],
    [
      "Ce que vous faites",
      "Répondre à de courts questionnaires dans l'Athlete Hub : sommeil chaque semaine, bien-être toutes les deux semaines, stress et épuisement toutes les quatre semaines, robustesse mentale toutes les douze semaines. Vos check-ins quotidiens ainsi que l'importance et l'auto-évaluation de vos compétitions sont inclus. Les noms, lieux, résultats et tout texte libre ne le sont pas.",
    ],
    [
      "Vos données",
      "Vous recevez un code participant. L'export de recherche contient ce code, votre année de naissance, sexe, sport et niveau, et vos réponses. Il ne contient jamais votre nom, e-mail ou compte. Les données sont hébergées par U.Psy et traitées conformément à la loi marocaine 09-08 sur les données personnelles.",
    ],
    [
      "Participation volontaire",
      "La participation est volontaire et n'a aucun effet sur les services U.Psy que vous utilisez. Vous pouvez passer un questionnaire et vous retirer à tout moment depuis cette page. En vous retirant, vous choisissez si les réponses déjà données peuvent être utilisées ou doivent être supprimées.",
    ],
    [
      "Risques et soutien",
      "Certaines questions portent sur l'humeur et le stress. Si vos réponses suggèrent une période difficile, le Hub vous proposera des options de soutien. Cette étude n'est pas un service clinique et personne dans l'équipe de recherche ne suit les réponses individuelles. En cas d'urgence au Maroc, appelez le 141 (SAMU) ou le 19 (police).",
    ],
    [
      "Responsable",
      `U.Psy, sous la responsabilité de ${STUDY.INVESTIGATOR}, psychologue clinicien du sport. Questions : ${STUDY.CONTACT}.`,
    ],
  ],
  ethics: (ref) =>
    ref
      ? `Avis du comité d'éthique : ${ref}.`
      : "L'examen par un comité d'éthique est en cours ; aucun résultat ne sera publié avant son avis favorable.",
  about: "À propos de vous",
  birthYear: "Année de naissance",
  sex: "Sexe",
  sexes: {
    female: "Femme",
    male: "Homme",
    other: "Autre",
    undisclosed: "Je préfère ne pas répondre",
  },
  sport: "Sport principal",
  level: "Niveau",
  levels: {
    recreational: "Loisir",
    competitive: "Compétition (club)",
    national: "National",
    international: "International",
  },
  checks: [
    "J'ai 18 ans ou plus.",
    "J'ai lu les informations ci-dessus et j'ai pu poser mes questions.",
    "J'accepte de participer et que mes données pseudonymisées soient utilisées pour la recherche.",
  ],
  join: "Participer à l'étude",
  joining: "Inscription…",
  under18: "L'étude est réservée aux adultes (18 ans et plus).",
  joined: "Bienvenue dans l'étude",
  code: "Votre code participant",
  due: "À remplir",
  upToDate: "Vous êtes à jour. Merci.",
  next: (d) => `Prochain le ${d}`,
  answer: "Répondre",
  minutes: (n) => `~${n} min`,
  of: (i, n) => `${i} sur ${n}`,
  back: "Retour",
  submit: "Envoyer",
  saved: "Enregistré. Merci.",
  sleepHours: "En moyenne, combien d'heures avez-vous dormi par nuit ?",
  sleepQuality: "Comment évaluez-vous la qualité globale de votre sommeil ?",
  sleepQualityEnds: ["Très mauvaise", "Excellente"],
  sleepTrouble:
    "Combien de nuits avez-vous eu du mal à vous endormir ou à rester endormi(e) ?",
  hoursUnit: "heures",
  nightsUnit: "nuits",
  readinessNote:
    "Votre check-in quotidien (module 1) compte aussi pour l'étude.",
  urgent:
    "Vos réponses suggèrent que vous vous sentez mal depuis un moment. Vous n'avez pas à porter cela seul(e) : parler à un psychologue peut aider.",
  notice:
    "Vos réponses suggèrent une période chargée. Une séance avec un psychologue ou un protocole de récupération pourrait aider.",
  book: "Consulter un psychologue",
  emergency: "En cas d'urgence au Maroc : 141 (SAMU) ou 19 (police).",
  withdraw: "Quitter l'étude",
  withdrawTitle: "Quitter l'étude ?",
  withdrawDesc:
    "Vous pouvez partir à tout moment sans vous justifier. Que faire des réponses déjà données ?",
  withdrawKeep: "Partir, mes réponses peuvent être utilisées",
  withdrawDelete: "Partir et supprimer mes réponses",
  cancel: "Annuler",
  withdrawn: (d) => `Vous avez quitté l'étude le ${d}.`,
  rejoin: "Participer à nouveau",
  error: "Une erreur est survenue. Veuillez réessayer.",
};

const ar: StudyCopy = {
  ...en,
  nav: "الدراسة",
  title: "دراسة U.Psy حول رفاهية الرياضيين",
  pitch:
    "دراسة طولية حول تطور الرفاهية والضغط والنوم والاحتراق مع التدريب والمنافسة. إجاباتك تساهم في بناء أول قاعدة بيانات من نوعها في علم النفس الرياضي في المغرب وإفريقيا.",
  bullets: [
    "حوالي 3 دقائق أسبوعياً، بالإضافة إلى تقييمك اليومي",
    "استبيانات معتمدة: WHO-5 وPSS-10 وABQ وMTI والنوم",
    "بيانات مستعارة: يرى الباحثون رمزاً، وليس اسمك أبداً",
    "يمكنك الانسحاب متى شئت، مع بياناتك أو بدونها",
  ],
  learnMore: "اقرأ ورقة المعلومات وانضم",
  consentTitle: "المعلومات والموافقة",
  consent: [
    [
      "الهدف",
      "وصف كيفية تطور رفاهية الرياضيين والضغط المدرك والنوم والاحتراق والصلابة الذهنية خلال الموسم، وعلاقتها بالجاهزية اليومية والأداء في المنافسات.",
    ],
    [
      "ما ستقوم به",
      "الإجابة عن استبيانات قصيرة في Athlete Hub: النوم كل أسبوع، الرفاهية كل أسبوعين، الضغط والاحتراق كل أربعة أسابيع، الصلابة الذهنية كل اثني عشر أسبوعاً. تُدرج تقييماتك اليومية وأهمية منافساتك وتقييمك لأدائك فيها. أما الأسماء والأماكن والنتائج وأي نص حر فلا تُدرج.",
    ],
    [
      "بياناتك",
      "تحصل على رمز مشارك. يحتوي ملف البحث على هذا الرمز وسنة ميلادك وجنسك ورياضتك ومستواك وإجاباتك، ولا يحتوي أبداً على اسمك أو بريدك أو حسابك. تُحفظ البيانات لدى U.Psy وتُعالج وفق القانون المغربي 09-08 المتعلق بالمعطيات الشخصية.",
    ],
    [
      "المشاركة طوعية",
      "المشاركة طوعية ولا تؤثر على أي خدمة تستعملها في U.Psy. يمكنك تخطي أي استبيان والانسحاب في أي وقت من هذه الصفحة. عند الانسحاب تختار ما إذا كان يمكن استعمال إجاباتك السابقة أو يجب حذفها.",
    ],
    [
      "المخاطر والدعم",
      "بعض الأسئلة تتعلق بالمزاج والضغط. إذا أشارت إجاباتك إلى أنك تمر بفترة صعبة، سيعرض عليك الـHub خيارات للدعم. هذه الدراسة ليست خدمة علاجية ولا يتابع أحد من فريق البحث الإجابات الفردية. في حالة الطوارئ في المغرب اتصل بـ141 (الإسعاف) أو 19 (الشرطة).",
    ],
    [
      "الجهة المسؤولة",
      `U.Psy، تحت مسؤولية ${STUDY.INVESTIGATOR}، أخصائي نفسي إكلينيكي رياضي. للاستفسار: ${STUDY.CONTACT}.`,
    ],
  ],
  ethics: (ref) =>
    ref
      ? `موافقة لجنة الأخلاقيات: ${ref}.`
      : "مراجعة لجنة الأخلاقيات جارية، ولن تُنشر أي نتائج قبل موافقتها.",
  about: "معلومات عنك",
  birthYear: "سنة الميلاد",
  sex: "الجنس",
  sexes: {
    female: "أنثى",
    male: "ذكر",
    other: "آخر",
    undisclosed: "أفضل عدم الإجابة",
  },
  sport: "الرياضة الرئيسية",
  level: "المستوى",
  levels: {
    recreational: "ترفيهي",
    competitive: "تنافسي (نادي)",
    national: "وطني",
    international: "دولي",
  },
  checks: [
    "عمري 18 سنة أو أكثر.",
    "قرأت المعلومات أعلاه وأتيحت لي فرصة طرح الأسئلة.",
    "أوافق على المشاركة وعلى استعمال بياناتي المستعارة لأغراض البحث.",
  ],
  join: "انضم إلى الدراسة",
  joining: "جارٍ التسجيل…",
  under18: "الدراسة مفتوحة للبالغين فقط (18 سنة فما فوق).",
  joined: "مرحباً بك في الدراسة",
  code: "رمز المشارك الخاص بك",
  due: "مطلوب الآن",
  upToDate: "أنت على اطلاع. شكراً لك.",
  next: (d) => `القادم في ${d}`,
  answer: "أجب",
  minutes: (n) => `~${n} د`,
  of: (i, n) => `${i} من ${n}`,
  back: "رجوع",
  submit: "إرسال",
  saved: "تم الحفظ. شكراً لك.",
  sleepHours: "في المتوسط، كم ساعة نمت في الليلة؟",
  sleepQuality: "كيف تقيّم جودة نومك بشكل عام؟",
  sleepQualityEnds: ["سيئة جداً", "ممتازة"],
  sleepTrouble: "في كم ليلة واجهت صعوبة في النوم أو في البقاء نائماً؟",
  hoursUnit: "ساعات",
  nightsUnit: "ليالٍ",
  readinessNote: "تقييمك اليومي (الوحدة 1) يُحتسب أيضاً في الدراسة.",
  urgent:
    "تشير إجاباتك إلى أنك تشعر بالإحباط منذ فترة. لست مضطراً لتحمل هذا وحدك: الحديث مع أخصائي نفسي يمكن أن يساعد.",
  notice:
    "تشير إجاباتك إلى فترة صعبة. قد تساعدك جلسة مع أخصائي نفسي أو بروتوكول للاسترجاع.",
  book: "استشر أخصائياً نفسياً",
  emergency: "في حالة الطوارئ في المغرب: 141 (الإسعاف) أو 19 (الشرطة).",
  withdraw: "مغادرة الدراسة",
  withdrawTitle: "مغادرة الدراسة؟",
  withdrawDesc:
    "يمكنك المغادرة في أي وقت دون ذكر السبب. ماذا نفعل بالإجابات التي قدمتها؟",
  withdrawKeep: "أغادر، ويمكن استعمال إجاباتي",
  withdrawDelete: "أغادر وأحذف إجاباتي",
  cancel: "إلغاء",
  withdrawn: (d) => `غادرت الدراسة في ${d}.`,
  rejoin: "انضم مجدداً",
  error: "حدث خطأ. يرجى المحاولة مجدداً.",
};

const registry: Record<Locale, StudyCopy> = { en, fr, ar, ber: fr };

export function useStudyCopy(): StudyCopy {
  const { locale } = useLocale();
  return registry[locale] ?? en;
}
