import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { products, type SpiceKind } from '../../data/products'
import { damp, seeded } from '../../lib/math'
import { productStore } from '../../lib/productStore'
import { scene } from '../../lib/scene'
import { bottleRuntime } from './runtime'
import { getSpiceAssets } from './spiceGeometries'

/**
 * Whole spices orbiting the jar — chillies for Chilli Powder, quills and
 * pods for Garam Masala, etc. They follow the jar, scatter outward when the
 * powder takes the stage, and swap with a quick shrink/grow when the
 * product changes.
 */

interface Slot {
  angle: number
  radius: number
  y: number
  z: number
  spin: THREE.Vector3
  phase: number
  scale: number
}

export function FloatingSpices({ count }: { count: number }) {
  const assets = useMemo(() => getSpiceAssets(), [])
  const [garnish, setGarnish] = useState<SpiceKind[]>(products[productStore.get()].garnish)
  const group = useRef<THREE.Group>(null)
  const items = useRef<(THREE.Group | null)[]>([])
  const appear = useRef({ v: 1 })

  const slots = useMemo<Slot[]>(() => {
    const rnd = seeded(5)
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? 1 : -1
      return {
        angle: (i / count) * Math.PI * 2 + rnd() * 0.4,
        radius: 1.25 + rnd() * 0.75,
        y: -1.3 + (i / count) * 2.6 + (rnd() - 0.5) * 0.4,
        z: (rnd() - 0.5) * 1.4 * side,
        spin: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.8),
        phase: rnd() * Math.PI * 2,
        scale: 0.75 + rnd() * 0.45,
      }
    })
  }, [count])

  useEffect(
    () =>
      productStore.subscribe(() => {
        const next = products[productStore.get()].garnish
        gsap.to(appear.current, {
          v: 0,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => {
            setGarnish(next)
            gsap.to(appear.current, { v: 1, duration: 0.9, ease: 'back.out(1.6)', delay: 0.15 })
          },
        })
      }),
    [],
  )

  useFrame((st, dt) => {
    const g = group.current
    if (!g) return
    const t = st.clock.elapsedTime
    const scatter = bottleRuntime.scatter
    const sec = scene.sections
    const showWeight = Math.min(1, scene.intro * 1.2) * (1 - sec.food.enter * 1.5 + sec.final.enter)
    g.visible = bottleRuntime.visible && showWeight > 0.02
    if (!g.visible) return
    g.position.x = damp(g.position.x, bottleRuntime.position.x, 6, dt)
    g.position.y = damp(g.position.y, bottleRuntime.position.y, 6, dt)
    g.scale.setScalar(bottleRuntime.scale)

    const motion = scene.reducedMotion ? 0.15 : 1
    items.current.forEach((it, i) => {
      if (!it) return
      const sl = slots[i]
      const a = sl.angle + t * 0.12 * motion
      const r = sl.radius * (1 + scatter * 1.6)
      it.position.set(
        Math.cos(a) * r,
        sl.y + Math.sin(t * 0.8 + sl.phase) * 0.12 * motion + scatter * sl.y * 0.6,
        sl.z + Math.sin(a) * 0.6,
      )
      it.rotation.x += sl.spin.x * dt * motion
      it.rotation.y += sl.spin.y * dt * motion
      it.rotation.z += sl.spin.z * dt * motion
      const kind = garnish[i % garnish.length]
      const s = sl.scale * assets[kind].floatScale * appear.current.v * (1 - scatter) * Math.max(0, Math.min(1, showWeight))
      it.scale.setScalar(Math.max(0.0001, s))
    })
  })

  return (
    <group ref={group}>
      {slots.map((sl, i) => {
        const kind = garnish[i % garnish.length]
        return (
          <group
            key={i}
            ref={(el) => {
              items.current[i] = el
            }}
            rotation={[sl.phase, sl.phase * 2, sl.phase * 0.5]}
          >
            {assets[kind].parts.map((p, j) => (
              <mesh key={`${kind}-${j}`} geometry={p.geometry} material={p.material} />
            ))}
          </group>
        )
      })}
    </group>
  )
}
