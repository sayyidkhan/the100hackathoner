import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {vainsterMoment,vainsterScreen,VAINSTER_STORIES,VAINSTER_CYCLE,portraitCanvas} from './vainster-screen.js';
export {vainsterMoment,VAINSTER_CYCLE};
let portrait;
export async function prepareArtifact(){if(portrait)return;const r=await fetch(new URL('../assets/vainster/portrait.json',import.meta.url));if(!r.ok)throw new Error('Unable to load Vainster portrait');portrait=await r.json();}
export function createArtifact(T,options={}){
 const {root,materials:m,mesh,box,disk,ball,line,finish,texture,batch}=medivoiceStudio(T);
 for(const [key,color] of Object.entries({forest:0x183d32,ivory:0xe5ddcb,stone:0xe8dfcd,brass:0xbba070,gold:0xe0c995,mint:0xa4d9bf,dark:0x122c27,green:0x518d74}))m[key]=new T.MeshStandardMaterial({color,roughness:['brass','gold'].includes(key)?.29:.62,metalness:['brass','gold'].includes(key)?.78:0});
 const stone=planningExhibitSurfaces(T).stone;m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.022;m.stone.roughness=.88;
 m.ivory.bumpMap=texture('paper');m.ivory.bumpScale=.006;m.ivory.roughness=.62;
 m.hair=m.ivory.clone();m.hair.color.setHex(0xcbbf9f);m.hair.roughness=.8;
 m.brass.bumpMap=texture('cloth');m.brass.bumpScale=.001;
 m.mint.emissive.setHex(0x83c8a5);m.mint.emissiveIntensity=.6;
 const live=[];function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.10){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:20}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,key,p=root,r=.18){const o=round(w,d,h,x,y,z,key,p,r);o.rotation.x=-Math.PI/2;return o;}
 function label(txt,w,h,x,y,z,p=root,col='#e6d4ad'){
  if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const cx=c.getContext('2d');cx.fillStyle=col;cx.textAlign='center';cx.textBaseline='middle';cx.font=`${c.height*.67}px Georgia`;cx.fillText(txt,512,c.height/2,990);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;
 }
 slab(10,4.0,.38,0,0,0,'stone',root,.60);slab(9.82,3.86,.06,0,-.045,0,'brass',root,.55);
 round(3.1,.42,.035,0,.19,2.03,'brass');round(3.0,.33,.018,0,.19,2.08,'forest');label('Vainster',2.5,.27,0,.19,2.12);
 // Human-authored Rocketbox mesh, cropped to a rigid head-and-neck portrait.
 const portraitGroup=group(-.25,.76,-.08);portraitGroup.name='vainster-portrait';
 const source=options.portrait??portrait;if(!source)throw new Error('Vainster portrait must be prepared first');
 const geo=new T.BufferGeometryLoader().parse(source);const head=mesh(geo,'ivory',portraitGroup);head.name='vainster-detailed-face';
 disk(.93,.24,-.25,.51,-.08,'brass');disk(.98,.035,-.25,.65,-.08,'gold');disk(.72,.12,-.25,.72,-.08,'ivory');
 const halo=mesh(new T.TorusGeometry(2.04,.026,16,192),'brass');halo.position.set(-.25,2.60,-.88);
 const haloInner=mesh(new T.TorusGeometry(2.005,.009,8,192),'gold');haloInner.position.copy(halo.position);
 for(const x of [-1.42,.92])disk(.031,.63,x,.69,-.88,'brass');
 // Project landmarks onto the actual sculpted surface, instead of a flat overlay.
 root.updateMatrixWorld(true);const low=source.userData.scanSurface,rayGeo=new T.BufferGeometry();rayGeo.setAttribute('position',new T.Float32BufferAttribute(low.positions,3));rayGeo.setIndex(low.indices);const rayHead=new T.Mesh(rayGeo,m.ivory);rayHead.matrixWorld.copy(head.matrixWorld);const cast=new T.Raycaster();function surface(x,y){cast.set(new T.Vector3(x+portraitGroup.position.x,y+portraitGroup.position.y,5),new T.Vector3(0,0,-1));const hit=cast.intersectObject(rayHead)[0];return hit?portraitGroup.worldToLocal(hit.point.clone()).add(new T.Vector3(0,0,.028)):null;}
 // Fine swept grooves give the authored hair cap a sculpted ceramic finish.
 const origin=new T.Vector3(0,2.15,-.30),hairGroup=group(0,0,0,portraitGroup);
 for(let strand=0;strand<43;strand++){
  const x=(strand-21)/21*.77,ps=[];
  for(let j=0;j<29;j++){
   const theta=.38+j/28*2.60,dir=new T.Vector3(x*.8,Math.sin(theta),Math.cos(theta)).normalize();
   const start=origin.clone().addScaledVector(dir,3).add(portraitGroup.position);
   cast.set(start,dir.clone().negate());const hit=cast.intersectObject(rayHead)[0];
   if(hit){const p=portraitGroup.worldToLocal(hit.point.clone()).addScaledVector(dir,.012);if(p.y>2.35||p.z<-.75)ps.push(p.toArray());}
  }
  if(ps.length>3)line(ps,.009,'hair',hairGroup);
 }
 batch(hairGroup);
 const nodeGroup=group(0,0,0,portraitGroup);nodeGroup.name='vainster-landmarks';
 const rows=[[2.45,[-.5,-.25,0,.25,.5]],[2.16,[-.70,-.42,0,.42,.70]],[1.85,[-.73,-.4,-.16,.16,.4,.73]],[1.53,[-.62,-.35,0,.35,.62]],[1.22,[-.5,-.23,0,.23,.5]],[.96,[-.28,0,.28]]];
 const points=[];rows.forEach(([y,xs],ri)=>{const row=[];xs.forEach(x=>{const p=surface(x,y);if(p){const n=ball(.024,...p.toArray(),'mint',nodeGroup);row.push(p);}});points.push(row);});
 function faceLine(a,b){const ps=[];for(let i=0;i<=8;i++){const p=a.clone().lerp(b,i/8);ps.push((surface(p.x,p.y)??p).toArray());}line(ps,.005,'mint',nodeGroup);}
 for(let ri=0;ri<points.length;ri++){const ps=points[ri];for(let j=1;j<ps.length;j++)faceLine(ps[j-1],ps[j]);if(ri>0)for(let j=0;j<ps.length;j++){const prev=points[ri-1][Math.min(j,points[ri-1].length-1)];if(prev)faceLine(prev,ps[j]);}}
 const regionGroup=group(0,0,0,portraitGroup);regionGroup.name='vainster-regions';const regions=[];
 for(const [x,y] of [[0,2.34],[-.59,1.56],[.59,1.56],[0,1.0]]){const p=surface(x,y);if(!p)continue;const g=group(...p.toArray(),regionGroup);const r=mesh(new T.TorusGeometry(.09,.009,10,40),'gold',g);ball(.028,0,0,.01,'mint',g);regions.push(g);}
 const scan=group(0,0,0,portraitGroup);scan.name='vainster-scan';const scanData=new Float32Array(41*3),scanGeometry=new T.BufferGeometry();scanGeometry.setAttribute('position',new T.BufferAttribute(scanData,3));
 const scanLine=new T.Line(scanGeometry,new T.LineBasicMaterial({color:0xb9ffe0,toneMapped:false}));scanLine.frustumCulled=false;scan.add(scanLine);
 const scanRows=Array.from({length:72},(_,i)=>{const y=2.66-i/71*1.86;const out=[];for(let n=0;n<41;n++){const x=-.82+n/40*1.64,p=surface(x,y);out.push(p??new T.Vector3(x,y,.42));}return out;});
 rayGeo.dispose();
 // Precision phone camera with physical lens, edge buttons and capture control.
 const phone=group(-3.55,2.22,.05);phone.rotation.y=.08;
 round(1.72,3.51,.12,0,0,0,'brass',phone,.21);round(1.65,3.44,.13,0,0,.038,'dark',phone,.19);
 const cameraUI=vainsterScreen(T,'phone',portraitCanvas(geo)),reportUI=vainsterScreen(T,'report');
 const phoneScreen=new T.Mesh(new T.PlaneGeometry(1.48,2.99),cameraUI.material);phoneScreen.position.set(0,-.03,.213);phoneScreen.castShadow=false;phone.add(phoneScreen);
 round(.50,.10,.014,0,1.57,.18,'dark',phone,.05);const lens=ball(.027,.14,1.57,.205,'green',phone);box(.033,.24,.06,-.875,.72,.03,'brass',phone);box(.033,.40,.06,-.875,.16,.03,'brass',phone);
 slab(1.94,.86,.14,-3.55,.40,.05,'brass',root,.18);
 // Weekly journal is the output of the sequence, not an always-on result.
 const journal=group(3.18,2.36,-.23);journal.rotation.y=-.06;
 round(3.13,3.70,.10,0,0,0,'brass',journal,.05);round(3.03,3.60,.11,0,0,.03,'ivory',journal,.035);
 const screen=new T.Mesh(new T.PlaneGeometry(2.88,3.48),reportUI.material);screen.position.z=.165;screen.castShadow=false;journal.add(screen);screen.name='vainster-weekly-screen';
 slab(3.30,.77,.11,3.18,.43,-.23,'brass',root,.10);
 for(const [i,x] of [-3.55,-.25,3.18].entries()){const tag=group(x,.43,1.37);tag.rotation.x=-Math.PI/2;round(1.42,.32,.025,0,0,0,'brass',tag,.035);label(['CAPTURE','MAP','REFLECT'][i],1.18,.19,0,0,.06,tag,'#fff2d6');}
 const routes=[new T.CatmullRomCurve3([[-2.68,.50,.55],[-2.30,.50,.95],[-1.65,.50,.95],[-1.25,.68,.55]].map(p=>new T.Vector3(...p))),new T.CatmullRomCurve3([[.74,.68,.55],[1.12,.50,.95],[1.65,.50,.95],[1.75,.62,.15]].map(p=>new T.Vector3(...p)))];
 const packets=[];routes.forEach((curve,i)=>{const wire=mesh(new T.TubeGeometry(curve,64,.016,8,false),'green');for(let n=0;n<3;n++){const dot=ball(.038,0,0,0,'mint');dot.name=`vainster-packet-${i}-${n}`;packets.push({object:dot,curve,n,leg:i});live.push(dot);}});
 // Preserve the whole portrait hierarchy to keep the mesh and its projected overlays aligned.
 portraitGroup.scale.setScalar(1.15);
 live.push(portraitGroup,phone,journal);root.updateMatrixWorld(true);const framingPoints=[];root.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));});
 const before=portraitGroup.position.clone(),model=finish(8,live),offset=portraitGroup.position.clone().sub(before);framingPoints.forEach(p=>p.add(offset));
 let manual=null,timeOffset=0;
 Object.assign(model.userData,{artifactId:8,studioProfile:'vainster',displayBase:false,contactFootprint:false,framingPoints,groundLevel:0,framingTargetY:2.45,initialYaw:-.055,initialElevation:.15,autoOrbit:false,realTimeAnimation:true,cycleDuration:VAINSTER_CYCLE,
 setStep(index,elapsed=0){if(index===null){timeOffset=elapsed-(manual??elapsed-timeOffset);manual=null;}else manual=[3.5,8.3,16,24.8][Math.max(0,Math.min(3,index))];model.userData.animate(elapsed);},
 animate(time){const s=vainsterMoment(manual??time-timeOffset);cameraUI.update(s);reportUI.update(s);screen.userData.phase=s.index;screen.userData.entries=Math.floor(s.journal*7+.001);
  model.userData.story={index:s.index,step:`0${s.index+1} / 04`,title:VAINSTER_STORIES[s.index][0],detail:VAINSTER_STORIES[s.index][1],tone:'neutral'};
  scan.visible=s.index===1;const row=scanRows[Math.min(71,Math.floor(s.scan*71))];row.forEach((p,i)=>{scanData.set(p.toArray(),i*3);});scanGeometry.attributes.position.needsUpdate=true;
  nodeGroup.visible=s.index>=1&&s.fade>.01;nodeGroup.children.forEach((o,i)=>{o.visible=s.index>1||i/Math.max(1,nodeGroup.children.length-1)<s.scan;});
  regionGroup.visible=s.index>=2&&s.fade>.01;regions.forEach((g,i)=>g.scale.setScalar(1+(s.index===2?.13*Math.sin(s.t*2.5-i):0)));
  packets.forEach(p=>{p.object.visible=(p.leg===0?s.index===1:s.index===2)&&s.fade>.01;p.object.position.copy(p.curve.getPoint((s.t*.28+p.n/3)%1)).add(offset);});
 }});model.userData.animate(0);return model;
}
