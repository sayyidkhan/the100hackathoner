import { boatOpacity, prepareBoatFade } from './two-rivers-boat-fade.js';
import { riverSurfaces } from './two-rivers-surfaces.js';
import { riverAtmosphere } from './two-rivers-atmosphere.js';
import { createRiverLandform } from './two-rivers-terrain.js';

// A realtime architectural miniature of the submitted eco-park concept.
export function createArtifact(T) {
  const root=new T.Group(),staticWorld=new T.Group();root.add(staticWorld);
  const {materials:m,noise,waterNormal,warmGlow}=riverSurfaces(T);
  let seed=4040;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const V=(x,y,z)=>new T.Vector3(x,y,z),C=points=>new T.CatmullRomCurve3(points.map(p=>V(...p)));
  const mesh=(g,material,parent=staticWorld)=>{const o=new T.Mesh(g,typeof material==='string'?m[material]:material);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
  const group=(x,y,z,parent=staticWorld)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
  const box=(w,h,d,x,y,z,material,parent)=>{const o=mesh(new T.BoxGeometry(w,h,d),material,parent);o.position.set(x,y,z);return o;};
  const tube=(path,r,material,parent=staticWorld,steps=48)=>mesh(new T.TubeGeometry(path,steps,r,6,false),material,parent);
  const cylinder=(r1,r2,h,x,y,z,material,parent)=>{const o=mesh(new T.CylinderGeometry(r1,r2,h,12),material,parent);o.position.set(x,y,z);return o;};
  const beam=(a,b,r,material,parent=staticWorld)=>{const d=V(...b).sub(V(...a)),o=mesh(new T.CylinderGeometry(r,r,d.length(),6),material,parent);o.position.copy(V(...a).add(V(...b)).multiplyScalar(.5));o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return o;};
  function ribbon(path,width,material,parent=staticWorld,steps=100){
    const p=[],uv=[],idx=[];
    for(let i=0;i<=steps;i++){const q=path.getPoint(i/steps),d=path.getTangent(i/steps),n=V(-d.z,0,d.x).normalize();for(const s of [-1,1]){const a=q.clone().addScaledVector(n,s*width/2);p.push(...a.toArray());uv.push((s+1)/2,i/steps*8);}if(i<steps){const j=i*2;idx.push(j,j+1,j+2,j+1,j+3,j+2);}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return mesh(g,material,parent);
  }
  function torus(r,x,y,z,material,parent=staticWorld,thickness=.012){const o=mesh(new T.TorusGeometry(r,thickness,6,80),material,parent);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);return o;}
  const {waterY,routes,channels,bankDistance,height,perimeter,smooth}=createRiverLandform(T,noise);
  function terrain(){
    const p=[],uv=[],idx=[],col=[],n=240,rings=65;
    for(let j=0;j<=rings;j++)for(let i=0;i<=n;i++){
      const a=i/n*Math.PI*2,r=j/rings,edge=perimeter(a),x=Math.cos(a)*3.72*r*edge,z=Math.sin(a)*2.55*r*edge;
      p.push(x,height(x,z),z);uv.push((x+3.8)/7.6,(z+2.65)/5.3);
      const shade=.7+.3*smooth(.05,.5,bankDistance(x,z));col.push(shade,shade,shade);
      if(j<rings&&i<n){const k=j*(n+1)+i;idx.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
    const material=m.soil.clone();material.vertexColors=true;mesh(g,material);
    // Stratified sandstone cut edge, with a craggy perimeter rather than a disk.
    const sp=[],su=[],si=[];
    for(let j=0;j<=14;j++)for(let i=0;i<=n;i++){
      const a=i/n*Math.PI*2,r=perimeter(a)+Math.sin(j*2.5+a*7)*.002,x=Math.cos(a)*3.72*r,z=Math.sin(a)*2.55*r,top=height(x,z);
      sp.push(x,-.06+(top+.06)*j/14,z);su.push(i/n*4,j/14);
      if(j<14&&i<n){const k=j*(n+1)+i;si.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);}
    }
    const side=new T.BufferGeometry();side.setAttribute('position',new T.Float32BufferAttribute(sp,3));side.setAttribute('uv',new T.Float32BufferAttribute(su,2));side.setIndex(si);side.computeVertexNormals();mesh(side,'stone');
    for(let layer=0;layer<2;layer++){
      const path=C(Array.from({length:241},(_,i)=>{const a=i/240*Math.PI*2,r=perimeter(a);return [Math.cos(a)*3.725*r,.04+layer*.15+Math.sin(a*17+layer)*.011,Math.sin(a)*2.555*r];}));tube(path,.004,'rock');
    }
  }
  terrain();
  // One continuous surface under the carved terrain removes tributary seams.
  const waterPositions=[],waterColors=[],waterUvs=[],waterIndices=[],wn=180,wr=45;
  for(let j=0;j<=wr;j++)for(let i=0;i<=wn;i++){
    const a=i/wn*Math.PI*2,r=j/wr*(perimeter(a)-.004),x=Math.cos(a)*3.72*r,z=Math.sin(a)*2.55*r;
    waterPositions.push(x,waterY,z);waterUvs.push((x+3.8)/7.6,(z+2.6)/5.2);
    const shallow=1-smooth(-.22,-.01,bankDistance(x,z));
    const c=new T.Color().lerpColors(new T.Color(0xb9d9ba),new T.Color(0x499e9c),shallow);
    waterColors.push(c.r,c.g,c.b);
    if(j<wr&&i<wn){const k=j*(wn+1)+i;waterIndices.push(k,k+1,k+wn+1,k+1,k+wn+2,k+wn+1);}
  }
  const waterGeo=new T.BufferGeometry();waterGeo.setAttribute('position',new T.Float32BufferAttribute(waterPositions,3));waterGeo.setAttribute('color',new T.Float32BufferAttribute(waterColors,3));waterGeo.setAttribute('uv',new T.Float32BufferAttribute(waterUvs,2));waterGeo.setIndex(waterIndices);waterGeo.computeVertexNormals();
  const water=mesh(waterGeo,'water');water.userData.noShadow=true;

  // Individual folded leaves, batched into one colored mesh; no foliage spheres.
  const leaves={p:[],n:[],c:[],uv:[]};
  const leafColors=[0x294b26,0x3f602d,0x647a37,0x7e873f,0x254d33,0x466d40].map(c=>new T.Color(c));
  function leaf(position,length,width,yaw,pitch=0,tint=0){
    const rotation=new T.Euler(pitch,yaw,random()*.8-.4),q=new T.Quaternion().setFromEuler(rotation);
    const local=[V(0,0,0),V(-width*.5,length*.35,length*.13),V(0,length*.5,length*.19),V(width*.5,length*.35,length*.13),V(0,length,length*.08)];
    const verts=local.map(v=>v.clone().applyQuaternion(q).add(position)),color=leafColors[tint%leafColors.length];
    for(const tri of [[0,1,2],[0,2,3],[1,4,2],[2,4,3]]){
      const normal=verts[tri[1]].clone().sub(verts[tri[0]]).cross(verts[tri[2]].clone().sub(verts[tri[0]])).normalize();
      for(const id of tri){leaves.p.push(...verts[id].toArray());leaves.n.push(...normal.toArray());const shade=.82+.18*(local[id].y/length);leaves.c.push(color.r*shade,color.g*shade,color.b*shade);leaves.uv.push(id===1?0:id===3?1:.5,local[id].y/length);}
    }
  }
  function spray(x,y,z,r,count=60){
    for(let i=0;i<count;i++){const a=random()*Math.PI*2,b=Math.acos(2*random()-1),d=r*Math.cbrt(random());const p=V(x+Math.cos(a)*Math.sin(b)*d,y+Math.cos(b)*d*.85,z+Math.sin(a)*Math.sin(b)*d);leaf(p,.065+random()*.075,.035+random()*.035,random()*Math.PI*2,.65+random()*1.5,i);}
  }
  function shrub(x,z,r=.13){spray(x,height(x,z)+r*.5,z,r,140);}
  function tree(x,z,h=.75,parent=staticWorld,baseY=height(x,z)){
    const g=group(x,baseY,z,parent);tube(C([[0,0,0],[.025,h*.4,-.015],[0,h*.8,0]]),.017,'darkWood',g,16);
    for(let i=0;i<5;i++){
      const a=i*2.4,px=Math.cos(a)*h*.23,pz=Math.sin(a)*h*.23,py=h*(.62+random()*.25);
      tube(C([[0,h*.37,0],[px*.5,py*.8,pz*.5],[px,py,pz]]),.008,'wood',g,10);
      // Foliage is world-space; canopy garden trees also use explicit root coordinates.
      spray(x+px,baseY+py,z+pz,h*.23,220);
    }
  }
  function palm(x,z,h=.75,baseY=height(x,z)){
    tube(C([[x,baseY,z],[x+.03,baseY+h*.45,z-.02],[x+.05,baseY+h,z]]),.015,'wood');
    for(let j=0;j<9;j++){
      const a=j/9*Math.PI*2,path=C([[x+.05,baseY+h,z],[x+Math.cos(a)*.16,baseY+h+.1,z+Math.sin(a)*.16],[x+Math.cos(a)*.38,baseY+h-.13,z+Math.sin(a)*.38]]);tube(path,.004,'bamboo',staticWorld,14);
      for(let k=2;k<11;k++){const p=path.getPoint(k/11);for(const s of [-1,1])leaf(p,.17*(1-k/14),.025,-a+s*.9,1.2,j+k);}
    }
  }
  function rock(x,z,r=.15,y=height(x,z)){
    const geo=new T.IcosahedronGeometry(r,2),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const v=V().fromBufferAttribute(p,i),s=.86+noise(v.x*21+3,v.z*21+v.y*8)*.29;p.setXYZ(i,v.x*s,v.y*s*.85,v.z*s);}
    geo.computeVertexNormals();const o=mesh(geo,'rock');o.position.set(x,y+r*.23,z);o.rotation.set(random(),random()*6,random());o.scale.set(1+random()*.4,.65+random()*.6,1);return o;
  }
  for(let i=0;i<460;i++){
    const x=(random()-.5)*7,z=(random()-.5)*4.7,d=bankDistance(x,z);
    if(x*x/12.5+z*z/5.6>.95||d<-.06)continue;
    if(Math.abs(x+2.25)<.85&&Math.abs(z-.35)<.78||Math.abs(x-2.2)<.7&&Math.abs(z-1.12)<.65)continue;
    if(d<.18){rock(x,z,.06+random()*.13);if(i%2===0)shrub(x,z,.12);}
    else {shrub(x,z,.1+random()*.1);if(i%6===0)tree(x,z,.45+random()*.4);if(i%11===0)palm(x,z,.7);}
  }
  [[-3,-.4,.8],[-2.7,-1.1,.9],[-2.1,-1.9,1.1],[-1.5,-1.8,1],[-.85,-1.9,.7],[.7,-1.9,.8],[1.5,-1.8,.8],[2.9,-.65,.75],[-3,.9,.7]].forEach(p=>tree(...p));
  [[-2.85,.8,.9],[-1.7,-1.7,1],[.8,-1.8,.85],[2.8,.7,.8],[1.4,1.2,.9],[-1.25,1.25,.65]].forEach(p=>palm(...p));

  for(const path of channels)for(let i=6;i<90;i+=3){
    const p=path.getPoint(i/100),d=path.getTangent(i/100),n=V(-d.z,0,d.x).normalize();
    for(const side of [-1,1]){
      let q=p.clone();for(let r=.35;r<2.2;r+=.025){q=p.clone().addScaledVector(n,r*side);if(bankDistance(q.x,q.z)>.025)break;}
      if(q.x*q.x/13.2+q.z*q.z/6.2>.93)continue;
      rock(q.x,q.z,.055+random()*.09,waterY-.018);
      if(i%2===0)shrub(q.x+n.x*side*.08,q.z+n.z*side*.08,.085);
    }
  }
  const practicals=[];
  const glowMaterial=new T.SpriteMaterial({map:warmGlow,color:0xffc36e,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:.7});
  function lamp(x,y,z,r=.015,parent=staticWorld,glow=true){
    const o=mesh(new T.SphereGeometry(r,8,6),'light',parent);o.position.set(x,y,z);
    if(glow){const s=new T.Sprite(glowMaterial);s.position.set(x,y,z);s.scale.setScalar(r*9);parent.add(s);practicals.push(s);}
  }
  // Three asymmetric planted crowns, with an open branching gold lattice.
  const tx=-.16,tz=-.64,ground=height(tx,tz),crowns=[[-.78,2.74,.04,.96],[.74,2.28,.1,.85],[0,3.5,-.08,1.19]];
  for(let i=0;i<16;i++){
    const a=i/16*Math.PI*2;
    tube(C([[tx+Math.cos(a)*.42,ground,tz+Math.sin(a)*.42],[tx+Math.cos(a+.2)*.16,1.45,tz+Math.sin(a+.2)*.16],[tx+Math.cos(a)*.21,2.65,tz+Math.sin(a)*.21],[tx+Math.cos(a)*.8,3.44,tz+Math.sin(a)*.8]]),.022,'brass');
    if(i%2===0)tube(C([[tx+Math.cos(a)*.446,ground,tz+Math.sin(a)*.446],[tx+Math.cos(a+.2)*.185,1.45,tz+Math.sin(a+.2)*.185],[tx+Math.cos(a)*.235,2.65,tz+Math.sin(a)*.235],[tx+Math.cos(a)*.82,3.44,tz+Math.sin(a)*.82]]),.004,'light');
  }
  for(const [cx,cy,cz,r] of crowns){
    const x=tx+cx,z=tz+cz;
    torus(r,x,cy,z,'brass',staticWorld,.018);
    const bed=mesh(new T.SphereGeometry(r,48,12,0,Math.PI*2,0,Math.PI/2),'soil');bed.position.set(x,cy,z);bed.scale.y=.07;
    for(let i=0;i<28;i++){
      const a=i/28*Math.PI*2,ex=x+Math.cos(a)*r,ez=z+Math.sin(a)*r;
      tube(C([[tx+Math.cos(a)*.13,ground+.12,tz+Math.sin(a)*.13],[tx+cx*.34,cy-.75,tz+cz*.34],[x+Math.cos(a)*r*.4,cy-.24,z+Math.sin(a)*r*.4],[ex,cy,ez]]),.012,'brass',staticWorld,28);
      lamp(ex,cy+.025,ez,.012,staticWorld,i%2===0);
      if(i%2===0){
        const len=.15+random()*.27;const vine=C([[ex,cy+.02,ez],[ex+.025,cy-.1,ez],[ex-.02,cy-len,ez+.02]]);tube(vine,.004,'darkWood',staticWorld,9);
        for(let j=0;j<10;j++){const p=vine.getPoint(j/10);leaf(p,.045,.018,a+j,1.1,j);}
      }
    }
    for(let i=0;i<65;i++){
      const a=random()*Math.PI*2,rad=Math.sqrt(random())*r*.88,px=x+Math.cos(a)*rad,pz=z+Math.sin(a)*rad,py=cy+.05+.05*(1-rad/r);
      spray(px,py+.065,pz,.13+random()*.07,170);
      if(i%7===0){const h=.18+random()*.22;beam([px,py,pz],[px,py+h,pz],.009,'darkWood');spray(px,py+h,pz,.16,240);}
    }
  }
  // Central rocky mound, two short falls and shallow water foam.
  for(let i=0;i<36;i++){const a=random()*Math.PI*2,r=.5+random()*.4;rock(tx+Math.cos(a)*r,tz+Math.sin(a)*r,.1+random()*.13);}
  const falls=[];
  for(const [x,z] of [[-.75,.05],[.58,-.13]]){
    const h=height(x,z)+.08,path=C([[x,h,z],[x+.03,h-.1,z+.12],[x+.1,waterY+.02,z+.22]]);
    const fall=ribbon(path,.11,'foam');fall.material=m.foam.clone();fall.material.opacity=.75;falls.push(fall);
    for(let i=0;i<6;i++){const arc=torus(.04+i*.017,x+.1,waterY+.008,z+.22,'foam',staticWorld,.002);arc.scale.y=.55;}
  }

  function walkway(path,width=.22){
    ribbon(path,width,'wood');
    const rails=[[],[]];
    for(let i=0;i<=90;i++){
      const p=path.getPoint(i/90),d=path.getTangent(i/90),n=V(-d.z,0,d.x).normalize();
      if(i%2===0)beam(p.clone().addScaledVector(n,-width/2).toArray(),p.clone().addScaledVector(n,width/2).toArray(),.008,'bamboo');
      for(let j=0;j<2;j++){const q=p.clone().addScaledVector(n,(j?1:-1)*width/2);rails[j].push([q.x,q.y+.16,q.z]);if(i%3===0)beam(q.toArray(),[q.x,q.y+.16,q.z],.006,'bamboo');if(i%15===0)lamp(q.x,q.y+.18,q.z,.012);}
      if(i%12===0){beam([p.x,height(p.x,p.z),p.z],p.toArray(),.016,'wood');}
    }
    rails.forEach(points=>tube(C(points),.009,'bamboo'));
  }
  const walk=C([[-2.75,1.12,-.9],[-2.25,1.3,-1.23],[-1.8,1.26,-.92],[-1.65,1.16,-.28],[-.98,1.15,.12],[-.4,1.2,-.07],[.2,1.28,-.42]]);walkway(walk,.25);
  const spiral=C(Array.from({length:81},(_,i)=>{const a=i/80*Math.PI*1.7;return [tx+Math.cos(a)*.55,ground+.1+i/80*.75,tz+Math.sin(a)*.55];}));walkway(spiral,.15);

  function railing(x1,z1,x2,z2,y,parent){
    beam([x1,y+.2,z1],[x2,y+.2,z2],.011,'bamboo',parent);beam([x1,y+.055,z1],[x2,y+.055,z2],.007,'wood',parent);
    const n=Math.ceil(Math.hypot(x2-x1,z2-z1)/.07);for(let i=0;i<=n;i++){const t=i/n;beam([x1+(x2-x1)*t,y,z1+(z2-z1)*t],[x1+(x2-x1)*t,y+.2,z1+(z2-z1)*t],.007,'wood',parent);}
  }
  const pavilion=group(-2.26,height(-2.26,.38),.38);pavilion.rotation.y=.12;
  for(const x of [-.56,-.2,.2,.56])for(const z of [-.4,.4])cylinder(.022,.026,.31,x,.15,z,'wood',pavilion);
  for(let i=0;i<22;i++)box(1.28,.035,.044,0,.32,-.48+i*.045,'wood',pavilion);
  box(.96,.52,.025,0,.59,-.2,'darkWood',pavilion);
  for(let i=0;i<16;i++)box(.027,.52,.018,-.47+i*.062,.59,-.177,'wood',pavilion);
  for(const x of [-.31,.31]){box(.22,.28,.02,x,.63,-.158,'window',pavilion);for(const dx of [-.11,0,.11])box(.012,.3,.025,x+dx,.63,-.14,'bamboo',pavilion);box(.23,.012,.025,x,.63,-.14,'bamboo',pavilion);}
  box(.19,.4,.03,0,.52,-.15,'ink',pavilion);
  for(const x of [-.52,.52])for(const z of [-.32,.38])beam([x,.32,z],[x,1.02,z],.02,'wood',pavilion);
  railing(-.61,-.43,-.61,.46,.35,pavilion);railing(.61,-.43,.61,.46,.35,pavilion);railing(-.61,.46,-.18,.46,.35,pavilion);railing(.18,.46,.61,.46,.35,pavilion);
  for(const z of [-.43,.43]){beam([-.63,.98,z],[0,1.34,z],.022,'wood',pavilion);beam([0,1.34,z],[.63,.98,z],.022,'wood',pavilion);beam([-.6,1.01,z],[.6,1.01,z],.017,'bamboo',pavilion);beam([0,1.01,z],[0,1.34,z],.012,'bamboo',pavilion);}
  for(const side of [-1,1]){
    const roof=group(side*.34,1.16,0,pavilion);roof.rotation.z=-side*.52;
    box(.8,.025,1.13,0,0,0,'roof',roof);
    for(let row=0;row<7;row++)for(let col=0;col<17;col++)box(.12,.012,.063,-.34+row*.11,.018,-.52+col*.064+(row%2)*.015,'roof',roof);
  }
  beam([0,1.36,-.58],[0,1.36,.58],.022,'darkWood',pavilion);
  for(let i=0;i<5;i++){box(.34,.05,.1,0,.04+i*.06,.91-i*.085,'wood',pavilion);}
  for(const x of [-.18,.18])beam([x,.18,.92],[x,.47,.5],.009,'bamboo',pavilion);
  lamp(-.47,.89,.38,.02,pavilion);lamp(.47,.89,.38,.02,pavilion);

  // Coaster has varied elevation, dual rails, bank-side walkway and braced trestles.
  const track=new T.CatmullRomCurve3(Array.from({length:64},(_,i)=>{const a=i/64*Math.PI*2;return V(2.02+Math.cos(a)*1.03,.9+.32*(1+Math.sin(a*2))+.27*(1+Math.cos(a)), -.28+Math.sin(a)*.83);}),true);
  for(const s of [-1,1]){
    const points=Array.from({length:241},(_,i)=>{const p=track.getPoint(i/240),d=track.getTangent(i/240);return p.add(V(-d.z,0,d.x).normalize().multiplyScalar(s*.085));});tube(new T.CatmullRomCurve3(points),.016,'brass',staticWorld,240);
  }
  for(let i=0;i<150;i++){
    const p=track.getPoint(i/150),d=track.getTangent(i/150),n=V(-d.z,0,d.x).normalize().multiplyScalar(.15);
    beam(p.clone().sub(n).toArray(),p.clone().add(n).toArray(),.009,'wood');
    if(i%5===0){
      for(const s of [-1,1])beam([p.x+n.x*s,height(p.x+n.x*s,p.z+n.z*s),p.z+n.z*s],[p.x+n.x*s,p.y-.02,p.z+n.z*s],.013,'bamboo');
      beam([p.x-n.x,.6,p.z-n.z],[p.x+n.x,p.y-.03,p.z+n.z],.008,'wood');
      if(i%10===0)lamp(p.x+n.x,p.y+.06,p.z+n.z,.01);
    }
  }
  const solar=group(2.2,height(2.2,1.18),1.18);solar.rotation.y=-.08;
  for(let i=0;i<18;i++)box(1.12,.035,.042,0,.18,-.38+i*.044,'wood',solar);
  for(const x of [-.49,.49])for(const z of [-.3,.3])beam([x,0,z],[x,.76,z],.021,'wood',solar);
  for(const x of [-.5,.5])railing(x,-.34,x,.34,.21,solar);
  const solarRoof=group(0,.8,0,solar);solarRoof.rotation.x=.2;box(1.3,.035,.91,0,0,0,'wood',solarRoof);
  for(let row=0;row<4;row++)for(let col=0;col<6;col++){
    const x=-.53+col*.21,z=-.33+row*.215;box(.195,.01,.2,x,.024,z,'solar',solarRoof);
    for(let j=1;j<4;j++)box(.002,.003,.19,x-.097+j*.048,.032,z,'cream',solarRoof);
  }
  for(const x of [-.34,.34]){box(.24,.055,.3,x,.32,0,'wood',solar);box(.04,.15,.04,x,.25,0,'darkWood',solar);lamp(x,.66,.27,.018,solar);}

  // Fine landscape details: ferns, grass blades, lanterns, visitors and plaque.
  for(let i=0;i<120;i++){
    const a=random()*Math.PI*2,r=2.8+random()*.5,x=Math.cos(a)*r,z=Math.sin(a)*r*.66;
    if(bankDistance(x,z)<.1)continue;
    for(let j=0;j<10;j++)leaf(V(x,height(x,z)+.01,z),.07+random()*.08,.008,j*.63,.3,j);
  }
  function person(x,y,z,material='cream',parent=staticWorld){
    cylinder(.018,.024,.075,x,y+.075,z,material,parent);const head=mesh(new T.SphereGeometry(.019,8,6),'bamboo',parent);head.position.set(x,y+.133,z);
    for(const s of [-1,1])beam([x+s*.011,y,z],[x+s*.011,y+.047,z],.007,'ink',parent);
  }
  for(const [x,z] of [[-1.55,1.22],[-1.68,1.26],[1.43,1.5],[1.56,1.45],[-2.85,.98],[2.88,.9]])person(x,height(x,z),z);
  for(const t of [.16,.27,.5,.58,.8]){const p=walk.getPoint(t);person(p.x,p.y,p.z,'red');}
  for(const [x,z] of [[-1.6,1.12],[-2.9,.9],[1.35,1.45],[2.9,.88],[-.8,.5]]){const y=height(x,z);beam([x,y,z],[x,y+.2,z],.009,'brass');lamp(x,y+.23,z,.018);}
  const plaque=group(-.08,.15,2.59);box(2.28,.28,.04,0,0,0,'brass',plaque);box(2.23,.23,.022,0,0,.032,'ink',plaque);
  const c=document.createElement('canvas');c.width=1536;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#d9ba7b';ctx.font='70px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('TWO RIVERS, ONE FUTURE',768,96);
  const textMap=new T.CanvasTexture(c);textMap.colorSpace=T.SRGBColorSpace;const text=mesh(new T.PlaneGeometry(2.12,.22),new T.MeshBasicMaterial({map:textMap,transparent:true,depthWrite:false}),plaque);text.position.z=.046;text.userData.noShadow=true;

  function boat(){
    const g=group(0,0,0,root),shape=new T.Shape();shape.moveTo(0,-.29);shape.bezierCurveTo(-.15,-.2,-.14,.18,0,.29);shape.bezierCurveTo(.14,.18,.15,-.2,0,-.29);
    const hull=mesh(new T.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2,curveSegments:12}),'red',g);hull.rotation.x=-Math.PI/2;hull.position.y=-.01;
    box(.17,.018,.4,0,.065,0,'wood',g);
    for(const x of [-.085,.085])for(const z of [-.16,.16])beam([x,.065,z],[x,.24,z],.006,'brass',g);
    for(const side of [-1,1]){const roof=box(.13,.012,.43,side*.055,.255,0,'red',g);roof.rotation.z=-side*.24;}
    for(const z of [-.11,0,.11]){box(.15,.02,.035,0,.1,z,'wood',g);person(.035,.08,z,'cream',g);}
    for(const x of [-.09,.09])beam([x,.14,-.2],[x,.14,.2],.005,'brass',g);
    lamp(0,.22,.19,.009,g,false);
    return g;
  }
  const boats=[boat(),boat()];
  const boatFades=boats.map(prepareBoatFade);
  const trains=Array.from({length:5},()=>{const g=group(0,0,0,root);box(.12,.06,.13,0,.04,0,'red',g);box(.09,.025,.09,0,.082,0,'ink',g);person(0,.07,0,'cream',g);for(const x of [-.065,.065])for(const z of [-.035,.035]){const w=mesh(new T.SphereGeometry(.016,6,4),'ink',g);w.position.set(x,0,z);}return g;});
  const drones=group(0,0,0,root);for(let i=0;i<28;i++){const a=i/28*Math.PI*2;lamp(tx+Math.cos(a)*1.45,3.92+Math.sin(a*2)*.07,tz+Math.sin(a)*1.45,.007,drones,false);}

  // Merge static opaque geometry while preserving vertex colors and UVs.
  staticWorld.updateMatrixWorld(true);const batches=new Map(),dispose=new Set(),sprites=[];
  staticWorld.traverse(o=>{
    if(o.isSprite){o.updateWorldMatrix(true,false);const s=o.clone();s.position.setFromMatrixPosition(o.matrixWorld);sprites.push(s);return;}
    if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);dispose.add(o.geometry);
    const key=o.material.uuid+Boolean(o.userData.noShadow);if(!batches.has(key))batches.set(key,{material:o.material,p:[],n:[],uv:[],color:[],noShadow:o.userData.noShadow});const b=batches.get(key),n=g.attributes.position.count;
    for(const [dest,attribute,stride] of [[b.p,'position',3],[b.n,'normal',3],[b.uv,'uv',2],[b.color,'color',3]]){const arr=g.attributes[attribute]?.array;if(arr)for(const value of arr)dest.push(value);else for(let i=0;i<n*stride;i++)dest.push(attribute==='color'?1:0);}
    g.dispose();
  });
  staticWorld.clear();dispose.forEach(g=>g.dispose());sprites.forEach(s=>staticWorld.add(s));
  for(const b of batches.values()){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.setAttribute('color',new T.Float32BufferAttribute(b.color,3));g.computeBoundingSphere();const o=mesh(g,b.material);o.userData.noShadow=b.noShadow;}
  const leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute(leaves.p,3));leafGeo.setAttribute('normal',new T.Float32BufferAttribute(leaves.n,3));leafGeo.setAttribute('color',new T.Float32BufferAttribute(leaves.c,3));leafGeo.setAttribute('uv',new T.Float32BufferAttribute(leaves.uv,2));leafGeo.computeBoundingSphere();mesh(leafGeo,'foliage');
  root.updateMatrixWorld(true);const framingPoints=[];
  root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=45)framingPoints.push(V().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));});
  Object.assign(root.userData,{artifactId:40,conceptual:true,displayBase:false,studioProfile:'two-rivers',groundLevel:-.08,initialYaw:-.13,initialElevation:.34,autoOrbit:false,framingPoints,realTimeAnimation:true});
  const atmosphere=riverAtmosphere(T,root,{bankDistance});
  root.userData.animate=time=>{
    atmosphere.animate(time);
    waterNormal.offset.set(time*.008,time*.004);
    boats.forEach((g,i)=>{const phase=(time*.025+.32+i*.35)%1,branch=phase<.72?i:2,t=phase<.72?phase/.72:(phase-.72)/.28,path=routes[branch],p=path.getPoint(t),d=path.getTangent(t);g.position.copy(p);g.position.y+=.012+Math.sin(time*1.8+i)*.004;g.rotation.y=Math.atan2(d.x,d.z);g.rotation.z=Math.sin(time+i)*.008;boatFades[i].setOpacity(boatOpacity(phase));});
    trains.forEach((g,i)=>{const t=(time*.03-i*.014+1)%1,p=track.getPoint(t),d=track.getTangent(t);g.position.copy(p);g.position.y+=.035;g.rotation.y=Math.atan2(d.x,d.z);g.rotation.x=-Math.asin(d.y);});
    drones.rotation.y=Math.sin(time*.12)*.08;
  };
  const nightLights=[];
  for(const [x,y,z] of [[-.16,1.15,-.64],[-.94,2.95,-.6],[.58,2.5,-.54],[-.16,3.75,-.72]]){
    const light=new T.PointLight(0xffb44f,0,2.6,2);light.position.set(x,y,z);root.add(light);nightLights.push(light);
  }
  root.userData.setTheme=theme=>{
    const night=theme==='dark';
    atmosphere.setTheme(theme);
    m.light.color.setHex(night?0xffcf78:0xe0c38d);m.light.emissiveIntensity=night?6:0;
    m.window.color.setHex(night?0xffbf58:0x658c94);m.window.emissiveIntensity=night?2.5:0;
    m.water.color.setHex(night?0x268d9c:0x8fe0d1);m.water.emissive.setHex(0x087e99);m.water.emissiveIntensity=night?.28:0;
    m.brass.emissive.setHex(0xff941e);m.brass.emissiveIntensity=night?.10:0;
    m.foliage.color.setHex(night?0x80aaa4:0xffffff);
    nightLights.forEach(light=>light.intensity=night?2.5:0);
    glowMaterial.opacity=night?1:0;drones.visible=night;
    boatFades.forEach(fade=>fade.syncTheme());
  };
  root.userData.animate(0);return root;
}
