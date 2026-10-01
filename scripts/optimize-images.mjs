// Generates the responsive WebP set in assets/img from the originals in
// assets/source (the photos and artwork supplied with the first proposal).
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => join(root, 'assets/source', f);
const out = (f) => join(root, 'assets/img', f);

// [source file, output basename, widths, quality]
const jobs = [
  ['hero-facade.jpg', 'fachada', [720, 1200, 1800], 74],
  ['ambiente-salao.jpg', 'salao', [720, 1200, 1600], 74],
  ['ambiente-antepastos.jpg', 'antepastos', [640, 1200], 76],
  ['penne-frutos-do-mar.jpg', 'penne-frutos-do-mar', [560, 960], 76],
  ['canelone-fiorentina.jpg', 'canelone-fiorentina', [560, 960], 76],
  ['fetuccini-polpetone.jpg', 'fetuccini-polpetone', [560, 960], 76],
  ['hero-postal.jpg', 'rua-avanhandava', [1000, 1600], 78],
  ['cheesecake.jpg', 'cheesecake', [640], 80],
  ['mascote.png', 'mascote', [260, 520], 86],
  ['logo-medalhao.png', 'medalhao', [160, 320, 500], 88],
];

await mkdir(out(''), { recursive: true });

for (const [file, name, widths, quality] of jobs) {
  for (const width of widths) {
    const target = out(`${name}-${width}.webp`);
    const info = await sharp(src(file))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toFile(target);
    console.log(`img  ${name}-${width}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
  }
}
