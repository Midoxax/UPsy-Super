import type { LibResource } from "./types";

const HAYES =
  "Hayes, S. C., Strosahl, K. D., & Wilson, K. G. (2012). Acceptance and Commitment Therapy: The Process and Practice of Mindful Change (2nd ed.). Guilford Press.";
const HARRIS = "Harris, R. (2019). ACT Made Simple (2nd ed.). New Harbinger.";
const LINEHAN =
  "Linehan, M. M. (2015). DBT Skills Training Manual (2nd ed.). Guilford Press.";
const GOTTMAN =
  "Gottman, J. M., & Silver, N. (2015). The Seven Principles for Making Marriage Work (rev. ed.). Harmony.";

/** Coping and relationship skills (ACT, DBT, compassion, everyday wellbeing). */
export const SKILLS_RESOURCES: LibResource[] = [
  {
    slug: "grounding-54321",
    approach: "wellbeing",
    format: "worksheet",
    topic: "anxiety",
    readMinutes: 3,
    ar: {
      title: "تمرين التأريض 5-4-3-2-1",
      summary:
        "تمرين حسّي بسيط يعيدك إلى اللحظة الحاضرة عند القلق الشديد أو نوبة الهلع.",
    },
    content: {
      fr: {
        title: "L'ancrage 5-4-3-2-1",
        summary:
          "Un exercice sensoriel simple pour revenir dans l'instant présent quand l'anxiété monte ou pendant une attaque de panique.",
        sections: [
          {
            heading: "Quand l'utiliser",
            body: [
              "Quand l'anxiété ou un souvenir pénible vous emporte, l'attention se fixe sur la menace et le corps s'emballe. L'ancrage ramène l'attention vers ce que perçoivent vos sens, ici et maintenant. Il ne fait pas disparaître l'émotion : il vous aide à la traverser sans vous y noyer.",
            ],
          },
          {
            heading: "Les cinq étapes",
            steps: [
              "Nommez 5 choses que vous voyez, à voix haute ou dans votre tête, avec un détail (« une tasse bleue, ébréchée »).",
              "Touchez 4 choses et décrivez leur texture ou leur température.",
              "Écoutez 3 sons, proches ou lointains.",
              "Repérez 2 odeurs (ou rappelez-vous deux odeurs que vous aimez).",
              "Notez 1 goût dans votre bouche, ou prenez une gorgée d'eau.",
            ],
            tip: "Finissez par une expiration lente et posez vos pieds bien à plat sur le sol. Si l'anxiété reste élevée, recommencez le tour une fois.",
          },
          {
            heading: "Mon suivi",
            table: {
              columns: [
                "Date",
                "Anxiété avant (0–10)",
                "Anxiété après (0–10)",
                "Ce qui a le plus aidé",
              ],
              example: [
                "Mardi, dans le tram",
                "8",
                "5",
                "Toucher la barre froide, compter les sons",
              ],
              blankRows: 4,
            },
          },
        ],
      },
      en: {
        title: "5-4-3-2-1 grounding",
        summary:
          "A simple sensory exercise to come back to the present moment when anxiety surges or during a panic attack.",
        sections: [
          {
            heading: "When to use it",
            body: [
              "When anxiety or a painful memory sweeps you away, attention locks onto the threat and the body races. Grounding brings attention back to what your senses perceive, here and now. It does not make the emotion disappear: it helps you ride it out without drowning in it.",
            ],
          },
          {
            heading: "The five steps",
            steps: [
              "Name 5 things you can see, aloud or silently, with one detail (“a blue mug, chipped”).",
              "Touch 4 things and describe their texture or temperature.",
              "Listen for 3 sounds, near or far.",
              "Notice 2 smells (or recall two smells you like).",
              "Notice 1 taste in your mouth, or take a sip of water.",
            ],
            tip: "Finish with a slow out-breath and your feet flat on the floor. If anxiety stays high, go round once more.",
          },
          {
            heading: "My log",
            table: {
              columns: [
                "Date",
                "Anxiety before (0–10)",
                "Anxiety after (0–10)",
                "What helped most",
              ],
              example: [
                "Tuesday, on the tram",
                "8",
                "5",
                "Touching the cold rail, counting sounds",
              ],
              blankRows: 4,
            },
          },
        ],
      },
    },
    references: [
      "Najavits, L. M. (2002). Seeking Safety: A Treatment Manual for PTSD and Substance Abuse. Guilford Press.",
      LINEHAN,
    ],
  },

  {
    slug: "box-breathing",
    approach: "wellbeing",
    format: "guide",
    topic: "stress",
    readMinutes: 3,
    ar: {
      title: "تنفس الصندوق في 60 ثانية",
      summary: "إيقاع تنفس منتظم (4-4-4-4) لتهدئة الجسم قبل موقف ضاغط أو بعده.",
    },
    content: {
      fr: {
        title: "La respiration carrée en 60 secondes",
        summary:
          "Un rythme respiratoire régulier (4-4-4-4) pour calmer le corps avant ou après une situation stressante.",
        sections: [
          {
            heading: "Pourquoi respirer lentement aide",
            body: [
              "Sous stress, la respiration devient rapide et haute. Ralentir volontairement le souffle, surtout l'expiration, active le système nerveux parasympathique, celui du repos. Des études récentes montrent que quelques minutes d'exercices respiratoires structurés par jour améliorent l'humeur et réduisent l'activation physiologique.",
            ],
          },
          {
            heading: "La technique",
            steps: [
              "Inspirez par le nez en comptant jusqu'à 4.",
              "Retenez doucement l'air, poumons pleins, en comptant jusqu'à 4.",
              "Expirez par la bouche en comptant jusqu'à 4.",
              "Restez poumons vides en comptant jusqu'à 4.",
              "Répétez 4 cycles (environ une minute).",
            ],
            tip: "Si retenir le souffle vous met mal à l'aise, supprimez les pauses et allongez l'expiration (inspirez 4, expirez 6). Arrêtez en cas de vertige.",
          },
          {
            heading: "Quand la pratiquer",
            bullets: [
              "Avant une prise de parole, un examen, une compétition.",
              "Après un conflit, pour redescendre avant de répondre.",
              "Le soir, pour préparer le sommeil.",
              "Tous les jours, à froid, pour que le geste devienne automatique le jour où vous en aurez besoin.",
            ],
          },
        ],
      },
      en: {
        title: "Box breathing in 60 seconds",
        summary:
          "A steady breathing rhythm (4-4-4-4) to calm the body before or after a stressful moment.",
        sections: [
          {
            heading: "Why slow breathing helps",
            body: [
              "Under stress, breathing gets fast and shallow. Deliberately slowing the breath, especially the out-breath, engages the parasympathetic nervous system, the one for rest. Recent studies show that a few minutes of structured breathing a day improves mood and lowers physiological arousal.",
            ],
          },
          {
            heading: "The technique",
            steps: [
              "Breathe in through the nose for a count of 4.",
              "Gently hold, lungs full, for a count of 4.",
              "Breathe out through the mouth for a count of 4.",
              "Stay empty for a count of 4.",
              "Repeat 4 cycles (about one minute).",
            ],
            tip: "If holding the breath feels uncomfortable, drop the pauses and lengthen the out-breath (in 4, out 6). Stop if you feel dizzy.",
          },
          {
            heading: "When to practise",
            bullets: [
              "Before a talk, an exam, a competition.",
              "After a conflict, to settle before replying.",
              "In the evening, to prepare for sleep.",
              "Every day, when calm, so the habit is automatic on the day you need it.",
            ],
          },
        ],
      },
    },
    references: [
      "Balban, M. Y., Neri, E., Kogon, M. M., et al. (2023). Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Reports Medicine, 4(1), 100895.",
      "Zaccaro, A., Piarulli, A., Laurino, M., et al. (2018). How breath-control can change your life: a systematic review on psycho-physiological correlates of slow breathing. Frontiers in Human Neuroscience, 12, 353.",
    ],
  },

  {
    slug: "cognitive-defusion",
    approach: "act",
    format: "guide",
    topic: "anxiety",
    readMinutes: 5,
    ar: {
      title: "فك الالتحام مع الأفكار القلقة",
      summary:
        "من العلاج بالقبول والالتزام: أن ترى أفكارك كأفكار، لا كحقائق أو أوامر.",
    },
    content: {
      fr: {
        title: "Se détacher des pensées anxieuses (défusion)",
        summary:
          "Issue de la thérapie d'acceptation et d'engagement (ACT) : voir ses pensées comme des pensées, et non comme des faits ou des ordres.",
        sections: [
          {
            heading: "Fusion et défusion",
            body: [
              "Quand on est « fusionné » avec une pensée, elle semble être la réalité : « je vais rater » devient une certitude qui dicte le comportement. La défusion ne cherche pas à changer le contenu de la pensée ni à la faire taire. Elle change la relation qu'on entretient avec elle : on la remarque, on la laisse être là, et on choisit quoi faire.",
              "C'est une différence avec la restructuration cognitive de la TCC : ici, on ne débat pas avec la pensée, on prend du recul par rapport à elle.",
            ],
          },
          {
            heading: "Quatre exercices",
            bullets: [
              "« J'ai la pensée que… » : ajoutez ce préfixe. « Je suis nul » devient « j'ai la pensée que je suis nul ».",
              "Nommer l'histoire : « Tiens, revoilà l'histoire du « je n'y arriverai jamais » ».",
              "Remercier son esprit : « Merci, mon esprit, de vouloir me protéger ».",
              "Les feuilles sur la rivière : imaginez chaque pensée posée sur une feuille qui passe sur l'eau, sans la retenir ni la pousser.",
            ],
            tip: "Le but n'est pas de se sentir mieux tout de suite, mais de retrouver la liberté d'agir selon ce qui compte pour vous, même avec la pensée présente.",
          },
          {
            heading: "Exercice",
            table: {
              columns: [
                "Pensée collante",
                "Version défusée",
                "Ce que je choisis de faire quand même",
              ],
              example: [
                "« Ils vont trouver ma présentation ennuyeuse »",
                "« Je remarque que j'ai la pensée qu'ils vont s'ennuyer »",
                "Je fais ma présentation et je regarde deux visages amicaux",
              ],
              blankRows: 3,
            },
          },
        ],
      },
      en: {
        title: "Defusing from anxious thoughts",
        summary:
          "From Acceptance and Commitment Therapy (ACT): seeing thoughts as thoughts, not as facts or orders.",
        sections: [
          {
            heading: "Fusion and defusion",
            body: [
              "When we are “fused” with a thought, it feels like reality: “I'm going to fail” becomes a certainty that drives behaviour. Defusion does not try to change the thought's content or silence it. It changes our relationship with it: we notice it, let it be there, and choose what to do.",
              "This differs from CBT's cognitive restructuring: here we do not argue with the thought, we step back from it.",
            ],
          },
          {
            heading: "Four exercises",
            bullets: [
              "“I'm having the thought that…”: add this prefix. “I'm useless” becomes “I'm having the thought that I'm useless.”",
              "Name the story: “Ah, here's the ‘I'll never manage’ story again.”",
              "Thank your mind: “Thanks, mind, for trying to protect me.”",
              "Leaves on a stream: picture each thought on a leaf drifting by on the water, without holding or pushing it.",
            ],
            tip: "The aim is not to feel better straight away, but to regain the freedom to act on what matters to you, even with the thought present.",
          },
          {
            heading: "Exercise",
            table: {
              columns: [
                "Sticky thought",
                "Defused version",
                "What I choose to do anyway",
              ],
              example: [
                "“They'll find my presentation boring”",
                "“I notice I'm having the thought they'll be bored”",
                "I give the presentation and look at two friendly faces",
              ],
              blankRows: 3,
            },
          },
        ],
      },
    },
    references: [HAYES, HARRIS],
  },

  {
    slug: "values-compass",
    approach: "act",
    format: "worksheet",
    topic: "self-esteem",
    readMinutes: 6,
    ar: {
      title: "بوصلة القيم",
      summary:
        "حدّد ما يهمك حقاً في مجالات حياتك، واختر خطوة صغيرة في اتجاهه هذا الأسبوع.",
    },
    content: {
      fr: {
        title: "Ma boussole de valeurs",
        summary:
          "Clarifier ce qui compte vraiment pour vous dans chaque domaine de vie, et choisir un petit pas dans cette direction cette semaine.",
        sections: [
          {
            heading: "Valeurs et objectifs",
            body: [
              "Un objectif s'atteint et se coche (« courir un 10 km »). Une valeur est une direction qu'on ne finit jamais d'atteindre (« prendre soin de mon corps »). En ACT, les valeurs servent de boussole : quand l'anxiété ou la tristesse poussent à éviter, elles rappellent pourquoi cela vaut la peine d'avancer.",
            ],
          },
          {
            heading: "Comment remplir",
            steps: [
              "Pour chaque domaine, écrivez en une phrase la personne que vous voulez être (pas ce que vous voulez obtenir).",
              "Notez de 0 à 10 l'importance de ce domaine pour vous.",
              "Notez de 0 à 10 à quel point vos actions récentes vont dans ce sens.",
              "Choisissez un domaine où l'écart est grand et définissez un petit pas concret pour cette semaine.",
            ],
          },
          {
            heading: "Ma boussole",
            table: {
              columns: [
                "Domaine",
                "Ma valeur",
                "Importance (0–10)",
                "Cohérence (0–10)",
                "Petit pas cette semaine",
              ],
              example: [
                "Amitiés",
                "Être un ami présent et fiable",
                "9",
                "4",
                "Appeler Karim jeudi",
              ],
              blankRows: 8,
            },
            bullets: [
              "Famille",
              "Couple / intimité",
              "Amitiés et vie sociale",
              "Travail / études / sport",
              "Santé et corps",
              "Loisirs et créativité",
              "Spiritualité / sens",
              "Engagement dans la communauté",
            ],
            tip: "Les valeurs sont personnelles : il n'y a pas de bonne réponse. Si vous écrivez « je devrais… », demandez-vous si c'est votre valeur ou celle de quelqu'un d'autre.",
          },
        ],
      },
      en: {
        title: "My values compass",
        summary:
          "Clarify what truly matters to you in each area of life, and choose one small step in that direction this week.",
        sections: [
          {
            heading: "Values and goals",
            body: [
              "A goal can be reached and ticked off (“run a 10K”). A value is a direction you never finish travelling (“look after my body”). In ACT, values act as a compass: when anxiety or sadness push you to avoid, they remind you why moving forward is worth it.",
            ],
          },
          {
            heading: "How to fill it in",
            steps: [
              "For each area, write in one sentence the person you want to be (not what you want to get).",
              "Rate from 0 to 10 how important that area is to you.",
              "Rate from 0 to 10 how far your recent actions match it.",
              "Pick an area with a big gap and define one small, concrete step for this week.",
            ],
          },
          {
            heading: "My compass",
            table: {
              columns: [
                "Area",
                "My value",
                "Importance (0–10)",
                "Consistency (0–10)",
                "Small step this week",
              ],
              example: [
                "Friendships",
                "Be a present, reliable friend",
                "9",
                "4",
                "Call Karim on Thursday",
              ],
              blankRows: 8,
            },
            bullets: [
              "Family",
              "Partner / intimacy",
              "Friendships and social life",
              "Work / study / sport",
              "Health and body",
              "Leisure and creativity",
              "Spirituality / meaning",
              "Community involvement",
            ],
            tip: "Values are personal: there is no right answer. If you write “I should…”, ask whether it is your value or someone else's.",
          },
        ],
      },
    },
    references: [HAYES, HARRIS],
  },

  {
    slug: "self-compassion-break",
    approach: "compassion",
    format: "guide",
    topic: "self-esteem",
    readMinutes: 4,
    ar: {
      title: "استراحة التعاطف مع الذات في 3 خطوات",
      summary: "طريقة قصيرة للرد على لحظة صعبة بلطف بدل النقد الذاتي القاسي.",
    },
    content: {
      fr: {
        title: "La pause d'auto-compassion en 3 étapes",
        summary:
          "Une façon brève de répondre à un moment difficile avec bienveillance plutôt qu'avec une autocritique sévère.",
        sections: [
          {
            heading: "Pourquoi l'auto-compassion",
            body: [
              "Beaucoup pensent que l'autocritique motive. Les recherches de Kristin Neff et d'autres montrent plutôt l'inverse : l'auto-compassion est associée à moins d'anxiété et de dépression, et à plus de persévérance après un échec. Il ne s'agit pas de s'excuser de tout, mais de se traiter comme on traiterait un ami qui traverse la même chose.",
            ],
          },
          {
            heading: "Les trois étapes",
            steps: [
              "Pleine conscience : reconnaître la souffrance. « C'est un moment difficile. » « Ça fait mal. »",
              "Humanité commune : se rappeler qu'on n'est pas seul. « La souffrance fait partie de la vie. » « D'autres ressentent cela aussi. »",
              "Bienveillance envers soi : poser une main sur le cœur ou un autre geste apaisant, et se dire : « Que puis-je m'offrir maintenant ? » « Puis-je être doux avec moi-même. »",
            ],
            tip: "Trouvez vos propres mots : ceux qui sonnent juste pour vous, dans votre langue. Une phrase en darija peut toucher davantage qu'une formule traduite.",
          },
          {
            heading: "Exercice : la lettre de l'ami",
            steps: [
              "Pensez à quelque chose que vous vous reprochez.",
              "Imaginez un ami très bienveillant qui connaît toutes vos qualités et vos limites.",
              "Écrivez-vous une courte lettre de sa part, sur ce sujet.",
              "Relisez-la le lendemain.",
            ],
          },
        ],
      },
      en: {
        title: "The 3-step self-compassion break",
        summary:
          "A brief way to meet a hard moment with kindness instead of harsh self-criticism.",
        sections: [
          {
            heading: "Why self-compassion",
            body: [
              "Many believe self-criticism is motivating. Research by Kristin Neff and others suggests the opposite: self-compassion goes with less anxiety and depression, and more persistence after failure. It is not about excusing everything, but treating yourself as you would a friend going through the same thing.",
            ],
          },
          {
            heading: "The three steps",
            steps: [
              "Mindfulness: acknowledge the suffering. “This is a moment of difficulty.” “This hurts.”",
              "Common humanity: remember you are not alone. “Suffering is part of life.” “Others feel this too.”",
              "Self-kindness: place a hand on your heart or make another soothing gesture, and ask: “What can I offer myself right now?” “May I be gentle with myself.”",
            ],
            tip: "Find your own words: the ones that ring true for you, in your language. A phrase in Darija may land better than a translated formula.",
          },
          {
            heading: "Exercise: the friend's letter",
            steps: [
              "Think of something you blame yourself for.",
              "Imagine a deeply kind friend who knows all your strengths and limits.",
              "Write yourself a short letter from them about it.",
              "Read it again the next day.",
            ],
          },
        ],
      },
    },
    references: [
      "Neff, K. (2011). Self-Compassion: The Proven Power of Being Kind to Yourself. William Morrow.",
      "Neff, K. D., & Germer, C. K. (2013). A pilot study and randomized controlled trial of the Mindful Self-Compassion program. Journal of Clinical Psychology, 69(1), 28–44.",
      "MacBeth, A., & Gumley, A. (2012). Exploring compassion: a meta-analysis of the association between self-compassion and psychopathology. Clinical Psychology Review, 32(6), 545–552.",
    ],
  },

  {
    slug: "dear-man-script",
    approach: "dbt",
    format: "worksheet",
    topic: "relationships",
    readMinutes: 5,
    ar: {
      title: "DEAR MAN: كيف تطلب ما تحتاجه",
      summary:
        "مهارة من العلاج الجدلي السلوكي لصياغة طلب واضح أو رفض محترم دون عدوانية.",
    },
    content: {
      fr: {
        title: "DEAR MAN : demander ce dont on a besoin",
        summary:
          "Une compétence de la thérapie comportementale dialectique (TCD/DBT) pour formuler une demande claire ou un refus respectueux, sans agressivité.",
        sections: [
          {
            heading: "Les sept lettres",
            bullets: [
              "D — Décrire les faits, sans jugement : « Cette semaine, tu es rentré trois fois après 22 h sans prévenir. »",
              "E — Exprimer ce que vous ressentez : « Je m'inquiète et je me sens mise de côté. »",
              "A — Affirmer clairement votre demande : « J'aimerais que tu m'envoies un message quand tu seras en retard. »",
              "R — Renforcer : dire ce que l'autre y gagne. « Je serai plus détendue et la soirée commencera mieux. »",
              "M — Rester Mindful : revenir à votre demande si la conversation dérive (technique du disque rayé).",
              "A — Avoir l'air assuré : ton calme, contact visuel, pas d'excuses à répétition.",
              "N — Négocier : être prêt à trouver un compromis. « Un message avant 21 h, ça te va ? »",
            ],
          },
          {
            heading: "Préparer ma demande",
            table: {
              columns: ["Lettre", "Ce que je vais dire"],
              example: [
                "D — Décrire",
                "« Le planning a changé trois fois ce mois-ci sans réunion. »",
              ],
              blankRows: 7,
            },
            tip: "Avant la conversation, clarifiez votre priorité : obtenir ce que vous demandez, préserver la relation, ou garder le respect de vous-même. Elle guide le ton à adopter.",
          },
        ],
      },
      en: {
        title: "DEAR MAN: asking for what you need",
        summary:
          "A Dialectical Behaviour Therapy (DBT) skill for making a clear request or a respectful refusal, without aggression.",
        sections: [
          {
            heading: "The seven letters",
            bullets: [
              "D — Describe the facts, without judgement: “This week you came home after 10 pm three times without telling me.”",
              "E — Express how you feel: “I worry and I feel left out.”",
              "A — Assert your request clearly: “I'd like you to text me when you'll be late.”",
              "R — Reinforce: say what the other person gains. “I'll be more relaxed and the evening will start better.”",
              "M — stay Mindful: return to your request if the conversation drifts (the broken-record technique).",
              "A — Appear confident: calm tone, eye contact, no repeated apologies.",
              "N — Negotiate: be ready to compromise. “A text before 9 pm, would that work?”",
            ],
          },
          {
            heading: "Prepare my request",
            table: {
              columns: ["Letter", "What I will say"],
              example: [
                "D — Describe",
                "“The rota has changed three times this month without a meeting.”",
              ],
              blankRows: 7,
            },
            tip: "Before the conversation, decide your priority: getting what you ask for, keeping the relationship, or keeping your self-respect. It guides the tone to take.",
          },
        ],
      },
    },
    references: [LINEHAN],
  },

  {
    slug: "boundary-scripts",
    approach: "dbt",
    format: "guide",
    topic: "relationships",
    readMinutes: 5,
    ar: {
      title: "خمس عبارات لوضع الحدود",
      summary:
        "صيغ جاهزة لقول لا، طلب وقت، أو إيقاف كلام جارح، مع الحفاظ على العلاقة.",
    },
    content: {
      fr: {
        title: "5 phrases pour poser ses limites",
        summary:
          "Des formulations prêtes à l'emploi pour dire non, demander du temps ou arrêter une remarque blessante, tout en préservant la relation.",
        sections: [
          {
            heading: "Ce qu'est une limite",
            body: [
              "Une limite dit ce que vous allez faire, pas ce que l'autre doit faire. « Je raccrocherai si on me crie dessus » est une limite ; « arrête de crier » est une demande. Les deux sont utiles, mais seule la limite dépend entièrement de vous.",
            ],
          },
          {
            heading: "Cinq phrases",
            steps: [
              "Dire non sans se justifier : « Merci d'avoir pensé à moi, mais je ne pourrai pas cette fois. »",
              "Demander du temps : « Je ne veux pas répondre à chaud. Je te redis demain. »",
              "Arrêter une remarque : « Je ne vais pas continuer la conversation sur ce ton. On en reparle quand on sera calmes. »",
              "Protéger son temps : « Je suis disponible jusqu'à 18 h ; après, je ne réponds plus aux messages de travail. »",
              "Refuser un sujet : « Je préfère ne pas parler de mon poids. Parlons d'autre chose. »",
            ],
            tip: "Dites la phrase une fois, calmement, puis tenez-la par vos actes. La culpabilité qui suit est normale : elle ne signifie pas que vous avez eu tort.",
          },
          {
            heading: "Rester bienveillant (GIVE)",
            bullets: [
              "G — Gentle : pas d'attaque, de menace ni de jugement.",
              "I — Intéressé : écoutez le point de vue de l'autre.",
              "V — Valider : « Je comprends que ce soit décevant pour toi. »",
              "E — Easy manner : un ton léger, un sourire si c'est approprié.",
            ],
          },
        ],
      },
      en: {
        title: "5 boundary scripts",
        summary:
          "Ready-made phrasings to say no, ask for time or stop a hurtful remark, while protecting the relationship.",
        sections: [
          {
            heading: "What a boundary is",
            body: [
              "A boundary says what you will do, not what the other person must do. “I'll hang up if I'm shouted at” is a boundary; “stop shouting” is a request. Both are useful, but only the boundary depends entirely on you.",
            ],
          },
          {
            heading: "Five scripts",
            steps: [
              "Say no without justifying: “Thanks for thinking of me, but I can't this time.”",
              "Ask for time: “I don't want to answer in the heat of the moment. I'll get back to you tomorrow.”",
              "Stop a remark: “I'm not going to continue the conversation in this tone. Let's talk when we're calm.”",
              "Protect your time: “I'm available until 6 pm; after that I don't answer work messages.”",
              "Decline a topic: “I'd rather not talk about my weight. Let's talk about something else.”",
            ],
            tip: "Say it once, calmly, then hold it with your actions. The guilt that follows is normal: it does not mean you were wrong.",
          },
          {
            heading: "Stay kind (GIVE)",
            bullets: [
              "G — Gentle: no attacks, threats or judgement.",
              "I — Interested: listen to the other person's view.",
              "V — Validate: “I understand that's disappointing for you.”",
              "E — Easy manner: a light tone, a smile if it fits.",
            ],
          },
        ],
      },
    },
    references: [LINEHAN],
  },

  {
    slug: "i-statements",
    approach: "wellbeing",
    format: "guide",
    topic: "relationships",
    readMinutes: 4,
    ar: {
      title: 'عبارات "أنا" التي تصل',
      summary: "كيف تعبّر عن انزعاجك دون أن يشعر الطرف الآخر بالهجوم.",
    },
    content: {
      fr: {
        title: "Les messages « je » qui passent",
        summary:
          "Exprimer un mécontentement sans que l'autre se sente attaqué.",
        sections: [
          {
            heading: "« Tu » accuse, « je » informe",
            body: [
              "« Tu ne m'écoutes jamais » met l'autre sur la défensive : il va se justifier plutôt qu'entendre. « Je me sens seul quand je parle et que tu regardes ton téléphone » décrit votre expérience : il est plus difficile de la contester, et plus facile d'y répondre.",
            ],
          },
          {
            heading: "La formule",
            steps: [
              "Quand… (un fait précis, observable)",
              "je me sens… (une émotion, pas une opinion déguisée : « je me sens trahi » cache souvent « tu m'as trahi »)",
              "parce que… (le besoin ou la valeur en jeu)",
              "et j'aimerais… (une demande concrète et faisable)",
            ],
            tip: "Évitez « toujours » et « jamais » : ils transforment un fait en procès.",
          },
          {
            heading: "À vous",
            table: {
              columns: ["Message « tu » d'origine", "Message « je »"],
              example: [
                "« Tu laisses toujours tout traîner »",
                "« Quand je rentre et que la cuisine n'est pas rangée, je me sens épuisée, parce que j'ai besoin de souffler. J'aimerais qu'on se répartisse les soirs. »",
              ],
              blankRows: 3,
            },
          },
        ],
      },
      en: {
        title: "I-statements that land",
        summary:
          "Voicing a complaint without the other person feeling attacked.",
        sections: [
          {
            heading: "“You” accuses, “I” informs",
            body: [
              "“You never listen to me” puts the other person on the defensive: they will justify themselves rather than hear you. “I feel alone when I'm talking and you're looking at your phone” describes your experience: it is harder to dispute and easier to respond to.",
            ],
          },
          {
            heading: "The formula",
            steps: [
              "When… (a specific, observable fact)",
              "I feel… (an emotion, not a disguised opinion: “I feel betrayed” often hides “you betrayed me”)",
              "because… (the need or value at stake)",
              "and I'd like… (a concrete, doable request)",
            ],
            tip: "Avoid “always” and “never”: they turn a fact into a trial.",
          },
          {
            heading: "Your turn",
            table: {
              columns: ["Original “you” message", "“I” message"],
              example: [
                "“You always leave everything lying around”",
                "“When I get home and the kitchen isn't tidy, I feel exhausted, because I need to unwind. I'd like us to split the evenings.”",
              ],
              blankRows: 3,
            },
          },
        ],
      },
    },
    references: [
      "Gordon, T. (1970). Parent Effectiveness Training. Wyden.",
      "Rosenberg, M. B. (2015). Nonviolent Communication: A Language of Life (3rd ed.). PuddleDancer Press.",
      GOTTMAN,
    ],
  },

  {
    slug: "repair-after-conflict",
    approach: "wellbeing",
    format: "guide",
    topic: "relationships",
    readMinutes: 5,
    ar: {
      title: "كيف تُصلح العلاقة بعد شجار",
      summary: "خطوات بعد الخلاف: التهدئة، فهم ما حدث لكل طرف، وإعادة التواصل.",
    },
    content: {
      fr: {
        title: "Réparer après une dispute",
        summary:
          "Les étapes après un conflit : se calmer, comprendre ce que chacun a vécu, et renouer le lien.",
        sections: [
          {
            heading: "Tous les couples se disputent",
            body: [
              "Les travaux de John Gottman montrent que ce qui distingue les relations durables n'est pas l'absence de conflit, mais la capacité à réparer : faire un geste qui désamorce la tension et à le recevoir. La réparation vaut aussi entre amis, en famille ou au travail.",
            ],
          },
          {
            heading: "Les étapes",
            steps: [
              "Faire une pause : quand le cœur s'emballe, on n'écoute plus. Proposez 20 à 30 minutes de pause, en disant quand vous reviendrez.",
              "Se calmer vraiment : marcher, respirer, éviter de ruminer les arguments.",
              "Chacun raconte son vécu, à tour de rôle, sans débattre des faits : « Ce que j'ai ressenti, c'est… ». L'autre résume ce qu'il a compris.",
              "Reconnaître sa part : « Je regrette d'avoir haussé le ton. » Une seule phrase sincère suffit.",
              "Chercher un petit accord pour la prochaine fois.",
              "Renouer : un geste, un repas, un moment ensemble.",
            ],
            tip: "Les quatre attitudes qui abîment le plus une relation, selon Gottman : la critique de la personne, le mépris, la défensive et le mur de silence. Leur antidote : parler de soi, exprimer de l'appréciation, prendre sa part, et faire une pause plutôt que se fermer.",
          },
          {
            heading: "Quand demander de l'aide",
            body: [
              "Si les disputes deviennent violentes, si l'un des deux a peur de l'autre, ou si le même conflit revient sans issue depuis des mois, une thérapie de couple ou individuelle peut aider. En cas de violence, votre sécurité passe en premier.",
            ],
          },
        ],
      },
      en: {
        title: "Repairing after a fight",
        summary:
          "The steps after a conflict: calming down, understanding what each person went through, and reconnecting.",
        sections: [
          {
            heading: "Every couple argues",
            body: [
              "John Gottman's research shows that what sets lasting relationships apart is not the absence of conflict but the ability to repair: making a gesture that defuses tension, and accepting it. Repair works between friends, in families and at work too.",
            ],
          },
          {
            heading: "The steps",
            steps: [
              "Take a break: when the heart races, we stop listening. Suggest 20 to 30 minutes apart, saying when you'll come back.",
              "Actually calm down: walk, breathe, avoid rehearsing arguments.",
              "Each person shares their experience, taking turns, without debating the facts: “What I felt was…”. The other sums up what they understood.",
              "Own your part: “I'm sorry I raised my voice.” One sincere sentence is enough.",
              "Look for one small agreement for next time.",
              "Reconnect: a gesture, a meal, a moment together.",
            ],
            tip: "The four attitudes that damage relationships most, according to Gottman: criticising the person, contempt, defensiveness and stonewalling. Their antidotes: talk about yourself, express appreciation, take responsibility, and pause rather than shut down.",
          },
          {
            heading: "When to seek help",
            body: [
              "If arguments turn violent, if one partner is afraid of the other, or if the same conflict has gone round for months, couples or individual therapy can help. If there is violence, your safety comes first.",
            ],
          },
        ],
      },
    },
    references: [
      GOTTMAN,
      "Gottman, J. M., & Levenson, R. W. (2000). The timing of divorce: predicting when a couple will divorce over a 14-year period. Journal of Marriage and Family, 62(3), 737–745.",
    ],
  },

  {
    slug: "deep-work-blocks",
    approach: "wellbeing",
    format: "guide",
    topic: "workplace",
    readMinutes: 4,
    ar: {
      title: "كتل العمل العميق",
      summary:
        "تنظيم فترات تركيز محمية من المقاطعات لتقليل التوتر وإنجاز ما يهم.",
    },
    content: {
      fr: {
        title: "Les blocs de travail profond",
        summary:
          "Organiser des plages de concentration protégées des interruptions, pour réduire le stress et avancer sur ce qui compte.",
        sections: [
          {
            heading: "Le coût des interruptions",
            body: [
              "Passer d'une tâche à l'autre laisse un « résidu d'attention » : une partie de l'esprit reste sur la tâche précédente. Les notifications, les messages et le multitâche fragmentent la journée, augmentent la fatigue et donnent l'impression de courir sans avancer.",
            ],
          },
          {
            heading: "Mettre en place un bloc",
            steps: [
              "Choisissez une tâche unique et précise (« rédiger l'introduction du rapport », pas « travailler sur le rapport »).",
              "Bloquez 50 à 90 minutes dans l'agenda, idéalement au moment où vous êtes le plus alerte.",
              "Coupez les notifications, téléphone dans une autre pièce ou en mode avion.",
              "Gardez une feuille à côté pour noter les idées parasites, sans les traiter.",
              "Faites une vraie pause ensuite : marcher, boire, regarder au loin.",
            ],
            tip: "Commencez par un bloc par jour. Deux à quatre heures de concentration réelle par jour, c'est déjà beaucoup.",
          },
          {
            heading: "Si la concentration est difficile",
            body: [
              "Si malgré tout vous n'arrivez plus à vous concentrer depuis des semaines, avec fatigue, perte d'intérêt ou troubles du sommeil, il peut s'agir d'un épuisement ou d'une dépression. Faites le point avec un professionnel.",
            ],
          },
        ],
      },
      en: {
        title: "Deep work blocks",
        summary:
          "Setting aside focus time protected from interruptions, to lower stress and move forward on what matters.",
        sections: [
          {
            heading: "The cost of interruptions",
            body: [
              "Switching tasks leaves “attention residue”: part of the mind stays on the previous task. Notifications, messages and multitasking fragment the day, increase fatigue and leave you feeling busy without progress.",
            ],
          },
          {
            heading: "Setting up a block",
            steps: [
              "Pick one specific task (“draft the report introduction”, not “work on the report”).",
              "Block 50 to 90 minutes in your calendar, ideally when you are most alert.",
              "Turn off notifications; phone in another room or on flight mode.",
              "Keep a sheet nearby to jot down stray thoughts without acting on them.",
              "Take a real break afterwards: walk, drink, look into the distance.",
            ],
            tip: "Start with one block a day. Two to four hours of genuine focus a day is already a lot.",
          },
          {
            heading: "If focus stays hard",
            body: [
              "If you have been unable to concentrate for weeks, with fatigue, loss of interest or poor sleep, it may be burnout or depression. Check in with a professional.",
            ],
          },
        ],
      },
    },
    references: [
      "Newport, C. (2016). Deep Work: Rules for Focused Success in a Distracted World. Grand Central.",
      "Leroy, S. (2009). Why is it so hard to do my work? The challenge of attention residue when switching between work tasks. Organizational Behavior and Human Decision Processes, 109(2), 168–181.",
    ],
  },
];
