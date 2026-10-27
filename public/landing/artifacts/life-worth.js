import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {ACTIVITIES,EXAMPLE,LIFE_CYCLE,lifeMoment,lifeScreen} from './life-worth-screen.js';
export {ACTIVITIES,EXAMPLE,LIFE_CYCLE,lifeMoment};
const TAU=Math.PI*2;
export function createArtifact(T){
 const {root,materials:m,mesh,box,disk,ball,line,finish,texture}=medivoiceStudio(T);
 for(const [k,color] of Object.entries({navy:0x112d34,edge:0x213f45,brass:0xb38b4c,gold:0xe0bd77,stone:0xe9dfcb,sand:0xdcc69a,teal:0x427d76,cyan:0x70b9ba,amber:0xd6a344,cream:0xe2d4b4,coral:0xc47757}))m[k]=new T.MeshStandardMaterial({color,roughness:k==='brass'||k==='gold'?.30:.60,metalness:k==='brass'||k==='gold'?.78:.06});
 const stone=planningExhibitSurfaces(T).stone;m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.025;m.stone.roughness=.83;
 const brushed=texture('cloth');m.brass.bumpMap=brushed;m.brass.bumpScale=.002;m.navy.bumpMap=texture('paper');m.navy.bumpScale=.003;
 m.glass=new T.MeshPhysicalMaterial({color:0xbcd4d5,roughness:.08,metalness:0,transparent:true,opacity:.23,side:T.DoubleSide,depthWrite:false});
 const live=[],arcs=[],bars=[],days=[],grains=[];const group=(x,y,z,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
 function rounded(w,h,d,x,y,z,key,parent=root,r=.06){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:14}),key,parent);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,key,parent=root,r=.08){const o=rounded(w,d,h,x,y,z,key,parent,r);o.rotation.x=-Math.PI/2;return o;}
 function ring(r,t,x,y,z,key,parent=root){const o=mesh(new T.TorusGeometry(r,t,16,128),key,parent);o.position.set(x,y,z);return o;}
 function face(r,d,x,y,z,key,parent=root){const o=disk(r,d,x,y,z,key,parent);o.rotation.x=Math.PI/2;return o;}
 function label(value,w,h,x,y,z,parent=root,fg='#e3c58d',bg='#112d34',font='Georgia'){
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${c.height*.58}px ${font}`;ctx.fillText(value,c.width/2,c.height/2,c.width*.95);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,toneMapped:false,transparent:true,alphaTest:.03,depthWrite:false}));o.position.set(x,y,z);parent.add(o);return o;
 }
 function readout(w,h,parent,color='#193a3f'){
  const c=typeof document==='undefined'?null:document.createElement('canvas');if(c){c.width=640;c.height=200;}
  const map=c?new T.CanvasTexture(c):null;if(map){map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;}
  const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));parent.add(o);
  return {object:o,update(value){value=Math.round(value);if(o.userData.value===value)return;o.userData.value=value;if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,640,200);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='138px Georgia';ctx.fillText('$'+value.toLocaleString('en-US'),320,100,615);map.needsUpdate=true;}};
 }
 function arcGeometry(inner,outer,start,end,segments=64){const s=new T.Shape();s.absarc(0,0,outer,start,end,true);s.lineTo(Math.cos(end)*inner,Math.sin(end)*inner);s.absarc(0,0,inner,end,start,false);s.closePath();return new T.ExtrudeGeometry(s,{depth:.065,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,curveSegments:segments});}
 slab(8.6,4.5,.30,0,.01,0,'stone',root,.75);slab(8.5,4.4,.06,0,-.045,0,'brass',root,.72);
 rounded(2.8,.32,.028,0,.16,2.26,'brass',root,.07);label('Life-Worth Evaluator',2.60,.21,0,.16,2.325,root,'#f5e2b6','#b38b4c');
 for(const x of [-2.65,2.65]){face(.14,.08,x,.18,2.26,'brass');ring(.11,.008,x,.18,2.31,'gold');}
 // Precision clock with one proportional segment per activity (8+2+2+8+4=24).
 const dial=group(-1.0,2.34,-.55);const R=1.83;
 face(R+.09,.18,0,0,0,'brass',dial);face(R,.19,0,0,.045,'navy',dial);ring(R+.065,.029,0,0,.135,'gold',dial);ring(R-.025,.012,0,0,.155,'brass',dial);
 slab(2.8,.75,.11,-1,.36,-.55,'brass');for(const x of [-2.45,.45]){disk(.075,.40,x,.57,-.55,'brass');ball(.10,x,.79,-.55,'gold');}
 const colorKeys=['teal','cyan','amber','cream','coral'];let total=0;
 for(let i=0;i<5;i++){
  const start=Math.PI/2-total/24*TAU-.018,end=Math.PI/2-(total+ACTIVITIES[i].hours)/24*TAU+.018;
  mesh(arcGeometry(1.12,1.44,start,end),'edge',dial).position.z=.17;
  const attr={position:[],normal:[],uv:[]},ends=[];
  for(let q=0;q<ACTIVITIES[i].hours*4;q++){
   const a0=Math.PI/2-(total+q/4)/24*TAU-(q===0?.018:0),a1=Math.PI/2-(total+(q+1)/4)/24*TAU+(q===ACTIVITIES[i].hours*4-1?.018:0);
   const piece=arcGeometry(1.12,1.44,a0,a1,8);
   for(const key of Object.keys(attr))attr[key].push(...piece.attributes[key].array);ends.push(attr.position.length/3);piece.dispose();
  }
  const geo=new T.BufferGeometry();for(const [key,array] of Object.entries(attr))geo.setAttribute(key,new T.Float32BufferAttribute(array,key==='uv'?2:3));
  const a=mesh(geo,colorKeys[i],dial);a.position.z=.20;a.name=`life-activity-${i}`;arcs.push({object:a,ends,begin:total/24,end:(total+ACTIVITIES[i].hours)/24});live.push(a);total+=ACTIVITIES[i].hours;
 }
 for(let i=0;i<96;i++){const angle=Math.PI/2-i/96*TAU,r=1.65;const o=box(i%4===0?.017:.009,i%4===0?.095:.036,.008,Math.cos(angle)*r,Math.sin(angle)*r,.16,'gold',dial);o.rotation.z=angle-Math.PI/2;}
 for(const [n,x,y] of [['24',0,1.51],['6',1.52,0],['12',0,-1.51],['18',-1.52,0]])label(n,.22,.16,x,y,.18,dial);
 label('24h',.84,.42,0,.18,.19,dial);label('YOUR DAY',.85,.14,0,-.22,.19,dial,'#bba982','#112d34','Arial');
 const hand=group(0,0,.31,dial);hand.name='life-clock-hand';const needle=box(.025,1.53,.028,0,.67,0,'gold',hand);face(.105,.065,0,0,.025,'brass',hand);ring(.077,.008,0,0,.063,'gold',hand);live.push(hand);
 // Portrait dashboard, matching the artwork, anchored in a machined bracket.
 const tablet=group(2.50,2.37,-.48);tablet.rotation.x=0;tablet.rotation.y=0;
 rounded(3.10,3.95,.12,0,0,0,'brass',tablet,.16);rounded(3.04,3.89,.13,0,0,.035,'navy',tablet,.15);rounded(2.88,3.68,.015,0,0,.177,'cream',tablet,.10);
 const ui=lifeScreen(T);m.display=ui.material;const screen=mesh(new T.PlaneGeometry(2.76,3.56),'display',tablet);screen.position.z=.228;screen.castShadow=false;screen.name='life-dashboard';live.push(tablet);
 slab(3.05,.75,.08,2.50,.34,-.48,'brass');for(const x of [1.04,3.96]){disk(.045,.72,x,.74,-.57,'brass');ball(.085,x,1.12,-.57,'brass');}
 // Glass hourglass: sand transfers continuously on the common animation clock.
 const glass=group(-3.48,.38,.22);disk(.47,.10,0,.02,0,'brass',glass);disk(.47,.08,0,1.86,0,'brass',glass);
 for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;disk(.022,1.77,Math.cos(a)*.40,.96,Math.sin(a)*.40,'brass',glass);ball(.042,Math.cos(a)*.40,1.93,Math.sin(a)*.40,'gold',glass);}
 const profile=[[.32,.10],[.36,.20],[.34,.43],[.27,.65],[.10,.85],[.034,.94],[.10,1.03],[.27,1.23],[.34,1.47],[.36,1.68],[.32,1.78]].map(p=>new T.Vector2(...p));const shell=mesh(new T.LatheGeometry(profile,64),'glass',glass);shell.castShadow=shell.receiveShadow=false;
 const sandBottom=mesh(new T.ConeGeometry(.31,.35,48),'sand',glass);sandBottom.position.y=.28;sandBottom.name='life-sand-bottom';live.push(sandBottom);
 const sandTop=mesh(new T.ConeGeometry(.29,.35,48),'sand',glass);sandTop.position.y=1.42;sandTop.rotation.z=Math.PI;sandTop.name='life-sand-top';live.push(sandTop);
 const grainsGroup=group(0,0,0,glass);grainsGroup.name='life-sand-stream';for(let i=0;i<18;i++){const p=ball(.010,(i%3-1)*.009,.2+i*.04,0,'sand',grainsGroup);grains.push(p);}live.push(grainsGroup);
 // Daily result and monthly accumulation share the same example rate.
 const daily=group(-1.53,.65,1.18);daily.rotation.x=-.25;rounded(1.72,.79,.08,0,0,0,'brass',daily,.07);rounded(1.62,.69,.02,0,0,.09,'cream',daily,.05);label('DAILY',1.0,.14,0,.19,.125,daily,'#193a3f','#e2d4b4','Arial');
 const dailyNumber=group(0,-.10,.14,daily);dailyNumber.name='life-daily-result';const dailyReadout=readout(1.08,.35,dailyNumber);dailyReadout.object.name='life-daily-number';live.push(dailyNumber);
 slab(1.94,.72,.07,-1.53,.36,1.18,'brass');
 const tray=group(1.33,.40,1.03);slab(3.20,1.75,.08,0,0,0,'brass',tray,.14);slab(3.10,1.65,.045,0,.085,0,'navy',tray,.12);
 const monthLabel=group(-.88,.17,.45,tray);monthLabel.rotation.x=-Math.PI/2;label('MONTHLY',1,.16,0,.11,0,monthLabel,'#e3c58d','#112d34','Arial');const monthReadout=readout(1,.30,monthLabel,'#e3c58d');monthReadout.object.position.y=-.14;monthReadout.object.name='life-month-number';monthLabel.name='life-monthly-result';live.push(monthLabel);
 for(let i=0;i<5;i++){
  const x=-1.18+i*.56;disk(.15,.075,x,.17,-.46,'brass',tray);const b=group(x,.21,-.46,tray);b.name=`life-month-bar-${i}`;const h=(i+1)*.20;rounded(.24,h,.25,0,h/2,-.125,'teal',b,.025);bars.push(b);live.push(b);
 }
 for(let i=0;i<20;i++){const day=group(.0+(i%5)*.27,.15,.0+Math.floor(i/5)*.23,tray);day.name=`life-calendar-${i}`;slab(.21,.17,.035,0,0,0,'teal',day,.018);days.push(day);live.push(day);slab(.22,.18,.012,day.position.x,.13,day.position.z,'cream',tray,.018);}
 line([[-.63,.51,1.18],[-.32,.51,1.18],[-.32,.51,.92]],.032,'brass');
 // Store true geometry extents before batching; preserve only moving parts.
 root.updateMatrixWorld(true);const framingPoints=[];root.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));});
 for(const o of live)root.attach(o);const original=tablet.position.clone();const model=finish(13,live),offset=tablet.position.clone().sub(original);for(const p of framingPoints)p.add(offset);
 const arcRest=arcs.map(a=>a.object.position.clone()),sandTopY=sandTop.position.y,sandBottomY=sandBottom.position.y;
 let manual=null,timeOffset=0;
 const stories=[['Map your day','Five sample activities fill a complete 24-hour dial.'],['Choose your focus','Highlight eight hours of focus and two hours of learning.'],['Set an example rate','10 hours × an illustrative $20/hour = $200 per day.'],['See the monthly view','The same $200 day repeated 20 times gives an illustrative $4,000.']];
 Object.assign(model.userData,{artifactId:13,displayBase:false,framingPoints,studioProfile:'life-worth',contactFootprint:false,initialYaw:-.10,initialElevation:.22,autoOrbit:false,realTimeAnimation:true,cycleDuration:LIFE_CYCLE,
 setStep(index,elapsed=0){if(index===null){timeOffset=elapsed-(manual??elapsed-timeOffset);manual=null;}else manual=[5.8,10.5,19.5,26.5][Math.max(0,Math.min(3,index))];model.userData.animate(elapsed);},
 animate(time){const s=lifeMoment(manual??time-timeOffset);ui.update(s);Object.assign(screen.userData,{phase:s.index,daily:s.daily,monthly:s.monthly,hours:24});model.userData.story={index:s.index,step:`0${s.index+1} / 04`,title:stories[s.index][0],detail:stories[s.index][1],tone:'neutral'};
  arcs.forEach((a,i)=>{const p=Math.max(0,Math.min(1,(s.day-a.begin)/(a.end-a.begin)));a.object.visible=p>0;a.object.geometry.setDrawRange(0,p===1?a.ends.at(-1):(a.ends[Math.floor(p*a.ends.length)-1]??0));a.object.position.copy(arcRest[i]);a.object.position.z+=(s.index===1&&i<2?.065+.02*Math.sin(s.t*3):0);a.object.material.emissive.setHex(i<2&&s.index===1?0x143e38:0x000000);a.object.material.emissiveIntensity=.25;});
  hand.rotation.z=-(s.index===0?s.day*TAU:TAU+(s.t-7)*.22);
  const sand=s.t/LIFE_CYCLE;sandTop.scale.setScalar(.85-.48*sand);sandTop.position.y=sandTopY-.10*sand;sandBottom.scale.set(1,.5+.5*sand,1);sandBottom.position.y=sandBottomY-.07*(1-sand);grains.forEach((g,i)=>{g.position.y=.21+((1-s.t*.7+i/18)%1+1)%1*.70;});
  dailyNumber.visible=s.index>=2;dailyReadout.update(s.daily*s.dailyProgress);monthReadout.update(s.monthly*s.monthProgress);
  monthLabel.visible=s.index===3;bars.forEach((b,i)=>{const p=Math.max(0,Math.min(1,s.monthProgress*5-i));b.scale.y=Math.max(.001,p);});days.forEach((d,i)=>{d.visible=i<Math.floor(s.monthProgress*20);});
 }});model.userData.animate(0);return model;
}
