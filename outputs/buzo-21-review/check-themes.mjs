import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1.5});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(/shader|WebGLProgram|bake mismatch|does not match this geometry/i.test(m.text()))errors.push(m.text());});
await page.routeWebSocket('**',s=>s.close());
await page.goto('http://127.0.0.1:18485/hackathons/68/?from=landing');
const theme=page.locator('#theme-toggle'),exhibit=page.locator('[data-project-exhibit]');
const currentArt=()=>page.locator('[data-art] img').evaluate(img=>img.currentSrc);
const ready=()=>page.waitForFunction(()=>{const i=document.querySelector('[data-art] img');return i.complete&&i.naturalWidth>0;});
await ready();const day=await currentArt();assert.match(day,/day-v3/);
await exhibit.screenshot({path:'outputs/buzo-21-review/artwork-light-theme.png'});
await theme.click();await page.waitForFunction(()=>document.querySelector('[data-art] img').currentSrc.includes('night-v2'));await ready();
assert.notEqual(await currentArt(),day);await exhibit.screenshot({path:'outputs/buzo-21-review/artwork-dark-theme.png'});
await page.locator('[data-mode="3d"]').click();await page.waitForTimeout(1600);
await page.locator('[data-pause]').click();
const canvas=page.locator('[data-project-exhibit] canvas');await canvas.press('ArrowLeft');await canvas.press('Tab');await page.waitForTimeout(300);
const night=await canvas.screenshot();await exhibit.screenshot({path:'outputs/buzo-21-review/3d-dark-theme.png'});
await theme.click();await page.waitForTimeout(250);
assert.equal(await page.locator('[data-mode="3d"]').getAttribute('aria-pressed'),'true');
assert.equal(await page.locator('[data-pause]').getAttribute('aria-pressed'),'true');
const daylight=await canvas.screenshot();assert.ok(!night.equals(daylight));
await exhibit.screenshot({path:'outputs/buzo-21-review/3d-light-theme.png'});
await theme.click();await page.waitForTimeout(250);await writeFile('outputs/buzo-21-review/theme-roundtrip-before.png',night);await canvas.screenshot({path:'outputs/buzo-21-review/theme-roundtrip-after.png'});
// Compare pixels with a small tolerance for fractional CSS-pixel screenshot edges.
execFileSync('python3',['-c',`from PIL import Image,ImageChops,ImageStat
a=Image.open('outputs/buzo-21-review/theme-roundtrip-before.png').convert('RGB')
b=Image.open('outputs/buzo-21-review/theme-roundtrip-after.png').convert('RGB')
assert a.size==b.size
assert max(ImageStat.Stat(ImageChops.difference(a,b)).mean)<.25, 'Theme round trip changed camera or lighting'`]);
await exhibit.screenshot({path:'outputs/buzo-21-review/3d-dark-theme.png'});
await page.locator('[data-mode="artwork"]').click();await ready();assert.match(await currentArt(),/night-v2/);
await page.setViewportSize({width:390,height:844});await theme.click();await ready();
await page.locator('[data-mode="3d"]').click();await page.waitForTimeout(200);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await exhibit.screenshot({path:'outputs/buzo-21-review/mobile-light-theme.png'});
assert.deepEqual(errors,[]);console.log('PASS: distinct day/night artwork, 3D theme round trip preserves camera and pause, mobile layout, no shader/AO errors');
await browser.close();
