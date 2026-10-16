// Should I Quit: a six-stop, seekable decision journey around a paper crossroads.
export function createArtifact(T) {
  const root = new T.Group(); root.name = 'should-i-quit-crossroads';
  const moving=(o,name)=>{o.name=name;for(let p=o;p&&p!==root;p=p.parent)p.userData.motion=true;return o;};
  const routes=[],cards=[];
  let seed=51; const pixels=new Uint8Array(128*128*4);
  for(let i=0;i<pixels.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=125+(seed/4294967296-.5)*75;pixels[i]=pixels[i+1]=pixels[i+2]=n;pixels[i+3]=255;}
  const grain=new T.DataTexture(pixels,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(4,4);grain.needsUpdate=true;
  const paper=(color)=>new T.MeshStandardMaterial({color,roughness:.83,bumpMap:grain,bumpScale:.009,side:T.DoubleSide});
  const mat={cream:paper(0xf1dfbf),light:paper(0xffedcf),shade:paper(0xc4aa82),red:paper(0xba3527),redDark:paper(0x7b201b),blue:paper(0x244c70),blueDark:paper(0x142d47),blueLight:paper(0x426582),gold:paper(0xd9b071),ink:paper(0x66553e),glow:new T.MeshStandardMaterial({color:0xffe9b3,emissive:0xffbb51,emissiveIntensity:1.4,roughness:.6})};
  mat.sage=paper(0x788365);mat.leaf=paper(0x536950);mat.sky=paper(0xf5d798);mat.hair=paper(0x453c31);
  const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
  const mesh=(geo,c='cream',p=root)=>{const m=new T.Mesh(geo,mat[c]);m.castShadow=m.receiveShadow=true;p.add(m);return m;};
  const box=(w,h,d,x,y,z,c='cream',p=root)=>{const m=mesh(new T.BoxGeometry(w,h,d),c,p);m.position.set(x,y,z);return m;};
  function roundShape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
  function extrude(s,d,c,p=root,bevel=.025){return mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:16}),c,p);}
  function rounded(w,h,d,x,y,z,c='cream',p=root,r=.05){const m=extrude(roundShape(w,h,r),d,c,p);m.position.set(x,y,z-d/2);return m;}
  function disk(r,h,x,y,z,c='cream',p=root){const m=mesh(new T.CylinderGeometry(r,r,h,48),c,p);m.position.set(x,y,z);return m;}
  function faceDisk(r,h,x,y,z,c='cream',p=root){const m=disk(r,h,x,y,z,c,p);m.rotation.x=Math.PI/2;return m;}
  function rod(a,b,r,c='cream',p=root){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av);const m=mesh(new T.CylinderGeometry(r,r,v.length(),32),c,p);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;}
  function path(points,r,c,p=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),48,r,8,false),c,p);}
  function polygon(points,d,c,p=root){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return extrude(s,d,c,p,.004);}
  function surface(nx,ny,sample,c,p=root){const pos=[],uv=[],idx=[];for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){pos.push(...sample(i/nx,j/ny));uv.push(i/nx,j/ny);if(i<nx&&j<ny){let a=j*(nx+1)+i;idx.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return mesh(g,c,p);}
  const sphere=(x,y,z,sx,sy,sz,c='cream',p=root)=>{const m=mesh(new T.SphereGeometry(1,24,16),c,p);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;};
  const flat=(w,d,h,x,y,z,c='cream',p=root,r=.08)=>{const m=rounded(w,d,h,0,0,0,c,p,r);m.rotation.x=-Math.PI/2;m.position.set(x,y-h/2,z);return m;};
  flat(8.5,6.5,.26,0,.15,0,'cream',root,.28);
  flat(8.42,6.42,.055,0,.30,0,'light',root,.25);
  flat(8.28,6.28,.025,0,.335,0,'cream',root,.23);
  // Six clear spokes meet at a broad central decision hub: five destinations and reflection.
  function ribbon(points,width,c,y=.405){
    const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,y,z)));routes.push(curve);
    surface(1,60,(u,v)=>{const q=curve.getPoint(v),t=curve.getTangent(v);return [q.x-t.z*(u-.5)*width,q.y,q.z+t.x*(u-.5)*width];},c);
  }
  for(const route of [
    [[0,.12],[-.9,-.15],[-1.9,-.75],[-2.85,-1.25]],
    [[0,.12],[.9,-.15],[1.9,-.75],[2.85,-1.25]],
    [[0,.12],[0,-.7],[0,-1.5],[0,-2.10]],
    [[0,.12],[-.8,.65],[-1.8,1.30],[-2.85,1.72]],
    [[0,.12],[.8,.65],[1.8,1.30],[2.85,1.72]],
    [[0,.12],[0,.9],[0,1.75],[0,2.35]],
  ]) ribbon(route,.62,'blue');
  disk(.70,.024,0,.413,.12,'blue');
  // Left doorway is a tiny room, with a blue wall, workstation and pendant light.
  const office=group(-2.85,.36,-1.70);
  rounded(1.42,2.48,.16,0,1.24,-.34,'blue',office,.06);
  for(const x of [-.75,.75])rounded(.18,2.65,.68,x,1.325,0,'light',office,.035);
  rounded(1.68,.18,.68,0,2.59,0,'light',office,.04);
  flat(1.5,.78,.075,0,.04,0,'light',office);
  flat(1.18,.49,.07,0,.92,-.08,'cream',office,.025);
  for(const x of [-.48,.48])for(const z of [-.23,.10])box(.055,.85,.055,x,.47,z,'light',office);
  rounded(.48,.34,.05,-.16,1.20,-.23,'ink',office,.025);
  const screen=rounded(.43,.28,.015,-.16,1.20,-.193,'blue',office,.012);screen.material=screen.material.clone();screen.material.emissive.setHex(0x426582);
  rod([-.16,.96,-.22],[-.16,1.1,-.22],.023,'ink',office);flat(.25,.14,.025,-.16,.97,-.20,'ink',office,.02);
  flat(.36,.12,.018,-.15,.974,.07,'light',office,.012);
  for(let i=0;i<4;i++)box(.28,.005,.008,-.15,.986,.035+i*.025,'shade',office);
  const chair=group(.05,0,.27,office);
  flat(.48,.42,.08,0,.54,0,'blue',chair,.04);rounded(.48,.52,.07,0,.84,.18,'blue',chair,.045);
  for(const x of [-.18,.18])for(const z of [-.14,.14])rod([x,.08,z],[x,.52,z],.025,'shade',chair);
  rod([0,2.49,-.12],[0,2.06,-.12],.014,'ink',office);
  const shade=mesh(new T.ConeGeometry(.19,.18,40,1,true),'cream',office);shade.position.set(0,1.99,-.12);
  disk(.17,.012,0,1.9,-.12,'glow',office);
  const officeLight=new T.PointLight(0xffd291,.65,2);officeLight.position.set(0,1.8,.02);office.add(officeLight);
  // The right portal contains a warm layered landscape, visible through a paneled door.
  const portal=group(2.85,.36,-1.70);
  rounded(1.4,2.48,.13,0,1.24,-.34,'sky',portal,.06);
  faceDisk(.23,.025,.24,1.92,-.25,'glow',portal);
  for(const [x,y,s,c,z] of [[-.43,.55,.7,'sage',-.22],[.48,.44,.72,'sage',-.18],[-.52,.28,.55,'leaf',-.12],[.55,.22,.5,'leaf',-.08]]) {
    const contour=new T.Shape();contour.moveTo(-s,0);contour.lineTo(-s,.15);contour.bezierCurveTo(-s,.51,-s*.30,.70,0,.48);contour.bezierCurveTo(s*.40,.45,s*.60,.12,s,.08);contour.lineTo(s,0);contour.closePath();const hill=extrude(contour,.025,c,portal,.005);hill.position.set(x,y,z);hill.scale.set(.65,.8,1);
  }
  // Winding ivory route in the landscape relief.
  surface(1,45,(u,v)=>{const x=.12*Math.sin(v*8),width=.07+.36*(1-v);return [x+(u-.5)*width,.15+v*1.03,-.035];},'light',portal);
  for(const x of [-.75,.75])rounded(.18,2.65,.45,x,1.325,.05,'red',portal,.03);
  rounded(1.68,.18,.45,0,2.59,.05,'red',portal,.03);
  flat(1.67,.68,.10,0,.05,.22,'light',portal,.04);flat(1.78,.38,.08,0,.015,.57,'cream',portal,.03);
  const door=moving(group(.65,.12,.29,portal),'opportunity-door');door.rotation.y=1.80;
  rounded(1.28,2.34,.085,-.64,1.17,0,'red',door,.04);
  for(const side of [-1,1])for(const [y,h] of [[.60,.81],[1.64,1.03]]){
    rounded(1.05,h,.02,-.64,y,side*.072,'redDark',door,.025);
    rounded(.98,h-.07,.022,-.64,y,side*.095,'red',door,.018);
  }
  faceDisk(.035,.035,-1.12,1.1,.09,'gold',door);rod([-1.12,1.1,.13],[-.98,1.1,.13],.022,'gold',door);
  for(const y of [.4,1.85])rod([-.02,y,0],[-.02,y+.16,0],.025,'gold',door);
  // Raised perspective cards with seven distinct embossed symbols.
  function bust(x,y,s,p){sphere(x,y+s*.18,.065,s*.18,s*.18,.035,'blue',p);const shape=new T.Shape();shape.moveTo(-s*.30,-s*.3);shape.lineTo(-s*.3,-s*.15);shape.bezierCurveTo(-s*.3,s*.2,s*.3,s*.2,s*.3,-s*.15);shape.lineTo(s*.3,-s*.3);shape.closePath();const m=extrude(shape,.04,'blue',p,.005);m.position.set(x,y-s*.08,.05);}
  function card(x,y,angle,type){
    path([[x*.62,1.65,-2.30],[x*.83,2.30,-2.30],[x,y+.20,-2.20]],.022,'shade');
    const p=moving(group(x,y+.50,-2.18),'perspective-'+type);p.rotation.z=angle;p.scale.setScalar(.86);cards.push({object:p,angle,y:y+.50});
    rounded(.63,.73,.07,0,0,0,'cream',p,.07);rounded(.58,.68,.015,0,0,.045,'light',p,.055);
    if(type==='person')bust(0,-.01,.72,p);
    if(type==='family'){bust(-.15,.05,.43,p);bust(.15,.05,.43,p);bust(0,-.17,.30,p);}
    if(type==='team'){bust(-.19,-.05,.34,p);bust(0,.03,.46,p);bust(.19,-.05,.34,p);}
    if(type==='work'){rounded(.42,.30,.07,0,-.035,.10,'blue',p,.025);path([[-.09,.13,.10],[-.09,.22,.10],[.09,.22,.10],[.09,.13,.10]],.022,'blue',p);box(.43,.015,.014,0,.005,.146,'blueLight',p);rounded(.05,.07,.022,0,-.015,.158,'gold',p,.012);}
    if(type==='money'){for(let i=0;i<4;i++){const coin=disk(.15,.055,-.06,-.20+i*.065,.12,'blueLight',p);coin.rotation.x=.18;}path([[.14,-.22,.12],[.17,-.08,.12],[.24,.05,.12]],.012,'leaf',p);sphere(.22,.03,.12,.055,.12,.025,'sage',p);}
    if(type==='search'){const ring=mesh(new T.TorusGeometry(.17,.027,10,48),'blue',p);ring.position.set(-.025,.075,.105);rod([.10,-.06,.105],[.22,-.25,.105],.035,'blue',p);}
    if(type==='notes'){rounded(.40,.51,.04,0,0,.10,'cream',p,.02);rod([-.13,-.23,.14],[-.13,.23,.14],.014,'blue',p);for(let i=0;i<4;i++)rounded(.22,.018,.014,.035,.13-i*.08,.137,'blue',p,.008);for(const y of [-.15,.15])rod([-.20,y,.15],[-.10,y,.15],.018,'blue',p);}
  }
  for(const [x,y,a,type] of [[-1.34,1.94,.30,'money'],[-1.12,2.67,.22,'work'],[-.68,3.15,.15,'family'],[0,3.38,0,'person'],[.68,3.15,-.15,'team'],[1.12,2.67,-.22,'search'],[1.34,1.94,-.30,'notes']])card(x,y,a,type);
  // A rounded, articulated figure contemplating the fork instead of a flat token.
  const human=moving(group(0,.43,.13),'considering-person');human.rotation.y=-.22;
  for(const x of [-.14,.14]){rod([x,.16,0],[x,.70,0],.087,'light',human);sphere(x,.11,.07,.11,.09,.18,'light',human);}
  sphere(0,.94,0,.25,.36,.16,'cream',human);sphere(0,1.41,0,.18,.22,.18,'light',human);
  const hair=mesh(new T.SphereGeometry(.188,28,18,0,Math.PI*2,0,1.65),'hair',human);hair.position.set(0,1.46,-.012);hair.scale.set(1,1,1.03);
  sphere(.045,1.60,-.005,.16,.065,.15,'hair',human);
  rod([-.21,1.10,0],[-.31,.88,.03],.069,'cream',human);rod([-.31,.88,.03],[-.21,.77,.15],.058,'cream',human);sphere(-.21,.77,.15,.065,.075,.06,'light',human);
  rod([.21,1.10,0],[.32,.98,.10],.069,'cream',human);rod([.32,.98,.10],[.17,1.31,.18],.056,'cream',human);sphere(.17,1.31,.18,.055,.073,.048,'light',human);
  sphere(.03,1.40,.174,.025,.034,.035,'light',human);
  // Balanced red weighing beam, with actual concave bowls and brass pivot.
  const fulcrum=polygon([[-.23,0],[.23,0],[0,.39]],.18,'red');fulcrum.position.set(0,.36,2.13);
  const balance=moving(group(0,.72,2.22),'weighing-balance');rounded(1.73,.075,.10,0,0,0,'red',balance,.025);faceDisk(.075,.05,0,0,.09,'gold',balance);
  for(const x of [-.8,.8]){const bowl=mesh(new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.12,.015),new T.Vector2(.24,.07),new T.Vector2(.28,.14),new T.Vector2(.265,.15),new T.Vector2(.22,.085),new T.Vector2(.10,.035),new T.Vector2(0,.03)],48),'red',balance);bowl.position.set(x,.035,0);}
  // Open journal with curled, individually layered pages and a red bookmark.
  const journal=group(0,.39,2.79);
  flat(1.65,.75,.065,0,0,0,'blue',journal,.055);
  for(let layer=0;layer<6;layer++)for(const side of [-1,1])surface(22,10,(u,v)=>{const x=side*(.02+u*.77);return [x,.045+layer*.012+.09*Math.sin(u*Math.PI*.8), (v-.5)*.66];},'light',journal);
  for(const side of [-1,1])for(let i=0;i<5;i++)path([[side*.13,.13,.20-i*.075],[side*.40,.20,.20-i*.075],[side*.66,.18,.20-i*.075]],.003,'shade',journal);
  surface(1,20,(u,v)=>[(u-.5)*.055,.13-.13*v, .02+v*.45],'red',journal);
  const turningPage=moving(group(0,.15,0,journal),'turning-journal-page');
  surface(22,10,(u,v)=>[.015+u*.76,.06*Math.sin(u*Math.PI),(v-.5)*.64],'light',turningPage);
  // Flat curling feedback arrows echo the open journal, without oversized pipes.
  for(const side of [-1,1]){
    const curve=new T.CatmullRomCurve3([new T.Vector3(side*.88,.41,2.91),new T.Vector3(side*1.40,.42,2.81),new T.Vector3(side*1.54,.44,2.40),new T.Vector3(side*1.20,.46,2.20)]);
    surface(1,50,(u,v)=>{const p=curve.getPoint(v),t=curve.getTangent(v);return [p.x-t.z*(u-.5)*.13,p.y,p.z+t.x*(u-.5)*.13];},'blue');
    const arrow=polygon([[-.17,0],[.17,0],[0,.28]],.025,'blue');arrow.rotation.x=-Math.PI/2;arrow.rotation.z=side*1.2;arrow.position.set(side*1.19,.46,2.20);
  }
  function plant(x,z,scale=1,potted=false,p=root){
    const g=group(x,.36,z,p);g.scale.setScalar(scale);
    if(potted){const pot=mesh(new T.CylinderGeometry(.19,.13,.28,40),'cream',g);pot.position.y=.14;disk(.16,.02,0,.284,0,'shade',g);}
    const base=potted ? .27 : 0;
    for(let i=0;i<5;i++){
      const a=(i-2)*.65,dx=Math.sin(a)*(.30+(i%2)*.10),dy=.42+(i%3)*.14,dz=Math.cos(a)*.12;
      surface(10,18,(u,v)=>{const width=Math.sin(v*Math.PI)*.115;return [dx*v+(u-.5)*2*width,base+dy*v,.02+dz*v+Math.abs(u-.5)*.065*Math.sin(v*Math.PI)];},i%2?'sage':'leaf',g);
      path([[0,base,.02],[dx*.5,base+dy*.5,dz*.5+.02],[dx,base+dy,dz+.02]],.006,'shade',g);
    }
  }
  plant(-3.68,-.80,1.1,true);plant(3.62,-.92,1.2);plant(-3.75,1.58,.95);plant(3.75,1.65,1.1);plant(-.95,-2.10,.85);plant(.95,-2.10,.85);
  for(let i=0;i<4;i++)flat(.40,.38,.09,-1.85,.41+i*.095,-1.70,'light',root,.015);
  for(const [x,z,s] of [[-3.55,2.08,.30],[-3.24,2.18,.18],[3.55,2.16,.26],[3.25,2.28,.17]])sphere(x,.39,z,s,s*.55,s*.55,'cream');
  // Learning: a book-filled arch sits at the end of the straight northern road.
  const library=group(0,.36,-2.20);
  function archShape(w,h){const a=new T.Shape();a.moveTo(-w/2,0);a.lineTo(w/2,0);a.lineTo(w/2,h-w/2);a.absarc(0,h-w/2,w/2,0,Math.PI,false);a.lineTo(-w/2,0);return a;}
  const back=extrude(archShape(1.40,1.94),.10,'shade',library,.015);back.position.z=-.24;
  const arch=archShape(1.52,2.05),opening=archShape(1.24,1.88);arch.holes.push(new T.Path(opening.getPoints(48)));
  const rim=extrude(arch,.30,'light',library,.015);rim.position.z=-.19;
  flat(1.56,.64,.10,0,.05,.05,'cream',library);
  let learningBook;
  for(const y of [.38,.80,1.22]){
    flat(1.18,.34,.045,0,y,-.02,'light',library,.012);
    for(let i=0;i<8;i++){
      const h=.22+(i%3)*.055,x=-.51+i*.143;
      const book=group(0,0,0,library);
      rounded(.105,h,.16,x,y+h/2+.028,-.04,i%3?'blue':'cream',book,.008);
      for(const offset of [-.07,.07])box(.078,.007,.008,x,y+h/2+offset,.047,'gold',book);
      if(y===1.22&&i===5)learningBook=moving(book,'learning-book');
    }
  }
  box(.045,1.3,.32,0,.74,-.01,'light',library);
  rod([0,1.94,.02],[0,1.73,.02],.012,'ink',library);
  const libraryShade=mesh(new T.ConeGeometry(.15,.14,36,1,true),'cream',library);libraryShade.position.set(0,1.67,.02);disk(.135,.012,0,1.60,.02,'glow',library);
  // Building a venture: a compact maker's workbench and an illuminated idea bulb.
  const workshop=group(-2.85,.36,1.27);
  disk(.78,.07,0,.055,.10,'light',workshop);
  flat(1.05,.50,.085,0,.73,0,'cream',workshop,.025);
  for(const x of [-.44,.44])for(const z of [-.18,.18])box(.07,.66,.07,x,.40,z,'shade',workshop);
  flat(.98,.40,.055,0,.23,0,'cream',workshop,.015);
  rounded(1.03,.66,.06,0,1.13,-.25,'cream',workshop,.025);
  for(let i=0;i<6;i++)for(let j=0;j<3;j++)faceDisk(.008,.006,-.42+i*.16,.94+j*.15,-.21,'shade',workshop);
  for(const x of [-.30,-.09]){rod([x,.91,-.16],[x,1.28,-.16],.025,'blue',workshop);box(.15,.055,.05,x,1.29,-.16,'blue',workshop);}
  path([[.12,.95,-.16],[.15,1.17,-.16],[.24,1.26,-.16]],.018,'blue',workshop);
  disk(.10,.08,.29,.82,.08,'gold',workshop);const ideaBulb=sphere(.29,1.02,.08,.13,.17,.13,'glow',workshop);ideaBulb.material=ideaBulb.material.clone();
  for(let i=0;i<6;i++){const a=i*Math.PI/3;rod([.29+Math.cos(a)*.20,1.03+Math.sin(a)*.23,.08],[.29+Math.cos(a)*.25,1.03+Math.sin(a)*.29,.08],.009,'gold',workshop);}
  flat(.30,.21,.045,-.25,.80,.06,'light',workshop,.008);
  disk(.18,.055,-.20,.43,.46,'blue',workshop);for(const dx of [-.10,.10])for(const dz of [-.10,.10])rod([-.20+dx,.11,.46+dz],[-.20+dx*.8,.41,.46+dz*.8],.023,'shade',workshop);
  // Taking a break: a slatted garden bench, tree canopy and low planting.
  const garden=group(2.85,.36,1.27);
  disk(.87,.07,0,.055,.10,'light',garden);
  for(const x of [-.46,.46])for(const z of [-.13,.20])rod([x,.10,z],[x,.50,z],.026,'blue',garden);
  for(let i=0;i<4;i++)flat(1.09,.078,.045,0,.51,-.10+i*.09,'cream',garden,.012);
  for(const x of [-.47,.47])rod([x,.30,-.19],[x,.94,-.19],.026,'blue',garden);
  for(let i=0;i<3;i++)rounded(1.09,.095,.045,0,.68+i*.11,-.18,'cream',garden,.012);
  for(const x of [-.53,.53])path([[x,.48,.24],[x,.69,.20],[x,.69,-.13],[x,.54,-.17]],.024,'blue',garden);
  const tree=moving(group(.42,.12,-.35,garden),'garden-tree');
  const treeStart=garden.children.length;
  rod([.42,.12,-.35],[.41,1.17,-.40],.045,'shade',garden);
  for(const [x,y,z,r] of [[.12,1.25,-.39,.29],[.40,1.46,-.38,.34],[.70,1.24,-.36,.28],[.42,1.22,-.57,.31]]){
    rod([.41,.82,-.40],[x,y,z],.023,'shade',garden);sphere(x,y,z,r,r*.84,r*.85,'sage',garden);
    for(let i=0;i<5;i++){const a=i*1.26;sphere(x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.45,z+.08,r*.40,r*.38,r*.40,i%2?'sage':'leaf',garden);}
  }
  root.updateMatrixWorld(true);
  for(const part of garden.children.slice(treeStart))tree.attach(part);
  plant(3.60,.92,.7);plant(2.14,1.60,.55);plant(-3.5,.91,.8);
  // One warm signal travels along a route; a quiet ring marks the destination.
  const signals=Array.from({length:4},(_,i)=>moving(sphere(0,.46,0,.055,.035,.055,'glow'),'route-signal-'+i));
  signals.forEach(o=>{o.castShadow=false;});
  const destination=moving(mesh(new T.TorusGeometry(.18,.012,8,48),'gold'),'destination-ring');
  destination.rotation.x=-Math.PI/2;destination.material=destination.material.clone();destination.material.transparent=true;destination.castShadow=false;
  const order=[3,0,2,1,4,5],duration=30;
  const smooth=v=>{v=T.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
  const ramp=(t,a,b)=>smooth((t-a)/(b-a));
  const attention=t=>ramp(t,1.0,2.0)*(1-ramp(t,3.9,4.8));
  const directions=order.map(i=>{const end=routes[i].getPoint(1);return Math.atan2(end.x,end.z-.12);});
  function animate(elapsed){
    const t=((elapsed%duration)+duration)%duration,index=Math.floor(t/5),phase=t%5,routeIndex=order[index];
    const active=attention(phase),route=routes[routeIndex];
    const previous=directions[(index+5)%6],next=directions[index];
    const delta=Math.atan2(Math.sin(next-previous),Math.cos(next-previous));
    human.rotation.y=previous+delta*ramp(phase,.15,1.25);
    // Keep the feet planted while giving the thinking pose a small weight shift.
    human.rotation.z=.014*Math.sin(t*Math.PI*2/5)*active;
    for(let i=0;i<signals.length;i++){
      const progress=(phase-.75-i*.15)/2.15,signal=signals[i];
      signal.visible=progress>0&&progress<1;
      signal.position.copy(route.getPoint(T.MathUtils.clamp(progress,0,1)));signal.position.y=.462;
      const size=(1-i*.14)*Math.sin(Math.PI*T.MathUtils.clamp(progress,0,1));
      signal.scale.set(.055*size,.035*size,.055*size);
    }
    destination.position.copy(route.getPoint(.90));destination.position.y=.46;
    destination.visible=phase>2.45&&phase<4.5;
    destination.material.opacity=ramp(phase,2.45,2.8)*(1-ramp(phase,3.5,4.5));
    destination.scale.setScalar(1+.6*ramp(phase,2.45,4.5));
    // Each destination answers in turn, rather than all moving simultaneously.
    const officeActive=routeIndex===0?active:0,learnActive=routeIndex===2?active:0;
    const opportunityActive=routeIndex===1?active:0,makerActive=routeIndex===3?active:0,gardenActive=routeIndex===4?active:0;
    screen.material.emissiveIntensity=.08+.8*officeActive;
    officeLight.intensity=.65+.6*officeActive;
    learningBook.position.z=.16*learnActive;
    door.rotation.y=1.80+.24*opportunityActive;
    ideaBulb.material.emissiveIntensity=.65+2.1*makerActive;
    tree.rotation.z=.045*Math.sin(t*Math.PI*2/5)*gardenActive;
    cards.forEach(({object,angle,y},i)=>{
      const selected=i===[0,1,6,5,2,3][index]?active:0;
      object.rotation.z=angle+.035*selected*Math.sin(phase*Math.PI);
      object.rotation.y=.10*selected;
      object.position.y=y+.04*selected;
    });
    balance.rotation.z=.09*Math.sin(t*Math.PI*2/10)*(routeIndex===5?1-active:1);
    turningPage.visible=routeIndex===5&&phase>1&&phase<4.2;
    turningPage.rotation.z=Math.PI*ramp(phase,1.2,3.8);
  }
  // Fit the entire movement, so the camera stays steady as parts articulate.
  const bounds=new T.Box3();
  for(let i=0;i<=60;i++){animate(i/60*duration);root.updateMatrixWorld(true);bounds.union(new T.Box3().setFromObject(root));}
  const framingPoints=[];
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])framingPoints.push(new T.Vector3(x,y,z));
  animate(0);root.updateMatrixWorld(true);
  // Batch each rigid branch in its own local coordinates, preserving moving joints.
  function batchBranch(parent){
    const keep=parent.children.filter(o=>o.userData.motion||o.isLight);
    for(const branch of keep)if(!branch.isMesh&&!branch.isLight)batchBranch(branch);
    const inverse=parent.matrixWorld.clone().invert(),batches=new Map();
    for(const branch of parent.children.filter(o=>!keep.includes(o)))branch.traverse(o=>{
      if(!o.isMesh)return;
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
      if(!batches.has(o.material))batches.set(o.material,{p:[],n:[],uv:[]});const b=batches.get(o.material);
      for(const v of g.attributes.position.array)b.p.push(v);for(const v of g.attributes.normal.array)b.n.push(v);
      if(g.attributes.uv)for(const v of g.attributes.uv.array)b.uv.push(v);else for(let i=0;i<g.attributes.position.count;i++)b.uv.push(0,0);
      g.dispose();o.geometry.dispose();
    });
    parent.clear();for(const o of keep)parent.add(o);
    for(const [material,b] of batches){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();const m=new T.Mesh(g,material);m.castShadow=m.receiveShadow=true;parent.add(m);}
  }
  batchBranch(root);
  root.userData={conceptual:true,artifactId:51,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:-.14,initialElevation:.50,framingPoints,animate,animationDuration:duration};
  return root;
}
