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
      const headers = {
        'Content-Type': types[extname(path)],
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      };
      let status = 200, payload = data;
      if (extname(path) === '.mp4') {
        headers['Accept-Ranges'] = 'bytes';
        if (req.headers.range) {
          const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
          const first = match?.[1], last = match?.[2];
          const start = first ? Number(first) : Math.max(0, data.length - Number(last));
          const end = first && last ? Math.min(Number(last), data.length - 1) : data.length - 1;
          if (!match || (!first && !last) || (!first && Number(last) === 0) ||
              !Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
              start < 0 || start >= data.length || end < start) {
            res.writeHead(416, { ...headers, 'Content-Range': `bytes */${data.length}`, 'Content-Length': 0 });
            return res.end();
          }
          status = 206;
          headers['Content-Range'] = `bytes ${start}-${end}/${data.length}`;
          payload = data.subarray(start, end + 1);
        }
      }
      headers['Content-Length'] = payload.length;
      res.writeHead(status, headers);
      res.end(req.method === 'HEAD' ? undefined : payload);
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
