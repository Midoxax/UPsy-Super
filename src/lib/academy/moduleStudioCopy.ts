import { useLocale } from "@/contexts/LocaleContext";

const fr = {
  titleFr: "Titre (français)",
  contentFr: "Contenu (français, Markdown)",
  contentEn: "Contenu (anglais, Markdown)",
  recording: "Enregistrement d'un cours en direct",
  noRecording: "Aucun enregistrement",
  draft: "Rédiger avec l'IA",
  drafting: "Rédaction en cours… (jusqu'à 2 minutes)",
  notes:
    "Vos notes sur ce qui a été enseigné (facultatif, améliore beaucoup le résultat)",
  drafted:
    "Brouillon inséré. Relisez-le, complétez les passages [À compléter] puis enregistrez.",
  review: "À vérifier avant publication",
  fromSeries: "Créer un cours depuis une série",
  pickSeries: "Choisir une série",
  create: "Créer",
  created: "Cours créé en brouillon : une leçon par enregistrement.",
  alreadyLinked: "déjà liée à un cours",
};

type Copy = { [K in keyof typeof fr]: string };

const en: Copy = {
  titleFr: "Title (French)",
  contentFr: "Content (French, Markdown)",
  contentEn: "Content (English, Markdown)",
  recording: "Live class recording",
  noRecording: "No recording",
  draft: "Draft with AI",
  drafting: "Drafting… (up to 2 minutes)",
  notes: "Your notes on what was taught (optional, improves the result a lot)",
  drafted:
    "Draft inserted. Review it, fill in the [To complete] parts, then save.",
  review: "Check before publishing",
  fromSeries: "Create a course from a series",
  pickSeries: "Choose a series",
  create: "Create",
  created: "Draft course created: one lesson per recording.",
  alreadyLinked: "already linked to a course",
};

const ar: Copy = {
  titleFr: "العنوان (بالفرنسية)",
  contentFr: "المحتوى (بالفرنسية، Markdown)",
  contentEn: "المحتوى (بالإنجليزية، Markdown)",
  recording: "تسجيل درس مباشر",
  noRecording: "بدون تسجيل",
  draft: "صياغة بالذكاء الاصطناعي",
  drafting: "جارٍ الصياغة… (حتى دقيقتين)",
  notes: "ملاحظاتك حول ما تم تدريسه (اختياري، يحسّن النتيجة كثيرًا)",
  drafted: "تم إدراج المسودة. راجعها وأكمل الأجزاء الناقصة ثم احفظ.",
  review: "للمراجعة قبل النشر",
  fromSeries: "إنشاء دورة من سلسلة",
  pickSeries: "اختر سلسلة",
  create: "إنشاء",
  created: "تم إنشاء دورة كمسودة: درس لكل تسجيل.",
  alreadyLinked: "مرتبطة بدورة مسبقًا",
};

export function useModuleStudioCopy() {
  const { locale } = useLocale();
  return locale === "ar" ? ar : locale === "en" ? en : fr;
}
