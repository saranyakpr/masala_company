/**
 * Per-product visual identity for the hero pour/cloud transition.
 * Keyed by product id (see products.ts).
 */
export interface HeroFx {
  /** Larger spice fragments (flakes, seeds, chips) — two tones. */
  fragA: string
  fragB: string
  /** 0–1 share of fine grains rendered (lighter powders → denser clouds). */
  density: number
  /** Gravity multiplier: heavier, coarser powders fall faster and drift less. */
  weight: number
  /** Colour of the hero atmosphere glow behind the jar. */
  atmosphere: string
}

export const heroFx: Record<string, HeroFx> = {
  turmeric: { fragA: '#b86a0c', fragB: '#f2b63c', density: 1, weight: 0.8, atmosphere: '#c98a14' },
  chilli: { fragA: '#8a160a', fragB: '#e6c068', density: 1, weight: 1, atmosphere: '#b8361a' },
  coriander: { fragA: '#6f5e34', fragB: '#b89c5e', density: 0.85, weight: 0.9, atmosphere: '#8a7642' },
  pepper: { fragA: '#191511', fragB: '#5c5249', density: 0.75, weight: 1.25, atmosphere: '#5a4d40' },
  'dry-ginger': { fragA: '#a8894e', fragB: '#e8d6a8', density: 0.95, weight: 0.85, atmosphere: '#b09a62' },
  'garam-masala': { fragA: '#3f2312', fragB: '#8c5a33', density: 0.9, weight: 1.05, atmosphere: '#7a4526' },
  'chicken-masala': { fragA: '#6a220e', fragB: '#b0602e', density: 0.92, weight: 1, atmosphere: '#9c3d1c' },
  'mutton-masala': { fragA: '#4f160a', fragB: '#a0482a', density: 0.9, weight: 1.08, atmosphere: '#86301a' },
  'biryani-masala': { fragA: '#55301a', fragB: '#c88e4c', density: 0.9, weight: 1, atmosphere: '#8f5228' },
  'sambar-masala': { fragA: '#7a2e10', fragB: '#cf8240', density: 0.95, weight: 1, atmosphere: '#a6501f' },
  'rasam-powder': { fragA: '#6e3010', fragB: '#3a2a1c', density: 0.9, weight: 1, atmosphere: '#a85a26' },
}

export const fallbackFx: HeroFx = heroFx.chilli
