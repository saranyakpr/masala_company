import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MagneticButton } from '../components/ui/MagneticButton'
import { company } from '../data/company'
import { formatPrice, productById } from '../data/products'
import { cart, unitPrice, useCart } from '../lib/cart'
import { paymentLabels, placeOrder, type CheckoutDetails, type PlacedOrder } from '../lib/checkout'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { OrderSummary } from './CartPage'

const empty: CheckoutDetails = { name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', notes: '', payment: 'upi' }

const fields: { k: keyof CheckoutDetails; label: string; type?: string; auto?: string; full?: boolean }[] = [
  { k: 'name', label: 'Full name', auto: 'name' },
  { k: 'phone', label: 'Phone', type: 'tel', auto: 'tel' },
  { k: 'email', label: 'Email', type: 'email', auto: 'email', full: true },
  { k: 'address', label: 'Address (house, street, area)', auto: 'street-address', full: true },
  { k: 'city', label: 'City', auto: 'address-level2' },
  { k: 'state', label: 'State', auto: 'address-level1' },
  { k: 'pincode', label: 'PIN code', auto: 'postal-code' },
]

function validate(d: CheckoutDetails) {
  const e: Partial<Record<keyof CheckoutDetails, string>> = {}
  if (!d.name.trim()) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = 'Please enter a valid email.'
  if (d.phone.replace(/\D/g, '').length < 10) e.phone = 'Please enter a 10-digit phone number.'
  if (d.address.trim().length < 6) e.address = 'Please enter your delivery address.'
  if (!d.city.trim()) e.city = 'Required.'
  if (!d.state.trim()) e.state = 'Required.'
  if (!/^\d{6}$/.test(d.pincode.trim())) e.pincode = 'Enter a 6-digit PIN code.'
  return e
}

export default function CheckoutPage() {
  useDocumentTitle('Checkout')
  const items = useCart()
  const [d, setD] = useState<CheckoutDetails>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutDetails, string>>>({})
  const [placed, setPlaced] = useState<PlacedOrder | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate(d)
    setErrors(v)
    if (Object.keys(v).length) {
      document.getElementById(`co-${Object.keys(v)[0]}`)?.focus()
      return
    }
    setBusy(true)
    try {
      const order = await placeOrder(items, d)
      setPlaced(order)
      cart.clear()
    } finally {
      setBusy(false)
    }
  }

  if (placed) {
    return (
      <div className="relative z-20 min-h-svh bg-coal px-5 pb-28 pt-36 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Order request ready</p>
          <h1 className="display mt-4 text-[clamp(3rem,6vw,5.5rem)] text-cream">
            Thank you, <span className="italic gold-text">{placed.details.name.split(' ')[0]}.</span>
          </h1>
          <p className="mt-6 text-cream/70">
            Your order <span className="font-semibold text-gold-soft">{placed.reference}</span> has been prepared in your email app, addressed to {company.email}. Send it
            and our team will confirm availability, payment ({paymentLabels[placed.details.payment]}) and delivery.
          </p>
          <ul className="mx-auto mt-10 max-w-md divide-y divide-cream/10 border-y border-cream/10 text-left text-sm">
            {placed.items.map((i) => (
              <li key={`${i.id}-${i.size}`} className="flex justify-between py-3 text-cream/75">
                <span>
                  {productById(i.id)?.name} ({i.size}) × {i.qty}
                </span>
                <span>{formatPrice(unitPrice(i.id, i.size) * i.qty)}</span>
              </li>
            ))}
            <li className="flex justify-between py-3 text-cream">
              <span>Total</span>
              <span className="text-gold-soft">{formatPrice(placed.totals.total)}</span>
            </li>
          </ul>
          <Link to="/shop" className="mt-10 inline-block rounded-full bg-gold px-8 py-4 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-coal">
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="relative z-20 min-h-svh bg-coal px-5 pt-40 text-center">
        <h1 className="display text-5xl text-cream">Your cart is empty.</h1>
        <Link to="/shop" className="mt-8 inline-block rounded-full bg-gold px-8 py-4 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-coal">
          Shop the collection
        </Link>
      </div>
    )
  }

  const input =
    'w-full border-0 border-b border-cream/20 bg-transparent px-0 pb-2.5 pt-2 text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none focus:ring-0'

  return (
    <div className="relative z-20 min-h-svh bg-coal px-5 pb-28 pt-32 sm:px-8 lg:px-12 lg:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <p className="eyebrow">Checkout</p>
        <h1 className="display mt-4 text-[clamp(3rem,6vw,6rem)] text-cream">Almost there.</h1>

        <form onSubmit={submit} noValidate className="mt-12 grid gap-12 lg:grid-cols-[1fr_420px]">
          <div className="space-y-12">
            <fieldset>
              <legend className="eyebrow mb-6">01 — Contact & delivery</legend>
              <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                {fields.map((f) => (
                  <label key={f.k} className={f.full ? 'sm:col-span-2' : ''}>
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-cream/50">{f.label}</span>
                    <input
                      id={`co-${f.k}`}
                      type={f.type ?? 'text'}
                      autoComplete={f.auto}
                      value={d[f.k]}
                      onChange={(e) => setD({ ...d, [f.k]: e.target.value })}
                      className={input}
                      aria-invalid={!!errors[f.k]}
                      aria-describedby={errors[f.k] ? `co-${f.k}-err` : undefined}
                    />
                    {errors[f.k] && (
                      <span id={`co-${f.k}-err`} className="mt-1.5 block text-xs text-ember-soft">
                        {errors[f.k]}
                      </span>
                    )}
                  </label>
                ))}
                <label className="sm:col-span-2">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-cream/50">Delivery notes (optional)</span>
                  <textarea rows={2} value={d.notes} onChange={(e) => setD({ ...d, notes: e.target.value })} className={`${input} resize-none`} />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="eyebrow mb-6">02 — Payment preference</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {(Object.keys(paymentLabels) as CheckoutDetails['payment'][]).map((k) => (
                  <label
                    key={k}
                    className={`cursor-pointer rounded-sm border px-5 py-4 text-sm transition-colors ${
                      d.payment === k ? 'border-gold bg-gold/10 text-cream' : 'border-cream/15 text-cream/65 hover:border-cream/40'
                    }`}
                  >
                    <input type="radio" name="payment" value={k} checked={d.payment === k} onChange={() => setD({ ...d, payment: k })} className="sr-only" />
                    {paymentLabels[k]}
                  </label>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-cream/45">
                Online payment isn't connected yet. When you place your order, it opens in your email app so you can send it to us, and we'll confirm payment and delivery with you.
              </p>
            </fieldset>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <ul className="mb-6 space-y-3 text-sm">
              {items.map((i) => (
                <li key={`${i.id}-${i.size}`} className="flex justify-between text-cream/70">
                  <span>
                    {productById(i.id)?.name} <span className="text-cream/40">({i.size}) × {i.qty}</span>
                  </span>
                  <span>{formatPrice(unitPrice(i.id, i.size) * i.qty)}</span>
                </li>
              ))}
            </ul>
            <OrderSummary cta={<MagneticButton type="submit" className="w-full">{busy ? 'Preparing…' : 'Place order'}</MagneticButton>} />
          </div>
        </form>
      </div>
    </div>
  )
}
