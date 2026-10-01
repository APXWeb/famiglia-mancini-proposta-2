// Stamps every local stylesheet and script with a hash of its content
// (styles.css?v=1a2b3c4d), in the HTML and in the JS imports, so browsers
// never mix files from two deploys. GitHub Pages lets browsers cache assets
// for 10 minutes; without this, a returning visitor can get new HTML with
// old CSS and JS. Run before publishing: `npm run stamp`.
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = /\?v=[0-9a-f]{8}/g;
// import x from './a.js' · export … from './a.js' · import('./a.js')
const JS_IMPORT = /(\bfrom\s*|\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"?]+\.js)(?:\?v=[0-9a-f]{8})?\2/g;
// href/src pointing into assets/ for .css and .js
const HTML_ASSET = /((?:href|src)=")((?:\.\.\/)*assets\/[^"?]+\.(?:css|js))(?:\?v=[0-9a-f]{8})?"/g;

const md5 = (text) => createHash('md5').update(text).digest('hex').slice(0, 8);

async function listFiles(dir, ext, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'test-results', 'playwright-report', '.impeccable'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await listFiles(path, ext, out);
    else if (ext.some((e) => entry.name.endsWith(e))) out.push(path);
  }
  return out;
}

// A module's version covers its own text and, recursively, its imports,
// so a change deep in the graph reaches every page that loads it.
const versions = new Map();
const visiting = new Set();
async function versionOf(file) {
  if (versions.has(file)) return versions.get(file);
  if (visiting.has(file)) return md5(file); // cycle guard
  visiting.add(file);
  const text = (await readFile(file, 'utf8')).replace(VERSION, '');
  let seed = text;
  if (file.endsWith('.js')) {
    for (const [, , , spec] of text.matchAll(JS_IMPORT)) seed += await versionOf(resolve(dirname(file), spec));
  }
  const v = md5(seed);
  visiting.delete(file);
  versions.set(file, v);
  return v;
}

let changed = 0;
async function rewrite(file, pattern, toPath) {
  const before = await readFile(file, 'utf8');
  let after = before;
  for (const match of before.matchAll(pattern)) {
    const target = toPath(match);
    const v = await versionOf(target);
    after = after.replace(match[0], match[0].replace(VERSION, '').replace(/(['"])$/, `?v=${v}$1`));
  }
  if (after !== before) {
    await writeFile(file, after);
    changed++;
    console.log(`stamp  ${relative(root, file)}`);
  }
}

for (const file of await listFiles(join(root, 'assets/js'), ['.js'])) {
  await rewrite(file, JS_IMPORT, (m) => resolve(dirname(file), m[3]));
}
// JS files may have changed: versions computed above already ignore stamps.
for (const file of await listFiles(root, ['.html'])) {
  await rewrite(file, HTML_ASSET, (m) => resolve(dirname(file), m[2]));
}
console.log(changed ? `${changed} arquivos atualizados` : 'nada a atualizar');
