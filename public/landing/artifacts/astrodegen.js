// The original paper-and-clay observatory, refined with gentle illustrative motion.
export function createArtifact(T) {
  const root=new T.Group(),PI=Math.PI,TAU=PI*2,cache=new Map(),moving=new Set();
  const material=color=>new T.MeshStandardMaterial({color,roughness:.84,metalness:0});
  const m={ivory:material(0xede0c5),paper:material(0xf5ebd8),red:material(0xb9321c),blue:material(0x123d99),wood:material(0xb2a180),shade:material(0x634b32),lens:material(0x102b69),grid:material(0xd9cbb2)};
  m.lens.roughness=.27;
  const grainCanvas=document.createElement('canvas');grainCanvas.width=grainCanvas.height=128;
  const grainCtx=grainCanvas.getContext('2d'),grainData=grainCtx.createImageData(128,128);
  for(let i=0;i<128*128;i++){let n=Math.imul(i+42,374761393);n=Math.imul(n^(n>>>13),1274126177);const v=100+((n^(n>>>16))>>>0)%100;grainData.data.set([v,v,v,255],i*4);}
  grainCtx.putImageData(grainData,0,0);const grain=new T.CanvasTexture(grainCanvas);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(3,3);
  for(const mat of Object.values(m)){mat.bumpMap=grain;mat.bumpScale=.002;}
  function group(x=0,y=0,z=0,parent=root,animate=false){const o=new T.Group();o.position.set(x,y,z);parent.add(o);if(animate)moving.add(o);return o;}
  function mesh(g,mat,parent=root){const o=new T.Mesh(g,typeof mat==='string'?m[mat]:mat);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function geo(key,fn){if(!cache.has(key))cache.set(key,fn());return cache.get(key);}
  function box(w,h,d,x,y,z,mat='ivory',parent=root,r=.025){
    r=Math.min(r,w/2,h/2,d/2);const g=geo(`b${w},${h},${d},${r}`,()=>{const g=new T.BoxGeometry(w,h,d,5,5,5),p=g.attributes.position,n=g.attributes.normal;
      for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i),a=new T.Vector3(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));const normal=v.clone().sub(a).normalize();v.copy(a).addScaledVector(normal,r);p.setXYZ(i,...v);n.setXYZ(i,...normal);}return g;});const o=mesh(g,mat,parent);o.position.set(x,y,z);return o;
  }
  function disk(r,h,x,y,z,mat='ivory',parent=root){const o=mesh(geo(`d${r},${h}`,()=>new T.CylinderGeometry(r,r,h,64)),mat,parent);o.position.set(x,y,z);return o;}
  function ring(r,t,x,y,z,mat='ivory',parent=root,flat=false){const o=mesh(geo(`r${r},${t}`,()=>new T.TorusGeometry(r,t,10,128)),mat,parent);o.position.set(x,y,z);if(flat)o.rotation.x=PI/2;return o;}
  function ball(r,x,y,z,mat='ivory',parent=root){const o=mesh(geo(`s${r}`,()=>new T.SphereGeometry(r,24,16)),mat,parent);o.position.set(x,y,z);return o;}
  function line(points,r=.008,mat='ivory',parent=root){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const o=mesh(new T.TubeGeometry(curve,Math.max(12,points.length*4),r,6,false),mat,parent);return {o,curve};}
  // A simple rounded slab: keep the original composition and generous negative space.
  box(5.2,.20,3.0,0,.10,0,'ivory',root,.07);
  const observatory=group(-1.22,.20,-.25);
  disk(.79,.10,0,.05,0,'ivory',observatory);disk(.70,.84,0,.51,0,'ivory',observatory);disk(.74,.08,0,.96,0,'red',observatory);
  disk(.77,.05,0,1.015,0,'ivory',observatory);
  // Shallow arched recesses read like cut paper, framed by an extruded ivory arch.
  function arch(width,height,depth,parent,mat){const r=width/2,shape=new T.Shape();shape.moveTo(-r,0);shape.lineTo(-r,height-r);shape.absarc(0,height-r,r,PI,0,true);shape.lineTo(r,0);shape.closePath();return mesh(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.012,curveSegments:24}),mat,parent);}
  const entry=group(0,.10,.69,observatory);arch(.43,.62,.025,entry,'shade');const inner=arch(.34,.56,.015,entry,'red');inner.position.set(.025,.018,.028);
  for(const x of [-.48,.48]){const g=group(x,.35,.515,observatory);g.rotation.y=x>0?.7:-.7;arch(.14,.29,.012,g,'shade');}
  for(let i=0;i<4;i++)box(.57,.045*(i+1),.17,0,.0225*(i+1),1.24-i*.15,'ivory',observatory,.012);
  const dome=group(0,1.04,0,observatory,true);
  // An open wedge exposes the red inner lining and telescope mount.
  const shell=mesh(new T.SphereGeometry(.69,64,32,3.2,TAU-1.25,0,PI/2),'ivory',dome);shell.material=m.ivory.clone();shell.material.side=T.DoubleSide;
  const lining=mesh(new T.SphereGeometry(.66,64,32,3.2,TAU-1.25,0,PI/2),'red',dome);lining.material=m.red.clone();lining.material.side=T.DoubleSide;
  for(let i=0;i<7;i++){const a=3.2+i*(TAU-1.25)/6,points=[];for(let j=0;j<=18;j++){const b=j/18*PI/2;points.push([-Math.cos(a)*Math.sin(b)*.697,Math.cos(b)*.697,Math.sin(a)*Math.sin(b)*.697]);}line(points,.009,'wood',dome);}
  box(.17,.52,.21,.20,1.19,.09,'ivory',observatory);
  const hinge=disk(.14,.22,.20,1.44,.09,'ivory',observatory);hinge.rotation.x=PI/2;
  const screw=disk(.075,.025,.20,1.44,.215,'blue',observatory);screw.rotation.x=PI/2;
  const telescope=group(.20,1.46,.09,observatory,true);
  disk(.135,.82,0,.26,0,'red',telescope);disk(.19,.34,0,.68,0,'red',telescope);
  for(const [y,r] of [[-.14,.15],[.27,.15],[.51,.20],[.86,.22]])disk(r,.045,0,y,0,'ivory',telescope);
  disk(.178,.015,0,.889,0,'lens',telescope);disk(.045,.19,0,-.25,0,'red',telescope);

  // Small sculpted lunar disks, supported on the same fine rods as the artwork.
  let seed=42;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const craterSeeds=Array.from({length:42},()=>{const y=random()*2-1,a=random()*TAU,s=Math.sqrt(1-y*y);return {v:new T.Vector3(Math.cos(a)*s,y,Math.sin(a)*s),r:.06+random()*.15};});
  const moons=[];
  function lunar(radius,x,y,z,phase=1,flat=false){
    const g=new T.SphereGeometry(radius,80,56),p=g.attributes.position,colors=[],cream=new T.Color(0xede0c5),blue=new T.Color(0x123d99);
    for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).normalize();let relief=0;
      for(const c of craterSeeds){const d=v.distanceTo(c.v)/c.r;if(d<1.3)relief+=c.r*(-.18*Math.max(0,1-d*d)+.055*Math.exp(-(((d-.96)/.16)**2)));}
      const rr=radius*(1+relief);p.setXYZ(i,v.x*rr,v.y*rr,v.z*rr*(flat?.30:1));const color=phase===1||v.x>phase?cream:blue;colors.push(color.r,color.g,color.b);
    }g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();
    const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.96,bumpMap:grain,bumpScale:.0012});const o=mesh(g,mat);o.position.set(x,y,z);moving.add(o);moons.push(o);
    disk(.009,y-.20,x,(y+.20)/2,z,'wood');return o;
  }
  lunar(.25,-2.01,2.20,-.66,.50,true);lunar(.29,-1.14,2.68,-.82,0,true);lunar(.31,-.13,2.94,-.90,0,true);lunar(.30,.85,2.79,-.85,-.35,true);
  const fullMoon=lunar(.49,1.87,2.48,-.73,1);
  const route=line([[-2.06,2.19,-.79],[-1.15,2.70,-1.02],[-.13,2.98,-1.05],[.89,2.82,-1.01],[1.89,2.50,-.91],[2.32,1.91,-.53],[1.55,1.50,.03],[.45,1.16,.30],[.60,.88,.48]],.021,'blue');
  const bead=ball(.065,0,0,0,'blue');moving.add(bead);

  // Keep the workbench as a paper chart, three tokens and a small calendar.
  const desk=group(1.08,.20,.52);
  box(1.94,.10,.83,0,.67,0,'paper',desk,.035);for(const x of [-.84,.84])box(.13,.62,.66,x,.31,0,'red',desk,.015);
  const chart=group(-.35,1.0,-.20,desk);chart.rotation.x=-.22;
  box(.94,.62,.035,0,0,0,'paper',chart,.012);
  for(let i=0;i<7;i++)box(.003,.51,.002,-.40+i*.133,0,.024,'grid',chart,.001);
  for(let i=0;i<5;i++)box(.80,.003,.002,0,-.25+i*.125,.024,'grid',chart,.001);
  const chartPoints=[[-.40,-.18,.04],[-.31,-.02,.04],[-.24,-.12,.04],[-.13,.11,.04],[-.04,-.01,.04],[.07,.09,.04],[.13,.02,.04],[.25,.21,.04],[.31,-.05,.04],[.40,.01,.04]];
  // Straight line segments retain the handmade zigzag of the original chart.
  for(let i=0;i<chartPoints.length-1;i++)line([chartPoints[i],chartPoints[i+1]],.012,'blue',chart);
  const chartDot=ball(.022,0,0,0,'red',chart);moving.add(chartDot);
  for(let i=0;i<3;i++)disk(.095,.025,.08+i*.22,.74,.18,['red','blue','ivory'][i],desk);
  const calendar=group(.69,.93,-.13,desk);calendar.rotation.x=-.15;
  box(.32,.42,.045,0,0,0,'red',calendar,.012);box(.29,.38,.015,0,.005,.032,'paper',calendar,.006);
  for(const x of [-.095,0,.095]){const o=ring(.028,.009,x,.211,.01,'ivory',calendar);o.rotation.y=PI/2;}
  for(let i=0;i<3;i++)box(.18,.009,.006,0,.07-i*.075,.045,'grid',calendar,.002);
  disk(.47,.009,1.04,.208,1.04,'blue');disk(.21,.35,1.04,.38,1.04,'red');disk(.225,.055,1.04,.58,1.04,'ivory');

  // Low-poly paper hills frame the slab without adding a new visual story.
  function rock(x,z,w,h,mat='ivory'){const o=mesh(new T.ConeGeometry(w,h,5,1),mat);o.position.set(x,.20+h/2,z);o.rotation.y=x*1.7;o.scale.z=.8;return o;}
  for(const [x,z,w,h,mat] of [[-2.18,.74,.28,.43,'ivory'],[-2.21,.1,.31,.64,'red'],[-1.98,-1.08,.34,.49,'ivory'],[-.59,-1.1,.33,.57,'ivory'],[.02,-1.04,.31,.73,'ivory'],[.39,-.94,.22,.42,'red'],[1.37,-1.03,.32,.52,'ivory'],[2.10,-.90,.29,.66,'red'],[2.25,.75,.28,.37,'ivory'],[2.20,1.16,.20,.33,'red'],[-1.75,1.12,.19,.31,'ivory']])rock(x,z,w,h,mat);

  // Soft local contact shadows avoid a large display turntable.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(55,34,12,.28)');gradient.addColorStop(.40,'rgba(55,34,12,.18)');gradient.addColorStop(1,'rgba(55,34,12,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadowMap=new T.CanvasTexture(shadowCanvas),shadowMat=new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false});
  for(const [x,z,w,d] of [[-1.22,-.25,2.2,1.9],[1.08,.52,2.5,1.4],[1.04,1.04,.65,.65]]){const o=mesh(new T.PlaneGeometry(w,d),shadowMat);o.position.set(x,.205,z);o.rotation.x=-PI/2;o.userData.noShadow=true;}

  // Keep animated subtrees independent; combine static surfaces by material.
  root.updateMatrixWorld(true);const staticMeshes=[],batches=new Map(),removed=new Set();
  root.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent)if(moving.has(p))return;staticMeshes.push(o);});
  for(const o of staticMeshes){const key=o.material.uuid+!!o.userData.noShadow;if(!batches.has(key))batches.set(key,{mat:o.material,noShadow:o.userData.noShadow,p:[],n:[],uv:[]});const b=batches.get(key),g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);for(const value of g.attributes.position.array)b.p.push(value);for(const value of g.attributes.normal.array)b.n.push(value);for(const value of g.attributes.uv.array)b.uv.push(value);g.dispose();removed.add(o.geometry);o.removeFromParent();}
  for(const b of batches.values()){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();const o=mesh(g,b.mat);o.userData.noShadow=b.noShadow;}
  root.traverse(o=>{if(o.geometry)removed.delete(o.geometry);if(o.userData.noShadow)o.castShadow=o.receiveShadow=false;});removed.forEach(g=>g.dispose());
  const framingPoints=[];for(const x of [-2.6,2.6])for(const z of [-1.5,1.5])for(const y of [0,.2])framingPoints.push(new T.Vector3(x,y,z));
  for(const o of moons){for(let i=0;i<24;i++){const a=i*TAU/24,r=o===fullMoon?.52:.33;framingPoints.push(o.position.clone().add(new T.Vector3(Math.cos(a)*r,Math.sin(a)*r,0)));}}
  Object.assign(root.userData,{artifactId:42,conceptual:true,studioProfile:'astrodegen',displayBase:false,contactFootprint:false,groundLevel:0,initialYaw:-.30,initialElevation:.28,autoOrbit:false,framingPoints,animationDuration:24,realTimeAnimation:true,
    animate(time){const t=((Number.isFinite(time)?time:0)%24+24)%24,a=t*TAU/24;
      telescope.rotation.z=-.91+Math.sin(a)*.055;telescope.rotation.x=.16+Math.sin(a)*.025;dome.rotation.y=Math.sin(a)*.025;
      moons.forEach((o,i)=>{o.rotation.y=Math.sin(a+i*.4)*.045;});fullMoon.rotation.y=a;
      bead.position.copy(route.curve.getPoint(t/24));
      const index=t/24*(chartPoints.length-1),i=Math.min(chartPoints.length-2,Math.floor(index));chartDot.position.fromArray(chartPoints[i]).lerp(new T.Vector3(...chartPoints[i+1]),index-i);chartDot.position.z=.06;
    }});root.userData.animate(0);return root;
}
