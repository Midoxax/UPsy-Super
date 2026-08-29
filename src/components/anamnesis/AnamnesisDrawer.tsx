import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft, ChevronRight, Check, AlertTriangle, Save, Loader2,
  ShieldCheck, Download, FileCheck2, Info,
} from "lucide-react";
import { useAnamnesis, type AnamnesisSection } from "@/hooks/useAnamnesis";
import { useScrollResetOnOpen } from "@/hooks/useScrollResetOnOpen";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import jsPDF from "jspdf";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientId: string;
  clientName?: string;
  psychologistId?: string | null;
  bookingId?: string | null;
  isTherapistView?: boolean;
  onCrisisFlag?: () => void;
}

const STEP_KEYS: AnamnesisSection[] = [
  "identity", "presenting_complaint", "history_personal", "history_family",
  "medical", "lifestyle", "risk_screening", "goals",
];

// Required fields per section to allow completion
const REQUIRED: Record<AnamnesisSection, string[]> = {
  identity: ["age", "gender"],
  presenting_complaint: ["main_reason"],
  history_personal: [],
  history_family: [],
  medical: [],
  lifestyle: ["sleep"],
  risk_screening: ["__answered"], // sentinel: all 3 yes/no answered
  goals: ["therapy_goals"],
  relationships: [],
  specialized_module: [],
  objectives_consent: [],
};

const RISK_KEYS = ["suicidal_ideation", "self_harm", "violence_risk"] as const;

const AnamnesisDrawer = ({
  open, onOpenChange, clientId, clientName,
  psychologistId, bookingId, isTherapistView, onCrisisFlag,
}: Props) => {
  const { t, locale } = useLocale();
  const { data, loading, saving, autoSave, complete, giveConsent, markReviewed, progress } =
    useAnamnesis(clientId, psychologistId, bookingId);
  const { toast } = useToast();
  const [stepIdx, setStepIdx] = useState(0);
  const [local, setLocal] = useState<Record<string, any>>({});
  const [reviewNotes, setReviewNotes] = useState("");
  const scrollRef = useScrollResetOnOpen<HTMLDivElement>(open, [stepIdx]);

  const stepKey = STEP_KEYS[stepIdx];
  const stepLabel = t(`anamnesis.steps.${stepKey}.label`);
  const stepDesc = t(`anamnesis.steps.${stepKey}.description`);
  const f = (k: string) => t(`anamnesis.fields.${k}`);

  useEffect(() => {
    if (data) setLocal({ ...((data as any)[stepKey] || {}) });
  }, [stepIdx, data, stepKey]);

  const updateField = (field: string, value: any) => {
    const next = { ...local, [field]: value };
    setLocal(next);
    autoSave({ [stepKey]: next } as any);

    if (stepKey === "risk_screening" && (field === "suicidal_ideation" || field === "self_harm") && value === "yes") {
      onCrisisFlag?.();
      toast({
        title: t("crisis.title"),
        description: t("crisis.message"),
        variant: "destructive",
      });
    }
  };

  // Completion validation across all sections
  const missingFields = useMemo(() => {
    if (!data) return [];
    const missing: string[] = [];
    for (const sec of STEP_KEYS) {
      const secData: any = (data as any)[sec] || {};
      for (const req of REQUIRED[sec]) {
        if (req === "__answered") {
          const answered = RISK_KEYS.every((k) => secData[k] === "yes" || secData[k] === "no");
          if (!answered) missing.push(t(`anamnesis.steps.${sec}.label`));
        } else if (!secData[req] || String(secData[req]).trim() === "") {
          missing.push(`${t(`anamnesis.steps.${sec}.label`)} · ${f(req)}`);
        }
      }
    }
    return missing;
  }, [data, t, locale]);

  const canComplete = !!data?.consent_given && missingFields.length === 0;

  const handleComplete = async () => {
    if (!data?.consent_given) {
      toast({ title: t("anamnesis.consentRequired"), description: t("anamnesis.consentRequiredDesc"), variant: "destructive" });
      return;
    }
    if (missingFields.length > 0) {
      toast({
        title: t("anamnesis.missingFields"),
        description: t("anamnesis.missingFieldsDesc") + " — " + missingFields.slice(0, 3).join(", "),
        variant: "destructive",
      });
      return;
    }
    await complete();
    toast({ title: t("anamnesis.completed") });
    onOpenChange(false);
  };

  const handleMarkReviewed = async () => {
    await markReviewed(reviewNotes);
    toast({ title: t("anamnesis.reviewed") });
  };

  const handleDownloadPdf = () => {
    if (!data) return;
    const doc = new jsPDF();
    const margin = 15;
    let y = 20;
    doc.setFontSize(16);
    doc.text("U.Psy — " + t("anamnesis.title"), margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`${clientName || ""}  ·  ${new Date().toLocaleDateString(locale)}`, margin, y);
    y += 10;
    doc.setTextColor(0);
    for (const sec of STEP_KEYS) {
      const secData: any = (data as any)[sec] || {};
      if (Object.keys(secData).length === 0) continue;
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(t(`anamnesis.steps.${sec}.label`), margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      for (const [k, v] of Object.entries(secData)) {
        if (v == null || v === "") continue;
        const label = f(k) || k;
        const val = typeof v === "boolean" ? (v ? t("anamnesis.yes") : t("anamnesis.no")) : String(v);
        const lines = doc.splitTextToSize(`${label}: ${val}`, 180);
        if (y + lines.length * 5 > 285) { doc.addPage(); y = 20; }
        doc.text(lines, margin, y);
        y += lines.length * 5 + 1;
      }
      y += 4;
    }
    doc.save(`anamnesis-${clientName || clientId}.pdf`);
  };

  const renderStep = () => {
    switch (stepKey) {
      case "identity":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{f("age")} *</Label><Input type="number" value={local.age || ""} onChange={(e) => updateField("age", e.target.value)} /></div>
              <div><Label>{f("gender")} *</Label><Input value={local.gender || ""} onChange={(e) => updateField("gender", e.target.value)} /></div>
            </div>
            <div><Label>{f("marital_status")}</Label><Input value={local.marital_status || ""} onChange={(e) => updateField("marital_status", e.target.value)} /></div>
            <div><Label>{f("profession")}</Label><Input value={local.profession || ""} onChange={(e) => updateField("profession", e.target.value)} /></div>
            <div><Label>{f("children")}</Label><Input value={local.children || ""} onChange={(e) => updateField("children", e.target.value)} /></div>
          </div>
        );
      case "presenting_complaint":
        return (
          <div className="space-y-4">
            <div><Label>{f("main_reason")} *</Label><Textarea rows={3} value={local.main_reason || ""} onChange={(e) => updateField("main_reason", e.target.value)} /></div>
            <div><Label>{f("onset")}</Label><Input value={local.onset || ""} onChange={(e) => updateField("onset", e.target.value)} /></div>
            <div><Label>{f("triggers")}</Label><Textarea rows={2} value={local.triggers || ""} onChange={(e) => updateField("triggers", e.target.value)} /></div>
            <div>
              <Label>{f("severity")}: {local.severity || 5}</Label>
              <Slider value={[local.severity || 5]} min={1} max={10} step={1} onValueChange={([v]) => updateField("severity", v)} />
            </div>
          </div>
        );
      case "history_personal":
        return (
          <div className="space-y-4">
            <div><Label>{f("childhood")}</Label><Textarea rows={3} value={local.childhood || ""} onChange={(e) => updateField("childhood", e.target.value)} /></div>
            <div><Label>{f("education")}</Label><Textarea rows={2} value={local.education || ""} onChange={(e) => updateField("education", e.target.value)} /></div>
            <div><Label>{f("key_events")}</Label><Textarea rows={3} value={local.key_events || ""} onChange={(e) => updateField("key_events", e.target.value)} /></div>
            <div><Label>{f("traumas")}</Label><Textarea rows={3} value={local.traumas || ""} onChange={(e) => updateField("traumas", e.target.value)} /></div>
          </div>
        );
      case "history_family":
        return (
          <div className="space-y-4">
            <div><Label>{f("structure")}</Label><Textarea rows={3} value={local.structure || ""} onChange={(e) => updateField("structure", e.target.value)} /></div>
            <div><Label>{f("mental_health")}</Label><Textarea rows={3} value={local.mental_health || ""} onChange={(e) => updateField("mental_health", e.target.value)} /></div>
            <div><Label>{f("relationships")}</Label><Textarea rows={2} value={local.relationships || ""} onChange={(e) => updateField("relationships", e.target.value)} /></div>
          </div>
        );
      case "medical":
        return (
          <div className="space-y-4">
            <div><Label>{f("conditions")}</Label><Textarea rows={2} value={local.conditions || ""} onChange={(e) => updateField("conditions", e.target.value)} /></div>
            <div><Label>{f("medications")}</Label><Textarea rows={2} value={local.medications || ""} onChange={(e) => updateField("medications", e.target.value)} /></div>
            <div><Label>{f("allergies")}</Label><Input value={local.allergies || ""} onChange={(e) => updateField("allergies", e.target.value)} /></div>
            <div><Label>{f("prior_therapy")}</Label><Textarea rows={2} value={local.prior_therapy || ""} onChange={(e) => updateField("prior_therapy", e.target.value)} /></div>
          </div>
        );
      case "lifestyle":
        return (
          <div className="space-y-4">
            <div><Label>{f("sleep")} *</Label><Input value={local.sleep || ""} onChange={(e) => updateField("sleep", e.target.value)} placeholder={f("sleepPh")} /></div>
            <div><Label>{f("appetite")}</Label><Input value={local.appetite || ""} onChange={(e) => updateField("appetite", e.target.value)} /></div>
            <div><Label>{f("substances")}</Label><Textarea rows={2} value={local.substances || ""} onChange={(e) => updateField("substances", e.target.value)} /></div>
            <div><Label>{f("exercise")}</Label><Input value={local.exercise || ""} onChange={(e) => updateField("exercise", e.target.value)} /></div>
            <div><Label>{f("social_support")}</Label><Textarea rows={2} value={local.social_support || ""} onChange={(e) => updateField("social_support", e.target.value)} /></div>
          </div>
        );
      case "risk_screening": {
        const YesNoRow = ({ field }: { field: typeof RISK_KEYS[number] }) => (
          <div className="rounded-lg border border-border p-3 space-y-2">
            <div className="text-sm font-medium">{f(field)} *</div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={local[field] === "no" ? "default" : "outline"}
                className="flex-1"
                onClick={() => updateField(field, "no")}
              >
                {t("anamnesis.no")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={local[field] === "yes" ? "destructive" : "outline"}
                className="flex-1"
                onClick={() => updateField(field, "yes")}
              >
                {t("anamnesis.yes")}
              </Button>
            </div>
          </div>
        );
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-destructive mb-1">
                <Info className="h-4 w-4" /> {t("anamnesis.crisisBannerTitle")}
              </div>
              <p className="text-foreground/80 text-xs leading-relaxed">{t("anamnesis.crisisBannerDesc")}</p>
            </div>
            <YesNoRow field="suicidal_ideation" />
            <YesNoRow field="self_harm" />
            <YesNoRow field="violence_risk" />
            <div><Label>{f("risk_notes")}</Label><Textarea rows={3} value={local.notes || ""} onChange={(e) => updateField("notes", e.target.value)} /></div>
          </div>
        );
      }
      case "goals":
        return (
          <div className="space-y-4">
            <div><Label>{f("therapy_goals")} *</Label><Textarea rows={4} value={local.therapy_goals || ""} onChange={(e) => updateField("therapy_goals", e.target.value)} /></div>
            <div><Label>{f("timeline")}</Label><Input value={local.timeline || ""} onChange={(e) => updateField("timeline", e.target.value)} /></div>
            <div><Label>{f("success_indicators")}</Label><Textarea rows={3} value={local.success_indicators || ""} onChange={(e) => updateField("success_indicators", e.target.value)} /></div>
          </div>
        );
    }
  };

  const isCompleted = data?.status === "completed" || data?.status === "reviewed";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent ref={scrollRef} side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            {t("anamnesis.title")} {clientName && <Badge variant="outline">{clientName}</Badge>}
            {data?.status === "reviewed" && <Badge variant="default" className="ml-auto"><FileCheck2 className="h-3 w-3 mr-1" />{t("anamnesis.reviewed")}</Badge>}
          </SheetTitle>
          <SheetDescription>
            {t("anamnesis.stepOf").replace("{current}", String(stepIdx + 1)).replace("{total}", String(STEP_KEYS.length))}: {stepLabel} — {stepDesc}
          </SheetDescription>
          <Progress value={progress} className="h-1.5 mt-2" />
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="py-4">{renderStep()}</div>

            {!data?.consent_given && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 my-4">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-foreground/80">
                  <Checkbox onCheckedChange={(v) => v && giveConsent()} />
                  <span>
                    <ShieldCheck className="inline h-3.5 w-3.5 mr-1 text-primary" />
                    {t("anamnesis.consentLabel")}
                  </span>
                </label>
              </div>
            )}

            {/* Therapist review controls */}
            {isTherapistView && isCompleted && data?.status !== "reviewed" && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 my-4 space-y-2">
                <Label className="text-xs">{t("anamnesis.markReviewed")}</Label>
                <Textarea
                  rows={2}
                  placeholder={t("anamnesis.reviewNotesPlaceholder")}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
                <Button size="sm" className="w-full" onClick={handleMarkReviewed}>
                  <FileCheck2 className="h-4 w-4 mr-1" /> {t("anamnesis.markReviewed")}
                </Button>
              </div>
            )}

            {data?.status === "reviewed" && data.reviewed_at && (
              <div className="text-xs text-muted-foreground my-2 flex items-center gap-1">
                <FileCheck2 className="h-3 w-3 text-primary" />
                {t("anamnesis.reviewedAt").replace("{date}", new Date(data.reviewed_at).toLocaleDateString(locale))}
              </div>
            )}

            {/* PDF download — available once reviewed (or completed for therapist) */}
            {(data?.status === "reviewed" || (isTherapistView && isCompleted)) && (
              <Button variant="outline" size="sm" className="w-full mb-3" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4 mr-1" /> {t("anamnesis.downloadPdf")}
              </Button>
            )}

            {!canComplete && stepIdx === STEP_KEYS.length - 1 && (
              <div className="text-[11px] text-muted-foreground mb-2 flex items-start gap-1">
                <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
                <span>{t("anamnesis.requiredHint")}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border sticky bottom-0 bg-background">
              <Button variant="ghost" size="sm" disabled={stepIdx === 0} onClick={() => setStepIdx((i) => i - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> {t("anamnesis.back")}
              </Button>
              <span className="text-xs text-muted-foreground">
                {saving ? <><Save className="inline h-3 w-3 mr-1 animate-pulse" /> {t("anamnesis.saving")}</> : t("anamnesis.autoSaved")}
              </span>
              {stepIdx < STEP_KEYS.length - 1 ? (
                <Button size="sm" onClick={() => setStepIdx((i) => i + 1)}>
                  {t("anamnesis.next")} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleComplete} disabled={!canComplete}>
                  <Check className="h-4 w-4 mr-1" /> {t("anamnesis.complete")}
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AnamnesisDrawer;
