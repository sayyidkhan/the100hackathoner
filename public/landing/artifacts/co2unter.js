import {medivoiceStudio} from './medivoice-studio.js';
import {landPolygons} from './co2unter-land.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';

// The sculptural arrangement interprets the original carbon-to-familiar-units
// converter. No geometry or animation represents a measured emission quantity.
export function createArtifact(T) {
 const kit=medivoiceStudio(T),{root,materials:m,mesh,disk,ball,line,texture,finish}=kit;
 const palette={paper:0xe3d4b8,ivory:0xf5e9d1,blue:0x164d59,ink:0x163b40,gold:0xb99353,wood:0x6e4931,bark:0x503524,cut:0xc9a573,yellow:0xd4ab43,jade:0x5cb9a9,shade:0xa79b7f};
 for(const [k,color] of Object.entries(palette))m[k]=new T.MeshStandardMaterial({color,roughness:k==='gold'?.32:.76,metalness:k==='gold'?.72:0});
 const grain=texture('paper'),wood=texture('wood');
 for(const k of ['paper','ivory','cut']){m[k].bumpMap=grain;m[k].bumpScale=k==='paper'?.024:.009;}
 for(const k of ['wood','bark']){m[k].bumpMap=wood;m[k].bumpScale=.028;}
 m.blue.roughness=.32;m.blue.metalness=.15;
 m.jade.emissive=new T.Color(0x235f58);m.jade.emissiveIntensity=.3;
 m.paper.map=planningExhibitSurfaces(T).stone;m.paper.bumpMap=m.paper.map;m.paper.bumpScale=.028;
 const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
 function box(w,h,d,x,y,z,color='ivory',p=root,r=.035){
  r=Math.min(r,w*.48,h*.48,d*.48);const geo=new T.BoxGeometry(w,h,d,6,6,6),a=geo.attributes.position;
  for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i),c=new T.Vector3(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));v.sub(c).normalize().multiplyScalar(r).add(c);a.setXYZ(i,v.x,v.y,v.z);}geo.computeVertexNormals();const o=mesh(geo,color,p);o.position.set(x,y,z);return o;
 }
 const labels=group();
 function label(text,w,h,x,y,z,color='#d3b579',bg='#183a3d',p=labels){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.max(128,Math.round(1024*h/w));const c=canvas.getContext('2d');c.fillStyle=bg;c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle=color;c.font=`500 ${Math.round(canvas.height*.52)}px Georgia, serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,canvas.width/2,canvas.height/2,canvas.width*.91);const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.8}));o.position.set(x,y,z);p.add(o);return o;
 }
 // Rounded limestone exhibition slab with a dark shadow gap and brass reveal.
 box(8.05,.10,3.25,0,.04,0,'ink',root,.04);
 box(8.2,.35,3.35,0,.25,0,'paper',root,.14);
 box(7.87,.025,3.04,0,.437,0,'gold',root,.012);
 box(7.80,.035,2.97,0,.46,0,'paper',root,.017);
 box(1.75,.23,.04,0,.23,1.69,'gold');
 label('CO2unter',1.67,.185,0,.23,1.716);

 // Celestial globe in a stationary instrument mount. Geographic land relief,
 // meridians, fine latitude lines and calibrated brass rim read as an instrument.
 const globeCenter=new T.Vector3(-2.45,1.97,-.10),radius=1.12;
 disk(.72,.13,-2.45,.55,-.1,'gold');disk(.60,.12,-2.45,.65,-.1,'blue');disk(.19,.28,-2.45,.81,-.1,'gold');
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
 // Globe remains stable; the selected source lights up only during intake.
 const source=group(-1.57,2.17,.61);ball(.074,0,0,0,'jade',source);const targetRing=mesh(new T.TorusGeometry(.13,.012,8,48),'gold',source);
 const markerLabel=label('CARBON DATA',1.28,.16,-2.45,.65,.66);
 if(markerLabel)markerLabel.rotation.x=-.1;

 // Source -> converter channel inset into the stone, with one guided sample.
 const intakeCurve=new T.CatmullRomCurve3([new T.Vector3(-1.58,.51,.75),new T.Vector3(-1.1,.51,1.05),new T.Vector3(-.55,.51,1.02),new T.Vector3(0,.51,.65)]);
 line(intakeCurve.getPoints(70).map(v=>v.toArray()),.016,'gold');
 const phone=group(0,.56,-.18);phone.rotation.x=-.065;
 box(1.45,.12,.82,0,0,0,'gold',phone,.05);box(1.20,.15,.61,0,.11,0,'ivory',phone,.06);
 box(1.45,2.53,.17,0,1.46,0,'gold',phone,.08);box(1.37,2.46,.17,0,1.46,.025,'ivory',phone,.075);box(1.20,2.16,.025,0,1.48,.123,'ink',phone,.012);
 box(.35,.022,.012,0,2.59,.13,'shade',phone,.01);ball(.018,.29,2.59,.141,'blue',phone);
 const phoneLabels=group(0,.56,-.18,labels);phoneLabels.rotation.x=-.065;
 label('CO2unter',1.07,.23,0,2.34,.144,'#ead7ac','#163b40',phoneLabels);
 label('CARBON',.99,.16,0,2.02,.149,'#b48b46','#f1e5cc',phoneLabels);
 label('COMPARE',.99,.16,0,1.16,.149,'#b48b46','#f1e5cc',phoneLabels);
 label('FAMILIAR UNITS',.99,.12,0,.57,.149,'#cfddcf','#163b40',phoneLabels);
 box(1.0,.48,.014,0,1.89,.14,'ivory',phone,.007);box(1.0,.48,.014,0,1.03,.14,'ivory',phone,.007);
 for(let j=0;j<3;j++){box(.52-j*.05,.027,.016,-.11,1.89-j*.09,.156,'shade',phone,.006);box(.46+j*.04,.026,.016,-.13,1.04-j*.09,.156,'shade',phone,.006);}
 line([[-.09,1.57,.16],[-.09,1.38,.16],[-.15,1.44,.16]],.016,'gold',phone);line([[.09,1.39,.16],[.09,1.58,.16],[.15,1.52,.16]],.016,'gold',phone);
 const phoneGlow=group(0,.56,-.18);phoneGlow.rotation.x=-.065;
 const inputGlow=box(.024,.43,.016,-.53,1.89,.163,'jade',phoneGlow,.007),outputGlow=box(.024,.43,.016,-.53,1.03,.163,'jade',phoneGlow,.007);

 // Everyday comparisons are displayed as physical specimens. Their counts are
 // compositional only and do not encode an emissions conversion factor.
 const pods=[{x:2.18,z:.74,r:.68,lift:0,name:'BANANAS'},{x:2.72,z:-.69,r:.71,lift:.32,name:'WOOD'}];
 const rings=[];
 for(const pod of pods){disk(pod.r,.12,pod.x,.53,pod.z,'gold');disk(pod.r-.035,.19+pod.lift,pod.x,.665+pod.lift/2,pod.z,'paper');disk(pod.r-.085,.025,pod.x,.773+pod.lift,pod.z,'ivory');label(pod.name,.91,.12,pod.x,.65+pod.lift,pod.z+pod.r+.006);const g=group(pod.x,.794+pod.lift,pod.z);const tor=mesh(new T.TorusGeometry(pod.r-.11,.018,10,96),'jade',g);tor.rotation.x=Math.PI/2;rings.push(g);}
 function banana(x,z,tilt){
  const g=group(x,.84,z);g.rotation.y=tilt;
  const path=new T.CatmullRomCurve3([new T.Vector3(-.42,.27,0),new T.Vector3(-.22,.045,0),new T.Vector3(.06,.02,0),new T.Vector3(.31,.16,0),new T.Vector3(.4,.37,0)]);
  const geometry=new T.TubeGeometry(path,44,.095,12,false),pos=geometry.attributes.position;
  // Taper the two tips while retaining curved cross sections.
  for(let i=0;i<pos.count;i++){const step=Math.floor(i/13)/44,c=path.getPointAt(Math.max(0,Math.min(1,step))),v=new T.Vector3().fromBufferAttribute(pos,i);const taper=.38+.62*Math.pow(Math.sin(Math.PI*step),.45);v.sub(c).multiplyScalar(taper).add(c);pos.setXYZ(i,v.x,v.y,v.z);}geometry.computeVertexNormals();mesh(geometry,'yellow',g);
  for(const a of [-.9,.9])line(path.getPoints(36).map(p=>[p.x,p.y+.045,p.z+a*.064]),.003,'cut',g);
  const stem=box(.06,.13,.06,.4,.42,0,'wood',g,.016);stem.rotation.z=-.2;
 }
 banana(2.16,.58,-.10);banana(2.15,.78,.06);banana(2.18,.98,.20);
 for(const [x,y,z] of [[2.43,1.23,-.66],[2.84,1.23,-.66],[2.65,1.49,-.66]]){
  const log=group(x,y,z);const trunk=disk(.18,.88,0,0,0,'bark',log);trunk.rotation.x=Math.PI/2;
  for(const side of [-1,1]){const end=disk(.166,.012,0,0,side*.448,'cut',log);end.rotation.x=Math.PI/2;
   for(const rr of [.035,.067,.103,.139]){const ring=mesh(new T.TorusGeometry(rr,.004,6,42),'wood',log);ring.position.z=side*.456;ring.scale.y=.92;}}
  for(let j=0;j<10;j++){const a=j*Math.PI/5;line([[Math.sin(a)*.18,Math.cos(a)*.18,-.42],[Math.sin(a+.06)*.181,Math.cos(a+.06)*.181,0],[Math.sin(a)*.18,Math.cos(a)*.18,.42]],.007,'wood',log);}
 }
 const paths=pods.map(p=>new T.CatmullRomCurve3([new T.Vector3(.72,.51,.35),new T.Vector3(1.22,.51,.35),new T.Vector3(p.x-.6,.51,p.z),new T.Vector3(p.x,.51,p.z)]));
 paths.forEach(c=>line(c.getPoints(65).map(v=>v.toArray()),.016,'gold'));
 const carrier=group();carrier.name='co2unter-conversion-packet';ball(.066,0,0,0,'jade',carrier);
 // Small etched wayfinding arrows clarify that the channels are a process.
 for(const [x,z] of [[-1.05,1.04],[1.16,.35]])line([[x-.06,.52,z-.06],[x+.025,.52,z],[x-.06,.52,z+.06]],.013,'gold');
 carrier.position.copy(intakeCurve.getPointAt(0));
 const preserved=[globe,source,labels,phoneGlow,...rings,carrier];
 finish(20,preserved);
 // finish() centers all root groups equally; retain the offset for path samples.
 const pathOffset=carrier.position.clone().sub(intakeCurve.getPointAt(0));
 const stories=[
  ['Carbon data, made approachable','The original project explored carbon-emissions data through a mobile converter.'],
  ['Choose a familiar comparison','The converter relates a carbon input to an everyday unit.'],
  ['Make the scale tangible','Bananas are one of the familiar comparisons in the original project story.'],
  ['Compare another perspective','Wood provides another everyday reference. Objects here are illustrative, not measured quantities.']
 ];
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 root.userData={...root.userData,displayBase:false,studioProfile:'lrnmate',initialYaw:-.13,initialElevation:.32,autoOrbit:false,realTimeAnimation:true,cycleDuration:24,
 animate(time){const t=((time%24)+24)%24;let index=t<5?0:t<10?1:t<16?2:3;
  root.userData.story={index,step:`0${index+1} / 04`,title:stories[index][0],detail:stories[index][1],tone:'neutral'};
  source.scale.setScalar(1+.08*Math.sin(Math.PI*Math.min(1,t/5)));
  inputGlow.visible=t<10;outputGlow.visible=t>=7&&t<22;
  rings[0].visible=t>=10&&t<16;rings[1].visible=t>=19&&t<23;
  let c=null,u=0;if(t<4.5){c=intakeCurve;u=smooth(t/4.5);}else if(t>=7&&t<10){c=paths[0];u=smooth((t-7)/3);}else if(t>=16&&t<19){c=paths[1];u=smooth((t-16)/3);}
  carrier.visible=Boolean(c);carrier.position.copy((c??intakeCurve).getPointAt(c?u:0)).add(pathOffset);
 }};
 root.userData.animate(0);return root;
}
