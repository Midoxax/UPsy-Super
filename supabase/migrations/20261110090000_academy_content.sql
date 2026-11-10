-- Academy course content (src/content/academy), generated; do not hand-edit.
--
-- Rewrites the seven courses' modules in place (same ids, so learners'
-- progress is kept), adds French text and Arabic titles, sets durations to
-- what each course actually contains, and adds two courses: CBT fundamentals
-- and an introduction to schema therapy.
ALTER TABLE public.course_modules
  ADD COLUMN IF NOT EXISTS title_fr text,
  ADD COLUMN IF NOT EXISTS title_ar text,
  ADD COLUMN IF NOT EXISTS content_fr text;

UPDATE public.courses SET title = 'Understanding Anxiety', title_fr = 'Comprendre l''anxiété', title_ar = 'فهم القلق',
  description = 'What anxiety is, why it persists, and the evidence-based tools that loosen its grip.', description_fr = 'Ce qu''est l''anxiété, pourquoi elle s''installe, et les outils validés qui desserrent son emprise.', description_ar = 'ما هو القلق، ولماذا يستمر، والأدوات المثبتة علمياً التي تخفف من قبضته.',
  difficulty_level = 'beginner', duration_hours = 0.8
WHERE slug = 'understanding-anxiety-7adcee';

UPDATE public.course_modules m SET title = 'What anxiety actually is', title_fr = 'Ce qu''est vraiment l''anxiété', title_ar = 'ما هو القلق حقاً', duration_minutes = 12,
  content = $md$Anxiety is the body's alarm system. Faced with a threat, the brain triggers a cascade: faster heart, quicker breathing, tense muscles, attention locked on danger. This **fight-or-flight** response kept our ancestors alive.

The trouble starts when the alarm goes off **without a real danger**, too often or too loudly: before a meeting, at the thought of an illness, in a crowded place. The body reacts as if the threat were physical, even when it is a thought.

**Normal anxiety or a disorder?** Anxiety becomes a problem when it is:
- disproportionate to the situation,
- frequent or lasting for weeks,
- causing avoidance or getting in the way of work, study or relationships.

The main anxiety disorders are generalised anxiety, panic disorder, social anxiety, specific phobias and agoraphobia. They are among the most common mental health problems, and also among the most treatable: CBT is the first-line psychological treatment.

**Exercise.** For one week, note each time you feel anxious: the situation, the intensity (0–10) and what your body does. You will start to see patterns.$md$,
  content_fr = $md$L'anxiété est le système d'alarme du corps. Face à une menace, le cerveau déclenche une cascade : cœur qui accélère, respiration plus rapide, muscles tendus, attention fixée sur le danger. Cette réaction de **lutte ou de fuite** a permis à nos ancêtres de survivre.

Le problème commence quand l'alarme se déclenche **sans danger réel**, trop souvent ou trop fort : avant une réunion, à l'idée d'une maladie, dans un lieu bondé. Le corps réagit comme si la menace était physique, même quand il s'agit d'une pensée.

**Anxiété normale ou trouble ?** L'anxiété devient un problème quand elle est :
- disproportionnée par rapport à la situation,
- fréquente ou durable, sur plusieurs semaines,
- source d'évitement, ou qu'elle gêne le travail, les études ou les relations.

Les principaux troubles anxieux sont l'anxiété généralisée, le trouble panique, l'anxiété sociale, les phobies spécifiques et l'agoraphobie. Ils comptent parmi les troubles psychiques les plus fréquents, et aussi parmi ceux qui se soignent le mieux : la TCC est le traitement psychologique de première intention.

**Exercice.** Pendant une semaine, notez chaque moment d'anxiété : la situation, l'intensité (0–10) et ce que fait votre corps. Des régularités vont apparaître.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'understanding-anxiety-7adcee' AND m.order_index = 1;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 1, 'What anxiety actually is', 'Ce qu''est vraiment l''anxiété', 'ما هو القلق حقاً', 12, $md$Anxiety is the body's alarm system. Faced with a threat, the brain triggers a cascade: faster heart, quicker breathing, tense muscles, attention locked on danger. This **fight-or-flight** response kept our ancestors alive.

The trouble starts when the alarm goes off **without a real danger**, too often or too loudly: before a meeting, at the thought of an illness, in a crowded place. The body reacts as if the threat were physical, even when it is a thought.

**Normal anxiety or a disorder?** Anxiety becomes a problem when it is:
- disproportionate to the situation,
- frequent or lasting for weeks,
- causing avoidance or getting in the way of work, study or relationships.

The main anxiety disorders are generalised anxiety, panic disorder, social anxiety, specific phobias and agoraphobia. They are among the most common mental health problems, and also among the most treatable: CBT is the first-line psychological treatment.

**Exercise.** For one week, note each time you feel anxious: the situation, the intensity (0–10) and what your body does. You will start to see patterns.$md$, $md$L'anxiété est le système d'alarme du corps. Face à une menace, le cerveau déclenche une cascade : cœur qui accélère, respiration plus rapide, muscles tendus, attention fixée sur le danger. Cette réaction de **lutte ou de fuite** a permis à nos ancêtres de survivre.

Le problème commence quand l'alarme se déclenche **sans danger réel**, trop souvent ou trop fort : avant une réunion, à l'idée d'une maladie, dans un lieu bondé. Le corps réagit comme si la menace était physique, même quand il s'agit d'une pensée.

**Anxiété normale ou trouble ?** L'anxiété devient un problème quand elle est :
- disproportionnée par rapport à la situation,
- fréquente ou durable, sur plusieurs semaines,
- source d'évitement, ou qu'elle gêne le travail, les études ou les relations.

Les principaux troubles anxieux sont l'anxiété généralisée, le trouble panique, l'anxiété sociale, les phobies spécifiques et l'agoraphobie. Ils comptent parmi les troubles psychiques les plus fréquents, et aussi parmi ceux qui se soignent le mieux : la TCC est le traitement psychologique de première intention.

**Exercice.** Pendant une semaine, notez chaque moment d'anxiété : la situation, l'intensité (0–10) et ce que fait votre corps. Des régularités vont apparaître.$md$
FROM public.courses c WHERE c.slug = 'understanding-anxiety-7adcee'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 1);

UPDATE public.course_modules m SET title = 'The anxiety loop', title_fr = 'Le cercle de l''anxiété', title_ar = 'حلقة القلق', duration_minutes = 12,
  content = $md$Anxiety keeps itself going through a loop:

1. **Trigger**: a situation, a sensation, a thought.
2. **Anxious thought**: "I'm going to lose control", "something bad will happen".
3. **Body response**: racing heart, tight chest, dizziness.
4. **Behaviour**: avoiding, escaping, checking, seeking reassurance.
5. **Short-term relief**, which teaches the brain that the danger was real and that avoidance saved you.

That last step is the trap. Avoidance and **safety behaviours** (always sitting near the exit, carrying water "just in case", asking for reassurance) prevent you from discovering that the feared outcome does not happen, or that you can cope with it.

Breaking the loop is possible at each step: questioning the thought, calming the body, and above all **gradually facing** what you avoid.

**Exercise.** Draw your own loop for a recent situation using the [cognitive model worksheet](/resources/tcc-modele-cognitif). Circle the behaviours that bring relief now but keep the fear alive.$md$,
  content_fr = $md$L'anxiété s'entretient par un cercle :

1. **Déclencheur** : une situation, une sensation, une pensée.
2. **Pensée anxieuse** : « je vais perdre le contrôle », « il va arriver quelque chose de grave ».
3. **Réaction du corps** : cœur qui s'emballe, poitrine serrée, vertige.
4. **Comportement** : éviter, fuir, vérifier, chercher à être rassuré.
5. **Soulagement immédiat**, qui apprend au cerveau que le danger était réel et que l'évitement vous a sauvé.

Cette dernière étape est le piège. L'évitement et les **comportements de sécurité** (s'asseoir toujours près de la sortie, garder de l'eau « au cas où », demander à être rassuré) empêchent de découvrir que la catastrophe redoutée n'arrive pas, ou que l'on peut y faire face.

On peut casser le cercle à chaque étape : questionner la pensée, apaiser le corps, et surtout **affronter progressivement** ce que l'on évite.

**Exercice.** Dessinez votre propre cercle pour une situation récente avec la [fiche du modèle cognitif](/resources/tcc-modele-cognitif). Entourez les comportements qui soulagent sur le moment mais entretiennent la peur.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'understanding-anxiety-7adcee' AND m.order_index = 2;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 2, 'The anxiety loop', 'Le cercle de l''anxiété', 'حلقة القلق', 12, $md$Anxiety keeps itself going through a loop:

1. **Trigger**: a situation, a sensation, a thought.
2. **Anxious thought**: "I'm going to lose control", "something bad will happen".
3. **Body response**: racing heart, tight chest, dizziness.
4. **Behaviour**: avoiding, escaping, checking, seeking reassurance.
5. **Short-term relief**, which teaches the brain that the danger was real and that avoidance saved you.

That last step is the trap. Avoidance and **safety behaviours** (always sitting near the exit, carrying water "just in case", asking for reassurance) prevent you from discovering that the feared outcome does not happen, or that you can cope with it.

Breaking the loop is possible at each step: questioning the thought, calming the body, and above all **gradually facing** what you avoid.

**Exercise.** Draw your own loop for a recent situation using the [cognitive model worksheet](/resources/tcc-modele-cognitif). Circle the behaviours that bring relief now but keep the fear alive.$md$, $md$L'anxiété s'entretient par un cercle :

1. **Déclencheur** : une situation, une sensation, une pensée.
2. **Pensée anxieuse** : « je vais perdre le contrôle », « il va arriver quelque chose de grave ».
3. **Réaction du corps** : cœur qui s'emballe, poitrine serrée, vertige.
4. **Comportement** : éviter, fuir, vérifier, chercher à être rassuré.
5. **Soulagement immédiat**, qui apprend au cerveau que le danger était réel et que l'évitement vous a sauvé.

Cette dernière étape est le piège. L'évitement et les **comportements de sécurité** (s'asseoir toujours près de la sortie, garder de l'eau « au cas où », demander à être rassuré) empêchent de découvrir que la catastrophe redoutée n'arrive pas, ou que l'on peut y faire face.

On peut casser le cercle à chaque étape : questionner la pensée, apaiser le corps, et surtout **affronter progressivement** ce que l'on évite.

**Exercice.** Dessinez votre propre cercle pour une situation récente avec la [fiche du modèle cognitif](/resources/tcc-modele-cognitif). Entourez les comportements qui soulagent sur le moment mais entretiennent la peur.$md$
FROM public.courses c WHERE c.slug = 'understanding-anxiety-7adcee'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 2);

UPDATE public.course_modules m SET title = 'Calming the body, facing the fear', title_fr = 'Apaiser le corps, affronter la peur', title_ar = 'تهدئة الجسد ومواجهة الخوف', duration_minutes = 15,
  content = $md$**Calming the body** does not cure anxiety, but it lowers the volume enough to think and act.
- [Box breathing](/resources/box-breathing): slow, regular breaths, long out-breath.
- [5-4-3-2-1 grounding](/resources/grounding-54321): bring attention back to the senses.

The aim of grounding is to **widen** attention, not to escape. If a technique becomes a way to avoid feeling anything, it turns into a safety behaviour.

**Facing the fear** is the most effective ingredient of CBT for anxiety. Exposure means approaching feared situations **gradually, repeatedly and long enough** for the brain to learn something new: "I can stay here, and it passes."

1. List the situations you avoid.
2. Rate each one 0–100 for anxiety.
3. Start with one around 30–40 and repeat it until it feels easier.
4. Move up one step at a time.

Use the [exposure hierarchy worksheet](/resources/tcc-hierarchie-exposition) to build your ladder.

**Exercise.** Choose one small step from your ladder and do it three times this week. Note your anxiety before, at the peak and at the end.$md$,
  content_fr = $md$**Apaiser le corps** ne guérit pas l'anxiété, mais baisse suffisamment le volume pour pouvoir réfléchir et agir.
- La [respiration carrée](/resources/box-breathing) : un souffle lent et régulier, une expiration longue.
- L'[ancrage 5-4-3-2-1](/resources/grounding-54321) : ramener l'attention vers les sens.

Le but de l'ancrage est d'**élargir** l'attention, pas de fuir. Si une technique devient une façon de ne rien ressentir, elle se transforme en comportement de sécurité.

**Affronter la peur** est l'ingrédient le plus efficace de la TCC de l'anxiété. L'exposition consiste à s'approcher des situations redoutées **progressivement, de façon répétée et suffisamment longtemps** pour que le cerveau apprenne quelque chose de nouveau : « je peux rester là, et ça passe ».

1. Listez les situations que vous évitez.
2. Notez chacune de 0 à 100 selon l'anxiété.
3. Commencez par une situation autour de 30–40 et répétez-la jusqu'à ce qu'elle devienne plus facile.
4. Montez d'une marche à la fois.

Construisez votre échelle avec la [fiche de hiérarchie d'exposition](/resources/tcc-hierarchie-exposition).

**Exercice.** Choisissez une petite marche et faites-la trois fois cette semaine. Notez votre anxiété avant, au pic et à la fin.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'understanding-anxiety-7adcee' AND m.order_index = 3;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 3, 'Calming the body, facing the fear', 'Apaiser le corps, affronter la peur', 'تهدئة الجسد ومواجهة الخوف', 15, $md$**Calming the body** does not cure anxiety, but it lowers the volume enough to think and act.
- [Box breathing](/resources/box-breathing): slow, regular breaths, long out-breath.
- [5-4-3-2-1 grounding](/resources/grounding-54321): bring attention back to the senses.

The aim of grounding is to **widen** attention, not to escape. If a technique becomes a way to avoid feeling anything, it turns into a safety behaviour.

**Facing the fear** is the most effective ingredient of CBT for anxiety. Exposure means approaching feared situations **gradually, repeatedly and long enough** for the brain to learn something new: "I can stay here, and it passes."

1. List the situations you avoid.
2. Rate each one 0–100 for anxiety.
3. Start with one around 30–40 and repeat it until it feels easier.
4. Move up one step at a time.

Use the [exposure hierarchy worksheet](/resources/tcc-hierarchie-exposition) to build your ladder.

**Exercise.** Choose one small step from your ladder and do it three times this week. Note your anxiety before, at the peak and at the end.$md$, $md$**Apaiser le corps** ne guérit pas l'anxiété, mais baisse suffisamment le volume pour pouvoir réfléchir et agir.
- La [respiration carrée](/resources/box-breathing) : un souffle lent et régulier, une expiration longue.
- L'[ancrage 5-4-3-2-1](/resources/grounding-54321) : ramener l'attention vers les sens.

Le but de l'ancrage est d'**élargir** l'attention, pas de fuir. Si une technique devient une façon de ne rien ressentir, elle se transforme en comportement de sécurité.

**Affronter la peur** est l'ingrédient le plus efficace de la TCC de l'anxiété. L'exposition consiste à s'approcher des situations redoutées **progressivement, de façon répétée et suffisamment longtemps** pour que le cerveau apprenne quelque chose de nouveau : « je peux rester là, et ça passe ».

1. Listez les situations que vous évitez.
2. Notez chacune de 0 à 100 selon l'anxiété.
3. Commencez par une situation autour de 30–40 et répétez-la jusqu'à ce qu'elle devienne plus facile.
4. Montez d'une marche à la fois.

Construisez votre échelle avec la [fiche de hiérarchie d'exposition](/resources/tcc-hierarchie-exposition).

**Exercice.** Choisissez une petite marche et faites-la trois fois cette semaine. Notez votre anxiété avant, au pic et à la fin.$md$
FROM public.courses c WHERE c.slug = 'understanding-anxiety-7adcee'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 3);

UPDATE public.course_modules m SET title = 'When to seek a professional', title_fr = 'Quand consulter un professionnel', title_ar = 'متى تستشير مختصاً', duration_minutes = 8,
  content = $md$Self-help tools are useful, but some situations call for a psychologist or a doctor. Consider consulting when:
- anxiety has disrupted work, study or relationships for more than two weeks,
- panic attacks keep coming back,
- the list of places or situations you avoid keeps growing,
- you use alcohol, cannabis or medication to cope,
- sleep, appetite or mood are also affected.

**Seek help immediately** if you have thoughts of harming yourself or ending your life: call emergency services (141 or 15 in Morocco) or go to the nearest emergency department.

**What to expect.** A first session usually explores what you are experiencing, its history and what you want to change. CBT for anxiety typically involves 8 to 20 sessions, with exercises between sessions. A doctor may also discuss medication, which can be combined with therapy.

You can [find a psychologist on U.Psy](/psychologists), in person or online.

**Further reading:** Craske, M. G., & Barlow, D. H. (2006). *Mastery of Your Anxiety and Worry*. Oxford University Press. NICE (2011). *Generalised anxiety disorder and panic disorder in adults: management* (CG113).$md$,
  content_fr = $md$Les outils d'auto-assistance sont utiles, mais certaines situations demandent un psychologue ou un médecin. Pensez à consulter quand :
- l'anxiété perturbe le travail, les études ou les relations depuis plus de deux semaines,
- les attaques de panique se répètent,
- la liste des lieux ou situations évités s'allonge,
- vous utilisez l'alcool, le cannabis ou des médicaments pour tenir,
- le sommeil, l'appétit ou l'humeur sont aussi touchés.

**Demandez de l'aide immédiatement** si vous avez des idées de vous faire du mal ou de mettre fin à vos jours : appelez les urgences (141 ou 15 au Maroc) ou rendez-vous aux urgences les plus proches.

**À quoi s'attendre.** Une première séance explore en général ce que vous vivez, son histoire et ce que vous voulez changer. Une TCC de l'anxiété comprend souvent 8 à 20 séances, avec des exercices entre les séances. Un médecin peut aussi discuter d'un traitement médicamenteux, qui peut s'associer à la thérapie.

Vous pouvez [trouver un psychologue sur U.Psy](/psychologists), en cabinet ou en ligne.

**Pour aller plus loin :** Craske, M. G., & Barlow, D. H. (2006). *Mastery of Your Anxiety and Worry*. Oxford University Press. NICE (2011). *Generalised anxiety disorder and panic disorder in adults: management* (CG113).$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'understanding-anxiety-7adcee' AND m.order_index = 4;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 4, 'When to seek a professional', 'Quand consulter un professionnel', 'متى تستشير مختصاً', 8, $md$Self-help tools are useful, but some situations call for a psychologist or a doctor. Consider consulting when:
- anxiety has disrupted work, study or relationships for more than two weeks,
- panic attacks keep coming back,
- the list of places or situations you avoid keeps growing,
- you use alcohol, cannabis or medication to cope,
- sleep, appetite or mood are also affected.

**Seek help immediately** if you have thoughts of harming yourself or ending your life: call emergency services (141 or 15 in Morocco) or go to the nearest emergency department.

**What to expect.** A first session usually explores what you are experiencing, its history and what you want to change. CBT for anxiety typically involves 8 to 20 sessions, with exercises between sessions. A doctor may also discuss medication, which can be combined with therapy.

You can [find a psychologist on U.Psy](/psychologists), in person or online.

**Further reading:** Craske, M. G., & Barlow, D. H. (2006). *Mastery of Your Anxiety and Worry*. Oxford University Press. NICE (2011). *Generalised anxiety disorder and panic disorder in adults: management* (CG113).$md$, $md$Les outils d'auto-assistance sont utiles, mais certaines situations demandent un psychologue ou un médecin. Pensez à consulter quand :
- l'anxiété perturbe le travail, les études ou les relations depuis plus de deux semaines,
- les attaques de panique se répètent,
- la liste des lieux ou situations évités s'allonge,
- vous utilisez l'alcool, le cannabis ou des médicaments pour tenir,
- le sommeil, l'appétit ou l'humeur sont aussi touchés.

**Demandez de l'aide immédiatement** si vous avez des idées de vous faire du mal ou de mettre fin à vos jours : appelez les urgences (141 ou 15 au Maroc) ou rendez-vous aux urgences les plus proches.

**À quoi s'attendre.** Une première séance explore en général ce que vous vivez, son histoire et ce que vous voulez changer. Une TCC de l'anxiété comprend souvent 8 à 20 séances, avec des exercices entre les séances. Un médecin peut aussi discuter d'un traitement médicamenteux, qui peut s'associer à la thérapie.

Vous pouvez [trouver un psychologue sur U.Psy](/psychologists), en cabinet ou en ligne.

**Pour aller plus loin :** Craske, M. G., & Barlow, D. H. (2006). *Mastery of Your Anxiety and Worry*. Oxford University Press. NICE (2011). *Generalised anxiety disorder and panic disorder in adults: management* (CG113).$md$
FROM public.courses c WHERE c.slug = 'understanding-anxiety-7adcee'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 4);

UPDATE public.courses SET title = 'Stress Management Essentials', title_fr = 'L''essentiel de la gestion du stress', title_ar = 'أساسيات إدارة الضغط النفسي',
  description = 'Understand how stress works and build a daily toolkit: problem solving, recovery and early warning signs.', description_fr = 'Comprendre le fonctionnement du stress et se construire une boîte à outils : résolution de problèmes, récupération et signaux d''alerte.', description_ar = 'فهم آلية الضغط النفسي وبناء أدوات يومية: حل المشكلات، التعافي، وعلامات الإنذار المبكر.',
  difficulty_level = 'beginner', duration_hours = 0.7
WHERE slug = 'stress-management-essentials-a0c0c6';

UPDATE public.course_modules m SET title = 'Stress is information', title_fr = 'Le stress est une information', title_ar = 'الضغط النفسي معلومة', duration_minutes = 10,
  content = $md$According to Lazarus and Folkman's transactional model, stress arises when we judge that the **demands** of a situation exceed our **resources** to cope. Two appraisals happen almost instantly: "Is this a threat?" and "Can I handle it?"

This has a practical consequence: there are always **two levers**.
- **Reduce the demand**: say no, delegate, set priorities, ask for a deadline.
- **Increase the resources**: skills, support, rest, information, time.

Some stress is useful: it focuses attention and mobilises energy for a deadline or a match. It becomes harmful when it is **intense and lasting**, without recovery.

**Exercise: your stress map.** Draw two columns. On the left, list your current demands (work, family, money, health). On the right, your resources (people, skills, routines). For each major demand, write one action that lowers it or one resource that would help.$md$,
  content_fr = $md$Selon le modèle transactionnel de Lazarus et Folkman, le stress apparaît quand on estime que les **exigences** d'une situation dépassent nos **ressources** pour y faire face. Deux évaluations se font presque instantanément : « Est-ce une menace ? » et « Est-ce que je peux y faire face ? »

Conséquence pratique : il y a toujours **deux leviers**.
- **Réduire l'exigence** : dire non, déléguer, prioriser, demander un délai.
- **Augmenter les ressources** : compétences, soutien, repos, information, temps.

Un certain stress est utile : il concentre l'attention et mobilise l'énergie pour une échéance ou un match. Il devient nocif quand il est **intense et durable**, sans récupération.

**Exercice : votre carte du stress.** Tracez deux colonnes. À gauche, vos exigences actuelles (travail, famille, argent, santé). À droite, vos ressources (personnes, compétences, habitudes). Pour chaque exigence importante, écrivez une action qui la réduit ou une ressource qui aiderait.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'stress-management-essentials-a0c0c6' AND m.order_index = 1;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 1, 'Stress is information', 'Le stress est une information', 'الضغط النفسي معلومة', 10, $md$According to Lazarus and Folkman's transactional model, stress arises when we judge that the **demands** of a situation exceed our **resources** to cope. Two appraisals happen almost instantly: "Is this a threat?" and "Can I handle it?"

This has a practical consequence: there are always **two levers**.
- **Reduce the demand**: say no, delegate, set priorities, ask for a deadline.
- **Increase the resources**: skills, support, rest, information, time.

Some stress is useful: it focuses attention and mobilises energy for a deadline or a match. It becomes harmful when it is **intense and lasting**, without recovery.

**Exercise: your stress map.** Draw two columns. On the left, list your current demands (work, family, money, health). On the right, your resources (people, skills, routines). For each major demand, write one action that lowers it or one resource that would help.$md$, $md$Selon le modèle transactionnel de Lazarus et Folkman, le stress apparaît quand on estime que les **exigences** d'une situation dépassent nos **ressources** pour y faire face. Deux évaluations se font presque instantanément : « Est-ce une menace ? » et « Est-ce que je peux y faire face ? »

Conséquence pratique : il y a toujours **deux leviers**.
- **Réduire l'exigence** : dire non, déléguer, prioriser, demander un délai.
- **Augmenter les ressources** : compétences, soutien, repos, information, temps.

Un certain stress est utile : il concentre l'attention et mobilise l'énergie pour une échéance ou un match. Il devient nocif quand il est **intense et durable**, sans récupération.

**Exercice : votre carte du stress.** Tracez deux colonnes. À gauche, vos exigences actuelles (travail, famille, argent, santé). À droite, vos ressources (personnes, compétences, habitudes). Pour chaque exigence importante, écrivez une action qui la réduit ou une ressource qui aiderait.$md$
FROM public.courses c WHERE c.slug = 'stress-management-essentials-a0c0c6'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 1);

UPDATE public.course_modules m SET title = 'Solving the problems you can solve', title_fr = 'Résoudre les problèmes qui peuvent l''être', title_ar = 'حل المشكلات القابلة للحل', duration_minutes = 12,
  content = $md$Much stress comes from problems we turn over in our heads without acting. **Rumination** feels like work but rarely produces a decision.

A useful first sort:
- **Practical problems** (a bill, a conflict, an exam): use structured problem solving.
- **Problems outside your control** (others' choices, the economy, the past): work on how you respond, not on the problem itself.

The [7-step problem-solving worksheet](/resources/tcc-resolution-de-problemes) guides you: define the problem precisely, brainstorm solutions without judging, weigh pros and cons, pick one, plan the first step, act, review.

For worries that keep looping, the [worry management guide](/resources/tcc-gerer-les-inquietudes) offers two techniques: a daily **worry time** and the **decision tree** ("Can I do something about this, now?").

**Exercise.** Choose one practical problem that has been stressing you for more than a week and take it through the seven steps today.$md$,
  content_fr = $md$Une grande partie du stress vient de problèmes que l'on retourne dans sa tête sans agir. La **rumination** donne l'impression de travailler, mais produit rarement une décision.

Un premier tri utile :
- **Problèmes pratiques** (une facture, un conflit, un examen) : utilisez la résolution de problèmes structurée.
- **Problèmes hors de votre contrôle** (les choix des autres, l'économie, le passé) : travaillez sur votre façon d'y répondre, pas sur le problème lui-même.

La [fiche de résolution de problèmes en 7 étapes](/resources/tcc-resolution-de-problemes) vous guide : définir précisément le problème, chercher des solutions sans juger, peser le pour et le contre, choisir, planifier la première étape, agir, faire le bilan.

Pour les inquiétudes qui tournent en boucle, le [guide de gestion des inquiétudes](/resources/tcc-gerer-les-inquietudes) propose deux techniques : un **temps d'inquiétude** quotidien et l'**arbre de décision** (« Puis-je faire quelque chose, maintenant ? »).

**Exercice.** Choisissez un problème pratique qui vous stresse depuis plus d'une semaine et faites-le passer par les sept étapes aujourd'hui.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'stress-management-essentials-a0c0c6' AND m.order_index = 2;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 2, 'Solving the problems you can solve', 'Résoudre les problèmes qui peuvent l''être', 'حل المشكلات القابلة للحل', 12, $md$Much stress comes from problems we turn over in our heads without acting. **Rumination** feels like work but rarely produces a decision.

A useful first sort:
- **Practical problems** (a bill, a conflict, an exam): use structured problem solving.
- **Problems outside your control** (others' choices, the economy, the past): work on how you respond, not on the problem itself.

The [7-step problem-solving worksheet](/resources/tcc-resolution-de-problemes) guides you: define the problem precisely, brainstorm solutions without judging, weigh pros and cons, pick one, plan the first step, act, review.

For worries that keep looping, the [worry management guide](/resources/tcc-gerer-les-inquietudes) offers two techniques: a daily **worry time** and the **decision tree** ("Can I do something about this, now?").

**Exercise.** Choose one practical problem that has been stressing you for more than a week and take it through the seven steps today.$md$, $md$Une grande partie du stress vient de problèmes que l'on retourne dans sa tête sans agir. La **rumination** donne l'impression de travailler, mais produit rarement une décision.

Un premier tri utile :
- **Problèmes pratiques** (une facture, un conflit, un examen) : utilisez la résolution de problèmes structurée.
- **Problèmes hors de votre contrôle** (les choix des autres, l'économie, le passé) : travaillez sur votre façon d'y répondre, pas sur le problème lui-même.

La [fiche de résolution de problèmes en 7 étapes](/resources/tcc-resolution-de-problemes) vous guide : définir précisément le problème, chercher des solutions sans juger, peser le pour et le contre, choisir, planifier la première étape, agir, faire le bilan.

Pour les inquiétudes qui tournent en boucle, le [guide de gestion des inquiétudes](/resources/tcc-gerer-les-inquietudes) propose deux techniques : un **temps d'inquiétude** quotidien et l'**arbre de décision** (« Puis-je faire quelque chose, maintenant ? »).

**Exercice.** Choisissez un problème pratique qui vous stresse depuis plus d'une semaine et faites-le passer par les sept étapes aujourd'hui.$md$
FROM public.courses c WHERE c.slug = 'stress-management-essentials-a0c0c6'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 2);

UPDATE public.course_modules m SET title = 'Recovery is a skill', title_fr = 'La récupération s''apprend', title_ar = 'التعافي مهارة', duration_minutes = 10,
  content = $md$Recovery is not just the absence of stress: it is an **active process** that lets the body and mind return to baseline. Research on recovery from work identifies four ingredients:
- **Psychological detachment**: really switching off from work in your free time.
- **Relaxation**: activities that lower physical arousal.
- **Mastery**: learning something or taking on a challenge outside work.
- **Control**: choosing for yourself how to spend your time.

Practical habits:
- A **transition ritual** between work and home (a walk, changing clothes, a short breathing exercise).
- Sleep at regular times; see the [CBT for insomnia guide](/resources/tcc-sommeil-tcc-i) if sleep is a problem.
- Regular physical activity: one of the best-supported ways to reduce stress and low mood.
- Short breaks during the day, every 60 to 90 minutes.

**Exercise.** Plan one activity from each of the four ingredients this week and note how you feel afterwards (0–10).$md$,
  content_fr = $md$La récupération n'est pas seulement l'absence de stress : c'est un **processus actif** qui permet au corps et à l'esprit de revenir à leur état de base. Les recherches sur la récupération après le travail identifient quatre ingrédients :
- **Le détachement psychologique** : vraiment décrocher du travail pendant son temps libre.
- **La relaxation** : des activités qui font baisser l'activation physique.
- **La maîtrise** : apprendre quelque chose ou relever un défi en dehors du travail.
- **Le contrôle** : choisir soi-même comment occuper son temps.

Des habitudes concrètes :
- Un **rituel de transition** entre travail et maison (marcher, se changer, un court exercice de respiration).
- Dormir à heures régulières ; voir le [guide TCC de l'insomnie](/resources/tcc-sommeil-tcc-i) si le sommeil pose problème.
- Une activité physique régulière : l'un des moyens les mieux démontrés pour réduire le stress et la baisse de moral.
- De courtes pauses dans la journée, toutes les 60 à 90 minutes.

**Exercice.** Planifiez cette semaine une activité pour chacun des quatre ingrédients, et notez votre état après (0–10).$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'stress-management-essentials-a0c0c6' AND m.order_index = 3;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 3, 'Recovery is a skill', 'La récupération s''apprend', 'التعافي مهارة', 10, $md$Recovery is not just the absence of stress: it is an **active process** that lets the body and mind return to baseline. Research on recovery from work identifies four ingredients:
- **Psychological detachment**: really switching off from work in your free time.
- **Relaxation**: activities that lower physical arousal.
- **Mastery**: learning something or taking on a challenge outside work.
- **Control**: choosing for yourself how to spend your time.

Practical habits:
- A **transition ritual** between work and home (a walk, changing clothes, a short breathing exercise).
- Sleep at regular times; see the [CBT for insomnia guide](/resources/tcc-sommeil-tcc-i) if sleep is a problem.
- Regular physical activity: one of the best-supported ways to reduce stress and low mood.
- Short breaks during the day, every 60 to 90 minutes.

**Exercise.** Plan one activity from each of the four ingredients this week and note how you feel afterwards (0–10).$md$, $md$La récupération n'est pas seulement l'absence de stress : c'est un **processus actif** qui permet au corps et à l'esprit de revenir à leur état de base. Les recherches sur la récupération après le travail identifient quatre ingrédients :
- **Le détachement psychologique** : vraiment décrocher du travail pendant son temps libre.
- **La relaxation** : des activités qui font baisser l'activation physique.
- **La maîtrise** : apprendre quelque chose ou relever un défi en dehors du travail.
- **Le contrôle** : choisir soi-même comment occuper son temps.

Des habitudes concrètes :
- Un **rituel de transition** entre travail et maison (marcher, se changer, un court exercice de respiration).
- Dormir à heures régulières ; voir le [guide TCC de l'insomnie](/resources/tcc-sommeil-tcc-i) si le sommeil pose problème.
- Une activité physique régulière : l'un des moyens les mieux démontrés pour réduire le stress et la baisse de moral.
- De courtes pauses dans la journée, toutes les 60 à 90 minutes.

**Exercice.** Planifiez cette semaine une activité pour chacun des quatre ingrédients, et notez votre état après (0–10).$md$
FROM public.courses c WHERE c.slug = 'stress-management-essentials-a0c0c6'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 3);

UPDATE public.course_modules m SET title = 'Burnout warning signs', title_fr = 'Les signaux d''alerte de l''épuisement', title_ar = 'علامات الإنذار للاحتراق النفسي', duration_minutes = 8,
  content = $md$The WHO describes burnout (ICD-11) as an occupational phenomenon resulting from chronic workplace stress that has not been successfully managed. It has three dimensions:
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

**Further reading:** Lazarus, R. S., & Folkman, S. (1984). *Stress, Appraisal, and Coping*. Springer. Sonnentag, S., & Fritz, C. (2007). The Recovery Experience Questionnaire. *Journal of Occupational Health Psychology*, 12(3), 204–221.$md$,
  content_fr = $md$L'OMS décrit l'épuisement professionnel (CIM-11) comme un phénomène lié au travail, résultant d'un stress chronique au travail qui n'a pas été géré avec succès. Il a trois dimensions :
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

**Pour aller plus loin :** Lazarus, R. S., & Folkman, S. (1984). *Stress, Appraisal, and Coping*. Springer. Sonnentag, S., & Fritz, C. (2007). The Recovery Experience Questionnaire. *Journal of Occupational Health Psychology*, 12(3), 204–221.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'stress-management-essentials-a0c0c6' AND m.order_index = 4;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 4, 'Burnout warning signs', 'Les signaux d''alerte de l''épuisement', 'علامات الإنذار للاحتراق النفسي', 8, $md$The WHO describes burnout (ICD-11) as an occupational phenomenon resulting from chronic workplace stress that has not been successfully managed. It has three dimensions:
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

**Further reading:** Lazarus, R. S., & Folkman, S. (1984). *Stress, Appraisal, and Coping*. Springer. Sonnentag, S., & Fritz, C. (2007). The Recovery Experience Questionnaire. *Journal of Occupational Health Psychology*, 12(3), 204–221.$md$, $md$L'OMS décrit l'épuisement professionnel (CIM-11) comme un phénomène lié au travail, résultant d'un stress chronique au travail qui n'a pas été géré avec succès. Il a trois dimensions :
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

**Pour aller plus loin :** Lazarus, R. S., & Folkman, S. (1984). *Stress, Appraisal, and Coping*. Springer. Sonnentag, S., & Fritz, C. (2007). The Recovery Experience Questionnaire. *Journal of Occupational Health Psychology*, 12(3), 204–221.$md$
FROM public.courses c WHERE c.slug = 'stress-management-essentials-a0c0c6'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 4);

UPDATE public.courses SET title = 'Mental Resilience Training', title_fr = 'Entraînement à la résilience mentale', title_ar = 'تدريب المرونة النفسية',
  description = 'Resilience is learned: flexible thinking, self-compassion, values-based action and a solid support network.', description_fr = 'La résilience s''apprend : pensée flexible, auto-compassion, action guidée par les valeurs et réseau de soutien.', description_ar = 'المرونة النفسية تُكتسب: تفكير مرن، تعاطف مع الذات، أفعال توجهها القيم، وشبكة دعم متينة.',
  difficulty_level = 'intermediate', duration_hours = 0.8
WHERE slug = 'mental-resilience-training-bedff3';

UPDATE public.course_modules m SET title = 'Resilience is a skill, not a trait', title_fr = 'La résilience est une compétence, pas un trait', title_ar = 'المرونة مهارة وليست سمة', duration_minutes = 10,
  content = $md$Resilience is the ability to adapt well to adversity, trauma or significant stress, and to recover from it. Long-term studies show it is **common**, not exceptional: most people who go through hard events do not develop lasting difficulties.

Resilience is not the absence of pain. Resilient people feel sadness, fear and anger; what differs is how they move through them.

Factors that support resilience, and that can be developed:
- **supportive relationships**,
- **flexible thinking**: seeing a situation from several angles,
- **emotion regulation**: naming and tolerating emotions,
- **active coping**: acting on what can be changed,
- **meaning and values**: knowing what matters to you.

**Exercise.** Think of a past difficulty you got through. What helped? Write down three resources (people, habits, beliefs) you used. They are part of your resilience toolkit.$md$,
  content_fr = $md$La résilience est la capacité à bien s'adapter face à l'adversité, à un traumatisme ou à un stress important, et à s'en remettre. Les études au long cours montrent qu'elle est **fréquente**, pas exceptionnelle : la plupart des personnes qui traversent des événements difficiles ne développent pas de difficultés durables.

La résilience n'est pas l'absence de souffrance. Les personnes résilientes ressentent tristesse, peur et colère ; ce qui diffère, c'est la façon de les traverser.

Les facteurs qui soutiennent la résilience, et qui se développent :
- **des relations soutenantes**,
- **une pensée flexible** : voir une situation sous plusieurs angles,
- **la régulation émotionnelle** : nommer et tolérer ses émotions,
- **un coping actif** : agir sur ce qui peut changer,
- **du sens et des valeurs** : savoir ce qui compte pour soi.

**Exercice.** Pensez à une difficulté passée que vous avez traversée. Qu'est-ce qui vous a aidé ? Notez trois ressources (personnes, habitudes, convictions) que vous avez utilisées. Elles font partie de votre boîte à outils.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'mental-resilience-training-bedff3' AND m.order_index = 1;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 1, 'Resilience is a skill, not a trait', 'La résilience est une compétence, pas un trait', 'المرونة مهارة وليست سمة', 10, $md$Resilience is the ability to adapt well to adversity, trauma or significant stress, and to recover from it. Long-term studies show it is **common**, not exceptional: most people who go through hard events do not develop lasting difficulties.

Resilience is not the absence of pain. Resilient people feel sadness, fear and anger; what differs is how they move through them.

Factors that support resilience, and that can be developed:
- **supportive relationships**,
- **flexible thinking**: seeing a situation from several angles,
- **emotion regulation**: naming and tolerating emotions,
- **active coping**: acting on what can be changed,
- **meaning and values**: knowing what matters to you.

**Exercise.** Think of a past difficulty you got through. What helped? Write down three resources (people, habits, beliefs) you used. They are part of your resilience toolkit.$md$, $md$La résilience est la capacité à bien s'adapter face à l'adversité, à un traumatisme ou à un stress important, et à s'en remettre. Les études au long cours montrent qu'elle est **fréquente**, pas exceptionnelle : la plupart des personnes qui traversent des événements difficiles ne développent pas de difficultés durables.

La résilience n'est pas l'absence de souffrance. Les personnes résilientes ressentent tristesse, peur et colère ; ce qui diffère, c'est la façon de les traverser.

Les facteurs qui soutiennent la résilience, et qui se développent :
- **des relations soutenantes**,
- **une pensée flexible** : voir une situation sous plusieurs angles,
- **la régulation émotionnelle** : nommer et tolérer ses émotions,
- **un coping actif** : agir sur ce qui peut changer,
- **du sens et des valeurs** : savoir ce qui compte pour soi.

**Exercice.** Pensez à une difficulté passée que vous avez traversée. Qu'est-ce qui vous a aidé ? Notez trois ressources (personnes, habitudes, convictions) que vous avez utilisées. Elles font partie de votre boîte à outils.$md$
FROM public.courses c WHERE c.slug = 'mental-resilience-training-bedff3'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 1);

UPDATE public.course_modules m SET title = 'Flexible thinking in practice', title_fr = 'La pensée flexible en pratique', title_ar = 'التفكير المرن عملياً', duration_minutes = 15,
  content = $md$Reframing is not "positive thinking". It means asking: **what is the most accurate and useful way to see this?**

Two complementary approaches:

**1. Examine the thought (CBT).** Catch the automatic thought, check it against the evidence, and write a more balanced version.
- [Thought record](/resources/tcc-tableau-des-pensees)
- [Cognitive distortions](/resources/tcc-distorsions-cognitives): all-or-nothing thinking, catastrophising, mind reading…
- [Socratic questions](/resources/tcc-questionnement-socratique)

**2. Step back from the thought (ACT).** Instead of debating it, notice it as a thought: "I'm having the thought that I'll fail." See [cognitive defusion](/resources/cognitive-defusion).

Use the first when the thought is clearly distorted and you want to test it; the second when it keeps coming back, or when arguing with it only feeds it.

**Exercise.** Take a recent setback. Fill in a thought record, then write the main thought with the "I'm having the thought that…" prefix. Which approach helped more?$md$,
  content_fr = $md$Recadrer, ce n'est pas « penser positif ». C'est se demander : **quelle est la façon la plus juste et la plus utile de voir cela ?**

Deux approches complémentaires :

**1. Examiner la pensée (TCC).** Repérer la pensée automatique, la confronter aux faits, et formuler une version plus équilibrée.
- [Tableau des pensées](/resources/tcc-tableau-des-pensees)
- [Distorsions cognitives](/resources/tcc-distorsions-cognitives) : tout ou rien, catastrophisme, lecture de pensée…
- [Questions socratiques](/resources/tcc-questionnement-socratique)

**2. Prendre du recul par rapport à la pensée (ACT).** Au lieu d'en débattre, la remarquer comme une pensée : « j'ai la pensée que je vais échouer ». Voir la [défusion cognitive](/resources/cognitive-defusion).

Utilisez la première quand la pensée est clairement déformée et que vous voulez la tester ; la seconde quand elle revient sans cesse, ou quand la contester ne fait que la nourrir.

**Exercice.** Prenez un revers récent. Remplissez un tableau des pensées, puis réécrivez la pensée principale avec le préfixe « j'ai la pensée que… ». Quelle approche vous a le plus aidé ?$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'mental-resilience-training-bedff3' AND m.order_index = 2;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 2, 'Flexible thinking in practice', 'La pensée flexible en pratique', 'التفكير المرن عملياً', 15, $md$Reframing is not "positive thinking". It means asking: **what is the most accurate and useful way to see this?**

Two complementary approaches:

**1. Examine the thought (CBT).** Catch the automatic thought, check it against the evidence, and write a more balanced version.
- [Thought record](/resources/tcc-tableau-des-pensees)
- [Cognitive distortions](/resources/tcc-distorsions-cognitives): all-or-nothing thinking, catastrophising, mind reading…
- [Socratic questions](/resources/tcc-questionnement-socratique)

**2. Step back from the thought (ACT).** Instead of debating it, notice it as a thought: "I'm having the thought that I'll fail." See [cognitive defusion](/resources/cognitive-defusion).

Use the first when the thought is clearly distorted and you want to test it; the second when it keeps coming back, or when arguing with it only feeds it.

**Exercise.** Take a recent setback. Fill in a thought record, then write the main thought with the "I'm having the thought that…" prefix. Which approach helped more?$md$, $md$Recadrer, ce n'est pas « penser positif ». C'est se demander : **quelle est la façon la plus juste et la plus utile de voir cela ?**

Deux approches complémentaires :

**1. Examiner la pensée (TCC).** Repérer la pensée automatique, la confronter aux faits, et formuler une version plus équilibrée.
- [Tableau des pensées](/resources/tcc-tableau-des-pensees)
- [Distorsions cognitives](/resources/tcc-distorsions-cognitives) : tout ou rien, catastrophisme, lecture de pensée…
- [Questions socratiques](/resources/tcc-questionnement-socratique)

**2. Prendre du recul par rapport à la pensée (ACT).** Au lieu d'en débattre, la remarquer comme une pensée : « j'ai la pensée que je vais échouer ». Voir la [défusion cognitive](/resources/cognitive-defusion).

Utilisez la première quand la pensée est clairement déformée et que vous voulez la tester ; la seconde quand elle revient sans cesse, ou quand la contester ne fait que la nourrir.

**Exercice.** Prenez un revers récent. Remplissez un tableau des pensées, puis réécrivez la pensée principale avec le préfixe « j'ai la pensée que… ». Quelle approche vous a le plus aidé ?$md$
FROM public.courses c WHERE c.slug = 'mental-resilience-training-bedff3'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 2);

UPDATE public.course_modules m SET title = 'Self-compassion and values', title_fr = 'Auto-compassion et valeurs', title_ar = 'التعاطف مع الذات والقيم', duration_minutes = 12,
  content = $md$Two resources make the difference after a setback.

**Self-compassion** means treating yourself as you would a friend in the same situation. It is not self-pity or lowering standards: research links it to more persistence after failure, not less. Practise the [3-step self-compassion break](/resources/self-compassion-break): acknowledge the pain, remember that others feel it too, offer yourself kindness.

**Values** are chosen directions ("be a reliable friend", "keep learning"). When things go wrong, they answer the question "what now?". Unlike goals, they are never "achieved": you can act on them today, even in a hard period.

Fill in your [values compass](/resources/values-compass): rate how important each area of life is to you and how consistent your recent actions have been.

**Exercise.** Choose the area with the largest gap and plan one small action this week that moves you towards it, however small.$md$,
  content_fr = $md$Deux ressources font la différence après un revers.

**L'auto-compassion**, c'est se traiter comme on traiterait un ami dans la même situation. Ce n'est ni de l'apitoiement ni une baisse d'exigence : les recherches l'associent à plus de persévérance après un échec, pas moins. Pratiquez la [pause d'auto-compassion en 3 étapes](/resources/self-compassion-break) : reconnaître la souffrance, se rappeler que d'autres la ressentent, s'offrir de la bienveillance.

**Les valeurs** sont des directions choisies (« être un ami fiable », « continuer à apprendre »). Quand les choses tournent mal, elles répondent à la question « et maintenant ? ». Contrairement aux objectifs, on ne les « atteint » jamais : on peut agir dans leur sens aujourd'hui, même dans une période difficile.

Remplissez votre [boussole de valeurs](/resources/values-compass) : notez l'importance de chaque domaine de vie et la cohérence de vos actions récentes.

**Exercice.** Choisissez le domaine où l'écart est le plus grand et planifiez une petite action cette semaine dans cette direction, aussi petite soit-elle.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'mental-resilience-training-bedff3' AND m.order_index = 3;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 3, 'Self-compassion and values', 'Auto-compassion et valeurs', 'التعاطف مع الذات والقيم', 12, $md$Two resources make the difference after a setback.

**Self-compassion** means treating yourself as you would a friend in the same situation. It is not self-pity or lowering standards: research links it to more persistence after failure, not less. Practise the [3-step self-compassion break](/resources/self-compassion-break): acknowledge the pain, remember that others feel it too, offer yourself kindness.

**Values** are chosen directions ("be a reliable friend", "keep learning"). When things go wrong, they answer the question "what now?". Unlike goals, they are never "achieved": you can act on them today, even in a hard period.

Fill in your [values compass](/resources/values-compass): rate how important each area of life is to you and how consistent your recent actions have been.

**Exercise.** Choose the area with the largest gap and plan one small action this week that moves you towards it, however small.$md$, $md$Deux ressources font la différence après un revers.

**L'auto-compassion**, c'est se traiter comme on traiterait un ami dans la même situation. Ce n'est ni de l'apitoiement ni une baisse d'exigence : les recherches l'associent à plus de persévérance après un échec, pas moins. Pratiquez la [pause d'auto-compassion en 3 étapes](/resources/self-compassion-break) : reconnaître la souffrance, se rappeler que d'autres la ressentent, s'offrir de la bienveillance.

**Les valeurs** sont des directions choisies (« être un ami fiable », « continuer à apprendre »). Quand les choses tournent mal, elles répondent à la question « et maintenant ? ». Contrairement aux objectifs, on ne les « atteint » jamais : on peut agir dans leur sens aujourd'hui, même dans une période difficile.

Remplissez votre [boussole de valeurs](/resources/values-compass) : notez l'importance de chaque domaine de vie et la cohérence de vos actions récentes.

**Exercice.** Choisissez le domaine où l'écart est le plus grand et planifiez une petite action cette semaine dans cette direction, aussi petite soit-elle.$md$
FROM public.courses c WHERE c.slug = 'mental-resilience-training-bedff3'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 3);

UPDATE public.course_modules m SET title = 'Building your support network', title_fr = 'Construire son réseau de soutien', title_ar = 'بناء شبكة دعمك', duration_minutes = 8,
  content = $md$Social support is one of the most consistent protective factors against stress and depression. It comes in several forms:
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

**Further reading:** Bonanno, G. A. (2004). Loss, trauma, and human resilience. *American Psychologist*, 59(1), 20–28. Southwick, S. M., & Charney, D. S. (2018). *Resilience: The Science of Mastering Life's Greatest Challenges* (2nd ed.). Cambridge University Press.$md$,
  content_fr = $md$Le soutien social est l'un des facteurs de protection les plus constants face au stress et à la dépression. Il prend plusieurs formes :
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

**Pour aller plus loin :** Bonanno, G. A. (2004). Loss, trauma, and human resilience. *American Psychologist*, 59(1), 20–28. Southwick, S. M., & Charney, D. S. (2018). *Resilience: The Science of Mastering Life's Greatest Challenges* (2nd ed.). Cambridge University Press.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'mental-resilience-training-bedff3' AND m.order_index = 4;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 4, 'Building your support network', 'Construire son réseau de soutien', 'بناء شبكة دعمك', 8, $md$Social support is one of the most consistent protective factors against stress and depression. It comes in several forms:
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

**Further reading:** Bonanno, G. A. (2004). Loss, trauma, and human resilience. *American Psychologist*, 59(1), 20–28. Southwick, S. M., & Charney, D. S. (2018). *Resilience: The Science of Mastering Life's Greatest Challenges* (2nd ed.). Cambridge University Press.$md$, $md$Le soutien social est l'un des facteurs de protection les plus constants face au stress et à la dépression. Il prend plusieurs formes :
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

**Pour aller plus loin :** Bonanno, G. A. (2004). Loss, trauma, and human resilience. *American Psychologist*, 59(1), 20–28. Southwick, S. M., & Charney, D. S. (2018). *Resilience: The Science of Mastering Life's Greatest Challenges* (2nd ed.). Cambridge University Press.$md$
FROM public.courses c WHERE c.slug = 'mental-resilience-training-bedff3'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 4);

INSERT INTO public.courses (slug, title, title_fr, title_ar, description, description_fr, description_ar, category, difficulty_level, duration_hours, learning_path, is_published, is_paid, price_mad)
SELECT 'tcc-les-fondamentaux', 'CBT Fundamentals', 'Les fondamentaux de la TCC', 'أساسيات العلاج المعرفي السلوكي', 'The core of cognitive behavioural therapy in five modules: the cognitive model, working with thoughts, acting differently and preventing relapse.', 'L''essentiel de la thérapie cognitive et comportementale en cinq modules : le modèle cognitif, le travail sur les pensées, agir autrement et prévenir la rechute.', 'جوهر العلاج المعرفي السلوكي في خمس وحدات: النموذج المعرفي، العمل على الأفكار، التصرف بشكل مختلف، والوقاية من الانتكاس.', 'clinical', 'beginner', 1.1, 'mental-health', true, false, 0
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'tcc-les-fondamentaux');

UPDATE public.course_modules m SET title = 'What CBT is, and how it works', title_fr = 'Ce qu''est la TCC, et comment elle fonctionne', title_ar = 'ما هو العلاج المعرفي السلوكي وكيف يعمل', duration_minutes = 12,
  content = $md$Cognitive behavioural therapy (CBT) is the most extensively studied form of psychotherapy. It is recommended as a first-line treatment for depression, anxiety disorders, insomnia and many other difficulties.

Its main features:
- **Structured and time-limited**: often 8 to 20 sessions, each with an agenda.
- **Focused on the present**: the past is explored to understand, but work centres on what keeps the problem going now.
- **Collaborative**: therapist and client work as a team, like two researchers.
- **Active**: exercises between sessions are an essential part of the work.

At its heart is the **cognitive model**: it is not only events that shape how we feel, but how we interpret them. Thoughts, emotions, body sensations and behaviours influence each other.

Read the [cognitive model guide](/resources/tcc-modele-cognitif) and fill in its table for one situation.

**Exercise.** Choose one difficulty you would like to work on during this course and describe it in two sentences: what happens, and what you would like to be different.$md$,
  content_fr = $md$La thérapie cognitive et comportementale (TCC) est la forme de psychothérapie la plus étudiée. Elle est recommandée en première intention pour la dépression, les troubles anxieux, l'insomnie et bien d'autres difficultés.

Ses caractéristiques :
- **Structurée et limitée dans le temps** : souvent 8 à 20 séances, chacune avec un ordre du jour.
- **Centrée sur le présent** : le passé est exploré pour comprendre, mais le travail porte sur ce qui entretient le problème aujourd'hui.
- **Collaborative** : thérapeute et patient travaillent en équipe, comme deux chercheurs.
- **Active** : les exercices entre les séances sont une partie essentielle du travail.

Au cœur se trouve le **modèle cognitif** : ce ne sont pas seulement les événements qui déterminent ce que l'on ressent, mais la façon dont on les interprète. Pensées, émotions, sensations et comportements s'influencent mutuellement.

Lisez le [guide du modèle cognitif](/resources/tcc-modele-cognitif) et remplissez son tableau pour une situation.

**Exercice.** Choisissez une difficulté sur laquelle vous aimeriez travailler pendant ce cours, et décrivez-la en deux phrases : ce qui se passe, et ce que vous aimeriez voir changer.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'tcc-les-fondamentaux' AND m.order_index = 1;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 1, 'What CBT is, and how it works', 'Ce qu''est la TCC, et comment elle fonctionne', 'ما هو العلاج المعرفي السلوكي وكيف يعمل', 12, $md$Cognitive behavioural therapy (CBT) is the most extensively studied form of psychotherapy. It is recommended as a first-line treatment for depression, anxiety disorders, insomnia and many other difficulties.

Its main features:
- **Structured and time-limited**: often 8 to 20 sessions, each with an agenda.
- **Focused on the present**: the past is explored to understand, but work centres on what keeps the problem going now.
- **Collaborative**: therapist and client work as a team, like two researchers.
- **Active**: exercises between sessions are an essential part of the work.

At its heart is the **cognitive model**: it is not only events that shape how we feel, but how we interpret them. Thoughts, emotions, body sensations and behaviours influence each other.

Read the [cognitive model guide](/resources/tcc-modele-cognitif) and fill in its table for one situation.

**Exercise.** Choose one difficulty you would like to work on during this course and describe it in two sentences: what happens, and what you would like to be different.$md$, $md$La thérapie cognitive et comportementale (TCC) est la forme de psychothérapie la plus étudiée. Elle est recommandée en première intention pour la dépression, les troubles anxieux, l'insomnie et bien d'autres difficultés.

Ses caractéristiques :
- **Structurée et limitée dans le temps** : souvent 8 à 20 séances, chacune avec un ordre du jour.
- **Centrée sur le présent** : le passé est exploré pour comprendre, mais le travail porte sur ce qui entretient le problème aujourd'hui.
- **Collaborative** : thérapeute et patient travaillent en équipe, comme deux chercheurs.
- **Active** : les exercices entre les séances sont une partie essentielle du travail.

Au cœur se trouve le **modèle cognitif** : ce ne sont pas seulement les événements qui déterminent ce que l'on ressent, mais la façon dont on les interprète. Pensées, émotions, sensations et comportements s'influencent mutuellement.

Lisez le [guide du modèle cognitif](/resources/tcc-modele-cognitif) et remplissez son tableau pour une situation.

**Exercice.** Choisissez une difficulté sur laquelle vous aimeriez travailler pendant ce cours, et décrivez-la en deux phrases : ce qui se passe, et ce que vous aimeriez voir changer.$md$
FROM public.courses c WHERE c.slug = 'tcc-les-fondamentaux'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 1);

UPDATE public.course_modules m SET title = 'Catching automatic thoughts', title_fr = 'Repérer les pensées automatiques', title_ar = 'رصد الأفكار التلقائية', duration_minutes = 15,
  content = $md$Automatic thoughts are the quick words or images that cross the mind in a situation. They feel like facts, so we rarely question them.

**How to catch them:** when your mood shifts, ask yourself "What was just going through my mind?". Write the thought word for word, and rate how much you believe it (0–100%).

**Thinking traps.** Some patterns come up again and again. Among the most common:
- all-or-nothing thinking ("if it isn't perfect, it's a failure"),
- catastrophising ("this will be a disaster"),
- mind reading ("they think I'm useless"),
- overgeneralising ("this always happens to me"),
- "should" statements ("I should never be tired").

The [cognitive distortions guide](/resources/tcc-distorsions-cognitives) describes twelve of them with examples.

**Exercise.** For the next three days, each time your mood drops noticeably, fill in the first three columns of the [thought record](/resources/tcc-tableau-des-pensees): situation, emotion (0–100), automatic thought. Then see which traps you recognise.$md$,
  content_fr = $md$Les pensées automatiques sont les mots ou images rapides qui traversent l'esprit dans une situation. Elles ressemblent à des faits, si bien qu'on les remet rarement en question.

**Comment les repérer :** quand votre humeur change, demandez-vous « Qu'est-ce qui vient de me traverser l'esprit ? ». Notez la pensée mot pour mot, et à quel point vous y croyez (0–100 %).

**Les pièges de la pensée.** Certains schémas reviennent sans cesse. Parmi les plus fréquents :
- la pensée tout ou rien (« si ce n'est pas parfait, c'est un échec »),
- le catastrophisme (« ça va être un désastre »),
- la lecture de pensée (« ils pensent que je suis nul »),
- la surgénéralisation (« ça m'arrive toujours »),
- les « je dois » (« je ne devrais jamais être fatigué »).

Le [guide des distorsions cognitives](/resources/tcc-distorsions-cognitives) en décrit douze, avec des exemples.

**Exercice.** Pendant trois jours, chaque fois que votre humeur baisse nettement, remplissez les trois premières colonnes du [tableau des pensées](/resources/tcc-tableau-des-pensees) : situation, émotion (0–100), pensée automatique. Puis repérez les pièges que vous reconnaissez.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'tcc-les-fondamentaux' AND m.order_index = 2;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 2, 'Catching automatic thoughts', 'Repérer les pensées automatiques', 'رصد الأفكار التلقائية', 15, $md$Automatic thoughts are the quick words or images that cross the mind in a situation. They feel like facts, so we rarely question them.

**How to catch them:** when your mood shifts, ask yourself "What was just going through my mind?". Write the thought word for word, and rate how much you believe it (0–100%).

**Thinking traps.** Some patterns come up again and again. Among the most common:
- all-or-nothing thinking ("if it isn't perfect, it's a failure"),
- catastrophising ("this will be a disaster"),
- mind reading ("they think I'm useless"),
- overgeneralising ("this always happens to me"),
- "should" statements ("I should never be tired").

The [cognitive distortions guide](/resources/tcc-distorsions-cognitives) describes twelve of them with examples.

**Exercise.** For the next three days, each time your mood drops noticeably, fill in the first three columns of the [thought record](/resources/tcc-tableau-des-pensees): situation, emotion (0–100), automatic thought. Then see which traps you recognise.$md$, $md$Les pensées automatiques sont les mots ou images rapides qui traversent l'esprit dans une situation. Elles ressemblent à des faits, si bien qu'on les remet rarement en question.

**Comment les repérer :** quand votre humeur change, demandez-vous « Qu'est-ce qui vient de me traverser l'esprit ? ». Notez la pensée mot pour mot, et à quel point vous y croyez (0–100 %).

**Les pièges de la pensée.** Certains schémas reviennent sans cesse. Parmi les plus fréquents :
- la pensée tout ou rien (« si ce n'est pas parfait, c'est un échec »),
- le catastrophisme (« ça va être un désastre »),
- la lecture de pensée (« ils pensent que je suis nul »),
- la surgénéralisation (« ça m'arrive toujours »),
- les « je dois » (« je ne devrais jamais être fatigué »).

Le [guide des distorsions cognitives](/resources/tcc-distorsions-cognitives) en décrit douze, avec des exemples.

**Exercice.** Pendant trois jours, chaque fois que votre humeur baisse nettement, remplissez les trois premières colonnes du [tableau des pensées](/resources/tcc-tableau-des-pensees) : situation, émotion (0–100), pensée automatique. Puis repérez les pièges que vous reconnaissez.$md$
FROM public.courses c WHERE c.slug = 'tcc-les-fondamentaux'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 2);

UPDATE public.course_modules m SET title = 'Testing and rebalancing thoughts', title_fr = 'Tester et rééquilibrer ses pensées', title_ar = 'اختبار الأفكار وإعادة توازنها', duration_minutes = 15,
  content = $md$Once a thought is caught, the work is to **examine it**, not to replace it with a forced positive one. The goal is a thought that is more **balanced** and more **useful**.

Questions that help:
- What are the facts for and against this thought?
- Is there another way to see the situation?
- What would I say to a friend who had this thought?
- What is the worst, the best and the most likely outcome?
- What is the effect of believing this thought? And of seeing it differently?

The [Socratic questioning sheet](/resources/tcc-questionnement-socratique) lists more.

Then complete the last columns of the [thought record](/resources/tcc-tableau-des-pensees): evidence for, evidence against, balanced thought, and re-rate the emotion. A drop of 20 to 30 points is already a real change.

**When words are not enough**, test the thought in reality with a [behavioural experiment](/resources/tcc-experiences-comportementales): write your prediction, do the experiment, compare.

**Exercise.** Complete one full thought record this week, and design one small experiment to test a prediction.$md$,
  content_fr = $md$Une fois la pensée repérée, le travail consiste à **l'examiner**, pas à la remplacer par une pensée positive forcée. L'objectif est une pensée plus **équilibrée** et plus **utile**.

Des questions qui aident :
- Quels sont les faits pour et contre cette pensée ?
- Y a-t-il une autre façon de voir la situation ?
- Que dirais-je à un ami qui aurait cette pensée ?
- Quel est le pire, le meilleur et le plus probable ?
- Quel est l'effet de croire cette pensée ? Et de la voir autrement ?

La [fiche de questionnement socratique](/resources/tcc-questionnement-socratique) en propose d'autres.

Complétez ensuite les dernières colonnes du [tableau des pensées](/resources/tcc-tableau-des-pensees) : preuves pour, preuves contre, pensée équilibrée, et réévaluez l'émotion. Une baisse de 20 à 30 points est déjà un vrai changement.

**Quand les mots ne suffisent pas**, testez la pensée dans la réalité avec une [expérience comportementale](/resources/tcc-experiences-comportementales) : notez votre prédiction, faites l'expérience, comparez.

**Exercice.** Remplissez un tableau des pensées complet cette semaine, et concevez une petite expérience pour tester une prédiction.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'tcc-les-fondamentaux' AND m.order_index = 3;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 3, 'Testing and rebalancing thoughts', 'Tester et rééquilibrer ses pensées', 'اختبار الأفكار وإعادة توازنها', 15, $md$Once a thought is caught, the work is to **examine it**, not to replace it with a forced positive one. The goal is a thought that is more **balanced** and more **useful**.

Questions that help:
- What are the facts for and against this thought?
- Is there another way to see the situation?
- What would I say to a friend who had this thought?
- What is the worst, the best and the most likely outcome?
- What is the effect of believing this thought? And of seeing it differently?

The [Socratic questioning sheet](/resources/tcc-questionnement-socratique) lists more.

Then complete the last columns of the [thought record](/resources/tcc-tableau-des-pensees): evidence for, evidence against, balanced thought, and re-rate the emotion. A drop of 20 to 30 points is already a real change.

**When words are not enough**, test the thought in reality with a [behavioural experiment](/resources/tcc-experiences-comportementales): write your prediction, do the experiment, compare.

**Exercise.** Complete one full thought record this week, and design one small experiment to test a prediction.$md$, $md$Une fois la pensée repérée, le travail consiste à **l'examiner**, pas à la remplacer par une pensée positive forcée. L'objectif est une pensée plus **équilibrée** et plus **utile**.

Des questions qui aident :
- Quels sont les faits pour et contre cette pensée ?
- Y a-t-il une autre façon de voir la situation ?
- Que dirais-je à un ami qui aurait cette pensée ?
- Quel est le pire, le meilleur et le plus probable ?
- Quel est l'effet de croire cette pensée ? Et de la voir autrement ?

La [fiche de questionnement socratique](/resources/tcc-questionnement-socratique) en propose d'autres.

Complétez ensuite les dernières colonnes du [tableau des pensées](/resources/tcc-tableau-des-pensees) : preuves pour, preuves contre, pensée équilibrée, et réévaluez l'émotion. Une baisse de 20 à 30 points est déjà un vrai changement.

**Quand les mots ne suffisent pas**, testez la pensée dans la réalité avec une [expérience comportementale](/resources/tcc-experiences-comportementales) : notez votre prédiction, faites l'expérience, comparez.

**Exercice.** Remplissez un tableau des pensées complet cette semaine, et concevez une petite expérience pour tester une prédiction.$md$
FROM public.courses c WHERE c.slug = 'tcc-les-fondamentaux'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 3);

UPDATE public.course_modules m SET title = 'Acting differently: activation and exposure', title_fr = 'Agir autrement : activation et exposition', title_ar = 'التصرف بشكل مختلف: التنشيط والتعرّض', duration_minutes = 15,
  content = $md$The "B" in CBT matters as much as the "C". Changing what we **do** is often the fastest way to change how we feel.

**In low mood: behavioural activation.** Depression pushes us to withdraw and wait for motivation before acting. Activation reverses the order: act first, motivation follows.
1. Monitor activities and mood for a few days.
2. Spot activities that bring **pleasure** or a sense of **accomplishment**.
3. Schedule them, starting small, and follow the plan rather than the mood.

See the [behavioural activation worksheet](/resources/tcc-activation-comportementale).

**In anxiety: exposure.** Avoidance keeps fear alive. Approaching feared situations gradually, without safety behaviours, lets the brain learn they are bearable. Build your [exposure hierarchy](/resources/tcc-hierarchie-exposition).

In both cases: **small, planned, repeated steps**, recorded so you can see your progress.

**Exercise.** Depending on your difficulty, schedule three activities for the coming week, or do the first step of your exposure ladder three times.$md$,
  content_fr = $md$Le « C » de comportemental compte autant que le « C » de cognitif. Changer ce que l'on **fait** est souvent le moyen le plus rapide de changer ce que l'on ressent.

**Dans la baisse de moral : l'activation comportementale.** La dépression pousse à se retirer et à attendre la motivation pour agir. L'activation inverse l'ordre : agir d'abord, la motivation suit.
1. Observer ses activités et son humeur pendant quelques jours.
2. Repérer les activités qui apportent du **plaisir** ou un sentiment d'**accomplissement**.
3. Les planifier, en commençant petit, et suivre le plan plutôt que l'humeur.

Voir la [fiche d'activation comportementale](/resources/tcc-activation-comportementale).

**Dans l'anxiété : l'exposition.** L'évitement entretient la peur. S'approcher progressivement des situations redoutées, sans comportements de sécurité, permet au cerveau d'apprendre qu'elles sont supportables. Construisez votre [hiérarchie d'exposition](/resources/tcc-hierarchie-exposition).

Dans les deux cas : **de petites étapes planifiées et répétées**, notées pour voir les progrès.

**Exercice.** Selon votre difficulté, planifiez trois activités pour la semaine à venir, ou faites trois fois la première marche de votre échelle d'exposition.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'tcc-les-fondamentaux' AND m.order_index = 4;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 4, 'Acting differently: activation and exposure', 'Agir autrement : activation et exposition', 'التصرف بشكل مختلف: التنشيط والتعرّض', 15, $md$The "B" in CBT matters as much as the "C". Changing what we **do** is often the fastest way to change how we feel.

**In low mood: behavioural activation.** Depression pushes us to withdraw and wait for motivation before acting. Activation reverses the order: act first, motivation follows.
1. Monitor activities and mood for a few days.
2. Spot activities that bring **pleasure** or a sense of **accomplishment**.
3. Schedule them, starting small, and follow the plan rather than the mood.

See the [behavioural activation worksheet](/resources/tcc-activation-comportementale).

**In anxiety: exposure.** Avoidance keeps fear alive. Approaching feared situations gradually, without safety behaviours, lets the brain learn they are bearable. Build your [exposure hierarchy](/resources/tcc-hierarchie-exposition).

In both cases: **small, planned, repeated steps**, recorded so you can see your progress.

**Exercise.** Depending on your difficulty, schedule three activities for the coming week, or do the first step of your exposure ladder three times.$md$, $md$Le « C » de comportemental compte autant que le « C » de cognitif. Changer ce que l'on **fait** est souvent le moyen le plus rapide de changer ce que l'on ressent.

**Dans la baisse de moral : l'activation comportementale.** La dépression pousse à se retirer et à attendre la motivation pour agir. L'activation inverse l'ordre : agir d'abord, la motivation suit.
1. Observer ses activités et son humeur pendant quelques jours.
2. Repérer les activités qui apportent du **plaisir** ou un sentiment d'**accomplissement**.
3. Les planifier, en commençant petit, et suivre le plan plutôt que l'humeur.

Voir la [fiche d'activation comportementale](/resources/tcc-activation-comportementale).

**Dans l'anxiété : l'exposition.** L'évitement entretient la peur. S'approcher progressivement des situations redoutées, sans comportements de sécurité, permet au cerveau d'apprendre qu'elles sont supportables. Construisez votre [hiérarchie d'exposition](/resources/tcc-hierarchie-exposition).

Dans les deux cas : **de petites étapes planifiées et répétées**, notées pour voir les progrès.

**Exercice.** Selon votre difficulté, planifiez trois activités pour la semaine à venir, ou faites trois fois la première marche de votre échelle d'exposition.$md$
FROM public.courses c WHERE c.slug = 'tcc-les-fondamentaux'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 4);

UPDATE public.course_modules m SET title = 'Core beliefs and relapse prevention', title_fr = 'Croyances profondes et prévention de la rechute', title_ar = 'المعتقدات الجوهرية والوقاية من الانتكاس', duration_minutes = 10,
  content = $md$Beneath automatic thoughts lie **rules** ("if I'm not perfect, I'll be rejected") and **core beliefs** about oneself, others and the world ("I'm not good enough"). They formed through experience and act as filters. CBT works on them once the person is comfortable with thought records, often with a therapist. When they are deep-rooted and long-standing, **schema therapy** extends this work: see the Academy course on schema therapy.

**Preventing relapse.** Setbacks are normal; what matters is spotting them early. Write your personal plan:
1. **What helped me most** in this course (tools, habits).
2. **My early warning signs** (sleep, withdrawal, certain thoughts).
3. **High-risk situations** to anticipate.
4. **What I'll do** if signs come back, and **who I'll contact**.

Keep it somewhere you can find it, and reread it each month.

CBT works best with guidance. If you are struggling, [a psychologist trained in CBT](/psychologists) can personalise this work.

**Further reading:** Beck, J. S. (2021). *Cognitive Behavior Therapy: Basics and Beyond* (3rd ed.). Guilford Press. Greenberger, D., & Padesky, C. A. (2015). *Mind Over Mood* (2nd ed.). Guilford Press.$md$,
  content_fr = $md$Sous les pensées automatiques se trouvent des **règles** (« si je ne suis pas parfait, on me rejettera ») et des **croyances profondes** sur soi, les autres et le monde (« je ne suis pas à la hauteur »). Elles se sont formées au fil de l'expérience et agissent comme des filtres. La TCC les travaille une fois que la personne est à l'aise avec le tableau des pensées, souvent avec un thérapeute. Quand elles sont anciennes et très ancrées, la **thérapie des schémas** prolonge ce travail : voir le cours de l'Académie sur la thérapie des schémas.

**Prévenir la rechute.** Les rechutes sont normales ; l'important est de les repérer tôt. Rédigez votre plan personnel :
1. **Ce qui m'a le plus aidé** dans ce cours (outils, habitudes).
2. **Mes signaux d'alerte** (sommeil, retrait, certaines pensées).
3. **Les situations à risque** à anticiper.
4. **Ce que je ferai** si les signes reviennent, et **qui je contacterai**.

Gardez-le à portée de main et relisez-le chaque mois.

La TCC fonctionne mieux accompagnée. Si vous avez du mal, [un psychologue formé à la TCC](/psychologists) peut personnaliser ce travail.

**Pour aller plus loin :** Beck, J. S. (2021). *Cognitive Behavior Therapy: Basics and Beyond* (3rd ed.). Guilford Press. Greenberger, D., & Padesky, C. A. (2015). *Mind Over Mood* (2nd ed.). Guilford Press.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'tcc-les-fondamentaux' AND m.order_index = 5;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 5, 'Core beliefs and relapse prevention', 'Croyances profondes et prévention de la rechute', 'المعتقدات الجوهرية والوقاية من الانتكاس', 10, $md$Beneath automatic thoughts lie **rules** ("if I'm not perfect, I'll be rejected") and **core beliefs** about oneself, others and the world ("I'm not good enough"). They formed through experience and act as filters. CBT works on them once the person is comfortable with thought records, often with a therapist. When they are deep-rooted and long-standing, **schema therapy** extends this work: see the Academy course on schema therapy.

**Preventing relapse.** Setbacks are normal; what matters is spotting them early. Write your personal plan:
1. **What helped me most** in this course (tools, habits).
2. **My early warning signs** (sleep, withdrawal, certain thoughts).
3. **High-risk situations** to anticipate.
4. **What I'll do** if signs come back, and **who I'll contact**.

Keep it somewhere you can find it, and reread it each month.

CBT works best with guidance. If you are struggling, [a psychologist trained in CBT](/psychologists) can personalise this work.

**Further reading:** Beck, J. S. (2021). *Cognitive Behavior Therapy: Basics and Beyond* (3rd ed.). Guilford Press. Greenberger, D., & Padesky, C. A. (2015). *Mind Over Mood* (2nd ed.). Guilford Press.$md$, $md$Sous les pensées automatiques se trouvent des **règles** (« si je ne suis pas parfait, on me rejettera ») et des **croyances profondes** sur soi, les autres et le monde (« je ne suis pas à la hauteur »). Elles se sont formées au fil de l'expérience et agissent comme des filtres. La TCC les travaille une fois que la personne est à l'aise avec le tableau des pensées, souvent avec un thérapeute. Quand elles sont anciennes et très ancrées, la **thérapie des schémas** prolonge ce travail : voir le cours de l'Académie sur la thérapie des schémas.

**Prévenir la rechute.** Les rechutes sont normales ; l'important est de les repérer tôt. Rédigez votre plan personnel :
1. **Ce qui m'a le plus aidé** dans ce cours (outils, habitudes).
2. **Mes signaux d'alerte** (sommeil, retrait, certaines pensées).
3. **Les situations à risque** à anticiper.
4. **Ce que je ferai** si les signes reviennent, et **qui je contacterai**.

Gardez-le à portée de main et relisez-le chaque mois.

La TCC fonctionne mieux accompagnée. Si vous avez du mal, [un psychologue formé à la TCC](/psychologists) peut personnaliser ce travail.

**Pour aller plus loin :** Beck, J. S. (2021). *Cognitive Behavior Therapy: Basics and Beyond* (3rd ed.). Guilford Press. Greenberger, D., & Padesky, C. A. (2015). *Mind Over Mood* (2nd ed.). Guilford Press.$md$
FROM public.courses c WHERE c.slug = 'tcc-les-fondamentaux'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 5);

INSERT INTO public.courses (slug, title, title_fr, title_ar, description, description_fr, description_ar, category, difficulty_level, duration_hours, learning_path, is_published, is_paid, price_mad)
SELECT 'therapie-des-schemas-introduction', 'Introduction to Schema Therapy', 'Introduction à la thérapie des schémas', 'مدخل إلى العلاج بالمخططات', 'Understand the patterns that repeat in your life: core needs, the 18 schemas, coping styles, modes and the healthy adult.', 'Comprendre les scénarios qui se répètent dans sa vie : besoins fondamentaux, 18 schémas, styles d''adaptation, modes et adulte sain.', 'فهم الأنماط التي تتكرر في حياتك: الحاجات الأساسية، المخططات الثمانية عشر، أساليب التعامل، الأنماط، والراشد السليم.', 'clinical', 'intermediate', 1.1, 'mental-health', true, false, 0
WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE slug = 'therapie-des-schemas-introduction');

UPDATE public.course_modules m SET title = 'Core needs and the origin of schemas', title_fr = 'Les besoins fondamentaux et l''origine des schémas', title_ar = 'الحاجات الأساسية وأصل المخططات', duration_minutes = 12,
  content = $md$Schema therapy was developed by Jeffrey Young for long-standing difficulties that do not shift with standard CBT: repeating relationship patterns, chronic self-criticism, a fragile sense of self. It combines CBT, attachment theory and emotion-focused techniques.

Its starting point: every child has **five core emotional needs**:
1. secure attachment (safety, stability, affection),
2. autonomy, competence and identity,
3. freedom to express needs and emotions,
4. spontaneity and play,
5. realistic limits and self-control.

When a need is repeatedly unmet (or, conversely, indulged without limits), the child develops an **early maladaptive schema**: a lasting theme, made of memories, emotions and beliefs, which then replays in adult life.

A schema was often an intelligent adaptation to a difficult environment. It becomes a problem when it keeps operating where it no longer helps.

Read [Core needs and the 18 schemas](/resources/schemas-besoins-et-18-schemas).

**Exercise.** For each of the five needs, note how well it was met in your childhood (0–10). No need to go into detail: just notice where the gaps were.$md$,
  content_fr = $md$La thérapie des schémas a été développée par Jeffrey Young pour les difficultés anciennes qui résistent à une TCC classique : scénarios relationnels répétitifs, autocritique chronique, identité fragile. Elle associe TCC, théorie de l'attachement et techniques émotionnelles.

Point de départ : tout enfant a **cinq besoins affectifs fondamentaux** :
1. un attachement sûr (sécurité, stabilité, affection),
2. autonomie, compétence et identité,
3. la liberté d'exprimer ses besoins et ses émotions,
4. la spontanéité et le jeu,
5. des limites réalistes et la maîtrise de soi.

Quand un besoin est régulièrement insatisfait (ou, à l'inverse, comblé sans limites), l'enfant développe un **schéma précoce inadapté** : un thème durable, fait de souvenirs, d'émotions et de croyances, qui se rejoue ensuite à l'âge adulte.

Un schéma était souvent une adaptation intelligente à un environnement difficile. Il devient un problème quand il continue de fonctionner là où il n'est plus utile.

Lisez [Les besoins fondamentaux et les 18 schémas](/resources/schemas-besoins-et-18-schemas).

**Exercice.** Pour chacun des cinq besoins, notez à quel point il a été satisfait dans votre enfance (0–10). Inutile d'entrer dans les détails : repérez seulement où étaient les manques.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'therapie-des-schemas-introduction' AND m.order_index = 1;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 1, 'Core needs and the origin of schemas', 'Les besoins fondamentaux et l''origine des schémas', 'الحاجات الأساسية وأصل المخططات', 12, $md$Schema therapy was developed by Jeffrey Young for long-standing difficulties that do not shift with standard CBT: repeating relationship patterns, chronic self-criticism, a fragile sense of self. It combines CBT, attachment theory and emotion-focused techniques.

Its starting point: every child has **five core emotional needs**:
1. secure attachment (safety, stability, affection),
2. autonomy, competence and identity,
3. freedom to express needs and emotions,
4. spontaneity and play,
5. realistic limits and self-control.

When a need is repeatedly unmet (or, conversely, indulged without limits), the child develops an **early maladaptive schema**: a lasting theme, made of memories, emotions and beliefs, which then replays in adult life.

A schema was often an intelligent adaptation to a difficult environment. It becomes a problem when it keeps operating where it no longer helps.

Read [Core needs and the 18 schemas](/resources/schemas-besoins-et-18-schemas).

**Exercise.** For each of the five needs, note how well it was met in your childhood (0–10). No need to go into detail: just notice where the gaps were.$md$, $md$La thérapie des schémas a été développée par Jeffrey Young pour les difficultés anciennes qui résistent à une TCC classique : scénarios relationnels répétitifs, autocritique chronique, identité fragile. Elle associe TCC, théorie de l'attachement et techniques émotionnelles.

Point de départ : tout enfant a **cinq besoins affectifs fondamentaux** :
1. un attachement sûr (sécurité, stabilité, affection),
2. autonomie, compétence et identité,
3. la liberté d'exprimer ses besoins et ses émotions,
4. la spontanéité et le jeu,
5. des limites réalistes et la maîtrise de soi.

Quand un besoin est régulièrement insatisfait (ou, à l'inverse, comblé sans limites), l'enfant développe un **schéma précoce inadapté** : un thème durable, fait de souvenirs, d'émotions et de croyances, qui se rejoue ensuite à l'âge adulte.

Un schéma était souvent une adaptation intelligente à un environnement difficile. Il devient un problème quand il continue de fonctionner là où il n'est plus utile.

Lisez [Les besoins fondamentaux et les 18 schémas](/resources/schemas-besoins-et-18-schemas).

**Exercice.** Pour chacun des cinq besoins, notez à quel point il a été satisfait dans votre enfance (0–10). Inutile d'entrer dans les détails : repérez seulement où étaient les manques.$md$
FROM public.courses c WHERE c.slug = 'therapie-des-schemas-introduction'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 1);

UPDATE public.course_modules m SET title = 'The 18 schemas in five domains', title_fr = 'Les 18 schémas en cinq domaines', title_ar = 'المخططات الثمانية عشر في خمسة مجالات', duration_minutes = 15,
  content = $md$Young described 18 schemas grouped in five domains, each linked to a core need:

- **Disconnection and rejection**: abandonment, mistrust/abuse, emotional deprivation, defectiveness/shame, social isolation.
- **Impaired autonomy and performance**: dependence, vulnerability to harm, enmeshment, failure.
- **Impaired limits**: entitlement, insufficient self-control.
- **Other-directedness**: subjugation, self-sacrifice, approval-seeking.
- **Overvigilance and inhibition**: negativity, emotional inhibition, unrelenting standards, punitiveness.

**How to recognise an active schema:** an emotional reaction out of proportion with the present situation, as if an old wound were being touched; the same scenarios returning in different relationships or jobs.

This list is for understanding, not self-diagnosis. A clinician assesses schemas using validated questionnaires and your life history.

**Exercise.** Read the descriptions in the [guide](/resources/schemas-besoins-et-18-schemas). Pick the two or three that resonate most, and for each one note a recent situation where you might have felt it.$md$,
  content_fr = $md$Young a décrit 18 schémas regroupés en cinq domaines, chacun lié à un besoin fondamental :

- **Séparation et rejet** : abandon, méfiance/abus, carence affective, imperfection/honte, isolement social.
- **Manque d'autonomie et de performance** : dépendance, vulnérabilité, fusion, échec.
- **Manque de limites** : droits personnels exagérés, contrôle de soi insuffisant.
- **Orientation vers les autres** : assujettissement, abnégation, recherche d'approbation.
- **Survigilance et inhibition** : négativité, inhibition émotionnelle, exigences élevées, punition.

**Comment reconnaître un schéma actif :** une réaction émotionnelle disproportionnée par rapport à la situation présente, comme si l'on touchait une vieille blessure ; les mêmes scénarios qui reviennent dans des relations ou des emplois différents.

Cette liste sert à comprendre, pas à s'autodiagnostiquer. Un clinicien évalue les schémas à l'aide de questionnaires validés et de votre histoire de vie.

**Exercice.** Lisez les descriptions dans le [guide](/resources/schemas-besoins-et-18-schemas). Choisissez les deux ou trois qui vous parlent le plus et, pour chacun, notez une situation récente où vous avez pu le ressentir.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'therapie-des-schemas-introduction' AND m.order_index = 2;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 2, 'The 18 schemas in five domains', 'Les 18 schémas en cinq domaines', 'المخططات الثمانية عشر في خمسة مجالات', 15, $md$Young described 18 schemas grouped in five domains, each linked to a core need:

- **Disconnection and rejection**: abandonment, mistrust/abuse, emotional deprivation, defectiveness/shame, social isolation.
- **Impaired autonomy and performance**: dependence, vulnerability to harm, enmeshment, failure.
- **Impaired limits**: entitlement, insufficient self-control.
- **Other-directedness**: subjugation, self-sacrifice, approval-seeking.
- **Overvigilance and inhibition**: negativity, emotional inhibition, unrelenting standards, punitiveness.

**How to recognise an active schema:** an emotional reaction out of proportion with the present situation, as if an old wound were being touched; the same scenarios returning in different relationships or jobs.

This list is for understanding, not self-diagnosis. A clinician assesses schemas using validated questionnaires and your life history.

**Exercise.** Read the descriptions in the [guide](/resources/schemas-besoins-et-18-schemas). Pick the two or three that resonate most, and for each one note a recent situation where you might have felt it.$md$, $md$Young a décrit 18 schémas regroupés en cinq domaines, chacun lié à un besoin fondamental :

- **Séparation et rejet** : abandon, méfiance/abus, carence affective, imperfection/honte, isolement social.
- **Manque d'autonomie et de performance** : dépendance, vulnérabilité, fusion, échec.
- **Manque de limites** : droits personnels exagérés, contrôle de soi insuffisant.
- **Orientation vers les autres** : assujettissement, abnégation, recherche d'approbation.
- **Survigilance et inhibition** : négativité, inhibition émotionnelle, exigences élevées, punition.

**Comment reconnaître un schéma actif :** une réaction émotionnelle disproportionnée par rapport à la situation présente, comme si l'on touchait une vieille blessure ; les mêmes scénarios qui reviennent dans des relations ou des emplois différents.

Cette liste sert à comprendre, pas à s'autodiagnostiquer. Un clinicien évalue les schémas à l'aide de questionnaires validés et de votre histoire de vie.

**Exercice.** Lisez les descriptions dans le [guide](/resources/schemas-besoins-et-18-schemas). Choisissez les deux ou trois qui vous parlent le plus et, pour chacun, notez une situation récente où vous avez pu le ressentir.$md$
FROM public.courses c WHERE c.slug = 'therapie-des-schemas-introduction'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 2);

UPDATE public.course_modules m SET title = 'How we cope: surrender, avoidance, overcompensation', title_fr = 'Nos façons de faire face : capitulation, évitement, surcompensation', title_ar = 'كيف نتعامل: الاستسلام، التجنب، التعويض المفرط', duration_minutes = 12,
  content = $md$A schema hurts. To avoid feeling that pain, we use three **coping styles**:
- **Surrender**: accepting the schema as true and living accordingly (with a defectiveness schema, choosing a critical partner).
- **Avoidance**: arranging life so the schema is never triggered (avoiding closeness, staying busy, numbing).
- **Overcompensation**: doing the opposite, to excess (criticising others, chasing perfection, dominating).

All three bring relief in the moment, and all three **keep the schema alive**, because they prevent experiences that would contradict it. The same person often uses all three, depending on the context.

Read [Surrender, avoidance, overcompensation](/resources/schemas-styles-adaptation).

**Exercise.** Fill in the guide's table for one of the schemas you identified: the situation, what you did, which style it was, and what it cost you in the long term.$md$,
  content_fr = $md$Un schéma fait mal. Pour ne pas ressentir cette douleur, on utilise trois **styles d'adaptation** :
- **La capitulation** : accepter le schéma comme vrai et vivre en conséquence (avec un schéma d'imperfection, choisir un partenaire critique).
- **L'évitement** : organiser sa vie pour que le schéma ne s'active jamais (éviter l'intimité, rester occupé, s'anesthésier).
- **La surcompensation** : faire l'inverse, de façon excessive (critiquer les autres, viser la perfection, dominer).

Les trois soulagent sur le moment, et les trois **entretiennent le schéma**, car ils empêchent de vivre des expériences qui le contrediraient. La même personne utilise souvent les trois, selon le contexte.

Lisez [Capitulation, évitement, surcompensation](/resources/schemas-styles-adaptation).

**Exercice.** Remplissez le tableau du guide pour l'un des schémas repérés : la situation, ce que vous avez fait, le style utilisé, et ce que cela vous a coûté à long terme.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'therapie-des-schemas-introduction' AND m.order_index = 3;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 3, 'How we cope: surrender, avoidance, overcompensation', 'Nos façons de faire face : capitulation, évitement, surcompensation', 'كيف نتعامل: الاستسلام، التجنب، التعويض المفرط', 12, $md$A schema hurts. To avoid feeling that pain, we use three **coping styles**:
- **Surrender**: accepting the schema as true and living accordingly (with a defectiveness schema, choosing a critical partner).
- **Avoidance**: arranging life so the schema is never triggered (avoiding closeness, staying busy, numbing).
- **Overcompensation**: doing the opposite, to excess (criticising others, chasing perfection, dominating).

All three bring relief in the moment, and all three **keep the schema alive**, because they prevent experiences that would contradict it. The same person often uses all three, depending on the context.

Read [Surrender, avoidance, overcompensation](/resources/schemas-styles-adaptation).

**Exercise.** Fill in the guide's table for one of the schemas you identified: the situation, what you did, which style it was, and what it cost you in the long term.$md$, $md$Un schéma fait mal. Pour ne pas ressentir cette douleur, on utilise trois **styles d'adaptation** :
- **La capitulation** : accepter le schéma comme vrai et vivre en conséquence (avec un schéma d'imperfection, choisir un partenaire critique).
- **L'évitement** : organiser sa vie pour que le schéma ne s'active jamais (éviter l'intimité, rester occupé, s'anesthésier).
- **La surcompensation** : faire l'inverse, de façon excessive (critiquer les autres, viser la perfection, dominer).

Les trois soulagent sur le moment, et les trois **entretiennent le schéma**, car ils empêchent de vivre des expériences qui le contrediraient. La même personne utilise souvent les trois, selon le contexte.

Lisez [Capitulation, évitement, surcompensation](/resources/schemas-styles-adaptation).

**Exercice.** Remplissez le tableau du guide pour l'un des schémas repérés : la situation, ce que vous avez fait, le style utilisé, et ce que cela vous a coûté à long terme.$md$
FROM public.courses c WHERE c.slug = 'therapie-des-schemas-introduction'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 3);

UPDATE public.course_modules m SET title = 'Modes and the healthy adult', title_fr = 'Les modes et l''adulte sain', title_ar = 'الأنماط والراشد السليم', duration_minutes = 15,
  content = $md$**Modes** are the emotional states that take over at a given moment when a schema is triggered. The mode model, developed by Young and later Arntz, groups them into four families:
- **Child modes**: vulnerable child, angry child, impulsive child, happy child.
- **Maladaptive coping modes**: compliant surrenderer, detached protector, self-soother, overcompensator.
- **Internalised parent modes**: punitive and demanding.
- **The healthy adult**, who looks after the vulnerable child, sets limits and stands up to the inner critic.

Thinking in modes creates distance: "part of me feels abandoned, another wants to cut everyone off" rather than "this is just who I am."

Read [Modes](/resources/schemas-les-modes) and start the [mode diary](/resources/schemas-journal-des-modes).

**Exercise.** For one week, log each strong emotional moment: the situation, the modes you noticed, the need at stake, and what your healthy adult could have said or done.$md$,
  content_fr = $md$Les **modes** sont les états émotionnels qui prennent le relais à un moment donné quand un schéma s'active. Le modèle des modes, développé par Young puis Arntz, les regroupe en quatre familles :
- **Les modes enfant** : enfant vulnérable, enfant en colère, enfant impulsif, enfant heureux.
- **Les modes d'adaptation dysfonctionnels** : soumis obéissant, protecteur détaché, auto-apaisement, surcompensateur.
- **Les modes parent intériorisés** : punitif et exigeant.
- **L'adulte sain**, qui prend soin de l'enfant vulnérable, pose des limites et tient tête au critique intérieur.

Penser en modes aide à prendre du recul : « une partie de moi se sent abandonnée, une autre veut tout couper » plutôt que « je suis comme ça ».

Lisez [Les modes](/resources/schemas-les-modes) et commencez le [journal des modes](/resources/schemas-journal-des-modes).

**Exercice.** Pendant une semaine, notez chaque moment émotionnel fort : la situation, les modes repérés, le besoin en jeu, et ce que votre adulte sain aurait pu dire ou faire.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'therapie-des-schemas-introduction' AND m.order_index = 4;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 4, 'Modes and the healthy adult', 'Les modes et l''adulte sain', 'الأنماط والراشد السليم', 15, $md$**Modes** are the emotional states that take over at a given moment when a schema is triggered. The mode model, developed by Young and later Arntz, groups them into four families:
- **Child modes**: vulnerable child, angry child, impulsive child, happy child.
- **Maladaptive coping modes**: compliant surrenderer, detached protector, self-soother, overcompensator.
- **Internalised parent modes**: punitive and demanding.
- **The healthy adult**, who looks after the vulnerable child, sets limits and stands up to the inner critic.

Thinking in modes creates distance: "part of me feels abandoned, another wants to cut everyone off" rather than "this is just who I am."

Read [Modes](/resources/schemas-les-modes) and start the [mode diary](/resources/schemas-journal-des-modes).

**Exercise.** For one week, log each strong emotional moment: the situation, the modes you noticed, the need at stake, and what your healthy adult could have said or done.$md$, $md$Les **modes** sont les états émotionnels qui prennent le relais à un moment donné quand un schéma s'active. Le modèle des modes, développé par Young puis Arntz, les regroupe en quatre familles :
- **Les modes enfant** : enfant vulnérable, enfant en colère, enfant impulsif, enfant heureux.
- **Les modes d'adaptation dysfonctionnels** : soumis obéissant, protecteur détaché, auto-apaisement, surcompensateur.
- **Les modes parent intériorisés** : punitif et exigeant.
- **L'adulte sain**, qui prend soin de l'enfant vulnérable, pose des limites et tient tête au critique intérieur.

Penser en modes aide à prendre du recul : « une partie de moi se sent abandonnée, une autre veut tout couper » plutôt que « je suis comme ça ».

Lisez [Les modes](/resources/schemas-les-modes) et commencez le [journal des modes](/resources/schemas-journal-des-modes).

**Exercice.** Pendant une semaine, notez chaque moment émotionnel fort : la situation, les modes repérés, le besoin en jeu, et ce que votre adulte sain aurait pu dire ou faire.$md$
FROM public.courses c WHERE c.slug = 'therapie-des-schemas-introduction'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 4);

UPDATE public.course_modules m SET title = 'Change: flashcards, experiential work and therapy', title_fr = 'Le changement : cartes-mémoire, travail expérientiel et thérapie', title_ar = 'التغيير: البطاقات، العمل التجريبي، والعلاج', duration_minutes = 12,
  content = $md$Schema therapy works on three levels:
- **Cognitive**: recognising the schema and testing it against the evidence of your life.
- **Behavioural**: gradually replacing coping styles with healthier choices ("pattern breaking").
- **Experiential**: changing the emotional meaning of old experiences, through imagery rescripting and chair work.

**What you can do on your own:** write a [schema flashcard](/resources/schemas-carte-memoire) to read when the schema fires: name the feeling, the schema and its origin, check the facts, and choose a healthy action.

**What belongs in therapy:** [experiential techniques](/resources/schemas-techniques-experientielles) reactivate intense memories and emotions. They need a trained therapist and a safe frame, especially with trauma, dissociation or suicidal thoughts.

Schema therapy is supported by randomised trials, notably for borderline and other personality disorders, and is increasingly used for chronic depression and anxiety. It is usually longer than standard CBT.

If these patterns resonate strongly, talk to [a psychologist trained in schema therapy](/psychologists).

**Further reading:** Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). *Schema Therapy: A Practitioner's Guide*. Guilford Press. Young, J. E., & Klosko, J. S. (1995). *Je réinvente ma vie*. Éditions de l'Homme. Arntz, A., & Jacob, G. (2013). *Schema Therapy in Practice*. Wiley-Blackwell.$md$,
  content_fr = $md$La thérapie des schémas agit sur trois plans :
- **Cognitif** : reconnaître le schéma et le confronter aux faits de sa vie.
- **Comportemental** : remplacer progressivement les styles d'adaptation par des choix plus sains (« briser les scénarios »).
- **Expérientiel** : changer la signification émotionnelle d'expériences anciennes, par la réécriture en imagerie et le travail sur chaises.

**Ce que vous pouvez faire seul :** rédiger une [carte-mémoire de schéma](/resources/schemas-carte-memoire) à relire quand le schéma s'active : nommer l'émotion, le schéma et son origine, vérifier les faits, et choisir une action saine.

**Ce qui relève de la thérapie :** les [techniques expérientielles](/resources/schemas-techniques-experientielles) réactivent des souvenirs et des émotions intenses. Elles demandent un thérapeute formé et un cadre sécurisant, en particulier en cas de traumatisme, de dissociation ou d'idées suicidaires.

La thérapie des schémas s'appuie sur des essais randomisés, notamment dans le trouble de la personnalité borderline et d'autres troubles de la personnalité, et s'utilise de plus en plus dans la dépression et l'anxiété chroniques. Elle est en général plus longue qu'une TCC classique.

Si ces scénarios vous parlent fortement, parlez-en à [un psychologue formé à la thérapie des schémas](/psychologists).

**Pour aller plus loin :** Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). *Schema Therapy: A Practitioner's Guide*. Guilford Press. Young, J. E., & Klosko, J. S. (1995). *Je réinvente ma vie*. Éditions de l'Homme. Arntz, A., & Jacob, G. (2013). *Schema Therapy in Practice*. Wiley-Blackwell.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'therapie-des-schemas-introduction' AND m.order_index = 5;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 5, 'Change: flashcards, experiential work and therapy', 'Le changement : cartes-mémoire, travail expérientiel et thérapie', 'التغيير: البطاقات، العمل التجريبي، والعلاج', 12, $md$Schema therapy works on three levels:
- **Cognitive**: recognising the schema and testing it against the evidence of your life.
- **Behavioural**: gradually replacing coping styles with healthier choices ("pattern breaking").
- **Experiential**: changing the emotional meaning of old experiences, through imagery rescripting and chair work.

**What you can do on your own:** write a [schema flashcard](/resources/schemas-carte-memoire) to read when the schema fires: name the feeling, the schema and its origin, check the facts, and choose a healthy action.

**What belongs in therapy:** [experiential techniques](/resources/schemas-techniques-experientielles) reactivate intense memories and emotions. They need a trained therapist and a safe frame, especially with trauma, dissociation or suicidal thoughts.

Schema therapy is supported by randomised trials, notably for borderline and other personality disorders, and is increasingly used for chronic depression and anxiety. It is usually longer than standard CBT.

If these patterns resonate strongly, talk to [a psychologist trained in schema therapy](/psychologists).

**Further reading:** Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). *Schema Therapy: A Practitioner's Guide*. Guilford Press. Young, J. E., & Klosko, J. S. (1995). *Je réinvente ma vie*. Éditions de l'Homme. Arntz, A., & Jacob, G. (2013). *Schema Therapy in Practice*. Wiley-Blackwell.$md$, $md$La thérapie des schémas agit sur trois plans :
- **Cognitif** : reconnaître le schéma et le confronter aux faits de sa vie.
- **Comportemental** : remplacer progressivement les styles d'adaptation par des choix plus sains (« briser les scénarios »).
- **Expérientiel** : changer la signification émotionnelle d'expériences anciennes, par la réécriture en imagerie et le travail sur chaises.

**Ce que vous pouvez faire seul :** rédiger une [carte-mémoire de schéma](/resources/schemas-carte-memoire) à relire quand le schéma s'active : nommer l'émotion, le schéma et son origine, vérifier les faits, et choisir une action saine.

**Ce qui relève de la thérapie :** les [techniques expérientielles](/resources/schemas-techniques-experientielles) réactivent des souvenirs et des émotions intenses. Elles demandent un thérapeute formé et un cadre sécurisant, en particulier en cas de traumatisme, de dissociation ou d'idées suicidaires.

La thérapie des schémas s'appuie sur des essais randomisés, notamment dans le trouble de la personnalité borderline et d'autres troubles de la personnalité, et s'utilise de plus en plus dans la dépression et l'anxiété chroniques. Elle est en général plus longue qu'une TCC classique.

Si ces scénarios vous parlent fortement, parlez-en à [un psychologue formé à la thérapie des schémas](/psychologists).

**Pour aller plus loin :** Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003). *Schema Therapy: A Practitioner's Guide*. Guilford Press. Young, J. E., & Klosko, J. S. (1995). *Je réinvente ma vie*. Éditions de l'Homme. Arntz, A., & Jacob, G. (2013). *Schema Therapy in Practice*. Wiley-Blackwell.$md$
FROM public.courses c WHERE c.slug = 'therapie-des-schemas-introduction'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 5);

UPDATE public.courses SET title = 'Sport Psychology Fundamentals', title_fr = 'Fondamentaux de la psychologie du sport', title_ar = 'أساسيات علم النفس الرياضي',
  description = 'The mental skills behind performance: goals, arousal control, self-talk and routines, with exercises to use in training.', description_fr = 'Les habiletés mentales de la performance : objectifs, gestion de l''activation, discours interne et routines, avec des exercices à faire à l''entraînement.', description_ar = 'المهارات الذهنية وراء الأداء: الأهداف، التحكم في التنشيط، الحوار الذاتي والروتين، مع تمارين للتدريب.',
  difficulty_level = 'beginner', duration_hours = 0.7
WHERE slug = 'sport-psychology-fundamentals-756683';

UPDATE public.course_modules m SET title = 'Mental skills are trained', title_fr = 'Les habiletés mentales s''entraînent', title_ar = 'المهارات الذهنية تُدرَّب', duration_minutes = 12,
  content = $md$Confidence, concentration, motivation and emotional control are not fixed traits: they are **skills** that improve with deliberate practice, like technique or fitness. Elite athletes train them in every session, not only before big competitions.

The foundation is **goal setting**. Three types work together:
- **Outcome goals** (win, qualify): motivating, but partly outside your control.
- **Performance goals** (beat your own time, 80% first serves): compared with yourself.
- **Process goals** ("high elbow", "eyes on the ball"): fully controllable, they direct attention during competition.

Goals that are specific and challenging but achievable improve performance more than "do your best" (Locke & Latham).

Read [Mental preparation for athletes: the basics](/resources/sport-mental-prep).

**Exercise.** Write one outcome goal for the season, two performance goals for the month, and three process goals for your next session. Fill in the 4-week plan at the end of the guide.$md$,
  content_fr = $md$La confiance, la concentration, la motivation et le contrôle émotionnel ne sont pas des traits figés : ce sont des **habiletés** qui progressent avec un entraînement délibéré, comme la technique ou la condition physique. Les athlètes de haut niveau les travaillent à chaque séance, pas seulement avant les grandes compétitions.

La base est la **fixation d'objectifs**. Trois types fonctionnent ensemble :
- **Objectifs de résultat** (gagner, se qualifier) : motivants, mais en partie hors de votre contrôle.
- **Objectifs de performance** (battre son temps, 80 % de premières balles) : comparés à soi-même.
- **Objectifs de processus** (« coude haut », « les yeux sur le ballon ») : entièrement contrôlables, ils orientent l'attention en compétition.

Des objectifs précis, difficiles mais atteignables améliorent davantage la performance que « fais de ton mieux » (Locke et Latham).

Lisez [La préparation mentale du sportif : les bases](/resources/sport-mental-prep).

**Exercice.** Écrivez un objectif de résultat pour la saison, deux objectifs de performance pour le mois, et trois objectifs de processus pour votre prochaine séance. Remplissez le plan sur 4 semaines à la fin du guide.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'sport-psychology-fundamentals-756683' AND m.order_index = 1;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 1, 'Mental skills are trained', 'Les habiletés mentales s''entraînent', 'المهارات الذهنية تُدرَّب', 12, $md$Confidence, concentration, motivation and emotional control are not fixed traits: they are **skills** that improve with deliberate practice, like technique or fitness. Elite athletes train them in every session, not only before big competitions.

The foundation is **goal setting**. Three types work together:
- **Outcome goals** (win, qualify): motivating, but partly outside your control.
- **Performance goals** (beat your own time, 80% first serves): compared with yourself.
- **Process goals** ("high elbow", "eyes on the ball"): fully controllable, they direct attention during competition.

Goals that are specific and challenging but achievable improve performance more than "do your best" (Locke & Latham).

Read [Mental preparation for athletes: the basics](/resources/sport-mental-prep).

**Exercise.** Write one outcome goal for the season, two performance goals for the month, and three process goals for your next session. Fill in the 4-week plan at the end of the guide.$md$, $md$La confiance, la concentration, la motivation et le contrôle émotionnel ne sont pas des traits figés : ce sont des **habiletés** qui progressent avec un entraînement délibéré, comme la technique ou la condition physique. Les athlètes de haut niveau les travaillent à chaque séance, pas seulement avant les grandes compétitions.

La base est la **fixation d'objectifs**. Trois types fonctionnent ensemble :
- **Objectifs de résultat** (gagner, se qualifier) : motivants, mais en partie hors de votre contrôle.
- **Objectifs de performance** (battre son temps, 80 % de premières balles) : comparés à soi-même.
- **Objectifs de processus** (« coude haut », « les yeux sur le ballon ») : entièrement contrôlables, ils orientent l'attention en compétition.

Des objectifs précis, difficiles mais atteignables améliorent davantage la performance que « fais de ton mieux » (Locke et Latham).

Lisez [La préparation mentale du sportif : les bases](/resources/sport-mental-prep).

**Exercice.** Écrivez un objectif de résultat pour la saison, deux objectifs de performance pour le mois, et trois objectifs de processus pour votre prochaine séance. Remplissez le plan sur 4 semaines à la fin du guide.$md$
FROM public.courses c WHERE c.slug = 'sport-psychology-fundamentals-756683'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 1);

UPDATE public.course_modules m SET title = 'Arousal and your optimal zone', title_fr = 'L''activation et votre zone optimale', title_ar = 'التنشيط ومنطقتك المثلى', duration_minutes = 12,
  content = $md$Performance depends on arousal, the body's level of activation. The classic **inverted-U** describes a curve: too little arousal and you are flat, too much and you get tight, with the best performance somewhere in between.

Hanin's **IZOF** model (individual zones of optimal functioning) adds that this zone is **personal**: some athletes perform best very calm, others highly charged. It also varies with the task: a golf putt needs less arousal than a weightlifting attempt.

**Find your zone.** Recall your three best and three worst performances. Rate how activated you felt before each (0–10). Your best zone usually appears.

**To come down:** slow breathing with a long out-breath ([box breathing](/resources/box-breathing)), progressive muscle relaxation, a calm cue word.

**To come up:** energising music, dynamic warm-up, a motivational cue word, a short visualisation of an explosive start.

**Exercise.** Before your next three sessions, rate your arousal, use one technique to move towards your zone, and rate it again.$md$,
  content_fr = $md$La performance dépend de l'activation, le niveau d'éveil du corps. Le **U inversé** classique décrit une courbe : trop peu d'activation et on manque de mordant, trop et on se crispe, avec la meilleure performance quelque part entre les deux.

Le modèle **IZOF** de Hanin (zones individuelles de fonctionnement optimal) ajoute que cette zone est **personnelle** : certains athlètes performent mieux très calmes, d'autres très chargés. Elle varie aussi selon la tâche : un putt au golf demande moins d'activation qu'un essai en haltérophilie.

**Trouvez votre zone.** Rappelez-vous vos trois meilleures et vos trois pires performances. Notez votre niveau d'activation avant chacune (0–10). Votre zone optimale apparaît en général.

**Pour descendre :** respiration lente avec expiration longue ([respiration carrée](/resources/box-breathing)), relaxation musculaire progressive, un mot-clé apaisant.

**Pour monter :** musique énergisante, échauffement dynamique, mot-clé motivant, courte visualisation d'un départ explosif.

**Exercice.** Avant vos trois prochaines séances, notez votre activation, utilisez une technique pour rejoindre votre zone, puis notez-la à nouveau.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'sport-psychology-fundamentals-756683' AND m.order_index = 2;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 2, 'Arousal and your optimal zone', 'L''activation et votre zone optimale', 'التنشيط ومنطقتك المثلى', 12, $md$Performance depends on arousal, the body's level of activation. The classic **inverted-U** describes a curve: too little arousal and you are flat, too much and you get tight, with the best performance somewhere in between.

Hanin's **IZOF** model (individual zones of optimal functioning) adds that this zone is **personal**: some athletes perform best very calm, others highly charged. It also varies with the task: a golf putt needs less arousal than a weightlifting attempt.

**Find your zone.** Recall your three best and three worst performances. Rate how activated you felt before each (0–10). Your best zone usually appears.

**To come down:** slow breathing with a long out-breath ([box breathing](/resources/box-breathing)), progressive muscle relaxation, a calm cue word.

**To come up:** energising music, dynamic warm-up, a motivational cue word, a short visualisation of an explosive start.

**Exercise.** Before your next three sessions, rate your arousal, use one technique to move towards your zone, and rate it again.$md$, $md$La performance dépend de l'activation, le niveau d'éveil du corps. Le **U inversé** classique décrit une courbe : trop peu d'activation et on manque de mordant, trop et on se crispe, avec la meilleure performance quelque part entre les deux.

Le modèle **IZOF** de Hanin (zones individuelles de fonctionnement optimal) ajoute que cette zone est **personnelle** : certains athlètes performent mieux très calmes, d'autres très chargés. Elle varie aussi selon la tâche : un putt au golf demande moins d'activation qu'un essai en haltérophilie.

**Trouvez votre zone.** Rappelez-vous vos trois meilleures et vos trois pires performances. Notez votre niveau d'activation avant chacune (0–10). Votre zone optimale apparaît en général.

**Pour descendre :** respiration lente avec expiration longue ([respiration carrée](/resources/box-breathing)), relaxation musculaire progressive, un mot-clé apaisant.

**Pour monter :** musique énergisante, échauffement dynamique, mot-clé motivant, courte visualisation d'un départ explosif.

**Exercice.** Avant vos trois prochaines séances, notez votre activation, utilisez une technique pour rejoindre votre zone, puis notez-la à nouveau.$md$
FROM public.courses c WHERE c.slug = 'sport-psychology-fundamentals-756683'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 2);

UPDATE public.course_modules m SET title = 'Self-talk that works', title_fr = 'Un discours interne qui fonctionne', title_ar = 'حوار ذاتي فعّال', duration_minutes = 10,
  content = $md$What athletes say to themselves affects attention, effort and emotion. A meta-analysis of 32 studies found that self-talk strategies improve performance (Hatzigeorgiadis et al., 2011).

Two types:
- **Instructional** ("quick feet", "follow through"): especially useful for precision and technical skills.
- **Motivational** ("push", "I've got this"): especially useful for strength and endurance.

Some studies suggest that talking to yourself in the **second person** ("you can do it") can help more than the first person.

**Build your cue words:**
1. Note what you usually say to yourself after a mistake.
2. Replace critical phrases with a short reset word ("next", "reset").
3. Choose one instructional and one motivational cue for your sport.
4. Practise them in training until they are automatic.

**Exercise.** During your next session, say your reset word after every mistake and notice how quickly you refocus.$md$,
  content_fr = $md$Ce que l'athlète se dit influence l'attention, l'effort et l'émotion. Une méta-analyse de 32 études a montré que les stratégies de discours interne améliorent la performance (Hatzigeorgiadis et al., 2011).

Deux types :
- **Instructionnel** (« pieds rapides », « accompagne le geste ») : particulièrement utile pour les tâches de précision et techniques.
- **Motivationnel** (« pousse », « je l'ai ») : particulièrement utile pour la force et l'endurance.

Certaines études suggèrent que se parler à la **deuxième personne** (« tu peux le faire ») aiderait davantage que la première personne.

**Construisez vos mots-clés :**
1. Notez ce que vous vous dites habituellement après une erreur.
2. Remplacez les phrases critiques par un mot court de remise à zéro (« suivant », « reset »).
3. Choisissez un mot-clé instructionnel et un motivationnel pour votre sport.
4. Pratiquez-les à l'entraînement jusqu'à ce qu'ils deviennent automatiques.

**Exercice.** Pendant votre prochaine séance, dites votre mot de remise à zéro après chaque erreur et observez la vitesse à laquelle vous vous recentrez.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'sport-psychology-fundamentals-756683' AND m.order_index = 3;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 3, 'Self-talk that works', 'Un discours interne qui fonctionne', 'حوار ذاتي فعّال', 10, $md$What athletes say to themselves affects attention, effort and emotion. A meta-analysis of 32 studies found that self-talk strategies improve performance (Hatzigeorgiadis et al., 2011).

Two types:
- **Instructional** ("quick feet", "follow through"): especially useful for precision and technical skills.
- **Motivational** ("push", "I've got this"): especially useful for strength and endurance.

Some studies suggest that talking to yourself in the **second person** ("you can do it") can help more than the first person.

**Build your cue words:**
1. Note what you usually say to yourself after a mistake.
2. Replace critical phrases with a short reset word ("next", "reset").
3. Choose one instructional and one motivational cue for your sport.
4. Practise them in training until they are automatic.

**Exercise.** During your next session, say your reset word after every mistake and notice how quickly you refocus.$md$, $md$Ce que l'athlète se dit influence l'attention, l'effort et l'émotion. Une méta-analyse de 32 études a montré que les stratégies de discours interne améliorent la performance (Hatzigeorgiadis et al., 2011).

Deux types :
- **Instructionnel** (« pieds rapides », « accompagne le geste ») : particulièrement utile pour les tâches de précision et techniques.
- **Motivationnel** (« pousse », « je l'ai ») : particulièrement utile pour la force et l'endurance.

Certaines études suggèrent que se parler à la **deuxième personne** (« tu peux le faire ») aiderait davantage que la première personne.

**Construisez vos mots-clés :**
1. Notez ce que vous vous dites habituellement après une erreur.
2. Remplacez les phrases critiques par un mot court de remise à zéro (« suivant », « reset »).
3. Choisissez un mot-clé instructionnel et un motivationnel pour votre sport.
4. Pratiquez-les à l'entraînement jusqu'à ce qu'ils deviennent automatiques.

**Exercice.** Pendant votre prochaine séance, dites votre mot de remise à zéro après chaque erreur et observez la vitesse à laquelle vous vous recentrez.$md$
FROM public.courses c WHERE c.slug = 'sport-psychology-fundamentals-756683'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 3);

UPDATE public.course_modules m SET title = 'Routines, not superstitions', title_fr = 'Des routines, pas des superstitions', title_ar = 'روتين، لا خرافات', duration_minutes = 10,
  content = $md$A **routine** is a controllable sequence of actions and thoughts that prepares performance: bouncing the ball before a free throw, a breath and a cue word before a serve. Research associates consistent routines with better performance, especially under pressure (Cotterill, 2010).

A **superstition** depends on something you do not control (the lucky socks, the same seat on the bus). It may comfort, but when the condition is missing it creates anxiety and fragility.

Test: **if this element were missing, could I still perform?** If the answer is no, turn it into something controllable.

A good routine:
- is short (5 to 15 seconds for a closed skill),
- includes a physical anchor, a breath, an intention and a trigger word,
- has a shortened "plan B" version for when time is short,
- is practised in training, not invented on match day.

Build yours with the [pre-performance routine worksheet](/resources/pre-performance-routine).

**Further reading:** Weinberg, R. S., & Gould, D. (2023). *Foundations of Sport and Exercise Psychology* (8th ed.). Human Kinetics.$md$,
  content_fr = $md$Une **routine** est une séquence contrôlable de gestes et de pensées qui prépare la performance : faire rebondir le ballon avant un lancer franc, une respiration et un mot-clé avant un service. Les recherches associent des routines régulières à une meilleure performance, surtout sous pression (Cotterill, 2010).

Une **superstition** dépend de quelque chose qu'on ne contrôle pas (les chaussettes porte-bonheur, la même place dans le bus). Elle peut rassurer, mais quand la condition manque, elle crée de l'anxiété et de la fragilité.

Test : **si cet élément manquait, pourrais-je quand même performer ?** Si la réponse est non, transformez-le en quelque chose de contrôlable.

Une bonne routine :
- est courte (5 à 15 secondes pour un geste fermé),
- comprend un ancrage physique, une respiration, une intention et un mot déclencheur,
- a une version raccourcie « plan B » pour quand le temps manque,
- se travaille à l'entraînement, et ne s'invente pas le jour du match.

Construisez la vôtre avec la [fiche de routine de pré-performance](/resources/pre-performance-routine).

**Pour aller plus loin :** Weinberg, R. S., & Gould, D. (2023). *Foundations of Sport and Exercise Psychology* (8th ed.). Human Kinetics.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'sport-psychology-fundamentals-756683' AND m.order_index = 4;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 4, 'Routines, not superstitions', 'Des routines, pas des superstitions', 'روتين، لا خرافات', 10, $md$A **routine** is a controllable sequence of actions and thoughts that prepares performance: bouncing the ball before a free throw, a breath and a cue word before a serve. Research associates consistent routines with better performance, especially under pressure (Cotterill, 2010).

A **superstition** depends on something you do not control (the lucky socks, the same seat on the bus). It may comfort, but when the condition is missing it creates anxiety and fragility.

Test: **if this element were missing, could I still perform?** If the answer is no, turn it into something controllable.

A good routine:
- is short (5 to 15 seconds for a closed skill),
- includes a physical anchor, a breath, an intention and a trigger word,
- has a shortened "plan B" version for when time is short,
- is practised in training, not invented on match day.

Build yours with the [pre-performance routine worksheet](/resources/pre-performance-routine).

**Further reading:** Weinberg, R. S., & Gould, D. (2023). *Foundations of Sport and Exercise Psychology* (8th ed.). Human Kinetics.$md$, $md$Une **routine** est une séquence contrôlable de gestes et de pensées qui prépare la performance : faire rebondir le ballon avant un lancer franc, une respiration et un mot-clé avant un service. Les recherches associent des routines régulières à une meilleure performance, surtout sous pression (Cotterill, 2010).

Une **superstition** dépend de quelque chose qu'on ne contrôle pas (les chaussettes porte-bonheur, la même place dans le bus). Elle peut rassurer, mais quand la condition manque, elle crée de l'anxiété et de la fragilité.

Test : **si cet élément manquait, pourrais-je quand même performer ?** Si la réponse est non, transformez-le en quelque chose de contrôlable.

Une bonne routine :
- est courte (5 à 15 secondes pour un geste fermé),
- comprend un ancrage physique, une respiration, une intention et un mot déclencheur,
- a une version raccourcie « plan B » pour quand le temps manque,
- se travaille à l'entraînement, et ne s'invente pas le jour du match.

Construisez la vôtre avec la [fiche de routine de pré-performance](/resources/pre-performance-routine).

**Pour aller plus loin :** Weinberg, R. S., & Gould, D. (2023). *Foundations of Sport and Exercise Psychology* (8th ed.). Human Kinetics.$md$
FROM public.courses c WHERE c.slug = 'sport-psychology-fundamentals-756683'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 4);

UPDATE public.courses SET title = 'Pre-Competition Mental Preparation', title_fr = 'Préparation mentale avant la compétition', title_ar = 'التحضير الذهني قبل المنافسة',
  description = 'The two weeks before a competition: planning, visualisation, the pre-event ritual, the night before and the debrief.', description_fr = 'Les deux semaines avant une compétition : planification, visualisation, rituel d''avant-épreuve, la veille et le débrief.', description_ar = 'الأسبوعان قبل المنافسة: التخطيط، التخيل، طقوس ما قبل الحدث، الليلة السابقة، والمراجعة.',
  difficulty_level = 'intermediate', duration_hours = 0.8
WHERE slug = 'pre-competition-mental-preparation-5a2ebe';

UPDATE public.course_modules m SET title = 'The two-week countdown', title_fr = 'Le compte à rebours de deux semaines', title_ar = 'العد التنازلي لأسبوعين', duration_minutes = 12,
  content = $md$Mental preparation for an important competition starts well before the day.

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

**Exercise.** Write five "if… then I will…" plans for your next competition.$md$,
  content_fr = $md$La préparation mentale d'une compétition importante commence bien avant le jour J.

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

**Exercice.** Écrivez cinq plans « si… alors je… » pour votre prochaine compétition.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'pre-competition-mental-preparation-5a2ebe' AND m.order_index = 1;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 1, 'The two-week countdown', 'Le compte à rebours de deux semaines', 'العد التنازلي لأسبوعين', 12, $md$Mental preparation for an important competition starts well before the day.

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

**Exercise.** Write five "if… then I will…" plans for your next competition.$md$, $md$La préparation mentale d'une compétition importante commence bien avant le jour J.

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

**Exercice.** Écrivez cinq plans « si… alors je… » pour votre prochaine compétition.$md$
FROM public.courses c WHERE c.slug = 'pre-competition-mental-preparation-5a2ebe'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 1);

UPDATE public.course_modules m SET title = 'Visualisation that transfers', title_fr = 'Une visualisation qui se transfère', title_ar = 'تخيّل ينتقل إلى الأداء', duration_minutes = 15,
  content = $md$Imagery activates brain processes close to those of real movement. A meta-analysis of imagery interventions in sport found positive effects on performance, motivation and confidence (Simonsmeier et al., 2021).

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

**Exercise.** Practise your script for five minutes, four times this week, ideally in your kit.$md$,
  content_fr = $md$L'imagerie active des processus cérébraux proches de ceux du mouvement réel. Une méta-analyse des interventions par imagerie en sport a montré des effets positifs sur la performance, la motivation et la confiance (Simonsmeier et al., 2021).

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

**Exercice.** Pratiquez votre script cinq minutes, quatre fois cette semaine, si possible en tenue.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'pre-competition-mental-preparation-5a2ebe' AND m.order_index = 2;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 2, 'Visualisation that transfers', 'Une visualisation qui se transfère', 'تخيّل ينتقل إلى الأداء', 15, $md$Imagery activates brain processes close to those of real movement. A meta-analysis of imagery interventions in sport found positive effects on performance, motivation and confidence (Simonsmeier et al., 2021).

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

**Exercise.** Practise your script for five minutes, four times this week, ideally in your kit.$md$, $md$L'imagerie active des processus cérébraux proches de ceux du mouvement réel. Une méta-analyse des interventions par imagerie en sport a montré des effets positifs sur la performance, la motivation et la confiance (Simonsmeier et al., 2021).

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

**Exercice.** Pratiquez votre script cinq minutes, quatre fois cette semaine, si possible en tenue.$md$
FROM public.courses c WHERE c.slug = 'pre-competition-mental-preparation-5a2ebe'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 2);

UPDATE public.course_modules m SET title = 'Designing your pre-event ritual', title_fr = 'Construire son rituel d''avant-épreuve', title_ar = 'تصميم طقوس ما قبل الحدث', duration_minutes = 12,
  content = $md$In the hour before competing, a structured sequence keeps attention on what you control. A simple 30-minute frame to adapt to your sport:

1. **Activation (≈10 min):** physical warm-up, music if it helps, moving towards your optimal arousal zone.
2. **Focus (≈10 min):** breathing, your cue words, reviewing two or three process goals.
3. **Commitment (≈10 min):** short visualisation of the start and of one key action, then a final trigger ("let's go").

Plan **where** and **when** each part happens, and what you will do if the schedule changes (a delay, a crowded warm-up area). A shortened 5-minute version is useful in case of surprise.

Avoid introducing anything new on the day: new food, new equipment, new routines.

Your ritual connects with your skill-level routine: see the [pre-performance routine worksheet](/resources/pre-performance-routine).

**Exercise.** Write your ritual minute by minute and rehearse it before your next training match.$md$,
  content_fr = $md$Dans l'heure qui précède la compétition, une séquence structurée garde l'attention sur ce que vous contrôlez. Un cadre simple de 30 minutes, à adapter à votre sport :

1. **Activation (≈10 min) :** échauffement physique, musique si elle vous aide, pour rejoindre votre zone d'activation optimale.
2. **Concentration (≈10 min) :** respiration, mots-clés, rappel de deux ou trois objectifs de processus.
3. **Engagement (≈10 min) :** courte visualisation du départ et d'une action clé, puis un déclencheur final (« c'est parti »).

Prévoyez **où** et **quand** se déroule chaque partie, et ce que vous ferez si le programme change (un retard, une zone d'échauffement bondée). Une version raccourcie de 5 minutes est utile en cas d'imprévu.

Évitez d'introduire quoi que ce soit de nouveau le jour J : nouvelle alimentation, nouvel équipement, nouvelle routine.

Votre rituel s'articule avec votre routine de geste : voir la [fiche de routine de pré-performance](/resources/pre-performance-routine).

**Exercice.** Écrivez votre rituel minute par minute et répétez-le avant votre prochain match d'entraînement.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'pre-competition-mental-preparation-5a2ebe' AND m.order_index = 3;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 3, 'Designing your pre-event ritual', 'Construire son rituel d''avant-épreuve', 'تصميم طقوس ما قبل الحدث', 12, $md$In the hour before competing, a structured sequence keeps attention on what you control. A simple 30-minute frame to adapt to your sport:

1. **Activation (≈10 min):** physical warm-up, music if it helps, moving towards your optimal arousal zone.
2. **Focus (≈10 min):** breathing, your cue words, reviewing two or three process goals.
3. **Commitment (≈10 min):** short visualisation of the start and of one key action, then a final trigger ("let's go").

Plan **where** and **when** each part happens, and what you will do if the schedule changes (a delay, a crowded warm-up area). A shortened 5-minute version is useful in case of surprise.

Avoid introducing anything new on the day: new food, new equipment, new routines.

Your ritual connects with your skill-level routine: see the [pre-performance routine worksheet](/resources/pre-performance-routine).

**Exercise.** Write your ritual minute by minute and rehearse it before your next training match.$md$, $md$Dans l'heure qui précède la compétition, une séquence structurée garde l'attention sur ce que vous contrôlez. Un cadre simple de 30 minutes, à adapter à votre sport :

1. **Activation (≈10 min) :** échauffement physique, musique si elle vous aide, pour rejoindre votre zone d'activation optimale.
2. **Concentration (≈10 min) :** respiration, mots-clés, rappel de deux ou trois objectifs de processus.
3. **Engagement (≈10 min) :** courte visualisation du départ et d'une action clé, puis un déclencheur final (« c'est parti »).

Prévoyez **où** et **quand** se déroule chaque partie, et ce que vous ferez si le programme change (un retard, une zone d'échauffement bondée). Une version raccourcie de 5 minutes est utile en cas d'imprévu.

Évitez d'introduire quoi que ce soit de nouveau le jour J : nouvelle alimentation, nouvel équipement, nouvelle routine.

Votre rituel s'articule avec votre routine de geste : voir la [fiche de routine de pré-performance](/resources/pre-performance-routine).

**Exercice.** Écrivez votre rituel minute par minute et répétez-le avant votre prochain match d'entraînement.$md$
FROM public.courses c WHERE c.slug = 'pre-competition-mental-preparation-5a2ebe'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 3);

UPDATE public.course_modules m SET title = 'The night before, and the debrief', title_fr = 'La veille, et le débrief', title_ar = 'الليلة السابقة والمراجعة', duration_minutes = 10,
  content = $md$**The night before** is not the time to gain anything, only to avoid losing anything.
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

**Exercise.** After your next competition, complete the debrief table and share it with your coach.$md$,
  content_fr = $md$**La veille** n'est pas le moment de gagner quelque chose, seulement d'éviter d'en perdre.
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

**Exercice.** Après votre prochaine compétition, remplissez le tableau du débrief et partagez-le avec votre entraîneur.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'pre-competition-mental-preparation-5a2ebe' AND m.order_index = 4;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 4, 'The night before, and the debrief', 'La veille, et le débrief', 'الليلة السابقة والمراجعة', 10, $md$**The night before** is not the time to gain anything, only to avoid losing anything.
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

**Exercise.** After your next competition, complete the debrief table and share it with your coach.$md$, $md$**La veille** n'est pas le moment de gagner quelque chose, seulement d'éviter d'en perdre.
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

**Exercice.** Après votre prochaine compétition, remplissez le tableau du débrief et partagez-le avec votre entraîneur.$md$
FROM public.courses c WHERE c.slug = 'pre-competition-mental-preparation-5a2ebe'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 4);

UPDATE public.courses SET title = 'Workplace Mental Health Programme', title_fr = 'Programme de santé mentale au travail', title_ar = 'برنامج الصحة النفسية في العمل',
  description = 'For HR, managers and organisations: the WHO framework, psychological safety, workload and recovery, and how to measure without exposing anyone.', description_fr = 'Pour les RH, managers et organisations : le cadre de l''OMS, la sécurité psychologique, la charge et la récupération, et comment mesurer sans exposer personne.', description_ar = 'للموارد البشرية والمديرين والمؤسسات: إطار منظمة الصحة العالمية، الأمان النفسي، عبء العمل والتعافي، وكيفية القياس دون كشف أحد.',
  difficulty_level = 'intermediate', duration_hours = 0.8
WHERE slug = 'corporate-wellbeing-program-f5b30f';

UPDATE public.course_modules m SET title = 'Why it matters, and the WHO framework', title_fr = 'Pourquoi c''est important, et le cadre de l''OMS', title_ar = 'لماذا يهم الأمر، وإطار منظمة الصحة العالمية', duration_minutes = 12,
  content = $md$The WHO estimates that depression and anxiety cost the global economy around **12 billion working days** a year, mostly through lost productivity. Work can protect mental health, or damage it.

In 2022, the WHO published its first **guidelines on mental health at work**. They recommend action on three levels:
1. **Organisational interventions**: addressing psychosocial risks at the source (workload, control over one's work, role clarity, support, fairness, harassment).
2. **Training for managers**, so they can recognise distress and respond supportively.
3. **Individual interventions**: stress management training, physical activity, access to care.

Programmes that only offer individual tools (a meditation app, a yoga session) without changing working conditions tend to have limited effects.

**Exercise.** List the main psychosocial risks in your organisation using the six headings above. For each, rate the current situation (green / orange / red) and note who could act on it.$md$,
  content_fr = $md$L'OMS estime que la dépression et l'anxiété coûtent à l'économie mondiale environ **12 milliards de journées de travail** par an, surtout en perte de productivité. Le travail peut protéger la santé mentale, ou l'abîmer.

En 2022, l'OMS a publié ses premières **lignes directrices sur la santé mentale au travail**. Elles recommandent d'agir à trois niveaux :
1. **Interventions organisationnelles** : traiter les risques psychosociaux à la source (charge de travail, marge de manœuvre, clarté des rôles, soutien, équité, harcèlement).
2. **Formation des managers**, pour qu'ils sachent repérer la détresse et y répondre de façon soutenante.
3. **Interventions individuelles** : formation à la gestion du stress, activité physique, accès aux soins.

Les programmes qui proposent seulement des outils individuels (une application de méditation, une séance de yoga) sans changer les conditions de travail ont en général des effets limités.

**Exercice.** Listez les principaux risques psychosociaux de votre organisation selon les six rubriques ci-dessus. Pour chacun, évaluez la situation actuelle (vert / orange / rouge) et notez qui pourrait agir.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'corporate-wellbeing-program-f5b30f' AND m.order_index = 1;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 1, 'Why it matters, and the WHO framework', 'Pourquoi c''est important, et le cadre de l''OMS', 'لماذا يهم الأمر، وإطار منظمة الصحة العالمية', 12, $md$The WHO estimates that depression and anxiety cost the global economy around **12 billion working days** a year, mostly through lost productivity. Work can protect mental health, or damage it.

In 2022, the WHO published its first **guidelines on mental health at work**. They recommend action on three levels:
1. **Organisational interventions**: addressing psychosocial risks at the source (workload, control over one's work, role clarity, support, fairness, harassment).
2. **Training for managers**, so they can recognise distress and respond supportively.
3. **Individual interventions**: stress management training, physical activity, access to care.

Programmes that only offer individual tools (a meditation app, a yoga session) without changing working conditions tend to have limited effects.

**Exercise.** List the main psychosocial risks in your organisation using the six headings above. For each, rate the current situation (green / orange / red) and note who could act on it.$md$, $md$L'OMS estime que la dépression et l'anxiété coûtent à l'économie mondiale environ **12 milliards de journées de travail** par an, surtout en perte de productivité. Le travail peut protéger la santé mentale, ou l'abîmer.

En 2022, l'OMS a publié ses premières **lignes directrices sur la santé mentale au travail**. Elles recommandent d'agir à trois niveaux :
1. **Interventions organisationnelles** : traiter les risques psychosociaux à la source (charge de travail, marge de manœuvre, clarté des rôles, soutien, équité, harcèlement).
2. **Formation des managers**, pour qu'ils sachent repérer la détresse et y répondre de façon soutenante.
3. **Interventions individuelles** : formation à la gestion du stress, activité physique, accès aux soins.

Les programmes qui proposent seulement des outils individuels (une application de méditation, une séance de yoga) sans changer les conditions de travail ont en général des effets limités.

**Exercice.** Listez les principaux risques psychosociaux de votre organisation selon les six rubriques ci-dessus. Pour chacun, évaluez la situation actuelle (vert / orange / rouge) et notez qui pourrait agir.$md$
FROM public.courses c WHERE c.slug = 'corporate-wellbeing-program-f5b30f'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 1);

UPDATE public.course_modules m SET title = 'Psychological safety', title_fr = 'La sécurité psychologique', title_ar = 'الأمان النفسي', duration_minutes = 12,
  content = $md$Amy Edmondson defines psychological safety as a shared belief that the team is safe for **interpersonal risk-taking**: asking a question, admitting a mistake, raising a concern, proposing an idea. Her research links it to team learning and performance, and Google's internal study of its teams (Project Aristotle) found it was the most important of the dynamics it examined.

Psychological safety is not about being nice or lowering standards. High standards **and** high safety produce learning; high standards with low safety produce anxiety and hidden problems.

What leaders can do:
- **Frame the work** as learning: "we've never done this; we'll need everyone's input."
- **Show fallibility**: "I may have missed something. What do you see?"
- **Respond productively** to bad news: thank the messenger, look forward, fix the system rather than blame the person.
- Invite quieter voices explicitly.

**Exercise.** In your next three meetings, ask one open question inviting disagreement, and note how many people speak who usually don't.$md$,
  content_fr = $md$Amy Edmondson définit la sécurité psychologique comme la conviction partagée que l'équipe permet de **prendre des risques interpersonnels** : poser une question, reconnaître une erreur, signaler un problème, proposer une idée. Ses recherches la relient à l'apprentissage et à la performance des équipes, et l'étude interne de Google sur ses équipes (projet Aristotle) en a fait la plus importante des dynamiques examinées.

La sécurité psychologique ne veut pas dire être gentil ou baisser les exigences. Des exigences élevées **et** une sécurité élevée produisent de l'apprentissage ; des exigences élevées avec une faible sécurité produisent de l'anxiété et des problèmes cachés.

Ce que les responsables peuvent faire :
- **Présenter le travail** comme un apprentissage : « on n'a jamais fait ça ; on aura besoin de l'avis de chacun ».
- **Montrer sa faillibilité** : « j'ai peut-être raté quelque chose. Qu'est-ce que vous voyez ? »
- **Bien réagir** aux mauvaises nouvelles : remercier celui qui les apporte, regarder vers l'avant, corriger le système plutôt que blâmer la personne.
- Inviter explicitement les voix plus discrètes.

**Exercice.** Lors de vos trois prochaines réunions, posez une question ouverte qui invite au désaccord, et notez combien de personnes s'expriment alors qu'elles le font rarement.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'corporate-wellbeing-program-f5b30f' AND m.order_index = 2;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 2, 'Psychological safety', 'La sécurité psychologique', 'الأمان النفسي', 12, $md$Amy Edmondson defines psychological safety as a shared belief that the team is safe for **interpersonal risk-taking**: asking a question, admitting a mistake, raising a concern, proposing an idea. Her research links it to team learning and performance, and Google's internal study of its teams (Project Aristotle) found it was the most important of the dynamics it examined.

Psychological safety is not about being nice or lowering standards. High standards **and** high safety produce learning; high standards with low safety produce anxiety and hidden problems.

What leaders can do:
- **Frame the work** as learning: "we've never done this; we'll need everyone's input."
- **Show fallibility**: "I may have missed something. What do you see?"
- **Respond productively** to bad news: thank the messenger, look forward, fix the system rather than blame the person.
- Invite quieter voices explicitly.

**Exercise.** In your next three meetings, ask one open question inviting disagreement, and note how many people speak who usually don't.$md$, $md$Amy Edmondson définit la sécurité psychologique comme la conviction partagée que l'équipe permet de **prendre des risques interpersonnels** : poser une question, reconnaître une erreur, signaler un problème, proposer une idée. Ses recherches la relient à l'apprentissage et à la performance des équipes, et l'étude interne de Google sur ses équipes (projet Aristotle) en a fait la plus importante des dynamiques examinées.

La sécurité psychologique ne veut pas dire être gentil ou baisser les exigences. Des exigences élevées **et** une sécurité élevée produisent de l'apprentissage ; des exigences élevées avec une faible sécurité produisent de l'anxiété et des problèmes cachés.

Ce que les responsables peuvent faire :
- **Présenter le travail** comme un apprentissage : « on n'a jamais fait ça ; on aura besoin de l'avis de chacun ».
- **Montrer sa faillibilité** : « j'ai peut-être raté quelque chose. Qu'est-ce que vous voyez ? »
- **Bien réagir** aux mauvaises nouvelles : remercier celui qui les apporte, regarder vers l'avant, corriger le système plutôt que blâmer la personne.
- Inviter explicitement les voix plus discrètes.

**Exercice.** Lors de vos trois prochaines réunions, posez une question ouverte qui invite au désaccord, et notez combien de personnes s'expriment alors qu'elles le font rarement.$md$
FROM public.courses c WHERE c.slug = 'corporate-wellbeing-program-f5b30f'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 2);

UPDATE public.course_modules m SET title = 'Workload, boundaries and recovery', title_fr = 'Charge de travail, limites et récupération', title_ar = 'عبء العمل والحدود والتعافي', duration_minutes = 12,
  content = $md$Burnout is driven mainly by working conditions, especially **chronic overload**, lack of control and lack of recognition. Individual resilience cannot compensate for a structurally impossible workload.

Organisational levers:
- Make workload **visible**: shared priorities, realistic deadlines, an explicit "stop doing" list.
- Protect **recovery**: no expectation of replies outside working hours, holidays actually taken, meetings ending before the end of the day.
- Give **control**: involve people in decisions about how they work.
- **Recognise** effort, not only results.

Individual levers to offer teams:
- [Deep work blocks](/resources/deep-work-blocks) to reduce fragmentation.
- [Boundary scripts](/resources/boundary-scripts) and [DEAR MAN](/resources/dear-man-script) to negotiate priorities.
- The [Stress Management Essentials](/learn) course.

**Exercise.** With your team, list the recurring tasks and meetings. Mark those that could be dropped, shortened or delegated, and agree on one change for the next month.$md$,
  content_fr = $md$L'épuisement professionnel est surtout causé par les conditions de travail, en particulier la **surcharge chronique**, le manque de contrôle et le manque de reconnaissance. La résilience individuelle ne peut pas compenser une charge structurellement impossible.

Leviers organisationnels :
- Rendre la charge **visible** : priorités partagées, délais réalistes, liste explicite de ce qu'on arrête de faire.
- Protéger la **récupération** : pas d'attente de réponse en dehors des heures de travail, congés réellement pris, réunions terminées avant la fin de journée.
- Donner du **contrôle** : associer les personnes aux décisions sur leur façon de travailler.
- **Reconnaître** l'effort, pas seulement les résultats.

Leviers individuels à proposer aux équipes :
- Les [blocs de travail profond](/resources/deep-work-blocks) pour réduire la fragmentation.
- Les [phrases pour poser ses limites](/resources/boundary-scripts) et [DEAR MAN](/resources/dear-man-script) pour négocier les priorités.
- Le cours [L'essentiel de la gestion du stress](/learn).

**Exercice.** Avec votre équipe, listez les tâches et réunions récurrentes. Marquez celles qui pourraient être supprimées, raccourcies ou déléguées, et décidez d'un changement pour le mois prochain.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'corporate-wellbeing-program-f5b30f' AND m.order_index = 3;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 3, 'Workload, boundaries and recovery', 'Charge de travail, limites et récupération', 'عبء العمل والحدود والتعافي', 12, $md$Burnout is driven mainly by working conditions, especially **chronic overload**, lack of control and lack of recognition. Individual resilience cannot compensate for a structurally impossible workload.

Organisational levers:
- Make workload **visible**: shared priorities, realistic deadlines, an explicit "stop doing" list.
- Protect **recovery**: no expectation of replies outside working hours, holidays actually taken, meetings ending before the end of the day.
- Give **control**: involve people in decisions about how they work.
- **Recognise** effort, not only results.

Individual levers to offer teams:
- [Deep work blocks](/resources/deep-work-blocks) to reduce fragmentation.
- [Boundary scripts](/resources/boundary-scripts) and [DEAR MAN](/resources/dear-man-script) to negotiate priorities.
- The [Stress Management Essentials](/learn) course.

**Exercise.** With your team, list the recurring tasks and meetings. Mark those that could be dropped, shortened or delegated, and agree on one change for the next month.$md$, $md$L'épuisement professionnel est surtout causé par les conditions de travail, en particulier la **surcharge chronique**, le manque de contrôle et le manque de reconnaissance. La résilience individuelle ne peut pas compenser une charge structurellement impossible.

Leviers organisationnels :
- Rendre la charge **visible** : priorités partagées, délais réalistes, liste explicite de ce qu'on arrête de faire.
- Protéger la **récupération** : pas d'attente de réponse en dehors des heures de travail, congés réellement pris, réunions terminées avant la fin de journée.
- Donner du **contrôle** : associer les personnes aux décisions sur leur façon de travailler.
- **Reconnaître** l'effort, pas seulement les résultats.

Leviers individuels à proposer aux équipes :
- Les [blocs de travail profond](/resources/deep-work-blocks) pour réduire la fragmentation.
- Les [phrases pour poser ses limites](/resources/boundary-scripts) et [DEAR MAN](/resources/dear-man-script) pour négocier les priorités.
- Le cours [L'essentiel de la gestion du stress](/learn).

**Exercice.** Avec votre équipe, listez les tâches et réunions récurrentes. Marquez celles qui pourraient être supprimées, raccourcies ou déléguées, et décidez d'un changement pour le mois prochain.$md$
FROM public.courses c WHERE c.slug = 'corporate-wellbeing-program-f5b30f'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 3);

UPDATE public.course_modules m SET title = 'Measuring without exposing anyone', title_fr = 'Mesurer sans exposer personne', title_ar = 'القياس دون كشف أحد', duration_minutes = 12,
  content = $md$A short, regular **pulse survey** tracks the climate better than one long annual survey. For example, once a month, three questions on a 1–5 scale: workload, support, meaning in work.

**Protecting confidentiality is non-negotiable:**
- Report results only for groups of **at least five people** (some organisations use 10). Below that, merge teams.
- Never ask for data that could identify someone in a small team (exact age, role in a team of one).
- Don't collect health information in a workplace survey. Point people to confidential support instead.
- Tell employees clearly who sees what, and comply with data protection law (in Morocco, Law 09-08 and the CNDP).

**Close the loop.** Share results with teams within a few weeks, along with one or two concrete actions. A survey without visible follow-up erodes trust.

**Offer access to care:** a confidential route to a psychologist, separate from management. U.Psy works with organisations on this: [contact us](/contact).

**Further reading:** WHO (2022). *WHO guidelines on mental health at work*. Edmondson, A. C. (1999). Psychological safety and learning behavior in work teams. *Administrative Science Quarterly*, 44(2), 350–383.$md$,
  content_fr = $md$Une **enquête flash** courte et régulière suit le climat mieux qu'une longue enquête annuelle. Par exemple, une fois par mois, trois questions sur une échelle de 1 à 5 : charge de travail, soutien, sens du travail.

**La confidentialité n'est pas négociable :**
- Ne présentez les résultats que pour des groupes d'**au moins cinq personnes** (certaines organisations prennent 10). En dessous, regroupez les équipes.
- Ne demandez jamais de données qui permettraient d'identifier quelqu'un dans une petite équipe (âge exact, poste unique).
- Ne collectez pas d'informations de santé dans une enquête interne. Orientez plutôt vers un soutien confidentiel.
- Expliquez clairement qui voit quoi, et respectez la loi sur la protection des données (au Maroc, la loi 09-08 et la CNDP).

**Bouclez la boucle.** Partagez les résultats avec les équipes en quelques semaines, avec une ou deux actions concrètes. Une enquête sans suite visible abîme la confiance.

**Offrez un accès aux soins :** une voie confidentielle vers un psychologue, distincte de la hiérarchie. U.Psy accompagne les organisations sur ce point : [contactez-nous](/contact).

**Pour aller plus loin :** OMS (2022). *Lignes directrices de l'OMS sur la santé mentale au travail*. Edmondson, A. C. (1999). Psychological safety and learning behavior in work teams. *Administrative Science Quarterly*, 44(2), 350–383.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'corporate-wellbeing-program-f5b30f' AND m.order_index = 4;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 4, 'Measuring without exposing anyone', 'Mesurer sans exposer personne', 'القياس دون كشف أحد', 12, $md$A short, regular **pulse survey** tracks the climate better than one long annual survey. For example, once a month, three questions on a 1–5 scale: workload, support, meaning in work.

**Protecting confidentiality is non-negotiable:**
- Report results only for groups of **at least five people** (some organisations use 10). Below that, merge teams.
- Never ask for data that could identify someone in a small team (exact age, role in a team of one).
- Don't collect health information in a workplace survey. Point people to confidential support instead.
- Tell employees clearly who sees what, and comply with data protection law (in Morocco, Law 09-08 and the CNDP).

**Close the loop.** Share results with teams within a few weeks, along with one or two concrete actions. A survey without visible follow-up erodes trust.

**Offer access to care:** a confidential route to a psychologist, separate from management. U.Psy works with organisations on this: [contact us](/contact).

**Further reading:** WHO (2022). *WHO guidelines on mental health at work*. Edmondson, A. C. (1999). Psychological safety and learning behavior in work teams. *Administrative Science Quarterly*, 44(2), 350–383.$md$, $md$Une **enquête flash** courte et régulière suit le climat mieux qu'une longue enquête annuelle. Par exemple, une fois par mois, trois questions sur une échelle de 1 à 5 : charge de travail, soutien, sens du travail.

**La confidentialité n'est pas négociable :**
- Ne présentez les résultats que pour des groupes d'**au moins cinq personnes** (certaines organisations prennent 10). En dessous, regroupez les équipes.
- Ne demandez jamais de données qui permettraient d'identifier quelqu'un dans une petite équipe (âge exact, poste unique).
- Ne collectez pas d'informations de santé dans une enquête interne. Orientez plutôt vers un soutien confidentiel.
- Expliquez clairement qui voit quoi, et respectez la loi sur la protection des données (au Maroc, la loi 09-08 et la CNDP).

**Bouclez la boucle.** Partagez les résultats avec les équipes en quelques semaines, avec une ou deux actions concrètes. Une enquête sans suite visible abîme la confiance.

**Offrez un accès aux soins :** une voie confidentielle vers un psychologue, distincte de la hiérarchie. U.Psy accompagne les organisations sur ce point : [contactez-nous](/contact).

**Pour aller plus loin :** OMS (2022). *Lignes directrices de l'OMS sur la santé mentale au travail*. Edmondson, A. C. (1999). Psychological safety and learning behavior in work teams. *Administrative Science Quarterly*, 44(2), 350–383.$md$
FROM public.courses c WHERE c.slug = 'corporate-wellbeing-program-f5b30f'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 4);

UPDATE public.courses SET title = 'Leadership Psychology', title_fr = 'Psychologie du leadership', title_ar = 'علم نفس القيادة',
  description = 'Regulating yourself, holding difficult conversations, deciding under uncertainty and lasting in the role.', description_fr = 'Se réguler soi-même, mener des conversations difficiles, décider dans l''incertitude et durer dans le rôle.', description_ar = 'تنظيم الذات، إدارة المحادثات الصعبة، اتخاذ القرار في ظل عدم اليقين، والاستمرار في الدور.',
  difficulty_level = 'advanced', duration_hours = 0.7
WHERE slug = 'leadership-psychology-9aac9e';

UPDATE public.course_modules m SET title = 'Leading starts with self-regulation', title_fr = 'Diriger commence par se réguler', title_ar = 'القيادة تبدأ بتنظيم الذات', duration_minutes = 10,
  content = $md$Emotions spread within groups: research on **emotional contagion** shows that a leader's mood influences the mood and cooperation of the team (Barsade, 2002). A tense, reactive leader tends to produce a tense, cautious team.

Self-regulation does not mean hiding emotions. It means noticing them before they drive your behaviour, and choosing your response.

Practical tools:
- **Name the emotion** ("I'm frustrated"): labelling an emotion helps regulate it.
- **Create a pause** before reacting to bad news: a breath, "let me think and come back to you this afternoon".
- **Know your triggers**: which situations make you defensive, controlling or withdrawn?
- **Look after the basics**: sleep, physical activity, breaks. Leaders are not exempt from fatigue.

If you recognise strong, repetitive reactions (fear of failure, need for control, harsh self-criticism), the [schema therapy introduction](/learn) can help you understand where they come from.

**Exercise.** For one week, note each time you reacted more strongly than you wanted at work: the trigger, the emotion, what you did, and what you would like to do next time.$md$,
  content_fr = $md$Les émotions se propagent dans les groupes : les recherches sur la **contagion émotionnelle** montrent que l'humeur d'un responsable influence l'humeur et la coopération de l'équipe (Barsade, 2002). Un responsable tendu et réactif a tendance à produire une équipe tendue et prudente.

Se réguler ne veut pas dire cacher ses émotions. C'est les remarquer avant qu'elles ne dictent le comportement, et choisir sa réponse.

Outils concrets :
- **Nommer l'émotion** (« je suis frustré ») : mettre un mot sur une émotion aide à la réguler.
- **Créer une pause** avant de réagir à une mauvaise nouvelle : une respiration, « laisse-moi réfléchir, je reviens vers toi cet après-midi ».
- **Connaître ses déclencheurs** : quelles situations vous rendent défensif, contrôlant ou distant ?
- **Prendre soin des bases** : sommeil, activité physique, pauses. Les responsables ne sont pas exemptés de fatigue.

Si vous reconnaissez des réactions fortes et répétitives (peur de l'échec, besoin de contrôle, autocritique sévère), l'[introduction à la thérapie des schémas](/learn) peut vous aider à comprendre d'où elles viennent.

**Exercice.** Pendant une semaine, notez chaque fois que vous avez réagi plus fortement que vous ne l'auriez voulu au travail : le déclencheur, l'émotion, ce que vous avez fait, et ce que vous aimeriez faire la prochaine fois.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'leadership-psychology-9aac9e' AND m.order_index = 1;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 1, 'Leading starts with self-regulation', 'Diriger commence par se réguler', 'القيادة تبدأ بتنظيم الذات', 10, $md$Emotions spread within groups: research on **emotional contagion** shows that a leader's mood influences the mood and cooperation of the team (Barsade, 2002). A tense, reactive leader tends to produce a tense, cautious team.

Self-regulation does not mean hiding emotions. It means noticing them before they drive your behaviour, and choosing your response.

Practical tools:
- **Name the emotion** ("I'm frustrated"): labelling an emotion helps regulate it.
- **Create a pause** before reacting to bad news: a breath, "let me think and come back to you this afternoon".
- **Know your triggers**: which situations make you defensive, controlling or withdrawn?
- **Look after the basics**: sleep, physical activity, breaks. Leaders are not exempt from fatigue.

If you recognise strong, repetitive reactions (fear of failure, need for control, harsh self-criticism), the [schema therapy introduction](/learn) can help you understand where they come from.

**Exercise.** For one week, note each time you reacted more strongly than you wanted at work: the trigger, the emotion, what you did, and what you would like to do next time.$md$, $md$Les émotions se propagent dans les groupes : les recherches sur la **contagion émotionnelle** montrent que l'humeur d'un responsable influence l'humeur et la coopération de l'équipe (Barsade, 2002). Un responsable tendu et réactif a tendance à produire une équipe tendue et prudente.

Se réguler ne veut pas dire cacher ses émotions. C'est les remarquer avant qu'elles ne dictent le comportement, et choisir sa réponse.

Outils concrets :
- **Nommer l'émotion** (« je suis frustré ») : mettre un mot sur une émotion aide à la réguler.
- **Créer une pause** avant de réagir à une mauvaise nouvelle : une respiration, « laisse-moi réfléchir, je reviens vers toi cet après-midi ».
- **Connaître ses déclencheurs** : quelles situations vous rendent défensif, contrôlant ou distant ?
- **Prendre soin des bases** : sommeil, activité physique, pauses. Les responsables ne sont pas exemptés de fatigue.

Si vous reconnaissez des réactions fortes et répétitives (peur de l'échec, besoin de contrôle, autocritique sévère), l'[introduction à la thérapie des schémas](/learn) peut vous aider à comprendre d'où elles viennent.

**Exercice.** Pendant une semaine, notez chaque fois que vous avez réagi plus fortement que vous ne l'auriez voulu au travail : le déclencheur, l'émotion, ce que vous avez fait, et ce que vous aimeriez faire la prochaine fois.$md$
FROM public.courses c WHERE c.slug = 'leadership-psychology-9aac9e'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 1);

UPDATE public.course_modules m SET title = 'Difficult conversations', title_fr = 'Les conversations difficiles', title_ar = 'المحادثات الصعبة', duration_minutes = 12,
  content = $md$Most difficult conversations go wrong because we are trying to win an argument about the facts. Stone, Patton and Heen describe three conversations happening at once: **what happened**, **the feelings**, and **identity** (what this says about me).

A structure that helps:
1. **Prepare**: what is the specific behaviour? What is its impact? What outcome do you want, for the relationship as well as the task?
2. **Open with intent**: "I want us to keep working well together, and something needs addressing."
3. **Describe facts, not character**: "the report was submitted two days late, twice this month", not "you're unreliable".
4. **State the impact** and how you feel.
5. **Ask for their view**, and listen to understand, not to reply.
6. **Agree a next step** and a follow-up date.

The [DEAR MAN worksheet](/resources/dear-man-script) and [I-statements](/resources/i-statements) are useful preparation tools.

**Exercise.** Choose a conversation you have been postponing. Prepare it using the six steps, then hold it this week.$md$,
  content_fr = $md$La plupart des conversations difficiles échouent parce qu'on cherche à gagner un débat sur les faits. Stone, Patton et Heen décrivent trois conversations qui se déroulent en même temps : **ce qui s'est passé**, **les émotions**, et **l'identité** (ce que cela dit de moi).

Une structure qui aide :
1. **Préparer** : quel est le comportement précis ? Quel est son impact ? Quel résultat voulez-vous, pour la relation autant que pour la tâche ?
2. **Ouvrir sur l'intention** : « je veux qu'on continue à bien travailler ensemble, et il y a un point à régler ».
3. **Décrire des faits, pas une personnalité** : « le rapport a été rendu avec deux jours de retard, deux fois ce mois-ci », pas « tu n'es pas fiable ».
4. **Dire l'impact** et ce que vous ressentez.
5. **Demander son point de vue**, et écouter pour comprendre, pas pour répondre.
6. **Convenir d'une prochaine étape** et d'une date de suivi.

La [fiche DEAR MAN](/resources/dear-man-script) et les [messages « je »](/resources/i-statements) sont utiles pour se préparer.

**Exercice.** Choisissez une conversation que vous repoussez. Préparez-la avec les six étapes, puis menez-la cette semaine.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'leadership-psychology-9aac9e' AND m.order_index = 2;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 2, 'Difficult conversations', 'Les conversations difficiles', 'المحادثات الصعبة', 12, $md$Most difficult conversations go wrong because we are trying to win an argument about the facts. Stone, Patton and Heen describe three conversations happening at once: **what happened**, **the feelings**, and **identity** (what this says about me).

A structure that helps:
1. **Prepare**: what is the specific behaviour? What is its impact? What outcome do you want, for the relationship as well as the task?
2. **Open with intent**: "I want us to keep working well together, and something needs addressing."
3. **Describe facts, not character**: "the report was submitted two days late, twice this month", not "you're unreliable".
4. **State the impact** and how you feel.
5. **Ask for their view**, and listen to understand, not to reply.
6. **Agree a next step** and a follow-up date.

The [DEAR MAN worksheet](/resources/dear-man-script) and [I-statements](/resources/i-statements) are useful preparation tools.

**Exercise.** Choose a conversation you have been postponing. Prepare it using the six steps, then hold it this week.$md$, $md$La plupart des conversations difficiles échouent parce qu'on cherche à gagner un débat sur les faits. Stone, Patton et Heen décrivent trois conversations qui se déroulent en même temps : **ce qui s'est passé**, **les émotions**, et **l'identité** (ce que cela dit de moi).

Une structure qui aide :
1. **Préparer** : quel est le comportement précis ? Quel est son impact ? Quel résultat voulez-vous, pour la relation autant que pour la tâche ?
2. **Ouvrir sur l'intention** : « je veux qu'on continue à bien travailler ensemble, et il y a un point à régler ».
3. **Décrire des faits, pas une personnalité** : « le rapport a été rendu avec deux jours de retard, deux fois ce mois-ci », pas « tu n'es pas fiable ».
4. **Dire l'impact** et ce que vous ressentez.
5. **Demander son point de vue**, et écouter pour comprendre, pas pour répondre.
6. **Convenir d'une prochaine étape** et d'une date de suivi.

La [fiche DEAR MAN](/resources/dear-man-script) et les [messages « je »](/resources/i-statements) sont utiles pour se préparer.

**Exercice.** Choisissez une conversation que vous repoussez. Préparez-la avec les six étapes, puis menez-la cette semaine.$md$
FROM public.courses c WHERE c.slug = 'leadership-psychology-9aac9e'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 2);

UPDATE public.course_modules m SET title = 'Deciding under uncertainty', title_fr = 'Décider dans l''incertitude', title_ar = 'اتخاذ القرار في ظل عدم اليقين', duration_minutes = 12,
  content = $md$A good decision can have a bad outcome, and a bad decision can turn out well. Judging decisions only by their results ("resulting") leads to learning the wrong lessons. Evaluate the **process**: the information available, the options considered, the reasoning.

Practical tools:
- **Sort by reversibility**: decide reversible decisions quickly; slow down for those that are hard to undo.
- **Pre-mortem** (Klein, 2007): before deciding, imagine it is a year later and the project has failed. Each person writes why. This surfaces risks people hesitate to mention.
- **Consider the opposite**: what would have to be true for the other option to be better?
- **Separate opinions before discussion**: ask people to write their view before the meeting, to limit the influence of the most senior voice.
- **Write it down**: the decision, the reasons, what you expect. Review it later.

Anxiety pushes towards either rushing or endless postponing. Naming that anxiety helps you choose the pace deliberately.

**Exercise.** Run a 15-minute pre-mortem on your next significant decision.$md$,
  content_fr = $md$Une bonne décision peut avoir une mauvaise issue, et une mauvaise décision peut bien tourner. Juger les décisions uniquement à leurs résultats conduit à tirer les mauvaises leçons. Évaluez le **processus** : les informations disponibles, les options envisagées, le raisonnement.

Outils concrets :
- **Trier selon la réversibilité** : décider vite ce qui est réversible ; ralentir pour ce qui est difficile à défaire.
- **Pré-mortem** (Klein, 2007) : avant de décider, imaginez qu'un an a passé et que le projet a échoué. Chacun écrit pourquoi. Cela fait émerger des risques que les gens hésitent à évoquer.
- **Envisager l'inverse** : que faudrait-il pour que l'autre option soit meilleure ?
- **Recueillir les avis avant la discussion** : demandez à chacun d'écrire son point de vue avant la réunion, pour limiter l'influence de la voix la plus haut placée.
- **Écrire** : la décision, ses raisons, ce que vous attendez. Relisez-la plus tard.

L'anxiété pousse soit à se précipiter, soit à repousser sans fin. La nommer aide à choisir le rythme délibérément.

**Exercice.** Faites un pré-mortem de 15 minutes sur votre prochaine décision importante.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'leadership-psychology-9aac9e' AND m.order_index = 3;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 3, 'Deciding under uncertainty', 'Décider dans l''incertitude', 'اتخاذ القرار في ظل عدم اليقين', 12, $md$A good decision can have a bad outcome, and a bad decision can turn out well. Judging decisions only by their results ("resulting") leads to learning the wrong lessons. Evaluate the **process**: the information available, the options considered, the reasoning.

Practical tools:
- **Sort by reversibility**: decide reversible decisions quickly; slow down for those that are hard to undo.
- **Pre-mortem** (Klein, 2007): before deciding, imagine it is a year later and the project has failed. Each person writes why. This surfaces risks people hesitate to mention.
- **Consider the opposite**: what would have to be true for the other option to be better?
- **Separate opinions before discussion**: ask people to write their view before the meeting, to limit the influence of the most senior voice.
- **Write it down**: the decision, the reasons, what you expect. Review it later.

Anxiety pushes towards either rushing or endless postponing. Naming that anxiety helps you choose the pace deliberately.

**Exercise.** Run a 15-minute pre-mortem on your next significant decision.$md$, $md$Une bonne décision peut avoir une mauvaise issue, et une mauvaise décision peut bien tourner. Juger les décisions uniquement à leurs résultats conduit à tirer les mauvaises leçons. Évaluez le **processus** : les informations disponibles, les options envisagées, le raisonnement.

Outils concrets :
- **Trier selon la réversibilité** : décider vite ce qui est réversible ; ralentir pour ce qui est difficile à défaire.
- **Pré-mortem** (Klein, 2007) : avant de décider, imaginez qu'un an a passé et que le projet a échoué. Chacun écrit pourquoi. Cela fait émerger des risques que les gens hésitent à évoquer.
- **Envisager l'inverse** : que faudrait-il pour que l'autre option soit meilleure ?
- **Recueillir les avis avant la discussion** : demandez à chacun d'écrire son point de vue avant la réunion, pour limiter l'influence de la voix la plus haut placée.
- **Écrire** : la décision, ses raisons, ce que vous attendez. Relisez-la plus tard.

L'anxiété pousse soit à se précipiter, soit à repousser sans fin. La nommer aide à choisir le rythme délibérément.

**Exercice.** Faites un pré-mortem de 15 minutes sur votre prochaine décision importante.$md$
FROM public.courses c WHERE c.slug = 'leadership-psychology-9aac9e'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 3);

UPDATE public.course_modules m SET title = 'Lasting in the role', title_fr = 'Durer dans le rôle', title_ar = 'الاستمرار في الدور', duration_minutes = 10,
  content = $md$Leadership roles bring specific pressures: isolation, responsibility for others, constant visibility, decisions without clear answers. Many leaders hide their difficulties because they feel they must appear solid.

Protective habits:
- **Peers outside your organisation** with whom you can speak freely.
- **Supervision, coaching or therapy**: a space where you are not the one in charge.
- **One activity unrelated to performance**: something you do for pleasure, not to be good at it.
- **Clear boundaries** between work and private life, modelled for the team as well.
- **Regular review** of your energy: what drains you, what restores you?

Watch for the [warning signs of burnout](/learn): exhaustion, cynicism, the feeling of no longer being effective. Asking for help early is a leadership skill, not a weakness.

If you are struggling, [a psychologist](/psychologists) can offer a confidential space.

**Further reading:** Barsade, S. G. (2002). The ripple effect: emotional contagion and its influence on group behavior. *Administrative Science Quarterly*, 47(4), 644–675. Stone, D., Patton, B., & Heen, S. (2010). *Difficult Conversations* (2nd ed.). Penguin. Klein, G. (2007). Performing a project premortem. *Harvard Business Review*, 85(9), 18–19.$md$,
  content_fr = $md$Les fonctions de direction comportent des pressions particulières : isolement, responsabilité envers les autres, visibilité permanente, décisions sans réponse évidente. Beaucoup de responsables cachent leurs difficultés parce qu'ils pensent devoir paraître solides.

Habitudes protectrices :
- **Des pairs hors de votre organisation**, avec qui parler librement.
- **Supervision, coaching ou thérapie** : un espace où ce n'est pas vous qui dirigez.
- **Une activité sans enjeu de performance** : quelque chose que vous faites pour le plaisir, pas pour y exceller.
- **Des limites claires** entre travail et vie privée, montrées en exemple à l'équipe.
- **Un bilan régulier** de votre énergie : qu'est-ce qui vous épuise, qu'est-ce qui vous ressource ?

Surveillez les [signaux d'alerte de l'épuisement](/learn) : épuisement, cynisme, sentiment de ne plus être efficace. Demander de l'aide tôt est une compétence de leader, pas une faiblesse.

Si vous traversez une période difficile, [un psychologue](/psychologists) peut vous offrir un espace confidentiel.

**Pour aller plus loin :** Barsade, S. G. (2002). The ripple effect: emotional contagion and its influence on group behavior. *Administrative Science Quarterly*, 47(4), 644–675. Stone, D., Patton, B., & Heen, S. (2010). *Difficult Conversations* (2nd ed.). Penguin. Klein, G. (2007). Performing a project premortem. *Harvard Business Review*, 85(9), 18–19.$md$
FROM public.courses c WHERE c.id = m.course_id AND c.slug = 'leadership-psychology-9aac9e' AND m.order_index = 4;

INSERT INTO public.course_modules (course_id, order_index, title, title_fr, title_ar, duration_minutes, content, content_fr)
SELECT c.id, 4, 'Lasting in the role', 'Durer dans le rôle', 'الاستمرار في الدور', 10, $md$Leadership roles bring specific pressures: isolation, responsibility for others, constant visibility, decisions without clear answers. Many leaders hide their difficulties because they feel they must appear solid.

Protective habits:
- **Peers outside your organisation** with whom you can speak freely.
- **Supervision, coaching or therapy**: a space where you are not the one in charge.
- **One activity unrelated to performance**: something you do for pleasure, not to be good at it.
- **Clear boundaries** between work and private life, modelled for the team as well.
- **Regular review** of your energy: what drains you, what restores you?

Watch for the [warning signs of burnout](/learn): exhaustion, cynicism, the feeling of no longer being effective. Asking for help early is a leadership skill, not a weakness.

If you are struggling, [a psychologist](/psychologists) can offer a confidential space.

**Further reading:** Barsade, S. G. (2002). The ripple effect: emotional contagion and its influence on group behavior. *Administrative Science Quarterly*, 47(4), 644–675. Stone, D., Patton, B., & Heen, S. (2010). *Difficult Conversations* (2nd ed.). Penguin. Klein, G. (2007). Performing a project premortem. *Harvard Business Review*, 85(9), 18–19.$md$, $md$Les fonctions de direction comportent des pressions particulières : isolement, responsabilité envers les autres, visibilité permanente, décisions sans réponse évidente. Beaucoup de responsables cachent leurs difficultés parce qu'ils pensent devoir paraître solides.

Habitudes protectrices :
- **Des pairs hors de votre organisation**, avec qui parler librement.
- **Supervision, coaching ou thérapie** : un espace où ce n'est pas vous qui dirigez.
- **Une activité sans enjeu de performance** : quelque chose que vous faites pour le plaisir, pas pour y exceller.
- **Des limites claires** entre travail et vie privée, montrées en exemple à l'équipe.
- **Un bilan régulier** de votre énergie : qu'est-ce qui vous épuise, qu'est-ce qui vous ressource ?

Surveillez les [signaux d'alerte de l'épuisement](/learn) : épuisement, cynisme, sentiment de ne plus être efficace. Demander de l'aide tôt est une compétence de leader, pas une faiblesse.

Si vous traversez une période difficile, [un psychologue](/psychologists) peut vous offrir un espace confidentiel.

**Pour aller plus loin :** Barsade, S. G. (2002). The ripple effect: emotional contagion and its influence on group behavior. *Administrative Science Quarterly*, 47(4), 644–675. Stone, D., Patton, B., & Heen, S. (2010). *Difficult Conversations* (2nd ed.). Penguin. Klein, G. (2007). Performing a project premortem. *Harvard Business Review*, 85(9), 18–19.$md$
FROM public.courses c WHERE c.slug = 'leadership-psychology-9aac9e'
  AND NOT EXISTS (SELECT 1 FROM public.course_modules x WHERE x.course_id = c.id AND x.order_index = 4);
