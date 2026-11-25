import type { NavItem, SocialLink } from '@/types';

/**
 * Central brand + contact configuration.
 *
 * IMPORTANT: Everything marked `PLACEHOLDER` is NOT client-provided information.
 * Replace these values with confirmed details before launch.
 */
export const site = {
  /** PLACEHOLDER brand name — derived from the project name, confirm with client. */
  name: 'The Masala Company',
  shortName: 'Masala Co.',
  wordmark: 'MASALA',
  tagline: 'Pure spices. Heritage masalas.',
  description:
    'Single-origin spices and heritage masala blends — cleaned, slow-dried, stone-ground and packed with care.',
  url: import.meta.env.VITE_SITE_URL ?? 'https://www.example.com',

  contact: {
    /** PLACEHOLDER */
    email: 'hello@example.com',
    /** PLACEHOLDER */
    salesEmail: 'trade@example.com',
    /** PLACEHOLDER */
    phone: '+91 00000 00000',
    /** PLACEHOLDER — factory / office address not yet provided. */
    addressLines: ['Factory & office address', 'to be confirmed by client'],
    /** PLACEHOLDER */
    hours: 'Mon – Sat, 9:30 am – 6:30 pm IST',
    /**
     * Google Maps embed URL (the `src` of the iframe from Google Maps → Share → Embed a map).
     * Leave empty to show the map placeholder.
     */
    mapEmbedUrl: '',
  },

  /** PLACEHOLDER — profile URLs not yet provided. Empty href renders a disabled icon. */
  social: [
    { label: 'Instagram', href: '' },
    { label: 'Facebook', href: '' },
    { label: 'LinkedIn', href: '' },
    { label: 'YouTube', href: '' },
  ] satisfies SocialLink[],
} as const;

export const mainNav: NavItem[] = [
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'Ingredients', to: '/ingredients' },
  { label: 'Process', to: '/process' },
  { label: 'Quality', to: '/quality' },
  { label: 'Contact', to: '/contact' },
];
