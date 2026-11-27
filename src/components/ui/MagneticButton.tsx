import { gsap } from 'gsap'
import { useRef, type ReactNode } from 'react'
import { scene } from '../../lib/scene'

interface Props {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'solid' | 'ghost'
  className?: string
  ariaLabel?: string
  type?: 'button' | 'submit'
}

/**
 * Premium CTA: magnetically drawn toward the pointer, with a liquid fill
 * that rises on hover. Falls back to a plain button on touch devices.
 */
export function MagneticButton({ children, onClick, href, variant = 'solid', className = '', ariaLabel, type = 'button' }: Props) {
  const ref = useRef<HTMLElement>(null)
  const inner = useRef<HTMLSpanElement>(null)

  const move = (e: React.PointerEvent) => {
    if (scene.isTouch || scene.reducedMotion || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - (r.left + r.width / 2)
    const y = e.clientY - (r.top + r.height / 2)
    gsap.to(ref.current, { x: x * 0.28, y: y * 0.38, duration: 0.6, ease: 'power3.out' })
    gsap.to(inner.current, { x: x * 0.12, y: y * 0.16, duration: 0.6, ease: 'power3.out' })
  }
  const leave = () => {
    gsap.to([ref.current, inner.current], { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
  }

  const base =
    'group relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-3.5 text-[0.66rem] sm:py-4 sm:text-[0.72rem] font-bold uppercase tracking-[0.22em] transition-colors duration-500 sm:px-9'
  const styles =
    variant === 'solid'
      ? 'bg-gradient-to-b from-[#f0cf7e] via-gold to-[#b8862f] text-coal shadow-[0_10px_40px_-10px_rgba(232,163,58,0.6)]'
      : 'border border-gold/50 text-cream hover:text-coal'

  const content = (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 translate-y-[101%] rounded-full transition-transform duration-700 ease-[var(--ease-cinema)] group-hover:translate-y-0 ${
          variant === 'solid' ? 'bg-cream' : 'bg-gradient-to-b from-[#f0cf7e] to-gold'
        }`}
      />
      <span ref={inner} className="relative z-10 flex items-center gap-3">
        {children}
        <svg viewBox="0 0 16 16" className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-1" aria-hidden>
          <path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
    </>
  )

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault()
            onClick()
          }
        }}
        onPointerMove={move}
        onPointerLeave={leave}
        className={`${base} ${styles} ${className}`}
        aria-label={ariaLabel}
        data-cursor="hover"
      >
        {content}
      </a>
    )
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`${base} ${styles} ${className}`}
      aria-label={ariaLabel}
      data-cursor="hover"
    >
      {content}
    </button>
  )
}
