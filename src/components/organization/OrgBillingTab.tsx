import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Receipt, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const OrgBillingTab = () => {
  const { user } = useAuth();

  const { data: org } = useQuery({
    queryKey: ["org-account-billing", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("organization_accounts").select("*").eq("owner_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: invoices } = useQuery({
    queryKey: ["org-invoices", org?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("organization_invoices")
        .select("*")
        .eq("org_id", org!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!org?.id,
  });

  const totalSpent = (invoices ?? []).reduce((a, inv) => a + Number(inv.total_mad ?? 0), 0);
  const totalSeats = (invoices ?? []).reduce((a, inv) => a + Number(inv.seats_billed ?? 0), 0);

  const downloadInvoice = async (invoice_id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/generate-org-invoice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ invoice_id }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch invoice");
      const html = await res.text();
      const w = window.open("", "_blank");
      if (w) { w.document.write(html); w.document.close(); }
    } catch (e: any) {
      toast.error(e.message ?? "Could not download invoice");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Billing & Invoices</h3>
        <p className="text-sm text-muted-foreground">Manage your subscription and Moroccan TVA-compliant invoices</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <CreditCard className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold capitalize">{org?.plan_type ?? "—"}</p>
          <p className="text-xs text-muted-foreground">Current Plan</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <Receipt className="h-5 w-5 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold">{totalSpent.toLocaleString()} MAD</p>
          <p className="text-xs text-muted-foreground">Total Spent (TTC)</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-accent" />
          <p className="text-xl font-bold">{totalSeats}</p>
          <p className="text-xs text-muted-foreground">Seats Billed</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xl font-bold text-chart-4">{org?.seats_total ?? 0}</p>
          <p className="text-xs text-muted-foreground">Available Seats</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg capitalize">{org?.plan_type ?? "Plan"}</CardTitle>
              <CardDescription>{org?.seats_used ?? 0} of {org?.seats_total ?? 0} seats used</CardDescription>
            </div>
            <Button variant="outline">Manage Plan</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-muted-foreground">Billing cycle</p>
              <p className="font-semibold mt-1 capitalize">{org?.billing_cycle ?? "monthly"}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-muted-foreground">Status</p>
              <p className="font-semibold mt-1 capitalize">{org?.subscription_status ?? "—"}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-muted-foreground">Tax IDs</p>
              <p className="font-semibold mt-1 text-xs">
                {org?.ice ? `ICE: ${org.ice}` : "ICE not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Invoice History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(invoices ?? []).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inv.period_start).toLocaleDateString()} → {new Date(inv.period_end).toLocaleDateString()} · {inv.seats_billed} seats
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-sm">{Number(inv.total_mad ?? 0).toLocaleString()} MAD</p>
                    <p className="text-xs text-muted-foreground">TVA {(Number(inv.tax_rate ?? 0.2) * 100).toFixed(0)}%</p>
                  </div>
                  <Badge variant="outline" className={
                    inv.status === "paid" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" :
                    inv.status === "draft" ? "bg-muted" : "bg-chart-4/10 text-chart-4 border-chart-4/20"
                  }>{inv.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => downloadInvoice(inv.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {(!invoices || invoices.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-6">No invoices yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgBillingTab;
