// DevDuel: a folded-paper arena, modeled after the project's concept artwork.
// All silhouettes, symbols and folds are geometry, so the exhibit works from every angle.
export function createArtifact(T) {
  const root = new T.Group(); root.name = 'devduel-paper-arena';
  const cloth = [], champions = [];
  const moving = (object, name) => { object.name=name; object.userData.motion=true; return object; };
  function clothMotion(object, kind, side=1) {
    moving(object, `${kind}-${side}`);
    cloth.push({ object, kind, side, rest: object.geometry.attributes.position.array.slice() });
    object.geometry.computeBoundingSphere(); object.geometry.boundingSphere.radius += .25;
    return object;
  }
  // Reparent already modeled parts around an anatomical joint, preserving the pose.
  function joint(parent, parts, xyz, name) {
    const pivot=moving(group(parent,...xyz),name);
    for(const part of parts) { part.position.sub(pivot.position); pivot.add(part); }
    return pivot;
  }
  let seed = 53;
  const grain = new Uint8Array(128 * 128 * 4);
  for (let i = 0; i < grain.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const n = 130 + (seed / 4294967296 - .5) * 65;
    grain[i] = grain[i+1] = grain[i+2] = n; grain[i+3] = 255;
  }
  const texture = new T.DataTexture(grain, 128, 128, T.RGBAFormat);
  texture.wrapS = texture.wrapT = T.RepeatWrapping; texture.repeat.set(3, 3); texture.needsUpdate = true;
  const paper = color => new T.MeshStandardMaterial({ color, roughness: .88, bumpMap: texture, bumpScale: .013, side: T.DoubleSide });
  const mat = {
    ivory: paper(0xf3e5c9), cream: paper(0xfff2d9), shade: paper(0xcab797),
    red: paper(0xb53226), redShade: paper(0x7c231d), blue: paper(0x234b6c), blueShade: paper(0x162f4c),
    gold: new T.MeshStandardMaterial({color:0xcda466, metalness:.65, roughness:.36}),
    ink: paper(0x524b43),
  };
  function group(parent=root, x=0,y=0,z=0) { const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g; }
  function mesh(geo,color='ivory',parent=root) { const m=new T.Mesh(geo,mat[color]);m.castShadow=m.receiveShadow=true;parent.add(m);return m; }
  function box(w,h,d,x,y,z,c='ivory',p=root) {const m=mesh(new T.BoxGeometry(w,h,d),c,p);m.position.set(x,y,z);return m;}
  function disk(r,h,x,y,z,c='ivory',p=root) {const m=mesh(new T.CylinderGeometry(r,r,h,80),c,p);m.position.set(x,y,z);return m;}
  function faceDisk(r,h,x,y,z,c='ivory',p=root) {const m=disk(r,h,x,y,z,c,p);m.rotation.x=Math.PI/2;return m;}
  function ball(r,x,y,z,c='ivory',p=root,detail=2) {const geo=new T.IcosahedronGeometry(r,detail);if(detail<2)geo.computeVertexNormals();const m=mesh(geo,c,p);m.position.set(x,y,z);return m;}
  function ring(r,t,x,y,z,c='gold',p=root) {const m=mesh(new T.TorusGeometry(r,t,8,96),c,p);m.position.set(x,y,z);return m;}
  function path(points,r,c,p=root) {return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),40,r,8,false),c,p);}
  function rod(a,b,r1,r2,c,p=root,sides=6) {
    const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);
    const m=mesh(new T.CylinderGeometry(r2,r1,delta.length(),sides),c,p);
    m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;
  }
  function shape(points,depth,c,p=root) {
    const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
    return mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:24}),c,p);
  }
  function rounded(w,h,d,x,y,z,c,p=root,r=.07) {
    const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
    s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
    s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const m=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,curveSegments:8}),c,p);m.position.set(x,y,z);return m;
  }
  function surface(nx,ny,sample,c,p=root,flat=false) {
    const pos=[],uv=[],ix=[];
    for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){pos.push(...sample(i/nx,j/ny));uv.push(i/nx,j/ny);if(i<nx&&j<ny){const a=j*(nx+1)+i;ix.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}}
    let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);
    if(flat)g=g.toNonIndexed();g.computeVertexNormals();return mesh(g,c,p);
  }
  // Thick limestone-paper dais. The opening at the front is filled by three stairs.
  const base=mesh(new T.CylinderGeometry(3.12,3.12,.40,128,1,false,.19,Math.PI*2-.38));base.position.y=.2;
  disk(2.87,.4,0,.2,0);
  for(let i=0;i<3;i++)box(1.18,.10, .58,0,.05+i*.10,3.02-i*.17,'ivory');
  for(const [side,c] of [[-1,'red'],[1,'blue']]) {
    const a=side<0?Math.PI/2+.12:-Math.PI/2+.12;
    const sector=mesh(new T.RingGeometry(1.82,2.92,64,1,a,Math.PI-.24),c);
    sector.rotation.x=-Math.PI/2;sector.position.y=.404;
  }
  disk(1.80,.022,0,.412,0,'cream');
  const rim=ring(1.81,.014,0,.428,0);rim.rotation.x=-Math.PI/2;
  // Radial seams add scale without turning the stage into a checkerboard.
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    path([[Math.sin(a)*1.85,.413,Math.cos(a)*1.85],[Math.sin(a)*2.91,.413,Math.cos(a)*2.91]],.003,'shade');
  }
  for(const [side,c] of [[-1,'red'],[1,'blue']]){
    const positions=[[side*2.67,.90],[side*1.84,2.28]];
    for(const [x,z] of positions){disk(.11,.49,x,.65,z,'ivory');disk(.135,.055,x,.88,z,'gold');ball(.145,x,1.045,z,'gold');disk(.15,.035,x,.425,z,'shade');}
    path([[positions[0][0],.94,positions[0][1]],[side*2.36,.77,1.58],[positions[1][0],.94,positions[1][1]]],.042,c);
  }
  // The banners and cards frame the wheel, as in the reference image.
  for(const [side,c] of [[-1,'red'],[1,'blue']]){
    const x=side*2.70,z=-.93;
    disk(.14,.14,x,.49,z,'gold');rod([x,.52,z],[x,2.92,z],.044,.044,'gold');
    ball(.12,x,3.03,z,'gold');disk(.069,.1,x,2.86,z,'gold');
    const flag=moving(group(root,x,2.76,z),`flag-rig-${side}`);
    clothMotion(surface(12,16,(u,v)=>[side*(.04+u*.47),-v*(1.25-.22*Math.sin(Math.PI*u)),.04+Math.sin(u*3+v*1.5)*.055],c,flag),'flag',side);
    rod([0,0,.015],[side*.55,0,.015],.035,.035,c,flag);
    const card=group(root,side*1.84,2.10,-1.35);card.rotation.y=-side*.12;
    rounded(1.34,2.09,.09,0,0,0,'ivory',card);
    rounded(1.26,2.01,.02,0,0,.098,'cream',card);
    faceDisk(.34,.032,0,.51,.13,c,card);
    faceDisk(.12,.03,0,.61,.17,'cream',card);
    const bust=new T.Shape();bust.absarc(0,0,.24,0,Math.PI,false);bust.lineTo(-.24,-.075);bust.lineTo(.24,-.075);bust.closePath();
    const b=mesh(new T.ExtrudeGeometry(bust,{depth:.025,bevelEnabled:false}),'cream',card);b.position.set(0,.29,.17);
    for(let i=0;i<4;i++)rounded(.82-i*.10,.067,.025,-i*.05,-.09-i*.18,.14,c,card,.03);
    box(.09,.43,.09,side*1.84,.61,-1.38,'shade');
  }
  // Draped blank ribbon with folded swallow-tail ends.
  for(const x of [-1.12,1.12]){rod([x,.42,-1.64],[x,3.78,-1.64],.022,.022,'gold');ball(.115,x,3.83,-1.64,'gold');}
  clothMotion(surface(36,10,(u,v)=>[(u-.5)*2.24,3.78-.17*Math.sin(u*Math.PI)-v*.54,-1.57+.11*Math.sin(u*Math.PI)],'cream'),'banner');
  for(const side of [-1,1]){
    const tail=shape([[side*1.08,3.65],[side*1.47,3.25],[side*1.23,3.20],[side*1.36,2.98],[side*.96,3.18]],.025,'ivory');tail.position.z=-1.66;
    shape([[side*1.10,3.30],[side*.95,3.10],[side*.94,3.32]],.03,'shade').position.z=-1.62;
  }
  // A six-part embossed skills wheel, with actual symbols instead of dots.
  const wheel=moving(group(root,0,1.68,-.65),'comparison-wheel'), wr=.92; wheel.scale.setScalar(1.10);
  faceDisk(wr+.065,.13,0,0,0,'ivory',wheel);
  for(let i=0;i<6;i++){
    const a=Math.PI/3+i*Math.PI/3;
    const s=new T.Shape();s.moveTo(0,0);s.absarc(0,0,wr-.035,a,a+Math.PI/3,false);s.lineTo(0,0);
    const m=mesh(new T.ExtrudeGeometry(s,{depth:.022,bevelEnabled:false}),i%2?'cream':'blue',wheel);m.position.z=.079;
    rod([0,0,.115],[Math.cos(a)*.89,Math.sin(a)*.89,.115],.013,.013,'gold',wheel,8);
  }
  ring(wr,.035,0,0,.096,'cream',wheel);ring(wr+.044,.010,0,0,.10,'gold',wheel);
  faceDisk(.151,.065,0,0,.131,'gold',wheel);faceDisk(.127,.018,0,0,.17,'cream',wheel);
  // top bulb (sector centered at 90 degrees)
  const bulb=group(wheel,0,.58,.125);
  ball(.094,0,.025,.018,'cream',bulb,2).scale.z=.35;
  shape([[-.06,.005],[.06,.005],[.037,-.104],[-.037,-.104]],.025,'cream',bulb);
  for(let i=0;i<3;i++)box(.074,.012,.035,0,-.115-i*.018,.013,'gold',bulb);
  const people=group(wheel,.50,.28,.125);
  for(const [x,y,r] of [[-.115,0,.052],[.115,0,.052],[0,.045,.063]]){
    faceDisk(r,.03,x,y+.05,.015,'blue',people);
    rounded(r*1.9,.10,.028,x,y-.045,.015,'blue',people,r*.7);
  }
  const heart=new T.Shape();heart.moveTo(0,-.14);heart.bezierCurveTo(-.30,.05,-.12,.24,0,.09);heart.bezierCurveTo(.12,.24,.30,.05,0,-.14);
  mesh(new T.ExtrudeGeometry(heart,{depth:.03,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2}),'cream',group(wheel,.50,-.29,.124));
  for(let i=0;i<3;i++)box(.070,.11+i*.08,.035,-.11+i*.11,-.69+(.11+i*.08)/2,.14,'blue',wheel);
  const speech=group(wheel,-.50,-.29,.125);const bubble=faceDisk(.13,.03,0,.018,0,'cream',speech);bubble.scale.y=.8;
  shape([[-.055,-.04],[-.11,-.14],[.025,-.055]],.03,'cream',speech);
  for(let i=0;i<3;i++)faceDisk(.013,.012,-.055+i*.055,.025,.025,'blue',speech);
  const gear=group(wheel,-.50,.29,.126);
  const gearPts=[];for(let i=0;i<40;i++){const a=i/40*Math.PI*2,r=i%4<2?.14:.11;gearPts.push([Math.cos(a)*r,Math.sin(a)*r]);}
  shape(gearPts,.035,'blue',gear);faceDisk(.059,.009,0,0,.04,'ivory',gear);
  box(.14,.20,.20,0,.52,-.70,'shade');
  // A tapered, triangulated paper volume, with deliberate folds on its front.
  function foldedBody(rings,c,p) {
    const pos=[],ix=[];const n=6;
    for(const [y,w,d,z] of rings)for(let k=0;k<n;k++){const a=k/n*Math.PI*2;pos.push(Math.sin(a)*w,y,z+Math.cos(a)*d);}
    for(let j=0;j<rings.length-1;j++)for(let k=0;k<n;k++){const a=j*n+k,b=j*n+(k+1)%n;ix.push(a,b,a+n,b,b+n,a+n);}
    ix.push(0,2,1,0,3,2,0,4,3,0,5,4);const a=(rings.length-1)*n;ix.push(a,a+1,a+2,a,a+2,a+3,a,a+3,a+4,a,a+4,a+5);
    let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(ix);g=g.toNonIndexed();g.computeVertexNormals();return mesh(g,c,p);
  }
  for(const side of [-1,1]){
    const c=side<0?'red':'blue', hero=moving(group(root,side*1.35,.53,.57),`champion-${side}`);hero.rotation.y=-side*.43;
    disk(.63,.13,0,-.065,0,'ivory',hero);disk(.59,.022,0,.01,0,'cream',hero);
    const edge=ring(.58,.008,0,.029,0,'gold',hero);edge.rotation.x=Math.PI/2;
    // Feet planted wide, bent knees and a triangular tailored torso.
    for(const leg of [-1,1]){
      const hip=[leg*.13,.79,0], knee=[leg*.25,.45,.035], ankle=[leg*.37,.10,.09];
      rod(hip,knee,.155,.12,'ivory',hero,5);rod(knee,ankle,.11,.065,'cream',hero,5);
      const boot=shape([[-.11,0],[.15,0],[.08,.10],[-.05,.16]],.23,'ivory',hero);boot.position.set(leg*.37,.035,.01);boot.rotation.y=leg*-.20;
    }
    const torsoStart=hero.children.length;
    foldedBody([[.70,.14,.13,0],[.99,.25,.17,0],[1.34,.34,.19,-.015],[1.44,.16,.13,-.025]],'cream',hero);
    const chest=shape([[-.23,1.27],[.02,1.39],[.16,.96],[-.11,1.10]],.016,'ivory',hero);chest.position.z=.18;
    rod([0,1.37,0],[0,1.58,0],.085,.085,'ivory',hero);
    const headStart=hero.children.length;
    const head=ball(.31,0,1.74,.035,'cream',hero,1);head.scale.set(.94,1.03,.86);
    for(const x of [-.26,.26]){const ear=ball(.07,x,1.72,.01,'ivory',hero,1);ear.scale.set(.5,1,1);}
    // Hair is a layered crown of folded pointed locks, not two cones.
    ball(.30,0,1.92,-.045,'ivory',hero,1).scale.set(1.07,.63,.88);
    for(let i=0;i<11;i++){
      const a=i/11*Math.PI*2;
      const start=[Math.cos(a)*.18,1.87+Math.sin(a)*.10,-.035];
      const end=[Math.cos(a)*(.38+(i%3)*.025),1.91+Math.sin(a)*.28,.02-(i%3)*.075];
      rod(start,end,.135,0,i%3===0?'ivory':'cream',hero,3);
    }
    for(let i=0;i<4;i++)rod([-.20+i*.13,1.99,.17],[-.24+i*.13,1.73+(i%2)*.12,.22],.10,0,'ivory',hero,3);
    for(const x of [-.10,.10])faceDisk(.018,.014,x,1.78,.292,'ink',hero);
    const mouth=moving(mesh(new T.CircleGeometry(.058,24),'ink',hero),`speaking-mouth-${side}`);
    mouth.position.set(0,1.635,.294);mouth.scale.y=.12;
    const headJoint=joint(hero,hero.children.slice(headStart),[0,1.51,0],`head-${side}`);
    const inward=-side;
    const armStart=hero.children.length;
    // An open, upward-facing palm presents an argument rather than a clenched fist.
    rod([inward*.28,1.29,0],[inward*.46,1.10,.10],.095,.075,'ivory',hero,5);
    rod([inward*.46,1.10,.10],[inward*.65,1.24,.25],.075,.055,'cream',hero,5);
    const palm=ball(.10,inward*.69,1.27,.28,'ivory',hero,1);palm.scale.set(1,.44,.86);
    for(let j=0;j<4;j++)rod([inward*.70,1.29,.205+j*.046],
      [inward*(.83+(j===1||j===2?.025:0)),1.32,.205+j*.046],.019,.013,'cream',hero,5);
    rod([inward*.67,1.27,.35],[inward*.74,1.29,.40],.027,.018,'ivory',hero,5);
    const armJoint=joint(hero,hero.children.slice(armStart),[inward*.28,1.29,0],`speaking-arm-${side}`);
    rod([side*.28,1.28,0],[side*.48,1.01,.025],.10,.073,'ivory',hero,5);
    rod([side*.48,1.01,.025],[side*.24,.88,.21],.075,.058,'cream',hero,5);
    ball(.079,side*.24,.89,.21,'ivory',hero,1);
    // Wide pleated cape: a pinned shoulder, an outside sweep and scalloped hem.
    clothMotion(surface(8,5,(u,v)=>{
      const x=side*((-.28+u*1.57)*(1-v)+(-.38+u*1.53)*v);
      const y=(1.40-u*.26+.18*Math.sin(u*Math.PI*2))*(1-v)+(.48-u*.09+.14*Math.sin(u*Math.PI*3))*v;
      return [x,y+.065*Math.sin(u*Math.PI*5)*v,
        -.20-u*.29-v*.16+Math.sin(u*Math.PI*4)*(.045+v*.13)];
    },c,hero,true),'cape',side);
    surface(20,3,(u,v)=>[(u-.5)*.72,1.40-v*.17-.10*Math.sin(Math.PI*u),.02+Math.sin(Math.PI*u)*.25+v*.04],c,hero);
    faceDisk(.08,.035,0,1.30,.295,'gold',hero);
    const bodyJoint=joint(hero,hero.children.slice(torsoStart),[0,.76,0],`torso-${side}`);
    // Raised paper speech cards make the turn-taking clear even without sound.
    const speechCard=moving(group(root,side*1.22,3.00,.87),`speech-card-${side}`);
    rounded(1.69,.48,.035,0,0,0,c,speechCard,.12);
    rounded(1.61,.40,.018,0,0,.042,'cream',speechCard,.095);
    shape([[side*.23,-.18],[side*.35,-.37],[side*.03,-.18]],.025,c,speechCard).position.z=.01;
    const phrases=side<0?['My results speak.','I bring the skills.']:['Show me the proof.','Let’s compare.'];
    const labels=phrases.map((phrase,index)=>{
      const label=moving(group(speechCard),`reply-${side}-${index}`);
      if(typeof document!=='undefined'){
        const canvas=document.createElement('canvas');canvas.width=768;canvas.height=160;
        const ctx=canvas.getContext('2d');ctx.clearRect(0,0,768,160);
        ctx.fillStyle=side<0?'#8b251d':'#193e5d';ctx.font='600 62px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(phrase,384,70,700);
        const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
        const text=new T.Mesh(new T.PlaneGeometry(1.49,.31),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));
        text.position.set(0,.035,.102);text.userData.noShadow=true;label.add(text);
      }
      return label;
    });
    const dots=[];
    for(let i=0;i<3;i++){
      const dot=moving(faceDisk(.021,.012,-.09+i*.09,-.125,.081,c,speechCard),`speech-dot-${side}-${i}`);dots.push(dot);
    }
    champions.push({side,bodyJoint,headJoint,armJoint,mouth,speechCard,labels,dots});
  }
  // Hollow megaphone with rolled lip, throat and a folded handle.
  const horn=group(root,-2.04,.34,2.63);horn.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(.60,.13,.78).normalize());
  const cone=mesh(new T.CylinderGeometry(.29,.08,.48,32,1,true),'red',horn);
  const lip=ring(.29,.025,0,.24,0,'red',horn);lip.rotation.x=Math.PI/2;
  disk(.075,.14,0,-.30,0,'redShade',horn);disk(.09,.01,0,-.12,0,'redShade',horn);
  const handle=shape([[-.045,-.16],[.045,-.16],[.08,-.42],[-.10,-.42]],.07,'red',horn);handle.position.z=.07;
  // A spoken exchange: claim, rebuttal, counterpoint, response. No audio required.
  const duration=12, tau=Math.PI*2;
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10);};
  const speechTurn=(t,start,end)=>smooth((t-start)/.22)*(1-smooth((t-end+.25)/.25));
  function animate(time) {
    const t=(Number.isFinite(time)?Math.max(0,time):0)%duration;
    const breeze=t*tau/4;
    const red=speechTurn(t,.35,3.0)+speechTurn(t,6.3,8.55);
    const blue=speechTurn(t,3.25,6.0)+speechTurn(t,8.8,11.65);
    for(const {side,bodyJoint,headJoint,armJoint,mouth,speechCard,labels,dots} of champions) {
      const speaking=side<0?red:blue, listening=side<0?blue:red;
      const beat=Math.sin(t*tau*2.5+side*.6);
      bodyJoint.rotation.x=.015*Math.sin(breeze)+speaking*.025;
      bodyJoint.rotation.z=side*(speaking*.045+Math.sin(breeze)*.008);
      headJoint.rotation.y=-side*(.28+speaking*.09);
      headJoint.rotation.x=speaking*(.025+beat*.045)+listening*.055*Math.sin(t*tau);
      headJoint.rotation.z=side*listening*.06;
      armJoint.rotation.x=.20-speaking*(.32+.09*beat);
      armJoint.rotation.z=side*(.08-speaking*(.23+.065*Math.sin(t*tau*1.5)));
      mouth.scale.y=.12+speaking*(.26+.50*Math.pow(Math.sin(t*tau*3.5),2));
      speechCard.visible=speaking>.015;
      speechCard.scale.setScalar(.91+.09*speaking);
      speechCard.position.y=3.00+speaking*.028;
      labels[0].visible=t<6.1;labels[1].visible=t>=6.1;
      dots.forEach((dot,i)=>{const pulse=.7+.3*Math.sin(t*tau*2-i*1.3);dot.scale.set(pulse,1,pulse);});
    }
    wheel.rotation.z=0;
    for(const {object,kind,side,rest} of cloth) {
      const pos=object.geometry.attributes.position, uv=object.geometry.attributes.uv;
      for(let i=0;i<pos.count;i++) {
        const u=uv.getX(i),v=uv.getY(i),j=i*3;
        const phase=breeze-u*3.8-v*2.4+side*.5;
        const weight=kind==='banner'?Math.sin(Math.PI*u):kind==='flag'?v*(.30+.70*u):Math.min(1,v*.72+u*.48);
        pos.setXYZ(i,rest[j],rest[j+1]+weight*Math.sin(phase)*.023,
          rest[j+2]+weight*Math.sin(phase)*(kind==='cape'?.115:kind==='flag'?.085:.035));
      }
      pos.needsUpdate=true;object.geometry.computeVertexNormals();
    }
  }
  // Sample the moving pieces before batching, so the entire loop stays in frame.
  const boxes=new Map();
  for(let frame=0;frame<=48;frame++) {
    animate(frame/48*duration);root.updateMatrixWorld(true);
    root.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();
      const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
      if(boxes.has(o))boxes.get(o).union(b);else boxes.set(o,b);
    });
  }
  const framingPoints=[];
  for(const b of boxes.values())for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));
  animate(0);root.updateMatrixWorld(true);
  // Batch each rigid branch locally; animated joints and cloth remain independent.
  function batchBranch(parent) {
    const keep=parent.children.filter(o=>o.userData.motion);
    for(const branch of keep)if(!branch.isMesh)batchBranch(branch);
    const statics=parent.children.filter(o=>!o.userData.motion);
    const inverse=parent.matrixWorld.clone().invert(),batches=new Map();
    for(const branch of statics)branch.traverse(o=>{
      if(!o.isMesh)return;
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
      g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
      if(!batches.has(o.material))batches.set(o.material,{p:[],n:[],uv:[]});
      const b=batches.get(o.material),uv=g.getAttribute('uv');
      for(const v of g.attributes.position.array)b.p.push(v);
      for(const v of g.attributes.normal.array)b.n.push(v);
      if(uv)for(const v of uv.array)b.uv.push(v);else for(let i=0;i<g.attributes.position.count;i++)b.uv.push(0,0);
      g.dispose();o.geometry.dispose();
    });
    parent.clear();for(const object of keep)parent.add(object);
    for(const [material,b] of batches) {
      const g=new T.BufferGeometry();
      g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));
      g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));
      g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();
      const m=new T.Mesh(g,material);m.userData.noShadow=material.isMeshBasicMaterial===true;m.castShadow=m.receiveShadow=!m.userData.noShadow;parent.add(m);
    }
  }
  batchBranch(root);
  root.userData={conceptual:true,artifactId:53,displayBase:false,groundLevel:0,initialYaw:.06,initialElevation:.34,studioProfile:'paper',framingPoints,animate,animationDuration:duration};
  animate(0);
  return root;
}
