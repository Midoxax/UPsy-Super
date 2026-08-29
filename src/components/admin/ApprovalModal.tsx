import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProvisioningInspect } from "@/hooks/useProvisioningAttempts";
import { CheckCircle2, Circle } from "lucide-react";

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  applicantEmail: string;
  applicantName: string;
  applicationId?: string;
}

const Row = ({ ok, label }: { ok: boolean; label: string }) => (
  <li className="flex items-center gap-2 text-sm">
    {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
    <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
  </li>
);

const ApprovalModal = ({ open, onClose, onConfirm, applicantEmail, applicantName, applicationId }: ApprovalModalProps) => {
  const { data: state } = useProvisioningInspect(open ? applicationId : undefined);
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Application</AlertDialogTitle>
          <AlertDialogDescription>
            This will provision <strong>{applicantName}</strong> ({applicantEmail}) with psychologist access and send a localized welcome email.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state && !state.error && (
          <ul className="space-y-1.5 rounded-lg border p-3 bg-muted/30">
            <Row ok={!!state.user_exists} label="Auth account" />
            <Row ok={!!state.role_exists} label="Psychologist role" />
            <Row ok={!!state.profile_exists} label="Psychologist profile" />
            <Row ok={!!state.subscription_exists} label="Subscription" />
            {state.fully_provisioned && (
              <li className="text-xs text-emerald-600 pt-1">Already fully provisioned — re-running will be a no-op.</li>
            )}
          </ul>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Approve & Provision</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ApprovalModal;
