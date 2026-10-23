import test from 'node:test';
import assert from 'node:assert/strict';
import { createService, dispatchService, activeTable } from '../src/service.mjs';
import { ticketFor, HEAT } from '../src/engine.mjs';
import { shiftLesson } from '../src/showtime.mjs';

// Public engine actions only: no injected plates, results, clocks or scores.
// Mechanical coverage, not evidence of browser usability or player enjoyment.
for (const difficulty of ['easy', 'medium', 'hard']) {
  test(`complete Chef practice shifts across seeds and tables: ${difficulty}`, () => {
    for (const seed of [1, 7, 42, 2026]) {
      const options = { difficulty, seed, practice: true, chefMode: true };
      let s = createService(options), total = 0;
      const orders = new Set();
      const act = (type, more = {}) => { s = dispatchService(s, { type, ...more }); };
      for (let n = 0; n < 10; n++) {
        const available = s.tables.flatMap((t, i) => t.status === 'playing' ? [i] : []);
        act('SWITCH_TABLE', { index: available[n % available.length] });
        const table = activeTable(s);
        assert.equal(orders.has(table.index), false, 'never serve an issued order twice');
        orders.add(table.index);
        const ticket = ticketFor(table);
        const ids = [...new Set([...ticket.required, ...ticket.optional])];
        for (const id of ids) {
          act('TOGGLE', { id });
          act('PREP', { id });
          act('PREP', { id });
        }
        act('HANDOFF');
        assert.equal(activeTable(s).station, 'cook');
        for (const id of ids.filter(id => HEAT[id])) {
          act('COOK', { id });
          act('TICK', { ms: HEAT[id] });
          assert.equal(activeTable(s).cooking[id].state, 'ready');
          act('STOP_COOK');
        }
        act('HANDOFF');
        for (const id of ids) act('PLATE', { id });
        act('SERVE');
        assert.equal(s.status, 'feedback');
        assert.equal(activeTable(s).result.correct, true);
        total += activeTable(s).result.points;
        assert.equal(s.score, total);
        const scored = s;
        act('SERVE');
        assert.equal(s, scored, 'double serve is inert');
        act('PAUSE');
        const paused = s;
        act('TICK', { ms: 999999 });
        assert.equal(s, paused);
        act('RESUME');
        act('NEXT');
      }
      assert.equal(s.status, 'ended');
      assert.equal(s.completed, 10);
      assert.equal(s.served, 10);
      assert.equal(s.missed, 0);
      assert.equal(s.issued, 10);
      assert.equal(orders.size, 10);
      assert.deepEqual(s.rewards, ['Chaos Star', 'Golden Plate', 'Chef Crown']);
      assert.equal(typeof shiftLesson(s).tip, 'string');
      const replay = createService(options);
      assert.equal(replay.score, 0);
      assert.equal(replay.completed, 0);
      assert.deepEqual(replay.rewards, []);
      assert.ok(replay.tables.every(t => t.selected.length === 0 && t.activePan === null));
    }
  });
}
