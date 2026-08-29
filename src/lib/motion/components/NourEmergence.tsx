import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe";

interface NourEmergenceProps {
  size?: number;
  className?: string;
  particleCount?: number;
}

/**
 * Nour Emergence — particles converge into a luminous core, then orbit slowly.
 * Canvas2D only. The signature "AI awakens" motion for Nour AI surfaces.
 */
const NourEmergence = ({ size = 320, className = "", particleCount = 64 }: NourEmergenceProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const start = performance.now();

    type P = { angle: number; radius: number; targetR: number; speed: number; hueShift: number };
    const particles: P[] = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: size * 0.55 + Math.random() * 40,
      targetR: size * 0.28 + Math.random() * 18,
      speed: 0.0006 + Math.random() * 0.0008,
      hueShift: Math.random() * 14 - 7,
    }));

    let raf = 0;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const converge = Math.min(t / 2.2, 1); // 0 → 1 in 2.2s
      const ease = 1 - Math.pow(1 - converge, 3);

      ctx.clearRect(0, 0, size, size);

      // Core glow
      const coreR = 18 + ease * 22 + Math.sin(t * 1.2) * 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
      grad.addColorStop(0, `hsla(42, 100%, 62%, ${0.55 * ease})`);
      grad.addColorStop(0.4, `hsla(350, 70%, 38%, ${0.35 * ease})`);
      grad.addColorStop(1, "hsla(350, 70%, 30%, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      for (const p of particles) {
        const r = p.radius + (p.targetR - p.radius) * ease;
        p.angle += p.speed * (1 + ease * 2) * 16;
        const x = cx + Math.cos(p.angle) * r;
        const y = cy + Math.sin(p.angle) * r;
        const alpha = 0.15 + ease * 0.55;
        ctx.beginPath();
        ctx.arc(x, y, 1.4 + ease * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${42 + p.hueShift}, 95%, ${55 + ease * 10}%, ${alpha})`;
        ctx.shadowColor = "hsla(42, 100%, 60%, 0.6)";
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(tick);
    };

    if (reduced) {
      // Static "settled" frame
      ctx.clearRect(0, 0, size, size);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.45);
      grad.addColorStop(0, "hsla(42, 100%, 62%, 0.5)");
      grad.addColorStop(1, "hsla(350, 70%, 30%, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(raf);
  }, [size, particleCount, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default NourEmergence;