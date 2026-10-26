import {earlyStudio,ease} from './early-exhibit-studio.js';
import {dustbinSurfaces} from './uncle-dustbin-surfaces.js';
import {buildDustbinHouse} from './uncle-dustbin-house.js';
import {buildDustbinRooms} from './uncle-dustbin-rooms.js';
import {buildDustbinResidents} from './uncle-dustbin-residents.js';

export const DUSTBIN_CYCLE=48;
export function dustbinMoment(time){
 const t=((time%DUSTBIN_CYCLE)+DUSTBIN_CYCLE)%DUSTBIN_CYCLE;
 let progress=0,phase='ready';
 if(t>=2&&t<10){progress=.25*ease((t-2)/8);phase='study';}
 else if(t>=10&&t<14){progress=.25;phase='study-stop';}
 else if(t>=14&&t<22){progress=.25+.25*ease((t-14)/8);phase='living-room';}
 else if(t>=22&&t<26){progress=.5;phase='sofa-stop';}
 else if(t>=26&&t<35){progress=.5+.25*ease((t-26)/9);phase='kitchen';}
 else if(t>=35&&t<39){progress=.75;phase='kitchen-stop';}
 else if(t>=39){progress=.75+.25*ease((t-39)/9);phase='return';}
 return {t,progress,phase};
}
export function createArtifact(T){
 const k=earlyStudio(T),{root,m,mesh,box,disk,ball,line,group,rounded,slab,ring,finish,batch}=k;
 dustbinSurfaces(T,m);
 // Residents are reached through the hallway; no path cuts across a partition.
 const paths=[
  [[0,4.85],[0,3.4],[-.2,2.25],[-1.4,2.05],[-2.65,2]],
  [[-2.65,2],[-1.4,2.05],[-.10,2.2],[0,.8],[-.05,-.9],[-1.3,-.9],[-2.40,-.80]],
  [[-2.40,-.80],[-1.3,-.9],[.1,-.95],[1.1,-.85],[1.85,-.50]],
  [[1.85,-.50],[1.1,-.85],[.05,-.9],[0,.8],[0,3.0],[0,4.85]]
 ];
 const routes=paths.map(points=>{const c=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,.265,z)),false,'centripetal');c.arcLengthDivisions=500;return c;});
 const lengths=routes.map(c=>c.getLength()),length=lengths.reduce((a,b)=>a+b,0),robotScale=.58,wheelRadius=.25,halfTrack=.50;
 const heading=(i,u)=>{const v=routes[i].getTangentAt(u);return Math.atan2(v.x,v.z);};
 const turn=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*ease(t);
 const house=buildDustbinHouse(T,k),plan=buildDustbinRooms(T,k,house),residents=buildDustbinResidents(T,k,house),{obstacles,rod}=house;
 function cylinder(r,h,x,y,z,color,parent=root){return disk(r,h,x,y,z,color,parent);}
 function text(value,w,x,y,z,parent=root,color='#925636'){
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.height=128;let cx=c.getContext('2d');cx.font='600 80px Arial';c.width=Math.ceil(cx.measureText(value).width+20);cx=c.getContext('2d');cx.font='600 80px Arial';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle=color;cx.fillText(value,c.width/2,64);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
  const p=new T.Mesh(new T.PlaneGeometry(w,w*128/c.width),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));p.position.set(x,y,z);p.userData.noShadow=true;parent.add(p);
 }
 // Robot local origin is the tyre contact plane. All payload travels with it.
 const robot=group();robot.name='uncle-dustbin-robot';robot.scale.setScalar(robotScale);
 rounded(1.02,.30,.79,0,wheelRadius+.06,0,'blue',robot,.055);
 // Chassis perforations and fastening heads read as hardware, not cartoon eyes.
 for(let i=0;i<7;i++){const p=cylinder(.023,.012,-.42+i*.14,wheelRadius+.055,.408,'black',robot);p.rotation.x=Math.PI/2;}
 for(const x of [-.45,.45])for(const z of [-.34,.34]){const s=cylinder(.027,.015,x,wheelRadius+.223,z,'silver',robot);}
 const wheels=[];
 for(const side of [-1,1]){
  const wheel=group(side*halfTrack,wheelRadius,0,robot);wheel.name=side<0?'dustbin-wheel-left':'dustbin-wheel-right';
  const tyre=cylinder(wheelRadius,.16,0,0,0,'rubber',wheel);tyre.rotation.z=Math.PI/2;
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2;for(const x of [-.045,.045]){const tread=box(.085,.022,.053,x,Math.cos(a)*(wheelRadius+.004),Math.sin(a)*(wheelRadius+.004),'rubber',wheel);tread.rotation.x=a;tread.rotation.z=x*.9;}}
  const hub=cylinder(wheelRadius*.75,.018,side*.087,0,0,'cream',wheel);hub.rotation.z=Math.PI/2;
  const axle=cylinder(.045,.026,side*.103,0,0,'silver',wheel);axle.rotation.z=Math.PI/2;
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const screw=cylinder(.018,.018,side*.104,Math.cos(a)*wheelRadius*.54,Math.sin(a)*wheelRadius*.54,'silver',wheel);screw.rotation.z=Math.PI/2;}
  wheels.push(wheel);
 }
 const caster=ball(.075,0,.075,.30,'rubber',robot);caster.scale.x=.75;rod([0,.10,.30],[0,.24,.30],.023,'silver',robot);
 // Exposed PCB, acrylic standoffs, chip packages and wire looms.
 slab(.86,.65,.035,0,.58,-.02,'pcb',robot,.035);
 for(const x of [-.35,.35])for(const z of [-.24,.24]){rod([x,.57,z],[x,.82,z],.018,'silver',robot);cylinder(.028,.02,x,.84,z,'silver',robot);}
 for(let i=0;i<3;i++){box(.20,.07,.15,-.23+i*.23,.64,-.05,'black',robot);for(let pin=0;pin<6;pin++)box(.017,.019,.029,-.30+i*.23+pin*.027,.63,.04,'silver',robot);}
 for(let i=0;i<4;i++){cylinder(.032,.095,.26,.665,-.20+i*.10,'black',robot);cylinder(.023,.009,.26,.715,-.20+i*.10,'silver',robot);}
 for(let i=0;i<3;i++)line([[-.30,.62,.18],[-.41,.75,.20],[-.36,.80,-.12],[-.22,.67,-.18]],.007,i===0?'coral':i===1?'black':'page',robot);
 const acrylic=slab(.94,.72,.025,0,.825,-.02,'acrylic',robot,.04);acrylic.castShadow=false;
 ball(.017,-.30,.67,.20,'light',robot);
 const eyes=group(0,.51,.46,robot);rounded(.56,.23,.035,0,0,0,'blue',eyes,.018);
 for(const x of [-.16,.16]){
  const can=cylinder(.104,.075,x,0,.04,'silver',eyes);can.rotation.x=Math.PI/2;
  const sensor=cylinder(.081,.008,x,0,.083,'black',eyes);sensor.rotation.x=Math.PI/2;
  ring(.093,.009,x,0,.089,'silver',eyes);
  for(let row=-3;row<=3;row++)for(let col=-3;col<=3;col++)if(row*row+col*col<10)ball(.003,x+col*.018,row*.018,.091,'silver',eyes);
 }
 // Four rigid diagonal struts bear the oversize open cardboard bin.
 const payload=group(0,0,0,robot);payload.name='dustbin-carried-payload';
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const a=new T.Vector3(sx*.41,.53,sz*.26),b=new T.Vector3(sx*.72,1.28,sz*.48),delta=b.clone().sub(a);
  const strut=box(.058,delta.length(),.062,0,0,0,'oak',payload);strut.position.copy(a).addScaledVector(delta,.5);strut.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  for(const p of [a,b]){const bolt=cylinder(.032,.022,p.x,p.y,p.z+sz*.038,'silver',payload);bolt.rotation.x=Math.PI/2;}
 }
 const bin=group(0,1.30,0,payload);bin.name='dustbin-open-bin';
 slab(1.82,1.34,.055,0,.028,0,'cardboard',bin,.045);slab(1.70,1.22,.015,0,.065,0,'kraft',bin,.03);
 for(const side of [-1,1]){
  rounded(1.82,.68,.045,0,.37,side*.65,'cardboard',bin,.025);
  rounded(1.72,.62,.015,0,.37,side*.621,'kraft',bin,.018);
  const panel=rounded(1.28,.68,.045,side*.89,.37,0,'cardboard',bin,.025);panel.rotation.y=Math.PI/2;
  const liner=rounded(1.20,.62,.014,side*.861,.37,0,'kraft',bin,.018);liner.rotation.y=Math.PI/2;
  slab(1.86,.055,.025,0,.72,side*.65,'cardboard',bin,.012);slab(.055,1.34,.025,side*.89,.72,0,'cardboard',bin,.012);
 }
 text('UNCLE DUSTBIN',1.27,0,.46,.682,bin);
 for(const x of [-.065,.065])ring(.055,.006,x,.26,.681,'black',bin);line([[-.014,.26,.682],[0,.27,.682],[.014,.26,.682]],.005,'black',bin);
 for(const side of [-1,1]){const moustache=ball(.06,side*.043,.15,.681,'black',bin);moustache.scale.set(1,.38,.06);moustache.rotation.z=side*.3;}
 const waste=group(0,0,0,bin);waste.name='dustbin-waste';
 // Three distinct pieces of rubbish begin in residents' hands and stay in the bin after collection.
 const rubbish=residents.map((resident,i)=>{
  const g=group();g.name=`dustbin-transfer-${resident.name}`;
  if(i===1){
   mesh(new T.LatheGeometry([new T.Vector2(.052,0),new T.Vector2(.073,.16),new T.Vector2(.064,.16),new T.Vector2(.047,.009)],32),'kraft',g);
   ring(.072,.005,0,.16,0,'cream',g).rotation.x=Math.PI/2;
  }else if(i===2){
   const bottle=mesh(new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.05,.01),new T.Vector2(.055,.14),new T.Vector2(.026,.18),new T.Vector2(.024,.23),new T.Vector2(0,.23)],28),'sage',g);
   cylinder(.029,.025,0,.235,0,'cream',g);cylinder(.056,.07,0,.10,0,'page',g);
  }else{
   const geo=new T.IcosahedronGeometry(.105,2),v=geo.attributes.position;
   for(let j=0;j<v.count;j++){const x=v.getX(j),y=v.getY(j),z=v.getZ(j),a=1+.13*Math.sin(x*83+y*49+z*61);v.setXYZ(j,x*a,y*a,z*a);}geo.computeVertexNormals();mesh(geo,'page',g);
  }
  batch(g);return g;
 });
 // Batch the rigid robot while preserving separate spinning wheels and payload.
 const rbLabels=[];robot.traverse(o=>{if(o.userData.noShadow)rbLabels.push(o);});
 robot.updateMatrixWorld(true);rbLabels.forEach(o=>robot.attach(o));
 // Keep the assembly hierarchy for cargo tests and batched geometry for draw calls.
 for(const wheel of wheels)batch(wheel);batch(payload);batch(eyes);
 root.updateMatrixWorld(true);rubbish.forEach((item,i)=>item.position.copy(residents[i].hand.getWorldPosition(new T.Vector3())));
 const before=robot.getWorldPosition(new T.Vector3());
 const out=finish(29,[robot,...residents.map(r=>r.g),...rubbish]);const offset=robot.position.clone().sub(before);
 const framing=[];for(const x of [-5.35,5.35])for(const z of [-3.95,6.65])for(const y of [0,3.33])framing.push(new T.Vector3(x,y,z).add(offset));
 Object.assign(out.userData,{studioProfile:'dustbin',initialYaw:-.20,initialElevation:.78,cycle:DUSTBIN_CYCLE,framingPoints:framing,routeLength:length,wheelRadius,robotScale,obstacles,doors:plan.doors,rooms:plan.rooms,floorBounds:{minX:-5.20,maxX:5.20,minZ:-3.80,maxZ:6.40},robotHalfExtents:[.94*robotScale,.70*robotScale],floorLevel:.265+offset.y});
 const initialYaw=heading(0,0),stops=[10,22,35];
 const stories={ready:['Uncle Dustbin is ready','A little help around the house. Three residents, one visiting bin.'],study:['First stop: the bedroom','Through the bedroom doorway to the resident at their desk.'],'study-stop':['Paper collected in the bedroom','Reach over, let go. The paper drops into the waiting bin.'],'living-room':['Across the living room','Back through the hallway to the resident in the living room.'],'sofa-stop':['A cup from the sofa','The bin waits while the resident drops in their used cup.'],kitchen:['On to the kitchen','The robot crosses the hallway and enters through the kitchen doorway.'],'kitchen-stop':['One more collection','A resident adds an empty bottle before the robot heads home.'],return:['Three stops. One tidy home.','Paper, cup and bottle travel together back to the charging spot.']};
 out.userData.animate=time=>{
  const s=dustbinMoment(time);
  const leg={ready:0,study:0,'study-stop':0,'living-room':1,'sofa-stop':1,kitchen:2,'kitchen-stop':2,return:3}[s.phase];
  let u=s.phase==='ready'?0:s.phase.endsWith('-stop')?1:s.phase==='return'?ease((s.t-39)/8):s.progress*4-leg;
  const p=routes[leg].getPointAt(u);let yaw=heading(leg,u);
  if(s.phase.endsWith('-stop'))yaw=turn(yaw,heading(leg+1,0),(s.t-[13.2,25.2,38.2][leg])/.8);
  if(s.phase==='return'&&s.t>47)yaw=turn(yaw,initialYaw,s.t-47);
  const travelled=lengths.slice(0,leg).reduce((a,b)=>a+b,0)+u*lengths[leg],progress=travelled/length;
  robot.position.copy(p).add(offset);robot.rotation.y=yaw;
  // Arc distance and differential steering keep the wheels rolling with the chassis.
  wheels.forEach((wheel,i)=>{wheel.rotation.x=progress*length/(wheelRadius*robotScale)-(i===0?-1:1)*(yaw-initialYaw)*halfTrack/wheelRadius;});
  out.updateMatrixWorld(true);
  let count=0;
  residents.forEach((resident,i)=>{
   const elapsed=s.t-stops[i],release=1.65,land=2.25;
   // The hand reaches over the near rim, then withdraws after releasing its item.
   const near=resident.g.position.clone().sub(robot.position);near.y=0;near.normalize().multiplyScalar(.34);
   const drop=robot.position.clone().add(near);drop.y=robot.position.y+robotScale*2.23;
   const target=resident.g.worldToLocal(out.localToWorld(drop.clone()));
   let reach=elapsed<0?0:elapsed<release?ease(elapsed/1.3):1-ease((elapsed-1.9)/1.3);
   resident.pose(target,reach);out.updateMatrixWorld(true);
   const item=rubbish[i];
   if(elapsed<release){item.position.copy(out.worldToLocal(resident.hand.localToWorld(new T.Vector3(0,.035,.035))));item.rotation.set(0,resident.g.rotation.y,elapsed>0?-.15*reach:0);item.userData.collected=false;}
   else{
    count++;item.userData.collected=true;
    const local=new T.Vector3([-.40,.12,.44][i],1.30+[.18,.13,.13][i],[.20,-.16,.20][i]);
    const landing=out.worldToLocal(robot.localToWorld(local));
    if(elapsed<land){
     resident.pose(target,1);out.updateMatrixWorld(true);const start=out.worldToLocal(resident.hand.localToWorld(new T.Vector3(0,.035,.035)));resident.pose(target,reach);
     const fall=(elapsed-release)/(land-release);item.position.copy(start).lerp(landing,fall*fall);item.rotation.set(fall*.32,yaw,fall*.36);
    }else{item.position.copy(landing);item.rotation.set(i===1?.20:.05,yaw,i===2?.55:.15);}
   }
  });
  const [title,detail]=stories[s.phase];out.userData.story={index:Object.keys(stories).indexOf(s.phase),step:'',title,detail,phase:s.phase};
  out.userData.routePose={x:p.x,z:p.z,progress,yaw};out.userData.collectedCount=count;
 };
 out.userData.animate(0);return out;
}
