// Geometry and tactile materials for the multi-dimensional memory observatory.
export function memoryAtelier(T) {
  const root = new T.Group();
  let seed = 39039;
  const random = () => ((seed = (Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const canvas = document.createElement('canvas'); canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d'), data=ctx.createImageData(256,256);
  for(let i=0;i<data.data.length;i+=4){const v=155+random()*95;data.data.set([v,v,v,255],i);}ctx.putImageData(data,0,0);
  const fibre=new T.CanvasTexture(canvas);fibre.wrapS=fibre.wrapT=T.RepeatWrapping;fibre.repeat.set(2,2);
  // Continuous mineral veining: smooth value noise, not white-noise speckles.
  const lattice=Array.from({length:65*65},()=>random());
  const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy,s=u*u*(3-2*u),t=v*v*(3-2*v);const at=(a,b)=>lattice[((b%65+65)%65)*65+(a%65+65)%65];return T.MathUtils.lerp(T.MathUtils.lerp(at(ix,iy),at(ix+1,iy),s),T.MathUtils.lerp(at(ix,iy+1),at(ix+1,iy+1),s),t);};
  const mineral=document.createElement('canvas');mineral.width=mineral.height=512;const mc=mineral.getContext('2d'),md=mc.createImageData(512,512);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const nx=x/512,ny=y/512,n=noise(nx*7,ny*7)*.65+noise(nx*19,ny*19)*.25+noise(nx*47,ny*47)*.1;
    const wave=Math.sin(nx*21+ny*14+n*18),vein=Math.pow(1-Math.abs(wave),22),fine=Math.pow(1-Math.abs(Math.sin(nx*80-ny*49+n*27)),38)*.2;
    const v=vein+fine,g=random()*8;const i=(y*512+x)*4;
    md.data.set([12+n*17+v*100+g,24+n*22+v*76+g,42+n*30+v*44+g,255],i);
  }
  mc.putImageData(md,0,0);const marble=new T.CanvasTexture(mineral);marble.colorSpace=T.SRGBColorSpace;marble.wrapS=marble.wrapT=T.RepeatWrapping;marble.repeat.set(.55,.55);
  function mottled(base,spread){const c=document.createElement('canvas');c.width=c.height=256;const context=c.getContext('2d'),p=context.createImageData(256,256);for(let y=0;y<256;y++)for(let x=0;x<256;x++){const n=noise(x/20,y/20)*.55+noise(x/5,y/5)*.25+random()*.2;const fleck=random()>.995?22:0;for(let k=0;k<3;k++)p.data[(y*256+x)*4+k]=base[k]+n*spread[k]+fleck;p.data[(y*256+x)*4+3]=255;}context.putImageData(p,0,0);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;return tex;}
  const paperMap=mottled([210,196,172],[39,39,34]),coralMap=mottled([164,36,19],[74,48,30]);
  const standard=(color,roughness,extra={})=>new T.MeshStandardMaterial({color,roughness,...extra});
  const m={
    paper:standard(0xffffff,.9,{map:paperMap,bumpMap:fibre,bumpScale:.011}),
    edge:standard(0xc8bda7,.86,{bumpMap:fibre,bumpScale:.009}),
    ivory:standard(0xe9d9bd,.37,{bumpMap:fibre,bumpScale:.003}),
    ink:standard(0x101e32,.53,{bumpMap:fibre,bumpScale:.006}),
    stone:new T.MeshPhysicalMaterial({color:0xffffff,map:marble,roughness:.33,metalness:.12,clearcoat:.4,clearcoatRoughness:.27,bumpMap:fibre,bumpScale:.005}),
    lapis:new T.MeshPhysicalMaterial({color:0xb8d4ff,map:marble,roughness:.22,metalness:.1,clearcoat:.6}),
    blue:new T.MeshPhysicalMaterial({color:0x16477e,roughness:.3,metalness:.26,clearcoat:.45,clearcoatRoughness:.3}),
    coral:standard(0xffffff,.51,{map:coralMap,bumpMap:fibre,bumpScale:.014}),
    gold:standard(0xc4a06a,.33,{metalness:.76}),
    shadow:standard(0x554532,.92),
    route:standard(0x246baf,.3,{metalness:.38,emissive:0x1263ae,emissiveIntensity:.25}),
    spark:standard(0xc4eaff,.2,{emissive:0x79c4ff,emissiveIntensity:1.5}),
    ember:standard(0xff8652,.25,{emissive:0xe95f32,emissiveIntensity:.65}),
    glass:new T.MeshPhysicalMaterial({color:0xa9d5e6,roughness:.08,transmission:.78,thickness:.09,ior:1.45,transparent:true,opacity:.65}),
  };
  function group(x=0,y=0,z=0,yaw=0,parent=root){const o=new T.Group();o.position.set(x,y,z);o.rotation.y=yaw;parent.add(o);return o;}
  function mesh(geometry,mat,parent=root){const o=new T.Mesh(geometry,typeof mat==='string'?m[mat]:mat);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function rounded(w,h,r=.06){const s=new T.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w/3,h/3);s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  function plate(w,h,d,x,y,z,mat,parent=root,r=.06,bevel=.012){
    bevel=Math.min(bevel,d*.3);const geo=new T.ExtrudeGeometry(rounded(w-2*bevel,h-2*bevel,r),{depth:d-2*bevel,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:12,steps:1});geo.translate(0,0,-d/2+bevel);
    const o=mesh(geo,mat,parent);o.position.set(x,y,z);return o;
  }
  function slab(w,h,d,x,y,z,mat,parent=root,r=.06){const o=plate(w,d,h,x,y,z,mat,parent,r);o.rotation.x=-Math.PI/2;return o;}
  function disk(r,h,x,y,z,mat,parent=root){const o=mesh(new T.CylinderGeometry(r,r,h,64,1),mat,parent);o.position.set(x,y,z);return o;}
  function ball(r,x,y,z,mat,parent=root){const o=mesh(new T.SphereGeometry(r,24,16),mat,parent);o.position.set(x,y,z);return o;}
  function line(points,r,mat,parent=root){const curve=typeof points.getPoint === 'function'?points:new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,64,r,8,false),mat,parent);}
  function ring(r,t,x,y,z,mat,parent=root){const o=mesh(new T.TorusGeometry(r,t,10,112),mat,parent);o.position.set(x,y,z);return o;}
  function lettering(value,x,y,z,w,color='#233e59',parent=root,size=50){
    const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font=`500 ${size}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,512,64,990);
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
    const mat=new T.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,roughness:.9,side:T.DoubleSide});
    const o=mesh(new T.PlaneGeometry(w,w/8),mat,parent);o.position.set(x,y,z);o.userData.noShadow=true;return o;
  }
  function icon(kind,parent,scale=1,x=0,y=0,z=.04){
    const g=group(x,y,z,0,parent);g.scale.setScalar(scale);
    const stroke=(p,r=.013,mat='blue')=>line(p,r,mat,g);
    if(kind==='solar'){
      const panel=plate(.36,.24,.022,0,-.04,0,'blue',g,.02);panel.rotation.z=-.13;
      for(let j=0;j<3;j++)stroke([[-.15,-.13+j*.08,.018],[.15,-.09+j*.08,.018]],.005,'paper');
      for(let j=0;j<3;j++)stroke([[-.11+j*.10,-.13,.02],[-.13+j*.10,.09,.02]],.005,'paper');
      ring(.055,.009,.14,.20,0,'gold',g);
      for(let j=0;j<8;j++){const a=j*Math.PI/4;stroke([[.14+Math.cos(a)*.08,.2+Math.sin(a)*.08,0],[.14+Math.cos(a)*.10,.2+Math.sin(a)*.10,0]],.006,'gold');}
      stroke([[0,-.17,0],[0,-.23,0],[-.1,-.23,0]],.012);return g;
    }
    if(kind==='wind'){
      stroke([[0,-.25,0],[0,.1,0]],.014);ball(.03,0,.1,.025,'gold',g);
      for(let j=0;j<3;j++){const a=j*Math.PI*2/3;stroke([[Math.sin(a)*.03,.1+Math.cos(a)*.03,.01],[Math.sin(a+.18)*.13,.1+Math.cos(a+.18)*.13,.01],[Math.sin(a+.26)*.23,.1+Math.cos(a+.26)*.23,.01]],.017);}
      stroke([[-.12,-.25,0],[.12,-.25,0]],.014);return g;
    }
    if(kind==='robot'){
      plate(.24,.19,.027,0,.075,0,'blue',g,.04);
      for(const a of [-.065,.065])ball(.025,a,.08,.027,'paper',g);
      stroke([[0,.18,0],[0,.24,0]],.008);ball(.022,0,.25,0,'gold',g);
      stroke([[-.12,-.06,0],[-.20,-.16,0],[-.15,-.21,0]],.017);stroke([[.12,-.06,0],[.20,-.16,0],[.15,-.21,0]],.017);
      plate(.18,.12,.025,0,-.1,0,'blue',g,.025);return g;
    }
    if(kind==='chat'){
      plate(.33,.22,.025,0,.01,0,'paper',g,.05);
      stroke([[-.10,-.08,.003],[-.12,-.16,.003],[-.015,-.095,.003]],.019,'paper');
      for(const xx of [-.09,0,.09])ball(.014,xx,.015,.022,'coral',g);
    }
    return g;
  }
  // Consolidate immutable geometry without losing UVs, transparency or moving groups.
  function batch(parent){
    parent.updateWorldMatrix(true,true);const batches=new Map(),dispose=new Set(),inverse=new T.Matrix4().copy(parent.matrixWorld).invert();
    parent.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
      const key=o.material.uuid+!!o.userData.noShadow;
      if(!batches.has(key))batches.set(key,{mat:o.material,noShadow:o.userData.noShadow,p:[],n:[],uv:[]});const b=batches.get(key);
      for(const [attr,out,n] of [['position','p',3],['normal','n',3],['uv','uv',2]]){const a=geo.attributes[attr]?.array;if(a)for(const v of a)b[out].push(v);else for(let i=0;i<geo.attributes.position.count*n;i++)b[out].push(0);}
      dispose.add(o.geometry);geo.dispose();
    });
    parent.clear();for(const b of batches.values()){const geo=new T.BufferGeometry();for(const [a,key,n] of [['position','p',3],['normal','n',3],['uv','uv',2]])geo.setAttribute(a,new T.Float32BufferAttribute(b[key],n));geo.computeBoundingSphere();const o=mesh(geo,b.mat,parent);o.userData.noShadow=b.noShadow;o.castShadow=o.receiveShadow=!b.noShadow;}
    dispose.forEach(g=>g.dispose());
  }
  return {root,m,group,mesh,plate,slab,disk,ball,line,ring,lettering,icon,batch};
}
