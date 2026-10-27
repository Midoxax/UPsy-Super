// Blog articles written as data: one generic page (pages/blog/BlogArticle)
// renders any entry here at /blog/<slug>. Add a post by adding an entry.
// French and English are written in full; Arabic readers get the French
// text until an Arabic version is added.

// Regard U.Psy: analyses of current news, written by scripts/agent/news-insight.ts
// and reviewed in a pull request before they go live.
import NEWS from "./news.generated.json";

export type ArticleLang = "en" | "fr";

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ArticleBody {
  title: string;
  description: string;
  category: string;
  intro: string;
  sections: ArticleSection[];
  faq: { q: string; a: string }[];
  cta: string;
}

export interface Article {
  slug: string;
  readMinutes: number;
  datePublished: string;
  content: Record<ArticleLang, ArticleBody>;
  /** The news story an analysis responds to (Regard U.Psy, scripts/agent/news-insight.ts). */
  source?: { outlet: string; title: string; url: string; date: string };
}

const WRITTEN: Article[] = [
  {
    slug: "pre-competition-anxiety",
    readMinutes: 7,
    datePublished: "2026-10-20",
    content: {
      en: {
        title: "Pre-competition anxiety: understand it, then use it",
        description:
          "Butterflies before a match are normal. What matters is how you read them. A sport psychologist's guide to turning pre-competition nerves into focus.",
        category: "Sport psychology",
        intro:
          "Racing heart, tight stomach, a mind that won't stop rehearsing what could go wrong: almost every athlete knows the hours before competing. Nerves are not a sign of weakness. They are your body getting ready. The aim is not to make them disappear but to keep them at a level that helps you, and to read them the right way.",
        sections: [
          {
            heading: "What is actually happening",
            paragraphs: [
              "Before a match your nervous system shifts into readiness: adrenaline rises, breathing speeds up, muscles tense. This is useful activation. Sport psychology distinguishes two sides of anxiety: the body side (heart rate, trembling, nausea) and the thinking side (worry, doubt, imagining failure).",
              'Research consistently shows that it is not the amount of activation that predicts performance so much as how you interpret it. Two athletes can feel the same heartbeat; one reads it as "I\'m ready", the other as "I\'m going to fall apart". The first usually performs better.',
            ],
          },
          {
            heading: "Every athlete has their own zone",
            paragraphs: [
              "There is no single ideal level of nerves. Some athletes perform best quite calm, others need to feel very fired up. Your task is to learn your own zone: think back to your best and worst performances and note how you felt in the hour before. Patterns appear quickly.",
            ],
          },
          {
            heading: "Five techniques that work",
            paragraphs: [
              "None of these needs special equipment. Practise them in training first so they are automatic on competition day.",
            ],
            bullets: [
              "Slow breathing with a long exhale: breathe in for 4 seconds, out for 6 to 8, for two to three minutes. A longer exhale calms the body's alarm response.",
              "A pre-performance routine: the same short sequence of actions before every start, serve or penalty. It gives the mind something familiar to hold on to.",
              'Reappraisal: tell yourself "I\'m excited" or "my body is getting ready" rather than trying to force calm. It is easier to redirect energy than to switch it off.',
              "Process goals: focus on what you control (your first three actions, your rhythm, your positioning) rather than the score or the ranking.",
              'Cue words: one or two short words ("smooth", "attack", "next ball") that bring your attention back to the task when it drifts.',
            ],
          },
          {
            heading: "When nerves become a problem",
            paragraphs: [
              "Pre-competition anxiety deserves professional attention when it starts to cost you more than it gives you. Talk to a sport psychologist if you notice any of these regularly:",
            ],
            bullets: [
              "Losing sleep for several nights before competitions.",
              "Vomiting, panic attacks or freezing before or during events.",
              "Avoiding competitions, or wanting to quit a sport you love.",
              "Performing far below your training level, repeatedly, under pressure.",
            ],
          },
          {
            heading: "How a sport psychologist helps",
            paragraphs: [
              "Work usually starts by mapping your own pattern: when the anxiety rises, what you think, what your body does. From there you build an individual plan (breathing, routines, attention training, imagery) and rehearse it under increasing pressure. Most athletes notice a change within a few sessions.",
            ],
          },
        ],
        faq: [
          {
            q: "Is it normal to feel sick before a competition?",
            a: "A tight or upset stomach is a common sign of activation and is usually harmless. If it leads to vomiting, stops you eating properly, or happens before every event, it is worth working on with a professional.",
          },
          {
            q: "Should I try to be completely calm before competing?",
            a: "Usually not. Most athletes need some activation to perform. The goal is to find your own level, not to remove all nerves.",
          },
          {
            q: "How long before a competition should I start my routine?",
            a: "Many athletes use a longer routine of 30 to 60 minutes (warm-up, music, review of game plan) and a very short one of a few seconds before each action. Build both in training.",
          },
        ],
        cta: "Want a plan built around your sport and your pattern? Book a session with a UPSY sport psychologist.",
      },
      fr: {
        title: "Anxiété pré-compétitive : la comprendre, puis s'en servir",
        description:
          "Le trac avant un match est normal. Tout dépend de la façon dont vous le lisez. Le guide d'un psychologue du sport pour transformer la pression en concentration.",
        category: "Psychologie du sport",
        intro:
          "Cœur qui s'accélère, ventre noué, esprit qui rejoue tout ce qui pourrait mal tourner : presque tous les sportifs connaissent les heures qui précèdent une compétition. Le trac n'est pas un signe de faiblesse, c'est votre corps qui se prépare. L'objectif n'est pas de le faire disparaître, mais de le garder à un niveau qui vous aide, et de bien l'interpréter.",
        sections: [
          {
            heading: "Ce qui se passe vraiment",
            paragraphs: [
              "Avant un match, votre système nerveux se met en état d'alerte : l'adrénaline monte, la respiration s'accélère, les muscles se tendent. C'est une activation utile. La psychologie du sport distingue deux versants de l'anxiété : le versant corporel (rythme cardiaque, tremblements, nausée) et le versant mental (inquiétude, doute, images d'échec).",
              "Les recherches montrent de façon constante que ce n'est pas tant le niveau d'activation qui prédit la performance que la manière de l'interpréter. Deux sportifs peuvent ressentir le même battement de cœur : l'un se dit « je suis prêt », l'autre « je vais craquer ». Le premier performe généralement mieux.",
            ],
          },
          {
            heading: "Chaque sportif a sa propre zone",
            paragraphs: [
              "Il n'existe pas un niveau de trac idéal pour tous. Certains sportifs sont à leur meilleur assez calmes, d'autres ont besoin d'être très « remontés ». Votre travail consiste à connaître votre zone : repensez à vos meilleures et à vos moins bonnes performances, et notez ce que vous ressentiez dans l'heure qui précédait. Des tendances apparaissent vite.",
            ],
          },
          {
            heading: "Cinq techniques qui fonctionnent",
            paragraphs: [
              "Aucune ne demande de matériel. Entraînez-les d'abord à l'entraînement pour qu'elles deviennent automatiques le jour J.",
            ],
            bullets: [
              "La respiration lente avec expiration longue : inspirez 4 secondes, expirez 6 à 8 secondes, pendant deux à trois minutes. Une expiration plus longue calme la réaction d'alarme du corps.",
              "La routine de pré-performance : la même courte séquence de gestes avant chaque départ, service ou penalty. Elle donne à l'esprit un repère familier.",
              "La réinterprétation : dites-vous « je suis excité » ou « mon corps se prépare » plutôt que de forcer le calme. Il est plus facile de rediriger l'énergie que de l'éteindre.",
              "Les objectifs de processus : concentrez-vous sur ce que vous contrôlez (vos trois premières actions, votre rythme, votre placement) plutôt que sur le score ou le classement.",
              "Les mots-clés : un ou deux mots courts (« fluide », « attaque », « balle suivante ») pour ramener l'attention sur la tâche quand elle s'égare.",
            ],
          },
          {
            heading: "Quand le trac devient un problème",
            paragraphs: [
              "L'anxiété pré-compétitive mérite un accompagnement professionnel quand elle commence à vous coûter plus qu'elle ne vous apporte. Parlez-en à un psychologue du sport si vous constatez régulièrement :",
            ],
            bullets: [
              "Plusieurs nuits blanches avant les compétitions.",
              "Des vomissements, des crises de panique ou un blocage avant ou pendant l'épreuve.",
              "L'évitement des compétitions, ou l'envie d'abandonner un sport que vous aimez.",
              "Des performances très en dessous de votre niveau d'entraînement, de façon répétée, sous pression.",
            ],
          },
          {
            heading: "Comment un psychologue du sport vous aide",
            paragraphs: [
              "Le travail commence souvent par cartographier votre propre fonctionnement : quand l'anxiété monte, ce que vous pensez, ce que fait votre corps. À partir de là, vous construisez un plan individuel (respiration, routines, entraînement de l'attention, imagerie mentale) que vous répétez sous une pression croissante. La plupart des sportifs constatent un changement en quelques séances.",
            ],
          },
        ],
        faq: [
          {
            q: "Est-ce normal d'avoir la nausée avant une compétition ?",
            a: "Un ventre noué est un signe courant d'activation et généralement sans gravité. S'il entraîne des vomissements, vous empêche de bien manger ou revient avant chaque épreuve, il vaut la peine d'y travailler avec un professionnel.",
          },
          {
            q: "Faut-il chercher à être totalement calme avant de compétitionner ?",
            a: "Le plus souvent, non. La plupart des sportifs ont besoin d'un certain niveau d'activation pour performer. Le but est de trouver votre niveau, pas de supprimer tout trac.",
          },
          {
            q: "Combien de temps avant la compétition commencer sa routine ?",
            a: "Beaucoup de sportifs utilisent une routine longue de 30 à 60 minutes (échauffement, musique, rappel du plan de jeu) et une routine très courte de quelques secondes avant chaque action. Construisez les deux à l'entraînement.",
          },
        ],
        cta: "Vous voulez un plan construit autour de votre sport et de votre fonctionnement ? Réservez une séance avec un psychologue du sport UPSY.",
      },
    },
  },
  {
    slug: "mental-imagery-for-athletes",
    readMinutes: 6,
    datePublished: "2026-10-20",
    content: {
      en: {
        title: "Mental imagery for athletes: how to train in your head",
        description:
          "Imagery is one of the best-studied tools in sport psychology. Here is how to practise it properly, step by step, with the PETTLEP method.",
        category: "Sport psychology",
        intro:
          "Imagery, often called visualisation, means creating or recreating a sporting experience in your mind. Well practised, it strengthens technique, confidence and readiness for pressure. Badly practised, it is just daydreaming. The difference lies in a few precise rules.",
        sections: [
          {
            heading: "Why it works",
            paragraphs: [
              "Imagining a movement activates many of the same brain regions as performing it. Imagery does not replace physical training, but combined with it, it helps consolidate skills, prepare for specific situations and build confidence. It is also one of the few ways to keep training when you are injured.",
            ],
          },
          {
            heading: "The PETTLEP method",
            paragraphs: [
              "Researchers Holmes and Collins proposed seven principles to make imagery as close as possible to real performance:",
            ],
            bullets: [
              "Physical: adopt the stance and, if possible, wear the kit you compete in.",
              "Environment: imagine (or be in) the real venue, its sounds, its light.",
              "Task: imagine exactly the skill at your current level, not an ideal version.",
              "Timing: imagine at real speed, not in slow motion (except to correct a detail).",
              "Learning: update the content as your skill progresses.",
              "Emotion: include the emotions you will really feel, including nerves.",
              "Perspective: switch between seeing through your own eyes and seeing yourself from the outside.",
            ],
          },
          {
            heading: "A 10-minute session to start",
            paragraphs: [
              "Sit or stand in your competition position. Take three slow breaths. Pick one short sequence (a serve, a start, a free throw). Imagine it in real time, using every sense: what you see, hear, feel in your muscles, the grip, the ground. Repeat five to ten times. Finish by imagining a mistake and your calm recovery from it. Do this three to five times a week.",
            ],
          },
          {
            heading: "Common mistakes",
            paragraphs: [
              "Imagery fails when it is too vague, too rare or too perfect.",
            ],
            bullets: [
              'Only "seeing" the scene without feeling the movement.',
              "Imagining only flawless performances, so the first real setback is a shock.",
              "Practising only the night before a final instead of regularly.",
              "Losing control of the image (seeing yourself fail repeatedly) without stopping and resetting.",
            ],
          },
          {
            heading: "Going further",
            paragraphs: [
              "A sport psychologist can help you build imagery scripts tailored to your sport, record audio guides, and combine imagery with breathing and routines for competition day. If images of failure keep intruding, that is worth addressing directly rather than pushing through.",
            ],
          },
        ],
        faq: [
          {
            q: "Can imagery replace physical training?",
            a: "No. It works best as a complement, and it is especially useful when physical training is limited, such as during injury or travel.",
          },
          {
            q: "I can't 'see' images clearly. Can I still use it?",
            a: "Yes. Imagery ability improves with practice, and feeling the movement often matters more than seeing it. Start with short, simple sequences.",
          },
        ],
        cta: "Want imagery scripts built for your sport? A UPSY sport psychologist can design them with you.",
      },
      fr: {
        title:
          "L'imagerie mentale pour les sportifs : s'entraîner dans sa tête",
        description:
          "L'imagerie est l'un des outils les plus étudiés en psychologie du sport. Voici comment la pratiquer correctement, étape par étape, avec la méthode PETTLEP.",
        category: "Psychologie du sport",
        intro:
          "L'imagerie mentale, souvent appelée visualisation, consiste à créer ou recréer une expérience sportive dans son esprit. Bien pratiquée, elle renforce la technique, la confiance et la préparation à la pression. Mal pratiquée, ce n'est qu'une rêverie. La différence tient à quelques règles précises.",
        sections: [
          {
            heading: "Pourquoi ça marche",
            paragraphs: [
              "Imaginer un geste active une grande partie des régions cérébrales sollicitées pour l'exécuter. L'imagerie ne remplace pas l'entraînement physique, mais combinée à lui, elle aide à consolider les gestes, à se préparer à des situations précises et à construire la confiance. C'est aussi l'une des rares façons de continuer à s'entraîner pendant une blessure.",
            ],
          },
          {
            heading: "La méthode PETTLEP",
            paragraphs: [
              "Les chercheurs Holmes et Collins ont proposé sept principes pour rendre l'imagerie aussi proche que possible de la performance réelle :",
            ],
            bullets: [
              "Physique : adoptez la posture et, si possible, portez la tenue de compétition.",
              "Environnement : imaginez (ou soyez dans) le lieu réel, ses bruits, sa lumière.",
              "Tâche : imaginez le geste exactement à votre niveau actuel, pas une version idéale.",
              "Timing : imaginez à vitesse réelle, pas au ralenti (sauf pour corriger un détail).",
              "Apprentissage : faites évoluer le contenu au rythme de vos progrès.",
              "Émotion : incluez les émotions que vous ressentirez vraiment, y compris le trac.",
              "Perspective : alternez entre la vue à travers vos propres yeux et la vue de l'extérieur.",
            ],
          },
          {
            heading: "Une séance de 10 minutes pour commencer",
            paragraphs: [
              "Asseyez-vous ou tenez-vous dans votre position de compétition. Prenez trois respirations lentes. Choisissez une courte séquence (un service, un départ, un lancer franc). Imaginez-la en temps réel, avec tous vos sens : ce que vous voyez, entendez, ressentez dans vos muscles, la prise, le sol. Répétez cinq à dix fois. Terminez en imaginant une erreur et votre récupération calme. Faites-le trois à cinq fois par semaine.",
            ],
          },
          {
            heading: "Les erreurs fréquentes",
            paragraphs: [
              "L'imagerie échoue quand elle est trop vague, trop rare ou trop parfaite.",
            ],
            bullets: [
              "Seulement « voir » la scène sans ressentir le mouvement.",
              "N'imaginer que des performances parfaites, si bien que le premier vrai revers devient un choc.",
              "Ne pratiquer que la veille d'une finale au lieu de le faire régulièrement.",
              "Perdre le contrôle de l'image (se voir échouer encore et encore) sans s'arrêter pour recommencer.",
            ],
          },
          {
            heading: "Aller plus loin",
            paragraphs: [
              "Un psychologue du sport peut vous aider à construire des scripts d'imagerie adaptés à votre discipline, à enregistrer des guides audio et à combiner imagerie, respiration et routines pour le jour de la compétition. Si des images d'échec s'imposent sans cesse, mieux vaut les travailler directement plutôt que de forcer.",
            ],
          },
        ],
        faq: [
          {
            q: "L'imagerie peut-elle remplacer l'entraînement physique ?",
            a: "Non. Elle fonctionne le mieux en complément, et elle est particulièrement utile quand l'entraînement physique est limité, par exemple pendant une blessure ou un déplacement.",
          },
          {
            q: "Je n'arrive pas à « voir » d'images nettes. Puis-je quand même l'utiliser ?",
            a: "Oui. La capacité d'imagerie progresse avec la pratique, et ressentir le mouvement compte souvent plus que le voir. Commencez par des séquences courtes et simples.",
          },
        ],
        cta: "Vous voulez des scripts d'imagerie construits pour votre sport ? Un psychologue du sport UPSY peut les concevoir avec vous.",
      },
    },
  },
  {
    slug: "injury-recovery-psychology",
    readMinutes: 7,
    datePublished: "2026-10-20",
    content: {
      en: {
        title: "Coming back from injury: the mental side of recovery",
        description:
          "Injury hurts the body and often the mind. What athletes go through after an injury, why fear of re-injury matters, and how to prepare the head for return to play.",
        category: "Sport psychology",
        intro:
          "An injury takes away more than training time. It can take away routine, team life, identity and confidence. Many athletes say the hardest part was not the rehab exercises but the doubt, the frustration and the fear of getting hurt again. Taking care of the mental side is part of a full recovery.",
        sections: [
          {
            heading: "Common reactions after an injury",
            paragraphs: [
              "Shock, anger, sadness, frustration with slow progress, isolation from the team: these reactions are normal and usually change over time. They do not follow a fixed order, and setbacks in rehab can bring them back.",
            ],
          },
          {
            heading: "Fear of re-injury",
            paragraphs: [
              "Fear of getting hurt again is one of the main reasons athletes are physically cleared but not truly ready. It shows up as hesitation, protecting the injured side, avoiding contact or certain movements. It is not cowardice: it is the mind asking for proof that the body is safe. That proof is built gradually, through graded exposure to the movements that scare you, in agreement with your medical team.",
            ],
          },
          {
            heading: "What helps during rehab",
            paragraphs: [],
            bullets: [
              "Short-term goals: weekly targets you control (range of motion, number of sessions, strength milestones) rather than only the return date.",
              "Staying connected: attend training or team meetings when possible, keep a role in the group.",
              "Imagery: rehearsing your sport mentally keeps skills and confidence alive, and imagining the healing process can help motivation.",
              "Honest communication: tell your physio and coach about pain and fear, not just progress.",
              "Sleep, nutrition and recovery: they support both physical healing and mood.",
            ],
          },
          {
            heading: "Ready to return?",
            paragraphs: [
              "Physical clearance and psychological readiness do not always arrive at the same time. Useful questions: Do I trust the injured area? Can I perform at full intensity without holding back? Do I want to return, or do I feel pushed? If the answers are unclear, a few sessions with a sport psychologist before returning to competition can make the difference.",
            ],
          },
          {
            heading: "When to seek help",
            paragraphs: [
              "Seek support if, for more than two weeks, you notice persistent low mood, loss of interest in things you used to enjoy, sleep or appetite changes, withdrawal from others, or if you rely on alcohol or painkillers to cope. If you have thoughts of harming yourself, contact emergency services straight away: SAMU 141 or Police 19 in Morocco.",
            ],
          },
        ],
        faq: [
          {
            q: "Is it normal to feel depressed after an injury?",
            a: "Low mood is common, especially after long or season-ending injuries. If it persists for more than two weeks or affects daily life, talk to a professional.",
          },
          {
            q: "How do I deal with fear when I return?",
            a: "Return step by step: practise the feared movements in controlled conditions first, increase intensity gradually, and work with your medical team and a sport psychologist on a progressive plan.",
          },
        ],
        cta: "Recovering from an injury? A UPSY sport psychologist can support you from rehab to return to play.",
      },
      fr: {
        title: "Revenir de blessure : le versant mental de la récupération",
        description:
          "Une blessure touche le corps et souvent le mental. Ce que vivent les sportifs après une blessure, pourquoi la peur de la rechute compte, et comment préparer la tête au retour au jeu.",
        category: "Psychologie du sport",
        intro:
          "Une blessure enlève plus que du temps d'entraînement. Elle peut enlever la routine, la vie d'équipe, l'identité et la confiance. Beaucoup de sportifs disent que le plus dur n'était pas la rééducation, mais le doute, la frustration et la peur de se blesser à nouveau. Prendre soin du mental fait partie d'une récupération complète.",
        sections: [
          {
            heading: "Les réactions fréquentes après une blessure",
            paragraphs: [
              "Choc, colère, tristesse, frustration face à des progrès lents, isolement du groupe : ces réactions sont normales et évoluent généralement avec le temps. Elles ne suivent pas un ordre fixe, et un revers en rééducation peut les faire revenir.",
            ],
          },
          {
            heading: "La peur de la rechute",
            paragraphs: [
              "La peur de se blesser à nouveau est l'une des principales raisons pour lesquelles un sportif est physiquement apte sans être vraiment prêt. Elle se traduit par de l'hésitation, la protection du côté blessé, l'évitement des contacts ou de certains gestes. Ce n'est pas de la lâcheté : c'est le mental qui demande la preuve que le corps est sûr. Cette preuve se construit progressivement, par une exposition graduelle aux gestes qui font peur, en accord avec votre équipe médicale.",
            ],
          },
          {
            heading: "Ce qui aide pendant la rééducation",
            paragraphs: [],
            bullets: [
              "Des objectifs à court terme : des cibles hebdomadaires que vous contrôlez (amplitude, nombre de séances, paliers de force) plutôt que la seule date de retour.",
              "Rester connecté : assister aux entraînements ou aux réunions d'équipe quand c'est possible, garder un rôle dans le groupe.",
              "L'imagerie mentale : répéter votre sport mentalement entretient les gestes et la confiance, et imaginer la guérison peut soutenir la motivation.",
              "Une communication honnête : parlez de la douleur et de la peur à votre kiné et à votre entraîneur, pas seulement de vos progrès.",
              "Sommeil, nutrition et récupération : ils soutiennent à la fois la guérison physique et l'humeur.",
            ],
          },
          {
            heading: "Prêt à revenir ?",
            paragraphs: [
              "Le feu vert médical et la préparation psychologique n'arrivent pas toujours en même temps. Quelques questions utiles : ai-je confiance dans la zone blessée ? Puis-je jouer à pleine intensité sans me retenir ? Ai-je envie de revenir, ou est-ce que je me sens poussé ? Si les réponses sont floues, quelques séances avec un psychologue du sport avant le retour en compétition peuvent faire la différence.",
            ],
          },
          {
            heading: "Quand demander de l'aide",
            paragraphs: [
              "Demandez du soutien si, pendant plus de deux semaines, vous constatez une humeur basse persistante, une perte d'intérêt pour ce que vous aimiez, des troubles du sommeil ou de l'appétit, un repli sur vous-même, ou si vous comptez sur l'alcool ou les antidouleurs pour tenir. Si vous avez des idées de vous faire du mal, contactez immédiatement les urgences : SAMU 141 ou Police 19.",
            ],
          },
        ],
        faq: [
          {
            q: "Est-ce normal de se sentir déprimé après une blessure ?",
            a: "Une baisse de moral est fréquente, surtout après une blessure longue ou qui met fin à la saison. Si elle dure plus de deux semaines ou affecte la vie quotidienne, parlez-en à un professionnel.",
          },
          {
            q: "Comment gérer la peur au moment du retour ?",
            a: "Revenez par étapes : pratiquez d'abord les gestes redoutés dans des conditions contrôlées, augmentez l'intensité progressivement, et construisez un plan progressif avec votre équipe médicale et un psychologue du sport.",
          },
        ],
        cta: "Vous revenez de blessure ? Un psychologue du sport UPSY peut vous accompagner de la rééducation au retour au jeu.",
      },
    },
  },
  {
    slug: "athlete-burnout",
    readMinutes: 6,
    datePublished: "2026-10-20",
    content: {
      en: {
        title: "Athlete burnout: recognise it early, prevent it for good",
        description:
          "Exhausted, less effective, and losing the love for your sport? These are the three signs of athlete burnout. What causes it and how to protect yourself.",
        category: "Sport psychology",
        intro:
          "Burnout in sport is not just being tired after a hard block. It is a lasting state that builds over months, when demands keep exceeding recovery and meaning. Caught early, it is very manageable. Ignored, it is one of the main reasons talented athletes leave their sport.",
        sections: [
          {
            heading: "The three signs",
            paragraphs: [
              "Researchers describe athlete burnout through three dimensions that tend to appear together:",
            ],
            bullets: [
              "Physical and emotional exhaustion that rest days no longer fix.",
              "A reduced sense of accomplishment: feeling that you are not progressing or that nothing you do is good enough.",
              "Devaluation of the sport: caring less, feeling cynical, training on autopilot.",
            ],
          },
          {
            heading: "What causes it",
            paragraphs: [
              "Burnout rarely has a single cause. Common contributors are training load without enough recovery, early and intense specialisation, an identity built only around the sport, constant pressure for results (from yourself, family, coaches or sponsors), little control over your own schedule, and poor sleep. Life stress outside sport adds to the load.",
            ],
          },
          {
            heading: "Burnout or overtraining?",
            paragraphs: [
              "Overtraining is mainly a physical problem of load and recovery, diagnosed with medical input. Burnout includes the loss of motivation and meaning. They often overlap, which is why both the medical team and a psychologist should be involved when performance and mood drop together.",
            ],
          },
          {
            heading: "Prevention that works",
            paragraphs: [],
            bullets: [
              "Plan recovery as seriously as training: rest days, sleep, real breaks in the season.",
              "Keep a life outside sport: studies, friends, other interests.",
              "Give athletes a say in their schedule and goals.",
              "Talk about how training feels, not only about results.",
              "Monitor early signals: irritability, poor sleep, loss of pleasure, unexplained drops in performance.",
            ],
          },
          {
            heading: "When to get support",
            paragraphs: [
              "If exhaustion and loss of motivation have lasted several weeks despite rest, it is time to talk to a professional. A sport psychologist can help you understand what is draining you, rebuild a sustainable relationship with your sport and, if needed, coordinate with your doctor. If you feel hopeless or have thoughts of harming yourself, contact SAMU (141) or the police (19) immediately.",
            ],
          },
        ],
        faq: [
          {
            q: "Can young athletes burn out?",
            a: "Yes. Early specialisation and heavy pressure can lead to burnout in adolescents. Variety, enjoyment and rest protect them.",
          },
          {
            q: "Do I have to stop my sport to recover?",
            a: "Not always. Often the load, the goals and the balance with life outside sport need to change. A professional can help decide what is right for you.",
          },
        ],
        cta: "Feeling drained by your sport? Talk to a UPSY sport psychologist before it costs you your season.",
      },
      fr: {
        title:
          "Le burn-out du sportif : le repérer tôt, le prévenir durablement",
        description:
          "Épuisé, moins efficace et en train de perdre l'amour de votre sport ? Ce sont les trois signes du burn-out sportif. Ses causes, et comment vous protéger.",
        category: "Psychologie du sport",
        intro:
          "Le burn-out sportif n'est pas une simple fatigue après un bloc difficile. C'est un état durable qui s'installe sur des mois, quand les exigences dépassent sans cesse la récupération et le sens. Repéré tôt, il se gère très bien. Ignoré, c'est l'une des principales raisons pour lesquelles des sportifs talentueux abandonnent leur discipline.",
        sections: [
          {
            heading: "Les trois signes",
            paragraphs: [
              "Les chercheurs décrivent le burn-out sportif à travers trois dimensions qui apparaissent souvent ensemble :",
            ],
            bullets: [
              "Un épuisement physique et émotionnel que les jours de repos ne suffisent plus à effacer.",
              "Un sentiment d'accomplissement réduit : l'impression de ne plus progresser ou que rien n'est jamais assez bien.",
              "Une dévalorisation du sport : moins d'intérêt, du cynisme, des entraînements en pilote automatique.",
            ],
          },
          {
            heading: "Ce qui le provoque",
            paragraphs: [
              "Le burn-out a rarement une seule cause. Les facteurs fréquents sont une charge d'entraînement sans récupération suffisante, une spécialisation précoce et intense, une identité construite uniquement autour du sport, une pression constante sur les résultats (de soi-même, de la famille, des entraîneurs ou des sponsors), peu de contrôle sur son propre emploi du temps et un mauvais sommeil. Le stress de la vie hors sport s'ajoute à la charge.",
            ],
          },
          {
            heading: "Burn-out ou surentraînement ?",
            paragraphs: [
              "Le surentraînement est surtout un problème physique de charge et de récupération, diagnostiqué avec un avis médical. Le burn-out inclut la perte de motivation et de sens. Les deux se chevauchent souvent : c'est pourquoi l'équipe médicale et un psychologue devraient être impliqués quand la performance et l'humeur baissent ensemble.",
            ],
          },
          {
            heading: "Une prévention qui fonctionne",
            paragraphs: [],
            bullets: [
              "Planifier la récupération aussi sérieusement que l'entraînement : jours de repos, sommeil, vraies coupures dans la saison.",
              "Garder une vie en dehors du sport : études, amis, autres centres d'intérêt.",
              "Donner aux sportifs leur mot à dire sur leur planning et leurs objectifs.",
              "Parler de la façon dont l'entraînement est vécu, pas seulement des résultats.",
              "Surveiller les signaux précoces : irritabilité, sommeil perturbé, perte de plaisir, baisses de performance inexpliquées.",
            ],
          },
          {
            heading: "Quand demander du soutien",
            paragraphs: [
              "Si l'épuisement et la perte de motivation durent depuis plusieurs semaines malgré le repos, il est temps d'en parler à un professionnel. Un psychologue du sport peut vous aider à comprendre ce qui vous épuise, à reconstruire une relation durable avec votre sport et, si nécessaire, à vous coordonner avec votre médecin. Si vous vous sentez sans espoir ou avez des idées de vous faire du mal, contactez immédiatement le SAMU (141) ou la police (19).",
            ],
          },
        ],
        faq: [
          {
            q: "Les jeunes sportifs peuvent-ils faire un burn-out ?",
            a: "Oui. Une spécialisation précoce et une forte pression peuvent mener au burn-out chez l'adolescent. La variété, le plaisir et le repos les protègent.",
          },
          {
            q: "Dois-je arrêter mon sport pour récupérer ?",
            a: "Pas toujours. Souvent, ce sont la charge, les objectifs et l'équilibre avec la vie hors sport qui doivent changer. Un professionnel peut vous aider à décider ce qui vous convient.",
          },
        ],
        cta: "Votre sport vous épuise ? Parlez-en à un psychologue du sport UPSY avant que cela ne vous coûte votre saison.",
      },
    },
  },
  {
    slug: "when-to-see-a-sport-psychologist",
    readMinutes: 5,
    datePublished: "2026-10-20",
    content: {
      en: {
        title: "When should an athlete see a sport psychologist?",
        description:
          "You don't need to be in crisis to work with a sport psychologist. What they do, the myths that hold athletes back, and what a first session looks like.",
        category: "Guide",
        intro:
          "Top athletes work with a sport psychologist the way they work with a physical trainer: to get better, not because something is wrong. Yet many athletes wait until a problem becomes impossible to ignore. Here is when it makes sense to start, and what to expect.",
        sections: [
          {
            heading: "What a sport psychologist does",
            paragraphs: [
              "A sport psychologist helps athletes, coaches and teams with the mental side of performance and well-being: managing pressure, concentration, confidence, motivation, communication within a team, transitions (injury, selection, end of career), and the balance between sport and the rest of life. A clinical psychologist trained in sport can also address anxiety, low mood, eating difficulties or other mental health concerns.",
            ],
          },
          {
            heading: "Myths that hold athletes back",
            paragraphs: [],
            bullets: [
              '"It\'s only for weak athletes." Mental skills are trained like physical ones, and elite athletes use them.',
              '"My coach will know everything." Sessions are confidential. What is shared with a coach or club is agreed with you beforehand.',
              '"It takes years." Many performance goals are worked on in a handful of focused sessions.',
              '"I should handle it alone." Asking for help early prevents small difficulties from becoming big ones.',
            ],
          },
          {
            heading: "Good reasons to start",
            paragraphs: [],
            bullets: [
              "You perform well in training but not in competition.",
              "Nerves, doubt or anger affect your game.",
              "You are coming back from injury or facing a big change.",
              "You have lost motivation or enjoyment.",
              "You want an edge: routines, focus, imagery, goal setting.",
              "Your sleep, mood or eating are affected by your sport.",
            ],
          },
          {
            heading: "What a first session looks like",
            paragraphs: [
              "The first meeting is mostly a conversation: your sport, your goals, what is working and what is not. Your psychologist may use short questionnaires to understand your profile. Together you agree on objectives and a rhythm of sessions. On UPSY you can choose a specialist, book online or in person, and pay at the session.",
            ],
          },
        ],
        faq: [
          {
            q: "Is a sport psychologist the same as a mental coach?",
            a: "Not exactly. A psychologist has university training in psychology and is bound by professional ethics and confidentiality. On UPSY, specialists are reviewed before they can be booked.",
          },
          {
            q: "Can I do sessions online?",
            a: "Yes. Many specialists on UPSY offer secure video sessions, which is practical around training and travel.",
          },
        ],
        cta: "Ready to start? Browse UPSY's sport psychologists and request a session in a few clicks.",
      },
      fr: {
        title:
          "Quand un sportif devrait-il consulter un psychologue du sport ?",
        description:
          "Pas besoin d'être en crise pour travailler avec un psychologue du sport. Ce qu'il fait, les idées reçues qui freinent les sportifs, et à quoi ressemble une première séance.",
        category: "Guide",
        intro:
          "Les sportifs de haut niveau travaillent avec un psychologue du sport comme avec un préparateur physique : pour progresser, pas parce que quelque chose ne va pas. Pourtant, beaucoup attendent qu'un problème devienne impossible à ignorer. Voici quand il est utile de commencer, et à quoi vous attendre.",
        sections: [
          {
            heading: "Ce que fait un psychologue du sport",
            paragraphs: [
              "Un psychologue du sport aide les sportifs, entraîneurs et équipes sur le versant mental de la performance et du bien-être : gestion de la pression, concentration, confiance, motivation, communication dans l'équipe, transitions (blessure, sélection, fin de carrière) et équilibre entre le sport et le reste de la vie. Un psychologue clinicien formé au sport peut aussi prendre en charge l'anxiété, la baisse de moral, les difficultés alimentaires ou d'autres questions de santé mentale.",
            ],
          },
          {
            heading: "Les idées reçues qui freinent",
            paragraphs: [],
            bullets: [
              "« C'est pour les sportifs faibles. » Les compétences mentales s'entraînent comme les compétences physiques, et les sportifs d'élite les utilisent.",
              "« Mon entraîneur saura tout. » Les séances sont confidentielles. Ce qui est partagé avec un entraîneur ou un club est convenu avec vous à l'avance.",
              "« Ça prend des années. » Beaucoup d'objectifs de performance se travaillent en quelques séances ciblées.",
              "« Je dois m'en sortir seul. » Demander de l'aide tôt évite que de petites difficultés deviennent grandes.",
            ],
          },
          {
            heading: "De bonnes raisons de commencer",
            paragraphs: [],
            bullets: [
              "Vous êtes performant à l'entraînement mais pas en compétition.",
              "Le trac, le doute ou la colère perturbent votre jeu.",
              "Vous revenez de blessure ou faites face à un grand changement.",
              "Vous avez perdu la motivation ou le plaisir.",
              "Vous voulez un avantage : routines, concentration, imagerie, fixation d'objectifs.",
              "Votre sommeil, votre humeur ou votre alimentation sont affectés par votre sport.",
            ],
          },
          {
            heading: "À quoi ressemble une première séance",
            paragraphs: [
              "La première rencontre est surtout une conversation : votre sport, vos objectifs, ce qui fonctionne et ce qui coince. Votre psychologue peut utiliser de courts questionnaires pour comprendre votre profil. Ensemble, vous fixez des objectifs et un rythme de séances. Sur UPSY, vous choisissez votre spécialiste, réservez en ligne ou au cabinet, et réglez à la séance.",
            ],
          },
        ],
        faq: [
          {
            q: "Un psychologue du sport, c'est la même chose qu'un coach mental ?",
            a: "Pas exactement. Un psychologue a une formation universitaire en psychologie et est tenu par une déontologie et le secret professionnel. Sur UPSY, les spécialistes sont vérifiés avant de pouvoir être réservés.",
          },
          {
            q: "Puis-je faire les séances en ligne ?",
            a: "Oui. De nombreux spécialistes sur UPSY proposent des séances vidéo sécurisées, pratiques entre les entraînements et les déplacements.",
          },
        ],
        cta: "Prêt à commencer ? Parcourez les psychologues du sport UPSY et demandez une séance en quelques clics.",
      },
    },
  },
];

export const ARTICLES: Article[] = [...(NEWS as Article[]), ...WRITTEN];

export const articleLang = (locale: string): ArticleLang =>
  locale === "en" ? "en" : "fr";

export const findArticle = (slug: string) =>
  ARTICLES.find((a) => a.slug === slug);
