import type { EmailCopy, Lang, SequenceDef } from "./types.ts";

/**
 * Specialist recruitment: psychologists who left their details on
 * /campaigns/join-specialist. Goal: a submitted application. Stops as soon
 * as it exists.
 */

const fr: EmailCopy[] = [
  {
    subject: "Votre dossier U.Psy en 12 minutes",
    preheader: "Les pièces à préparer et la réponse sous 48 h.",
    eyebrow: "Rejoindre U.Psy",
    title: "Il ne reste que votre dossier",
    body: [
      "Merci pour votre intérêt. Pour rejoindre le réseau, il reste à déposer votre dossier : environ 12 minutes.",
      "Ayez sous la main :",
      {
        list: [
          "votre diplôme",
          "votre autorisation d'exercice ou votre inscription",
          "votre CV et une photo professionnelle",
        ],
      },
      "Notre équipe étudie chaque dossier sous 48 heures et vous répond, quelle que soit la décision.",
    ],
    cta: "Déposer mon dossier",
  },
  {
    subject: "0 % de commission pendant 3 mois",
    preheader:
      "Vous gardez votre cabinet et vos tarifs ; nous gérons le reste.",
    eyebrow: "Cohorte fondatrice",
    title: "Ce que U.Psy prend en charge",
    body: [
      "Vous gardez votre cabinet, vos tarifs et votre façon de travailler. U.Psy s'occupe du reste :",
      {
        list: [
          "un profil vérifié, dans vos langues, que les patients trouvent",
          "les rendez-vous, la visio, les rappels et la facturation",
          "des demandes de patients venues de nos campagnes, de l'Athlete Hub et des programmes entreprises",
          "0 % de commission sur vos séances pendant vos 3 premiers mois",
        ],
      },
    ],
    cta: "Rejoindre le réseau",
  },
  {
    subject: "Comment se passe la vérification",
    preheader:
      "Diplôme, autorisation, inscription : ce que nous vérifions et pourquoi.",
    eyebrow: "Accréditation",
    title: "Une vérification qui protège tout le monde",
    body: [
      "Chaque profil est vérifié avant d'être publié : diplôme, autorisation d'exercice, inscription. C'est ce qui permet aux patients de réserver en confiance, et ce qui donne de la valeur à votre présence sur U.Psy.",
      "Si une pièce manque, nous vous le disons précisément ; vous la complétez depuis votre espace, sans tout recommencer.",
    ],
    cta: "Commencer mon dossier",
  },
  {
    subject: "On vous aide à finaliser ?",
    preheader: "Une pièce qui bloque ? Écrivez-nous.",
    eyebrow: "Dernier rappel",
    title: "Un blocage ? Parlons-en",
    body: [
      "Votre dossier n'est pas encore déposé. Si quelque chose vous arrête, une pièce, une question sur l'accréditation ou sur les tarifs, dites-le-nous : nous trouvons la solution avec vous.",
      "C'est notre dernier rappel. Votre place dans la cohorte reste ouverte.",
    ],
    cta: "Reprendre mon dossier",
  },
];

const en: EmailCopy[] = [
  {
    subject: "Your U.Psy application in 12 minutes",
    preheader: "What to have ready, and an answer within 48 hours.",
    eyebrow: "Join U.Psy",
    title: "Only your application is left",
    body: [
      "Thank you for your interest. To join the network, the only step left is your application: about 12 minutes.",
      "Have ready:",
      {
        list: [
          "your degree",
          "your licence to practise or registration",
          "your CV and a professional photo",
        ],
      },
      "Our team reviews every application within 48 hours and answers you, whatever the decision.",
    ],
    cta: "Submit my application",
  },
  {
    subject: "0% commission for 3 months",
    preheader: "You keep your practice and your rates; we handle the rest.",
    eyebrow: "Founding cohort",
    title: "What U.Psy takes care of",
    body: [
      "You keep your practice, your rates and your way of working. U.Psy handles the rest:",
      {
        list: [
          "a verified profile, in your languages, that patients find",
          "bookings, video sessions, reminders and invoicing",
          "patient requests from our campaigns, the Athlete Hub and company programmes",
          "0% commission on your sessions for your first 3 months",
        ],
      },
    ],
    cta: "Join the network",
  },
  {
    subject: "How verification works",
    preheader: "Degree, licence, registration: what we check and why.",
    eyebrow: "Accreditation",
    title: "Verification that protects everyone",
    body: [
      "Every profile is checked before it is published: degree, licence to practise, registration. That is what lets patients book with confidence, and what gives your presence on U.Psy its value.",
      "If a document is missing, we tell you exactly which one; you add it from your space without starting again.",
    ],
    cta: "Start my application",
  },
  {
    subject: "Can we help you finish?",
    preheader: "A document holding you up? Write to us.",
    eyebrow: "Last reminder",
    title: "Stuck on something? Let's talk",
    body: [
      "Your application is not submitted yet. If something is holding you back, a document, a question about accreditation or fees, tell us: we will find the way with you.",
      "This is our last reminder. Your place in the cohort stays open.",
    ],
    cta: "Resume my application",
  },
];

const ar: EmailCopy[] = [
  {
    subject: "ملفك على U.Psy في 12 دقيقة",
    preheader: "الوثائق المطلوبة، والجواب خلال 48 ساعة.",
    eyebrow: "انضم إلى U.Psy",
    title: "لم يبقَ إلا ملفك",
    body: [
      "شكرًا على اهتمامك. للانضمام إلى الشبكة، لم يبقَ إلا إيداع ملفك: نحو 12 دقيقة.",
      "جهّز:",
      {
        list: [
          "شهادتك",
          "رخصة المزاولة أو التسجيل",
          "سيرتك الذاتية وصورة مهنية",
        ],
      },
      "يدرس فريقنا كل ملف خلال 48 ساعة ويجيبك مهما كان القرار.",
    ],
    cta: "أودع ملفي",
  },
  {
    subject: "0٪ عمولة لمدة 3 أشهر",
    preheader: "تحتفظ بعيادتك وأسعارك، ونتكفل نحن بالباقي.",
    eyebrow: "الدفعة المؤسِّسة",
    title: "ما يتكفل به U.Psy",
    body: [
      "تحتفظ بعيادتك وأسعارك وطريقة عملك. ويتكفل U.Psy بالباقي:",
      {
        list: [
          "ملف موثَّق بلغاتك يجده المرضى",
          "الحجوزات والحصص المرئية والتذكيرات والفوترة",
          "طلبات مرضى من حملاتنا ومن Athlete Hub وبرامج المؤسسات",
          "0٪ عمولة على حصصك خلال أشهرك الثلاثة الأولى",
        ],
      },
    ],
    cta: "انضم إلى الشبكة",
  },
  {
    subject: "كيف يجري التحقق",
    preheader: "الشهادة والرخصة والتسجيل: ما نتحقق منه ولماذا.",
    eyebrow: "الاعتماد",
    title: "تحقق يحمي الجميع",
    body: [
      "يُراجَع كل ملف قبل نشره: الشهادة ورخصة المزاولة والتسجيل. هذا ما يسمح للمرضى بالحجز بثقة، وما يعطي قيمة لحضورك على U.Psy.",
      "إذا نقصت وثيقة، نخبرك بها بدقة، فتضيفها من فضائك دون أن تبدأ من جديد.",
    ],
    cta: "ابدأ ملفي",
  },
  {
    subject: "هل نساعدك على إتمامه؟",
    preheader: "وثيقة تعيقك؟ راسلنا.",
    eyebrow: "تذكير أخير",
    title: "هناك ما يعيقك؟ لنتحدث",
    body: [
      "لم يُودَع ملفك بعد. إذا كان شيء ما يوقفك، وثيقة أو سؤال عن الاعتماد أو الأسعار، أخبرنا: سنجد الحل معك.",
      "هذا آخر تذكير منا. مكانك في الدفعة يبقى محفوظًا.",
    ],
    cta: "أكمل ملفي",
  },
];

const ary: EmailCopy[] = [
  {
    subject: "الملف ديالك فـ U.Psy فـ 12 دقيقة",
    preheader: "شنو تجهز، والجواب فـ 48 ساعة.",
    eyebrow: "دخل لـ U.Psy",
    title: "بقى غير الملف ديالك",
    body: [
      "شكرا على الاهتمام ديالك. باش تدخل للشبكة، بقى غير تحط الملف ديالك: شي 12 دقيقة.",
      "وجد:",
      {
        list: [
          "الديبلوم ديالك",
          "الرخصة ديال المزاولة ولا التسجيل",
          "السيرة الذاتية وتصويرة مهنية",
        ],
      },
      "الفريق ديالنا كيشوف كل ملف فـ 48 ساعة وكيجاوبك، كيفما كان القرار.",
    ],
    cta: "حط الملف ديالي",
  },
  {
    subject: "0٪ كوميسيون لمدة 3 شهور",
    preheader: "كتبقى فالعيادة ديالك وبالأثمنة ديالك، والباقي علينا.",
    eyebrow: "الفوج المؤسس",
    title: "شنو كيتكلف بيه U.Psy",
    body: [
      "كتبقى بالعيادة ديالك، الأثمنة ديالك والطريقة ديالك فالخدمة. U.Psy كيتكلف بالباقي:",
      {
        list: [
          "بروفايل متحقق منو، باللغات ديالك، كيلقاوه المرضى",
          "المواعيد، الحصص بالفيديو، التذكيرات والفاتورات",
          "طلبات ديال المرضى من الحملات ديالنا، من Athlete Hub ومن برامج الشركات",
          "0٪ كوميسيون على الحصص ديالك فالتلت شهور الأولين",
        ],
      },
    ],
    cta: "دخل للشبكة",
  },
  {
    subject: "كيفاش كيدوز التحقق",
    preheader: "الديبلوم، الرخصة، التسجيل: شنو كنتحققو منو وعلاش.",
    eyebrow: "الاعتماد",
    title: "تحقق كيحمي الجميع",
    body: [
      "كل بروفايل كيتشاف قبل ما يتنشر: الديبلوم، الرخصة ديال المزاولة، التسجيل. هادشي اللي كيخلي المرضى يحجزو بالثقة، وكيعطي قيمة للحضور ديالك فـ U.Psy.",
      "إلا ناقصة شي وثيقة، كنقولوها ليك بالضبط؛ كتزيدها من الفضاء ديالك بلا ما تعاود من الأول.",
    ],
    cta: "بدا الملف ديالي",
  },
  {
    subject: "نعاونوك تكمّلو؟",
    preheader: "شي وثيقة واقفة ليك؟ كتب لينا.",
    eyebrow: "آخر تذكير",
    title: "شي حاجة واقفة؟ نهضرو",
    body: [
      "الملف ديالك مازال ما تحطش. إلا شي حاجة موقفاك، وثيقة ولا سؤال على الاعتماد ولا الأثمنة، قولها لينا: غادي نلقاو الحل معاك.",
      "هادا آخر تذكير منا. البلاصة ديالك فالفوج كتبقى محلولة.",
    ],
    cta: "رجع للملف ديالي",
  },
];

const zgh: EmailCopy[] = [
  {
    subject: "ⴰⵙⴷⴰⵡ ⵏⵏⴽ ⴳ U.Psy ⴳ 12 ⵏ ⵜⵓⵙⴷⵉⴷⵉⵏ",
    preheader: "ⵎⴰⴷ ⴰⴷ ⵜⵙⵡⵓⴷⴷⵓⴷ, ⴷ ⵓⵔⴰⵔ ⴳ 48 ⵏ ⵜⵙⵔⴰⴳⵉⵏ.",
    eyebrow: "ⴽⵛⵎ ⵙ U.Psy",
    title: "ⵉⵇⵇⵉⵎ ⵖⴰⵙ ⴰⵙⴷⴰⵡ ⵏⵏⴽ",
    body: [
      "ⵜⴰⵏⵎⵎⵉⵔⵜ ⵅⴼ ⵓⵙⵏⵓⵎⵎⵔ ⵏⵏⴽ. ⴰⴷ ⵜⴽⵛⵎⴷ ⵙ ⵓⵥⵟⵟⴰ, ⵉⵇⵇⵉⵎ ⵖⴰⵙ ⴰⴷ ⵜⵙⵙⵔⵙⴷ ⴰⵙⴷⴰⵡ ⵏⵏⴽ: ⵎⴰⵙ 12 ⵏ ⵜⵓⵙⴷⵉⴷⵉⵏ.",
      "ⵙⵡⵓⴷⴷⵓ:",
      {
        list: [
          "ⵜⴰⴳⵓⵔⵉ ⵏⵏⴽ",
          "ⵜⵉⵔⴰⵔⴰ ⵏ ⵓⵙⵡⵓⵔⵉ ⵏⵖ ⴰⵣⵎⵎⴻⵎ",
          "ⴰⵎⵓⴷⴷⵓ ⵏⵏⴽ (CV) ⴷ ⵜⵡⵍⴰⴼⵜ ⵜⴰⵎⵙⵡⵓⵔⵉⵜ",
        ],
      },
      "ⵜⴰⵔⴰⴱⴱⵓⵜ ⵏⵏⵖ ⵜⵙⵎⵔⴰⵙ ⴽⵓ ⴰⵙⴷⴰⵡ ⴳ 48 ⵏ ⵜⵙⵔⴰⴳⵉⵏ, ⵜⵔⴰⵔ ⴰⴽ, ⴽⵢⴼⵎⴰ ⵉⴳⴰ ⵓⵙⵏⵜⵍ.",
    ],
    cta: "ⵙⵙⵔⵙ ⴰⵙⴷⴰⵡ ⵉⵏⵓ",
  },
  {
    subject: "0 % ⵏ ⵜⵡⵙⵉⵡⵜ ⵉ 3 ⵏ ⵡⴰⵢⵢⵓⵔⵏ",
    preheader:
      "ⵜⵇⵇⵉⵎⴷ ⴳ ⵜⴷⴷⴰⵔⵜ ⵏⵏⴽ ⵙ ⵉⵎⵏⴰⴷⵏ ⵏⵏⴽ; ⵏⴽⵏⵉ ⴰⵔ ⵏⵙⵙⵓⴷⵓⵙ ⴰⵢⵏⵏⴰ ⵢⵓⵖⵓⵔⵏ.",
    eyebrow: "ⴰⵙⵔⴰⴳ ⴰⵙⵙⵏⵜⴰⵢ",
    title: "ⵎⴰⴷ ⵉⵜⵜⴰⵡⵉ U.Psy",
    body: [
      "ⵜⵇⵇⵉⵎⴷ ⵙ ⵜⴷⴷⴰⵔⵜ ⵏⵏⴽ, ⵉⵎⵏⴰⴷⵏ ⵏⵏⴽ ⴷ ⵜⵖⴰⵔⴰⵙⵜ ⵏⵏⴽ ⵏ ⵜⵡⵓⵔⵉ. U.Psy ⴰⵔ ⵉⵙⵙⵓⴷⵓⵙ ⴰⵢⵏⵏⴰ ⵢⵓⵖⵓⵔⵏ:",
      {
        list: [
          "ⴰⵎⴰⵖⵏⵓ ⵉⵜⵜⵓⵙⵏⵇⴷⵏ, ⵙ ⵜⵓⵜⵍⴰⵢⵉⵏ ⵏⵏⴽ, ⵜ ⵜⵜⴰⴼⵏ ⵉⵎⵓⴹⴰⵏ",
          "ⵉⵎⵙⴰⵡⴰⵍⵏ, ⵜⵉⵣⵉⵡⵉⵏ ⵙ ⵜⴼⵉⴷⵢⵓⵜ, ⵉⵙⵎⵜⵜⵉⵜⵏ ⴷ ⵜⴼⴰⵜⵓⵔⵉⵏ",
          "ⵜⵓⵜⵜⵔⵉⵡⵉⵏ ⵏ ⵉⵎⵓⴹⴰⵏ ⵙⴳ ⵜⵎⵓⵔⵔⵉⴳⵉⵏ ⵏⵏⵖ, Athlete Hub ⴷ ⵉⵖⴰⵡⴰⵙⵏ ⵏ ⵜⵉⵙⵏⴰⵜⵉⵏ",
          "0 % ⵏ ⵜⵡⵙⵉⵡⵜ ⵅⴼ ⵜⵉⵣⵉⵡⵉⵏ ⵏⵏⴽ ⴳ 3 ⵏ ⵡⴰⵢⵢⵓⵔⵏ ⵉⵎⵣⵡⵓⵔⴰ",
        ],
      },
    ],
    cta: "ⴽⵛⵎ ⵙ ⵓⵥⵟⵟⴰ",
  },
  {
    subject: "ⵎⴰⵎⴽ ⵉⵜⵜⵉⵍⵉ ⵓⵙⵏⵇⴷ",
    preheader: "ⵜⴰⴳⵓⵔⵉ, ⵜⵉⵔⴰⵔⴰ, ⴰⵣⵎⵎⴻⵎ: ⵎⴰⴷ ⵏⵙⵏⵇⴷ ⴷ ⵎⴰⵖ.",
    eyebrow: "ⴰⵙⵏⵇⴷ",
    title: "ⴰⵙⵏⵇⴷ ⵉⵜⵜⵃⴹⴰⵏ ⴽⵓⵍⵍⵓ",
    body: [
      "ⴽⵓ ⴰⵎⴰⵖⵏⵓ ⵉⵜⵜⵓⵙⵏⵇⴷ ⵇⴱⵍ ⴰⴷ ⵉⵜⵜⵓⵙⵙⵓⴼⵖ: ⵜⴰⴳⵓⵔⵉ, ⵜⵉⵔⴰⵔⴰ ⵏ ⵓⵙⵡⵓⵔⵉ, ⴰⵣⵎⵎⴻⵎ. ⴰⵢⴰ ⴰⵢ ⵉⵜⵜⴰⵊⵊⴰⵏ ⵉⵎⵓⴹⴰⵏ ⴰⴷ ⵙⵙⴰⵖⵏ ⴰⵙⵎⵙⴰⵡⴰⵍ ⵙ ⵓⴼⵓⵙ ⴰⵎⵇⵔⴰⵏ.",
      "ⵎⴽ ⵜⵅⵚⵚⴰ ⵢⴰⵜ ⵜⴳⵓⵔⵉ, ⴰⴷ ⴰⴽ ⵜⵜ ⵏⵉⵏⵉ ⵙ ⵓⵏⵛⴽ; ⵜⵔⵏⵓⴷ ⵜⵜ ⵙⴳ ⵜⵙⵏⴰ ⵏⵏⴽ ⴱⵍⴰ ⴰⴷ ⵜⴰⵍⵙⴷ ⵙⴳ ⵜⵉⵣⵡⵉⵔⵉ.",
    ],
    cta: "ⵙⵙⵏⵜⵉ ⴰⵙⴷⴰⵡ ⵉⵏⵓ",
  },
  {
    subject: "ⴰⴷ ⴰⴽ ⵏⴰⵡⵙ ⴰⴷ ⵜⵙⵎⴷⴷ?",
    preheader: "ⵢⴰⵜ ⵜⴳⵓⵔⵉ ⵉⵜⵜⴰⵃⴱⴰⵙⵏ? ⴰⵔⵓ ⴰⵖ.",
    eyebrow: "ⴰⵙⵎⵜⵜⵉ ⴰⵏⴳⴳⴰⵔⵓ",
    title: "ⵢⴰⵜ ⵜⵖⴰⵡⵙⴰ ⵉⵜⵜⴰⵃⴱⴰⵙⵏ? ⴰⴷ ⵏⵎⵙⴰⵡⴰⵍ",
    body: [
      "ⴰⵙⴷⴰⵡ ⵏⵏⴽ ⵓⵔⴰ ⵉⵜⵜⵓⵙⵙⵔⵙ. ⵎⴽ ⵜⵍⵍⴰ ⵢⴰⵜ ⵜⵖⴰⵡⵙⴰ ⵉⵜⵜⴰⵃⴱⴰⵙⵏ ⴽ, ⵢⴰⵜ ⵜⴳⵓⵔⵉ ⵏⵖ ⵜⵓⵜⵜⵔⴰ ⵅⴼ ⵓⵙⵏⵇⴷ ⵏⵖ ⵉⵎⵏⴰⴷⵏ, ⵉⵏⵉ ⴰⵖ ⵜⵜ: ⴰⴷ ⵏⴰⴼ ⴰⴼⵔⴰⵔ ⴷⵉⴽ.",
      "ⵡⴰⴷ ⴰⴷ ⵉⴳⴰ ⴰⵙⵎⵜⵜⵉ ⴰⵏⴳⴳⴰⵔⵓ. ⴰⵏⵙⴰ ⵏⵏⴽ ⴳ ⵓⵙⵔⴰⴳ ⵉⵇⵇⵉⵎ ⵉⵕⵥⵎ.",
    ],
    cta: "ⵓⵖⵓⵍ ⵙ ⵓⵙⴷⴰⵡ ⵉⵏⵓ",
  },
];

const rif: EmailCopy[] = [
  {
    subject: "Adusi-nnek di U.Psy di 12 n tusdidin",
    preheader: "Mayen ara twejjded, d tiririt di 48 n tsaɛin.",
    eyebrow: "Kcem ɣer U.Psy",
    title: "Yeqqim ɣir adusi-nnek",
    body: [
      "Tanmirt ɣef ulmad-nnek. Ad tkecmed ɣer uẓeṭṭa, yeqqim ɣir ad tessersed adusi-nnek: xas 12 n tusdidin.",
      "Wejjed:",
      {
        list: [
          "tagrut-nnek",
          "rexṣa n uxeddem niɣ ajerred",
          "CV-nnek d yiğet n tewlaft n uxeddem",
        ],
      },
      "Tarabbut-nneɣ tettẓar kul adusi di 48 n tsaɛin, tettarra-yak, kifma yeqqar uqerrar.",
    ],
    cta: "Ssers adusi-inu",
  },
  {
    subject: "0 % n tawsiwt i 3 n yuren",
    preheader:
      "Teqqimed di tedwart-nnek s ssuma-nnek; nekkenti ad nexdem ayen yeqqimen.",
    eyebrow: "Arebbaɛ amezwaru",
    title: "Mayen yettawi U.Psy",
    body: [
      "Teqqimed s tedwart-nnek, s ssuma-nnek d tarrayt-nnek n uxeddem. U.Psy ad yexdem ayen yeqqimen:",
      {
        list: [
          "amaɣnu yettwasenqden, s tutlayin-nnek, t-ttafen imuḍan",
          "timlilin, tiɣimiwin s tvidyut, isemktayen d tfaturin",
          "isuturen n imuḍan zi tmurrigin-nneɣ, zi Athlete Hub d iɣawasen n tsiridin",
          "0 % n tawsiwt ɣef tiɣimiwin-nnek di 3 n yuren imezwura",
        ],
      },
    ],
    cta: "Kcem ɣer uẓeṭṭa",
  },
  {
    subject: "Mamek yettili usenqed",
    preheader: "Tagrut, rexṣa, ajerred: mayen nsenqad d maɣef.",
    eyebrow: "Asenqed",
    title: "Asenqed yettḥaḍan kulci",
    body: [
      "Kul amaɣnu yettwasenqad qbel ad d-yeffeɣ: tagrut, rexṣa n uxeddem, ajerred. Aya i yettajjan imuḍan ad ḥeǧzen s tiqqa.",
      "Max texṣa kra n tegrut, ad ak-t-nini s tidet; ad tt-ternid zi tasna-nnek bla ma tɛawded zi tazwara.",
    ],
    cta: "Bda adusi-inu",
  },
  {
    subject: "Ad ak-nɛawen ad tkemmled?",
    preheader: "Kra n tegrut yetteḥbasen? Ari-aɣ-d.",
    eyebrow: "Asemktay aneggaru",
    title: "Kra n tɣawsa yetteḥbasen? Ad nemsawal",
    body: [
      "Adusi-nnek mazal war yettwassers. Max kra n tɣawsa tetteḥbas-ak, tagrut niɣ asteqsi ɣef usenqed niɣ ssuma, ini-aɣ-tt: ad naf tifrat ak d cek.",
      "Wa d asemktay aneggaru. Amkan-nnek deg ureba yeqqim yeldi.",
    ],
    cta: "Uɣul ɣer udusi-inu",
  },
];

const copy: Record<Lang, EmailCopy[]> = { fr, en, ar, ary, zgh, rif };

export const SPECIALIST: SequenceDef = {
  id: "specialist",
  convertedIf: (f) => !!f.applied,
  steps: [
    { delayHours: 2, path: "/apply/wizard" },
    { delayHours: 72, path: "/apply/wizard" },
    { delayHours: 96, path: "/apply/wizard" },
    { delayHours: 168, path: "/apply/wizard" },
  ],
  copy,
};
