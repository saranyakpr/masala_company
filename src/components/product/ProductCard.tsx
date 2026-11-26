import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/types';
import { getCategory } from '@/data/categories';
import { ProductPhoto } from './ProductPhoto';
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
            'relative aspect-square overflow-hidden',
            dark ? 'bg-burgundy' : 'bg-earth-deep',
          )}
        >
          <ProductPhoto
            product={product}
            className="transition-transform duration-[1200ms] ease-[var(--ease-premium)] group-hover:scale-[1.06]"
          />
          {/* soft vignette so the category chip stays legible on any photo */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" />
          <span className="eyebrow absolute left-4 top-4 rounded-full bg-ink/55 px-3 py-1.5 text-[0.58rem] text-ivory/90 backdrop-blur-sm">
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
