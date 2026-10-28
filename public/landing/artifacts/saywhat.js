import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {saywhatScreen} from './saywhat-screen.js';
import {saywhatMoment,SAYWHAT_CYCLE,SAYWHAT_HITS} from './saywhat-timing.js';
export {saywhatMoment,SAYWHAT_CYCLE};
export function createArtifact(T){
 const {root,materials:m,mesh,box,disk,ball,line,texture,finish,batch}=medivoiceStudio(T);
 const palette={stone:0xe4d8bf,jade:0x285e4d,green:0x74ac87,dark:0x122e29,gold:0xb99150,lightgold:0xe7c77d,paper:0xeee5d2,leather:0x23453b,steel:0xb3b8ac,black:0x17221f};
 for(const [key,color] of Object.entries(palette))m[key]=new T.MeshStandardMaterial({color,roughness:['gold','lightgold','steel'].includes(key)?.3:.7,metalness:['gold','lightgold','steel'].includes(key)?.76:0});
 const stone=planningExhibitSurfaces(T).stone;m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.024;m.paper.bumpMap=texture('paper');m.paper.bumpScale=.009;m.leather.bumpMap=texture('cloth');m.leather.bumpScale=.009;m.green.emissive.setHex(0x365d43);m.green.emissiveIntensity=.35;
 const live=[];
 function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.08){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:20}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,key,p=root,r=.16){const o=round(w,d,h,x,y,z,key,p,r);o.rotation.x=-Math.PI/2;return o;}
 function label(txt,w,h,x,y,z,p=root,color='#ebd9ac',font='Georgia'){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const cx=c.getContext('2d');cx.fillStyle=color;cx.font=`${c.height*.67}px ${font}`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(txt,512,c.height/2,990);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 slab(10.8,4.9,.38,0,0,0,'stone',root,.54);slab(10.62,4.73,.045,0,-.04,0,'gold',root,.52);
 round(2.6,.44,.035,0,.19,2.48,'gold');round(2.48,.34,.03,0,.19,2.525,'dark');label('SayWhat?',2.17,.27,0,.19,2.59);
 // The UI stays large enough to explain what the physical waveform is doing.
 const monitor=group(1.05,2.65,-.56);round(6.76,3.77,.17,0,0,0,'gold',monitor,.16);round(6.66,3.68,.18,0,0,.035,'dark',monitor,.14);
 const ui=saywhatScreen(T),screen=new T.Mesh(new T.PlaneGeometry(6.37,3.58),ui.material);screen.position.set(0,0,.24);screen.name='saywhat-search-screen';monitor.add(screen);live.push(monitor);
 box(.57,.64,.20,1.05,.68,-.55,'gold');slab(1.78,.87,.10,1.05,.41,-.45,'dark');slab(1.63,.75,.035,1.05,.52,-.45,'gold');
 for(let n=0;n<36;n++)box(.05,.35,.018,-1.75+n*.16,1.0,-.58,'black');
 // Condenser microphone: grille wires, capsule, shock mount, yoke and screws.
 const mic=group(-3.62,.42,-.45);mic.scale.setScalar(1.2);disk(.52,.10,0,.05,0,'dark',mic);disk(.47,.035,0,.12,0,'gold',mic);disk(.075,1.10,0,.71,0,'gold',mic);disk(.13,.12,0,1.20,0,'dark',mic);
 const capsule=group(0,2.02,0,mic);capsule.rotation.z=-.09;
 const body=mesh(new T.CapsuleGeometry(.31,.91,12,32),'dark',capsule);body.position.y=.03;
 for(let n=0;n<27;n++){const y=-.64+n*.05,rad=Math.abs(y)>.46?Math.sqrt(Math.max(.003,.31*.31-(Math.abs(y)-.46)**2)):.315;const ring=mesh(new T.TorusGeometry(rad,.007,6,48),'steel',capsule);ring.rotation.x=Math.PI/2;ring.position.y=y;}
 for(let n=0;n<32;n++){const a=n*Math.PI*2/32;line([[Math.sin(a)*.20,-.72,Math.cos(a)*.20],[Math.sin(a)*.313,-.46,Math.cos(a)*.313],[Math.sin(a)*.313,.46,Math.cos(a)*.313],[Math.sin(a)*.20,.72,Math.cos(a)*.20]],.007,'steel',capsule);}
 for(const y of [-.45,.45]){const collar=mesh(new T.TorusGeometry(.326,.025,8,48),'gold',capsule);collar.rotation.x=Math.PI/2;collar.position.y=y;}
 round(.24,.41,.026,0,-.1,.31,'gold',capsule,.035);label('S',.17,.23,0,-.10,.36,capsule,'#163e31');
 line([[-.45,2.14,0],[-.45,1.44,0],[0,1.32,0],[.45,1.44,0],[.45,2.14,0]],.045,'gold',mic);for(const side of [-1,1]){const screw=disk(.09,.08,side*.44,2.11,0,'dark',mic);screw.rotation.z=Math.PI/2;}
 for(let n=0;n<8;n++){const a=n*Math.PI/4;line([[Math.cos(a)*.42,1.55,Math.sin(a)*.42],[Math.cos(a+.4)*.31,1.67,Math.sin(a+.4)*.31]],.012,'black',mic);}
 const record=ball(.048,.09,-.27,.37,'green',capsule);record.name='saywhat-record-light';
 // Headphones: leather cups and a two-layer sprung headband, with stitched rims.
 const hp=group(-3.55,.47,1.08);hp.scale.setScalar(1.2);hp.rotation.y=-.24;const arch=[];for(let j=0;j<=48;j++){const a=Math.PI*j/48;arch.push([Math.cos(a)*.59,.34+Math.sin(a)*.76,0]);}line(arch,.083,'leather',hp);line(arch.map(p=>[p[0],p[1]+.025,p[2]-.065]),.025,'gold',hp);
 for(const side of [-1,1]){const ear=group(side*.58,.30,0,hp);ear.rotation.z=side*.12;const cushion=ball(.28,0,0,0,'leather',ear);cushion.scale.set(.49,1.14,.90);const cap=disk(.215,.085,side*.10,0,0,'gold',ear);cap.rotation.z=Math.PI/2;const shell=disk(.205,.09,side*.15,0,0,'dark',ear);shell.rotation.z=Math.PI/2;for(let n=0;n<24;n++){const a=n*Math.PI*2/24;ball(.011,side*.03,Math.sin(a)*.24,Math.cos(a)*.19,'paper',ear);}}
 // A quiet paper notebook keeps the scene grounded in study and revision.
 const book=group(-1.9,.43,1.69);book.rotation.y=-.18;
 slab(1.94,1.02,.055,0,0,0,'jade',book,.05);for(const side of [-1,1]){const page=slab(.92,.94,.06,side*.47,.065,0,'paper',book,.025);page.rotation.z=side*.045;for(let n=0;n<6;n++)box(.70,.003,.008,side*.47,.13,-.12+n*.093,'gold',book);}const pageText=group(-.48,.14,-.30,book);pageText.rotation.x=-Math.PI/2;label('Lecture notes',.77,.11,0,0,.01,pageText,'#456052');
 line([[-1.01,.08,-.50],[0,.09,-.50],[1.01,.08,-.50]],.011,'gold',book);
 const pencil=line([[.19,.12,.53],[.91,.12,.53]],.024,'gold',book);const nib=mesh(new T.ConeGeometry(.025,.13,12),'dark',book);nib.rotation.z=Math.PI/2;nib.position.set(.125,.12,.53);
 // A cable makes the input-to-timeline relationship physical.
 const cable=[];for(let i=0;i<=100;i++){const u=i/100;cable.push([-3.65+u*1.40,.44, -.12+u*.63+Math.sin(u*Math.PI*12)*.06]);}line(cable,.025,'black');
 const rail=group(1.05,.46,.87);slab(6.91,.59,.11,0,0,0,'dark',rail,.10);slab(6.73,.42,.025,0,.12,0,'gold',rail,.06);
 const waves=group(0,0,0);waves.name='saywhat-waveform';live.push(waves);
 const count=88,left=-2.18,width=6.46,barGeometry=new T.CapsuleGeometry(.031,1,4,8),barMaterial=m.green.clone();barMaterial.roughness=.30;barMaterial.metalness=.2;
 const bars=new T.InstancedMesh(barGeometry,barMaterial,count);bars.name='saywhat-wave-bars';bars.castShadow=bars.receiveShadow=true;bars.frustumCulled=false;waves.add(bars);const transform=new T.Object3D(),green=new T.Color(0x6fb393),gold=new T.Color(0xf5c968),muted=new T.Color(0x29493c);
 const heights=Array.from({length:count},(_,i)=>.14+.65*Math.abs(Math.sin(i*1.79)*Math.cos(i*.24))+.19*Math.sin(i*.35)**2);
 // Seed the bounds at full height before static batching normalises the model.
 for(let i=0;i<count;i++){transform.position.set(left+i/(count-1)*width,.65+heights[i]/2,.87);transform.scale.set(1,heights[i],1);transform.updateMatrix();bars.setMatrixAt(i,transform.matrix);bars.setColorAt(i,green);}bars.computeBoundingBox();bars.computeBoundingSphere();
 const markers=SAYWHAT_HITS.map((hit,i)=>{const g=group(left+hit.u*width,.63,1.13);g.name=`saywhat-hit-${i}`;disk(.022,1.04,0,.52,0,'gold',g);ball(.055,0,1.06,0,'lightgold',g);round(.57,.21,.025,0,.03,.035,'dark',g,.025);label(hit.time,.47,.14,0,.03,.08,g);live.push(g);return g;});
 const cursor=group(left,.61,.92);cursor.name='saywhat-playhead';box(.018,1.31,.035,0,.65,.10,'paper',cursor);box(.15,.05,.20,0,1.32,.03,'lightgold',cursor);slab(.20,.44,.04,0,0,0,'lightgold',cursor,.035);live.push(cursor);
 const before=waves.position.clone(),model=finish(5,live),offset=waves.position.clone().sub(before),cursorBase=cursor.position.clone();
 Object.assign(model.userData,{artifactId:5,displayBase:false,contactFootprint:false,studioProfile:'saywhat',groundLevel:0,framingTargetY:2.30,initialYaw:-.055,initialElevation:.15,autoOrbit:false,realTimeAnimation:true,cycleDuration:SAYWHAT_CYCLE,
 animate(time){const s=saywhatMoment(time);ui.update(s);screen.userData.phase=s.phase;screen.userData.matches=s.matches;screen.userData.cursor=s.cursor;
  for(let i=0;i<count;i++){const u=i/(count-1),recording=s.phase===0,available=!recording||u<=s.capture;const active=s.playing&&Math.abs(u-s.cursor)<.065;const motion=active?1+Math.sin(s.t*8+i)*.16:1;const h=available?heights[i]*motion:.035;transform.position.set(left+u*width,.65+h/2,.87);transform.scale.set(1,h,1);transform.updateMatrix();bars.setMatrixAt(i,transform.matrix);const matched=s.phase>=2&&SAYWHAT_HITS.slice(0,s.matches).some(hit=>Math.abs(u-hit.u)<.034);bars.setColorAt(i,(matched?gold:available?green:muted).clone().multiplyScalar(.55+.45*s.fade));}bars.instanceMatrix.needsUpdate=true;bars.instanceColor.needsUpdate=true;
  markers.forEach((g,i)=>{g.visible=i<s.matches&&s.fade>.1;});cursor.position.copy(cursorBase);cursor.position.x=left+s.cursor*width+offset.x;cursor.visible=s.fade>.05;
  model.userData.playback={phase:s.phase,matches:s.matches,playing:s.playing,cursor:s.cursor};
 }});model.userData.animate(0);return model;
}
