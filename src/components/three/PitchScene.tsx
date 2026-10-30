import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * PitchScene: one cloud of particles that changes shape with the act being
 * read. 0 hero: a calm sphere, the mind. 1 problem: the sphere breaks apart
 * and drifts red. 2 solution: the pieces gather into a held core and a ring.
 * 3 value: they rise as a gold double helix. 4 call to action: a bright
 * portal. One geometry, positions eased on the CPU, additive points: cheap
 * enough for a phone that passed the capability check.
 */

const COUNT = 2400;

function shapes(): Float32Array[] {
  const rand = mulberry32(7);
  const sphere = new Float32Array(COUNT * 3);
  const scatter = new Float32Array(COUNT * 3);
  const ring = new Float32Array(COUNT * 3);
  const helix = new Float32Array(COUNT * 3);
  const portal = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const k = i * 3;
    // Fibonacci sphere: even spread, no clumping at the poles.
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    const R = 1.8;
    sphere.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], k);

    // Broken apart: pushed outwards unevenly, with shards left behind.
    const push = 1.3 + rand() * 2.2;
    scatter.set(
      [
        Math.cos(th) * r * R * push + (rand() - 0.5) * 1.5,
        y * R * push * 0.8 + (rand() - 0.5) * 1.5,
        Math.sin(th) * r * R * push + (rand() - 0.5) * 1.5,
      ],
      k,
    );

    // Held: a third of the points form a small core, the rest a tilted ring.
    if (i % 3 === 0) {
      const c = 0.75;
      ring.set([Math.cos(th) * r * c, y * c, Math.sin(th) * r * c], k);
    } else {
      const a = rand() * Math.PI * 2;
      const tube = 0.12 * Math.sqrt(rand());
      const b = rand() * Math.PI * 2;
      const rr = 2.3 + tube * Math.cos(b);
      ring.set([Math.cos(a) * rr, tube * Math.sin(b), Math.sin(a) * rr], k);
    }

    // Rising: two intertwined strands with rungs, bottom to top.
    const t = i / COUNT;
    const strand = i % 2 === 0 ? 0 : Math.PI;
    const ang = t * Math.PI * 6 + strand;
    const hr = 1.1;
    const rung = i % 11 === 0;
    const f = rung ? rand() * 2 - 1 : 1;
    helix.set([Math.cos(ang) * hr * f, t * 6 - 3, Math.sin(ang) * hr * f], k);

    // Portal: a bright core inside three tilted orbits, like an atom. It
    // reads the same from every angle, so the slow spin never distorts it.
    const orbit = i % 4;
    if (orbit === 0) {
      const c = 0.45 * Math.cbrt(rand());
      portal.set([Math.cos(th) * r * c, y * c, Math.sin(th) * r * c], k);
    } else {
      const pa = rand() * Math.PI * 2;
      const pr = 2 + (rand() - 0.5) * 0.08;
      const tilt = (orbit - 1) * (Math.PI / 3);
      const ox = Math.cos(pa) * pr;
      const oy = Math.sin(pa) * pr;
      portal.set([ox, oy * Math.cos(tilt), oy * Math.sin(tilt)], k);
    }
  }
  return [sphere, scatter, ring, helix, portal];
}

const COLORS = [
  [new THREE.Color("#F2B705"), new THREE.Color("#8B1E2D")],
  [new THREE.Color("#E0453A"), new THREE.Color("#5A0F1A")],
  [new THREE.Color("#F2B705"), new THREE.Color("#E8A87C")],
  [new THREE.Color("#F6D365"), new THREE.Color("#F2B705")],
  [new THREE.Color("#FFF4C2"), new THREE.Color("#F2B705")],
];

function Cloud({ stage }: { stage: number }) {
  const points = useRef<THREE.Points>(null);
  const targets = useMemo(shapes, []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(targets[0].slice(), 3),
    );
    const colors = new Float32Array(COUNT * 3);
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [targets]);
  const tmp = useMemo(() => new THREE.Color(), []);
  const material = useMemo(makeMaterial, []);

  useFrame((state, delta) => {
    const p = points.current;
    if (!p) return;
    material.uniforms.uSize.value = 7 * state.viewport.dpr;
    const s = Math.min(Math.max(stage, 0), targets.length - 1);
    const target = targets[s];
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const col = geometry.attributes.color as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const carr = col.array as Float32Array;
    // Frame-rate independent easing: the same feel at 30 and 120 fps.
    const ease = 1 - Math.pow(0.04, delta);
    const [a, b] = COLORS[s];
    for (let i = 0; i < arr.length; i++) arr[i] += (target[i] - arr[i]) * ease;
    for (let i = 0; i < COUNT; i++) {
      tmp.copy(a).lerp(b, (i % 7) / 7);
      const k = i * 3;
      carr[k] += (tmp.r - carr[k]) * ease;
      carr[k + 1] += (tmp.g - carr[k + 1]) * ease;
      carr[k + 2] += (tmp.b - carr[k + 2]) * ease;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;

    const t = state.clock.elapsedTime;
    p.rotation.y = t * (s === 1 ? 0.04 : 0.12);
    p.rotation.x = s === 4 ? 0 : Math.sin(t * 0.2) * 0.12;
    p.rotation.z = s === 2 ? 0.35 : 0;
  });

  return (
    <points ref={points} geometry={geometry}>
      <primitive object={material} attach="material" />
    </points>
  );
}

export default function PitchScene({ stage }: { stage: number }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7.5], fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
    >
      <Cloud stage={stage} />
    </Canvas>
  );
}

// Soft round points with a fixed on-screen size; the built-in points
// material draws hard squares.
function makeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uSize: { value: 7 } },
    vertexShader: `
      uniform float uSize;
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize * (7.5 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = pow(smoothstep(0.5, 0.0, d), 1.6) * 1.35;
        gl_FragColor = vec4(vColor * a, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
