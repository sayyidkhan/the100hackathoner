import {medivoiceStudio} from './medivoice-studio.js';
import {landPolygons} from './co2unter-land.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {co2unterSurfaces} from './co2unter-surfaces.js';

// Source-grounded converter interpretation. Objects are familiar references,
// never measured carbon results; no numeric emission factor is invented here.
export function createArtifact(T) {
 const {root,materials:m,mesh,disk,ball,line,texture,finish}=medivoiceStudio(T);
 const palette={paper:0xebe0cd,ivory:0xf0e7d7,blue:0x123f52,ink:0x12323f,gold:0xb79559,wood:0x745239,bark:0xffffff,cut:0xffffff,yellow:0xffffff,jade:0x87d1b8,shade:0xa89a7e};
 for(const [k,color] of Object.entries(palette))m[k]=new T.MeshStandardMaterial({color,roughness:k==='gold'?.32:.78,metalness:k==='gold'?.66:0});
 const grain=texture('paper'),surfaces=co2unterSurfaces(T);
 m.paper.map=planningExhibitSurfaces(T).stone;m.paper.bumpMap=m.paper.map;m.paper.bumpScale=.028;
 m.ivory.bumpMap=grain;m.ivory.bumpScale=.008;
 m.bark.map=surfaces.bark;m.bark.bumpMap=surfaces.bark;m.bark.bumpScale=.065;m.bark.roughness=.96;
 m.cut.map=surfaces.endgrain;m.cut.bumpMap=surfaces.endgrain;m.cut.bumpScale=.012;
 m.yellow.map=surfaces.banana;m.yellow.bumpMap=surfaces.banana;m.yellow.bumpScale=.008;m.yellow.roughness=.57;
 m.blue.roughness=.37;m.blue.metalness=.18;m.blue.bumpMap=grain;m.blue.bumpScale=.007;
 m.jade.emissive=new T.Color(0x3c9176);m.jade.emissiveIntensity=.35;
 const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
 function box(w,h,d,x,y,z,color='ivory',p=root,r=.035){
  r=Math.min(r,w*.48,h*.48,d*.48);const geo=new T.BoxGeometry(w,h,d,6,6,6),a=geo.attributes.position;
  for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i),c=new T.Vector3(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));v.sub(c).normalize().multiplyScalar(r).add(c);a.setXYZ(i,v.x,v.y,v.z);}geo.computeVertexNormals();const o=mesh(geo,color,p);o.position.set(x,y,z);return o;
 }
 function panel(w,h,d,r,color,p=root){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:3,bevelSize:.012,bevelThickness:.012,curveSegments:12}),color,p);}
 const labels=group();
 function label(text,w,h,x,y,z,color='#e8cc95',bg='#12323f',p=labels){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.max(100,Math.round(1024*h/w));const c=canvas.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle=color;c.font=`500 ${Math.round(canvas.height*.57)}px Georgia, serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,canvas.width/2,canvas.height/2,canvas.width*.91);const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.8}));o.position.set(x,y,z);p.add(o);return o;
 }
 // A sculpted, rounded plinth gives the three parts a single visual foundation.
 const plinth=panel(8.0,3.45,.33,.5,'paper');plinth.rotation.x=-Math.PI/2;plinth.position.y=.11;
 const under=panel(7.88,3.32,.08,.48,'ink');under.rotation.x=-Math.PI/2;under.position.y=.025;
 const reveal=panel(7.94,3.38,.022,.48,'gold');reveal.rotation.x=-Math.PI/2;reveal.position.y=.105;
 box(2.20,.26,.06,0,.26,1.744,'gold',root,.025);label('CO₂unter',2.10,.21,0,.26,1.779);
 for(const side of [-1,1]){const screw=ball(.024,side*1.01,.26,1.79,'gold');screw.scale.z=.4;}
 // Celestial globe in a stationary instrument mount. Geographic land relief,
 // meridians, fine latitude lines and calibrated brass rim read as an instrument.
 const globeCenter=new T.Vector3(-2.35,2.11,-.32),radius=1.12;
 disk(.78,.13,-2.35,.56,-.32,'gold');disk(.64,.12,-2.35,.67,-.32,'blue');disk(.22,.32,-2.35,.86,-.32,'gold');
 const globe=group(...globeCenter.toArray());globe.rotation.y=.45;
 ball(radius,0,0,0,'blue',globe);
 const spherical=(lon,lat,r=radius+.009)=>{const l=lon*Math.PI/180,p=lat*Math.PI/180;return [r*Math.cos(p)*Math.sin(l),r*Math.sin(p),r*Math.cos(p)*Math.cos(l)];};
 for(let lat=-60;lat<=60;lat+=30)line(Array.from({length:73},(_,j)=>spherical(j*5,lat)),.0045,'gold',globe);
 for(let lon=0;lon<360;lon+=30)line(Array.from({length:49},(_,j)=>spherical(lon,-90+j*3.75)),.0045,'gold',globe);
 // Public-domain Natural Earth coastlines, triangulated in their original
 // dateline-clipped lon/lat polygons and subdivided before spherical projection.
 // The source cuts polygons at ±180; never connect wrapped endpoints across Earth.
 const landVertices=[];
 const emit=(a,b,c,depth=0)=>{
  const dist=(p,q)=>(p.x-q.x)**2+(p.y-q.y)**2;
  const lengths=[dist(a,b),dist(b,c),dist(c,a)],longest=Math.max(...lengths);
  if(longest>16&&depth<16){const i=lengths.indexOf(longest);
   if(i===0){const mid=a.clone().add(b).multiplyScalar(.5);emit(a,mid,c,depth+1);emit(mid,b,c,depth+1);}
   else if(i===1){const mid=b.clone().add(c).multiplyScalar(.5);emit(a,b,mid,depth+1);emit(a,mid,c,depth+1);}
   else {const mid=c.clone().add(a).multiplyScalar(.5);emit(a,b,mid,depth+1);emit(mid,b,c,depth+1);}return;
  }
  for(const p of [a,b,c])landVertices.push(...spherical(p.x,p.y,radius+.015));
 };
 for(const rings of landPolygons){
  const shape=new T.Shape(rings[0].map(([x,y])=>new T.Vector2(x,y)));
  for(const hole of rings.slice(1))shape.holes.push(new T.Path(hole.map(([x,y])=>new T.Vector2(x,y))));
  const flat=new T.ShapeGeometry(shape).toNonIndexed(),a=flat.attributes.position;
  for(let i=0;i<a.count;i+=3)emit(new T.Vector2(a.getX(i),a.getY(i)),new T.Vector2(a.getX(i+1),a.getY(i+1)),new T.Vector2(a.getX(i+2),a.getY(i+2)));
  flat.dispose();
 }
 const landGeometry=new T.BufferGeometry();landGeometry.setAttribute('position',new T.Float32BufferAttribute(landVertices,3));landGeometry.computeVertexNormals();
 const landMesh=mesh(landGeometry,'ivory',globe);landMesh.name='co2unter-earth-land';
 const meridian=mesh(new T.TorusGeometry(1.25,.026,12,160),'gold');meridian.position.copy(globeCenter);meridian.rotation.z=-.2;
 for(let i=0;i<72;i++){const a=i*Math.PI/36;const tick=box(.008,i%6===0?.065:.028,.014,Math.sin(a)*1.25,Math.cos(a)*1.25,0,'gold',globe,.003);tick.rotation.z=-a;}
 // Brass polar spindle and turned base detail make the globe an instrument.
 disk(.055,.23,-2.35,3.34,-.32,'gold');ball(.065,-2.35,3.48,-.32,'gold');
 for(const yy of [.59,.72]){const rim=mesh(new T.TorusGeometry(.65,.012,8,96),'gold');rim.position.set(-2.35,yy,-.32);rim.rotation.x=Math.PI/2;}
 const source=group(-1.55,2.24,.41);ball(.065,0,0,0,'jade',source);mesh(new T.TorusGeometry(.11,.012,8,48),'gold',source);
 label('01  /  CARBON DATA',1.62,.16,-2.35,.52,.63);

 // Oversized working-screen miniature: complete hierarchy, actual choices and
 // a changing result card; no decorative placeholder bars or made-up values.
 const phone=group(-.02,.59,.0);phone.rotation.x=-.10;
 box(1.87,.12,.85,0,0,0,'gold',phone,.05);box(1.65,.10,.67,0,.10,0,'paper',phone,.04);
 const frame=panel(1.83,3.12,.16,.20,'gold',phone);frame.position.set(0,1.84,0);
 const body=panel(1.75,3.05,.16,.18,'ivory',phone);body.position.set(0,1.84,.035);
 const glass=panel(1.56,2.68,.018,.10,'ink',phone);glass.position.set(0,1.86,.206);
 box(.32,.025,.015,0,3.22,.221,'ink',phone,.01);ball(.022,.25,3.22,.228,'blue',phone);
 const home=mesh(new T.TorusGeometry(.057,.009,8,40),'gold',phone);home.position.set(0,.41,.224);
 for(const [x,y,h] of [[-.94,2.65,.16],[-.94,2.40,.16],[.94,2.55,.28]])box(.02,h,.085,x,y,.08,'gold',phone,.01);
 const display=group(-.02,.59,0);display.rotation.x=-.10;
 const screenMap=surfaces.screenFrames.length?new T.CanvasTexture(surfaces.screenFrames[0]):null;if(screenMap){screenMap.colorSpace=T.SRGBColorSpace;screenMap.anisotropy=4;}
 const screen=new T.Mesh(new T.PlaneGeometry(1.48,2.47),new T.MeshStandardMaterial({color:surfaces.screenFrames.length?0xffffff:0x12323f,map:screenMap,roughness:.58,emissive:0xffffff,emissiveMap:screenMap,emissiveIntensity:surfaces.screenFrames.length?.15:0}));screen.position.set(0,1.86,.241);screen.name='co2unter-converter-screen';screen.userData.noReceiveShadow=true;display.add(screen);
 label('02  /  CONVERT',1.36,.15,-.02,.53,.66);

 // Two generous comparison stages are intentionally separated in depth and
 // height. The upper wood stage remains visible above the banana bunch.
 const pods=[{x:2.25,z:.88,r:.75,lift:.02,name:'BANANAS'},{x:2.72,z:-.63,r:.78,lift:.68,name:'WOOD'}];
 const rings=[],specimens=[];
 for(const [i,pod] of pods.entries()){
  disk(pod.r,.085,pod.x,.50,pod.z,'gold');disk(pod.r-.025,.20+pod.lift,pod.x,.64+pod.lift/2,pod.z,'paper');disk(pod.r-.05,.05,pod.x,.77+pod.lift,pod.z,'ivory');
  const rim=mesh(new T.TorusGeometry(pod.r-.05,.013,8,96),'gold');rim.position.set(pod.x,.80+pod.lift,pod.z);rim.rotation.x=Math.PI/2;
  if(i===1)for(let j=0;j<36;j++){const a=j*Math.PI/18;line([[pod.x+Math.sin(a)*(pod.r-.023),.58,pod.z+Math.cos(a)*(pod.r-.023)],[pod.x+Math.sin(a)*(pod.r-.023),.71+pod.lift,pod.z+Math.cos(a)*(pod.r-.023)]],.008,'shade');}
  box(.96,.18,.035,pod.x,.65+pod.lift,pod.z+pod.r+.02,'gold',root,.012);label(pod.name,.91,.145,pod.x,.65+pod.lift,pod.z+pod.r+.041);
  const ring=group(pod.x,.812+pod.lift,pod.z);ring.name=`co2unter-${pod.name.toLowerCase()}-halo`;
  const tor=mesh(new T.TorusGeometry(pod.r-.10,.022,12,100),'jade',ring);tor.rotation.x=Math.PI/2;rings.push(ring);
 }
 const bananaBunch=group(2.25,.84,.88);bananaBunch.name='co2unter-banana-specimen';specimens.push(bananaBunch);
 for(let j=0;j<4;j++){
  const off=(j-1.5)*.17;
  const path=new T.CatmullRomCurve3([new T.Vector3(-.55,.14,off),new T.Vector3(-.28,.035,off),new T.Vector3(.09,.10,off*.85),new T.Vector3(.40,.33,off*.50),new T.Vector3(.48,.53,-.04)]);
  const segments=56,sides=16,geo=new T.TubeGeometry(path,segments,1,sides,false),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const u=Math.floor(i/(sides+1))/segments,a=(i%(sides+1))/sides*Math.PI*2,center=path.getPointAt(u),v=new T.Vector3().fromBufferAttribute(p,i);const radius=(.014+.09*Math.pow(Math.sin(Math.PI*u),.6))*(1+.035*Math.cos(a*5));v.sub(center).normalize().multiplyScalar(radius).add(center);p.setXYZ(i,v.x,v.y,v.z);}geo.computeVertexNormals();mesh(geo,'yellow',bananaBunch);
  ball(.025,-.55,.14,off,'wood',bananaBunch);
 }
 const stalk=box(.115,.17,.12,.48,.58,-.04,'wood',bananaBunch,.035);stalk.rotation.z=-.12;
 const logs=group(2.72,1.49,-.63);logs.name='co2unter-wood-specimen';specimens.push(logs);logs.rotation.y=-.10;
 for(const [x,y] of [[-.23,.23],[.23,.23],[0,.62]]){
  const g=group(x,y,0,logs),geo=new T.CylinderGeometry(.225,.24,1.07,40,14,true),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),f=1+.035*Math.sin(a*9+y*4)+.022*Math.sin(a*17-y*6);p.setXYZ(i,x*f,y,z*f);}geo.computeVertexNormals();const trunk=mesh(geo,'bark',g);trunk.rotation.x=Math.PI/2;
  for(const side of [-1,1]){const end=mesh(new T.CircleGeometry(.225,64),'cut',g);end.position.z=side*.541;if(side<0)end.rotation.y=Math.PI;
   const edge=mesh(new T.TorusGeometry(.228,.012,8,64),'bark',g);edge.position.z=side*.537;
   for(const radius of [.045,.083,.123,.164,.20]){const points=Array.from({length:49},(_,j)=>{const a=j*Math.PI/24,r=radius*(1+.035*Math.sin(a*5)+.017*Math.cos(a*9));return new T.Vector3(Math.cos(a)*r,Math.sin(a)*r,side*.549);});mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),64,.0029,5,false),'wood',g);}
   for(const a of [.35,2.7,4.6])line([[Math.cos(a)*.22,Math.sin(a)*.22,side*.547],[Math.cos(a+.08)*.13,Math.sin(a+.08)*.13,side*.548]],.004,'wood',g);
  }
 }
 // Routed process channels terminate at physical objects, not arbitrary space.
 const intakeCurve=new T.CatmullRomCurve3([new T.Vector3(-2.35,.49,.62),new T.Vector3(-2.0,.49,1.25),new T.Vector3(-1.04,.49,1.18),new T.Vector3(-.81,.49,.50)]);
 const paths=pods.map(p=>new T.CatmullRomCurve3([new T.Vector3(.85,.49,.50),new T.Vector3(1.25,.49,.50),new T.Vector3(p.x-p.r-.10,.49,p.z),new T.Vector3(p.x-p.r+.05,.49,p.z)]));
 [intakeCurve,...paths].forEach(c=>line(c.getPoints(60).map(v=>v.toArray()),.022,'gold'));
 for(const [x,z] of [[-2.35,.62],[-.81,.50],[.85,.50]]){disk(.10,.018,x,.49,z,'gold');disk(.061,.023,x,.51,z,'blue');}
 const carrier=group();carrier.name='co2unter-conversion-packet';ball(.074,0,0,0,'jade',carrier);carrier.position.copy(intakeCurve.getPointAt(0));
 for(const [x,z] of [[-1.55,1.29],[1.15,.50]])line([[x-.07,.5,z-.065],[x+.035,.5,z],[x-.07,.5,z+.065]],.016,'gold');
 const preserved=[globe,source,labels,display,...rings,carrier];
 finish(20,preserved);
 const pathOffset=carrier.position.clone().sub(intakeCurve.getPointAt(0));
 const stories=[
  ['Start with a carbon footprint','The 2018 prototype turns carbon-emissions input into a familiar comparison.'],
  ['Choose bananas','The phone selects an everyday reference, then sends the comparison to its display.'],
  ['See an everyday reference','The selected banana display lights up. These specimens illustrate the idea, not a measured quantity.'],
  ['Switch to wood','The same input can be viewed through another familiar reference. The phone and wood display change together.']
 ];
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 let lastScreen=-1,manualTime=null,timeOffset=0;
 const stepTimes=[2.5,8.5,12.5,20.5];
 root.userData={...root.userData,displayBase:false,studioProfile:'lrnmate',initialYaw:-.10,initialElevation:.24,autoOrbit:false,realTimeAnimation:true,cycleDuration:24,
 setStep(index,elapsed=0){if(index===null){timeOffset=elapsed-(manualTime??(elapsed-timeOffset));manualTime=null;}else{manualTime=stepTimes[Math.max(0,Math.min(3,index))];}root.userData.animate(elapsed);},
 animate(time){const clock=manualTime??(time-timeOffset),t=((clock%24)+24)%24,index=t<5?0:t<10?1:t<16?2:3;
  root.userData.story={index,step:`0${index+1} / 04`,title:stories[index][0],detail:stories[index][1],tone:'neutral'};
  screen.userData.comparison=index===3?'wood':index>=1?'bananas':'input';
  if(lastScreen!==index&&surfaces.screenFrames.length){screenMap.image=surfaces.screenFrames[index];screenMap.needsUpdate=true;lastScreen=index;}
  source.scale.setScalar(1+.10*Math.sin(Math.PI*Math.min(1,t/5)));
  rings[0].visible=t>=10&&t<16;rings[1].visible=t>=19&&t<23;
  let c=null,u=0;if(t<4.5){c=intakeCurve;u=smooth(t/4.5);}else if(t>=7&&t<10){c=paths[0];u=smooth((t-7)/3);}else if(t>=16&&t<19){c=paths[1];u=smooth((t-16)/3);}
  carrier.visible=Boolean(c);carrier.position.copy((c??intakeCurve).getPointAt(c?u:0)).add(pathOffset);
 }};
 root.userData.animate(0);return root;
}
