import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles } from "lucide-react";
import { useAllPlans, useAllPlansPublic, type SpecialistPlan } from "@/hooks/useSpecialistPlan";
import { cn } from "@/lib/utils";

interface Props {
  currentPlanId?: string;
  onSelectPlan?: (plan: SpecialistPlan) => void;
  ctaLabel?: (plan: SpecialistPlan) => string;
  /** Layout: "grid" for in-dashboard, "marketing" for the public pricing page */
  variant?: "grid" | "marketing";
}

const FEATURE_ROWS: Array<{ key: string; label: string }> = [
  { key: "search_boost", label: "Search ranking boost" },
  { key: "featured_rail", label: "Featured on homepage" },
  { key: "gallery", label: "Photo gallery" },
  { key: "video_intro", label: "Video introduction" },
  { key: "custom_slug", label: "Custom booking link" },
  { key: "branded_invoice", label: "Branded invoices" },
  { key: "analytics_basic", label: "Basic analytics" },
  { key: "analytics_advanced", label: "Advanced analytics" },
  { key: "ai_session_summary", label: "AI session summaries" },
  { key: "ai_clinical_assistant", label: "Nour clinical assistant" },
  { key: "smart_scheduling", label: "Smart scheduling" },
  { key: "priority_support", label: "Priority support" },
];

const renderValue = (plan: SpecialistPlan, key: string) => {
  const v = plan.features?.[key];
  if (typeof v === "number") {
    return v > 0 ? (
      <span className="font-semibold text-primary">×{v + 1}</span>
    ) : (
      <X className="h-4 w-4 text-muted-foreground/40" />
    );
  }
  return v ? (
    <Check className="h-4 w-4 text-primary" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground/40" />
  );
};

export const PlanComparisonGrid = ({
  currentPlanId,
  onSelectPlan,
  ctaLabel,
  variant = "grid",
}: Props) => {
  // Marketing/public page hides commission_rate (business-sensitive) via the public view.
  const authed = useAllPlans();
  const publicPlans = useAllPlansPublic();
  const { data: plans = [], isLoading } =
    variant === "marketing" ? publicPlans : authed;

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading plans…</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlanId;
        const isHighlighted = plan.id === "pro";
        return (
          <Card
            key={plan.id}
            className={cn(
              "relative flex flex-col p-6 transition-all",
              isCurrent && "border-2 border-primary shadow-lg",
              !isCurrent && isHighlighted && "border-primary/40",
              variant === "marketing" && "hover:scale-[1.02]",
            )}
          >
            {isHighlighted && !isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gap-1 bg-primary text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </Badge>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold capitalize">{plan.name}</h3>
                {isCurrent && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Current
                  </Badge>
                )}
              </div>
              {plan.tagline && (
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              )}
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold">
                {plan.monthly_price_mad === 0 ? "Free" : `${plan.monthly_price_mad} MAD`}
              </span>
              {plan.monthly_price_mad > 0 && (
                <span className="text-sm text-muted-foreground"> / month</span>
              )}
              {typeof plan.commission_rate === "number" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Platform commission: {(plan.commission_rate * 100).toFixed(0)}% per session
                </p>
              )}
            </div>

            <ul className="mb-6 space-y-2 text-sm">
              {FEATURE_ROWS.map((row) => (
                <li key={row.key} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{row.label}</span>
                  {renderValue(plan, row.key)}
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {onSelectPlan && (
                <Button
                  className="w-full"
                  variant={isHighlighted && !isCurrent ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => onSelectPlan(plan)}
                >
                  {isCurrent
                    ? "Current plan"
                    : ctaLabel?.(plan) ??
                      (plan.monthly_price_mad === 0 ? "Downgrade to Free" : `Upgrade to ${plan.name}`)}
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
