import { INGREDIENTS, TICKETS, STAGES, nameOf, COOKING } from './content.mjs';
export const SHIFT_MS = 90000;
export const stageFor = (index) => Math.min(4, Math.floor(index / 2));
export const multiplier = (streak) => Math.min(5, 1 + Math.floor(streak / 2));
// Fictional game milliseconds, never real cooking temperatures or instructions.
export const HEAT = Object.fromEntries(Object.entries(COOKING).map(([id, rule]) => [id, rule.ms]));
export const cookingActive = s => s.chefMode;
export const DIFFICULTY = { easy: [24000, 32000, 16000], medium: [20000, 28000, 14000], hard: [16000, 24000, 12000] };
export const stationDuration = s => DIFFICULTY[s.difficulty][['prep', 'cook', 'plate'].indexOf(s.station)];
export const ticketDuration = s => cookingActive(s)
  ? DIFFICULTY[s.difficulty].reduce((a, b) => a + b, 0)
  : STAGES[stageFor(s.index)].seconds * 1000;
export function pantryFor(s) {
  const ids = INGREDIENTS.map(i => i.id);
  if (!s.chefMode || (s.difficulty === 'easy' && s.index < 2)) return ids;
  let seed = (s.seed + s.index * 7919) >>> 0;
  for (let i = ids.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}
export function makeDeck(seed = 1) {
  let n = seed >>> 0;
  const rest = TICKETS.slice(1).map((t) => t.id);
  for (let i = rest.length - 1; i > 0; i--) {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    const j = n % (i + 1);
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [TICKETS[0].id, ...rest];
}
export const ticketFor = (s) =>
  TICKETS.find((t) => t.id === s.deck[s.index % s.deck.length]);
export function createGame({ practice = false, seed = 1, chefMode = false, difficulty = 'easy', tutorial = false, inspection = false } = {}) {
  inspection = inspection === true && !tutorial;
  if (inspection) { chefMode = true; difficulty = 'easy'; practice = false; }
  if (!Object.hasOwn(DIFFICULTY, difficulty)) difficulty = 'easy';
  return {
    status: 'playing',
    inspection,
    practice: practice || tutorial,
    tutorial,
    chefMode: chefMode || tutorial,
    difficulty,
    station: 'prep',
    stationRemainingMs: DIFFICULTY[difficulty][0],
    prepped: {},
    plated: [],
    seed,
    cooking: {},
    activePan: null,
    deck: inspection ? ['date', 'critic', 'chef'] : makeDeck(seed),
    index: 0,
    selected: [],
    remainingMs: inspection ? 216000 : SHIFT_MS,
    orderRemainingMs: chefMode ? DIFFICULTY[difficulty].reduce((a, b) => a + b, 0) : 18000,
    score: 0,
    streak: 0,
    bestStreak: 0,
    served: 0,
    perfect: 0,
    missed: 0,
    panicUsed: false,
    result: null,
  };
}
export function judgePlate(
  ticket,
  selected,
  remainingMs,
  streak,
  practice = false,
) {
  const items = [...new Set(selected)];
  const banned = items.filter((id) => ticket.forbidden.includes(id));
  const missing = ticket.required.filter((id) => !items.includes(id));
  const extra = items.filter(
    (id) =>
      ![...ticket.required, ...ticket.optional, ...ticket.forbidden].includes(
        id,
      ),
  );
  const correct =
    items.length > 0 &&
    items.length <= 4 &&
    !banned.length &&
    !missing.length &&
    !extra.length;
  const bonus =
    correct &&
    ticket.optional.length > 0 &&
    ticket.optional.every((id) => items.includes(id));
  const speed = practice
    ? 0
    : Math.min(100, Math.max(0, Math.floor(remainingMs / 1000) * 5));
  const factor = multiplier(streak);
  const points = correct ? (300 + (bonus ? 100 : 0) + speed) * factor : 0;
  const reason = correct
    ? `${bonus ? 'Flavor bonus! ' : ''}Every request respected. ${300 + (bonus ? 100 : 0) + speed} × ${factor}.`
    : [
        banned.length
          ? `Not requested: ${banned.map(nameOf).join(', ')} (excluded).`
          : '',
        missing.length ? `Missing: ${missing.map(nameOf).join(', ')}.` : '',
        extra.length ? `Extra: ${extra.map(nameOf).join(', ')}.` : '',
        items.length > 4 ? 'Four ingredients maximum.' : '',
      ]
        .filter(Boolean)
        .join(' ') || 'The plate is empty.';
  return {
    correct,
    bonus,
    points,
    factor,
    reason,
    reaction: correct ? (bonus ? ticket.good : ticket.plain) : ticket.fail,
    title: correct ? (bonus ? 'CHEF’S KISS!' : 'ORDER UP!') : 'SEND IT BACK',
    kind: correct ? 'good' : 'bad',
  };
}
function finishOrder(s, result) {
  const streak = result.correct ? s.streak + 1 : 0;
  return {
    ...s,
    status: 'feedback',
    result,
    score: s.score + result.points,
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
    served: s.served + (result.correct ? 1 : 0),
    perfect: s.perfect + (result.bonus ? 1 : 0),
    missed: s.missed + (result.correct ? 0 : 1),
  };
}
export function dispatch(s, a) {
  if (a.type === 'PAUSE' && ['playing', 'feedback'].includes(s.status))
    return { ...s, status: 'paused', resumeStatus: s.status };
  if (a.type === 'RESUME' && s.status === 'paused')
    return { ...s, status: s.resumeStatus, resumeStatus: null };
  if (a.type === 'NEXT' && s.status === 'feedback') {
    const index = s.index + 1;
    if (s.remainingMs <= 0 || (s.inspection && index >= 3) || (s.practice && index >= (s.tutorial ? 1 : 10)))
      return { ...s, status: 'ended' };
    return {
      ...s,
      status: 'playing',
      index,
      selected: [],
      cooking: {},
      activePan: null,
      station: 'prep', prepped: {}, plated: [], stationRemainingMs: DIFFICULTY[s.difficulty][0],
      result: null,
      orderRemainingMs: ticketDuration({ ...s, index }),
    };
  }
  if (s.status !== 'playing') return s;
  if (a.type === 'TICK') {
    if (!Number.isFinite(a.ms) || a.ms < 0) return s;
    if (s.practice && !s.activePan) return s;
    // Stop consuming time at the first deadline; time after feedback starts is paused.
    const elapsed = s.practice ? a.ms : Math.min(a.ms, s.remainingMs, s.orderRemainingMs, s.chefMode ? s.stationRemainingMs : Infinity);
    const remainingMs = s.practice ? s.remainingMs : Math.max(0, s.remainingMs - elapsed),
      orderRemainingMs = s.practice ? s.orderRemainingMs : Math.max(0, s.orderRemainingMs - elapsed);
    const next = { ...s, remainingMs, orderRemainingMs };
    if (s.chefMode && !s.practice) next.stationRemainingMs = Math.max(0, s.stationRemainingMs - elapsed);
    if (s.activePan) {
      const ms = Math.min(HEAT[s.activePan] + (s.tutorial ? 0 : 1600), s.cooking[s.activePan].ms + elapsed);
      const state = ms >= HEAT[s.activePan] + 1600 ? 'burnt' : ms >= HEAT[s.activePan] ? 'ready' : 'warming';
      next.cooking = { ...s.cooking, [s.activePan]: { ms, state } };
      if (state === 'burnt') next.activePan = null;
    }
    if (s.practice) return next;
    if (remainingMs === 0) return { ...next, status: 'ended', selected: [] };
    if (orderRemainingMs === 0 || (s.chefMode && next.stationRemainingMs === 0))
      return finishOrder(next, {
        correct: false,
        bonus: false,
        points: 0,
        title: s.chefMode && next.stationRemainingMs === 0 ? 'STATION TIMED OUT' : 'TICKET TIMED OUT',
        kind: 'bad',
        reason: 'No plate left the pass. Next ticket, fresh start.',
        reaction: 'The customer has started eating the bread basket.',
      });
    return next;
  }
  if (a.type === 'PREP' && s.chefMode && s.station === 'prep' && s.selected.includes(a.id))
    return { ...s, prepped: { ...s.prepped, [a.id]: Math.min(2, (s.prepped[a.id] || 0) + 1) } };
  if (a.type === 'HANDOFF' && s.chefMode) {
    if (s.station === 'prep' && s.selected.length && (!s.tutorial || judgePlate(ticketFor(s), s.selected, 0, 0, true).correct) && s.selected.every(id => s.prepped[id] === 2))
      return { ...s, station: 'cook', stationRemainingMs: DIFFICULTY[s.difficulty][1] };
    if (s.station === 'cook' && s.selected.every(id => !HEAT[id] || s.cooking[id]?.state === 'done'))
      return { ...s, station: 'plate', stationRemainingMs: DIFFICULTY[s.difficulty][2] };
    return s;
  }
  if (a.type === 'PLATE' && s.chefMode && s.station === 'plate' && s.selected.includes(a.id) && !s.plated.includes(a.id))
    return { ...s, plated: [...s.plated, a.id] };
  if (a.type === 'COOK' && cookingActive(s) && s.station === 'cook' && !s.activePan && s.selected.includes(a.id) && HEAT[a.id]) {
    if (s.cooking[a.id]?.state === 'done') return s;
    return { ...s, activePan: a.id, cooking: { ...s.cooking, [a.id]: { ms: 0, state: 'warming' } } };
  }
  if (a.type === 'STOP_COOK' && s.activePan) {
    const id = s.activePan, pan = s.cooking[id];
    return { ...s, activePan: null, cooking: { ...s.cooking, [id]: { ...pan, state: pan.state === 'ready' ? 'done' : 'early' } } };
  }
  if (a.type === 'TOGGLE') {
    if (s.chefMode && s.station !== 'prep') return s;
    if (!INGREDIENTS.some((i) => i.id === a.id)) return s;
    if (s.selected.includes(a.id)) {
      const cooking = { ...s.cooking }; delete cooking[a.id];
      const prepped = { ...s.prepped }; delete prepped[a.id];
      return { ...s, prepped, cooking, activePan: s.activePan === a.id ? null : s.activePan, selected: s.selected.filter((id) => id !== a.id) };
    }
    if (s.selected.length === 4) return s;
    return { ...s, selected: [...s.selected, a.id] };
  }
  if (a.type === 'CLEAR') return { ...s, selected: [], prepped: {}, plated: [], cooking: {}, activePan: null,
    station: 'prep', stationRemainingMs: Math.min(s.stationRemainingMs, DIFFICULTY[s.difficulty][0]) };
  if (a.type === 'PANIC' && !s.panicUsed && !s.practice)
    return {
      ...s,
      panicUsed: true,
      stationRemainingMs: s.chefMode ? Math.min(stationDuration(s) + 5000, s.stationRemainingMs + 5000) : s.stationRemainingMs,
      orderRemainingMs: Math.min(
        ticketDuration(s) + 5000,
        s.orderRemainingMs + 5000,
      ),
    };
  if (a.type === 'SERVE' && s.selected.length) {
    if (s.chefMode && (s.station !== 'plate' || s.plated.length !== s.selected.length)) return s;
    const unfinished = cookingActive(s) ? s.selected.filter(id => HEAT[id] && s.cooking[id]?.state !== 'done') : [];
    if (unfinished.length) return finishOrder(s, {
      correct: false, bonus: false, points: 0, kind: 'bad', title: 'THE PAN HAS NOTES',
      reaction: unfinished.some(id => s.cooking[id]?.state === 'burnt') ? 'The smoke alarm would like a word.' : 'The customer ordered dinner, not a loading screen.',
      reason: `Not finished in the game: ${unfinished.map(nameOf).join(', ')}. Stop each pan in READY before serving.`,
    });
    return finishOrder(
      s,
      judgePlate(
        ticketFor(s),
        s.selected,
        s.orderRemainingMs,
        s.streak,
        s.practice,
      ),
    );
  }
  return s;
}
