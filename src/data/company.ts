/**
 * Brand + company details used across the site.
 * ⚠️ Replace the placeholder contact values below with your real details.
 * Leave a field as an empty string to hide it.
 */
export const company = {
  name: '12 SPICES',
  category: 'MASALA & WHOLE SPICES',
  tagline: 'Authentic Flavours. Extraordinary Taste.',
  about:
    '12 SPICES brings the colour, aroma and character of authentic Indian spices to everyday kitchens — pure single spices and carefully balanced masalas, packed so every dish tastes the way it should.',
  email: 'hello@example.com', // TODO: replace with your real enquiry / orders email
  phone: '+91 00000 00000', // TODO: replace with your real phone number
  whatsapp: '', // e.g. '919876543210' (country code + number, digits only) to enable WhatsApp ordering
  address: 'Your business address, City, State, PIN — India', // TODO: replace with your full address
  hours: '', // e.g. 'Mon – Sat, 9:30 am – 6:30 pm'
  /** Paste a Google Maps "Embed a map" iframe src here to replace the map placeholder. */
  mapEmbedUrl: '',
  /** Optional link that opens your location in Google Maps. */
  mapLink: '',
  socials: [
    { label: 'Instagram', href: '#' }, // TODO: add your profile URLs
    { label: 'Facebook', href: '#' },
    { label: 'YouTube', href: '#' },
    { label: 'WhatsApp', href: '#' },
  ],
  /** Shipping rules shown in cart/checkout. ⚠️ Sample values — set your own. */
  shipping: { flatFee: 60, freeAbove: 799 },
} as const
