import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ingredients } from '@/data/ingredients';
import { ingredientImage } from '@/data/ingredientImages';
import type { Ingredient } from '@/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { easePremium } from '@/animations/variants';
import { cn } from '@/utils/cn';
import { ARCH, IngredientStage, IngredientThumb, pad } from '@/components/ingredients/IngredientVisuals';

export function IngredientsPreview() {
  const [active, setActive] = useState(0);
  const current = ingredients[active];
  const ref = useRef<HTMLElement>(null);
  const near = useInView(ref, { once: true, margin: '400px 0px' });

  // Warm the cache so switching ingredients never flashes an empty frame.
  useEffect(() => {
    if (!near) return;
    ingredients.forEach((ing) => {
      const img = new Image();
      img.src = ingredientImage(ing.id).src;
    });
  }, [near]);

  return (
    <section ref={ref} className="grain-light section-y relative overflow-hidden bg-burgundy-deep text-ivory">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-[background] duration-1000"
        style={{ background: `radial-gradient(40% 50% at 78% 45%, ${current.color}2e, transparent 70%)` }}
      />
      <div className="container-x relative">
        <SectionHeading
          tone="light"
          eyebrow="Our ingredients"
          title="Every spice has a story of soil and sun."
          accentWords={[6, 7, 8]}
          description="Hover or tap through the spices at the heart of our range."
        />

        {/* ---------- Desktop: index + 3D feature stage ---------- */}
        <div className="mt-16 hidden gap-16 lg:grid lg:grid-cols-12 lg:items-start">
          <ul className="lg:col-span-5" role="list">
            {ingredients.map((ing, i) => (
              <li key={ing.id} className="border-b border-ivory/10 first:border-t">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className="group flex w-full items-center justify-between gap-6 py-3.5 text-left"
                >
                  <span className="flex shrink-0 items-center gap-5">
                    <span className="w-6 font-sans text-xs text-ivory/35">{pad(i + 1)}</span>
                    <IngredientThumb ingredient={ing} active={active === i} />
                    <span className="flex flex-col">
                      <span
                        className={cn(
                          'whitespace-nowrap font-display text-3xl leading-tight transition-all duration-500 xl:text-4xl',
                          active === i ? 'translate-x-1 italic text-gold-light' : 'text-ivory/75 group-hover:text-ivory',
                        )}
                      >
                        {ing.name}
                      </span>
                      <span className="text-xs italic text-ivory/40">{ing.botanical}</span>
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn('h-px bg-gold transition-all duration-500 ease-[var(--ease-premium)]', active === i ? 'w-10 opacity-100' : 'w-0 opacity-0')}
                  />
                </button>
              </li>
            ))}
          </ul>

          <div className="lg:col-span-7">
            <IngredientStage ingredient={current} index={active} total={ingredients.length} />
            <div className="mx-auto mt-14 max-w-[34rem]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={current.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: easePremium }}
                  className="min-h-[4.5rem] text-sm leading-relaxed text-ivory/70"
                >
                  {current.description}
                </motion.p>
              </AnimatePresence>
              <div className="mt-8">
                <Button to="/ingredients" variant="outline-light">
                  Explore all ingredients
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Mobile & tablet: swipeable arch cards ---------- */}
        <div className="lg:hidden">
          <ul
            role="list"
            aria-label="Ingredients"
            className="-mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-10 pt-4 [scrollbar-width:none] md:-mx-10 md:px-10 [&::-webkit-scrollbar]:hidden"
          >
            {ingredients.map((ing, i) => (
              <li key={ing.id} className="w-[76%] max-w-[20rem] shrink-0 snap-center sm:w-[44%]">
                <IngredientCard ingredient={ing} index={i} />
              </li>
            ))}
          </ul>
          <Button to="/ingredients" variant="outline-light">
            Explore all ingredients
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Mobile card: same arch frame and depth cues, sized for a swipe carousel. */
function IngredientCard({ ingredient, index }: { ingredient: Ingredient; index: number }) {
  const img = ingredientImage(ingredient.id);
  return (
    <article className="group">
      <div className="ing-float relative" style={{ animationDelay: `${-index * 0.7}s` }}>
        <div aria-hidden="true" className="absolute inset-0 border border-gold/35" style={{ ...ARCH, transform: 'translate(10px, 10px)' }} />
        <div className="relative aspect-[5/6] overflow-hidden bg-ink shadow-[0_40px_60px_-28px_rgba(0,0,0,0.9)] ring-1 ring-gold/50" style={ARCH}>
          <img
            src={img.src}
            srcSet={img.srcSet}
            sizes="(min-width: 640px) 20rem, 76vw"
            alt={`${ingredient.name} — ${ingredient.notes}`}
            width={720}
            height={720}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-active:scale-105"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
          <div aria-hidden="true" className="absolute inset-2.5 border border-gold-light/25" style={ARCH} />
          <div className="absolute inset-x-5 bottom-5">
            <span className="eyebrow text-[0.56rem] text-ivory/50">
              {pad(index + 1)} / {pad(ingredients.length)}
            </span>
            <h3 className="mt-1 font-display text-3xl leading-tight">{ingredient.name}</h3>
            <p className="text-xs italic text-ivory/55">{ingredient.botanical}</p>
          </div>
        </div>
      </div>
      <p className="eyebrow mt-6 text-[0.58rem] text-gold-light">{ingredient.notes}</p>
      <p className="mt-2 text-sm leading-relaxed text-ivory/70">{ingredient.description}</p>
    </article>
  );
}
