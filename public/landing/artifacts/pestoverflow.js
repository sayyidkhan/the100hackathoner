import {earlyStudio,ease} from './early-exhibit-studio.js';
import {pestMouse} from './pestoverflow-mouse.js';
import {pestSurfaces} from './pestoverflow-surfaces.js';
import {createPestScreen} from './pestoverflow-app-screen.js';

export const PESTOVERFLOW_CYCLE=18;
export function pestMoment(time){
 const t=((time%PESTOVERFLOW_CYCLE)+PESTOVERFLOW_CYCLE)%PESTOVERFLOW_CYCLE;
 const phase=t<4?'monitoring':t<5.2?'detected':t<6.5?'sending':t<13?'notified':'reset';
 return {t,phase,detected:t>=4&&t<16.5,notified:t>=6.5&&t<16.5,
  travel:t<4?ease(t/4):1,gait:t<4?Math.sin(Math.PI*t/4):0,
  opacity:t<.6?ease(t/.6):1-ease((t-13)/3.5)};
}

export function createArtifact(T){
 const k=earlyStudio(T),{root,m,mesh,box,disk,ball,line,group,rounded,slab,ring,ellipsoid,finish}=k;
 const surfaces=pestSurfaces(T);
 for(const [name,repeat,bumpScale] of [['oak',[1.25,.68],.009],['stone',[.68,.68],.010],['plaster',[.65,.65],.006]]){
  for(const map of Object.values(surfaces[name]))if(map?.isTexture)map.repeat.set(...repeat);
  m[name]=new T.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,map:surfaces[name].map,bumpMap:surfaces[name].bumpMap,roughnessMap:surfaces[name].roughnessMap,bumpScale});
 }
 Object.assign(m,{
  recess:new T.MeshStandardMaterial({color:0x2b2018,roughness:.9}),
  grout:new T.MeshStandardMaterial({color:0xb9ad98,roughness:.95}),
  graphite:new T.MeshPhysicalMaterial({color:0x171b1d,roughness:.28,metalness:.75,clearcoat:.4}),
  steel:new T.MeshStandardMaterial({color:0x929795,roughness:.28,metalness:.92}),
  brass:new T.MeshStandardMaterial({color:0xc09a5f,roughness:.26,metalness:.85}),
  lens:new T.MeshPhysicalMaterial({color:0x06141a,roughness:.08,metalness:.3,clearcoat:1}),
  porcelain:new T.MeshStandardMaterial({color:0xddd7c9,roughness:.48}),
  leaf:new T.MeshStandardMaterial({color:0x3d5535,roughness:.78,side:T.DoubleSide}),
  glow:new T.MeshBasicMaterial({color:0xffad75,toneMapped:false}),
  coralSignal:new T.MeshBasicMaterial({color:0xff7456,toneMapped:false}),
 });
 // Continuous architectural foundation: no trophy pedestal or empty mounting plates.
 slab(8.0,4.05,.23,0,.115,0,'stone',root,.25);
 slab(7.86,3.91,.022,0,.241,0,'stone',root,.21);
 const floorY=.278;
 const kitchen=group(-1.52,0,-.20);kitchen.name='pestoverflow-kitchen';
 rounded(4.72,2.53,.16,0,1.528,-1.61,'plaster',kitchen,.025);
 rounded(.15,2.53,3.02,-2.29,1.528,-.17,'plaster',kitchen,.018);
 // Shadow gaps and individually laid limestone tiles give the room physical depth.
 for(let ix=0;ix<6;ix++)for(let iz=0;iz<4;iz++){
  const tile=slab(.746,.732,.018,-1.90+ix*.755,.256,-1.18+iz*.742,'stone',kitchen,.008);
  tile.rotation.y=(ix+iz)%2?Math.PI:0;
 }
 box(4.55,.095,.035,0,.326,-1.51,'stone',kitchen);
 box(.035,.095,2.94,-2.19,.326,-.17,'stone',kitchen);
 // Full-size joinery with flush bookmatched wood, dark reveals and an inset plinth.
 const cabinet=group(-.02,.29,-1.04,kitchen);cabinet.name='pestoverflow-cabinet-bank';
 rounded(4.19,.94,.81,0,.50,0,'recess',cabinet,.015);
 box(4.12,.10,.70,0,.065,-.04,'recess',cabinet);
 for(let i=0;i<5;i++){
  const x=-1.65+i*.825;
  const front=rounded(.80,.84,.045,x,.54,.433,'oak',cabinet,.012);
  // Pulls are fine metal details, with a restrained horizontal finger recess.
  box(.65,.012,.014,x,.914,.467,'recess',cabinet);
  line([[x-.15,.915,.483],[x+.15,.915,.483]],.007,'brass',cabinet);
  front.userData.joinery=true;
 }
 // A true opening in the counter surrounds the recessed steel basin.
 const counterShape=new T.Shape();counterShape.moveTo(-2.16,-.49);counterShape.lineTo(2.16,-.49);counterShape.lineTo(2.16,.49);counterShape.lineTo(-2.16,.49);counterShape.closePath();
 const hole=new T.Path();hole.moveTo(-1.33,-.27);hole.lineTo(-1.33,.28);hole.lineTo(-.49,.28);hole.lineTo(-.49,-.27);hole.closePath();counterShape.holes.push(hole);
 const countertop=mesh(new T.ExtrudeGeometry(counterShape,{depth:.095,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:3}),'stone',cabinet);
 countertop.rotation.x=-Math.PI/2;countertop.position.y=.98;
 slab(.82,.54,.022,-.91,.935,0,'steel',cabinet,.055);
 for(const x of [-1.325,-.495])box(.018,.10,.55,x,.982,0,'steel',cabinet);
 for(const z of [-.265,.275])box(.83,.10,.018,-.91,.982,z,'steel',cabinet);
 disk(.045,.004,-.91,.951,0,'recess',cabinet);ring(.044,.003,-.91,.954,0,'steel',cabinet).rotation.x=-Math.PI/2;
 line([[-.90,1.05,-.39],[-.90,1.42,-.39],[-.90,1.51,-.31],[-.90,1.51,-.13],[-.90,1.41,-.10]],.023,'brass',cabinet);
 disk(.046,.018,-.90,1.07,-.39,'brass',cabinet);line([[-.79,1.07,-.39],[-.79,1.18,-.39],[-.72,1.18,-.39]],.011,'brass',cabinet);
 // Honed-stone backsplash and a slim oak shelf with a warm under-light.
 rounded(4.34,.52,.035,-.02,1.62,-1.507,'stone',kitchen,.012);
 slab(3.95,.32,.075,-.06,2.18,-1.39,'oak',kitchen,.015);
 box(3.60,.012,.022,-.06,2.128,-1.25,'glow',kitchen);
 for(const x of [-1.74,1.54])box(.035,.16,.20,x,2.08,-1.40,'brass',kitchen);
 // A few carefully modelled utensils establish scale without crowding the event.
 function board(x,y,z,w,h,tilt){const g=group(x,y,z,kitchen);g.rotation.z=tilt;rounded(w,h,.045,0,0,0,'oak',g,.07);rounded(w*.30,.22,.045,0,h/2+.045,0,'oak',g,.04);ring(.032,.006,0,h/2+.08,.025,'recess',g);return g;}
 board(.85,1.66,-1.43,.39,.63,-.08);board(1.15,1.55,-1.36,.34,.44,.09);
 function vessel(x,y,z,r,h,key){const pts=[new T.Vector2(0,0),new T.Vector2(r*.72,0),new T.Vector2(r,.035),new T.Vector2(r*.92,h*.85),new T.Vector2(r*.78,h),new T.Vector2(r*.64,h),new T.Vector2(r*.77,h*.84),new T.Vector2(r*.80,.05),new T.Vector2(0,.05)];const o=mesh(new T.LatheGeometry(pts,40),key,kitchen);o.position.set(x,y,z);return o;}
 vessel(1.68,1.36,-1.10,.13,.27,'porcelain');
 for(let i=0;i<5;i++)line([[1.68,1.40,-1.10],[1.68+(i-2)*.032,1.83,-1.10+(i%2)*.03]],.009,'oak',kitchen);
 vessel(.39,1.36,-.85,.17,.10,'porcelain');for(let i=0;i<3;i++)ellipsoid(.29+i*.09,1.48,-.85,.065,.065,.065,'leaf',kitchen);
 const pot=vessel(-1.73,1.36,-1.18,.13,.22,'porcelain');
 disk(.11,.012,-1.73,1.57,-1.18,'recess',kitchen);
 for(let i=0;i<12;i++){
  const a=i*2.399,tip=new T.Vector3(-1.73+Math.cos(a)*.17,1.77+(i%4)*.07,-1.18+Math.sin(a)*.14);
  line([[-1.73,1.56,-1.18],tip.toArray()],.004,'leaf',kitchen);
  for(const sign of [-1,1]){const leaf=ellipsoid(tip.x+sign*.025,tip.y-.02,tip.z,.065,.014,.025,'leaf',kitchen);leaf.rotation.z=sign*.48;leaf.rotation.y=a;}
 }
 for(let i=0;i<3;i++){const cup=vessel(-1.24+i*.29,2.23,-1.40,.081,.16,'porcelain');ring(.052,.010,-1.13+i*.29,2.32,-1.40,'porcelain',kitchen);}
 // Discreet camera, with a real lens barrel and articulated wall mount.
 const sensor=group(-2.10,2.43,-1.37,kitchen);sensor.name='pestoverflow-room-sensor';sensor.rotation.y=.55;sensor.rotation.x=.25;
 rounded(.28,.32,.075,0,0,-.11,'porcelain',sensor,.07);
 line([[0,0,-.10],[0,0,.05]],.032,'steel',sensor);
 const housing=mesh(new T.CylinderGeometry(.155,.145,.14,64),'porcelain',sensor);housing.rotation.x=Math.PI/2;housing.position.z=.09;
 const face=mesh(new T.CylinderGeometry(.132,.132,.014,64),'graphite',sensor);face.rotation.x=Math.PI/2;face.position.z=.168;
 ring(.088,.010,0,0,.181,'steel',sensor);ellipsoid(0,0,.181,.076,.076,.018,'lens',sensor);
 const led=ball(.013,0,-.11,.185,'jade',sensor);
 // Mouse follows one unobstructed route, stopping precisely inside the event box.
 const animal=pestMouse(T,k),mouse=animal.group;mouse.position.set(-2.62,floorY,.67);mouse.scale.setScalar(.88);
 const zone=group(-1.05,floorY+.012,.67);zone.name='pestoverflow-detection-zone';
 for(const sx of [-1,1])for(const sz of [-1,1])line([[sx*.45,0,sz*.19],[sx*.45,0,sz*.27],[sx*.34,0,sz*.27]],.012,'coralSignal',zone);
 // Precise phone housing and a single integrated screen, with a camera event UI.
 const phone=group(2.36,.265,.16);phone.name='pestoverflow-owner-phone';phone.rotation.y=-.07;phone.rotation.x=-.045;
 rounded(2.08,4.02,.175,0,2.03,0,'graphite',phone,.23);
 rounded(2.025,3.965,.058,0,2.03,.105,'steel',phone,.21);
 rounded(1.97,3.91,.035,0,2.03,.149,'graphite',phone,.20);
 const app=createPestScreen(T);app.mesh.scale.setScalar(1.174);app.mesh.position.set(0,2.03,.181);app.mesh.name='pestoverflow-app-screen';phone.add(app.mesh);
 rounded(.50,.11,.018,0,3.829,.196,'graphite',phone,.05);ball(.026,.172,3.83,.207,'lens',phone);
 rounded(.024,.42,.06,1.06,2.55,0,'steel',phone,.01);rounded(.024,.22,.06,-1.06,2.86,0,'steel',phone,.01);
 // Connection is a transient notification, not a permanent wire in the room.
 const curve=new T.CatmullRomCurve3([new T.Vector3(-3.51,2.64,-1.37),new T.Vector3(-1.3,3.27,-1.15),new T.Vector3(.55,3.16,-.42),new T.Vector3(1.39,2.98,.35)]);
 const route=mesh(new T.TubeGeometry(curve,100,.008,8,false),'coralSignal');route.name='pestoverflow-notification-route';
 const pulse=ball(.048,0,0,0,'coralSignal');pulse.name='pestoverflow-notification-pulse';pulse.position.copy(curve.getPointAt(0));
 // Named semantic state nodes make timing testable independently of canvas rendering.
 const notice=group(0,0,0,phone);notice.name='pestoverflow-owner-alert';
 const confirmation=group(0,0,0,phone);confirmation.name='pestoverflow-owner-confirmation';
 // Keep only the indicator dynamic; batch the static room by material.
 sensor.remove(led);k.batch(kitchen);sensor.add(led);
 const out=finish(23,[kitchen,phone,mouse,zone,route,pulse]);
 // Only the mouse fades; keep its materials separate from the room and phone.
 const mouseMeshes=[],mouseMaterials=new Set();
 mouse.traverse(o=>{if(o.isMesh){mouseMeshes.push(o);for(const material of Array.isArray(o.material)?o.material:[o.material])mouseMaterials.add(material);}});
 for(const material of mouseMaterials)material.transparent=true;
 const start=mouse.position.clone(),offset=pulse.position.clone().sub(curve.getPointAt(0));
 const framingPoints=[];out.updateMatrixWorld(true);for(const child of out.children){if(child===pulse||child===route)continue;const b=new T.Box3().setFromObject(child);if(b.isEmpty())continue;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));}
 Object.assign(out.userData,{studioProfile:'pestoverflow',initialYaw:-.09,initialElevation:.28,appFirst:true,cycle:PESTOVERFLOW_CYCLE,framingPoints});
 const stories=[['Monitoring the kitchen','The camera watches the floor beside the cabinets.','neutral'],['Pest activity detected','The mouse has entered the monitored area.','thinking'],['Alert on its way','The event and its location are sent to the owner.','thinking'],['The owner knows where to act','A kitchen event appears in the app with a notification receipt.','complete'],['Monitoring resumes','The event stays recorded while the scene prepares to replay.','neutral']];
 out.userData.animate=time=>{
  const s=pestMoment(time),t=s.t;mouse.position.copy(start);mouse.position.x+=s.travel*1.57;
  mouse.rotation.y=0;animal.animate(t,s.gait);
  mouse.visible=s.opacity>0;
  for(const material of mouseMaterials){material.opacity=s.opacity;material.depthWrite=s.opacity===1;}
  for(const mesh of mouseMeshes)mesh.castShadow=s.opacity===1;
  zone.visible=s.detected;led.material=s.detected?m.coralSignal:m.jade;
  route.visible=t>=5.2&&t<8.2;pulse.visible=t>=5.2&&t<6.5;pulse.position.copy(curve.getPointAt(ease((t-5.2)/1.3))).add(offset);
  notice.visible=s.notified;confirmation.visible=s.notified;app.update(s.notified?'notified':s.phase==='reset'?'monitoring':s.phase);
  const chapter=['monitoring','detected','sending','notified','reset'].indexOf(s.phase),story=stories[chapter],index=chapter===4?0:chapter;
  out.userData.story={index,step:`0${index+1} / 04`,title:story[0],detail:story[1],tone:story[2],phase:s.phase};
 };
 out.userData.animate(0);return out;
}
