import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { ProductCard } from '../components/ui/ProductCard'
import { company } from '../data/company'
import { formatPrice, products, type ProductCategory, type ProductForm } from '../data/products'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const categories: { k: 'all' | ProductCategory; label: string }[] = [
  { k: 'all', label: 'All' },
  { k: 'spice', label: 'Single spices' },
  { k: 'blend', label: 'Blends' },
]
const forms: { k: 'all' | ProductForm; label: string }[] = [
  { k: 'all', label: 'Any form' },
  { k: 'powder', label: 'Powders' },
  { k: 'seeds', label: 'Seeds' },
  { k: 'whole', label: 'Whole' },
]
const sorts = [
  { k: 'featured', label: 'Featured' },
  { k: 'price-asc', label: 'Price: low to high' },
  { k: 'price-desc', label: 'Price: high to low' },
  { k: 'name', label: 'Name A–Z' },
] as const

export default function ShopPage() {
  useDocumentTitle('Shop Now', 'Shop 12 SPICES — single spices and signature masala blends in premium jars.')
  const [params, setParams] = useSearchParams()
  const category = (params.get('category') ?? 'all') as 'all' | ProductCategory
  const form = (params.get('form') ?? 'all') as 'all' | ProductForm
  const sort = (params.get('sort') ?? 'featured') as (typeof sorts)[number]['k']
  const q = params.get('q') ?? ''

  const update = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params)
    if (value === fallback || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const list = useMemo(() => {
    let out = products.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (form === 'all' || p.form === form) &&
        (!q || `${p.name} ${p.notes.join(' ')} ${p.pairs.join(' ')}`.toLowerCase().includes(q.toLowerCase())),
    )
    if (sort === 'price-asc') out = [...out].sort((a, b) => a.sizes[0].price - b.sizes[0].price)
    if (sort === 'price-desc') out = [...out].sort((a, b) => b.sizes[0].price - a.sizes[0].price)
    if (sort === 'name') out = [...out].sort((a, b) => a.name.localeCompare(b.name))
    return out
  }, [category, form, sort, q])

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors ${
      active ? 'border-gold bg-gold text-coal' : 'border-cream/15 text-cream/70 hover:border-cream/40 hover:text-cream'
    }`

  return (
    <div className="relative z-20 bg-coal">
      <PageHeader
        eyebrow="Shop now"
        title={[<span key="a">The 12 Spices</span>, <span key="b" className="italic gold-text">collection.</span>]}
        intro={`Single spices and signature blends in our premium jars. Free shipping on orders above ${formatPrice(company.shipping.freeAbove)}.`}
      />

      <section className="px-5 pb-28 sm:px-8 lg:px-12" aria-label="Catalogue">
        <div className="mx-auto max-w-[1600px]">
          <div className="sticky top-[4.5rem] z-30 -mx-5 mb-10 flex flex-col gap-4 border-y border-cream/5 bg-coal/85 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
              {categories.map((c) => (
                <button key={c.k} className={chip(category === c.k)} aria-pressed={category === c.k} onClick={() => update('category', c.k, 'all')}>
                  {c.label}
                </button>
              ))}
              <span className="mx-1 hidden w-px bg-cream/10 sm:block" />
              {forms.map((f) => (
                <button key={f.k} className={chip(form === f.k)} aria-pressed={form === f.k} onClick={() => update('form', f.k, 'all')}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <label className="relative flex-1 lg:w-64">
                <span className="sr-only">Search products</span>
                <input
                  type="search"
                  value={q}
                  onChange={(e) => update('q', e.target.value, '')}
                  placeholder="Search spices or dishes…"
                  className="w-full rounded-full border border-cream/15 bg-transparent px-5 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:border-gold focus:outline-none"
                />
              </label>
              <label className="relative">
                <span className="sr-only">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => update('sort', e.target.value, 'featured')}
                  className="h-full appearance-none rounded-full border border-cream/15 bg-coal px-5 py-2.5 pr-9 text-sm text-cream focus:border-gold focus:outline-none"
                >
                  {sorts.map((s) => (
                    <option key={s.k} value={s.k}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-cream/50">
                  ▾
                </span>
              </label>
            </div>
          </div>

          <p className="mb-8 text-xs uppercase tracking-[0.25em] text-cream/40" aria-live="polite">
            {list.length} product{list.length === 1 ? '' : 's'}
          </p>
          {list.length ? (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="display text-3xl text-cream/80">Nothing matches that search.</p>
              <button className="mt-6 text-sm text-gold-soft underline underline-offset-4" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
