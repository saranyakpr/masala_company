import type { ReactNode } from 'react';
import { Reveal } from '@/animations/Reveal';
import { SplitText } from '@/animations/SplitText';
import { cn } from '@/utils/cn';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  as?: 'h1' | 'h2';
  accentWords?: number[];
  className?: string;
  action?: ReactNode;
}

/** Eyebrow + editorial serif headline + optional supporting copy/action. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  as = 'h2',
  accentWords,
  className,
  action,
}: SectionHeadingProps) {
  const isLight = tone === 'light';
  return (
    <header
      className={cn(
        'flex flex-col gap-6',
        align === 'center' ? 'items-center text-center' : 'items-start',
        action && align === 'left' && 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('flex max-w-3xl flex-col gap-5', align === 'center' && 'items-center')}>
        <Reveal>
          <span className={cn('eyebrow flex items-center gap-3', isLight ? 'text-gold-light' : 'text-spice')}>
            <span aria-hidden="true" className={cn('h-px w-8', isLight ? 'bg-gold-light/60' : 'bg-spice/60')} />
            {eyebrow}
          </span>
        </Reveal>
        <SplitText
          as={as}
          text={title}
          accentWords={accentWords}
          accentClassName={isLight ? 'italic text-gold-light' : 'italic text-spice'}
          className={cn('text-headline text-balance', isLight ? 'text-ivory' : 'text-ink')}
        />
        {description && (
          <Reveal delay={0.15}>
            <p className={cn('max-w-xl text-base leading-relaxed md:text-lg', isLight ? 'text-ivory/70' : 'text-ink-soft/80')}>
              {description}
            </p>
          </Reveal>
        )}
      </div>
      {action && <Reveal delay={0.2}>{action}</Reveal>}
    </header>
  );
}
