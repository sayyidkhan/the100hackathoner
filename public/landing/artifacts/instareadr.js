import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {instaMoment,INSTA_CYCLE} from './insta-timing.js';
import {instaOutput} from './insta-output.js';
export function createArtifact(T){
 const {root,materials:m,mesh,box,disk,ball,line,finish,batch}=medivoiceStudio(T),live=[];
 for(const [key,color] of Object.entries({stone:0xe4dac4,cream:0xf3e9d2,ink:0x163d3b,teal:0x33796d,mint:0x9dd3b9,gold:0xb99856,light:0x8ae2c5}))m[key]=new T.MeshStandardMaterial({color,roughness:key==='gold'?.3:.6,metalness:key==='gold'?.78:0});
 m.glass=new T.MeshPhysicalMaterial({color:0xb9e8d6,roughness:.12,metalness:.12,transparent:true,opacity:.14,depthWrite:false});
 const stone=planningExhibitSurfaces(T).stone;m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.018;m.cream.map=stone;m.cream.bumpMap=stone;m.cream.bumpScale=.005;m.light.emissive.setHex(0x64c5a7);m.light.emissiveIntensity=.6;
 function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.06){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:Math.min(.012,d*.2),bevelThickness:Math.min(.012,d*.2),bevelSegments:3,curveSegments:14}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,key,p=root,r=.12){const o=round(w,d,h,x,y,z,key,p,r);o.rotation.x=-Math.PI/2;return o;}
 function text(txt,w,h,x,y,z,p=root,color='#f2e6c5',font='Arial'){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const cx=c.getContext('2d');cx.fillStyle=color;cx.font=`500 ${c.height*.7}px ${font}`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(txt,512,c.height/2,1000);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 function torus(r,t,x,y,z,key,p=root){const o=mesh(new T.TorusGeometry(r,t,6,40),key,p);o.position.set(x,y,z);return o;}
 // An open reading desk, with the phone as the focal object.
 slab(13.4,4.4,.25,.55,0,0,'stone',root,.65);slab(13.3,4.3,.045,.55,-.02,0,'ink',root,.62);
 const brand=group(0,.195,1.70);brand.rotation.x=-Math.PI/2;text('INSTAREADR',2.25,.25,0,0,.01,brand,'#315f53');
 const book=group(-3.35,1.75,.05);book.rotation.x=-.65;book.rotation.y=.12;book.rotation.z=.04;
 round(4.05,3.12,.075,0,0,0,'ink',book,.06);
 function pageTexture(side){if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=768;c.height=1100;const cx=c.getContext('2d');cx.fillStyle='#f1e7d2';cx.fillRect(0,0,768,1100);cx.fillStyle='#365548';cx.font='24px Arial';cx.fillText('INSTAREADR / SOURCE',65,80);cx.font='42px Georgia';cx.fillText(side<0?'The long version':'How it works',65,161);const lines=side<0?['A distributed ledger records','information across a network.','Participants maintain copies','on multiple computers, rather','than relying on one server.','','Updates are grouped into blocks.','Each new block references the','previous one, creating a history','that the network can check.']:['A shared set of rules determines','which updates can be accepted.','These rules vary between networks','and the purpose of each design.','','Cryptographic keys authorise','actions. Private keys must remain','secret to protect their owner.','','Understanding the structure','makes the ideas easier to follow.'];cx.font='26px Georgia';lines.forEach((v,i)=>{if(i===2||i===7){cx.fillStyle='#b7d4b7';cx.fillRect(60,228+i*49,650,35);}cx.fillStyle='#526052';cx.fillText(v,65,255+i*49);});cx.font='22px Georgia';cx.fillText(side<0?'01 — Shared records':'02 — Rules & ownership',65,978);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}
 for(const side of [-1,1]){const mat=new T.MeshStandardMaterial({color:0xf5ecda,roughness:.9,map:pageTexture(side)});m['page'+side]=mat;
 for(let layer=0;layer<9;layer++){const pos=[],uv=[],ix=[],nx=28,ny=12;for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/ny;pos.push(side*(.04+u*1.89),-1.44+v*2.88,.10+layer*.013+.17*Math.sin(u*Math.PI)+.045*u);uv.push(side<0?1-u:u,v);}for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;ix.push(a,a+1,b,a+1,b+1,b);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();mesh(g,layer===8?'page'+side:'cream',book).material.side=T.DoubleSide;}}
 line([[0,-1.52,.19],[0,0,.19],[0,1.52,.19]],.028,'gold',book);
 // A ribbon bookmark grounds the source as a real reading object.
 const ribbon=round(.14,.80,.012,.58,-1.47,.25,'teal',book,.015);ribbon.rotation.z=.08;
 for(const x of [-4.85,-1.85]){box(.06,.57,.65,x,.48,-.30,'gold');slab(.42,.95,.08,x,.19,-.25,'ink');}
 const scan=group();box(2.9,.025,.015,0,0,0,'light',scan);live.push(scan);
 for(let j=0;j<43;j++){const page=slab(2.5+(j%3)*.04,1.38,.045,-3.6+(j%4)*.014,1.95+j*.075,-1.10,'cream',root,.02);page.rotation.y=(j%3-1)*.02;}
 round(2.32,.68,.035,-3.6,4.72,-.36,'ink');text('LARGE SOURCE',2.12,.20,-3.6,4.84,-.31,root);text('MATERIAL',2.12,.20,-3.6,4.59,-.31,root);
 // Glass distillation vessel with layered machined fittings and visible circuitry.
 for(const [r,y,h,key] of [[1.18,.36,.19,'ink'],[1.13,.50,.14,'gold'],[1.04,.65,.12,'teal'],[1.12,.76,.08,'gold'],[1.06,4.42,.12,'gold'],[1.15,4.56,.11,'gold'],[.76,4.85,.12,'gold'],[.53,4.98,.12,'ink'],[.52,5.09,.09,'gold']])disk(r,h,-.45,y,-.27,key);
 disk(1.02,3.60,-.45,2.60,-.27,'glass');
 const dome=mesh(new T.SphereGeometry(1.03,48,20,0,Math.PI*2,0,Math.PI/2),'glass');dome.position.set(-.45,4.50,-.27);dome.scale.y=.35;
 for(const yy of [.84,4.40]){const o=torus(1.03,.032,-.45,yy,-.27,'gold');o.rotation.x=Math.PI/2;for(let j=0;j<16;j++){const a=j/16*Math.PI*2;disk(.036,.055,-.45+Math.cos(a)*1.08,yy+.065,-.27+Math.sin(a)*1.08,'ink');}}
 for(const a of [.55,2.59,3.7,5.72]){const x=-.45+Math.cos(a)*1.03,z=-.27+Math.sin(a)*1.03;box(.042,3.52,.042,x,2.61,z,'gold');}
 const core=group(-.45,2.55,.42);round(1.03,1.04,.12,0,0,0,'gold',core,.08);round(.90,.91,.04,0,0,.13,'ink',core,.06);text('AI',.72,.49,0,0,.18,core,'#efffe9');
 for(let j=0;j<7;j++){const yy=-.39+j*.13;box(.15,.045,.06,-.58,yy,.04,'gold',core);box(.15,.045,.06,.58,yy,.04,'gold',core);}
 const circuitry=group(-.45,0,0);
 for(let j=0;j<10;j++){const xx=-.85+j*.19,yy=1.0+(j%3)*.16;line([[xx,yy,-.10],[xx,1.50+(j%2)*.13,.0],[xx*.62,1.85,.1],[xx*.62,2.13,.35]],.012,j%3?'gold':'light',circuitry);line([[xx,3.05,.32],[xx,3.48,.10],[xx*.7,3.78,-.1],[xx*.7,4.2,-.1]],.014,j%3?'gold':'light',circuitry);ball(.027,xx,yy,-.1,'light',circuitry);}
 round(2.1,.44,.04,-.45,.70,.85,'ink');text('DIGEST · DISTIL · SIMPLIFY',1.98,.18,-.45,.70,.90,root,'#e8d4a1');
 const rotor=group(-.45,3.75,-.27);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ball(.043,Math.cos(a)*.67,0,Math.sin(a)*.67,'light',rotor);}batch(rotor);live.push(rotor);
 const extracts=[];for(let i=0;i<5;i++){const g=group(),pos=[],uv=[],ix=[];for(let j=0;j<=24;j++){const u=j/24;for(const v of [-1,1]){pos.push((u-.5)*1.05,v*.065,Math.sin(u*Math.PI)*.15);uv.push(u,(v+1)/2);}if(j<24){const a=j*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();mesh(geo,'mint',g).material.side=T.DoubleSide;for(let j=0;j<6;j++)box(.08,.008,.008,-.40+j*.16,0,.10,'teal',g);batch(g);live.push(g);extracts.push(g);}
 // Main reading screen, brass dock and side controls.
 const phone=group(3.25,3.30,.10);phone.rotation.y=-.16;phone.scale.setScalar(1.18);
 round(2.7,5.10,.16,0,0,0,'gold',phone,.23);round(2.60,5.0,.17,0,0,.04,'ink',phone,.22);
 const ui=instaOutput(T),screen=new T.Mesh(new T.PlaneGeometry(2.35,4.57),ui.material);screen.position.z=.225;screen.name='insta-screen';phone.add(screen);round(.72,.13,.025,0,2.24,.24,'ink',phone,.06);box(.04,.35,.06,-1.37,.7,.07,'gold',phone);box(.04,.20,.06,-1.37,1.23,.07,'gold',phone);live.push(phone);slab(3.28,1.1,.13,3.25,.18,.22,'ink');
 const videoUI=instaOutput(T,true),videoPanel=group(5.4,1.70,.45);videoPanel.rotation.x=-.20;
 round(2.30,1.46,.09,0,0,0,'ink',videoPanel,.10);const videoFace=new T.Mesh(new T.PlaneGeometry(2.14,1.26),videoUI.material);videoFace.position.z=.11;videoPanel.add(videoFace);live.push(videoPanel);disk(.42,.10,5.4,.30,.45,'gold');box(.065,.68,.065,5.4,.66,.45,'gold');
 const routes=[[[-1.6,1.75,.8],[-1.5,2.15,.7],[-.45,2.2,.45]],[[-.45,2.2,.45],[1.0,2.75,.6],[1.7,3.4,.24]]];
 const curves=routes.map(p=>new T.CatmullRomCurve3(p.map(v=>new T.Vector3(...v)))),pulses=[];
 // Flow is shown by moving extracts, without rigid wires crossing the lesson.
 for(let i=0;i<2;i++){const g=group();ball(.05,0,0,0,'light',g);live.push(g);pulses.push(g);}
 const outputFlow=group();for(let j=0;j<3;j++)line([[.6,2.8+j*.10,-.2],[1.05,3.05+j*.12,-.12],[1.6,3.4+j*.1,.16]],.013,'light',outputFlow);live.push(outputFlow);batch(outputFlow);
 const anchor=group();live.push(anchor);const model=finish(32,live),offset=anchor.position.clone();model.remove(anchor);model.traverse(o=>{if(o.material===m.glass){o.castShadow=false;o.renderOrder=2;}});const v=new T.Vector3();
 Object.assign(model.userData,{artifactId:32,displayBase:false,contactFootprint:false,studioProfile:'instareadr',groundLevel:0,initialYaw:.12,initialElevation:.23,framingTargetY:2.4,cameraFitSway:0,autoOrbit:false,realTimeAnimation:true,cycleDuration:INSTA_CYCLE,
 animate(time){const s=instaMoment(time);model.userData.story=s;ui.update(s);videoUI.update(s);videoPanel.visible=s.process===1;outputFlow.visible=s.process===1&&s.fade>.05;screen.userData.phase=s.phase;
 scan.visible=s.t>=1&&s.t<5;scan.position.set(-3.35,2.9-s.ingest*1.6,1.15+s.ingest*.35).add(offset);rotor.rotation.y=s.phase===1?s.t*.8:s.process*Math.PI*2; m.light.emissiveIntensity=.35+(s.phase===1?1.5*Math.sin(s.t*3)**2:0);
 extracts.forEach((g,i)=>{const f=Math.max(0,Math.min(1,(s.t-3-i*.42)/2));g.visible=f>0&&f<1;g.position.set(-2.8+f*2.35,1.9+f*.3,.9-f*.6+Math.sin(f*Math.PI)*.3).add(offset);g.scale.setScalar(1-f*.55);});
 pulses.forEach((g,i)=>{const f=i===0?s.ingest:s.process;g.visible=f>0&&f<1;curves[i].getPoint(f,v);g.position.copy(v).add(offset);});
 }});model.userData.animate(0);return model;
}
export default createArtifact;
