import {medivoiceStudio} from './medivoice-studio.js';

// Singapore-inspired interpretation of the original rainfall / flood analysis prototype.
export const WEATHER_CYCLE=28;
export const WEATHER_STEPS=[
 ['History','Read the rainfall history','Annual rainfall and rainy-day patterns provide the starting point for flood analysis.'],
 ['Patterns','Connect rainfall with past floods','Compare historical patterns and flood-analysis clusters to identify signals.'],
 ['Risk window','Anticipate a period of elevated risk','The amber window illustrates a possible risk period, not an exact flood date or a live prediction.'],
 ['Local impact','Bring the analysis back to the neighbourhood','Explore what the rainfall patterns could mean for a Singapore precinct. All plotted values are illustrative.'],
];
// Illustrative normalized series, deliberately without fabricated dates or probabilities.
export const RAINFALL_HISTORY=[.24,.38,.28,.51,.72,.45,.33,.56,.82,.63,.48,.75];
const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
export function weatherMoment(time){
 const t=((time%WEATHER_CYCLE)+WEATHER_CYCLE)%WEATHER_CYCLE;
 return {t,index:t<7?0:t<14?1:t<21?2:3,rain:.15+.85*smooth(t/3)*(1-smooth((t-16)/7)),level:smooth((t-3)/12)*(1-smooth((t-21)/7))};
}
export function createArtifact(T){
 const {root,materials:m,mesh,box,line,disk,texture,batch,finish}=medivoiceStudio(T);
 const palette={concrete:0xbac0b4,cream:0xe5e1cf,teal:0x608b86,trim:0xd6d8c7,ink:0x182e38,window:0x254954,metal:0x56696b,asphalt:0x344448,soil:0x6a7560,grass:0x546c40,leaf:0x3b6349,leafLight:0x728453,bark:0x686653,yellow:0xd1b668,red:0xa73d35,green:0x80a348,rubber:0x172126,white:0xe7e9df,roof:0x617478,coral:0xba7960};
 for(const [key,color] of Object.entries(palette))m[key]=new T.MeshStandardMaterial({color,roughness:key==='asphalt'?.24:.73,metalness:['metal','roof'].includes(key)?.45:0});
 const stone=texture('stone');for(const key of ['concrete','cream','teal','soil']){m[key].bumpMap=stone;m[key].bumpScale=.008;}
 m.asphalt.bumpMap=stone;m.asphalt.bumpScale=.002;
 m.lit=new T.MeshStandardMaterial({color:0xf3d395,emissive:0xf9b958,emissiveIntensity:.65,roughness:.55});
 m.water=new T.MeshStandardMaterial({color:0x163e4d,roughness:.27,metalness:.13});
 m.cloud=new T.MeshPhysicalMaterial({color:0x809da9,metalness:.08,roughness:.22,transparent:true,opacity:.42,depthWrite:false,side:T.DoubleSide});
 const ripplePixels=new Uint8Array(128*128*4);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const v=128+Math.sin(x*.22+Math.sin(y*.16)*2)*29+Math.sin(y*.31+x*.08)*17,i=(y*128+x)*4;ripplePixels.set([v,v,v,255],i);}
 const ripple=new T.DataTexture(ripplePixels,128,128);ripple.wrapS=ripple.wrapT=T.RepeatWrapping;ripple.repeat.set(7,2);ripple.magFilter=T.LinearFilter;ripple.needsUpdate=true;m.water.bumpMap=ripple;m.water.bumpScale=.018;
 m.rain=new T.MeshBasicMaterial({color:0xc0dfeb,transparent:true,opacity:.48,depthWrite:false});
 m.foam=new T.MeshBasicMaterial({color:0xb7d9d7,transparent:true,opacity:.34,depthWrite:false});
 const live=[],hdbBounds=[];
 const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
 function ell(x,y,z,sx,sy,sz,key,p=root){const o=mesh(new T.SphereGeometry(1,12,8),key,p);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;}
 function label(text,w,h,x,y,z,p=root,color='#e3e8da',bg=null){
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.max(32,Math.round(1024*h/w));const ctx=c.getContext('2d');
  if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);}ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`500 ${Math.round(c.height*.63)}px sans-serif`;ctx.fillText(text,512,c.height/2,970);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:!bg,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);o.userData.noShadow=true;p.add(o);return o;
 }
 // A shallow cutaway of the precinct, with an open canal through the foreground.
 box(8.8,.14,4.8,0,.07,0,'ink');box(8.65,.34,2.7,0,.31,-.95,'soil');box(8.65,.08,2.7,0,.51,-.95,'concrete');
 box(8.65,.34,.45,0,.31,2.17,'soil');box(8.65,.08,.45,0,.51,2.17,'concrete');
 box(8.65,.08,1.6,0,.18,1.15,'concrete');
 function bank(z1,y1,z2,y2){
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([-4.325,y1,z1,4.325,y1,z1,-4.325,y2,z2,4.325,y1,z1,4.325,y2,z2,-4.325,y2,z2],3));geo.computeVertexNormals();const o=mesh(geo,'concrete');o.material=m.concrete.clone();o.material.side=T.DoubleSide;
 }
 bank(.40,.55,.72,.22);bank(1.65,.22,1.95,.55);
 for(let x=-4.2;x<4.3;x+=.34){line([[x,.554,.40],[x,.23,.71]],.003,'metal');line([[x,.23,1.65],[x,.554,1.95]],.003,'metal');}
 const water=group(0,.28,1.18);water.name='weather-canal-water';box(8.59,.024,1.30,0,0,0,'water',water);live.push(water);
 // Wet road, kerbs, markings and drains leading into the canal.
 box(8.64,.025,.66,0,.565,-.02,'asphalt');
 for(const z of [-.38,.34])box(8.64,.045,.055,0,.575,z,'trim');
 for(let x=-4.0;x<4.1;x+=.55)box(.24,.003,.017,x,.582,-.02,'white');
 for(const z of [.22,.25])box(8.35,.002,.009,0,.583,z,'yellow');
 for(const x of [-3.6,-1.4,1.1,3.65]){
  box(.22,.015,.13,x,.59,.27,'ink');for(let i=0;i<6;i++)box(.012,.005,.11,x-.09+i*.035,.601,.27,'metal');
  box(.22,.17,.035,x,.40,.46,'ink');box(.27,.025,.06,x,.49,.45,'trim');
 }
 function rail(x1,x2,z,y=.57){
  for(let x=x1;x<=x2;x+=.18)box(.014,.28,.014,x,y+.14,z,'metal');
  for(const yy of [.13,.29])box(x2-x1,.015,.017,(x1+x2)/2,y+yy,z,'metal');
 }
 for(const z of [.41,1.95]){rail(-4.3,-3.1,z);rail(-2.4,4.3,z);}
 // Pedestrian bridge and its railings span both banks.
 const bridge=group(-2.75,.62,1.17);box(.64,.085,1.72,0,0,0,'concrete',bridge);
 for(const x of [-.29,.29]){
  for(let z=-.82;z<.85;z+=.13)box(.014,.27,.014,x,.18,z,'metal',bridge);
  box(.024,.024,1.74,x,.32,0,'metal',bridge);
  box(.09,.38,.17,x,-.22,-.59,'concrete',bridge);box(.09,.38,.17,x,-.22,.59,'concrete',bridge);
 }
 function hdb(x,z,w,floors,number){
  const b=group(x,.55,z),d=.70,step=.235,base=.30,top=base+floors*step;
  hdbBounds.push({x,z,w,d,top:top+.55});
  for(let i=0;i<6;i++)box(.055,.30,d-.04,-w/2+.12+i*(w-.24)/5,.15,0,'cream',b);
  box(w,.06,d,0,.31,0,'trim',b);
  box(w,top-base,d-.12,0,base+(top-base)/2,-.06,'cream',b);
  // Recessed access galleries, handrails, doors, windows and condensers.
  for(let f=0;f<floors;f++){
   const y=base+f*step;
   box(w,.022,d+.06,0,y+.02,0,'trim',b);
   box(w-.06,.15,.018,0,y+.115,.305,'window',b);
   box(w,.014,.018,0,y+.11,.40,'trim',b);box(w,.015,.045,0,y+.175,.38,'cream',b);
   for(let a=0;a<6;a++){
    const xx=-w/2+.16+a*(w-.32)/5;
    box(.13,.115,.018,xx,y+.12,-.365,(a+f)%7===0?'lit':'window',b);
    box(.012,.12,.023,xx,y+.12,-.38,'trim',b);
    box(.07,.13,.022,xx,y+.105,.32,(a+f)%5===0?'lit':'teal',b);
    box(.012,.075,.015,xx,y+.14,.40,'metal',b);
   }
   for(const side of [-1,1]){
    box(.018,.13,.23,side*(w/2+.008),y+.12,-.04,'window',b);
    box(.07,.065,.10,side*(w/2+.04),y+.05,.14,'trim',b);
    const fan=disk(.021,.004,side*(w/2+.08),y+.05,.14,'metal',b);fan.rotation.z=Math.PI/2;
   }
  }
  // Lift tower, parapet and rooftop services are distinct from the repeated floors.
  box(.23,top+.16,.82,-w*.24,(top+.16)/2,-.02,'teal',b);
  box(w+.10,.065,d+.12,0,top+.06,0,'trim',b);
  for(const side of [-1,1])box(.025,.12,d+.12,side*(w+.07)/2,top+.14,0,'cream',b);
  for(const zz of [-.39,.39])box(w,.12,.025,0,top+.14,zz,'cream',b);
  box(.36,.21,.29,w*.23,top+.17,-.05,'cream',b);disk(.13,.20,-w*.33,top+.22,-.06,'metal',b);
  label(number,.19,.14,-w*.24,top-.24,.405,b,'#edf1e4');
 }
 hdb(-3.08,-1.65,1.96,10,'101');hdb(-.90,-1.69,1.92,11,'102');hdb(.68,-1.05,1.13,7,'103');
 // Long covered linkway, with slender columns and a ribbed barrel roof.
 const path=group(-.90,.55,-.64);box(6.45,.035,.28,0,0,0,'trim',path);
 for(let x=-3.1;x<3.2;x+=.38)for(const z of [-.12,.12])box(.018,.40,.018,x,.21,z,'cream',path);
 const roofGeo=new T.CylinderGeometry(.18,.18,6.50,20,1,true,0,Math.PI);roofGeo.rotateZ(Math.PI/2);roofGeo.rotateX(Math.PI/2);
 // A simple cambered section built explicitly keeps the canopy upright.
 const canopy=new T.Shape();canopy.moveTo(-.19,0);canopy.quadraticCurveTo(0,.12,.19,0);canopy.lineTo(.19,-.015);canopy.quadraticCurveTo(0,.10,-.19,-.015);canopy.closePath();
 const canopyGeo=new T.ExtrudeGeometry(canopy,{depth:6.5,bevelEnabled:false,curveSegments:12});canopyGeo.rotateY(Math.PI/2);canopyGeo.translate(-3.25,.42,0);mesh(canopyGeo,'roof',path);roofGeo.dispose();
 for(let x=-3.2;x<3.2;x+=.22)line([[x,.42,-.19],[x,.49,0],[x,.42,.19]],.005,'metal',path);
 // Kopitiam pavilion and bus shelter.
 const cafe=group(2.05,.55,-.75);box(1.13,.05,.62,0,.025,0,'trim',cafe);
 for(const x of [-.49,.49])for(const z of [-.24,.24])box(.04,.51,.04,x,.28,z,'cream',cafe);
 box(.93,.30,.035,0,.22,-.25,'lit',cafe);label('KOPITIAM',.73,.10,0,.45,.285,cafe,'#263c3b','#e2d8b8');
 for(const x of [-.28,.28]){disk(.105,.025,x,.16,.02,'cream',cafe);box(.025,.15,.025,x,.075,.02,'metal',cafe);for(const z of [-.14,.15])box(.12,.10,.07,x,.065,z,'teal',cafe);}
 for(const s of [-1,1]){const r=box(1.25,.035,.40,0,.56,s*.17,'roof',cafe);r.rotation.x=s*.26;}
 const shelter=group(2.82,.56,-.28);box(.97,.04,.32,0,.43,0,'roof',shelter);
 for(const x of [-.40,.40])box(.024,.42,.024,x,.21,-.10,'metal',shelter);
 box(.65,.07,.10,0,.12,-.06,'teal',shelter);box(.10,.26,.035,-.40,.25,.01,'lit',shelter);
 function vehicle(x,z,isBus){
  const g=group(x,.60,z),w=isBus?.83:.46,d=isBus?.25:.20,h=isBus?.27:.13,key=isBus?'green':'red';
  box(w,h,d,0,h/2+.04,0,key,g);box(w*.78,.10,d*.89,0,h+.03,0,isBus?'green':'red',g);
  for(const zz of [-1,1]){
   box(w*.83,isBus?.13:.075,.008,0,h*.76,zz*(d/2+.005),'window',g);
   for(let j=0;j<(isBus?6:3);j++)box(.012,.14,.009,-w*.36+j*w*(isBus?.14:.32),h*.76,zz*(d/2+.01),'metal',g);
   for(const xx of [-w*.32,w*.32]){const wheel=disk(.063,.025,xx,.04,zz*d*.49,'rubber',g);wheel.rotation.x=Math.PI/2;}
  }
  box(.009,.10,d*.78,w/2+.005,h*.74,0,'window',g);
  for(const zz of [-d*.32,d*.32])box(.012,.025,.04,w/2+.01,.08,zz,'lit',g);
 }
 vehicle(2.85,-.17,true);vehicle(.95,.14,false);
 // Tropical canopy trees: branching trunks with layered irregular leaf clusters.
 let seed=15;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const leaves=[];
 function tree(x,z,h){
  const g=group(x,.55,z);line([[0,0,0],[.02,h*.5,0],[0,h*.78,.02]],.026,'bark',g);
  for(let i=0;i<9;i++){
   const a=i*2.4,r=.11+random()*.20,xx=Math.cos(a)*r,zz=Math.sin(a)*r,y=h*(.65+random()*.25);
   line([[0,h*.42,0],[xx*.6,y*.86,zz*.6],[xx,y,zz]],.011,'bark',g);
   ell(xx,y,zz,.14,.095,.14,i%3?'leaf':'leafLight',g);
   for(let j=0;j<20;j++){const a=random()*Math.PI*2,r=Math.sqrt(random())*.21;leaves.push({x:x+xx+Math.cos(a)*r,y:.55+y+(random()-.5)*.19,z:z+zz+Math.sin(a)*r,s:.035+random()*.025});}
  }
 }
 for(const [x,z,h] of [[-4,-.75,.85],[-3.8,-.40,.70],[-2.8,-.46,.64],[-1.8,-.48,.67],[-.2,-.48,.64],[1.5,-.5,.72],[3.8,-.48,.8],[4,-1.4,.82],[1.4,-1.5,.75]])tree(x,z,h);
 const foliage=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),m.leaf,leaves.length),leafDummy=new T.Object3D();
 foliage.name='weather-tropical-foliage';leaves.forEach((v,i)=>{leafDummy.position.set(v.x,v.y,v.z);leafDummy.scale.set(v.s*1.3,v.s*.65,v.s);leafDummy.rotation.set(i*.7,i*.3,i);leafDummy.updateMatrix();foliage.setMatrixAt(i,leafDummy.matrix);foliage.setColorAt(i,new T.Color().setHSL(.24+(i%7)*.012,.26,.56+(i%3)*.06));});foliage.computeBoundingBox();root.add(foliage);live.push(foliage);
 // A few palms add the familiar tropical street silhouette.
 for(const [x,z] of [[-3.3,-.42],[1.55,-.42],[3.8,-.95]]){
  line([[x,.55,z],[x+.03,1.0,z],[x+.07,1.45,z]],.018,'bark');
  for(let j=0;j<7;j++){
   const a=j*Math.PI*2/7,cx=x+.07,cy=1.45;
   line([[cx,cy,z],[cx+Math.cos(a)*.15,cy+.10,z+Math.sin(a)*.15],[cx+Math.cos(a)*.34,cy-.07,z+Math.sin(a)*.34]],.009,'leaf');
   for(let k=1;k<7;k++){const u=k/7,px=cx+Math.cos(a)*.34*u,pz=z+Math.sin(a)*.34*u,py=cy+.08*Math.sin(u*Math.PI)-.07*u;
    for(const side of [-1,1])line([[px,py,pz],[px+Math.cos(a+side*.8)*.09*(1-u*.5),py-.045,pz+Math.sin(a+side*.8)*.09*(1-u*.5)]],.005,'leaf');}
  }
 }
 for(let i=0;i<45;i++){const x=-4.15+i*.187;ell(x,.60,2.13,.09,.06,.09,i%2?'leaf':'grass');}
 // Level ruler and a physical rain gauge next to the analytics panel.
 const gauge=group(.25,.22,.66);box(.12,.58,.035,0,.29,0,'white',gauge);
 for(let i=0;i<18;i++)box(i%3===0?.072:.040,.006,.006,-.01,i*.030+.02,.022,i%3===0?'red':'ink',gauge);
 const instrument=group(3.91,.55,-.66);disk(.055,.82,0,.41,0,'metal',instrument);disk(.17,.04,0,.94,0,'metal',instrument);disk(.17,.04,0,.56,0,'metal',instrument);
 const glass=mesh(new T.CylinderGeometry(.15,.15,.38,32,1,true),'cloud',instrument);glass.position.y=.75;
 const collected=disk(.14,.1,0,.63,0,'water',instrument);live.push(collected);
 // A layered, scalloped glass cloud rather than a cluster of spheres.
 const cloud=group(-1.55,3.86,-1.35);cloud.name='weather-cloud';
 for(let layer=0;layer<4;layer++){
  const shape=new T.Shape();shape.moveTo(-2.08,.04);
  shape.bezierCurveTo(-2.40,.10,-2.30,.36,-1.91,.36);
  shape.bezierCurveTo(-1.89,.60,-1.49,.65,-1.27,.44);
  shape.bezierCurveTo(-1.10,.88,-.54,.94,-.27,.70);
  shape.bezierCurveTo(.02,1.03,.60,.91,.76,.63);
  shape.bezierCurveTo(1.13,.86,1.60,.63,1.62,.42);
  shape.bezierCurveTo(2.05,.58,2.41,.24,2.12,.10);
  shape.bezierCurveTo(1.50,-.02,-1.35,-.07,-2.08,.04);shape.closePath();
  const geo=new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSize:.055,bevelThickness:.05,bevelSegments:3,curveSegments:12});
  geo.scale(1-layer*.055,.72,1);geo.translate(layer*.025,layer*.055,-.45+layer*.26);mesh(geo,'cloud',cloud);
 }
 batch(cloud);live.push(cloud);
 // Instanced rain terminates at the nearest roof, so droplets do not cut through flats.
 const rainCount=210,rain=new T.InstancedMesh(new T.CylinderGeometry(.003,.003,.13,4),m.rain,rainCount),drops=[];
 rain.boundingBox=new T.Box3(new T.Vector3(-3.72,.55,-2),new T.Vector3(.85,4.1,-.7));
 rain.name='weather-rain';rain.userData.noShadow=true;rain.frustumCulled=false;root.add(rain);live.push(rain);
 for(let i=0;i<rainCount;i++){
  const x=-3.70+random()*4.5,z=-1.96+random()*1.20;
  let bottom=.58;for(const b of hdbBounds)if(Math.abs(x-b.x)<b.w/2+.08&&Math.abs(z-b.z)<b.d/2+.08)bottom=Math.max(bottom,b.top+.18);
  drops.push({x,z,bottom,phase:random(),speed:.65+random()*.35});
 }
 const foam=new T.InstancedMesh(new T.SphereGeometry(1,8,4),m.foam,54);foam.boundingBox=new T.Box3(new T.Vector3(-4.32,.29,.53),new T.Vector3(4.32,.50,1.83));foam.name='weather-current';foam.userData.noShadow=true;foam.frustumCulled=false;root.add(foam);live.push(foam);
 const foamSeeds=Array.from({length:54},()=>({x:random(),z:.65+random()*1.05,s:.03+random()*.07}));
 // Discrete runoff strands emerge from the roadside outlets.
 const runoff=[];for(const x of [-3.6,-1.4,1.1,3.65]){const g=group(x,.42,.48);line([[0,0,0],[0,-.08,.08],[0,-.17,.22]],.014,'water',g);live.push(g);runoff.push(g);}
 // Reframe the detailed precinct as the local context of an analytical instrument.
 const precinct=group();precinct.name='weather-singapore-precinct';
 for(const o of [...root.children])if(o!==precinct)precinct.add(o);
 const precinctScale=.52;precinct.scale.setScalar(precinctScale);precinct.position.set(-2.38,.25,.25);
 // Satin metal, mineral stone, luminous data and smoked glass share one museum plinth.
 m.slate=new T.MeshStandardMaterial({color:0x102d39,roughness:.39,metalness:.33});
 m.brass=new T.MeshStandardMaterial({color:0xbba06c,roughness:.29,metalness:.78});
 m.mint=new T.MeshStandardMaterial({color:0x8dd6cd,emissive:0x398c8b,emissiveIntensity:.55,roughness:.24,metalness:.35});
 m.amber=new T.MeshStandardMaterial({color:0xffc880,emissive:0xc06b24,emissiveIntensity:.5,roughness:.30,metalness:.3});
 m.signal=new T.MeshBasicMaterial({color:0xcdf8ea,toneMapped:false});
 m.exposure=new T.MeshBasicMaterial({color:0xffbb70,transparent:true,opacity:.16,depthWrite:false});
 m.riskGlass=new T.MeshBasicMaterial({color:0xffba69,transparent:true,opacity:.10,depthWrite:false,side:T.DoubleSide});
 function rounded(w,h,d,x,y,z,key,parent=root,r=.12){
  const shape=new T.Shape(),a=-w/2,b=-h/2;r=Math.min(r,w/2,h/2);
  shape.moveTo(a+r,b);shape.lineTo(a+w-r,b);shape.quadraticCurveTo(a+w,b,a+w,b+r);shape.lineTo(a+w,b+h-r);shape.quadraticCurveTo(a+w,b+h,a+w-r,b+h);shape.lineTo(a+r,b+h);shape.quadraticCurveTo(a,b+h,a,b+h-r);shape.lineTo(a,b+r);shape.quadraticCurveTo(a,b,a+r,b);
  const geo=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:2,curveSegments:8});geo.translate(0,0,-d/2);const o=mesh(geo,key,parent);o.position.set(x,y,z);return o;
 }
 const base=rounded(10.15,5.2,.21,0,.12,0,'slate',root,.32);base.rotation.x=-Math.PI/2;
 const inset=rounded(9.94,4.98,.035,0,.244,0,'cream',root,.29);inset.rotation.x=-Math.PI/2;
 const edge=rounded(10.08,5.13,.025,0,.20,0,'brass',root,.31);edge.rotation.x=-Math.PI/2;
 // The rear analysis instrument is the focal point: history to the left, a future window to the right.
 const screen=group(2.22,.40,-1.45);
 rounded(4.60,3.68,.12,0,1.84,0,'brass',screen,.18);
 rounded(4.48,3.56,.10,0,1.84,.08,'slate',screen,.15);
 for(const x of [-1.70,1.70]){box(.12,.35,.20,x,-.03,0,'brass',screen);box(.52,.045,.60,x,-.14,.10,'slate',screen);}
 label('WEATHER GURU',3.93,.28,0,3.32,.15,screen);
 label('RAINFALL HISTORY  /  FLOOD OUTLOOK',3.88,.17,0,3.03,.15,screen,'#a9c6cb');
 const chartBase=1.13,chartTop=2.72;
 for(let j=0;j<5;j++)box(3.86,.006,.008,0,chartBase+j*.36,.15,'metal',screen);
 const bars=[];
 RAINFALL_HISTORY.forEach((v,i)=>{
  const g=group(-1.88+i*.225,chartBase,.18,screen);box(.12,v*1.50,.06,0,v*.75,0,'teal',g);g.name=`weather-history-${i}`;live.push(g);bars.push(g);
 });
 const curvePoints=RAINFALL_HISTORY.map((v,i)=>[-1.88+i*.225,chartBase+.18+v*1.5,.27]);
 line(curvePoints,.015,'mint',screen);
 for(const i of [4,8,11]){ell(curvePoints[i][0],curvePoints[i][1],.27,.040,.040,.025,'amber',screen);}
 // Observations stop at the divider; a dashed path and translucent band distinguish the outlook.
 const divider=.85;
 for(let y=chartBase;y<2.79;y+=.12)box(.009,.062,.008,divider,y,.20,'brass',screen);
 label('HISTORY',2.16,.17,-.64,.94,.18,screen,'#9cd6cc');label('OUTLOOK',1.0,.17,1.48,.94,.18,screen,'#ffd195');
 const future=group(0,0,0,screen);future.name='weather-forecast-window';
 box(1.02,1.60,.012,1.43,1.93,.17,'riskGlass',future);
 for(const x of [.92,1.94])box(.012,1.60,.014,x,1.93,.18,'amber',future);
 const forecastPath=new T.CatmullRomCurve3([new T.Vector3(.76,2.43,.29),new T.Vector3(1.1,2.56,.29),new T.Vector3(1.50,2.34,.29),new T.Vector3(1.94,2.15,.29)]);
 for(let i=0;i<14;i++){const points=[forecastPath.getPoint(i/14),forecastPath.getPoint((i+.55)/14)].map(v=>v.toArray());line(points,.014,'amber',future);}
 label('RISK WINDOW',1.0,.16,1.43,2.83,.21,screen,'#ffd195');batch(future);live.push(future);
 // A luminous scanner and tracer reveal the relationship instead of animating unrelated props.
 const scan=group(0,0,0,screen);scan.name='weather-history-scan';box(.012,1.59,.014,0,1.93,.31,'signal',scan);live.push(scan);
 const tracer=group(0,0,0,screen);tracer.name='weather-pattern-tracer';ell(0,0,0,.054,.054,.035,'signal',tracer);live.push(tracer);
 rounded(3.90,.40,.02,0,.57,.17,'ink',screen,.08);
 label('ILLUSTRATIVE ANALYSIS',3.40,.17,0,.57,.20,screen,'#b5c9cc');
 // Physical annual-rainfall bars sit on a low instrument desk in the foreground.
 const desk=group(2.12,.30,1.12);
 rounded(4.66,.23,1.92,0,.10,0,'slate',desk,.08);
 label('01  /  ANNUAL RAINFALL',3.72,.13,0,.03,1.0,desk,'#d6e9e3');
 const columns=[];
 RAINFALL_HISTORY.forEach((v,i)=>{
  const g=group(-1.98+i*.26,.235,-.17,desk);rounded(.15,v*.92,.19,0,v*.46,0,i===4||i===8||i===11?'amber':'mint',g,.035);live.push(g);columns.push(g);
  for(let k=0;k<4;k++)box(.14,.007,.008,-1.98+i*.26,.28+k*.15,-.061,'slate',desk);
 });
 // Five clustered samples echo the actual project's cluster analysis without inventing percentages.
 for(let i=0;i<5;i++){
  const x=-1.8+i*.57;disk(.105,.025,x,.26,.57,i<3?'teal':'amber',desk);
  for(let j=0;j<=i;j++){ell(x+Math.cos(j*2.4)*.045,.30+j*.024,.57+Math.sin(j*2.4)*.045,.022,.022,.022,'signal',desk);}
 }
 label('PATTERN CLUSTERS',2.8,.14,-.52,.28,.82,desk,'#a5c9c8');
 // Potential local exposure is a surface highlight, not a simulated flood depth.
 const exposure=group(-2.38,.565,.25);exposure.name='weather-local-exposure';
 box(4.45,.006,.35,0,0,-.01,'exposure',exposure);
 for(const z of [-.185,.165])line([[-2.22,.006,z],[0,.006,z],[2.22,.006,z]],.008,'amber',exposure);
 batch(exposure);live.push(exposure);
 // A compact pearl-like signal travels from the precinct to the analysis desk.
 const dataRoute=new T.CatmullRomCurve3([new T.Vector3(-1.1,.31,1.55),new T.Vector3(-.48,.40,1.65),new T.Vector3(-.22,.46,1.15),new T.Vector3(.2,.54,.65)]);
 line(dataRoute.getPoints(24).map(v=>v.toArray()),.012,'brass');
 const packet=group();packet.name='weather-data-signal';ell(0,0,0,.055,.055,.055,'signal',packet);packet.position.copy(dataRoute.getPoint(0));live.push(packet);
 label('SINGAPORE  /  LOCAL CONTEXT',3.75,.18,-2.35,.31,2.12,root,'#314f58');
 const nameplate=group(-2.37,.13,2.64);rounded(3.35,.21,.03,0,0,0,'slate',nameplate,.04);label('FROM RAINFALL TO FORESIGHT',3.1,.10,0,0,.024,nameplate);
 root.updateMatrixWorld(true);for(const o of live)root.attach(o);
 const screenPosition=screen.getWorldPosition(new T.Vector3());
 const beforeBounds=new T.Box3().setFromObject(root),centre=beforeBounds.getCenter(new T.Vector3());
 const sceneOffset=new T.Vector3(-centre.x,-beforeBounds.min.y,-centre.z);
 screenPosition.add(sceneOffset);
 // Fit occupied parts of the asymmetric exhibit, rather than its empty upper corners.
 const framingPoints=[];
 for(const child of root.children){const b=new T.Box3().setFromObject(child);if(b.isEmpty())continue;
  for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z).add(sceneOffset));
 }

 const model=finish(15,live);
 const waterY=water.position.y,cloudRest=cloud.position.clone(),collectedY=collected.position.y,collectedScale=collected.scale.y;
 const screenOrigin=screenPosition,forecastScale=future.scale.clone();
 const historyCurve=new T.CatmullRomCurve3(curvePoints.map(v=>new T.Vector3(...v)));
 const dummy=new T.Object3D();let selected=null;
 model.userData={...model.userData,displayBase:false,groundLevel:0,studioProfile:'weatherguru',initialYaw:.15,initialElevation:.34,framingPoints,cameraFitSway:.04,framingTargetY:1.65,autoOrbit:false,realTimeAnimation:true,contactFootprint:false,rainBounds:drops,source:'https://github.com/sayyidkhan/unesco-weatherguru'};
 model.traverse(o=>{if(o.isMesh&&(o.material.transparent||o.material.isMeshBasicMaterial))o.userData.noShadow=true;});
 model.userData.setStep=(index,time=0)=>{if(index!==null&&(!Number.isInteger(index)||index<0||index>3))return;selected=index;model.userData.animate(time);};
 model.userData.animate=time=>{
  const ambient=weatherMoment(time),s=weatherMoment(selected===null?time:[3.5,10.5,17.5,24.5][selected]),copy=WEATHER_STEPS[s.index];
  model.userData.story={index:s.index,step:`0${s.index+1} / 04`,title:copy[1],detail:copy[2],tone:'teal'};
  water.position.y=waterY+s.level*.19*precinctScale;collected.position.y=collectedY+s.level*.05*precinctScale;collected.scale.y=collectedScale*(1+s.level);
  cloud.position.copy(cloudRest);cloud.position.x+=Math.sin(ambient.t*Math.PI/14)*.025;
  m.rain.opacity=.12+s.rain*.45;ripple.offset.set(ambient.t/28,0);
  drops.forEach((d,i)=>{const travel=(ambient.t*d.speed/1.4+d.phase)%1;dummy.position.set(d.x,3.99-travel*(3.99-d.bottom),d.z);dummy.scale.set(1,.55+s.rain*.65,1);dummy.rotation.set(0,0,-.035);dummy.updateMatrix();rain.setMatrixAt(i,dummy.matrix);});rain.instanceMatrix.needsUpdate=true;
  foamSeeds.forEach((d,i)=>{dummy.position.set(-4.22+((d.x+ambient.t/28)%1)*8.44,.297+s.level*.19,d.z);dummy.rotation.set(0,0,0);dummy.scale.set(d.s,.002,d.s*.17);dummy.updateMatrix();foam.setMatrixAt(i,dummy.matrix);});foam.instanceMatrix.needsUpdate=true;
  runoff.forEach(g=>{g.visible=s.level>.05;g.scale.x=.45+s.rain*.55;});
  const outlook=smooth((s.t-12)/4),scanProgress=(ambient.t%7)/7;
  bars.forEach((g,i)=>{g.scale.y=.12+.88*smooth((s.t-i*.20)/3);});
  columns.forEach((g,i)=>{g.scale.y=.25+.75*smooth((s.t-i*.15)/3);});
  exposure.visible=s.index===3;m.exposure.opacity=.12+.04*Math.sin(ambient.t*Math.PI/3.5);
  future.visible=s.index>=2;future.scale.copy(forecastScale);m.riskGlass.opacity=.07+.09*outlook;
  scan.position.x=screenOrigin.x-1.88+scanProgress*2.475;scan.visible=s.index===1;
  const point=historyCurve.getPoint(scanProgress);tracer.position.copy(screenOrigin).add(point);tracer.visible=s.index===1;
  packet.position.copy(dataRoute.getPoint((ambient.t%7)/7)).add(sceneOffset);packet.visible=s.index===1||s.index===3;

 };
 model.userData.animate(0);return model;
}
