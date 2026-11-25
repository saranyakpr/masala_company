import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { GroupProps } from '@react-three/fiber';
import type { Product } from '@/types';
import { createBackLabel, createFrontLabel, ensureFonts } from '../utils/labelTexture';

const PW = 1.5;
const PH = 2.1;
const PD = 0.5;

let pouchGeo: THREE.BufferGeometry | null = null;

/** Stand-up pouch: a subdivided box deformed into a pillow with a flat heat-sealed top. */
function pouchGeometry() {
  if (pouchGeo) return pouchGeo;
  const g = new THREE.BoxGeometry(PW, PH, PD, 40, 56, 12);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    const y = p.getY(i);
    let z = p.getZ(i);
    const nx = x / (PW / 2);
    const ny = y / (PH / 2);
    // pillow: thickness falls off towards the side seams
    let thick = Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(nx), 4)));
    // heat-sealed top (flat) with a short transition
    const sealStart = 0.78;
    if (ny > sealStart) thick *= THREE.MathUtils.lerp(1, 0.03, THREE.MathUtils.smoothstep(ny, sealStart, 0.86));
    // gusseted base stays full and slightly wider
    const baseBulge = ny < -0.75 ? 1.08 : 1;
    // gentle belly
    const belly = 1 + 0.12 * Math.cos(ny * Math.PI * 0.5);
    z = z * thick * belly * baseBulge;
    x = x * (1 + 0.035 * (1 - ny) * 0.5);
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  pouchGeo = g;
  return g;
}

export function Pouch({ product, weight, ...props }: GroupProps & { product: Product; weight: string }) {
  const [front, setFront] = useState<THREE.CanvasTexture | null>(null);
  const [back, setBack] = useState<THREE.CanvasTexture | null>(null);
  const geometry = useMemo(pouchGeometry, []);

  useEffect(() => {
    let cancelled = false;
    let tex: THREE.CanvasTexture | null = null;
    ensureFonts().then(() => {
      if (cancelled) return;
      tex = createFrontLabel(product, weight);
      setFront(tex);
    });
    return () => {
      cancelled = true;
      tex?.dispose();
    };
  }, [product, weight]);

  useEffect(() => {
    let cancelled = false;
    let tex: THREE.CanvasTexture | null = null;
    ensureFonts().then(() => {
      if (cancelled) return;
      tex = createBackLabel(product);
      setBack(tex);
    });
    return () => {
      cancelled = true;
      tex?.dispose();
    };
  }, [product]);

  const sideColor = product.palette.base;

  return (
    <group {...props}>
      <mesh geometry={geometry} castShadow>
        {/* material order: +x, -x, +y, -y, +z (front), -z (back) */}
        <meshPhysicalMaterial attach="material-0" color={sideColor} roughness={0.45} clearcoat={0.6} />
        <meshPhysicalMaterial attach="material-1" color={sideColor} roughness={0.45} clearcoat={0.6} />
        <meshPhysicalMaterial attach="material-2" color={sideColor} roughness={0.45} clearcoat={0.6} />
        <meshPhysicalMaterial attach="material-3" color={sideColor} roughness={0.5} />
        <meshPhysicalMaterial
          attach="material-4"
          key={front ? front.uuid : 'front-empty'}
          map={front}
          color={front ? '#ffffff' : sideColor}
          roughness={0.36}
          clearcoat={0.75}
          clearcoatRoughness={0.25}
        />
        <meshPhysicalMaterial
          attach="material-5"
          key={back ? back.uuid : 'back-empty'}
          map={back}
          color={back ? '#ffffff' : sideColor}
          roughness={0.4}
          clearcoat={0.6}
        />
      </mesh>
      {/* tear notch hole */}
      <mesh position={[0, PH / 2 - 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.03, 20]} />
        <meshBasicMaterial color="#120806" />
      </mesh>
    </group>
  );
}

export const POUCH_HEIGHT = PH;
