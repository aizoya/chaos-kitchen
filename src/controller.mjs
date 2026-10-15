// Standard-mapped controllers only. Require release after connect/focus changes.
export function createControllerReader() {
  let identity = null, previous = new Set(), rearming = false, unavailable = false;
  function read(pads = []) {
    unavailable = false;
    const available = Array.from(pads).filter(p => p?.connected && p.mapping === 'standard');
    const keyOf = p => `${p.index}:${p.id}`;
    const tracked = available.find(p => keyOf(p) === identity);
    const disconnected = identity !== null && !tracked;
    const pad = tracked ?? available[0];
    if (!pad) {
      identity = null; previous = new Set();
      return { connected: false, disconnected, actions: [] };
    }
    const held = new Set();
    const pressed = n => pad.buttons[n]?.pressed;
    if (pressed(14) || pressed(12) || pad.axes[0] < -0.6 || pad.axes[1] < -0.6) held.add('previous');
    if (pressed(15) || pressed(13) || pad.axes[0] > 0.6 || pad.axes[1] > 0.6) held.add('next');
    if (pressed(0)) held.add('activate');
    if (pressed(2)) held.add('serve');
    if (pressed(9)) held.add('pause');
    const key = `${pad.index}:${pad.id}`;
    const actions = identity === key && !rearming ? [...held].filter(a => !previous.has(a)) : [];
    identity = key; previous = held; rearming = false;
    // One action per frame prevents a held chord crossing screen boundaries.
    return { connected: true, disconnected, actions: actions.slice(0, 1) };
  }
  // Preserve ownership while suppressing keys held across a visibility/API gap.
  read.rearm = () => { rearming = true; };
  read.unavailable = () => {
    const disconnected = identity !== null && !unavailable;
    unavailable = true; rearming = true;
    return { connected: false, disconnected, actions: [] };
  };
  return read;
}
