import * as THREE from 'three';

/**
 * Additive "light" blending that leaves the canvas alpha untouched.
 *
 * Our canvases are transparent so CSS backdrops show through. Three's AdditiveBlending also
 * accumulates alpha, which turns glass and glows into opaque dark patches over the backdrop.
 * This adds colour (weighted by the fragment's alpha) and keeps the destination alpha.
 */
export function additive<T extends THREE.Material>(m: T): T {
  m.blending = THREE.CustomBlending;
  m.blendEquation = THREE.AddEquation;
  m.blendSrc = THREE.SrcAlphaFactor;
  m.blendDst = THREE.OneFactor;
  m.blendEquationAlpha = THREE.AddEquation;
  m.blendSrcAlpha = THREE.ZeroFactor;
  m.blendDstAlpha = THREE.OneFactor;
  m.transparent = true;
  m.depthWrite = false;
  return m;
}
