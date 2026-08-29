import { useEffect, useState } from "react";
import { useSearchParams } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "ready" | "already" | "invalid" | "submitting" | "done" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
    fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string } })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return setState("invalid");
        if (j.valid === false && j.reason === "already_unsubscribed") return setState("already");
        if (j.valid) return setState("ready");
        setState("invalid");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState("submitting");
    try {
      const { data, error: err } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (err) throw err;
      if (data?.success || data?.reason === "already_unsubscribed") setState("done");
      else setState("error");
    } catch (e: any) {
      setError(e?.message ?? "Failed to unsubscribe");
      setState("error");
    }
  };

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-5">
        <h1 className="text-3xl font-display">Email preferences</h1>

        {state === "loading" && <p className="text-muted-foreground">Validating your link…</p>}

        {state === "invalid" && (
          <p className="text-muted-foreground">This unsubscribe link is invalid or has expired.</p>
        )}

        {state === "already" && (
          <p className="text-muted-foreground">You're already unsubscribed. No further emails will be sent.</p>
        )}

        {(state === "ready" || state === "submitting") && (
          <>
            <p className="text-muted-foreground">
              Confirm you want to unsubscribe from U.Psy emails. You can still access your account.
            </p>
            <Button size="lg" onClick={confirm} disabled={state === "submitting"}>
              {state === "submitting" ? "Unsubscribing…" : "Confirm unsubscribe"}
            </Button>
          </>
        )}

        {state === "done" && (
          <p className="text-muted-foreground">You've been unsubscribed. Sorry to see you go.</p>
        )}

        {state === "error" && (
          <p className="text-destructive">{error ?? "Something went wrong. Please try again."}</p>
        )}
      </div>
    </main>
  );
};

export default Unsubscribe;