import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  Compass,
  Crown,
  Gauge,
  GraduationCap,
  Heart,
  HeartPulse,
  Landmark,
  LineChart,
  MapPin,
  Megaphone,
  MessageCircle,
  Presentation,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trophy,
  Umbrella,
  UserPlus,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

/**
 * Site navigation, one source for the desktop dropdowns and the mobile menu.
 *
 * Organised by who is reading (someone seeking care, an athlete, an
 * organisation, a psychologist, a learner), then "about". Every href is a
 * real public route; locale prefixes are added by the caller.
 */

export type NavItem = {
  label: string;
  desc?: string;
  href: string;
  icon?: LucideIcon;
};

export type NavSection = {
  id: string;
  label: string;
  /** One line under the section title in the mobile menu. */
  intro: string;
  href: string;
  icon: LucideIcon;
  items: NavItem[];
};

export type NavCopy = {
  sections: NavSection[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  quickLinks: NavItem[];
  settings: string;
  account: string;
  menuTitle: string;
};

type Locale = "en" | "fr" | "ar";

const FR: NavCopy = {
  menuTitle: "Menu",
  primaryCta: { label: "Trouver un psychologue", href: "/psychologists" },
  secondaryCta: { label: "Score gratuit · 2 min", href: "/free-score" },
  settings: "Préférences",
  account: "Mon compte",
  quickLinks: [
    { label: "Blog", href: "/blog", icon: BookOpen },
    { label: "Le pitch", href: "/pitch", icon: Presentation },
    { label: "Contact", href: "/contact", icon: MessageCircle },
  ],
  sections: [
    {
      id: "care",
      label: "Accompagnement",
      intro: "Trouver le bon psychologue et commencer.",
      href: "/psychologists",
      icon: HeartPulse,
      items: [
        {
          label: "Trouver un psychologue",
          desc: "Profils vérifiés, visio ou cabinet",
          href: "/psychologists",
          icon: Stethoscope,
        },
        {
          label: "Être orienté",
          desc: "Quelques questions, des profils adaptés",
          href: "/get-matched",
          icon: Compass,
        },
        {
          label: "Score de performance mentale",
          desc: "Gratuit, 12 questions, 2 minutes",
          href: "/free-score",
          icon: Gauge,
        },
        {
          label: "Auto-évaluations",
          desc: "Questionnaires validés (GAD-7, PHQ-9)",
          href: "/assessment-lab",
          icon: ClipboardCheck,
        },
        {
          label: "Psychologue en ligne",
          desc: "Consulter par visio, où que vous soyez",
          href: "/psychologue-en-ligne",
          icon: Video,
        },
        {
          label: "Psychologue par ville",
          desc: "Casablanca, Rabat, Marrakech…",
          href: "/psychologue",
          icon: MapPin,
        },
        {
          label: "Programmes",
          desc: "Protocoles structurés par objectif",
          href: "/services",
          icon: BookOpen,
        },
      ],
    },
    {
      id: "athletes",
      label: "Sportifs",
      intro: "Préparer le mental comme le physique.",
      href: "/for-athletes",
      icon: Trophy,
      items: [
        {
          label: "Pourquoi U.Psy pour les sportifs",
          desc: "Méthode, preuves, accompagnement",
          href: "/for-athletes",
          icon: Trophy,
        },
        {
          label: "Athlete Hub",
          desc: "Forme du jour, journal, protocoles",
          href: "/athlete-hub",
          icon: Activity,
        },
        {
          label: "Force mentale",
          desc: "Entraîner la tête qui dirige le corps",
          href: "/mental-toughness-athletes",
          icon: Brain,
        },
        {
          label: "Coach IA (Nour)",
          desc: "Réflexion guidée entre les séances",
          href: "/ai-assistant",
          icon: Sparkles,
        },
        {
          label: "L'Observatoire",
          desc: "Données ouvertes sur la santé mentale",
          href: "/observatoire",
          icon: LineChart,
        },
      ],
    },
    {
      id: "organizations",
      label: "Organisations",
      intro: "Clubs, fédérations, entreprises, écoles.",
      href: "/for-organizations",
      icon: Building2,
      items: [
        {
          label: "Pour les organisations",
          desc: "Accès confidentiel, données agrégées",
          href: "/for-organizations",
          icon: Users,
        },
        {
          label: "Conseil et programmes",
          desc: "Sport, entreprise, campus",
          href: "/services/consulting-for-organizations",
          icon: Building2,
        },
        {
          label: "Réserver un appel",
          desc: "30 minutes pour cadrer un pilote",
          href: "/book-a-call",
          icon: CalendarCheck,
        },
        {
          label: "Le pitch entreprise",
          desc: "Problème, solution, chiffres, sources",
          href: "/pitch?for=company",
          icon: Presentation,
        },
        {
          label: "Pôle Talents & Innovation",
          desc: "Recherche et science appliquée",
          href: "/talent-innovation-hub",
          icon: Sparkles,
        },
        {
          label: "Candidature organisation",
          desc: "Ouvrir un compte organisation",
          href: "/apply/organization",
          icon: Landmark,
        },
      ],
    },
    {
      id: "psychologists",
      label: "Psychologues",
      intro: "Rejoindre le réseau et développer votre cabinet.",
      href: "/campaigns/join-specialist",
      icon: ShieldCheck,
      items: [
        {
          label: "Rejoindre le réseau",
          desc: "0 % de commission pendant 3 mois",
          href: "/campaigns/join-specialist",
          icon: UserPlus,
        },
        {
          label: "Déposer mon dossier",
          desc: "7 étapes, environ 12 minutes",
          href: "/apply",
          icon: ClipboardCheck,
        },
        {
          label: "Formules et tarifs",
          desc: "Commission de 20 % à 8 %",
          href: "/pricing-specialists",
          icon: Crown,
        },
        {
          label: "Ligue LSSPM",
          desc: "Un dossier reconnu par la Ligue et U.Psy",
          href: "/campaigns/lsspm",
          icon: Award,
        },
        {
          label: "Académie",
          desc: "Formation continue des praticiens",
          href: "/academy",
          icon: GraduationCap,
        },
      ],
    },
    {
      id: "training",
      label: "Formation",
      intro: "Apprendre avec les cliniciens du réseau.",
      href: "/center",
      icon: GraduationCap,
      items: [
        {
          label: "Centre de formation",
          desc: "Espaces, échanges, communautés",
          href: "/center",
          icon: Users,
        },
        {
          label: "Écoles",
          desc: "Parcours par discipline",
          href: "/center/schools",
          icon: Landmark,
        },
        {
          label: "Cours",
          desc: "En cohorte ou à votre rythme",
          href: "/learn",
          icon: BookOpen,
        },
        {
          label: "Certifications",
          desc: "Parcours en psychologie de la performance",
          href: "/learn?tab=certifications",
          icon: Award,
        },
        {
          label: "Communauté",
          desc: "Apprendre ensemble",
          href: "/skool",
          icon: MessageCircle,
        },
      ],
    },
    {
      id: "about",
      label: "À propos",
      intro: "Qui nous sommes et pourquoi.",
      href: "/about",
      icon: Heart,
      items: [
        { label: "Notre histoire", href: "/about", icon: Heart },
        { label: "Le fondateur", href: "/founder", icon: Award },
        { label: "Pourquoi U.Psy", href: "/why-us", icon: ShieldCheck },
        { label: "Le pitch", href: "/pitch", icon: Presentation },
        { label: "Adhésion", href: "/membership", icon: Crown },
        {
          label: "L'Umbrella marocaine",
          href: "/moroccan-umbrella",
          icon: Umbrella,
        },
        {
          label: "Psychologues Sans Frontières",
          href: "/psf",
          icon: Heart,
        },
        { label: "Presse", href: "/press", icon: Megaphone },
        { label: "Contact", href: "/contact", icon: MessageCircle },
      ],
    },
  ],
};

const EN: NavCopy = {
  menuTitle: "Menu",
  primaryCta: { label: "Find a psychologist", href: "/psychologists" },
  secondaryCta: { label: "Free score · 2 min", href: "/free-score" },
  settings: "Preferences",
  account: "My account",
  quickLinks: [
    { label: "Blog", href: "/blog", icon: BookOpen },
    { label: "The pitch", href: "/pitch", icon: Presentation },
    { label: "Contact", href: "/contact", icon: MessageCircle },
  ],
  sections: [
    {
      id: "care",
      label: "Care",
      intro: "Find the right psychologist and get started.",
      href: "/psychologists",
      icon: HeartPulse,
      items: [
        {
          label: "Find a psychologist",
          desc: "Verified profiles, video or in person",
          href: "/psychologists",
          icon: Stethoscope,
        },
        {
          label: "Get matched",
          desc: "A few questions, the right profiles",
          href: "/get-matched",
          icon: Compass,
        },
        {
          label: "Mental performance score",
          desc: "Free, 12 questions, 2 minutes",
          href: "/free-score",
          icon: Gauge,
        },
        {
          label: "Self-assessments",
          desc: "Validated questionnaires (GAD-7, PHQ-9)",
          href: "/assessment-lab",
          icon: ClipboardCheck,
        },
        {
          label: "Online psychologist",
          desc: "Video sessions, wherever you are",
          href: "/psychologue-en-ligne",
          icon: Video,
        },
        {
          label: "Psychologist by city",
          desc: "Casablanca, Rabat, Marrakech…",
          href: "/psychologue",
          icon: MapPin,
        },
        {
          label: "Programmes",
          desc: "Structured protocols by goal",
          href: "/services",
          icon: BookOpen,
        },
      ],
    },
    {
      id: "athletes",
      label: "Athletes",
      intro: "Train the mind like the body.",
      href: "/for-athletes",
      icon: Trophy,
      items: [
        {
          label: "Why U.Psy for athletes",
          desc: "Method, evidence, support",
          href: "/for-athletes",
          icon: Trophy,
        },
        {
          label: "Athlete Hub",
          desc: "Daily readiness, journal, protocols",
          href: "/athlete-hub",
          icon: Activity,
        },
        {
          label: "Mental toughness",
          desc: "Train the mind that runs the body",
          href: "/mental-toughness-athletes",
          icon: Brain,
        },
        {
          label: "AI coach (Nour)",
          desc: "Guided reflection between sessions",
          href: "/ai-assistant",
          icon: Sparkles,
        },
        {
          label: "The Observatory",
          desc: "Open mental health data",
          href: "/observatoire",
          icon: LineChart,
        },
      ],
    },
    {
      id: "organizations",
      label: "Organisations",
      intro: "Clubs, federations, companies, schools.",
      href: "/for-organizations",
      icon: Building2,
      items: [
        {
          label: "For organisations",
          desc: "Confidential access, aggregated data",
          href: "/for-organizations",
          icon: Users,
        },
        {
          label: "Consulting and programmes",
          desc: "Sport, work, campus",
          href: "/services/consulting-for-organizations",
          icon: Building2,
        },
        {
          label: "Book a call",
          desc: "30 minutes to scope a pilot",
          href: "/book-a-call",
          icon: CalendarCheck,
        },
        {
          label: "The company pitch",
          desc: "Problem, solution, numbers, sources",
          href: "/pitch?for=company",
          icon: Presentation,
        },
        {
          label: "Talent & Innovation Hub",
          desc: "Research and applied science",
          href: "/talent-innovation-hub",
          icon: Sparkles,
        },
        {
          label: "Organisation application",
          desc: "Open an organisation account",
          href: "/apply/organization",
          icon: Landmark,
        },
      ],
    },
    {
      id: "psychologists",
      label: "Psychologists",
      intro: "Join the network and grow your practice.",
      href: "/campaigns/join-specialist",
      icon: ShieldCheck,
      items: [
        {
          label: "Join the network",
          desc: "0% commission for 3 months",
          href: "/campaigns/join-specialist",
          icon: UserPlus,
        },
        {
          label: "Submit my application",
          desc: "7 steps, about 12 minutes",
          href: "/apply",
          icon: ClipboardCheck,
        },
        {
          label: "Plans and pricing",
          desc: "Commission from 20% to 8%",
          href: "/pricing-specialists",
          icon: Crown,
        },
        {
          label: "LSSPM League",
          desc: "One file, recognised by the League and U.Psy",
          href: "/campaigns/lsspm",
          icon: Award,
        },
        {
          label: "Academy",
          desc: "Continuing education for practitioners",
          href: "/academy",
          icon: GraduationCap,
        },
      ],
    },
    {
      id: "training",
      label: "Learning",
      intro: "Learn with the network's clinicians.",
      href: "/center",
      icon: GraduationCap,
      items: [
        {
          label: "Training centre",
          desc: "Spaces, discussions, communities",
          href: "/center",
          icon: Users,
        },
        {
          label: "Schools",
          desc: "Pathways by discipline",
          href: "/center/schools",
          icon: Landmark,
        },
        {
          label: "Courses",
          desc: "Cohort-based or self-paced",
          href: "/learn",
          icon: BookOpen,
        },
        {
          label: "Certifications",
          desc: "Performance psychology pathways",
          href: "/learn?tab=certifications",
          icon: Award,
        },
        {
          label: "Community",
          desc: "Learn together",
          href: "/skool",
          icon: MessageCircle,
        },
      ],
    },
    {
      id: "about",
      label: "About",
      intro: "Who we are and why.",
      href: "/about",
      icon: Heart,
      items: [
        { label: "Our story", href: "/about", icon: Heart },
        { label: "The founder", href: "/founder", icon: Award },
        { label: "Why U.Psy", href: "/why-us", icon: ShieldCheck },
        { label: "The pitch", href: "/pitch", icon: Presentation },
        { label: "Membership", href: "/membership", icon: Crown },
        {
          label: "The Moroccan Umbrella",
          href: "/moroccan-umbrella",
          icon: Umbrella,
        },
        {
          label: "Psychologues Sans Frontières",
          href: "/psf",
          icon: Heart,
        },
        { label: "Press", href: "/press", icon: Megaphone },
        { label: "Contact", href: "/contact", icon: MessageCircle },
      ],
    },
  ],
};

const AR: NavCopy = {
  menuTitle: "القائمة",
  primaryCta: { label: "ابحث عن أخصائي نفسي", href: "/psychologists" },
  secondaryCta: { label: "مؤشر مجاني · دقيقتان", href: "/free-score" },
  settings: "التفضيلات",
  account: "حسابي",
  quickLinks: [
    { label: "المدونة", href: "/blog", icon: BookOpen },
    { label: "العرض التقديمي", href: "/pitch", icon: Presentation },
    { label: "اتصل بنا", href: "/contact", icon: MessageCircle },
  ],
  sections: [
    {
      id: "care",
      label: "المرافقة",
      intro: "اعثر على الأخصائي المناسب وابدأ.",
      href: "/psychologists",
      icon: HeartPulse,
      items: [
        {
          label: "ابحث عن أخصائي نفسي",
          desc: "ملفات موثَّقة، عن بعد أو في العيادة",
          href: "/psychologists",
          icon: Stethoscope,
        },
        {
          label: "احصل على توجيه",
          desc: "بضعة أسئلة، ملفات مناسبة",
          href: "/get-matched",
          icon: Compass,
        },
        {
          label: "مؤشر الأداء الذهني",
          desc: "مجاني، 12 سؤالاً، دقيقتان",
          href: "/free-score",
          icon: Gauge,
        },
        {
          label: "التقييم الذاتي",
          desc: "استبيانات معتمدة (GAD-7، PHQ-9)",
          href: "/assessment-lab",
          icon: ClipboardCheck,
        },
        {
          label: "أخصائي نفسي عبر الإنترنت",
          desc: "جلسات فيديو أينما كنت",
          href: "/psychologue-en-ligne",
          icon: Video,
        },
        {
          label: "أخصائي نفسي حسب المدينة",
          desc: "الدار البيضاء، الرباط، مراكش…",
          href: "/psychologue",
          icon: MapPin,
        },
        {
          label: "البرامج",
          desc: "بروتوكولات منظمة حسب الهدف",
          href: "/services",
          icon: BookOpen,
        },
      ],
    },
    {
      id: "athletes",
      label: "الرياضيون",
      intro: "درّب الذهن كما تدرّب الجسد.",
      href: "/for-athletes",
      icon: Trophy,
      items: [
        {
          label: "لماذا U.Psy للرياضيين",
          desc: "المنهج، الأدلة، المرافقة",
          href: "/for-athletes",
          icon: Trophy,
        },
        {
          label: "Athlete Hub",
          desc: "الجاهزية اليومية، اليوميات، البروتوكولات",
          href: "/athlete-hub",
          icon: Activity,
        },
        {
          label: "الصلابة الذهنية",
          desc: "درّب الذهن الذي يقود الجسد",
          href: "/mental-toughness-athletes",
          icon: Brain,
        },
        {
          label: "المدرب الذكي (نور)",
          desc: "تأمل موجَّه بين الجلسات",
          href: "/ai-assistant",
          icon: Sparkles,
        },
        {
          label: "المرصد",
          desc: "بيانات مفتوحة عن الصحة النفسية",
          href: "/observatoire",
          icon: LineChart,
        },
      ],
    },
    {
      id: "organizations",
      label: "المؤسسات",
      intro: "الأندية، الجامعات الرياضية، الشركات، المدارس.",
      href: "/for-organizations",
      icon: Building2,
      items: [
        {
          label: "للمؤسسات",
          desc: "وصول سري، بيانات مجمَّعة",
          href: "/for-organizations",
          icon: Users,
        },
        {
          label: "الاستشارة والبرامج",
          desc: "الرياضة، العمل، الجامعة",
          href: "/services/consulting-for-organizations",
          icon: Building2,
        },
        {
          label: "احجز مكالمة",
          desc: "30 دقيقة لتحديد تجربة أولى",
          href: "/book-a-call",
          icon: CalendarCheck,
        },
        {
          label: "العرض للشركات",
          desc: "المشكلة، الحل، الأرقام، المصادر",
          href: "/pitch?for=company",
          icon: Presentation,
        },
        {
          label: "قطب المواهب والابتكار",
          desc: "البحث والعلوم التطبيقية",
          href: "/talent-innovation-hub",
          icon: Sparkles,
        },
        {
          label: "طلب حساب مؤسسة",
          desc: "افتح حساباً لمؤسستك",
          href: "/apply/organization",
          icon: Landmark,
        },
      ],
    },
    {
      id: "psychologists",
      label: "الأخصائيون",
      intro: "انضم إلى الشبكة وطوّر عيادتك.",
      href: "/campaigns/join-specialist",
      icon: ShieldCheck,
      items: [
        {
          label: "انضم إلى الشبكة",
          desc: "0٪ عمولة خلال 3 أشهر",
          href: "/campaigns/join-specialist",
          icon: UserPlus,
        },
        {
          label: "قدّم ملفي",
          desc: "7 مراحل، حوالي 12 دقيقة",
          href: "/apply",
          icon: ClipboardCheck,
        },
        {
          label: "الباقات والأسعار",
          desc: "عمولة من 20٪ إلى 8٪",
          href: "/pricing-specialists",
          icon: Crown,
        },
        {
          label: "رابطة LSSPM",
          desc: "ملف واحد تعترف به الرابطة وU.Psy",
          href: "/campaigns/lsspm",
          icon: Award,
        },
        {
          label: "الأكاديمية",
          desc: "التكوين المستمر للممارسين",
          href: "/academy",
          icon: GraduationCap,
        },
      ],
    },
    {
      id: "training",
      label: "التكوين",
      intro: "تعلّم مع أطباء الشبكة.",
      href: "/center",
      icon: GraduationCap,
      items: [
        {
          label: "مركز التكوين",
          desc: "فضاءات، نقاشات، مجتمعات",
          href: "/center",
          icon: Users,
        },
        {
          label: "المدارس",
          desc: "مسارات حسب التخصص",
          href: "/center/schools",
          icon: Landmark,
        },
        {
          label: "الدورات",
          desc: "ضمن مجموعة أو بإيقاعك",
          href: "/learn",
          icon: BookOpen,
        },
        {
          label: "الشهادات",
          desc: "مسارات علم نفس الأداء",
          href: "/learn?tab=certifications",
          icon: Award,
        },
        {
          label: "المجتمع",
          desc: "نتعلم معاً",
          href: "/skool",
          icon: MessageCircle,
        },
      ],
    },
    {
      id: "about",
      label: "من نحن",
      intro: "من نحن ولماذا.",
      href: "/about",
      icon: Heart,
      items: [
        { label: "قصتنا", href: "/about", icon: Heart },
        { label: "المؤسس", href: "/founder", icon: Award },
        { label: "لماذا U.Psy", href: "/why-us", icon: ShieldCheck },
        { label: "العرض التقديمي", href: "/pitch", icon: Presentation },
        { label: "العضوية", href: "/membership", icon: Crown },
        {
          label: "المظلة المغربية",
          href: "/moroccan-umbrella",
          icon: Umbrella,
        },
        {
          label: "Psychologues Sans Frontières",
          href: "/psf",
          icon: Heart,
        },
        { label: "الصحافة", href: "/press", icon: Megaphone },
        { label: "اتصل بنا", href: "/contact", icon: MessageCircle },
      ],
    },
  ],
};

const COPY: Record<Locale, NavCopy> = { en: EN, fr: FR, ar: AR };

export function getNav(locale: string): NavCopy {
  return COPY[(locale as Locale) in COPY ? (locale as Locale) : "fr"];
}
