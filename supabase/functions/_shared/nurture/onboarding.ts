import type { EmailCopy, Lang, SequenceDef } from "./types.ts";

/**
 * Onboarding: psychologists whose U.Psy account has just been created
 * (accreditation approved). Goal: a complete profile, open slots, first
 * bookings. Steps about something already done are skipped.
 */

const fr: EmailCopy[] = [
  {
    subject: "Bienvenue sur U.Psy",
    preheader:
      "Quatre réglages pour être visible des patients dès cette semaine.",
    eyebrow: "Bienvenue",
    title: "Votre espace est prêt",
    body: [
      "Bienvenue dans le réseau. Votre compte est actif ; voici les quatre réglages qui comptent le plus pour être trouvé(e) :",
      {
        list: [
          "une photo professionnelle",
          "une présentation d'au moins 200 caractères : votre approche, vos publics",
          "votre tarif par séance",
          "vos créneaux de disponibilité",
        ],
      },
      "Comptez dix minutes, depuis votre tableau de bord.",
    ],
    cta: "Ouvrir mon tableau de bord",
  },
  {
    subject: "Ouvrez vos premiers créneaux",
    preheader: "Sans créneau, les patients ne peuvent pas réserver.",
    eyebrow: "Disponibilités",
    title: "Les patients réservent sur vos créneaux",
    body: [
      "Vous n'avez pas encore de créneau ouvert. Indiquez vos jours et heures habituels : les patients réservent directement, vous recevez la confirmation et le rappel, et la visio est prête au moment de la séance.",
      "Un profil avec des disponibilités proches apparaît aussi plus haut dans les résultats.",
    ],
    cta: "Ajouter mes créneaux",
  },
  {
    subject: "Votre profil, vu par les patients",
    preheader:
      "Photo, présentation, tarif : ce que les patients regardent d'abord.",
    eyebrow: "Visibilité",
    title: "Ce que les patients regardent d'abord",
    body: [
      "Votre profil n'est pas encore complet. Les patients choisissent souvent en quelques secondes, sur trois éléments : la photo, les premières lignes de la présentation et le tarif.",
      {
        note: "Écrivez pour un patient, pas pour un jury : ce que vous l'aidez à traverser, et comment se passe une première séance avec vous.",
      },
    ],
    cta: "Compléter mon profil",
  },
  {
    subject: "Vos outils cliniques sur U.Psy",
    preheader: "Échelles validées, dossiers, notes chiffrées, et la LSSPM.",
    eyebrow: "Outils",
    title: "Plus qu'un agenda",
    body: [
      "U.Psy vous accompagne aussi pendant le suivi :",
      {
        list: [
          "des échelles validées à envoyer à vos patients, avec le score calculé",
          "un dossier par patient et des notes chiffrées, conformes à la loi 09-08",
          "les rappels de séance et la visio intégrée",
        ],
      },
      "Et si vous n'êtes pas encore membre, la LSSPM vous ouvre la supervision, la formation continue et 3 mois sans commission U.Psy, depuis votre tableau de bord.",
    ],
    cta: "Découvrir mes outils",
  },
  {
    subject: "Trois semaines sur U.Psy : votre avis ?",
    preheader: "Ce qui marche, ce qui manque : dites-le-nous.",
    eyebrow: "Votre avis",
    title: "Comment ça se passe pour vous ?",
    body: [
      "Vous êtes sur U.Psy depuis trois semaines. Ce qui vous facilite la vie, ce qui manque, ce qui vous agace : votre retour oriente directement ce que nous construisons.",
      "Écrivez-nous à contact@upsy.ma ; nous lisons chaque message.",
    ],
    cta: "Ouvrir mon tableau de bord",
  },
];

const en: EmailCopy[] = [
  {
    subject: "Welcome to U.Psy",
    preheader: "Four settings to be visible to patients this week.",
    eyebrow: "Welcome",
    title: "Your space is ready",
    body: [
      "Welcome to the network. Your account is active; these are the four settings that matter most for patients to find you:",
      {
        list: [
          "a professional photo",
          "an introduction of at least 200 characters: your approach, who you work with",
          "your rate per session",
          "your available slots",
        ],
      },
      "It takes about ten minutes, from your dashboard.",
    ],
    cta: "Open my dashboard",
  },
  {
    subject: "Open your first slots",
    preheader: "Without slots, patients cannot book.",
    eyebrow: "Availability",
    title: "Patients book on your slots",
    body: [
      "You have no open slots yet. Add your usual days and hours: patients book directly, you receive the confirmation and the reminder, and the video room is ready at session time.",
      "A profile with availability soon also appears higher in the results.",
    ],
    cta: "Add my slots",
  },
  {
    subject: "Your profile, as patients see it",
    preheader: "Photo, introduction, rate: what patients look at first.",
    eyebrow: "Visibility",
    title: "What patients look at first",
    body: [
      "Your profile is not complete yet. Patients often choose in a few seconds, on three things: the photo, the first lines of the introduction and the rate.",
      {
        note: "Write for a patient, not a jury: what you help them through, and how a first session with you goes.",
      },
    ],
    cta: "Complete my profile",
  },
  {
    subject: "Your clinical tools on U.Psy",
    preheader: "Validated scales, records, encrypted notes, and the LSSPM.",
    eyebrow: "Tools",
    title: "More than a calendar",
    body: [
      "U.Psy also supports you during follow-up:",
      {
        list: [
          "validated scales to send your patients, with the score calculated",
          "one record per patient and encrypted notes, compliant with Law 09-08",
          "session reminders and built-in video",
        ],
      },
      "And if you are not a member yet, the LSSPM opens supervision, continuing education and 3 months without U.Psy commission, from your dashboard.",
    ],
    cta: "Discover my tools",
  },
  {
    subject: "Three weeks on U.Psy: your view?",
    preheader: "What works, what is missing: tell us.",
    eyebrow: "Your view",
    title: "How is it going for you?",
    body: [
      "You have been on U.Psy for three weeks. What makes your life easier, what is missing, what annoys you: your feedback directly shapes what we build.",
      "Write to contact@upsy.ma; we read every message.",
    ],
    cta: "Open my dashboard",
  },
];

const ar: EmailCopy[] = [
  {
    subject: "مرحبًا بك في U.Psy",
    preheader: "أربعة إعدادات لتظهر للمرضى ابتداءً من هذا الأسبوع.",
    eyebrow: "مرحبًا",
    title: "فضاؤك جاهز",
    body: [
      "مرحبًا بك في الشبكة. حسابك مُفعَّل؛ هذه الإعدادات الأربعة الأهم ليجدك المرضى:",
      {
        list: [
          "صورة مهنية",
          "تقديم لا يقل عن 200 حرف: مقاربتك والفئات التي تشتغل معها",
          "تعريفتك عن الحصة",
          "مواعيد توفرك",
        ],
      },
      "يستغرق الأمر نحو عشر دقائق، من لوحة التحكم.",
    ],
    cta: "افتح لوحة التحكم",
  },
  {
    subject: "افتح مواعيدك الأولى",
    preheader: "بدون مواعيد، لا يمكن للمرضى الحجز.",
    eyebrow: "التوفر",
    title: "المرضى يحجزون في مواعيدك",
    body: [
      "لم تفتح أي موعد بعد. أضف أيامك وساعاتك المعتادة: يحجز المرضى مباشرة، وتتوصل بالتأكيد والتذكير، وتكون غرفة الفيديو جاهزة وقت الحصة.",
      "الملف الذي يتوفر على مواعيد قريبة يظهر أيضًا في مرتبة أعلى في النتائج.",
    ],
    cta: "أضف مواعيدي",
  },
  {
    subject: "ملفك كما يراه المرضى",
    preheader: "الصورة والتقديم والتعريفة: ما ينظر إليه المرضى أولًا.",
    eyebrow: "الظهور",
    title: "ما ينظر إليه المرضى أولًا",
    body: [
      "ملفك لم يكتمل بعد. غالبًا ما يختار المرضى في ثوانٍ، بناءً على ثلاثة عناصر: الصورة، والأسطر الأولى من التقديم، والتعريفة.",
      {
        note: "اكتب لمريض لا للجنة: ما الذي تساعده على تجاوزه، وكيف تجري الجلسة الأولى معك.",
      },
    ],
    cta: "أكمل ملفي",
  },
  {
    subject: "أدواتك السريرية على U.Psy",
    preheader: "مقاييس مُعتمدة، ملفات، ملاحظات مشفَّرة، وLSSPM.",
    eyebrow: "الأدوات",
    title: "أكثر من مجرد أجندة",
    body: [
      "يرافقك U.Psy أيضًا خلال المتابعة:",
      {
        list: [
          "مقاييس مُعتمدة ترسلها لمرضاك، مع حساب النتيجة",
          "ملف لكل مريض وملاحظات مشفَّرة، طبقًا للقانون 09-08",
          "تذكيرات الحصص والفيديو المدمج",
        ],
      },
      "وإن لم تكن عضوًا بعد، تفتح لك LSSPM الإشراف والتكوين المستمر و3 أشهر بدون عمولة U.Psy، من لوحة التحكم.",
    ],
    cta: "اكتشف أدواتي",
  },
  {
    subject: "ثلاثة أسابيع على U.Psy: ما رأيك؟",
    preheader: "ما ينجح وما ينقص: أخبرنا.",
    eyebrow: "رأيك",
    title: "كيف تسير الأمور معك؟",
    body: [
      "مرت ثلاثة أسابيع على وجودك في U.Psy. ما يسهّل عملك، وما ينقص، وما يزعجك: ملاحظاتك توجّه مباشرة ما نبنيه.",
      "راسلنا على contact@upsy.ma، نقرأ كل رسالة.",
    ],
    cta: "افتح لوحة التحكم",
  },
];

const ary: EmailCopy[] = [
  {
    subject: "مرحبا بيك فـ U.Psy",
    preheader: "ربعة ديال الإعدادات باش يبانو ليك المرضى من هاد السيمانة.",
    eyebrow: "مرحبا",
    title: "الفضاء ديالك واجد",
    body: [
      "مرحبا بيك فالشبكة. الحساب ديالك خدام؛ هادو هوما الربعة ديال الحوايج اللي مهمين بزاف باش يلقاوك المرضى:",
      {
        list: [
          "تصويرة مهنية",
          "تقديم ديال 200 حرف على الأقل: الطريقة ديالك والناس اللي كتخدم معاهم",
          "الثمن ديال الحصة",
          "الأوقات اللي كتكون فيها متوفر",
        ],
      },
      "كتاخد شي عشر دقايق، من لوحة التحكم ديالك.",
    ],
    cta: "حل لوحة التحكم ديالي",
  },
  {
    subject: "حل أول المواعيد ديالك",
    preheader: "بلا مواعيد، المرضى ما يقدروش يحجزو.",
    eyebrow: "التوفر",
    title: "المرضى كيحجزو فالمواعيد ديالك",
    body: [
      "مازال ما حليتي حتى موعد. زيد الأيام والساعات اللي متعود عليهم: المرضى كيحجزو نيشان، كتوصل بالتأكيد والتذكير، والفيديو كيكون واجد فوقت الحصة.",
      "البروفايل اللي فيه مواعيد قريبة كيطلع حتى هو لفوق فالنتائج.",
    ],
    cta: "زيد المواعيد ديالي",
  },
  {
    subject: "البروفايل ديالك كيفما كيشوفوه المرضى",
    preheader: "التصويرة، التقديم، الثمن: شنو كيشوفو المرضى الأول.",
    eyebrow: "الظهور",
    title: "شنو كيشوفو المرضى الأول",
    body: [
      "البروفايل ديالك مازال ما كملش. المرضى بزاف ديال المرات كيختارو فشي ثواني، على تلت حوايج: التصويرة، أول سطور فالتقديم، والثمن.",
      {
        note: "كتب لمريض، ماشي للجنة: فاش كتعاونو يدوز، وكيفاش كتدوز أول حصة معاك.",
      },
    ],
    cta: "كمّل البروفايل ديالي",
  },
  {
    subject: "الأدوات السريرية ديالك فـ U.Psy",
    preheader: "مقاييس معتمدة، ملفات، ملاحظات مشفرة، وLSSPM.",
    eyebrow: "الأدوات",
    title: "كثر من أجندة",
    body: [
      "U.Psy كيعاونك حتى فالمتابعة:",
      {
        list: [
          "مقاييس معتمدة تصيفطها للمرضى ديالك، والنتيجة كتحسب بوحدها",
          "ملف لكل مريض وملاحظات مشفرة، حسب القانون 09-08",
          "التذكيرات ديال الحصص والفيديو مدمج",
        ],
      },
      "وإلا مازال ما عضوش، LSSPM كتحل ليك الإشراف، التكوين المستمر و3 شهور بلا كوميسيون ديال U.Psy، من لوحة التحكم ديالك.",
    ],
    cta: "كتاشف الأدوات ديالي",
  },
  {
    subject: "تلت سيمانات فـ U.Psy: شنو رأيك؟",
    preheader: "شنو خدام، شنو ناقص: قولها لينا.",
    eyebrow: "الرأي ديالك",
    title: "كيداير معاك الحال؟",
    body: [
      "عندك تلت سيمانات فـ U.Psy. شنو كيسهل عليك، شنو ناقص، شنو كيقلقك: الرأي ديالك كيوجه نيشان شنو كنبنيو.",
      "كتب لينا فـ contact@upsy.ma؛ كنقراو كل رسالة.",
    ],
    cta: "حل لوحة التحكم ديالي",
  },
];

const zgh: EmailCopy[] = [
  {
    subject: "ⴰⵏⵙⵓⴼ ⵢⵉⵙⴽ ⴳ U.Psy",
    preheader: "ⴽⴽⵓⵥ ⵏ ⵜⵙⵖⵓⵍⵜⵉⵏ ⴰⴷ ⴽ ⵥⵕⴰⵏ ⵉⵎⵓⴹⴰⵏ ⴳ ⵉⵎⴰⵍⴰⵙ ⴰⴷ.",
    eyebrow: "ⴰⵏⵙⵓⴼ",
    title: "ⵜⴰⵙⵏⴰ ⵏⵏⴽ ⵜⵡⵊⴷ",
    body: [
      "ⴰⵏⵙⵓⴼ ⵢⵉⵙⴽ ⴳ ⵓⵥⵟⵟⴰ. ⴰⵎⵉⴹⴰⵏ ⵏⵏⴽ ⵉⵙⵙⵓⵖⵍ; ⵜⴰⴷ ⴰⴷ ⴰⵢ ⴳⴰⵏ ⴽⴽⵓⵥ ⵏ ⵜⵖⴰⵡⵙⵉⵡⵉⵏ ⵢⴰⴽⴽⵯ ⵢⵓⴳⵔⵏ ⴰⴷ ⴽ ⴰⴼⵏ ⵉⵎⵓⴹⴰⵏ:",
      {
        list: [
          "ⵜⴰⵡⵍⴰⴼⵜ ⵜⴰⵎⵙⵡⵓⵔⵉⵜ",
          "ⴰⵙⵙⵓⴷⵓ ⵏ 200 ⵏ ⵜⵙⴽⴽⵉⵡⵉⵏ ⵓⵍⴰ: ⵜⴰⵖⴰⵔⴰⵙⵜ ⵏⵏⴽ, ⵡⵉⵏⵏⴰ ⴷ ⵎⵉ ⵜⵙⵡⵓⵔⵉⴷ",
          "ⴰⵜⵉⴳ ⵏ ⵜⵉⵣⵉⵡⵉ",
          "ⵉⴽⵓⴷⴰⵏ ⵏ ⵜⵉⵍⵍⵉ ⵏⵏⴽ",
        ],
      },
      "ⵉⵜⵜⴰⵡⵉ ⵎⴰⵙ ⵎⵔⴰⵡ ⵏ ⵜⵓⵙⴷⵉⴷⵉⵏ, ⵙⴳ ⵜⴼⵍⵡⵉⵜ ⵏ ⵓⵙⵡⵓⵔⵉ ⵏⵏⴽ.",
    ],
    cta: "ⵕⵥⵎ ⵜⴰⴼⵍⵡⵉⵜ ⵉⵏⵓ",
  },
  {
    subject: "ⵕⵥⵎ ⵉⴽⵓⴷⴰⵏ ⵏⵏⴽ ⵉⵎⵣⵡⵓⵔⴰ",
    preheader: "ⴱⵍⴰ ⵉⴽⵓⴷⴰⵏ, ⵉⵎⵓⴹⴰⵏ ⵓⵔ ⵣⵎⵔⵏ ⴰⴷ ⵙⵙⴰⵖⵏ.",
    eyebrow: "ⵜⵉⵍⵍⵉ",
    title: "ⵉⵎⵓⴹⴰⵏ ⴰⵔ ⵙⵙⴰⵖⵏ ⴳ ⵉⴽⵓⴷⴰⵏ ⵏⵏⴽ",
    body: [
      "ⵓⵔⴰ ⵜⵕⵥⵎⴷ ⴽⵔⴰ ⵏ ⵓⴽⵓⴷ. ⵔⵏⵓ ⵓⵙⵙⴰⵏ ⴷ ⵜⵙⵔⴰⴳⵉⵏ ⵏⵏⴽ: ⵉⵎⵓⴹⴰⵏ ⴰⵔ ⵙⵙⴰⵖⵏ ⵙ ⵜⵡⵔⴰ, ⴰⵔ ⴷ ⴰⴽ ⵜⵜⴰⵙⵏ ⵓⵙⵏⵇⴷ ⴷ ⵓⵙⵎⵜⵜⵉ, ⵜⴰⴼⵉⴷⵢⵓⵜ ⵜⵡⵊⴷ ⴳ ⵓⴽⵓⴷ ⵏ ⵜⵉⵣⵉⵡⵉ.",
      "ⴰⵎⴰⵖⵏⵓ ⵖⵓⵔ ⵍⵍⴰⵏ ⵉⴽⵓⴷⴰⵏ ⵉⵇⵔⴱⵏ ⵉⵜⵜⵍⵍⵉ ⵙ ⵓⴼⵍⵍⴰ ⴳ ⵜⵢⴰⴼⵓⵜⵉⵏ.",
    ],
    cta: "ⵔⵏⵓ ⵉⴽⵓⴷⴰⵏ ⵉⵏⵓ",
  },
  {
    subject: "ⴰⵎⴰⵖⵏⵓ ⵏⵏⴽ, ⵎⴰⵎⴽ ⵜ ⵥⵕⴰⵏ ⵉⵎⵓⴹⴰⵏ",
    preheader: "ⵜⴰⵡⵍⴰⴼⵜ, ⴰⵙⵙⵓⴷⵓ, ⴰⵜⵉⴳ: ⵎⴰⴷ ⵥⵕⴰⵏ ⵉⵎⵓⴹⴰⵏ ⴷ ⵉⵣⵡⴰⵔⵏ.",
    eyebrow: "ⵜⴰⵏⴰⴼⵓⵜ",
    title: "ⵎⴰⴷ ⵥⵕⴰⵏ ⵉⵎⵓⴹⴰⵏ ⴷ ⵉⵣⵡⴰⵔⵏ",
    body: [
      "ⴰⵎⴰⵖⵏⵓ ⵏⵏⴽ ⵓⵔⴰ ⵉⵎⴷⵉ. ⵉⵎⵓⴹⴰⵏ ⵙⵜⴰⵢⵏ ⵙ ⵜⵓⵜⵜⵓⵔⵜ ⴳ ⴽⵔⴰ ⵏ ⵜⵙⵉⵏⵜⵉⵏ, ⵅⴼ ⴽⵔⴰⴹ ⵏ ⵜⵖⴰⵡⵙⵉⵡⵉⵏ: ⵜⴰⵡⵍⴰⴼⵜ, ⵉⵣⵔⵉⵔⵉⴳⵏ ⵉⵎⵣⵡⵓⵔⴰ ⵏ ⵓⵙⵙⵓⴷⵓ, ⴷ ⵓⵜⵉⴳ.",
      {
        note: "ⴰⵔⵓ ⵉ ⵓⵎⵓⴹⵉ, ⵓⵔ ⵜⴰⵔⴰ ⵉ ⵓⵙⵇⵇⵉⵎ: ⵎⴰⴷ ⵜⵜⴰⵡⵙⴷ ⴰⴷ ⵜ ⵉⵣⵔⵉ, ⴷ ⵎⴰⵎⴽ ⵜⵜⵉⵍⵉ ⵜⵉⵣⵉⵡⵉ ⵜⴰⵎⵣⵡⴰⵔⵓⵜ ⴷⵉⴽ.",
      },
    ],
    cta: "ⵙⵎⴷ ⴰⵎⴰⵖⵏⵓ ⵉⵏⵓ",
  },
  {
    subject: "ⵉⵎⴰⵙⵙⵏ ⵏⵏⴽ ⵉⴽⵍⵉⵏⵉⴽⵉⵢⵏ ⴳ U.Psy",
    preheader: "ⵜⵉⵙⵓⵔⵉⵡⵉⵏ ⵉⵜⵜⵓⵙⵏⵇⴷⵏ, ⵉⵙⴷⴰⵡⵏ, ⵜⵉⵏⵣⵉⵖⵉⵏ ⵉⵜⵜⵓⵔⴳⵍⵏ, ⴷ LSSPM.",
    eyebrow: "ⵉⵎⴰⵙⵙⵏ",
    title: "ⵓⴳⴳⴰⵔ ⵏ ⵢⴰⵜ ⵜⴰⴷⵍⵉⵙⵜ ⵏ ⵉⴽⵓⴷⴰⵏ",
    body: [
      "U.Psy ⵉⵜⵜⴰⵡⵙ ⴽ ⴰⵡⴷ ⴳ ⵓⴹⴼⴰⵕ:",
      {
        list: [
          "ⵜⵉⵙⵓⵔⵉⵡⵉⵏ ⵉⵜⵜⵓⵙⵏⵇⴷⵏ ⴰⴷ ⵜⵏⵜ ⵜⴰⵣⵏⴷ ⵉ ⵉⵎⵓⴹⴰⵏ ⵏⵏⴽ, ⵙ ⵓⵙⵙⵉⴹⵏ ⵏ ⵜⵢⴰⴼⵓⵜ",
          "ⵢⴰⵏ ⵓⵙⴷⴰⵡ ⵉ ⴽⵓ ⴰⵎⵓⴹⵉ ⴷ ⵜⵏⵣⵉⵖⵉⵏ ⵉⵜⵜⵓⵔⴳⵍⵏ, ⵙ ⵓⵙⵍⵖⵓ 09-08",
          "ⵉⵙⵎⵜⵜⵉⵜⵏ ⵏ ⵜⵉⵣⵉⵡⵉⵏ ⴷ ⵜⴼⵉⴷⵢⵓⵜ ⵉⵍⵍⴰⵏ ⴳⵉⵙ",
        ],
      },
      "ⵎⴽ ⵓⵔⴰ ⵜⴳⵉⴷ ⴰⵎⴷⵔⴰⵡ, LSSPM ⵜⵕⵥⵎ ⴰⴽ ⴰⵙⵎⵓⵜⵜⴳ, ⴰⵙⵍⵎⴷ ⵉⵎⵓⵏ ⴷ 3 ⵏ ⵡⴰⵢⵢⵓⵔⵏ ⴱⵍⴰ ⵜⴰⵡⵙⵉⵡⵜ ⵏ U.Psy, ⵙⴳ ⵜⴼⵍⵡⵉⵜ ⵏⵏⴽ.",
    ],
    cta: "ⵙⵙⵏ ⵉⵎⴰⵙⵙⵏ ⵉⵏⵓ",
  },
  {
    subject: "ⴽⵔⴰⴹ ⵉⵎⴰⵍⴰⵙⵏ ⴳ U.Psy: ⵎⴰ ⵜⵏⵏⵉⴷ?",
    preheader: "ⵎⴰⴷ ⵉⵙⵙⵓⵖⵍⵏ, ⵎⴰⴷ ⵉⵅⵚⵚⴰⵏ: ⵉⵏⵉ ⴰⵖ.",
    eyebrow: "ⵜⴰⵏⵏⴰⵢⵜ ⵏⵏⴽ",
    title: "ⵎⴰⵎⴽ ⵜⵍⵍⵉⴷ?",
    body: [
      "ⵜⵍⵍⵉⴷ ⴳ U.Psy ⵙⴳ ⴽⵔⴰⴹ ⵉⵎⴰⵍⴰⵙⵏ. ⵎⴰⴷ ⴰⴽ ⵉⵙⵙⵉⵔⵉⵏ ⵜⵓⴷⵔⵜ, ⵎⴰⴷ ⵉⵅⵚⵚⴰⵏ, ⵎⴰⴷ ⴽ ⵉⵙⵙⴰⵡⵍⵏ: ⵜⴰⵏⵏⴰⵢⵜ ⵏⵏⴽ ⵜⵙⵏⵎⴰⵍ ⵙ ⵜⵡⵔⴰ ⵎⴰⴷ ⵏⵜⵜⴱⵏⵓ.",
      "ⴰⵔⵓ ⴰⵖ ⵖⵔ contact@upsy.ma; ⵏⵜⵜⵖⵔⴰ ⴽⵓ ⵜⴰⴱⵔⴰⵜ.",
    ],
    cta: "ⵕⵥⵎ ⵜⴰⴼⵍⵡⵉⵜ ⵉⵏⵓ",
  },
];

const rif: EmailCopy[] = [
  {
    subject: "Ansuf yisek di U.Psy",
    preheader: "Kkuẓ n tseɣlin ad k-ẓren imuḍan zi dduṛt-a.",
    eyebrow: "Ansuf",
    title: "Tasna-nnek tewjed",
    body: [
      "Ansuf yisek deg uẓeṭṭa. Amiḍan-nnek yexdem; tigi d kkuẓ n tɣawsiwin yesɛan azal aṭṭas ad k-afen imuḍan:",
      {
        list: [
          "yiğet n tewlaft n uxeddem",
          "asissen n 200 n isekkilen ula: tarrayt-nnek, wid ak d mi txeddmed",
          "ssuma n tɣimit",
          "lweqt n mani telid",
        ],
      },
      "Ad yawi xas mraw n tusdidin, zi tfelwit-nnek.",
    ],
    cta: "Ldi tafelwit-inu",
  },
  {
    subject: "Ldi timlilin-nnek timezwura",
    preheader: "Bla timlilin, imuḍan war zemmren ad ḥeǧzen.",
    eyebrow: "Lweqt",
    title: "Imuḍan ttḥeǧzen di timlilin-nnek",
    body: [
      "Mazal war telid ḥetta yiğet n tmlilit. Rnu ussan d tsaɛin-nnek: imuḍan ttḥeǧzen srid, ad ak-d-yaweḍ usenqed d usemktay, tavidyut tewjed di lweqt n tɣimit.",
      "Amaɣnu ɣer i llant timlilin yeqqarben yettili ula netta ɣer usawen di tyafutin.",
    ],
    cta: "Rnu timlilin-inu",
  },
  {
    subject: "Amaɣnu-nnek, amek t-ẓren imuḍan",
    preheader: "Tawlaft, asissen, ssuma: mayen ẓren imuḍan d imezwura.",
    eyebrow: "Tanafut",
    title: "Mayen ẓren imuḍan d imezwura",
    body: [
      "Amaɣnu-nnek mazal war yekmil. Imuḍan ttxtaren s waṭṭas di kra n tsinin, ɣef kraḍ n tɣawsiwin: tawlaft, izriragen imezwura n usissen, d ssuma.",
      {
        note: "Ari i umuḍin, mači i unebdu: mayen tettɛawaned ad yezri, d mamek tettili tɣimit tamezwarut ak d cek.",
      },
    ],
    cta: "Kemmel amaɣnu-inu",
  },
  {
    subject: "Imassen-nnek ikliniken di U.Psy",
    preheader:
      "Tisuriwin yettwasenqden, idusiyen, tinzaɣin yettwaqqnen, d LSSPM.",
    eyebrow: "Imassen",
    title: "Uggar n yiğet n tedlist",
    body: [
      "U.Psy yettɛawan-ak ula di uḍfar:",
      {
        list: [
          "tisuriwin yettwasenqden ad tent-tuceyyɛed i imuḍan-nnek, s uḥsab n tyafut",
          "yiğ n udusi i kul amuḍin d tinzaɣin yettwaqqnen, s uzref 09-08",
          "isemktayen n tɣimiwin d tavidyut deg-s",
        ],
      },
      "Max mazal war telid d amedrus, LSSPM tettelli-yak asefrek, aselmed yettkemmilen d 3 n yuren bla tawsiwt n U.Psy, zi tfelwit-nnek.",
    ],
    cta: "Ssen imassen-inu",
  },
  {
    subject: "Kraḍ n dduṛat di U.Psy: min tenniḍ?",
    preheader: "Mayen yexdmen, mayen yexṣan: ini-aɣ-t.",
    eyebrow: "Tannayt-nnek",
    title: "Mamek telid?",
    body: [
      "Telid di U.Psy zi kraḍ n dduṛat. Mayen ak-yessehlen ttawil, mayen yexṣan, mayen k-yesqelqen: tannayt-nnek tesnemmal srid mayen nettbennu.",
      "Ari-aɣ-d ɣer contact@upsy.ma; neqqar kul tabrat.",
    ],
    cta: "Ldi tafelwit-inu",
  },
];

const copy: Record<Lang, EmailCopy[]> = { fr, en, ar, ary, zgh, rif };

export const ONBOARDING: SequenceDef = {
  id: "onboarding",
  steps: [
    { delayHours: 1, path: "/dashboard/specialist" },
    { delayHours: 48, path: "/dashboard/specialist", skipIf: (f) => !!f.slots },
    {
      delayHours: 72,
      path: "/dashboard/specialist",
      skipIf: (f) => !!(f.photo && f.bio && f.rate),
    },
    { delayHours: 120, path: "/dashboard/specialist" },
    { delayHours: 264, path: "/dashboard/specialist" },
  ],
  copy,
};
