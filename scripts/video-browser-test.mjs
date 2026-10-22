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
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({test:'chef-video-playback',offline,...media,passed:true}));
    await page.close();
  }
} finally {await browser?.close();await new Promise(r=>server.close(r));}
