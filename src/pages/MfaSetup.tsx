import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

/**
 * Second-factor sign-in (TOTP) for specialists and admins. It is mandatory:
 * the route guards send them here until the session reaches aal2, and the
 * database refuses their clinical and admin data before that.
 *
 * Two modes: set up an authenticator (first time), or enter the 6-digit code
 * from the one already set up (every new sign-in).
 */

const COPY = {
  en: {
    setupTitle: "Set up two-step sign-in",
    verifyTitle: "Enter your sign-in code",
    setupDesc:
      "Required for specialists and admins: it protects your clients' records if your password is ever stolen.",
    verifyDesc: "Open your authenticator app and enter the 6-digit code.",
    start: "Start setup",
    scan: "Scan this code with Google Authenticator, Microsoft Authenticator or 1Password.",
    manual: "Or enter this key by hand:",
    codeLabel: "6-digit code",
    enable: "Verify and continue",
    verify: "Continue",
    qrAlt: "QR code for your authenticator app",
    signOut: "Sign out",
    doneTitle: "Two-step sign-in is on",
    failedTitle: "That did not work",
    invalid: "The code is wrong or expired. Try the next one.",
  },
  fr: {
    setupTitle: "Activez la connexion en deux étapes",
    verifyTitle: "Saisissez votre code de connexion",
    setupDesc:
      "Obligatoire pour les spécialistes et les administrateurs : elle protège les dossiers de vos clients si votre mot de passe est volé.",
    verifyDesc:
      "Ouvrez votre application d'authentification et saisissez le code à 6 chiffres.",
    start: "Commencer",
    scan: "Scannez ce code avec Google Authenticator, Microsoft Authenticator ou 1Password.",
    manual: "Ou saisissez cette clé à la main :",
    codeLabel: "Code à 6 chiffres",
    enable: "Vérifier et continuer",
    verify: "Continuer",
    qrAlt: "QR code pour votre application d'authentification",
    signOut: "Se déconnecter",
    doneTitle: "La connexion en deux étapes est activée",
    failedTitle: "Cela n'a pas fonctionné",
    invalid: "Le code est faux ou expiré. Essayez le suivant.",
  },
  ar: {
    setupTitle: "فعّل تسجيل الدخول بخطوتين",
    verifyTitle: "أدخل رمز الدخول",
    setupDesc:
      "إلزامي للأخصائيين والمسؤولين: يحمي ملفات مراجعيك إذا سُرقت كلمة مرورك.",
    verifyDesc: "افتح تطبيق المصادقة وأدخل الرمز المكوّن من 6 أرقام.",
    start: "ابدأ",
    scan: "امسح هذا الرمز بتطبيق Google Authenticator أو Microsoft Authenticator أو 1Password.",
    manual: "أو أدخل هذا المفتاح يدوياً:",
    codeLabel: "رمز من 6 أرقام",
    enable: "تحقّق وتابع",
    verify: "تابع",
    qrAlt: "رمز QR لتطبيق المصادقة",
    signOut: "تسجيل الخروج",
    doneTitle: "تم تفعيل الدخول بخطوتين",
    failedTitle: "لم ينجح ذلك",
    invalid: "الرمز خاطئ أو منتهي الصلاحية. جرّب الرمز التالي.",
  },
};

/** Only same-site paths; anything else falls back to the dashboard. */
const safeRedirect = (raw: string | null) =>
  raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";

export default function MfaSetup() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { locale } = useLocale();
  const t = COPY[locale as keyof typeof COPY] ?? COPY.en;
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();

  const [mode, setMode] = useState<"loading" | "setup" | "verify">("loading");
  const [busy, setBusy] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const target = safeRedirect(params.get("redirect"));

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  // Already at aal2 → go on; a verified authenticator → ask for its code.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: aal } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal2") {
        navigate(target, { replace: true });
        return;
      }
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.find((f) => f.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        setMode("verify");
      } else {
        setMode("setup");
      }
    })();
  }, [user, navigate, target]);

  const fail = (err: unknown) =>
    toast({
      title: t.failedTitle,
      description: (err as Error)?.message || t.invalid,
      variant: "destructive",
    });

  const startEnrollment = async () => {
    setBusy(true);
    try {
      // Drop authenticators left half-set-up by an abandoned attempt.
      const { data: existing } = await supabase.auth.mfa.listFactors();
      for (const f of existing?.all ?? []) {
        if (f.status !== "verified")
          await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `U.Psy ${new Date().toISOString().slice(0, 10)}`,
      });
      if (error) throw error;
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async () => {
    if (!factorId || code.length !== 6) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
      });
      if (error) throw error;
      if (mode === "setup") toast({ title: t.doneTitle });
      navigate(target, { replace: true });
    } catch {
      fail(null);
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const codeForm = (
    <>
      <div className="space-y-2">
        <Label htmlFor="code">{t.codeLabel}</Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          dir="ltr"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && submitCode()}
          placeholder="123456"
        />
      </div>
      <Button
        onClick={submitCode}
        disabled={busy || code.length !== 6}
        className="w-full"
      >
        {busy && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
        {mode === "setup" ? t.enable : t.verify}
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle as="h1">
            {mode === "verify" ? t.verifyTitle : t.setupTitle}
          </CardTitle>
          <CardDescription>
            {mode === "verify" ? t.verifyDesc : t.setupDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "loading" ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          ) : mode === "verify" ? (
            codeForm
          ) : !factorId ? (
            <Button
              onClick={startEnrollment}
              disabled={busy}
              className="w-full"
            >
              {busy && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t.start}
            </Button>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{t.scan}</p>
              {qr && (
                <div className="flex justify-center rounded-lg border bg-white p-4">
                  <img src={qr} alt={t.qrAlt} className="h-48 w-48" />
                </div>
              )}
              {secret && (
                <p className="text-center text-xs text-muted-foreground break-all">
                  {t.manual}{" "}
                  <span className="font-mono" dir="ltr">
                    {secret}
                  </span>
                </p>
              )}
              {codeForm}
            </>
          )}
          <Button
            variant="ghost"
            className="w-full"
            onClick={async () => {
              await signOut();
              navigate("/", { replace: true });
            }}
          >
            {t.signOut}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
