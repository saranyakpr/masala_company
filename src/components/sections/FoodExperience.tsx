import { useEffect, useRef, useState } from 'react'
import { dishes } from '../../data/content'
import { products } from '../../data/products'
import { clamp, easeOut, smoothstep } from '../../lib/math'
import { scene, subscribeScroll } from '../../lib/scene'
import { useNavigate } from 'react-router-dom'
import { RevealText } from '../ui/RevealText'
import { DishArt } from './DishArt'

/**
 * Section 7 — Food Transformation. Pinned stage; for each dish the plain,
 * unspiced version is transformed as masala rains onto the plate and the
 * colour spreads outward from the centre. Steam rises once it is "cooked".
 */
export function FoodExperience() {
  const [active, setActive] = useState(0)
  const clips = useRef<(SVGCircleElement | null)[]>([])
  const sprinkles = useRef<(SVGGElement | null)[]>([])
  const plate = useRef<HTMLDivElement>(null)
  const steam = useRef<SVGSVGElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(
    () =>
      subscribeScroll(() => {
        const sec = scene.sections.food
        if (sec.enter <= 0 || sec.exit >= 1) return
        const seg = sec.progress * dishes.length
        const i = Math.min(dishes.length - 1, Math.floor(seg))
        const local = clamp(seg - i)
        setActive(i)
        const t = smoothstep(0.18, 0.62, local)

        dishes.forEach((_, k) => {
          const c = clips.current[k]
          // earlier dishes stay transformed, later ones reset
          const tk = k < i ? 1 : k > i ? 0 : t
          if (c) c.setAttribute('r', String(easeOut(tk) * 175))
          const g = sprinkles.current[k]
          if (g && k === i) {
            const fall = clamp((local - 0.04) / 0.5)
            for (const el of Array.from(g.children) as SVGCircleElement[]) {
              const d = Number(el.dataset.d)
              const f = clamp((fall - d) / 0.45)
              el.setAttribute('transform', `translate(0 ${(-260 * (1 - easeOut(f))).toFixed(1)})`)
              el.setAttribute('opacity', String(f > 0 && f < 1 ? 1 : f >= 1 ? Math.max(0, 1 - (local - 0.6) * 6) : 0))
            }
          }
        })
        if (plate.current) plate.current.style.transform = `rotate(${(sec.progress * 140 - 20).toFixed(2)}deg)`
        if (steam.current) steam.current.style.opacity = String(smoothstep(0.5, 0.75, local))
        if (bar.current) bar.current.style.transform = `scaleX(${sec.progress})`
      }),
    [],
  )

  const productColor = (id: string) => products.find((p) => p.id === id)?.powder ?? '#d8461c'

  return (
    <section
      id="food"
      data-section="food"
      className="relative z-20 bg-[#0d0806]"
      style={{ height: `${dishes.length * 110 + 100}vh` }}
      aria-label="Every dish has a story"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_45%_55%_at_65%_55%,rgba(217,83,30,0.16),transparent_70%)]" />

        <div className="relative mx-auto grid h-full max-w-[1600px] grid-rows-[auto_1fr_auto] px-5 pb-8 pt-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:grid-rows-[1fr_auto] lg:px-12 lg:pt-28">
          <div className="lg:self-center">
            <p className="eyebrow">05 — Food transformation</p>
            <RevealText
              className="display mt-4 text-[clamp(2.3rem,5vw,5.4rem)] text-cream"
              lines={[
                <span key="a">Every dish has a story.</span>,
                <span key="b" className="italic gold-text">
                  Make yours unforgettable.
                </span>,
              ]}
            />

            <div className="relative mt-10 hidden min-h-[13rem] lg:block" aria-live="polite">
              {dishes.map((d, i) => (
                <DishInfo key={d.id} d={d} visible={i === active} index={i} color={productColor(d.productId)} />
              ))}
            </div>
          </div>

          {/* plate stage */}
          <div className="relative flex items-center justify-center py-4 lg:row-span-2">
            <div className="relative aspect-square h-auto w-[min(86vw,46svh)] lg:w-[min(42vw,68svh)]">
              <svg ref={steam} viewBox="0 0 200 120" className="steam pointer-events-none absolute -top-[22%] left-1/2 z-10 w-1/2 -translate-x-1/2 opacity-0" aria-hidden>
                <path d="M60 110c-10-20 10-30 0-50s10-30 0-50" stroke="#fff" strokeOpacity="0.35" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M100 110c-10-20 10-30 0-50s10-30 0-50" stroke="#fff" strokeOpacity="0.3" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M140 110c-10-20 10-30 0-50s10-30 0-50" stroke="#fff" strokeOpacity="0.35" strokeWidth="6" fill="none" strokeLinecap="round" />
              </svg>
              <div ref={plate} className="absolute inset-0 will-change-transform">
                {dishes.map((d, i) => (
                  <div
                    key={d.id}
                    className="absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[var(--ease-cinema)]"
                    style={{ opacity: i === active ? 1 : 0, transform: `scale(${i === active ? 1 : 0.86})` }}
                    aria-hidden={i !== active}
                  >
                    <DishArt
                      dish={d}
                      clipRef={(el) => {
                        clips.current[i] = el
                      }}
                      sprinkleRef={(el) => {
                        sprinkles.current[i] = el
                      }}
                      sprinkleColor={productColor(d.productId)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* mobile info */}
          <div className="relative min-h-[11rem] lg:hidden" aria-live="polite">
            {dishes.map((d, i) => (
              <DishInfo key={d.id} d={d} visible={i === active} index={i} color={productColor(d.productId)} compact />
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="h-px w-48 bg-cream/10">
              <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-gold to-ember" />
            </div>
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.3em] text-cream/40">
              {String(active + 1).padStart(2, '0')} / {String(dishes.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  )

}

function DishInfo({
  d,
  visible,
  index,
  color,
  compact,
}: {
  d: (typeof dishes)[number]
  visible: boolean
  index: number
  color: string
  compact?: boolean
}) {
  const navigate = useNavigate()
  return (
    <div
      className={`absolute inset-0 transition-all duration-700 ease-[var(--ease-cinema)] ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <p className="font-brand text-xs tracking-[0.3em] text-gold">DISH 0{index + 1}</p>
      <h3 className={`display mt-2 text-cream ${compact ? 'text-4xl' : 'text-5xl'}`}>{d.name}</h3>
      <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-cream/65">{d.story}</p>
      <button
        onClick={() => {
          navigate(`/shop/${d.productId}`)
        }}
        className="group mt-5 inline-flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.25em] text-cream"
        tabIndex={visible ? 0 : -1}
      >
        <span className="h-3 w-3 rounded-full" style={{ background: color }} />
        Made with {d.productName}
        <span className="h-px w-8 bg-gold transition-all duration-500 group-hover:w-14" />
      </button>
    </div>
  )
}

