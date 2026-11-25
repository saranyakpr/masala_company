import * as THREE from 'three';
import { displaceGeometry, fbm } from '../utils/noise';

/**
 * Procedural spice geometries. Each factory is memoised so the (relatively costly)
 * noise displacement runs once per session, then geometries are shared by all scenes.
 */
const cache = new Map<string, THREE.BufferGeometry>();
function memo(key: string, build: () => THREE.BufferGeometry) {
  let g = cache.get(key);
  if (!g) {
    g = build();
    cache.set(key, g);
  }
  return g;
}

/** Wrinkled dried peppercorn. */
export const peppercornGeometry = () =>
  memo('peppercorn', () => displaceGeometry(new THREE.IcosahedronGeometry(0.1, 4), 0.014, 26, 3, 3));

/** Coriander seed — small ribbed sphere. */
export const corianderGeometry = () =>
  memo('coriander', () => {
    const g = new THREE.SphereGeometry(0.075, 36, 24);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const phi = Math.atan2(v.z, v.x);
      const rib = 1 + Math.pow(Math.abs(Math.cos(phi * 5)), 8) * 0.06;
      v.multiplyScalar(rib);
      v.y *= 1.05;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  });

/** Green cardamom pod — tapered, three-ridged ellipsoid. */
export const cardamomGeometry = () =>
  memo('cardamom', () => {
    const g = new THREE.SphereGeometry(1, 48, 32);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const phi = Math.atan2(v.z, v.x);
      const ridge = 1 + Math.cos(phi * 3) * 0.08;
      const taper = 1 - Math.pow(Math.abs(v.y), 3) * 0.35;
      const r = 0.11 * ridge * taper;
      const wrinkle = 1 + fbm(v.x * 6, v.y * 10, v.z * 6, 2) * 0.05;
      p.setXYZ(i, v.x * r * wrinkle, v.y * 0.21 + (v.y > 0.92 ? (v.y - 0.92) * 0.25 : 0), v.z * r * wrinkle);
    }
    g.computeVertexNormals();
    return g;
  });

/** One star-anise carpel (boat-shaped). Eight are arranged radially. */
export const aniseCarpelGeometry = () =>
  memo('anise-carpel', () => {
    const g = new THREE.SphereGeometry(1, 32, 16);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      // boat: long in x, flat in y, pinched at the outer tip
      const tip = THREE.MathUtils.clamp((v.x + 1) / 2, 0, 1);
      const pinch = 1 - Math.pow(tip, 2.2) * 0.75;
      const top = v.y > 0 ? 0.55 : 1; // open seam on top
      p.setXYZ(i, v.x * 0.19 + 0.17, v.y * 0.06 * pinch * top, v.z * 0.075 * pinch);
    }
    g.computeVertexNormals();
    return displaceGeometry(g, 0.006, 30, 2, 5);
  });

/** Dried chilli — lathe profile bent along an arc. */
export const chilliGeometry = () =>
  memo('chilli', () => {
    const pts: THREE.Vector2[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r = 0.085 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.55 + 0.45)), 0.9) * (1 - Math.pow(t, 2.4)) + 0.002;
      pts.push(new THREE.Vector2(Math.max(0.002, r), -t * 1.25));
    }
    const g = new THREE.LatheGeometry(pts, 32);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      // wrinkles
      const w = 1 + fbm(v.x * 18, v.y * 6, v.z * 18, 2) * 0.12;
      v.x *= w;
      v.z *= w;
      // bend the centre line along an arc; cross-section follows the arc normal
      const t = -v.y;
      const radius = 1.5;
      const a = t / radius;
      const cx = radius - Math.cos(a) * radius;
      const cy = -Math.sin(a) * radius;
      p.setXYZ(i, cx + v.x * Math.cos(a), cy + v.x * Math.sin(a), v.z);
    }
    g.computeVertexNormals();
    return g;
  });

/** Rolled cinnamon quill — open cylinder shell with bark noise. */
export const cinnamonGeometry = (inner = false) =>
  memo(`cinnamon-${inner}`, () => {
    const r = inner ? 0.07 : 0.085;
    const g = new THREE.CylinderGeometry(r, r, 1.05, 64, 30, true, 0, Math.PI * (inner ? 1.5 : 1.75));
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = 1 + fbm(v.x * 40, v.y * 6, v.z * 40, 2) * 0.05 + Math.sin(v.y * 60) * 0.008;
      p.setXYZ(i, v.x * n, v.y, v.z * n);
    }
    g.computeVertexNormals();
    return g;
  });

/** Turmeric finger — capsule with ring ridges and gentle bend. */
export const turmericRootGeometry = () =>
  memo('turmeric-root', () => {
    const g = new THREE.CapsuleGeometry(0.08, 0.6, 12, 32);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const ring = 1 + Math.pow(Math.abs(Math.sin(v.y * 22)), 12) * 0.12 + fbm(v.x * 20, v.y * 8, v.z * 20, 2) * 0.08;
      const taper = 1 - Math.max(0, v.y) * 0.35;
      v.x *= ring * taper;
      v.z *= ring * taper;
      v.x += Math.sin(v.y * 3) * 0.06;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  });

/** Heap of ground spice. `peak` controls height; surface is granular. */
export const moundGeometry = (radius = 1, peak = 0.55, seed = 1) =>
  memo(`mound-${radius}-${peak}-${seed}`, () => {
    const pts: THREE.Vector2[] = [];
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; // 0 at peak → 1 at rim
      const r = t * radius;
      const y = peak * Math.pow(1 - t * t, 1.35);
      pts.push(new THREE.Vector2(r, y));
    }
    // Lathe expects the profile bottom → top for outward-facing normals.
    pts.reverse();
    const g = new THREE.LatheGeometry(pts, 72);
    return displaceGeometry(g, 0.025 * radius, 5 / radius, 4, seed);
  });

/** Hand-beaten brass bowl (lathe). */
export const bowlGeometry = () =>
  memo('bowl', () => {
    const profile = [
      [0.0, 0.0], [0.5, 0.0], [0.56, 0.03], [0.58, 0.07], [0.64, 0.1],
      [0.92, 0.3], [1.14, 0.55], [1.26, 0.74], [1.3, 0.79], [1.29, 0.82],
      [1.24, 0.8], [1.2, 0.75], [1.08, 0.56], [0.86, 0.33], [0.55, 0.17], [0.0, 0.13],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(profile, 96);
    // hammered facets
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const r = Math.hypot(v.x, v.z);
      if (r > 0.6) {
        const d = 1 + fbm(v.x * 9, v.y * 9, v.z * 9, 2) * 0.006;
        p.setXYZ(i, v.x * d, v.y, v.z * d);
      }
    }
    g.computeVertexNormals();
    return g;
  });
