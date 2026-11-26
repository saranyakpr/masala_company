import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { SceneCanvas } from './SceneCanvas';
import { StudioLights } from './parts/StudioLights';
import { SpiceDust } from './parts/SpiceDust';
import { FilmJar, JAR, LogSlice, type FilmJarState } from './parts/FilmJar';
import { FilmBurst } from './parts/FilmBurst';
import { Bokeh, ImpactDust, LightTrails, SealRing, Smoke } from './parts/FilmEffects';
import { useBlobShadowTexture } from './parts/GlassJar';
import { tierConfig, useDeviceTier } from '@/hooks/useDeviceTier';
import { filmChapters } from '@/data/film';
import { loaderJar } from '@/data/jars';
import { Jar3D } from '@/components/common/Jar3D';
import { isIntroDone, markHeroReady } from '@/components/common/introState';
import { pour } from '@/components/sections/home/pourState';
import { PourSpray } from './parts/PourSpray';
import type { DeviceTier } from '@/types';

interface HeroSceneProps {
  /** 0 → 1 scroll progress through the hero section. */
  progress: MotionValue<number>;
  /** Index of the spice currently bursting (for the gold caption), -1 before the bursts start. */
  chapter: MotionValue<number>;
}

/**
 * Cinematic banner after the client's reference video: the gold-lid spice jar drops onto a wooden
 * log slice, the lid lifts with a breath of steam and seals again with a ring of gold light, then the
 * video's spice explosions bloom one after another behind the jar while golden trails circle it —
 * under warm god-rays, bokeh and spice dust. Scroll dollies the camera; the pointer adds parallax.
 */
export default function HeroScene({ progress, chapter }: HeroSceneProps) {
  const tier = useDeviceTier();
  return (
    <SceneCanvas className="absolute inset-0" camera={{ position: [0, 3, 16], fov: 30, near: 0.1, far: 80 }} loaderLabel="Filling the jar" fallback={<HeroFallback />}>
      <HeroContent progress={progress} chapter={chapter} tier={tier} />
    </SceneCanvas>
  );
}

/* timing (seconds after the intro loader lifts) */
const T = { drop: [0.15, 1.25], lidUp: [1.55, 2.35], lidDown: [2.75, 3.4], bursts: 3.2, burst: 2.7 };
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (t: number, [a, b]: number[]) => clamp01((t - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const bounce = (t: number) => {
  const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};

function HeroContent({ progress, chapter, tier }: HeroSceneProps & { tier: DeviceTier }) {
  const { viewport } = useThree();
  const conf = tierConfig[tier];
  const jar = useRef<FilmJarState>({ fill: 1, label: 1, lidLift: 0, lidSpin: 0, lidTilt: 0 });
  const burst = useRef({ index: -1, local: 0 });
  const amt = { dust: useRef(0), steam: useRef(0), seal: useRef(0), trails: useRef(0), smoke: useRef(0) };
  const stage = useRef<THREE.Group>(null);
  const mover = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spray = useRef({ x: 0, y: 0, z: 0, dx: 0, dy: 1, rate: 0 });
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const { gl, size } = useThree();
  const reducedPour = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const shadow = useRef<THREE.Mesh>(null);
  const burstGroup = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const frames = useRef(0);
  const look = useMemo(() => new THREE.Vector3(), []);
  const cam = useMemo(() => new THREE.Vector3(), []);
  const shadowTex = useBlobShadowTexture();
  const tableFade = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.35, '#bbb');
    g.addColorStop(0.75, '#222');
    g.addColorStop(1, '#000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  // Composition (viewport measured at the camera's distance to the origin):
  // wide → jar on the right, headline on the left; portrait → jar small and low, under the copy.
  const wide = viewport.aspect > 1.15;
  // portrait: the jar (≈5.2 units tall with its log) takes the lower third, under the copy and buttons
  // (phones stack the buttons, so the jar gets a little less room than on tablets)
  const phone = viewport.aspect < 0.56;
  const scale = wide ? Math.min(1, viewport.height / 9.6, viewport.width / 15) : Math.min(0.62, viewport.width / 7.5, (viewport.height * (phone ? 0.27 : 0.36)) / 5.2);
  const stageX = wide ? Math.min(viewport.width * 0.24, 6.2) : 0;
  const stageY = wide ? -2.55 * scale : -viewport.height * (phone ? 0.46 : 0.43) + JAR.log.height * scale;
  const dustSpread = useMemo<[number, number, number]>(() => [Math.round(viewport.width * 1.2), 9, 4], [viewport.width]);

  useFrame((state, delta) => {
    const now = state.clock.elapsedTime;
    if (start.current === null && isIntroDone()) start.current = now;
    const t = start.current === null ? -1 : now - start.current; // -1: waiting behind the loader (jar held above)
    const p = progress.get();
    const px = conf.pointer ? state.pointer.x : Math.sin(now * 0.2) * 0.25;
    const py = conf.pointer ? state.pointer.y : 0;
    const k = 1 - Math.pow(0.001, delta);

    /* scroll pour: the jar rises off the log, the lid flies off, the jar tips and the masala pours out */
    const settled = t >= T.lidDown[1];
    const pp = settled && !reducedPour ? p : 0;
    const rise = easeInOut(seg(pp, [0.02, 0.14]));
    const tip = easeInOut(seg(pp, [0.05, 0.17]));
    const tipAngle = tip * 1.92; // ≈110°: mouth points down and a little to the right

    /* jar: drop onto the log, lid lifts and seals, then a slow sway */
    const drop = t < 0 ? 0 : seg(t, T.drop);
    const sway = Math.sin(now * 0.45) * 0.28 * (1 - tip);
    if (mover.current) {
      mover.current.position.y = 12 * (1 - bounce(drop)) + rise * 0.7;
      mover.current.rotation.set(0, -0.9 * (1 - easeOut(drop)) + sway * easeOut(drop) + px * 0.25 * (1 - tip), (1 - drop) * 0.08);
    }
    if (tilt.current) tilt.current.rotation.z = -tipAngle;
    amt.dust.current = t < 0 ? 0 : clamp01((t - 0.55) / 1.1);
    const up = easeInOut(seg(t, T.lidUp));
    const down = easeOut(seg(t, T.lidDown));
    const j = jar.current;
    const lidOff = easeInOut(seg(pp, [0.02, 0.1]));
    j.lidLift = up * 1.15 * (1 - down) + lidOff * 9.5;
    j.lidTilt = up * 0.14 * (1 - down) + lidOff * 0.6;
    j.lidSpin = up * 0.6 + down * Math.PI * 2 + lidOff * Math.PI * 3;
    j.fill = 1 - 0.82 * seg(pp, [0.14, 0.9]);

    /* pour: mouth position for the 3D spray (stage space) and the page flow layer (page px) */
    const rate = seg(pp, [0.12, 0.18]);
    if (tilt.current && stage.current) {
      tmp.set(0, JAR.lidSeat + 0.32 - 2.3, 0);
      tilt.current.localToWorld(tmp);
      const world = tmp.clone();
      stage.current.worldToLocal(tmp);
      spray.current.x = tmp.x;
      spray.current.y = tmp.y;
      spray.current.z = tmp.z;
      spray.current.dx = Math.sin(tipAngle);
      spray.current.dy = Math.cos(tipAngle);
      spray.current.rate = rate;
      world.project(state.camera);
      const rect = gl.domElement.getBoundingClientRect();
      pour.x = rect.left + ((world.x + 1) / 2) * size.width;
      pour.y = rect.top + window.scrollY + ((1 - world.y) / 2) * size.height;
      pour.dirX = Math.sin(tipAngle);
      pour.dirY = -Math.cos(tipAngle);
      pour.rate = rate;
      pour.unitPx = (size.height / viewport.height) * scale;
      pour.progress = pp;
    }
    amt.steam.current = clamp01(up * 1.4) * (1 - seg(t, [2.6, 3.2])) * 0.9;
    amt.seal.current = t < T.lidDown[1] - 0.1 ? 0 : seg(t, [T.lidDown[1] - 0.1, T.lidDown[1] + 0.9]);
    if (shadow.current) {
      const h = Math.min(1, (mover.current?.position.y ?? 0) / 7);
      shadow.current.scale.setScalar(2.6 * (1 - h * 0.5));
      (shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.75 * (1 - h);
    }

    /* spice bursts behind the jar, in the video's order */
    const b = t - T.bursts;
    if (t >= 0 && b >= 0) {
      const x = b / T.burst;
      const index = Math.floor(x) % filmChapters.length;
      burst.current.index = index;
      burst.current.local = x - Math.floor(x);
      if (chapter.get() !== (pp > 0.03 ? -1 : index)) chapter.set(pp > 0.03 ? -1 : index);
    } else {
      burst.current.index = -1;
    }
    amt.trails.current = clamp01((t - 3.0) / 1.2) * 0.75 * (1 - seg(pp, [0, 0.08]));
    amt.smoke.current = clamp01((t - 3.5) / 2) * 0.6;
    if (burstGroup.current) burstGroup.current.visible = t >= 0 && b >= 0 && pp < 0.03;

    /* camera: gentle dolly with scroll + pointer parallax */
    look.set(stageX * 0.55, wide ? stageY + 2.35 * scale : 0, 0);
    cam.set(look.x + px * 0.8 * (1 - tip), look.y + 0.9 + py * 0.4 - p * 0.5, 16 - p * 1.5);
    state.camera.position.lerp(cam, k);
    state.camera.lookAt(look);
    if (stage.current) stage.current.rotation.y = THREE.MathUtils.lerp(stage.current.rotation.y, px * 0.12, k);

    frames.current += 1;
    if (frames.current === 3) markHeroReady();
  });

  return (
    <>
      <StudioLights intensity={0.9} />
      <spotLight position={[-6, 11, 7]} angle={0.5} penumbra={0.9} intensity={34} distance={30} color="#ffd59a" />
      <pointLight position={[stageX + 3, 4, 4]} intensity={5} distance={14} color="#ffb766" />

      <group ref={stage} position={[stageX, stageY, 0]} scale={scale}>
        {/* table that melts into the backdrop */}
        <mesh position={[0, -JAR.log.height, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[22, 22]} />
          <meshStandardMaterial color="#3a1f0e" roughness={0.86} alphaMap={tableFade} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0, -JAR.log.height + 0.005, 0]} rotation-x={-Math.PI / 2} scale={[6, 4.4, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.8} />
        </mesh>
        <LogSlice />
        <mesh ref={shadow} position={[0, 0.006, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0} />
        </mesh>

        {/* spice explosions bloom behind the jar */}
        <group ref={burstGroup} position={[0, 2.6, -2.6]} scale={1.25} visible={false}>
          <FilmBurst chapterRef={burst} powderCount={conf.particles * 6} />
        </group>

        <group ref={mover} position={[0, 12, 0]}>
          {/* tip around the jar's middle */}
          <group ref={tilt} position={[0, 2.3, 0]}>
            <group position={[0, -2.3, 0]}>
              <FilmJar state={jar} />
            </group>
          </group>
        </group>
        <PourSpray state={spray} count={tier === 'low' ? 500 : 1400} />

        <ImpactDust amount={amt.dust} count={tier === 'low' ? 250 : 600} />
        <LightTrails amount={amt.trails} />
        <SealRing amount={amt.seal} y={JAR.lidSeat + 0.22} />
        <Smoke amount={amt.steam} position={[0, JAR.lidSeat + 1.7, 0.2]} scale={[1.8, 3]} seed={2} />
        <Smoke amount={amt.smoke} position={[-2.6, 2.8, -1.2]} scale={[3, 6]} seed={5} />
        <Smoke amount={amt.smoke} position={[2.7, 2.5, -1.0]} scale={[3, 6]} seed={9} />
        <Bokeh center={[0, 3.4, -4]} spread={[18, 11, 6]} count={tier === 'low' ? 40 : 90} />
      </group>

      <SpiceDust count={Math.round(conf.particles * 0.6)} interactive={conf.pointer} spread={dustSpread} />
    </>
  );
}

/** No-WebGL fallback: the CSS 3D jar, so the banner still has a turning product. */
function HeroFallback() {
  useEffect(() => markHeroReady(), []);
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-center pb-8 lg:inset-y-0 lg:items-center lg:justify-end lg:pb-0 lg:pr-[12vw]">
      <Jar3D jar={loaderJar} size={150} spinSeconds={14} />
    </div>
  );
}
