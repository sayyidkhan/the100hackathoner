import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact} from '../../public/landing/artifacts/amigo.js';

test('Amigo geometry is finite and its conversation has a deterministic seamless loop',()=>{
 const root=createArtifact(T);let vertices=0;
 root.traverse(o=>{if(!o.isMesh)return;assert(o.material);const p=o.geometry.attributes.position;vertices+=p.count;for(const v of p.array)assert(Number.isFinite(v));});
 assert(vertices>100000);assert(root.userData.realTimeAnimation);assert.equal(root.userData.artifactId,26);
 const state=t=>{root.userData.animate(t);root.updateMatrixWorld(true);const a=[];root.traverse(o=>a.push(o.visible?1:0,...o.matrixWorld.elements));return a;};
 const initial=state(0);assert.deepEqual(state(14),initial);
 const greeting=state(2.5),reply=state(6.5),card=state(10);
 assert.notDeepEqual(greeting,initial);assert.notDeepEqual(reply,greeting);assert.notDeepEqual(card,reply);
 state(12);assert.deepEqual(state(2.5),greeting);
 for(let t=0;t<28;t+=.1)assert(state(t).every(Number.isFinite));
});
