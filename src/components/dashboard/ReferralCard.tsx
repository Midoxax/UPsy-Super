import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ReferralCard() {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: existing } = await supabase
        .from("referrals")
        .select("code")
        .eq("referrer_id", user.id)
        .limit(1)
        .maybeSingle();

      let myCode = existing?.code as string | undefined;
      if (!myCode) {
        const { data: gen } = await supabase.rpc("generate_referral_code");
        myCode = gen as unknown as string;
        await supabase.from("referrals").insert({
          referrer_id: user.id,
          code: myCode,
          status: "pending",
        });
      }
      setCode(myCode ?? null);

      const { count: c } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id)
        .eq("status", "rewarded");
      setCount(c ?? 0);
    })();
  }, [user]);

  const link = code ? `${window.location.origin}/invite/${code}` : "";

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center gap-2">
        <Gift className="h-5 w-5 text-primary" />
        <CardTitle>Invite a friend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Share your link. When a friend completes their first session, you both get a free check-in credit.
        </p>
        <div className="flex gap-2">
          <Input readOnly value={link} className="text-xs" />
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast.success("Link copied");
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {count} successful invitation{count === 1 ? "" : "s"}
        </p>
      </CardContent>
    </Card>
  );
}
