// Real media decoding, no mocked video events. Browser playback is not speaker acceptance.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { makeServer } from './server.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = makeServer();
await new Promise(r => server.listen(0, '127.0.0.1', r));
let browser;
try {
  browser = await chromium.launch({ headless:true, executablePath:process.env.CHROMIUM_PATH });
  for (const offline of [false, true]) {
    const page = await browser.newPage({ viewport:{width:390,height:650},hasTouch:true,reducedMotion:'reduce' });
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    if (offline) {
      await page.context().setOffline(true);
      await page.setContent(await readFile(new URL('../dist/Chaos-Kitchen.html',import.meta.url),'utf8'));
    } else await page.goto('http://127.0.0.1:'+server.address().port);
    const video=page.locator('#chef-intro');
    assert.equal(await video.evaluate(v=>v.paused && v.muted && v.playsInline),true);
    assert.equal(await page.locator('#chef-video-panel').evaluate(el=>el.open),false);
    await page.locator('#chef-video-panel > summary').tap();
    await video.evaluate(v=>v.play());
    await page.waitForFunction(()=>document.querySelector('#chef-intro').currentTime > 0.3);
    const media=await video.evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.code}));
    assert.equal(media.duration,12);assert.equal(media.width,540);assert.equal(media.height,720);assert.equal(media.error,undefined);
    await page.locator('#chef-video-panel > summary').tap();
    await page.waitForFunction(()=>document.querySelector('#chef-intro').paused);
    await page.locator('#chef-video-panel > summary').tap();await video.evaluate(v=>v.play());
    await page.locator('#start').tap();
    assert.equal(await video.evaluate(v=>v.paused),true,'Clock In stops video/audio');
    assert.equal(await page.locator('#game').isVisible(),true);
    assert.equal(await page.locator('.showtime-panel').count(),0,'duplicate story removed');
    await page.evaluate(() => {
      const Native = window.AudioContext;
      window.audioQA = [];
      window.AudioContext = class extends Native {
        constructor(...args) {
          super(...args);
          const analyser = this.createAnalyser(); analyser.connect(this.destination);
          const gainFactory = this.createGain.bind(this);
          this.createGain = () => {
            const gain = gainFactory(), connect = gain.connect.bind(gain);
            gain.connect = target => connect(target === this.destination ? analyser : target);
            return gain;
          };
          window.audioQA.push({ context:this, analyser });
        }
      };
    });
    await page.locator('#sound').tap();
    await page.waitForTimeout(1200); // Longer than the 260ms one-shot effect.
    const signal = await page.evaluate(() => window.audioQA.some(({context,analyser}) => {
      const data = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(data);
      return context.state === 'running' && data.some(x => Math.abs(x) > .0001);
    }));
    assert.equal(signal,true,'Sound ON starts sustained music without separate track selection');
    const soundBox = await page.locator('#sound').boundingBox(), pauseBox = await page.locator('#pause').boundingBox();
    assert.ok(soundBox.x + soundBox.width < pauseBox.x,'sound and pause have a visible gap');
    assert.equal(await page.locator('#sound').evaluate(el=>el.scrollWidth <= el.clientWidth),true,'sound label fits');
    await page.locator('#sound').tap();
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>window.audioQA.every(x=>x.context.state !== 'running' || (() => {
      const data = new Float32Array(x.analyser.fftSize); x.analyser.getFloatTimeDomainData(data);
      return data.every(v=>Math.abs(v)<.0001);
    })())),true,'Sound OFF stops music');
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({test:'chef-video-playback',offline,...media,passed:true}));
    await page.close();
  }
} finally {await browser?.close();await new Promise(r=>server.close(r));}
