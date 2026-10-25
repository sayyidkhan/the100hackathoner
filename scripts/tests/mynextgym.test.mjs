import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,gymMoment,CANDIDATES,MYNEXTGYM_CYCLE} from '../../public/landing/artifacts/mynextgym.js';
import {createGymScreen} from '../../public/landing/artifacts/mynextgym-app-screen.js';

test('sample footfall accumulates before all three locations compare',()=>{
 assert.equal(MYNEXTGYM_CYCLE,24);
 let previous=[0,0,0];
 for(let t=0;t<=8;t+=.125){
  const state=gymMoment(t);
  state.counts.forEach((n,i)=>{assert(Number.isInteger(n));assert(n>=previous[i]&&n<=CANDIDATES[i].footfall);});
  assert.equal(state.selection,0);assert.equal(state.reveal,0);previous=state.counts;
 }
 assert.deepEqual(gymMoment(0).counts,[0,0,0]);
 assert.deepEqual(gymMoment(8).counts,[12,36,20]);
 assert.deepEqual(CANDIDATES.map(c=>c.id),['A','B','C']);
 assert(CANDIDATES[1].footfall>CANDIDATES[2].footfall&&CANDIDATES[2].footfall>CANDIDATES[0].footfall);
 assert.deepEqual([8.1,9.5,11].map(t=>gymMoment(t).comparison),[0,1,2]);
 for(const t of [8,9.5,11.99]){const s=gymMoment(t);assert.equal(s.phase,'compare');assert.deepEqual(s.counts,[12,36,20]);assert.equal(s.selection,0);assert.equal(s.reveal,0);}
 assert.deepEqual(gymMoment(-1),gymMoment(23));assert.deepEqual(gymMoment(24),gymMoment(0));
});

test('B is selected after comparison and the proposed gym follows the landed pin',()=>{
 const model=createArtifact(T),pin=model.getObjectByName('mynextgym-pin'),selection=model.getObjectByName('mynextgym-selected-B'),gym=model.getObjectByName('mynextgym-proposed-gym'),screen=model.getObjectByName('mynextgym-app-screen');
 assert(pin&&selection&&gym&&screen);
 for(const t of [0,3,7.99,8,9.5,11.99]){
  model.userData.animate(t);assert.equal(pin.visible,false);assert.equal(selection.visible,false);assert.equal(gym.visible,false);assert.equal(screen.userData.winner,null);
 }
 model.userData.animate(12);const high=pin.position.y;
 assert.equal(pin.visible,true);assert.equal(selection.visible,true);assert.equal(gym.visible,false);assert.equal(screen.userData.winner,'B');
 model.userData.animate(13);assert(pin.position.y<high);assert.equal(gym.visible,false);
 model.userData.animate(14);const landed=pin.position.y;
 assert(high-landed>.6,'pin has a visible descent into the chosen location');
 model.userData.animate(14.99);assert.equal(pin.position.y,landed);assert.equal(gym.visible,false);
 model.userData.animate(16);assert(pin.position.y>=landed,'selected marker follows the emerging roof');assert.equal(gym.visible,true);assert(gym.scale.y>0&&gym.scale.y<1);
 model.userData.animate(18);assert.equal(gym.scale.y,1);assert.equal(model.userData.story.phase,'reveal');
 assert.equal(gym.position.x,selection.position.x);assert.equal(gym.position.z,selection.position.z);
 assert.deepEqual(model.userData.flowRoutes.filter(f=>f.site==='B').map(f=>f.source).sort(),['homes','offices','transit']);
 assert.deepEqual(CANDIDATES.map(c=>model.userData.flowRoutes.filter(f=>f.site===c.id).reduce((sum,f)=>sum+f.sample,0)),[12,36,20],'each displayed total is supported by its pedestrian routes');
 assert.deepEqual(screen.userData.counts,[12,36,20]);
});

test('pedestrians stay on the map and hold their positions during comparison',()=>{
 const model=createArtifact(T),tokens=[];
 model.traverse(o=>{if(o.name.startsWith('mynextgym-footstep-'))tokens.push(o);});
 assert.equal(tokens.length,68,'visible sample has the same total population as the app counts');
 const siteA=model.getObjectByName('mynextgym-site-A');
 const offsetX=siteA.position.x-CANDIDATES[0].x,offsetZ=siteA.position.z-CANDIDATES[0].z;
 const token=tokens[0];model.userData.animate(0);const first=token.position.clone();
 model.userData.animate(.5);assert(token.position.distanceTo(first)>.02,'pedestrians actually travel');
 assert(Math.abs(token.position.y-first.y)<1e-8);
 for(let t=0;t<=8;t+=.1){
  model.userData.animate(t);
  for(const person of tokens){
   if(!person.visible)continue;
   assert(person.position.x>=-3.74+offsetX&&person.position.x<=1.04+offsetX,'route stays within the map width');
   assert(person.position.z>=-1.72+offsetZ&&person.position.z<=1.82+offsetZ,'route stays within the map depth');
   assert(Math.abs(person.position.y-first.y)<1e-8,'pedestrians remain on the map surface');
  }
 }
 model.userData.animate(8);const held=tokens.map(o=>o.position.toArray());assert(tokens.every(o=>o.visible));
 for(const t of [9,11,14,18,21]){model.userData.animate(t);assert.deepEqual(tokens.map(o=>o.position.toArray()),held,'crowd stops when the sample is complete');}
 for(let t=0;t<=8;t+=.5){
  model.userData.animate(t);const arrived=[0,0,0];
  tokens.forEach((person,i)=>{
   if(person.visible&&person.position.distanceTo(new T.Vector3(...held[i]))<1e-8){
    const routeIndex=Number(person.name.split('-').at(-2));
    const site=model.userData.flowRoutes[routeIndex].site;arrived[CANDIDATES.findIndex(c=>c.id===site)]++;
   }
  });
  assert.deepEqual(arrived,gymMoment(t).counts,'app counts must match pedestrians that have reached their destination');
 }
 assert.equal(model.userData.flowRoutes.length,5);
});

test('analytics geometry stays finite and deterministic through pause, reset and replay',()=>{
 const model=createArtifact(T);let meshes=0,vertices=0;
 model.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;assert([...o.geometry.attributes.position.array].every(Number.isFinite));}});
 assert(meshes<125,'map, crowd and app draw-call budget');assert(vertices<350000,'map, crowd and app vertex budget');
 const state=t=>{model.userData.animate(t);model.updateMatrixWorld(true);const v=[];model.traverse(o=>v.push(o.visible,...o.matrixWorld.elements));return {v,story:model.userData.story,app:{...model.getObjectByName('mynextgym-app-screen').userData}};};
 const first=state(4);assert.notDeepEqual(first,state(18));assert.deepEqual(first,state(4));assert.deepEqual(state(0),state(MYNEXTGYM_CYCLE));
 for(let t=0;t<=48;t+=.25){
  const s=state(t);assert(s.v.every(x=>typeof x==='boolean'||Number.isFinite(x)));
  for(const key of ['step','title','detail','tone'])assert.equal(typeof s.story[key],'string');
  assert(Number.isInteger(s.story.index));assert(s.story.index>=0&&s.story.index<5);
  assert.equal(s.app.phase,gymMoment(t).phase);assert.deepEqual(s.app.counts,gymMoment(t).counts);
  assert(new T.Box3().setFromObject(model).min.y>=-.001,'animation must not push geometry below the plinth');
 }
});

test('app is available without a canvas and clamps invalid sample data',()=>{
 const app=createGymScreen(T),screen=app.mesh;
 assert.equal(screen.material.map,null,'Node fallback does not require a DOM');
 assert(screen.material.isMeshBasicMaterial);assert.equal(screen.material.toneMapped,false);assert.equal(screen.userData.noShadow,true);
 app.update({phase:'footfall',counts:[5,10,7],comparison:-1});assert.deepEqual(screen.userData.counts,[5,10,7]);assert.equal(screen.userData.winner,null);
 app.update({phase:'compare',counts:[12,36,20],comparison:1});assert.equal(screen.userData.comparison,1);assert.equal(screen.userData.winner,null);
 app.update({phase:'selected',counts:[12,36,20]});assert.equal(screen.userData.winner,'B');
 app.update({phase:'invalid',counts:[-10,Infinity,1000],comparison:7});assert.equal(screen.userData.phase,'footfall');assert.deepEqual(screen.userData.counts,[0,0,20]);assert.equal(screen.userData.comparison,-1);
 app.dispose();
});

test('app title, comparison rows and result panel stay in front of the housing',()=>{
 const model=createArtifact(T),screen=model.getObjectByName('mynextgym-app-screen');model.updateMatrixWorld(true);
 const forward=new T.Vector3(0,0,1).transformDirection(screen.matrixWorld);
 for(const [x,y]of [[0,1.1],[-.65,.25],[.65,.25],[0,-1.0]]){
  const p=screen.localToWorld(new T.Vector3(x,y,0));
  const ray=new T.Raycaster(p.clone().addScaledVector(forward,.5),forward.clone().negate());
  const hits=ray.intersectObject(model,true);assert.equal(hits[0]?.object,screen,'screen content must not be occluded by frame geometry');
 }
});
