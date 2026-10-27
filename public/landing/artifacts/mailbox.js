import {earlyStudio,ease} from './early-exhibit-studio.js';
import {mailboxScreen} from './mailbox-screen.js';

export const MAILBOX_CYCLE=20;
export function mailboxMoment(time){
 const t=((time%MAILBOX_CYCLE)+MAILBOX_CYCLE)%MAILBOX_CYCLE;
 return {t,index:t<5?0:t<7?1:t<9?2:3,insert:ease((t-2)/3),drop:ease((t-5)/1.4),
  detected:t>=5&&t<18,transmitting:t>=7&&t<9,notified:t>=9&&t<18,
  letterOpacity:ease(t/.6)*(1-ease((t-18)/1.5))};
}

export function createArtifact(T){
 const k=earlyStudio(T),{root,m,mesh,box,disk,line,group,rounded,slab,ring,ellipsoid,texture,finish}=k;
 Object.assign(m,{
  enamel:new T.MeshPhysicalMaterial({color:0xc85e42,roughness:.38,metalness:.12,clearcoat:.35}),
  sage:new T.MeshStandardMaterial({color:0x6c8170,roughness:.9}),
  steel:new T.MeshStandardMaterial({color:0xc2c8c3,metalness:.58,roughness:.43}),
  walnut:new T.MeshStandardMaterial({color:0x70432b,roughness:.6}),
  inner:new T.MeshStandardMaterial({color:0x12272d,roughness:.7}),
  paper:new T.MeshStandardMaterial({color:0xf4ead7,roughness:.85}),
  redStripe:new T.MeshStandardMaterial({color:0xb35743,roughness:.8}),
  blueStripe:new T.MeshStandardMaterial({color:0x357c8c,roughness:.8}),
  teal:new T.MeshStandardMaterial({color:0x247f7c,roughness:.45}),
  signal:new T.MeshBasicMaterial({color:0x76f6e1,toneMapped:false}),
  leaf:new T.MeshStandardMaterial({color:0x3b633e,roughness:.7,side:T.DoubleSide}),
  leafLight:new T.MeshStandardMaterial({color:0x69834d,roughness:.8,side:T.DoubleSide}),
 });
 const wood=texture('wood');m.walnut.map=wood;m.walnut.bumpMap=wood;m.walnut.bumpScale=.012;
 const brush=texture('cloth');brush.repeat.set(.3,5);m.steel.bumpMap=brush;m.steel.bumpScale=.0018;
 // Terrazzo, not a gold presentation plinth: a small slice of a shared lobby.
 const size=256,bytes=new Uint8Array(size*size*4);let seed=9;
 for(let i=0;i<size*size;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=seed/4294967296;const color=v>.982?[93,110,107]:v>.96?[176,137,112]:[225+v*12,219+v*12,204+v*12];for(let c=0;c<3;c++)bytes[i*4+c]=color[c];bytes[i*4+3]=255;}
 const terrazzo=new T.DataTexture(bytes,size,size);terrazzo.colorSpace=T.SRGBColorSpace;terrazzo.wrapS=terrazzo.wrapT=T.RepeatWrapping;terrazzo.repeat.set(2,1);terrazzo.magFilter=T.LinearFilter;terrazzo.minFilter=T.LinearMipmapLinearFilter;terrazzo.generateMipmaps=true;terrazzo.needsUpdate=true;
 m.terrazzo=new T.MeshStandardMaterial({map:terrazzo,roughness:.72});
 slab(8.1,4.2,.19,0,.095,0,'terrazzo',root,.18);
 rounded(4.52,3.65,.14,-1.67,2.04,-1.63,'stone',root,.025);
 box(4.49,1.48,.035,-1.67,.94,-1.533,'sage');
 box(4.48,.09,.04,-1.67,.25,-1.51,'cream');
 function label(value,w,h,x,y,z,parent=root,fg='#243c3b',bg=null){
  const g=group(x,y,z,parent);if(typeof document==='undefined')return g;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const cx=c.getContext('2d');
  if(bg){cx.fillStyle=bg;cx.fillRect(0,0,c.width,c.height);}cx.fillStyle=fg;cx.textAlign='center';cx.textBaseline='middle';cx.font=`500 ${c.height*.65}px sans-serif`;cx.fillText(value,512,c.height/2,980);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:!bg,toneMapped:false}));o.userData.noShadow=true;g.add(o);return g;
 }
 const labels=[];
 labels.push(label('A LITTLE LESS CHECKING.',3.0,.13,-1.76,3.63,-1.53));
 // Six individual doors, real recessed slots, locks and brushed metal hems.
 rounded(2.77,2.32,.28,-2.20,2.22,-1.39,'inner',root,.04);
 for(let row=0;row<3;row++)for(let col=0;col<2;col++){
  const x=-2.87+col*1.34,y=3.0-row*.76;
  rounded(1.29,.70,.075,x,y,-1.21,'steel',root,.015);
  rounded(1.02,.10,.018,x,y+.18,-1.157,'inner',root,.018);
  box(1.04,.018,.026,x,y+.24,-1.14,'silver');
  const lock=disk(.055,.018,x-.46,y-.15,-1.15,'silver');lock.rotation.x=Math.PI/2;
  box(.013,.046,.007,x-.46,y-.15,-1.132,'inner');
  labels.push(label(`#0${row+1}-0${col+1}`,.52,.105,x+.24,y-.10,-1.15));
 }
 // Slatted bench, inset legs and a leafy planter ground the scene in a lobby.
 for(let i=0;i<4;i++)slab(2.55,.12,.085,-2.2,.62,-.97+i*.14,'walnut',root,.012);
 for(const x of [-3.30,-1.1])for(const z of [-.95,-.52])box(.085,.41,.085,x,.395,z,'walnut');
 disk(.39,.54,-3.36,.47,.91,'terrazzo');disk(.34,.012,-3.36,.75,.91,'inner');
 for(let i=0;i<15;i++){
  const a=i*2.399,r=.28+(i%3)*.065,y=1.15+(i%5)*.19,x=-3.36+Math.cos(a)*r,z=.91+Math.sin(a)*r;
  line([[-3.36,.74,.91],[x,y-.15,z],[x,y+.12,z]],.009,'leaf');
  const leafGeo=new T.PlaneGeometry(.27,.75,6,12),positions=leafGeo.attributes.position;
  for(let j=0;j<positions.count;j++){const xx=positions.getX(j),yy=positions.getY(j),v=(yy+.375)/.75;positions.setX(j,xx*Math.sin(Math.PI*v)**.75);positions.setZ(j,.09*Math.sin(v*Math.PI)+Math.abs(xx)*.3);}
  leafGeo.computeVertexNormals();const leaves=group(x,y,z);leaves.rotation.set(.3,a,Math.sin(a)*.4);mesh(leafGeo,i%3?'leaf':'leafLight',leaves);
  line([[0,-.34,.014],[0,0,.10],[0,.34,.018]],.003,'sage',leaves);
 }
 // Hero mailbox with a deliberately exposed front-right inspection section.
 const hero=group(-.12,.21,.08);hero.name='mailbox-cutaway';
 const w=2.04,h=3.24,d=1.32;
 slab(w,d,.10,0,.10,0,'steel',hero,.035);
 box(w,.07,d,0,h,0,'enamel',hero);
 box(.08,h,d,-w/2+.04,h/2,0,'enamel',hero);
 box(.065,h,d,w/2-.032,h/2,0,'enamel',hero);
 box(w-.12,h-.12,.07,0,h/2,-d/2+.035,'inner',hero);
 box(w-.14,.055,d-.12,0,.32,0,'steel',hero);
 // Separate front panels leave a genuine slot for the moving envelope.
 rounded(1.26,2.43,.07,-.35,1.40,.66,'enamel',hero,.025);
 rounded(1.26,.30,.07,-.35,3.07,.66,'enamel',hero,.025);
 box(.06,.24,.07,-.95,2.79,.66,'enamel',hero);box(.06,.24,.07,.25,2.79,.66,'enamel',hero);
 box(1.10,.025,.055,-.35,2.92,.69,'steel',hero);
 box(.035,3.02,.055,.32,1.64,.68,'steel',hero);
 box(.035,3.02,.055,.95,1.64,.68,'steel',hero);
 for(const x of [.32,.95])for(const y of [.23,3.07]){
  const screw=disk(.026,.014,x,y,.724,'silver',hero);screw.rotation.x=Math.PI/2;box(.025,.004,.003,x,y,.734,'inner',hero);
 }
 const lock=disk(.12,.035,-.35,1.45,.72,'steel',hero);lock.rotation.x=Math.PI/2;ring(.105,.009,-.35,1.45,.75,'silver',hero);box(.019,.10,.012,-.35,1.45,.75,'inner',hero);
 labels.push(label('#02-01',.72,.16,-.47,.71,.79));
 labels.push(label('CUTAWAY / SENSOR',.58,.09,.53,3.17,.82));
 // Sensor, circuit board, component pins and a short protected wiring run.
 rounded(.37,.41,.11,.57,2.69,-.48,'teal',hero,.035);
 box(.12,.12,.04,.57,2.70,-.405,'inner',hero);
 const led=ellipsoid(.57,2.70,-.37,.037,.037,.019,'signal',hero);led.name='mailbox-sensor-led';
 for(let i=0;i<4;i++)box(.025,.045,.018,.46+i*.07,2.91,-.42,'silver',hero);
 line([[.56,2.95,-.48],[.75,3.07,-.48],[.88,3.07,-.48],[.88,1.17,-.48]],.012,'inner',hero);
 rounded(.32,.46,.065,.76,1.00,-.48,'teal',hero,.02);box(.16,.17,.025,.76,1,-.43,'inner',hero);
 for(let i=0;i<5;i++)box(.035,.015,.02,.60,1.13-i*.06,-.43,'silver',hero);
 // Optical indication is a visual explanation, not a claimed sensor specification.
 m.beam=new T.MeshBasicMaterial({color:0x65efe0,transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide});
 const beamGeo=new T.BufferGeometry();beamGeo.setAttribute('position',new T.Float32BufferAttribute([.57,2.67,-.36,.16,1.91,.28,.86,1.91,.28],3));beamGeo.computeVertexNormals();
 const beam=mesh(beamGeo,'beam',hero);beam.name='mailbox-detection-beam';beam.castShadow=false;
 // Small stack of collected letters visible through the open section.
 for(let i=0;i<3;i++){
  const g=group(.43+i*.04,.74,-.17+i*.12,hero);g.rotation.z=-.12+i*.04;
  rounded(.66,.69,.016,0,0,0,i===1?'paper':'cream',g,.008);
  line([[-.30,.30,.013],[0,.07,.013],[.30,.30,.013]],.004,'stone',g);
 }
 // Airmail letter travels through the slot, then settles inside the chamber.
 const letter=group();letter.name='mailbox-delivery-letter';
 rounded(1.05,.65,.018,0,0,0,'paper',letter,.008);
 line([[-.49,.29,.017],[0,-.07,.017],[.49,.29,.017]],.006,'stone',letter);
 line([[-.50,-.28,.017],[-.19,-.03,.017]],.004,'stone',letter);line([[.50,-.28,.017],[.19,-.03,.017]],.004,'stone',letter);
 for(let i=0;i<12;i++)for(const y of [-.3,.3]){const stripe=box(.045,.035,.002,-.47+i*.085,y,.014,i%2?'redStripe':'blueStripe',letter);stripe.rotation.z=.35;}
 rounded(.16,.14,.003,.32,.16,.019,'sage',letter,.005);
 const letterMats=new Set();letter.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;letterMats.add(o.material);}});k.batch(letter);
 letter.position.set(-.47,3,1.48);letter.rotation.x=-Math.PI/2;
 // Larger screen, fewer words: readable from the normal exhibit camera.
 const phone=group(2.62,.22,.39);phone.name='mailbox-resident-phone';phone.rotation.y=-.07;
 slab(1.97,.74,.13,0,.065,0,'terrazzo',phone,.11);
 rounded(1.64,2.78,.17,0,1.55,0,'steel',phone,.16);
 rounded(1.60,2.74,.18,0,1.55,.018,'inner',phone,.15);
 rounded(1.51,2.55,.018,0,1.55,.118,'cream',phone,.13);
 box(.026,.29,.05,-.831,2.18,0,'steel',phone);box(.026,.18,.05,.831,2.03,0,'steel',phone);
 const screen=mailboxScreen(T);screen.group.position.set(0,1.55,.14);phone.add(screen.group);
 // A low, fine signal arc leaves the sensor and lands at the notification.
 root.updateMatrixWorld(true);const from=led.getWorldPosition(new T.Vector3());
 const curve=new T.CatmullRomCurve3([from,new T.Vector3(1.04,3.14,.07),new T.Vector3(1.78,2.89,.37),new T.Vector3(2.45,2.40,.58)]);
 const route=group();route.name='mailbox-notification-route';
 for(let i=0;i<38;i++)line([curve.getPointAt(i/38).toArray(),curve.getPointAt((i+.40)/38).toArray()],.008,'signal',route);
 k.batch(route);
 const pulse=ellipsoid(0,0,0,.045,.045,.045,'signal');pulse.name='mailbox-notification-pulse';
 pulse.position.copy(from);
 const halo=ring(.09,.012,from.x,from.y,from.z+.02,'signal');halo.name='mailbox-sensor-halo';
 // Keep animation groups independent from static material batching.
 const live=[...labels,letter,phone,route,pulse,beam,led,halo];
 const out=finish(9,live),ledPosition=led.position.clone(),ledScale=led.scale.clone();
 const originOffset=letter.position.clone().sub(new T.Vector3(-.47,3,1.48));
 out.traverse(o=>{if(o.isMesh&&(o.material===m.signal||o.material===m.beam)){o.castShadow=false;o.receiveShadow=false;}});
 Object.assign(out.userData,{studioProfile:'mailbox',initialYaw:-.30,initialElevation:.24,autoOrbit:false,appFirst:true,cycle:MAILBOX_CYCLE});
 const stories=[['A letter arrives','An envelope passes through the mailbox slot.'],['The mailbox detects it','The sensor changes state when the letter arrives.'],['An update is sent','The delivery event travels from the mailbox to the resident.'],['No more guessing','The phone shows that there is mail ready to collect.']];
 out.userData.animate=time=>{
  const s=mailboxMoment(time);
  letter.position.set(-.47+s.drop*.44,3.00-s.drop*1.63,1.48-s.insert*1.52+s.drop*.24).add(originOffset);
  letter.rotation.set(-Math.PI/2+s.drop*1.40,0,s.drop*-.11);
  letter.visible=s.letterOpacity>.001;for(const material of letterMats){material.opacity=s.letterOpacity;material.depthWrite=s.letterOpacity>.99;}
  led.position.copy(ledPosition);led.scale.copy(ledScale).multiplyScalar(s.detected?1.12:1);
  beam.visible=s.detected;halo.visible=s.detected;halo.scale.setScalar(1+.18*Math.sin(s.t*3));
  route.visible=s.t>=7&&s.t<11;pulse.visible=s.transmitting;pulse.position.copy(curve.getPointAt(ease((s.t-7)/2))).add(originOffset);
  screen.update(s.notified?'notified':s.transmitting?'sending':'waiting');
  const index=s.t>=18?0:s.index,story=stories[index];out.userData.story={index,step:`0${index+1} / 04`,title:story[0],detail:story[1],tone:s.notified?'complete':'neutral'};
 };
 out.userData.animate(0);return out;
}
