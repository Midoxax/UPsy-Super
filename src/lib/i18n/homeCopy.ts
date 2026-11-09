// Per-locale copy for the marketing homepage (hero v7, pricing, FAQ, featured).
// Kept out of the giant translations.ts to make edits low-risk.
// BER falls back to AR when a specific Berber string is not provided.

import type { Locale } from "@/lib/i18n/utils";

type HeroCopy = {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  /** Rotating second line of the headline; the first is the one search engines see. */
  rotating: string[];
  tagline: string;
  /** Reassurance under the buttons. */
  closing: string[];
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
  scoreLabel: string;
  scoreSub: string;
  langLabel: string;
  langSub: string;
  formatLabel: string;
  formatValue: string;
  privacyLabel: string;
  privacyValue: string;
  performanceTiers: string;
  tiers: string[];
  tickerItems: string[];
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
  faq: FAQCopy;
  featured: FeaturedCopy;
  seo: SEOCopy;
};

const en: HomeCopy = {
  hero: {
    eyebrow: "Verified psychologists · Video or in person",
    headlineLine1: "Your psychologist in Morocco,",
    headlineLine2: "online or in person.",
    rotating: [
      "online or in person.",
      "for anxiety and stress.",
      "to beat burnout.",
      "for athletes' performance.",
      "for your teams.",
      "in your language.",
    ],
    tagline: "Psychology built for performance under pressure.",
    body: "Find a verified psychologist and book online: anxiety, depression, stress, burnout, mental preparation for sport. Video sessions anywhere in Morocco and abroad, or in person. Clear fees, fully confidential.",
    closing: [
      "Free score in 2 minutes",
      "No commitment",
      "Confidential · Law 09-08",
    ],
    ctaPrimary: "TAKE THE FREE SCORE",
    ctaSecondary: "MATCH WITH A SPECIALIST",
    scoreLabel: "Questions",
    scoreSub: "Free score · 2 min",
    langLabel: "Languages",
    langSub: "Darija · Arabic · French · English",
    formatLabel: "Format",
    formatValue: "Video or in person",
    privacyLabel: "Confidential",
    privacyValue: "Law 09-08",
    performanceTiers: "Built for",
    tiers: ["Individuals", "Athletes", "Clubs & federations", "Companies"],
    tickerItems: [
      "Verified psychologists",
      "Video or in person",
      "Four languages",
      "Confidential · Law 09-08",
    ],
  },
  faq: {
    eyebrow: "Straight answers",
    titleBefore: "The things people ",
    titleItalic: "actually",
    titleAfter: " ask before booking",
    items: [
      {
        q: "How do I actually improve my mental performance?",
        a: "Mental performance improves the same way physical performance does — measure a baseline, target the weakest link (focus, sleep, emotional regulation, or recovery), train it for 6–8 weeks with a psychologist, then re-measure. Our psychologists use validated protocols (CBT, ACT, EMDR, performance psychology) matched to your goal, not generic advice.",
      },
      {
        q: "How do I build mental toughness and stop overthinking?",
        a: "Mental toughness isn't willpower — it's trained tolerance for discomfort plus a clean decision framework. In 4–6 sessions you learn to separate signal from noise, run cognitive defusion on intrusive thoughts, and rehearse pressure situations. Athletes, founders, and executives use the same protocol.",
      },
      {
        q: "Can a psychologist really help me focus and be more productive?",
        a: "Yes — when the root cause is psychological (anxiety, ADHD traits, burnout, perfectionism) rather than tooling. We screen for it in session 1 using validated instruments (GAD-7, PHQ-9, adult ADHD), then build a focus protocol you can run daily. Most clients report measurable change within 3–4 weeks.",
      },
      {
        q: "What causes brain fog and how do I clear it?",
        a: "Brain fog is usually a stack: poor sleep architecture, chronic stress load, unregulated anxiety, post-viral inflammation, or nutrient gaps. A psychologist maps which drivers apply to you, treats the psychological load (CBT-I for sleep, stress protocols, rumination work), and refers out for medical drivers. Most people feel a clear lift in 2–4 weeks.",
      },
      {
        q: "How do high performers train their mind — athletes, founders, executives?",
        a: "Same three levers: (1) baseline measurement (attention, recovery, emotional regulation, decision quality), (2) targeted protocols — visualization, arousal control, cognitive defusion, pre-performance routines, (3) weekly reps under simulated pressure. Our performance psychologists work with pro athletes, C-suite operators, and founders on the same stack.",
      },
      {
        q: "How is this different from meditation apps or self-help?",
        a: "Apps give you generic exercises. A psychologist runs assessment → diagnosis → personalized protocol → weekly accountability → measurable outcomes. You're not guessing which technique to try — you're running the specific one that fits your profile, with someone tracking whether it's working.",
      },
      {
        q: "What if I don't click with my psychologist?",
        a: "Tell us, or simply book someone else: you are never tied to one psychologist. The fit between you matters as much as the method, and changing is normal.",
      },
      {
        q: "How much does a session cost?",
        a: "Each psychologist sets their own fee, usually between 250 and 800 MAD for a single session. You see the exact price on their profile before you book, and packs of 5 to 20 sessions lower the price per session.",
      },
      {
        q: "Is it confidential? What about my employer or insurance?",
        a: "Fully confidential. We follow Moroccan Law 09-08 on personal data. Nothing is shared with your employer, insurance, or family without your written consent. Sessions are encrypted in transit.",
      },
      {
        q: "In what language are sessions held?",
        a: "Darija, Modern Standard Arabic, French and English, depending on the psychologist. Each profile lists the languages they work in.",
      },
      {
        q: "Video or in-person?",
        a: "Both. Every psychologist offers secure video sessions worldwide (any timezone). In-person visits are available in select cities — filter by city on the directory.",
      },
      {
        q: "Do you take insurance?",
        a: "We issue a compliant invoice you can submit to your provider (CNSS/CNOPS in Morocco, private health plans internationally). Most private policies reimburse 40–70% of psychology sessions.",
      },
      {
        q: "How fast can I book?",
        a: "Most psychologists have slots within 48 hours. Some offer same-day sessions. Availability is shown live on each profile.",
      },
    ],
  },
  featured: {
    "featured.eyebrow": "Accredited psychologists",
    "featured.titleConversion": "Book with someone who fits — this week.",
    "featured.subtitleConversion":
      "Every psychologist is licensed and verified by U.Psy before their profile goes live. Fees and times are on each profile.",
    "featured.videoOrInPerson": "Video or in-person",
    "featured.nextAvailable": "Next available",
    "featured.session50": "50-min session",
    "featured.bookNow": "Book a slot",
    "featured.viewProfile": "View profile",
    "featured.viewAllConversion": "Browse all psychologists",
    "featured.offersVideo": "Offers video sessions",
    "featured.newOnUpsy": "New on U.Psy",
    "featured.feesOnProfile": "Fees on the profile",
    "featured.verified": "Diploma and identity checked by U.Psy",
  },
  seo: {
    title:
      "U.Psy — Book an accredited psychologist. Worldwide, in any timezone.",
    description:
      "Book a 50-min session with an accredited psychologist — video anywhere in the world, or in-person in select cities. In Darija, Arabic, French or English.",
  },
};

const fr: HomeCopy = {
  hero: {
    eyebrow: "Psychologues vérifiés · Visio ou cabinet",
    headlineLine1: "Votre psychologue au Maroc,",
    headlineLine2: "en ligne ou au cabinet.",
    rotating: [
      "en ligne ou au cabinet.",
      "pour l'anxiété et le stress.",
      "contre le burn-out.",
      "pour la performance des sportifs.",
      "pour vos équipes.",
      "dans votre langue.",
    ],
    tagline: "La psychologie conçue pour la performance sous pression.",
    body: "Trouvez un psychologue vérifié et réservez en ligne : anxiété, dépression, stress, burn-out, préparation mentale du sportif. Séances en visio partout au Maroc et à l'étranger, ou au cabinet. Tarifs affichés, confidentialité totale.",
    closing: [
      "Score gratuit en 2 minutes",
      "Sans engagement",
      "Confidentiel · loi 09-08",
    ],
    ctaPrimary: "FAIRE LE SCORE GRATUIT",
    ctaSecondary: "TROUVER UN SPÉCIALISTE",
    scoreLabel: "Questions",
    scoreSub: "Score gratuit · 2 min",
    langLabel: "Langues",
    langSub: "Darija · arabe · français · anglais",
    formatLabel: "Format",
    formatValue: "Visio ou cabinet",
    privacyLabel: "Confidentiel",
    privacyValue: "Loi 09-08",
    performanceTiers: "Pour qui",
    tiers: ["Particuliers", "Sportifs", "Clubs et fédérations", "Entreprises"],
    tickerItems: [
      "Psychologues vérifiés",
      "Visio ou cabinet",
      "Quatre langues",
      "Confidentiel · loi 09-08",
    ],
  },
  faq: {
    eyebrow: "Réponses directes",
    titleBefore: "Ce que les gens demandent ",
    titleItalic: "vraiment",
    titleAfter: " avant de réserver",
    items: [
      {
        q: "Comment améliorer réellement ma performance mentale ?",
        a: "La performance mentale s'améliore comme la performance physique — mesurer un niveau de départ, cibler le maillon faible (concentration, sommeil, régulation émotionnelle, récupération), l'entraîner 6 à 8 semaines avec un psychologue, puis re-mesurer. Nos psychologues utilisent des protocoles validés (TCC, ACT, EMDR, psychologie de la performance) adaptés à votre objectif — pas de conseils génériques.",
      },
      {
        q: "Comment développer la force mentale et arrêter de trop réfléchir ?",
        a: "La force mentale n'est pas de la volonté — c'est une tolérance entraînée à l'inconfort plus un cadre de décision clair. En 4 à 6 séances, vous apprenez à séparer le signal du bruit, à défuser les pensées intrusives et à répéter les situations sous pression. Athlètes, fondateurs et cadres utilisent le même protocole.",
      },
      {
        q: "Un psychologue peut-il vraiment m'aider à me concentrer et à être plus productif ?",
        a: "Oui — lorsque la cause profonde est psychologique (anxiété, traits TDAH, burn-out, perfectionnisme) plutôt que d'outils. On la dépiste à la 1ʳᵉ séance avec des instruments validés (GAD-7, PHQ-9, TDAH adulte), puis on construit un protocole de concentration quotidien. La plupart des clients notent un changement mesurable en 3 à 4 semaines.",
      },
      {
        q: "Qu'est-ce qui cause le brouillard mental et comment le dissiper ?",
        a: "Le brouillard mental est un empilement : sommeil de mauvaise qualité, stress chronique, anxiété non régulée, inflammation post-virale ou déficits nutritionnels. Un psychologue cartographie les moteurs, traite la charge psychologique (TCC-I pour le sommeil, protocoles de stress, travail sur la rumination) et oriente pour les causes médicales. La plupart des personnes ressentent un net mieux en 2 à 4 semaines.",
      },
      {
        q: "Comment les hauts performeurs entraînent-ils leur mental — athlètes, fondateurs, dirigeants ?",
        a: "Trois leviers : (1) mesure de départ (attention, récupération, régulation émotionnelle, qualité de décision), (2) protocoles ciblés — visualisation, contrôle de l'activation, défusion cognitive, routines de pré-performance, (3) répétitions hebdomadaires sous pression simulée. Nos psychologues de la performance travaillent avec des athlètes pros, des dirigeants et des fondateurs sur la même approche.",
      },
      {
        q: "En quoi est-ce différent des applis de méditation ou du développement personnel ?",
        a: "Les applis donnent des exercices génériques. Un psychologue mène évaluation → diagnostic → protocole personnalisé → responsabilité hebdomadaire → résultats mesurables. Vous ne devinez pas quelle technique essayer — vous appliquez celle qui correspond à votre profil, avec un suivi de son efficacité.",
      },
      {
        q: "Et si le courant ne passe pas avec mon psychologue ?",
        a: "Dites-le-nous, ou réservez simplement avec quelqu'un d'autre : vous n'êtes jamais lié à un seul psychologue. L'accord entre vous compte autant que la méthode, et changer est normal.",
      },
      {
        q: "Combien coûte une séance ?",
        a: "Chaque psychologue fixe son tarif, en général entre 250 et 800 MAD la séance individuelle. Le prix exact est affiché sur son profil avant la réservation, et les packs de 5 à 20 séances réduisent le prix par séance.",
      },
      {
        q: "Est-ce confidentiel ? Et vis-à-vis de mon employeur ou de mon assurance ?",
        a: "Totalement confidentiel. Nous respectons la loi marocaine 09-08 sur les données personnelles. Rien n'est partagé avec votre employeur, votre assurance ou votre famille sans votre accord écrit. Les séances sont chiffrées pendant leur transmission.",
      },
      {
        q: "Dans quelle langue se déroulent les séances ?",
        a: "Darija, arabe standard, français et anglais, selon le psychologue. Chaque profil indique ses langues de travail.",
      },
      {
        q: "En visio ou en cabinet ?",
        a: "Les deux. Tous les psychologues proposent des séances vidéo sécurisées partout dans le monde (tous fuseaux horaires). Les séances en cabinet sont disponibles dans certaines villes — filtrez par ville sur l'annuaire.",
      },
      {
        q: "Prenez-vous en charge les assurances ?",
        a: "Nous émettons une facture conforme à soumettre à votre organisme (CNSS/CNOPS au Maroc, mutuelles privées à l'international). La plupart des mutuelles privées remboursent 40 à 70 % des séances de psychologie.",
      },
      {
        q: "En combien de temps puis-je réserver ?",
        a: "La plupart des psychologues ont des créneaux sous 48 h. Certains proposent des séances le jour même. La disponibilité s'affiche en direct sur chaque profil.",
      },
    ],
  },
  featured: {
    "featured.eyebrow": "Psychologues accrédités",
    "featured.titleConversion":
      "Réservez avec quelqu'un qui vous correspond — cette semaine.",
    "featured.subtitleConversion":
      "Chaque psychologue est diplômé et vérifié par U.Psy avant la mise en ligne de son profil. Tarifs et créneaux sur chaque profil.",
    "featured.videoOrInPerson": "Visio ou cabinet",
    "featured.nextAvailable": "Prochain créneau",
    "featured.session50": "séance de 50 min",
    "featured.bookNow": "Réserver un créneau",
    "featured.viewProfile": "Voir le profil",
    "featured.viewAllConversion": "Voir tous les psychologues",
    "featured.offersVideo": "Propose des séances en visio",
    "featured.newOnUpsy": "Nouveau sur U.Psy",
    "featured.feesOnProfile": "Tarifs sur le profil",
    "featured.verified": "Diplôme et identité vérifiés par U.Psy",
  },
  seo: {
    title:
      "U.Psy — Réservez un psychologue accrédité. Partout, sur tous fuseaux.",
    description:
      "Réservez une séance de 50 min avec un psychologue accrédité — en visio partout dans le monde ou en cabinet dans certaines villes. En darija, arabe, français ou anglais.",
  },
};

const ar: HomeCopy = {
  hero: {
    eyebrow: "أخصائيون نفسيون موثوقون · عن بعد أو في العيادة",
    headlineLine1: "أخصائيك النفسي في المغرب،",
    headlineLine2: "عن بعد أو في العيادة.",
    rotating: [
      "عن بعد أو في العيادة.",
      "للقلق والضغط النفسي.",
      "لتجاوز الاحتراق المهني.",
      "لأداء الرياضيين.",
      "لفرق عملك.",
      "بلغتك.",
    ],
    tagline: "علم نفس مصمَّم للأداء تحت الضغط.",
    body: "اعثر على أخصائي نفسي موثوق واحجز عبر الإنترنت: القلق، الاكتئاب، الضغط، الاحتراق المهني، التحضير الذهني للرياضيين. حصص عن بعد في كل المغرب وخارجه، أو في العيادة. أسعار واضحة وسرية تامة.",
    closing: ["مؤشر مجاني في دقيقتين", "دون التزام", "سري · القانون 09-08"],
    ctaPrimary: "اجتز المؤشر المجاني",
    ctaSecondary: "طابقني مع مختصّ",
    scoreLabel: "أسئلة",
    scoreSub: "مؤشر مجاني · دقيقتان",
    langLabel: "لغات",
    langSub: "الدارجة · العربية · الفرنسية · الإنجليزية",
    formatLabel: "الصيغة",
    formatValue: "عن بعد أو في العيادة",
    privacyLabel: "سري",
    privacyValue: "القانون 09-08",
    performanceTiers: "لمن",
    tiers: ["الأفراد", "الرياضيون", "الأندية والجامعات", "الشركات"],
    tickerItems: [
      "أخصائيون نفسيون موثَّقون",
      "عن بعد أو في العيادة",
      "أربع لغات",
      "سري · القانون 09-08",
    ],
  },
  faq: {
    eyebrow: "أجوبة مباشرة",
    titleBefore: "ما يسأله الناس ",
    titleItalic: "فعلاً",
    titleAfter: " قبل الحجز",
    items: [
      {
        q: "كيف أحسّن أدائي الذهني فعلاً؟",
        a: "الأداء الذهني يتحسّن كما الجسدي — نقيس مستوى الانطلاق، نستهدف الحلقة الأضعف (التركيز، النوم، تنظيم الانفعال، التعافي)، ندرّبها ٦-٨ أسابيع مع أخصّائي، ثم نُعيد القياس. نستخدم بروتوكولات معتمَدة (CBT، ACT، EMDR، سيكولوجيا الأداء) وفق هدفك — لا نصائح عامّة.",
      },
      {
        q: "كيف أبني الصلابة الذهنية وأكفّ عن الإفراط في التفكير؟",
        a: "الصلابة الذهنية ليست إرادة — إنّها تحمُّل مُدرَّب لعدم الراحة مع إطار قرار واضح. في ٤-٦ جلسات تتعلّم فصل الإشارة عن الضوضاء، وفكّ الالتصاق المعرفي مع الأفكار المُقتحمة، وتكرار مواقف الضغط. الرياضيون والمؤسّسون والقادة يستخدمون نفس البروتوكول.",
      },
      {
        q: "هل يمكن للأخصّائي النفسي أن يساعدني فعلاً على التركيز والإنتاجية؟",
        a: "نعم — عندما يكون السبب نفسياً (قلق، سمات ADHD، احتراق نفسي، كماليّة) لا مجرّد أدوات. نفحص ذلك في الجلسة الأولى بأدوات معتمَدة (GAD-7، PHQ-9، ADHD للبالغين)، ثم نبني بروتوكول تركيز يومياً. أغلب العملاء يلاحظون فرقاً قابلاً للقياس خلال ٣-٤ أسابيع.",
      },
      {
        q: "ما سبب الضباب الذهني وكيف أزيله؟",
        a: "الضباب الذهني عادةً تراكم: نوم متردٍّ، ضغط مزمن، قلق غير منظَّم، التهاب ما بعد فيروسي، أو نقص غذائي. يرسم الأخصّائي المحرّكات، ويعالج الحمل النفسي (CBT-I للنوم، بروتوكولات الضغط، الاجترار)، ويحيل للطبيب للأسباب الطبية. أغلب الناس يشعرون بفرق واضح خلال ٢-٤ أسابيع.",
      },
      {
        q: "كيف يدرّب أصحاب الأداء العالي عقولهم — رياضيون، مؤسّسون، تنفيذيون؟",
        a: "ثلاث روافع: (١) قياس مرجعي (الانتباه، التعافي، التنظيم الانفعالي، جودة القرار)، (٢) بروتوكولات موجَّهة — التصوّر الذهني، ضبط الاستثارة، فكّ الالتصاق المعرفي، روتين ما قبل الأداء، (٣) تكرار أسبوعي تحت ضغط محاكى. نعمل مع رياضيين محترفين ومدراء تنفيذيين ومؤسّسين بنفس المقاربة.",
      },
      {
        q: "بم يختلف هذا عن تطبيقات التأمّل أو التنمية الذاتية؟",
        a: "التطبيقات تقدّم تمارين عامّة. الأخصّائي يقود: تقييم ← تشخيص ← بروتوكول شخصي ← مساءلة أسبوعية ← نتائج قابلة للقياس. لست تخمّن أي تقنية تجرّب — بل تنفّذ ما يناسب ملفّك مع من يتتبّع فاعليّتها.",
      },
      {
        q: "ماذا لو لم أتناغم مع أخصّائيي؟",
        a: "أخبرنا أو احجز ببساطة مع أخصّائي آخر: لست مرتبطاً بأخصّائي واحد. التوافق بينكما مهم بقدر المنهج، والتغيير أمر طبيعي.",
      },
      {
        q: "كم تكلفة الجلسة؟",
        a: "يحدّد كل أخصائي نفسي أتعابه، عادةً بين 250 و800 درهم للجلسة الفردية. ترى السعر الدقيق على صفحته قبل الحجز، وتخفّض باقات من 5 إلى 20 جلسة سعر الجلسة الواحدة.",
      },
      {
        q: "هل هي سريّة؟ ماذا عن ربّ العمل أو التأمين؟",
        a: "سريّة تماماً. نلتزم بالقانون المغربي ٠٩-٠٨ لحماية المعطيات الشخصية. لا شيء يُشارك مع ربّ العمل أو التأمين أو الأسرة دون موافقتك المكتوبة. الجلسات مشفّرة أثناء النقل.",
      },
      {
        q: "بأي لغة تُعقد الجلسات؟",
        a: "الدارجة والعربية الفصحى والفرنسية والإنجليزية، حسب الأخصّائي. يذكر كل ملف لغات العمل.",
      },
      {
        q: "فيديو أم حضورياً؟",
        a: "كلاهما. كل الأخصّائيين يوفّرون جلسات فيديو آمنة في أي منطقة زمنية. الجلسات الحضورية متاحة في مدن مختارة — صفِّ حسب المدينة على الدليل.",
      },
      {
        q: "هل تقبلون التأمين؟",
        a: "نُصدر فاتورة مطابِقة تقدّمها إلى مؤسّستك (CNSS/CNOPS بالمغرب، أو التأمين الخاص دولياً). أغلب التأمينات الخاصة تعوّض ٤٠-٧٠٪ من جلسات علم النفس.",
      },
      {
        q: "بأي سرعة يمكنني الحجز؟",
        a: "أغلب الأخصّائيين لديهم مواعيد خلال ٤٨ ساعة. بعضهم يقدّم جلسات في نفس اليوم. تُعرض التوفّرات مباشرة على كل صفحة.",
      },
    ],
  },
  featured: {
    "featured.eyebrow": "أخصّائيون نفسيون معتمَدون",
    "featured.titleConversion": "احجز مع من يناسبك — هذا الأسبوع.",
    "featured.subtitleConversion":
      "تتحقّق U.Psy من شهادة كل أخصّائي وهويته قبل نشر ملفه. الأسعار والمواعيد في كل ملف.",
    "featured.videoOrInPerson": "فيديو أو حضورياً",
    "featured.nextAvailable": "أقرب موعد",
    "featured.session50": "جلسة ٥٠ دقيقة",
    "featured.bookNow": "احجز موعداً",
    "featured.viewProfile": "عرض الملف",
    "featured.viewAllConversion": "تصفّح كل الأخصّائيين",
    "featured.offersVideo": "يقدّم جلسات عبر الفيديو",
    "featured.newOnUpsy": "جديد على U.Psy",
    "featured.feesOnProfile": "الأسعار في الملف",
    "featured.verified": "الشهادة والهوية متحقَّق منهما من U.Psy",
  },
  seo: {
    title: "يوپسي — احجز أخصّائي نفسي معتمَد. حول العالم، في أي منطقة زمنية.",
    description:
      "احجز جلسة ٥٠ دقيقة مع أخصّائي نفسي معتمَد — فيديو حول العالم أو حضورياً في مدن مختارة. بالدارجة أو العربية أو الفرنسية أو الإنجليزية.",
  },
};

// Berber falls back to Arabic strings for now.
const ber: HomeCopy = ar;

const registry: Record<Locale, HomeCopy> = { en, fr, ar, ber };

export const getHomeCopy = (locale: Locale): HomeCopy => registry[locale] ?? en;
export type { HomeCopy };
