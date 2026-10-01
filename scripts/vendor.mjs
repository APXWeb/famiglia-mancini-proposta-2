// Copies the third-party runtime files the static site needs into assets/.
// The site itself has no build step: run `npm run vendor` after `npm install`.
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nm = (p) => join(root, 'node_modules', p);

const files = [
  [nm('gsap/dist/gsap.min.js'), 'assets/vendor/gsap.min.js'],
  [nm('gsap/dist/ScrollTrigger.min.js'), 'assets/vendor/ScrollTrigger.min.js'],
  [nm('gsap/dist/SplitText.min.js'), 'assets/vendor/SplitText.min.js'],
  [nm('lenis/dist/lenis.min.js'), 'assets/vendor/lenis.min.js'],
  [nm('@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2'), 'assets/fonts/playfair-latin-wght.woff2'],
  [nm('@fontsource-variable/playfair-display/files/playfair-display-latin-wght-italic.woff2'), 'assets/fonts/playfair-latin-wght-italic.woff2'],
  [nm('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'), 'assets/fonts/inter-latin-wght.woff2'],
];

for (const [from, to] of files) {
  const dest = join(root, to);
  await mkdir(dirname(dest), { recursive: true });
  await copyFile(from, dest);
  console.log(`vendor  ${to}`);
}
