// Copy for the AI consent dialog and the specialist-side notice (EN/FR/AR).
export const AI_CONSENT_COPY = {
  en: {
    title: "Before you use AI features",
    intro:
      "Journal reflections, session summaries, specialist briefs and the AI assistant work by sending the text they need to an AI model.",
    points: [
      "What is sent: the text the feature needs, for example a journal entry, a message, or your specialist's notes about you.",
      "Where: to our AI provider in the United States. It processes the text to answer and does not use it to train its models.",
      "Your choice: U.Psy works fully without these features. You can withdraw this consent at any time in My data & privacy.",
    ],
    checkbox:
      "I agree that my data, including health information, is processed by an AI provider in the United States for these features.",
    privacy: "Read the privacy policy",
    agree: "I agree",
    cancel: "Not now",
    failed: "Could not save. Try again.",
  },
  fr: {
    title: "Avant d'utiliser les fonctions d'IA",
    intro:
      "Les réflexions du journal, les résumés de séance, les notes de préparation des spécialistes et l'assistant IA fonctionnent en envoyant le texte nécessaire à un modèle d'IA.",
    points: [
      "Ce qui est envoyé : le texte dont la fonction a besoin, par exemple une entrée de journal, un message ou les notes de ton spécialiste à ton sujet.",
      "Où : à notre fournisseur d'IA aux États-Unis. Il traite le texte pour répondre et ne l'utilise pas pour entraîner ses modèles.",
      "Ton choix : U.Psy fonctionne entièrement sans ces fonctions. Tu peux retirer ce consentement à tout moment dans Mes données et confidentialité.",
    ],
    checkbox:
      "J'accepte que mes données, y compris des informations de santé, soient traitées par un fournisseur d'IA aux États-Unis pour ces fonctions.",
    privacy: "Lire la politique de confidentialité",
    agree: "J'accepte",
    cancel: "Pas maintenant",
    failed: "Enregistrement impossible. Réessaie.",
  },
  ar: {
    title: "قبل استخدام ميزات الذكاء الاصطناعي",
    intro:
      "تعمل تأملات اليوميات وملخصات الجلسات وملاحظات التحضير للمختصين والمساعد الذكي بإرسال النص اللازم إلى نموذج ذكاء اصطناعي.",
    points: [
      "ما يُرسل: النص الذي تحتاجه الميزة، مثل تدوينة في اليوميات أو رسالة أو ملاحظات مختصك عنك.",
      "إلى أين: إلى مزوّد الذكاء الاصطناعي لدينا في الولايات المتحدة. يعالج النص للإجابة ولا يستخدمه لتدريب نماذجه.",
      "اختيارك: تعمل U.Psy بالكامل دون هذه الميزات. يمكنك سحب هذه الموافقة في أي وقت من صفحة بياناتي وخصوصيتي.",
    ],
    checkbox:
      "أوافق على معالجة بياناتي، بما فيها معلومات صحية، من طرف مزوّد ذكاء اصطناعي في الولايات المتحدة لهذه الميزات.",
    privacy: "اقرأ سياسة الخصوصية",
    agree: "أوافق",
    cancel: "ليس الآن",
    failed: "تعذّر الحفظ. حاول مرة أخرى.",
  },
};

/** Shown to a specialist when their client has not agreed to AI processing. */
export const CLIENT_AI_CONSENT_MISSING = {
  en: {
    title: "Client consent needed",
    body: "This client has not agreed to AI processing of their data, so AI tools are off for them. They can turn it on in My data & privacy.",
  },
  fr: {
    title: "Consentement du client requis",
    body: "Ce client n'a pas accepté le traitement de ses données par l'IA : les outils d'IA sont désactivés pour lui. Il peut l'activer dans Mes données et confidentialité.",
  },
  ar: {
    title: "موافقة العميل مطلوبة",
    body: "لم يوافق هذا العميل على معالجة بياناته بالذكاء الاصطناعي، لذا أدوات الذكاء الاصطناعي معطلة بالنسبة له. يمكنه تفعيلها من صفحة بياناتي وخصوصيتي.",
  },
};
