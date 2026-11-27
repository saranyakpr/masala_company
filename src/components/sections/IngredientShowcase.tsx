import { useEffect, useRef, useState } from 'react'
import { ingredients } from '../../data/ingredients'
import { scene, subscribeScroll } from '../../lib/scene'
import { scrollToTarget } from '../../lib/smoothScroll'
import { ingredientIndex } from '../three/ingredientIndex'

/**
 * Section 5 — The Power of Authentic Ingredients. A tall sticky stage; the 3D
 * spice carousel lives in the WebGL layer (right), while the editorial copy
 * (left) and the index rail swap in sync with it.
 */
export function IngredientShowcase() {
  const [active, setActive] = useState(0)
  const section = useRef<HTMLElement>(null)
  const progress = useRef<HTMLDivElement>(null)

  useEffect(
    () =>
      subscribeScroll(() => {
        const i = Math.round(ingredientIndex())
        setActive(i)
        if (progress.current) progress.current.style.transform = `scaleY(${scene.sections.ingredients.progress})`
      }),
    [],
  )

  const jumpTo = (i: number) => {
    const s = scene.sections.ingredients
    const span = s.height - scene.vh
    scrollToTarget(s.top + ((i + 0.5) / ingredients.length) * span)
  }

  const ing = ingredients[active]

  return (
    <section
      id="ingredients"
      ref={section}
      data-section="ingredients"
      className="relative"
      style={{ height: `${ingredients.length * 85 + 100}vh` }}
      aria-label="The power of authentic ingredients"
    >
      {/* background layer — stays below the WebGL canvas */}
      <div aria-hidden className="absolute inset-0 bg-[#0d0806]">
        <div className="sticky top-0 h-svh overflow-hidden">
          {ingredients.map((g, i) => (
            <div
              key={g.kind}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                opacity: i === active ? 1 : 0,
                background: `radial-gradient(ellipse 50% 60% at ${scene.isMobile ? '50% 30%' : '68% 50%'}, ${g.glow}40, transparent 70%)`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6))]" />
        </div>
      </div>

      {/* content layer — above the canvas */}
      <div className="sticky top-0 z-20 flex h-svh flex-col justify-end px-5 pb-10 pt-24 sm:px-8 md:justify-center md:pb-0 lg:px-12">
        <div className="mx-auto grid w-full max-w-[1600px] gap-10 md:grid-cols-[1fr_1fr]">
          <div className="bg-gradient-to-t from-[#0d0806] via-[#0d0806]/80 to-transparent pt-10 md:bg-none md:pt-0">
            <p className="eyebrow">03 — Quality & sourcing</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/55">
              Great masala begins long before the grinder — with whole spices that carry their own colour, oil and perfume.
            </p>

            <div className="relative mt-8 md:mt-14" aria-live="polite">
              <p className="font-brand text-sm tracking-[0.3em] text-gold">
                {String(active + 1).padStart(2, '0')} <span className="text-cream/30">/ 0{ingredients.length}</span>
              </p>
              <div className="relative mt-2 h-[clamp(4.2rem,8.5vw,9rem)] overflow-hidden">
                {ingredients.map((g, i) => (
                  <h3
                    key={g.kind}
                    className="display absolute inset-x-0 top-0 whitespace-nowrap text-[clamp(3.4rem,7.5vw,8rem)] text-cream transition-all duration-[900ms] ease-[var(--ease-cinema)]"
                    style={{
                      transform: `translateY(${(i - active) * 105}%)`,
                      opacity: i === active ? 1 : 0,
                    }}
                    aria-hidden={i !== active}
                  >
                    {g.name}
                  </h3>
                ))}
              </div>
              <p key={`b-${active}`} className="mt-2 font-display text-xl italic" style={{ color: ing.glow }}>
                {ing.botanical}
              </p>
              <p className="mt-6 max-w-md min-h-[5.5rem] text-[0.98rem] leading-relaxed text-cream/75">{ing.description}</p>
              <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-cream/50">{ing.note}</p>
            </div>
          </div>
        </div>

        {/* index rail */}
        <nav
          className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-stretch gap-4 sm:right-8 md:flex lg:right-12"
          aria-label="Ingredients"
        >
          <div className="relative w-px bg-cream/10">
            <div ref={progress} className="absolute inset-0 origin-top scale-y-0 bg-gold" />
          </div>
          <ul className="space-y-4">
            {ingredients.map((g, i) => (
              <li key={g.kind}>
                <button
                  onClick={() => jumpTo(i)}
                  className={`text-left text-[0.65rem] font-bold uppercase tracking-[0.25em] transition-colors duration-500 ${
                    i === active ? 'text-gold-soft' : 'text-cream/35 hover:text-cream/70'
                  }`}
                  aria-current={i === active ? 'true' : undefined}
                >
                  {g.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
