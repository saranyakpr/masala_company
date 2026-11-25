import { ShieldCheck } from 'lucide-react';
import { certifications, qualityChecks } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { PendingBadge } from '@/components/ui/PendingBadge';
import { RevealItem, Stagger } from '@/animations/Reveal';

export function QualityPreview() {
  return (
    <section className="section-y bg-ivory">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Quality & certifications"
            title="Checked at every step of the line."
            accentWords={[2, 3]}
            description="Quality is not a final inspection — it is built into each stage, from incoming lots to sealed packs."
          />
          <div className="mt-10">
            <Button to="/quality" variant="ink">
              Our quality approach
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <Stagger as="ul" className="divide-y divide-line border-y border-line">
            {qualityChecks.map((q, i) => (
              <RevealItem as="li" key={q.title} className="grid grid-cols-[3rem_1fr] gap-4 py-7">
                <span className="font-display text-xl italic text-spice">0{i + 1}</span>
                <div>
                  <h3 className="text-2xl">{q.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft/75">{q.description}</p>
                </div>
              </RevealItem>
            ))}
          </Stagger>

          <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {certifications.map((c) => (
              <RevealItem key={c.id} className="flex aspect-square flex-col items-center justify-center gap-3 border border-dashed border-gold/60 bg-cream p-4 text-center">
                <ShieldCheck aria-hidden="true" className="h-7 w-7 text-gold" strokeWidth={1.25} />
                <span className="text-xs font-semibold leading-snug text-ink-soft">{c.title}</span>
              </RevealItem>
            ))}
          </Stagger>
          <div className="mt-4">
            <PendingBadge label="Certification slots — awaiting client documents" />
          </div>
        </div>
      </div>
    </section>
  );
}
