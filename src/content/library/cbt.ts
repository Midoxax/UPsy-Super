import type { LibResource } from "./types";

const BECK =
  "Beck, J. S. (2021). Cognitive Behavior Therapy: Basics and Beyond (3rd ed.). Guilford Press.";
const GREENBERGER =
  "Greenberger, D., & Padesky, C. A. (2015). Mind Over Mood (2nd ed.). Guilford Press.";

export const CBT_RESOURCES: LibResource[] = [
  // ------------------------------------------------------------------ 1 ---
  {
    slug: "tcc-modele-cognitif",
    approach: "cbt",
    format: "guide",
    topic: "anxiety",
    readMinutes: 6,
    ar: {
      title: "النموذج المعرفي: الموقف والفكرة والانفعال والسلوك",
      summary:
        "أساس العلاج المعرفي السلوكي: ليس الموقف وحده ما يحدد ما نشعر به، بل طريقة قراءتنا له.",
    },
    content: {
      fr: {
        title: "Le modèle cognitif : situation, pensée, émotion, comportement",
        summary:
          "La base de la TCC : ce n'est pas la situation seule qui détermine ce que l'on ressent, mais la façon dont on l'interprète.",
        sections: [
          {
            heading: "L'idée centrale",
            body: [
              "Deux personnes vivent la même situation et ressentent des choses très différentes. La thérapie cognitive et comportementale (TCC) explique cet écart par la pensée qui s'intercale entre l'événement et la réaction : l'interprétation, souvent rapide et automatique, que l'on se fait de ce qui arrive.",
              "Un ami ne répond pas à votre message. Si vous pensez « il est occupé », vous restez serein. Si vous pensez « il m'en veut », vous ressentez de l'inquiétude, et vous risquez de l'éviter ensuite. La situation est la même ; la pensée change tout le reste.",
            ],
          },
          {
            heading: "Les quatre éléments et leurs liens",
            bullets: [
              "Situation : ce qui s'est passé, décrit comme le ferait une caméra (qui, quoi, où, quand).",
              "Pensées automatiques : les phrases ou images qui traversent l'esprit à ce moment-là.",
              "Émotions et sensations : ce que vous ressentez (tristesse, peur, colère, honte…) et dans le corps.",
              "Comportements : ce que vous faites ensuite, ou évitez de faire.",
            ],
            tip: "Les quatre éléments s'influencent dans les deux sens : un comportement d'évitement entretient la pensée qui l'a provoqué, ce qui renforce l'émotion la fois suivante. C'est le cercle vicieux que la TCC cherche à rompre.",
          },
          {
            heading:
              "Pensées automatiques, croyances intermédiaires, croyances centrales",
            body: [
              "Les pensées automatiques sont la couche la plus visible. En dessous se trouvent des règles et des suppositions (« si je ne réussis pas parfaitement, on me rejettera ») et, plus profond encore, des croyances centrales sur soi, les autres et le monde (« je ne suis pas à la hauteur »). La TCC travaille d'abord sur les pensées automatiques, puis remonte vers les croyances quand c'est utile.",
            ],
          },
          {
            heading: "Exercice : dessinez votre cercle",
            steps: [
              "Choisissez une situation récente qui vous a fait réagir fortement.",
              "Notez-la de façon factuelle, sans interprétation.",
              "Écrivez la pensée qui vous est venue, mot pour mot si possible.",
              "Nommez l'émotion et son intensité de 0 à 100.",
              "Décrivez ce que vous avez fait ensuite, et ce que cela a produit à court et à long terme.",
            ],
            table: {
              columns: [
                "Situation",
                "Pensée",
                "Émotion (0–100)",
                "Comportement",
                "Conséquence",
              ],
              example: [
                "Mon entraîneur ne me sélectionne pas samedi",
                "« Il ne croit plus en moi »",
                "Découragement 80",
                "Je m'entraîne à moitié",
                "Il me voit moins impliqué",
              ],
              blankRows: 3,
            },
          },
        ],
      },
      en: {
        title: "The cognitive model: situation, thought, emotion, behaviour",
        summary:
          "The foundation of CBT: it is not the situation alone that shapes how we feel, but how we read it.",
        sections: [
          {
            heading: "The core idea",
            body: [
              "Two people live through the same situation and feel very different things. Cognitive behavioural therapy (CBT) explains the gap with the thought that sits between the event and the reaction: the quick, often automatic interpretation we make of what happens.",
              'A friend doesn\'t reply to your message. If you think "he\'s busy", you stay calm. If you think "he\'s angry with me", you feel anxious, and you may avoid him afterwards. Same situation; the thought changes everything that follows.',
            ],
          },
          {
            heading: "The four elements and how they connect",
            bullets: [
              "Situation: what happened, described as a camera would (who, what, where, when).",
              "Automatic thoughts: the sentences or images that went through your mind at that moment.",
              "Emotions and sensations: what you felt (sadness, fear, anger, shame…) and where in the body.",
              "Behaviours: what you did next, or avoided doing.",
            ],
            tip: "The four elements influence each other both ways: avoidance keeps alive the thought that triggered it, which makes the emotion stronger next time. That is the vicious circle CBT aims to break.",
          },
          {
            heading: "Automatic thoughts, intermediate beliefs, core beliefs",
            body: [
              'Automatic thoughts are the most visible layer. Underneath are rules and assumptions ("if I don\'t succeed perfectly, I\'ll be rejected") and, deeper still, core beliefs about self, others and the world ("I\'m not good enough"). CBT first works on automatic thoughts, then moves to beliefs when it helps.',
            ],
          },
          {
            heading: "Exercise: draw your circle",
            steps: [
              "Pick a recent situation that triggered a strong reaction.",
              "Write it down factually, without interpretation.",
              "Write the thought that came to you, word for word if you can.",
              "Name the emotion and rate its intensity from 0 to 100.",
              "Describe what you did next, and what it led to in the short and long term.",
            ],
            table: {
              columns: [
                "Situation",
                "Thought",
                "Emotion (0–100)",
                "Behaviour",
                "Consequence",
              ],
              example: [
                "My coach leaves me out on Saturday",
                '"He no longer believes in me"',
                "Discouraged 80",
                "I train half-heartedly",
                "He sees me as less committed",
              ],
              blankRows: 3,
            },
          },
        ],
      },
    },
    references: [BECK, GREENBERGER],
  },

  // ------------------------------------------------------------------ 2 ---
  {
    slug: "tcc-tableau-des-pensees",
    approach: "cbt",
    format: "worksheet",
    topic: "anxiety",
    readMinutes: 8,
    ar: {
      title: "جدول تسجيل الأفكار (أعمدة بيك السبعة)",
      summary:
        "الأداة الأساسية لإعادة البناء المعرفي: التقاط فكرة مؤلمة، فحص الأدلة، وصياغة فكرة أكثر توازناً.",
    },
    content: {
      fr: {
        title: "Tableau d'enregistrement des pensées (7 colonnes de Beck)",
        summary:
          "L'outil central de la restructuration cognitive : capturer une pensée douloureuse, examiner les preuves, et formuler une pensée plus équilibrée.",
        sections: [
          {
            heading: "À quoi sert ce tableau",
            body: [
              "Il ne s'agit pas de « penser positif ». Le but est de vérifier si une pensée qui vous fait souffrir est exacte et complète. Souvent, elle contient une part de vrai mais en oublie une autre. Le tableau vous aide à remettre toutes les données sur la table, puis à trouver une pensée plus juste.",
              "Remplissez-le le jour même, idéalement juste après la situation, quand la pensée est encore fraîche. Les premières fois prennent 15 à 20 minutes ; avec l'habitude, cela devient un réflexe mental.",
            ],
          },
          {
            heading: "Les 7 colonnes",
            steps: [
              "Situation : où, quand, avec qui, ce qui s'est passé.",
              "Émotions : nommez-les et notez leur intensité (0–100).",
              "Pensée automatique : la plus « chaude », celle qui porte le plus d'émotion. Notez à quel point vous y croyez (0–100 %).",
              "Preuves qui soutiennent la pensée : des faits, pas des impressions.",
              "Preuves qui ne la soutiennent pas : ce qui contredit ou nuance la pensée.",
              "Pensée alternative équilibrée : une phrase qui tient compte des deux colonnes précédentes. Notez votre degré de croyance.",
              "Résultat : réévaluez l'émotion (0–100) et la croyance dans la pensée de départ.",
            ],
          },
          {
            heading: "Votre tableau",
            table: {
              columns: [
                "Situation",
                "Émotions (0–100)",
                "Pensée automatique (% croyance)",
                "Preuves pour",
                "Preuves contre",
                "Pensée équilibrée (% croyance)",
                "Résultat (0–100)",
              ],
              example: [
                "Réunion : mon chef critique mon rapport",
                "Honte 85, anxiété 70",
                "« Je suis incompétent, je vais être licencié » (90 %)",
                "Il a relevé trois erreurs",
                "Il m'a confié ce dossier ; l'an dernier mon évaluation était bonne ; il critique tout le monde en réunion",
                "« J'ai fait des erreurs corrigibles ; cela ne fait pas de moi quelqu'un d'incompétent » (70 %)",
                "Honte 40, anxiété 30 ; pensée de départ 35 %",
              ],
              blankRows: 3,
            },
          },
          {
            heading: "Pièges fréquents",
            bullets: [
              "Écrire une émotion à la place d'une pensée (« je me sens nul » est une pensée : « je suis nul »).",
              "Chercher une pensée alternative trop positive à laquelle vous ne croyez pas : elle n'aura aucun effet.",
              "Remplir les preuves « pour » avec des interprétations plutôt que des faits.",
            ],
            tip: "Si l'émotion ne baisse pas du tout, la pensée travaillée n'était peut-être pas la plus importante. Demandez-vous : « Et si c'était vrai, qu'est-ce que cela voudrait dire de moi ? » La réponse mène souvent à la vraie pensée chaude.",
          },
        ],
      },
      en: {
        title: "Thought record (Beck's 7 columns)",
        summary:
          "The core tool of cognitive restructuring: catch a painful thought, weigh the evidence, and find a more balanced one.",
        sections: [
          {
            heading: "What this record is for",
            body: [
              'This is not about "thinking positive". The aim is to check whether a thought that hurts is accurate and complete. Often it holds some truth but leaves something out. The record puts all the facts on the table, then helps you find a fairer thought.',
              "Fill it in the same day, ideally right after the situation, while the thought is still fresh. The first few take 15 to 20 minutes; with practice it becomes a mental habit.",
            ],
          },
          {
            heading: "The 7 columns",
            steps: [
              "Situation: where, when, with whom, what happened.",
              "Emotions: name them and rate their intensity (0–100).",
              'Automatic thought: the "hottest" one, carrying the most emotion. Rate how much you believe it (0–100%).',
              "Evidence for the thought: facts, not impressions.",
              "Evidence against it: what contradicts or qualifies the thought.",
              "Balanced alternative thought: one sentence that takes both evidence columns into account. Rate your belief in it.",
              "Outcome: re-rate the emotion (0–100) and your belief in the original thought.",
            ],
          },
          {
            heading: "Your record",
            table: {
              columns: [
                "Situation",
                "Emotions (0–100)",
                "Automatic thought (% belief)",
                "Evidence for",
                "Evidence against",
                "Balanced thought (% belief)",
                "Outcome (0–100)",
              ],
              example: [
                "Meeting: my manager criticises my report",
                "Shame 85, anxiety 70",
                "\"I'm incompetent, I'll be fired\" (90%)",
                "He pointed out three mistakes",
                "He gave me this project; my review last year was good; he criticises everyone in meetings",
                '"I made fixable mistakes; that doesn\'t make me incompetent" (70%)',
                "Shame 40, anxiety 30; original thought 35%",
              ],
              blankRows: 3,
            },
          },
          {
            heading: "Common pitfalls",
            bullets: [
              'Writing a feeling where a thought belongs ("I feel useless" is a thought: "I am useless").',
              "Picking an alternative so positive you don't believe it: it will have no effect.",
              'Filling the "for" column with interpretations instead of facts.',
            ],
            tip: 'If the emotion doesn\'t drop at all, you may not have worked on the most important thought. Ask: "If this were true, what would it say about me?" The answer often leads to the real hot thought.',
          },
        ],
      },
    },
    references: [BECK, GREENBERGER],
  },

  // ------------------------------------------------------------------ 3 ---
  {
    slug: "tcc-distorsions-cognitives",
    approach: "cbt",
    format: "guide",
    topic: "anxiety",
    readMinutes: 7,
    ar: {
      title: "التشوهات المعرفية: 12 فخاً في التفكير",
      summary:
        "تعلّم التعرف على الأخطاء الأكثر شيوعاً في التفكير لتمسك بها في اللحظة.",
    },
    content: {
      fr: {
        title: "Les distorsions cognitives : 12 pièges de la pensée",
        summary:
          "Apprendre à reconnaître les erreurs de raisonnement les plus fréquentes pour les repérer sur le moment.",
        sections: [
          {
            heading: "Pourquoi les nommer",
            body: [
              "Sous l'effet d'une émotion forte, l'esprit prend des raccourcis. Ces raccourcis sont humains, mais certains déforment la réalité de façon prévisible. Leur donner un nom permet de prendre une distance : « tiens, je suis en train de lire dans les pensées ». Ce simple repérage suffit souvent à baisser l'intensité.",
            ],
          },
          {
            heading: "Les 12 distorsions",
            bullets: [
              "Tout ou rien : voir les choses en noir ou blanc. « Si ce n'est pas parfait, c'est un échec. »",
              "Surgénéralisation : tirer une règle d'un seul événement. « Je rate toujours tout. »",
              "Filtre mental : ne retenir que le négatif d'une situation.",
              "Disqualification du positif : « Ça ne compte pas, c'était facile. »",
              "Lecture des pensées : supposer savoir ce que l'autre pense. « Il me trouve ridicule. »",
              "Erreur de prédiction : prédire le pire comme une certitude. « Je vais bloquer. »",
              "Catastrophisation : imaginer le scénario le plus grave et le juger insupportable.",
              "Minimisation / maximisation : grossir ses erreurs, réduire ses réussites.",
              "Raisonnement émotionnel : « Je me sens nul, donc je suis nul. »",
              "Les « je dois » : règles rigides pour soi ou les autres, source de culpabilité ou de colère.",
              "Étiquetage : se coller une étiquette globale (« je suis un raté ») au lieu de décrire un comportement.",
              "Personnalisation : se tenir responsable d'événements qui ne dépendent pas de soi.",
            ],
          },
          {
            heading: "Exercice : la semaine des pièges",
            steps: [
              "Pendant une semaine, notez chaque soir trois pensées qui vous ont dérangé.",
              "À côté de chacune, écrivez la ou les distorsions qu'elle contient.",
              "Repérez celles qui reviennent le plus : ce sont vos pièges favoris, ceux à surveiller en priorité.",
            ],
            table: {
              columns: ["Pensée", "Distorsion(s)", "Formulation plus juste"],
              example: [
                "« Personne ne viendra à ma présentation »",
                "Erreur de prédiction",
                "« Je ne sais pas combien viendront ; l'an dernier il y avait 15 personnes »",
              ],
              blankRows: 4,
            },
          },
        ],
      },
      en: {
        title: "Cognitive distortions: 12 thinking traps",
        summary:
          "Learn to recognise the most common reasoning errors so you can catch them in the moment.",
        sections: [
          {
            heading: "Why name them",
            body: [
              'Under strong emotion the mind takes shortcuts. They are human, but some distort reality in predictable ways. Naming them creates distance: "ah, I\'m mind-reading again". That alone often lowers the intensity.',
            ],
          },
          {
            heading: "The 12 distortions",
            bullets: [
              "All-or-nothing: seeing things in black and white. \"If it's not perfect, it's a failure.\"",
              'Overgeneralising: drawing a rule from a single event. "I always mess up."',
              "Mental filter: keeping only the negative part of a situation.",
              'Disqualifying the positive: "It doesn\'t count, it was easy."',
              'Mind-reading: assuming you know what others think. "He thinks I\'m ridiculous."',
              'Fortune-telling: predicting the worst as a certainty. "I\'ll freeze."',
              "Catastrophising: imagining the worst outcome and judging it unbearable.",
              "Magnifying / minimising: inflating mistakes, shrinking successes.",
              'Emotional reasoning: "I feel useless, so I am useless."',
              '"Should" statements: rigid rules for yourself or others, a source of guilt or anger.',
              'Labelling: sticking a global label on yourself ("I\'m a failure") instead of describing a behaviour.',
              "Personalising: holding yourself responsible for events outside your control.",
            ],
          },
          {
            heading: "Exercise: trap week",
            steps: [
              "For one week, each evening write down three thoughts that upset you.",
              "Next to each, write the distortion(s) it contains.",
              "Spot the ones that come back most: they are your favourite traps, the first ones to watch.",
            ],
            table: {
              columns: ["Thought", "Distortion(s)", "Fairer wording"],
              example: [
                '"Nobody will come to my talk"',
                "Fortune-telling",
                '"I don\'t know how many will come; last year 15 people did"',
              ],
              blankRows: 4,
            },
          },
        ],
      },
    },
    references: [
      BECK,
      "Burns, D. D. (1980). Feeling Good: The New Mood Therapy. William Morrow.",
    ],
  },

  // ------------------------------------------------------------------ 4 ---
  {
    slug: "tcc-questionnement-socratique",
    approach: "cbt",
    format: "worksheet",
    topic: "anxiety",
    readMinutes: 6,
    ar: {
      title: "الحوار السقراطي: أسئلة لاختبار فكرة",
      summary:
        "قائمة أسئلة تساعدك على فحص فكرة مزعجة بنفسك، بدل قبولها كحقيقة.",
    },
    content: {
      fr: {
        title:
          "Le questionnement socratique : des questions pour tester une pensée",
        summary:
          "Une liste de questions pour examiner vous-même une pensée dérangeante, au lieu de la prendre pour un fait.",
        sections: [
          {
            heading: "Le principe",
            body: [
              "Plutôt que de contredire une pensée, on l'interroge, comme un enquêteur curieux. Les questions ci-dessous viennent de la pratique de la TCC (Beck, Padesky). Il n'est pas nécessaire de toutes les poser : deux ou trois bien choisies suffisent souvent.",
            ],
          },
          {
            heading: "Les questions",
            bullets: [
              "Quelles sont les preuves que cette pensée est vraie ? Et qu'elle n'est pas entièrement vraie ?",
              "Y a-t-il une autre explication possible ?",
              "Quel est le pire qui pourrait arriver ? Le meilleur ? Le plus probable ?",
              "Si le pire arrivait, comment pourrais-je y faire face ?",
              "Que dirais-je à un ami qui aurait cette pensée ?",
              "Quel est l'effet de cette pensée sur moi ? Quel serait l'effet d'en changer ?",
              "Est-ce que je confonds une pensée avec un fait ? Une possibilité avec une certitude ?",
              "Dans un an, quelle importance aura cette situation ?",
            ],
          },
          {
            heading: "Fiche à remplir",
            table: {
              columns: [
                "Pensée examinée",
                "Question posée",
                "Réponse",
                "Ce que je retiens",
              ],
              example: [
                "« Si je rate ce match, ma saison est fichue »",
                "Le plus probable ?",
                "Un match raté sur vingt ; j'en ai déjà raté sans conséquences graves",
                "Un mauvais match est une information, pas un verdict",
              ],
              blankRows: 4,
            },
            tip: "Posez les questions à voix haute ou par écrit : la pensée perd de sa force quand elle sort de la tête.",
          },
        ],
      },
      en: {
        title: "Socratic questioning: questions to test a thought",
        summary:
          "A list of questions to examine an upsetting thought yourself, instead of taking it as fact.",
        sections: [
          {
            heading: "The principle",
            body: [
              "Rather than contradicting a thought, you question it, like a curious investigator. The questions below come from CBT practice (Beck, Padesky). You don't need all of them: two or three well-chosen ones are often enough.",
            ],
          },
          {
            heading: "The questions",
            bullets: [
              "What is the evidence this thought is true? That it is not entirely true?",
              "Is there another possible explanation?",
              "What is the worst that could happen? The best? The most likely?",
              "If the worst happened, how could I cope with it?",
              "What would I tell a friend who had this thought?",
              "What is the effect of believing this thought? What would changing it do?",
              "Am I confusing a thought with a fact? A possibility with a certainty?",
              "In a year, how much will this situation matter?",
            ],
          },
          {
            heading: "Worksheet",
            table: {
              columns: [
                "Thought examined",
                "Question asked",
                "Answer",
                "What I take away",
              ],
              example: [
                '"If I lose this match, my season is over"',
                "Most likely outcome?",
                "One bad match out of twenty; I've lost before without serious consequences",
                "A bad match is information, not a verdict",
              ],
              blankRows: 4,
            },
            tip: "Ask the questions out loud or in writing: a thought loses power once it leaves your head.",
          },
        ],
      },
    },
    references: [
      BECK,
      "Padesky, C. A. (1993). Socratic questioning: Changing minds or guiding discovery? Keynote, European Congress of Behavioural and Cognitive Therapies, London.",
    ],
  },

  // ------------------------------------------------------------------ 5 ---
  {
    slug: "tcc-activation-comportementale",
    approach: "cbt",
    format: "worksheet",
    topic: "depression",
    readMinutes: 8,
    ar: {
      title: "التنشيط السلوكي: العودة إلى الحركة لاستعادة المزاج",
      summary:
        "في الاكتئاب، ننتظر أن نشعر بتحسن لكي نتحرك. التنشيط السلوكي يعكس الترتيب.",
    },
    content: {
      fr: {
        title: "L'activation comportementale : agir pour retrouver l'élan",
        summary:
          "Dans la dépression, on attend d'aller mieux pour agir. L'activation comportementale inverse l'ordre.",
        sections: [
          {
            heading: "Le cercle de la dépression",
            body: [
              "Quand l'humeur baisse, on fait moins : on annule, on reste au lit, on se coupe des autres. À court terme cela soulage ; à long terme cela prive de tout ce qui donne du plaisir et un sentiment d'efficacité, et l'humeur baisse encore.",
              "L'activation comportementale (Martell, Jacobson) est l'une des approches les mieux validées contre la dépression. Son principe : programmer des activités choisies, en petites étapes, sans attendre la motivation. La motivation suit souvent l'action, rarement l'inverse.",
            ],
          },
          {
            heading: "Étape 1 : observer une semaine",
            body: [
              "Pendant 3 à 7 jours, notez ce que vous faites heure par heure, et donnez deux notes à chaque activité : le plaisir (P, 0–10) et la maîtrise ou le sentiment d'accomplissement (M, 0–10).",
            ],
            table: {
              columns: [
                "Heure",
                "Activité",
                "Plaisir (0–10)",
                "Maîtrise (0–10)",
                "Humeur (0–10)",
              ],
              example: ["10h–11h", "Marche avec ma sœur", "6", "4", "5"],
              blankRows: 6,
            },
          },
          {
            heading: "Étape 2 : choisir des activités selon vos valeurs",
            bullets: [
              "Relations : appeler un proche, partager un repas.",
              "Santé et corps : 15 minutes de marche, se coucher à heure fixe.",
              "Travail ou études : une tâche courte et concrète.",
              "Loisirs et plaisir : musique, sport, nature.",
              "Spiritualité ou sens : ce qui compte pour vous.",
            ],
            tip: "Commencez petit : « ranger un tiroir » plutôt que « ranger l'appartement ». Une activité réussie vaut mieux qu'un grand projet abandonné.",
          },
          {
            heading: "Étape 3 : planifier et faire",
            steps: [
              "Placez 1 à 3 activités par jour dans votre agenda, à une heure précise.",
              "Faites-les comme un rendez-vous, quelle que soit votre humeur.",
              "Notez ensuite le plaisir et la maîtrise réels.",
              "Comparez avec votre prédiction : souvent, c'était mieux que prévu.",
              "Augmentez progressivement la difficulté et le nombre d'activités.",
            ],
          },
        ],
      },
      en: {
        title: "Behavioural activation: act first to get going again",
        summary:
          "In depression we wait to feel better before acting. Behavioural activation reverses the order.",
        sections: [
          {
            heading: "The depression circle",
            body: [
              "When mood drops, we do less: we cancel, stay in bed, withdraw from others. In the short term it brings relief; in the long term it removes everything that brings pleasure and a sense of achievement, and mood drops further.",
              "Behavioural activation (Martell, Jacobson) is one of the best-supported treatments for depression. Its principle: schedule chosen activities, in small steps, without waiting for motivation. Motivation usually follows action, rarely the other way round.",
            ],
          },
          {
            heading: "Step 1: observe one week",
            body: [
              "For 3 to 7 days, write down what you do hour by hour and give each activity two ratings: pleasure (P, 0–10) and mastery or sense of achievement (M, 0–10).",
            ],
            table: {
              columns: [
                "Time",
                "Activity",
                "Pleasure (0–10)",
                "Mastery (0–10)",
                "Mood (0–10)",
              ],
              example: ["10–11 am", "Walk with my sister", "6", "4", "5"],
              blankRows: 6,
            },
          },
          {
            heading: "Step 2: choose activities by your values",
            bullets: [
              "Relationships: call someone close, share a meal.",
              "Health and body: a 15-minute walk, a fixed bedtime.",
              "Work or study: one short, concrete task.",
              "Leisure and pleasure: music, sport, nature.",
              "Meaning or spirituality: what matters to you.",
            ],
            tip: 'Start small: "tidy one drawer" rather than "tidy the flat". One completed activity beats a big abandoned project.',
          },
          {
            heading: "Step 3: plan and do",
            steps: [
              "Put 1 to 3 activities a day in your diary, at a set time.",
              "Do them like an appointment, whatever your mood.",
              "Afterwards, rate the actual pleasure and mastery.",
              "Compare with your prediction: it is often better than expected.",
              "Gradually increase the difficulty and number of activities.",
            ],
          },
        ],
      },
    },
    references: [
      "Martell, C. R., Dimidjian, S., & Herman-Dunn, R. (2022). Behavioral Activation for Depression (2nd ed.). Guilford Press.",
      "Ekers, D., et al. (2014). Behavioural activation for depression: an update of meta-analysis of effectiveness and sub-group analysis. PLoS One, 9(6), e100100.",
    ],
  },

  // ------------------------------------------------------------------ 6 ---
  {
    slug: "tcc-hierarchie-exposition",
    approach: "cbt",
    format: "worksheet",
    topic: "anxiety",
    readMinutes: 8,
    ar: {
      title: "سلّم التعرّض: مواجهة الخوف خطوة بخطوة",
      summary:
        "التجنب يغذي القلق. التعرّض المتدرج يعلّم الدماغ أن الموقف أقل خطراً مما يبدو.",
    },
    content: {
      fr: {
        title: "La hiérarchie d'exposition : affronter la peur pas à pas",
        summary:
          "L'évitement nourrit l'anxiété. L'exposition progressive apprend au cerveau que la situation est moins dangereuse qu'elle n'en a l'air.",
        sections: [
          {
            heading: "Pourquoi l'évitement entretient la peur",
            body: [
              "Chaque fois que l'on évite une situation redoutée, l'anxiété baisse immédiatement. Le cerveau en conclut que l'évitement nous a protégés, et la peur revient plus forte la fois suivante. L'exposition consiste à rester dans la situation assez longtemps, et assez souvent, pour que l'apprentissage inverse se fasse : « j'ai fait face, et ce que je craignais ne s'est pas produit, ou j'ai pu le gérer ».",
            ],
          },
          {
            heading: "Construire votre échelle",
            steps: [
              "Listez 10 à 15 situations liées à votre peur, des plus faciles aux plus difficiles.",
              "Notez pour chacune l'anxiété anticipée en unités subjectives de détresse (SUDS, 0–100).",
              "Classez-les par ordre croissant.",
              "Commencez par une situation autour de 30–40 SUDS : assez difficile pour apprendre, assez faisable pour réussir.",
            ],
            table: {
              columns: [
                "Situation",
                "SUDS prévu (0–100)",
                "SUDS au début",
                "SUDS à la fin",
                "Ce que j'ai appris",
              ],
              example: [
                "Poser une question en réunion d'équipe",
                "50",
                "60",
                "25",
                "Ma voix a tremblé, personne ne l'a relevé",
              ],
              blankRows: 8,
            },
          },
          {
            heading: "Les règles d'une exposition efficace",
            bullets: [
              "Répéter : plusieurs expositions rapprochées valent mieux qu'une seule héroïque.",
              "Rester jusqu'à ce que l'anxiété baisse nettement, ou jusqu'à ce que vous ayez testé votre prédiction.",
              "Abandonner les comportements de sécurité (éviter le regard, garder son téléphone en main…) : ils empêchent l'apprentissage.",
              "Avant chaque exposition, notez ce que vous craignez exactement ; après, ce qui s'est réellement passé.",
            ],
            tip: "Pour les peurs intenses (phobies sévères, traumatismes, TOC), l'exposition se fait avec un psychologue formé. Ne vous exposez pas seul à une situation réellement dangereuse.",
          },
        ],
      },
      en: {
        title: "Exposure hierarchy: facing fear step by step",
        summary:
          "Avoidance feeds anxiety. Graded exposure teaches the brain that the situation is less dangerous than it looks.",
        sections: [
          {
            heading: "Why avoidance keeps fear alive",
            body: [
              'Each time you avoid a feared situation, anxiety drops at once. The brain concludes that avoiding protected you, and the fear comes back stronger next time. Exposure means staying in the situation long enough, and often enough, for the opposite lesson to be learnt: "I faced it, and what I feared didn\'t happen, or I coped".',
            ],
          },
          {
            heading: "Building your ladder",
            steps: [
              "List 10 to 15 situations linked to your fear, from easiest to hardest.",
              "Rate the anticipated anxiety of each in subjective units of distress (SUDS, 0–100).",
              "Order them from lowest to highest.",
              "Start with a situation around 30–40 SUDS: hard enough to learn from, doable enough to succeed.",
            ],
            table: {
              columns: [
                "Situation",
                "Expected SUDS (0–100)",
                "SUDS at start",
                "SUDS at end",
                "What I learnt",
              ],
              example: [
                "Ask a question in a team meeting",
                "50",
                "60",
                "25",
                "My voice shook and nobody noticed",
              ],
              blankRows: 8,
            },
          },
          {
            heading: "Rules for effective exposure",
            bullets: [
              "Repeat: several close exposures beat one heroic attempt.",
              "Stay until anxiety clearly drops, or until you have tested your prediction.",
              "Drop safety behaviours (avoiding eye contact, holding your phone…): they block the learning.",
              "Before each exposure, write what exactly you fear; afterwards, what actually happened.",
            ],
            tip: "For intense fears (severe phobias, trauma, OCD), exposure is done with a trained psychologist. Never expose yourself alone to a situation that is genuinely dangerous.",
          },
        ],
      },
    },
    references: [
      "Craske, M. G., et al. (2014). Maximizing exposure therapy: An inhibitory learning approach. Behaviour Research and Therapy, 58, 10–23.",
      "Abramowitz, J. S., Deacon, B. J., & Whiteside, S. P. H. (2019). Exposure Therapy for Anxiety (2nd ed.). Guilford Press.",
    ],
  },

  // ------------------------------------------------------------------ 7 ---
  {
    slug: "tcc-resolution-de-problemes",
    approach: "cbt",
    format: "worksheet",
    topic: "stress",
    readMinutes: 6,
    ar: {
      title: "حل المشكلات في سبع خطوات",
      summary:
        "عندما يكون القلق مرتبطاً بمشكلة حقيقية، تساعد طريقة منظمة على الانتقال من الدوران في الحلقة إلى الفعل.",
    },
    content: {
      fr: {
        title: "La résolution de problèmes en 7 étapes",
        summary:
          "Quand l'inquiétude porte sur un vrai problème, une méthode structurée aide à passer de la rumination à l'action.",
        sections: [
          {
            heading: "Rumination ou problème à résoudre ?",
            body: [
              "Se demander « pourquoi est-ce que ça m'arrive ? » en boucle n'aide pas. Se demander « que puis-je faire maintenant ? » si. La résolution de problèmes (D'Zurilla et Nezu) transforme une préoccupation vague en un plan concret.",
            ],
          },
          {
            heading: "Les 7 étapes",
            steps: [
              "Définir le problème précisément, en termes concrets et observables.",
              "Fixer un objectif réaliste : à quoi verrez-vous que le problème est réglé ou amélioré ?",
              "Lister toutes les solutions possibles, sans les juger (remue-méninges).",
              "Évaluer chaque solution : avantages, inconvénients, faisabilité.",
              "Choisir une solution, ou une combinaison.",
              "Planifier : qui, quoi, quand, avec quelles ressources ; prévoir les obstacles.",
              "Agir, puis évaluer le résultat. Si ce n'est pas suffisant, revenir à l'étape 4.",
            ],
            table: {
              columns: [
                "Solution envisagée",
                "Avantages",
                "Inconvénients",
                "Faisabilité (0–10)",
              ],
              example: [
                "Demander à mon manager d'étaler les échéances",
                "Charge plus réaliste",
                "Peur de paraître moins capable",
                "7",
              ],
              blankRows: 5,
            },
          },
        ],
      },
      en: {
        title: "Problem solving in 7 steps",
        summary:
          "When worry is about a real problem, a structured method helps you move from rumination to action.",
        sections: [
          {
            heading: "Rumination or a problem to solve?",
            body: [
              'Asking "why is this happening to me?" on repeat doesn\'t help. Asking "what can I do now?" does. Problem solving (D\'Zurilla and Nezu) turns a vague worry into a concrete plan.',
            ],
          },
          {
            heading: "The 7 steps",
            steps: [
              "Define the problem precisely, in concrete and observable terms.",
              "Set a realistic goal: how will you know the problem is solved or better?",
              "List every possible solution without judging them (brainstorm).",
              "Weigh each solution: pros, cons, feasibility.",
              "Choose one solution, or a combination.",
              "Plan: who, what, when, with what resources; anticipate obstacles.",
              "Act, then review the result. If it isn't enough, go back to step 4.",
            ],
            table: {
              columns: [
                "Possible solution",
                "Pros",
                "Cons",
                "Feasibility (0–10)",
              ],
              example: [
                "Ask my manager to spread the deadlines",
                "More realistic workload",
                "Fear of looking less capable",
                "7",
              ],
              blankRows: 5,
            },
          },
        ],
      },
    },
    references: [
      "D'Zurilla, T. J., & Nezu, A. M. (2010). Problem-solving therapy. In K. S. Dobson (Ed.), Handbook of Cognitive-Behavioral Therapies (3rd ed.). Guilford Press.",
    ],
  },

  // ------------------------------------------------------------------ 8 ---
  {
    slug: "tcc-experiences-comportementales",
    approach: "cbt",
    format: "worksheet",
    topic: "anxiety",
    readMinutes: 6,
    ar: {
      title: "التجارب السلوكية: اختبار توقع في الواقع",
      summary:
        "أقوى طريقة لتغيير اعتقاد هي اختباره. صمّم تجربة صغيرة وقارن التوقع بما يحدث فعلاً.",
    },
    content: {
      fr: {
        title:
          "Les expériences comportementales : tester une prédiction en vrai",
        summary:
          "La façon la plus puissante de changer une croyance, c'est de la mettre à l'épreuve. Concevez une petite expérience et comparez la prédiction à ce qui arrive.",
        sections: [
          {
            heading: "Le principe",
            body: [
              "Une pensée comme « si je dis non, on va m'en vouloir » se discute, mais elle change surtout quand on la teste. L'expérience comportementale (Bennett-Levy et al.) traite la pensée comme une hypothèse scientifique : on prédit, on agit, on observe, on conclut.",
            ],
          },
          {
            heading: "Concevoir l'expérience",
            steps: [
              "Écrivez la pensée à tester et votre degré de croyance (0–100 %).",
              "Formulez une prédiction précise et observable : que va-t-il se passer exactement ?",
              "Choisissez l'expérience : quoi faire, quand, où, avec qui.",
              "Repérez les comportements de sécurité à abandonner pendant l'expérience.",
              "Faites l'expérience, puis notez ce qui s'est réellement passé.",
              "Concluez : que dit le résultat sur la pensée de départ ? Réévaluez votre croyance.",
            ],
            table: {
              columns: [
                "Pensée testée (%)",
                "Prédiction",
                "Expérience",
                "Résultat réel",
                "Conclusion (%)",
              ],
              example: [
                "« Si je refuse une demande, mon ami sera vexé » (80 %)",
                "Il va répondre sèchement et m'éviter",
                "Refuser poliment de l'aider samedi",
                "Il a dit « pas de souci, une autre fois »",
                "Dire non n'abîme pas forcément la relation (30 %)",
              ],
              blankRows: 3,
            },
          },
        ],
      },
      en: {
        title: "Behavioural experiments: test a prediction for real",
        summary:
          "The most powerful way to change a belief is to test it. Design a small experiment and compare your prediction with what happens.",
        sections: [
          {
            heading: "The principle",
            body: [
              'A thought like "if I say no, they\'ll be angry" can be discussed, but it changes most when it is tested. A behavioural experiment (Bennett-Levy et al.) treats the thought as a scientific hypothesis: predict, act, observe, conclude.',
            ],
          },
          {
            heading: "Designing the experiment",
            steps: [
              "Write the thought to test and how strongly you believe it (0–100%).",
              "Make a precise, observable prediction: what exactly will happen?",
              "Choose the experiment: what to do, when, where, with whom.",
              "Identify safety behaviours to drop during the experiment.",
              "Run the experiment, then write down what actually happened.",
              "Conclude: what does the result say about the original thought? Re-rate your belief.",
            ],
            table: {
              columns: [
                "Thought tested (%)",
                "Prediction",
                "Experiment",
                "Actual result",
                "Conclusion (%)",
              ],
              example: [
                '"If I turn down a request, my friend will be hurt" (80%)',
                "He'll reply coldly and avoid me",
                "Politely decline to help on Saturday",
                'He said "no problem, another time"',
                "Saying no doesn't necessarily damage the friendship (30%)",
              ],
              blankRows: 3,
            },
          },
        ],
      },
    },
    references: [
      "Bennett-Levy, J., et al. (2004). Oxford Guide to Behavioural Experiments in Cognitive Therapy. Oxford University Press.",
    ],
  },

  // ------------------------------------------------------------------ 9 ---
  {
    slug: "tcc-gerer-les-inquietudes",
    approach: "cbt",
    format: "worksheet",
    topic: "anxiety",
    readMinutes: 7,
    ar: {
      title: "إدارة القلق: وقت مخصص للقلق وشجرة القرار",
      summary:
        "تقنيتان مثبتتان لاحتواء القلق المفرط: حصره في وقت محدد، والتمييز بين ما يمكن فعله وما لا يمكن.",
    },
    content: {
      fr: {
        title:
          "Gérer les inquiétudes : le temps d'inquiétude et l'arbre de décision",
        summary:
          "Deux techniques validées pour contenir l'inquiétude excessive : la circonscrire dans un temps dédié, et distinguer ce sur quoi l'on peut agir.",
        sections: [
          {
            heading: "1. Le temps d'inquiétude",
            body: [
              "Les inquiétudes envahissantes semblent urgentes : elles exigent d'être pensées maintenant. Le report d'inquiétude (Borkovec) apprend au cerveau qu'elles peuvent attendre.",
            ],
            steps: [
              "Choisissez chaque jour un créneau fixe de 15 à 20 minutes, pas juste avant de dormir.",
              "Quand une inquiétude surgit en dehors de ce créneau, notez-la en deux mots et revenez à ce que vous faisiez.",
              "Pendant le créneau, reprenez la liste : réfléchissez à chaque point, ou constatez qu'il ne vous préoccupe plus.",
              "Le créneau terminé, arrêtez, même si tout n'est pas traité.",
            ],
          },
          {
            heading: "2. L'arbre de décision",
            steps: [
              "Quelle est mon inquiétude, précisément ?",
              "Est-ce un problème actuel, sur lequel je peux agir ? Ou une hypothèse sur un futur incertain (« et si… ») ?",
              "Si je peux agir : quoi, et quand ? Planifiez-le (voir la fiche de résolution de problèmes), puis lâchez la pensée.",
              "Si je ne peux pas agir maintenant : reconnaissez l'incertitude, et ramenez votre attention sur le présent (respiration, activité en cours).",
            ],
            table: {
              columns: [
                "Inquiétude",
                "Actuelle ou hypothétique ?",
                "Action possible",
                "Quand",
              ],
              example: [
                "« Et si je n'avais pas assez d'argent le mois prochain ? »",
                "En partie actuelle",
                "Faire un budget de 30 minutes",
                "Mardi 20h",
              ],
              blankRows: 5,
            },
            tip: "L'objectif n'est pas de ne plus jamais s'inquiéter, mais de ne plus laisser l'inquiétude décider de votre emploi du temps.",
          },
        ],
      },
      en: {
        title: "Managing worry: worry time and the decision tree",
        summary:
          "Two well-supported techniques to contain excessive worry: confine it to a set time, and separate what you can act on from what you can't.",
        sections: [
          {
            heading: "1. Worry time",
            body: [
              "Intrusive worries feel urgent: they demand to be thought about now. Worry postponement (Borkovec) teaches the brain that they can wait.",
            ],
            steps: [
              "Choose a fixed 15 to 20-minute slot each day, not right before bed.",
              "When a worry comes up outside the slot, jot it down in two words and return to what you were doing.",
              "During the slot, go through the list: think each item through, or notice it no longer bothers you.",
              "When the slot ends, stop, even if not everything is dealt with.",
            ],
          },
          {
            heading: "2. The decision tree",
            steps: [
              "What exactly am I worried about?",
              'Is it a current problem I can act on? Or a hypothesis about an uncertain future ("what if…")?',
              "If I can act: what, and when? Plan it (see the problem-solving sheet), then let the thought go.",
              "If I can't act now: acknowledge the uncertainty and bring your attention back to the present (breathing, what you are doing).",
            ],
            table: {
              columns: [
                "Worry",
                "Current or hypothetical?",
                "Possible action",
                "When",
              ],
              example: [
                '"What if I don\'t have enough money next month?"',
                "Partly current",
                "Do a 30-minute budget",
                "Tuesday 8 pm",
              ],
              blankRows: 5,
            },
            tip: "The goal is not to never worry again, but to stop letting worry run your schedule.",
          },
        ],
      },
    },
    references: [
      "Borkovec, T. D., Wilkinson, L., Folensbee, R., & Lerman, C. (1983). Stimulus control applications to the treatment of worry. Behaviour Research and Therapy, 21(3), 247–251.",
      "Butler, G., & Hope, T. (2007). Manage Your Mind (2nd ed.). Oxford University Press.",
    ],
  },

  // ----------------------------------------------------------------- 10 ---
  {
    slug: "tcc-sommeil-tcc-i",
    approach: "cbt",
    format: "guide",
    topic: "stress",
    readMinutes: 8,
    withTherapist: true,
    ar: {
      title: "مبادئ العلاج المعرفي السلوكي للأرق",
      summary:
        "العلاج الأول الموصى به للأرق المزمن: إعادة ربط السرير بالنوم وتنظيم الإيقاع.",
    },
    content: {
      fr: {
        title: "Les principes de la TCC de l'insomnie (TCC-I)",
        summary:
          "Le traitement de première intention recommandé pour l'insomnie chronique : réassocier le lit au sommeil et stabiliser le rythme.",
        sections: [
          {
            heading: "Pourquoi l'insomnie s'installe",
            body: [
              "Après quelques mauvaises nuits, on essaie de compenser : on se couche plus tôt, on reste au lit en espérant s'endormir, on fait des siestes. Le lit devient un lieu d'éveil et d'inquiétude, et le corps apprend à y être vigilant. La TCC-I, recommandée en première intention par les sociétés savantes, s'attaque à ces mécanismes.",
            ],
          },
          {
            heading: "Les composantes",
            bullets: [
              "Contrôle du stimulus : n'aller au lit que lorsque vous avez sommeil ; si vous ne dormez pas après environ 20 minutes, vous lever et faire une activité calme ailleurs, puis revenir quand le sommeil revient.",
              "Heure de lever fixe, tous les jours, week-end compris : c'est l'ancre de votre horloge biologique.",
              "Restriction du temps passé au lit : réduire temporairement le temps au lit au temps de sommeil réel, puis l'augmenter progressivement. Cette technique se fait avec un professionnel.",
              "Travail cognitif sur les pensées liées au sommeil (« si je ne dors pas 8 heures, demain sera une catastrophe »).",
              "Hygiène du sommeil : caféine avant 14h, écrans réduits le soir, chambre sombre et fraîche.",
            ],
            tip: "La restriction du temps au lit fatigue au début : elle est déconseillée sans suivi en cas de trouble bipolaire, d'épilepsie, de conduite professionnelle ou de travail posté.",
          },
          {
            heading: "Agenda du sommeil (2 semaines)",
            table: {
              columns: [
                "Date",
                "Heure du coucher",
                "Temps pour s'endormir",
                "Réveils (nombre/durée)",
                "Heure du lever",
                "Qualité (0–10)",
              ],
              example: ["Lun 3", "23h30", "45 min", "2 / 30 min", "7h00", "4"],
              blankRows: 7,
            },
          },
        ],
      },
      en: {
        title: "Principles of CBT for insomnia (CBT-I)",
        summary:
          "The first-line treatment recommended for chronic insomnia: re-link the bed with sleep and steady your rhythm.",
        sections: [
          {
            heading: "How insomnia takes hold",
            body: [
              "After a few bad nights, we try to compensate: going to bed earlier, staying in bed hoping to fall asleep, napping. The bed becomes a place of wakefulness and worry, and the body learns to be alert there. CBT-I, recommended as first-line treatment by sleep medicine societies, targets these mechanisms.",
            ],
          },
          {
            heading: "The components",
            bullets: [
              "Stimulus control: only go to bed when sleepy; if you aren't asleep after about 20 minutes, get up and do something calm elsewhere, and return when sleepiness comes back.",
              "A fixed wake-up time every day, weekends included: it anchors your body clock.",
              "Sleep restriction: temporarily limit time in bed to your actual sleep time, then extend it gradually. This is done with a professional.",
              'Cognitive work on sleep-related thoughts ("if I don\'t get 8 hours, tomorrow will be a disaster").',
              "Sleep hygiene: caffeine before 2 pm, fewer screens in the evening, a dark and cool bedroom.",
            ],
            tip: "Sleep restriction is tiring at first: it is not advised without supervision for bipolar disorder, epilepsy, professional driving or shift work.",
          },
          {
            heading: "Sleep diary (2 weeks)",
            table: {
              columns: [
                "Date",
                "Bedtime",
                "Time to fall asleep",
                "Awakenings (number/length)",
                "Wake-up time",
                "Quality (0–10)",
              ],
              example: [
                "Mon 3",
                "11:30 pm",
                "45 min",
                "2 / 30 min",
                "7:00 am",
                "4",
              ],
              blankRows: 7,
            },
          },
        ],
      },
    },
    references: [
      "Riemann, D., et al. (2017). European guideline for the diagnosis and treatment of insomnia. Journal of Sleep Research, 26(6), 675–700.",
      "Edinger, J. D., et al. (2021). Behavioral and psychological treatments for chronic insomnia disorder in adults: an AASM clinical practice guideline. Journal of Clinical Sleep Medicine, 17(2), 255–262.",
    ],
  },
];
