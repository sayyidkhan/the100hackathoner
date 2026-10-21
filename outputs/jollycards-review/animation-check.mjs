import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1200,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:18481/hackathons/48/',{waitUntil:'networkidle'});
const model=await page.evaluate(async()=>{
 const T=await import('/landing/vendor/three.module.js');const {createArtifact}=await import('/landing/artifacts/jollycards.js');const model=createArtifact(T);
 const sample=t=>{model.userData.animate(t);const state=[];model.traverse(o=>{state.push(...o.position.toArray(),...o.rotation.toArray().slice(0,3),...o.scale.toArray());});return state;};
 const a=sample(0),b=sample(4),c=sample(4),d=sample(9);return {moves:a.some((v,i)=>Math.abs(v-b[i])>1e-5),deterministic:JSON.stringify(b)===JSON.stringify(c),finite:d.every(Number.isFinite)};
});assert.ok(model.moves&&model.deterministic&&model.finite);
await page.getByRole('button',{name:'Explore in 3D',exact:true}).click();const stage=page.locator('[data-scene]');await stage.waitFor({state:'visible'});await stage.scrollIntoViewIfNeeded();await page.waitForTimeout(500);
const a=await stage.screenshot();await page.waitForTimeout(400);const b=await stage.screenshot();assert.ok(!a.equals(b),'animation should move');
await page.locator('[data-pause]').click();await page.waitForTimeout(150);const c=await stage.screenshot();await page.waitForTimeout(350);const d=await stage.screenshot();assert.ok(c.equals(d),'pause should freeze');
await page.locator('[data-reset]').click();await page.locator('[data-scene] canvas').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Home');
await page.locator('[data-project-exhibit]').screenshot({path:'outputs/jollycards-review/animated.png'});
await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:'Explore in 3D',exact:true}).click();await stage.waitFor({state:'visible'});await stage.scrollIntoViewIfNeeded();await page.waitForTimeout(200);const e=await stage.screenshot();await page.waitForTimeout(300);const f=await stage.screenshot();assert.ok(e.equals(f),'reduced motion should freeze');assert.ok(await page.locator('[data-pause]').isDisabled());assert.deepEqual(errors,[]);
console.log(JSON.stringify({model,liveMotion:true,pauseFreezes:true,reducedMotionFreezes:true,errors}));await browser.close();
