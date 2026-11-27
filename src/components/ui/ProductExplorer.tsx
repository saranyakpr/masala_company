import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { lazy, Suspense, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatPrice, type Product } from '../../data/products'
import { cart } from '../../lib/cart'
import { scene } from '../../lib/scene'
import { MagneticButton } from './MagneticButton'
import { ProductShot } from './ProductShot'

const ProductViewer3D = lazy(() => import('../three/ProductViewer3D'))

const formLabel = { powder: 'Ground powder', seeds: 'Whole seeds', whole: 'Whole spice' } as const

/**
 * Interactive presentation shared by Our Spices and Our Blend: a live 3D jar
 * (drag to turn it) beside the selected product's story, plus a gallery of
 * studio shots to choose from. The selection lives in the URL (?item=…).
 */
export function ProductExplorer({ list, webgl }: { list: Product[]; webgl: boolean }) {
  const [params, setParams] = useSearchParams()
  const selectedId = list.some((p) => p.id === params.get('item')) ? params.get('item')! : list[0].id
  const product = list.find((p) => p.id === selectedId)!
  const index = list.indexOf(product)
  const [pick, setPick] = useState<{ id: string; size: string } | null>(null)
  const size = pick?.id === product.id ? pick.size : product.sizes[0].label
  const setSize = (s: string) => setPick({ id: product.id, size: s })
  const info = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (scene.reducedMotion) return
      gsap.fromTo('.ex-anim', { y: 24, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.06, ease: 'power3.out' })
    },
    { scope: info, dependencies: [selectedId] },
  )

  const select = (id: string) => {
    setParams({ item: id }, { replace: true, preventScrollReset: true })
  }

  const price = product.sizes.find((s) => s.label === size)?.price ?? product.sizes[0].price

  return (
    <section className="relative z-20 px-5 pb-24 sm:px-8 lg:px-12" aria-label="Product explorer">
      <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        {/* stage */}
        <div className="lg:sticky lg:top-24 lg:h-[calc(100svh-7rem)] lg:self-start">
          <div className="relative h-[62svh] min-h-[420px] overflow-hidden rounded-sm border border-cream/[0.06] bg-[#100a07] lg:h-full">
            <div
              aria-hidden
              className="absolute inset-0 transition-[background] duration-1000"
              style={{ background: `radial-gradient(ellipse 55% 55% at 50% 52%, ${product.powder}45, transparent 70%)` }}
            />
            <div aria-hidden className="beam absolute -top-[20%] left-1/2 h-[120%] w-[120%] -translate-x-1/2 opacity-70" />
            {webgl ? (
              <Suspense fallback={<ProductShot id={product.id} className="absolute inset-0 h-full w-full" />}>
                <ProductViewer3D product={product} className="absolute inset-0" />
              </Suspense>
            ) : (
              <ProductShot id={product.id} className="absolute inset-0 h-full w-full" />
            )}
            <p className="pointer-events-none absolute bottom-5 left-5 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-cream/40">
              {webgl ? 'Drag to turn the jar' : product.name}
            </p>
            <p className="pointer-events-none absolute right-5 top-5 font-brand text-xs tracking-[0.3em] text-gold">
              {String(index + 1).padStart(2, '0')} <span className="text-cream/30">/ {String(list.length).padStart(2, '0')}</span>
            </p>
          </div>
        </div>

        {/* story + selector */}
        <div>
          <div ref={info} aria-live="polite">
            <p className="ex-anim eyebrow">{product.category === 'blend' ? 'Signature blend' : formLabel[product.form]}</p>
            <h2 className="ex-anim display mt-3 text-[clamp(2.8rem,5.5vw,5.6rem)] text-cream">
              {product.name.split(' ')[0]}{' '}
              <span className="italic" style={{ color: product.powder, filter: 'brightness(1.3) saturate(1.1)' }}>
                {product.name.split(' ').slice(1).join(' ')}
              </span>
            </h2>
            <p className="ex-anim mt-5 max-w-xl text-[1rem] leading-relaxed text-cream/75">{product.description}</p>
            <p className="ex-anim mt-4 max-w-xl text-sm leading-relaxed text-cream/55">{product.story}</p>

            <div className="ex-anim mt-8 grid max-w-xl grid-cols-2 gap-8 border-t border-cream/10 pt-6">
              <div>
                <p className="eyebrow mb-3 text-[0.62rem]">Flavour notes</p>
                <ul className="space-y-1.5 text-sm text-cream/85">
                  {product.notes.map((n) => (
                    <li key={n} className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: product.powder }} />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-3 text-[0.62rem]">Best with</p>
                <ul className="space-y-1.5 text-sm text-cream/85">
                  {product.pairs.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="ex-anim mt-8 flex flex-wrap items-center gap-3" role="radiogroup" aria-label="Pack size">
              {product.sizes.map((s) => (
                <button
                  key={s.label}
                  role="radio"
                  aria-checked={size === s.label}
                  onClick={() => setSize(s.label)}
                  className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                    size === s.label ? 'border-gold bg-gold/10 text-cream' : 'border-cream/15 text-cream/60 hover:border-cream/40'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <span className="ml-2 font-display text-3xl text-gold-soft">{formatPrice(price)}</span>
            </div>
            <div className="ex-anim mt-6 flex flex-wrap items-center gap-5">
              <MagneticButton onClick={() => cart.add(product.id, size)}>Add to cart</MagneticButton>
              <Link
                to={`/shop/${product.id}`}
                className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-cream/70 underline decoration-gold/50 underline-offset-8 hover:text-cream"
              >
                Full details
              </Link>
            </div>
          </div>

          <div className="mt-14 border-t border-cream/10 pt-8">
            <p className="eyebrow mb-5 text-[0.62rem]">Choose a {list[0].category === 'blend' ? 'blend' : 'spice'}</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4" role="tablist" aria-label="Products">
              {list.map((p) => {
                const active = p.id === selectedId
                return (
                  <button
                    key={p.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => select(p.id)}
                    className={`group relative overflow-hidden rounded-sm border bg-[#120b07] text-left transition-colors duration-500 ${
                      active ? 'border-gold/70' : 'border-cream/[0.06] hover:border-cream/25'
                    }`}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${p.powder}35, transparent 70%)` }}
                    />
                    <ProductShot id={p.id} className="relative aspect-[4/5] w-full transition-transform duration-700 group-hover:scale-105" />
                    <span className="relative block px-2.5 pb-3 text-[0.68rem] font-semibold leading-tight text-cream/80">{p.name}</span>
                    {active && <span className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: p.powder }} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
