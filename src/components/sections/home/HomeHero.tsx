import { lazy, Suspense, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { SplitText } from '@/animations/SplitText';
import { Button } from '@/components/ui/Button';
import { SceneLoader } from '@/components/common/Loaders';
import { easePremium } from '@/animations/variants';
import { useIntroDone } from '@/components/common/introState';
import { filmChapters } from '@/data/film';

const HeroScene = lazy(() => import('@/three/HeroScene'));

export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  // Entrance animations wait for the intro loader to lift.
  const go = useIntroDone();
  // the spice currently bursting behind the jar (gold caption, as in the reference video)
  const chapter = useMotionValue(-1);
  const [spice, setSpice] = useState(-1);
  useMotionValueEvent(chapter, 'change', (v) => setSpice(v));
  const enter = (y = 16) => (go ? { opacity: 1, y: 0 } : { opacity: 0, y });

  return (
    <section ref={ref} className="grain-light relative h-[100svh] min-h-[680px] overflow-hidden bg-burgundy-deep text-ivory" aria-label="Introduction">
      {/* atmospheric light */}
      {/* warm studio backdrop from the reference video, framed by the brand's burgundy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(48% 60% at 72% 56%, rgba(122,70,30,0.85), rgba(70,34,14,0.55) 45%, transparent 75%), radial-gradient(50% 60% at 12% 18%, rgba(163,23,28,0.32), transparent 70%)',
        }}
      />
      <div aria-hidden="true" className="film-rays pointer-events-none absolute -inset-[15%] opacity-70" />

      <Suspense fallback={<SceneLoader />}>
        <HeroScene progress={scrollYProgress} chapter={chapter} />
      </Suspense>

      {/* legibility gradient */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-burgundy-deep/70 via-transparent to-burgundy-deep/60 lg:bg-gradient-to-r lg:from-burgundy-deep/85 lg:via-burgundy-deep/20 lg:to-transparent" />

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[1.5%] h-24 md:bottom-[5%] lg:bottom-[9%] lg:left-auto lg:right-[3%] lg:w-[46%]">
        <AnimatePresence initial={false}>
          {spice >= 0 && (
            <motion.div
              key={spice}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.3 } }}
              transition={{ duration: 0.55, ease: easePremium }}
              className="absolute inset-x-0 bottom-0 flex flex-col items-center"
            >
              <p className="bg-gradient-to-b from-[#fbe9b4] via-[#e4c17a] to-[#b07e2c] bg-clip-text font-display text-[clamp(1.4rem,2.4vw,2.2rem)] italic leading-none text-transparent [filter:drop-shadow(0_2px_10px_rgba(0,0,0,0.6))]">
                {filmChapters[spice].title}
              </p>
              <svg viewBox="0 0 220 24" className="mt-2 w-32 text-gold-light/80">
                <path d="M4 12h70c10 0 14-8 22-8s10 8 14 8 6-8 14-8 12 8 22 8h70" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M110 4l5 8-5 8-5-8z" fill="currentColor" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x pointer-events-none relative flex h-full flex-col justify-start pt-32 lg:justify-end lg:pb-28 lg:pt-24"
      >
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={enter(12)}
            transition={{ duration: 1, ease: easePremium, delay: 0.5 }}
            className="eyebrow flex items-center gap-3 text-gold-light"
          >
            <span aria-hidden="true" className="h-px w-8 bg-gold-light/60" />
            Pure spices · Heritage masalas
          </motion.span>
          <SplitText
            as="h1"
            immediate
            play={go}
            delay={0.6}
            text={'The soul of\nevery spice.'}
            accentWords={[1]}
            accentClassName="italic text-gold-light"
            className="mt-6 text-display text-balance"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={enter()}
            transition={{ duration: 1, ease: easePremium, delay: 1.1 }}
            className="mt-7 max-w-md text-base leading-relaxed text-ivory/75 md:text-lg"
          >
            Whole spices, carefully cleaned, patiently dried and ground — so the colour, aroma and depth arrive in your kitchen
            exactly as nature intended.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={enter()}
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
        animate={{ opacity: go ? 1 : 0 }}
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
