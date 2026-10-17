export function buildCourtyard(w) {
  const {THREE,root,random,mesh,box,ball,disk,line,ring,palette}=w;
  const flags=[];
  const stone=()=>new THREE.Color(palette.stone).multiplyScalar(.91+random()*.18).getHex();
  // A continuous courtyard, rather than a round display-token silhouette.
  const boundary=new THREE.Shape();
  boundary.moveTo(-3.38,-2.65);boundary.lineTo(-3.08,-3.0);boundary.lineTo(3.10,-3.0);boundary.lineTo(3.42,-2.64);boundary.lineTo(3.42,2.65);boundary.lineTo(3.1,3.05);boundary.lineTo(-3.12,3.05);boundary.lineTo(-3.4,2.64);boundary.closePath();
  const ground=mesh(new THREE.ExtrudeGeometry(boundary,{depth:.22,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2,steps:1}),'stone',root,'stone');ground.rotation.x=-Math.PI/2;ground.position.y=-.025;
  // Individual paving blocks with narrow mortar reveals; leave channels open.
  const riverCurves=[-1,1].map(side=>new THREE.CatmullRomCurve3([new THREE.Vector3(0,.258,1.35),new THREE.Vector3(side*.23,.258,1.92),new THREE.Vector3(side*1.35,.258,2.82)]));
  const riverPoints=riverCurves.flatMap(curve=>curve.getPoints(48));
  const channel=(x,z)=>riverPoints.some(p=>Math.hypot(p.x-x,p.z-z)<.215);
  for(let row=-11;row<=11;row++)for(let col=-12;col<=12;col++) {
    const z=row*.265,x=col*.26+(row%2)*.13;
    if(Math.abs(x)>3.27 || channel(x,z))continue;
    box(.249,.045,.253,x+(random()-.5)*.009,.256+random()*.008,z,stone(),root,'stone',.009);
  }
  // Water is a flat ribbon, with individually laid stone banks and fine ripples.
  for(const side of [-1,1]) {
    const curve=riverCurves[side===-1?0:1];
    const positions=[],uvs=[],indices=[];
    for(let i=0;i<=40;i++) {
      const t=i/40,p=curve.getPoint(t),d=curve.getTangent(t),normal=new THREE.Vector3(-d.z,0,d.x);
      for(const s of [-1,1]) {const v=p.clone().addScaledVector(normal,s*.12);positions.push(v.x,v.y,v.z);uvs.push(t,s===1?1:0);}
      if(i<40){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
      if(i%3===0)for(const s of [-1,1]){const v=p.clone().addScaledVector(normal,s*.17);const b=box(.12,.055,.19,v.x,.29,v.z,'pale');b.rotation.y=Math.atan2(d.x,d.z);}
      if(i%2===0) {const v=p.clone().addScaledVector(normal,(random()-.5)*.12);line([[v.x-.025,.264,v.z],[v.x+.04,.264,v.z+.012]],.003,'cream');}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();mesh(g,'water',root,'water');
  }
  // Recessed wall mortar and offset courses give the towers real depth.
  for(const x of [-2.12,2.12]) {
    disk(.40,.14,x,.34,-1.53,'mortar');
    disk(.365,1.72,x,1.24,-1.53,'mortar');
    for(let row=0;row<10;row++)for(let i=0;i<12;i++) {
      const a=(i+(row%2)*.5)*Math.PI/6;
      const g=new THREE.CylinderGeometry(.395,.395,.163,4,1,true,a+.014,Math.PI/6-.028);
      const b=mesh(g,stone(),root,'stone');b.position.set(x,.48+row*.17,-1.53);
    }
    disk(.445,.10,x,2.15,-1.53,'pale');ring(.405,.04,x,2.08,-1.53,'stone',root,'stone');
    disk(.39,.018,x,2.21,-1.53,'mortar');
    for(let i=0;i<10;i++){const a=i*Math.PI/5;const b=box(.16,.22,.18,x+Math.sin(a)*.35,2.31,-1.53+Math.cos(a)*.35,stone());b.rotation.y=a;}
    box(.12,.35,.032,x,1.34,-1.122,'darkwood');
    for(const side of [-1,1])box(.055,.40,.065,x+side*.09,1.34,-1.12,'pale');
    const sill=ball(.115,x,1.54,-1.13,'pale');sill.scale.set(1,.7,.35);
    box(.12,.20,.03,x,1.49,-1.10,'darkwood');box(.25,.06,.10,x,1.13,-1.10,'pale');
    line([[x,2.18,-1.53],[x,2.99,-1.53]],.018,'honey',root,'wood');ball(.035,x,3,-1.53,'gold',root,'metal');
    const group=new THREE.Group();group.position.set(x,2.82,-1.53);root.add(group);
    const g=new THREE.PlaneGeometry(.43,.23,12,3),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const px=p.getX(i)+.215;p.setXYZ(i,px,p.getY(i)-px*.12,Math.sin(px*19)*.045*(px/.43));}g.computeVertexNormals();
    mesh(g,'navy',group,'cloth');flags.push(group);
  }
  for(const x of [-1.47,1.47]) {
    box(.52,1.62,.27,x,1.06,-1.77,'mortar');
    for(let row=0;row<9;row++)for(let col=0;col<2;col++)box(.25,.17,.30,x+(col-.5)*.265,.37+row*.177,-1.76,stone());
    for(let i=0;i<3;i++)box(.12,.17,.32,x-.21+i*.21,1.98,-1.76,'pale');
    const s=new THREE.Shape();s.moveTo(-.18,.4);s.lineTo(.18,.4);s.lineTo(.18,-.31);s.lineTo(0,-.46);s.lineTo(-.18,-.31);s.closePath();
    const banner=mesh(new THREE.ShapeGeometry(s),'navy',root,'cloth');banner.position.set(x,1.33,-1.58);
    line([[x-.24,1.76,-1.55],[x+.24,1.76,-1.55]],.022,'gold',root,'metal');
    emblem(x,1.34,-1.555,.15);
  }
  // Wedge-shaped voussoirs replace the old smooth tubular arch.
  for(const x of [-1.04,1.04])for(let i=0;i<7;i++)box(.27,.18,.32,x,.38+i*.19,-1.90,stone());
  for(let i=0;i<17;i++) {
    const a=i*Math.PI/17+.008,b=(i+1)*Math.PI/17-.008,s=new THREE.Shape();
    s.absarc(0,0,1.18,a,b,false);s.absarc(0,0,.91,b,a,true);s.closePath();
    const g=new THREE.ExtrudeGeometry(s,{depth:.29,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:1,steps:1,curveSegments:3});
    const m=mesh(g,stone(),root,'stone');m.position.set(0,1.62,-2.05);
  }
  box(.24,.34,.38,0,2.79,-1.90,'pale');
  function emblem(x,y,z,r,parent=root) {
    line([[x,y-r,z],[x,y+r,z]],r*.14,'gold',parent,'metal');
    for(const side of [-1,1]){const l=ball(r*.44,x+side*r*.45,y+r*.25,z,'gold',parent,'metal');l.scale.set(.58,1,.24);l.rotation.z=-side*.55;}
    const l=ball(r*.38,x,y+r*.7,z,'gold',parent,'metal');l.scale.set(.6,1.3,.25);
    box(r*1.35,r*.17,.014,x,y-r*.14,z,'gold',parent,'metal');
  }
  // Low perimeter walls frame the courtyard without hiding the cast.
  for(const side of [-1,1])for(let i=0;i<8;i++) {
    const a=side*(.92+i*.185),x=Math.sin(a)*2.88,z=-Math.cos(a)*2.88;
    for(let row=0;row<2;row++){const b=box(.43,.17,.18,x,.36+row*.18,z,stone());b.rotation.y=-a;}
    const b=box(.19,.15,.23,x,.72,z,'pale');b.rotation.y=-a;
  }
  function tree(x,z,h) {
    disk(.035,h*.4,x,.35+h*.18,z,'wood',root,'wood',8);
    // Serrated, upright foliage silhouette; no stacked spherical clumps.
    const rows=28,columns=24,positions=[],uv=[],indices=[];
    for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++){
      const t=row/rows,a=col/columns*Math.PI*2;
      const radius=Math.max(.006,Math.pow(Math.sin(Math.PI*t),.65)*h*.14*(1-t*.53));
      const r=radius*(.88+random()*.24+Math.sin(a*9+t*34)*.16);
      positions.push(x+Math.cos(a)*r,.31+t*h,z+Math.sin(a)*r);uv.push(col/columns,t);
      if(row<rows&&col<columns){const i=row*(columns+1)+col;indices.push(i,i+columns+1,i+1,i+1,i+columns+1,i+columns+2);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();mesh(g,'leaf',root,'stone');
    for(let i=0;i<48;i++){
      const t=.08+random()*.85,a=i*2.39996,r=Math.pow(Math.sin(Math.PI*t),.65)*h*.14*(1-t*.53);
      const sprig=mesh(new THREE.IcosahedronGeometry(h*.035,0),i%3?'leaf':'olive',root,'stone');sprig.position.set(x+Math.cos(a)*r,.31+t*h,z+Math.sin(a)*r);sprig.scale.set(.7,1.8,.7);
    }
  }
  for(const [x,z,h]of [[-2.85,-1.6,1.65],[2.93,-1.15,1.9],[-3.03,-.65,1.15],[2.96,.60,1.3],[-1.13,-2.61,1.15],[1.32,-2.56,1.35],[-2.8,-2.4,1.65],[2.8,-2.40,1.7],[2.68,2.23,.95],[-.95,2.55,.8],[.95,2.8,.85]])tree(x,z,h);
  for(let i=0;i<44;i++) {
    const a=random()*Math.PI*2,r=2.53+random()*.35,x=Math.sin(a)*r,z=Math.cos(a)*r;
    if(z>1.6&&Math.abs(x)<1.7 || x< -1.5&&z>1)continue;
    for(let j=0;j<4;j++){const l=ball(.06+random()*.045,x+(random()-.5)*.19,.32+random()*.12,z+(random()-.5)*.19,j%2?'olive':'leaf',root,'clay',8);l.scale.y=1.5;}
    if(i%3===0)for(let j=0;j<3;j++)ball(.023,x+(random()-.5)*.18,.48,z+(random()-.5)*.18,i%2?'cream':'rose',root,'clay',8);
  }
  const marketStart=root.children.length;
  // Handbuilt market: slatted counter, bowed canvas, produce, jars and crates.
  for(const x of [-2.26,-1.5])for(const z of [1.5,2.03])box(.055,1.15,.055,x,.83,z,'wood',root,'wood');
  for(let i=0;i<9;i++)box(.084,.46,.52,-2.24+i*.09,.51,1.77,i%2?'wood':'honey',root,'wood');
  box(.88,.065,.57,-1.88,.77,1.77,'honey',root,'wood');
  for(let i=0;i<8;i++) {
    const g=new THREE.PlaneGeometry(.105,.77,1,8),p=g.attributes.position;
    for(let j=0;j<p.count;j++){const t=(p.getY(j)+.385)/.77;p.setXYZ(j,p.getX(j),1.40-Math.sin(t*Math.PI)*.045-t*.19,1.40+t*.77);}g.computeVertexNormals();
    const m=mesh(g,i%2?'cream':'red',root,'cloth');m.position.x=-2.25+i*.106;
    const scallop=ball(.053,m.position.x,1.195,2.17,i%2?'cream':'red',root,'cloth',12);scallop.scale.set(1,1,.2);
  }
  for(let i=0;i<3;i++) {
    box(.23,.075,.35,-2.14+i*.26,.82,1.77,'darkwood',root,'wood');
    for(let j=0;j<7;j++)ball(.045,-2.20+i*.26+random()*.12,.88+random()*.035,1.66+random()*.22,['red','gold','olive'][i],root,'clay',10);
  }
  for(const [x,z] of [[-2.37,1.89],[-1.36,2.12]]){
    const pot=ball(.12,x,.39,z,'honey');pot.scale.y=1.2;ring(.063,.018,x,.52,z,'wood',root,'clay');disk(.048,.01,x,.515,z,'darkwood',root,'clay',16);
  }
  const market=new THREE.Group();market.name='market';
  for(const child of root.children.slice(marketStart)){root.remove(child);market.add(child);}
  root.add(market);market.position.set(-.65,0,.30);
  const boardStart=root.children.length;
  for(const x of [1.82,2.46])box(.07,.94,.07,x,.72,1.58,'darkwood',root,'wood');
  for(let i=0;i<5;i++)box(.82,.105,.075,2.14,.90+i*.108,1.58,i%2?'wood':'honey',root,'wood');
  for(const y of [.83,1.44])box(.93,.065,.13,2.14,y,1.60,'honey',root,'wood');
  for(const x of [1.94,2.30]){box(.26,.35,.014,x,1.15,1.63,'cream',root,'cloth');ball(.018,x,1.30,1.65,'gold',root,'metal',8);for(let j=0;j<4;j++)box(.15-j*.018,.007,.006,x,1.21-j*.045,1.642,'mortar',root,'clay');}
  const board=new THREE.Group();board.name='noticeboard';
  for(const child of root.children.slice(boardStart)){root.remove(child);board.add(child);}
  root.add(board);board.position.set(-4.95,0,-1.52);
  // Council table: circular edge, fitted plank top and exposed joinery.
  for(const x of [-.7,.7])for(const z of [-.5,.5]){box(.13,.54,.14,x,.56,z,'wood',root,'wood');box(.20,.08,.20,x,.32,z,'darkwood',root,'wood');}
  disk(1.15,.12,0,.86,0,'darkwood',root,'wood');ring(1.12,.035,0,.92,0,'honey',root,'wood');
  for(let i=-6;i<=6;i++){const z=i*.16,length=2*Math.sqrt(1.10**2-z*z);box(length,.055,.153,0,.946,z,new THREE.Color(palette.honey).multiplyScalar(.92+(i+6)%3*.035).getHex(),root,'wood',.008);}
  for(let i=0;i<8;i++) {
    const a=i*Math.PI/4,card=box(.23,.009,.18,Math.sin(a)*.85,.982,Math.cos(a)*.85,'cream',root,'cloth',.003);card.rotation.y=a;
    ball(.015,Math.sin(a)*.85+.07,.991,Math.cos(a)*.85+.04,'red',root,'clay',8);
  }
  disk(.51,.035,0,.998,0,'olive');disk(.47,.012,0,1.02,0,'stone');
  for(const [x,z,h]of [[-.24,.12,.22],[.25,.1,.28],[0,-.16,.48],[-.23,-.22,.18],[.18,-.27,.2]]) {
    box(.18,h,.17,x,1.03+h/2,z,'pale');
    const roof=mesh(new THREE.ConeGeometry(.165,.17,4),h>.4?'navy':'roof');roof.position.set(x,1.03+h+.085,z);roof.rotation.y=Math.PI/4;
    for(const dx of [-.045,.045])box(.025,.047,.009,x+dx,1.11,z+.089,'darkwood');
    if(h>.4){box(.045,.09,.009,x,1.40,z+.09,'darkwood');ball(.017,x,1.71,z,'gold',root,'metal',8);}
  }
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const t=ball(.045,Math.sin(a)*.42,1.09,Math.cos(a)*.42,'leaf',root,'clay',8);t.scale.y=1.8;}
  // A tiny arched footbridge over the foreground watercourse.
  const bridge=new THREE.Group();bridge.position.set(1.13,.26,2.68);bridge.rotation.y=-.7;bridge.scale.set(1.2,1.2,1.2);root.add(bridge);
  for(let i=0;i<9;i++){const x=(i-4)*.07,y=Math.sqrt(Math.max(0,.40**2-x*x))-.26;box(.068,.09,.38,x,y,0,'pale',bridge);for(const side of [-1,1])box(.068,.14,.06,x,y+.10,side*.20,'stone',bridge);}
  // The town continues beyond the council: cottages, a fountain and stairs.
  for(const [x,z,h]of [[2.60,1.70,.48],[3.00,2.54,.58],[2.28,2.78,.42]]){
    box(.37,h,.34,x,.28+h/2,z,'pale');
    const roof=mesh(new THREE.ConeGeometry(.32,.26,4),'roof');roof.position.set(x,.28+h+.13,z);roof.rotation.y=Math.PI/4;
    for(let j=0;j<4;j++)line([[x-.19+j*.12,.28+h+.04,z+.18],[x-.19+j*.12,.28+h+.20,z]],.008,'honey');
    box(.09,.17,.02,x,.37,z+.18,'wood');for(const dx of [-.10,.10])box(.05,.07,.02,x+dx,.28+h*.72,z+.18,'darkwood');
  }
  disk(.29,.10,2.67,.34,.80,'pale');disk(.24,.018,2.67,.40,.80,'water',root,'water');
  ring(.27,.035,2.67,.41,.80,'pale',root,'stone');disk(.055,.26,2.67,.53,.80,'pale');disk(.15,.035,2.67,.67,.80,'pale');ball(.06,2.67,.75,.80,'pale');
  for(let i=0;i<4;i++)box(1.05,.065,.17,0,.06+i*.055,3.02-i*.15,'pale');
  return { flags, emblem };
}
