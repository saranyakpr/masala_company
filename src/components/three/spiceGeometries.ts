import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { SpiceKind } from '../../data/products'
import { noise3, seeded } from '../../lib/math'

/**
 * Procedural whole-spice geometry & materials. Everything is generated once
 * and cached — the same assets are shared by the floating garnish around the
 * jar and the macro ingredient showcase.
 */

/** Lathe a radius profile r(t) along +Y, then bend it along X with a curve. */
function bentLathe(
  length: number,
  radius: (t: number) => number,
  bend: number,
  segments = 48,
  radial = 28,
  surface?: (t: number, angle: number) => number,
) {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    pts.push(new THREE.Vector2(Math.max(0.0001, radius(t)), t * length))
  }
  const geo = new THREE.LatheGeometry(pts, radial)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const t = v.y / length
    if (surface) {
      const angle = Math.atan2(v.z, v.x)
      const k = 1 + surface(t, angle)
      v.x *= k
      v.z *= k
    }
    v.x += bend * t * t * length
    v.y -= length / 2
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

function chilliGeometry() {
  const body = bentLathe(
    1.5,
    (t) => {
      // fat shoulder near the stem, long taper to a curled tip
      const shoulder = Math.sin(Math.min(1, t * 6) * Math.PI * 0.5)
      return 0.13 * shoulder * Math.pow(1 - t, 0.75) + 0.004
    },
    0.32,
    64,
    32,
    (t, a) => 0.05 * noise3(t * 9, Math.cos(a) * 2, Math.sin(a) * 2) + 0.03 * Math.sin(a * 3 + t * 6),
  )
  body.rotateZ(Math.PI)
  return body
}

function chilliStemGeometry() {
  const stem = bentLathe(0.34, (t) => (t < 0.25 ? 0.07 * (1 - t * 2.4) + 0.03 : 0.028), -0.35, 12, 10)
  stem.translate(0, 0.9, 0)
  return stem
}

function turmericGeometry() {
  const rnd = seeded(11)
  const knots = [0.18, 0.36, 0.55, 0.74, 0.9].map((k) => k + (rnd() - 0.5) * 0.05)
  return bentLathe(
    1.1,
    (t) => {
      let r = 0.1 + 0.015 * Math.sin(t * 7)
      for (const k of knots) r += 0.014 * Math.exp(-Math.pow((t - k) * 40, 2))
      const ends = Math.min(1, Math.sin(Math.min(1, t * 9) * Math.PI * 0.5), Math.sin(Math.min(1, (1 - t) * 6) * Math.PI * 0.5))
      return r * (0.35 + 0.65 * ends)
    },
    0.22,
    72,
    24,
    (t, a) => 0.08 * noise3(t * 6, Math.cos(a) * 1.5, Math.sin(a) * 1.5),
  )
}

function corianderGeometry() {
  const geo = new THREE.SphereGeometry(0.075, 28, 20)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const a = Math.atan2(v.z, v.x)
    const ridge = 1 + 0.06 * Math.pow(Math.abs(Math.sin(a * 5)), 0.5) - 0.03
    v.x *= ridge
    v.z *= ridge
    v.y *= 1.06
    // little nub at the top
    if (v.y > 0.07) v.y += 0.008
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

function pepperGeometry() {
  const geo = new THREE.IcosahedronGeometry(0.07, 4)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = noise3(v.x * 60, v.y * 60, v.z * 60) * 0.5 + noise3(v.x * 130, v.y * 130, v.z * 130) * 0.25
    v.multiplyScalar(1 + n * 0.12)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

function cinnamonGeometry() {
  // A rolled quill: spiral strip extruded along its length.
  const shape = new THREE.Shape()
  const turns = 2.3
  const steps = 90
  const outer: THREE.Vector2[] = []
  const inner: THREE.Vector2[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * Math.PI * 2 * turns
    const r = 0.13 - t * 0.07
    outer.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r))
    inner.push(new THREE.Vector2(Math.cos(a) * (r - 0.014), Math.sin(a) * (r - 0.014)))
  }
  shape.moveTo(outer[0].x, outer[0].y)
  outer.forEach((p) => shape.lineTo(p.x, p.y))
  inner.reverse().forEach((p) => shape.lineTo(p.x, p.y))
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 1.5,
    steps: 30,
    bevelEnabled: false,
    curveSegments: 4,
  })
  geo.translate(0, 0, -0.75)
  geo.rotateX(Math.PI / 2)
  // bark roughness
  const pos = geo.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = noise3(v.x * 20, v.y * 4, v.z * 20) * 0.006
    pos.setXYZ(i, v.x + n, v.y, v.z + n)
  }
  geo.computeVertexNormals()
  return geo
}

function cardamomGeometry() {
  return bentLathe(
    0.46,
    (t) => 0.11 * Math.pow(Math.sin(t * Math.PI), 0.7) + 0.004,
    0.05,
    40,
    36,
    (t, a) => 0.11 * Math.cos(a * 3) * Math.sin(t * Math.PI) + 0.03 * noise3(t * 8, a, 1),
  )
}

function ridgedSeed(length: number, radius: number, bend: number, ridges: number) {
  const g = bentLathe(
    length,
    (t) => radius * Math.pow(Math.sin(t * Math.PI), 0.75) + 0.002,
    bend,
    24,
    24,
    (t, a) => 0.14 * Math.pow(Math.abs(Math.cos(a * ridges * 0.5)), 2) * Math.sin(t * Math.PI) - 0.05,
  )
  return g
}

function mustardGeometry() {
  const geo = new THREE.IcosahedronGeometry(0.034, 3)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    v.multiplyScalar(1 + noise3(v.x * 90, v.y * 90, v.z * 90) * 0.05)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

function fenugreekGeometry() {
  // small, blocky, rounded-rectangular seed with a groove
  const geo = new THREE.BoxGeometry(0.07, 0.048, 0.036, 6, 6, 6)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  const n = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    n.copy(v).normalize().multiplyScalar(0.04)
    v.lerp(n.multiply(new THREE.Vector3(1.0, 0.68, 0.5)), 0.45)
    if (v.z > 0 && Math.abs(v.x + 0.008) < 0.006) v.z -= 0.004
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

function cloveStemGeometry() {
  return bentLathe(0.5, (t) => 0.026 - t * 0.008 + 0.002 * Math.sin(t * 30), 0.06, 20, 12)
}

function cloveHeadGeometry() {
  const parts: THREE.BufferGeometry[] = []
  const bud = new THREE.SphereGeometry(0.048, 16, 12)
  bud.translate(0, 0.3, 0)
  parts.push(bud)
  for (let i = 0; i < 4; i++) {
    const sepal = new THREE.ConeGeometry(0.022, 0.08, 8)
    sepal.translate(0, 0.04, 0)
    sepal.rotateZ(0.55)
    sepal.rotateY((i / 4) * Math.PI * 2)
    sepal.translate(0, 0.245, 0)
    parts.push(sepal)
  }
  const merged = mergeGeometries(parts.map((p) => p.toNonIndexed()))!
  merged.computeVertexNormals()
  return merged
}

function gingerGeometry() {
  const knobs = [0.2, 0.45, 0.7]
  const main = bentLathe(
    0.85,
    (t) => {
      let r = 0.12 + 0.02 * Math.sin(t * 9)
      for (const k of knobs) r += 0.03 * Math.exp(-Math.pow((t - k) * 18, 2))
      const ends = Math.min(1, Math.sin(Math.min(1, t * 6) * Math.PI * 0.5), Math.sin(Math.min(1, (1 - t) * 5) * Math.PI * 0.5))
      return r * (0.4 + 0.6 * ends)
    },
    0.1,
    56,
    24,
    (t, a) => 0.12 * noise3(t * 7, Math.cos(a) * 2, Math.sin(a) * 2),
  )
  const branch = bentLathe(
    0.42,
    (t) => 0.085 * Math.min(1, Math.sin(Math.min(1, t * 5) * Math.PI * 0.5), Math.sin(Math.min(1, (1 - t) * 4) * Math.PI * 0.5)) + 0.01,
    0.2,
    32,
    20,
    (t, a) => 0.12 * noise3(t * 6 + 4, Math.cos(a) * 2, Math.sin(a) * 2),
  )
  branch.rotateZ(-0.9)
  branch.translate(0.16, 0.05, 0.02)
  const merged = mergeGeometries([main.toNonIndexed(), branch.toNonIndexed()])!
  merged.computeVertexNormals()
  return merged
}

export interface SpiceAsset {
  parts: { geometry: THREE.BufferGeometry; material: THREE.Material }[]
  /** Scale used when the spice floats around the jar. */
  floatScale: number
}

let cache: Record<SpiceKind, SpiceAsset> | null = null

export function getSpiceAssets(): Record<SpiceKind, SpiceAsset> {
  if (cache) return cache
  const std = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p)
  cache = {
    chilli: {
      floatScale: 0.85,
      parts: [
        {
          geometry: chilliGeometry(),
          material: std({ color: '#a3170c', roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.25, sheen: 0.4, sheenColor: new THREE.Color('#ff5a2a') }),
        },
        { geometry: chilliStemGeometry(), material: std({ color: '#7b7a2c', roughness: 0.7 }) },
      ],
    },
    turmeric: {
      floatScale: 0.95,
      parts: [{ geometry: turmericGeometry(), material: std({ color: '#b8742b', roughness: 0.78, sheen: 0.6, sheenColor: new THREE.Color('#ffb347') }) }],
    },
    coriander: {
      floatScale: 1.5,
      parts: [{ geometry: corianderGeometry(), material: std({ color: '#9c7f48', roughness: 0.8 }) }],
    },
    pepper: {
      floatScale: 2.2,
      parts: [{ geometry: pepperGeometry(), material: std({ color: '#2a211a', roughness: 0.85, clearcoat: 0.2 }) }],
    },
    cinnamon: {
      floatScale: 0.6,
      parts: [{ geometry: cinnamonGeometry(), material: std({ color: '#7a3d1b', roughness: 0.85, side: THREE.DoubleSide }) }],
    },
    cardamom: {
      floatScale: 1.05,
      parts: [{ geometry: cardamomGeometry(), material: std({ color: '#5f7a2e', roughness: 0.65, sheen: 0.3, sheenColor: new THREE.Color('#b8d080') }) }],
    },
    cumin: {
      floatScale: 2.4,
      parts: [{ geometry: ridgedSeed(0.22, 0.034, 0.18, 9), material: std({ color: '#7a5a32', roughness: 0.8 }) }],
    },
    fennel: {
      floatScale: 2.2,
      parts: [{ geometry: ridgedSeed(0.25, 0.046, 0.12, 10), material: std({ color: '#8f9a52', roughness: 0.75, sheen: 0.3, sheenColor: new THREE.Color('#d8e0a0') }) }],
    },
    mustard: {
      floatScale: 3,
      parts: [{ geometry: mustardGeometry(), material: std({ color: '#3b1d12', roughness: 0.45, clearcoat: 0.5 }) }],
    },
    fenugreek: {
      floatScale: 2.8,
      parts: [{ geometry: fenugreekGeometry(), material: std({ color: '#c4943a', roughness: 0.6 }) }],
    },
    clove: {
      floatScale: 1.5,
      parts: [
        { geometry: cloveStemGeometry(), material: std({ color: '#4a2414', roughness: 0.85 }) },
        { geometry: cloveHeadGeometry(), material: std({ color: '#5a2c18', roughness: 0.8 }) },
      ],
    },
    ginger: {
      floatScale: 0.9,
      parts: [{ geometry: gingerGeometry(), material: std({ color: '#c9ad78', roughness: 0.9, sheen: 0.4, sheenColor: new THREE.Color('#f0dcaa') }) }],
    },
  }
  return cache as Record<SpiceKind, SpiceAsset>
}
