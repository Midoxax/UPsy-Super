// Automations, owner notifications and the consent-evidence export.

import { useState } from "react";
import { toast } from "sonner";
import { Bell, Download, Loader2, ShieldCheck, Workflow } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { downloadCsv } from "@/lib/admin/csv";
import {
  crmAtLeast,
  fetchConsentEvidence,
  useCrmAutomationRules,
  useCrmNotifications,
  useCrmOpsMutations,
  useCrmRole,
} from "@/hooks/admin/useCrmOps";

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
};

const CrmAutomationsPanel = ({ onOpenContact }: { onOpenContact: (id: string) => void }) => {
  const { data: rules = [], isLoading } = useCrmAutomationRules();
  const { data: notifications = [] } = useCrmNotifications();
  const { data: role } = useCrmRole();
  const { toggleRule, markNotificationRead } = useCrmOpsMutations();
  const [exporting, setExporting] = useState(false);
  const canManage = crmAtLeast(role ?? null, "manager");

  const exportConsent = async () => {
    setExporting(true);
    try {
      const rows = await fetchConsentEvidence();
      if (!rows.length) {
        toast.error("No consent records to export");
        return;
      }
      downloadCsv(
        `crm-consent-evidence-${new Date().toISOString().slice(0, 10)}`,
        rows as never[],
        [
          "email", "full_name", "contact_type", "lifecycle", "source", "first_touch",
          "contact_created_at", "purpose", "granted", "basis", "recorded_at",
          "withdrawn_at", "evidence",
        ]
      );
      toast.success(`${rows.length} consent rows exported`);
    } catch (e) {
      toast.error("Export refused — manager access required");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Consent evidence export
          </CardTitle>
          <Button onClick={exportConsent} disabled={exporting || !canManage} className="gap-2">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          One row per contact and consent purpose: grant state, legal basis, timestamps,
          withdrawal, the captured evidence payload and the acquisition source — the artefact an
          auditor asks for under Law 09-08 / GDPR. Manager access only.
          {!canManage && (
            <span className="mt-2 block text-xs text-destructive">
              Your CRM role cannot export consent evidence.
            </span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Workflow className="h-4 w-4" /> Funnel automations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {rules.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  on <code>{r.event_kind}</code>
                  {r.source_match ? ` · source ${r.source_match}` : ""} → {r.pipeline} / {r.stage}
                  {r.set_lifecycle ? ` · lifecycle ${r.set_lifecycle}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {r.notify && <Badge variant="secondary">notifies owner</Badge>}
                <Switch
                  checked={r.active}
                  disabled={!canManage}
                  onCheckedChange={(v) => toggleRule.mutate({ id: r.id, active: v })}
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-1">
            Rules run inside the database whenever a funnel event lands on a contact: the deal is
            opened or advanced, the least-loaded owner is assigned and the owner is notified.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" /> Owner notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[420px] overflow-y-auto">
          {notifications.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing to action.</p>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-lg border px-3 py-2 ${
                n.read_at ? "border-border/40 opacity-60" : "border-primary/30 bg-primary/5"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  className="text-sm font-medium truncate text-left"
                  onClick={() => n.contact_id && onOpenContact(n.contact_id)}
                >
                  {n.title}
                </button>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {ago(n.created_at)}
                </span>
              </div>
              {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
              {!n.read_at && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-1 h-6 px-2 text-[11px]"
                  onClick={() => markNotificationRead.mutate(n.id)}
                >
                  Mark read
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmAutomationsPanel;
