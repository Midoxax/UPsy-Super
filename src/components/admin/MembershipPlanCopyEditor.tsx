import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Loader2, Save } from "lucide-react";

/**
 * Admin editor for the membership plan names and taglines in English, French
 * and Arabic (shown on /membership). Only these six fields are written; an
 * empty French or Arabic field falls back to English on the page.
 */

const FIELDS = [
  "name",
  "name_fr",
  "name_ar",
  "tagline",
  "tagline_fr",
  "tagline_ar",
] as const;
type Field = (typeof FIELDS)[number];
type PlanCopy = {
  tier: string;
  sort_order: number;
  is_active: boolean;
} & Record<Field, string | null>;

const COLUMNS: {
  lang: string;
  dir: "ltr" | "rtl";
  name: Field;
  tagline: Field;
}[] = [
  { lang: "English", dir: "ltr", name: "name", tagline: "tagline" },
  { lang: "French", dir: "ltr", name: "name_fr", tagline: "tagline_fr" },
  { lang: "Arabic", dir: "rtl", name: "name_ar", tagline: "tagline_ar" },
];

const TEXT = {
  title: "Membership plans: names and taglines",
  description:
    "Shown on the membership page in each language. Leave French or Arabic empty to show the English.",
  name: "Name",
  tagline: "Tagline",
  save: "Save",
  inactive: "inactive",
  saved: "Plan saved",
  failed: "Could not save the plan",
  nameRequired: "The English name is required",
};

export default function MembershipPlanCopyEditor() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, PlanCopy>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin-membership-plan-copy"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select(`tier, sort_order, is_active, ${FIELDS.join(", ")}`)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as PlanCopy[];
    },
  });

  useEffect(() => {
    setDrafts(Object.fromEntries(plans.map((p) => [p.tier, { ...p }])));
  }, [plans]);

  const set = (tier: string, field: Field, value: string) =>
    setDrafts((d) => ({ ...d, [tier]: { ...d[tier], [field]: value } }));

  const save = async (tier: string) => {
    const draft = drafts[tier];
    if (!draft?.name?.trim()) {
      toast({ title: TEXT.nameRequired, variant: "destructive" });
      return;
    }
    setSaving(tier);
    const patch = Object.fromEntries(
      FIELDS.map((f) => [
        f,
        draft[f]?.trim() || (f === "name" ? draft.name : null),
      ]),
    );
    const { error } = await supabase
      .from("membership_plans")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("tier", tier as never);
    setSaving(null);
    if (error) {
      toast({
        title: TEXT.failed,
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: TEXT.saved });
    qc.invalidateQueries({ queryKey: ["admin-membership-plan-copy"] });
    qc.invalidateQueries({ queryKey: ["membership-plans"] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          {TEXT.title}
        </CardTitle>
        <CardDescription>{TEXT.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          plans.map((plan) => {
            const d = drafts[plan.tier];
            if (!d) return null;
            return (
              <div
                key={plan.tier}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {plan.tier}
                    {!plan.is_active && ` · ${TEXT.inactive}`}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => save(plan.tier)}
                    disabled={saving === plan.tier}
                  >
                    {saving === plan.tier ? (
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="me-2 h-4 w-4" />
                    )}
                    {TEXT.save}
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {COLUMNS.map((col) => (
                    <div key={col.lang} className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        {`${TEXT.name} · ${col.lang}`}
                      </Label>
                      <Input
                        dir={col.dir}
                        value={d[col.name] ?? ""}
                        onChange={(e) =>
                          set(plan.tier, col.name, e.target.value)
                        }
                      />
                      <Label className="text-xs text-muted-foreground">
                        {`${TEXT.tagline} · ${col.lang}`}
                      </Label>
                      <Input
                        dir={col.dir}
                        value={d[col.tagline] ?? ""}
                        onChange={(e) =>
                          set(plan.tier, col.tagline, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
