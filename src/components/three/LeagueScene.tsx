import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * LeagueScene: the LSSPM × U.Psy partnership in 3D.
 * - Two interlocked rings: the League's blue and U.Psy's gold, held together.
 * - A constellation of specialists on a sphere, linked to their neighbours:
 *   the national network the partnership builds.
 * - Pointer parallax; paused off screen (`active`) and still when the visitor
 *   prefers reduced motion (`still`). Mobile-safe: dpr capped, no shadows.
 */

const BLUE = "#3b82d6";
const GOLD = "#F2B705";

function fibonacciSphere(n: number, r: number) {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const t = golden * i;
    pts.push(
      new THREE.Vector3(Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r),
    );
  }
  return pts;
}

function Network({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { points, lines } = useMemo(() => {
    const pts = fibonacciSphere(84, 3.3);
    const pos = new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z]));
    // Link each specialist to their two nearest neighbours.
    const seg: number[] = [];
    pts.forEach((p, i) => {
      pts
        .map((q, j) => ({ j, d: p.distanceTo(q) }))
        .filter((x) => x.j > i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach(({ j }) =>
          seg.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z),
        );
    });
    return { points: pos, lines: new Float32Array(seg) };
  }, []);
  useFrame((state) => {
    if (!group.current || still) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.05;
    group.current.rotation.x = Math.sin(t * 0.1) * 0.12;
  });
  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={GOLD}
          size={0.07}
          sizeAttenuation
          transparent
          opacity={0.95}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={BLUE} transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
}

function Rings({ still }: { still: boolean }) {
  const blue = useRef<THREE.Mesh>(null);
  const gold = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (still) return;
    const t = state.clock.elapsedTime;
    if (blue.current) blue.current.rotation.z = t * 0.35;
    if (gold.current) gold.current.rotation.z = -t * 0.35;
    if (core.current) {
      const s = 1 + Math.sin(t * 1.4) * 0.06;
      core.current.scale.setScalar(s);
    }
  });
  return (
    <group rotation={[0.35, -0.5, 0]}>
      <mesh ref={blue} position={[-0.55, 0, 0]} rotation={[0, 0.5, 0]}>
        <torusGeometry args={[1.15, 0.13, 32, 160]} />
        <meshStandardMaterial
          color={BLUE}
          emissive={BLUE}
          emissiveIntensity={0.9}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      <mesh ref={gold} position={[0.55, 0, 0]} rotation={[Math.PI / 2, 0.5, 0]}>
        <torusGeometry args={[1.15, 0.13, 32, 160]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={0.9}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      {/* Where the two rings meet: the members. */}
      <mesh ref={core}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Parallax({
  children,
  still,
}: {
  children: React.ReactNode;
  still: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current || still) return;
    ref.current.rotation.y +=
      (state.pointer.x * 0.35 - ref.current.rotation.y) * 0.04;
    ref.current.rotation.x +=
      (-state.pointer.y * 0.2 - ref.current.rotation.x) * 0.04;
  });
  return <group ref={ref}>{children}</group>;
}

export default function LeagueScene({
  active = true,
  still = false,
}: {
  active?: boolean;
  still?: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8.2], fov: 45 }}
      frameloop={still ? "demand" : active ? "always" : "never"}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 4, 5]} intensity={40} color={GOLD} />
      <pointLight position={[-5, -3, 4]} intensity={40} color={BLUE} />
      <Stars
        radius={60}
        depth={40}
        count={still ? 600 : 1400}
        factor={3}
        fade
        speed={still ? 0 : 0.6}
      />
      <Parallax still={still}>
        <Network still={still} />
        <Float
          speed={still ? 0 : 1.4}
          rotationIntensity={still ? 0 : 0.4}
          floatIntensity={still ? 0 : 0.6}
        >
          <Rings still={still} />
        </Float>
      </Parallax>
    </Canvas>
  );
}
