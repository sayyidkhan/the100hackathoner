import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {socapScreen} from './socap-screen.js';
import {socapMoment,SOCAP_CYCLES} from './socap-timing.js';

export function createSocap(T,version){
 const {root,materials:m,mesh,box,disk,ball,line,texture,finish}=medivoiceStudio(T),live=[],screens=[];
 const colors={stone:0xe5dbc4,ivory:0xefe8d3,teal:0x2d6a70,dark:0x15363e,brass:0xb59a62,lime:0xd6e56f,mint:0x75c6bc,glass:0x538d91,paper:0xf4efdf,ink:0x254d52};
 for(const [k,color] of Object.entries(colors))m[k]=new T.MeshStandardMaterial({color,roughness:k==='brass'?.29:.63,metalness:k==='brass'?.72:0});
 const stone=planningExhibitSurfaces(T).stone;m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.025;m.paper.bumpMap=texture('paper');m.paper.bumpScale=.008;m.teal.roughness=.3;m.teal.metalness=.22;
 m.lime.emissive.setHex(0x657b14);m.lime.emissiveIntensity=.55;m.mint.emissive.setHex(0x23695b);m.mint.emissiveIntensity=.4;
 function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.08){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:18}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,key,p=root,r=.12){const o=round(w,d,h,x,y,z,key,p,r);o.rotation.x=-Math.PI/2;return o;}
 function label(txt,w,h,x,y,z,p=root,color='#e4d5ae',font='Arial'){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const cx=c.getContext('2d');cx.fillStyle=color;cx.font=`600 ${c.height*.66}px ${font}`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(txt,512,c.height/2,990);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 function frontDisk(r,d,x,y,z,key,p){const o=disk(r,d,x,y,z,key,p);o.rotation.x=Math.PI/2;return o;}
 function portrait(x,y,z,size,p=root){ball(size*.24,x,y+size*.23,z,'ivory',p);const bust=ball(size*.42,x,y-size*.23,z-.03,'ivory',p);bust.scale.set(1,.66,.5);}
 function butterfly(x,y,z,size,p=root){const g=group(x,y,z,p);g.scale.setScalar(size);for(const side of [-1,1]){line([[0,0,0],[side*.16,.24,0],[side*.7,.66,0],[side*.57,.06,0],[side*.37,-.2,0],[side*.44,-.58,0],[side*.14,-.40,0],[0,0,0]],.025,'brass',g);line([[0,0,.01],[side*.08,.38,.01],[side*.15,.51,.01]],.015,'brass',g);}return g;}
 function device(x,y,z,w,h,kind){const g=group(x,y,z);round(w,h,.15,0,0,0,'brass',g,.15);round(w-.075,h-.08,.17,0,0,.03,'dark',g,.13);const ui=socapScreen(T,kind,version),plane=new T.Mesh(new T.PlaneGeometry(w-.25,h-.29),ui.material);plane.position.z=.225;g.add(plane);plane.name=`socap-${kind}-screen`;screens.push({ui,plane});live.push(g);
 if(kind==='borrower'){round(.48,.06,.012,0,h/2-.09,.22,'ink',g,.02);box(.025,.29,.08,-w/2-.025,h*.18,.08,'brass',g);slab(w+.16,.7,.08,x,.40,z+.08,'dark');}else{box(.5,.75,.22,x,.78,z,'brass');slab(1.7,.8,.10,x,.42,z+.1,'dark');}return g;}
 function bank(x,y,z,scale=1){const g=group(x,y,z);g.scale.setScalar(scale);slab(2.7,2.17,.15,0,0,0,'stone',g);slab(2.5,2.04,.12,0,.15,0,'ivory',g);box(2.3,1.83,1.65,0,1.18,-.13,'stone',g);box(2.5,.15,1.9,0,2.12,-.12,'ivory',g);
 // Individual masonry courses, window recesses and framed brass glazing.
 for(let n=0;n<8;n++)box(2.31,.012,.012,0,.41+n*.21,.701,'brass',g);
 for(const xx of [-.74,.74]){round(.45,.86,.035,xx,1.23,.708,'dark',g,.06);round(.36,.73,.025,xx,1.25,.753,'glass',g,.02);box(.025,.75,.03,xx,1.25,.79,'brass',g);box(.37,.023,.03,xx,1.25,.79,'brass',g);box(.55,.09,.20,xx,.77,.75,'ivory',g);}
 round(.48,1.15,.04,0,.88,.71,'dark',g,.08);for(const xx of [-.2,.2])box(.035,1.0,.045,xx,.91,.78,'brass',g);ball(.035,.13,.96,.80,'brass',g);
 for(const xx of [-1.12,1.12]){disk(.10,1.7,xx,1.18,.84,'ivory',g);disk(.15,.12,xx,.36,.84,'stone',g);disk(.15,.12,xx,2.01,.84,'ivory',g);for(let j=0;j<8;j++){const a=j*Math.PI/4;line([[xx+Math.cos(a)*.103,.45,.84+Math.sin(a)*.103],[xx+Math.cos(a)*.103,1.92,.84+Math.sin(a)*.103]],.008,'stone',g);}}
 const sh=new T.Shape();sh.moveTo(-1.35,0);sh.lineTo(0,.73);sh.lineTo(1.35,0);sh.closePath();const roof=mesh(new T.ExtrudeGeometry(sh,{depth:2.05,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2}),'teal',g);roof.position.set(0,2.18,-1.12);
 for(const side of [-1,1])line([[side*1.37,2.17,.98],[0,2.94,.98]],.035,'brass',g);for(let j=0;j<19;j++){const zz=-1.06+j*.106;for(const side of [-1,1])line([[side*1.3,2.2,zz],[0,2.92,zz]],.012,'dark',g);}
 round(1.5,.25,.035,0,2.12,.99,'dark',g,.02);label('RURAL BANK',1.36,.17,0,2.12,1.05,g);slab(1.15,.49,.08,0,.12,1.02,'ivory',g);slab(1.32,.42,.07,0,.04,1.24,'stone',g);return g;}
 function track(points,key='brass'){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));line(points,.042,key);return curve;}
 function packet(key='lime',card=false){const g=group();if(card){round(.48,.68,.06,0,.35,0,'paper',g,.035);for(let j=0;j<3;j++)box(.3,.021,.02,0,.25+j*.11,.09,'teal',g);frontDisk(.06,.018,0,.58,.08,key,g);}else{ball(.09,0,.09,0,key,g);const ring=mesh(new T.TorusGeometry(.14,.012,8,32),'brass',g);ring.rotation.x=-Math.PI/2;}live.push(g);return g;}
 slab(10.8,5.4,.38,0,0,0,'stone',root,.48);slab(10.65,5.24,.045,0,-.035,0,'brass',root,.46);
 round(4.25,.43,.035,0,.18,2.72,'brass');round(4.13,.33,.028,0,.18,2.766,'dark');label(`Social Capital Asia ${version}.0`,3.85,.245,0,.18,2.825);
 const groundLabels=group(0,.41,2.1);groundLabels.rotation.x=-Math.PI/2;label(version===1?'CONNECT   /   APPLY   /   REVIEW':'CONNECT   /   REVIEW   /   LEARN',5.2,.22,0,0,.012,groundLabels,'#496a68');
 const lights=[],ledgers=[];let outbound,returning;
 if(version===1){
 device(-3.56,2.75,-.35,2.42,4.45,'borrower');bank(3.18,.43,-.37,.94);butterfly(0,3.63,-.24,.91);
 const positions=[[-1.19,2.26,.35],[.07,2.64,.19],[1.27,2.20,.35],[-.72,1.13,.78],[.77,1.12,.78]];
 for(let i=0;i<positions.length;i++){const [xx,yy,zz]=positions[i];disk(.24,.07,xx,.45,zz,'teal');line([[xx,.48,zz],[xx,yy,zz]],.025,'brass');frontDisk(.38,.09,xx,yy,zz,'brass');frontDisk(.33,.10,xx,yy,zz+.045,'teal');const avatar=group(xx,yy,zz+.13);portrait(0,0,0,.43,avatar);live.push(avatar);lights.push(avatar);}
 for(const [a,b] of [[0,1],[1,2],[0,3],[3,4],[4,2],[1,4]])line([positions[a],positions[b]],.017,'brass');
 outbound=track([[-3.4,.49,1.0],[-2.25,.50,1.48],[-.25,.50,1.65],[1.8,.50,1.48],[3.18,.50,1.02]]);
 }else{
 device(-1.03,2.72,-1.04,6.30,3.54,'lender');device(-4.05,1.91,1.1,1.56,2.86,'borrower');slab(2.49,2.02,.64,3.63,.41,-.97,'stone');bank(3.63,1.05,-1.00,.84);butterfly(3.65,3.65,-.12,.32);
 for(let i=0;i<3;i++){const xx=1.22+i*1.02,yy=.65,zz=1.05;slab(.85,.7,.10,xx,.43,zz,'teal');const g=group(xx,yy,zz);g.rotation.y=-.08+i*.07;round(.79,1.55,.11,0,.78,0,'brass',g,.07);round(.71,1.46,.10,0,.78,.055,'paper',g,.06);label(['MOBILE','PROFILE','OUTCOMES'][i],.63,.12,0,1.31,.19,g,'#285e64');for(let j=0;j<5;j++)box(.47-j*.035,.022,.014,-j*.017,.41+j*.15,.177,'teal',g);frontDisk(.115,.025,0,1.02,.19,'teal',g);const lamp=ball(.065,0,1.02,.23,'lime',g);lamp.name=`socap-ledger-lamp-${i}`;g.name=`socap-ledger-${i}`;live.push(g);ledgers.push({g,base:g.position.clone(),lamp});}
 outbound=track([[-3.93,.50,1.69],[-2.7,.50,1.96],[-.45,.50,1.82],[1.30,.5,1.68],[3.36,.50,.92],[3.62,.5,.13]]);
 returning=track([[3.63,.5,.10],[4.68,.5,.25],[4.7,.5,2.0],[2.1,.5,2.3],[-.6,.5,1.52]],'mint');
 }
 const moving=packet('lime',version===1),reply=version===2?packet('mint'):null;moving.name='socap-application-packet';if(reply)reply.name='socap-outcome-packet';
 const beacon=group(version===1?3.18:3.63,version===1?2.15:2.6,version===1?.45:-.35);const lamp=ball(.07,0,0,0,'lime',beacon);beacon.name='socap-bank-received';live.push(beacon);
 const anchor=group();live.push(anchor);const before=anchor.position.clone();const model=finish(version===1?4:6,live),offset=anchor.position.clone().sub(before);model.remove(anchor);
 const ledgerBases=ledgers.map(({g})=>g.position.clone());const v=new T.Vector3();
 Object.assign(model.userData,{artifactId:version===1?4:6,displayBase:false,contactFootprint:false,studioProfile:'socap',groundLevel:0,framingTargetY:2.36,initialYaw:-.08,initialElevation:.18,autoOrbit:false,realTimeAnimation:true,cycleDuration:SOCAP_CYCLES[version],
 animate(time){const s=socapMoment(time,version);screens.forEach(({ui,plane})=>{ui.update(s);plane.userData.phase=s.phase;});lights.forEach((g,i)=>{g.visible=i<s.connected&&s.fade>.05;});
 const sending=version===1?s.t>=11&&s.t<23:s.t>=7&&s.t<15;moving.visible=sending&&s.fade>.05;outbound.getPoint(s.outbound,v);moving.position.copy(v).add(offset);
 beacon.visible=s.sent&&s.fade>.05;
 ledgers.forEach(({g,lamp},i)=>{g.position.copy(ledgerBases[i]);const progress=Math.max(0,Math.min(1,(s.t-4-i*1.5)/2));g.position.y+=.14*Math.sin(progress*Math.PI);lamp.visible=(i<2?s.connected>i:s.updated)&&s.fade>.05;});
 if(reply){reply.visible=s.t>=20&&s.t<29;returning.getPoint(s.feedback,v);reply.position.copy(v).add(offset);}
 model.userData.story={...s};
 }});model.userData.animate(0);return model;
}
