import { motion } from "framer-motion";

interface Props {
  score: number | null;
  size?: number;
  label?: string;
}

export default function ReadinessRing({ score, size = 220, label = "Readiness" }: Props) {
  const display = score ?? 0;
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (display / 100) * circumference;
  const tier =
    display >= 80 ? { color: "hsl(142 70% 45%)", label: "Peak" } :
    display >= 60 ? { color: "hsl(var(--primary))", label: "Ready" } :
    display >= 40 ? { color: "hsl(38 95% 55%)", label: "Caution" } :
                    { color: "hsl(0 75% 55%)", label: "Recover" };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted) / 0.3)" strokeWidth={10} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tier.color}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: score == null ? circumference : offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {score == null ? (
          <>
            <p className="text-3xl font-bold text-muted-foreground">—</p>
            <p className="text-xs text-muted-foreground mt-1">No check-in yet</p>
          </>
        ) : (
          <>
            <p className="text-5xl font-bold text-foreground tracking-tight">{display}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
            <p className="text-sm font-medium mt-1" style={{ color: tier.color }}>{tier.label}</p>
          </>
        )}
      </div>
    </div>
  );
}