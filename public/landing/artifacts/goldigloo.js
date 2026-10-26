import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';

// An interpretation of the 2018 prototype, not a live stock screener.
export const GOLDIGLOO_CYCLE=24;
export const GOLDIGLOO_STEPS=[
 ['Business activity','Review the company’s business','The prototype begins by screening business activities against its Shariah criteria.'],
 ['Financial screening','Look at the financial structure','The original research also examines company financial ratios.'],
 ['Purification','Review dividend purification','The third Shariah screening step in the original prototype.'],
 ['Impact','Look for environmental and social impact','The prototype combines Shariah screening with sustainable-impact research.'],
 ['Shortlist','Bring both research lenses together','Explore companies that meet both sets of criteria. These cards are illustrative, not stock recommendations.'],
];
const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
export function goldiglooMoment(time){
 const t=((time%GOLDIGLOO_CYCLE)+GOLDIGLOO_CYCLE)%GOLDIGLOO_CYCLE;
 return {t,index:t<4?0:t<8?1:t<12?2:t<17?3:4,shariah:[0,4,8].map(start=>ease((t-start)/2)),impact:ease((t-12)/3),impactRows:[12,13.1,14.2].map(start=>ease((t-start)/1.2)),shortlist:ease((t-17)/3)};
}
export function createArtifact(T){
 const k=medivoiceStudio(T),{root,materials:m,mesh,box,ball,line,finish,batch,texture}=k;
 const live=[],material=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 Object.assign(m,{stone:material(0xe5dbc8,.8),paper:material(0xeee5d5,.82),leather:material(0x1d3936,.74),gold:material(0xc4a466,.30,.75),edge:material(0x97b6a4,.35,.45),jade:material(0x267568,.5),ink:material(0x173c3b,.42),dark:material(0x102a29,.48),soil:material(0x737256,.95),bark:material(0x79704b,.9),leaf:material(0x657c4a,.8),leafLight:material(0x93a267,.8),solar:material(0x1c3a4f,.28,.3),white:material(0xf2eee2,.5),ice:material(0xcce8ea,.24,.03),seam:material(0xf3f5e9,.57),cheek:material(0xeab19a,.7),warm:new T.MeshStandardMaterial({color:0xffdf9b,emissive:0xffc36b,emissiveIntensity:.65,roughness:.6}),glass:new T.MeshPhysicalMaterial({color:0xa7cdc2,roughness:.13,metalness:.06,transparent:true,opacity:.19,depthWrite:false,side:T.DoubleSide})});
 const stone=planningExhibitSurfaces(T).stone;m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.008;
 const grain=texture('cloth');m.leather.bumpMap=grain;m.leather.bumpScale=.006;m.paper.bumpMap=grain;m.paper.bumpScale=.003;m.ice.bumpMap=texture('stone');m.ice.bumpScale=.002;
 // Locally generated green marble, shared by colour and micro-relief.
 const n=256,pixels=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=x/n,v=y/n,s=Math.sin(u*33+Math.sin(v*17)*2+Math.sin(u*9+v*11)),vein=Math.pow(Math.max(0,1-Math.abs(s)*4),4),i=(y*n+x)*4;pixels.set([44+vein*82,64+vein*77,61+vein*66,255],i);}
 const marble=new T.DataTexture(pixels,n,n);marble.colorSpace=T.SRGBColorSpace;marble.wrapS=marble.wrapT=T.RepeatWrapping;marble.repeat.set(2,1.3);marble.magFilter=T.LinearFilter;marble.needsUpdate=true;m.marble=new T.MeshStandardMaterial({map:marble,roughness:.32,metalness:.08,bumpMap:marble,bumpScale:.001});
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
 slab(6.8,3.8,.12,0,.08,0,'dark',root,.18);slab(6.8,3.8,.055,0,.16,0,'marble',root,.18);
 // Tactile research reports, sewn signatures, foil title and a proper nibbed pen.
 const books=group(-2.40,.22,.1);books.rotation.y=-.12;
 for(let i=0;i<3;i++){
  const z=(i%2)*.06,y=i*.16;slab(1.47,1.17,.022,0,y,z,'leather',books);slab(1.40,1.10,.11,.025,y+.065,z,'paper',books);slab(1.47,1.17,.023,0,y+.13,z,'leather',books);
  for(let j=0;j<7;j++)box(1.37,.002,.003,.025,y+.025+j*.013,z+.553,'gold',books);
  box(.025,.13,1.10,-.71,y+.065,z,'leather',books);
 }
 const bookTitle=label('G O L D  I G L O O',1.18,.17,0,.475,.39,books,'#d8b67b');if(bookTitle)bookTitle.rotation.x=-Math.PI/2;
 const pen=group(-2.35,.24,1.02);pen.rotation.y=-.18;
 const barrel=mesh(new T.CylinderGeometry(.034,.034,1.05,24),'gold',pen);barrel.rotation.z=Math.PI/2;
 const grip=mesh(new T.CylinderGeometry(.035,.032,.22,24),'leather',pen);grip.rotation.z=Math.PI/2;grip.position.x=.55;
 const nib=mesh(new T.ConeGeometry(.031,.17,12),'gold',pen);nib.rotation.z=-Math.PI/2;nib.position.x=.73;
 for(const x of [-.50,-.39,.39]){const r=ring(.037,.004,x,0,0,'gold',pen);r.rotation.y=Math.PI/2;}
 // Two real optical panels with crisp, independently generated label textures.
 const checks=[],panelFrames=[],scans=[];
 m.scan=new T.MeshBasicMaterial({color:0xffe4aa,transparent:true,opacity:.72,depthWrite:false});
 m.scanHalo=new T.MeshBasicMaterial({color:0xffe4aa,transparent:true,opacity:.10,depthWrite:false});
 const specs=[{x:-.76,z:-.68,title:'S H A R I A H',rows:['Business activity','Financial screening','Purification']},{x:1.09,z:-.34,title:'I M P A C T',rows:['Climate','Clean energy','Life on land & water']}];
 specs.forEach((s,pi)=>{
  const panel=group(s.x,.24,s.z);panel.name=`goldigloo-panel-${pi}`;
  rounded(2.30,2.67,.024,0,1.36,0,'glass',panel,.025);
  for(const x of [-1.15,1.15])box(.012,2.68,.024,x,1.36,0,'edge',panel);
  for(const y of [.02,2.70])box(2.31,.012,.024,0,y,0,'edge',panel);
  for(const x of [-.87,.87]){rounded(.22,.12,.15,x,.05,0,'gold',panel,.018);slab(.32,.19,.014,x,-.025,0,'gold',panel);}
  label(s.title,1.88,.23,0,2.34,.024,panel,'#f5edda',80);
  for(let i=0;i<3;i++){
   const y=1.78-i*.55;box(1.82,.004,.004,0,y-.23,.025,'edge',panel);
   ring(.068,.006,-.88,y,.035,'gold',panel);label(s.rows[i],1.67,.17,.12,y,.035,panel,'#eee8d8',69);
   const mark=group(-.88,y,.042,panel);check(0,0,0,mark,'gold');live.push(mark);checks.push(mark);
  }
  const glow=group(0,0,.018,panel);glow.name=`goldigloo-active-frame-${pi}`;
  for(const x of [-1.15,1.15])box(.014,2.67,.012,x,1.36,0,'warm',glow);
  for(const y of [.025,2.695])box(2.30,.014,.012,0,y,0,'warm',glow);
  live.push(glow);panelFrames.push(glow);
  const scan=group(0,0,.061,panel);scan.name=`goldigloo-scan-${pi}`;
  box(1.89,.014,.006,0,0,0,'scan',scan);box(1.89,.075,.004,0,.012,-.003,'scanHalo',scan);
  ball(.026,-.97,0,0,'warm',scan);live.push(scan);scans.push(scan);
 });
 // The shortlist folio and thin, textured research cards rest in the foreground.
 const folio=group(.75,.235,1.05);folio.rotation.y=-.10;
 slab(2.98,1.34,.055,0,0,0,'paper',folio,.075);
 for(const z of [-.60,.60])for(let j=0;j<58;j++)box(.021,.003,.004,-1.40+j*.049,.038,z,'gold',folio);
 for(const x of [-1.40,1.40])for(let j=0;j<23;j++)box(.004,.003,.021,x,.038,-.56+j*.05,'gold',folio);
 box(.008,.01,1.16,0,.035,0,'stone',folio);
 const tab=group(.73,.13,-.59,folio);tab.rotation.x=-.3;rounded(1.30,.25,.035,0,0,0,'paper',tab,.03);label('THE SHORTLIST',1.19,.15,0,0,.027,tab,'#4e5d4d');
 const cards=[],cardBadges=[];
 function card(x,y,z,angle,parent,index,animated=false){
  const g=group(x,y,z,parent);g.rotation.x=-Math.PI/2;g.rotation.z=angle;g.name=`goldigloo-company-${index}`;
  rounded(.73,.97,.015,0,0,0,'paper',g,.038);
  if(index%2)leafIcon(-.09,.24,.02,g,.19,'jade');else {const icon=mesh(new T.CircleGeometry(.14,5),'jade',g);icon.position.set(-.08,.23,.025);}
  for(let j=0;j<4;j++)box(.49-j*.045,.012,.003,-j*.02,-.10-j*.065,.020,'edge',g);
  const badge=group(.25,.35,.025,g);ring(.052,.004,0,0,0,'jade',badge);check(0,0,0,badge,'jade',.55);
  if(animated){badge.name=`goldigloo-shortlist-check-${index}`;cardBadges.push(badge);batch(g);live.push(g);cards.push(g);}return g;
 }
 for(let i=0;i<3;i++)card(-.91+i*.89,.062,.015,(i-1)*-.045,folio,i,true);
 card(-2.38,.22,1.55,.20,root,3);
 // Small planted impact vignette: a solar roof, fine leaves, stones and water.
 const garden=group(2.62,.21,-.1);slab(1.15,1.85,.16,0,.08,0,'stone',garden,.15);slab(1.02,1.70,.015,0,.17,0,'soil',garden,.10);
 slab(.31,.70,.012,-.32,.19,.42,'jade',garden,.1);
 for(let i=0;i<12;i++){const a=i*2.4;ell(Math.cos(a)*.45,.22,Math.sin(a)*.72,.07,.055,.08,'stone',garden);}
 const hut=group(.12,.20,.10,garden);
 slab(.70,.56,.025,0,0,0,'stone',hut);
 for(const x of [-.28,.28])for(const z of [-.20,.20])box(.034,.34,.034,x,.18,z,'white',hut);
 const roof=group(0,.40,0,hut);roof.rotation.x=.17;slab(.76,.63,.035,0,0,0,'white',roof);
 for(let i=0;i<3;i++)for(let j=0;j<2;j++){
  slab(.22,.26,.008,-.24+i*.24,.026,-.145+j*.29,'solar',roof,.006);
  for(let q=0;q<4;q++)box(.20,.002,.003,-.24+i*.24,.032,-.24+j*.29+q*.062,'edge',roof);
 }
 const plants=[];
 let seed=1704;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(const [x,z,h] of [[.30,-.67,1.35],[-.35,-.57,.75],[.38,.62,.53],[-.36,.64,.35]]){
  const plant=group(0,0,0,garden);plant.name=`goldigloo-plant-${plants.length}`;
  line([[x,.19,z],[x-.02,h*.58,z],[x+.06,h,z+.03]],.016,'bark',plant);
  for(let b=0;b<9;b++){
   const a=b*2.4,y=.3+(h-.3)*b/9,end=[x+Math.cos(a)*.23,y+.16,z+Math.sin(a)*.19];
   line([[x,y,z],end],.007,'bark',plant);
   for(let j=0;j<9;j++){
    const l=ell(end[0]+(rnd()-.5)*.23,end[1]+(rnd()-.5)*.16,end[2]+(rnd()-.5)*.20,.032,.084,.012,j%2?'leaf':'leafLight',plant);l.rotation.set(rnd(),a+rnd(),rnd()*1.8-.9);
   }
  }
  // Move the pivot to the stem base before preserving the whole plant.
  batch(plant);plant.children.forEach(o=>o.position.sub(new T.Vector3(x,.19,z)));plant.position.set(x,.19,z);
  live.push(plant);plants.push(plant);
 }
 // IceIgloo, sculpted as staggered curved ice blocks. The entrance is a doorway,
 // separate from the small friendly face, matching the approved artwork.
 const mascot=group(-2.40,.70,-.02);mascot.name='goldigloo-mascot';
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
 root.updateMatrixWorld(true);
 // Preserve only dynamic roots; the mascot's hand remains attached to its body.
 for(const o of live)if(o!==mascot)root.attach(o);
 const model=finish(17,live);
 model.traverse(o=>{if(o.isMesh&&(o.material.transparent||o.material.isMeshBasicMaterial)){o.userData.noShadow=true;}});
 const cardRest=cards.map(c=>({p:c.position.clone(),q:c.quaternion.clone()}));
 const waveRest=wave.rotation.z,mascotRest=mascot.position.clone();
 const scanRest=scans.map(o=>o.position.clone()),plantRest=plants.map(o=>o.quaternion.clone());
 const tilt=new T.Quaternion(),axis=new T.Vector3(1,0,0);
 Object.assign(model.userData,{displayBase:false,groundLevel:0,studioProfile:'goldigloo',contactFootprint:false,initialYaw:-.10,initialElevation:.38,autoOrbit:false,realTimeAnimation:true,source:'https://github.com/sayyidkhan/goldigloo',screeningConcept:true});
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
  mascot.scale.set(1-breath*.008,1+breath*.014,1-breath*.008);
  mascot.position.copy(mascotRest);
  const blinkPhase=clock%6,blink=1-ease((blinkPhase-3.0)/.09)*(1-ease((blinkPhase-3.13)/.12));
  eyes.forEach(o=>{o.scale.y=Math.max(.08,blink);});
  plants.forEach((o,i)=>{o.quaternion.copy(plantRest[i]);o.rotateZ(Math.sin(clock*Math.PI/3+i)*.028);o.rotateX(Math.sin(clock*Math.PI/6+i)*.012);});
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
 model.userData.animate(0);return model;
}
