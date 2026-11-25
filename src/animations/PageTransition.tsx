import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { easePremium } from './variants';

/** Wraps each routed page: content fades/lifts in, and a burgundy curtain sweeps away. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: easePremium, delay: 0.15 } }}
        exit={{ opacity: 0, y: -12, transition: { duration: 0.35, ease: easePremium } }}
      >
        {children}
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] origin-top bg-burgundy-deep"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0, transition: { duration: 0.75, ease: easePremium } }}
        exit={{ scaleY: 0 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] origin-bottom bg-burgundy-deep"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1, transition: { duration: 0.45, ease: easePremium } }}
      />
    </>
  );
}
