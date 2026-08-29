import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Languages, Save } from "lucide-react";

const KEYS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "anamnesis.title", label: "Drawer title" },
  { key: "anamnesis.cardHelp", label: "Dashboard card help", multiline: true },
  { key: "anamnesis.steps.identity.label", label: "Step: Identity" },
  { key: "anamnesis.steps.presenting_complaint.label", label: "Step: Presenting complaint" },
  { key: "anamnesis.steps.history_personal.label", label: "Step: Personal history" },
  { key: "anamnesis.steps.history_family.label", label: "Step: Family history" },
  { key: "anamnesis.steps.medical.label", label: "Step: Medical" },
  { key: "anamnesis.steps.lifestyle.label", label: "Step: Lifestyle" },
  { key: "anamnesis.steps.risk_screening.label", label: "Step: Risk screening" },
  { key: "anamnesis.steps.goals.label", label: "Step: Goals" },
  { key: "consent.law_09_08", label: "Law 09-08 consent text", multiline: true },
];

const LOCALES = ["en", "fr", "ar"] as const;
type Loc = (typeof LOCALES)[number];

const AnamnesisCopyEditor = () => {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, Record<Loc, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("translation_overrides" as any).select("*");
      const map: Record<string, Record<Loc, string>> = {};
      for (const k of KEYS) map[k.key] = { en: "", fr: "", ar: "" };
      for (const row of (data as any[]) || []) {
        if (map[row.key] && LOCALES.includes(row.locale)) {
          map[row.key][row.locale as Loc] = row.value || "";
        }
      }
      setValues(map);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const rows: any[] = [];
      for (const k of KEYS) {
        for (const loc of LOCALES) {
          const v = values[k.key]?.[loc] ?? "";
          if (v.trim()) rows.push({ key: k.key, locale: loc, value: v });
        }
      }
      if (rows.length) {
        const { error } = await supabase.from("translation_overrides" as any).upsert(rows, { onConflict: "key,locale" });
        if (error) throw error;
      }
      toast({ title: "Saved", description: "Anamnesis copy updated." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Languages className="h-4 w-4 text-primary" /> Anamnesis Copy (EN / FR / AR)
        </CardTitle>
        <CardDescription>Edit intake step labels and the Law 09-08 consent text. Changes take effect immediately.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : (
          KEYS.map((k) => (
            <div key={k.key} className="rounded-lg border p-3 space-y-2">
              <div className="text-xs font-mono text-muted-foreground">{k.key}</div>
              <div className="text-sm font-medium">{k.label}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {LOCALES.map((loc) => (
                  <div key={loc} className="space-y-1">
                    <div className="text-[10px] uppercase text-muted-foreground">{loc}</div>
                    {k.multiline ? (
                      <Textarea
                        rows={3}
                        dir={loc === "ar" ? "rtl" : "ltr"}
                        value={values[k.key]?.[loc] ?? ""}
                        onChange={(e) =>
                          setValues((s) => ({ ...s, [k.key]: { ...s[k.key], [loc]: e.target.value } }))
                        }
                      />
                    ) : (
                      <Input
                        dir={loc === "ar" ? "rtl" : "ltr"}
                        value={values[k.key]?.[loc] ?? ""}
                        onChange={(e) =>
                          setValues((s) => ({ ...s, [k.key]: { ...s[k.key], [loc]: e.target.value } }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving || loading}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnamnesisCopyEditor;