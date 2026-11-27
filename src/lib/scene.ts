/**
 * The scroll "director".
 *
 * A single mutable object that every animation (3D and DOM) reads from.
 * Scroll updates never trigger React renders — consumers read these values
 * inside useFrame / gsap ticks, or subscribe for cheap imperative updates.
 */
export const SECTION_ORDER = [
  'hero',
  'story',
  'products',
  'blends',
  'process',
  'ingredients',
  'why',
  'food',
  'final',
  'contact',
] as const

export type SectionKey = (typeof SECTION_ORDER)[number]

export interface SectionState {
  /** 0 → 1 while the section's top travels from the bottom of the viewport to the top. */
  enter: number
  /** 0 → 1 across the section's own scroll distance (height − viewport). Used by sticky scenes. */
  progress: number
  /** 0 → 1 while the section's bottom travels from the bottom of the viewport to the top. */
  exit: number
  /** Document offset of the section top (px). */
  top: number
  height: number
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

function emptySections() {
  const out = {} as Record<SectionKey, SectionState>
  for (const k of SECTION_ORDER) out[k] = { enter: 0, progress: 0, exit: 0, top: 0, height: 1 }
  out.hero.enter = 1
  return out
}

export const scene = {
  scrollY: 0,
  vh: typeof window !== 'undefined' ? window.innerHeight : 800,
  velocity: 0,
  sections: emptySections(),
  /** Normalised pointer, −1 → 1. */
  pointer: { x: 0, y: 0 },
  /** Intro timeline progress, 0 → 1 (driven by GSAP after the loader). */
  intro: 0,
  /** Extra angular velocity applied by dragging the jar in the showcase. */
  dragVelocity: 0,
  reducedMotion: false,
  isMobile: false,
  isTouch: false,
  /** Which 3D film is mounted: the home jar film, the about-page ingredient stage, or none. */
  mode: 'none' as 'home' | 'about' | 'none',
}

type Listener = () => void
const listeners = new Set<Listener>()

export function subscribeScroll(fn: Listener) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function measureSections() {
  if (typeof document === 'undefined') return
  scene.vh = window.innerHeight
  // sections that are not on the current page sit 'infinitely' far below
  for (const k of SECTION_ORDER) {
    scene.sections[k].top = 1e9
    scene.sections[k].height = 1
  }
  document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => {
    const key = el.dataset.section as SectionKey
    const s = scene.sections[key]
    if (!s) return
    s.top = el.getBoundingClientRect().top + window.scrollY
    s.height = el.offsetHeight
  })
  updateScroll(window.scrollY, scene.velocity)
}

export function updateScroll(y: number, velocity = 0) {
  scene.scrollY = y
  scene.velocity = velocity
  const vh = scene.vh
  for (const k of SECTION_ORDER) {
    const s = scene.sections[k]
    s.enter = clamp01((y - (s.top - vh)) / vh)
    s.progress = clamp01((y - s.top) / Math.max(1, s.height - vh))
    s.exit = clamp01((y - (s.top + s.height - vh)) / vh)
  }
  listeners.forEach((fn) => fn())
}

/** Pixels scrolled past a section's top (negative before it). */
export function pastTop(key: SectionKey) {
  return scene.scrollY - scene.sections[key].top
}
