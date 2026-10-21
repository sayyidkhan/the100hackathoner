// A tabletop food sculpture: all relief is geometry, including the exposed soybeans.
// Seeded textures and instanced kernels keep the exhibit deterministic and inexpensive.
export function createArtifact(T) {
  const root = new T.Group();
  let seed = 47047;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = grainCanvas.height = 256;
  const ctx = grainCanvas.getContext('2d'), pixels = ctx.createImageData(256, 256);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const v = 110 + random() * 145;
    pixels.data.set([v, v, v, 255], i);
  }
  ctx.putImageData(pixels, 0, 0);
  const grain = new T.CanvasTexture(grainCanvas);
  grain.wrapS = grain.wrapT = T.RepeatWrapping;
  const material = (color, roughness = .65, extra = {}) => new T.MeshStandardMaterial({ color, roughness, ...extra });
  const m = {
    cake: material(0xc88a32, .72, { bumpMap: grain, bumpScale: .018 }),
    bean: material(0xe4ac51, .65, { bumpMap: grain, bumpScale: .009 }),
    kernel: material(0xffffff, .68, { bumpMap: grain, bumpScale: .009 }),
    crust: material(0x9b5b1c, .76, { bumpMap: grain, bumpScale: .012 }),
    ceramic: material(0xf4e6cf, .26, { metalness: .04 }),
    red: material(0xb62313, .72, { bumpMap: grain, bumpScale: .009 }),
    redInside: material(0x76180b, .87),
    paper: material(0xefdab6, .94, { side: T.DoubleSide, bumpMap: grain, bumpScale: .008 }),
    label: material(0xffe7bc, .81),
    print: material(0xb68b58, .8),
    brass: material(0xb98a3c, .3, { metalness: .75 }),
    board: material(0x745033, .87),
    blue: material(0x132d71, .22, { metalness: .08 }),
    stone: material(0x302b24, .93, { bumpMap: grain, bumpScale: .04 }),
    cloth: material(0xe7dac0, 1, { side: T.DoubleSide, bumpMap: grain, bumpScale: .021 }),
    stripe: material(0xa84632, 1, { side: T.DoubleSide, bumpMap: grain, bumpScale: .012 }),
    leaf: material(0x456523, .64, { side: T.DoubleSide }),
    vein: material(0x819044, .8),
  };
  function group(x = 0, y = 0, z = 0, yaw = 0, parent = root) {
    const g = new T.Group(); g.position.set(x, y, z); g.rotation.y = yaw; parent.add(g); return g;
  }
  function mesh(geometry, mat, parent = root) {
    const o = new T.Mesh(geometry, m[mat]); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
  }
  function outline(w, d, r) {
    const s = new T.Shape(), x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function extrude(shape, height, bevel = .025) {
    const g = new T.ExtrudeGeometry(shape, { depth: height - 2 * bevel, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 16, steps: 1 });
    g.rotateX(-Math.PI / 2); g.translate(0, bevel, 0); return g;
  }
  function slab(w, h, d, x, y, z, mat, parent = root, r = .04, bevel = .015) {
    const o = mesh(extrude(outline(w - 2 * bevel, d - 2 * bevel, Math.min(r, d / 4, w / 4)), h, Math.min(bevel, h / 3)), mat, parent);
    o.position.set(x, y, z); return o;
  }
  function cylinder(r, h, x, y, z, mat, parent = root) {
    const o = mesh(new T.CylinderGeometry(r, r, h, 40), mat, parent); o.position.set(x, y, z); return o;
  }
  function tube(points, radius, mat, parent = root) {
    return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), 24, radius, 7, false), mat, parent);
  }
  const kernels = [];
  function bean(x, y, z, sx, sy, sz, parent = root, rotation = 0, whole = false) {
    kernels.push({ x, y, z, sx, sy, sz, parent, rotation, whole, tint: .76 + random() * .36 });
  }
  // Dense, irregular cut soybean mosaic; ellipsoids sit mostly inside the cake.
  function mosaic(w, d, h, parent, holes = []) {
    const step = .105;
    for (let row = 0; row < Math.floor(d / step); row++) {
      const z = -d / 2 + .055 + row * step;
      for (let col = 0; col < Math.floor(w / step); col++) {
        const x = -w / 2 + .055 + col * step + (row % 2) * .025;
        if (holes.some(([cx, cz, r]) => Math.hypot(x - cx, z - cz) < r + .025)) continue;
        bean(x + (random() - .5) * .045, h - .009, z + (random() - .5) * .045, .049 + random() * .022, .021 + random() * .012, .035 + random() * .017, parent, random() * Math.PI);
      }
    }
    for (let row = 0; row < Math.max(1, Math.floor(h / .09)); row++) {
      const y = .045 + row * .085;
      for (const sign of [-1, 1]) {
        for (let x = -w / 2 + .07; x < w / 2 - .02; x += .115) bean(x + (random()-.5)*.025, y + (random()-.5)*.025, sign * (d / 2 - .008), .05+random()*.013, .03+random()*.013, .023, parent, (random()-.5) * .6);
        for (let z = -d / 2 + .06; z < d / 2 - .03; z += .11) bean(sign * (w / 2 - .008), y + (random()-.5)*.025, z + (random()-.5)*.025, .026, .03+random()*.012, .046+random()*.014, parent, (random()-.5) * .6);
      }
    }
  }
  function cake(w, h, d, x, y, z, parent = root, yaw = 0) {
    const g = group(x, y, z, yaw, parent); slab(w, h, d, 0, 0, 0, 'cake', g, .045, .018); mosaic(w, d, h, g); return g;
  }
  // Rectangular basalt serving board replaces the unrelated circular museum plinth.
  slab(6.65, .18, 4.55, 0, 0, 0, 'stone', root, .23, .035);
  // A real shallow ceramic basin: continuous rising walls, round corners and rolled lip.
  const tray = group(-.39, .19, .42, -.025);
  slab(5.15, .115, 3.32, 0, 0, 0, 'ceramic', tray, .36, .045);
  const rimShape = outline(5.28, 3.45, .4);
  const hole = outline(4.96, 3.13, .31); rimShape.holes.push(new T.Path(hole.getPoints(24).reverse()));
  mesh(extrude(rimShape, .18, .04), 'ceramic', tray).position.y = .075;
  // Twin fan GPU, including actual openings, deep toasted wells and swept blades.
  const gpu = group(-1.45, .34, .92, -.06);
  const shell = outline(2.37, 1.13, .11);
  for (const x of [-.61, .61]) { const h = new T.Path(); h.absarc(x, 0, .45, 0, Math.PI * 2, true); shell.holes.push(h); }
  mesh(extrude(shell, .28, .025), 'cake', gpu);
  mosaic(2.42, 1.18, .28, gpu, [[-.61, 0, .45], [.61, 0, .45]]);
  for (const x of [-.61, .61]) {
    cylinder(.445, .045, x, .085, 0, 'crust', gpu);
    for (let j = 0; j < 7; j++) {
      const s = new T.Shape(); s.moveTo(.11, -.025);
      s.bezierCurveTo(.18, -.12, .33, -.19, .405, -.12);
      s.bezierCurveTo(.43, -.055, .34, .03, .26, .06);
      s.quadraticCurveTo(.17, .07, .11, .025); s.closePath();
      const geometry = extrude(s, .045, .012), positions = geometry.attributes.position;
      for (let k = 0; k < positions.count; k++) {
        const bx = positions.getX(k), bz = positions.getZ(k);
        positions.setY(k, positions.getY(k) + .065 * Math.sin((bx - .1) / .32 * Math.PI) + bz * .28);
      }
      geometry.computeVertexNormals();
      const blade = mesh(geometry, 'cake', gpu); blade.position.set(x, .16, 0); blade.rotation.y = j * Math.PI * 2 / 7;
    }
    cylinder(.145, .09, x, .239, 0, 'cake', gpu);
    for (let j = 0; j < 7; j++) { const a = j * 2.4; bean(x + Math.cos(a) * .085, .288, Math.sin(a) * .085, .049, .019, .037, gpu, a); }
  }
  cake(.12, .4, 1.25, -1.26, -.055, 0, gpu);
  slab(1.14, .055, .16, .12, .015, .65, 'crust', gpu);
  for (let i = 0; i < 30; i++) slab(.024, .05, .18, -.42 + i * .038, .031, .66, 'bean', gpu, .006, .004);
  // RAM: six raised memory packages and the full comb of golden contact fingers.
  const ram = cake(2.68, .13, .53, -1.42, .34, -.18, root, -.11);
  for (let i = 0; i < 6; i++) cake(.31, .09, .32, -1.08 + i * .43, .145, -.02, ram);
  for (let i = 0; i < 59; i++) slab(.026, .047, .11, -1.27 + i * .043, .08, .27, 'bean', ram, .004, .003);
  // Motherboard: socket, stacked PCI slots, RAM channels, capacitors and IO blocks.
  const mb = cake(1.88, .145, 2.12, .86, .34, .59, root, .06);
  cake(.69, .075, .70, -.12, .162, -.29, mb);
  cake(.57, .075, .57, -.12, .244, -.29, mb);
  for (let i = 0; i < 4; i++) {
    cake(.065, .16, 1.18, .47 + i * .115, .16, -.04, mb);
    slab(.018, .025, 1.06, .47 + i * .115, .327, -.04, 'crust', mb, .003, .003);
    for (const z of [-.64, .55]) slab(.094, .07, .055, .47 + i * .115, .25, z, 'bean', mb);
  }
  for (let i = 0; i < 3; i++) {
    cake(.92, .115, .105, -.25, .16, .48 + i * .19, mb);
    slab(.82, .016, .025, -.25, .28, .48 + i * .19, 'crust', mb, .005, .003);
  }
  for (const [x, z, w, d] of [[-.76,-.71,.22,.26],[-.75,-.34,.23,.21],[-.76,.04,.22,.23],[-.43,-.88,.26,.2],[.12,-.86,.22,.2],[.63,.81,.36,.31]]) cake(w, .20, d, x, .17, z, mb);
  for (const [x,z] of [[-.46,-.57],[-.44,.08],[-.77,.31],[.08,.18],[.18,-.79],[.72,-.83],[-.56,-.86]]) {
    cylinder(.068, .16, x, .23, z, 'cake', mb); bean(x, .32, z, .065, .025, .058, mb);
  }
  for (let i = 0; i < 9; i++) cake(.11, .07, .12, -.75 + i * .17, .17, .94, mb);
  // Open rigid gift box and hinged lid, with warm uncoated paper inside.
  const gift = group(.53, .19, -1.35, -.055);
  slab(2.23, .08, 1.05, 0, 0, 0, 'redInside', gift);
  for (const z of [-.51,.51]) slab(2.25,.96,.065,0,.04,z,'red',gift,.025,.012);
  for (const x of [-1.09,1.09]) slab(.065,.96,1.03,x,.04,0,'red',gift,.02,.012);
  const lid = group(0, 1.01, -.54, 0, gift); lid.rotation.x = 1.2;
  slab(2.31,.075,1.12,0,0,-.53,'red',lid);
  slab(2.16,.02,.99,0,.078,-.53,'redInside',lid);
  const label = slab(1.37,.025,.48,0,.47,.555,'label',gift,.08,.007); label.rotation.x = Math.PI / 2;
  // Low-poly creases belong on crumpled tissue, not on food or glazed ceramics.
  for (let sheet = 0; sheet < 4; sheet++) {
    const g = new T.PlaneGeometry(.85, 1.05, 9, 10), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setXYZ(i, x + (random() - .5) * .025, y, .07 * Math.sin(x * 17 + y * 13) + random() * .035 + .23 * Math.pow(Math.abs(y) * 2, 2));
    }
    g.computeVertexNormals(); const paper = mesh(g.toNonIndexed(), 'paper', gift); g.dispose();
    paper.rotation.set(-Math.PI / 2, .13 * (sheet - 1.5), (sheet - 1.5) * .22); paper.position.set(-.72 + sheet * .48, .79, .025);
  }
  // Clipboard on its angled stand; sculpted brass clip and quiet debossed quote marks.
  const clip = group(2.24,.20,-.72,-.13); clip.rotation.x = -.13;
  const backing = slab(1.04,.055,1.67,0,.83,0,'board',clip,.075,.015); backing.rotation.x = Math.PI/2;
  const page = slab(1.01,.023,1.63,0,.84,.04,'label',clip,.07,.007); page.rotation.x = Math.PI/2;
  for (let i=0;i<6;i++) {
    const mark=slab(i===0?.51:.43+(i%2)*.15,.012,.033, -.09,1.31-i*.185,.065,'print',clip,.015,.003);mark.rotation.x=Math.PI/2;
    if(i>0){const dot=cylinder(.034,.012,.35,1.31-i*.185,.07,'print',clip);dot.rotation.x=Math.PI/2;}
  }
  const clasp=slab(.39,.045,.13,0,1.61,.075,'brass',clip,.025,.008);clasp.rotation.x=Math.PI/2;
  const clipRing=mesh(new T.TorusGeometry(.065,.018,10,32),'brass',clip);clipRing.position.set(0,1.72,.065);
  tube([[-.4,.05,-.02],[-.32,.02,-.48],[0,1.42,-.08]],.022,'board',clip);
  // Deep cobalt measuring spoon, with a bowl built from a revolved ceramic profile.
  const spoon = group(2.50,.22,.75,-.29);
  const profile=[[0,.035],[.11,.025],[.22,.06],[.28,.14],[.29,.18],[.27,.19],[.245,.145],[.20,.095],[.10,.066],[0,.067]].map(p=>new T.Vector2(...p));
  mesh(new T.LatheGeometry(profile,48),'blue',spoon);
  tube([[.24,.14,0],[.46,.145,0],[.69,.18,0],[.86,.20,0]],.055,'blue',spoon);
  for(let i=0;i<8;i++){const a=i*2.4,r=.045+Math.sqrt(i/8)*.13;bean(Math.cos(a)*r,.12+(i%2)*.04,Math.sin(a)*r,.057,.052,.052,spoon, a,true);}
  // Folded tea towel with woven red stripes, placed behind the platter.
  const towel=group(-2.58,.22,-1.02,-.31);
  for(let layer=0;layer<2;layer++){
    const g=new T.PlaneGeometry(1.25,1.55,32,32), p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i);p.setXYZ(i,x,.04+layer*.035+.025*Math.cos(x*14)+.025*Math.sin(z*5),z);}
    g.computeVertexNormals();mesh(g,'cloth',towel);
  }
  for(const x of [-.4,-.34,-.22]){
    const g=new T.PlaneGeometry(x===-.34?.06:.025,1.54,2,32),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const a=p.getX(i)+x,z=p.getY(i);p.setXYZ(i,a,.079+.025*Math.cos(a*14)+.025*Math.sin(z*5),z);}g.computeVertexNormals();mesh(g,'stripe',towel);
  }
  function leaf(x,y,z,angle,length,parent=root){
    const g=group(x,y,z,angle,parent),positions=[],uv=[],indices=[];
    for(let i=0;i<=16;i++){const t=i/16,w=Math.sin(Math.PI*t)*length*.23;for(const side of [-1,0,1]){positions.push(side*w,.10*Math.sin(Math.PI*t)+(side===0?.025:0),-t*length);uv.push((side+1)/2,t);}if(i<16)for(let k=0;k<2;k++){const n=i*3+k;indices.push(n,n+3,n+1,n+1,n+3,n+4);}}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,'leaf',g);
    tube([[0,.026,0],[0,.125,-length*.5],[0,.015,-length]],.005,'vein',g);
    for(let j=1;j<6;j++){const t=j/7;for(const side of [-1,1])tube([[0,.03+.10*Math.sin(Math.PI*t),-t*length],[side*Math.sin(Math.PI*(t+.1))*length*.18,.10*Math.sin(Math.PI*(t+.1))+.007,-(t+.12)*length]],.0025,'vein',g);}
  }
  tube([[-3.06,.25,-.88],[-2.97,.29,-1.3],[-2.55,.35,-1.88]],.014,'vein');
  for(const [x,z,a,l] of [[-2.99,-1.07,-1,.56],[-2.94,-1.37,.4,.65],[-2.76,-1.61,-.8,.62],[-2.61,-1.77,.35,.52]]) leaf(x,.29,z,a,l);
  for(const [x,z,a] of [[-2.63,.67,-1.1],[-2.60,.70,.1],[-2.58,.73,1.7]])leaf(x,.38,z,a,.39);
  for(const [x,z] of [[-2.78,1.2],[-2.62,1.43],[-.25,1.83],[.03,1.9],[.25,1.85],[2.42,1.40],[2.73,1.57],[2.37,1.76]])bean(x,z>1.3&&x>2?.26:.39,z,.073,.065,.063,root,random()*4,true);
  // Bake the static meshes by material while retaining UVs for grain.
  root.updateMatrixWorld(true);
  const batches=new Map(), originals=[], framingPoints=[];
  root.traverse(o=>{
    if(!o.isMesh)return;
    const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);
    geo.computeBoundingBox();
    for (const x of [geo.boundingBox.min.x, geo.boundingBox.max.x]) for (const y of [geo.boundingBox.min.y, geo.boundingBox.max.y]) for (const z of [geo.boundingBox.min.z, geo.boundingBox.max.z]) framingPoints.push(new T.Vector3(x, y, z));
    if(!batches.has(o.material))batches.set(o.material,{position:[],normal:[],uv:[]});
    const b=batches.get(o.material);
    for(const name of ['position','normal','uv']){
      const values=geo.attributes[name]?.array;
      if(values)for(const value of values)b[name].push(value);else for(let i=0;i<geo.attributes.position.count*2;i++)b.uv.push(0);
    }
    originals.push(o.geometry);geo.dispose();
  });
  const kernelMesh=new T.InstancedMesh(new T.SphereGeometry(1,12,8),m.kernel,kernels.length);
  const dummy=new T.Object3D(), color=new T.Color();
  kernels.forEach((k,i)=>{
    dummy.position.set(k.x,k.y,k.z);dummy.rotation.set(k.whole?.25:0,k.rotation,0);dummy.scale.set(k.sx,k.sy,k.sz);dummy.updateMatrix();
    kernelMesh.setMatrixAt(i,new T.Matrix4().multiplyMatrices(k.parent.matrixWorld,dummy.matrix));
    color.setHex(k.whole?0xdba13e:0xe4b369).multiplyScalar(k.tint);kernelMesh.setColorAt(i,color);
  });
  root.clear();originals.forEach(g=>g.dispose());
  for(const [mat,b] of batches){const g=new T.BufferGeometry();for(const name of ['position','normal','uv'])g.setAttribute(name,new T.Float32BufferAttribute(b[name],name==='uv'?2:3));g.computeBoundingSphere();const o=new T.Mesh(g,mat);o.castShadow=o.receiveShadow=true;root.add(o);}
  kernelMesh.castShadow=kernelMesh.receiveShadow=true;kernelMesh.computeBoundingSphere();root.add(kernelMesh);
  Object.assign(root.userData,{artifactId:47,conceptual:true,displayBase:false,studioProfile:'tempeh',groundLevel:0,initialYaw:.32,initialElevation:.67,framingPoints});
  return root;
}
