import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {goblinScreen} from './goblin-screen.js';
import {goblinMoment,GOBLIN_CYCLE} from './goblin-timing.js';
import {prepareGoblinPeople,goblinPeople} from './goblin-people.js';
export {goblinMoment,GOBLIN_CYCLE};
export const prepareArtifact=prepareGoblinPeople;
export function createArtifact(T,options={}){
 const {root,materials:m,mesh,box,disk,ball,line,texture,finish,batch}=medivoiceStudio(T);
 for(const [key,color] of Object.entries({forest:0x204b3b,sage:0x73876b,stone:0xe5d9bc,cream:0xf1e5c9,gold:0xb99752,copper:0xa36842,steel:0x9aaca4,wood:0x926239,dark:0x182c28,glass:0x557968,leaf:0x3e6144,leaf2:0x7e8d53,amber:0xe5b657,mint:0x93caa6,board:0x285e49}))m[key]=new T.MeshStandardMaterial({color,roughness:['gold','steel','copper'].includes(key)?.34:.76,metalness:['gold','steel','copper'].includes(key)?.7:0});
 const stone=planningExhibitSurfaces(T).stone;m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.022;
 for(const k of ['wood','forest','cream']){m[k].bumpMap=texture(k==='wood'?'wood':'paper');m[k].bumpScale=k==='wood'?.018:.005;}
 m.amber.emissive.setHex(0xffb645);m.amber.emissiveIntensity=.65;m.mint.emissive.setHex(0x8edcb1);m.mint.emissiveIntensity=.45;
 function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.08){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:16}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,k,p=root,r=.12){const o=round(w,d,h,x,y,z,k,p,r);o.rotation.x=-Math.PI/2;return o;}
 function label(txt,w,h,x,y,z,p=root,col='#f5e6bc') {if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=col;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${c.height*.65}px ${txt==='Goblin'?'Georgia':'Arial'}`;ctx.fillText(txt,512,c.height/2,990);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 function screw(x,y,z,p=root){const b=disk(.025,.017,x,y,z,'gold',p);b.rotation.x=Math.PI/2;box(.025,.005,.005,x,y,z+.012,'dark',p);}
 slab(10.5,5.2,.42,0,0,0,'stone',root,.60);slab(10.32,5.05,.045,0,-.04,0,'gold',root,.57);
 round(2.9,.46,.045,0,.19,2.62,'gold');round(2.76,.34,.035,0,.19,2.68,'forest');label('Goblin',2.1,.28,0,.19,2.74);screw(-1.25,.19,2.73);screw(1.25,.19,2.73);
 // A local collection counter, inspired by the pitch's ambassador programme.
 const booth=group(-3.15,.45,-.85);round(2.65,2.52,.14,0,1.32,-.60,'forest',booth,.05);
 for(const x of [-1.29,1.29]){box(.08,2.65,.08,x,1.32,.55,'gold',booth);box(.12,2.55,.14,x,1.32,-.57,'gold',booth);}
 slab(2.92,1.65,.18,0,2.80,-.02,'forest',booth,.15);slab(2.98,1.69,.035,0,2.75,-.02,'gold',booth,.15);
 round(2.85,.34,.08,0,2.62,.83,'forest',booth);label('GOBLIN',2.3,.27,0,2.62,.94,booth);
 // Shelves, pegboard and lamps create depth without hiding the ambassador.
 for(const side of [-1,1])for(let level=0;level<3;level++){box(.48,.035,.35,side*.92,.66+level*.53,-.30,'gold',booth);for(let n=0;n<3;n++){const p=round(.085,.17,.027,side*.92-.14+n*.14,.77+level*.53,-.30,n%2?'sage':'cream',booth,.013);}}
 round(.88,1.34,.02,0,1.56,-.425,'cream',booth,.025);label('GIVE OLD TECH',.75,.13,0,1.95,-.38,booth,'#365441');label('A NEW CHAPTER',.75,.13,0,1.71,-.38,booth,'#365441');
 for(const x of [-.85,.85]){line([[x,2.73,.32],[x,2.46,.32]],.015,'gold',booth);const shade=mesh(new T.ConeGeometry(.19,.12,40,1,true),'gold',booth);shade.position.set(x,2.42,.32);disk(.14,.018,x,2.37,.32,'amber',booth);}
 const counter=group(-3.0,.46,.45);slab(2.18,1.04,.12,0,.85,0,'stone',counter,.10);round(2.02,.81,.78,0,.42,-.40,'wood',counter,.08);for(let i=0;i<35;i++)box(.022,.73,.032,-.97+i*.057,.44,.41,'gold',counter);slab(2.12,.97,.045,0,.05,0,'gold',counter);label('COMMUNITY COLLECTION',1.80,.14,0,.65,.445,counter);
 // Real adult meshes with quiet, timed welcome gestures.
 const people=goblinPeople(T,options.people);people[0].pivot.position.set(-3.0,.46,-.25);people[1].pivot.position.set(-4.45,.46,1.0);people[1].pivot.rotation.y=1.0;people.forEach(a=>root.add(a.pivot));
 disk(.26,.09,-3.0,1.02,-.25,'forest');for(const dx of [-.16,.16])for(const dz of [-.14,.14])line([[-3+dx,1,-.25+dz],[-3+dx*1.2,.45,-.25+dz*1.2]],.025,'gold');
 // Layered housing facade gives the scene a Singapore neighbourhood setting.
 const block=group(2.83,.45,-2.0);box(3.35,3.56,.33,0,1.78,0,'stone',block);for(let floor=0;floor<4;floor++){const y=.50+floor*.75;box(3.46,.09,.48,0,y-.27,.10,'cream',block);for(let col=0;col<5;col++){const x=-1.30+col*.65;box(.43,.43,.07,x,y,.19,'dark',block);box(.37,.37,.08,x,y,.22,'glass',block);box(.025,.41,.025,x,y,.28,'cream',block);box(.42,.025,.025,x,y,.28,'cream',block);}}for(const x of [-1.62,-.35,1.62])box(.10,3.6,.12,x,1.8,.25,'cream',block);
 // Diagnostic panel remains synchronized with the physical phone on the belt.
 const panel=group(.05,2.67,-1.05);round(2.20,2.75,.08,0,0,0,'gold',panel,.07);round(2.1,2.65,.08,0,0,.05,'cream',panel,.055);
 const ui=goblinScreen(T),screen=new T.Mesh(new T.PlaneGeometry(1.99,2.49),ui.material);screen.position.z=.16;panel.add(screen);for(const x of [-1.08,1.08])line([[x,-1.3,.015],[x,-2.15,.015]],.027,'gold',panel);
 // Parallel rollers provide a mechanically coherent route through inspection.
 const approach=new T.CatmullRomCurve3([[-.90,1.38,1.65],[-.60,1.38,1.13],[-.22,1.38,.60],[0,1.38,.14]].map(p=>new T.Vector3(...p)));
 const branches=[-.76,1.14].map(z=>new T.CatmullRomCurve3([[0,1.38,.14],[.8,1.38,.14],[1.70,1.38,z],[2.86,1.38,z],[3.36,1.38,z]].map(p=>new T.Vector3(...p))));
 const rollers=[];
 function belt(curve,count){for(let n=0;n<count;n++){const t=n/(count-1),p=curve.getPointAt(t),v=curve.getTangentAt(t),normal=new T.Vector3(v.z,0,-v.x);const r=mesh(new T.CylinderGeometry(.044,.044,.62,16),'steel');r.position.copy(p).add(new T.Vector3(0,-.065,0));r.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),normal);for(const side of [-1,1]){const a=p.clone().addScaledVector(normal,side*.36);const rail=box(.045,.16,.11,a.x,p.y-.07,a.z,'forest');rail.rotation.y=Math.atan2(v.x,v.z);if(n%5===0){screw(a.x,p.y-.02,a.z+.027);line([[a.x,.45,a.z],[a.x,p.y-.08,a.z]],.025,'steel');disk(.075,.025,a.x,.46,a.z,'gold');}}}
 for(const side of [-1,1]){const ps=[];for(let n=0;n<=45;n++){const t=n/45,p=curve.getPointAt(t),v=curve.getTangentAt(t);p.add(new T.Vector3(v.z,0,-v.x).multiplyScalar(side*.36));p.y+=.045;ps.push(p.toArray());}line(ps,.018,'gold');}}
 belt(approach,22);branches.forEach(c=>belt(c,29));
 // Inspection arch and small scan bar: only active while a phone is stopped here.
 for(const x of [-.43,.43]){round(.09,.64,.10,x,1.63,.12,'steel');screw(x,1.89,.24);}round(1.0,.13,.12,0,1.98,.10,'steel');box(.70,.018,.035,0,1.90,.18,'amber');
 const scan=group(0,0,0);const scanBar=box(.49,.016,.025,0,1.44,.14,'amber',scan);scan.name='goblin-inspection-scan';
 const beacon=ball(.064,0,4.17,-1.0,'amber');beacon.name='goblin-inspection-beacon';disk(.10,.055,0,4.10,-1.0,'gold');
 function tray(x,z,k,title){const g=group(x,1.29,z);slab(1.58,1.05,.07,0,0,0,k,g,.09);for(const side of [-1,1])box(.055,.20,1.02,side*.77,.11,0,k,g);box(1.58,.25,.05,0,.13,.51,k,g);box(1.58,.20,.05,0,.11,-.51,k,g);label(title,1.40,.16,0,.13,.55,g);for(const dx of [-.6,.6])for(const dz of [-.36,.36]){line([[dx,-.01,dz],[dx,-.82,dz]],.034,'steel',g);disk(.08,.025,dx,-.82,dz,'gold',g);}return g;}
 const reuseTray=tray(3.51,-.76,'forest','REFURBISH'),recycleTray=tray(3.51,1.14,'copper','RECYCLE');
 function phone(x,y,z,broken=false,p=root){const g=group(x,y,z,p);round(.34,.63,.038,0,0,0,'steel',g,.048);round(.30,.59,.025,0,0,.032,'dark',g,.038);round(.267,.47,.008,0,.015,.066,broken?'dark':'glass',g,.016);box(.08,.008,.005,0,.271,.072,'steel',g);const home=disk(.018,.006,0,-.267,.075,'gold',g);home.rotation.x=Math.PI/2;if(broken)line([[-.05,.24,.081],[.03,.09,.081],[-.06,-.02,.081],[.06,-.19,.081]],.004,'cream',g);else{line([[-.05,.02,.081],[-.01,-.025,.081],[.07,.07,.081]],.009,'mint',g);}return g;}
 for(let n=0;n<4;n++){const p=phone(-.53+n*.34,.25,-.20,false,reuseTray);p.rotation.x=-.25;p.scale.setScalar(.78);}
 for(let n=0;n<3;n++){const board=box(.29,.035,.44,-.48+n*.38,.10,-.10,'board',recycleTray);for(let k=0;k<4;k++){box(.055,.025,.07,-.56+n*.38+k%2*.13,.13,-.24+Math.floor(k/2)*.18,'dark',recycleTray);line([[-.57+n*.38,.125,-.27+k*.10],[-.32+n*.38,.125,-.27+k*.10]],.004,'gold',recycleTray);}}
 for(let n=0;n<4;n++){const coil=mesh(new T.TorusGeometry(.10+n*.007,.012,8,36),'copper',recycleTray);coil.rotation.x=Math.PI/2;coil.position.set(.48,.11+n*.022,.22);}
 const intake=group(-2.50,1.44,.60);slab(.62,.52,.035,0,-.10,0,'forest',intake,.05);for(let n=0;n<3;n++){const p=phone(-.18+n*.18,0,0,n===2,intake);p.scale.setScalar(.5);p.rotation.x=-1.3;}
 const devices=[phone(0,0,0,false),phone(0,0,0,true)];devices.forEach((g,i)=>{g.name=`goblin-device-${i}`;batch(g);});
 // Physical collection baskets, bench and plants finish the community setting.
 function leaf(len,w,k,p){const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-w,len*.24,-w*.5,len*.80,0,len);shape.bezierCurveTo(w*.5,len*.80,w,len*.24,0,0);const geo=new T.ShapeGeometry(shape,8);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getY(i)/len*Math.PI)*.12);geo.computeVertexNormals();const o=mesh(geo,k,p);o.material.side=T.DoubleSide;return o;}
 function plant(x,z,h=1){const g=group(x,.46,z);const pot=mesh(new T.CylinderGeometry(.25,.19,.36,40),'stone',g);pot.position.y=.18;disk(.22,.018,0,.37,0,'dark',g);for(let j=0;j<9;j++){const a=j*2.4,len=(.38+j%3*.15)*h;line([[0,.35,0],[Math.sin(a)*.12,.55*h,Math.cos(a)*.12]],.012,'leaf',g);const l=leaf(len,.12*h,j%2?'leaf':'leaf2',g);l.position.set(Math.sin(a)*.12,.48*h,Math.cos(a)*.12);l.rotation.set(.40,a,Math.sin(a)*.60);}}
 plant(-4.6,-1.6,1.3);plant(4.55,-1.35,1.5);plant(4.55,1.74,.8);plant(-1.60,-1.65,.9);
 const bench=group(1.8,.46,-1.55);for(let i=0;i<4;i++)box(.85,.035,.055,0,.33,i*.07,'wood',bench);for(const x of [-.34,.34])box(.04,.33,.27,x,.16,.10,'gold',bench);
 const outcomeLights=[ball(.045,2.83,1.55,-.76,'mint'),ball(.045,2.83,1.55,1.14,'amber')];
 // Keep moving roots intact when batching the architectural meshes.
 const live=[panel,scan,beacon,...people.map(p=>p.pivot),...devices,...outcomeLights];
 const original=panel.position.clone(),model=finish(16,live),offset=panel.position.clone().sub(original);const beaconScale=beacon.scale.clone();
 Object.assign(model.userData,{artifactId:16,displayBase:false,contactFootprint:false,studioProfile:'goblin',groundLevel:0,framingTargetY:2.20,initialYaw:-.11,initialElevation:.23,autoOrbit:false,realTimeAnimation:true,cycleDuration:GOBLIN_CYCLE,
 animate(time){const s=goblinMoment(time);ui.update(s);people.forEach(p=>p.update(s));
 devices.forEach((object,i)=>{const d=s.devices[i],path=d.age<9?approach:branches[i],u=d.age<9?d.travel:d.sort,p=path.getPointAt(u),v=path.getTangentAt(Math.min(.999,u));object.position.copy(p).add(offset);object.rotation.set(-Math.PI/2,0,-Math.atan2(v.x,v.z));object.visible=d.visible&&s.fade>.01;object.scale.setScalar(s.fade);});
 const active=s.devices[s.active];scan.visible=s.phase==='inspect';scanBar.position.z=.14+(active.scan-.5)*.6;beacon.visible=s.phase==='inspect';beacon.scale.copy(beaconScale).multiplyScalar(1+.12*Math.sin(s.t*5));outcomeLights[0].visible=s.reuse;outcomeLights[1].visible=s.recycle;model.userData.collection={phase:s.phase,reuse:s.reuse,recycle:s.recycle};
 }});model.userData.animate(0);return model;
}
