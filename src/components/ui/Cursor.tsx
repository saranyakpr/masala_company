import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'

/**
 * Custom cursor: a precise dot and a lagging ring that swells over
 * interactive elements and shows a label for drag targets.
 * Only mounted on fine-pointer devices without reduced motion.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    document.documentElement.classList.add('has-custom-cursor')
    const xDot = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' })
    const yDot = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' })
    const xRing = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' })
    const yRing = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' })
    let shown = false

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!shown) {
        shown = true
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 })
      }
      xDot(e.clientX)
      yDot(e.clientY)
      xRing(e.clientX)
      yRing(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor], input, textarea, select, label')
      const mode = t?.dataset.cursor
      const isText = t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)
      setLabel(mode && mode !== 'hover' ? mode : '')
      gsap.to(ring.current, {
        scale: t ? (mode && mode !== 'hover' ? 2.6 : isText ? 0.6 : 1.8) : 1,
        backgroundColor: t && !isText ? 'rgba(232,163,58,0.14)' : 'rgba(232,163,58,0)',
        duration: 0.4,
        ease: 'power3.out',
      })
      gsap.to(dot.current, { scale: t ? 0 : 1, duration: 0.25 })
    }
    const leave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3, onComplete: () => void (shown = false) })
    const down = () => gsap.to(ring.current, { scale: '-=0.3', duration: 0.15 })
    const up = () => gsap.to(ring.current, { scale: '+=0.3', duration: 0.3 })

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-saffron/70 opacity-0"
      >
        <span className="text-[0.32rem] font-bold uppercase tracking-[0.2em] text-cream">{label}</span>
      </div>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-saffron opacity-0"
      />
    </>
  )
}
