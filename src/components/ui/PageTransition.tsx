import { gsap } from 'gsap'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, type Location } from 'react-router-dom'
import { measureSections, scene } from '../../lib/scene'
import { scrollToTarget } from '../../lib/smoothScroll'
import { Emblem } from './Logo'

/**
 * Cinematic route change: a gold-edged curtain sweeps up, the page swaps
 * underneath while covered, then the curtain lifts away.
 */
export function PageTransition({ children }: { children: (location: Location) => ReactNode }) {
  const location = useLocation()
  const [shown, setShown] = useState(location)
  const curtain = useRef<HTMLDivElement>(null)
  const busy = useRef(false)

  useEffect(() => {
    if (location.key === shown.key) return
    const samePage = location.pathname === shown.pathname
    const swap = () => {
      setShown(location)
      requestAnimationFrame(() => {
        if (!samePage && !location.hash) scrollToTarget(0, true)
        requestAnimationFrame(() => {
          measureSections()
          if (location.hash) scrollToTarget(location.hash)
        })
      })
    }
    if (samePage || scene.reducedMotion || busy.current) {
      swap()
      return
    }
    busy.current = true
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false
      },
    })
    tl.set(curtain.current, { display: 'flex', yPercent: 100 })
      .to(curtain.current, { yPercent: 0, duration: 0.6, ease: 'expo.inOut' })
      .fromTo('.curtain-mark', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.35 }, '-=0.25')
      .add(swap)
      .to(curtain.current, { yPercent: -100, duration: 0.75, ease: 'expo.inOut', delay: 0.18 })
      .set(curtain.current, { display: 'none' })
  }, [location, shown])

  return (
    <>
      {children(shown)}
      <div
        ref={curtain}
        aria-hidden
        className="fixed inset-0 z-[85] hidden items-center justify-center bg-coal"
        style={{ boxShadow: '0 -2px 0 #d4a24c, 0 2px 0 #d4a24c' }}
      >
        <div className="curtain-mark flex flex-col items-center gap-4">
          <Emblem className="h-16 w-16" animated />
          <p className="font-brand text-sm tracking-[0.5em] gold-text">SPICES</p>
        </div>
      </div>
    </>
  )
}
