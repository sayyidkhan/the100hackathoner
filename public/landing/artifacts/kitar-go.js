import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {kitarOak} from './kitar-surfaces.js';
import {kitarScreen} from './kitar-screen.js';
import {kitarMoment,KITAR_CYCLE} from './kitar-timing.js';

export function createArtifact(T){
 const {root,materials:m,mesh,box,disk,ball,line,texture,finish}=medivoiceStudio(T),live=[];
 for(const [key,color] of Object.entries({stone:0xe3ddc9,ivory:0xf0e8d5,oak:0xb58c5d,dark:0x193d31,edge:0x30362e,brass:0xb9a06c,mint:0x83ceaa,leaf:0x567045,leaf2:0x789159,soil:0x534c38,pet:0xb7d9d5,cap:0x4d9670}))m[key]=new T.MeshStandardMaterial({color,roughness:key==='brass'?.3:.65,metalness:key==='brass'?.8:key==='edge'?.45:0});
 const stone=planningExhibitSurfaces(T).stone,wood=kitarOak(T);wood.repeat.set(1,1);
 m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.022;m.oak.map=wood;m.oak.bumpMap=wood;m.oak.bumpScale=.018;m.mint.emissive.setHex(0x458a66);m.mint.emissiveIntensity=.5;
 m.pet=new T.MeshPhysicalMaterial({color:0xb2d4d5,metalness:.05,roughness:.18,transmission:.48,thickness:.13,ior:1.46,clearcoat:1,side:T.DoubleSide});
 function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.08){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:18}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,key,p=root,r=.12){const o=round(w,d,h,x,y,z,key,p,r);o.rotation.x=-Math.PI/2;return o;}
 function label(txt,w,h,x,y,z,p=root,color='#e4d5ae',font='Arial'){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const cx=c.getContext('2d');cx.fillStyle=color;cx.font=`600 ${c.height*.66}px ${font}`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(txt,512,c.height/2,990);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 function torus(r,t,x,y,z,key,p=root){const o=mesh(new T.TorusGeometry(r,t,8,48),key,p);o.position.set(x,y,z);return o;}
 function flatLabel(txt,w,h,x,y,z,color='#425645'){const g=group(x,y,z);g.rotation.x=-Math.PI/2;label(txt,w,h,0,0,.005,g,color);}
 function plant(x,y,z,height,seed=1){const g=group(x,y,z);slab(.82,.74,.65,0,0,0,'stone',g);slab(.69,.61,.018,0,.66,0,'soil',g);
 for(let j=0;j<7;j++){const a=j*2.399+seed,r=.24+Math.sin(j*13+seed)*.09,top=.86+height*(.55+.35*(Math.sin(j*7+seed)+1)/2);line([[0,.66,0],[Math.cos(a)*r,top*.73,Math.sin(a)*r],[Math.cos(a)*r*1.6,top,Math.sin(a)*r*1.6]],.014,'oak',g);
 for(let k=0;k<5;k++){const f=.4+k*.12,xx=Math.cos(a)*r*f*1.6,yy=.66+(top-.66)*f,zz=Math.sin(a)*r*f*1.6;const leaf=mesh(new T.SphereGeometry(1,10,7),j%2?'leaf':'leaf2',g);leaf.position.set(xx+Math.cos(a+k)*.12,yy,zz+Math.sin(a+k)*.12);leaf.scale.set(.105,.29,.035);leaf.rotation.set(.55*Math.sin(k+a),a+k,.45*Math.cos(a+k));}}
 return g;}
 slab(10.4,5.65,.4,0,0,0,'stone',root,.52);slab(10.22,5.47,.04,0,-.03,0,'brass',root,.5);
 for(let i=-5;i<=5;i++)box(.012,.008,4.88,i*.91,.425,0,'ivory');for(let i=-2;i<=2;i++)box(9.7,.008,.012,0,.426,i*.95,'ivory');
 round(3.1,.44,.03,0,.18,2.85,'brass');round(2.97,.34,.025,0,.18,2.89,'dark');label('Kitar-GO',2.75,.26,0,.18,2.937,root,'#eee1bd');
 // Mall backdrop: a low limestone wall, oak screens, steel handrail and planting.
 box(6.5,2.75,.17,1.27,1.80,-1.65,'stone');
 for(const xx of [-1.45,3.85]){for(let j=0;j<7;j++)box(.095,3.65,.13,xx+j*.16,2.35,-1.94,'oak');}
 for(const xx of [-1.4,.2,1.8,3.7]){line([[xx,1.15,-1.52],[xx,3.50,-1.52]],.022,'brass');}
 line([[-1.5,3.50,-1.52],[4.18,3.50,-1.52]],.033,'brass');
 plant(-2.24,.43,-.85,1.8,2);plant(4.45,.43,-1.3,2.5,4);plant(-4.65,.43,1.16,.65,1);plant(4.5,.43,1.37,.66,8);
 // A large legible phone retaining the mint and cream prototype identity.
 const phone=group(-3.36,2.89,.04);phone.rotation.y=.07;round(2.5,4.64,.16,0,0,0,'brass',phone,.22);round(2.4,4.54,.17,0,0,.04,'edge',phone,.20);
 const ui=kitarScreen(T),screen=new T.Mesh(new T.PlaneGeometry(2.16,4.22),ui.material);screen.position.z=.237;screen.name='kitar-screen';phone.add(screen);round(.62,.13,.018,0,2.04,.25,'edge',phone,.06);ball(.027,.20,2.04,.29,'pet',phone);box(.035,.4,.08,-1.28,.6,.08,'brass',phone);slab(2.7,.82,.14,-3.36,.43,.13,'brass');live.push(phone);
 // Three real hollow bins, not solid tops with painted circles. Openings use Shape holes.
 const binXs=[-.84,.72,2.28],binY=.44,binZ=-.42,topY=2.56;
 for(let i=0;i<3;i++){const x=binXs[i],g=group(x,binY,binZ);const w=1.42,d=1.35,h=2.12;
 box(w,h,.07,0,h/2,-d/2,'edge',g);box(.07,h,d,-w/2,h/2,0,'edge',g);box(.07,h,d,w/2,h/2,0,'edge',g);box(w,.07,d,0,.035,0,'edge',g);box(w-.09,h-.06,.08,0,h/2,d/2,'edge',g);box(w-.18,h-.18,.035,0,h/2,d/2+.051,'oak',g);
 const shape=new T.Shape();shape.moveTo(-w/2,-d/2);shape.lineTo(w/2,-d/2);shape.lineTo(w/2,d/2);shape.lineTo(-w/2,d/2);shape.closePath();const hole=new T.Path();hole.absarc(0,0,.335,0,Math.PI*2,true);shape.holes.push(hole);const lid=mesh(new T.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:48}),'oak',g);lid.rotation.x=-Math.PI/2;lid.position.y=h;
 const rim=torus(.338,.018,0,h+.077,0,'edge',g);rim.rotation.x=-Math.PI/2;
 const chute=mesh(new T.CylinderGeometry(.332,.332,.45,48,1,true),'edge',g);chute.position.y=h-.17;chute.material.side=T.DoubleSide;
 for(const side of [-1,1])box(.035,h+.06,.04,side*(w/2-.025),h/2,d/2+.071,'brass',g);
 label(['GENERAL','CANS / PLASTIC','PAPER'][i],1.18,.16,0,.89,d/2+.085,g,'#22372b');label(i===1?'♻':i===0?'○':'▤',.52,.48,0,1.37,d/2+.086,g,'#284635');
 box(.15,.025,.05,.42,.35,d/2+.08,'brass',g);ball(.024,.42,.35,d/2+.12,'edge',g);
 }
 // The navigation route ends at the selected bin. Its moving marker never wanders.
 const routePoints=[[-2.7,.47,1.65],[-1.9,.47,2.03],[-.7,.47,1.85],[.3,.47,1.35],[.72,.47,.74]],curve=new T.CatmullRomCurve3(routePoints.map(p=>new T.Vector3(...p)));
 line(routePoints,.027,'mint');
 const nav=group();const halo=torus(.15,.027,0,.02,0,'mint',nav);halo.rotation.x=-Math.PI/2;disk(.09,.016,0,.02,0,'ivory',nav);nav.name='kitar-route-marker';live.push(nav);
 const arrows=[];for(let i=0;i<3;i++){const g=group(-1.1+i*.38,.48,1.91-i*.12);g.rotation.y=.38;line([[-.12,0,.11],[.04,0,0],[-.12,0,-.11]],.035,'mint',g);arrows.push(g);live.push(g);}
 const scan=group(.72,2.65,-.42);scan.name='kitar-bin-scan';for(const a of [-1,1])for(const b of [-1,1]){line([[a*.57,0,b*.51],[a*.57,0,b*.29]],.027,'mint',scan);line([[a*.57,0,b*.51],[a*.35,0,b*.51]],.027,'mint',scan);}live.push(scan);
 // Ribbed PET bottle, radius .22 fits through the .335 opening, with an opaque cap.
 const bottle=group(.72,3.15,-.42);bottle.name='kitar-bottle';
 const profile=[[.06,0],[.18,.025],[.22,.08],[.225,.18],[.21,.28],[.22,.37],[.21,.46],[.22,.55],[.21,.64],[.21,.77],[.18,.85],[.105,.95],[.095,1.06]].map(([r,y])=>new T.Vector2(r,y));mesh(new T.LatheGeometry(profile,48),'pet',bottle);
 for(let i=0;i<6;i++){const r=torus(.218,.012,0,.18+i*.1,0,'pet',bottle);r.rotation.x=-Math.PI/2;}
 disk(.104,.12,0,1.1,0,'cap',bottle);for(let i=0;i<24;i++){const a=i*Math.PI/12;box(.012,.095,.012,Math.cos(a)*.104,1.1,Math.sin(a)*.104,'mint',bottle);}
 disk(.225,.20,0,.62,0,'ivory',bottle);label('PET',.30,.13,0,.63,.232,bottle,'#3c6d53');live.push(bottle);
 const bottleScan=group(.72,3.72,-.13);bottleScan.name='kitar-bottle-scan';for(const a of [-1,1])for(const b of [-1,1]){line([[a*.32,b*.66,0],[a*.32,b*.44,0]],.018,'mint',bottleScan);line([[a*.32,b*.66,0],[a*.14,b*.66,0]],.018,'mint',bottleScan);}live.push(bottleScan);
 // Reward plaque: static lettering, a leaf medal and progress lights awakened by deposit.
 const reward=group(3.70,1.68,1.26);reward.rotation.y=-.12;round(1.43,2.27,.11,0,0,0,'brass',reward,.13);round(1.33,2.17,.10,0,0,.055,'dark',reward,.11);
 for(let i=0;i<3;i++)label(['RECYCLE.','REWARD.','REPEAT.'][i],1.12,.18,0,.03-i*.25,.18,reward);
 const medal=disk(.36,.065,0,.67,.18,'brass',reward);medal.rotation.x=Math.PI/2;
 const leaf=mesh(new T.SphereGeometry(1,16,12),'ivory',reward);leaf.scale.set(.12,.24,.024);leaf.rotation.z=-.52;leaf.position.set(0,.67,.23);line([[-.1,.50,.26],[.12,.86,.26]],.012,'brass',reward);
 const lamps=[];for(let i=0;i<3;i++){const g=group(-.33+i*.33,-.85,.205,reward);ball(.052,0,0,0,'mint',g);lamps.push(g);}slab(1.6,.65,.17,3.7,.43,1.27,'brass');live.push(reward);
 // Fit the actual silhouettes rather than the empty upper corners of a huge box.
 root.updateMatrixWorld(true);const framing=[];
 for(const child of root.children){const b=new T.Box3().setFromObject(child);if(!b.isEmpty())for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framing.push(new T.Vector3(x,y,z));}
 const anchor=group();live.push(anchor);const model=finish(28,live),offset=anchor.position.clone();model.remove(anchor);const bottleBase=bottle.position.clone(),scanBase=scan.position.clone(),rewardBase=reward.position.clone(),v=new T.Vector3();
 Object.assign(model.userData,{artifactId:28,displayBase:false,contactFootprint:false,studioProfile:'kitar',groundLevel:0,framingPoints:framing.map(p=>p.add(offset)),cameraFitSway:0,framingTargetY:2.45,initialYaw:.19,initialElevation:.29,autoOrbit:false,realTimeAnimation:true,cycleDuration:KITAR_CYCLE,
 animate(time){const s=kitarMoment(time);ui.update(s);screen.userData.phase=s.phase;curve.getPoint(s.route,v);nav.position.copy(v).add(offset);nav.visible=s.t>=4&&s.t<15;
 arrows.forEach((g,i)=>g.visible=s.t>=4+i*.6&&s.t<15);scan.visible=s.arrived&&s.t<24;scan.position.copy(scanBase);scan.position.y+=s.phase===2?.018*Math.sin(s.t*3):0;
 bottle.position.copy(bottleBase);bottle.position.y-=s.drop*2.30;bottle.rotation.z=0;bottle.visible=s.t>=12&&s.t<19;
 bottleScan.visible=s.detected&&s.t<16;bottleScan.scale.setScalar(1);
 reward.position.copy(rewardBase);lamps.forEach((g,i)=>g.visible=s.reward&&s.t>=19+i*.45&&s.fade>.02);
 model.userData.story={...s};
 }});model.userData.animate(0);return model;
}
export default createArtifact;
