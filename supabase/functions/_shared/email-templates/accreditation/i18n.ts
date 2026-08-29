export type Locale = "en" | "fr" | "ar";

export function normalizeLocale(input: unknown): Locale {
  const v = String(input || "").toLowerCase().slice(0, 2);
  if (v === "en" || v === "ar") return v;
  return "fr";
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export const BRAND = {
  name: "U.Psy",
  maroon: "#6B1F2A",
  gold: "#C9A961",
  bg: "#FAF7F2",
  text: "#1A1A1A",
  muted: "#6B7280",
};

export function shellHtml(opts: { locale: Locale; title: string; body: string }): string {
  const dir = dirFor(opts.locale);
  return `<!doctype html>
<html lang="${opts.locale}" dir="${dir}">
<head><meta charset="utf-8"><title>${opts.title}</title></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:${BRAND.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(107,31,42,.08);">
        <tr><td style="background:${BRAND.maroon};padding:24px;text-align:${dir === "rtl" ? "right" : "left"};">
          <div style="color:#fff;font-size:22px;font-weight:600;letter-spacing:.5px;">U.Psy</div>
          <div style="color:${BRAND.gold};font-size:12px;margin-top:4px;">Mental Health Performance System</div>
        </td></tr>
        <tr><td style="padding:32px 28px;text-align:${dir === "rtl" ? "right" : "left"};line-height:1.6;font-size:15px;">${opts.body}</td></tr>
        <tr><td style="padding:20px 28px;border-top:1px solid #eee;color:${BRAND.muted};font-size:12px;text-align:center;">© U.Psy — upsy.ma</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}