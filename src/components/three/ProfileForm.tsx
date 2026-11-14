import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  PROFILE_PILLARS,
  axisLength,
  profileRadius,
  type ProfileScores,
} from "@/lib/profile/profileShape";

/**
 * ProfileForm — the self-score profile as a 3D form.
 *
 * It starts as the same sphere as the homepage orb and settles into the
 * visitor's own outline: the hero shows "a mind under pressure, held"; this
 * shows *their* shape. Same burgundy and gold, same geometry as ProfileGlyph
 * (both read profileShape), so the flat and 3D versions always agree.
 *
 * Deliberately small: one mesh, one outline, three lights, no drei helpers, no textures,
 * no network. The scores arrive as a prop and go nowhere else.
 *
 * It only sways; it never turns fully round. The axes must stay under the
 * labels the page draws around it.
 */

const RADIUS = 1.5;
const SETTLE_SECONDS = 1.8;

function Form({ scores: input }: { scores: ProfileScores }) {
  // Keyed on the four values, not the object: a parent re-render that passes
  // an equal profile must not restart the morph.
  const { focus, regulation, recovery, meaning } = input;
  const scores = useMemo(
    () => ({ focus, regulation, recovery, meaning }),
    [focus, regulation, recovery, meaning],
  );
  const mesh = useRef<THREE.Group>(null);
  const started = useRef<number | null>(null);
  const settled = useRef(false);

  const { geometry, sphere, target, outline } = useMemo(() => {
    const g = new THREE.SphereGeometry(RADIUS, 96, 64);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const from = Float32Array.from(pos.array as Float32Array);
    const to = new Float32Array(from.length);
    // One depth for the whole form (from the mean axis length). Varying it by
    // angle would tear the surface at the pole that faces the camera.
    const mean =
      PROFILE_PILLARS.reduce((a, p) => a + axisLength(scores[p]), 0) /
      PROFILE_PILLARS.length;
    const depth = 0.5 + 0.4 * mean;
    for (let i = 0; i < pos.count; i++) {
      const x = from[i * 3];
      const y = from[i * 3 + 1];
      const z = from[i * 3 + 2];
      // The outline lives in the plane facing the camera. Vertices near the
      // front and back poles keep more of the sphere so the form stays a
      // solid, not a cut-out.
      const planar = Math.sqrt(x * x + y * y) / RADIUS;
      const r = profileRadius(scores, Math.atan2(y, x));
      const k = 1 + (r - 1) * planar;
      to[i * 3] = x * k;
      to[i * 3 + 1] = y * k;
      to[i * 3 + 2] = z * depth;
    }
    const ring: THREE.Vector3[] = [];
    for (let i = 0; i < 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      const r = profileRadius(scores, theta) * RADIUS * 1.02;
      ring.push(new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), 0));
    }
    const o = new THREE.BufferGeometry().setFromPoints(ring);
    return { geometry: g, sphere: from, target: to, outline: o };
  }, [scores]);

  useEffect(() => {
    started.current = null;
    settled.current = false;
    return () => {
      geometry.dispose();
      outline.dispose();
    };
  }, [geometry, outline]);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    if (started.current === null) started.current = t;
    if (!settled.current) {
      const p = Math.min(1, (t - started.current) / SETTLE_SECONDS);
      const e = 1 - (1 - p) ** 3; // ease-out
      const pos = geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < arr.length; i++) {
        arr[i] = sphere[i] + (target[i] - sphere[i]) * e;
      }
      pos.needsUpdate = true;
      geometry.computeVertexNormals();
      // Once settled the geometry is never touched again: the idle cost is
      // two rotations per frame.
      if (p === 1) settled.current = true;
    }
    m.rotation.y = Math.sin(t * 0.45) * 0.38;
    m.rotation.x = Math.sin(t * 0.3) * 0.12;
  });

  return (
    <group ref={mesh}>
      <mesh geometry={geometry}>
        {/* Low metalness on purpose: there is no environment map (see the
            note in HeroScene), and metal with nothing to reflect renders
            black. */}
        <meshStandardMaterial
          color="#7A2130"
          emissive="#6B1F2A"
          emissiveIntensity={0.3}
          roughness={0.5}
          metalness={0.15}
        />
      </mesh>
      {/* The same gold outline the SVG glyph draws, so the two versions are
          recognisably one figure. */}
      <lineLoop geometry={outline}>
        <lineBasicMaterial color="#FFB300" toneMapped={false} />
      </lineLoop>
    </group>
  );
}

export default function ProfileForm({
  scores,
  active = true,
}: {
  scores: ProfileScores;
  active?: boolean;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5.4], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 6]} intensity={1.5} color="#FFE2A8" />
      <directionalLight
        position={[-4, -2, 3]}
        intensity={1.2}
        color="#C2435A"
      />
      <Form scores={scores} />
    </Canvas>
  );
}
