import { Link } from "@/lib/router-compat";
import { Users, MessageCircle, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useSpaces } from "@/hooks/useCommunity";
import {
  useCurrentTier,
  hasTier,
  TIER_LABEL,
  type MembershipTier,
} from "@/hooks/useMembership";

const TYPE_LABEL: Record<string, string> = {
  topic: "Topic",
  cohort: "Cohort",
  region: "Region",
  ama: "AMA",
  private: "Private",
};

const CenterHome = () => {
  const { data: spaces, isLoading } = useSpaces();
  const { tier: owned } = useCurrentTier();

  return (
    <main className="min-h-screen">
      <SEOHead
        path="/center"
        title="Training Center — Community, Learning & Certifications | U.Psy"
        description="Premium learning, peer cohorts, expert AMAs, and certification pathways. Join the U.Psy Training Center."
      />

      {/* Hero */}
      <section className="section-spacing">
        <div className="container-custom max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Training Center
          </Badge>
          <h1 className="text-h1 font-bold mb-4">
            Learn, connect, become.
          </h1>
          <p className="text-lg text-muted-foreground">
            Topic communities, cohort-based learning, and expert AMAs — engineered
            for depth, not noise. No vanity metrics. No infinite scroll. Just
            people growing together.
          </p>
        </div>
      </section>

      {/* Spaces grid */}
      <section className="pb-20">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-h2 font-semibold">Spaces</h2>
            <p className="text-sm text-muted-foreground">
              Your tier:{" "}
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
                const locked = !hasTier(owned, space.tier_required as MembershipTier);
                return (
                  <Card
                    key={space.id}
                    className="group relative overflow-hidden p-6 flex flex-col bg-card/60 backdrop-blur border-border/50 hover:border-primary/40 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{space.icon ?? "✦"}</div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">
                          {TYPE_LABEL[space.type]}
                        </Badge>
                        {locked && (
                          <Badge variant="secondary" className="text-[10px]">
                            <Lock className="h-2.5 w-2.5 mr-1" />
                            {TIER_LABEL[space.tier_required as MembershipTier]}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-1.5">{space.name}</h3>
                    <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
                      {space.description}
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
                        <Link to={locked ? "/membership" : `/center/c/${space.slug}`}>
                          {locked ? "Unlock" : "Enter"}
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