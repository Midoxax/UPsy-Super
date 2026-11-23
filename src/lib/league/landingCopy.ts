import { useLocale } from "@/contexts/LocaleContext";

/** Copy of the LSSPM × U.Psy partnership page (/campaigns/lsspm). */

type Item = { title: string; text: string };

const fr = {
  seoTitle:
    "LSSPM × U.Psy — Rejoignez la Ligue des Spécialistes de la Santé Psychique et Mentale",
  seoDescription:
    "La Ligue des spécialistes de la santé mentale et U.Psy s'associent : adhésion, carte de membre numérique, formations, supervision, visibilité auprès des patients et 3 mois sans commission.",
  eyebrow: "LSSPM × U.Psy · Partenariat officiel",
  title: "La Ligue des spécialistes,",
  titleAccent: "connectée à tout le Maroc.",
  lead: "La LSSPM réunit les spécialistes de la santé psychique et mentale autour d'une même exigence : une pratique éthique, supervisée et reconnue par les pairs. Avec U.Psy, cette exigence devient un réseau que chaque patient peut trouver, en cabinet comme en ligne.",
  ctaJoin: "Rejoindre la Ligue",
  ctaRules: "Lire le règlement intérieur",
  scroll: "Découvrir",
  stats: [
    { value: 4, suffix: "", label: "pôles d'action" },
    { value: 6, suffix: "", label: "spécialités évaluées au recrutement" },
    { value: 1, suffix: "", label: "dossier pour deux validations" },
    { value: 3, suffix: " mois", label: "sans commission U.Psy" },
  ],
  partnershipKicker: "Le partenariat",
  partnershipTitle: "Deux forces, un même standard.",
  leagueBrings: "La Ligue apporte",
  leagueItems: [
    "L'exigence éthique et déontologique de la profession",
    "La supervision et l'intervision entre pairs",
    "La formation continue et les journées scientifiques",
    "La représentation des spécialistes auprès des institutions",
  ],
  upsyBrings: "U.Psy apporte",
  upsyItems: [
    "Un profil accrédité, visible par les patients de tout le Maroc",
    "Rendez-vous, visio, rappels et paiements sécurisés",
    "Des outils cliniques : échelles validées, dossiers, suivi",
    "La conformité à la loi 09-08 et un hébergement protégé",
  ],
  together: "Ensemble",
  togetherText:
    "Un réseau national de spécialistes vérifiés : chaque patient sait que son praticien est évalué, supervisé et engagé.",
  potentialTitle: "Ce que le partenariat rend possible",
  potential: [
    {
      title: "Pour les patients",
      text: "Trouver en confiance un spécialiste vérifié, près de chez soi ou à distance, et savoir qu'il répond d'une charte éthique.",
    },
    {
      title: "Pour les membres",
      text: "Plus de visibilité, des outils modernes et une communauté qui fait progresser.",
    },
    {
      title: "Pour la profession",
      text: "Des données anonymisées, des études et des publications pour faire avancer la santé mentale au Maroc.",
    },
  ] as Item[],
  perksKicker: "L'adhésion",
  perksTitle: "Les avantages des membres",
  perks: [
    {
      title: "Carte de membre numérique",
      text: "Photo, numéro de membre et QR code : chacun vérifie en un scan qu'elle est valide.",
    },
    {
      title: "Attestation et reçus officiels",
      text: "Attestation d'adhésion numérotée et reçu pour chaque paiement, téléchargeables à tout moment.",
    },
    {
      title: "3 mois sans commission U.Psy",
      text: "Dès la confirmation de votre première adhésion, sur vos consultations réservées via U.Psy.",
    },
    {
      title: "Tarifs membres sur les publications",
      text: "Livrets et publications de la Ligue au tarif membre, dès votre adhésion confirmée.",
    },
    {
      title: "Formations et journées scientifiques",
      text: "Ateliers, formation continue et événements portés par le pôle formation.",
    },
    {
      title: "Supervision et intervision",
      text: "Un pôle dédié à la pratique clinique : supervision entre pairs, qualité et éthique.",
    },
    {
      title: "Recherche et publications",
      text: "Contribuez aux études et aux livrets de la Ligue, et publiez avec elle.",
    },
    {
      title: "Réseau et visibilité",
      text: "Partenariats, congrès et campagnes : la Ligue porte la voix de ses membres.",
    },
    {
      title: "Votre engagement reconnu",
      text: "Vos contributions sont validées et notées ; les membres les plus actifs sont mis en avant.",
    },
    {
      title: "Un bilan qui vous sert",
      text: "Le bilan de recrutement vous restitue votre profil de personnalité et de bien-être, avec un soutien si besoin.",
    },
  ] as Item[],
  whyKicker: "Pourquoi adhérer",
  whyTitle: "Une adhésion qui a de la valeur, parce qu'elle est exigeante.",
  whyText:
    "La Ligue choisit ses membres avec soin, puis les accompagne. Chacun s'engage à contribuer : la participation est évaluée chaque semestre par les pôles supervision et formation.",
  whyItems: [
    "Dossier vérifié : diplômes, autorisation d'exercice, inscription",
    "Bilan de recrutement : personnalité, équilibre psychologique, situations cliniques de votre spécialité",
    "Entretien et validation par le comité de la Ligue",
    "Règlement intérieur, déclaration sur l'honneur et charte éthique signés",
    "Participation suivie : contributions, évaluations, classement",
  ],
  journeyKicker: "Le parcours",
  journeyTitle: "Six étapes pour devenir membre",
  journey: [
    {
      title: "Déposez votre dossier",
      text: "Une seule fois, sur U.Psy : diplômes, autorisation, CV.",
    },
    {
      title: "Passez le bilan",
      text: "Environ 25 minutes : personnalité, bien-être, situations professionnelles.",
    },
    {
      title: "Rencontrez la Ligue",
      text: "Le comité étudie votre dossier et vous reçoit en entretien.",
    },
    {
      title: "Réglez votre cotisation",
      text: "Virement ou dépôt sur le compte de la Ligue ; reçu numéroté.",
    },
    {
      title: "Recevez votre carte",
      text: "Carte numérique avec QR code et attestation d'adhésion.",
    },
    {
      title: "Engagez-vous",
      text: "Choisissez votre pôle, écrivez votre projet, contribuez.",
    },
  ] as Item[],
  feesKicker: "Cotisations",
  feesTitle: "Catégories et cotisations annuelles",
  perYear: "MAD / an",
  granted: "Sur décision de la Ligue",
  optional: "Cotisation facultative",
  feesNote:
    "Cotisation par année civile (règlement intérieur, art. 8 et 9). Tarifs étudiants réservés aux moins de 30 ans, sur attestation d'inscription. Une adhésion validée à partir du 1er octobre est valable jusqu'au 31 décembre de l'année suivante.",
  cardKicker: "La carte",
  cardTitle: "Votre carte, vérifiable partout.",
  cardText:
    "Chaque membre reçoit une carte numérique aux couleurs de sa catégorie. Son QR code ouvre une page publique qui confirme, en temps réel, qu'elle est valide.",
  cardCategories: {
    founder: "Fondateur",
    official: "Adhérent",
    honorary: "Honoraire",
    supporter: "Sympathisant",
  } as Record<string, string>,
  cardName: "Dr Votre Nom",
  cardValid: "Valable jusqu'au 31/12/2027",
  cardHint: "Survolez la carte",
  faqKicker: "Questions",
  faqTitle: "Questions fréquentes",
  faq: [
    {
      title: "Qui peut adhérer ?",
      text: "Les spécialistes titulaires au moins d'un master en psychologie, psychiatrie ou santé mentale (membres adhérents), les doctorants et étudiants en master de moins de 30 ans, et les sympathisants qui soutiennent la Ligue.",
    },
    {
      title: "Je suis étudiant(e) et j'ai 30 ans ou plus ?",
      text: "Les tarifs étudiants sont réservés aux moins de 30 ans : vous adhérez dans la catégorie praticien.",
    },
    {
      title: "Combien de temps dure l'adhésion ?",
      text: "L'année civile, jusqu'au 31 décembre. Une adhésion validée à partir du 1er octobre court jusqu'à la fin de l'année suivante. Le renouvellement s'ouvre deux mois avant l'échéance, depuis votre tableau de bord ; votre numéro et votre QR code restent les mêmes.",
    },
    {
      title: "Que deviennent mes données ?",
      text: "Votre dossier U.Psy n'est partagé avec la Ligue qu'avec votre accord, révocable à tout moment, et jamais avec votre CIN ni votre RIB. Les données sont protégées conformément à la loi 09-08.",
    },
    {
      title: "Le bilan peut-il m'écarter ?",
      text: "Il éclaire la décision du comité, il ne décide jamais seul. Les résultats de bien-être servent au soutien et à la supervision, jamais à un refus automatique.",
    },
    {
      title: "Et si je ne participe pas ?",
      text: "La participation fait partie de l'engagement. Un membre sans contribution pendant six mois peut faire l'objet de la procédure prévue au règlement intérieur, toujours avec un droit de défense.",
    },
  ] as Item[],
  finalTitle: "Prêt(e) à rejoindre la Ligue ?",
  finalText:
    "Commencez votre dossier : la Ligue vous recontacte pour la suite.",
  formTitle: "Commencez votre adhésion",
  formSubtitle:
    "Laissez vos coordonnées, puis complétez votre dossier en 12 minutes environ.",
  formCta: "Commencer mon dossier",
  successTitle: "C'est noté 🤝",
  successBody:
    "Continuez maintenant votre dossier. À la dernière étape, cochez le partage avec la Ligue.",
  successCta: "Compléter mon dossier",
  formLabels: {
    name: "Nom complet",
    email: "Email",
    phone: "Téléphone / WhatsApp",
    org: "Cabinet / structure (facultatif)",
    whatsapp:
      "Recevoir aussi les nouvelles sur WhatsApp (facultatif, désinscription à tout moment).",
    consentBefore: "J'accepte de recevoir des messages de U.Psy et j'ai lu la",
    privacy: "politique de confidentialité",
    consentAfter: ". Données protégées par la loi 09-08 (CNDP).",
    noSpam: "Pas de spam. Désinscription en un clic dans chaque message.",
  },
};

type Copy = typeof fr;

const en: Copy = {
  ...fr,
  seoTitle:
    "LSSPM × U.Psy — Join the League of Specialists in Psychological and Mental Health",
  seoDescription:
    "The League of mental health specialists and U.Psy join forces: membership, digital member card, training, supervision, visibility to patients and 3 months without commission.",
  eyebrow: "LSSPM × U.Psy · Official partnership",
  title: "The League of specialists,",
  titleAccent: "connected across Morocco.",
  lead: "LSSPM brings mental health specialists together around one standard: ethical, supervised practice recognised by peers. With U.Psy, that standard becomes a network every patient can find, in person or online.",
  ctaJoin: "Join the League",
  ctaRules: "Read the internal rules",
  scroll: "Discover",
  stats: [
    { value: 4, suffix: "", label: "divisions" },
    { value: 6, suffix: "", label: "specialities assessed at recruitment" },
    { value: 1, suffix: "", label: "file for two validations" },
    { value: 3, suffix: " months", label: "without U.Psy commission" },
  ],
  partnershipKicker: "The partnership",
  partnershipTitle: "Two forces, one standard.",
  leagueBrings: "The League brings",
  leagueItems: [
    "The ethical and professional standards of the profession",
    "Peer supervision and intervision",
    "Continuing education and scientific days",
    "Representation of specialists to institutions",
  ],
  upsyBrings: "U.Psy brings",
  upsyItems: [
    "An accredited profile, visible to patients across Morocco",
    "Bookings, video sessions, reminders and secure payments",
    "Clinical tools: validated scales, records, follow-up",
    "Compliance with Law 09-08 and protected hosting",
  ],
  together: "Together",
  togetherText:
    "A national network of verified specialists: every patient knows their practitioner is assessed, supervised and committed.",
  potentialTitle: "What the partnership makes possible",
  potential: [
    {
      title: "For patients",
      text: "Find a verified specialist with confidence, nearby or remotely, bound by an ethics charter.",
    },
    {
      title: "For members",
      text: "More visibility, modern tools and a community that helps you grow.",
    },
    {
      title: "For the profession",
      text: "Anonymised data, studies and publications to advance mental health in Morocco.",
    },
  ],
  perksKicker: "Membership",
  perksTitle: "Member benefits",
  perks: [
    {
      title: "Digital member card",
      text: "Photo, member number and QR code: anyone can check it is valid with one scan.",
    },
    {
      title: "Official certificate and receipts",
      text: "A numbered membership certificate and a receipt for every payment, downloadable any time.",
    },
    {
      title: "3 months without U.Psy commission",
      text: "From the confirmation of your first membership, on sessions booked through U.Psy.",
    },
    {
      title: "Member prices on publications",
      text: "The League's booklets and publications at member prices, once your membership is confirmed.",
    },
    {
      title: "Training and scientific days",
      text: "Workshops, continuing education and events run by the training division.",
    },
    {
      title: "Supervision and intervision",
      text: "A division dedicated to clinical practice: peer supervision, quality and ethics.",
    },
    {
      title: "Research and publications",
      text: "Contribute to the League's studies and booklets, and publish with it.",
    },
    {
      title: "Network and visibility",
      text: "Partnerships, congresses and campaigns: the League speaks for its members.",
    },
    {
      title: "Your commitment recognised",
      text: "Your contributions are validated and scored; the most active members are highlighted.",
    },
    {
      title: "An assessment that serves you",
      text: "The recruitment assessment gives you your personality and well-being profile, with support if needed.",
    },
  ],
  whyKicker: "Why join",
  whyTitle: "A membership worth having, because it is demanding.",
  whyText:
    "The League chooses its members carefully, then supports them. Every member commits to contribute: participation is evaluated each semester by the supervision and training divisions.",
  whyItems: [
    "Verified file: degrees, licence to practise, registration",
    "Recruitment assessment: personality, psychological balance, clinical situations in your speciality",
    "Interview and approval by the League's committee",
    "Signed internal rules, sworn declaration and ethics charter",
    "Participation followed: contributions, evaluations, ranking",
  ],
  journeyKicker: "The journey",
  journeyTitle: "Six steps to membership",
  journey: [
    {
      title: "Submit your file",
      text: "Once, on U.Psy: degrees, licence, CV.",
    },
    {
      title: "Take the assessment",
      text: "About 25 minutes: personality, well-being, professional situations.",
    },
    {
      title: "Meet the League",
      text: "The committee reviews your file and interviews you.",
    },
    {
      title: "Pay your dues",
      text: "Transfer or deposit to the League's account; numbered receipt.",
    },
    {
      title: "Receive your card",
      text: "Digital card with QR code and membership certificate.",
    },
    {
      title: "Get involved",
      text: "Choose your division, write your project, contribute.",
    },
  ],
  feesKicker: "Dues",
  feesTitle: "Categories and annual dues",
  perYear: "MAD / year",
  granted: "Granted by the League",
  optional: "Optional dues",
  feesNote:
    "Dues per calendar year (internal rules, art. 8 and 9). Student rates for members under 30, with an enrolment certificate. A membership approved from 1 October runs to 31 December of the following year.",
  cardKicker: "The card",
  cardTitle: "Your card, verifiable anywhere.",
  cardText:
    "Every member receives a digital card in the colours of their category. Its QR code opens a public page that confirms, in real time, that it is valid.",
  cardCategories: {
    founder: "Founder",
    official: "Member",
    honorary: "Honorary",
    supporter: "Supporter",
  },
  cardName: "Dr Your Name",
  cardValid: "Valid until 31/12/2027",
  cardHint: "Hover over the card",
  faqKicker: "Questions",
  faqTitle: "Frequently asked questions",
  faq: [
    {
      title: "Who can join?",
      text: "Specialists holding at least a master's in psychology, psychiatry or mental health (members), PhD and master's students under 30, and supporters of the League.",
    },
    {
      title: "I am a student aged 30 or over?",
      text: "Student rates are for those under 30: you join in the practitioner category.",
    },
    {
      title: "How long does membership last?",
      text: "The calendar year, to 31 December. A membership approved from 1 October runs to the end of the following year. Renewal opens two months before it ends, from your dashboard; your number and QR code stay the same.",
    },
    {
      title: "What happens to my data?",
      text: "Your U.Psy file is shared with the League only with your consent, which you can withdraw at any time, and never with your ID card or bank details. Data is protected under Law 09-08.",
    },
    {
      title: "Can the assessment rule me out?",
      text: "It informs the committee's decision; it never decides alone. Well-being results are used for support and supervision, never for an automatic refusal.",
    },
    {
      title: "What if I don't take part?",
      text: "Participation is part of the commitment. A member with no contribution for six months may face the procedure set by the internal rules, always with the right to a defence.",
    },
  ],
  finalTitle: "Ready to join the League?",
  finalText: "Start your file: the League will contact you for the next steps.",
  formTitle: "Start your membership",
  formSubtitle:
    "Leave your details, then complete your file in about 12 minutes.",
  formCta: "Start my file",
  successTitle: "Noted 🤝",
  successBody:
    "Now continue your file. At the last step, tick sharing with the League.",
  successCta: "Complete my file",
  formLabels: {
    name: "Full name",
    email: "Email",
    phone: "Phone / WhatsApp",
    org: "Practice / clinic (optional)",
    whatsapp: "Send updates on WhatsApp too (optional, unsubscribe anytime).",
    consentBefore: "I agree to receive messages from U.Psy and I've read the",
    privacy: "privacy notice",
    consentAfter: ". Data protected under Moroccan Law 09-08 (CNDP).",
    noSpam: "No spam. One-click unsubscribe in every message.",
  },
};

const ar: Copy = {
  ...fr,
  seoTitle: "LSSPM × U.Psy — انضم إلى رابطة أخصائيي الصحة النفسية والعقلية",
  seoDescription:
    "رابطة أخصائيي الصحة النفسية وU.Psy معا: انخراط، بطاقة عضوية رقمية، تكوين، إشراف، حضور لدى المرضى، وثلاثة أشهر بدون عمولة.",
  eyebrow: "LSSPM × U.Psy · شراكة رسمية",
  title: "رابطة الأخصائيين،",
  titleAccent: "متصلة بكل المغرب.",
  lead: "تجمع الرابطة أخصائيي الصحة النفسية والعقلية حول معيار واحد: ممارسة أخلاقية، مؤطرة ومعترف بها من طرف الأقران. ومع U.Psy يصبح هذا المعيار شبكة يجدها كل مريض، في العيادة أو عن بعد.",
  ctaJoin: "انضم إلى الرابطة",
  ctaRules: "اقرأ القانون الداخلي",
  scroll: "اكتشف",
  stats: [
    { value: 4, suffix: "", label: "أقطاب عمل" },
    { value: 6, suffix: "", label: "تخصصات تقيم عند الانتقاء" },
    { value: 1, suffix: "", label: "ملف واحد لمصادقتين" },
    { value: 3, suffix: " أشهر", label: "بدون عمولة U.Psy" },
  ],
  partnershipKicker: "الشراكة",
  partnershipTitle: "قوتان، ومعيار واحد.",
  leagueBrings: "تقدم الرابطة",
  leagueItems: [
    "المعايير الأخلاقية والمهنية للمهنة",
    "الإشراف والتداول بين الأقران",
    "التكوين المستمر والأيام العلمية",
    "تمثيل الأخصائيين لدى المؤسسات",
  ],
  upsyBrings: "تقدم U.Psy",
  upsyItems: [
    "ملف معتمد يراه المرضى في كل المغرب",
    "مواعيد، جلسات عن بعد، تذكيرات وأداء آمن",
    "أدوات سريرية: مقاييس مصادق عليها، ملفات، تتبع",
    "احترام القانون 09-08 واستضافة محمية",
  ],
  together: "معا",
  togetherText:
    "شبكة وطنية من الأخصائيين الموثقين: يعرف كل مريض أن معالجه مقيم ومؤطر وملتزم.",
  potentialTitle: "ما تتيحه الشراكة",
  potential: [
    {
      title: "للمرضى",
      text: "إيجاد أخصائي موثق بثقة، قريبا أو عن بعد، ملتزم بميثاق أخلاقي.",
    },
    {
      title: "للأعضاء",
      text: "حضور أكبر، أدوات حديثة، ومجتمع يساعد على التطور.",
    },
    {
      title: "للمهنة",
      text: "معطيات مجهولة الهوية ودراسات ومنشورات للنهوض بالصحة النفسية في المغرب.",
    },
  ],
  perksKicker: "الانخراط",
  perksTitle: "امتيازات الأعضاء",
  perks: [
    {
      title: "بطاقة عضوية رقمية",
      text: "صورة ورقم عضوية ورمز QR: يمكن لأي شخص التحقق من صلاحيتها بمسح واحد.",
    },
    {
      title: "شهادة ووصولات رسمية",
      text: "شهادة انخراط مرقمة ووصل لكل أداء، قابلة للتحميل في أي وقت.",
    },
    {
      title: "ثلاثة أشهر بدون عمولة U.Psy",
      text: "ابتداء من تأكيد انخراطك الأول، على الجلسات المحجوزة عبر U.Psy.",
    },
    {
      title: "أسعار الأعضاء على المنشورات",
      text: "كتيبات الرابطة ومنشوراتها بسعر الأعضاء بمجرد تأكيد انخراطك.",
    },
    {
      title: "تكوينات وأيام علمية",
      text: "ورشات وتكوين مستمر وتظاهرات ينظمها قطب التكوين.",
    },
    {
      title: "إشراف وتداول",
      text: "قطب مخصص للممارسة السريرية: إشراف بين الأقران، جودة وأخلاقيات.",
    },
    {
      title: "بحث ومنشورات",
      text: "ساهم في دراسات الرابطة وكتيباتها وانشر معها.",
    },
    {
      title: "شبكة وحضور",
      text: "شراكات ومؤتمرات وحملات: الرابطة تحمل صوت أعضائها.",
    },
    {
      title: "التزامك معترف به",
      text: "تُصادق مساهماتك وتُقيَّم، ويُبرز الأعضاء الأكثر نشاطا.",
    },
    {
      title: "تقييم يفيدك",
      text: "يمنحك تقييم الانتقاء صورة عن شخصيتك وعافيتك، مع الدعم عند الحاجة.",
    },
  ],
  whyKicker: "لماذا الانخراط",
  whyTitle: "انخراط له قيمة، لأنه متطلب.",
  whyText:
    "تختار الرابطة أعضاءها بعناية ثم ترافقهم. يلتزم كل عضو بالمساهمة: تُقيَّم المشاركة كل نصف سنة من طرف قطبي الإشراف والتكوين.",
  whyItems: [
    "ملف موثق: الشهادات، رخصة المزاولة، التسجيل",
    "تقييم الانتقاء: الشخصية، التوازن النفسي، وضعيات سريرية في تخصصك",
    "مقابلة ومصادقة لجنة الرابطة",
    "توقيع القانون الداخلي والتصريح بالشرف والميثاق الأخلاقي",
    "تتبع المشاركة: مساهمات، تقييمات، ترتيب",
  ],
  journeyKicker: "المسار",
  journeyTitle: "ست خطوات لتصبح عضوا",
  journey: [
    {
      title: "قدم ملفك",
      text: "مرة واحدة على U.Psy: الشهادات، الرخصة، السيرة الذاتية.",
    },
    {
      title: "اجتز التقييم",
      text: "حوالي 25 دقيقة: الشخصية، العافية، وضعيات مهنية.",
    },
    { title: "التق بالرابطة", text: "تدرس اللجنة ملفك وتستقبلك في مقابلة." },
    {
      title: "أد واجب الانخراط",
      text: "تحويل أو إيداع في حساب الرابطة، مع وصل مرقم.",
    },
    { title: "توصل ببطاقتك", text: "بطاقة رقمية برمز QR وشهادة انخراط." },
    { title: "انخرط في العمل", text: "اختر قطبك، اكتب مشروعك، وساهم." },
  ],
  feesKicker: "واجبات الانخراط",
  feesTitle: "الفئات وواجبات الانخراط السنوية",
  perYear: "درهم / سنة",
  granted: "بقرار من الرابطة",
  optional: "واجب اختياري",
  feesNote:
    "واجب الانخراط عن السنة الميلادية (القانون الداخلي، المادتان 8 و9). أسعار الطلبة لمن هم دون 30 سنة مع شهادة التسجيل. الانخراط المصادق عليه ابتداء من فاتح أكتوبر صالح إلى 31 دجنبر من السنة الموالية.",
  cardKicker: "البطاقة",
  cardTitle: "بطاقتك، قابلة للتحقق في كل مكان.",
  cardText:
    "يتوصل كل عضو ببطاقة رقمية بألوان فئته. يفتح رمز QR صفحة عمومية تؤكد صلاحيتها في الحين.",
  cardCategories: {
    founder: "مؤسس",
    official: "منخرط",
    honorary: "شرفي",
    supporter: "منتسب",
  },
  cardName: "د. اسمك",
  cardValid: "صالحة إلى 31/12/2027",
  cardHint: "مرر المؤشر على البطاقة",
  faqKicker: "أسئلة",
  faqTitle: "أسئلة شائعة",
  faq: [
    {
      title: "من يمكنه الانخراط؟",
      text: "الأخصائيون الحاصلون على الأقل على ماستر في علم النفس أو الطب النفسي أو الصحة النفسية (أعضاء منخرطون)، وطلبة الدكتوراه والماستر دون 30 سنة، والمنتسبون الداعمون للرابطة.",
    },
    {
      title: "أنا طالب وعمري 30 سنة أو أكثر؟",
      text: "أسعار الطلبة لمن هم دون 30 سنة: تنخرط في فئة الممارسين.",
    },
    {
      title: "كم مدة الانخراط؟",
      text: "السنة الميلادية إلى 31 دجنبر. الانخراط المصادق عليه ابتداء من فاتح أكتوبر صالح إلى نهاية السنة الموالية. يفتح التجديد قبل شهرين من نهاية الصلاحية من لوحة التحكم، ويبقى رقمك ورمز QR كما هما.",
    },
    {
      title: "ماذا يحدث لمعطياتي؟",
      text: "لا يُشارك ملفك على U.Psy مع الرابطة إلا بموافقتك القابلة للسحب في أي وقت، ودون بطاقتك الوطنية أو رقم حسابك البنكي. المعطيات محمية وفق القانون 09-08.",
    },
    {
      title: "هل يمكن أن يستبعدني التقييم؟",
      text: "ينير قرار اللجنة ولا يقرر وحده أبدا. نتائج العافية للدعم والإشراف، وليست سببا لرفض تلقائي.",
    },
    {
      title: "وإذا لم أشارك؟",
      text: "المشاركة جزء من الالتزام. العضو الذي لا يساهم لستة أشهر قد يخضع للمسطرة المنصوص عليها في القانون الداخلي، مع حق الدفاع دائما.",
    },
  ],
  finalTitle: "مستعد للانضمام إلى الرابطة؟",
  finalText: "ابدأ ملفك: ستتواصل معك الرابطة للخطوات الموالية.",
  formTitle: "ابدأ انخراطك",
  formSubtitle: "اترك معلوماتك ثم أكمل ملفك في حوالي 12 دقيقة.",
  formCta: "ابدأ ملفي",
  successTitle: "تم التسجيل 🤝",
  successBody:
    "أكمل الآن ملفك. في الخطوة الأخيرة، وافق على مشاركته مع الرابطة.",
  successCta: "أكمل ملفي",
  formLabels: {
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف / واتساب",
    org: "العيادة / المؤسسة (اختياري)",
    whatsapp:
      "توصل بالمستجدات على واتساب أيضا (اختياري، إلغاء الاشتراك في أي وقت).",
    consentBefore: "أوافق على تلقي رسائل من U.Psy وقد اطلعت على",
    privacy: "سياسة الخصوصية",
    consentAfter: ". معطيات محمية بموجب القانون 09-08 (CNDP).",
    noSpam: "لا رسائل مزعجة. إلغاء الاشتراك بنقرة في كل رسالة.",
  },
};

export function useLeagueLandingCopy() {
  const { locale } = useLocale();
  const lang = (locale === "en" ? "en" : locale === "ar" ? "ar" : "fr") as
    "fr" | "en" | "ar";
  return { t: lang === "en" ? en : lang === "ar" ? ar : fr, lang };
}
