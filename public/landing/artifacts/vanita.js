import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {prepareCourier,createCourier} from './vanita-courier.js';
import {vanitaScreen} from './vanita-screen.js';
import {vanitaMoment,VANITA_CYCLE} from './vanita-timing.js';
export {vanitaMoment,VANITA_CYCLE};
export const prepareArtifact=prepareCourier;
export function createArtifact(T,options={}){
 const {root,materials:m,mesh,box,disk,ball,line,texture,finish,batch}=medivoiceStudio(T);
 for(const [key,color] of Object.entries({navy:0x173e57,blue:0x397eb1,stone:0xe6d7b9,sand:0xc8b795,roof:0xa95237,tile:0xc16c49,gold:0xb58a44,wood:0x795135,leaf:0x46613d,leaf2:0x75824a,dark:0x12262d,glass:0xe8bb70,kraft:0xb68a54,cream:0xf6ebd1}))m[key]=new T.MeshStandardMaterial({color,roughness:key==='gold'?.3:.82,metalness:key==='gold'?.72:0});
 const stone=planningExhibitSurfaces(T).stone;m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.026;m.sand.map=stone;m.sand.bumpMap=stone;m.sand.bumpScale=.015;
 for(const k of ['wood','kraft']){m[k].map=texture('wood');m[k].bumpMap=m[k].map;m[k].bumpScale=.012;}
 m.roof.bumpMap=texture('paper');m.roof.bumpScale=.012;m.glass.emissive.setHex(0xffb953);m.glass.emissiveIntensity=.45;
 function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.08){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,curveSegments:16}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,k,p=root,r=.14){const o=round(w,d,h,x,y,z,k,p,r);o.rotation.x=-Math.PI/2;return o;}
 function label(txt,w,h,x,y,z,p=root,color='#f9ebc7') {if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=768;c.height=Math.round(768*h/w);const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font=`600 ${c.height*.66}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,384,c.height/2,740);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 slab(10,5,.4,0,0,0,'stone',root,.45);slab(9.85,4.86,.045,0,-.04,0,'gold',root,.44);
 round(2.28,.46,.04,0,.19,2.52,'gold');round(2.16,.36,.035,0,.19,2.57,'navy');label('Vanita',1.8,.28,0,.19,2.63);
 // Architecture: tiled roofs, inset joinery, warm windows and stepped doorways.
 function roof(w,d,y,key,p){const rise=.57,run=w/2+.13,angle=Math.atan2(rise,run),len=Math.hypot(run,rise);for(const side of [-1,1]){const o=box(len,.09,d+.24,side*run/2,y+rise/2,0,key,p);o.rotation.z=-side*angle;for(let row=0;row<4;row++)for(let col=0;col<12;col++){const xx=side*(.06+(row+.5)/4*(run-.06));const yy=y+rise*(1-Math.abs(xx)/run);const t=box(len/4+.035,.055,(d+.20)/12*.92,xx,yy+.055,-d/2-.10+(col+.5)*(d+.20)/12,key==='roof'&&row%2?'tile':key,p);t.rotation.z=-side*angle;}}line([[0,y+rise+.06,-d/2-.15],[0,y+rise+.06,d/2+.15]],.055,key,p);}
 function window(x,y,z,w,h,p){box(w+.12,h+.12,.10,x,y,z,'wood',p);box(w,h,.12,x,y,z+.015,'glass',p);for(const dx of [-w/2,0,w/2])box(.032,h+.07,.06,x+dx,y,z+.09,'wood',p);box(w,.032,.06,x,y,z+.09,'wood',p);box(w+.18,.06,.20,x,y-h/2-.05,z+.03,'stone',p);}
 function house(x,z,w,d,h,small=false){
  const g=group(x,.44,z);box(w,h,d,0,h/2,0,'stone',g);slab(w+.18,d+.18,.12,0,0,0,'sand',g);roof(w,d,h,'roof',g);
  const triangle=new T.Shape();triangle.moveTo(-w/2,0);triangle.lineTo(w/2,0);triangle.lineTo(0,.53);triangle.closePath();
  const gable=mesh(new T.ExtrudeGeometry(triangle,{depth:d,bevelEnabled:false}),'stone',g);gable.position.set(0,h,-d/2);
  // The cottage has its own facade proportions: the complete window frame and
  // sill stay inside the wall, below the eaves and clear of the door jamb.
  const front=d/2,doorX=small?.19:0,doorW=small?.38:.53,doorH=small?.86:1.13,doorY=.035+doorH/2;
  box(doorW,doorH,.08,doorX,doorY,front+.05,'wood',g);
  for(let i=0;i<5;i++)box(.009,doorH-.08,.012,doorX-doorW*.40+i*doorW*.20,doorY,front+.098,'sand',g);
  ball(.028,doorX+doorW*.34,doorY+.03,front+.12,'gold',g);
  if(small)window(-.33,.73,front+.05,.22,.38,g);
  else {window(-w*.32,.97,front+.05,.35,.56,g);window(w*.32,.97,front+.05,.35,.56,g);}
  for(let i=0;i<2;i++)slab((small?.59:.82)+i*.16,.30+i*.13,.07,doorX,-.04-i*.05,front+.15+i*.10,'sand',g);
  return g;
 }
 house(3.15,-1.12,2.02,1.56,1.63);house(1.05,-1.65,1.2,.85,1.15,true);
 const kiosk=group(-1.05,.44,-1.12);box(1.72,1.75,.10,0,.875,-.58,'navy',kiosk);box(.09,1.75,1.23,-.86,.875,0,'navy',kiosk);box(.09,1.75,1.23,.86,.875,0,'navy',kiosk);roof(1.86,1.26,1.76,'navy',kiosk);
 for(let i=0;i<3;i++)box(1.62,.04,.52,0,.48+i*.39,-.30,'wood',kiosk);
 box(1.8,.57,.24,0,.35,.55,'wood',kiosk);box(1.94,.08,.50,0,.66,.52,'sand',kiosk);for(let i=0;i<15;i++)box(.016,.53,.025,-.82+i*.117,.35,.69,'gold',kiosk);
 round(1.72,.30,.05,0,1.51,.67,'navy',kiosk,.025);label('vanita',1.45,.24,0,1.51,.75,kiosk);
 function parcel(x,y,z,scale=1,p=root){const g=group(x,y,z,p);box(.35,.27,.29,0,.135,0,'kraft',g);box(.055,.006,.295,0,.273,0,'sand',g);box(.055,.27,.006,0,.135,.148,'sand',g);box(.13,.09,.008,.09,.15,.154,'cream',g);for(let i=0;i<6;i++)box(.006,.048,.003,.045+i*.014,.15,.160,'dark',g);g.scale.setScalar(scale);return g;}
 for(let i=0;i<9;i++)parcel(-.53+(i%3)*.52,.50+Math.floor(i/3)*.39,-.30,.80,kiosk);
 // Route stones and blue inlay follow exactly the courier's spline.
 const curve=new T.CatmullRomCurve3([[-1.05,.46,.43],[-.85,.46,.96],[.15,.46,1.36],[1.25,.46,1.25],[2.36,.46,.78],[3.15,.46,.40]].map(p=>new T.Vector3(...p)));
 for(let i=0;i<56;i++){const t=i/55,p=curve.getPointAt(t),v=curve.getTangentAt(t),normal=new T.Vector3(v.z,0,-v.x);for(let lane=-2;lane<=2;lane++){const a=p.clone().addScaledVector(normal,lane*.15);const o=box(.145,.045,.14,a.x,.425,a.z,(i+lane)%3?'stone':'sand');o.rotation.y=Math.atan2(v.x,v.z);}}
 const route=mesh(new T.TubeGeometry(curve,150,.022,8,false),'blue');
 const progressGeometry=new T.TubeGeometry(curve,150,.029,8,false),progress=mesh(progressGeometry,'gold');
 const marker=group(3.15,2.98,-.30);disk(.26,.055,0,0,0,'gold',marker).rotation.x=Math.PI/2;disk(.21,.06,0,0,.025,'navy',marker).rotation.x=Math.PI/2;line([[-.10,0,.08],[-.02,-.07,.08],[.12,.09,.08]],.024,'cream',marker);
 // A planted, inhabited neighbourhood rather than abstract logistics symbols.
 function leafShape(length,width,key,p){const sh=new T.Shape();sh.moveTo(0,0);sh.bezierCurveTo(-width*.65,length*.25,-width*.5,length*.72,0,length);sh.bezierCurveTo(width*.5,length*.72,width*.65,length*.25,0,0);const geo=new T.ShapeGeometry(sh,8);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const y=pos.getY(i);pos.setZ(i,Math.sin(y/length*Math.PI)*length*.16);}geo.computeVertexNormals();const o=mesh(geo,key,p);o.material.side=T.DoubleSide;return o;}
 function plant(x,z,size=1){const g=group(x,.44,z);for(let j=0;j<13;j++){const a=j*2.4,height=.24+(j%4)*.065;line([[0,0,0],[Math.sin(a)*.10,height*.65,Math.cos(a)*.1],[Math.sin(a)*.19,height,Math.cos(a)*.19]],.009,'leaf',g);for(let k=0;k<3;k++){const leaf=leafShape(.22,.12,j%2?'leaf':'leaf2',g);leaf.position.set(Math.sin(a)*.09,height*(.40+k*.18),Math.cos(a)*.09);leaf.rotation.set(.7+k*.22,a,.45);}}g.scale.setScalar(size);}
 function palm(x,z,h=2){const g=group(x,.44,z);line([[0,0,0],[.05,h*.5,0],[.16,h,0]],.055,'wood',g);for(let n=0;n<13;n++){const y=n/13*h;const ring=mesh(new T.TorusGeometry(.058,.009,6,16),'sand',g);ring.rotation.x=Math.PI/2;ring.position.set(.16*(y/h)**1.6,y,0);}for(let j=0;j<9;j++){const a=j*Math.PI*2/9,pts=[];for(let k=0;k<7;k++){const u=k/6;pts.push([.16+Math.sin(a)*u*.80,h+Math.sin(u*Math.PI)*.24-u*.21,Math.cos(a)*u*.80]);}line(pts,.014,'leaf2',g);for(let k=1;k<7;k++){const u=k/7,center=new T.Vector3(.16+Math.sin(a)*u*.8,h+Math.sin(u*Math.PI)*.24-u*.21,Math.cos(a)*u*.8);for(const side of [-1,1]){const end=center.clone().add(new T.Vector3(Math.cos(a)*side*.20*(1-u*.7),-.10,-Math.sin(a)*side*.20*(1-u*.7)));const lf=leafShape(.30*(1-u*.4),.07,j%2?'leaf':'leaf2',g);lf.position.copy(center);lf.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(center).normalize());}}}return g;}
 palm(-2.02,-1.62,2.6);palm(4.35,-1.58,2.15);palm(2.05,-2.0,1.6);
 for(const [x,z,s] of [[-.1,-.7,1.1],[.25,-1,1],[4.35,.08,1.3],[3.9,.70,.9],[-1.9,.75,1],[.4,1.85,.85],[1.35,1.8,1],[2.9,1.23,.8],[-.2,-2,1]])plant(x,z,s);
 for(let n=0;n<15;n++){const x=-1.9+n*.44,z=1.94+Math.sin(n)*.10;plant(x,z,.45+(n%3)*.1);}
 for(const [x,z] of [[-.5,1.88],[3.7,1.28]]){slab(.31,.31,.08,x,.45,z,'sand');box(.18,.34,.18,x,.65,z,'glass');for(const dx of [-.11,.11])for(const dz of [-.11,.11])box(.025,.38,.025,x+dx,.64,z+dz,'wood');slab(.31,.31,.06,x,.85,z,'sand');}
 // Phone mirrors the original available / my delivery workflow.
 const phone=group(-3.65,2.41,.14);phone.rotation.y=.08;round(1.87,4.04,.15,0,0,0,'gold',phone,.22);round(1.80,3.97,.15,0,0,.04,'dark',phone,.20);
 const ui=vanitaScreen(T),screen=new T.Mesh(new T.PlaneGeometry(1.61,3.43),ui.material);screen.position.set(0,-.03,.225);phone.add(screen);round(.53,.105,.015,0,1.84,.21,'dark',phone,.045);ball(.024,.17,1.84,.24,'blue',phone);box(.04,.37,.08,-.95,.82,.06,'gold',phone);slab(2.0,.80,.10,-3.65,.43,.1,'navy');
 const courier=createCourier(T,options.courier);root.add(courier.pivot);courier.pivot.name='vanita-courier';courier.pivot.position.copy(curve.getPointAt(0));const carried=parcel(0,.86,.32,.88,courier.pivot);carried.name='vanita-carried-parcel';
 const pickup=parcel(-1.05,1.14,-.55,.88),delivered=parcel(3.15,.55,-.19,.88);pickup.name='vanita-pickup-parcel';delivered.name='vanita-delivered-parcel';
 batch(phone);const before=courier.pivot.position.clone(),model=finish(7,[phone,courier.pivot,pickup,delivered,marker,progress]);const offset=courier.pivot.position.clone().sub(before);const markerY=marker.position.y;
 Object.assign(model.userData,{artifactId:7,displayBase:false,contactFootprint:false,studioProfile:'vanita',groundLevel:0,framingTargetY:2.15,initialYaw:-.08,initialElevation:.21,autoOrbit:false,realTimeAnimation:true,cycleDuration:VANITA_CYCLE,
 animate(time){const s=vanitaMoment(time);ui.update(s);courier.pivot.position.copy(curve.getPointAt(s.travel)).add(offset);const tangent=curve.getTangentAt(Math.min(.999,s.travel));const heading=Math.atan2(tangent.x,tangent.z),turn=Math.max(0,Math.min(1,(s.t-17)*2));courier.pivot.rotation.y=heading+(Math.PI-heading)*turn;courier.update(s);courier.pivot.visible=s.opacity>.001;carried.visible=s.carrying;pickup.visible=s.t<4.5;delivered.visible=s.delivered&&s.t<26;marker.visible=s.delivered;marker.position.y=markerY+(1-Math.min(1,Math.max(0,(s.t-18.5)/.7)))*.5;progressGeometry.setDrawRange(0,Math.floor(s.travel*150)*8*6);model.userData.delivery={phase:s.phase,travel:s.travel,delivered:s.delivered};}});
 model.userData.animate(0);return model;
}
