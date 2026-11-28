import type { EmailCopy, Lang, SequenceDef } from "./types.ts";

/**
 * LSSPM: psychologists who left their details on the League page
 * (/campaigns/lsspm). Goal: a submitted application, the shared first step
 * of U.Psy accreditation and League membership. Stops as soon as it exists.
 */

const fr: EmailCopy[] = [
  {
    subject: "Votre dossier LSSPM vous attend",
    preheader: "12 minutes, un seul dossier pour deux validations.",
    eyebrow: "LSSPM × U.Psy",
    title: "Un dossier, deux validations",
    body: [
      "Merci de votre intérêt pour la Ligue des Spécialistes de la Santé Psychique et Mentale. La première étape se fait sur U.Psy : un seul dossier, étudié pour votre accréditation U.Psy puis par le comité de la Ligue.",
      "Préparez simplement :",
      {
        list: [
          "votre diplôme (au moins un master en psychologie, psychiatrie ou santé mentale)",
          "votre autorisation d'exercice ou votre inscription, si vous en avez une",
          "votre CV et une photo récente",
        ],
      },
      "Comptez environ 12 minutes. À la dernière étape, cochez le partage avec la Ligue : votre CIN et votre RIB ne lui sont jamais transmis.",
    ],
    cta: "Compléter mon dossier",
  },
  {
    subject: "Ce que votre adhésion vous apporte",
    preheader:
      "Carte vérifiable, 3 mois sans commission, formation, supervision.",
    eyebrow: "Les avantages des membres",
    title: "Une adhésion qui se voit et qui sert",
    body: [
      "Être membre de la LSSPM, c'est rejoindre des pairs qui partagent la même exigence éthique. Concrètement :",
      {
        list: [
          "une carte de membre numérique avec QR code, vérifiable par tous",
          "une attestation d'adhésion et un reçu pour chaque paiement",
          "3 mois sans commission U.Psy sur vos consultations, dès votre première adhésion confirmée",
          "le badge LSSPM sur votre profil, vu par les patients",
          "formation continue, supervision et intervision entre pairs",
        ],
      },
      "Tout commence par votre dossier sur U.Psy.",
    ],
    cta: "Commencer mon dossier",
  },
  {
    subject: "Cotisations et calendrier de la Ligue",
    preheader: "Les catégories, les montants et le parcours en six étapes.",
    eyebrow: "Cotisations",
    title: "Combien, et comment ça se passe",
    body: [
      "Voici les cotisations en vigueur :",
      { fees: true },
      "Le parcours : votre dossier, un bilan d'environ 25 minutes, un entretien avec le comité, le règlement de la cotisation, puis votre carte et votre attestation.",
      {
        note: "Le bilan éclaire la décision du comité, il ne décide jamais seul.",
      },
    ],
    cta: "Déposer mon dossier",
  },
  {
    subject: "Une question avant de vous lancer ?",
    preheader: "Données, bilan, engagement : les réponses courtes.",
    eyebrow: "Questions fréquentes",
    title: "Les réponses avant de vous lancer",
    body: [
      "Les trois questions qu'on nous pose le plus :",
      {
        list: [
          "Mes données ? Votre dossier n'est partagé avec la Ligue qu'avec votre accord, révocable à tout moment, conformément à la loi 09-08.",
          "Le bilan peut-il m'écarter ? Non, il ne décide jamais seul ; il sert aussi au soutien et à la supervision.",
          "Quel engagement ? Chaque membre choisit un pôle et y contribue ; la participation est suivie chaque semestre.",
        ],
      },
      "C'est notre dernier message sur ce sujet. Votre place reste ouverte quand vous serez prêt(e).",
    ],
    cta: "Voir la page de la Ligue",
  },
];

const en: EmailCopy[] = [
  {
    subject: "Your LSSPM application is waiting",
    preheader: "12 minutes, one application for two approvals.",
    eyebrow: "LSSPM × U.Psy",
    title: "One application, two approvals",
    body: [
      "Thank you for your interest in the League of Mental and Psychological Health Specialists. The first step happens on U.Psy: one application, reviewed for your U.Psy accreditation and then by the League's committee.",
      "Just have ready:",
      {
        list: [
          "your degree (at least a master's in psychology, psychiatry or mental health)",
          "your licence to practise or registration, if you have one",
          "your CV and a recent photo",
        ],
      },
      "It takes about 12 minutes. At the last step, tick sharing with the League: your ID card and bank details are never passed on.",
    ],
    cta: "Complete my application",
  },
  {
    subject: "What membership gives you",
    preheader:
      "A verifiable card, 3 months without commission, training, supervision.",
    eyebrow: "Member benefits",
    title: "A membership that shows and that helps",
    body: [
      "Joining the LSSPM means joining peers who share the same ethical standard. In practice:",
      {
        list: [
          "a digital member card with a QR code anyone can verify",
          "a membership certificate and a receipt for every payment",
          "3 months without U.Psy commission on your sessions, from your first confirmed membership",
          "the LSSPM badge on your profile, seen by patients",
          "continuing education, supervision and peer review",
        ],
      },
      "It all starts with your application on U.Psy.",
    ],
    cta: "Start my application",
  },
  {
    subject: "League fees and timeline",
    preheader: "Categories, amounts and the six-step path.",
    eyebrow: "Fees",
    title: "How much, and how it works",
    body: [
      "These are the current fees:",
      { fees: true },
      "The path: your application, an assessment of about 25 minutes, an interview with the committee, the fee payment, then your card and certificate.",
      {
        note: "The assessment informs the committee's decision; it never decides on its own.",
      },
    ],
    cta: "Submit my application",
  },
  {
    subject: "A question before you start?",
    preheader: "Data, assessment, commitment: the short answers.",
    eyebrow: "Frequent questions",
    title: "Answers before you start",
    body: [
      "The three questions we are asked most:",
      {
        list: [
          "My data? Your application is shared with the League only with your consent, which you can withdraw at any time, under Law 09-08.",
          "Can the assessment rule me out? No, it never decides on its own; it also guides support and supervision.",
          "What commitment? Each member chooses a division and contributes to it; participation is reviewed every semester.",
        ],
      },
      "This is our last message on the subject. Your place stays open whenever you are ready.",
    ],
    cta: "See the League page",
  },
];

const ar: EmailCopy[] = [
  {
    subject: "ملف انخراطك في LSSPM في انتظارك",
    preheader: "12 دقيقة، ملف واحد لمصادقتين.",
    eyebrow: "LSSPM × U.Psy",
    title: "ملف واحد، مصادقتان",
    body: [
      "شكرًا على اهتمامك برابطة أخصائيي الصحة النفسية والعقلية. تبدأ الخطوة الأولى على U.Psy: ملف واحد يُدرس لاعتمادك على U.Psy ثم من طرف لجنة الرابطة.",
      "حضّر فقط:",
      {
        list: [
          "شهادتك (ماستر على الأقل في علم النفس أو الطب النفسي أو الصحة النفسية)",
          "رخصة المزاولة أو التسجيل، إن وُجدت",
          "سيرتك الذاتية وصورة حديثة",
        ],
      },
      "يستغرق الأمر نحو 12 دقيقة. في الخطوة الأخيرة، اختر المشاركة مع الرابطة: لا تُرسل إليها بطاقتك الوطنية ولا معلوماتك البنكية أبدًا.",
    ],
    cta: "أكمل ملفي",
  },
  {
    subject: "ما الذي يمنحك إياه الانخراط",
    preheader: "بطاقة قابلة للتحقق، 3 أشهر بدون عمولة، تكوين وإشراف.",
    eyebrow: "امتيازات الأعضاء",
    title: "انخراط يُرى ويفيد",
    body: [
      "الانخراط في LSSPM يعني الانضمام إلى زملاء يتقاسمون نفس المعايير الأخلاقية. عمليًا:",
      {
        list: [
          "بطاقة عضوية رقمية برمز QR يمكن لأي شخص التحقق منها",
          "شهادة انخراط ووصل عن كل أداء",
          "3 أشهر بدون عمولة U.Psy على حصصك، ابتداءً من أول انخراط مصادق عليه",
          "شارة LSSPM على ملفك، يراها المرضى",
          "تكوين مستمر وإشراف وتبادل بين الزملاء",
        ],
      },
      "كل شيء يبدأ بملفك على U.Psy.",
    ],
    cta: "ابدأ ملفي",
  },
  {
    subject: "واجبات الانخراط ومراحل الرابطة",
    preheader: "الفئات والمبالغ والمسار في ست مراحل.",
    eyebrow: "واجبات الانخراط",
    title: "كم، وكيف يجري الأمر",
    body: [
      "هذه هي واجبات الانخراط الجاري بها العمل:",
      { fees: true },
      "المسار: ملفك، ثم تقييم يدوم نحو 25 دقيقة، ثم مقابلة مع اللجنة، ثم أداء الواجب، وبعدها بطاقتك وشهادتك.",
      { note: "التقييم يُنير قرار اللجنة، ولا يقرر وحده أبدًا." },
    ],
    cta: "أودع ملفي",
  },
  {
    subject: "سؤال قبل أن تبدأ؟",
    preheader: "المعطيات، التقييم، الالتزام: أجوبة مختصرة.",
    eyebrow: "أسئلة متكررة",
    title: "أجوبة قبل أن تبدأ",
    body: [
      "الأسئلة الثلاثة الأكثر طرحًا:",
      {
        list: [
          "معطياتي؟ لا يُشارك ملفك مع الرابطة إلا بموافقتك، ويمكنك سحبها في أي وقت، طبقًا للقانون 09-08.",
          "هل يمكن أن يُقصيني التقييم؟ لا، لا يقرر وحده أبدًا، ويُستعمل أيضًا للدعم والإشراف.",
          "ما الالتزام المطلوب؟ يختار كل عضو قطبًا ويساهم فيه، وتُتابع المشاركة كل دورة.",
        ],
      },
      "هذه آخر رسالة منا حول هذا الموضوع. مكانك يبقى محفوظًا متى كنت مستعدًا.",
    ],
    cta: "صفحة الرابطة",
  },
];

const ary: EmailCopy[] = [
  {
    subject: "الملف ديالك فـ LSSPM كيتسناك",
    preheader: "12 دقيقة، ملف واحد لجوج موافقات.",
    eyebrow: "LSSPM × U.Psy",
    title: "ملف واحد، جوج موافقات",
    body: [
      "شكرا على الاهتمام ديالك بالرابطة ديال أخصائيي الصحة النفسية والعقلية. الخطوة الأولى كتدار فـ U.Psy: ملف واحد كيتشاف باش تتعتمد فـ U.Psy، ومن بعد كتشوفو اللجنة ديال الرابطة.",
      "وجد غير:",
      {
        list: [
          "الديبلوم ديالك (على الأقل ماستر فعلم النفس، الطب النفسي ولا الصحة النفسية)",
          "الرخصة ديال المزاولة ولا التسجيل، إلا عندك",
          "السيرة الذاتية وتصويرة جديدة",
        ],
      },
      "كتاخد شي 12 دقيقة. فالمرحلة الأخيرة، علّم على المشاركة مع الرابطة: لا البطاقة الوطنية لا الحساب البنكي ما كيتصيفطو ليها.",
    ],
    cta: "كمّل الملف ديالي",
  },
  {
    subject: "شنو غادي يعطيك الانخراط",
    preheader: "كارطة كتتحقق، 3 شهور بلا كوميسيون، تكوين وإشراف.",
    eyebrow: "الامتيازات ديال الأعضاء",
    title: "انخراط كيبان وكينفع",
    body: [
      "تكون عضو فـ LSSPM يعني تدخل مع زملاء عندهم نفس المعايير الأخلاقية. بالواضح:",
      {
        list: [
          "كارطة عضوية رقمية فيها QR، أي واحد يقدر يتحقق منها",
          "شهادة الانخراط ووصل على كل خلاص",
          "3 شهور بلا كوميسيون ديال U.Psy على الحصص ديالك، من أول انخراط تقبل",
          "الشارة ديال LSSPM فالبروفايل ديالك، كيشوفوها المرضى",
          "تكوين مستمر، إشراف وتبادل بين الزملاء",
        ],
      },
      "كلشي كيبدا بالملف ديالك فـ U.Psy.",
    ],
    cta: "بدا الملف ديالي",
  },
  {
    subject: "واجب الانخراط والمراحل ديال الرابطة",
    preheader: "الفئات، الثمن والطريق فـ 6 مراحل.",
    eyebrow: "واجب الانخراط",
    title: "شحال، وكيفاش كدوز",
    body: [
      "هادو هوما الأثمنة دابا:",
      { fees: true },
      "الطريق: الملف ديالك، تقييم ديال شي 25 دقيقة، لقاء مع اللجنة، خلاص الواجب، ومن بعد الكارطة والشهادة ديالك.",
      { note: "التقييم كيعاون اللجنة تقرر، ولكن عمرو ما كيقرر بوحدو." },
    ],
    cta: "حط الملف ديالي",
  },
  {
    subject: "عندك شي سؤال قبل ما تبدا؟",
    preheader: "المعطيات، التقييم، الالتزام: أجوبة قصيرة.",
    eyebrow: "أسئلة كتعاود",
    title: "الأجوبة قبل ما تبدا",
    body: [
      "التلاتة ديال الأسئلة اللي كيتسولو علينا بزاف:",
      {
        list: [
          "المعطيات ديالي؟ الملف ديالك ما كيتشارك مع الرابطة غير بالموافقة ديالك، وتقدر ترجع فيها فأي وقت، حسب القانون 09-08.",
          "واش التقييم يقدر يحيدني؟ لا، عمرو ما كيقرر بوحدو، وكيتستعمل حتى للدعم والإشراف.",
          "شنو الالتزام؟ كل عضو كيختار قطب وكيساهم فيه، والمشاركة كتتبع كل سداسي.",
        ],
      },
      "هادي آخر رسالة منا على هاد الموضوع. البلاصة ديالك كتبقى محلولة ملي تكون واجد.",
    ],
    cta: "شوف الصفحة ديال الرابطة",
  },
];

const zgh: EmailCopy[] = [
  {
    subject: "ⴰⵙⴷⴰⵡ ⵏⵏⴽ ⴳ LSSPM ⵉⵜⵜⵔⴰⵊⴰ ⴽ",
    preheader: "12 ⵏ ⵜⵓⵙⴷⵉⴷⵉⵏ, ⵢⴰⵏ ⵓⵙⴷⴰⵡ ⵉ ⵙⵉⵏ ⵉⵙⵏⵇⴷⵏ.",
    eyebrow: "LSSPM × U.Psy",
    title: "ⵢⴰⵏ ⵓⵙⴷⴰⵡ, ⵙⵉⵏ ⵉⵙⵏⵇⴷⵏ",
    body: [
      "ⵜⴰⵏⵎⵎⵉⵔⵜ ⵅⴼ ⵓⵙⵏⵓⵎⵎⵔ ⵏⵏⴽ ⵙ ⵜⵎⵓⵏⵜ ⵏ ⵉⵎⵙⵙⵏⴰⵙⵏ ⵏ ⵜⴷⴰⵡⵙⴰ ⵜⴰⵏⴼⵙⴰⵏⵜ. ⵜⴰⴼⵙⴳⵓⵔⵜ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ ⵜⵍⵍⴰ ⴳ U.Psy: ⵢⴰⵏ ⵓⵙⴷⴰⵡ, ⵉⵜⵜⵓⵙⵎⵔⴰⵙ ⵉ ⵓⵙⵏⵇⴷ ⵏⵏⴽ ⴳ U.Psy, ⴷⴼⴼⵉⵔ ⵙ ⵓⵙⵇⵇⵉⵎ ⵏ ⵜⵎⵓⵏⵜ.",
      "ⵙⵡⵓⴷⴷⵓ ⵖⴰⵙ:",
      {
        list: [
          "ⵜⴰⴳⵓⵔⵉ ⵏⵏⴽ (ⵓⵍⴰ ⵎⴰⵙⵜⵔ ⴳ ⵜⵓⵙⵏⴰ ⵏ ⵜⵏⴼⵙⵉⵜ ⵏⵖ ⵜⴰⴷⴰⵡⵙⴰ ⵜⴰⵏⴼⵙⴰⵏⵜ)",
          "ⵜⵉⵔⴰⵔⴰ ⵏ ⵓⵙⵡⵓⵔⵉ ⵏⵖ ⴰⵣⵎⵎⴻⵎ, ⵎⴽ ⵜⵍⵍⴰ ⵖⵓⵔⴽ",
          "ⴰⵎⵓⴷⴷⵓ ⵏⵏⴽ (CV) ⴷ ⵜⵡⵍⴰⴼⵜ ⵜⴰⵎⴰⵢⵏⵓⵜ",
        ],
      },
      "ⵉⵜⵜⴰⵡⵉ ⵎⴰⵙ 12 ⵏ ⵜⵓⵙⴷⵉⴷⵉⵏ. ⴳ ⵜⴼⵙⴳⵓⵔⵜ ⵜⴰⵏⴳⴳⴰⵔⵓⵜ, ⵙⵜⵢ ⴰⵙⵎⵢⴰⴳⵓ ⴷ ⵜⵎⵓⵏⵜ: ⵜⴰⴽⴰⵔⴹⴰ ⵏⵏⴽ ⴷ ⵓⵎⵉⴹⴰⵏ ⵏ ⵜⴱⴰⵏⴽⴰ ⵓⵔ ⴷ ⴰⵙ ⵜⵜⵓⵣⵏⵏ ⴰⵔⵜⵜⵓ.",
    ],
    cta: "ⵙⵎⴷ ⴰⵙⴷⴰⵡ ⵉⵏⵓ",
  },
  {
    subject: "ⵎⴰⴷ ⴰⴽ ⵉⵜⵜⴰⴽⴽⴰ ⵓⵙⵎⵓⵜⵜⴳ",
    preheader: "ⵜⴰⴽⴰⵔⴹⴰ ⵉⵜⵜⵓⵙⵏⵇⴷⵏ, 3 ⵏ ⵡⴰⵢⵢⵓⵔⵏ ⴱⵍⴰ ⵜⴰⵡⵙⵉⵡⵜ, ⴰⵙⵍⵎⴷ ⴷ ⵓⵙⵎⵓⵜⵜⴳ.",
    eyebrow: "ⵜⵉⵏⴼⵓⵜⵉⵏ ⵏ ⵉⵎⴷⵔⴰⵡⵏ",
    title: "ⴰⵙⵎⵓⵜⵜⴳ ⵉⵜⵜⵓⵥⵕⴰⵏ, ⵉⵏⴼⵓⵏ",
    body: [
      "ⴰⴷ ⵜⴳⴷ ⴰⵎⴷⵔⴰⵡ ⴳ LSSPM, ⵉⴳⴰ ⴰⴷ ⵜⴽⵛⵎⴷ ⴷ ⵉⵎⴷⵓⴽⴽⴰⵍ ⵢⴰⴽⵣⵏ ⵜⵉⵏⴰⴹⵉⵏ ⵏ ⵜⵓⵎⵙⵙⵏⵜ. ⵙ ⵜⵉⴷⵜ:",
      {
        list: [
          "ⵜⴰⴽⴰⵔⴹⴰ ⵜⴰⵎⵓⵟⵟⵓⵏⵜ ⵙ QR, ⵢⴰⵏ ⵢⴰⵏ ⵉⵣⵎⵔ ⴰⴷ ⵜⵜ ⵉⵙⵏⵇⴷ",
          "ⵜⴰⴳⵓⵔⵉ ⵏ ⵓⵙⵎⵓⵜⵜⴳ ⴷ ⵓⵡⴰⵚⵍ ⵉ ⴽⵓ ⴰⴼⵔⵓ",
          "3 ⵏ ⵡⴰⵢⵢⵓⵔⵏ ⴱⵍⴰ ⵜⴰⵡⵙⵉⵡⵜ ⵏ U.Psy ⵅⴼ ⵜⵉⵣⵉⵡⵉⵏ ⵏⵏⴽ",
          "ⴰⵎⴰⵜⴰⵔ ⵏ LSSPM ⴳ ⵓⵎⴰⵖⵏⵓ ⵏⵏⴽ, ⵜ ⵥⵕⴰⵏ ⵉⵎⵓⴹⴰⵏ",
          "ⴰⵙⵍⵎⴷ ⵉⵎⵓⵏ, ⴰⵙⵎⵓⵜⵜⴳ ⴷ ⵓⵎⵢⴰⵡⴰⵙ ⴳⵔ ⵉⵎⴷⵓⴽⴽⴰⵍ",
        ],
      },
      "ⴽⵓⵍⵍⵓ ⵉⵜⵜⴱⴷⴰ ⵙ ⵓⵙⴷⴰⵡ ⵏⵏⴽ ⴳ U.Psy.",
    ],
    cta: "ⵙⵙⵏⵜⵉ ⴰⵙⴷⴰⵡ ⵉⵏⵓ",
  },
  {
    subject: "ⵜⴰⵡⵙⵉⵡⵉⵏ ⴷ ⵓⵙⵎⵙⵍⴰⵢ ⵏ ⵜⵎⵓⵏⵜ",
    preheader: "ⵜⵉⵙⴳⴰⵡⵉⵏ, ⵉⵎⴰⵏⴰⵢⵏ ⴷ ⵓⴱⵔⵉⴷ ⵙ 6 ⵏ ⵜⴼⵙⴳⵓⵔⵉⵏ.",
    eyebrow: "ⵜⴰⵡⵙⵉⵡⵉⵏ",
    title: "ⵎⵏⵏⴰⵡ, ⴷ ⵎⴰⵎⴽ ⵉⵜⵜⵉⵍⵉⵏ",
    body: [
      "ⵜⴰⵡⵙⵉⵡⵉⵏ ⵏ ⵖⵉⵍⴰ:",
      { fees: true },
      "ⴰⴱⵔⵉⴷ: ⴰⵙⴷⴰⵡ ⵏⵏⴽ, ⴰⵙⵙⵓⴹⵏ ⵏ ⵎⴰⵙ 25 ⵏ ⵜⵓⵙⴷⵉⴷⵉⵏ, ⴰⵎⵙⴰⵡⴰⵍ ⴷ ⵓⵙⵇⵇⵉⵎ, ⴰⴼⵔⵓ ⵏ ⵜⵡⵙⵉⵡⵜ, ⴷⴼⴼⵉⵔ ⵜⴰⴽⴰⵔⴹⴰ ⴷ ⵜⴳⵓⵔⵉ ⵏⵏⴽ.",
      { note: "ⴰⵙⵙⵓⴹⵏ ⵉⵜⵜⴰⵡⵙ ⴰⵙⵇⵇⵉⵎ, ⵓⵔ ⵉⵜⵜⴰⵙⵉ ⴰⵙⵏⵜⵍ ⵡⴰⵃⴷⵓⵜ." },
    ],
    cta: "ⵙⵙⵔⵙ ⴰⵙⴷⴰⵡ ⵉⵏⵓ",
  },
  {
    subject: "ⵜⵍⵍⴰ ⵖⵓⵔⴽ ⵜⵓⵜⵜⵔⴰ?",
    preheader: "ⵉⵙⴼⴽⴰ, ⴰⵙⵙⵓⴹⵏ, ⴰⵙⵖⵓⵍ: ⵉⵔⴰⵔⵏ ⵉⵎⵥⵥⵢⴰⵏⵏ.",
    eyebrow: "ⵜⵓⵜⵜⵔⵉⵡⵉⵏ ⵢⵜⵜⵓⵖⴰⵍⵏ",
    title: "ⵉⵔⴰⵔⵏ ⵇⴱⵍ ⴰⴷ ⵜⴱⴷⵓⴷ",
    body: [
      "ⴽⵔⴰⴹ ⵏ ⵜⵓⵜⵜⵔⵉⵡⵉⵏ ⵢⴰⴽⴽⵯ ⴷ ⴰⵖ ⵢⵜⵜⵓⵙⵇⵙⴰⵏ:",
      {
        list: [
          "ⵉⵙⴼⴽⴰ ⵉⵏⵓ? ⴰⵙⴷⴰⵡ ⵏⵏⴽ ⵓⵔ ⵉⵜⵜⵓⵙⵎⵢⴰⴳⴰ ⴷ ⵜⵎⵓⵏⵜ ⵖⴰⵙ ⵙ ⵓⵔⴹⴰ ⵏⵏⴽ, ⵜⵣⵎⵔⴷ ⴰⴷ ⵜ ⵜⴽⴽⵙⴷ ⴽⵓ ⴰⴽⵓⴷ, ⵙ ⵓⵙⵍⵖⵓ 09-08.",
          "ⵉⵣⵎⵔ ⵓⵙⵙⵓⴹⵏ ⴰⴷ ⵉⵢⵉ ⵉⵙⵙⵓⴼⵖ? ⵓⵀⵓ, ⵓⵔ ⵉⵜⵜⴰⵙⵉ ⴰⵙⵏⵜⵍ ⵡⴰⵃⴷⵓⵜ, ⵉⵜⵜⵓⵙⵎⵔⴰⵙ ⴰⵡⴷ ⵉ ⵓⵙⵎⵓⵜⵜⴳ.",
          "ⵎⴰ ⵉⴳⴰ ⵓⵙⵖⵓⵍ? ⴽⵓ ⴰⵎⴷⵔⴰⵡ ⵉⵙⵜⴰⵢ ⴰⵙⵎⵔⴰⵙ ⵉⵙⵡⵓⵔⵉ ⴳⵉⵙ; ⵜⴰⵔⴰⴳⴰⵍⵜ ⵜⵜⵓⵜⵜⴰⴹⴰⵕ ⴽⵓ ⵙⴹⵉⵚ ⵏ ⵡⴰⵢⵢⵓⵔⵏ.",
        ],
      },
      "ⵜⴰⴷ ⴰⴷ ⵜⴳⴰ ⵜⴰⴱⵔⴰⵜ ⵜⴰⵏⴳⴳⴰⵔⵓⵜ ⵅⴼ ⵓⵙⵏⵜⵍ ⴰⴷ. ⴰⵏⵙⴰ ⵏⵏⴽ ⵉⵇⵇⵉⵎ ⵉⵕⵥⵎ ⵎⴽ ⵜⵡⵊⴷⴷ.",
    ],
    cta: "ⵥⵕ ⵜⴰⵙⵏⴰ ⵏ ⵜⵎⵓⵏⵜ",
  },
];

const rif: EmailCopy[] = [
  {
    subject: "Adusi-nnek di LSSPM yettraju-k",
    preheader: "12 n tusdidin, yiğ n udusi i sin n isenqaden.",
    eyebrow: "LSSPM × U.Psy",
    title: "Yiğ n udusi, sin n isenqaden",
    body: [
      "Tanmirt ɣef ulmad-nnek s Tamunt n Imussnawen n Tazmert n Uqerru. Tamezwarut tettili di U.Psy: yiğ n udusi, ad t-ẓren i usenqed-nnek di U.Psy, ad t-yẓer dɣa unebdu n Tamunt.",
      "Wejjed ɣir:",
      {
        list: [
          "tagrut-nnek (master di tussna n tefsit, di ṭṭebb n uqerru niɣ di tazmert n uqerru)",
          "rexṣa n uxeddem niɣ ajerred, max tesɛid-t",
          "CV-nnek d yiğet n tewlaft tamaynut",
        ],
      },
      "Ad yawi xas 12 n tusdidin. Di taneggarut, ɛellem ɣef usemyag d Tamunt: takarḍa-nnek d lḥsab n lbanka war ttuceyyɛen ara.",
    ],
    cta: "Kemmel adusi-inu",
  },
  {
    subject: "Mayen ak-yetteg ujerred",
    preheader:
      "Takarḍa yettwasenqden, 3 n yuren bla tawsiwt, aselmed d usefrek.",
    eyebrow: "Tinfa n imeddukal",
    title: "Ajerred yettbanen, yenfeɛ",
    body: [
      "Ad tiliḍ d amedrus di LSSPM, d akcam ak d imeddukal yesɛan yiğ n uswir n tikti. S tidet:",
      {
        list: [
          "takarḍa tamuṭṭunt s QR, kulci yezmer ad tt-isenqed",
          "tagrut n ujerred d lwaṣel i kul axelleṣ",
          "3 n yuren bla tawsiwt n U.Psy ɣef tiɣimiwin-nnek",
          "tamatart n LSSPM di umaɣnu-nnek, tt-ẓren imuḍan",
          "aselmed yettkemmilen, asefrek d umyawas jar imeddukal",
        ],
      },
      "Kulci yettebda s udusi-nnek di U.Psy.",
    ],
    cta: "Bda adusi-inu",
  },
  {
    subject: "Tixeddimin d uɣawas n Tamunt",
    preheader: "Tiggaw, ssuma d ubrid s 6 n tfesgurin.",
    eyebrow: "Tixeddimin",
    title: "Mennaw, d mamek yettili",
    body: [
      "Tixeddimin n tura:",
      { fees: true },
      "Abrid: adusi-nnek, asekyed n xas 25 n tusdidin, amsawal d unebdu, axelleṣ n texeddimt, dɣa takarḍa d tagrut-nnek.",
      { note: "Asekyed yettɛawan anebdu, war yettqerrar ɣa netta." },
    ],
    cta: "Ssers adusi-inu",
  },
  {
    subject: "Tesɛid kra n usteqsi?",
    preheader: "Isefka, asekyed, aswal: tiririyin timeẓẓyanin.",
    eyebrow: "Isteqsiyen yettwalasen",
    title: "Tiririyin qbel ad tebdud",
    body: [
      "Kraḍ n isteqsiyen i ɣ-ttesteqsayen aṭṭas:",
      {
        list: [
          "Isefka-inu? Adusi-nnek war yettwabḍa d Tamunt ɣir s rreḍa-nnek, tzemred ad t-tekksed kul lweqt, s uzref 09-08.",
          "Asekyed yezmer ad yi-yessuffeɣ? Uhu, war yettqerrar ɣa netta, yettwaxdem ula i tallalt d usefrek.",
          "Min yegga uswal? Kul amedrus ad yextar yiğ n tseddart ad yexdem deg-s; tarrayt n ujerred tettwaḍfar kul sḍis n yuren.",
        ],
      },
      "Tagi d tabrat taneggarut ɣef usentel-a. Amkan-nnek yeqqim yeldi mani teqqard.",
    ],
    cta: "Ẓer tasna n Tamunt",
  },
];

const copy: Record<Lang, EmailCopy[]> = { fr, en, ar, ary, zgh, rif };

export const LSSPM: SequenceDef = {
  id: "lsspm",
  partner: "lsspm",
  convertedIf: (f) => !!f.applied,
  steps: [
    { delayHours: 2, path: "/apply/wizard?source=lsspm" },
    { delayHours: 72, path: "/apply/wizard?source=lsspm" },
    { delayHours: 96, path: "/apply/wizard?source=lsspm" },
    { delayHours: 168, path: "/campaigns/lsspm" },
  ],
  copy,
};
