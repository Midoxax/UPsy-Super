import {
  BarChart3,
  GraduationCap,
  Languages,
  Lock,
  Presentation,
  Users,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import FunnelPage, { type FunnelCopy } from "./FunnelPage";

const FR: FunnelCopy = {
  seoTitle: "Santé mentale au travail et dans le sport | U.Psy Organisations",
  seoDescription:
    "Accès confidentiel à des psychologues vérifiés, ateliers de gestion du stress fondés sur les TCC et formation des managers pour entreprises, clubs et fédérations au Maroc. Données agrégées uniquement.",
  eyebrow: "Entreprises · Clubs · Fédérations · Écoles",
  title: "Des équipes en meilleure santé mentale",
  titleAccent: "performent mieux.",
  sub: "U.Psy donne à vos équipes un accès confidentiel à des psychologues vérifiés, dans leur langue, avec des ateliers et une formation des managers. Vous ne voyez que des données agrégées.",
  primary: { label: "Réserver un appel", href: "/book-a-call" },
  secondary: { label: "Voir le pitch entreprise", href: "/pitch?for=company" },
  reassurance: [
    "On commence par une équipe pilote",
    "Données agrégées uniquement",
    "Conforme à la loi 09-08",
  ],
  statsTitle: "Traiter l'anxiété et la dépression, c'est rentable.",
  stats: [
    {
      value: "× 3",
      label:
        "Jusqu'à trois fois le coût du traitement de la dépression et de l'anxiété, récupéré en productivité (36 pays).",
      ref: 7,
    },
    {
      value: "× 5,7",
      label: "Jusqu'à 5,7 fois en comptant aussi les gains de santé.",
      ref: 7,
    },
    {
      value: "34 %",
      label:
        "des sportifs de haut niveau en activité rapportent des symptômes d'anxiété ou de dépression : les clubs sont concernés aussi.",
      ref: 1,
    },
  ],
  stepsTitle: "Comment on démarre",
  steps: [
    {
      title: "Un appel de 30 minutes",
      body: "Vos enjeux, vos équipes, vos contraintes. Nous cadrons un pilote.",
    },
    {
      title: "Une équipe pilote",
      body: "Un groupe défini, une durée définie, des indicateurs choisis ensemble.",
    },
    {
      title: "Accès et ateliers",
      body: "Séances confidentielles, ateliers de gestion du stress et formation des managers.",
    },
    {
      title: "Bilan agrégé",
      body: "Participation et tendances, jamais d'information individuelle. Puis on décide d'étendre ou non.",
    },
  ],
  featuresTitle: "Ce que comprend le programme",
  features: [
    {
      icon: Lock,
      title: "Accès confidentiel",
      body: "Vos collaborateurs consultent sans que l'organisation sache qui ni pourquoi.",
    },
    {
      icon: Users,
      title: "Psychologues vérifiés",
      body: "Chaque profil est examiné par notre équipe avant d'être publié. Visio ou cabinet.",
    },
    {
      icon: Presentation,
      title: "Ateliers de gestion du stress",
      body: "Fondés sur les TCC, l'approche la mieux étayée en milieu de travail.",
    },
    {
      icon: GraduationCap,
      title: "Formation des managers",
      body: "Repérer les signaux, ouvrir la conversation, orienter sans s'improviser thérapeute.",
    },
    {
      icon: BarChart3,
      title: "Tableau de bord agrégé",
      body: "Participation et tendances au niveau du groupe, sans données nominatives.",
    },
    {
      icon: Languages,
      title: "Quatre langues",
      body: "Darija, arabe, français et anglais, pour toutes vos équipes.",
    },
  ],
  trustTitle: "La confidentialité n'est pas une option",
  trust: [
    "L'organisation ne voit jamais qui a consulté ni pourquoi.",
    "Les rapports sont agrégés au niveau du groupe.",
    "Traitement des données conforme à la loi 09-08.",
    "Programmes sur devis, adaptés à la taille de vos équipes.",
  ],
  closingTitle: "Commençons par une équipe.",
  closingBody:
    "30 minutes pour comprendre vos besoins et proposer un pilote mesurable.",
  sourcesLabel: "Sources",
};

const EN: FunnelCopy = {
  seoTitle: "Mental health at work and in sport | U.Psy for Organisations",
  seoDescription:
    "Confidential access to verified psychologists, CBT-based stress management workshops and manager training for companies, clubs and federations in Morocco. Aggregated data only.",
  eyebrow: "Companies · Clubs · Federations · Schools",
  title: "Mentally healthier teams",
  titleAccent: "perform better.",
  sub: "U.Psy gives your teams confidential access to verified psychologists in their own language, with workshops and manager training. You only see aggregated data.",
  primary: { label: "Book a call", href: "/book-a-call" },
  secondary: { label: "See the company pitch", href: "/pitch?for=company" },
  reassurance: [
    "We start with one pilot team",
    "Aggregated data only",
    "Law 09-08 compliant",
  ],
  statsTitle: "Treating anxiety and depression pays for itself.",
  stats: [
    {
      value: "× 3",
      label:
        "Up to three times the cost of treating depression and anxiety, recovered in productivity (36 countries).",
      ref: 7,
    },
    {
      value: "× 5.7",
      label: "Up to 5.7 times once health gains are counted too.",
      ref: 7,
    },
    {
      value: "34%",
      label:
        "of current elite athletes report anxiety or depression symptoms: clubs are concerned too.",
      ref: 1,
    },
  ],
  stepsTitle: "How we start",
  steps: [
    {
      title: "A 30-minute call",
      body: "Your challenges, your teams, your constraints. We scope a pilot.",
    },
    {
      title: "One pilot team",
      body: "A defined group, a defined period, indicators chosen together.",
    },
    {
      title: "Access and workshops",
      body: "Confidential sessions, stress management workshops and manager training.",
    },
    {
      title: "Aggregated review",
      body: "Participation and trends, never individual information. Then we decide whether to extend.",
    },
  ],
  featuresTitle: "What the programme includes",
  features: [
    {
      icon: Lock,
      title: "Confidential access",
      body: "Your people consult without the organisation knowing who or why.",
    },
    {
      icon: Users,
      title: "Verified psychologists",
      body: "Every profile is reviewed by our team before it goes live. Video or in person.",
    },
    {
      icon: Presentation,
      title: "Stress management workshops",
      body: "CBT-based, the best-supported approach in the workplace.",
    },
    {
      icon: GraduationCap,
      title: "Manager training",
      body: "Spot the signs, open the conversation, refer without playing therapist.",
    },
    {
      icon: BarChart3,
      title: "Aggregated dashboard",
      body: "Group-level participation and trends, with no named data.",
    },
    {
      icon: Languages,
      title: "Four languages",
      body: "Darija, Arabic, French and English, for all your teams.",
    },
  ],
  trustTitle: "Confidentiality is not optional",
  trust: [
    "The organisation never sees who consulted or why.",
    "Reports are aggregated at group level.",
    "Data handled in line with Morocco's Law 09-08.",
    "Programmes quoted to fit the size of your teams.",
  ],
  closingTitle: "Let's start with one team.",
  closingBody:
    "30 minutes to understand your needs and propose a measurable pilot.",
  sourcesLabel: "Sources",
};

const AR: FunnelCopy = {
  seoTitle: "الصحة النفسية في العمل والرياضة | U.Psy للمؤسسات",
  seoDescription:
    "وصول سري إلى أخصائيين نفسيين موثَّقين، ورشات لتدبير الضغط قائمة على العلاج المعرفي السلوكي وتكوين المسيرين للشركات والأندية والجامعات الرياضية في المغرب. بيانات مجمَّعة فقط.",
  eyebrow: "الشركات · الأندية · الجامعات الرياضية · المدارس",
  title: "فرق بصحة نفسية أفضل",
  titleAccent: "تؤدي أفضل.",
  sub: "تمنح U.Psy فرقك وصولاً سرياً إلى أخصائيين نفسيين موثَّقين بلغتهم، مع ورشات وتكوين للمسيرين. لا ترى إلا بيانات مجمَّعة.",
  primary: { label: "احجز مكالمة", href: "/book-a-call" },
  secondary: { label: "شاهد العرض للشركات", href: "/pitch?for=company" },
  reassurance: ["نبدأ بفريق تجريبي", "بيانات مجمَّعة فقط", "وفق القانون 09-08"],
  statsTitle: "علاج القلق والاكتئاب مربح.",
  stats: [
    {
      value: "× 3",
      label:
        "حتى ثلاثة أضعاف كلفة علاج الاكتئاب والقلق تُسترجع في الإنتاجية (36 دولة).",
      ref: 7,
    },
    {
      value: "× 5.7",
      label: "حتى 5.7 أضعاف عند احتساب المكاسب الصحية أيضاً.",
      ref: 7,
    },
    {
      value: "34٪",
      label:
        "من الرياضيين النخبة الممارسين يذكرون أعراض قلق أو اكتئاب: الأندية معنية أيضاً.",
      ref: 1,
    },
  ],
  stepsTitle: "كيف نبدأ",
  steps: [
    {
      title: "مكالمة من 30 دقيقة",
      body: "تحدياتكم، فرقكم، قيودكم. نحدد تجربة أولى.",
    },
    {
      title: "فريق تجريبي",
      body: "مجموعة محددة، مدة محددة، ومؤشرات نختارها معاً.",
    },
    {
      title: "الوصول والورشات",
      body: "جلسات سرية، ورشات لتدبير الضغط وتكوين للمسيرين.",
    },
    {
      title: "حصيلة مجمَّعة",
      body: "المشاركة والاتجاهات، دون أي معلومة فردية. ثم نقرر التوسيع أو لا.",
    },
  ],
  featuresTitle: "ما يتضمنه البرنامج",
  features: [
    {
      icon: Lock,
      title: "وصول سري",
      body: "يستشير موظفوك دون أن تعرف المؤسسة من ولا لماذا.",
    },
    {
      icon: Users,
      title: "أخصائيون موثَّقون",
      body: "يراجع فريقنا كل ملف قبل نشره. عن بعد أو في العيادة.",
    },
    {
      icon: Presentation,
      title: "ورشات تدبير الضغط",
      body: "قائمة على العلاج المعرفي السلوكي، المقاربة الأكثر دعماً في بيئة العمل.",
    },
    {
      icon: GraduationCap,
      title: "تكوين المسيرين",
      body: "رصد الإشارات، فتح الحوار، والتوجيه دون لعب دور المعالج.",
    },
    {
      icon: BarChart3,
      title: "لوحة قيادة مجمَّعة",
      body: "المشاركة والاتجاهات على مستوى المجموعة، دون بيانات اسمية.",
    },
    {
      icon: Languages,
      title: "أربع لغات",
      body: "الدارجة والعربية والفرنسية والإنجليزية لكل فرقك.",
    },
  ],
  trustTitle: "السرية ليست خياراً",
  trust: [
    "لا ترى المؤسسة أبداً من استشار ولا لماذا.",
    "التقارير مجمَّعة على مستوى المجموعة.",
    "معالجة البيانات وفق القانون 09-08.",
    "برامج حسب عرض سعر يناسب حجم فرقك.",
  ],
  closingTitle: "لنبدأ بفريق واحد.",
  closingBody: "30 دقيقة لفهم احتياجاتكم واقتراح تجربة قابلة للقياس.",
  sourcesLabel: "المصادر",
};

const COPY = { fr: FR, en: EN, ar: AR };

export default function ForOrganizations() {
  const { locale } = useLocale();
  return (
    <FunnelPage
      path="/for-organizations"
      copy={COPY[locale as keyof typeof COPY] ?? FR}
    />
  );
}
