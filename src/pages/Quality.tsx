import { FileText, FlaskConical, ScanLine, ShieldCheck } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { certifications, qualityChecks } from '@/data/content';
import { PageHero } from '@/components/sections/PageHero';
import { CTASection } from '@/components/sections/CTASection';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PendingBadge } from '@/components/ui/PendingBadge';
import { Reveal, RevealItem, Stagger } from '@/animations/Reveal';

/**
 * Typical spice quality parameters. These are presented as a framework, NOT as tests
 * the client performs — the QA team must confirm what is tested and where.
 */
const parameters = [
  { name: 'Moisture content', why: 'Stability and free flow; guards against spoilage.' },
  { name: 'Colour value', why: 'Consistency of natural colour, e.g. in chilli and turmeric.' },
  { name: 'Volatile oil', why: 'An indicator of aroma strength and freshness.' },
  { name: 'Foreign matter', why: 'Absence of stones, stems, dust and extraneous material.' },
  { name: 'Particle size', why: 'Even texture and predictable cooking behaviour.' },
  { name: 'Microbiological', why: 'Food-safety assurance for ready-to-use spices.' },
  { name: 'Pesticide residues', why: 'Compliance with applicable residue limits.' },
  { name: 'Aflatoxins & heavy metals', why: 'Contaminant screening to applicable limits.' },
];

const batchParts = [
  { code: 'TM', label: 'Product code' },
  { code: '25', label: 'Year' },
  { code: '11', label: 'Month' },
  { code: '042', label: 'Batch no.' },
];

export default function Quality() {
  useSeo({
    title: 'Quality & Certifications',
    description: 'Our quality-control approach — incoming inspection, in-process checks, finished-product testing and batch traceability.',
    path: '/quality',
  });

  return (
    <>
      <PageHero
        eyebrow="Quality & certifications"
        title={'Quality you can\ntaste — and trace.'}
        accentWords={[5, 6]}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Quality' }]}
        description="Quality is built into every stage of the line — not checked at the end. Here is the framework that keeps each batch consistent."
      />

      {/* QC process */}
      <section className="section-y bg-ivory">
        <div className="container-x">
          <SectionHeading eyebrow="Quality control process" title="Four gates every batch passes." accentWords={[1]} />
          <Stagger as="ol" className="relative mt-16 grid gap-10 md:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-0">
            {qualityChecks.map((q, i) => (
              <RevealItem as="li" key={q.title} className="relative lg:pr-10">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-spice font-display text-xl italic text-spice">
                    {i + 1}
                  </span>
                  {i < qualityChecks.length - 1 && <span aria-hidden="true" className="hidden h-px flex-1 bg-line lg:block" />}
                </div>
                <h3 className="mt-6 text-3xl">{q.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft/75">{q.description}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Testing & safety */}
      <section className="grain-light section-y bg-burgundy-deep text-ivory">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              tone="light"
              eyebrow="Testing & safety"
              title="What a spice should be tested for."
              accentWords={[5, 6]}
              description="These are the parameters typically assessed in spice quality and safety testing."
            />
            <Reveal delay={0.2} className="mt-8 space-y-4">
              <PendingBadge tone="light" label="Client to confirm in-house vs. external lab testing" />
              <p className="flex gap-3 text-sm leading-relaxed text-ivory/60">
                <FlaskConical aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                Specific limits, methods and laboratory details will be published once provided by the client’s QA team.
              </p>
            </Reveal>
          </div>
          <Stagger as="ul" className="grid gap-px bg-ivory/10 sm:grid-cols-2 lg:col-span-7">
            {parameters.map((p, i) => (
              <RevealItem as="li" key={p.name} className="bg-burgundy-deep p-7">
                <span className="font-display text-sm italic text-gold-light/70">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-2xl">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/60">{p.why}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Certifications */}
      <section className="section-y bg-cream">
        <div className="container-x">
          <SectionHeading
            eyebrow="Certifications"
            title="Certificates, displayed in full."
            accentWords={[2, 3]}
            description="Each frame below is reserved for a certificate or licence. Nothing is claimed here until the client supplies the documents."
          />
          <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {certifications.map((c) => (
              <RevealItem key={c.id} as="article" className="group">
                <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-5 border border-dashed border-gold/70 bg-ivory p-8 text-center transition-colors duration-500 group-hover:bg-sand/40">
                  <span aria-hidden="true" className="absolute inset-3 border border-gold/20" />
                  <ShieldCheck aria-hidden="true" className="h-12 w-12 text-gold transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />
                  <span className="eyebrow text-[0.6rem] text-ink/45">Certificate image slot</span>
                </div>
                <h3 className="mt-5 text-2xl">{c.title}</h3>
                <p className="mt-1 text-sm text-ink-soft/70">{c.scope}</p>
                <PendingBadge className="mt-3" label="Awaiting document" />
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Traceability */}
      <section className="section-y bg-ivory">
        <div className="container-x grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Batch traceability"
              title="Every pack can tell its story."
              accentWords={[3, 4, 5]}
              description="A batch code links each pack to its production run and raw-material lots — so any question can be answered quickly and precisely."
            />
            <Reveal delay={0.2} className="mt-8">
              <PendingBadge label="Example format only — actual coding scheme to be confirmed" />
            </Reveal>
          </div>
          <Reveal className="bg-burgundy-deep p-8 text-ivory sm:p-12">
            <p className="flex items-center gap-3 eyebrow text-[0.62rem] text-gold-light">
              <ScanLine aria-hidden="true" className="h-4 w-4" /> Sample batch code
            </p>
            <div className="mt-8 flex flex-wrap items-end gap-3 sm:gap-4">
              {batchParts.map((b, i) => (
                <div key={b.label} className="flex items-end gap-3 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <span className="font-display text-5xl tabular-nums sm:text-6xl">{b.code}</span>
                    <span className="mt-3 h-px w-full bg-gold/60" />
                    <span className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-ivory/55">{b.label}</span>
                  </div>
                  {i < batchParts.length - 1 && <span className="pb-9 font-display text-4xl text-ivory/30">·</span>}
                </div>
              ))}
            </div>
            <p className="mt-10 flex gap-3 border-t border-ivory/10 pt-6 text-sm text-ivory/60">
              <FileText aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              Trade partners can request batch documentation through our contact page.
            </p>
          </Reveal>
        </div>
      </section>

      <CTASection
        eyebrow="Documentation"
        title={'Need quality\ndocuments?'}
        accentWords={[2]}
        description="Request specification sheets, certificates or test reports for a product or batch."
      />
    </>
  );
}
