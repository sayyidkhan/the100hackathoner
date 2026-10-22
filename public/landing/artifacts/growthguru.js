import { medivoiceStudio } from './medivoice-studio.js';
import { skillRelief, gardenMaterials } from './growthguru-details.js';
import { applyObservatoryAO } from './astrodegen-occlusion.js';
import { LEARNING_PATHS, pathState } from './growthguru-paths.js';

// One sculptural skill tree, with the same book, desk, arch and pool as the artwork.
export function createArtifact(T, options = {}) {
  const { root, materials: m, batch, texture } = medivoiceStudio(T);
  const palette = { stone:0xe5d8bf, cream:0xf8eed9, gold:0xc39952, bark:0x9b713b, wood:0x67432c, jade:0x163f3c, water:0x226e69, leaf:0x688167, coral:0xbd684b, amber:0xc39746, teal:0x397c72, ink:0x263d39, glow:0xffdda0 };
  for (const [key,color] of Object.entries(palette)) m[key] = new T.MeshStandardMaterial({color, roughness:key==='gold'?.3:.66, metalness:key==='gold'?.72:0});
  m.gold.envMapIntensity=1.4; m.water.roughness=.2; m.water.metalness=.25;
  m.glow.emissive.set(0xffc77b);m.glow.emissiveIntensity=1.3;
  m.stone.bumpMap=texture('stone');m.stone.bumpScale=.014;
  m.wood.bumpMap=texture('wood');m.wood.bumpScale=.022;
  gardenMaterials(T,m);
  const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
  const mesh=(geo,key,parent=root)=>{const o=new T.Mesh(geo,m[key]);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
  function roundShape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
  function box(w,h,d,x,y,z,key,parent=root,r=.025){const o=mesh(new T.ExtrudeGeometry(roundShape(w,h,Math.min(r,w/3,h/3)),{depth:d,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,steps:1,curveSegments:5}),key,parent);o.position.set(x,y,z-d/2);return o;}
  function ball(r,x,y,z,key,parent=root){const o=mesh(new T.SphereGeometry(r,20,14),key,parent);o.position.set(x,y,z);return o;}
  function disk(r,h,x,y,z,key,parent=root){const o=mesh(new T.CylinderGeometry(r,r,h,80),key,parent);o.position.set(x,y,z);return o;}
  function ring(r,t,x,y,z,key,parent=root){const o=mesh(new T.TorusGeometry(r,t,8,80),key,parent);o.position.set(x,y,z);return o;}
  function tube(points,r,key,parent=root){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));mesh(new T.TubeGeometry(curve,50,r,8,false),key,parent);return curve;}
  function branchTube(points,r){
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    const geo=new T.TubeGeometry(curve,80,r,12,false),p=geo.attributes.position;
    for(let i=0;i<=80;i++){const t=i/80,c=curve.getPointAt(t),scale=1-.76*t;for(let j=0;j<=12;j++){const k=i*13+j;p.setXYZ(k,c.x+(p.getX(k)-c.x)*scale,c.y+(p.getY(k)-c.y)*scale,c.z+(p.getZ(k)-c.z)*scale);}}
    geo.computeVertexNormals();mesh(geo,'gold',fixed);return curve;
  }
  const fixed=group(),letters=group(),dynamic=group();
  // Thin elliptical stone island with a restrained metal edge; no gallery pedestal.
  disk(4.45,.18,0,.09,0,'gold',fixed).scale.z=.65;
  disk(4.4,.16,0,.24,0,'stone',fixed).scale.z=.65;
  ring(4.31,.016,0,.325,0,'gold',fixed).rotation.x=-Math.PI/2;
  // Ellipse follows the island rather than intersecting its edge.
  fixed.children.at(-1).scale.y=.65;
  const pedestal=mesh(new T.LatheGeometry([[0,.32],[1.62,.32],[1.72,.34],[1.76,.38],[1.76,.51],[1.72,.55],[1.63,.55],[1.63,.59],[1.68,.62],[1.68,.68],[1.64,.72],[1.52,.72],[1.52,.77],[0,.77]].map(p=>new T.Vector2(...p)),100),'stone',fixed);pedestal.position.z=-.05;
  ring(1.635,.012,0,.582,-.05,'glow',fixed).rotation.x=-Math.PI/2;
  ring(1.72,.009,0,.37,-.05,'gold',fixed).rotation.x=-Math.PI/2;
  // Single open architectural arch, built as a true extruded arch ring.
  const arch=new T.Shape();arch.moveTo(-2.45,.34);arch.lineTo(-2.45,3.1);arch.absarc(0,3.1,2.45,Math.PI,0,true);arch.lineTo(2.45,.34);arch.lineTo(2.17,.34);arch.lineTo(2.17,3.1);arch.absarc(0,3.1,2.17,0,Math.PI,false);arch.lineTo(-2.17,.34);arch.closePath();
  const a=mesh(new T.ExtrudeGeometry(arch,{depth:.25,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,curveSegments:64}),'stone',fixed);a.position.z=-1.35;
  const archPts=[[-2.15,.36,-1.04],[-2.15,3.1,-1.04],...Array.from({length:41},(_,i)=>{const angle=Math.PI-i*Math.PI/40;return [2.15*Math.cos(angle),3.1+2.15*Math.sin(angle),-1.04];}),[2.15,.36,-1.04]];
  tube(archPts,.018,'gold',fixed);
  // Solid page blocks with a soft spine valley and fine edges on the fore-edge.
  const book=group(0,.79,.22,fixed);
  const pageY=u=>.055+Math.sin(u*Math.PI)*.19+.018*u;
  for(const side of [-1,1]){
    const shape=new T.Shape();shape.moveTo(0,0);
    for(let i=0;i<=40;i++){const u=i/40;shape.lineTo(side*u*1.25,pageY(u));}
    shape.lineTo(side*1.25,-.035);shape.lineTo(0,-.035);shape.closePath();
    const block=mesh(new T.ExtrudeGeometry(shape,{depth:1.34,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2}),'page',book);block.position.z=-.67;
    const cover=box(1.29,.035,1.4,side*.635,-.055,0,'leather',book);
    // A sparse, almost-printed page detail; no dark ridges above the paper.
    for(let row=0;row<5;row++)tube(Array.from({length:14},(_,i)=>{const u=.20+i*.045;return [side*u*1.25,pageY(u)+.003,-.35+row*.11];}),.0012,'pageEdge',book);
  }
  tube([[0,.85,-.42],[0,.85,.45],[.03,.82,.91],[.13,.71,1.02]],.015,'coral',fixed);
  const routes=[],nodes=[],leaves=[];
  const spots=[ [[-1.62,2.02,.05],[-1.98,2.94,.03],[-2.30,3.89,.02]], [[.22,2.55,-.06],[.48,3.54,-.08],[.05,4.52,-.06]], [[1.73,1.99,.04],[2.12,2.96,.03],[2.31,3.98,.01]] ];
  function leaf(x,y,z,angle,scale=1,parent=fixed){
    const g=group(x,y,z,parent);g.rotation.z=angle;g.rotation.y=.2;
    const o=ball(.13,0,.17,0,'leaf',g);o.scale.set(.85,1.9,.30);tube([[0,0,.015],[0,.17,.035],[0,.38,.01]],.007,'gold',g);
    for(let k=1;k<5;k++)for(const side of [-1,1])tube([[0,k*.065,.03],[side*.067,k*.065+.06,.025]],.0018,'bark',g);
    g.scale.setScalar(scale);batch(g);return g;
  }
  // Multiple tapering strands make the trunk and branches read as one sculpture.
  spots.forEach((path,index)=>{
    const branch=group(0,0,0,fixed);
    const direction=index===0?-1:index===2?1:.12;
    const points=[[direction*.07,.95,-.28],[direction*.12,1.35,-.28],[direction*.5,1.75,-.18],...path.map(([x,y,z])=>[x+direction*.35,y+.08,z-.2]),[path[2][0]+direction*.36,path[2][1]+.5,-.19]];
    const curve=branchTube(points,.105);
    const tip=points.at(-1);for(const [dx,angle] of [[-.15,.65],[0,-.1],[.15,-.65]])leaf(tip[0]+dx,tip[1]-.06,tip[2],angle,.8,branch);
    for(const shift of [-.065,.065])tube(points.map(([x,y,z],i)=>[x+shift*(1-i*.11),y,z-.07]),.012,'bark',branch);
    const bead=ball(.066,0,0,0,'glow',dynamic);routes.push({curve,bead});
    path.forEach(([x,y,z],level)=>{
      const g=group(x,y,z,root);
      const profile=[[0,-.065],[.37,-.065],[.405,-.035],[.416,0],[.409,.055],[.385,.083],[.37,.083],[.37,.048],[0,.048]].map(p=>new T.Vector2(...p));
      const disc=mesh(new T.LatheGeometry(profile,80),'gold',g);disc.rotation.x=Math.PI/2;
      ring(.397,.014,0,0,.055,'gold',g);
      const face=disk(.369,.040,0,0,.050,['coral','amber','teal'][index],g);face.rotation.x=Math.PI/2;face.material=face.material.clone();
      ring(.369,.008,0,0,.080,'gold',g);
      const halo=ring(.432,.011,0,0,0,'glow',g);halo.visible=false;
      if(index===0&&level===2)label('JS',.34,.26,0,.07,.105,g,'#fff0d2',true);
      else batch(skillRelief(T,{mesh,box,disk,ring,tube,ball},g,index,level));
      label(LEARNING_PATHS[index].skills[level],.58,.135,0,-.24,.108,g,'#fff0d2');
      nodes.push({index,level,face,halo});
      tube([[x+direction*.3,y+.06,z-.17],[x+direction*.11,y-.2,z-.08],[x,y-.32,z]],.025,'gold',branch);
      const l=leaf(x+direction*.43,y+.42,-.1,direction*-.65,.85,dynamic);leaves.push({g:l,angle:l.rotation.z,index});
      ball(.055,x+direction*.37,y+.13,-.1,'glow',branch);
    });
  });
  // Source-aligned labels on three gently splayed enamel plaques.
  LEARNING_PATHS.forEach((p,i)=>{const x=(i-1)*1.02;const g=group(x,.46,Math.sqrt(1.76**2-x*x)+.025,letters);g.rotation.y=(i-1)*.2;box(.93,.26,.035,0,0,0,'gold',g);box(.87,.21,.018,0,0,.026,['coral','amber','teal'][i],g);label(p.title.toUpperCase(),.79,.12,0,0,.062,g,'#fff0d2');});
  // Walnut desk, turned legs, drawers, laptop, warm articulated task lamp.
  const rug=disk(.92,.012,-2.64,.332,1.30,'leather',fixed);rug.scale.set(1,1,.84);
  const rugEdge=ring(.88,.007,-2.64,.342,1.30,'gold',fixed);rugEdge.rotation.x=-Math.PI/2;rugEdge.scale.y=.84;
  const desk=group(-2.65,.35,.91,fixed);desk.rotation.y=.1;
  box(1.68,.11,.86,0,.96,0,'wood',desk);
  for(const x of [-.7,.7])for(const z of [-.3,.3])box(.075,.9,.075,x,.45,z,'wood',desk);
  for(const x of [-.55,.55]){box(.39,.28,.73,x,.77,0,'wood',desk);box(.34,.2,.02,x,.78,.38,'bark',desk);ball(.025,x,.78,.41,'gold',desk);}
  const laptop=group(0,1.03,.08,desk);box(.73,.035,.46,0,0,0,'gold',laptop);
  for(let row=0;row<4;row++)for(let col=0;col<10;col++)box(.043,.007,.035,-.27+col*.059,.023,-.10+row*.05,'jade',laptop,.003);
  const screen=group(0,.27,-.19,laptop);screen.rotation.x=-.15;box(.75,.5,.035,0,0,0,'gold',screen);box(.69,.43,.012,0,0,.027,'jade',screen);
  for(let j=0;j<10;j++)for(let k=0;k<3;k++)box(.04+((j*7+k)%4)*.027,.009,.004,-.27+k*.16+(j%3)*.02,.15-j*.031,.037,k===0?'amber':'teal',screen,.002);
  tube([[-.62,1.02,-.22],[-.62,1.59,-.22],[-.25,1.81,-.22]],.014,'gold',desk);disk(.12,.035,-.62,1.03,-.22,'gold',desk);
  const shade=mesh(new T.ConeGeometry(.13,.17,40,1,true),'gold',desk);shade.position.set(-.25,1.76,-.22);shade.rotation.z=.5;ball(.063,-.22,1.69,-.22,'glow',desk);
  for(let i=0;i<3;i++){box(.35,.062,.26,.55,1.04+i*.068,.10,i===1?'jade':'cream',desk);box(.35,.008,.28,.55,1.079+i*.068,.10,'gold',desk);}
  const chair=group(-2.65,.33,1.88,fixed);disk(.32,.08,0,.53,0,'wood',chair);
  for(const x of [-.2,.2])for(const z of [-.2,.2])tube([[x,.5,z],[x*1.2,0,z*1.2]],.022,'wood',chair);
  box(.64,.51,.055,0,.91,.22,'wood',chair,.15);tube([[-.24,.55,.2],[-.24,.95,.22]],.022,'gold',chair);tube([[.24,.55,.2],[.24,.95,.22]],.022,'gold',chair);
  // Porcelain cup, small writing pad and turned chair cushion.
  const cup=mesh(new T.LatheGeometry([[0,0],[.055,0],[.068,.018],[.07,.11],[.057,.11],[.053,.025],[0,.025]].map(p=>new T.Vector2(...p)),32),'cream',desk);cup.position.set(.36,1.03,-.22);
  const handle=ring(.034,.009,.428,1.092,-.22,'gold',desk);handle.rotation.y=Math.PI/2;
  disk(.052,.004,.36,1.12,-.22,'wood',desk);
  disk(.29,.04,0,.58,0,'leather',chair);
  // Recessed reflection pool and animated fine ripples.
  const pool=group(2.7,.34,.87,fixed);disk(.98,.035,0,0,0,'gold',pool).scale.z=.85;disk(.93,.025,0,.018,0,'water',pool).scale.z=.85;
  const ripples=[];for(let i=0;i<3;i++){const r=ring(.6,.006,2.7,.377,.87,'gold',dynamic);r.rotation.x=-Math.PI/2;r.material=r.material.clone();r.material.transparent=true;r.material.depthWrite=false;r.userData.noShadow=true;ripples.push(r);}
  for(let i=0;i<3;i++){const b=ball(.16,2.9+i*.19,.44,1.30-i*.30,'cream',fixed);b.scale.set(1.3,.55,.9);}
  // Restrained botanical edges with shaped leaves, not particle noise.
  for(const side of [-1,1]){
    const plant=group(side*3.1,.32,-.95,fixed);
    disk(.34,.25,0,.13,0,'stone',plant);
    for(let j=0;j<5;j++){
      const x=(j-2)*.09,h=.65+(j%3)*.18; tube([[0,.2,0],[x,.4,0],[x*1.7,h,0]],.012,'bark',plant);
      for(let k=0;k<4;k++)leaf(x*(.5+k*.2),.35+k*.13,(j%2)*.1,(k%2?1:-1)*.8,.48,plant);
    }
  }
  function label(text,w,h,x,y,z,parent,color='#f6e8ce',bold=false){
    if(typeof document==='undefined')return;
    const c=document.createElement('canvas');c.height=256;let ctx=c.getContext('2d');const font=`${bold?'600':'500'} 180px ${bold?'monospace':'sans-serif'}`;ctx.font=font;c.width=Math.ceil(ctx.measureText(text).width+32);ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,c.width/2,137);
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
    const o=new T.Mesh(new T.PlaneGeometry(Math.min(w,h*c.width/c.height),Math.min(h,w*c.height/c.width)),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);o.userData.noShadow=true;parent.add(o);
  }
  fixed.updateMatrixWorld(true);
  const rigid=[];
  fixed.traverse(o=>{if(o.isMesh){const geometry=o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);const copy=new T.Mesh(geometry,o.material);rigid.push(copy);o.geometry.dispose();}});
  fixed.clear();rigid.forEach(o=>fixed.add(o));
  batch(fixed);
  fixed.traverse(o=>{if(o.isMesh)o.userData.observatoryAO=true;});
  let selected=0,epoch=0,start=0;
  function animate(t){
    // Reset view resets the scene clock. Restart the tour without a frozen interval.
    const state=pathState(t,selected,t<epoch?0:epoch,start),p=LEARNING_PATHS[state.index];
    nodes.forEach(n=>{const lit=n.index===state.index&&n.level<=state.milestone;n.face.material.emissive.setHex(lit?LEARNING_PATHS[n.index].color:0);n.face.material.emissiveIntensity=lit?.12:0;n.halo.visible=lit;});
    routes.forEach(({curve,bead},i)=>{bead.visible=i===state.index;bead.position.copy(curve.getPointAt(state.progress));});
    leaves.forEach(({g,angle,index},i)=>g.rotation.z=angle+Math.sin(t*.8+i)*.025*(index===state.index?1:.4));
    ripples.forEach((r,i)=>{const phase=(t*.16+i/3)%1;r.scale.set(.25+phase, (.25+phase)*.85,1);r.material.opacity=(1-phase)*.65;});
    root.userData.story={index:state.index,step:`0${state.index+1} / 03`,title:`${p.title} · ${p.skills.join(' → ')}`,detail:p.detail,tone:'complete'};
    root.userData.currentPath=state.index;
  }
  root.userData={conceptual:true,artifactId:31,displayBase:false,studioProfile:'growthguru',groundLevel:0,initialYaw:-.24,initialElevation:.31,autoOrbit:false,realTimeAnimation:true,setStep(index,t=0){if(index!==null&&(!Number.isInteger(index)||index<0||index>=3))return;start=root.userData.currentPath??0;selected=index;epoch=t;animate(t);},animate};
  root.userData.framingPoints=[...Array.from({length:48},(_,i)=>{const a=i*Math.PI/24;return new T.Vector3(Math.cos(a)*4.45,.16,Math.sin(a)*2.9);}),...Array.from({length:25},(_,i)=>{const a=i*Math.PI/24;return new T.Vector3(Math.cos(a)*2.5,3.1+Math.sin(a)*2.5,-1.2);}),new T.Vector3(-3.5,2.1,1.5),new T.Vector3(2.8,4.6,0)];
  animate(0);
  if(typeof window!=='undefined'&&!options.bake)applyObservatoryAO(T,root,{url:new URL('../assets/growthguru-ao-v1.bin',import.meta.url)});
  return root;
}
