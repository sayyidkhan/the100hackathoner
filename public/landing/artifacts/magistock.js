import { sculpture } from './sculpture.js';

// Geometry follows the observatory artwork: three instruments, a brass gimbal,
// slotted execution housing, upright archive and recessed override. No labels.
export function createArtifact(T) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(T);
  const palette = { paper:0x172634, ivory:0x263d4b, shade:0x536571, ink:0x080f17, wood:0xb99761, red:0xb16d3f, blue:0x547d95, lavender:0x6b8060 };
  for (const [name,color] of Object.entries(palette)) {
    const m=materials[name];m.color.setHex(color);m.metalness=.92;m.roughness=name==='ink'?.28:.23;
    // Fine brushed-metal variation is procedural, so static batching needs no UVs.
    m.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vMetalPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nvMetalPosition=position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vMetalPosition;').replace('#include <color_fragment>',`#include <color_fragment>
        float grain=fract(sin(dot(floor(vMetalPosition*vec3(220.,2200.,220.)),vec3(12.9898,78.233,32.71)))*43758.5453);
        diffuseColor.rgb*=.94+.09*grain;`);
    };m.customProgramCacheKey=()=> 'magistock-brushed-v3';
  }
  materials.ink.metalness=.63;
  const preserved=[],routes=[];
  const V=p=>new T.Vector3(...p);
  function shape(w,h,r=.08){
    const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;
  }
  function relief(s,d,color,parent=root,bevel=.012){return mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:16}),color,parent);}
  function rounded(w,h,d,x,y,z,color='wood',parent=root,r=.08){const m=relief(shape(w,h,r),d,color,parent);m.position.set(x,y,z-d/2);return m;}
  function slab(w,d,h,x,y,z,color='paper',r=.18){const m=rounded(w,d,h,0,0,0,color,root,r);m.rotation.x=-Math.PI/2;m.position.set(x,y-h/2,z);return m;}
  function rod(a,b,r=.02,color='wood',parent=root){const delta=V(b).sub(V(a));const m=mesh(new T.CylinderGeometry(r,r,delta.length(),12),color,parent);m.position.copy(V(a).add(V(b)).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
  function ring(r,t,x,y,z,color='wood',parent=root){const m=mesh(new T.TorusGeometry(r,t,10,112),color,parent);m.position.set(x,y,z);return m;}
  // Flat, deep machined annuli give the gimbal the broad reflective faces in the art.
  function band(r,width,depth,x,y,z,color='wood',parent=root){
    const s=new T.Shape();s.absarc(0,0,r,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,r-width,0,Math.PI*2,true);s.holes.push(hole);
    const m=relief(s,depth,color,parent,.009);m.position.set(x,y,z-depth/2);return m;
  }
  function faceDisk(r,d,x,y,z,color='wood',parent=root){const m=disk(r,d,x,y,z,color,parent);m.rotation.x=Math.PI/2;return m;}
  function screw(x,y,z,front=false,r=.032){const m=disk(r,.014,x,y,z,'wood');if(front)m.rotation.x=Math.PI/2;const slot=box(r*1.2,.003,.006,x,y+.009,z,'ink');if(front){slot.rotation.x=Math.PI/2;slot.position.set(x,y,z+.009);}return m;}
  function add(m,parent=root){parent.add(m);m.userData.noShadow=true;preserved.push(m);return m;}
  function luminousBox(w,h,d,x,y,z,color){
    const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color,toneMapped:false}));m.position.set(x,y,z);add(m);return m;
  }
  function glowTexture(){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');const g=ctx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,.65)');g.addColorStop(.18,'rgba(255,255,255,.28)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new T.CanvasTexture(c);}
  const glowMap=typeof document!=='undefined'?glowTexture():null;
  function halo(x,y,z,color,size){if(!glowMap)return;const m=new T.Sprite(new T.SpriteMaterial({map:glowMap,color,transparent:true,opacity:.48,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));m.position.set(x,y,z);m.scale.setScalar(size);add(m);return m;}
  // Solid champagne edge, dark inset enamel, black undercut and short feet.
  for(const x of [-3.65,3.65])for(const z of [-1.86,1.86]){disk(.19,.15,x,.13,z,'ink');disk(.18,.06,x,.20,z,'wood');}
  slab(8.8,5.0,.12,0,.24,0,'ink',.38);
  slab(8.78,4.98,.29,0,.43,0,'wood',.37);
  slab(8.61,4.81,.055,0,.61,0,'ink',.32);
  slab(8.43,4.63,.035,0,.66,0,'paper',.29);
  for(const z of [-2.20,2.20])box(7.73,.008,.012,0,.687,z,'wood');
  for(const x of [-3.99,3.99])box(.012,.008,3.86,x,.687,0,'wood');
  for(const x of [-4.13,4.13])for(const z of [-2.22,2.22])screw(x,.65,z,false,.048);
  // Three smaller machined instruments; more metal structure, less flat coloured shell.
  const towers=[{x:-3.02,z:-.66,h:2.73,c:'red',light:0xff983a},{x:-2.16,z:-.65,h:1.92,c:'blue',light:0x42baff},{x:-1.48,z:-1.43,h:2.34,c:'lavender',light:0xa8e477}];
  towers.forEach(s=>{
    disk(.43,.10,s.x,.75,s.z,'wood');disk(.40,.07,s.x,.84,s.z,'shade');disk(.36,.04,s.x,.90,s.z,s.c);
    rounded(.55,s.h,.53,s.x,.91+s.h/2,s.z,s.c,root,.075);
    rounded(.43,s.h-.11,.026,s.x,.91+s.h/2,s.z+.28,'wood',root,.05);
    rounded(.35,s.h-.18,.018,s.x,.91+s.h/2,s.z+.31,'ink',root,.04);
    // Glowing tube and tiny alternating terminals are visible through the dark inset.
    luminousBox(.036,s.h-.35,.035,s.x+.045,.91+s.h/2,s.z+.34,s.light);
    rod([s.x-.09,1.03,s.z+.345],[s.x-.09,.78+s.h,s.z+.345],.012,'shade');
    for(let i=0;i<18;i++){
      const y=1.05+i*(s.h-.29)/18;
      box(.07,.014,.02,s.x-.095,y,s.z+.345,'wood');
      box(.018,.035,.015,s.x+.13,y,s.z+.34,s.c);
      for(const side of [-1,1])box(.018,.022,.30,s.x+side*.274,y,s.z,'shade');
    }
    for(const dx of [-.23,.23])for(const dz of [-.22,.22])rod([s.x+dx,.97,s.z+dz],[s.x+dx,.87+s.h,s.z+dz],.022,'wood');
    rounded(.59,.08,.57,s.x,.95+s.h,s.z,'wood',root,.07);
    rounded(.45,.025,.40,s.x,1.009+s.h,s.z,'ink',root,.04);
    for(const dx of [-.20,.20])for(const dz of [-.17,.17])screw(s.x+dx,1.04+s.h,s.z+dz,false,.021);
    for(let j=0;j<5;j++)halo(s.x+.045,1.05+j*(s.h-.3)/4,s.z+.36,s.light,.28);
  });
  // Main instrument: broad brass ring, concentric edge rails and substantial bearings.
  const cx=.25,cy=2.17,cz=-.12;
  disk(.69,.12,cx,.76,cz,'wood');disk(.61,.08,cx,.86,cz,'ink');disk(.55,.055,cx,.93,cz,'wood');
  for(const dx of [-1.23,1.23]){
    disk(.35,.08,cx+dx,.75,cz,'wood');disk(.28,.075,cx+dx,.83,cz,'ink');disk(.24,.05,cx+dx,.89,cz,'wood');
    const s=new T.Shape();s.moveTo(-.23,0);s.lineTo(.23,0);s.lineTo(.12,.29);s.lineTo(.095,1.13);s.lineTo(-.095,1.13);s.lineTo(-.12,.29);s.closePath();
    const support=relief(s,.24,'wood');support.position.set(cx+dx,.91,cz-.12);
    faceDisk(.22,.33,cx+dx,cy-.08,cz,'wood');faceDisk(.16,.37,cx+dx,cy-.08,cz,'ink');faceDisk(.11,.40,cx+dx,cy-.08,cz,'wood');
    for(let i=0;i<8;i++){const a=i*Math.PI/4;screw(cx+dx+Math.cos(a)*.176,cy-.08+Math.sin(a)*.176,cz+.18,true,.018);}
  }
  band(1.38,.15,.21,cx,cy,cz,'wood');ring(1.37,.012,cx,cy,cz+.12,'shade');ring(1.23,.012,cx,cy,cz+.12,'wood');
  for(let i=0;i<84;i++){
    const a=i*Math.PI/42,major=i%7===0;
    rod([cx+Math.cos(a)*1.25,cy+Math.sin(a)*1.25,cz+.119],[cx+Math.cos(a)*(major?1.325:1.285),cy+Math.sin(a)*(major?1.325:1.285),cz+.119],major?.006:.0035,'ink');
  }
  for(let i=0;i<8;i++){const a=i*Math.PI/4;screw(cx+Math.cos(a)*1.31,cy+Math.sin(a)*1.31,cz+.122,true,.027);}
  const gimbal=new T.Group();gimbal.position.set(cx,cy,cz);root.add(gimbal);preserved.push(gimbal);
  const outer=band(1.13,.060,.07,0,0,0,'blue',gimbal);outer.rotation.set(.15,.66,-.15);
  const inner=band(.97,.052,.07,0,0,0,'wood',gimbal);inner.rotation.set(.62,-.18,.25);
  const orbit=band(.79,.028,.04,0,0,0,'wood',gimbal);orbit.rotation.set(-.18,-.78,.22);
  for(const sign of [-1,1]){ball(.065,sign*1.10,0,0,'wood',gimbal);rod([0,sign*.57,0],[0,sign*1.08,0],.027,'wood',gimbal);}
  // A cut crystal with staggered facets, a transparent outer shell and an inner core.
  const vertices=[],segments=12,bands=[[.59,.06],[.41,.35],[.14,.51],[-.20,.46],[-.51,.20],[-.59,.015]];
  for(let j=0;j<bands.length-1;j++)for(let i=0;i<segments;i++){
    const point=(row,col)=>{const [y,r]=bands[row],a=(col+(row%2)*.5)*Math.PI*2/segments;return [Math.cos(a)*r,y,Math.sin(a)*r];};
    const a=point(j,i),b=point(j,i+1),c=point(j+1,i),d=point(j+1,i+1);vertices.push(...a,...b,...c,...b,...d,...c);
  }
  const crystalGeometry=new T.BufferGeometry();crystalGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));crystalGeometry.computeVertexNormals();
  const crystalMaterial=new T.MeshPhysicalMaterial({color:0xb6efff,metalness:0,roughness:.035,transmission:.92,thickness:.8,ior:1.78,clearcoat:1,envMapIntensity:1.7,attenuationColor:0x2e9fcb,attenuationDistance:1.1,side:T.DoubleSide});
  const crystal=new T.Mesh(crystalGeometry,crystalMaterial);gimbal.add(crystal);
  const core=new T.Mesh(new T.IcosahedronGeometry(.30,1),new T.MeshPhysicalMaterial({color:0x1999c1,metalness:.45,roughness:.12,emissive:0x035370,emissiveIntensity:.40,clearcoat:1,flatShading:true}));gimbal.add(core);
  const edges=new T.LineSegments(new T.EdgesGeometry(crystalGeometry,12),new T.LineBasicMaterial({color:0xc7f8ff,transparent:true,opacity:.17}));crystal.add(edges);
  halo(cx,cy,cz,0x39cbff,.95);
  // Four curved, deep fins form an open cyan passage, not a black box facade.
  const gx=2.83,gz=-.32;
  slab(1.90,1.88,.12,gx,.76,gz,'wood',.15);slab(1.76,1.72,.045,gx,.855,gz,'ink',.12);
  for(let i=0;i<4;i++){
    const x=gx-.69+i*.46,h=1.13+(i===1||i===2?.13:0);
    rounded(.28,h,1.60,x,.89+h/2,gz,'wood',root,.10);
    rounded(.21,h-.07,1.62,x,.92+h/2,gz,'paper',root,.075);
    // Narrow metal perimeter on the front carries small bolts.
    rounded(.29,h-.03,.04,x,.92+h/2,gz+.84,'wood',root,.07);
    rounded(.20,h-.14,.045,x,.92+h/2,gz+.87,'ink',root,.055);
    for(const y of [1.02,.80+h])screw(x,y,gz+.90,true,.025);
    box(.025,.018,1.29,x-.07,.965+h,gz,'wood');
    if(i<3){
      luminousBox(.11,.68,.025,x+.23,1.28,gz+.60,0x24cbea);
      for(let j=0;j<6;j++)box(.13,.015,.04,x+.23,1.02+j*.11,gz+.65,'blue');
      halo(x+.23,1.25,gz+.78,0x0ccfff,.65);
    }
  }
  // Six rounded metal archive cards standing upright in a low brass tray.
  slab(1.58,1.38,.09,2.77,.75,1.44,'wood',.14);slab(1.43,1.23,.035,2.77,.82,1.44,'ink',.10);
  for(let i=0;i<6;i++){
    const z=1.00+i*.18,h=.62+(5-i)*.024;
    rounded(1.23,h,.075,2.77,.88+h/2,z,'wood',root,.10);
    rounded(1.12,h-.09,.021,2.77,.88+h/2,z+.053,'shade',root,.08);
    rounded(.98,h-.19,.008,2.77,.88+h/2,z+.072,'paper',root,.055);
    for(const x of [2.24,3.30])screw(x,.97,z+.087,true,.018);
  }
  for(const x of [2.06,3.48]){rod([x,.82,.98],[x,.82,2.0],.025);disk(.042,.22,x,.94,1.98,'wood');}
  // Recessed red glass override: broad circular bezel, no crossbar.
  const bx=-2.98,bz=1.29;
  disk(.55,.025,bx,.70,bz,'wood');disk(.47,.035,bx,.73,bz,'ink');disk(.37,.06,bx,.77,bz,'wood');
  const button=disk(.31,.09,bx,.84,bz,'red');button.material=new T.MeshPhysicalMaterial({color:0xb91214,metalness:.40,roughness:.14,clearcoat:1});
  const buttonRim=ring(.31,.013,bx,.895,bz,'wood');buttonRim.rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;screw(bx+Math.cos(a)*.51,.724,bz+Math.sin(a)*.51,false,.023);}
  // A scrolling, illustrative market trace. Two instance batches keep all
  // candle updates cheap; elapsed scene time also honours pause/reduced motion.
  const chart=new T.Group();chart.name='magistock-market-chart';chart.position.y=.696;root.add(chart);preserved.push(chart);
  const candleMaterial=new T.MeshStandardMaterial({color:0xd4ac68,metalness:.6,roughness:.30,emissive:0xa56b23,emissiveIntensity:.35});
  const candleGeometry=new T.BoxGeometry(1,1,1),candleCount=78;
  const bodies=new T.InstancedMesh(candleGeometry,candleMaterial,candleCount);
  const wicks=new T.InstancedMesh(candleGeometry,candleMaterial,candleCount);
  for(const batch of [bodies,wicks]){batch.instanceMatrix.setUsage(T.DynamicDrawUsage);batch.frustumCulled=false;batch.userData.noShadow=true;chart.add(batch);}
  const candleTransform=new T.Object3D(),candleColor=new T.Color();
  const price=t=>.15*Math.sin(t*.28)+.10*Math.cos(t*.67)+.025*Math.sin(t*1.73);
  function animateChart(time){
    const scroll=time*6,first=Math.floor(scroll),fraction=scroll-first,left=-2.2,right=1.752,spacing=.052;
    for(let i=0;i<candleCount;i++){
      const sample=first+i,x=left+(i-fraction)*spacing;
      const open=price(sample),close=price(sample+1);
      const high=Math.max(open,close)+.025+.022*(1+Math.sin(sample*1.31));
      const low=Math.min(open,close)-.025-.018*(1+Math.cos(sample*1.93));
      const edge=Math.max(0,Math.min(1,(x-left)/spacing,(right-x)/spacing));
      candleTransform.position.set(x,.003,1.35-(open+close)/2);
      candleTransform.scale.set(.025*edge,.006,Math.max(.014,Math.abs(close-open)));
      candleTransform.updateMatrix();bodies.setMatrixAt(i,candleTransform.matrix);
      candleTransform.position.set(x,0,1.35-(high+low)/2);
      candleTransform.scale.set(.006*edge,.003,high-low);
      candleTransform.updateMatrix();wicks.setMatrixAt(i,candleTransform.matrix);
      candleColor.setHex(close>=open?0xffe0a0:0xb88a4e);bodies.setColorAt(i,candleColor);wicks.setColorAt(i,candleColor);
    }
    bodies.instanceMatrix.needsUpdate=wicks.instanceMatrix.needsUpdate=true;
    bodies.instanceColor.needsUpdate=wicks.instanceColor.needsUpdate=true;
  }
  for(let i=0;i<6;i++)box(3.98,.002,.005,-.25,.689,1.03+i*.17,'shade');
  // Channels sit in metal tracks; additive halos provide local glow without a full-screen pass.
  function route(points,color){
    const curve=new T.CatmullRomCurve3(points.map(V),false,'centripetal');
    const rail=mesh(new T.TubeGeometry(curve,64,.042,8,false),'wood');
    const path=new T.Mesh(new T.TubeGeometry(curve,64,.019,8,false),new T.MeshBasicMaterial({color,toneMapped:false}));path.position.y=.026;add(path);
    const bloom=new T.Mesh(new T.TubeGeometry(curve,64,.058,8,false),new T.MeshBasicMaterial({color,transparent:true,opacity:.10,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));bloom.position.y=.03;add(bloom);
    const packet=new T.Mesh(new T.SphereGeometry(.026,12,8),new T.MeshBasicMaterial({color:0xe3fbff,toneMapped:false}));add(packet);
    routes.push({curve,packet});return rail;
  }
  towers.forEach((s,i)=>route([[s.x,.72,s.z+.39],[s.x+.08,.72,.20+i*.14],[-1.14,.72,.34+i*.14],[cx-.25,.72,.25+i*.12]],s.light));
  for(let i=0;i<3;i++)route([[cx+.51,.72,.36-i*.19],[1.47,.72,.36-i*.19],[1.85+i*.22,.72,.22-i*.12],[2.37+i*.46,.72,.28]],0x2ccdf3);
  route([[3.64,.72,-.23],[3.88,.72,.17],[3.82,.72,1.06],[3.53,.72,1.10]],0xbca66e);
  const model=finish(50,preserved);
  // finish() centres the static geometry; animated packets use that same offset.
  const packetOffset=routes[0].packet.position.clone().add(new T.Vector3(0,.05,0));
  model.userData={...model.userData,displayBase:false,studioProfile:'magistock',groundLevel:0,initialYaw:.48,initialElevation:.46,autoOrbit:false,
    animate(time){
      animateChart(time);
      gimbal.rotation.y=Math.sin(time*.20)*.09;
      outer.rotation.y=.66+Math.sin(time*.18)*.12;
      inner.rotation.z=.25+Math.sin(time*.16)*.10;
      crystal.rotation.y=time*.09;core.rotation.copy(crystal.rotation);
      routes.forEach(({curve,packet},i)=>packet.position.copy(curve.getPointAt((time*.12+i*.19)%1)).add(packetOffset));
    }
  };
  model.userData.animate(0);
  const bandsByHeight=new Map(),point=new T.Vector3();model.updateMatrixWorld(true);
  model.traverse(o=>{if(!o.isMesh||o.userData.noShadow)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){point.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);const key=Math.floor(point.y/.2);if(!bandsByHeight.has(key))bandsByHeight.set(key,new T.Box3());bandsByHeight.get(key).expandByPoint(point);}});
  model.userData.framingPoints=[];
  for(const b of bandsByHeight.values())for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z])model.userData.framingPoints.push(new T.Vector3(x,y,z));
  return model;
}
