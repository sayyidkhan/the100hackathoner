// Deterministic miniature landscapes. All rigid geometry is batched by the studio.
export function nestashLandscapes(T,k,islands,live){
 const {materials:m,mesh,box,disk,line,group,slab,rounded,batch}=k;
 let seed=12017;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const mat=(color,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 Object.assign(m,{ground:mat(0xffffff,.97),rockA:mat(0x929080),rockB:mat(0x706e62),trunk:mat(0x64563d),canopy0:mat(0x324b29),canopy1:mat(0x536738),canopy2:mat(0x798447),canopy3:mat(0x9b9c60),paving:mat(0xd4c7aa),path:mat(0xb9af90),glassA:mat(0x315459,.15,.45),glassB:mat(0x506a6a,.19,.35),glassC:mat(0x718d84,.23,.28),frame:mat(0xa89972,.34,.65),foam:mat(0xc5e5dd,.27),waterDeep:mat(0x267b7c,.17,.28)});
 // Fine soil variation is mapped in actual terrain coordinates, never stretched over a sphere.
 const n=512,data=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const broad=Math.sin(x*.035+Math.sin(y*.027)*2)*8+Math.sin(x*.082-y*.054)*4,grain=(rnd()-.5)*28;
  const dry=Math.max(0,Math.sin(x*.019+y*.023)-.55)*48,p=(y*n+x)*4;
  data.set([86+broad+grain+dry,103+broad+grain+dry*.64,58+broad*.7+grain*.6+dry*.45,255],p);
 }
 const ground=new T.DataTexture(data,n,n);ground.colorSpace=T.SRGBColorSpace;ground.wrapS=ground.wrapT=T.RepeatWrapping;ground.magFilter=T.LinearFilter;ground.minFilter=T.LinearMipmapLinearFilter;ground.generateMipmaps=true;ground.anisotropy=8;ground.needsUpdate=true;
 m.ground.map=ground;m.ground.bumpMap=ground;m.ground.bumpScale=.018;
 const leafGeometry=new T.IcosahedronGeometry(1,0),rockGeometry=new T.IcosahedronGeometry(1,1);
 function rock(x,y,z,s,parent){const o=mesh(rockGeometry.clone(),rnd()>.4?'rockA':'rockB',parent);o.position.set(x,y,z);o.scale.set(s*(.8+rnd()*.5),s*(.65+rnd()*.9),s*(.7+rnd()*.5));o.rotation.set(rnd()*3,rnd()*3,rnd()*3);return o;}
 function tree(x,y,z,h,parent){
  const trunk=mesh(new T.CylinderGeometry(h*.019,h*.038,h*.72,7),'trunk',parent);trunk.position.set(x,y+h*.36,z);
  const broad=.20+rnd()*.12;
  for(let branch=0;branch<4;branch++){
   const a=branch*2.4,yy=y+h*(.38+branch*.12),dx=Math.cos(a)*h*.18,dz=Math.sin(a)*h*.18;
   line([[x,yy,z],[x+dx,yy+h*.18,z+dz]],h*.012,'trunk',parent);
  }
  for(let j=0;j<42;j++){
   const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*h*broad,yy=y+h*(.56+rnd()*.46);
   const o=mesh(leafGeometry.clone(),`canopy${Math.floor(rnd()*4)}`,parent);o.position.set(x+Math.cos(a)*r,yy,z+Math.sin(a)*r);o.scale.set(h*(.07+rnd()*.06),h*(.08+rnd()*.07),h*(.07+rnd()*.06));o.rotation.set(rnd()*3,rnd()*3,rnd()*3);
  }
 }
 const energy=islands[0],rotors=[],ripples=[],flows=[];
 const height=(x,z)=>.325+.12*Math.exp(-((x+.52)**2+(z+.36)**2)*7)+.09*Math.exp(-((x-.5)**2+(z+.6)**2)*9)+.012*Math.sin(x*17+z*9)*Math.cos(z*15);
 function terrain(radius,fn,parent){
  const p=[],uv=[],ix=[],steps=32,segments=112;
  for(let j=0;j<=steps;j++)for(let i=0;i<=segments;i++){
   const r=radius*j/steps,a=i/segments*Math.PI*2,x=Math.cos(a)*r,z=Math.sin(a)*r;p.push(x,fn(x,z),z);uv.push(x*.8+.5,z*.8+.5);
   if(j<steps&&i<segments){const q=j*(segments+1)+i;ix.push(q,q+1,q+segments+1,q+1,q+segments+2,q+segments+1);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(g,'ground',parent);
 }
 terrain(1.015,height,energy);
 // Inlaid service road follows the ground instead of cutting through it.
 const route=new T.CatmullRomCurve3([[-.96,.1],[-.69,.34],[-.24,.19],[.10,-.1],[.52,-.31],[.94,-.05]].map(([x,z])=>new T.Vector3(x,height(x,z)+.012,z)));
 const rp=[],ri=[];
 for(let i=0;i<=80;i++){const u=i/80,c=route.getPoint(u),t=route.getTangent(u);for(const side of [-1,1]){const x=c.x+t.z*.032*side,z=c.z-t.x*.032*side;rp.push(x,height(x,z)+.014,z);}if(i<80){const q=i*2;ri.push(q,q+2,q+1,q+1,q+2,q+3);}}
 const road=new T.BufferGeometry();road.setAttribute('position',new T.Float32BufferAttribute(rp,3));road.setIndex(ri);road.computeVertexNormals();mesh(road,'path',energy);
 for(let i=0;i<30;i++){const a=2.9+i*.103,r=.84+(rnd()-.5)*.12,x=Math.cos(a)*r,z=Math.sin(a)*r;rock(x,height(x,z),z,.035+rnd()*.06,energy);if(i%2===0)tree(x,height(x,z)+.02,z,.19+rnd()*.19,energy);}
 for(const [x,z] of [[.78,.19],[-.82,.08],[.08,-.86]])tree(x,height(x,z),z,.38,energy);
 function turbine(x,z,h){
  const y=height(x,z),g=group(x,y,z,energy);disk(.085,.026,0,.013,0,'stone',g);
  const mast=mesh(new T.CylinderGeometry(.020,.041,h,24),'white',g);mast.position.y=h/2;
  for(let i=0;i<6;i++){const flange=mesh(new T.TorusGeometry(.042-i*.003,.0025,5,20),'frame',g);flange.rotation.x=Math.PI/2;flange.position.y=h*i/6;}
  rounded(.085,.085,.20,0,h,-.012,'white',g,.025);
  const rotor=group(0,h,.12,g);rotor.name=`nestash-turbine-${rotors.length}`;
  for(let i=0;i<3;i++){
   const blade=group(0,0,0,rotor);blade.rotation.z=i*Math.PI*2/3;
   const shape=new T.Shape();shape.moveTo(-.02,.035);shape.bezierCurveTo(-.052,.18,-.045,.34,-.012,.56);shape.quadraticCurveTo(.006,.59,.014,.55);shape.lineTo(.023,.12);shape.quadraticCurveTo(.038,.05,-.02,.035);
   mesh(new T.ExtrudeGeometry(shape,{depth:.007,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:2,curveSegments:14}),'white',blade);
  }
  const hub=mesh(new T.SphereGeometry(.043,20,12),'white',rotor);hub.scale.z=1.5;hub.position.z=.02;batch(rotor);live.push(rotor);rotors.push(rotor);
 }
 turbine(-.55,-.08,1.27);turbine(.57,-.22,1.0);
 // Six framed modules with separate photovoltaic cells and thin silver busbars.
 for(let row=0;row<2;row++)for(let col=0;col<3;col++){
  const x=-.46+col*.43,z=.41+row*.31,g=group(x,height(x,z)+.095,z,energy);g.rotation.x=.27;
  box(.385,.016,.275,0,0,0,'frame',g);
  for(let cx=0;cx<4;cx++)for(let cz=0;cz<3;cz++){
   box(.084,.004,.080,-.136+cx*.09,.011,-.087+cz*.087,'solar',g);
   for(let b=0;b<2;b++)box(.001,.001,.073,-.158+cx*.09+b*.041,.014,-.087+cz*.087,'grid',g);
  }
  for(const xx of [-.13,.13])box(.011,.12,.012,xx,-.065,0,'frame',g);
 }
 // Reservoir: the higher blue basin feeds a curved concrete spillway into a lower pool.
 const water=islands[1];disk(.74,.02,0,.327,0,'waterDeep',water);
 const wallHeight=(x,z)=>.34+.23*Math.max(0,-z/.72)+.055*Math.sin(x*10+z*8)**2;
 const bank=terrain(.75,wallHeight,water); // remove front half, leaving an irregular forested shore
 const gi=bank.geometry.index.array,pp=bank.geometry.attributes.position,kept=[];
 for(let i=0;i<gi.length;i+=3){const z=(pp.getZ(gi[i])+pp.getZ(gi[i+1])+pp.getZ(gi[i+2]))/3;if(z<-.27)kept.push(gi[i],gi[i+1],gi[i+2]);}bank.geometry.setIndex(kept);bank.geometry.computeVertexNormals();
 for(let i=0;i<23;i++){const a=Math.PI+(.08+i/22*(Math.PI-.16)),x=Math.cos(a)*.63,z=Math.sin(a)*.63,y=wallHeight(x,z);rock(x,y-.015,z,.055+rnd()*.055,water);if(i%2===0)tree(x,y+.015,z,.18+rnd()*.16,water);}
 // Arc runs across the width; the continuous walkway is visibly thicker than the rail.
 const damCurve=[];
 for(let i=0;i<=40;i++){const x=-.63+i/40*1.26,z=.06+.18*(1-(x/.66)**2);damCurve.push([x,.59,z]);const wall=box(.033,.23,.075,x,.47,z,'stone',water);wall.rotation.y=Math.atan(-.36*x/.4356);}
 line(damCurve,.032,'stone',water);line(damCurve.map(([x,y,z])=>[x,y+.06,z+.035]),.005,'frame',water);
 for(let i=0;i<13;i++){const x=-.60+i*.10,z=.06+.18*(1-(x/.66)**2);box(.008,.074,.008,x,.625,z+.035,'frame',water);}
 for(let i=0;i<11;i++){
  const x=-.50+i*.10,z=.06+.18*(1-(x/.66)**2),flow=group(x,.46,z+.05,water);flow.name=`nestash-spillway-${i}`;
  const p=[-.024,.1,0,.024,.1,0,-.034,-.10,.08,.034,-.10,.08];const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex([0,2,1,1,2,3]);g.computeVertexNormals();mesh(g,'foam',flow);live.push(flow);flows.push(flow);
 }
 for(let i=0;i<7;i++){
  const ripple=mesh(new T.TorusGeometry(.05+i*.022,.002,5,28,Math.PI*1.2),'foam',water);ripple.rotation.x=-Math.PI/2;ripple.rotation.z=i*.83;ripple.position.set((i%3-1)*.25,.346,.34+(i%2)*.13);ripple.name=`nestash-ripple-${i}`;live.push(ripple);ripples.push(ripple);
 }
 // City architecture: recessed glass, proper floor slabs and slender vertical mullions.
 const city=islands[2];disk(.74,.018,0,.325,0,'paving',city);
 const buildings=[[-.32,-.03,.40,.43,.92],[.18,-.25,.41,.42,1.27],[.32,.29,.35,.32,.60]];
 for(const [bi,[x,z,w,d,h]] of buildings.entries()){
  const base=.35,levels=Math.round(h/.16),floor=h/levels;
  box(w-.025,h,d-.025,x,base+h/2,z,'glassA',city);
  for(let i=0;i<=levels;i++){
   const y=base+i*floor;slab(w+.05,d+.05,.018,x,y,z,'stone',city,.006);
   if(i<levels){
    for(let j=0;j<3;j++){
     box(w/3-.009,floor-.026,.006,x-w/2+w/6+j*w/3,y+floor/2,z+d/2+.002,['glassA','glassB','glassC'][(i+j+bi)%3],city);
     box(.006,floor-.026,d/3-.009,x-w/2-.002,y+floor/2,z-d/2+d/6+j*d/3,['glassA','glassB','glassC'][(i+j+1)%3],city);
    }
   }
  }
  for(let j=0;j<=3;j++){
   box(.009,h+.025,.016,x-w/2+j*w/3,base+h/2,z+d/2+.012,'frame',city);
   box(.016,h+.025,.009,x-w/2-.012,base+h/2,z-d/2+j*d/3,'frame',city);
  }
  for(const xx of [-w/2,w/2])for(const zz of [-d/2,d/2])box(.024,h+.03,.024,x+xx,base+h/2,z+zz,'stone',city);
  slab(w-.03,d-.03,.025,x,base+h+.026,z,'ground',city,.01);
  for(let j=0;j<6;j++){const a=j/6*Math.PI*2;tree(x+Math.cos(a)*w*.28,base+h+.035,z+Math.sin(a)*d*.28,.10+rnd()*.03,city);}
  box(w*.4,.05,d*.32,x,base+h+.05,z,'frame',city);
  slab(w+.05,.18,.018,x,base+.18,z+d/2+.09,'stone',city,.008);
 }
 for(let i=0;i<17;i++){const a=i/17*Math.PI*2;tree(Math.cos(a)*.66,.34,Math.sin(a)*.66,.19+rnd()*.16,city);}
 for(let i=0;i<8;i++){const x=-.5+i*.14;box(.07,.004,.10,x,.34,.49,'stone',city);}
 for(const x of [-.52,.49]){box(.16,.035,.065,x,.385,.37,'bark',city);for(const xx of [-.06,.06])box(.012,.06,.04,x+xx,.35,.37,'frame',city);}
 // Position water higher and to the rear: the spillway stays visible between turbines.
 return {rotors,ripples,flows};
}
