export type SpiceKind =
  | 'chilli'
  | 'turmeric'
  | 'coriander'
  | 'pepper'
  | 'cinnamon'
  | 'cardamom'
  | 'cumin'
  | 'mustard'
  | 'clove'
  | 'fennel'
  | 'fenugreek'
  | 'ginger'

export type ProductForm = 'powder' | 'seeds' | 'whole'
export type ProductCategory = 'spice' | 'blend'

export interface ProductSize {
  label: string
  /** Price in INR. */
  price: number
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  form: ProductForm
  /** First line on the jar label (cream). */
  line1: string
  /** Second line on the jar label (gold). */
  line2: string
  /** Colour of what is inside the jar. */
  powder: string
  /** Darker shade used for depth, dunes and shadows. */
  powderDeep: string
  description: string
  /** Longer copy for the product page. */
  story: string
  notes: [string, string, string]
  pairs: string[]
  /** Whole spices that float around the jar for this product. */
  garnish: SpiceKind[]
  /**
   * ⚠️ SAMPLE PRICES — replace with your real pack sizes and prices before launch.
   */
  sizes: ProductSize[]
}

const sizes = (per100: number): ProductSize[] => [
  { label: '100 g', price: per100 },
  { label: '250 g', price: Math.round((per100 * 2.35) / 5) * 5 },
  { label: '500 g', price: Math.round((per100 * 4.5) / 5) * 5 },
]
const smallSizes = (per50: number): ProductSize[] => [
  { label: '50 g', price: per50 },
  { label: '100 g', price: Math.round((per50 * 1.9) / 5) * 5 },
  { label: '250 g', price: Math.round((per50 * 4.6) / 5) * 5 },
]

export const STORAGE_NOTE = 'Store in a cool, dry place away from sunlight. Always use a dry spoon and close the lid tightly after use.'

export const products: Product[] = [
  /* --------------------------- single spices --------------------------- */
  {
    id: 'turmeric',
    name: 'Turmeric Powder',
    category: 'spice',
    form: 'powder',
    line1: 'TURMERIC',
    line2: 'POWDER',
    powder: '#e3a21a',
    powderDeep: '#a8650a',
    description: 'Golden, earthy and warm — the quiet foundation of countless Indian kitchens, giving every curry its sunlit colour.',
    story:
      'Turmeric is the root of everyday Indian cooking: a spoonful in the dal, a pinch in the tadka, a golden glow across every gravy. Ground fine for even colour and a clean, earthy warmth.',
    notes: ['Earthy', 'Warm', 'Gently bitter'],
    pairs: ['Dals', 'Curries', 'Rice', 'Golden milk'],
    garnish: ['turmeric'],
    sizes: sizes(60),
  },
  {
    id: 'chilli',
    name: 'Chilli Powder',
    category: 'spice',
    form: 'powder',
    line1: 'CHILLI',
    line2: 'POWDER',
    powder: '#d8461c',
    powderDeep: '#8e1f0b',
    description: 'Bold colour and a confident heat that wakes up every dish — from a simple tadka to a slow Sunday curry.',
    story:
      'Sun-dried red chillies ground to a vivid powder. It paints a dish long before the heat arrives — use it for colour, for warmth, or for both.',
    notes: ['Fiery', 'Vibrant', 'Smoky'],
    pairs: ['Curries', 'Marinades', 'Chutneys', 'Tadka'],
    garnish: ['chilli'],
    sizes: sizes(70),
  },
  {
    id: 'coriander',
    name: 'Coriander Powder',
    category: 'spice',
    form: 'powder',
    line1: 'CORIANDER',
    line2: 'POWDER',
    powder: '#a88d55',
    powderDeep: '#6a5530',
    description: 'Citrusy, nutty and mellow — the balancing note that ties a masala together and rounds out every gravy.',
    story:
      'Coriander seeds carry a bright, lemony fragrance. Ground, they bring body to gravies and quietly balance the heat of chilli and the earthiness of turmeric.',
    notes: ['Citrus', 'Nutty', 'Mellow'],
    pairs: ['Gravies', 'Sabzis', 'Rasam', 'Spice rubs'],
    garnish: ['coriander'],
    sizes: sizes(55),
  },
  {
    id: 'pepper',
    name: 'Pepper Powder',
    category: 'spice',
    form: 'powder',
    line1: 'PEPPER',
    line2: 'POWDER',
    powder: '#4a4038',
    powderDeep: '#1f1a15',
    description: 'Sharp, woody heat from black pepper — the original king of spices, made for rasam, soups and pepper fry.',
    story:
      'Black pepper brings a clean, lively heat that is completely different from chilli. Finish soups and eggs with it, or let it lead in a South Indian pepper fry.',
    notes: ['Pungent', 'Woody', 'Bright'],
    pairs: ['Rasam', 'Soups', 'Pepper fry', 'Eggs'],
    garnish: ['pepper'],
    sizes: sizes(160),
  },
  {
    id: 'cumin',
    name: 'Cumin Seeds',
    category: 'spice',
    form: 'seeds',
    line1: 'CUMIN',
    line2: 'SEEDS',
    powder: '#8a6a3e',
    powderDeep: '#4f3a1e',
    description: 'Warm, nutty and unmistakable — the seed that crackles first in hot ghee and sets the tone for the whole dish.',
    story:
      'Jeera is where so many Indian dishes begin: a spoonful of seeds sizzling in oil until they darken and release their nutty aroma. Toast and grind them for raitas and chaats.',
    notes: ['Nutty', 'Earthy', 'Warm'],
    pairs: ['Jeera rice', 'Dals', 'Raita', 'Tadka'],
    garnish: ['cumin'],
    sizes: sizes(95),
  },
  {
    id: 'mustard',
    name: 'Mustard Seeds',
    category: 'spice',
    form: 'seeds',
    line1: 'MUSTARD',
    line2: 'SEEDS',
    powder: '#5a2e1c',
    powderDeep: '#2a140c',
    description: 'Tiny seeds that pop and crackle in hot oil, releasing a sharp, nutty bite at the heart of every South Indian tempering.',
    story:
      'Kadugu is the sound of a South Indian kitchen — the crackle of seeds in hot oil before curry leaves follow. Essential for sambar, poriyal, pickles and lemon rice.',
    notes: ['Sharp', 'Nutty', 'Pungent'],
    pairs: ['Sambar', 'Poriyal', 'Pickles', 'Lemon rice'],
    garnish: ['mustard'],
    sizes: sizes(45),
  },
  {
    id: 'cardamom',
    name: 'Cardamom',
    category: 'spice',
    form: 'whole',
    line1: 'GREEN',
    line2: 'CARDAMOM',
    powder: '#7f9a4a',
    powderDeep: '#4a5e26',
    description: 'Small green pods with a cool, floral perfume that lifts biryanis, chai and sweets alike.',
    story:
      'Elaichi is the most fragrant spice in the masala box. Crush a pod into chai, drop a few into biryani, or grind the seeds for payasam and sweets.',
    notes: ['Floral', 'Cool', 'Fragrant'],
    pairs: ['Chai', 'Biryani', 'Payasam', 'Sweets'],
    garnish: ['cardamom'],
    sizes: smallSizes(220),
  },
  {
    id: 'cinnamon',
    name: 'Cinnamon',
    category: 'spice',
    form: 'whole',
    line1: 'CINNAMON',
    line2: 'STICKS',
    powder: '#8a4a24',
    powderDeep: '#4e240e',
    description: 'Curled quills of bark with a gentle, woody sweetness — the warm backbone of garam masala and pulao.',
    story:
      'Pattai brings sweetness without sugar. Drop a stick into hot ghee for pulao and biryani, or simmer it in a korma for quiet warmth.',
    notes: ['Sweet', 'Woody', 'Warm'],
    pairs: ['Pulao', 'Biryani', 'Korma', 'Desserts'],
    garnish: ['cinnamon'],
    sizes: smallSizes(75),
  },
  {
    id: 'cloves',
    name: 'Cloves',
    category: 'spice',
    form: 'whole',
    line1: 'WHOLE',
    line2: 'CLOVES',
    powder: '#5a2f1a',
    powderDeep: '#2c140a',
    description: 'Dried flower buds with an intense, warming aroma — a few go a long way in biryani, curries and chai.',
    story:
      'Lavangam is bold and penetrating. Two or three cloves are enough to perfume a pot of rice or a rich meat curry with their deep, sweet warmth.',
    notes: ['Intense', 'Sweet', 'Warming'],
    pairs: ['Biryani', 'Meat curries', 'Chai', 'Pickles'],
    garnish: ['clove'],
    sizes: smallSizes(130),
  },
  {
    id: 'fennel',
    name: 'Fennel Seeds',
    category: 'spice',
    form: 'seeds',
    line1: 'FENNEL',
    line2: 'SEEDS',
    powder: '#9aa45a',
    powderDeep: '#5d6630',
    description: 'Sweet, cooling and gently liquorice-like — loved in curries, chai and as an after-meal refresher.',
    story:
      'Sombu adds a soft sweetness to South Indian chicken and mutton curries and to Kashmiri dishes. Lightly roasted, it is also the classic after-meal mukhwas.',
    notes: ['Sweet', 'Cooling', 'Anise'],
    pairs: ['Chicken curry', 'Mutton curry', 'Chai', 'Mukhwas'],
    garnish: ['fennel'],
    sizes: sizes(70),
  },
  {
    id: 'fenugreek',
    name: 'Fenugreek Seeds',
    category: 'spice',
    form: 'seeds',
    line1: 'FENUGREEK',
    line2: 'SEEDS',
    powder: '#c99a3e',
    powderDeep: '#8a6420',
    description: 'Golden, square little seeds with a bittersweet, maple-like depth that makes sambar and pickles taste complete.',
    story:
      'Vendhayam is used in small amounts for big effect: a pinch in sambar, kuzhambu or idli batter adds a rounded, bittersweet depth nothing else can.',
    notes: ['Bittersweet', 'Nutty', 'Deep'],
    pairs: ['Sambar', 'Kuzhambu', 'Pickles', 'Idli batter'],
    garnish: ['fenugreek'],
    sizes: sizes(45),
  },
  {
    id: 'dry-ginger',
    name: 'Dry Ginger',
    category: 'spice',
    form: 'powder',
    line1: 'DRY GINGER',
    line2: 'POWDER',
    powder: '#d8c08a',
    powderDeep: '#9a7f48',
    description: 'Sun-dried ginger, ground to a warm, peppery powder for chai, sweets and comforting home remedies.',
    story:
      'Sukku has a deeper, drier warmth than fresh ginger. Stir it into chai and kashayam, or add a pinch to sweets and masala blends.',
    notes: ['Warm', 'Peppery', 'Zesty'],
    pairs: ['Chai', 'Kashayam', 'Sweets', 'Masala blends'],
    garnish: ['ginger'],
    sizes: sizes(120),
  },

  /* ------------------------------ blends ------------------------------- */
  {
    id: 'garam-masala',
    name: 'Garam Masala',
    category: 'blend',
    form: 'powder',
    line1: 'GARAM',
    line2: 'MASALA',
    powder: '#7a4526',
    powderDeep: '#3f2010',
    description: 'A warming finish of whole spices, roasted, ground and blended for depth — the final flourish of a great curry.',
    story:
      'Cinnamon, cardamom, cloves and pepper come together in a blend meant for the end of cooking — a pinch stirred in just before serving lifts the whole dish.',
    notes: ['Warm', 'Aromatic', 'Sweet-spiced'],
    pairs: ['Curries', 'Paneer', 'Kebabs', 'Gravies'],
    garnish: ['cinnamon', 'cardamom', 'pepper'],
    sizes: sizes(110),
  },
  {
    id: 'chicken-masala',
    name: 'Chicken Masala',
    category: 'blend',
    form: 'powder',
    line1: 'CHICKEN',
    line2: 'MASALA',
    powder: '#a9441f',
    powderDeep: '#5e200b',
    description: 'A rich, layered blend made for slow-cooked chicken curries, roasts and fries with a deep, savoury warmth.',
    story:
      'Built for chicken in every form — a Sunday curry, a dry roast or a quick fry. Add it with onions and tomatoes and let it cook through for the deepest flavour.',
    notes: ['Robust', 'Savoury', 'Layered'],
    pairs: ['Chicken curry', 'Roasts', 'Pepper fry', 'Gravies'],
    garnish: ['chilli', 'pepper', 'cinnamon'],
    sizes: sizes(85),
  },
  {
    id: 'mutton-masala',
    name: 'Mutton Masala',
    category: 'blend',
    form: 'powder',
    line1: 'MUTTON',
    line2: 'MASALA',
    powder: '#8c3618',
    powderDeep: '#4a170a',
    description: 'A deep, robust blend made to stand up to slow-cooked mutton — rich, warming and full of character.',
    story:
      'Mutton deserves patience and a masala with backbone. This blend is made for long, slow cooking, deepening as the meat becomes tender.',
    notes: ['Deep', 'Robust', 'Warming'],
    pairs: ['Mutton curry', 'Kola urundai', 'Chukka', 'Kuzhambu'],
    garnish: ['clove', 'chilli', 'cinnamon'],
    sizes: sizes(90),
  },
  {
    id: 'biryani-masala',
    name: 'Biryani Masala',
    category: 'blend',
    form: 'powder',
    line1: 'BIRYANI',
    line2: 'MASALA',
    powder: '#93522a',
    powderDeep: '#4d2610',
    description: 'Fragrant, festive and royal — a blend built for layered rice, long slow dum and celebrations around the table.',
    story:
      'Biryani is a celebration, and its masala should smell like one. Fragrant and floral, it perfumes every grain of rice as the pot rests on dum.',
    notes: ['Fragrant', 'Floral', 'Rich'],
    pairs: ['Biryani', 'Pulao', 'Korma', 'Marinades'],
    garnish: ['cardamom', 'clove', 'cinnamon'],
    sizes: sizes(95),
  },
  {
    id: 'sambar-masala',
    name: 'Sambar Masala',
    category: 'blend',
    form: 'powder',
    line1: 'SAMBAR',
    line2: 'MASALA',
    powder: '#bd5a26',
    powderDeep: '#6d2c0e',
    description: 'Tangy, earthy and comforting — the soul of a South Indian meal, simmered with lentils, tamarind and vegetables.',
    story:
      'Sambar is everyday comfort. Simmer this masala with toor dal, tamarind and vegetables, then finish with a tempering of mustard seeds and curry leaves.',
    notes: ['Tangy', 'Earthy', 'Comforting'],
    pairs: ['Sambar', 'Kootu', 'Vegetable stews', 'Idli & dosa'],
    garnish: ['chilli', 'fenugreek', 'coriander'],
    sizes: sizes(75),
  },
  {
    id: 'rasam-powder',
    name: 'Rasam Powder',
    category: 'blend',
    form: 'powder',
    line1: 'RASAM',
    line2: 'POWDER',
    powder: '#b8622c',
    powderDeep: '#6a2f10',
    description: 'Peppery, cumin-forward and bright — the blend behind a soul-warming bowl of rasam on any day of the week.',
    story:
      'Rasam is thin, tangy and full of aroma. A spoonful of this peppery blend with tomato and tamarind makes a soup that is equally good with rice or on its own.',
    notes: ['Peppery', 'Tangy', 'Bright'],
    pairs: ['Rasam', 'Soups', 'Rice', 'Pepper rasam'],
    garnish: ['pepper', 'cumin', 'chilli'],
    sizes: sizes(75),
  },
]

export const spiceProducts = products.filter((p) => p.category === 'spice')
export const blendProducts = products.filter((p) => p.category === 'blend')

export const productIndex = (id: string) => products.findIndex((p) => p.id === id)
export const productById = (id: string) => products.find((p) => p.id === id)

/** Featured on the home page. */
export const featuredSpiceIds = ['chilli', 'turmeric', 'coriander', 'pepper', 'cumin', 'cardamom']
export const signatureBlendIds = ['garam-masala', 'chicken-masala', 'mutton-masala', 'biryani-masala', 'sambar-masala', 'rasam-powder']

/** Powders the home hero cycles through with its powder-cloud transitions. */
export const heroLineup = ['chilli', 'turmeric', 'coriander', 'garam-masala', 'pepper', 'biryani-masala', 'sambar-masala', 'chicken-masala', 'mutton-masala', 'rasam-powder', 'dry-ginger']

/** The home film opens on Chilli Powder. */
export const DEFAULT_PRODUCT_INDEX = 1

export const formatPrice = (inr: number) => `₹${inr.toLocaleString('en-IN')}`
