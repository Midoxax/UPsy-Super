// Questionnaires of the U.Psy athlete well-being study: items, scoring,
// schedule and safety thresholds. Answers are stored raw, in item order, so
// every score here can be recomputed from the export.
//
// Each instrument is given on a cadence that matches its validated recall
// window (WHO-5 asks about two weeks, PSS-10 and ABQ about a month), so the
// windows never overlap. Everything is due at enrolment (baseline).
//
// French and Arabic wordings: WHO-5 French is the official WHO version; the
// others are working translations to be replaced by validated versions
// (PSS-10 FR: Lesage et al. 2012; ABQ FR: Isoard-Gautheur et al. 2010;
// Arabic versions per instrument) before data are analysed by language.
import type { Locale } from "@/lib/i18n/utils";

/** Questionnaire languages; Amazigh readers get French until a validated version exists. */
export type StudyLang = "en" | "fr" | "ar";
export const studyLang = (l: Locale): StudyLang => (l === "ber" ? "fr" : l);
type L = Record<StudyLang, string>;

export type InstrumentId = "who5" | "pss10" | "abq" | "mti" | "sleep";

export type Likert = {
  id: Exclude<InstrumentId, "sleep">;
  kind: "likert";
  title: L;
  source: string;
  /** Shown above every item: the recall window and the stem. */
  stem: L;
  /** Answer labels; the value of option i is min + i. */
  options: L[];
  min: number;
  items: L[];
  everyDays: number;
};

export type SleepForm = {
  id: "sleep";
  kind: "sleep";
  title: L;
  source: string;
  stem: L;
  everyDays: number;
};

export type Instrument = Likert | SleepForm;

const WHO5: Likert = {
  id: "who5",
  kind: "likert",
  title: {
    en: "Well-being (WHO-5)",
    fr: "Bien-être (WHO-5)",
    ar: "الرفاهية (WHO-5)",
  },
  source: "WHO-5 Well-Being Index, WHO Regional Office for Europe (1998)",
  stem: {
    en: "Over the last two weeks…",
    fr: "Au cours des deux dernières semaines…",
    ar: "خلال الأسبوعين الماضيين…",
  },
  options: [
    { en: "At no time", fr: "Jamais", ar: "ولا مرة" },
    { en: "Some of the time", fr: "De temps en temps", ar: "بعض الوقت" },
    {
      en: "Less than half of the time",
      fr: "Moins de la moitié du temps",
      ar: "أقل من نصف الوقت",
    },
    {
      en: "More than half of the time",
      fr: "Plus de la moitié du temps",
      ar: "أكثر من نصف الوقت",
    },
    { en: "Most of the time", fr: "La plupart du temps", ar: "معظم الوقت" },
    { en: "All of the time", fr: "Tout le temps", ar: "طوال الوقت" },
  ],
  min: 0,
  items: [
    {
      en: "I have felt cheerful and in good spirits",
      fr: "Je me suis senti(e) bien et de bonne humeur",
      ar: "شعرت بالبهجة والمزاج الجيد",
    },
    {
      en: "I have felt calm and relaxed",
      fr: "Je me suis senti(e) calme et tranquille",
      ar: "شعرت بالهدوء والاسترخاء",
    },
    {
      en: "I have felt active and vigorous",
      fr: "Je me suis senti(e) plein(e) d'énergie et vigoureux(se)",
      ar: "شعرت بالنشاط والحيوية",
    },
    {
      en: "I woke up feeling fresh and rested",
      fr: "Je me suis réveillé(e) en me sentant frais(che) et dispos(e)",
      ar: "استيقظت وأنا أشعر بالانتعاش والراحة",
    },
    {
      en: "My daily life has been filled with things that interest me",
      fr: "Ma vie quotidienne a été remplie de choses intéressantes",
      ar: "كانت حياتي اليومية مليئة بأشياء تهمني",
    },
  ],
  everyDays: 14,
};

const PSS10: Likert = {
  id: "pss10",
  kind: "likert",
  title: {
    en: "Perceived stress (PSS-10)",
    fr: "Stress perçu (PSS-10)",
    ar: "الضغط المدرك (PSS-10)",
  },
  source: "Perceived Stress Scale, Cohen & Williamson (1988)",
  stem: {
    en: "In the last month, how often have you…",
    fr: "Au cours du dernier mois, combien de fois…",
    ar: "خلال الشهر الماضي، كم مرة…",
  },
  options: [
    { en: "Never", fr: "Jamais", ar: "أبداً" },
    { en: "Almost never", fr: "Presque jamais", ar: "نادراً جداً" },
    { en: "Sometimes", fr: "Parfois", ar: "أحياناً" },
    { en: "Fairly often", fr: "Assez souvent", ar: "غالباً" },
    { en: "Very often", fr: "Souvent", ar: "كثيراً جداً" },
  ],
  min: 0,
  items: [
    {
      en: "been upset because of something that happened unexpectedly?",
      fr: "avez-vous été dérangé(e) par un événement inattendu ?",
      ar: "انزعجت بسبب شيء حدث بشكل غير متوقع؟",
    },
    {
      en: "felt that you were unable to control the important things in your life?",
      fr: "vous a-t-il semblé difficile de contrôler les choses importantes de votre vie ?",
      ar: "شعرت أنك غير قادر على التحكم في الأمور المهمة في حياتك؟",
    },
    {
      en: "felt nervous and stressed?",
      fr: "vous êtes-vous senti(e) nerveux(se) et stressé(e) ?",
      ar: "شعرت بالعصبية والتوتر؟",
    },
    {
      en: "felt confident about your ability to handle your personal problems?",
      fr: "vous êtes-vous senti(e) confiant(e) dans votre capacité à prendre en main vos problèmes personnels ?",
      ar: "شعرت بالثقة في قدرتك على التعامل مع مشاكلك الشخصية؟",
    },
    {
      en: "felt that things were going your way?",
      fr: "avez-vous senti que les choses allaient comme vous le vouliez ?",
      ar: "شعرت أن الأمور تسير كما تريد؟",
    },
    {
      en: "found that you could not cope with all the things that you had to do?",
      fr: "avez-vous pensé que vous ne pouviez pas assumer toutes les choses que vous deviez faire ?",
      ar: "وجدت أنك لا تستطيع التعامل مع كل ما كان عليك القيام به؟",
    },
    {
      en: "been able to control irritations in your life?",
      fr: "avez-vous été capable de maîtriser votre énervement ?",
      ar: "تمكنت من التحكم في مصادر الانزعاج في حياتك؟",
    },
    {
      en: "felt that you were on top of things?",
      fr: "avez-vous senti que vous dominiez la situation ?",
      ar: "شعرت أنك متحكم في زمام الأمور؟",
    },
    {
      en: "been angered because of things that were outside of your control?",
      fr: "vous êtes-vous senti(e) irrité(e) parce que les événements échappaient à votre contrôle ?",
      ar: "غضبت بسبب أمور خارجة عن سيطرتك؟",
    },
    {
      en: "felt difficulties were piling up so high that you could not overcome them?",
      fr: "avez-vous trouvé que les difficultés s'accumulaient à tel point que vous ne pouviez les surmonter ?",
      ar: "شعرت أن الصعوبات تراكمت إلى حد لا تستطيع معه التغلب عليها؟",
    },
  ],
  everyDays: 28,
};

const ABQ: Likert = {
  id: "abq",
  kind: "likert",
  title: {
    en: "Athlete burnout (ABQ)",
    fr: "Épuisement de l'athlète (ABQ)",
    ar: "الاحتراق الرياضي (ABQ)",
  },
  source: "Athlete Burnout Questionnaire, Raedeke & Smith (2001)",
  stem: {
    en: "How often do you feel this way about your sport this season?",
    fr: "À quelle fréquence ressentez-vous cela à propos de votre sport cette saison ?",
    ar: "كم مرة تشعر بهذا تجاه رياضتك هذا الموسم؟",
  },
  options: [
    { en: "Almost never", fr: "Presque jamais", ar: "تقريباً أبداً" },
    { en: "Rarely", fr: "Rarement", ar: "نادراً" },
    { en: "Sometimes", fr: "Parfois", ar: "أحياناً" },
    { en: "Frequently", fr: "Fréquemment", ar: "كثيراً" },
    { en: "Almost always", fr: "Presque toujours", ar: "تقريباً دائماً" },
  ],
  min: 1,
  items: [
    {
      en: "I'm accomplishing many worthwhile things in my sport.",
      fr: "J'accomplis beaucoup de choses qui en valent la peine dans mon sport.",
      ar: "أنجز أشياء كثيرة ذات قيمة في رياضتي.",
    },
    {
      en: "I feel so tired from my training that I have trouble finding energy to do other things.",
      fr: "Je me sens si fatigué(e) par mes entraînements que j'ai du mal à trouver l'énergie pour faire autre chose.",
      ar: "أشعر بتعب شديد من التدريب لدرجة أنني أجد صعوبة في إيجاد طاقة لفعل أشياء أخرى.",
    },
    {
      en: "The effort I spend in my sport would be better spent doing other things.",
      fr: "L'effort que je consacre à mon sport serait mieux utilisé à faire autre chose.",
      ar: "الجهد الذي أبذله في رياضتي من الأفضل أن أبذله في أشياء أخرى.",
    },
    {
      en: "I feel overly tired from my sport participation.",
      fr: "Je me sens excessivement fatigué(e) par ma pratique sportive.",
      ar: "أشعر بتعب مفرط من ممارستي لرياضتي.",
    },
    {
      en: "I am not achieving much in my sport.",
      fr: "Je n'accomplis pas grand-chose dans mon sport.",
      ar: "لا أحقق الكثير في رياضتي.",
    },
    {
      en: "I don't care as much about my sport performance as I used to.",
      fr: "Ma performance sportive m'importe moins qu'avant.",
      ar: "لم أعد أهتم بأدائي الرياضي كما كنت من قبل.",
    },
    {
      en: "I am not performing up to my ability in my sport.",
      fr: "Je ne performe pas à la hauteur de mes capacités dans mon sport.",
      ar: "لا أؤدي في رياضتي بمستوى قدراتي.",
    },
    {
      en: 'I feel "wiped out" from my sport.',
      fr: "Je me sens « vidé(e) » par mon sport.",
      ar: "أشعر بأن رياضتي استنزفتني.",
    },
    {
      en: "I'm not into my sport like I used to be.",
      fr: "Je ne suis plus autant investi(e) dans mon sport qu'avant.",
      ar: "لم أعد متحمساً لرياضتي كما كنت من قبل.",
    },
    {
      en: "I feel physically worn out from my sport.",
      fr: "Je me sens physiquement épuisé(e) par mon sport.",
      ar: "أشعر بالإنهاك البدني بسبب رياضتي.",
    },
    {
      en: "I feel less concerned about being successful in my sport than I used to.",
      fr: "Réussir dans mon sport me préoccupe moins qu'avant.",
      ar: "أصبحت أقل اهتماماً بالنجاح في رياضتي مما كنت عليه.",
    },
    {
      en: "I am exhausted by the mental and physical demands of my sport.",
      fr: "Je suis épuisé(e) par les exigences mentales et physiques de mon sport.",
      ar: "أنا منهك من المتطلبات الذهنية والبدنية لرياضتي.",
    },
    {
      en: "It seems that no matter what I do, I don't perform as well as I should.",
      fr: "Quoi que je fasse, j'ai l'impression de ne pas performer aussi bien que je le devrais.",
      ar: "يبدو أنه مهما فعلت، لا أؤدي بالمستوى الذي يجب أن أكون عليه.",
    },
    {
      en: "I feel successful at my sport.",
      fr: "J'ai le sentiment de réussir dans mon sport.",
      ar: "أشعر بالنجاح في رياضتي.",
    },
    {
      en: "I have negative feelings toward my sport.",
      fr: "J'ai des sentiments négatifs envers mon sport.",
      ar: "لدي مشاعر سلبية تجاه رياضتي.",
    },
  ],
  everyDays: 28,
};

const MTI: Likert = {
  id: "mti",
  kind: "likert",
  title: {
    en: "Mental toughness (MTI)",
    fr: "Robustesse mentale (MTI)",
    ar: "الصلابة الذهنية (MTI)",
  },
  source: "Mental Toughness Index, Gucciardi et al. (2015)",
  stem: {
    en: "How true is each statement of you, usually?",
    fr: "Dans quelle mesure chaque affirmation est-elle vraie pour vous, habituellement ?",
    ar: "إلى أي حد تنطبق عليك كل عبارة عادةً؟",
  },
  options: [
    { en: "1 · Never true", fr: "1 · Jamais vrai", ar: "1 · لا تنطبق أبداً" },
    { en: "2", fr: "2", ar: "2" },
    { en: "3", fr: "3", ar: "3" },
    { en: "4", fr: "4", ar: "4" },
    { en: "5", fr: "5", ar: "5" },
    { en: "6", fr: "6", ar: "6" },
    { en: "7 · Always true", fr: "7 · Toujours vrai", ar: "7 · تنطبق دائماً" },
  ],
  min: 1,
  items: [
    {
      en: "I believe in my ability to achieve my goals",
      fr: "Je crois en ma capacité à atteindre mes objectifs",
      ar: "أؤمن بقدرتي على تحقيق أهدافي",
    },
    {
      en: "I am able to regulate my focus when performing tasks",
      fr: "Je suis capable de réguler ma concentration quand j'accomplis une tâche",
      ar: "أستطيع التحكم في تركيزي أثناء أداء المهام",
    },
    {
      en: "I am able to use my emotions to perform the way I want to",
      fr: "Je suis capable d'utiliser mes émotions pour performer comme je le souhaite",
      ar: "أستطيع توظيف مشاعري لأؤدي بالطريقة التي أريدها",
    },
    {
      en: "I strive for continued success",
      fr: "Je m'efforce de réussir de façon continue",
      ar: "أسعى إلى النجاح المستمر",
    },
    {
      en: "I execute my knowledge of what is required to achieve my goals",
      fr: "Je mets en œuvre ce que je sais nécessaire pour atteindre mes objectifs",
      ar: "أطبق ما أعرف أنه ضروري لتحقيق أهدافي",
    },
    {
      en: "I consistently overcome adversity",
      fr: "Je surmonte l'adversité de manière constante",
      ar: "أتغلب على الشدائد باستمرار",
    },
    {
      en: "I am able to execute appropriate skills or knowledge when challenged",
      fr: "Je sais mobiliser les compétences ou connaissances appropriées face à un défi",
      ar: "أستطيع تطبيق المهارات أو المعارف المناسبة عندما أواجه تحدياً",
    },
    {
      en: "I can find a positive in most situations",
      fr: "Je trouve du positif dans la plupart des situations",
      ar: "أستطيع إيجاد جانب إيجابي في معظم المواقف",
    },
  ],
  everyDays: 84,
};

const SLEEP: SleepForm = {
  id: "sleep",
  kind: "sleep",
  title: {
    en: "Sleep this week",
    fr: "Sommeil de la semaine",
    ar: "النوم هذا الأسبوع",
  },
  source:
    "Sleep Quality Scale, single item, Snyder et al. (2018); hours and nights with sleep difficulty",
  stem: {
    en: "During the past 7 days…",
    fr: "Au cours des 7 derniers jours…",
    ar: "خلال الأيام السبعة الماضية…",
  },
  everyDays: 7,
};

export const INSTRUMENTS: Instrument[] = [SLEEP, WHO5, PSS10, ABQ, MTI];
export const instrument = (id: InstrumentId) =>
  INSTRUMENTS.find((i) => i.id === id)!;

// Scoring ---------------------------------------------------------------------

export type Scored = { score: number; subscores: Record<string, number> };

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const mean = (xs: number[]) => sum(xs) / xs.length;
const round2 = (x: number) => Math.round(x * 100) / 100;
/** 1-based item numbers. */
const pick = (a: number[], ns: number[]) => ns.map((n) => a[n - 1]);

export function score(id: InstrumentId, a: number[]): Scored {
  switch (id) {
    case "who5":
      // Raw 0-25, reported as a percentage (0-100).
      return { score: sum(a) * 4, subscores: { raw: sum(a) } };
    case "pss10": {
      // Positively worded items 4, 5, 7, 8 are reversed (0-4).
      const r = a.map((x, i) => ([4, 5, 7, 8].includes(i + 1) ? 4 - x : x));
      return { score: sum(r), subscores: {} };
    }
    case "abq": {
      // Items 1 and 14 are reversed (1-5); subscales are item means.
      const r = a.map((x, i) => ([1, 14].includes(i + 1) ? 6 - x : x));
      return {
        score: round2(mean(r)),
        subscores: {
          exhaustion: round2(mean(pick(r, [2, 4, 8, 10, 12]))),
          reduced_accomplishment: round2(mean(pick(r, [1, 5, 7, 13, 14]))),
          devaluation: round2(mean(pick(r, [3, 6, 9, 11, 15]))),
        },
      };
    }
    case "mti":
      return { score: sum(a), subscores: {} };
    case "sleep":
      // [hours per night, quality 0-10, nights with difficulty 0-7]
      return {
        score: a[1],
        subscores: { hours: a[0], trouble_nights: a[2] },
      };
  }
}

// Schedule --------------------------------------------------------------------

const DAY = 86_400_000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const utcMidnight = (d: Date) =>
  Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/** First day of the window that `today` falls in, counting from enrolment. */
export function periodStart(
  consentedAt: string,
  everyDays: number,
  today = new Date(),
): string {
  const t0 = utcMidnight(new Date(consentedAt));
  const k = Math.max(
    0,
    Math.floor((utcMidnight(today) - t0) / DAY / everyDays),
  );
  return isoDay(new Date(t0 + k * everyDays * DAY));
}

export function nextPeriodStart(
  consentedAt: string,
  everyDays: number,
  today = new Date(),
): string {
  const current = new Date(periodStart(consentedAt, everyDays, today));
  return isoDay(new Date(current.getTime() + everyDays * DAY));
}

export type Answered = { instrument: InstrumentId; period_start: string };

/** Instruments with no answer for their current window. */
export function dueInstruments(
  consentedAt: string,
  answered: Answered[],
  today = new Date(),
): InstrumentId[] {
  return INSTRUMENTS.filter((ins) => {
    const p = periodStart(consentedAt, ins.everyDays, today);
    return !answered.some(
      (r) => r.instrument === ins.id && r.period_start === p,
    );
  }).map((i) => i.id);
}

// Safety ----------------------------------------------------------------------

/**
 * "urgent": WHO-5 at or below 28 (raw 7), the usual cut-off for likely
 * depression. "notice": WHO-5 at or below 50, PSS-10 at 27 or above, or ABQ
 * exhaustion at 4 or above. The participant sees support options; nobody on
 * the research team sees who it was.
 */
export function safetyFlag(
  id: InstrumentId,
  s: Scored,
): "urgent" | "notice" | null {
  if (id === "who5")
    return s.score <= 28 ? "urgent" : s.score <= 50 ? "notice" : null;
  if (id === "pss10") return s.score >= 27 ? "notice" : null;
  if (id === "abq") return (s.subscores.exhaustion ?? 0) >= 4 ? "notice" : null;
  return null;
}
