import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,vanitaMoment,VANITA_CYCLE} from '../../public/landing/artifacts/vanita.js';
const source=JSON.parse(gunzipSync(readFileSync(new URL('../../public/landing/assets/lrnmate-people/learner.bin',import.meta.url))));
test('delivery follows pickup and arrival, then resets without a return journey',()=>{
 assert.equal(vanitaMoment(0).delivered,false);assert.equal(vanitaMoment(4).carrying,false);assert.equal(vanitaMoment(6).carrying,true);
 for(let t=0;t<18.5;t+=.1)assert.equal(vanitaMoment(t).delivered,false);
 assert.equal(vanitaMoment(17).travel,1);assert.equal(vanitaMoment(19).delivered,true);assert.equal(vanitaMoment(27).opacity,0);assert.deepEqual(vanitaMoment(VANITA_CYCLE+7),vanitaMoment(7));
});
test('authored courier, visible parcel and progress can seek deterministically',()=>{
 const root=createArtifact(T,{courier:source}),actor=root.getObjectByName('vanita-courier'),parcel=root.getObjectByName('vanita-carried-parcel');
 let skinned=0,triangles=0,meshes=0;root.traverse(o=>{if(o.isSkinnedMesh)skinned++;if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));}});
 assert.ok(skinned>0);assert.ok(meshes<80,`${meshes} meshes`);assert.ok(triangles<650000,`${triangles} triangles`);
 root.userData.animate(11);const pose=actor.position.clone();assert.equal(parcel.visible,true);root.userData.animate(22);assert.equal(parcel.visible,false);assert.equal(root.getObjectByName('vanita-delivered-parcel').visible,true);root.userData.animate(11);assert.ok(actor.position.distanceTo(pose)<1e-8);root.userData.animate(0);assert.equal(root.getObjectByName('vanita-delivered-parcel').visible,false);
 console.log({meshes,triangles});
});
