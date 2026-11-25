export type CategoryId = 'pure-spices' | 'blended-masalas' | 'whole-spices';

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
}

export interface PackSize {
  label: string;
  format: 'Pouch' | 'Jar' | 'Carton' | 'Bulk bag';
}

export interface ProductSpec {
  label: string;
  value: string;
  /** True when the value must be confirmed with client lab reports / spec sheets. */
  pending?: boolean;
}

/** Colours used to draw the procedural packaging (SVG + 3D label). */
export interface PackPalette {
  base: string;
  accent: string;
  spice: string;
  text: string;
}

export interface Product {
  slug: string;
  name: string;
  /** Regional / Hindi name shown as a secondary label. */
  localName: string;
  category: CategoryId;
  short: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  heat: 0 | 1 | 2 | 3 | 4 | 5;
  aroma: string;
  bestFor: string[];
  packSizes: PackSize[];
  specs: ProductSpec[];
  palette: PackPalette;
  featured?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  botanical: string;
  localName: string;
  origin: string;
  notes: string;
  description: string;
  flavour: string[];
  usedIn: string[];
  /** Colour of the ground spice, used for 3D + editorial swatches. */
  color: string;
  colorDeep: string;
  shape: 'powder' | 'seed' | 'pod' | 'berry' | 'root' | 'chilli' | 'bark' | 'star';
}

export interface ProcessStep {
  id: string;
  index: string;
  title: string;
  summary: string;
  detail: string;
  points: string[];
}

export interface Certification {
  id: string;
  title: string;
  scope: string;
  status: 'pending-documentation';
}

export interface QualityCheck {
  title: string;
  description: string;
}

export interface TimelineEntry {
  year: string;
  title: string;
  description: string;
  pending?: boolean;
}

export interface NavItem {
  label: string;
  to: string;
}

export interface SocialLink {
  label: 'Instagram' | 'Facebook' | 'LinkedIn' | 'YouTube';
  /** Empty string until the client provides the profile URL. */
  href: string;
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

export type DeviceTier = 'low' | 'mid' | 'high';
