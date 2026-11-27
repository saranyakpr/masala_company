import { useState } from 'react'
import { company } from '../../data/company'
import { products } from '../../data/products'
import { MagneticButton } from '../ui/MagneticButton'
import { FadeUp, RevealText } from '../ui/RevealText'

const enquiryTypes = ['Retail purchase', 'Wholesale / bulk', 'Distribution', 'Other']

/**
 * Contact — a refined enquiry form. Without a backend it composes an email
 * in the visitor's mail app (mailto), so nothing is lost or faked.
 * Wire `onSubmit` to your form service / API when ready.
 */
export function ContactSection({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    const next: Record<string, string> = {}
    if (!name) next.name = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Please enter a valid email address.'
    if (message.length < 5) next.message = 'A few words about your enquiry, please.'
    setErrors(next)
    if (Object.keys(next).length) return

    const type = String(data.get('type') ?? '')
    const product = String(data.get('product') ?? '')
    const phone = String(data.get('phone') ?? '')
    const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nEnquiry: ${type}\nProduct: ${product}\n\n${message}`
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(`Enquiry — ${type || company.name}`)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const field =
    'peer w-full border-0 border-b border-cream/20 bg-transparent px-0 pb-3 pt-6 text-cream placeholder-transparent transition-colors focus:border-gold focus:outline-none focus:ring-0'
  const label =
    'pointer-events-none absolute left-0 top-1 text-[0.62rem] font-bold uppercase tracking-[0.25em] text-cream/50 transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-1 peer-focus:text-[0.62rem] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-[0.25em] peer-focus:text-gold'

  return (
    <section
      id="contact"
      data-section="contact"
      className={`relative z-20 bg-coal px-5 sm:px-8 lg:px-12 ${compact ? 'pb-24' : 'py-28 lg:py-36'}`}
      aria-label="Contact us"
    >
      <div className="mx-auto grid max-w-[1600px] gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          {!compact && (
            <>
              <p className="eyebrow">Get in touch</p>
              <RevealText
                className="display mt-5 text-[clamp(2.8rem,5.4vw,5.8rem)] text-cream"
                lines={[<span key="a">Let's talk</span>, <span key="b" className="italic gold-text">flavour.</span>]}
              />
              <FadeUp className="mt-8 max-w-md text-[0.98rem] leading-relaxed text-cream/60">
                Retail, wholesale or distribution — tell us what you are looking for and our team will get back to you.
              </FadeUp>
            </>
          )}

          <FadeUp className={`grid gap-8 sm:grid-cols-2 ${compact ? '' : 'mt-12'}`} delay={0.1}>
            {company.email && (
              <div>
                <p className="eyebrow mb-2 text-[0.6rem] !text-cream/40">Email</p>
                <a href={`mailto:${company.email}`} className="font-display text-2xl text-cream transition-colors hover:text-gold-soft">
                  {company.email}
                </a>
              </div>
            )}
            {company.phone && (
              <div>
                <p className="eyebrow mb-2 text-[0.6rem] !text-cream/40">Phone</p>
                <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="font-display text-2xl text-cream transition-colors hover:text-gold-soft">
                  {company.phone}
                </a>
              </div>
            )}
            {company.address && (
              <div>
                <p className="eyebrow mb-2 text-[0.6rem] !text-cream/40">Address</p>
                <p className="font-display text-2xl text-cream">{company.address}</p>
              </div>
            )}
            {company.hours && (
              <div>
                <p className="eyebrow mb-2 text-[0.6rem] !text-cream/40">Hours</p>
                <p className="font-display text-2xl text-cream">{company.hours}</p>
              </div>
            )}
          </FadeUp>
        </div>

        <FadeUp delay={0.15}>
          <form onSubmit={onSubmit} noValidate className="relative grid gap-8 border border-cream/10 bg-char/60 p-6 backdrop-blur sm:grid-cols-2 sm:p-10">
            <span aria-hidden className="absolute -top-px left-10 h-px w-32 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="relative">
              <input id="c-name" name="name" placeholder="Your name" className={field} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'e-name' : undefined} />
              <label htmlFor="c-name" className={label}>
                Your name
              </label>
              {errors.name && (
                <p id="e-name" className="mt-2 text-xs text-ember-soft">
                  {errors.name}
                </p>
              )}
            </div>
            <div className="relative">
              <input id="c-email" name="email" type="email" placeholder="Email" className={field} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'e-email' : undefined} />
              <label htmlFor="c-email" className={label}>
                Email
              </label>
              {errors.email && (
                <p id="e-email" className="mt-2 text-xs text-ember-soft">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="relative">
              <input id="c-phone" name="phone" type="tel" placeholder="Phone (optional)" className={field} autoComplete="tel" />
              <label htmlFor="c-phone" className={label}>
                Phone (optional)
              </label>
            </div>
            <div className="relative">
              <select id="c-type" name="type" defaultValue={enquiryTypes[0]} className={`${field} appearance-none [&>option]:bg-coal`}>
                {enquiryTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <label htmlFor="c-type" className="pointer-events-none absolute left-0 top-1 text-[0.62rem] font-bold uppercase tracking-[0.25em] text-cream/50">
                Enquiry type
              </label>
            </div>
            <div className="relative sm:col-span-2">
              <select id="c-product" name="product" defaultValue="" className={`${field} appearance-none [&>option]:bg-coal`}>
                <option value="">All products</option>
                {products.map((p) => (
                  <option key={p.id}>{p.name}</option>
                ))}
              </select>
              <label htmlFor="c-product" className="pointer-events-none absolute left-0 top-1 text-[0.62rem] font-bold uppercase tracking-[0.25em] text-cream/50">
                Product of interest
              </label>
            </div>
            <div className="relative sm:col-span-2">
              <textarea id="c-msg" name="message" rows={4} placeholder="Message" className={`${field} resize-none`} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'e-msg' : undefined} />
              <label htmlFor="c-msg" className={label}>
                Message
              </label>
              {errors.message && (
                <p id="e-msg" className="mt-2 text-xs text-ember-soft">
                  {errors.message}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
              <MagneticButton type="submit">Send enquiry</MagneticButton>
              <p className="text-xs text-cream/45" role="status">
                {sent ? 'Your email app should open with the enquiry ready to send.' : 'Opens your email app with the details filled in.'}
              </p>
            </div>
          </form>
        </FadeUp>
      </div>
    </section>
  )
}
