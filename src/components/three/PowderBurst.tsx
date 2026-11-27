import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { seeded, smoothstep } from '../../lib/math'
import { scene } from '../../lib/scene'
import { bottleRuntime } from './runtime'

/**
 * Scroll-scrubbed powder simulation.
 *
 * Every grain has a deterministic trajectory that is a pure function of the
 * story-section progress: emitted from the jar's sifter, thrown along the
 * jar axis, pulled by gravity, then guided down onto a layered "spice
 * landscape". Because it is a function of scroll (not time), scrolling back
 * up rewinds it perfectly — and it costs nothing on the CPU.
 */

const RIDGE_GLSL = /* glsl */ `
float ridgeTop(float x, float layer, vec2 hv, float amp){
  float u = x / hv.x * 3.0;
  float d = 0.55 + 0.22 * sin(u * 0.55 + layer * 1.7) + 0.12 * sin(u * 1.3 + layer * 2.9) + 0.06 * sin(u * 2.7 + layer);
  return -hv.y + hv.y * amp * d;
}
`

const LAYERS = [
  { layer: 2, z: -1.6, amp: 0.78, delay: 0.0, shade: 0.42 },
  { layer: 1, z: -0.4, amp: 0.6, delay: 0.06, shade: 0.68 },
  { layer: 0, z: 0.9, amp: 0.42, delay: 0.12, shade: 1.0 },
]

function usePowderMaterial() {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uProgress: { value: 0 },
          uOrigin: { value: new THREE.Vector3() },
          uDir: { value: new THREE.Vector3(-1, -0.4, 0) },
          uColor: { value: new THREE.Color() },
          uColorDeep: { value: new THREE.Color() },
          uHalf: { value: new THREE.Vector2(4, 2.5) },
          uShift: { value: 0 },
          uTime: { value: 0 },
          uScale: { value: 1000 },
          uMobile: { value: 0 },
          uFade: { value: 1 },
        },
        vertexShader: /* glsl */ `
          attribute vec4 aSeed;
          attribute float aEmit;
          uniform float uProgress, uShift, uTime, uScale, uMobile;
          uniform vec3 uOrigin, uDir;
          uniform vec2 uHalf;
          varying float vAlpha;
          varying float vMix;
          varying float vMote;
          ${RIDGE_GLSL}
          void main(){
            float emitT = mix(0.2, 0.62, aEmit);
            float life = 0.15 + aSeed.w * 0.1;
            float tau = clamp((uProgress - emitT) / life, 0.0, 1.0);
            float born = step(emitT, uProgress);
            float mote = step(0.68, aSeed.w);

            // --- ballistic stream out of the sifter
            vec3 spread = normalize(aSeed.xyz - 0.5 + 0.0001);
            vec3 v0 = uDir * (1.6 + aSeed.x * 1.4) + spread * (0.35 + mote * 0.6);
            float ft = tau * 1.15;
            vec3 p = uOrigin + v0 * ft + vec3(-0.6, -3.4, 0.0) * ft * ft * 0.5;
            p += 0.08 * vec3(sin(ft * 9.0 + aSeed.y * 40.0), cos(ft * 7.0 + aSeed.z * 30.0), sin(ft * 5.0 + aSeed.x * 20.0)) * ft;

            // --- landing target on the dunes (or a hanging mote)
            float layer = floor(aSeed.z * 2.0); // front two ridges
            float tz = layer < 0.5 ? 0.9 : -0.4;
            float amp = layer < 0.5 ? (uMobile > 0.5 ? 0.3 : 0.42) : (uMobile > 0.5 ? 0.44 : 0.6);
            float tx = mix(-1.08, 1.08, fract(aSeed.y * 7.31 + aSeed.x)) * uHalf.x * (1.0 + (tz < 0.0 ? 0.08 : 0.0));
            float ty = ridgeTop(tx, layer, uHalf, amp) + pow(aSeed.x, 3.0) * 0.08;
            vec3 target = vec3(tx, ty, tz);
            vec3 moteTarget = vec3((aSeed.y * 2.0 - 1.0) * uHalf.x * 1.1, (aSeed.z * 1.6 - 0.6) * uHalf.y, (aSeed.x - 0.5) * 3.0);
            moteTarget += 0.12 * vec3(sin(uTime * 0.4 + aSeed.x * 30.0), sin(uTime * 0.5 + aSeed.y * 30.0), 0.0);
            target = mix(target, moteTarget, mote);

            float settle = smoothstep(0.32, 1.0, tau);
            p = mix(p, target, settle);
            p.y += uShift;

            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float size = mix(0.016, 0.034, aSeed.y) * (1.0 + mote * 0.6);
            gl_PointSize = born * size * uScale / -mv.z;
            vAlpha = born * mix(0.95, 0.55 * (1.0 - settle * 0.4), mote);
            vMix = aSeed.z;
            vMote = mote;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor, uColorDeep;
          uniform float uFade;
          varying float vAlpha;
          varying float vMix;
          varying float vMote;
          void main(){
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            float soft = smoothstep(0.5, 0.15, d);
            vec3 col = mix(uColorDeep, uColor, 0.35 + vMix * 0.65);
            col += vec3(1.0, 0.75, 0.45) * 0.25 * vMote;
            col *= 0.85 + 0.35 * (0.5 - c.y);
            gl_FragColor = vec4(col, soft * vAlpha * uFade);
          }`,
      }),
    [],
  )
}

function useRidgeMaterial(layer: (typeof LAYERS)[number]) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uHalf: { value: new THREE.Vector2(4, 2.5) },
          uFill: { value: 0 },
          uShift: { value: 0 },
          uAmp: { value: layer.amp },
          uLayer: { value: layer.layer },
          uZ: { value: layer.z },
          uColor: { value: new THREE.Color() },
          uColorDeep: { value: new THREE.Color() },
          uShade: { value: layer.shade },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          uniform vec2 uHalf;
          uniform float uFill, uShift, uAmp, uLayer, uZ;
          varying float vTop;
          varying vec3 vWorld;
          ${RIDGE_GLSL}
          void main(){
            float x = position.x * uHalf.x * 2.6;
            float top = ridgeTop(x, uLayer, uHalf, uAmp);
            float bottom = -uHalf.y * 1.6;
            float y = mix(bottom, top, uv.y);
            y -= (1.0 - uFill) * uHalf.y * 1.1;
            y += uShift;
            vTop = uv.y;
            vec3 p = vec3(x, y, uZ);
            vWorld = p;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor, uColorDeep;
          uniform float uShade, uFill, uTime;
          varying float vTop;
          varying vec3 vWorld;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          void main(){
            float grain = hash(floor(gl_FragCoord.xy)) - 0.5;
            float ripple = sin(vWorld.x * 6.0 + vWorld.y * 18.0 + sin(vWorld.x * 1.7) * 2.0) * 0.5 + 0.5;
            vec3 col = mix(uColorDeep * 0.35, uColor, pow(vTop, 2.2));
            col *= mix(0.92, 1.08, ripple * vTop);
            col += grain * 0.07;
            float rim = smoothstep(0.93, 1.0, vTop);
            col += vec3(1.0, 0.72, 0.4) * rim * 0.25;
            col *= uShade;
            float alpha = smoothstep(0.0, 0.25, vTop) * uFill;
            gl_FragColor = vec4(col, alpha);
          }`,
      }),
    [layer],
  )
}

function Ridge({ layer }: { layer: (typeof LAYERS)[number] }) {
  const mat = useRidgeMaterial(layer)
  const mesh = useRef<THREE.Mesh>(null)
  useFrame((st) => {
    const sec = scene.sections.story
    const fill = smoothstep(0.3 + layer.delay, 0.8 + layer.delay * 0.5, sec.progress)
    const u = mat.uniforms
    const vis = fill > 0.001 && sec.exit < 1
    if (mesh.current) mesh.current.visible = vis
    if (!vis) return
    u.uFill.value = fill
    u.uShift.value = sec.exit * bottleRuntime.halfH * 2
    u.uHalf.value.set(bottleRuntime.halfW, bottleRuntime.halfH)
    u.uAmp.value = layer.amp * (scene.isMobile ? 0.72 : 1)
    u.uColor.value.copy(bottleRuntime.powder)
    u.uColorDeep.value.copy(bottleRuntime.powderDeep)
    u.uTime.value = st.clock.elapsedTime
  })
  return (
    <mesh ref={mesh} material={mat} frustumCulled={false} renderOrder={-2}>
      <planeGeometry args={[1, 1, 180, 1]} />
    </mesh>
  )
}

export function PowderBurst({ count }: { count: number }) {
  const mat = usePowderMaterial()
  const points = useRef<THREE.Points>(null)
  const size = useThree((s) => s.size)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const dpr = useThree((s) => s.viewport.dpr)

  const geometry = useMemo(() => {
    const rnd = seeded(2024)
    const g = new THREE.BufferGeometry()
    const seeds = new Float32Array(count * 4)
    const emit = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      seeds[i * 4] = rnd()
      seeds[i * 4 + 1] = rnd()
      seeds[i * 4 + 2] = rnd()
      seeds[i * 4 + 3] = rnd()
      emit[i] = Math.pow(rnd(), 0.9)
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
    g.setAttribute('aEmit', new THREE.BufferAttribute(emit, 1))
    return g
  }, [count])

  useFrame((st) => {
    const sec = scene.sections.story
    const vis = sec.progress > 0.19 && sec.exit < 1 && sec.enter > 0.5
    if (points.current) points.current.visible = vis
    if (!vis) return
    const u = mat.uniforms
    u.uProgress.value = sec.progress
    // freeze the emitter once the jar stops pouring so landed grains stay put
    if (sec.progress < 0.68) {
      u.uOrigin.value.copy(bottleRuntime.mouth)
      u.uDir.value.copy(bottleRuntime.axis).normalize()
    }
    u.uShift.value = sec.exit * bottleRuntime.halfH * 2
    u.uHalf.value.set(bottleRuntime.halfW, bottleRuntime.halfH)
    u.uColor.value.copy(bottleRuntime.powder)
    u.uColorDeep.value.copy(bottleRuntime.powderDeep)
    u.uTime.value = st.clock.elapsedTime
    u.uMobile.value = scene.isMobile ? 1 : 0
    u.uScale.value = (size.height * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
  })

  return (
    <>
      {LAYERS.map((l) => (
        <Ridge key={l.layer} layer={l} />
      ))}
      <points ref={points} geometry={geometry} material={mat} frustumCulled={false} renderOrder={3} />
    </>
  )
}
