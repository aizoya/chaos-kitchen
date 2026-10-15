import test from 'node:test';
import assert from 'node:assert/strict';
import { INGREDIENTS, TICKETS, validateContent } from '../src/content.mjs';
import {
  createGame,
  dispatch,
  judgePlate,
  ticketFor,
  makeDeck,
  multiplier,
  stageFor,
} from '../src/engine.mjs';
test('authored content has unique, known and solvable requirements', () =>
  assert.equal(validateContent(), true));
test('all tickets have a correct and bonus plate; excluded ingredients never score', () => {
  for (const t of TICKETS) {
    assert.ok(judgePlate(t, t.required, 18000, 0).correct);
    assert.ok(judgePlate(t, [...t.required, ...t.optional], 18000, 0).correct);
    for (const f of t.forbidden)
      assert.equal(judgePlate(t, [...t.required, f], 18000, 9).points, 0);
  }
});
test('all subsets of each recipe plus forbidden and unrelated choices obey scoring', () => {
  for (const t of TICKETS)
    for (let m = 0; m < 256; m++) {
      const pool=[...new Set([...t.required,...t.optional,...t.forbidden,...INGREDIENTS.map(i=>i.id)])].slice(0,8);
      const p = pool.filter((_, i) => m & (1 << i));
      const r = judgePlate(t, p, 9000, 0);
      if (r.correct) {
        assert.ok(t.required.every((id) => p.includes(id)));
        assert.ok(p.every((id) => [...t.required, ...t.optional].includes(id)));
        assert.ok(p.length <= 4);
      } else assert.equal(r.points, 0);
    }
});
test('score formula is exact and practice has no speed bonus', () => {
  assert.equal(
    judgePlate(TICKETS[0], ['rice', 'chicken', 'chili'], 18000, 4).points,
    1470,
  );
  assert.equal(
    judgePlate(TICKETS[0], ['rice', 'chicken'], 18000, 0, true).points,
    300,
  );
});
test('missing and extra ingredients explain mistakes', () => {
  assert.match(
    judgePlate(TICKETS[0], ['rice', 'garlic'], 10000, 0).reason,
    /Missing: Chicken.*Extra: Garlic/,
  );
});
test('deck is seeded, opener stable, rest shuffled without loss', () => {
  assert.deepEqual(makeDeck(7), makeDeck(7));
  assert.notDeepEqual(makeDeck(7), makeDeck(8));
  assert.equal(makeDeck(7)[0], 'date');
  assert.equal(new Set(makeDeck()).size, TICKETS.length);
});
test('selection toggles, caps at four, rejects unknown IDs and empty serving', () => {
  let s = createGame();
  assert.equal(dispatch(s, { type: 'SERVE' }), s);
  assert.equal(dispatch(s, { type: 'TOGGLE', id: '<script>' }), s);
  for (const i of INGREDIENTS) s = dispatch(s, { type: 'TOGGLE', id: i.id });
  assert.equal(s.selected.length, 4);
  s = dispatch(s, { type: 'TOGGLE', id: 'rice' });
  assert.equal(s.selected.length, 3);
  assert.equal(dispatch(s, { type: 'CLEAR' }).selected.length, 0);
});
test('double serve cannot score twice; feedback pauses clock', () => {
  let s = { ...createGame(), selected: ['rice', 'chicken'] };
  s = dispatch(s, { type: 'SERVE' });
  assert.equal(s.status, 'feedback');
  assert.equal(dispatch(s, { type: 'SERVE' }), s);
  assert.equal(dispatch(s, { type: 'TICK', ms: 90000 }), s);
});
test('timeout resets streak and shows reason', () => {
  const s = dispatch(
    { ...createGame(), streak: 4 },
    { type: 'TICK', ms: 18000 },
  );
  assert.equal(s.status, 'feedback');
  assert.equal(s.score, 0);
  assert.equal(s.streak, 0);
  assert.equal(s.missed, 1);
});
test('earlier ticket expiry discards elapsed time after feedback starts', () => {
  for (const ms of [24000, 90000]) {
    const s = dispatch(createGame(), { type: 'TICK', ms });
    assert.equal(s.status, 'feedback');
    assert.equal(s.remainingMs, 72000);
  }
});
test('global expiry ends service when earlier or tied, locking all actions', () => {
  for (const remainingMs of [5000, 18000]) {
    const s = dispatch(
      { ...createGame(), remainingMs },
      { type: 'TICK', ms: 90000 },
    );
    assert.equal(s.status, 'ended');
    for (const type of ['SERVE', 'NEXT', 'TOGGLE', 'PANIC', 'PAUSE'])
      assert.equal(dispatch(s, { type, id: 'rice' }), s);
  }
});
test('pause/resume retains exact clocks and selection', () => {
  let s = { ...createGame(), selected: ['rice'] };
  s = dispatch(s, { type: 'TICK', ms: 1213 });
  const before = s;
  s = dispatch(s, { type: 'PAUSE' });
  assert.equal(dispatch(s, { type: 'TICK', ms: 30000 }), s);
  assert.equal(dispatch(s, { type: 'SERVE' }), s);
  s = dispatch(s, { type: 'RESUME' });
  assert.equal(s.remainingMs, before.remainingMs);
  assert.deepEqual(s.selected, before.selected);
});
test('panic is once only, buys five seconds but not service time', () => {
  let s = dispatch(createGame(), { type: 'TICK', ms: 7000 });
  s = dispatch(s, { type: 'PANIC' });
  assert.equal(s.orderRemainingMs, 16000);
  assert.equal(s.remainingMs, 83000);
  assert.equal(dispatch(s, { type: 'PANIC' }), s);
});
test('practice has no ticking and ends after ten tickets', () => {
  let s = createGame({ practice: true });
  assert.equal(dispatch(s, { type: 'TICK', ms: 999999 }), s);
  for (let i = 0; i < 10; i++) {
    s = { ...s, selected: ticketFor(s).required };
    s = dispatch(s, { type: 'SERVE' });
    s = dispatch(s, { type: 'NEXT' });
  }
  assert.equal(s.status, 'ended');
  assert.equal(s.served, 10);
});
test('stage and combo caps, resets and fresh replay', () => {
  assert.equal(stageFor(100), 4);
  assert.equal(multiplier(100), 5);
  assert.equal(multiplier(0), 1);
  assert.deepEqual(createGame(), createGame());
});
test('nonfinite and negative deltas cannot corrupt clocks', () => {
  const s = createGame();
  for (const ms of [NaN, Infinity, -1])
    assert.equal(dispatch(s, { type: 'TICK', ms }), s);
});
