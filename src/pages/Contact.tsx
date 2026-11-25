import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { site } from '@/data/site';
import { getProduct } from '@/data/products';
import { PageHero } from '@/components/sections/PageHero';
import { ContactForm } from '@/components/contact/ContactForm';
import { SocialLinks } from '@/components/common/SocialLinks';
import { PendingBadge } from '@/components/ui/PendingBadge';
import { Reveal } from '@/animations/Reveal';

export default function Contact() {
  useSeo({
    title: 'Contact Us',
    description: `Get in touch with ${site.name} for trade, bulk, product or quality enquiries.`,
    path: '/contact',
  });

  const [params] = useSearchParams();
  const initial = useMemo(() => {
    const product = getProduct(params.get('product') ?? '');
    if (product) {
      return {
        subject: 'Product information',
        message: `Hello, I’d like to know more about ${product.name} — pack sizes, pricing and availability.`,
      };
    }
    const subject = params.get('subject');
    return subject ? { subject } : undefined;
  }, [params]);

  const details = [
    { icon: MapPin, label: 'Visit', lines: site.contact.addressLines, href: undefined },
    { icon: Phone, label: 'Call', lines: [site.contact.phone], href: `tel:${site.contact.phone.replace(/\s/g, '')}` },
    { icon: Mail, label: 'Email', lines: [site.contact.email, site.contact.salesEmail], href: `mailto:${site.contact.email}` },
    { icon: Clock, label: 'Hours', lines: [site.contact.hours], href: undefined },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title={'Let’s talk\nspice.'}
        accentWords={[2]}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        description="Trade partners, retailers, chefs and home cooks — whatever your question, we’d love to hear from you."
      />

      <section className="section-y bg-ivory">
        <div className="container-x grid gap-16 lg:grid-cols-12 lg:gap-20">
          <aside className="lg:col-span-5">
            <Reveal>
              <h2 className="text-4xl">Get in touch</h2>
              <PendingBadge className="mt-4" label="Contact details are placeholders" />
            </Reveal>
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {details.map(({ icon: Icon, label, lines, href }, i) => (
                <Reveal as="li" key={label} delay={i * 0.06} className="grid grid-cols-[2.5rem_1fr] gap-4 py-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-spice">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="eyebrow text-[0.6rem] text-ink/45">{label}</p>
                    {lines.map((l, li) =>
                      href ? (
                        <a
                          key={l}
                          href={label === 'Email' ? `mailto:${l}` : href}
                          className="link-underline mt-1 block break-all text-lg text-ink"
                        >
                          {l}
                        </a>
                      ) : (
                        <p key={li} className="mt-1 text-lg text-ink">
                          {l}
                        </p>
                      ),
                    )}
                  </div>
                </Reveal>
              ))}
            </ul>
            <Reveal className="mt-10">
              <p className="eyebrow text-[0.6rem] text-ink/45">Follow</p>
              <SocialLinks tone="dark" className="mt-4" />
            </Reveal>
          </aside>

          <div className="lg:col-span-7">
            <Reveal className="bg-cream p-6 sm:p-10 lg:p-14">
              <h2 className="text-4xl">Send an enquiry</h2>
              <p className="mt-3 text-ink-soft/70">We usually reply within one or two working days.</p>
              <div className="mt-10">
                <ContactForm initial={initial} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <MapBlock />
    </>
  );
}

function MapBlock() {
  const url = site.contact.mapEmbedUrl;
  return (
    <section aria-label="Location map" className="bg-ivory pb-24">
      <div className="container-x">
        <Reveal className="relative h-[26rem] overflow-hidden bg-burgundy-deep lg:h-[32rem]">
          {url ? (
            <iframe
              title={`${site.name} location on Google Maps`}
              src={url}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0 grayscale-[30%]"
              allowFullScreen
            />
          ) : (
            <div className="grain-light relative flex h-full flex-col items-center justify-center gap-5 p-8 text-center text-ivory">
              {/* stylised map grid */}
              <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-20" preserveAspectRatio="none">
                <defs>
                  <pattern id="map-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path d="M48 0H0V48" fill="none" stroke="#e4c17a" strokeWidth="0.6" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#map-grid)" />
                <path d="M0 300 C 300 220, 500 380, 900 260 S 1500 200, 2000 320" fill="none" stroke="#e4c17a" strokeWidth="2" />
                <path d="M200 0 C 260 200, 420 300, 380 600" fill="none" stroke="#e4c17a" strokeWidth="1.2" />
              </svg>
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-spice">
                <span className="absolute inset-0 animate-ping rounded-full bg-spice/40" />
                <MapPin aria-hidden="true" className="relative h-6 w-6" />
              </span>
              <p className="relative font-display text-3xl">Map coming soon</p>
              <p className="relative max-w-sm text-sm text-ivory/60">
                Google Maps will appear here once the factory location is confirmed. Add the embed URL to <code>site.contact.mapEmbedUrl</code>.
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
