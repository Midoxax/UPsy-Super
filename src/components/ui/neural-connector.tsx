import { motion } from "framer-motion";

interface NeuralConnectorProps {
  variant?: "synapse" | "wave" | "dendrite";
  className?: string;
}

const NeuralConnector = ({ variant = "synapse", className = "" }: NeuralConnectorProps) => {
  if (variant === "synapse") {
    return (
      <div className={`flex items-center justify-center gap-4 my-12 ${className}`}>
        <motion.div
          className="w-3 h-3 rounded-full bg-u-gold"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="flex-1 h-px bg-gradient-to-r from-u-teal to-u-gold max-w-[200px]"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div
          className="w-3 h-3 rounded-full bg-u-teal"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className={`relative h-20 my-12 overflow-hidden ${className}`}>
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="absolute w-full h-full"
        >
          <motion.path
            d="M0,30 Q150,0 300,30 T600,30 T900,30 T1200,30"
            fill="none"
            stroke="url(#neuralGradient)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--teal))" stopOpacity="0.8" />
              <stop offset="50%" stopColor="hsl(var(--gold))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--teal))" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // dendrite variant
  return (
    <div className={`flex justify-center my-12 ${className}`}>
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
        <motion.path
          d="M60,0 L40,40 L20,80"
          stroke="hsl(var(--teal))"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.path
          d="M60,0 L60,40 L60,80"
          stroke="hsl(var(--gold))"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
        <motion.path
          d="M60,0 L80,40 L100,80"
          stroke="hsl(var(--teal))"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
        />
      </svg>
    </div>
  );
};

export default NeuralConnector;
