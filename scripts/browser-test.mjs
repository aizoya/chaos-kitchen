// Development-only: supply installed Playwright and a Chromium executable. No downloads here.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { makeServer } from './server.mjs';
import { TICKETS, nameOf } from '../src/content.mjs';
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const root = new URL('../', import.meta.url),
  evidence = new URL('evidence/', root);
await mkdir(evidence, { recursive: true });
const server = makeServer();
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
const results = [];
try {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 },
    { width: 320, height: 740 },
  ]) {
    const context = await browser.newContext({
        viewport,
        reducedMotion: 'reduce',
      }),
      page = await context.newPage(),
      errors = [],
      external = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('request', (r) => {
      if (!r.url().startsWith('http://127.0.0.1:')) external.push(r.url());
    });
    await page.clock.install();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.locator('#start').waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      'no horizontal overflow welcome',
    );
    await page.screenshot({
      path: new URL(`welcome-${viewport.width}.png`, evidence).pathname,
      fullPage: true,
    });
    await page.locator('#start').click();
    assert.equal(
      await page.locator('#ticket-title').textContent(),
      'THE FIRST DATE',
    );
    for (const id of ['chicken', 'rice', 'chili'])
      await page.getByRole('button', { name: nameOf(id), exact: true }).click();
    await page.screenshot({
      path: new URL(`game-${viewport.width}.png`, evidence).pathname,
      fullPage: true,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      'no horizontal overflow game',
    );
    const boxes = await page
      .locator('.ingredient:not([hidden])')
      .evaluateAll((nodes) =>
        nodes.map((n) => ({
          w: n.getBoundingClientRect().width,
          h: n.getBoundingClientRect().height,
        })),
      );
    assert.ok(
      boxes.every((b) => b.w >= 44 && b.h >= 44),
      'touch targets',
    );
    assert.ok(
      (await page.locator('#pause').boundingBox()).height >= 44,
      'pause touch target',
    );
    await page.locator(viewport.width <= 620 ? '#mobile-action' : '#serve').click();
    assert.equal(
      await page.locator('#reaction').textContent(),
      'He cried. She ordered another one.',
    );
    const score = await page.locator('#score').textContent(),
      clock = await page.locator('#clock').textContent();
    await page.clock.runFor(1500);
    assert.equal(
      await page.locator('#clock').textContent(),
      clock,
      'feedback freezes clocks',
    );
    await page.screenshot({
      path: new URL(`reaction-${viewport.width}.png`, evidence).pathname,
      fullPage: true,
    });
    await page.locator('#next').click();
    await page.locator('#pause').click();
    const pausedClock = await page.locator('#clock').textContent();
    await page.clock.runFor(2000);
    assert.equal(await page.locator('#clock').textContent(), pausedClock);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'quit');
    await page.locator('#resume').click();
    await page.locator(viewport.width <= 620 ? '#mobile-panic' : '#panic').click();
    assert.equal(await page.locator('#panic').isDisabled(), true);
    // Expiry is processed even if the browser was stalled between frames.
    await page.clock.runFor(24000);
    assert.equal(
      await page.locator('#feedback-title').textContent(),
      'TICKET TIMED OUT',
    );
    assert.equal(await page.locator('#score').textContent(), score);
    await page.locator('#pause').click();
    await page.locator('#quit').click();
    await page.locator('#restart').click();
    assert.equal(await page.locator('#score').textContent(), '00000');
    // Hidden tabs pause and do not silently resume.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal(await page.locator('#pause-layer').isVisible(), true);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal(await page.locator('#pause-layer').isVisible(), true);
    await page.locator('#quit').click();
    await page.locator('#home').click();
    await page.locator('.game-options > summary').click();
    await page.locator('#practice').check();
    await page.locator('#start').click();
    assert.equal(await page.locator('#panic').isDisabled(), true);
    for (let i = 0; i < 10; i++) {
      const title = await page.locator('#ticket-title').textContent(),
        ticket = TICKETS.find((t) => t.title === title);
      for (const id of [...ticket.required, ...ticket.optional])
        await page
          .getByRole('button', { name: nameOf(id), exact: true })
          .click();
      await page.locator(viewport.width <= 620 ? '#mobile-action' : '#serve').click();
      await page.locator('#next').click();
    }
    assert.equal(await page.locator('#ending').isVisible(), true);
    assert.match(
      await page.locator('#end-stats').textContent(),
      /Untimed practice/,
    );
    await page.screenshot({
      path: new URL(`receipt-${viewport.width}.png`, evidence).pathname,
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    results.push({
      viewport,
      passed: true,
      errors,
      externalRequests: external.length,
    });
    await context.close();
  }
  const offline = await browser.newContext(),
    page = await offline.newPage(),
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await offline.setOffline(true);
  await page.goto(
    pathToFileURL(new URL('dist/Chaos-Kitchen.html', root).pathname).href,
  );
  await page.locator('#start').click();
  await page.getByRole('button', { name: 'Rice', exact: true }).click();
  await page.getByRole('button', { name: 'Chicken', exact: true }).click();
  await page.locator('#serve').click();
  assert.equal(
    await page.locator('#feedback-title').textContent(),
    'ORDER UP!',
  );
  assert.deepEqual(errors, []);
  await offline.close();
  results.push({ offlineStandalone: true, passed: true });
  await writeFile(
    new URL('browser-results.json', evidence),
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
