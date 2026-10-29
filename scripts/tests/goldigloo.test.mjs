import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,goldiglooMoment,GOLDIGLOO_CYCLE} from '../../public/landing/artifacts/goldigloo.js';

test('screening progresses in sequence before impact and shortlist, then loops',()=>{
 assert.equal(GOLDIGLOO_CYCLE,24);
 assert.deepEqual([0,4,8,12,17].map(t=>goldiglooMoment(t).index),[0,1,2,3,4]);
 assert.deepEqual(goldiglooMoment(0).shariah,[0,0,0]);
 assert.deepEqual(goldiglooMoment(6).shariah,[1,1,0]);
 assert.deepEqual(goldiglooMoment(10).shariah,[1,1,1]);
 for(let t=0;t<12;t+=.25)assert.equal(goldiglooMoment(t).impact,0);
 for(let t=0;t<17;t+=.25)assert.equal(goldiglooMoment(t).shortlist,0);
 assert.equal(goldiglooMoment(21).shortlist,1);
 assert.deepEqual(goldiglooMoment(24),goldiglooMoment(0));
 assert.deepEqual(goldiglooMoment(-1),goldiglooMoment(23));
});

test('manual stages hold, auto resumes and shortlist badges follow completed screening',()=>{
 const model=createArtifact(T),u=model.userData;
 const badges=[0,1,2].map(i=>model.getObjectByName(`goldigloo-shortlist-check-${i}`));
 assert(badges.every(b=>b&&b.children.some(c=>c.isMesh)),'badges retain renderable meshes after batching');
 for(const t of [0,6,10,15,17,18]){u.animate(t);assert(badges.every(b=>!b.visible));}
 u.animate(21);assert(badges.every(b=>b.visible));
 for(let i=0;i<5;i++){u.setStep(i);u.animate(100);assert.equal(u.story.index,i);}
 u.setStep(9);assert.equal(u.story.index,4);u.setStep(null,0);assert.equal(u.story.index,0);
 u.animate(15);assert.equal(u.story.index,3);u.animate(24);assert(badges.every(b=>!b.visible));
});

test('mascot hand stays attached; geometry and animation are bounded and deterministic',()=>{
 const model=createArtifact(T),mascot=model.getObjectByName('goldigloo-mascot'),hand=model.getObjectByName('goldigloo-wave');
 assert.equal(hand.parent,mascot);
 let vertices=0,meshes=0;
 model.traverse(o=>{if(o.isMesh){meshes++;const a=o.geometry.attributes.position;vertices+=a.count;assert([...a.array].every(Number.isFinite));}});
 assert(meshes<130,`${meshes} meshes`);assert(vertices<450000,`${vertices} vertices`);
 const snapshot=t=>{model.userData.animate(t);model.updateMatrixWorld(true);const values=[];model.traverse(o=>values.push(o.visible,...o.matrixWorld.elements));return values;};
 const initial=snapshot(0),anchor=hand.position.toArray(),angle=hand.rotation.z;
 snapshot(1);assert.notEqual(hand.rotation.z,angle);assert.deepEqual(hand.position.toArray(),anchor);
 const pose=snapshot(19);snapshot(8);assert.deepEqual(snapshot(19),pose);assert.deepEqual(snapshot(24),initial);
 for(let t=0;t<=24;t+=.5){snapshot(t);const b=new T.Box3().setFromObject(model);assert(b.min.y>-.001);assert(b.max.y<3.3);assert(b.max.x-b.min.x<9);}
});


test('holding a story step keeps ambient motion alive; replaying a time freezes all motion',()=>{
 const model=createArtifact(T),u=model.userData,hand=model.getObjectByName('goldigloo-wave'),eye=model.getObjectByName('goldigloo-eye-0'),plant=model.getObjectByName('nestash-turbine-0');
 u.setStep(1,0);const angle=hand.rotation.z,branch=plant.quaternion.clone();
 u.animate(1);assert.equal(u.story.index,1);assert.notEqual(hand.rotation.z,angle);assert(!plant.quaternion.equals(branch));
 u.animate(3.12);assert(eye.scale.y<.1,'mascot blinks');u.animate(3.4);assert.equal(eye.scale.y,1);
 const state=()=>{model.updateMatrixWorld(true);const a=[];model.traverse(o=>a.push(o.visible,...o.matrixWorld.elements));return a;};
 const held=state();u.animate(3.4);assert.deepEqual(state(),held,'same clock value preserves pause/reduced-motion behavior');
 const scan=model.getObjectByName('goldigloo-scan-0');u.animate(.3);const y=scan.position.y;u.animate(1.4);assert(scan.position.y<y,'scan travels over the chosen row');
 assert.equal(u.story.index,1);
});

test('cards lift from the folio in sequence and settle before the loop resets',()=>{
 const model=createArtifact(T),u=model.userData,cards=[0,1,2].map(i=>model.getObjectByName(`goldigloo-company-${i}`));
 u.animate(0);const rest=cards.map(c=>({p:c.position.clone(),q:c.quaternion.clone()}));
 u.animate(17);cards.forEach((c,i)=>assert(c.position.equals(rest[i].p),'no pop at the start of the reveal'));
 u.animate(18.2);assert(cards[0].position.y-rest[0].p.y>.40);assert(cards[0].position.y-rest[0].p.y>cards[2].position.y-rest[2].p.y);
 assert(!cards[0].quaternion.equals(rest[0].q));
 u.animate(23);cards.forEach((c,i)=>{assert(c.position.distanceTo(rest[i].p)<1e-10);assert(c.quaternion.angleTo(rest[i].q)<1e-7);});
 u.setStep(4,23);u.animate(80);cards.forEach((c,i)=>assert(c.position.distanceTo(rest[i].p)<1e-10,'manual shortlist rests on the folio'));
});

test('both research routes complete before convergence and shortlist approval',()=>{
 const model=createArtifact(T),u=model.userData;
 const shariah=model.getObjectByName('goldigloo-research-signal-0-0'),impact=model.getObjectByName('goldigloo-research-signal-1-0'),junction=model.getObjectByName('goldigloo-convergence');
 const rings=[0,1,2].map(i=>model.getObjectByName(`goldigloo-impact-${i}`));
 u.animate(9);assert(!shariah.visible);assert(!impact.visible);assert(!junction.visible);assert(rings.every(o=>!o.visible));
 u.animate(10);assert(shariah.visible);assert(!impact.visible);
 u.animate(12.5);assert(rings[0].visible);assert(!rings[1].visible);assert(!rings[2].visible);
 u.animate(16);assert(impact.visible);assert(rings.every(o=>o.visible));assert(!junction.visible);
 u.animate(19);assert(junction.visible);assert(model.getObjectByName('goldigloo-shortlist-check-0').visible);
 u.animate(24);assert(!junction.visible);assert(!shariah.visible);assert(!impact.visible);assert(rings.every(o=>!o.visible));
});
