import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ChevronRight, Download, Bell, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAnamnesis } from "@/hooks/useAnamnesis";
import AnamnesisDrawer from "@/components/anamnesis/AnamnesisDrawer";
import { useNavigate } from "@/lib/router-compat";
import { useLocale } from "@/contexts/LocaleContext";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

const STEP_KEYS = [
  "identity",
  "presenting_complaint",
  "history_personal",
  "history_family",
  "medical",
  "lifestyle",
  "risk_screening",
  "goals",
] as const;

interface OrgBranding {
  pdf_logo_url?: string | null;
  pdf_primary_color?: string | null;
  pdf_signature_label?: string | null;
}

const AnamnesisCard = () => {
  const { user } = useAuth();
  const { data, progress, loading } = useAnamnesis(user?.id);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [reminderInfo, setReminderInfo] = useState<{ sent_at: string | null } | null>(null);
  const { t, locale } = useLocale();

  // Load latest reminder badge
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: rows } = await supabase
        .from("anamnesis_reminders")
        .select("sent_at, status")
        .eq("client_id", user.id)
        .eq("status", "sent")
        .order("sent_at", { ascending: false })
        .limit(1);
      if (rows && rows[0]) setReminderInfo({ sent_at: rows[0].sent_at });
    })();
  }, [user]);

  if (!user) return null;

  const status = data?.status || "draft";
  const statusLabel: Record<string, string> = {
    draft: t("anamnesis.notStarted"),
    in_progress: t("anamnesis.inProgress"),
    completed: t("anamnesis.completed"),
    reviewed: t("anamnesis.reviewed"),
  };

  // Compute missing steps
  const missingSteps = STEP_KEYS.filter((s) => {
    const sec: any = (data as any)?.[s] || {};
    return Object.keys(sec).length === 0;
  });

  const reminderDays = reminderInfo?.sent_at
    ? Math.floor((Date.now() - new Date(reminderInfo.sent_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleDownloadPdf = async () => {
    if (!data) return;

    // Fetch org branding if this client is linked to a psychologist with an org
    let branding: OrgBranding = {};
    try {
      if (data.psychologist_id) {
        // Find org where this psychologist is the owner (best-effort)
        const { data: org } = await supabase
          .from("organization_accounts")
          .select("pdf_logo_url, pdf_primary_color, pdf_signature_label")
          .eq("owner_id", data.psychologist_id)
          .maybeSingle();
        if (org) branding = org as OrgBranding;
      }
    } catch (_) { /* fallback to defaults */ }

    const primary = branding.pdf_primary_color || "#6B1F2A";
    const signatureLabel = branding.pdf_signature_label || "Therapist signature";
    const logoUrl = branding.pdf_logo_url;

    const doc = new jsPDF();
    const margin = 15;
    let y = 20;

    // Optional logo (top right)
    if (logoUrl) {
      try {
        const img = await fetch(logoUrl).then((r) => r.blob());
        const dataUrl: string = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(img);
        });
        doc.addImage(dataUrl, "PNG", 160, 10, 35, 15, undefined, "FAST");
      } catch (_) { /* skip logo on error */ }
    }

    // Header bar with primary color
    const [r, g, b] = hexToRgb(primary);
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, 210, 4, "F");

    doc.setFontSize(16);
    doc.setTextColor(r, g, b);
    doc.text("U.Psy — " + t("anamnesis.title"), margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(new Date().toLocaleDateString(locale), margin, y);
    y += 10;
    doc.setTextColor(0);

    for (const sec of STEP_KEYS) {
      const secData: any = (data as any)[sec] || {};
      if (Object.keys(secData).length === 0) continue;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(r, g, b);
      doc.text(t(`anamnesis.steps.${sec}.label`), margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0);
      for (const [k, v] of Object.entries(secData)) {
        if (v == null || v === "") continue;
        const label = t(`anamnesis.fields.${k}`) || k;
        const val = typeof v === "boolean" ? (v ? t("anamnesis.yes") : t("anamnesis.no")) : String(v);
        const lines = doc.splitTextToSize(`${label}: ${val}`, 180);
        if (y + lines.length * 5 > 280) { doc.addPage(); y = 20; }
        doc.text(lines, margin, y);
        y += lines.length * 5 + 1;
      }
      y += 4;
    }

    // Signature footer on last page
    if (y > 250) { doc.addPage(); y = 20; }
    y = Math.max(y + 10, 250);
    doc.setDrawColor(r, g, b);
    doc.line(margin, y, 90, y);
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(signatureLabel, margin, y + 5);
    doc.line(120, y, 195, y);
    doc.text("Date", 120, y + 5);

    doc.save(`anamnesis-${user.id}.pdf`);
  };

  return (
    <>
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-primary" />
            {t("anamnesis.myIntake")}
            <Badge variant={status === "completed" ? "default" : "outline"} className="ml-auto text-[10px]">
              {statusLabel[status]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("anamnesis.cardHelp")}</p>

          {reminderDays !== null && status !== "completed" && status !== "reviewed" && (
            <div className="flex items-center gap-2 text-[11px] rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-1.5">
              <Bell className="h-3 w-3 shrink-0" />
              <span>
                {reminderDays === 0
                  ? t("anamnesis.reminderToday") || "Reminder sent today"
                  : `${t("anamnesis.reminderSent") || "Reminder sent"} ${reminderDays}${t("anamnesis.daysAgoShort") || "d ago"}`}
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t("anamnesis.progress")}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {missingSteps.length > 0 && status !== "completed" && status !== "reviewed" && (
            <div className="rounded-md border border-border/60 bg-muted/40 p-2 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                {t("anamnesis.missingSteps") || "Steps to complete"} ({missingSteps.length})
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-0.5 pl-4 list-disc">
                {missingSteps.slice(0, 4).map((s) => (
                  <li key={s}>{t(`anamnesis.steps.${s}.label`)}</li>
                ))}
                {missingSteps.length > 4 && (
                  <li className="list-none italic">+{missingSteps.length - 4} more</li>
                )}
              </ul>
            </div>
          )}

          <Button size="sm" className="w-full" onClick={() => navigate("/intake")} disabled={loading}>
            {progress > 0 ? t("anamnesis.continue") : t("anamnesis.start")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          {(status === "completed" || status === "reviewed") && (
            <Button size="sm" variant="outline" className="w-full" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-1" /> {t("anamnesis.downloadPdf")}
            </Button>
          )}
        </CardContent>
      </Card>
      <AnamnesisDrawer open={open} onOpenChange={setOpen} clientId={user.id} />
    </>
  );
};

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "").match(/.{1,2}/g);
  if (!m || m.length < 3) return [107, 31, 42];
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
}

export default AnamnesisCard;
