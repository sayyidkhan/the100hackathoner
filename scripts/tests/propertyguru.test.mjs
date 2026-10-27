import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,propertyMoment,PROPERTY_CYCLE} from '../../public/landing/artifacts/propertyguru.js';

test('both evidence streams finish before recommendations appear',()=>{
 for(let t=0;t<PROPERTY_CYCLE;t+=.1){
  const s=propertyMoment(t);
  for(const v of [s.propertySignal,s.enquirySignal,s.reveal])assert(v>=0&&v<=1);
  if(s.recommendation){assert.equal(s.propertySignal,1);assert.equal(s.enquirySignal,1);}
  if(s.ready)assert(s.recommendation);
 }
 assert.deepEqual(propertyMoment(-1),propertyMoment(23));
 assert.deepEqual(propertyMoment(PROPERTY_CYCLE),propertyMoment(0));
});

test('screen, highlighted property and story stay synchronized on replay',()=>{
 const model=createArtifact(T),screen=model.getObjectByName('property-recommendations'),pin=model.getObjectByName('property-match-pin'),halo=model.getObjectByName('property-selected-outline');
 for(const [t,stage,matched] of [[0,0,false],[6,1,false],[12,2,true],[18,3,true],[23,0,false]]){
  model.userData.animate(t);assert.equal(screen.userData.stage,stage);assert.equal(model.userData.story.index,stage);assert.equal(pin.visible,matched);assert.equal(halo.visible,matched);
 }
 model.userData.animate(2);const pulse=model.getObjectByName('property-signal-0'),pos=pulse.position.toArray();assert(pulse.visible);
 model.userData.animate(26);assert.deepEqual(pulse.position.toArray(),pos);
 model.userData.animate(0);assert(!pulse.visible);assert(!pin.visible);
});

test('geometry and moving details fit the architectural board',()=>{
 const model=createArtifact(T);let meshes=0,vertices=0,renderedVertices=0;
 model.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;renderedVertices+=o.geometry.attributes.position.count*(o.isInstancedMesh?o.count:1);if(o.isInstancedMesh)assert([...o.instanceMatrix.array].every(Number.isFinite));assert([...o.geometry.attributes.position.array].every(Number.isFinite));}});
 assert(meshes<65,`meshes ${meshes}`);assert(vertices<240000,`vertices ${vertices}`);
 assert(renderedVertices<320000,`instanced vertices ${renderedVertices}`);
 assert(model.getObjectByName('property-tropical-landscape'));
 for(let t=0;t<PROPERTY_CYCLE;t+=.5){model.userData.animate(t);const b=new T.Box3().setFromObject(model);assert(b.min.y>-.01);assert(b.max.y<4.2);assert(b.min.x>-4.6&&b.max.x<4.6);assert(b.min.z>-3.0&&b.max.z<3.0);}
});


test('contact shading matches the rebuilt architecture exactly',async()=>{
 const {readFile}=await import('node:fs/promises');
 const {geometryObservatoryAOHash}=await import('../../public/landing/artifacts/astrodegen-occlusion.js');
 const bytes=await readFile(new URL('../../public/landing/assets/propertyguru-ao-v1.bin',import.meta.url));
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),meshes=[];
 createArtifact(T).traverse(o=>{if(o.isMesh&&o.userData.observatoryAO)meshes.push(o);});
 assert.equal(view.getUint32(4,true),meshes.length);
 meshes.forEach((o,i)=>{
  assert.equal(view.getUint32(16+i*16,true),o.geometry.attributes.position.count);
  assert.equal(view.getUint32(24+i*16,true),geometryObservatoryAOHash(o.geometry));
 });
});
