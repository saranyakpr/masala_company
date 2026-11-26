/**
 * Crops the raw ingredients (turmeric roots, chillies, peppercorns, seeds, pods, bark, star anise)
 * out of the client's product photography for the homepage "Our ingredients" section.
 *
 * Usage (sharp is not a project dependency):
 *   npm i --no-save sharp && node scripts/crop-ingredient-images.cjs <folder with the original 1254px photos>
 * Photo numbers follow the upload order: 2 Cardamom, 5 Chicken, 8 Garam, 9 Black Pepper Powder,
 * 10 Coriander, 11 Kashmiri Chilli, 12 Turmeric, 13 Cumin.
 */
const path = require('path');
const sharp = require('sharp');
const SRC = process.argv[2];
if (!SRC) throw new Error('Pass the folder containing the original product photos.');
const OUT = path.join(__dirname, '..', 'public', 'images', 'ingredients');
require('fs').mkdirSync(OUT, { recursive: true });
// [id, source photo, left, top, size] — square crops of the raw ingredients in the product photography
const crops = [
  ['turmeric', '12.png', 20, 720, 520],
  ['chilli', '11.png', 30, 740, 500],
  ['black-pepper', '9.png', 820, 680, 434],
  ['coriander', '10.png', 100, 680, 540],
  ['cumin', '13.png', 40, 700, 554],
  ['cardamom', '2.png', 840, 740, 414],
  ['cinnamon', '8.png', 0, 700, 330],
  ['star-anise', '8.png', 170, 790, 360],
];
(async () => {
  for (const [id, f, l, t, s] of crops) {
    const base = sharp(path.join(SRC, f)).extract({ left: l, top: t, width: s, height: s });
    await base.clone().resize(720, 720, { kernel: 'lanczos3' }).sharpen({ sigma: 0.6 }).webp({ quality: 82 }).toFile(`${OUT}/${id}-720.webp`);
    await base.clone().resize(400, 400, { kernel: 'lanczos3' }).webp({ quality: 80 }).toFile(`${OUT}/${id}-400.webp`);
    await base.clone().resize(160, 160).webp({ quality: 80 }).toFile(`${OUT}/${id}-160.webp`);
  }
  console.log(require('fs').readdirSync(OUT).map((f) => f + ' ' + Math.round(require('fs').statSync(OUT + '/' + f).size / 1024) + 'KB').join('\n'));
})();
