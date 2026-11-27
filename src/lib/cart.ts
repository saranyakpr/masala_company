import { useSyncExternalStore } from 'react'
import { company } from '../data/company'
import { productById } from '../data/products'

/**
 * Shopping cart — a tiny external store persisted to localStorage so the
 * cart survives reloads. Wire `checkout.ts` to your payment gateway.
 */

export interface CartItem {
  id: string
  size: string
  qty: number
}

const KEY = '12spices.cart.v1'
type Listener = () => void
const listeners = new Set<Listener>()

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return parsed.filter((i) => productById(i.id) && i.qty > 0)
  } catch {
    return []
  }
}

let items: CartItem[] = typeof window === 'undefined' ? [] : load()
let drawerOpen = false
let lastAdded: { id: string; at: number } | null = null

function commit(next: CartItem[]) {
  items = next
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    /* storage unavailable — cart still works for this visit */
  }
  listeners.forEach((l) => l())
}

export const cart = {
  get: () => items,
  add(id: string, size: string, qty = 1) {
    const existing = items.find((i) => i.id === id && i.size === size)
    commit(existing ? items.map((i) => (i === existing ? { ...i, qty: Math.min(99, i.qty + qty) } : i)) : [...items, { id, size, qty }])
    lastAdded = { id, at: Date.now() }
    cart.openDrawer()
  },
  setQty(id: string, size: string, qty: number) {
    if (qty <= 0) return cart.remove(id, size)
    commit(items.map((i) => (i.id === id && i.size === size ? { ...i, qty: Math.min(99, qty) } : i)))
  },
  remove(id: string, size: string) {
    commit(items.filter((i) => !(i.id === id && i.size === size)))
  },
  clear() {
    commit([])
  },
  openDrawer() {
    drawerOpen = true
    listeners.forEach((l) => l())
  },
  closeDrawer() {
    drawerOpen = false
    listeners.forEach((l) => l())
  },
  isDrawerOpen: () => drawerOpen,
  lastAdded: () => lastAdded,
  subscribe(l: Listener) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

export function unitPrice(id: string, size: string) {
  const p = productById(id)
  return p?.sizes.find((s) => s.label === size)?.price ?? 0
}

export function totals(list: CartItem[]) {
  const subtotal = list.reduce((sum, i) => sum + unitPrice(i.id, i.size) * i.qty, 0)
  const count = list.reduce((n, i) => n + i.qty, 0)
  const shipping = subtotal === 0 || subtotal >= company.shipping.freeAbove ? 0 : company.shipping.flatFee
  return { subtotal, shipping, total: subtotal + shipping, count }
}

export function useCart() {
  return useSyncExternalStore(cart.subscribe, cart.get, cart.get)
}

export function useCartDrawer() {
  return useSyncExternalStore(cart.subscribe, cart.isDrawerOpen, cart.isDrawerOpen)
}
