import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, productById, productIndex } from '../../data/products'
import { cart } from '../../lib/cart'
import { productStore } from '../../lib/productStore'
import { scene, subscribeScroll, type SectionKey } from '../../lib/scene'
import { MagneticButton } from '../ui/MagneticButton'
import { RevealText } from '../ui/RevealText'

interface Props {
  id: string
  sectionKey: Extract<SectionKey, 'products' | 'blends'>
  ids: string[]
  /** Which side the WebGL jar occupies. */
  side: 'left' | 'right'
  eyebrow: string
  title: ReactNode[]
  allLink: { to: string; label: string }
}

/**
 * Home showcase — the jar (WebGL) is the product. Selecting a spice spins
 * the jar, repaints its label, re-colours what is inside and swaps the whole
 * spices orbiting it; the editorial panel re-animates alongside.
 */
export function ProductShowcase({ id, sectionKey, ids, side, eyebrow, title, allLink }: Props) {
  const [selected, setSelected] = useState(ids[0])
  const selectedRef = useRef(selected)
  const product = productById(selected)!
  const info = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; t: number } | null>(null)
  const listIndex = ids.indexOf(selected)

  // when the visitor arrives, make sure the jar shows this section's product
  useEffect(
    () =>
      subscribeScroll(() => {
        const s = scene.sections[sectionKey]
        if (s.enter > 0.55 && s.exit < 0.5) {
          const current = productStore.get()
          if (productIndex(selectedRef.current) !== current) productStore.set(productIndex(selectedRef.current))
        }
      }),
    [sectionKey],
  )

  useGSAP(
    () => {
      if (scene.reducedMotion) return
      gsap.fromTo(
        '.pi-anim',
        { y: 28, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.06, ease: 'power3.out', delay: 0.25 },
      )
    },
    { scope: info, dependencies: [selected] },
  )

  const go = (i: number) => {
    const next = ids[(i + ids.length) % ids.length]
    selectedRef.current = next
    setSelected(next)
    productStore.set(productIndex(next))
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(listIndex + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(listIndex - 1)
    }
  }

  const jarLeft = side === 'left'

  return (
    <section
      id={id}
      data-section={sectionKey}
      className="relative min-h-svh overflow-hidden md:h-svh md:min-h-[720px]"
      aria-label={eyebrow}
    >
      <div aria-hidden className="absolute inset-0 bg-[#140b06]" />
      <div
        aria-hidden
        className="absolute inset-0 transition-[background] duration-1000"
        style={{
          background: `radial-gradient(ellipse 45% 55% at ${scene.isMobile ? '50% 26%' : jarLeft ? '29% 50%' : '71% 50%'}, ${product.powder}38, transparent 70%)`,
        }}
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#1d0d05] to-transparent" />

      {/* drag surface over the jar */}
      <div
        className={`absolute top-0 z-20 h-[46svh] w-full touch-pan-y md:h-full md:w-1/2 ${jarLeft ? 'left-0' : 'right-0'}`}
        data-cursor="Drag"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, t: performance.now() }
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const dx = e.clientX - drag.current.x
          const now = performance.now()
          const dt = Math.max(16, now - drag.current.t)
          scene.dragVelocity = (dx / dt) * 18
          drag.current = { x: e.clientX, t: now }
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        aria-hidden
      />

      <div className="relative z-20 mx-auto grid h-full max-w-[1600px] grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr_auto] px-5 pb-8 pt-24 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[1fr_auto] lg:px-12 lg:pt-28">
        <div className={`pointer-events-none md:row-start-1 ${jarLeft ? 'md:col-start-1' : 'md:col-start-2 md:text-right'}`}>
          <p className="eyebrow">{eyebrow}</p>
          <RevealText className="display mt-3 text-[clamp(2rem,3.6vw,3.6rem)] text-cream" lines={title} />
        </div>

        <div className="h-[30svh] md:hidden" aria-hidden />

        <div
          ref={info}
          className={`relative md:row-span-1 md:row-start-1 md:self-center ${jarLeft ? 'md:col-start-2' : 'md:col-start-1'}`}
          aria-live="polite"
        >
          <p className="pi-anim font-brand text-sm tracking-[0.3em] text-gold">
            {String(listIndex + 1).padStart(2, '0')} <span className="text-cream/30">/ {String(ids.length).padStart(2, '0')}</span>
          </p>
          <h3 className="pi-anim display mt-3 text-[clamp(3rem,6.2vw,6.6rem)] text-cream">
            {product.line1.charAt(0) + product.line1.slice(1).toLowerCase()}
            <span className="block italic" style={{ color: product.powder, filter: 'brightness(1.3) saturate(1.1)' }}>
              {product.line2.charAt(0) + product.line2.slice(1).toLowerCase()}
            </span>
          </h3>
          <p className="pi-anim mt-6 max-w-md text-[0.98rem] leading-relaxed text-cream/75">{product.description}</p>

          <div className="pi-anim mt-8 grid max-w-md grid-cols-2 gap-8 border-t border-cream/10 pt-6">
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

          <div className="pi-anim mt-8 flex flex-wrap items-center gap-4">
            <MagneticButton onClick={() => cart.add(product.id, product.sizes[0].label)}>
              Add · {formatPrice(product.sizes[0].price)}
            </MagneticButton>
            <Link
              to={`/shop/${product.id}`}
              className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-cream/70 underline decoration-gold/50 underline-offset-8 hover:text-cream"
            >
              Details
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => go(listIndex - 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-gold hover:text-gold"
                aria-label="Previous"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                  <path d="M15 8H2M7 3 2 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <button
                onClick={() => go(listIndex + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-gold hover:text-gold"
                aria-label="Next"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                  <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 md:col-span-2 md:row-start-2 md:mt-0">
          <div
            role="tablist"
            aria-label={eyebrow}
            onKeyDown={onKey}
            className="-mx-5 flex snap-x gap-1 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 md:justify-between"
          >
            {ids.map((pid, i) => {
              const p = productById(pid)!
              const active = pid === selected
              return (
                <button
                  key={pid}
                  role="tab"
                  aria-selected={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => go(i)}
                  className="group relative shrink-0 snap-start px-3 pb-4 pt-3 text-left md:flex-1"
                >
                  <span
                    className={`absolute inset-x-3 bottom-0 h-px origin-left transition-transform duration-700 ease-[var(--ease-cinema)] ${
                      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                    }`}
                    style={{ background: p.powder }}
                  />
                  <span className="mb-2 flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ring-1 ring-cream/20 transition-transform duration-500 ${active ? 'scale-125' : ''}`}
                      style={{ background: `radial-gradient(circle at 35% 30%, #fff6, ${p.powder} 45%, ${p.powderDeep})` }}
                    />
                    <span className="text-[0.6rem] font-bold tracking-[0.2em] text-cream/40">{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <span className={`block whitespace-nowrap font-display text-lg transition-colors duration-500 lg:text-xl ${active ? 'text-cream' : 'text-cream/45 group-hover:text-cream/80'}`}>
                    {p.name}
                  </span>
                </button>
              )
            })}
            <Link
              to={allLink.to}
              className="flex shrink-0 items-end px-3 pb-4 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-soft hover:text-cream"
            >
              {allLink.label} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
