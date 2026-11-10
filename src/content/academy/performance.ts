import type { AcademyCourse } from "./types";

/** Sport performance and workplace / organisation courses. */
export const PERFORMANCE_COURSES: AcademyCourse[] = [
  // ------------------------------------------------------------------------
  {
    slug: "sport-psychology-fundamentals-756683",
    category: "sport_psychology",
    level: "beginner",
    title: {
      en: "Sport Psychology Fundamentals",
      fr: "Fondamentaux de la psychologie du sport",
      ar: "أساسيات علم النفس الرياضي",
    },
    description: {
      en: "The mental skills behind performance: goals, arousal control, self-talk and routines, with exercises to use in training.",
      fr: "Les habiletés mentales de la performance : objectifs, gestion de l'activation, discours interne et routines, avec des exercices à faire à l'entraînement.",
      ar: "المهارات الذهنية وراء الأداء: الأهداف، التحكم في التنشيط، الحوار الذاتي والروتين، مع تمارين للتدريب.",
    },
    modules: [
      {
        order: 1,
        minutes: 12,
        title: {
          en: "Mental skills are trained",
          fr: "Les habiletés mentales s'entraînent",
          ar: "المهارات الذهنية تُدرَّب",
        },
        content: {
          en: `Confidence, concentration, motivation and emotional control are not fixed traits: they are **skills** that improve with deliberate practice, like technique or fitness. Elite athletes train them in every session, not only before big competitions.

The foundation is **goal setting**. Three types work together:
- **Outcome goals** (win, qualify): motivating, but partly outside your control.
- **Performance goals** (beat your own time, 80% first serves): compared with yourself.
- **Process goals** ("high elbow", "eyes on the ball"): fully controllable, they direct attention during competition.

Goals that are specific and challenging but achievable improve performance more than "do your best" (Locke & Latham).

Read [Mental preparation for athletes: the basics](/resources/sport-mental-prep).

**Exercise.** Write one outcome goal for the season, two performance goals for the month, and three process goals for your next session. Fill in the 4-week plan at the end of the guide.`,
          fr: `La confiance, la concentration, la motivation et le contrôle émotionnel ne sont pas des traits figés : ce sont des **habiletés** qui progressent avec un entraînement délibéré, comme la technique ou la condition physique. Les athlètes de haut niveau les travaillent à chaque séance, pas seulement avant les grandes compétitions.

La base est la **fixation d'objectifs**. Trois types fonctionnent ensemble :
- **Objectifs de résultat** (gagner, se qualifier) : motivants, mais en partie hors de votre contrôle.
- **Objectifs de performance** (battre son temps, 80 % de premières balles) : comparés à soi-même.
- **Objectifs de processus** (« coude haut », « les yeux sur le ballon ») : entièrement contrôlables, ils orientent l'attention en compétition.

Des objectifs précis, difficiles mais atteignables améliorent davantage la performance que « fais de ton mieux » (Locke et Latham).

Lisez [La préparation mentale du sportif : les bases](/resources/sport-mental-prep).

**Exercice.** Écrivez un objectif de résultat pour la saison, deux objectifs de performance pour le mois, et trois objectifs de processus pour votre prochaine séance. Remplissez le plan sur 4 semaines à la fin du guide.`,
        },
      },
      {
        order: 2,
        minutes: 12,
        title: {
          en: "Arousal and your optimal zone",
          fr: "L'activation et votre zone optimale",
          ar: "التنشيط ومنطقتك المثلى",
        },
        content: {
          en: `Performance depends on arousal, the body's level of activation. The classic **inverted-U** describes a curve: too little arousal and you are flat, too much and you get tight, with the best performance somewhere in between.

Hanin's **IZOF** model (individual zones of optimal functioning) adds that this zone is **personal**: some athletes perform best very calm, others highly charged. It also varies with the task: a golf putt needs less arousal than a weightlifting attempt.

**Find your zone.** Recall your three best and three worst performances. Rate how activated you felt before each (0–10). Your best zone usually appears.

**To come down:** slow breathing with a long out-breath ([box breathing](/resources/box-breathing)), progressive muscle relaxation, a calm cue word.

**To come up:** energising music, dynamic warm-up, a motivational cue word, a short visualisation of an explosive start.

**Exercise.** Before your next three sessions, rate your arousal, use one technique to move towards your zone, and rate it again.`,
          fr: `La performance dépend de l'activation, le niveau d'éveil du corps. Le **U inversé** classique décrit une courbe : trop peu d'activation et on manque de mordant, trop et on se crispe, avec la meilleure performance quelque part entre les deux.

Le modèle **IZOF** de Hanin (zones individuelles de fonctionnement optimal) ajoute que cette zone est **personnelle** : certains athlètes performent mieux très calmes, d'autres très chargés. Elle varie aussi selon la tâche : un putt au golf demande moins d'activation qu'un essai en haltérophilie.

**Trouvez votre zone.** Rappelez-vous vos trois meilleures et vos trois pires performances. Notez votre niveau d'activation avant chacune (0–10). Votre zone optimale apparaît en général.

**Pour descendre :** respiration lente avec expiration longue ([respiration carrée](/resources/box-breathing)), relaxation musculaire progressive, un mot-clé apaisant.

**Pour monter :** musique énergisante, échauffement dynamique, mot-clé motivant, courte visualisation d'un départ explosif.

**Exercice.** Avant vos trois prochaines séances, notez votre activation, utilisez une technique pour rejoindre votre zone, puis notez-la à nouveau.`,
        },
      },
      {
        order: 3,
        minutes: 10,
        title: {
          en: "Self-talk that works",
          fr: "Un discours interne qui fonctionne",
          ar: "حوار ذاتي فعّال",
        },
        content: {
          en: `What athletes say to themselves affects attention, effort and emotion. A meta-analysis of 32 studies found that self-talk strategies improve performance (Hatzigeorgiadis et al., 2011).

Two types:
- **Instructional** ("quick feet", "follow through"): especially useful for precision and technical skills.
- **Motivational** ("push", "I've got this"): especially useful for strength and endurance.

Some studies suggest that talking to yourself in the **second person** ("you can do it") can help more than the first person.

**Build your cue words:**
1. Note what you usually say to yourself after a mistake.
2. Replace critical phrases with a short reset word ("next", "reset").
3. Choose one instructional and one motivational cue for your sport.
4. Practise them in training until they are automatic.

**Exercise.** During your next session, say your reset word after every mistake and notice how quickly you refocus.`,
          fr: `Ce que l'athlète se dit influence l'attention, l'effort et l'émotion. Une méta-analyse de 32 études a montré que les stratégies de discours interne améliorent la performance (Hatzigeorgiadis et al., 2011).

Deux types :
- **Instructionnel** (« pieds rapides », « accompagne le geste ») : particulièrement utile pour les tâches de précision et techniques.
- **Motivationnel** (« pousse », « je l'ai ») : particulièrement utile pour la force et l'endurance.

Certaines études suggèrent que se parler à la **deuxième personne** (« tu peux le faire ») aiderait davantage que la première personne.

**Construisez vos mots-clés :**
1. Notez ce que vous vous dites habituellement après une erreur.
2. Remplacez les phrases critiques par un mot court de remise à zéro (« suivant », « reset »).
3. Choisissez un mot-clé instructionnel et un motivationnel pour votre sport.
4. Pratiquez-les à l'entraînement jusqu'à ce qu'ils deviennent automatiques.

**Exercice.** Pendant votre prochaine séance, dites votre mot de remise à zéro après chaque erreur et observez la vitesse à laquelle vous vous recentrez.`,
        },
      },
      {
        order: 4,
        minutes: 10,
        title: {
          en: "Routines, not superstitions",
          fr: "Des routines, pas des superstitions",
          ar: "روتين، لا خرافات",
        },
        content: {
          en: `A **routine** is a controllable sequence of actions and thoughts that prepares performance: bouncing the ball before a free throw, a breath and a cue word before a serve. Research associates consistent routines with better performance, especially under pressure (Cotterill, 2010).

A **superstition** depends on something you do not control (the lucky socks, the same seat on the bus). It may comfort, but when the condition is missing it creates anxiety and fragility.

Test: **if this element were missing, could I still perform?** If the answer is no, turn it into something controllable.

A good routine:
- is short (5 to 15 seconds for a closed skill),
- includes a physical anchor, a breath, an intention and a trigger word,
- has a shortened "plan B" version for when time is short,
- is practised in training, not invented on match day.

Build yours with the [pre-performance routine worksheet](/resources/pre-performance-routine).

**Further reading:** Weinberg, R. S., & Gould, D. (2023). *Foundations of Sport and Exercise Psychology* (8th ed.). Human Kinetics.`,
          fr: `Une **routine** est une séquence contrôlable de gestes et de pensées qui prépare la performance : faire rebondir le ballon avant un lancer franc, une respiration et un mot-clé avant un service. Les recherches associent des routines régulières à une meilleure performance, surtout sous pression (Cotterill, 2010).

Une **superstition** dépend de quelque chose qu'on ne contrôle pas (les chaussettes porte-bonheur, la même place dans le bus). Elle peut rassurer, mais quand la condition manque, elle crée de l'anxiété et de la fragilité.

Test : **si cet élément manquait, pourrais-je quand même performer ?** Si la réponse est non, transformez-le en quelque chose de contrôlable.

Une bonne routine :
- est courte (5 à 15 secondes pour un geste fermé),
- comprend un ancrage physique, une respiration, une intention et un mot déclencheur,
- a une version raccourcie « plan B » pour quand le temps manque,
- se travaille à l'entraînement, et ne s'invente pas le jour du match.

Construisez la vôtre avec la [fiche de routine de pré-performance](/resources/pre-performance-routine).

**Pour aller plus loin :** Weinberg, R. S., & Gould, D. (2023). *Foundations of Sport and Exercise Psychology* (8th ed.). Human Kinetics.`,
        },
      },
    ],
  },

  // ------------------------------------------------------------------------
  {
    slug: "pre-competition-mental-preparation-5a2ebe",
    category: "sport_psychology",
    level: "intermediate",
    title: {
      en: "Pre-Competition Mental Preparation",
      fr: "Préparation mentale avant la compétition",
      ar: "التحضير الذهني قبل المنافسة",
    },
    description: {
      en: "The two weeks before a competition: planning, visualisation, the pre-event ritual, the night before and the debrief.",
      fr: "Les deux semaines avant une compétition : planification, visualisation, rituel d'avant-épreuve, la veille et le débrief.",
      ar: "الأسبوعان قبل المنافسة: التخطيط، التخيل، طقوس ما قبل الحدث، الليلة السابقة، والمراجعة.",
    },
    modules: [
      {
        order: 1,
        minutes: 12,
        title: {
          en: "The two-week countdown",
          fr: "Le compte à rebours de deux semaines",
          ar: "العد التنازلي لأسبوعين",
        },
        content: {
          en: `Mental preparation for an important competition starts well before the day.

**Two weeks out:**
- Clarify your process goals for the event.
- Start regular visualisation sessions (module 2).
- Run through scenarios: "what if I'm behind at half-time?", "what if the start is delayed?". For each, write your planned response. This is sometimes called **if–then planning**.

**One week out:**
- Rehearse your pre-event routine in training, in real conditions.
- Make sleep a priority: regular bedtime and wake time.
- Reduce extra sources of stress where you can (logistics planned in advance, bag prepared).

**Two to three days out:**
- Keep training familiar; no big changes.
- Review your plan, your cue words and your if–then responses.
- Allow yourself normal nerves: they are a sign the event matters, not a sign of weakness.

**Exercise.** Write five "if… then I will…" plans for your next competition.`,
          fr: `La préparation mentale d'une compétition importante commence bien avant le jour J.

**À deux semaines :**
- Clarifiez vos objectifs de processus pour l'épreuve.
- Commencez des séances de visualisation régulières (module 2).
- Envisagez des scénarios : « et si je suis mené à la mi-temps ? », « et si le départ est retardé ? ». Pour chacun, écrivez votre réponse prévue. On parle parfois de **plans « si… alors… »**.

**À une semaine :**
- Répétez votre routine d'avant-épreuve à l'entraînement, en conditions réelles.
- Faites du sommeil une priorité : heures de coucher et de lever régulières.
- Réduisez les sources de stress annexes quand c'est possible (logistique prévue à l'avance, sac préparé).

**À deux ou trois jours :**
- Gardez un entraînement familier, sans grand changement.
- Relisez votre plan, vos mots-clés et vos réponses « si… alors… ».
- Autorisez-vous un trac normal : c'est le signe que l'épreuve compte, pas une faiblesse.

**Exercice.** Écrivez cinq plans « si… alors je… » pour votre prochaine compétition.`,
        },
      },
      {
        order: 2,
        minutes: 15,
        title: {
          en: "Visualisation that transfers",
          fr: "Une visualisation qui se transfère",
          ar: "تخيّل ينتقل إلى الأداء",
        },
        content: {
          en: `Imagery activates brain processes close to those of real movement. A meta-analysis of imagery interventions in sport found positive effects on performance, motivation and confidence (Simonsmeier et al., 2021).

To transfer to competition, imagery should resemble reality. The **PETTLEP** model gives seven anchors:
- **Physical**: same posture, same kit, even the equipment in hand.
- **Environment**: the actual venue, or photos and videos of it.
- **Task**: the real skill, at your level.
- **Timing**: in real time, not slow motion.
- **Learning**: update the script as your skills develop.
- **Emotion**: feel the real emotions, including nerves.
- **Perspective**: from inside your body or as a spectator; both can help.

Include a **setback** in your script (a mistake, a bad call) and your response to it: it prepares you to bounce back.

Use the [visualisation script](/resources/visualization-script) to write your own.

**Exercise.** Practise your script for five minutes, four times this week, ideally in your kit.`,
          fr: `L'imagerie active des processus cérébraux proches de ceux du mouvement réel. Une méta-analyse des interventions par imagerie en sport a montré des effets positifs sur la performance, la motivation et la confiance (Simonsmeier et al., 2021).

Pour se transférer en compétition, l'imagerie doit ressembler à la réalité. Le modèle **PETTLEP** propose sept repères :
- **Physique** : même posture, même tenue, voire l'équipement en main.
- **Environnement** : le vrai lieu, ou des photos et vidéos du lieu.
- **Tâche** : le vrai geste, à votre niveau.
- **Timing** : en temps réel, pas au ralenti.
- **Apprentissage** : faire évoluer le script avec vos progrès.
- **Émotion** : ressentir les vraies émotions, y compris le trac.
- **Perspective** : de l'intérieur de votre corps ou en spectateur ; les deux peuvent aider.

Incluez un **imprévu** dans votre script (une erreur, une décision contestée) et votre réponse : cela prépare à rebondir.

Utilisez le [script de visualisation](/resources/visualization-script) pour écrire le vôtre.

**Exercice.** Pratiquez votre script cinq minutes, quatre fois cette semaine, si possible en tenue.`,
        },
      },
      {
        order: 3,
        minutes: 12,
        title: {
          en: "Designing your pre-event ritual",
          fr: "Construire son rituel d'avant-épreuve",
          ar: "تصميم طقوس ما قبل الحدث",
        },
        content: {
          en: `In the hour before competing, a structured sequence keeps attention on what you control. A simple 30-minute frame to adapt to your sport:

1. **Activation (≈10 min):** physical warm-up, music if it helps, moving towards your optimal arousal zone.
2. **Focus (≈10 min):** breathing, your cue words, reviewing two or three process goals.
3. **Commitment (≈10 min):** short visualisation of the start and of one key action, then a final trigger ("let's go").

Plan **where** and **when** each part happens, and what you will do if the schedule changes (a delay, a crowded warm-up area). A shortened 5-minute version is useful in case of surprise.

Avoid introducing anything new on the day: new food, new equipment, new routines.

Your ritual connects with your skill-level routine: see the [pre-performance routine worksheet](/resources/pre-performance-routine).

**Exercise.** Write your ritual minute by minute and rehearse it before your next training match.`,
          fr: `Dans l'heure qui précède la compétition, une séquence structurée garde l'attention sur ce que vous contrôlez. Un cadre simple de 30 minutes, à adapter à votre sport :

1. **Activation (≈10 min) :** échauffement physique, musique si elle vous aide, pour rejoindre votre zone d'activation optimale.
2. **Concentration (≈10 min) :** respiration, mots-clés, rappel de deux ou trois objectifs de processus.
3. **Engagement (≈10 min) :** courte visualisation du départ et d'une action clé, puis un déclencheur final (« c'est parti »).

Prévoyez **où** et **quand** se déroule chaque partie, et ce que vous ferez si le programme change (un retard, une zone d'échauffement bondée). Une version raccourcie de 5 minutes est utile en cas d'imprévu.

Évitez d'introduire quoi que ce soit de nouveau le jour J : nouvelle alimentation, nouvel équipement, nouvelle routine.

Votre rituel s'articule avec votre routine de geste : voir la [fiche de routine de pré-performance](/resources/pre-performance-routine).

**Exercice.** Écrivez votre rituel minute par minute et répétez-le avant votre prochain match d'entraînement.`,
        },
      },
      {
        order: 4,
        minutes: 10,
        title: {
          en: "The night before, and the debrief",
          fr: "La veille, et le débrief",
          ar: "الليلة السابقة والمراجعة",
        },
        content: {
          en: `**The night before** is not the time to gain anything, only to avoid losing anything.
- Familiar, light meal at the usual time.
- Bag and plan prepared, written down beside you.
- Screens off about an hour before bed.
- If sleep doesn't come, don't fight it: rest quietly, use slow breathing. One poorer night before an event usually has little impact on performance; worrying about it does more harm.
- If thoughts are racing, write them down with your planned response and close the notebook.

**After the event**, once the emotion has settled (a few hours or the next day), run a structured debrief. Use the [4-question debrief](/resources/post-event-debrief):
1. What happened (facts only)?
2. What worked, and why?
3. What would I do differently, among the things I control?
4. What is my single action point for next time?

Do it after wins as well as losses.

**Exercise.** After your next competition, complete the debrief table and share it with your coach.`,
          fr: `**La veille** n'est pas le moment de gagner quelque chose, seulement d'éviter d'en perdre.
- Un repas familier et léger, à l'heure habituelle.
- Sac et plan préparés, écrits à côté de vous.
- Écrans éteints environ une heure avant le coucher.
- Si le sommeil ne vient pas, ne luttez pas : reposez-vous au calme, respirez lentement. Une nuit moins bonne avant une épreuve a en général peu d'effet sur la performance ; s'en inquiéter fait plus de mal.
- Si les pensées s'emballent, écrivez-les avec votre réponse prévue et refermez le carnet.

**Après l'épreuve**, une fois l'émotion retombée (quelques heures ou le lendemain), faites un débrief structuré. Utilisez le [débrief en 4 questions](/resources/post-event-debrief) :
1. Que s'est-il passé (les faits) ?
2. Qu'est-ce qui a marché, et pourquoi ?
3. Que ferais-je différemment, parmi ce qui dépend de moi ?
4. Quel est mon unique point d'action pour la prochaine fois ?

Faites-le après les victoires comme après les défaites.

**Exercice.** Après votre prochaine compétition, remplissez le tableau du débrief et partagez-le avec votre entraîneur.`,
        },
      },
    ],
  },

  // ------------------------------------------------------------------------
  {
    slug: "corporate-wellbeing-program-f5b30f",
    category: "corporate",
    level: "intermediate",
    title: {
      en: "Workplace Mental Health Programme",
      fr: "Programme de santé mentale au travail",
      ar: "برنامج الصحة النفسية في العمل",
    },
    description: {
      en: "For HR, managers and organisations: the WHO framework, psychological safety, workload and recovery, and how to measure without exposing anyone.",
      fr: "Pour les RH, managers et organisations : le cadre de l'OMS, la sécurité psychologique, la charge et la récupération, et comment mesurer sans exposer personne.",
      ar: "للموارد البشرية والمديرين والمؤسسات: إطار منظمة الصحة العالمية، الأمان النفسي، عبء العمل والتعافي، وكيفية القياس دون كشف أحد.",
    },
    modules: [
      {
        order: 1,
        minutes: 12,
        title: {
          en: "Why it matters, and the WHO framework",
          fr: "Pourquoi c'est important, et le cadre de l'OMS",
          ar: "لماذا يهم الأمر، وإطار منظمة الصحة العالمية",
        },
        content: {
          en: `The WHO estimates that depression and anxiety cost the global economy around **12 billion working days** a year, mostly through lost productivity. Work can protect mental health, or damage it.

In 2022, the WHO published its first **guidelines on mental health at work**. They recommend action on three levels:
1. **Organisational interventions**: addressing psychosocial risks at the source (workload, control over one's work, role clarity, support, fairness, harassment).
2. **Training for managers**, so they can recognise distress and respond supportively.
3. **Individual interventions**: stress management training, physical activity, access to care.

Programmes that only offer individual tools (a meditation app, a yoga session) without changing working conditions tend to have limited effects.

**Exercise.** List the main psychosocial risks in your organisation using the six headings above. For each, rate the current situation (green / orange / red) and note who could act on it.`,
          fr: `L'OMS estime que la dépression et l'anxiété coûtent à l'économie mondiale environ **12 milliards de journées de travail** par an, surtout en perte de productivité. Le travail peut protéger la santé mentale, ou l'abîmer.

En 2022, l'OMS a publié ses premières **lignes directrices sur la santé mentale au travail**. Elles recommandent d'agir à trois niveaux :
1. **Interventions organisationnelles** : traiter les risques psychosociaux à la source (charge de travail, marge de manœuvre, clarté des rôles, soutien, équité, harcèlement).
2. **Formation des managers**, pour qu'ils sachent repérer la détresse et y répondre de façon soutenante.
3. **Interventions individuelles** : formation à la gestion du stress, activité physique, accès aux soins.

Les programmes qui proposent seulement des outils individuels (une application de méditation, une séance de yoga) sans changer les conditions de travail ont en général des effets limités.

**Exercice.** Listez les principaux risques psychosociaux de votre organisation selon les six rubriques ci-dessus. Pour chacun, évaluez la situation actuelle (vert / orange / rouge) et notez qui pourrait agir.`,
        },
      },
      {
        order: 2,
        minutes: 12,
        title: {
          en: "Psychological safety",
          fr: "La sécurité psychologique",
          ar: "الأمان النفسي",
        },
        content: {
          en: `Amy Edmondson defines psychological safety as a shared belief that the team is safe for **interpersonal risk-taking**: asking a question, admitting a mistake, raising a concern, proposing an idea. Her research links it to team learning and performance, and Google's internal study of its teams (Project Aristotle) found it was the most important of the dynamics it examined.

Psychological safety is not about being nice or lowering standards. High standards **and** high safety produce learning; high standards with low safety produce anxiety and hidden problems.

What leaders can do:
- **Frame the work** as learning: "we've never done this; we'll need everyone's input."
- **Show fallibility**: "I may have missed something. What do you see?"
- **Respond productively** to bad news: thank the messenger, look forward, fix the system rather than blame the person.
- Invite quieter voices explicitly.

**Exercise.** In your next three meetings, ask one open question inviting disagreement, and note how many people speak who usually don't.`,
          fr: `Amy Edmondson définit la sécurité psychologique comme la conviction partagée que l'équipe permet de **prendre des risques interpersonnels** : poser une question, reconnaître une erreur, signaler un problème, proposer une idée. Ses recherches la relient à l'apprentissage et à la performance des équipes, et l'étude interne de Google sur ses équipes (projet Aristotle) en a fait la plus importante des dynamiques examinées.

La sécurité psychologique ne veut pas dire être gentil ou baisser les exigences. Des exigences élevées **et** une sécurité élevée produisent de l'apprentissage ; des exigences élevées avec une faible sécurité produisent de l'anxiété et des problèmes cachés.

Ce que les responsables peuvent faire :
- **Présenter le travail** comme un apprentissage : « on n'a jamais fait ça ; on aura besoin de l'avis de chacun ».
- **Montrer sa faillibilité** : « j'ai peut-être raté quelque chose. Qu'est-ce que vous voyez ? »
- **Bien réagir** aux mauvaises nouvelles : remercier celui qui les apporte, regarder vers l'avant, corriger le système plutôt que blâmer la personne.
- Inviter explicitement les voix plus discrètes.

**Exercice.** Lors de vos trois prochaines réunions, posez une question ouverte qui invite au désaccord, et notez combien de personnes s'expriment alors qu'elles le font rarement.`,
        },
      },
      {
        order: 3,
        minutes: 12,
        title: {
          en: "Workload, boundaries and recovery",
          fr: "Charge de travail, limites et récupération",
          ar: "عبء العمل والحدود والتعافي",
        },
        content: {
          en: `Burnout is driven mainly by working conditions, especially **chronic overload**, lack of control and lack of recognition. Individual resilience cannot compensate for a structurally impossible workload.

Organisational levers:
- Make workload **visible**: shared priorities, realistic deadlines, an explicit "stop doing" list.
- Protect **recovery**: no expectation of replies outside working hours, holidays actually taken, meetings ending before the end of the day.
- Give **control**: involve people in decisions about how they work.
- **Recognise** effort, not only results.

Individual levers to offer teams:
- [Deep work blocks](/resources/deep-work-blocks) to reduce fragmentation.
- [Boundary scripts](/resources/boundary-scripts) and [DEAR MAN](/resources/dear-man-script) to negotiate priorities.
- The [Stress Management Essentials](/learn) course.

**Exercise.** With your team, list the recurring tasks and meetings. Mark those that could be dropped, shortened or delegated, and agree on one change for the next month.`,
          fr: `L'épuisement professionnel est surtout causé par les conditions de travail, en particulier la **surcharge chronique**, le manque de contrôle et le manque de reconnaissance. La résilience individuelle ne peut pas compenser une charge structurellement impossible.

Leviers organisationnels :
- Rendre la charge **visible** : priorités partagées, délais réalistes, liste explicite de ce qu'on arrête de faire.
- Protéger la **récupération** : pas d'attente de réponse en dehors des heures de travail, congés réellement pris, réunions terminées avant la fin de journée.
- Donner du **contrôle** : associer les personnes aux décisions sur leur façon de travailler.
- **Reconnaître** l'effort, pas seulement les résultats.

Leviers individuels à proposer aux équipes :
- Les [blocs de travail profond](/resources/deep-work-blocks) pour réduire la fragmentation.
- Les [phrases pour poser ses limites](/resources/boundary-scripts) et [DEAR MAN](/resources/dear-man-script) pour négocier les priorités.
- Le cours [L'essentiel de la gestion du stress](/learn).

**Exercice.** Avec votre équipe, listez les tâches et réunions récurrentes. Marquez celles qui pourraient être supprimées, raccourcies ou déléguées, et décidez d'un changement pour le mois prochain.`,
        },
      },
      {
        order: 4,
        minutes: 12,
        title: {
          en: "Measuring without exposing anyone",
          fr: "Mesurer sans exposer personne",
          ar: "القياس دون كشف أحد",
        },
        content: {
          en: `A short, regular **pulse survey** tracks the climate better than one long annual survey. For example, once a month, three questions on a 1–5 scale: workload, support, meaning in work.

**Protecting confidentiality is non-negotiable:**
- Report results only for groups of **at least five people** (some organisations use 10). Below that, merge teams.
- Never ask for data that could identify someone in a small team (exact age, role in a team of one).
- Don't collect health information in a workplace survey. Point people to confidential support instead.
- Tell employees clearly who sees what, and comply with data protection law (in Morocco, Law 09-08 and the CNDP).

**Close the loop.** Share results with teams within a few weeks, along with one or two concrete actions. A survey without visible follow-up erodes trust.

**Offer access to care:** a confidential route to a psychologist, separate from management. U.Psy works with organisations on this: [contact us](/contact).

**Further reading:** WHO (2022). *WHO guidelines on mental health at work*. Edmondson, A. C. (1999). Psychological safety and learning behavior in work teams. *Administrative Science Quarterly*, 44(2), 350–383.`,
          fr: `Une **enquête flash** courte et régulière suit le climat mieux qu'une longue enquête annuelle. Par exemple, une fois par mois, trois questions sur une échelle de 1 à 5 : charge de travail, soutien, sens du travail.

**La confidentialité n'est pas négociable :**
- Ne présentez les résultats que pour des groupes d'**au moins cinq personnes** (certaines organisations prennent 10). En dessous, regroupez les équipes.
- Ne demandez jamais de données qui permettraient d'identifier quelqu'un dans une petite équipe (âge exact, poste unique).
- Ne collectez pas d'informations de santé dans une enquête interne. Orientez plutôt vers un soutien confidentiel.
- Expliquez clairement qui voit quoi, et respectez la loi sur la protection des données (au Maroc, la loi 09-08 et la CNDP).

**Bouclez la boucle.** Partagez les résultats avec les équipes en quelques semaines, avec une ou deux actions concrètes. Une enquête sans suite visible abîme la confiance.

**Offrez un accès aux soins :** une voie confidentielle vers un psychologue, distincte de la hiérarchie. U.Psy accompagne les organisations sur ce point : [contactez-nous](/contact).

**Pour aller plus loin :** OMS (2022). *Lignes directrices de l'OMS sur la santé mentale au travail*. Edmondson, A. C. (1999). Psychological safety and learning behavior in work teams. *Administrative Science Quarterly*, 44(2), 350–383.`,
        },
      },
    ],
  },

  // ------------------------------------------------------------------------
  {
    slug: "leadership-psychology-9aac9e",
    category: "leadership",
    level: "advanced",
    title: {
      en: "Leadership Psychology",
      fr: "Psychologie du leadership",
      ar: "علم نفس القيادة",
    },
    description: {
      en: "Regulating yourself, holding difficult conversations, deciding under uncertainty and lasting in the role.",
      fr: "Se réguler soi-même, mener des conversations difficiles, décider dans l'incertitude et durer dans le rôle.",
      ar: "تنظيم الذات، إدارة المحادثات الصعبة، اتخاذ القرار في ظل عدم اليقين، والاستمرار في الدور.",
    },
    modules: [
      {
        order: 1,
        minutes: 10,
        title: {
          en: "Leading starts with self-regulation",
          fr: "Diriger commence par se réguler",
          ar: "القيادة تبدأ بتنظيم الذات",
        },
        content: {
          en: `Emotions spread within groups: research on **emotional contagion** shows that a leader's mood influences the mood and cooperation of the team (Barsade, 2002). A tense, reactive leader tends to produce a tense, cautious team.

Self-regulation does not mean hiding emotions. It means noticing them before they drive your behaviour, and choosing your response.

Practical tools:
- **Name the emotion** ("I'm frustrated"): labelling an emotion helps regulate it.
- **Create a pause** before reacting to bad news: a breath, "let me think and come back to you this afternoon".
- **Know your triggers**: which situations make you defensive, controlling or withdrawn?
- **Look after the basics**: sleep, physical activity, breaks. Leaders are not exempt from fatigue.

If you recognise strong, repetitive reactions (fear of failure, need for control, harsh self-criticism), the [schema therapy introduction](/learn) can help you understand where they come from.

**Exercise.** For one week, note each time you reacted more strongly than you wanted at work: the trigger, the emotion, what you did, and what you would like to do next time.`,
          fr: `Les émotions se propagent dans les groupes : les recherches sur la **contagion émotionnelle** montrent que l'humeur d'un responsable influence l'humeur et la coopération de l'équipe (Barsade, 2002). Un responsable tendu et réactif a tendance à produire une équipe tendue et prudente.

Se réguler ne veut pas dire cacher ses émotions. C'est les remarquer avant qu'elles ne dictent le comportement, et choisir sa réponse.

Outils concrets :
- **Nommer l'émotion** (« je suis frustré ») : mettre un mot sur une émotion aide à la réguler.
- **Créer une pause** avant de réagir à une mauvaise nouvelle : une respiration, « laisse-moi réfléchir, je reviens vers toi cet après-midi ».
- **Connaître ses déclencheurs** : quelles situations vous rendent défensif, contrôlant ou distant ?
- **Prendre soin des bases** : sommeil, activité physique, pauses. Les responsables ne sont pas exemptés de fatigue.

Si vous reconnaissez des réactions fortes et répétitives (peur de l'échec, besoin de contrôle, autocritique sévère), l'[introduction à la thérapie des schémas](/learn) peut vous aider à comprendre d'où elles viennent.

**Exercice.** Pendant une semaine, notez chaque fois que vous avez réagi plus fortement que vous ne l'auriez voulu au travail : le déclencheur, l'émotion, ce que vous avez fait, et ce que vous aimeriez faire la prochaine fois.`,
        },
      },
      {
        order: 2,
        minutes: 12,
        title: {
          en: "Difficult conversations",
          fr: "Les conversations difficiles",
          ar: "المحادثات الصعبة",
        },
        content: {
          en: `Most difficult conversations go wrong because we are trying to win an argument about the facts. Stone, Patton and Heen describe three conversations happening at once: **what happened**, **the feelings**, and **identity** (what this says about me).

A structure that helps:
1. **Prepare**: what is the specific behaviour? What is its impact? What outcome do you want, for the relationship as well as the task?
2. **Open with intent**: "I want us to keep working well together, and something needs addressing."
3. **Describe facts, not character**: "the report was submitted two days late, twice this month", not "you're unreliable".
4. **State the impact** and how you feel.
5. **Ask for their view**, and listen to understand, not to reply.
6. **Agree a next step** and a follow-up date.

The [DEAR MAN worksheet](/resources/dear-man-script) and [I-statements](/resources/i-statements) are useful preparation tools.

**Exercise.** Choose a conversation you have been postponing. Prepare it using the six steps, then hold it this week.`,
          fr: `La plupart des conversations difficiles échouent parce qu'on cherche à gagner un débat sur les faits. Stone, Patton et Heen décrivent trois conversations qui se déroulent en même temps : **ce qui s'est passé**, **les émotions**, et **l'identité** (ce que cela dit de moi).

Une structure qui aide :
1. **Préparer** : quel est le comportement précis ? Quel est son impact ? Quel résultat voulez-vous, pour la relation autant que pour la tâche ?
2. **Ouvrir sur l'intention** : « je veux qu'on continue à bien travailler ensemble, et il y a un point à régler ».
3. **Décrire des faits, pas une personnalité** : « le rapport a été rendu avec deux jours de retard, deux fois ce mois-ci », pas « tu n'es pas fiable ».
4. **Dire l'impact** et ce que vous ressentez.
5. **Demander son point de vue**, et écouter pour comprendre, pas pour répondre.
6. **Convenir d'une prochaine étape** et d'une date de suivi.

La [fiche DEAR MAN](/resources/dear-man-script) et les [messages « je »](/resources/i-statements) sont utiles pour se préparer.

**Exercice.** Choisissez une conversation que vous repoussez. Préparez-la avec les six étapes, puis menez-la cette semaine.`,
        },
      },
      {
        order: 3,
        minutes: 12,
        title: {
          en: "Deciding under uncertainty",
          fr: "Décider dans l'incertitude",
          ar: "اتخاذ القرار في ظل عدم اليقين",
        },
        content: {
          en: `A good decision can have a bad outcome, and a bad decision can turn out well. Judging decisions only by their results ("resulting") leads to learning the wrong lessons. Evaluate the **process**: the information available, the options considered, the reasoning.

Practical tools:
- **Sort by reversibility**: decide reversible decisions quickly; slow down for those that are hard to undo.
- **Pre-mortem** (Klein, 2007): before deciding, imagine it is a year later and the project has failed. Each person writes why. This surfaces risks people hesitate to mention.
- **Consider the opposite**: what would have to be true for the other option to be better?
- **Separate opinions before discussion**: ask people to write their view before the meeting, to limit the influence of the most senior voice.
- **Write it down**: the decision, the reasons, what you expect. Review it later.

Anxiety pushes towards either rushing or endless postponing. Naming that anxiety helps you choose the pace deliberately.

**Exercise.** Run a 15-minute pre-mortem on your next significant decision.`,
          fr: `Une bonne décision peut avoir une mauvaise issue, et une mauvaise décision peut bien tourner. Juger les décisions uniquement à leurs résultats conduit à tirer les mauvaises leçons. Évaluez le **processus** : les informations disponibles, les options envisagées, le raisonnement.

Outils concrets :
- **Trier selon la réversibilité** : décider vite ce qui est réversible ; ralentir pour ce qui est difficile à défaire.
- **Pré-mortem** (Klein, 2007) : avant de décider, imaginez qu'un an a passé et que le projet a échoué. Chacun écrit pourquoi. Cela fait émerger des risques que les gens hésitent à évoquer.
- **Envisager l'inverse** : que faudrait-il pour que l'autre option soit meilleure ?
- **Recueillir les avis avant la discussion** : demandez à chacun d'écrire son point de vue avant la réunion, pour limiter l'influence de la voix la plus haut placée.
- **Écrire** : la décision, ses raisons, ce que vous attendez. Relisez-la plus tard.

L'anxiété pousse soit à se précipiter, soit à repousser sans fin. La nommer aide à choisir le rythme délibérément.

**Exercice.** Faites un pré-mortem de 15 minutes sur votre prochaine décision importante.`,
        },
      },
      {
        order: 4,
        minutes: 10,
        title: {
          en: "Lasting in the role",
          fr: "Durer dans le rôle",
          ar: "الاستمرار في الدور",
        },
        content: {
          en: `Leadership roles bring specific pressures: isolation, responsibility for others, constant visibility, decisions without clear answers. Many leaders hide their difficulties because they feel they must appear solid.

Protective habits:
- **Peers outside your organisation** with whom you can speak freely.
- **Supervision, coaching or therapy**: a space where you are not the one in charge.
- **One activity unrelated to performance**: something you do for pleasure, not to be good at it.
- **Clear boundaries** between work and private life, modelled for the team as well.
- **Regular review** of your energy: what drains you, what restores you?

Watch for the [warning signs of burnout](/learn): exhaustion, cynicism, the feeling of no longer being effective. Asking for help early is a leadership skill, not a weakness.

If you are struggling, [a psychologist](/psychologists) can offer a confidential space.

**Further reading:** Barsade, S. G. (2002). The ripple effect: emotional contagion and its influence on group behavior. *Administrative Science Quarterly*, 47(4), 644–675. Stone, D., Patton, B., & Heen, S. (2010). *Difficult Conversations* (2nd ed.). Penguin. Klein, G. (2007). Performing a project premortem. *Harvard Business Review*, 85(9), 18–19.`,
          fr: `Les fonctions de direction comportent des pressions particulières : isolement, responsabilité envers les autres, visibilité permanente, décisions sans réponse évidente. Beaucoup de responsables cachent leurs difficultés parce qu'ils pensent devoir paraître solides.

Habitudes protectrices :
- **Des pairs hors de votre organisation**, avec qui parler librement.
- **Supervision, coaching ou thérapie** : un espace où ce n'est pas vous qui dirigez.
- **Une activité sans enjeu de performance** : quelque chose que vous faites pour le plaisir, pas pour y exceller.
- **Des limites claires** entre travail et vie privée, montrées en exemple à l'équipe.
- **Un bilan régulier** de votre énergie : qu'est-ce qui vous épuise, qu'est-ce qui vous ressource ?

Surveillez les [signaux d'alerte de l'épuisement](/learn) : épuisement, cynisme, sentiment de ne plus être efficace. Demander de l'aide tôt est une compétence de leader, pas une faiblesse.

Si vous traversez une période difficile, [un psychologue](/psychologists) peut vous offrir un espace confidentiel.

**Pour aller plus loin :** Barsade, S. G. (2002). The ripple effect: emotional contagion and its influence on group behavior. *Administrative Science Quarterly*, 47(4), 644–675. Stone, D., Patton, B., & Heen, S. (2010). *Difficult Conversations* (2nd ed.). Penguin. Klein, G. (2007). Performing a project premortem. *Harvard Business Review*, 85(9), 18–19.`,
        },
      },
    ],
  },
];
