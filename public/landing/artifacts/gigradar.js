import { sculpture } from './sculpture.js';

// Source-led interpretation of hackathon 54, not a replica of the Telegram UI.
// The four chapters follow the LinkedIn demo: ask, discover, verify, imagine.
export function createArtifact(T) {
  const { root, materials: m, mesh, box, disk, ball, line, finish } = sculpture(T);
  root.name = 'gigradar-event-district';
  const material = (color, extra = {}) => new T.MeshStandardMaterial({ color, roughness: .55, ...extra });
  Object.assign(m, {
    stone: material(0xeadcc3), trim: material(0xd1bc94), cream: material(0xfff0d4),
    brass: material(0xba8843, { metalness: .72, roughness: .31 }),
    cobalt: material(0x075dad, { metalness: .35, roughness: .26 }),
    screen: material(0x073e70, { emissive: 0x03416e, emissiveIntensity: .35 }),
    petrol: material(0x092f39, { metalness: .28, roughness: .28 }),
    coral: material(0xc56142), curtain: material(0x8d3225), leaf: material(0x486a44),
    mint: material(0x65e5df, { emissive: 0x27c8cc, emissiveIntensity: .65 }),
    glow: material(0xffd49a, { emissive: 0xffad4a, emissiveIntensity: 1.2 }),
    pink: material(0xe69eaa), water: material(0x226374, { metalness: .6, roughness: .2 }),
  });
  const kept = [];
  function group(parent = root, x = 0, y = 0, z = 0) {
    const g = new T.Group(); g.position.set(x, y, z); parent.add(g); return g;
  }
  function keep(name, x = 0, y = 0, z = 0) {
    const g = group(root, x, y, z); g.name = name; kept.push(g); return g;
  }
  function ring(r, tube, x, y, z, color, p = root) {
    const a = mesh(new T.TorusGeometry(r, tube, 8, 64), color, p); a.position.set(x, y, z); return a;
  }
  function flatRing(r, tube, x, y, z, color, p = root) {
    const a = ring(r, tube, x, y, z, color, p); a.rotation.x = -Math.PI / 2; return a;
  }
  function rod(a, b, r, color, p = root) {
    const start = new T.Vector3(...a), end = new T.Vector3(...b), delta = end.clone().sub(start);
    const o = mesh(new T.CylinderGeometry(r, r, delta.length(), 8), color, p);
    o.position.copy(start.add(end).multiplyScalar(.5));
    o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize()); return o;
  }
  function shape(points, depth, color, p = root) {
    const s = new T.Shape(); points.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath();
    return mesh(new T.ExtrudeGeometry(s, { depth, bevelEnabled: false }), color, p);
  }
  function rounded(w, h, d, x, y, z, color, p = root, radius = .09) {
    const r = Math.min(radius, w / 2, h / 2), s = new T.Shape();
    s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
    s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);
    s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const a = mesh(new T.ExtrudeGeometry(s,{ depth:d, bevelEnabled:true, bevelSize:.014, bevelThickness:.014, bevelSegments:2, curveSegments:8 }),color,p);
    a.position.set(x,y,z);return a;
  }
  function label(text, width, x, y, z, p, color = '#fff4df', size = 58) {
    if (typeof document === 'undefined') return;
    const c = document.createElement('canvas'); c.width=768;c.height=128;
    const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font=`600 ${size}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,64,736);
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
    const a=new T.Mesh(new T.PlaneGeometry(width,width/6),new T.MeshBasicMaterial({ map,transparent:true,depthWrite:false,toneMapped:false }));
    a.position.set(x,y,z);a.userData.noShadow=true;p.add(a);return a;
  }
  function person(x, y, z, color='cobalt', scale=1, parent=root) {
    const p=group(parent,x,y,z);p.scale.setScalar(scale);
    for(const dx of [-.045,.045]) {rod([dx,.04,0],[dx,.25,0],.025,'petrol',p);box(.07,.04,.12,dx,.025,.02,'petrol',p);}
    const torso=mesh(new T.CylinderGeometry(.075,.095,.23,10),color,p);torso.position.y=.34;
    ball(.075,0,.55,0,'cream',p);ball(.078,0,.58,-.012,'ink',p).scale.y=.6;
    rod([-.07,.43,0],[-.11,.27,.02],.023,color,p);rod([.07,.43,0],[.12,.32,.06],.023,color,p);
    return p;
  }
  function plant(x,z,height=.6) {
    const p=group(root,x,.34,z);disk(.13,.17,0,.08,0,'trim',p);disk(.115,.012,0,.172,0,'ink',p);
    rod([0,.14,0],[0,height,0],.018,'wood',p);
    for(let i=0;i<8;i++) {
      const a=i*2.4, yy=.25+(i/8)*(height-.18), r=.13*(1-i/12);
      const leaf=ball(r,Math.cos(a)*.065,yy,Math.sin(a)*.065,'leaf',p);leaf.scale.set(.75,1.5,.8);
    }
  }
  function lamp(x,z) {
    const p=group(root,x,.34,z);disk(.085,.07,0,.035,0,'brass',p);rod([0,.07,0],[0,.80,0],.022,'petrol',p);
    box(.14,.19,.14,0,.81,0,'glow',p);
    for(const a of [-1,1]) for(const b of [-1,1]) rod([a*.075,.70,b*.075],[a*.075,.92,b*.075],.012,'brass',p);
    const cap=mesh(new T.ConeGeometry(.15,.13,4),'brass',p);cap.position.y=.975;cap.rotation.y=Math.PI/4;
  }

  // Stone district, fine inlaid border and individual paving stones.
  disk(3.55,.24,0,.12,0,'stone');disk(3.58,.032,0,.055,0,'brass');disk(3.5,.06,0,.27,0,'cream');
  flatRing(3.42,.012,0,.305,0,'brass');
  for(let row=-10;row<=10;row++)for(let col=-10;col<=10;col++) {
    const x=col*.32+(row%2)*.16,z=row*.32;
    if(Math.hypot(x,z)>3.35||Math.hypot(x,z-.45)<1.26)continue;
    box(.295,.016,.295,x,.31,z,(row+col)%5===0?'trim':'stone');
  }
  // A short canal and small footbridge across the front of the district.
  box(1.1,.018,1.0,-.25,.329,2.8,'water');
  for(let i=0;i<7;i++)box(1.18,.045,.10,-.25,.41+Math.sin(i/6*Math.PI)*.14,2.43+i*.12,'stone');
  for(const side of [-1,1]) {
    const x=-.25+side*.57;
    line([[x,.79,2.4],[x,.92,2.8],[x,.79,3.2]],.025,'brass');
    for(let j=0;j<5;j++)rod([x,.40,2.4+j*.20],[x,.80+Math.sin(j/4*Math.PI)*.12,2.4+j*.20],.018,'petrol');
  }

  // Telegram phone, with geometry for the plane and small readable chat labels.
  const phone=keep('telegram-phone',-1.95,.36,-1.2);phone.rotation.y=.1;
  rounded(1.38,2.85,.16,0,1.44,0,'brass',phone,.18);
  rounded(1.32,2.79,.10,0,1.44,.10,'cobalt',phone,.17);
  rounded(1.19,2.61,.018,0,1.44,.215,'screen',phone,.13);
  rounded(.45,.07,.02,0,2.68,.24,'ink',phone,.03);
  const icon=disk(.25,.025,0,2.27,.256,'cobalt',phone);icon.rotation.x=Math.PI/2;
  const plane=shape([[-.16,.01],[.17,.15],[.09,-.15],[-.015,-.055],[-.06,-.10],[-.065,-.025]],.014,'cream',phone);plane.position.set(0,2.27,.28);
  label('Gigradar',1.03,0,1.83,.265,phone,'#ffffff',94);
  rounded(1.02,.31,.025,0,1.38,.25,'cream',phone,.10);label('What’s on nearby?',.94,0,1.38,.29,phone,'#17436a',58);
  rounded(1.02,.38,.025,0,.88,.25,'cobalt',phone,.10);label('Find. Verify. Explore.',.98,0,.88,.29,phone,'#ffffff',52);
  const typing=[];for(let i=0;i<3;i++)typing.push(ball(.026,-.09+i*.09,.46,.28,'mint',phone));
  box(.35,.06,.02,0,.22,.25,'trim',phone);

  // Central radar: actual geometry for scale, sweep and scanned signal blips.
  const rx=0,rz=.45;
  disk(1.23,.1,rx,.36,rz,'brass');disk(1.15,.025,rx,.425,rz,'petrol');
  for(let i=1;i<=5;i++)flatRing(i*.215,.007,rx,.442,rz,'mint');
  for(let i=0;i<16;i++) {
    const a=i*Math.PI/8;
    rod([Math.sin(a)*.08,.445,rz+Math.cos(a)*.08],[Math.sin(a)*1.1,.445,rz+Math.cos(a)*1.1],.0035,'mint');
  }
  for(let i=0;i<32;i++) {const a=i*Math.PI/16;ball(.015,Math.sin(a)*1.19,.424,rz+Math.cos(a)*1.19,'brass');}
  const sweep=keep('radar-sweep',rx,.451,rz);
  const sweepMaterial=new T.MeshBasicMaterial({color:0x48e3dd,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false});
  const wedge=new T.Mesh(new T.CircleGeometry(1.1,32,0,.62),sweepMaterial);wedge.rotation.x=-Math.PI/2;wedge.userData.noShadow=true;sweep.add(wedge);
  rod([0,.005,0],[1.09,.005,0],.012,'mint',sweep);
  const blips=keep('discovered-event-signals');
  const signals=[];
  for(let i=0;i<7;i++){const a=i*2.4,r=.38+(i%3)*.25;signals.push(ball(.04,Math.cos(a)*r,.49,rz+Math.sin(a)*r,'coral',blips));}

  // Local listings: flyers are scattered clues rather than a canonical database.
  const board=group(root,-2.02,.34,1.38);board.rotation.y=.12;
  for(const x of [-.65,.65])box(.08,1.19,.09,x,.59,0,'wood',board);
  box(1.53,.95,.09,0,.79,0,'wood',board);box(1.62,.07,.17,0,1.30,.03,'petrol',board);
  for(let i=0;i<6;i++) {
    const p=group(board,-.51+(i%3)*.49,1.02-Math.floor(i/3)*.40,.055);p.rotation.z=(i%3-1)*.09;
    box(.36,.34,.015,0,0,0,'cream',p);box(.25,.07,.01,0,.07,.016,i%2?'cobalt':'coral',p);
    for(let j=0;j<3;j++)box(.24-j*.04,.012,.01,-j*.02,-.01-j*.045,.016,'trim',p);
  }

  // Live venue: layered proscenium, pleated curtains, drums, speakers and audience.
  const stage=group(root,.05,.34,-1.65);
  box(1.82,.18,1.25,0,.09,0,'stone',stage);box(1.9,.10,.32,0,.05,.72,'trim',stage);
  box(1.72,1.24,.12,0,.80,-.53,'curtain',stage);
  for(const x of [-.83,.83]){box(.17,1.45,.25,x,.82,-.25,'coral',stage);box(.25,.11,.31,x,.18,-.25,'trim',stage);}
  const arch=mesh(new T.TorusGeometry(.84,.10,8,48,Math.PI),'coral',stage);arch.position.set(0,1.50,-.25);
  const archInset=mesh(new T.TorusGeometry(.71,.025,8,48,Math.PI),'brass',stage);archInset.position.set(0,1.50,-.12);
  const archFace=mesh(new T.CircleGeometry(.73,32,0,Math.PI),'coral',stage);archFace.position.set(0,1.50,-.23);
  for(const side of [-1,1])for(let i=0;i<7;i++)box(.18,.015,.27,side*.83,.25+i*.18,-.24,'trim',stage);
  for(const side of [-1,1])for(let i=0;i<5;i++){
    const c=mesh(new T.CylinderGeometry(.04,.055,1.2,10),'curtain',stage);c.position.set(side*(.56+i*.045),.82,-.25);
  }
  for(let i=0;i<7;i++)ball(.034,-.63+i*.21,1.65,-.12,'glow',stage);
  for(const x of [-.59,.59]){
    box(.24,.44,.20,x,.40,.30,'petrol',stage);
    for(const y of [.30,.49])ring(.065,.012,x,y,.407,'brass',stage);
  }
  const drum=disk(.19,.17,.22,.40,-.13,'coral',stage);drum.rotation.x=Math.PI/2;
  const skin=disk(.175,.018,.22,.40,-.035,'cream',stage);skin.rotation.x=Math.PI/2;
  for(const x of [-.02,.43]){rod([x,.19,-.20],[x,.78,-.20],.012,'brass',stage);disk(.14,.014,x,.78,-.20,'brass',stage);}
  const singer=person(-.29,.19,.12,'petrol',.85,stage);singer.rotation.y=-.2;
  rod([-.18,.19,.40],[-.18,.76,.40],.012,'brass',stage);ball(.032,-.18,.76,.40,'ink',stage);
  const stageTitle=keep('live-venue-label',.05,2.12,-1.89);label('LIVE',.82,0,0,.18,stageTitle,'#fff0cb',90);

  // Open gallery lets the visitor inspect the two miniature canvases from any angle.
  const gallery=group(root,2.0,.34,-1.27);gallery.rotation.y=-.18;
  box(1.37,.16,1.15,0,.08,0,'stone',gallery);box(1.36,1.24,.12,0,.76,-.50,'cream',gallery);
  for(const x of [-.64,.64]) {
    box(.12,1.22,1.03,x,.76,-.04,'cream',gallery);
    for(const z of [-.48,.45]){box(.17,1.25,.17,x,.78,z,'stone',gallery);box(.23,.08,.23,x,1.41,z,'trim',gallery);}
  }
  for(const z of [-.57,.53])box(1.5,.10,.14,0,1.48,z,'trim',gallery);
  for(const x of [-.69,.69])box(.14,.10,1.2,x,1.48,-.02,'trim',gallery);
  // Cut away the central roof so the art stays visible.
  for(const x of [-.30,.30]) {
    box(.45,.65,.06,x,.91,-.409,'brass',gallery);box(.38,.58,.02,x,.91,-.37,'cream',gallery);
    for(let j=0;j<4;j++) {const patch=box(.12,.18,.012,x+Math.sin(j*2.3)*.08,.75+j*.10,-.35,x<0?'cobalt':'coral',gallery);patch.rotation.z=j*.7;}
  }

  // Checked location markers. The check represents the verification step, not a guarantee.
  const pins=[];
  for(const [x,y,z] of [[.05,2.87,-1.65],[2.0,2.35,-1.27]]) {
    const p=keep('checked-event-pin',x,y,z);pins.push(p);
    const face=disk(.21,.055,0,0,0,'petrol',p);face.rotation.x=Math.PI/2;
    ring(.205,.015,0,0,.04,'mint',p);
    const tail=shape([[-.12,-.13],[0,-.35],[.12,-.13]],.04,'mint',p);tail.position.z=-.01;
    line([[-.10,0,.05],[-.025,-.075,.05],[.115,.10,.05]],.025,'mint',p);
  }

  // Generated activity preview is a framed miniature (not an AR product claim).
  const portal=keep('after-event-preview',2.02,.34,1.43);portal.rotation.y=-.15;
  rounded(1.61,1.74,.10,0,1.0,-.17,'brass',portal,.16);
  rounded(1.44,1.57,.02,0,1.0,-.055,'petrol',portal,.12);
  box(1.5,.12,.82,0,.18,.20,'stone',portal);
  // Background relief: buildings and a glint of water, with actual geometry depth.
  box(1.3,.18,.02,0,.58,-.015,'water',portal);
  for(let i=0;i<5;i++) {
    const x=-.51+i*.25,h=.27+(i%3)*.10;box(.20,h,.035,x,.68+h/2,-.01,i%2?'trim':'coral',portal);
    for(let j=0;j<2;j++)box(.035,.06,.012,x-.055+j*.11,.79,.015,'glow',portal);
  }
  label('AFTER',.88,0,1.66,.052,portal,'#ffdc9d',88);
  box(.63,.09,.23,-.36,.42,.39,'cream',portal);
  const visitor=person(-.40,.25,.35,'coral',.88,portal);visitor.rotation.y=-.28;
  const cone=mesh(new T.ConeGeometry(.043,.12,12),'wood',portal);cone.rotation.z=Math.PI;cone.position.set(-.27,.76,.48);
  ball(.058,-.27,.84,.48,'pink',portal);
  // Flower cart with striped awning, spokes and flower heads.
  box(.56,.29,.32,.37,.48,.31,'wood',portal);
  for(const x of [.13,.61]) {
    ring(.105,.018,x,.27,.48,'brass',portal);
    for(let k=0;k<6;k++){const a=k*Math.PI/3;rod([x,.27,.48],[x+Math.sin(a)*.10,.27+Math.cos(a)*.10,.48],.008,'brass',portal);}
    rod([x,.30,.18],[x,1.13,.18],.015,'brass',portal);
  }
  for(let i=0;i<8;i++){const strip=box(.082,.04,.52,.09+i*.08,1.14,.30,i%2?'cream':'leaf',portal);strip.rotation.x=.14;}
  for(let i=0;i<12;i++) {
    const x=.15+(i%4)*.14,z=.20+Math.floor(i/4)*.13,y=.67+(i%3)*.05;
    rod([x,.56,z],[x,y,z],.009,'leaf',portal);ball(.049,x,y,z,i%2?'pink':'glow',portal);
  }

  // Routes carry moving signal beads across the same district shown in the artwork.
  const routePoints=[
    [[-1.60,.38,-.47],[-1.15,.40,-.18],[-.67,.46,.0]],
    [[0,.46,-.68],[.25,.40,-.95],[.05,.53,-1.01]],
    [[.97,.46,.01],[1.37,.40,-.35],[1.88,.45,-.65]],
    [[.95,.46,1.11],[1.38,.39,1.40],[1.83,.48,1.65]],
  ];
  const couriers=keep('travelling-signals'),routes=[];
  for(const points of routePoints) {
    line(points,.019,'mint');
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    const bead=ball(.047,...points[0],'glow',couriers);routes.push({curve,bead});
  }
  for(const [x,z,h] of [[-2.8,-1.1,1.2],[-2.65,1.4,.6],[-1.1,-2.7,1.2],[1,-2.6,1.0],[2.9,-.5,1.0],[2.75,1.8,.6],[-1.2,2.8,.45],[.85,2.8,.5],[-2.9,.2,.7]])plant(x,z,h);
  for(const [x,z] of [[-2.9,.8],[-1.25,1.75],[.9,2.75],[2.7,.5],[-1.0,-1.2]])lamp(x,z);
  for(const [x,z,c] of [[-.7,-.8,'cobalt'],[.65,-.8,'coral'],[1.55,-.4,'petrol'],[-2.2,1.92,'petrol'],[-.9,2.3,'cobalt'],[.45,2.5,'coral']])person(x,.34,z,c,.9);

  // Fit the actual miniature silhouette rather than the empty upper corners of a box.
  root.updateMatrixWorld(true);
  const beforeBounds=new T.Box3().setFromObject(root),center=beforeBounds.getCenter(new T.Vector3());
  const framingPoints=[],offset=new T.Vector3(-center.x,-beforeBounds.min.y,-center.z);
  root.traverse(o=>{
    if(!o.isMesh)return;
    if(o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.radiusTop>3){
      const {radiusTop:r,height:h}=o.geometry.parameters;
      for(let i=0;i<48;i++)for(const y of [-h/2,h/2])framingPoints.push(new T.Vector3(Math.cos(i*Math.PI/24)*r,y,Math.sin(i*Math.PI/24)*r).applyMatrix4(o.matrixWorld).add(offset));
    }else if(o.geometry.type==='TorusGeometry'&&o.geometry.parameters.radius>3){
      const r=o.geometry.parameters.radius+o.geometry.parameters.tube;
      for(let i=0;i<48;i++)framingPoints.push(new T.Vector3(Math.cos(i*Math.PI/24)*r,Math.sin(i*Math.PI/24)*r,0).applyMatrix4(o.matrixWorld).add(offset));
    }else{
      o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
      for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z).applyMatrix4(o.matrixWorld).add(offset));
    }
  });
  // Batch static geometry by material. Keep only animated groups and text unbatched.
  finish(54,kept);
  const restPins=pins.map(p=>p.position.y),portalY=portal.position.y;
  const steps=[
    {title:'Ask what’s on nearby',detail:'A Telegram conversation starts with the area you want to explore.',tone:'thinking'},
    {title:'Discover scattered events',detail:'OpenClaw searches beyond the usual event listing sites.',tone:'flowing'},
    {title:'Check what’s still happening',detail:'Bring current, valid event information into the shortlist.',tone:'complete'},
    {title:'Imagine the rest of the outing',detail:'WaveSpeedAI previews nearby activities, such as ice cream or flowers.',tone:'complete'},
  ];
  let manual=null,epoch=0;
  Object.assign(root.userData,{
    displayBase:false,groundLevel:0,initialYaw:.04,initialElevation:.49,autoOrbit:false,framingPoints,
    setStep(index,elapsed=0){manual=Number.isInteger(index)?Math.max(0,Math.min(3,index)):null;epoch=elapsed;},
    setTheme(theme){const dark=theme==='dark';m.glow.emissiveIntensity=dark?2.1:1.2;m.mint.emissiveIntensity=dark?1.25:.65;m.screen.emissiveIntensity=dark?.6:.35;},
    animate(time){
      const t=Number.isFinite(time)?time:0,index=manual??Math.floor(Math.max(0,t-epoch)/5)%4;
      sweep.rotation.y=-t*.65;
      signals.forEach((b,i)=>{const scale=.80+.30*Math.sin(t*2-i*.9);b.scale.setScalar(scale);});
      typing.forEach((dot,i)=>dot.scale.setScalar(index===0?1+.3*Math.sin(t*4-i):.8));
      pins.forEach((p,i)=>{p.position.y=restPins[i]+Math.sin(t*1.5+i)*.035;p.scale.setScalar(index===2?1.12:1);});
      portal.position.y=portalY+(index===3?.025*Math.sin(t*1.2):0);
      routes.forEach(({curve,bead},i)=>{bead.position.copy(curve.getPoint((t*.16+i*.23)%1));bead.position.y+=.025;});
      root.userData.story={...steps[index],index,step:`0${index+1} / 04`};
    },
  });
  root.userData.animate(0);
  return root;
}
