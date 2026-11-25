import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/types';
import { getCategory } from '@/data/categories';
import { PackVisual } from './PackVisual';
import { HeatMeter } from '@/components/ui/HeatMeter';
import { easePremium } from '@/animations/variants';
import { cn } from '@/utils/cn';

interface ProductCardProps {
  product: Product;
  index?: number;
  tone?: 'dark' | 'light';
}

export function ProductCard({ product, index = 0, tone = 'light' }: ProductCardProps) {
  const category = getCategory(product.category);
  const dark = tone === 'dark';
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: easePremium, delay: (index % 4) * 0.08 }}
      className="group relative"
    >
      <Link
        to={`/products/${product.slug}`}
        className="block focus-visible:outline-offset-8"
        aria-label={`${product.name} — view product details`}
      >
        <div
          className={cn(
            'relative aspect-[4/5] overflow-hidden',
            dark ? 'bg-burgundy' : 'bg-sand/60',
          )}
        >
          {/* backdrop disc in the spice colour */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[54%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-2xl transition-all duration-700 ease-[var(--ease-premium)] group-hover:scale-125 group-hover:opacity-45"
            style={{ background: product.palette.spice }}
          />
          <div className="absolute inset-x-[16%] bottom-[7%] top-[9%] transition-transform duration-700 ease-[var(--ease-premium)] group-hover:-translate-y-3 group-hover:rotate-[-2deg] group-hover:scale-[1.04]">
            <PackVisual product={product} />
          </div>
          <span
            className={cn(
              'eyebrow absolute left-4 top-4 text-[0.62rem]',
              dark ? 'text-ivory/60' : 'text-ink-soft/60',
            )}
          >
            {category?.name}
          </span>
          <span
            aria-hidden="true"
            className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-ink text-ivory opacity-0 transition-all duration-500 ease-[var(--ease-premium)] group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 pt-5">
          <div className="min-w-0">
            <h3 className={cn('text-2xl leading-tight', dark ? 'text-ivory' : 'text-ink')}>
              <span className="link-underline">{product.name}</span>
            </h3>
            <p className={cn('mt-1 font-display text-sm italic', dark ? 'text-gold-light' : 'text-spice')}>{product.localName}</p>
          </div>
          <div className="pt-2">
            <HeatMeter level={product.heat} tone={dark ? 'light' : 'dark'} />
          </div>
        </div>
        <p className={cn('mt-3 max-w-sm text-sm leading-relaxed', dark ? 'text-ivory/65' : 'text-ink-soft/75')}>{product.short}</p>
      </Link>
    </motion.article>
  );
}
