import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useSimulatePayment } from "@/hooks/useClientBilling";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string | null;
  amountMad: number;
  psychologistName?: string;
}

export const SimulateCheckoutDialog = ({ open, onOpenChange, transactionId, amountMad, psychologistName }: Props) => {
  const simulate = useSimulatePayment();

  const handleSimulate = async (outcome: "succeeded" | "failed") => {
    if (!transactionId) return;
    await simulate.mutateAsync({ transactionId, outcome });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-border">
        <DialogHeader>
          <DialogTitle>Complete payment</DialogTitle>
          <DialogDescription>
            {psychologistName ? `Session with ${psychologistName}` : "Confirm your session payment"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
            <span className="text-sm text-muted-foreground">Amount due</span>
            <span className="text-xl font-semibold text-foreground">{amountMad.toFixed(2)} MAD</span>
          </div>

          <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs">
              Test mode — no real money is charged. Use the buttons below to simulate the payment outcome.
              Real payments will be enabled in a future release.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleSimulate("failed")}
            disabled={simulate.isPending || !transactionId}
            className="gap-2"
          >
            {simulate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Simulate failure
          </Button>
          <Button
            onClick={() => handleSimulate("succeeded")}
            disabled={simulate.isPending || !transactionId}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {simulate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Simulate success
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};