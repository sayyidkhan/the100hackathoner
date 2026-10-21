import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import * as T from '../../public/landing/vendor/three.module.js';
import {createArtifact} from '../../public/landing/artifacts/stress-bunny.js';
globalThis.fetch=async url=>({ok:true,arrayBuffer:async()=>{const data=await readFile(url);return data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);}});
const model=createArtifact(T);model.userData.animate(.2);
await model.userData.bakedAOPromise;assert.equal(model.userData.bakedAOStatus,'ready');
let meshes=0,triangles=0,bytes=0;
model.traverse(o=>{if(!o.isMesh)return;meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const a of Object.values(o.geometry.attributes)){bytes+=a.array.byteLength;assert.ok(Array.from(a.array).every(Number.isFinite));}});
for(let t=0;t<240;t+=.25){model.userData.animate(t);model.updateMatrixWorld(true);model.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));}
function pose(t){model.userData.animate(t);const result=[];model.traverse(o=>result.push(...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()));return result;}
const first=pose(2),repeat=pose(122);assert.ok(first.every((n,i)=>Math.abs(n-repeat[i])<1e-8));assert.notDeepEqual(first,pose(4));
model.userData.interact(10);model.userData.animate(10);assert.equal(model.userData.calmLevel,0);
model.userData.animate(12);const settling=model.userData.calmLevel;assert.ok(settling>0&&settling<1);
model.userData.animate(16);assert.equal(model.userData.calmLevel,1);
model.userData.animate(0);assert.equal(model.userData.calmLevel,1);
model.userData.setTheme('light');model.userData.animate(20);model.userData.setTheme('dark');
// Catch facial features being buried inside a newly sculpted head.
const head=model.getObjectByName('bunny-head'),faceMesh=head.children.find(o=>o.isMesh&&o.material.type==='MeshPhysicalMaterial');
const face=new T.Mesh(faceMesh.geometry);face.updateMatrixWorld();
const eyeGroups=head.children.filter(o=>o.name==='bunny-eye');assert.equal(eyeGroups.length,2);
for(const eye of eyeGroups){
  const hit=new T.Raycaster(new T.Vector3(eye.position.x,eye.position.y,2),new T.Vector3(0,0,-1)).intersectObject(face)[0];
  assert.ok(hit&&eye.position.z+.035>hit.point.z+.015,'eye must protrude beyond the face');
}
const drag=model.userData.manipulation,home=drag.target.position.clone();
drag.begin(30);assert.equal(model.userData.interactionState,'held');
drag.move(home.clone().add(new T.Vector3(.6,1.2,-.3)),30);
assert.ok(drag.target.position.y>home.y+.9);
drag.release(31);assert.equal(model.userData.interactionState,'falling');
const releasedHeight=drag.target.position.y;drag.update(1/60,31);assert.ok(drag.target.position.y<releasedHeight);
for(let i=0;i<180;i++)drag.update(1/60,31+i/60);
assert.equal(model.userData.interactionState,'resting');assert.ok(Math.abs(drag.target.position.y-home.y)<1e-8);assert.ok(drag.target.position.x>home.x+.4);
// An extreme drag stays on the play surface and cannot leave the bunny stranded.
drag.begin(40);drag.move(new T.Vector3(100,100,100),40);assert.ok(drag.target.position.y<3);
drag.release(40,true);assert.equal(model.userData.interactionState,'resting');
assert.ok(drag.target.position.distanceTo(drag.groundPoint(drag.target.position))<1e-8);
drag.begin(42);drag.reset();assert.ok(drag.target.position.distanceTo(home)<1e-8);assert.equal(model.userData.needsInteractionFrame,false);
assert.ok(meshes<200&&triangles<300000&&bytes<20000000);
const report={bakedAO:model.userData.bakedAOStatus,meshes,triangles,geometryMiB:+(bytes/1048576).toFixed(2),checks:['finite geometry and transforms over two 120-second cycles','deterministic 120-second replay','visible breathing motion','interaction wakes bunny','stillness gradually restores calm','reset clears stale interaction time','light/dark theme hooks','eyes remain visible above the sculpted face','AO loads after motion starts','pick up and carry changes bunny position','gravity and soft landing at moved position','bounded drag and safe bank landing','paused/reduced-motion release lands immediately','reset restores home and clears held state']};
console.log(report);await writeFile(new URL('./model-checks.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
