import {medivoiceStudio} from './medivoice-studio.js';

// An illustrative flood-analysis atlas, not a calibrated forecast for a real estate.
export const WEATHER_CYCLE=32;
export const RAINFALL_HISTORY=[.24,.38,.28,.51,.72,.45,.33,.56,.82,.63,.48,.75];
export const WEATHER_STEPS=[
 ['History','Follow the rainfall, watch the water','The moving cursor links each rainfall observation to its illustrative canal response.'],
 ['Patterns','Trace the rain through the city','Rain falls on roofs and roads, then travels through the drainage network.'],
 ['Risk window','Look ahead, before the water rises','The amber band separates the outlook from the observations. It is a conceptual risk window, not a live forecast.'],
 ['Local impact','See which streets the water reaches','At the peak, water overtops the canal and spreads across the road and riverside paths. Illustrative flood extent.'],
];
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export const RAINFALL_OUTLOOK=[.94,.98,.62,.24,.24];
const SERIES=[...RAINFALL_HISTORY,...RAINFALL_OUTLOOK];
function rainfallAt(sample){
 const at=Math.max(0,Math.min(16,sample)),i=Math.floor(at);
 return SERIES[i]+((SERIES[Math.min(16,i+1)]-SERIES[i])*ease(at-i));
}
export function weatherSample(sample){
 const rain=rainfallAt(sample);
 // A deliberately illustrative lagged response, not a hydrological model.
 const retained=.65*rainfallAt(sample-.7)+.35*rainfallAt(sample-1.4);
 const level=clamp((retained-.29)/.59),flood=ease((level-.70)/.30);
 return {rain,level,flood};
}
export const chartX=sample=>sample<=11?-3.92+sample*.43:.81+(sample-11)*.604;
export function weatherMoment(time){
 const t=((time%WEATHER_CYCLE)+WEATHER_CYCLE)%WEATHER_CYCLE,sample=t/2;
 return {t,index:Math.floor(t/8),sample,...weatherSample(sample)};
}
export const canalZ=x=>.57+.34*Math.sin(x*.73);
// Exaggerated extent makes the illustrative flood legible at the exhibit's scale.
export function floodEdge(x,side,amount){
 const spread=side<0?1.22:1.28;
 return canalZ(x)+side*(.44+spread*amount+Math.sin(x*2.1)*.055*amount);
}
export const floodHeight=amount=>.408+.052*amount;

export function createArtifact(T){
 const {root,materials:m,mesh,box,line,texture,batch,finish}=medivoiceStudio(T);
 const colors={foundation:0x172f3e,edge:0x45616c,stone:0xd8ded8,pavement:0xc1c9c2,road:0x374e59,marking:0xf1e8ce,
  facade:0xf0eee1,coral:0xc77d66,sage:0x8cae9f,glass:0x254d5b,frame:0xc8d7d2,roof:0x506971,
  grass:0x799587,leaf:0x466f60,leafLight:0x7a9c73,bark:0x756858,steel:0x4b6770,white:0xf5f0dd,ink:0x173440};
 for(const [key,color] of Object.entries(colors))m[key]=new T.MeshStandardMaterial({color,roughness:key==='glass'?.18:.65,metalness:['glass','steel','edge'].includes(key)?.35:.03});
 const stone=texture('stone');for(const key of ['stone','facade','pavement']){m[key].bumpMap=stone;m[key].bumpScale=.004;}
 m.water=new T.MeshPhysicalMaterial({color:0x096b78,roughness:.26,metalness:.25,clearcoat:1,clearcoatRoughness:.22,envMapIntensity:.35});
 m.mint=new T.MeshStandardMaterial({color:0x92d9d3,emissive:0x4eafa4,emissiveIntensity:.5,roughness:.27,metalness:.2});
 m.amber=new T.MeshStandardMaterial({color:0xf3b362,emissive:0xe8953e,emissiveIntensity:.65,roughness:.35});
 m.windowLight=new T.MeshStandardMaterial({color:0xffe0a6,emissive:0xf3b768,emissiveIntensity:.55,roughness:.4});
 m.signal=new T.MeshBasicMaterial({color:0xc6fff2,toneMapped:false});
 m.rain=new T.MeshBasicMaterial({color:0xbce8ef,transparent:true,opacity:.36,depthWrite:false});
 m.risk=new T.MeshBasicMaterial({color:0xffb866,transparent:true,opacity:.16,depthWrite:false,side:T.DoubleSide});
 m.response=new T.MeshBasicMaterial({color:0x54bdfb,toneMapped:false});
 m.floodWater=new T.MeshStandardMaterial({color:0x087da7,roughness:.30,metalness:.08,emissive:0x043b55,emissiveIntensity:.20,envMapIntensity:.12,transparent:true,opacity:.87,depthWrite:false});
 m.floodFoam=new T.LineBasicMaterial({color:0xc8f9ff,transparent:true,opacity:.85,depthWrite:false});
 m.chartGlass=new T.MeshStandardMaterial({color:0x1d4353,metalness:.15,roughness:.32});
 const live=[],roofBounds=[],leafClusters=[];
 const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
 const cylinder=(r,h,x,y,z,key,p=root,n=20)=>{const o=mesh(new T.CylinderGeometry(r,r,h,n),key,p);o.position.set(x,y,z);return o;};
 const ell=(x,y,z,sx,sy,sz,key,p=root)=>{const o=mesh(new T.SphereGeometry(1,12,8),key,p);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;};
 function slab(w,d,h,x,y,z,key,r=.12,p=root){
  const s=new T.Shape(),a=-w/2,b=-d/2;s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+d-r);s.quadraticCurveTo(a+w,b+d,a+w-r,b+d);s.lineTo(a+r,b+d);s.quadraticCurveTo(a,b+d,a,b+d-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
  const geo=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:6});geo.rotateX(-Math.PI/2);const o=mesh(geo,key,p);o.position.set(x,y,z);return o;
 }
 function label(text,w,h,x,y,z,p=root,color='#e2f1ea'){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=Math.max(64,Math.round(1536*h/w));
  const c=canvas.getContext('2d');c.fillStyle=color;c.font=`600 ${Math.round(canvas.height*.66)}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,768,canvas.height/2,1490);
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;
 }
 // A single architectural site model. The edge reveals strata rather than a decorative pedestal.
 slab(9.0,5.6,.20,0,0,0,'foundation',.25);
 slab(8.96,5.56,.025,0,.20,0,'edge',.24);
 slab(8.85,5.45,.085,0,.225,0,'stone',.23);
 slab(8.65,2.95,.035,0,.31,-1.1,'grass',.15);
 // Sinuous canal, accurately joined banks and an animated water surface.
 function ribbon(width,y,key){
  const p=[],uv=[],idx=[],segments=100;
  for(let i=0;i<=segments;i++){const x=-4.36+i/segments*8.72,z=canalZ(x);p.push(x,y,z-width/2,x,y,z+width/2);uv.push(i/segments,0,i/segments,1);if(i<segments){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(geo,key);
 }
 ribbon(1.18,.346,'pavement');ribbon(.91,.351,'foundation');
 const water=ribbon(.85,.367,'water');water.name='weather-canal-water';live.push(water);
 const inundation=ribbon(1.75,.418,'floodWater');inundation.name='weather-inundation';live.push(inundation);
 const floodFront=group();floodFront.name='weather-flood-front';
 // Broken foam lines reveal the advancing edge, rather than a barely wider canal.
 const frontGeometry=new T.BufferGeometry();frontGeometry.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(100*2*2*3),3));
 const fronts=new T.LineSegments(frontGeometry,m.floodFoam);fronts.frustumCulled=false;floodFront.add(fronts);live.push(floodFront);

 for(const side of [-1,1]){
  const points=Array.from({length:60},(_,i)=>{const x=-4.34+i/59*8.68;return [x,.395,canalZ(x)+side*.47];});line(points,.028,'stone');
  // Upper railings leave the bridge opening clear.
  for(let i=0;i<64;i++){const x=-4.25+i/63*8.5;if(Math.abs(x-1.35)<.47)continue;box(.012,.15,.012,x,.48,canalZ(x)+side*.52,'steel');}
  for(const [a,b] of [[-4.3,.87],[1.83,4.3]])line(Array.from({length:28},(_,i)=>{const x=a+(b-a)*i/27;return[x,.56,canalZ(x)+side*.52];}),.012,'steel');
 }
 // Back street, pavement, crossings and storm drains.
 slab(8.5,.54,.025,0,.36,-.42,'road',.10);
 for(const z of [-.74,-.09])box(8.4,.025,.08,0,.37,z,'pavement');
 for(let x=-4.05;x<4.1;x+=.46)box(.20,.003,.015,x,.375,-.42,'marking');
 for(let i=0;i<7;i++)box(.22,.004,.035,1.35,.379,-.66+i*.07,'white');
 for(const x of [-3.7,-1.6,-.2,2.6,3.8]){
  box(.19,.007,.11,x,.39,-.08,'foundation');for(let j=0;j<6;j++)box(.012,.005,.095,x-.075+j*.03,.397,-.08,'steel');
 }
 // Recognisable HDB proportions: void decks, recessed galleries, vertical lift cores and rooftop tanks.
 function housing(x,z,w,floors,color,number){
  const g=group(x,.36,z),depth=.72,step=.225,height=.26+floors*step;
  for(let j=0;j<6;j++)box(.055,.26,.65,-w/2+.09+j*(w-.18)/5,.13,0,'facade',g);
  box(w,height-.26,depth-.08,0,.26+(height-.26)/2,-.04,color,g);
  box(.24,height+.08,.79,-w*.28,(height+.08)/2,-.015,color==='facade'?'sage':'coral',g);
  for(const side of [-1,1])box(.09,height-.22,.06,side*(w/2-.04),.25+(height-.22)/2,.37,color==='facade'?'sage':color,g);
  for(let f=0;f<floors;f++){
   const y=.26+f*step;box(w+.035,.028,.80,0,y,0,'facade',g);
   box(w-.08,.13,.012,0,y+.105,.331,'glass',g);
   for(let j=0;j<7;j++){
    const xx=-w/2+.105+j*(w-.21)/6;
    box(.10,.12,.014,xx,y+.105,.345,(j+f)%9===0?'windowLight':'glass',g);
    box(.013,.14,.02,xx+.055,y+.105,.36,'frame',g);
    box(.13,.12,.012,xx,y+.105,-.366,(j*3+f)%11===0?'windowLight':'glass',g);
   }
   box(w,.045,.032,0,y+.08,.40,'facade',g);box(w,.018,.035,0,y+.17,.40,'frame',g);
   for(const side of [-1,1]){box(.013,.11,.26,side*(w/2+.005),y+.11,-.05,'glass',g);box(.055,.058,.09,side*(w/2+.027),y+.045,.17,'frame',g);}
  }
  slab(w+.10,.86,.06,0,height,0,'facade',.03,g);
  for(const zz of [-.41,.41])box(w,.09,.025,0,height+.1,zz,'facade',g);
  for(let j=0;j<7;j++){box(.075,.018,.16,-w*.35+j*w*.1,height+.075,-.22,'grass',g);}
  box(.38,.19,.34,w*.20,height+.13,-.05,'stone',g);cylinder(.11,.20,-w*.3,height+.17,-.02,'roof',g);
  for(let j=0;j<5;j++)box(.055,.012,.24,-.12+j*.075,height+.069,.03,'glass',g);
  label(number,.23,.16,-w*.28,height-.22,.41,g,'#214752');
  roofBounds.push({x,z,w:w+.15,d:.9,top:.36+height+.3});
 }
 housing(-3.05,-1.62,1.58,7,'sage','101');housing(-1.20,-1.80,1.60,10,'facade','102');housing(.61,-1.72,1.25,6,'coral','103');
 // Covered walkway connects the flats and the bus stop.
 for(let x=-3.82;x<1.3;x+=.36)box(.024,.31,.024,x,.53,-.96,'facade');
 slab(5.3,.27,.032,-1.35,.70,-.96,'roof',.06);line([[-4,.72,-.96],[1.30,.72,-.96]],.012,'frame');
 // A small group of Singapore shophouses frames the canal without hiding it.
 for(let j=0;j<3;j++){
  const x=-3.15+j*.67,g=group(x,.32,2.06),key=j===1?'sage':'coral';
  box(.62,.71,.56,0,.355,0,key,g);box(.52,.26,.018,0,.17,.29,'glass',g);
  for(const xx of [-.15,.15]){box(.16,.24,.025,xx,.52,.29,'facade',g);box(.115,.19,.029,xx,.52,.31,'glass',g);for(let k=0;k<4;k++)box(.12,.014,.008,xx,.45+k*.045,.329,key,g);}
  for(const xx of [-.285,.285])box(.04,.72,.07,xx,.36,.30,'facade',g);
  box(.66,.07,.64,0,.76,0,'facade',g);box(.64,.05,.21,0,.33,.36,'sage',g);
  for(let k=0;k<7;k++)box(.037,.008,.20,-.28+k*.09,.359,.36,'white',g);
  const roof=box(.65,.035,.39,0,.85,-.05,'coral',g);roof.rotation.x=-.20;
  label(j===0?'KOPI':j===1?'BAKERY':'PROVISIONS',.44,.075,0,.28,.31,g,'#f5ead2');
  roofBounds.push({x,z:2.06,w:.7,d:.8,top:1.3});
 }
 // Bridge: a shallow steel arch, timber deck and delicate vertical hangers.
 const bx=1.35,bz=canalZ(bx);
 box(.77,.075,1.65,bx,.51,bz,'stone');
 for(let k=0;k<18;k++)box(.71,.01,.055,bx,.554,bz-.78+k*.092,'pavement');
 for(const side of [-1,1]){
  const xx=bx+side*.39,points=Array.from({length:32},(_,i)=>{const u=i/31;return[xx,.61+.40*Math.sin(u*Math.PI),bz-.85+1.7*u];});line(points,.022,'white');
  for(let k=1;k<11;k++){const u=k/11,h=.06+.4*Math.sin(u*Math.PI);box(.008,h,.008,xx,.55+h/2,bz-.85+1.7*u,'steel');}
 }
 // Park paving, small terraces, mature rain trees and pedestrian detail.
 slab(3.35,.82,.035,2.25,.32,2.03,'grass',.25);
 slab(1.45,.68,.035,.05,.32,2.12,'grass',.20);
 slab(2.15,.62,.018,2.55,.36,2.14,'pavement',.23);
 // Paving joints and tactile crossing tiles ground the model at human scale.
 for(let x=-4.15;x<4.2;x+=.22){box(.006,.002,.16,x,.387,-.78,'stone');box(.006,.002,.18,x,.339,2.57,'pavement');}
 for(const z of [-.08,1.9])for(let i=0;i<7;i++)box(.026,.005,.055,.99+i*.10,.386,z,'marking');

 slab(2.05,1.5,.035,2.9,.345,-1.62,'pavement',.25);
 for(let j=0;j<3;j++)slab(1.7-j*.25,.38,.04,2.9,.38+j*.035,-1.7+j*.3,'grass',.15);
 let seed=15;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function tree(x,z,s=1){
  const g=group(x,.35,z);cylinder(.025*s,.46*s,0,.23*s,0,'bark',g,8);
  for(let i=0;i<6;i++){const a=i*2.4,r=.13*s;line([[0,.25*s,0],[Math.cos(a)*r,.49*s,Math.sin(a)*r]],.01*s,'bark',g);ell(Math.cos(a)*r,(.51+(i%2)*.08)*s,Math.sin(a)*r,.18*s,.12*s,.18*s,i%3?'leaf':'leafLight',g);
   for(let j=0;j<25;j++){const angle=random()*Math.PI*2,rad=Math.sqrt(random())*.18*s;leafClusters.push({x:x+Math.cos(a)*r+Math.cos(angle)*rad,y:.35+(.51+(i%2)*.08)*s+(random()-.5)*.18*s,z:z+Math.sin(a)*r+Math.sin(angle)*rad,size:(.025+random()*.035)*s});}}
 }
 for(const [x,z,s] of [[-4,-1,.8],[-3.9,2,.8],[-.6,1.9,.8],[.1,2.25,.9],[.8,2.25,.8],[2.2,2.1,1],[3.2,2.15,1.1],[3.9,1.8,.85],[2.3,-2,1.1],[3.3,-2.0,1.15],[3.9,-1.1,.9],[2.4,-1.2,.75]])tree(x,z,s);
 for(const x of [2.3,3.25]){slab(.50,.18,.04,x,.48,1.70,'bark',.03);for(const xx of [-.19,.19])box(.025,.12,.025,x+xx,.41,1.70,'steel');}
 const people=[];
 for(const [x,z] of [[-2.6,-.8],[-.3,-.8],[1.35,.45],[1.35,1.25],[2.5,1.65],[3.4,-1.3],[-2.8,1.6]]){
  cylinder(.018,.09,x,.415,z,'coral',root,8);ell(x,.48,z,.024,.027,.024,'white');for(const dx of [-.012,.012])box(.009,.055,.012,x+dx,.35+.027,z,'ink');people.push({x,z});
 }
 function bus(){
  const g=group(2.35,.38,-.43);slab(.80,.23,.24,0,.045,0,'sage',.035,g);
  for(const zz of [-.12,.12]){box(.68,.115,.008,0,.20,zz,'glass',g);for(let i=0;i<7;i++)box(.009,.12,.01,-.30+i*.10,.20,zz,'frame',g);for(const xx of [-.25,.25]){const wheel=cylinder(.065,.025,xx,.065,zz,'ink',g,16);wheel.rotation.x=Math.PI/2;}}
  box(.01,.11,.19,.405,.20,0,'glass',g);box(.011,.025,.05,.412,.08,.07,'windowLight',g);
 }bus();
 const shelter=group(2.7,.36,-.9);slab(1.12,.32,.045,0,.38,0,'roof',.04,shelter);for(const x of [-.48,.48])box(.02,.38,.02,x,.19,0,'steel',shelter);box(.75,.04,.12,0,.13,0,'sage',shelter);
 // Fine canopy silhouettes use one instanced draw call instead of smooth toy spheres.
 const foliage=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),m.leaf,leafClusters.length),leafDummy=new T.Object3D();
 foliage.name='weather-tropical-foliage';leafClusters.forEach((v,i)=>{leafDummy.position.set(v.x,v.y,v.z);leafDummy.scale.set(v.size*1.4,v.size*.60,v.size);leafDummy.rotation.set(i*.3,i*.8,i*.5);leafDummy.updateMatrix();foliage.setMatrixAt(i,leafDummy.matrix);foliage.setColorAt(i,new T.Color().setHSL(.33+(i%5)*.007,.19,.32+(i%4)*.05));});foliage.computeBoundingBox();root.add(foliage);live.push(foliage);
 // Small street lights; warm emissive lanterns provide scale.

 for(const [x,z] of [[-4,.08],[-2,.1],[.2,.2],[2.5,.15],[4,.1],[-.5,1.6],[3.8,1.6]]){
  cylinder(.009,.46,x,.58,z,'steel',root,8);box(.12,.015,.04,x+.04,.81,z,'steel');box(.08,.008,.035,x+.055,.799,z,'windowLight');
 }
 // One wide, frameless analysis ribbon stands behind the precinct. No tablet or gold furniture.
 const chart=group(0,.48,-2.53);chart.name='weather-rainfall-atlas';
 box(8.45,1.48,.06,0,3.52,0,'chartGlass',chart);
 label('RAINFALL → FLOOD OUTLOOK',4.5,.28,-1.7,4.08,.05,chart);
 label('— RAINFALL',1.25,.17,1.65,4.08,.05,chart,'#edf5ed');label('— CANAL',1.3,.17,3.14,4.08,.05,chart,'#54bdfb');
 const historyBars=[];
 for(let i=0;i<12;i++){
  const x=-3.92+i*.43,g=group(x,2.98,.075,chart),h=RAINFALL_HISTORY[i]*.76;box(.20,h,.055,0,h/2,0,i===8?'white':'mint',g);g.name=`weather-history-${i}`;live.push(g);historyBars.push(g);
 }
 for(const y of [2.98,3.27,3.56,3.85])box(5.10,.005,.005,-1.55,y,.042,'edge',chart);
 label('12 HISTORICAL YEARS',2.4,.13,-2.75,2.87,.055,chart,'#a3c8cc');
 const chartPoint=(sample,key='rain')=>[chartX(sample),3.06+weatherSample(sample)[key]*.76,key==='rain'?.14:.17];
 const historyPath=Array.from({length:111},(_,i)=>chartPoint(i/10));line(historyPath,.012,'white',chart);
 line(Array.from({length:111},(_,i)=>chartPoint(i/10,'level')),.014,'response',chart);
 for(let y=2.95;y<3.88;y+=.13)box(.008,.07,.01,1.25,y,.05,'frame',chart);
 const forecast=group(0,0,0,chart);forecast.name='weather-forecast-window';
 box(2.38,.90,.012,2.65,3.43,.07,'risk',forecast);
 for(const y of [2.98,3.88])box(2.38,.012,.012,2.65,y,.08,'amber',forecast);
 for(let i=0;i<30;i++){
  const start=11+i/6,end=start+.10;
  line([chartPoint(start),chartPoint((start+end)/2),chartPoint(end)],.015,'amber',forecast);
  line([chartPoint(start,'level'),chartPoint((start+end)/2,'level'),chartPoint(end,'level')],.013,'response',forecast);
 }
 label('POTENTIAL RISK WINDOW',2.4,.14,2.65,2.86,.06,forecast,'#ffd294');batch(forecast);live.push(forecast);
 const scan=group(0,0,0,chart);scan.name='weather-history-scan';box(.012,.96,.01,0,3.45,.19,'signal',scan);live.push(scan);
 const rainPoint=group(0,3.1,.21,chart);rainPoint.name='weather-rain-point';ell(0,0,0,.048,.048,.025,'white',rainPoint);live.push(rainPoint);
 const waterPoint=group(0,3.1,.23,chart);waterPoint.name='weather-response-point';ell(0,0,0,.048,.048,.025,'response',waterPoint);live.push(waterPoint);
 // Legible live status shares the cursor's data, including manual selections.
 let readout=null,readoutCanvas=null,readoutContext=null,lastReadout='';
 if(typeof document!=='undefined'){
  readoutCanvas=document.createElement('canvas');readoutCanvas.width=1800;readoutCanvas.height=110;readoutContext=readoutCanvas.getContext('2d');
  const map=new T.CanvasTexture(readoutCanvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  readout=new T.Mesh(new T.PlaneGeometry(7.8,.44),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));readout.position.set(0,4.48,.07);chart.add(readout);live.push(readout);
 }
 // Separate bar materials allow a precise active-observation highlight without changing values.
 for(const g of historyBars){g.children[0].material=g.children[0].material.clone();}

 // A highlight travels from the observations down into the canal's drainage system.
 const routes=[[-3.6,-.08],[-1.6,-.08],[-.2,-.08],[2.6,-.08]].map(([x,z])=>new T.CatmullRomCurve3([new T.Vector3(x,.41,z),new T.Vector3(x+.05,.41,.13),new T.Vector3(x+.12,.41,canalZ(x)-.37)]));
 const particles=routes.map((curve,i)=>{line(curve.getPoints(12).map(v=>v.toArray()),.012,'mint');const g=group();ell(0,0,0,.035,.025,.035,'signal',g);g.name=`weather-runoff-${i}`;g.position.copy(curve.getPoint(0));live.push(g);return g;});
 // A canal-side instrument visually links the risk outlook to observed water.
 const meter=group(3.68,.36,canalZ(3.68)+.43);box(.12,.52,.045,0,.26,0,'white',meter);
 for(let i=0;i<12;i++)box(i%3===0?.08:.045,.009,.008,-.01,.045+i*.039,.028,i>8?'coral':'steel',meter);
 const marker=group(3.68,.40,canalZ(3.68)+.47);box(.16,.025,.02,0,0,0,'amber',marker);marker.name='weather-level-marker';live.push(marker);
 // Exposure is a ground-level, bounded investigation area. It never paints the buildings.
 const exposure=group();exposure.name='weather-local-exposure';
 for(const [x,z] of [[-.45,1.45],[2.78,1.45]]){
  const g=group(x,.365,z,exposure);slab(.93,.48,.005,0,0,0,'risk',.10,g);
  for(const side of [-1,1])line([[-.45,.014,side*.23],[.45,.014,side*.23]],.012,'amber',g);
  const ring=mesh(new T.TorusGeometry(.10,.014,6,24),'amber',g);ring.rotation.x=-Math.PI/2;ring.position.y=.025;
 }
 batch(exposure);live.push(exposure);
 const floodLabels=group();floodLabels.name='weather-flood-labels';
 for(const [x,z,text] of [[-.5,-.38,'ROAD FLOODED'],[2.7,1.95,'PATH FLOODED']]){
  const g=group(x,0,z,floodLabels),labelY=z>1?1.34:1;line([[0,.47,0],[0,labelY-.14,0]],.012,'amber',g);
  const ring=mesh(new T.TorusGeometry(.095,.016,6,24),'amber',g);ring.rotation.x=-Math.PI/2;ring.position.y=.47;
  box(1.48,.25,.035,0,labelY,0,'foundation',g);box(.04,.25,.04,-.72,labelY,.005,'amber',g);label(text,1.33,.18,0,labelY,.026,g,'#ffdc9d');
 }batch(floodLabels);live.push(floodLabels);

 // Water highlights and raindrops are instanced, deterministic and confined to the site.
 const current=new T.InstancedMesh(new T.SphereGeometry(1,6,4),m.signal,60);current.name='weather-current';current.frustumCulled=false;root.add(current);live.push(current);
 const rain=new T.InstancedMesh(new T.CylinderGeometry(.003,.003,.095,4),m.rain,200);rain.name='weather-rain';rain.frustumCulled=false;root.add(rain);live.push(rain);
 const drops=Array.from({length:200},()=>{const x=-4.1+random()*8.2,z=-2.15+random()*4.45;let bottom=.47;for(const b of roofBounds)if(Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2)bottom=Math.max(bottom,b.top+.06);if(Math.abs(z+.96)<.22)bottom=Math.max(bottom,.80);if(Math.abs(x-1.35)<.5&&Math.abs(z-bz)<.95)bottom=Math.max(bottom,1.09);return{x,z,bottom,phase:random()};});
 const streamSeeds=Array.from({length:60},()=>({u:random(),offset:(random()-.5)*.65,size:.025+random()*.055}));
 // Edge typography is engraved into the architectural model, not attached as another prop.
 label('WEATHER GURU',2.6,.19,-2.7,.12,2.805);
 label('READ THE RAIN. ANTICIPATE THE RISK.',4.4,.13,1.75,.12,2.805,root,'#9dbbc5');
 const seedMatrix=new T.Matrix4().makeScale(.001,.001,.001);seedMatrix.setPosition(0,.4,0);
 for(const instanced of [rain,current])for(let i=0;i<instanced.count;i++)instanced.setMatrixAt(i,seedMatrix);
 root.updateMatrixWorld(true);for(const o of live)root.attach(o);
 const bounds=new T.Box3().setFromObject(root),center=bounds.getCenter(new T.Vector3()),offset=new T.Vector3(-center.x,-bounds.min.y,-center.z);
 const chartOrigin=chart.getWorldPosition(new T.Vector3()).add(offset);
 const framingPoints=[];
 for(const child of root.children){if(child===rain||child===current)continue;const b=new T.Box3().setFromObject(child);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z).add(offset));}
 const model=finish(15,live),dummy=new T.Object3D(),waterPositions=water.geometry.attributes.position,waterBase=Array.from(waterPositions.array),floodPositions=inundation.geometry.attributes.position,floodBase=Array.from(floodPositions.array);
 const baseWaterY=water.position.y,markerBaseY=marker.position.y;let selected=null;
 model.userData={...model.userData,displayBase:false,groundLevel:0,studioProfile:'weatherguru',initialYaw:-.19,initialElevation:.38,framingPoints,framingTargetY:1.9,cameraFitSway:.02,autoOrbit:false,realTimeAnimation:true,contactFootprint:false,rainBounds:drops,waterBaseY:baseWaterY,source:'https://github.com/sayyidkhan/unesco-weatherguru'};
 model.traverse(o=>{if(o.isMesh&&(o.material.transparent||o.material.isMeshBasicMaterial))o.userData.noShadow=true;});
 model.userData.setStep=(index,time=0)=>{if(index!==null&&(!Number.isInteger(index)||index<0||index>3))return;selected=index;model.userData.animate(time);};
 model.userData.animate=time=>{
  const ambient=weatherMoment(time),s={...weatherMoment(selected===null?time:[4,16,24,27][selected]),index:selected??ambient.index},copy=WEATHER_STEPS[s.index];
  const rainfallLabel=s.rain>.72?'HEAVY':s.rain>.42?'MODERATE':'LIGHT';
  const levelLabel=s.flood>.55?'STREETS FLOODED':s.flood>.08?'SPILLING OVER':s.level>.55?'HIGH':s.level>.2?(s.level>=weatherSample(s.sample-.04).level?'RISING':'RECEDING'):'LOW';
  const sampleLabel=s.sample<11.5?`YEAR ${String(Math.round(s.sample)+1).padStart(2,'0')}`:'OUTLOOK';
  const status=`${sampleLabel}  ·  RAIN: ${rainfallLabel}  ·  CANAL: ${levelLabel}`;
  model.userData.story={index:s.index,step:`0${s.index+1} / 04`,title:copy[1],detail:`${status}. ${copy[2]} Illustrative time-compressed response.`,tone:s.flood>.08?'amber':'teal'};
  model.userData.hydrology={...s,status};
  historyBars.forEach((g,i)=>{g.scale.y=1;g.children[0].material.color.setHex(Math.abs(s.sample-i)<.5?0xffca75:0x92d9d3);});
  forecast.visible=s.sample>=11;scan.visible=true;scan.position.x=chartOrigin.x+chartX(s.sample);
  rainPoint.position.set(scan.position.x,chartOrigin.y+3.06+s.rain*.76,chartOrigin.z+.21);
  waterPoint.position.set(scan.position.x,chartOrigin.y+3.06+s.level*.76,chartOrigin.z+.23);
  if(readout&&status!==lastReadout){
   lastReadout=status;const c=readoutContext;c.clearRect(0,0,1800,110);c.fillStyle='#102b37';c.fillRect(0,0,1800,110);c.fillStyle=s.flood>.08?'#ffcb82':'#c1e9ef';c.font='600 47px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(status,900,55,1740);readout.material.map.needsUpdate=true;
  }
  exposure.visible=s.flood>.08;m.risk.opacity=.13+.16*s.flood;
  water.position.y=baseWaterY+s.level*.065+s.flood*.028;marker.position.y=markerBaseY+s.level*.39;
  inundation.visible=s.flood>.005;floodFront.visible=s.flood>.015;floodLabels.visible=s.flood>.45;m.floodWater.opacity=.68+.20*s.flood;
  for(let i=0;i<floodPositions.count;i++){
   const x=floodBase[i*3],side=i%2===0?-1:1;
   floodPositions.setZ(i,floodEdge(x,side,s.flood));
   floodPositions.setY(i,floodHeight(s.flood)+.002*Math.sin(x*8+ambient.t*2));
  }floodPositions.needsUpdate=true;inundation.geometry.computeVertexNormals();
  const frontPositions=frontGeometry.attributes.position;let edgeIndex=0;
  for(const side of [-1,1])for(let i=0;i<100;i++)for(const end of [0,.62]){
   const x=-4.35+(i+end)/100*8.7,z=floodEdge(x,side,s.flood);
   frontPositions.setXYZ(edgeIndex++,x,floodHeight(s.flood)+.004,z);
  }frontPositions.needsUpdate=true;

  for(let i=0;i<waterPositions.count;i++){const x=waterBase[i*3],z=waterBase[i*3+2];waterPositions.setY(i,waterBase[i*3+1]+.004*Math.sin(x*9+z*5+ambient.t*2));}waterPositions.needsUpdate=true;water.geometry.computeVertexNormals();
  particles.forEach((g,i)=>{g.position.copy(routes[i].getPoint((ambient.t*.25+i*.23)%1)).add(offset);g.visible=s.rain>.30;g.scale.setScalar(.6+s.rain*.7);});
  drops.forEach((d,i)=>{const u=(ambient.t*.61+d.phase)%1;dummy.position.set(d.x,3.68-u*(3.68-d.bottom),d.z);dummy.scale.set(1,.45+s.rain*.55,1);dummy.rotation.set(0,0,-.06);dummy.updateMatrix();rain.setMatrixAt(i,dummy.matrix);});rain.instanceMatrix.needsUpdate=true;m.rain.opacity=.05+s.rain*.55;rain.count=Math.round(35+165*s.rain);
  streamSeeds.forEach((d,i)=>{const x=-4.25+((d.u+ambient.t/16)%1)*8.5;dummy.position.set(x,.376+s.level*.065+s.flood*.028,canalZ(x)+d.offset);dummy.scale.set(d.size,.0015,.007);dummy.rotation.set(0,-.25*Math.cos(x*.73),0);dummy.updateMatrix();current.setMatrixAt(i,dummy.matrix);});current.instanceMatrix.needsUpdate=true;
 };
 model.userData.animate(0);return model;
}
