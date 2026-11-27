export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    return !!gl
  } catch {
    return false
  }
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isMobileViewport() {
  return window.matchMedia('(max-width: 767px)').matches
}

export function isTouchDevice() {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches
}

/** Rough low-power heuristic: few cores, little memory, or data-saver. */
export function isLowPower() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const cores = nav.hardwareConcurrency ?? 8
  const mem = nav.deviceMemory ?? 8
  return cores <= 4 || mem <= 4 || !!nav.connection?.saveData
}
