import type { LibResource } from "./types";

const YOUNG =
  "Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). Schema Therapy: A Practitioner's Guide. Guilford Press.";
const YOUNG_KLOSKO =
  "Young, J. E., & Klosko, J. S. (1993). Reinventing Your Life. Plume. (Trad. fr. : Je réinvente ma vie, Éditions de l'Homme, 1995.)";
const ARNTZ =
  "Arntz, A., & Jacob, G. (2013). Schema Therapy in Practice: An Introductory Guide to the Schema Mode Approach. Wiley-Blackwell.";
const ARNTZ_BPD =
  "Arntz, A., & van Genderen, H. (2020). Schema Therapy for Borderline Personality Disorder (2nd ed.). Wiley-Blackwell.";
const LOCKWOOD =
  "Lockwood, G., & Perris, P. (2012). A new look at core emotional needs. In M. van Vreeswijk, J. Broersen & M. Nadort (Eds.), The Wiley-Blackwell Handbook of Schema Therapy (pp. 41–66). Wiley-Blackwell.";

export const SCHEMA_RESOURCES: LibResource[] = [
  // ------------------------------------------------------------------ 1 ---
  {
    slug: "schemas-besoins-et-18-schemas",
    approach: "schema",
    format: "guide",
    topic: "depression",
    readMinutes: 9,
    ar: {
      title: "العلاج بالمخططات: الحاجات الأساسية والمخططات الثمانية عشر",
      summary:
        "من أين تأتي الأنماط التي تتكرر في حياتنا؟ مدخل إلى الحاجات العاطفية الأساسية والمخططات المبكرة غير المتكيفة.",
    },
    content: {
      fr: {
        title:
          "Thérapie des schémas : les besoins fondamentaux et les 18 schémas",
        summary:
          "D'où viennent les scénarios qui se répètent dans nos vies ? Une introduction aux besoins affectifs de base et aux schémas précoces inadaptés.",
        sections: [
          {
            heading: "Qu'est-ce qu'un schéma ?",
            body: [
              "La thérapie des schémas a été développée par Jeffrey Young pour les difficultés qui résistent à une TCC classique : problèmes anciens, répétitifs, qui touchent l'identité et les relations. Elle intègre la TCC, la théorie de l'attachement et des techniques émotionnelles.",
              "Un schéma précoce inadapté est un thème large et durable, fait de souvenirs, d'émotions, de pensées et de sensations, qui concerne soi-même et ses relations aux autres. Il se forme pendant l'enfance ou l'adolescence, quand des besoins fondamentaux n'ont pas été suffisamment satisfaits, et se rejoue ensuite à l'âge adulte.",
              "Un schéma n'est pas un défaut de caractère : c'était souvent une adaptation intelligente à un environnement difficile. Il devient un problème quand il continue de fonctionner dans un contexte où il n'est plus utile.",
            ],
          },
          {
            heading: "Les cinq besoins affectifs fondamentaux",
            bullets: [
              "Un attachement sûr : sécurité, stabilité, affection, acceptation.",
              "Autonomie, compétence et sentiment d'identité.",
              "La liberté d'exprimer ses besoins et ses émotions légitimes.",
              "La spontanéité et le jeu.",
              "Des limites réalistes et la maîtrise de soi.",
            ],
            tip: "Quand un besoin a été chroniquement frustré (ou, à l'inverse, excessivement comblé sans limites), un schéma se développe dans le domaine correspondant.",
          },
          {
            heading: "Domaine 1 — Séparation et rejet",
            bullets: [
              "Abandon / instabilité : « les gens qui comptent finiront par partir ».",
              "Méfiance / abus : « les autres vont me blesser, me tromper ou profiter de moi ».",
              "Carence affective : « personne ne répondra vraiment à mon besoin d'attention, de compréhension ou de protection ».",
              "Imperfection / honte : « si on me connaissait vraiment, on me rejetterait ».",
              "Isolement social : « je suis différent, je n'appartiens à aucun groupe ».",
            ],
          },
          {
            heading: "Domaine 2 — Manque d'autonomie et de performance",
            bullets: [
              "Dépendance / incompétence : « je ne peux pas me débrouiller seul au quotidien ».",
              "Vulnérabilité au danger ou à la maladie : « une catastrophe peut arriver à tout moment ».",
              "Fusion / personnalité atrophiée : difficulté à exister séparément d'un proche.",
              "Échec : « je suis moins capable que les autres, j'échouerai ».",
            ],
          },
          {
            heading: "Domaine 3 — Manque de limites",
            bullets: [
              "Droits personnels exagérés / grandeur : « les règles ordinaires ne s'appliquent pas à moi ».",
              "Contrôle de soi insuffisant : difficulté à tolérer la frustration et à se discipliner.",
            ],
          },
          {
            heading: "Domaine 4 — Orientation vers les autres",
            bullets: [
              "Assujettissement : on se soumet aux autres pour éviter le conflit ou le rejet.",
              "Abnégation : on fait passer les besoins des autres avant les siens, par excès de responsabilité.",
              "Recherche d'approbation : la valeur personnelle dépend du regard et de l'admiration des autres.",
            ],
          },
          {
            heading: "Domaine 5 — Survigilance et inhibition",
            bullets: [
              "Négativité / pessimisme : attention fixée sur ce qui peut mal tourner.",
              "Inhibition émotionnelle : on retient ses émotions pour ne pas perdre le contrôle ou être jugé.",
              "Exigences élevées / critique excessive : « ce n'est jamais assez bien ».",
              "Punition : les erreurs, les siennes comme celles des autres, méritent d'être sévèrement punies.",
            ],
          },
          {
            heading: "Comment un schéma se reconnaît",
            body: [
              "Un schéma activé produit une réaction émotionnelle disproportionnée par rapport à la situation présente : on réagit à ce qui se passe maintenant avec l'intensité d'une blessure ancienne. Les mêmes scénarios reviennent : choix de partenaires, conflits au travail, épuisement à force de tout porter.",
            ],
            tip: "Ce guide sert à comprendre, pas à se diagnostiquer. L'évaluation des schémas se fait avec un psychologue formé, à l'aide d'outils validés et de l'histoire de vie.",
          },
        ],
      },
      en: {
        title: "Schema therapy: core needs and the 18 schemas",
        summary:
          "Where do the patterns that keep repeating in our lives come from? An introduction to core emotional needs and early maladaptive schemas.",
        sections: [
          {
            heading: "What is a schema?",
            body: [
              "Schema therapy was developed by Jeffrey Young for difficulties that do not shift with standard CBT: long-standing, repetitive problems that affect identity and relationships. It integrates CBT, attachment theory and emotion-focused techniques.",
              "An early maladaptive schema is a broad, enduring theme made of memories, emotions, thoughts and bodily sensations about oneself and one's relationships. It forms in childhood or adolescence when core needs were not sufficiently met, and replays in adult life.",
              "A schema is not a character flaw: it was often a clever adaptation to a difficult environment. It becomes a problem when it keeps running in a context where it no longer helps.",
            ],
          },
          {
            heading: "The five core emotional needs",
            bullets: [
              "Secure attachment: safety, stability, nurturance and acceptance.",
              "Autonomy, competence and a sense of identity.",
              "Freedom to express valid needs and emotions.",
              "Spontaneity and play.",
              "Realistic limits and self-control.",
            ],
            tip: "When a need was chronically frustrated (or, the other way round, indulged without limits), a schema develops in the matching domain.",
          },
          {
            heading: "Domain 1 — Disconnection and rejection",
            bullets: [
              "Abandonment / instability: “the people who matter will eventually leave.”",
              "Mistrust / abuse: “others will hurt, cheat or take advantage of me.”",
              "Emotional deprivation: “no one will truly meet my need for care, understanding or protection.”",
              "Defectiveness / shame: “if people really knew me, they would reject me.”",
              "Social isolation / alienation: “I am different; I don't belong anywhere.”",
            ],
          },
          {
            heading: "Domain 2 — Impaired autonomy and performance",
            bullets: [
              "Dependence / incompetence: “I can't handle everyday life on my own.”",
              "Vulnerability to harm or illness: “disaster could strike at any moment.”",
              "Enmeshment / undeveloped self: difficulty existing separately from a close person.",
              "Failure: “I am less capable than others; I will fail.”",
            ],
          },
          {
            heading: "Domain 3 — Impaired limits",
            bullets: [
              "Entitlement / grandiosity: “the usual rules don't apply to me.”",
              "Insufficient self-control / self-discipline: difficulty tolerating frustration and sticking to effort.",
            ],
          },
          {
            heading: "Domain 4 — Other-directedness",
            bullets: [
              "Subjugation: giving in to others to avoid conflict or rejection.",
              "Self-sacrifice: putting others' needs first out of an excessive sense of responsibility.",
              "Approval-seeking / recognition-seeking: self-worth depends on others' attention and admiration.",
            ],
          },
          {
            heading: "Domain 5 — Overvigilance and inhibition",
            bullets: [
              "Negativity / pessimism: attention fixed on what could go wrong.",
              "Emotional inhibition: holding emotions back to avoid losing control or being judged.",
              "Unrelenting standards / hypercriticalness: “it's never good enough.”",
              "Punitiveness: mistakes, one's own and others', deserve harsh punishment.",
            ],
          },
          {
            heading: "How to recognise a schema",
            body: [
              "An activated schema produces an emotional reaction out of proportion with the present situation: you respond to what is happening now with the intensity of an old wound. The same scenarios keep returning: choice of partners, conflicts at work, exhaustion from carrying everything.",
            ],
            tip: "This guide is for understanding, not self-diagnosis. Schemas are assessed with a trained psychologist, using validated tools and your life history.",
          },
        ],
      },
    },
    references: [YOUNG, YOUNG_KLOSKO, LOCKWOOD],
  },

  // ------------------------------------------------------------------ 2 ---
  {
    slug: "schemas-les-modes",
    approach: "schema",
    format: "guide",
    topic: "stress",
    readMinutes: 8,
    ar: {
      title: "الأنماط (Modes): الحالات العاطفية التي تتناوب علينا",
      summary:
        "الطفل الهش، الناقد الداخلي، الحامي المنفصل، والراشد السليم: خريطة لفهم ما يحدث في الداخل لحظة بلحظة.",
    },
    content: {
      fr: {
        title: "Les modes : les états qui prennent le relais en nous",
        summary:
          "L'enfant vulnérable, le parent critique, le protecteur détaché, l'adulte sain : une carte pour comprendre ce qui se passe en soi d'un moment à l'autre.",
        sections: [
          {
            heading: "Schémas et modes",
            body: [
              "Les schémas sont des thèmes durables ; les modes sont les états émotionnels et comportementaux qui dominent à un instant donné quand un schéma est activé. Le modèle des modes, développé par Young puis Arntz, est particulièrement utile quand on passe rapidement d'un état à l'autre.",
              "Penser en modes aide à prendre du recul : « une partie de moi se sent abandonnée, une autre veut tout couper » plutôt que « je suis comme ça ».",
            ],
          },
          {
            heading: "Les modes enfant",
            bullets: [
              "Enfant vulnérable : seul, triste, effrayé, honteux. Porte les besoins non satisfaits.",
              "Enfant en colère : furieux ou frustré parce qu'un besoin fondamental n'est pas respecté.",
              "Enfant impulsif / indiscipliné : agit selon ses envies immédiates, sans tenir compte des conséquences.",
              "Enfant heureux : se sent aimé, en sécurité, joueur et curieux. C'est le mode à nourrir.",
            ],
          },
          {
            heading: "Les modes d'adaptation dysfonctionnels",
            bullets: [
              "Soumis obéissant : cède, fait plaisir, s'efface pour éviter le conflit.",
              "Protecteur détaché : se coupe des émotions et des autres ; vide, ennui, distraction, parfois consommation.",
              "Auto-apaisement : se calme par des activités qui anesthésient (écrans, nourriture, travail excessif).",
              "Surcompensateur : contre-attaque, domine, se met en avant ou contrôle pour ne pas ressentir la vulnérabilité.",
            ],
          },
          {
            heading: "Les modes parent intériorisés",
            bullets: [
              "Parent punitif : voix intérieure dure, qui insulte et punit (« tu es nul, tu mérites ce qui t'arrive »).",
              "Parent exigeant : pousse sans relâche vers la performance, l'ordre ou le devoir (« pas le temps de te reposer »).",
            ],
            tip: "Ces voix reprennent souvent des messages entendus dans l'enfance. Les nommer comme des modes, et non comme la vérité, est déjà un premier pas.",
          },
          {
            heading: "L'adulte sain",
            body: [
              "L'adulte sain prend soin de l'enfant vulnérable, pose des limites à l'enfant impulsif, tient tête au parent punitif et assouplit le parent exigeant. Il fait des choix qui respectent ses besoins et ceux des autres. L'objectif de la thérapie est de renforcer ce mode.",
            ],
          },
          {
            heading: "Exercice : votre carte des modes",
            steps: [
              "Pensez à une situation difficile récente.",
              "Repérez le premier mode qui s'est activé (souvent l'enfant vulnérable ou en colère).",
              "Repérez le mode qui a pris le relais pour vous protéger (détachement, soumission, contre-attaque…).",
              "Notez si une voix critique ou exigeante était présente.",
              "Demandez-vous ce qu'un adulte sain aurait dit ou fait à ce moment-là.",
            ],
          },
        ],
      },
      en: {
        title: "Modes: the states that take over inside us",
        summary:
          "The vulnerable child, the inner critic, the detached protector, the healthy adult: a map of what happens inside from one moment to the next.",
        sections: [
          {
            heading: "Schemas and modes",
            body: [
              "Schemas are enduring themes; modes are the emotional and behavioural states that dominate at a given moment when a schema is triggered. The mode model, developed by Young and then Arntz, is particularly useful when someone switches rapidly from one state to another.",
              "Thinking in modes creates distance: “part of me feels abandoned, another part wants to cut everyone off” rather than “this is just who I am.”",
            ],
          },
          {
            heading: "Child modes",
            bullets: [
              "Vulnerable child: lonely, sad, frightened, ashamed. Carries the unmet needs.",
              "Angry child: furious or frustrated because a core need is not respected.",
              "Impulsive / undisciplined child: acts on immediate wants, regardless of consequences.",
              "Happy child: feels loved, safe, playful and curious. This is the mode to nurture.",
            ],
          },
          {
            heading: "Maladaptive coping modes",
            bullets: [
              "Compliant surrenderer: gives in, pleases, steps back to avoid conflict.",
              "Detached protector: cuts off from feelings and people; emptiness, boredom, distraction, sometimes substance use.",
              "Self-soother: calms down through numbing activities (screens, food, overwork).",
              "Overcompensator: counter-attacks, dominates, shows off or controls so as not to feel vulnerable.",
            ],
          },
          {
            heading: "Internalised parent modes",
            bullets: [
              "Punitive parent: a harsh inner voice that insults and punishes (“you're useless, you deserve this”).",
              "Demanding parent: pushes relentlessly towards performance, order or duty (“no time to rest”).",
            ],
            tip: "These voices often echo messages heard in childhood. Naming them as modes, not as the truth, is already a first step.",
          },
          {
            heading: "The healthy adult",
            body: [
              "The healthy adult looks after the vulnerable child, sets limits for the impulsive child, stands up to the punitive parent and softens the demanding one. It makes choices that respect one's own needs and those of others. Therapy aims to strengthen this mode.",
            ],
          },
          {
            heading: "Exercise: your mode map",
            steps: [
              "Think of a recent difficult situation.",
              "Spot the first mode that was triggered (often the vulnerable or angry child).",
              "Spot the mode that took over to protect you (detachment, compliance, counter-attack…).",
              "Note whether a critical or demanding voice was present.",
              "Ask yourself what a healthy adult would have said or done at that moment.",
            ],
          },
        ],
      },
    },
    references: [ARNTZ, YOUNG, ARNTZ_BPD],
  },

  // ------------------------------------------------------------------ 3 ---
  {
    slug: "schemas-styles-adaptation",
    approach: "schema",
    format: "guide",
    topic: "stress",
    readMinutes: 6,
    ar: {
      title: "الاستسلام والتجنب والتعويض المفرط: كيف نتعامل مع مخططاتنا",
      summary:
        "ثلاث طرق نلجأ إليها لتفادي ألم المخطط، وكلها تُبقيه حياً على المدى البعيد.",
    },
    content: {
      fr: {
        title:
          "Capitulation, évitement, surcompensation : nos façons de faire face",
        summary:
          "Trois stratégies que l'on utilise pour ne pas ressentir la douleur d'un schéma, et qui l'entretiennent toutes à long terme.",
        sections: [
          {
            heading: "Pourquoi les schémas durent",
            body: [
              "Un schéma est douloureux à ressentir. Pour s'en protéger, on développe très tôt des styles d'adaptation. Ils soulagent sur le moment, mais empêchent de vivre des expériences qui contrediraient le schéma : c'est ce qui le fait durer.",
            ],
          },
          {
            heading: "Les trois styles",
            bullets: [
              "Capitulation : on accepte le schéma comme vrai et on agit en conséquence. Avec un schéma d'imperfection, on choisit un partenaire qui critique et on se laisse rabaisser.",
              "Évitement : on organise sa vie pour que le schéma ne soit jamais activé. Avec le même schéma, on évite l'intimité, on ne parle jamais de soi, on se distrait.",
              "Surcompensation : on fait l'inverse de ce que le schéma dit, de façon excessive. Avec le même schéma, on critique les autres, on recherche la perfection ou on se montre supérieur.",
            ],
            tip: "La même personne utilise souvent les trois styles, selon le contexte. Aucun n'est « meilleur » : tous entretiennent le schéma.",
          },
          {
            heading: "Exemples avec d'autres schémas",
            table: {
              columns: [
                "Schéma",
                "Capitulation",
                "Évitement",
                "Surcompensation",
              ],
              example: [
                "Abandon",
                "S'accrocher à des partenaires peu disponibles",
                "Éviter les relations proches",
                "Quitter avant d'être quitté, contrôler l'autre",
              ],
            },
            bullets: [
              "Échec : saboter ses efforts / ne pas se présenter aux examens / tout miser sur la réussite et s'épuiser.",
              "Assujettissement : dire oui à tout / fuir les conflits / se rebeller de façon systématique.",
              "Exigences élevées : travailler sans fin / procrastiner par peur de mal faire / imposer ses standards aux autres.",
            ],
          },
          {
            heading: "Exercice : repérer son style",
            steps: [
              "Choisissez un schéma qui vous parle dans la liste des 18.",
              "Notez une situation où il s'est activé.",
              "Qu'avez-vous fait : capitulé, évité ou surcompensé ?",
              "Quel soulagement cela vous a-t-il apporté sur le moment ?",
              "Qu'est-ce que cela vous a empêché d'apprendre sur vous ou sur les autres ?",
            ],
            table: {
              columns: [
                "Situation",
                "Schéma activé",
                "Ce que j'ai fait",
                "Style",
                "Coût à long terme",
              ],
              blankRows: 3,
            },
          },
        ],
      },
      en: {
        title: "Surrender, avoidance, overcompensation: how we cope",
        summary:
          "Three strategies we use to avoid feeling a schema's pain, all of which keep it alive in the long run.",
        sections: [
          {
            heading: "Why schemas last",
            body: [
              "A schema is painful to feel. To protect ourselves, we develop coping styles very early. They bring relief in the moment, but they prevent the experiences that would contradict the schema: that is what keeps it going.",
            ],
          },
          {
            heading: "The three styles",
            bullets: [
              "Surrender: accepting the schema as true and acting accordingly. With a defectiveness schema, choosing a critical partner and letting oneself be put down.",
              "Avoidance: arranging life so the schema is never triggered. With the same schema, avoiding intimacy, never talking about oneself, staying distracted.",
              "Overcompensation: doing the opposite of what the schema says, to excess. With the same schema, criticising others, chasing perfection or acting superior.",
            ],
            tip: "The same person often uses all three styles, depending on the context. None is “better”: they all maintain the schema.",
          },
          {
            heading: "Examples with other schemas",
            table: {
              columns: ["Schema", "Surrender", "Avoidance", "Overcompensation"],
              example: [
                "Abandonment",
                "Clinging to unavailable partners",
                "Avoiding close relationships",
                "Leaving before being left, controlling the other",
              ],
            },
            bullets: [
              "Failure: sabotaging one's efforts / not turning up to exams / staking everything on success and burning out.",
              "Subjugation: saying yes to everything / fleeing conflict / rebelling as a rule.",
              "Unrelenting standards: working endlessly / procrastinating for fear of doing it badly / imposing one's standards on others.",
            ],
          },
          {
            heading: "Exercise: spot your style",
            steps: [
              "Pick a schema that resonates with you from the list of 18.",
              "Note a situation in which it was triggered.",
              "What did you do: surrender, avoid or overcompensate?",
              "What relief did it bring in the moment?",
              "What did it stop you from learning about yourself or others?",
            ],
            table: {
              columns: [
                "Situation",
                "Schema triggered",
                "What I did",
                "Style",
                "Long-term cost",
              ],
              blankRows: 3,
            },
          },
        ],
      },
    },
    references: [YOUNG, YOUNG_KLOSKO],
  },

  // ------------------------------------------------------------------ 4 ---
  {
    slug: "schemas-carte-memoire",
    approach: "schema",
    format: "worksheet",
    topic: "anxiety",
    readMinutes: 5,
    ar: {
      title: "بطاقة المخطط: ورقة عمل لحظة التنشيط",
      summary:
        "بطاقة تكتبها مسبقاً وتقرؤها حين يُنشَّط المخطط، لتربط الانفعال الحالي بجذوره وتختار سلوكاً صحياً.",
    },
    content: {
      fr: {
        title: "La carte-mémoire de schéma (flashcard)",
        summary:
          "Une carte que l'on rédige à froid et que l'on relit quand le schéma s'active, pour relier l'émotion du moment à son origine et choisir un comportement sain.",
        sections: [
          {
            heading: "À quoi sert la carte",
            body: [
              "Quand un schéma s'active, l'émotion envahit tout et il devient difficile de réfléchir. La carte-mémoire, proposée par Young, est préparée à l'avance, idéalement avec votre psychologue, et relue au moment où l'on en a besoin. Elle donne la parole à l'adulte sain.",
            ],
          },
          {
            heading: "Les quatre parties de la carte",
            steps: [
              "Reconnaître l'émotion actuelle : « En ce moment je ressens… parce que… ».",
              "Nommer le schéma : « C'est probablement mon schéma de…, que j'ai appris dans…, et qui me fait exagérer… ».",
              "Vérifier la réalité : « Même si je crois que…, la réalité est que… ; les preuves sont… ».",
              "Se donner une consigne de comportement : « Plutôt que de… (style habituel), je vais… ».",
            ],
          },
          {
            heading: "Exemple rempli",
            body: [
              "« En ce moment je me sens anéantie et en colère parce que mon amie a annulé notre soirée. C'est probablement mon schéma d'abandon, appris quand mon père partait sans prévenir, et qui me fait voir chaque annulation comme un rejet. Même si je crois qu'elle s'éloigne, la réalité est qu'elle m'a proposé une autre date et qu'elle était là le mois dernier quand j'en avais besoin. Plutôt que de lui envoyer cinq messages ou de couper le contact, je vais accepter la nouvelle date et appeler ma sœur ce soir. »",
            ],
          },
          {
            heading: "Ma carte",
            table: {
              columns: ["Partie", "Ce que j'écris"],
              example: [
                "1. L'émotion actuelle",
                "En ce moment je ressens… parce que…",
              ],
              blankRows: 4,
            },
            tip: "Gardez la carte sur votre téléphone ou dans votre portefeuille. Plus vous la relisez, plus la voix de l'adulte sain devient familière.",
          },
        ],
      },
      en: {
        title: "The schema flashcard",
        summary:
          "A card written in a calm moment and read when the schema fires, to link the current emotion to its origin and choose a healthy behaviour.",
        sections: [
          {
            heading: "What the card is for",
            body: [
              "When a schema fires, emotion floods everything and it becomes hard to think. The flashcard, proposed by Young, is prepared in advance, ideally with your psychologist, and read at the moment you need it. It gives the healthy adult a voice.",
            ],
          },
          {
            heading: "The four parts of the card",
            steps: [
              "Acknowledge the current feeling: “Right now I feel… because…”.",
              "Name the schema: “This is probably my … schema, which I learned through…, and which makes me exaggerate…”.",
              "Reality-test: “Even though I believe…, the reality is…; the evidence is…”.",
              "Give yourself a behavioural instruction: “Instead of… (usual style), I will…”.",
            ],
          },
          {
            heading: "Filled-in example",
            body: [
              "“Right now I feel devastated and angry because my friend cancelled our evening. This is probably my abandonment schema, learned when my father would leave without warning, and it makes me see every cancellation as rejection. Even though I believe she is pulling away, the reality is that she suggested another date and was there last month when I needed her. Instead of sending her five messages or cutting contact, I will accept the new date and call my sister tonight.”",
            ],
          },
          {
            heading: "My card",
            table: {
              columns: ["Part", "What I write"],
              example: ["1. Current feeling", "Right now I feel… because…"],
              blankRows: 4,
            },
            tip: "Keep the card on your phone or in your wallet. The more you read it, the more familiar the healthy adult's voice becomes.",
          },
        ],
      },
    },
    references: [YOUNG, YOUNG_KLOSKO],
  },

  // ------------------------------------------------------------------ 5 ---
  {
    slug: "schemas-journal-des-modes",
    approach: "schema",
    format: "worksheet",
    topic: "stress",
    readMinutes: 5,
    ar: {
      title: "مفكرة الأنماط: تتبع الحالات خلال الأسبوع",
      summary:
        "ورقة عمل لرصد الأنماط التي تنشط في المواقف اليومية، وما يحتاجه الطفل الهش، وما كان سيقوله الراشد السليم.",
    },
    content: {
      fr: {
        title: "Le journal des modes",
        summary:
          "Une fiche pour repérer, au fil de la semaine, quels modes s'activent, de quoi l'enfant vulnérable avait besoin et ce que l'adulte sain aurait fait.",
        sections: [
          {
            heading: "Pourquoi tenir un journal",
            body: [
              "Les modes changent vite et on les remarque souvent après coup. Les noter chaque jour pendant deux à trois semaines aide à repérer les déclencheurs, les enchaînements typiques (par exemple : enfant vulnérable → protecteur détaché) et les moments où l'adulte sain a réussi à prendre la main.",
            ],
          },
          {
            heading: "Comment remplir",
            steps: [
              "Notez la situation déclenchante, de façon factuelle.",
              "Écrivez les émotions et leur intensité (0–100).",
              "Identifiez les modes présents, dans l'ordre où ils sont apparus.",
              "Demandez-vous quel besoin n'était pas satisfait (sécurité, reconnaissance, autonomie, limites, jeu).",
              "Écrivez ce que l'adulte sain aurait pu dire ou faire, même si vous ne l'avez pas fait.",
            ],
          },
          {
            heading: "Ma semaine",
            table: {
              columns: [
                "Jour / situation",
                "Émotions (0–100)",
                "Modes repérés",
                "Besoin en jeu",
                "Réponse de l'adulte sain",
              ],
              example: [
                "Lundi : critique de mon chef en réunion",
                "Honte 70, colère 50",
                "Enfant vulnérable → parent punitif → protecteur détaché",
                "Être reconnu, ne pas être humilié",
                "« Une remarque sur un dossier ne dit rien de ma valeur. Je demande un retour précis demain. »",
              ],
              blankRows: 6,
            },
            tip: "Apportez votre journal en séance : c'est une matière précieuse pour le travail avec votre psychologue.",
          },
        ],
      },
      en: {
        title: "The mode diary",
        summary:
          "A sheet to spot, over the week, which modes are triggered, what the vulnerable child needed and what the healthy adult would have done.",
        sections: [
          {
            heading: "Why keep a diary",
            body: [
              "Modes shift quickly and are often noticed only afterwards. Recording them daily for two to three weeks helps you spot triggers, typical sequences (for example: vulnerable child → detached protector) and the moments when the healthy adult managed to take charge.",
            ],
          },
          {
            heading: "How to fill it in",
            steps: [
              "Note the triggering situation, factually.",
              "Write down the emotions and their intensity (0–100).",
              "Identify the modes present, in the order they appeared.",
              "Ask which need was unmet (safety, recognition, autonomy, limits, play).",
              "Write what the healthy adult could have said or done, even if you didn't.",
            ],
          },
          {
            heading: "My week",
            table: {
              columns: [
                "Day / situation",
                "Emotions (0–100)",
                "Modes noticed",
                "Need at stake",
                "Healthy adult's response",
              ],
              example: [
                "Monday: my manager criticised me in a meeting",
                "Shame 70, anger 50",
                "Vulnerable child → punitive parent → detached protector",
                "To be recognised, not humiliated",
                "“A comment about one file says nothing about my worth. I'll ask for specific feedback tomorrow.”",
              ],
              blankRows: 6,
            },
            tip: "Bring your diary to sessions: it is valuable material for the work with your psychologist.",
          },
        ],
      },
    },
    references: [ARNTZ, ARNTZ_BPD],
  },

  // ------------------------------------------------------------------ 6 ---
  {
    slug: "schemas-techniques-experientielles",
    approach: "schema",
    format: "guide",
    topic: "depression",
    readMinutes: 7,
    withTherapist: true,
    ar: {
      title: "التقنيات التجريبية: إعادة كتابة الصور الذهنية وحوار الكراسي",
      summary:
        "كيف يعمل العلاج بالمخططات على المستوى العاطفي، ولماذا تُمارس هذه التقنيات مع معالج مدرَّب.",
    },
    content: {
      fr: {
        title:
          "Les techniques expérientielles : imagerie et travail sur chaises",
        summary:
          "Comment la thérapie des schémas agit au niveau émotionnel, et pourquoi ces techniques se pratiquent avec un thérapeute formé.",
        sections: [
          {
            heading: "Comprendre ne suffit pas toujours",
            body: [
              "Beaucoup de personnes savent « dans leur tête » que leur schéma est exagéré, mais le ressentent toujours comme vrai. Les techniques expérientielles visent ce décalage entre la raison et l'émotion : elles permettent de vivre, en séance, une expérience émotionnelle correctrice.",
            ],
          },
          {
            heading: "La réécriture en imagerie",
            body: [
              "Le thérapeute guide la personne vers un souvenir d'enfance lié au schéma. Au moment où le besoin n'a pas été satisfait, la scène est « réécrite » : un adulte sain (le thérapeute au début, puis la personne elle-même) entre dans l'image, protège l'enfant, pose des limites à celui qui fait du mal et répond au besoin.",
              "Le souvenir n'est pas effacé ni nié. C'est sa signification émotionnelle qui change : « je ne méritais pas cela, et j'avais droit à être protégé ».",
            ],
          },
          {
            heading: "Le travail sur chaises",
            body: [
              "Chaque mode est placé sur une chaise différente. La personne change de chaise pour donner la parole à chacun : l'enfant vulnérable exprime sa peine, le parent punitif est identifié puis contesté, l'adulte sain répond. Ce dialogue rend visibles des conflits intérieurs et permet de s'entraîner à une nouvelle position.",
            ],
          },
          {
            heading: "La reparentalisation limitée",
            body: [
              "Dans les limites d'une relation professionnelle, le thérapeute répond en partie aux besoins qui n'ont pas été satisfaits : chaleur, validation, limites claires. La relation thérapeutique devient elle-même un lieu d'apprentissage.",
            ],
          },
          {
            heading: "Pourquoi avec un thérapeute",
            bullets: [
              "Ces techniques réactivent des souvenirs et des émotions intenses ; elles demandent un cadre sécurisant et un professionnel formé.",
              "En cas de traumatisme, de dissociation ou d'idées suicidaires, le rythme et le choix des techniques doivent être évalués par un clinicien.",
              "Seul, on peut en revanche pratiquer une version douce : imaginer un lieu sûr, ou écrire une lettre de l'adulte sain à l'enfant que l'on a été.",
            ],
            tip: "Plusieurs essais contrôlés montrent l'efficacité de la thérapie des schémas, notamment dans le trouble de la personnalité borderline et d'autres troubles de la personnalité. Parlez-en avec un psychologue formé à cette approche.",
          },
        ],
      },
      en: {
        title: "Experiential techniques: imagery and chair work",
        summary:
          "How schema therapy works at the emotional level, and why these techniques are practised with a trained therapist.",
        sections: [
          {
            heading: "Understanding is not always enough",
            body: [
              "Many people know “in their head” that their schema is exaggerated, yet still feel it as true. Experiential techniques target this gap between reason and emotion: they make it possible to live, in session, a corrective emotional experience.",
            ],
          },
          {
            heading: "Imagery rescripting",
            body: [
              "The therapist guides the person to a childhood memory linked to the schema. At the point where the need was not met, the scene is “rescripted”: a healthy adult (first the therapist, later the person themself) steps into the image, protects the child, sets limits on whoever is causing harm and meets the need.",
              "The memory is neither erased nor denied. What changes is its emotional meaning: “I did not deserve that, and I had a right to be protected.”",
            ],
          },
          {
            heading: "Chair work",
            body: [
              "Each mode is placed on a different chair. The person moves between chairs to give each one a voice: the vulnerable child expresses their pain, the punitive parent is identified and then challenged, the healthy adult responds. The dialogue makes inner conflicts visible and lets the person rehearse a new stance.",
            ],
          },
          {
            heading: "Limited reparenting",
            body: [
              "Within the limits of a professional relationship, the therapist partly meets needs that went unmet: warmth, validation, clear limits. The therapeutic relationship itself becomes a place of learning.",
            ],
          },
          {
            heading: "Why with a therapist",
            bullets: [
              "These techniques reactivate intense memories and emotions; they need a safe frame and a trained professional.",
              "With trauma, dissociation or suicidal thoughts, the pace and choice of techniques must be assessed by a clinician.",
              "On your own you can practise a gentle version: imagining a safe place, or writing a letter from your healthy adult to the child you once were.",
            ],
            tip: "Several controlled trials support schema therapy, notably for borderline and other personality disorders. Talk it over with a psychologist trained in this approach.",
          },
        ],
      },
    },
    references: [
      ARNTZ,
      ARNTZ_BPD,
      YOUNG,
      "Giesen-Bloo, J., et al. (2006). Outpatient psychotherapy for borderline personality disorder: randomized trial of schema-focused therapy vs transference-focused psychotherapy. Archives of General Psychiatry, 63(6), 649–658.",
      "Arntz, A., et al. (2022). Effectiveness of predominantly group schema therapy and combined individual and group schema therapy for borderline personality disorder: a randomized clinical trial. JAMA Psychiatry, 79(4), 287–299.",
    ],
  },
];
