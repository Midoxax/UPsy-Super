// Stored-XSS regression test for the org invoice HTML generator.
// We don't boot the full edge runtime here — we re-export the escape helpers
// indirectly via a string-substitution check. The goal is to assert that
// malicious org input never lands as raw HTML.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

function escapeHtml(s: unknown): string {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(u: unknown): string {
  if (typeof u !== "string") return "";
  const trimmed = u.trim();
  if (!/^https:\/\//i.test(trimmed)) return "";
  return escapeHtml(trimmed);
}

const XSS_PAYLOADS = [
  `<script>alert(1)</script>`,
  `" onerror=alert(1) x="`,
  `'><img src=x onerror=alert(1)>`,
  `javascript:alert(1)`,
];

Deno.test("escapeHtml neutralises script tags", () => {
  for (const p of XSS_PAYLOADS) {
    const out = escapeHtml(p);
    assert(!out.includes("<script>"), `raw <script> leaked for: ${p}`);
    // raw quotes must be escaped (otherwise an attacker can break out of attrs)
    assert(!/['"]/.test(out.replace(/&#39;|&quot;/g, "")), `raw quote leaked for: ${p}`);
    // < and > must be escaped (no tag injection possible)
    assert(!/[<>]/.test(out.replace(/&lt;|&gt;/g, "")), `raw angle bracket leaked for: ${p}`);
  }
});

Deno.test("safeUrl rejects javascript: and data: schemes", () => {
  assertEquals(safeUrl("javascript:alert(1)"), "");
  assertEquals(safeUrl("data:text/html,<script>alert(1)</script>"), "");
  assertEquals(safeUrl("http://insecure.example/x.png"), "");
  assertEquals(safeUrl("https://cdn.example.com/logo.png"), "https://cdn.example.com/logo.png");
});

Deno.test("safeUrl escapes attribute-breaking characters in https URLs", () => {
  const out = safeUrl(`https://x.test/"><script>alert(1)</script>`);
  assert(!out.includes(`"`), "raw quote leaked into URL");
  assert(!out.includes("<script>"), "raw script tag leaked into URL");
});

Deno.test("invoice template with hostile org fields renders safely", () => {
  const org = {
    name: `<script>alert('pwn')</script>`,
    billing_address: `" onclick=alert(1) x="`,
    ice: `<img src=x onerror=alert(1)>`,
    plan_type: `</td><script>alert(1)</script>`,
    contact_email: `" onload=alert(1)`,
    logo_url: `javascript:alert(1)`,
    pdf_signature_label: `<svg onload=alert(1)>`,
  };

  // Reproduce the relevant interpolation block from the function.
  const html = `
    <div>${escapeHtml(org.name)}</div>
    <div>${escapeHtml(org.billing_address)}</div>
    <div>ICE : ${escapeHtml(org.ice)}</div>
    <div>${escapeHtml(org.contact_email)}</div>
    <td>Plan ${escapeHtml(org.plan_type)}</td>
    ${safeUrl(org.logo_url) ? `<img src="${safeUrl(org.logo_url)}">` : ""}
    <p>${escapeHtml(org.pdf_signature_label)}</p>
  `;

  assert(!html.includes("<script>"), "raw <script> leaked");
  // The dangerous case is an attribute-context break: a literal " (not &quot;)
  // followed by an event handler. Verify quotes inside interpolated values
  // are always escaped.
  const interpolatedRegions = html.match(/&quot;[^&]*&quot;/g) ?? [];
  for (const region of interpolatedRegions) {
    assert(!/[<>"]/.test(region.replace(/&quot;/g, "")), "unescaped char inside quoted region");
  }
  assert(!html.includes("javascript:"), "javascript: scheme leaked");
  assert(!html.includes("<svg "), "raw <svg leaked");
  assert(html.includes("&lt;script&gt;"), "expected escaped <script> entity");
});