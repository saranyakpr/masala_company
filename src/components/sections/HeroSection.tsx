import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { company } from '../../data/company'
import { fallbackFx, heroFx } from '../../data/heroFx'
import { products } from '../../data/products'
import { useProductIndex } from '../../lib/productStore'
import { scene } from '../../lib/scene'
import { scrollToTarget } from '../../lib/smoothScroll'
import { MagneticButton } from '../ui/MagneticButton'
import { JarIllustration } from '../ui/JarIllustration'
import { RevealText } from '../ui/RevealText'
import { HeroProductCaption } from './HeroProductCaption'

/**
 * Section 1 — cinematic intro. The giant headline sits *behind* the WebGL
 * layer (z-0) so the jar floats in front of the word "MAGIC"; the CTAs sit
 * above it (z-20).
 */
export function HeroSection({ ready, fallback }: { ready: boolean; fallback?: boolean }) {
  const root = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const index = useProductIndex()
  const atmosphere = (heroFx[products[index].id] ?? fallbackFx).atmosphere

  useGSAP(
    () => {
      if (!ready) return
      const reduced = scene.reducedMotion
      const tl = gsap.timeline({ delay: 0.2 })
      tl.fromTo('.hero-beam', { opacity: 0, scaleY: 0.4 }, { opacity: 1, scaleY: 1, duration: reduced ? 0 : 2.4, ease: 'power2.out' })
        .fromTo('.hero-fade', { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.12, duration: reduced ? 0 : 1.2, ease: 'power3.out' }, 1.3)
      // the giant word drifts apart slightly on scroll
      if (!reduced) {
        gsap.to('.hero-word', {
          yPercent: -18,
          letterSpacing: '0.06em',
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to('.hero-ui', {
          opacity: 0,
          y: -60,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: '20% top', end: '70% top', scrub: true },
        })
      }
    },
    { scope: root, dependencies: [ready] },
  )

  return (
    <section
      id="top"
      ref={root}
      data-section="hero"
      className="relative flex h-svh min-h-[620px] flex-col overflow-hidden"
      aria-label="Introduction"
    >
      {/* warm backdrop */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,#3b1a09_0%,#1a0c05_45%,#0b0806_80%)]" />
      {/* atmosphere tint — shifts with each product as the powder cloud passes */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 transition-[background] duration-[1800ms] ease-out"
        style={{ background: `radial-gradient(ellipse 55% 50% at 50% 48%, ${atmosphere}55, transparent 72%)` }}
      />
      <div aria-hidden className="hero-beam beam absolute -top-[10%] left-1/2 h-[110%] w-[140%] -translate-x-1/2 origin-top opacity-0" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-coal to-transparent" />

      {/* giant headline behind the jar */}
      <div className="hero-word pointer-events-none absolute inset-0 flex flex-col items-center justify-start pt-[15svh] md:justify-center md:pb-[8vh] md:pt-0 text-center select-none">
        <RevealText
          as="h1"
          play={ready}
          delay={0.9}
          stagger={0.14}
          className="display w-full px-4"
          lines={[
            <span key="a" className="block text-[clamp(1.6rem,5.4vw,5.6rem)] tracking-[0.04em] text-cream">
              UNLEASH THE
            </span>,
            <span key="b" className="block text-[clamp(5.2rem,21vw,21rem)] italic leading-[0.82] gold-text">
              Magic
            </span>,
            <span key="c" className="block text-[clamp(1.6rem,5.4vw,5.6rem)] tracking-[0.04em] text-cream">
              OF SPICES.
            </span>,
          ]}
        />
      </div>

      {fallback && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <JarIllustration product={products[index]} className="h-[52svh] w-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]" />
        </div>
      )}

      {!fallback && <HeroProductCaption />}

      {/* foreground UI */}
      <div className="hero-ui relative z-20 mt-auto grid gap-5 px-5 pb-7 md:gap-8 sm:px-8 md:grid-cols-[1fr_auto_1fr] md:items-end lg:px-12 lg:pb-12">
        <div className="hero-fade max-w-sm opacity-0">
          <p className="eyebrow mb-3">{company.name} · {company.category}</p>
          <p className="text-[0.95rem] leading-relaxed text-cream/80">
            {company.tagline} Pure single spices and signature masalas, crafted for unforgettable cooking.
          </p>
        </div>

        <button
          className="hero-fade hidden flex-col items-center gap-3 opacity-0 md:flex"
          onClick={() => scrollToTarget('#story')}
          aria-label="Scroll to discover"
        >
          <span className="relative h-11 w-6 rounded-full border border-cream/30">
            <span className="scroll-dot absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-saffron" />
          </span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-cream/60">Scroll</span>
        </button>

        <div className="hero-fade flex flex-wrap gap-3 opacity-0 md:justify-end">
          <MagneticButton onClick={() => navigate('/shop')}>Shop now</MagneticButton>
          <MagneticButton variant="ghost" onClick={() => navigate('/spices')}>
            Explore our spices
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
