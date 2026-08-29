import { memo } from "react";
import { motion } from "framer-motion";

interface ScrollGuideProps {
  message: string;
  position?: "left" | "right";
  variant?: "wave" | "point" | "think";
}

const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * A friendly neural-node mascot that appears at scroll breakpoints
 * with speech bubbles to guide the user through the page.
 */
const ScrollGuide = memo(({ message, position = "right", variant = "wave" }: ScrollGuideProps) => {
  const isLeft = position === "left";

  const mascotSize = 56;
  const eyeExpression = variant === "think" ? "6" : "5";
  const mouthPath = variant === "think" ? "M 30 52 Q 38 48 46 52" : "M 28 50 Q 38 58 48 50";

  const mascotAnim = prefersReducedMotion
    ? {}
    : variant === "wave"
    ? { rotate: [0, -8, 8, -4, 0] }
    : variant === "point"
    ? { y: [0, -4, 0] }
    : { scale: [1, 1.05, 1] };

  return (
    <motion.div
      className={`flex items-end gap-3 py-4 md:py-6 px-4 md:px-8 max-w-sm md:max-w-md ${isLeft ? "mr-auto" : "ml-auto flex-row-reverse"}`}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      role="status"
      aria-label={message}
    >
      {/* Mascot character — decorative */}
      <motion.div
        className="flex-shrink-0"
        animate={mascotAnim}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <svg width={mascotSize} height={mascotSize} viewBox="0 0 76 76" fill="none" role="presentation">
          <circle cx="38" cy="38" r="32" fill="hsl(var(--upsy-maroon) / 0.15)" />
          <circle cx="38" cy="38" r="28" fill="hsl(var(--upsy-maroon) / 0.25)" />
          <circle cx="38" cy="38" r="22" fill="hsl(var(--primary) / 0.3)" />
          <circle cx="22" cy="22" r="3" fill="hsl(var(--upsy-gold))" opacity="0.6" />
          <circle cx="54" cy="22" r="3" fill="hsl(var(--upsy-gold))" opacity="0.6" />
          <circle cx="38" cy="58" r="3" fill="hsl(var(--upsy-gold))" opacity="0.6" />
          <line x1="22" y1="22" x2="38" y2="38" stroke="hsl(var(--upsy-gold) / 0.3)" strokeWidth="1" />
          <line x1="54" y1="22" x2="38" y2="38" stroke="hsl(var(--upsy-gold) / 0.3)" strokeWidth="1" />
          <line x1="38" y1="58" x2="38" y2="38" stroke="hsl(var(--upsy-gold) / 0.3)" strokeWidth="1" />
          <circle cx="30" cy="34" r={eyeExpression} fill="hsl(var(--foreground))" opacity="0.7" />
          <circle cx="46" cy="34" r={eyeExpression} fill="hsl(var(--foreground))" opacity="0.7" />
          <circle cx="31" cy="33" r="2" fill="hsl(var(--background))" />
          <circle cx="47" cy="33" r="2" fill="hsl(var(--background))" />
          <path d={mouthPath} stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        </svg>
      </motion.div>

      {/* Speech bubble */}
      <motion.div
        className={`relative rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground/80 bg-card/80 backdrop-blur-sm border border-border/50 shadow-xs ${
          isLeft ? "rounded-bl-sm" : "rounded-br-sm"
        }`}
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.3 }}
        aria-hidden="true"
      >
        {message}
        <div
          className={`absolute bottom-2 w-3 h-3 bg-card/80 border-border/50 rotate-45 ${
            isLeft ? "-left-1.5 border-l border-b" : "-right-1.5 border-r border-b"
          }`}
        />
      </motion.div>
    </motion.div>
  );
});

ScrollGuide.displayName = "ScrollGuide";

export default ScrollGuide;
