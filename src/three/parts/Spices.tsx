import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { GroupProps } from '@react-three/fiber';
import type { Ingredient } from '@/types';
import {
  aniseCarpelGeometry,
  bowlGeometry,
  cardamomGeometry,
  chilliGeometry,
  cinnamonGeometry,
  corianderGeometry,
  moundGeometry,
  peppercornGeometry,
  turmericRootGeometry,
} from './geometries';
import { rng } from '../utils/noise';

/* ------------------------------------------------------------------ */
/* Individual whole spices                                              */
/* ------------------------------------------------------------------ */

export function Peppercorn(props: GroupProps) {
  return (
    <group {...props}>
      <mesh geometry={peppercornGeometry()} castShadow>
        <meshStandardMaterial color="#2a1d16" roughness={0.78} metalness={0.05} />
      </mesh>
    </group>
  );
}

export function Cardamom(props: GroupProps) {
  return (
    <group {...props}>
      <mesh geometry={cardamomGeometry()} castShadow>
        <meshStandardMaterial color="#86955a" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.215, 0]}>
        <cylinderGeometry args={[0.006, 0.012, 0.04, 8]} />
        <meshStandardMaterial color="#6b6a3a" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function StarAnise(props: GroupProps) {
  const seeds = useMemo(() => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2), []);
  return (
    <group {...props}>
      {seeds.map((a, i) => (
        <group key={i} rotation={[0, a, 0]}>
          <mesh geometry={aniseCarpelGeometry()} castShadow>
            <meshStandardMaterial color="#6e3b20" roughness={0.85} />
          </mesh>
          <mesh position={[0.2, 0.035, 0]} scale={[1.3, 0.8, 0.9]}>
            <sphereGeometry args={[0.032, 16, 12]} />
            <meshPhysicalMaterial color="#9a6a3a" roughness={0.3} clearcoat={0.8} />
          </mesh>
        </group>
      ))}
      <mesh>
        <sphereGeometry args={[0.04, 16, 12]} />
        <meshStandardMaterial color="#4e2814" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Chilli({ color = '#a3120f', ...props }: GroupProps & { color?: string }) {
  return (
    <group {...props}>
      <mesh geometry={chilliGeometry()} castShadow>
        <meshPhysicalMaterial color={color} roughness={0.38} clearcoat={0.7} clearcoatRoughness={0.35} sheen={0.4} sheenColor="#ff6a3d" />
      </mesh>
      {/* calyx + stem */}
      <mesh position={[0, 0.01, 0]} scale={[1, 0.45, 1]}>
        <sphereGeometry args={[0.075, 20, 12]} />
        <meshStandardMaterial color="#5c5a2a" roughness={0.75} />
      </mesh>
      <mesh position={[0.02, 0.09, 0]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.012, 0.018, 0.16, 10]} />
        <meshStandardMaterial color="#6b6a35" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function Cinnamon(props: GroupProps) {
  return (
    <group {...props}>
      <mesh geometry={cinnamonGeometry(false)} castShadow>
        <meshStandardMaterial color="#8c4f2b" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={cinnamonGeometry(true)} rotation={[0, 1.4, 0]}>
        <meshStandardMaterial color="#7a4224" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Coriander(props: GroupProps) {
  return (
    <group {...props}>
      <mesh geometry={corianderGeometry()} castShadow>
        <meshStandardMaterial color="#b49a62" roughness={0.72} />
      </mesh>
    </group>
  );
}

export function TurmericRoot(props: GroupProps) {
  return (
    <group {...props}>
      <mesh geometry={turmericRootGeometry()} castShadow>
        <meshStandardMaterial color="#b0702a" roughness={0.85} />
      </mesh>
      {/* cut face shows the vivid interior */}
      <mesh position={[-0.01, -0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 24]} />
        <meshStandardMaterial color="#f0a417" roughness={0.6} emissive="#a35a00" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Ground spice + vessels                                               */
/* ------------------------------------------------------------------ */

export function PowderMound({
  color,
  radius = 1,
  peak = 0.55,
  seed = 1,
  ...props
}: GroupProps & { color: string; radius?: number; peak?: number; seed?: number }) {
  return (
    <group {...props}>
      <mesh geometry={moundGeometry(radius, peak, seed)} receiveShadow castShadow>
        <meshStandardMaterial color={color} roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

export function BrassBowl(props: GroupProps) {
  return (
    <group {...props}>
      <mesh geometry={bowlGeometry()} castShadow receiveShadow>
        <meshStandardMaterial color="#c08f3e" metalness={1} roughness={0.27} side={THREE.DoubleSide} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
}

/** Many peppercorns in one draw call. */
export function PeppercornScatter({ count = 24, radius = 1.2, seed = 4, y = 0 }: { count?: number; radius?: number; seed?: number; y?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = rng(seed);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const d = radius * (0.35 + r() * 0.65);
      const s = 0.8 + r() * 0.4;
      q.setFromEuler(e.set(r() * 6, r() * 6, r() * 6));
      m.compose(new THREE.Vector3(Math.cos(a) * d, y + 0.09 * s, Math.sin(a) * d), q, new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, radius, seed, y]);
  return (
    <instancedMesh ref={ref} args={[peppercornGeometry(), undefined, count]} castShadow>
      <meshStandardMaterial color="#2a1d16" roughness={0.78} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* Ingredient presentation (whole form resting on its ground form)      */
/* ------------------------------------------------------------------ */

export function IngredientArrangement({ ingredient }: { ingredient: Ingredient }) {
  const { color, shape } = ingredient;
  return (
    <group>
      <PowderMound color={color} radius={1.05} peak={0.42} seed={ingredient.id.length} />
      <group position={[0, 0.42, 0]}>{wholeForm(shape)}</group>
    </group>
  );
}

function wholeForm(shape: Ingredient['shape']) {
  switch (shape) {
    case 'root':
      return (
        <>
          <TurmericRoot position={[-0.25, 0.12, 0.1]} rotation={[0.2, 0.4, 1.35]} scale={1.3} />
          <TurmericRoot position={[0.3, 0.1, -0.1]} rotation={[-0.1, -0.6, 1.5]} scale={1.1} />
        </>
      );
    case 'chilli':
      return (
        <>
          <Chilli position={[-0.45, 0.12, 0.1]} rotation={[0.3, 0.2, 1.9]} scale={0.9} />
          <Chilli position={[0.1, 0.18, -0.15]} rotation={[-0.2, 1.4, 1.7]} scale={0.8} color="#8f0f0c" />
        </>
      );
    case 'berry':
      return (
        <group scale={1.4}>
          {Array.from({ length: 9 }).map((_, i) => {
            const a = (i / 9) * Math.PI * 2;
            const d = i === 0 ? 0 : 0.18;
            return <Peppercorn key={i} position={[Math.cos(a) * d, i === 0 ? 0.12 : 0.05, Math.sin(a) * d]} rotation={[i, i * 2, 0]} />;
          })}
        </group>
      );
    case 'seed':
      return (
        <group scale={1.5}>
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 + i;
            const d = (i % 3) * 0.08;
            return <Coriander key={i} position={[Math.cos(a) * d, 0.05 + (i % 2) * 0.05, Math.sin(a) * d]} />;
          })}
        </group>
      );
    case 'pod':
      return (
        <>
          <Cardamom position={[-0.15, 0.12, 0]} rotation={[0.3, 0, 1.4]} scale={1.6} />
          <Cardamom position={[0.22, 0.12, 0.12]} rotation={[-0.2, 1, 1.2]} scale={1.5} />
          <Cardamom position={[0.05, 0.3, -0.1]} rotation={[0.4, 2, 1.6]} scale={1.4} />
        </>
      );
    case 'bark':
      return (
        <>
          <Cinnamon position={[0, 0.12, 0.05]} rotation={[0, 0.3, Math.PI / 2]} />
          <Cinnamon position={[0.05, 0.27, -0.08]} rotation={[0.1, -0.4, Math.PI / 2 + 0.1]} scale={0.9} />
        </>
      );
    case 'star':
      return (
        <>
          <StarAnise position={[0, 0.08, 0]} rotation={[0.15, 0, 0.05]} scale={1.7} />
          <StarAnise position={[0.45, 0.02, 0.25]} rotation={[0.4, 1, 0.2]} scale={1.1} />
        </>
      );
    case 'powder':
    default:
      return null;
  }
}
