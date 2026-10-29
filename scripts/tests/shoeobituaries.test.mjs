import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../../public/landing/vendor/three.module.js';
import {shoeMoment,SHOE_CYCLE,TRIBUTES} from '../../public/landing/artifacts/shoe-timing.js';
import {createArtifact} from '../../public/landing/artifacts/shoeobituaries.js';
import {geometryObservatoryAOHash} from '../../public/landing/artifacts/astrodegen-occlusion.js';
test('closed start, sequential openings, simultaneous closing and seamless loop',()=>{
 assert.deepEqual(TRIBUTES.map(x=>x.name),['MoMo','ZuZu','BuBu']);
 for(const t of [0,1,27,29.99,30])assert.deepEqual(shoeMoment(t).openness,[0,0,0]);
 assert.deepEqual(shoeMoment(4).openness,[1,0,0]);
 assert.deepEqual(shoeMoment(11).openness,[1,1,0]);
 assert.deepEqual(shoeMoment(18).openness,[1,1,1]);
 assert.deepEqual(shoeMoment(24).openness,[1,1,1]);
 assert.deepEqual(shoeMoment(25.5).openness,[.5,.5,.5]);
 for(let t=0;t<24;t+=.1){const a=shoeMoment(t).openness;assert.ok(a.filter(x=>x>0&&x<1).length<=1);}
 assert.deepEqual(shoeMoment(SHOE_CYCLE),shoeMoment(0));
 assert.deepEqual(shoeMoment(5,3).openness,[1,1,1]);
 assert.deepEqual(shoeMoment(100,2).openness,[0,0,1]);
});
test('all six shoes remain seated; manual controls and seeks are deterministic',()=>{
 const model=createArtifact(T,{bake:true});let triangles=0;model.traverse(o=>{if(o.isMesh){assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});assert.ok(triangles<340000);
 const shoes=[0,1,2].map(i=>model.getObjectByName(`shoe-${i}`));
 for(let i=0;i<3;i++)for(const foot of ['left','right'])assert.ok(shoes[i].getObjectByName(`${foot}-shoe-${i}`));
 const pose=t=>{model.userData.animate(t);return [0,1,2].map(i=>model.getObjectByName(`lid-${i}`).rotation.x);};
 const initial=pose(0);assert.ok(initial.every(x=>x===0));pose(18);assert.deepEqual(pose(30),initial);
 for(let t=0;t<30;t+=.5){pose(t);assert.ok(shoes.every(o=>o.visible&&o.position.y===.245));}
 model.userData.setStep(3,40);pose(41);assert.ok(pose(41).every(x=>x===-1.92));
 model.userData.setStep(2,50);assert.deepEqual(pose(53),[0,0,-1.92]);
 model.userData.setStep(null,60);assert.ok(pose(60).every(x=>x===0));console.log(`${triangles.toLocaleString()} triangles`);
});
test('contact bake matches geometry and excludes moving support arms',async()=>{
 const model=createArtifact(T,{bake:true}),meshes=[];model.traverse(o=>{if(o.userData.observatoryAO)meshes.push(o);});const data=await readFile(new URL('../../public/landing/assets/shoeobituaries-ao-v9.bin',import.meta.url));assert.equal(data.readUInt32LE(4),meshes.length);
 meshes.forEach((o,i)=>{assert.equal(data.readUInt32LE(16+i*16),o.geometry.attributes.position.count);assert.equal(data.readUInt32LE(24+i*16),geometryObservatoryAOHash(o.geometry));assert.ok(!o.parent.parent?.name.startsWith('lid-stays-'));});
});
test('memorials stay attached to lids; shoes clear them and stays keep fixed lengths',()=>{
 const model=createArtifact(T,{bake:true}),point=new T.Vector3(),inv=new T.Matrix4();
 for(let time=0;time<SHOE_CYCLE;time+=.5){model.userData.animate(time);model.updateMatrixWorld(true);
 for(let i=0;i<3;i++){
 const lid=model.getObjectByName(`lid-${i}`),card=model.getObjectByName(`tribute-card-${i}`),shoe=model.getObjectByName(`shoe-${i}`);
 assert.ok(lid.rotation.x>=-1.921&&lid.rotation.x<=0);
 assert.equal(card.parent,lid,`memorial attached to lid ${i}`);
 assert.ok(card.position.length()<1e-6);
 inv.copy(lid.matrixWorld).invert();let intersections=0;
 shoe.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let j=0;j<p.count;j+=5){point.fromBufferAttribute(p,j).applyMatrix4(o.matrixWorld).applyMatrix4(inv);if(Math.abs(point.x)<1.54&&point.z>.02&&point.z<1.84&&point.y>-.20&&point.y<.12)intersections++;}});
 assert.equal(intersections,0,`shoe/lid collision at ${time}, bay ${i}`);
 const stays=model.getObjectByName(`lid-stays-${i}`);for(let pair=0;pair<2;pair++){const a=stays.children[pair*2],b=stays.children[pair*2+1];const end=new T.Vector3(0,1.05,0).applyMatrix4(a.matrixWorld),joint=b.getWorldPosition(new T.Vector3());assert.ok(end.distanceTo(joint)<1e-6);}
 }}
});
test('resting pairs have padding clearance and never pass through the box walls',()=>{
 const model=createArtifact(T,{bake:true}),v=new T.Vector3(),inv=new T.Matrix4();
 for(let t=0;t<SHOE_CYCLE;t+=.5){model.userData.animate(t);model.updateMatrixWorld(true);
 for(let i=0;i<3;i++){
 const pair=model.getObjectByName(`shoe-${i}`);inv.copy(pair.parent.matrixWorld).invert();
 pair.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;
 for(let j=0;j<p.count;j++){
 v.fromBufferAttribute(p,j).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
 assert.ok(v.y>=.215,`shoe above lining floor at ${t}`);
 if(v.y<1.40){assert.ok(Math.abs(v.x)<1.40,`side clearance at ${t}`);assert.ok(v.z>-1.23&&v.z<1.32,`front/rear clearance at ${t}: ${v.z}`);}
 if(t===0)assert.ok(v.z>-1.20&&v.z<1.24,`resting padding margin ${v.z}`);
 }
 });
 }
 }
});
