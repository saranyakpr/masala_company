import { useEffect, useState } from 'react'

/**
 * Lazy front door to the product photo studio (studioCore.ts). The studio
 * pulls in three.js, so it is only downloaded when the first shot is needed.
 */
export type ShotAngle = 0 | 1 | 2

const cache = new Map<string, string>()
let core: Promise<typeof import('./studioCore')> | null = null
const loadCore = () => (core ??= import('./studioCore'))

export function requestShot(productId: string, angle: ShotAngle = 0) {
  const key = `${productId}:${angle}`
  const hit = cache.get(key)
  if (hit) return Promise.resolve(hit)
  return loadCore()
    .then((m) => m.requestShot(productId, angle))
    .then((url) => {
      cache.set(key, url)
      return url
    })
}

/** React hook: the studio shot for a product (undefined while rendering, 'error' without WebGL). */
export function useProductShot(productId: string, angle: ShotAngle = 0) {
  const key = `${productId}:${angle}`
  const [state, setState] = useState<{ key: string; url?: string }>(() => ({ key, url: cache.get(key) }))
  useEffect(() => {
    let alive = true
    requestShot(productId, angle)
      .then((url) => alive && setState({ key, url }))
      .catch(() => alive && setState({ key, url: 'error' }))
    return () => {
      alive = false
    }
  }, [productId, angle, key])
  return state.key === key ? state.url : cache.get(key)
}
