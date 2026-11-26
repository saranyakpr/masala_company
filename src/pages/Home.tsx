import { useSeo } from '@/hooks/useSeo';
import { site } from '@/data/site';
import { HomeHero } from '@/components/sections/home/HomeHero';
import { BrandIntro } from '@/components/sections/home/BrandIntro';
import { FeaturedProducts } from '@/components/sections/home/FeaturedProducts';
import { CollectionShowcase } from '@/components/sections/home/CollectionShowcase';
import { CategoryShowcase } from '@/components/sections/home/CategoryShowcase';
import { IngredientsPreview } from '@/components/sections/home/IngredientsPreview';
import { ProcessPreview } from '@/components/sections/home/ProcessPreview';
import { QualityPreview } from '@/components/sections/home/QualityPreview';
import { BrandStory } from '@/components/sections/home/BrandStory';
import { CTASection } from '@/components/sections/CTASection';
import { Marquee } from '@/components/ui/Marquee';
import { SpiceFlow } from '@/components/sections/home/SpiceFlow';

export default function Home() {
  useSeo({ title: site.name, description: site.description, path: '/' });
  return (
    <>
      <HomeHero />
      <SpiceFlow />
      <Marquee
        items={['Single-origin spices', 'Slow dried', 'Cool ground', 'Small-batch blends', 'Sealed fresh']}
        className="border-y border-line bg-ivory py-6 font-display text-2xl text-ink/80 md:text-3xl"
        separatorClassName="text-spice text-base"
      />
      <BrandIntro />
      <CollectionShowcase />
      <FeaturedProducts />
      <CategoryShowcase />
      <IngredientsPreview />
      <ProcessPreview />
      <QualityPreview />
      <BrandStory />
      <CTASection />
    </>
  );
}
