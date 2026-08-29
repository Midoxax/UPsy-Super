import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, CheckCircle, Eye, EyeOff, Sparkles, Check, X } from "lucide-react";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

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
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join("");
};

const checkRules = (pw: string) => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  number: /[0-9]/.test(pw),
  symbol: /[^A-Za-z0-9]/.test(pw),
});

const strengthOf = (pw: string) => {
  const r = checkRules(pw);
  let s = 0;
  if (r.length) s++;
  if (r.upper) s++;
  if (r.lower) s++;
  if (r.number) s++;
  if (r.symbol) s++;
  if (pw.length >= 12) s++;
  if (s <= 2) return { score: s, label: "Weak", color: "bg-destructive" };
  if (s <= 4) return { score: s, label: "Fair", color: "bg-yellow-500" };
  if (s === 5) return { score: s, label: "Strong", color: "bg-green-500" };
  return { score: s, label: "Excellent", color: "bg-green-600" };
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const rules = checkRules(password);
  const strength = strengthOf(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSuggest = async () => {
    const sug = generateStrongPassword(16);
    setPassword(sug);
    setConfirmPassword(sug);
    setShowPw(true);
    setShowConfirm(true);
    try {
      await navigator.clipboard.writeText(sug);
      toast({ title: "Strong password generated", description: "Copied to clipboard." });
    } catch {
      toast({ title: "Strong password generated", description: "Save it in your password manager when prompted." });
    }
  };

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from the auth hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      passwordSchema.parse(password);

      if (password !== confirmPassword) {
        toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setIsSuccess(true);
        toast({ title: "Password updated", description: "Your password has been reset successfully." });
        setTimeout(() => navigate("/auth"), 3000);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Weak password", description: error.errors[0].message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-surface border-border text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Password Reset Successful</h2>
            <p className="text-muted-foreground">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-surface border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-h2">Reset Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-password">New Password</Label>
                <button
                  type="button"
                  onClick={handleSuggest}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Suggest strong password
                </button>
              </div>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength.score ? strength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength: <span className="font-medium text-foreground">{strength.label}</span>
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 pt-1">
                    {[
                      { ok: rules.length, label: "At least 8 characters" },
                      { ok: rules.upper, label: "One uppercase letter" },
                      { ok: rules.lower, label: "One lowercase letter" },
                      { ok: rules.number, label: "One number" },
                      { ok: rules.symbol, label: "One symbol (recommended)" },
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
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {confirmPassword.length > 0 && (
                <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? "text-green-500" : "text-destructive"}`}>
                  {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground pt-1">
                Tip: Google Password Manager and iCloud Keychain will offer to save & sync this password.
              </p>
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || (confirmPassword.length > 0 && !passwordsMatch)}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
