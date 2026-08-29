import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  succeeded: "bg-green-500/10 text-green-600 border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  refunded: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const TYPE_LABEL: Record<string, string> = {
  deposit: "Deposit",
  balance: "Balance",
  refund: "Refund",
  full: "Full payment",
};

const TransactionsTab = () => {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30_000,
  });

  const totals = transactions.reduce(
    (acc: any, t: any) => {
      if (t.status === "succeeded") {
        acc.gross += Number(t.amount_mad);
        acc.commission += Number(t.commission_mad);
        acc.net += Number(t.net_to_psychologist_mad);
        acc.count += 1;
      }
      return acc;
    },
    { gross: 0, commission: 0, net: 0, count: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase">Successful payments</p>
          <p className="text-2xl font-bold">{totals.count}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase">Gross volume</p>
          <p className="text-2xl font-bold">{Math.round(totals.gross).toLocaleString()} MAD</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase">Platform commission</p>
          <p className="text-2xl font-bold text-primary">{Math.round(totals.commission).toLocaleString()} MAD</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase">Net to psychologists</p>
          <p className="text-2xl font-bold">{Math.round(totals.net).toLocaleString()} MAD</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <Receipt className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-3" />
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Bookings made via the booking flow will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">When</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Commission</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Net to psy</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {transactions.map((t: any) => (
                <tr key={t.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(t.created_at), "MMM d, HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">{TYPE_LABEL[t.transaction_type] ?? t.transaction_type}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold">{Number(t.amount_mad).toLocaleString()} {t.currency}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{Number(t.commission_mad).toLocaleString()} MAD</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{Number(t.net_to_psychologist_mad).toLocaleString()} MAD</td>
                  <td className="px-4 py-3">
                    <Badge className={cn("text-xs border", STATUS_STYLES[t.status] ?? "")}>{t.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                    {t.provider}
                    {t.provider === "mock" && <span className="ml-2 text-amber-500">(test)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;