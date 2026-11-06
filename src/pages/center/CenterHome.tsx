import { Link } from "@/lib/router-compat";
import { Users, MessageCircle, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useLocale } from "@/contexts/LocaleContext";
import { useSpaces } from "@/hooks/useCommunity";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import {
  useCurrentTier,
  hasTier,
  TIER_LABEL,
  type MembershipTier,
} from "@/hooks/useMembership";

const COPY = {
  en: {
    seoTitle: "Training Center — Community, Learning & Certifications | U.Psy",
    seoDescription:
      "Premium learning, peer cohorts, expert AMAs, and certification pathways. Join the U.Psy Training Center.",
    badge: "Training Center",
    title: "Learn, connect, become.",
    sub: "Topic communities, cohort-based learning, and expert AMAs — engineered for depth, not noise. No vanity metrics. No infinite scroll. Just people growing together.",
    schools: "Explore the 11 schools & academies",
    spaces: "Spaces",
    yourTier: "Your tier:",
    unlock: "Unlock",
    enter: "Enter",
    types: {
      topic: "Topic",
      cohort: "Cohort",
      region: "Region",
      ama: "AMA",
      private: "Private",
    } as Record<string, string>,
  },
  fr: {
    seoTitle:
      "Centre de formation : communauté, cours et certifications | U.Psy",
    seoDescription:
      "Formations, cohortes entre pairs, sessions de questions avec des experts et parcours de certification. Rejoignez le Centre de formation U.Psy.",
    badge: "Centre de formation",
    title: "Apprendre, échanger, progresser.",
    sub: "Des communautés thématiques, des formations en cohorte et des sessions de questions avec des experts, pensées pour la profondeur, pas le bruit. Pas de métriques de vanité, pas de défilement infini : des personnes qui progressent ensemble.",
    schools: "Découvrir les 11 écoles et académies",
    spaces: "Espaces",
    yourTier: "Votre formule :",
    unlock: "Débloquer",
    enter: "Entrer",
    types: {
      topic: "Thème",
      cohort: "Cohorte",
      region: "Région",
      ama: "Questions-réponses",
      private: "Privé",
    } as Record<string, string>,
  },
  ar: {
    seoTitle: "مركز التكوين: المجتمع، الدورات والشهادات | U.Psy",
    seoDescription:
      "تكوين متميز، مجموعات من الأقران، جلسات أسئلة مع الخبراء ومسارات للشهادات. انضم إلى مركز التكوين U.Psy.",
    badge: "مركز التكوين",
    title: "تعلّم، تواصل، تطوّر.",
    sub: "مجتمعات موضوعاتية، تكوين ضمن مجموعات، وجلسات أسئلة مع الخبراء، مصممة للعمق لا للضجيج. بلا مؤشرات زائفة ولا تمرير لا نهائي: أشخاص يتطورون معاً.",
    schools: "اكتشف المدارس والأكاديميات الـ11",
    spaces: "الفضاءات",
    yourTier: "باقتك:",
    unlock: "افتح",
    enter: "ادخل",
    types: {
      topic: "موضوع",
      cohort: "مجموعة",
      region: "جهة",
      ama: "أسئلة وأجوبة",
      private: "خاص",
    } as Record<string, string>,
  },
};

const CenterHome = () => {
  const { data: spaces, isLoading } = useSpaces();
  const { tier: owned } = useCurrentTier();
  const { locale } = useLocale();
  const loc = useLocalizedField();
  const c = COPY[locale === "ar" ? "ar" : locale === "en" ? "en" : "fr"];

  return (
    <main className="min-h-screen">
      <SEOHead
        path="/center"
        title={c.seoTitle}
        description={c.seoDescription}
      />

      {/* Hero */}
      <section className="section-spacing">
        <div className="container-custom max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1.5" />
            {c.badge}
          </Badge>
          <h1 className="text-h1 font-bold mb-4">{c.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{c.sub}</p>
          <Link
            to="/center/schools"
            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {c.schools} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* Spaces grid */}
      <section className="pb-20">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-h2 font-semibold">{c.spaces}</h2>
            <p className="text-sm text-muted-foreground">
              {c.yourTier}{" "}
              <span className="font-semibold text-foreground">
                {TIER_LABEL[owned]}
              </span>
            </p>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-44 animate-pulse bg-card/40" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {spaces?.map((space) => {
                const locked = !hasTier(
                  owned,
                  space.tier_required as MembershipTier,
                );
                return (
                  <Card
                    key={space.id}
                    className="group relative overflow-hidden p-6 flex flex-col bg-card/60 backdrop-blur border-border/50 hover:border-primary/40 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{space.icon ?? "✦"}</div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">
                          {c.types[space.type] ?? space.type}
                        </Badge>
                        {locked && (
                          <Badge variant="secondary" className="text-[10px]">
                            <Lock className="h-2.5 w-2.5 mr-1" />
                            {TIER_LABEL[space.tier_required as MembershipTier]}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-1.5">
                      {loc(space, "name")}
                    </h3>
                    <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
                      {loc(space, "description")}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {space.member_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {space.post_count}
                        </span>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="group-hover:translate-x-0.5 transition-transform"
                      >
                        <Link
                          to={
                            locked ? "/membership" : `/center/c/${space.slug}`
                          }
                        >
                          {locked ? c.unlock : c.enter}
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default CenterHome;
