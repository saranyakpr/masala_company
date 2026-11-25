import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { Ingredient } from '@/types';
import { SceneCanvas } from './SceneCanvas';
import { StudioLights } from './parts/StudioLights';
import { IngredientArrangement } from './parts/Spices';
import { SpiceDust } from './parts/SpiceDust';
import { stepDragRotate, useDragRotate, type DragRotateState } from './useDragRotate';
import { tierConfig, useDeviceTier } from '@/hooks/useDeviceTier';
import { SpiceMound } from '@/components/common/SpiceMound';

/** Interactive 3D study of one ingredient: its whole form resting on a heap of its ground form. */
export default function IngredientScene({ ingredient }: { ingredient: Ingredient }) {
  const { state, handlers } = useDragRotate();
  const tier = useDeviceTier();
  return (
    <SceneCanvas
      className="relative h-full w-full"
      camera={{ position: [0, 1.6, 4.6], fov: 32 }}
      loaderLabel="Preparing ingredient"
      wrapperProps={{ ...handlers, role: 'img', 'aria-label': `3D view of ${ingredient.name}. Drag to rotate.` }}
      fallback={
        <div className="flex h-full items-end justify-center p-8">
          <SpiceMound color={ingredient.color} colorDeep={ingredient.colorDeep} label={ingredient.name} className="max-w-md" />
        </div>
      }
    >
      <Stage ingredient={ingredient} drag={state} shadows={tierConfig[tier].shadows} particles={Math.round(tierConfig[tier].particles / 5)} />
    </SceneCanvas>
  );
}

function Stage({ ingredient, drag, shadows, particles }: { ingredient: Ingredient; drag: MutableRefObject<DragRotateState>; shadows: boolean; particles: number }) {
  const group = useRef<THREE.Group>(null);
  const entrance = useRef(0);
  const lastId = useRef(ingredient.id);
  const dustColors = useMemo(() => [ingredient.color, '#f3d9a0', ingredient.colorDeep], [ingredient.color, ingredient.colorDeep]);

  if (lastId.current !== ingredient.id) {
    lastId.current = ingredient.id;
    entrance.current = 0;
  }

  useFrame((state, delta) => {
    const s = drag.current;
    stepDragRotate(s, delta, 0.3);
    entrance.current = Math.min(1, entrance.current + delta * 1.4);
    const e = 1 - Math.pow(1 - entrance.current, 3);
    const g = group.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, s.rotY, 6, delta) ;
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, s.rotX * 0.5, 6, delta);
      g.scale.setScalar(0.7 + e * 0.3);
      g.position.y = -0.55 - (1 - e) * 0.4;
    }
    state.camera.lookAt(0, -0.1, 0);
  });

  return (
    <>
      <StudioLights intensity={1.15} />
      <group ref={group}>
        <IngredientArrangement key={ingredient.id} ingredient={ingredient} />
        {shadows && <ContactShadows position={[0, -0.005, 0]} scale={4} blur={2.2} opacity={0.6} far={2} resolution={512} color="#0c0302" />}
      </group>
      <SpiceDust count={particles} interactive={false} spread={DUST_SPREAD} colors={dustColors} size={0.9} />
    </>
  );
}

const DUST_SPREAD: [number, number, number] = [5, 3.5, 3];
