import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useRef } from 'react'
import { pillars } from '../../data/content'
import { scene } from '../../lib/scene'
import { RevealText } from '../ui/RevealText'

const glyphs = [
  // quality ingredients — leaf
  'M12 21C6 18 3 12 5 4c6 1 10 6 9 13M12 21c4-3 7-8 7-14-3 1-6 4-7 8',
  // authentic flavour — flame
  'M12 22c-4 0-7-3-7-7 0-5 5-7 5-12 3 2 5 5 5 8 1-1 2-2 2-4 2 2 3 5 3 8 0 4-4 7-8 7z',
  // freshness — droplet / seal
  'M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12zM9 15a3 3 0 0 0 3 3',
  // hygienic processing — shield
  'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5 4.5-5',
  // consistent quality — concentric
  'M12 3a9 9 0 1 0 0.01 0M12 7a5 5 0 1 0 0.01 0M12 11a1 1 0 1 0 0.01 0',
  // crafted blends — mortar
  'M3 11h18c0 5-4 9-9 9s-9-4-9-9zM15 4l-4 7M7 20h10',
]

/** Section 6 — Why choose us. Sticky statement + six animated pillars. */
export function WhyChooseUs() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (scene.reducedMotion) return
      gsap.utils.toArray<HTMLElement>('.pillar').forEach((el) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
        tl.fromTo(el.querySelector('.pillar-line'), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.out' })
          .fromTo(el.querySelectorAll('.pillar-in'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.15)
          .fromTo(
            el.querySelector('.pillar-glyph path'),
            { strokeDasharray: 1, strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' },
            0.2,
          )
      })
    },
    { scope: root },
  )

  return (
    <section
      id="why"
      ref={root}
      data-section="why"
      className="relative z-20 overflow-hidden bg-[#120b07] px-5 py-28 sm:px-8 lg:px-12 lg:py-40"
      aria-label="Our commitment to authentic flavours"
    >
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 h-[40rem] w-[40rem] rounded-full bg-ember/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-[1600px] gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">05 — Our commitment to authentic flavours</p>
          <RevealText
            className="display mt-5 text-[clamp(2.8rem,5.6vw,6rem)] text-cream"
            lines={[
              <span key="a">What goes</span>,
              <span key="b">into every</span>,
              <span key="c" className="italic gold-text">
                single jar.
              </span>,
            ]}
          />
          <p className="mt-8 max-w-sm text-[0.98rem] leading-relaxed text-cream/60">
            No shortcuts and no fuss — just the things that make a spice worth reaching for, every single time you cook.
          </p>
        </div>

        <ol className="divide-y divide-transparent">
          {pillars.map((p, i) => (
            <li key={p.title} className="pillar group relative py-8 first:pt-0 sm:py-10">
              <span className="pillar-line absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-gold/60 via-cream/15 to-transparent group-first:hidden" />
              <div className="grid grid-cols-[auto_1fr] items-start gap-6 sm:grid-cols-[3rem_auto_1fr] sm:gap-8">
                <span className="pillar-in hidden pt-3 font-brand text-xs tracking-[0.25em] text-cream/35 sm:block">0{i + 1}</span>
                <svg viewBox="0 0 24 24" className="pillar-glyph pillar-in mt-1 h-10 w-10 text-gold transition-transform duration-700 ease-[var(--ease-cinema)] group-hover:rotate-[-8deg] group-hover:scale-110" aria-hidden>
                  <path d={glyphs[i]} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
                </svg>
                <div>
                  <h3 className="pillar-in display text-[clamp(1.9rem,3vw,3rem)] text-cream transition-transform duration-700 ease-[var(--ease-cinema)] group-hover:translate-x-2">
                    {p.title}
                  </h3>
                  <p className="pillar-in mt-2 max-w-lg text-[0.95rem] leading-relaxed text-cream/60">{p.text}</p>
                </div>
              </div>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ember/0 via-ember/[0.07] to-ember/0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
