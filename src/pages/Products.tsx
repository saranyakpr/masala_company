import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSeo } from '@/hooks/useSeo';
import { products } from '@/data/products';
import { categories, getCategory } from '@/data/categories';
import type { CategoryId } from '@/types';
import { PageHero } from '@/components/sections/PageHero';
import { CTASection } from '@/components/sections/CTASection';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { Button } from '@/components/ui/Button';

const isCategory = (v: string | null): v is CategoryId => !!v && categories.some((c) => c.id === v);

export default function Products() {
  const [params, setParams] = useSearchParams();
  const rawCategory = params.get('category');
  const active: CategoryId | 'all' = isCategory(rawCategory) ? rawCategory : 'all';
  // The search box is driven by local state (instant typing); the URL mirrors it for shareable links.
  const [query, setQuery] = useState(() => params.get('q') ?? '');
  const urlQuery = params.get('q') ?? '';

  useEffect(() => {
    if (query === urlQuery) return;
    const p = new URLSearchParams(params);
    if (query) p.set('q', query);
    else p.delete('q');
    setParams(p, { replace: true, preventScrollReset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useSeo({
    title: active === 'all' ? 'Products' : `${getCategory(active)?.name} — Products`,
    description: 'Explore pure ground spices, heritage masala blends and hand-sorted whole spices.',
    path: active === 'all' ? '/products' : `/products?category=${active}`,
  });

  const update = (next: { category?: CategoryId | 'all'; q?: string }) => {
    if (next.q !== undefined) setQuery(next.q);
    if (next.category === undefined) return;
    const p = new URLSearchParams(params);
    if (next.category === 'all') p.delete('category');
    else p.set('category', next.category);
    const q = next.q ?? query;
    if (q) p.set('q', q);
    else p.delete('q');
    setParams(p, { replace: true, preventScrollReset: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (active !== 'all' && p.category !== active) return false;
      if (!q) return true;
      const haystack = [p.name, p.localName, p.short, ...p.ingredients, ...p.bestFor].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [active, query]);

  const counts = useMemo(() => {
    const c = { all: products.length } as Record<CategoryId | 'all', number>;
    categories.forEach((cat) => (c[cat.id] = products.filter((p) => p.category === cat.id).length));
    return c;
  }, []);

  const activeCategory = active === 'all' ? null : getCategory(active);

  return (
    <>
      <PageHero
        eyebrow="Our products"
        title={'The complete\nspice collection.'}
        accentWords={[2, 3]}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
        description="Pure ground spices, heritage masala blends and hand-sorted whole spices — each one cleaned, dried and packed with care."
      />

      <section className="section-y bg-ivory !pt-0">
        <div className="sticky top-0 z-30 border-b border-line bg-ivory/95 py-5">
          <div className="container-x">
            <ProductFilters
              active={active}
              onCategory={(c) => update({ category: c })}
              query={query}
              onQuery={(q) => update({ q })}
              counts={counts}
              resultCount={filtered.length}
            />
          </div>
        </div>

        <div className="container-x pt-14">
          <AnimatePresence mode="wait">
            {activeCategory && (
              <motion.div
                key={activeCategory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-14 max-w-2xl"
              >
                <h2 className="text-4xl">{activeCategory.name}</h2>
                <p className="mt-3 text-ink-soft/75">{activeCategory.description}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {filtered.length > 0 ? (
            <ProductGrid products={filtered} />
          ) : (
            <div className="flex flex-col items-center py-24 text-center">
              <p className="font-display text-4xl">Nothing in this jar.</p>
              <p className="mt-3 max-w-sm text-ink-soft/70">No products match “{query}”. Try another spice or clear the filters.</p>
              <Button className="mt-8" variant="ink" arrow={false} onClick={() => update({ category: 'all', q: '' })}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
