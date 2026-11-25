import { useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, RotateCw, Move3d } from 'lucide-react';
import type { Product } from '@/types';
import { SceneCanvas } from './SceneCanvas';
import { StudioLights } from './parts/StudioLights';
import { Pouch, POUCH_HEIGHT } from './parts/Pouch';
import { PowderMound } from './parts/Spices';
import { SpiceDust } from './parts/SpiceDust';
import { stepDragRotate, useDragRotate, type DragRotateState } from './useDragRotate';
import { tierConfig, useDeviceTier } from '@/hooks/useDeviceTier';
import { PackVisual } from '@/components/product/PackVisual';

interface ProductViewerProps {
  product: Product;
  weight: string;
}

/** Interactive 3D pack presentation for the product detail page. */
export default function ProductViewer({ product, weight }: ProductViewerProps) {
  const { state, handlers, nudge, reset } = useDragRotate();
  const tier = useDeviceTier();

  return (
    <div className="relative h-full w-full">
      <SceneCanvas
        className="relative h-full w-full"
        camera={{ position: [0, 0.5, 6.6], fov: 30 }}
        loaderLabel="Rendering pack"
        wrapperProps={{ ...handlers, role: 'img', 'aria-label': `Interactive 3D view of the ${product.name} pack. Drag to rotate.` }}
        fallback={
          <div className="flex h-full items-center justify-center p-10">
            <PackVisual product={product} weight={weight} className="max-h-[80%]" />
          </div>
        }
      >
        <Stage product={product} weight={weight} drag={state} shadows={tierConfig[tier].shadows} particles={Math.round(tierConfig[tier].particles / 6)} />
      </SceneCanvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-ivory/15 bg-burgundy-deep/80 p-1 text-ivory">
          <button type="button" onClick={() => nudge(-Math.PI / 4)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ivory/10" aria-label="Rotate pack left">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
          </button>
          <span className="flex items-center gap-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ivory/70">
            <Move3d aria-hidden="true" className="h-3.5 w-3.5" /> Drag to rotate
          </span>
          <button type="button" onClick={() => nudge(Math.PI / 4)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ivory/10" aria-label="Rotate pack right">
            <RotateCw aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" onClick={reset} className="hidden h-10 rounded-full px-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] hover:bg-ivory/10 sm:block">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function Stage({ product, weight, drag, shadows, particles }: ProductViewerProps & { drag: MutableRefObject<DragRotateState>; shadows: boolean; particles: number }) {
  const group = useRef<THREE.Group>(null);
  const sway = useRef(0);

  useFrame((state, delta) => {
    const s = drag.current;
    stepDragRotate(s, delta, 0);
    // idle: gentle sway around the front-facing pose so the label stays readable
    const idle = !s.dragging && performance.now() - s.lastInteraction > 2500;
    sway.current = THREE.MathUtils.damp(sway.current, idle ? Math.sin(state.clock.elapsedTime * 0.45) * 0.55 : 0, 2, delta);
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, s.rotY + sway.current - 0.2, 6, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, s.rotX, 6, delta);
    state.camera.lookAt(0, -0.2, 0);
  });

  const groundY = -POUCH_HEIGHT / 2 - 0.05;

  return (
    <>
      <StudioLights intensity={1.1} />
      <group ref={group}>
        <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25} floatingRange={[-0.03, 0.05]}>
          <Pouch product={product} weight={weight} />
        </Float>
      </group>
      <PowderMound color={product.palette.spice} radius={0.42} peak={0.3} position={[0.85, groundY, 0.55]} seed={3} />
      <mesh position={[0, groundY - 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.25, 1.32, 0.14, 96]} />
        <meshStandardMaterial color="#2a0d10" roughness={0.55} metalness={0.2} />
      </mesh>
      {shadows && <ContactShadows position={[0, groundY + 0.005, 0]} scale={4} blur={2.4} opacity={0.7} far={2.5} resolution={512} color="#0c0302" />}
      <SpiceDust count={particles} interactive={false} spread={DUST_SPREAD} colors={DUST_COLORS} size={0.8} />
    </>
  );
}

const DUST_SPREAD: [number, number, number] = [5, 4, 3];
const DUST_COLORS = ['#e4c17a', '#f3d9a0', '#c99a3e'];
