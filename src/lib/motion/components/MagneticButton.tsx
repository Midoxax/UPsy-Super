import { motion } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { useMagnetic } from "../hooks/useMagnetic";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}

/** Magnetic pointer attraction wrapper for premium CTAs. */
const MagneticButton = forwardRef<HTMLDivElement, MagneticButtonProps>(
  ({ children, className = "", strength = 0.25, onClick }) => {
    const { ref, x, y } = useMagnetic<HTMLDivElement>(strength);
    return (
      <motion.div
        ref={ref}
        onClick={onClick}
        className={className}
        style={{ x, y, display: "inline-block" }}
      >
        {children}
      </motion.div>
    );
  }
);
MagneticButton.displayName = "MagneticButton";
export default MagneticButton;