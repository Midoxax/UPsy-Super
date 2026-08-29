import { ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import { Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useCurrentTier,
  hasTier,
  TIER_LABEL,
  type MembershipTier,
} from "@/hooks/useMembership";

interface Props {
  tier: MembershipTier;
  children: ReactNode;
  fallback?: ReactNode;
  /** When true, blur the children behind the upgrade card instead of hiding them. */
  showPreview?: boolean;
  reason?: string;
}

/**
 * Gates a subtree behind a membership tier.
 * Anyone at or above `tier` sees the children. Others see an upgrade card.
 */
export const TierGate = ({ tier, children, fallback, showPreview, reason }: Props) => {
  const { tier: owned, loading } = useCurrentTier();

  if (loading) {
    return (
      <div className="rounded-u-md border border-border/40 bg-card/40 p-6 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded-sm mb-3" />
        <div className="h-3 w-48 bg-muted rounded-sm" />
      </div>
    );
  }

  if (hasTier(owned, tier)) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  const upgrade = (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3 w-3" />
          {TIER_LABEL[tier]}
        </span>
      </div>
      <div className="flex items-start gap-4">
        <div className="rounded-u-sm bg-primary/10 p-2.5">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-semibold text-foreground">
            Unlock with {TIER_LABEL[tier]}
          </h4>
          <p className="text-sm text-muted-foreground">
            {reason ??
              `This space is reserved for ${TIER_LABEL[tier]} members. Upgrade to get access.`}
          </p>
          <Button asChild size="sm" className="mt-2">
            <Link to="/membership">See plans</Link>
          </Button>
        </div>
      </div>
    </Card>
  );

  if (!showPreview) return upgrade;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-xs opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-6">{upgrade}</div>
    </div>
  );
};