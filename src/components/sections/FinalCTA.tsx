import { useNavigate } from 'react-router-dom'
import { MagneticButton } from '../ui/MagneticButton'
import { RevealText } from '../ui/RevealText'

/** Section 8 — the jar returns to centre stage, wrapped in glowing spice. */
export function FinalCTA() {
  const navigate = useNavigate()
  return (
    <section
      id="final"
      data-section="final"
      className="relative flex h-svh min-h-[640px] flex-col items-center justify-between overflow-hidden pb-10 pt-28 text-center"
      aria-label="Bring home the magic of flavour"
    >
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_55%,#3b1a09_0%,#170a04_50%,#0b0806_85%)]" />
      <div aria-hidden className="beam absolute -top-[10%] left-1/2 h-[110%] w-[140%] -translate-x-1/2" />

      {/* headline straddles the jar: first line above, second line below */}
      <RevealText
        className="display relative px-4 text-[clamp(2.4rem,6.6vw,7rem)] text-cream"
        lines={[<span key="a">Bring home the</span>]}
      />
      <div className="relative z-20 flex flex-col items-center gap-8 px-5">
        <RevealText
          className="display text-[clamp(2.4rem,6.6vw,7rem)] italic"
          lines={[
            <span key="b" className="gold-text">
              magic of flavour.
            </span>,
          ]}
        />
        <div className="flex flex-wrap justify-center gap-3">
          <MagneticButton onClick={() => navigate('/shop')}>Shop now</MagneticButton>
          <MagneticButton variant="ghost" onClick={() => navigate('/blends')}>
            Discover our blends
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
