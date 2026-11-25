import type { Ingredient } from '@/types';

/**
 * Ingredient showcase. Botanical + culinary information is general knowledge.
 * `origin` describes where each spice is traditionally grown in India —
 * it is NOT a claim about the client's sourcing (to be confirmed by client).
 */
export const ingredients: Ingredient[] = [
  {
    id: 'turmeric',
    name: 'Turmeric',
    botanical: 'Curcuma longa',
    localName: 'Haldi',
    origin: 'Traditionally grown in Erode, Salem, Sangli and the Kandhamal hills',
    notes: 'Earthy · Musky · Bitter-sweet',
    description:
      'A rhizome of the ginger family. After harvest the fingers are boiled, dried for weeks and polished — the slow process that locks in its deep golden colour.',
    flavour: ['Earthy', 'Musky', 'Warm'],
    usedIn: ['Turmeric Powder', 'Sambar Masala', 'Chicken Masala'],
    color: '#e2a01b',
    colorDeep: '#b8770c',
    shape: 'root',
  },
  {
    id: 'chilli',
    name: 'Red Chilli',
    botanical: 'Capsicum annuum',
    localName: 'Lal Mirch',
    origin: 'Traditionally grown in Guntur, Byadgi and the Kashmir valley',
    notes: 'Fruity · Smoky · Fiery',
    description:
      'Varieties range from the deep-coloured, gentle Kashmiri and Byadgi chillies to the fiery Guntur. Pods are dried, destemmed and ground for colour and heat.',
    flavour: ['Fruity', 'Smoky', 'Hot'],
    usedIn: ['Kashmiri Chilli Powder', 'Sambar Masala', 'Chicken Masala'],
    color: '#b3221f',
    colorDeep: '#7d1015',
    shape: 'chilli',
  },
  {
    id: 'black-pepper',
    name: 'Black Pepper',
    botanical: 'Piper nigrum',
    localName: 'Kali Mirch',
    origin: 'Native to the Western Ghats — Kerala and Karnataka',
    notes: 'Pungent · Woody · Citrus',
    description:
      'Once traded as “black gold”. Green berries are picked from climbing vines and dried until wrinkled and black, concentrating their sharp, piney heat.',
    flavour: ['Pungent', 'Woody', 'Piney'],
    usedIn: ['Black Pepper Powder', 'Black Peppercorns', 'Garam Masala'],
    color: '#3a2e27',
    colorDeep: '#1c120d',
    shape: 'berry',
  },
  {
    id: 'coriander',
    name: 'Coriander',
    botanical: 'Coriandrum sativum',
    localName: 'Dhaniya',
    origin: 'Traditionally grown across Rajasthan, Madhya Pradesh and Gujarat',
    notes: 'Citrus · Floral · Nutty',
    description:
      'The dried seed of the coriander plant. Its bright, citrusy perfume and gentle thickening power make it the quiet foundation of most masalas.',
    flavour: ['Citrus', 'Floral', 'Nutty'],
    usedIn: ['Coriander Powder', 'Garam Masala', 'Sambar Masala'],
    color: '#b39a5c',
    colorDeep: '#7e6a3a',
    shape: 'seed',
  },
  {
    id: 'cumin',
    name: 'Cumin',
    botanical: 'Cuminum cyminum',
    localName: 'Jeera',
    origin: 'Traditionally grown in Gujarat and Rajasthan',
    notes: 'Warm · Smoky · Savoury',
    description:
      'Slender ridged seeds that bloom in hot oil. Roasted, they turn smoky and nutty — the signature aroma of tempering and chaat.',
    flavour: ['Warm', 'Smoky', 'Savoury'],
    usedIn: ['Cumin Powder', 'Chaat Masala', 'Garam Masala'],
    color: '#8a6a43',
    colorDeep: '#5a3a24',
    shape: 'seed',
  },
  {
    id: 'cardamom',
    name: 'Green Cardamom',
    botanical: 'Elettaria cardamomum',
    localName: 'Elaichi',
    origin: 'Traditionally grown in the Cardamom Hills of Kerala and Tamil Nadu',
    notes: 'Floral · Sweet · Eucalyptus',
    description:
      'The “queen of spices”. Pods are hand-picked just before ripening and dried gently to keep their green colour and intensely perfumed seeds.',
    flavour: ['Floral', 'Sweet', 'Cooling'],
    usedIn: ['Green Cardamom', 'Biryani Masala', 'Garam Masala'],
    color: '#7c8a4a',
    colorDeep: '#4f5a2c',
    shape: 'pod',
  },
  {
    id: 'cinnamon',
    name: 'Cinnamon',
    botanical: 'Cinnamomum verum / cassia',
    localName: 'Dalchini',
    origin: 'Inner bark of trees grown across South India and Sri Lanka',
    notes: 'Sweet · Woody · Warm',
    description:
      'Thin inner bark that curls into quills as it dries. Sweet and woody, it rounds out garam masala and perfumes slow-cooked rice and meat.',
    flavour: ['Sweet', 'Woody', 'Warm'],
    usedIn: ['Garam Masala', 'Biryani Masala', 'Chicken Masala'],
    color: '#8c4f2b',
    colorDeep: '#5a2f17',
    shape: 'bark',
  },
  {
    id: 'star-anise',
    name: 'Star Anise',
    botanical: 'Illicium verum',
    localName: 'Chakra Phool',
    origin: 'Dried star-shaped fruit, used across Indian and East Asian cooking',
    notes: 'Liquorice · Sweet · Warm',
    description:
      'An eight-pointed seed pod with a deep, liquorice-like sweetness. A little goes a long way in biryani masalas and slow braises.',
    flavour: ['Liquorice', 'Sweet', 'Warm'],
    usedIn: ['Biryani Masala'],
    color: '#6b3a22',
    colorDeep: '#3e1f10',
    shape: 'star',
  },
];

export const getIngredient = (id: string) => ingredients.find((i) => i.id === id);
