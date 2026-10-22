import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const allowed = new Set([
  'index.html',
  'styles.css',
  'src/app.mjs',
  'src/controller.mjs',
  'src/art.mjs',
  'src/content.mjs',
  'src/engine.mjs',
  'src/service.mjs',
  'src/showtime.mjs',
  'public/aizoya-master-logo.png',
  'public/grace-avatar.webp',
  'public/chef-franklyn-anime-v1.webp',
  'public/chef-franklyn-intro-v1.mp4',
]);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
};
export function makeServer() {
  return createServer(async (req, res) => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405);
        return res.end();
      }
      const path =
        decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(
          1,
        ) || 'index.html';
      if (!allowed.has(path)) {
        res.writeHead(404);
        return res.end('Not found');
      }
      const data = await readFile(resolve(root, path));
      res.writeHead(200, {
        'Content-Type': types[extname(path)],
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch {
      res.writeHead(400);
      res.end('Bad request');
    }
  });
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  makeServer().listen(4173, '127.0.0.1', () =>
    console.log(
      'Chaos Kitchen: http://127.0.0.1:4173 — local only; no APIs or spend',
    ),
  );
