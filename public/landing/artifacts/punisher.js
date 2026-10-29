import {medivoiceStudio} from './medivoice-studio.js';
import {preparePeople,punisherPeople} from './punisher-people.js';
import {punisherMoment,PUNISHER_STARTS} from './punisher-timing.js';
import {punisherScreen} from './punisher-screen.js';
export const prepareArtifact=preparePeople;
export function createArtifact(T){
 const {root,materials:m,mesh,box,disk,ball,line,texture,batch}=medivoiceStudio(T);
 for(const [k,color] of Object.entries({ivory:0xeadbc3,cloth:0xeee2cd,wine:0x632534,gold:0xb98a45,black:0x242122,paper:0xf4e7ce,leaf:0x496747,red:0xa84d34,bread:0xc28d4f,wood:0x9c7144}))m[k]=new T.MeshStandardMaterial({color,roughness:k==='gold'?.27:.68,metalness:k==='gold'?.78:0});
 const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
 const grain=texture('paper');m.ivory.bumpMap=grain;m.ivory.bumpScale=.008;m.cloth.bumpMap=texture('cloth');m.cloth.bumpScale=.012;m.wine.bumpMap=m.cloth.bumpMap;m.wine.bumpScale=.01;m.wine.roughness=.57;
 // Veined marble, colour and relief at different scales, shared by base and bench.
 const n=512,data=new Uint8Array(n*n*4);
 const hash=(x,y)=>{const h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h);};
 const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return (hash(ix,iy)*(1-u)+hash(ix+1,iy)*u)*(1-v)+(hash(ix,iy+1)*(1-u)+hash(ix+1,iy+1)*u)*v;};
 const fbm=(x,y)=>noise(x,y)*.55+noise(x*2.1,y*2.1)*.28+noise(x*4.3,y*4.3)*.12+noise(x*9,y*9)*.05;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=x/n,v=y/n,f=fbm(u*8,v*8),wave=Math.sin(u*17+v*11+f*17),vein=Math.pow(Math.max(0,1-Math.abs(wave)*22),1.4),fine=hash(x,y)*3,i=(y*n+x)*4;data[i]=20+f*19+vein*118+fine;data[i+1]=19+f*16+vein*96+fine;data[i+2]=18+f*12+vein*70+fine;data[i+3]=255;}
 const marble=new T.DataTexture(data,n,n);marble.colorSpace=T.SRGBColorSpace;marble.wrapS=marble.wrapT=T.RepeatWrapping;marble.needsUpdate=true;marble.magFilter=T.LinearFilter;marble.minFilter=T.LinearMipmapLinearFilter;marble.generateMipmaps=true;m.black.map=marble;m.black.color.setHex(0xffffff);m.black.roughness=.35;
 function round(w,h,d,x,y,z,k,p=root,r=.07){const s=new T.Shape();r=Math.min(r,w/2,h/2);s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:3,curveSegments:20}),k,p);o.position.set(x,y,z);return o;}
 function print(txt,w,h,x,y,z,p=root,color='#e4bc7b',bg=null){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);}ctx.fillStyle=color;ctx.font=`${c.height*.58}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,512,c.height/2,980);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 const base=disk(1,.40,0,.05,0,'black');base.scale.set(3.95,1,2.35);const trim=disk(1,.027,0,.265,0,'gold');trim.scale.set(3.93,1,2.33);const top=disk(1,.035,0,.29,0,'black');top.scale.set(3.92,1,2.32);
 print('The Punisher',2.45,.30,0,.05,2.40);for(const side of [-1,1])line([[side*1.45,.07,2.22],[side*2.3,.07,1.88]],.009,'gold');
 // Continuous curved stone bench with brass reveals.
 round(5.25,.75,.66,0,.72,-.65,'black',root,.18);round(5.4,.16,.79,0,1.18,-.69,'ivory',root,.08);round(5.24,.035,.69,0,1.08,-.65,'gold');
 for(let i=0;i<15;i++)box(.018,.50,.018,-2.25+i*.32,.73,.028,'gold');
 // Layered asymmetric feather fans, each feather a tapered sculpted surface.
 function feather(length,width,p,x,y,z,angle){const g=new T.SphereGeometry(1,12,10),a=g.attributes.position;for(let i=0;i<a.count;i++){const yy=a.getY(i);a.setXYZ(i,a.getX(i)*width*(.65+.35*(yy+1)/2),yy*length/2,a.getZ(i)*.035);}g.computeVertexNormals();const f=mesh(g,'ivory',p);f.position.set(x,y,z);f.rotation.z=angle;}
 for(const side of [-1,1]){const wing=group(-1.63,1.90,-.51);for(let row=0;row<4;row++)for(let j=0;j<11;j++){const u=j/10,xx=side*(.17+u*(1.04-row*.13)),yy=.25+Math.sin(u*Math.PI*.78)*.90-row*.17;feather(.73-row*.11,.105-row*.012,wing,xx,yy,-row*.065,side*(-.30-u*.76));}}
 // A discreet curved tail is a silhouette detail, not a threatening prop.
 line([[1.96,1.25,-.40],[2.8,.85,-.49],[3.27,1.15,-.56],[3.32,1.92,-.48],[3.10,2.05,-.39]],.035,'wine');const tailTip=mesh(new T.ConeGeometry(.075,.19,20),'wine');tailTip.position.set(3.09,2.06,-.39);tailTip.rotation.z=.6;
 // Open agreement folio sits between the two partners behind the phone.
 const folio=group(0,1.90,.12);folio.rotation.x=-.37;
 for(const side of [-1,1]){const page=group(side*.44,0,0,folio);page.rotation.y=side*.10;round(.88,.72,.055,0,0,0,'gold',page,.035);round(.83,.67,.014,0,0,.06,'paper',page,.025);for(let j=0;j<8;j++)box(.62,.010,.009,0,.19-j*.055,.112,'wood',page);}
 const pen=group(-.60,2.28,.27);line([[0,0,0],[.39,-.18,.06]],.018,'gold',pen);const nib=mesh(new T.ConeGeometry(.019,.09,12),'gold',pen);nib.position.set(.40,-.19,.06);nib.rotation.z=-2.0;
 // Upright phone: milled gold edge, dark glass bezel and a legible live contract.
 const phone=group(0,.40,1.00);phone.rotation.x=-.045;phone.scale.setScalar(.79);
 round(1.51,2.69,.11,0,1.35,0,'gold',phone,.18);round(1.43,2.61,.05,0,1.35,.12,'black',phone,.16);
 const ui=punisherScreen(T);if(ui.map){const screen=new T.Mesh(new T.PlaneGeometry(1.32,2.40),new T.MeshBasicMaterial({map:ui.map,toneMapped:false}));screen.position.set(0,1.35,.205);phone.add(screen);}
 box(.035,.22,.05,-.782,1.85,.05,'gold',phone);box(.035,.31,.05,.782,1.74,.05,'gold',phone);
 // Grocery basket: woven ribs, arched handle, bread, fruit and individual leaves.
 const basket=group(-1.62,.33,1.31);disk(.52,.04,0,.02,0,'gold',basket);const weave=group(0,.08,0,basket);
 for(let j=0;j<13;j++){const ring=mesh(new T.TorusGeometry(.37+j*.004,.013,6,60),'wood',weave);ring.rotation.x=Math.PI/2;ring.position.y=j*.035;}
 for(let j=0;j<34;j++){const a=j/34*Math.PI*2;line([[Math.cos(a)*.37,0,Math.sin(a)*.37],[Math.cos(a)*.42,.46,Math.sin(a)*.42]],.009,'bread',weave);}
 line([[-.40,.47,0],[-.35,.84,0],[0,1.03,0],[.35,.84,0],[.40,.47,0]],.025,'wood',weave);
 const groceries=group(0,.20,0,weave);groceries.name='grocery-task';const groceryParts=[group(0,0,0,groceries),group(0,0,0,groceries),group(0,0,0,groceries)];groceryParts.forEach((p,i)=>p.name=`grocery-delivery-${i}`);const loaf=ball(.16,-.17,.29,-.03,'bread',groceryParts[0]);loaf.scale.set(.75,2.2,.85);loaf.rotation.z=.30;for(let j=0;j<4;j++)line([[-.27,.35+j*.07,.11],[-.16,.38+j*.07,.12]],.008,'paper',groceryParts[0]);
 for(let j=0;j<9;j++){const a=j*2.4;ball(.083,Math.sin(a)*.22,.30+(j%3)*.07,Math.cos(a)*.23,j%2?'red':'leaf',groceryParts[1]);}
 for(let j=0;j<22;j++){const a=j*2.4;const leaf=ball(.095,Math.sin(a)*.29,.43+(j%5)*.035,Math.cos(a)*.23,'leaf',groceryParts[2]);leaf.scale.set(.5,1.4,.24);leaf.rotation.z=Math.sin(a);}
 // Household consequence props stay on their own tray, never mistaken for a reward.
 const chores=group(1.65,.35,1.35);disk(.57,.04,0,0,0,'gold',chores);const bucket=mesh(new T.CylinderGeometry(.28,.23,.47,48,1,true),'gold',chores);bucket.position.set(0,.27,0);disk(.235,.02,0,.04,0,'wine',chores);for(const y of [.06,.49]){const rim=mesh(new T.TorusGeometry(y>.1?.28:.23,.014,8,48),'gold',chores);rim.rotation.x=Math.PI/2;rim.position.y=y;}
 line([[-.28,.44,0],[-.22,.71,0],[.22,.71,0],[.28,.44,0]],.012,'gold',chores);
 const towel=new T.PlaneGeometry(.27,.67,14,30),tp=towel.attributes.position;for(let i=0;i<tp.count;i++){const v=tp.getY(i)+.335;tp.setXYZ(i,tp.getX(i)+.19,.06+v*.75,.18+Math.sin(v*3.8)*.11+Math.cos(tp.getX(i)*45)*.012);}towel.computeVertexNormals();mesh(towel,'cloth',chores).material.side=T.DoubleSide;
 round(.42,.10,.14,-.30,.10,.35,'wood',chores,.04);for(let j=0;j<40;j++)line([[-.49+(j%10)*.039,.065,.36+Math.floor(j/10)*.035],[-.50+(j%10)*.041,.01,.37+Math.floor(j/10)*.035]],.006,'bread',chores);
 // Hourglass communicates the contract window; tiny sand stream moves only in task phase.
 const clock=group(.98,1.29,-.03);for(const y of [0,.59])disk(.18,.035,0,y,0,'gold',clock);for(let j=0;j<4;j++){const a=j*Math.PI/2;line([[Math.cos(a)*.14,0,Math.sin(a)*.14],[Math.cos(a)*.14,.59,Math.sin(a)*.14]],.012,'gold',clock);}
 m.glass=new T.MeshPhysicalMaterial({color:0xffe9bf,roughness:.05,transparent:true,opacity:.19,depthWrite:false,side:T.DoubleSide});const glass=mesh(new T.LatheGeometry([new T.Vector2(.13,.04),new T.Vector2(.12,.12),new T.Vector2(.025,.295),new T.Vector2(.12,.48),new T.Vector2(.13,.55)],40),'glass',clock);glass.castShadow=false;glass.userData.noShadow=true;
 const sand=mesh(new T.ConeGeometry(.10,.13,32),'bread',clock);sand.position.y=.105;const stream=line([[0,.17,0],[0,.45,0]],.004,'bread',clock);
 // Rock / paper / scissors medallions are engraved with hand drawings, not emojis.
 const tokens=[];for(let j=0;j<3;j++){const g=group((j-1)*.47,.36,1.93);g.name=`role-token-${j}`;tokens.push(g);disk(.21,.055,0,0,0,'gold',g);disk(.18,.018,0,.035,0,'wine',g);const icon=group(0,.052,0,g);icon.rotation.x=-Math.PI/2;const points=j===0?[[-.08,-.06],[-.09,.04],[-.05,.08],[-.02,.04],[.01,.08],[.04,.04],[.07,.06],[.09,-.05],[.03,-.09],[-.08,-.06]]:j===1?[[-.07,-.08],[-.11,0],[-.09,.02],[-.04,-.02],[-.06,.10],[-.03,.11],[-.01,.02],[0,.13],[.03,.13],[.03,.02],[.06,.11],[.09,.10],[.07,-.04],[.03,-.09],[-.07,-.08]]:[[-.06,-.08],[-.08,-.02],[-.04,.02],[-.08,.11],[-.05,.13],[0,.05],[.04,.14],[.07,.12],[.03,.01],[.08,-.01],[.07,-.07],[-.06,-.08]];line(points.map(([x,y])=>[x,y,0]),.012,'gold',icon);}
 const routes=[];for(const x of [-1.62,1.65]){const path=new T.CatmullRomCurve3([new T.Vector3(x,.33,1.29),new T.Vector3(x*.6,.33,1.57),new T.Vector3(0,.33,1.64),new T.Vector3(0,.33,1.03)]);line(path.getPoints(40).map(p=>p.toArray()),.012,'gold');const bead=ball(.045,0,0,0,'gold');routes.push({path,bead});}
 // The story gets a readable physical focus: a raised signed agreement and approval seal.
 const signature=group(0,0,0,folio);signature.name='contract-signature';
 const strokes=[];for(let j=0;j<28;j++){const x=-.73+j*.052,y=-.22+Math.sin(j*.7)*.025;strokes.push(line([[x,y,.105],[x+.052,-.22+Math.sin((j+1)*.7)*.025,.105]],.007,'wine',signature));}
 const seal=group(0,2.65,1.40);seal.name='partner-approval-seal';
 m.approved=new T.MeshStandardMaterial({color:0x386d53,roughness:.32,metalness:.25,emissive:0x2d6a49,emissiveIntensity:.3});
 const sealFace=disk(.36,.06,0,0,0,'approved',seal);sealFace.rotation.x=Math.PI/2;
 const sealRim=mesh(new T.TorusGeometry(.36,.022,12,64),'gold',seal);
 line([[-.17,0,.06],[-.04,-.12,.06],[.19,.15,.06]],.035,'paper',seal);
 const haloRings=[];for(let i=0;i<2;i++){const mat=new T.MeshBasicMaterial({color:0xe6bc72,transparent:true,opacity:0,depthWrite:false});const ring=new T.Mesh(new T.TorusGeometry(.39,.009,8,64),mat);seal.add(ring);haloRings.push(ring);}
 const tokenRims=tokens.map(g=>{const ring=mesh(new T.TorusGeometry(.24,.014,8,48),'gold',g);ring.rotation.x=Math.PI/2;ring.position.y=.05;return ring;});
 // Batch static sculpted details before adding skeletons. Keep animated assemblies intact.
 routes.forEach(({bead})=>root.remove(bead));clock.remove(stream);folio.remove(signature);root.remove(seal);tokens.forEach((g,i)=>g.remove(tokenRims[i]));batch(root);folio.add(signature);root.add(seal);tokens.forEach((g,i)=>g.add(tokenRims[i]));routes.forEach(({bead})=>root.add(bead));clock.add(stream);
 const updatePeople=punisherPeople(T,{root,m,group,mesh,line,ball});
 const framingPoints=[];for(let j=0;j<48;j++){const a=j/48*Math.PI*2;for(const y of [-.2,.32])framingPoints.push(new T.Vector3(Math.cos(a)*3.96,y,Math.sin(a)*2.36));}for(const x of [-2.9,-1.7,1.7,3.2])framingPoints.push(new T.Vector3(x,3.25,-.5));
 let selected=null,offset=0;const starts=PUNISHER_STARTS;
 root.userData={artifactId:30,conceptual:true,displayBase:false,studioProfile:'punisher',groundLevel:-.17,initialYaw:-.07,initialElevation:.22,autoOrbit:false,realTimeAnimation:true,
 framingPoints,framingTargetY:1.55,cameraFitSway:0,framingBounds:new T.Box3(new T.Vector3(-4,-.2,-2.4),new T.Vector3(4,3.35,2.4)),
 setStep(index,elapsed){selected=index===null?null:Math.max(0,Math.min(3,index));offset=elapsed;},
 animate(time){
 const local=Math.max(0,time-offset),hold=[4.5,5,5.5,6];
 const s=punisherMoment(selected===null?local:starts[selected]+Math.min(local,hold[selected]));
 ui.update(s);root.userData.story=s;updatePeople(s);
 // Tokens rise, face the viewer and visibly resolve paper beating rock.
 tokens.forEach((g,j)=>{const winner=j===1&&s.winner;g.position.set((j-1)*(.47+.35*s.select),.36+s.select*(winner?.85:.52),1.93);g.rotation.x=s.select*Math.PI/2;g.rotation.z=s.select*(s.winner?0:Math.sin(s.t*5+j)*.14);g.scale.setScalar(1+s.select*(winner?1.6:.7));tokenRims[j].visible=winner;});
 folio.position.set(0,1.90+s.agree*.90,.12+s.agree*.55);folio.rotation.x=-.37+s.agree*.28;folio.scale.setScalar(1+s.agree*.3);
 signature.visible=s.index===1;strokes.forEach((stroke,j)=>stroke.visible=j/28<s.sign);
 // Pen visibly traverses the signature, then rests beside the closed agreement.
 pen.visible=s.index===1;pen.position.set(-.72+s.sign*1.5,2.67+s.agree*.1+Math.sin(s.sign*20)*.035,.85);pen.rotation.z=-.5+s.sign*.20;
 groceries.position.y=.20;groceries.scale.setScalar(1);
 groceryParts.forEach((part,i)=>{const p=s.drops[i];part.visible=s.t>=15.5+i*1.3;part.position.set(-(1-p)*(.65+i*.15),(1-p)*1.75+Math.sin(p*Math.PI)*.30,0);part.rotation.z=(1-p)*-.35;});
 stream.visible=s.index===2;
 routes.forEach(({path,bead},i)=>{bead.visible=i===0&&s.t>=20&&s.t<22.5;bead.scale.setScalar(2);bead.position.copy(path.getPointAt(Math.min(1,Math.max(0,(s.t-20)/2.5))));});
 seal.visible=s.seal>0;seal.scale.setScalar(s.seal);seal.position.y=2.65+Math.sin(s.seal*Math.PI)*.15;
 haloRings.forEach((r,i)=>{const p=Math.max(0,Math.min(1,(s.t-27-i*.5)/2));r.scale.setScalar(1+p*1.4);r.material.opacity=(1-p)*.7;});
 // Gentle guided close-ups yield immediately when the visitor manually orbits.
 root.userData.cameraCue={distance:1-.07*(s.index===1?s.agree:s.index===3?s.seal:s.select),x:0,y:.06,z:.08,yaw:0};
 }};root.userData.animate(0);return root;
}
