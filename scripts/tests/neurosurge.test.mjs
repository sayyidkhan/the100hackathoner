import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,memoryMoment,CYCLE_SECONDS} from '../../public/landing/artifacts/neurosurge.js';

test('memory sequence hides cues before retrieval and reveals answers in order',()=>{
 assert.equal(memoryMoment(3).phase,0);
 assert.equal(memoryMoment(8).phase,1);
 assert.equal(memoryMoment(16).turn,Math.PI);
 assert.deepEqual(memoryMoment(18.9).recalled,[0,0,0]);
 assert.deepEqual(memoryMoment(20).recalled,[1,0,0]);
 assert.deepEqual(memoryMoment(21.2).recalled,[1,1,0]);
 assert.deepEqual(memoryMoment(23).recalled,[1,1,1]);
 assert.equal(memoryMoment(18.9).feedbackVisible,false);
 assert.equal(memoryMoment(23).feedbackVisible,true);
 assert.deepEqual(memoryMoment(CYCLE_SECONDS),memoryMoment(0));
 assert.deepEqual(memoryMoment(-CYCLE_SECONDS),memoryMoment(0));
});

test('the rendered scene hides all grocery answers, including the left-hand cues',()=>{
 const root=createArtifact(T);
 root.updateMatrixWorld(true);
 // Sculptures must stay in front of the card, so turning it over conceals them.
 for(let i=0;i<3;i++){
  const card=root.getObjectByName(`mnemonic-card-${i}`),inverse=card.matrixWorld.clone().invert(),point=new T.Vector3();
  root.getObjectByName(`association-sculpture-${i}`).traverse(o=>{
   if(!o.isMesh)return;const positions=o.geometry.attributes.position,transform=new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld);
   for(let j=0;j<positions.count;j++)assert(point.fromBufferAttribute(positions,j).applyMatrix4(transform).z>.06,`Card ${i} has a cue penetrating its back`);
  });
 }
 root.userData.setStep(2);
 for(const name of ['grocery-answers','grocery-produce','recall-answer-0','recall-answer-1','recall-answer-2'])assert.equal(root.getObjectByName(name).visible,false,name);
 for(let i=0;i<3;i++){const card=root.getObjectByName(`mnemonic-card-${i}`);assert.equal(card.rotation.y-card.userData.yaw,Math.PI);}
 root.userData.setStep(3);
 for(let i=0;i<3;i++)assert.equal(root.getObjectByName(`recall-answer-${i}`).visible,true);
 root.userData.setStep(0);
 assert.equal(root.getObjectByName('grocery-answers').visible,true);
 assert.equal(root.getObjectByName('grocery-produce').visible,true);
 assert.equal(root.getObjectByName('recall-answer-0').visible,false);
 root.userData.setStep(9);assert.equal(root.userData.story.index,0);
 root.userData.setStep(null,16);assert.equal(root.userData.story.index,2);
});

test('animation can seek, pause and loop without stale transforms or invalid geometry',()=>{
 const root=createArtifact(T);let vertices=0;
 root.traverse(o=>{if(o.geometry){vertices+=o.geometry.attributes.position.count;assert(Array.from(o.geometry.attributes.position.array).every(Number.isFinite));}});
 assert(vertices>10000);
 const state=t=>{root.userData.animate(t);root.updateMatrixWorld(true);const a=[];root.traverse(o=>a.push(...o.matrixWorld.elements,Number(o.visible)));return a;};
 const first=state(0);assert.notDeepEqual(state(16),first);assert.deepEqual(state(CYCLE_SECONDS),first);
 const recall=state(16);state(23);assert.deepEqual(state(16),recall);
 for(const t of [-28,.5,6,12,13.2,19,23,26.5,27.999,28,100000])assert(state(t).every(Number.isFinite));
});
