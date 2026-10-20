/** Public origin of the web app, for links in email. No trailing slash. */
export const SITE_URL = (
  Deno.env.get("PUBLIC_SITE_URL") ??
  Deno.env.get("SITE_URL") ??
  "https://www.upsy.ma"
).replace(/\/$/, "");
