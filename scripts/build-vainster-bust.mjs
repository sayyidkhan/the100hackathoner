// Derive a rigid ceramic portrait from the locally licensed Rocketbox character.
import fs from 'node:fs';
import zlib from 'node:zlib';
import * as T from '../public/landing/vendor/three.module.js';
const model=new T.ObjectLoader().parse(JSON.parse(zlib.gunzipSync(fs.readFileSync('public/landing/assets/lrnmate-people/learner.bin'))));
model.updateMatrixWorld(true);const positions=[],normals=[];
model.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,ids=g.index?.array??Array.from({length:g.attributes.position.count},(_,i)=>i);o.skeleton?.update();
 for(let i=0;i<ids.length;i+=3){if(g.groups.find(gr=>i>=gr.start&&i<gr.start+gr.count)?.materialIndex!==1)continue;const ps=[0,1,2].map(k=>o.getVertexPosition(ids[i+k],new T.Vector3()).applyMatrix4(o.matrixWorld));if(ps.some(p=>p.y<143.8))continue;
  for(let k=0;k<3;k++){positions.push(ps[k].x*.105,(ps[k].y-143.8)*.105,(ps[k].z+5)*.105);const n=new T.Vector3().fromBufferAttribute(g.attributes.normal,ids[i+k]).transformDirection(o.matrixWorld);normals.push(...n.toArray());}
 }});
// Weld authored seam vertices, then Loop-subdivide twice for a smooth close-up silhouette.
let verts=[],faces=[],lookup=new Map();for(let i=0;i<positions.length;i+=9){let face=[];for(let k=0;k<3;k++){const p=positions.slice(i+k*3,i+k*3+3),key=p.map(v=>Math.round(v*10000)).join(',');if(!lookup.has(key)){lookup.set(key,verts.length);verts.push(new T.Vector3(...p));}face.push(lookup.get(key));}if(new Set(face).size===3)faces.push(face);}
const scanSurface={positions:verts.flatMap(v=>v.toArray()),indices:faces.flat()};
for(let iteration=0;iteration<2;iteration++){
 const edges=new Map(),neighbors=verts.map(()=>new Set());
 const edge=(a,b,opposite)=>{neighbors[a].add(b);neighbors[b].add(a);const key=[Math.min(a,b),Math.max(a,b)].join(':');if(!edges.has(key))edges.set(key,{a,b,op:[]});edges.get(key).op.push(opposite);};
 for(const[a,b,c]of faces){edge(a,b,c);edge(b,c,a);edge(c,a,b);}
 const boundary=verts.map(()=>[]);for(const e of edges.values())if(e.op.length===1){boundary[e.a].push(e.b);boundary[e.b].push(e.a);}
 const next=verts.map((v,i)=>{const bs=boundary[i];if(bs.length===2)return v.clone().multiplyScalar(.75).addScaledVector(verts[bs[0]],.125).addScaledVector(verts[bs[1]],.125);const n=neighbors[i].size,b=n===3?3/16:3/(8*n);const p=v.clone().multiplyScalar(1-n*b);for(const j of neighbors[i])p.addScaledVector(verts[j],b);return p;});
 for(const e of edges.values()){e.id=next.length;const p=verts[e.a].clone().add(verts[e.b]);if(e.op.length===2)p.multiplyScalar(.375).addScaledVector(verts[e.op[0]],.125).addScaledVector(verts[e.op[1]],.125);else p.multiplyScalar(.5);next.push(p);}
 const midpoint=(a,b)=>edges.get([Math.min(a,b),Math.max(a,b)].join(':')).id;
 faces=faces.flatMap(([a,b,c])=>{const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);return[[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]];});verts=next;
}
const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts.flatMap(v=>v.toArray()),3));geo.setIndex(faces.flat());geo.computeVertexNormals();
geo.userData={scanSurface};fs.writeFileSync('public/landing/assets/vainster/portrait.json',JSON.stringify(geo.toJSON()));
fs.copyFileSync('public/landing/assets/lrnmate-people/LICENSE-Rocketbox.txt','public/landing/assets/vainster/LICENSE-Rocketbox.txt');
console.log({triangles:faces.length,bounds:new T.Box3().setFromBufferAttribute(geo.attributes.position)});
