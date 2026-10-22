import assert from 'node:assert/strict';
import test from 'node:test';
import * as T from '../../public/landing/vendor/three.module.js';
import {createScaleup} from '../../public/landing/artifacts/scaleup-evolution.js';

function signature(model) {
  model.updateMatrixWorld(true);
  const state=[];
  model.traverseVisible(o=>{if(o.isMesh)state.push(...o.matrixWorld.elements);});
  return state;
}
for(let edition=0;edition<3;edition++)test(`edition ${edition+1}: stage selection, deterministic motion and finite geometry`,()=>{
  const model=createScaleup(T,edition);
  assert.equal(model.userData.currentStage,edition);
  assert.equal(model.userData.displayBase,false);
  model.traverse(o=>{if(o.isMesh){assert.ok(o.material);assert.ok(Array.from(o.geometry.attributes.position.array).every(Number.isFinite));}});
  const counts=[];
  for(let stage=0;stage<3;stage++){
    model.userData.setStep(stage,4);assert.equal(model.userData.story.index,stage);
    const atFour=signature(model);counts.push(atFour.length);
    model.userData.animate(7);assert.notDeepEqual(signature(model),atFour);
    model.userData.animate(4);assert.deepEqual(signature(model),atFour);
  }
  assert.ok(counts[1]>counts[0],'platform adds visible geometry');
  assert.ok(counts[2]>counts[1],'VR adds visible geometry');
  model.userData.setStep(edition,20);model.userData.setStep(null,20);
  model.userData.animate(29.1);assert.equal(model.userData.currentStage,(edition+1)%3);
  model.userData.animate(38.1);assert.equal(model.userData.currentStage,(edition+2)%3);
  model.userData.setStep(0,40);model.userData.animate(100);assert.equal(model.userData.currentStage,0);
  model.userData.setStep(99,100);assert.equal(model.userData.currentStage,0);
});
