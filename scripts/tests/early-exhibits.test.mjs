import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact as pest} from '../../public/landing/artifacts/pestoverflow.js';
import {createArtifact as grab} from '../../public/landing/artifacts/grabhunt.js';
for(const [title,create,cycle] of [['PestOverflow',pest,14],['GrabHunt',grab,16]]){
 test(`${title}: finite geometry, seekable motion and a seamless cycle`,()=>{
  const root=create(T);let vertices=0;
  root.traverse(o=>{if(o.isMesh){assert(o.material);const p=o.geometry.attributes.position;vertices+=p.count;assert(Array.from(p.array).every(Number.isFinite));}});
  assert(vertices>15000);assert(root.userData.realTimeAnimation);
  const state=t=>{root.userData.animate(t);root.updateMatrixWorld(true);const a=[];root.traverse(o=>a.push(o.visible?1:0,...o.matrixWorld.elements));return a;};
  const start=state(0);assert.deepEqual(state(cycle),start);const action=state(5.3);assert.notDeepEqual(action,start);state(11);assert.deepEqual(state(5.3),action);
  for(let t=0;t<cycle;t+=.1)assert(state(t).every(Number.isFinite));
 });
}

test('PestOverflow has a recessed enclosure and keeps resting paws planted',()=>{
 const root=pest(T);root.userData.animate(5.5);root.updateMatrixWorld(true);
 const depth=x=>new T.Raycaster(new T.Vector3(x,1.8,5),new T.Vector3(0,0,-1)).intersectObject(root,true)[0].point.z;
 assert(depth(.96)-depth(0)>.45,'the electronics enclosure must be an open cavity, not a flat dark panel');
 const mouse=root.getObjectByName('pestoverflow-field-mouse');
 assert(mouse.getObjectByName('mouse-continuous-coat').geometry.attributes.color,'sculpted coat retains its fur colouring');
 const paws=mouse.children.filter(o=>o.name.includes('-paw-'));
 assert.equal(paws.length,4);
 const rest=paws.map(o=>o.position.toArray());root.userData.animate(8);
 assert.deepEqual(paws.map(o=>o.position.toArray()),rest,'idle animation must not slide the feet');
 root.userData.animate(1.5);assert.notDeepEqual(paws.map(o=>o.position.toArray()),rest,'paws articulate while approaching the sensor');
});
