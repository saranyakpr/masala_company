import * as THREE from 'three'

/**
 * Additive "light" blending that leaves the canvas alpha untouched.
 *
 * The WebGL canvas is transparent and composited over the DOM. Plain
 * AdditiveBlending also writes alpha, which turns glows into dark slabs
 * over the page. Keeping destination alpha means the colour is simply added
 * as light on top of whatever the page shows.
 */
export function glowBlending<T extends THREE.Material>(m: T, srcFactor: THREE.BlendingSrcFactor = THREE.OneFactor): T {
  m.transparent = true
  m.depthWrite = false
  m.blending = THREE.CustomBlending
  m.blendEquation = THREE.AddEquation
  m.blendSrc = srcFactor
  m.blendDst = THREE.OneFactor
  m.blendEquationAlpha = THREE.AddEquation
  m.blendSrcAlpha = THREE.ZeroFactor
  m.blendDstAlpha = THREE.OneFactor
  return m
}
