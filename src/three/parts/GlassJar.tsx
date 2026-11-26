import { useMemo } from 'react';
import * as THREE from 'three';
import { additive } from '../utils/additive';

/* Shared glass materials and soft shadow texture for the 3D jars. */

/** Reflection-only glass: black diffuse + additive blending = clear glass that shows env reflections and fresnel rims. */
export function useGlassMaterials() {
  return useMemo(() => {
    const reflect = new THREE.MeshPhysicalMaterial({
      color: '#000000',
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 3.4,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const tint = new THREE.MeshStandardMaterial({
      color: '#fff1dc',
      roughness: 0.1,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    });
    // the lid has nothing behind it but the dark backdrop, so give its glass a faint warm body
    const lidTint = new THREE.MeshPhysicalMaterial({
      color: '#f6dfb8',
      roughness: 0.12,
      metalness: 0,
      clearcoat: 1,
      envMapIntensity: 1.6,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    const base = new THREE.MeshStandardMaterial({ color: '#f1dcc0', roughness: 0.15, metalness: 0, transparent: true, opacity: 0.32, depthWrite: false });
    const gold = new THREE.MeshStandardMaterial({ color: '#d2a24a', metalness: 1, roughness: 0.24, envMapIntensity: 1.5 });
    // fresnel rim light: bright glass edges at glancing angles, like the edges in the product photos
    const rim = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color('#ffe6bf') }, uPower: { value: 2.4 }, uIntensity: { value: 0.75 } },
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec3 vV;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uPower; uniform float uIntensity;
        varying vec3 vN; varying vec3 vV;
        void main() {
          float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
          gl_FragColor = vec4(uColor * f * uIntensity, 1.0);
        }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    additive(reflect);
    additive(rim);
    return { reflect, tint, lidTint, base, gold, rim };
  }, []);
}

/** Soft radial blob texture for floor shadows under floating objects. */
export function useBlobShadowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(10,3,2,0.85)');
    g.addColorStop(0.45, 'rgba(10,3,2,0.4)');
    g.addColorStop(1, 'rgba(10,3,2,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}
