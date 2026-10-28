import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,goblinMoment,GOBLIN_CYCLE} from '../../public/landing/artifacts/goblin.js';
const people=['mentor','learner'].map(n=>JSON.parse(gunzipSync(readFileSync(new URL(`../../public/landing/assets/lrnmate-people/${n}.bin`,import.meta.url)))));
test('inspection precedes each route and arrival; clean repeat',()=>{
 for(let t=0;t<12;t+=.1)assert.equal(goblinMoment(t).reuse,false);
 assert.equal(goblinMoment(7).phase,'inspect');assert.equal(goblinMoment(10).phase,'sort');assert.equal(goblinMoment(12).reuse,true);
 for(let t=0;t<26;t+=.1)assert.equal(goblinMoment(t).recycle,false);
 assert.equal(goblinMoment(26).recycle,true);assert.equal(goblinMoment(31).fade,0);assert.deepEqual(goblinMoment(GOBLIN_CYCLE+7),goblinMoment(7));
});
test('detailed figures, finite geometry and deterministic animation',()=>{
 const root=createArtifact(T,{people});let skins=0,meshes=0,triangles=0;
 root.traverse(o=>{if(o.isSkinnedMesh)skins++;if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));}});
 assert.ok(skins>=2);assert.ok(meshes<100,`${meshes} meshes`);assert.ok(triangles<750000,`${triangles} triangles`);
 const phone=root.getObjectByName('goblin-device-0'),scan=root.getObjectByName('goblin-inspection-scan');
 root.userData.animate(7);const p=phone.position.clone();assert.equal(scan.visible,true);root.userData.animate(8);assert.ok(phone.position.distanceTo(p)<1e-8);
 root.userData.animate(27);assert.equal(scan.visible,false);assert.equal(root.userData.collection.recycle,true);
 root.userData.animate(7);assert.ok(phone.position.distanceTo(p)<1e-8);root.userData.animate(31);assert.equal(phone.visible,false);
 root.userData.animate(0);assert.equal(root.userData.collection.reuse,false);console.log({meshes,triangles});
});
