import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { collectionImage } from '@/data/images';
import { products } from '@/data/products';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Reveal, RevealItem, Stagger } from '@/animations/Reveal';

/** Full-bleed group shot of the whole range, with a slow parallax and links to every jar. */
export function CollectionShowcase() {
  const frame = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  return (
    <section className="grain-light section-y overflow-hidden bg-burgundy-deep text-ivory" aria-labelledby="collection-heading">
      <div className="container-x">
        <SectionHeading
          eyebrow="The collection"
          title="Twelve jars. One spice cupboard."
          accentWords={[3, 4]}
          tone="light"
          description="Pure ground spices, heritage masalas and whole spices — sealed in glass under a gold lid, so you can see the colour before you open it."
          action={
            <Button to="/products" variant="gold">
              Shop the range
            </Button>
          }
        />
      </div>

      <Reveal className="container-x mt-14 lg:mt-20">
        <div ref={frame} className="relative aspect-[4/3] overflow-hidden shadow-[0_50px_100px_-40px_rgba(0,0,0,0.8)] sm:aspect-[16/9]">
          <motion.img
            style={{ y, scale: 1.14 }}
            src={collectionImage.src}
            srcSet={collectionImage.srcSet}
            sizes="(min-width: 1440px) 1400px, 100vw"
            width={collectionImage.width}
            height={collectionImage.height}
            alt="The full range of twelve spice jars with gold lids — turmeric, Kashmiri chilli, coriander, cumin, black pepper, garam, sambar, biryani, chicken and chaat masalas, black peppercorns and green cardamom — arranged on wooden risers"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/25" />
        </div>
      </Reveal>

      <div className="container-x mt-10">
        <h3 id="collection-heading" className="sr-only">
          Products in the collection
        </h3>
        <Stagger as="ul" className="flex flex-wrap gap-2">
          {products.map((p) => (
            <RevealItem as="li" key={p.slug}>
              <Link
                to={`/products/${p.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-ivory/15 px-4 py-2 text-sm text-ivory/80 transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-ink"
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: p.palette.spice }} />
                {p.name}
              </Link>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
