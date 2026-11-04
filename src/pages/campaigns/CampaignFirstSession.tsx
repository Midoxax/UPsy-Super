import { useLocale } from "@/contexts/LocaleContext";
import CampaignLanding, { CampaignConfig } from "./CampaignLanding";

const shared = {
  slug: "first-session",
  source: "campaign_b2c_first_session",
  audience: "b2c" as const,
  primaryCta: { label: "", href: "#" },
};

const en: CampaignConfig = {
  ...shared,
  seoTitle: "Your first session at -20% — U.Psy",
  seoDescription:
    "Book your first session with a verified psychologist and get 20% off with code WELCOME20. Video or in-person, in French, English, Arabic, Darija.",
  eyebrow: "Launch offer · WELCOME20",
  headline: "Your first session,",
  headlineAccent: "20% off.",
  subheadline:
    "Choose a verified psychologist and book online. Video anywhere, in person in select cities. If the first session isn't the right fit, we rebook you — free.",
  offerLabel: "Code WELCOME20 · -20% on your first booking",
  bullets: [
    "Verified psychologists — every profile reviewed by our team",
    "Sessions in French, English, Arabic, Darija",
    "Video or in-person — you pick the format",
    "Free rebook guarantee if the fit is off",
    "Encrypted in transit — Law 09-08 compliant",
  ],
  proof: [
    { number: "-20%", label: "On your first session" },
    { number: "4", label: "Languages: Darija, Arabic, French, English" },
    { number: "2 min", label: "Free mental performance score" },
  ],
  primaryCta: { ...shared.primaryCta, label: "Get my WELCOME20 code" },
  formTitle: "Claim your -20% code",
  formSubtitle: "We send WELCOME20 to your inbox in under a minute.",
  successTitle: "Check your inbox 📬",
  successBody:
    "Your WELCOME20 code is on its way. Open it, then pick a psychologist — the discount applies at checkout.",
  successCta: { label: "Browse psychologists", href: "/psychologists" },
};

const fr: CampaignConfig = {
  ...shared,
  seoTitle: "Votre première séance à -20 % | U.Psy",
  seoDescription:
    "Réservez votre première séance avec un psychologue vérifié et profitez de 20 % de réduction avec le code WELCOME20. En visio ou au cabinet, en français, anglais, arabe et darija.",
  eyebrow: "Offre de lancement · WELCOME20",
  headline: "Votre première séance,",
  headlineAccent: "à -20 %.",
  subheadline:
    "Choisissez un psychologue vérifié et réservez en ligne. En visio partout, au cabinet dans certaines villes. Si la première séance ne vous convient pas, nous vous en proposons une autre, gratuitement.",
  offerLabel: "Code WELCOME20 · -20 % sur votre première réservation",
  bullets: [
    "Psychologues vérifiés : chaque profil est examiné par notre équipe",
    "Séances en français, anglais, arabe et darija",
    "En visio ou au cabinet : vous choisissez",
    "Nouvelle séance offerte si le courant ne passe pas",
    "Échanges chiffrés, conformes à la loi 09-08",
  ],
  proof: [
    { number: "-20 %", label: "Sur votre première séance" },
    { number: "4", label: "Langues : darija, arabe, français, anglais" },
    { number: "2 min", label: "Score de performance mentale gratuit" },
  ],
  primaryCta: { ...shared.primaryCta, label: "Recevoir mon code WELCOME20" },
  formTitle: "Recevez votre code -20 %",
  formSubtitle:
    "Nous vous envoyons WELCOME20 par e-mail en moins d'une minute.",
  successTitle: "Consultez votre boîte mail 📬",
  successBody:
    "Votre code WELCOME20 est en route. Ouvrez l'e-mail, puis choisissez un psychologue : la réduction s'applique au paiement.",
  successCta: { label: "Voir les psychologues", href: "/psychologists" },
  labels: {
    name: "Nom complet",
    email: "E-mail",
    phone: "Téléphone / WhatsApp",
    org: "Structure (facultatif)",
    whatsapp:
      "Recevoir aussi les nouvelles sur WhatsApp (facultatif, désinscription à tout moment).",
    consentBefore: "J'accepte de recevoir des messages de U.Psy et j'ai lu la",
    privacy: "politique de confidentialité",
    consentAfter: ". Données protégées par la loi 09-08 (CNDP).",
    noSpam: "Pas de spam. Désinscription en un clic dans chaque message.",
  },
};

const ar: CampaignConfig = {
  ...shared,
  seoTitle: "جلستك الأولى بخصم 20٪ | U.Psy",
  seoDescription:
    "احجز جلستك الأولى مع أخصائي نفسي موثَّق واستفد من خصم 20٪ بالرمز WELCOME20. عن بعد أو في العيادة، بالفرنسية والإنجليزية والعربية والدارجة.",
  eyebrow: "عرض الإطلاق · WELCOME20",
  headline: "جلستك الأولى،",
  headlineAccent: "بخصم 20٪.",
  subheadline:
    "اختر أخصائياً نفسياً موثَّقاً واحجز عبر الإنترنت. عن بعد من أي مكان، وفي العيادة في بعض المدن. إن لم تناسبك الجلسة الأولى، نقترح عليك أخرى مجاناً.",
  offerLabel: "الرمز WELCOME20 · خصم 20٪ على حجزك الأول",
  bullets: [
    "أخصائيون موثَّقون: يراجع فريقنا كل ملف",
    "جلسات بالفرنسية والإنجليزية والعربية والدارجة",
    "عن بعد أو في العيادة: الاختيار لك",
    "جلسة بديلة مجاناً إن لم يكن الاختيار مناسباً",
    "اتصالات مشفَّرة، وفق القانون 09-08",
  ],
  proof: [
    { number: "-20٪", label: "على جلستك الأولى" },
    { number: "4", label: "لغات: الدارجة، العربية، الفرنسية، الإنجليزية" },
    { number: "دقيقتان", label: "مؤشر مجاني للأداء الذهني" },
  ],
  primaryCta: { ...shared.primaryCta, label: "احصل على رمز WELCOME20" },
  formTitle: "احصل على رمز الخصم 20٪",
  formSubtitle: "نرسل لك WELCOME20 عبر البريد في أقل من دقيقة.",
  successTitle: "تفقّد بريدك 📬",
  successBody:
    "رمز WELCOME20 في الطريق. افتح الرسالة ثم اختر أخصائياً: يُطبَّق الخصم عند الدفع.",
  successCta: { label: "تصفح الأخصائيين", href: "/psychologists" },
  labels: {
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف / واتساب",
    org: "المؤسسة (اختياري)",
    whatsapp:
      "توصّل بالمستجدات على واتساب أيضًا (اختياري، يمكن الإلغاء في أي وقت).",
    consentBefore: "أوافق على تلقي رسائل من U.Psy وقرأت",
    privacy: "سياسة الخصوصية",
    consentAfter: ". بيانات محمية بموجب القانون 09-08 (CNDP).",
    noSpam: "بدون رسائل مزعجة. إلغاء الاشتراك بنقرة في كل رسالة.",
  },
};

export default function CampaignFirstSession() {
  const { locale } = useLocale();
  const config = locale === "en" ? en : locale === "ar" ? ar : fr;
  return <CampaignLanding config={config} />;
}
