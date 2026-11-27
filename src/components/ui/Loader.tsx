import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import { Emblem } from './Logo'

/**
 * Opening curtain. Counts up while fonts and the 3D scene warm up, then
 * splits open like a lid to reveal the hero.
 */
export function Loader({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const progress = useRef({ v: 0 })
  const done = useRef(false)

  // creep toward 85% while waiting
  useEffect(() => {
    const tw = gsap.to(progress.current, {
      v: 85,
      duration: 2.4,
      ease: 'power2.out',
      onUpdate: () => {
        if (count.current) count.current.textContent = String(Math.round(progress.current.v)).padStart(3, '0')
        if (bar.current) bar.current.style.transform = `scaleX(${progress.current.v / 100})`
      },
    })
    return () => {
      tw.kill()
    }
  }, [])

  useEffect(() => {
    if (!ready || done.current) return
    done.current = true
    const tl = gsap.timeline({ onComplete: onDone })
    tl.to(progress.current, {
      v: 100,
      duration: 0.7,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (count.current) count.current.textContent = String(Math.round(progress.current.v)).padStart(3, '0')
        if (bar.current) bar.current.style.transform = `scaleX(${progress.current.v / 100})`
      },
    })
      .to('.loader-content', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.in' }, '+=0.15')
      .to('.loader-top', { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '-=0.1')
      .to('.loader-bottom', { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, '<')
      .set(root.current, { display: 'none' })
  }, [ready, onDone])

  return (
    <div ref={root} className="fixed inset-0 z-[90]" role="status" aria-live="polite" aria-label="Loading 12 SPICES">
      <div className="loader-top absolute inset-x-0 top-0 h-1/2 bg-coal" />
      <div className="loader-bottom absolute inset-x-0 bottom-0 h-1/2 bg-coal" />
      <div className="loader-content absolute inset-0 flex flex-col items-center justify-center gap-6">
        <Emblem className="h-20 w-20" animated />
        <div className="text-center">
          <p className="font-brand text-3xl tracking-[0.3em] gold-text sm:text-4xl">12 SPICES</p>
          <p className="mt-2 text-[0.6rem] font-bold tracking-[0.35em] text-cream/50">MASALA &amp; WHOLE SPICES</p>
        </div>
        <div className="mt-4 h-px w-48 overflow-hidden bg-cream/10">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-ember to-gold-soft" />
        </div>
        <p className="font-sans text-[0.65rem] tracking-[0.4em] text-cream-dim">
          <span ref={count}>000</span> — AWAKENING THE SPICES
        </p>
      </div>
    </div>
  )
}
