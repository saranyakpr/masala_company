import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/*
 * Masala spilling from the tipped jar's mouth, in 3D: a dense spray of powder grains and small
 * clumps that leaves the mouth along the jar's axis and falls under gravity. The longer stream
 * that carries on past the banner is drawn by the homepage flow layer (SpiceFlow).
 */

export interface SprayState {
  x: number;
  y: number;
  z: number;
  /** Pour direction in stage space (jar axis). */
  dx: number;
  dy: number;
  rate: number;
}

const vertex = /* glsl */ `
  uniform float uTime; uniform vec3 uMouth; uniform vec2 uDir; uniform float uRate; uniform float uSize;
  attribute vec4 aRand; attribute vec3 aColor;
  varying vec3 vColor; varying float vAlpha; varying float vLight;
  void main() {
    float life = 0.55 + aRand.y * 0.35;
    float age = fract(uTime / life + aRand.x) * life;
    vec3 dir = vec3(uDir, 0.0);
    vec3 side = vec3(-uDir.y, uDir.x, 0.0);
    vec3 v = dir * (1.1 + aRand.z * 1.3) + side * (aRand.w - 0.5) * 0.9 + vec3(0.0, 0.0, (aRand.y - 0.5) * 0.9);
    vec3 p = uMouth + side * (aRand.w - 0.5) * 0.55 + v * age + vec3(0.0, -6.5 * age * age, 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float clump = step(0.88, aRand.z);
    gl_PointSize = mix(0.8 + aRand.w * 0.9, 2.2 + aRand.w * 1.6, clump) * uSize / -mv.z;
    vColor = aColor;
    vLight = 0.85 + clamp(p.y - uMouth.y + 0.6, -0.4, 0.4) * 0.35;
    // the stream thins at its edges and only exists while pouring
    vAlpha = step(aRand.x, uRate) * smoothstep(0.0, 0.05, age) * (1.0 - smoothstep(life * 0.7, life, age));
  }`;

const fragment = /* glsl */ `
  varying vec3 vColor; varying float vAlpha; varying float vLight;
  void main() {
    vec2 q = gl_PointCoord - 0.5;
    float d = length(q);
    float a = smoothstep(0.5, 0.18, d) * vAlpha;
    if (a < 0.02) discard;
    // a little top-left light on each grain
    float shade = 1.0 - dot(q, vec2(0.7, 0.7)) * 0.9;
    gl_FragColor = vec4(vColor * vLight * shade, a);
    #include <colorspace_fragment>
  }`;

/** Powder colours from the reference video's layered spice fill. */
const COLORS = ['#d8a02a', '#a6301d', '#c4622a', '#e0aa2e', '#6e5a35', '#b99a5e', '#9c2b1b', '#3c3127', '#d9a830'].map((c) => new THREE.Color(c));

export function PourSpray({ state, count }: { state: MutableRefObject<SprayState>; count: number }) {
  const { size, gl } = useThree();
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const rand = new Float32Array(count * 4).map(() => Math.random());
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uMouth: { value: new THREE.Vector3() },
          uDir: { value: new THREE.Vector2(0, -1) },
          uRate: { value: 0 },
          uSize: { value: 1 },
        },
      }),
    [],
  );

  useFrame((three) => {
    const s = state.current;
    const u = material.uniforms;
    u.uTime.value = three.clock.elapsedTime;
    u.uMouth.value.set(s.x, s.y, s.z);
    u.uDir.value.set(s.dx, s.dy);
    u.uRate.value = s.rate;
    u.uSize.value = size.height * gl.getPixelRatio() * 0.09;
    if (points.current) points.current.visible = s.rate > 0.01;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
