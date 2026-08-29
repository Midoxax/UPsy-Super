import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars, Torus } from "@react-three/drei";
import * as THREE from "three";

/**
 * HeroScene — cinematic 3D orb for the marketing hero.
 * - Central distorted maroon/gold sphere (the "mind under pressure, held")
 * - Orbiting gold satellites (protocols surrounding the person)
 * - Deep-space starfield backdrop
 * Mobile-safe: dpr capped, no shadows, single geometry.
 */

function OrbitingSatellites() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.15;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });
  const satellites = [
    { r: 2.4, theta: 0, phi: 1.1, color: "#F2B705", size: 0.09 },
    { r: 2.6, theta: 2.1, phi: 1.4, color: "#F2B705", size: 0.07 },
    { r: 2.3, theta: 4.2, phi: 0.8, color: "#e8a87c", size: 0.06 },
    { r: 2.8, theta: 1.3, phi: 2.2, color: "#F2B705", size: 0.08 },
    { r: 2.5, theta: 3.5, phi: 1.9, color: "#c9a84c", size: 0.05 },
    { r: 2.7, theta: 5.4, phi: 1.0, color: "#F2B705", size: 0.075 },
  ];
  return (
    <group ref={group}>
      {satellites.map((s, i) => {
        const x = s.r * Math.sin(s.phi) * Math.cos(s.theta);
        const y = s.r * Math.cos(s.phi);
        const z = s.r * Math.sin(s.phi) * Math.sin(s.theta);
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[s.size, 24, 24]} />
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={2.6}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function CoreOrb() {
  const ref = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = t * 0.1;
      ref.current.rotation.z = t * 0.05;
    }
    if (halo.current) {
      // Slow breathing glow — the orb reads as alive rather than as a prop.
      const s = 1 + Math.sin(t * 0.8) * 0.035;
      halo.current.scale.setScalar(s);
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group>
        {/* Additive halo shells stand in for a bloom pass: no post-processing
            dependency, no extra bundle weight, and the orb stops disappearing
            into the near-black hero background. */}
        <mesh ref={halo} scale={1.07}>
          <sphereGeometry args={[1.35, 48, 48]} />
          <meshBasicMaterial
            color="#A3263A"
            transparent
            opacity={0.10}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={1.16}>
          <sphereGeometry args={[1.35, 32, 32]} />
          <meshBasicMaterial
            color="#F2B705"
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <Sphere ref={ref} args={[1.35, 96, 96]}>
          <MeshDistortMaterial
            color="#5E0E1F"
            emissive="#5A0A19"
            emissiveIntensity={0.45}
            distort={0.42}
            speed={1.6}
            roughness={0.12}
            metalness={0.9}
          />
        </Sphere>
      </group>
    </Float>
  );
}

/** Thin gold orbit rings — the "protocols" the satellites travel on. */
function OrbitRings() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.z = state.clock.elapsedTime * 0.04;
    group.current.rotation.x = 0.5 + Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
  });
  return (
    <group ref={group} rotation={[0.5, 0, 0]}>
      {[2.35, 2.75, 3.2].map((r, i) => (
        <Torus key={r} args={[r, 0.004, 8, 128]} rotation={[i * 0.5, i * 0.35, 0]}>
          <meshBasicMaterial
            color="#F2B705"
            transparent
            opacity={0.22 - i * 0.05}
            toneMapped={false}
          />
        </Torus>
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <pointLight position={[5, 5, 5]} intensity={2.2} color="#F2B705" />
        <pointLight position={[-5, -3, -2]} intensity={1.6} color="#A3263A" />
        <pointLight position={[-2.5, 1.5, 3]} intensity={1.1} color="#FFE9B0" />
        <Stars radius={40} depth={30} count={2200} factor={3.2} saturation={0} fade speed={0.6} />
        <group position={[1.5, 0.1, 0]}>
          <CoreOrb />
          <OrbitRings />
          <OrbitingSatellites />
        </group>
        {/*
          There was an <Environment preset="night" /> here. `preset` makes drei
          fetch an HDR environment map from raw.githack.com at runtime, and that
          fetch has never once succeeded in production: `connect-src` does not
          allow the host, so the browser blocks it on every load. Sentry logged
          it from www.upsy.ma as soon as error reporting went live.

          It was already wrapped in its own ErrorBoundary, so the scene kept
          rendering — which is why nobody noticed. The reflection map has simply
          never existed for any visitor; the orb has always been lit by the
          ambient and point lights above.

          Removing it is therefore a visual no-op that stops an error firing on
          every homepage load. The alternative — allowing raw.githack.com in the
          CSP — trades a decorative reflection for a connect-src entry to a
          service that proxies arbitrary GitHub repositories, which is a poor
          bargain on a platform holding clinical records. githack also asks not
          to be used for production traffic.

          To restore image-based lighting, self-host it: `npm i @pmndrs/assets`
          and pass `files={...}` so the HDR is served from this origin, covered
          by 'self' and dependent on nothing external.
        */}
      </Suspense>
    </Canvas>
  );
}