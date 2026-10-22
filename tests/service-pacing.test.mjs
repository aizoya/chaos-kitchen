import test from 'node:test';
import assert from 'node:assert/strict';
import { createService, dispatchService as act, activeTable } from '../src/service.mjs';
import { ticketFor, HEAT } from '../src/engine.mjs';

test('queued tickets wait, selection arms once, deselection and switching cannot pause started work', () => {
  let s = createService({ difficulty: 'hard' });
  s = act(s, { type: 'TICK', ms: 5000 });
  assert.equal(s.remainingMs, 145000);
  assert.equal(s.tables[1].stationRemainingMs, 16000);
  s = act(s, { type: 'SWITCH_TABLE', index: 1 });
  s = act(s, { type: 'TOGGLE', id: 'unknown-food' });
  assert.equal(s.tables[1].waiting, true, 'invalid food cannot arm a queued ticket');
  s = act(s, { type: 'TICK', ms: 1000 });
  assert.equal(s.tables[1].stationRemainingMs, 16000, 'navigation alone does not start prep');
  s = act(s, { type: 'TOGGLE', id: 'rice' });
  s = act(s, { type: 'TOGGLE', id: 'rice' });
  s = act(s, { type: 'SWITCH_TABLE', index: 2 });
  s = act(s, { type: 'TICK', ms: 1000 });
  assert.equal(s.tables[1].waiting, false);
  assert.equal(s.tables[1].stationRemainingMs, 15000);
  assert.equal(s.tables[2].stationRemainingMs, 16000);
  s = act(s, { type: 'TICK', ms: 999999 });
  assert.equal(s.status, 'feedback', 'started work still expires offscreen');
});

for (const difficulty of ['medium', 'hard']) {
  test(`paced ${difficulty}: queued tables can serve at one action per second`, () => {
    for (const seed of [1, 7, 42, 2026]) {
      let s = createService({ difficulty, seed });
      const step = (type, more = {}) => {
        s = act(s, { type: 'TICK', ms: 1000 });
        assert.equal(s.status, 'playing', `${difficulty}: expired before ${type}`);
        s = act(s, { type, ...more });
      };
      for (let index = 0; index < s.tables.length; index++) {
        step('SWITCH_TABLE', { index });
        const t = ticketFor(activeTable(s));
        const ids = [...new Set([...t.required, ...t.optional])];
        for (const id of ids) {
          step('TOGGLE', { id }); step('PREP', { id }); step('PREP', { id });
        }
        step('HANDOFF');
        for (const id of ids.filter(id => HEAT[id])) {
          step('COOK', { id });
          s = act(s, { type: 'TICK', ms: HEAT[id] });
          step('STOP_COOK');
          assert.equal(activeTable(s).cooking[id].state, 'done');
        }
        step('HANDOFF');
        for (const id of ids) step('PLATE', { id });
        step('SERVE');
        assert.equal(activeTable(s).result.correct, true);
        assert.equal(s.missed, 0);
        s = act(s, { type: 'NEXT' });
        assert.equal(activeTable(s).waiting, true, 'replacement starts queued');
        const before = activeTable(s).stationRemainingMs;
        s = act(s, { type: 'TICK', ms: 1000 });
        assert.equal(activeTable(s).stationRemainingMs, before);
      }
      assert.equal(s.served, s.tables.length);
      assert.ok(s.tables.every(t => t.waiting));
      s = act(s, { type: 'TICK', ms: 999999 });
      assert.equal(s.status, 'ended', 'all waiting tables do not freeze shift expiry');
      assert.equal(act(s, { type: 'TOGGLE', id: 'rice' }), s);
    }
  });
}

test('started pan burns in real elapsed engine time while another ticket waits', () => {
  let s = createService({ difficulty: 'medium' });
  for (const type of ['TOGGLE', 'PREP', 'PREP']) s = act(s, { type, id: 'rice' });
  s = act(s, { type: 'HANDOFF' });
  s = act(s, { type: 'COOK', id: 'rice' });
  s = act(s, { type: 'SWITCH_TABLE', index: 1 });
  s = act(s, { type: 'TICK', ms: HEAT.rice });
  assert.equal(s.tables[0].cooking.rice.state, 'ready');
  s = act(s, { type: 'TICK', ms: 1600 });
  assert.equal(s.tables[0].cooking.rice.state, 'burnt');
  assert.equal(s.tables[1].waiting, true);
  assert.equal(s.tables[1].stationRemainingMs, 20000);
  assert.equal(s.remainingMs, 176400);
});
