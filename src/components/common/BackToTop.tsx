import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLenis } from './SmoothScroll';
import { easePremium } from '@/animations/variants';

const SHOW_AT = 200; // px scrolled before the button appears
const HIDE_AT = 160; // a little lower, so it doesn't flicker right at the threshold
const R = 25;
const CIRC = 2 * Math.PI * R;

/**
 * Floating back-to-top button (bottom-right).
 * One passive scroll listener, throttled to animation frames. React only re-renders when
 * visibility flips; the gold scroll-progress ring is updated directly on the SVG.
 */
export function BackToTop() {
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const next = visibleRef.current ? y > HIDE_AT : y > SHOW_AT;
      if (next !== visibleRef.current) {
        visibleRef.current = next;
        setVisible(next);
      }
      if (ring.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, y / max) : 0;
        ring.current.style.strokeDashoffset = String(CIRC * (1 - p));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // keep the progress ring correct on the frame it appears
  useEffect(() => {
    if (visible) window.dispatchEvent(new Event('scroll'));
  }, [visible]);

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: reduced ? 0 : 1.4, immediate: !!reduced });
    else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="to-top"
          className="fixed z-30 [perspective:500px]"
          style={{
            right: 'max(1rem, env(safe-area-inset-right))',
            bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.75rem))',
          }}
          initial={{ opacity: 0, y: 18, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.85 }}
          transition={{ duration: 0.45, ease: easePremium }}
        >
          <button
            type="button"
            onClick={toTop}
            aria-label="Back to top"
            title="Back to top"
            className="group relative grid h-12 w-12 place-items-center rounded-full text-gold-light outline-offset-4 transition-transform duration-500 ease-[var(--ease-premium)] [transform-style:preserve-3d] hover:[transform:translateY(-4px)_rotateX(14deg)] active:translate-y-0 active:scale-95 md:h-14 md:w-14"
          >
            {/* soft drop shadow that spreads as the button lifts */}
            <span
              aria-hidden="true"
              className="absolute inset-x-1 -bottom-2 h-3 rounded-[50%] bg-black/50 blur-md transition-all duration-500 ease-[var(--ease-premium)] group-hover:-bottom-3.5 group-hover:opacity-70 group-hover:blur-lg"
            />
            {/* body: burgundy with a top-lit sheen and gold rim */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-gold/45 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,236,200,0.25)] transition-colors duration-500 group-hover:border-gold"
              style={{ background: 'radial-gradient(circle at 35% 28%, #6a1a22 0%, #3d0b13 55%, #26060b 100%)' }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(228,193,122,0.35),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            {/* scroll-progress ring */}
            <svg aria-hidden="true" viewBox="0 0 56 56" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(228,193,122,0.15)" strokeWidth="1.5" />
              <circle
                ref={ring}
                cx="28"
                cy="28"
                r={R}
                fill="none"
                stroke="url(#to-top-gold)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC}
              />
              <defs>
                <linearGradient id="to-top-gold" x1="0" x2="1">
                  <stop offset="0" stopColor="#c99a3e" />
                  <stop offset="1" stopColor="#f3d9a0" />
                </linearGradient>
              </defs>
            </svg>
            <ArrowUp
              aria-hidden="true"
              strokeWidth={1.75}
              className="relative h-5 w-5 transition-transform duration-500 ease-[var(--ease-premium)] [transform:translateZ(12px)] group-hover:[transform:translateZ(18px)_translateY(-3px)]"
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
