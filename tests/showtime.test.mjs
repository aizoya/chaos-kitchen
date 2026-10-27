import test from 'node:test';
import assert from 'node:assert/strict';
import { mountShowtime, SHOWTIME_TRACKS } from '../src/showtime.mjs';

// Tiny purpose-built DOM/audio doubles: actual browser layout is tested separately.
function fixture(withAudio = true) {
  const elements = new Map();
  class Element {
    constructor() { this.hidden = false; this.children = []; this.nodes = new Map(); }
    set innerHTML(value) {
      for (const match of value.matchAll(/class="([^"]+)"/g)) this.nodes.set(`.${match[1]}`, new Element());
    }
    querySelector(selector) { return selector === 'button' ? this.nodes.get('.showtime-track') : selector === 'span' ? this.nodes.get('.showtime-music-note') : this.nodes.get(selector); }
    append(value) { this.children.push(value); }
    before(value) { elements.set('music', value); }
    after(value) { elements.set('music', value); }
    setAttribute() {}
    focus() { this.focused = true; }
    remove() {}
  }
  const welcome = new Element(), copy = new Element();
  welcome.nodes.set('.welcome-copy', copy);
  elements.set('welcome', welcome); elements.set('start', new Element());
  const listeners = new Map(), timers = new Map();
  let contexts = 0, suspends = 0, timerId = 0;
  class Audio {
    constructor() { contexts++; this.state = 'suspended'; }
    resume() { this.state = 'running'; return Promise.resolve(); }
    suspend() { suspends++; this.state = 'suspended'; return Promise.resolve(); }
    close() { return Promise.resolve(); }
  }
  const doc = {
    hidden: false, head: new Element(),
    getElementById: id => elements.get(id),
    querySelector: () => new Element(),
    createElement: () => new Element(),
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name),
  };
  const win = {
    AudioContext: withAudio ? Audio : undefined,
    setInterval: fn => { timers.set(++timerId, fn); return timerId; },
    clearInterval: id => timers.delete(id),
  };
  return { doc, win, copy, elements, listeners, timers, get contexts() { return contexts; }, get suspends() { return suspends; } };
}

test('welcome uses the video instead of a duplicate text story', () => {
  const f = fixture(), instance = mountShowtime({ document: f.doc, window: f.win });
  try { assert.equal(f.copy.children.length, 0); assert.equal(f.contexts, 0); }
  finally { instance.destroy(); }
});

test('master sound starts the default music; hidden and pause stop scheduling', async () => {
  const f = fixture(), instance = mountShowtime({ document: f.doc, window: f.win });
  try {
    const button = f.elements.get('music').querySelector('button');
    assert.equal(SHOWTIME_TRACKS.length, 4);
    assert.equal(button.textContent, 'Music: Pass percussion'); assert.equal(f.contexts, 0);
    instance.setSound(true); await Promise.resolve();
    assert.equal(f.contexts, 1); assert.equal(f.timers.size, 1);
    f.doc.hidden = true; f.listeners.get('visibilitychange')();
    assert.equal(f.timers.size, 0); assert.equal(f.suspends, 1);
    instance.setPaused(true); f.doc.hidden = false; f.listeners.get('visibilitychange')();
    await Promise.resolve(); assert.equal(f.timers.size, 0);
    instance.setPaused(false); await Promise.resolve(); assert.equal(f.timers.size, 1);
    instance.setSound(false); assert.equal(f.timers.size, 0);
  } finally { instance.destroy(); }
});

test('audio unavailable remains a labelled non-fatal state', () => {
  const f = fixture(false), instance = mountShowtime({ document: f.doc, window: f.win });
  try {
    const button = f.elements.get('music').querySelector('button');
    instance.setSound(true);
    assert.equal(button.textContent, 'Music unavailable');
    assert.equal(f.timers.size, 0);
  } finally { instance.destroy(); }
});

test('explicit sound retry recovers from a rejected audio resume', async () => {
  const f=fixture(); let reject=true;
  const Audio=f.win.AudioContext;
  f.win.AudioContext=class extends Audio {
    resume() { if (reject) return Promise.reject(new Error('interrupted')); return super.resume(); }
  };
  const instance=mountShowtime({document:f.doc,window:f.win});
  try {
    instance.setSound(true); await Promise.resolve(); await Promise.resolve();
    assert.equal(f.elements.get('music').querySelector('button').textContent,'Music unavailable');
    assert.equal(f.timers.size,0);
    reject=false; instance.setSound(true); await Promise.resolve();
    assert.equal(f.timers.size,1);
    assert.equal(f.elements.get('music').querySelector('button').textContent,'Music: Pass percussion');
  } finally { instance.destroy(); }
});
