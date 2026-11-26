import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { filmChapters, type FilmChapter, type PieceKind } from '@/data/film';
import { cardamomGeometry, chilliGeometry, corianderGeometry, peppercornGeometry } from './geometries';
import { Cinnamon, StarAnise, TurmericRoot } from './Spices';
import { additive } from '../utils/additive';

/*
 * Spice "explosions" from the reference video: a powder cloud (one shader-driven point cloud)
 * plus whole spices flung out of it. Everything is a pure function of the chapter's local
 * time `t` (0 → 1), so scrubbing the scroll backwards plays the burst in reverse.
 */

const STYLE = { star: 0, stream: 1, swirl: 2, float: 3 } as const;

const powderVertex = /* glsl */ `
  uniform float uT; uniform float uStyle; uniform float uSpikes; uniform float uRot; uniform float uSize; uniform float uDensity;
  uniform vec3 uColA; uniform vec3 uColB;
  attribute vec4 aRand; attribute vec2 aRand2;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float t = uT;
    float e = 1.0 - pow(1.0 - clamp(t * 1.45, 0.0, 1.0), 3.0);
    vec3 p;
    if (uStyle < 0.5) {
      float inSpike = step(aRand.y, 0.74);
      float ang = (floor(aRand.x * uSpikes) + 0.5) / uSpikes * 6.2832 + uRot + (aRand.z - 0.5) * mix(2.2, 0.24, inSpike);
      float r = pow(aRand.w, 0.75) * mix(1.5, 3.5, inSpike) * e + t * 0.35;
      if (aRand.y > 0.92) r *= 0.32; // dense core
      p = vec3(cos(ang) * r, sin(ang) * r, (aRand.z - 0.5) * (0.6 + r * 0.45));
    } else if (uStyle < 1.5) {
      vec3 L = normalize(vec3(1.0, -0.62, 0.1));
      vec3 N = normalize(vec3(0.62, 1.0, 0.0));
      float along = (aRand.x - 0.5) * 8.5 + (t - 0.5) * 3.2;
      float width = (aRand.y - 0.5) * mix(0.5, 2.3, aRand.w) * (0.55 + 0.45 * e);
      p = L * along + N * width + vec3(0.0, 0.0, (aRand.z - 0.5) * 1.4);
    } else if (uStyle < 2.5) {
      float r = (0.25 + pow(aRand.w, 0.6) * 3.1) * (0.3 + 0.7 * e);
      float ang = aRand.x * 6.2832 * 1.5 + t * 2.2 + r * 1.1;
      p = vec3(cos(ang) * r, sin(ang) * r * 0.85, (aRand.z - 0.5) * 1.3);
    } else {
      vec3 d = normalize(vec3(aRand.x - 0.5, aRand.y - 0.5, (aRand.z - 0.5) * 0.7) + 1e-4);
      p = d * (0.8 + aRand.w * 3.2) * (0.75 + 0.25 * e) + vec3(0.0, t * 0.3, 0.0);
    }
    float c = cos(t * 0.25), s = sin(t * 0.25);
    p.xy = mat2(c, -s, s, c) * p.xy;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float clump = step(0.86, aRand2.x);
    gl_PointSize = mix(0.55 + aRand2.y * 0.6, 1.7 + aRand2.y * 1.6, clump) * uSize / -mv.z;
    float light = 0.82 + clamp((p.y - p.x) * 0.06, -0.15, 0.25);
    vColor = mix(uColA, uColB, aRand2.y) * light * (0.8 + aRand.w * 0.35);
    vAlpha = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.8, 1.0, t)) * step(aRand2.x * 0.999, uDensity);
  }`;

const powderFragment = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec2 q = gl_PointCoord - 0.5;
    float d = length(q);
    float a = smoothstep(0.5, 0.15, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * (1.05 - d * 0.5), a);
    #include <colorspace_fragment>
  }`;

function Powder({ count, chapterRef }: { count: number; chapterRef: React.MutableRefObject<{ index: number; local: number }> }) {
  const { size, gl } = useThree();
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const r4 = new Float32Array(count * 4);
    const r2 = new Float32Array(count * 2);
    for (let i = 0; i < count * 4; i++) r4[i] = Math.random();
    for (let i = 0; i < count * 2; i++) r2[i] = Math.random();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(r4, 4));
    g.setAttribute('aRand2', new THREE.BufferAttribute(r2, 2));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8);
    return g;
  }, [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: powderVertex,
        fragmentShader: powderFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uT: { value: 0 },
          uStyle: { value: 0 },
          uSpikes: { value: 11 },
          uRot: { value: 0 },
          uSize: { value: 1 },
          uDensity: { value: 1 },
          uColA: { value: new THREE.Color() },
          uColB: { value: new THREE.Color() },
        },
      }),
    [],
  );
  const lastIndex = useRef(-2);

  useFrame(() => {
    const { index, local } = chapterRef.current;
    const u = material.uniforms;
    u.uSize.value = size.height * gl.getPixelRatio() * 0.095;
    if (index < 0) {
      u.uT.value = 0;
      return;
    }
    if (index !== lastIndex.current) {
      lastIndex.current = index;
      const ch = filmChapters[index];
      u.uColA.value.set(ch.colors[0]);
      u.uColB.value.set(ch.colors[1]);
      u.uStyle.value = STYLE[ch.style];
      u.uSpikes.value = 9 + (index % 4);
      u.uRot.value = index * 0.7;
      u.uDensity.value = ch.powder;
    }
    u.uT.value = local;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Whole pieces                                                         */

interface Seed {
  dir: THREE.Vector3;
  speed: number;
  spin: THREE.Vector3;
  rot: THREE.Euler;
  scale: number;
  a: number;
  b: number;
}

const makeSeeds = (n: number, base: number) =>
  Array.from({ length: n }, () => ({
    dir: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, (Math.random() - 0.5) * 0.7).normalize(),
    speed: 0.55 + Math.random() * 0.95,
    spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(5),
    rot: new THREE.Euler(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28),
    scale: base * (0.8 + Math.random() * 0.45),
    a: Math.random(),
    b: Math.random(),
  }));

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpP = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const L = new THREE.Vector3(1, -0.62, 0.1).normalize();
const N = new THREE.Vector3(0.62, 1, 0).normalize();

/** Position + transform of one piece for the chapter style at local time t. Returns visibility scale. */
function placePiece(s: Seed, style: FilmChapter['style'], t: number, out: THREE.Object3D | null, m?: THREE.Matrix4) {
  const e = 1 - Math.pow(1 - Math.min(1, t * 1.4), 3);
  const appear = THREE.MathUtils.smoothstep(t, 0.02, 0.1) * (1 - THREE.MathUtils.smoothstep(t, 0.84, 1));
  if (style === 'star') {
    tmpP.copy(s.dir).multiplyScalar((0.4 + s.speed * 3.0) * e + t * 0.4);
  } else if (style === 'stream') {
    tmpP.copy(L).multiplyScalar((s.a - 0.5) * 7 + (t - 0.5) * 3.4).addScaledVector(N, (s.b - 0.5) * 2.2);
    tmpP.z = s.dir.z * 1.5;
  } else if (style === 'swirl') {
    const r = (0.6 + s.speed * 2.4) * (0.35 + 0.65 * e);
    const ang = s.a * Math.PI * 2 + t * 2.2 + r * 0.9;
    tmpP.set(Math.cos(ang) * r, Math.sin(ang) * r * 0.85, s.dir.z * 1.4);
  } else {
    tmpP.copy(s.dir).multiplyScalar((0.7 + s.speed * 2.3) * (0.7 + 0.3 * e));
    tmpP.y += t * 0.35;
  }
  tmpE.set(s.rot.x + s.spin.x * t, s.rot.y + s.spin.y * t, s.rot.z + s.spin.z * t);
  const sc = s.scale * appear;
  if (m) {
    tmpQ.setFromEuler(tmpE);
    tmpS.setScalar(Math.max(sc, 1e-4));
    m.compose(tmpP, tmpQ, tmpS);
  }
  if (out) {
    out.position.copy(tmpP);
    out.rotation.copy(tmpE);
    out.scale.setScalar(Math.max(sc, 1e-4));
    out.visible = sc > 0.001;
  }
}

const INSTANCED: { kind: PieceKind; max: number; scale: number; geometry: () => THREE.BufferGeometry; material: () => THREE.Material; squash?: [number, number, number] }[] = [
  { kind: 'pepper', max: 48, scale: 1.1, geometry: peppercornGeometry, material: () => new THREE.MeshStandardMaterial({ color: '#2a1d16', roughness: 0.75, metalness: 0.05 }) },
  { kind: 'coriander', max: 40, scale: 1.0, geometry: corianderGeometry, material: () => new THREE.MeshStandardMaterial({ color: '#c2a66a', roughness: 0.7 }) },
  { kind: 'cumin', max: 44, scale: 0.72, geometry: cardamomGeometry, material: () => new THREE.MeshStandardMaterial({ color: '#8a6a3e', roughness: 0.8 }), squash: [0.42, 1, 0.42] },
  { kind: 'cardamom', max: 26, scale: 1.5, geometry: cardamomGeometry, material: () => new THREE.MeshStandardMaterial({ color: '#8f9f5e', roughness: 0.6 }) },
  { kind: 'chilli', max: 9, scale: 1.0, geometry: chilliGeometry, material: () => new THREE.MeshPhysicalMaterial({ color: '#b3160f', roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.3 }) },
];

function InstancedPieces({ spec, chapterRef }: { spec: (typeof INSTANCED)[number]; chapterRef: React.MutableRefObject<{ index: number; local: number }> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => makeSeeds(spec.max, spec.scale), [spec]);
  const geometry = useMemo(() => {
    const g = spec.geometry().clone();
    if (spec.squash) g.scale(...spec.squash);
    return g;
  }, [spec]);
  const material = useMemo(spec.material, [spec]);
  useLayoutEffect(() => {
    if (mesh.current) mesh.current.count = 0;
  }, []);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const { index, local } = chapterRef.current;
    const ch = index >= 0 ? filmChapters[index] : null;
    const n = ch ? Math.min(spec.max, ch.pieces[spec.kind] ?? 0) : 0;
    m.count = n;
    if (!n || !ch) return;
    for (let i = 0; i < n; i++) {
      placePiece(seeds[i], ch.style, local, null, tmpM);
      m.setMatrixAt(i, tmpM);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geometry, material, spec.max]} frustumCulled={false} />;
}

const POOLED: { kind: PieceKind; max: number; scale: number; C: typeof StarAnise }[] = [
  { kind: 'anise', max: 4, scale: 1.35, C: StarAnise },
  { kind: 'cinnamon', max: 3, scale: 1.0, C: Cinnamon },
  { kind: 'turmeric', max: 7, scale: 1.25, C: TurmericRoot },
];

function PooledPieces({ spec, chapterRef }: { spec: (typeof POOLED)[number]; chapterRef: React.MutableRefObject<{ index: number; local: number }> }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const seeds = useMemo(() => makeSeeds(spec.max, spec.scale), [spec]);
  useFrame(() => {
    const { index, local } = chapterRef.current;
    const ch = index >= 0 ? filmChapters[index] : null;
    const n = ch ? Math.min(spec.max, ch.pieces[spec.kind] ?? 0) : 0;
    refs.current.forEach((g, i) => {
      if (!g) return;
      if (i >= n || !ch) {
        g.visible = false;
        return;
      }
      placePiece(seeds[i], ch.style, local, g);
    });
  });
  const C = spec.C;
  return (
    <>
      {seeds.map((_, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)} visible={false}>
          <C />
        </group>
      ))}
    </>
  );
}

/** Bright flash + lingering glow at the heart of each burst. */
function CoreGlow({ chapterRef }: { chapterRef: React.MutableRefObject<{ index: number; local: number }> }) {
  const sprite = useRef<THREE.Sprite>(null);
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  const material = useMemo(() => additive(new THREE.SpriteMaterial({ map: tex })), [tex]);
  useFrame(() => {
    const s = sprite.current;
    if (!s) return;
    const { index, local } = chapterRef.current;
    if (index < 0) {
      s.visible = false;
      return;
    }
    s.visible = true;
    const flash = Math.exp(-Math.pow((local - 0.05) / 0.05, 2));
    const m = s.material as THREE.SpriteMaterial;
    m.color.set(filmChapters[index].colors[0]).lerp(new THREE.Color('#fff2d0'), flash * 0.6);
    m.opacity = (0.28 + flash * 0.7) * (1 - THREE.MathUtils.smoothstep(local, 0.8, 1));
    s.scale.setScalar(4.5 + flash * 3);
  });
  return (
    <sprite ref={sprite} material={material} />
  );
}

export function FilmBurst({ chapterRef, powderCount }: { chapterRef: React.MutableRefObject<{ index: number; local: number }>; powderCount: number }) {
  return (
    <group>
      <CoreGlow chapterRef={chapterRef} />
      <Powder count={powderCount} chapterRef={chapterRef} />
      {INSTANCED.map((spec) => (
        <InstancedPieces key={spec.kind} spec={spec} chapterRef={chapterRef} />
      ))}
      {POOLED.map((spec) => (
        <PooledPieces key={spec.kind} spec={spec} chapterRef={chapterRef} />
      ))}
    </group>
  );
}
