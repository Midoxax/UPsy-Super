import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, Sparkles, Eye, EyeOff, Check, X } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";


const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

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

const passwordStrength = (pw: string): { score: number; label: string; color: string } => {
  const r = checkPasswordRules(pw);
  let score = 0;
  if (r.length) score++;
  if (r.upper) score++;
  if (r.lower) score++;
  if (r.number) score++;
  if (r.symbol) score++;
  if (pw.length >= 12) score++;
  if (score <= 2) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 4) return { score, label: "Fair", color: "bg-yellow-500" };
  if (score === 5) return { score, label: "Strong", color: "bg-green-500" };
  return { score, label: "Excellent", color: "bg-green-600" };
};

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  // Optional prefill from acquisition funnels (e.g. /observatoire band A).
  // State-initialisation only — no change to sign-in, sign-up or redirect logic.
  const [signupData, setSignupData] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      email: (p.get("email") || "").slice(0, 200),
      password: "",
      confirmPassword: "",
      fullName: (p.get("name") || "").slice(0, 120),
    };
  });
  const [defaultTab] = useState(() =>
    new URLSearchParams(window.location.search).get("mode") === "signup" ? "signup" : "login"
  );
  // Destination the user was heading to before being bounced to /auth.
  const [oauthRedirect] = useState(
    () => new URLSearchParams(window.location.search).get("redirect") || undefined
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);

  // Auto-redirect once a session is available (covers OAuth round-trip and
  // visits to /auth while already signed in).
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    const redirectTo = new URLSearchParams(window.location.search).get("redirect");
    navigate(redirectTo || "/my-space", { replace: true });
  }, [user, authLoading, navigate]);

  const throttle = () => {
    const now = Date.now();
    if (now - lastAttempt < 2000) {
      toast({ title: "Please wait", description: "Too many attempts. Try again shortly.", variant: "destructive" });
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
      passwordSchema.parse(loginData.password);
      const { error } = await signIn(loginData.email, loginData.password);
      if (error) {
        toast({ title: t('auth.loginFailed'), description: error.message, variant: "destructive" });
      } else {
        toast({ title: t('auth.welcomeBack'), description: t('auth.welcomeBackDesc') });
        const redirectTo = new URLSearchParams(window.location.search).get("redirect");
        navigate(redirectTo || "/my-space", { replace: true });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: t('auth.validationError'), description: error.errors[0].message, variant: "destructive" });
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
      passwordSchema.parse(signupData.password);
      if (!signupData.fullName.trim()) throw new Error("Full name is required");
      if (signupData.password !== signupData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const redirectTo = new URLSearchParams(window.location.search).get("redirect") || undefined;
      const { error } = await signUp(signupData.email, signupData.password, signupData.fullName, redirectTo);
      if (error) {
        toast({ title: t('auth.signupFailed'), description: error.message, variant: "destructive" });
      } else {
        // Don't navigate — user must verify email first
        toast({
          title: t('auth.checkEmail') || "Check your email",
          description: t('auth.verifyEmailDesc') || "We sent a verification link to your email. Please confirm before signing in.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: t('auth.validationError'), description: error.errors[0].message, variant: "destructive" });
      } else if (error instanceof Error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestPassword = async () => {
    const suggested = generateStrongPassword(16);
    setSignupData((prev) => ({ ...prev, password: suggested, confirmPassword: suggested }));
    setShowPassword(true);
    setShowConfirm(true);
    try {
      await navigator.clipboard.writeText(suggested);
      toast({
        title: "Strong password generated",
        description: "Copied to clipboard. Your browser/Google Password Manager will offer to save it on signup.",
      });
    } catch {
      toast({
        title: "Strong password generated",
        description: "Save it in your password manager when prompted.",
      });
    }
  };

  const pwRules = checkPasswordRules(signupData.password);
  const pwStrength = passwordStrength(signupData.password);
  const passwordsMatch =
    signupData.confirmPassword.length > 0 && signupData.password === signupData.confirmPassword;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-surface border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="font-display text-3xl md:text-4xl font-normal tracking-tight">
            {t('auth.portalTitle')}
          </CardTitle>
          <CardDescription className="font-sans text-base">{t('auth.portalDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="space-y-4">
                <SocialAuthButtons withDivider redirect={oauthRedirect} />
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('auth.email')}</Label>
                    <Input id="login-email" type="email" required autoComplete="email" value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="your@email.com" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('auth.password')}</Label>
                    <Input id="login-password" type="password" required autoComplete="current-password" value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••" className="bg-background" />
                  </div>
                  <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('auth.loggingIn')}</> : t('auth.login')}
                  </Button>
                  <button type="button"
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors mt-2"
                    onClick={async () => {
                      if (!loginData.email) {
                        toast({ title: t('auth.enterEmail'), description: t('auth.enterEmailDesc'), variant: "destructive" });
                        return;
                      }
                      try {
                        await supabase.auth.resetPasswordForEmail(loginData.email, {
                          redirectTo: `${window.location.origin}/reset-password`,
                        });
                        toast({ title: t('auth.checkEmail'), description: t('auth.checkEmailDesc') });
                      } catch {
                        toast({ title: "Error", description: "Failed to send reset email.", variant: "destructive" });
                      }
                    }}
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-4">
                <SocialAuthButtons withDivider redirect={oauthRedirect} />
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t('auth.fullName')}</Label>
                    <Input id="signup-name" type="text" required autoComplete="name" value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      placeholder="John Doe" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <Input id="signup-email" type="email" required autoComplete="email" value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="your@email.com" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signup-password">{t('auth.password')}</Label>
                      <button
                        type="button"
                        onClick={handleSuggestPassword}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Suggest strong password
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        placeholder="••••••••"
                        className="bg-background pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupData.password && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i <= pwStrength.score ? pwStrength.color : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Strength: <span className="font-medium text-foreground">{pwStrength.label}</span>
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-0.5 pt-1">
                          {[
                            { ok: pwRules.length, label: "At least 8 characters" },
                            { ok: pwRules.upper, label: "One uppercase letter" },
                            { ok: pwRules.lower, label: "One lowercase letter" },
                            { ok: pwRules.number, label: "One number" },
                            { ok: pwRules.symbol, label: "One symbol (recommended)" },
                          ].map((r) => (
                            <li key={r.label} className="flex items-center gap-1.5">
                              {r.ok ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <X className="w-3 h-3 text-muted-foreground" />
                              )}
                              <span className={r.ok ? "text-foreground" : ""}>{r.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirm ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="bg-background pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupData.confirmPassword.length > 0 && (
                      <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-500" : "text-destructive"}`}>
                        {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground pt-1">
                      Tip: Google Password Manager and iCloud Keychain will offer to save & sync this password to your account.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isLoading || (signupData.confirmPassword.length > 0 && !passwordsMatch)}
                  >
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('auth.creatingAccount')}</> : t('auth.createAccount')}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
