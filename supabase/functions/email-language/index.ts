import { createClient } from "npm:@supabase/supabase-js@2";
import { BRAND, escapeHtml } from "../_shared/email/layout.ts";
import {
  COMMON,
  LANG_CODES,
  type Lang,
  LANGS,
} from "../_shared/nurture/index.ts";

/**
 * The language links in follow-up emails: /email-language?t=<token>&l=<lang>
 * sets the language of that address's next emails. The token is the
 * address's unsubscribe token, already in the same email; an unsubscribed
 * address is left alone. Only reviewed languages can be chosen.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function page(lang: Lang, message: string, status = 200) {
  const rtl = LANGS[lang].layout === "ar";
  const html = `<!DOCTYPE html><html lang="${lang}" dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>U.Psy</title></head>
<body style="margin:0;background:${BRAND.ivory};font-family:${rtl ? BRAND.arabic : BRAND.sans};color:${BRAND.ink};">
<main style="max-width:520px;margin:64px auto;padding:32px;background:#fff;border:1px solid ${BRAND.line};border-radius:16px;text-align:center;">
<p style="font-family:${BRAND.serif};font-size:22px;font-weight:700;color:${BRAND.maroon};margin:0 0 16px;" dir="ltr">U.Psy</p>
<p style="font-size:16px;line-height:1.6;margin:0 0 24px;">${escapeHtml(message)}</p>
<a href="https://upsy.ma/${LANGS[lang].site}" style="color:${BRAND.maroon};">upsy.ma</a>
</main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") ?? "";
  const l = url.searchParams.get("l") ?? "";
  const lang = (LANG_CODES as string[]).includes(l) ? (l as Lang) : null;

  if (!lang || !LANGS[lang].reviewed || !/^[0-9a-f]{64}$/.test(token)) {
    return page("fr", "Ce lien n'est pas valide. This link is not valid.", 400);
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
  const { data: t } = await db
    .from("email_unsubscribe_tokens")
    .select("email, used_at")
    .eq("token", token)
    .maybeSingle();
  if (!t || t.used_at) {
    return page(lang, COMMON[lang].langSaved);
  }
  await db
    .from("nurture_enrolments")
    .update({ lang })
    .eq("email", String(t.email).toLowerCase());
  return page(lang, COMMON[lang].langSaved);
});
