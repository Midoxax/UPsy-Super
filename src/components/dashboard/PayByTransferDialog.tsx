import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  paymentReference,
  usePaymentSettings,
  useSubmitPaymentProof,
  type OutstandingBooking,
} from "@/hooks/useClientBilling";

type Method = "bank_transfer" | "cashplus" | "wafacash";

const METHODS: { value: Method; label: string }[] = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cashplus", label: "CashPlus" },
  { value: "wafacash", label: "Wafacash" },
];

const Line = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <button
        type="button"
        className="flex min-w-0 items-center gap-1.5 font-medium text-right break-all"
        onClick={() => {
          navigator.clipboard?.writeText(value);
          toast.success(`${label} copied`);
        }}
      >
        {value}
        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>
    </div>
  ) : null;

export const PayByTransferDialog = ({
  booking,
  onOpenChange,
}: {
  booking: OutstandingBooking | null;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data: settings } = usePaymentSettings();
  const submit = useSubmitPaymentProof();
  const [method, setMethod] = useState<Method>("bank_transfer");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (!booking) return null;
  const amount = Number(booking.amount_mad ?? 0);
  const ref = paymentReference(booking.id);
  const cash = method !== "bank_transfer";

  const send = async () => {
    if (!file) return;
    await submit.mutateAsync({
      bookingId: booking.id,
      method,
      reference: reference.trim(),
      amountMad: amount,
      file,
    });
    setFile(null);
    setReference("");
    onOpenChange(false);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay {amount.toFixed(2)} MAD</DialogTitle>
          <DialogDescription>
            Send the fee, then upload the receipt. We confirm it within one
            working day.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => (
            <Button
              key={m.value}
              type="button"
              size="sm"
              variant={method === m.value ? "primary" : "outline"}
              onClick={() => setMethod(m.value)}
            >
              {m.label}
            </Button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-muted/30 px-3 py-2">
          {cash ? (
            <>
              <Line label="Recipient" value={settings?.cash_recipient} />
              <Line label="Phone" value={settings?.cash_phone} />
            </>
          ) : (
            <>
              <Line label="Account holder" value={settings?.account_holder} />
              <Line label="Bank" value={settings?.bank_name} />
              <Line label="RIB" value={settings?.rib} />
              <Line label="IBAN" value={settings?.iban} />
              <Line label="SWIFT" value={settings?.swift} />
            </>
          )}
          <Line label="Amount" value={`${amount.toFixed(2)} MAD`} />
          <Line label="Reference" value={ref} />
        </div>
        {settings?.instructions && (
          <p className="text-xs text-muted-foreground">
            {settings.instructions}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Write <strong>{ref}</strong> as the transfer reason so we can match
          your payment.
        </p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pay-ref">
              {cash ? "Transfer code" : "Transaction reference"} (optional)
            </Label>
            <Input
              id="pay-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={cash ? "e.g. 1234 5678" : "From your bank receipt"}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-file">Receipt (photo or PDF)</Label>
            <Input
              id="pay-file"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Later
          </Button>
          <Button onClick={send} disabled={!file || submit.isPending}>
            {submit.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Send receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
