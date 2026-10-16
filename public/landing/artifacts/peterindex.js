// PeterIndex: a living relationship atlas in paper, cloth and brass.
export function createArtifact(T) {
  const root=new T.Group();root.name="peterindex-atlas";
  const moving=(o,name)=>{o.name=name;for(let p=o;p&&p!==root;p=p.parent)p.userData.motion=true;return o;};
  let seed=78; const pixels=new Uint8Array(128*128*4);
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
  mat.gold=new T.MeshStandardMaterial({color:0xb99451,metalness:.68,roughness:.30});
  mat.glass=new T.MeshPhysicalMaterial({color:0xc6dfdf,transparent:true,opacity:.22,roughness:.08,metalness:.1,depthWrite:false});
  flat(9.1,5.9,.30,0,.16,0,'cream',root,.42);
  flat(9.0,5.8,.05,0,.335,0,'light',root,.38);
  // Fine paths are inlaid into the tabletop; the red route reads as a flat ribbon.
  function ribbon(points,width,c,p=root){
    const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));
    surface(1,80,(u,v)=>{const q=curve.getPoint(v),t=curve.getTangent(v);const n=new T.Vector3(-t.z,0,t.x).normalize();q.addScaledVector(n,(u-.5)*width);return q.toArray();},c,p);
  }
  const nodes=[[-1.55,1.05],[.15,2.0],[2.15,1.65],[.45,-.65],[2.55,-.15]];
  const links=[[0,1],[0,3],[1,2],[1,3],[2,4],[3,4],[0,4]];
  const connectionCurves=[];
  for(const [a,b] of links){connectionCurves.push(new T.LineCurve3(new T.Vector3(nodes[a][0],.44,nodes[a][1]),new T.Vector3(nodes[b][0],.44,nodes[b][1])));const [x,z]=nodes[a],[u,v]=nodes[b];ribbon([[x,.402,z],[(x+u)/2,.402,(z+v)/2],[u,.402,v]],.028,'blue');}
  for(const [x,z] of [[-.6,.4],[1.1,.65],[3.45,1.30],[-.4,-1.10]]){
    disk(.09,.035,x,.395,z,'gold');
  }
  const introductionRoute=[[-2.25,.39,.45],[-1.65,.40,1.05],[-.80,.40,1.42],[.15,.40,2.0],[1.25,.40,2.35],[2.15,.40,1.65],[2.55,.40,.60],[2.80,.40,-.10],[3.15,.43,-.70],[3.15,.61,-1.0],[3.15,.77,-1.26],[3.15,.91,-1.55],[3.15,.92,-1.85]];
  ribbon(introductionRoute,.20,'red');
  // Cameo profiles, with coiffures and optional spectacles, replace block-shaped figures.
  function cameo(x,y,z,r,variant,p){
    const g=group(x,y,z,p);g.scale.setScalar(r/.40);
    faceDisk(.40,.018,0,0,0,'blueDark',g);
    const s=new T.Shape();s.moveTo(-.27,-.29);s.bezierCurveTo(-.23,-.19,-.12,-.18,-.08,-.14);s.lineTo(-.07,-.07);s.bezierCurveTo(-.24,.06,-.17,.27,-.03,.29);s.bezierCurveTo(.10,.31,.17,.24,.15,.13);s.lineTo(.23,.045);s.lineTo(.155,.015);s.lineTo(.16,-.045);s.quadraticCurveTo(.14,-.10,.075,-.10);s.lineTo(.07,-.16);s.bezierCurveTo(.13,-.18,.24,-.20,.26,-.29);s.closePath();
    const relief=extrude(s,.026,'cream',g,.007);relief.position.z=.018;
    path([[-.12,.07,.056],[-.14,.21,.056],[-.02,.27,.056],[.11,.24,.056]],.025,variant%2?'shade':'light',g);
    if(variant%2===0){sphere(-.15,.14,.04,.075,.095,.026,'shade',g);for(let j=0;j<5;j++)path([[-.15+j*.025,.13,.07],[-.12+j*.024,.21,.071],[-.03+j*.023,.26,.065]],.005,'cream',g);}
    else for(let j=0;j<4;j++)path([[-.12,.19+j*.013,.062],[-.04,.26+j*.008,.065],[.09,.25+j*.003,.061]],.005,'shade',g);
    sphere(.12,.11,.056,.012,.012,.008,'ink',g);
    if(variant===2){const glasses=mesh(new T.TorusGeometry(.043,.005,5,20),'gold',g);glasses.position.set(.12,.105,.070);rod([.08,.12,.07],[-.065,.15,.065],.004,'gold',g);}
    path([[-.15,-.20,.052],[-.02,-.30,.054],[.025,-.18,.055]],.005,'shade',g);
  }
  function card(x,y,z,w,h,variant,p=root){
    const g=group(x,y,z,p);rounded(w,h,.065,0,0,0,'light',g,.07);
    cameo(0,h*.14,.081,w*.35,variant,g);
    for(let i=0;i<3;i++)rounded(w*(i===2?.43:.58),.016,.012,.04,-h*.25-i*.065,.050,'shade',g,.006);
    for(let i=0;i<2;i++)faceDisk(.023,.014,-w*.32,-h*.25-i*.065,.06,'gold',g);
    const mark=polygon([[0,0],[.115,0],[.115,-.23],[.058,-.18],[0,-.23]],.025,'red',g);mark.position.set(w*.28,h/2+.025,.045);
    return g;
  }
  const portraits=[],halos=[];
  for(let i=0;i<nodes.length;i++){
    const [x,z]=nodes[i],height=i===3?.70:i===4?.57:.38;
    disk(.40,.13,x,.43,z,'cream');disk(.35,.025,x,.505,z,'light');
    disk(.095,.028,x,.535,z,'gold');rod([x,.53,z],[x,.53+height,z],.025,'gold');
    const c=moving(card(x,1.17+height,z,.90,1.25,i),'contact-'+i);c.rotation.y=i===0?-.08:i===2?.08:0;
    portraits.push({object:c,y:c.position.y,yaw:c.rotation.y});
    const halo=moving(mesh(new T.TorusGeometry(.37,.024,8,48),'gold'),'contact-halo-'+i);halo.rotation.x=-Math.PI/2;halo.position.set(x,.54,z);halos.push(halo);
  }
  // The book is built in local upright coordinates and leans back into its cradle.
  const book=group(-2.25,1.68,-1.15);book.rotation.x=-.48;book.rotation.y=.08;
  for(const side of [-1,1]){
    const page=group(side*.06,0,0,book);page.rotation.y=side*.075;
    rounded(1.69,2.69,.085,side*.83,0,-.10,'red',page,.065);
    rounded(1.60,2.58,.025,side*.82,0,-.044,'redDark',page,.035);
    for(let layer=0;layer<11;layer++){
      surface(24,3,(u,v)=>[side*(.03+u*1.55),-1.23+v*2.46,.006+layer*.008+.085*Math.sin(u*Math.PI)],layer%3?'cream':'shade',page);
      path([[side*.05,-1.234,layer*.008],[side*.8,-1.234,.085+layer*.008],[side*1.58,-1.234,layer*.008]],.003,'shade',page);
    }
    for(let row=0;row<3;row++){
      const y=.76-row*.65;
      cameo(side*.30,y,.142,.115,row+1,page);
      for(let line=0;line<3;line++)path([[side*.49,y+.07-line*.08,.170],[side*.94,y+.07-line*.08,.173],[side*(line===2?1.18:1.42),y+.07-line*.08,.15]],.008,'shade',page);
    }
  }
  path([[0,-1.36,.05],[0,0,.10],[0,1.36,.03]],.045,'redDark',book);
  surface(1,48,(u,v)=>[(u-.5)*.11,-1.32+v*2.65,.18+.035*Math.sin(v*Math.PI)],'red',book);
  const bookmarks=[];
  for(let i=0;i<3;i++)bookmarks.push(moving(card(-1.05+i*1.03,1.53,-.10,.66,.87,i+1,book),'journal-contact-'+i));
  for(const x of [-3.55,-1.02]){
    rod([x,.39,-.10],[x,.68,-.14],.04,'gold');rod([x,.39,-1.52],[x,1.08,-1.70],.035,'gold');
    path([[x,.50,-.12],[x,.55,.03],[x,.70,.08]],.035,'gold');
  }
  rod([-3.64,.54,-.02],[-.86,.54,-.02],.035,'gold');
  // Layered architectural arch with a real opening, warm recessed light and paneled door.
  function arch(w,h){const s=new T.Shape(),r=w/2;s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h-r);s.absarc(0,h-r,r,0,Math.PI,false);s.lineTo(-r,0);return s;}
  function archFrame(w,h,innerW,innerH,d,z,p,c='cream'){
    const s=arch(w,h),hole=new T.Path(),r=innerW/2;hole.moveTo(-r,0);hole.lineTo(-r,innerH-r);hole.absarc(0,innerH-r,r,Math.PI,0,true);hole.lineTo(r,0);hole.closePath();s.holes.push(hole);
    const m=extrude(s,d,c,p,.018);m.position.z=z;return m;
  }
  const portal=group(3.15,.70,-1.85);
  for(let i=0;i<3;i++){
    const stair=disk(.91-i*.13,.13,3.15,.44+i*.13,-1.40-i*.12,'cream');stair.scale.z=.77;
  }
  archFrame(1.76,3.25,1.21,2.93,.30,-.14,portal);
  archFrame(1.60,3.12,1.36,2.99,.06,.18,portal,'light');
  archFrame(1.32,2.96,1.20,2.88,.065,.22,portal,'gold');
  const glow=extrude(arch(1.19,2.88),.022,'glow',portal,.005);glow.position.z=-.16;
  const hinge=moving(group(-.57,.02,.16,portal),'opportunity-door');hinge.rotation.y=-1.05;
  const door=extrude(arch(1.12,2.83),.07,'red',hinge,.014);door.position.x=.56;
  for(const y of [.62,1.83]){rounded(.82,.94,.035,.56,y,.085,'redDark',hinge,.035);rounded(.73,.85,.028,.56,y,.11,'red',hinge,.025);}
  sphere(.95,1.27,.15,.05,.05,.035,'gold',hinge);
  for(const y of [.35,2.35])rod([.015,y,0],[.015,y+.15,0],.025,'gold',hinge);
  // A small working magnifier and folded navy plants finish the tabletop composition.
  const glass=moving(group(-2.95,.48,1.83),'search-magnifier');glass.rotation.y=-.45;
  const rim=mesh(new T.TorusGeometry(.33,.025,10,48),'gold',glass);rim.rotation.x=Math.PI/2;
  disk(.31,.01,0,0,0,'glass',glass);rod([.33,0,0],[1.03,0,0],.045,'blueDark',glass);
  for(const x of [.40,1.00]){const collar=mesh(new T.TorusGeometry(.046,.011,6,20),'gold',glass);collar.rotation.y=Math.PI/2;collar.position.x=x;}
  function plant(x,z,size){const g=group(x,.39,z);disk(.22,.14,0,.07,0,'cream',g);
    for(let i=0;i<7;i++){const a=i*2.4,h=size*(.65+(i%3)*.15),dx=Math.cos(a)*.30,dz=Math.sin(a)*.30;
      rod([0,.13,0],[dx,h,dz],.009,'gold',g);
      surface(2,12,(u,v)=>{const w=Math.sin(Math.PI*v)*size*.10;return [dx*v-Math.sin(a)*(u-.5)*w*2,.13+h*v+.10*Math.sin(v*Math.PI)-Math.abs(u-.5)*w,dz*v+Math.cos(a)*(u-.5)*w*2];},i%2?'blue':'blueDark',g);
    }
  }
  plant(-4.0,1.53,.90);plant(4.02,.35,1.16);
  // Small travelling brass lights make the relationship and introduction paths legible.
  const connectionLights=connectionCurves.map((_,i)=>moving(sphere(0,0,0,.052,.032,.052,'gold'),'connection-signal-'+i));
  const route=new T.CatmullRomCurve3(introductionRoute.map(([x,y,z])=>new T.Vector3(x,y+.055,z)));
  const warmLights=Array.from({length:3},(_,i)=>moving(sphere(0,0,0,.065,.04,.065,'glow'),'introduction-signal-'+i));
  const duration=20,tau=Math.PI*2;
  const ease=(t,a,b)=>{const u=T.MathUtils.clamp((t-a)/(b-a),0,1);return u*u*(3-2*u);};
  const pulse=(t,a,b,c,d)=>ease(t,a,b)*(1-ease(t,c,d));
  function animate(elapsed){
    const t=((elapsed%duration)+duration)%duration,phase=t/duration*tau;
    // Remember three conversations, then follow the warm path through the foreground contacts.
    bookmarks.forEach((c,i)=>{const active=pulse(t,.4+i*.7,1.1+i*.7,3.5+i*.7,4.3+i*.7);c.position.y=1.53+.27*active;c.rotation.z=.035*Math.sin(phase*2+i)*active;});
    const arrivals=[4.2,6.6,9,5.4,10.8];
    portraits.forEach(({object,y,yaw},i)=>{const active=pulse(t,arrivals[i]-.8,arrivals[i],arrivals[i]+1.1,arrivals[i]+2.0);object.position.y=y+.16*active;object.rotation.y=yaw+.13*Math.sin(phase*2+i)*active;halos[i].scale.setScalar(1+.20*active);halos[i].position.y=.54+.035*active;});
    connectionLights.forEach((light,i)=>{const u=(t/4+i/connectionLights.length)%1;light.position.copy(connectionCurves[i].getPoint(u));light.scale.set(.052,.032,.052).multiplyScalar(Math.max(.001,Math.sin(u*Math.PI)));});
    warmLights.forEach((light,i)=>{const u=(t-2.6-i*.32)/10.5;light.position.copy(route.getPoint(T.MathUtils.clamp(u,0,1)));light.scale.set(.065,.04,.065).multiplyScalar(Math.max(.001,pulse(t,2.6+i*.32,3.1+i*.32,12.6+i*.32,13.1+i*.32)));});
    // The destination opens as the introduction arrives, then settles back for the next loop.
    const open=pulse(t,10.7,13.0,16.4,19.5);hinge.rotation.y=-.22-1.02*open;mat.glow.emissiveIntensity=.65+1.1*open;
    const searching=pulse(t,.1,1.2,3.6,5.0);glass.position.x=-2.95+.22*Math.sin(phase*3)*searching;glass.position.y=.48+.10*searching;glass.rotation.y=-.45+.24*Math.sin(phase*2)*searching;
  }
  const bounds=new T.Box3();
  for(let i=0;i<=80;i++){animate(i/80*duration);root.updateMatrixWorld(true);bounds.union(new T.Box3().setFromObject(root));}
  const framingPoints=[];for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])framingPoints.push(new T.Vector3(x,y,z));
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
    for(const [material,b] of batches){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();const m=new T.Mesh(g,material);m.castShadow=m.receiveShadow=!material.transparent;parent.add(m);}
  }
  batchBranch(root);
  root.userData={conceptual:true,artifactId:78,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:.12,initialElevation:.42,framingPoints,animate,animationDuration:duration};
  return root;
}
