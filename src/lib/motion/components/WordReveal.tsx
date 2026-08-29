import { motion } from "framer-motion";
import { wordContainer, wordItem } from "../variants";
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe";

interface WordRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
}

/** Mask-clip word-by-word reveal for cinematic headlines. */
const WordReveal = ({ text, className = "", as = "h1", delay = 0 }: WordRevealProps) => {
  const reduced = useReducedMotionSafe();
  const Tag = motion[as] as typeof motion.h1;

  if (reduced) {
    const Static = as as any;
    return <Static className={className}>{text}</Static>;
  }

  const words = text.split(" ");

  return (
    <Tag
      className={className}
      variants={wordContainer}
      initial="hidden"
      animate="show"
      transition={{ delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
        >
          <motion.span variants={wordItem} style={{ display: "inline-block", willChange: "transform" }}>
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

export default WordReveal;