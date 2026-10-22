import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createShopWalk} from '../../public/landing/artifacts/scaleup-people.js';
import {createScaleup} from '../../public/landing/artifacts/scaleup-evolution.js';

test('Customer circuit stays on the pavement, clears the shop, and keeps people apart',()=>{
  const walk=createShopWalk(T);
  for(let t=0;t<108;t+=.15){
    const poses=[0,1,2].map(i=>walk(t,i));
    poses.forEach((p,i)=>{
      assert.ok(Object.values(p).every(Number.isFinite));
      assert.ok(Math.abs(p.x)<2.45 && p.z>-1.5 && p.z<2.48,'Customer stays inside pavement');
      assert.ok(Math.abs(p.x)>1.45 || p.z<-.76 || p.z>2.1,'Customer clears café and terrace furniture');
      poses.slice(i+1).forEach(q=>assert.ok(Math.hypot(p.x-q.x,p.z-q.z)>.50,'Customers remain separated'));
    });
  }
  assert.equal(walk(1).stride,0,'Customer pauses outside café');
  assert.deepEqual(walk(0),walk(54),'Loop joins without teleporting');
});
for(let edition=0;edition<3;edition++)test(`Edition ${edition+1}: customers animate, reset and remain visible through stage changes`,()=>{
  const model=createScaleup(T,edition),crowd=model.getObjectByName('shop-customers');
  const snapshot=()=>{model.updateMatrixWorld(true);const out=[];crowd.traverse(o=>out.push(...o.matrixWorld.elements));return out;};
  assert.equal(crowd.children.length,3);
  const initial=snapshot();model.userData.animate(7);assert.notDeepEqual(snapshot(),initial);
  model.userData.animate(0);assert.deepEqual(snapshot(),initial);
  for(let stage=0;stage<3;stage++){
    model.userData.setStep(stage,10);assert.equal(crowd.visible,true);
    const paused=snapshot();model.userData.animate(10);assert.deepEqual(snapshot(),paused);
  }
});
