import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ingredients } from '../../data/ingredients'
import type { SpiceKind } from '../../data/products'
import { damp, seeded, smoothstep } from '../../lib/math'
import { ingredientIndex } from './ingredientIndex'
import { scene } from '../../lib/scene'
import { bottleRuntime } from './runtime'
import { getSpiceAssets } from './spiceGeometries'

/**
 * Section 5 — macro close-ups of whole spices. A vertical 3D carousel driven
 * by the sticky scroll: the active spice sits centre-stage, rotating slowly,
 * the next one rises from below.
 */

interface Placement {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

function composition(kind: SpiceKind): Placement[] {
  const rnd = seeded(kind.length * 17)
  switch (kind) {
    case 'chilli':
      return [
        { position: [-0.35, 0.05, 0], rotation: [0.2, 0.3, 0.5], scale: 1.25 },
        { position: [0.25, -0.1, 0.3], rotation: [-0.3, 1.2, -0.4], scale: 1.15 },
        { position: [0.1, 0.25, -0.4], rotation: [0.6, 2.4, 0.15], scale: 1.05 },
      ]
    case 'turmeric':
      return [
        { position: [-0.2, 0, 0], rotation: [0.2, 0, 1.1], scale: 1.5 },
        { position: [0.25, 0.15, -0.3], rotation: [-0.4, 1, -0.9], scale: 1.3 },
        { position: [0.1, -0.35, 0.35], rotation: [1.2, 0.5, 0.3], scale: 1.2 },
        { position: [-0.15, 0.45, -0.1], rotation: [0.3, 2, -0.2], scale: 1.1 },
      ]
    case 'cinnamon':
      return [
        { position: [-0.18, 0, 0], rotation: [0.15, 0, 0.6], scale: 1.4 },
        { position: [0.15, 0.05, 0.15], rotation: [-0.1, 0.8, 0.45], scale: 1.35 },
        { position: [0, -0.1, -0.2], rotation: [0.2, 1.7, 0.75], scale: 1.3 },
      ]
    case 'cardamom':
      return Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2
        const r = 0.55 + rnd() * 0.25
        return {
          position: [Math.cos(a) * r, (rnd() - 0.5) * 0.6, Math.sin(a) * r] as [number, number, number],
          rotation: [rnd() * 3, rnd() * 3, rnd() * 3] as [number, number, number],
          scale: 1.6 + rnd() * 0.4,
        }
      })
    default:
      return Array.from({ length: 110 }, () => {
        // a loose, slowly orbiting galaxy of seeds
        const a = rnd() * Math.PI * 2
        const r = Math.pow(rnd(), 0.6) * 1.25
        return {
          position: [Math.cos(a) * r, (rnd() - 0.5) * 0.7 * (1.2 - r), Math.sin(a) * r] as [number, number, number],
          rotation: [rnd() * 6, rnd() * 6, rnd() * 6] as [number, number, number],
          scale: (kind === 'pepper' ? 1.15 : 1.0) * (0.8 + rnd() * 0.4),
        }
      })
  }
}

function InstancedSeeds({ kind, placements }: { kind: SpiceKind; placements: Placement[] }) {
  const asset = getSpiceAssets()[kind]
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    placements.forEach((p, i) => {
      q.setFromEuler(e.set(...p.rotation))
      m.compose(new THREE.Vector3(...p.position), q, new THREE.Vector3(p.scale, p.scale, p.scale))
      ref.current?.setMatrixAt(i, m)
    })
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true
  }, [placements])
  return <instancedMesh ref={ref} args={[asset.parts[0].geometry, asset.parts[0].material, placements.length]} />
}

function Composition({ kind }: { kind: SpiceKind }) {
  const placements = useMemo(() => composition(kind), [kind])
  const asset = getSpiceAssets()[kind]
  if (placements.length > 20 && asset.parts.length === 1) return <InstancedSeeds kind={kind} placements={placements} />
  return (
    <>
      {placements.map((p, i) => (
        <group key={i} position={p.position} rotation={p.rotation} scale={p.scale}>
          {asset.parts.map((part, j) => (
            <mesh key={j} geometry={part.geometry} material={part.material} />
          ))}
        </group>
      ))}
    </>
  )
}

export function IngredientStage() {
  const root = useRef<THREE.Group>(null)
  const items = useRef<(THREE.Group | null)[]>([])
  const light = useRef<THREE.PointLight>(null)
  const idx = useRef(0)

  useFrame((st, dt) => {
    const sec = scene.sections.ingredients
    const g = root.current
    if (!g) return
    const vis = sec.enter > 0.001 && sec.exit < 0.999
    g.visible = vis
    if (light.current) light.current.intensity = vis ? 18 : 0
    if (!vis) return
    const { halfW: W, halfH: H } = bottleRuntime
    const mobile = scene.isMobile
    // scroll-locked with the sticky section
    const shift = -(1 - sec.enter) * H * 2 + sec.exit * H * 2
    g.position.set(mobile ? 0 : W * 0.3, (mobile ? H * 0.32 : 0) + shift, 0)
    g.scale.setScalar(mobile ? 0.62 : 1)
    g.rotation.x = scene.pointer.y * 0.15
    g.rotation.y = scene.pointer.x * 0.25

    idx.current = damp(idx.current, ingredientIndex(), 8, dt)
    const t = st.clock.elapsedTime
    const motion = scene.reducedMotion ? 0.2 : 1
    items.current.forEach((it, i) => {
      if (!it) return
      const d = i - idx.current
      const ad = Math.abs(d)
      it.visible = ad < 1.2
      if (!it.visible) return
      const s = 1 - smoothstep(0, 0.9, ad)
      it.scale.setScalar(Math.max(0.0001, s))
      it.position.set(0, -d * 2.4, -ad * 1.5)
      it.rotation.y = t * 0.35 * motion + d * 2.2
      it.rotation.x = Math.sin(t * 0.4 + i) * 0.2 * motion + d * 0.8
    })
  })

  return (
    <group ref={root}>
      <pointLight ref={light} position={[-2, 1.5, 3]} color="#ffb070" intensity={0} distance={10} />
      {ingredients.map((ing, i) => (
        <group
          key={ing.kind}
          ref={(el) => {
            items.current[i] = el
          }}
        >
          <Composition kind={ing.kind} />
        </group>
      ))}
    </group>
  )
}
