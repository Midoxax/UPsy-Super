import type { AcademyCourse } from "./types";

export const CLINICAL_COURSES: AcademyCourse[] = [
  // ------------------------------------------------------------------------
  {
    slug: "understanding-anxiety-7adcee",
    category: "clinical",
    level: "beginner",
    title: {
      en: "Understanding Anxiety",
      fr: "Comprendre l'anxiété",
      ar: "فهم القلق",
    },
    description: {
      en: "What anxiety is, why it persists, and the evidence-based tools that loosen its grip.",
      fr: "Ce qu'est l'anxiété, pourquoi elle s'installe, et les outils validés qui desserrent son emprise.",
      ar: "ما هو القلق، ولماذا يستمر، والأدوات المثبتة علمياً التي تخفف من قبضته.",
    },
    modules: [
      {
        order: 1,
        minutes: 12,
        title: {
          en: "What anxiety actually is",
          fr: "Ce qu'est vraiment l'anxiété",
          ar: "ما هو القلق حقاً",
        },
        content: {
          en: `Anxiety is the body's alarm system. Faced with a threat, the brain triggers a cascade: faster heart, quicker breathing, tense muscles, attention locked on danger. This **fight-or-flight** response kept our ancestors alive.

The trouble starts when the alarm goes off **without a real danger**, too often or too loudly: before a meeting, at the thought of an illness, in a crowded place. The body reacts as if the threat were physical, even when it is a thought.

**Normal anxiety or a disorder?** Anxiety becomes a problem when it is:
- disproportionate to the situation,
- frequent or lasting for weeks,
- causing avoidance or getting in the way of work, study or relationships.

The main anxiety disorders are generalised anxiety, panic disorder, social anxiety, specific phobias and agoraphobia. They are among the most common mental health problems, and also among the most treatable: CBT is the first-line psychological treatment.

**Exercise.** For one week, note each time you feel anxious: the situation, the intensity (0–10) and what your body does. You will start to see patterns.`,
          fr: `L'anxiété est le système d'alarme du corps. Face à une menace, le cerveau déclenche une cascade : cœur qui accélère, respiration plus rapide, muscles tendus, attention fixée sur le danger. Cette réaction de **lutte ou de fuite** a permis à nos ancêtres de survivre.

Le problème commence quand l'alarme se déclenche **sans danger réel**, trop souvent ou trop fort : avant une réunion, à l'idée d'une maladie, dans un lieu bondé. Le corps réagit comme si la menace était physique, même quand il s'agit d'une pensée.

**Anxiété normale ou trouble ?** L'anxiété devient un problème quand elle est :
- disproportionnée par rapport à la situation,
- fréquente ou durable, sur plusieurs semaines,
- source d'évitement, ou qu'elle gêne le travail, les études ou les relations.

Les principaux troubles anxieux sont l'anxiété généralisée, le trouble panique, l'anxiété sociale, les phobies spécifiques et l'agoraphobie. Ils comptent parmi les troubles psychiques les plus fréquents, et aussi parmi ceux qui se soignent le mieux : la TCC est le traitement psychologique de première intention.

**Exercice.** Pendant une semaine, notez chaque moment d'anxiété : la situation, l'intensité (0–10) et ce que fait votre corps. Des régularités vont apparaître.`,
        },
      },
      {
        order: 2,
        minutes: 12,
        title: {
          en: "The anxiety loop",
          fr: "Le cercle de l'anxiété",
          ar: "حلقة القلق",
        },
        content: {
          en: `Anxiety keeps itself going through a loop:

1. **Trigger**: a situation, a sensation, a thought.
2. **Anxious thought**: "I'm going to lose control", "something bad will happen".
3. **Body response**: racing heart, tight chest, dizziness.
4. **Behaviour**: avoiding, escaping, checking, seeking reassurance.
5. **Short-term relief**, which teaches the brain that the danger was real and that avoidance saved you.

That last step is the trap. Avoidance and **safety behaviours** (always sitting near the exit, carrying water "just in case", asking for reassurance) prevent you from discovering that the feared outcome does not happen, or that you can cope with it.

Breaking the loop is possible at each step: questioning the thought, calming the body, and above all **gradually facing** what you avoid.

**Exercise.** Draw your own loop for a recent situation using the [cognitive model worksheet](/resources/tcc-modele-cognitif). Circle the behaviours that bring relief now but keep the fear alive.`,
          fr: `L'anxiété s'entretient par un cercle :

1. **Déclencheur** : une situation, une sensation, une pensée.
2. **Pensée anxieuse** : « je vais perdre le contrôle », « il va arriver quelque chose de grave ».
3. **Réaction du corps** : cœur qui s'emballe, poitrine serrée, vertige.
4. **Comportement** : éviter, fuir, vérifier, chercher à être rassuré.
5. **Soulagement immédiat**, qui apprend au cerveau que le danger était réel et que l'évitement vous a sauvé.

Cette dernière étape est le piège. L'évitement et les **comportements de sécurité** (s'asseoir toujours près de la sortie, garder de l'eau « au cas où », demander à être rassuré) empêchent de découvrir que la catastrophe redoutée n'arrive pas, ou que l'on peut y faire face.

On peut casser le cercle à chaque étape : questionner la pensée, apaiser le corps, et surtout **affronter progressivement** ce que l'on évite.

**Exercice.** Dessinez votre propre cercle pour une situation récente avec la [fiche du modèle cognitif](/resources/tcc-modele-cognitif). Entourez les comportements qui soulagent sur le moment mais entretiennent la peur.`,
        },
      },
      {
        order: 3,
        minutes: 15,
        title: {
          en: "Calming the body, facing the fear",
          fr: "Apaiser le corps, affronter la peur",
          ar: "تهدئة الجسد ومواجهة الخوف",
        },
        content: {
          en: `**Calming the body** does not cure anxiety, but it lowers the volume enough to think and act.
- [Box breathing](/resources/box-breathing): slow, regular breaths, long out-breath.
- [5-4-3-2-1 grounding](/resources/grounding-54321): bring attention back to the senses.

The aim of grounding is to **widen** attention, not to escape. If a technique becomes a way to avoid feeling anything, it turns into a safety behaviour.

**Facing the fear** is the most effective ingredient of CBT for anxiety. Exposure means approaching feared situations **gradually, repeatedly and long enough** for the brain to learn something new: "I can stay here, and it passes."

1. List the situations you avoid.
2. Rate each one 0–100 for anxiety.
3. Start with one around 30–40 and repeat it until it feels easier.
4. Move up one step at a time.

Use the [exposure hierarchy worksheet](/resources/tcc-hierarchie-exposition) to build your ladder.

**Exercise.** Choose one small step from your ladder and do it three times this week. Note your anxiety before, at the peak and at the end.`,
          fr: `**Apaiser le corps** ne guérit pas l'anxiété, mais baisse suffisamment le volume pour pouvoir réfléchir et agir.
- La [respiration carrée](/resources/box-breathing) : un souffle lent et régulier, une expiration longue.
- L'[ancrage 5-4-3-2-1](/resources/grounding-54321) : ramener l'attention vers les sens.

Le but de l'ancrage est d'**élargir** l'attention, pas de fuir. Si une technique devient une façon de ne rien ressentir, elle se transforme en comportement de sécurité.

**Affronter la peur** est l'ingrédient le plus efficace de la TCC de l'anxiété. L'exposition consiste à s'approcher des situations redoutées **progressivement, de façon répétée et suffisamment longtemps** pour que le cerveau apprenne quelque chose de nouveau : « je peux rester là, et ça passe ».

1. Listez les situations que vous évitez.
2. Notez chacune de 0 à 100 selon l'anxiété.
3. Commencez par une situation autour de 30–40 et répétez-la jusqu'à ce qu'elle devienne plus facile.
4. Montez d'une marche à la fois.

Construisez votre échelle avec la [fiche de hiérarchie d'exposition](/resources/tcc-hierarchie-exposition).

**Exercice.** Choisissez une petite marche et faites-la trois fois cette semaine. Notez votre anxiété avant, au pic et à la fin.`,
        },
      },
      {
        order: 4,
        minutes: 8,
        title: {
          en: "When to seek a professional",
          fr: "Quand consulter un professionnel",
          ar: "متى تستشير مختصاً",
        },
        content: {
          en: `Self-help tools are useful, but some situations call for a psychologist or a doctor. Consider consulting when:
- anxiety has disrupted work, study or relationships for more than two weeks,
- panic attacks keep coming back,
- the list of places or situations you avoid keeps growing,
- you use alcohol, cannabis or medication to cope,
- sleep, appetite or mood are also affected.

**Seek help immediately** if you have thoughts of harming yourself or ending your life: call emergency services (141 or 15 in Morocco) or go to the nearest emergency department.

**What to expect.** A first session usually explores what you are experiencing, its history and what you want to change. CBT for anxiety typically involves 8 to 20 sessions, with exercises between sessions. A doctor may also discuss medication, which can be combined with therapy.

You can [find a psychologist on U.Psy](/psychologists), in person or online.

**Further reading:** Craske, M. G., & Barlow, D. H. (2006). *Mastery of Your Anxiety and Worry*. Oxford University Press. NICE (2011). *Generalised anxiety disorder and panic disorder in adults: management* (CG113).`,
          fr: `Les outils d'auto-assistance sont utiles, mais certaines situations demandent un psychologue ou un médecin. Pensez à consulter quand :
- l'anxiété perturbe le travail, les études ou les relations depuis plus de deux semaines,
- les attaques de panique se répètent,
- la liste des lieux ou situations évités s'allonge,
- vous utilisez l'alcool, le cannabis ou des médicaments pour tenir,
- le sommeil, l'appétit ou l'humeur sont aussi touchés.

**Demandez de l'aide immédiatement** si vous avez des idées de vous faire du mal ou de mettre fin à vos jours : appelez les urgences (141 ou 15 au Maroc) ou rendez-vous aux urgences les plus proches.

**À quoi s'attendre.** Une première séance explore en général ce que vous vivez, son histoire et ce que vous voulez changer. Une TCC de l'anxiété comprend souvent 8 à 20 séances, avec des exercices entre les séances. Un médecin peut aussi discuter d'un traitement médicamenteux, qui peut s'associer à la thérapie.

Vous pouvez [trouver un psychologue sur U.Psy](/psychologists), en cabinet ou en ligne.

**Pour aller plus loin :** Craske, M. G., & Barlow, D. H. (2006). *Mastery of Your Anxiety and Worry*. Oxford University Press. NICE (2011). *Generalised anxiety disorder and panic disorder in adults: management* (CG113).`,
        },
      },
    ],
  },

  // ------------------------------------------------------------------------
  {
    slug: "stress-management-essentials-a0c0c6",
    category: "clinical",
    level: "beginner",
    title: {
      en: "Stress Management Essentials",
      fr: "L'essentiel de la gestion du stress",
      ar: "أساسيات إدارة الضغط النفسي",
    },
    description: {
      en: "Understand how stress works and build a daily toolkit: problem solving, recovery and early warning signs.",
      fr: "Comprendre le fonctionnement du stress et se construire une boîte à outils : résolution de problèmes, récupération et signaux d'alerte.",
      ar: "فهم آلية الضغط النفسي وبناء أدوات يومية: حل المشكلات، التعافي، وعلامات الإنذار المبكر.",
    },
    modules: [
      {
        order: 1,
        minutes: 10,
        title: {
          en: "Stress is information",
          fr: "Le stress est une information",
          ar: "الضغط النفسي معلومة",
        },
        content: {
          en: `According to Lazarus and Folkman's transactional model, stress arises when we judge that the **demands** of a situation exceed our **resources** to cope. Two appraisals happen almost instantly: "Is this a threat?" and "Can I handle it?"

This has a practical consequence: there are always **two levers**.
- **Reduce the demand**: say no, delegate, set priorities, ask for a deadline.
- **Increase the resources**: skills, support, rest, information, time.

Some stress is useful: it focuses attention and mobilises energy for a deadline or a match. It becomes harmful when it is **intense and lasting**, without recovery.

**Exercise: your stress map.** Draw two columns. On the left, list your current demands (work, family, money, health). On the right, your resources (people, skills, routines). For each major demand, write one action that lowers it or one resource that would help.`,
          fr: `Selon le modèle transactionnel de Lazarus et Folkman, le stress apparaît quand on estime que les **exigences** d'une situation dépassent nos **ressources** pour y faire face. Deux évaluations se font presque instantanément : « Est-ce une menace ? » et « Est-ce que je peux y faire face ? »

Conséquence pratique : il y a toujours **deux leviers**.
- **Réduire l'exigence** : dire non, déléguer, prioriser, demander un délai.
- **Augmenter les ressources** : compétences, soutien, repos, information, temps.

Un certain stress est utile : il concentre l'attention et mobilise l'énergie pour une échéance ou un match. Il devient nocif quand il est **intense et durable**, sans récupération.

**Exercice : votre carte du stress.** Tracez deux colonnes. À gauche, vos exigences actuelles (travail, famille, argent, santé). À droite, vos ressources (personnes, compétences, habitudes). Pour chaque exigence importante, écrivez une action qui la réduit ou une ressource qui aiderait.`,
        },
      },
      {
        order: 2,
        minutes: 12,
        title: {
          en: "Solving the problems you can solve",
          fr: "Résoudre les problèmes qui peuvent l'être",
          ar: "حل المشكلات القابلة للحل",
        },
        content: {
          en: `Much stress comes from problems we turn over in our heads without acting. **Rumination** feels like work but rarely produces a decision.

A useful first sort:
- **Practical problems** (a bill, a conflict, an exam): use structured problem solving.
- **Problems outside your control** (others' choices, the economy, the past): work on how you respond, not on the problem itself.

The [7-step problem-solving worksheet](/resources/tcc-resolution-de-problemes) guides you: define the problem precisely, brainstorm solutions without judging, weigh pros and cons, pick one, plan the first step, act, review.

For worries that keep looping, the [worry management guide](/resources/tcc-gerer-les-inquietudes) offers two techniques: a daily **worry time** and the **decision tree** ("Can I do something about this, now?").

**Exercise.** Choose one practical problem that has been stressing you for more than a week and take it through the seven steps today.`,
          fr: `Une grande partie du stress vient de problèmes que l'on retourne dans sa tête sans agir. La **rumination** donne l'impression de travailler, mais produit rarement une décision.

Un premier tri utile :
- **Problèmes pratiques** (une facture, un conflit, un examen) : utilisez la résolution de problèmes structurée.
- **Problèmes hors de votre contrôle** (les choix des autres, l'économie, le passé) : travaillez sur votre façon d'y répondre, pas sur le problème lui-même.

La [fiche de résolution de problèmes en 7 étapes](/resources/tcc-resolution-de-problemes) vous guide : définir précisément le problème, chercher des solutions sans juger, peser le pour et le contre, choisir, planifier la première étape, agir, faire le bilan.

Pour les inquiétudes qui tournent en boucle, le [guide de gestion des inquiétudes](/resources/tcc-gerer-les-inquietudes) propose deux techniques : un **temps d'inquiétude** quotidien et l'**arbre de décision** (« Puis-je faire quelque chose, maintenant ? »).

**Exercice.** Choisissez un problème pratique qui vous stresse depuis plus d'une semaine et faites-le passer par les sept étapes aujourd'hui.`,
        },
      },
      {
        order: 3,
        minutes: 10,
        title: {
          en: "Recovery is a skill",
          fr: "La récupération s'apprend",
          ar: "التعافي مهارة",
        },
        content: {
          en: `Recovery is not just the absence of stress: it is an **active process** that lets the body and mind return to baseline. Research on recovery from work identifies four ingredients:
- **Psychological detachment**: really switching off from work in your free time.
- **Relaxation**: activities that lower physical arousal.
- **Mastery**: learning something or taking on a challenge outside work.
- **Control**: choosing for yourself how to spend your time.

Practical habits:
- A **transition ritual** between work and home (a walk, changing clothes, a short breathing exercise).
- Sleep at regular times; see the [CBT for insomnia guide](/resources/tcc-sommeil-tcc-i) if sleep is a problem.
- Regular physical activity: one of the best-supported ways to reduce stress and low mood.
- Short breaks during the day, every 60 to 90 minutes.

**Exercise.** Plan one activity from each of the four ingredients this week and note how you feel afterwards (0–10).`,
          fr: `La récupération n'est pas seulement l'absence de stress : c'est un **processus actif** qui permet au corps et à l'esprit de revenir à leur état de base. Les recherches sur la récupération après le travail identifient quatre ingrédients :
- **Le détachement psychologique** : vraiment décrocher du travail pendant son temps libre.
- **La relaxation** : des activités qui font baisser l'activation physique.
- **La maîtrise** : apprendre quelque chose ou relever un défi en dehors du travail.
- **Le contrôle** : choisir soi-même comment occuper son temps.

Des habitudes concrètes :
- Un **rituel de transition** entre travail et maison (marcher, se changer, un court exercice de respiration).
- Dormir à heures régulières ; voir le [guide TCC de l'insomnie](/resources/tcc-sommeil-tcc-i) si le sommeil pose problème.
- Une activité physique régulière : l'un des moyens les mieux démontrés pour réduire le stress et la baisse de moral.
- De courtes pauses dans la journée, toutes les 60 à 90 minutes.

**Exercice.** Planifiez cette semaine une activité pour chacun des quatre ingrédients, et notez votre état après (0–10).`,
        },
      },
      {
        order: 4,
        minutes: 8,
        title: {
          en: "Burnout warning signs",
          fr: "Les signaux d'alerte de l'épuisement",
          ar: "علامات الإنذار للاحتراق النفسي",
        },
        content: {
          en: `The WHO describes burnout (ICD-11) as an occupational phenomenon resulting from chronic workplace stress that has not been successfully managed. It has three dimensions:
1. **Exhaustion**: feeling drained, with no energy left.
2. **Mental distance or cynicism** towards one's job.
3. **Reduced professional efficacy**: feeling that you no longer do good work.

Early signs to watch for:
- sleep that no longer restores you,
- irritability, frequent illness, headaches or stomach problems,
- withdrawing from colleagues and friends,
- needing more and more effort for the same result.

**What helps:** talking about it early (with a manager, occupational health, a doctor), reducing load where possible, protecting recovery, and getting support.

Burnout and depression overlap. If low mood, loss of interest or hopelessness last more than two weeks, consult a professional. A psychologist can help you assess the situation and plan a return to balance.

**Further reading:** Lazarus, R. S., & Folkman, S. (1984). *Stress, Appraisal, and Coping*. Springer. Sonnentag, S., & Fritz, C. (2007). The Recovery Experience Questionnaire. *Journal of Occupational Health Psychology*, 12(3), 204–221.`,
          fr: `L'OMS décrit l'épuisement professionnel (CIM-11) comme un phénomène lié au travail, résultant d'un stress chronique au travail qui n'a pas été géré avec succès. Il a trois dimensions :
1. **L'épuisement** : se sentir vidé, sans énergie.
2. **La distance mentale ou le cynisme** vis-à-vis de son travail.
3. **La baisse d'efficacité professionnelle** : le sentiment de ne plus bien faire son travail.

Les signes précoces à surveiller :
- un sommeil qui ne repose plus,
- irritabilité, maladies fréquentes, maux de tête ou de ventre,
- retrait vis-à-vis des collègues et des amis,
- besoin de toujours plus d'effort pour le même résultat.

**Ce qui aide :** en parler tôt (à un responsable, à la médecine du travail, à un médecin), réduire la charge quand c'est possible, protéger la récupération et se faire accompagner.

L'épuisement et la dépression se recoupent. Si la tristesse, la perte d'intérêt ou le désespoir durent plus de deux semaines, consultez un professionnel. Un psychologue peut vous aider à faire le point et à préparer un retour à l'équilibre.

**Pour aller plus loin :** Lazarus, R. S., & Folkman, S. (1984). *Stress, Appraisal, and Coping*. Springer. Sonnentag, S., & Fritz, C. (2007). The Recovery Experience Questionnaire. *Journal of Occupational Health Psychology*, 12(3), 204–221.`,
        },
      },
    ],
  },

  // ------------------------------------------------------------------------
  {
    slug: "mental-resilience-training-bedff3",
    category: "clinical",
    level: "intermediate",
    title: {
      en: "Mental Resilience Training",
      fr: "Entraînement à la résilience mentale",
      ar: "تدريب المرونة النفسية",
    },
    description: {
      en: "Resilience is learned: flexible thinking, self-compassion, values-based action and a solid support network.",
      fr: "La résilience s'apprend : pensée flexible, auto-compassion, action guidée par les valeurs et réseau de soutien.",
      ar: "المرونة النفسية تُكتسب: تفكير مرن، تعاطف مع الذات، أفعال توجهها القيم، وشبكة دعم متينة.",
    },
    modules: [
      {
        order: 1,
        minutes: 10,
        title: {
          en: "Resilience is a skill, not a trait",
          fr: "La résilience est une compétence, pas un trait",
          ar: "المرونة مهارة وليست سمة",
        },
        content: {
          en: `Resilience is the ability to adapt well to adversity, trauma or significant stress, and to recover from it. Long-term studies show it is **common**, not exceptional: most people who go through hard events do not develop lasting difficulties.

Resilience is not the absence of pain. Resilient people feel sadness, fear and anger; what differs is how they move through them.

Factors that support resilience, and that can be developed:
- **supportive relationships**,
- **flexible thinking**: seeing a situation from several angles,
- **emotion regulation**: naming and tolerating emotions,
- **active coping**: acting on what can be changed,
- **meaning and values**: knowing what matters to you.

**Exercise.** Think of a past difficulty you got through. What helped? Write down three resources (people, habits, beliefs) you used. They are part of your resilience toolkit.`,
          fr: `La résilience est la capacité à bien s'adapter face à l'adversité, à un traumatisme ou à un stress important, et à s'en remettre. Les études au long cours montrent qu'elle est **fréquente**, pas exceptionnelle : la plupart des personnes qui traversent des événements difficiles ne développent pas de difficultés durables.

La résilience n'est pas l'absence de souffrance. Les personnes résilientes ressentent tristesse, peur et colère ; ce qui diffère, c'est la façon de les traverser.

Les facteurs qui soutiennent la résilience, et qui se développent :
- **des relations soutenantes**,
- **une pensée flexible** : voir une situation sous plusieurs angles,
- **la régulation émotionnelle** : nommer et tolérer ses émotions,
- **un coping actif** : agir sur ce qui peut changer,
- **du sens et des valeurs** : savoir ce qui compte pour soi.

**Exercice.** Pensez à une difficulté passée que vous avez traversée. Qu'est-ce qui vous a aidé ? Notez trois ressources (personnes, habitudes, convictions) que vous avez utilisées. Elles font partie de votre boîte à outils.`,
        },
      },
      {
        order: 2,
        minutes: 15,
        title: {
          en: "Flexible thinking in practice",
          fr: "La pensée flexible en pratique",
          ar: "التفكير المرن عملياً",
        },
        content: {
          en: `Reframing is not "positive thinking". It means asking: **what is the most accurate and useful way to see this?**

Two complementary approaches:

**1. Examine the thought (CBT).** Catch the automatic thought, check it against the evidence, and write a more balanced version.
- [Thought record](/resources/tcc-tableau-des-pensees)
- [Cognitive distortions](/resources/tcc-distorsions-cognitives): all-or-nothing thinking, catastrophising, mind reading…
- [Socratic questions](/resources/tcc-questionnement-socratique)

**2. Step back from the thought (ACT).** Instead of debating it, notice it as a thought: "I'm having the thought that I'll fail." See [cognitive defusion](/resources/cognitive-defusion).

Use the first when the thought is clearly distorted and you want to test it; the second when it keeps coming back, or when arguing with it only feeds it.

**Exercise.** Take a recent setback. Fill in a thought record, then write the main thought with the "I'm having the thought that…" prefix. Which approach helped more?`,
          fr: `Recadrer, ce n'est pas « penser positif ». C'est se demander : **quelle est la façon la plus juste et la plus utile de voir cela ?**

Deux approches complémentaires :

**1. Examiner la pensée (TCC).** Repérer la pensée automatique, la confronter aux faits, et formuler une version plus équilibrée.
- [Tableau des pensées](/resources/tcc-tableau-des-pensees)
- [Distorsions cognitives](/resources/tcc-distorsions-cognitives) : tout ou rien, catastrophisme, lecture de pensée…
- [Questions socratiques](/resources/tcc-questionnement-socratique)

**2. Prendre du recul par rapport à la pensée (ACT).** Au lieu d'en débattre, la remarquer comme une pensée : « j'ai la pensée que je vais échouer ». Voir la [défusion cognitive](/resources/cognitive-defusion).

Utilisez la première quand la pensée est clairement déformée et que vous voulez la tester ; la seconde quand elle revient sans cesse, ou quand la contester ne fait que la nourrir.

**Exercice.** Prenez un revers récent. Remplissez un tableau des pensées, puis réécrivez la pensée principale avec le préfixe « j'ai la pensée que… ». Quelle approche vous a le plus aidé ?`,
        },
      },
      {
        order: 3,
        minutes: 12,
        title: {
          en: "Self-compassion and values",
          fr: "Auto-compassion et valeurs",
          ar: "التعاطف مع الذات والقيم",
        },
        content: {
          en: `Two resources make the difference after a setback.

**Self-compassion** means treating yourself as you would a friend in the same situation. It is not self-pity or lowering standards: research links it to more persistence after failure, not less. Practise the [3-step self-compassion break](/resources/self-compassion-break): acknowledge the pain, remember that others feel it too, offer yourself kindness.

**Values** are chosen directions ("be a reliable friend", "keep learning"). When things go wrong, they answer the question "what now?". Unlike goals, they are never "achieved": you can act on them today, even in a hard period.

Fill in your [values compass](/resources/values-compass): rate how important each area of life is to you and how consistent your recent actions have been.

**Exercise.** Choose the area with the largest gap and plan one small action this week that moves you towards it, however small.`,
          fr: `Deux ressources font la différence après un revers.

**L'auto-compassion**, c'est se traiter comme on traiterait un ami dans la même situation. Ce n'est ni de l'apitoiement ni une baisse d'exigence : les recherches l'associent à plus de persévérance après un échec, pas moins. Pratiquez la [pause d'auto-compassion en 3 étapes](/resources/self-compassion-break) : reconnaître la souffrance, se rappeler que d'autres la ressentent, s'offrir de la bienveillance.

**Les valeurs** sont des directions choisies (« être un ami fiable », « continuer à apprendre »). Quand les choses tournent mal, elles répondent à la question « et maintenant ? ». Contrairement aux objectifs, on ne les « atteint » jamais : on peut agir dans leur sens aujourd'hui, même dans une période difficile.

Remplissez votre [boussole de valeurs](/resources/values-compass) : notez l'importance de chaque domaine de vie et la cohérence de vos actions récentes.

**Exercice.** Choisissez le domaine où l'écart est le plus grand et planifiez une petite action cette semaine dans cette direction, aussi petite soit-elle.`,
        },
      },
      {
        order: 4,
        minutes: 8,
        title: {
          en: "Building your support network",
          fr: "Construire son réseau de soutien",
          ar: "بناء شبكة دعمك",
        },
        content: {
          en: `Social support is one of the most consistent protective factors against stress and depression. It comes in several forms:
- **emotional**: someone who listens without judging,
- **practical**: help with a task, a lift, childcare,
- **informational**: advice, an experienced point of view,
- **companionship**: shared moments that have nothing to do with the problem.

Map your network: write the names of people who give you each type of support. Empty boxes are not a failure; they show where to invest.

Ways to strengthen it:
- reconnect with one person you have lost touch with,
- ask for specific help ("could you come with me on Thursday?") rather than waiting for others to guess,
- join a group around an activity (sport, volunteering, a class).

A professional can be part of the network too. If you feel isolated or overwhelmed, [a psychologist](/psychologists) can help.

**Further reading:** Bonanno, G. A. (2004). Loss, trauma, and human resilience. *American Psychologist*, 59(1), 20–28. Southwick, S. M., & Charney, D. S. (2018). *Resilience: The Science of Mastering Life's Greatest Challenges* (2nd ed.). Cambridge University Press.`,
          fr: `Le soutien social est l'un des facteurs de protection les plus constants face au stress et à la dépression. Il prend plusieurs formes :
- **émotionnel** : quelqu'un qui écoute sans juger,
- **pratique** : de l'aide pour une tâche, un trajet, la garde des enfants,
- **informationnel** : un conseil, un point de vue expérimenté,
- **de compagnie** : des moments partagés qui n'ont rien à voir avec le problème.

Faites la carte de votre réseau : écrivez le nom des personnes qui vous apportent chaque type de soutien. Les cases vides ne sont pas un échec ; elles montrent où investir.

Pour le renforcer :
- reprendre contact avec une personne perdue de vue,
- demander une aide précise (« tu peux m'accompagner jeudi ? ») plutôt qu'attendre que les autres devinent,
- rejoindre un groupe autour d'une activité (sport, bénévolat, cours).

Un professionnel peut aussi faire partie du réseau. Si vous vous sentez isolé ou dépassé, [un psychologue](/psychologists) peut vous aider.

**Pour aller plus loin :** Bonanno, G. A. (2004). Loss, trauma, and human resilience. *American Psychologist*, 59(1), 20–28. Southwick, S. M., & Charney, D. S. (2018). *Resilience: The Science of Mastering Life's Greatest Challenges* (2nd ed.). Cambridge University Press.`,
        },
      },
    ],
  },

  // ------------------------------------------------------------------------
  {
    slug: "tcc-les-fondamentaux",
    isNew: true,
    category: "clinical",
    level: "beginner",
    title: {
      en: "CBT Fundamentals",
      fr: "Les fondamentaux de la TCC",
      ar: "أساسيات العلاج المعرفي السلوكي",
    },
    description: {
      en: "The core of cognitive behavioural therapy in five modules: the cognitive model, working with thoughts, acting differently and preventing relapse.",
      fr: "L'essentiel de la thérapie cognitive et comportementale en cinq modules : le modèle cognitif, le travail sur les pensées, agir autrement et prévenir la rechute.",
      ar: "جوهر العلاج المعرفي السلوكي في خمس وحدات: النموذج المعرفي، العمل على الأفكار، التصرف بشكل مختلف، والوقاية من الانتكاس.",
    },
    modules: [
      {
        order: 1,
        minutes: 12,
        title: {
          en: "What CBT is, and how it works",
          fr: "Ce qu'est la TCC, et comment elle fonctionne",
          ar: "ما هو العلاج المعرفي السلوكي وكيف يعمل",
        },
        content: {
          en: `Cognitive behavioural therapy (CBT) is the most extensively studied form of psychotherapy. It is recommended as a first-line treatment for depression, anxiety disorders, insomnia and many other difficulties.

Its main features:
- **Structured and time-limited**: often 8 to 20 sessions, each with an agenda.
- **Focused on the present**: the past is explored to understand, but work centres on what keeps the problem going now.
- **Collaborative**: therapist and client work as a team, like two researchers.
- **Active**: exercises between sessions are an essential part of the work.

At its heart is the **cognitive model**: it is not only events that shape how we feel, but how we interpret them. Thoughts, emotions, body sensations and behaviours influence each other.

Read the [cognitive model guide](/resources/tcc-modele-cognitif) and fill in its table for one situation.

**Exercise.** Choose one difficulty you would like to work on during this course and describe it in two sentences: what happens, and what you would like to be different.`,
          fr: `La thérapie cognitive et comportementale (TCC) est la forme de psychothérapie la plus étudiée. Elle est recommandée en première intention pour la dépression, les troubles anxieux, l'insomnie et bien d'autres difficultés.

Ses caractéristiques :
- **Structurée et limitée dans le temps** : souvent 8 à 20 séances, chacune avec un ordre du jour.
- **Centrée sur le présent** : le passé est exploré pour comprendre, mais le travail porte sur ce qui entretient le problème aujourd'hui.
- **Collaborative** : thérapeute et patient travaillent en équipe, comme deux chercheurs.
- **Active** : les exercices entre les séances sont une partie essentielle du travail.

Au cœur se trouve le **modèle cognitif** : ce ne sont pas seulement les événements qui déterminent ce que l'on ressent, mais la façon dont on les interprète. Pensées, émotions, sensations et comportements s'influencent mutuellement.

Lisez le [guide du modèle cognitif](/resources/tcc-modele-cognitif) et remplissez son tableau pour une situation.

**Exercice.** Choisissez une difficulté sur laquelle vous aimeriez travailler pendant ce cours, et décrivez-la en deux phrases : ce qui se passe, et ce que vous aimeriez voir changer.`,
        },
      },
      {
        order: 2,
        minutes: 15,
        title: {
          en: "Catching automatic thoughts",
          fr: "Repérer les pensées automatiques",
          ar: "رصد الأفكار التلقائية",
        },
        content: {
          en: `Automatic thoughts are the quick words or images that cross the mind in a situation. They feel like facts, so we rarely question them.

**How to catch them:** when your mood shifts, ask yourself "What was just going through my mind?". Write the thought word for word, and rate how much you believe it (0–100%).

**Thinking traps.** Some patterns come up again and again. Among the most common:
- all-or-nothing thinking ("if it isn't perfect, it's a failure"),
- catastrophising ("this will be a disaster"),
- mind reading ("they think I'm useless"),
- overgeneralising ("this always happens to me"),
- "should" statements ("I should never be tired").

The [cognitive distortions guide](/resources/tcc-distorsions-cognitives) describes twelve of them with examples.

**Exercise.** For the next three days, each time your mood drops noticeably, fill in the first three columns of the [thought record](/resources/tcc-tableau-des-pensees): situation, emotion (0–100), automatic thought. Then see which traps you recognise.`,
          fr: `Les pensées automatiques sont les mots ou images rapides qui traversent l'esprit dans une situation. Elles ressemblent à des faits, si bien qu'on les remet rarement en question.

**Comment les repérer :** quand votre humeur change, demandez-vous « Qu'est-ce qui vient de me traverser l'esprit ? ». Notez la pensée mot pour mot, et à quel point vous y croyez (0–100 %).

**Les pièges de la pensée.** Certains schémas reviennent sans cesse. Parmi les plus fréquents :
- la pensée tout ou rien (« si ce n'est pas parfait, c'est un échec »),
- le catastrophisme (« ça va être un désastre »),
- la lecture de pensée (« ils pensent que je suis nul »),
- la surgénéralisation (« ça m'arrive toujours »),
- les « je dois » (« je ne devrais jamais être fatigué »).

Le [guide des distorsions cognitives](/resources/tcc-distorsions-cognitives) en décrit douze, avec des exemples.

**Exercice.** Pendant trois jours, chaque fois que votre humeur baisse nettement, remplissez les trois premières colonnes du [tableau des pensées](/resources/tcc-tableau-des-pensees) : situation, émotion (0–100), pensée automatique. Puis repérez les pièges que vous reconnaissez.`,
        },
      },
      {
        order: 3,
        minutes: 15,
        title: {
          en: "Testing and rebalancing thoughts",
          fr: "Tester et rééquilibrer ses pensées",
          ar: "اختبار الأفكار وإعادة توازنها",
        },
        content: {
          en: `Once a thought is caught, the work is to **examine it**, not to replace it with a forced positive one. The goal is a thought that is more **balanced** and more **useful**.

Questions that help:
- What are the facts for and against this thought?
- Is there another way to see the situation?
- What would I say to a friend who had this thought?
- What is the worst, the best and the most likely outcome?
- What is the effect of believing this thought? And of seeing it differently?

The [Socratic questioning sheet](/resources/tcc-questionnement-socratique) lists more.

Then complete the last columns of the [thought record](/resources/tcc-tableau-des-pensees): evidence for, evidence against, balanced thought, and re-rate the emotion. A drop of 20 to 30 points is already a real change.

**When words are not enough**, test the thought in reality with a [behavioural experiment](/resources/tcc-experiences-comportementales): write your prediction, do the experiment, compare.

**Exercise.** Complete one full thought record this week, and design one small experiment to test a prediction.`,
          fr: `Une fois la pensée repérée, le travail consiste à **l'examiner**, pas à la remplacer par une pensée positive forcée. L'objectif est une pensée plus **équilibrée** et plus **utile**.

Des questions qui aident :
- Quels sont les faits pour et contre cette pensée ?
- Y a-t-il une autre façon de voir la situation ?
- Que dirais-je à un ami qui aurait cette pensée ?
- Quel est le pire, le meilleur et le plus probable ?
- Quel est l'effet de croire cette pensée ? Et de la voir autrement ?

La [fiche de questionnement socratique](/resources/tcc-questionnement-socratique) en propose d'autres.

Complétez ensuite les dernières colonnes du [tableau des pensées](/resources/tcc-tableau-des-pensees) : preuves pour, preuves contre, pensée équilibrée, et réévaluez l'émotion. Une baisse de 20 à 30 points est déjà un vrai changement.

**Quand les mots ne suffisent pas**, testez la pensée dans la réalité avec une [expérience comportementale](/resources/tcc-experiences-comportementales) : notez votre prédiction, faites l'expérience, comparez.

**Exercice.** Remplissez un tableau des pensées complet cette semaine, et concevez une petite expérience pour tester une prédiction.`,
        },
      },
      {
        order: 4,
        minutes: 15,
        title: {
          en: "Acting differently: activation and exposure",
          fr: "Agir autrement : activation et exposition",
          ar: "التصرف بشكل مختلف: التنشيط والتعرّض",
        },
        content: {
          en: `The "B" in CBT matters as much as the "C". Changing what we **do** is often the fastest way to change how we feel.

**In low mood: behavioural activation.** Depression pushes us to withdraw and wait for motivation before acting. Activation reverses the order: act first, motivation follows.
1. Monitor activities and mood for a few days.
2. Spot activities that bring **pleasure** or a sense of **accomplishment**.
3. Schedule them, starting small, and follow the plan rather than the mood.

See the [behavioural activation worksheet](/resources/tcc-activation-comportementale).

**In anxiety: exposure.** Avoidance keeps fear alive. Approaching feared situations gradually, without safety behaviours, lets the brain learn they are bearable. Build your [exposure hierarchy](/resources/tcc-hierarchie-exposition).

In both cases: **small, planned, repeated steps**, recorded so you can see your progress.

**Exercise.** Depending on your difficulty, schedule three activities for the coming week, or do the first step of your exposure ladder three times.`,
          fr: `Le « C » de comportemental compte autant que le « C » de cognitif. Changer ce que l'on **fait** est souvent le moyen le plus rapide de changer ce que l'on ressent.

**Dans la baisse de moral : l'activation comportementale.** La dépression pousse à se retirer et à attendre la motivation pour agir. L'activation inverse l'ordre : agir d'abord, la motivation suit.
1. Observer ses activités et son humeur pendant quelques jours.
2. Repérer les activités qui apportent du **plaisir** ou un sentiment d'**accomplissement**.
3. Les planifier, en commençant petit, et suivre le plan plutôt que l'humeur.

Voir la [fiche d'activation comportementale](/resources/tcc-activation-comportementale).

**Dans l'anxiété : l'exposition.** L'évitement entretient la peur. S'approcher progressivement des situations redoutées, sans comportements de sécurité, permet au cerveau d'apprendre qu'elles sont supportables. Construisez votre [hiérarchie d'exposition](/resources/tcc-hierarchie-exposition).

Dans les deux cas : **de petites étapes planifiées et répétées**, notées pour voir les progrès.

**Exercice.** Selon votre difficulté, planifiez trois activités pour la semaine à venir, ou faites trois fois la première marche de votre échelle d'exposition.`,
        },
      },
      {
        order: 5,
        minutes: 10,
        title: {
          en: "Core beliefs and relapse prevention",
          fr: "Croyances profondes et prévention de la rechute",
          ar: "المعتقدات الجوهرية والوقاية من الانتكاس",
        },
        content: {
          en: `Beneath automatic thoughts lie **rules** ("if I'm not perfect, I'll be rejected") and **core beliefs** about oneself, others and the world ("I'm not good enough"). They formed through experience and act as filters. CBT works on them once the person is comfortable with thought records, often with a therapist. When they are deep-rooted and long-standing, **schema therapy** extends this work: see the Academy course on schema therapy.

**Preventing relapse.** Setbacks are normal; what matters is spotting them early. Write your personal plan:
1. **What helped me most** in this course (tools, habits).
2. **My early warning signs** (sleep, withdrawal, certain thoughts).
3. **High-risk situations** to anticipate.
4. **What I'll do** if signs come back, and **who I'll contact**.

Keep it somewhere you can find it, and reread it each month.

CBT works best with guidance. If you are struggling, [a psychologist trained in CBT](/psychologists) can personalise this work.

**Further reading:** Beck, J. S. (2021). *Cognitive Behavior Therapy: Basics and Beyond* (3rd ed.). Guilford Press. Greenberger, D., & Padesky, C. A. (2015). *Mind Over Mood* (2nd ed.). Guilford Press.`,
          fr: `Sous les pensées automatiques se trouvent des **règles** (« si je ne suis pas parfait, on me rejettera ») et des **croyances profondes** sur soi, les autres et le monde (« je ne suis pas à la hauteur »). Elles se sont formées au fil de l'expérience et agissent comme des filtres. La TCC les travaille une fois que la personne est à l'aise avec le tableau des pensées, souvent avec un thérapeute. Quand elles sont anciennes et très ancrées, la **thérapie des schémas** prolonge ce travail : voir le cours de l'Académie sur la thérapie des schémas.

**Prévenir la rechute.** Les rechutes sont normales ; l'important est de les repérer tôt. Rédigez votre plan personnel :
1. **Ce qui m'a le plus aidé** dans ce cours (outils, habitudes).
2. **Mes signaux d'alerte** (sommeil, retrait, certaines pensées).
3. **Les situations à risque** à anticiper.
4. **Ce que je ferai** si les signes reviennent, et **qui je contacterai**.

Gardez-le à portée de main et relisez-le chaque mois.

La TCC fonctionne mieux accompagnée. Si vous avez du mal, [un psychologue formé à la TCC](/psychologists) peut personnaliser ce travail.

**Pour aller plus loin :** Beck, J. S. (2021). *Cognitive Behavior Therapy: Basics and Beyond* (3rd ed.). Guilford Press. Greenberger, D., & Padesky, C. A. (2015). *Mind Over Mood* (2nd ed.). Guilford Press.`,
        },
      },
    ],
  },

  // ------------------------------------------------------------------------
  {
    slug: "therapie-des-schemas-introduction",
    isNew: true,
    category: "clinical",
    level: "intermediate",
    title: {
      en: "Introduction to Schema Therapy",
      fr: "Introduction à la thérapie des schémas",
      ar: "مدخل إلى العلاج بالمخططات",
    },
    description: {
      en: "Understand the patterns that repeat in your life: core needs, the 18 schemas, coping styles, modes and the healthy adult.",
      fr: "Comprendre les scénarios qui se répètent dans sa vie : besoins fondamentaux, 18 schémas, styles d'adaptation, modes et adulte sain.",
      ar: "فهم الأنماط التي تتكرر في حياتك: الحاجات الأساسية، المخططات الثمانية عشر، أساليب التعامل، الأنماط، والراشد السليم.",
    },
    modules: [
      {
        order: 1,
        minutes: 12,
        title: {
          en: "Core needs and the origin of schemas",
          fr: "Les besoins fondamentaux et l'origine des schémas",
          ar: "الحاجات الأساسية وأصل المخططات",
        },
        content: {
          en: `Schema therapy was developed by Jeffrey Young for long-standing difficulties that do not shift with standard CBT: repeating relationship patterns, chronic self-criticism, a fragile sense of self. It combines CBT, attachment theory and emotion-focused techniques.

Its starting point: every child has **five core emotional needs**:
1. secure attachment (safety, stability, affection),
2. autonomy, competence and identity,
3. freedom to express needs and emotions,
4. spontaneity and play,
5. realistic limits and self-control.

When a need is repeatedly unmet (or, conversely, indulged without limits), the child develops an **early maladaptive schema**: a lasting theme, made of memories, emotions and beliefs, which then replays in adult life.

A schema was often an intelligent adaptation to a difficult environment. It becomes a problem when it keeps operating where it no longer helps.

Read [Core needs and the 18 schemas](/resources/schemas-besoins-et-18-schemas).

**Exercise.** For each of the five needs, note how well it was met in your childhood (0–10). No need to go into detail: just notice where the gaps were.`,
          fr: `La thérapie des schémas a été développée par Jeffrey Young pour les difficultés anciennes qui résistent à une TCC classique : scénarios relationnels répétitifs, autocritique chronique, identité fragile. Elle associe TCC, théorie de l'attachement et techniques émotionnelles.

Point de départ : tout enfant a **cinq besoins affectifs fondamentaux** :
1. un attachement sûr (sécurité, stabilité, affection),
2. autonomie, compétence et identité,
3. la liberté d'exprimer ses besoins et ses émotions,
4. la spontanéité et le jeu,
5. des limites réalistes et la maîtrise de soi.

Quand un besoin est régulièrement insatisfait (ou, à l'inverse, comblé sans limites), l'enfant développe un **schéma précoce inadapté** : un thème durable, fait de souvenirs, d'émotions et de croyances, qui se rejoue ensuite à l'âge adulte.

Un schéma était souvent une adaptation intelligente à un environnement difficile. Il devient un problème quand il continue de fonctionner là où il n'est plus utile.

Lisez [Les besoins fondamentaux et les 18 schémas](/resources/schemas-besoins-et-18-schemas).

**Exercice.** Pour chacun des cinq besoins, notez à quel point il a été satisfait dans votre enfance (0–10). Inutile d'entrer dans les détails : repérez seulement où étaient les manques.`,
        },
      },
      {
        order: 2,
        minutes: 15,
        title: {
          en: "The 18 schemas in five domains",
          fr: "Les 18 schémas en cinq domaines",
          ar: "المخططات الثمانية عشر في خمسة مجالات",
        },
        content: {
          en: `Young described 18 schemas grouped in five domains, each linked to a core need:

- **Disconnection and rejection**: abandonment, mistrust/abuse, emotional deprivation, defectiveness/shame, social isolation.
- **Impaired autonomy and performance**: dependence, vulnerability to harm, enmeshment, failure.
- **Impaired limits**: entitlement, insufficient self-control.
- **Other-directedness**: subjugation, self-sacrifice, approval-seeking.
- **Overvigilance and inhibition**: negativity, emotional inhibition, unrelenting standards, punitiveness.

**How to recognise an active schema:** an emotional reaction out of proportion with the present situation, as if an old wound were being touched; the same scenarios returning in different relationships or jobs.

This list is for understanding, not self-diagnosis. A clinician assesses schemas using validated questionnaires and your life history.

**Exercise.** Read the descriptions in the [guide](/resources/schemas-besoins-et-18-schemas). Pick the two or three that resonate most, and for each one note a recent situation where you might have felt it.`,
          fr: `Young a décrit 18 schémas regroupés en cinq domaines, chacun lié à un besoin fondamental :

- **Séparation et rejet** : abandon, méfiance/abus, carence affective, imperfection/honte, isolement social.
- **Manque d'autonomie et de performance** : dépendance, vulnérabilité, fusion, échec.
- **Manque de limites** : droits personnels exagérés, contrôle de soi insuffisant.
- **Orientation vers les autres** : assujettissement, abnégation, recherche d'approbation.
- **Survigilance et inhibition** : négativité, inhibition émotionnelle, exigences élevées, punition.

**Comment reconnaître un schéma actif :** une réaction émotionnelle disproportionnée par rapport à la situation présente, comme si l'on touchait une vieille blessure ; les mêmes scénarios qui reviennent dans des relations ou des emplois différents.

Cette liste sert à comprendre, pas à s'autodiagnostiquer. Un clinicien évalue les schémas à l'aide de questionnaires validés et de votre histoire de vie.

**Exercice.** Lisez les descriptions dans le [guide](/resources/schemas-besoins-et-18-schemas). Choisissez les deux ou trois qui vous parlent le plus et, pour chacun, notez une situation récente où vous avez pu le ressentir.`,
        },
      },
      {
        order: 3,
        minutes: 12,
        title: {
          en: "How we cope: surrender, avoidance, overcompensation",
          fr: "Nos façons de faire face : capitulation, évitement, surcompensation",
          ar: "كيف نتعامل: الاستسلام، التجنب، التعويض المفرط",
        },
        content: {
          en: `A schema hurts. To avoid feeling that pain, we use three **coping styles**:
- **Surrender**: accepting the schema as true and living accordingly (with a defectiveness schema, choosing a critical partner).
- **Avoidance**: arranging life so the schema is never triggered (avoiding closeness, staying busy, numbing).
- **Overcompensation**: doing the opposite, to excess (criticising others, chasing perfection, dominating).

All three bring relief in the moment, and all three **keep the schema alive**, because they prevent experiences that would contradict it. The same person often uses all three, depending on the context.

Read [Surrender, avoidance, overcompensation](/resources/schemas-styles-adaptation).

**Exercise.** Fill in the guide's table for one of the schemas you identified: the situation, what you did, which style it was, and what it cost you in the long term.`,
          fr: `Un schéma fait mal. Pour ne pas ressentir cette douleur, on utilise trois **styles d'adaptation** :
- **La capitulation** : accepter le schéma comme vrai et vivre en conséquence (avec un schéma d'imperfection, choisir un partenaire critique).
- **L'évitement** : organiser sa vie pour que le schéma ne s'active jamais (éviter l'intimité, rester occupé, s'anesthésier).
- **La surcompensation** : faire l'inverse, de façon excessive (critiquer les autres, viser la perfection, dominer).

Les trois soulagent sur le moment, et les trois **entretiennent le schéma**, car ils empêchent de vivre des expériences qui le contrediraient. La même personne utilise souvent les trois, selon le contexte.

Lisez [Capitulation, évitement, surcompensation](/resources/schemas-styles-adaptation).

**Exercice.** Remplissez le tableau du guide pour l'un des schémas repérés : la situation, ce que vous avez fait, le style utilisé, et ce que cela vous a coûté à long terme.`,
        },
      },
      {
        order: 4,
        minutes: 15,
        title: {
          en: "Modes and the healthy adult",
          fr: "Les modes et l'adulte sain",
          ar: "الأنماط والراشد السليم",
        },
        content: {
          en: `**Modes** are the emotional states that take over at a given moment when a schema is triggered. The mode model, developed by Young and later Arntz, groups them into four families:
- **Child modes**: vulnerable child, angry child, impulsive child, happy child.
- **Maladaptive coping modes**: compliant surrenderer, detached protector, self-soother, overcompensator.
- **Internalised parent modes**: punitive and demanding.
- **The healthy adult**, who looks after the vulnerable child, sets limits and stands up to the inner critic.

Thinking in modes creates distance: "part of me feels abandoned, another wants to cut everyone off" rather than "this is just who I am."

Read [Modes](/resources/schemas-les-modes) and start the [mode diary](/resources/schemas-journal-des-modes).

**Exercise.** For one week, log each strong emotional moment: the situation, the modes you noticed, the need at stake, and what your healthy adult could have said or done.`,
          fr: `Les **modes** sont les états émotionnels qui prennent le relais à un moment donné quand un schéma s'active. Le modèle des modes, développé par Young puis Arntz, les regroupe en quatre familles :
- **Les modes enfant** : enfant vulnérable, enfant en colère, enfant impulsif, enfant heureux.
- **Les modes d'adaptation dysfonctionnels** : soumis obéissant, protecteur détaché, auto-apaisement, surcompensateur.
- **Les modes parent intériorisés** : punitif et exigeant.
- **L'adulte sain**, qui prend soin de l'enfant vulnérable, pose des limites et tient tête au critique intérieur.

Penser en modes aide à prendre du recul : « une partie de moi se sent abandonnée, une autre veut tout couper » plutôt que « je suis comme ça ».

Lisez [Les modes](/resources/schemas-les-modes) et commencez le [journal des modes](/resources/schemas-journal-des-modes).

**Exercice.** Pendant une semaine, notez chaque moment émotionnel fort : la situation, les modes repérés, le besoin en jeu, et ce que votre adulte sain aurait pu dire ou faire.`,
        },
      },
      {
        order: 5,
        minutes: 12,
        title: {
          en: "Change: flashcards, experiential work and therapy",
          fr: "Le changement : cartes-mémoire, travail expérientiel et thérapie",
          ar: "التغيير: البطاقات، العمل التجريبي، والعلاج",
        },
        content: {
          en: `Schema therapy works on three levels:
- **Cognitive**: recognising the schema and testing it against the evidence of your life.
- **Behavioural**: gradually replacing coping styles with healthier choices ("pattern breaking").
- **Experiential**: changing the emotional meaning of old experiences, through imagery rescripting and chair work.

**What you can do on your own:** write a [schema flashcard](/resources/schemas-carte-memoire) to read when the schema fires: name the feeling, the schema and its origin, check the facts, and choose a healthy action.

**What belongs in therapy:** [experiential techniques](/resources/schemas-techniques-experientielles) reactivate intense memories and emotions. They need a trained therapist and a safe frame, especially with trauma, dissociation or suicidal thoughts.

Schema therapy is supported by randomised trials, notably for borderline and other personality disorders, and is increasingly used for chronic depression and anxiety. It is usually longer than standard CBT.

If these patterns resonate strongly, talk to [a psychologist trained in schema therapy](/psychologists).

**Further reading:** Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). *Schema Therapy: A Practitioner's Guide*. Guilford Press. Young, J. E., & Klosko, J. S. (1995). *Je réinvente ma vie*. Éditions de l'Homme. Arntz, A., & Jacob, G. (2013). *Schema Therapy in Practice*. Wiley-Blackwell.`,
          fr: `La thérapie des schémas agit sur trois plans :
- **Cognitif** : reconnaître le schéma et le confronter aux faits de sa vie.
- **Comportemental** : remplacer progressivement les styles d'adaptation par des choix plus sains (« briser les scénarios »).
- **Expérientiel** : changer la signification émotionnelle d'expériences anciennes, par la réécriture en imagerie et le travail sur chaises.

**Ce que vous pouvez faire seul :** rédiger une [carte-mémoire de schéma](/resources/schemas-carte-memoire) à relire quand le schéma s'active : nommer l'émotion, le schéma et son origine, vérifier les faits, et choisir une action saine.

**Ce qui relève de la thérapie :** les [techniques expérientielles](/resources/schemas-techniques-experientielles) réactivent des souvenirs et des émotions intenses. Elles demandent un thérapeute formé et un cadre sécurisant, en particulier en cas de traumatisme, de dissociation ou d'idées suicidaires.

La thérapie des schémas s'appuie sur des essais randomisés, notamment dans le trouble de la personnalité borderline et d'autres troubles de la personnalité, et s'utilise de plus en plus dans la dépression et l'anxiété chroniques. Elle est en général plus longue qu'une TCC classique.

Si ces scénarios vous parlent fortement, parlez-en à [un psychologue formé à la thérapie des schémas](/psychologists).

**Pour aller plus loin :** Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). *Schema Therapy: A Practitioner's Guide*. Guilford Press. Young, J. E., & Klosko, J. S. (1995). *Je réinvente ma vie*. Éditions de l'Homme. Arntz, A., & Jacob, G. (2013). *Schema Therapy in Practice*. Wiley-Blackwell.`,
        },
      },
    ],
  },
];
