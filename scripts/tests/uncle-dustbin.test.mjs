import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact,dustbinMoment,DUSTBIN_CYCLE} from '../../public/landing/artifacts/uncle-dustbin.js';
const names=['study','living','kitchen'];
const approx=(a,b,eps=1e-7)=>assert(a.distanceTo(b)<eps,`${a.toArray()} differs from ${b.toArray()}`);

test('House collection remains deterministic through pause, replay, seeking and gallery transforms',()=>{
 const root=createArtifact(T),robot=root.getObjectByName('uncle-dustbin-robot');
 assert.equal(root.userData.artifactId,29);assert(root.userData.realTimeAnimation);
 root.traverse(o=>{if(o.isMesh){assert(o.material);for(const n of o.geometry.attributes.position.array)assert(Number.isFinite(n));}});
 const state=t=>{root.userData.animate(t);root.updateMatrixWorld(true);const a=[];root.traverse(o=>a.push(...o.matrixWorld.elements));return a;};
 const initial=state(0);assert.deepEqual(state(DUSTBIN_CYCLE),initial);
 const held=state(11);state(44);assert.deepEqual(state(11),held);assert.deepEqual(state(11),held);
 for(const time of [10.3,22.3,35.3]){state(time);const stopped=robot.matrix.clone(),wheel=root.getObjectByName('dustbin-wheel-left').rotation.x;state(time+2);assert.deepEqual(robot.matrix,stopped);assert.equal(root.getObjectByName('dustbin-wheel-left').rotation.x,wheel);}
 // Parent transforms must not make litter float or leave the bin when rotated.
 state(42);const cargo=names.map(n=>robot.worldToLocal(root.getObjectByName(`dustbin-transfer-${n}`).getWorldPosition(new T.Vector3())));
 root.position.set(2,.025,-1);root.rotation.y=.4;root.scale.setScalar(1.2);state(42);
 names.forEach((n,i)=>approx(robot.worldToLocal(root.getObjectByName(`dustbin-transfer-${n}`).getWorldPosition(new T.Vector3())),cargo[i]));
});

test('Rubbish transfers continuously from all three residents into the bin and stays aboard',()=>{
 const root=createArtifact(T),robot=root.getObjectByName('uncle-dustbin-robot');
 for(const [i,stop] of [10,22,35].entries()){
  const item=root.getObjectByName(`dustbin-transfer-${names[i]}`);
  root.userData.animate(stop+1.65-.0001);assert(root.getObjectByName(`dustbin-resident-${names[i]}`).userData.reachDistance<.83,'handoff stays within natural arm reach');const before=item.position.clone();root.userData.animate(stop+1.65+.0001);approx(item.position,before,.002);
  root.userData.animate(stop+2.25-.0001);const justAbove=item.position.clone();root.userData.animate(stop+2.25+.0001);approx(item.position,justAbove,.002);
  assert.equal(root.userData.collectedCount,i+1);
  for(const t of [stop+3,40,46]){
   root.userData.animate(t);root.updateMatrixWorld(true);const local=robot.worldToLocal(item.getWorldPosition(new T.Vector3()));
   assert(Math.abs(local.x)<.80&&Math.abs(local.z)<.56,'waste must land within bin walls');assert(local.y>1.35&&local.y<1.90,'waste stays above the bin floor and below its rim');
  }
 }
 root.userData.animate(0);assert.equal(root.userData.collectedCount,0,'replay resets the handoffs');
 names.forEach(n=>assert.equal(root.getObjectByName(`dustbin-transfer-${n}`).userData.collected,false));
});

test('The scaled robot and full bin clear furniture and remain on the house floor throughout the route',()=>{
 const root=createArtifact(T),robot=root.getObjectByName('uncle-dustbin-robot');let previous=0;
 for(let t=0;t<DUSTBIN_CYCLE;t+=.05){
  root.userData.animate(t);const p=root.userData.routePose,[w,d]=root.userData.robotHalfExtents;
  const hx=Math.abs(Math.cos(p.yaw))*w+Math.abs(Math.sin(p.yaw))*d,hz=Math.abs(Math.sin(p.yaw))*w+Math.abs(Math.cos(p.yaw))*d;
  assert(p.progress>=previous);previous=p.progress;
  const f=root.userData.floorBounds;assert(p.x-hx>f.minX&&p.x+hx<f.maxX);assert(p.z-hz>f.minZ&&p.z+hz<f.maxZ);
  for(const b of root.userData.obstacles)assert(!(p.x+hx>b.minX&&p.x-hx<b.maxX&&p.z+hz>b.minZ&&p.z-hz<b.maxZ),`bin intersects ${b.name} at ${t.toFixed(2)}s`);
  assert(Math.abs(robot.position.y-root.userData.floorLevel)<1e-9,'constant wheel contact height');
 }
 assert.equal(dustbinMoment(11).phase,'study-stop');assert.equal(dustbinMoment(23).phase,'sofa-stop');assert.equal(dustbinMoment(36).phase,'kitchen-stop');
 assert(dustbinMoment(47.999).progress>.99999);
});


test('Collection visits each room through the hall and keeps the bathroom private',()=>{
 const root=createArtifact(T),visited=[];
 for(let t=0;t<48;t+=.025){
  root.userData.animate(t);const {x,z}=root.userData.routePose;
  const room=root.userData.rooms.find(r=>x>r.minX&&x<r.maxX&&z>r.minZ&&z<r.maxZ)?.name??'hall';
  if(visited.at(-1)!==room)visited.push(room);
 }
 assert.deepEqual(visited,['hall','bedroom','hall','living','hall','kitchen','hall']);
});
