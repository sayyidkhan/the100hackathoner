import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import { createArtifact, gymMoment } from '../../public/landing/artifacts/mynextgym.js';

test('MyNextGym moves from district analysis to a candidate site before pin landing', () => {
  const model=createArtifact(T),pin=model.getObjectByName('mynextgym-pin'),route=model.getObjectByName('mynextgym-route');
  model.userData.animate(3);assert.equal(model.userData.story.phase,'district');assert.equal(pin.visible,false);assert.equal(route.visible,false);
  model.userData.animate(9);assert.equal(model.userData.story.phase,'subdistrict');assert.equal(pin.visible,false);assert.equal(route.visible,true);
  model.userData.animate(11);const approach=pin.position.y;assert.equal(pin.visible,true);assert.equal(route.visible,false);
  model.userData.animate(13);assert.ok(pin.position.y<approach);assert.equal(model.userData.story.phase,'selected');
  model.userData.animate(19);assert.equal(pin.visible,false);
  assert.deepEqual(gymMoment(20),gymMoment(0));
});
test('MyNextGym meshes and animation are finite, deterministic and free from loop drift',()=>{
  const model=createArtifact(T);let meshes=0;
  model.traverse(o=>{if(o.isMesh){meshes++;assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));}});
  assert.ok(meshes<45,'static architectural details are batched');
  const state=t=>{model.userData.animate(t);model.updateMatrixWorld(true);const v=[];model.traverse(o=>v.push(o.visible,...o.matrixWorld.elements));return v;};
  const first=state(9);assert.notDeepEqual(first,state(13));assert.deepEqual(first,state(9));assert.deepEqual(state(0),state(20));
  for(let t=0;t<=40;t+=.25){const v=state(t);assert.ok(v.every(x=>typeof x==='boolean'||Number.isFinite(x)));}
  assert.ok(new T.Box3().setFromObject(model).min.y>=-.001);
});

test('the architectural cutaway exposes both treadmill decks and keeps the data board subordinate',()=>{
  const model=createArtifact(T);model.updateMatrixWorld(true);
  for(const x of [-3.09,-2.53]){
    const hits=new T.Raycaster(new T.Vector3(x,5,1.55),new T.Vector3(0,-1,0)).intersectObject(model,true);
    assert.ok(hits.length>0);
    assert.ok(hits[0].point.y<.8,'no solid roof obscures the equipment from above');
    assert.equal(hits[0].object.material.color.getHex(),0x262d29,'first surface is the rubber treadmill deck');
  }
  const bounds=new T.Box3().setFromObject(model);
  assert.ok(bounds.max.y<2.7,'analytics board does not tower over the district');
  let vertices=0;model.traverse(o=>{if(o.isMesh)vertices+=o.geometry.attributes.position.count;});
  assert.ok(vertices<450000,'fine architectural detail stays within a bounded geometry budget');
});
