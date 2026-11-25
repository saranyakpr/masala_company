import { motion } from 'framer-motion';
import { stagger, viewportOnce, wordReveal } from './variants';
import { cn } from '@/utils/cn';

interface SplitTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
  /** Animate immediately on mount instead of when scrolled into view. */
  immediate?: boolean;
  /** Words (by index) rendered in italic accent style. */
  accentWords?: number[];
  accentClassName?: string;
}

/**
 * Masked, word-by-word staggered headline reveal.
 * The full text stays in the accessible name; split words are aria-hidden.
 */
export function SplitText({
  text,
  className,
  as = 'h2',
  delay = 0,
  immediate = false,
  accentWords = [],
  accentClassName = 'italic text-gold',
}: SplitTextProps) {
  const Tag = motion[as];
  const lines = text.split('\n');
  let wordIndex = -1;

  return (
    <Tag
      className={className}
      aria-label={text.replace(/\n/g, ' ')}
      variants={stagger(0.07, delay)}
      initial="hidden"
      {...(immediate ? { animate: 'visible' } : { whileInView: 'visible', viewport: viewportOnce })}
    >
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden="true">
          {line.split(' ').map((word, wi) => {
            wordIndex += 1;
            const accent = accentWords.includes(wordIndex);
            return (
              <span key={`${li}-${wi}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span variants={wordReveal} className={cn('inline-block', accent && accentClassName)}>
                  {word}
                  {wi < line.split(' ').length - 1 ? ' ' : ''}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
