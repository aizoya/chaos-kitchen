// Goals are fixed before play and use recorded counters only.
export function nextShiftGoal(previous) {
  if (!previous || previous.tutorial) return { metric:'served', target:3, label:'Serve 3 plates' };
  if (previous.missed || !previous.served) return { metric:'served', target:Math.min(3, Math.max(1, previous.served)), label:'Serve ' + Math.min(3, Math.max(1, previous.served)) + ' correct plates' };
  const target = Math.min(5, previous.perfect + 1);
  return { metric:'perfect', target, label:'Earn ' + target + ' flavor bonus' + (target === 1 ? '' : 'es') };
}
export function inspectionResult(s) {
  const earned = s.inspection && s.status === 'ended' && s.served === 3 && s.perfect >= 2 && s.missed === 0;
  return { earned:Boolean(earned), title:earned ? 'CHAOS STAR EARNED!' : 'THE INSPECTOR WILL RETURN.', tip:earned ? 'Three correct plates. At least two flavor bonuses. Chef Franklyn approves.' : 'For a Chaos Star: serve all 3 plates correctly, earn 2 flavor bonuses, and avoid missed orders. Retry when ready.' };
}

// Receipt coaching uses only recorded outcomes; it never invents a cause of failure.
export function shiftLesson({ served = 0, perfect = 0, missed = 0, tutorial = false } = {}) {
  if (tutorial) return { title: 'FIRST PLATE. FIRST LESSON.', evidence: 'You tried the safe tutorial.', tip: 'Next: try a full shift on Easy. Read the ticket before touching the pantry.' };
  if (missed > 0) return { title: 'THE COMEBACK STARTS HERE.', evidence: `${missed} order${missed === 1 ? '' : 's'} sent back or timed out.`, tip: 'Next shift: focus on the required ingredients and exclusions first. Add the bonus once the order is under control.' };
  if (served === 0) return { title: 'YOUR FIRST PLATE IS WAITING.', evidence: 'No completed plates this shift.', tip: 'Try “Show me the ropes” from the menu. Practice one plate without a deadline, then come back for the rush.' };
  if (perfect < served) return { title: 'GOOD SERVICE. NEXT: EXTRA FLAVOR.', evidence: `${served} happy table${served === 1 ? '' : 's'} · ${perfect} flavor bonus${perfect === 1 ? '' : 'es'}.`, tip: 'Next shift: spot the BONUS on each ticket and include it with the required ingredients.' };
  return { title: 'MAKE THEM ASK FOR SECONDS.', evidence: `${served} happy table${served === 1 ? '' : 's'} · a flavor bonus on every completed plate.`, tip: 'Replay and build a longer streak, or choose a tougher difficulty from the menu.' };
}

// Original, local-only instrumental music. No recordings or network assets.
export const SHOWTIME_TRACKS = Object.freeze(['OFF', 'Pass percussion', 'Midnight simmer', 'Rush groove']);
let showtimeInstance = null;

export function setShowtimeSound(enabled) { showtimeInstance?.setSound(Boolean(enabled)); }
export function setShowtimePaused(paused) { showtimeInstance?.setPaused(Boolean(paused)); }

export function mountShowtime({ document: doc = globalThis.document, window: win = globalThis.window } = {}) {
  if (showtimeInstance || !doc?.getElementById('welcome')) return showtimeInstance;
  const welcome = doc.getElementById('welcome');
  const music = doc.createElement('div');
  music.className = 'showtime-music';
  music.innerHTML = `<button type="button" class="showtime-track">Music: Pass percussion</button><span class="showtime-music-note" aria-live="polite">3 styles · tap Music to change</span>`;
  // Its own row avoids squeezing the existing 320px masthead or mobile action dock.
  const header = doc.querySelector('.masthead');
  const videoPanel = doc.getElementById('chef-video-panel');
  if (videoPanel) videoPanel.before(music); else if (header) header.after(music); else welcome.before(music);
  const style = doc.createElement('style');
  style.textContent = '.showtime-track{min-height:44px;padding:10px 12px;border:2px solid #27291e;background:#27291e;color:#fff9e9;cursor:pointer;font:700 15px Arial,sans-serif;white-space:normal;max-width:100%}.showtime-track:focus-visible{outline:3px solid #f15425;outline-offset:3px}.showtime-music{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:6px 0;max-width:100%;box-sizing:border-box}.showtime-music-note{font-size:14px;overflow-wrap:anywhere}';
  doc.head.append(style);
  let track = 1, soundEnabled = false, paused = false, unavailable = false;
  let context = null, timer = null, step = 0;
  const voices = new Set();
  const trackButton = music.querySelector('button');
  const note = music.querySelector('span');
  const label = () => {
    trackButton.textContent = unavailable ? 'Music unavailable' : `Music: ${SHOWTIME_TRACKS[track]}`;
    note.textContent = unavailable ? 'Your browser could not start audio. Gameplay still works.' : track && !soundEnabled ? 'Turn SOUND ON to hear this track.' : '3 styles · tap Music to change';
  };
  const stop = () => {
    if (timer !== null) { win.clearInterval(timer); timer = null; }
    for (const voice of voices) { try { voice.stop(); } catch { /* already ended */ } }
    voices.clear();
    if (context?.state === 'running') context.suspend().catch(() => {});
  };
  const allowed = () => track > 0 && soundEnabled && !paused && !doc.hidden && !unavailable;
  const playBeat = () => {
    if (!allowed() || context?.state !== 'running') return;
    const now = context.currentTime;
    // Eight-bar original arrangement: warm plucked chords, bass, melody and drums.
    const beat = step++, tempo = track === 2 ? .3 : track === 3 ? .22 : .26;
    const progressions = [[48, 53, 55, 48], [57, 53, 48, 55], [50, 55, 57, 50]];
    const root = progressions[track - 1][Math.floor(beat / 16) % 4];
    const hz = midi => 440 * 2 ** ((midi - 69) / 12);
    const note = (midi, duration, volume, type = 'sine', delay = 0) => {
      const oscillator = context.createOscillator(), gain = context.createGain();
      const at = now + delay;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(hz(midi), at);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(volume, at + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
      oscillator.connect(gain); gain.connect(context.destination);
      voices.add(oscillator);
      oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(at); oscillator.stop(at + duration + .03);
    };
    if (beat % (track === 3 ? 2 : 4) === 0) (track === 2 ? [0, 3, 7, 10] : [0, 4, 7, 11]).forEach((offset, i) => {
      note(root + 12 + offset, tempo * 3.5, .025, 'triangle', i * .012);
      note(root + 24 + offset, tempo * 2, .006, 'sine', i * .012);
    });
    if (beat % 2 === 0) note(root - 12 + (beat % 8 === 6 ? 7 : 0), tempo * 1.7, .08);
    const melodies = [[12,16,19,21,19,16,14,16,12,0,19,16,14,12,7,0], [12,0,15,0,19,0,22,19,0,17,15,0,14,12,0,0], [12,19,24,19,16,19,21,19,14,21,26,21,17,21,24,19]];
    const melody = melodies[track - 1];
    const pitch = melody[beat % melody.length];
    if (pitch) note(root + 12 + pitch, tempo * (track === 2 ? 2.2 : .9), .035, track === 3 ? 'triangle' : 'sine');
    if (beat % 4 === 0) {
      const drum = context.createOscillator(), envelope = context.createGain();
      drum.frequency.setValueAtTime(130, now); drum.frequency.exponentialRampToValueAtTime(45, now + .12);
      envelope.gain.setValueAtTime(.12, now); envelope.gain.exponentialRampToValueAtTime(.0001, now + .16);
      drum.connect(envelope); envelope.connect(context.destination); voices.add(drum);
      drum.onended = () => { voices.delete(drum); drum.disconnect(); envelope.disconnect(); };
      drum.start(now); drum.stop(now + .18);
    }

  };
  const sync = () => {
    label();
    if (!allowed()) { stop(); return; }
    if (timer !== null) return;
    try {
      const Audio = win.AudioContext || win.webkitAudioContext;
      if (!Audio) throw new Error('Audio unavailable');
      context ??= new Audio();
      Promise.resolve(context.resume()).then(() => {
        if (!allowed() || timer !== null) return;
        timer = win.setInterval(() => { try { playBeat(); } catch { unavailable = true; stop(); label(); } }, track === 2 ? 300 : track === 3 ? 220 : 260);
      }).catch(() => { unavailable = true; stop(); label(); });
    } catch { unavailable = true; stop(); label(); }
  };
  trackButton.onclick = () => { track = (track + 1) % SHOWTIME_TRACKS.length; step = 0; stop(); sync(); };
  const visibility = () => sync();
  doc.addEventListener('visibilitychange', visibility);
  label();
  showtimeInstance = {
    setSound(value) { soundEnabled = value; sync(); },
    setPaused(value) { if (paused !== value) { paused = value; trackButton.disabled = value; sync(); } },
    destroy() { stop(); context?.close().catch(() => {}); doc.removeEventListener('visibilitychange', visibility); music.remove(); style.remove(); showtimeInstance = null; },
  };
  return showtimeInstance;
}
