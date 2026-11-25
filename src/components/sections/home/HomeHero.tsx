import { lazy, Suspense, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { SplitText } from '@/animations/SplitText';
import { Button } from '@/components/ui/Button';
import { SceneLoader } from '@/components/common/Loaders';
import { easePremium } from '@/animations/variants';

const HeroScene = lazy(() => import('@/three/HeroScene'));

export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="grain-light relative h-[100svh] min-h-[680px] overflow-hidden bg-burgundy-deep text-ivory" aria-label="Introduction">
      {/* atmospheric light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 72% 62%, rgba(201,154,62,0.28), transparent 70%), radial-gradient(50% 60% at 15% 20%, rgba(163,23,28,0.35), transparent 70%)',
        }}
      />

      <Suspense fallback={<SceneLoader />}>
        <HeroScene progress={scrollYProgress} />
      </Suspense>

      {/* legibility gradient */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-burgundy-deep/70 via-transparent to-burgundy-deep/60 lg:bg-gradient-to-r lg:from-burgundy-deep/85 lg:via-burgundy-deep/20 lg:to-transparent" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x pointer-events-none relative flex h-full flex-col justify-start pt-32 lg:justify-end lg:pb-28 lg:pt-24"
      >
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easePremium, delay: 0.5 }}
            className="eyebrow flex items-center gap-3 text-gold-light"
          >
            <span aria-hidden="true" className="h-px w-8 bg-gold-light/60" />
            Pure spices · Heritage masalas
          </motion.span>
          <SplitText
            as="h1"
            immediate
            delay={0.6}
            text={'The soul of\nevery spice.'}
            accentWords={[1]}
            accentClassName="italic text-gold-light"
            className="mt-6 text-display text-balance"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easePremium, delay: 1.1 }}
            className="mt-7 max-w-md text-base leading-relaxed text-ivory/75 md:text-lg"
          >
            Whole spices, carefully cleaned, patiently dried and ground — so the colour, aroma and depth arrive in your kitchen
            exactly as nature intended.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: easePremium, delay: 1.3 }}
            className="pointer-events-auto mt-10 flex flex-wrap gap-3"
          >
            <Button to="/products" variant="gold" size="lg">
              Explore the range
            </Button>
            <Button to="/process" variant="outline-light" size="lg">
              How we make it
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="container-x pointer-events-none absolute inset-x-0 bottom-6 hidden items-end justify-between text-ivory/55 md:flex"
      >
        <span className="eyebrow flex items-center gap-3 text-[0.62rem]">
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDown aria-hidden="true" className="h-4 w-4" />
          </motion.span>
          Scroll to explore
        </span>
        <span className="eyebrow text-[0.62rem]">Move your cursor through the spice dust</span>
      </motion.div>
    </section>
  );
}
