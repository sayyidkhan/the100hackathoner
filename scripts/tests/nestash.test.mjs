import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,nestashMoment,NESTASH_CYCLE} from '../../public/landing/artifacts/nestash.js';

test('search precedes selection; shortlist appears only after inspection',()=>{
 const r=createArtifact(T),card=r.getObjectByName('nestash-shortlist'),selection=r.getObjectByName('nestash-selection-0');
 for(const [t,index,chosen,saved] of [[0,0,false,false],[6,1,false,false],[12,2,true,false],[18,3,true,true]]){
  r.userData.animate(t);assert.equal(r.userData.story.index,index);assert.equal(r.getObjectByName('nestash-screen').userData.phase,index);assert.equal(selection.visible,chosen);assert.equal(card.visible,saved);
 }
 assert.equal(nestashMoment(4.9).query,0);assert.equal(nestashMoment(16.9).saved,0);assert.equal(nestashMoment(20).saved,1);
 assert.deepEqual(nestashMoment(0),nestashMoment(NESTASH_CYCLE));
});
test('repeated times are stable and manual stages resume continuously',()=>{
 const r=createArtifact(T);
 const snapshot=t=>{r.userData.animate(t);r.updateMatrixWorld(true);const out=[];r.traverse(o=>out.push(o.visible,...o.matrixWorld.elements));return out;};
 const before=snapshot(8.5);snapshot(19);assert.deepEqual(snapshot(8.5),before);
 r.userData.setStep(2,35);const hold=snapshot(35);assert.deepEqual(snapshot(41),hold);r.userData.setStep(null,41);assert.deepEqual(snapshot(41),hold);assert.notDeepEqual(snapshot(42),hold);
 const stage=r.userData.story.index;r.userData.setStep(8,42);assert.equal(r.userData.story.index,stage);
});
test('geometry is finite, bounded and batched for the shared renderer',()=>{
 const r=createArtifact(T);let count=0,triangles=0;
 r.traverse(o=>{if(!o.isMesh)return;count++;const g=o.geometry;triangles+=(g.index?.count??g.attributes.position.count)/3;for(const a of Object.values(g.attributes))assert(a.array.every(Number.isFinite));if(g.index)assert(g.index.array.every(i=>i>=0&&i<g.attributes.position.count));});
 assert(count<85,`${count} meshes`);assert(triangles<250000,`${triangles} triangles`);
 const b=new T.Box3().setFromObject(r),size=b.getSize(new T.Vector3());assert(size.x<8);assert(size.y<4);assert(size.z<5);
 assert.equal(r.userData.artifactId,12);assert.equal(r.userData.autoOrbit,false);assert.equal(r.userData.realTimeAnimation,true);
});
