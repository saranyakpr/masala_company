import { ContactSection } from '../components/sections/ContactSection'
import { Emblem } from '../components/ui/Logo'
import { PageHeader } from '../components/ui/PageHeader'
import { FadeUp } from '../components/ui/RevealText'
import { company } from '../data/company'
import { useDocumentTitle } from '../lib/useDocumentTitle'

function MapPanel() {
  if (company.mapEmbedUrl) {
    return (
      <iframe
        title={`${company.name} location`}
        src={company.mapEmbedUrl}
        className="h-full w-full grayscale-[0.4] invert-[0.92] hue-rotate-180"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    )
  }
  // Styled placeholder until a Google Maps embed URL is added in src/data/company.ts
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0f0906]">
      <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full opacity-60" aria-hidden preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 14 }, (_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 38 + 10} C200 ${i * 38 + 30}, 500 ${i * 38 - 10}, 800 ${i * 38 + 15}`} stroke="#d4a24c" strokeOpacity="0.12" fill="none" />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`v${i}`} d={`M${i * 72 + 20} 0 C${i * 72 + 40} 200, ${i * 72 - 10} 330, ${i * 72 + 30} 500`} stroke="#d4a24c" strokeOpacity="0.1" fill="none" />
        ))}
        <path d="M80 420 C240 300 360 330 420 250 S620 120 760 90" stroke="#d9531e" strokeOpacity="0.5" strokeWidth="3" fill="none" />
      </svg>
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
        <Emblem className="h-14 w-14" />
        <span className="mt-1 h-6 w-px bg-gold" />
        <span className="h-2 w-2 rounded-full bg-ember shadow-[0_0_0_8px_rgba(217,83,30,0.2)]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-coal to-transparent p-6">
        <p className="text-sm text-cream/80">{company.address}</p>
        {company.mapLink && (
          <a href={company.mapLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold uppercase tracking-[0.22em] text-gold-soft">
            Open in Google Maps →
          </a>
        )}
      </div>
    </div>
  )
}

export default function ContactPage() {
  useDocumentTitle('Contact', `Contact ${company.name} for retail, wholesale and distribution enquiries.`)
  return (
    <div className="relative z-20 bg-coal">
      <PageHeader
        eyebrow="Contact"
        title={[<span key="a">Let's talk</span>, <span key="b" className="italic gold-text">flavour.</span>]}
        intro="Retail orders, wholesale, distribution or simply a question about a spice — we'd love to hear from you."
      />
      <ContactSection compact />

      <section className="px-5 pb-28 sm:px-8 lg:px-12" aria-label="Find us">
        <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-[1.4fr_1fr]">
          <FadeUp className="aspect-[16/10] overflow-hidden rounded-sm border border-cream/10">
            <MapPanel />
          </FadeUp>
          <FadeUp delay={0.1} className="flex flex-col justify-between gap-10 border-t border-cream/10 pt-8 lg:border-t-0 lg:pt-0">
            <div>
              <p className="eyebrow mb-4">Visit us</p>
              <p className="display text-3xl text-cream">{company.address}</p>
              {company.hours && <p className="mt-3 text-sm text-cream/55">{company.hours}</p>}
            </div>
            <div>
              <p className="eyebrow mb-4">Follow 12 Spices</p>
              <ul className="flex flex-wrap gap-3">
                {company.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target={s.href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="inline-block rounded-full border border-cream/15 px-5 py-2.5 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-cream/75 transition-colors hover:border-gold hover:bg-gold hover:text-coal"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
