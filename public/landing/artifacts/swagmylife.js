import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {kitarOak} from './kitar-surfaces.js';
import {swagMoment,SWAG_CYCLE} from './swag-timing.js';
import {swagScreen} from './swag-screen.js';

export function createArtifact(T){
 const {root,materials:m,mesh,box,disk,ball,line,finish}=medivoiceStudio(T),live=[];
 for(const [key,color] of Object.entries({stone:0xe4dac2,cream:0xefe4ca,teal:0x247d7b,ink:0x153c40,coral:0xbb6f51,gold:0xbe9751,bronze:0x8e632f,wood:0x92704b,glass:0x25494a,leaf:0x527252,leaf2:0x849060,soil:0x514d38,reserve:0xc7bda2,glow:0xe8c180,route:0x76d9c4}))m[key]=new T.MeshStandardMaterial({color,roughness:['gold','bronze'].includes(key)?.32:key==='glass'?.19:.7,metalness:['gold','bronze'].includes(key)?.78:key==='glass'?.35:0});
 const stone=planningExhibitSurfaces(T).stone,oak=kitarOak(T);m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.024;m.cream.map=stone;m.cream.bumpMap=stone;m.cream.bumpScale=.008;m.wood.map=oak;m.wood.bumpMap=oak;m.wood.bumpScale=.018;m.glow.emissive.setHex(0xffcc7d);m.glow.emissiveIntensity=.25;m.route.emissive.setHex(0x53cbbb);m.route.emissiveIntensity=.8;
 m.foodLight=m.glow.clone();m.cultureLight=m.glow.clone();m.route.transparent=true;
 function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.06){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:14}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,key,p=root,r=.12){const o=round(w,d,h,x,y,z,key,p,r);o.rotation.x=-Math.PI/2;return o;}
 function text(txt,w,h,x,y,z,p=root,color='#f2e6c5',font='Arial'){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const cx=c.getContext('2d');cx.fillStyle=color;cx.font=`500 ${c.height*.7}px ${font}`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(txt,512,c.height/2,1000);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 function torus(r,t,x,y,z,key,p=root){const o=mesh(new T.TorusGeometry(r,t,6,40),key,p);o.position.set(x,y,z);return o;}
 function rod(a,b,r,key,p=root){const v=new T.Vector3(...b).sub(new T.Vector3(...a)),o=mesh(new T.CylinderGeometry(r,r,v.length(),7),key,p);o.position.copy(new T.Vector3(...a).addScaledVector(v,.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
 // Individual elliptical leaves and slender branches, all baked into material batches.
 function tree(x,y,z,h,seed=0,p=root){const g=group(x,y,z,p);rod([0,0,0],[.035,h*.72,0],.033,'wood',g);
 for(let j=0;j<7;j++){const a=j*2.4+seed,tip=[Math.cos(a)*h*.31,h*(.59+(j%3)*.11),Math.sin(a)*h*.29];rod([.02,h*.42,0],tip,.012,'wood',g);
 for(let k=0;k<13;k++){const aa=k*2.4+j,rr=h*(.045+.08*(k%4)/3),o=mesh(new T.SphereGeometry(1,6,4),k%3?'leaf':'leaf2',g);o.position.set(tip[0]+Math.cos(aa)*rr,tip[1]+Math.sin(k*3)*rr,tip[2]+Math.sin(aa)*rr);o.scale.set(h*.06,h*.025,h*.12);o.rotation.set(k*.7,aa,k*.3);}}
 return g;}
 function planter(x,y,z,w=.6,d=.4,p=root){slab(w,d,.25,x,y,z,'stone',p,.04);slab(w-.08,d-.08,.02,x,y+.26,z,'soil',p,.03);for(let i=0;i<3;i++)tree(x-w*.3+i*w*.3,y+.28,z,.30,i+3,p);}
 function lamp(x,y,z,p=root){disk(.075,.03,x,y,z,'gold',p);const o=ball(.045,x,y+.035,z,'glow',p);o.scale.y=.45;}
 slab(12.6,7.0,.38,0,0,0,'stone',root,.48);slab(12.55,6.95,.075,0,-.045,0,'gold',root,.46);
 round(3.0,.40,.035,0,.15,3.52,'gold');text('Swagmylife',2.6,.28,0,.15,3.57,root,'#19383b','Georgia');
 for(let i=-6;i<=6;i++)box(.012,.005,5.6,i*.9,.395,-.2,'cream');for(let i=-3;i<=3;i++)box(11.6,.005,.012,0,.396,i*.84,'cream');
 // Teal original identity, with a redesigned readable portfolio screen.
 const phone=group(-4.64,3.12,-.10);phone.rotation.y=.08;
 round(2.52,5.17,.14,0,0,0,'gold',phone,.23);round(2.43,5.08,.16,0,0,.035,'ink',phone,.22);
 const ui=swagScreen(T),screen=new T.Mesh(new T.PlaneGeometry(2.20,4.75),ui.material);screen.position.z=.22;screen.name='swag-screen';phone.add(screen);round(.76,.15,.025,0,2.30,.24,'ink',phone,.06);ball(.025,.24,2.30,.28,'glass',phone);box(.025,.36,.07,-1.28,.6,.07,'gold',phone);box(.025,.22,.07,-1.28,1.15,.07,'gold',phone);live.push(phone);slab(2.8,.95,.15,-4.64,.4,.06,'stone');
 // Residential block: recessed windows, real balconies, roof garden and covered entrance.
 const home=group(-.94,.54,-1.54);slab(3.80,2.15,.16,0,-.12,0,'stone',home);box(3.30,4.10,1.62,0,2.05,0,'stone',home);
 for(let floor=0;floor<5;floor++){const yy=.45+floor*.74;for(let col=0;col<3;col++){const xx=-1.08+col*1.08;
 box(.79,.57,.055,xx,yy,.835,'teal',home);box(.65,.49,.035,xx,yy,.871,'glass',home);box(.019,.48,.025,xx,yy,.897,'gold',home);box(.62,.018,.025,xx,yy-.07,.897,'gold',home);
 box(.07,.47,.012,xx+.21,yy,.902,'glow',home);box(.045,.48,.018,xx-.21,yy,.902,'cream',home);
 if(floor>0){slab(.96,.47,.055,xx,yy-.31,1.00,'cream',home,.015);rod([xx-.43,yy-.27,1.21],[xx-.43,yy+.02,1.21],.012,'gold',home);rod([xx+.43,yy-.27,1.21],[xx+.43,yy+.02,1.21],.012,'gold',home);rod([xx-.43,yy+.02,1.21],[xx+.43,yy+.02,1.21],.015,'gold',home);for(let b=0;b<9;b++)rod([xx-.38+b*.095,yy-.27,1.21],[xx-.38+b*.095,yy+.02,1.21],.007,'gold',home);}
 }
 for(const side of [-1,1]){box(.025,.54,.54,side*1.66,yy,-.08,'teal',home);box(.03,.44,.42,side*1.68,yy,-.08,'glass',home);box(.04,.015,.42,side*1.70,yy,-.08,'gold',home);}
 box(3.4,.07,1.72,0,yy+.36,0,'cream',home);
 }
 for(const xx of [-1.62,-.54,.54,1.62])box(.075,4.16,.16,xx,2.08,.89,'cream',home);
 slab(3.58,1.94,.13,0,4.11,0,'cream',home);for(const xx of [-1.26,-.42,.42,1.26])planter(xx,4.23,-.48,.68,.48,home);tree(-1.2,4.49,-.48,.62,4,home);tree(1.1,4.49,-.48,.72,1,home);
 box(.58,.65,.05,0,.33,.95,'glass',home);box(.018,.60,.06,0,.33,.99,'gold',home);slab(1.17,.59,.06,0,.77,1.04,'cream',home);for(let j=0;j<3;j++)slab(1.08+j*.14,.22,.06,0,.04-j*.055,1.28+j*.16,'cream',home,.015);
 // Cafe pavilion with an actual terrace, counter and crafted bent-metal furniture.
 const cafe=group(-1.18,.55,1.09);slab(3.15,2.12,.16,0,-.15,0,'stone',cafe);box(2.35,1.45,.83,0,.73,-.45,'coral',cafe);box(2.13,.94,.035,0,.88,-.01,'glass',cafe);box(2.33,.14,1.02,0,1.49,-.39,'coral',cafe);text('FOOD',1.55,.20,0,1.48,.15,cafe);
 for(let i=0;i<16;i++)box(.025,.74,.04,-1.06+i*.142,.44,.09,'wood',cafe);box(2.34,.075,.42,0,.85,.12,'cream',cafe);
 for(const xx of [-1.1,1.1])rod([xx,.05,.32],[xx,1.35,.32],.025,'gold',cafe);
 for(let i=0;i<14;i++){const xx=-1.14+i*.175,awning=box(.176,.035,.79,xx,1.31,.43,i%2?'cream':'coral',cafe);awning.rotation.x=.29;round(.175,.12,.035,xx,1.15,.81,i%2?'cream':'coral',cafe,.025);}
 for(const xx of [-.78,0,.78]){rod([xx,1.29,.28],[xx,1.06,.28],.009,'gold',cafe);const shade=mesh(new T.ConeGeometry(.085,.09,20),'gold',cafe);shade.position.set(xx,1.05,.28);ball(.035,xx,1.00,.28,'foodLight',cafe);}
 for(let i=0;i<5;i++){const xx=-.84+i*.42;disk(.07,.09,xx,.92,.19,'cream',cafe);const handle=torus(.037,.009,xx+.07,.94,.19,'gold',cafe);handle.rotation.y=Math.PI/2;}
 for(const xx of [-.71,.68]){disk(.28,.035,xx,.50,1.13,'cream',cafe);rod([xx,.03,1.13],[xx,.50,1.13],.025,'gold',cafe);disk(.13,.02,xx,.03,1.13,'gold',cafe);disk(.042,.07,xx,.55,1.13,'cream',cafe);
 for(const side of [-1,1]){const cx=xx+side*.38,cz=1.08;disk(.14,.04,cx,.27,cz,'wood',cafe);for(const a of [-1,1])for(const b of [-1,1])rod([cx+a*.10,.02,cz+b*.10],[cx+a*.08,.28,cz+b*.08],.012,'gold',cafe);line([[cx-.12,.30,cz-.1],[cx-.14,.59,cz-.11],[cx,.64,cz-.13],[cx+.14,.59,cz-.11],[cx+.12,.30,cz-.1]],.015,'gold',cafe);}}
 planter(-1.37,.02,.89,.35,.40,cafe);planter(1.37,.02,.89,.35,.4,cafe);for(const xx of [-.90,.05,.93])planter(xx,1.56,-.51,.76,.44,cafe);
 // Bronze shell theatre, split into overlapping curved roof bands.
 const venue=group(3.50,.55,-.16);slab(3.12,3.38,.19,0,-.15,0,'stone',venue);slab(2.75,2.85,.11,0,.05,0,'cream',venue);const facade=new T.Shape();facade.moveTo(-1.45,.15);facade.lineTo(-1.45,.5);for(let i=0;i<=48;i++){const a=i/48*Math.PI;facade.lineTo(-1.45*Math.cos(a),.5+2.10*Math.sin(a));}facade.lineTo(1.45,.15);facade.closePath();const glazing=mesh(new T.ExtrudeGeometry(facade,{depth:1.93,bevelEnabled:false}),'glass',venue);glazing.position.z=-1.25;
 for(let i=0;i<13;i++){const xx=-1.22+i*.203;rod([xx,.15,.71],[xx,.5+2.1*Math.sqrt(1-(xx/1.45)**2),.71],.012,'gold',venue);}for(let j=0;j<5;j++){const yy=.35+j*.47,ww=yy<.5?2.86:2*1.45*Math.sqrt(1-((yy-.5)/2.10)**2);box(ww,.025,.035,0,yy,.71,'gold',venue);}
 for(const xx of [-1.29,1.29])for(let i=0;i<8;i++)rod([xx,.15,-1.13+i*.28],[xx,1.60,-1.13+i*.28],.012,'gold',venue);
 function roof(z,raise){const pos=[],uv=[],ix=[],nx=48,ny=10;for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const a=i/nx*Math.PI,zz=z+j/ny*.74;pos.push(-1.48*Math.cos(a),.50+2.15*Math.sin(a)+raise+.10*Math.sin(j/ny*Math.PI),zz);uv.push(i/nx,j/ny);}for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;ix.push(a,b,a+1,a+1,b,b+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();const o=mesh(geo,'bronze',venue);o.material.side=T.DoubleSide;for(const zz of [z,z+.74]){const pts=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI;pts.push([-1.48*Math.cos(a),.5+2.15*Math.sin(a)+raise,zz]);}line(pts,.022,'gold',venue);}}
 for(let i=0;i<9;i++)box(.026,.91,.018,-.96+i*.24,.98,.733,'cultureLight',venue);
 roof(-1.26,.25);roof(-.65,.12);roof(-.04,0);
 for(let j=0;j<3;j++)slab(1.5+j*.18,.25,.055,0,.12-j*.055,1.22+j*.21,'cream',venue,.02);
 for(let i=0;i<19;i++){const a=.15+i/18*(Math.PI-.3),xx=Math.cos(a)*1.37,zz=.65+Math.sin(a)*.55;rod([xx,.17,zz],[xx,.59,zz],.012,'gold',venue);}
 const rail=[];for(let i=0;i<=30;i++){const a=.15+i/30*(Math.PI-.3);rail.push([Math.cos(a)*1.37,.59,.65+Math.sin(a)*.55]);}line(rail,.019,'gold',venue);
 round(1.65,.27,.04,0,.30,1.76,'gold',venue);text('LEISURE',1.45,.19,0,.30,1.81,venue,'#234445');
 planter(-1.25,.16,1.17,.50,.48,venue);planter(1.25,.16,1.17,.50,.48,venue);tree(1.45,.12,-.9,1.85,9,venue);tree(-1.38,.16,.2,1.26,4,venue);
 // Streetscape planting and recessed destination lights.
 for(const [x,z,h] of [[-3.05,-1.3,1.9],[1.14,-2.25,1.6],[5.46,1.8,1.25],[-5.75,1.45,.65]]){planter(x,.42,z,.55,.6);tree(x,.70,z,h,Math.abs(x)*2);}
 for(const [x,z] of [[-.03,.2],[1.53,1.2],[2.05,.6],[-2.9,2.2],[4.95,2.16]])lamp(x,.42,z);
 // Narrow inlaid paths reveal sequentially. Markers stop at destinations, then fade.
 const routes=[[[ -3.43,.43,.75],[-2.94,.43,.35],[-2.74,.43,-.22],[-.94,.43,-.22]],
 [[-.94,.43,-.22],[.92,.43,-.05],[1.12,.43,.6],[.15,.43,.86]],
 [[.92,.43,-.05],[1.56,.43,.37],[1.77,.43,1.46],[3.50,.43,1.6]]];
 const curves=routes.map(p=>new T.CatmullRomCurve3(p.map(v=>new T.Vector3(...v)))),pathGroups=[],markers=[];
 for(let j=0;j<3;j++){line(routes[j],.017,'gold');const g=group();g.name=`swag-path-${j}`;const geo=new T.TubeGeometry(curves[j],80,.028,6,false);const o=mesh(geo,'route',g);pathGroups.push(o);live.push(g);const marker=group();ball(.075,0,.035,0,'route',marker);markers.push(marker);live.push(marker);}
 const pin=group(-.94,5.59,-1.5);pin.name='swag-home-pin';const pinFace=disk(.27,.055,0,0,0,'gold',pin);pinFace.rotation.x=Math.PI/2;torus(.25,.012,0,0,.034,'cream',pin);const tip=mesh(new T.ConeGeometry(.12,.24,3),'gold',pin);tip.rotation.z=Math.PI;tip.position.y=-.30;text('⌂',.32,.33,0,.005,.065,pin);live.push(pin);
 // Four movable segments always preserve a complete 100% portfolio.
 slab(10.18,.65,.055,.20,.42,2.74,'gold');slab(10.05,.54,.035,.20,.48,2.74,'ink');
 const bars=[];['teal','coral','gold','reserve'].forEach((key,i)=>{const g=group();g.name=`swag-budget-${i}`;box(1,.055,.42,0,0,0,key,g);const caption=group(0,-.08,.45,g);caption.rotation.x=-Math.PI/2;text(['HOME','FOOD','LEISURE','RESERVE'][i],.87,.16,0,0,.004,caption,'#405957');bars.push(g);live.push(g);});

 const anchor=group();live.push(anchor);root.updateMatrixWorld(true);const framing=[];for(const c of root.children){const b=new T.Box3().setFromObject(c);if(!b.isEmpty())for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framing.push(new T.Vector3(x,y,z));}
 const model=finish(10,live),offset=anchor.position.clone();model.remove(anchor);const pinBase=pin.position.clone(),v=new T.Vector3();
 Object.assign(model.userData,{artifactId:10,displayBase:false,contactFootprint:false,studioProfile:'swagmylife',groundLevel:0,framingPoints:framing.map(p=>p.add(offset)),cameraFitSway:0,initialYaw:.16,initialElevation:.29,framingTargetY:2.5,autoOrbit:false,realTimeAnimation:true,cycleDuration:SWAG_CYCLE,
 animate(time){const s=swagMoment(time);ui.update(s);screen.userData.phase=s.phase;model.userData.story=s;
 pin.visible=s.selected&&s.fade>.02;pin.position.copy(pinBase);pin.position.y+=(1-s.pin)*.62;pin.scale.setScalar((.85+.15*s.pin)*s.fade);
 const progresses=[s.home,s.food,s.leisure];for(let i=0;i<3;i++){const f=progresses[i];pathGroups[i].geometry.setDrawRange(0,Math.floor(f*80)*6*6);pathGroups[i].parent.visible=s.fade>.02;curves[i].getPoint(f,v);markers[i].position.copy(v).add(offset);markers[i].visible=f>0&&s.fade>.02;markers[i].scale.setScalar(f<1?1:1+.12*Math.sin(s.t*2));}
 let left=-4.78;for(let i=0;i<4;i++){const width=s.allocations[i]*9.96;bars[i].position.set(left+width/2,.535,2.74).add(offset);bars[i].children[0].scale.x=width-.025;left+=width;}
 m.glow.emissiveIntensity=.18+.72*s.home*s.fade;m.foodLight.emissiveIntensity=.12+1.2*s.food*s.fade;m.cultureLight.emissiveIntensity=.08+1.1*s.leisure*s.fade;m.route.opacity=s.fade;
 }});model.userData.animate(0);return model;
}
export default createArtifact;
