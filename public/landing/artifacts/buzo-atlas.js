import { applyBakedAO } from './buzo-atlas-surface.js';
import { sculpture } from './sculpture.js';

// A cultural portfolio as a miniature atlas: live performance, art and property.
export function createArtifact(THREE, { bake = false } = {}) {
  const { root, materials, mesh, box, disk, ball, line } = sculpture(THREE);
  const palette={paper:0xe5d7bb,ivory:0xf6edda,shade:0xc4ad83,red:0x942a32,blue:0x294e70,ink:0x26333d,wood:0xaf8755};
  for(const [key,color] of Object.entries(palette)){materials[key].color.setHex(color);materials[key].roughness=.88;}
  materials.water = new THREE.MeshStandardMaterial({color:0x9eafb0,roughness:.85,side:THREE.DoubleSide});
  materials.wood.metalness=.35; materials.wood.roughness=.5;
  let seed=75;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  // Preserve fine paper grain on all relief surfaces, including merged geometry.
  const grainData=new Uint8Array(256*256*4);
  for(let i=0;i<grainData.length;i+=4){const n=145+(random()-.5)*70;grainData[i]=grainData[i+1]=grainData[i+2]=n;grainData[i+3]=255;}
  const grain=new THREE.DataTexture(grainData,256,256);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(3,3);grain.needsUpdate=true;
  for(const key of ['paper','ivory','shade','red','blue']){materials[key].bumpMap=grain;materials[key].bumpScale=key==='red'?.012:.019;}
  const edgeData=new Uint8Array(16*520*4);
  for(let y=0;y<520;y++)for(let x=0;x<16;x++){const i=(y*16+x)*4;const v=y%20<2?211:235+(y%20)*.3;edgeData[i]=v;edgeData[i+1]=v;edgeData[i+2]=v;edgeData[i+3]=255;}
  const edgeMap=new THREE.DataTexture(edgeData,16,520);edgeMap.colorSpace=THREE.SRGBColorSpace;edgeMap.magFilter=THREE.LinearFilter;edgeMap.minFilter=THREE.LinearMipmapLinearFilter;edgeMap.generateMipmaps=true;edgeMap.needsUpdate=true;
  materials.pageEdge=materials.paper.clone();materials.pageEdge.map=edgeMap;materials.pageEdge.bumpMap=edgeMap;materials.pageEdge.bumpScale=.002;
  const labels=[];
  function finish(id,preserved){
    root.updateMatrixWorld(true);const batches=new Map();
    for(const group of preserved)root.remove(group);
    root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);let b=batches.get(o.material);if(!b){b={position:[],normal:[],uv:[]};batches.set(o.material,b);}for(const key of ['position','normal','uv']){const a=g.attributes[key];if(a)for(const value of a.array)b[key].push(value);else for(let i=0;i<g.attributes.position.count*2;i++)b.uv.push(0);}g.dispose();o.geometry.dispose();});
    root.clear();for(const [material,b]of batches){const g=new THREE.BufferGeometry();for(const key of ['position','normal','uv'])g.setAttribute(key,new THREE.Float32BufferAttribute(b[key],key==='uv'?2:3));g.computeBoundingSphere();const m=new THREE.Mesh(g,material);m.castShadow=m.receiveShadow=true;root.add(m);}
    preserved.forEach(g=>root.add(g));root.userData={artifactId:id,conceptual:true};return root;
  }
  function region(before,cx,cz,x,z,scale=1){const group=new THREE.Group();root.add(group);for(const o of [...root.children])if(o!==group&&!before.has(o)){root.updateMatrixWorld(true);group.attach(o);}group.position.set(x-cx*scale,.35*(1-scale),z-cz*scale);group.scale.setScalar(scale);return group;}

  function orient(g,axis,direction=1){g.computeVertexNormals();const n=g.attributes.normal;let sum=0;for(let i=0;i<n.count;i++)sum+=axis==='y'?n.getY(i):n.getZ(i);if(sum*direction<0){const a=g.index.array;for(let i=0;i<a.length;i+=3){const t=a[i+1];a[i+1]=a[i+2];a[i+2]=t;}g.index.needsUpdate=true;g.computeVertexNormals();}return g;}
  function relief(points,depth,color,parent=root){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2}),color,parent);}
  function rod(a,b,r=.018,color='ivory',parent=root){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const m=mesh(new THREE.CylinderGeometry(r,r,v.length(),8),color,parent);m.position.copy(new THREE.Vector3(...a).addScaledVector(v,.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
  function arch(w,h,depth,color,parent=root){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.closePath();return mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:2,curveSegments:24}),color,parent);}
  function contour(radius,y,thickness,phase=0,x=0,z=0,ratio=.79){const s=new THREE.Shape();for(let i=0;i<=128;i++){const t=i/128*Math.PI*2,r=radius*(1+.045*Math.sin(5*t+phase)+.022*Math.cos(9*t)+.018*Math.sin(17*t));const px=Math.cos(t)*r,pz=Math.sin(t)*r*ratio;i?s.lineTo(px,pz):s.moveTo(px,pz);}const g=new THREE.ExtrudeGeometry(s,{depth:thickness,bevelEnabled:true,bevelSize:.018,bevelThickness:.012,bevelSegments:2});g.rotateX(-Math.PI/2);const m=mesh(g,'ivory');m.position.set(x,y,z);return m;}
  for(let i=0;i<5;i++)contour(4.05-i*.042,.025+i*.066,.045);
  // Fine, continuous cartography follows uneven districts instead of a tiled cross pattern.
  function clear(x,z){return Math.hypot(x+2.15,z+1.28)>1.05&&Math.hypot(x-2.15,z+1.38)>.85&&Math.hypot(x-2.15,z-1.55)>.95&&!(Math.abs(x)<1.3&&Math.abs(z-.4)<1.05);}
  for(let axis=0;axis<2;axis++)for(let k=-15;k<=15;k++){
    let points=[];
    for(let j=0;j<=130;j++){
      const u=-3.85+j*.059,v=k*.205+.09*Math.sin(u*1.3+k*.7)+.04*Math.sin(u*4+k);
      const x=axis?u:v,z=axis?v:u;
      if(x*x/15.3+z*z/9.2<.94&&clear(x,z)){points.push([x,.354,z]);}
      else {if(points.length>2)line(points,.0035,k%4?'paper':'shade');points=[];}
    }
    if(points.length>2)line(points,.0035,'paper');
  }
  // Low relief contour hills and small city districts.
  const towns=[[-2.9,.65],[-2.2,1.9],[-.20,-2.05],[1.15,-2.0],[3.2,-.15],[2.95,1.72],[-3.1,-.5],[.30,2.48],[-1.25,-1.40],[.50,-1.10]];
  for(const [index,[x,z]] of towns.entries()){
    const layers=index===2?9:index%3===0?5:1;const radius=index===2?.65:.30+random()*.16;
    for(let k=0;k<layers;k++)contour(radius-k*.035,.35+k*.025,.017,index*.5,x,z,.70+random()*.08);
    for(let j=0;j<(index===2?19:11);j++){const xx=x+(random()-.5)*.43,zz=z+(random()-.5)*.34,h=.06+random()*.17;box(.065+random()*.045,h,.08,xx,.37+(layers-1)*.025+h/2,zz,j%3?'ivory':'paper');}
    if(index%2===0){rod([x,.38+(layers-1)*.025,z],[x,.95,z],.012,'wood');const flag=relief([[0,0],[.23,-.07],[0,-.15]],.012,'red');flag.position.set(x,.94,z);}
  }
  const riverPath=new THREE.CatmullRomCurve3([[-3.55,.355,.55],[-3.2,.355,.95],[-3.25,.355,1.55],[-2.75,.355,1.85],[-2.1,.355,2.35],[-1.3,.355,2.3],[-.65,.355,2.75]].map(p=>new THREE.Vector3(...p)));
  const rv=[],ri=[];for(let i=0;i<=90;i++){const p=riverPath.getPoint(i/90),t=riverPath.getTangent(i/90);for(const side of [-1,1])rv.push(p.x+t.z*(.13+.06*Math.sin(i*.17))*side,p.y,p.z-t.x*(.13+.06*Math.sin(i*.17))*side);if(i<90){const a=i*2;ri.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rv,3));rg.setIndex(ri);orient(rg,'y');mesh(rg,'water');
  for(const t of [.30,.70]){
    const p=riverPath.getPoint(t),bridge=new THREE.Group();root.add(bridge);bridge.position.set(p.x,.37,p.z);
    box(.18,.055,.40,0,.07,0,'paper',bridge);
    for(const x of [-.085,.085]){box(.015,.045,.43,x,.11,0,'ivory',bridge);for(const z of [-.16,0,.16])box(.022,.10,.025,x,.07,z,'paper',bridge);}
  }
  for(let i=5;i<85;i+=4){const p=riverPath.getPoint(i/90);box(.055,.004,.008,p.x,.357,p.z,'ivory');}
  const atlasStart=new Set(root.children);
  // Central cloth-bound atlas, with bowed paper leaves and fine ledger rules.
  for(const side of [-1,1]){
    box(.98,.065,1.48,side*.50,.40,.40,'red');
    for(let j=0;j<26;j++){
      const g=new THREE.PlaneGeometry(.94,1.40,24,12),p=g.attributes.position;
      for(let i=0;i<p.count;i++){const x=side*(p.getX(i)+.47+.015),z=p.getY(i)+.40;p.setXYZ(i,x,.45+j*.009+Math.sin(Math.abs(x)*Math.PI)*.12,z);}
      orient(g,'y');mesh(g,j%4?'ivory':'paper');
    }
    for(const z of [-.30,1.10]){
      const positions=[],indices=[],uv=[];
      for(let i=0;i<=32;i++){const x=side*(i/32*.94+.015),y=.45+Math.sin(Math.abs(x)*Math.PI)*.12;positions.push(x,y,z,x,y+.225,z);uv.push(i/32,0,i/32,1);if(i<32){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
      const edge=new THREE.BufferGeometry();edge.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));edge.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));edge.setIndex(indices);orient(edge,'z',Math.sign(z-.4));mesh(edge,'pageEdge');
    }
    box(.012,.225,1.40,side*.955,.45+.1125+Math.sin(.955*Math.PI)*.12,.4,'paper');
  }
  line([[0,.43,-.35],[0,.45,.40],[0,.43,1.14],[.12,.35,1.37]],.035,'red');

  region(atlasStart,0,.4,0,.45,1.27);
  const stageStart=new Set(root.children);
  // A real miniature performance stage: curved truss, velvet folds and instruments.
  const sx=-1.65,sz=-1.08;
  disk(.94,.11,sx,.40,sz,'paper');disk(.86,.07,sx,.49,sz);disk(.75,.045,sx,.55,sz);
  for(let j=0;j<3;j++)box(.80-j*.035,.045,.14,sx,.37+j*.05,sz+.89-j*.09);
  for(const side of [-1,1]){
    const x=sx+side*.76;
    for(const dx of [-.07,.07])rod([x+dx,.56,sz-.35],[x+dx,1.94,sz-.35]);
    for(let j=0;j<5;j++){rod([x-.07,.60+j*.26,sz-.35],[x+.07,.84+j*.26,sz-.35],.012);rod([x+.07,.60+j*.26,sz-.35],[x-.07,.84+j*.26,sz-.35],.012);}
    box(.26,.85,.25,x,.99,sz+.38,'paper');
    for(let j=0;j<3;j++){const cone=disk(.09,.022,x,.72+j*.25,sz+.515,'shade');cone.rotation.x=Math.PI/2;const center=disk(.055,.026,x,.72+j*.25,sz+.531,'paper');center.rotation.x=Math.PI/2;}
  }
  for(const lift of [0,.14])line(Array.from({length:25},(_,i)=>{const t=i/24*Math.PI;return[sx+Math.cos(t)*.83,1.89+Math.sin(t)*.29+lift,sz-.35];}),.038,'ivory');
  for(let j=0;j<12;j++){const t=j/12*Math.PI,t2=(j+1)/12*Math.PI;rod([sx+Math.cos(t)*.83,1.89+Math.sin(t)*.29,sz-.35],[sx+Math.cos(t2)*.83,2.03+Math.sin(t2)*.29,sz-.35],.013);}
  const curtainGeometry=new THREE.PlaneGeometry(1.39,1.29,140,24),cp=curtainGeometry.attributes.position;
  for(let i=0;i<cp.count;i++){const x=cp.getX(i),y=cp.getY(i);cp.setXYZ(i,x,y,.032*Math.sin(x*76)+.008*Math.sin(y*8+x*9));}
  curtainGeometry.computeVertexNormals();const curtain=mesh(curtainGeometry,'blue');curtain.position.set(sx,1.20,sz-.38);
  box(1.62,.09,.20,sx,1.90,sz-.38,'paper');
  for(const dx of [-.83,.83]){box(.20,.11,.24,sx+dx,.60,sz-.35,'paper');box(.20,.12,.24,sx+dx,1.90,sz-.35,'paper');}

  for(let j=0;j<5;j++){const x=sx-.56+j*.28;rod([x,1.96,sz-.30],[x,1.78,sz-.18],.014,'wood');ball(.052,x,1.75,sz-.17,'ivory');}
  const drum=disk(.15,.14,sx,.76,sz+.16,'blue');drum.rotation.x=Math.PI/2;
  const drumHead=disk(.135,.014,sx,.76,sz+.24,'ivory');drumHead.rotation.x=Math.PI/2;
  for(const dx of [-.21,.20]){rod([sx+dx,.58,sz],[sx+dx,.91,sz],.012,'ink');disk(.085,.08,sx+dx,.91,sz,'paper');}
  for(const [dx,dz,h]of[[-.38,.04,1.02],[.34,-.06,1.12]]){rod([sx+dx,.58,sz+dz],[sx+dx,h,sz+dz],.012,'wood');disk(.12,.012,sx+dx,h,sz+dz,'wood');for(const a of [0,2.1,4.2])rod([sx+dx,.65,sz+dz],[sx+dx+Math.cos(a)*.1,.58,sz+dz+Math.sin(a)*.1],.008,'ink');}
  box(.35,.035,.13,sx-.45,.83,sz+.38,'ink');for(let j=0;j<9;j++)box(.025,.008,.09,sx-.59+j*.035,.854,sz+.39);
  for(const side of [-1,1])rod([sx-.45+side*.12,.58,sz+.36],[sx-.45-side*.12,.82,sz+.36],.012,'ink');

  // A guitar and heavier proscenium give the stage a recognisable silhouette.
  const guitar=new THREE.Group();root.add(guitar);guitar.position.set(sx+.48,.60,sz+.22);guitar.rotation.z=-.13;
  const body=ball(.08,0,.11,0,'blue',guitar);body.scale.set(.75,1.2,.35);const shoulder=ball(.055,0,.20,0,'blue',guitar);shoulder.scale.z=.4;
  box(.025,.30,.025,0,.35,0,'wood',guitar);box(.045,.07,.025,0,.53,0,'blue',guitar);
  for(const dx of [-.006,0,.006])rod([dx,.08,.03],[dx,.55,.03],.0015,'paper',guitar);
  region(stageStart,sx,sz,-2.15,-1.28,1.03);
  const artStart=new Set(root.children);
  // Layered crimson frame and a sculpted abstract print.
  disk(.73,.10,1.65,.40,-1.18,'paper');disk(.64,.045,1.65,.47,-1.18);
  const art=new THREE.Group();root.add(art);art.position.set(1.65,.51,-1.18);art.rotation.y=-.14;
  box(1.02,1.52,.08,0,.76,0,'paper',art);
  for(let k=0;k<3;k++){for(const x of [-1,1])box(.035,1.68-k*.075,.05,x*(.57-k*.036),.77,.04+k*.028,'red',art);for(const y of [-.07+k*.036,1.61-k*.036])box(1.17-k*.075,.035,.05,0,y,.04+k*.028,'red',art);}
  const printShape=new THREE.Shape();printShape.moveTo(-.43,.12);printShape.lineTo(-.43,1.40);printShape.bezierCurveTo(.02,1.25,-.36,.94,-.12,.69);printShape.bezierCurveTo(.12,.43,.31,.40,.35,.12);printShape.closePath();
  const wave=mesh(new THREE.ExtrudeGeometry(printShape,{depth:.025,bevelEnabled:true,bevelSize:.012,bevelThickness:.009,bevelSegments:3,curveSegments:36}),'blue',art);wave.position.z=.065;
  const ivoryWave=new THREE.Shape();ivoryWave.moveTo(.40,.12);ivoryWave.lineTo(.40,.52);ivoryWave.bezierCurveTo(.10,.70,.04,.94,-.08,1.08);ivoryWave.bezierCurveTo(-.15,.62,.13,.50,.18,.12);ivoryWave.closePath();
  const slope=mesh(new THREE.ExtrudeGeometry(ivoryWave,{depth:.025,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:3,curveSegments:36}),'ivory',art);slope.position.z=.10;
  const moon=disk(.15,.025,.23,1.15,.085,'ivory',art);moon.rotation.x=Math.PI/2;

  region(artStart,1.65,-1.18,2.15,-1.38,1.05);
  // A small civic gallery: shallow vaulted roof, masonry facade and side arcade.
  const vx=2.15,vz=1.55;
  disk(.86,.10,vx,.40,vz,'paper');disk(.80,.045,vx,.47,vz);
  box(1.12,.69,.88,vx,.84,vz,'ivory');
  for(const y of [.53,.62,1.13,1.20])box(1.22,.045,.99,vx,y,vz,'paper');
  const roof=arch(1.12,.60,.87,'ivory');roof.scale.y=.50;roof.position.set(vx,1.17,vz-.435);
  for(const zz of [-.47,.47])line(Array.from({length:33},(_,i)=>{const a=i/32*Math.PI;return[vx+Math.cos(a)*.59,1.19+Math.sin(a)*.29,vz+zz];}),.028,'paper');
  for(let j=1;j<10;j++){const a=j/10*Math.PI;rod([vx+Math.cos(a)*.56,1.20+Math.sin(a)*.28,vz-.43],[vx+Math.cos(a)*.56,1.20+Math.sin(a)*.28,vz+.43],.005,'paper');}
  const doorway=arch(.39,.69,.034,'paper');doorway.position.set(vx,.51,vz+.47);
  const door=arch(.28,.59,.025,'blue');door.position.set(vx,.51,vz+.51);
  for(const dx of [-.10,0,.10])box(.012,.44,.018,vx+dx,.74,vz+.55,'paper');
  const fan=disk(.12,.015,vx,1.01,vz+.55,'blue');fan.rotation.x=Math.PI/2;
  for(const dx of [-.46,-.29,.29,.46]){
    box(.047,.64,.07,vx+dx,.84,vz+.48);box(.085,.045,.10,vx+dx,.54,vz+.50,'paper');box(.085,.045,.10,vx+dx,1.14,vz+.50,'paper');
    for(let flute=-1;flute<=1;flute++)box(.004,.53,.008,vx+dx+flute*.012,.84,vz+.522,'paper');
  }
  for(const dx of [-.38,.38]){const w=arch(.11,.35,.018,'shade');w.position.set(vx+dx,.69,vz+.45);}
  for(const side of [-1,1])for(const zz of [-.28,0,.28]){
    const w=arch(.14,.40,.018,'blue');w.rotation.y=side*Math.PI/2;w.position.set(vx+side*.57,.65,vz+zz);
    for(const d of [-.10,.10])box(.035,.64,.034,vx+side*.585,.84,vz+zz+d);
  }
  for(let j=0;j<4;j++)box(.66-j*.04,.04,.17,vx,.37+j*.043,vz+.81-j*.075);
  for(const [x,z]of[[vx-.69,vz+.25],[vx+.67,vz+.17],[vx+.62,vz-.35]]){
    rod([x,.49,z],[x,.95,z],.014,'shade');
    for(let k=0;k<8;k++){const t=ball(.055*(1-k*.07),x+.013*Math.sin(k*4),.62+k*.045,z+.01*Math.cos(k*5),'blue');t.scale.set(1,1.8,1);}
  }
  for(const dx of [-.59,.53])for(let j=0;j<3;j++)ball(.055,vx+dx+j*.04,.53,vz+.45+j*.04,'blue');

  const routes=[[[ -1.18,.39,.20],[-1.60,.39,.05],[-1.93,.39,-.04],[-2.15,.39,-.38]],[[1.10,.39,.08],[1.45,.39,-.15],[1.85,.39,-.50],[2.15,.39,-.67]],[[.6,.39,1.25],[.85,.39,1.57],[1.20,.39,1.85],[1.49,.39,1.91]]];
  const curves=routes.map(points=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))));
  // Flat fabric-like paths, not cylindrical cables.
  curves.forEach(curve=>{
    const p=[],indices=[];for(let i=0;i<=70;i++){const v=curve.getPoint(i/70),t=curve.getTangent(i/70);for(const side of [-1,1])p.push(v.x+t.z*.047*side,v.y,v.z-t.x*.047*side);if(i<70){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);orient(g,'y');mesh(g,'blue');
  });
  const signals=new THREE.Group();root.add(signals);
  const beads=curves.map(()=>ball(.045,0,0,0,'wood',signals));
  // Preserve texture coordinates on lettering; the rest batches by material.
  root.updateMatrixWorld(true);
  for(const group of labels)root.attach(group);
  const result=finish(75,[...labels,signals]);
  // Fit the actual height bands, rather than empty corners above the map.
  const bands=new Map(),point=new THREE.Vector3();result.updateMatrixWorld(true);
  result.traverse(object=>{if(!object.isMesh)return;const a=object.geometry.attributes.position;for(let i=0;i<a.count;i++){point.fromBufferAttribute(a,i).applyMatrix4(object.matrixWorld);const key=Math.floor(point.y/.18);if(!bands.has(key))bands.set(key,new THREE.Box3());bands.get(key).expandByPoint(point);}});
  const framingPoints=[];
  for(const b of bands.values())for(const x of [b.min.x-.03,b.max.x+.03])for(const y of [b.min.y-.03,b.max.y+.03])for(const z of [b.min.z-.03,b.max.z+.03])framingPoints.push(new THREE.Vector3(x,y,z));
  result.userData={...result.userData,framingPoints,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:.30,initialElevation:.60,
    animate(time){beads.forEach((bead,i)=>bead.position.copy(curves[i].getPoint((time*.10+i/3)%1)));},
  };
  if(!bake && typeof document!=='undefined')applyBakedAO(THREE,result);
  return result;
}
