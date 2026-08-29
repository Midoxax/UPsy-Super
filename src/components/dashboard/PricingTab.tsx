import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePsychologistProfile, useUpdateProfile } from "@/hooks/usePsychologistDashboard";
import { Loader2, Save, DollarSign, Percent } from "lucide-react";

export const PricingTab = () => {
  const { toast } = useToast();
  const { data: profile, isLoading } = usePsychologistProfile();
  const updateProfile = useUpdateProfile();

  const [hourlyRate, setHourlyRate] = useState("");
  const [depositPct, setDepositPct] = useState<number>(50);

  const { data: pricing } = useQuery({
    queryKey: ["platform-pricing-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_pricing_config")
        .select("min_session_price_mad, max_session_price_mad, commission_rate, vat_rate, deposit_percentage")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile?.hourly_rate_mad) setHourlyRate(profile.hourly_rate_mad.toString());
    if (typeof (profile as any)?.deposit_percentage === "number") setDepositPct((profile as any).deposit_percentage);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const rate = parseFloat(hourlyRate);
      if (isNaN(rate) || rate < 0) {
        throw new Error("Please enter a valid hourly rate");
      }
      if (pricing) {
        if (rate < Number(pricing.min_session_price_mad) || rate > Number(pricing.max_session_price_mad)) {
          throw new Error(`Rate must be between ${pricing.min_session_price_mad} and ${pricing.max_session_price_mad} MAD`);
        }
      }

      await updateProfile.mutateAsync({ hourly_rate_mad: rate, deposit_percentage: depositPct });

      toast({ title: "Pricing Updated", description: "Your session fees have been saved." });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update pricing",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-surface border-border">
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const calculatedRates = {
    thirtyMin: hourlyRate ? Math.round(parseFloat(hourlyRate) * 0.5) : 0,
    sixtyMin: hourlyRate ? parseFloat(hourlyRate) : 0,
    ninetyMin: hourlyRate ? Math.round(parseFloat(hourlyRate) * 1.5) : 0,
  };

  const rateNum = parseFloat(hourlyRate || "0");
  const depositAmt = Math.round(rateNum * (depositPct / 100));
  const balanceAmt = Math.max(0, rateNum - depositAmt);
  const commissionPct = Number(pricing?.commission_rate ?? 20);
  const netToYou = Math.round(rateNum * (1 - commissionPct / 100));

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Session Pricing
        </CardTitle>
        <CardDescription>Set your hourly rate for therapy sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate (MAD)</Label>
            <Input
              id="hourly_rate"
              type="number"
              min={pricing?.min_session_price_mad ?? 0}
              max={pricing?.max_session_price_mad ?? 5000}
              step="50"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="700"
              className="bg-background"
            />
            <p className="text-sm text-muted-foreground">
              Your base rate for a 60-minute session.
              {pricing && (
                <> Allowed range: <span className="text-foreground">{pricing.min_session_price_mad}–{pricing.max_session_price_mad} MAD</span>.</>
              )}
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-background border border-border">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                Deposit at booking
              </Label>
              <span className="text-lg font-bold text-primary">{depositPct}%</span>
            </div>
            <Slider
              value={[depositPct]}
              onValueChange={(v) => setDepositPct(v[0])}
              min={0}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              The patient pays this % when booking. Balance is captured after the session.
            </p>
            {rateNum > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
                <div className="p-2 rounded-sm bg-surface">
                  <p className="text-xs text-muted-foreground">Deposit collected</p>
                  <p className="font-semibold text-foreground">{depositAmt} MAD</p>
                </div>
                <div className="p-2 rounded-sm bg-surface">
                  <p className="text-xs text-muted-foreground">Balance after session</p>
                  <p className="font-semibold text-foreground">{balanceAmt} MAD</p>
                </div>
              </div>
            )}
          </div>

          {rateNum > 0 && (
            <div className="p-4 bg-background rounded-lg border border-border space-y-1 text-sm">
              <p className="text-xs text-muted-foreground">Platform commission ({commissionPct}%)</p>
              <p className="font-medium">{Math.round(rateNum * commissionPct / 100)} MAD per session</p>
              <p className="text-xs text-muted-foreground pt-2">Net to you per 60-min session</p>
              <p className="text-lg font-bold text-primary">{netToYou} MAD</p>
            </div>
          )}

          {hourlyRate && (
            <div className="p-4 bg-background rounded-lg space-y-3">
              <p className="text-sm font-medium">Calculated Session Rates:</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-surface rounded-sm border border-border">
                  <p className="text-xs text-muted-foreground">30 minutes</p>
                  <p className="text-lg font-semibold text-primary">{calculatedRates.thirtyMin} MAD</p>
                </div>
                <div className="p-3 bg-surface rounded-sm border border-primary">
                  <p className="text-xs text-muted-foreground">60 minutes</p>
                  <p className="text-lg font-semibold text-primary">{calculatedRates.sixtyMin} MAD</p>
                </div>
                <div className="p-3 bg-surface rounded-sm border border-border">
                  <p className="text-xs text-muted-foreground">90 minutes</p>
                  <p className="text-lg font-semibold text-primary">{calculatedRates.ninetyMin} MAD</p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Pricing
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
