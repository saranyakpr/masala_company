import { useNavigate } from 'react-router-dom'
import { MagneticButton } from '../components/ui/MagneticButton'
import { PageHeader } from '../components/ui/PageHeader'
import { ProductExplorer } from '../components/ui/ProductExplorer'
import { FadeUp, RevealText } from '../components/ui/RevealText'
import { spiceProducts } from '../data/products'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const forms = [
  { k: 'Ground powders', ids: spiceProducts.filter((p) => p.form === 'powder'), text: 'Ready the moment the pan is hot — colour, body and heat in a spoonful.' },
  { k: 'Whole seeds', ids: spiceProducts.filter((p) => p.form === 'seeds'), text: 'Crackled in hot oil, toasted, or freshly ground — the start of every tempering.' },
  { k: 'Whole spices', ids: spiceProducts.filter((p) => p.form === 'whole'), text: 'Pods, quills and buds that perfume rice, curries and chai as they simmer.' },
]

export default function SpicesPage({ webgl }: { webgl: boolean }) {
  useDocumentTitle('Our Spices', 'Twelve essential Indian spices — turmeric, chilli, coriander, pepper, cumin, mustard, cardamom, cinnamon, cloves, fennel, fenugreek and dry ginger.')
  const navigate = useNavigate()
  return (
    <div className="relative z-20 bg-coal">
      <PageHeader
        eyebrow="Our spices"
        title={[<span key="a">Twelve spices.</span>, <span key="b" className="italic gold-text">Endless dishes.</span>]}
        intro="The essentials of the Indian kitchen, each treated as the hero it is. Turn the jar, explore its character, and find the spice your next dish is waiting for."
      />
      <ProductExplorer list={spiceProducts} webgl={webgl} />

      <section className="border-t border-cream/5 px-5 py-24 sm:px-8 lg:px-12" aria-label="Forms">
        <div className="mx-auto max-w-[1600px]">
          <RevealText
            className="display text-[clamp(2.4rem,4.6vw,4.6rem)] text-cream"
            lines={[<span key="a">Ground, seed</span>, <span key="b" className="italic gold-text">or whole.</span>]}
          />
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {forms.map((f, i) => (
              <FadeUp key={f.k} delay={i * 0.08} className="border-t border-cream/10 pt-6">
                <p className="font-brand text-xs tracking-[0.3em] text-gold">0{i + 1}</p>
                <h3 className="display mt-3 text-3xl text-cream">{f.k}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/60">{f.text}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {f.ids.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => navigate(`/spices?item=${p.id}`)}
                        className="flex items-center gap-2 rounded-full border border-cream/10 px-3 py-1.5 text-xs text-cream/75 transition-colors hover:border-gold/60 hover:text-cream"
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.powder }} />
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </FadeUp>
            ))}
          </div>
          <div className="mt-16 flex flex-wrap gap-3">
            <MagneticButton onClick={() => navigate('/shop?category=spice')}>Shop all spices</MagneticButton>
            <MagneticButton variant="ghost" onClick={() => navigate('/blends')}>
              See our blends
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  )
}
