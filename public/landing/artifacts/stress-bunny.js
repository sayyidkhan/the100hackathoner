import { sculptShape } from './bunny-sculpt.js';
import { medivoiceStudio as createStudio } from './medivoice-studio.js';
import { bunnyInteraction } from './stress-bunny-interaction.js';
import { applyBunnyAO } from './stress-bunny-surface.js';

// A miniature interpretation of the original artwork's central idea:
// stop controlling, and the bunny and its surroundings settle into rest.
export function createArtifact(T, options={}) {
  const k=createStudio(T),{root,mesh,line,batch,finish}=k,m=k.materials,preserved=[];
  const mat=(color,roughness=.85)=>new T.MeshStandardMaterial({color,roughness});
  Object.assign(m,{
    stone:mat(0xa69a7e),rock:mat(0xb7ae98),moss:mat(0x697847),mossLight:mat(0x879153),
    grass:mat(0x52795c),leaf:mat(0x77985d),leafLight:mat(0xa5b477),stem:mat(0x647951),
    fur:new T.MeshPhysicalMaterial({color:0xf3e9d7,roughness:.92,sheen:1,sheenColor:0xfff6eb,sheenRoughness:.85}),

    inner:mat(0xdca99f,.94),nose:mat(0xcb8b83),eye:new T.MeshPhysicalMaterial({color:0x241b17,roughness:.13,clearcoat:1}),glint:mat(0xfff5de),toe:mat(0xc4b4a0),
    petal:mat(0xf6e8cc),apricot:mat(0xe4a482),pollen:mat(0xcfa65b),cloud:mat(0xf1e7d7),
    water:new T.MeshPhysicalMaterial({color:0x347b6b,roughness:.27,metalness:.10,clearcoat:.55,clearcoatRoughness:.22,envMapIntensity:.25}),
    sun:new T.MeshStandardMaterial({color:0xffd58a,emissive:0xffbc52,emissiveIntensity:1.35,roughness:.65}),
  });
  for(const key of ['grass','leaf','leafLight'])m[key].side=T.DoubleSide;
  let seed=49;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function grain(kind){
    const n=128,data=new Uint8Array(n*n*4);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const v=kind==='fur'?185+Math.sin(x*2.2+Math.sin(y*.2)*2)*18+random()*55:125+random()*120;
      const i=(y*n+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
    }
    const map=new T.DataTexture(data,n,n);map.wrapS=map.wrapT=T.RepeatWrapping;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
  }
  const furGrain=grain('fur'),earthGrain=grain('earth');
  const turfData=new Uint8Array(256*256*4);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const n=.5+.17*Math.sin(x*.07+Math.sin(y*.055)*2)+.14*Math.sin(y*.10+x*.035)+random()*.18,i=(y*256+x)*4;
    turfData[i]=125+n*65;turfData[i+1]=139+n*61;turfData[i+2]=86+n*40;turfData[i+3]=255;
  }
  const turfMap=new T.DataTexture(turfData,256,256);turfMap.wrapS=turfMap.wrapT=T.RepeatWrapping;turfMap.repeat.set(.7,.7);turfMap.minFilter=T.LinearMipmapLinearFilter;turfMap.magFilter=T.LinearFilter;turfMap.generateMipmaps=true;turfMap.needsUpdate=true;m.moss.map=turfMap;

  furGrain.repeat.set(4,3);earthGrain.repeat.set(3,3);
  for(const key of ['inner','cloud']){m[key].bumpMap=furGrain;m[key].bumpScale=.004;}
  for(const key of ['stone','rock','moss','mossLight']){m[key].bumpMap=earthGrain;m[key].bumpScale=key.startsWith('moss')?.025:.009;}
  const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
  function oval(sx,sy,sz,x,y,z,material,parent=root,detail=32){
    const geo=new T.SphereGeometry(1,detail,Math.floor(detail*.7));
    const o=mesh(geo,material,parent);o.scale.set(sx,sy,sz);o.position.set(x,y,z);return o;
  }
  function contour(rx,rz,cx=0,cz=0){
    const s=new T.Shape();
    for(let i=0;i<=128;i++){
      const a=i/128*Math.PI*2,organic=1+.042*Math.sin(a*3)+.028*Math.cos(a*7)+.015*Math.sin(a*13);
      const x=cx+Math.cos(a)*rx*organic,y=-cz+Math.sin(a)*rz*organic;
      if(i===0)s.moveTo(x,y);else s.lineTo(x,y);
    }
    s.closePath();return s;
  }
  const shore=contour(3.15,1.98),hole=contour(1.13,.77,1.13,.72);
  const holePath=new T.Path(hole.getPoints());shore.holes.push(holePath);
  const slab=mesh(new T.ExtrudeGeometry(shore,{depth:.15,bevelEnabled:true,bevelSize:.055,bevelThickness:.035,bevelSegments:4,curveSegments:32}),'stone');
  slab.rotation.x=-Math.PI/2;slab.position.y=.065;
  const meadow=mesh(new T.ExtrudeGeometry(shore,{depth:.025,bevelEnabled:true,bevelSize:.018,bevelThickness:.012,bevelSegments:3}),'moss');
  meadow.rotation.x=-Math.PI/2;meadow.position.y=.23;
  // Weathered limestone breaks up the edge; low moss follows the rock, not a rim of beads.
  function rock(sx,sy,sz,x,y,z){
    const geo=new T.IcosahedronGeometry(1,2),pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      const n=1+.10*Math.sin(x*11+y*5)*Math.cos(z*9)+.06*Math.sin(y*13+z*6);
      pos.setXYZ(i,x*n,y*n,z*n);
    }
    const normals=geo.attributes.normal;for(let i=0;i<pos.count;i++){const n=new T.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i)).normalize();normals.setXYZ(i,n.x,n.y,n.z);}const o=mesh(geo,'rock');o.scale.set(sx,sy,sz);o.position.set(x,y,z);o.rotation.y=random()*6;return o;
  }
  for(let i=0;i<43;i++){
    const a=i/43*Math.PI*2,r=1+.025*Math.sin(a*7),x=Math.cos(a)*3.02*r,z=Math.sin(a)*1.87*r;
    rock(.22+random()*.18,.14+random()*.12,.17+random()*.13,x,.13,z);
    oval(.13+random()*.10,.04+random()*.035,.12+random()*.10,x,.29,z,i%3?'moss':'mossLight',root,14);
  }
  for(let i=0;i<28;i++){
    const a=i/28*Math.PI*2,x=1.13+Math.cos(a)*(1.15+random()*.08),z=.72+Math.sin(a)*(.79+random()*.04);
    rock(.07+random()*.10,.035+random()*.06,.065+random()*.08,x,.24,z);
  }
  const waterGroup=group(1.13,.213,.72);waterGroup.userData.noAO=true;
  const waterGeo=new T.CircleGeometry(1,96);waterGeo.rotateX(-Math.PI/2);waterGeo.scale(1.12,1,.76);
  const water=mesh(waterGeo,'water',waterGroup);water.userData.noShadow=true;preserved.push(waterGroup);
  const ripples=[];
  for(let i=0;i<4;i++){
    const material=new T.MeshBasicMaterial({color:0xb9e5cb,transparent:true,opacity:.24,depthWrite:false,toneMapped:false});
    const o=new T.Mesh(new T.TorusGeometry(1,.007,5,96),material);o.rotation.x=-Math.PI/2;o.position.y=.006+i*.001;waterGroup.add(o);ripples.push(o);
  }
  // A crouching lop rabbit: weight sits over the haunches, with short forepaws below the chest.
  const bunny=group(-.65,.29,.05);bunny.scale.setScalar(1.10);bunny.rotation.y=.48;bunny.name='resting-bunny';bunny.userData.noAO=true;preserved.push(bunny);
  const chest=group(0,0,0,bunny);chest.name='breathing-body';
  mesh(sculptShape(T,'rabbit-body',[
    [0,.43,-.17,.47,.39,.56],[0,.57,.28,.32,.32,.34],
    [-.30,.28,-.24,.26,.26,.36],[.30,.28,-.24,.26,.26,.36],
    [-.17,.23,.46,.115,.21,.14],[.17,.23,.46,.115,.21,.14],
  ],[[-.64,-.04,-.81],[.64,.94,.68]],.12,.040),'fur',chest);
  const tail=group(0,.32,-.70,bunny);oval(.16,.16,.16,0,0,0,'fur',tail,40);
  const paws=[];
  for(const side of [-1,1]){
    const paw=group(side*.37,.12,.03,bunny);paws.push(paw);
    mesh(sculptShape(T,'rabbit-foot',[[0,0,0,.155,.12,.29],[0,.10,-.12,.16,.17,.18]],[[-.22,-.15,-.35],[.22,.30,.34]],.10,.032),'fur',paw);
    const front=group(side*.17,.10,.49,chest);oval(.105,.085,.16,0,0,.035,'fur',front,32);
    for(let j=0;j<2;j++)line([[-.028+j*.056,.035,.165],[-.028+j*.056,.017,.184]],.002,'toe',front);
  }
  const head=group(0,.81,.32,bunny);head.rotation.y=.12;head.name='bunny-head';
  const headMesh=mesh(sculptShape(T,'rabbit-head',[
    [0,.045,-.015,.322,.28,.305],
    [-.145,-.085,.16,.205,.17,.205],[.145,-.085,.16,.205,.17,.205],
    [-.075,-.135,.285,.112,.103,.135],[.075,-.135,.285,.112,.103,.135],
  ],[[-.45,-.31,-.39],[.45,.41,.49]],.105,.029),'fur',head);
  // Attach each facial feature to the actual sculpted surface, including after proportion changes.
  const faceProbe=new T.Mesh(headMesh.geometry);faceProbe.updateMatrixWorld();
  const frontAt=(x,y)=>new T.Raycaster(new T.Vector3(x,y,1),new T.Vector3(0,0,-1)).intersectObject(faceProbe)[0];
  const noseShape=new T.Shape();noseShape.moveTo(-.035,.010);noseShape.quadraticCurveTo(0,.027,.035,.010);noseShape.quadraticCurveTo(.027,-.007,0,-.022);noseShape.quadraticCurveTo(-.027,-.007,-.035,.010);
  const nose=mesh(new T.ExtrudeGeometry(noseShape,{depth:.009,bevelEnabled:true,bevelThickness:.006,bevelSize:.005,bevelSegments:3,curveSegments:12}),'nose',head);nose.position.set(0,-.107,frontAt(0,-.107).point.z+.001);
  const faceLine=points=>points.map(([x,y])=>[x,y,frontAt(x,y).point.z+.004]);
  line(faceLine([[0,-.135],[0,-.159],[-.030,-.178]]),.0025,'toe',head);
  line(faceLine([[0,-.159],[.030,-.178]]),.0025,'toe',head);
  const eyes=[];
  for(const side of [-1,1]){
    const surface=frontAt(side*.253,.080),eye=group(surface.point.x,surface.point.y,surface.point.z+.005,head);
    eye.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),surface.normal);eye.name='bunny-eye';eyes.push(eye);
    oval(.049,.060,.030,0,0,0,'eye',eye,40);
    oval(.008,.010,.004,-.012,.021,.028,'glint',eye,20);
    for(let j=0;j<3;j++){
      const x=side*.17,y=-.115+j*.018,z=frontAt(x,y).point.z+.003;
      line([[x,y,z],[side*.32,y+j*.012,z+.012],[side*.49,y-.035+j*.04,z-.018]],.0011,'petal',head);
    }
  }
  function lopEar(side){
    const g=group(side*.18,.22,-.025,head);g.name='lop-ear';
    const v=[],uv=[],ix=[],steps=48,sides=32;
    const center=t=>new T.Vector3(side*(.24*Math.sin(t*Math.PI*.72)+.035*t),(side===1?.40:.24)*Math.sin(t*Math.PI)-.92*t,.065*Math.sin(t*Math.PI)+.07*t*t);
    const across=t=>{const a=center(Math.max(0,t-.001)),b=center(Math.min(1,t+.001));return new T.Vector3(-(b.y-a.y),b.x-a.x,0).normalize();};
    const width=t=>.065*(1-t)+.114*Math.pow(Math.sin(Math.PI*t),.52)+.003;
    const thick=t=>.024+.021*Math.sin(Math.PI*t);
    for(let i=0;i<=steps;i++)for(let j=0;j<=sides;j++){
      const t=i/steps,a=j/sides*Math.PI*2,c=center(t),end=Math.pow(Math.sin(Math.PI*t),.25);
      const axis=across(t);v.push(c.x+axis.x*Math.cos(a)*width(t),c.y+axis.y*Math.cos(a)*width(t),c.z+Math.sin(a)*thick(t)*end);uv.push(j/sides,t);
      if(i<steps&&j<sides){const n=i*(sides+1)+j;ix.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();mesh(geo,'fur',g);
    const p=[],pUV=[],pIX=[];
    for(let i=0;i<=40;i++)for(let j=0;j<=12;j++){
      const t=.10+i/40*.82,u=(j/12*2-1)*.62*Math.pow(Math.sin(i/40*Math.PI),.30),c=center(t);
      const axis=across(t);p.push(c.x+axis.x*u*width(t),c.y+axis.y*u*width(t),c.z+Math.sqrt(1-u*u)*thick(t)*Math.pow(Math.sin(Math.PI*t),.25)+.0015);pUV.push(j/12,t);
      if(i<40&&j<12){const n=i*13+j;pIX.push(n,n+13,n+1,n+1,n+13,n+14);}
    }
    const inner=new T.BufferGeometry();inner.setAttribute('position',new T.Float32BufferAttribute(p,3));inner.setAttribute('uv',new T.Float32BufferAttribute(pUV,2));inner.setIndex(pIX);inner.computeVertexNormals();m.inner.side=T.DoubleSide;mesh(inner,'inner',g);return g;
  }
  const ears=[lopEar(-1),lopEar(1)];ears[1].rotation.y=-.32;
  batch(bunny);
  // Sub-centimetre facial surfaces shade smoothly; the rabbit still casts live ground shadows.
  bunny.traverse(o=>{if(o.isMesh)o.userData.noReceiveShadow=true;});
  // Botanicals have actual curved leaf surfaces and center veins.
  function blade(length,width,bend,material,parent){
    const v=[],uv=[],ix=[];
    const steps=length<.25?3:12;
    for(let i=0;i<=steps;i++)for(let j=0;j<3;j++){
      const t=i/steps,u=j-1,w=Math.sin(t*Math.PI)*width;
      v.push(u*w,length*t,bend*t*t+Math.abs(u)*w*.23);uv.push(j/2,t);
      if(i<steps&&j<2){const n=i*3+j;ix.push(n,n+3,n+1,n+1,n+3,n+4);}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(g,material,parent);
  }
  const plants=[];
  function fern(x,z,h,turn){
    const g=group(x,.29,z);g.rotation.y=turn;
    const curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(.08,h*.55,0),new T.Vector3(.38,h,.03)]);
    line(Array.from({length:12},(_,i)=>curve.getPoint(i/11).toArray()),.009,'stem',g);
    for(let i=1;i<17;i++)for(const side of [-1,1]){
      const t=i/17,c=curve.getPoint(t),len=.34*Math.sin(t*Math.PI)*h;
      const leaf=blade(len,.026*h,.08,i%2?'leaf':'leafLight',g);leaf.position.copy(c);leaf.rotation.z=side*1.12;leaf.rotation.y=side*.22;
    }
    batch(g);plants.push(g);preserved.push(g);
  }
  for(let i=0;i<15;i++){
    const a=Math.PI+(i/14)*Math.PI,x=Math.cos(a)*2.65,z=Math.sin(a)*1.55;
    fern(x,z,.42+random()*.44,(random()-.5)*1.5);
  }
  // Fine, varied blades across the lawn replace the flat toy-like surface.
  const lawn=group();
  for(let i=0;i<5200;i++){
    const x=(random()-.5)*6.1,z=(random()-.5)*3.7;
    if(Math.hypot(x/3.02,z/1.82)>1||Math.hypot((x-1.13)/1.19,(z-.72)/.82)<1)continue;
    const edge=Math.hypot(x/3.02,z/1.82),h=.025+random()*(edge>.75?.18:.065);
    const leaf=blade(h,.006+random()*.009,(random()-.5)*.10,i%3?'mossLight':'grass',lawn);
    leaf.position.set(x,.266,z);leaf.rotation.y=random()*6.28;leaf.rotation.z=(random()-.5)*.55;
  }
  batch(lawn);
  const flowers=[];
  function flower(x,z,h,apricot=false,moving=true){
    const g=group(x,.28,z);g.scale.setScalar(.72+random()*.28);line([[0,0,0],[.035,h*.5,.012],[0,h,0]],.009,'stem',g);
    const bloom=group(0,h,0,g);bloom.rotation.x=.4;
    for(let j=0;j<7;j++){const a=j/7*Math.PI*2,p=oval(.045,.08,.022,Math.cos(a)*.073,Math.sin(a)*.073,0,apricot?'apricot':'petal',bloom,16);p.rotation.z=a-Math.PI/2;}
    oval(.045,.045,.029,0,0,.018,'pollen',bloom,16);
    const leaf=blade(h*.40,.06,.025,'leaf',g);leaf.position.y=h*.22;leaf.rotation.z=.8;
    batch(g);if(moving){flowers.push(g);preserved.push(g);}
  }
  for(const p of [[-2.35,.7,.46,1],[-1.7,1.25,.29,0],[-.75,1.30,.38,0],[.0,1.65,.22,1],[2.48,.6,.41,1],[2.1,1.30,.27,0],[1.6,-.73,.53,0],[-2.55,-.3,.48,0],[.48,-1.5,.43,1],[2.42,-.42,.58,0]])flower(...p);
  for(let i=0;i<26;i++){
    const a=random()*Math.PI*2,x=Math.cos(a)*(2.4+random()*.35),z=Math.sin(a)*(1.40+random()*.28);
    flower(x,z,.14+random()*.22,i%5===0,false);
  }
  const clouds=[];
  for(const [x,y,z,s] of [[.82,2.35,-.9,.70],[2.15,1.94,-.85,.61]]){
    const g=group(x,y,z);g.scale.setScalar(s);
    for(const [a,b,c,r] of [[-.32,0,0,.24],[0,.15,0,.31],[.32,.02,0,.25],[-.10,-.07,.12,.25],[.18,-.04,.14,.22]])oval(r,r*.85,r*.75,a,b,c,'cloud',g,24);
    batch(g);clouds.push(g);preserved.push(g);
  }
  const sun=oval(.32,.32,.20,2.04,2.78,-1.18,'sun',root,48);sun.userData.noShadow=true;sun.userData.noAO=true;preserved.push(sun);
  // A bounded soft glow, used only as a tiny atmospheric accent.
  const glowSize=64,glowData=new Uint8Array(glowSize*glowSize*4);
  for(let y=0;y<glowSize;y++)for(let x=0;x<glowSize;x++){
    const d=Math.hypot((x/(glowSize-1)-.5)*2,(y/(glowSize-1)-.5)*2),i=(y*glowSize+x)*4;
    glowData[i]=255;glowData[i+1]=211;glowData[i+2]=126;glowData[i+3]=Math.round(190*Math.pow(Math.max(0,1-d),3));
  }
  const glowMap=new T.DataTexture(glowData,glowSize,glowSize);glowMap.magFilter=glowMap.minFilter=T.LinearFilter;glowMap.needsUpdate=true;
  const atmosphere=group();atmosphere.userData.noAO=true;preserved.push(atmosphere);
  const sunGlow=new T.Sprite(new T.SpriteMaterial({map:glowMap,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));sunGlow.position.copy(sun.position);sunGlow.scale.set(1.8,1.8,1);atmosphere.add(sunGlow);
  const flies=[];
  for(let i=0;i<12;i++){
    const g=group((random()-.5)*5.8,.65+random()*1.7,(random()-.5)*2.4,atmosphere);
    const light=new T.Sprite(new T.SpriteMaterial({map:glowMap,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));light.scale.set(.16,.16,1);g.add(light);
    oval(.015,.015,.015,0,0,0,'sun',g,10);flies.push(g);
  }
  const shadowSize=128,shadowData=new Uint8Array(shadowSize*shadowSize*4);
  for(let y=0;y<shadowSize;y++)for(let x=0;x<shadowSize;x++){
    const d=Math.hypot((x/(shadowSize-1)-.5)*2,(y/(shadowSize-1)-.5)*2);shadowData[(y*shadowSize+x)*4+3]=Math.round(90*Math.exp(-Math.pow(Math.max(0,d-.72)/.15,2)));
  }
  const shadowMap=new T.DataTexture(shadowData,shadowSize,shadowSize);shadowMap.magFilter=shadowMap.minFilter=T.LinearFilter;shadowMap.needsUpdate=true;
  const footprint=new T.Mesh(new T.PlaneGeometry(7.65,5.1),new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,toneMapped:false}));footprint.rotation.x=-Math.PI/2;footprint.position.y=.006;footprint.userData.noShadow=true;footprint.userData.noAO=true;preserved.push(footprint);root.add(footprint);
  const bunnyShadow=new T.Mesh(new T.PlaneGeometry(1.7,1.05),new T.MeshBasicMaterial({map:shadowMap,transparent:true,opacity:.3,depthWrite:false,toneMapped:false}));
  bunnyShadow.rotation.x=-Math.PI/2;bunnyShadow.position.set(-.65,.295,.05);bunnyShadow.userData.noAO=true;bunnyShadow.userData.noShadow=true;root.add(bunnyShadow);preserved.push(bunnyShadow);
  root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(root),center=bounds.getCenter(new T.Vector3());
  const offset=new T.Vector3(-center.x,-bounds.min.y,-center.z),framingPoints=[];
  for(const child of root.children){
    if(child===footprint||child===atmosphere||child===bunnyShadow)continue;
    const b=new T.Box3().setFromObject(child);
    if(b.isEmpty())continue;
    for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z).add(offset));
  }
  const model=finish(49,preserved);
  model.userData.framingPoints=framingPoints;
  Object.assign(model.userData,{displayBase:false,groundLevel:0,studioProfile:'bunny',initialYaw:-.10,initialElevation:.32,autoOrbit:false});
  const plantAngles=plants.map(g=>g.rotation.clone()),flowerAngles=flowers.map(g=>g.rotation.clone()),cloudPositions=clouds.map(g=>g.position.clone()),flyPositions=flies.map(g=>g.position.clone()),headY=head.position.y;
  let lastTouch=-100,night=true,lastTime=0;
  const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
  model.userData.interact=seconds=>{lastTouch=seconds;};
  bunnyInteraction(T,model,bunny,bunnyShadow,offset,model.userData.interact);
  model.userData.setTheme=theme=>{night=theme==='dark';m.sun.emissiveIntensity=night?1.35:.55;sunGlow.material.opacity=night?.85:.32;};
  model.userData.animate=seconds=>{
    if(seconds<lastTime)lastTouch=-100;
    lastTime=seconds;
    const t=seconds%120,calm=smooth((seconds-lastTouch-1.0)/4.5),curious=model.userData.isHeld?1:1-calm,breath=Math.sin(t*Math.PI/3);
    chest.scale.set(1+.006*breath,1+.018*breath,1+.009*breath);
    head.position.y=headY+curious*.018+breath*.004;head.rotation.x=-curious*.06;head.rotation.y=.12+curious*.08*Math.sin(t*1.2);
    const blink=Math.pow(Math.max(0,Math.cos((t-2)*Math.PI/5)),100);
    eyes.forEach(e=>{e.scale.y=Math.max(.06,(.93+curious*.07)*(1-blink*.94));});
    paws.forEach((paw,i)=>{paw.rotation.x=model.userData.isHeld?.14:0;paw.position.y=.12-(model.userData.isHeld?.018:0);});
    bunny.rotation.z=model.userData.isHeld?Math.sin(t*1.8)*.035:0;
    ears[0].rotation.z=-.055+curious*.06+.018*Math.pow(Math.max(0,Math.sin(t*Math.PI/6)),12);
    ears[1].rotation.x=.09-curious*.08+.022*Math.sin(t*Math.PI/5);
    tail.scale.y=1+.015*breath;
    plants.forEach((g,i)=>{g.rotation.z=plantAngles[i].z+Math.sin(t*Math.PI/5+i*.7)*(.018+calm*.022);g.rotation.x=plantAngles[i].x+Math.sin(t*Math.PI/6+i)*.018;});
    flowers.forEach((g,i)=>{g.rotation.z=flowerAngles[i].z+Math.sin(t*Math.PI/6+i)*.035;});
    clouds.forEach((g,i)=>{g.position.x=cloudPositions[i].x+Math.sin(t*Math.PI/15+i)*.12;g.position.y=cloudPositions[i].y+Math.sin(t*Math.PI/10+i)*.025;});
    ripples.forEach((r,i)=>{const phase=((t/6+i/4)%1);r.scale.set(phase*1.10,phase*.74,1);r.material.opacity=Math.sin(phase*Math.PI)*(.12+calm*.15);});
    flies.forEach((g,i)=>{g.position.copy(flyPositions[i]);g.position.x+=Math.sin(t*Math.PI/10+i)*.09;g.position.y+=Math.sin(t*Math.PI/6+i*2)*.08;g.scale.setScalar((night?1:.42)*(.5+.5*Math.sin(t*Math.PI/3+i)**2));});
    model.userData.calmLevel=calm;
  };
  model.userData.animate(0);
  if(!options.bake)applyBunnyAO(T,model);
  return model;
}
