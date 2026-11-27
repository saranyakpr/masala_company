import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { productById, type Product } from '../../data/products'
import { seeded } from '../../lib/math'
import { applyProductToJar, BOTTOM, CAP_TOP, createBottleMaterials, getBottleGeometry, LABEL_Y, type JarMaterials } from './jarParts'
import { getSpiceAssets } from './spiceGeometries'

/**
 * Product "photography" studio.
 *
 * One offscreen WebGL renderer photographs the real 3D jar for every product
 * (three angles each) with its own whole spices and a heap of its powder in
 * front — so catalogue images always match the 3D identity and need no
 * downloads. Shots are rendered lazily, one per idle slice, and cached.
 */

import type { ShotAngle } from './studio'
export const SHOT_W = 720
export const SHOT_H = 900

const ANGLES: { spin: number; camY: number; camX: number; dist: number }[] = [
  { spin: 0.14, camY: 0.55, camX: 0, dist: 7.6 }, // front
  { spin: -0.78, camY: 1.35, camX: 0.9, dist: 7.2 }, // three-quarter, slightly above
  { spin: Math.PI + 0.12, camY: 0.45, camX: -0.3, dist: 7.6 }, // back label
]

interface Studio {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  jar: THREE.Group
  mats: JarMaterials
  props: THREE.Group
  heap: THREE.Mesh
  heapMat: THREE.MeshStandardMaterial
}

let studio: Studio | null = null
let failed = false

function buildStudio(): Studio | null {
  if (failed) return null
  if (studio) return studio
  try {
    const canvas = document.createElement('canvas')
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(1)
    renderer.setSize(SHOT_W, SHOT_H, false)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.55

    const camera = new THREE.PerspectiveCamera(30, SHOT_W / SHOT_H, 0.1, 50)

    // studio lights: warm key, orange + gold rims
    const key = new THREE.SpotLight('#ffe6c8', 120, 0, 0.5, 0.9, 1.4)
    key.position.set(2.5, 6, 5)
    scene.add(key, key.target)
    const rimL = new THREE.PointLight('#ff6a1a', 22, 14, 1.4)
    rimL.position.set(-3, 1.2, -2.2)
    const rimR = new THREE.PointLight('#ffbe5c', 18, 14, 1.4)
    rimR.position.set(3.2, 2.2, -2)
    scene.add(rimL, rimR, new THREE.AmbientLight('#ffe2c2', 0.35))

    const geo = getBottleGeometry()
    const mats = createBottleMaterials(productById('chilli')!)
    const jar = new THREE.Group()
    const add = (g: THREE.BufferGeometry, m: THREE.Material, y = 0) => {
      const mesh = new THREE.Mesh(g, m)
      mesh.position.y = y
      jar.add(mesh)
      return mesh
    }
    add(geo.powder, mats.powder)
    add(geo.label, mats.label, LABEL_Y)
    add(geo.body, mats.glass).renderOrder = 2
    add(geo.cap, mats.cap)
    add(geo.capBottom, mats.cap)
    add(geo.goldRing, mats.gold)
    add(geo.sifter, mats.sifter)
    const lid = new THREE.Group()
    lid.position.set(0, CAP_TOP, -0.6)
    lid.add(new THREE.Mesh(geo.lid, mats.cap), new THREE.Mesh(geo.thumb, mats.cap))
    jar.add(lid)
    scene.add(jar)

    // soft contact shadow
    const sc = document.createElement('canvas')
    sc.width = sc.height = 128
    const sctx = sc.getContext('2d')!
    const g = sctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,0.75)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    sctx.fillStyle = g
    sctx.fillRect(0, 0, 128, 128)
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 2.2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }),
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = BOTTOM + 0.005
    scene.add(shadow)

    // a heap of the spice in front of the jar
    const heapMat = new THREE.MeshStandardMaterial({ roughness: 1, bumpScale: 3 })
    const heapGeo = new THREE.SphereGeometry(0.62, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2)
    heapGeo.scale(1, 0.42, 1)
    const heap = new THREE.Mesh(heapGeo, heapMat)
    heap.position.set(0.15, BOTTOM, 1.05)
    scene.add(heap)

    const props = new THREE.Group()
    scene.add(props)

    studio = { renderer, scene, camera, jar, mats, props, heap, heapMat }
    return studio
  } catch (e) {
    console.warn('[studio] WebGL unavailable', e)
    failed = true
    return null
  }
}

function dressSet(s: Studio, product: Product) {
  s.props.clear()
  const assets = getSpiceAssets()
  const rnd = seeded(product.id.length * 97 + product.name.charCodeAt(0))
  const kinds = product.garnish
  const whole = product.form !== 'powder'
  const count = whole ? 22 : 9
  for (let i = 0; i < count; i++) {
    const kind = kinds[i % kinds.length]
    const asset = assets[kind]
    const g = new THREE.Group()
    asset.parts.forEach((p) => g.add(new THREE.Mesh(p.geometry, p.material)))
    // spread on the "table" around the jar's front, a couple leaning on it
    const a = -Math.PI * 0.15 + rnd() * Math.PI * 1.3
    const r = 0.85 + rnd() * (whole ? 0.75 : 0.9)
    g.position.set(Math.cos(a) * r * 1.25, BOTTOM + 0.05 + rnd() * 0.05, Math.sin(a) * r * 0.9 + 0.35)
    g.rotation.set(Math.PI / 2 + (rnd() - 0.5) * 0.6, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.8)
    g.scale.setScalar(asset.floatScale * (whole ? 0.75 : 0.8) * (0.85 + rnd() * 0.3))
    s.props.add(g)
  }
  // powder heap for powders; whole spices use a heap of their own seeds
  s.heap.visible = true
  s.heapMat.color.set(product.powder)
  s.heapMat.map = s.mats.fills[product.form]
  s.heapMat.bumpMap = s.mats.fills[product.form]
  s.heapMat.needsUpdate = true
  s.heap.scale.setScalar(whole ? 0.75 : 1)
}

const cache = new Map<string, string>()
const pending = new Map<string, Promise<string>>()
let chain: Promise<unknown> = Promise.resolve()
let lastProduct = ''

function idle() {
  return new Promise<void>((res) => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    if (ric) ric(() => res(), { timeout: 400 })
    else setTimeout(res, 16)
  })
}

async function shoot(product: Product, angle: ShotAngle): Promise<string> {
  await document.fonts.ready
  await idle()
  const s = buildStudio()
  if (!s) throw new Error('webgl')
  if (lastProduct !== product.id) {
    applyProductToJar(s.mats, product)
    s.mats.powder.color.set(product.powder)
    dressSet(s, product)
    lastProduct = product.id
  }
  const a = ANGLES[angle]
  s.jar.rotation.set(0, a.spin, 0)
  s.props.rotation.y = 0
  s.camera.position.set(a.camX, a.camY, a.dist)
  s.camera.lookAt(0, -0.18, 0)
  s.renderer.render(s.scene, s.camera)
  return s.renderer.domElement.toDataURL('image/webp', 0.9)
}

export function requestShot(productId: string, angle: ShotAngle = 0): Promise<string> {
  const key = `${productId}:${angle}`
  const hit = cache.get(key)
  if (hit) return Promise.resolve(hit)
  const inflight = pending.get(key)
  if (inflight) return inflight
  const product = productById(productId)
  if (!product) return Promise.reject(new Error('unknown product'))
  // serialise renders so the shared studio is never used concurrently
  const job = chain.then(() => shoot(product, angle))
  chain = job.catch(() => undefined)
  const p = job.then((url) => {
    cache.set(key, url)
    pending.delete(key)
    return url
  })
  pending.set(key, p)
  return p
}

