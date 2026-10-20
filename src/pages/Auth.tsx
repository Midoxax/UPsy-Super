import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router-compat";
import { useAuth, buildEmailRedirectUrl } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Brain,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  X,
  MailCheck,
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth/friendlyAuthError";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Link } from "@/lib/router-compat";
import { addLocalePrefix } from "@/lib/i18n/utils";

const emailSchema = z.string().email("Invalid email address");
// Length is the only hard rule: composition rules (uppercase, digit, ...) add
// friction at sign-up without making passwords meaningfully stronger. The
// strength meter below still nudges people toward better ones.
const MIN_PASSWORD_LENGTH = 8;

// Generate a strong, memorable-ish password that meets all rules.
const generateStrongPassword = (length = 16): string => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const nums = "23456789";
  const syms = "!@#$%^&*?-_";
  const all = upper + lower + nums + syms;
  const rand = (set: string) => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return set[arr[0] % set.length];
  };
  const required = [rand(upper), rand(lower), rand(nums), rand(syms)];
  const rest = Array.from({ length: Math.max(length - 4, 8) }, () => rand(all));
  const combined = [...required, ...rest];
  // shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join("");
};

const checkPasswordRules = (pw: string) => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  number: /[0-9]/.test(pw),
  symbol: /[^A-Za-z0-9]/.test(pw),
});

const passwordStrength = (
  pw: string,
): {
  score: number;
  labelKey: "weak" | "fair" | "strong" | "excellent";
  color: string;
} => {
  const r = checkPasswordRules(pw);
  let score = 0;
  if (r.length) score++;
  if (r.upper) score++;
  if (r.lower) score++;
  if (r.number) score++;
  if (r.symbol) score++;
  if (pw.length >= 12) score++;
  if (score <= 2) return { score, labelKey: "weak", color: "bg-destructive" };
  if (score <= 4) return { score, labelKey: "fair", color: "bg-yellow-500" };
  if (score === 5) return { score, labelKey: "strong", color: "bg-green-500" };
  return { score, labelKey: "excellent", color: "bg-green-600" };
};

const Auth = () => {
  const navigate = useNavigate();
  // Read the query string through the router, not window: these initialisers
  // also run during server rendering, where window is undefined.
  const { search } = useLocation();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t, locale } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  // Optional prefill from acquisition funnels (e.g. /observatoire band A).
  // State-initialisation only — no change to sign-in, sign-up or redirect logic.
  const [signupData, setSignupData] = useState(() => {
    const p = new URLSearchParams(search);
    return {
      email: (p.get("email") || "").slice(0, 200),
      password: "",
      fullName: (p.get("name") || "").slice(0, 120),
    };
  });
  const [defaultTab] = useState(() =>
    new URLSearchParams(search).get("mode") === "signup" ? "signup" : "login",
  );
  // Destination the user was heading to before being bounced to /auth.
  const [oauthRedirect] = useState(
    () => new URLSearchParams(search).get("redirect") || undefined,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<
    string | null
  >(null);
  const [isResending, setIsResending] = useState(false);
  // Set when a login attempt fails because the address was never confirmed:
  // a toast alone left people stuck with no way to get a fresh link.
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  // Auto-redirect once a session is available (covers OAuth round-trip and
  // visits to /auth while already signed in).
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    const redirectTo = new URLSearchParams(window.location.search).get(
      "redirect",
    );
    navigate(redirectTo || addLocalePrefix("/my-space", locale), {
      replace: true,
    });
  }, [user, authLoading, navigate, locale]);

  const throttle = () => {
    const now = Date.now();
    if (now - lastAttempt < 2000) {
      toast({
        title: "Please wait",
        description: "Too many attempts. Try again shortly.",
        variant: "destructive",
      });
      return true;
    }
    setLastAttempt(now);
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (throttle()) return;
    setIsLoading(true);
    try {
      emailSchema.parse(loginData.email);
      // Signup's complexity rules (uppercase, number, 8+ chars, ...) must never
      // gate login: they describe what a NEW password must satisfy, not what an
      // EXISTING one does. An account created before a rule tightened, or a
      // password that simply doesn't match the current regex, would otherwise
      // fail here with a client-side "must contain a number" message instead of
      // reaching Supabase at all — indistinguishable to the user from a real
      // wrong-password error, except it can never be fixed by retyping correctly.
      if (!loginData.password)
        throw new z.ZodError([
          {
            code: "custom",
            path: ["password"],
            message: t("auth.passwordRequired"),
          },
        ]);
      const { error } = await signIn(loginData.email, loginData.password);
      if (error) {
        if (error.message?.toLowerCase().includes("email not confirmed")) {
          setUnconfirmedEmail(loginData.email);
          return;
        }
        toast({
          title: t("auth.loginFailed"),
          description: friendlyAuthError(error.message, t),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("auth.welcomeBack"),
          description: t("auth.welcomeBackDesc"),
        });
        const redirectTo = new URLSearchParams(window.location.search).get(
          "redirect",
        );
        navigate(redirectTo || addLocalePrefix("/my-space", locale), {
          replace: true,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t("auth.validationError"),
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (throttle()) return;
    setIsLoading(true);
    try {
      emailSchema.parse(signupData.email);
      if (signupData.password.length < MIN_PASSWORD_LENGTH)
        throw new Error(t("auth.errorPasswordTooShort"));
      if (!signupData.fullName.trim())
        throw new Error(t("auth.errorFullNameRequired"));
      if (!termsAccepted) throw new Error(t("auth.errorTermsRequired"));

      const redirectTo =
        new URLSearchParams(window.location.search).get("redirect") ||
        undefined;
      const { error } = await signUp(
        signupData.email,
        signupData.password,
        signupData.fullName,
        redirectTo,
      );
      if (error) {
        toast({
          title: t("auth.signupFailed"),
          description: friendlyAuthError(error.message, t),
          variant: "destructive",
        });
      } else {
        // Don't navigate — user must verify email first. The signup form is
        // replaced by a "check your inbox" panel (see below).
        setPendingVerificationEmail(signupData.email);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t("auth.validationError"),
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: t("auth.validationError"),
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestPassword = async () => {
    const suggested = generateStrongPassword(16);
    setSignupData((prev) => ({ ...prev, password: suggested }));
    setShowPassword(true);
    try {
      await navigator.clipboard.writeText(suggested);
      toast({
        title: t("auth.passwordGenerated"),
        description: t("auth.passwordGeneratedCopied"),
      });
    } catch {
      toast({
        title: t("auth.passwordGenerated"),
        description: t("auth.passwordGeneratedSave"),
      });
    }
  };

  const handleResendVerification = async (email: string | null) => {
    if (!email || isResending) return;
    setIsResending(true);
    try {
      // Same landing page as the original sign-up link, so a resent link
      // still forwards to the page the visitor was heading to.
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: buildEmailRedirectUrl(oauthRedirect) },
      });
      if (error) {
        toast({
          title: t("auth.resendFailed"),
          description: friendlyAuthError(error.message, t),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("auth.resendVerificationSent"),
          description: t("auth.resendVerificationDesc"),
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const emailFormatValid = (email: string) =>
    emailSchema.safeParse(email).success;
  const pwStrength = passwordStrength(signupData.password);
  const pwLongEnough = signupData.password.length >= MIN_PASSWORD_LENGTH;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-surface border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="font-display text-3xl md:text-4xl font-normal tracking-tight">
            {t("auth.portalTitle")}
          </CardTitle>
          <CardDescription className="font-sans text-base">
            {t("auth.portalDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="space-y-4">
                <SocialAuthButtons withDivider redirect={oauthRedirect} />
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth.email")}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={loginData.email}
                      onChange={(e) => {
                        setLoginData({ ...loginData, email: e.target.value });
                        setUnconfirmedEmail(null);
                      }}
                      placeholder="your@email.com"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t("auth.password")}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="bg-background"
                    />
                  </div>
                  {unconfirmedEmail && (
                    <div
                      role="alert"
                      className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm space-y-2"
                    >
                      <p className="font-medium text-foreground">
                        {t("auth.emailNotConfirmedTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("auth.emailNotConfirmedDesc").replace(
                          "{email}",
                          unconfirmedEmail,
                        )}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          handleResendVerification(unconfirmedEmail)
                        }
                        disabled={isResending}
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("auth.resendingVerification")}
                          </>
                        ) : (
                          t("auth.resendConfirmationEmail")
                        )}
                      </Button>
                    </div>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth.loggingIn")}
                      </>
                    ) : (
                      t("auth.login")
                    )}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors mt-1 py-1"
                    onClick={async () => {
                      if (!loginData.email) {
                        toast({
                          title: t("auth.enterEmail"),
                          description: t("auth.enterEmailDesc"),
                          variant: "destructive",
                        });
                        return;
                      }
                      try {
                        const { error } =
                          await supabase.auth.resetPasswordForEmail(
                            loginData.email,
                            {
                              redirectTo: `${window.location.origin}/reset-password`,
                            },
                          );
                        if (error) {
                          toast({
                            title: t("auth.resetFailed"),
                            description: friendlyAuthError(error.message, t),
                            variant: "destructive",
                          });
                          return;
                        }
                        toast({
                          title: t("auth.checkEmail"),
                          description: t("auth.checkEmailDesc"),
                        });
                      } catch {
                        toast({
                          title: t("auth.resetFailed"),
                          description: t("auth.resetFailedDesc"),
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    {t("auth.forgotPassword")}
                  </button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              {pendingVerificationEmail ? (
                <div className="space-y-4 text-center py-2" role="status">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MailCheck className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {t("auth.checkInboxTitle")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("auth.checkInboxDesc").split("{email}")[0]}
                    <span className="font-medium text-foreground break-all">
                      {pendingVerificationEmail}
                    </span>
                    {t("auth.checkInboxDesc").split("{email}")[1]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("auth.checkInboxSpam")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      handleResendVerification(pendingVerificationEmail)
                    }
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("auth.resendingVerification")}
                      </>
                    ) : (
                      t("auth.resendConfirmationEmail")
                    )}
                  </Button>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setPendingVerificationEmail(null)}
                  >
                    {t("auth.wrongAddressGoBack")}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <SocialAuthButtons withDivider redirect={oauthRedirect} />
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">{t("auth.fullName")}</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={signupData.fullName}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="John Doe"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t("auth.email")}</Label>
                      <div className="relative">
                        <Input
                          id="signup-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={signupData.email}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              email: e.target.value,
                            })
                          }
                          placeholder="your@email.com"
                          className="bg-background pr-8"
                        />
                        {signupData.email.length > 0 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2">
                            {emailFormatValid(signupData.email) ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground" />
                            )}
                          </span>
                        )}
                      </div>
                      {signupData.email.length > 0 &&
                        !emailFormatValid(signupData.email) && (
                          <p className="text-xs text-destructive">
                            {t("auth.errorInvalidEmailFormat")}
                          </p>
                        )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signup-password">
                          {t("auth.password")}
                        </Label>
                        <button
                          type="button"
                          onClick={handleSuggestPassword}
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          {t("auth.suggestPassword")}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          value={signupData.password}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              password: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className="bg-background pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={
                            showPassword
                              ? t("auth.hidePassword")
                              : t("auth.showPassword")
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {signupData.password && (
                        <div className="space-y-1.5">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  i <= pwStrength.score
                                    ? pwStrength.color
                                    : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t("auth.passwordStrength")}{" "}
                            <span className="font-medium text-foreground">
                              {t(`auth.strength_${pwStrength.labelKey}`)}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                            {pwLongEnough ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <X className="w-3 h-3 text-muted-foreground" />
                            )}
                            <span
                              className={pwLongEnough ? "text-foreground" : ""}
                            >
                              {t("auth.passwordMinLength")}
                            </span>
                          </p>
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground pt-1">
                        {t("auth.passwordManagerTip")}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="terms-accepted"
                        checked={termsAccepted}
                        onCheckedChange={(v) => setTermsAccepted(v === true)}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor="terms-accepted"
                        className="text-xs font-normal text-muted-foreground leading-snug cursor-pointer"
                      >
                        {t("auth.agreeToTerms").split("{terms}")[0]}
                        <Link
                          to="/terms"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          {t("auth.termsOfService")}
                        </Link>
                        {
                          t("auth.agreeToTerms")
                            .split("{terms}")[1]
                            ?.split("{privacy}")[0]
                        }
                        <Link
                          to="/privacy"
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          {t("auth.privacyPolicy")}
                        </Link>
                        {t("auth.agreeToTerms").split("{privacy}")[1]}
                      </Label>
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      disabled={isLoading || !termsAccepted}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("auth.creatingAccount")}
                        </>
                      ) : (
                        t("auth.createAccount")
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
