import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { easePremium, viewportOnce } from './variants';

interface MaskRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left';
}

/** Image/visual reveal — a clip-path wipe paired with a subtle scale settle. */
export function MaskReveal({ children, className, delay = 0, direction = 'up' }: MaskRevealProps) {
  const hidden = direction === 'up' ? 'inset(100% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)';
  return (
    <motion.div
      className={className}
      initial={{ clipPath: hidden }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={viewportOnce}
      transition={{ duration: 1.3, ease: easePremium, delay }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.6, ease: easePremium, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
