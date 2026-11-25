import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { SceneCanvas } from './SceneCanvas';
import { rng } from './utils/noise';
import { useDeviceTier } from '@/hooks/useDeviceTier';

interface ProcessSceneProps {
  /** 0 → 1 progress through the process storytelling section. */
  progress: MotionValue<number>;
}

const STAGES = 6;

/**
 * Scroll-driven storytelling scene. One particle system morphs through six formations
 * that mirror the manufacturing steps: sourcing → cleaning → drying → grinding → blending → packaging.
 */
export default function ProcessScene({ progress }: ProcessSceneProps) {
  const tier = useDeviceTier();
  const count = tier === 'high' ? 2200 : tier === 'mid' ? 1300 : 700;
  return (
    <SceneCanvas
      className="relative h-full w-full"
      camera={{ position: [0, 1.2, 6.5], fov: 38 }}
      loaderLabel="Setting up the line"
      fallback={<div className="h-full w-full" aria-hidden="true" />}
    >
      <MorphingSpice progress={progress} count={count} />
    </SceneCanvas>
  );
}

/* ------------------------------------------------------------------ */
/* Formations                                                           */
/* ------------------------------------------------------------------ */

const SPICE = ['#b3221f', '#e2a01b', '#b39a5c'];
const DRIED = ['#8a1a16', '#c9860f', '#8e7a48'];
const MIX = ['#b3221f', '#e2a01b', '#b39a5c', '#7a4b2a', '#3a2e27', '#c99a3e', '#8c4f2b'];

interface Formation {
  pos: Float32Array;
  col: Float32Array;
  size: Float32Array;
}

function buildFormations(n: number): Formation[] {
  const make = (): Formation => ({ pos: new Float32Array(n * 3), col: new Float32Array(n * 3), size: new Float32Array(n) });
  const f = Array.from({ length: STAGES }, make);
  const r = rng(42);
  const c = new THREE.Color();
  const setCol = (F: Formation, i: number, hex: string, jitter = 0.06) => {
    c.set(hex).convertSRGBToLinear();
    const j = 1 + (r() - 0.5) * jitter * 2;
    F.col[i * 3] = c.r * j;
    F.col[i * 3 + 1] = c.g * j;
    F.col[i * 3 + 2] = c.b * j;
  };
  const setPos = (F: Formation, i: number, x: number, y: number, z: number) => {
    F.pos[i * 3] = x;
    F.pos[i * 3 + 1] = y;
    F.pos[i * 3 + 2] = z;
  };

  for (let i = 0; i < n; i++) {
    const k = i % 3;

    // 0 — sourcing: three heaps of whole spice
    {
      const h = Math.pow(r(), 0.75);
      const a = r() * Math.PI * 2;
      const rad = 0.95 * Math.sqrt(r()) * (1 - h);
      setPos(f[0], i, (k - 1) * 1.9 + Math.cos(a) * rad, -1 + h * 1.15, Math.sin(a) * rad);
      setCol(f[0], i, SPICE[k]);
      f[0].size[i] = 1.25 + r() * 0.5;
    }

    // 1 — cleaning & sorting: a sieve (phyllotaxis disc) with rejects falling away
    {
      const reject = r() < 0.1;
      if (reject) {
        setPos(f[1], i, (r() - 0.5) * 4.4, -1.35 - r() * 0.5, (r() - 0.5) * 1.6);
        setCol(f[1], i, '#5a4a3e', 0.15);
        f[1].size[i] = 1 + r() * 0.6;
      } else {
        const golden = Math.PI * (3 - Math.sqrt(5));
        const rad = 2.1 * Math.sqrt(i / n);
        const a = i * golden;
        setPos(f[1], i, Math.cos(a) * rad, 0.25 + (r() - 0.5) * 0.06, Math.sin(a) * rad * 0.9);
        setCol(f[1], i, SPICE[k]);
        f[1].size[i] = 1.1 + r() * 0.3;
      }
    }

    // 2 — drying: three stacked trays
    {
      const tray = k;
      setPos(f[2], i, (r() - 0.5) * 3.8, -1 + tray * 1.0 + r() * 0.06, (r() - 0.5) * 1.8);
      setCol(f[2], i, DRIED[tray]);
      f[2].size[i] = 0.95 + r() * 0.3;
    }

    // 3 — grinding: a fine vortex funnel
    {
      const t = r();
      const a = t * Math.PI * 14 + r() * 0.4;
      const rad = 0.12 + Math.pow(t, 1.3) * 1.75;
      setPos(f[3], i, Math.cos(a) * rad, -1.3 + t * 2.7, Math.sin(a) * rad);
      setCol(f[3], i, DRIED[k]);
      f[3].size[i] = 0.5 + r() * 0.25;
    }

    // 4 — blending: a swirling sphere of mixed colours
    {
      const u = r() * 2 - 1;
      const a = r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const rad = 1.45 * (0.82 + r() * 0.18);
      const swirl = u * 2.2;
      setPos(f[4], i, Math.cos(a + swirl) * s * rad, u * rad * 0.95, Math.sin(a + swirl) * s * rad);
      setCol(f[4], i, MIX[Math.floor(r() * MIX.length)]);
      f[4].size[i] = 0.55 + r() * 0.3;
    }

    // 5 — packaging: a sealed stand-up pouch outline (front & back surfaces)
    {
      const x = (r() * 2 - 1) * 0.95;
      const y = (r() * 2 - 1) * 1.35;
      const nx = x / 0.95;
      const ny = y / 1.35;
      let thick = Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(nx), 4)));
      if (ny > 0.8) thick *= 0.08;
      const side = r() > 0.5 ? 1 : -1;
      setPos(f[5], i, x * (1 + 0.03 * (1 - ny)), y + 0.1, side * 0.32 * thick);
      const inLabel = Math.abs(x) < 0.62 && ny > -0.62 && ny < 0.6;
      const onFrame = inLabel && (Math.abs(Math.abs(x) - 0.6) < 0.04 || Math.abs(ny - 0.58) < 0.03 || Math.abs(ny + 0.6) < 0.03);
      const inWindow = Math.hypot(x, y - 0.35) < 0.32;
      const color = side < 0 ? '#7d1015' : onFrame ? '#f0cf86' : inWindow ? '#f0b323' : ny > 0.8 ? '#6a1015' : '#b3221f';
      setCol(f[5], i, color, 0.04);
      f[5].size[i] = side > 0 ? 1.15 : 0.8;
    }
  }
  return f;
}

/* ------------------------------------------------------------------ */
/* Shader: lit spherical sprites                                        */
/* ------------------------------------------------------------------ */

const vertex = /* glsl */ `
  uniform float uPixelRatio;
  uniform float uScale;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale * uPixelRatio * (46.0 / -mv.z);
    vColor = aColor;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;
    vec3 n = vec3(uv.x, -uv.y, sqrt(1.0 - r2));
    vec3 l = normalize(vec3(0.5, 0.7, 0.6));
    float diff = max(dot(n, l), 0.0);
    float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 24.0);
    vec3 col = vColor * (0.32 + diff * 0.9) + spec * 0.18;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function MorphingSpice({ progress, count }: ProcessSceneProps & { count: number }) {
  const { gl, viewport } = useThree();
  const tier = useDeviceTier();
  const group = useRef<THREE.Group>(null);
  const geo = useRef<THREE.BufferGeometry>(null);
  const formations = useMemo(() => buildFormations(count), [count]);
  const delays = useMemo(() => {
    const r = rng(7);
    return Float32Array.from({ length: count }, () => r());
  }, [count]);
  const buffers = useMemo(
    () => ({ pos: formations[0].pos.slice(), col: formations[0].col.slice(), size: formations[0].size.slice() }),
    [formations],
  );
  const uniforms = useMemo(
    () => ({ uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) }, uScale: { value: 1 } }),
    [gl],
  );
  const smoothed = useRef(0);
  const spin = useRef(0);

  useFrame((state, delta) => {
    const g = geo.current;
    if (!g) return;
    // ease towards the scroll target for buttery morphs
    smoothed.current = THREE.MathUtils.damp(smoothed.current, progress.get(), 4, delta);
    const s = THREE.MathUtils.clamp(smoothed.current, 0, 1) * (STAGES - 1);
    const idx = Math.min(STAGES - 2, Math.floor(s));
    const t = s - idx;
    const A = formations[idx];
    const B = formations[idx + 1];
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const d = delays[i];
      const local = THREE.MathUtils.clamp((t - d * 0.35) / 0.65, 0, 1);
      const e = local * local * (3 - 2 * local);
      const i3 = i * 3;
      // little arc so particles travel rather than slide
      const lift = Math.sin(e * Math.PI) * 0.35 * (d - 0.5);
      for (let k = 0; k < 3; k++) {
        buffers.pos[i3 + k] = A.pos[i3 + k] + (B.pos[i3 + k] - A.pos[i3 + k]) * e;
        buffers.col[i3 + k] = A.col[i3 + k] + (B.col[i3 + k] - A.col[i3 + k]) * e;
      }
      buffers.pos[i3 + 1] += lift + Math.sin(time * 1.2 + d * 30) * 0.012;
      buffers.size[i] = A.size[i] + (B.size[i] - A.size[i]) * e;
    }
    (g.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.aColor as THREE.BufferAttribute).needsUpdate = true;
    (g.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;

    // grinding stage spins faster
    const grindFocus = Math.max(0, 1 - Math.abs(s - 3));
    spin.current += delta * (0.12 + grindFocus * 1.6);
    if (group.current) {
      group.current.rotation.y = spin.current;
      group.current.rotation.x = 0.18 + (tier === 'high' ? state.pointer.y * 0.08 : 0);
    }
  });

  const scale = Math.min(1, viewport.width / 6.2);

  return (
    <group ref={group} scale={scale}>
      <points frustumCulled={false}>
        <bufferGeometry ref={geo}>
          <bufferAttribute attach="attributes-position" args={[buffers.pos, 3]} usage={THREE.DynamicDrawUsage} />
          <bufferAttribute attach="attributes-aColor" args={[buffers.col, 3]} usage={THREE.DynamicDrawUsage} />
          <bufferAttribute attach="attributes-aSize" args={[buffers.size, 1]} usage={THREE.DynamicDrawUsage} />
        </bufferGeometry>
        <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
      </points>
    </group>
  );
}
