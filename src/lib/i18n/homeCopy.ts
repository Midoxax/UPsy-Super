// Per-locale copy for the marketing homepage (hero v7, pricing, FAQ, featured).
// Kept out of the giant translations.ts to make edits low-risk.
// BER falls back to AR when a specific Berber string is not provided.

import type { Locale } from "@/lib/i18n/utils";

type HeroCopy = {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  tagline: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
  syncIndex: string;
  adrenalineBuffer: string;
  adrenalineActive: string;
  decisionLatency: string;
  decisionDelta: string;
  cognitiveLoad: string;
  cognitiveLow: string;
  performanceTiers: string;
  tiers: string[];
  tickerItems: string[];
};

type PricingTier = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  bullets: string[];
  cta: string;
};

type PricingCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  badge: string;
  tiers: [PricingTier, PricingTier, PricingTier];
  footnote: string;
  footnoteLink: string;
};

type FAQItem = { q: string; a: string };
type FAQCopy = {
  eyebrow: string;
  titleBefore: string;
  titleItalic: string;
  titleAfter: string;
  items: FAQItem[];
};

type FeaturedCopy = Record<string, string>;

type SEOCopy = { title: string; description: string };

type HomeCopy = {
  hero: HeroCopy;
  pricing: PricingCopy;
  faq: FAQCopy;
  featured: FeaturedCopy;
  seo: SEOCopy;
};

const en: HomeCopy = {
  hero: {
    eyebrow: "The Architecture of Dominance",
    headlineLine1: "Are You Operating",
    headlineLine2: "At Your Ceiling?",
    tagline: "The 2ms difference between good and elite.",
    body:
      "Why do the world's most capable leaders and athletes fail at the finish line? U.Psy replaces clinical guesswork with neuro-performance infrastructure — designed for high-stakes decision cycles.",
    ctaPrimary: "COMMENCE ASSESSMENT",
    ctaSecondary: "MATCH WITH A SPECIALIST",
    syncIndex: "Sync Index",
    adrenalineBuffer: "Adrenaline Buffer",
    adrenalineActive: "ACTIVE",
    decisionLatency: "Decision Latency",
    decisionDelta: "-12% · Optimal Range",
    cognitiveLoad: "Cognitive Load",
    cognitiveLow: "LOW",
    performanceTiers: "Performance Tiers",
    tiers: ["Series A Founders", "Special Ops Teams", "F1 Strategists", "Chess Grandmasters"],
    tickerItems: [
      "Neural Status: Synchronized",
      "System Load: 12.4%",
      "Signal Latency: 0.02ms",
      "Neural Status: Synchronized",
    ],
  },
  pricing: {
    eyebrow: "Transparent pricing",
    title: "One clear price. No surprises.",
    subtitle:
      "Every session is 50 minutes with an accredited psychologist. Video or in-person, in Arabic, French, or English.",
    badge: "Most chosen",
    tiers: [
      {
        name: "Single session",
        price: "MAD 600",
        cadence: "one 50-min session",
        tagline: "Try it before you commit.",
        bullets: [
          "50-minute session, video or in-person",
          "Choose your psychologist",
          "Free rebook if not the right fit",
        ],
        cta: "Book a session",
      },
      {
        name: "Focus pack",
        price: "MAD 2,200",
        cadence: "4 sessions · save 8%",
        tagline: "Best for a specific issue: anxiety, sleep, transitions.",
        bullets: [
          "4 × 50-min sessions with the same psychologist",
          "Structured protocol (CBT / EMDR / Schema)",
          "Progress tracking + between-session tools",
          "Free rebook guarantee",
        ],
        cta: "Start the pack",
      },
      {
        name: "Ongoing care",
        price: "MAD 2,400",
        cadence: "per month",
        tagline: "Weekly sessions plus digital care between them.",
        bullets: [
          "4 sessions / month with your psychologist",
          "Nour AI companion between sessions",
          "Journaling + mood tracking",
          "Cancel anytime",
        ],
        cta: "Start ongoing care",
      },
    ],
    footnote: "Prices are illustrative. Final price is shown on each psychologist's profile.",
    footnoteLink: "See full pricing details",
  },
  faq: {
    eyebrow: "Straight answers",
    titleBefore: "The things people ",
    titleItalic: "actually",
    titleAfter: " ask before booking",
    items: [
      { q: "How do I actually improve my mental performance?", a: "Mental performance improves the same way physical performance does — measure a baseline, target the weakest link (focus, sleep, emotional regulation, or recovery), train it for 6–8 weeks with a psychologist, then re-measure. Our psychologists use validated protocols (CBT, ACT, EMDR, performance psychology) matched to your goal, not generic advice." },
      { q: "How do I build mental toughness and stop overthinking?", a: "Mental toughness isn't willpower — it's trained tolerance for discomfort plus a clean decision framework. In 4–6 sessions you learn to separate signal from noise, run cognitive defusion on intrusive thoughts, and rehearse pressure situations. Athletes, founders, and executives use the same protocol." },
      { q: "Can a psychologist really help me focus and be more productive?", a: "Yes — when the root cause is psychological (anxiety, ADHD traits, burnout, perfectionism) rather than tooling. We screen for it in session 1 using validated instruments (GAD-7, PHQ-9, adult ADHD), then build a focus protocol you can run daily. Most clients report measurable change within 3–4 weeks." },
      { q: "What causes brain fog and how do I clear it?", a: "Brain fog is usually a stack: poor sleep architecture, chronic stress load, unregulated anxiety, post-viral inflammation, or nutrient gaps. A psychologist maps which drivers apply to you, treats the psychological load (CBT-I for sleep, stress protocols, rumination work), and refers out for medical drivers. Most people feel a clear lift in 2–4 weeks." },
      { q: "How do high performers train their mind — athletes, founders, executives?", a: "Same three levers: (1) baseline measurement (attention, recovery, emotional regulation, decision quality), (2) targeted protocols — visualization, arousal control, cognitive defusion, pre-performance routines, (3) weekly reps under simulated pressure. Our performance psychologists work with pro athletes, C-suite operators, and founders on the same stack." },
      { q: "How is this different from meditation apps or self-help?", a: "Apps give you generic exercises. A psychologist runs assessment → diagnosis → personalized protocol → weekly accountability → measurable outcomes. You're not guessing which technique to try — you're running the specific one that fits your profile, with someone tracking whether it's working." },
      { q: "What if I don't click with my psychologist?", a: "You get a free rebook with a different psychologist — no questions asked. The first session is about finding the right person, not paying twice to try again." },
      { q: "How much does a session cost?", a: "From MAD 600 / EUR 55 / USD 60 for a single 50-min session. Packs of 4 save ~8%. Ongoing monthly care from MAD 2,400. The exact price is on each psychologist's profile — displayed in your local currency." },
      { q: "Is it confidential? What about my employer or insurance?", a: "Fully confidential. We follow Moroccan Law 09-08 on personal data. Nothing is shared with your employer, insurance, or family without your written consent. Sessions are encrypted end-to-end." },
      { q: "In what language are sessions held?", a: "Arabic (Darija & Modern Standard), French, English — and Spanish, Portuguese, or Italian with select specialists. Filter by language when choosing your psychologist." },
      { q: "Video or in-person?", a: "Both. Every psychologist offers secure video sessions worldwide (any timezone). In-person visits are available in select cities — filter by city on the directory." },
      { q: "Do you take insurance?", a: "We issue a compliant invoice you can submit to your provider (CNSS/CNOPS in Morocco, private health plans internationally). Most private policies reimburse 40–70% of psychology sessions." },
      { q: "How fast can I book?", a: "Most psychologists have slots within 48 hours. Some offer same-day sessions. Availability is shown live on each profile." },
    ],
  },
  featured: {
    "featured.eyebrow": "Accredited psychologists",
    "featured.titleConversion": "Book with someone who fits — this week.",
    "featured.subtitleConversion":
      "Every psychologist is accredited, vetted, and available for a 50-min session. Free rebook if it's not the right fit.",
    "featured.slot.today": "Today, 6:30 PM",
    "featured.slot.tomorrowMorning": "Tomorrow, 9:00 AM",
    "featured.slot.tomorrowAfternoon": "Tomorrow, 3:00 PM",
    "featured.slot.thisWeek": "This week, Thu 5:00 PM",
    "featured.availableToday": "Available today",
    "featured.videoOrInPerson": "Video or in-person",
    "featured.nextAvailable": "Next available",
    "featured.session50": "50-min session",
    "featured.bookNow": "Book a slot",
    "featured.viewProfile": "View profile",
    "featured.guarantee": "Free rebook if not the right fit",
    "featured.viewAllConversion": "Browse all 50+ psychologists",
  },
  seo: {
    title: "U.Psy — Book an accredited psychologist. Worldwide, in any timezone.",
    description:
      "Book a 50-min session with an accredited psychologist — video anywhere in the world, or in-person in select cities. Arabic, French, English, Spanish or Portuguese. Free rebook if not the right fit.",
  },
};

const fr: HomeCopy = {
  hero: {
    eyebrow: "L'architecture de la maîtrise",
    headlineLine1: "Opérez-vous",
    headlineLine2: "à votre plafond ?",
    tagline: "Les 2 ms qui séparent le bon de l'élite.",
    body:
      "Pourquoi les leaders et athlètes les plus capables du monde échouent-ils sur la ligne d'arrivée ? U.Psy remplace l'à-peu-près clinique par une infrastructure de neuro-performance — pensée pour les cycles de décision à fort enjeu.",
    ctaPrimary: "COMMENCER L'ÉVALUATION",
    ctaSecondary: "TROUVER UN SPÉCIALISTE",
    syncIndex: "Indice de sync.",
    adrenalineBuffer: "Réserve d'adrénaline",
    adrenalineActive: "ACTIVE",
    decisionLatency: "Latence de décision",
    decisionDelta: "-12 % · Zone optimale",
    cognitiveLoad: "Charge cognitive",
    cognitiveLow: "FAIBLE",
    performanceTiers: "Niveaux de performance",
    tiers: ["Fondateurs Series A", "Forces spéciales", "Stratèges F1", "Grands maîtres d'échecs"],
    tickerItems: [
      "État neuronal : synchronisé",
      "Charge système : 12,4 %",
      "Latence signal : 0,02 ms",
      "État neuronal : synchronisé",
    ],
  },
  pricing: {
    eyebrow: "Tarifs transparents",
    title: "Un prix clair. Aucune surprise.",
    subtitle:
      "Chaque séance dure 50 minutes avec un psychologue accrédité. En visio ou en cabinet, en arabe, français ou anglais.",
    badge: "Le plus choisi",
    tiers: [
      {
        name: "Séance unique",
        price: "600 MAD",
        cadence: "une séance de 50 min",
        tagline: "Essayez avant de vous engager.",
        bullets: [
          "Séance de 50 minutes, visio ou cabinet",
          "Choisissez votre psychologue",
          "Nouvelle séance offerte si ça ne colle pas",
        ],
        cta: "Réserver une séance",
      },
      {
        name: "Pack Focus",
        price: "2 200 MAD",
        cadence: "4 séances · -8 %",
        tagline: "Idéal pour une problématique ciblée : anxiété, sommeil, transitions.",
        bullets: [
          "4 séances de 50 min avec le même psychologue",
          "Protocole structuré (TCC / EMDR / Schémas)",
          "Suivi de progression + outils entre les séances",
          "Garantie nouvelle séance offerte",
        ],
        cta: "Démarrer le pack",
      },
      {
        name: "Suivi continu",
        price: "2 400 MAD",
        cadence: "par mois",
        tagline: "Séances hebdomadaires + accompagnement digital entre chaque.",
        bullets: [
          "4 séances / mois avec votre psychologue",
          "Compagnon IA Nour entre les séances",
          "Journal + suivi de l'humeur",
          "Résiliable à tout moment",
        ],
        cta: "Commencer le suivi",
      },
    ],
    footnote:
      "Tarifs indicatifs. Le prix définitif est indiqué sur le profil de chaque psychologue.",
    footnoteLink: "Voir tous les tarifs",
  },
  faq: {
    eyebrow: "Réponses directes",
    titleBefore: "Ce que les gens demandent ",
    titleItalic: "vraiment",
    titleAfter: " avant de réserver",
    items: [
      { q: "Comment améliorer réellement ma performance mentale ?", a: "La performance mentale s'améliore comme la performance physique — mesurer un niveau de départ, cibler le maillon faible (concentration, sommeil, régulation émotionnelle, récupération), l'entraîner 6 à 8 semaines avec un psychologue, puis re-mesurer. Nos psychologues utilisent des protocoles validés (TCC, ACT, EMDR, psychologie de la performance) adaptés à votre objectif — pas de conseils génériques." },
      { q: "Comment développer la force mentale et arrêter de trop réfléchir ?", a: "La force mentale n'est pas de la volonté — c'est une tolérance entraînée à l'inconfort plus un cadre de décision clair. En 4 à 6 séances, vous apprenez à séparer le signal du bruit, à défuser les pensées intrusives et à répéter les situations sous pression. Athlètes, fondateurs et cadres utilisent le même protocole." },
      { q: "Un psychologue peut-il vraiment m'aider à me concentrer et à être plus productif ?", a: "Oui — lorsque la cause profonde est psychologique (anxiété, traits TDAH, burn-out, perfectionnisme) plutôt que d'outils. On la dépiste à la 1ʳᵉ séance avec des instruments validés (GAD-7, PHQ-9, TDAH adulte), puis on construit un protocole de concentration quotidien. La plupart des clients notent un changement mesurable en 3 à 4 semaines." },
      { q: "Qu'est-ce qui cause le brouillard mental et comment le dissiper ?", a: "Le brouillard mental est un empilement : sommeil de mauvaise qualité, stress chronique, anxiété non régulée, inflammation post-virale ou déficits nutritionnels. Un psychologue cartographie les moteurs, traite la charge psychologique (TCC-I pour le sommeil, protocoles de stress, travail sur la rumination) et oriente pour les causes médicales. La plupart des personnes ressentent un net mieux en 2 à 4 semaines." },
      { q: "Comment les hauts performeurs entraînent-ils leur mental — athlètes, fondateurs, dirigeants ?", a: "Trois leviers : (1) mesure de départ (attention, récupération, régulation émotionnelle, qualité de décision), (2) protocoles ciblés — visualisation, contrôle de l'activation, défusion cognitive, routines de pré-performance, (3) répétitions hebdomadaires sous pression simulée. Nos psychologues de la performance travaillent avec des athlètes pros, des dirigeants et des fondateurs sur la même approche." },
      { q: "En quoi est-ce différent des applis de méditation ou du développement personnel ?", a: "Les applis donnent des exercices génériques. Un psychologue mène évaluation → diagnostic → protocole personnalisé → responsabilité hebdomadaire → résultats mesurables. Vous ne devinez pas quelle technique essayer — vous appliquez celle qui correspond à votre profil, avec un suivi de son efficacité." },
      { q: "Et si le courant ne passe pas avec mon psychologue ?", a: "Vous bénéficiez d'une nouvelle séance gratuite avec un autre psychologue — sans justification. La première séance sert à trouver la bonne personne, pas à payer deux fois pour réessayer." },
      { q: "Combien coûte une séance ?", a: "À partir de 600 MAD / 55 EUR / 60 USD pour une séance individuelle de 50 min. Les packs de 4 offrent ~8 % de remise. Suivi mensuel à partir de 2 400 MAD. Le prix exact est affiché sur chaque profil — dans votre devise locale." },
      { q: "Est-ce confidentiel ? Et vis-à-vis de mon employeur ou de mon assurance ?", a: "Totalement confidentiel. Nous respectons la loi marocaine 09-08 sur les données personnelles. Rien n'est partagé avec votre employeur, votre assurance ou votre famille sans votre accord écrit. Les séances sont chiffrées de bout en bout." },
      { q: "Dans quelle langue se déroulent les séances ?", a: "Arabe (Darija et arabe standard), français, anglais — et espagnol, portugais ou italien avec certains spécialistes. Filtrez par langue au moment du choix." },
      { q: "En visio ou en cabinet ?", a: "Les deux. Tous les psychologues proposent des séances vidéo sécurisées partout dans le monde (tous fuseaux horaires). Les séances en cabinet sont disponibles dans certaines villes — filtrez par ville sur l'annuaire." },
      { q: "Prenez-vous en charge les assurances ?", a: "Nous émettons une facture conforme à soumettre à votre organisme (CNSS/CNOPS au Maroc, mutuelles privées à l'international). La plupart des mutuelles privées remboursent 40 à 70 % des séances de psychologie." },
      { q: "En combien de temps puis-je réserver ?", a: "La plupart des psychologues ont des créneaux sous 48 h. Certains proposent des séances le jour même. La disponibilité s'affiche en direct sur chaque profil." },
    ],
  },
  featured: {
    "featured.eyebrow": "Psychologues accrédités",
    "featured.titleConversion": "Réservez avec quelqu'un qui vous correspond — cette semaine.",
    "featured.subtitleConversion":
      "Chaque psychologue est accrédité, vérifié et disponible pour une séance de 50 min. Nouvelle séance offerte si ça ne colle pas.",
    "featured.slot.today": "Aujourd'hui, 18h30",
    "featured.slot.tomorrowMorning": "Demain, 9h00",
    "featured.slot.tomorrowAfternoon": "Demain, 15h00",
    "featured.slot.thisWeek": "Cette semaine, jeu. 17h00",
    "featured.availableToday": "Disponible aujourd'hui",
    "featured.videoOrInPerson": "Visio ou cabinet",
    "featured.nextAvailable": "Prochain créneau",
    "featured.session50": "séance de 50 min",
    "featured.bookNow": "Réserver un créneau",
    "featured.viewProfile": "Voir le profil",
    "featured.guarantee": "Nouvelle séance offerte si ça ne colle pas",
    "featured.viewAllConversion": "Voir tous les psychologues (50+)",
  },
  seo: {
    title: "U.Psy — Réservez un psychologue accrédité. Partout, sur tous fuseaux.",
    description:
      "Réservez une séance de 50 min avec un psychologue accrédité — en visio partout dans le monde ou en cabinet dans certaines villes. Arabe, français, anglais, espagnol, portugais. Nouvelle séance offerte si ça ne colle pas.",
  },
};

const ar: HomeCopy = {
  hero: {
    eyebrow: "هندسة التفوّق",
    headlineLine1: "هل تعمل",
    headlineLine2: "في أقصى إمكاناتك؟",
    tagline: "فرق ٢ ميلي‑ثانية بين الجيّد والنخبة.",
    body:
      "لماذا يخفق أكثر القادة والرياضيين قدرةً عند خط النهاية؟ يوپسي تستبدل التخمين السريري ببنية تحتية للأداء العصبي — مصمَّمة لدورات القرار عالية المخاطر.",
    ctaPrimary: "ابدأ التقييم",
    ctaSecondary: "طابقني مع مختصّ",
    syncIndex: "مؤشر التزامن",
    adrenalineBuffer: "احتياطي الأدرينالين",
    adrenalineActive: "نشِط",
    decisionLatency: "زمن اتخاذ القرار",
    decisionDelta: "-١٢٪ · النطاق الأمثل",
    cognitiveLoad: "الحمل المعرفي",
    cognitiveLow: "منخفض",
    performanceTiers: "مستويات الأداء",
    tiers: ["مؤسّسو Series A", "فرق عمليات خاصة", "استراتيجيّو F1", "أساطين الشطرنج"],
    tickerItems: [
      "الحالة العصبية: متزامنة",
      "حِمل النظام: ١٢٫٤٪",
      "زمن الإشارة: ٠٫٠٢ ميلي‑ثانية",
      "الحالة العصبية: متزامنة",
    ],
  },
  pricing: {
    eyebrow: "تسعير شفّاف",
    title: "سعر واحد واضح. بلا مفاجآت.",
    subtitle:
      "كل جلسة ٥٠ دقيقة مع أخصائي نفسي معتمَد. عبر الفيديو أو حضورياً، بالعربية أو الفرنسية أو الإنجليزية.",
    badge: "الأكثر اختياراً",
    tiers: [
      {
        name: "جلسة واحدة",
        price: "٦٠٠ درهم",
        cadence: "جلسة واحدة ٥٠ دقيقة",
        tagline: "جرّب قبل أن تلتزم.",
        bullets: [
          "جلسة ٥٠ دقيقة، فيديو أو حضورياً",
          "اختر أخصّائيك النفسي",
          "إعادة حجز مجانية إن لم يكن الملاءم",
        ],
        cta: "احجز جلسة",
      },
      {
        name: "حزمة التركيز",
        price: "٢٬٢٠٠ درهم",
        cadence: "٤ جلسات · وفّر ٨٪",
        tagline: "الأنسب لموضوع محدَّد: القلق، النوم، مراحل الانتقال.",
        bullets: [
          "٤ جلسات × ٥٠ دقيقة مع نفس الأخصّائي",
          "بروتوكول منظّم (CBT / EMDR / سكيما)",
          "تتبّع للتقدّم + أدوات بين الجلسات",
          "ضمان إعادة حجز مجانية",
        ],
        cta: "ابدأ الحزمة",
      },
      {
        name: "متابعة مستمرّة",
        price: "٢٬٤٠٠ درهم",
        cadence: "شهرياً",
        tagline: "جلسات أسبوعية ومرافقة رقمية بينها.",
        bullets: [
          "٤ جلسات / شهر مع أخصّائيك",
          "مرافقة نور بالذكاء الاصطناعي بين الجلسات",
          "دفتر يوميات + تتبّع المزاج",
          "يمكن الإلغاء في أي وقت",
        ],
        cta: "ابدأ المتابعة",
      },
    ],
    footnote:
      "الأسعار إرشادية. السعر النهائي يظهر على صفحة كل أخصائي.",
    footnoteLink: "اطّلع على كل التفاصيل",
  },
  faq: {
    eyebrow: "أجوبة مباشرة",
    titleBefore: "ما يسأله الناس ",
    titleItalic: "فعلاً",
    titleAfter: " قبل الحجز",
    items: [
      { q: "كيف أحسّن أدائي الذهني فعلاً؟", a: "الأداء الذهني يتحسّن كما الجسدي — نقيس مستوى الانطلاق، نستهدف الحلقة الأضعف (التركيز، النوم، تنظيم الانفعال، التعافي)، ندرّبها ٦-٨ أسابيع مع أخصّائي، ثم نُعيد القياس. نستخدم بروتوكولات معتمَدة (CBT، ACT، EMDR، سيكولوجيا الأداء) وفق هدفك — لا نصائح عامّة." },
      { q: "كيف أبني الصلابة الذهنية وأكفّ عن الإفراط في التفكير؟", a: "الصلابة الذهنية ليست إرادة — إنّها تحمُّل مُدرَّب لعدم الراحة مع إطار قرار واضح. في ٤-٦ جلسات تتعلّم فصل الإشارة عن الضوضاء، وفكّ الالتصاق المعرفي مع الأفكار المُقتحمة، وتكرار مواقف الضغط. الرياضيون والمؤسّسون والقادة يستخدمون نفس البروتوكول." },
      { q: "هل يمكن للأخصّائي النفسي أن يساعدني فعلاً على التركيز والإنتاجية؟", a: "نعم — عندما يكون السبب نفسياً (قلق، سمات ADHD، احتراق نفسي، كماليّة) لا مجرّد أدوات. نفحص ذلك في الجلسة الأولى بأدوات معتمَدة (GAD-7، PHQ-9، ADHD للبالغين)، ثم نبني بروتوكول تركيز يومياً. أغلب العملاء يلاحظون فرقاً قابلاً للقياس خلال ٣-٤ أسابيع." },
      { q: "ما سبب الضباب الذهني وكيف أزيله؟", a: "الضباب الذهني عادةً تراكم: نوم متردٍّ، ضغط مزمن، قلق غير منظَّم، التهاب ما بعد فيروسي، أو نقص غذائي. يرسم الأخصّائي المحرّكات، ويعالج الحمل النفسي (CBT-I للنوم، بروتوكولات الضغط، الاجترار)، ويحيل للطبيب للأسباب الطبية. أغلب الناس يشعرون بفرق واضح خلال ٢-٤ أسابيع." },
      { q: "كيف يدرّب أصحاب الأداء العالي عقولهم — رياضيون، مؤسّسون، تنفيذيون؟", a: "ثلاث روافع: (١) قياس مرجعي (الانتباه، التعافي، التنظيم الانفعالي، جودة القرار)، (٢) بروتوكولات موجَّهة — التصوّر الذهني، ضبط الاستثارة، فكّ الالتصاق المعرفي، روتين ما قبل الأداء، (٣) تكرار أسبوعي تحت ضغط محاكى. نعمل مع رياضيين محترفين ومدراء تنفيذيين ومؤسّسين بنفس المقاربة." },
      { q: "بم يختلف هذا عن تطبيقات التأمّل أو التنمية الذاتية؟", a: "التطبيقات تقدّم تمارين عامّة. الأخصّائي يقود: تقييم ← تشخيص ← بروتوكول شخصي ← مساءلة أسبوعية ← نتائج قابلة للقياس. لست تخمّن أي تقنية تجرّب — بل تنفّذ ما يناسب ملفّك مع من يتتبّع فاعليّتها." },
      { q: "ماذا لو لم أتناغم مع أخصّائيي؟", a: "تحصل على إعادة حجز مجانية مع أخصّائي آخر — دون أسئلة. الجلسة الأولى للعثور على الشخص المناسب لا للدفع مرتين." },
      { q: "كم تكلفة الجلسة؟", a: "من ٦٠٠ درهم / ٥٥ يورو / ٦٠ دولار للجلسة الفردية ٥٠ دقيقة. حزم ٤ جلسات توفّر ~٨٪. متابعة شهرية من ٢٬٤٠٠ درهم. السعر الدقيق على صفحة كل أخصّائي — بعملتك المحلية." },
      { q: "هل هي سريّة؟ ماذا عن ربّ العمل أو التأمين؟", a: "سريّة تماماً. نلتزم بالقانون المغربي ٠٩-٠٨ لحماية المعطيات الشخصية. لا شيء يُشارك مع ربّ العمل أو التأمين أو الأسرة دون موافقتك المكتوبة. الجلسات مشفّرة من طرف إلى طرف." },
      { q: "بأي لغة تُعقد الجلسات؟", a: "العربية (الدارجة والفصحى)، الفرنسية، الإنجليزية — والإسبانية والبرتغالية والإيطالية مع بعض الأخصّائيين. صفِّ حسب اللغة عند الاختيار." },
      { q: "فيديو أم حضورياً؟", a: "كلاهما. كل الأخصّائيين يوفّرون جلسات فيديو آمنة في أي منطقة زمنية. الجلسات الحضورية متاحة في مدن مختارة — صفِّ حسب المدينة على الدليل." },
      { q: "هل تقبلون التأمين؟", a: "نُصدر فاتورة مطابِقة تقدّمها إلى مؤسّستك (CNSS/CNOPS بالمغرب، أو التأمين الخاص دولياً). أغلب التأمينات الخاصة تعوّض ٤٠-٧٠٪ من جلسات علم النفس." },
      { q: "بأي سرعة يمكنني الحجز؟", a: "أغلب الأخصّائيين لديهم مواعيد خلال ٤٨ ساعة. بعضهم يقدّم جلسات في نفس اليوم. تُعرض التوفّرات مباشرة على كل صفحة." },
    ],
  },
  featured: {
    "featured.eyebrow": "أخصّائيون نفسيون معتمَدون",
    "featured.titleConversion": "احجز مع من يناسبك — هذا الأسبوع.",
    "featured.subtitleConversion":
      "كل أخصّائي معتمَد ومدقَّق ومتاح لجلسة ٥٠ دقيقة. إعادة حجز مجانية إن لم يكن الملاءم.",
    "featured.slot.today": "اليوم، ٦:٣٠ مساءً",
    "featured.slot.tomorrowMorning": "غداً، ٩:٠٠ صباحاً",
    "featured.slot.tomorrowAfternoon": "غداً، ٣:٠٠ مساءً",
    "featured.slot.thisWeek": "هذا الأسبوع، الخميس ٥:٠٠ مساءً",
    "featured.availableToday": "متاح اليوم",
    "featured.videoOrInPerson": "فيديو أو حضورياً",
    "featured.nextAvailable": "أقرب موعد",
    "featured.session50": "جلسة ٥٠ دقيقة",
    "featured.bookNow": "احجز موعداً",
    "featured.viewProfile": "عرض الملف",
    "featured.guarantee": "إعادة حجز مجانية إن لم يكن الملاءم",
    "featured.viewAllConversion": "تصفّح كل الأخصّائيين (+٥٠)",
  },
  seo: {
    title: "يوپسي — احجز أخصّائي نفسي معتمَد. حول العالم، في أي منطقة زمنية.",
    description:
      "احجز جلسة ٥٠ دقيقة مع أخصّائي نفسي معتمَد — فيديو حول العالم أو حضورياً في مدن مختارة. عربية، فرنسية، إنجليزية، إسبانية أو برتغالية. إعادة حجز مجانية إن لم يكن الملاءم.",
  },
};

// Berber falls back to Arabic strings for now.
const ber: HomeCopy = ar;

const registry: Record<Locale, HomeCopy> = { en, fr, ar, ber };

export const getHomeCopy = (locale: Locale): HomeCopy => registry[locale] ?? en;
export type { HomeCopy };