import test from 'node:test';
import assert from 'node:assert/strict';
import { makeServer } from '../scripts/server.mjs';
test('local server serves only public files and no private source or credentials', async () => {
  const server = makeServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of [
      '/',
      '/styles.css',
      '/src/app.mjs',
      '/public/grace-avatar.webp',
    ])
      assert.equal((await fetch(url + path)).status, 200);
    for (const path of [
      '/.env',
      '/.git/config',
      '/package.json',
      '/devpost/learner-profile.md',
      '/scripts/server.mjs',
      '/nope',
    ])
      assert.equal((await fetch(url + path)).status, 404);
    assert.equal((await fetch(url, { method: 'POST' })).status, 405);
    assert.equal((await fetch(url, { method: 'HEAD' })).status, 200);
    assert.match(
      (await fetch(url)).headers.get('content-security-policy'),
      /connect-src 'none'/,
    );
  } finally {
    await new Promise((r) => server.close(r));
  }
});
