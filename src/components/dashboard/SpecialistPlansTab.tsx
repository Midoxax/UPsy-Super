import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Info, Loader2, CheckCircle2, FileText, Receipt, Tag, X } from "lucide-react";
import { format } from "date-fns";
import { useSpecialistPlan, useAllPlans, type SpecialistPlan } from "@/hooks/useSpecialistPlan";
import {
  useSubscriptionInvoices,
  useChangePlanMock,
} from "@/hooks/useSubscriptionBilling";
import { useValidateCoupon, type CouponValidation } from "@/hooks/useCoupons";
import { PlanComparisonGrid } from "./PlanComparisonGrid";
import { useToast } from "@/hooks/use-toast";

export const SpecialistPlansTab = () => {
  const { data: currentPlan, isLoading } = useSpecialistPlan();
  const { data: invoices = [] } = useSubscriptionInvoices();
  const { data: allPlans = [] } = useAllPlans();
  const changePlan = useChangePlanMock();
  const validateCoupon = useValidateCoupon();
  const { toast } = useToast();
  const [pending, setPending] = useState<SpecialistPlan | null>(null);
  const [annual, setAnnual] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState<CouponValidation | null>(null);

  if (isLoading) {
    return (
      <Card className="bg-surface border-border">
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Annual = pay 10 months, get 12 (2 months free)
  const baseAmount = pending
    ? annual
      ? pending.monthly_price_mad * 10
      : pending.monthly_price_mad
    : 0;
  const finalAmount = discount ? discount.finalMad : baseAmount;

  const openConfirm = (p: SpecialistPlan) => {
    setPending(p);
    setCoupon("");
    setDiscount(null);
    setAnnual(false);
  };

  const applyCoupon = async () => {
    if (!pending || !coupon.trim() || baseAmount <= 0) return;
    try {
      const result = await validateCoupon.mutateAsync({
        code: coupon.trim(),
        amountMad: baseAmount,
        appliesTo: "subscription",
      });
      setDiscount(result);
      toast({
        title: "Coupon applied",
        description: `−${result.discountMad.toFixed(0)} MAD discount`,
      });
    } catch (e: any) {
      setDiscount(null);
      toast({
        title: "Invalid coupon",
        description: e.message || "This code is not valid for subscriptions.",
        variant: "destructive",
      });
    }
  };

  const handleConfirm = async () => {
    if (!pending) return;
    try {
      await changePlan.mutateAsync({
        planId: pending.id,
        amountMad: finalAmount,
      });
      toast({
        title: pending.id === "free" ? "Downgraded to Free" : `Upgraded to ${pending.name}`,
        description:
          pending.id === "free"
            ? "Your premium features will remain until the end of the current period."
            : `Test payment of ${finalAmount} MAD ${annual ? "(annual)" : "(monthly)"} recorded. Premium features are now active.`,
      });
      setPending(null);
      setDiscount(null);
      setCoupon("");
    } catch (e: any) {
      toast({
        title: "Could not update plan",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Test mode banner */}
      <Alert className="border-amber-500/30 bg-amber-500/5">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs">
          Subscriptions are in <strong>test mode</strong> — no real money is charged. Admins can also
          upgrade you manually. Real card payments will be enabled in a future release.
        </AlertDescription>
      </Alert>

      {/* Current plan summary */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Your plan
          </CardTitle>
          <CardDescription>
            You're on the <strong className="capitalize">{currentPlan?.name}</strong> plan
            {currentPlan && currentPlan.monthly_price_mad > 0
              ? ` — ${currentPlan.monthly_price_mad} MAD / month`
              : ""}
            . Platform commission: {((currentPlan?.commission_rate ?? 0.2) * 100).toFixed(0)}% per
            session.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Comparison grid */}
      <PlanComparisonGrid
        currentPlanId={currentPlan?.id}
        onSelectPlan={openConfirm}
        ctaLabel={(p) => {
          if (!currentPlan) return `Upgrade to ${p.name}`;
          if (p.sort_order > currentPlan.sort_order) return `Upgrade to ${p.name}`;
          return p.id === "free" ? "Downgrade to Free" : `Switch to ${p.name}`;
        }}
      />

      {/* Invoice history */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-primary" />
            Invoice history
          </CardTitle>
          <CardDescription>Your past subscription invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No invoices yet — you're on the Free plan.
            </p>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.invoice_number ?? "—"}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {inv.plan_type} · {format(new Date(inv.period_start), "MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{inv.amount_mad.toFixed(2)} MAD</span>
                    <Badge
                      variant="secondary"
                      className={
                        inv.status === "paid"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <Dialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent className="bg-surface border-border">
          <DialogHeader>
            <DialogTitle>
              {pending?.id === "free" ? "Downgrade to Free" : `Upgrade to ${pending?.name}`}
            </DialogTitle>
            <DialogDescription>
              {pending?.id === "free"
                ? "You'll keep your premium features until the end of the current billing period."
                : `Choose monthly or annual billing. No real card will be charged in test mode.`}
            </DialogDescription>
          </DialogHeader>

          {pending && pending.id !== "free" && pending.monthly_price_mad > 0 && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
                <div>
                  <Label htmlFor="annual-toggle" className="text-sm font-medium">
                    Annual billing
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Pay 10 months, get 12 — save {pending.monthly_price_mad * 2} MAD/year.
                  </p>
                </div>
                <Switch id="annual-toggle" checked={annual} onCheckedChange={setAnnual} />
              </div>

              <div className="rounded-lg border border-border bg-background p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {pending.name} · {annual ? "Annual" : "Monthly"}
                  </span>
                  <span>{baseAmount} MAD</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Coupon
                    </span>
                    <span>−{discount.discountMad.toFixed(0)} MAD</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total today</span>
                  <span>{finalAmount} MAD</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Promo code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  disabled={!!discount}
                />
                {discount ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setDiscount(null);
                      setCoupon("");
                    }}
                    aria-label="Remove coupon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={!coupon.trim() || validateCoupon.isPending}
                  >
                    {validateCoupon.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          <Alert className="border-primary/30 bg-primary/5 my-2">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs">
              Test mode — this records a paid invoice and updates your plan immediately.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={changePlan.isPending} className="gap-2">
              {changePlan.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
