import * as THREE from 'three'
import type { Product, ProductForm } from '../../data/products'
import { seeded } from '../../lib/math'
import { glowBlending } from './blending'
import { createGrainTexture, createLabelTextures } from './labelTexture'

/**
 * The 12 SPICES jar — one shared identity for every scene: the home scroll
 * film, the product viewers and the studio "photography" renderer.
 */

export const LABEL_R = 0.618
export const LABEL_H = 1.425
export const LABEL_Y = -0.03
export const CAP_BASE = 1.0
export const CAP_TOP = 1.3
export const BOTTOM = -1.25

function bodyProfile(scale = 1, top = 1.08) {
  const p: [number, number][] = [
    [0.0, BOTTOM],
    [0.5, BOTTOM],
    [0.585, -1.235],
    [0.625, -1.2],
    [0.64, -1.13],
    [0.643, -1.0],
    [0.642, -0.86],
    [0.628, -0.8],
    [0.612, -0.76],
    [0.612, 0.7],
    [0.628, 0.74],
    [0.642, 0.79],
    [0.643, 0.86],
    [0.628, 0.93],
    [0.595, 0.975],
    [0.565, 1.0],
    [0.565, top],
  ]
  return p.map(([r, y]) => new THREE.Vector2(r * scale, y))
}

export function createBottleGeometry() {
  const body = new THREE.LatheGeometry(bodyProfile(), 96)

  // fill: slightly inset, rising to a soft mound under the shoulder
  const fill = bodyProfile(0.965, 0.9).filter((v) => v.y < 0.86)
  fill.push(new THREE.Vector2(0.55, 0.88), new THREE.Vector2(0.3, 0.93), new THREE.Vector2(0.0, 0.95))
  const powder = new THREE.LatheGeometry(fill, 64)

  const label = new THREE.CylinderGeometry(LABEL_R, LABEL_R, LABEL_H, 128, 1, true, -Math.PI, Math.PI * 2)

  // ribbed cap collar
  const cap = new THREE.CylinderGeometry(0.605, 0.615, CAP_TOP - CAP_BASE, 144, 6, true)
  const pos = cap.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const a = Math.atan2(v.z, v.x)
    const mid = 1 - Math.pow(Math.abs(v.y) / ((CAP_TOP - CAP_BASE) / 2), 6)
    const rib = 1 + 0.012 * Math.max(0, Math.sin(a * 60)) * mid
    pos.setXYZ(i, v.x * rib, v.y, v.z * rib)
  }
  cap.computeVertexNormals()
  cap.translate(0, (CAP_BASE + CAP_TOP) / 2, 0)

  const capBottom = new THREE.RingGeometry(0.56, 0.615, 64)
  capBottom.rotateX(Math.PI / 2)
  capBottom.translate(0, CAP_BASE, 0)

  const sifter = new THREE.CircleGeometry(0.6, 64)
  sifter.rotateX(-Math.PI / 2)
  sifter.translate(0, CAP_TOP - 0.004, 0)

  // flip lid (pivot at the back edge)
  const lidShape = new THREE.Shape()
  lidShape.absarc(0, 0, 0.625, 0, Math.PI * 2, false)
  const lid = new THREE.ExtrudeGeometry(lidShape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 4,
    curveSegments: 72,
  })
  lid.rotateX(-Math.PI / 2)
  lid.translate(0, 0.025, 0.6)

  const thumb = new THREE.BoxGeometry(0.22, 0.05, 0.08)
  thumb.translate(0, 0.04, 1.23)

  const goldRing = new THREE.TorusGeometry(0.612, 0.012, 12, 128)
  goldRing.rotateX(Math.PI / 2)
  goldRing.translate(0, CAP_BASE + 0.01, 0)

  return { body, powder, label, cap, capBottom, sifter, lid, thumb, goldRing }
}

let sharedGeometry: ReturnType<typeof createBottleGeometry> | null = null
/** Geometry is identical everywhere, so it is built once and shared. */
export function getBottleGeometry() {
  if (!sharedGeometry) sharedGeometry = createBottleGeometry()
  return sharedGeometry
}

function createSifterTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#121212'
  ctx.fillRect(0, 0, 512, 512)
  ctx.strokeStyle = '#2a2a2a'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(256, 20)
  ctx.lineTo(256, 492)
  ctx.stroke()
  // shaker holes on one half, open pour slot on the other
  ctx.fillStyle = '#e06a2a'
  for (let r = 0; r < 4; r++) {
    const count = 3 + r * 2
    const rad = 45 + r * 50
    for (let k = 0; k < count; k++) {
      const a = Math.PI * 0.5 + ((k + 0.5) / count) * Math.PI
      ctx.beginPath()
      ctx.arc(256 + Math.cos(a) * rad, 256 + Math.sin(a) * rad, 11, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.beginPath()
  ctx.ellipse(370, 256, 60, 150, 0, 0, Math.PI * 2)
  ctx.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Packed seeds / whole spices seen through the glass. */
function createSeedTexture(kind: 'seeds' | 'whole', size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#3a3a3a'
  ctx.fillRect(0, 0, size, size)
  const rnd = seeded(kind === 'seeds' ? 77 : 91)
  const n = kind === 'seeds' ? 2600 : 520
  for (let i = 0; i < n; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const rx = kind === 'seeds' ? 5 + rnd() * 5 : 12 + rnd() * 16
    const ry = kind === 'seeds' ? 2 + rnd() * 2.5 : 5 + rnd() * 8
    const v = Math.round(150 + rnd() * 105)
    const g = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.3, 0, x, y, rx)
    g.addColorStop(0, `rgb(${v + 20},${v + 20},${v + 20})`)
    g.addColorStop(1, `rgb(${v - 70},${v - 70},${v - 70})`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, rnd() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(kind === 'seeds' ? 3 : 2, kind === 'seeds' ? 3 : 2)
  return tex
}

export interface JarMaterials {
  glass: THREE.MeshPhysicalMaterial
  powder: THREE.MeshStandardMaterial
  label: THREE.MeshPhysicalMaterial
  cap: THREE.MeshPhysicalMaterial
  sifter: THREE.MeshStandardMaterial
  gold: THREE.MeshStandardMaterial
  labelTextures: ReturnType<typeof createLabelTextures>
  fills: Record<ProductForm, THREE.Texture>
  sifterTex: THREE.Texture
  dispose: () => void
}

export function createBottleMaterials(product: Product): JarMaterials {
  const labelTextures = createLabelTextures(product)
  const fills: Record<ProductForm, THREE.Texture> = {
    powder: createGrainTexture(),
    seeds: createSeedTexture('seeds'),
    whole: createSeedTexture('whole'),
  }
  const sifterTex = createSifterTexture()

  // Additive "clear PET": black albedo, only reflections/fresnel are added.
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#000000',
    roughness: 0.04,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 2.6,
    side: THREE.FrontSide,
  })
  glowBlending(glass, THREE.SrcAlphaFactor)
  const powder = new THREE.MeshStandardMaterial({
    color: product.powder,
    map: fills[product.form],
    bumpMap: fills[product.form],
    bumpScale: product.form === 'powder' ? 2.5 : 6,
    roughness: product.form === 'powder' ? 1 : 0.75,
    metalness: 0,
  })
  const label = new THREE.MeshPhysicalMaterial({
    map: labelTextures.map,
    metalnessMap: labelTextures.metalnessMap,
    metalness: 1,
    roughness: 0.34,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.4,
  })
  const cap = new THREE.MeshPhysicalMaterial({
    color: '#0b0b0b',
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.2,
  })
  const sifter = new THREE.MeshStandardMaterial({ map: sifterTex, roughness: 0.5 })
  const gold = new THREE.MeshStandardMaterial({ color: '#d4a24c', metalness: 1, roughness: 0.25 })
  return {
    glass,
    powder,
    label,
    cap,
    sifter,
    gold,
    labelTextures,
    fills,
    sifterTex,
    dispose() {
      labelTextures.dispose()
      Object.values(fills).forEach((t) => t.dispose())
      sifterTex.dispose()
      ;[glass, powder, label, cap, sifter, gold].forEach((m) => m.dispose())
    },
  }
}

/** Repaint the label and swap the fill texture (powder / seeds / whole). Colour is left to the caller. */
export function applyProductToJar(mats: JarMaterials, product: Product) {
  mats.labelTextures.repaint(product)
  const fill = mats.fills[product.form]
  if (mats.powder.map !== fill) {
    mats.powder.map = fill
    mats.powder.bumpMap = fill
    mats.powder.bumpScale = product.form === 'powder' ? 2.5 : 6
    mats.powder.roughness = product.form === 'powder' ? 1 : 0.75
    mats.powder.needsUpdate = true
  }
}

