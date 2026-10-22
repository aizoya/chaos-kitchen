import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const root = new URL('../', import.meta.url);
test('hosted root and downloadable game contain the same complete, parseable bundle', () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], {cwd: root, env:{...process.env, VERCEL:'0'}});
  const hosted = readFileSync(new URL('dist/index.html', root), 'utf8');
  assert.equal(hosted, readFileSync(new URL('dist/Chaos-Kitchen.html', root), 'utf8'));
  assert.ok(hosted.includes('NEXT SHIFT'));
  assert.equal(/we win.{0,15}learn/i.test(hosted), false, 'internal company motto is not shipped in the game');
  assert.ok(!/(?:src|href)="(?:src\/|public\/|styles\.css)/.test(hosted));
  const scripts = [...hosted.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  execFileSync(process.execPath, ['--input-type=module', '--check'], {input:scripts[0][1]});
});

test('Vercel hosted analytics does not leak into the downloadable game', () => {
  try {
    execFileSync(process.execPath, ['scripts/build.mjs'], {cwd:root, env:{...process.env, VERCEL:'1'}});
    const hosted = readFileSync(new URL('dist/index.html', root), 'utf8');
    const offline = readFileSync(new URL('dist/Chaos-Kitchen.html', root), 'utf8');
    const tag = '<script defer src="/_vercel/insights/script.js"></script>\n';
    assert.equal(hosted.split(tag).length, 2);
    assert.equal(hosted.replace(tag, ''), offline);
    assert.equal(offline.includes('/_vercel/insights'), false);
    assert.ok(hosted.includes('id="start"') && hosted.includes('id="restart"'));
  } finally {
    execFileSync(process.execPath, ['scripts/build.mjs'], {cwd:root, env:{...process.env, VERCEL:'0'}});
  }
});
