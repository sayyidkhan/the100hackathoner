import {medivoiceStudio} from './medivoice-studio.js';
import {landPolygons} from './co2unter-land.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {co2unterSurfaces} from './co2unter-surfaces.js';

// Source-grounded converter interpretation. Objects are familiar references,
// never measured carbon results; no numeric emission factor is invented here.
export function createArtifact(T) {
 const {root,materials:m,mesh,disk,ball,line,texture,finish}=medivoiceStudio(T);
 const palette={paper:0xebe0cd,ivory:0xf0e7d7,blue:0x073e49,ink:0x122e32,gold:0xc9a46b,land:0xa9c4af,wood:0x745239,bark:0xffffff,cut:0xffffff,yellow:0xffffff,jade:0x87d1b8,shade:0xa89a7e};
 for(const [k,color] of Object.entries(palette))m[k]=new T.MeshStandardMaterial({color,roughness:k==='gold'?.32:.78,metalness:k==='gold'?.66:0});
 const grain=texture('paper'),surfaces=co2unterSurfaces(T);
 m.paper.map=planningExhibitSurfaces(T).stone;m.paper.bumpMap=m.paper.map;m.paper.bumpScale=.028;
 m.ivory.bumpMap=grain;m.ivory.bumpScale=.008;
 m.bark.map=surfaces.bark;m.bark.bumpMap=surfaces.bark;m.bark.bumpScale=.065;m.bark.roughness=.96;
 m.cut.map=surfaces.endgrain;m.cut.bumpMap=surfaces.endgrain;m.cut.bumpScale=.012;
 m.yellow.map=surfaces.banana;m.yellow.bumpMap=surfaces.banana;m.yellow.bumpScale=.008;m.yellow.roughness=.57;
 m.ink.roughness=.38;m.ink.metalness=.32;m.land.roughness=.72;m.land.bumpMap=grain;m.land.bumpScale=.018;
 m.blue.roughness=.26;m.blue.metalness=.27;m.blue.bumpMap=grain;m.blue.bumpScale=.007;
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
 const plinth=panel(8.0,3.65,.33,.8,'ink');plinth.rotation.x=-Math.PI/2;plinth.position.y=.11;
 const under=panel(7.88,3.52,.08,.75,'ink');under.rotation.x=-Math.PI/2;under.position.y=.025;
 const reveal=panel(7.94,3.58,.022,.78,'gold');reveal.rotation.x=-Math.PI/2;reveal.position.y=.105;
 const deck=panel(7.78,3.42,.025,.74,'paper');deck.rotation.x=-Math.PI/2;deck.position.y=.445;
 box(2.20,.26,.06,0,.26,1.844,'gold',root,.025);label('CO₂unter',2.10,.21,0,.26,1.879);
 for(const side of [-1,1]){const screw=ball(.024,side*1.01,.26,1.89,'gold');screw.scale.z=.4;}
 // Celestial globe in a stationary instrument mount. Geographic land relief,
 // meridians, fine latitude lines and calibrated brass rim read as an instrument.
 const globeCenter=new T.Vector3(-2.32,2.40,-.42),radius=1.34;
 disk(1.48,.06,-2.32,.52,-.42,'gold');disk(1.42,.13,-2.32,.60,-.42,'ink');disk(1.34,.035,-2.32,.68,-.42,'paper');
 disk(.56,.15,-2.32,.77,-.42,'gold');disk(.23,.24,-2.32,.96,-.42,'blue');
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
 const landGeometry=new T.BufferGeometry();landGeometry.setAttribute('position',new T.Float32BufferAttribute(landVertices,3));const landNormals=[],landUV=[];for(let i=0;i<landVertices.length;i+=3){const v=new T.Vector3(...landVertices.slice(i,i+3)).normalize();landNormals.push(v.x,v.y,v.z);landUV.push(.5+Math.atan2(v.z,v.x)/(2*Math.PI),.5+Math.asin(v.y)/Math.PI);}
 landGeometry.setAttribute('normal',new T.Float32BufferAttribute(landNormals,3));landGeometry.setAttribute('uv',new T.Float32BufferAttribute(landUV,2));
 const landMesh=mesh(landGeometry,'land',globe);landMesh.name='co2unter-earth-land';
 const meridian=mesh(new T.TorusGeometry(1.47,.025,12,160),'gold');meridian.position.copy(globeCenter);meridian.rotation.z=-.2;
 for(let i=0;i<72;i++){const a=i*Math.PI/36;const tick=box(.008,i%6===0?.065:.028,.014,Math.sin(a)*1.47,Math.cos(a)*1.47,0,'gold',globe,.003);tick.rotation.z=-a;}
 // Brass polar spindle and turned base detail make the globe an instrument.
 disk(.045,.15,-2.32,3.83,-.42,'gold');ball(.053,-2.32,3.93,-.42,'gold');
 const equator=mesh(new T.TorusGeometry(1.49,.012,8,160),'gold');equator.position.copy(globeCenter);equator.rotation.x=Math.PI/2;
 const scan=group(...globeCenter.toArray());scan.name='co2unter-globe-scan';
 const scanArc=mesh(new T.TorusGeometry(radius+.035,.008,8,100,Math.PI),'jade',scan);scanArc.rotation.z=-Math.PI/2;
 for(const yy of [.72,.82]){const rim=mesh(new T.TorusGeometry(.55,.012,8,96),'gold');rim.position.set(-2.32,yy,-.42);rim.rotation.x=Math.PI/2;}
 const source=group(-1.42,2.48,.55);ball(.065,0,0,0,'jade',source);mesh(new T.TorusGeometry(.11,.012,8,48),'gold',source);
 for(let i=0;i<96;i++){const a=i*Math.PI/48,r=1.37;const tick=box(.008,.006,i%8===0?.075:.035,-2.32+Math.sin(a)*r,.704,-.42+Math.cos(a)*r,'gold',root,.002);tick.rotation.y=a;}
 label('01   THE BIG PICTURE',1.72,.16,-2.32,.64,1.02);

 // Oversized working-screen miniature: complete hierarchy, actual choices and
 // a changing result card; no decorative placeholder bars or made-up values.
 const phone=group(.03,.59,.38);phone.rotation.x=-.08;phone.rotation.y=-.07;
 box(1.87,.12,.85,0,0,0,'gold',phone,.05);box(1.65,.10,.67,0,.10,0,'paper',phone,.04);
 const frame=panel(1.83,3.12,.16,.20,'gold',phone);frame.position.set(0,1.84,0);
 const body=panel(1.75,3.05,.16,.18,'ink',phone);body.position.set(0,1.84,.035);
 const glass=panel(1.62,2.83,.018,.12,'ink',phone);glass.position.set(0,1.86,.206);
 box(.38,.065,.025,0,3.23,.235,'ink',phone,.025);ball(.017,.13,3.23,.253,'blue',phone);
 box(.36,.018,.008,0,.40,.224,'gold',phone,.008);
 for(const [x,y,h] of [[-.94,2.65,.16],[-.94,2.40,.16],[.94,2.55,.28]])box(.02,h,.085,x,y,.08,'gold',phone,.01);
 const display=group(.03,.59,.38);display.rotation.copy(phone.rotation);
 const screenMap=surfaces.screenFrames.length?new T.CanvasTexture(surfaces.screenFrames[0]):null;if(screenMap){screenMap.colorSpace=T.SRGBColorSpace;screenMap.anisotropy=4;}
 const screen=new T.Mesh(new T.PlaneGeometry(1.56,2.72),new T.MeshBasicMaterial({color:surfaces.screenFrames.length?0xffffff:0x12323f,map:screenMap,toneMapped:false}));screen.position.set(0,1.86,.241);screen.name='co2unter-converter-screen';screen.userData.noReceiveShadow=true;screen.userData.noShadow=true;display.add(screen);
 label('02   MAKE IT FAMILIAR',1.66,.16,.03,.53,1.08);

 // Two generous comparison stages are intentionally separated in depth and
 // height. The upper wood stage remains visible above the banana bunch.
 const pods=[{x:2.36,z:.82,r:.94,lift:.02,name:'BANANAS'},{x:2.68,z:-.86,r:.86,lift:.94,name:'WOOD'}];
 const rings=[],specimens=[];
 for(const [i,pod] of pods.entries()){
  disk(pod.r,.085,pod.x,.50,pod.z,'gold');disk(pod.r-.025,.20+pod.lift,pod.x,.64+pod.lift/2,pod.z,'ink');disk(pod.r-.05,.05,pod.x,.77+pod.lift,pod.z,'ivory');
  const rim=mesh(new T.TorusGeometry(pod.r-.05,.013,8,96),'gold');rim.position.set(pod.x,.80+pod.lift,pod.z);rim.rotation.x=Math.PI/2;
  if(i===1)for(let j=0;j<36;j++){const a=j*Math.PI/18;line([[pod.x+Math.sin(a)*(pod.r-.023),.58,pod.z+Math.cos(a)*(pod.r-.023)],[pod.x+Math.sin(a)*(pod.r-.023),.71+pod.lift,pod.z+Math.cos(a)*(pod.r-.023)]],.008,'shade');}
  box(.96,.18,.035,pod.x,.65+pod.lift,pod.z+pod.r+.02,'gold',root,.012);label(pod.name,.91,.145,pod.x,.65+pod.lift,pod.z+pod.r+.041);
  const ring=group(pod.x,.812+pod.lift,pod.z);ring.name=`co2unter-${pod.name.toLowerCase()}-halo`;
  const tor=mesh(new T.TorusGeometry(pod.r-.10,.022,12,100),'jade',ring);tor.rotation.x=Math.PI/2;rings.push(ring);
 }
 const bananaBunch=group(2.36,.84,.82);bananaBunch.scale.setScalar(1.35);bananaBunch.name='co2unter-banana-specimen';specimens.push(bananaBunch);
 for(let j=0;j<4;j++){
  const off=(j-1.5)*.17;
  const path=new T.CatmullRomCurve3([new T.Vector3(-.55,.14,off),new T.Vector3(-.28,.035,off),new T.Vector3(.09,.10,off*.85),new T.Vector3(.40,.33,off*.50),new T.Vector3(.48,.53,-.04)]);
  const segments=56,sides=16,geo=new T.TubeGeometry(path,segments,1,sides,false),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const u=Math.floor(i/(sides+1))/segments,a=(i%(sides+1))/sides*Math.PI*2,center=path.getPointAt(u),v=new T.Vector3().fromBufferAttribute(p,i);const radius=(.014+.09*Math.pow(Math.sin(Math.PI*u),.6))*(1+.035*Math.cos(a*5));v.sub(center).normalize().multiplyScalar(radius).add(center);p.setXYZ(i,v.x,v.y,v.z);}geo.computeVertexNormals();mesh(geo,'yellow',bananaBunch);
  ball(.025,-.55,.14,off,'wood',bananaBunch);
 }
 const stalk=box(.115,.17,.12,.48,.58,-.04,'wood',bananaBunch,.035);stalk.rotation.z=-.12;
 const logs=group(2.68,1.75,-.86);logs.scale.setScalar(1.18);logs.name='co2unter-wood-specimen';specimens.push(logs);logs.rotation.y=-.10;
 for(const [x,y] of [[-.23,.23],[.23,.23],[0,.62]]){
  const g=group(x,y,0,logs),geo=new T.CylinderGeometry(.225,.24,1.07,40,14,true),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),f=1+.055*Math.sin(a*9+y*4)+.032*Math.sin(a*23-y*6)+.012*Math.sin(a*41+y*17);p.setXYZ(i,x*f,y,z*f);}geo.computeVertexNormals();const trunk=mesh(geo,'bark',g);trunk.rotation.x=Math.PI/2;
  for(const side of [-1,1]){const end=mesh(new T.CircleGeometry(.225,64),'cut',g);end.position.z=side*.541;if(side<0)end.rotation.y=Math.PI;
   const edge=mesh(new T.TorusGeometry(.228,.012,8,64),'bark',g);edge.position.z=side*.537;
   for(const radius of [.045,.083,.123,.164,.20]){const points=Array.from({length:49},(_,j)=>{const a=j*Math.PI/24,r=radius*(1+.06*Math.sin(a*5+radius*8)+.03*Math.cos(a*9));return new T.Vector3(Math.cos(a)*r,Math.sin(a)*r,side*.549);});mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),64,.0014,5,false),'wood',g);}
   for(const a of [.35,2.7,4.6])line([[Math.cos(a)*.22,Math.sin(a)*.22,side*.547],[Math.cos(a+.08)*.13,Math.sin(a+.08)*.13,side*.548]],.004,'wood',g);
  }
 }
 // Routed process channels terminate at physical objects, not arbitrary space.
 const intakeCurve=new T.CatmullRomCurve3([new T.Vector3(-2.32,.51,1.12),new T.Vector3(-1.8,.51,1.48),new T.Vector3(-.95,.51,1.43),new T.Vector3(-.81,.51,.90)]);
 const paths=pods.map(p=>new T.CatmullRomCurve3([new T.Vector3(.95,.51,.88),new T.Vector3(1.28,.51,.68),new T.Vector3(p.x-p.r-.10,.51,p.z),new T.Vector3(p.x-p.r+.05,.51,p.z)]));
 [intakeCurve,...paths].forEach(c=>line(c.getPoints(60).map(v=>v.toArray()),.022,'gold'));
 for(const [x,z] of [[-2.32,1.12],[-.81,.90],[.95,.88]]){disk(.10,.018,x,.49,z,'gold');disk(.061,.023,x,.51,z,'blue');}
 const carrier=group();carrier.name='co2unter-conversion-packet';ball(.074,0,0,0,'jade',carrier);carrier.position.copy(intakeCurve.getPointAt(0));
 for(const [x,z] of [[-1.55,1.48],[1.15,.80]])line([[x-.07,.5,z-.065],[x+.035,.5,z],[x-.07,.5,z+.065]],.016,'gold');
 const trail=group();trail.name='co2unter-packet-trail';const trailBeads=Array.from({length:7},(_,i)=>ball(.045-i*.004,0,0,0,'jade',trail));
 const preserved=[globe,scan,source,labels,display,...rings,carrier,trail];
 // Fit the actual component silhouettes, not the empty upper corners of the
 // whole plinth's box; this gives the artwork and live view comparable scale.
 root.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(root),centre=bounds.getCenter(new T.Vector3());
 const framingOffset=new T.Vector3(-centre.x,-bounds.min.y,-centre.z),framingPoints=[];
 root.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z).add(framingOffset));});
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
 root.userData={...root.userData,displayBase:false,groundLevel:0,framingPoints,studioProfile:'co2unter',initialYaw:-.13,initialElevation:.29,autoOrbit:false,realTimeAnimation:true,cycleDuration:24,
 setStep(index,elapsed=0){if(index===null){timeOffset=elapsed-(manualTime??(elapsed-timeOffset));manualTime=null;}else{manualTime=stepTimes[Math.max(0,Math.min(3,index))];}root.userData.animate(elapsed);},
 animate(time){const clock=manualTime??(time-timeOffset),t=((clock%24)+24)%24,index=t<5?0:t<10?1:t<16?2:3;
  root.userData.story={index,step:`0${index+1} / 04`,title:stories[index][0],detail:stories[index][1],tone:'neutral'};
  screen.userData.comparison=index===3?'wood':index>=1?'bananas':'input';
  if(lastScreen!==index&&surfaces.screenFrames.length){screenMap.image=surfaces.screenFrames[index];screenMap.needsUpdate=true;lastScreen=index;}
  scan.visible=t<5;scan.rotation.y=-Math.PI/2+Math.PI*2*smooth(t/5);
  source.scale.setScalar(1+.10*Math.sin(Math.PI*Math.min(1,t/5)));
  rings[0].visible=t>=10&&t<16;rings[1].visible=t>=19&&t<23;
  let c=null,u=0;if(t<4.5){c=intakeCurve;u=smooth(t/4.5);}else if(t>=7&&t<10){c=paths[0];u=smooth((t-7)/3);}else if(t>=16&&t<19){c=paths[1];u=smooth((t-16)/3);}
  trail.visible=Boolean(c);for(const [i,bead] of trailBeads.entries()){bead.position.copy((c??intakeCurve).getPointAt(Math.max(0,u-(i+1)*.035))).add(pathOffset).sub(trail.position);}
  carrier.visible=Boolean(c);carrier.position.copy((c??intakeCurve).getPointAt(c?u:0)).add(pathOffset);
 }};
 root.userData.animate(0);return root;
}
