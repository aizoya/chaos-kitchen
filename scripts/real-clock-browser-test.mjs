// Real requestAnimationFrame and clocks; no injected state or clock overrides.
import assert from 'node:assert/strict';
import { makeServer } from './server.mjs';
import { HEAT } from '../src/engine.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = makeServer();
await new Promise(r => server.listen(0, '127.0.0.1', r));
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true });
  for (const expanded of [false, true]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
    page.setDefaultTimeout(7000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.locator('.showtime-skip').click();
    await page.locator('#chef-mode').check();
    await page.locator('#practice').uncheck();
    await page.locator('#expanded-mode').setChecked(expanded);
    await page.locator('#start').tap();
    const clock = await page.locator('#clock').textContent();
    for (const id of ['chicken', 'rice', 'chili']) await page.locator('[data-ingredient="' + id + '"]').tap();
    for (const id of ['chicken', 'rice', 'chili']) {
      const button = page.locator('[data-food="' + id + '"] button');
      await button.tap();
      await button.tap();
    }
    await page.locator('#handoff').tap();
    for (const id of ['chicken', 'rice', 'chili'].filter(id => HEAT[id])) {
      const row = page.locator('[data-food="' + id + '"]');
      await row.locator('button').tap();
      await page.waitForFunction(id => document.querySelector('[data-food="' + id + '"] .pan-state')?.textContent.includes('STOP NOW'), id, { timeout: 7000 });
      await row.locator('button').tap();
      assert.equal(await row.locator('.pan-state').textContent(), 'DONE');
    }
    await page.locator('#handoff').tap();
    for (const id of ['chicken', 'rice', 'chili']) await page.locator('[data-food="' + id + '"] button').tap();
    await page.locator('#mobile-action').tap();
    assert.equal(await page.locator('#feedback-title').textContent(), 'CHEF’S KISS!');
    assert.ok(Number(await page.locator('#score').textContent()) > 0);
    assert.notEqual(await page.locator('#clock').textContent(), clock, 'real service clock progressed during cooking');
    await page.locator('#next').tap();
    await page.locator('#pause').tap();
    await page.locator('#quit').tap();
    assert.equal(await page.locator('#ending').isVisible(), true);
    assert.equal(await page.locator('.lesson-motto').textContent(), 'WE WIN OR WE LEARN.');
    await page.locator('#restart').tap();
    assert.equal(await page.locator('#score').textContent(), '00000');
    assert.equal(await page.locator('#game').isVisible(), true);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ test: 'real-clock-chef', expanded, width: 390, passed: true, errors }));
    await page.close();
  }
} finally {
  await browser?.close();
  await new Promise(r => server.close(r));
}
