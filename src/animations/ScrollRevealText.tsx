import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  /** Word indexes rendered as italic accents. */
  accentWords?: number[];
  accentClassName?: string;
}

/** Editorial paragraph whose words brighten one by one as it scrolls through the viewport. */
export function ScrollRevealText({ text, className, accentWords = [], accentClassName = 'italic text-spice' }: ScrollRevealTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={cn('flex flex-wrap', className)} aria-label={text}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} className={accentWords.includes(i) ? accentClassName : undefined}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, range, className }: { children: string; progress: MotionValue<number>; range: [number, number]; className?: string }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span aria-hidden="true" className="mr-[0.25em]">
      <motion.span style={{ opacity }} className={cn('inline-block', className)}>
        {children}
      </motion.span>
    </span>
  );
}
