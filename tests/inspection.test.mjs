import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, dispatch, ticketFor, HEAT } from '../src/engine.mjs';
import { inspectionResult, nextShiftGoal } from '../src/showtime.mjs';

function run({ bonus = true, failFirst = false } = {}) {
  let s = createGame({ inspection:true, practice:true, difficulty:'hard' });
  const act = (type, more={}) => { s=dispatch(s,{type,...more}); };
  assert.equal(s.chefMode,true);assert.equal(s.practice,false);assert.equal(s.difficulty,'easy');
  for(let i=0;i<3;i++) {
    const t=ticketFor(s), ids=[...t.required,...(bonus?t.optional:[])];
    if(failFirst && i===0) act('TICK',{ms:999999});
    else {
      for(const id of ids) {act('TOGGLE',{id});act('PREP',{id});act('PREP',{id});}
      act('HANDOFF');
      for(const id of ids.filter(id=>HEAT[id])) {act('COOK',{id});act('TICK',{ms:HEAT[id]});act('STOP_COOK');}
      act('HANDOFF');for(const id of ids)act('PLATE',{id});act('SERVE');
    }
    assert.equal(s.status,'feedback');
    assert.equal(inspectionResult(s).earned,false,'feedback does not award an early inspection star');
    const before=s;act('SERVE');assert.equal(s,before,'duplicate serving is inert');
    act('NEXT');
    assert.equal(s.status,i===2?'ended':'playing');
  }
  return s;
}
test('inspection requires three completed correct tickets and awards an earned fictional star',()=>{
  const s=run();assert.equal(s.served,3);assert.equal(inspectionResult(s).earned,true);
  const replay=createGame({inspection:true});assert.equal(replay.score,0);assert.equal(inspectionResult(replay).earned,false);
});
test('missing bonuses or a failed inspection ticket never earns the star',()=>{
  assert.equal(inspectionResult(run({bonus:false})).earned,false);
  assert.equal(inspectionResult(run({failFirst:true})).earned,false);
});
test('inspection timeout and early exit remain losses; tutorial never enables inspection',()=>{
  let s=createGame({inspection:true});s=dispatch(s,{type:'TICK',ms:999999});
  assert.equal(s.status,'feedback');assert.equal(s.missed,1);
  assert.equal(inspectionResult({...s,status:'ended'}).earned,false);
  assert.equal(inspectionResult({...createGame({inspection:true}),status:'ended'}).earned,false);
  assert.equal(createGame({inspection:true,tutorial:true}).inspection,false);
});
test('replay goals are fixed independent values derived from completed outcomes',()=>{
  const previous={served:2,perfect:1,missed:0};const g=nextShiftGoal(previous);
  assert.deepEqual(g,{metric:'perfect',target:2,label:'Earn 2 flavor bonuses'});
  previous.perfect=10;assert.equal(g.target,2);
  assert.equal(nextShiftGoal({served:0,missed:2}).target,1);
});
