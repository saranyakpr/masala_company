import { lazy, Suspense, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronRight, Leaf, Package } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { getProduct, getRelatedProducts, products } from '@/data/products';
import { getCategory } from '@/data/categories';
import type { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { HeatMeter } from '@/components/ui/HeatMeter';
import { PendingBadge } from '@/components/ui/PendingBadge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductPhoto } from '@/components/product/ProductPhoto';
import { productImage } from '@/data/images';
import { SceneLoader } from '@/components/common/Loaders';
import { CTASection } from '@/components/sections/CTASection';
import { Reveal, RevealItem, Stagger } from '@/animations/Reveal';
import { SplitText } from '@/animations/SplitText';
import { easePremium } from '@/animations/variants';
import { cn } from '@/utils/cn';
import NotFound from './NotFound';

const ProductViewer = lazy(() => import('@/three/ProductViewer'));

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const product = getProduct(slug);
  if (!product) return <NotFound message="We couldn’t find that product. It may have been renamed or removed." />;
  return <ProductView key={product.slug} product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const [size, setSize] = useState(product.packSizes[1]?.label ?? product.packSizes[0].label);
  const [view, setView] = useState<'photo' | '3d'>('photo');
  const category = getCategory(product.category);
  const related = getRelatedProducts(product, 4);
  const index = products.findIndex((p) => p.slug === product.slug);
  const prev = products[(index - 1 + products.length) % products.length];
  const next = products[(index + 1) % products.length];

  useSeo({
    title: product.name,
    description: `${product.name} (${product.localName}) — ${product.short}`,
    path: `/products/${product.slug}`,
    image: productImage(product.slug).src,
    type: 'product',
  });

  return (
    <>
      {/* Presentation */}
      <section className="grain-light relative overflow-hidden bg-burgundy-deep text-ivory">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(55% 60% at 30% 55%, ${product.palette.spice}55, transparent 70%)` }}
        />
        <div className="container-x relative grid gap-10 pb-16 pt-28 lg:grid-cols-12 lg:gap-14 lg:pb-24 lg:pt-32">
          <div className="lg:col-span-7">
            <div className="relative mx-auto aspect-square w-full max-w-[44rem] overflow-hidden bg-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
              {view === 'photo' ? (
                <motion.div
                  key="photo"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.1, ease: easePremium }}
                  className="h-full w-full"
                >
                  <ProductPhoto product={product} priority sizes="(min-width: 1024px) 55vw, 100vw" />
                </motion.div>
              ) : (
                <div className="h-full w-full bg-burgundy-deep">
                  <Suspense fallback={<SceneLoader label="Rendering pack" />}>
                    <ProductViewer product={product} weight={size} />
                  </Suspense>
                  <p className="absolute left-4 top-4 text-[0.6rem] uppercase tracking-[0.2em] text-ivory/45">Illustrative 3D render · drag to rotate</p>
                </div>
              )}
              <div role="group" aria-label="Product view" className="absolute bottom-4 right-4 flex rounded-full bg-ink/70 p-1 text-xs backdrop-blur-sm">
                {(['photo', '3d'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    className={cn(
                      'rounded-full px-4 py-2 uppercase tracking-[0.16em] transition-colors duration-300',
                      view === v ? 'bg-gold text-ink' : 'text-ivory/75 hover:text-ivory',
                    )}
                  >
                    {v === 'photo' ? 'Photo' : '3D view'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:col-span-5">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-ivory/50">
                <li><Link to="/" className="hover:text-ivory">Home</Link></li>
                <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
                <li><Link to="/products" className="hover:text-ivory">Products</Link></li>
                <li aria-hidden="true"><ChevronRight className="h-3 w-3" /></li>
                <li>
                  <Link to={`/products?category=${product.category}`} className="hover:text-ivory">
                    {category?.name}
                  </Link>
                </li>
              </ol>
            </nav>

            <SplitText as="h1" immediate delay={0.3} text={product.name} className="mt-8 text-[clamp(2.8rem,5.5vw,5.5rem)] leading-[0.95] text-balance" />
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: easePremium, delay: 0.6 }}>
              <p className="mt-3 font-display text-2xl italic text-gold-light">{product.localName}</p>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory/75">{product.short}</p>

              <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-ivory/10 py-6 text-sm">
                <div>
                  <dt className="eyebrow text-[0.6rem] text-ivory/45">Heat</dt>
                  <dd className="mt-2">
                    <HeatMeter level={product.heat} tone="light" />
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-[0.6rem] text-ivory/45">Aroma</dt>
                  <dd className="mt-2 text-ivory/85">{product.aroma}</dd>
                </div>
              </dl>

              <fieldset className="mt-8">
                <legend className="eyebrow text-[0.6rem] text-ivory/45">Available pack sizes</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.packSizes.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setSize(p.label)}
                      aria-pressed={size === p.label}
                      className={cn(
                        'flex h-12 flex-col items-center justify-center rounded-full border px-5 text-sm transition-colors duration-300',
                        size === p.label ? 'border-gold bg-gold text-ink' : 'border-ivory/20 text-ivory/80 hover:border-ivory/50',
                      )}
                    >
                      <span className="font-semibold leading-none">{p.label}</span>
                      <span className="mt-0.5 text-[0.58rem] uppercase tracking-[0.14em] opacity-70">{p.format}</span>
                    </button>
                  ))}
                </div>
                <PendingBadge tone="light" className="mt-4" label="Indicative sizes — confirm SKU list" />
              </fieldset>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button to={`/contact?product=${product.slug}`} variant="gold" size="lg">
                  Enquire about this product
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Description, ingredients, benefits */}
      <section className="section-y bg-ivory">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <span className="eyebrow flex items-center gap-3 text-spice">
                <span aria-hidden="true" className="h-px w-8 bg-spice/60" />
                About this spice
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.2]">{product.description}</p>
            </Reveal>

            <Reveal delay={0.15} className="mt-14">
              <h2 className="text-3xl">Best for</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {product.bestFor.map((b) => (
                  <li key={b} className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink-soft">
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="mt-14">
              <h2 className="text-3xl">Why you’ll love it</h2>
              <Stagger as="ul" className="mt-6 grid gap-4 sm:grid-cols-2">
                {product.benefits.map((b, i) => (
                  <RevealItem as="li" key={b} className="flex gap-4 border-t border-line pt-4">
                    <span className="font-display text-sm italic text-spice">0{i + 1}</span>
                    <span className="text-ink-soft/85">{b}</span>
                  </RevealItem>
                ))}
              </Stagger>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal className="bg-cream p-8 lg:p-10">
                <h2 className="flex items-center gap-3 text-3xl">
                  <Leaf aria-hidden="true" className="h-5 w-5 text-spice" /> Ingredients
                </h2>
                <ul className="mt-6 divide-y divide-line">
                  {product.ingredients.map((ing) => (
                    <li key={ing} className="py-3 text-ink-soft">
                      {ing}
                    </li>
                  ))}
                </ul>
                {product.ingredients.length > 1 && (
                  <PendingBadge className="mt-4" label="Recipe & proportions to be confirmed by client" />
                )}
              </Reveal>

              <Reveal delay={0.1} className="mt-4 border border-line p-8 lg:p-10">
                <h2 className="flex items-center gap-3 text-3xl">
                  <Package aria-hidden="true" className="h-5 w-5 text-spice" /> Specifications
                </h2>
                <dl className="mt-6 divide-y divide-line">
                  {product.specs.map((s) => (
                    <div key={s.label} className="grid grid-cols-[8rem_1fr] gap-4 py-3 text-sm">
                      <dt className="font-semibold text-ink">{s.label}</dt>
                      <dd className={s.pending ? 'italic text-ink-soft/55' : 'text-ink-soft'}>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </aside>
        </div>
      </section>

      {/* Prev / next */}
      <nav aria-label="More products" className="border-y border-line bg-cream">
        <div className="container-x grid grid-cols-2">
          <Link to={`/products/${prev.slug}`} className="group flex flex-col gap-2 border-r border-line py-10 pr-4">
            <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/50">
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" /> Previous
            </span>
            <span className="font-display text-xl sm:text-3xl">{prev.name}</span>
          </Link>
          <Link to={`/products/${next.slug}`} className="group flex flex-col items-end gap-2 py-10 pl-4 text-right">
            <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/50">
              Next <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="font-display text-xl sm:text-3xl">{next.name}</span>
          </Link>
        </div>
      </nav>

      {/* Related */}
      <section className="section-y bg-ivory">
        <div className="container-x">
          <SectionHeading
            eyebrow="You may also like"
            title="Related spices."
            accentWords={[1]}
            action={
              <Button to="/products" variant="outline-dark">
                All products
              </Button>
            }
          />
          <ProductGrid products={related} columns={4} className="mt-14" />
        </div>
      </section>

      <CTASection />
    </>
  );
}
