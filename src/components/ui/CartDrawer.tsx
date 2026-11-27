import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { company } from '../../data/company'
import { formatPrice, productById } from '../../data/products'
import { cart, totals, unitPrice, useCart, useCartDrawer } from '../../lib/cart'
import { lockScroll } from '../../lib/smoothScroll'
import { ProductShot } from './ProductShot'
import { QtyStepper } from './QtyStepper'

export function CartDrawer() {
  const open = useCartDrawer()
  const items = useCart()
  const t = totals(items)
  const location = useLocation()

  useEffect(() => {
    cart.closeDrawer()
  }, [location.pathname])

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cart.closeDrawer()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const toFree = company.shipping.freeAbove - t.subtotal

  return (
    <div className={`fixed inset-0 z-[70] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open} inert={!open}>
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => cart.closeDrawer()}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-cream/10 bg-[#100a07] transition-transform duration-700 ease-[var(--ease-cinema)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-cream/10 px-6 py-5">
          <p className="display text-3xl text-cream">
            Your cart <span className="font-sans text-sm text-cream/40">({t.count})</span>
          </p>
          <button onClick={() => cart.closeDrawer()} className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream hover:border-gold" aria-label="Close cart">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
              <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="display text-3xl text-cream/80">Your cart is empty.</p>
            <p className="text-sm text-cream/50">Twelve spices and six signature blends are waiting.</p>
            <Link to="/shop" className="rounded-full bg-gold px-7 py-3.5 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-coal">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-cream/5 overflow-y-auto px-6" data-lenis-prevent>
              {items.map((i) => {
                const p = productById(i.id)!
                return (
                  <li key={`${i.id}-${i.size}`} className="flex gap-4 py-5">
                    <Link to={`/shop/${p.id}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-[#1a100a]">
                      <ProductShot id={p.id} className="h-full w-full" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link to={`/shop/${p.id}`} className="display text-xl text-cream hover:text-gold-soft">
                          {p.name}
                        </Link>
                        <p className="text-sm text-cream">{formatPrice(unitPrice(i.id, i.size) * i.qty)}</p>
                      </div>
                      <p className="text-xs text-cream/45">{i.size}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <QtyStepper value={i.qty} onChange={(q) => cart.setQty(i.id, i.size, q)} label={p.name} small />
                        <button onClick={() => cart.remove(i.id, i.size)} className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-cream/40 hover:text-ember-soft">
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="space-y-3 border-t border-cream/10 px-6 py-6">
              {toFree > 0 && (
                <p className="text-xs text-cream/50">
                  Add <span className="text-gold-soft">{formatPrice(toFree)}</span> more for free shipping.
                </p>
              )}
              <div className="flex justify-between text-sm text-cream/70">
                <span>Subtotal</span>
                <span>{formatPrice(t.subtotal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link to="/cart" className="rounded-full border border-gold/40 py-3.5 text-center text-[0.62rem] font-bold uppercase tracking-[0.22em] text-cream hover:border-gold">
                  View cart
                </Link>
                <Link to="/checkout" className="rounded-full bg-gradient-to-b from-[#f0cf7e] via-gold to-[#b8862f] py-3.5 text-center text-[0.62rem] font-bold uppercase tracking-[0.22em] text-coal">
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
