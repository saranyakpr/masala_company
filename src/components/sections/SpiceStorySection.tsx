import { useEffect, useRef, useState } from 'react'
import { scene, subscribeScroll } from '../../lib/scene'
import { RevealText } from '../ui/RevealText'

const beats = [
  {
    k: 'Aroma',
    text: 'Open a jar and the kitchen changes. Colour rises, aroma blooms, and an ordinary pan becomes the beginning of something worth gathering around.',
  },
  {
    k: 'Character',
    text: 'Every spice has a personality — the warmth of turmeric, the fire of chilli, the citrus of coriander. Our craft is letting each one speak clearly.',
  },
  {
    k: 'Flavour',
    text: '12 SPICES brings twelve essential spices and six signature blends to your kitchen — authentic flavours and extraordinary taste, with nothing standing between you and the dish you want to make.',
  },
]

/**
 * Section 2 — sticky scene. While pinned, the jar (in WebGL) opens and pours
 * into a spice landscape; the copy advances through three beats driven by
 * the same scroll progress.
 *
 * Layering: background (below the canvas) and content (z-20, above it) are
 * separate sticky layers because `position: sticky` creates a stacking context.
 */
export function SpiceStorySection() {
  const [beat, setBeat] = useState(0)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(
    () =>
      subscribeScroll(() => {
        const p = scene.sections.story.progress
        setBeat(p < 0.36 ? 0 : p < 0.7 ? 1 : 2)
        if (bar.current) bar.current.style.transform = `scaleY(${p})`
      }),
    [],
  )

  return (
    <section id="story" data-section="story" className="relative h-[340vh]" aria-label="The Art of Flavour">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-coal via-[#140a05] to-[#1d0d05]">
        <div className="sticky top-0 h-svh bg-[radial-gradient(ellipse_50%_50%_at_75%_28%,rgba(217,83,30,0.2),transparent_70%)]" />
      </div>
      <div className="sticky top-0 z-20 flex h-svh items-end md:items-center">
        <div className="w-full bg-gradient-to-t from-coal/90 via-coal/50 to-transparent px-5 pb-10 pt-24 sm:px-8 md:bg-none md:pb-0 md:pt-0 lg:px-12">
          <div className="max-w-xl md:max-w-[min(46vw,640px)]">
            <p className="eyebrow mb-5">02 — Welcome to 12 SPICES</p>
            <RevealText
              className="display text-[clamp(2.6rem,6.4vw,6.4rem)] text-cream [text-shadow:0_4px_30px_rgba(0,0,0,0.6)]"
              lines={[
                <span key="1">It's not just spice.</span>,
                <span key="2" className="italic gold-text">
                  It's an experience.
                </span>,
              ]}
            />
            <div className="mt-8 flex gap-6 md:mt-12">
              <div className="relative w-px shrink-0 bg-cream/15">
                <div ref={bar} className="absolute inset-0 origin-top scale-y-0 bg-gradient-to-b from-gold to-ember" />
              </div>
              <div className="relative min-h-[10rem] flex-1 sm:min-h-[8.5rem]">
                {beats.map((b, i) => (
                  <div
                    key={b.k}
                    className={`absolute inset-0 transition-all duration-700 ease-[var(--ease-cinema)] ${
                      beat === i ? 'translate-y-0 opacity-100' : beat > i ? '-translate-y-6 opacity-0' : 'translate-y-6 opacity-0'
                    }`}
                    aria-hidden={beat !== i}
                  >
                    <p className="mb-3 font-brand text-sm tracking-[0.3em] text-gold">
                      0{i + 1} · {b.k.toUpperCase()}
                    </p>
                    <p className="max-w-md text-[0.98rem] leading-relaxed text-cream/80 [text-shadow:0_2px_16px_rgba(0,0,0,0.8)]">{b.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
