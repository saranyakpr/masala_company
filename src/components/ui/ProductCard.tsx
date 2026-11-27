import { Link } from 'react-router-dom'
import { formatPrice, type Product } from '../../data/products'
import { cart } from '../../lib/cart'
import { ProductShot } from './ProductShot'

const formLabel = { powder: 'Powder', seeds: 'Seeds', whole: 'Whole' } as const

/** Catalogue card: studio shot (turns to 3/4 view on hover), name, price, quick add. */
export function ProductCard({ product, index }: { product: Product; index?: number }) {
  const from = product.sizes[0]
  return (
    <article className="group relative flex flex-col">
      <Link
        to={`/shop/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-sm border border-cream/[0.06] bg-[#120b07]"
        aria-label={`${product.name} — view details`}
        data-cursor="View"
      >
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${product.powder}40, transparent 70%)`, opacity: 0.75 }}
        />
        {index !== undefined && (
          <span className="absolute left-4 top-4 z-10 font-brand text-[0.6rem] tracking-[0.3em] text-cream/40">{String(index + 1).padStart(2, '0')}</span>
        )}
        <span className="absolute right-4 top-4 z-10 rounded-full border border-cream/15 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.2em] text-cream/60">
          {product.category === 'blend' ? 'Blend' : formLabel[product.form]}
        </span>
        <ProductShot id={product.id} className="absolute inset-0 h-full w-full transition-all duration-700 ease-[var(--ease-cinema)] group-hover:scale-[1.04] group-hover:opacity-0" />
        <ProductShot id={product.id} angle={1} className="absolute inset-0 h-full w-full scale-[1.04] opacity-0 transition-all duration-700 ease-[var(--ease-cinema)] group-hover:scale-100 group-hover:opacity-100" />
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="display text-2xl text-cream">
            <Link to={`/shop/${product.id}`} className="transition-colors hover:text-gold-soft">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-cream/50">{product.notes.join(' · ')}</p>
        </div>
        <p className="shrink-0 pt-1 text-sm font-semibold text-gold-soft">
          <span className="mr-1 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-cream/40">from</span>
          {formatPrice(from.price)}
        </p>
      </div>
      <button
        onClick={() => cart.add(product.id, from.label)}
        className="mt-4 w-full rounded-full border border-gold/30 py-3 text-[0.62rem] font-bold uppercase tracking-[0.25em] text-cream transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-coal"
      >
        Add {from.label} to cart
      </button>
    </article>
  )
}
