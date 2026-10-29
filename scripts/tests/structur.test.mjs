import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {structurMoment,STRUCTUR_CYCLE} from '../../public/landing/artifacts/structur-timing.js';
import {createArtifact} from '../../public/landing/artifacts/structur3.js';
test('publishing requires assembled page, approval and completed deployment',()=>{
 for(let i=0;i<400;i++){const s=structurMoment(i/10);if(s.approved)assert.deepEqual(s.blocks,[1,1,1]);if(s.inbound>0)assert.ok(s.approved);if(s.deploy>0)assert.equal(s.inbound,1);if(s.outbound>0)assert.equal(s.deploy,1);if(s.live)assert.equal(s.outbound,1);}
 assert.equal(structurMoment(0).live,false);assert.equal(structurMoment(18.9).live,false);assert.equal(structurMoment(19).live,true);
 assert.deepEqual(structurMoment(22),structurMoment(22+STRUCTUR_CYCLE));assert.equal(structurMoment(39).fade,0);
});
test('reset and random seeks are deterministic and geometry stays finite',()=>{
 const model=createArtifact(T);model.userData.animate(23);assert.equal(model.userData.published,true);
 const positions=()=>{const a=[];model.traverse(o=>a.push(...o.position.toArray()));return a;};const final=positions();model.userData.animate(0);assert.equal(model.userData.published,false);model.userData.animate(23);assert.deepEqual(positions(),final);
 model.userData.animate(STRUCTUR_CYCLE);assert.equal(model.userData.story.approved,false);
 let meshes=0,triangles=0;model.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));}});console.log({meshes,triangles});assert.ok(meshes<180);assert.ok(triangles<250000);
});

test('sections move from library into stable page slots before publication',()=>{
 const m=createArtifact(T),section=m.getObjectByName('structur-section-1');
 m.userData.animate(0);assert.equal(section.visible,false);
 m.userData.animate(4);const moving=section.position.clone();assert.equal(section.visible,true);
 m.userData.animate(8);const placed=section.position.clone();assert.ok(placed.x>moving.x);assert.equal(section.scale.x,1);
 m.userData.animate(23);assert.deepEqual(section.position.toArray(),placed.toArray());
 m.userData.animate(39);assert.equal(section.visible,false);
});
