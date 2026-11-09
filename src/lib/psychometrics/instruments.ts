/**
 * Open-licence instruments with their official item text and scoring.
 *
 * Sources of the item text (verified, not retyped from memory):
 * - PHQ-9, GAD-7: Pfizer PHQ Screeners, "English for Canada / French for
 *   Canada", as reproduced by INSPQ (Québec), 2019 post-disaster toolkit.
 * - WHO-5: WHO Collaborating Centre in Mental Health (1998 EN, 1999 FR).
 * - DASS-21: Lovibond & Lovibond (1995), UNSW site; French: Martin (uOttawa).
 * - PCL-5: US Department of Veterans Affairs (2013); French: Ashbaugh et al.
 *   (2016), as reproduced by INSPQ.
 * - AUDIT: Saunders et al. (1993), WHO; French: Gache et al. (2005).
 * - K6: Kessler et al. (2003); French: Statistics Canada (ESCC 2013).
 *
 * Arabic: no verified official Arabic item text is bundled yet, so these
 * instruments show French (then English) to Arabic readers and say so. Band
 * labels below are interface text and are translated.
 */
import type { Answers, Band, Instrument, Option, Text } from "./types";

const t = (en: string, fr: string, ar?: string): Text =>
  ar ? { en, fr, ar } : { en, fr };

const opts = (labels: Text[], values?: number[]): Option[] =>
  labels.map((label, i) => ({ value: values ? values[i] : i, label }));

const ids = (prefix: string, n: number) =>
  Array.from({ length: n }, (_, i) => `${prefix}_${i + 1}`);

// ---------------------------------------------------------------- PHQ-9 ---

const PHQ9_ITEMS: [string, string][] = [
  [
    "Little interest or pleasure in doing things",
    "Peu d’intérêt ou de plaisir à faire des choses",
  ],
  [
    "Feeling down, depressed, or hopeless",
    "Se sentir triste, déprimé(e) ou désespéré(e)",
  ],
  [
    "Trouble falling or staying asleep, or sleeping too much",
    "Difficultés à s’endormir ou à rester endormi(e), ou trop dormir",
  ],
  [
    "Feeling tired or having little energy",
    "Se sentir fatigué(e) ou avoir peu d’énergie",
  ],
  ["Poor appetite or overeating", "Peu d’appétit ou trop manger"],
  [
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Mauvaise perception de vous-même — ou vous pensez que vous êtes un perdant ou que vous n’avez pas satisfait vos propres attentes ou celles de votre famille",
  ],
  [
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Difficultés à se concentrer sur des choses telles que lire le journal ou regarder la télévision",
  ],
  [
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Vous bougez ou parlez si lentement que les autres personnes ont pu le remarquer. Ou au contraire — vous êtes si agité(e) que vous bougez beaucoup plus que d’habitude",
  ],
  [
    "Thoughts that you would be better off dead or of hurting yourself in some way",
    "Vous avez pensé que vous seriez mieux mort(e) ou pensé à vous blesser d’une façon ou d’une autre",
  ],
];

const SEVERITY = {
  minimal: t("Minimal", "Minimal", "طفيف جداً"),
  mild: t("Mild", "Léger", "خفيف"),
  moderate: t("Moderate", "Modéré", "متوسط"),
  modSevere: t("Moderately severe", "Modérément sévère", "متوسط إلى شديد"),
  severe: t("Severe", "Sévère", "شديد"),
  extSevere: t("Extremely severe", "Extrêmement sévère", "شديد جداً"),
  normal: t("Normal range", "Zone normale", "ضمن المعدل الطبيعي"),
};

const PHQ9: Instrument = {
  code: "phq9",
  name: t(
    "Patient Health Questionnaire (PHQ-9)",
    "Questionnaire sur la santé du patient (PHQ-9)",
    "استبيان صحة المريض (PHQ-9)",
  ),
  shortName: "PHQ-9",
  summary: t(
    "Screens for depressive symptoms over the last two weeks.",
    "Repère les symptômes dépressifs des deux dernières semaines.",
    "يرصد أعراض الاكتئاب خلال الأسبوعين الأخيرين.",
  ),
  category: "general",
  languages: ["en", "fr"],
  instructions: t(
    "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
    "Au cours des deux dernières semaines, à quelle fréquence avez-vous été dérangé(e) par les problèmes suivants?",
  ),
  options: opts([
    t("Not at all", "Jamais"),
    t("Several days", "Plusieurs jours"),
    t("More than half the days", "Plus de sept jours"),
    t("Nearly every day", "Presque tous les jours"),
  ]),
  items: PHQ9_ITEMS.map(([en, fr], i) => ({
    id: `phq9_${i + 1}`,
    text: t(en, fr),
  })),
  total: {
    label: t("Depressive symptoms", "Symptômes dépressifs", "أعراض الاكتئاب"),
    bands: [
      { min: 0, max: 4, label: SEVERITY.minimal, level: "low" },
      { min: 5, max: 9, label: SEVERITY.mild, level: "moderate" },
      { min: 10, max: 14, label: SEVERITY.moderate, level: "high" },
      { min: 15, max: 19, label: SEVERITY.modSevere, level: "high" },
      { min: 20, max: 27, label: SEVERITY.severe, level: "high" },
    ],
  },
  // Item 9 is a safety item: any answer above "Not at all" needs follow-up
  // whatever the total (Kroenke & Spitzer, PHQ instruction manual).
  flags: (a) =>
    (a.phq9_9 ?? 0) > 0
      ? [
          {
            id: "phq9_item9",
            severity: "crisis",
            message: t(
              "You mentioned thoughts of death or of hurting yourself. Please talk to someone today: a professional, a trusted person, or an emergency line.",
              "Vous avez mentionné des pensées de mort ou de vous faire du mal. Parlez-en aujourd’hui à quelqu’un : un professionnel, une personne de confiance ou une ligne d’urgence.",
              "ذكرتَ أفكاراً عن الموت أو إيذاء نفسك. تحدّث اليوم إلى أحد: مختص أو شخص تثق به أو خط طوارئ.",
            ),
          },
        ]
      : [],
  minutes: 3,
  source:
    "Kroenke K, Spitzer RL, Williams JB. The PHQ-9. J Gen Intern Med 2001;16:606–613. Official text: Pfizer PHQ Screeners (English for Canada / French for Canada), reproduced by INSPQ 2019.",
  license:
    "No permission required to reproduce, translate, display or distribute (Pfizer).",
};

// ---------------------------------------------------------------- GAD-7 ---

const GAD7_ITEMS: [string, string][] = [
  [
    "Feeling nervous, anxious or on edge",
    "Sentiment de nervosité, d’anxiété ou de tension",
  ],
  [
    "Not being able to stop or control worrying",
    "Incapable d’arrêter de vous inquiéter ou de contrôler vos inquiétudes",
  ],
  [
    "Worrying too much about different things",
    "Inquiétudes excessives à propos de tout et de rien",
  ],
  ["Trouble relaxing", "Difficulté à se détendre"],
  [
    "Being so restless that it is hard to sit still",
    "Agitation telle qu’il est difficile de rester tranquille",
  ],
  [
    "Becoming easily annoyed or irritable",
    "Devenir facilement contrarié(e) ou irritable",
  ],
  [
    "Feeling afraid as if something awful might happen",
    "Avoir peur que quelque chose d’épouvantable puisse arriver",
  ],
];

const GAD7: Instrument = {
  code: "gad7",
  name: t(
    "Generalized Anxiety Disorder scale (GAD-7)",
    "Échelle du trouble d’anxiété généralisée (GAD-7)",
    "مقياس اضطراب القلق العام (GAD-7)",
  ),
  shortName: "GAD-7",
  summary: t(
    "Screens for anxiety symptoms over the last two weeks.",
    "Repère les symptômes anxieux des deux dernières semaines.",
    "يرصد أعراض القلق خلال الأسبوعين الأخيرين.",
  ),
  category: "general",
  languages: ["en", "fr"],
  instructions: t(
    "Over the last 2 weeks, how often have you been bothered by the following problems?",
    "Au cours des 14 derniers jours, à quelle fréquence avez-vous été dérangé(e) par les problèmes suivants?",
  ),
  options: opts([
    t("Not at all", "Jamais"),
    t("Several days", "Plusieurs jours"),
    t("More than half the days", "Plus de la moitié des jours"),
    t("Nearly every day", "Presque tous les jours"),
  ]),
  items: GAD7_ITEMS.map(([en, fr], i) => ({
    id: `gad7_${i + 1}`,
    text: t(en, fr),
  })),
  total: {
    label: t("Anxiety symptoms", "Symptômes anxieux", "أعراض القلق"),
    bands: [
      { min: 0, max: 4, label: SEVERITY.minimal, level: "low" },
      { min: 5, max: 9, label: SEVERITY.mild, level: "moderate" },
      { min: 10, max: 14, label: SEVERITY.moderate, level: "high" },
      { min: 15, max: 21, label: SEVERITY.severe, level: "high" },
    ],
  },
  minutes: 2,
  source:
    "Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med 2006;166:1092–1097. Official text: Pfizer PHQ Screeners, reproduced by INSPQ 2019.",
  license:
    "No permission required to reproduce, translate, display or distribute (Pfizer).",
};

// ---------------------------------------------------------------- WHO-5 ---

const WHO5: Instrument = {
  code: "who5",
  name: t(
    "WHO-5 Well-Being Index",
    "Indice de bien-être de l’OMS (WHO-5)",
    "مؤشر الرفاه لمنظمة الصحة العالمية (WHO-5)",
  ),
  shortName: "WHO-5",
  summary: t(
    "Measures your well-being over the last two weeks, from 0 to 100.",
    "Mesure votre bien-être des deux dernières semaines, de 0 à 100.",
    "يقيس رفاهك خلال الأسبوعين الأخيرين من 0 إلى 100.",
  ),
  category: "general",
  languages: ["en", "fr"],
  instructions: t(
    "Please indicate for each of the five statements which is closest to how you have been feeling over the last two weeks. Notice that higher numbers mean better well-being.",
    "Veuillez indiquer, pour chacune des cinq affirmations, laquelle se rapproche le plus de ce que vous avez ressenti au cours des deux dernières semaines. Notez que le chiffre est proportionnel au bien-être.",
  ),
  options: opts(
    [
      t("All of the time", "Tout le temps"),
      t("Most of the time", "La plupart du temps"),
      t("More than half of the time", "Plus de la moitié du temps"),
      t("Less than half of the time", "Moins de la moitié du temps"),
      t("Some of the time", "De temps en temps"),
      t("At no time", "Jamais"),
    ],
    [5, 4, 3, 2, 1, 0],
  ),
  items: (
    [
      [
        "I have felt cheerful and in good spirits",
        "Je me suis senti(e) bien et de bonne humeur",
      ],
      [
        "I have felt calm and relaxed",
        "Je me suis senti(e) calme et tranquille",
      ],
      [
        "I have felt active and vigorous",
        "Je me suis senti(e) plein(e) d’énergie et vigoureux(se)",
      ],
      [
        "I woke up feeling fresh and rested",
        "Je me suis réveillé(e) en me sentant frais(che) et dispos(e)",
      ],
      [
        "My daily life has been filled with things that interest me",
        "Ma vie quotidienne a été remplie de choses intéressantes",
      ],
    ] as [string, string][]
  ).map(([en, fr], i) => ({ id: `who5_${i + 1}`, text: t(en, fr) })),
  total: {
    label: t("Well-being (0–100)", "Bien-être (0–100)", "الرفاه (0–100)"),
    // Raw 0–25 is multiplied by 4 to give a percentage (Topp et al. 2015).
    multiplier: 4,
    bands: [
      {
        min: 0,
        max: 28,
        label: t(
          "Very low well-being — a depression assessment is advised",
          "Bien-être très bas — une évaluation de la dépression est conseillée",
          "رفاه منخفض جداً — يُنصح بتقييم الاكتئاب",
        ),
        level: "high",
      },
      {
        min: 29,
        max: 50,
        label: t(
          "Low well-being — worth discussing with a professional",
          "Bien-être bas — à discuter avec un professionnel",
          "رفاه منخفض — يستحق الحديث مع مختص",
        ),
        level: "moderate",
      },
      {
        min: 51,
        max: 100,
        label: t("Good well-being", "Bon bien-être", "رفاه جيد"),
        level: "low",
      },
    ],
  },
  minutes: 1,
  source:
    "WHO Collaborating Centre in Mental Health, Frederiksborg (1998 EN; 1999 FR). Topp CW et al. The WHO-5 Well-Being Index: a systematic review. Psychother Psychosom 2015;84:167–176. Text reproduced by INSPQ 2019.",
  license: "Free to use; no permission required (WHO Collaborating Centre).",
};

// -------------------------------------------------------------- DASS-21 ---

const DASS_ITEMS: [string, string][] = [
  ["I found it hard to wind down", "J’ai trouvé difficile de décompresser."],
  [
    "I was aware of dryness of my mouth",
    "J’ai été conscient(e) d’avoir la bouche sèche.",
  ],
  [
    "I couldn't seem to experience any positive feeling at all",
    "J’ai eu l’impression de ne pas pouvoir ressentir d’émotion positive.",
  ],
  [
    "I experienced breathing difficulty (eg, excessively rapid breathing, breathlessness in the absence of physical exertion)",
    "J’ai eu de la difficulté à respirer (par exemple, respirations excessivement rapides, essoufflement sans effort physique).",
  ],
  [
    "I found it difficult to work up the initiative to do things",
    "J’ai eu de la difficulté à initier de nouvelles activités.",
  ],
  [
    "I tended to over-react to situations",
    "J’ai eu tendance à réagir de façon exagérée.",
  ],
  [
    "I experienced trembling (eg, in the hands)",
    "J’ai eu des tremblements (par exemple, des mains).",
  ],
  [
    "I felt that I was using a lot of nervous energy",
    "J’ai eu l’impression de dépenser beaucoup d’énergie nerveuse.",
  ],
  [
    "I was worried about situations in which I might panic and make a fool of myself",
    "Je me suis inquiété(e) en pensant à des situations où je pourrais paniquer et faire de moi un(e) idiot(e).",
  ],
  [
    "I felt that I had nothing to look forward to",
    "J’ai eu le sentiment de ne rien envisager avec plaisir.",
  ],
  [
    "I found myself getting agitated",
    "Je me suis aperçu(e) que je devenais agité(e).",
  ],
  ["I found it difficult to relax", "J’ai eu de la difficulté à me détendre."],
  ["I felt down-hearted and blue", "Je me suis senti(e) abattu(e) et triste."],
  [
    "I was intolerant of anything that kept me from getting on with what I was doing",
    "J’ai été intolérant(e) à tout ce qui m’empêchait de faire ce que j’avais à faire.",
  ],
  [
    "I felt I was close to panic",
    "J’ai eu le sentiment d’être presque pris(e) de panique.",
  ],
  [
    "I was unable to become enthusiastic about anything",
    "J’ai été incapable de me sentir enthousiaste au sujet de quoi que ce soit.",
  ],
  [
    "I felt I wasn't worth much as a person",
    "J’ai eu le sentiment de ne pas valoir grand chose comme personne.",
  ],
  [
    "I felt that I was rather touchy",
    "J’ai eu l’impression d’être assez susceptible.",
  ],
  [
    "I was aware of the action of my heart in the absence of physical exertion (eg, sense of heart rate increase, heart missing a beat)",
    "J’ai été conscient(e) des palpitations de mon coeur en l’absence d’effort physique (sensation d’augmentation de mon rythme cardiaque ou l’impression que mon cœur venait de sauter).",
  ],
  ["I felt scared without any good reason", "J’ai eu peur sans bonne raison."],
  [
    "I felt that life was meaningless",
    "J’ai eu l’impression que la vie n’avait pas de sens.",
  ],
];

const dassBands = (cuts: [number, number, number, number]): Band[] => {
  const [mild, moderate, severe, extreme] = cuts;
  return [
    { min: 0, max: mild - 1, label: SEVERITY.normal, level: "low" },
    { min: mild, max: moderate - 1, label: SEVERITY.mild, level: "moderate" },
    { min: moderate, max: severe - 1, label: SEVERITY.moderate, level: "high" },
    { min: severe, max: extreme - 1, label: SEVERITY.severe, level: "high" },
    { min: extreme, max: 42, label: SEVERITY.extSevere, level: "high" },
  ];
};
const dass = (...n: number[]) => n.map((i) => `dass21_${i}`);

const DASS21: Instrument = {
  code: "dass21",
  name: t(
    "Depression Anxiety Stress Scales (DASS-21)",
    "Échelle de dépression, anxiété et stress (EDAS-21 / DASS-21)",
    "مقاييس الاكتئاب والقلق والضغط (DASS-21)",
  ),
  shortName: "DASS-21",
  summary: t(
    "Separates depression, anxiety and stress over the past week.",
    "Distingue dépression, anxiété et stress sur la dernière semaine.",
    "يميّز بين الاكتئاب والقلق والضغط خلال الأسبوع الماضي.",
  ),
  category: "general",
  languages: ["en", "fr"],
  instructions: t(
    "Please read each statement and choose a number 0, 1, 2 or 3 which indicates how much the statement applied to you over the past week. There are no right or wrong answers. Do not spend too much time on any statement.",
    "Veuillez lire chaque énoncé et indiquez lequel correspond le mieux à votre expérience au cours de la dernière semaine. Il n’y a pas de bonne ou de mauvaise réponse. Ne vous attardez pas trop longuement aux énoncés.",
  ),
  options: opts([
    t("Did not apply to me at all", "Ne s’applique pas du tout à moi"),
    t(
      "Applied to me to some degree, or some of the time",
      "S’applique un peu à moi, ou une partie du temps",
    ),
    t(
      "Applied to me to a considerable degree, or a good part of time",
      "S’applique beaucoup à moi, ou une bonne partie du temps",
    ),
    t(
      "Applied to me very much, or most of the time",
      "S’applique entièrement à moi, ou la grande majorité du temps",
    ),
  ]),
  items: DASS_ITEMS.map(([en, fr], i) => ({
    id: `dass21_${i + 1}`,
    text: t(en, fr),
  })),
  // Subscale sums are doubled to compare with DASS-42 norms (DASS manual).
  subscales: [
    {
      id: "depression",
      label: t("Depression", "Dépression", "الاكتئاب"),
      items: dass(3, 5, 10, 13, 16, 17, 21),
      multiplier: 2,
      bands: dassBands([10, 14, 21, 28]),
    },
    {
      id: "anxiety",
      label: t("Anxiety", "Anxiété", "القلق"),
      items: dass(2, 4, 7, 9, 15, 19, 20),
      multiplier: 2,
      bands: dassBands([8, 10, 15, 20]),
    },
    {
      id: "stress",
      label: t("Stress", "Stress", "الضغط"),
      items: dass(1, 6, 8, 11, 12, 14, 18),
      multiplier: 2,
      bands: dassBands([15, 19, 26, 34]),
    },
  ],
  minutes: 5,
  source:
    "Lovibond SH, Lovibond PF. Manual for the Depression Anxiety Stress Scales (2nd ed.). Sydney: Psychology Foundation, 1995. Official text: www2.psy.unsw.edu.au/dass (French: M. D. Martin, University of Ottawa).",
  license:
    "Public domain; may be used without permission (Psychology Foundation of Australia).",
};

// ---------------------------------------------------------------- PCL-5 ---

const PCL5_ITEMS: [string, string][] = [
  [
    "Repeated, disturbing, and unwanted memories of the stressful experience?",
    "Des souvenirs répétés, pénibles et involontaires de l’expérience stressante.",
  ],
  [
    "Repeated, disturbing dreams of the stressful experience?",
    "Des rêves répétés et pénibles de l’expérience stressante",
  ],
  [
    "Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)?",
    "Se sentir soudainement comme si l’expérience stressante recommençait (comme si vous la vivez de nouveau) ?",
  ],
  [
    "Feeling very upset when something reminded you of the stressful experience?",
    "Être bouleversé lorsque quelque chose vous rappelle de l’expérience ?",
  ],
  [
    "Having strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)?",
    "Réagir physiquement lorsque quelque chose vous rappelle l’expérience stressante (p. ex. avoir le cœur qui bat très fort, du mal a respirer, ou avoir des sueurs) ?",
  ],
  [
    "Avoiding memories, thoughts, or feelings related to the stressful experience?",
    "Éviter souvenirs, pensées, ou sentiments en lien avec l’expérience stressante ?",
  ],
  [
    "Avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)?",
    "Éviter les personnes et les choses qui vous rappellent l’expérience stressante (p. ex. des gens, de lieux, de conversations, des activités, des objets, ou des situations) ?",
  ],
  [
    "Trouble remembering important parts of the stressful experience?",
    "Avoir du mal à vous rappeler d’éléments importants de l’expérience stressante ?",
  ],
  [
    "Having strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)?",
    "Avoir des croyances négatives sur vous-même, les autres ou sur le monde (p. ex avoir des pensées telles que je suis mauvais, il y a quelque chose qui cloche sérieusement chez moi, nul n’est digne de confiance, le monde est un endroit complètement dangereux) ?",
  ],
  [
    "Blaming yourself or someone else for the stressful experience or what happened after it?",
    "Vous blâmer ou blâmer les autres pour la survenue de l’expérience stressante ou ce qui est arrivé par la suite ?",
  ],
  [
    "Having strong negative feelings such as fear, horror, anger, guilt, or shame?",
    "Avoir des sentiments négatifs intenses tels que peur, horreur, colère, culpabilité, ou honte ?",
  ],
  [
    "Loss of interest in activities that you used to enjoy?",
    "Perdre de l’intérêt pour les activités que vous aimiez auparavant ?",
  ],
  [
    "Feeling distant or cut off from other people?",
    "Vous sentir distant ou coupé des autres ?",
  ],
  [
    "Trouble experiencing positive feelings (for example, being unable to feel happiness or have loving feelings for people close to you)?",
    "Avoir du mal à éprouver des sentiments positifs (p. ex. être incapable de ressentir la joie ou de l’amour envers vos proches) ?",
  ],
  [
    "Irritable behavior, angry outbursts, or acting aggressively?",
    "Etre irritable, avoir des bouffées de colère, ou agir agressivement ?",
  ],
  [
    "Taking too many risks or doing things that could cause you harm?",
    "Prendre des risques inconsidérés ou encore avoir des conduites qui pourraient vous mettre en danger ?",
  ],
  [
    "Being “superalert” or watchful or on guard?",
    "Être « super-alerte », vigilant, ou sur vos gardes ?",
  ],
  ["Feeling jumpy or easily startled?", "Sursauter facilement ?"],
  ["Having difficulty concentrating?", "Avoir du mal à vous concentrer ?"],
  [
    "Trouble falling or staying asleep?",
    "Avoir du mal à trouver ou garder le sommeil ?",
  ],
];
const pcl = (a: number, b: number) =>
  Array.from({ length: b - a + 1 }, (_, i) => `pcl5_${a + i}`);

const PCL5: Instrument = {
  code: "pcl5",
  name: t(
    "PTSD Checklist for DSM-5 (PCL-5)",
    "Liste de vérification du TSPT pour le DSM-5 (PCL-5)",
    "قائمة اضطراب ما بعد الصدمة وفق DSM-5 (PCL-5)",
  ),
  shortName: "PCL-5",
  summary: t(
    "Screens for post-traumatic stress after a very stressful event.",
    "Repère le stress post-traumatique après un événement très stressant.",
    "يرصد الضغط ما بعد الصدمة بعد حدث شديد الوطأة.",
  ),
  category: "general",
  languages: ["en", "fr"],
  instructions: t(
    "Below is a list of problems that people sometimes have in response to a very stressful experience. Please read each problem carefully and then indicate how much you have been bothered by that problem in the past month.",
    "Voici une liste de problèmes que les gens éprouvent parfois suite à une expérience vraiment stressante. Veuillez lire chaque énoncé attentivement et indiquer dans quelle mesure ce problème vous a affecté au cours du dernier mois.",
  ),
  options: opts([
    t("Not at all", "Pas du tout"),
    t("A little bit", "Un peu"),
    t("Moderately", "Moyennement"),
    t("Quite a bit", "Souvent"),
    t("Extremely", "Extrêmement"),
  ]),
  items: PCL5_ITEMS.map(([en, fr], i) => ({
    id: `pcl5_${i + 1}`,
    text: t(en, fr),
  })),
  total: {
    label: t(
      "Post-traumatic stress symptoms",
      "Symptômes de stress post-traumatique",
      "أعراض الضغط ما بعد الصدمة",
    ),
    bands: [
      {
        min: 0,
        max: 30,
        label: t(
          "Below the screening threshold",
          "Sous le seuil de dépistage",
          "دون عتبة الكشف",
        ),
        level: "low",
      },
      {
        min: 31,
        max: 80,
        label: t(
          "Probable PTSD — a clinical interview is advised",
          "TSPT probable — un entretien clinique est conseillé",
          "اضطراب ما بعد الصدمة محتمل — يُنصح بمقابلة سريرية",
        ),
        level: "high",
      },
    ],
  },
  // DSM-5 clusters (Weathers et al. 2013). Reported, not banded.
  subscales: [
    {
      id: "intrusion",
      label: t("Intrusions (B)", "Intrusions (B)", "الاقتحام (B)"),
      items: pcl(1, 5),
    },
    {
      id: "avoidance",
      label: t("Avoidance (C)", "Évitement (C)", "التجنب (C)"),
      items: pcl(6, 7),
    },
    {
      id: "cognition_mood",
      label: t(
        "Negative cognitions and mood (D)",
        "Altérations négatives des cognitions et de l’humeur (D)",
        "تغيرات سلبية في المعارف والمزاج (D)",
      ),
      items: pcl(8, 14),
    },
    {
      id: "arousal",
      label: t(
        "Arousal and reactivity (E)",
        "Hyperactivation et réactivité (E)",
        "فرط الاستثارة والتفاعل (E)",
      ),
      items: pcl(15, 20),
    },
  ],
  minutes: 7,
  source:
    "Weathers FW et al. The PTSD Checklist for DSM-5 (PCL-5). National Center for PTSD, 2013. Cut-off 31–33 (Bovin et al. 2016; VA guidance); 31 used here as the screening threshold. French: Ashbaugh AR et al. PLoS One 2016;11:e0161645, reproduced by INSPQ.",
  license: "Public domain (US Department of Veterans Affairs).",
};

// ---------------------------------------------------------------- AUDIT ---

const FREQ5 = (fr: string[]): Option[] =>
  opts([
    t("Never", fr[0]),
    t("Less than monthly", fr[1]),
    t("Monthly", fr[2]),
    t("Weekly", fr[3]),
    t("Daily or almost daily", fr[4]),
  ]);
const FREQ5_FR = [
  "Jamais",
  "Moins d’une fois par mois",
  "Une fois par mois",
  "Une fois par semaine",
  "Chaque jour ou presque",
];
const YES_NO_LIFETIME = opts(
  [
    t("No", "Non"),
    t(
      "Yes, but not in the last year",
      "Oui, mais pas dans les douze derniers mois",
    ),
    t("Yes, during the last year", "Oui, au cours des douze derniers mois"),
  ],
  [0, 2, 4],
);

const AUDIT: Instrument = {
  code: "audit",
  name: t(
    "Alcohol Use Disorders Identification Test (AUDIT)",
    "Test d’identification des troubles liés à la consommation d’alcool (AUDIT)",
    "اختبار تحديد اضطرابات تعاطي الكحول (AUDIT)",
  ),
  shortName: "AUDIT",
  summary: t(
    "The WHO test of alcohol use risk.",
    "Le test de l’OMS sur les risques liés à l’alcool.",
    "اختبار منظمة الصحة العالمية لمخاطر الكحول.",
  ),
  category: "general",
  languages: ["en", "fr"],
  instructions: t(
    "Please choose the answer that is correct for you. If you never drink alcohol, the questions about your drinking are skipped.",
    "Ce questionnaire permet d’évaluer par vous-même votre consommation d’alcool. Cochez une réponse par question. Si vous ne prenez jamais d’alcool, les questions sur votre consommation sont passées.",
  ),
  options: FREQ5(FREQ5_FR),
  items: [
    {
      id: "audit_1",
      text: t(
        "How often do you have a drink containing alcohol?",
        "À quelle fréquence vous arrive-t-il de consommer des boissons contenant de l’alcool?",
      ),
      options: opts([
        t("Never", "Jamais"),
        t("Monthly or less", "1 fois par mois ou moins"),
        t("Two to four times a month", "2 à 4 fois par mois"),
        t("Two to three times a week", "2 à 3 fois par semaine"),
        t("Four or more times a week", "4 fois ou plus par semaine"),
      ]),
    },
    {
      id: "audit_2",
      text: t(
        "How many drinks containing alcohol do you have on a typical day when you are drinking?",
        "Combien de verres standards buvez-vous au cours d’une journée ordinaire où vous buvez de l’alcool?",
      ),
      options: opts([
        t("1 or 2", "Un ou deux"),
        t("3 or 4", "Trois ou quatre"),
        t("5 or 6", "Cinq ou six"),
        t("7 to 9", "Sept à neuf"),
        t("10 or more", "Dix ou plus"),
      ]),
    },
    {
      id: "audit_3",
      text: t(
        "How often do you have six or more drinks on one occasion?",
        "Au cours d’une même occasion, à quelle fréquence vous arrive-t-il de boire six verres standards ou plus?",
      ),
    },
    {
      id: "audit_4",
      text: t(
        "How often during the last year have you found that you were not able to stop drinking once you had started?",
        "Dans les douze derniers mois, à quelle fréquence avez-vous observé que vous n’étiez plus capable de vous arrêter de boire après avoir commencé?",
      ),
    },
    {
      id: "audit_5",
      text: t(
        "How often during the last year have you failed to do what was normally expected from you because of drinking?",
        "Dans les douze derniers mois, à quelle fréquence le fait d’avoir bu de l’alcool vous a-t-il empêché de faire ce qu’on attendait normalement de vous?",
      ),
    },
    {
      id: "audit_6",
      text: t(
        "How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?",
        "Dans les douze derniers mois, à quelle fréquence, après une période de forte consommation, avez-vous dû boire de l’alcool dès le matin pour vous remettre en forme?",
      ),
    },
    {
      id: "audit_7",
      text: t(
        "How often during the last year have you had a feeling of guilt or remorse after drinking?",
        "Dans les douze derniers mois, à quelle fréquence avez-vous eu un sentiment de culpabilité ou de regret après avoir bu?",
      ),
    },
    {
      id: "audit_8",
      text: t(
        "How often during the last year have you been unable to remember what happened the night before because you had been drinking?",
        "Dans les douze derniers mois, à quelle fréquence avez-vous été incapable de vous souvenir de ce qui s’était passé la nuit précédente parce que vous aviez bu?",
      ),
    },
    {
      id: "audit_9",
      text: t(
        "Have you or someone else been injured as a result of your drinking?",
        "Vous êtes-vous blessé ou avez-vous blessé quelqu’un parce que vous aviez bu?",
      ),
      options: YES_NO_LIFETIME,
    },
    {
      id: "audit_10",
      text: t(
        "Has a relative or friend, or a doctor or other health worker been concerned about your drinking or suggested you cut down?",
        "Est-ce qu’un proche, un ami, un médecin ou un autre professionnel de santé s’est déjà préoccupé de votre consommation d’alcool et vous a conseillé de la diminuer?",
      ),
      options: YES_NO_LIFETIME,
    },
  ],
  // WHO manual: "Never" to Q1 skips Q2–8; Q2 + Q3 = 0 skips Q4–8.
  // Q9 and Q10 are always asked (they cover lifetime and past drinking).
  skip: (a: Answers) => {
    if (a.audit_1 === 0) return ids("audit", 8).slice(1);
    if (a.audit_2 === 0 && a.audit_3 === 0) return ids("audit", 8).slice(3);
    return [];
  },
  total: {
    label: t("Alcohol use risk", "Risque lié à l’alcool", "مخاطر تعاطي الكحول"),
    bands: [
      {
        min: 0,
        max: 7,
        label: t(
          "Zone I — low risk",
          "Zone I — risque faible",
          "المنطقة I — خطر منخفض",
        ),
        level: "low",
      },
      {
        min: 8,
        max: 15,
        label: t(
          "Zone II — hazardous use",
          "Zone II — consommation à risque",
          "المنطقة II — استهلاك خطِر",
        ),
        level: "moderate",
      },
      {
        min: 16,
        max: 19,
        label: t(
          "Zone III — harmful use",
          "Zone III — consommation nocive",
          "المنطقة III — استهلاك ضار",
        ),
        level: "high",
      },
      {
        min: 20,
        max: 40,
        label: t(
          "Zone IV — possible dependence, specialist assessment advised",
          "Zone IV — dépendance possible, évaluation spécialisée conseillée",
          "المنطقة IV — احتمال إدمان، يُنصح بتقييم متخصص",
        ),
        level: "high",
      },
    ],
  },
  minutes: 3,
  source:
    "Babor TF, Higgins-Biddle JC, Saunders JB, Monteiro MG. AUDIT: Guidelines for Use in Primary Care (2nd ed.). WHO, 2001. Saunders JB et al. Addiction 1993;88:791–804. French: Gache P et al. Alcohol Clin Exp Res 2005;29:2001–2007, reproduced by INSPQ.",
  license: "Free to use (World Health Organization).",
};

// ------------------------------------------------------------------- K6 ---

const K6: Instrument = {
  code: "k6",
  name: t(
    "Kessler Psychological Distress Scale (K6)",
    "Échelle de détresse psychologique de Kessler (K6)",
    "مقياس كيسلر للضيق النفسي (K6)",
  ),
  shortName: "K6",
  summary: t(
    "Six questions on psychological distress over the past month.",
    "Six questions sur la détresse psychologique du dernier mois.",
    "ستة أسئلة عن الضيق النفسي خلال الشهر الماضي.",
  ),
  category: "general",
  languages: ["en", "fr"],
  instructions: t(
    "During the past month, about how often did you feel:",
    "Au cours du dernier mois, à quelle fréquence vous êtes-vous senti :",
  ),
  options: opts(
    [
      t("All of the time", "Tout le temps"),
      t("Most of the time", "La plupart du temps"),
      t("Some of the time", "Parfois"),
      t("A little of the time", "Rarement"),
      t("None of the time", "Jamais"),
    ],
    [4, 3, 2, 1, 0],
  ),
  items: (
    [
      ["nervous?", "nerveux?"],
      ["hopeless?", "désespéré?"],
      ["restless or fidgety?", "agité ou ne tenant pas en place?"],
      [
        "so depressed that nothing could cheer you up?",
        "si déprimé que plus rien ne pouvait vous faire sourire?",
      ],
      ["that everything was an effort?", "que tout était un effort?"],
      ["worthless?", "bon à rien?"],
    ] as [string, string][]
  ).map(([en, fr], i) => ({ id: `k6_${i + 1}`, text: t(en, fr) })),
  total: {
    label: t(
      "Psychological distress",
      "Détresse psychologique",
      "الضيق النفسي",
    ),
    bands: [
      {
        min: 0,
        max: 4,
        label: t("Low distress", "Détresse faible", "ضيق منخفض"),
        level: "low",
      },
      {
        min: 5,
        max: 12,
        label: t("Moderate distress", "Détresse modérée", "ضيق متوسط"),
        level: "moderate",
      },
      {
        min: 13,
        max: 24,
        label: t(
          "Serious distress — a professional assessment is advised",
          "Détresse importante — une évaluation professionnelle est conseillée",
          "ضيق شديد — يُنصح بتقييم مختص",
        ),
        level: "high",
      },
    ],
  },
  minutes: 2,
  source:
    "Kessler RC et al. Screening for serious mental illness in the general population. Arch Gen Psychiatry 2003;60:184–189 (≥13: serious psychological distress). Prochaska JJ et al. Int J Methods Psychiatr Res 2012;21:88–97 (5–12: moderate). French: Statistics Canada, CCHS 2013, reproduced by INSPQ.",
  license: "Free to use with citation (Kessler et al. 2003).",
};

export const INSTRUMENTS: Instrument[] = [
  PHQ9,
  GAD7,
  WHO5,
  DASS21,
  PCL5,
  AUDIT,
  K6,
];

export const INSTRUMENTS_BY_CODE: Record<string, Instrument> =
  Object.fromEntries(INSTRUMENTS.map((i) => [i.code, i]));
