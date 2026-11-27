import type { SpiceKind } from './products'

export interface Ingredient {
  kind: SpiceKind
  name: string
  botanical: string
  note: string
  description: string
  glow: string
}

export const ingredients: Ingredient[] = [
  {
    kind: 'turmeric',
    name: 'Turmeric',
    botanical: 'Curcuma longa',
    note: 'Earthy · Golden · Warm',
    description:
      'A rhizome that hides its colour inside a humble brown skin. Dried and ground, it becomes the golden heart of Indian cooking.',
    glow: '#e3a21a',
  },
  {
    kind: 'chilli',
    name: 'Red Chilli',
    botanical: 'Capsicum annuum',
    note: 'Fiery · Vivid · Smoky',
    description:
      'Sun-dried until the skin turns deep and glossy. Its colour paints a dish long before its heat arrives on the palate.',
    glow: '#d8461c',
  },
  {
    kind: 'coriander',
    name: 'Coriander Seed',
    botanical: 'Coriandrum sativum',
    note: 'Citrus · Nutty · Floral',
    description:
      'Tiny ribbed globes with a bright, lemony fragrance that blooms the moment they meet a warm pan.',
    glow: '#c8a865',
  },
  {
    kind: 'pepper',
    name: 'Black Pepper',
    botanical: 'Piper nigrum',
    note: 'Pungent · Woody · Sharp',
    description:
      'Wrinkled berries from climbing vines, carrying a heat that is clean, lively and unmistakable.',
    glow: '#8a7a68',
  },
  {
    kind: 'cinnamon',
    name: 'Cinnamon',
    botanical: 'Cinnamomum',
    note: 'Sweet · Woody · Warm',
    description:
      'Inner bark that curls into quills as it dries — a gentle sweetness that gives garam masala its warmth.',
    glow: '#b86a35',
  },
  {
    kind: 'cardamom',
    name: 'Green Cardamom',
    botanical: 'Elettaria cardamomum',
    note: 'Floral · Cool · Fragrant',
    description:
      'Small green pods holding sticky black seeds and a perfume that lifts biryanis, chai and sweets alike.',
    glow: '#93b05a',
  },
]
