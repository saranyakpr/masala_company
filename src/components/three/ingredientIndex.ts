import { ingredients } from '../../data/ingredients'
import { clamp, smoothstep } from '../../lib/math'
import { scene } from '../../lib/scene'

/** Continuous carousel index (0 … 5) with a gentle "snap" between items. */
export function ingredientIndex() {
  const n = ingredients.length
  const x = clamp(scene.sections.ingredients.progress * n - 0.5, 0, n - 1)
  const base = Math.floor(x)
  return base + smoothstep(0.35, 0.75, x - base)
}
