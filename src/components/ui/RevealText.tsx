import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ElementType, type ReactNode } from 'react'
import { scene } from '../../lib/scene'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Props {
  lines: ReactNode[]
  as?: ElementType
  className?: string
  lineClassName?: string
  /** Animate when scrolled into view (default) or wait for `play`. */
  play?: boolean
  delay?: number
  stagger?: number
  start?: string
}

/** Headline whose lines slide up from behind a mask. */
export function RevealText({
  lines,
  as: Tag = 'h2',
  className = '',
  lineClassName = '',
  play,
  delay = 0,
  stagger = 0.1,
  start = 'top 82%',
}: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const inners = ref.current?.querySelectorAll('.line-inner')
      if (!inners) return
      if (scene.reducedMotion) {
        gsap.set(inners, { yPercent: 0, opacity: 1 })
        return
      }
      // explicit from → to so the tween is self-contained (robust to React
      // StrictMode re-running effects and to ScrollTrigger refreshes)
      const from = { yPercent: 115, rotate: 2 }
      if (play === undefined) {
        gsap.fromTo(inners, from, {
          yPercent: 0,
          rotate: 0,
          duration: 1.3,
          ease: 'expo.out',
          stagger,
          delay,
          immediateRender: true,
          scrollTrigger: { trigger: ref.current, start, once: true },
        })
      } else if (play) {
        gsap.fromTo(inners, from, { yPercent: 0, rotate: 0, duration: 1.5, ease: 'expo.out', stagger, delay, immediateRender: true })
      } else {
        gsap.set(inners, from)
      }
    },
    { scope: ref, dependencies: [play] },
  )

  return (
    <Tag ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className={`line-mask ${lineClassName}`}>
          <span className="line-inner">{l}</span>
        </span>
      ))}
    </Tag>
  )
}

/** Fades + lifts children into view on scroll. */
export function FadeUp({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: ElementType
}) {
  const ref = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      if (scene.reducedMotion) return
      gsap.from(ref.current, {
        y: 40,
        opacity: 0,
        duration: 1.2,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      })
    },
    { scope: ref },
  )
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
