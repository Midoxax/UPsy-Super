import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/usePsychologistDashboard";
import { Loader2, CreditCard, Check } from "lucide-react";
import { format } from "date-fns";

const planFeatures = {
  free: [
    "Profile on directory",
    "Up to 5 leads per month",
    "Basic analytics",
  ],
  basic: [
    "Everything in Free",
    "Unlimited leads",
    "Priority listing",
    "Advanced analytics",
  ],
  premium: [
    "Everything in Basic",
    "Featured profile badge",
    "Marketing support",
    "Dedicated account manager",
  ],
};

export const BillingTab = () => {
  const { data: subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <Card className="bg-surface border-border">
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const currentPlan = subscription?.plan_type || "free";

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Subscription & Billing
        </CardTitle>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="p-6 bg-background rounded-lg border-2 border-primary">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold capitalize">{currentPlan} Plan</h3>
              <p className="text-sm text-muted-foreground">
                {subscription?.status === "active" && "Active subscription"}
                {subscription?.status === "paused" && "Paused subscription"}
                {subscription?.status === "cancelled" && "Cancelled subscription"}
                {!subscription && "Free tier"}
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              {subscription?.status || "active"}
            </Badge>
          </div>

          {subscription?.starts_at && (
            <p className="text-sm text-muted-foreground">
              Started: {format(new Date(subscription.starts_at), "PPP")}
            </p>
          )}

          <div className="mt-4 space-y-2">
            {planFeatures[currentPlan as keyof typeof planFeatures]?.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Other Plans */}
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(planFeatures)
            .filter(([plan]) => plan !== currentPlan)
            .map(([plan, features]) => (
              <div key={plan} className="p-4 bg-background rounded-lg border border-border">
                <h4 className="font-semibold capitalize mb-2">{plan} Plan</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <p className="text-sm text-muted-foreground text-center pt-4">
          Contact U.Psy support to upgrade your plan or manage billing details
        </p>
      </CardContent>
    </Card>
  );
};
