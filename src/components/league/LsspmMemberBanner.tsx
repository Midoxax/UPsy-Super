import { useLeagueMembership } from "@/hooks/useLeagueMembership";
import { useMembershipCopy, LEAGUE_NAME } from "@/lib/league/membershipCopy";
import LsspmLogo from "./LsspmLogo";

/** Shown at the top of a member's dashboard: the League's emblem and number. */
export default function LsspmMemberBanner() {
  const { data } = useLeagueMembership();
  const { t } = useMembershipCopy();
  if (!data?.active) return null;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-sky-50 to-emerald-50 p-4 dark:from-sky-950/30 dark:to-emerald-950/30">
      <LsspmLogo className="h-14 w-14 shrink-0" />
      <div className="min-w-0">
        <p className="font-semibold">{t.member}</p>
        <p className="text-xs text-muted-foreground truncate">{LEAGUE_NAME}</p>
        <p className="text-xs font-mono">{data.active.member_number}</p>
      </div>
    </div>
  );
}
