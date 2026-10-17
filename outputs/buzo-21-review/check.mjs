import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1.5}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='warning'&&/bake mismatch|does not match/i.test(msg.text()))errors.push(msg.text());});page.on('console',msg=>{if(msg.type()==='error'&&/shader|WebGLProgram|FRAMEBUFFER/i.test(msg.text()))errors.push(msg.text());});await page.routeWebSocket('**',socket=>socket.close());
await page.goto('http://127.0.0.1:18485/hackathons/68/?from=landing');
const aoResponse=page.waitForResponse(response=>response.url().includes('buzo-21-ao-v2.bin'));
await page.locator('[data-mode="3d"]').click();assert.equal((await aoResponse).status(),200);await page.waitForTimeout(2200);
await page.locator('[data-pause]').click();
await page.locator('[data-project-exhibit]').screenshot({path:'outputs/buzo-21-review/3d-light.png'});
await page.evaluate(()=>{document.documentElement.dataset.theme='dark';document.dispatchEvent(new Event('site:theme-change'));});
await page.waitForTimeout(500);
await page.locator('[data-project-exhibit]').screenshot({path:'outputs/buzo-21-review/3d-dark.png'});
const canvas=page.locator('[data-project-exhibit] canvas');const frozen=await canvas.screenshot();await page.waitForTimeout(500);assert.ok(frozen.equals(await canvas.screenshot()));
// Inspect genuine geometry around the scene, not just its reference-facing side.
await canvas.focus();
for(const [name,steps] of [['side',10],['rear',14]]){
  for(let i=0;i<steps;i++)await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(300);await page.locator('[data-project-exhibit]').screenshot({path:`outputs/buzo-21-review/3d-${name}.png`});
}
await page.keyboard.press('Home');await page.waitForTimeout(200);
await page.locator('[data-pause]').click();await page.waitForTimeout(250);
const running=await canvas.screenshot();await page.waitForTimeout(300);assert.ok(!running.equals(await canvas.screenshot()),'resume should advance motion');
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
const reduced=await canvas.screenshot();await page.waitForTimeout(300);assert.ok(reduced.equals(await canvas.screenshot()),'reduced motion should stay still');
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);
await page.locator('[data-project-exhibit]').screenshot({path:'outputs/buzo-21-review/mobile.png'});
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('[data-mode="artwork"]').click();
await page.waitForFunction(()=>document.querySelector('[data-art] img').complete&&document.querySelector('[data-art] img').naturalWidth>0);
await page.setViewportSize({width:1440,height:1100});
await page.locator('[data-project-exhibit]').screenshot({path:'outputs/buzo-21-review/artwork.png'});
assert.deepEqual(errors,[]);console.log('PASS: 3D/artwork, light/dark, mobile without overflow, pause/resume, reduced motion, side/rear views, matching AO, no browser errors');await browser.close();
