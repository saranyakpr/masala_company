import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ingredients } from '@/data/ingredients';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SpiceMound } from '@/components/common/SpiceMound';
import { Button } from '@/components/ui/Button';
import { easePremium } from '@/animations/variants';
import { cn } from '@/utils/cn';

export function IngredientsPreview() {
  const [active, setActive] = useState(0);
  const current = ingredients[active];
  return (
    <section className="grain-light section-y relative overflow-hidden bg-burgundy-deep text-ivory">
      <div className="container-x">
        <SectionHeading
          tone="light"
          eyebrow="Our ingredients"
          title="Every spice has a story of soil and sun."
          accentWords={[6, 7, 8]}
          description="Hover or tap through the spices at the heart of our range."
        />

        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          <ul className="lg:col-span-6" role="list">
            {ingredients.map((ing, i) => (
              <li key={ing.id} className="border-b border-ivory/10 first:border-t">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className="group flex w-full items-baseline justify-between gap-6 py-5 text-left"
                >
                  <span className="flex items-baseline gap-5">
                    <span className="w-6 font-sans text-xs text-ivory/35">0{i + 1}</span>
                    <span
                      className={cn(
                        'font-display text-3xl transition-all duration-500 md:text-4xl',
                        active === i ? 'translate-x-2 italic text-gold-light' : 'text-ivory/75 group-hover:text-ivory',
                      )}
                    >
                      {ing.name}
                    </span>
                  </span>
                  <span className="hidden text-xs italic text-ivory/40 sm:block">{ing.botanical}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden bg-burgundy lg:sticky lg:top-32">
              <div className="relative flex aspect-[5/4] items-end justify-center px-8 pb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 30, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: easePremium }}
                    className="w-full"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-full opacity-40 blur-3xl"
                      style={{ background: `radial-gradient(circle at 50% 70%, ${current.color}, transparent 60%)` }}
                    />
                    <SpiceMound color={current.color} colorDeep={current.colorDeep} label={current.name} className="relative" />
                  </motion.div>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="border-t border-ivory/10 p-8"
                >
                  <p className="eyebrow text-[0.62rem] text-gold-light">{current.notes}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/70">{current.description}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-8">
              <Button to="/ingredients" variant="outline-light">
                Explore all ingredients
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
