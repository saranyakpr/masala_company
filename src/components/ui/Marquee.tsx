import { Fragment } from 'react';
import { cn } from '@/utils/cn';

interface MarqueeProps {
  items: string[];
  className?: string;
  separatorClassName?: string;
}

/** Infinite editorial ticker. Duplicated track for a seamless loop; decorative only. */
export function Marquee({ items, className, separatorClassName = 'text-gold' }: MarqueeProps) {
  const track = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item) => (
        <Fragment key={item}>
          <span className="whitespace-nowrap">{item}</span>
          <span aria-hidden="true" className={separatorClassName}>
            ✦
          </span>
        </Fragment>
      ))}
    </div>
  );
  return (
    <div className={cn('relative flex overflow-hidden', className)} aria-hidden="true">
      <div className="animate-marquee flex w-max">
        {track}
        {track}
      </div>
    </div>
  );
}
