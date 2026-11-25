import { Button } from '@/components/ui/Button';
import { SplitText } from '@/animations/SplitText';
import { Reveal } from '@/animations/Reveal';
import { Marquee } from '@/components/ui/Marquee';

interface CTASectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  accentWords?: number[];
}

/** Closing call-to-action used across pages. */
export function CTASection({
  eyebrow = 'Trade & retail enquiries',
  title = 'Bring the spice house\nto your shelf.',
  description = 'Distributors, retailers, restaurants and food-service partners — tell us what you need and our team will get back to you.',
  accentWords = [5, 6],
}: CTASectionProps) {
  return (
    <section className="grain relative overflow-hidden bg-spice text-ivory">
      <Marquee
        items={['Turmeric', 'Kashmiri Chilli', 'Black Pepper', 'Coriander', 'Cumin', 'Cardamom', 'Garam Masala', 'Biryani Masala']}
        className="border-b border-ivory/15 py-5 font-display text-2xl italic text-ivory/80 md:text-3xl"
        separatorClassName="text-gold-light not-italic text-base"
      />
      <div className="container-x section-y grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <Reveal>
            <span className="eyebrow flex items-center gap-3 text-gold-light">
              <span aria-hidden="true" className="h-px w-8 bg-gold-light/60" />
              {eyebrow}
            </span>
          </Reveal>
          <SplitText text={title} className="mt-6 text-headline text-balance" accentWords={accentWords} accentClassName="italic text-gold-light" />
        </div>
        <Reveal className="flex flex-col gap-8 lg:col-span-4" delay={0.15}>
          <p className="text-lg leading-relaxed text-ivory/80">{description}</p>
          <div className="flex flex-wrap gap-3">
            <Button to="/contact" variant="gold" size="lg">
              Start a conversation
            </Button>
            <Button to="/products" variant="outline-light" size="lg">
              View range
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
