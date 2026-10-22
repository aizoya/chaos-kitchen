import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateContent } from '../src/content.mjs';
validateContent();
const root = new URL('../', import.meta.url);
for (const [file, hash] of [
  [
    'public/aizoya-master-logo.png',
    '693c6e2d1a074f229dbf599c2947d42a3a8c66fb81f5223f33ed37f901002d91',
  ],
  [
    'public/grace-avatar.webp',
    '8ebc1814cfdb9625c912e0c6ce0c8ee7970fd3511d56297aa0d3aaf60211deaf',
  ],
]) {
  if (
    createHash('sha256')
      .update(await readFile(new URL(file, root)))
      .digest('hex') !== hash
  )
    throw Error('Canonical asset changed: ' + file);
}
const intro = JSON.parse(await readFile(new URL('devpost/chef-intro-assets.json', root), 'utf8'));
for (const asset of intro.assets) {
  const bytes = await readFile(new URL(asset.path, root));
  if (bytes.length !== asset.bytes || createHash('sha256').update(bytes).digest('hex') !== asset.sha256)
    throw Error('Chef intro asset changed: ' + asset.path);
}
for (const file of [
  'src/app.mjs',
  'src/controller.mjs',
  'src/engine.mjs',
  'src/service.mjs',
  'src/showtime.mjs',
  'src/content.mjs',
  'src/art.mjs',
  'index.html',
  'styles.css',
]) {
  const text = await readFile(new URL(file, root), 'utf8');
  if (
    /\b(fetch|XMLHttpRequest|WebSocket|localStorage|eval)\s*\(/.test(text) ||
    /sk-[A-Za-z0-9]{20,}/.test(text)
  )
    throw Error('Review network/secret/storage boundary: ' + file);
}
console.log(
  'Content, canonical asset hashes and narrow runtime boundary checks pass. Not a comprehensive secret audit.',
);
