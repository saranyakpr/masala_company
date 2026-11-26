import { lazy, Suspense, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, MapPin } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { ingredients } from '@/data/ingredients';
import { products } from '@/data/products';
import { PageHero } from '@/components/sections/PageHero';
import { CTASection } from '@/components/sections/CTASection';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { IngredientArchCard, IngredientStage, IngredientThumb } from '@/components/ingredients/IngredientVisuals';
import { SceneLoader } from '@/components/common/Loaders';
import { useLenis } from '@/components/common/SmoothScroll';
import { Reveal } from '@/animations/Reveal';
import { easePremium } from '@/animations/variants';
import { cn } from '@/utils/cn';

const IngredientScene = lazy(() => import('@/three/IngredientScene'));

export default function Ingredients() {
  useSeo({
    title: 'Our Ingredients',
    description: 'Turmeric, chilli, black pepper, coriander, cumin, cardamom, cinnamon and star anise — the spices at the heart of our range.',
    path: '/ingredients',
  });
  const [active, setActive] = useState(0);
  const [view, setView] = useState<'photo' | '3d'>('photo');
  const current = ingredients[active];
  const explorerRef = useRef<HTMLElement>(null);
  const lenis = useLenis();

  const usedInLinks = current.usedIn
    .map((name) => products.find((p) => p.name === name))
    .filter((p): p is (typeof products)[number] => !!p);

  const viewIn3D = (i: number) => {
    setActive(i);
    setView('3d');
    const el = explorerRef.current;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <PageHero
        eyebrow="Our ingredients"
        title={'Spice, in its\nmost honest form.'}
        accentWords={[4, 5]}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Ingredients' }]}
        description="Meet the whole spices behind our range — where they traditionally grow, how they taste, and what they bring to the pot."
      />

      {/* 3D explorer */}
      <section ref={explorerRef} className="grain-light relative overflow-hidden bg-burgundy text-ivory" aria-label="Ingredient explorer">
        <div className="container-x grid gap-8 py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
          <div role="group" aria-label="Choose an ingredient" className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:col-span-3 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0">
            {ingredients.map((ing, i) => (
              <button
                key={ing.id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                className={cn(
                  'group flex shrink-0 items-center gap-3 rounded-full border px-4 py-2.5 text-left transition-colors duration-300 lg:rounded-none lg:border-0 lg:border-b lg:border-ivory/10 lg:px-0 lg:py-4',
                  active === i ? 'border-gold bg-gold text-ink lg:bg-transparent lg:text-gold-light' : 'border-ivory/15 text-ivory/70 hover:text-ivory',
                )}
              >
                <IngredientThumb ingredient={ing} active={active === i} size="responsive" />
                <span className={cn('font-display text-base lg:text-2xl', active === i && 'lg:italic')}>{ing.name}</span>
              </button>
            ))}
          </div>

          <div className="relative lg:col-span-5">
            {view === 'photo' ? (
              <IngredientStage ingredient={current} index={active} total={ingredients.length} caption={false} className="pb-2 pt-6" />
            ) : (
              <div className="relative h-[22rem] sm:h-[28rem] lg:h-[36rem]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full opacity-40 blur-3xl transition-colors duration-1000"
                  style={{ background: `radial-gradient(circle at 50% 60%, ${current.color}, transparent 60%)` }}
                />
                <Suspense fallback={<SceneLoader label="Preparing ingredient" />}>
                  <IngredientScene ingredient={current} />
                </Suspense>
                <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[0.6rem] uppercase tracking-[0.2em] text-ivory/40">
                  Procedural 3D study · drag to rotate
                </p>
              </div>
            )}
            <div role="group" aria-label="Ingredient view" className="mx-auto mt-6 flex w-fit rounded-full border border-ivory/15 bg-ink/40 p-1 text-xs backdrop-blur-sm">
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
                  {v === 'photo' ? 'Photo' : '3D study'}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.6, ease: easePremium }}
              >
                <p className="font-display text-lg italic text-gold-light">{current.localName}</p>
                <h2 className="mt-2 text-5xl lg:text-6xl">{current.name}</h2>
                <p className="mt-2 text-sm italic text-ivory/50">{current.botanical}</p>
                <p className="mt-6 leading-relaxed text-ivory/75">{current.description}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {current.flavour.map((f) => (
                    <li key={f} className="rounded-full border border-ivory/20 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-ivory/80">
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 flex gap-3 text-sm text-ivory/60">
                  <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {current.origin}
                </p>
                {usedInLinks.length > 0 && (
                  <div className="mt-8 border-t border-ivory/10 pt-6">
                    <p className="eyebrow text-[0.6rem] text-ivory/45">Found in</p>
                    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                      {usedInLinks.map((p) => (
                        <li key={p.slug}>
                          <Link to={`/products/${p.slug}`} className="link-underline font-display text-lg text-ivory hover:text-gold-light">
                            {p.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Editorial index */}
      <section className="section-y bg-ivory">
        <div className="container-x">
          <SectionHeading
            eyebrow="The spice index"
            title="Eight spices, eight characters."
            accentWords={[2, 3]}
            description="Growing regions are where each spice is traditionally cultivated in India — the client’s actual sourcing regions are to be confirmed."
          />
          <ul className="mt-16 grid gap-x-12 gap-y-20 md:grid-cols-2 lg:mt-24 lg:gap-x-20">
            {ingredients.map((ing, i) => (
              <li key={ing.id} className={cn(i % 2 === 1 && 'md:mt-28')}>
                <Reveal delay={(i % 2) * 0.1} as="article" className="group/card">
                  <IngredientArchCard ingredient={ing} index={i} tone="light" shape="landscape" sizes="(min-width: 768px) 45vw, 90vw" />
                  <div className="mt-12 flex items-start justify-between gap-6">
                    <div>
                      <h3 className="text-4xl">{ing.name}</h3>
                      <p className="mt-1 text-sm italic text-ink-soft/60">
                        {ing.botanical} · {ing.localName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => viewIn3D(i)}
                      className="flex shrink-0 items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:border-ink hover:bg-ink hover:text-ivory"
                    >
                      <Box aria-hidden="true" className="h-3.5 w-3.5" /> View in 3D
                    </button>
                  </div>
                  <p className="mt-2 eyebrow text-[0.6rem] text-spice">{ing.notes}</p>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft/75">{ing.description}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection />
    </>
  );
}
