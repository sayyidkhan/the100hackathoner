// Long Taa Borneo: a timber longhouse in a layered paper river landscape.
export function createArtifact(T) {
  const root=new T.Group();root.name="long-taa-borneo";
  const plants=[],crowns=[],palmFronds=[];
  const moving=(o,name)=>{o.name=name;o.userData.motion=true;return o;};
  let seed=79; const pixels=new Uint8Array(128*128*4);
  for(let i=0;i<pixels.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=125+(seed/4294967296-.5)*75;pixels[i]=pixels[i+1]=pixels[i+2]=n;pixels[i+3]=255;}
  const grain=new T.DataTexture(pixels,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(4,4);grain.needsUpdate=true;
  const paper=(color)=>new T.MeshStandardMaterial({color,roughness:.83,bumpMap:grain,bumpScale:.009,side:T.DoubleSide});
  const mat={cream:paper(0xf1dfbf),light:paper(0xffedcf),shade:paper(0xc4aa82),red:paper(0xba3527),redDark:paper(0x7b201b),blue:paper(0x3b6594),blueDark:paper(0x142d47),blueLight:paper(0x6487ad),gold:paper(0xd9b071),ink:paper(0x66553e),glow:new T.MeshStandardMaterial({color:0xffe9b3,emissive:0xffbb51,emissiveIntensity:1.4,roughness:.6})};
  mat.sage=paper(0x788365);mat.leaf=paper(0x536950);mat.sky=paper(0xf5d798);mat.hair=paper(0x453c31);
  const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
  const mesh=(geo,c='cream',p=root)=>{const m=new T.Mesh(geo,mat[c]);m.castShadow=m.receiveShadow=true;p.add(m);return m;};
  const box=(w,h,d,x,y,z,c='cream',p=root)=>{const m=mesh(new T.BoxGeometry(w,h,d),c,p);m.position.set(x,y,z);return m;};
  function roundShape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
  function extrude(s,d,c,p=root,bevel=.025){return mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:16}),c,p);}
  function rounded(w,h,d,x,y,z,c='cream',p=root,r=.05){const m=extrude(roundShape(w,h,r),d,c,p);m.position.set(x,y,z-d/2);return m;}
  function disk(r,h,x,y,z,c='cream',p=root){const m=mesh(new T.CylinderGeometry(r,r,h,48),c,p);m.position.set(x,y,z);return m;}
  function faceDisk(r,h,x,y,z,c='cream',p=root){const m=disk(r,h,x,y,z,c,p);m.rotation.x=Math.PI/2;return m;}
  function rod(a,b,r,c='cream',p=root){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av);const m=mesh(new T.CylinderGeometry(r,r,v.length(),12),c,p);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;}
  function path(points,r,c,p=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),32,r,8,false),c,p);}
  function polygon(points,d,c,p=root){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return extrude(s,d,c,p,.004);}
  function surface(nx,ny,sample,c,p=root){const pos=[],uv=[],idx=[];for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){pos.push(...sample(i/nx,j/ny));uv.push(i/nx,j/ny);if(i<nx&&j<ny){let a=j*(nx+1)+i;idx.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return mesh(g,c,p);}
  const sphere=(x,y,z,sx,sy,sz,c='cream',p=root)=>{const m=mesh(new T.SphereGeometry(1,24,16),c,p);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;};
  const flat=(w,d,h,x,y,z,c='cream',p=root,r=.08)=>{const m=rounded(w,d,h,0,0,0,c,p,r);m.rotation.x=-Math.PI/2;m.position.set(x,y-h/2,z);return m;};
  mat.timber=paper(0xb7986b);mat.bamboo=paper(0xd9bf94);mat.shadow=paper(0x674a2d);
  mat.roof=paper(0xe3cba5);mat.foliage=paper(0xe8d6b4);
  mat.water=new T.MeshPhysicalMaterial({color:0x073a67,roughness:.19,metalness:.20,clearcoat:.8,clearcoatRoughness:.14});
  // A seamless, moving normal field gives the blue water small traveling highlights.
  const waterPixels=new Uint8Array(128*128*4);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    const u=x/128*Math.PI*2,v=y/128*Math.PI*2,i=(y*128+x)*4;
    const nx=.28*Math.cos(u*3+v*2)+.12*Math.cos(u*7-v*3);
    const ny=.20*Math.cos(u*3+v*2)-.14*Math.cos(u*7-v*3);
    const n=new T.Vector3(nx,ny,1).normalize();
    waterPixels[i]=(n.x*.5+.5)*255;waterPixels[i+1]=(n.y*.5+.5)*255;waterPixels[i+2]=(n.z*.5+.5)*255;waterPixels[i+3]=255;
  }
  const waterNormals=new T.DataTexture(waterPixels,128,128,T.RGBAFormat);
  waterNormals.wrapS=waterNormals.wrapT=T.RepeatWrapping;
  waterNormals.magFilter=waterNormals.minFilter=T.LinearFilter;waterNormals.repeat.set(.75,.75);waterNormals.needsUpdate=true;
  mat.water.normalMap=waterNormals;mat.water.normalScale.set(.55,.55);
  // Rounded topographic island, with a continuous S-shaped river cut through both banks.
  const hw=4.85,hd=2.62,baseX=.45,radius=1.02,river=x=>.32+.40*Math.sin(x*1.35)+.22*x+.35*Math.exp(-(((x-.4)/1.1)**2));
  function outline(inset=0){const pts=[],w=hw-inset,d=hd-inset,r=radius;
    for(const [cx,cz,start] of [[w-r,d-r,0],[-w+r,d-r,Math.PI/2],[-w+r,-d+r,Math.PI],[w-r,-d+r,Math.PI*1.5]])
      for(let i=0;i<=25;i++){const a=start+i/25*Math.PI/2;const x=baseX+cx+r*Math.cos(a),z=cz+r*Math.sin(a);pts.push([x,z-Math.sign(z)*.16*(.5+.5*Math.cos(x*1.5))*Math.pow(Math.abs(z)/hd,4)]);}
    return pts;
  }
  function terrain(points,y,h,c){const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:32});g.rotateX(-Math.PI/2);const m=mesh(g,c);m.position.y=y;return m;}
  terrain(outline(),0,.25,'cream');terrain(outline(.025),.251,.025,'water');
  for(let side of [-1,1])for(let layer=0;layer<8;layer++){
    const inset=.055+layer*.055,w=hw-inset,d=hd-inset;
    const edge=x=>d-radius+Math.sqrt(Math.max(0,radius*radius-Math.max(0,Math.abs(x-baseX)-(w-radius))**2))-.16*(.5+.5*Math.cos(x*1.5));
    // Clip each bank into real polygons; never extrude zero-width strips across water.
    let segment=[];const segments=[];
    for(let i=0;i<=240;i++){
      const x=baseX-w+i/240*w*2,e=edge(x),bank=river(x)+side*(.46+layer*.065);
      if(side*bank<e-.002)segment.push([x,Math.max(-e,Math.min(e,bank))]);
      else if(segment.length){segments.push(segment);segment=[];}
    }
    if(segment.length)segments.push(segment);
    for(const points of segments){if(points.length<2)continue;const outer=points.map(([x])=>[x,side*edge(x)]).reverse();terrain([...points,...outer],.28+layer*.058,.055,layer%3===0?'light':'cream');}

  }
  // One instanced draw call for small wavelets drifting along the river's curve.
  const rippleGeometry=new T.RingGeometry(.115,.139,24,1,.15,Math.PI*.82);
  rippleGeometry.rotateX(-Math.PI/2);
  const rippleMaterial=new T.MeshBasicMaterial({color:0xa1c9df,transparent:true,opacity:.68,depthWrite:false,side:T.DoubleSide});
  const ripples=moving(new T.InstancedMesh(rippleGeometry,rippleMaterial,36),'river-current');
  ripples.userData.noShadow=true;ripples.frustumCulled=false;
  ripples.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(ripples);
  const ripplePose=new T.Object3D();
  // The longhouse stands above the water, with open rooms behind a deep veranda.
  const building=group(-.20,0,-.61),deck=1.86,front=.81,back=-.93,width=5.68;
  box(width,.10,1.95,0,deck,-.02,'timber',building);
  for(let i=0;i<83;i++)box(.064,.028,1.92,-2.79+i*.068,deck+.063,-.02,i%4?'bamboo':'timber',building);
  for(const z of [back,.76]){
    box(5.73,.105,.075,0,deck-.12,z,'timber',building);
    for(let i=0;i<8;i++){
      const x=-2.69+i*.768;
      rod([x,.35,z],[x,deck+.04,z],.041,'timber',building);
      // Each bay is cross-braced with two slender timbers, not a single diagonal.
      if(i<7){rod([x,.56,z],[x+.768,deck-.19,z],.018,'timber',building);rod([x,deck-.19,z],[x+.768,.56,z],.018,'bamboo',building);}
    }
  }
  // Room partitions, woven bamboo wall panels, open doorways and furnished veranda.
  box(5.48,1.16,.055,0,2.49,-.84,'bamboo',building);
  for(let i=0;i<7;i++){
    const x=-2.37+i*.79;
    box(.038,1.18,1.25,x-.39,2.49,-.27,'timber',building);
    // Door voids expose a dark interior; solid panels sit beside them.
    box(.32,.99,.035,x-.19,2.40,-.31,'shadow',building);
    box(.31,1.13,.045,x+.19,2.49,-.27,'bamboo',building);
    for(let j=0;j<13;j++)box(.009,1.08,.012,x+.052+j*.022,2.49,-.235,'timber',building);
    for(let j=0;j<18;j++)box(.30,.006,.013,x+.19,1.98+j*.06,-.224,'shade',building);
    for(const dx of [-.36,-.01])box(.029,1.17,.05,x+dx,2.49,-.25,'timber',building);
    box(.78,.09,.05,x,3.025,-.25,'timber',building);
    // A few shutters swung away from the doorframe.
    if(i%2===0){const shutter=group(x-.35,2.43,-.18,building);shutter.rotation.y=-.64;box(.16,.94,.025,.08,0,0,'bamboo',shutter);for(let j=0;j<14;j++)box(.145,.012,.009,.08,-.42+j*.064,.021,'timber',shutter);}
    if(i%2===1){
      flat(.42,.31,.035,x,2.22,.30,'timber',building,.015);
      for(const dx of [-.16,.16])for(const z of [.19,.40])rod([x+dx,deck+.08,z],[x+dx,2.20,z],.012,'timber',building);
      flat(.23,.24,.028,x+.23,2.06,.34,'bamboo',building,.012);
      for(const dx of [.14,.31])for(const z of [.24,.42])rod([x+dx,deck+.08,z],[x+dx,2.05,z],.01,'timber',building);
      box(.22,.19,.022,x+.23,2.18,.44,'timber',building);
    }
  }
  // Right end wall and triangular gable, articulated with framing and woven slats.
  for(const x of [-2.80,2.80]){
    // The right gable has a real side doorway opening onto the stairs.
    const panels=x>0?[[-.87,-.11],[.51,.63]]:[[-.87,.63]];
    for(const [lo,hi] of panels){
      const center=(lo+hi)/2;
      box(.05,1.18,hi-lo,x,2.49,center,'bamboo',building);
      for(let z=lo+.015;z<hi;z+=.027)box(.012,1.13,.012,x+Math.sign(x)*.032,2.49,z,'timber',building);
      for(let i=0;i<16;i++)box(.015,.008,hi-lo,x+Math.sign(x)*.04,1.97+i*.07,center,'shade',building);
      for(const y of [2.14,2.86])box(.07,.055,hi-lo,x,y,center,'timber',building);
    }
    for(const z of (x>0?[-.85,-.12,.52,.62]:[-.85,-.12,.62]))box(.07,1.25,.04,x,2.48,z,'timber',building);
    if(x>0){box(.055,.14,.62,x,3.01,.20,'bamboo',building);box(.085,.045,.66,x,2.93,.20,'timber',building);}
    for(let i=0;i<44;i++){const z=-.97+i*.045,h=.96-Math.abs(z+.02)*.98;if(h>0)box(.035,h,.025,x,3.08+h/2,z,'bamboo',building);}
    rod([x,3.06,-1.08],[x,4.10,-.02],.024,'timber',building);rod([x,4.10,-.02],[x,3.06,1.04],.024,'timber',building);
    rod([x,3.08,-.02],[x,4.08,-.02],.022,'timber',building);
  }
  // The front rail is uninterrupted; access is through the right-hand end.
  function rail(a,b,base,height=.38,color='timber',p=building){
    rod([a[0],base+height,a[1]],[b[0],base+height,b[1]],.018,color,p);
    rod([a[0],base+.055,a[1]],[b[0],base+.055,b[1]],.012,color,p);
    const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.065);
    for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;rod([x,base+.055,z],[x,base+height,z],.0065,color,p);}
  }
  rail([-2.80,front],[2.80,front],deck+.09);
  rail([-2.80,front],[-2.80,-.20],deck+.09);rail([2.80,front],[2.80,.52],deck+.09);rail([2.80,-.12],[2.80,-.20],deck+.09);
  for(let i=0;i<8;i++){const x=-2.79+i*.797;rod([x,deck,front],[x,3.12,front],.027,'timber',building);box(.09,.06,.09,x,2.36,front,'bamboo',building);}
  // Thin, broad pitched roof with fine thatch strips and overlapping horizontal courses.
  const ridgeY=4.10,ridgeZ=-.02,eaveY=3.02,roofHalf=1.34;
  for(const side of [-1,1]){
    surface(1,1,(u,v)=>[-3.04+u*6.08,ridgeY-v*(ridgeY-eaveY),ridgeZ+side*v*roofHalf],'roof',building);
    for(let i=0;i<153;i++){
      const x=-3.025+i*.0398;
      rod([x,ridgeY+.006,ridgeZ],[x,eaveY+.006,ridgeZ+side*roofHalf],i%4===0?.0038:.0022,i%4===0?'bamboo':'shade',building);
    }
    for(const v of [.34,.68,1])rod([-3.05,ridgeY-v*(ridgeY-eaveY)+.008,ridgeZ+side*v*roofHalf],[3.05,ridgeY-v*(ridgeY-eaveY)+.008,ridgeZ+side*v*roofHalf],.008,'bamboo',building);
    for(const x of [-3.055,3.055])rod([x,ridgeY,ridgeZ],[x,eaveY,ridgeZ+side*roofHalf],.019,'timber',building);
    // Rafters under the eaves read as a roof thickness from an orbiting view.
    for(let i=0;i<16;i++){const x=-2.95+i*.393;rod([x,ridgeY-.036,ridgeZ],[x,eaveY-.036,ridgeZ+side*roofHalf],.016,'timber',building);}
  }
  rod([-3.08,4.12,ridgeZ],[3.08,4.12,ridgeZ],.023,'bamboo',building);
  // Side stair and straight red boardwalk share one axis, matching the artwork.
  const stairs=group(2.67,0,-.41);stairs.rotation.y=Math.PI/2;
  const stepD=.11,stepH=.12,stepCount=9;
  for(let i=0;i<stepCount;i++){
    const y=deck-i*stepH,z=i*stepD;
    box(.56,.045,.155,0,y,z,'red',stairs);
    box(.56,stepH,.024,0,y-stepH/2,z+.065,'redDark',stairs);
  }
  for(const side of [-1,1]){
    const x=side*.30;
    rod([x,deck-.06,-.06],[x,.84,.94],.025,'timber',stairs);
    rod([x,deck+.39,-.06],[x,1.29,.94],.015,'timber',stairs);
    for(let i=0;i<stepCount;i++)rod([x,deck-i*stepH,i*stepD],[x,deck-i*stepH+.37,i*stepD],.010,'timber',stairs);
  }
  // As in the artwork, the red walk continues straight out from the side stairs.
  // Keep it on the right bank, rather than turning across the river in front.
  const start=new T.Vector3(3.55,.90,-.41),end=new T.Vector3(5.05,.90,-.41),v=end.clone().sub(start),length=v.length();
  const bridge=group(start.x,start.y,start.z);bridge.rotation.y=-Math.atan2(v.z,v.x);
  box(length+.08,.06,.56,length/2,0,0,'red',bridge);
  for(let i=0;i<=19;i++)box(.008,.008,.55,i/19*length,.035,0,'redDark',bridge);
  for(const side of [-1,1]){
    rod([0,-.06,side*.255],[length,-.06,side*.255],.025,'redDark',bridge);
    rod([0,.38,side*.28],[length,.38,side*.28],.013,'red',bridge);
    rod([0,.18,side*.28],[length,.18,side*.28],.008,'red',bridge);
    for(let i=0;i<=5;i++)rod([i/5*length,-.55,side*.28],[i/5*length,.40,side*.28],.016,'red',bridge);
  }
  // Curved, folded paper blades: no flat triangular palm fans.
  function blade(a,b,width,c='foliage',p=root,bend=.12){
    const av=new T.Vector3(...a),bv=new T.Vector3(...b),dir=bv.clone().sub(av),side=new T.Vector3(-dir.z,0,dir.x).normalize();
    if(side.length()<.01)side.set(1,0,0);
    surface(2,8,(u,v)=>{const q=av.clone().lerp(bv,v),spread=Math.pow(Math.sin(v*Math.PI),.75)*width;
      q.addScaledVector(side,(u-.5)*spread*2);q.y+=Math.sin(v*Math.PI)*(bend-Math.abs(u-.5)*width*.5);return q.toArray();},c,p);
  }
  function palm(x,z,h,phase=0){
    const g=moving(group(x,.73,z),'palm-'+plants.length),lean=.10+Math.sin(phase)*.10;plants.push({g,phase,amplitude:.110});
    path([[0,0,0],[lean*.4,h*.5,.02],[lean,h,0]],.035,'bamboo',g);
    for(let i=1;i<20;i++){const y=i/20*h;const ring=mesh(new T.TorusGeometry(.037,.003,4,12),'shade',g);ring.rotation.x=Math.PI/2;ring.position.set(lean*(i/20)**1.4,y,.01);}
    const fronds=moving(group(lean,h,0,g),'palm-crown-'+crowns.length);crowns.push({g:fronds,phase});
    const crown=new T.Vector3();
    for(let f=0;f<8;f++){
      const angle=phase+f*Math.PI/4,reach=.90+h*.13,axis=new T.Vector3(Math.cos(angle),0,Math.sin(angle));
      const frond=moving(group(0,0,0,fronds),'palm-frond-'+palmFronds.length);
      palmFronds.push({g:frond,axis:new T.Vector3(-Math.sin(angle),0,Math.cos(angle)),phase:phase+f*.83});
      const curve=new T.CatmullRomCurve3([crown,crown.clone().addScaledVector(axis,reach*.35).add(new T.Vector3(0,.35,0)),crown.clone().addScaledVector(axis,reach*.75).add(new T.Vector3(0,.12,0)),crown.clone().addScaledVector(axis,reach).add(new T.Vector3(0,-.38,0))]);
      mesh(new T.TubeGeometry(curve,20,.009,5,false),'bamboo',frond);
      for(let i=1;i<=17;i++){
        const t=i/19,base=curve.getPoint(t),perp=new T.Vector3(-axis.z,0,axis.x),w=.22*Math.sin(t*Math.PI)+.035;
        for(const sign of [-1,1]){
          const tip=base.clone().addScaledVector(perp,sign*w).addScaledVector(axis,.12).add(new T.Vector3(0,-.08-.05*t,0));
          blade(base.toArray(),tip.toArray(),.087*(1-t*.50),i%3?'foliage':'light',frond,.035);
        }
      }
    }
  }
  function shrub(x,z,h,phase=0,broad=false){
    const g=moving(group(x,.73,z),'undergrowth-'+plants.length);plants.push({g,phase:phase+x*.7+z*.4,amplitude:broad?.045:.070});
    for(let i=0;i<7;i++){
      const a=phase+i*2.4,reach=h*(.40+(i%3)*.13),tip=[Math.cos(a)*reach,h*(.65+(i%3)*.18),Math.sin(a)*reach];
      path([[0,0,0],[tip[0]*.35,tip[1]*.60,tip[2]*.35],tip],.007,'bamboo',g);
      if(broad){
        const base=[tip[0]*.35,tip[1]*.5,tip[2]*.35];blade(base,tip,h*.22,'foliage',g,.10);
        // Cut-paper leaf ribs and slight splits along each side.
        for(let j=1;j<7;j++){const t=j/8,center=base.map((v,k)=>v+(tip[k]-v)*t);for(const sign of [-1,1]){const end=[center[0]-Math.sin(a)*h*.12*Math.sin(t*Math.PI)*sign,center[1]-.03,center[2]+Math.cos(a)*h*.12*Math.sin(t*Math.PI)*sign];rod(center,end,.003,'shade',g);}}
      }else{
        const axis=new T.Vector3(tip[0],0,tip[2]).normalize(),perp=new T.Vector3(-axis.z,0,axis.x);
        for(let j=1;j<10;j++){const t=j/10,base=new T.Vector3(tip[0]*t,tip[1]*Math.sin(t*Math.PI*.6),tip[2]*t);for(const sign of [-1,1]){const end=base.clone().addScaledVector(perp,sign*h*.22*Math.sin(t*Math.PI)).addScaledVector(axis,h*.12);end.y-=.06;blade(base.toArray(),end.toArray(),h*.035,'foliage',g,.025);}}
      }
    }
  }
  // Tall canopy behind the building, lower leaves framing the river in front.
  for(const a of [[-3.32,-1.62,3.25,.2],[-2.50,-2.06,3.40,1.1],[2.95,-1.80,2.95,.6],[3.65,-1.62,2.35,1.7],[-3.62,.35,1.65,.8]])palm(...a);
  for(const a of [[-3.54,1.45,1.38,.4,true],[-3.05,1.85,.88,1,false],[-1.55,1.85,.92,.2,false],[-2.90,-1.35,1.22,.2,true],[4.55,-1.35,1.10,.9,true],[4.18,-1.35,.85,1.2,true],[2.70,1.78,.55,.5,false],[4.85,-1.20,.55,.7,false],[-3.65,-.70,1.80,1,true],[2.92,-1.54,1.45,2,true]])shrub(...a);
  for(const [x,z] of [[-1.85,1.35],[-2.8,1.48],[1.64,1.58],[2.18,2.02],[3.1,2.10]])shrub(x,z,.28,.4,true);
  const duration=24;
  function animate(elapsed){
    const t=((elapsed%duration)+duration)%duration,cycle=t/duration*Math.PI*2;
    for(const {g,phase,amplitude} of plants){
      // A readable breeze moves each rooted tree, with a separate flexible crown.
      g.rotation.z=amplitude*(Math.sin(cycle*3+phase)+.25*Math.sin(cycle*5+phase*1.7));
      g.rotation.x=amplitude*.65*Math.sin(cycle*3+phase*.8);
    }
    for(const {g,phase} of crowns){
      g.rotation.z=.105*Math.sin(cycle*3+phase+.8);
      g.rotation.x=.070*Math.sin(cycle*4+phase*1.3);
    }
    for(const {g,axis,phase} of palmFronds){
      // Independent frond lift and flutter make the wind readable across the canopy.
      const bend=.14*Math.sin(cycle*5+phase)+.035*Math.sin(cycle*11+phase*1.9);
      g.quaternion.setFromAxisAngle(axis,bend);
    }
    waterNormals.offset.set(-t/duration*3,t/duration*2);
    for(let i=0;i<ripples.count;i++){
      const progress=(t/duration*2+i/ripples.count)%1,x=-4.02+progress*8.90;
      const lane=((i%4)-1.5)*.115,z=river(x)+lane;
      const fade=Math.min(1,progress*14,(1-progress)*14);
      const shimmer=.70+.30*Math.sin(cycle*4+i*1.7);
      ripplePose.position.set(x,.285+.002*Math.sin(cycle*3+i),z);
      ripplePose.rotation.y=-Math.atan2(river(x+.025)-river(x-.025),.05);
      ripplePose.scale.set(1.60*fade*shimmer,1,.85*fade*shimmer);
      ripplePose.updateMatrix();ripples.setMatrixAt(i,ripplePose.matrix);
    }
    ripples.instanceMatrix.needsUpdate=true;
  }
  animate(0);root.updateMatrixWorld(true);
  // Allow a little framing margin for the gently moving crowns.
  const framingPoints=[];root.children.filter(o=>o!==ripples).forEach(o=>{const b=new T.Box3().setFromObject(o);if(o.userData.motion)b.expandByScalar(.45);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));});
  // Batch static geometry locally inside each tree, retaining its wind pivot.
  function batchBranch(parent){
    const keep=parent.children.filter(o=>o.userData.motion);
    for(const branch of keep)if(!branch.isMesh)batchBranch(branch);
    const inverse=parent.matrixWorld.clone().invert(),batches=new Map();
    for(const branch of parent.children.filter(o=>!keep.includes(o)))branch.traverse(o=>{
      if(!o.isMesh)return;
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
      if(!batches.has(o.material))batches.set(o.material,{p:[],n:[],uv:[]});const b=batches.get(o.material);
      for(const v of g.attributes.position.array)b.p.push(v);for(const v of g.attributes.normal.array)b.n.push(v);
      if(g.attributes.uv)for(const v of g.attributes.uv.array)b.uv.push(v);else for(let i=0;i<g.attributes.position.count;i++)b.uv.push(0,0);
      g.dispose();o.geometry.dispose();
    });
    parent.clear();for(const o of keep)parent.add(o);
    for(const [material,b] of batches){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();const m=new T.Mesh(g,material);m.castShadow=m.receiveShadow=true;parent.add(m);}
  }
  batchBranch(root);
  root.userData={conceptual:true,artifactId:79,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:.72,initialElevation:.40,framingPoints,animate,animationDuration:duration};
  return root;
}
