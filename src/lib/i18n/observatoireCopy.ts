// Copy for L'Observatoire U.Psy. Kept out of the shared translations bundle
// (same pattern as homeCopy.ts) so edits stay low-risk.
// The instrument itself is FR/AR only; EN and BER visitors read the FR version.

import type { Locale } from "@/lib/i18n/utils";
import type { SurveyLang } from "@/lib/observatoire/instrument";

export const surveyLangFor = (locale: Locale): SurveyLang =>
  locale === "ar" || locale === "ber" ? "ar" : "fr";

type Copy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  lede: string;
  anonymityTitle: string;
  anonymityPoints: string[];
  consentLabel: string;
  consentRequired: string;
  chooseTrack: string;
  trackPatient: string;
  trackPatientDesc: string;
  trackPsy: string;
  trackPsyDesc: string;
  start: string;
  next: string;
  back: string;
  finish: string;
  saving: string;
  progress: string;
  required: string;
  resultsTitle: string;
  resultsLede: string;
  yourProfile: string;
  bandA: string;
  bandB: string;
  bandC: string;
  bandADesc: string;
  bandBDesc: string;
  bandCDesc: string;
  topBarriers: string;
  priceRead: string;
  priceCoherent: string;
  priceIncoherent: string;
  ctaCreateAccount: string;
  ctaExplore: string;
  ctaApply: string;
  ctaOrg: string;
  keepInTouch: string;
  keepInTouchDesc: string;
  separateStep: string;
  emailLabel: string;
  nameLabel: string;
  phoneLabel: string;
  orgNameLabel: string;
  marketingConsent: string;
  submitOptIn: string;
  optInDone: string;
  optInDoneDesc: string;
  law0908: string;
  noThanks: string;
  errorGeneric: string;
  psyOptInDesc: string;
};

const FR: Copy = {
  seoTitle: "L'Observatoire U.Psy — Étude nationale sur la santé mentale",
  seoDescription:
    "Participez à l'étude anonyme de l'Observatoire U.Psy sur l'accès aux soins psychologiques : freins, prix acceptable et attentes. 5 minutes, strictement anonyme.",
  eyebrow: "Pôle scientifique",
  title: "L'Observatoire",
  titleAccent: "U.Psy",
  lede:
    "Une étude permanente sur l'accès réel aux soins psychologiques. Vos réponses alimentent des données publiques — jamais un dossier à votre nom.",
  anonymityTitle: "Ce questionnaire est strictement anonyme",
  anonymityPoints: [
    "Aucun nom, e-mail ou téléphone n'est enregistré avec vos réponses.",
    "Vos réponses ne peuvent être reliées à aucun compte, ni maintenant ni plus tard.",
    "Seules des statistiques agrégées sont exploitées.",
    "Conformément à la loi 09-08, vous pouvez interrompre à tout moment.",
  ],
  consentLabel: "J'ai lu ce qui précède et je participe librement à cette étude.",
  consentRequired: "Votre consentement est nécessaire pour commencer.",
  chooseTrack: "Vous répondez en tant que…",
  trackPatient: "Particulier",
  trackPatientDesc: "Vous cherchez, avez cherché ou pourriez chercher un accompagnement.",
  trackPsy: "Psychologue",
  trackPsyDesc: "Vous exercez ou vous vous apprêtez à exercer.",
  start: "Commencer",
  next: "Suivant",
  back: "Retour",
  finish: "Voir mes résultats",
  saving: "Enregistrement…",
  progress: "Progression",
  required: "Merci de répondre à toutes les questions de cette section.",
  resultsTitle: "Votre lecture personnalisée",
  resultsLede: "Calculée à partir de vos propres réponses. Rien n'a été enregistré à votre nom.",
  yourProfile: "Votre profil",
  bandA: "Prêt maintenant",
  bandB: "En réflexion",
  bandC: "Exploration",
  bandADesc:
    "Vos réponses indiquent une intention élevée et un besoin immédiat. Le plus utile pour vous, maintenant, est de créer votre espace et d'être mis en relation.",
  bandBDesc:
    "Vous êtes en réflexion. Explorer les praticiens et leurs approches sans engagement est la meilleure étape suivante.",
  bandCDesc:
    "Vous vous informez. Nos ressources et notre bilan gratuit vous donneront des repères concrets avant toute démarche.",
  topBarriers: "Vos trois principaux freins",
  priceRead: "Votre fourchette de prix acceptable",
  priceCoherent: "Votre fourchette est cohérente.",
  priceIncoherent: "Votre fourchette est atypique — utile pour l'étude, difficile à interpréter individuellement.",
  ctaCreateAccount: "Créer mon espace",
  ctaExplore: "Explorer les psychologues",
  ctaApply: "Rejoindre le réseau U.Psy",
  ctaOrg: "Parler d'une offre entreprise",
  keepInTouch: "Souhaitez-vous que nous vous recontactions ?",
  keepInTouchDesc:
    "Étape entièrement séparée et facultative. Si vous laissez un e-mail, il crée un contact distinct : il n'est jamais rattaché aux réponses que vous venez de donner.",
  separateStep: "Étape distincte — facultative",
  emailLabel: "E-mail",
  nameLabel: "Prénom (facultatif)",
  phoneLabel: "Téléphone (facultatif)",
  orgNameLabel: "Nom de l'organisation",
  marketingConsent:
    "J'accepte d'être recontacté(e) par U.Psy. Je peux me désinscrire à tout moment.",
  submitOptIn: "Rester en contact",
  optInDone: "C'est noté",
  optInDoneDesc: "Nous vous écrirons prochainement. Vos réponses à l'étude restent anonymes.",
  law0908:
    "Conformément à la loi 09-08 relative à la protection des données personnelles, vos coordonnées sont traitées de manière confidentielle.",
  noThanks: "Non merci",
  errorGeneric: "Une erreur est survenue. Réessayez dans un instant.",
  psyOptInDesc:
    "Laissez vos coordonnées pour recevoir les conditions du réseau. Une candidature complète pourra être déposée ensuite.",
};

const AR: Copy = {
  seoTitle: "مرصد U.Psy — دراسة وطنية حول الصحة النفسية",
  seoDescription:
    "شارك في دراسة مرصد U.Psy المجهولة حول الوصول إلى الرعاية النفسية: العوائق، الثمن المقبول والتطلعات. 5 دقائق، بسرية تامة.",
  eyebrow: "القطب العلمي",
  title: "المرصد",
  titleAccent: "U.Psy",
  lede:
    "دراسة دائمة حول الوصول الفعلي إلى الرعاية النفسية. إجاباتك تغذي معطيات عمومية — ولا تُنشئ أي ملف باسمك.",
  anonymityTitle: "هذا الاستبيان مجهول تمامًا",
  anonymityPoints: [
    "لا يُسجَّل أي اسم أو بريد إلكتروني أو هاتف مع إجاباتك.",
    "لا يمكن ربط إجاباتك بأي حساب، لا الآن ولا لاحقًا.",
    "تُستعمل الإحصائيات المجمّعة فقط.",
    "وفقًا للقانون 09-08، يمكنك التوقف في أي لحظة.",
  ],
  consentLabel: "قرأت ما سبق وأشارك بحرية في هذه الدراسة.",
  consentRequired: "موافقتك ضرورية للبدء.",
  chooseTrack: "أنت تجيب بصفتك…",
  trackPatient: "شخص عادي",
  trackPatientDesc: "تبحث أو بحثت أو قد تبحث عن مواكبة نفسية.",
  trackPsy: "أخصائي نفسي",
  trackPsyDesc: "تمارس المهنة أو تستعد لممارستها.",
  start: "ابدأ",
  next: "التالي",
  back: "السابق",
  finish: "عرض نتائجي",
  saving: "جارٍ الحفظ…",
  progress: "التقدم",
  required: "يرجى الإجابة عن جميع أسئلة هذا القسم.",
  resultsTitle: "قراءتك الشخصية",
  resultsLede: "محسوبة من إجاباتك أنت. لم يُسجَّل أي شيء باسمك.",
  yourProfile: "ملفك",
  bandA: "جاهز الآن",
  bandB: "في مرحلة تفكير",
  bandC: "استكشاف",
  bandADesc:
    "تشير إجاباتك إلى نية عالية وحاجة فورية. الأنسب لك الآن هو إنشاء فضائك والحصول على توجيه مباشر.",
  bandBDesc: "أنت في مرحلة تفكير. استكشاف الممارسين ومقارباتهم دون التزام هو الخطوة الأنسب.",
  bandCDesc: "أنت تستكشف. مواردنا والتقييم المجاني سيمنحانك معالم ملموسة قبل أي خطوة.",
  topBarriers: "أبرز ثلاثة عوائق لديك",
  priceRead: "مجال الثمن المقبول لديك",
  priceCoherent: "مجالك منسجم.",
  priceIncoherent: "مجالك غير معتاد — مفيد للدراسة، لكن يصعب تأويله فرديًا.",
  ctaCreateAccount: "إنشاء فضائي",
  ctaExplore: "استكشاف الأخصائيين",
  ctaApply: "الانضمام إلى شبكة U.Psy",
  ctaOrg: "التحدث عن عرض للمؤسسات",
  keepInTouch: "هل ترغب في أن نتواصل معك؟",
  keepInTouchDesc:
    "خطوة منفصلة تمامًا واختيارية. إذا تركت بريدًا إلكترونيًا فسيُنشئ جهة اتصال مستقلة، لا تُربط أبدًا بالإجابات التي قدمتها.",
  separateStep: "خطوة منفصلة — اختيارية",
  emailLabel: "البريد الإلكتروني",
  nameLabel: "الاسم (اختياري)",
  phoneLabel: "الهاتف (اختياري)",
  orgNameLabel: "اسم المؤسسة",
  marketingConsent: "أوافق على أن تتواصل معي U.Psy. يمكنني إلغاء الاشتراك في أي وقت.",
  submitOptIn: "ابقَ على تواصل",
  optInDone: "تم التسجيل",
  optInDoneDesc: "سنراسلك قريبًا. تبقى إجاباتك في الدراسة مجهولة.",
  law0908:
    "وفقًا للقانون 09-08 المتعلق بحماية المعطيات الشخصية، تُعالج بياناتك بسرية تامة.",
  noThanks: "لا، شكرًا",
  errorGeneric: "حدث خطأ. يرجى المحاولة مجددًا بعد لحظات.",
  psyOptInDesc:
    "اترك بياناتك لتصلك شروط الشبكة. يمكن إيداع ترشيح كامل لاحقًا.",
};

export const observatoireCopy = (lang: SurveyLang): Copy => (lang === "ar" ? AR : FR);