// Every public page, grouped. One list for the site-map page (/explore)
// and the XML sitemap, so a page that exists is never left unreachable.
// Add a page here when you add its route.

export type L = { en: string; fr: string; ar: string };

export interface SiteGroup {
  title: L;
  pages: Array<{ path: string; label: L }>;
}

export const SITE_MAP: SiteGroup[] = [
  {
    title: {
      en: "Find care",
      fr: "Trouver un accompagnement",
      ar: "إيجاد المرافقة",
    },
    pages: [
      {
        path: "/psychologists",
        label: {
          en: "Psychologists",
          fr: "Les psychologues",
          ar: "الأخصائيون",
        },
      },
      {
        path: "/get-matched",
        label: { en: "Get matched", fr: "Être orienté", ar: "التوجيه" },
      },
      {
        path: "/psychologue",
        label: {
          en: "Psychologists by city",
          fr: "Psychologue par ville",
          ar: "الأخصائيون حسب المدن",
        },
      },
      {
        path: "/psychologue-en-ligne",
        label: {
          en: "Online, Africa and diaspora",
          fr: "En ligne : Afrique et diaspora",
          ar: "عبر الإنترنت: إفريقيا والجالية",
        },
      },
      {
        path: "/book-a-call",
        label: {
          en: "Book a free call",
          fr: "Appel découverte",
          ar: "مكالمة تعارف",
        },
      },
      {
        path: "/pricing",
        label: { en: "Pricing", fr: "Tarifs", ar: "الأسعار" },
      },
      {
        path: "/services",
        label: { en: "Programs", fr: "Programmes", ar: "البرامج" },
      },
      {
        path: "/free-score",
        label: {
          en: "Free wellbeing score",
          fr: "Score bien-être gratuit",
          ar: "مؤشر الرفاه المجاني",
        },
      },
      {
        path: "/assessment-lab",
        label: {
          en: "Assessment lab",
          fr: "Laboratoire d'évaluation",
          ar: "مختبر التقييم",
        },
      },
      {
        path: "/assessments",
        label: { en: "Assessments", fr: "Évaluations", ar: "الاختبارات" },
      },
      {
        path: "/ai-assistant",
        label: {
          en: "Nour, AI assistant",
          fr: "Nour, assistant IA",
          ar: "نور، المساعد الذكي",
        },
      },
      {
        path: "/membership",
        label: { en: "Membership", fr: "Abonnement", ar: "الاشتراك" },
      },
      {
        path: "/install",
        label: {
          en: "Install the app",
          fr: "Installer l'application",
          ar: "تثبيت التطبيق",
        },
      },
    ],
  },
  {
    title: {
      en: "Sport and performance",
      fr: "Sport et performance",
      ar: "الرياضة والأداء",
    },
    pages: [
      {
        path: "/mental-performance",
        label: {
          en: "Mental performance",
          fr: "Performance mentale",
          ar: "الأداء الذهني",
        },
      },
      {
        path: "/mental-toughness-athletes",
        label: {
          en: "Mental toughness for athletes",
          fr: "Force mentale du sportif",
          ar: "الصلابة الذهنية للرياضيين",
        },
      },
      {
        path: "/for-athletes",
        label: { en: "For athletes", fr: "Pour les sportifs", ar: "للرياضيين" },
      },
      {
        path: "/athlete-hub",
        label: { en: "Athlete Hub", fr: "Espace Athlète", ar: "فضاء الرياضي" },
      },
      {
        path: "/talent-innovation-hub",
        label: {
          en: "Talent and innovation hub",
          fr: "Hub talents et innovation",
          ar: "مركز المواهب والابتكار",
        },
      },
    ],
  },
  {
    title: {
      en: "Organizations and schools",
      fr: "Organisations et écoles",
      ar: "المؤسسات والمدارس",
    },
    pages: [
      {
        path: "/for-organizations",
        label: {
          en: "For organizations",
          fr: "Pour les organisations",
          ar: "للمؤسسات",
        },
      },
      {
        path: "/services/consulting-for-organizations",
        label: { en: "Consulting", fr: "Conseil", ar: "الاستشارات" },
      },
      {
        path: "/apply/organization",
        label: {
          en: "Organization application",
          fr: "Candidature organisation",
          ar: "طلب المؤسسات",
        },
      },
      {
        path: "/center",
        label: {
          en: "Learning center",
          fr: "Centre d'apprentissage",
          ar: "مركز التعلم",
        },
      },
      {
        path: "/center/schools",
        label: {
          en: "Schools and academies",
          fr: "Écoles et académies",
          ar: "المدارس والأكاديميات",
        },
      },
      {
        path: "/soleterre",
        label: {
          en: "Soleterre (schools)",
          fr: "Soleterre (écoles)",
          ar: "سوليتيري (المدارس)",
        },
      },
    ],
  },
  {
    title: { en: "Learn", fr: "Apprendre", ar: "التعلّم" },
    pages: [
      {
        path: "/academy",
        label: {
          en: "U.Psy Academy",
          fr: "U.Psy Academy",
          ar: "أكاديمية U.Psy",
        },
      },
      { path: "/blog", label: { en: "Blog", fr: "Blog", ar: "المدونة" } },
      {
        path: "/resources",
        label: { en: "Resources", fr: "Ressources", ar: "الموارد" },
      },
      {
        path: "/learn",
        label: { en: "Courses", fr: "Formations", ar: "الدورات" },
      },
      {
        path: "/observatoire",
        label: {
          en: "The U.Psy Observatory",
          fr: "L'Observatoire U.Psy",
          ar: "مرصد U.Psy",
        },
      },
      {
        path: "/skool",
        label: { en: "Community", fr: "Communauté", ar: "المجتمع" },
      },
    ],
  },
  {
    title: {
      en: "For psychologists",
      fr: "Pour les psychologues",
      ar: "للأخصائيين",
    },
    pages: [
      {
        path: "/apply",
        label: {
          en: "Join U.Psy",
          fr: "Rejoindre U.Psy",
          ar: "انضم إلى U.Psy",
        },
      },
      {
        path: "/pricing-specialists",
        label: {
          en: "Specialist plans",
          fr: "Offres spécialistes",
          ar: "عروض الأخصائيين",
        },
      },
      {
        path: "/campaigns/join-specialist",
        label: {
          en: "Founding cohort offer",
          fr: "Offre cohorte fondatrice",
          ar: "عرض الدفعة المؤسسة",
        },
      },
      {
        path: "/campaigns/lsspm",
        label: {
          en: "LSSPM × U.Psy",
          fr: "LSSPM × U.Psy",
          ar: "LSSPM × U.Psy",
        },
      },
      {
        path: "/moroccan-umbrella",
        label: {
          en: "Moroccan umbrella",
          fr: "L'ombrelle marocaine",
          ar: "المظلة المغربية",
        },
      },
      {
        path: "/psf",
        label: {
          en: "Psychologists without borders",
          fr: "Psychologues sans frontières",
          ar: "أخصائيون بلا حدود",
        },
      },
    ],
  },
  {
    title: { en: "About U.Psy", fr: "À propos", ar: "حول U.Psy" },
    pages: [
      { path: "/about", label: { en: "About", fr: "À propos", ar: "من نحن" } },
      {
        path: "/founder",
        label: { en: "Founder", fr: "Le fondateur", ar: "المؤسس" },
      },
      {
        path: "/why-us",
        label: { en: "Why U.Psy", fr: "Pourquoi U.Psy", ar: "لماذا U.Psy" },
      },
      {
        path: "/pitch",
        label: { en: "The pitch", fr: "Le pitch", ar: "العرض" },
      },
      { path: "/press", label: { en: "Press", fr: "Presse", ar: "الصحافة" } },
      {
        path: "/brand",
        label: {
          en: "Brand guidelines",
          fr: "Charte graphique",
          ar: "الهوية البصرية",
        },
      },
      {
        path: "/campaigns/first-session",
        label: {
          en: "First-session offer",
          fr: "Offre première séance",
          ar: "عرض الحصة الأولى",
        },
      },
      {
        path: "/contact",
        label: { en: "Contact", fr: "Contact", ar: "اتصل بنا" },
      },
    ],
  },
  {
    title: { en: "Legal", fr: "Mentions légales", ar: "قانوني" },
    pages: [
      {
        path: "/legal",
        label: {
          en: "Legal notice",
          fr: "Mentions légales",
          ar: "الإشعار القانوني",
        },
      },
      {
        path: "/privacy",
        label: { en: "Privacy", fr: "Confidentialité", ar: "الخصوصية" },
      },
      {
        path: "/terms",
        label: { en: "Terms", fr: "Conditions", ar: "الشروط" },
      },
    ],
  },
];
