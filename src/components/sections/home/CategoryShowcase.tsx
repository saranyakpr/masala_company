import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '@/data/categories';
import { products } from '@/data/products';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PackVisual } from '@/components/product/PackVisual';
import { RevealItem, Stagger } from '@/animations/Reveal';

const tones = ['bg-burgundy', 'bg-spice-deep', 'bg-earth-deep'];

export function CategoryShowcase() {
  return (
    <section className="section-y bg-ivory">
      <div className="container-x">
        <SectionHeading eyebrow="The range" title="Three ways to bring spice home." accentWords={[4, 5]} />
        <Stagger as="ul" className="mt-16 grid gap-4 md:grid-cols-3 lg:mt-20">
          {categories.map((c, i) => {
            const sample = products.find((p) => p.category === c.id);
            const count = products.filter((p) => p.category === c.id).length;
            return (
              <RevealItem as="li" key={c.id}>
                <Link
                  to={`/products?category=${c.id}`}
                  className={`group grain-light relative flex h-[30rem] flex-col overflow-hidden p-8 text-ivory lg:h-[36rem] ${tones[i]}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-display text-6xl italic text-gold-light/80">0{i + 1}</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 transition-all duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </div>
                  {sample && (
                    <div
                      aria-hidden="true"
                      className="absolute -bottom-10 right-[-12%] w-[62%] rotate-[8deg] transition-transform duration-700 ease-[var(--ease-premium)] group-hover:-translate-y-6 group-hover:rotate-[2deg]"
                    >
                      <PackVisual product={sample} />
                    </div>
                  )}
                  <div className="relative mt-auto max-w-[60%]">
                    <p className="eyebrow text-[0.62rem] text-ivory/55">{count} products</p>
                    <h3 className="mt-3 text-4xl leading-none">{c.name}</h3>
                    <p className="mt-3 font-display text-lg italic text-gold-light">{c.tagline}</p>
                    <p className="mt-4 text-sm leading-relaxed text-ivory/65 opacity-100 transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100">
                      {c.description}
                    </p>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
