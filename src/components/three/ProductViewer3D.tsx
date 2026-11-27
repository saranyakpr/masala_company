import { Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Product } from '../../data/products'
import { seeded } from '../../lib/math'
import { scene as globalScene } from '../../lib/scene'
import { BottleMeshes } from './BottleMeshes'
import { applyProductToJar, createBottleMaterials, getBottleGeometry } from './jarParts'
import { getSpiceAssets } from './spiceGeometries'

/**
 * Interactive product presentation: the same 12 SPICES jar, draggable,
 * with its whole spices orbiting and a puff of its powder whenever the
 * product changes. Used on Our Spices, Our Blend and product pages.
 */

function Jar({ product }: { product: Product }) {
  const geo = getBottleGeometry()
  const [mats] = useState(() => createBottleMaterials(product))
  const spin = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const extra = useRef({ v: 0 })
  const target = useRef(new THREE.Color(product.powder))
  const first = useRef(true)

  useEffect(() => () => mats.dispose(), [mats])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    let swapped = false
    const e = extra.current
    gsap.killTweensOf(e)
    const end = Math.ceil((e.v + 0.01) / (Math.PI * 2)) * Math.PI * 2 + Math.PI * 2
    const tw = gsap.to(e, {
      v: end,
      duration: globalScene.reducedMotion ? 0.01 : 1.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        if (!swapped && tw.progress() > 0.42) {
          swapped = true
          applyProductToJar(mats, product)
          target.current.set(product.powder)
        }
      },
      onComplete: () => {
        if (!swapped) {
          applyProductToJar(mats, product)
          target.current.set(product.powder)
        }
      },
    })
    return () => {
      tw.kill()
    }
  }, [product, mats])

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime
    if (spin.current) spin.current.rotation.y = extra.current.v + Math.sin(t * 0.5) * 0.25
    if (root.current) root.current.position.y = Math.sin(t * 0.9) * 0.04
    mats.powder.color.lerp(target.current, 1 - Math.exp(-6 * dt))
  })

  return (
    <group ref={root}>
      <BottleMeshes geo={geo} mats={mats} spinRef={spin} />
    </group>
  )
}

function Garnish({ product }: { product: Product }) {
  const assets = getSpiceAssets()
  const group = useRef<THREE.Group>(null)
  const items = useMemo(() => {
    const rnd = seeded(product.id.length * 31)
    return Array.from({ length: 10 }, (_, i) => ({
      kind: product.garnish[i % product.garnish.length],
      angle: (i / 10) * Math.PI * 2 + rnd() * 0.4,
      radius: 1.35 + rnd() * 0.55,
      y: -1.2 + (i / 10) * 2.5 + (rnd() - 0.5) * 0.3,
      spin: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5),
      scale: 0.75 + rnd() * 0.4,
      phase: rnd() * 6,
    }))
  }, [product])
  const refs = useRef<(THREE.Group | null)[]>([])
  const appear = useRef({ v: 0 })

  useEffect(() => {
    appear.current.v = 0
    gsap.to(appear.current, { v: 1, duration: 1, delay: 0.55, ease: 'back.out(1.6)' })
  }, [product])

  useFrame((st, dt) => {
    const t = st.clock.elapsedTime
    const m = globalScene.reducedMotion ? 0.15 : 1
    items.forEach((it, i) => {
      const g = refs.current[i]
      if (!g) return
      const a = it.angle + t * 0.14 * m
      g.position.set(Math.cos(a) * it.radius, it.y + Math.sin(t * 0.8 + it.phase) * 0.1 * m, Math.sin(a) * it.radius * 0.7)
      g.rotation.x += it.spin.x * dt * m
      g.rotation.y += it.spin.y * dt * m
      g.scale.setScalar(Math.max(0.0001, assets[it.kind].floatScale * it.scale * appear.current.v))
    })
  })

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <group
          key={`${product.id}-${i}`}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          {assets[it.kind].parts.map((p, j) => (
            <mesh key={j} geometry={p.geometry} material={p.material} />
          ))}
        </group>
      ))}
    </group>
  )
}

/** A puff of the new product's powder bursting from the jar on change. */
function Puff({ product }: { product: Product }) {
  const COUNT = 1400
  const start = useRef(-10)
  const clock = useThree((s) => s.clock)
  const size = useThree((s) => s.size)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uT: { value: 10 }, uColor: { value: new THREE.Color() }, uScale: { value: 800 } },
        vertexShader: /* glsl */ `
          attribute vec4 aSeed;
          uniform float uT, uScale;
          varying float vA;
          varying float vS;
          void main(){
            float t = max(uT - aSeed.w * 0.25, 0.0);
            float k = 1.8;
            float e = (1.0 - exp(-k * t)) / k;
            vec3 dir = normalize(aSeed.xyz - 0.5 + vec3(0.0, 0.35, 0.0));
            vec3 p = vec3(0.0, 1.35, 0.0) + dir * (2.2 + aSeed.x * 1.8) * e;
            p.y -= 1.4 * (t - e) / k;
            p.x += sin(t * 2.0 + aSeed.y * 30.0) * 0.08 * t;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            vA = step(0.0, uT - aSeed.w * 0.25) * (1.0 - smoothstep(1.0, 2.6, t));
            vS = aSeed.z;
            gl_PointSize = vA < 0.01 ? 0.0 : mix(0.018, 0.04, aSeed.y) * uScale / -mv.z;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying float vA;
          varying float vS;
          void main(){
            vec2 c = gl_PointCoord - 0.5;
            float r2 = dot(c, c) * 4.0;
            if (r2 > 1.0) discard;
            float shade = 0.5 + 0.8 * max(dot(vec3(c * 2.0, sqrt(1.0 - r2)), normalize(vec3(-0.4, 0.7, 0.6))), 0.0);
            gl_FragColor = vec4(uColor * shade * mix(0.7, 1.1, vS), vA);
          }`,
      }),
    [],
  )
  const geometry = useMemo(() => {
    const rnd = seeded(5)
    const g = new THREE.BufferGeometry()
    const seeds = new Float32Array(COUNT * 4)
    for (let i = 0; i < seeds.length; i++) seeds[i] = rnd()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
    return g
  }, [])
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (globalScene.reducedMotion) return
    start.current = clock.elapsedTime + 0.35
    material.uniforms.uColor.value.set(product.powder)
  }, [product, clock, material])

  useFrame((st) => {
    material.uniforms.uT.value = st.clock.elapsedTime - start.current
    material.uniforms.uScale.value = (size.height * st.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(15)))
  })

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />
}

function PauseWhenHidden({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const setFrameloop = useThree((s) => s.setFrameloop)
  useEffect(() => {
    const el = target.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setFrameloop(e.isIntersecting ? 'always' : 'never'))
    io.observe(el)
    return () => io.disconnect()
  }, [target, setFrameloop])
  return null
}

export default function ProductViewer3D({ product, className = '' }: { product: Product; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  return (
    <div ref={wrap} className={className || "relative"} data-cursor="Drag">
      <Canvas
        dpr={[1, Math.min(2, window.devicePixelRatio || 1)]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 30, position: [0, 0.4, 8.6] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.setClearColor(0x000000, 0)
        }}
      >
        <PauseWhenHidden target={wrap} />
        <ambientLight intensity={0.3} color="#ffe2c2" />
        <spotLight position={[2, 7, 6]} angle={0.45} penumbra={0.9} intensity={220} decay={1.6} color="#ffe6c8" />
        <pointLight position={[-3.2, 1.2, -2.2]} intensity={30} decay={1.4} distance={14} color="#ff6a1a" />
        <pointLight position={[3.4, 2.2, -2]} intensity={26} decay={1.4} distance={14} color="#ffbe5c" />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={3.2} color="#fff1dc" position={[-4, 1.5, 3]} rotation-y={Math.PI / 3} scale={[1.2, 6, 1]} />
          <Lightformer form="rect" intensity={2.4} color="#ffd29a" position={[4, 1, 2.5]} rotation-y={-Math.PI / 3} scale={[0.8, 6, 1]} />
          <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[6, 2, 1]} />
          <Lightformer form="ring" intensity={2.2} color="#ff7a2a" position={[0, 0, -6]} scale={4} />
        </Environment>
        <Jar product={product} />
        <Garnish product={product} />
        <Puff product={product} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.32}
          maxPolarAngle={Math.PI * 0.62}
          rotateSpeed={0.6}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  )
}
