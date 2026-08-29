import { motion } from "framer-motion";

interface SynapsePulseProps {
  size?: "sm" | "md" | "lg";
  color?: "teal" | "gold";
  delay?: number;
}

const SynapsePulse = ({ size = "md", color = "teal", delay = 0 }: SynapsePulseProps) => {
  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const colors = {
    teal: "bg-u-teal",
    gold: "bg-u-gold",
  };

  return (
    <motion.div
      className={`${sizes[size]} ${colors[color]} rounded-full relative`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1, 1, 0],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeInOut",
      }}
    >
      {/* Outer glow ring */}
      <motion.div
        className={`absolute inset-0 ${colors[color]} rounded-full`}
        animate={{
          scale: [1, 2.5, 2.5],
          opacity: [0.8, 0, 0],
        }}
        transition={{
          duration: 2,
          delay,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeOut",
        }}
      />
    </motion.div>
  );
};

export default SynapsePulse;
