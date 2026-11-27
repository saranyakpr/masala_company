import { Link } from 'react-router-dom'
import { ProductShot } from '../components/ui/ProductShot'
import { QtyStepper } from '../components/ui/QtyStepper'
import { company } from '../data/company'
import { formatPrice, productById } from '../data/products'
import { cart, totals, unitPrice, useCart } from '../lib/cart'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export function OrderSummary({ cta }: { cta?: React.ReactNode }) {
  const items = useCart()
  const t = totals(items)
  const toFree = company.shipping.freeAbove - t.subtotal
  return (
    <aside className="rounded-sm border border-cream/10 bg-[#100a07] p-6 sm:p-8" aria-label="Order summary">
      <p className="display text-3xl text-cream">Order summary</p>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between text-cream/70">
          <dt>Subtotal ({t.count} item{t.count === 1 ? '' : 's'})</dt>
          <dd>{formatPrice(t.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-cream/70">
          <dt>Shipping</dt>
          <dd>{t.shipping ? formatPrice(t.shipping) : t.subtotal ? 'Free' : '—'}</dd>
        </div>
        <div className="flex justify-between border-t border-cream/10 pt-4 text-lg text-cream">
          <dt>Total</dt>
          <dd className="font-display text-3xl text-gold-soft">{formatPrice(t.total)}</dd>
        </div>
      </dl>
      {toFree > 0 && t.subtotal > 0 && (
        <p className="mt-4 text-xs text-cream/50">
          Add <span className="text-gold-soft">{formatPrice(toFree)}</span> more for free shipping.
        </p>
      )}
      {cta && <div className="mt-6">{cta}</div>}
    </aside>
  )
}

export default function CartPage() {
  useDocumentTitle('Your cart')
  const items = useCart()

  return (
    <div className="relative z-20 min-h-svh bg-coal px-5 pb-28 pt-32 sm:px-8 lg:px-12 lg:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <p className="eyebrow">Shopping cart</p>
        <h1 className="display mt-4 text-[clamp(3rem,6vw,6rem)] text-cream">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-16 border-t border-cream/10 py-20 text-center">
            <p className="display text-4xl text-cream/80">Your cart is empty.</p>
            <Link to="/shop" className="mt-8 inline-block rounded-full bg-gold px-8 py-4 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-coal">
              Shop the collection
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px]">
            <ul className="divide-y divide-cream/10 border-y border-cream/10">
              {items.map((i) => {
                const p = productById(i.id)!
                return (
                  <li key={`${i.id}-${i.size}`} className="grid grid-cols-[6rem_1fr] gap-5 py-6 sm:grid-cols-[8rem_1fr_auto] sm:items-center">
                    <Link to={`/shop/${p.id}`} className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#1a100a]">
                      <ProductShot id={p.id} className="h-full w-full" />
                    </Link>
                    <div>
                      <Link to={`/shop/${p.id}`} className="display text-3xl text-cream hover:text-gold-soft">
                        {p.name}
                      </Link>
                      <p className="mt-1 text-sm text-cream/50">
                        {i.size} · {formatPrice(unitPrice(i.id, i.size))} each
                      </p>
                      <div className="mt-4 flex items-center gap-5">
                        <QtyStepper value={i.qty} onChange={(q) => cart.setQty(i.id, i.size, q)} label={p.name} small />
                        <button onClick={() => cart.remove(i.id, i.size)} className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-cream/40 hover:text-ember-soft">
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="col-start-2 font-display text-2xl text-cream sm:col-start-3 sm:text-right">{formatPrice(unitPrice(i.id, i.size) * i.qty)}</p>
                  </li>
                )
              })}
            </ul>
            <div className="lg:sticky lg:top-28 lg:self-start">
              <OrderSummary
                cta={
                  <>
                    <Link
                      to="/checkout"
                      className="block rounded-full bg-gradient-to-b from-[#f0cf7e] via-gold to-[#b8862f] py-4 text-center text-[0.68rem] font-bold uppercase tracking-[0.22em] text-coal"
                    >
                      Proceed to checkout
                    </Link>
                    <Link to="/shop" className="mt-4 block text-center text-xs text-cream/50 hover:text-cream">
                      Continue shopping
                    </Link>
                  </>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
