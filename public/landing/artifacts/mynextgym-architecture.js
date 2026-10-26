// Architectural details for the district. All textures are deterministic and local.
// Window images sit behind real mullions and reveal walls, not on a solid facade.
export function districtArchitecture(T, {root, materials:m, mesh, box}) {
  let seed=2405;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function dataMap(w,h,pixel,repeat=1){
    const data=new Uint8Array(w*h*4);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const rgb=pixel(x/w,y/h,x,y),i=(y*w+x)*4;
      for(let c=0;c<3;c++)data[i+c]=Math.max(0,Math.min(255,rgb[c]));data[i+3]=255;
    }
    const t=new T.DataTexture(data,w,h);t.colorSpace=T.SRGBColorSpace;
    t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);
    t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=8;t.needsUpdate=true;return t;
  }
  const roomNames=[];
  for(let variant=0;variant<6;variant++){
    const warm=variant<3,blind=variant===2||variant===4;
    const map=dataMap(128,192,(u,v,x,y)=>{
      const ambient=warm?[165,133,91]:[44,65,78];
      let light=.65+.45*v;
      // Sidewalls, ceiling soffit and receding floor give each room depth.
      const side=u<.14+.10*(1-v)||u>.88-.08*(1-v);
      if(side)light*=.45;
      if(v<.23)light*=.70+v;
      if(v>.86)light*=.48;
      if(v>.79&&v<.815&&u>.19&&u<.82)light=warm?1.75:1.1;
      if(u>.22&&u<.78&&v>.30&&v<.335)light*=.32; // desk
      if(u>.37&&u<.60&&v>.18&&v<.29)light*=.35; // chair
      if(u>.56&&u<.70&&v>.34&&v<.46)light*=.34; // monitor
      if(u>.57&&u<.69&&v>.365&&v<.445)light=warm?.61:.85;
      if(u>.16&&u<.20&&v>.17&&v<.75)light*=.47; // shelving
      if(variant===1&&u>.73&&v<.49&&v>.26)light*=.43; // plant silhouette
      if(blind&&v>.38&&v<.79)light*=y%12<3?.48:1.13;
      const reflection=Math.max(0,1-Math.abs(u-.18-v*.24)/.06)*13;
      const grain=(random()-.5)*4;
      return ambient.map(c=>c*light+reflection+grain);
    });
    const name=`district-room-${variant}`;roomNames.push(name);
    m[name]=new T.MeshStandardMaterial({map,emissiveMap:map,emissive:0xffffff,emissiveIntensity:warm?.42:.06,roughness:.47,metalness:.12});
  }
  m.archMetal=new T.MeshStandardMaterial({color:0x526369,metalness:.72,roughness:.29});
  m.archEdge=new T.MeshStandardMaterial({color:0xb8b3a5,metalness:.45,roughness:.38});
  m.archCore=new T.MeshStandardMaterial({color:0x263538,roughness:.83});
  m.archGlass=new T.MeshPhysicalMaterial({color:0xa7c5c4,transparent:true,opacity:.12,roughness:.16,metalness:.25,depthWrite:false,side:T.DoubleSide});
  const masonry=dataMap(256,256,(u,v,x,y)=>{
    const row=Math.floor(y/22),joint=y%22<2||(x+(row%2)*32)%64<2;
    const n=(random()-.5)*12+(Math.sin(row*24)*4);
    return joint?[130+n,121+n,105+n]:[201+n,189+n,164+n];
  },2);
  m.archStone=new T.MeshStandardMaterial({color:0xffffff,map:masonry,bumpMap:masonry,bumpScale:.002,roughness:.9});
  const paving=dataMap(256,256,(u,v,x,y)=>{
    const joint=x%32<1||y%32<1,n=(random()-.5)*8;
    const cell=Math.sin(Math.floor(x/32)*31+Math.floor(y/32)*17)*5;
    return [0,1,2].map(c=>(joint?71:104)+n+cell+c*2);
  },4);
  m.map.map=paving;m.map.color.setHex(0xffffff);m.map.bumpMap=paving;m.map.bumpScale=.0015;
  const asphalt=dataMap(128,128,()=>{const n=random()*16;return [61+n,68+n,71+n];},3);
  m.road.map=asphalt;m.road.color.setHex(0xffffff);m.road.bumpMap=asphalt;m.road.bumpScale=.001;

  function group(x,y,z,angle=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=angle;root.add(g);return g;}
  function facade(w,h,rows,cols,parent,stone=false,balconies=false){
    const cw=w/cols,rh=h/rows;
    const pier=stone?.014:.007,beam=stone?.014:.009;
    const wall=stone?'archStone':'archMetal';
    for(let row=0;row<=rows;row++){
      box(w+.014,beam,.052,0,row*rh,.0,wall,parent);
      // A projecting sill catches light and gives each level an actual shadow.
      box(w+.018,.004,.065,0,row*rh-.006,.002,'archEdge',parent);
    }
    for(let col=0;col<=cols;col++)box(pier,h,.058,-w/2+col*cw,h/2,.003,wall,parent);
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const x=-w/2+(col+.5)*cw,y=(row+.5)*rh;
      const variant=Math.floor(random()*6);
      const pane=mesh(new T.PlaneGeometry(cw-pier,rh-beam),roomNames[variant],parent);pane.position.set(x,y,-.022);
      // Deep jambs and a recessed head reveal the thickness of the envelope.
      for(const sign of [-1,1])box(.003,rh-beam,.036,x+sign*(cw-pier)/2,y,-.005,'archEdge',parent);
      const glass=mesh(new T.PlaneGeometry(cw-pier,rh-beam),'archGlass',parent);glass.position.set(x,y,.011);
      box(.003,rh-beam,.010,x,y,.017,'archMetal',parent);
      if(variant===2)for(let k=0;k<4;k++)box(cw-.025,.003,.012,x,y+.018+k*.012,.019,'archEdge',parent);
    }
    if(balconies)for(let row=1;row<rows;row++){
      const y=row*rh;
      box(w*.94,.014,.095,0,y,.044,'limestone',parent);
      box(w*.94,.003,.006,0,y+.071,.086,'archEdge',parent);
      box(w*.94,.06,.003,0,y+.037,.086,'archGlass',parent);
      for(const x of [-w*.46,0,w*.46])box(.004,.07,.005,x,y+.038,.087,'archMetal',parent);
      box(w*.23,.026,.025,-w*.28,y+.025,.059,'park',parent);
    }
  }
  function building(x,z,w,d,h,{office=false,low=false,index=0}={}){
    const bottom=low?.58:.60;
    const rows=low?Math.max(2,Math.round(h/.13)):office?10:6;
    const cols=low?Math.max(2,Math.round(w/.115)):office?4:3;
    box(w-.06,h-.01,d-.06,x,bottom+h/2,z,'archCore');
    for(const [fx,fz,angle,width,columns] of [[x,z+d/2,0,w,cols],[x,z-d/2,Math.PI,w,cols],[x+w/2,z,Math.PI/2,d,Math.max(2,Math.round(d/.14))],[x-w/2,z,-Math.PI/2,d,Math.max(2,Math.round(d/.14))]]){
      facade(width,h,rows,columns,group(fx,bottom,fz,angle),low,!office&&!low);
    }
    // Roof perimeter is a thin parapet with a recessed membrane, not a solid cap.
    box(w+.028,.018,d+.028,x,bottom+h+.007,z,'archEdge');
    box(w-.025,.009,d-.025,x,bottom+h+.02,z,'road');
    for(const sign of [-1,1]){
      box(w,.047,.014,x,bottom+h+.043,z+sign*(d/2-.005),'limestone');
      box(.014,.047,d,x+sign*(w/2-.005),bottom+h+.043,z,'limestone');
    }
    // Recessed plant beds, service hatch and ductwork at a believable scale.
    box(w*.36,.027,d*.30,x-w*.23,bottom+h+.035,z-d*.22,'park');
    box(w*.27,.052,d*.24,x+w*.20,bottom+h+.05,z,'concrete');
    for(let j=0;j<6;j++)box(w*.25,.003,.006,x+w*.20,bottom+h+.078,z-d*.09+j*d*.034,'archMetal');
    if(!low){
      for(let j=0;j<4;j++)box(w*.25,.004,.014,x-w*.18,bottom+h+.037,z+d*.06+j*.025,'bark');
      // Street-level canopy and recessed double door.
      box(w*.8,.018,.13,x,bottom+.17,z+d/2+.045,'archMetal');
      box(w*.65,.006,.07,x,bottom+.153,z+d/2+.05,'warmWindow');
      for(const sign of [-1,1])box(.005,.13,.006,x+sign*w*.13,bottom+.075,z+d/2+.027,'archEdge');
    } else {
      // Striped canvas awning, display window, fascia and door handle.
      for(let j=0;j<8;j++){
        const shade=box(w/8,.008,.09,x-w/2+(j+.5)*w/8,bottom+.14,z+d/2+.035,j%2?'cream':index%2?'teal':'brick');shade.rotation.x=.12;
      }
      box(w,.03,.013,x,bottom+.17,z+d/2+.01,index%2?'teal':'brick');
      box(.005,.027,.009,x+w*.29,bottom+.075,z+d/2+.029,'archEdge');
    }
  }

  // Thousands of individual leaves share one geometry and one draw call.
  const leaves=[],leafColors=[0x405e34,0x638044,0x779453,0x526e3c,0x96a66a];
  function branch(a,b,r,parent=root){
    const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
    const o=mesh(new T.CylinderGeometry(r*.42,r,delta.length(),7),'bark',parent);
    o.position.copy(start).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  }
  function tree(x,z,size=.12,y=.58){
    const height=size*2.4,top=y+height;
    branch([x,y,z],[x+.01,top,z],size*.075);
    for(let b=0;b<5;b++){
      const a=b*2.399,dx=Math.cos(a)*size*.52,dz=Math.sin(a)*size*.52,cy=top+(b%3)*size*.28;
      branch([x,y+height*.55,z],[x+dx,cy,z+dz],size*.035);
      for(let j=0;j<58;j++){
        const az=random()*Math.PI*2,cos=random()*2-1,rr=Math.cbrt(random())*size*.68;
        leaves.push({x:x+dx+Math.cos(az)*Math.sqrt(1-cos*cos)*rr,y:cy+cos*rr*.8,z:z+dz+Math.sin(az)*Math.sqrt(1-cos*cos)*rr,scale:size*(.10+random()*.10),angle:random()*Math.PI*2,color:leafColors[Math.floor(random()*leafColors.length)]});
      }
    }
  }
  function finishTrees(){
    const geometry=new T.SphereGeometry(1,5,3);
    const mat=new T.MeshStandardMaterial({color:0xffffff,roughness:.86,side:T.DoubleSide});
    const cloud=new T.InstancedMesh(geometry,mat,leaves.length);cloud.name='mynextgym-botanical-canopy';
    const o=new T.Object3D();
    leaves.forEach((l,i)=>{o.position.set(l.x,l.y,l.z);o.rotation.set(l.angle*.3,l.angle,l.angle*.7);o.scale.set(l.scale,l.scale*.28,l.scale*.6);o.updateMatrix();cloud.setMatrixAt(i,o.matrix);cloud.setColorAt(i,new T.Color(l.color));});
    cloud.instanceMatrix.needsUpdate=true;cloud.instanceColor.needsUpdate=true;cloud.computeBoundingBox();cloud.computeBoundingSphere();root.add(cloud);return cloud;
  }
  return {building,tree,finishTrees,roomNames};
}
