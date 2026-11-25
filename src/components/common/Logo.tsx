import { Link } from 'react-router-dom';
import { site } from '@/data/site';
import { cn } from '@/utils/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="var(--color-gold)" strokeWidth="1" />
      <path d="M20 7.5c3.6 4.8 3.6 20.2 0 25-3.6-4.8-3.6-20.2 0-25z" fill="var(--color-turmeric)" />
      <path d="M7.5 20c4.8-3.6 20.2-3.6 25 0-4.8 3.6-20.2 3.6-25 0z" fill="var(--color-spice)" opacity="0.9" />
      <circle cx="20" cy="20" r="2.4" fill="var(--color-burgundy)" stroke="var(--color-gold)" strokeWidth="0.8" />
    </svg>
  );
}

export function Logo({ tone = 'dark', className, onClick }: { tone?: 'dark' | 'light'; className?: string; onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${site.name} — home`}
      className={cn('flex items-center gap-3 transition-colors duration-500', tone === 'light' ? 'text-ivory' : 'text-ink', className)}
    >
      <LogoMark />
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span className="font-display text-[1.35rem] tracking-[-0.01em]">{site.shortName}</span>
        <span className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.32em] opacity-60">Spice House</span>
      </span>
    </Link>
  );
}
