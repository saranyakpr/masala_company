import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { additive } from '../utils/additive';

/*
 * Atmosphere for the spice film: the golden light trails and spice streams that spiral
 * into the jar, the gold ring when the lid seals, impact dust, rising smoke and bokeh.
 * Each effect reads a 0–1 "amount" from the director so it can fade in and out with the scroll.
 */

type Amount = MutableRefObject<number>;

/* ---------------- spice streams pouring into the jar ---------------- */

const streamVertex = /* glsl */ `
  uniform float uTime; uniform float uAmount; uniform float uSize; uniform float uMouth;
  attribute vec4 aRand; attribute vec3 aColor;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float u = fract(aRand.x + uTime * (0.22 + aRand.y * 0.08));
    float lane = floor(aRand.z * 6.0);
    float ang = lane / 6.0 * 6.2832 + u * 7.5 + aRand.w * 0.4;
    float r = mix(3.1, 0.35, pow(u, 1.25)) + (aRand.y - 0.5) * 0.35 * (1.0 - u);
    float y = mix(6.6, uMouth, pow(u, 0.9)) + (aRand.w - 0.5) * 0.25;
    vec3 p = vec3(cos(ang) * r, y, sin(ang) * r);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.6 + aRand.w * 1.1) * uSize / -mv.z;
    vColor = aColor;
    vAlpha = uAmount * smoothstep(0.0, 0.08, u) * (1.0 - smoothstep(0.9, 1.0, u));
  }`;

const dotFragment = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }`;

const streamColors = ['#f2b21b', '#c3321c', '#c9b06a', '#8d6a3c', '#3b3029', '#d0892a'].map((c) => new THREE.Color(c));

export function SpiceStreams({ amount, count, mouthY }: { amount: Amount; count: number; mouthY: number }) {
  const { size, gl } = useThree();
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const r = new Float32Array(count * 4).map(() => Math.random());
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const c = streamColors[Math.floor(r[i * 4 + 2] * 6)];
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(r, 4));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: streamVertex,
        fragmentShader: dotFragment,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uSize: { value: 1 }, uMouth: { value: mouthY } },
      }),
    [mouthY],
  );
  const points = useRef<THREE.Points>(null);
  useFrame((state) => {
    const a = amount.current;
    if (points.current) points.current.visible = a > 0.01;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uAmount.value = a;
    material.uniforms.uSize.value = size.height * gl.getPixelRatio() * 0.085;
  });
  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}

/* ---------------- golden light trails ---------------- */

const trailVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const trailFragment = /* glsl */ `
  uniform float uHead; uniform float uAmount; uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float d = uHead - vUv.x;
    float tail = smoothstep(0.42, 0.0, d) * step(0.0, d);
    float a = tail * uAmount;
    if (a < 0.005) discard;
    gl_FragColor = vec4(uColor * (1.2 + tail * 1.6), a);
  }`;

function helix(turns: number, r0: number, r1: number, y0: number, y1: number, phase: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 160; i++) {
    const t = i / 160;
    const a = phase + t * turns * Math.PI * 2;
    const r = THREE.MathUtils.lerp(r0, r1, t);
    pts.push(new THREE.Vector3(Math.cos(a) * r, THREE.MathUtils.lerp(y0, y1, t), Math.sin(a) * r));
  }
  return new THREE.CatmullRomCurve3(pts);
}

export function LightTrails({ amount }: { amount: Amount }) {
  const trails = useMemo(
    () =>
      [
        { curve: helix(2.2, 2.6, 1.3, 6.2, 0.6, 0), speed: 0.32, offset: 0 },
        { curve: helix(1.8, 2.0, 1.45, 0.8, 5.2, 2.2), speed: 0.27, offset: 0.4 },
        { curve: helix(2.6, 3.0, 1.25, 5.6, 1.6, 4.1), speed: 0.36, offset: 0.7 },
      ].map((t) => ({
        ...t,
        geometry: new THREE.TubeGeometry(t.curve, 240, 0.028, 8, false),
        material: additive(
          new THREE.ShaderMaterial({
            vertexShader: trailVertex,
            fragmentShader: trailFragment,
            uniforms: { uHead: { value: 0 }, uAmount: { value: 0 }, uColor: { value: new THREE.Color('#ffcf6b') } },
          }),
        ),
      })),
    [],
  );
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    const a = amount.current;
    if (group.current) group.current.visible = a > 0.01;
    trails.forEach((t) => {
      t.material.uniforms.uHead.value = ((state.clock.elapsedTime * t.speed + t.offset) % 1) * 1.42;
      t.material.uniforms.uAmount.value = a;
    });
  });
  return (
    <group ref={group}>
      {trails.map((t, i) => (
        <mesh key={i} geometry={t.geometry} material={t.material} frustumCulled={false} />
      ))}
    </group>
  );
}

/** Expanding gold ring of light when the lid seals. */
export function SealRing({ amount, y }: { amount: Amount; y: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(() => additive(new THREE.MeshBasicMaterial({ color: '#ffd27a' })), []);
  useFrame(() => {
    const a = amount.current; // 0 → 1 over the ring's life
    const m = mesh.current;
    if (!m) return;
    m.visible = a > 0 && a < 1;
    m.scale.setScalar(1 + a * 2.4);
    material.opacity = Math.sin(Math.PI * Math.min(1, a)) * 0.95;
  });
  return (
    <mesh ref={mesh} position={[0, y, 0]} rotation-x={Math.PI / 2} material={material}>
      <torusGeometry args={[1.0, 0.025, 8, 96]} />
    </mesh>
  );
}

/* ---------------- impact dust when the jar lands ---------------- */

const dustVertex = /* glsl */ `
  uniform float uT; uniform float uSize;
  attribute vec4 aRand;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float a = aRand.x * 6.2832;
    float e = 1.0 - pow(1.0 - uT, 3.0);
    float r = 1.05 + e * (0.6 + aRand.y * 1.8);
    vec3 p = vec3(cos(a) * r, 0.04 + e * aRand.z * 0.9 - uT * uT * 0.4, sin(a) * r);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.8 + aRand.w * 1.6) * uSize / -mv.z;
    vColor = mix(vec3(0.85, 0.55, 0.22), vec3(0.95, 0.78, 0.45), aRand.w);
    vAlpha = (1.0 - smoothstep(0.35, 1.0, uT)) * smoothstep(0.0, 0.04, uT) * 0.8;
  }`;

export function ImpactDust({ amount, count = 700 }: { amount: Amount; count?: number }) {
  const { size, gl } = useThree();
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(new Float32Array(count * 4).map(() => Math.random()), 4));
    return g;
  }, [count]);
  const material = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: dustVertex, fragmentShader: dotFragment, transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uSize: { value: 1 } } }),
    [],
  );
  const pts = useRef<THREE.Points>(null);
  useFrame(() => {
    const t = amount.current;
    if (pts.current) pts.current.visible = t > 0 && t < 1;
    material.uniforms.uT.value = t;
    material.uniforms.uSize.value = size.height * gl.getPixelRatio() * 0.07;
  });
  return <points ref={pts} geometry={geometry} material={material} frustumCulled={false} />;
}

/* ---------------- smoke wisps ---------------- */

const smokeFragment = /* glsl */ `
  uniform float uTime; uniform float uAmount; uniform float uSeed;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.12 + uSeed;
    vec2 q = vec2(uv.x * 2.0 + fbm(uv * 3.0 + t) * 1.2, uv.y * 3.0 - t * 1.5);
    float wisp = fbm(q + fbm(q * 1.7 - t));
    float band = smoothstep(0.35, 0.0, abs(uv.x - 0.5 - sin(uv.y * 5.0 + t * 2.0) * 0.12));
    float a = smoothstep(0.45, 0.85, wisp) * band * smoothstep(0.0, 0.25, uv.y) * smoothstep(1.0, 0.55, uv.y) * uAmount * 0.55;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vec3(1.0, 0.93, 0.82), a);
  }`;

export function Smoke({ amount, position, scale = [2.2, 4.5], seed = 0 }: { amount: Amount; position: [number, number, number]; scale?: [number, number]; seed?: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: trailVertex,
        fragmentShader: smokeFragment,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uSeed: { value: seed } },
      }),
    [seed],
  );
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const a = amount.current;
    if (mesh.current) {
      mesh.current.visible = a > 0.01;
      mesh.current.quaternion.copy(state.camera.quaternion);
    }
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uAmount.value = a;
  });
  return (
    <mesh ref={mesh} position={position} material={material}>
      <planeGeometry args={[scale[0], scale[1]]} />
    </mesh>
  );
}

/* ---------------- bokeh ---------------- */

const bokehVertex = /* glsl */ `
  uniform float uTime; uniform float uSize;
  attribute vec4 aRand;
  varying float vAlpha;
  void main() {
    vec3 p = position + vec3(sin(uTime * 0.2 + aRand.x * 6.28) * 0.3, mod(uTime * (0.05 + aRand.y * 0.08) + aRand.z * 8.0, 8.0) - 4.0, 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + aRand.w * 5.0) * uSize / -mv.z;
    vAlpha = (0.25 + 0.45 * aRand.w) * (0.6 + 0.4 * sin(uTime * (0.6 + aRand.y) + aRand.x * 10.0));
  }`;
const bokehFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = (smoothstep(0.5, 0.38, d) * 0.6 + smoothstep(0.5, 0.0, d) * 0.4) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(1.0, 0.8, 0.45, a);
  }`;

export function Bokeh({ count = 90, center, spread }: { count?: number; center: [number, number, number]; spread: [number, number, number] }) {
  const { size, gl } = useThree();
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) pos.set([(Math.random() - 0.5) * spread[0], (Math.random() - 0.5) * spread[1], -Math.random() * spread[2] - 1], i * 3);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(new Float32Array(count * 4).map(() => Math.random()), 4));
    return g;
  }, [count, spread]);
  const material = useMemo(
    () =>
      additive(new THREE.ShaderMaterial({ vertexShader: bokehVertex, fragmentShader: bokehFragment, uniforms: { uTime: { value: 0 }, uSize: { value: 1 } } })),
    [],
  );
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uSize.value = size.height * gl.getPixelRatio() * 0.045;
  });
  return <points position={center} geometry={geometry} material={material} frustumCulled={false} />;
}
