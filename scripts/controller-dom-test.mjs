// Development-only DOM harness. Not a substitute for browser/layout/hardware QA.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {JSDOM}=await import(process.env.JSDOM_MODULE || 'jsdom');
const html=await readFile(new URL('../dist/Chaos-Kitchen.html',import.meta.url),'utf8');
const source=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true,url:'https://example.test'});
const w=dom.window,d=w.document;
let callback, pads=[];
w.requestAnimationFrame=fn=>{callback=fn;};
w.scrollTo=()=>{};
w.matchMedia=()=>({matches:true});
w.Element.prototype.getAnimations=()=>[];
Object.defineProperty(w.HTMLElement.prototype,'inert',{get(){return this.hasAttribute('inert');},set(value){this.toggleAttribute('inert',Boolean(value));}});
w.Element.prototype.getClientRects=function(){return this.closest('[hidden]')?[]:[{}];};
w.navigator.getGamepads=()=>pads;
w.eval(source + '\nwindow.clockProbe = { get: () => lastTime, set: value => { lastTime = value; }, expire: () => { lastTime = performance.now() - game.orderRemainingMs; } };');
const $=id=>d.getElementById(id);
function set(down=[],connected=true) {
 pads=connected?[{index:0,id:'fake-standard',mapping:'standard',connected:true,axes:[0,0],buttons:Array.from({length:16},(_,i)=>({pressed:down.includes(i)}))}]:[];
 callback(w.performance.now());
}
function press(n){set();set([n]);set();}
set([0]);assert.equal($('welcome').hidden,false);
press(0);assert.equal(d.activeElement,$('start'));press(0);assert.equal($('game').hidden,false);
const ingredient=id=>d.querySelector(`[data-ingredient="${id}"]`);
ingredient('chicken').focus();press(0);
assert.equal(ingredient('chicken').getAttribute('aria-pressed'),'true');
set([0]);for(let i=0;i<19;i++)set([0]);
assert.equal(ingredient('chicken').getAttribute('aria-pressed'),'false');
set();press(0);ingredient('rice').focus();press(0);
press(2);assert.equal($('feedback').hidden,false);
assert.match($('feedback-title').textContent,/./);
press(0);assert.equal($('feedback').hidden,true);
press(15);assert.equal(d.activeElement,ingredient('rice'));
press(9);assert.equal($('pause-layer').hidden,false);
press(9);assert.equal($('pause-layer').hidden,true);
set([],false);assert.equal($('pause-layer').hidden,false);
set([9]);assert.equal($('pause-layer').hidden,false);
press(9);assert.equal($('pause-layer').hidden,true);
ingredient('rice').focus();press(15);
assert.equal(d.activeElement,ingredient('chicken'));
assert.equal(d.body.dataset.input,'controller');
// Pause navigation must remain in the modal and support quitting/replaying.
press(9);press(14);assert.equal(d.activeElement,$('quit'));
press(15);assert.equal(d.activeElement,$('resume'));
press(15);assert.equal(d.activeElement,$('quit'));
press(15);assert.equal(d.activeElement,$('resume'));
press(14);assert.equal(d.activeElement,$('quit'));
press(0);assert.equal($('ending').hidden,false);
press(0);assert.equal(d.activeElement,$('restart'));press(0);assert.equal($('game').hidden,false);
// Hidden-tab reset ignores a button held while returning to the page.
Object.defineProperty(d,'hidden',{configurable:true,value:true});
d.dispatchEvent(new w.Event('visibilitychange'));
assert.equal($('pause-layer').hidden,false);
Object.defineProperty(d,'hidden',{configurable:true,value:false});
set([9]);assert.equal($('pause-layer').hidden,false);
press(9);assert.equal($('pause-layer').hidden,true);
// API unavailable/blocked must preserve touch operation and pause active play.
w.navigator.getGamepads=()=>{throw new Error('blocked');};
callback(w.performance.now());assert.equal($('pause-layer').hidden,false);
$('resume').click();ingredient('rice').click();
assert.equal(ingredient('rice').getAttribute('aria-pressed'),'true');
// Unsupported mappings do not produce input; touch remains available.
w.navigator.getGamepads=()=>[{index:0,id:'unknown',mapping:'',connected:true,axes:[0,0],buttons:[{pressed:true}]}];
callback(w.performance.now());assert.equal(d.querySelector('.controller-hint').hidden,true);
// Exercise the practice checkbox with controller activation on welcome.
$('pause').click();$('quit').click();$('home').click();
w.navigator.getGamepads=()=>pads;
set();$('practice').focus();press(0);assert.equal($('practice').checked,true);
$('start').focus();press(0);assert.equal($('clock-label').textContent,'PRACTICE');
// Disconnect on feedback preserves feedback through pause/resume.
ingredient('chicken').click();ingredient('rice').click();press(2);
assert.equal($('feedback').hidden,false);
set([],false);assert.equal($('pause-layer').hidden,false);
set([9]);press(9);assert.equal($('feedback').hidden,false);
// Timed game: a controller serve at the exact deadline cannot score.
$('pause').click();$('quit').click();$('home').click();$('practice').checked=false;$('start').click();
ingredient('chicken').click();ingredient('rice').click();
set();
w.clockProbe.expire();
set([2]);assert.equal($('score').textContent,'00000');assert.equal($('feedback').hidden,false);
// A stale rAF timestamp cannot move the settled clock backwards.
w.clockProbe.set(w.performance.now() + 1000);
const future=w.clockProbe.get();callback(future-100);
assert.equal(w.clockProbe.get(),future);
dom.window.close();
console.log('PASS: simulated DOM/controller selection, hold, serve, next, pause, disconnect/reconnect, focus, quit/replay, hidden-tab reset, API failure and touch fallback. No layout/hardware validation.');
