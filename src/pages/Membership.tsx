import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { Check, Sparkles, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import {
  useMembershipPlans,
  useCurrentTier,
  type MembershipPlan,
} from "@/hooks/useMembership";

const FEATURE_LABELS: Record<string, string> = {
  community_read: "Community read access",
  lessons_per_month: "Lessons / month",
  ai_messages_per_day: "AI messages / day",
  mood_log: "Mood & energy log",
  full_library: "Full lesson library",
  cohorts: "Cohort access",
  certificate_prep: "Certification prep",
  athlete_hub: "Athlete Hub",
  protocols: "Performance protocols",
  ai_coach: "AI performance coach",
  readiness_analytics: "Readiness analytics",
  team_dashboard: "Team dashboard (athletes)",
  session_feedback: "Session feedback tools",
  pro_community: "Practitioners community",
  ce_credits: "CE credits",
  supervision_groups: "Supervision groups",
  custom_pricing: "Custom pricing",
  multi_seat: "Multi-seat workspace",
  branded_portal: "Branded portal",
  pulse: "Org pulse surveys",
  sso: "SAML SSO",
  mentor_matching: "Mentor matching",
  mastermind: "Private mastermind",
  white_glove_ai: "White-glove AI",
  all_features: "Every feature, always",
  scholarship: "Funds Student scholarships",
};

const renderFeatureValue = (v: unknown) => {
  if (v === true) return null;
  if (typeof v === "number") return ` — ${v}`;
  if (typeof v === "string") return ` — ${v}`;
  return null;
};

const TIER_ACCENT: Record<string, string> = {
  discover: "from-muted/40 to-muted/10",
  student: "from-blue-500/10 to-cyan-500/5",
  athlete: "from-emerald-500/10 to-cyan-500/5",
  coach: "from-amber-500/10 to-orange-500/5",
  practitioner: "from-primary/15 to-accent/5",
  organization: "from-violet-500/10 to-fuchsia-500/5",
  elite: "from-yellow-500/20 via-amber-500/10 to-primary/10",
};

const Membership = () => {
  const [annual, setAnnual] = useState(false);
  const { data: plans, isLoading } = useMembershipPlans();
  const { tier: currentTier } = useCurrentTier();

  return (
    <main className="min-h-screen">
      <SEOHead
        path="/membership"
        title="Membership — U.Psy Performance Psychology System"
        description="Choose your tier: Discover, Student, Athlete, Coach, Practitioner, Organization, or Elite. Unlock community, protocols, AI coaching, certifications and more."
      />

      {/* Hero */}
      <section className="section-spacing">
        <div className="container-custom text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Performance Psychology System
          </Badge>
          <h1 className="text-h1 font-bold mb-4">
            One platform. Seven ways to grow.
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            From a free entry point to elite mastermind access, every tier opens
            a new layer of the U.Psy ecosystem — community, learning,
            performance protocols, certifications, and AI guidance.
          </p>
          <div className="inline-flex items-center gap-3 rounded-u-md border border-border/50 bg-card/60 px-4 py-2 backdrop-blur">
            <span className={!annual ? "font-semibold" : "text-muted-foreground"}>
              Monthly
            </span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={annual ? "font-semibold" : "text-muted-foreground"}>
              Annual
            </span>
            <Badge variant="outline" className="ml-1">
              Save 20%
            </Badge>
          </div>
        </div>
      </section>

      {/* Plans grid */}
      <section className="pb-20">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 7 }).map((_, i) => (
                <Card key={i} className="h-96 animate-pulse bg-card/40" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plans?.map((plan) => (
                <PlanCard
                  key={plan.tier}
                  plan={plan}
                  annual={annual}
                  isCurrent={currentTier === plan.tier}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Scholarship band */}
      <section className="pb-24">
        <div className="container-custom">
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/5 p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="rounded-u-md bg-primary/10 p-4 self-start">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-h3 font-semibold mb-2">
                  Elite tier funds Student scholarships
                </h3>
                <p className="text-muted-foreground">
                  Each Elite membership covers one free Student seat for a young
                  practitioner who otherwise could not afford access. Prestige
                  with purpose.
                </p>
              </div>
              <Button asChild size="lg">
                <Link to="/contact">Learn about scholarships</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
};

const PlanCard = ({
  plan,
  annual,
  isCurrent,
}: {
  plan: MembershipPlan;
  annual: boolean;
  isCurrent: boolean;
}) => {
  const isOrg = plan.tier === "organization";
  const isElite = plan.tier === "elite";
  const price = annual ? plan.price_annual_mad : plan.price_monthly_mad;
  const cycle = annual ? "/year" : "/month";

  return (
    <Card
      className={`relative overflow-hidden p-6 flex flex-col bg-gradient-to-br ${TIER_ACCENT[plan.tier]} border-border/50 ${
        isElite ? "ring-2 ring-amber-500/40 shadow-lg" : ""
      }`}
    >
      {isElite && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-500 text-background text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-u-sm">
          Most premium
        </div>
      )}
      {isCurrent && (
        <Badge variant="secondary" className="absolute top-4 left-4">
          Current
        </Badge>
      )}

      <div className="mt-6 mb-4">
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>
      </div>

      <div className="mb-6">
        {isOrg ? (
          <div className="text-3xl font-bold">Custom</div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-sm text-muted-foreground">MAD{cycle}</span>
          </div>
        )}
      </div>

      <ul className="space-y-2.5 flex-1 mb-6">
        {Object.entries(plan.features).map(([key, val]) => {
          const label = FEATURE_LABELS[key] ?? key.replace(/_/g, " ");
          return (
            <li key={key} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>
                {label}
                {renderFeatureValue(val)}
              </span>
            </li>
          );
        })}
      </ul>

      <Button
        asChild
        variant={isElite ? "default" : "outline"}
        className="w-full"
        disabled={isCurrent}
      >
        <Link to={isOrg ? "/contact" : "/auth"}>
          {isCurrent ? "Current plan" : isOrg ? "Talk to sales" : "Get started"}
        </Link>
      </Button>
    </Card>
  );
};

export default Membership;