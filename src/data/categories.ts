import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'pure-spices',
    name: 'Pure Spices',
    tagline: 'One spice. Nothing else.',
    description:
      'Single-ingredient ground spices — turmeric, chilli, coriander, cumin — milled for colour, aroma and a clean finish.',
  },
  {
    id: 'blended-masalas',
    name: 'Blended Masalas',
    tagline: 'Recipes, ground to order.',
    description:
      'Heritage spice blends for the dishes that define a kitchen — balanced, roasted and ground in small batches.',
  },
  {
    id: 'whole-spices',
    name: 'Whole Spices',
    tagline: 'As nature shaped them.',
    description: 'Hand-sorted whole spices for tempering, slow cooking and grinding fresh at home.',
  },
];

export const getCategory = (id: Category['id']) => categories.find((c) => c.id === id);

/** Small caps line printed on pack artwork. */
export const packLine: Record<Category['id'], string> = {
  'pure-spices': 'PURE GROUND SPICE',
  'blended-masalas': 'HERITAGE MASALA BLEND',
  'whole-spices': 'HAND-SORTED WHOLE SPICE',
};
