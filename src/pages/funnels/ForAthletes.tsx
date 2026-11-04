import {
  Activity,
  Brain,
  Gauge,
  Languages,
  NotebookPen,
  Stethoscope,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import FunnelPage, { type FunnelCopy } from "./FunnelPage";

const FR: FunnelCopy = {
  seoTitle: "Psychologie du sport et performance mentale | U.Psy",
  seoDescription:
    "Préparation mentale pour sportifs au Maroc : score de performance mentale gratuit, psychologues du sport vérifiés en visio ou au cabinet, Athlete Hub pour le suivi entre les séances.",
  eyebrow: "Sportifs · Performance mentale",
  title: "Vous entraînez le corps chaque jour.",
  titleAccent: "Entraînez aussi le mental.",
  sub: "Un psychologue vérifié, une mesure de départ et des outils pour suivre votre forme entre les séances. En darija, arabe, français ou anglais, en visio ou au cabinet.",
  primary: { label: "Faire le score gratuit", href: "/free-score" },
  secondary: {
    label: "Trouver un psychologue du sport",
    href: "/psychologists",
  },
  reassurance: ["12 questions, 2 minutes", "Sans engagement", "Confidentiel"],
  statsTitle: "Le mental se travaille, et ça se mesure.",
  stats: [
    {
      value: "34 %",
      label:
        "des sportifs de haut niveau en activité rapportent des symptômes d'anxiété ou de dépression.",
      ref: 1,
    },
    {
      value: "g = 0,57",
      label:
        "effet moyen des interventions psychologiques sur la performance sportive, sur 35 essais contrôlés.",
      ref: 4,
    },
    {
      value: "n° 1",
      label:
        "La stigmatisation est le premier frein qui empêche les jeunes sportifs de demander de l'aide.",
      ref: 3,
    },
  ],
  stepsTitle: "Comment ça marche",
  steps: [
    {
      title: "Mesurez votre point de départ",
      body: "Le score de performance mentale : gratuit, 12 questions, 2 minutes.",
    },
    {
      title: "Choisissez votre psychologue",
      body: "Profils vérifiés, spécialités et langues affichées. Visio ou cabinet.",
    },
    {
      title: "Travaillez en séance",
      body: "Routines de pré-compétition, gestion de la pression, récupération, confiance.",
    },
    {
      title: "Suivez entre les séances",
      body: "Athlete Hub : forme du jour, journal et protocoles, au même endroit.",
    },
  ],
  featuresTitle: "Ce que vous obtenez",
  features: [
    {
      icon: Gauge,
      title: "Score de performance mentale",
      body: "Un repère chiffré pour voir d'où vous partez et mesurer vos progrès.",
    },
    {
      icon: Stethoscope,
      title: "Psychologues vérifiés",
      body: "Chaque profil est examiné par notre équipe avant d'être publié.",
    },
    {
      icon: Activity,
      title: "Athlete Hub",
      body: "Forme du jour, journal et protocoles pour garder le fil entre deux séances.",
    },
    {
      icon: Brain,
      title: "Protocoles de performance",
      body: "Visualisation, contrôle de l'activation, routines, retour après une contre-performance.",
    },
    {
      icon: NotebookPen,
      title: "Journal guidé",
      body: "Notez ce qui se passe en entraînement et en compétition, et repérez ce qui marche.",
    },
    {
      icon: Languages,
      title: "Dans votre langue",
      body: "Darija, arabe, français ou anglais : vous choisissez.",
    },
  ],
  trustTitle: "Votre mental reste à vous",
  trust: [
    "Vos séances et votre journal sont confidentiels, conformément à la loi 09-08.",
    "Si votre club ou fédération finance l'accompagnement, il ne voit que des données agrégées, jamais qui a consulté ni pourquoi.",
    "Vous choisissez votre psychologue et pouvez en changer.",
    "Le service n'est pas adapté aux urgences : en cas de crise, contactez les services d'urgence.",
  ],
  closingTitle: "Commencez par deux minutes.",
  closingBody:
    "Le score gratuit vous donne un point de départ. Ensuite, c'est vous qui décidez.",
  sourcesLabel: "Sources",
};

const EN: FunnelCopy = {
  seoTitle: "Sport psychology and mental performance | U.Psy",
  seoDescription:
    "Mental preparation for athletes in Morocco: a free mental performance score, verified sport psychologists by video or in person, and the Athlete Hub to follow up between sessions.",
  eyebrow: "Athletes · Mental performance",
  title: "You train the body every day.",
  titleAccent: "Train the mind too.",
  sub: "A verified psychologist, a baseline measure and tools to follow your form between sessions. In Darija, Arabic, French or English, by video or in person.",
  primary: { label: "Take the free score", href: "/free-score" },
  secondary: { label: "Find a sport psychologist", href: "/psychologists" },
  reassurance: ["12 questions, 2 minutes", "No commitment", "Confidential"],
  statsTitle: "The mind can be trained, and measured.",
  stats: [
    {
      value: "34%",
      label: "of current elite athletes report anxiety or depression symptoms.",
      ref: 1,
    },
    {
      value: "g = 0.57",
      label:
        "average effect of psychological interventions on sport performance, across 35 controlled trials.",
      ref: 4,
    },
    {
      value: "No. 1",
      label:
        "Stigma is the first barrier stopping young athletes from seeking help.",
      ref: 3,
    },
  ],
  stepsTitle: "How it works",
  steps: [
    {
      title: "Measure your starting point",
      body: "The mental performance score: free, 12 questions, 2 minutes.",
    },
    {
      title: "Choose your psychologist",
      body: "Verified profiles with specialties and languages shown. Video or in person.",
    },
    {
      title: "Work in session",
      body: "Pre-competition routines, handling pressure, recovery, confidence.",
    },
    {
      title: "Follow up between sessions",
      body: "Athlete Hub: daily readiness, journal and protocols in one place.",
    },
  ],
  featuresTitle: "What you get",
  features: [
    {
      icon: Gauge,
      title: "Mental performance score",
      body: "A number to see where you start and measure progress.",
    },
    {
      icon: Stethoscope,
      title: "Verified psychologists",
      body: "Every profile is reviewed by our team before it goes live.",
    },
    {
      icon: Activity,
      title: "Athlete Hub",
      body: "Daily readiness, journal and protocols to keep momentum between sessions.",
    },
    {
      icon: Brain,
      title: "Performance protocols",
      body: "Visualisation, arousal control, routines, bouncing back after a poor performance.",
    },
    {
      icon: NotebookPen,
      title: "Guided journal",
      body: "Note what happens in training and competition, and spot what works.",
    },
    {
      icon: Languages,
      title: "In your language",
      body: "Darija, Arabic, French or English: your choice.",
    },
  ],
  trustTitle: "Your mind stays yours",
  trust: [
    "Your sessions and journal are confidential, in line with Morocco's Law 09-08.",
    "If your club or federation pays for support, it only sees aggregated data, never who consulted or why.",
    "You choose your psychologist and can change at any time.",
    "This service is not for emergencies: in a crisis, contact emergency services.",
  ],
  closingTitle: "Start with two minutes.",
  closingBody:
    "The free score gives you a starting point. What happens next is up to you.",
  sourcesLabel: "Sources",
};

const AR: FunnelCopy = {
  seoTitle: "علم النفس الرياضي والأداء الذهني | U.Psy",
  seoDescription:
    "تحضير ذهني للرياضيين في المغرب: مؤشر مجاني للأداء الذهني، أخصائيون نفسيون رياضيون موثَّقون عن بعد أو في العيادة، وAthlete Hub للمتابعة بين الجلسات.",
  eyebrow: "الرياضيون · الأداء الذهني",
  title: "تدرّب جسدك كل يوم.",
  titleAccent: "درّب ذهنك أيضاً.",
  sub: "أخصائي نفسي موثَّق، قياس أولي وأدوات لمتابعة جاهزيتك بين الجلسات. بالدارجة أو العربية أو الفرنسية أو الإنجليزية، عن بعد أو في العيادة.",
  primary: { label: "اجتز المؤشر المجاني", href: "/free-score" },
  secondary: { label: "ابحث عن أخصائي نفسي رياضي", href: "/psychologists" },
  reassurance: ["12 سؤالاً، دقيقتان", "دون التزام", "سري"],
  statsTitle: "الذهن يُدرَّب، ويُقاس.",
  stats: [
    {
      value: "34٪",
      label: "من الرياضيين النخبة الممارسين يذكرون أعراض قلق أو اكتئاب.",
      ref: 1,
    },
    {
      value: "g = 0.57",
      label:
        "متوسط أثر التدخلات النفسية على الأداء الرياضي، عبر 35 تجربة مضبوطة.",
      ref: 4,
    },
    {
      value: "رقم 1",
      label: "الوصمة هي أول ما يمنع الرياضيين الشباب من طلب المساعدة.",
      ref: 3,
    },
  ],
  stepsTitle: "كيف يعمل",
  steps: [
    {
      title: "قِس نقطة انطلاقك",
      body: "مؤشر الأداء الذهني: مجاني، 12 سؤالاً، دقيقتان.",
    },
    {
      title: "اختر أخصائيك",
      body: "ملفات موثَّقة مع التخصصات واللغات. عن بعد أو في العيادة.",
    },
    {
      title: "اشتغل في الجلسة",
      body: "روتين ما قبل المنافسة، تدبير الضغط، الاسترجاع، الثقة.",
    },
    {
      title: "تابع بين الجلسات",
      body: "Athlete Hub: الجاهزية اليومية، اليوميات والبروتوكولات في مكان واحد.",
    },
  ],
  featuresTitle: "ما تحصل عليه",
  features: [
    {
      icon: Gauge,
      title: "مؤشر الأداء الذهني",
      body: "رقم يوضح من أين تبدأ ويقيس تقدمك.",
    },
    {
      icon: Stethoscope,
      title: "أخصائيون موثَّقون",
      body: "يراجع فريقنا كل ملف قبل نشره.",
    },
    {
      icon: Activity,
      title: "Athlete Hub",
      body: "الجاهزية اليومية واليوميات والبروتوكولات للحفاظ على الاستمرارية.",
    },
    {
      icon: Brain,
      title: "بروتوكولات الأداء",
      body: "التخيل، ضبط التنشيط، الروتين، النهوض بعد أداء ضعيف.",
    },
    {
      icon: NotebookPen,
      title: "يوميات موجَّهة",
      body: "دوّن ما يحدث في التدريب والمنافسة، واكتشف ما ينجح.",
    },
    {
      icon: Languages,
      title: "بلغتك",
      body: "الدارجة أو العربية أو الفرنسية أو الإنجليزية: الاختيار لك.",
    },
  ],
  trustTitle: "ذهنك يبقى ملكك",
  trust: [
    "جلساتك ويومياتك سرية، وفق القانون 09-08.",
    "إذا موّل ناديك أو جامعتك المرافقة، فلا يرى إلا بيانات مجمَّعة، أبداً من استشار ولا لماذا.",
    "تختار أخصائيك ويمكنك تغييره.",
    "هذه الخدمة غير مخصصة للطوارئ: في حالة أزمة، اتصل بخدمات الطوارئ.",
  ],
  closingTitle: "ابدأ بدقيقتين.",
  closingBody: "يمنحك المؤشر المجاني نقطة انطلاق. وما يأتي بعد ذلك قرارك.",
  sourcesLabel: "المصادر",
};

const COPY = { fr: FR, en: EN, ar: AR };

export default function ForAthletes() {
  const { locale } = useLocale();
  return (
    <FunnelPage
      path="/for-athletes"
      copy={COPY[locale as keyof typeof COPY] ?? FR}
    />
  );
}
