import { memoryAtelier } from './memory-atelier.js';

// Inspired by gpt6-nano/src/storage.ts and responder.ts, and the Aug 10 Instagram demo.
// Three seeded topics become one new conversation. This is an exhibit, not a live model.
export function createArtifact(T) {
  const {root,m,group,mesh,plate,slab,disk,ball,line,ring,lettering,icon,batch}=memoryAtelier(T);
  const fixed=group(), moving=group();
  // Inlaid ink-blue stage, with a floating ivory instrument deck.
  slab(5.75,.20,3.65,0,.10,0,'stone',fixed,.40);
  slab(5.69,.025,3.59,0,.212,0,'gold',fixed,.21);
  slab(5.64,.055,3.54,0,.25,0,'ink',fixed,.20);
  slab(5.57,.07,3.47,0,.313,0,'stone',fixed,.35);
  for(const x of [-2.49,2.49])for(const z of [-1.43,1.43])disk(.031,.009,x,.354,z,'gold',fixed);
  lettering('MULTI-DIMENSIONAL MEMORY',0,.11,1.835,2.5,'#c7ab7d',fixed,38);
  // Central recall instrument: grooved ceramic and brass concentric rings.
  disk(.81,.12,0,.41,.16,'ink',fixed);
  disk(.79,.025,0,.482,.16,'gold',fixed);
  disk(.74,.14,0,.565,.16,'ivory',fixed);
  for(const r of [.57,.64,.71]){const o=ring(r,.009,0,.64,.16,'gold',fixed);o.rotation.x=-Math.PI/2;}
  for(let i=0;i<48;i++){const a=i*Math.PI/24;const mark=slab(.012,.009,i%4===0?.075:.035,Math.sin(a)*.68,.65,.16+Math.cos(a)*.68,'shadow',fixed,.002);mark.rotation.y=a;}
  // Two inclined brass orbits give the archive a recognisable, sculptural silhouette.
  const orbital=group(0,1.84,-.47,.14,fixed);
  const ringA=ring(1.65,.035,0,0,0,'gold',orbital);ringA.rotation.y=.25;ringA.scale.set(1.12,1,.42);
  const ringB=ring(1.54,.027,0,0,0,'gold',orbital);ringB.rotation.set(.2,.45,-.48);ringB.scale.set(1.4,.63,.45);
  for(let i=0;i<8;i++){const a=(i+.35)*Math.PI*2/8;const dot=ball(i%3===0?.13:.10,Math.sin(a)*1.65*1.12,Math.cos(a)*1.65,0,i%3===0?'ivory':'lapis',orbital);dot.position.applyAxisAngle(new T.Vector3(0,1,0),.25);}
  // Source archives drawn from the prototype's seeded conversations.
  const sources=[{x:-1.88,z:-.29,y:.35,yaw:.20,kind:'solar',label:'SOLAR / AI',date:'14 MAR 2024'},
    {x:-.05,z:-1.13,y:1.02,yaw:0,kind:'wind',label:'URBAN WIND',date:'02 OCT 2024'},
    {x:1.88,z:-.38,y:.35,yaw:-.22,kind:'robot',label:'EDGE ROBOTICS',date:'05 JAN 2025'}];
  const lifts=[];
  for(let index=0;index<sources.length;index++){
    const s=sources[index], g=group(s.x,s.y,s.z,s.yaw,fixed);
    if(index===1){slab(1.11,.67,.80,0,-.335,0,'ivory',g);slab(1.12,.025,.81,0,.009,0,'gold',g);for(const x of [-.44,.44])slab(.027,.62,.025,x,-.33,.414,'gold',g);}
    slab(1.02,.075,.77,0,.035,0,'blue',g);
    slab(1.04,.31,.055,0,.18,.36,'ivory',g);
    for(const x of [-.49,.49]){slab(.065,.90,.71,x,.46,0,'ivory',g);slab(.023,.75,.54,x+Math.sign(x)*.04,.44,0,'blue',g);slab(.025,.68,.025,x,.40,.37,'gold',g);}
    plate(.45,.075,.014,0,.19,.395,'gold',g,.012);
    lettering(s.label,0,.193,.406,.43,'#162b45',g,34);
    for(let i=0;i<7;i++){
      const card=group(0,.62+i*.018,-.26+i*.075,0,g);card.rotation.x=-.11;
      plate(.85,.90,.038,0,0,0,i%3===0?'paper':'edge',card,.065,.008);
      plate(.18,.075,.027,-.27+(i%3)*.24,.475,0,i%3===0?'gold':'blue',card,.012,.005);
      for(let j=0;j<3;j++)plate(.49-j*.05,.009,.007,0,-.05-j*.065,.018,'ivory',card,.003,.002);
    }
    // Front memory card can rise out of its archive when recalled.
    const selected=group(s.x,s.y+.70,s.z+.29,s.yaw,moving);selected.rotation.x=-.08;
    plate(.86,.96,.065,0,0,0,'paper',selected,.08);
    plate(.82,.92,.009,0,0,.039,'paper',selected,.07,.002);
    icon(s.kind,selected,1.10,0,.10,.056);
    lettering(s.date,0,-.32,.055,.69,'#7f725d',selected,37);
    plate(.16,.075,.024,.25,.51,0,'gold',selected,.012);
    lifts.push({g:selected,y:selected.position.y,index});
  }
  // Distinct pathways converge on the question; extra branches stay deliberately sparse.
  const paths=[
    [[-1.88,1.02,-.05],[-1.45,1.95,.08],[-.89,2.18,.19],[-.36,1.69,.37]],
    [[-.05,1.35,-.98],[.42,2.42,-.83],[.71,2.55,-.22],[.32,1.8,.36]],
    [[1.88,1.02,-.16],[1.56,1.85,.02],[1.08,2.04,.28],[.53,1.51,.41]],
  ];
  const routeMaterials=[],curves=[],signals=[];
  paths.forEach((points,i)=>{
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));curves.push(curve);
    const material=m.route.clone();routeMaterials.push(material);line(curve,.018,material,fixed);
    for(const t of [.15,.58]){const p=curve.getPoint(t);ball(.065,p.x,p.y,p.z,'blue',fixed);const bead=ring(.082,.008,p.x,p.y,p.z,'gold',fixed);bead.rotation.y=.2;}
    for(let j=0;j<2;j++){const dot=ball(.034,0,0,0,'spark',moving);dot.userData.noShadow=true;signals.push({dot,curve,index:i,offset:j*.5});}
  });
  const bridge=new T.CatmullRomCurve3([[-1.85,1.08,-.05],[-1.22,2.75,-.58],[.85,2.85,-.67],[1.85,1.1,-.13]].map(p=>new T.Vector3(...p)));
  line(bridge,.014,'coral',fixed);
  const bridgeDot=ball(.044,0,0,0,'ember',moving);bridgeDot.userData.noShadow=true;
  // Loose memory fragments sit in real depth, with embossed symbols and paper edges.
  for(const [x,y,z,kind,yaw] of [[-1.05,2.45,-.17,'solar',-.14],[1.06,2.48,-.45,'robot',.16],[.08,3.02,-.6,'wind',.08]]){
    const g=group(x,y,z,yaw,fixed);g.rotation.z=x>0?-.09:.08;
    for(let i=2;i>=0;i--)plate(.46,.49,.02,i*.018,-i*.017,-i*.026,i?'edge':'paper',g,.035,.005);
    icon(kind,g,.55,0,.025,.018);ball(.025,0,.29,0,'gold',g);
  }
  // The current conversation has more visual weight than the archive.
  const core=group(0,1.47,.48,-.03,moving);
  plate(1.22,1.45,.13,0,0,0,'gold',core,.15,.025);
  plate(1.17,1.40,.12,0,0,.038,'coral',core,.13,.025);
  plate(.77,.68,.055,0,.03,.121,'paper',core,.13,.015);
  const tail=new T.Shape();tail.moveTo(-.25,-.24);tail.lineTo(-.27,-.46);tail.quadraticCurveTo(-.26,-.49,-.21,-.45);tail.lineTo(.02,-.27);tail.closePath();
  const tailMesh=mesh(new T.ExtrudeGeometry(tail,{depth:.04,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:3}),'paper',core);tailMesh.position.z=.109;
  for(let i=0;i<3;i++)plate([.51,.43,.31][i],.052,.014,-i*.045,.20-i*.15,.155,'coral',core,.02,.003);
  lettering('NEW CONVERSATION',0,-.56,.112,.90,'#ffe8c6',core,48);
  for(const x of [-.52,.52])line([[x,.65,.34],[x,.90,.37],[x,1.05,.40]],.016,'gold',fixed);
  // A bound notebook with layered, curved paper signatures rather than two boxes.
  const book=group(-.45,.38,1.04,-.12,fixed);
  slab(1.47,.045,.80,0,0,0,'blue',book,.045);
  for(let layer=0;layer<9;layer++)for(const side of [-1,1]){
    const geo=new T.PlaneGeometry(.70,.73,24,3),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){
      const t=(p.getX(i)+.35)/.70,z=p.getY(i);
      p.setXYZ(i,side*(.015+t*.70),.04+layer*.007+.095*Math.sin(t*Math.PI*.85)+.045*(1-t),z);
    }
    geo.computeVertexNormals();const mat=layer===8?m.paper:m.edge;mat.side=T.DoubleSide;mesh(geo,mat,book);
  }
  for(const side of [-1,1])for(let j=0;j<7;j++){
    const p=[];for(let i=0;i<=14;i++){const t=.13+i/14*.73;p.push([side*(.015+t*.70),.103+.095*Math.sin(t*Math.PI*.85)+.045*(1-t),-.26+j*.079]);}line(p,.0025,'shadow',book);
  }
  line([[.015,.15,-.29],[.015,.16,.12],[-.01,.08,.45],[-.08,.03,.52]],.017,'coral',book);
  const lens=group(.79,.62,1.08,-.3,fixed);lens.rotation.x=-.46;lens.rotation.z=-.17;
  ring(.245,.035,0,0,0,'blue',lens);ring(.214,.008,0,0,.014,'gold',lens);
  const glass=ball(.21,0,0,0,'glass',lens);glass.scale.z=.10;glass.userData.noShadow=true;
  line([[.19,-.17,0],[.35,-.32,0],[.53,-.49,0]],.043,'blue',lens);
  line([[.22,-.20,0],[.27,-.245,0]],.048,'gold',lens);
  // Offset paper stack and brass stylus balance the instrument without clutter.
  const notes=group(-1.92,.39,1.13,.12,fixed);
  for(let i=0;i<8;i++)slab(.57,.018,.40,Math.sin(i)*.008,i*.021,0,i%2?'paper':'edge',notes,.025);
  const pen=group(1.85,.40,.95,-.36,fixed);
  line([[-.32,0,0],[.27,0,0]],.022,'gold',pen);line([[.27,0,0],[.39,0,0]],.014,'ink',pen);
  // Baking static meshes cuts the hundreds of paper details down to material batches.
  root.updateMatrixWorld(true);
  const framingPoints=[];
  root.traverse(o=>{if(!o.isMesh)return;
    if(o.geometry.type==='TorusGeometry'||o.geometry.type==='SphereGeometry'){
      const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=Math.max(1,Math.floor(p.count/96)))framingPoints.push(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));
    }else{o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z).applyMatrix4(o.matrixWorld));}
  });
  // Include the maximum animated lift in the fit, keeping mobile views unclipped.
  framingPoints.push(new T.Vector3(0,3.58,-.5));
  batch(fixed);lifts.forEach(({g})=>batch(g));batch(core);
  Object.assign(root.userData,{artifactId:39,conceptual:true,displayBase:false,studioProfile:'memory',groundLevel:0,initialYaw:.27,initialElevation:.36,framingPoints});
  const steps=[
    {title:'Recall the conversations',detail:'Solar, wind and robotics: bring useful past context back into view.',tone:'thinking'},
    {title:'Follow the connections',detail:'Shared concepts connect memories across different conversations.',tone:'flowing'},
    {title:'Start with more context',detail:'Bring the selected threads together in one new conversation.',tone:'complete'},
  ];
  let selected=null;
  root.userData.setStep=index=>{selected=Number.isInteger(index)?T.MathUtils.clamp(index,0,2):null;};
  root.userData.animate=time=>{
    const index=selected??Math.floor((time%24)/8);
    root.userData.story={...steps[index],index,step:`0${index+1} / 03`};
    lifts.forEach(({g,y,index:i})=>{g.position.y=y+(index===0?.07: .15)+Math.sin(time*.65+i)*.025;});
    core.position.y=1.47+(index===2?.13:0)+Math.sin(time*.55)*.018;
    routeMaterials.forEach(mat=>{mat.emissiveIntensity=index===0?.12:index===1?.55:.32;});
    signals.forEach(({dot,curve,index:i,offset})=>{const t=(time*.12+offset+i*.14)%1;dot.position.copy(curve.getPoint(t));dot.scale.setScalar(index===0?.5:1);});
    bridgeDot.position.copy(bridge.getPoint((time*.07+.25)%1));
    bridgeDot.visible=index!==0;
  };
  root.userData.animate(0);
  return root;
}
