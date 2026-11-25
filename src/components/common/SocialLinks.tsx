import { Facebook, Instagram, Linkedin, Youtube, type LucideIcon } from 'lucide-react';
import { site } from '@/data/site';
import type { SocialLink } from '@/types';
import { cn } from '@/utils/cn';

const icons: Record<SocialLink['label'], LucideIcon> = {
  Instagram,
  Facebook,
  LinkedIn: Linkedin,
  YouTube: Youtube,
};

/**
 * Social profile links. Until the client supplies URLs (empty `href` in site config),
 * icons render as non-interactive placeholders rather than broken links.
 */
export function SocialLinks({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  const base = cn(
    'flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300',
    tone === 'light' ? 'border-ivory/20 text-ivory/80' : 'border-ink/15 text-ink/80',
  );
  return (
    <ul className={cn('flex gap-3', className)} aria-label="Social media">
      {site.social.map(({ label, href }) => {
        const Icon = icons[label];
        return (
          <li key={label}>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn(base, tone === 'light' ? 'hover:border-gold hover:bg-gold hover:text-ink' : 'hover:border-ink hover:bg-ink hover:text-ivory')}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
              </a>
            ) : (
              <span
                className={cn(base, 'cursor-not-allowed opacity-45')}
                title={`${label} profile link to be added`}
                aria-label={`${label} (profile link coming soon)`}
                role="img"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
