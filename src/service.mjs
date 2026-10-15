import { createGame, dispatch, ticketDuration } from './engine.mjs';

// A shift owns time and score. Tables own their plates and station clocks.
export const SERVICE_MS = { easy: 210000, medium: 180000, hard: 150000 };
const CAPACITY = { easy: 1, medium: 2, hard: 3 };
function newTable(s, index) {
  const t = createGame(s);
  return { ...t, index, orderRemainingMs: ticketDuration({ ...t, index }), remainingMs: s.remainingMs, frenzy: index % 4 === 3 };
}
export function createService({ difficulty = 'easy', seed = 1, practice = false, chefMode = true } = {}) {
  if (!Object.hasOwn(CAPACITY, difficulty)) difficulty = 'easy';
  const s = { difficulty, seed, practice, chefMode, remainingMs: SERVICE_MS[difficulty], status: 'playing', active: 0, score: 0, streak: 0, bestStreak: 0, served: 0, perfect: 0, missed: 0, completed: 0, issued: CAPACITY[difficulty], rewards: [], pending: [], panicUsed: false };
  return { ...s, tables: Array.from({ length: CAPACITY[difficulty] }, (_, i) => newTable(s, i)) };
}
export const activeTable = s => s.tables[s.active];
export const serviceView = s => ({ ...activeTable(s), ...Object.fromEntries(['status', 'remainingMs', 'score', 'streak', 'bestStreak', 'served', 'perfect', 'missed', 'practice', 'panicUsed', 'rewards', 'completed'].map(k => [k, s[k]])), serviceMode: true, tableIndex: s.active, tableCount: s.tables.length });
function feedback(s, index) {
  const table = s.tables[index];
  const original = table.result;
  const points = original.correct && table.frenzy ? original.points * 2 : original.points;
  const result = { ...original, points, reason: original.reason + (original.correct && table.frenzy ? ' FEEDING FRENZY ×2!' : '') };
  const streak = original.correct ? s.streak + 1 : 0;
  const perfect = s.perfect + (original.bonus ? 1 : 0);
  const rewards = ['Chaos Star', 'Golden Plate', 'Chef Crown'].filter((_, i) => perfect >= [1, 3, 5][i]);
  return { ...s, active: index, status: 'feedback', completed: s.completed + 1, score: s.score + points, streak, bestStreak: Math.max(s.bestStreak, streak), served: s.served + Number(original.correct), missed: s.missed + Number(!original.correct), perfect, rewards, tables: s.tables.map((t, i) => i === index ? { ...t, result } : t) };
}
function settled(s) {
  // Zero-time settlement prevents serving a ticket whose deadline is already due.
  return dispatchService(s, { type: 'TICK', ms: 0 });
}
export function dispatchService(s, a) {
  if (a.type === 'PAUSE' && ['playing', 'feedback'].includes(s.status)) return { ...s, status: 'paused', resumeStatus: s.status };
  if (a.type === 'RESUME' && s.status === 'paused') return { ...s, status: s.resumeStatus, resumeStatus: null };
  if (a.type === 'NEXT' && s.status === 'feedback') {
    const tables = [...s.tables];
    let issued = s.issued;
    if (s.practice && issued >= 10) tables[s.active] = { ...tables[s.active], status: 'ended', result: null };
    else tables[s.active] = newTable(s, issued++);
    const next = { ...s, tables, issued, status: 'playing' };
    if (s.pending.length) return feedback({ ...next, pending: s.pending.slice(1) }, s.pending[0]);
    if ((s.practice && s.completed >= 10) || s.remainingMs <= 0) return { ...next, status: 'ended' };
    if (tables[s.active].status === 'ended') next.active = tables.findIndex(t => t.status === 'playing');
    return next;
  }
  if (s.status !== 'playing') return s;
  if (a.type === 'TICK') {
    if (!Number.isFinite(a.ms) || a.ms < 0) return s;
    const playing = s.tables.filter(t => t.status === 'playing');
    const elapsed = s.practice ? a.ms : Math.min(a.ms, s.remainingMs, ...playing.map(t => Math.min(t.orderRemainingMs, t.chefMode ? t.stationRemainingMs : Infinity)));
    const remainingMs = s.practice ? s.remainingMs : Math.max(0, s.remainingMs - elapsed);
    const tables = s.tables.map(t => t.status !== 'playing' ? t : dispatch({ ...t, remainingMs: s.remainingMs, streak: s.streak }, { type: 'TICK', ms: elapsed }));
    const next = { ...s, remainingMs, tables };
    if (!s.practice && remainingMs === 0) return { ...next, status: 'ended' };
    const pending = tables.flatMap((t, i) => t.status === 'feedback' ? [i] : []);
    if (pending.length) return feedback({ ...next, pending: pending.slice(1) }, pending[0]);
    return next;
  }
  const due = !s.practice && (s.remainingMs <= 0 || s.tables.some(t => t.status === 'playing' && (t.orderRemainingMs <= 0 || (t.chefMode && t.stationRemainingMs <= 0))));
  if (due) return settled(s);
  if (a.type === 'SWITCH_TABLE') return Number.isInteger(a.index) && s.tables[a.index]?.status === 'playing' ? { ...s, active: a.index } : s;
  if (a.type === 'PANIC' && s.panicUsed) return s;
  const current = activeTable(s);
  const table = dispatch({ ...current, remainingMs: s.remainingMs, streak: s.streak, panicUsed: s.panicUsed }, a);
  const next = { ...s, panicUsed: table.panicUsed, tables: s.tables.map((t, i) => i === s.active ? table : t) };
  return table.status === 'feedback' ? feedback(next, s.active) : next;
}
