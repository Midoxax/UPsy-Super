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
import { trackCTAClick } from "@/lib/analytics/gtm";
import {
  Brain,
  Focus,
  Zap,
  Target,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const PILLAR_ICONS = [Focus, Zap, Target, Brain, TrendingUp, ShieldCheck];

const COPY = {
  en: {
    home: "Home",
    crumb: "Mental Performance",
    seoTitle: "Mental Performance Training — Focus, Toughness, Clarity | U.Psy",
    seoDescription:
      "Measure, train, and sustain mental performance. Assessments, coaching, and protocols for focus, mental toughness, stress recovery, and decision-making.",
    eyebrow: "Performance Psychology System",
    title: "Train the mind like",
    titleEm: "elite operators do.",
    sub: "Focus, mental toughness, and clarity are trainable skills — not personality traits. U.Psy measures where you are, builds the protocol, and coaches you to a higher baseline in 8–12 weeks.",
    ctaScore: "Get your free Mental Performance Score",
    ctaBook: "Book a performance psychologist",
    meta: "12 questions · 2 minutes · free rebook if not the right fit",
    pillarsTitle: "Six pillars we measure and train",
    pillarsSub:
      "Every protocol pulls from these six trainable systems. You never work on all of them at once — assessment shows which two or three matter for you right now.",
    pillars: [
      {
        title: "Attention Control",
        desc: "Train the ability to hold and release focus at will — the core skill under every high-stakes output.",
      },
      {
        title: "Stress Recovery",
        desc: "Move from reactive to regulated. Nervous-system tools that shorten recovery from setbacks and pressure.",
      },
      {
        title: "Decision Under Load",
        desc: "Keep judgment sharp when stakes, ambiguity, and fatigue rise.",
      },
      {
        title: "Cognitive Endurance",
        desc: "Sustain quality of thought across a full day, not just the first hour. Rebuild working memory and clarity.",
      },
      {
        title: "Confidence Architecture",
        desc: "Evidence-based self-belief built from measured wins — not affirmations. Compounds week over week.",
      },
      {
        title: "Recovery & Sleep",
        desc: "The multiplier on every other skill. Protocols for sleep, downtime, and emotional recovery.",
      },
    ],
    methodEyebrow: "The method",
    methodTitle: "Measure. Identify. Train. Apply.",
    method: [
      {
        t: "Measure",
        d: "Validated cognitive and emotional baseline in under 15 minutes.",
      },
      {
        t: "Identify",
        d: "Two or three levers with the highest leverage — no generic advice.",
      },
      {
        t: "Train",
        d: "8–12 weeks of protocols and 1:1 coaching. Weekly checkpoints.",
      },
      {
        t: "Apply",
        d: "Transfer to your real context: sport, boardroom, exam, operating theatre.",
      },
    ],
    whoTitle: "Built for people who",
    whoTitleEm: "operate under load.",
    whoSub:
      "Athletes. Founders. Surgeons. Traders. Students in high-stakes exams. Anyone whose output depends on the quality of their attention.",
    who: [
      "Athletes preparing for competition or coming back from injury",
      "Founders and executives holding decisions under uncertainty",
      "Medical, legal, and aviation professionals in high-consequence roles",
      "Students preparing for medical, bar, or graduate entrance exams",
      "Creatives protecting deep-work time from constant context-switching",
      "High performers coming off burnout who want a sustainable baseline",
    ],
    faqTitle: "Questions people ask before starting",
    faq: [
      {
        q: "What is mental performance?",
        a: "Mental performance is the trained capacity to think clearly, regulate emotion, and sustain focus under pressure. Unlike therapy, which resolves distress, mental performance training builds the cognitive and emotional skills that drive execution — attention control, stress tolerance, recovery, and decision-making.",
      },
      {
        q: "How do I improve my mental performance?",
        a: "Improvement follows a measurable loop: (1) baseline your cognitive and emotional state with a validated assessment, (2) identify the two or three levers with the highest leverage (sleep, focus, stress recovery, or self-talk), (3) train them for 6–12 weeks with a coach or protocol, (4) re-measure. Consistency beats intensity — 20 minutes daily outperforms occasional long sessions.",
      },
      {
        q: "How to build mental toughness?",
        a: "Mental toughness is built through graded exposure to controlled discomfort plus deliberate recovery. Train four pillars: confidence (evidence-based, not affirmations), concentration (single-task blocks), control (breath and physiology regulation), and commitment (values-anchored goals). Toughness without recovery becomes burnout.",
      },
      {
        q: "What causes brain fog and mental fatigue?",
        a: "The most common drivers are sleep debt, chronic stress load, blood-sugar instability, dehydration, and cognitive overload from context-switching. Rule out medical causes (thyroid, iron, B12, sleep apnoea) with a doctor before behavioural work. Many people improve within a few weeks of better sleep, hydration, and single-tasking.",
      },
      {
        q: "How do I improve focus and productivity?",
        a: "Protect one 90-minute deep-work block per day, phone in another room. Use a fixed start cue (same time, same drink, same music). Batch shallow work into two windows. Aim for 7 or more hours of sleep: attention and working memory suffer quickly when sleep runs short.",
      },
      {
        q: "Do I need a mental performance coach or a therapist?",
        a: "A therapist treats clinical distress (anxiety, depression, trauma). A mental performance coach or psychologist trains healthy people to perform better under load — athletes, founders, executives, students, medical staff. If you feel functional but plateaued, coaching. If daily life is suffering, therapy first. U.Psy offers both and will route you correctly.",
      },
      {
        q: "How long does it take to see results?",
        a: "Focus and stress-regulation gains often show within 2–4 weeks. Deeper shifts in confidence, self-talk, and identity take 8–12 weeks. Lasting consistency is a 6–12 month arc. We re-measure every 4 weeks so progress is visible, not just felt.",
      },
    ],
    ctaTitle: "See your baseline in",
    ctaTitleEm: "2 minutes.",
    ctaSub:
      "Free, private, no card. Get a Mental Performance Score and a next-step protocol built for you.",
    ctaStart: "Start free assessment",
    ctaMeet: "Meet the psychologists",
  },
  fr: {
    home: "Accueil",
    crumb: "Performance mentale",
    seoTitle:
      "Entraînement à la performance mentale : concentration, force mentale, clarté | U.Psy",
    seoDescription:
      "Mesurer, entraîner et entretenir sa performance mentale. Évaluations, accompagnement et protocoles pour la concentration, la force mentale, la récupération du stress et la prise de décision.",
    eyebrow: "Système de psychologie de la performance",
    title: "Entraînez votre mental comme",
    titleEm: "les meilleurs.",
    sub: "La concentration, la force mentale et la clarté sont des compétences qui s'entraînent, pas des traits de personnalité. U.Psy mesure votre point de départ, construit le protocole et vous accompagne vers un meilleur niveau en 8 à 12 semaines.",
    ctaScore: "Faire mon score de performance mentale gratuit",
    ctaBook: "Réserver un psychologue de la performance",
    meta: "12 questions · 2 minutes · nouvelle séance offerte si le courant ne passe pas",
    pillarsTitle: "Six piliers que nous mesurons et entraînons",
    pillarsSub:
      "Chaque protocole s'appuie sur ces six systèmes. Vous ne travaillez jamais tout en même temps : l'évaluation montre les deux ou trois qui comptent pour vous maintenant.",
    pillars: [
      {
        title: "Contrôle de l'attention",
        desc: "Apprendre à fixer et relâcher sa concentration à volonté : la compétence de base de toute performance sous enjeu.",
      },
      {
        title: "Récupération du stress",
        desc: "Passer de la réaction à la régulation. Des outils pour le système nerveux qui raccourcissent la récupération après un échec ou sous pression.",
      },
      {
        title: "Décider sous la charge",
        desc: "Garder un jugement clair quand les enjeux, l'incertitude et la fatigue augmentent.",
      },
      {
        title: "Endurance cognitive",
        desc: "Garder la qualité de réflexion toute la journée, pas seulement la première heure. Retrouver mémoire de travail et clarté.",
      },
      {
        title: "Architecture de la confiance",
        desc: "Une confiance fondée sur des réussites mesurées, pas sur des affirmations. Elle se renforce semaine après semaine.",
      },
      {
        title: "Récupération et sommeil",
        desc: "Le multiplicateur de toutes les autres compétences. Protocoles pour le sommeil, le repos et la récupération émotionnelle.",
      },
    ],
    methodEyebrow: "La méthode",
    methodTitle: "Mesurer. Identifier. Entraîner. Appliquer.",
    method: [
      {
        t: "Mesurer",
        d: "Un point de départ cognitif et émotionnel validé, en moins de 15 minutes.",
      },
      {
        t: "Identifier",
        d: "Les deux ou trois leviers les plus efficaces pour vous, pas de conseils génériques.",
      },
      {
        t: "Entraîner",
        d: "8 à 12 semaines de protocoles et de séances individuelles, avec un point chaque semaine.",
      },
      {
        t: "Appliquer",
        d: "Transférer dans votre réalité : sport, réunion de direction, examen, bloc opératoire.",
      },
    ],
    whoTitle: "Pensé pour celles et ceux qui",
    whoTitleEm: "travaillent sous pression.",
    whoSub:
      "Sportifs, fondateurs, chirurgiens, traders, étudiants face à des examens décisifs : toute personne dont les résultats dépendent de la qualité de son attention.",
    who: [
      "Sportifs qui préparent une compétition ou reviennent de blessure",
      "Fondateurs et dirigeants qui décident dans l'incertitude",
      "Professionnels de santé, du droit et de l'aviation aux responsabilités lourdes",
      "Étudiants qui préparent un concours de médecine, du barreau ou d'une grande école",
      "Créatifs qui protègent leur temps de travail profond des interruptions",
      "Personnes très performantes qui sortent d'un épuisement et veulent un rythme tenable",
    ],
    faqTitle: "Les questions avant de commencer",
    faq: [
      {
        q: "Qu'est-ce que la performance mentale ?",
        a: "La performance mentale est la capacité entraînée à penser clairement, réguler ses émotions et rester concentré sous pression. Contrairement à la thérapie, qui soigne la souffrance, l'entraînement à la performance mentale développe les compétences cognitives et émotionnelles qui font l'exécution : contrôle de l'attention, tolérance au stress, récupération et prise de décision.",
      },
      {
        q: "Comment améliorer ma performance mentale ?",
        a: "Le progrès suit une boucle mesurable : (1) établir votre point de départ cognitif et émotionnel avec une évaluation validée, (2) identifier les deux ou trois leviers les plus efficaces (sommeil, concentration, récupération du stress ou discours intérieur), (3) les entraîner 6 à 12 semaines avec un accompagnement ou un protocole, (4) mesurer à nouveau. La régularité l'emporte sur l'intensité : 20 minutes par jour valent mieux que de longues séances occasionnelles.",
      },
      {
        q: "Comment développer sa force mentale ?",
        a: "La force mentale se construit par une exposition progressive à un inconfort contrôlé, associée à une récupération volontaire. Travaillez quatre piliers : la confiance (fondée sur des preuves, pas sur des affirmations), la concentration (blocs de tâche unique), le contrôle (respiration et régulation physiologique) et l'engagement (objectifs ancrés dans vos valeurs). Sans récupération, la force mentale mène à l'épuisement.",
      },
      {
        q: "D'où viennent le brouillard mental et la fatigue mentale ?",
        a: "Les causes les plus fréquentes sont le manque de sommeil, un stress chronique, une glycémie instable, la déshydratation et la surcharge cognitive liée aux interruptions. Écartez d'abord les causes médicales (thyroïde, fer, vitamine B12, apnée du sommeil) avec un médecin. Beaucoup de personnes vont mieux en quelques semaines grâce au sommeil, à l'hydratation et au travail sur une seule tâche.",
      },
      {
        q: "Comment améliorer ma concentration et ma productivité ?",
        a: "Protégez un bloc de travail profond de 90 minutes par jour, téléphone dans une autre pièce. Utilisez un signal de départ fixe (même heure, même boisson, même musique). Regroupez les tâches superficielles en deux créneaux. Visez au moins 7 heures de sommeil : l'attention et la mémoire de travail se dégradent vite quand le sommeil manque.",
      },
      {
        q: "Ai-je besoin d'un préparateur mental ou d'un thérapeute ?",
        a: "Le thérapeute soigne la souffrance clinique (anxiété, dépression, traumatisme). Le préparateur mental ou le psychologue de la performance entraîne des personnes en bonne santé à mieux performer sous pression : sportifs, fondateurs, dirigeants, étudiants, soignants. Si vous fonctionnez mais stagnez, choisissez l'accompagnement à la performance. Si votre quotidien en souffre, la thérapie d'abord. U.Psy propose les deux et vous oriente.",
      },
      {
        q: "Combien de temps faut-il pour voir des résultats ?",
        a: "Les progrès de concentration et de gestion du stress apparaissent souvent en 2 à 4 semaines. Les changements plus profonds de confiance, de discours intérieur et d'identité prennent 8 à 12 semaines. Une régularité durable se construit sur 6 à 12 mois. Nous mesurons à nouveau toutes les 4 semaines pour que les progrès se voient, pas seulement qu'ils se ressentent.",
      },
    ],
    ctaTitle: "Votre point de départ en",
    ctaTitleEm: "2 minutes.",
    ctaSub:
      "Gratuit, confidentiel, sans carte bancaire. Obtenez votre score de performance mentale et un protocole adapté.",
    ctaStart: "Commencer l'évaluation gratuite",
    ctaMeet: "Voir les psychologues",
  },
  ar: {
    home: "الرئيسية",
    crumb: "الأداء الذهني",
    seoTitle: "التدريب على الأداء الذهني: التركيز، الصلابة، الوضوح | U.Psy",
    seoDescription:
      "قِس أداءك الذهني ودرّبه وحافظ عليه. تقييمات ومرافقة وبروتوكولات للتركيز والصلابة الذهنية والتعافي من الضغط واتخاذ القرار.",
    eyebrow: "نظام علم نفس الأداء",
    title: "درّب ذهنك كما يفعل",
    titleEm: "الأفضل.",
    sub: "التركيز والصلابة الذهنية والوضوح مهارات تُدرَّب، لا سمات شخصية. تقيس U.Psy نقطة انطلاقك، وتبني البروتوكول، وترافقك نحو مستوى أعلى في 8 إلى 12 أسبوعاً.",
    ctaScore: "احصل على مؤشر أدائك الذهني مجاناً",
    ctaBook: "احجز أخصائياً في علم نفس الأداء",
    meta: "12 سؤالاً · دقيقتان · جلسة بديلة مجاناً إن لم يكن الاختيار مناسباً",
    pillarsTitle: "ست ركائز نقيسها وندرّبها",
    pillarsSub:
      "يستند كل بروتوكول إلى هذه الأنظمة الستة. لا تعمل عليها كلها في آن واحد: يبيّن التقييم أيها الأهم لك الآن.",
    pillars: [
      {
        title: "التحكم في الانتباه",
        desc: "القدرة على تثبيت التركيز وإطلاقه متى شئت: المهارة الأساسية لكل أداء عالي الرهان.",
      },
      {
        title: "التعافي من الضغط",
        desc: "الانتقال من رد الفعل إلى التنظيم. أدوات للجهاز العصبي تقصّر مدة التعافي بعد الإخفاق وتحت الضغط.",
      },
      {
        title: "القرار تحت الحمل",
        desc: "الحفاظ على وضوح الحكم حين ترتفع الرهانات والغموض والتعب.",
      },
      {
        title: "التحمّل المعرفي",
        desc: "الحفاظ على جودة التفكير طوال اليوم لا في الساعة الأولى فقط. استعادة الذاكرة العاملة والوضوح.",
      },
      {
        title: "بناء الثقة",
        desc: "ثقة قائمة على إنجازات مقيسة، لا على العبارات التحفيزية. تتعزز أسبوعاً بعد أسبوع.",
      },
      {
        title: "الاسترجاع والنوم",
        desc: "المضاعِف لكل المهارات الأخرى. بروتوكولات للنوم والراحة والتعافي العاطفي.",
      },
    ],
    methodEyebrow: "المنهج",
    methodTitle: "قِس. حدّد. درّب. طبّق.",
    method: [
      {
        t: "قِس",
        d: "قياس أولي معرفي وعاطفي معتمد في أقل من 15 دقيقة.",
      },
      {
        t: "حدّد",
        d: "رافعتان أو ثلاث ذات أثر أكبر، دون نصائح عامة.",
      },
      {
        t: "درّب",
        d: "من 8 إلى 12 أسبوعاً من البروتوكولات والجلسات الفردية، مع نقطة متابعة أسبوعية.",
      },
      {
        t: "طبّق",
        d: "انقل ما تعلمته إلى واقعك: الرياضة، الاجتماعات، الامتحانات، غرفة العمليات.",
      },
    ],
    whoTitle: "مصمَّم لمن",
    whoTitleEm: "يعملون تحت الضغط.",
    whoSub:
      "رياضيون، مؤسسون، جراحون، متداولون، طلبة أمام امتحانات حاسمة: كل من تعتمد نتائجه على جودة انتباهه.",
    who: [
      "رياضيون يستعدون لمنافسة أو يعودون من إصابة",
      "مؤسسون ومسيرون يتخذون قرارات في ظل الغموض",
      "مهنيو الصحة والقانون والطيران ذوو المسؤوليات الثقيلة",
      "طلبة يستعدون لمباريات الطب أو المحاماة أو المدارس العليا",
      "مبدعون يحمون وقت عملهم العميق من المقاطعات",
      "أشخاص عاليو الأداء خارجون من الإنهاك ويريدون إيقاعاً مستداماً",
    ],
    faqTitle: "أسئلة قبل البدء",
    faq: [
      {
        q: "ما هو الأداء الذهني؟",
        a: "الأداء الذهني هو القدرة المدرَّبة على التفكير بوضوح وتنظيم العواطف والحفاظ على التركيز تحت الضغط. على عكس العلاج الذي يعالج المعاناة، يبني التدريب على الأداء الذهني المهارات المعرفية والعاطفية التي تصنع التنفيذ: التحكم في الانتباه، تحمّل الضغط، الاسترجاع، واتخاذ القرار.",
      },
      {
        q: "كيف أحسّن أدائي الذهني؟",
        a: "يتبع التحسن حلقة قابلة للقياس: (1) قياس حالتك المعرفية والعاطفية بتقييم معتمد، (2) تحديد الرافعتين أو الثلاث الأكثر أثراً (النوم، التركيز، التعافي من الضغط، أو الحديث الداخلي)، (3) تدريبها من 6 إلى 12 أسبوعاً بمرافقة أو بروتوكول، (4) القياس من جديد. الانتظام أهم من الشدة: 20 دقيقة يومياً أفضل من جلسات طويلة متفرقة.",
      },
      {
        q: "كيف أبني الصلابة الذهنية؟",
        a: "تُبنى الصلابة الذهنية بالتعرض التدريجي لانزعاج مضبوط مع استرجاع مقصود. درّب أربع ركائز: الثقة (قائمة على الأدلة)، التركيز (فترات لمهمة واحدة)، التحكم (التنفس وتنظيم الفيزيولوجيا)، والالتزام (أهداف مرتبطة بقيمك). الصلابة دون استرجاع تقود إلى الإنهاك.",
      },
      {
        q: "ما أسباب الضبابية الذهنية والتعب الذهني؟",
        a: "أكثر الأسباب شيوعاً: نقص النوم، الضغط المزمن، عدم استقرار سكر الدم، الجفاف، والإرهاق المعرفي بسبب المقاطعات. استبعد أولاً الأسباب الطبية (الغدة الدرقية، الحديد، فيتامين B12، انقطاع النفس أثناء النوم) مع طبيب. يتحسن كثيرون في بضعة أسابيع بفضل النوم والترطيب والعمل على مهمة واحدة.",
      },
      {
        q: "كيف أحسّن تركيزي وإنتاجيتي؟",
        a: "احمِ فترة عمل عميق من 90 دقيقة يومياً، والهاتف في غرفة أخرى. استعمل إشارة بدء ثابتة (نفس الوقت، نفس المشروب، نفس الموسيقى). اجمع المهام البسيطة في فترتين. استهدف 7 ساعات نوم أو أكثر: يتراجع الانتباه والذاكرة العاملة بسرعة عند نقص النوم.",
      },
      {
        q: "هل أحتاج مدرب أداء ذهني أم معالجاً نفسياً؟",
        a: "المعالج النفسي يعالج المعاناة السريرية (القلق، الاكتئاب، الصدمات). مدرب الأداء الذهني أو أخصائي علم نفس الأداء يدرّب أشخاصاً أصحاء على أداء أفضل تحت الضغط: رياضيون، مؤسسون، مسيرون، طلبة، مهنيو الصحة. إذا كنت تؤدي لكنك متوقف عند سقف، فالمرافقة. وإذا كانت حياتك اليومية تتأثر، فالعلاج أولاً. تقدم U.Psy الاثنين وتوجهك.",
      },
      {
        q: "متى تظهر النتائج؟",
        a: "غالباً ما يظهر تحسن التركيز وتدبير الضغط في 2 إلى 4 أسابيع. أما التحولات الأعمق في الثقة والحديث الداخلي والهوية فتحتاج 8 إلى 12 أسبوعاً. يُبنى الانتظام الدائم على 6 إلى 12 شهراً. نعيد القياس كل 4 أسابيع حتى يُرى التقدم لا أن يُحَس فقط.",
      },
    ],
    ctaTitle: "نقطة انطلاقك في",
    ctaTitleEm: "دقيقتين.",
    ctaSub:
      "مجاني، سري، دون بطاقة بنكية. احصل على مؤشر أدائك الذهني وبروتوكول مناسب لك.",
    ctaStart: "ابدأ التقييم المجاني",
    ctaMeet: "تعرّف على الأخصائيين",
  },
};

export default function MentalPerformance() {
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: c.home,
        item: "https://upsy.ma",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: c.crumb,
        item: "https://upsy.ma/mental-performance",
      },
    ],
  };

  const track = (label: string, where: string, action: string) => () =>
    trackCTAClick(label, where, "/mental-performance", { cta_action: action });

  return (
    <>
      <SEOHead
        path="/mental-performance"
        title={c.seoTitle}
        description={c.seoDescription}
        jsonLd={[breadcrumbJsonLd, faqJsonLd]}
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
                <Link
                  to="/free-score"
                  onClick={track("Start Free", "hero", "score_start")}
                >
                  {c.ctaScore}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link
                  to="/psychologists"
                  onClick={track("Book a Call", "hero", "book_intent")}
                >
                  {c.ctaBook}
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground font-mono tabular-nums">
              {c.meta}
            </p>
          </div>
        </section>

        {/* Pillars */}
        <section className="container mx-auto px-4 py-20 max-w-6xl">
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
        </section>

        {/* Method */}
        <section className="border-y border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 py-20 max-w-5xl">
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
          </div>
        </section>

        {/* Who */}
        <section className="container mx-auto px-4 py-20 max-w-5xl">
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-4">
            {c.whoTitle}{" "}
            <em className="italic font-normal text-primary">{c.whoTitleEm}</em>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mb-10">
            {c.whoSub}
          </p>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            {c.who.map((line) => (
              <div
                key={line}
                className="flex gap-3 p-4 rounded-xl border border-border/50"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p className="text-muted-foreground">{line}</p>
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
              <Link
                to="/free-score"
                onClick={track("Start Free", "bottom_cta", "score_start")}
              >
                {c.ctaStart}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link
                to="/psychologists"
                onClick={track("Book a Call", "bottom_cta", "book_intent")}
              >
                {c.ctaMeet}
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
