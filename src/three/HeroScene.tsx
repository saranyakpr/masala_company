import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { SceneCanvas } from './SceneCanvas';
import { StudioLights } from './parts/StudioLights';
import { SpiceDust } from './parts/SpiceDust';
import { BrassBowl, Cardamom, Chilli, Cinnamon, Coriander, Peppercorn, PeppercornScatter, PowderMound, StarAnise } from './parts/Spices';
import { tierConfig, useDeviceTier } from '@/hooks/useDeviceTier';
import { SpiceMound } from '@/components/common/SpiceMound';
import type { DeviceTier } from '@/types';

interface HeroSceneProps {
  /** 0 → 1 scroll progress through the hero section. */
  progress: MotionValue<number>;
}

/**
 * Cinematic hero: a hand-beaten brass bowl heaped with turmeric, surrounded by
 * floating whole spices and drifting dust. Scroll dollies the camera in and lifts
 * the spices; the pointer adds parallax and pushes the dust.
 * All geometry is procedural — a stand-in until client product photography / models exist.
 */
export default function HeroScene({ progress }: HeroSceneProps) {
  const tier = useDeviceTier();
  return (
    <SceneCanvas
      className="absolute inset-0"
      camera={{ position: [0, 2.2, 9], fov: 32 }}
      loaderLabel="Grinding the first batch"
      fallback={<HeroFallback />}
    >
      <HeroContent progress={progress} tier={tier} />
    </SceneCanvas>
  );
}

const floaters: { kind: 'pepper' | 'cardamom' | 'anise' | 'chilli' | 'cinnamon' | 'coriander'; pos: [number, number, number]; rot: [number, number, number]; scale: number; speed: number }[] = [
  { kind: 'anise', pos: [-1.55, 1.55, 0.4], rot: [0.9, 0.2, 0.3], scale: 1.5, speed: 1.1 },
  { kind: 'chilli', pos: [1.65, 1.25, 0.2], rot: [0.4, 0.6, 2.4], scale: 1.05, speed: 0.9 },
  { kind: 'cardamom', pos: [-1.1, 2.25, -0.6], rot: [0.6, 0.1, 1.2], scale: 1.4, speed: 1.4 },
  { kind: 'cinnamon', pos: [1.25, 2.35, -0.9], rot: [0.2, 0.4, 1.1], scale: 0.9, speed: 0.8 },
  { kind: 'pepper', pos: [0.55, 2.05, 0.9], rot: [0, 0, 0], scale: 1.2, speed: 1.6 },
  { kind: 'pepper', pos: [-0.5, 1.75, 1.1], rot: [1, 1, 0], scale: 1, speed: 1.8 },
  { kind: 'coriander', pos: [0.15, 2.6, -0.2], rot: [0, 0, 0], scale: 1.3, speed: 1.2 },
  { kind: 'cardamom', pos: [2.05, 0.6, -0.6], rot: [1.1, 0.3, 0.2], scale: 1.2, speed: 1 },
  { kind: 'anise', pos: [-2.1, 0.55, -0.4], rot: [1.3, 0.5, 0.1], scale: 1.1, speed: 1.3 },
];

function Floater({ kind, ...rest }: { kind: (typeof floaters)[number]['kind']; position: [number, number, number]; rotation: [number, number, number]; scale: number }) {
  switch (kind) {
    case 'pepper':
      return <Peppercorn {...rest} />;
    case 'cardamom':
      return <Cardamom {...rest} />;
    case 'anise':
      return <StarAnise {...rest} />;
    case 'chilli':
      return <Chilli {...rest} />;
    case 'cinnamon':
      return <Cinnamon {...rest} />;
    case 'coriander':
      return <Coriander {...rest} />;
  }
}

function HeroContent({ progress, tier }: HeroSceneProps & { tier: DeviceTier }) {
  const { viewport } = useThree();
  const conf = tierConfig[tier];
  const stage = useRef<THREE.Group>(null);
  const bowl = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const camTarget = useMemo(() => new THREE.Vector3(), []);

  // Composition: right-weighted on wide screens (headline sits left), centred & lower on portrait.
  const wide = viewport.aspect > 1.15;
  const stageX = wide ? Math.min(2.6, viewport.width * 0.22) : 0;
  const stageY = wide ? -0.9 : -2.1;
  const stageScale = wide ? 1 : Math.min(0.95, viewport.width / 4.2);
  const dustWidth = Math.round(viewport.width * 1.2);
  const dustSpread = useMemo<[number, number, number]>(() => [dustWidth, 7, 4], [dustWidth]);

  useFrame((state, delta) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const px = conf.pointer ? state.pointer.x : 0;
    const py = conf.pointer ? state.pointer.y : 0;

    // camera dolly + pointer parallax
    camTarget.set(px * 0.5, 2.2 - p * 1.2 + py * 0.25, 9 - p * 3);
    state.camera.position.lerp(camTarget, 1 - Math.pow(0.001, delta));
    // portrait: aim above the stage so it settles into the lower third, under the copy
    lookTarget.set(stageX * 0.55, stageY + (wide ? 0.6 : 2.3) + p * 0.25, 0);
    state.camera.lookAt(lookTarget);

    if (bowl.current) bowl.current.rotation.y = t * 0.06 + p * 0.8;
    if (orbit.current) {
      orbit.current.rotation.y = t * 0.05 + p * 1.4;
      orbit.current.position.y = p * 0.9;
      const s = 0.82 * (1 + p * 0.35);
      orbit.current.scale.setScalar(s);
    }
  });

  return (
    <>
      <StudioLights />
      <group ref={stage} position={[stageX, stageY, 0]} scale={stageScale}>
        <group ref={bowl}>
          <BrassBowl />
          <PowderMound color="#e2a01b" radius={1.2} peak={0.5} position={[0, 0.6, 0]} seed={2} />
        </group>

        {/* heaps on the ground plane */}
        <PowderMound color="#a3171c" radius={0.62} peak={0.34} position={[-1.75, 0, 0.75]} seed={5} />
        <PowderMound color="#a68a4e" radius={0.5} peak={0.26} position={[1.7, 0, 0.95]} seed={7} />
        <PeppercornScatter count={tier === 'low' ? 10 : 26} radius={2.2} y={0} />

        <group ref={orbit}>
          {floaters.slice(0, tier === 'low' ? 5 : floaters.length).map((f, i) => (
            <Float key={i} speed={f.speed} rotationIntensity={0.8} floatIntensity={0.6} floatingRange={[-0.08, 0.08]}>
              <Floater kind={f.kind} position={f.pos} rotation={f.rot} scale={f.scale} />
            </Float>
          ))}
        </group>

        {conf.shadows && <ContactShadows position={[0, -0.005, 0]} scale={7} blur={2.8} opacity={0.6} far={2.5} resolution={512} frames={1} color="#120604" />}
      </group>

      <SpiceDust count={conf.particles} interactive={conf.pointer} spread={dustSpread} />
    </>
  );
}

function HeroFallback() {
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-10 opacity-90 lg:justify-end lg:pr-[8vw]">
      <SpiceMound color="#e2a01b" colorDeep="#b8770c" label="turmeric" className="max-w-xl" />
    </div>
  );
}
