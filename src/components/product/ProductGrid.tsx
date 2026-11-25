import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { cn } from '@/utils/cn';

interface ProductGridProps {
  products: Product[];
  tone?: 'dark' | 'light';
  columns?: 3 | 4;
  className?: string;
}

export function ProductGrid({ products, tone = 'light', columns = 3, className }: ProductGridProps) {
  return (
    <motion.div
      layout
      className={cn(
        'grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2',
        columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
        className,
      )}
    >
      <AnimatePresence mode="popLayout">
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} tone={tone} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
