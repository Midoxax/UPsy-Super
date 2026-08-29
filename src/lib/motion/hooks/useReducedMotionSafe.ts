import { useReducedMotion } from "framer-motion";

export function useReducedMotionSafe(): boolean {
  const reduced = useReducedMotion();
  return Boolean(reduced);
}