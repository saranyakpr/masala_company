import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SplitText } from '@/animations/SplitText';
import { easePremium } from '@/animations/variants';
import { cn } from '@/utils/cn';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  accentWords?: number[];
  breadcrumb?: { label: string; to?: string }[];
  /** Optional visual column (3D canvas, illustration). */
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Shared dark editorial hero for inner pages — keeps every page on the same visual standard. */
export function PageHero({ eyebrow, title, description, accentWords, breadcrumb, aside, children, className }: PageHeroProps) {
  return (
    <section className={cn('grain-light relative overflow-hidden bg-burgundy-deep text-ivory', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(163,23,28,0.55), transparent 65%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-60 -left-40 h-[36rem] w-[36rem] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(201,154,62,0.45), transparent 65%)' }}
      />

      <div className={cn('container-x relative grid gap-12 pb-20 pt-36 lg:pb-28 lg:pt-44', aside && 'lg:grid-cols-12 lg:items-center')}>
        <div className={cn(aside ? 'lg:col-span-7' : 'max-w-5xl')}>
          {breadcrumb && (
            <motion.nav
              aria-label="Breadcrumb"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-ivory/50">
                {breadcrumb.map((b, i) => (
                  <li key={b.label} className="flex items-center gap-2">
                    {b.to ? (
                      <Link to={b.to} className="hover:text-ivory">
                        {b.label}
                      </Link>
                    ) : (
                      <span aria-current="page" className="text-ivory/80">
                        {b.label}
                      </span>
                    )}
                    {i < breadcrumb.length - 1 && <ChevronRight aria-hidden="true" className="h-3 w-3" />}
                  </li>
                ))}
              </ol>
            </motion.nav>
          )}
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easePremium, delay: 0.35 }}
            className="eyebrow flex items-center gap-3 text-gold-light"
          >
            <span aria-hidden="true" className="h-px w-8 bg-gold-light/60" />
            {eyebrow}
          </motion.span>
          <SplitText
            as="h1"
            immediate
            delay={0.4}
            text={title}
            accentWords={accentWords}
            accentClassName="italic text-gold-light"
            className="mt-6 text-display text-balance"
          />
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: easePremium, delay: 0.85 }}
              className="mt-8 max-w-xl text-lg leading-relaxed text-ivory/70"
            >
              {description}
            </motion.p>
          )}
          {children}
        </div>
        {aside && <div className="relative lg:col-span-5">{aside}</div>}
      </div>
    </section>
  );
}
