import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,mailboxMoment,MAILBOX_CYCLE} from '../../public/landing/artifacts/mailbox.js';

test('delivery precedes detection, transmission and the resident notification',()=>{
 assert.equal(MAILBOX_CYCLE,20);
 for(let time=0;time<20;time+=.1){
  const s=mailboxMoment(time);
  for(const key of ['insert','drop','letterOpacity'])assert(s[key]>=0&&s[key]<=1);
  if(s.detected)assert.equal(s.insert,1);
  if(s.transmitting)assert(s.detected);
  if(s.notified){assert(s.detected);assert(!s.transmitting);assert.equal(s.drop,1);}
 }
 assert.deepEqual(mailboxMoment(-1),mailboxMoment(19));assert.deepEqual(mailboxMoment(20),mailboxMoment(0));
});

test('letter, sensor and phone all follow the same clock, including pause and replay',()=>{
 const model=createArtifact(T),u=model.userData,letter=model.getObjectByName('mailbox-delivery-letter'),beam=model.getObjectByName('mailbox-detection-beam'),pulse=model.getObjectByName('mailbox-notification-pulse'),screen=model.getObjectByName('mailbox-phone-screen');
 for(const [time,state,detect,send] of [[0,'waiting',false,false],[3,'waiting',false,false],[6,'waiting',true,false],[8,'sending',true,true],[12,'notified',true,false],[19,'waiting',false,false]]){
  u.animate(time);assert.equal(screen.userData.state,state);assert.equal(beam.visible,detect);assert.equal(pulse.visible,send);
  const matrix=letter.matrix.clone(),pos=letter.position.toArray();u.animate(time);assert.deepEqual(letter.position.toArray(),pos);assert.deepEqual(letter.matrix,matrix);
 }
 u.animate(8);const pos=pulse.position.toArray();u.animate(28);assert.deepEqual(pulse.position.toArray(),pos);
 u.animate(0);assert(!letter.visible);assert(!beam.visible);assert.equal(screen.userData.state,'waiting');
});

test('exhibit stays finite and bounded throughout a delivery with a small render budget',()=>{
 const model=createArtifact(T);let meshes=0,vertices=0;
 model.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;assert([...o.geometry.attributes.position.array].every(Number.isFinite));}});
 assert(meshes<65,`meshes ${meshes}`);assert(vertices<160000,`vertices ${vertices}`);
 for(let time=0;time<20;time+=.4){model.userData.animate(time);const b=new T.Box3().setFromObject(model);assert(b.min.y>-.02);assert(b.max.y<4.1);assert(b.max.x<4.2);assert(b.min.x> -4.2);}
});
