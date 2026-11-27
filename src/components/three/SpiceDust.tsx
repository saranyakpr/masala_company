import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { seeded } from '../../lib/math'
import { scene } from '../../lib/scene'
import { glowBlending } from './blending'
import { bottleRuntime } from './runtime'

/**
 * Ambient glowing spice motes. Fully GPU-animated (one uniform per frame),
 * tinted by the current product colour.
 */
const EMBER = new THREE.Color('#ff7a2a')

export function SpiceDust({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null)
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)

  const material = useMemo(
    () =>
      glowBlending(new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uColor: { value: new THREE.Color('#ff8a3a') },
          uGold: { value: new THREE.Color('#ffcf7a') },
          uHalf: { value: new THREE.Vector2(4, 2.5) },
          uScale: { value: 1000 },
          uSpeed: { value: 1 },
        },
        vertexShader: /* glsl */ `
          attribute vec4 aSeed;
          uniform float uTime, uScale, uSpeed;
          uniform vec2 uHalf;
          varying float vTw;
          varying float vGold;
          void main(){
            float t = uTime * uSpeed;
            vec3 p;
            p.x = (aSeed.x * 2.0 - 1.0) * uHalf.x * 1.25 + sin(t * 0.3 + aSeed.y * 20.0) * 0.25;
            float rise = fract(aSeed.y + t * (0.012 + aSeed.w * 0.02));
            p.y = (rise * 2.0 - 1.0) * uHalf.y * 1.3;
            p.z = mix(-4.0, 2.5, aSeed.z);
            p.x += sin(t * 0.5 + rise * 6.28 + aSeed.w * 10.0) * 0.15;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float size = mix(0.012, 0.05, pow(aSeed.w, 3.0));
            gl_PointSize = size * uScale / -mv.z;
            vTw = (0.55 + 0.45 * sin(t * (1.0 + aSeed.x * 3.0) + aSeed.z * 50.0)) * smoothstep(0.0, 0.15, rise) * smoothstep(1.0, 0.8, rise);
            vGold = step(0.6, aSeed.x);
          }`,
        fragmentShader: /* glsl */ `
          uniform float uOpacity;
          uniform vec3 uColor, uGold;
          varying float vTw;
          varying float vGold;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            a = a * a;
            vec3 col = mix(uColor, uGold, vGold);
            gl_FragColor = vec4(col * a * vTw * uOpacity, 1.0);
          }`,
      })),
    [],
  )

  const geometry = useMemo(() => {
    const rnd = seeded(99)
    const g = new THREE.BufferGeometry()
    const seeds = new Float32Array(count * 4)
    for (let i = 0; i < seeds.length; i++) seeds[i] = rnd()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
    return g
  }, [count])

  const tmp = useMemo(() => new THREE.Color(), [])

  useFrame((st) => {
    const s = scene.sections
    // visible over the jar's scenes, the ingredients stage and the finale
    const top = scene.mode === 'home' ? 1 - s.food.enter : 0
    const ing = s.ingredients.enter * (1 - s.ingredients.exit)
    const fin = s.final.enter * (1 - s.contact.enter * 0.6)
    const w = Math.max(top, ing, fin) * (0.35 + 0.65 * scene.intro)
    if (points.current) points.current.visible = w > 0.01
    if (w <= 0.01) return
    const u = material.uniforms
    u.uTime.value = st.clock.elapsedTime
    u.uOpacity.value = w * 1.4
    u.uHalf.value.set(bottleRuntime.halfW, bottleRuntime.halfH)
    u.uScale.value = (size.height * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(17.5)))
    u.uSpeed.value = scene.reducedMotion ? 0.2 : 1
    tmp.copy(bottleRuntime.powder).lerp(EMBER, 0.35)
    u.uColor.value.copy(tmp)
    if (points.current) {
      points.current.position.x = -scene.pointer.x * 0.25
      points.current.position.y = -scene.pointer.y * 0.15
    }
  })

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
}
