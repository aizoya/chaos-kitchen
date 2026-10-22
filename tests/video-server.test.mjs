import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { makeServer } from '../scripts/server.mjs';
test('Chef video supports bounded byte ranges, suffix seeking and HEAD for media clients', async () => {
  const server=makeServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url='http://127.0.0.1:'+server.address().port+'/public/chef-franklyn-intro-v1.mp4';
  const bytes=await readFile(new URL('../public/chef-franklyn-intro-v1.mp4',import.meta.url));
  try {
    const head=await fetch(url,{method:'HEAD'});
    assert.equal(head.headers.get('content-type'),'video/mp4');
    assert.equal(head.headers.get('accept-ranges'),'bytes');
    assert.equal(Number(head.headers.get('content-length')),bytes.length);
    assert.equal((await head.arrayBuffer()).byteLength,0);
    for (const [range,start,end] of [['bytes=0-31',0,31],['bytes=-16',bytes.length-16,bytes.length-1],['bytes=100-',100,bytes.length-1]]) {
      const r=await fetch(url,{headers:{Range:range}});
      assert.equal(r.status,206);
      assert.equal(r.headers.get('content-range'),`bytes ${start}-${end}/${bytes.length}`);
      assert.deepEqual(Buffer.from(await r.arrayBuffer()),bytes.subarray(start,end+1));
    }
    for (const range of ['bytes=99999999-','bytes=20-10','bytes=-0','bytes=-','bytes=0-2,4-6']) {
      const r=await fetch(url,{headers:{Range:range}});assert.equal(r.status,416);assert.equal((await r.arrayBuffer()).byteLength,0);
    }
  } finally {await new Promise(r=>server.close(r));}
});
