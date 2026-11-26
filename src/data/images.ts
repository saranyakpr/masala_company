/**
 * Client-supplied product photography (public/images/products).
 * Every product has a square studio shot; files are served at two widths for srcset.
 */

export interface ResponsiveImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

const base = '/images/products';

export const productImage = (slug: string): ResponsiveImage => ({
  src: `${base}/${slug}-1200.webp`,
  srcSet: `${base}/${slug}-640.webp 640w, ${base}/${slug}-1200.webp 1200w`,
  width: 1200,
  height: 1200,
});

/** Square crop of the group shot (About page hero). */
export const rangeSquareImage: ResponsiveImage = {
  src: `${base}/range-square-900.webp`,
  srcSet: `${base}/range-square-520.webp 520w, ${base}/range-square-900.webp 900w`,
  width: 900,
  height: 900,
};

/** Group shot of the full twelve-jar range. */
export const collectionImage: ResponsiveImage = {
  src: `${base}/range-collection-1600.webp`,
  srcSet: `${base}/range-collection-960.webp 960w, ${base}/range-collection-1600.webp 1600w`,
  width: 1600,
  height: 900,
};
