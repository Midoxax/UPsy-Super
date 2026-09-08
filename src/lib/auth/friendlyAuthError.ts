/**
 * Supabase's auth error messages are plain English regardless of the visitor's
 * locale and are written for a developer reading logs, not a person trying to
 * book a session. This maps the handful that actually occur in normal use to a
 * translated, human message; anything unrecognized falls through to Supabase's
 * own text rather than being silently swallowed, so a genuinely new failure
 * mode is still visible instead of disappearing behind a generic string.
 */
export const friendlyAuthError = (raw: string, t: (key: string) => string): string => {
  const msg = raw.toLowerCase();
  if (msg.includes("invalid login credentials")) return t('auth.errorInvalidCredentials');
  if (msg.includes("email not confirmed")) return t('auth.errorEmailNotConfirmed');
  if (msg.includes("user already registered")) return t('auth.errorEmailTaken');
  if (msg.includes("rate limit")) return t('auth.errorRateLimited');
  return raw;
};
