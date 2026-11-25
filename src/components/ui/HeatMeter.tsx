import { Flame } from 'lucide-react';
import { cn } from '@/utils/cn';

export function HeatMeter({ level, tone = 'dark' }: { level: number; tone?: 'dark' | 'light' }) {
  const label = level === 0 ? 'No heat' : `Heat ${level} of 5`;
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={label} title={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Flame
          key={i}
          aria-hidden="true"
          className={cn(
            'h-3.5 w-3.5',
            i < level ? 'fill-spice text-spice' : tone === 'dark' ? 'text-ink/20' : 'text-ivory/25',
          )}
        />
      ))}
    </span>
  );
}
