import { company } from '../data/company'
import { formatPrice, productById } from '../data/products'
import { totals, unitPrice, type CartItem } from './cart'

/**
 * Checkout integration point.
 *
 * Today `placeOrder` prepares the order and hands it to the customer's email
 * app (addressed to company.email), so orders reach you without a backend.
 *
 * To take payments, replace the body of `placeOrder` with a call to your
 * server, which should create the order and a payment session
 * (e.g. Razorpay / Stripe / PayU) and return its reference.
 */

export interface CheckoutDetails {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  notes: string
  payment: 'upi' | 'card' | 'cod'
}

export interface PlacedOrder {
  reference: string
  items: CartItem[]
  details: CheckoutDetails
  totals: ReturnType<typeof totals>
  createdAt: string
}

export const paymentLabels: Record<CheckoutDetails['payment'], string> = {
  upi: 'UPI',
  card: 'Credit / debit card',
  cod: 'Cash on delivery',
}

function reference() {
  const d = new Date()
  const stamp = `${d.getFullYear() % 100}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `12S-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export function orderText(order: PlacedOrder) {
  const lines = order.items.map((i) => {
    const p = productById(i.id)
    return `• ${p?.name ?? i.id} (${i.size}) × ${i.qty} — ${formatPrice(unitPrice(i.id, i.size) * i.qty)}`
  })
  const d = order.details
  return [
    `Order ${order.reference}`,
    '',
    ...lines,
    '',
    `Subtotal: ${formatPrice(order.totals.subtotal)}`,
    `Shipping: ${order.totals.shipping ? formatPrice(order.totals.shipping) : 'Free'}`,
    `Total: ${formatPrice(order.totals.total)}`,
    `Payment preference: ${paymentLabels[d.payment]}`,
    '',
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone}`,
    `Address: ${d.address}, ${d.city}, ${d.state} ${d.pincode}`,
    d.notes ? `Notes: ${d.notes}` : '',
  ]
    .filter((l) => l !== undefined)
    .join('\n')
}

export async function placeOrder(items: CartItem[], details: CheckoutDetails): Promise<PlacedOrder> {
  const order: PlacedOrder = {
    reference: reference(),
    items,
    details,
    totals: totals(items),
    createdAt: new Date().toISOString(),
  }
  const subject = encodeURIComponent(`New order ${order.reference} — ${company.name}`)
  const body = encodeURIComponent(orderText(order))
  window.location.href = `mailto:${company.email}?subject=${subject}&body=${body}`
  return order
}
