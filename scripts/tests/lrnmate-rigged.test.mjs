import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../../public/landing/vendor/three.module.js';
import {prepareArtifact,createArtifact} from '../../public/landing/artifacts/lrnmate.js';

test('LrnMate loads authored skeletons, matching scene AO and deterministic animation',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>new Response(await readFile(url));
 let root;
 try{
  await prepareArtifact();root=createArtifact(T);
  assert.equal(await root.userData.bakedAOPromise,true);
  const skins=[];root.traverse(o=>{if(o.isSkinnedMesh)skins.push(o);});
  assert.equal(skins.length,2);
  for(const mesh of skins){assert(mesh.geometry.attributes.position.count>20000);assert(mesh.skeleton.bones.length>=70);}
  const state=t=>{root.userData.animate(t);root.updateMatrixWorld(true);skins.forEach(m=>m.skeleton.update());return skins.flatMap(m=>m.skeleton.bones.flatMap(b=>[...b.matrixWorld.elements]));};
  const leftFeet=()=>skins.map(m=>m.skeleton.bones.find(b=>b.name==='Bip01_L_Foot').getWorldPosition(new T.Vector3()).toArray());
  state(0);const feet=leftFeet();state(7);assert.deepEqual(leftFeet(),feet,'feet must remain planted');
  const resting=state(15);assert.deepEqual(state(17),resting,'rest phase must have no wandering joints');
  assert.deepEqual(state(18),state(0),'cycle must return to its exact initial pose');
  root.userData.animate(8);assert.equal(root.getObjectByName('lrnmate-feedback').visible,false);
  root.userData.animate(12);assert.equal(root.getObjectByName('lrnmate-feedback').visible,true);
  root.userData.animate(15);assert.equal(root.getObjectByName('lrnmate-feedback').visible,false);
  const start=state(0),later=state(3);assert.notDeepEqual(later,start);assert.deepEqual(state(0),start);assert(later.every(Number.isFinite));
 }finally{globalThis.fetch=original;}
});
