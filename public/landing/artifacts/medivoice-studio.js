// Modeling kit for MediVoice. Batching preserves UVs for tactile surfaces.
export function medivoiceStudio(T) {
  const root=new T.Group();
  const materials={};
  const colors={paper:0xe4d4b8,ivory:0xf0e4ce,shade:0xbda887,red:0xad4c37,blue:0x276a71,ink:0x25342d,wood:0x99764b};
  for(const [k,color] of Object.entries(colors))materials[k]=new T.MeshStandardMaterial({color,roughness:.7});
  function mesh(geometry,color='ivory',parent=root){const o=new T.Mesh(geometry,materials[color]);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function box(w,h,d,x,y,z,color='ivory',parent=root){const o=mesh(new T.BoxGeometry(w,h,d),color,parent);o.position.set(x,y,z);return o;}
  function disk(r,h,x,y,z,color='ivory',parent=root){const o=mesh(new T.CylinderGeometry(r,r,h,80,1),color,parent);o.position.set(x,y,z);return o;}
  function ball(r,x,y,z,color='ivory',parent=root){const o=mesh(new T.SphereGeometry(r,32,20),color,parent);o.position.set(x,y,z);return o;}
  function line(points,r=.02,color='jade',parent=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(16,points.length*5),r,8,false),color,parent);}
  function texture(kind) {
    const n=128,data=new Uint8Array(n*n*4);let seed=57;
    const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const grain=kind==='wood'?Math.sin(x*.38+Math.sin(y*.025)*2)*18+Math.sin(x*1.7)*7:kind==='cloth'?((x%3===0?-1:1)+(y%3===0?-1:1))*13:Math.sin(x*.06+y*.14)*6;
      const v=Math.round(198+grain+noise()*45),i=(y*n+x)*4;
      data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
    }
    const map=new T.DataTexture(data,n,n);map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
  }
  function batch(group) {
    for(const child of [...group.children])if(child.isGroup)batch(child);
    const bins=new Map();
    for(const o of [...group.children]){
      if(!o.isMesh)continue;o.updateMatrix();const geo=o.geometry.clone();geo.applyMatrix4(o.matrix);
      if(!bins.has(o.material.uuid))bins.set(o.material.uuid,{m:o.material,p:[],n:[],uv:[],ix:[]});
      const b=bins.get(o.material.uuid),p=geo.attributes.position,n=geo.attributes.normal,u=geo.attributes.uv,offset=b.p.length/3;
      for(let i=0;i<p.count;i++){b.p.push(p.getX(i),p.getY(i),p.getZ(i));b.n.push(n.getX(i),n.getY(i),n.getZ(i));b.uv.push(u?.getX(i)??0,u?.getY(i)??0);}
      for(let i=0;i<(geo.index?.count??p.count);i++)b.ix.push(offset+(geo.index?geo.index.getX(i):i));
      geo.dispose();o.geometry.dispose();group.remove(o);
    }
    for(const b of bins.values()){
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.setIndex(b.ix);g.computeBoundingSphere();
      const o=new T.Mesh(g,b.m);o.castShadow=o.receiveShadow=true;group.add(o);
    }
  }
  function finish(id,preserved=[]) {
    root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(root),c=b.getCenter(new T.Vector3());
    for(const child of root.children)child.position.add(new T.Vector3(-c.x,-b.min.y,-c.z));
    root.updateMatrixWorld(true);
    for(const g of preserved)root.remove(g);
    const batches=new Map(),dispose=new Set();
    root.traverse(o=>{
      if(!o.isMesh)return;const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);
      if(!batches.has(o.material.uuid))batches.set(o.material.uuid,{material:o.material,p:[],n:[],uv:[],indices:[]});
      const a=batches.get(o.material.uuid),p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,offset=a.p.length/3;
      for(let i=0;i<p.count;i++){a.p.push(p.getX(i),p.getY(i),p.getZ(i));a.n.push(n.getX(i),n.getY(i),n.getZ(i));a.uv.push(u?.getX(i)??0,u?.getY(i)??0);}
      for(let i=0;i<(g.index?.count??p.count);i++)a.indices.push(offset+(g.index?g.index.getX(i):i));
      g.dispose();dispose.add(o.geometry);
    });
    root.clear();dispose.forEach(g=>g.dispose());
    for(const a of batches.values()){
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(a.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(a.uv,2));g.setIndex(a.indices);g.computeBoundingSphere();
      const o=new T.Mesh(g,a.material);o.castShadow=o.receiveShadow=true;root.add(o);
    }
    preserved.forEach(g=>root.add(g));
    const used=new Set();root.traverse(o=>{if(o.material)used.add(o.material);});for(const m of Object.values(materials))if(!used.has(m))m.dispose();
    root.userData={conceptual:true,artifactId:id};return root;
  }
  return {root,materials,mesh,box,disk,ball,line,finish,texture,batch};
}
