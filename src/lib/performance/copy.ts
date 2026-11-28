// Performance Center copy in en / fr / ar (Berber falls back to French, as
// in the rest of the Athlete Hub). The methods named here are the ones
// implemented in src/lib/performance/metrics.ts.
import { useLocale } from "@/contexts/LocaleContext";

const en = {
  dateLocale: "en-GB",
  eyebrow: "U.Psy Performance Center",
  title: "Your mind, engineered like a race car.",
  subtitle:
    "Telemetry, setup, race strategy and debriefs: the tools of a development hub, built on sport-psychology methods and shared only with the people you choose.",
  tabs: {
    pit: "Pit wall",
    telemetry: "Telemetry",
    setup: "Setup sheet",
    race: "Race weekend",
    season: "Season",
    simulator: "Simulator",
    crew: "Pit crew",
  },
  lights: { readiness: "Readiness", load: "Load", recovery: "Recovery" },
  lightState: {
    green: "Push",
    amber: "Manage",
    red: "Adjust today",
    off: "No data",
  },
  nextRace: (n: number) =>
    n === 0
      ? "Competition today"
      : n === 1
        ? "Competition tomorrow"
        : `Next competition in ${n} days`,
  countdown: (n: number) => (n === 0 ? "D" : `D-${n}`),
  noRace: "No competition planned",
  addRace: "Plan a competition",
  checkin: "Daily check-in",
  checkinDone: "Checked in today",
  logSession: "Log a session",
  alertsTitle: "Race engineer's notes",
  allClear: "All clear. Keep the plan.",
  alerts: {
    loadSpike: (v: number) =>
      `This week's load is ${v}× your monthly average. A sudden jump is worth discussing with your coach: hold or taper the next sessions.`,
    loadLow: (v: number) =>
      `This week's load is ${v}× your monthly average, well below usual. Fine for a taper or recovery week.`,
    monotony: (v: number) =>
      `Training monotony ${v}: days look alike. Vary the intensity (one easy day, one hard day) to recover better.`,
    readinessDrop: (v: number) =>
      `Readiness ${v} is below your own normal range. Prioritise recovery and talk about it if it lasts.`,
    hrvDrop: (v: number) =>
      `HRV ${v} ms is below your baseline: often a sign of fatigue, illness or stress.`,
    sleepDebt: (v: number) =>
      `${v} short nights (under 6 h) in 3 days: plan an early night.`,
    soreness: (v: number) => `Soreness ${v}/10 today: adapt the session.`,
    raceSoon: (v: number) =>
      v === 0
        ? "Race day: run your routine, trust the plan."
        : `Competition in ${v} days: review your race plan.`,
    noCheckin: () =>
      "No check-in yet today: 30 seconds to update the pit wall.",
  } as Record<string, (v: number) => string>,
  today: "Today",
  stats: {
    acute: "7-day load",
    chronic: "Weekly average (28 d)",
    acwr: "Acute : chronic",
    monotony: "Monotony",
    strain: "Strain",
    sessions: "Sessions (7 d)",
    readiness: "Readiness",
    baseline: "Your normal",
    hrv: "HRV",
  },
  au: "AU",
  // Telemetry
  readinessTrace: "Readiness trace",
  readinessTraceHint:
    "The band is your own normal range (mean ± 1 SD of the last 28 days). Below it is what matters, not a single number.",
  loadTrace: "Training load",
  loadTraceHint:
    "Each bar is a day's load: minutes × effort (session RPE, Foster 2001). The line is the acute : chronic ratio.",
  zones: {
    low: "Under-loaded",
    optimal: "Steady build",
    caution: "Fast build",
    spike: "Spike",
  } as Record<string, string>,
  acwrCaveat:
    "The ratio flags sudden changes; it does not predict injury on its own (Impellizzeri 2020). Read it with your coach.",
  recoveryTrace: "Sleep and recovery",
  sleepHours: "Sleep (h)",
  soreness: "Soreness",
  hrvMs: "HRV (ms)",
  restingHr: "Resting HR",
  noSessions:
    "No session logged yet. Log your first one to start the load trace.",
  noTelemetry:
    "Add sleep hours, soreness or HRV to your check-in to draw this trace.",
  recentSessions: "Recent sessions",
  delete: "Delete",
  // Session dialog
  sessionTitle: "Log a session",
  sessionDesc:
    "Thirty minutes after the session, rate how hard the whole session was. Load = minutes × effort.",
  date: "Date",
  kind: "Type",
  kinds: {
    training: "Training",
    match: "Match / race",
    strength: "Strength",
    conditioning: "Conditioning",
    recovery: "Recovery",
    mental: "Mental training",
    other: "Other",
  } as Record<string, string>,
  duration: "Duration (min)",
  rpe: "Effort (CR-10)",
  rpeAnchors: [
    "Rest",
    "Very, very easy",
    "Easy",
    "Moderate",
    "Somewhat hard",
    "Hard",
    "Hard",
    "Very hard",
    "Very hard",
    "Very hard",
    "Maximal",
  ],
  loadPreview: (n: number) => `Load: ${n} AU`,
  notePh: "Note (optional)",
  save: "Save",
  saving: "Saving…",
  saved: "Saved",
  saveFailed: "Could not save",
  cancel: "Cancel",
  // Telemetry fields in the check-in
  telemetryFields: "Telemetry (optional)",
  telemetryHint: "From your watch or ring, if you have one.",
  // Setup sheet
  setupTitle: "Performance profile",
  setupIntro:
    "Name the qualities that make performance in your sport, rate where you are and where you need to be (Butler & Hardy, 1992). The biggest gaps become your development priorities.",
  quality: "Quality",
  area: "Area",
  areas: {
    mental: "Mental",
    physical: "Physical",
    technical: "Technical",
    tactical: "Tactical",
  } as Record<string, string>,
  current: "Now",
  ideal: "Target",
  addQuality: "Add a quality",
  starter: "Start from a template",
  starterSet: [
    ["Focus under pressure", "mental"],
    ["Confidence", "mental"],
    ["Emotional control", "mental"],
    ["Bounce-back after errors", "mental"],
    ["Recovery", "physical"],
    ["Decision making", "tactical"],
    ["Consistency of technique", "technical"],
  ] as [string, string][],
  saveSnapshot: "Save this profile",
  snapshotSaved: "Profile saved. Compare it in a few weeks.",
  priorities: "Development priorities",
  gap: (n: number) => `gap ${n}`,
  trainWith: "Train it with",
  sinceLast: "Since your last profile",
  history: (n: number, d: string) => `${n} profiles · last on ${d}`,
  remove: "Remove",
  // Race weekend
  raceTitle: "Race weekend",
  raceIntro:
    "Plan each competition like a race: your ideal activation zone, a timed routine, if-then plans for what can go wrong, cue words. Check in before the start, debrief after.",
  plan: "Race plan",
  preRace: "Pre-race check",
  debrief: "Debrief",
  planEmpty: "No plan yet",
  zoneTitle: "Activation zone (IZOF)",
  zoneHint:
    "On 1 to 10, where do you perform best: calm (low) or fired up (high)? Think of your best performances (Hanin).",
  zoneLow: "From",
  zoneHigh: "to",
  routineTitle: "Routine",
  routineHint: "Minutes before the start, and what you do.",
  minutesBefore: "min before",
  addStep: "Add a step",
  routineTemplate: [
    [120, "Arrive, settle, music"],
    [60, "Physical warm-up"],
    [30, "Imagery: first actions"],
    [10, "Breathing 4-6, cue words"],
    [1, "One focus: the first action"],
  ] as [number, string][],
  ifThenTitle: "If-then plans",
  ifThenHint:
    "Decide now what you will do when it gets hard (Gollwitzer, 1999). Example: if I make an early mistake, then I breathe out and reset on the next action.",
  ifPh: "If…",
  thenPh: "then I…",
  addIfThen: "Add an if-then",
  cuesTitle: "Cue words",
  cuesPh: "e.g. smooth, attack, here",
  focusTitle: "Process focus",
  focusPh: "What you control in this competition",
  stateTitle: "How do you feel right now?",
  stateHint:
    "Intensity and direction: the same nerves can help or hinder (Jones & Swain, 1992).",
  cognitive: "Worry",
  somatic: "Body nerves",
  confidence: "Confidence",
  activation: "Activation",
  direction: "Do these feelings help or hinder?",
  directionEnds: ["Hinder", "Help"] as [string, string],
  zoneRead: {
    below:
      "Below your zone: raise activation (dynamic warm-up, power posture, upbeat cue words).",
    in: "In your zone. Stay with your routine.",
    above:
      "Above your zone: lower activation (long exhale 4-6, slow down, process cue).",
  } as Record<string, string>,
  directionRead: {
    facilitative: "You read your nerves as fuel: use them.",
    neutral: "Neutral: let the routine do the work.",
    debilitative:
      "You read your nerves as a threat: reframe them as the body getting ready, then breathe.",
  } as Record<string, string>,
  debriefTitle: "After-action review",
  debriefFields: {
    planned: "What was planned?",
    happened: "What actually happened?",
    why: "Why was there a difference?",
    keep: "What do I keep?",
    change: "What do I change next time?",
  } as Record<string, string>,
  controllables: "How well did I execute what I control? (1-10)",
  result: "Result",
  rating: "Performance (1-10)",
  savePlan: "Save",
  upcoming: "Upcoming",
  past: "Past",
  days: (n: number) =>
    n === 0 ? "today" : n > 0 ? `in ${n} d` : `${-n} d ago`,
  // Season
  seasonTitle: "Season plan",
  seasonIntro:
    "Periodise the mind like the body: build skills in preparation, sharpen them before competitions, recover in transition.",
  phaseKinds: {
    general_prep: "General preparation",
    specific_prep: "Specific preparation",
    pre_competition: "Pre-competition",
    competition: "Competition",
    transition: "Transition",
  } as Record<string, string>,
  phaseFocusHints: {
    general_prep: "Learn skills: breathing, imagery, self-talk",
    specific_prep: "Apply skills under training pressure",
    pre_competition: "Rehearse routines, simulate race conditions",
    competition: "Execute, debrief, keep it simple",
    transition: "Recover, reflect, reset goals",
  } as Record<string, string>,
  phaseName: "Name",
  phaseKind: "Phase",
  starts: "Start",
  ends: "End",
  phaseFocus: "Mental focus",
  addPhase: "Add a phase",
  noPhases: "No phase yet. Start with your next block of training.",
  todayMarker: "today",
  // Simulator & crew
  simulatorTitle: "Simulator",
  simulatorIntro:
    "Train the mind between races: guided protocols, your journal, your goals and the AI coach.",
  crewTitle: "Pit crew",
  crewIntro:
    "The people in your garage. Share what you choose with your psychologist, take assessments, contribute to research, print your report.",
  disclaimer:
    "Self-monitoring tools for training, not a medical device. In case of pain, illness or distress, see a professional.",
  signIn: "Sign in to your Performance Center",
};

type Copy = typeof en;

const fr: Copy = {
  dateLocale: "fr-FR",
  eyebrow: "Centre de performance U.Psy",
  title: "Votre mental, préparé comme une voiture de course.",
  subtitle:
    "Télémétrie, réglages, stratégie de course et débriefs : les outils d'un centre de développement, fondés sur la psychologie du sport et partagés seulement avec qui vous choisissez.",
  tabs: {
    pit: "Muret des stands",
    telemetry: "Télémétrie",
    setup: "Fiche de réglages",
    race: "Week-end de course",
    season: "Saison",
    simulator: "Simulateur",
    crew: "Équipe",
  },
  lights: {
    readiness: "Disponibilité",
    load: "Charge",
    recovery: "Récupération",
  },
  lightState: {
    green: "Attaquer",
    amber: "Gérer",
    red: "Ajuster aujourd'hui",
    off: "Pas de données",
  },
  nextRace: (n: number) =>
    n === 0
      ? "Compétition aujourd'hui"
      : n === 1
        ? "Compétition demain"
        : `Prochaine compétition dans ${n} jours`,
  countdown: (n: number) => (n === 0 ? "J" : `J-${n}`),
  noRace: "Aucune compétition prévue",
  addRace: "Planifier une compétition",
  checkin: "Check-in du jour",
  checkinDone: "Check-in fait aujourd'hui",
  logSession: "Enregistrer une séance",
  alertsTitle: "Notes de l'ingénieur de course",
  allClear: "Tout est au vert. On garde le plan.",
  alerts: {
    loadSpike: (v: number) =>
      `La charge de la semaine vaut ${v}× votre moyenne du mois. Une hausse brutale mérite d'en parler à votre entraîneur : maintenez ou allégez les prochaines séances.`,
    loadLow: (v: number) =>
      `La charge de la semaine vaut ${v}× votre moyenne du mois, bien en dessous de l'habitude. Normal pour un affûtage ou une semaine de récupération.`,
    monotony: (v: number) =>
      `Monotonie ${v} : les jours se ressemblent. Variez l'intensité (un jour facile, un jour dur) pour mieux récupérer.`,
    readinessDrop: (v: number) =>
      `Disponibilité ${v}, sous votre zone habituelle. Priorité à la récupération, et parlez-en si cela dure.`,
    hrvDrop: (v: number) =>
      `VFC ${v} ms sous votre référence : souvent un signe de fatigue, de maladie ou de stress.`,
    sleepDebt: (v: number) =>
      `${v} nuits courtes (moins de 6 h) en 3 jours : prévoyez un coucher tôt.`,
    soreness: (v: number) =>
      `Courbatures ${v}/10 aujourd'hui : adaptez la séance.`,
    raceSoon: (v: number) =>
      v === 0
        ? "Jour de course : déroulez votre routine, faites confiance au plan."
        : `Compétition dans ${v} jours : relisez votre plan de course.`,
    noCheckin: () =>
      "Pas encore de check-in aujourd'hui : 30 secondes pour mettre le muret à jour.",
  } as Record<string, (v: number) => string>,
  today: "Aujourd'hui",
  stats: {
    acute: "Charge 7 jours",
    chronic: "Moyenne hebdo (28 j)",
    acwr: "Aiguë : chronique",
    monotony: "Monotonie",
    strain: "Contrainte",
    sessions: "Séances (7 j)",
    readiness: "Disponibilité",
    baseline: "Votre normale",
    hrv: "VFC",
  },
  au: "UA",
  readinessTrace: "Trace de disponibilité",
  readinessTraceHint:
    "La bande est votre zone habituelle (moyenne ± 1 écart-type sur 28 jours). C'est passer en dessous qui compte, pas un chiffre isolé.",
  loadTrace: "Charge d'entraînement",
  loadTraceHint:
    "Chaque barre est la charge d'un jour : minutes × effort (RPE de séance, Foster 2001). La courbe est le rapport aiguë : chronique.",
  zones: {
    low: "Sous-charge",
    optimal: "Progression régulière",
    caution: "Progression rapide",
    spike: "Pic",
  } as Record<string, string>,
  acwrCaveat:
    "Le rapport signale les changements brusques ; il ne prédit pas la blessure à lui seul (Impellizzeri 2020). À lire avec votre entraîneur.",
  recoveryTrace: "Sommeil et récupération",
  sleepHours: "Sommeil (h)",
  soreness: "Courbatures",
  hrvMs: "VFC (ms)",
  restingHr: "FC de repos",
  noSessions:
    "Aucune séance enregistrée. Enregistrez la première pour lancer la trace de charge.",
  noTelemetry:
    "Ajoutez heures de sommeil, courbatures ou VFC à votre check-in pour tracer cette courbe.",
  recentSessions: "Séances récentes",
  delete: "Supprimer",
  sessionTitle: "Enregistrer une séance",
  sessionDesc:
    "Trente minutes après la séance, notez la difficulté de l'ensemble de la séance. Charge = minutes × effort.",
  date: "Date",
  kind: "Type",
  kinds: {
    training: "Entraînement",
    match: "Match / course",
    strength: "Musculation",
    conditioning: "Préparation physique",
    recovery: "Récupération",
    mental: "Préparation mentale",
    other: "Autre",
  } as Record<string, string>,
  duration: "Durée (min)",
  rpe: "Effort (CR-10)",
  rpeAnchors: [
    "Repos",
    "Très, très facile",
    "Facile",
    "Modéré",
    "Un peu dur",
    "Dur",
    "Dur",
    "Très dur",
    "Très dur",
    "Très dur",
    "Maximal",
  ],
  loadPreview: (n: number) => `Charge : ${n} UA`,
  notePh: "Note (facultatif)",
  save: "Enregistrer",
  saving: "Enregistrement…",
  saved: "Enregistré",
  saveFailed: "Échec de l'enregistrement",
  cancel: "Annuler",
  telemetryFields: "Télémétrie (facultatif)",
  telemetryHint: "Depuis votre montre ou bague, si vous en avez une.",
  setupTitle: "Profil de performance",
  setupIntro:
    "Nommez les qualités qui font la performance dans votre sport, notez où vous en êtes et où vous devez être (Butler & Hardy, 1992). Les plus grands écarts deviennent vos priorités de développement.",
  quality: "Qualité",
  area: "Domaine",
  areas: {
    mental: "Mental",
    physical: "Physique",
    technical: "Technique",
    tactical: "Tactique",
  } as Record<string, string>,
  current: "Actuel",
  ideal: "Cible",
  addQuality: "Ajouter une qualité",
  starter: "Partir d'un modèle",
  starterSet: [
    ["Concentration sous pression", "mental"],
    ["Confiance", "mental"],
    ["Contrôle émotionnel", "mental"],
    ["Rebond après l'erreur", "mental"],
    ["Récupération", "physical"],
    ["Prise de décision", "tactical"],
    ["Régularité technique", "technical"],
  ] as [string, string][],
  saveSnapshot: "Enregistrer ce profil",
  snapshotSaved: "Profil enregistré. Comparez-le dans quelques semaines.",
  priorities: "Priorités de développement",
  gap: (n: number) => `écart ${n}`,
  trainWith: "À travailler avec",
  sinceLast: "Depuis votre dernier profil",
  history: (n: number, d: string) => `${n} profils · dernier le ${d}`,
  remove: "Retirer",
  raceTitle: "Week-end de course",
  raceIntro:
    "Préparez chaque compétition comme une course : votre zone d'activation idéale, une routine minutée, des plans si-alors pour ce qui peut mal tourner, des mots-clés. Check-in avant le départ, débrief après.",
  plan: "Plan de course",
  preRace: "Check avant départ",
  debrief: "Débrief",
  planEmpty: "Pas encore de plan",
  zoneTitle: "Zone d'activation (IZOF)",
  zoneHint:
    "De 1 à 10, où performez-vous le mieux : calme (bas) ou très activé (haut) ? Pensez à vos meilleures performances (Hanin).",
  zoneLow: "De",
  zoneHigh: "à",
  routineTitle: "Routine",
  routineHint: "Minutes avant le départ, et ce que vous faites.",
  minutesBefore: "min avant",
  addStep: "Ajouter une étape",
  routineTemplate: [
    [120, "Arriver, s'installer, musique"],
    [60, "Échauffement physique"],
    [30, "Imagerie : premières actions"],
    [10, "Respiration 4-6, mots-clés"],
    [1, "Une seule cible : la première action"],
  ] as [number, string][],
  ifThenTitle: "Plans si-alors",
  ifThenHint:
    "Décidez maintenant de ce que vous ferez quand ce sera dur (Gollwitzer, 1999). Exemple : si je fais une erreur tôt, alors j'expire et je me recentre sur l'action suivante.",
  ifPh: "Si…",
  thenPh: "alors je…",
  addIfThen: "Ajouter un si-alors",
  cuesTitle: "Mots-clés",
  cuesPh: "ex. fluide, attaque, ici",
  focusTitle: "Objectif de processus",
  focusPh: "Ce que vous contrôlez dans cette compétition",
  stateTitle: "Comment vous sentez-vous maintenant ?",
  stateHint:
    "Intensité et direction : le même trac peut aider ou gêner (Jones & Swain, 1992).",
  cognitive: "Inquiétude",
  somatic: "Tension corporelle",
  confidence: "Confiance",
  activation: "Activation",
  direction: "Ces sensations vous aident-elles ou vous gênent-elles ?",
  directionEnds: ["Gênent", "Aident"] as [string, string],
  zoneRead: {
    below:
      "Sous votre zone : montez l'activation (échauffement dynamique, posture, mots-clés toniques).",
    in: "Dans votre zone. Restez dans votre routine.",
    above:
      "Au-dessus de votre zone : baissez l'activation (expiration longue 4-6, ralentir, mot-clé de processus).",
  } as Record<string, string>,
  directionRead: {
    facilitative: "Vous lisez votre trac comme un carburant : utilisez-le.",
    neutral: "Neutre : laissez la routine faire le travail.",
    debilitative:
      "Vous lisez votre trac comme une menace : voyez-le comme le corps qui se prépare, puis respirez.",
  } as Record<string, string>,
  debriefTitle: "Revue après action",
  debriefFields: {
    planned: "Qu'est-ce qui était prévu ?",
    happened: "Que s'est-il vraiment passé ?",
    why: "Pourquoi cet écart ?",
    keep: "Qu'est-ce que je garde ?",
    change: "Que changer la prochaine fois ?",
  } as Record<string, string>,
  controllables: "Ai-je bien exécuté ce que je contrôle ? (1-10)",
  result: "Résultat",
  rating: "Performance (1-10)",
  savePlan: "Enregistrer",
  upcoming: "À venir",
  past: "Passées",
  days: (n: number) =>
    n === 0 ? "aujourd'hui" : n > 0 ? `dans ${n} j` : `il y a ${-n} j`,
  seasonTitle: "Plan de saison",
  seasonIntro:
    "Périodisez le mental comme le physique : construire les habiletés en préparation, les affûter avant les compétitions, récupérer en transition.",
  phaseKinds: {
    general_prep: "Préparation générale",
    specific_prep: "Préparation spécifique",
    pre_competition: "Pré-compétition",
    competition: "Compétition",
    transition: "Transition",
  } as Record<string, string>,
  phaseFocusHints: {
    general_prep: "Apprendre : respiration, imagerie, discours interne",
    specific_prep: "Appliquer sous la pression de l'entraînement",
    pre_competition: "Répéter les routines, simuler la course",
    competition: "Exécuter, débriefer, rester simple",
    transition: "Récupérer, prendre du recul, refixer les objectifs",
  } as Record<string, string>,
  phaseName: "Nom",
  phaseKind: "Phase",
  starts: "Début",
  ends: "Fin",
  phaseFocus: "Objectif mental",
  addPhase: "Ajouter une phase",
  noPhases: "Aucune phase. Commencez par votre prochain bloc d'entraînement.",
  todayMarker: "aujourd'hui",
  simulatorTitle: "Simulateur",
  simulatorIntro:
    "Entraînez le mental entre les courses : protocoles guidés, journal, objectifs et coach IA.",
  crewTitle: "Équipe",
  crewIntro:
    "Les personnes de votre garage. Partagez ce que vous choisissez avec votre psychologue, passez des évaluations, contribuez à la recherche, imprimez votre rapport.",
  disclaimer:
    "Outils d'auto-suivi pour l'entraînement, pas un dispositif médical. En cas de douleur, de maladie ou de détresse, consultez un professionnel.",
  signIn: "Connectez-vous à votre Centre de performance",
};

const ar: Copy = {
  dateLocale: "ar-MA",
  eyebrow: "مركز الأداء U.Psy",
  title: "ذهنك، مُعَدّ كسيارة سباق.",
  subtitle:
    "القياس عن بُعد، الإعدادات، استراتيجية السباق والتقييم بعده: أدوات مركز تطوير، مبنية على علم النفس الرياضي، ولا تُشارَك إلا مع من تختار.",
  tabs: {
    pit: "جدار الصيانة",
    telemetry: "القياس عن بُعد",
    setup: "ورقة الإعدادات",
    race: "عطلة السباق",
    season: "الموسم",
    simulator: "المحاكي",
    crew: "الفريق",
  },
  lights: { readiness: "الجاهزية", load: "الحِمل", recovery: "الاسترجاع" },
  lightState: {
    green: "انطلق",
    amber: "تحكّم",
    red: "عدّل اليوم",
    off: "لا بيانات",
  },
  nextRace: (n: number) =>
    n === 0
      ? "منافسة اليوم"
      : n === 1
        ? "منافسة غدًا"
        : `المنافسة القادمة بعد ${n} أيام`,
  countdown: (n: number) => (n === 0 ? "D" : `D-${n}`),
  noRace: "لا منافسة مبرمجة",
  addRace: "برمج منافسة",
  checkin: "التسجيل اليومي",
  checkinDone: "تم التسجيل اليوم",
  logSession: "سجّل حصة",
  alertsTitle: "ملاحظات مهندس السباق",
  allClear: "كل شيء على ما يرام. حافظ على الخطة.",
  alerts: {
    loadSpike: (v: number) =>
      `حِمل هذا الأسبوع يساوي ${v}× متوسطك الشهري. ارتفاع مفاجئ يستحق النقاش مع مدربك: حافظ أو خفف الحصص القادمة.`,
    loadLow: (v: number) =>
      `حِمل هذا الأسبوع يساوي ${v}× متوسطك الشهري، أقل بكثير من المعتاد. مناسب لأسبوع تخفيف أو استرجاع.`,
    monotony: (v: number) =>
      `الرتابة ${v}: الأيام متشابهة. نوّع الشدة (يوم سهل، يوم صعب) لاسترجاع أفضل.`,
    readinessDrop: (v: number) =>
      `الجاهزية ${v} أقل من نطاقك المعتاد. أعطِ الأولوية للاسترجاع وتحدث عن ذلك إن استمر.`,
    hrvDrop: (v: number) =>
      `تقلب نبض القلب ${v} ms أقل من مرجعك: غالبًا علامة تعب أو مرض أو ضغط.`,
    sleepDebt: (v: number) =>
      `${v} ليالٍ قصيرة (أقل من 6 ساعات) في 3 أيام: خطط لنوم مبكر.`,
    soreness: (v: number) => `آلام عضلية ${v}/10 اليوم: كيّف الحصة.`,
    raceSoon: (v: number) =>
      v === 0
        ? "يوم السباق: طبّق روتينك وثق في الخطة."
        : `منافسة بعد ${v} أيام: راجع خطة السباق.`,
    noCheckin: () => "لم تسجّل بعد اليوم: 30 ثانية لتحديث جدار الصيانة.",
  } as Record<string, (v: number) => string>,
  today: "اليوم",
  stats: {
    acute: "حِمل 7 أيام",
    chronic: "المتوسط الأسبوعي (28 يومًا)",
    acwr: "حاد : مزمن",
    monotony: "الرتابة",
    strain: "الإجهاد",
    sessions: "الحصص (7 أيام)",
    readiness: "الجاهزية",
    baseline: "معدّلك المعتاد",
    hrv: "تقلب نبض القلب",
  },
  au: "و.ع",
  readinessTrace: "منحنى الجاهزية",
  readinessTraceHint:
    "الشريط هو نطاقك المعتاد (المتوسط ± انحراف معياري واحد على 28 يومًا). المهم هو النزول تحته، لا رقم واحد.",
  loadTrace: "حِمل التدريب",
  loadTraceHint:
    "كل عمود هو حِمل يوم: الدقائق × الجهد (تقدير الجهد للحصة، Foster 2001). الخط هو نسبة الحاد إلى المزمن.",
  zones: {
    low: "حِمل منخفض",
    optimal: "تدرّج منتظم",
    caution: "تدرّج سريع",
    spike: "قفزة",
  } as Record<string, string>,
  acwrCaveat:
    "النسبة تنبّه إلى التغيرات المفاجئة ولا تتنبأ بالإصابة وحدها (Impellizzeri 2020). اقرأها مع مدربك.",
  recoveryTrace: "النوم والاسترجاع",
  sleepHours: "النوم (ساعات)",
  soreness: "الآلام العضلية",
  hrvMs: "تقلب النبض (ms)",
  restingHr: "نبض الراحة",
  noSessions: "لا حصص مسجلة بعد. سجّل أولها لبدء منحنى الحِمل.",
  noTelemetry:
    "أضف ساعات النوم أو الآلام أو تقلب النبض إلى تسجيلك لرسم هذا المنحنى.",
  recentSessions: "الحصص الأخيرة",
  delete: "حذف",
  sessionTitle: "سجّل حصة",
  sessionDesc:
    "بعد ثلاثين دقيقة من الحصة، قيّم صعوبة الحصة كاملة. الحِمل = الدقائق × الجهد.",
  date: "التاريخ",
  kind: "النوع",
  kinds: {
    training: "تدريب",
    match: "مباراة / سباق",
    strength: "تقوية عضلية",
    conditioning: "إعداد بدني",
    recovery: "استرجاع",
    mental: "إعداد ذهني",
    other: "آخر",
  } as Record<string, string>,
  duration: "المدة (دقيقة)",
  rpe: "الجهد (CR-10)",
  rpeAnchors: [
    "راحة",
    "سهل جدًا جدًا",
    "سهل",
    "متوسط",
    "صعب نوعًا ما",
    "صعب",
    "صعب",
    "صعب جدًا",
    "صعب جدًا",
    "صعب جدًا",
    "أقصى جهد",
  ],
  loadPreview: (n: number) => `الحِمل: ${n} و.ع`,
  notePh: "ملاحظة (اختياري)",
  save: "حفظ",
  saving: "جارٍ الحفظ…",
  saved: "تم الحفظ",
  saveFailed: "تعذّر الحفظ",
  cancel: "إلغاء",
  telemetryFields: "القياس عن بُعد (اختياري)",
  telemetryHint: "من ساعتك أو خاتمك الذكي، إن وُجد.",
  setupTitle: "ملف الأداء",
  setupIntro:
    "سمِّ الصفات التي تصنع الأداء في رياضتك، وقيّم أين أنت وأين يجب أن تكون (Butler & Hardy, 1992). أكبر الفجوات تصبح أولويات تطويرك.",
  quality: "الصفة",
  area: "المجال",
  areas: {
    mental: "ذهني",
    physical: "بدني",
    technical: "تقني",
    tactical: "تكتيكي",
  } as Record<string, string>,
  current: "الآن",
  ideal: "الهدف",
  addQuality: "أضف صفة",
  starter: "ابدأ من نموذج",
  starterSet: [
    ["التركيز تحت الضغط", "mental"],
    ["الثقة بالنفس", "mental"],
    ["التحكم الانفعالي", "mental"],
    ["النهوض بعد الخطأ", "mental"],
    ["الاسترجاع", "physical"],
    ["اتخاذ القرار", "tactical"],
    ["ثبات التقنية", "technical"],
  ] as [string, string][],
  saveSnapshot: "احفظ هذا الملف",
  snapshotSaved: "تم حفظ الملف. قارنه بعد بضعة أسابيع.",
  priorities: "أولويات التطوير",
  gap: (n: number) => `فجوة ${n}`,
  trainWith: "درّبها بـ",
  sinceLast: "منذ ملفك السابق",
  history: (n: number, d: string) => `${n} ملفات · آخرها في ${d}`,
  remove: "إزالة",
  raceTitle: "عطلة السباق",
  raceIntro:
    "خطط لكل منافسة كسباق: منطقة التنشيط المثلى، روتين مؤقت، خطط إذا-فإن لما قد يسوء، وكلمات مفتاحية. سجّل حالتك قبل الانطلاق وقيّم بعده.",
  plan: "خطة السباق",
  preRace: "فحص ما قبل الانطلاق",
  debrief: "التقييم",
  planEmpty: "لا خطة بعد",
  zoneTitle: "منطقة التنشيط (IZOF)",
  zoneHint:
    "من 1 إلى 10، أين تؤدي أفضل: هادئ (منخفض) أم متحمس جدًا (مرتفع)؟ فكّر في أفضل أداءاتك (Hanin).",
  zoneLow: "من",
  zoneHigh: "إلى",
  routineTitle: "الروتين",
  routineHint: "الدقائق قبل الانطلاق، وما تفعله.",
  minutesBefore: "دقيقة قبل",
  addStep: "أضف خطوة",
  routineTemplate: [
    [120, "الوصول، الاستقرار، موسيقى"],
    [60, "إحماء بدني"],
    [30, "تخيّل: الحركات الأولى"],
    [10, "تنفس 4-6، كلمات مفتاحية"],
    [1, "تركيز واحد: الحركة الأولى"],
  ] as [number, string][],
  ifThenTitle: "خطط إذا-فإن",
  ifThenHint:
    "قرر الآن ما ستفعله عندما يصعب الأمر (Gollwitzer, 1999). مثال: إذا أخطأت مبكرًا، فإني أزفر وأعيد التركيز على الحركة التالية.",
  ifPh: "إذا…",
  thenPh: "فإني…",
  addIfThen: "أضف إذا-فإن",
  cuesTitle: "كلمات مفتاحية",
  cuesPh: "مثال: انسيابية، هجوم، هنا",
  focusTitle: "هدف العملية",
  focusPh: "ما تتحكم فيه في هذه المنافسة",
  stateTitle: "كيف تشعر الآن؟",
  stateHint:
    "الشدة والاتجاه: نفس التوتر قد يساعد أو يعيق (Jones & Swain, 1992).",
  cognitive: "القلق",
  somatic: "توتر الجسم",
  confidence: "الثقة",
  activation: "التنشيط",
  direction: "هل تساعدك هذه الأحاسيس أم تعيقك؟",
  directionEnds: ["تعيق", "تساعد"] as [string, string],
  zoneRead: {
    below:
      "تحت منطقتك: ارفع التنشيط (إحماء ديناميكي، وضعية قوية، كلمات محفزة).",
    in: "داخل منطقتك. ابقَ مع روتينك.",
    above: "فوق منطقتك: خفّض التنشيط (زفير طويل 4-6، تمهّل، كلمة عملية).",
  } as Record<string, string>,
  directionRead: {
    facilitative: "تقرأ توترك كوقود: استعمله.",
    neutral: "محايد: دع الروتين يقوم بالعمل.",
    debilitative: "تقرأ توترك كتهديد: اعتبره استعداد الجسم، ثم تنفس.",
  } as Record<string, string>,
  debriefTitle: "مراجعة ما بعد الفعل",
  debriefFields: {
    planned: "ما الذي كان مخططًا؟",
    happened: "ماذا حدث فعلًا؟",
    why: "لماذا كان هناك فرق؟",
    keep: "ماذا أحتفظ به؟",
    change: "ماذا أغيّر في المرة القادمة؟",
  } as Record<string, string>,
  controllables: "هل نفّذت جيدًا ما أتحكم فيه؟ (1-10)",
  result: "النتيجة",
  rating: "الأداء (1-10)",
  savePlan: "حفظ",
  upcoming: "القادمة",
  past: "السابقة",
  days: (n: number) =>
    n === 0 ? "اليوم" : n > 0 ? `بعد ${n} أيام` : `منذ ${-n} أيام`,
  seasonTitle: "خطة الموسم",
  seasonIntro:
    "خطط للذهن مثل الجسد: ابنِ المهارات في الإعداد، اصقلها قبل المنافسات، واسترجع في الانتقال.",
  phaseKinds: {
    general_prep: "إعداد عام",
    specific_prep: "إعداد خاص",
    pre_competition: "ما قبل المنافسة",
    competition: "المنافسة",
    transition: "انتقال",
  } as Record<string, string>,
  phaseFocusHints: {
    general_prep: "تعلّم: التنفس، التخيّل، الحديث الذاتي",
    specific_prep: "طبّق تحت ضغط التدريب",
    pre_competition: "كرّر الروتين، حاكِ ظروف السباق",
    competition: "نفّذ، قيّم، وابقَ بسيطًا",
    transition: "استرجع، تأمّل، وأعد تحديد الأهداف",
  } as Record<string, string>,
  phaseName: "الاسم",
  phaseKind: "المرحلة",
  starts: "البداية",
  ends: "النهاية",
  phaseFocus: "الهدف الذهني",
  addPhase: "أضف مرحلة",
  noPhases: "لا مراحل بعد. ابدأ بكتلة التدريب القادمة.",
  todayMarker: "اليوم",
  simulatorTitle: "المحاكي",
  simulatorIntro:
    "درّب ذهنك بين السباقات: بروتوكولات موجهة، يومياتك، أهدافك، والمدرب الذكي.",
  crewTitle: "الفريق",
  crewIntro:
    "الأشخاص في ورشتك. شارك ما تختاره مع أخصائيك، اجتز التقييمات، ساهم في البحث، واطبع تقريرك.",
  disclaimer:
    "أدوات متابعة ذاتية للتدريب، وليست جهازًا طبيًا. في حال الألم أو المرض أو الضيق، استشر مختصًا.",
  signIn: "سجّل الدخول إلى مركز الأداء",
};

export type PerfCopy = Copy;

export function usePerfCopy() {
  const { locale } = useLocale();
  return locale === "ar" ? ar : locale === "en" ? en : fr;
}

export function fmtDay(c: PerfCopy, iso: string) {
  return new Date(
    iso.length === 10 ? `${iso}T12:00:00` : iso,
  ).toLocaleDateString(c.dateLocale, { day: "numeric", month: "short" });
}
