import lsspm from "@/assets/lsspm-logo.webp";
import { cn } from "@/lib/utils";
import { useMembershipCopy } from "@/lib/league/membershipCopy";

/** The League's badge on a confirmed member's public card or profile. */
export default function LeagueMemberBadge({
  variant = "chip",
  className,
}: {
  /** "chip" sits on a photo; "inline" sits with text badges. */
  variant?: "chip" | "inline";
  className?: string;
}) {
  const { t } = useMembershipCopy();
  return (
    <span
      title={t.badgeHint}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        variant === "chip"
          ? "bg-white/95 py-0.5 pe-2.5 ps-0.5 text-[11px] text-[#1d4e89] shadow-[0_4px_14px_-4px_rgba(29,78,137,0.6)]"
          : "border border-[#1d4e89]/30 bg-[#1d4e89]/5 py-0.5 pe-2.5 ps-0.5 text-xs text-[#1d4e89] dark:text-sky-300",
        className,
      )}
    >
      <img
        src={lsspm}
        alt=""
        width={256}
        height={256}
        className="h-5 w-5 rounded-full bg-white"
        draggable={false}
      />
      {t.badge}
      <span className="sr-only"> — {t.badgeHint}</span>
    </span>
  );
}
