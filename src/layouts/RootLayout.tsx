import { Suspense } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageLoader } from '@/components/common/Loaders';
import { IntroLoader } from '@/components/common/IntroLoader';
import { BackToTop } from '@/components/common/BackToTop';
import { useLenis } from '@/components/common/SmoothScroll';
import { PageTransition } from '@/animations/PageTransition';

export function RootLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const lenis = useLenis();

  const resetScroll = () => {
    if (location.hash) return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  };

  return (
    <>
      <IntroLoader />
      <a
        href="#main"
        className="fixed left-4 top-4 z-[80] -translate-y-24 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <AnimatePresence mode="wait" onExitComplete={resetScroll}>
          <PageTransition key={location.pathname}>
            <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
