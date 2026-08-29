/**
 * U.Psy Breathing Loader
 * A calm gold sphere that expands and contracts — replaces traditional spinners.
 */
const BreathingLoader = ({
  size = "md",
  label,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={`${sizes[size]} rounded-full motion-breathe`}
          style={{
            background: "radial-gradient(circle, rgba(255,179,0,0.25), transparent 70%)",
          }}
        />
        {/* Core sphere */}
        <div
          className={`${sizes[size]} rounded-full motion-breathe absolute inset-0`}
          style={{
            background: "radial-gradient(circle at 40% 35%, hsl(42 100% 50%), hsl(39 100% 48%))",
            animationDelay: "0.1s",
          }}
        />
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-foreground tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
};

export default BreathingLoader;
