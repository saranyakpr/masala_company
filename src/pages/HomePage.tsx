import { featuredSpiceIds, signatureBlendIds } from '../data/products'
import { FinalCTA } from '../components/sections/FinalCTA'
import { FoodExperience } from '../components/sections/FoodExperience'
import { HeroSection } from '../components/sections/HeroSection'
import { ProductShowcase } from '../components/sections/ProductShowcase'
import { SpiceStorySection } from '../components/sections/SpiceStorySection'
import { useDocumentTitle } from '../lib/useDocumentTitle'

/**
 * Home — the cinematic film: hero powder transitions → brand introduction
 * (the pour) → featured spices → signature blends → dishes → shop CTA.
 */
export default function HomePage({ ready, fallback }: { ready: boolean; fallback: boolean }) {
  useDocumentTitle()
  return (
    <>
      <HeroSection ready={ready} fallback={fallback} />
      <SpiceStorySection />
      <ProductShowcase
        id="featured"
        sectionKey="products"
        ids={featuredSpiceIds}
        side="left"
        eyebrow="03 — Featured spice collection"
        title={[<span key="a">Twelve spices.</span>, <span key="b" className="italic text-cream/60">One standard.</span>]}
        allLink={{ to: '/spices', label: 'All 12 spices' }}
      />
      <ProductShowcase
        id="signature-blends"
        sectionKey="blends"
        ids={signatureBlendIds}
        side="right"
        eyebrow="04 — Signature blend showcase"
        title={[<span key="a">Signature</span>, <span key="b" className="italic text-cream/60">blends.</span>]}
        allLink={{ to: '/blends', label: 'Our blends' }}
      />
      <FoodExperience />
      <FinalCTA />
    </>
  )
}
