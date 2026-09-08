/**
 * Sign-in must never re-run signup's password complexity rules.
 *
 * Those rules (8+ chars, uppercase, lowercase, a number) describe what a NEW
 * password must satisfy at creation time. Running them again at login means
 * any account whose password predates a rule tightening, or simply doesn't
 * match the current regex, fails before the request ever reaches Supabase —
 * with a client-side "must contain a number" message that is indistinguishable
 * from a real wrong-password error, except retyping the (correct) password
 * can never fix it. This was a real bug: it silently locked out existing
 * users, not attackers.
 *
 * Verified at the source level rather than by mounting the page: the page
 * pulls in Supabase, routing, toast, and locale context, and none of that
 * machinery is what's under test — the absence of one specific validation
 * call in one specific handler is.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { friendlyAuthError } from "@/lib/auth/friendlyAuthError";

const ROOT = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");

describe("sign-in does not gate on signup password complexity", () => {
  const source = read("src/pages/Auth.tsx");

  const handleLogin = source.slice(
    source.indexOf("const handleLogin ="),
    source.indexOf("const handleSignup =")
  );
  const handleSignup = source.slice(
    source.indexOf("const handleSignup ="),
    source.indexOf("const handleSuggestPassword =")
  );

  it("never runs passwordSchema against the login password", () => {
    expect(handleLogin).not.toMatch(/passwordSchema\.parse\(loginData\.password\)/);
  });

  it("still requires a password to be entered before calling signIn", () => {
    // Removing the complexity check must not remove all validation — an empty
    // field should fail locally, not round-trip to Supabase.
    expect(handleLogin).toMatch(/if \(!loginData\.password\)/);
  });

  it("keeps the complexity check on signup, where it belongs", () => {
    expect(handleSignup).toMatch(/passwordSchema\.parse\(signupData\.password\)/);
  });
});

describe("friendlyAuthError", () => {
  const t = (key: string) => key;

  it("translates the common Supabase auth failures", () => {
    expect(friendlyAuthError("Invalid login credentials", t)).toBe("auth.errorInvalidCredentials");
    expect(friendlyAuthError("Email not confirmed", t)).toBe("auth.errorEmailNotConfirmed");
    expect(friendlyAuthError("User already registered", t)).toBe("auth.errorEmailTaken");
    expect(friendlyAuthError("Email rate limit exceeded", t)).toBe("auth.errorRateLimited");
  });

  it("is case-insensitive, since Supabase's casing is not a stable contract", () => {
    expect(friendlyAuthError("INVALID LOGIN CREDENTIALS", t)).toBe("auth.errorInvalidCredentials");
  });

  it("falls through to the raw message for anything unrecognized", () => {
    // A silent generic string would hide a genuinely new failure mode; the
    // raw text stays visible instead, even though it's unlocalized.
    const novel = "Something Supabase has never returned before";
    expect(friendlyAuthError(novel, t)).toBe(novel);
  });
});
