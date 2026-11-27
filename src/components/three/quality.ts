export interface SceneQuality {
  dust: number
  powder: number
  garnish: number
  reflection: boolean
  maxDpr: number
  hero: { grains: number; dust: number; fragments: number; puffs: number }
}

export function qualityFor(mobile: boolean, lowPower: boolean): SceneQuality {
  if (lowPower) return { dust: 350, powder: 2600, garnish: 6, reflection: false, maxDpr: 1.25, hero: { grains: 2600, dust: 1800, fragments: 160, puffs: 70 } }
  if (mobile) return { dust: 500, powder: 4200, garnish: 8, reflection: false, maxDpr: 1.6, hero: { grains: 4000, dust: 2600, fragments: 240, puffs: 95 } }
  return { dust: 1400, powder: 10000, garnish: 12, reflection: true, maxDpr: 2, hero: { grains: 9000, dust: 6000, fragments: 600, puffs: 170 } }
}
