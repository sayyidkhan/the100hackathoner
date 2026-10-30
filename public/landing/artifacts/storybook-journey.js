// Bob's paper-theatre performance is seekable, including pause and reset.
export const JOURNEY_DURATION=48;
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const beats=[
 [0,5,.065,.23,'walk','Follow the path','Bob sets off for home, keeping to the blue road.'],
 [5,10,.23,.23,'friend','Draw a friend','A friendly companion takes shape, helping Bob ignore the distractions.'],
 [10,16,.23,.48,'walk','Keep going together','Bob walks past the beckoning group with his friend and keeps heading home.'],
 [16,21,.48,.48,'phone','Draw a phone','At the confusing turn, Bob sketches a phone to find directions home.'],
 [21,28,.48,.70,'walk','Follow the directions','With directions in hand, Bob stays on the blue route home.'],
 [28,34,.70,.70,'door','Draw a door','Bob finishes sketching a doorway. Only then does it appear and open.'],
 [34,42,.70,1,'walk','Through the doorway','The drawn door opens. Bob walks through and reaches the cottage.'],
 [42,48,1,1,'home','Safe at home','Bob made it home. The story fades gently, then begins again.'],
];
export function journeyMoment(time){const t=((Number.isFinite(time)?time:0)%48+48)%48,index=beats.findIndex(b=>t>=b[0]&&t<b[1]),b=beats[index],f=clamp((t-b[0])/(b[1]-b[0]));return {t,index,kind:b[4],title:b[5],detail:b[6],step:`${index+1} / ${beats.length}`,tone:'flowing',progress:b[2]+(b[3]-b[2])*ease(f),walking:b[4]==='walk',drawing:['friend','phone','door'].includes(b[4]),draw:b[4]==='door'?ease((t-28)/3.5):ease(f),doorSpawn:ease((t-32)/.75),friend:ease((t-10)/1),phone:ease((t-19)/2),door:ease((t-33)/1),fade:1-ease((t-45.5)/1.8)};}

export function createStorybookJourney(T,{sample,ground=(x,z)=>sample(.33).y}){
 const group=new T.Group();group.name='bob-draws-his-way-home';
 const palette={coat:0xc13a29,trousers:0x233f6b,skin:0xf0cba0,hair:0x503928,paper:0xfff1cf,ink:0x193b69,green:0x44867b,gold:0xe9b347,muted:0xa8939e};
 const mats=Object.fromEntries(Object.entries(palette).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:.86,transparent:true})]));
 function mesh(geo,key,p=group){const o=new T.Mesh(geo,mats[key]);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
 function box(w,h,d,x,y,z,k,p){const o=mesh(new T.BoxGeometry(w,h,d),k,p);o.position.set(x,y,z);return o;}
 function sphere(r,x,y,z,k,p){const o=mesh(new T.SphereGeometry(r,16,12),k,p);o.position.set(x,y,z);return o;}
 function node(p=group){const g=new T.Group();p.add(g);return g;}
 function stroke(points,k='ink',r=.007,p=group){const curve=new T.CurvePath();for(let i=1;i<points.length;i++)curve.add(new T.LineCurve3(new T.Vector3(...points[i-1]),new T.Vector3(...points[i])));return mesh(new T.TubeGeometry(curve,Math.max(12,points.length*6),r,5,false),k,p);}
 function shape(points,k,p,depth=.025){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:1}),k,p);}
 function person(color='coat',traveler=true){
  const actor=node(),body=node(actor);body.name='bob-body';
  shape([[-.072,.20],[-.086,.36],[-.055,.395],[.055,.395],[.086,.36],[.072,.20]],color,body);
  const head=sphere(.068,0,.455,.015,'skin',body);head.scale.set(.85,1,.65);
  const hair=sphere(.069,0,.481,.008,'hair',body);hair.scale.set(.89,.67,.72);
  for(const x of [-.023,.023])sphere(.006,x,.456,.070,'ink',body);
  sphere(.010,0,.440,.074,'skin',body);
  // Folded collar, satchel and a visible pencil in his drawing hand.
  shape([[-.05,.394],[0,.35],[.05,.394]],'paper',body,.008);
  if(traveler)box(.105,.12,.06,0,.29,-.05,'gold',body);
  const legs=[];for(const x of [-.041,.041]){const limb=node(body);limb.position.set(x,.215,.015);box(.046,.18,.045,0,-.09,0,'trousers',limb);box(.052,.035,.080,0,-.193,.018,'ink',limb);legs.push(limb);}
  const arms=[];for(const x of [-.089,.089]){const arm=node(body);arm.position.set(x,.365,.018);box(.034,.12,.036,0,-.06,0,color,arm);sphere(.023,0,-.133,.006,'skin',arm);arms.push(arm);}
  if(traveler){const pencil=box(.013,.17,.013,.007,-.15,.034,'gold',arms[1]);pencil.rotation.z=-.35;
  const tip=mesh(new T.ConeGeometry(.011,.038,8),'ink',arms[1]);tip.position.set(.038,-.245,.034);tip.rotation.z=Math.PI-.35;}
  return {actor,body,legs,arms};
 }
 const bob=person();bob.actor.name='bob';bob.actor.scale.setScalar(1.4);const friend=person('green');friend.actor.name='drawn-friend';friend.actor.scale.setScalar(1.22);
 // Oversized sketch sheets face the audience so each solution reads at phone widths.
 function panel(progress,type){const g=node(),p=sample(progress);g.name=`sketch-${type}`;g.position.copy(p).add(new T.Vector3(.50,.19,.12));g.rotation.y=-.22;g.scale.setScalar(2.1);
  shape([[-.17,0],[.17,0],[.17,.40],[-.17,.40]],'paper',g,.012);
  const lines=[];const draw=pts=>lines.push(stroke(pts.map(([x,y])=>[x,y,.028]),'ink',.009,g));
  if(type==='friend'){draw(Array.from({length:19},(_,i)=>[Math.cos(i/18*Math.PI*2)*.05,.30+Math.sin(i/18*Math.PI*2)*.05]));draw([[0,.25],[0,.12],[-.07,.03]]);draw([[0,.12],[.07,.03]]);draw([[-.10,.18],[0,.23],[.10,.18]]);}
  if(type==='phone'){draw([[-.09,.04],[-.09,.35],[.09,.35],[.09,.04],[-.09,.04]]);draw([[-.06,.10],[-.06,.29],[.06,.29],[.06,.10],[-.06,.10]]);draw([[0,.13],[0,.24],[-.035,.20],[0,.24],[.035,.20]]);}
  if(type==='door'){draw([[-.10,.02],[-.10,.36],[.10,.36],[.10,.02]]);draw([[-.09,.02],[.035,.08],[.035,.32],[-.09,.36]]);draw([[.01,.18],[.02,.18]]);}
  return {group:g,lines};
 }
 const panels=[panel(.23,'friend'),panel(.48,'phone'),panel(.70,'door')];
 const phone=node();phone.name='drawn-phone';box(.11,.18,.025,0,0,0,'ink',phone);box(.085,.13,.006,0,.01,.017,'paper',phone);stroke([[0,-.035,.025],[0,.045,.025],[-.025,.015,.025],[0,.045,.025],[.025,.015,.025]],'green',.006,phone);
 // The doorway is created only after the sketch is complete, then opens before Bob passes.
 const gate=node(),gp=sample(.79),next=sample(.795);gate.name='drawn-doorway';gate.position.copy(gp);gate.rotation.y=Math.atan2(next.x-gp.x,next.z-gp.z);
 for(const x of [-.24,.24]){box(.17,.60,.035,x,.30,0,'paper',gate);for(let j=0;j<3;j++)box(.008,.56,.005,x-.055+j*.055,.30,.022,'gold',gate);}
 box(.64,.035,.035,0,.62,0,'paper',gate);
 const door=node(gate);door.name='door-leaf';door.position.x=-.15;box(.30,.60,.025,.15,.30,0,'paper',door);const doorInk=stroke([[0,0,.02],[0,.59,.02],[.30,.59,.02],[.30,0,.02]],'ink',.008,door);sphere(.012,.25,.29,.026,'gold',door);
 // Peer pressure is a social encounter, not an unexplained icon on the ground.
 const peers=node();peers.name='off-path-peer-pressure';
 const peerAnchor=sample(.33);peerAnchor.x+=.95;peerAnchor.z+=.66;
 const beckoners=[];
 for(const [i,color] of ['muted','trousers'].entries()){
  const rig=person(color,false);peers.add(rig.actor);rig.actor.name=`beckoning-peer-${i+1}`;
  const x=peerAnchor.x+(i-.5)*.32,z=peerAnchor.z+i*.07;
  rig.actor.position.set(x,ground(x,z),z);rig.actor.scale.setScalar(1.18);rig.actor.rotation.y=-.5;
  const contact=new T.Mesh(new T.CircleGeometry(.15,24),new T.MeshBasicMaterial({color:0x483d39,transparent:true,opacity:.18,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.scale.y=.65;contact.position.set(x,ground(x,z)+.002,z);peers.add(contact);
  beckoners.push(rig);
 }
 const bubble=node(peers);bubble.name='come-with-us-speech';
 bubble.position.set(peerAnchor.x,ground(peerAnchor.x,peerAnchor.z)+.78,peerAnchor.z+.06);bubble.rotation.y=-.22;
 shape([[-.57,0],[-.23,0],[-.27,-.13],[-.07,0],[.57,0],[.57,.38],[-.57,.38]],'paper',bubble,.018);
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle='#553448';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 67px sans-serif';ctx.fillText('Come with us!',384,90);
  ctx.font='34px sans-serif';ctx.fillText('You can go home later.',384,177);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
  const label=new T.Mesh(new T.PlaneGeometry(1.08,.36),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));label.position.set(0,.19,.025);bubble.add(label);
 }
 // Give this encounter its own opacity, so it recedes once Bob walks past.
 const peerMaterials=new Map();peers.traverse(o=>{if(o.isMesh){if(!peerMaterials.has(o.material)){const material=o.material.clone();material.userData.encounterOpacity=material.opacity;peerMaterials.set(o.material,material);}o.material=peerMaterials.get(o.material);}});
 const homeHalo=node();homeHalo.position.copy(sample(1));const halo=mesh(new T.TorusGeometry(.16,.012,6,40),'gold',homeHalo);halo.rotation.x=-Math.PI/2;halo.position.y=.01;
 const place=(rig,q)=>{const p=sample(q),ahead=sample(Math.min(1,q+.004)),behind=sample(Math.max(0,q-.004));rig.actor.position.copy(p);rig.actor.rotation.y=Math.atan2(ahead.x-behind.x,ahead.z-behind.z);};
 function animate(time){const s=journeyMoment(time);Object.values(mats).forEach(m=>m.opacity=s.fade);group.visible=s.fade>.001;place(bob,s.progress);
  bob.body.position.y=s.walking?Math.abs(Math.sin(s.t*8))*.009:0;bob.legs.forEach((l,i)=>l.rotation.x=s.walking?Math.sin(s.t*8+i*Math.PI)*.38:0);bob.arms.forEach((a,i)=>a.rotation.x=s.drawing?(i===1?-.8+Math.sin(s.t*11)*.16:-.15):s.walking?Math.sin(s.t*8+i*Math.PI)*-.25:0);if(s.drawing)bob.actor.rotation.y=.7;
  friend.actor.visible=s.t>=10;friend.actor.scale.setScalar(1.22*s.friend);place(friend,Math.max(.065,s.progress-.095));friend.legs.forEach((l,i)=>l.rotation.x=s.walking?Math.sin(s.t*8+i*Math.PI+.6)*.35:0);
  panels.forEach((p,i)=>{const kind=['friend','phone','door'][i];p.group.visible=s.kind===kind;let count=p.lines.length;for(let j=0;j<count;j++){const geo=p.lines[j].geometry,total=geo.index.count,n=Math.floor(clamp(s.draw*count-j)*total/3)*3;geo.setDrawRange(0,n);}});
  phone.visible=s.t>=21&&s.t<28;phone.position.copy(bob.actor.position).add(new T.Vector3(.16,.45,.10));phone.rotation.y=bob.actor.rotation.y;
  gate.visible=s.doorSpawn>0;gate.scale.set(1.4,1.4*s.doorSpawn,1.4);door.rotation.y=-s.door*Math.PI*.72;
  const peerFade=s.fade*(1-ease((s.t-14)/3));peers.visible=peerFade>.001;peerMaterials.forEach(m=>m.opacity=peerFade*m.userData.encounterOpacity);beckoners.forEach((rig,i)=>{rig.arms[0].rotation.z=-1.05-Math.sin(s.t*3+i)*.23;rig.arms[0].rotation.x=-.6;rig.body.rotation.y=Math.sin(s.t*.9+i)*.06;});homeHalo.visible=s.kind==='home';homeHalo.scale.setScalar(1+Math.sin(s.t*3)*.07);
  // Ease from the establishing view into Bob's action, then reveal the full book at home.
  const follow=ease((s.t-1)/2)*(1-ease((s.t-42)/3));
  const focus=sample(s.progress).add(new T.Vector3(.22,.46,.10));
  group.userData.cameraCue={distance:1-.46*follow,x:focus.x*follow,y:(focus.y-1.1)*follow,z:focus.z*follow};
  return s;
 }
 animate(0);return {group,animate};
}
