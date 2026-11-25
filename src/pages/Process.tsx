import { lazy, Suspense, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { processSteps } from '@/data/content';
import { PageHero } from '@/components/sections/PageHero';
import { CTASection } from '@/components/sections/CTASection';
import { PendingBadge } from '@/components/ui/PendingBadge';
import { SceneLoader } from '@/components/common/Loaders';
import { cn } from '@/utils/cn';

const ProcessScene = lazy(() => import('@/three/ProcessScene'));

export default function Process() {
  useSeo({
    title: 'Manufacturing Process',
    description: 'From raw material sourcing to cleaning, drying, grinding, blending and packaging — how our spices are made.',
    path: '/process',
  });

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);
  const rail = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(processSteps.length - 1, Math.max(0, Math.round(v * (processSteps.length - 1))));
    setActive(i);
  });

  return (
    <>
      <PageHero
        eyebrow="Manufacturing process"
        title={'From farm gate\nto sealed pack.'}
        accentWords={[4, 5]}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Process' }]}
        description="Scroll through the six stages every spice passes through. Watch the particles follow the journey — from whole-spice heaps to a sealed pack."
      >
        <div className="mt-8">
          <PendingBadge tone="light" label="Machinery, capacities & parameters to be confirmed by client" />
        </div>
      </PageHero>

      <section ref={ref} className="relative bg-ink text-ivory" aria-label="Manufacturing steps">
        <div className="lg:grid lg:grid-cols-12">
          {/* Sticky 3D stage */}
          <div className="sticky top-0 z-20 h-[48svh] overflow-hidden bg-ink lg:z-0 lg:order-2 lg:col-span-7 lg:h-screen lg:bg-transparent">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: 'radial-gradient(60% 60% at 50% 55%, rgba(125,16,21,0.55), transparent 75%)' }}
            />
            <Suspense fallback={<SceneLoader label="Setting up the line" />}>
              <ProcessScene progress={scrollYProgress} />
            </Suspense>
            {/* stage indicator */}
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center lg:bottom-10">
              <ol className="flex items-center gap-2" aria-hidden="true">
                {processSteps.map((s, i) => (
                  <li
                    key={s.id}
                    className={cn('h-1 rounded-full transition-all duration-500', i === active ? 'w-10 bg-gold' : 'w-4 bg-ivory/20')}
                  />
                ))}
              </ol>
            </div>
            <div className="pointer-events-none absolute left-5 top-5 lg:left-10 lg:top-28">
              <p className="font-display text-6xl italic text-gold-light/90 lg:text-8xl">{processSteps[active].index}</p>
              <p className="eyebrow mt-1 text-[0.6rem] text-ivory/50">{processSteps[active].title}</p>
            </div>
          </div>

          {/* Steps */}
          <div className="relative z-10 lg:order-1 lg:col-span-5">
            <div aria-hidden="true" className="absolute bottom-0 left-5 top-0 hidden w-px bg-ivory/10 lg:left-16 lg:block">
              <motion.div style={{ height: rail }} className="w-px bg-gold" />
            </div>
            <ol>
              {processSteps.map((s, i) => (
                <li key={s.id} className="flex min-h-[85svh] items-center lg:min-h-screen">
                  <motion.article
                    initial={{ opacity: 0.25 }}
                    animate={{ opacity: active === i ? 1 : 0.3 }}
                    transition={{ duration: 0.5 }}
                    className="mx-5 bg-ink/85 py-10 lg:mx-0 lg:bg-transparent lg:pl-28 lg:pr-12"
                  >
                    <span className="eyebrow text-gold-light">Step {s.index}</span>
                    <h2 className="mt-4 text-[clamp(2.4rem,4vw,4rem)] leading-none">{s.title}</h2>
                    <p className="mt-3 font-display text-xl italic text-gold-light/90">{s.summary}</p>
                    <p className="mt-6 max-w-md leading-relaxed text-ivory/70">{s.detail}</p>
                    <ul className="mt-6 space-y-2">
                      {s.points.map((p) => (
                        <li key={p} className="flex gap-3 text-sm text-ivory/75">
                          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </motion.article>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="See it for yourself"
        title={'Questions about\nhow we work?'}
        accentWords={[3, 4]}
        description="Trade partners can request process and quality documentation. We’ll share what you need."
      />
    </>
  );
}
