import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

/**
 * TOTP MFA enrollment for privileged roles (psychologist / admin).
 * Uses Lovable Cloud's underlying supabase.auth.mfa API.
 */
export default function MfaSetup() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [enrolling, setEnrolling] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  const startEnrollment = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `UPSY-${Date.now()}`,
      });
      if (error) throw error;
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (err: any) {
      toast({
        title: "Enrollment failed",
        description: err.message ?? "Could not start MFA enrollment.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const verifyCode = async () => {
    if (!factorId || code.length !== 6) return;
    setVerifying(true);
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr) throw cErr;
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (vErr) throw vErr;
      toast({ title: "Two-factor enabled", description: "Your account is now protected by TOTP." });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err.message ?? "Invalid code.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle>Enable two-factor authentication</CardTitle>
          <CardDescription>
            Required for clinicians and admins to protect sensitive data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!factorId ? (
            <Button onClick={startEnrollment} disabled={enrolling} className="w-full">
              {enrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start setup
            </Button>
          ) : (
            <>
              {qr && (
                <div className="flex justify-center rounded-lg border bg-card p-4">
                  <img src={qr} alt="TOTP QR code" className="h-48 w-48" />
                </div>
              )}
              {secret && (
                <p className="text-center text-xs text-muted-foreground break-all">
                  Or enter this secret manually: <span className="font-mono">{secret}</span>
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">6-digit code from your authenticator</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                />
              </div>
              <Button
                onClick={verifyCode}
                disabled={verifying || code.length !== 6}
                className="w-full"
              >
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify and enable
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
