// A shared journal rendered as a tactile paper theatre. No private media is used.
export function createArtifact(THREE) {
  const root = new THREE.Group(); root.name = 'zo-moments-paper-theatre';
  let seed = 77;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const data = new Uint8Array(128 * 128 * 4);
  for (let i = 0; i < data.length; i += 4) {
    const n = 140 + (random() - .5) * 90;
    data[i] = data[i + 1] = data[i + 2] = n; data[i + 3] = 255;
  }
  const grain = new THREE.DataTexture(data, 128, 128); grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(4, 4); grain.needsUpdate = true;
  const colors = { paper: 0xf5e9d2, edge: 0xfff5e3, sand: 0xd7bd94, red: 0x8d2632, ink: 0x344e60, blue: 0x355c78, far: 0xa4b3b7, mid: 0x748d9b, leaf: 0x526d68, gold: 0xc7a468 };
  const M = Object.fromEntries(Object.entries(colors).map(([k,color]) => [k,new THREE.MeshStandardMaterial({ color, roughness: .88, bumpMap: grain, bumpScale: .018, side: THREE.DoubleSide })]));
  M.red.roughness = .78;
  // Local canvas lettering stays crisp at close range and follows each cover hinge.
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff'; context.textAlign = 'center'; context.textBaseline = 'middle';
    context.font = '500 112px Georgia, serif';
    context.fillText('Zo Memories', 512, 128, 940);
    const titleMap = new THREE.CanvasTexture(canvas); titleMap.colorSpace = THREE.SRGBColorSpace;
    titleMap.anisotropy = 4;
    M.coverTitle = new THREE.MeshStandardMaterial({color:colors.gold,map:titleMap,transparent:true,alphaTest:.15,roughness:.6,metalness:.15,emissive:colors.gold,emissiveIntensity:.25});
  }
  const add = (g,m='paper',p=root) => { const o = new THREE.Mesh(g,M[m]); o.castShadow = o.receiveShadow = true; p.add(o); return o; };
  function box(w,h,d,x,y,z,m='paper',p=root) { const o=add(new THREE.BoxGeometry(w,h,d),m,p);o.position.set(x,y,z);return o; }
  function sphere(r,x,y,z,m='paper',p=root) { const o=add(new THREE.SphereGeometry(r,24,16),m,p);o.position.set(x,y,z);return o; }
  function tube(points,r,m='sand',p=root) { return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a))),32,r,6,false),m,p); }
  function shape(points,depth,m,p=root) {
    const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
    return add(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,curveSegments:10}),m,p);
  }
  function rounded(w,h,d,r,m,p=root) {
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
    return add(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.018,bevelThickness:.012,bevelSegments:3,curveSegments:8}),m,p);
  }
  const base=add(new THREE.CylinderGeometry(3.22,3.24,.10,96),'sand');base.scale.z=.73;base.position.y=.05;
  const top=add(new THREE.CylinderGeometry(3.21,3.22,.035,96),'paper');top.scale.z=.73;top.position.y=.113;
  const leaves = [-1, 1].map(side => {
    const group = new THREE.Group(); group.name = side < 0 ? 'left-book-hinge' : 'right-book-hinge';
    group.position.y = .57; root.add(group); return group;
  });
  const popups = [];
  function attachToLeaf(object, side) {
    const leaf = leaves[side < 0 ? 0 : 1];
    root.updateMatrixWorld(true); leaf.attach(object);
  }
  const height=(x,z)=>.40+.14*Math.sin(Math.abs(x)/2.5*Math.PI)+.025*Math.sin(z*2+x)*Math.abs(x)/2.5;
  for(const side of [-1,1]) {
    const before = new Set(root.children);
    const cover=rounded(2.57,3.65,.085,.07,'red');cover.rotation.x=-Math.PI/2;cover.position.set(side*1.29,.16,0);
    // Fine foil tooling on the outside becomes visible when the book closes.
    for(const x of [side*1.29-1.10,side*1.29+1.10])box(.012,.008,3.20,x,.133,0,'gold');
    for(const z of [-1.60,1.60])box(2.20,.008,.012,side*1.29,.133,z,'gold');
    const seal=add(new THREE.TorusGeometry(.23,.012,8,48),'gold');seal.rotation.x=Math.PI/2;seal.position.set(side*.78,.131,0);
    for(const offset of [-.065,.065]){const dot=sphere(.05,side*.78+offset,.13,0,'gold');dot.scale.y=.1;}
    if (M.coverTitle) {
      const title = add(new THREE.PlaneGeometry(2.85,.7125),'coverTitle');
      title.name = 'Zo Memories — outside cover';
      title.position.set(side*1.65,.125,0);
      title.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(
        new THREE.Vector3(0,0,-side), new THREE.Vector3(side,0,0), new THREE.Vector3(0,-1,0),
      ));
    }
    for(let layer=0;layer<19;layer++) {
      const g=new THREE.PlaneGeometry(2.46,3.46,44,20),a=g.attributes.position;
      for(let i=0;i<a.count;i++) {const u=(a.getX(i)+1.23)/2.46,x=side*(u*2.46+.025),z=a.getY(i);a.setXYZ(i,x,height(x,z)-.20+layer*.011+Math.pow(u,5)*.025*Math.sin(z*3+layer*.45),z);}
      g.computeVertexNormals(); add(g,layer%4===0?'sand':'edge');
    }
    for (const object of [...root.children]) if (!before.has(object)) attachToLeaf(object, side);
  }
  // Embossed binding and a fabric bookmark resting over the front edge.
  const binding=rounded(.82,3.65,.035,.035,'red');binding.rotation.x=-Math.PI/2;binding.position.y=.16;binding.scale.x=.12;
  const bookmark=shape([[-.12,0],[.12,0],[.12,-.67],[0,-.58],[-.12,-.67]],.015,'red');bookmark.rotation.x=-1.18;bookmark.position.set(.55,.43,1.37); attachToLeaf(bookmark, 1);

  function sprig(x,y,z,size,p) {
    const group=new THREE.Group();p.add(group);group.position.set(x,y,z);group.scale.setScalar(size);
    tube([[0,0,0],[.02,.32,.01],[-.04,.67,0]],.013,'sand',group);
    for(let j=0;j<5;j++) for(const side of [-1,1]) {
      const leaf=sphere(.09,side*(.065+j*.007),.13+j*.105,.025,'leaf',group);leaf.scale.set(.42,1,.19);leaf.rotation.z=-side*.65;
    }
  }
  function photo(x,z,angle,w,h,variant) {
    const p=new THREE.Group();root.add(p);p.position.set(x,height(x,z)+.02,z);p.rotation.y=angle;
    popups.push({group:p, side:x<0?-1:1, fold:z>.5?-1:1, baseY:p.position.y, x, yaw:angle});
    for(let i=2;i>=0;i--) {const card=rounded(w,h,.035,.07,i===0?'edge':'sand',p);card.position.set(i*.026,h/2+i*.018,-i*.043);}
    const field=rounded(w-.19,h-.31,.018,.025,'paper',p);field.position.set(0,h/2+.025,.053);
    const left=-w/2+.13,right=w/2-.13,bottom=.22;
    const sun=add(new THREE.CylinderGeometry(.12,.12,.025,32),'sand',p);sun.rotation.x=Math.PI/2;sun.position.set(w*.26,h-.38,.10);
    for(let layer=0;layer<3;layer++) {
      const points=[[left,bottom],[right,bottom]];
      for(let i=20;i>=0;i--) {const u=i/20;points.push([left+(right-left)*u,h*(.52-layer*.095)+Math.sin(u*8+variant+layer)*h*.09+Math.sin(u*19+variant)*.035]);}
      const relief=shape(points,.018,['far','mid','ink'][layer],p);relief.position.z=.10+layer*.032;
    }
    // A curved shoreline makes each memory feel like a small place.
    const coast=[[left,bottom],[right,bottom],[right,h*.39],[w*.17,h*.40],[-w*.03,h*.33],[-w*.14,h*.28],[left,h*.30]];
    const sea=shape(coast,.014,'blue',p);sea.position.z=.205;
    for(let i=0;i<14;i++) {
      const xx=left+.06+random()*(w-.38), yy=.24+random()*h*.11;
      box(.035+random()*.13,.008,.008,xx,yy,.237,i%3?'mid':'edge',p);
    }
    if(variant===0 || variant===2) {
      for(let i=0;i<7;i++) {
        const xx=left+.13+i*.115,hh=.12+random()*.19,yy=h*.39+Math.sin(i*.6)*.04;
        box(.10,hh,.07,xx,yy+hh/2,.22,'edge',p);
        box(.025,.045,.012,xx,yy+hh*.62,.264,'ink',p);
        if(i%2===0)box(.025,.07,.012,xx,yy+.04,.264,'sand',p);
      }
    } else {
      const sail=shape([[.15,.42],[.15,.79],[-.04,.44]],.012,'edge',p);sail.position.z=.25;
      tube([[.15,.40,.27],[.15,.80,.27]],.008,'sand',p);
      const hull=shape([[-.07,.41],[.29,.41],[.23,.36],[0,.36]],.012,'sand',p);hull.position.z=.26;
    }
    sprig(left+.07,.17,.27,.68,p);sprig(right-.05,.17,.27,.47,p);
    // Small printed caption rules sit in the generous Polaroid border.
    for(let i=0;i<3;i++)box(.13+i*.065,.008,.008,-.18+i*.18,.09,.06,'sand',p);
    if(variant!==1) {const tab=shape([[-.11,0],[.11,0],[.11,-.43],[0,-.36],[-.11,-.43]],.02,'red',p);tab.position.set(-w*.29,h+.07,.10);}
  }
  photo(-1.75,-.64,.43,1.25,1.79,0);
  photo(-.15,-1.14,-.03,1.78,2.0,1);
  photo(1.65,-.70,-.42,1.22,1.76,2);
  photo(-1.57,.98,-.18,1.28,1.28,2);

  const keepsakesStart = new Set(root.children);
  // A broad satin ribbon stitches the individual memories into one story.
  const path=new THREE.CatmullRomCurve3([[-2,.97,-.30],[-1.1,1.11,-.14],[-.42,.76,.08],[.65,.65,.32],[1.65,.90,.58],[2.10,1.25,-.10]].map(p=>new THREE.Vector3(...p)));
  const pos=[],uv=[],idx=[];
  for(let i=0;i<=140;i++) {
    const t=i/140,p=path.getPoint(t);
    for(let j=0;j<=4;j++) {const v=j/4-.5;pos.push(p.x,p.y+v*.28,p.z+Math.sin(t*8)*v*.16);uv.push(t*4,j/4);if(i<140&&j<4){const a=i*5+j;idx.push(a,a+1,a+5,a+1,a+6,a+5);}}
  }
  const ribbonGeo=new THREE.BufferGeometry();ribbonGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ribbonGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));ribbonGeo.setIndex(idx);ribbonGeo.computeVertexNormals();add(ribbonGeo,'blue');
  for(const edge of [-1,1])tube(Array.from({length:65},(_,i)=>{const t=i/64,p=path.getPoint(t);return [p.x,p.y+edge*.136,p.z+Math.sin(t*8)*edge*.078];}),.008,'mid');

  const together=add(new THREE.CylinderGeometry(.48,.51,.055,64),'sand');together.position.set(.05,.47,.94);
  for(const [x,scale] of [[-.13,1],[.23,.9]]) {
    const body=sphere(.18,x,.72,.94,'paper');body.scale.set(.80,1.42,.72);
    sphere(.112,x,.72+.30*scale,.94,'edge');
  }
  const voice=new THREE.Group();root.add(voice);voice.position.set(.90,.82,-.10);voice.rotation.y=-.12;
  const panel=rounded(1.02,.40,.035,.055,'edge',voice);panel.position.y=.20;
  for(let i=0;i<24;i++){const h=.035+Math.pow(Math.sin(i*1.73),2)*.19;box(.018,h,.018,(i-11.5)*.033,.20,.05,i<6?'gold':'sand',voice);}
  const keepsakes = new THREE.Group(); keepsakes.name = 'folding-shared-memories'; root.add(keepsakes);
  for (const object of [...root.children]) if (!keepsakesStart.has(object) && object !== keepsakes) keepsakes.add(object);
  keepsakes.position.y = .43;
  for (const object of keepsakes.children) object.position.y -= .43;
  for(let i=0;i<4;i++) {
    const p=new THREE.Group();root.add(p);p.position.set(2.65,.19+i*.045,.97);p.rotation.set(-Math.PI/2,0,-.16-i*.09);
    rounded(.66,.80,.023,.025,'edge',p);
    const img=rounded(.53,.56,.008,.012,'mid',p);img.position.set(0,.045,.032);
    const hill=shape([[-.24,-.20],[.24,-.20],[.24,-.07],[.08,.04],[-.09,-.03],[-.24,.08]],.008,'blue',p);hill.position.z=.05;
  }
  // Preserve the articulated hinges, but batch each rigid assembly locally.
  function batch(group, excluded = []) {
    group.updateWorldMatrix(true, true);
    const inverse = group.matrixWorld.clone().invert(), batches = new Map();
    const objects = [];
    group.traverse(o => {
      if (!o.isMesh || excluded.some(parent => { let p=o; while(p){if(p===parent)return true;p=p.parent;}return false; })) return;
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
      g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));
      let b=batches.get(o.material);if(!b){b={p:[],n:[],uv:[]};batches.set(o.material,b);}
      for(const v of g.attributes.position.array)b.p.push(v);
      for(const v of g.attributes.normal.array)b.n.push(v);
      if(g.attributes.uv)for(const v of g.attributes.uv.array)b.uv.push(v);
      else for(let i=0;i<g.attributes.position.count;i++)b.uv.push(0,0);
      g.dispose();o.geometry.dispose();objects.push(o);
    });
    objects.forEach(o=>o.removeFromParent());
    for(const [material,b] of batches){
      const g=new THREE.BufferGeometry();
      for(const [key,values,size] of [['position',b.p,3],['normal',b.n,3],['uv',b.uv,2]])g.setAttribute(key,new THREE.Float32BufferAttribute(values,size));
      g.computeBoundingSphere();const mesh=new THREE.Mesh(g,material);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
    }
  }
  leaves.forEach(leaf=>batch(leaf));
  popups.forEach(({group})=>batch(group));
  batch(keepsakes);
  batch(root,[...leaves,...popups.map(p=>p.group),keepsakes,binding]);
  // The inserts inherit their cover hinge after their local geometry is batched.
  popups.forEach(({group,side})=>attachToLeaf(group,side));
  const bookRig = new THREE.Group(); bookRig.name = 'opening-journal'; root.add(bookRig);
  leaves.forEach(leaf=>bookRig.add(leaf));bookRig.add(binding);
  const smooth = t => { t=THREE.MathUtils.clamp(t,0,1);return t*t*t*(t*(t*6-15)+10); };
  function animate(time) {
    // Open hold → fold the paper scenes → close → closed hold → reveal.
    // Absolute-time poses remain stable when paused, dragged or reduced-motion.
    const t=((time%18)+18)%18;
    const closing = smooth((t-4)/3.6) * (1-smooth((t-10)/4.2));
    const fold = smooth((t-3)/2.2) * (1-smooth((t-12.2)/2.8));
    leaves[0].rotation.z = -closing*Math.PI/2;
    leaves[1].rotation.z = closing*Math.PI/2;
    bookRig.rotation.y=-closing*.70;
    bookRig.position.y=-closing*.39;
    binding.position.y=.16+closing*.39;binding.scale.x=.12+.88*closing;
    for (const [index,popup] of popups.entries()) {
      const {group,baseY,x,fold:direction,yaw}=popup;
      group.scale.set(1-fold*.15,1-fold*.35,1-fold*.93);
      group.position.x=x+(Math.abs(x)<.3?-.72*fold:0);
      group.position.y=baseY*(1-fold)+(.445+index*.018)*fold-.57;
      group.rotation.set(direction*fold*Math.PI/2,yaw*(1-fold),0,'YXZ');
    }
    keepsakes.scale.y=1-fold*.985;
    keepsakes.visible=closing<.10;
  }
  // Reserve the complete motion envelope once, avoiding camera pumping or clipping.
  const framingBounds = new THREE.Box3();
  for(let t=0;t<=18;t+=.25){animate(t);root.updateMatrixWorld(true);framingBounds.union(new THREE.Box3().setFromObject(root));}
  animate(0);root.updateMatrixWorld(true);
  root.userData={framingBounds,conceptual:true,artifactId:77,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:.22,initialElevation:.47,animate};
  return root;
}
