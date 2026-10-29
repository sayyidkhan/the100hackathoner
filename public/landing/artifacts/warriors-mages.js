import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {warriorsMoment,WARRIORS_CYCLE} from './warriors-timing.js';
import {warriorsScreen} from './warriors-screen.js';

export function createArtifact(T){
 const {root,materials:m,mesh,box,disk,ball,line,finish,texture,batch}=medivoiceStudio(T),live=[];
 for(const [key,color] of Object.entries({stone:0xe5dcc8,cream:0xe9dec5,navy:0x142b48,blue:0x24558a,ink:0x0b1b2b,gold:0xcda859,bronze:0xa67c3e,silver:0xaeb9c4,mint:0x81dbcd,cloth:0x173963,rubber:0x202b36,white:0xf1e9d7,broth:0xb27b32,noodle:0xe9c985,green:0x436546,orange:0xce8131,glass:0x48677c}))m[key]=new T.MeshStandardMaterial({color,roughness:['gold','bronze','silver'].includes(key)?.3:key==='white'?.32:.72,metalness:['gold','bronze','silver'].includes(key)?.66:0});
 const stone=planningExhibitSurfaces(T).stone,cloth=texture('cloth');m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.024;m.cream.map=stone;m.cream.bumpMap=stone;m.cream.bumpScale=.012;m.cloth.map=cloth;m.cloth.bumpMap=cloth;m.cloth.bumpScale=.018;
 m.navy.bumpMap=cloth;m.navy.bumpScale=.025;m.navy.roughness=.43;m.mint.color.setHex(0xffd27c);m.mint.emissive.setHex(0xffb94f);m.mint.emissiveIntensity=1.3;
 m.rubber.bumpMap=cloth;m.rubber.bumpScale=.012;m.rubber.roughness=.82;m.glass.metalness=.65;m.glass.roughness=.19;m.gold.roughness=.24;m.gold.metalness=.85;
 m.bulb=new T.MeshPhysicalMaterial({color:0xffe8bd,roughness:.045,metalness:0,transmission:.65,transparent:true,opacity:.65,thickness:.015,ior:1.45,envMapIntensity:2.6,clearcoat:1,clearcoatRoughness:.04,side:T.FrontSide});
 m.bulb.emissive.setHex(0xffc575);
 m.filament=new T.MeshStandardMaterial({color:0xffdb9a,emissive:0xffba51,emissiveIntensity:.3});
 function bead(r,x,y,z,key,p=root){const o=mesh(new T.SphereGeometry(r,10,6),key,p);o.position.set(x,y,z);return o;}
 function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.06){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:14}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,key,p=root,r=.12){const o=round(w,d,h,x,y,z,key,p,r);o.rotation.x=-Math.PI/2;return o;}
 function text(txt,w,h,x,y,z,p=root,color='#f2e6c5',font='Arial'){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const cx=c.getContext('2d');cx.fillStyle=color;cx.font=`500 ${c.height*.7}px ${font}`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(txt,512,c.height/2,1000);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 function torus(r,t,x,y,z,key,p=root){const o=mesh(new T.TorusGeometry(r,t,6,40),key,p);o.position.set(x,y,z);return o;}
 function rod(a,b,r,key,p=root){const v=new T.Vector3(...b).sub(new T.Vector3(...a)),o=mesh(new T.CylinderGeometry(r,r,v.length(),7),key,p);o.position.copy(new T.Vector3(...a).addScaledVector(v,.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
 function arc(r,t,x,y,z,key,p=root,start=0,length=Math.PI*2){const o=mesh(new T.TorusGeometry(r,t,8,80,length),key,p);o.position.set(x,y,z);o.rotation.z=start;return o;}
 function coin(x,y,z,p=root,r=.13){disk(r,.042,x,y,z,'gold',p);disk(r*.86,.004,x,y+.023,z,'bronze',p);const ring=torus(r*.76,.008,x,y+.026,z,'gold',p);ring.rotation.x=-Math.PI/2;for(let i=0;i<18;i++){const a=i/18*Math.PI*2;box(.007,.025,.009,x+Math.cos(a)*r,y,z+Math.sin(a)*r,'bronze',p);}}
 function star(x,y,z,size,p=root){for(let j=0;j<4;j++){const a=j*Math.PI/2;line([[x+Math.cos(a)*size,y+Math.sin(a)*size,z],[x,y,z+.035],[x+Math.cos(a+.6)*size*.26,y+Math.sin(a+.6)*size*.26,z]],.012,'gold',p);}}
 // A single open quest book replaces the disconnected museum trays.
 m.paper=new T.MeshStandardMaterial({color:0xefe4c9,roughness:.95});
 m.pageSides=m.paper.clone();if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#f1e3c5';ctx.fillRect(0,0,512,256);for(let i=0;i<10;i++){ctx.fillStyle=i%3===0?'#ac8d63':'#c2a87e';ctx.fillRect(0,i*25+3,512,5);}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;m.pageSides.map=t;}
 m.gilt=m.gold.clone();m.gilt.roughness=.44;m.pageEdge=new T.MeshStandardMaterial({color:0xbca37a,roughness:1});
 function mapTexture(){if(typeof document==='undefined')return stone;const t=new T.TextureLoader().load('/landing/assets/projects/011-quest-map-v1.png');t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}
 m.map=new T.MeshStandardMaterial({color:0xe9d3ac,map:mapTexture(),roughness:.85,bumpMap:stone,bumpScale:.01});
 // A solid, curved page block. The fore-edge follows every leaf into the gutter.
 const pageY=x=>.52+.37*Math.sin(Math.min(1,Math.abs(x)/5.9)*Math.PI*.86);
 const topY=x=>pageY(x)+.4;
 function surface(rows,cols,point,key){const p=[],uv=[],ix=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){p.push(...point(i/cols,j/rows));uv.push(i/cols,j/rows);}for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;ix.push(a,b,a+1,a+1,b,b+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();const o=mesh(geo,key);o.material.side=T.DoubleSide;return o;}
 // Leather boards bend down into the bound spine, rather than lying on a rectangular plinth.
 for(const side of [-1,1]){
  surface(18,64,(u,v)=>{const x=side*(.04+u*6.15);return [x,.13+.13*Math.sin(u*Math.PI),-4.15+v*8.3];},'navy');
  for(const z of [-4.15,4.15]){const pts=[];for(let j=0;j<=64;j++){const u=j/64,x=side*(.04+u*6.15);pts.push([x,.13+.13*Math.sin(u*Math.PI),z]);}line(pts,.10,'navy');line(pts.map(p=>[p[0],p[1]+.05,p[2]]),.018,'gold');}
  // Rounded outer spine/board edge and stitched gold leather piping.
  line([[side*6.17,.13,-4.1],[side*6.2,.12,0],[side*6.17,.13,4.1]],.10,'navy');
  surface(18,64,(u,v)=>{const x=side*(.06+u*5.92);return [x,topY(x),-3.98+v*7.96];},'map');
  for(const z of [-3.98,3.98]){
   surface(1,64,(u,v)=>{const x=side*(.06+u*5.92);return [x,.29+(topY(x)-.29)*v,z];},'pageSides');
   // Narrow, irregular page seams catch the raking key light at the edge.
  }
  surface(24,1,(u,v)=>[side*5.98,.29+(topY(5.98)-.29)*u,-3.98+v*7.96],'paper');
 }
 line([[0,.27,-4.12],[0,.22,0],[0,.27,4.12]],.15,'navy');
 // Engraved corner protectors, studs and scrolling brass filigree.
 for(const xx of [-5.83,5.83])for(const zz of [-3.78,3.78]){const g=group(xx,.30,zz);slab(.61,.61,.045,0,0,0,'gold',g,.12);slab(.48,.48,.012,0,.047,0,'bronze',g,.10);for(let i=0;i<3;i++){const r=torus(.065+i*.05,.009,0,.065,0,'gold',g);r.rotation.x=-Math.PI/2;}for(const x of [-.23,.23])for(const z of [-.23,.23])bead(.025,x,.065,z,'gold',g);}
 // Bookmark is one continuous satin ribbon, including the overhanging curved end.
 m.ribbon=m.cloth.clone();if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=256;c.height=1024;const ctx=c.getContext('2d');ctx.fillStyle='#163455';ctx.fillRect(0,0,256,1024);ctx.strokeStyle='#c9a25b';ctx.lineWidth=3;ctx.strokeRect(14,0,228,1024);ctx.fillStyle='#e6bf73';ctx.textAlign='center';ctx.font='26px Georgia';ctx.fillText('Warriors',128,750);ctx.fillText('& Mages',128,788);ctx.font='54px Georgia';ctx.fillText('✧',128,870);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;map.flipY=false;m.ribbon.map=map;}
 const ribbonCurve=new T.CatmullRomCurve3([[-2.55,topY(-2.55)+.02,2.8],[-2.55,topY(-2.55)+.025,3.8],[-2.55,.75,4.12],[-2.55,.20,4.35],[-2.55,-.12,4.74]].map(p=>new T.Vector3(...p)));
 surface(64,8,(u,v)=>{const p=ribbonCurve.getPoint(v);return [p.x+(u-.5)*.8,p.y+.012*Math.cos(u*Math.PI*2),p.z];},'ribbon');
 for(const side of [-1,1]){const pts=ribbonCurve.getPoints(64).map(p=>[p.x+side*.35,p.y+.015,p.z]);line(pts,.009,'gold');}
 for(let i=0;i<13;i++){const x=-2.55+(i-6)*.054;line([[x,-.12,4.72],[x+.015,-.23,4.86],[x-.015,-.28,5.02]],.012,'gold');}
 const contentStart=root.children.length;
 // Hero app is central, large, cream-faced and easy to read against the navy scene.
 const phone=group(0,3.65,-.83);phone.rotation.x=-.07;live.push(phone);
 round(2.80,5.66,.16,0,0,0,'gold',phone,.25);round(2.70,5.56,.16,0,0,.05,'ink',phone,.24);
 const ui=warriorsScreen(T),screen=new T.Mesh(new T.PlaneGeometry(2.47,5.20),ui.material);screen.position.z=.226;screen.name='warriors-screen';phone.add(screen);
 round(.78,.15,.03,0,2.52,.24,'ink',phone,.06);bead(.026,.24,2.52,.28,'glass',phone);box(.026,.32,.075,-1.42,.8,.07,'gold',phone);
 // The budget compass fills with the same allocations shown on the app.
 disk(2.12,.12,0,.78,-.15,'gold');disk(2.04,.055,0,.865,-.15,'navy');
 for(const r of [1.18,2.04]){const edge=torus(r,.025,0,.91,-.15,'gold');edge.rotation.x=-Math.PI/2;}
 for(let i=0;i<72;i++){const a=i/72*Math.PI*2,g=box(.012,.008,i%6===0?.13:.065,Math.cos(a)*1.96,.907,-.15+Math.sin(a)*1.96,'gold');g.rotation.y=-a+Math.PI/2;}
 const palette=[0xd87b54,0x7368ad,0xd6b65a,0x4e91bc,0x5eaa8a],shares=[.3,.4,.1,.1,.1],wheel=[];let angle=-Math.PI/2;
 for(let i=0;i<5;i++){m['budget'+i]=new T.MeshStandardMaterial({color:palette[i],roughness:.36,metalness:.2,emissive:palette[i],emissiveIntensity:.12});const g=group(0,.917,-.15),span=shares[i]*Math.PI*2-.025,geo=new T.RingGeometry(1.23,1.86,80,1,angle+.012,span),o=mesh(geo,'budget'+i,g);o.rotation.x=-Math.PI/2;o.name=`budget-wheel-${i}`;live.push(g);wheel.push(o);angle+=shares[i]*Math.PI*2;}
 // Four round chapter islands surround the phone. Their labels face the reader.
 const destinations=[[-4,1.9],[-4,-1.85],[4,-1.85],[4,1.9],[0,2.85]],lights=[],fills=[],moving=[],curves=[];
 const labels=['FOOD','LEISURE','UTILITIES','TRANSPORT','SAVINGS'];
 for(let i=0;i<5;i++){const [x,z]=destinations[i],r=i===4?1.04:1.30,y=pageY(x)+.03;disk(r,.08,x,y,z,'gold');disk(r-.055,.27,x,y+.17,z,'cream');disk(r-.025,.035,x,y+.323,z,'gold');disk(r-.075,.025,x,y+.35,z,'paper');
 const label=group(x,y+.17,z+r+.005);text(labels[i],i===4?1.32:1.75,.20,0,0,.018,label,'#273a50','Georgia');
 const halo=group(x,y+.38,z);const ring=torus(r-.03,.022,0,0,0,'mint',halo);ring.rotation.x=-Math.PI/2;halo.name=`category-light-${i}`;live.push(halo);lights.push(halo);}
 // Small persona tokens live on the book, instead of competing with the app.
 const medallions=[];
 for(let i=0;i<2;i++){const g=group(-.57+i*1.14,.66,3.76);g.rotation.x=-Math.PI/2;const face=disk(.36,.045,0,0,0,'gold',g);face.rotation.x=Math.PI/2;const inner=disk(.31,.05,0,0,.025,'navy',g);inner.rotation.x=Math.PI/2;
 if(i){const s=new T.Shape();s.moveTo(-.20,-.1);s.quadraticCurveTo(.16,-.21,.23,-.1);s.lineTo(.1,-.03);s.quadraticCurveTo(-.03,.15,.11,.22);s.quadraticCurveTo(-.16,.28,-.13,-.02);s.closePath();const hat=mesh(new T.ExtrudeGeometry(s,{depth:.025,bevelEnabled:false}),'gold',g);hat.position.z=.07;}
 else {const h=ball(.18,0,.04,.07,'gold',g);h.scale.set(.8,1,.25);round(.19,.04,.018,0,.06,.12,'navy',g,.005);for(let j=0;j<3;j++)box(.012,.10,.012,-.05+j*.05,-.04,.12,'navy',g);}
 const selection=group(-.57+i*1.14,.72,3.76);const r=torus(.37,.018,0,0,0,'mint',selection);r.rotation.x=-Math.PI/2;selection.name=i?'mage-selection':'warrior-selection';live.push(selection);medallions.push(selection);}
 // Detailed everyday objects retained, enlarged and repositioned to match the artwork.
 // Ceramic bowl: lathed inner and outer wall, noodle strands, garnish and chopsticks.
 // Cobalt porcelain decoration is part of the ceramic glaze, not floating blue dots.
 m.porcelain=m.white.clone();m.porcelain.roughness=.24;m.porcelain.metalness=.08;
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=1024;c.height=512;const cx=c.getContext('2d');cx.fillStyle='#ede8d9';cx.fillRect(0,0,1024,512);cx.strokeStyle='#234b79';cx.lineWidth=5;
  for(const y of [20,33,90,104,360,377,471,485]){cx.beginPath();cx.moveTo(0,y);cx.lineTo(1024,y);cx.stroke();}
  for(let i=0;i<12;i++){const x=i*86+43;cx.save();cx.translate(x,235);cx.beginPath();cx.arc(0,0,13,0,Math.PI*2);cx.fillStyle='#315a83';cx.fill();for(let j=0;j<8;j++){cx.rotate(Math.PI/4);cx.beginPath();cx.ellipse(0,31,9,22,0,0,Math.PI*2);cx.stroke();}cx.restore();cx.beginPath();cx.moveTo(x-35,340);cx.bezierCurveTo(x+45,310,x-45,150,x+35,130);cx.stroke();for(let j=0;j<5;j++){cx.beginPath();cx.ellipse(x+(j%2?15:-15),150+j*39,13,5,j%2?.5:-.5,0,Math.PI*2);cx.fill();}}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;m.porcelain.map=t;
 }
 const food=group(-4,1.14,1.9);food.scale.setScalar(1.65);const profile=[[0,0],[.24,0],[.29,.04],[.42,.13],[.56,.34],[.62,.55],[.59,.57],[.55,.36],[.40,.17],[.24,.09],[0,.09]].map(p=>new T.Vector2(...p));mesh(new T.LatheGeometry(profile,64),'porcelain',food);disk(.546,.025,0,.42,0,'broth',food);
 for(let j=0;j<14;j++){const pts=[];for(let k=0;k<22;k++){const a=k/21*Math.PI*2,r=.12+j*.025+.014*Math.sin(a*5+j);pts.push([Math.cos(a)*r,.46+.018*Math.sin(a*4+j),Math.sin(a)*r]);}line(pts,.015,'noodle',food);}
 for(let j=0;j<22;j++){const a=j*2.4,r=.08+(j%5)*.078;const leaf=bead(.045,Math.cos(a)*r,.48,Math.sin(a)*r,'green',food);leaf.scale.set(1,.3,.65);}
 for(let j=0;j<18;j++){const a=j*2.39,r=.10+(j%4)*.09;const g=box(.035,.021,.027,Math.cos(a)*r,.50,Math.sin(a)*r,'green',food);g.rotation.y=a;}
 const egg=ball(.17,.23,.49,.12,'white',food);egg.scale.set(1.1,.22,.8);const yolk=bead(.083,.23,.53,.12,'orange',food);yolk.scale.y=.25;
 for(const dz of [-.07,.07])rod([-.79,.64,-.14+dz],[.79,.71,-.06+dz],.023,'bronze',food);
 for(const r of [.60,.575]){const rim=torus(r,.009,0,.56,0,'blue',food);rim.rotation.x=-Math.PI/2;}
 // Leather studio headphones: open oval cushions, articulated yokes and engraved cups.
 const audio=group(-4,1.16,-1.85);audio.scale.setScalar(1.95);audio.rotation.y=-.24;
 function band(radius,width,depth,key,parent){const shape=new T.Shape();shape.absarc(0,.48,radius,0,Math.PI,false);shape.absarc(0,.48,radius-width,Math.PI,0,true);shape.closePath();const o=mesh(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:48}),key,parent);o.position.z=-depth/2;return o;}
 band(.71,.075,.21,'navy',audio);band(.625,.035,.16,'rubber',audio);
 for(const z of [-.105,.105])arc(.683,.009,0,.48,z,'gold',audio,0,Math.PI);
 for(let j=0;j<30;j++){const a=j/29*Math.PI;rod([Math.cos(a)*.66,.48+Math.sin(a)*.66,-.112],[Math.cos(a)*.676,.48+Math.sin(a)*.676,-.112],.003,'cream',audio);}
 for(const side of [-1,1]){
  const ear=group(side*.58,.26,0,audio);ear.rotation.z=side*.14;ear.rotation.y=side*.14;
  // Pads face inward. A dark acoustic cavity is visible through each cushion.
  const pad=torus(.235,.066,0,0,.005,'rubber',ear);pad.rotation.y=Math.PI/2;pad.scale.set(1.32,1.12,1);
  const cavity=disk(.224,.018,side*.025,0,0,'ink',ear);cavity.rotation.z=Math.PI/2;cavity.scale.x=1.25;
  for(const x of [side*.10,side*.15]){const cup=disk(.247,.055,x,0,0,'navy',ear);cup.rotation.z=Math.PI/2;cup.scale.x=1.22;}
  const rim=torus(.24,.014,side*.19,0,0,'gold',ear);rim.rotation.y=Math.PI/2;rim.scale.x=1.22;
  const badge=group(side*.21,0,0,ear);badge.rotation.y=side*Math.PI/2;star(0,0,0,.14,badge);
  for(let j=0;j<24;j++){const a=j/24*Math.PI*2;const pin=bead(.008,side*.195,Math.sin(a)*.263,Math.cos(a)*.213,'bronze',ear);pin.scale.x=.3;}
  line([[side*.66,.57,-.03],[side*.78,.40,-.02],[side*.77,.24,0]],.025,'gold',audio);bead(.042,side*.76,.26,0,'bronze',audio);
 }
 // Edison bulb: transparent glass retained separately so it never casts an opaque shadow.
 const bulb=group(4,1.16,-1.85);bulb.scale.setScalar(2.0);
 disk(.28,.075,0,.035,0,'gold',bulb);disk(.245,.025,0,.086,0,'ink',bulb);disk(.205,.16,0,.18,0,'bronze',bulb);
 for(let i=0;i<6;i++){const r=torus(.205,.014,0,.11+i*.03,0,'gold',bulb);r.rotation.x=-Math.PI/2;}
 disk(.17,.05,0,.30,0,'ink',bulb);disk(.172,.024,0,.329,0,'gold',bulb);
 const bp=new T.CatmullRomCurve3([[.145,.33,0],[.15,.43,0],[.29,.58,0],[.36,.79,0],[.32,1.00,0],[.18,1.13,0],[0,1.17,0]].map(p=>new T.Vector3(...p))).getPoints(64).map(p=>new T.Vector2(p.x,p.y));
 const glassGroup=group(4,1.16,-1.85);glassGroup.scale.copy(bulb.scale);live.push(glassGroup);glassGroup.name='bulb-glass';
 const glassShell=mesh(new T.LatheGeometry(bp,64),'bulb',glassGroup);glassShell.castShadow=false;glassShell.receiveShadow=false;glassShell.userData.noShadow=true;
 rod([0,.33,0],[0,.93,0],.018,'glass',bulb);
 for(const side of [-1,1]){
  rod([side*.07,.34,0],[side*.13,.94,0],.007,'silver',bulb);
  const points=[];for(let j=0;j<=150;j++){const y=.46+j/150*.49,a=j/150*Math.PI*44;points.push(new T.Vector3(side*.10+Math.cos(a)*.015,y,Math.sin(a)*.015));}
  mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),190,.006,5,false),'filament',bulb);
 }
 line([[-.1,.95,0],[0,1.015,0],[.1,.95,0]],.006,'filament',bulb);
 // A detailed miniature city bus, with glazing, seats, doors, lights and wheel hubs.
 const bus=group(4,1.23,1.9);bus.scale.setScalar(1.64);bus.rotation.y=-.34;
 round(1.66,.65,.68,0,.43,-.34,'cream',bus,.12);round(1.70,.10,.70,0,.16,-.35,'navy',bus,.025);
 round(1.60,.10,.67,0,.80,-.335,'white',bus,.08);round(.54,.055,.43,-.12,.87,-.215,'silver',bus,.04);
 for(let i=0;i<9;i++)box(.40,.009,.014,-.12,.935,-.15+i*.035,'ink',bus);
 // Deep dark windows, offset from the body, with separate mullions and reflective edges.
 for(const zz of [-.352,.363]){
  round(1.44,.315,.009,-.03,.565,zz,'ink',bus,.025);
  for(let j=0;j<6;j++){const xx=-.64+j*.235;round(.205,.26,.009,xx,.57,zz+.012,'glass',bus,.014);box(.012,.30,.012,xx-.113,.565,zz+.025,'gold',bus);box(.18,.008,.01,xx,.68,zz+.026,'silver',bus);}
  box(1.48,.025,.018,-.02,.38,zz+.025,'gold',bus);box(1.48,.10,.018,-.02,.28,zz+.022,'blue',bus);
  for(const xx of [-.28,.22])box(.005,.12,.02,xx,.22,zz+.028,'bronze',bus);
 }
 // Double doors interrupt the passenger-side windows at the front.
 for(const x of [.41,.59]){round(.16,.48,.014,x,.42,.39,'ink',bus,.01);round(.13,.31,.014,x,.49,.408,'glass',bus,.01);box(.009,.15,.014,x+.05,.32,.428,'silver',bus);}
 // Front windscreen, destination sign and wipers.
 const front=group(.842,.51,0,bus);front.rotation.y=Math.PI/2;
 round(.56,.32,.014,0,.06,0,'ink',front,.045);round(.51,.245,.014,0,.04,.017,'glass',front,.04);
 box(.014,.27,.012,0,.04,.037,'bronze',front);text('CAMPUS',.37,.045,0,.18,.04,front,'#ffe0a0');
 for(const side of [-1,1]){line([[side*.20,-.075,.04],[side*.11,.03,.045]],.007,'rubber',front);round(.12,.055,.018,side*.205,-.19,.01,'silver',front,.02);round(.09,.035,.018,side*.205,-.19,.032,'filament',front,.014);line([[side*.28,.11,0],[side*.37,.11,0],[side*.37,.0,.01]],.012,'silver',front);round(.06,.10,.02,side*.37,.01,.02,'ink',front,.018);}
 for(let j=0;j<4;j++)box(.22,.008,.018,0,-.15-j*.023,.02,'ink',front);round(.24,.045,.014,0,-.27,.02,'silver',front,.008);
 // Rubber tyres have raised tread, recessed hubs and six individual lug nuts.
 for(const xx of [-.51,.50])for(const zz of [-.365,.375]){
  const tyre=torus(.119,.043,xx,.15,zz,'rubber',bus);const hub=disk(.083,.018,xx,.15,zz+(zz>0?.04:-.04),'silver',bus);hub.rotation.x=Math.PI/2;
  const cap=disk(.032,.024,xx,.15,zz+(zz>0?.052:-.052),'bronze',bus);cap.rotation.x=Math.PI/2;
  for(let j=0;j<6;j++){const a=j/6*Math.PI*2;bead(.008,xx+Math.cos(a)*.054,.15+Math.sin(a)*.054,zz+(zz>0?.054:-.054),'ink',bus);}
  for(let j=0;j<28;j++){const a=j/28*Math.PI*2;const t=box(.012,.008,.065,xx+Math.cos(a)*.159,.15+Math.sin(a)*.159,zz,'ink',bus);t.rotation.z=a-Math.PI/2;}
 }
 const practical=group(4,2.75,-1.85),bulbLight=new T.PointLight(0xffc16a,0,5,2);practical.add(bulbLight);practical.name='utilities-light';live.push(practical);
 let glow=null;if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,219,133,.65)');g.addColorStop(.22,'rgba(255,189,93,.30)');g.addColorStop(.55,'rgba(240,150,64,.08)');g.addColorStop(1,'rgba(240,150,64,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;glow=new T.Sprite(new T.SpriteMaterial({map,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));glow.scale.set(2.3,2.3,1);practical.add(glow);}

 // A grounded, hinged savings chest; its interior becomes visible before coins arrive.
 const chest=group(0,.91,2.85);chest.scale.setScalar(.72);slab(2.35,1.62,.12,0,0,0,'gold',chest);box(2.17,.10,1.46,0,.13,0,'navy',chest);for(const z of [-.69,.69])box(2.17,.67,.12,0,.48,z,'navy',chest);for(const x of [-1.02,1.02])box(.13,.67,1.35,x,.48,0,'navy',chest);
 for(const zz of [-.74,.74]){box(2.25,.06,.04,0,.12,zz,'gold',chest);box(2.25,.06,.04,0,.82,zz,'gold',chest);for(const xx of [-1.05,1.05]){box(.14,.76,.045,xx,.46,zz,'gold',chest);for(const yy of [.20,.71])bead(.028,xx,yy,zz+.03,'bronze',chest);}}
 slab(1.90,1.20,.02,0,.20,0,'ink',chest);for(const xx of [-.59,.59])for(const zz of [-.76,.76]){box(.10,.70,.025,xx,.46,zz,'gold',chest);for(let j=0;j<5;j++)bead(.018,xx,.20+j*.13,zz+.018,'bronze',chest);}round(.28,.24,.04,0,.45,.78,'gold',chest);star(0,.48,.84,.11,chest);
 const lid=group(0,1.53,2.325);lid.scale.setScalar(.72);lid.name='savings-lid';live.push(lid);box(2.18,.13,1.46,0,0,.73,'navy',lid);for(const xx of [-.59,.59]){box(.10,.16,1.46,xx,.025,.73,'gold',lid);for(let j=0;j<8;j++)bead(.018,xx,.115,.12+j*.18,'bronze',lid);}star(0,.0,1.48,.16,lid);box(2.25,.04,.07,0,.08,1.45,'gold',lid);for(const xx of [-1.05,1.05])box(.13,.17,1.49,xx,0,.73,'gold',lid);round(.3,.20,.035,0,-.08,1.48,'gold',lid,.025);
 // Small botanical details soften the manufactured surfaces.
 for(const [x,z] of [[-4.80,1.5],[-4.65,-2.25],[4.70,-2.05],[4.70,2.10],[.82,2.75]])for(let j=0;j<9;j++){const a=j*2.4,tip=[x+Math.cos(a)*.23,1.18+(j%3)*.10,z+Math.sin(a)*.19];rod([x,1.03,z],tip,.009,'bronze');const leaf=ball(.10,...tip,'green');leaf.scale.set(.55,1.5,.20);leaf.rotation.set(.3,a,.6);}
 // Sequential illuminated paths: each route has three coins travelling along an arc.
 const count=[6,8,2,2,2],pathMeshes=[];
 for(let i=0;i<5;i++){const [dx,dz]=destinations[i],ang=Math.atan2(dz+.15,dx),start=new T.Vector3(Math.cos(ang)*1.87,.97,-.15+Math.sin(ang)*1.87),end=new T.Vector3(dx+(i===4?.36:.68),i===4?1.55:1.23,dz+(i===4?.10:.57));
 const mid=start.clone().lerp(end,.55);mid.y=.91;const route=[start,mid,end];line(route.map(v=>v.toArray()),.022,'gold');
 const curve=new T.CatmullRomCurve3([start,start.clone().lerp(end,.35).add(new T.Vector3(0,.90,0)),end.clone().add(new T.Vector3(0,.5,0)),end]);curves.push(curve);
 const g=group();g.name=`route-${i}`;const path=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(route),60,.032,6,false),'mint',g);live.push(g);pathMeshes.push(path);
 const tokens=[];for(let j=0;j<3;j++){const token=group();token.name=`allocation-coin-${i}-${j}`;coin(0,0,0,token,.13);batch(token);live.push(token);tokens.push(token);}moving.push(tokens);
 const stack=group(end.x,end.y-.025,end.z);stack.name=`budget-stack-${i}`;for(let n=0;n<count[i];n++)coin(0,n*.05,0,stack,.14);batch(stack);fills.push(stack);live.push(stack);}
 for(const child of root.children.slice(contentStart))child.position.y+=.4;
 const anchor=group();live.push(anchor);root.updateMatrixWorld(true);const framing=[];for(const c of root.children){const b=new T.Box3().setFromObject(c);if(!b.isEmpty())for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framing.push(new T.Vector3(x,y,z));}
 const model=finish(11,live),offset=anchor.position.clone();model.traverse(o=>{if(o.material===m.pageEdge||o.material===m.paper||o.material===m.pageSides){o.castShadow=false;o.receiveShadow=false;o.userData.noShadow=true;}});model.remove(anchor);const v=new T.Vector3();
 Object.assign(model.userData,{artifactId:11,displayBase:false,contactFootprint:false,studioProfile:'warriors-mages',groundLevel:0,framingPoints:framing.map(p=>p.add(offset)),cameraFitSway:0,initialYaw:.16,initialElevation:.49,autoOrbit:false,realTimeAnimation:true,cycleDuration:WARRIORS_CYCLE,
 animate(time){const s=warriorsMoment(time);model.userData.story=s;ui.update(s);screen.userData.phase=s.phase;
 medallions[0].visible=false;medallions[1].visible=s.selected&&s.fade>.02;lid.rotation.x=-1.20*s.lid*s.fade;
 for(let i=0;i<5;i++){const f=s.fills[i];fills[i].visible=f>0&&s.fade>.02;fills[i].scale.y=Math.max(.001,f*s.fade);lights[i].visible=f>0&&s.fade>.02;
 wheel[i].geometry.setDrawRange(0,Math.floor(f*80)*6);wheel[i].parent.visible=s.fade>.02;pathMeshes[i].geometry.setDrawRange(0,Math.floor(f*60)*36);pathMeshes[i].parent.visible=s.fade>.02;
 for(let j=0;j<3;j++){const p=(s.t-8-i*2.8-j*.35)/1.7,token=moving[i][j];token.visible=p>0&&p<1&&s.fade>.02;curves[i].getPoint(Math.max(0,Math.min(1,p)),v);token.position.copy(v).add(offset);token.position.y+=.4;token.rotation.set(p*Math.PI*1.4,p*3,0);}}
 m.filament.emissiveIntensity=.15+3.5*s.fills[2]*s.fade;m.bulb.emissiveIntensity=.04+.18*s.fills[2]*s.fade;bulbLight.intensity=5.0*s.fills[2]*s.fade;if(glow)glow.material.opacity=.48*s.fills[2]*s.fade;
 }});model.userData.animate(0);return model;
}
export default createArtifact;
