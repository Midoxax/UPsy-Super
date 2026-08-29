import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, Download, Info, Receipt, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  useOutstandingBookings,
  useTransactionHistory,
  useDownloadInvoice,
  type OutstandingBooking,
} from "@/hooks/useClientBilling";
import { SimulateCheckoutDialog } from "./SimulateCheckoutDialog";

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    succeeded: { label: "Paid", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
    pending: { label: "Pending", className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
    failed: { label: "Failed", className: "bg-rose-500/15 text-rose-700 border-rose-500/30" },
    refunded: { label: "Refunded", className: "bg-slate-500/15 text-slate-700 border-slate-500/30" },
  };
  const cfg = map[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
};

export const ClientBillingTab = () => {
  const { data: outstanding, isLoading: loadingOut } = useOutstandingBookings();
  const { data: history, isLoading: loadingHist } = useTransactionHistory();
  const downloadInvoice = useDownloadInvoice();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<OutstandingBooking | null>(null);

  const openCheckout = (b: OutstandingBooking) => {
    setActiveBooking(b);
    setCheckoutOpen(true);
  };

  const isLoading = loadingOut || loadingHist;

  return (
    <div className="space-y-6">
      <Alert className="border-primary/30 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Payments are currently in <strong>test mode</strong>. No real charges occur. Real-money checkout will be enabled in a future release.
        </AlertDescription>
      </Alert>

      {/* Outstanding */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Outstanding payments
          </CardTitle>
          <CardDescription>Bookings awaiting deposit or balance payment</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingOut ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !outstanding?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No outstanding payments. You're all caught up.
            </p>
          ) : (
            <div className="space-y-3">
              {outstanding.map((b) => {
                const tx = b.pending_transaction;
                const amount = tx?.amount_mad ?? b.amount_mad ?? 0;
                const label = tx?.transaction_type === "deposit" ? "Pay deposit" : "Pay balance";
                return (
                  <div
                    key={b.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{b.psychologist?.full_name ?? "Session"}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(b.scheduled_at), "PPp")}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">{b.session_type} · {b.duration_minutes} min</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-semibold">{Number(amount).toFixed(2)} MAD</p>
                        {tx?.transaction_type === "deposit" && (
                          <p className="text-xs text-muted-foreground">Deposit</p>
                        )}
                      </div>
                      <Button
                        onClick={() => openCheckout(b)}
                        disabled={!tx}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {label}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payment history
          </CardTitle>
          <CardDescription>All transactions on your account</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHist ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !history?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{tx.transaction_type}</span>
                      {statusBadge(tx.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(tx.created_at), "PPp")}
                      {tx.invoice_number && <span className="ml-2">· {tx.invoice_number}</span>}
                    </p>
                    {tx.failure_reason && (
                      <p className="text-xs text-rose-600">{tx.failure_reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{Number(tx.amount_mad).toFixed(2)} MAD</span>
                    {tx.invoice_pdf_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadInvoice.mutate(tx.invoice_pdf_url!)}
                        disabled={downloadInvoice.isPending}
                        className="gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SimulateCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        transactionId={activeBooking?.pending_transaction?.id ?? null}
        amountMad={Number(activeBooking?.pending_transaction?.amount_mad ?? activeBooking?.amount_mad ?? 0)}
        psychologistName={activeBooking?.psychologist?.full_name ?? undefined}
      />
    </div>
  );
};