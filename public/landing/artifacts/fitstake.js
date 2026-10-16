// Five-step product walkthrough, grounded in FitStake's README and payment flow.
const STEPS = [
  ['Create or join a challenge', 'Choose an activity and 1–365 days. Invite one friend and agree on the scoring rules.', 'flowing'],
  ['Lock in your rewards', 'AI suggests rewards within your cap. Each friend locks a lowest-value and a best-value reward.', 'thinking'],
  ['Enrol a card and set a cap', 'Use Reap’s hosted sandbox page. Your cap must cover the friend’s best reward; no money is held.', 'flowing'],
  ['Compete with consistency', 'Earn points for active minutes, capped at 90 per day, plus a 10-point bonus for 30+ minutes. Demo activity is simulated.', 'flowing'],
  ['Approve the reward purchases', 'Fixed scoring determines the result. The loser buys the winner’s best reward; the winner buys the loser’s lowest. Approve each purchase.', 'complete'],
];

export function createArtifact(T) {
  const root = new T.Group();
  root.name = 'fitstake-five-step-walkthrough';
  const palette = { paper: 0xf0e7d6, edge: 0xcdbd9e, white: 0xfff8e8, red: 0xc72e38, blue: 0x2458ae, gold: 0xd7ae5a, ink: 0x182338, green: 0x38856d };
  let seed=82;
  const grainData=new Uint8Array(128*128*4);
  for(let i=0;i<grainData.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const value=120+(seed/4294967296)*40;grainData.set([value,value,value,255],i);}
  const grain=new T.DataTexture(grainData,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(5,5);grain.needsUpdate=true;
  const materials = Object.fromEntries(Object.entries(palette).map(([key, color]) => [key, new T.MeshStandardMaterial({color, roughness:key==='gold'?.3:.78, metalness:key==='gold'?.65:0,bumpMap:key==='gold'?null:grain,bumpScale:.004})]));
  function mesh(geometry, color, parent=root) {
    const item = new T.Mesh(geometry, materials[color]);
    item.castShadow = item.receiveShadow = true;
    parent.add(item); return item;
  }
  function box(w,h,d,x,y,z,color='paper',parent=root) {
    const item=mesh(new T.BoxGeometry(w,h,d),color,parent);item.position.set(x,y,z);return item;
  }
  function sphere(r,x,y,z,color,parent=root) {
    const item=mesh(new T.IcosahedronGeometry(r,1),color,parent);item.position.set(x,y,z);return item;
  }
  function rod(a,b,r,color,parent=root) {
    const start=new T.Vector3(...a), end=new T.Vector3(...b), v=end.clone().sub(start);
    const item=mesh(new T.CylinderGeometry(r,r,v.length(),8),color,parent);
    item.position.copy(start.add(end).multiplyScalar(.5));item.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return item;
  }
  function line(points,color,parent=root,r=.025) {
    return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),36,r,6,false),color,parent);
  }
  function rounded(w,h,r) {
    const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;
  }
  function panel(w,h,d,x,y,z,color,parent=root,r=.12) {
    const item=mesh(new T.ExtrudeGeometry(rounded(w,h,r),{depth:d,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,curveSegments:12}),color,parent);
    item.position.set(x,y,z-d/2);return item;
  }
  function label(text,x,y,z,width=.9,color='#29323d',parent=root) {
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,768,128);ctx.fillStyle=color;ctx.font='600 68px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,64,740);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const item=new T.Mesh(new T.PlaneGeometry(width,width/6),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide}));
    item.userData.noShadow=true;item.position.set(x,y,z);parent.add(item);return item;
  }
  // Layered architectural plinth and four inset running lanes.
  for(const [radius,height,y,color] of [[3.72,.15,.075,'edge'],[3.69,.08,.19,'white'],[3.63,.06,.26,'paper']]){
    const base=mesh(new T.CylinderGeometry(radius,radius+.025,height,128),color);base.scale.z=.66;base.position.y=y;
  }
  for(const [color,start] of [['red',0],['blue',Math.PI]]) {
    const lane=mesh(new T.RingGeometry(2.55,3.48,96,1,start,Math.PI),color);
    lane.rotation.x=-Math.PI/2;lane.scale.y=.66;lane.position.y=.294;
  }
  for(const radius of [2.56,2.79,3.02,3.25,3.47]) {
    const ring=mesh(new T.TorusGeometry(radius,.012,4,128),'white');ring.rotation.x=-Math.PI/2;ring.scale.y=.66;ring.position.y=.302;
  }
  for(let i=0;i<9;i++)box(.025,.015,.82,-.24+i*.06,.31,2.01,'white');
  const outerTrim=mesh(new T.TorusGeometry(3.62,.012,6,128),'gold');outerTrim.rotation.x=-Math.PI/2;outerTrim.scale.y=.66;outerTrim.position.y=.27;
  // Split ribbon portals frame the miniature without closing off the runners.
  for(const [x,color,sign] of [[-1.87,'red',-1],[1.87,'blue',1]]){
    const ribbon=new T.Group();root.add(ribbon);ribbon.position.set(x,1.17,-.90);ribbon.rotation.y=sign*.12;
    const arc=mesh(new T.TorusGeometry(1.24,.045,5,64,Math.PI*1.25),color,ribbon);arc.rotation.z=-.4;
    const inner=mesh(new T.TorusGeometry(1.14,.012,4,64,Math.PI*1.25),'gold',ribbon);inner.rotation.z=-.4;
    for(let i=0;i<5;i++){const a=.3+i*.32;sphere(.035,Math.cos(a)*1.24,Math.sin(a)*1.24,0,'gold',ribbon);}
  }
  // The app is the center of the challenge; all five screen states live here.
  panel(2.13,3.28,.24,0,1.99,-.40,'gold');
  panel(2.06,3.21,.22,0,1.99,-.29,'ink');
  panel(1.94,3.08,.12,0,1.97,-.14,'white');
  panel(1.72,2.59,.04,0,1.91,-.055,'paper');
  panel(.035,.34,.06,-1.065,2.60,-.3,'gold',root,.012);
  panel(.035,.22,.06,1.065,2.18,-.3,'gold',root,.012);
  panel(.42,.055,.02,0,3.38,-.10,'edge',root,.025);
  label('FITSTAKE',0,3.12,.05,1.15);
  const stepLights=[];
  for(let i=0;i<5;i++)stepLights.push(sphere(.045,-.32+i*.16,.59,.02,'edge'));
  const screens=STEPS.map(()=>{const g=new T.Group();root.add(g);return g;});
  const uiZ=.10;
  function avatar(x,y,color,parent) {
    sphere(.13,x,y+.2,uiZ+.04,'paper',parent);
    panel(.30,.30,.045,x,y-.04,uiZ+.04,color,parent,.08);
  }
  // 01 — invitation and an agreed activity window.
  avatar(-.46,2.50,'red',screens[0]);avatar(.46,2.50,'blue',screens[0]);
  line([[-.25,2.5,uiZ],[0,2.61,uiZ],[.25,2.5,uiZ]],'gold',screens[0]);
  panel(1.22,.76,.05,0,1.72,uiZ,'white',screens[0]);
  label('7 DAY CHALLENGE',0,1.94,uiZ+.12,1.08,'#29323d',screens[0]);
  for(let i=0;i<7;i++)box(.10,.10,.025,-.42+i*.14,1.66,uiZ+.05,i<4?'red':'edge',screens[0]);
  label('INVITE A FRIEND',0,1.03,uiZ+.05,1.18,'#285baf',screens[0]);
  // 02 — an AI recommendation, then two locked reward tiers per player.
  const ai=mesh(new T.IcosahedronGeometry(.19,0),'gold',screens[1]);ai.position.set(0,2.62,.22);
  const aiWire=new T.LineSegments(new T.EdgesGeometry(new T.IcosahedronGeometry(.27,0)),new T.LineBasicMaterial({color:0xe1b75e}));ai.add(aiWire);
  label('AI REWARD PICKS',0,2.23,uiZ+.04,1.30,'#29323d',screens[1]);
  function gift(x,y,z,scale,color,parent) {
    const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
    box(.46,.42,.40,0,.21,0,'white',g);box(.50,.07,.44,0,.455,0,color,g);box(.075,.49,.425,0,.245,0,color,g);
    const bow=mesh(new T.TorusGeometry(.095,.025,5,18),'gold',g);bow.position.set(-.08,.54,0);bow.rotation.y=.5;
    const second=bow.clone();second.position.x=.08;g.add(second);return g;
  }
  gift(-.48,1.32,.13,.65,'red',screens[1]);gift(.40,1.25,.13,1.02,'blue',screens[1]);
  label('LOWEST',-.45,1.12,.25,.65,'#29323d',screens[1]);label('BEST',.43,1.12,.25,.65,'#29323d',screens[1]);
  label('WITHIN YOUR CAP',0,.86,.14,1.25,'#285baf',screens[1]);
  // 03 — a hosted card enrolment, with an explicit cap and no escrow.
  const card=panel(1.24,.76,.055,0,2.35,.16,'blue',screens[2]);card.rotation.z=-.08;
  box(.19,.14,.018,-.37,2.42,.205,'gold',screens[2]);
  label('REAP SANDBOX',.08,2.16,.23,.95,'#ffffff',screens[2]);
  label('SET SPENDING CAP',0,1.61,.08,1.36,'#29323d',screens[2]);
  box(1.16,.06,.03,0,1.33,.08,'edge',screens[2]);box(.80,.065,.035,-.18,1.33,.10,'gold',screens[2]);sphere(.08,.22,1.33,.12,'blue',screens[2]);
  label('NO FUNDS HELD',0,.94,.08,1.14,'#29323d',screens[2]);
  // 04 — daily scoring, with red and blue progress bars.
  label('DAILY PROGRESS',0,2.74,.08,1.35,'#29323d',screens[3]);
  const progressBars=[];
  for(let i=0;i<2;i++){
    const y=2.25-i*.55;
    box(1.30,.16,.025,0,y,.06,'edge',screens[3]);
    const fill=box(1.30,.17,.04,0,y,.09,i?'blue':'red',screens[3]);progressBars.push(fill);
  }
  label('MINUTES + CONSISTENCY',0,1.15,.08,1.48,'#29323d',screens[3]);
  label('SIMULATED ACTIVITY',0,.90,.08,1.30,'#285baf',screens[3]);
  // 05 — both friends receive something, through separately approved purchases.
  label('BOTH GET A REWARD',0,2.72,.08,1.47,'#29323d',screens[4]);
  avatar(-.52,2.29,'red',screens[4]);avatar(.52,2.29,'blue',screens[4]);
  line([[-.50,2.04,.12],[-.2,1.88,.2],[.46,1.55,.2]],'red',screens[4]);
  line([[.50,2.04,.12],[.2,1.88,.25],[-.46,1.55,.25]],'blue',screens[4]);
  gift(-.46,1.10,.15,.85,'red',screens[4]);gift(.46,1.12,.15,.58,'blue',screens[4]);
  label('BEST',-.47,.93,.28,.60,'#29323d',screens[4]);label('LOWEST',.47,.93,.28,.68,'#29323d',screens[4]);
  // Faceted athletes: shaped torsos, hinged knees/elbows and layered shoes.
  function taper(a,b,r1,r2,color,parent){
    const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start);
    const item=mesh(new T.CylinderGeometry(r2,r1,v.length(),5,1),color,parent);
    item.position.copy(start.add(end).multiplyScalar(.5));item.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return item;
  }
  function torso(parent,color){
    const rings=[[0,.18,.12],[.22,.15,.10],[.51,.28,.135],[.62,.20,.115]];
    const pos=[],idx=[];
    for(const [y,w,d]of rings)for(let i=0;i<6;i++){const a=i*Math.PI/3;pos.push(Math.cos(a)*w,y,Math.sin(a)*d);}
    for(let j=0;j<3;j++)for(let i=0;i<6;i++){let a=j*6+i,b=j*6+(i+1)%6;idx.push(a,b,a+6,b,b+6,a+6);}
    idx.push(18,19,20,18,20,21,18,21,22,18,22,23);
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();return mesh(geo,color,parent);
  }
  function hairstyle(parent,ponytail){
    // A continuous shell follows the head, with a higher forehead and lower nape.
    // The old flattened cap intersected the crown and exposed patches of scalp.
    const positions=[],indices=[],segments=20,rings=10;
    for(let row=0;row<=rings;row++)for(let col=0;col<=segments;col++){
      const phi=col/segments*Math.PI*2;
      const theta=row/rings*(1.45-.30*Math.sin(phi)+.055*Math.sin(3*phi));
      positions.push(.160*Math.sin(theta)*Math.cos(phi),.89+.222*Math.cos(theta),.025+.170*Math.sin(theta)*Math.sin(phi));
    }
    for(let row=0;row<rings;row++)for(let col=0;col<segments;col++){
      const a=row*(segments+1)+col,b=a+segments+1;
      indices.push(a,a+1,b,a+1,b+1,b);
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    mesh(geometry,'ink',parent);
    if(ponytail){
      taper([0,.96,-.12],[.07,.91,-.32],.075,.055,'ink',parent);
      taper([.07,.91,-.32],[.12,.77,-.49],.055,.008,'ink',parent);
    }else{
      const sweep=sphere(.10,-.025,1.075,.075,'ink',parent);sweep.scale.set(1.1,.60,.82);sweep.rotation.z=-.22;
    }
  }
  function runner(x,color,phase) {
    const g=new T.Group();root.add(g);g.position.set(x,.34,.56);g.scale.setScalar(1.22);
    const body=new T.Group();g.add(body);body.position.y=1.02;body.rotation.x=.16;
    torso(body,color);taper([0,.59,0],[0,.75,.02],.075,.07,'paper',body);
    const head=sphere(.17,0,.89,.025,'paper',body);head.scale.set(.83,1.17,.88);
    for(const side of [-1,1]){
      const ear=sphere(.038,side*.143,.88,.025,'paper',body);ear.scale.set(.62,1,.72);
      sphere(.012,side*.050,.925,.170,'ink',body);
    }
    const nose=mesh(new T.ConeGeometry(.048,.12,4),'paper',body);nose.rotation.x=Math.PI/2;nose.position.set(0,.89,.17);
    hairstyle(body,x<0);
    for(const side of [-1,1])taper([side*.16,.1,.02],[side*.14,-.12,.01],.13,.12,color,body);
    const arms=[],legs=[];
    for(const side of [-1,1]){
      const arm=new T.Group();arm.position.set(side*.255,.51,0);body.add(arm);
      sphere(.095,0,-.02,0,'paper',arm);taper([0,0,0],[side*.015,-.31,0],.085,.058,'paper',arm);
      const elbow=new T.Group();elbow.position.set(side*.015,-.31,0);arm.add(elbow);elbow.rotation.x=-1.28;
      sphere(.06,0,0,0,'paper',elbow);taper([0,0,0],[0,-.29,0],.06,.038,'paper',elbow);sphere(.06,0,-.32,.01,'paper',elbow);
      if(side===-1){const watch=box(.105,.07,.06,0,-.24,.045,'ink',elbow);watch.rotation.x=.1;}
      arms.push(arm);
      const leg=new T.Group();leg.position.set(side*.135,1.05,0);g.add(leg);
      taper([0,0,0],[0,-.43,0],.13,.075,'paper',leg);
      const knee=new T.Group();knee.position.y=-.43;leg.add(knee);
      sphere(.078,0,0,0,'paper',knee);taper([0,0,0],[0,-.43,0],.075,.047,'paper',knee);
      taper([0,-.28,0],[0,-.43,0],.063,.055,'white',knee);
      const shoe=panel(.16,.31,.12,0,-.46,.09,color,knee,.055);shoe.rotation.x=-Math.PI/2;
      box(.17,.035,.32,0,-.52,.09,'white',knee);
      for(let j=0;j<3;j++)box(.12,.016,.018,0,-.389,.04+j*.045,'white',knee);
      legs.push({hip:leg,knee});
    }
    g.rotation.y=x<0?.57:-.44;return {g,body,arms,legs,phase};
  }
  const runners=[runner(-2.14,'red',.8),runner(2.14,'blue',Math.PI+.8)];
  // Floating recommendation shelves, with real depth and a restrained gold orbit.
  const rewardDisplay=new T.Group();root.add(rewardDisplay);
  const rewards=[gift(-1.45,1.42,.65,.95,'red',rewardDisplay),gift(1.45,1.65,.65,1.20,'blue',rewardDisplay)];
  for(const [x,y,size]of [[-1.45,1.40,.36],[1.45,1.63,.43]]){
    const shelf=mesh(new T.CylinderGeometry(size,size,.055,48),'gold',rewardDisplay);shelf.position.set(x,y,.65);
    const orbit=mesh(new T.TorusGeometry(size+.07,.012,5,48),'gold',rewardDisplay);orbit.rotation.x=Math.PI/2;orbit.position.set(x,y+.02,.65);
  }
  const rewardLabels=[label('LOWEST',-1.45,1.19,.88,.80,'#29323d',rewardDisplay),label('BEST',1.45,1.40,.98,.80,'#29323d',rewardDisplay)];
  // A woven path carries a visible pulse from each player into the app.
  const paths=[];
  for(const [sign,color] of [[-1,'red'],[1,'blue']]){
    const points=[new T.Vector3(sign*2.15,.37,.55),new T.Vector3(sign*1.50,.42,1.36),new T.Vector3(sign*.52,.46,1.18),new T.Vector3(sign*.45,.67,.11)];
    const curve=new T.CatmullRomCurve3(points);
    mesh(new T.TubeGeometry(curve,64,.025,6,false),color);
    const pulse=sphere(.055,0,0,0,'gold');paths.push({curve,pulse});
  }
  // Small folded landscape details anchor the stadium in the paper-art collection.
  function leaf(x,y,z,angle,scale){
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-.17,.40,0,0,.84,0,0,.42,.075,.17,.40,0],3));geometry.setIndex([0,1,3,1,2,3,0,3,4,3,2,4]);geometry.computeVertexNormals();
    const item=mesh(geometry,'paper');item.material=materials.paper;item.material.side=T.DoubleSide;item.position.set(x,y,z);item.rotation.z=angle;item.scale.setScalar(scale);
  }
  for(const sign of [-1,1])for(let i=0;i<4;i++)leaf(sign*(2.78+i*.07),.3,-.69+i*.08,sign*(i-.8)*.28,.65+i*.13);
  const stepMarkers=[];
  for(let i=0;i<5;i++){
    const x=(i-2)*.40;const marker=panel(.31,.07,.18,x,.34,1.93,'edge',root,.025);stepMarkers.push(marker);
  }
  // A restrained shower of folded pieces marks the final exchange.
  const celebration=new T.Group();root.add(celebration);
  const confetti=[];
  for(let i=0;i<24;i++){
    const a=i*2.399963;
    const piece=mesh(new T.PlaneGeometry(.055+(i%3)*.018,.12),i%3===0?'gold':i%2?'red':'blue',celebration);
    piece.material.side=T.DoubleSide;
    piece.userData={x:Math.sin(a)*(1.7+(i%4)*.27),y:1.6+(i%7)*.22,z:-.65+Math.cos(a)*.6,phase:a};
    confetti.push(piece);
  }
  root.userData={artifactId:82,displayBase:false,groundLevel:0,initialYaw:-.12,initialElevation:.36,studioProfile:'fitstake',studioLightScale:1.10};
  let selected=null, offset=0, lastTime=0;
  root.userData.setStep=(index,elapsed=lastTime)=>{
    if(index===null){offset=elapsed-(selected??0)*7;selected=null;}
    else selected=Math.max(0,Math.min(4,Math.floor(index)));
  };
  root.userData.animate=elapsed=>{
    lastTime=elapsed;
    const cycle=((elapsed-offset)%35+35)%35;
    const index=selected??Math.floor(cycle/7);
    const t=selected===null?cycle%7:elapsed;
    const entrance=selected===null?T.MathUtils.smoothstep(t,0,.65):1;
    screens.forEach((g,i)=>{g.visible=i===index;g.scale.setScalar(.94+.06*entrance);g.position.y=(1-entrance)*.14;});
    stepLights.forEach((light,i)=>{light.material=materials[i===index?'red':'edge'];});
    stepMarkers.forEach((marker,i)=>{marker.material=materials[i===index?'gold':'edge'];});
    ai.rotation.y=elapsed*.6;
    runners.forEach(({g,body,arms,legs,phase},i)=>{
      const stride=Math.sin((index===3?elapsed*4.8:elapsed*1.5)+phase);
      arms.forEach((arm,j)=>{arm.rotation.x=stride*(j?-.72:.72);arm.rotation.z=j?-.12:.12;});
      legs.forEach(({hip,knee},j)=>{const swing=stride*(j?1:-1);hip.rotation.x=swing*.72;knee.rotation.x=.26+Math.max(0,swing)*1.18;});
      body.rotation.z=Math.sin(elapsed*1.5+phase)*.035;
      g.position.y=.29+Math.abs(Math.cos(elapsed*(index===3?4.8:1.5)+phase))*.065;
    });
    progressBars.forEach((bar,i)=>{const amount=.18+(i?.51:.72)*Math.min(t/5,1);bar.scale.x=amount;bar.position.x=-(1-amount)*.65;});
    rewardDisplay.visible=index===1||index===4;
    rewardDisplay.scale.setScalar(.88+.12*entrance);
    rewards.forEach((gift,i)=>{gift.rotation.y=Math.sin(elapsed*.7+i)*.16;gift.position.y=(i?1.65:1.42)+Math.sin(elapsed*1.8+i)*.055;});
    rewardLabels[0].visible=rewardLabels[1].visible=index===1;
    paths.forEach(({curve,pulse},i)=>{pulse.position.copy(curve.getPoint((elapsed*.22+i*.5)%1));});
    celebration.visible=index===4;
    confetti.forEach(piece=>{const {x,y,z,phase}=piece.userData;piece.position.set(x+Math.sin(elapsed+phase)*.10,y+Math.sin(elapsed*.7+phase)*.14,z);piece.rotation.set(elapsed*.5+phase,phase,elapsed*.35);});
    root.userData.story={index,step:`${index+1} / 5`,title:STEPS[index][0],detail:STEPS[index][1],tone:STEPS[index][2]};
  };
  root.userData.animate(0);
  return root;
}
