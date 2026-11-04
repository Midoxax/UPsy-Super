import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  HeartHandshake,
  ClipboardList,
  Users,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const ICONS = [ClipboardList, GraduationCap, HeartHandshake, Users];
const VALUES = ["247", "2", "138", "109"];

const COPY = {
  en: {
    seoTitle: "Soleterre — School Wellbeing Partnership | U.Psy",
    seoDescription:
      "U.Psy's Soleterre partnership brings PERMA and EPOCH wellbeing assessments to schools in Kenitra and Qaria, screening 247 students to date.",
    title: "Soleterre: student wellbeing, measured.",
    sub: "A school wellbeing partnership bringing PERMA and EPOCH assessments to Moroccan classrooms — starting with Kenitra and Qaria.",
    stats: [
      "Students screened",
      "Partner schools — Kenitra & Qaria",
      "EPOCH assessments",
      "PERMA assessments",
    ],
    pillars: [
      {
        title: "PERMA & EPOCH assessments",
        desc: "Validated wellbeing frameworks — Positive emotion, Engagement, Relationships, Meaning, Accomplishment (PERMA) and Engagement, Perseverance, Optimism, Connectedness, Happiness (EPOCH) — used to screen student wellbeing at scale.",
      },
      {
        title: "School-wide screening",
        desc: "Delivered across Kenitra and Qaria schools, giving educators an anonymized, aggregate picture of student wellbeing rather than individual clinical labels.",
      },
      {
        title: "Clinical follow-through",
        desc: "Findings inform referrals and classroom-level support, connecting schools to U.Psy's network of accredited psychologists when a student needs more than screening.",
      },
      {
        title: "Built for educators",
        desc: "Reporting designed for school staff and counselors — clear, actionable, and respectful of student privacy.",
      },
    ],
  },
  fr: {
    seoTitle: "Soleterre : partenariat bien-être scolaire | U.Psy",
    seoDescription:
      "Le partenariat Soleterre de U.Psy apporte les évaluations de bien-être PERMA et EPOCH aux écoles de Kénitra et de Qaria : 247 élèves évalués à ce jour.",
    title: "Soleterre : le bien-être des élèves, mesuré.",
    sub: "Un partenariat de bien-être scolaire qui apporte les évaluations PERMA et EPOCH dans les classes marocaines, en commençant par Kénitra et Qaria.",
    stats: [
      "Élèves évalués",
      "Écoles partenaires : Kénitra et Qaria",
      "Évaluations EPOCH",
      "Évaluations PERMA",
    ],
    pillars: [
      {
        title: "Évaluations PERMA et EPOCH",
        desc: "Des cadres de bien-être validés : émotions positives, engagement, relations, sens, accomplissement (PERMA) et engagement, persévérance, optimisme, lien, bonheur (EPOCH), pour évaluer le bien-être des élèves à grande échelle.",
      },
      {
        title: "Dépistage à l'échelle de l'école",
        desc: "Mené dans les écoles de Kénitra et de Qaria, il donne aux enseignants une vue anonymisée et agrégée du bien-être des élèves, sans étiquette clinique individuelle.",
      },
      {
        title: "Suivi clinique",
        desc: "Les résultats orientent les accompagnements et le soutien en classe, et relient les écoles au réseau de psychologues vérifiés de U.Psy quand un élève a besoin de plus qu'un dépistage.",
      },
      {
        title: "Pensé pour les équipes éducatives",
        desc: "Des rapports conçus pour les enseignants et les conseillers : clairs, utiles et respectueux de la vie privée des élèves.",
      },
    ],
  },
  ar: {
    seoTitle: "Soleterre: شراكة الرفاه المدرسي | U.Psy",
    seoDescription:
      "تحمل شراكة Soleterre من U.Psy تقييمات الرفاه PERMA وEPOCH إلى مدارس القنيطرة والقرية: 247 تلميذاً تم تقييمهم حتى الآن.",
    title: "Soleterre: رفاه التلاميذ، مقيس.",
    sub: "شراكة للرفاه المدرسي تحمل تقييمات PERMA وEPOCH إلى الأقسام المغربية، بدءاً من القنيطرة والقرية.",
    stats: [
      "تلميذ تم تقييمه",
      "مدرستان شريكتان: القنيطرة والقرية",
      "تقييم EPOCH",
      "تقييم PERMA",
    ],
    pillars: [
      {
        title: "تقييمات PERMA وEPOCH",
        desc: "أطر معتمدة للرفاه: المشاعر الإيجابية، الانخراط، العلاقات، المعنى، الإنجاز (PERMA) والانخراط، المثابرة، التفاؤل، الارتباط، السعادة (EPOCH)، لتقييم رفاه التلاميذ على نطاق واسع.",
      },
      {
        title: "فحص على مستوى المدرسة",
        desc: "يُنجز في مدارس القنيطرة والقرية، ويمنح الأطر التربوية صورة مجهولة الهوية ومجمَّعة عن رفاه التلاميذ، دون تصنيفات سريرية فردية.",
      },
      {
        title: "متابعة سريرية",
        desc: "توجّه النتائج الإحالات والدعم داخل القسم، وتربط المدارس بشبكة الأخصائيين الموثَّقين في U.Psy عندما يحتاج التلميذ إلى أكثر من الفحص.",
      },
      {
        title: "مصمَّم للأطر التربوية",
        desc: "تقارير موجهة للأساتذة والمستشارين: واضحة، عملية، وتحترم خصوصية التلاميذ.",
      },
    ],
  },
};

export default function Soleterre() {
  const { locale } = useLocale();
  const c = COPY[locale === "ar" ? "ar" : locale === "en" ? "en" : "fr"];
  return (
    <>
      <SEOHead
        path="/soleterre"
        title={c.seoTitle}
        description={c.seoDescription}
      />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            {c.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {c.sub}
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {c.stats.map((label, i) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-display font-bold text-primary font-mono tabular-nums">
                {VALUES[i]}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </section>

        <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-6">
          {c.pillars.map((f, i) => {
            const Icon = ICONS[i];
            return (
              <Card key={f.title} className="glass-card">
                <CardContent className="p-6 space-y-2">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="font-display text-lg font-semibold">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </>
  );
}
