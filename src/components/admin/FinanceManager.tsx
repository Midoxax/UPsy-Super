// Finance console — issue invoices, reconcile bank transfers, watch the
// auto-entrepreneur turnover ceiling. Invoices are never deleted: cancelling
// marks them void and keeps the number, so the sequence stays gapless.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Download,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { downloadCsv } from "@/lib/admin/csv";
import {
  AE_CEILING_MAD,
  useContactOptions,
  useFinanceMutations,
  useInvoices,
  usePayments,
  useRevenueYtd,
  type Invoice,
} from "@/hooks/admin/useFinance";

const KINDS = [
  { key: "client_session", label: "Client session" },
  { key: "commission", label: "Specialist commission" },
  { key: "b2b_program", label: "B2B program" },
  { key: "training", label: "Training" },
];

const mad = (n: number) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 2 }).format(n);

const statusTone: Record<Invoice["status"], string> = {
  issued: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  partially_paid: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  void: "bg-muted text-muted-foreground border-border",
};

const daysOverdue = (inv: Invoice) => {
  if (!inv.due_at || inv.status === "paid" || inv.status === "void") return 0;
  const diff = Math.floor((Date.now() - new Date(inv.due_at).getTime()) / 864e5);
  return diff > 0 ? diff : 0;
};

const FinanceManager = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const invoices = useInvoices(statusFilter);
  const payments = usePayments();
  const revenue = useRevenueYtd();
  const contacts = useContactOptions();
  const { issueInvoice, recordPayment, voidInvoice } = useFinanceMutations();

  const [form, setForm] = useState({ contactId: "", subtotal: "", kind: "client_session", dueDays: "7", notes: "" });
  const [pay, setPay] = useState({ invoiceId: "", amount: "", receivedAt: new Date().toISOString().slice(0, 10), bankRef: "" });

  const rows = invoices.data ?? [];
  const outstanding = useMemo(
    () => rows.filter((i) => i.status === "issued" || i.status === "partially_paid"),
    [rows],
  );
  const overdue = useMemo(() => outstanding.filter((i) => daysOverdue(i) > 0), [outstanding]);
  const collected = revenue.data?.collected ?? 0;
  const ceilingPct = Math.min(100, Math.round((collected / AE_CEILING_MAD) * 100));

  const submitInvoice = async () => {
    const subtotal = Number(form.subtotal);
    if (!form.contactId || !subtotal || subtotal <= 0) {
      toast.error("Pick a contact and a positive amount.");
      return;
    }
    try {
      const inv = await issueInvoice.mutateAsync({
        contactId: form.contactId,
        subtotal,
        kind: form.kind,
        dueDays: Number(form.dueDays) || 7,
        notes: form.notes || undefined,
      });
      toast.success(`Invoice ${inv?.number ?? ""} issued`);
      setForm({ contactId: "", subtotal: "", kind: "client_session", dueDays: "7", notes: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not issue the invoice.");
    }
  };

  const submitPayment = async () => {
    const amount = Number(pay.amount);
    if (!pay.invoiceId || !amount || amount <= 0) {
      toast.error("Pick an invoice and a positive amount.");
      return;
    }
    try {
      await recordPayment.mutateAsync({
        invoiceId: pay.invoiceId,
        amount,
        receivedAt: pay.receivedAt,
        bankRef: pay.bankRef || undefined,
      });
      toast.success("Payment matched");
      setPay({ invoiceId: "", amount: "", receivedAt: new Date().toISOString().slice(0, 10), bankRef: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record the payment.");
    }
  };

  const exportCsv = () =>
    downloadCsv(
      "upsy-invoices.csv",
      rows.map((i) => ({
        number: i.number,
        issued_at: i.issued_at,
        due_at: i.due_at ?? "",
        kind: i.kind,
        status: i.status,
        total_mad: i.total_mad,
        payment_ref: i.payment_ref,
      })),
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Collected YTD</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-mono">{mad(collected)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Issued YTD</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-mono">{mad(revenue.data?.issued ?? 0)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-mono">{mad(outstanding.reduce((s, i) => s + Number(i.total_mad), 0))}</p>
            <p className="text-xs text-muted-foreground mt-1">{overdue.length} overdue</p>
          </CardContent>
        </Card>
        <Card className={ceilingPct >= 80 ? "border-amber-500/40" : undefined}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {ceilingPct >= 80 ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <ShieldCheck className="h-4 w-4" />}
              AE ceiling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={ceilingPct} />
            <p className="text-xs text-muted-foreground">{ceilingPct}% of {mad(AE_CEILING_MAD)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="issue">Issue</TabsTrigger>
          <TabsTrigger value="reconcile">Reconcile</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="partially_paid">Partially paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              {invoices.isLoading ? (
                <div className="p-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : rows.length === 0 ? (
                <p className="p-8 text-sm text-muted-foreground text-center">No invoices yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                    <tr>
                      <th scope="col" className="p-3">Number</th>
                      <th scope="col" className="p-3">Issued</th>
                      <th scope="col" className="p-3">Kind</th>
                      <th scope="col" className="p-3">Total</th>
                      <th scope="col" className="p-3">Status</th>
                      <th scope="col" className="p-3">Reference</th>
                      <th scope="col" className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((i) => (
                      <tr key={i.id} className="border-b last:border-0">
                        <td className="p-3 font-mono">{i.number}</td>
                        <td className="p-3 text-muted-foreground">{i.issued_at}</td>
                        <td className="p-3">{KINDS.find((k) => k.key === i.kind)?.label ?? i.kind}</td>
                        <td className="p-3 font-mono">{mad(Number(i.total_mad))}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={statusTone[i.status]}>{i.status.replace("_", " ")}</Badge>
                          {daysOverdue(i) > 0 && (
                            <span className="ml-2 text-xs text-amber-600">D+{daysOverdue(i)}</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{i.payment_ref}</td>
                        <td className="p-3 text-right">
                          {i.status !== "paid" && i.status !== "void" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => voidInvoice.mutate(i.id)}
                            >
                              Void
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Issue an invoice</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fin-contact">Contact</Label>
                <Select value={form.contactId} onValueChange={(v) => setForm((f) => ({ ...f, contactId: v }))}>
                  <SelectTrigger id="fin-contact"><SelectValue placeholder="Select a contact" /></SelectTrigger>
                  <SelectContent>
                    {(contacts.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name || c.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-kind">Kind</Label>
                <Select value={form.kind} onValueChange={(v) => setForm((f) => ({ ...f, kind: v }))}>
                  <SelectTrigger id="fin-kind"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => <SelectItem key={k.key} value={k.key}>{k.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-amount">Amount (MAD, VAT-exempt)</Label>
                <Input id="fin-amount" inputMode="decimal" value={form.subtotal}
                  onChange={(e) => setForm((f) => ({ ...f, subtotal: e.target.value }))} placeholder="600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fin-due">Due in (days)</Label>
                <Input id="fin-due" inputMode="numeric" value={form.dueDays}
                  onChange={(e) => setForm((f) => ({ ...f, dueDays: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fin-notes">Description</Label>
                <Textarea id="fin-notes" value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Protocol / session description shown on the invoice" />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground max-w-md">
                  TVA non applicable — régime de l'auto-entrepreneur. The number is allocated
                  server-side and can never be reused or deleted.
                </p>
                <Button onClick={submitInvoice} disabled={issueInvoice.isPending}>
                  {issueInvoice.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconcile" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Banknote className="h-4 w-4" /> Match a bank transfer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pay-invoice">Invoice</Label>
                <Select value={pay.invoiceId} onValueChange={(v) => setPay((p) => ({ ...p, invoiceId: v }))}>
                  <SelectTrigger id="pay-invoice"><SelectValue placeholder="Outstanding invoices" /></SelectTrigger>
                  <SelectContent>
                    {outstanding.map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.number} — {mad(Number(i.total_mad))}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-amount">Amount received (MAD)</Label>
                <Input id="pay-amount" inputMode="decimal" value={pay.amount}
                  onChange={(e) => setPay((p) => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-date">Value date</Label>
                <Input id="pay-date" type="date" value={pay.receivedAt}
                  onChange={(e) => setPay((p) => ({ ...p, receivedAt: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-ref">Bank reference</Label>
                <Input id="pay-ref" value={pay.bankRef}
                  onChange={(e) => setPay((p) => ({ ...p, bankRef: e.target.value }))} placeholder="Statement line ref" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={submitPayment} disabled={recordPayment.isPending}>
                  {recordPayment.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Record payment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent payments</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {(payments.data ?? []).length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">Nothing matched yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                    <tr>
                      <th scope="col" className="p-3">Date</th>
                      <th scope="col" className="p-3">Amount</th>
                      <th scope="col" className="p-3">Method</th>
                      <th scope="col" className="p-3">Bank ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(payments.data ?? []).map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="p-3 text-muted-foreground">{p.received_at}</td>
                        <td className="p-3 font-mono">{mad(Number(p.amount_mad))}</td>
                        <td className="p-3">{p.method}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{p.bank_ref ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceManager;
