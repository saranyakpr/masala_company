import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { isMobileViewport } from './device'
import { measureSections, scene, updateScroll } from './scene'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function getLenis() {
  return lenis
}

/**
 * Starts Lenis (unless reduced motion is requested), wires it into GSAP's
 * ticker + ScrollTrigger, and feeds the scroll director.
 */
export function initSmoothScroll(reduced: boolean) {
  const onNativeScroll = () => updateScroll(window.scrollY, 0)

  if (reduced) {
    window.addEventListener('scroll', onNativeScroll, { passive: true })
  } else {
    lenis = new Lenis({ autoRaf: false, lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
    lenis.on('scroll', (l: Lenis) => {
      updateScroll(l.scroll, l.velocity)
      ScrollTrigger.update()
    })
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
  }

  let resizeRaf = 0
  const remeasure = () => {
    cancelAnimationFrame(resizeRaf)
    resizeRaf = requestAnimationFrame(() => {
      scene.isMobile = isMobileViewport()
      ScrollTrigger.refresh()
      measureSections()
    })
  }
  const ro = new ResizeObserver(remeasure)
  ro.observe(document.body)
  window.addEventListener('resize', remeasure)
  ScrollTrigger.addEventListener('refresh', measureSections)
  measureSections()

  return () => {
    window.removeEventListener('scroll', onNativeScroll)
    window.removeEventListener('resize', remeasure)
    ScrollTrigger.removeEventListener('refresh', measureSections)
    ro.disconnect()
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

function tick(time: number) {
  lenis?.raf(time * 1000)
}

export function scrollToTarget(target: string | number, immediate = false) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : null
  if (lenis) {
    lenis.scrollTo(el ?? (target as number), { duration: immediate ? 0 : 1.6, immediate, offset: 0 })
  } else {
    const top = el ? el.getBoundingClientRect().top + window.scrollY : (target as number)
    window.scrollTo({ top, behavior: scene.reducedMotion || immediate ? 'auto' : 'smooth' })
  }
}

export function lockScroll(lock: boolean) {
  if (lock) lenis?.stop()
  else lenis?.start()
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}
