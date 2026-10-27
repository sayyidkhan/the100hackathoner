import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,vainsterMoment,VAINSTER_CYCLE} from '../../public/landing/artifacts/vainster.js';
const portrait=JSON.parse(fs.readFileSync(new URL('../../public/landing/assets/vainster/portrait.json',import.meta.url)));
const create=()=>createArtifact(T,{portrait});
test('scan precedes observations; journal appears only after mapping and resets each cycle',()=>{
 const r=create(),screen=r.getObjectByName('vainster-weekly-screen');
 r.userData.animate(0);assert(!r.getObjectByName('vainster-scan').visible);assert(!r.getObjectByName('vainster-landmarks').visible);assert(!r.getObjectByName('vainster-regions').visible);assert.equal(screen.userData.entries,0);
 r.userData.animate(8);assert(r.getObjectByName('vainster-scan').visible);assert(r.getObjectByName('vainster-landmarks').visible);assert(!r.getObjectByName('vainster-regions').visible);assert.equal(screen.userData.entries,0);
 r.userData.animate(16);assert(!r.getObjectByName('vainster-scan').visible);assert(r.getObjectByName('vainster-regions').visible);assert.equal(screen.userData.entries,0);
 r.userData.animate(25);assert.equal(screen.userData.entries,7);assert.deepEqual(vainsterMoment(0),vainsterMoment(VAINSTER_CYCLE));r.userData.animate(28);assert.equal(screen.userData.entries,0);
});
test('manual steps hold a pose and autoplay resumes continuously; arbitrary seeking is deterministic',()=>{
 const r=create();const snap=t=>{r.userData.animate(t);r.updateMatrixWorld(true);const out=[];r.traverse(o=>out.push(o.visible,...o.matrixWorld.elements,...(o.isLine?o.geometry.attributes.position.array:[])));return out;};
 const a=snap(8.5);snap(24);assert.deepEqual(snap(8.5),a);r.userData.setStep(1,31);const held=snap(31);assert.deepEqual(snap(51),held);r.userData.setStep(null,51);assert.deepEqual(snap(51),held);assert.notDeepEqual(snap(52),held);
});
test('real mesh has symmetric facial coverage, finite geometry and bounded render cost',()=>{
 const r=create();let meshes=0,triangles=0;r.traverse(o=>{if(!o.isMesh)return;meshes++;const g=o.geometry;triangles+=(g.index?.count??g.attributes.position.count)/3;for(const a of Object.values(g.attributes))assert(a.array.every(Number.isFinite));if(g.index)assert(g.index.array.every(i=>i>=0&&i<g.attributes.position.count));});
 const nodes=r.getObjectByName('vainster-landmarks').children.filter(o=>o.geometry?.type==='SphereGeometry');assert(nodes.some(n=>n.position.x<-.5));assert(nodes.some(n=>n.position.x>.5));assert(nodes.some(n=>n.position.y>2.4));
 assert(r.getObjectByName('vainster-detailed-face').geometry.index.count/3>50000);assert(meshes<130);assert(triangles<350000);assert.equal(r.userData.autoOrbit,false);assert.equal(r.userData.realTimeAnimation,true);
});
