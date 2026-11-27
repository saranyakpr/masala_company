import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import { heroLineup, productIndex, products } from '../../data/products'
import { useProductIndex } from '../../lib/productStore'
import { scene } from '../../lib/scene'
import { heroDirector, requestHeroProduct, T_HOLD } from '../three/heroDirector'

/**
 * The hero's "now showing" caption: product number, name, flavour notes and
 * a dot selector whose active dot doubles as the countdown to the next
 * powder transition. Clicking a dot triggers the pour → cloud → reveal.
 */
export function HeroProductCaption() {
  const index = useProductIndex()
  const product = products[index]
  const body = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const first = useRef(true)

  // re-animate the caption whenever the jar changes
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (scene.reducedMotion || !body.current) return
    gsap.fromTo(
      body.current.children,
      { y: 18, opacity: 0, filter: 'blur(8px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: 0.07, ease: 'power3.out', delay: 0.35 },
    )
  }, [index])

  // countdown on the active dot
  useEffect(() => {
    if (scene.reducedMotion) return
    const tick = () => {
      if (!bar.current) return
      const t = heroDirector.t
      const p = t < T_HOLD ? heroDirector.holdProgress : 1
      bar.current.style.transform = `scaleX(${p.toFixed(3)})`
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <div className="hero-fade hero-ui pointer-events-auto absolute left-5 top-[44svh] z-20 w-[30vw] opacity-0 sm:left-8 md:left-auto md:right-8 md:top-1/2 md:w-[15rem] md:-translate-y-1/2 lg:right-12">
      <div ref={body} aria-live="polite">
        <p className="font-brand text-[0.62rem] tracking-[0.3em] text-gold">
          NO. {String(index + 1).padStart(2, '0')} <span className="text-cream/35">/ {String(products.length).padStart(2, '0')}</span>
        </p>
        <h2 className="display mt-2 text-[1.35rem] leading-[1] text-cream sm:text-[1.7rem] md:text-[2.3rem]">
          {product.line1.charAt(0) + product.line1.slice(1).toLowerCase()}{' '}
          <span className="italic gold-text">{product.line2.charAt(0) + product.line2.slice(1).toLowerCase()}</span>
        </h2>
        <p className="mt-3 hidden text-[0.62rem] font-bold uppercase tracking-[0.25em] text-cream/55 md:block">{product.notes.join(' · ')}</p>
      </div>

      <div className="mt-6 hidden max-w-[15rem] flex-wrap items-center gap-x-1.5 gap-y-1 md:flex" role="group" aria-label="Choose the featured spice">
        {heroLineup.map((pid) => {
          const i = productIndex(pid)
          const p = products[i]
          const active = i === index
          return (
            <button
              key={p.id}
              onClick={() => requestHeroProduct(i)}
              aria-label={`Feature ${p.name}`}
              aria-pressed={active}
              className="group relative flex h-6 items-center"
              data-cursor="hover"
            >
              <span
                className={`relative block h-[3px] overflow-hidden rounded-full transition-all duration-700 ease-[var(--ease-cinema)] ${
                  active ? 'w-8 bg-cream/20' : 'w-2.5 bg-cream/25 group-hover:w-5 group-hover:bg-cream/50'
                }`}
              >
                {active && <span ref={bar} className="absolute inset-0 origin-left scale-x-0" style={{ background: p.powder }} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
