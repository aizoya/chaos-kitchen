import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const root = new URL('../', import.meta.url);
test('hosted root and downloadable game contain the same complete, parseable bundle', () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], {cwd: root});
  const hosted = readFileSync(new URL('dist/index.html', root), 'utf8');
  assert.equal(hosted, readFileSync(new URL('dist/Chaos-Kitchen.html', root), 'utf8'));
  assert.ok(hosted.includes('NEXT SHIFT'));
  assert.equal(/we win.{0,15}learn/i.test(hosted), false, 'internal company motto is not shipped in the game');
  assert.ok(!/(?:src|href)="(?:src\/|public\/|styles\.css)/.test(hosted));
  const scripts = [...hosted.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  execFileSync(process.execPath, ['--input-type=module', '--check'], {input:scripts[0][1]});
});
