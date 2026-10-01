// Minimal static server for local preview and Playwright (no dependencies).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 4173;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    if (path.includes('..')) throw Object.assign(new Error('forbidden'), { code: 'EACCES' });
    let file = join(root, path);
    if ((await stat(file).catch(() => null))?.isDirectory()) {
      // Like GitHub Pages: /pizzaria → /pizzaria/, so relative links resolve.
      if (!url.pathname.endsWith('/')) {
        res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
        res.end();
        return;
      }
      file = join(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch (err) {
    const notFound = err.code === 'ENOENT';
    res.writeHead(notFound ? 404 : 403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(notFound ? 'Não encontrado' : 'Proibido');
  }
}).listen(port, () => console.log(`Famiglia Mancini — http://localhost:${port}`));
