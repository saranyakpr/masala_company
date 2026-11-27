export const processSteps = [
  {
    title: 'Carefully Selected',
    text: 'It begins with the raw spice itself — chosen for colour, aroma and character before it ever reaches the mill.',
    icon: 'select',
  },
  {
    title: 'Traditional Sourcing',
    text: 'Spices are gathered from the regions that have grown them for generations, where soil and climate shape their flavour.',
    icon: 'source',
  },
  {
    title: 'Cleaning & Processing',
    text: 'Every lot is cleaned, sorted and dried so that only the spice — nothing else — moves on to the next stage.',
    icon: 'clean',
  },
  {
    title: 'Grinding & Blending',
    text: 'Ground to the right texture and blended in balanced proportions, so each masala tastes the way it is meant to.',
    icon: 'grind',
  },
  {
    title: 'Quality Checking',
    text: 'Colour, aroma and texture are checked batch after batch, keeping every jar consistent with the last.',
    icon: 'check',
  },
  {
    title: 'Final Packaging',
    text: 'Sealed into our signature jars to hold in freshness and aroma — ready for your kitchen.',
    icon: 'pack',
  },
] as const

export type ProcessIcon = (typeof processSteps)[number]['icon']

export const pillars = [
  {
    title: 'Quality Ingredients',
    text: 'Good flavour starts at the source. We begin with spices chosen for their natural colour and aroma.',
  },
  {
    title: 'Authentic Flavour',
    text: 'Recipes rooted in Indian kitchens, so your curries, biryanis and sambars taste the way they should.',
  },
  {
    title: 'Freshness',
    text: 'Packed to protect the aroma that makes a spice worth cooking with — from our mill to your masala box.',
  },
  {
    title: 'Hygienic Processing',
    text: 'Clean handling at every stage of cleaning, grinding and packing — because purity is part of taste.',
  },
  {
    title: 'Consistent Quality',
    text: 'The jar you buy next month should taste like the one you loved today. Consistency is the craft.',
  },
  {
    title: 'Carefully Crafted Blends',
    text: 'Each masala is balanced spice by spice, built for the dish it is named after.',
  },
] as const

export interface Dish {
  id: 'biryani' | 'curry' | 'sambar'
  name: string
  story: string
  productId: string
  productName: string
}

export const dishes: Dish[] = [
  {
    id: 'biryani',
    name: 'Dum Biryani',
    story: 'Layer by fragrant layer, plain rice turns golden — perfumed with cardamom, cinnamon and slow-sealed steam.',
    productId: 'biryani-masala',
    productName: 'Biryani Masala',
  },
  {
    id: 'curry',
    name: 'Chicken Curry',
    story: 'A pale simmer deepens into a glossy, brick-red gravy — the kind that brings everyone to the kitchen.',
    productId: 'chicken-masala',
    productName: 'Chicken Masala',
  },
  {
    id: 'sambar',
    name: 'Temple-Style Sambar',
    story: 'Humble lentils become a tangy, soul-warming bowl, finished with mustard seeds and curry leaves.',
    productId: 'sambar-masala',
    productName: 'Sambar Masala',
  },
]

export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Spices', to: '/spices' },
  { label: 'Our Blend', to: '/blends' },
  { label: 'Shop Now', to: '/shop' },
  { label: 'Contact', to: '/contact' },
] as const
