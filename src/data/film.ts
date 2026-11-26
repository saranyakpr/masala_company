/**
 * Look of the client's reference video (15 s spice-jar ad), shared by the homepage banner and the
 * intro loader: the eleven spice bursts in the video's order and colours, and the jar textures.
 */

export type PieceKind = 'pepper' | 'coriander' | 'cumin' | 'cardamom' | 'chilli' | 'anise' | 'cinnamon' | 'turmeric';

export interface FilmChapter {
  title: string;
  /** Powder colours sampled from the video frames (light / deep). */
  colors: [string, string];
  /** 'star' = radial spikes, 'stream' = diagonal sweep, 'swirl' = spiral, 'float' = loose whole spices. */
  style: 'star' | 'stream' | 'swirl' | 'float';
  /** Whole pieces thrown out by the burst. */
  pieces: Partial<Record<PieceKind, number>>;
  /** Powder density, 0–1. */
  powder: number;
}

export const filmChapters: FilmChapter[] = [
  { title: 'Turmeric Powder', colors: ['#f6b91f', '#d9860e'], style: 'star', pieces: { turmeric: 7 }, powder: 1 },
  { title: 'Kashmiri Chilli Powder', colors: ['#d23a1e', '#8e1f12'], style: 'stream', pieces: { chilli: 9 }, powder: 1 },
  { title: 'Coriander Powder', colors: ['#d2b878', '#9c8a4a'], style: 'star', pieces: { coriander: 40 }, powder: 0.9 },
  { title: 'Cumin Powder', colors: ['#a07a46', '#5e4526'], style: 'stream', pieces: { cumin: 44 }, powder: 0.9 },
  { title: 'Black Pepper Powder', colors: ['#5a4b40', '#2c241f'], style: 'stream', pieces: { pepper: 40 }, powder: 0.8 },
  { title: 'Sambar Masala', colors: ['#e09a33', '#b5651e'], style: 'star', pieces: { chilli: 4, coriander: 18, cinnamon: 2 }, powder: 1 },
  { title: 'Biryani Masala', colors: ['#cf8636', '#8f4f1d'], style: 'swirl', pieces: { anise: 4, cinnamon: 3, cardamom: 6, chilli: 3 }, powder: 1 },
  { title: 'Chicken Masala', colors: ['#e09430', '#b8561f'], style: 'star', pieces: { chilli: 6, pepper: 12, coriander: 10 }, powder: 1 },
  { title: 'Chaat Masala', colors: ['#e6b552', '#b98a35'], style: 'star', pieces: { coriander: 12, cumin: 14, anise: 2 }, powder: 0.95 },
  { title: 'Black Peppercorns', colors: ['#4a3d34', '#231c18'], style: 'float', pieces: { pepper: 48 }, powder: 0.2 },
  { title: 'Green Cardamom', colors: ['#a7ad66', '#6f7a3a'], style: 'float', pieces: { cardamom: 26, pepper: 8 }, powder: 0.25 },
];

/** Textures for the banner jar (also preloaded by the intro loader). */
export const filmAssets = {
  stripes: '/images/film/film-stripes.webp',
  label: '/images/film/film-label.webp',
  woodSide: '/images/film/film-wood-side.webp',
  woodTop: '/images/film/film-wood-top.webp',
};
