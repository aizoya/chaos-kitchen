import test from 'node:test';
import assert from 'node:assert/strict';
import {INGREDIENTS, TICKETS, COOKING} from '../src/content.mjs';
import {createGame, dispatch, HEAT, pantryFor, ticketDuration} from '../src/engine.mjs';
const act = (s, type, more={}) => dispatch(s,{type,...more});
function prep(s, ids=['chicken','rice']) {
  for (const id of ids) { s=act(s,'TOGGLE',{id}); s=act(s,'PREP',{id}); s=act(s,'PREP',{id}); }
  return act(s,'HANDOFF');
}
test('Chef cannot skip prep, cook or plating; complete plate scores',()=>{
  let s=createGame({chefMode:true});
  assert.equal(act(s,'HANDOFF'),s);
  s=prep(s); assert.equal(s.station,'cook');
  assert.equal(act(s,'SERVE'),s);
  assert.equal(act(s,'HANDOFF'),s);
  assert.equal(act(s,'TOGGLE',{id:'beans'}),s);
  for (const id of s.selected) {
    s=act(s,'COOK',{id}); s=act(s,'TICK',{ms:HEAT[id]});
    assert.equal(s.cooking[id].state,'ready'); s=act(s,'STOP_COOK');
  }
  s=act(s,'HANDOFF'); assert.equal(s.station,'plate');
  assert.equal(act(s,'SERVE'),s);
  for(const id of s.selected) s=act(s,'PLATE',{id});
  s=act(s,'SERVE'); assert.equal(s.result.correct,true);
  s=act(s,'NEXT'); assert.equal(s.station,'prep'); assert.deepEqual(s.plated,[]);
});
test('early stop, one pan, burn boundary, remake and pause',()=>{
  let s=prep(createGame({chefMode:true,practice:true}));
  s=act(s,'COOK',{id:'chicken'});
  assert.equal(act(s,'COOK',{id:'rice'}),s);
  s=act(s,'TICK',{ms:2399}); s=act(s,'STOP_COOK'); assert.equal(s.cooking.chicken.state,'early');
  s=act(s,'COOK',{id:'chicken'}); s=act(s,'PAUSE');
  assert.equal(act(s,'TICK',{ms:10000}),s);
  s=act(s,'RESUME'); s=act(s,'TICK',{ms:4000});
  assert.equal(s.cooking.chicken.state,'burnt'); assert.equal(s.activePan,null);
  s=act(s,'COOK',{id:'chicken'}); assert.equal(s.cooking.chicken.ms,0);
});
test('station clock expires and handoff never restores total order time',()=>{
  let s=createGame({chefMode:true,difficulty:'hard'});
  const duration=ticketDuration(s);
  s=act(s,'TICK',{ms:1000}); s=prep(s);
  assert.equal(s.orderRemainingMs,duration-1000);
  s=act(s,'TICK',{ms:24000}); assert.equal(s.status,'feedback');
  assert.equal(s.result.title,'STATION TIMED OUT'); assert.equal(s.result.points,0);
});
test('shuffling is reproducible, complete, stable within ticket; difficulty clamps',()=>{
  const s=createGame({chefMode:true,difficulty:'hard',seed:42});
  assert.deepEqual(pantryFor(s),pantryFor({...s,score:900}));
  assert.equal(new Set(pantryFor(s)).size,INGREDIENTS.length);
  assert.notDeepEqual(pantryFor(s),pantryFor({...s,index:1}));
  assert.equal(createGame({difficulty:'nonsense'}).difficulty,'easy');
  assert.ok(ticketDuration({...s,difficulty:'easy'}) > ticketDuration(s));
  assert.equal(ticketDuration({...s,difficulty:'easy'}),72000);
  assert.equal(ticketDuration({...s,difficulty:'medium'}),62000);
  assert.equal(ticketDuration(s),52000);
});
test('safe tutorial never burns or times out and ends after its first plate',()=>{
  let s=prep(createGame({tutorial:true}));
  for (const id of s.selected) {
    s=act(s,'COOK',{id}); s=act(s,'TICK',{ms:999999});
    assert.equal(s.cooking[id].state,'ready');
    assert.equal(s.status,'playing');
    s=act(s,'STOP_COOK');
  }
  s=act(s,'HANDOFF');
  for(const id of s.selected) s=act(s,'PLATE',{id});
  s=act(s,'SERVE'); assert.equal(s.result.correct,true);
  s=act(s,'NEXT'); assert.equal(s.status,'ended');
});
test('every expanded recipe can prep cook plate and score with method metadata',()=>{
  for(const ticket of TICKETS) {
    let s=createGame({chefMode:true,practice:true});
    s={...s,deck:[ticket.id]};
    s=prep(s,[...ticket.required,...ticket.optional]);
    for(const id of s.selected.filter(id=>HEAT[id])) {
      assert.equal(COOKING[id].prep.length,2);
      s=act(s,'COOK',{id}); s=act(s,'TICK',{ms:HEAT[id]}); s=act(s,'STOP_COOK');
    }
    s=act(s,'HANDOFF');
    for(const id of s.selected) s=act(s,'PLATE',{id});
    s=act(s,'SERVE'); assert.equal(s.result?.correct,true,ticket.id);
  }
});
test('practice freezes deadlines but not the cooking gauge; removed prep is discarded',()=>{
  let s=createGame({chefMode:true,practice:true});
  s=act(s,'TOGGLE',{id:'rice'}); s=act(s,'PREP',{id:'rice'});
  s=act(s,'TOGGLE',{id:'rice'}); assert.equal(s.prepped.rice,undefined);
  s=prep(s); const time=s.remainingMs;
  s=act(s,'COOK',{id:'rice'}); s=act(s,'TICK',{ms:3000});
  assert.equal(s.remainingMs,time); assert.equal(s.cooking.rice.state,'ready');
});
