import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { PlanComparisonGrid } from "@/components/dashboard/PlanComparisonGrid";
import SEOHead from "@/components/SEOHead";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";

const COPY = {
  en: {
    seoTitle: "Plans & Pricing for Specialists | U.Psy",
    seoDescription:
      "Choose the plan that fits your practice: Free, Pro or Elite. Pay only when you grow.",
    title: "Build your practice on U.Psy",
    sub: "Free to get listed. Upgrade when you're ready for more visibility, deeper analytics and clinical AI tools that save you hours every week.",
    cards: [
      ["Lower commission as you grow", "20% on Free, down to 8% on Elite."],
      [
        "Clinical AI tools",
        "Session summaries and the Nour assistant on Pro and Elite.",
      ],
      ["Cancel anytime", "No lock-in. Switch plans from your dashboard."],
    ],
    newHere: "New to U.Psy? Apply to join the directory: it's free.",
    apply: "Apply as a specialist",
    manage: "Manage my plan",
    note: "Prices in MAD. During the launch, paid plans are activated by our team and paid by bank transfer: write to contact@upsy.ma.",
  },
  fr: {
    seoTitle: "Formules et tarifs pour les spécialistes | U.Psy",
    seoDescription:
      "Choisissez la formule adaptée à votre cabinet : Gratuit, Pro ou Elite. Vous ne payez que quand vous grandissez.",
    title: "Développez votre cabinet sur U.Psy",
    sub: "Le référencement est gratuit. Passez à la formule supérieure quand vous voulez plus de visibilité, des statistiques détaillées et des outils cliniques d'IA qui vous font gagner des heures chaque semaine.",
    cards: [
      [
        "Une commission qui baisse",
        "20 % en formule Gratuite, jusqu'à 8 % en Elite.",
      ],
      [
        "Outils cliniques d'IA",
        "Synthèses de séance et assistant Nour en Pro et Elite.",
      ],
      [
        "Sans engagement",
        "Changez de formule à tout moment depuis votre tableau de bord.",
      ],
    ],
    newHere:
      "Nouveau sur U.Psy ? Candidatez pour rejoindre l'annuaire : c'est gratuit.",
    apply: "Candidater comme spécialiste",
    manage: "Gérer ma formule",
    note: "Prix en MAD. Pendant le lancement, les formules payantes sont activées par notre équipe et réglées par virement : écrivez à contact@upsy.ma.",
  },
  ar: {
    seoTitle: "الصيغ والأسعار للمختصين | U.Psy",
    seoDescription:
      "اختر الصيغة المناسبة لعيادتك: مجانية أو Pro أو Elite. لا تدفع إلا عندما تنمو.",
    title: "طوّر عيادتك على U.Psy",
    sub: "الإدراج مجاني. انتقل إلى صيغة أعلى حين تريد ظهورًا أكبر وإحصائيات مفصلة وأدوات إكلينيكية بالذكاء الاصطناعي توفر لك ساعات كل أسبوع.",
    cards: [
      ["عمولة تنخفض كلما نموت", "20٪ في الصيغة المجانية، حتى 8٪ في Elite."],
      [
        "أدوات إكلينيكية بالذكاء الاصطناعي",
        "ملخصات الحصص والمساعد نور في Pro وElite.",
      ],
      ["دون التزام", "غيّر صيغتك في أي وقت من لوحة القيادة."],
    ],
    newHere: "جديد على U.Psy؟ قدّم طلبك للانضمام إلى الدليل: مجانًا.",
    apply: "قدّم طلبك كمختص",
    manage: "إدارة صيغتي",
    note: "الأسعار بالدرهم. خلال فترة الإطلاق، يفعّل فريقنا الصيغ المدفوعة ويتم الأداء بالتحويل البنكي: راسلنا على contact@upsy.ma.",
  },
};

const ICONS = [TrendingUp, Zap, ShieldCheck];

const SpecialistPricing = () => {
  const { locale } = useLocale();
  const c = COPY[locale === "ar" ? "ar" : locale === "en" ? "en" : "fr"];
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        path="/pricing-specialists"
        title={c.seoTitle}
        description={c.seoDescription}
      />

      <div className="container-custom py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            {c.title}
          </h1>
          <p className="text-lg text-muted-foreground">{c.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto mb-10 text-sm">
          {c.cards.map(([title, body], i) => {
            const Icon = ICONS[i];
            return (
              <Card
                key={title}
                className="p-4 flex items-start gap-3 bg-surface border-border"
              >
                <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{body}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <PlanComparisonGrid variant="marketing" />

        <div className="mt-12 text-center space-y-3">
          <p className="text-muted-foreground">{c.newHere}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-1.5">
              <Link to={addLocalePrefix("/campaigns/join-specialist", locale)}>
                {c.apply} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={addLocalePrefix("/my-space?tab=plans", locale)}>
                {c.manage}
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground max-w-xl mx-auto">
          {c.note}
        </p>
      </div>
    </div>
  );
};

export default SpecialistPricing;
