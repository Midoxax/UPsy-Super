import type { ComponentType } from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Save, History, TrendingUp, Percent, Wallet, Calculator } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

const pricingSchema = z.object({
  commission_rate: z.number().min(0).max(100),
  deposit_percentage: z.number().min(0).max(100),
  vat_rate: z.number().min(0).max(100),
  min_session_price_mad: z.number().min(0),
  max_session_price_mad: z.number().min(0),
  notes: z.string().max(500).optional(),
});

type Pricing = {
  id: string;
  commission_rate: number;
  deposit_percentage: number;
  vat_rate: number;
  min_session_price_mad: number;
  max_session_price_mad: number;
  currency: string;
  notes: string | null;
  updated_at: string;
};

type HistoryRow = {
  id: string;
  commission_rate: number;
  deposit_percentage: number;
  vat_rate: number;
  min_session_price_mad: number;
  max_session_price_mad: number;
  change_reason: string | null;
  changed_at: string;
};

const PricingControl = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pricing, isLoading } = useQuery({
    queryKey: ["admin-pricing-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_pricing_config")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as Pricing | null;
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ["admin-pricing-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_pricing_history")
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as HistoryRow[];
    },
  });

  const [form, setForm] = useState({
    commission_rate: 20,
    deposit_percentage: 50,
    vat_rate: 20,
    min_session_price_mad: 200,
    max_session_price_mad: 2000,
    notes: "",
  });

  useEffect(() => {
    if (pricing) {
      setForm({
        commission_rate: Number(pricing.commission_rate),
        deposit_percentage: Number(pricing.deposit_percentage),
        vat_rate: Number(pricing.vat_rate),
        min_session_price_mad: Number(pricing.min_session_price_mad),
        max_session_price_mad: Number(pricing.max_session_price_mad),
        notes: "",
      });
    }
  }, [pricing?.id]);

  const isDirty = pricing
    ? form.commission_rate !== Number(pricing.commission_rate)
      || form.deposit_percentage !== Number(pricing.deposit_percentage)
      || form.vat_rate !== Number(pricing.vat_rate)
      || form.min_session_price_mad !== Number(pricing.min_session_price_mad)
      || form.max_session_price_mad !== Number(pricing.max_session_price_mad)
    : true;

  const save = useMutation({
    mutationFn: async () => {
      const parsed = pricingSchema.safeParse(form);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      }
      if (parsed.data.max_session_price_mad < parsed.data.min_session_price_mad) {
        throw new Error("Le tarif maximum doit être supérieur ou égal au minimum.");
      }
      if (!pricing) {
        const { error } = await supabase.from("platform_pricing_config").insert({
          ...parsed.data,
          currency: "MAD",
          is_active: true,
          updated_by: user?.id,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("platform_pricing_config")
          .update({ ...parsed.data, updated_by: user?.id })
          .eq("id", pricing.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing-config"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pricing-history"] });
      queryClient.invalidateQueries({ queryKey: ["platform-pricing-active"] });
      toast({ title: "Tarification mise à jour", description: "Les nouveaux paramètres sont actifs immédiatement." });
    },
    onError: (e: Error) => {
      toast({ title: "Échec de la sauvegarde", description: e.message, variant: "destructive" });
    },
  });

  // Live preview using a sample 600 MAD session
  const sample = 600;
  const deposit = +(sample * form.deposit_percentage / 100).toFixed(2);
  const commission = +(sample * form.commission_rate / 100).toFixed(2);
  const vat = +(commission * form.vat_rate / 100).toFixed(2);
  const psychologistNet = +(sample - commission).toFixed(2);
  const platformNet = +(commission - vat).toFixed(2);

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const fields: { key: keyof typeof form; label: string; suffix: string; icon: ComponentType<{ className?: string }>; help: string }[] = [
    { key: "commission_rate", label: "Commission plateforme", suffix: "%", icon: Percent, help: "Part qu'UPSY prélève sur chaque session." },
    { key: "deposit_percentage", label: "Acompte à la réservation", suffix: "%", icon: Wallet, help: "Pourcentage payé par le client lors du booking." },
    { key: "vat_rate", label: "TVA appliquée", suffix: "%", icon: Calculator, help: "Sur la commission UPSY uniquement." },
    { key: "min_session_price_mad", label: "Tarif min. par session", suffix: "MAD", icon: TrendingUp, help: "Plancher autorisé pour les psychologues." },
    { key: "max_session_price_mad", label: "Tarif max. par session", suffix: "MAD", icon: TrendingUp, help: "Plafond autorisé pour les psychologues." },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-6 min-w-0">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold">Paramètres tarifaires</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ces réglages s'appliquent à toutes les sessions futures. L'historique est conservé.
              </p>
            </div>
            {pricing && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Dernière maj : {format(new Date(pricing.updated_at), "dd MMM yyyy HH:mm")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map(({ key, label, suffix, icon: Icon, help }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="flex items-center gap-2 text-sm">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {label}
                </Label>
                <div className="relative">
                  <Input
                    id={key}
                    type="number"
                    step={key.includes("price") ? "10" : "0.5"}
                    min={0}
                    max={key.includes("price") ? undefined : 100}
                    value={form[key] as number}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {suffix}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{help}</p>
              </div>
            ))}

            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="notes" className="text-sm">Raison du changement (audit)</Label>
              <Textarea
                id="notes"
                placeholder="Ex. Ajustement saisonnier, alignement marché, ..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                maxLength={500}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!isDirty || save.isPending} className="gap-2">
                  {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la modification</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ces nouveaux paramètres s'appliqueront immédiatement à toutes les sessions futures.
                    L'ancienne version reste dans l'historique. Continuer ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={() => save.mutate()}>Confirmer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Historique des modifications</h3>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune modification enregistrée pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-surface border border-border text-sm">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary">Commission {h.commission_rate}%</span>
                      <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary">Acompte {h.deposit_percentage}%</span>
                      <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary">TVA {h.vat_rate}%</span>
                      <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary">{h.min_session_price_mad}–{h.max_session_price_mad} MAD</span>
                    </div>
                    {h.change_reason && (
                      <p className="text-xs text-muted-foreground truncate">{h.change_reason}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(h.changed_at), "dd MMM HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Live preview sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-32 self-start">
        <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h3 className="text-sm font-semibold mb-1">Aperçu en direct</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Pour une session à <strong>{sample} MAD</strong>
          </p>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Acompte client</dt>
              <dd className="font-semibold">{deposit} MAD</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Solde dû</dt>
              <dd className="font-semibold">{(sample - deposit).toFixed(2)} MAD</dd>
            </div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Commission UPSY brute</dt>
              <dd className="font-semibold">{commission} MAD</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">— TVA reversée</dt>
              <dd className="text-muted-foreground">{vat} MAD</dd>
            </div>
            <div className="flex justify-between text-primary">
              <dt className="font-medium">UPSY net</dt>
              <dd className="font-bold">{platformNet} MAD</dd>
            </div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between text-base">
              <dt className="text-muted-foreground">Reversé au psy</dt>
              <dd className="font-bold text-foreground">{psychologistNet} MAD</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-2">Bonnes pratiques</h3>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Toute modification est tracée et horodatée.</li>
            <li>Évite de changer la commission plus d'une fois par mois.</li>
            <li>Préviens les psys par email avant toute hausse.</li>
            <li>La TVA marocaine standard est de 20%.</li>
          </ul>
        </Card>
      </aside>
    </div>
  );
};

export default PricingControl;