import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { processSteps } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { RevealItem, Stagger } from '@/animations/Reveal';
import { useMediaQuery } from '@/hooks/useMediaQuery';

function StepCard({ step }: { step: (typeof processSteps)[number] }) {
  return (
    <article className="group relative flex h-full flex-col border-t border-ink/15 pt-6">
      <span aria-hidden="true" className="absolute -top-px left-0 h-px w-0 bg-spice transition-all duration-700 ease-[var(--ease-premium)] group-hover:w-full" />
      <span className="font-display text-7xl leading-none text-spice/15 transition-colors duration-500 group-hover:text-spice/80 lg:text-8xl">{step.index}</span>
      <h3 className="mt-6 text-3xl">{step.title}</h3>
      <p className="mt-2 font-display text-lg italic text-spice">{step.summary}</p>
      <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft/75">{step.detail}</p>
    </article>
  );
}

/** Desktop: pinned horizontal scroll through the six steps. Mobile/tablet: stacked grid. */
export function ProcessPreview() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const heading = (
    <SectionHeading
      eyebrow="From farm to pack"
      title="Six steps. No shortcuts."
      accentWords={[2, 3]}
      description="A careful, measured process that protects what makes each spice worth cooking with."
      action={
        <Button to="/process" variant="outline-dark">
          See the full process
        </Button>
      }
    />
  );

  if (!isDesktop) {
    return (
      <section className="section-y bg-cream">
        <div className="container-x">
          {heading}
          <Stagger className="mt-14 grid gap-12 sm:grid-cols-2">
            {processSteps.map((s) => (
              <RevealItem key={s.id}>
                <StepCard step={s} />
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>
    );
  }

  return <PinnedProcess heading={heading} />;
}

function PinnedProcess({ heading }: { heading: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-58%']);
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={ref} className="relative h-[280vh] bg-cream">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="container-x">{heading}</div>
        <div className="mt-16 pl-[max(4rem,calc((100vw-88rem)/2+4rem))]">
          <motion.div style={{ x }} className="flex w-max gap-14">
            {processSteps.map((s) => (
              <div key={s.id} className="w-[22rem] shrink-0">
                <StepCard step={s} />
              </div>
            ))}
          </motion.div>
        </div>
        <div className="container-x mt-14">
          <div className="h-px w-full bg-ink/10">
            <motion.div style={{ width: bar }} className="h-px bg-spice" />
          </div>
        </div>
      </div>
    </section>
  );
}
