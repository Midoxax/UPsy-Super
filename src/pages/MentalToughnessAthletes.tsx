import { Link } from "@/lib/router-compat";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Timer,
  Wind,
  Brain,
  Trophy,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const PILLAR_ICONS = [Wind, Brain, RefreshCw, Trophy, Timer, ShieldCheck];

const COPY = {
  en: {
    quotes: ["“", "”"],
    seoTitle:
      "Mental Toughness for Athletes — Beat Competition Nerves & Overthinking | U.Psy",
    seoDescription:
      "Stop overthinking before competition. Train mental toughness, nerve regulation, and focus with sport psychologists. Assessments, protocols, 1:1 coaching.",
    eyebrow: "Sport Psychology · Performance System",
    title: "You train the body every day.",
    titleEm: "Train the mind that runs it.",
    sub: "Competition nerves, overthinking, freezing when it matters — these are not personality flaws. They are trainable patterns. U.Psy pairs athletes with sport psychologists and measured protocols that hold up on match day.",
    ctaScore: "Get your free Mental Performance Score",
    ctaBook: "Book a sport psychologist",
    meta: "12 questions · 2 minutes · free rebook if not the right fit",
    signalsEyebrow: "Signals we hear",
    signalsTitle: "Any of this sound familiar?",
    signals: [
      "I'm fine in training — I fall apart in competition.",
      "The night before a match I can't stop replaying what could go wrong.",
      "One mistake and my head is gone for the rest of the game.",
      "I overthink every movement and lose the instinct I have in practice.",
      "Since the injury, my body hesitates even though I'm cleared to play.",
      "I've plateaued. Technically I'm ready, mentally something is capping me.",
    ],
    pillarsTitle: "Six systems we train",
    pillarsSub:
      "Assessment shows which two or three matter for you right now. No generic mindset talks — every protocol is measured, sport-specific, and reviewed every four weeks.",
    pillars: [
      {
        title: "Nerve Regulation",
        desc: "Nasal breathing, exhale extension, and pre-performance rituals that shift the nervous system out of threat before you compete.",
      },
      {
        title: "Attention Anchors",
        desc: "One or two process cues you own — so the mind cannot spiral to outcome, judgement, or the scoreboard mid-play.",
      },
      {
        title: "Reset Windows",
        desc: "A defined 5–10 second protocol between plays that interrupts rumination physically before it entrenches.",
      },
      {
        title: "Confidence Architecture",
        desc: "Evidence-based self-belief built from measured wins and reviewed film — not affirmations, not vibes.",
      },
      {
        title: "Recovery Load",
        desc: "Sleep, downtime, and nervous-system recovery treated as training. The multiplier under every other skill.",
      },
      {
        title: "Return-from-Injury",
        desc: "Graded exposure, imagery rehearsal, and confidence rebuilds so hesitation and re-injury fear do not linger in the body.",
      },
    ],
    methodEyebrow: "The method",
    methodTitle: "Measure. Regulate. Refocus. Repeat.",
    method: [
      {
        t: "Measure",
        d: "Baseline nerves, focus, confidence, and recovery in under 15 minutes.",
      },
      {
        t: "Regulate",
        d: "Breath and physiology protocols that shift the nervous system on demand.",
      },
      {
        t: "Refocus",
        d: "Attention anchors, reset windows, and sport-specific cue words trained daily.",
      },
      {
        t: "Repeat",
        d: "8–12 week arcs with weekly 1:1 sessions and monthly re-measurement.",
      },
    ],
    faqTitle: "What athletes ask before starting",
    faq: [
      {
        q: "How do I stop overthinking before a competition?",
        a: "Overthinking is a signal that your attention has drifted from the process to the outcome. The fix is not to think less — it is to think about the right thing. Anchor to one or two performance cues you control (breath, first movement, tempo). When the mind spirals to results, name the thought ('outcome thought'), exhale, and return to the cue. Trained daily, it becomes automatic.",
      },
      {
        q: "Why do I get nervous or freeze in competition when I'm fine in training?",
        a: "Training loads your body; competition loads your identity. When self-worth is on the line, the nervous system tilts toward threat and pulls resources from fine motor control and decision-making. The solution combines physiology (slow exhale, 6-second out-breath) and cognition (values-based pre-performance script). This is trainable in 6–8 sessions.",
      },
      {
        q: "How do I build real mental toughness as an athlete?",
        a: "Mental toughness is not grit under punishment — it is the trained capacity to regulate, refocus, and re-engage under load. Four pillars: confidence built from evidence (not affirmations), concentration held on process cues, control of physiology through breath, and commitment to values that survive bad days. Toughness without recovery becomes burnout.",
      },
      {
        q: "What is the best pre-competition routine to calm nerves?",
        a: "A repeatable 10-minute sequence beats any single technique: 3 minutes of nasal breathing at 6 breaths/min, 3 minutes of movement rehearsal with eyes closed, 2 minutes of a self-selected cue word or trigger phrase, and 2 minutes of the first competitive action at low intensity. Same sequence every time — the ritual itself becomes a down-regulation signal.",
      },
      {
        q: "How do I stop replaying mistakes during a game or match?",
        a: "Elite athletes use a 'reset window' — a defined 5- to 10-second protocol between plays: physical trigger (touch wristband, adjust cap), one deep exhale, one process cue, then re-engage. The trigger interrupts rumination physically before it entrenches. Trained in 3–4 sessions, applied for a season.",
      },
      {
        q: "How do I come back mentally strong after an injury?",
        a: "Physical recovery is only half. Athletes returning from injury commonly carry re-injury fear, identity loss, and confidence gaps that show up as hesitation or over-caution. A structured 8–12 week protocol combines graded exposure to competitive cues, imagery rehearsal, self-talk restructuring, and confidence rebuilding around small measurable wins.",
      },
      {
        q: "Do I need a sport psychologist or a mental performance coach?",
        a: "A sport psychologist is a licensed clinician who can also treat anxiety, depression, eating issues, and trauma common in athlete populations. A mental performance coach trains healthy athletes to perform better — no clinical scope. If nerves are affecting daily life beyond sport, choose the psychologist. If it is purely performance, either works. U.Psy routes you to the right specialist.",
      },
      {
        q: "How long does it take to see results?",
        a: "Pre-competition nerves and overthinking often respond within 3–5 sessions. Deeper shifts in confidence and identity take 8–12 weeks. A full competitive season is the standard arc for lasting change. We re-measure every 4 weeks so progress is visible, not just felt.",
      },
    ],
    ctaTitle: "See your baseline in",
    ctaTitleEm: "2 minutes.",
    ctaSub:
      "Free, private, no card. Get a Mental Performance Score and a next-step protocol built for your sport.",
    ctaStart: "Start free assessment",
    ctaMeet: "Meet the sport psychologists",
  },
  fr: {
    quotes: ["« ", " »"],
    seoTitle:
      "Force mentale du sportif : vaincre le stress de compétition et la rumination | U.Psy",
    seoDescription:
      "Arrêtez de trop penser avant la compétition. Travaillez la force mentale, la gestion du stress et la concentration avec des psychologues du sport. Évaluations, protocoles, séances individuelles.",
    eyebrow: "Psychologie du sport · Système de performance",
    title: "Vous entraînez le corps chaque jour.",
    titleEm: "Entraînez la tête qui le dirige.",
    sub: "Le stress de compétition, la rumination, le blocage au moment décisif : ce ne sont pas des défauts de caractère, ce sont des schémas qui s'entraînent. U.Psy associe les sportifs à des psychologues du sport et à des protocoles mesurés qui tiennent le jour du match.",
    ctaScore: "Faire mon score de performance mentale gratuit",
    ctaBook: "Réserver un psychologue du sport",
    meta: "12 questions · 2 minutes · nouvelle séance offerte si le courant ne passe pas",
    signalsEyebrow: "Ce que nous entendons",
    signalsTitle: "Cela vous parle ?",
    signals: [
      "À l'entraînement ça va, en compétition je m'effondre.",
      "La veille d'un match, je n'arrête pas d'imaginer ce qui pourrait mal tourner.",
      "Une erreur et ma tête est partie pour le reste du match.",
      "Je réfléchis à chaque geste et je perds l'instinct que j'ai à l'entraînement.",
      "Depuis la blessure, mon corps hésite alors que j'ai le feu vert pour jouer.",
      "Je stagne. Techniquement je suis prêt, mentalement quelque chose me bride.",
    ],
    pillarsTitle: "Six systèmes que nous entraînons",
    pillarsSub:
      "L'évaluation montre les deux ou trois qui comptent pour vous maintenant. Pas de discours motivationnel générique : chaque protocole est mesuré, adapté à votre sport et revu toutes les quatre semaines.",
    pillars: [
      {
        title: "Régulation du stress",
        desc: "Respiration nasale, expiration allongée et rituels de pré-performance qui sortent le système nerveux du mode menace avant la compétition.",
      },
      {
        title: "Ancres d'attention",
        desc: "Un ou deux repères de processus qui vous appartiennent, pour que l'esprit ne parte pas vers le résultat, le jugement ou le tableau d'affichage en plein jeu.",
      },
      {
        title: "Fenêtres de réinitialisation",
        desc: "Un protocole défini de 5 à 10 secondes entre deux actions, qui coupe physiquement la rumination avant qu'elle s'installe.",
      },
      {
        title: "Architecture de la confiance",
        desc: "Une confiance fondée sur des preuves, construite à partir de réussites mesurées et de vidéos analysées, pas sur des affirmations.",
      },
      {
        title: "Charge de récupération",
        desc: "Sommeil, temps de repos et récupération du système nerveux traités comme de l'entraînement : le multiplicateur de toutes les autres compétences.",
      },
      {
        title: "Retour de blessure",
        desc: "Exposition progressive, imagerie mentale et reconstruction de la confiance pour que l'hésitation et la peur de se reblesser ne restent pas dans le corps.",
      },
    ],
    methodEyebrow: "La méthode",
    methodTitle: "Mesurer. Réguler. Recentrer. Répéter.",
    method: [
      {
        t: "Mesurer",
        d: "Point de départ sur le stress, la concentration, la confiance et la récupération, en moins de 15 minutes.",
      },
      {
        t: "Réguler",
        d: "Protocoles de respiration et de physiologie pour apaiser le système nerveux à la demande.",
      },
      {
        t: "Recentrer",
        d: "Ancres d'attention, fenêtres de réinitialisation et mots-repères propres à votre sport, travaillés chaque jour.",
      },
      {
        t: "Répéter",
        d: "Cycles de 8 à 12 semaines, séances individuelles hebdomadaires et nouvelle mesure chaque mois.",
      },
    ],
    faqTitle: "Ce que les sportifs demandent avant de commencer",
    faq: [
      {
        q: "Comment arrêter de trop penser avant une compétition ?",
        a: "Trop penser signale que votre attention est passée du processus au résultat. La solution n'est pas de penser moins, mais de penser à la bonne chose. Ancrez-vous sur un ou deux repères que vous contrôlez (respiration, premier geste, tempo). Quand l'esprit part vers le résultat, nommez la pensée (« pensée de résultat »), expirez et revenez au repère. Entraîné chaque jour, cela devient automatique.",
      },
      {
        q: "Pourquoi je stresse ou je bloque en compétition alors que tout va bien à l'entraînement ?",
        a: "L'entraînement sollicite votre corps, la compétition sollicite votre identité. Quand l'estime de soi est en jeu, le système nerveux bascule vers la menace et prend des ressources à la motricité fine et à la prise de décision. La solution combine la physiologie (expiration lente de 6 secondes) et la cognition (script de pré-performance fondé sur vos valeurs). Cela se travaille en 6 à 8 séances.",
      },
      {
        q: "Comment développer une vraie force mentale de sportif ?",
        a: "La force mentale n'est pas l'endurance à la souffrance : c'est la capacité entraînée à se réguler, se recentrer et se réengager sous la charge. Quatre piliers : une confiance fondée sur des preuves (pas sur des affirmations), une concentration tenue sur des repères de processus, le contrôle de la physiologie par la respiration et un engagement envers des valeurs qui résistent aux mauvais jours. Sans récupération, la force mentale mène à l'épuisement.",
      },
      {
        q: "Quelle est la meilleure routine d'avant-compétition pour calmer le stress ?",
        a: "Une séquence de 10 minutes répétable vaut mieux que n'importe quelle technique isolée : 3 minutes de respiration nasale à 6 respirations par minute, 3 minutes de répétition du geste les yeux fermés, 2 minutes sur un mot-repère choisi, et 2 minutes de la première action de compétition à faible intensité. La même séquence à chaque fois : le rituel lui-même devient un signal d'apaisement.",
      },
      {
        q: "Comment arrêter de ressasser mes erreurs pendant un match ?",
        a: "Les sportifs de haut niveau utilisent une « fenêtre de réinitialisation », un protocole défini de 5 à 10 secondes entre deux actions : un déclencheur physique (toucher son bracelet, ajuster sa casquette), une expiration profonde, un repère de processus, puis on repart. Le déclencheur coupe physiquement la rumination avant qu'elle s'installe. Travaillé en 3 ou 4 séances, appliqué toute une saison.",
      },
      {
        q: "Comment revenir mentalement fort après une blessure ?",
        a: "La récupération physique n'est que la moitié du chemin. Les sportifs qui reviennent de blessure portent souvent la peur de se reblesser, une perte d'identité et un manque de confiance qui se traduisent par de l'hésitation ou un excès de prudence. Un protocole structuré de 8 à 12 semaines combine exposition progressive aux situations de compétition, imagerie mentale, travail sur le discours intérieur et reconstruction de la confiance autour de petites réussites mesurables.",
      },
      {
        q: "Ai-je besoin d'un psychologue du sport ou d'un préparateur mental ?",
        a: "Le psychologue du sport est un clinicien diplômé qui peut aussi prendre en charge l'anxiété, la dépression, les troubles alimentaires et les traumatismes fréquents chez les sportifs. Le préparateur mental entraîne des sportifs en bonne santé à mieux performer, sans dimension clinique. Si le stress déborde sur votre vie quotidienne, choisissez le psychologue. Si c'est uniquement la performance, les deux conviennent. U.Psy vous oriente vers le bon spécialiste.",
      },
      {
        q: "Combien de temps faut-il pour voir des résultats ?",
        a: "Le stress d'avant-compétition et la rumination répondent souvent en 3 à 5 séances. Les changements plus profonds de confiance et d'identité prennent 8 à 12 semaines. Une saison complète est le cycle habituel pour un changement durable. Nous mesurons à nouveau toutes les 4 semaines pour que les progrès se voient, pas seulement qu'ils se ressentent.",
      },
    ],
    ctaTitle: "Votre point de départ en",
    ctaTitleEm: "2 minutes.",
    ctaSub:
      "Gratuit, confidentiel, sans carte bancaire. Obtenez votre score de performance mentale et un protocole adapté à votre sport.",
    ctaStart: "Commencer l'évaluation gratuite",
    ctaMeet: "Voir les psychologues du sport",
  },
  ar: {
    quotes: ["«", "»"],
    seoTitle:
      "الصلابة الذهنية للرياضيين: تغلّب على توتر المنافسة والإفراط في التفكير | U.Psy",
    seoDescription:
      "توقف عن الإفراط في التفكير قبل المنافسة. درّب الصلابة الذهنية وتدبير التوتر والتركيز مع أخصائيين نفسيين رياضيين. تقييمات، بروتوكولات، جلسات فردية.",
    eyebrow: "علم النفس الرياضي · نظام الأداء",
    title: "تدرّب جسدك كل يوم.",
    titleEm: "درّب الذهن الذي يقوده.",
    sub: "توتر المنافسة، الإفراط في التفكير، التجمد في اللحظة الحاسمة: ليست عيوباً في الشخصية، بل أنماط قابلة للتدريب. تربط U.Psy الرياضيين بأخصائيين نفسيين رياضيين وبروتوكولات مقيسة تصمد يوم المباراة.",
    ctaScore: "احصل على مؤشر أدائك الذهني مجاناً",
    ctaBook: "احجز أخصائياً نفسياً رياضياً",
    meta: "12 سؤالاً · دقيقتان · جلسة بديلة مجاناً إن لم يكن الاختيار مناسباً",
    signalsEyebrow: "ما نسمعه",
    signalsTitle: "هل يبدو هذا مألوفاً؟",
    signals: [
      "في التدريب أكون بخير، وفي المنافسة أنهار.",
      "في الليلة السابقة للمباراة لا أتوقف عن تخيل ما قد يسوء.",
      "خطأ واحد ويضيع تركيزي طوال المباراة.",
      "أفكر في كل حركة فأفقد الحدس الذي أملكه في التدريب.",
      "منذ الإصابة يتردد جسدي رغم أنني حصلت على الإذن باللعب.",
      "وصلت إلى سقف. تقنياً أنا جاهز، لكن شيئاً ذهنياً يكبحني.",
    ],
    pillarsTitle: "ستة أنظمة ندرّبها",
    pillarsSub:
      "يبيّن التقييم أيها الأهم لك الآن. لا خطابات تحفيزية عامة: كل بروتوكول مقيس، خاص برياضتك، ويُراجَع كل أربعة أسابيع.",
    pillars: [
      {
        title: "تنظيم التوتر",
        desc: "تنفس أنفي، إطالة الزفير وطقوس ما قبل الأداء تُخرج الجهاز العصبي من وضع التهديد قبل المنافسة.",
      },
      {
        title: "مراسي الانتباه",
        desc: "إشارة أو اثنتان من مسار الأداء تملكهما، حتى لا ينجرف الذهن نحو النتيجة أو الحكم أو لوحة النتائج أثناء اللعب.",
      },
      {
        title: "نوافذ إعادة الضبط",
        desc: "بروتوكول محدد من 5 إلى 10 ثوانٍ بين الحركات يقطع الاجترار جسدياً قبل أن يترسخ.",
      },
      {
        title: "بناء الثقة",
        desc: "ثقة قائمة على الأدلة، تُبنى من إنجازات مقيسة وتحليل الفيديو، لا من العبارات التحفيزية.",
      },
      {
        title: "حمل الاسترجاع",
        desc: "النوم والراحة واسترجاع الجهاز العصبي تُعامل كتدريب: المضاعِف تحت كل مهارة أخرى.",
      },
      {
        title: "العودة بعد الإصابة",
        desc: "تعرّض تدريجي، تخيّل ذهني وإعادة بناء الثقة حتى لا يبقى التردد والخوف من الإصابة مجدداً في الجسد.",
      },
    ],
    methodEyebrow: "المنهج",
    methodTitle: "قِس. نظّم. أعد التركيز. كرّر.",
    method: [
      {
        t: "قِس",
        d: "قياس أولي للتوتر والتركيز والثقة والاسترجاع في أقل من 15 دقيقة.",
      },
      {
        t: "نظّم",
        d: "بروتوكولات للتنفس والفيزيولوجيا تهدّئ الجهاز العصبي عند الحاجة.",
      },
      {
        t: "أعد التركيز",
        d: "مراسي الانتباه، نوافذ إعادة الضبط وكلمات مفتاحية خاصة برياضتك تُدرَّب يومياً.",
      },
      {
        t: "كرّر",
        d: "دورات من 8 إلى 12 أسبوعاً بجلسات فردية أسبوعية وقياس جديد كل شهر.",
      },
    ],
    faqTitle: "ما يسأله الرياضيون قبل البدء",
    faq: [
      {
        q: "كيف أتوقف عن الإفراط في التفكير قبل المنافسة؟",
        a: "الإفراط في التفكير يعني أن انتباهك انتقل من المسار إلى النتيجة. الحل ليس أن تفكر أقل، بل أن تفكر في الشيء الصحيح. ارتكز على إشارة أو اثنتين تتحكم فيهما (التنفس، الحركة الأولى، الإيقاع). عندما ينجرف الذهن نحو النتيجة، سمِّ الفكرة («فكرة نتيجة»)، ازفر، وعد إلى الإشارة. مع التدريب اليومي يصبح ذلك تلقائياً.",
      },
      {
        q: "لماذا أتوتر أو أتجمد في المنافسة بينما أكون بخير في التدريب؟",
        a: "التدريب يحمّل جسدك، والمنافسة تحمّل هويتك. حين تكون قيمتك الذاتية على المحك، يميل الجهاز العصبي نحو التهديد ويسحب الموارد من الحركات الدقيقة واتخاذ القرار. يجمع الحل بين الفيزيولوجيا (زفير بطيء لمدة 6 ثوانٍ) والمعرفة (نص ما قبل الأداء قائم على قيمك). يمكن تدريب ذلك في 6 إلى 8 جلسات.",
      },
      {
        q: "كيف أبني صلابة ذهنية حقيقية كرياضي؟",
        a: "الصلابة الذهنية ليست تحمّل المعاناة، بل القدرة المدرَّبة على التنظيم وإعادة التركيز والعودة تحت الضغط. أربع ركائز: ثقة مبنية على الأدلة، تركيز على إشارات المسار، التحكم في الفيزيولوجيا بالتنفس، والالتزام بقيم تصمد في الأيام السيئة. الصلابة دون استرجاع تقود إلى الإنهاك.",
      },
      {
        q: "ما أفضل روتين قبل المنافسة لتهدئة التوتر؟",
        a: "تسلسل متكرر من 10 دقائق أفضل من أي تقنية منفردة: 3 دقائق من التنفس الأنفي بمعدل 6 أنفاس في الدقيقة، 3 دقائق من تكرار الحركة بعينين مغمضتين، دقيقتان على كلمة مفتاحية تختارها، ودقيقتان من أول حركة تنافسية بشدة منخفضة. نفس التسلسل كل مرة: يصبح الطقس نفسه إشارة تهدئة.",
      },
      {
        q: "كيف أتوقف عن اجترار أخطائي أثناء المباراة؟",
        a: "يستعمل رياضيو النخبة «نافذة إعادة الضبط»، بروتوكولاً من 5 إلى 10 ثوانٍ بين الحركات: محفز جسدي (لمس السوار، تعديل القبعة)، زفير عميق، إشارة من المسار، ثم العودة. يقطع المحفز الاجترار جسدياً قبل أن يترسخ. يُدرَّب في 3 أو 4 جلسات ويُطبَّق طوال الموسم.",
      },
      {
        q: "كيف أعود قوياً ذهنياً بعد إصابة؟",
        a: "الاسترجاع البدني نصف الطريق فقط. يحمل الرياضيون العائدون من الإصابة غالباً خوفاً من تكرارها، وفقداناً للهوية، ونقصاً في الثقة يظهر كتردد أو حذر مفرط. يجمع بروتوكول منظم من 8 إلى 12 أسبوعاً بين التعرض التدريجي لمواقف المنافسة، التخيل الذهني، إعادة بناء الحديث الداخلي، واستعادة الثقة حول إنجازات صغيرة مقيسة.",
      },
      {
        q: "هل أحتاج أخصائياً نفسياً رياضياً أم مدرب أداء ذهني؟",
        a: "الأخصائي النفسي الرياضي ممارس سريري مؤهل يمكنه أيضاً علاج القلق والاكتئاب واضطرابات الأكل والصدمات الشائعة لدى الرياضيين. مدرب الأداء الذهني يدرّب رياضيين أصحاء على أداء أفضل، دون بعد سريري. إذا امتد التوتر إلى حياتك اليومية، اختر الأخصائي النفسي. وإن كان الأمر متعلقاً بالأداء فقط، فكلاهما مناسب. توجهك U.Psy إلى المختص المناسب.",
      },
      {
        q: "متى تظهر النتائج؟",
        a: "غالباً ما يستجيب توتر ما قبل المنافسة والإفراط في التفكير في 3 إلى 5 جلسات. أما التحولات الأعمق في الثقة والهوية فتحتاج 8 إلى 12 أسبوعاً. الموسم الكامل هو الدورة المعتادة لتغيير دائم. نعيد القياس كل 4 أسابيع حتى يُرى التقدم لا أن يُحَس فقط.",
      },
    ],
    ctaTitle: "نقطة انطلاقك في",
    ctaTitleEm: "دقيقتين.",
    ctaSub:
      "مجاني، سري، دون بطاقة بنكية. احصل على مؤشر أدائك الذهني وعلى بروتوكول مناسب لرياضتك.",
    ctaStart: "ابدأ التقييم المجاني",
    ctaMeet: "تعرّف على الأخصائيين الرياضيين",
  },
};

export default function MentalToughnessAthletes() {
  const { locale } = useLocale();
  const c = COPY[locale === "ar" ? "ar" : locale === "en" ? "en" : "fr"];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SEOHead
        path="/mental-toughness-athletes"
        title={c.seoTitle}
        description={c.seoDescription}
        jsonLd={faqJsonLd}
      />

      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 py-24 md:py-32 max-w-5xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-6">
              {c.eyebrow}
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
              {c.title}{" "}
              <em className="italic font-normal text-primary">{c.titleEm}</em>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              {c.sub}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/free-score">{c.ctaScore}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/psychologists?specialty=sport">{c.ctaBook}</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground font-mono tabular-nums">
              {c.meta}
            </p>
          </div>
        </section>

        {/* Signals */}
        <section className="container mx-auto px-4 py-20 max-w-5xl">
          <div className="max-w-2xl mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
              {c.signalsEyebrow}
            </p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-4">
              {c.signalsTitle}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            {c.signals.map((line) => (
              <div
                key={line}
                className="flex gap-3 p-4 rounded-xl border border-border/50"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p className="text-muted-foreground italic">
                  {c.quotes[0]}
                  {line}
                  {c.quotes[1]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pillars */}
        <section className="border-y border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 py-20 max-w-6xl">
            <div className="max-w-2xl mb-14">
              <h2 className="font-display text-3xl md:text-5xl leading-tight mb-4">
                {c.pillarsTitle}
              </h2>
              <p className="text-muted-foreground text-lg">{c.pillarsSub}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {c.pillars.map((p, i) => {
                const Icon = PILLAR_ICONS[i];
                return (
                  <Card
                    key={p.title}
                    className="border-border/60 hover:border-primary/40 transition-colors"
                  >
                    <CardHeader>
                      <Icon
                        className="w-6 h-6 text-primary mb-3"
                        strokeWidth={1.5}
                      />
                      <CardTitle className="font-display text-2xl">
                        {p.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {p.desc}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Method */}
        <section className="container mx-auto px-4 py-20 max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
            {c.methodEyebrow}
          </p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-12">
            {c.methodTitle}
          </h2>
          <div className="grid gap-10 md:grid-cols-4">
            {c.method.map((s, i) => (
              <div key={s.t}>
                <div className="font-mono tabular-nums text-sm text-primary mb-3">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-2xl mb-2">{s.t}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 py-20 max-w-3xl">
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-10">
              {c.faqTitle}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {c.faq.map((f, i) => (
                <AccordionItem key={i} value={`i-${i}`}>
                  <AccordionTrigger className="text-start font-display text-lg md:text-xl">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-24 max-w-3xl text-center">
          <h2 className="font-display text-4xl md:text-6xl leading-tight mb-6">
            {c.ctaTitle}{" "}
            <em className="italic font-normal text-primary">{c.ctaTitleEm}</em>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">{c.ctaSub}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/free-score">{c.ctaStart}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/psychologists?specialty=sport">{c.ctaMeet}</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
