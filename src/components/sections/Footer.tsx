import { Link } from 'react-router-dom'
import { company } from '../../data/company'
import { navLinks } from '../../data/content'
import { blendProducts, spiceProducts } from '../../data/products'
import { scrollToTarget } from '../../lib/smoothScroll'
import { Logo } from '../ui/Logo'

const year = new Date().getFullYear()

/** Premium footer with a slow spice marquee. */
export function Footer() {
  const marquee = [...spiceProducts, ...blendProducts].map((p) => p.name)

  return (
    <footer className="relative z-20 overflow-hidden border-t border-cream/5 bg-[#080605] pt-16">
      <div className="relative flex overflow-hidden py-6" aria-hidden>
        <div className="marquee flex shrink-0 gap-12 whitespace-nowrap pr-12">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="display flex items-center gap-12 text-[clamp(3rem,8vw,7.5rem)] italic outline-text">
              {m}
              <span className="h-3 w-3 rounded-full bg-ember/70" />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-[1600px] gap-12 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:px-12">
        <div>
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/55">{company.about}</p>
          <p className="mt-6 font-display text-xl italic text-gold-soft">{company.tagline}</p>
        </div>

        <nav aria-label="Our spices">
          <p className="eyebrow mb-5 text-[0.62rem]">Our spices</p>
          <ul className="space-y-2.5 text-sm">
            {spiceProducts.map((p) => (
              <li key={p.id}>
                <Link to={`/shop/${p.id}`} className="text-cream/60 transition-colors hover:text-cream">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Our blends">
          <p className="eyebrow mb-5 text-[0.62rem]">Our blends</p>
          <ul className="space-y-2.5 text-sm">
            {blendProducts.map((p) => (
              <li key={p.id}>
                <Link to={`/shop/${p.id}`} className="text-cream/60 transition-colors hover:text-cream">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mb-5 mt-10 text-[0.62rem]">Explore</p>
          <ul className="space-y-2.5 text-sm">
            {[...navLinks, { label: 'Cart', to: '/cart' }].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-cream/60 transition-colors hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-5 text-[0.62rem]">Contact</p>
          <ul className="space-y-2.5 text-sm text-cream/60">
            {company.email && (
              <li>
                <a href={`mailto:${company.email}`} className="transition-colors hover:text-cream">
                  {company.email}
                </a>
              </li>
            )}
            {company.phone && (
              <li>
                <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-cream">
                  {company.phone}
                </a>
              </li>
            )}
            {company.address && <li className="max-w-[14rem]">{company.address}</li>}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-5 text-[0.62rem]">Follow</p>
          <ul className="space-y-2.5 text-sm">
            {company.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className="group relative text-cream/60 transition-colors hover:text-cream"
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                >
                  {s.label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="shimmer-line h-px" />
        <div className="flex flex-col gap-4 py-8 text-xs text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.name}. All rights reserved.
          </p>
          <button onClick={() => scrollToTarget(0)} className="group flex items-center gap-3 uppercase tracking-[0.25em] transition-colors hover:text-cream">
            Back to top
            <svg viewBox="0 0 10 14" className="h-3 w-2.5 transition-transform duration-500 group-hover:-translate-y-1" aria-hidden>
              <path d="M5 13V1M1 5l4-4 4 4" fill="none" stroke="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}
