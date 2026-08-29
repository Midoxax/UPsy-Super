import { Shield, Award, Star, Crown, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

const TIERS = {
  basic: {
    label: "Basic",
    icon: Shield,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-muted-foreground/20",
    ring: "",
    description: "Registered practitioner",
    level: 1,
  },
  provisional: {
    label: "Provisional",
    icon: Award,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    ring: "",
    description: "Credentials under review",
    level: 2,
  },
  verified: {
    label: "Verified",
    icon: Star,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    ring: "ring-2 ring-emerald-500/20",
    description: "Identity & credentials verified",
    level: 3,
  },
  premium: {
    label: "Premium",
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    ring: "ring-2 ring-amber-500/20",
    description: "Top-rated professional",
    level: 4,
  },
  elite: {
    label: "Elite",
    icon: Gem,
    color: "text-violet-500",
    bg: "bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10",
    border: "border-violet-500/40",
    ring: "ring-2 ring-violet-400/30",
    description: "Exceptional standing & outcomes",
    level: 5,
  },
} as const;

type TierKey = keyof typeof TIERS;

interface AccreditationBadgeProps {
  tier: string | null | undefined;
  variant?: "compact" | "full";
  className?: string;
}

export const AccreditationBadge = ({ tier, variant = "compact", className }: AccreditationBadgeProps) => {
  const key = (tier && tier in TIERS ? tier : "basic") as TierKey;
  const t = TIERS[key];
  const Icon = t.icon;

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold", t.bg, t.border, t.color, t.ring, className)}>
        <Icon className="w-3.5 h-3.5" />
        {t.label}
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border p-6 space-y-4", t.bg, t.border, t.ring, className)}>
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", t.bg, "border", t.border)}>
          <Icon className={cn("w-6 h-6", t.color)} />
        </div>
        <div>
          <p className={cn("text-lg font-bold", t.color)}>{t.label} Accreditation</p>
          <p className="text-sm text-muted-foreground">{t.description}</p>
        </div>
      </div>

      {/* Tier progress */}
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              i < t.level ? "bg-current opacity-60" : "bg-muted-foreground/10"
            )}
            style={i < t.level ? { color: `var(--${key === "elite" ? "violet" : key === "premium" ? "amber" : key === "verified" ? "emerald" : key === "provisional" ? "blue" : "muted-foreground"})` } : undefined}
          />
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Tier {t.level} of 5</span>
        <span>•</span>
        <span>U.Psy Certified</span>
      </div>
    </div>
  );
};

export const getTierFromProfile = (accreditationLevel: string | null | undefined, isAccredited: boolean | null | undefined): TierKey => {
  if (accreditationLevel && accreditationLevel in TIERS) return accreditationLevel as TierKey;
  if (isAccredited) return "verified";
  return "basic";
};
