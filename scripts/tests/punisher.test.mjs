import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../../public/landing/vendor/three.module.js';
import {punisherMoment,PUNISHER_CYCLE} from '../../public/landing/artifacts/punisher-timing.js';
import {prepareArtifact,createArtifact} from '../../public/landing/artifacts/punisher.js';
test('approval follows task completion and review; reset returns to roles',()=>{
 for(let i=0;i<320;i++){const s=punisherMoment(i/10);if(s.approved)assert.ok(s.request&&s.done);if(s.request)assert.ok(s.done);if(s.index<2)assert.equal(s.done,false);}
 assert.equal(punisherMoment(22).request,false);assert.equal(punisherMoment(25).approved,false);assert.equal(punisherMoment(28).approved,true);assert.deepEqual(punisherMoment(PUNISHER_CYCLE),punisherMoment(0));
});
test('authored rig, finite geometry, fixed feet and deterministic phase seeking',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async u=>new Response(await readFile(u));let model;try{await prepareArtifact();model=createArtifact(T);}finally{globalThis.fetch=original;}
 const skins=[];let triangles=0;model.traverse(o=>{if(o.isSkinnedMesh)skins.push(o);if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));}});
 assert.equal(skins.length,2);assert.ok(skins.every(m=>m.skeleton.bones.length>70));assert.ok(triangles<220000);
 function state(t){model.userData.animate(t);model.updateMatrixWorld(true);return skins.flatMap(m=>m.skeleton.bones.flatMap(b=>b.matrixWorld.elements));}
 const start=state(0),feet=skins.map(m=>m.skeleton.bones.find(b=>b.name==='Bip01_L_Foot').getWorldPosition(new T.Vector3()).toArray());const action=state(10);assert.notDeepEqual(action,start);assert.deepEqual(skins.map(m=>m.skeleton.bones.find(b=>b.name==='Bip01_L_Foot').getWorldPosition(new T.Vector3()).toArray()),feet);
 assert.deepEqual(state(0),start);assert.deepEqual(state(32),start);assert.deepEqual(state(10),action);
 model.userData.animate(0);assert.equal(model.getObjectByName('grocery-delivery-0').visible,false);
 model.userData.animate(16.5);assert.ok(model.getObjectByName('grocery-delivery-0').position.y>.5);assert.equal(model.getObjectByName('grocery-delivery-2').visible,false);
 model.userData.animate(20);assert.ok(Math.abs(model.getObjectByName('grocery-delivery-2').position.y)<1e-8);assert.equal(model.getObjectByName('partner-approval-seal').visible,false);
 model.userData.animate(28);assert.equal(model.getObjectByName('partner-approval-seal').visible,true);
 model.userData.animate(4);assert.ok(model.getObjectByName('role-token-1').scale.x>2);
 model.userData.setStep(3,10);model.userData.animate(15);assert.equal(model.userData.story.approved,true);model.userData.setStep(0,14);model.userData.animate(14);assert.equal(model.userData.story.done,false);
});
