import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, stagger, viewportOnce } from './variants';

type RevealTag = 'div' | 'section' | 'li' | 'ul' | 'ol' | 'article' | 'p' | 'span' | 'header';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  as?: RevealTag;
}

/** Fades + lifts its content into view once, when scrolled into the viewport. */
export function Reveal({ children, className, delay = 0, variants = fadeUp, as = 'div' }: RevealProps) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      custom={delay}
    >
      {children}
    </Comp>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  as?: RevealTag;
}

/** Parent that staggers `RevealItem` children into view. */
export function Stagger({ children, className, gap = 0.09, delay = 0, as = 'div' }: StaggerProps) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={stagger(gap, delay)} initial="hidden" whileInView="visible" viewport={viewportOnce}>
      {children}
    </Comp>
  );
}

export function RevealItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: RevealTag }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={fadeUp}>
      {children}
    </Comp>
  );
}
