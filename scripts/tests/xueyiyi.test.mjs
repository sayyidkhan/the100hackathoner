import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
for (const edition of [1,2]) test(`Xueyiyi ${edition}: bounded geometry, stage inspection and deterministic animation`,async()=>{
 const {createArtifact}=await import(`../../public/landing/artifacts/xueyiyi-v${edition}.js`);const m=createArtifact(T);
 assert.equal(m.userData.artifactId,edition);let vertices=0;
 m.traverse(o=>{if(o.isMesh){vertices+=o.geometry.attributes.position.count;for(const a of Object.values(o.geometry.attributes))assert.ok(a.array.every(Number.isFinite));}});
 assert.ok(vertices<500000);const size=new T.Box3().setFromObject(m).getSize(new T.Vector3());assert.ok(size.x<9&&size.y<5&&size.z<5);
 const state=t=>{m.userData.animate(t);m.updateMatrixWorld(true);const s=[];m.traverse(o=>s.push(o.visible,...o.matrixWorld.elements));return s;};
 const start=state(0);assert.deepEqual(state(24),start);
 for(let i=0;i<4;i++){state(i*6+3);assert.equal(m.userData.story.index,i);assert.ok(m.userData.story.detail.length>10);}
 const at8=state(8);state(19);assert.deepEqual(state(8),at8);
 m.userData.setStep(2,30);const fixed=state(30);assert.equal(m.userData.story.index,2);assert.deepEqual(state(60),fixed);
 m.userData.setStep(null,60);assert.deepEqual(state(60),fixed);assert.notDeepEqual(state(68),fixed);
});
