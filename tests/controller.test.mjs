import test from 'node:test';
import assert from 'node:assert/strict';
import {createControllerReader} from '../src/controller.mjs';
const pad = (down=[], axes=[0,0], mapping='standard') => ({index:0,id:'test',connected:true,mapping,axes,buttons:Array.from({length:16},(_,i)=>({pressed:down.includes(i)}))});
test('connect suppresses held buttons; press edges fire once and release rearms',()=>{
 const read=createControllerReader();
 assert.deepEqual(read([pad([0])]).actions,[]);
 assert.deepEqual(read([pad([0])]).actions,[]);
 read([pad()]);assert.deepEqual(read([pad([0])]).actions,['activate']);
 assert.deepEqual(read([pad([0])]).actions,[]);
});
test('disconnect fires once and reconnect requires fresh press',()=>{
 const read=createControllerReader();read([pad()]);
 assert.equal(read([]).disconnected,true);assert.equal(read([]).disconnected,false);
 assert.deepEqual(read([pad([2])]).actions,[]);
 read([pad()]);assert.deepEqual(read([pad([2])]).actions,['serve']);
});
test('standard mapping, deadzone, sparse pads and one-action chords',()=>{
 const read=createControllerReader();assert.equal(read([pad([],[],'')]).connected,false);
 read([null,pad()]);assert.deepEqual(read([pad([],[0.4,0])]).actions,[]);
 assert.deepEqual(read([pad([],[0.8,0])]).actions,['next']);
 read([pad()]);assert.equal(read([pad([0,2,9])]).actions.length,1);
 read([pad()]);assert.deepEqual(read([pad([9])]).actions,['pause']);
});
test('tracked controller loss pauses even with replacement; held replacement is suppressed',()=>{
 const read=createControllerReader();
 const a=pad(),b={...pad([9]),index:1,id:'second'};
 read([a,b]);
 // Stable tracked device remains active despite array order changes.
 assert.deepEqual(read([b,a]).actions,[]);
 assert.deepEqual(read([b,{...a,buttons:pad([0]).buttons}]).actions,['activate']);
 const handoff=read([null,b]);
 assert.equal(handoff.disconnected,true);assert.equal(handoff.connected,true);
 assert.deepEqual(handoff.actions,[]);
 assert.equal(read([null,b]).disconnected,false);
 read([null,{...b,buttons:pad().buttons}]);
 assert.deepEqual(read([null,b]).actions,['pause']);
});
test('visibility rearm retains nonfirst owner and suppresses held return input',()=>{
 const read=createControllerReader(),a=pad(),b={...pad(),index:1,id:'second'};
 read([b]);read.rearm();
 assert.deepEqual(read([a,{...b,buttons:pad([9]).buttons}]).actions,[]);
 read([a,b]);
 assert.deepEqual(read([a,{...b,buttons:pad([9]).buttons}]).actions,['pause']);
});
test('API outage pauses once, retains ownership and rearms recovery',()=>{
 const read=createControllerReader(),a=pad(),b={...pad(),index:1,id:'second'};
 read([b]);assert.equal(read.unavailable().disconnected,true);
 assert.equal(read.unavailable().disconnected,false);
 assert.deepEqual(read([a,{...b,buttons:pad([9]).buttons}]).actions,[]);
 read([a,b]);assert.deepEqual(read([a,{...b,buttons:pad([9]).buttons}]).actions,['pause']);
});
