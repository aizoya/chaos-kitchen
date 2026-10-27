import test from 'node:test';
import assert from 'node:assert/strict';
import { shiftLesson } from '../src/showtime.mjs';

test('receipt prioritizes recovery without guessing why an order failed', () => {
  const lesson = shiftLesson({ served: 4, perfect: 4, missed: 2 });
  assert.equal(lesson.evidence, '2 orders sent back or timed out.');
  assert.match(lesson.tip, /required ingredients and exclusions/);
  assert.doesNotMatch(JSON.stringify(lesson), /burn|late|wrong ingredient/i);
});
test('zero plates is guidance, never a perfect shift', () => {
  assert.match(shiftLesson({}).tip, /Show me the ropes/);
  assert.match(shiftLesson({ tutorial: true }).tip, /Easy/);
});
test('bonus coaching distinguishes partial and all-bonus service', () => {
  assert.match(shiftLesson({ served: 3, perfect: 1 }).tip, /BONUS/);
  const lesson = shiftLesson({ served: 3, perfect: 3 });
  assert.match(lesson.evidence, /every completed plate/);
  assert.match(lesson.tip, /longer streak/);
});
