import test from 'node:test';
import assert from 'node:assert/strict';
import { createService, dispatchService as act, activeTable, serviceView, SERVICE_MS } from '../src/service.mjs';
import { ticketFor } from '../src/engine.mjs';

function serve(s, bonus = true) {
  const ticket = ticketFor(activeTable(s));
  for (const id of [...ticket.required, ...(bonus ? ticket.optional : [])]) s = act(s, { type: 'TOGGLE', id });
  return act(s, { type: 'SERVE' });
}
test('difficulty gives distinct shift lengths and one, two, three independent tables', () => {
  for (const [i, difficulty] of ['easy', 'medium', 'hard'].entries()) {
    const s = createService({ difficulty });
    assert.equal(s.tables.length, i + 1);
    assert.equal(s.remainingMs, SERVICE_MS[difficulty]);
    assert.equal(new Set(s.tables.map(t => t.index)).size, i + 1);
    assert.equal(serviceView(s).tableIndex, 0);
  }
});
test('switching preserves each plate and rejects invalid slots', () => {
  let s = act(createService({ difficulty: 'medium' }), { type: 'TOGGLE', id: 'rice' });
  s = act(s, { type: 'SWITCH_TABLE', index: 1 });
  assert.deepEqual(activeTable(s).selected, []);
  s = act(s, { type: 'TOGGLE', id: 'beans' });
  s = act(s, { type: 'SWITCH_TABLE', index: 0 });
  assert.deepEqual(activeTable(s).selected, ['rice']);
  assert.equal(act(s, { type: 'SWITCH_TABLE', index: 8 }), s);
});
test('all table clocks stop exactly at earliest timeout; simultaneous expiries queue once', () => {
  let s = createService({ difficulty: 'hard' });
  s = act(s, { type: 'TICK', ms: 99999 });
  assert.equal(s.remainingMs, 134000);
  assert.equal(s.completed, 1);
  assert.deepEqual(s.pending, [1, 2]);
  assert.ok(s.tables.every(t => t.stationRemainingMs === 0));
  assert.equal(act(s, { type: 'TICK', ms: 1000 }), s);
  s = act(s, { type: 'NEXT' });
  assert.equal(s.active, 1);
  assert.equal(s.completed, 2);
  s = act(s, { type: 'NEXT' });
  assert.equal(s.active, 2);
  assert.equal(s.completed, 3);
  s = act(s, { type: 'NEXT' });
  assert.equal(s.status, 'playing');
  assert.equal(s.missed, 3);
  assert.equal(act(s, { type: 'NEXT' }).issued, s.issued);
});
test('offscreen pan cooks and burns while another table is active', () => {
  let s = createService({ difficulty: 'medium', practice: true });
  s.tables[0] = { ...s.tables[0], station: 'cook', activePan: 'rice', cooking: { rice: { ms: 0, state: 'warming' } } };
  s = act(s, { type: 'SWITCH_TABLE', index: 1 });
  s = act(s, { type: 'TICK', ms: 2000 });
  assert.equal(s.tables[0].cooking.rice.state, 'ready');
  const paused = act(s, { type: 'PAUSE' });
  assert.equal(act(paused, { type: 'TICK', ms: 10000 }), paused);
  s = act(act(paused, { type: 'RESUME' }), { type: 'TICK', ms: 1600 });
  assert.equal(s.tables[0].cooking.rice.state, 'burnt');
});
test('serve scores once; feedback and paused feedback freeze all controls and clocks', () => {
  let s = serve(createService({ chefMode: false }));
  const score = s.score;
  for (const type of ['SERVE', 'TOGGLE', 'TICK', 'SWITCH_TABLE']) assert.equal(act(s, { type, id: 'rice', ms: 1000, index: 0 }), s);
  s = act(s, { type: 'PAUSE' });
  assert.equal(act(s, { type: 'NEXT' }), s);
  s = act(s, { type: 'RESUME' });
  assert.equal(s.status, 'feedback');
  assert.equal(s.score, score);
});
test('practice ends after ten total tickets regardless of table capacity', () => {
  for (const difficulty of ['easy', 'medium', 'hard']) {
    let s = createService({ difficulty, practice: true, chefMode: false });
    for (let i = 0; i < 10; i++) { s = serve(s); s = act(s, { type: 'NEXT' }); }
    assert.equal(s.status, 'ended');
    assert.equal(s.completed, 10);
    assert.equal(s.issued, 10);
    assert.equal(s.rewards.length, 3);
  }
});
test('every fourth issued order is frenzy, doubles correct points, never failure points', () => {
  let s = createService({ practice: true, chefMode: false });
  for (let i = 0; i < 3; i++) s = act(serve(s), { type: 'NEXT' });
  assert.equal(serviceView(s).frenzy, true);
  const before = s.score;
  s = serve(s);
  assert.equal(s.score - before, activeTable(s).result.points);
  assert.match(activeTable(s).result.reason, /FRENZY/);
  assert.equal(activeTable(s).result.points, 1600);
});
test('global expiry wins ties and disallows late serving', () => {
  let s = createService({ chefMode: false });
  s.remainingMs = 1;
  s = act(s, { type: 'TICK', ms: 999999 });
  assert.equal(s.status, 'ended');
  assert.equal(act(s, { type: 'SERVE' }), s);
  s = createService({ chefMode: false });
  s.tables[0].orderRemainingMs = 0;
  s = act(s, { type: 'TOGGLE', id: 'rice' });
  assert.equal(s.status, 'feedback');
  assert.equal(s.score, 0);
});
test('an offscreen earlier expiry selects that table without overspending any clock', () => {
  let s = createService({ difficulty: 'medium' });
  s.tables[1] = { ...s.tables[1], stationRemainingMs: 500 };
  s = act(s, { type: 'TICK', ms: 5000 });
  assert.equal(s.active, 1);
  assert.equal(s.remainingMs, 179500);
  assert.equal(s.tables[0].stationRemainingMs, 19500);
  assert.equal(s.completed, 1);
  s = act(s, { type: 'NEXT' });
  assert.equal(s.tables[1].remainingMs, 179500);
  assert.equal(s.tables[1].index, 2);
  assert.equal(s.tables[0].stationRemainingMs, 19500);
});
test('panic is shared, invalid ticks do nothing, frenzy failure never awards points', () => {
  let s = createService({ difficulty: 'medium', chefMode: false });
  for (const ms of [-1, NaN, Infinity]) assert.equal(act(s, { type: 'TICK', ms }), s);
  s = act(s, { type: 'PANIC' });
  s = act(s, { type: 'SWITCH_TABLE', index: 1 });
  const before = activeTable(s).orderRemainingMs;
  s = act(s, { type: 'PANIC' });
  assert.equal(activeTable(s).orderRemainingMs, before);
  s = createService({ practice: true, chefMode: false });
  for (let i = 0; i < 3; i++) s = act(serve(s), { type: 'NEXT' });
  const score = s.score;
  s = act(s, { type: 'TOGGLE', id: ticketFor(activeTable(s)).forbidden[0] || 'cream' });
  s = act(s, { type: 'SERVE' });
  assert.equal(s.score, score);
  assert.equal(activeTable(s).result.points, 0);
});
