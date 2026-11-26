import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SplitText } from '@/animations/SplitText';
import { Reveal } from '@/animations/Reveal';
import { productImage } from '@/data/images';
import { ARCH } from '@/components/ingredients/IngredientVisuals';
import { cn } from '@/utils/cn';

/** Arch-framed product photo with gold offset outline, depth shadow and a gentle hover lift. */
function StoryPhoto({ slug, label, className }: { slug: string; label: string; className?: string }) {
  const img = productImage(slug);
  return (
    <div className={cn('group relative', className)}>
      <div aria-hidden="true" className="absolute inset-0 border border-gold/60" style={{ ...ARCH, transform: 'translate(12px, 12px)' }} />
      <div
        className="relative aspect-[4/5] overflow-hidden bg-ink ring-1 ring-gold/50 shadow-[0_40px_70px_-30px_rgba(38,6,11,0.65)] transition-all duration-700 ease-[var(--ease-premium)] group-hover:-translate-y-2 group-hover:shadow-[0_55px_90px_-30px_rgba(38,6,11,0.75)]"
        style={ARCH}
      >
        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes="(min-width: 1024px) 26vw, 55vw"
          alt={label}
          width={img.width}
          height={img.height}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-premium)] group-hover:scale-[1.06]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-white/5" />
        <div aria-hidden="true" className="absolute inset-2.5 border border-gold-light/30" style={ARCH} />
      </div>
    </div>
  );
}

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
          <motion.div style={{ y: y1 }} className="absolute left-0 top-0 z-10 w-[44%]">
            <StoryPhoto slug="kashmiri-chilli-powder" label="Kashmiri Chilli Powder jar with dried red chillies" />
          </motion.div>
          <motion.div style={{ y: y2 }} className="absolute right-0 top-16 z-0 w-[46%]">
            <StoryPhoto slug="turmeric-powder" label="Turmeric Powder jar with fresh turmeric root" />
          </motion.div>
          <motion.div style={{ y: y3 }} className="absolute bottom-0 left-[24%] z-20 w-[40%]">
            <StoryPhoto slug="coriander-powder" label="Coriander Powder jar with coriander seeds" />
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
