import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Escape any string we interpolate into the invoice HTML to prevent stored XSS
// from malicious org-supplied fields (name, billing address, tax IDs, etc.).
function escapeHtml(s: unknown): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Only allow https URLs in href/src attributes; reject javascript:/data:.
function safeUrl(u: unknown): string {
  if (typeof u !== "string") return "";
  const trimmed = u.trim();
  if (!/^https:\/\//i.test(trimmed)) return "";
  return escapeHtml(trimmed);
}

function safeDate(d: unknown): string {
  if (!d) return "";
  const dt = new Date(String(d));
  if (Number.isNaN(dt.getTime())) return "";
  return escapeHtml(dt.toLocaleDateString("fr-MA"));
}

// Moroccan TVA-compliant invoice generator (HTML → returned as text/html for client-side print)
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { invoice_id } = await req.json();
    if (!invoice_id) return new Response(JSON.stringify({ error: "invoice_id required" }), { status: 400, headers: corsHeaders });

    const { data: invoice, error: invErr } = await supabase
      .from("organization_invoices")
      .select("*, organization_accounts(*)")
      .eq("id", invoice_id)
      .single();

    if (invErr || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), { status: 404, headers: corsHeaders });
    }

    const org = (invoice as any).organization_accounts;
    const tvaRate = Number(invoice.tax_rate ?? 0.20) * 100;
    const fmt = (n: number) => new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(n);

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture ${escapeHtml(invoice.invoice_number)}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 2rem; color: #1a1a1a; }
  .header { display: flex; justify-content: space-between; border-bottom: 3px solid #6B1F2A; padding-bottom: 1rem; margin-bottom: 2rem; }
  .brand { font-size: 1.5rem; font-weight: 700; color: #6B1F2A; }
  .meta { text-align: right; font-size: 0.875rem; color: #555; }
  table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
  th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e5e5; }
  th { background: #f8f8f8; font-weight: 600; }
  .totals { margin-left: auto; width: 50%; }
  .totals td { padding: 0.5rem 0.75rem; }
  .totals .grand { font-size: 1.125rem; font-weight: 700; border-top: 2px solid #6B1F2A; }
  .legal { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e5e5; font-size: 0.75rem; color: #666; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
  .block h3 { font-size: 0.875rem; text-transform: uppercase; color: #888; margin-bottom: 0.5rem; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">U.Psy</div>
      <div style="font-size: 0.875rem; color: #555;">Plateforme de santé mentale</div>
    </div>
    <div class="meta">
      <div><strong>FACTURE</strong></div>
      <div>${escapeHtml(invoice.invoice_number)}</div>
      <div>Date : ${safeDate(invoice.created_at)}</div>
      ${invoice.due_date ? `<div>Échéance : ${safeDate(invoice.due_date)}</div>` : ""}
    </div>
  </div>

  <div class="row">
    <div class="block">
      <h3>Émetteur</h3>
      <div><strong>U.Psy SARL</strong></div>
      <div>Casablanca, Maroc</div>
      <div>ICE : 003123456000089</div>
      <div>IF : 56789012</div>
      <div>RC : 654321</div>
    </div>
    <div class="block">
      <h3>Client</h3>
      <div><strong>${escapeHtml(org?.name)}</strong></div>
      <div>${escapeHtml(org?.billing_address ?? org?.city)}</div>
      ${org?.contact_email ? `<div>${escapeHtml(org.contact_email)}</div>` : ""}
      ${org?.ice ? `<div>ICE : ${escapeHtml(org.ice)}</div>` : ""}
      ${org?.if_number ? `<div>IF : ${escapeHtml(org.if_number)}</div>` : ""}
      ${org?.rc_number ? `<div>RC : ${escapeHtml(org.rc_number)}</div>` : ""}
      ${safeUrl(org?.logo_url) ? `<div style="margin-top:8px;"><img src="${safeUrl(org.logo_url)}" alt="" style="max-height:40px;"></div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Description</th><th style="text-align:right">Quantité</th><th style="text-align:right">PU HT</th><th style="text-align:right">Total HT</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Plan ${escapeHtml(org?.plan_type ?? "Enterprise")} — Période du ${safeDate(invoice.period_start)} au ${safeDate(invoice.period_end)}</td>
        <td style="text-align:right">${invoice.seats_billed}</td>
        <td style="text-align:right">${fmt(Number(invoice.unit_price_mad))} MAD</td>
        <td style="text-align:right">${fmt(Number(invoice.subtotal_mad))} MAD</td>
      </tr>
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Total HT</td><td style="text-align:right">${fmt(Number(invoice.subtotal_mad))} MAD</td></tr>
    <tr><td>TVA ${tvaRate}%</td><td style="text-align:right">${fmt(Number(invoice.tax_mad ?? 0))} MAD</td></tr>
    <tr class="grand"><td>Total TTC</td><td style="text-align:right">${fmt(Number(invoice.total_mad ?? 0))} MAD</td></tr>
  </table>

  <div class="legal">
    <p><strong>Mentions légales :</strong> Facture conforme aux dispositions du Code Général des Impôts du Royaume du Maroc. TVA collectée au taux normal de 20%. En cas de retard de paiement, des pénalités au taux légal seront appliquées (Art. 503 du Code de Commerce marocain).</p>
    <p>Données traitées conformément à la loi 09-08 relative à la protection des personnes physiques à l'égard des traitements des données à caractère personnel (CNDP).</p>
    ${org?.pdf_signature_label ? `<p style="margin-top:1rem;">${escapeHtml(org.pdf_signature_label)}</p>` : ""}
  </div>
</body>
</html>`;

    return new Response(html, { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
  }
});
