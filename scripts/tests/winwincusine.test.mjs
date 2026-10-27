import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,cuisineMoment,CUISINE_CYCLE} from '../../public/landing/artifacts/winwincusine.js';

test('all preferences arrive before a group recommendation is revealed',()=>{
 for(let t=0;t<CUISINE_CYCLE;t+=.1){
  const s=cuisineMoment(t);assert(s.count>=0&&s.count<=3);
  s.journey.forEach(v=>assert(v>=0&&v<=1));
  if(s.matched){assert.equal(s.count,3);assert(s.journey.every(v=>v===1));}
  if(s.reveal>0)assert.equal(s.count,3);
 }
 assert.deepEqual(cuisineMoment(-1),cuisineMoment(21));
 assert.deepEqual(cuisineMoment(CUISINE_CYCLE),cuisineMoment(0));
});

test('phone, preference paths and meal follow the same replayable clock',()=>{
 const model=createArtifact(T),screen=model.getObjectByName('cuisine-screen'),meal=model.getObjectByName('cuisine-shared-meal');
 for(const [t,count,state,visible] of [[0,0,'preferences',false],[3,1,'preferences',false],[5,2,'preferences',false],[7,3,'combining',false],[12,3,'matched',true],[21.5,0,'preferences',false]]){
  model.userData.animate(t);assert.equal(screen.userData.count,count);assert.equal(screen.userData.state,state);assert.equal(meal.visible,visible);
 }
 model.userData.animate(2);const token=model.getObjectByName('cuisine-preference-0'),p=token.position.toArray();assert(token.visible);
 model.userData.animate(2);assert.deepEqual(token.position.toArray(),p);
 model.userData.animate(24);assert.deepEqual(token.position.toArray(),p);
 model.userData.animate(0);assert(!model.getObjectByName('cuisine-table-halo').visible);assert(!meal.visible);
});

test('geometry and animated bounds stay finite within the miniature courtyard',()=>{
 const model=createArtifact(T);let meshes=0,vertices=0;
 model.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;assert([...o.geometry.attributes.position.array].every(Number.isFinite));}});
 assert(meshes<80,`meshes ${meshes}`);assert(vertices<230000,`vertices ${vertices}`);
 for(let t=0;t<22;t+=.5){model.userData.animate(t);const b=new T.Box3().setFromObject(model);assert(b.min.y>-.01);assert(b.max.y<4.8);assert(b.min.x>-4.7&&b.max.x<4.7);assert(b.min.z>-3&&b.max.z<3);}
});
