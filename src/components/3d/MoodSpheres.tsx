import { motion } from "framer-motion";

const spheres = [
  { color: "bg-primary/60", size: "w-16 h-16", x: 20, y: 30, delay: 0, label: "Calm" },
  { color: "bg-accent/50", size: "w-12 h-12", x: 60, y: 15, delay: 0.3, label: "Focus" },
  { color: "bg-primary/40", size: "w-20 h-20", x: 45, y: 55, delay: 0.6, label: "Stress" },
  { color: "bg-accent/30", size: "w-10 h-10", x: 75, y: 50, delay: 0.2, label: "" },
  { color: "bg-primary/50", size: "w-14 h-14", x: 30, y: 70, delay: 0.5, label: "" },
];

const MoodSpheres = ({ className = "" }: { className?: string }) => (
  <div className={`relative w-full h-full ${className}`}>
    {spheres.map((s, i) => (
      <motion.div
        key={i}
        className={`absolute rounded-full ${s.color} ${s.size} blur-[1px]`}
        style={{ left: `${s.x}%`, top: `${s.y}%` }}
        animate={{ y: [0, -12, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 3, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

export default MoodSpheres;
