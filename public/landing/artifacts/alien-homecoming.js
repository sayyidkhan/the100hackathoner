import { sculpture } from './sculpture.js';

// Realm families, lavender traveller and warm Home Echoes follow the game's
// realmPlanner.ts, Alien.tsx and buildRealmPrompt(), rather than a generic diorama.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, ball, disk, line, finish }=sculpture(THREE);
  const palette={ivory:0xe8dff4,paper:0xc2b1d6,shade:0x66567f,blue:0x473258,red:0xc4a078,wood:0xc99563,ink:0x171027,lavender:0xb58be2};
  for(const [key,color] of Object.entries(palette)){materials[key].color.setHex(color);materials[key].roughness=.58;}
  materials.wood.metalness=.72;materials.wood.roughness=.28;
  materials.red.metalness=.55;materials.red.roughness=.35;
  materials.lavender.roughness=.42;
  // Small-scale marble veining stays procedural: no network textures or huge maps.
  for(const key of ['ivory','paper','shade']){
    materials[key].onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vStone;').replace('#include <begin_vertex>','#include <begin_vertex>\nvStone=position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vStone;').replace('#include <color_fragment>',`#include <color_fragment>
      float vein=sin(vStone.x*17.0+vStone.y*8.0+sin(vStone.z*12.0)*2.0+sin(vStone.y*23.0)*.8);
      float fine=fract(sin(dot(vStone,vec3(127.1,311.7,74.7)))*43758.5453);
      diffuseColor.rgb*=.94+.06*fine-.10*pow(abs(vein),24.0);`);
    };
    materials[key].customProgramCacheKey=()=> 'alien-marble-v2';
  }
  let seed=72;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const V=p=>new THREE.Vector3(...p),TAU=Math.PI*2;
  function rod(a,b,r=.018,color='wood'){
    const start=V(a),end=V(b),d=end.clone().sub(start);
    const m=mesh(new THREE.CylinderGeometry(r,r,d.length(),8),color);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;
  }
  function torus(r,t,x,y,z,color='wood',flat=true){const m=mesh(new THREE.TorusGeometry(r,t,8,80),color);m.position.set(x,y,z);if(flat)m.rotation.x=Math.PI/2;return m;}
  function slab(shape,depth,x,y,z,color='ivory',bevel=.025){const m=mesh(new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,curveSegments:48}),color);m.position.set(x,y,z);return m;}
  const lamps=[];
  function lamp(x,y,z,scale=1){disk(.055*scale,.025,x,y,z,'wood');rod([x,y,z],[x,y+.24*scale,z],.012*scale);lamps.push([x,y+.28*scale,z,.07*scale]);}
  function plant(x,y,z,size=.5){
    for(let i=0;i<7;i++){const a=i*2.4,h=size*(.45+rand()*.55);rod([x,y,z],[x+Math.cos(a)*h*.3,y+h,z+Math.sin(a)*h*.3],.008,'shade');for(let j=0;j<4;j++){const b=mesh(new THREE.SphereGeometry(.035,8,6),'lavender');b.position.set(x+Math.cos(a)*h*.3*j/4,y+h*j/4,z+Math.sin(a)*h*.3*j/4);b.scale.set(1,1.4,1);}}
  }
  function island(x,y,z,r){
    const shape=new THREE.Shape();for(let i=0;i<=100;i++){const a=i/100*TAU,rr=r*(1+.025*Math.sin(a*7)+.018*Math.cos(a*11));const px=Math.cos(a)*rr,pz=Math.sin(a)*rr*.78;i?shape.lineTo(px,pz):shape.moveTo(px,pz);}
    for(const [depth,offset,scale,color] of [[.12,-.12,1,'ivory'],[.05,-.21,.98,'paper']]){const m=slab(shape,depth,x,y+offset,z,color);m.rotation.x=-Math.PI/2;m.scale.set(scale,scale,1);}
    const core=mesh(new THREE.CylinderGeometry(r*.92,.15,r*.95,15,1),'shade');core.position.set(x,y-r*.52,z);core.scale.z=.78;
    for(let i=0;i<34;i++){
      const a=i/34*TAU,rr=r*(.78+rand()*.12),h=r*(.48+rand()*.56);
      const g=new THREE.CylinderGeometry(.19+rand()*.12,.015,h,5,2);
      const m=mesh(g,i%3?'paper':'shade');m.position.set(x+Math.cos(a)*rr,y-h/2-.12,z+Math.sin(a)*rr*.78);m.rotation.y=rand()*TAU;m.rotation.z=-Math.cos(a)*.20;m.rotation.x=Math.sin(a)*.17;
      if(i%4===0){const shard=mesh(new THREE.OctahedronGeometry(.12,0),'lavender');shard.scale.y=2.4;shard.position.set(m.position.x,y-h-.1,m.position.z);}
      if(i%3===0)plant(x+Math.cos(a)*r*.85,y+.03,z+Math.sin(a)*r*.67,.18+rand()*.25);
      if(i%5===0){const xx=x+Math.cos(a)*r*.98,zz=z+Math.sin(a)*r*.78;line([[xx,y,zz],[xx+.05,y-.35,zz+.03],[xx-.08,y-.68,zz+.05]],.012,'shade');for(let j=0;j<5;j++){const b=ball(.05,xx+Math.sin(j*3)*.06,y-j*.13,zz+.04,'lavender');b.scale.y=1.4;}}
    }
    for(const rr of [.42,.49,.73])torus(r*rr,.007,x,y+.035,z);
    for(let i=0;i<18;i++){const a=i/18*TAU;rod([x+Math.cos(a)*r*.50,y+.039,z+Math.sin(a)*r*.50],[x+Math.cos(a)*r*.55,y+.039,z+Math.sin(a)*r*.55],.005);}
  }
  island(-2.35,1.3,-1.25,1.45);island(2.15,1.65,-1.35,1.55);island(0,.55,1.95,1.65);

  // Raised, curved marble walkways with continuous parapets and brass railings.
  const routes=[
    [[-.35,.60,1.65],[-.42,.82,.80],[-1.10,1.10,.25],[-1.85,1.35,-.25],[-2.35,1.35,-1.05]],
    [[-.30,.60,1.45],[.5,.90,.70],[1.40,1.3,.20],[2.1,1.70,-.35],[2.15,1.70,-1.10]],
  ].map(p=>new THREE.CatmullRomCurve3(p.map(V),false,'centripetal'));
  function bridge(curve){
    const p=[],indices=[];
    for(let i=0;i<=100;i++){
      const t=i/100,c=curve.getPoint(t),d=curve.getTangent(t),bottom=c.y-.13-.7*Math.pow(Math.cos(t*Math.PI*3),8);
      for(const [s,y]of[[-1,c.y],[1,c.y],[-1,bottom],[1,bottom]])p.push(c.x+d.z*.28*s,y,c.z-d.x*.28*s);
      if(i<100){const a=i*4,b=a+4;indices.push(a,b,a+1,a+1,b,b+1,a,a+2,b,a+2,b+2,b,a+1,b+1,a+3,a+3,b+1,b+3);}
      if(i%4===0){rod([c.x-d.z*.25,c.y+.012,c.z+d.x*.25],[c.x+d.z*.25,c.y+.012,c.z-d.x*.25],.005,'wood');}
      if(i%8===0)for(const side of [-1,1]){const x=c.x+side*d.z*.28,z=c.z-side*d.x*.28;rod([x,c.y+.02,z],[x,c.y+.21,z],.008);if(i%24===0)lamp(x,c.y+.17,z,.65);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();mesh(g,'ivory');
    for(const side of [-1,1])for(const height of [.13,.22]){const edge=[];for(let i=0;i<=60;i++){const c=curve.getPoint(i/60),d=curve.getTangent(i/60);edge.push([c.x+side*d.z*.28,c.y+height,c.z-side*d.x*.28]);}line(edge,.009,'wood');}
  }
  routes.forEach(bridge);
  function arch(w,h,thickness){
    const s=new THREE.Shape();s.moveTo(-w,0);s.lineTo(-w,h-w);s.absarc(0,h-w,w,Math.PI,0,true);s.lineTo(w,0);s.lineTo(w-thickness,0);s.lineTo(w-thickness,h-w);s.absarc(0,h-w,w-thickness,0,Math.PI,false);s.lineTo(-w+thickness,0);s.closePath();return s;
  }
  // The threshold: carved piers, luminous doorway and an orbiting armillary crown.
  const gx=2.15,gz=-1.68,gy=1.95;
  for(let i=0;i<5;i++)box(1.1+i*.08,.07,.24,gx,1.70+i*.07,-.65-i*.17);
  for(const [w,h,dep,z,col] of [[.81,2.65,.24,gz,'paper'],[.71,2.55,.12,gz+.25,'ivory'],[.60,2.44,.04,gz+.40,'wood']])slab(arch(w,h,.10),dep,gx,gy,z,col);
  for(const side of [-1,1]){
    for(const dx of [0,.12]){const x=gx+side*(.80+dx);box(.10,2.6,.26,x,gy+1.25,gz+.10,'ivory');box(.18,.11,.34,x,gy+.12,gz+.10,'paper');box(.18,.09,.32,x,gy+2.5,gz+.10,'wood');const spire=mesh(new THREE.ConeGeometry(.10,.34,5),'ivory');spire.position.set(x,gy+2.78,gz+.1);}
    lamp(gx+side*.67,gy+.05,gz+.60,1.25);
  }
  const orbit=torus(.98,.011,gx,gy+2.4,gz+.12,'wood',false);orbit.rotation.x=.6;
  torus(.22,.012,gx,gy+2.77,gz+.22,'wood',false);
  for(const [x,z]of[[1.1,-1.9],[3.15,-1.85]]){const c=mesh(new THREE.ConeGeometry(.14,.95,9),'blue');c.position.set(x,2.1,z);}
  // Small colonnades reinforce the architectural scale.
  for(const [cx,cy,cz,angle]of[[-3.1,1.31,-1.5,-.3],[2.9,1.66,-1.05,.6]]){
    const a=slab(arch(.28,.85,.055),.08,cx,cy,cz,'ivory',.01);a.rotation.y=angle;
  }
  const tx=-2.15,ty=1.34,tz=-1.65;
  function twig(points,r){
    const c=new THREE.CatmullRomCurve3(points.map(V)),g=new THREE.TubeGeometry(c,35,r,8,false),a=g.attributes.position;
    for(let i=0;i<=35;i++){const q=c.getPointAt(i/35),f=1-.85*i/35;for(let j=0;j<=8;j++){const k=i*9+j;a.setXYZ(k,q.x+(a.getX(k)-q.x)*f,q.y+(a.getY(k)-q.y)*f,q.z+(a.getZ(k)-q.z)*f);}}
    g.computeVertexNormals();mesh(g,'ivory');
  }
  twig([[tx,ty,tz],[tx-.1,ty+.6,tz],[tx+.05,ty+1.35,tz],[tx-.2,ty+2.0,tz]],.10);
  const buds=[];
  for(let i=0;i<10;i++){
    const side=i%2?1:-1,y=ty+.65+i*.105,end=[tx+side*(.38+(i%3)*.14),y+.35,tz+(i%3-1)*.22];
    twig([[tx,y-.2,tz],[tx+side*.21,y,tz],end],.042);buds.push(end);
    for(let j=0;j<9;j++){const b=ball(.035+rand()*.025,end[0]+(rand()-.5)*.3,end[1]+(rand()-.5)*.22,end[2]+(rand()-.5)*.25,'lavender');b.scale.y=.65;}
  }
  buds.forEach((p,i)=>{lamps.push([...p,.08]);if(i>0)rod(buds[i-1],p,.004,'wood');});
  // Brass telescope and its armillary mounting.
  const sx=-3.0,sz=-.90;
  disk(.32,.06,sx,1.36,sz,'paper');
  for(let i=0;i<3;i++){const a=i/3*TAU;rod([sx+Math.cos(a)*.25,1.39,sz+Math.sin(a)*.25],[sx,1.95,sz],.025);}
  torus(.18,.017,sx,1.96,sz,'wood',false);
  const sa=[sx-.32,2.23,sz],sb=[sx+.30,1.99,sz];rod(sa,sb,.09);
  const direction=V(sa).sub(V(sb)).normalize();
  for(const [p,r]of[[sa,.13],[sb,.075]]){const rim=torus(r,.018,...p,'wood',false);rim.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction);}
  const lens=disk(.11,.013,...sa,'ink');lens.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);
  // Foreground home echoes, inlaid orbits and blossom gardens.
  const echoLocations=[[-.78,.75,2.1],[.32,.75,2.40],[1.05,.75,1.85]];
  echoLocations.forEach(([x,y,z])=>{disk(.18,.06,x,y-.08,z,'wood');torus(.21,.012,x,y-.04,z);});
  for(const p of [[-.95,.59,1.4],[1.30,.59,2.15],[-.9,.59,2.8]])plant(...p,.30);

  // Batch architecture before adding moving or translucent objects.
  root.updateMatrixWorld(true);
  const original=new THREE.Box3().setFromObject(root),center=original.getCenter(new THREE.Vector3());
  const offset=new THREE.Vector3(-center.x,-original.min.y,-center.z);
  const model=finish(72);
  const moving=new THREE.Group();moving.position.copy(offset);model.add(moving);
  function add(geometry,material,x,y,z,parent=moving){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
  const glowPixels=new Uint8Array(64*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){const d=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),i=(y*64+x)*4;glowPixels[i]=glowPixels[i+1]=glowPixels[i+2]=255;glowPixels[i+3]=Math.round(Math.pow(Math.max(0,1-d),2.5)*255);}
  const glowMap=new THREE.DataTexture(glowPixels,64,64,THREE.RGBAFormat);glowMap.needsUpdate=true;
  const glowMaterial=new THREE.SpriteMaterial({map:glowMap,color:0xffc58b,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:.85,toneMapped:false});
  const lightMaterial=new THREE.MeshBasicMaterial({color:0xffddb1,toneMapped:false});
  function glow(x,y,z,size){const s=new THREE.Sprite(glowMaterial);s.position.set(x,y,z);s.scale.setScalar(size);moving.add(s);return s;}
  lamps.forEach(([x,y,z,r])=>{const l=add(new THREE.SphereGeometry(r*.3,10,8),lightMaterial,x,y,z);l.userData.noShadow=true;glow(x,y,z,r*6);});
  const portalMaterial=new THREE.ShaderMaterial({
    uniforms:{time:{value:0}},side:THREE.DoubleSide,transparent:true,depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=vec2(position.x+.5,position.y/2.3);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`uniform float time;varying vec2 vUv;
      void main(){vec2 p=vUv-.5;float wave=sin(p.y*20.-time*.7+sin(p.x*14.)*2.);float d=length(p*vec2(1.5,.6));
      vec3 color=mix(vec3(.94,.57,.30),vec3(1.,.91,.65),smoothstep(.7,.05,d));
      color+=.012*wave;gl_FragColor=vec4(color, .88);}`,
  });
  const door=new THREE.Shape();door.moveTo(-.50,0);door.lineTo(-.50,1.80);door.absarc(0,1.80,.50,Math.PI,0,true);door.lineTo(.50,0);door.closePath();
  const portal=add(new THREE.ShapeGeometry(door,48),portalMaterial,gx,gy,gz+.43);portal.userData.noShadow=true;
  const portalGlow=glow(gx,gy+1.2,gz+.48,3.3);
  const gateLight=new THREE.PointLight(0xffb36f,5,5,2);gateLight.position.set(gx,gy+1,gz+1);moving.add(gateLight);
  // A tiny remembered home is silhouetted within the warm doorway.
  const homeMaterial=new THREE.MeshBasicMaterial({color:0x956283});
  add(new THREE.BoxGeometry(.25,.30,.08),homeMaterial,gx,gy+.17,gz+.46);
  const roof=add(new THREE.ConeGeometry(.22,.18,4),homeMaterial,gx,gy+.40,gz+.46);roof.rotation.y=Math.PI/4;
  add(new THREE.SphereGeometry(.036,12,8),lightMaterial,gx,gy+.20,gz+.51);
  const moonMaterial=new THREE.MeshStandardMaterial({color:0x594c7f,roughness:.9});
  const planet=add(new THREE.SphereGeometry(.60,48,32),moonMaterial,-3.15,3.65,-3.25);
  const ringMaterial=new THREE.MeshStandardMaterial({color:0xc1a2d3,metalness:.4,roughness:.5,side:THREE.DoubleSide,transparent:true,opacity:.65});
  const planetRing=add(new THREE.RingGeometry(.82,1.14,96),ringMaterial,-3.15,3.65,-3.25);planetRing.rotation.x=1.16;planetRing.rotation.y=.25;
  const ringDetail=add(new THREE.RingGeometry(1.19,1.22,96),ringMaterial,-3.15,3.65,-3.25);ringDetail.rotation.copy(planetRing.rotation);
  // Lavender traveller uses the game's two-eyed, golden antenna silhouette.
  const traveller=sculpture(THREE);traveller.materials.lavender.color.setHex(0xc49be9);
  traveller.materials.lavender.roughness=.38;
  const body=traveller.ball(.23,0,.34,0,'lavender');body.scale.set(1,1.35,.8);
  for(const side of [-1,1]){
    const eye=traveller.ball(.038,side*.09,.43,.174,'ink');eye.scale.set(1,1.2,.5);
    traveller.ball(.010,side*.09-.008,.445,.193,'ivory');
    const foot=traveller.ball(.065,side*.09,.065,.04,'lavender');foot.scale.z=1.4;
    const hand=traveller.ball(.052,side*.225,.23,0,'lavender');hand.scale.y=1.7;hand.rotation.z=side*.25;
  }
  traveller.line([[0,.63,0],[.03,.76,0],[.09,.82,0]],.012,'wood');traveller.ball(.035,.09,.84,0,'ivory');
  const alien=traveller.finish(72);alien.name='homeward-traveller';moving.add(alien);
  const antennaGlow=new THREE.Sprite(glowMaterial);antennaGlow.position.set(.05,.82,0);antennaGlow.scale.setScalar(.25);alien.add(antennaGlow);
  const echoes=echoLocations.map(([x,y,z],i)=>{
    const mat=new THREE.MeshStandardMaterial({color:0xffdab0,emissive:0xffaa55,emissiveIntensity:.9,metalness:.35,roughness:.22});
    const c=add(new THREE.OctahedronGeometry(.105),mat,x,y+.18,z);c.scale.y=1.7;c.name=`home-echo-${i}`;const halo=glow(x,y+.18,z,.65);return {c,halo};
  });
  // Distant stars are real depth layers but never influence the exhibit's camera fit.
  const starPositions=[],starColors=[];
  for(let i=0;i<320;i++){const x=(rand()-.5)*20,y=rand()*11-2,z=-5-rand()*9;starPositions.push(x,y,z);const c=new THREE.Color().setHSL(.65+rand()*.13,.3,.6+rand()*.4);starColors.push(c.r,c.g,c.b);}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));sg.setAttribute('color',new THREE.Float32BufferAttribute(starColors,3));
  const stars=new THREE.Points(sg,new THREE.PointsMaterial({size:.025,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,toneMapped:false}));moving.add(stars);
  const motes=[];
  for(let i=0;i<22;i++){const g=glow((rand()-.5)*6,rand()*3+1,(rand()-.5)*4,.065+rand()*.06);motes.push({sprite:g,y:g.position.y,phase:rand()*TAU});}
  const routeFront=new THREE.CatmullRomCurve3([[-.4,.60,2.3],[-.78,.60,2.1],[.32,.60,2.4],[1.05,.60,1.85],[-.35,.60,1.65]].map(V),false,'centripetal');
  const walkRoutes=[routeFront,routes[0],new THREE.CatmullRomCurve3([...routes[0].points].reverse().concat(routes[1].points.slice(1)),false,'centripetal')];
  const p=new THREE.Vector3(),tangent=new THREE.Vector3();
  model.userData={...model.userData,displayBase:false,studioProfile:'cosmos',groundLevel:0,initialYaw:.16,initialElevation:.46,
    animate(elapsed){
      const time=elapsed%36;portalMaterial.uniforms.time.value=elapsed;
      const index=time<12?0:time<21?1:2;
      const progress=index===0?Math.max(0,(time-3)/9):index===1?(time-12)/9:(time-21)/13;
      const curve=walkRoutes[index],u=Math.min(1,progress);
      curve.getPointAt(u,p);curve.getTangentAt(u,tangent);
      alien.position.copy(p);alien.position.y+=Math.abs(Math.sin(elapsed*7))*.022*(time>3&&time<34?1:0);
      alien.rotation.y=time<3?-.15:Math.atan2(tangent.x,tangent.z);
      portalGlow.material.opacity=.85;
      gateLight.intensity=4.5+Math.sin(elapsed*.7)*.5;
      orbit.rotation.z=elapsed*.08;
      planet.rotation.y=elapsed*.025;
      echoes.forEach(({c,halo},i)=>{const collected=time>5+i*2;c.visible=halo.visible=!collected;c.rotation.y=elapsed*.7+i;c.position.y=echoLocations[i][1]+.18+Math.sin(elapsed*2+i)*.035;});
      motes.forEach(({sprite,y,phase})=>{sprite.position.y=y+Math.sin(elapsed*.4+phase)*.12;});
      const count=time<5?0:time<7?1:time<9?2:3;
      model.userData.story={step:`${count} / 3 HOME ECHOES`,title:time<12?'A memory of somewhere':time<21?'The observatory between galaxies':time<34?'Follow the remembered light':'A doorway home',detail:time<12?'Three echoes. One way back.':time<21?'Every strange world brings you closer.':'Somewhere beyond the stars, a light is waiting.',tone:count===3?'complete':'thinking'};
    }
  };
  model.userData.animate(0);model.updateMatrixWorld(true);
  // Convex silhouettes per height band avoid empty box corners shrinking the world.
  const bands=new Map(),point=new THREE.Vector3();
  model.traverse(o=>{if(!o.isMesh||o.userData.noShadow)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){
    point.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);const key=Math.floor(point.y/.2);
    if(!bands.has(key))bands.set(key,{min:point.y,max:point.y,points:new Map()});const band=bands.get(key);
    band.min=Math.min(band.min,point.y);band.max=Math.max(band.max,point.y);
    band.points.set(`${Math.round(point.x/.06)},${Math.round(point.z/.06)}`,[point.x,point.z]);
  }});
  const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  model.userData.framingPoints=[];
  for(const band of bands.values()){
    const sorted=[...band.points.values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),lower=[],upper=[];
    for(const p of sorted){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
    for(const p of sorted.reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
    for(const p of [...lower,...upper])for(const y of[band.min,band.max])model.userData.framingPoints.push(new THREE.Vector3(p[0],y,p[1]));
  }
  // Include the traveller's height at each elevated path so motion never clips.
  walkRoutes.forEach(curve=>{for(let i=0;i<=12;i++){const p=curve.getPoint(i/12).add(offset);p.y+=.9;model.userData.framingPoints.push(p);}});
  return model;
}
