import {medivoiceStudio} from './medivoice-studio.js';
import {raceMoment,driverPrice} from './f1-timing.js';
export function createArtifact(T){
 const {root,materials:m,mesh,box,disk,ball,line,finish,batch,texture}=medivoiceStudio(T),live=[];
 for(const [key,color] of Object.entries({carbon:0x18222b,asphalt:0x20272c,metal:0x9ba9af,cream:0xe4e9df,teal:0x17c9ba,red:0xe44b3f,gold:0xe4b75d,black:0x080c10,glass:0x18414c,light:0x70fff0}))m[key]=new T.MeshStandardMaterial({color,roughness:key==='metal'?.27:.48,metalness:['metal','teal','red','gold'].includes(key)?.65:.15});
 m.carbon.map=texture('cloth');m.asphalt.bumpMap=texture('stone');m.asphalt.bumpScale=.055;m.asphalt.bumpMap.repeat.set(18,18);m.asphalt.roughness=.95;m.carbon.roughness=.4;m.carbon.metalness=.4;m.light.emissive.setHex(0x24dfd0);m.light.emissiveIntensity=1.5;
 function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.06){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:Math.min(.012,d*.2),bevelThickness:Math.min(.012,d*.2),bevelSegments:3,curveSegments:14}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,key,p=root,r=.12){const o=round(w,d,h,x,y,z,key,p,r);o.rotation.x=-Math.PI/2;return o;}
 function text(txt,w,h,x,y,z,p=root,color='#f2e6c5',font='Arial'){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const cx=c.getContext('2d');cx.fillStyle=color;cx.font=`500 ${c.height*.7}px ${font}`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(txt,512,c.height/2,1000);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 function torus(r,t,x,y,z,key,p=root){const o=mesh(new T.TorusGeometry(r,t,6,40),key,p);o.position.set(x,y,z);return o;}

 slab(13.4,6.6,.30,0,0,0,'carbon',root,.65);slab(13.38,6.58,.04,0,.16,0,'teal',root,.65);slab(13.4,6.6,.16,0,.20,0,'carbon',root,.65);
 text('F1 DEGENS  /  TRADE THE GRID',6,.30,0,.17,3.33,root,'#c7eeed');
 // A continuous ribbon of asphalt, curbs and brushed guardrails.
 function trackPoint(a,r=1){return new T.Vector3(-3.35+2.75*r*Math.cos(a),.40,2.15*r*Math.sin(a));}
 function band(inner,outer,key,y){const pos=[],uv=[],idx=[];for(let i=0;i<=192;i++){let a=i/192*Math.PI*2;for(const r of [inner,outer]){const p=trackPoint(a,r);pos.push(p.x,y,p.z);uv.push((p.x+6.7)/13.4,(p.z+3.3)/6.6);}if(i<192){let j=i*2;idx.push(j,j+2,j+1,j+1,j+2,j+3);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();mesh(g,key);}
 band(.43,1.06,'asphalt',.405);band(0,.42,'carbon',.401);
 for(let i=0;i<112;i++){const a=i/112*Math.PI*2;for(const r of [.43,1.065]){const p=trackPoint(a,r),o=box(.17,.025,.11,p.x,.43,p.z,i%2?'cream':'red');o.rotation.y=-a;}}
 for(const r of [1.10,1.14]){const pts=Array.from({length:97},(_,i)=>{const p=trackPoint(i/96*Math.PI*2,r);return [p.x,.68,p.z];});line(pts,.018,'metal');}
 for(let i=0;i<48;i++){const p=trackPoint(i/48*Math.PI*2,1.12);box(.025,.42,.025,p.x,.57,p.z,'metal');}
 for(let i=0;i<6;i++)for(let j=0;j<3;j++)box(.10,.012,.12,-3.35+(i-3)*.10,.435,1.5+j*.12,(i+j)%2?'black':'cream');
 // Low rear pit pavilion keeps the entire racing lane visible.
 const pit=group(-3.35,.4,-2.72);
 round(4.55,.60,.43,0,.34,0,'metal',pit,.04);box(4.72,.07,.66,0,.70,.16,'carbon',pit);
 for(let j=0;j<6;j++){const x=-1.9+j*.76;box(.63,.43,.02,x,.32,.45,'black',pit);for(let k=0;k<5;k++)box(.60,.016,.015,x,.17+k*.065,.47,'metal',pit);box(.61,.035,.04,x,.57,.47,'light',pit);}
 text('F1 DEGENS  /  PIT LANE',3.25,.23,0,.87,.35,pit,'#bcfff4');
 for(const x of [-5.65,-1.05]){box(.045,1.15,.045,x,1.0,-2.55,'metal');box(.30,.06,.13,x,1.60,-2.48,'light');}
 const lights=group(-3.35,1.2,-2.6);box(1.6,.23,.11,0,0,0,'black',lights);for(let j=0;j<5;j++)ball(.068,-.53+j*.26,0,.08,'red',lights);live.push(lights);
 // Layered safety barriers, fencing, tire marks and grid bays.
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2,p=trackPoint(a,1.09),o=box(.22,.13,.06,p.x,.49,p.z,i%4<2?'cream':'red');o.rotation.y=Math.atan2(-2.75*Math.sin(a),2.15*Math.cos(a))+Math.PI/2;}
 for(const r of [.76,.82,.90]){const pts=Array.from({length:129},(_,i)=>{const p=trackPoint(i/128*Math.PI*2,r);return [p.x,.409,p.z];});line(pts,.008,'black');}
 for(let i=0;i<8;i++){const a=.32+i*.14,p=trackPoint(a,.91);const o=box(.23,.008,.025,p.x,.43,p.z,'cream');o.rotation.y=-a;}
 const infield=group(-3.35,.42,0);text('TRADE THE GRID',3.25,.37,0,0,.01,infield,'#8aa5af');infield.rotation.x=-Math.PI/2;

 function car(key){const g=group();
 // Lofted aerodynamic shell with a narrow nose and tapered engine cover.
 function shell(stations,key){const pos=[],ix=[],N=16;stations.forEach(([z,w,h,y])=>{for(let j=0;j<=N;j++){const a=j/N*Math.PI*2;pos.push(Math.cos(a)*w,y+Math.sin(a)*h,z);}});for(let i=0;i<stations.length-1;i++)for(let j=0;j<N;j++){const a=i*(N+1)+j,b=a+N+1;ix.push(a,b,a+1,a+1,b,b+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(ix);geo.computeVertexNormals();mesh(geo,key,g);}
 shell([[-.78,.04,.045,.22],[-.50,.15,.11,.24],[-.22,.18,.15,.25],[.12,.15,.095,.22],[.43,.09,.07,.17],[.87,.065,.035,.13]],key);
 for(const x of [-.22,.22]){const pod=ball(.21,x,.17,-.18,key,g);pod.scale.set(.65,.58,1.7);box(.12,.06,.20,x,.22,-.20,'black',g);}
 box(.57,.035,1.20,0,.07,-.03,'carbon',g);
 for(let k=0;k<3;k++){const w=box(.90,.025,.065,0,.11+k*.035,.76+k*.07,key,g);w.rotation.x=-.13;box(.78,.024,.065,0,.44+k*.035,-.68+k*.06,key,g);}
 for(const x of [-.45,.45]){box(.025,.15,.25,x,.16,.84,key,g);box(.022,.20,.23,x*.86,.44,-.63,key,g);}
 for(const x of [-.40,.40])for(const z of [-.48,.49]){const wheel=disk(.20,.19,x,.20,z,'black',g);wheel.rotation.z=Math.PI/2;const rim=disk(.10,.195,x,.20,z,'metal',g);rim.rotation.z=Math.PI/2;
 for(const side of [-1,1]){const ring=torus(.155,.008,x+side*.098,.20,z,'gold',g);ring.rotation.y=Math.PI/2;}
 for(const dz of [-.12,.12])line([[0,.16,z+dz],[x,.20,z]],.014,'carbon',g);}
 const seat=ball(.14,0,.32,-.05,'black',g);seat.scale.set(.8,.45,1.5);ball(.075,0,.37,-.14,'cream',g);const visor=ball(.07,0,.38,-.10,'glass',g);visor.scale.set(1,.4,.6);
 line([[-.13,.34,-.28],[-.15,.47,-.03],[0,.49,.17],[.15,.47,-.03],[.13,.34,-.28]],.018,'carbon',g);box(.027,.18,.025,0,.40,.17,'carbon',g);
 for(const x of [-.22,.22]){box(.09,.035,.045,x,.36,.13,key,g);line([[x*.5,.28,.13],[x,.35,.13]],.01,'metal',g);}
 batch(g);live.push(g);return g;}
 const cars=[car('teal'),car('red'),car('gold')];cars.forEach((g,i)=>g.name=`race-car-${i}`);
 // The terminal uses a readable, phase-synchronised canvas instead of decorative charts.
 const terminal=group(3.48,3.50,.38);terminal.rotation.x=-.025;
 round(5.84,5.73,.17,0,0,0,'metal',terminal,.22);round(5.68,5.57,.08,0,0,.18,'black',terminal,.18);
 let ctx,tex,last=-1;const canvas=typeof document!=='undefined'?document.createElement('canvas'):null;
 if(canvas){canvas.width=1200;canvas.height=1200;ctx=canvas.getContext('2d');tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;}
 const screen=new T.Mesh(new T.PlaneGeometry(5.38,5.28),new T.MeshBasicMaterial({map:tex??null,color:tex?0xffffff:0x103b43,toneMapped:false}));screen.position.z=.275;terminal.add(screen);live.push(terminal);
 slab(5.8,1.40,.15,3.48,.39,.38,'metal');
 for(let i=0;i<3;i++){const g=group(2.20+i*1.25,.94,2.1);const coin=disk(.45,.10,0,0,0,'metal',g);coin.rotation.x=Math.PI/2;const face=disk(.39,.11,0,0,.02,['teal','red','gold'][i],g);face.rotation.x=Math.PI/2;text(['07','16','44'][i],.43,.30,0,0,.09,g,'#f4ffff');disk(.37,.07,0,-.46,0,'black',g);}
 line([[1.6,.49,1.2],[2.1,.57,1.2],[2.4,1.1,.4],[2.55,1.5,-.1]],.027,'light');
 function updateUI(s){if(!ctx)return;const tick=Math.floor(s.t*10);if(tick===last)return;last=tick;const c=ctx;c.fillStyle='#08151c';c.fillRect(0,0,1200,1200);
 const txt=(v,x,y,size=48,color='#eef8f8',weight=500)=>{c.fillStyle=color;c.font=`${weight} ${size}px Arial`;c.fillText(v,x,y);};
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,18);c.fill();};
 txt('F1 DEGENS',52,89,72,'#f1ffff',750);txt('DRIVER MARKET',54,144,37,'#9fc5cb');txt(s.t<8?'PRE-RACE':s.t<27?'LIVE RACE':'FINISHED',890,139,32,'#71e2cf');
 s.drivers.forEach((d,i)=>{const y=176+i*239;rect(45,y,1110,220,d.selected?'#153e43':'#102731');if(d.selected){c.strokeStyle=d.color;c.lineWidth=4;c.stroke();}
 rect(62,y+19,66,54,d.color);txt(d.id,69,y+61,41,'#071d26',750);txt('Driver '+d.id,144,y+60,49,'#fff',650);txt('P'+d.position,1060,y+59,44,d.color,700);
 if(d.selected)txt(s.sold?'BET CLOSED':'YOUR PICK',586,y+55,31,d.color,700);
 txt('$'+d.price.toFixed(2),65,y+143,68,'#fff',650);txt((d.change>=0?'+':'')+d.change.toFixed(1)+'%',69,y+191,38,d.change>=0?'#75e8c9':'#ff9e93');
 // Each driver gets their own chart on the same time and price scales.
 const left=405,right=1110,top=y+82,bottom=y+199;for(let j=0;j<3;j++){c.strokeStyle='#2a414a';c.lineWidth=1.5;c.beginPath();c.moveTo(left,top+j*55);c.lineTo(right,top+j*55);c.stroke();}
 const end=Math.min(s.t,27),pts=[];for(let t=-6;t<end;t+=.25)pts.push([left+(t+6)/33*(right-left),bottom-(driverPrice(i,t)-.70)/.90*(bottom-top)]);pts.push([left+(end+6)/33*(right-left),bottom-(driverPrice(i,end)-.70)/.90*(bottom-top)]);
 c.beginPath();pts.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.lineTo(pts.at(-1)[0],bottom);c.lineTo(left,bottom);c.closePath();c.fillStyle=d.color+'18';c.fill();c.beginPath();pts.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=d.color;c.lineWidth=6;c.stroke();c.beginPath();c.arc(...pts.at(-1),6,0,Math.PI*2);c.fillStyle='#f1fffa';c.fill();
 });
 rect(45,915,1110,95,s.sold?'#1a6553':s.t>=18?'#d26332':'#184c56');txt(['COMPARE · PICK YOUR DRIVER','BET PLACED · DRIVER 07','FOLLOW ALL THREE DRIVERS','SELL BEFORE THE FINISH','SOLD · DRIVER 07'][s.phase],70,980,47,'#fff',650);
 txt('LAP '+Math.min(57,Math.floor(s.progress*57)+1)+' / 57',52,1080,45,'#fff',650);txt(s.t<4?'NO BET YET':s.sold?'HELD  0':'07  /  HELD 100',650,1080,42,'#b1e9df',650);
 txt('Unsold tokens expire at the finish.',52,1135,36,'#e6b78c');txt('Illustrative prices · same chart scales',52,1180,29,'#95afb8');tex.needsUpdate=true;}
 const framingPoints=[];for(const [xs,ys,zs] of [[[-6.72,6.72],[0,.50],[-3.32,3.32]],[[.50,6.45],[.60,6.42],[.10,.95]],[[-5.8,-.9],[.40,1.75],[-2.9,-2.1]],[[-6.6,-.1],[.40,1.05],[-2.6,2.6]]])for(const x of xs)for(const y of ys)for(const z of zs)framingPoints.push(new T.Vector3(x,y,z));
 const anchor=group();live.push(anchor);const model=finish(43,live),offset=anchor.position.clone();model.remove(anchor);framingPoints.forEach(p=>p.add(offset));
 Object.assign(model.userData,{artifactId:43,framingPoints,displayBase:false,contactFootprint:false,studioProfile:'f1-degens',groundLevel:0,initialYaw:.10,initialElevation:.30,framingTargetY:2.65,cameraFitSway:0,autoOrbit:false,realTimeAnimation:true,cycleDuration:32,animate(time){const s=raceMoment(time);model.userData.story={...s,index:s.phase,step:`0${s.phase+1} / 05`,title:["Compare the drivers","Back your chosen driver","Watch the competing drivers","Sell before the finish","Position closed"][s.phase],detail:["Compare all three price charts and grid positions before choosing a driver.","The demo backs Driver 07 with 100 tokens. Drivers 16 and 44 remain visible for comparison.","Driver 07 challenges Driver 16 for the lead. All three charts update with the race.","The race is ending. Unsold tokens expire at the finish.","Driver 07 tokens sold before the finish. All three market charts remain visible."][s.phase],tone:"teal"};updateUI(s);lights.visible=s.t<8;cars.forEach((g,i)=>{const d=s.drivers[i],a=d.travel,p=trackPoint(a,d.lane);g.position.copy(p).add(offset);g.position.y+=.025;g.rotation.y=Math.atan2(-2.75*Math.sin(a),2.15*Math.cos(a));g.scale.setScalar(.86);});}});model.userData.animate(0);return model;
}
export default createArtifact;
