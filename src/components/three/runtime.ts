import * as THREE from 'three'
import { products, DEFAULT_PRODUCT_INDEX } from '../../data/products'

/**
 * Per-frame values the jar publishes for its satellites (powder burst,
 * floating spices, dust). Mutated in useFrame — never triggers renders.
 */
export const bottleRuntime = {
  position: new THREE.Vector3(),
  scale: 1,
  /** World position of the sifter opening. */
  mouth: new THREE.Vector3(0, 1.3, 0),
  /** World direction the jar's top points to. */
  axis: new THREE.Vector3(0, 1, 0),
  visible: true,
  /** 0 → 1, how much the floating garnish should scatter away (story phase). */
  scatter: 0,
  powder: new THREE.Color(products[DEFAULT_PRODUCT_INDEX].powder),
  powderDeep: new THREE.Color(products[DEFAULT_PRODUCT_INDEX].powderDeep),
  /** World units for half the visible viewport at z = 0. */
  halfW: 4,
  halfH: 2.5,
  /** World units per CSS pixel at z = 0. */
  worldPerPx: 0.006,
}
