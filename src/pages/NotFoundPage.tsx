import { Link } from 'react-router-dom'
import { Emblem } from '../components/ui/Logo'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <div className="relative z-20 flex min-h-svh flex-col items-center justify-center bg-coal px-5 text-center">
      <Emblem className="h-20 w-20" animated />
      <h1 className="display mt-8 text-[clamp(3rem,7vw,6rem)] text-cream">
        This spice <span className="italic gold-text">went missing.</span>
      </h1>
      <p className="mt-4 text-cream/60">The page you are looking for doesn't exist.</p>
      <div className="mt-10 flex gap-3">
        <Link to="/" className="rounded-full bg-gold px-7 py-3.5 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-coal">
          Home
        </Link>
        <Link to="/shop" className="rounded-full border border-gold/40 px-7 py-3.5 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-cream">
          Shop now
        </Link>
      </div>
    </div>
  )
}
