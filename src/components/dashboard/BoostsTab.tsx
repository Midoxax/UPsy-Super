import type { ComponentType } from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Rocket, Star, Home, Info, Loader2, CheckCircle2, Tag, X, TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import {
  BOOST_CATALOG, useActiveBoosts, usePurchaseBoost, type BoostPackage,
} from "@/hooks/useBoosts";
import { useValidateCoupon, type CouponValidation } from "@/hooks/useCoupons";
import { useToast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  search_boost: TrendingUp,
  spotlight: Star,
  homepage_feature: Home,
};

export const BoostsTab = () => {
  const { data: boosts = [], isLoading } = useActiveBoosts();
  const purchase = usePurchaseBoost();
  const validateCoupon = useValidateCoupon();
  const { toast } = useToast();
  const [pending, setPending] = useState<BoostPackage | null>(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState<CouponValidation | null>(null);

  const now = Date.now();
  const active = boosts.filter(
    (b) => b.payment_status === "paid" && new Date(b.ends_at).getTime() > now,
  );
  const past = boosts.filter(
    (b) => b.payment_status !== "paid" || new Date(b.ends_at).getTime() <= now,
  );

  const finalPrice = pending
    ? discount
      ? discount.finalMad
      : pending.priceMad
    : 0;

  const openPurchase = (pkg: BoostPackage) => {
    setPending(pkg);
    setCoupon("");
    setDiscount(null);
  };

  const applyCoupon = async () => {
    if (!pending || !coupon.trim()) return;
    try {
      const result = await validateCoupon.mutateAsync({
        code: coupon.trim(),
        amountMad: pending.priceMad,
        appliesTo: "boost",
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
        description: e.message || "This code is not valid for boosts.",
        variant: "destructive",
      });
    }
  };

  const handleConfirm = async () => {
    if (!pending) return;
    try {
      // Persist with the discounted price
      await purchase.mutateAsync({ ...pending, priceMad: finalPrice });
      toast({
        title: `${pending.name} activated!`,
        description: `Your boost is live for ${pending.durationDays} days. Test payment of ${finalPrice} MAD recorded.`,
      });
      setPending(null);
      setDiscount(null);
      setCoupon("");
    } catch (e: any) {
      toast({
        title: "Could not activate boost",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-amber-500/30 bg-amber-500/5">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs">
          Boosts are in <strong>test mode</strong> — no real money is charged. Boosts increase your
          ranking in directory search and (Homepage Feature) on the U.Psy homepage.
        </AlertDescription>
      </Alert>

      {/* Active boosts */}
      {active.length > 0 && (
        <Card className="bg-surface border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-4 w-4 text-primary" />
              Active boosts
            </CardTitle>
            <CardDescription>Currently increasing your visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {active.map((b) => {
              const Icon = ICON_MAP[b.boost_type] ?? Rocket;
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {b.boost_type.replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Until {format(new Date(b.ends_at), "MMM d, HH:mm")}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    Live
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Catalog */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Get more visibility
          </CardTitle>
          <CardDescription>
            Pay-as-you-go boosts. Stack with your plan to attract more clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOOST_CATALOG.map((pkg) => {
            const Icon = ICON_MAP[pkg.id] ?? Rocket;
            return (
              <Card
                key={pkg.id}
                className={`p-5 flex flex-col gap-3 border-border transition-shadow hover:shadow-md ${
                  pkg.badge ? "border-primary/40 bg-primary/5" : "bg-background"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {pkg.badge && (
                    <Badge variant="secondary" className="text-[10px]">
                      {pkg.badge}
                    </Badge>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{pkg.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                </div>
                <div className="flex items-baseline gap-1.5 mt-auto">
                  <span className="text-2xl font-bold text-foreground">{pkg.priceMad}</span>
                  <span className="text-xs text-muted-foreground">MAD · {pkg.durationDays}d</span>
                </div>
                <p className="text-[11px] text-muted-foreground">≈ {pkg.priceEur} EUR</p>
                <Button onClick={() => openPurchase(pkg)} size="sm" className="w-full">
                  Activate boost
                </Button>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* History */}
      {past.length > 0 && (
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-base">Boost history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {past.slice(0, 10).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between text-sm rounded-lg border border-border bg-background px-4 py-2"
              >
                <span className="capitalize text-muted-foreground">
                  {b.boost_type.replace("_", " ")} ·{" "}
                  {format(new Date(b.starts_at), "MMM d")} →{" "}
                  {format(new Date(b.ends_at), "MMM d")}
                </span>
                <span className="text-xs">{Number(b.amount_mad).toFixed(0)} MAD</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Purchase dialog with coupon */}
      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="bg-surface border-border">
          <DialogHeader>
            <DialogTitle>Activate {pending?.name}</DialogTitle>
            <DialogDescription>
              Boost runs for {pending?.durationDays} days, starting now.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-border bg-background p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{pending?.name}</span>
                <span>{pending?.priceMad} MAD</span>
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
                <span>Total</span>
                <span>{finalPrice} MAD</span>
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

          <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs">
              Test mode — no real card will be charged.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={purchase.isPending} className="gap-2">
              {purchase.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Pay {finalPrice} MAD & activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default BoostsTab;
