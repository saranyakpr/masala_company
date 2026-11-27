import { Link, useNavigate } from 'react-router-dom'
import { MagneticButton } from '../components/ui/MagneticButton'
import { PageHeader } from '../components/ui/PageHeader'
import { ProductExplorer } from '../components/ui/ProductExplorer'
import { FadeUp, RevealText } from '../components/ui/RevealText'
import { blendProducts, productById } from '../data/products'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function BlendsPage({ webgl }: { webgl: boolean }) {
  useDocumentTitle('Our Blend', 'Signature masalas — garam masala, chicken masala, mutton masala, biryani masala, sambar masala and rasam powder.')
  const navigate = useNavigate()
  return (
    <div className="relative z-20 bg-coal">
      <PageHeader
        eyebrow="Our blend"
        title={[<span key="a">Signature</span>, <span key="b" className="italic gold-text">masalas.</span>]}
        intro="Six blends, each balanced spice by spice for the dish it is named after. Open a jar and the hard work is already done."
        glow="#a9441f"
      />
      <ProductExplorer list={blendProducts} webgl={webgl} />

      {/* the dish each blend was built for */}
      <section className="border-t border-cream/5 px-5 py-24 sm:px-8 lg:px-12" aria-label="Made for">
        <div className="mx-auto max-w-[1600px]">
          <RevealText
            className="display text-[clamp(2.4rem,4.6vw,4.6rem)] text-cream"
            lines={[<span key="a">One blend.</span>, <span key="b" className="italic gold-text">One perfect dish.</span>]}
          />
          <ol className="mt-12 divide-y divide-cream/10 border-y border-cream/10">
            {blendProducts.map((b, i) => (
              <FadeUp as="li" key={b.id} delay={i * 0.04}>
                <Link to={`/blends?item=${b.id}`} className="group grid items-center gap-4 py-6 sm:grid-cols-[4rem_1fr_1.2fr_auto]">
                  <span className="font-brand text-xs tracking-[0.3em] text-cream/35">0{i + 1}</span>
                  <span className="display text-3xl text-cream transition-transform duration-700 ease-[var(--ease-cinema)] group-hover:translate-x-2 sm:text-4xl">
                    {b.name}
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {b.pairs.map((d) => (
                      <span key={d} className="rounded-full border border-cream/10 px-3 py-1 text-xs text-cream/65">
                        {d}
                      </span>
                    ))}
                  </span>
                  <span className="flex items-center gap-2">
                    {b.garnish.map((_, k) => (
                      <span key={k} className="h-3 w-3 rounded-full" style={{ background: productById(b.id)!.powder, opacity: 1 - k * 0.25 }} />
                    ))}
                  </span>
                </Link>
              </FadeUp>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap gap-3">
            <MagneticButton onClick={() => navigate('/shop?category=blend')}>Shop all blends</MagneticButton>
            <MagneticButton variant="ghost" onClick={() => navigate('/spices')}>
              Explore single spices
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  )
}
