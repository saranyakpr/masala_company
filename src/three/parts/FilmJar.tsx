import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useGlassMaterials } from './GlassJar';
import { PowderMound } from './Spices';
import { filmAssets } from '@/data/film';

/*
 * The "Indian Spice Mix" jar from the client's reference video, rebuilt in 3D:
 * layered spice fill, the cream label cut out of the video frame, glass with threads, brushed-gold lid,
 * standing on a wooden log slice. Units: jar radius = 1, origin at the bottom of the glass (top of the log).
 */

export const JAR = {
  body: 3.65, // body height ÷ radius, measured from the video's end card
  base: 0.17,
  labelArc: 1.8408, // from scripts/build-film-assets.cjs
  labelHeight: 2.0,
  labelY: 2.12,
  lidSeat: 4.12,
  lidHeight: 0.44,
  log: { radius: 1.95, height: 0.62 },
};

export interface FilmJarState {
  /** 0 = empty, 1 = full. */
  fill: number;
  /** Label opacity. */
  label: number;
  /** Lid offset above its seat, and spin. */
  lidLift: number;
  lidSpin: number;
  lidTilt: number;
}

const assets = filmAssets;

const shellGeometry = () => {
  const top = JAR.base + JAR.body;
  const pts = [
    [0, 0], [0.95, 0], [1.05, 0.04], [1.09, 0.16], [1.09, top], [1.07, top + 0.12],
    [0.99, top + 0.22], [0.92, top + 0.27], [0.91, top + 0.3], [0.91, top + 0.62],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 80);
};

export function FilmJar({ state }: { state: MutableRefObject<FilmJarState> }) {
  const gl = useThree((s) => s.gl);
  const [stripesTex, labelTex] = useTexture([assets.stripes, assets.label], (ts) => {
    (Array.isArray(ts) ? ts : [ts]).forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    });
  });
  const stripes = useMemo(() => {
    const t = stripesTex.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return t;
  }, [stripesTex]);
  const glass = useGlassMaterials();
  // this jar is filled to the shoulder and lit closer than the hero jars: calmer reflections
  useMemo(() => {
    glass.reflect.envMapIntensity = 1.9;
    glass.rim.uniforms.uIntensity.value = 0.42;
  }, [glass]);
  const shell = useMemo(shellGeometry, []);
  const contentsGeo = useMemo(() => new THREE.CylinderGeometry(0.985, 0.985, 1, 96, 1, true).translate(0, 0.5, 0), []);
  const labelGeo = useMemo(
    () => new THREE.CylinderGeometry(1.105, 1.105, JAR.labelHeight, 64, 1, true, -JAR.labelArc / 2, JAR.labelArc),
    [],
  );
  const gold = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#d9ac52', metalness: 1, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.2, envMapIntensity: 1.6 }),
    [],
  );
  const labelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: labelTex, transparent: true, roughness: 0.55, metalness: 0, envMapIntensity: 0.4, depthWrite: false }),
    [labelTex],
  );

  const contents = useRef<THREE.Mesh>(null);
  const mound = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);

  useFrame(() => {
    const s = state.current;
    const fill = THREE.MathUtils.clamp(s.fill, 0, 1);
    const h = Math.max(0.0001, fill * JAR.body);
    if (contents.current) {
      contents.current.visible = fill > 0.002;
      contents.current.scale.y = h;
      stripes.repeat.set(1, fill);
    }
    if (mound.current) {
      mound.current.visible = fill > 0.02;
      mound.current.position.y = JAR.base + h - 0.01;
      mound.current.scale.set(1, Math.min(1, fill * 4), 1);
    }
    labelMat.opacity = THREE.MathUtils.clamp(s.label, 0, 1);
    if (lid.current) {
      lid.current.position.y = JAR.lidSeat + s.lidLift;
      lid.current.rotation.y = s.lidSpin;
      lid.current.rotation.z = s.lidTilt;
      lid.current.visible = s.lidLift < 9;
    }
  });

  const top = JAR.base + JAR.body;
  return (
    <group>
      {/* layered spice fill */}
      <mesh ref={contents} position={[0, JAR.base, 0]} geometry={contentsGeo}>
        <meshStandardMaterial map={stripes} roughness={0.95} metalness={0} envMapIntensity={0.25} />
      </mesh>
      <group ref={mound}>
        <PowderMound color="#b8742f" radius={0.98} peak={0.16} seed={9} />
      </group>

      {/* thick glass bottom */}
      <mesh position={[0, JAR.base / 2, 0]} material={glass.base}>
        <cylinderGeometry args={[1.0, 1.0, JAR.base, 64]} />
      </mesh>

      {/* label printed on the glass */}
      <mesh geometry={labelGeo} material={labelMat} position={[0, JAR.labelY, 0]} renderOrder={2} />

      {/* glass + neck threads */}
      <mesh geometry={shell} material={glass.tint} renderOrder={3} />
      <mesh geometry={shell} material={glass.reflect} renderOrder={4} />
      <mesh geometry={shell} material={glass.rim} renderOrder={5} />
      {[0.36, 0.48].map((dy) => (
        <mesh key={dy} position={[0, top + dy, 0]} rotation-x={Math.PI / 2} material={glass.reflect} renderOrder={4}>
          <torusGeometry args={[0.915, 0.018, 8, 64]} />
        </mesh>
      ))}

      {/* brushed gold screw lid */}
      <group ref={lid}>
        <mesh position={[0, JAR.lidHeight / 2, 0]} material={gold}>
          <cylinderGeometry args={[0.97, 0.97, JAR.lidHeight, 72, 1]} />
        </mesh>
        <mesh position={[0, JAR.lidHeight + 0.012, 0]} material={gold}>
          <cylinderGeometry args={[0.9, 0.97, 0.03, 72]} />
        </mesh>
        {[0.05, JAR.lidHeight - 0.05].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2} material={gold}>
            <torusGeometry args={[0.975, 0.014, 8, 72]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Round log slice the jar stands on (bark side + growth-ring top). */
export function LogSlice() {
  const [side, topTex] = useTexture([assets.woodSide, assets.woodTop], (ts) => {
    (Array.isArray(ts) ? ts : [ts]).forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));
  });
  const mats = useMemo(() => {
    const s = side.clone();
    s.wrapS = THREE.RepeatWrapping;
    s.repeat.set(2, 1);
    s.needsUpdate = true;
    return [
      new THREE.MeshStandardMaterial({ map: s, roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.82 }),
      new THREE.MeshStandardMaterial({ color: '#2a170c', roughness: 1 }),
    ];
  }, [side, topTex]);
  const { radius, height } = JAR.log;
  return (
    <mesh position={[0, -height / 2, 0]} material={mats}>
      <cylinderGeometry args={[radius, radius * 1.03, height, 72, 1]} />
    </mesh>
  );
}

