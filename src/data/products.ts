import type { PackSize, Product, ProductSpec } from '@/types';

/**
 * Product catalogue.
 *
 * Descriptions describe the spices themselves (general culinary knowledge).
 * Pack sizes and technical specifications are INDICATIVE PLACEHOLDERS — replace them
 * with the client's confirmed SKU list and lab specification sheets.
 */

const retailPacks: PackSize[] = [
  { label: '50 g', format: 'Pouch' },
  { label: '100 g', format: 'Pouch' },
  { label: '200 g', format: 'Jar' },
  { label: '500 g', format: 'Pouch' },
  { label: '1 kg', format: 'Carton' },
];

const wholePacks: PackSize[] = [
  { label: '50 g', format: 'Pouch' },
  { label: '100 g', format: 'Jar' },
  { label: '250 g', format: 'Pouch' },
  { label: '1 kg', format: 'Carton' },
];

const groundSpecs = (form: string): ProductSpec[] => [
  { label: 'Form', value: form },
  { label: 'Mesh size', value: 'As per client specification sheet', pending: true },
  { label: 'Moisture', value: 'As per client lab report', pending: true },
  { label: 'Shelf life', value: 'To be confirmed by client', pending: true },
  { label: 'Storage', value: 'Cool, dry place, away from direct sunlight. Reseal after use.' },
];

const wholeSpecs = (form: string): ProductSpec[] => [
  { label: 'Form', value: form },
  { label: 'Grade', value: 'As per client specification sheet', pending: true },
  { label: 'Moisture', value: 'As per client lab report', pending: true },
  { label: 'Shelf life', value: 'To be confirmed by client', pending: true },
  { label: 'Storage', value: 'Airtight container in a cool, dry place.' },
];

export const products: Product[] = [
  {
    slug: 'turmeric-powder',
    name: 'Turmeric Powder',
    localName: 'Haldi',
    category: 'pure-spices',
    short: 'Golden, earthy and warm — the colour at the heart of Indian cooking.',
    description:
      'Turmeric rhizomes are boiled, dried and polished before being ground into a fine, vivid powder. It brings an earthy warmth and a deep golden colour to dals, curries, pickles and rice.',
    ingredients: ['Turmeric (Curcuma longa)'],
    benefits: [
      'Rich natural golden colour',
      'Earthy, gently bitter warmth',
      'Single ingredient — no added colour or fillers',
      'Fine grind that blends evenly into oil and water',
    ],
    heat: 0,
    aroma: 'Earthy, musky, faintly citrus',
    bestFor: ['Dals & curries', 'Pickles', 'Rice dishes', 'Golden milk'],
    packSizes: retailPacks,
    specs: groundSpecs('Fine powder'),
    palette: { base: '#3d0b13', accent: '#c99a3e', spice: '#e2a01b', text: '#fbf7f0' },
    featured: true,
  },
  {
    slug: 'kashmiri-chilli-powder',
    name: 'Kashmiri Chilli Powder',
    localName: 'Kashmiri Lal Mirch',
    category: 'pure-spices',
    short: 'Deep red colour with a gentle, rounded heat.',
    description:
      'Prized for its brilliant red colour rather than fierce heat, Kashmiri chilli gives tandoori dishes, gravies and marinades their signature hue with a mild, fruity warmth.',
    ingredients: ['Dried red chilli (Capsicum annuum, Kashmiri variety)'],
    benefits: ['Vivid natural red colour', 'Mild, fruity heat', 'Ideal for marinades and gravies', 'Destemmed before grinding'],
    heat: 2,
    aroma: 'Sweet, smoky, fruity',
    bestFor: ['Tandoori marinades', 'Rogan josh', 'Gravies', 'Chutneys'],
    packSizes: retailPacks,
    specs: groundSpecs('Fine powder'),
    palette: { base: '#7d1015', accent: '#e4c17a', spice: '#b3221f', text: '#fbf7f0' },
    featured: true,
  },
  {
    slug: 'coriander-powder',
    name: 'Coriander Powder',
    localName: 'Dhaniya',
    category: 'pure-spices',
    short: 'Citrusy, nutty and fragrant — the backbone of every masala.',
    description:
      'Coriander seeds are cleaned, lightly dried and ground to release their bright citrus and nutty notes. A foundational spice that thickens and perfumes gravies.',
    ingredients: ['Coriander seed (Coriandrum sativum)'],
    benefits: ['Bright citrus aroma', 'Natural thickening for gravies', 'Balances heat in spice blends', 'Ground from cleaned, sorted seed'],
    heat: 0,
    aroma: 'Citrus, floral, nutty',
    bestFor: ['Curries', 'Vegetable stir-fries', 'Spice rubs', 'Chutneys'],
    packSizes: retailPacks,
    specs: groundSpecs('Medium-fine powder'),
    palette: { base: '#5a3a24', accent: '#c99a3e', spice: '#a68a4e', text: '#fbf7f0' },
  },
  {
    slug: 'cumin-powder',
    name: 'Cumin Powder',
    localName: 'Jeera',
    category: 'pure-spices',
    short: 'Warm, smoky and savoury with a lingering depth.',
    description:
      'Cumin seeds carry a warm, slightly smoky and savoury character. Ground cumin seasons raitas, chaats, dals and spice rubs with instant depth.',
    ingredients: ['Cumin seed (Cuminum cyminum)'],
    benefits: ['Warm, smoky depth', 'Finishing spice for raitas & chaats', 'Aromatic base for tempering', 'Single ingredient'],
    heat: 0,
    aroma: 'Warm, smoky, savoury',
    bestFor: ['Raita', 'Chaat', 'Dals', 'Grilled vegetables'],
    packSizes: retailPacks,
    specs: groundSpecs('Fine powder'),
    palette: { base: '#2f1e13', accent: '#e4c17a', spice: '#8a6a43', text: '#fbf7f0' },
  },
  {
    slug: 'black-pepper-powder',
    name: 'Black Pepper Powder',
    localName: 'Kali Mirch',
    category: 'pure-spices',
    short: 'Sharp, piney heat — the king of spices, freshly milled.',
    description:
      'Dried black peppercorns ground to a medium grind for a pungent, woody bite. Equally at home in rasams, marinades and as a finishing spice.',
    ingredients: ['Black pepper (Piper nigrum)'],
    benefits: ['Pungent, woody aroma', 'Medium grind for texture', 'Finishing and cooking spice', 'Single ingredient'],
    heat: 3,
    aroma: 'Pungent, piney, woody',
    bestFor: ['Rasam', 'Pepper fry', 'Soups', 'Marinades'],
    packSizes: retailPacks,
    specs: groundSpecs('Medium powder'),
    palette: { base: '#1c120d', accent: '#c99a3e', spice: '#4a3b31', text: '#fbf7f0' },
    featured: true,
  },
  {
    slug: 'garam-masala',
    name: 'Garam Masala',
    localName: 'Garam Masala',
    category: 'blended-masalas',
    short: 'A warming, aromatic finishing blend of whole roasted spices.',
    description:
      'A classic North Indian finishing blend. Whole spices are gently dry-roasted, cooled and ground together for a fragrant, warming finish added at the end of cooking.',
    ingredients: ['Coriander seed', 'Cumin', 'Black pepper', 'Cardamom', 'Cinnamon', 'Cloves', 'Bay leaf', 'Nutmeg'],
    benefits: ['Warming, layered aroma', 'Finishing blend for gravies', 'Whole spices roasted before grinding', 'No added salt'],
    heat: 2,
    aroma: 'Warm, sweet, woody',
    bestFor: ['Paneer & meat curries', 'Pulao', 'Dal makhani', 'Kebabs'],
    packSizes: retailPacks,
    specs: groundSpecs('Fine blended powder'),
    palette: { base: '#3d0b13', accent: '#e4c17a', spice: '#7a4b2a', text: '#fbf7f0' },
    featured: true,
  },
  {
    slug: 'sambar-masala',
    name: 'Sambar Masala',
    localName: 'Sambar Podi',
    category: 'blended-masalas',
    short: 'Roasted lentils, chilli and coriander for a South Indian classic.',
    description:
      'A South Indian blend of roasted chilli, coriander, lentils, fenugreek and curry leaves that gives sambar its tangy, aromatic depth.',
    ingredients: ['Coriander seed', 'Red chilli', 'Chana dal', 'Toor dal', 'Fenugreek', 'Cumin', 'Black pepper', 'Curry leaves', 'Turmeric', 'Asafoetida'],
    benefits: ['Authentic roasted aroma', 'Balanced heat and tang', 'Roasted lentils for body', 'Ready to use'],
    heat: 3,
    aroma: 'Roasted, nutty, savoury',
    bestFor: ['Sambar', 'Vegetable kootu', 'Poriyal'],
    packSizes: retailPacks,
    specs: groundSpecs('Medium blended powder'),
    palette: { base: '#7d1015', accent: '#c99a3e', spice: '#a5481e', text: '#fbf7f0' },
  },
  {
    slug: 'biryani-masala',
    name: 'Biryani Masala',
    localName: 'Biryani Masala',
    category: 'blended-masalas',
    short: 'Fragrant and floral, built for layered rice.',
    description:
      'A fragrant blend of mace, star anise, green cardamom, cinnamon and fennel designed to perfume the rice and meat layers of a dum biryani.',
    ingredients: ['Coriander seed', 'Fennel', 'Star anise', 'Green cardamom', 'Black cardamom', 'Cinnamon', 'Cloves', 'Mace', 'Bay leaf', 'Black pepper'],
    benefits: ['Floral, perfumed aroma', 'Built for dum cooking', 'Whole spices roasted in small batches', 'No added colour'],
    heat: 2,
    aroma: 'Floral, sweet, warm',
    bestFor: ['Dum biryani', 'Pulao', 'Korma'],
    packSizes: retailPacks,
    specs: groundSpecs('Fine blended powder'),
    palette: { base: '#26060b', accent: '#e4c17a', spice: '#8c5a33', text: '#fbf7f0' },
    featured: true,
  },
  {
    slug: 'chicken-masala',
    name: 'Chicken Masala',
    localName: 'Chicken Masala',
    category: 'blended-masalas',
    short: 'Robust, red and aromatic for home-style chicken curry.',
    description:
      'A robust blend of chilli, coriander, cumin and warming whole spices that builds a rich, red home-style chicken curry.',
    ingredients: ['Coriander seed', 'Red chilli', 'Cumin', 'Turmeric', 'Black pepper', 'Fennel', 'Cinnamon', 'Cloves', 'Cardamom', 'Dried ginger'],
    benefits: ['Rich colour and body', 'Balanced, layered heat', 'One blend, complete curry', 'No added colour'],
    heat: 3,
    aroma: 'Robust, warm, savoury',
    bestFor: ['Chicken curry', 'Chicken fry', 'Egg curry'],
    packSizes: retailPacks,
    specs: groundSpecs('Fine blended powder'),
    palette: { base: '#a3171c', accent: '#e4c17a', spice: '#9a3a1c', text: '#fbf7f0' },
  },
  {
    slug: 'chaat-masala',
    name: 'Chaat Masala',
    localName: 'Chaat Masala',
    category: 'blended-masalas',
    short: 'Tangy, salty and bright — a sprinkle that wakes up any dish.',
    description:
      'A tangy, savoury sprinkle of dried mango, black salt, cumin and mint that lifts fruit, salads, snacks and street-food classics.',
    ingredients: ['Dried mango (amchur)', 'Black salt', 'Cumin', 'Coriander', 'Black pepper', 'Dried mint', 'Dried ginger', 'Asafoetida', 'Salt'],
    benefits: ['Tangy and savoury', 'Sprinkle-ready finishing spice', 'Bright with fruit and snacks', 'Roasted cumin base'],
    heat: 1,
    aroma: 'Tangy, sulphurous, fresh',
    bestFor: ['Fruit chaat', 'Salads', 'Snacks', 'Raita'],
    packSizes: retailPacks,
    specs: groundSpecs('Fine blended powder'),
    palette: { base: '#4a5530', accent: '#e4c17a', spice: '#9a8253', text: '#fbf7f0' },
  },
  {
    slug: 'black-peppercorns',
    name: 'Black Peppercorns',
    localName: 'Sabut Kali Mirch',
    category: 'whole-spices',
    short: 'Bold, dried berries for grinding fresh.',
    description:
      'Whole black peppercorns, dried and sorted for size and density. Grind fresh over finished dishes or use whole in tempering and slow-cooked stocks.',
    ingredients: ['Whole black pepper (Piper nigrum)'],
    benefits: ['Fresh-ground pungency', 'Sorted for uniform size', 'Long-lasting whole form', 'Single ingredient'],
    heat: 3,
    aroma: 'Pungent, woody, citrus',
    bestFor: ['Pepper mills', 'Tempering', 'Stocks & braises'],
    packSizes: wholePacks,
    specs: wholeSpecs('Whole berries'),
    palette: { base: '#1c120d', accent: '#e4c17a', spice: '#2a211c', text: '#fbf7f0' },
  },
  {
    slug: 'green-cardamom',
    name: 'Green Cardamom',
    localName: 'Elaichi',
    category: 'whole-spices',
    short: 'Perfumed green pods for sweets, chai and biryani.',
    description:
      'Plump green cardamom pods with an intensely floral, eucalyptus-sweet aroma — essential in chai, desserts and fragrant rice dishes.',
    ingredients: ['Whole green cardamom (Elettaria cardamomum)'],
    benefits: ['Intensely floral aroma', 'Hand-sorted pods', 'Sweet and savoury use', 'Single ingredient'],
    heat: 0,
    aroma: 'Floral, sweet, eucalyptus',
    bestFor: ['Masala chai', 'Kheer & desserts', 'Biryani', 'Pulao'],
    packSizes: wholePacks,
    specs: wholeSpecs('Whole pods'),
    palette: { base: '#2f3b22', accent: '#e4c17a', spice: '#7c8a4a', text: '#fbf7f0' },
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const featuredProducts = products.filter((p) => p.featured);

export const getRelatedProducts = (product: Product, count = 4): Product[] => {
  const sameCategory = products.filter((p) => p.category === product.category && p.slug !== product.slug);
  const others = products.filter((p) => p.category !== product.category);
  return [...sameCategory, ...others].slice(0, count);
};
