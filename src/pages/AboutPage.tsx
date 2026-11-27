import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IngredientShowcase } from '../components/sections/IngredientShowcase'
import { ManufacturingSection } from '../components/sections/ManufacturingSection'
import { WhyChooseUs } from '../components/sections/WhyChooseUs'
import { Emblem } from '../components/ui/Logo'
import { MagneticButton } from '../components/ui/MagneticButton'
import { PageHeader } from '../components/ui/PageHeader'
import { FadeUp, RevealText } from '../components/ui/RevealText'
import { company } from '../data/company'
import { spiceProducts } from '../data/products'
import { scene } from '../lib/scene'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/**
 * ⚠️ Journey copy is written as brand philosophy, not company history.
 * Replace with your real milestones (founding year, first product, etc.).
 */
const journey = [
  {
    k: 'The idea',
    title: 'Flavour without compromise',
    text: 'It started with a simple belief: the spices in your kitchen should taste the way they do where they are grown — bold, fragrant and true.',
  },
  {
    k: 'The twelve',
    title: 'Twelve essentials',
    text: 'We chose the twelve spices that do the most work in an Indian kitchen and set out to make each one the best version of itself.',
  },
  {
    k: 'The blends',
    title: 'Signature masalas',
    text: 'From those twelve came our blends — garam, chicken, mutton, biryani, sambar and rasam — each balanced for the dish it is named after.',
  },
  {
    k: 'Today',
    title: 'From our jar to your table',
    text: 'Every jar carries the same promise: authentic flavours and extraordinary taste, packed with care for the way you cook.',
  },
]

function BrandStory() {
  const ring = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      if (scene.reducedMotion) return
      gsap.from('.story-dot', {
        scale: 0,
        opacity: 0,
        stagger: 0.07,
        duration: 0.8,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: ring.current, start: 'top 75%', once: true },
      })
    },
    { scope: ring },
  )
  return (
    <section className="relative z-20 bg-[#0d0806] px-5 py-24 sm:px-8 lg:px-12 lg:py-36" aria-label="Brand story">
      <div className="mx-auto grid max-w-[1600px] items-center gap-16 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow">01 — Brand story</p>
          <RevealText
            className="display mt-5 text-[clamp(2.6rem,5vw,5.4rem)] text-cream"
            lines={[<span key="a">Why twelve?</span>, <span key="b" className="italic gold-text">Because every dish begins here.</span>]}
          />
          <FadeUp className="mt-8 max-w-xl space-y-5 text-[1rem] leading-relaxed text-cream/65">
            <p>
              Look inside any Indian masala box and you will find the same essentials: turmeric for colour, chilli for fire, coriander for body,
              cumin and mustard for the first crackle in hot oil, and the warm spices — cardamom, cinnamon, cloves — for fragrance.
            </p>
            <p>
              {company.name} is built around those twelve. We treat each one as the hero it is, and blend them into masalas that make cooking
              confident and the results unforgettable.
            </p>
          </FadeUp>
        </div>

        {/* the twelve, as a ring */}
        <div ref={ring} className="relative mx-auto aspect-square w-full max-w-[560px]">
          <Emblem className="absolute inset-[28%] opacity-90" />
          {spiceProducts.map((p, i) => {
            const a = (i / spiceProducts.length) * Math.PI * 2 - Math.PI / 2
            return (
              <div
                key={p.id}
                className="story-dot absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center"
                style={{ left: `${50 + Math.cos(a) * 42}%`, top: `${50 + Math.sin(a) * 42}%` }}
              >
                <span
                  className="h-5 w-5 rounded-full ring-1 ring-cream/20 sm:h-7 sm:w-7"
                  style={{ background: `radial-gradient(circle at 35% 30%, #fff8, ${p.powder} 45%, ${p.powderDeep})` }}
                />
                <span className="hidden max-w-[6rem] text-[0.55rem] font-bold uppercase leading-tight tracking-[0.15em] text-cream/60 sm:block">{p.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Journey() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (scene.reducedMotion) return
      gsap.fromTo('.journey-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 60%', end: 'bottom 70%', scrub: true } })
      gsap.utils.toArray<HTMLElement>('.journey-item').forEach((el) => {
        gsap.from(el, { opacity: 0, x: -40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%', once: true } })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative z-20 bg-cream px-5 py-24 text-ink sm:px-8 lg:px-12 lg:py-36" aria-label="Our journey">
      <div className="mx-auto grid max-w-[1600px] gap-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow !text-ember">02 — Our journey</p>
          <RevealText
            className="display mt-5 text-[clamp(2.6rem,5vw,5.4rem)] text-ink"
            lines={[<span key="a">A journey</span>, <span key="b" className="italic text-ember">measured in flavour.</span>]}
          />
        </div>
        <ol className="relative space-y-16 pl-10">
          <span className="absolute left-0 top-0 h-full w-px bg-ink/10" aria-hidden />
          <span className="journey-line absolute left-0 top-0 h-full w-px origin-top bg-gradient-to-b from-saffron to-ember" aria-hidden />
          {journey.map((j, i) => (
            <li key={j.k} className="journey-item relative">
              <span className="absolute -left-10 top-2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border border-ember bg-cream">
                <span className="h-1.5 w-1.5 rounded-full bg-ember" />
              </span>
              <p className="font-brand text-xs tracking-[0.3em] text-ember">
                0{i + 1} · {j.k.toUpperCase()}
              </p>
              <h3 className="display mt-3 text-[clamp(2rem,3vw,3rem)] text-ink">{j.title}</h3>
              <p className="mt-3 max-w-lg text-[1rem] leading-relaxed text-ink/65">{j.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default function AboutPage() {
  useDocumentTitle('About Us', `The story behind ${company.name}: twelve essential spices, six signature blends, careful sourcing and an uncompromising process.`)
  const navigate = useNavigate()
  return (
    <>
      <div className="relative z-20 bg-coal">
        <PageHeader
          eyebrow="About us"
          title={[<span key="a">The story of</span>, <span key="b" className="italic gold-text">12 Spices.</span>]}
          intro={`${company.tagline} ${company.about}`}
        />
      </div>
      <BrandStory />
      <Journey />
      <IngredientShowcase />
      <ManufacturingSection />
      <WhyChooseUs />
      <section className="relative z-20 bg-coal px-5 py-28 text-center sm:px-8" aria-label="Shop">
        <Emblem className="mx-auto h-16 w-16" animated />
        <RevealText
          className="display mx-auto mt-6 max-w-4xl text-[clamp(2.4rem,5vw,5rem)] text-cream"
          lines={[<span key="a">Taste the difference</span>, <span key="b" className="italic gold-text">in your own kitchen.</span>]}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <MagneticButton onClick={() => navigate('/shop')}>Shop now</MagneticButton>
          <MagneticButton variant="ghost" onClick={() => navigate('/contact')}>
            Contact us
          </MagneticButton>
        </div>
      </section>
    </>
  )
}
