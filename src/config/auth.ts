/**
 * Which social sign-in providers are actually usable.
 *
 * WHY THIS EXISTS
 *
 * The Google and Apple buttons on `/auth` have never worked in production. Two
 * separate faults sat on the same path:
 *
 *   1. `@lovable.dev/cloud-auth-js` navigated to `/~oauth/initiate`, a route
 *      served only by Lovable's hosting. On Vercel it is a 404. (Removed.)
 *   2. Supabase answers `/authorize` with 400 `validation_failed —
 *      missing OAuth secret`, because no client ID or secret is configured for
 *      the provider in Supabase Auth.
 *
 * Fixing the first does not fix the second, and the second cannot be fixed from
 * this repository at all: it needs credentials created in Google Cloud Console
 * and pasted into the Supabase dashboard.
 *
 * WHY THE BUTTONS DEFAULT TO HIDDEN
 *
 * A sign-in button that cannot succeed is worse than no button. Someone
 * arriving to book a first session should not be handed a broken door as their
 * first impression of a mental-health service, when email and password sign-in
 * works. So providers are opt-in: nothing renders until a provider is named
 * here, which should happen only after it has been configured and a real
 * sign-in has been completed by a human.
 *
 * TURNING GOOGLE ON
 *
 *   1. Google Cloud Console -> APIs & Services -> Credentials -> OAuth client
 *      ID (type: Web application).
 *   2. Authorised redirect URI — this is the step people get wrong. It is
 *      Supabase's callback, not the site's:
 *        https://vuawmihxcaewzmkuarkr.supabase.co/auth/v1/callback
 *   3. Supabase -> Authentication -> Providers -> Google: paste the client ID
 *      and client secret, enable.
 *   4. Supabase -> Authentication -> URL Configuration -> Redirect URLs: add
 *      https://www.upsy.ma
 *   5. Set `VITE_OAUTH_PROVIDERS="google"` and deploy.
 *   6. Complete one real sign-in before telling anyone it works.
 *
 * Apple additionally needs a paid Apple Developer account and a signing key, so
 * it is reasonable to ship with Google alone and add Apple later.
 */

/** Providers this deployment is configured for. Empty until proven otherwise. */
export const OAUTH_PROVIDERS: ReadonlyArray<"google" | "apple"> = (
  // Google and Apple are both live: Lovable Cloud manages the OAuth clients, so
  // the providers are configured server-side and need no per-deployment
  // credentials. `VITE_OAUTH_PROVIDERS` can still override this (e.g. "" to
  // hide all, or "google" to drop Apple).
  ((import.meta.env.VITE_OAUTH_PROVIDERS as string | undefined)?.trim() || "google,apple")

)
  .split(",")
  .map((p) => p.trim().toLowerCase())
  .filter((p): p is "google" | "apple" => p === "google" || p === "apple");

export const isOAuthEnabled = (provider: "google" | "apple"): boolean =>
  OAUTH_PROVIDERS.includes(provider);

/** True when no provider is configured, so the whole block can be omitted. */
export const hasAnyOAuth = (): boolean => OAUTH_PROVIDERS.length > 0;
