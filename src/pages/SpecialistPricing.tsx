import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { PlanComparisonGrid } from "@/components/dashboard/PlanComparisonGrid";
import SEOHead from "@/components/SEOHead";

const SpecialistPricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        path="/pricing-specialists"
        title="Plans & Pricing for Specialists | U.Psy"
        description="Choose the plan that fits your practice — Free, Pro, or Elite. Pay only when you grow."
      />

      <div className="container-custom py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <Badge variant="secondary" className="mb-3">
            <Sparkles className="h-3 w-3 mr-1" /> Test mode · mock payments
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
            Build your practice on U.Psy
          </h1>
          <p className="text-lg text-muted-foreground">
            Free to get listed. Upgrade when you're ready for more visibility, deeper analytics,
            and clinical AI tools that save you hours every week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto mb-10 text-sm">
          <Card className="p-4 flex items-start gap-3 bg-surface border-border">
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lower commission as you grow</p>
              <p className="text-muted-foreground text-xs mt-0.5">20% on Free, down to 8% on Elite.</p>
            </div>
          </Card>
          <Card className="p-4 flex items-start gap-3 bg-surface border-border">
            <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unlock AI clinical tools</p>
              <p className="text-muted-foreground text-xs mt-0.5">Session summaries and Nour assistant on Pro+.</p>
            </div>
          </Card>
          <Card className="p-4 flex items-start gap-3 bg-surface border-border">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Cancel anytime</p>
              <p className="text-muted-foreground text-xs mt-0.5">No lock-in. Switch tiers from your dashboard.</p>
            </div>
          </Card>
        </div>

        <PlanComparisonGrid variant="marketing" />

        <div className="mt-12 text-center space-y-3">
          <p className="text-muted-foreground">
            New to U.Psy? Apply to join the directory — it's free.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-1.5">
              <Link to="/apply">
                Apply as a specialist <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/my-space?tab=plans">Manage my plan</Link>
            </Button>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground max-w-xl mx-auto">
          Prices in MAD. Real online payments are not yet active — upgrades on this page run in test mode
          and generate mock invoices for your records.
        </p>
      </div>
    </div>
  );
};

export default SpecialistPricing;