import type { LibResource } from "./types";

const WEINBERG =
  "Weinberg, R. S., & Gould, D. (2023). Foundations of Sport and Exercise Psychology (8th ed.). Human Kinetics.";

/** Mental preparation for athletes and performers. */
export const SPORT_RESOURCES: LibResource[] = [
  {
    slug: "sport-mental-prep",
    approach: "sport",
    format: "guide",
    topic: "sport",
    readMinutes: 8,
    ar: {
      title: "التحضير الذهني للرياضي: الأساسيات",
      summary:
        "الأهداف، الحوار الذاتي، التحكم في التنشيط، التخيل والروتين: المهارات الذهنية الخمس التي تُبنى بالتدريب.",
    },
    content: {
      fr: {
        title: "La préparation mentale du sportif : les bases",
        summary:
          "Objectifs, discours interne, gestion de l'activation, imagerie et routines : les cinq habiletés mentales qui se travaillent comme le physique.",
        sections: [
          {
            heading: "Le mental s'entraîne",
            body: [
              "Les habiletés mentales ne sont pas un don : elles s'apprennent et se renforcent par la répétition, comme la technique ou la condition physique. Elles s'intègrent à l'entraînement, pas seulement à la veille d'une compétition.",
            ],
          },
          {
            heading: "1. Se fixer des objectifs",
            bullets: [
              "Objectifs de résultat (gagner, se qualifier) : motivants mais peu contrôlables.",
              "Objectifs de performance (battre son temps, 80 % de réussite au tir) : comparés à soi-même.",
              "Objectifs de processus (« bras haut à l'attaque », « respiration avant le service ») : entièrement sous votre contrôle, ce sont eux qui guident l'attention en compétition.",
            ],
            tip: "Des objectifs précis et difficiles mais atteignables améliorent davantage la performance que « fais de ton mieux ».",
          },
          {
            heading: "2. Le discours interne",
            body: [
              "Ce que l'on se dit influence l'attention et l'émotion. Repérez vos phrases habituelles après une erreur, puis préparez des mots-clés courts : instructionnels (« pieds rapides », « reste bas ») ou motivationnels (« je suis prêt », « une balle à la fois »).",
            ],
          },
          {
            heading: "3. Gérer l'activation",
            body: [
              "Chaque athlète a une zone d'activation où il performe le mieux, ni trop calme ni trop tendu. Pour descendre : respiration lente avec expiration longue, relâchement musculaire. Pour monter : musique, mots-clés énergisants, échauffement plus vif.",
            ],
          },
          {
            heading: "4. L'imagerie",
            body: [
              "Se représenter mentalement un geste ou une situation, avec tous les sens, active des processus proches de l'exécution réelle. Voir la fiche « Script de visualisation ».",
            ],
          },
          {
            heading: "5. Les routines",
            body: [
              "Une routine de pré-performance stable (avant un lancer franc, un service, un départ) aide à se concentrer sur ce qui est contrôlable. Voir la fiche « La routine de pré-performance ».",
            ],
          },
          {
            heading: "Mon plan sur 4 semaines",
            table: {
              columns: [
                "Habileté",
                "Ce que je travaille",
                "Quand (séance, moment)",
                "Comment je sais que ça progresse",
              ],
              example: [
                "Discours interne",
                "Mot-clé « reset » après chaque erreur",
                "Tous les entraînements, matchs amicaux",
                "Je rejoue le point suivant sans ruminer",
              ],
              blankRows: 4,
            },
          },
        ],
      },
      en: {
        title: "Mental preparation for athletes: the basics",
        summary:
          "Goals, self-talk, arousal control, imagery and routines: the five mental skills you train like the physical ones.",
        sections: [
          {
            heading: "The mind can be trained",
            body: [
              "Mental skills are not a gift: they are learned and strengthened through repetition, like technique or fitness. They belong in training, not only the night before a competition.",
            ],
          },
          {
            heading: "1. Setting goals",
            bullets: [
              "Outcome goals (win, qualify): motivating but hard to control.",
              "Performance goals (beat your time, 80% shooting): compared with yourself.",
              "Process goals (“high elbow on the attack”, “breathe before serving”): fully under your control; they guide attention in competition.",
            ],
            tip: "Specific, hard but achievable goals improve performance more than “do your best”.",
          },
          {
            heading: "2. Self-talk",
            body: [
              "What you tell yourself shapes attention and emotion. Notice your usual phrases after a mistake, then prepare short cue words: instructional (“quick feet”, “stay low”) or motivational (“I'm ready”, “one ball at a time”).",
            ],
          },
          {
            heading: "3. Managing arousal",
            body: [
              "Every athlete has an arousal zone where they perform best, neither too flat nor too tense. To come down: slow breathing with a long out-breath, muscle release. To come up: music, energising cue words, a sharper warm-up.",
            ],
          },
          {
            heading: "4. Imagery",
            body: [
              "Mentally rehearsing a skill or situation with all the senses engages processes close to real execution. See the “Visualisation script” worksheet.",
            ],
          },
          {
            heading: "5. Routines",
            body: [
              "A stable pre-performance routine (before a free throw, a serve, a start) helps you focus on what you can control. See “The pre-performance routine”.",
            ],
          },
          {
            heading: "My 4-week plan",
            table: {
              columns: [
                "Skill",
                "What I'm working on",
                "When (session, moment)",
                "How I'll know it's improving",
              ],
              example: [
                "Self-talk",
                "Cue word “reset” after every mistake",
                "Every training, friendly matches",
                "I play the next point without dwelling",
              ],
              blankRows: 4,
            },
          },
        ],
      },
    },
    references: [
      WEINBERG,
      "Locke, E. A., & Latham, G. P. (2002). Building a practically useful theory of goal setting and task motivation. American Psychologist, 57(9), 705–717.",
      "Hatzigeorgiadis, A., Zourbanos, N., Galanis, E., & Theodorakis, Y. (2011). Self-talk and sports performance: a meta-analysis. Perspectives on Psychological Science, 6(4), 348–356.",
    ],
  },

  {
    slug: "pre-performance-routine",
    approach: "sport",
    format: "worksheet",
    topic: "sport",
    readMinutes: 5,
    ar: {
      title: "روتين ما قبل الأداء",
      summary:
        "صمّم سلسلة ثابتة من الأفعال والأفكار قبل كل حركة حاسمة لتثبيت التركيز.",
    },
    content: {
      fr: {
        title: "La routine de pré-performance",
        summary:
          "Construire une séquence stable de gestes et de pensées avant chaque geste clé, pour stabiliser l'attention.",
        sections: [
          {
            heading: "À quoi sert une routine",
            body: [
              "Avant un tir au but, un service ou un départ, l'esprit a le temps de douter. Une routine remplit ce temps avec des actions contrôlables, ramène l'attention sur la tâche et donne un repère stable quel que soit l'enjeu. Les études montrent qu'elle est associée à une meilleure performance, surtout sous pression.",
            ],
          },
          {
            heading: "Les quatre éléments",
            steps: [
              "Un geste physique d'ancrage (rebondir le ballon trois fois, ajuster ses gants).",
              "Une respiration (une inspiration, une expiration longue).",
              "Une image ou une intention courte (voir la trajectoire, « fluide »).",
              "Un mot-clé déclencheur, puis l'action.",
            ],
            tip: "Gardez-la courte (5 à 15 secondes) et pratiquez-la à chaque entraînement, pas seulement en match. Elle doit devenir automatique.",
          },
          {
            heading: "Ma routine",
            table: {
              columns: ["Étape", "Ce que je fais / pense", "Durée"],
              example: [
                "1. Ancrage",
                "Je fais rebondir le ballon deux fois en regardant le panier",
                "3 s",
              ],
              blankRows: 4,
            },
          },
          {
            heading: "Plan B",
            body: [
              "Prévoyez une version raccourcie pour les moments où vous êtes pressé (arbitre, chronomètre) : par exemple, seulement la respiration et le mot-clé.",
            ],
          },
        ],
      },
      en: {
        title: "The pre-performance routine",
        summary:
          "Build a stable sequence of actions and thoughts before each key skill, to steady your attention.",
        sections: [
          {
            heading: "What a routine is for",
            body: [
              "Before a penalty, a serve or a start, the mind has time to doubt. A routine fills that time with controllable actions, brings attention back to the task and gives a stable anchor whatever the stakes. Studies associate routines with better performance, especially under pressure.",
            ],
          },
          {
            heading: "The four elements",
            steps: [
              "A physical anchor (bounce the ball three times, adjust your gloves).",
              "A breath (one in-breath, one long out-breath).",
              "A short image or intention (see the trajectory, “smooth”).",
              "A trigger cue word, then go.",
            ],
            tip: "Keep it short (5 to 15 seconds) and practise it in every training session, not just in matches. It needs to become automatic.",
          },
          {
            heading: "My routine",
            table: {
              columns: ["Step", "What I do / think", "Duration"],
              example: [
                "1. Anchor",
                "I bounce the ball twice while looking at the basket",
                "3 s",
              ],
              blankRows: 4,
            },
          },
          {
            heading: "Plan B",
            body: [
              "Prepare a shortened version for when you are rushed (referee, shot clock): for example, just the breath and the cue word.",
            ],
          },
        ],
      },
    },
    references: [
      "Cotterill, S. (2010). Pre-performance routines in sport: current understanding and future directions. International Review of Sport and Exercise Psychology, 3(2), 132–153.",
      WEINBERG,
    ],
  },

  {
    slug: "visualization-script",
    approach: "sport",
    format: "worksheet",
    topic: "sport",
    readMinutes: 6,
    ar: {
      title: "نص تخيّل للهدوء والثقة",
      summary:
        "تخيّل منظم بكل الحواس (نموذج PETTLEP) للتحضير لمنافسة أو موقف صعب.",
    },
    content: {
      fr: {
        title: "Script de visualisation pour un calme confiant",
        summary:
          "Une imagerie structurée, avec tous les sens (modèle PETTLEP), pour se préparer à une compétition ou à une situation exigeante.",
        sections: [
          {
            heading: "Rendre l'imagerie efficace",
            body: [
              "L'imagerie est plus efficace quand elle ressemble à la réalité. Le modèle PETTLEP propose sept repères : Physique (même posture, même tenue), Environnement (le vrai lieu), Tâche (le vrai geste, à votre niveau), Timing (en temps réel), Learning (faire évoluer le script avec vos progrès), Émotion (ressentir l'émotion réelle) et Perspective (vue de l'intérieur ou de l'extérieur).",
            ],
          },
          {
            heading: "Le script (5 minutes)",
            steps: [
              "Installez-vous dans votre tenue, si possible sur le lieu ou en le regardant en photo. Trois respirations lentes.",
              "Voyez le lieu : la lumière, les couleurs, les tribunes. Entendez les bruits. Sentez le sol sous vos pieds.",
              "Remarquez le trac qui monte : cœur rapide, mains moites. Accueillez-le comme de l'énergie et faites votre routine.",
              "Exécutez en temps réel le geste ou la séquence clé, parfaitement, en sentant chaque mouvement.",
              "Imaginez un imprévu (erreur, coup de sifflet contesté) et votre réponse : mot-clé, respiration, retour au plan.",
              "Terminez sur la sensation d'avoir donné le meilleur. Ouvrez les yeux.",
            ],
            tip: "Quelques minutes, plusieurs fois par semaine, valent mieux qu'une longue séance la veille. Inclure un imprévu prépare à rebondir.",
          },
          {
            heading: "Mon script personnel",
            table: {
              columns: ["Repère", "Mes détails"],
              example: [
                "Environnement",
                "Salle du club, parquet clair, bruit des baskets, odeur de résine",
              ],
              blankRows: 6,
            },
          },
        ],
      },
      en: {
        title: "Visualisation script for calm confidence",
        summary:
          "Structured imagery using all the senses (the PETTLEP model) to prepare for a competition or a demanding situation.",
        sections: [
          {
            heading: "Making imagery work",
            body: [
              "Imagery works better when it resembles reality. The PETTLEP model offers seven anchors: Physical (same posture, same kit), Environment (the real venue), Task (the real skill, at your level), Timing (real time), Learning (update the script as you improve), Emotion (feel the real emotion) and Perspective (inside or outside view).",
            ],
          },
          {
            heading: "The script (5 minutes)",
            steps: [
              "Settle in your kit, ideally at the venue or looking at a photo of it. Three slow breaths.",
              "See the venue: the light, the colours, the stands. Hear the sounds. Feel the ground under your feet.",
              "Notice the nerves rising: fast heart, sweaty hands. Welcome them as energy and run your routine.",
              "Perform the key skill or sequence in real time, perfectly, feeling each movement.",
              "Imagine a setback (a mistake, a disputed call) and your response: cue word, breath, back to the plan.",
              "Finish on the feeling of having given your best. Open your eyes.",
            ],
            tip: "A few minutes several times a week beats one long session the night before. Including a setback prepares you to bounce back.",
          },
          {
            heading: "My personal script",
            table: {
              columns: ["Anchor", "My details"],
              example: [
                "Environment",
                "Club hall, light floor, squeak of shoes, smell of resin",
              ],
              blankRows: 6,
            },
          },
        ],
      },
    },
    references: [
      "Holmes, P. S., & Collins, D. J. (2001). The PETTLEP approach to motor imagery: a functional equivalence model for sport psychologists. Journal of Applied Sport Psychology, 13(1), 60–83.",
      "Simonsmeier, B. A., Andronie, M., Buecker, S., & Frank, C. (2021). The effects of imagery interventions in sports: a meta-analysis. International Review of Sport and Exercise Psychology, 14(1), 186–207.",
    ],
  },

  {
    slug: "post-event-debrief",
    approach: "sport",
    format: "worksheet",
    topic: "sport",
    readMinutes: 4,
    ar: {
      title: "مراجعة ما بعد المنافسة في 4 أسئلة",
      summary:
        "طريقة منظمة للتعلم من كل مباراة أو امتحان، دون جلد للذات ولا تجاهل للأخطاء.",
    },
    content: {
      fr: {
        title: "Le débrief d'après-événement en 4 questions",
        summary:
          "Une façon structurée d'apprendre de chaque match, examen ou présentation, sans s'accabler ni ignorer les erreurs.",
        sections: [
          {
            heading: "Quand le faire",
            body: [
              "Attendez que l'émotion retombe : quelques heures, ou le lendemain. Un débrief à chaud tourne vite au procès ou au déni. Faites-le après les victoires aussi : on apprend autant de ce qui a marché.",
            ],
          },
          {
            heading: "Les quatre questions",
            steps: [
              "Qu'est-ce qui s'est passé ? Les faits, comme un commentateur neutre.",
              "Qu'est-ce qui a bien fonctionné, et pourquoi ?",
              "Qu'est-ce que je ferais différemment, et qu'est-ce qui était sous mon contrôle ?",
              "Qu'est-ce que je retiens pour la prochaine fois : un seul point d'action concret.",
            ],
            tip: "Séparez ce qui dépendait de vous (préparation, choix, attitude) de ce qui n'en dépendait pas (arbitrage, météo, adversaire). Ne travaillez que sur le premier.",
          },
          {
            heading: "Mon débrief",
            table: {
              columns: [
                "Événement",
                "Ce qui a marché",
                "À changer (contrôlable)",
                "Mon point d'action",
              ],
              example: [
                "Demi-finale, défaite 2-1",
                "Pressing haut en 1re mi-temps",
                "J'ai arrêté de parler à la défense après le 1er but",
                "Mot-clé « voix » à chaque arrêt de jeu",
              ],
              blankRows: 4,
            },
          },
        ],
      },
      en: {
        title: "Post-event debrief in 4 questions",
        summary:
          "A structured way to learn from every match, exam or presentation, without beating yourself up or ignoring mistakes.",
        sections: [
          {
            heading: "When to do it",
            body: [
              "Wait for the emotion to settle: a few hours, or the next day. A debrief in the heat of the moment quickly becomes a trial or a denial. Do it after wins too: you learn as much from what worked.",
            ],
          },
          {
            heading: "The four questions",
            steps: [
              "What happened? The facts, like a neutral commentator.",
              "What went well, and why?",
              "What would I do differently, and what was under my control?",
              "What do I take into next time: one concrete action point.",
            ],
            tip: "Separate what depended on you (preparation, choices, attitude) from what didn't (refereeing, weather, opponent). Only work on the first.",
          },
          {
            heading: "My debrief",
            table: {
              columns: [
                "Event",
                "What worked",
                "To change (controllable)",
                "My action point",
              ],
              example: [
                "Semi-final, lost 2-1",
                "High press in the first half",
                "I stopped talking to the defence after the first goal",
                "Cue word “voice” at every stoppage",
              ],
              blankRows: 4,
            },
          },
        ],
      },
    },
    references: [
      "Gibbs, G. (1988). Learning by Doing: A Guide to Teaching and Learning Methods. Further Education Unit, Oxford Polytechnic.",
      WEINBERG,
    ],
  },
];
