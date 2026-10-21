// Smooth implicit sculpture: joined anatomy with continuous normals, not overlapping spheres.
// Marching tetrahedra keeps the mesh closed and avoids an external model dependency.
const cached = new Map();
export function sculptShape(T, name, shapes, bounds, blend=.12, step=.038) {
  if(cached.has(name))return cached.get(name).clone();
  const field=(x,y,z)=>{
    let d=10;
    for(const [cx,cy,cz,rx,ry,rz] of shapes){
      const px=(x-cx)/rx,py=(y-cy)/ry,pz=(z-cz)/rz;
      const q=(Math.hypot(px,py,pz)-1)*Math.min(rx,ry,rz);
      const h=Math.max(blend-Math.abs(d-q),0)/blend;d=Math.min(d,q)-h*h*blend*.25;
    }
    return d;
  };
  const normal=(p)=>{const e=.001;return new T.Vector3(field(p.x+e,p.y,p.z)-field(p.x-e,p.y,p.z),field(p.x,p.y+e,p.z)-field(p.x,p.y-e,p.z),field(p.x,p.y,p.z+e)-field(p.x,p.y,p.z-e)).normalize();};
  const [lo,hi]=bounds,nx=Math.ceil((hi[0]-lo[0])/step),ny=Math.ceil((hi[1]-lo[1])/step),nz=Math.ceil((hi[2]-lo[2])/step);
  const dx=(hi[0]-lo[0])/nx,dy=(hi[1]-lo[1])/ny,dz=(hi[2]-lo[2])/nz,values=new Float32Array((nx+1)*(ny+1)*(nz+1));
  const id=(x,y,z)=>(x*(ny+1)+y)*(nz+1)+z;
  for(let x=0;x<=nx;x++)for(let y=0;y<=ny;y++)for(let z=0;z<=nz;z++)values[id(x,y,z)]=field(lo[0]+x*dx,lo[1]+y*dy,lo[2]+z*dz);
  const corners=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],tets=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],edges=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
  const verts=[],normals=[],uv=[],indices=[],unique=new Map();
  function vertex(p){const key=`${p.x.toFixed(6)},${p.y.toFixed(6)},${p.z.toFixed(6)}`;if(unique.has(key))return unique.get(key);const n=normal(p),i=verts.length/3;verts.push(p.x,p.y,p.z);normals.push(n.x,n.y,n.z);uv.push(p.x*.8,p.y*.8+p.z*.35);unique.set(key,i);return i;}
  for(let x=0;x<nx;x++)for(let y=0;y<ny;y++)for(let z=0;z<nz;z++){
    const ds=corners.map(([a,b,c])=>values[id(x+a,y+b,z+c)]);if(ds.every(v=>v>=0)||ds.every(v=>v<0))continue;
    const ps=corners.map(([a,b,c])=>new T.Vector3(lo[0]+(x+a)*dx,lo[1]+(y+b)*dy,lo[2]+(z+c)*dz));
    for(const tet of tets){const cut=[];for(const [a,b] of edges){const i=tet[a],j=tet[b];if((ds[i]<0)===(ds[j]<0))continue;cut.push(ps[i].clone().lerp(ps[j],ds[i]/(ds[i]-ds[j])));}
      if(cut.length<3)continue;
      const center=cut.reduce((c,p)=>c.add(p),new T.Vector3()).multiplyScalar(1/cut.length),n=normal(center),u=cut[0].clone().sub(center).normalize(),v=new T.Vector3().crossVectors(n,u);
      cut.sort((a,b)=>Math.atan2(a.clone().sub(center).dot(v),a.clone().sub(center).dot(u))-Math.atan2(b.clone().sub(center).dot(v),b.clone().sub(center).dot(u)));
      const ids=cut.map(vertex);for(let i=1;i<ids.length-1;i++)indices.push(ids[0],ids[i],ids[i+1]);
    }
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeBoundingSphere();cached.set(name,g);return g.clone();
}
