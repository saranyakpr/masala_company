import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { rng } from '../utils/noise';

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  uniform float uHeight;
  attribute vec3 aRandom;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float speed = 0.05 + aRandom.y * 0.12;
    p.y = mod(position.y + uTime * speed + uHeight * 0.5, uHeight) - uHeight * 0.5;
    p.x += sin(uTime * 0.25 + aRandom.x * 6.2831) * 0.25;
    p.z += cos(uTime * 0.2 + aRandom.z * 6.2831) * 0.2;

    // pointer repulsion in the screen plane
    vec2 toP = p.xy - uPointer.xy;
    float d = length(toP);
    float push = smoothstep(1.4, 0.0, d) * uPointerStrength;
    p.xy += normalize(toP + 0.0001) * push * 0.9;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (34.0 / -mv.z);

    float edge = 1.0 - smoothstep(uHeight * 0.38, uHeight * 0.5, abs(p.y));
    vAlpha = edge * (0.35 + aRandom.x * 0.65) * (0.65 + 0.35 * sin(uTime * 1.3 + aRandom.z * 20.0));
    vColor = aColor;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * a * vAlpha);
    #include <colorspace_fragment>
  }
`;

interface SpiceDustProps {
  count: number;
  colors?: string[];
  spread?: [number, number, number];
  interactive?: boolean;
  size?: number;
}

const DEFAULT_COLORS = ['#e4c17a', '#e2a01b', '#c99a3e', '#b3221f', '#f3d9a0'];
const DEFAULT_SPREAD: [number, number, number] = [10, 6, 5];

/** Drifting motes of spice dust caught in warm light; gently repelled by the pointer. */
export function SpiceDust({
  count,
  colors = DEFAULT_COLORS,
  spread = DEFAULT_SPREAD,
  interactive = true,
  size = 1,
}: SpiceDustProps) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { gl, viewport } = useThree();
  const pointerTarget = useRef(new THREE.Vector3(99, 99, 0));

  const { positions, randoms, sizes, cols } = useMemo(() => {
    const r = rng(11);
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const cols = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (r() - 0.5) * spread[0];
      positions[i * 3 + 1] = (r() - 0.5) * spread[1];
      positions[i * 3 + 2] = (r() - 0.5) * spread[2];
      randoms[i * 3] = r();
      randoms[i * 3 + 1] = r();
      randoms[i * 3 + 2] = r();
      sizes[i] = (r() < 0.08 ? 3 + r() * 3 : 0.8 + r() * 1.8) * size;
      c.set(colors[Math.floor(r() * colors.length)]).convertSRGBToLinear();
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return { positions, randoms, sizes, cols };
  }, [count, colors, spread, size]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uPointer: { value: new THREE.Vector3(99, 99, 0) },
      uPointerStrength: { value: 0 },
      uHeight: { value: spread[1] },
    }),
    [gl, spread],
  );

  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    m.uniforms.uTime.value += delta;
    if (interactive) {
      pointerTarget.current.set((state.pointer.x * viewport.width) / 2, (state.pointer.y * viewport.height) / 2, 0);
      (m.uniforms.uPointer.value as THREE.Vector3).lerp(pointerTarget.current, 0.08);
      m.uniforms.uPointerStrength.value = THREE.MathUtils.lerp(m.uniforms.uPointerStrength.value, 1, 0.05);
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRandom" args={[randoms, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[cols, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
