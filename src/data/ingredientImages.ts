/**
 * Ingredient photography, cropped from the client's product shots (public/images/ingredients;
 * see scripts/crop-ingredient-images.cjs): the raw turmeric, chillies, peppercorns, seeds, pods,
 * bark and star anise styled beside each jar. Used on the homepage and the Ingredients page so
 * each ingredient looks the same everywhere. To use dedicated ingredient photos later, replace
 * the files with the same names.
 */
const base = '/images/ingredients';

export const ingredientImage = (id: string) => ({
  src: `${base}/${id}-720.webp`,
  srcSet: `${base}/${id}-400.webp 400w, ${base}/${id}-720.webp 720w`,
  thumb: `${base}/${id}-160.webp`,
});
