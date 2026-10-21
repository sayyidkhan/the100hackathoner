import { medivoiceStudio } from './medivoice-studio.js';
import { buildCarePeople } from './medivoice-people.js';
import { animateCare } from './medivoice-motion.js';
import { applyMediVoiceAO } from './medivoice-surface.js';

// The Listening Room: phone → case summary → clinician review → digital MC.
// Sources: agora-medihealth/backend/main.py and the two linked Instagram posts.
// An architectural interpretation of the demo, not a clinical application.
export function createArtifact(T, options = {}) {
  const kit = medivoiceStudio(T);
  const { root, materials: m, mesh, box, disk, ball, line, finish, texture } = kit;
  const mat = (color, roughness = .65, metalness = 0) => new T.MeshStandardMaterial({ color, roughness, metalness });
  Object.assign(m, {
    floorStone: mat(0xe4dac7, .86), stone: mat(0xd8c4a1), cream: mat(0xeadeca), sand: mat(0xb49b70),
    brass: mat(0xb58d50, .32, .65), petrol: mat(0x123f41, .38),
    jade: mat(0x377f76, .35, .18), sage: mat(0x82998b), walnut: mat(0x745039),
    hair: mat(0x30231e, .48), blouse: mat(0x4f8178), paper: mat(0xf5f0e4, .82), skin: mat(0xdec5a2), skinShade: mat(0x967a60), coat: mat(0xe9e1cf), linen: mat(0xd5c4a5), sageDark: mat(0x607a68), coral: mat(0xc96c51), leaf: mat(0x64724a),
    light: new T.MeshStandardMaterial({ color: 0x85ddbd, emissive: 0x4bc6a0, emissiveIntensity: .55, roughness: .35 }),
    glass: new T.MeshPhysicalMaterial({ color: 0x65b4a5, metalness: .25, roughness: .19, transparent: true, opacity: .72, side: T.DoubleSide, depthWrite: false, clearcoat: 1 }),
  });
  const stoneTexture=texture('stone'),woodTexture=texture('wood'),clothTexture=texture('cloth');
  for(const name of ['stone','cream']){m[name].map=stoneTexture;m[name].bumpMap=stoneTexture;m[name].bumpScale=.014;m[name].roughness=.62;}
  m.floorStone.bumpMap=stoneTexture;m.floorStone.bumpScale=.002;
  m.walnut.map=woodTexture;m.walnut.bumpMap=woodTexture;m.walnut.bumpScale=.012;m.walnut.roughness=.48;
  for(const name of ['coat','linen','sage','blouse']){m[name].bumpMap=clothTexture;m[name].bumpScale=.003;m[name].roughness=.92;}
  m.brass.roughness=.27;m.brass.metalness=.78;
  m.monitor=new T.MeshStandardMaterial({color:0x173f3d,emissive:0x165b50,emissiveIntensity:.15,roughness:.3});
  const preserved = [];
  function group(x = 0, y = 0, z = 0, parent = root) {
    const g = new T.Group(); g.position.set(x, y, z); parent.add(g); return g;
  }
  function rounded(w,h,d,x,y,z,color,parent=root,r=.07) {
    r=Math.min(r,w/2,h/2);
    const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);
    s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
    s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:Math.min(w,h,d)*.16,bevelThickness:Math.min(w,h,d)*.16,bevelSegments:3,curveSegments:12}),color,parent);
    o.position.set(x,y,z);return o;
  }
  function rod(a,b,r,color,parent=root) {
    const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start);
    const o=mesh(new T.CylinderGeometry(r,r,v.length(),10),color,parent);
    o.position.copy(start.add(end).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;
  }
  function ellipsoid(r,x,y,z,sx,sy,sz,color,parent=root) {
    const o=ball(r,x,y,z,color,parent);o.scale.set(sx,sy,sz);return o;
  }
  function ring(r,t,x,y,z,color,parent=root,arc=Math.PI*2) {
    const o=mesh(new T.TorusGeometry(r,t,10,64,arc),color,parent);o.position.set(x,y,z);return o;
  }
  function text(value,w,x,y,z,color,parent=root,height=w/6) {
    const g=group(x,y,z,parent);g.userData.noAO=true;
    let map=null;
    if(typeof document!=='undefined'){
      const c=document.createElement('canvas');c.width=1024;c.height=192;
      const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='700 120px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,512,100,980);
      map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
    }
    const o=new T.Mesh(new T.PlaneGeometry(w,height),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));
    o.userData.noShadow=true;g.add(o);return g;
  }
  // One architectural floor, with a quiet matte surface and a softened edge.
  // The finished top stays at y=.24 so all furniture retains its contact height.
  const floorShape=new T.Shape(),fw=3.62,fd=1.72,fr=.36;
  floorShape.moveTo(-fw+fr,-fd);floorShape.lineTo(fw-fr,-fd);
  floorShape.quadraticCurveTo(fw,-fd,fw,-fd+fr);floorShape.lineTo(fw,fd-fr);
  floorShape.quadraticCurveTo(fw,fd,fw-fr,fd);floorShape.lineTo(-fw+fr,fd);
  floorShape.quadraticCurveTo(-fw,fd,-fw,fd-fr);floorShape.lineTo(-fw,-fd+fr);
  floorShape.quadraticCurveTo(-fw,-fd,-fw+fr,-fd);floorShape.closePath();
  const platform=mesh(new T.ExtrudeGeometry(floorShape,{depth:.18,steps:1,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:5,curveSegments:24}),'floorStone');
  platform.rotation.x=-Math.PI/2;platform.position.y=.035;
  // Open architectural portal, with separate brass lining and fluted face.
  const arch=group(.15,.25,-.81), ay=2.22;
  const s=new T.Shape();s.moveTo(-1.18,0);s.lineTo(-1.18,ay);s.absarc(0,ay,1.18,Math.PI,0,true);s.lineTo(1.18,0);s.lineTo(.90,0);s.lineTo(.90,ay);s.absarc(0,ay,.90,0,Math.PI,false);s.lineTo(-.90,0);s.closePath();
  mesh(new T.ExtrudeGeometry(s,{depth:.25,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:3,curveSegments:48}),'stone',arch);
  for(let j=0;j<7;j++) {
    const r=.925+j*.036,pts=[[-r,0,.275],[-r,ay,.275]];
    for(let i=0;i<=48;i++){const a=Math.PI-i/48*Math.PI;pts.push([Math.cos(a)*r,ay+Math.sin(a)*r,.275]);}
    pts.push([r,0,.275]);line(pts,.008,j===0?'brass':'cream',arch);
  }
  // Giant phone: real bevels, inset display, earpiece and engraved waveform.
  const phone=group(-2.48,.26,-.28);phone.rotation.y=.10;
  rounded(1.13,2.60,.12,0,1.34,0,'brass',phone,.17);
  rounded(1.07,2.54,.08,0,1.34,.10,'cream',phone,.15);
  rounded(.96,2.39,.025,0,1.34,.19,'petrol',phone,.12);
  rounded(.36,.075,.018,0,2.47,.225,'hair',phone,.035);
  box(.022,.24,.045,-.58,1.83,.06,'brass',phone);box(.022,.14,.045,-.58,1.50,.06,'brass',phone);
  const screenDetails=group(0,0,0,phone);
  text('MediVoice',.74,0,2.13,.235,'#e9eee0',screenDetails);
  text('LISTENING',.55,0,.73,.235,'#97cdbd',screenDetails);
  const voice=group(0,1.47,.244,phone);voice.userData.noAO=true;
  const voiceBars=[];
  for(let i=0;i<35;i++)voiceBars.push(rounded(.012,.42,.008,-.38+i*.0224,0,0,'light',voice,.006));
  const listening=ring(.19,.006,0,.43,.24,'light',phone);
  rounded(.06,.14,.01,0,.43,.24,'light',phone,.029);
  line([[-.06,.46,.25],[-.055,.36,.25],[0,.34,.25],[.055,.36,.25],[.06,.46,.25]],.009,'light',phone);
  box(.014,.065,.01,0,.31,.25,'light',phone);box(.07,.012,.01,0,.277,.25,'light',phone);
  disk(.45,.055,-2.48,.28,-.21,'brass');

  const people=buildCarePeople(T,{...kit,rounded,rod,ellipsoid,group});
  kit.batch(people.patient.root);kit.batch(people.doctor.root);
  preserved.push(people.patient.root,people.doctor.root);
  // Small fluted side table.
  disk(.21,.045,-1.35,.88,1.01,'cream');disk(.13,.035,-1.35,.29,1.01,'brass');
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;rod([-1.35+Math.cos(a)*.065,.31,1.01+Math.sin(a)*.065],[-1.35+Math.cos(a)*.065,.85,1.01+Math.sin(a)*.065],.012,'brass');}

  // Clinical summary is the central hero, framed in satin brass.
  const chart=group(.10,.26,.05);chart.rotation.y=-.03;
  rounded(1.16,2.16,.10,0,1.14,0,'brass',chart,.12);
  rounded(1.10,2.10,.045,0,1.14,.10,'paper',chart,.10);
  const chartLabels=group(0,0,0,chart);text('CASE SUMMARY',.98,0,2.01,.16,'#183d37',chartLabels,.23);
  const summaryRows=[];
  for(let i=0;i<3;i++) {
    const row=group(0,1.66-i*.46,.154,chart);summaryRows.push(row);row.userData.noAO=true;
    rounded(.30,.32,.015,-.31,0,0,'sage',row,.04);
    if(i===0){ball(.045,-.31,.045,.035,'jade',row);ellipsoid(.06,-.31,-.055,.03,1,.7,.4,'jade',row);}
    if(i===1){line([[-.39,.02,.04],[-.35,.08,.04],[-.31,.04,.04],[-.27,.08,.04],[-.23,.02,.04],[-.31,-.08,.04],[-.39,.02,.04]],.018,'jade',row);}
    if(i===2){for(const dx of [-.05,.05])ellipsoid(.063,-.31+dx,0,.035,.7,1.3,.45,'jade',row);box(.012,.17,.02,-.31,.04,.035,'jade',row);}
    text(['PROFILE','SYMPTOMS','HISTORY'][i],.57,.13,.065,.033,'#183d37',row,.16);
    for(let j=0;j<2;j++)box(.47-j*.12,.023,.008,.13-j*.06,-.035-j*.065,.02,'sageDark',row);
  }
  box(.26,.075,.035,0,.29,.17,'sage',chart);box(.075,.26,.035,0,.29,.17,'sage',chart);
  const chartFoot=disk(.70,.045,.10,.285,.10,'brass');chartFoot.scale.z=.38;

  // Three translucent, sculpted ribbons: not straight wires.
  const ribbons=group();ribbons.userData.noAO=true;
  const ribbonCurves=[],ribbonMeshes=[];
  for(let j=0;j<3;j++) {
    const curve=new T.CatmullRomCurve3([new T.Vector3(-2.0,1.72,-.02),new T.Vector3(-1.55,1.77+j*.17,-.03),new T.Vector3(-.97,1.65+j*.29,.03),new T.Vector3(-.49,1.1+j*.43,.20)]);
    ribbonCurves.push(curve);
    const vertices=[],indices=[];
    for(let i=0;i<=64;i++) {
      const p=curve.getPoint(i/64),width=.015+Math.sin(i/64*Math.PI)*.07;
      vertices.push(p.x,p.y-width,p.z,p.x,p.y+width,p.z);
      if(i<64){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const ribbon=mesh(geo,'glass',ribbons);ribbon.userData.basePositions=Float32Array.from(vertices);ribbonMeshes.push(ribbon);
    const edgePts=Array.from({length:40},(_,i)=>{const p=curve.getPoint(i/39);return[p.x,p.y+.015+Math.sin(i/39*Math.PI)*.07,p.z];});line(edgePts,.006,'light',ribbons);
  }
  ribbons.traverse(o=>{if(o.isMesh)o.userData.noShadow=true;});
  preserved.push(ribbons);

  // Clinician workspace: curved wood tambour desk, monitor, lamp and paper.
  const desk=group(2.03,.26,-.05);
  const body=disk(.61,.62,0,.36,0,'walnut',desk);body.scale.set(1.18,1,.61);
  for(let i=0;i<40;i++){const a=i/40*Math.PI*2;rod([Math.cos(a)*.72,.06,Math.sin(a)*.375],[Math.cos(a)*.72,.67,Math.sin(a)*.375],.012,'sand',desk);}
  const trim=disk(.63,.045,0,.08,0,'brass',desk);trim.scale.set(1.18,1,.61);
  const table=disk(.68,.075,0,.72,0,'cream',desk);table.scale.set(1.20,1,.70);
  rounded(.53,.35,.035,-.23,1.0,-.05,'brass',desk,.025);rounded(.48,.30,.012,-.23,1.0,-.015,'monitor',desk,.02);
  rod([-.23,.76,0],[-.23,.87,0],.025,'brass',desk);box(.25,.018,.16,-.23,.77,.01,'brass',desk);
  for(let i=0;i<3;i++)box(.33,.008,.24,.30,.77+i*.012,.12,'cream',desk);
  line([[.19,.81,.13],[.25,.81,.1],[.28,.81,.17],[.36,.81,.09]],.005,'jade',desk);
  disk(.09,.025,-.57,.78,-.10,'brass',desk);rod([-.57,.79,-.10],[-.57,1.25,-.10],.014,'brass',desk);rod([-.57,1.25,-.10],[-.33,1.35,.02],.014,'brass',desk);
  const shade=mesh(new T.ConeGeometry(.11,.09,24,1,true),'brass',desk);shade.position.set(-.33,1.31,.02);
  disk(.09,.012,-.33,1.27,.02,'light',desk);
  for(let i=0;i<3;i++)box(.28-i*.045,.009,.008,-.26,1.07-i*.055,.005,'sage',desk);

  // Certificate deliberately sits after the clinician along the green route.
  const cert=group(2.82,.29,1.04);cert.rotation.x=-.13;cert.rotation.y=-.13;
  rounded(.69,.84,.05,0,.44,0,'brass',cert,.04);rounded(.64,.79,.02,0,.44,.05,'cream',cert,.03);
  const sealGroup=group(0,.57,.09,cert);
  const seal=disk(.12,.024,0,0,0,'jade',sealGroup);seal.rotation.x=Math.PI/2;
  const check=line([[-.06,0,.02],[-.015,-.04,.02],[.065,.05,.02]],.016,'cream',sealGroup);
  text('REVIEWED',.45,0,.75,.08,'#326b56',cert);
  for(let i=0;i<3;i++)box(.35-i*.04,.012,.008,-i*.02,.36-i*.055,.077,'sand',cert);
  const signature=line([[-.15,.16,.09],[-.03,.22,.09],[-.06,.14,.09],[.06,.18,.09],[.15,.16,.09]],.008,'jade',cert);
  cert.userData.noAO=true;preserved.push(cert);
  const certFoot=disk(.40,.04,2.82,.28,1.10,'brass');certFoot.scale.z=.44;
  function plant(x,z,height) {
    const p=group(x,.25,z);const pot=mesh(new T.CylinderGeometry(.13,.10,.22,24),'stone',p);pot.position.y=.11;
    disk(.115,.01,0,.225,0,'walnut',p);rod([0,.20,0],[0,height,0],.013,'walnut',p);
    for(let i=0;i<24;i++){
      const a=i*2.4,y=.32+i/25*(height-.32),r=.17*(1-i/24),xx=Math.cos(a)*r,zz=Math.sin(a)*r;
      rod([0,y-.10,0],[xx,y,zz],.006,'walnut',p);const l=ellipsoid(.07,xx,y,zz,.55,1.6,.24,'leaf',p);l.rotation.z=-Math.cos(a)*.55;l.rotation.y=-a;
    }
  }
  plant(-3.12,.25,1.1);plant(3.04,-.43,1.55);

  // Preserve UV-bearing typography independently from static geometry batching.
  // Reparent labels to root while retaining their composed transforms.
  root.updateMatrixWorld(true);
  for(const g of [screenDetails,chartLabels,voice,listening,...summaryRows]){root.attach(g);preserved.push(g);}
  const signals=group();signals.userData.noAO=true;
  const particles=new T.InstancedMesh(new T.SphereGeometry(.023,10,6),m.light,24);particles.userData.noShadow=true;signals.add(particles);preserved.push(signals);
  // Low, soft contact footprint grounds the miniature without a second plinth.
  const n=192,pixels=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const dx=Math.abs((x/(n-1)-.5)*8.9)-3.26,dz=Math.abs((y/(n-1)-.5)*4.9)-1.36;
    const edgeDistance=Math.hypot(Math.max(dx,0),Math.max(dz,0))+Math.min(Math.max(dx,dz),0)-.36;
    pixels[(y*n+x)*4+3]=Math.round(62*Math.exp(-Math.pow(Math.max(0,edgeDistance)/.22,2)));
  }
  const shadowMap=new T.DataTexture(pixels,n,n);shadowMap.minFilter=shadowMap.magFilter=T.LinearFilter;shadowMap.needsUpdate=true;
  const footprint=new T.Mesh(new T.PlaneGeometry(8.9,4.9),new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,toneMapped:false}));
  footprint.rotation.x=-Math.PI/2;footprint.position.y=.003;footprint.userData.noShadow=true;footprint.userData.noAO=true;footprint.userData.noFrame=true;root.add(footprint);preserved.push(footprint);
  // Fit component silhouettes instead of the empty corners above the platform.
  root.updateMatrixWorld(true);
  const totalBounds = new T.Box3().setFromObject(root);
  const center = totalBounds.getCenter(new T.Vector3());
  const offset = new T.Vector3(-center.x, -totalBounds.min.y, -center.z);
  const framingPoints = [];
  for (const child of root.children) {
    if(child.userData.noFrame)continue;
    const bounds = new T.Box3().setFromObject(child);
    if (bounds.isEmpty()) continue;
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) framingPoints.push(new T.Vector3(x,y,z).add(offset));
  }
  const model=finish(57,preserved);
  model.userData.framingPoints = framingPoints;
  Object.assign(model.userData,{displayBase:false,groundLevel:0,studioProfile:'medivoice',initialYaw:-.14,initialElevation:.31,autoOrbit:false});
  animateCare(T,model,{people,voice,voiceBars,listening,summaryRows,ribbonCurves,ribbonMeshes,particles,cert,sealGroup,check,signature,monitor:m.monitor,glass:m.glass});
  if(!options.bake)applyMediVoiceAO(T,model);
  return model;
}
