import { useSyncExternalStore } from 'react'
import { DEFAULT_PRODUCT_INDEX, products } from '../data/products'

type Listener = () => void

export type ChangeSource = 'user' | 'hero'

let index = DEFAULT_PRODUCT_INDEX
let source: ChangeSource = 'user'
const listeners = new Set<Listener>()

export const productStore = {
  get: () => index,
  /** Who triggered the latest change (the hero swaps behind its powder cloud, without the showcase spin). */
  source: () => source,
  set(next: number, from: ChangeSource = 'user') {
    const n = ((next % products.length) + products.length) % products.length
    if (n === index) return
    index = n
    source = from
    listeners.forEach((l) => l())
  },
  setById(id: string) {
    const i = products.findIndex((p) => p.id === id)
    if (i >= 0) productStore.set(i)
  },
  subscribe(l: Listener) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

export function useProductIndex() {
  return useSyncExternalStore(productStore.subscribe, productStore.get, productStore.get)
}
