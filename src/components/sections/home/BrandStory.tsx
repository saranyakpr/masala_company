import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SplitText } from '@/animations/SplitText';
import { Reveal } from '@/animations/Reveal';
import { SpiceMound } from '@/components/common/SpiceMound';

export function BrandStory() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [140, -140]);
  const y3 = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="grain section-y relative overflow-hidden bg-sand">
      <div className="container-x relative grid gap-16 lg:grid-cols-12 lg:items-center">
        <div className="relative order-2 h-[26rem] lg:order-1 lg:col-span-6 lg:h-[34rem]">
          <motion.div style={{ y: y1 }} className="absolute left-0 top-6 w-[62%]">
            <SpiceMound color="#b3221f" colorDeep="#7d1015" label="Kashmiri chilli" />
          </motion.div>
          <motion.div style={{ y: y2 }} className="absolute right-0 top-28 w-[54%]">
            <SpiceMound color="#e2a01b" colorDeep="#b8770c" label="turmeric" />
          </motion.div>
          <motion.div style={{ y: y3 }} className="absolute bottom-0 left-[18%] w-[48%]">
            <SpiceMound color="#b39a5c" colorDeep="#7e6a3a" label="coriander" />
          </motion.div>
        </div>
        <div className="order-1 lg:order-2 lg:col-span-6">
          <Reveal>
            <span className="eyebrow flex items-center gap-3 text-spice">
              <span aria-hidden="true" className="h-px w-8 bg-spice/60" />
              Our story
            </span>
          </Reveal>
          <SplitText
            text="A spice house built on patience."
            className="mt-6 text-headline text-balance"
            accentWords={[5]}
            accentClassName="italic text-spice"
          />
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink-soft/80">
              Behind every pack is a simple belief: spice should taste of itself. That means choosing whole spices carefully,
              giving them the time they need, and grinding them in a way that keeps their character intact.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <blockquote className="mt-10 border-l-2 border-gold pl-6 font-display text-2xl italic leading-snug text-ink">
              “The best masala is the one you don’t have to explain.”
            </blockquote>
          </Reveal>
          <Reveal delay={0.3} className="mt-10">
            <Button to="/about" variant="primary">
              Discover our story
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
