import type { EmailCopy, Lang, SequenceDef } from "./types.ts";

/**
 * Patients: people who took the free mental-performance score, or asked for
 * the WELCOME20 code on /campaigns/first-session. Goal: a first booking.
 * Stops as soon as one exists. Written for the public: no diagnosis, no
 * pressure, and the emergency numbers in the first and last email.
 */

const fr: EmailCopy[] = [
  {
    subject: "Votre code WELCOME20 est là",
    preheader: "-20 % sur votre première séance, avec un psychologue vérifié.",
    eyebrow: "Offre de bienvenue",
    title: "Votre code : WELCOME20",
    body: [
      "Merci de votre confiance. Avec le code WELCOME20, votre première séance avec un psychologue vérifié est à -20 %. Il s'applique au paiement.",
      "Si vous avez fait le score gratuit, gardez en tête qu'il donne une photo du moment, pas un diagnostic : c'est un point de départ pour en parler.",
      { safety: true },
    ],
    cta: "Choisir mon psychologue",
  },
  {
    subject: "Deux minutes pour souffler",
    preheader: "Un exercice simple à faire aujourd'hui, où que vous soyez.",
    eyebrow: "Un exercice",
    title: "La respiration 4-6",
    body: [
      "Un geste simple, utilisé en préparation mentale comme en consultation :",
      {
        list: [
          "inspirez par le nez en comptant jusqu'à 4",
          "expirez lentement par la bouche en comptant jusqu'à 6",
          "continuez deux minutes, trois fois dans la journée",
        ],
      },
      "Une expiration plus longue que l'inspiration aide le corps à ralentir. Si un moment difficile revient souvent, c'est aussi un bon sujet pour une première séance.",
    ],
    cta: "Mesurer où j'en suis",
  },
  {
    subject: "À quoi ressemble une première séance",
    preheader: "50 minutes, confidentielles, dans la langue de votre choix.",
    eyebrow: "La première séance",
    title: "Ce qui se passe, concrètement",
    body: [
      "Une première séance dure environ 50 minutes, en visio ou au cabinet. Vous parlez de ce qui vous amène, le psychologue vous écoute et vous propose une façon d'avancer. Rien ne vous engage pour la suite.",
      {
        list: [
          "en français, en arabe, en darija ou en anglais",
          "confidentielle, avec des échanges chiffrés (loi 09-08)",
          "si le courant ne passe pas, nous vous proposons une autre séance, gratuitement",
        ],
      },
      "Votre code WELCOME20 vaut -20 % sur cette première séance.",
    ],
    cta: "Réserver ma première séance",
  },
  {
    subject: "Comment choisir son psychologue",
    preheader: "Trois critères, ou une orientation en deux minutes.",
    eyebrow: "Bien choisir",
    title: "Trois questions pour choisir",
    body: [
      "Le bon psychologue, c'est d'abord celui avec qui vous vous sentez à l'aise. Pour vous orienter :",
      {
        list: [
          "son domaine : stress, sommeil, relations, performance, deuil…",
          "sa langue : celle dans laquelle vous parlez le plus librement",
          "le format : visio de chez vous, ou cabinet près de chez vous",
        ],
      },
      "Vous préférez être guidé(e) ? Répondez à quelques questions et nous vous proposons des profils adaptés.",
    ],
    cta: "Être orienté(e)",
  },
  {
    subject: "Votre code reste valable",
    preheader: "C'est notre dernier message ; la porte reste ouverte.",
    eyebrow: "Quand vous serez prêt(e)",
    title: "Prenez le temps qu'il faut",
    body: [
      "Demander de l'aide se fait à son rythme. Votre code WELCOME20 reste valable pour votre première séance, quand vous le déciderez.",
      "C'est notre dernier message de cette série.",
      { safety: true },
    ],
    cta: "Voir les psychologues",
  },
];

const en: EmailCopy[] = [
  {
    subject: "Your WELCOME20 code is here",
    preheader: "20% off your first session with a verified psychologist.",
    eyebrow: "Welcome offer",
    title: "Your code: WELCOME20",
    body: [
      "Thank you for your trust. With the code WELCOME20, your first session with a verified psychologist is 20% off. It applies at checkout.",
      "If you took the free score, keep in mind it is a snapshot of the moment, not a diagnosis: a starting point for a conversation.",
      { safety: true },
    ],
    cta: "Choose my psychologist",
  },
  {
    subject: "Two minutes to breathe",
    preheader: "A simple exercise for today, wherever you are.",
    eyebrow: "An exercise",
    title: "4-6 breathing",
    body: [
      "A simple technique, used in mental performance work as well as in therapy:",
      {
        list: [
          "breathe in through your nose for a count of 4",
          "breathe out slowly through your mouth for a count of 6",
          "keep going for two minutes, three times a day",
        ],
      },
      "Breathing out for longer than you breathe in helps the body slow down. If a difficult moment keeps coming back, it is also a good subject for a first session.",
    ],
    cta: "See where I stand",
  },
  {
    subject: "What a first session looks like",
    preheader: "50 minutes, confidential, in the language you choose.",
    eyebrow: "The first session",
    title: "What happens, in practice",
    body: [
      "A first session lasts about 50 minutes, by video or in person. You talk about what brings you, the psychologist listens and suggests a way forward. Nothing commits you to more.",
      {
        list: [
          "in French, Arabic, Darija or English",
          "confidential, with encrypted communication (Law 09-08)",
          "if the fit is off, we offer you another session, free",
        ],
      },
      "Your WELCOME20 code gives 20% off this first session.",
    ],
    cta: "Book my first session",
  },
  {
    subject: "How to choose a psychologist",
    preheader: "Three criteria, or guidance in two minutes.",
    eyebrow: "Choosing well",
    title: "Three questions to choose",
    body: [
      "The right psychologist is first of all someone you feel at ease with. To guide you:",
      {
        list: [
          "their field: stress, sleep, relationships, performance, grief…",
          "their language: the one you speak most freely in",
          "the format: video from home, or a practice near you",
        ],
      },
      "Prefer some guidance? Answer a few questions and we will suggest suitable profiles.",
    ],
    cta: "Get guidance",
  },
  {
    subject: "Your code is still valid",
    preheader: "This is our last message; the door stays open.",
    eyebrow: "When you are ready",
    title: "Take the time you need",
    body: [
      "Asking for help happens at your own pace. Your WELCOME20 code stays valid for your first session, whenever you decide.",
      "This is the last message in this series.",
      { safety: true },
    ],
    cta: "See the psychologists",
  },
];

const ar: EmailCopy[] = [
  {
    subject: "رمزك WELCOME20 وصل",
    preheader: "خصم 20٪ على جلستك الأولى مع أخصائي نفسي موثَّق.",
    eyebrow: "عرض الترحيب",
    title: "رمزك: WELCOME20",
    body: [
      "شكرًا على ثقتك. بالرمز WELCOME20، تحصل على خصم 20٪ على جلستك الأولى مع أخصائي نفسي موثَّق. يُطبَّق عند الدفع.",
      "إذا أجريت المؤشر المجاني، تذكّر أنه صورة عن اللحظة وليس تشخيصًا: إنه نقطة انطلاق للحديث.",
      { safety: true },
    ],
    cta: "اختر أخصائيي",
  },
  {
    subject: "دقيقتان لتتنفس",
    preheader: "تمرين بسيط لليوم، أينما كنت.",
    eyebrow: "تمرين",
    title: "تنفس 4-6",
    body: [
      "تقنية بسيطة تُستعمل في الإعداد الذهني كما في الجلسات:",
      {
        list: [
          "استنشق من الأنف وأنت تعدّ إلى 4",
          "ازفر ببطء من الفم وأنت تعدّ إلى 6",
          "استمر دقيقتين، ثلاث مرات في اليوم",
        ],
      },
      "الزفير الأطول من الشهيق يساعد الجسم على التهدئة. وإذا تكررت لحظة صعبة، فهي موضوع جيد لجلسة أولى.",
    ],
    cta: "قِس أين أنا",
  },
  {
    subject: "كيف تبدو الجلسة الأولى",
    preheader: "50 دقيقة، سرية، باللغة التي تختارها.",
    eyebrow: "الجلسة الأولى",
    title: "ما الذي يحدث، عمليًا",
    body: [
      "تدوم الجلسة الأولى نحو 50 دقيقة، عن بُعد أو في العيادة. تتحدث عمّا جاء بك، يستمع إليك الأخصائي ويقترح عليك طريقة للتقدم. لا شيء يُلزمك بالمواصلة.",
      {
        list: [
          "بالفرنسية أو العربية أو الدارجة أو الإنجليزية",
          "سرية، باتصالات مشفَّرة (القانون 09-08)",
          "إن لم تجد الانسجام، نقترح عليك جلسة أخرى مجانًا",
        ],
      },
      "رمزك WELCOME20 يمنحك خصم 20٪ على هذه الجلسة الأولى.",
    ],
    cta: "احجز جلستي الأولى",
  },
  {
    subject: "كيف تختار أخصائيك النفسي",
    preheader: "ثلاثة معايير، أو توجيه في دقيقتين.",
    eyebrow: "اختيار موفَّق",
    title: "ثلاثة أسئلة للاختيار",
    body: [
      "الأخصائي المناسب هو أولًا من تشعر معه بالراحة. لتوجيهك:",
      {
        list: [
          "مجاله: التوتر، النوم، العلاقات، الأداء، الفقد…",
          "لغته: اللغة التي تتحدث بها بحرية أكبر",
          "الصيغة: عن بُعد من بيتك، أو عيادة قريبة منك",
        ],
      },
      "تفضّل أن نوجهك؟ أجب عن بعض الأسئلة ونقترح عليك ملفات مناسبة.",
    ],
    cta: "احصل على توجيه",
  },
  {
    subject: "رمزك لا يزال صالحًا",
    preheader: "هذه آخر رسالة منا، والباب يبقى مفتوحًا.",
    eyebrow: "متى كنت مستعدًا",
    title: "خذ الوقت الذي تحتاجه",
    body: [
      "طلب المساعدة يتم بالإيقاع الذي يناسبك. رمزك WELCOME20 يبقى صالحًا لجلستك الأولى، متى قررت.",
      "هذه آخر رسالة في هذه السلسلة.",
      { safety: true },
    ],
    cta: "تصفح الأخصائيين",
  },
];

const ary: EmailCopy[] = [
  {
    subject: "الكود ديالك WELCOME20 وصل",
    preheader: "-20٪ على أول حصة مع أخصائي نفساني متحقق منو.",
    eyebrow: "عرض الترحيب",
    title: "الكود ديالك: WELCOME20",
    body: [
      "شكرا على الثقة ديالك. بالكود WELCOME20، أول حصة ديالك مع أخصائي نفساني متحقق منو كتولي بـ -20٪. كيتطبق ملي تخلص.",
      "إلا درتي السكور المجاني، عقل بلي هو غير تصويرة ديال دابا، ماشي تشخيص: هو بداية باش تهضر.",
      { safety: true },
    ],
    cta: "ختار الأخصائي ديالي",
  },
  {
    subject: "جوج دقايق باش ترتاح",
    preheader: "تمرين ساهل تديرو اليوم، فين ما كنتي.",
    eyebrow: "تمرين",
    title: "التنفس 4-6",
    body: [
      "حركة ساهلة، كتستعمل فالتحضير الذهني وحتى فالحصص:",
      {
        list: [
          "جبد النفس من نيفك وانت كتحسب حتى لـ 4",
          "خرج النفس بشوية من فمك وانت كتحسب حتى لـ 6",
          "كمل جوج دقايق، تلت مرات فالنهار",
        ],
      },
      "ملي كتخرج النفس كثر من ما كتجبدو، الجسم كيهدا. وإلا شي لحظة صعيبة كتعاود ليك، راه موضوع مزيان لأول حصة.",
    ],
    cta: "عرف فين وصلت",
  },
  {
    subject: "كيفاش كتكون أول حصة",
    preheader: "50 دقيقة، سرية، باللغة اللي بغيتي.",
    eyebrow: "أول حصة",
    title: "شنو كيوقع، بالواضح",
    body: [
      "أول حصة كتدوم شي 50 دقيقة، بالفيديو ولا فالعيادة. كتهضر على اللي جابك، الأخصائي كيسمع ليك وكيقترح عليك طريقة تزيد بيها. حتى حاجة ما كتلزمك تكمل.",
      {
        list: [
          "بالفرنسية، العربية، الدارجة ولا الإنجليزية",
          "سرية، والتواصل مشفر (القانون 09-08)",
          "إلا ما تفاهمتيش معاه، كنعطيوك حصة أخرى بلاش",
        ],
      },
      "الكود ديالك WELCOME20 كيعطيك -20٪ على هاد أول حصة.",
    ],
    cta: "حجز أول حصة ديالي",
  },
  {
    subject: "كيفاش تختار الأخصائي ديالك",
    preheader: "تلت معايير، ولا توجيه فـ جوج دقايق.",
    eyebrow: "ختار مزيان",
    title: "تلت أسئلة باش تختار",
    body: [
      "الأخصائي المزيان هو اللي كتحس معاه براحتك. باش نوجهوك:",
      {
        list: [
          "المجال ديالو: الستريس، النعاس، العلاقات، الأداء، الفقدان…",
          "اللغة ديالو: اللغة اللي كتهضر بيها بحرية",
          "الطريقة: بالفيديو من الدار، ولا عيادة قريبة ليك",
        ],
      },
      "بغيتي نوجهوك حنا؟ جاوب على شي أسئلة ونقترحو عليك بروفايلات اللي كتناسبك.",
    ],
    cta: "وجهوني",
  },
  {
    subject: "الكود ديالك مازال صالح",
    preheader: "هادي آخر رسالة منا، والباب كيبقى محلول.",
    eyebrow: "ملي تكون واجد",
    title: "خود الوقت اللي خاصك",
    body: [
      "طلب المساعدة كيتدار على حساب الإيقاع ديالك. الكود ديالك WELCOME20 كيبقى صالح لأول حصة، ملي تقرر.",
      "هادي آخر رسالة فهاد السلسلة.",
      { safety: true },
    ],
    cta: "شوف الأخصائيين",
  },
];

const zgh: EmailCopy[] = [
  {
    subject: "ⵜⴰⵏⴳⴰⵍⵜ ⵏⵏⴽ WELCOME20 ⵜⵍⴽⵎ ⴷ",
    preheader: "-20 % ⵅⴼ ⵜⵉⵣⵉⵡⵉ ⵏⵏⴽ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ ⴷ ⵢⴰⵏ ⵓⵎⵙⵙⵏⴰⵙ ⵉⵜⵜⵓⵙⵏⵇⴷⵏ.",
    eyebrow: "ⴰⵙⵏⵓⴱⴳ",
    title: "ⵜⴰⵏⴳⴰⵍⵜ ⵏⵏⴽ: WELCOME20",
    body: [
      "ⵜⴰⵏⵎⵎⵉⵔⵜ ⵅⴼ ⵜⵉⵇⵇⴰ ⵏⵏⴽ. ⵙ ⵜⵏⴳⴰⵍⵜ WELCOME20, ⵜⵉⵣⵉⵡⵉ ⵏⵏⴽ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ ⴷ ⵓⵎⵙⵙⵏⴰⵙ ⵏ ⵜⵏⴼⵙⵉⵜ ⵙ -20 %. ⵜⵜⵓⵙⵎⵔⴰⵙ ⴳ ⵓⴼⵔⵓ.",
      "ⵎⴽ ⵜⴳⵉⴷ ⴰⵙⵙⵓⴹⵏ ⵉⵍⴰⵍⵍⵉⵏ, ⵙⵙⵏ ⵉⵙ ⵉⴳⴰ ⵜⴰⵡⵍⴰⴼⵜ ⵏ ⵖⵉⵍⴰ, ⵓⵔ ⵉⴳⵉ ⴰⵙⵙⵓⴹⵏ ⴰⵙⵏⵓⵊⵊⵓ: ⵉⴳⴰ ⴰⵏⵙⴰ ⵏ ⵓⵙⵙⵏⵜⵉ ⵏ ⵓⵎⵙⴰⵡⴰⵍ.",
      { safety: true },
    ],
    cta: "ⵙⵜⵢ ⴰⵎⵙⵙⵏⴰⵙ ⵉⵏⵓ",
  },
  {
    subject: "ⵙⵏⴰⵜ ⵜⵓⵙⴷⵉⴷⵉⵏ ⴰⴷ ⵜⵙⵓⵏⴼⵓⴷ",
    preheader: "ⵢⴰⵏ ⵓⵎⵙⵙⵓⵖⵍ ⵉⴼⵙⵓⵙⵏ ⵉ ⵡⴰⵙⵙ ⴰⴷ, ⵏⵏⵉⴳ ⵎⴰⵏⵉ ⵜⵍⵍⵉⴷ.",
    eyebrow: "ⴰⵎⵙⵙⵓⵖⵍ",
    title: "ⴰⵙⵓⵏⴼⵓ 4-6",
    body: [
      "ⵢⴰⵜ ⵜⵖⴰⵔⴰⵙⵜ ⵉⴼⵙⵓⵙⵏ, ⵜⵜⵓⵙⵎⵔⴰⵙ ⴳ ⵓⵙⵡⵊⴷ ⴰⵏⴼⵙⴰⵏ ⴷ ⵜⵉⵣⵉⵡⵉⵏ:",
      {
        list: [
          "ⵙⵙⴽⵛⵎ ⵜⴰⵏⴼⴰⵙⵜ ⵙⴳ ⵓⵏⵣⴰⵔ ⵙ ⵓⵙⵙⵉⴹⵏ ⴰⵔ 4",
          "ⵙⵙⵓⴼⵖ ⵜⴰⵏⴼⴰⵙⵜ ⵙ ⵍⵎⵀⵍ ⵙⴳ ⵉⵎⵉ ⵙ ⵓⵙⵙⵉⴹⵏ ⴰⵔ 6",
          "ⴽⵎⵎⵍ ⵙⵏⴰⵜ ⵜⵓⵙⴷⵉⴷⵉⵏ, ⴽⵔⴰⴹ ⵜⵉⴽⴽⴰⵍ ⴳ ⵡⴰⵙⵙ",
        ],
      },
      "ⵜⴰⵙⵙⵓⴼⵖⴰ ⵏ ⵜⵏⴼⴰⵙⵜ ⵢⵖⵣⵣⵉⴼⵏ ⵜⵜⴰⵡⵙ ⵜⴰⴼⵔⴽⵉⵜ ⴰⴷ ⵜⵙⵓⵏⴼⵓ. ⵎⴽ ⵜⵜⵓⵖⴰⵍ ⵢⴰⵜ ⵜⵉⵣⵉ ⵉⵖⵓⴷⴰⵏ, ⵜⴳⴰ ⴰⵙⵏⵜⵍ ⵉⴼⵓⵍⴽⵉⵏ ⵉ ⵜⵉⵣⵉⵡⵉ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ.",
    ],
    cta: "ⵙⵙⵏ ⵎⴰⵏⵉ ⵍⵍⵉⵖ",
  },
  {
    subject: "ⵎⴰⵎⴽ ⵜⴳⴰ ⵜⵉⵣⵉⵡⵉ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ",
    preheader: "50 ⵏ ⵜⵓⵙⴷⵉⴷⵉⵏ, ⵜⵓⵏⵏⵓⵖⴰⵏⵜ, ⵙ ⵜⵓⵜⵍⴰⵢⵜ ⵏⵏⴽ.",
    eyebrow: "ⵜⵉⵣⵉⵡⵉ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ",
    title: "ⵎⴰⴷ ⵉⵜⵜⵉⵍⵉⵏ, ⵙ ⵜⵉⴷⵜ",
    body: [
      "ⵜⵉⵣⵉⵡⵉ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ ⵜⵜⴰⵡⵉ ⵎⴰⵙ 50 ⵏ ⵜⵓⵙⴷⵉⴷⵉⵏ, ⵙ ⵜⴼⵉⴷⵢⵓⵜ ⵏⵖ ⴳ ⵜⴷⴷⴰⵔⵜ ⵏ ⵓⵙⵡⵓⵔⵉ. ⴰⵔ ⵜⵙⴰⵡⴰⵍⴷ ⵅⴼ ⵎⴰⴷ ⴽ ⴷ ⵢⵓⵡⵉⵏ, ⴰⵎⵙⵙⵏⴰⵙ ⴰⵔ ⴰⴽ ⵉⵙⴼⵍⴷ, ⵉⵙⵓⵎⵔ ⴰⴽ ⵢⴰⵏ ⵓⴱⵔⵉⴷ. ⵓⵔ ⴽ ⵉⵜⵜⵖⵓⵍ ⴽⵔⴰ.",
      {
        list: [
          "ⵙ ⵜⴼⵔⴰⵏⵙⵉⵙⵜ, ⵜⴰⵄⵔⴰⴱⵜ, ⵜⴷⴰⵔⵉⵊⵜ ⵏⵖ ⵜⵏⴳⵍⵉⵣⵜ",
          "ⵜⵓⵏⵏⵓⵖⴰⵏⵜ, ⵙ ⵓⵎⵢⴰⵡⴰⵍ ⵉⵜⵜⵓⵙⵎⵔⵙⵏ (ⴰⵙⵍⵖⵓ 09-08)",
          "ⵎⴽ ⵓⵔ ⵜⵎⵙⴰⵙⴰⴷ, ⴰⴷ ⴰⴽ ⵏⴼⴽ ⵢⴰⵜ ⵜⵉⵣⵉⵡⵉ ⵢⴰⴹⵏ ⴱⵍⴰ ⴰⵜⵉⴳ",
        ],
      },
      "ⵜⴰⵏⴳⴰⵍⵜ ⵏⵏⴽ WELCOME20 ⵜⴻⴼⴼⴰ -20 % ⵅⴼ ⵜⵉⵣⵉⵡⵉ ⴰⴷ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ.",
    ],
    cta: "ⵙⵙⴰⵖ ⵜⵉⵣⵉⵡⵉ ⵉⵏⵓ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ",
  },
  {
    subject: "ⵎⴰⵎⴽ ⴰⴷ ⵜⵙⵜⵢⴷ ⴰⵎⵙⵙⵏⴰⵙ ⵏⵏⴽ",
    preheader: "ⴽⵔⴰⴹ ⵏ ⵉⵙⵡⵉⵔⵏ, ⵏⵖ ⴰⵙⵡⵉⵍ ⴳ ⵙⵏⴰⵜ ⵜⵓⵙⴷⵉⴷⵉⵏ.",
    eyebrow: "ⴰⵙⵜⴰⵢ ⵉⵖⵓⴷⴰⵏ",
    title: "ⴽⵔⴰⴹ ⵏ ⵜⵓⵜⵜⵔⵉⵡⵉⵏ ⴰⴷ ⵜⵙⵜⵢⴷ",
    body: [
      "ⴰⵎⵙⵙⵏⴰⵙ ⵉⵖⵓⴷⴰⵏ ⵉⴳⴰ ⵡⵉⵏⵏⴰ ⴷ ⵎⵉ ⵜⵜⵓⴼⴰⴷ ⵜⵓⵏⴼⵓⵜ. ⴰⴷ ⴰⴽ ⵏⵙⵙⵏⵎⵍ:",
      {
        list: [
          "ⵜⴰⵙⵏⵓⴱⴳⴰ ⵏⵏⵙ: ⴰⵙⵖⴰⵍ, ⵉⴹⵙ, ⵜⵉⵣⴷⵉⵡⵉⵏ, ⴰⵙⵎⵔⵙ, ⴰⵏⴳⴳⴰⵔ…",
          "ⵜⵓⵜⵍⴰⵢⵜ ⵏⵏⵙ: ⵜⵉⵏⵏⴰ ⵙ ⵜⵙⴰⵡⴰⵍⴷ ⵙ ⵜⵍⴻⵍⵍⵉ",
          "ⵜⴰⵖⴰⵔⴰⵙⵜ: ⵙ ⵜⴼⵉⴷⵢⵓⵜ ⵙⴳ ⵜⴰⴷⴷⴰⵔⵜ, ⵏⵖ ⵜⴰⴷⴷⴰⵔⵜ ⵏ ⵓⵙⵡⵓⵔⵉ ⵉⵇⵔⴱⵏ",
        ],
      },
      "ⵜⵔⵉⴷ ⴰⴷ ⴽ ⵏⵙⵙⵏⵎⵍ? ⵔⴰⵔ ⵅⴼ ⴽⵔⴰ ⵏ ⵜⵓⵜⵜⵔⵉⵡⵉⵏ ⴰⴷ ⴰⴽ ⵏⵙⵓⵎⵔ ⵉⵎⴰⵖⵏⵓⵜⵏ ⵉⵎⵙⴰⵙⴰⵏ.",
    ],
    cta: "ⵙⵙⵏⵎⵍ ⵢⵉ",
  },
  {
    subject: "ⵜⴰⵏⴳⴰⵍⵜ ⵏⵏⴽ ⵜⵇⵇⵉⵎ ⵜⵍⴰ ⴰⵣⴰⵍ",
    preheader: "ⵜⴰⴷ ⴰⴷ ⵜⴳⴰ ⵜⴰⴱⵔⴰⵜ ⵜⴰⵏⴳⴳⴰⵔⵓⵜ; ⵜⴰⵡⵡⵓⵔⵜ ⵜⵇⵇⵉⵎ ⵜⵕⵥⵎ.",
    eyebrow: "ⵎⴽ ⵜⵡⵊⴷⴷ",
    title: "ⴰⵡⵉ ⴰⴽⵓⴷ ⵍⵍⵉ ⵜⵔⵉⴷ",
    body: [
      "ⴰⵙⵓⵜⵔ ⵏ ⵜⵡⵉⵙⵉ ⵉⵜⵜⵉⵍⵉ ⵙ ⵓⵏⵣⵡⵉ ⵏⵏⴽ. ⵜⴰⵏⴳⴰⵍⵜ ⵏⵏⴽ WELCOME20 ⵜⵇⵇⵉⵎ ⵜⵍⴰ ⴰⵣⴰⵍ ⵉ ⵜⵉⵣⵉⵡⵉ ⵏⵏⴽ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ, ⵎⴽ ⵜⵙⵏⵜⵍⴷ.",
      "ⵜⴰⴷ ⴰⴷ ⵜⴳⴰ ⵜⴰⴱⵔⴰⵜ ⵜⴰⵏⴳⴳⴰⵔⵓⵜ ⴳ ⵜⵙⵍⵙⵍⵜ ⴰⴷ.",
      { safety: true },
    ],
    cta: "ⵥⵕ ⵉⵎⵙⵙⵏⴰⵙⵏ",
  },
];

const rif: EmailCopy[] = [
  {
    subject: "Tangalt-nnek WELCOME20 tewweḍ-d",
    preheader: "-20 % ɣef tiɣimit-nnek tamezwarut ak d umusnaw yettwasenqden.",
    eyebrow: "Asnubeg",
    title: "Tangalt-nnek: WELCOME20",
    body: [
      "Tanmirt ɣef tiqqa-nnek. S tengalt WELCOME20, tiɣimit-nnek tamezwarut ak d umusnaw n tefsit s -20 %. Tettwaxdam mani ttxelleṣed.",
      "Max texdemd asekyed ilellin, ssen belli d tawlaft n tura, mači d asekyed n uṭṭan: d tazwara n umsawal.",
      { safety: true },
    ],
    cta: "Xtar amusnaw-inu",
  },
  {
    subject: "Snat n tusdidin ad tsunfud",
    preheader: "Yiğ n umesṣuɣel isehlen i wass-a, mani telid.",
    eyebrow: "Amesṣuɣel",
    title: "Asunfu 4-6",
    body: [
      "Yiğet n tarrayt isehlen, tettwaxdam di usewjed n uqerru d tiɣimiwin:",
      {
        list: [
          "jbed tanfast zeg wenzaren-nnek, ḥseb alamma 4",
          "ssuffeɣ tanfast s ttawil zi yimi-nnek, ḥseb alamma 6",
          "kemmel snat n tusdidin, kraḍ n tikkal di wass",
        ],
      },
      "Asuffeɣ n tenfast yeɣẓẓifen yettɛawan tafekka ad tsunfu. Max yiğet n tsaɛt iweɛren tettuɣal-ak, d asentel yelhan i tiɣimit tamezwarut.",
    ],
    cta: "Ssen mani lliɣ",
  },
  {
    subject: "Mamek tettili tiɣimit tamezwarut",
    preheader: "50 n tusdidin, tuffirt, s tutlayt-nnek.",
    eyebrow: "Tiɣimit tamezwarut",
    title: "Mayen yettilin, s tidet",
    body: [
      "Tiɣimit tamezwarut tettawi xas 50 n tusdidin, s tvidyut niɣ di tedwart. Ad tsawled ɣef mayen ak-d-yewwin, amusnaw ad ak-yesfled, ad ak-yesumer yiğ n ubrid. Walu war ak-yettḥettem ad tkemmled.",
      {
        list: [
          "s tefransist, taɛrabt, tadarijt niɣ tanglizt",
          "tuffirt, s umyawal yettwaqqnen (azref 09-08)",
          "max war temsasad, ad ak-nefk yiğet n tɣimit nniḍen bla ssuma",
        ],
      },
      "Tangalt-nnek WELCOME20 tetteg -20 % ɣef tiɣimit-a tamezwarut.",
    ],
    cta: "Ḥjez tiɣimit-inu tamezwarut",
  },
  {
    subject: "Mamek ad textared amusnaw-nnek",
    preheader: "Kraḍ n iswiren, niɣ asenmel di snat n tusdidin.",
    eyebrow: "Axtiri yelhan",
    title: "Kraḍ n isteqsiyen ad textared",
    body: [
      "Amusnaw yelhan d win ak-d-yeggan ad tḥuled d cek. Ad k-nesnemmel:",
      {
        list: [
          "taɣult-nnes: stress, iḍes, tiẓdiwin, asemres, aneggar…",
          "tutlayt-nnes: tin s ttsawaled s tlelli",
          "tarrayt: s tvidyut zeg uxxam, niɣ tadwart yeqqarben",
        ],
      },
      "Tebɣid ad k-nesnemmel? Err ɣef kra n isteqsiyen, ad ak-nesumer imaɣnuten yemsasan.",
    ],
    cta: "Snemmel-iyi",
  },
  {
    subject: "Tangalt-nnek mazal tella",
    preheader: "Tagi d tabrat taneggarut; tawwart teqqim teldi.",
    eyebrow: "Mani teqqard",
    title: "Awi lweqt i k-yesra",
    body: [
      "Asuter n tallalt yettili s urkuḍ-nnek. Tangalt-nnek WELCOME20 teqqim tella i tiɣimit-nnek tamezwarut, mani tqerrared.",
      "Tagi d tabrat taneggarut di tesselselt-a.",
      { safety: true },
    ],
    cta: "Ẓer imusnawen",
  },
];

const copy: Record<Lang, EmailCopy[]> = { fr, en, ar, ary, zgh, rif };

export const FREE_SCORE: SequenceDef = {
  id: "free_score",
  convertedIf: (f) => !!f.booked,
  steps: [
    // Sent 5 minutes after a WELCOME20 request, an hour after a score.
    { delayHours: 1, path: "/psychologists" },
    { delayHours: 48, path: "/free-score" },
    { delayHours: 72, path: "/psychologists" },
    { delayHours: 120, path: "/get-matched" },
    { delayHours: 264, path: "/psychologists" },
  ],
  copy,
};
