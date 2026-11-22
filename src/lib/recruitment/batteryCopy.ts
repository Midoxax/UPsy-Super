import { useLocale } from "@/contexts/LocaleContext";
import type { Level, Niche, Trait } from "./battery";

type Interp = Record<Trait, Record<Level, string>>;

const fr = {
  title: "Bilan de recrutement LSSPM",
  intro:
    "Un bilan d'environ 25 minutes : personnalité, équilibre psychologique et jugement professionnel (situations cliniques de votre spécialité). Il complète votre dossier et votre entretien ; il ne décide pas à lui seul.",
  consent:
    "J'accepte que mes réponses, y compris celles concernant mon bien-être (données de santé, loi 09-08), soient traitées par la Ligue pour mon recrutement. Seul le comité d'évaluation de la Ligue accède au rapport complet ; les résultats de bien-être servent au soutien et à la supervision, jamais à un refus automatique. Je peux retirer mon consentement en écrivant à la Ligue.",
  chooseNiches: "Votre (vos) spécialité(s) — 1 ou 2",
  niches: {
    adult: "Clinique adulte",
    child: "Enfant et adolescent",
    sport: "Sport et performance",
    neuro: "Neuropsychologie",
    work: "Travail et organisations",
    trauma: "Trauma et crise",
  } as Record<Niche, string>,
  start: "Commencer le bilan",
  resume: "Reprendre le bilan",
  done: "Bilan transmis au comité de la Ligue.",
  oncePerYear: "Le bilan se passe une fois par an.",
  parts: [
    "Partie 1 — Personnalité",
    "Partie 2 — Équilibre psychologique",
    "Partie 3 — Situations professionnelles",
  ],
  ipipNote:
    "Les items de personnalité sont présentés dans leur version anglaise publiée (Mini-IPIP6) : aucune version française validée n'est encore intégrée.",
  ipipInstr:
    "Décrivez-vous tel(le) que vous êtes généralement aujourd'hui, et non tel(le) que vous souhaiteriez être.",
  sjtInstr:
    "Pour chaque situation, choisissez la réponse qui vous semble la plus appropriée.",
  next: "Suivant",
  back: "Retour",
  submit: "Envoyer le bilan",
  answerAll: "Répondez à toutes les questions de cette partie.",
  results: "Vos résultats",
  traits: {
    E: "Extraversion",
    A: "Agréabilité",
    C: "Conscience professionnelle",
    N: "Instabilité émotionnelle",
    I: "Ouverture intellectuelle",
    H: "Honnêteté-humilité",
  } as Record<Trait, string>,
  levels: { low: "basse", mid: "moyenne", high: "élevée" } as Record<
    Level,
    string
  >,
  wellbeing: "Bien-être (WHO-5)",
  distress: "Détresse psychologique (K6)",
  support:
    "Si vous traversez une période difficile, parlez-en à un professionnel de confiance ou à la supervision de la Ligue ; ce résultat n'est jamais utilisé contre vous.",
  sjtHidden:
    "Vos réponses aux situations professionnelles sont évaluées par le comité de la Ligue.",
  // Committee
  desk: "Bilans",
  report: "Rapport",
  validity: "Validité des réponses",
  validityOk: "Réponses cohérentes.",
  attention: (n: number) => `${n} contrôle(s) d'attention échoué(s)`,
  inconsistency: (x: number) => `Incohérence ${x} / 4`,
  straight: "Réponses quasi identiques (alignement)",
  tooFast: "Passation trop rapide (< 8 min)",
  caution: "À lire avec prudence",
  sjt: "Jugement professionnel",
  module: { core: "Éthique et pratique (tronc commun)" } as Record<
    string,
    string
  >,
  passport: (n: number) => `${n} élément(s) du passeport validé(s)`,
  divisions: "Pôles où le profil peut contribuer",
  divisionNames: {
    formation: "Formation et activités",
    supervision: "Supervision et pratique clinique",
    recherche: "Recherche et publications",
    communication: "Communication et partenariats",
  } as Record<string, string>,
  watch: "Points à explorer en entretien",
  hLow: "Honnêteté-humilité basse : explorer le rapport aux avantages, au statut et à l'intérêt personnel.",
  sjtLow:
    "Jugement éthique en dessous de 60 % : vérifier la connaissance du cadre déontologique.",
  wellLow:
    "Bien-être bas ou détresse élevée : proposer soutien et supervision ; ne pas en faire un motif de refus.",
  note: "Note du comité",
  saveNote: "Enregistrer la note",
  inProgress: "En cours",
  printReport: "Imprimer le rapport",
  disclaimer:
    "Indicateurs d'aide à la décision, à croiser avec le dossier vérifié, le passeport et l'entretien. Bandes de personnalité descriptives (pas d'étalonnage marocain) ; clé des situations en attente de validation par le comité d'experts de la Ligue.",
};

type Copy = typeof fr;

const interpFr: Interp = {
  E: {
    low: "Réservé(e), à l'aise dans le travail individuel et l'écoute ; moins porté(e) vers l'animation de groupes.",
    mid: "Équilibre entre travail individuel et exposition au groupe.",
    high: "À l'aise en public et en groupe : atout pour l'animation, la formation et la représentation.",
  },
  A: {
    low: "Direct(e) et indépendant(e) ; à accompagner sur la coopération et l'empathie exprimée.",
    mid: "Coopération et fermeté équilibrées.",
    high: "Chaleureux(se), empathique et coopératif(ve) : atout pour l'alliance thérapeutique et le travail d'équipe.",
  },
  C: {
    low: "Organisation et suivi à soutenir ; vérifier la fiabilité dans les engagements.",
    mid: "Organisation suffisante pour la plupart des missions.",
    high: "Rigoureux(se), organisé(e) et fiable : atout pour la coordination et la recherche.",
  },
  N: {
    low: "Stable émotionnellement, résistant(e) au stress.",
    mid: "Réactivité émotionnelle habituelle.",
    high: "Réactivité émotionnelle marquée : la supervision et la prévention de l'épuisement sont recommandées.",
  },
  I: {
    low: "Préférence pour le concret et les méthodes éprouvées.",
    mid: "Ouverture aux idées dans la moyenne.",
    high: "Curieux(se) et ouvert(e) aux idées abstraites : atout pour la recherche et l'innovation.",
  },
  H: {
    low: "Attrait marqué pour le statut, les avantages ou le luxe : point à explorer en entretien.",
    mid: "Rapport aux avantages et au statut dans la moyenne.",
    high: "Modeste et peu motivé(e) par le statut : indicateur favorable d'intégrité.",
  },
};

const en: Copy = {
  ...fr,
  title: "LSSPM recruitment assessment",
  intro:
    "About 25 minutes: personality, psychological balance and professional judgment (clinical situations in your speciality). It complements your file and interview; it never decides on its own.",
  consent:
    "I agree that my answers, including those about my well-being (health data, Law 09-08), are processed by the League for my recruitment. Only the League's assessment committee sees the full report; well-being results are used for support and supervision, never for an automatic refusal. I may withdraw my consent by writing to the League.",
  chooseNiches: "Your speciality(ies) — 1 or 2",
  niches: {
    adult: "Adult clinical",
    child: "Child and adolescent",
    sport: "Sport and performance",
    neuro: "Neuropsychology",
    work: "Work and organisations",
    trauma: "Trauma and crisis",
  },
  start: "Start the assessment",
  resume: "Resume the assessment",
  done: "Assessment sent to the League's committee.",
  oncePerYear: "The assessment is taken once a year.",
  parts: [
    "Part 1 — Personality",
    "Part 2 — Psychological balance",
    "Part 3 — Professional situations",
  ],
  ipipNote:
    "Personality items are shown in their published English version (Mini-IPIP6).",
  ipipInstr:
    "Describe yourself as you generally are now, not as you wish to be.",
  sjtInstr:
    "For each situation, choose the response you find most appropriate.",
  next: "Next",
  back: "Back",
  submit: "Send the assessment",
  answerAll: "Answer every question in this part.",
  results: "Your results",
  traits: {
    E: "Extraversion",
    A: "Agreeableness",
    C: "Conscientiousness",
    N: "Neuroticism",
    I: "Intellect / imagination",
    H: "Honesty-humility",
  },
  levels: { low: "low", mid: "average", high: "high" },
  wellbeing: "Well-being (WHO-5)",
  distress: "Psychological distress (K6)",
  support:
    "If you are going through a hard time, talk to a professional you trust or to the League's supervision; this result is never used against you.",
  sjtHidden:
    "Your answers to the professional situations are reviewed by the League's committee.",
  desk: "Assessments",
  report: "Report",
  validity: "Response validity",
  validityOk: "Consistent responses.",
  attention: (n: number) => `${n} attention check(s) failed`,
  inconsistency: (x: number) => `Inconsistency ${x} / 4`,
  straight: "Near-identical answers (straight-lining)",
  tooFast: "Completed too fast (< 8 min)",
  caution: "Read with caution",
  sjt: "Professional judgment",
  module: { core: "Ethics and practice (core)" },
  passport: (n: number) => `${n} passport item(s) validated`,
  divisions: "Divisions where the profile can contribute",
  divisionNames: {
    formation: "Training and activities",
    supervision: "Supervision and clinical practice",
    recherche: "Research and publications",
    communication: "Communication and partnerships",
  },
  watch: "Points to explore in the interview",
  hLow: "Low honesty-humility: explore attitudes to benefits, status and self-interest.",
  sjtLow:
    "Ethical judgment below 60%: check knowledge of the ethical framework.",
  wellLow:
    "Low well-being or high distress: offer support and supervision; never a reason to refuse.",
  note: "Committee note",
  saveNote: "Save the note",
  inProgress: "In progress",
  printReport: "Print the report",
  disclaimer:
    "Decision aids, to be read with the verified file, the passport and the interview. Personality bands are descriptive (no Moroccan norms); the situations' key awaits validation by the League's expert committee.",
};

const interpEn: Interp = {
  E: {
    low: "Reserved, at ease with individual work and listening; less drawn to leading groups.",
    mid: "Balance between individual work and group exposure.",
    high: "At ease in public and groups: an asset for facilitation, training and representation.",
  },
  A: {
    low: "Direct and independent; support cooperation and expressed empathy.",
    mid: "Balanced cooperation and firmness.",
    high: "Warm, empathic and cooperative: an asset for therapeutic alliance and teamwork.",
  },
  C: {
    low: "Organisation and follow-through need support; check reliability on commitments.",
    mid: "Organisation sufficient for most tasks.",
    high: "Rigorous, organised and reliable: an asset for coordination and research.",
  },
  N: {
    low: "Emotionally stable, resilient under stress.",
    mid: "Usual emotional reactivity.",
    high: "Marked emotional reactivity: supervision and burnout prevention recommended.",
  },
  I: {
    low: "Prefers the concrete and proven methods.",
    mid: "Average openness to ideas.",
    high: "Curious and open to abstract ideas: an asset for research and innovation.",
  },
  H: {
    low: "Strong pull towards status, benefits or luxury: a point to explore in the interview.",
    mid: "Average attitude to benefits and status.",
    high: "Modest and little driven by status: a favourable integrity indicator.",
  },
};

export function useBatteryCopy() {
  const { locale } = useLocale();
  const isEn = locale === "en";
  return {
    t: isEn ? en : fr,
    interp: isEn ? interpEn : interpFr,
    lang: (isEn ? "en" : "fr") as "en" | "fr",
    locale,
  };
}
