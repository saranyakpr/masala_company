import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { processSteps } from '../../data/content'
import { scene, subscribeScroll } from '../../lib/scene'
import { RevealText } from '../ui/RevealText'
import { ProcessIllustration } from './ProcessIcons'

/**
 * Section 4 — From Farm to Flavour. On desktop the journey is a pinned
 * horizontal track scrubbed by vertical scroll; on mobile it becomes a
 * vertical timeline. Illustrations draw themselves as each step arrives.
 */
export function ManufacturingSection() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const [horizontal, setHorizontal] = useState(false)

  // size the section so the horizontal travel maps 1:1 to vertical scroll
  useLayoutEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const apply = () => {
      const h = mq.matches
      setHorizontal(h)
      if (!section.current || !track.current) return
      if (h) {
        const travel = track.current.scrollWidth - window.innerWidth
        section.current.style.height = `${travel + window.innerHeight}px`
      } else {
        section.current.style.height = ''
      }
    }
    apply()
    const ro = new ResizeObserver(apply)
    if (track.current) ro.observe(track.current)
    mq.addEventListener('change', apply)
    window.addEventListener('resize', apply)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', apply)
      window.removeEventListener('resize', apply)
    }
  }, [])

  // scrub the track + progress line; draw illustrations as panels enter
  useEffect(() => {
    if (!horizontal) return
    const panels = Array.from(track.current?.querySelectorAll<HTMLElement>('[data-step]') ?? [])
    const drawn = new Set<number>()
    return subscribeScroll(() => {
      const t = track.current
      if (!t) return
      const p = scene.sections.process.progress
      const travel = t.scrollWidth - window.innerWidth
      t.style.transform = `translate3d(${-p * travel}px,0,0)`
      if (fill.current) fill.current.style.transform = `scaleX(${p})`
      panels.forEach((el, i) => {
        if (drawn.has(i)) return
        const r = el.getBoundingClientRect()
        if (r.left < window.innerWidth * 0.78) {
          drawn.add(i)
          drawPanel(el)
        }
      })
    })
  }, [horizontal])

  // mobile: draw on scroll-in
  useGSAP(
    () => {
      if (horizontal) return
      gsap.utils.toArray<HTMLElement>('[data-step]').forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true, onEnter: () => drawPanel(el) },
        })
      })
    },
    { scope: section, dependencies: [horizontal] },
  )

  return (
    <section
      id="process"
      ref={section}
      data-section="process"
      className="relative z-20 bg-cream text-ink"
      aria-label="From farm to flavour"
    >
      <div className={horizontal ? 'sticky top-0 h-svh overflow-hidden' : ''}>
        {/* paper texture + warm edge */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(232,163,58,0.18),transparent_55%),radial-gradient(ellipse_at_90%_100%,rgba(217,83,30,0.12),transparent_50%)]" />

        <div
          ref={track}
          className={`relative ${horizontal ? 'flex h-full w-max items-center gap-[6vw] pl-12 pr-[12vw] will-change-transform' : 'space-y-20 px-5 py-24 sm:px-8'}`}
        >
          {/* intro panel */}
          <div className={horizontal ? 'w-[38vw] shrink-0' : ''}>
            <p className="eyebrow !text-ember">04 — Manufacturing process</p>
            <RevealText
              className="display mt-5 text-[clamp(3rem,7vw,8rem)] text-ink"
              lines={[
                <span key="a">From farm</span>,
                <span key="b" className="italic text-ember">
                  to flavour.
                </span>,
              ]}
            />
            <p className="mt-8 max-w-md text-[1rem] leading-relaxed text-ink/70">
              Six careful steps stand between a sun-dried spice and the jar on your shelf. Each one exists to protect what matters
              most — colour, aroma and taste.
            </p>
            {horizontal && (
              <p className="mt-10 flex items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-ink/50">
                Keep scrolling
                <svg viewBox="0 0 30 10" className="h-2.5 w-8" aria-hidden>
                  <path d="M0 5h28M24 1l4 4-4 4" fill="none" stroke="currentColor" />
                </svg>
              </p>
            )}
          </div>

          {processSteps.map((s, i) => (
            <article
              key={s.title}
              data-step={i}
              className={`group relative ${
                horizontal ? 'grid h-[68vh] w-[min(30vw,460px)] shrink-0 grid-rows-[1fr_auto]' : 'grid gap-6 sm:grid-cols-[200px_1fr] sm:items-center'
              }`}
            >
              <div className={`relative ${horizontal ? '' : 'h-44 sm:h-40'}`}>
                <span
                  aria-hidden
                  className="display absolute -top-4 left-0 text-[clamp(6rem,11vw,11rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgba(27,18,12,0.14)]"
                >
                  0{i + 1}
                </span>
                <div className="relative h-full px-6 py-8 text-ink/80 [&_.accent]:text-ember">
                  <ProcessIllustration icon={s.icon} />
                </div>
              </div>
              <div className="border-t border-ink/15 pt-6">
                <p className="mb-2 font-brand text-xs tracking-[0.3em] text-ember">STEP 0{i + 1}</p>
                <h3 className="display text-[clamp(1.9rem,2.6vw,2.8rem)] text-ink">{s.title}</h3>
                <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-ink/65">{s.text}</p>
              </div>
            </article>
          ))}
        </div>

        {horizontal && (
          <div className="absolute inset-x-12 bottom-8 h-px bg-ink/10">
            <div ref={fill} className="h-full origin-left scale-x-0 bg-gradient-to-r from-saffron to-ember" />
          </div>
        )}
      </div>
    </section>
  )
}

function drawPanel(el: HTMLElement) {
  const paths = el.querySelectorAll<SVGPathElement>('.draw')
  if (scene.reducedMotion) {
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 0 })
    return
  }
  gsap.fromTo(
    paths,
    { strokeDasharray: 1, strokeDashoffset: 1 },
    { strokeDashoffset: 0, duration: 1.6, stagger: 0.08, ease: 'power2.inOut' },
  )
}
