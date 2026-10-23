// Development-only DOM assertions: not visual, physical-controller, or speaker QA.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const { JSDOM } = await import(process.env.JSDOM_MODULE || 'jsdom');
const html = await readFile(new URL('../dist/Chaos-Kitchen.html', import.meta.url), 'utf8');
const source = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.test' });
const w = dom.window, d = w.document, $ = id => d.getElementById(id);
w.requestAnimationFrame = () => {};
w.scrollTo = () => {};
w.matchMedia = () => ({ matches: true });
w.Element.prototype.getAnimations = () => [];
w.Element.prototype.scrollIntoView = () => {};
Object.defineProperty(w.HTMLElement.prototype, 'inert', { get() { return this.hasAttribute('inert'); }, set(value) { this.toggleAttribute('inert', Boolean(value)); } });
w.Element.prototype.getClientRects = function () { return this.closest('[hidden]') ? [] : [{}]; };
w.navigator.getGamepads = () => [];
try {
  w.eval(source + `\nwindow.expandedProbe = {
    state: () => JSON.parse(JSON.stringify({game,service})),
    ticket: () => JSON.parse(JSON.stringify(ticketFor(game))),
    heat: id => HEAT[id],
    tick: ms => {updateGame({type:'TICK',ms}); lastTime=performance.now(); render();},
    reset: options => {service=createService(options);game=serviceView(service);drawnTicket=-1;drawnPlate='!';stationKey='';lastStatus='';feedbackKey='';lastTime=performance.now();render();}
  };`);
  const raw = w.expandedProbe;
  const p = { ...raw, state: () => JSON.parse(JSON.stringify(raw.state())), ticket: () => JSON.parse(JSON.stringify(raw.ticket())) };
  const ingredient = id => d.querySelector(`[data-ingredient="${id}"]`);
  const stationButton = id => d.querySelector(`[data-food="${id}"] button`);
  const click = el => { assert.ok(el && !el.disabled && !el.closest('[hidden]'), 'control must be actionable'); el.click(); };
  const completeDish = ({ tutorial = false } = {}) => {
    const ticket = p.ticket(), ids = [...new Set([...ticket.required, ...ticket.optional])];
    for (const id of ids) if (!p.state().game.selected.includes(id)) click(ingredient(id));
    for (const id of ids) { click(stationButton(id)); click(stationButton(id)); }
    click($('handoff')); assert.equal(p.state().game.station, 'cook');
    for (const id of ids) if (p.heat(id)) {
      click(stationButton(id)); p.tick(tutorial ? 999999 : p.heat(id) + 1);
      assert.equal(p.state().game.cooking[id].state, 'ready');
      click(stationButton(id)); assert.equal(p.state().game.cooking[id].state, 'done');
    }
    click($('handoff')); assert.equal(p.state().game.station, 'plate');
    for (const id of ids) click(stationButton(id));
    click($('serve')); assert.equal(p.state().game.status, 'feedback');
    assert.equal(p.state().game.result.correct, true);
  };

  $('difficulty').click(); $('chef-mode').checked = true; $('practice').checked = true; $('expanded-mode').checked = true;
  click($('start'));
  assert.equal(p.state().service.tables.length, 2);
  assert.equal(p.state().game.difficulty, 'medium');
  const visible = [...$('pantry').children].filter(el => !el.hidden);
  assert.equal(visible.length, 8);
  for (const id of [...p.ticket().required, ...p.ticket().optional]) assert.ok(visible.some(el => el.dataset.ingredient === id));
  click(ingredient('chicken')); click($('table-rail').children[1]);
  assert.equal(p.state().game.selected.length, 0);
  const secondId = p.ticket().required[0]; click(ingredient(secondId));
  click($('table-rail').children[0]);
  assert.deepEqual(p.state().game.selected, ['chicken']);
  assert.deepEqual(p.state().service.tables[1].selected, [secondId]);
  completeDish();
  assert.equal(p.state().service.rewards.includes('Chaos Star'), true);
  assert.equal($('plate').dataset.prize, '1');
  click($('next')); completeDish(); click($('next'));
  assert.equal(p.state().game.index, 3);
  assert.equal(p.state().game.frenzy, true);
  assert.match($('rush-event').textContent, /FEEDING FRENZY/);
  completeDish(); assert.match(p.state().game.result.reason, /FEEDING FRENZY/);
  click($('next'));

  // Pausing preserves every table's clock/cooking state, not merely the active one.
  p.reset({ difficulty: 'medium', chefMode: true, practice: false, seed: 1 });
  click($('pause'));
  const frozen = p.state(); p.tick(999999);
  assert.deepEqual(p.state(), frozen);
  assert.equal(d.querySelector('.showtime-track').disabled, true);
  click($('resume')); assert.equal(d.querySelector('.showtime-track').disabled, false);
  const before = p.state(); p.tick(100);
  assert.equal(p.state().service.remainingMs, before.service.remainingMs - 100);
  p.state().service.tables.forEach((table, i) => assert.equal(table.orderRemainingMs, before.service.tables[i].orderRemainingMs - 100));

  // Two simultaneous failures are presented once each, with no live clocks between.
  p.reset({ difficulty: 'medium', chefMode: true, practice: false, seed: 1 });
  p.tick(999999);
  assert.equal(p.state().service.pending.length, 1);
  assert.equal(p.state().service.missed, 1);
  click($('next'));
  assert.equal(p.state().game.status, 'feedback');
  assert.equal(p.state().service.missed, 2);
  assert.equal(p.state().service.pending.length, 0);
  click($('next')); assert.equal(p.state().game.status, 'playing');

  // Practice closes exhausted passes; the last outstanding table still completes.
  p.reset({ difficulty: 'medium', chefMode: true, practice: true, seed: 1 });
  while (p.state().service.completed < 9) { completeDish(); click($('next')); }
  const closed = [...$('table-rail').children].find(el => /CLOSED/.test(el.textContent));
  assert.ok(closed?.disabled);
  completeDish(); click($('next'));
  assert.equal(p.state().service.completed, 10);
  assert.equal(p.state().game.status, 'ended');

  click($('home'));
  click($('learn'));
  assert.equal(p.state().game.tutorial, true);
  assert.equal(p.state().service, null);
  assert.match($('station-time').textContent, /SAFE TUTORIAL/);
  completeDish({ tutorial: true }); click($('next'));
  assert.equal(p.state().game.status, 'ended');
  assert.equal(p.state().game.served, 1);
  console.log('PASS: expanded DOM flow: 8-choice tray, preserved two-table selections, full chef dish, rewards, fourth-ticket frenzy, all-clock pause, queued failures, closed passes, safe one-plate tutorial, music pause control. No visual/audio/hardware validation.');
} finally { dom.window.close(); }
