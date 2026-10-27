// Built artifact interaction test; no layout, real audio or hardware claim.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {JSDOM}=await import(process.env.JSDOM_MODULE || 'jsdom');
const html=await readFile(new URL('../dist/Chaos-Kitchen.html',import.meta.url),'utf8');
const source=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;
w.requestAnimationFrame=()=>{}; w.scrollTo=()=>{}; w.matchMedia=()=>({matches:true});
w.Element.prototype.scrollIntoView=()=>{};
w.Element.prototype.getAnimations=()=>[];
w.eval(source+'\nwindow.chefProbe={state:()=>game,tick:ms=>{game=dispatch(game,{type:"TICK",ms});lastTime=performance.now();render();}};');
const $=id=>d.getElementById(id), row=id=>$('station-items').querySelector(`[data-food="${id}"]`);
$('chef-mode').checked=true; $('practice').checked=true; $('start').click();
assert.equal($('station').hidden,false); assert.equal($('serve').disabled,true);
assert.equal($('mobile-dock').hidden,false);
assert.equal($('mobile-action').textContent,'Choose ingredients ↓');
for(const id of ['chicken','rice']) {
  d.querySelector(`[data-ingredient="${id}"]`).click();
  row(id).querySelector('button').click(); row(id).querySelector('button').click();
}
$('mobile-action').click(); assert.match($('station-title').textContent,/HOT LINE/);
for(const [id, ms] of [['chicken',2400],['rice',2000]]) {
  row(id).querySelector('button').click(); w.chefProbe.tick(ms);
  assert.match(row(id).textContent,/READY! STOP NOW/);
  assert.match($('mobile-action').textContent,/STOP/);
  $('pause').click(); assert.equal($('mobile-dock').hidden,true);
  $('resume').click(); assert.equal($('mobile-dock').hidden,false);
  $('mobile-action').click();
}
$('mobile-action').click(); assert.match($('station-title').textContent,/THE PASS/);
assert.equal($('serve').disabled,true);
for(const id of ['chicken','rice']) row(id).querySelector('button').click();
assert.equal($('serve').disabled,false); assert.equal($('plate-food').querySelectorAll('svg').length,2);
assert.match($('mobile-action').textContent,/SERVE PLATE/);
$('mobile-action').click(); assert.match($('feedback-title').textContent,/ORDER UP/);
assert.match($('mobile-action').textContent,/Next ticket/);
$('mobile-action').click(); assert.equal(w.chefProbe.state().station,'prep');
$('quit').click(); $('home').click();
$('difficulty').click(); $('difficulty').click(); $('backwards').checked=true;
$('start').click(); assert.equal(w.chefProbe.state().difficulty,'hard');
assert.match($('needs').textContent,/nekcihC/);
const first=$('pantry').querySelector('button:not([hidden])').dataset.ingredient;
d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'1',bubbles:true}));
assert.equal(w.chefProbe.state().selected[0],first);
$('quit').click(); assert.equal($('mobile-dock').hidden,true);
$('home').click(); $('chef-mode').checked=false; $('start').click();
for(const id of ['chicken','rice']) d.querySelector(`[data-ingredient="${id}"]`).click();
assert.match($('mobile-action').textContent,/SERVE PLATE/);
$('mobile-action').click(); assert.equal(w.chefProbe.state().result.correct,true);
dom.window.close();
console.log('PASS: Chef mode controls, prep, ready/stop, handoff, plating, serve, replay, difficulty, backwards ticket and visual-position keyboard mapping. Layout and audio unverified.');
