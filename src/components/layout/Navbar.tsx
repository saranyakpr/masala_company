import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import { mainNav, site } from '@/data/site';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/Button';
import { useLenis } from '@/components/common/SmoothScroll';
import { easePremium } from '@/animations/variants';
import { cn } from '@/utils/cn';

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const lenis = useLenis();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 320 && y > prev && !open);
  });

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [location.pathname]);

  // Lock scroll while the menu is open.
  useEffect(() => {
    if (open) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, lenis]);

  const solid = scrolled && !open;
  const light = !solid;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.6, ease: easePremium }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500',
          solid ? 'border-b border-line/70 bg-ivory' : 'border-b border-transparent bg-transparent',
        )}
      >
        <nav aria-label="Main" className="container-x flex h-20 items-center justify-between lg:h-24">
          <Logo tone={light ? 'light' : 'dark'} onClick={() => setOpen(false)} />

          <ul className="hidden items-center gap-9 lg:flex">
            {mainNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative py-2 text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300',
                      light ? 'text-ivory/80 hover:text-ivory' : 'text-ink/70 hover:text-ink',
                      isActive && (light ? 'text-ivory' : 'text-ink'),
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute -bottom-0.5 left-0 right-0 h-px bg-gold"
                          transition={{ duration: 0.6, ease: easePremium }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <span className="hidden md:block">
            <Button to="/contact" variant={light ? 'outline-light' : 'ink'} className="h-11 px-5 text-[0.72rem]">
              Trade enquiry
            </Button>
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className={cn(
                'relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-500 lg:hidden',
                light ? 'border-ivory/30 text-ivory' : 'border-ink/20 text-ink',
              )}
            >
              <span className="relative block h-3 w-5">
                <span
                  className={cn(
                    'absolute left-0 h-px w-5 bg-current transition-all duration-500 ease-[var(--ease-premium)]',
                    open ? 'top-1.5 rotate-45' : 'top-0',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 h-px bg-current transition-all duration-500 ease-[var(--ease-premium)]',
                    open ? 'top-1.5 w-5 -rotate-45' : 'top-3 w-3.5',
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="grain-light fixed inset-0 z-40 flex flex-col overflow-y-auto bg-burgundy-deep pt-24 lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: easePremium }}
          >
            <motion.ul
              className="container-x flex flex-col"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
            >
              {[{ label: 'Home', to: '/' }, ...mainNav].map((item, i) => (
                <motion.li
                  key={item.to}
                  className="overflow-hidden border-b border-ivory/10"
                  variants={{ hidden: { y: '100%', opacity: 0 }, visible: { y: '0%', opacity: 1, transition: { duration: 0.8, ease: easePremium } } }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn('flex items-baseline justify-between py-4 font-display text-4xl sm:text-5xl', isActive ? 'italic text-gold-light' : 'text-ivory')
                    }
                  >
                    {item.label}
                    <span className="font-sans text-xs tracking-[0.2em] text-ivory/40">0{i + 1}</span>
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div
              className="container-x mt-auto flex flex-col gap-3 py-10 text-sm text-ivory/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6 } }}
            >
              <a href={`mailto:${site.contact.email}`} className="flex items-center gap-3">
                <Mail aria-hidden="true" className="h-4 w-4 text-gold" /> {site.contact.email}
              </a>
              <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-3">
                <Phone aria-hidden="true" className="h-4 w-4 text-gold" /> {site.contact.phone}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
