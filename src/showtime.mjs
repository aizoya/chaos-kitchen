// Receipt coaching uses only recorded outcomes; it never invents a cause of failure.
export function shiftLesson({ served = 0, perfect = 0, missed = 0, tutorial = false } = {}) {
  if (tutorial) return { title: 'FIRST PLATE. FIRST LESSON.', evidence: 'You tried the safe tutorial.', tip: 'Next: try a full shift on Easy. Read the ticket before touching the pantry.' };
  if (missed > 0) return { title: 'THE COMEBACK STARTS HERE.', evidence: `${missed} order${missed === 1 ? '' : 's'} sent back or timed out.`, tip: 'Next shift: focus on the required ingredients and exclusions first. Add the bonus once the order is under control.' };
  if (served === 0) return { title: 'YOUR FIRST PLATE IS WAITING.', evidence: 'No completed plates this shift.', tip: 'Try “Show me the ropes” from the menu. Practice one plate without a deadline, then come back for the rush.' };
  if (perfect < served) return { title: 'GOOD SERVICE. NEXT: EXTRA FLAVOR.', evidence: `${served} happy table${served === 1 ? '' : 's'} · ${perfect} flavor bonus${perfect === 1 ? '' : 'es'}.`, tip: 'Next shift: spot the BONUS on each ticket and include it with the required ingredients.' };
  return { title: 'MAKE THEM ASK FOR SECONDS.', evidence: `${served} happy table${served === 1 ? '' : 's'} · a flavor bonus on every completed plate.`, tip: 'Replay and build a longer streak, or choose a tougher difficulty from the menu.' };
}

// Original, local-only scene and synthesized music. No recordings or network assets.
export const SHOWTIME_SCENES = Object.freeze([
  { title: 'THE PHONE RINGS.', copy: 'Chef… the Chaos Star inspector is here. Hide the panic. Not the seasoning.' },
  { title: 'CHEF FRANKLYN HAS ARRIVED.', copy: '“I’ve run a kitchen. Let’s see how you run yours.” One important guest. Your spectacularly questionable composure.' },
  { title: 'YOUR STAR STARTS HERE.', copy: 'Read it. Cook it. Plate it. A perfect service deserves a Chaos Star. A burnt one deserves an open window.' },
]);
export const SHOWTIME_TRACKS = Object.freeze(['OFF', 'Pass percussion', 'Midnight simmer', 'Rush groove']);
let showtimeInstance = null;

export function setShowtimeSound(enabled) { showtimeInstance?.setSound(Boolean(enabled)); }
export function setShowtimePaused(paused) { showtimeInstance?.setPaused(Boolean(paused)); }

export function mountShowtime({ onTutorial = () => {}, document: doc = globalThis.document, window: win = globalThis.window } = {}) {
  if (showtimeInstance || !doc?.getElementById('welcome')) return showtimeInstance;
  const panel = doc.createElement('details');
  panel.open = !win.matchMedia?.('(max-width: 620px)').matches;
  panel.className = 'showtime-panel';
  panel.setAttribute('aria-label', 'Chaos Star inspector introduction');
  panel.innerHTML = `<summary class="showtime-toggle">Chef Franklyn · animated story</summary><div class="showtime-scene"><p class="showtime-kicker">★ THE CHAOS STAR INSPECTION</p><h2 class="showtime-title"></h2><p class="showtime-copy" aria-live="polite"></p><p class="showtime-step"></p><div class="showtime-actions"><button type="button" class="showtime-next">Next scene →</button><button type="button" class="showtime-skip">Skip intro</button></div></div><div class="showtime-after" hidden><strong>THE INSPECTOR IS WAITING.</strong><div class="showtime-actions"><button type="button" class="showtime-replay">Replay intro</button><button type="button" class="showtime-tutorial">Show me the ropes</button></div></div><p class="showtime-disclaimer">Chaos Star is a fictional game award. This original inspector scene is not affiliated with a restaurant rating organization.</p>`;
  const welcome = doc.getElementById('welcome');
  (welcome.querySelector('.welcome-copy') || welcome).append(panel);
  const music = doc.createElement('div');
  music.className = 'showtime-music';
  music.innerHTML = `<button type="button" class="showtime-track">Music: OFF</button><span class="showtime-music-note" aria-live="polite">Original kitchen beats · no downloads</span>`;
  // Its own row avoids squeezing the existing 320px masthead or mobile action dock.
  const header = doc.querySelector('.masthead');
  if (header) header.after(music); else welcome.before(music);
  const style = doc.createElement('style');
  style.textContent = `.showtime-panel{margin:20px 0;padding:16px;border:3px solid #27291e;background:#f8efd8;color:#27291e;max-width:100%;box-sizing:border-box;box-shadow:5px 5px 0 #f15425}.showtime-kicker{font-weight:900;letter-spacing:.08em;font-size:12px}.showtime-title{font-size:clamp(21px,5vw,30px)!important;line-height:1.1!important;margin:8px 0!important}.showtime-copy{font-size:16px;line-height:1.45}.showtime-step,.showtime-disclaimer{font-size:14px;line-height:1.4}.showtime-actions{display:flex;flex-wrap:wrap;gap:8px}.showtime-actions button,.showtime-track{min-height:44px;padding:10px 12px;border:2px solid #27291e;background:#27291e;color:#fff9e9;cursor:pointer;font:700 15px monospace;white-space:normal;max-width:100%}.showtime-actions button:focus-visible,.showtime-track:focus-visible{outline:3px solid #f15425;outline-offset:3px}.showtime-music{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:6px 0;max-width:100%;box-sizing:border-box}.showtime-music-note{font-size:14px;overflow-wrap:anywhere}.showtime-disclaimer{opacity:.8}.showtime-panel [hidden]{display:none!important}body[data-screen="playing"] .showtime-music-note{display:none}@media(max-width:360px){.showtime-panel{padding:12px}.showtime-music-note{font-size:14px}}`;
  doc.head.append(style);
  const find = (selector) => panel.querySelector(selector);
  let scene = 0, track = 0, soundEnabled = false, paused = false, unavailable = false;
  let context = null, timer = null, step = 0;
  const voices = new Set();
  const trackButton = music.querySelector('button');
  const note = music.querySelector('span');
  const drawScene = () => {
    find('.showtime-title').textContent = SHOWTIME_SCENES[scene].title;
    find('.showtime-copy').textContent = SHOWTIME_SCENES[scene].copy;
    find('.showtime-step').textContent = `SCENE ${scene + 1} / ${SHOWTIME_SCENES.length}`;
    find('.showtime-next').textContent = scene === 2 ? 'Let’s cook →' : 'Next scene →';
  };
  const finish = () => {
    find('.showtime-scene').hidden = true;
    find('.showtime-after').hidden = false;
    doc.getElementById('start')?.focus();
  };
  find('.showtime-next').onclick = () => { if (scene < 2) { scene++; drawScene(); } else finish(); };
  find('.showtime-skip').onclick = finish;
  find('.showtime-replay').onclick = () => {
    scene = 0; drawScene(); find('.showtime-scene').hidden = false;
    find('.showtime-after').hidden = true; find('.showtime-next').focus();
  };
  find('.showtime-tutorial').onclick = () => onTutorial();
  const label = () => {
    trackButton.textContent = unavailable ? 'Music unavailable' : `Music: ${SHOWTIME_TRACKS[track]}`;
    note.textContent = unavailable ? 'Your browser could not start audio. Gameplay still works.' : track && !soundEnabled ? 'Turn SOUND ON to hear this track.' : 'Original kitchen beats · no downloads';
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
    const now = context.currentTime, oscillator = context.createOscillator(), gain = context.createGain();
    const melodies = [[110, 0, 220, 0, 146.83, 0, 220, 164.81], [130.81, 164.81, 196, 164.81, 146.83, 174.61, 220, 174.61], [110, 220, 164.81, 220, 146.83, 293.66, 196, 220]];
    const frequency = melodies[track - 1][step++ % 8];
    if (!frequency) return;
    oscillator.type = track === 1 ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    if (track === 1) oscillator.frequency.exponentialRampToValueAtTime(45, now + .1);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.018, now + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .16);
    oscillator.connect(gain); gain.connect(context.destination);
    voices.add(oscillator);
    oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(now); oscillator.stop(now + .18);
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
        timer = win.setInterval(() => { try { playBeat(); } catch { unavailable = true; stop(); label(); } }, track === 2 ? 300 : track === 3 ? 170 : 230);
      }).catch(() => { unavailable = true; stop(); label(); });
    } catch { unavailable = true; stop(); label(); }
  };
  trackButton.onclick = () => { track = (track + 1) % SHOWTIME_TRACKS.length; step = 0; stop(); sync(); };
  const visibility = () => sync();
  doc.addEventListener('visibilitychange', visibility);
  drawScene();
  showtimeInstance = {
    setSound(value) { soundEnabled = value; sync(); },
    setPaused(value) { if (paused !== value) { paused = value; trackButton.disabled = value; sync(); } },
    destroy() { stop(); context?.close().catch(() => {}); doc.removeEventListener('visibilitychange', visibility); panel.remove(); music.remove(); style.remove(); showtimeInstance = null; },
  };
  return showtimeInstance;
}
