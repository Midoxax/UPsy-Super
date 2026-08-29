import { motion } from "framer-motion";
import { ReactNode } from "react";
import { crystalDissolve } from "@/lib/motion/variants";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      variants={crystalDissolve}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: "transform, filter, opacity" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
