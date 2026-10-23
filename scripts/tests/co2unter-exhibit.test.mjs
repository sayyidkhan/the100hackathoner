import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact} from '../../public/landing/artifacts/co2unter.js';

test('CO2unter has finite geometry and a deterministic data-to-comparison sequence',()=>{
 const root=createArtifact(T),packet=root.getObjectByName('co2unter-conversion-packet');
 const land=root.getObjectByName('co2unter-earth-land');assert(land.geometry.attributes.position.count>10000);assert(land.geometry.attributes.position.count<200000,'coastline tessellation stays bounded');
 const lp=land.geometry.attributes.position;for(let i=0;i<lp.count;i++){const length=Math.hypot(lp.getX(i),lp.getY(i),lp.getZ(i));assert(Math.abs(length-1.135)<1e-5,'coastlines stay on globe surface');}
 root.traverse(o=>{if(o.isMesh){assert(o.geometry.attributes.position.array.every(Number.isFinite));assert(o.geometry.attributes.normal.array.every(Number.isFinite));}});
 const state=t=>{root.userData.animate(t);root.updateMatrixWorld(true);const transforms=[];root.traverse(o=>transforms.push(o.visible,...o.matrixWorld.elements));return transforms;};
 const initial=state(0);state(12);assert.equal(root.userData.story.index,2);assert.equal(packet.visible,false,'comparison hold must not have a travelling sample');
 assert.deepEqual(state(24),initial,'loop returns to same frame');
 const midway=state(8);assert.equal(packet.visible,true);assert.equal(root.userData.story.index,1);state(20);assert.deepEqual(state(8),midway,'seeking cannot depend on previous frame');
 for(const [time,index,moving] of [[2,0,true],[6,1,false],[9,1,true],[14,2,false],[17,3,true],[22,3,false]]){state(time);assert.equal(root.userData.story.index,index);assert.equal(packet.visible,moving);}
 const box=new T.Box3().setFromObject(root);assert(box.min.y>=-.001);assert(box.max.x-box.min.x<9);assert.equal(root.userData.cycleDuration,24);
});
