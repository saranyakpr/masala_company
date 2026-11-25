import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ScrollRevealText } from '@/animations/ScrollRevealText';
import { Reveal, RevealItem, Stagger } from '@/animations/Reveal';

const pillars = [
  { k: 'Sourced', v: 'Lot by lot, for colour, aroma and density.' },
  { k: 'Slow-dried', v: 'To lock in volatile oils and natural colour.' },
  { k: 'Ground cool', v: 'Low-heat grinding that protects the aroma.' },
];

export function BrandIntro() {
  return (
    <section className="grain section-y bg-ivory">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <Reveal>
            <span className="eyebrow flex items-center gap-3 text-spice">
              <span aria-hidden="true" className="h-px w-8 bg-spice/60" />
              The spice house
            </span>
          </Reveal>
        </div>
        <div className="lg:col-span-9">
          <h2 className="sr-only">About our spices</h2>
          <ScrollRevealText
            className="font-display text-[clamp(1.75rem,3.6vw,3.4rem)] leading-[1.12] tracking-[-0.02em] text-ink"
            accentWords={[3, 4, 14]}
            text="Great cooking begins long before the pan. It begins in the field, in the patience of drying, and in the care of a grind that keeps every note intact — that is the work we do, one batch at a time."
          />
          <Stagger className="mt-16 grid gap-10 border-t border-line pt-10 sm:grid-cols-3">
            {pillars.map((p, i) => (
              <RevealItem key={p.k}>
                <span className="font-display text-sm italic text-spice">0{i + 1}</span>
                <h3 className="mt-2 text-2xl">{p.k}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft/75">{p.v}</p>
              </RevealItem>
            ))}
          </Stagger>
          <Reveal className="mt-12">
            <Link to="/about" className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-ink">
              <span className="link-underline">Read our story</span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
