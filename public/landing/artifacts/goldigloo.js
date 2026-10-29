import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {nestashLandscapes} from './nestash-landscapes.js';
import {applyObservatoryAO} from './astrodegen-occlusion.js';

// An interpretation of the 2018 prototype, not a live stock screener.
export const GOLDIGLOO_CYCLE=24;
export const GOLDIGLOO_STEPS=[
 ['Business activity','Review the company’s business','The prototype begins by screening business activities against its Shariah criteria.'],
 ['Financial screening','Look at the financial structure','The original research also examines company financial ratios.'],
 ['Purification','Review dividend purification','The third Shariah screening step in the original prototype.'],
 ['Sustainability','Connect the research to real-world impact','Clean energy, water resilience and sustainable cities illustrate the sustainability lens.'],
 ['Shortlist','Bring both research lenses together','Both research lenses feed a shortlist of illustrative themes for further investigation.'],
];
const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
export function goldiglooMoment(time){
 const t=((time%GOLDIGLOO_CYCLE)+GOLDIGLOO_CYCLE)%GOLDIGLOO_CYCLE;
 return {t,index:t<4?0:t<8?1:t<12?2:t<17?3:4,shariah:[0,4,8].map(start=>ease((t-start)/2)),impact:ease((t-12)/3),impactRows:[12,13.1,14.2].map(start=>ease((t-start)/1.2)),shortlist:ease((t-17)/3)};
}
export function createArtifact(T,options={}){
 const k=medivoiceStudio(T),{root,materials:m,mesh,box,disk,ball,line,finish,batch,texture}=k;
 const live=[],material=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 Object.assign(m,{stone:material(0xe5dbc8,.8),paper:material(0xeee5d5,.82),leather:material(0x12303b,.74),gold:material(0xc4a466,.30,.75),edge:material(0x97b6a4,.35,.45),jade:material(0x267568,.5),ink:material(0x173c3b,.42),dark:material(0x0a2029,.48),soil:material(0x737256,.95),bark:material(0x79704b,.9),leaf:material(0x657c4a,.8),leafLight:material(0x93a267,.8),solar:material(0x1c3a4f,.28,.3),white:material(0xf2eee2,.5),ice:material(0xcce8ea,.24,.03),seam:material(0xf3f5e9,.57),cheek:material(0xeab19a,.7),warm:new T.MeshStandardMaterial({color:0xffdf9b,emissive:0xffc36b,emissiveIntensity:.65,roughness:.6}),glass:new T.MeshPhysicalMaterial({color:0xa7cdc2,roughness:.13,metalness:.06,transparent:true,opacity:.19,depthWrite:false,side:T.DoubleSide})});
 const stone=planningExhibitSurfaces(T).stone;m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.008;
 const grain=texture('cloth');m.leather.bumpMap=grain;m.leather.bumpScale=.006;m.paper.bumpMap=grain;m.paper.bumpScale=.003;m.ice.bumpMap=texture('stone');m.ice.bumpScale=.002;m.seam.color.setHex(0x89b6bc);m.ice.roughness=.26;
 m.ice.metalness=.08;
 m.grid=material(0x95b9c5,.36,.45);m.water=material(0x398f99,.22,.25);
 m.leather.map=texture('stone');m.leather.map.colorSpace=T.SRGBColorSpace;m.leather.bumpScale=.009;
 const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
 function rounded(w,h,d,x,y,z,key,parent=root,r=.045){
  r=Math.min(r,w*.45,h*.45);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,curveSegments:8});geo.translate(0,0,-d/2);const o=mesh(geo,key,parent);o.position.set(x,y,z);return o;
 }
 function slab(w,d,h,x,y,z,key,parent=root,r=.06){const o=rounded(w,d,h,x,y,z,key,parent,r);o.rotation.x=-Math.PI/2;return o;}
 const ell=(x,y,z,sx,sy,sz,key,parent=root)=>{const o=ball(1,x,y,z,key,parent);o.scale.set(sx,sy,sz);return o;};
 function ring(r,t,x,y,z,key,parent=root){const o=mesh(new T.TorusGeometry(r,t,8,48),key,parent);o.position.set(x,y,z);return o;}
 function label(value,w,h,x,y,z,parent=root,color='#e9e3ce',size=66){
  if(typeof document==='undefined')return null;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font=`500 ${Math.min(size,c.height*.72)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,c.width/2,c.height/2,c.width*.94);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);parent.add(o);return o;
 }
 const check=(x,y,z,parent,key='gold',s=1)=>{line([[x-.037*s,y,z],[x-.010*s,y-.027*s,z],[x+.045*s,y+.034*s,z]],.008*s,key,parent);};
 function leafIcon(x,y,z,parent,s=.15,key='gold'){
  line([[x-s*.5,y-s*.55,z],[x-s*.35,y+s*.15,z],[x+s*.50,y+s*.65,z],[x+s*.38,y-s*.05,z],[x-s*.5,y-s*.55,z]],.009,key,parent);
  line([[x-s*.48,y-s*.58,z],[x+s*.48,y+s*.63,z]],.006,key,parent);
 }
 // A shallow desktop slice rather than a ceremonial pedestal.
 slab(8.8,4.45,.20,0,.10,0,'dark',root,.24);
 slab(8.76,4.41,.025,0,.216,0,'gold',root,.24);slab(8.70,4.35,.035,0,.25,0,'leather',root,.24);
 rounded(2.4,.24,.04,0,.12,2.245,'gold');rounded(2.32,.18,.018,0,.12,2.274,'dark');label('G O L D  I G L O O',2.18,.14,0,.12,2.293);
 const lineage=label('NESTASH  /  EVOLVED',1.6,.11,-3.15,.28,1.70,root,'#bca57c',65);if(lineage)lineage.rotation.x=-Math.PI/2;
 // Tactile research reports, sewn signatures, foil title and a proper nibbed pen.
 const books=group(-3.25,.29,.12);books.rotation.y=-.12;books.scale.setScalar(1.22);
 for(let i=0;i<3;i++){
  const z=(i%2)*.06,y=i*.16;slab(1.47,1.17,.022,0,y,z,'leather',books);slab(1.40,1.10,.11,.025,y+.065,z,'paper',books);slab(1.47,1.17,.023,0,y+.13,z,'leather',books);
  for(let j=0;j<7;j++)box(1.37,.002,.003,.025,y+.025+j*.013,z+.553,'gold',books);
  box(.025,.13,1.10,-.71,y+.065,z,'leather',books);
 }
 const bookTitle=label('G O L D  I G L O O',1.18,.17,0,.475,.39,books,'#d8b67b');if(bookTitle)bookTitle.rotation.x=-Math.PI/2;
 const pen=group(-3.12,.32,1.12);pen.rotation.y=-.18;
 const barrel=mesh(new T.CylinderGeometry(.034,.034,1.05,24),'gold',pen);barrel.rotation.z=Math.PI/2;
 const grip=mesh(new T.CylinderGeometry(.035,.032,.22,24),'leather',pen);grip.rotation.z=Math.PI/2;grip.position.x=.55;
 const nib=mesh(new T.ConeGeometry(.031,.17,12),'gold',pen);nib.rotation.z=-Math.PI/2;nib.position.x=.73;
 for(const x of [-.50,-.39,.39]){const r=ring(.037,.004,x,0,0,'gold',pen);r.rotation.y=Math.PI/2;}
 // Ivory research panels with crisp labels, brass frames and separate scan/check layers.
 const checks=[],panelFrames=[],scans=[];
 m.scan=new T.MeshBasicMaterial({color:0x357f70,transparent:true,opacity:.72,depthWrite:false});
 m.scanHalo=new T.MeshBasicMaterial({color:0x357f70,transparent:true,opacity:.10,depthWrite:false});
 const specs=[{x:-1.20,z:-.72,title:'ISLAMIC FINANCE',subtitle:'Shariah research',rows:['Business activity','Financial screening','Purification']},{x:.94,z:-.72,title:'SUSTAINABILITY',subtitle:'Impact research',rows:['Clean energy','Water & resilience','Sustainable cities']}];
 specs.forEach((s,pi)=>{
  const panel=group(s.x,.30,s.z);panel.scale.x=.86;panel.name=`goldigloo-panel-${pi}`;
  rounded(2.38,2.77,.10,0,1.36,-.055,'gold',panel,.075);
  rounded(2.33,2.72,.11,0,1.36,-.028,'dark',panel,.065);
  rounded(2.22,2.60,.035,0,1.36,.035,'paper',panel,.045);
  label(`0${pi+1} / RESEARCH LENS`,1.85,.10,0,2.51,.062,panel,'#777d70',54);
  for(const x of [-1.15,1.15])box(.012,2.68,.024,x,1.36,0,'edge',panel);
  for(const y of [.02,2.70])box(2.31,.012,.024,0,y,0,'edge',panel);
  for(const x of [-.87,.87]){rounded(.22,.12,.15,x,.05,0,'gold',panel,.018);slab(.32,.19,.014,x,-.025,0,'gold',panel);}
  label(s.title,1.96,.20,0,2.30,.068,panel,'#183f3d',82);
  label(s.subtitle,1.86,.15,0,2.08,.068,panel,'#6b796d',64);
  label('Illustrative research workflow',1.88,.105,0,.25,.068,panel,'#7a7c6e',60);
  for(let i=0;i<3;i++){
   const y=1.78-i*.55;box(1.82,.004,.004,0,y-.23,.066,'edge',panel);
   ring(.068,.006,-.88,y,.074,'gold',panel);label(s.rows[i],1.67,.17,.12,y,.074,panel,'#244d48',69);
   const mark=group(-.88,y,.085,panel);check(0,0,0,mark,'jade');live.push(mark);checks.push(mark);
  }
  const glow=group(0,0,.078,panel);glow.name=`goldigloo-active-frame-${pi}`;
  for(const x of [-1.15,1.15])box(.014,2.67,.012,x,1.36,0,'warm',glow);
  for(const y of [.025,2.695])box(2.30,.014,.012,0,y,0,'warm',glow);
  live.push(glow);panelFrames.push(glow);
  const scan=group(0,0,.090,panel);scan.name=`goldigloo-scan-${pi}`;
  box(1.89,.014,.006,0,0,0,'scan',scan);box(1.89,.075,.004,0,.012,-.003,'scanHalo',scan);
  ball(.026,-.97,0,0,'warm',scan);live.push(scan);scans.push(scan);
 });
 // The shortlist folio and thin, textured research cards rest in the foreground.
 const folio=group(-.05,.30,1.34);folio.rotation.y=-.10;
 slab(2.98,1.34,.055,0,0,0,'paper',folio,.075);
 for(const z of [-.60,.60])for(let j=0;j<58;j++)box(.021,.003,.004,-1.40+j*.049,.038,z,'gold',folio);
 for(const x of [-1.40,1.40])for(let j=0;j<23;j++)box(.004,.003,.021,x,.038,-.56+j*.05,'gold',folio);
 box(.008,.01,1.16,0,.035,0,'stone',folio);
 const tab=group(.73,.13,-.59,folio);tab.rotation.x=-.3;rounded(1.30,.25,.035,0,0,0,'paper',tab,.03);label('RESEARCH SHORTLIST',1.19,.15,0,0,.027,tab,'#4e5d4d');
 const cards=[],cardBadges=[];
 function card(x,y,z,angle,parent,index,animated=false){
  const g=group(x,y,z,parent);g.rotation.x=-Math.PI/2;g.rotation.z=angle;g.name=`goldigloo-company-${index}`;
  rounded(.73,.97,.015,0,0,0,'paper',g,.038);
  const medallion=mesh(new T.CircleGeometry(.15,48),'jade',g);medallion.position.set(0,.23,.024);
  if(index===0){for(const x of [-.07,.07]){box(.008,.17,.007,x,.23,.031,'paper',g);for(let b=0;b<3;b++){const blade=box(.006,.08,.004,0,.04,0,'paper',group(x,.30,.033,g));blade.parent.rotation.z=b*Math.PI*2/3;}}}
  else if(index===1){for(let j=0;j<3;j++)line([[-.11,.19+j*.045,.032],[0,.17+j*.045,.032],[.11,.19+j*.045,.032]],.005,'paper',g);}
  else{for(let j=0;j<3;j++)box(.046,.10+j*.035,.008,-.065+j*.065,.22+j*.017,.032,'paper',g);}
  label(['Energy','Water','Cities'][index%3],.62,.13,0,.02,.027,g,'#214b44',85);
  label('Illustrative theme',.61,.075,0,-.14,.027,g,'#778475',52);
  label('Shariah   +   Impact',.60,.075,0,-.28,.027,g,'#657a68',50);
  const badge=group(0,-.38,.025,g);for(const x of [-.17,.17]){ring(.036,.003,x,0,0,'jade',badge);check(x,0,0,badge,'jade',.42);}
  if(animated){badge.name=`goldigloo-shortlist-check-${index}`;cardBadges.push(badge);batch(g);live.push(g);cards.push(g);}return g;
 }
 for(let i=0;i<3;i++)card(-.91+i*.89,.062,.015,(i-1)*-.045,folio,i,true);

 // Nestash's three impact miniatures are now connected to a second research lens.
 const islands=[],impactRings=[];
 const centers=[[2.62,.30,.66,.64],[2.68,.55,-1.05,.60],[3.60,.30,-.12,.62]],radii=[1.13,.86,.86];
 centers.forEach(([x,y,z,scale],i)=>{
  const g=group(x,y,z);g.scale.setScalar(scale);islands.push(g);const r=radii[i];
  disk(r,.09,0,.045,0,'dark',g);disk(r*.99,.025,0,.104,0,'gold',g);disk(r*.965,.16,0,.198,0,'stone',g);
  const highlight=ring(r*.95,.015,0,.292,0,'warm',g);highlight.rotation.x=-Math.PI/2;highlight.name=`goldigloo-impact-${i}`;impactRings.push(highlight);live.push(highlight);
 });
 const {rotors,ripples,flows}=nestashLandscapes(T,{materials:m,mesh,box,disk,line,group,slab,rounded,batch},islands,live);
 // Two separate paths become a single shortlist only after both lenses complete.
 const routes=[new T.CatmullRomCurve3([[-1.20,.30,-.55],[-1.72,.30,.18],[-1.75,.30,.78],[0,.34,.94]].map(v=>new T.Vector3(...v))),new T.CatmullRomCurve3([[.94,.30,-.55],[1.56,.30,.20],[1.73,.30,.84],[0,.34,.94]].map(v=>new T.Vector3(...v)))];
 const signals=[];const junction=ball(.052,0,.34,.94,'warm');junction.name='goldigloo-convergence';live.push(junction);
 routes.forEach((route,i)=>{mesh(new T.TubeGeometry(route,72,.013,8,false),'gold');for(let j=0;j<3;j++){const o=ball(.033,0,0,0,'warm');o.name=`goldigloo-research-signal-${i}-${j}`;signals.push({o,i,j});live.push(o);}});
 // IceIgloo, sculpted as staggered curved ice blocks. The entrance is a doorway,
 // separate from the small friendly face, matching the approved artwork.
 const mascot=group(-3.25,.89,.12);mascot.name='goldigloo-mascot';mascot.scale.setScalar(1.60);
 const body=group(0,0,0,mascot);
 const core=mesh(new T.SphereGeometry(.508,40,24,0,Math.PI*2,0,Math.PI/2),'seam',body);core.scale.y=.97;
 for(let row=0;row<5;row++){
  const top=row*Math.PI/10+.012,span=Math.PI/10-.024,count=Math.max(5,Math.round(20*Math.sin(top+span/2)));
  for(let j=0;j<count;j++){
   const arc=Math.PI*2/count,geo=new T.SphereGeometry(.523,10,5,j*arc+(row%2)*arc/2+.012,arc-.024,top,span),o=mesh(geo,'ice',body);o.scale.y=.97;
  }
 }
 for(const x of [-.27,.27])ell(x,.01,.27,.12,.045,.13,'ice',body);
 ell(-.53,.19,0,.075,.16,.085,'ice',body).rotation.z=-.4;
 const wave=group(.49,.19,0,mascot);wave.name='goldigloo-wave';ell(.025,.10,0,.078,.19,.085,'ice',wave).rotation.z=-.35;
 const eyes=[];
 for(const x of [-.17,.06]){
  const eye=group(x,.355,.385,body);eye.name=`goldigloo-eye-${eyes.length}`;
  ell(0,0,0,.035,.045,.023,'ink',eye);ell(-.008,.015,.019,.008,.011,.005,'white',eye);eyes.push(eye);
 }
 for(const x of [-.26,.15])ell(x,.30,.405,.044,.025,.008,'cheek',body);
 line([[-.10,.31,.445],[-.071,.297,.452],[-.045,.31,.450]],.007,'ink',body);
 // Offset shallow amber tunnel and individual arch stones, closed at the back.
 const door=group(.20,0,.44,body),s=new T.Shape();s.moveTo(-.12,0);s.lineTo(-.12,.14);s.absarc(0,.14,.12,Math.PI,0,true);s.lineTo(.12,0);s.closePath();
 const opening=mesh(new T.ShapeGeometry(s,24),'warm',door);opening.position.z=.078;
 for(const side of [-1,1])for(let j=0;j<2;j++)rounded(.064,.079,.16,side*.151,.04+j*.08,.045,'seam',door,.018);
 for(let j=0;j<7;j++){
  const a=Math.PI*j/6,o=rounded(.070,.073,.16,Math.cos(a)*.15,.15+Math.sin(a)*.15,.045,'seam',door,.018);o.rotation.z=a-Math.PI/2;
 }
 const badge=group(-.34,.36,.27,body);badge.rotation.y=-.45;leafIcon(0,0,0,badge,.11,'gold');
 batch(body);batch(wave);live.push(mascot);
 root.updateMatrixWorld(true);const framingPoints=[];
 root.traverse(o=>{if(!o.isMesh||signals.some(s=>s.o===o))return;const b=new T.Box3().setFromObject(o);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));});
 // Preserve only dynamic roots; the mascot's hand remains attached to its body.
 for(const o of live)if(o!==mascot)root.attach(o);
 const before=mascot.position.clone(),model=finish(17,live),offset=mascot.position.clone().sub(before);framingPoints.forEach(p=>p.add(offset));
 model.traverse(o=>{if(o.isMesh&&(o.material.transparent||o.material.isMeshBasicMaterial)){o.userData.noShadow=true;}});
 const cardRest=cards.map(c=>({p:c.position.clone(),q:c.quaternion.clone()}));
 const waveRest=wave.rotation.z,mascotRest=mascot.position.clone();
 const scanRest=scans.map(o=>o.position.clone()),rotorRest=rotors.map(o=>o.quaternion.clone()),rippleScale=ripples.map(o=>o.scale.clone()),flowScale=flows.map(o=>o.scale.clone()),ringScale=impactRings.map(o=>o.scale.clone());
 const tilt=new T.Quaternion(),axis=new T.Vector3(1,0,0);
 Object.assign(model.userData,{framingPoints,cameraFitSway:0,framingTargetY:1.08,displayBase:false,groundLevel:0,studioProfile:'goldigloo',contactFootprint:false,initialYaw:-.08,initialElevation:.40,autoOrbit:false,realTimeAnimation:true,source:'https://github.com/sayyidkhan/goldigloo',screeningConcept:true});
 let selected=null;
 model.userData.setStep=(index,time=0)=>{if(index!==null&&(!Number.isInteger(index)||index<0||index>=GOLDIGLOO_STEPS.length))return;selected=index;model.userData.animate(time);};
 model.userData.animate=time=>{
  const moment=goldiglooMoment(selected===null?time:[2.5,6.5,10.5,15.5,23][selected]),copy=GOLDIGLOO_STEPS[moment.index];
  model.userData.story={index:moment.index,step:`0${moment.index+1} / 05`,title:copy[1],detail:copy[2],tone:'teal'};
  checks.forEach((o,i)=>o.scale.setScalar(Math.max(.001,i<3?moment.shariah[i]:moment.impactRows[i-3])));
  panelFrames.forEach((g,i)=>{g.visible=i===0?moment.index<3:moment.index===3;});
  // One elapsed clock drives ambient motion even when the story is held manually.
  // The shared viewer freezes this clock for pause, off-screen and reduced motion.
  const clock=goldiglooMoment(time).t,breath=Math.sin(clock*Math.PI/3);
  const greeting=(clock%8),waveEnvelope=ease(greeting/.45)*(1-ease((greeting-2.6)/.6));
  wave.rotation.z=waveRest+.12+waveEnvelope*(.16+Math.sin(greeting*8)*.34);
  mascot.scale.set(1-breath*.008,1+breath*.014,1-breath*.008).multiplyScalar(1.60);
  mascot.position.copy(mascotRest);
  const blinkPhase=clock%6,blink=1-ease((blinkPhase-3.0)/.09)*(1-ease((blinkPhase-3.13)/.12));
  eyes.forEach(o=>{o.scale.y=Math.max(.08,blink);});
  rotors.forEach((o,i)=>{o.quaternion.copy(rotorRest[i]);o.rotateZ(-clock*Math.PI*(i?1/3:1/2));});
  ripples.forEach((o,i)=>o.scale.copy(rippleScale[i]).multiplyScalar(.88+.12*Math.sin(clock*Math.PI/2+i)));
  flows.forEach((o,i)=>{o.scale.copy(flowScale[i]);o.scale.x*=.88+.12*Math.sin(clock*Math.PI*2+i*.7);});
  junction.visible=moment.index===4;junction.scale.setScalar(1+.10*Math.sin(clock*Math.PI*2));
  impactRings.forEach((o,i)=>{o.visible=moment.impactRows[i]>.01;o.scale.copy(ringScale[i]).multiplyScalar(.99+.01*moment.impactRows[i]);});
  signals.forEach(({o,i,j})=>{o.visible=i===0?moment.t>=10&&moment.t<17:moment.t>=16&&moment.t<22;o.position.copy(routes[i].getPointAt((clock*.25+j/3)%1)).add(offset);});
  scans.forEach((o,i)=>{
   const stageTime=selected===null?moment.t:([0,4,8,12,17][selected]+clock%3.6);
   const local=i===0?stageTime%4:(stageTime-12)%1.1;
   const row=Math.max(0,Math.min(2,i===0?Math.floor(stageTime/4):Math.floor((stageTime-12)/1.1)));
   const active=i===0?moment.index<3:moment.index===3;
   const duration=i===0?2:1.1,progress=ease(local/duration);
   o.visible=active&&local>=0&&local<duration&&(i===0||stageTime<15.3);
   o.position.copy(scanRest[i]);o.position.y+=2.0-row*.55-progress*.44;
  });
  cards.forEach((c,i)=>{
   // Lift from the folio, briefly present the face, then settle in sequence.
   const u=Math.max(0,Math.min(1,(moment.t-17-i*.65)/2.4));
   const lift=Math.sin(Math.PI*u)**2;
   c.position.copy(cardRest[i].p);c.position.y+=lift*.42;
   c.quaternion.copy(cardRest[i].q).multiply(tilt.setFromAxisAngle(axis,lift*.35));
   c.scale.setScalar(1+lift*.045);
   cardBadges[i].visible=moment.t>=18.8+i*.65;
  });
 };
 for(const o of model.children)if(o.isMesh&&!o.material.isMeshBasicMaterial&&!o.material.transparent&&!live.includes(o))o.userData.observatoryAO=true;
 if(typeof window!=='undefined'&&!options.bake)applyObservatoryAO(T,model,{url:new URL('../assets/goldigloo-ao-v1.bin',import.meta.url)});
 model.userData.animate(0);return model;
}
