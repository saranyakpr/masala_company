import * as THREE from 'three'
import { fallbackFx, heroFx } from '../../data/heroFx'
import { heroLineup, productIndex, products } from '../../data/products'
import { clamp, easeInOut, easeOut, lerp, range } from '../../lib/math'
import { productStore } from '../../lib/productStore'
import { scene } from '../../lib/scene'

/**
 * Hero banner choreography — a time-based cycle that only runs while the
 * visitor is at the top of the page:
 *
 *   HOLD → TURN/OPEN → TILT → POUR → CLOUD (swap behind it) → EMERGE → HOLD …
 *
 * It publishes a pose delta for the jar, camera offsets and the parameters
 * the GPU powder system needs. Everything is plain mutable state read inside
 * useFrame — no React renders.
 */

export const T_HOLD = 3.6
export const T_OPEN = 4.5
export const T_POUR = 5.3 // pour starts (P = 0)
export const P_SWAP = 2.6 // seconds after pour start: cloud peak, product swap
export const P_EMERGED = 4.8 // new jar settled
const T_END = T_POUR + P_EMERGED

export interface FlowPattern {
  name: string
  /** jar pour pose (x in halfW, y in halfH units) */
  jar: { x: number; y: number; rz: number }
  /** wind (world units / s²-ish) */
  wind: [number, number, number]
  swirl: number
  lift: number
  gravity: number
  /** cloud path start/end in (halfW, halfH) units */
  from: [number, number]
  to: [number, number]
  /** 0 = sweep along path, 1 = expand radially from the centre */
  radial: number
}

export const PATTERNS: FlowPattern[] = [
  {
    name: 'drift-left',
    jar: { x: 0.3, y: 0.24, rz: 2.1 },
    wind: [-2.4, -0.15, 0.2],
    swirl: 0,
    lift: 0.25,
    gravity: 1.5,
    from: [1.25, 0.15],
    to: [-1.35, -0.1],
    radial: 0,
  },
  {
    name: 'cascade',
    jar: { x: 0.02, y: 0.46, rz: 2.75 },
    wind: [0.15, 0.2, 0.3],
    swirl: 0,
    lift: 1.3,
    gravity: 3.2,
    from: [0, -1.25],
    to: [0, 1.25],
    radial: 0,
  },
  {
    name: 'drift-right',
    jar: { x: -0.3, y: 0.22, rz: -2.1 },
    wind: [2.4, -0.1, 0.2],
    swirl: 0,
    lift: 0.25,
    gravity: 1.5,
    from: [-1.25, 0.1],
    to: [1.35, -0.12],
    radial: 0,
  },
  {
    name: 'vortex',
    jar: { x: 0.26, y: 0.3, rz: 2.15 },
    wind: [0, 0, 0.3],
    swirl: 1.7,
    lift: 0.3,
    gravity: 1.1,
    from: [0, 0],
    to: [0, 0],
    radial: 1,
  },
  {
    name: 'updraft',
    jar: { x: -0.28, y: 0.04, rz: -1.95 },
    wind: [1.3, 1.7, 0.2],
    swirl: 0.25,
    lift: 1,
    gravity: 1.2,
    from: [-1.2, -1.25],
    to: [1.25, 1.3],
    radial: 0,
  },
]

export const heroDirector = {
  /** Cycle clock (s). */
  t: 0,
  /** Seconds since the latest pour began; < 0 → no transition yet. */
  pourT: -1,
  transitions: 0,
  pattern: PATTERNS[0],
  from: productStore.get(),
  to: productStore.get(),
  requested: null as number | null,
  swapped: true,
  /** Pose delta for the jar (x/y in halfW/halfH units). */
  pose: { x: 0, y: 0, z: 0, rx: 0, rz: 0, s: 1, cap: 0, spin: 0, sway: 1, shake: 0 },
  camera: { x: 0, y: 0, z: 0 },
  /** 0 → 1 while the jar is away from its pedestal (dims reflection). */
  away: 0,
  /** Garnish scatter during the transition. */
  scatter: 0,
  /** Countdown to the next transition, for the UI. */
  holdProgress: 0,
  colorA: new THREE.Color(),
  colorB: new THREE.Color(),
  fx: fallbackFx,
  /** Hero influence: fades as the visitor scrolls into the story. */
  weight: 1,
}

const listeners = new Set<() => void>()
export function onHeroChange(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
const emit = () => listeners.forEach((l) => l())

/** Ask for a specific product (from the hero dots). */
export function requestHeroProduct(i: number) {
  const d = heroDirector
  if (i === productStore.get() && d.t < T_OPEN) return
  if (scene.reducedMotion) {
    productStore.set(i, 'hero')
    return
  }
  d.requested = i
  // start immediately if we are idling
  if (d.t < T_HOLD) d.t = T_HOLD
}

export function isHeroTransitioning() {
  return heroDirector.t >= T_HOLD
}

function canAdvance() {
  return (
    scene.intro > 0.98 &&
    scene.sections.hero.exit < 0.04 &&
    !scene.reducedMotion &&
    (typeof document === 'undefined' || document.visibilityState === 'visible')
  )
}

/** The next powder in the hero lineup (powders pour best). */
function nextInLineup(from: number) {
  const at = heroLineup.indexOf(products[from].id)
  return productIndex(heroLineup[(at + 1) % heroLineup.length])
}

function startPour() {
  const d = heroDirector
  d.from = productStore.get()
  d.to = d.requested ?? nextInLineup(d.from)
  if (d.to === d.from) d.to = nextInLineup(d.from)
  d.pattern = PATTERNS[d.transitions % PATTERNS.length]
  d.transitions++
  d.pourT = 0
  d.swapped = false
  d.colorA.set(products[d.from].powder)
  d.colorB.set(products[d.to].powder)
  d.fx = heroFx[products[d.from].id] ?? fallbackFx
}

/** Advance the choreography. Call once per frame before the jar reads it. */
export function stepHeroDirector(dt: number, elapsed: number) {
  const d = heroDirector
  const prevT = d.t

  if (d.t < T_HOLD) {
    if (canAdvance()) d.t += dt
  } else {
    // once a transition has begun it always completes, even if the visitor scrolls
    d.t += dt
  }
  if (prevT < T_POUR && d.t >= T_POUR) startPour()
  if (d.pourT >= 0) d.pourT += dt
  if (!d.swapped && d.pourT >= P_SWAP) {
    d.swapped = true
    productStore.set(d.to, 'hero')
    if (d.requested === d.to) d.requested = null
    emit()
  }
  if (d.t >= T_END) {
    d.t = 0
    emit()
  }

  d.holdProgress = clamp(d.t / T_HOLD)
  d.weight = 1 - clamp(scene.sections.story.enter * 1.3)

  /* ---------------- jar pose ---------------- */
  const p = d.pose
  const pat = d.pattern
  const t = d.t
  // defaults: hold
  let x = 0
  let y = Math.sin(elapsed * 0.9) * 0.025
  let z = 0
  let rx = Math.sin(elapsed * 0.6) * 0.03
  let rz = Math.sin(elapsed * 0.45) * 0.03
  let s = 1
  let cap = 0
  let spin = 0
  let sway = 1
  let shake = 0

  if (t >= T_HOLD && t < T_OPEN) {
    // rotate to face the camera, lean in, cap opens
    const e = easeInOut(range(t, T_HOLD, T_OPEN))
    sway = 1 - e
    rx = lerp(rx, 0.16, e)
    z = 0.35 * e
    cap = easeOut(range(t, T_HOLD + 0.35, T_OPEN))
  } else if (t >= T_OPEN && t < T_POUR) {
    const e = easeInOut(range(t, T_OPEN, T_POUR))
    sway = 0
    cap = 1
    x = pat.jar.x * e
    y = lerp(y, pat.jar.y, e)
    z = lerp(0.35, 0, e)
    rx = lerp(0.16, 0.1, e)
    rz = pat.jar.rz * e
  } else if (t >= T_POUR && d.pourT < P_SWAP) {
    sway = 0
    cap = 1
    x = pat.jar.x
    y = pat.jar.y
    rz = pat.jar.rz
    rx = 0.1
    shake = range(d.pourT, 0, 0.2) * (1 - range(d.pourT, 1.9, 2.2))
    // retreat into the cloud just before the swap
    const r = easeInOut(range(d.pourT, P_SWAP - 0.9, P_SWAP))
    z = -2.2 * r
    s = 1 - 0.3 * r
  } else if (d.pourT >= P_SWAP && t >= T_POUR) {
    // the next jar emerges from the cloud
    const e = easeOut(range(d.pourT, P_SWAP + 0.15, P_EMERGED))
    x = lerp(-pat.jar.x * 0.4, 0, e)
    y = lerp(-0.2, 0, e) + Math.sin(elapsed * 0.9) * 0.025 * e
    z = lerp(-3, 0, e)
    s = lerp(0.6, 1, e)
    rx = lerp(0.35, 0, e)
    rz = lerp(-Math.sign(pat.jar.rz) * 0.25, 0, e)
    spin = lerp(-Math.PI * 1.25, 0, e)
    sway = e
  }

  p.x = x
  p.y = y
  p.z = z
  p.rx = rx
  p.rz = rz
  p.s = s
  p.cap = cap
  p.spin = spin
  p.sway = sway
  p.shake = shake

  const inTransition = t >= T_OPEN
  d.away = inTransition ? Math.max(range(t, T_OPEN, T_POUR), d.pourT >= P_SWAP ? 1 - range(d.pourT, P_SWAP + 1, P_EMERGED) : 1) : 0
  d.scatter =
    t < T_HOLD ? 0 : d.pourT < 0 || t < T_POUR ? range(t, T_HOLD + 0.4, T_POUR) : d.pourT < P_SWAP ? 1 : 1 - range(d.pourT, P_SWAP + 1, P_EMERGED)

  /* ---------------- camera ---------------- */
  const c = d.camera
  const orbit = Math.sin(elapsed * 0.22) * 0.55
  let cx = orbit
  let cz = -0.35 * Math.sin(elapsed * 0.17) - 0.2
  let cy = 0
  if (t >= T_OPEN && d.pourT < P_SWAP + 0.1) {
    // pull back and lean into the flow
    const e = easeInOut(range(t, T_OPEN, T_POUR + 0.6))
    cx = lerp(orbit, (pat.from[0] + pat.to[0]) * 0.2 + pat.jar.x * 0.6, e)
    cz = lerp(cz, 1.4, e)
    cy = lerp(0, 0.15, e)
  } else if (d.pourT >= P_SWAP && t >= T_POUR) {
    // dolly back in on the new hero
    const e = easeInOut(range(d.pourT, P_SWAP, P_EMERGED))
    cx = lerp((pat.from[0] + pat.to[0]) * 0.2 + pat.jar.x * 0.6, orbit, e)
    cz = lerp(1.4, -0.2, e)
    cy = lerp(0.15, 0, e)
  }
  c.x = cx * d.weight
  c.y = cy * d.weight
  c.z = cz * d.weight
}

// Test hook (development builds only): lets automated checks read the choreography state.
if (import.meta.env.DEV && typeof window !== "undefined") {
  ;(window as unknown as { __hero: typeof heroDirector }).__hero = heroDirector
}
