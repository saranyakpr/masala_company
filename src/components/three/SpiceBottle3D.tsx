import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { products } from '../../data/products'
import { clamp, damp, easeInOut, easeOut, lerp, range } from '../../lib/math'
import { productStore } from '../../lib/productStore'
import { pastTop, scene } from '../../lib/scene'
import { glowBlending } from './blending'
import { heroDirector } from './heroDirector'
import { BottleMeshes } from './BottleMeshes'
import { applyProductToJar, CAP_TOP, createBottleMaterials, getBottleGeometry } from './jarParts'
import { bottleRuntime } from './runtime'

function useBottleGeometry() {
  return getBottleGeometry()
}

function useBottleMaterials() {
  const mats = useMemo(() => createBottleMaterials(products[productStore.get()]), [])
  useEffect(() => () => mats.dispose(), [mats])
  return mats
}

/* ------------------------------------------------------------------ */
/* Poses                                                               */
/* ------------------------------------------------------------------ */

interface Pose {
  x: number
  y: number
  z: number
  rx: number
  rz: number
  s: number
  cap: number
}
const P = (x: number, y: number, rz: number, s: number, cap: number, rx = 0.06, z = 0): Pose => ({ x, y, z, rx, rz, s, cap })

function mix(a: Pose, b: Pose, t: number, out: Pose) {
  out.x = lerp(a.x, b.x, t)
  out.y = lerp(a.y, b.y, t)
  out.z = lerp(a.z, b.z, t)
  out.rx = lerp(a.rx, b.rx, t)
  out.rz = lerp(a.rz, b.rz, t)
  out.s = lerp(a.s, b.s, t)
  out.cap = lerp(a.cap, b.cap, t)
  return out
}

/** Story keyframes: open → tilt → pour → upright → close. */
function storyKeys(W: number, H: number, mobile: boolean): [number, Pose][] {
  if (mobile) {
    return [
      [0, P(0.1 * W, 0.34 * H, -0.1, 0.5, 0)],
      [0.1, P(0.1 * W, 0.34 * H, -0.18, 0.5, 1)],
      [0.22, P(0.4 * W, 0.56 * H, 2.2, 0.44, 1, 0.12)],
      [0.68, P(0.38 * W, 0.58 * H, 2.32, 0.44, 1, 0.12)],
      [0.82, P(0.1 * W, 0.34 * H, 0, 0.5, 1)],
      [0.92, P(0.1 * W, 0.34 * H, 0, 0.5, 0)],
      [1, P(0.1 * W, 0.34 * H, 0, 0.5, 0)],
    ]
  }
  return [
    [0, P(0.5 * W, 0.04 * H, -0.12, 0.8, 0, 0.1)],
    [0.1, P(0.5 * W, 0.06 * H, -0.22, 0.8, 1, 0.1)],
    [0.22, P(0.55 * W, 0.42 * H, 2.15, 0.72, 1, 0.16)],
    [0.68, P(0.5 * W, 0.46 * H, 2.3, 0.72, 1, 0.16)],
    [0.82, P(0.52 * W, 0.08 * H, 0, 0.8, 1)],
    [0.92, P(0.52 * W, 0.08 * H, 0, 0.8, 0)],
    [1, P(0.52 * W, 0.08 * H, 0, 0.8, 0)],
  ]
}

function sampleKeys(keys: [number, Pose][], t: number, out: Pose) {
  if (t <= keys[0][0]) return mix(keys[0][1], keys[0][1], 0, out)
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i]
    const [t1, b] = keys[i + 1]
    if (t <= t1) return mix(a, b, easeInOut((t - t0) / (t1 - t0)), out)
  }
  return mix(keys[keys.length - 1][1], keys[keys.length - 1][1], 0, out)
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const REFLECT = new THREE.Matrix4()
const TMP_V = new THREE.Vector3()
const MOUTH_LOCAL = new THREE.Vector3(0, CAP_TOP + 0.02, 0)
const UP = new THREE.Vector3(0, 1, 0)

export function SpiceBottle3D({ reflection = true }: { reflection?: boolean }) {
  const geo = useBottleGeometry()
  const mats = useBottleMaterials()

  const reflMats = useMemo(() => {
    const clone = <T extends THREE.Material>(m: T) => {
      const c = m.clone() as T
      c.transparent = true
      c.depthWrite = false
      return c
    }
    return {
      glass: clone(mats.glass),
      powder: clone(mats.powder),
      label: clone(mats.label),
      cap: clone(mats.cap),
      sifter: clone(mats.sifter),
      gold: clone(mats.gold),
    }
  }, [mats])

  const root = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const lid = useRef<THREE.Group>(null)
  const reflRoot = useRef<THREE.Group>(null)
  const reflSpin = useRef<THREE.Group>(null)
  const reflLid = useRef<THREE.Group>(null)
  const floor = useRef<THREE.Mesh>(null)

  const state = useRef({
    spinBase: 0,
    spinExtra: { v: 0 },
    pose: P(0, 0, 0, 1, 0),
    a: P(0, 0, 0, 1, 0),
    b: P(0, 0, 0, 1, 0),
    targetPowder: new THREE.Color(),
    smooth: P(0, -4, 0, 0.6, 0),
    first: true,
  })

  const floorMat = useMemo(
    () =>
      glowBlending(new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uOpacity: { value: 0 }, uColor: { value: new THREE.Color('#ff7a2a') } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
        fragmentShader: /* glsl */ `
          uniform float uOpacity; uniform vec3 uColor; varying vec2 vUv;
          void main(){
            float d = length(vUv - 0.5) * 2.0;
            float pool = pow(1.0 - clamp(d, 0.0, 1.0), 2.6);
            float ring = smoothstep(0.34, 0.3, d) * smoothstep(0.24, 0.3, d) * 0.35;
            gl_FragColor = vec4(uColor * (pool * 0.55 + ring), 1.0) * uOpacity;
          }`,
      })),
    [],
  )

  // product changes → cinematic spin, label repaint while it faces away
  useEffect(() => {
    const s = state.current
    s.targetPowder.set(products[productStore.get()].powder)
    let swapped = true
    let pending = productStore.get()
    return productStore.subscribe(() => {
      pending = productStore.get()
      const next = products[pending]
      if (productStore.source() === 'hero') {
        // the hero swaps while the jar is hidden inside the powder cloud — no spin
        gsap.killTweensOf(s.spinExtra)
        swapped = true
        applyProductToJar(mats, next)
        s.targetPowder.set(next.powder)
        mats.powder.color.set(next.powder)
        bottleRuntime.powderDeep.set(next.powderDeep)
        return
      }
      swapped = false
      gsap.killTweensOf(s.spinExtra)
      const start = s.spinExtra.v
      const end = Math.ceil((start + 0.01) / (Math.PI * 2)) * Math.PI * 2 + Math.PI * 2
      const tween = gsap.to(s.spinExtra, {
        v: end,
        duration: scene.reducedMotion ? 0.01 : 1.25,
        ease: 'power3.inOut',
        onUpdate() {
          if (!swapped && tween.progress() > 0.42) {
            swapped = true
            applyProductToJar(mats, products[pending])
            s.targetPowder.set(products[pending].powder)
            bottleRuntime.powderDeep.set(products[pending].powderDeep)
          }
        },
        onComplete() {
          if (!swapped) {
            swapped = true
            applyProductToJar(mats, next)
            s.targetPowder.set(next.powder)
          }
        },
      })
    })
  }, [mats])

  useFrame((st, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20)
    const s = state.current
    const r = root.current
    const sp = spin.current
    if (!r || !sp) return
    const t = st.clock.elapsedTime
    const { halfW: W, halfH: H, worldPerPx } = bottleRuntime
    const mobile = scene.isMobile
    const sec = scene.sections
    const reduced = scene.reducedMotion

    /* ---------- pose composition ---------- */
    const intro = easeOut(scene.intro)
    const hero = mix(
      P(0, mobile ? -0.1 * H : -0.1, 0, mobile ? 0.5 : 0.9, 0, 0.04),
      P(0, mobile ? -0.1 * H : -0.1, 0, mobile ? 0.5 : 0.9, 0, 0.04),
      0,
      s.a,
    )
    hero.y -= (1 - intro) * 3.2
    hero.s *= 0.72 + 0.28 * intro
    hero.rx += (1 - intro) * 0.5
    const heroBaseY = hero.y
    const heroBaseS = hero.s
    // hero banner choreography (hold → open → pour → cloud → emerge)
    const hd = heroDirector.pose
    hero.x += hd.x * W
    hero.y += hd.y * H
    hero.z += hd.z
    hero.rx += hd.rx
    hero.rz += hd.rz + (reduced ? 0 : Math.sin(t * 17) * 0.045 * hd.shake)
    hero.y += reduced ? 0 : Math.sin(t * 17 + 1) * 0.012 * hd.shake
    hero.s *= hd.s
    hero.cap = hd.cap

    const pose = s.pose
    mix(hero, hero, 0, pose)

    const se = easeInOut(sec.story.enter)
    if (se > 0) mix(pose, sampleKeys(storyKeys(W, H, mobile), sec.story.progress, s.b), se, pose)

    const pe = easeInOut(sec.products.enter)
    if (pe > 0) {
      const prod = mobile ? P(0, 0.3 * H, 0, 0.56, 0) : P(-0.42 * W, -0.06 * H, 0, 0.98, 0)
      mix(pose, prod, pe, pose)
    }
    pose.y += Math.max(0, pastTop('products')) * worldPerPx

    // signature blends: the jar crosses to the other side of the screen
    const be = easeInOut(sec.blends.enter)
    if (be > 0) {
      const bl = mobile ? P(0, 0.3 * H, 0, 0.56, 0) : P(0.42 * W, -0.06 * H, 0, 0.98, 0)
      mix(pose, bl, be, pose)
    }
    pose.y += Math.max(0, pastTop('blends')) * worldPerPx

    const fe = sec.final.enter
    let finalW = 0
    if (fe > 0) {
      finalW = 1
      const fin = mobile ? P(0, 0.06 * H, 0, 0.52, 0) : P(0, 0.0, 0, 0.72, 0)
      mix(fin, fin, 0, pose)
      pose.y += pastTop('final') * worldPerPx
      pose.rx += (1 - easeOut(fe)) * 0.4
    }

    // pouring shake
    const pour = range(sec.story.progress, 0.2, 0.25) * (1 - range(sec.story.progress, 0.64, 0.7)) * se * (1 - pe)
    if (!reduced) {
      pose.rz += Math.sin(t * 17) * 0.035 * pour
      pose.y += Math.sin(t * 17 + 1) * 0.015 * pour
    }

    // smooth only the intro-free part: scroll is already smoothed by Lenis
    const sm = s.smooth
    if (s.first) {
      mix(pose, pose, 0, sm)
      s.first = false
    } else {
      const k = 14
      sm.x = damp(sm.x, pose.x, k, dt)
      sm.y = damp(sm.y, pose.y, k, dt)
      sm.z = damp(sm.z, pose.z, k, dt)
      sm.rx = damp(sm.rx, pose.rx, k, dt)
      sm.rz = damp(sm.rz, pose.rz, k, dt)
      sm.s = damp(sm.s, pose.s, k, dt)
      sm.cap = damp(sm.cap, pose.cap, 10, dt)
    }

    // pointer parallax
    const px = scene.pointer.x
    const py = scene.pointer.y
    r.position.set(sm.x + px * 0.06, sm.y + py * 0.04, sm.z)
    r.rotation.set(sm.rx - py * 0.1, 0, sm.rz - px * 0.05 * (1 - Math.max(pour, hd.shake)))
    r.scale.setScalar(sm.s)

    /* ---------- spin ---------- */
    // The label always settles facing camera, with a slow showroom sway
    // (wider on the hero/finale stages). Dragging spins it freely.
    const heroW = (1 - se) * (1 - finalW)
    const swayAmp = reduced ? 0 : lerp(0.6, 0.32, clamp(Math.max(se, pe, be) * (1 - finalW))) * lerp(1, hd.sway, heroW)
    const nearest = Math.round(s.spinBase / (Math.PI * 2)) * Math.PI * 2 + Math.sin(t * 0.5) * swayAmp
    s.spinBase = damp(s.spinBase, nearest, 2.4, dt) + scene.dragVelocity * dt
    scene.dragVelocity = damp(scene.dragVelocity, 0, 3, dt)
    const introSpin = -(1 - intro) * Math.PI * 1.4
    const finalSpin = finalW ? (1 - easeOut(fe)) * Math.PI * 1.5 : 0
    sp.rotation.y = s.spinBase + s.spinExtra.v + introSpin + finalSpin + hd.spin * heroW

    // lid hinge
    if (lid.current) lid.current.rotation.x = -sm.cap * 1.95

    // powder colour
    mats.powder.color.lerp(s.targetPowder, 1 - Math.exp(-6 * dt))
    bottleRuntime.powder.copy(mats.powder.color)

    /* ---------- publish runtime ---------- */
    const visible = sm.y - 1.6 * sm.s < H + 0.4 && sm.y + 1.6 * sm.s > -H - 0.4
    r.visible = visible
    r.updateMatrixWorld()
    bottleRuntime.visible = visible
    bottleRuntime.position.copy(r.position)
    bottleRuntime.scale = sm.s
    bottleRuntime.mouth.copy(sp.localToWorld(TMP_V.copy(MOUTH_LOCAL)))
    bottleRuntime.axis.copy(UP).applyQuaternion(r.quaternion)
    bottleRuntime.scatter = Math.max(clamp(se * 1.4) * (1 - pe), heroDirector.scatter * heroW)

    /* ---------- reflection + light pool ---------- */
    const reflW = visible ? Math.max((1 - se) * intro * (1 - heroDirector.away), finalW * easeOut(fe)) : 0
    // the hero pedestal stays put while the jar travels; the finale's follows the jar
    const floorY = finalW ? sm.y - 1.27 * sm.s : heroBaseY - 1.27 * heroBaseS
    if (floor.current) {
      floor.current.visible = reflW > 0.01
      floor.current.position.set(finalW ? sm.x : 0, floorY, 0)
      floor.current.scale.setScalar(sm.s * 6)
      floorMat.uniforms.uOpacity.value = reflW * (mobile ? 0.6 : 0.9)
    }
    const rr = reflRoot.current
    if (rr) {
      rr.visible = reflection && reflW > 0.01
      if (rr.visible) {
        REFLECT.set(1, 0, 0, 0, 0, -1, 0, 2 * floorY, 0, 0, 1, 0, 0, 0, 0, 1)
        rr.matrix.multiplyMatrices(REFLECT, r.matrixWorld)
        rr.matrixWorldNeedsUpdate = true
        if (reflSpin.current) reflSpin.current.rotation.y = sp.rotation.y
        if (reflLid.current && lid.current) reflLid.current.rotation.x = lid.current.rotation.x
        const o = reflW * 0.16
        reflMats.glass.opacity = o
        reflMats.powder.opacity = o
        reflMats.label.opacity = o * 1.2
        reflMats.cap.opacity = o
        reflMats.sifter.opacity = o
        reflMats.gold.opacity = o
        reflMats.powder.color.copy(mats.powder.color)
      }
    }
  })

  return (
    <>
      <group ref={root}>
        <BottleMeshes geo={geo} mats={mats} spinRef={spin} lidRef={lid} />
      </group>
      <group ref={reflRoot} matrixAutoUpdate={false}>
        <BottleMeshes geo={geo} mats={reflMats} spinRef={reflSpin} lidRef={reflLid} />
      </group>
      <mesh ref={floor} rotation-x={-Math.PI / 2} material={floorMat} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </>
  )
}
