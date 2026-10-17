import { buildAtlasVenue } from './buzo-atlas-venue.js';
import { applyBakedAO } from './buzo-atlas-surface.js';
import { createAtlasMotion } from './buzo-atlas-motion.js';
import { ATLAS_BOOK, ATLAS_WALKWAY_WIDTH, atlasPageHeight, atlasSurfaceHeight, atlasBookMargin, atlasDeckHeight, createAtlasRoutes, createWalkwayClearance } from './buzo-atlas-paths.js';
// The night atlas: a navigable architectural miniature composed to match the
// 075-buzo-atlas-night-v2 artwork. Static geometry is batched by material.
export function createArtifact(THREE, { bake = false } = {}) {
  const root = new THREE.Group();
  const TAU = Math.PI * 2;
  let seed = 7502;
  const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({color, roughness:.82, vertexColors:true, ...extra});
  const mats = {
    stone:material(0xc5b18c), ivory:material(0xe7d8b9), shadow:material(0x887559),
    paper:material(0xe6d5ad), edge:material(0xbf9e61), burgundy:material(0x532024),
    gold:material(0xb99149,{metalness:.74,roughness:.34}), navy:material(0x14283e,{roughness:.54}),
    green:material(0x26372b), leaf:material(0x41503a), bark:material(0x5f5038),
    window:material(0xffd193,{emissive:0xffaa43,emissiveIntensity:.7,roughness:.4}),
    light:material(0xefc06d,{emissive:0xf6a330,emissiveIntensity:1.5,toneMapped:false}),
    water:material(0x0c3447,{metalness:.5,roughness:.22}),
    coral:material(0xbc664d), ink:material(0x101c2b),
    venueGlass:material(0xaf752f,{emissive:0xffa845,emissiveIntensity:.38,roughness:.28,metalness:.12}),
  };
  // Fine mineral grain, independent of textures and generated-image downloads.
  for (const key of ['stone','ivory','paper','shadow']) {
    mats[key].onBeforeCompile = shader => {
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vAtlasStone;').replace('#include <begin_vertex>','#include <begin_vertex>\nvAtlasStone=position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vAtlasStone;').replace('#include <color_fragment>',`#include <color_fragment>
        float grain=fract(sin(dot(floor(vAtlasStone*210.),vec3(127.1,311.7,74.7)))*43758.5453);
        diffuseColor.rgb*=.92+.08*grain;`);
    };
    mats[key].customProgramCacheKey=()=> 'atlas-mineral-v2';
  }
  const windTime={value:0};
  for(const key of ['green','leaf']){
    mats[key].onBeforeCompile=shader=>{
      shader.uniforms.atlasWindTime=windTime;
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float atlasWindTime;').replace('#include <begin_vertex>',`#include <begin_vertex>
        float canopy=smoothstep(.9,2.4,position.y);
        transformed.x+=canopy*.045*sin(atlasWindTime*1.4+position.z*1.8+position.x*.5);
        transformed.z+=canopy*.025*sin(atlasWindTime*1.1+position.x*2.);`);
    };
    mats[key].customProgramCacheKey=()=> 'atlas-foliage-breeze-v1';
  }
  mats.navy.onBeforeCompile=shader=>{
    shader.uniforms.atlasWindTime=windTime;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float atlasWindTime;').replace('#include <begin_vertex>',`#include <begin_vertex>
      float curtain=step(-3.90,position.x)*step(position.x,-2.10)*step(1.88,position.y)*step(position.y,3.57)*step(abs(position.z+2.11),.055);
      transformed.z+=curtain*.065*(1.-smoothstep(3.1,3.57,position.y))*sin(atlasWindTime*1.7+position.x*6.);`);
  };
  mats.navy.customProgramCacheKey=()=> 'atlas-velvet-breeze-v1';
  const batches=new Map(), geometries=new Set();
  let frame=new THREE.Matrix4();
  const routes = createAtlasRoutes(THREE);
  const routeClearance = createWalkwayClearance(routes);
  function walkwayClear(x,z,radius) {
    const world = new THREE.Vector3(x,0,z).applyMatrix4(frame);
    return routeClearance(world.x,world.z,radius*frame.getMaxScaleOnAxis());
  }
  const point=new THREE.Vector3(),normal=new THREE.Vector3(),nmat=new THREE.Matrix3();
  const color=new THREE.Color();
  function put(geometry, key, x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,tint=1) {
    geometries.add(geometry);
    const local=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));
    const matrix=new THREE.Matrix4().multiplyMatrices(frame,local);nmat.getNormalMatrix(matrix);
    let batch=batches.get(key);if(!batch){batch={p:[],n:[],c:[]};batches.set(key,batch);}
    const pos=geometry.attributes.position,nor=geometry.attributes.normal,idx=geometry.index;
    color.setRGB(tint,tint,tint);
    for(let j=0;j<(idx?idx.count:pos.count);j++){
      const i=idx?idx.getX(j):j;point.fromBufferAttribute(pos,i).applyMatrix4(matrix);normal.fromBufferAttribute(nor,i).applyMatrix3(nmat).normalize();
      batch.p.push(point.x,point.y,point.z);batch.n.push(normal.x,normal.y,normal.z);batch.c.push(color.r,color.g,color.b);
    }
  }
  const cube=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,16),sphere=new THREE.SphereGeometry(1,12,8),cone=new THREE.ConeGeometry(1,1,9),rock=new THREE.IcosahedronGeometry(1,0);
  function box(w,h,d,x,y,z,key='ivory',ry=0,tint=1){put(cube,key,x,y,z,w,h,d,0,ry,0,tint);}
  function disk(r,h,x,y,z,key='ivory',rz=1){put(cylinder,key,x,y,z,r,h,r*rz);}
  function ball(r,x,y,z,key='ivory',sx=1,sy=1,sz=1){put(sphere,key,x,y,z,r*sx,r*sy,r*sz);}
  function group(x,y,z,s,ry,fn){const old=frame;frame=old.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry,0)),new THREE.Vector3(s,s,s)));fn();frame=old;}
  function rod(a,b,r=.015,key='gold'){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);
    const old=frame;frame=old.clone().multiply(new THREE.Matrix4().compose(start.add(end).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()),new THREE.Vector3(r,d.length(),r)));
    put(cylinder,key);frame=old;
  }
  function path(points,r=.012,key='gold',segments=40){put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments,r,5,false),key);}
  function torus(r,t,x,y,z,key='gold',flat=true){put(new THREE.TorusGeometry(r,t,5,48),key,x,y,z,1,1,1,flat?Math.PI/2:0);}
  const archCache=new Map();
  function arch(w,h,depth,trim=0){
    const cacheKey=[w,h,depth,trim].join(':');if(archCache.has(cacheKey))return archCache.get(cacheKey);
    const shape=new THREE.Shape(),r=w/2;shape.moveTo(-r,0);shape.lineTo(-r,h-r);shape.absarc(0,h-r,r,Math.PI,0,true);shape.lineTo(r,0);shape.closePath();
    if(trim){const hole=new THREE.Path(),ri=r-trim;hole.moveTo(-ri,0);hole.lineTo(ri,0);hole.lineTo(ri,h-r);hole.absarc(0,h-r,ri,0,Math.PI,false);hole.closePath();shape.holes.push(hole);}
    const geo=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:false,curveSegments:9});archCache.set(cacheKey,geo);return geo;
  }
  const lampPoints=[];
  const cypress=new THREE.LatheGeometry([[.025,0],[.08,.10],[.13,.25],[.14,.39],[.115,.56],[.085,.73],[.044,.88],[.005,1]].map(p=>new THREE.Vector2(...p)),12);
  {const a=cypress.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),n=1+.13*Math.sin(x*17+y*33+z*7)+.07*Math.cos(z*21-y*19);a.setXYZ(i,x*n,y,z*n);}cypress.computeVertexNormals();}
  function lamp(x,y,z,h=.24){
    rod([x,y,z],[x,y+h,z],.009);disk(.034,.018,x,y,z,'gold');ball(.024,x,y+h,z,'light');
    point.set(x,y+h,z).applyMatrix4(frame);lampPoints.push(point.clone());
  }
  function fountainPlantingClear(x,z,radius){
    const world=new THREE.Vector3(x,0,z).applyMatrix4(frame);
    return Math.hypot(world.x+.05,world.z-2.98)>.62+radius*frame.getMaxScaleOnAxis();
  }
  function tree(x,y,z,h=.5){
    if(!walkwayClear(x,z,h*.18+.05))return;
    // Preserve the seeded planting elsewhere when omitting a fountain intruder.
    if(!fountainPlantingClear(x,z,h*.18+.05)){for(let i=0;i<7;i++)rand();return;}
    rod([x,y,z],[x,y+h*.65,z],.012,'bark');
    put(cypress,'green',x,y,z,h,h,h,0,rand()*TAU,0,.80+rand()*.25);
    for(let i=0;i<5;i++){const a=i*2.4;put(rock,i%2?'green':'leaf',x+Math.cos(a)*h*.065,y+h*(.22+i*.12),z+Math.sin(a)*h*.065,h*.075,h*.14,h*.075,0,a,0,.78+rand()*.24);}
  }
  function shrub(x,y,z,r=.1){if(!walkwayClear(x,z,r*1.5))return;if(!fountainPlantingClear(x,z,r*1.5)){for(let i=0;i<20;i++)rand();return;}for(let i=0;i<5;i++)put(rock,i%2?'green':'leaf',x+(rand()-.5)*r,y+r*.6,z+(rand()-.5)*r,r,r*.7,r,0,rand()*TAU,0,.75+rand()*.35);}
  function windowAt(x,y,z,w,h){put(arch(w,h,.015),'window',x,y,z);put(arch(w+.055,h+.04,.028,.027),'ivory',x,y-.01,z+.015);box(.012,h*.62,.018,x,y+h*.33,z+.035,'gold');}
  function dome(x,y,z,r){
    put(new THREE.SphereGeometry(r,24,12,0,TAU,0,Math.PI/2),'navy',x,y,z,1,.78,1);
    for(let j=0;j<10;j++){const a=j/10*TAU;path(Array.from({length:13},(_,i)=>{const t=i/12*Math.PI/2;return[x+Math.cos(a)*r*Math.sin(t),y+r*.79*Math.cos(t),z+Math.sin(a)*r*Math.sin(t)];}),.008);}
    torus(r+.016,.015,x,y,z);rod([x,y+r*.78,z],[x,y+r*1.04,z],.014);ball(.032,x,y+r*1.05,z,'gold');
  }
  function building(x,y,z,s=1,rotation=0,type=0){if(!walkwayClear(x,z,s*.40))return;group(x,y,z,s,rotation,()=>{
    const w=.36+(type%3)*.08,h=.38+(type%4)*.085,d=.30;
    box(w+.05,.045,d+.05,0,.023,0,'shadow');box(w,h,d,0,h/2+.045,0,'stone');
    box(w+.045,.04,d+.045,0,h+.045,0);box(w+.025,.025,d+.025,0,h*.65,0,'ivory');
    for(const xx of [-w*.29,w*.29])windowAt(xx,.12,d/2+.005,.075,.15);
    for(const side of [-1,1])group(side*w/2,0,0,1,side*Math.PI/2,()=>windowAt(0,.13,0,.08,.15));
    for(const xx of [-w*.46,w*.46])box(.023,h,.027,xx,h/2+.045,d/2+.012);
    if(type%3===0){disk(w*.36,.11,0,h+.11,0);dome(0,h+.16,0,w*.36);}
    else {box(w*.88,.10,d*.8,0,h+.11,0,type%2?'navy':'ivory');for(const xx of [-w*.4,w*.4])put(cone,'ivory',xx,h+.22,0,.042,.15,.042);}
  });}
  // Deep, irregular, individually stepped limestone contours. Pools are holes
  // through the upper shelves, so water reads as carved waterways, not paint.
  const pools=[{x:-.8,z:2.35,rx:1.4,rz:.63},{x:2.9,z:-.4,rx:.9,rz:1.22}];
  // A continuous headland supports the palace forecourt; no detached slab.
  function venueHeadland(a){const delta=Math.atan2(Math.sin(a-.99),Math.cos(a-.99));return .48*Math.exp(-Math.pow(delta/.37,2));}
  function islandShape(rx,rz,phase=0,holes=false){const shape=new THREE.Shape();for(let i=0;i<=160;i++){const a=i/160*TAU,r=1+.075*Math.sin(a*5+phase)+.040*Math.sin(a*9)+.020*Math.cos(a*23)+venueHeadland(a);const x=Math.cos(a)*rx*r,z=Math.sin(a)*rz*r;i?shape.lineTo(x,-z):shape.moveTo(x,-z);}shape.closePath();if(holes)for(const pool of pools){const hole=new THREE.Path();hole.absellipse(pool.x,-pool.z,pool.rx,pool.rz,0,TAU,true,0);shape.holes.push(hole);}return shape;}
  for(let i=0;i<27;i++){
    const y=.04+i*.031,rx=4.85+(i<8?i*.012:.10-(i-8)*.013),rz=3.46+(i<8?i*.012:.10-(i-8)*.010);
    const geo=new THREE.ExtrudeGeometry(islandShape(rx,rz,.2+Math.sin(i*.55)*.018,i>7),{depth:.025,bevelEnabled:false,curveSegments:28});
    put(geo,i%4===0?'shadow':i%3===0?'stone':'ivory',0,y,0,1,1,1,-Math.PI/2,0,0,.77+i*.007);
  }
  const waterGeometries=[];
  for(const pool of pools){
    const g=new THREE.CircleGeometry(1,72);g.rotateX(-Math.PI/2);put(g,'water',pool.x,.33,pool.z,pool.rx,1,pool.rz);waterGeometries.push(g);
    for(let i=0;i<30;i++){const a=rand()*TAU,r=Math.sqrt(rand())*.9;box(.025+rand()*.09,.002,.005,pool.x+Math.cos(a)*pool.rx*r,.338,pool.z+Math.sin(a)*pool.rz*r,i%4===0?'gold':'navy',rand()*.3,.65);}
  }
  for(let i=0;i<160;i++){
    const a=i/160*TAU,rx=4.6+.12*rand(),rz=3.25+.12*rand(),x=Math.cos(a)*rx*(1+venueHeadland(a)),z=Math.sin(a)*rz*(1+venueHeadland(a));
    put(rock,i%3?'stone':'shadow',x,.31+rand()*.19,z,.14+rand()*.12,.25+rand()*.24,.14+rand()*.1,rand(),rand(),rand(),.65+rand()*.25);
    if(i%2===0){tree(x*.96,.83,z*.96,.32+rand()*.55);shrub(x*.94,.83,z*.94,.12);}
  }
  function terrace(x,z,r,base,height){for(let i=0;i<9;i++)disk(r-i*.026,height/9,x,base+i*height/9,z,i%3===0?'shadow':'ivory',.84);}
  terrace(-3,-1.55,1.52,.82,.62);terrace(3,-2.05,1.20,.82,.44);terrace(3.06,1.98,1.45,.82,.27);
  // Central atlas: broad bowed pages, deep burgundy covers, gilded fore-edges.
  const bookY=1.0,bx=ATLAS_BOOK.x,bz=ATLAS_BOOK.z;
  const pageHeight = atlasPageHeight;
  group(bx,0,bz,ATLAS_BOOK.scale,ATLAS_BOOK.yaw,()=>{
    for(const side of [-1,1]){
      box(2.12,.10,3.0,side*1.065,bookY-.035,0,'burgundy');box(2.06,.045,2.94,side*1.045,bookY+.027,0,'gold');
      const pos=[],idx=[];for(let j=0;j<=22;j++)for(let i=0;i<=44;i++){const x=side*(.02+i/44*2.04),z=-1.44+j/22*2.88;pos.push(x,pageHeight(x),z);}
      for(let j=0;j<22;j++)for(let i=0;i<44;i++){const a=j*45+i;side>0?idx.push(a,a+45,a+1,a+1,a+45,a+46):idx.push(a,a+1,a+45,a+1,a+46,a+45);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();put(geo,'paper');
      for(const z of [-1.44,1.44]){
        const p=[],indices=[];for(let i=0;i<=44;i++){const x=side*(.02+i/44*2.04);p.push(x,bookY+.055,z,x,pageHeight(x),z);if(i<44){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();mats.edge.side=THREE.DoubleSide;put(g,'edge');
        for(let k=1;k<14;k++)path(Array.from({length:25},(_,i)=>{const x=side*(.02+i/24*2.04);return[x,bookY+.055+(pageHeight(x)-bookY-.055)*k/14,z+(z>0?.003:-.003)];}),.0035,'paper',24);
      }
      box(.03,.29,2.88,side*2.06,bookY+.20,0,'edge');
      // Cartographic contour lines etched onto the actual curved page surface.
      for(let j=0;j<11;j++){
        const points=[];for(let i=0;i<=42;i++){const x=side*(.08+i/42*1.91),z=-1.31+j*.24+Math.sin(i*.23+j*.7)*.065+Math.sin(i*.64+j)*.025;points.push([x,pageHeight(x)+.006,z]);}path(points,.003,'shadow',42);
      }
      // Small streets weave between planted districts, leaving the book legible.
      for(let row=0;row<6;row++)for(let col=0;col<6;col++){
        const i=row*6+col,x=side*(.34+col*.29+(rand()-.5)*.045),z=-1.16+row*.44+(rand()-.5)*.055;
        if(Math.hypot(x-side*1.03,z+.72)<.37)continue;
        building(x,pageHeight(x)+.015,z,.43+rand()*.14,rand()*.18-.09,i);
        if(i%3===0)tree(x+.12,pageHeight(x)+.02,z+.15,.22+rand()*.13);
      }
      for(let k=0;k<6;k++){
        const cx=side*(.35+rand()*1.3),cz=-1+rand()*1.9;
        for(let ring=0;ring<3;ring++)path(Array.from({length:25},(_,i)=>{const a=i/24*TAU,r=.12+ring*.045,x=cx+Math.cos(a)*r*(1+.16*Math.sin(a*3)),z=cz+Math.sin(a)*r*.7;return[x,pageHeight(x)+.015,z];}),.004,'edge',24);
      }
      // A taller cathedral in each district gives the pop-up cities a skyline.
      building(side*1.03,pageHeight(1.03),-.72,.9,0,3);
      for(const dx of [-.16,.16]){
        box(.075,.58,.075,side*1.03+dx,pageHeight(1.03)+.30,-.66,'ivory');put(cone,'navy',side*1.03+dx,pageHeight(1.03)+.68,-.66,.065,.22,.065);
      }
    }
    path([[0,bookY+.03,-1.5],[0,bookY+.09,0],[0,bookY+.03,1.5],[.15,.9,1.75]],.025,'burgundy');
    torus(.23,.022,0,bookY+.22,.06);torus(.17,.009,0,bookY+.23,.06);
    for(let i=0;i<8;i++){const a=i/8*TAU;rod([0,bookY+.23,.06],[Math.cos(a)*.21,bookY+.23,.06+Math.sin(a)*.21],.006);}
  });
  // Theatre: terraced amphitheatre, navy velvet, brass truss and instruments.
  group(-3,1.47,-1.65,1,0,()=>{
    for(let i=0;i<7;i++)disk(1.10-i*.055,.055,0,i*.055,0,i%2?'stone':'ivory',.72);
    disk(.77,.08,0,.40,-.02,'navy',.78);torus(.80,.018,0,.43,-.02);
    for(let i=0;i<25;i++){const a=i/24*Math.PI;rod([Math.cos(a)*.91,.25,Math.sin(a)*.65],[Math.cos(a)*.91,.43,Math.sin(a)*.65],.009);}
    for(const side of [-1,1]){
      for(const dx of [-.065,.065])rod([side*.93+dx,.35,-.43],[side*.93+dx,2.18,-.43],.018);
      for(let i=0;i<7;i++)for(const dir of [-1,1])rod([side*.93-.065*dir,.35+i*.26,-.43],[side*.93+.065*dir,.61+i*.26,-.43],.008);
      for(const y of [.38,2.2])box(.21,.07,.23,side*.93,y,-.43,'gold');
    }
    for(const y of [2.07,2.23])rod([-.99,y,-.43],[.99,y,-.43],.018);
    for(let i=0;i<12;i++)rod([-.99+i*.165,2.07,-.43],[-.825+i*.165,2.23,-.43],.008);
    const g=new THREE.PlaneGeometry(1.78,1.68,90,10),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,.035*Math.sin(x*62)+.012*Math.cos(x*115));}g.computeVertexNormals();mats.navy.side=THREE.DoubleSide;put(g,'navy',0,1.25,-.46);
    for(let i=0;i<7;i++){const x=-.75+i*.25;rod([x,2.12,-.4],[x,1.94,-.29],.012);ball(.037,x,1.93,-.27,'light');lampPoints.push(new THREE.Vector3(x,1.93,-.27).applyMatrix4(frame));}
    // Drum kit, piano, cymbals, microphone and double bass.
    put(cylinder,'gold',.10,.65,.14,.16,.18,.16,Math.PI/2);put(cylinder,'ivory',.10,.65,.24,.145,.012,.145,Math.PI/2);
    for(const x of [-.14,.31]){disk(.10,.09,x,.80,.04,'navy');rod([x,.43,.04],[x,.78,.04],.012);}
    for(const [x,z]of[[-.30,.08],[.44,-.13]]){rod([x,.43,z],[x,1.0,z],.012);disk(.14,.012,x,1,z,'gold');}
    box(.48,.08,.23,-.48,.75,.12,'navy');for(let i=0;i<12;i++)box(.025,.01,.12,-.64+i*.028,.80,.22,'ivory');
    for(const x of [-.65,-.32])rod([x,.44,.1],[x,.73,.1],.013,'ink');
    ball(.11,.58,.65,.16,'burgundy',.70,1.35,.38);ball(.075,.58,.79,.16,'burgundy',.85,1,.4);rod([.58,.65,.16],[.58,1.12,.16],.018);rod([-.12,.44,.48],[-.12,1.0,.48],.009,'ink');
    for(const x of [-.84,.84]){box(.18,.47,.19,x,.68,.10,'navy');for(const y of [.56,.76])put(cylinder,'ink',x,y,.21,.06,.012,.06,Math.PI/2);}
  });
  // Large gilt frame, raised on stone steps, with a true coral-and-navy relief.
  group(3,1.34,-2.12,1,-.10,()=>{
    for(let i=0;i<4;i++)box(1.88-i*.09,.08,.58,0,.04+i*.08,.18-i*.08,'stone');
    box(1.62,2.18,.11,0,1.37,0,'navy');
    for(let k=0;k<4;k++){
      const w=1.82-k*.07,h=2.40-k*.07;
      for(const x of [-w/2,w/2])box(.032,h,.08,x,1.38,.06+k*.018,k%2?'ivory':'gold');
      for(const y of [1.38-h/2,1.38+h/2])box(w,.032,.08,0,y,.06+k*.018,k%2?'ivory':'gold');
    }
    const shape=new THREE.Shape();shape.moveTo(-.32,.36);shape.bezierCurveTo(.65,.78,-.42,1.18,.18,1.64);shape.bezierCurveTo(.55,1.88,.10,2.08,.32,2.39);shape.lineTo(.76,2.39);shape.lineTo(.76,.36);shape.closePath();put(new THREE.ShapeGeometry(shape,28),'coral',0,0,.069);
    for(let i=0;i<22;i++){
      const points=[];for(let j=0;j<=25;j++){const y=.40+j/25*1.94,x=-.68+i*.059+.055*Math.sin(y*9+i*.8)+.028*Math.sin(y*27+i);points.push([Math.max(-.75,Math.min(.75,x)),y,.08]);}path(points,.003,i%3?'navy':'gold',25);
    }
    for(const x of [-.90,.90])lamp(x,.18,.35,.34);
  });
  buildAtlasVenue(THREE,{group,box,disk,ball,rod,path,torus,put,arch,lamp});
  // Paper streets become slim bronze-railed bridges only beyond the page edges.
  // Their centerlines are also the pedestrians' ground truth.
  function bridge(curve,garden=false,venue=false,width=ATLAS_WALKWAY_WIDTH){
    const vertices=[],indices=[],segments=128,length=curve.getLength();
    const edge=(u,side,dy=0)=>{
      const p=curve.getPointAt(u),t=curve.getTangentAt(u),horizontal=Math.hypot(t.x,t.z);
      const x=p.x+side*t.z/horizontal*width/2,z=p.z-side*t.x/horizontal*width/2;
      // Crossfall matches the curved paper, including each pedestrian lane.
      return [x,atlasBookMargin(x,z)>0?atlasDeckHeight(x,z,p.y)+dy:p.y+dy,z];
    };
    for(let i=0;i<=segments;i++){
      const u=i/segments;
      for(const [side,dy] of [[-1,0],[1,0],[-1,-.085],[1,-.085]])vertices.push(...edge(u,side,dy));
      if(i<segments){const a=i*4,b=a+4;indices.push(a,b,a+1,a+1,b,b+1,a,a+2,b,a+2,b+2,b,a+1,b+1,a+3,a+3,b+1,b+3,a+2,a+3,b+2,a+3,b+3,b+2);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();put(g,'ivory');
    // A stepped limestone footing supports the garden walk over the scalloped
    // island edge and joins the venue's existing stair terrace.
    if(garden)for(let tier=0;tier<3;tier++){
      const p=[],ix=[],spread=1.55-tier*.14,top=-.19+tier*.055,bottom=top-.065;
      for(let i=0;i<segments;i++){
        const u=i/segments,v=(i+1)/segments;
        if(curve.getPointAt(u).z<2.75)continue;
        const a=p.length/3;
        for(const t of [u,v])for(const [side,dy]of[[-spread,top],[spread,top],[-spread,bottom],[spread,bottom]])p.push(...edge(t,side,dy));
        ix.push(a,a+4,a+1,a+1,a+4,a+5,a,a+2,a+4,a+2,a+6,a+4,a+1,a+5,a+3,a+3,a+5,a+7);
      }
      const footing=new THREE.BufferGeometry();footing.setAttribute('position',new THREE.Float32BufferAttribute(p,3));footing.setIndex(ix);footing.computeVertexNormals();put(footing,tier%2?'stone':'ivory');
    }
    const start=.24/length,end=1-.12/length;
    for(const side of [-1,1]){
      // Thin inlaid borders on the book; balustrades only at exposed edges.
      path(Array.from({length:129},(_,i)=>edge(i/128,side,.005)),.005,'gold',128);
      const posts=Math.ceil(length/.18);
      for(let i=0;i<posts;i++){
        const u=start+(end-start)*i/posts,v=start+(end-start)*(i+1)/posts;
        const p=curve.getPointAt(u);
        if(atlasBookMargin(p.x,p.z)>-.10)continue;
        // The garden section sits on solid ground: open curbs and low lamps,
        // with balustrades retained only along the raised gazebo approach.
        if(garden&&p.z>2.75&&p.y<1.22){
          if(i%7===0)lamp(...edge(u,side*1.35),.17);
          continue;
        }
        rod(edge(u,side),edge(u,side,.13),.007,'gold');
        for(const h of [.065,.13])rod(edge(u,side,h),edge(v,side,h),h>.1?.008:.004,'gold');
        if(i%6===0)lamp(...edge(u,side),.18);
      }
    }
    // Stone joints and small piers make the deck read as a walkable structure.
    const joints=Math.floor(length/.17);
    for(let i=1;i<joints;i++)rod(edge(i/joints,-.91,.002),edge(i/joints,.91,.002),.003,'edge');
    const piers=Math.max(2,Math.floor(length/.65));
    for(let i=1;i<piers;i++){
      const p=curve.getPointAt(i/piers),base=atlasSurfaceHeight(p.x,p.z)+.012;
      const h=p.y-.085-base;
      if(h>.04){disk(.055,h,p.x,base+h/2,p.z,'stone');disk(.075,.025,p.x,p.y-.10,p.z,'gold');}
    }
    // A landing gives walkers room to turn before the landmark entrance.
    const p=curve.getPointAt(1);
    if(!garden&&!venue){disk(.19,.06,p.x,p.y-.03,p.z,'ivory');torus(.17,.006,p.x,p.y+.004,p.z,'gold');}
  }
  routes.forEach((curve,index)=>bridge(curve,index===3,index===2));
  // The original compass remains on the book's spine, with no raised platform.
  // Garden pavilions and fountains make the foreground a district, not a plinth.
  function pavilion(x,y,z,r=.40){
    disk(r+.13,.08,x,y,z,'stone');disk(r+.08,.04,x,y+.06,z);
    for(let i=0;i<8;i++){const a=i/8*TAU;rod([x+Math.cos(a)*r*.8,y+.07,z+Math.sin(a)*r*.8],[x+Math.cos(a)*r*.8,y+.57,z+Math.sin(a)*r*.8],.024,'ivory');}
    disk(r,.06,x,y+.60,z,'gold');dome(x,y+.63,z,r);
  }
  terrace(-3.17,1.63,.80,.83,.23);pavilion(-3.17,1.10,1.63,.34);
  terrace(-.05,2.98,.62,.83,.08);
  disk(.37,.05,-.05,.94,2.98,'shadow');disk(.32,.02,-.05,.973,2.98,'water');
  disk(.14,.06,-.05,1.04,2.98);rod([-.05,1.04,2.98],[-.05,1.31,2.98],.025);disk(.19,.035,-.05,1.26,2.98,'gold');ball(.035,-.05,1.36,2.98,'light');
  // Dense perimeter settlements and slender cypresses, with deliberate clearings
  // around the central atlas, venue, theatre and water.
  function clear(x,z){return !(Math.abs(x+.4)<2.25&&Math.abs(z)<1.55)&&Math.hypot((x+3)/1.5,(z+1.55)/1.3)>1&&Math.hypot(x-3,z+2.05)>1.1&&Math.hypot((x-3.02)/1.55,(z-1.9)/1.3)>1&&pools.every(p=>Math.hypot((x-p.x)/p.rx,(z-p.z)/p.rz)>1.12);}
  for(let i=0;i<450;i++){
    const x=(rand()-.5)*9,z=(rand()-.5)*6.5;if(x*x/21+z*z/10.4>.92||!clear(x,z))continue;
    if(i%3===0)building(x,.85,z,.35+rand()*.35,rand()*.9-.45,i);
    else tree(x,.85,z,.23+rand()*.61);
    shrub(x+.12,.84,z-.06,.08+rand()*.08);
    if(i%7===0)lamp(x,.85,z+.13,.18);
  }
  // Taller groves and houses behind the landmarks reinforce the reference silhouette.
  for(const [cx,cz,base]of[[-3,-1.55,1.46],[3,-2.05,1.26]])for(let i=0;i<18;i++){
    const a=i/18*TAU,x=cx+Math.cos(a)*1.10,z=cz+Math.sin(a)*.85;
    if(z<cz+.2){tree(x,base,z,.45+rand()*.55);if(i%3===0)building(x+.12,base,z,.45,0,i);}
  }
  // Perimeter arcade walls, dressed stone promenades and smaller terraces.
  for(const [cx,cz,yy,rr] of [[-3,-1.55,1.18,1.37],[3,-2.05,1.0,1.12],[-3.17,1.63,.94,.73]]){
    for(let i=0;i<12;i++){
      const a=.12+i/11*Math.PI*.94,x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr*.82;
      group(x,.84,z,1,-a+Math.PI/2,()=>{put(arch(.23,yy-.84+.12,.10,.04),'stone');box(.29,.035,.14,0,yy-.84+.13,.04);});
      if(i%2===0)lamp(x,yy+.15,z,.19);
    }
  }
  for(let i=0;i<70;i++){
    const a=i/70*TAU,x=Math.cos(a)*4.31,z=Math.sin(a)*3.04;
    if(!clear(x,z))continue;
    const h=.08+rand()*.16;
    put(rock,'stone',x,.88,z,.12,h,.13,0,rand()*TAU,0,.76);
    shrub(x-.10,.86,z+.06,.12);
  }
  // A scattering of lamp reflections within each pool.
  for(const pool of pools)for(let i=0;i<15;i++){
    const a=rand()*TAU,r=.3+rand()*.55;box(.008,.003,.025+rand()*.09,pool.x+Math.cos(a)*r*pool.rx,.344,pool.z+Math.sin(a)*r*pool.rz,'light',0,.65);
  }
  // Upload a small set of static meshes instead of thousands of scene objects.
  for(const [key,b] of batches){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));g.computeBoundingSphere();const m=new THREE.Mesh(g,mats[key]);m.castShadow=m.receiveShadow=true;if(key==='light'||key==='window'||key==='water'){m.userData.noShadow=true;m.userData.noAO=true;}root.add(m);}
  for(const g of geometries)g.dispose();
  // Fit occupied height bands before atmospheric sprites so empty corners and
  // light halos cannot shrink the architecture in the viewport.
  const bands=new Map();root.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){point.fromBufferAttribute(a,i);const k=Math.floor(point.y/.20);if(!bands.has(k))bands.set(k,{min:point.y,max:point.y,points:new Map()});const b=bands.get(k);b.min=Math.min(b.min,point.y);b.max=Math.max(b.max,point.y);b.points.set(`${Math.round(point.x/.06)},${Math.round(point.z/.06)}`,[point.x,point.z]);}});
  const framingPoints=[],cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  for(const b of bands.values()){
    const sorted=[...b.points.values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),lower=[],upper=[];
    for(const p of sorted){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
    for(const p of sorted.reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
    for(const p of [...lower,...upper])for(const y of [b.min,b.max])framingPoints.push(new THREE.Vector3(p[0],y,p[1]));
  }
  const pixels=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const i=(y*32+x)*4,d=Math.hypot((x-15.5)/15.5,(y-15.5)/15.5);pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=Math.round(Math.max(0,1-d)**3*255);}
  const glowMap=new THREE.DataTexture(pixels,32,32);glowMap.needsUpdate=true;
  const glowMat=new THREE.SpriteMaterial({map:glowMap,color:0xffbe65,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,toneMapped:false,opacity:.62});
  lampPoints.forEach(p=>{const sprite=new THREE.Sprite(glowMat);sprite.position.copy(p);sprite.scale.setScalar(.30);root.add(sprite);});
  for(const [x,y,z,power] of [[-3,2.3,-.9,2.5],[3.0,2.35,3.3,.9],[2.9,1.65,-1.6,.8],[-.5,2.3,.1,1.3]]){
    const light=new THREE.PointLight(0xffbe73,power,3.7,2);light.position.set(x,y,z);root.add(light);
  }
  const moving=new THREE.Group();root.add(moving);
  const beadMaterial=new THREE.MeshBasicMaterial({color:0xffe1a2});
  const beads=routes.slice(0,3).map(()=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),beadMaterial);mesh.userData.noShadow=true;moving.add(mesh);return mesh;});
  const motes=[];for(let i=0;i<22;i++){const sprite=new THREE.Sprite(glowMat);sprite.position.set((rand()-.5)*9,.8+rand()*3,(rand()-.5)*5);sprite.scale.setScalar(.025+rand()*.025);root.add(sprite);motes.push({sprite,y:sprite.position.y,phase:rand()*TAU});}
  const tour=[{title:'Learn from the whole portfolio',detail:'Reports, rights and cultural signals become one living atlas.'},{title:'Coordinate the people behind it',detail:'Golden routes connect the stage, collection and cultural venue.'},{title:'Prepare the next decision',detail:'A shared view of the portfolio, ready for human judgment.'}];
  let selectedStep=null,stepStart=0;
  let motion;
  root.userData={artifactId:75,conceptual:true,displayBase:false,studioProfile:'atlas',groundLevel:0,initialYaw:.06,initialElevation:.62,framingPoints,autoOrbit:false,
    annotations:[{id:'partnerships',position:[3.02,2.8,2.0]},{id:'originals',position:[-3,3.8,-1.65]},{id:'art',position:[3,3.92,-2.12]},{id:'concierge',position:[-.4,1.5,.25]}],
    setStep(index,time){selectedStep=Number.isInteger(index)?Math.max(0,Math.min(2,index)):null;stepStart=time;},
    animate(time){windTime.value=time;motion?.update(time);const index=selectedStep??Math.floor(Math.max(0,time-stepStart)/8)%3;beads.forEach((bead,i)=>{const u=(time*.08+i/3)%1;bead.position.copy(routes[i].getPoint(index===0?1-u:u));bead.position.y+=.045;});motes.forEach(({sprite,y,phase})=>{sprite.position.y=y+Math.sin(time*.35+phase)*.06;});root.userData.story={step:`0${index+1} / 03`,index,...tour[index],tone:index===2?'complete':'thinking'};},
  };
  root.userData.animate(0);
  if (!bake && typeof document !== 'undefined') applyBakedAO(THREE, root, '../assets/buzo-atlas-world-ao-v7.bin', 10000);
  // Capture the original mesh list for the existing bake before adding effects.
  if (!bake) {
    moving.visible = false; // The choreographed trails replace the old independent beads.
    motion = createAtlasMotion(THREE, root, { routes, pools, glowMap });
  }
  return root;
}
