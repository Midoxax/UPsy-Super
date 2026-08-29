import { motion } from "framer-motion";

interface MaroonDividerProps {
  className?: string;
}

const MaroonDivider = ({ className = "" }: MaroonDividerProps) => {
  return (
    <div className={`relative h-px my-16 ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(348 82% 26% / 0.5) 50%, transparent 100%)',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(348 82% 26% / 0.3) 50%, transparent 100%)',
          filter: 'blur(8px)',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
      />
    </div>
  );
};

export default MaroonDivider;
