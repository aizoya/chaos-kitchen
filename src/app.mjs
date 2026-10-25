import { createControllerReader } from './controller.mjs';
import { INGREDIENTS, STAGES, nameOf, COOKING } from './content.mjs';
import { createService, dispatchService, serviceView } from './service.mjs';
import { mountShowtime, setShowtimePaused, setShowtimeSound, shiftLesson, nextShiftGoal, inspectionResult } from './showtime.mjs';
import {
  createGame,
  judgePlate,
  dispatch,
  ticketFor,
  stageFor,
  multiplier,
  HEAT, pantryFor, ticketDuration,
} from './engine.mjs';
import { FOOD, BELL } from './art.mjs';

const $ = (id) => document.getElementById(id);
let service = null, activeGoal = null;
function updateGame(action) {
  if (service) { service = dispatchService(service, action); game = serviceView(service); }
  else if (game) game = dispatch(game, action);
}
function trayFor(state) {
  const ticket = ticketFor(state);
  const must = [...ticket.required, ...ticket.optional, ...ticket.forbidden];
  const order = pantryFor(state);
  const pool = new Set([...new Set([...must, ...order])].slice(0, 8));
  return order.filter(id => pool.has(id));
}
let difficulty = 'easy', stationKey = '', panNotice = '', feedbackKey = '';
let mobilePrepTasks = false, mobilePrepKey = '';
let game = null,
  lastTime = performance.now(),
  drawnTicket = -1,
  drawnPlate = '',
  lastStatus = '',
  sound = false,
  audioContext,
  panicTicket = -1;
const announce = (text) => {
  $('announcement').textContent = text;
};
function tone(good = true) {
  if (!sound) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    audioContext ??= new Audio();
    audioContext.resume().catch(() => {});
    const osc = audioContext.createOscillator(),
      gain = audioContext.createGain(),
      now = audioContext.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(good ? 880 : 180, now);
    osc.frequency.exponentialRampToValueAtTime(good ? 1320 : 90, now + 0.12);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  } catch {
    sound = false;
    setShowtimeSound(false);
    $('sound').textContent = '♪ SOUND UNAVAILABLE';
    $('sound').setAttribute('aria-pressed', 'false');
  }
}
// Settle real elapsed time BEFORE any action. A late click cannot beat an expired clock.
function settle(now = performance.now()) {
  now = Math.max(lastTime, now); // rAF timestamps can predate an input handler.
  if (game?.status === 'playing')
    updateGame({ type: 'TICK', ms: Math.max(0, now - lastTime) });
  lastTime = now;
}
function act(action) {
  settle();
  if (game) updateGame(action);
  if (action.type === 'COOK' && game?.activePan === action.id) tone(false);
  render();
}
function begin(tutorial = false, inspection = false) {
  inspection = inspection === true && tutorial !== true;
  activeGoal = inspection ? {metric:'perfect',target:2,label:'Inspection: 3 plates · 2 bonuses · no misses'} : nextShiftGoal(game);
  if (!$('chef-intro').paused) $('chef-intro').pause();
  tutorial = tutorial === true;
  const options = {
    practice: $('practice').checked,
    chefMode: $('chef-mode').checked,
    difficulty,
    seed: Date.now() >>> 0,
    tutorial,
    inspection,
  };
  service = !tutorial && !inspection && $('expanded-mode').checked ? createService(options) : null;
  game = service ? serviceView(service) : createGame(options);
  drawnTicket = -1;
  stationKey = ''; panNotice = '';
  feedbackKey = '';
  drawnPlate = '!';
  lastStatus = '';
  panicTicket = -1;
  lastTime = performance.now();
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
  $('ticket').focus();
  tone();
}
function render() {
  const status = game?.status ?? 'welcome',
    paused = status === 'paused',
    ended = status === 'ended',
    welcome = !game;
  const prepKey = game ? `${game.index}:${service?.active ?? 0}` : '';
  if (prepKey !== mobilePrepKey) { mobilePrepKey = prepKey; mobilePrepTasks = false; }
  document.body.dataset.inspection = String(Boolean(game?.inspection));
  document.body.dataset.workstep = !game?.chefMode ? 'classic' : game.station === 'prep' ? (mobilePrepTasks ? 'prep' : 'choose') : game.station;
  document.body.dataset.screen = welcome
    ? 'welcome'
    : ended
      ? 'ending'
      : 'playing';
  $('welcome').hidden = !welcome;
  $('game').hidden = welcome || ended;
  $('ending').hidden = !ended;
  $('pause-layer').hidden = !paused;
  $('game').inert = paused;
  $('sound').disabled = paused;
  setShowtimePaused(paused || ended || status === 'feedback');
  $('mobile-dock').hidden = welcome || ended || paused;
  if (!game) return;
  renderTables();
  const stage = stageFor(game.index),
    ticket = ticketFor(game),
    feedback = status === 'feedback';
  document.body.dataset.stage = stage;
  $('shift-goal').textContent = game.inspection ? 'INSPECTION · ' + game.served + '/3 plates · ' + game.perfect + '/2 bonuses · ' + game.missed + ' misses' : activeGoal.label + ' · ' + (game[activeGoal.metric] || 0) + '/' + activeGoal.target;
  $('score').textContent = String(game.score).padStart(5, '0');
  $('clock-label').textContent = game.tutorial ? 'TUTORIAL' : game.practice ? 'PRACTICE' : 'SERVICE LEFT';
  const seconds = Math.ceil(game.remainingMs / 1000);
  $('clock').textContent = game.practice
    ? game.tutorial ? 'NO RUSH' : `${Math.min(10, (service?.completed ?? game.index) + 1)}/10`
    : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  $('combo').textContent = `×${multiplier(game.streak)}`;
  $('stage-name').textContent = STAGES[stage].name;
  $('round-count').textContent =
    `TICKET ${String(game.index + 1).padStart(2, '0')}`;
  $('chef-comment').textContent =
    panicTicket === game.index
      ? 'Five seconds. Breathe into this imaginary paper bag.'
      : STAGES[stage].quip;
  $('order-clock').textContent = game.practice
    ? '∞'
    : `${Math.ceil(game.orderRemainingMs / 1000)}s`;
  $('compact-clock').textContent = game.practice ? '∞' : game.waiting ? 'WAIT' : `${Math.ceil(Math.min(game.orderRemainingMs, game.chefMode ? game.stationRemainingMs : Infinity) / 1000)}s`;
  $('order-bar').style.width =
    `${game.practice ? 100 : Math.min(100, (game.orderRemainingMs / ticketDuration(game)) * 100)}%`;
  $('order-bar').classList.toggle(
    'urgent',
    game.orderRemainingMs <= 5000 && !game.practice,
  );
  if (drawnTicket !== game.index) {
    drawnTicket = game.index;
    const tray = trayFor(game);
    for (const button of $('pantry').children) button.hidden = !tray.includes(button.dataset.ingredient);
    tray.forEach((id, index) => {
      const button = $('pantry').querySelector(`[data-ingredient="${id}"]`);
      button.querySelector('.key').textContent = index + 1;
      $('pantry').append(button);
    });
    for (const [id, value] of Object.entries({
      'ticket-number': `ORDER #${String(game.index + 1).padStart(3, '0')}`,
      table: `TABLE ${ticket.table}`,
      'ticket-title': ticket.title,
      character: ticket.character,
      'order-copy': ticket.order,
      restriction: ticket.restriction,
      needs: ticket.required.map(nameOf).join(' + '),
      bonus: ticket.optional.length
        ? `BONUS: ${ticket.optional.map(nameOf).join(' + ')}`
        : 'NO EXTRAS. You have enough going on.',
    }))
      $(id).textContent = value;
    if (game.chefMode && game.difficulty === 'hard' && $('backwards').checked) {
      $('needs').textContent = ticket.required.map(id => [...nameOf(id)].reverse().join('')).join(' + ');
      $('needs').setAttribute('aria-label', ticket.required.map(nameOf).join(' + '));
    } else $('needs').removeAttribute('aria-label');
    $('ticket')
      .getAnimations()
      .forEach((a) => a.cancel());
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
      $('ticket').animate(
        [
          { transform: 'translateY(-12px)', opacity: 0.4 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        { duration: 260 },
      );
    announce(
      `${ticket.title}. ${ticket.order} ${ticket.restriction}. ${$('bonus').textContent}`,
    );
  }
  const visibleFood = game.chefMode ? game.plated : game.selected;
  const plate = visibleFood.join(',');
  if (plate !== drawnPlate) {
    drawnPlate = plate;
    $('plate-food').innerHTML = visibleFood.map((id) => FOOD[id]).join('');
    $('mobile-plate').innerHTML = visibleFood.map((id) => FOOD[id]).join('');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && visibleFood.length) {
      for (const plate of [$('plate-food'), $('mobile-plate')]) plate.animate([{transform:'scale(.94)',opacity:.6},{transform:'scale(1)',opacity:1}],{duration:180});
    }
  }
  $('empty-plate').hidden = visibleFood.length > 0;
  $('plate-count').textContent = `${visibleFood.length} / 4 ON THE PLATE`;
  for (const button of $('pantry').children) {
    button.setAttribute(
      'aria-pressed',
      String(game.selected.includes(button.dataset.ingredient)),
    );
    button.disabled = status !== 'playing';
  }
  $('clear').disabled = status !== 'playing' || !game.selected.length || (game.chefMode && game.station !== 'prep');
  $('mobile-clear').disabled = $('clear').disabled;
  $('mobile-edit').hidden = !game.chefMode || game.station !== 'prep' || !mobilePrepTasks;
  $('mobile-edit').disabled = status !== 'playing';
  $('serve').disabled = status !== 'playing' || !game.selected.length || (game.chefMode && (game.station !== 'plate' || game.plated.length !== game.selected.length));
  renderStation();
  $('panic').disabled = status !== 'playing' || game.panicUsed || game.practice;
  $('mobile-panic').disabled = $('panic').disabled;
  $('panic').querySelector('small').textContent = game.practice
    ? 'off-duty in practice'
    : game.panicUsed
      ? 'composure temporarily restored'
      : 'actually, panic. +5s · once';
  $('feedback').hidden = !feedback;
  if (feedback) {
    const r = game.result;
    $('feedback').dataset.kind = r.kind;
    $('feedback-title').textContent = r.title;
    $('reaction').textContent = r.reaction;
    $('reason').textContent = r.reason;
    $('points').textContent = `+${r.points}`;
    $('next').textContent =
      game.inspection && game.index === 2 || game.tutorial || (game.practice && (service ? service.completed >= 10 : game.index === 9))
        ? 'CLOSE THE KITCHEN →'
        : 'NEXT TICKET →';
  }
  if (ended) {
    $('end-title').textContent = game.practice
      ? 'PRACTICE MAKES PLATES.'
      : game.served >= 6
        ? 'YES, CHEF.'
        : game.served
          ? 'A BEAUTIFUL HOT MESS.'
          : 'THE BREAD WAS EXCELLENT.';
    const lesson = shiftLesson(game);
    $('lesson-title').textContent = lesson.title;
    $('lesson-evidence').textContent = lesson.evidence;
    $('lesson-tip').textContent = lesson.tip;
    if (game.inspection) {
      const verdict = inspectionResult(game);
      $('end-title').textContent = verdict.title;
      $('lesson-tip').textContent = verdict.tip;
      $('lesson-title').textContent = verdict.title;
      $('lesson-evidence').textContent = `${game.served}/3 plates · ${game.perfect} flavor bonuses · ${game.missed} misses`;
    } else {
      const goal = nextShiftGoal(game);
      $('lesson-tip').textContent = lesson.tip + ' Next goal: ' + goal.label + '.';
    }
    $('end-score').textContent = game.score.toLocaleString();
    const stats = [
      ['Mode', game.inspection ? 'Chaos Star inspection' : game.tutorial ? 'Safe first-plate tutorial' : `${game.chefMode ? 'Chef / ' + game.difficulty + ' / ' : ''}${game.practice ? 'Untimed practice' : service ? 'Expanded service' : '90-second service'}`],
      ['Happy tables', game.served],
      ['Flavor bonuses', game.perfect],
      ['Best streak', game.bestStreak],
      ['Sent back / timed out', game.missed],
      ...(service ? [['Chaos Stars', game.perfect], ['Prizes this shift', service.rewards.join(' · ') || 'Next shift, chef!']] : []),
    ];
    $('end-stats').replaceChildren(
      ...stats.flatMap(([name, value]) => {
        const dt = document.createElement('dt'),
          dd = document.createElement('dd');
        dt.textContent = name;
        dd.textContent = value;
        return [dt, dd];
      }),
    );
    $('end-comment').textContent =
      game.served >= 6
        ? 'The printer fears you now.'
        : 'The kitchen believes in second chances. And extra rice.';
  }
  const newFeedback = feedback && feedbackKey !== String(game.index);
  if (newFeedback) feedbackKey = String(game.index);
  if (status !== lastStatus || newFeedback) {
    if (feedback) {
      $('next').focus();
      announce(
        `${game.result.title}. ${game.result.reaction} ${game.result.reason}`,
      );
      tone(game.result.correct);
    }
    if (paused) $('resume').focus();
    if (ended) {
      $('ending').focus();
      window.scrollTo({ top: 0, behavior: 'instant' });
      announce(
        `Service finished. ${game.score} points. ${game.served} happy tables.`,
      );
    }
    if (status === 'playing' && ['feedback', 'paused'].includes(lastStatus))
      $('ticket').focus();
    lastStatus = status;
  }
  renderMobileAction();
}
function renderMobileAction() {
  const button = $('mobile-action');
  const next = game.status === 'feedback';
  const ready = !$('serve').disabled;
  const handoff = game.chefMode && !$('handoff').hidden && !$('handoff').disabled;
  const pan = game.activePan;
  const target = next ? 'next' : ready ? 'serve' : pan ? 'stop' : handoff ? 'handoff' : game.chefMode && game.selected.length ? 'station' : 'pantry';
  button.dataset.target = target;
  button.textContent = next ? 'Next ticket →' : ready ? 'SERVE PLATE 🔔' : pan ? `STOP ${nameOf(pan)} · ${game.cooking[pan].state.toUpperCase()}` : handoff ? (game.station === 'prep' ? 'TO COOKING →' : 'TO PLATING →') : target === 'pantry' ? 'Choose ingredients ↓' : `Finish ${game.station} tasks ↓`;
  if (target === 'station' && game.station === 'prep' && !mobilePrepTasks) button.textContent = `PREP ${game.selected.length} INGREDIENT${game.selected.length === 1 ? '' : 'S'} →`;
  const t = ticketFor(game);
  $('mobile-summary').textContent = next ? `${game.result.title} · +${game.result.points}` : `${t.required.map(nameOf).join(' + ')}${t.optional.length ? ' · BONUS: ' + t.optional.map(nameOf).join(' + ') : ''} · ${game.practice ? 'No deadline' : Math.ceil(game.orderRemainingMs / 1000) + 's'}`;
}
function renderTables() {
  const rail = $('table-rail');
  rail.hidden = !service;
  $('rush-event').hidden = !service || game.status === 'feedback';
  $('feedback-rush').hidden = !service;
  document.body.dataset.frenzy = String(Boolean(game.frenzy));
  $('plate').dataset.prize = service?.rewards.length ? String(service.rewards.length) : '0';
  if (!service) return;
  if (rail.children.length !== service.tables.length) {
    rail.replaceChildren(...service.tables.map((_, index) => {
      const b = document.createElement('button'); b.type = 'button';
      b.onclick = () => { act({type:'SWITCH_TABLE',index}); $('ticket').focus({preventScroll:true}); };
      return b;
    }));
  }
  [...rail.children].forEach((b, index) => {
    const table = service.tables[index];
    b.disabled = game.status !== 'playing' || !table || table.status === 'ended';
    b.setAttribute('aria-pressed', String(service.active === index));
    const deadline = table ? Math.min(table.orderRemainingMs, table.chefMode ? table.stationRemainingMs : Infinity) : 0;
    b.textContent = !table || table.status === 'ended' ? `PASS ${index + 1} · CLOSED` : `TABLE ${ticketFor(table).table}${table.frenzy ? ' ×2' : ''} · ${table.waiting ? 'WAITING · select food to start' : (table.practice ? '∞' : Math.ceil(deadline / 1000) + 's') + (table.activePan ? ' · ' + nameOf(table.activePan) + ' ' + table.cooking[table.activePan].state : ' · ' + (table.chefMode ? table.station : 'order'))}`;
  });
  const prize = service.rewards.at(-1);
  $('rush-event').textContent = game.frenzy
    ? 'FEEDING FRENZY! This ticket pays DOUBLE. Same rules. Same breathing room.'
    : `CHAOS STAR SERVICE · ${game.perfect} perfect plates${prize ? ' · UNLOCKED: ' + prize : ' · First perfect bonus plate wins a Chaos Star rim'} · Every fourth ticket pays double.`;
  $('feedback-rush').textContent = $('rush-event').textContent;
}
$('mobile-action').onclick = () => {
  if (!game || !['playing','feedback'].includes(game.status)) return;
  const target = $('mobile-action').dataset.target;
  if (target === 'stop') act({type:'STOP_COOK'});
  else if (['next','serve','handoff'].includes(target)) $(target).click();
  else {
    if (target === 'pantry') { mobilePrepTasks = false; render(); }
    if (target === 'station' && game.chefMode && game.station === 'prep') { mobilePrepTasks = true; render(); }
    const region = $(target);
    region.scrollIntoView({block:'center',behavior:'instant'});
    const control = region.querySelector('button:not(:disabled)');
    control?.focus({preventScroll:true});
  }
};
$('learn').onclick = () => begin(true);
$('inspection').onclick = () => begin(false, true);
$('chef-video-panel').addEventListener('toggle', () => {
  if (!$('chef-video-panel').open && !$('chef-intro').paused) $('chef-intro').pause();
});
$('mobile-edit').onclick = () => { mobilePrepTasks = false; render(); };
$('mobile-clear').onclick = () => { mobilePrepTasks = false; $('clear').click(); };
$('mobile-panic').onclick = () => $('panic').click();
function renderStation() {
  $('station').hidden = !game.chefMode;
  if (!game.chefMode) return;
  const step = game.station;
  $('station-title').textContent = { prep: '01 · PREP CREW', cook: '02 · HOT LINE', plate: '03 · THE PASS' }[step];
  $('station-instruction').textContent = { prep: game.tutorial && !judgePlate(ticketFor(game), game.selected, 0, 0, true).correct ? 'Choose all required ingredients and remove extras before cooking. Ingredients ↩ lets you edit.' : 'Choose the ticket ingredients, then finish both prep tasks for each.', cook: 'One pan. Start cooking, then STOP in READY. Too early? Restart. Too late? Remake.', plate: 'Tap each finished ingredient to assemble the plate. Then ring SERVICE!' }[step];
  $('station-time').textContent = game.tutorial ? 'SAFE TUTORIAL · no deadline · food waits in READY' : game.practice ? 'PRACTICE · no station deadline · pans still burn' : game.waiting ? 'WAITING · select food to start · shift clock keeps running' : `${Math.ceil(game.stationRemainingMs / 1000)}s AT THIS STATION · order clock keeps running`;
  $('station-time').dataset.compact = game.tutorial ? 'TRAINING · no rush' : game.practice ? 'PRACTICE · pans can burn' : game.waiting ? 'WAITING · choose ingredients' : `${Math.ceil(game.stationRemainingMs / 1000)}s · ${step.toUpperCase()}`;
  const key = `${game.index}:${step}:${game.selected.join(',')}`;
  if (key !== stationKey) {
    stationKey = key;
    $('station-items').replaceChildren(...game.selected.map(id => {
      const row = document.createElement('div'); row.className = 'pan-row'; row.dataset.food = id;
      row.innerHTML = `<strong>${nameOf(id)}</strong><span class="pan-state"></span><progress max="100" value="0" aria-label="${nameOf(id)} fictional cooking progress"></progress><button type="button"></button>`;
      row.querySelector('button').onclick = () => {
        act({ type: game.station === 'prep' ? 'PREP' : game.station === 'plate' ? 'PLATE' : game.activePan === id ? 'STOP_COOK' : 'COOK', id });
      };
      return row;
    }));
  }
  for (const row of $('station-items').children) {
    const id = row.dataset.food, pan = game.cooking[id], button = row.querySelector('button'), gauge = row.querySelector('progress');
    const state = step === 'prep' ? ['NEEDS PREP', 'ONE TASK LEFT', 'PREPPED'][game.prepped[id] || 0] : step === 'plate' ? (game.plated.includes(id) ? 'ON THE PLATE' : 'READY TO PLATE') : !HEAT[id] ? 'FINISHING INGREDIENT' : (pan?.state || 'WAITING').toUpperCase();
    row.dataset.state = state;
    row.dataset.cooking = String(pan?.state === 'warming');
    row.querySelector('.pan-state').textContent = state === 'READY' ? 'STEAM’S UP · READY! STOP NOW' : state;
    gauge.hidden = step !== 'cook' || !HEAT[id];
    gauge.value = HEAT[id] ? (pan?.ms || 0) / (HEAT[id] + 1600) * 100 : 0;
    const task = COOKING[id]?.prep ?? ['GATHER', 'PREP'];
    button.textContent = step === 'prep' ? `${task[Math.min(1, game.prepped[id] || 0)]} · ${nameOf(id)} (${Math.min(2, game.prepped[id] || 0)}/2)` : step === 'plate' ? `PLATE ${nameOf(id)}` : game.activePan === id ? `STOP ${nameOf(id)}` : pan?.state === 'done' ? `DONE · ${nameOf(id)}` : `${pan ? 'REMAKE' : (COOKING[id]?.method ?? 'COOK').toUpperCase()} ${nameOf(id)}`;
    button.disabled = game.status !== 'playing' || (step === 'prep' ? game.prepped[id] === 2 : step === 'plate' ? game.plated.includes(id) : !HEAT[id] || pan?.state === 'done' || Boolean(game.activePan && game.activePan !== id));
  }
  $('handoff').hidden = step === 'plate';
  $('handoff').textContent = step === 'prep' ? 'HAND TO THE HOT LINE →' : 'HAND TO PLATING →';
  $('handoff').disabled = (game.tutorial && step === 'prep' && !judgePlate(ticketFor(game), game.selected, 0, 0, true).correct) || game.status !== 'playing' || !game.selected.length || !game.selected.every(id => step === 'prep' ? game.prepped[id] === 2 : !HEAT[id] || game.cooking[id]?.state === 'done');
  const notice = Object.entries(game.cooking).map(([id, pan]) => `${id}:${pan.state}`).join(',');
  if (notice !== panNotice) {
    panNotice = notice;
    for (const [id, pan] of Object.entries(game.cooking)) if (['ready', 'burnt'].includes(pan.state)) {
      announce(`${nameOf(id)} ${pan.state === 'ready' ? 'ready! Stop now.' : 'burnt. Remake it.'}`); tone(pan.state === 'ready');
    }
  }
}
$('handoff').onclick = () => { act({type: 'HANDOFF'}); $('station-title').tabIndex = -1; $('station-title').focus(); };
$('difficulty').onclick = () => {
  const levels = ['easy', 'medium', 'hard']; difficulty = levels[(levels.indexOf(difficulty) + 1) % 3];
  $('difficulty').textContent = `Chef difficulty: ${difficulty.toUpperCase()} · ${ticketDuration({chefMode:true,difficulty}) / 1000}s per order`;
};
$('expanded-mode').onchange = () => { if ($('expanded-mode').checked) $('chef-mode').checked = true; };
$('hero-food').innerHTML = FOOD.rice + FOOD.chicken + FOOD.chili;
$('hero-bell').innerHTML = BELL;
$('serve-bell').innerHTML = BELL;
$('ticket').tabIndex = -1;
for (const [index, item] of INGREDIENTS.entries()) {
  const button = document.createElement('button');
  button.className = 'ingredient';
  button.dataset.ingredient = item.id;
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', item.name);
  button.innerHTML = `<span class="key" aria-hidden="true">${index + 1}</span>${FOOD[item.id]}<strong>${item.name}</strong>`;
  button.addEventListener('click', () => {
    const full =
      game?.selected.length === 4 && !game.selected.includes(item.id);
    act({ type: 'TOGGLE', id: item.id });
    if (full) announce('Four ingredients maximum. Remove one first.');
  });
  $('pantry').append(button);
}
$('start').onclick = begin;
$('restart').onclick = () => begin(false, game?.inspection === true);
$('home').onclick = () => {
  game = null;
  service = null;
  lastStatus = '';
  render();
  $('start').focus();
};
$('serve').onclick = () => act({ type: 'SERVE' });
$('next').onclick = () => act({ type: 'NEXT' });
$('clear').onclick = () => act({ type: 'CLEAR' });
$('pause').onclick = () => act({ type: 'PAUSE' });
$('resume').onclick = () => act({ type: 'RESUME' });
$('quit').onclick = () => {
  if (service) service = { ...service, status: 'ended' };
  game = { ...game, status: 'ended' };
  render();
};
$('panic').onclick = () => {
  act({ type: 'PANIC' });
  if (game.status === 'playing' && game.panicUsed) {
    panicTicket = game.index;
    render();
    announce('Five seconds borrowed. The chef is breathing into a paper bag.');
    tone(false);
  }
};
$('sound').onclick = () => {
  sound = !sound;
  setShowtimeSound(sound);
  $('sound').textContent = sound ? '♪ SOUND ON' : '♪ SOUND OFF';
  $('sound').setAttribute('aria-pressed', String(sound));
  tone();
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !$('chef-intro').paused) $('chef-intro').pause();
  if (document.hidden) {
    readController.rearm();
    settle();
    if (game) updateGame({ type: 'PAUSE' });
    render();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  if (game?.status === 'paused' && event.key === 'Tab') {
    event.preventDefault();
    (document.activeElement === $('resume') ? $('quit') : $('resume')).focus();
    return;
  }
  if (
    event.key === 'Escape' &&
    game &&
    ['playing', 'feedback', 'paused'].includes(game.status)
  ) {
    event.preventDefault();
    act({ type: game.status === 'paused' ? 'RESUME' : 'PAUSE' });
    return;
  }
  if (game?.status === 'playing' && /^[1-8]$/.test(event.key)) {
    event.preventDefault();
    act({ type: 'TOGGLE', id: trayFor(game)[Number(event.key) - 1] });
  }
});
document.addEventListener('pointerdown', () => { delete document.body.dataset.input; });
document.addEventListener('keydown', () => { delete document.body.dataset.input; });
let readController = createControllerReader();
const controllerHint = document.createElement('p');
controllerHint.className = 'controller-hint';
controllerHint.hidden = true;
controllerHint.textContent = 'ONE CONTROLLER · D-pad: move · A / Cross: select · X / Square: serve · Start / Options: pause';
$('sound').closest('header').after(controllerHint);
function pollController() {
  if (document.hidden) { readController.rearm(); return; }
  let result;
  try { result = readController(navigator.getGamepads?.() ?? []); }
  catch { result = readController.unavailable(); }
  controllerHint.hidden = !result.connected;
  if (result.disconnected && game && ['playing', 'feedback'].includes(game.status)) {
    act({ type: 'PAUSE' });
    announce('Controller disconnected. Game paused. Reconnect or use touch or keyboard.');
  }
  for (const action of result.actions) {
    document.body.dataset.input = 'controller';
    if (action === 'pause') {
      if (game && ['playing', 'feedback', 'paused'].includes(game.status))
        act({ type: game.status === 'paused' ? 'RESUME' : 'PAUSE' });
      continue;
    }
    if (action === 'serve') {
      if (game?.status === 'playing') $('serve').click();
      continue;
    }
    const controls = [...document.querySelectorAll('button, input[type="checkbox"], summary')]
      .filter(el => !el.disabled && !el.closest('[inert]') && el.getClientRects().length);
    const index = controls.indexOf(document.activeElement);
    const entry = controls.find(el => el.matches('#start, #pantry button, #station button, #next, #resume, #restart')) ?? controls[0];
    if (!controls.length) continue;
    if (action === 'activate') {
      // Focus first before activating; never click a stale hidden control.
      if (index < 0) entry.focus();
      else controls[index].click();
    } else {
      const step = action === 'next' ? 1 : -1;
      (index < 0 ? entry : controls[(index + step + controls.length) % controls.length]).focus();
    }
  }
}
let lastDraw = 0;
function frame(now) {
  pollController();
  const before = game;
  settle(now);
  if (game !== before && (now - lastDraw >= 100 || game.status !== 'playing')) {
    render();
    lastDraw = now;
  }
  requestAnimationFrame(frame);
}
mountShowtime();
render();
$('start').disabled = false;
$('startup-status').hidden = true;
requestAnimationFrame(frame);
