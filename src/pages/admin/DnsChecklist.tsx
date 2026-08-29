// DNS cutover dashboard for upsy.ma. Tells the operator exactly which records
// to update, the TTL to set before flipping, and what success signals to watch
// after the switch. Live health probe pulls /api/public/health on both the
// stable preview and (when published) production URLs.

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Globe, RefreshCw, AlertTriangle } from "lucide-react";

type HealthCheck = {
  name: string;
  ok: boolean;
  detail?: string;
};

type HealthBody = {
  status: string;
  checks: HealthCheck[];
  version: string | null;
  environment: string;
  timestamp: string;
};

const PREVIEW_HOST = "id-preview--355cf905-7152-433f-b59d-dda69a853e16.lovable.app";
const PROD_HOST = "www.upsy.ma";

const RECORDS = [
  {
    type: "A / CNAME",
    host: "@ (upsy.ma)",
    value: "cname.upsy.ma → Lovable edge",
    ttl: "300 (5 min) during cutover; raise to 3600 after stable",
    note: "Apex A record or CNAME flatten at your registrar. Point at the Lovable edge, not the old host.",
  },
  {
    type: "CNAME",
    host: "www",
    value: "upsy.ma",
    ttl: "300 during cutover; 3600 after",
    note: "www must resolve to the apex so both hostnames serve the same deploy.",
  },
  {
    type: "TXT",
    host: "@",
    value: "v=spf1 include:_spf.resend.com ~all (or your ESP)",
    ttl: "3600",
    note: "Required for transactional email deliverability. Keep the old ESP record until mail is verified on the new one.",
  },
  {
    type: "MX",
    host: "@",
    value: "Resend / Google Workspace MX",
    ttl: "3600",
    note: "Only change MX if you are also migrating mail hosting. Do NOT touch during a web-only cutover.",
  },
  {
    type: "TXT",
    host: "_dmarc",
    value: "v=DMARC1; p=quarantine; rua=mailto:admin@upsy.ma",
    ttl: "3600",
    note: "Stage to quarantine first; promote to reject after 1 week of clean reports.",
  },
];

const SIGNALS = [
  "https://upsy.ma returns 200 (not a redirect to old host)",
  "https://www.upsy.ma returns 200 and matches the apex",
  "GTmetrix / Lighthouse mobile score ≥ 85 on the homepage",
  "No mixed-content warnings in the browser console",
  "Supabase auth sign-in completes end-to-end (Google + Apple)",
  "Webhook endpoints (CRM email events, runtime-logs) return 200",
  "DNS propagation: >95% on dnschecker.org within 30 min",
];

export default function DnsChecklist() {
  const [previewHealth, setPreviewHealth] = useState<HealthBody | null>(null);
  const [prodHealth, setProdHealth] = useState<HealthBody | null>(null);
  const [loading, setLoading] = useState(false);
  const [prodError, setProdError] = useState<string | null>(null);

  const probe = async () => {
    setLoading(true);
    setProdError(null);
    try {
      const [pv, pr] = await Promise.allSettled([
        fetch(`https://${PREVIEW_HOST}/api/public/health`, { cache: "no-store" }).then((r) =>
          r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`),
        ),
        fetch(`https://${PROD_HOST}/api/public/health`, { cache: "no-store" }).then((r) =>
          r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`),
        ),
      ]);
      setPreviewHealth(pv.status === "fulfilled" ? (pv.value as HealthBody) : null);
      if (pr.status === "fulfilled") {
        setProdHealth(pr.value as HealthBody);
      } else {
        setProdHealth(null);
        setProdError(
          pr.reason === "HTTP 404"
            ? "Not published yet — production domain returns 404. Publish first."
            : String(pr.reason),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    probe();
  }, []);

  const CheckRow = ({ c }: { c: HealthCheck }) => (
    <div className="flex items-center gap-2 text-xs">
      <CheckCircle2
        className={`h-3.5 w-3.5 ${c.ok ? "text-emerald-500" : "text-destructive"}`}
      />
      <span className={c.ok ? "text-foreground" : "text-muted-foreground line-through"}>{c.name}</span>
      {!c.ok && c.detail ? (
        <span className="text-muted-foreground">— {c.detail}</span>
      ) : null}
    </div>
  );

  const HealthCard = ({
    title,
    host,
    body,
    error,
  }: {
    title: string;
    host: string;
    body: HealthBody | null;
    error?: string | null;
  }) => (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-heading flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            {title}
          </span>
          {body ? (
            <Badge variant="outline" className={body.status === "ok" ? "border-emerald-500/40 text-emerald-600" : "border-amber-500/40 text-amber-600"}>
              {body.status}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-destructive/40 text-destructive">down</Badge>
          )}
        </CardTitle>
        <p className="text-[11px] text-muted-foreground font-mono">{host}</p>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {body ? (
          <>
            {body.checks.map((c) => (
              <CheckRow key={c.name} c={c} />
            ))}
            <p className="text-[11px] text-muted-foreground pt-2">
              version {body.version ?? "—"} · env {body.environment}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            {error ?? "Unreachable — DNS not propagated or deploy not published."}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading">DNS cutover checklist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Exact records, TTLs, and success signals for pointing upsy.ma at the Lovable edge.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={probe} disabled={loading} className="h-8">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Re-probe
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <HealthCard title="Preview (stable)" host={PREVIEW_HOST} body={previewHealth} />
        <HealthCard title="Production" host={PROD_HOST} body={prodHealth} error={prodError} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Records to update</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-border/70 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Host</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="px-3 py-2 font-medium">TTL</th>
                </tr>
              </thead>
              <tbody>
                {RECORDS.map((r) => (
                  <tr key={r.type + r.host} className="border-t border-border/40">
                    <td className="px-3 py-2 font-mono">{r.type}</td>
                    <td className="px-3 py-2 font-mono">{r.host}</td>
                    <td className="px-3 py-2">{r.value}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.ttl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {RECORDS.map((r) => (
            <p key={r.type + r.host} className="text-[11px] text-muted-foreground">
              <span className="font-mono">{r.host}</span> — {r.note}
            </p>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Before you flip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs text-muted-foreground">
            <p>1. Lower TTL on the apex and www to 300 at least 24h ahead.</p>
            <p>2. Publish the production deploy from Lovable.</p>
            <p>3. Confirm the preview health probe above is fully green.</p>
            <p>4. Take a screenshot of current DNS for rollback reference.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              After you flip — success signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {SIGNALS.map((s) => (
              <div key={s} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading">Rollback</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>
            If production is broken, restore the previous DNS A/CNAME values from the screenshot
            taken pre-cutover. TTL was lowered to 300, so recovery completes within ~5 minutes.
          </p>
          <p>
            For a code-level rollback, use the one-click Worker rollback in GitHub Actions
            (`.github/workflows/rollback.yml`).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
