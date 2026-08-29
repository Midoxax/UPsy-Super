/**
 * Runtime validation for required client-side environment variables.
 * Fails loudly in production (visible banner) instead of a silent blank screen.
 */
export function assertRequiredEnv(): string | null {
  const missing: string[] = [];
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
    missing.push("VITE_SUPABASE_PUBLISHABLE_KEY");

  if (missing.length === 0) return null;

  const msg = `Missing required environment variables: ${missing.join(", ")}`;
  // eslint-disable-next-line no-console
  console.error("[env-check]", msg);
  return msg;
}

export function renderEnvErrorBanner(rootId: string, message: string) {
  const root = document.getElementById(rootId);
  if (!root) return;
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#1E080E;color:#F5EFE6;font-family:system-ui,sans-serif;">
      <div style="max-width:520px;text-align:center;">
        <h1 style="font-size:22px;margin:0 0 12px;color:#F2B705;">Configuration error</h1>
        <p style="margin:0 0 8px;opacity:.9;">${message}</p>
        <p style="margin:0;font-size:13px;opacity:.65;">The app cannot start until these values are provided at build time.</p>
      </div>
    </div>`;
}