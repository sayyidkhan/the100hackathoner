// Derive cropped portrait reliefs from the locally licensed Rocketbox meshes.
// Run from the repository root. The original MIT licence remains alongside sources.
import * as T from '../../public/landing/vendor/three.module.js';
import fs from 'node:fs';
import zlib from 'node:zlib';
const portraits=[];
for(const name of ['mentor','learner']){
 const model=new T.ObjectLoader().parse(JSON.parse(zlib.gunzipSync(fs.readFileSync(`public/landing/assets/lrnmate-people/${name}.bin`))));model.updateMatrixWorld(true);
 const bottom=name==='mentor'?131:124,top=name==='mentor'?181:174,s=.49/(top-bottom),positions=[],normals=[],indices=[];
 model.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,p=new T.Vector3(),vertices=[];
  for(let i=0;i<g.attributes.position.count;i++){m.getVertexPosition(i,p).applyMatrix4(m.matrixWorld);vertices.push(p.clone());}
  const remap=new Map(),unique=new Map(),normalMatrix=new T.Matrix3().getNormalMatrix(m.matrixWorld);
  for(let i=0;i<(g.index?.count??vertices.length);i+=3){const ids=[0,1,2].map(k=>g.index?g.index.getX(i+k):i+k);if(ids.some(id=>vertices[id].y<bottom||Math.abs(vertices[id].x)>25))continue;
   for(const id of ids){if(!remap.has(id)){const v=vertices[id],xyz=[v.x*s,(v.y-(top+bottom)/2)*s,v.z*s].map(n=>+n.toFixed(6));const normal=new T.Vector3().fromBufferAttribute(g.attributes.normal,id).applyNormalMatrix(normalMatrix).toArray().map(n=>+n.toFixed(5));const key=[...xyz,...normal].join(',');if(!unique.has(key)){unique.set(key,positions.length/3);positions.push(...xyz);normals.push(...normal);}remap.set(id,unique.get(key));}indices.push(remap.get(id));}
  }
 });
 // One source vertex has a zero normal. Repair it from its incident faces.
 for(let i=0;i<normals.length;i+=3){if(Math.hypot(...normals.slice(i,i+3))>.01)continue;const sum=new T.Vector3();for(let k=0;k<indices.length;k+=3){const ids=indices.slice(k,k+3);if(!ids.includes(i/3))continue;const [a,b,c]=ids.map(id=>new T.Vector3().fromArray(positions,id*3));sum.add(b.sub(a).cross(c.sub(a)));}if(sum.lengthSq()<1e-12)sum.set(0,0,1);sum.normalize();normals.splice(i,3,...sum.toArray());}
 portraits.push({positions,normals,indices});console.log(name,positions.length/3,'vertices',indices.length/3,'triangles');
}
fs.writeFileSync('public/landing/assets/fasight/portraits.js',`// Cropped Microsoft Rocketbox portrait geometry; MIT. See README.md.\nexport default ${JSON.stringify(portraits)};\n`);
