import {medivoiceStudio} from './medivoice-studio.js';
import {foodBridgeScreen,prepareFoodScreen,foodScreenState} from './food-bridge-screen.js';
import {foodCourtSurfaces,foodCourtDetails} from './food-bridge-details.js';
export const prepareArtifact=prepareFoodScreen;
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';

export const FOOD_CYCLE=24;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export function foodMoment(time){
 const t=((time%FOOD_CYCLE)+FOOD_CYCLE)%FOOD_CYCLE;
 return {t,index:Math.min(3,Math.floor(t/6)),filter:ease((t-6)/1.5),match:ease((t-12)/2),route:ease((t-18)/3),pin:ease((t-21)/1.2),fade:1-ease((t-23)/1)};
}
const STEPS=[
 ['Menus, brought together','Explore three illustrative food stalls in one place.'],
 ['Choose what suits you','This example selects a vegetarian preference.'],
 ['Find a menu match','Garden Bowl is highlighted for this illustrative preference.'],
 ['Make your way there','A route leads to the selected stall. The pin settles when the route arrives.'],
];

export function createArtifact(T){
 const {root,materials:m,mesh,box,disk,finish,texture}=medivoiceStudio(T);
 const colors={stone:0xe5d9be,grout:0xc5bca7,cream:0xf1e4c9,jade:0x174d3e,jadeLight:0x5f8f65,ink:0x152d28,coral:0xb65c43,ochre:0xb69451,brass:0xb6975e,wood:0x795536,tile:0xe3dfce,metal:0x85918a,soil:0x4b3e2f,leaf:0x427b45,leafLight:0x799451,rice:0xe4d8b2,tomato:0xbc3923,tofu:0xcb9c54,cucumber:0xa8b576,seed:0xe6d5a0};
 for(const [key,color] of Object.entries(colors))m[key]=new T.MeshStandardMaterial({color,roughness:['brass','metal'].includes(key)?.33:.75,metalness:['brass','metal'].includes(key)?.72:0});
 const stone=planningExhibitSurfaces(T).stone,wood=texture('wood'),cloth=texture('cloth');
 m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.008;
 m.wood.bumpMap=wood;m.wood.bumpScale=.012;m.cream.bumpMap=stone;m.cream.bumpScale=.002;
 for(const key of ['coral','jadeLight','ochre']){m[key].bumpMap=cloth;m[key].bumpScale=.004;}
 m.ceramic=new T.MeshPhysicalMaterial({color:0xf1e8d6,roughness:.28,clearcoat:.6,clearcoatRoughness:.22});
 m.glow=new T.MeshStandardMaterial({color:0x91c286,emissive:0x558e4a,emissiveIntensity:.50,roughness:.45});
 m.lamp=new T.MeshStandardMaterial({color:0xffe1a1,emissive:0xffc366,emissiveIntensity:1.1});
 m.pin=new T.MeshPhysicalMaterial({color:0x22664b,metalness:.18,roughness:.3,clearcoat:.55});
 foodCourtSurfaces(T,m);
 const live=[],steam=[],scanRings=[];let matchBadge;
 const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
 function rounded(w,h,d,x,y,z,key,parent=root,r=.04){
  r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const bevel=Math.min(.016,d*.3);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:10}),key,parent);o.position.set(x,y,z);return o;
 }
 function slab(w,d,h,x,y,z,key,parent=root,r=.04){const o=rounded(w,d,h,x,y,z,key,parent,r);o.rotation.x=-Math.PI/2;return o;}
 function tube(points,r,key,parent=root){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,Math.max(24,points.length*7),r,10,false),key,parent);}
 function ell(x,y,z,sx,sy,sz,key,parent=root){const o=mesh(new T.SphereGeometry(1,24,16),key,parent);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;}
 function ring(r,t,x,y,z,key,parent=root){const o=mesh(new T.TorusGeometry(r,t,12,64),key,parent);o.position.set(x,y,z);return o;}
 function sign(text,w,h,x,y,z,parent=root,fg='#eae1cc',bg='#174d3e'){
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${c.height*.47}px sans-serif`;ctx.fillText(text,c.width/2,c.height/2,c.width*.92);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.8}));o.position.set(x,y,z);parent.add(o);return o;
 }
 function bowl(x,y,z,r,parent=root){
  const profile=[[0,0],[.35,.0],[.46,.04],[.64,.15],[.88,.38],[1,.62],[1.01,.67],[.96,.68],[.92,.61],[.80,.36],[.58,.17],[.28,.12],[0,.12]].map(([a,b])=>new T.Vector2(a*r,b*r));
  const o=mesh(new T.LatheGeometry(profile,64),'ceramic',parent);o.position.set(x,y,z);return o;
 }
 function leaf(x,y,z,size,angle,parent=root,key='leaf'){
  const g=new T.PlaneGeometry(size,size*1.6,8,12),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const xx=p.getX(i),yy=p.getY(i);p.setX(i,xx*Math.sqrt(Math.max(0,1-(yy/(size*.83))**2)));p.setZ(i,Math.sin(yy/size*2)*size*.16+Math.abs(xx)*.23+Math.sin(yy/size*28)*size*.035);}
  g.computeVertexNormals();const o=mesh(g,key,parent);o.position.set(x,y,z);o.rotation.set(-1.0,angle,.15);o.material.side=T.DoubleSide;return o;
 }
 // One miniature food court, with tiled forecourt and three independent menus.
 slab(8.5,4.6,.22,0,.02,0,'stone',root,.24);slab(8.39,4.49,.055,0,-.025,0,'jade',root,.23);
 for(let x=-4.0;x<4.1;x+=.4)box(.005,.003,4.20,x,.260,0,'grout');
 for(let z=-2.0;z<2.1;z+=.4)box(8.12,.003,.005,0,.260,z,'grout');
 rounded(2.0,.22,.026,0,.135,2.31,'brass',root,.03);sign('Smart Food Bridge',1.90,.17,0,.135,2.344,root);
 const stallX=[-.64,1.16,2.96],stallKeys=['coral','jade','ochre'],stallNames=['NOODLE HOUSE','GARDEN BOWL','FISH & RICE'];
 for(let i=0;i<3;i++){
  const g=group(stallX[i],.26,-1.24);g.scale.y=1.24;slab(1.66,1.28,.08,0,0,0,'stone',g,.025);
  box(1.62,1.53,.09,0,.83,-.56,'cream',g);for(const x of [-.79,.79])box(.065,1.72,1.12,x,.90,-.02,stallKeys[i],g);
  for(let row=0;row<7;row++)for(let col=0;col<7;col++)rounded(.202,.116,.012,-.66+col*.219+(row%2)*.025,.55+row*.136,-.505,'tile',g,.007);
  box(1.50,.62,.53,0,.42,.32,'wood',g);for(let n=0;n<25;n++)box(.028,.57,.018,-.72+n*.06,.43,.60,'wood',g);
  slab(1.63,.66,.055,0,.74,.30,'stone',g,.026);box(1.65,.045,.06,0,.73,.645,'brass',g);
  rounded(1.67,.31,.06,0,1.65,-.16,stallKeys[i],g,.025);sign(stallNames[i],1.52,.22,0,1.65,-.067,g);
  // Striped canvas canopy, scalloped valance and slim brass support rods.
  const awning=group(0,1.52,.25,g);awning.rotation.x=.20;
  for(let n=0;n<10;n++){box(.166,.025,.69,-.747+n*.166,0,0,n%2?'cream':stallKeys[i],awning);rounded(.166,.10,.025,-.747+n*.166,-.048,.335,n%2?'cream':stallKeys[i],awning,.04);}
  for(const x of [-.74,.74])tube([[x,1.35,-.40],[x,1.42,.53]],.012,'brass',g);
  // Back-wall menu, shelf jars, hot bowls, pendant shades and countertop utensils.
  rounded(.40,.43,.025,-.46,1.03,-.48,'ink',g,.018);sign('MENU',.33,.09,-.46,1.16,-.435,g,'#eae1cc','#152d28');
  for(let n=0;n<4;n++)box(.26-n*.03,.008,.004,-.47-n*.015,1.05-n*.055,-.443,'cream',g);
  box(.66,.035,.17,.34,1.12,-.40,'wood',g);
  for(let n=0;n<3;n++){disk(.045,.14,.12+n*.19,1.205,-.39,'ceramic',g);disk(.047,.018,.12+n*.19,1.285,-.39,'wood',g);}
  for(const x of [-.42,.39]){
   tube([[x,1.49,.12],[x,1.19,.12]],.008,'metal',g);const shade=mesh(new T.ConeGeometry(.10,.10,32,1,true),'brass',g);shade.position.set(x,1.16,.12);disk(.084,.008,x,1.11,.12,'lamp',g);
   bowl(x,.80,.32,.14,g);ell(x,.84,.32,.11,.028,.11,i===1?'leafLight':'rice',g);
  }
  disk(.055,.13,.04,.85,.47,'metal',g);for(let n=0;n<4;n++)tube([[.01+n*.018,.86,.47],[.005+n*.025,1.04,.48]],.004,'wood',g);
  foodCourtDetails(T,{box,disk,mesh,tube,ell,slab},g,i);
  if(i===1){matchBadge=group(0,.42,.641,g);matchBadge.name='food-diet-match';rounded(1.12,.23,.018,0,0,0,'jade',matchBadge,.025);sign('VEGETARIAN MATCH',1.04,.16,0,0,.027,matchBadge);live.push(matchBadge);}
  // A moving sweep identifies the menu currently being read.
  const scan=group(0,1.94,.03,g);scan.name=`food-menu-scan-${i}`;
  const arc=mesh(new T.TorusGeometry(.23,.019,8,48,Math.PI*1.55),'glow',scan);
  scanRings.push(scan);live.push(scan);
  // Separate translucent ribbons rise from each hot serving bowl.
  for(let j=0;j<2;j++){
   const vapor=group(-.42+j*.81,.91,.32,g);vapor.name=`food-steam-${i}-${j}`;
   const ribbon=tube([[0,0,0],[.025,.08,0],[-.02,.17,.006],[.018,.27,0]],.009,'cream',vapor);
   ribbon.material=new T.MeshBasicMaterial({color:0xfff3dc,transparent:true,opacity:.22,depthWrite:false});
   ribbon.castShadow=false;steam.push({object:vapor,material:ribbon.material,phase:i*.27+j*.43});live.push(vapor);
  }
  // Low round stools leave the walkway clear.
  for(const x of [-.48,.48]){disk(.115,.035,x,.41,.94,'wood',g);for(const dx of [-.07,.07])for(const dz of [-.06,.06])tube([[x+dx,.40,.94+dz],[x+dx*1.3,.07,.94+dz*1.3]],.009,'metal',g);}
 }
 // A detailed meal makes the dietary preference tangible, without a medical claim.
 const meal=group(2.58,.28,1.08);meal.scale.setScalar(1.05);disk(.82,.055,0,.02,0,'wood',meal);const rim=ring(.78,.012,0,.05,0,'brass',meal);rim.rotation.x=Math.PI/2;
 bowl(0,.048,0,.72,meal);ell(0,.30,0,.56,.08,.56,'rice',meal);
 let seed=14;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let j=0;j<140;j++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.50;const grain=ell(Math.cos(a)*r,.365+rnd()*.023,Math.sin(a)*r,.017,.009,.009,'rice',meal);grain.rotation.y=rnd()*Math.PI;}
 for(let j=0;j<13;j++){const a=j*.48;leaf(Math.cos(a)*.38,.43,Math.sin(a)*.36,.20,a,meal,j%2?'leaf':'leafLight');}
 for(let j=0;j<5;j++){const a=j*2.4;rounded(.14,.13,.12,Math.cos(a)*.27,.44,Math.sin(a)*.25,'tofu',meal,.019);}
 for(let j=0;j<4;j++){const a=j*1.8;const slice=group(Math.cos(a)*.39,.49,Math.sin(a)*.33,meal);slice.rotation.x=-1.15;const cut=disk(.10,.026,0,0,0,'tomato',slice);cut.rotation.x=Math.PI/2;const rr=ring(.077,.008,0,0,.016,'coral',slice);for(let k=0;k<5;k++){const sa=k*Math.PI*.4;ell(Math.sin(sa)*.05,Math.cos(sa)*.05,.021,.012,.020,.004,'seed',slice);}}
 for(let j=0;j<3;j++){const sl=group(-.18+j*.13,.55,-.12,meal);sl.rotation.x=-1.0;const d=disk(.12,.024,0,0,0,'leaf',sl);d.rotation.x=Math.PI/2;const c=disk(.102,.026,0,0,.006,'cucumber',sl);c.rotation.x=Math.PI/2;for(let k=0;k<6;k++){const a=k*Math.PI/3;ell(Math.cos(a)*.045,Math.sin(a)*.045,.022,.008,.016,.003,'seed',sl);}}
 for(let i=0;i<2;i++)tube([[.73+i*.05,.09,-.35],[.79+i*.05,.12,.52]],.012,'wood',meal);
 // Two tropical planters supply scale and setting, without obscuring the route.
 for(const [x,z] of [[-1.20,.92],[3.78,.36]]){const pot=mesh(new T.CylinderGeometry(.18,.13,.29,32),'coral');pot.position.set(x,.41,z);disk(.15,.015,x,.56,z,'soil');for(let i=0;i<13;i++){const a=i*2.4;const h=.25+(i%4)*.10;tube([[x,.56,z],[x+Math.cos(a)*.08,.56+h,z+Math.sin(a)*.08]],.006,'leaf');leaf(x+Math.cos(a)*.12,.60+h,z+Math.sin(a)*.12,.15,a,root,'leaf');}}
 // Phone shares one sequence with the matching markers and route.
 const phone=group(-2.77,2.18,.34);phone.scale.set(1.3664,1.12,1.12);phone.rotation.x=-.045;phone.rotation.y=.06;
 rounded(1.62,3.34,.13,0,0,0,'brass',phone,.16);rounded(1.56,3.28,.13,0,0,.035,'ink',phone,.14);
 rounded(1.43,3.08,.012,0,0,.177,'cream',phone,.11);
 const phoneUI=foodBridgeScreen(T);m.screen=phoneUI.material;
 const screen=mesh(new T.PlaneGeometry(1.36,2.95),'screen',phone);screen.position.z=.196;screen.castShadow=false;screen.name='food-phone-screen';
 rounded(.39,.08,.01,0,1.45,.208,'ink',phone,.04);box(.31,.013,.005,0,-1.44,.208,'jade',phone);
 for(const y of [.70,.40])rounded(.025,.18,.06,-.81,y,.02,'brass',phone,.01);
 slab(1.95,.70,.07,-2.77,.26,.31,'jade',root,.12);
 live.push(phone);
 function drawPhone(s){phoneUI.update(s);Object.assign(screen.userData,{phase:s.index,matched:s.index>=2,...foodScreenState(s)});}
 const path=new T.CatmullRomCurve3([new T.Vector3(-2.68,.275,1.02),new T.Vector3(-2.20,.275,1.64),new T.Vector3(-.30,.275,1.64),new T.Vector3(.55,.275,1.08),new T.Vector3(.80,.275,.28),new T.Vector3(1.16,.275,-.38)]);
 const route=mesh(new T.TubeGeometry(path,160,.033,10,false),'glow');route.geometry.translate(0,.030,0);route.name='food-selected-route';live.push(route);
 for(let i=0;i<34;i++){const p=path.getPointAt(i/33);disk(.018,.004,p.x,.272,p.z,'grout');}
 const markerGroups=[];
 for(let i=0;i<3;i++){
  const g=group(stallX[i],2.85,-1.22);g.name=`food-marker-${i}`;
  const sh=new T.Shape();sh.moveTo(0,-.28);sh.bezierCurveTo(-.11,-.13,-.23,.04,-.23,.16);sh.absarc(0,.16,.23,Math.PI,0,true);sh.bezierCurveTo(.23,.04,.11,-.13,0,-.28);
  const hole=new T.Path();hole.absarc(0,.16,.09,0,Math.PI*2,true);sh.holes.push(hole);
  const p=mesh(new T.ExtrudeGeometry(sh,{depth:.065,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:24}),i===1?'pin':'brass',g);live.push(g);markerGroups.push(g);
 }
 const selected=group(stallX[1],.305,-.45);selected.name='food-match-halo';const halo=ring(.35,.018,0,0,0,'glow',selected);halo.rotation.x=-Math.PI/2;live.push(selected);
 const pulse=mesh(new T.SphereGeometry(.045,20,12),'glow');pulse.name='food-route-guide';live.push(pulse);
 root.updateMatrixWorld(true);const framingPoints=[];root.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));});framingPoints.push(new T.Vector3(stallX[1],3.60,-1.22));for(const object of live)root.attach(object);
 const initial=route.position.clone(),model=finish(14,live),offset=route.position.clone().sub(initial),markerRest=markerGroups.map(g=>g.position.clone());
 for(const p of framingPoints)p.add(offset);const steamRest=steam.map(v=>v.object.position.clone());let manual=null,timeOffset=0;
 Object.assign(model.userData,{displayBase:false,groundLevel:0,framingPoints,studioProfile:'smart-food-bridge',contactFootprint:false,initialYaw:-.12,initialElevation:.29,autoOrbit:false,realTimeAnimation:true,cycleDuration:FOOD_CYCLE,
  setStep(index,elapsed=0){if(index===null){timeOffset=elapsed-(manual??(elapsed-timeOffset));manual=null;}else manual=[3,9,15,22.5][Math.max(0,Math.min(3,index))];model.userData.animate(elapsed);},
  animate(time){const s=foodMoment(manual??(time-timeOffset));
   steam.forEach((v,i)=>{const u=(s.t/2.4+v.phase)%1;v.object.position.copy(steamRest[i]);v.object.position.y+=u*.22;v.object.position.x+=Math.sin(u*Math.PI*2+v.phase)*.025;v.object.scale.set(1+u*.45,.7+u*.55,1);v.material.opacity=Math.sin(u*Math.PI)*.30;});
   scanRings.forEach((o,i)=>{o.visible=s.index===0?Math.floor(s.t/2)%3===i:s.index===1&&i===1;o.rotation.z=-s.t*2.4;o.scale.setScalar(1+.10*Math.sin(s.t*4));});
   model.userData.story={index:s.index,step:`0${s.index+1} / 04`,title:STEPS[s.index][0],detail:STEPS[s.index][1],tone:'neutral'};drawPhone(s);
   route.visible=s.route>0;route.geometry.setDrawRange(0,Math.floor(route.geometry.index.count*s.route/3)*3);route.material.opacity=s.fade;route.material.transparent=true;
   matchBadge.visible=s.match>0;selected.visible=s.match>0;selected.scale.setScalar((.90+.10*s.match)*(1+.13*Math.sin(s.t*Math.PI*1.5)));halo.material.opacity=s.fade;
   markerGroups.forEach((g,i)=>{g.position.copy(markerRest[i]);g.visible=i===1?s.match>0:true;g.scale.setScalar(i===1?Math.max(.001,s.match):.45);if(i===1)g.position.y+=.40*(1-s.pin);});
   pulse.visible=s.route>0&&s.route<1;pulse.position.copy(path.getPoint(s.route)).add(offset);pulse.position.y+=.03;m.pin.transparent=true;m.pin.opacity=s.fade;
  }
 });model.userData.animate(0);return model;
}
