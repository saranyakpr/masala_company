import { Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PendingBadgeProps {
  label?: string;
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Clearly marks content that is a placeholder awaiting client-provided information.
 * Search the codebase for `PendingBadge` to find every unconfirmed item before launch.
 */
export function PendingBadge({ label = 'Awaiting client details', tone = 'dark', className }: PendingBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em]',
        tone === 'dark' ? 'border-gold/50 bg-gold/10 text-earth' : 'border-gold-light/40 bg-gold-light/10 text-gold-light',
        className,
      )}
    >
      <Info aria-hidden="true" className="h-3 w-3" />
      {label}
    </span>
  );
}
