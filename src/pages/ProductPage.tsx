import { lazy, Suspense, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MagneticButton } from '../components/ui/MagneticButton'
import { ProductCard } from '../components/ui/ProductCard'
import { ProductShot } from '../components/ui/ProductShot'
import { QtyStepper } from '../components/ui/QtyStepper'
import { company } from '../data/company'
import { formatPrice, productById, products, STORAGE_NOTE } from '../data/products'
import { cart } from '../lib/cart'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import NotFoundPage from './NotFoundPage'

const ProductViewer3D = lazy(() => import('../components/three/ProductViewer3D'))

const formLabel = { powder: 'Ground powder', seeds: 'Whole seeds', whole: 'Whole spice' } as const
type View = '3d' | 0 | 1 | 2

export default function ProductPage({ webgl }: { webgl: boolean }) {
  const { id = '' } = useParams()
  const product = productById(id)
  if (!product) return <NotFoundPage />
  // keyed so state resets when navigating between products
  return <ProductDetail key={product.id} id={product.id} webgl={webgl} />
}

function ProductDetail({ id, webgl }: { id: string; webgl: boolean }) {
  const product = productById(id)!
  useDocumentTitle(product.name, `${product.name} by ${company.name}. ${product.description}`)
  const navigate = useNavigate()
  const [size, setSize] = useState(product.sizes[0].label)
  const [qty, setQty] = useState(1)
  const [view, setView] = useState<View>(webgl ? '3d' : 0)
  const price = product.sizes.find((s) => s.label === size)!.price
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  const details = [
    { k: 'About this product', v: product.story },
    { k: 'Flavour & uses', v: `${product.notes.join(', ')}. Best with ${product.pairs.join(', ').toLowerCase()}.` },
    { k: 'Form', v: `${product.category === 'blend' ? 'Blended masala' : formLabel[product.form]} in the signature 12 SPICES jar.` },
    { k: 'Storage', v: STORAGE_NOTE },
  ]

  return (
    <div className="relative z-20 bg-coal px-5 pb-28 pt-28 sm:px-8 lg:px-12 lg:pt-32">
      <div className="mx-auto max-w-[1600px]">
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-cream/45">
          <Link to="/shop" className="hover:text-cream">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link to={product.category === 'blend' ? '/blends' : '/spices'} className="hover:text-cream">
            {product.category === 'blend' ? 'Our Blend' : 'Our Spices'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-cream/80">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
          {/* gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-cream/[0.06] bg-[#100a07]">
              <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 55% at 50% 55%, ${product.powder}45, transparent 70%)` }} />
              {view === '3d' ? (
                <Suspense fallback={<ProductShot id={product.id} className="absolute inset-0 h-full w-full" />}>
                  <ProductViewer3D product={product} className="absolute inset-0" />
                </Suspense>
              ) : (
                <ProductShot id={product.id} angle={view} className="absolute inset-0 h-full w-full" />
              )}
              {view === '3d' && (
                <p className="pointer-events-none absolute bottom-4 left-4 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-cream/40">Drag to turn · 360° view</p>
              )}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3" role="tablist" aria-label="Product images">
              {webgl && (
                <button
                  role="tab"
                  aria-selected={view === '3d'}
                  onClick={() => setView('3d')}
                  className={`flex aspect-square items-center justify-center rounded-sm border bg-[#120b07] font-brand text-sm tracking-[0.2em] ${
                    view === '3d' ? 'border-gold text-gold-soft' : 'border-cream/10 text-cream/60 hover:border-cream/30'
                  }`}
                >
                  3D
                </button>
              )}
              {([0, 1, 2] as const).map((a) => (
                <button
                  key={a}
                  role="tab"
                  aria-selected={view === a}
                  aria-label={['Front view', 'Three-quarter view', 'Back label'][a]}
                  onClick={() => setView(a)}
                  className={`relative aspect-square overflow-hidden rounded-sm border bg-[#120b07] ${view === a ? 'border-gold' : 'border-cream/10 hover:border-cream/30'}`}
                >
                  <ProductShot id={product.id} angle={a} className="h-full w-full" />
                </button>
              ))}
            </div>
          </div>

          {/* buy box */}
          <div>
            <p className="eyebrow">{product.category === 'blend' ? 'Signature blend' : formLabel[product.form]}</p>
            <h1 className="display mt-4 text-[clamp(3rem,6vw,6rem)] text-cream">{product.name}</h1>
            <p className="mt-3 text-sm uppercase tracking-[0.22em] text-cream/50">{product.notes.join(' · ')}</p>
            <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-cream/75">{product.description}</p>

            <p className="mt-8 font-display text-5xl text-gold-soft" aria-live="polite">
              {formatPrice(price)}
              <span className="ml-3 font-sans text-xs uppercase tracking-[0.2em] text-cream/40">incl. of all taxes</span>
            </p>

            <fieldset className="mt-8">
              <legend className="eyebrow mb-3 text-[0.62rem]">Pack size</legend>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((s) => (
                  <label
                    key={s.label}
                    className={`cursor-pointer rounded-sm border px-5 py-3 text-sm transition-colors ${
                      size === s.label ? 'border-gold bg-gold/10 text-cream' : 'border-cream/15 text-cream/65 hover:border-cream/40'
                    }`}
                  >
                    <input type="radio" name="size" value={s.label} checked={size === s.label} onChange={() => setSize(s.label)} className="sr-only" />
                    <span className="block font-semibold">{s.label}</span>
                    <span className="block text-xs text-cream/50">{formatPrice(s.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <QtyStepper value={qty} onChange={setQty} label={product.name} />
              <MagneticButton onClick={() => cart.add(product.id, size, qty)}>Add to cart · {formatPrice(price * qty)}</MagneticButton>
              <button
                onClick={() => {
                  cart.add(product.id, size, qty)
                  cart.closeDrawer()
                  navigate('/checkout')
                }}
                className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-cream/75 underline decoration-gold/50 underline-offset-8 hover:text-cream"
              >
                Buy now
              </button>
            </div>
            <p className="mt-5 text-xs text-cream/45">
              Free shipping above {formatPrice(company.shipping.freeAbove)} · otherwise {formatPrice(company.shipping.flatFee)}
            </p>

            <div className="mt-12 divide-y divide-cream/10 border-y border-cream/10">
              {details.map((d, i) => (
                <details key={d.k} className="group py-5" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between text-[0.7rem] font-bold uppercase tracking-[0.24em] text-cream/85">
                    {d.k}
                    <span className="text-gold transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/65">{d.v}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-28" aria-label="You may also like">
            <h2 className="display text-[clamp(2.2rem,4vw,3.6rem)] text-cream">
              You may <span className="italic gold-text">also like</span>
            </h2>
            <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
