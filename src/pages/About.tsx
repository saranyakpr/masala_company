import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { site } from '@/data/site';
import { timeline, values } from '@/data/content';
import { PageHero } from '@/components/sections/PageHero';
import { CTASection } from '@/components/sections/CTASection';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PendingBadge } from '@/components/ui/PendingBadge';
import { Button } from '@/components/ui/Button';
import { SpiceMound } from '@/components/common/SpiceMound';
import { Reveal, RevealItem, Stagger } from '@/animations/Reveal';
import { ScrollRevealText } from '@/animations/ScrollRevealText';
import { MaskReveal } from '@/animations/MaskReveal';
import { rangeSquareImage } from '@/data/images';

const expertise = [
  { title: 'Cleaning & grading', text: 'Removing stones, stems and dust, and grading whole spice for size and uniformity.' },
  { title: 'Controlled drying', text: 'Bringing spices to a stable moisture level that protects colour and aroma.' },
  { title: 'Cool grinding', text: 'Grinding and sieving to a consistent texture while keeping heat low.' },
  { title: 'Recipe blending', text: 'Weighing and mixing heritage masala recipes to the gram, batch after batch.' },
  { title: 'Protective packing', text: 'Sealing spices against light, air and moisture with batch coding on every pack.' },
  { title: 'Retail & trade packs', text: 'Formats for home kitchens, food service and trade partners.' },
];

export default function About() {
  useSeo({
    title: 'About Us',
    description: `The story, vision and values behind ${site.name} — a spice house built on patience, purity and precision.`,
    path: '/about',
  });

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={'A spice house\nbuilt on patience.'}
        accentWords={[5]}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        description="We believe spice should taste of itself. Everything we do — from choosing a lot to sealing a pack — is in service of that idea."
        aside={
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            className="group relative mx-auto aspect-square w-full max-w-md"
          >
            <div aria-hidden="true" className="absolute -inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(201,154,62,0.35),transparent_65%)] blur-2xl" />
            <div aria-hidden="true" className="absolute inset-0 rounded-full border border-gold/30" />
            <div aria-hidden="true" className="jar3d-ring absolute -inset-[4%] rounded-full border border-dashed border-gold/25" />
            <div className="absolute inset-[7%] overflow-hidden rounded-full ring-1 ring-gold/60 shadow-[0_40px_80px_-25px_rgba(0,0,0,0.85),inset_0_0_0_1px_rgba(255,236,200,0.1)]">
              <img
                src={rangeSquareImage.src}
                srcSet={rangeSquareImage.srcSet}
                sizes="(min-width: 1024px) 26rem, 85vw"
                width={rangeSquareImage.width}
                height={rangeSquareImage.height}
                alt="The full range of spice jars with gold lids arranged on wooden risers"
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-premium)] group-hover:scale-[1.06]"
              />
              <div aria-hidden="true" className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,236,200,0.18),transparent_45%),radial-gradient(circle_at_50%_50%,transparent_55%,rgba(38,6,11,0.55))]" />
            </div>
            <div aria-hidden="true" className="absolute inset-[11%] rounded-full border border-gold-light/25" />
          </motion.div>
        }
      />

      {/* Introduction */}
      <section className="grain section-y bg-ivory">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <span className="eyebrow flex items-center gap-3 text-spice">
                <span aria-hidden="true" className="h-px w-8 bg-spice/60" />
                Who we are
              </span>
            </Reveal>
            <Reveal delay={0.1} className="mt-6">
              <PendingBadge label="Company facts pending: founding year, location, scale" />
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <h2 className="sr-only">Company introduction</h2>
            <ScrollRevealText
              className="font-display text-[clamp(1.6rem,3vw,2.8rem)] leading-[1.15] tracking-[-0.02em]"
              accentWords={[7]}
              text={`We are a spice manufacturer devoted to pure ground spices, whole spices and heritage masala blends — made for home kitchens, restaurants and trade partners who care what goes into the pot.`}
            />
            <div className="mt-12 grid gap-8 text-ink-soft/80 md:grid-cols-2">
              <Reveal>
                <p className="leading-relaxed">
                  Our work begins with the raw spice. We look for lots with the right colour, aroma and density, then clean and grade
                  them so that only sound material moves forward.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="leading-relaxed">
                  From there it is a matter of patience and precision: drying to the right point, grinding cool to protect volatile
                  oils, and blending our masalas to recipes weighed to the gram.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="section-y bg-cream">
        <div className="container-x grid gap-16 lg:grid-cols-2 lg:items-center">
          <MaskReveal className="relative aspect-[4/5] overflow-hidden bg-burgundy">
            <div className="grain-light flex h-full flex-col justify-between p-10 text-ivory">
              <span className="eyebrow text-gold-light">Our story</span>
              <div className="-mx-4">
                <SpiceMound color="#b3221f" colorDeep="#7d1015" label="Kashmiri chilli" />
              </div>
              <p className="font-display text-3xl italic leading-snug text-ivory/90">“Spice should taste of where it grew.”</p>
            </div>
          </MaskReveal>
          <div>
            <SectionHeading eyebrow="Brand story" title="Rooted in the kitchen, refined on the line." accentWords={[3]} />
            <Reveal delay={0.1}>
              <p className="mt-8 text-lg leading-relaxed text-ink-soft/80">
                Every Indian kitchen has its own masala — the one that tastes like home. Our blends start from those same
                traditions: roasted whole spices, balanced by hand, ground with care.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 leading-relaxed text-ink-soft/80">
                What we add is consistency. Careful sourcing, controlled processing and batch checks mean the pack you open next
                month tastes like the one you loved today.
              </p>
            </Reveal>
            <Reveal delay={0.25} className="mt-8">
              <PendingBadge label="Founder story to be written with the client" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Vision & mission */}
      <section className="bg-ivory">
        <div className="grid md:grid-cols-2">
          {[
            { k: 'Our vision', t: 'To be the spice house that kitchens trust without a second thought.', bg: 'bg-burgundy' },
            { k: 'Our mission', t: 'To deliver pure, honest spices — carefully processed, consistently checked and sealed at their peak.', bg: 'bg-spice' },
          ].map((b, i) => (
            <div key={b.k} className={`grain-light ${b.bg} px-6 py-24 text-ivory md:px-12 lg:px-20 lg:py-36`}>
              <Reveal delay={i * 0.1}>
                <span className="eyebrow text-gold-light">{b.k}</span>
                <p className="mt-8 max-w-lg font-display text-[clamp(1.8rem,3.2vw,3rem)] leading-[1.12]">{b.t}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="section-y bg-ivory">
        <div className="container-x">
          <SectionHeading eyebrow="Our values" title="Four words we work by." accentWords={[1]} align="center" />
          <Stagger className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {values.map((v, i) => (
              <RevealItem key={v.title} className="group bg-ivory p-8 transition-colors duration-500 hover:bg-cream lg:p-10">
                <span className="font-display text-sm italic text-spice">0{i + 1}</span>
                <h3 className="mt-10 text-4xl transition-transform duration-500 group-hover:-translate-y-1">{v.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft/75">{v.description}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Manufacturing expertise */}
      <section className="grain-light section-y bg-burgundy-deep text-ivory">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              tone="light"
              eyebrow="Manufacturing expertise"
              title="Craft, carried out with control."
              accentWords={[0]}
              description="The capabilities at the heart of our production line."
            />
            <Reveal delay={0.2} className="mt-8 flex flex-col items-start gap-6">
              <PendingBadge tone="light" label="Facility, machinery & capacity details pending" />
              <Button to="/process" variant="outline-light">
                Walk through the process
              </Button>
            </Reveal>
          </div>
          <Stagger as="ul" className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7">
            {expertise.map((e) => (
              <RevealItem as="li" key={e.title} className="flex gap-4 border-t border-ivory/10 py-7">
                <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-gold" />
                <div>
                  <h3 className="text-2xl">{e.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/65">{e.text}</p>
                </div>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      <Timeline />

      <CTASection />
    </>
  );
}

function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.6'] });
  const height = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section className="section-y bg-cream">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our journey"
          title="The story so far."
          accentWords={[1]}
          description="Milestones will be filled in with the client — the structure is ready."
        />
        <div ref={ref} className="relative mt-16 lg:mt-20">
          <div aria-hidden="true" className="absolute bottom-0 left-[7px] top-0 w-px bg-ink/10 md:left-1/2">
            <motion.div style={{ height }} className="w-px bg-spice" />
          </div>
          <ol className="space-y-16">
            {timeline.map((t, i) => (
              <li key={t.title} className="relative grid gap-4 pl-10 md:grid-cols-2 md:gap-16 md:pl-0">
                <span aria-hidden="true" className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 border-spice bg-cream md:left-1/2 md:-translate-x-1/2" />
                <Reveal className={i % 2 ? 'md:order-2' : 'md:text-right'}>
                  <span className="font-display text-5xl italic text-spice/80">{t.year}</span>
                </Reveal>
                <Reveal delay={0.1} className={i % 2 ? 'md:order-1 md:text-right' : ''}>
                  <h3 className="text-3xl">{t.title}</h3>
                  <p className="mt-3 text-ink-soft/75">{t.description}</p>
                  {t.pending && <PendingBadge className="mt-4" />}
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
