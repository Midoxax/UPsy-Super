import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link2, Unlink, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OAUTH_PROVIDERS, hasAnyOAuth } from "@/config/auth";

type Provider = "google" | "apple";

const LABEL: Record<Provider, string> = { google: "Google", apple: "Apple" };

interface Identity {
  identity_id?: string;
  id: string;
  provider: string;
  identity_data?: Record<string, unknown> | null;
}

/**
 * Lets a signed-in user attach Google / Apple to the account they already have
 * (email + password, or the other provider) instead of accidentally creating a
 * second account with the same address.
 */
const ConnectedAccountsCard = () => {
  const { toast } = useToast();
  const [identities, setIdentities] = useState<Identity[] | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.auth.getUserIdentities();
    if (error) {
      setIdentities([]);
      return;
    }
    setIdentities((data?.identities ?? []) as Identity[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!hasAnyOAuth()) return null;

  const linked = (p: Provider) => identities?.some((i) => i.provider === p) ?? false;
  const hasPassword = identities?.some((i) => i.provider === "email") ?? false;

  const link = async (provider: Provider) => {
    setPending(provider);
    try {
      // Returns the user here after consent; the session is preserved, so the
      // provider is attached to the current account rather than a new one.
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: { redirectTo: window.location.href },
      });
      if (error) throw error;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Linking failed";
      toast({
        title: "Could not link account",
        description: message.includes("Manual linking")
          ? "Account linking is disabled for this project. Signing in with the same verified email address links automatically."
          : message,
        variant: "destructive",
      });
    } finally {
      setPending(null);
    }
  };

  const unlink = async (provider: Provider) => {
    const identity = identities?.find((i) => i.provider === provider);
    if (!identity) return;
    if ((identities?.length ?? 0) < 2) {
      toast({
        title: "Keep at least one sign-in method",
        description: "Add a password or another provider before removing this one.",
        variant: "destructive",
      });
      return;
    }
    setPending(provider);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.auth.unlinkIdentity(identity as any);
      if (error) throw error;
      toast({ title: `${LABEL[provider]} disconnected` });
      await load();
    } catch (e: unknown) {
      toast({
        title: "Could not disconnect",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setPending(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Connected sign-in methods
        </CardTitle>
        <CardDescription>
          Link Google or Apple to this account so you always land on the same profile — no duplicates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
          <div className="text-sm">
            <p className="font-medium">Email &amp; password</p>
            <p className="text-muted-foreground text-xs">
              {hasPassword ? "Active on this account" : "Not set — use “Forgot password” to add one"}
            </p>
          </div>
          {hasPassword && <Badge variant="secondary">Connected</Badge>}
        </div>

        {OAUTH_PROVIDERS.map((provider) => (
          <div key={provider} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
            <div className="text-sm">
              <p className="font-medium">{LABEL[provider]}</p>
              <p className="text-muted-foreground text-xs">
                {linked(provider) ? "Connected" : `Sign in faster with ${LABEL[provider]}`}
              </p>
            </div>
            {identities === null ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : linked(provider) ? (
              <Button
                variant="outline"
                size="sm"
                disabled={pending !== null}
                onClick={() => unlink(provider)}
              >
                {pending === provider ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="mr-2 h-4 w-4" />
                )}
                Disconnect
              </Button>
            ) : (
              <Button size="sm" disabled={pending !== null} onClick={() => link(provider)}>
                {pending === provider ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="mr-2 h-4 w-4" />
                )}
                Connect
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ConnectedAccountsCard;
