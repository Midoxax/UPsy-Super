// L'Observatoire U.Psy — survey instrument definition.
// Bilingual FR/AR. Ported faithfully from the standalone research app;
// only the presentation layer is rebuilt against the platform design system.
//
// STRICT ANONYMITY: nothing in this module may ever carry a name, email,
// phone, user id, or any key back to a person.

export type SurveyLang = "fr" | "ar";
export type Track = "patient" | "psychologist";

export type Loc = Record<SurveyLang, string>;

export type Question =
  | { id: string; kind: "likert"; label: Loc; help?: Loc; scale?: 5; anchors?: [Loc, Loc] }
  | { id: string; kind: "nps"; label: Loc; help?: Loc }
  | { id: string; kind: "choice"; label: Loc; help?: Loc; options: { value: string; label: Loc }[] }
  | { id: string; kind: "price"; label: Loc; help?: Loc; min: number; max: number }
  | { id: string; kind: "number"; label: Loc; help?: Loc; min: number; max: number }
  | { id: string; kind: "text"; label: Loc; help?: Loc; optional?: boolean; maxLength?: number }
  | { id: string; kind: "boolean"; label: Loc; help?: Loc };

export interface Section {
  id: string;
  title: Loc;
  subtitle?: Loc;
  questions: Question[];
}

const LIKERT_ANCHORS: [Loc, Loc] = [
  { fr: "Pas du tout", ar: "إطلاقًا" },
  { fr: "Tout à fait", ar: "تمامًا" },
];

const CITIES: { value: string; label: Loc }[] = [
  { value: "casablanca", label: { fr: "Casablanca", ar: "الدار البيضاء" } },
  { value: "rabat", label: { fr: "Rabat", ar: "الرباط" } },
  { value: "marrakech", label: { fr: "Marrakech", ar: "مراكش" } },
  { value: "tanger", label: { fr: "Tanger", ar: "طنجة" } },
  { value: "fes", label: { fr: "Fès", ar: "فاس" } },
  { value: "agadir", label: { fr: "Agadir", ar: "أكادير" } },
  { value: "other_ma", label: { fr: "Autre ville du Maroc", ar: "مدينة أخرى بالمغرب" } },
  { value: "abroad", label: { fr: "À l'étranger", ar: "خارج المغرب" } },
];

const TIMELINE_OPTIONS = [
  { value: "now", label: { fr: "Maintenant", ar: "الآن" } },
  { value: "3_months", label: { fr: "Dans les 3 prochains mois", ar: "خلال 3 أشهر" } },
  { value: "later", label: { fr: "Plus tard", ar: "لاحقًا" } },
  { value: "unsure", label: { fr: "Je ne sais pas", ar: "لست متأكدًا" } },
];

// ─── PATIENT TRACK ───────────────────────────────────────────────────────────

export const PATIENT_SECTIONS: Section[] = [
  {
    id: "demographics",
    title: { fr: "Vous, en quelques repères", ar: "معطيات عامة عنك" },
    subtitle: {
      fr: "Aucune de ces réponses ne permet de vous identifier.",
      ar: "لا تسمح أي من هذه الإجابات بالتعرف عليك.",
    },
    questions: [
      {
        id: "age_band",
        kind: "choice",
        label: { fr: "Tranche d'âge", ar: "الفئة العمرية" },
        options: [
          { value: "18_24", label: { fr: "18-24", ar: "18-24" } },
          { value: "25_34", label: { fr: "25-34", ar: "25-34" } },
          { value: "35_44", label: { fr: "35-44", ar: "35-44" } },
          { value: "45_54", label: { fr: "45-54", ar: "45-54" } },
          { value: "55_plus", label: { fr: "55 et plus", ar: "55 فما فوق" } },
        ],
      },
      {
        id: "gender",
        kind: "choice",
        label: { fr: "Genre", ar: "الجنس" },
        options: [
          { value: "female", label: { fr: "Femme", ar: "أنثى" } },
          { value: "male", label: { fr: "Homme", ar: "ذكر" } },
          { value: "other", label: { fr: "Autre / je préfère ne pas dire", ar: "آخر / أفضل عدم الإفصاح" } },
        ],
      },
      { id: "city", kind: "choice", label: { fr: "Où vivez-vous ?", ar: "أين تقيم؟" }, options: CITIES },
      {
        id: "activity",
        kind: "choice",
        label: { fr: "Situation actuelle", ar: "الوضعية الحالية" },
        options: [
          { value: "student", label: { fr: "Étudiant(e)", ar: "طالب(ة)" } },
          { value: "employed", label: { fr: "Salarié(e)", ar: "أجير(ة)" } },
          { value: "self_employed", label: { fr: "Indépendant(e) / entrepreneur", ar: "مستقل(ة) / مقاول(ة)" } },
          { value: "unemployed", label: { fr: "Sans emploi", ar: "بدون عمل" } },
          { value: "other", label: { fr: "Autre", ar: "آخر" } },
        ],
      },
    ],
  },
  {
    id: "history",
    title: { fr: "Votre expérience du suivi psychologique", ar: "تجربتك مع المتابعة النفسية" },
    questions: [
      {
        id: "consulted_before",
        kind: "choice",
        label: { fr: "Avez-vous déjà consulté un psychologue ?", ar: "هل سبق أن استشرت أخصائيًا نفسيًا؟" },
        options: [
          { value: "currently", label: { fr: "Oui, actuellement", ar: "نعم، حاليًا" } },
          { value: "past", label: { fr: "Oui, par le passé", ar: "نعم، في الماضي" } },
          { value: "never_considered", label: { fr: "Non, mais j'y ai pensé", ar: "لا، لكنني فكرت في ذلك" } },
          { value: "never", label: { fr: "Non, jamais", ar: "لا، أبدًا" } },
        ],
      },
      {
        id: "teleconsultation_experience",
        kind: "choice",
        label: { fr: "Avez-vous déjà fait une séance en visioconférence ?", ar: "هل سبق أن أجريت جلسة عن بعد؟" },
        options: [
          { value: "yes_good", label: { fr: "Oui, bonne expérience", ar: "نعم، تجربة جيدة" } },
          { value: "yes_mixed", label: { fr: "Oui, expérience mitigée", ar: "نعم، تجربة متباينة" } },
          { value: "no", label: { fr: "Non, jamais", ar: "لا، أبدًا" } },
        ],
      },
    ],
  },
  {
    id: "barriers",
    title: { fr: "Ce qui freine l'accès aux soins", ar: "ما يعيق الوصول إلى الرعاية" },
    subtitle: {
      fr: "À quel point chacun de ces éléments vous freine-t-il ?",
      ar: "إلى أي حد يشكل كل عنصر عائقًا بالنسبة لك؟",
    },
    questions: [
      { id: "barrier_cost", kind: "likert", anchors: LIKERT_ANCHORS, label: { fr: "Le coût des séances", ar: "تكلفة الجلسات" } },
      { id: "barrier_availability", kind: "likert", anchors: LIKERT_ANCHORS, label: { fr: "La difficulté à trouver un créneau", ar: "صعوبة إيجاد موعد" } },
      { id: "barrier_stigma", kind: "likert", anchors: LIKERT_ANCHORS, label: { fr: "Le regard des autres", ar: "نظرة الآخرين" } },
      { id: "barrier_trust", kind: "likert", anchors: LIKERT_ANCHORS, label: { fr: "Le manque de confiance envers les praticiens", ar: "غياب الثقة في الممارسين" } },
      { id: "barrier_awareness", kind: "likert", anchors: LIKERT_ANCHORS, label: { fr: "Ne pas savoir vers qui se tourner", ar: "عدم معرفة الجهة المناسبة" } },
      { id: "barrier_teleconsultation", kind: "likert", anchors: LIKERT_ANCHORS, label: { fr: "La réticence à consulter à distance", ar: "التحفظ من الاستشارة عن بعد" } },
    ],
  },
  {
    id: "pricing",
    title: { fr: "Le prix d'une séance", ar: "ثمن الجلسة" },
    subtitle: {
      fr: "Pour une séance individuelle de 50 minutes, en dirhams.",
      ar: "لجلسة فردية مدتها 50 دقيقة، بالدرهم.",
    },
    questions: [
      { id: "vw_too_cheap", kind: "price", min: 0, max: 2000, label: { fr: "À partir de quel prix trouveriez-vous la séance trop bon marché pour être sérieuse ?", ar: "ابتداءً من أي ثمن تعتبر الجلسة رخيصة جدًا لدرجة تثير الشك؟" } },
      { id: "vw_bargain", kind: "price", min: 0, max: 2000, label: { fr: "À quel prix la trouveriez-vous une bonne affaire ?", ar: "عند أي ثمن تعتبرها صفقة جيدة؟" } },
      { id: "vw_expensive", kind: "price", min: 0, max: 2000, label: { fr: "À partir de quel prix la trouveriez-vous chère, mais encore envisageable ?", ar: "ابتداءً من أي ثمن تعتبرها غالية لكن ممكنة؟" } },
      { id: "vw_too_expensive", kind: "price", min: 0, max: 2000, label: { fr: "À partir de quel prix y renonceriez-vous ?", ar: "ابتداءً من أي ثمن تتخلى عنها؟" } },
      {
        id: "payment_model",
        kind: "choice",
        label: { fr: "Quel modèle vous conviendrait le mieux ?", ar: "أي نموذج يناسبك أكثر؟" },
        options: [
          { value: "per_session", label: { fr: "Paiement à la séance", ar: "الدفع لكل جلسة" } },
          { value: "pack", label: { fr: "Pack de séances prépayées", ar: "باقة جلسات مسبقة الدفع" } },
          { value: "subscription", label: { fr: "Abonnement mensuel", ar: "اشتراك شهري" } },
          { value: "employer", label: { fr: "Pris en charge par mon employeur", ar: "يتكفل به المشغل" } },
          { value: "insurance", label: { fr: "Remboursé par une mutuelle", ar: "تعويض من التأمين" } },
        ],
      },
    ],
  },
  {
    id: "intention",
    title: { fr: "Votre intention", ar: "نيتك" },
    questions: [
      {
        id: "intention",
        kind: "likert",
        anchors: [
          { fr: "Très improbable", ar: "مستبعد جدًا" },
          { fr: "Très probable", ar: "محتمل جدًا" },
        ],
        label: {
          fr: "Quelle est la probabilité que vous utilisiez une plateforme comme U.Psy ?",
          ar: "ما احتمال استخدامك لمنصة مثل U.Psy؟",
        },
      },
      {
        id: "nps",
        kind: "nps",
        label: {
          fr: "Recommanderiez-vous une telle plateforme à un proche ?",
          ar: "هل توصي بمنصة كهذه لشخص قريب؟",
        },
      },
      { id: "timeline", kind: "choice", label: { fr: "Si vous deviez commencer un suivi, ce serait…", ar: "إذا قررت بدء متابعة، فسيكون ذلك…" }, options: TIMELINE_OPTIONS },
      {
        id: "org_interest",
        kind: "boolean",
        label: {
          fr: "Pensez-vous que votre employeur ou votre école pourrait être intéressé ?",
          ar: "هل تعتقد أن مشغلك أو مؤسستك قد يهتم؟",
        },
      },
      { id: "org_name", kind: "text", optional: true, maxLength: 120, label: { fr: "Si oui, laquelle ? (facultatif)", ar: "إذا نعم، أي جهة؟ (اختياري)" } },
      { id: "open_feedback", kind: "text", optional: true, maxLength: 1000, label: { fr: "Quelque chose à ajouter ? (facultatif)", ar: "هل لديك ما تضيفه؟ (اختياري)" } },
    ],
  },
];

// ─── PSYCHOLOGIST TRACK ──────────────────────────────────────────────────────

export const PSYCHOLOGIST_SECTIONS: Section[] = [
  {
    id: "practice",
    title: { fr: "Votre pratique", ar: "ممارستك المهنية" },
    questions: [
      { id: "years_practice", kind: "number", min: 0, max: 50, label: { fr: "Années de pratique", ar: "سنوات الممارسة" } },
      {
        id: "practice_mode",
        kind: "choice",
        label: { fr: "Mode d'exercice principal", ar: "نمط الممارسة الأساسي" },
        options: [
          { value: "private", label: { fr: "Cabinet privé", ar: "عيادة خاصة" } },
          { value: "institution", label: { fr: "Institution / hôpital", ar: "مؤسسة / مستشفى" } },
          { value: "online", label: { fr: "Exclusivement en ligne", ar: "عن بعد حصريًا" } },
          { value: "mixed", label: { fr: "Mixte", ar: "مختلط" } },
          { value: "not_practicing", label: { fr: "Pas encore en exercice", ar: "لم أبدأ الممارسة بعد" } },
        ],
      },
      { id: "city", kind: "choice", label: { fr: "Ville d'exercice", ar: "مدينة الممارسة" }, options: CITIES },
    ],
  },
  {
    id: "attitudes",
    title: { fr: "Votre regard sur une plateforme", ar: "رأيك في منصة رقمية" },
    questions: [
      { id: "psy_need_visibility", kind: "likert", anchors: LIKERT_ANCHORS, label: { fr: "J'ai besoin de plus de visibilité pour remplir mon agenda", ar: "أحتاج إلى حضور أكبر لملء أجندتي" } },
      { id: "psy_admin_burden", kind: "likert", anchors: LIKERT_ANCHORS, label: { fr: "La gestion administrative me prend trop de temps", ar: "التدبير الإداري يستهلك وقتًا كبيرًا" } },
      { id: "psy_teleconsultation_ok", kind: "likert", anchors: LIKERT_ANCHORS, label: { fr: "Je suis à l'aise avec la téléconsultation", ar: "أشعر بالارتياح مع الاستشارة عن بعد" } },
      { id: "psy_platform_trust", kind: "likert", anchors: LIKERT_ANCHORS, label: { fr: "Je ferais confiance à une plateforme marocaine accréditée", ar: "سأثق في منصة مغربية معتمدة" } },
    ],
  },
  {
    id: "economics",
    title: { fr: "Conditions économiques", ar: "الشروط الاقتصادية" },
    questions: [
      {
        id: "commission_band",
        kind: "choice",
        label: { fr: "Quelle commission plateforme vous paraîtrait acceptable ?", ar: "ما نسبة العمولة التي تعتبرها مقبولة؟" },
        options: [
          { value: "0", label: { fr: "Aucune — abonnement fixe uniquement", ar: "لا شيء — اشتراك ثابت فقط" } },
          { value: "1_10", label: { fr: "1 à 10 %", ar: "1 إلى 10٪" } },
          { value: "11_20", label: { fr: "11 à 20 %", ar: "11 إلى 20٪" } },
          { value: "21_30", label: { fr: "21 à 30 %", ar: "21 إلى 30٪" } },
          { value: "over_30", label: { fr: "Plus de 30 %", ar: "أكثر من 30٪" } },
        ],
      },
      {
        id: "preferred_model",
        kind: "choice",
        label: { fr: "Modèle préféré", ar: "النموذج المفضل" },
        options: [
          { value: "commission", label: { fr: "Commission par séance", ar: "عمولة لكل جلسة" } },
          { value: "subscription", label: { fr: "Abonnement mensuel fixe", ar: "اشتراك شهري ثابت" } },
          { value: "hybrid", label: { fr: "Hybride", ar: "مختلط" } },
          { value: "free_visibility", label: { fr: "Visibilité gratuite, options payantes", ar: "حضور مجاني مع خيارات مؤدى عنها" } },
        ],
      },
      { id: "timeline", kind: "choice", label: { fr: "Quand seriez-vous prêt(e) à rejoindre ?", ar: "متى ستكون مستعدًا للانضمام؟" }, options: TIMELINE_OPTIONS },
      { id: "open_feedback", kind: "text", optional: true, maxLength: 1000, label: { fr: "Quelque chose à ajouter ? (facultatif)", ar: "هل لديك ما تضيفه؟ (اختياري)" } },
    ],
  },
];

export const sectionsFor = (track: Track): Section[] =>
  track === "patient" ? PATIENT_SECTIONS : PSYCHOLOGIST_SECTIONS;

export const questionCount = (track: Track): number =>
  sectionsFor(track).reduce((n, s) => n + s.questions.length, 0);

/** Questions that must be answered before a section can be validated. */
export const isOptional = (q: Question): boolean =>
  q.kind === "text" ? Boolean(q.optional) : false;