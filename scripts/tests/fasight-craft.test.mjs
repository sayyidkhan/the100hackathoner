import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import portraits from '../../public/landing/assets/fasight/portraits.js';
import { createArtifact } from '../../public/landing/artifacts/fasight.js';
import { carvedPortrait } from '../../public/landing/artifacts/fasight-craft.js';

test('Fasight authored reliefs retain valid smooth normals after depth compression',()=>{
 for(let i=0;i<5;i++){
  const group=new T.Group(),m=carvedPortrait(T,(geometry)=>{const o=new T.Mesh(geometry);group.add(o);return o;},group,i);
  const g=m.geometry,p=g.attributes.position,n=g.attributes.normal;
  assert(p.count>2000);assert.equal(n.count,p.count);
  assert(g.index.array.every(v=>v>=0&&v<p.count));
  for(let j=0;j<p.count;j++){const normal=new T.Vector3().fromBufferAttribute(n,j);assert(Math.abs(normal.length()-1)<1e-5);}
  g.computeBoundingBox();assert(g.boundingBox.max.z-g.boundingBox.min.z>.1,'portrait retains sculptural depth');
 }
 assert(portraits.reduce((sum,p)=>sum+p.positions.length/3,0)<6000,'shared source geometry is deduplicated');
});

test('Fasight detailed scene stays batched and uses linear roughness / height data',()=>{
 const root=createArtifact(T);let meshes=0,triangles=0;const materials=new Set();
 root.traverse(o=>{if(!o.isMesh)return;meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;materials.add(o.material);});
 assert(meshes<65,`draw calls: ${meshes}`);assert(triangles<400000,`triangles: ${triangles}`);
 for(const m of materials){if(m.roughnessMap){assert.equal(m.roughnessMap.colorSpace,T.NoColorSpace);assert.equal(m.bumpMap.colorSpace,T.NoColorSpace);assert.notEqual(m.map,m.bumpMap);}}
 const pages=root.getObjectByName('fasight-written-ledger');assert(pages.geometry.attributes.position.count>3000);assert(pages.receiveShadow);
});
