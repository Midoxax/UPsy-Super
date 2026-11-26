import type { Lang } from "./types.ts";

/** Lines every follow-up email shares, in each language. */
export interface Common {
  hello: (name: string | null) => string;
  signoff: string;
  team: string;
  teamLeague: string;
  /** Footer: why this email arrives. */
  why: string;
  /** Footer: the language links. */
  readIn: string;
  /** Help line: where to write. */
  questions: string;
  /** Page shown after choosing a language from an email. */
  langSaved: string;
  /** Shown in emails to the public. */
  safety: string;
  feesTitle: string;
  perYear: string;
  feesNote: string;
  /** Layout footer for languages the layout has no strings for. */
  footer?: {
    tagline: string;
    privacy: string;
    help: string;
    unsubscribe: string;
  };
}

export const COMMON: Record<Lang, Common> = {
  fr: {
    hello: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
    signoff: "À très vite,",
    team: "L'équipe U.Psy",
    teamLeague: "L'équipe U.Psy, avec la LSSPM",
    why: "Vous recevez cet e-mail parce que vous avez laissé vos coordonnées sur U.Psy et accepté d'être recontacté(e).",
    readIn: "Langue de ces e-mails :",
    questions:
      "Une question ? Écrivez-nous à contact@upsy.ma, une personne de l'équipe vous répond.",
    langSaved:
      "C'est noté : vos prochains e-mails U.Psy arriveront en français.",
    safety:
      "Si vous êtes en danger ou pensez à vous faire du mal, n'attendez pas : appelez le 141 (SAMU) ou le 15 (Protection civile).",
    feesTitle: "Cotisations annuelles",
    perYear: "MAD / an",
    feesNote:
      "Par année civile. Tarifs étudiants pour les moins de 30 ans, sur attestation d'inscription. Une adhésion validée à partir du 1er octobre est valable jusqu'au 31 décembre de l'année suivante.",
  },
  en: {
    hello: (n) => (n ? `Hello ${n},` : "Hello,"),
    signoff: "Speak soon,",
    team: "The U.Psy team",
    teamLeague: "The U.Psy team, with the LSSPM",
    why: "You are receiving this email because you left your details on U.Psy and agreed to be contacted.",
    readIn: "Language of these emails:",
    questions:
      "A question? Write to contact@upsy.ma and someone from the team will answer.",
    langSaved: "Done: your next U.Psy emails will arrive in English.",
    safety:
      "If you are in danger or thinking of harming yourself, do not wait: call 141 (SAMU) or 15 (Civil Protection).",
    feesTitle: "Annual fees",
    perYear: "MAD / year",
    feesNote:
      "Per calendar year. Student rates for under-30s, with proof of enrolment. A membership confirmed from 1 October runs until 31 December of the following year.",
  },
  ar: {
    hello: (n) => (n ? `مرحبًا ${n}،` : "مرحبًا،"),
    signoff: "إلى اللقاء قريبًا،",
    team: "فريق U.Psy",
    teamLeague: "فريق U.Psy، بالتعاون مع LSSPM",
    why: "تصلك هذه الرسالة لأنك تركت معلوماتك على U.Psy ووافقت على أن نتواصل معك.",
    readIn: "لغة هذه الرسائل:",
    questions:
      "لديك سؤال؟ راسلنا على contact@upsy.ma وسيجيبك أحد أعضاء الفريق.",
    langSaved: "تم: ستصلك رسائل U.Psy القادمة بالعربية.",
    safety:
      "إذا كنت في خطر أو تفكر في إيذاء نفسك، لا تنتظر: اتصل بالرقم 141 (الإسعاف) أو 15 (الوقاية المدنية).",
    feesTitle: "واجبات الانخراط السنوية",
    perYear: "درهم / سنة",
    feesNote:
      "حسب السنة الميلادية. تعريفة الطلبة لمن هم دون 30 سنة، بشهادة التسجيل. الانخراط المصادق عليه ابتداءً من فاتح أكتوبر صالح إلى 31 دجنبر من السنة الموالية.",
  },
  ary: {
    hello: (n) => (n ? `السلام ${n}،` : "السلام،"),
    signoff: "نتشاوفو قريب،",
    team: "فريق U.Psy",
    teamLeague: "فريق U.Psy، مع LSSPM",
    why: "كتوصلك هاد الرسالة حيت خليتي المعلومات ديالك فـ U.Psy وقبلتي نتواصلو معاك.",
    readIn: "اللغة ديال هاد الرسائل:",
    questions:
      "عندك شي سؤال؟ كتب لينا فـ contact@upsy.ma وغادي يجاوبك واحد من الفريق.",
    langSaved: "تسجلات: الرسائل الجاية ديال U.Psy غادي توصلك بالدارجة.",
    safety:
      "إلا كنتي فخطر ولا كتفكر تأذي راسك، ما تسناش: عيط لـ 141 (الإسعاف) ولا 15 (الوقاية المدنية).",
    feesTitle: "واجب الانخراط فالعام",
    perYear: "درهم / العام",
    feesNote:
      "على حساب العام الميلادي. ثمن الطلبة للي عندهم أقل من 30 عام، بشهادة التسجيل. الانخراط اللي تقبل من فاتح أكتوبر كيبقى صالح حتى 31 دجنبر ديال العام الجاي.",
    footer: {
      tagline: "أخصائيين نفسانيين وتحضير ذهني فالمغرب",
      privacy: "الخصوصية",
      help: "المساعدة",
      unsubscribe: "حبس هاد الرسائل",
    },
  },
  zgh: {
    hello: (n) => (n ? `ⴰⵣⵓⵍ ${n},` : "ⴰⵣⵓⵍ,"),
    signoff: "ⴰⵔ ⵜⵉⴼⴰⵡⵜ,",
    team: "ⵜⴰⵔⴰⴱⴱⵓⵜ ⵏ U.Psy",
    teamLeague: "ⵜⴰⵔⴰⴱⴱⵓⵜ ⵏ U.Psy, ⴷ LSSPM",
    why: "ⵜⵓⵙⵉⴷ ⴽ ⵜⴱⵔⴰⵜ ⴰⴷ ⴰⵛⴽⵓ ⵜⴼⴽⵉⴷ ⵉⵙⴰⵍⵍⵏ ⵏⵏⴽ ⴳ U.Psy ⵜⵔⴹⵉⴷ ⴰⴷ ⴽ ⵏⴰⵡⵙ.",
    readIn: "ⵜⵓⵜⵍⴰⵢⵜ ⵏ ⵜⴱⵔⴰⵜⵉⵏ ⴰⴷ:",
    questions:
      "ⵜⵍⵍⴰ ⵖⵓⵔⴽ ⵜⵓⵜⵜⵔⴰ? ⴰⵔⵓ ⴰⵖ ⵖⵔ contact@upsy.ma, ⴰⴷ ⴰⴽ ⵢⵔⴰⵔ ⵢⴰⵏ ⵙⴳ ⵜⵔⴰⴱⴱⵓⵜ.",
    langSaved: "ⵜⵜⵓⵣⵎⵎⴻⵎ: ⵜⵉⴱⵔⴰⵜⵉⵏ ⵏ U.Psy ⵉ ⴷ ⵉⵜⵜⴰⵙⵏ ⴰⴷ ⴰⴽ ⴷ ⵍⴽⵎⵏⵜ ⵙ ⵜⵎⴰⵣⵉⵖⵜ.",
    safety:
      "ⵎⴽ ⵜⵍⵍⵉⴷ ⴳ ⵓⵙⵍⵉⴼ ⵏⵖ ⵜⵙⵙⵏⵜⴰⴷ ⴰⴷ ⵜⵙⵙⵓⵔⵎⴷ ⵉⵅⴼ ⵏⵏⴽ, ⵓⵔ ⵜⵔⴰⵊⵓⴷ: ⵖⵔ ⵖⵔ 141 (SAMU) ⵏⵖ 15 (Protection civile).",
    feesTitle: "ⵜⴰⵡⵙⵉⵡⵉⵏ ⵏ ⵓⵙⴳⴳⵯⴰⵙ",
    perYear: "MAD / ⴰⵙⴳⴳⵯⴰⵙ",
    feesNote:
      "ⵙ ⵓⵙⴳⴳⵯⴰⵙ ⴰⵎⴰⴹⵍⴰⵏ. ⴰⵜⵉⴳ ⵏ ⵉⵏⵍⵎⴰⴷⵏ ⵉ ⵡⵉⵏⵏⴰ ⵉⴷⴷⵔⵏ ⴷⴷⵓ 30 ⵏ ⵓⵙⴳⴳⵯⴰⵙ, ⵙ ⵜⴳⵓⵔⵉ ⵏ ⵓⵣⵎⵎⴻⵎ. ⴰⵙⵎⵓⵜⵜⴳ ⵉⵜⵜⵓⵙⵏⵇⴷⵏ ⵙⴳ 1 ⴽⵜⵓⴱⵔ ⵉⵍⴰ ⴰⵣⴰⵍ ⴰⵔ 31 ⴷⵓⵊⴰⵏⴱⵉⵔ ⵏ ⵓⵙⴳⴳⵯⴰⵙ ⴷ ⵢⵓⴷⴼⵏ.",
    footer: {
      tagline: "ⵜⴰⴷⴰⵡⵙⴰ ⵜⴰⵏⴼⵙⴰⵏⵜ ⴳ ⵍⵎⵖⵔⵉⴱ",
      privacy: "ⵜⵓⴷⵔⵜ ⵜⵓⵏⵏⵓⵖⴰⵏⵜ",
      help: "ⵜⴰⵡⵉⵙⵉ",
      unsubscribe: "ⵙⴱⴷⴷ ⵜⵉⴱⵔⴰⵜⵉⵏ ⴰⴷ",
    },
  },
  rif: {
    hello: (n) => (n ? `Azul ${n},` : "Azul,"),
    signoff: "Ar timlilit,",
    team: "Tarabbut n U.Psy",
    teamLeague: "Tarabbut n U.Psy, d LSSPM",
    why: "Tusid-ak tebrat-a minzi tejjid isallen-nnek di U.Psy, teqbed ad ak-d-nari.",
    readIn: "Tutlayt n tebratin-a:",
    questions:
      "Tesɛid kra n usteqsi? Ari-aɣ-d ɣer contact@upsy.ma, ad ak-d yerr yiğ zeg tarabbut.",
    langSaved: "Yettwaru: tibratin n U.Psy d-itasen ad ak-d-awḍent s Tarifit.",
    safety:
      "Max telid di lxaṭar niɣ tessxemmamed ad tesserwed ixef-nnek, war tettraju: ɛiyeḍ i 141 (SAMU) niɣ 15 (Protection civile).",
    feesTitle: "Tixeddimin n useggʷas",
    perYear: "MAD / aseggʷas",
    feesNote:
      "S useggʷas amaḍlan. Ssuma n inelmaden i wid yesɛan ddaw n 30 n iseggʷasen, s tagrut n ujerred. Ajerred yeqqblen zi 1 n Kṭuber yeqqim alamma 31 n Dujamber n useggʷas d-itasen.",
    footer: {
      tagline: "Tazmert n uqerru d tanfsit di Lmeɣrib",
      privacy: "Tabaḍnit",
      help: "Tallalt",
      unsubscribe: "Ḥbes tibratin-a",
    },
  },
};
