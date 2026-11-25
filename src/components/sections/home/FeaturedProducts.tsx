import { featuredProducts } from '@/data/products';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';

export function FeaturedProducts() {
  return (
    <section className="section-y bg-cream">
      <div className="container-x">
        <SectionHeading
          eyebrow="Featured spices"
          title="Signature spices, ground for colour and aroma."
          accentWords={[4, 5, 6]}
          description="A few of the spices and masalas our kitchen partners reach for first."
          action={
            <Button to="/products" variant="outline-dark">
              View all products
            </Button>
          }
        />
        <ProductGrid products={featuredProducts.slice(0, 4)} columns={4} className="mt-16 lg:mt-20" />
      </div>
    </section>
  );
}
