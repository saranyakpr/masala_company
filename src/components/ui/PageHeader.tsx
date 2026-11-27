import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useRef, type ReactNode } from 'react'
import { scene } from '../../lib/scene'
import { Emblem } from './Logo'
import { RevealText } from './RevealText'

/** Cinematic page opener used by every inner page. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
  glow = '#d9531e',
}: {
  eyebrow: string
  title: ReactNode[]
  intro?: string
  children?: ReactNode
  glow?: string
}) {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (scene.reducedMotion) return
      gsap.from('.ph-fade', { opacity: 0, y: 24, duration: 1.1, stagger: 0.1, ease: 'power3.out', delay: 0.5 })
      gsap.to('.ph-emblem', {
        rotate: 90,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root },
  )
  return (
    <header ref={root} className="relative overflow-hidden px-5 pb-16 pt-36 sm:px-8 lg:px-12 lg:pb-24 lg:pt-44">
      <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 70% at 80% 0%, ${glow}2a, transparent 70%)` }} />
      <div aria-hidden className="beam absolute -top-[30%] right-[10%] h-[120%] w-[70%] opacity-60" />
      <Emblem className="ph-emblem pointer-events-none absolute -right-24 top-16 h-[28rem] w-[28rem] opacity-[0.07] lg:right-8" />
      <div className="relative mx-auto max-w-[1600px]">
        <p className="ph-fade eyebrow">{eyebrow}</p>
        <RevealText as="h1" play className="display mt-5 text-[clamp(3rem,8vw,8.5rem)] text-cream" delay={0.35} lines={title} />
        {intro && <p className="ph-fade mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-cream/65">{intro}</p>}
        {children && <div className="ph-fade mt-10">{children}</div>}
      </div>
    </header>
  )
}
