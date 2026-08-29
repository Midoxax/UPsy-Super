import { AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRetryProvisioning } from "@/hooks/admin/useAdminMutations";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import type { ProvisioningAttempt } from "@/hooks/useProvisioningAttempts";

interface Props {
  applicationId: string;
  lastAttempt?: ProvisioningAttempt;
}

export const ProvisioningResultBanner = ({ applicationId, lastAttempt }: Props) => {
  const retry = useRetryProvisioning();
  const { user } = useAdminAuth();

  if (!lastAttempt) return null;
  if (lastAttempt.status === "success") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-green-500/30 bg-green-500/5 text-xs text-green-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Last provisioning succeeded · {lastAttempt.duration_ms ?? 0}ms</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-red-500/30 bg-red-500/5">
      <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-red-600">
          Last attempt {lastAttempt.status} · {lastAttempt.error_code ?? "UNKNOWN"}
        </p>
        {lastAttempt.error_message && (
          <p className="text-xs text-muted-foreground truncate">{lastAttempt.error_message}</p>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs gap-1"
        disabled={retry.isPending || !user}
        onClick={() => user && retry.mutate({ applicationId, adminUserId: user.id })}
      >
        <RefreshCw className={`h-3 w-3 ${retry.isPending ? "animate-spin" : ""}`} />
        Retry
      </Button>
    </div>
  );
};

export default ProvisioningResultBanner;