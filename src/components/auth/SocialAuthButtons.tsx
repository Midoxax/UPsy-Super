import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import { supabase } from "@/integrations/supabase/client";
import { hasAnyOAuth, isOAuthEnabled } from "@/config/auth";

type Provider = "google" | "apple";

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

/**
 * Starts a provider sign-in and remembers where the user should land after the
 * OAuth round-trip. `redirect` is a same-origin path only — never a full URL,
 * and never `/auth` itself (that would loop).
 */
export const startOAuth = async (provider: Provider, redirect?: string) => {
  const safe = redirect && redirect.startsWith("/") && !redirect.startsWith("//") && !redirect.startsWith("/auth")
    ? redirect
    : "/my-space";
  try {
    sessionStorage.setItem("upsy:post-oauth-redirect", safe);
  } catch {
    /* private mode — the default landing still applies */
  }
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
};

interface SocialAuthButtonsProps {
  /** Same-origin path to return to once signed in. */
  redirect?: string;
  /** Render the "or continue with" divider under the buttons. */
  withDivider?: boolean;
  className?: string;
}

/** Google / Apple sign-in buttons, usable anywhere in the app. */
export const SocialAuthButtons = ({ redirect, withDivider = false, className }: SocialAuthButtonsProps) => {
  const { toast } = useToast();
  const { t } = useLocale();
  const [pending, setPending] = useState<Provider | null>(null);

  if (!hasAnyOAuth()) return null;

  const run = async (provider: Provider) => {
    setPending(provider);
    try {
      const { error } = await startOAuth(provider, redirect ?? window.location.pathname + window.location.search);
      if (error) {
        toast({ title: t("auth.loginFailed"), description: error.message, variant: "destructive" });
      }
    } catch {
      toast({ title: t("auth.loginFailed"), description: `${provider} sign-in failed`, variant: "destructive" });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      {isOAuthEnabled("google") && (
        <Button type="button" variant="outline" className="w-full" onClick={() => run("google")} disabled={pending !== null}>
          {pending === "google" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
          {t("auth.continueWithGoogle") || "Continue with Google"}
        </Button>
      )}
      {isOAuthEnabled("apple") && (
        <Button type="button" variant="outline" className="w-full" onClick={() => run("apple")} disabled={pending !== null}>
          {pending === "apple" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AppleIcon />}
          {t("auth.continueWithApple") || "Continue with Apple"}
        </Button>
      )}
      {withDivider && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-2 text-muted-foreground">{t("auth.orContinueWith")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface SignInPromptProps {
  /** Short line explaining why sign-in is required here. */
  message?: string;
  redirect?: string;
  className?: string;
}

/**
 * Drop-in gate shown wherever the app asks an anonymous visitor to sign in:
 * social buttons first, email/password on /auth as the fallback.
 */
export const SignInPrompt = ({ message, redirect, className }: SignInPromptProps) => {
  const { t } = useLocale();
  const target = redirect ?? window.location.pathname + window.location.search;
  const href = target && !target.startsWith("/auth") ? `/auth?redirect=${encodeURIComponent(target)}` : "/auth";

  return (
    <div className={`glass-card p-4 space-y-3 text-center ${className ?? ""}`}>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <SocialAuthButtons redirect={target} />
      <Button variant="primary" size="sm" asChild className="w-full">
        <Link to={href}>{t("auth.signIn") || "Sign in"}</Link>
      </Button>
    </div>
  );
};

export default SocialAuthButtons;
