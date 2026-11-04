import { useLocale } from "@/contexts/LocaleContext";
import CampaignLanding, { CampaignConfig } from "./CampaignLanding";

const shared = {
  slug: "join-specialist",
  source: "campaign_specialist_recruitment",
  audience: "specialist" as const,
  askPhone: true,
  askOrg: true,
};

const en: CampaignConfig = {
  ...shared,
  seoTitle: "Join U.Psy: 3 months at 0% commission",
  seoDescription:
    "Psychologist? Join a curated network of accredited psychologists in Morocco. First 3 months at 0% commission, a verified profile, booking and video handled.",
  eyebrow: "For psychologists · Founding cohort",
  headline: "Join U.Psy:",
  headlineAccent: "0% commission for 3 months.",
  subheadline:
    "A curated network of accredited psychologists in Morocco and online. Keep your practice and your fees. We handle the platform, the bookings and the admin.",
  offerLabel: "First 3 months · 0% platform commission",
  bullets: [
    "Zero commission on your first 3 months of sessions",
    "A verified profile patients can trust, in your languages",
    "Booking, video sessions, reminders and invoicing handled",
    "Patient requests from our campaigns, the Athlete Hub and programmes for organisations",
    "Your file is checked before going live: diploma, licence to practise, registration",
  ],
  proof: [
    { number: "0%", label: "Platform fee for 90 days" },
    { number: "48h", label: "Application review time" },
    { number: "3", label: "Steps to go live" },
  ],
  primaryCta: { label: "Apply to the network", href: "#" },
  formTitle: "Start your application",
  formSubtitle: "We reply within 48h with a link to the accreditation file.",
  successTitle: "We've got your details 🤝",
  successBody:
    "Our team reviews within 48h. Meanwhile, start the full application: it takes about 12 minutes.",
  successCta: { label: "Continue application", href: "/apply" },
};

const fr: CampaignConfig = {
  ...shared,
  seoTitle: "Rejoignez U.Psy : 3 mois à 0 % de commission",
  seoDescription:
    "Psychologue ? Rejoignez un réseau sélectif de psychologues accrédités au Maroc. 3 premiers mois à 0 % de commission, profil vérifié, réservations et visio gérées.",
  eyebrow: "Pour les psychologues · Cohorte fondatrice",
  headline: "Rejoignez U.Psy :",
  headlineAccent: "0 % de commission pendant 3 mois.",
  subheadline:
    "Un réseau sélectif de psychologues accrédités, au Maroc et en ligne. Vous gardez votre cabinet et vos tarifs. Nous gérons la plateforme, les réservations et l'administratif.",
  offerLabel: "3 premiers mois · 0 % de commission plateforme",
  bullets: [
    "Aucune commission sur vos séances pendant 3 mois",
    "Un profil vérifié auquel les patients font confiance, dans vos langues",
    "Réservations, visio, rappels et facturation gérés pour vous",
    "Des demandes de patients issues de nos campagnes, de l'Athlete Hub et des programmes pour organisations",
    "Votre dossier est vérifié avant la mise en ligne : diplôme, autorisation d'exercice, inscription",
  ],
  proof: [
    { number: "0 %", label: "De commission pendant 90 jours" },
    { number: "48 h", label: "Délai d'étude du dossier" },
    { number: "3", label: "Étapes pour être en ligne" },
  ],
  primaryCta: { label: "Rejoindre le réseau", href: "#" },
  formTitle: "Commencez votre candidature",
  formSubtitle:
    "Nous répondons sous 48 h avec le lien vers votre dossier d'accréditation.",
  successTitle: "C'est noté 🤝",
  successBody:
    "Notre équipe étudie votre demande sous 48 h. En attendant, complétez votre dossier : environ 12 minutes.",
  successCta: { label: "Compléter mon dossier", href: "/apply" },
  labels: {
    name: "Nom complet",
    email: "E-mail",
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

const ar: CampaignConfig = {
  ...shared,
  seoTitle: "انضم إلى U.Psy: 3 أشهر بدون عمولة",
  seoDescription:
    "أخصائي نفسي؟ انضم إلى شبكة مختارة من الأخصائيين المعتمدين في المغرب. 3 أشهر الأولى بدون عمولة، ملف موثّق، وحجوزات وحصص مرئية مُدارة.",
  eyebrow: "للأخصائيين النفسيين · الدفعة المؤسسة",
  headline: "انضم إلى U.Psy:",
  headlineAccent: "0٪ عمولة لمدة 3 أشهر.",
  subheadline:
    "شبكة مختارة من الأخصائيين النفسيين المعتمدين في المغرب وعن بعد. تحتفظ بعيادتك وأسعارك، ونتكفل نحن بالمنصة والحجوزات والإدارة.",
  offerLabel: "3 أشهر الأولى · 0٪ عمولة",
  bullets: [
    "بدون عمولة على حصصك خلال 3 أشهر",
    "ملف موثّق يثق به المرضى، بلغاتك",
    "الحجوزات والحصص المرئية والتذكيرات والفوترة علينا",
    "طلبات مرضى من حملاتنا ومن Athlete Hub وبرامج المؤسسات",
    "يُراجَع ملفك قبل النشر: الشهادة، رخصة المزاولة، التسجيل",
  ],
  proof: [
    { number: "0٪", label: "عمولة لمدة 90 يومًا" },
    { number: "48 س", label: "مدة دراسة الملف" },
    { number: "3", label: "خطوات للظهور على المنصة" },
  ],
  primaryCta: { label: "انضم إلى الشبكة", href: "#" },
  formTitle: "ابدأ طلبك",
  formSubtitle: "نردّ خلال 48 ساعة برابط ملف الاعتماد.",
  successTitle: "توصلنا بمعلوماتك 🤝",
  successBody:
    "يدرس فريقنا طلبك خلال 48 ساعة. في الأثناء، أكمل ملفك: نحو 12 دقيقة.",
  successCta: { label: "أكمل ملفي", href: "/apply" },
  labels: {
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف / واتساب",
    org: "العيادة / المؤسسة (اختياري)",
    whatsapp:
      "توصّل بالمستجدات على واتساب أيضًا (اختياري، يمكن الإلغاء في أي وقت).",
    consentBefore: "أوافق على تلقي رسائل من U.Psy وقرأت",
    privacy: "سياسة الخصوصية",
    consentAfter: ". بيانات محمية بموجب القانون 09-08 (CNDP).",
    noSpam: "بدون رسائل مزعجة. إلغاء الاشتراك بنقرة في كل رسالة.",
  },
};

export default function CampaignJoinSpecialist() {
  const { locale } = useLocale();
  const config = locale === "en" ? en : locale === "ar" ? ar : fr;
  return <CampaignLanding config={config} />;
}
