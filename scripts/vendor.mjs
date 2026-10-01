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
  [nm('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'), 'assets/fonts/archivo-latin-wdth.woff2'],
  [nm('@fontsource-variable/archivo/files/archivo-latin-ext-wdth-normal.woff2'), 'assets/fonts/archivo-latin-ext-wdth.woff2'],
  [nm('@fontsource/tenor-sans/files/tenor-sans-latin-400-normal.woff2'), 'assets/fonts/tenor-sans-latin.woff2'],
  [nm('@fontsource/yellowtail/files/yellowtail-latin-400-normal.woff2'), 'assets/fonts/yellowtail-latin.woff2'],
];

for (const [from, to] of files) {
  const dest = join(root, to);
  await mkdir(dirname(dest), { recursive: true });
  await copyFile(from, dest);
  console.log(`vendor  ${to}`);
}
