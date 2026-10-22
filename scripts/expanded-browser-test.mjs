// Actual Chromium + canonical bundled artwork; test hooks control game time only.
// Does not establish Mobile Safari, real speakers, or physical controller acceptance.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = new URL('../', import.meta.url), evidence = new URL('evidence/', root);
await mkdir(evidence, { recursive: true });
const original = await readFile(new URL('dist/Chaos-Kitchen.html', root), 'utf8');
const bundleSha256 = createHash('sha256').update(original).digest('hex');
const hook = `\nwindow.expansionQA={
 state:()=>JSON.parse(JSON.stringify({game,service})),ticket:()=>ticketFor(game),heat:id=>HEAT[id],
 tick:ms=>{updateGame({type:'TICK',ms});lastTime=performance.now();render();}
};`;
const html = original.replace('<script type="module">', '<script>window.requestAnimationFrame=()=>0;</script><script type="module">');
const close = html.lastIndexOf('</script>');
const instrumented = html.slice(0, close) + hook + html.slice(close);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const results = [];
try {
  for (const width of [320, 390, 430, 1440]) for (const difficulty of ['medium', 'hard']) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 650 }, reducedMotion: 'reduce', hasTouch: width < 800 });
    await context.setOffline(true);
    const page = await context.newPage(), errors = [], external = [];
    page.setDefaultTimeout(5000);
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', req => { if (!req.url().startsWith('data:')) external.push(req.url()); });
    const record = { width, difficulty, passed: false, offline: true, errors, externalRequests: external };
    const shot = async name => {
      await page.screenshot({ path: new URL(`expansion-${width}-${difficulty}-${name}.png`, evidence).pathname, fullPage: true });
      await page.screenshot({ path: new URL(`expansion-${width}-${difficulty}-${name}-viewport.png`, evidence).pathname });
    };
    const state = () => page.evaluate(() => window.expansionQA.state());
    const tick = ms => page.evaluate(ms => window.expansionQA.tick(ms), ms);
    const pantry = id => page.locator(`[data-ingredient="${id}"]`);
    const station = id => page.locator(`[data-food="${id}"] button`);
    const handoff = () => page.locator(width < 620 ? '#mobile-action' : '#handoff').click();
    const screenFits = async () => {
      if (width >= 620) return;
      assert.equal(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), true, 'phone game fits one viewport without page scrolling');
      const visible = await page.locator('#ticket, #pantry button:visible, #station-items button:visible, .mobile-tools button:visible').evaluateAll(nodes => nodes.every(el => {
        const r = el.getBoundingClientRect(), dock = document.querySelector('#mobile-dock').getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return r.top >= 0 && r.bottom <= dock.top && r.left >= 0 && r.right <= innerWidth && (el.id === 'ticket' || hit === el || el.contains(hit));
      }));
      assert.equal(visible, true, 'order and current task controls fit above the dock');
    };
    const noOverflow = async name => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name}: horizontal overflow at ${width}`);
    const touchTargets = async selectors => {
      const boxes = await page.locator(selectors).evaluateAll(nodes => nodes.filter(n => n.checkVisibility()).map(n => ({ text: n.textContent.trim(), w: n.getBoundingClientRect().width, h: n.getBoundingClientRect().height })));
      assert.ok(boxes.length > 0);
      const small = boxes.filter(b => b.w < 44 || b.h < 44);
      assert.deepEqual(small, [], 'visible game touch targets must be at least 44×44');
    };
    const dock = async () => {
      if (width >= 800) return;
      const status = await page.locator('#mobile-action').evaluate(el => {
        const r = el.getBoundingClientRect(), top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return { visible: r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, uncovered: top === el || el.contains(top), h: r.height };
      });
      assert.ok(status.visible && status.uncovered && status.h >= 44, `mobile action reachable: ${JSON.stringify(status)}`);
    };
    const dish = async tutorial => {
      const t = await page.evaluate(() => window.expansionQA.ticket()), ids = [...new Set([...t.required, ...t.optional])];
      for (const id of ids) if (!(await state()).game.selected.includes(id)) await pantry(id).click();
      await screenFits();
      if (width < 620) await page.locator('#mobile-action').click();
      if (width < 620 && !tutorial) {
        await page.locator('#mobile-clear').click();
        assert.equal(await page.locator('#pantry').isVisible(), true, 'Clear returns to ingredient choice');
        for (const id of ids) await pantry(id).click();
        await page.locator('#mobile-action').click();
      }
      for (const id of ids) { await station(id).click(); await station(id).click(); }
      await screenFits();
      await touchTargets('#station-items button, #handoff, #mobile-action');
      await handoff();
      for (const id of ids) {
        const heat = await page.evaluate(id => window.expansionQA.heat(id), id);
        if (!heat) continue;
        await station(id).click(); await tick(tutorial ? 999999 : heat + 1);
        assert.equal((await state()).game.cooking[id].state, 'ready');
        await dock(); await station(id).click();
      }
      await screenFits();
      await handoff();
      for (const id of ids) await station(id).click();
      await screenFits();
      await dock();
      await page.locator(width < 800 ? '#mobile-action' : '#serve').click();
      assert.equal((await state()).game.result.correct, true);
      assert.equal((await state()).game.status, 'feedback');
    };
    try {
      await page.setContent(instrumented, { waitUntil: 'load' });
      await page.waitForFunction(() => Boolean(window.expansionQA));
      await noOverflow('welcome');
      if (difficulty === 'medium') {
        await page.locator('#learn').click();
        await dish(true); await noOverflow('tutorial'); await shot('tutorial');
        await page.locator('#next').click();
        assert.equal((await state()).game.status, 'ended');
        assert.equal((await state()).game.served, 1);
        await page.locator('#home').click();
      }
      await page.locator('.game-options > summary').click();
      await page.locator('#difficulty').click();
      if (difficulty === 'hard') await page.locator('#difficulty').click();
      await page.locator('#chef-mode').check(); await page.locator('#practice').check(); await page.locator('#expanded-mode').check();
      await page.locator('#start').click();
      const capacity = difficulty === 'medium' ? 2 : 3;
      assert.equal((await state()).service.tables.length, capacity);
      assert.equal(await page.locator('#pantry button:visible').count(), 8);
      await noOverflow('game');
      await touchTargets('#pantry button, #table-rail button, #pause');
      await pantry('chicken').click();
      await page.locator('#table-rail button').nth(capacity - 1).click();
      assert.equal((await state()).game.selected.length, 0);
      await page.locator('#table-rail button').first().click();
      assert.deepEqual((await state()).game.selected, ['chicken']);
      await page.locator('#pantry').scrollIntoViewIfNeeded();
      await dock();
      if (width < 800) {
        const rail = await page.locator('#table-rail button').first().evaluate(el => {
          const r = el.getBoundingClientRect(), top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return { visible: r.y >= 0 && r.bottom <= innerHeight, uncovered: top === el || el.contains(top) };
        });
        assert.ok(rail.visible && rail.uncovered, 'table rail remains reachable while pantry is in view');
      }
      await shot('prep'); await dish(false);
      assert.equal(await page.locator('#rush-event').isVisible(), false, 'background rush banner moves into feedback');
      await page.locator('#feedback-rush').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('#feedback-rush').textContent(), await page.locator('#rush-event').textContent());
      assert.match(await page.locator('#feedback-rush').textContent(), /UNLOCKED: Chaos Star/);
      const readable = await page.locator('#feedback-rush').evaluate(el => {
        const range = document.createRange(); range.selectNodeContents(el);
        return [...range.getClientRects()].filter(r => r.width && r.height).every(r => {
          const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return r.top >= 0 && r.bottom <= innerHeight && (hit === el || el.contains(hit));
        });
      });
      assert.equal(readable, true, 'every line of the reward summary is visible and uncovered');
      if (width < 800) {
        const separated = await page.locator('#feedback').evaluate(el => el.getBoundingClientRect().bottom < document.querySelector('#mobile-dock').getBoundingClientRect().top);
        assert.equal(separated, true, 'feedback stays above mobile action dock');
      }
      await shot('reward'); await noOverflow('feedback');
      assert.ok((await state()).service.rewards.includes('Chaos Star'));
      await page.locator('#next').click(); await page.locator('#pause').click();
      const frozen = await state(); await tick(999999); assert.deepEqual(await state(), frozen);
      assert.equal(await page.locator('.showtime-track').isDisabled(), true);
      await noOverflow('paused'); await page.locator('#resume').click(); await dock();
      // End-of-shift coaching is wired to actual aggregate outcomes, then replay resets them.
      await page.locator('#pause').click(); await page.locator('#quit').click();
      assert.equal((await state()).game.status, 'ended');
      assert.equal(await page.locator('.lesson-motto').textContent(), 'WE WIN OR WE LEARN.');
      assert.match(await page.locator('#lesson-evidence').textContent(), /every completed plate/);
      await noOverflow('receipt');
      if (width < 620) {
        assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight <= innerHeight + 1),true,'results fit the phone viewport');
        for (const id of ['restart','home']) assert.equal(await page.locator('#'+id).evaluate(el=>{
          const r=el.getBoundingClientRect(), hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
          return r.top>=0 && r.bottom<=innerHeight && (hit===el || el.contains(hit));
        }),true,id+' visible and reachable without scrolling');
      }
      assert.ok(await page.locator('#lesson-tip').evaluate(el => parseFloat(getComputedStyle(el).fontSize) >= 16));
      await shot('receipt');
      await page.locator('#restart').click();
      assert.equal((await state()).game.status, 'playing');
      assert.equal((await state()).game.score, 0);
      assert.equal((await state()).game.served, 0);
      await page.locator('#pause').click(); await page.locator('#quit').click();
      assert.match(await page.locator('#lesson-tip').textContent(), /Show me the ropes/);
      await page.locator('#home').click();
      assert.equal(await page.locator('#welcome').isVisible(), true);
      if (difficulty === 'medium') {
        await page.locator('#inspection').click();
        assert.equal((await state()).game.inspection,true);
        assert.equal((await state()).service,null);
        assert.equal((await state()).game.practice,false);
        for (let n=0;n<3;n++) {
          assert.ok((await page.locator('#shift-goal').textContent()).includes('/3 plates'));
          await dish(false);
          await page.locator('#next').click();
        }
        assert.equal((await state()).game.status,'ended');
        assert.equal(await page.locator('#end-title').textContent(),'CHAOS STAR EARNED!');
        await page.locator('#restart').click();
        assert.equal((await state()).game.inspection,true);
        assert.equal((await state()).game.score,0);
        await page.locator('#pause').click();await page.locator('#quit').click();
        assert.equal(await page.locator('#end-title').textContent(),'THE INSPECTOR WILL RETURN.');
        await page.locator('#home').click();
      }
      assert.deepEqual(errors, []); assert.deepEqual(external, []);
      record.passed = true;
    } catch (error) {
      record.failure = error.message;
      await shot('failure').catch(() => {});
    } finally { results.push(record); await context.close(); }
  }
  // Explicit regression matrix for the founder-reported Clock In problem.
  // These fresh pages use real browser clicks, not element.click() or dispatched events.
  for (const width of [320, 390, 430]) for (const expanded of [false, true]) for (const introOpen of [true, false]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
    await context.setOffline(true);
    const page = await context.newPage(), errors = [];
    page.setDefaultTimeout(5000);
    page.on('pageerror', e => errors.push(e.message));
    const record = { clockIn: true, width, expanded, introOpen, passed: false, errors };
    try {
      await page.setContent(instrumented, { waitUntil: 'load' });
      await page.waitForFunction(() => Boolean(window.expansionQA));
      assert.equal(await page.locator('#start').isEnabled(), true, 'Clock In enabled after initialization');
      assert.equal(await page.locator('#startup-status').isVisible(), false, 'startup fallback hidden after initialization');
      await page.locator('.game-options > summary').click();
      if (expanded) await page.locator('#expanded-mode').check(); else await page.locator('#expanded-mode').uncheck();
      if (!introOpen) assert.equal(await page.locator('.showtime-panel').count(), 0);
      await page.locator('#start').scrollIntoViewIfNeeded();
      const unblocked = await page.locator('#start').evaluate(el => {
        const r = el.getBoundingClientRect(), top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return top === el || el.contains(top);
      });
      assert.ok(unblocked, 'Clock In center is not covered');
      await page.locator('#start').tap();
      assert.equal(await page.locator('#game').isVisible(), true);
      assert.equal(await page.locator('#welcome').isVisible(), false);
      assert.equal(await page.evaluate(() => window.expansionQA.state().game.status), 'playing');
      assert.equal(await page.evaluate(() => Boolean(window.expansionQA.state().service)), expanded);
      assert.deepEqual(errors, []);
      record.passed = true;
    } catch (error) {
      record.failure = error.message;
      await page.screenshot({ path: new URL(`expansion-clock-in-${width}-${expanded}-${introOpen}-failure.png`, evidence).pathname, fullPage: true }).catch(() => {});
    } finally { results.push(record); await context.close(); }
  }
} finally { await browser.close(); }
for (const result of results) result.bundleSha256 = bundleSha256;
await writeFile(new URL('expanded-browser-results.json', evidence), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some(r => !r.passed)) process.exitCode = 1;
