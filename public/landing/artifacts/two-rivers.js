// Two Rivers, One Future — concept reconstructed from the creator's submission:
// instagram.com/reel/DOQFqH8kfeT/ (not a built park or a literal site plan).
export function createArtifact(T) {
  const root = new T.Group(), fixed = new T.Group(); root.add(fixed);
  let seed = 40;
  const rand = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  function grain() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d'), data = ctx.createImageData(256, 256);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = 210 + rand() * 40; data.data[i] = data.data[i + 1] = data.data[i + 2] = v; data.data[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    const map = new T.CanvasTexture(c); map.wrapS = map.wrapT = T.RepeatWrapping; map.repeat.set(3, 3); return map;
  }
  const texture = grain();
  const mat = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: .75, ...extra });
  const m = {
    stone: mat(0xd1c5a1, { bumpMap: texture, bumpScale: .028 }),
    rim: mat(0x8e8165), sand: mat(0xe2d6b4, { bumpMap: texture, bumpScale: .018 }),
    grass: mat(0x517257, { bumpMap: texture, bumpScale: .025 }),
    leaf: mat(0x2b6351), lightLeaf: mat(0x69915d), darkLeaf: mat(0x174c43),
    brass: mat(0xb79556, { metalness: .55, roughness: .32 }),
    wood: mat(0x825334, { bumpMap: texture, bumpScale: .025 }), bamboo: mat(0xd2b47c),
    roof: mat(0x594333), red: mat(0xba4934, { roughness: .35 }),
    water: mat(0x117c84, { metalness: .48, roughness: .24, emissive: 0x126b73, emissiveIntensity: .22 }),
    foam: mat(0x91e0d4, { emissive: 0x51bcb6, emissiveIntensity: .35 }),
    light: mat(0xffdc86, { emissive: 0xffba4e, emissiveIntensity: 1.2 }),
    ink: mat(0x172d31), cream: mat(0xf3e7cb), solar: mat(0x163e58, { metalness: .6, roughness: .25 }),
  };
  const mesh = (geo, material, parent = fixed) => {
    const o = new T.Mesh(geo, typeof material === 'string' ? m[material] : material);
    o.castShadow = o.receiveShadow = true; parent.add(o); return o;
  };
  const group = (x, y, z, parent = fixed) => { const g = new T.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const box = (w, h, d, x, y, z, material, parent) => { const o = mesh(new T.BoxGeometry(w, h, d), material, parent); o.position.set(x, y, z); return o; };
  const ball = (r, x, y, z, material, parent) => { const o = mesh(new T.IcosahedronGeometry(r, 2), material, parent); o.position.set(x, y, z); return o; };
  const cylinder = (r1, r2, h, x, y, z, material, parent) => { const o = mesh(new T.CylinderGeometry(r1, r2, h, 32), material, parent); o.position.set(x, y, z); return o; };
  const curve = points => new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
  const pipe = (path, radius, material, parent = fixed, segments = 64) => mesh(new T.TubeGeometry(path, segments, radius, 6, false), material, parent);
  function beam(a, b, r, material, parent = fixed) {
    const start = new T.Vector3(...a), end = new T.Vector3(...b), direction = end.clone().sub(start);
    const o = mesh(new T.CylinderGeometry(r, r, direction.length(), 8), material, parent);
    o.position.copy(start.add(end).multiplyScalar(.5)); o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction.normalize()); return o;
  }
  function ring(radius, x, y, z, material, parent = fixed, thickness = .018) {
    const o = mesh(new T.TorusGeometry(radius, thickness, 6, 72), material, parent); o.rotation.x = Math.PI / 2; o.position.set(x, y, z); return o;
  }
  function ribbon(path, width, material, parent = fixed, steps = 96) {
    const positions = [], uv = [], indices = [];
    for (let i = 0; i <= steps; i++) {
      const p = path.getPoint(i / steps), tangent = path.getTangent(i / steps), normal = new T.Vector3(-tangent.z, 0, tangent.x).normalize();
      const w = typeof width === 'function' ? width(i / steps) : width;
      for (const side of [-1, 1]) { const v = p.clone().addScaledVector(normal, side * w / 2); positions.push(v.x, v.y, v.z); uv.push((side + 1) / 2, i / steps * 3); }
      if (i < steps) { const n = i * 2; indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); }
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(indices); g.computeVertexNormals();
    return mesh(g, material, parent);
  }
  function label(text, w, h, x, y, z, parent = fixed, color = '#ebd7a6', size = 60) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
    const ctx = c.getContext('2d'); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${size}px Georgia`; ctx.fillText(text, 512, 128, 970);
    const map = new T.CanvasTexture(c); map.colorSpace = T.SRGBColorSpace;
    const o = mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map, transparent: true, depthWrite: false }), parent); o.position.set(x, y, z); o.castShadow = false; o.userData.noShadow = true; return o;
  }

  // A layered architectural model, with the river inlaid into the upper terrain.
  for (const [r, h, y, material] of [[3.65, .16, .08, 'rim'], [3.62, .22, .25, 'stone'], [3.55, .055, .386, 'sand']]) {
    const base = cylinder(r, r, h, 0, y, 0, material); base.scale.z = .69;
  }
  const edging = ring(3.61, 0, .34, 0, 'brass'); edging.scale.y = .69;
  const riverPaths = [
    curve([[-2.88,.425,-1.25],[-2.1,.425,-1.45],[-1.42,.425,-.7],[-1.13,.425,.4],[0,.425,1.03]]),
    curve([[2.85,.427,-1.13],[2.05,.427,-1.45],[1.25,.427,-.7],[1.15,.427,.25],[0,.427,1.03]]),
    curve([[0,.43,1.03],[.1,.43,1.52],[-.16,.43,1.95],[-.25,.43,2.34]]),
  ];
  riverPaths.forEach((path, i) => ribbon(path, i === 2 ? t => 1.1 + .22 * t : .72, 'water'));
  const waterCanvas=document.createElement('canvas');waterCanvas.width=waterCanvas.height=512;
  const wc=waterCanvas.getContext('2d');wc.fillStyle='#70c3be';wc.fillRect(0,0,512,512);
  for(let i=0;i<1200;i++){const x=rand()*512,y=rand()*512;wc.strokeStyle=`rgba(215,255,237,${.04+rand()*.18})`;wc.lineWidth=.5+rand();wc.beginPath();wc.ellipse(x,y,3+rand()*12,1+rand()*2,-.2,0,Math.PI);wc.stroke();}
  const waterMap=new T.CanvasTexture(waterCanvas);waterMap.colorSpace=T.SRGBColorSpace;waterMap.wrapS=waterMap.wrapT=T.RepeatWrapping;waterMap.repeat.set(2,2);m.water.map=waterMap;m.water.color.setHex(0x237e8a);m.water.roughness=.3;
  // Thin winding highlights read as water rather than opaque plastic tubing.
  for (const path of riverPaths) {
    for (const offset of [-.17,.16]) {
      const line = new T.CatmullRomCurve3(Array.from({length:49}, (_,i) => { const p=path.getPoint(i/48), d=path.getTangent(i/48);return p.add(new T.Vector3(-d.z*.065+offset,.009,d.x*.065)); }));
      pipe(line,.006,'foam');
    }
  }
  // Island planting beds leave clear sight lines to the two tributaries.
  for (const [x,z,r] of [[-.2,-.65,1.05],[-2.45,.25,.65],[2.05,.15,.91],[-2.1,-1.55,.55],[1.7,-1.7,.5]]) {
    const bed=cylinder(r,r,.025,x,.425,z,'grass');bed.scale.z=.73;
  }

  // Sarawakian Tree of Life: branching lattice, stacked gardens, lit canopy rim.
  const tree = group(-.18,.44,-.65);
  cylinder(.09,.18,2.8,0,1.4,0,'brass',tree);
  for (let i=0;i<12;i++) {
    const a=i*Math.PI*2/12;
    pipe(curve([[Math.cos(a)*.34,0,Math.sin(a)*.34],[Math.cos(a+.1)*.16,1.2,Math.sin(a+.1)*.16],[Math.cos(a)*.48,2.55,Math.sin(a)*.48],[Math.cos(a)*1.03,3.06,Math.sin(a)*1.03]]),.034,'brass',tree,28);
  }
  const crowns = [[1.94,.81,.74,.12],[2.38,.95,-.73,.06],[3.15,1.15,0,-.1]];
  for (let level=0;level<crowns.length;level++) {
    const [y,r,cx,cz]=crowns[level], crown=group(cx,0,cz,tree);
    const canopy=mesh(new T.SphereGeometry(r,40,16,0,Math.PI*2,0,Math.PI/2),'darkLeaf',crown);canopy.position.y=y;canopy.scale.y=.11;
    cylinder(r,r,.035,0,y,0,'grass',crown);ring(r,0,y-.03,0,'brass',crown,.022);
    for(let i=0;i<16;i++) {
      const a=i*Math.PI*2/16;
      pipe(curve([[-cx,.3,-cz],[-cx*.65,y-.8,-cz*.65],[Math.cos(a)*r*.45,y-.2,Math.sin(a)*r*.45],[Math.cos(a)*r,y-.02,Math.sin(a)*r]]),.018,'brass',crown,24);
      ball(.018,Math.cos(a)*r,y+.035,Math.sin(a)*r,'light',crown);
      if(i%2===0){const vine=curve([[Math.cos(a)*r,y+.03,Math.sin(a)*r],[Math.cos(a)*r*1.03,y-.16,Math.sin(a)*r*1.03],[Math.cos(a)*r,y-.28-rand()*.16,Math.sin(a)*r]]);pipe(vine,.012,'leaf',crown,10);}
    }
    for(let i=0;i<220;i++) {
      const a=rand()*Math.PI*2, rad=Math.sqrt(rand())*r*.96;
      const leaf=mesh(new T.IcosahedronGeometry(.04+rand()*.065,1),i%3===0?'lightLeaf':'leaf',crown);
      leaf.position.set(Math.cos(a)*rad,y+.05+.13*Math.sqrt(1-rad*rad/(r*r)),Math.sin(a)*rad);leaf.scale.y=.85;
    }
  }
  // A spiral footpath wraps the central trunk below the planted crowns.
  const spiral=curve(Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2;return [.48*Math.cos(a),.18+i/64*1.2,.48*Math.sin(a)];}));
  ribbon(spiral,.18,'bamboo',tree,96);
  const spiralRail=curve(Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2;return [.57*Math.cos(a),.34+i/64*1.2,.57*Math.sin(a)];}));pipe(spiralRail,.012,'brass',tree);
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2,y=.18+i/24*1.2;beam([.57*Math.cos(a),y,.57*Math.sin(a)],[.57*Math.cos(a),y+.17,.57*Math.sin(a)],.008,'brass',tree);}

  function rainforest(x,z,h) {
    cylinder(.025,.045,h*.65,x,.44+h*.325,z,'wood');
    for(let i=0;i<18;i++) {
      const a=i*2.4, r=h*(.05+rand()*.2);
      const foliage=mesh(new T.IcosahedronGeometry(h*(.08+rand()*.09),1),i%3?'leaf':'lightLeaf');foliage.position.set(x+Math.cos(a)*r,.44+h*.7+rand()*h*.3,z+Math.sin(a)*r);foliage.scale.y=.85;
    }
  }
  [[-2.9,-.55,.82],[-2.7,-1.1,.9],[-2.2,-1.85,.85],[-1.55,-1.9,1],[-.95,-1.9,.73],[.9,-1.85,.8],[1.45,-1.8,.67],[2.72,-.7,.65],[2.95,-.13,.72],[-3,.4,.64]].forEach(p=>rainforest(...p));
  // Rocky, planted banks and small palms soften the architectural geometry.
  riverPaths.forEach((path,index)=>{
    for(let i=1;i<34;i++)for(const side of [-1,1]){
      const t=i/34,p=path.getPoint(t),d=path.getTangent(t),n=new T.Vector3(-d.z,0,d.x).normalize();p.addScaledVector(n,side*(index===2?.69:.44));
      if(p.x*p.x/12+p.z*p.z/5.5>.92)continue;
      const rock=mesh(new T.IcosahedronGeometry(.055+rand()*.08,1),'rim');rock.position.set(p.x,.45,p.z);rock.scale.set(1,.8+rand(),.8);
      if(i%2===0){const shrub=mesh(new T.IcosahedronGeometry(.07+rand()*.055,1),i%4?'leaf':'lightLeaf');shrub.position.set(p.x+n.x*side*.1,.5,p.z+n.z*side*.1);}
    }
  });
  function palm(x,z,h){
    const g=group(x,.44,z);pipe(curve([[0,0,0],[.05,h*.5,0],[.02,h,0]]),.025,'wood',g,12);
    for(let j=0;j<7;j++){
      const a=j/7*Math.PI*2;
      const frond=curve([[.02,h,0],[Math.cos(a)*.18,h+.12,Math.sin(a)*.18],[Math.cos(a)*.4,h-.08,Math.sin(a)*.4]]);pipe(frond,.009,'bamboo',g,16);
      for(let k=2;k<9;k++){const p=frond.getPoint(k/9);for(const s of [-1,1]){const leaf=mesh(new T.SphereGeometry(.1,8,4),'leaf',g);leaf.position.copy(p);leaf.scale.set(.28,.1,1);leaf.rotation.y=-a+s*.5;}}
    }
  }
  [[-2.85,.95,.7],[-1.5,-1.72,.9],[.8,-1.9,.95],[2.8,.6,.68],[1.32,1.05,.7],[-1.35,1.2,.65]].forEach(p=>palm(...p));
  const waterSamples=riverPaths.flatMap(path=>Array.from({length:50},(_,i)=>path.getPoint(i/49)));
  for(let i=0;i<320;i++){
    const x=(rand()-.5)*6.7,z=(rand()-.5)*4.3;
    if(x*x/11.2+z*z/4.62>.94||waterSamples.some(p=>Math.hypot(p.x-x,p.z-z)<(p.z>1?.82:.49)))continue;
    if(Math.abs(x+2.32)<.73&&Math.abs(z-.34)<.8||Math.abs(x-2.1)<.64&&Math.abs(z-1.13)<.48)continue;
    const shrub=mesh(new T.IcosahedronGeometry(.07+rand()*.12,1),i%3?'darkLeaf':'lightLeaf');shrub.position.set(x,.47+rand()*.04,z);shrub.scale.y=.7;
    if(i%13===0)palm(x,z,.5+rand()*.35);
  }

  // Heritage pavilion: timber stilts, slatted walls, double pitched roof and steps.
  const house=group(-2.32,.44,.34);house.rotation.y=.15;
  for(const x of [-.46,.46])for(const z of [-.29,.29])cylinder(.024,.026,.31,x,.15,z,'wood',house);
  box(1.12,.055,.79,0,.32,0,'bamboo',house);box(.95,.52,.61,0,.59,0,'wood',house);
  for(let i=0;i<14;i++)box(.018,.46,.018,-.43+i*.066,.59,.315,'bamboo',house);
  for(const x of [-.29,.29]){box(.18,.24,.025,x,.62,.33,'ink',house);box(.025,.25,.03,x,.62,.347,'bamboo',house);}
  box(.15,.35,.026,0,.53,.335,'ink',house);
  for(const side of [-1,1]){const roof=box(.7,.045,.9,side*.27,.99,0,'roof',house);roof.rotation.z=-side*.52;
    for(let i=0;i<14;i++){const slat=box(.69,.014,.015,side*.27,1.017,-.42+i*.065,'bamboo',house);slat.rotation.z=-side*.52;}}
  beam([-.62,1.17,0],[.62,1.17,0],.018,'brass',house);
  for(let i=0;i<4;i++)box(.35,.07,.12,0,.07+i*.07,.72-i*.1,'wood',house);
  // Elevated canopy walk connects rainforest and the living tower.
  const walk=curve([[-2.3,.87,-.35],[-2.05,1.08,-.9],[-1.55,1.13,-1.1],[-.95,1.16,-.75],[-.5,1.12,-.6]]);
  ribbon(walk,.25,'bamboo');
  for(const sign of [-1,1]){
    const rail=[];
    for(let i=0;i<=40;i++) {const p=walk.getPoint(i/40),t=walk.getTangent(i/40),n=new T.Vector3(-t.z,0,t.x).normalize();p.addScaledVector(n,sign*.13);rail.push([p.x,p.y+.19,p.z]);if(i%3===0)beam([p.x,p.y,p.z],[p.x,p.y+.19,p.z],.009,'brass');}
    pipe(curve(rail),.011,'brass');
  }
  for(let i=0;i<=12;i++){const p=walk.getPoint(i/12);beam([p.x,.45,p.z],[p.x,p.y,p.z],.018,'wood');}

  // Bamboo coaster: continuous twin rails, real cross-ties and trestles.
  const track=new T.CatmullRomCurve3(Array.from({length:32},(_,i)=>{const a=i/32*Math.PI*2;return new T.Vector3(1.95+Math.cos(a)*.93,.94+Math.sin(a*2)*.27+Math.cos(a)*.16,-.1+Math.sin(a)*.76);}),true);
  for(const side of [-1,1]) {
    const points=Array.from({length:129},(_,i)=>{const p=track.getPoint(i/128),t=track.getTangent(i/128);return p.add(new T.Vector3(-t.z,0,t.x).normalize().multiplyScalar(side*.095));});
    pipe(new T.CatmullRomCurve3(points),.026,'bamboo');
  }
  for(let i=0;i<84;i++){
    const p=track.getPoint(i/84),t=track.getTangent(i/84),n=new T.Vector3(-t.z,0,t.x).normalize().multiplyScalar(.14);
    beam(p.clone().sub(n).toArray(),p.clone().add(n).toArray(),.014,'wood');
    if(i%6===0){for(const side of [-1,1])beam([p.x+n.x*side,.44,p.z+n.z*side],[p.x+n.x*side,p.y,p.z+n.z*side],.018,'wood');beam([p.x-n.x,.44,p.z-n.z],[p.x+n.x,p.y,p.z+n.z],.013,'bamboo');}
  }
  // Solar station to the front right, with legible individual photovoltaic cells.
  const solar=group(2.1,.44,1.13);
  box(.94,.06,.62,0,.03,0,'wood',solar);
  for(const x of [-.36,.36])for(const z of [-.23,.23])beam([x,.05,z],[x,.5,z],.022,'bamboo',solar);
  const roof=group(0,.54,0,solar);roof.rotation.x=.18;box(1.05,.04,.72,0,0,0,'cream',roof);
  for(let r=0;r<3;r++)for(let c=0;c<5;c++)box(.18,.012,.19,-.4+c*.2,.029,-.22+r*.22,'solar',roof);
  for(const x of [-.22,.22])box(.25,.1,.18,x,.11,0,'red',solar);

  // Little details establish the scale without covering the water.
  for(const [x,z] of [[-1.58,.75],[-1.8,1.15],[-1.45,1.55],[.8,1.5],[1.25,1.42],[2.85,.85],[-2.85,.85]]){
    cylinder(.012,.016,.2,x,.54,z,'brass');ball(.035,x,.67,z,'light');
  }
  for(const [x,z,c] of [[-1.8,.8,'red'],[-1.65,.85,'cream'],[-.7,.35,'cream'],[-.55,.32,'red'],[1.1,1.4,'cream'],[1.25,1.46,'red'],[2.7,.8,'cream']]) {
    cylinder(.024,.033,.12,x,.51,z,c);ball(.026,x,.6,z,'bamboo');
  }
  box(2.22,.25,.065,-.15,.25,2.52,'ink');label('TWO RIVERS, ONE FUTURE',2.1,.23,-.15,.25,2.558);

  // Animated boats travel both tributaries and converge on the same river.
  function boat() {
    const g=group(0,0,0,root);
    const hull=mesh(new T.SphereGeometry(.15,20,12),'red',g);hull.scale.set(.67,.46,1.9);
    box(.15,.045,.31,0,.045,0,'cream',g);
    for(const z of [-.1,.04])box(.14,.03,.04,0,.08,z,'wood',g);
    for(const x of [-.07,.07])for(const z of [-.14,.14])beam([x,.06,z],[x,.2,z],.006,'brass',g);
    box(.2,.022,.37,0,.21,0,'red',g);
    ball(.026,0,.13,.03,'bamboo',g);box(.04,.065,.04,0,.09,.03,'ink',g);
    for(const side of [-1,1])pipe(curve([[side*.11,-.02,.15],[side*.15,-.02,.28],[side*.2,-.02,.39]]),.006,'foam',g,12);
    return g;
  }
  const boats=[boat(),boat()];
  const trains=Array.from({length:3},()=>{const g=group(0,0,0,root);box(.14,.07,.17,0,.045,0,'red',g);box(.1,.03,.12,0,.09,0,'cream',g);for(const x of [-.075,.075])for(const z of [-.045,.045])ball(.022,x,.005,z,'ink',g);return g;});
  // Constellation-like lights suggest the proposal's evening drone show.
  const lights=group(-.18,.44,-.65,root);
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2;ball(.013,Math.cos(a)*1.5,3.4+Math.sin(a*3)*.06,Math.sin(a)*1.5,'light',lights);}

  // Batch all static pieces by material for a lightweight mobile exhibit.
  fixed.updateMatrixWorld(true);
  const batches=new Map(),oldGeometries=new Set();
  fixed.traverse(o=>{
    if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);oldGeometries.add(o.geometry);
    if(!batches.has(o.material))batches.set(o.material,{p:[],n:[],uv:[],shadow:o.castShadow});const b=batches.get(o.material);
    b.p.push(...g.attributes.position.array);b.n.push(...g.attributes.normal.array);
    if(g.attributes.uv)b.uv.push(...g.attributes.uv.array);else for(let i=0;i<g.attributes.position.count;i++)b.uv.push(0,0);
    g.dispose();
  });
  fixed.clear();oldGeometries.forEach(g=>g.dispose());
  for(const [material,b] of batches){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();const o=mesh(g,material);o.castShadow=b.shadow;if(!b.shadow)o.userData.noShadow=true;}
  root.updateMatrixWorld(true);
  const framingPoints=[];
  root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=12)framingPoints.push(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));});
  Object.assign(root.userData,{artifactId:40,conceptual:true,displayBase:false,studioProfile:'two-rivers',groundLevel:0,initialYaw:-.16,initialElevation:.43,autoOrbit:false,framingPoints});
  root.userData.animate=time=>{
    boats.forEach((g,i)=>{
      const phase=(time*.045+i*.45)%1, branch=phase<.7?i:2, t=phase<.7?phase/.7:(phase-.7)/.3;
      const path=riverPaths[branch],p=path.getPoint(t),d=path.getTangent(t);g.position.copy(p);g.position.y+=.04+Math.sin(time*2+i)*.006;g.rotation.y=Math.atan2(d.x,d.z);
    });
    trains.forEach((g,i)=>{const t=(time*.045-i*.024+1)%1,p=track.getPoint(t),d=track.getTangent(t);g.position.copy(p);g.position.y+=.04;g.rotation.y=Math.atan2(d.x,d.z);g.rotation.x=-Math.asin(d.y);});
    lights.rotation.y=time*.035;
  };
  root.userData.setTheme=theme=>{m.light.emissiveIntensity=theme==='dark'?1.6:.6;m.water.emissiveIntensity=theme==='dark'?.24:.07;};
  root.userData.animate(0);return root;
}
