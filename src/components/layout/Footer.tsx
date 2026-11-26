import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { mainNav, site } from '@/data/site';
import { categories } from '@/data/categories';
import { Logo } from '@/components/common/Logo';
import { SocialLinks } from '@/components/common/SocialLinks';
import { Reveal } from '@/animations/Reveal';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="grain-light relative overflow-hidden bg-burgundy-deep text-ivory">
      <div className="container-x pt-20 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo tone="light" />
            <p className="mt-8 max-w-sm font-display text-2xl leading-snug text-ivory/85 lg:text-3xl">
              Spices that taste of <em className="text-gold-light">where they grew</em> — and of the care in between.
            </p>
            <SocialLinks className="mt-10" />
          </div>

          <nav aria-label="Footer — explore" className="lg:col-span-2">
            <h2 className="eyebrow text-gold-light">Explore</h2>
            <ul className="mt-6 space-y-3 text-[0.95rem] text-ivory/70">
              <li>
                <Link to="/" className="link-underline hover:text-ivory">
                  Home
                </Link>
              </li>
              {mainNav.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="link-underline hover:text-ivory">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer — products" className="lg:col-span-2">
            <h2 className="eyebrow text-gold-light">Range</h2>
            <ul className="mt-6 space-y-3 text-[0.95rem] text-ivory/70">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/products?category=${c.id}`} className="link-underline hover:text-ivory">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="link-underline hover:text-ivory">
                  All products
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="eyebrow text-gold-light">Get in touch</h2>
            <ul className="mt-6 space-y-4 text-[0.95rem] text-ivory/70">
              <li className="flex gap-3">
                <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  {site.contact.addressLines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </span>
              </li>
              <li>
                <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="flex gap-3 hover:text-ivory">
                  <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.contact.email}`} className="flex gap-3 break-all hover:text-ivory">
                  <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {site.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Reveal className="container-x mt-20 select-none overflow-hidden lg:mt-28">
        <p
          aria-hidden="true"
          className="font-display text-[22vw] leading-[0.78] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(228,193,122,0.35)] lg:text-[17vw]"
        >
          {site.wordmark.charAt(0) + site.wordmark.slice(1).toLowerCase()}
        </p>
      </Reveal>

      <div className="border-t border-ivory/10">
        <div className="container-x flex flex-col gap-4 pb-24 pt-7 text-xs text-ivory/50 md:flex-row md:items-center md:justify-between md:pb-7 md:pr-24">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="max-w-md md:text-center">Product photography supplied by the brand. Contact details shown are placeholders pending client confirmation.</p>
        </div>
      </div>
    </footer>
  );
}
