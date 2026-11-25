import type { Transition, Variants } from 'framer-motion';

export const easePremium: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const baseTransition: Transition = { duration: 0.9, ease: easePremium };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { ...baseTransition, delay } }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1, ease: easePremium } },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

export const wordReveal: Variants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 1.05, ease: easePremium } },
};

export const viewportOnce = { once: true, amount: 0.25 } as const;
