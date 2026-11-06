import SEOHead from "@/components/SEOHead";
import { useLocale } from "@/contexts/LocaleContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import {
  Brain,
  Trophy,
  ClipboardList,
  HeartHandshake,
  Landmark,
  Globe2,
  Presentation,
  Building2,
  FlaskConical,
  Sparkles,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Scale,
} from "lucide-react";

const SCHOOL_ICONS = [
  Brain,
  Trophy,
  ClipboardList,
  HeartHandshake,
  Landmark,
  Globe2,
  Presentation,
  Building2,
  FlaskConical,
  Sparkles,
  Briefcase,
];

const COPY = {
  en: {
    seoTitle: "Schools & Academies — U.Psy Training Center",
    seoDescription:
      "Eleven schools spanning clinical psychology, sport performance, psychometrics, social work, civic leadership, humanitarian practice, research and AI — one integrated academy.",
    badge: "Training Center",
    title: "One academy. Eleven schools.",
    sub: "Clinical care, sport performance, psychometrics, social work, civic leadership, humanitarian practice, research and AI — connected under a single progression: Foundation → Practitioner → Specialist → Advanced → Expert/CPD.",
    browse: "Browse courses",
    tiers: "See membership tiers",
    archTitle: "Master School Architecture",
    civicBadge: "Civic & Social Impact Academy",
    civicTitle: "Political, social-worker, community and humanitarian training",
    civicSub:
      "A dedicated home for political and social-work training — non-partisan, psychologically informed, socially responsible and evidence-based. Educational certificates here are clearly distinguished from regulated professional licensure.",
    civicNote:
      "Political education stays non-partisan and evidence-based. Social-work certificates document educational achievement — not a substitute for regulated professional licensure.",
    flagTitle: "Flagship pathways",
    flagSub:
      "The first certificates and certifications launching across the Training Center.",
    ctaTitle: "Certificates, not shortcuts",
    ctaSub:
      "Every pathway is competency-based, with practical evidence required for advanced credentials. Explore courses, certifications, and membership to find your path.",
    ctaCert: "Explore certifications",
    ctaBack: "Back to Training Center",
    schools: [
      {
        name: "Clinical Psychology & Mental Health",
        domains:
          "Clinical practice, psychopathology, assessment, CBT, ACT, Schema, psychodynamic, trauma, EMDR foundations",
        audience: "Psychology & mental-health learners",
      },
      {
        name: "Sport, Performance & Expertise",
        domains:
          "Sport psychology, mental skills, mental strength, expertise, combat sports",
        audience: "Athletes, coaches, performance professionals",
      },
      {
        name: "Psychometrics & Assessment",
        domains:
          "Measurement, validity, reliability, screening, personality, wellbeing, organizational assessment",
        audience: "Psychologists, researchers, HR",
      },
      {
        name: "Social Work & Community Development",
        domains:
          "Social diagnosis, case management, safeguarding, youth, community development",
        audience: "Social workers, NGOs, community practitioners",
      },
      {
        name: "Political Psychology & Civic Leadership",
        domains:
          "Political psychology, leadership, civic engagement, public communication, negotiation",
        audience: "Civic leaders, youth, NGOs",
      },
      {
        name: "MHPSS, Humanitarian & NGO Practice",
        domains: "PFA, MHPSS, trauma, migration, humanitarian practice, MEAL",
        audience: "NGO / humanitarian workers",
      },
      {
        name: "Education, Training & TOT",
        domains:
          "Adult learning, training engineering, facilitation, evaluation",
        audience: "Trainers, educators, school leaders",
      },
      {
        name: "Organizational Psychology & Leadership",
        domains: "Workplace wellbeing, burnout, leadership, teams, HR",
        audience: "HR, managers, consultants",
      },
      {
        name: "Research & Applied Science",
        domains:
          "Research methods, statistics, neuroscience, computational approaches",
        audience: "Researchers, students, PhD candidates",
      },
      {
        name: "AI, Digital Psychology & Innovation",
        domains:
          "AI literacy, digital mental health, ethics, automation, product design",
        audience: "Professionals, founders, researchers",
      },
      {
        name: "Psychology & Social Entrepreneurship",
        domains: "Practice management, business models, branding, partnerships",
        audience: "Psychologists, trainers, founders",
      },
    ],
    civic: [
      {
        name: "Political Psychology",
        detail:
          "Political attitudes, group identity, polarization, collective behavior, social influence",
      },
      {
        name: "Civic Leadership",
        detail:
          "Ethical leadership, public speaking, negotiation, mediation, coalition building",
      },
      {
        name: "Public Affairs",
        detail:
          "Governance, public policy, policy analysis, public consultation, institutions",
      },
      {
        name: "Civic Engagement",
        detail:
          "Civic education, advocacy, youth engagement, community organizing",
      },
      {
        name: "Political Communication",
        detail:
          "Strategic communication, media literacy, debate, crisis communication",
      },
      {
        name: "Social Work Foundations",
        detail:
          "Social diagnosis, vulnerability, inclusion, social determinants",
      },
      {
        name: "Case Management",
        detail:
          "Intake, assessment, case plan, referral, follow-up, documentation",
      },
      {
        name: "Youth & Child Protection",
        detail:
          "Safeguarding, child protection, adolescent development, school intervention",
      },
      {
        name: "Community Development",
        detail:
          "Participatory diagnosis, mobilization, social cohesion, peer programs",
      },
      {
        name: "Humanitarian Social Work",
        detail:
          "Migration, refugees, displacement, protection, psychosocial support",
      },
      {
        name: "MHPSS & NGO Practice",
        detail:
          "PFA, MHPSS, trauma-informed practice, crisis response, NGO delivery",
      },
      {
        name: "MEAL & Social Impact",
        detail: "Monitoring, evaluation, accountability, learning, indicators",
      },
    ],
    flagship: [
      {
        name: "Sport & Performance Psychology Certificate",
        why: "Strong differentiation and existing expertise",
      },
      {
        name: "Psychometrics & Psychological Assessment",
        why: "Connects the assessment lab to structured learning",
      },
      {
        name: "Training of Trainers",
        why: "Existing content base and institutional demand",
      },
      {
        name: "Social Work & Case Management",
        why: "Opens applied training for social workers",
      },
      {
        name: "MHPSS & NGO Practice",
        why: "Connects U.Psy to humanitarian and NGO work",
      },
      {
        name: "Political Psychology & Civic Leadership",
        why: "Distinctive civic and social-impact positioning",
      },
      {
        name: "Clinical Psychology Foundations",
        why: "Core psychology pathway",
      },
      {
        name: "AI for Psychology & Social Impact",
        why: "Future-facing differentiator",
      },
    ],
  },
  fr: {
    seoTitle: "Écoles et académies | Centre de formation U.Psy",
    seoDescription:
      "Onze écoles : psychologie clinique, performance sportive, psychométrie, travail social, leadership citoyen, pratique humanitaire, recherche et IA, réunies dans une même académie.",
    badge: "Centre de formation",
    title: "Une académie. Onze écoles.",
    sub: "Soin clinique, performance sportive, psychométrie, travail social, leadership citoyen, pratique humanitaire, recherche et IA, reliés par une même progression : Fondamentaux → Praticien → Spécialiste → Avancé → Expert / formation continue.",
    browse: "Voir les cours",
    tiers: "Voir les formules d'adhésion",
    archTitle: "L'architecture des écoles",
    civicBadge: "Académie citoyenne et d'impact social",
    civicTitle:
      "Formations politiques, en travail social, communautaires et humanitaires",
    civicSub:
      "Un lieu dédié aux formations politiques et en travail social : non partisanes, éclairées par la psychologie, socialement responsables et fondées sur les preuves. Les certificats délivrés ici sont clairement distincts des habilitations professionnelles réglementées.",
    civicNote:
      "L'éducation politique reste non partisane et fondée sur les preuves. Les certificats en travail social attestent d'un parcours de formation : ils ne remplacent pas une habilitation professionnelle réglementée.",
    flagTitle: "Parcours phares",
    flagSub:
      "Les premiers certificats et certifications lancés au sein du Centre de formation.",
    ctaTitle: "Des certificats, pas des raccourcis",
    ctaSub:
      "Chaque parcours est fondé sur les compétences, avec des preuves pratiques exigées pour les titres avancés. Explorez les cours, les certifications et l'adhésion pour trouver votre voie.",
    ctaCert: "Voir les certifications",
    ctaBack: "Retour au Centre de formation",
    schools: [
      {
        name: "Psychologie clinique et santé mentale",
        domains:
          "Pratique clinique, psychopathologie, évaluation, TCC, ACT, thérapie des schémas, psychodynamique, trauma, bases de l'EMDR",
        audience: "Étudiants en psychologie et en santé mentale",
      },
      {
        name: "Sport, performance et expertise",
        domains:
          "Psychologie du sport, habiletés mentales, force mentale, expertise, sports de combat",
        audience: "Sportifs, entraîneurs, professionnels de la performance",
      },
      {
        name: "Psychométrie et évaluation",
        domains:
          "Mesure, validité, fidélité, dépistage, personnalité, bien-être, évaluation en organisation",
        audience: "Psychologues, chercheurs, RH",
      },
      {
        name: "Travail social et développement communautaire",
        domains:
          "Diagnostic social, gestion de cas, protection, jeunesse, développement communautaire",
        audience: "Travailleurs sociaux, ONG, acteurs de terrain",
      },
      {
        name: "Psychologie politique et leadership citoyen",
        domains:
          "Psychologie politique, leadership, engagement citoyen, communication publique, négociation",
        audience: "Leaders citoyens, jeunes, ONG",
      },
      {
        name: "SMSPS, humanitaire et pratique en ONG",
        domains: "PSP, SMSPS, trauma, migration, pratique humanitaire, MEAL",
        audience: "Personnels d'ONG et de l'humanitaire",
      },
      {
        name: "Éducation, formation et formation de formateurs",
        domains: "Andragogie, ingénierie de formation, animation, évaluation",
        audience: "Formateurs, enseignants, chefs d'établissement",
      },
      {
        name: "Psychologie organisationnelle et leadership",
        domains:
          "Bien-être au travail, épuisement professionnel, leadership, équipes, RH",
        audience: "RH, managers, consultants",
      },
      {
        name: "Recherche et science appliquée",
        domains:
          "Méthodes de recherche, statistiques, neurosciences, approches computationnelles",
        audience: "Chercheurs, étudiants, doctorants",
      },
      {
        name: "IA, psychologie numérique et innovation",
        domains:
          "Culture de l'IA, santé mentale numérique, éthique, automatisation, conception de produits",
        audience: "Professionnels, fondateurs, chercheurs",
      },
      {
        name: "Psychologie et entrepreneuriat social",
        domains:
          "Gestion de cabinet, modèles économiques, image de marque, partenariats",
        audience: "Psychologues, formateurs, fondateurs",
      },
    ],
    civic: [
      {
        name: "Psychologie politique",
        detail:
          "Attitudes politiques, identité de groupe, polarisation, comportements collectifs, influence sociale",
      },
      {
        name: "Leadership citoyen",
        detail:
          "Leadership éthique, prise de parole, négociation, médiation, construction de coalitions",
      },
      {
        name: "Affaires publiques",
        detail:
          "Gouvernance, politiques publiques, analyse des politiques, consultation publique, institutions",
      },
      {
        name: "Engagement citoyen",
        detail:
          "Éducation civique, plaidoyer, engagement des jeunes, organisation communautaire",
      },
      {
        name: "Communication politique",
        detail:
          "Communication stratégique, éducation aux médias, débat, communication de crise",
      },
      {
        name: "Fondamentaux du travail social",
        detail:
          "Diagnostic social, vulnérabilité, inclusion, déterminants sociaux",
      },
      {
        name: "Gestion de cas",
        detail:
          "Accueil, évaluation, plan d'accompagnement, orientation, suivi, documentation",
      },
      {
        name: "Protection de l'enfance et de la jeunesse",
        detail:
          "Protection, protection de l'enfance, développement de l'adolescent, intervention en milieu scolaire",
      },
      {
        name: "Développement communautaire",
        detail:
          "Diagnostic participatif, mobilisation, cohésion sociale, programmes entre pairs",
      },
      {
        name: "Travail social humanitaire",
        detail:
          "Migration, réfugiés, déplacement, protection, soutien psychosocial",
      },
      {
        name: "SMSPS et pratique en ONG",
        detail:
          "PSP, SMSPS, pratique tenant compte du trauma, réponse aux crises, mise en œuvre en ONG",
      },
      {
        name: "MEAL et impact social",
        detail: "Suivi, évaluation, redevabilité, apprentissage, indicateurs",
      },
    ],
    flagship: [
      {
        name: "Certificat de psychologie du sport et de la performance",
        why: "Forte différenciation et expertise existante",
      },
      {
        name: "Psychométrie et évaluation psychologique",
        why: "Relie le laboratoire d'évaluation à une formation structurée",
      },
      {
        name: "Formation de formateurs",
        why: "Contenus existants et demande institutionnelle",
      },
      {
        name: "Travail social et gestion de cas",
        why: "Ouvre la formation appliquée aux travailleurs sociaux",
      },
      {
        name: "SMSPS et pratique en ONG",
        why: "Relie U.Psy au travail humanitaire et associatif",
      },
      {
        name: "Psychologie politique et leadership citoyen",
        why: "Positionnement citoyen et d'impact social distinctif",
      },
      {
        name: "Fondamentaux de la psychologie clinique",
        why: "Parcours central en psychologie",
      },
      {
        name: "IA pour la psychologie et l'impact social",
        why: "Un différenciateur tourné vers l'avenir",
      },
    ],
  },
  ar: {
    seoTitle: "المدارس والأكاديميات | مركز التكوين U.Psy",
    seoDescription:
      "إحدى عشرة مدرسة: علم النفس السريري، الأداء الرياضي، القياس النفسي، العمل الاجتماعي، القيادة المدنية، العمل الإنساني، البحث والذكاء الاصطناعي، في أكاديمية واحدة.",
    badge: "مركز التكوين",
    title: "أكاديمية واحدة. إحدى عشرة مدرسة.",
    sub: "الرعاية السريرية، الأداء الرياضي، القياس النفسي، العمل الاجتماعي، القيادة المدنية، العمل الإنساني، البحث والذكاء الاصطناعي، يجمعها مسار تدرج واحد: الأسس ← ممارس ← متخصص ← متقدم ← خبير / تكوين مستمر.",
    browse: "تصفح الدورات",
    tiers: "اطلع على باقات العضوية",
    archTitle: "هندسة المدارس",
    civicBadge: "أكاديمية المواطنة والأثر الاجتماعي",
    civicTitle: "تكوين سياسي واجتماعي ومجتمعي وإنساني",
    civicSub:
      "فضاء مخصص للتكوين السياسي والعمل الاجتماعي: غير حزبي، مستنير بعلم النفس، مسؤول اجتماعياً وقائم على الأدلة. الشهادات هنا متمايزة بوضوح عن التراخيص المهنية المنظمة.",
    civicNote:
      "يبقى التكوين السياسي غير حزبي وقائماً على الأدلة. شهادات العمل الاجتماعي توثق مساراً تكوينياً، ولا تعوض الترخيص المهني المنظم.",
    flagTitle: "المسارات الرائدة",
    flagSub: "أولى الشهادات التي تنطلق في مركز التكوين.",
    ctaTitle: "شهادات، لا طرق مختصرة",
    ctaSub:
      "كل مسار قائم على الكفايات، مع أدلة تطبيقية مطلوبة للشهادات المتقدمة. استكشف الدورات والشهادات والعضوية لتجد طريقك.",
    ctaCert: "استكشف الشهادات",
    ctaBack: "العودة إلى مركز التكوين",
    schools: [
      {
        name: "علم النفس السريري والصحة النفسية",
        domains:
          "الممارسة السريرية، علم النفس المرضي، التقييم، العلاج المعرفي السلوكي، ACT، علاج المخططات، المقاربة الدينامية، الصدمات، أسس EMDR",
        audience: "متعلمو علم النفس والصحة النفسية",
      },
      {
        name: "الرياضة والأداء والخبرة",
        domains:
          "علم النفس الرياضي، المهارات الذهنية، الصلابة الذهنية، الخبرة، رياضات القتال",
        audience: "رياضيون، مدربون، مهنيو الأداء",
      },
      {
        name: "القياس النفسي والتقييم",
        domains:
          "القياس، الصدق، الثبات، الفحص، الشخصية، الرفاه، التقييم في المؤسسات",
        audience: "أخصائيون نفسيون، باحثون، موارد بشرية",
      },
      {
        name: "العمل الاجتماعي والتنمية المجتمعية",
        domains:
          "التشخيص الاجتماعي، تدبير الحالات، الحماية، الشباب، التنمية المجتمعية",
        audience: "مساعدون اجتماعيون، جمعيات، فاعلون ميدانيون",
      },
      {
        name: "علم النفس السياسي والقيادة المدنية",
        domains:
          "علم النفس السياسي، القيادة، المشاركة المدنية، التواصل العمومي، التفاوض",
        audience: "قادة مدنيون، شباب، جمعيات",
      },
      {
        name: "الصحة النفسية والدعم النفسي الاجتماعي، العمل الإنساني والجمعوي",
        domains:
          "الإسعافات النفسية الأولية، الدعم النفسي الاجتماعي، الصدمات، الهجرة، العمل الإنساني، التتبع والتقييم",
        audience: "العاملون في الجمعيات والعمل الإنساني",
      },
      {
        name: "التربية والتكوين وتكوين المكونين",
        domains: "تعليم الكبار، هندسة التكوين، التنشيط، التقييم",
        audience: "مكونون، مربون، مديرو مؤسسات",
      },
      {
        name: "علم النفس التنظيمي والقيادة",
        domains:
          "الرفاه في العمل، الإنهاك المهني، القيادة، الفرق، الموارد البشرية",
        audience: "موارد بشرية، مسيرون، مستشارون",
      },
      {
        name: "البحث والعلوم التطبيقية",
        domains: "مناهج البحث، الإحصاء، علوم الأعصاب، المقاربات الحاسوبية",
        audience: "باحثون، طلبة، طلبة الدكتوراه",
      },
      {
        name: "الذكاء الاصطناعي وعلم النفس الرقمي والابتكار",
        domains:
          "ثقافة الذكاء الاصطناعي، الصحة النفسية الرقمية، الأخلاقيات، الأتمتة، تصميم المنتجات",
        audience: "مهنيون، مؤسسون، باحثون",
      },
      {
        name: "علم النفس وريادة الأعمال الاجتماعية",
        domains: "تدبير العيادة، النماذج الاقتصادية، الهوية التجارية، الشراكات",
        audience: "أخصائيون نفسيون، مكونون، مؤسسون",
      },
    ],
    civic: [
      {
        name: "علم النفس السياسي",
        detail:
          "المواقف السياسية، هوية الجماعة، الاستقطاب، السلوك الجماعي، التأثير الاجتماعي",
      },
      {
        name: "القيادة المدنية",
        detail: "القيادة الأخلاقية، الخطابة، التفاوض، الوساطة، بناء التحالفات",
      },
      {
        name: "الشؤون العامة",
        detail:
          "الحكامة، السياسات العمومية، تحليل السياسات، التشاور العمومي، المؤسسات",
      },
      {
        name: "المشاركة المدنية",
        detail: "التربية المدنية، الترافع، إشراك الشباب، التنظيم المجتمعي",
      },
      {
        name: "التواصل السياسي",
        detail:
          "التواصل الاستراتيجي، التربية الإعلامية، المناظرة، تواصل الأزمات",
      },
      {
        name: "أسس العمل الاجتماعي",
        detail: "التشخيص الاجتماعي، الهشاشة، الإدماج، المحددات الاجتماعية",
      },
      {
        name: "تدبير الحالات",
        detail: "الاستقبال، التقييم، خطة المرافقة، الإحالة، التتبع، التوثيق",
      },
      {
        name: "حماية الطفولة والشباب",
        detail: "الحماية، حماية الطفل، نمو المراهق، التدخل في الوسط المدرسي",
      },
      {
        name: "التنمية المجتمعية",
        detail: "التشخيص التشاركي، التعبئة، التماسك الاجتماعي، برامج الأقران",
      },
      {
        name: "العمل الاجتماعي الإنساني",
        detail: "الهجرة، اللاجئون، النزوح، الحماية، الدعم النفسي الاجتماعي",
      },
      {
        name: "الدعم النفسي الاجتماعي والعمل الجمعوي",
        detail:
          "الإسعافات النفسية الأولية، الدعم النفسي الاجتماعي، ممارسة واعية بالصدمات، الاستجابة للأزمات، التنفيذ الجمعوي",
      },
      {
        name: "التتبع والتقييم والأثر الاجتماعي",
        detail: "التتبع، التقييم، المساءلة، التعلم، المؤشرات",
      },
    ],
    flagship: [
      {
        name: "شهادة علم النفس الرياضي وعلم نفس الأداء",
        why: "تميز قوي وخبرة قائمة",
      },
      {
        name: "القياس النفسي والتقييم النفسي",
        why: "يربط مختبر التقييم بتكوين منظم",
      },
      { name: "تكوين المكونين", why: "محتوى قائم وطلب مؤسساتي" },
      {
        name: "العمل الاجتماعي وتدبير الحالات",
        why: "يفتح التكوين التطبيقي للمساعدين الاجتماعيين",
      },
      {
        name: "الدعم النفسي الاجتماعي والعمل الجمعوي",
        why: "يربط U.Psy بالعمل الإنساني والجمعوي",
      },
      {
        name: "علم النفس السياسي والقيادة المدنية",
        why: "تموضع مدني واجتماعي متميز",
      },
      { name: "أسس علم النفس السريري", why: "مسار أساسي في علم النفس" },
      {
        name: "الذكاء الاصطناعي لعلم النفس والأثر الاجتماعي",
        why: "ميزة متجهة نحو المستقبل",
      },
    ],
  },
};

export default function Schools() {
  const { locale } = useLocale();
  const c = COPY[locale === "ar" ? "ar" : locale === "en" ? "en" : "fr"];
  return (
    <>
      <SEOHead
        path="/center/schools"
        title={c.seoTitle}
        description={c.seoDescription}
      />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1.5" />
            {c.badge}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            {c.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {c.sub}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link to="/learn">{c.browse}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/membership">
                {c.tiers} <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Schools grid */}
        <section className="container mx-auto px-4 pb-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">
            {c.archTitle}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.schools.map((s, i) => {
              const Icon = SCHOOL_ICONS[i];
              return (
                <Card key={s.name} className="glass-card h-full">
                  <CardContent className="p-6 space-y-3">
                    <Icon className="h-8 w-8 text-primary" />
                    <h3 className="font-display text-lg font-semibold leading-snug">
                      {s.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{s.domains}</p>
                    <p className="text-xs text-muted-foreground/80 uppercase tracking-wide">
                      {s.audience}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Civic & Social Impact Academy */}
        <section className="border-y border-border bg-card/40 py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <Badge variant="secondary" className="mb-4">
                <Landmark className="h-3 w-3 mr-1.5" />
                {c.civicBadge}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                {c.civicTitle}
              </h2>
              <p className="text-muted-foreground">{c.civicSub}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {c.civic.map((p) => (
                <Card key={p.name} className="h-full bg-background/60">
                  <CardContent className="p-5 space-y-1.5">
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="max-w-3xl mx-auto mt-8 flex items-start gap-3 rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p>{c.civicNote}</p>
            </div>
          </div>
        </section>

        {/* Flagship launch portfolio */}
        <section className="container mx-auto px-4 py-16 lg:py-20">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {c.flagTitle}
            </h2>
            <p className="text-muted-foreground">{c.flagSub}</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {c.flagship.map((f, i) => (
              <div
                key={f.name}
                className="flex items-start gap-4 rounded-lg border border-border/60 bg-card/40 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-sm font-semibold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-sm">{f.name}</h3>
                  <p className="text-xs text-muted-foreground">{f.why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card/40 py-16 text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <Scale className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              {c.ctaTitle}
            </h2>
            <p className="text-muted-foreground mb-8">{c.ctaSub}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link to="/learn?tab=certifications">{c.ctaCert}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/center">{c.ctaBack}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
