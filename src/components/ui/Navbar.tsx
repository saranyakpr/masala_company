import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { company } from '../../data/company'
import { navLinks } from '../../data/content'
import { cart, totals, useCart } from '../../lib/cart'
import { scene, subscribeScroll } from '../../lib/scene'
import { lockScroll } from '../../lib/smoothScroll'
import { Logo } from './Logo'

export function Navbar({ visible }: { visible: boolean }) {
  const bar = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const location = useLocation()
  const items = useCart()
  const count = totals(items).count
  const badge = useRef<HTMLSpanElement>(null)

  // hide on scroll down, reveal on scroll up; frosted after the first screen
  useEffect(() => {
    let lastY = 0
    let hidden = false
    return subscribeScroll(() => {
      const y = scene.scrollY
      const down = y > lastY + 4
      const up = y < lastY - 4
      if (down && y > scene.vh * 0.6 && !hidden) {
        hidden = true
        gsap.to(bar.current, { yPercent: -110, duration: 0.6, ease: 'power3.inOut' })
      } else if ((up || y < 80) && hidden) {
        hidden = false
        gsap.to(bar.current, { yPercent: 0, duration: 0.6, ease: 'power3.out' })
      }
      if (down || up) lastY = y
      setSolid(y > 40)
    })
  }, [])

  // always show the bar after navigating
  useEffect(() => {
    gsap.to(bar.current, { yPercent: 0, duration: 0.4 })
  }, [location.pathname])

  useEffect(() => {
    if (!visible) return
    gsap.fromTo(bar.current, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.4 })
  }, [visible])

  // pulse the bag when something is added
  useEffect(() => {
    if (count && badge.current && !scene.reducedMotion) gsap.fromTo(badge.current, { scale: 1.6 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
  }, [count])

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    gsap.fromTo('.menu-link', { yPercent: 120 }, { yPercent: 0, stagger: 0.06, duration: 0.9, ease: 'expo.out', delay: 0.15 })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `group relative py-2 text-[0.66rem] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
      isActive ? 'text-gold-soft' : 'text-cream/75 hover:text-cream'
    }`

  return (
    <>
      <a href="#main" className="sr-only z-[95] rounded bg-gold px-4 py-2 text-coal focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <header
        ref={bar}
        className={`fixed inset-x-0 top-0 z-50 opacity-0 transition-[background-color,backdrop-filter,border-color] duration-700 ${
          solid || open ? 'border-b border-cream/5 bg-coal/60 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <nav className="mx-auto flex h-18 max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Primary">
          <Link to="/" aria-label={`${company.name} — home`} data-cursor="hover">
            <Logo compact />
          </Link>
          <ul className="hidden items-center gap-7 xl:gap-9 lg:flex">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to === '/'} className={linkCls}>
                  {({ isActive }) => (
                    <>
                      {l.label}
                      <span
                        className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gold transition-transform duration-500 ease-[var(--ease-cinema)] ${
                          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => cart.openDrawer()}
              className="relative flex h-11 items-center gap-2 rounded-full border border-gold/40 px-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-cream transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-coal"
              aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8zM9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              <span ref={badge} className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-[0.6rem] text-cream">
                {count}
              </span>
            </button>
            <button
              className="relative flex h-11 w-11 items-center justify-center lg:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span className={`absolute h-px w-6 bg-cream transition-transform duration-500 ${open ? 'rotate-45' : '-translate-y-1'}`} />
              <span className={`absolute h-px w-6 bg-cream transition-transform duration-500 ${open ? '-rotate-45' : 'translate-y-1'}`} />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-coal/97 px-6 pb-10 pt-28 backdrop-blur-xl transition-[clip-path] duration-700 ease-[var(--ease-cinema)] lg:hidden ${
          open ? '[clip-path:inset(0_0_0_0)]' : 'pointer-events-none [clip-path:inset(0_0_100%_0)]'
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <ul className="space-y-1">
          {navLinks.map((l, i) => (
            <li key={l.to} className="overflow-hidden">
              <NavLink
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `menu-link display flex items-baseline gap-4 text-[2.6rem] ${isActive ? 'text-gold-soft' : 'text-cream'}`}
              >
                <span className="font-sans text-xs tracking-widest text-gold">0{i + 1}</span>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="eyebrow">{company.tagline}</p>
      </div>
    </>
  )
}
