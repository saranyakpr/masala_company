import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { CategoryId } from '@/types';
import { categories } from '@/data/categories';
import { easePremium } from '@/animations/variants';
import { cn } from '@/utils/cn';

interface ProductFiltersProps {
  active: CategoryId | 'all';
  onCategory: (c: CategoryId | 'all') => void;
  query: string;
  onQuery: (q: string) => void;
  counts: Record<CategoryId | 'all', number>;
  resultCount: number;
}

export function ProductFilters({ active, onCategory, query, onQuery, counts, resultCount }: ProductFiltersProps) {
  const options: { id: CategoryId | 'all'; label: string }[] = [{ id: 'all', label: 'All' }, ...categories.map((c) => ({ id: c.id, label: c.name }))];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div role="group" aria-label="Filter by category" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0">
        {options.map((o) => {
          const selected = active === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onCategory(o.id)}
              className={cn(
                'relative flex h-11 shrink-0 items-center gap-2 rounded-full border px-5 text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300',
                selected ? 'border-ink text-ivory' : 'border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink',
              )}
            >
              {selected && (
                <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: easePremium }} />
              )}
              <span className="relative">{o.label}</span>
              <span className={cn('relative text-[0.65rem]', selected ? 'text-gold-light' : 'text-ink/40')}>{counts[o.id]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-5">
        <label className="relative flex-1 lg:w-80 lg:flex-none">
          <span className="sr-only">Search products</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search spices, masalas, ingredients…"
            className="h-11 w-full border-0 border-b border-ink/20 bg-transparent pl-7 pr-8 text-sm placeholder:text-ink/40 focus:border-gold focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => onQuery('')} aria-label="Clear search" className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-ink/50 hover:text-ink">
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </label>
        <p className="shrink-0 text-xs uppercase tracking-[0.18em] text-ink/50" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'product' : 'products'}
        </p>
      </div>
    </div>
  );
}
