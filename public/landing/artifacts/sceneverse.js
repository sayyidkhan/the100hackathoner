import { sculpture } from './sculpture.js';

// Conceptual cinema exhibit grounded in the frontend's pause / analyze / chat flow.
// Maya and Riven come from the original agentic-vr prototype, not the featured movie demo.
export function createArtifact(T) {
  const {root,materials,mesh,box,disk,ball,line,finish}=sculpture(T);
  for(const [name,color] of Object.entries({stone:0x263139,navy:0x152330,red:0x692536,gold:0xb99762,teal:0x29606a,ochre:0xbb8a48,skin:0xc89671,hair:0x25252b,paper:0xe8ddc8,ink:0x101820})){
    materials[name]??=new T.MeshStandardMaterial();materials[name].color.setHex(color);
    materials[name].roughness=name==='gold'?.32:.68;materials[name].metalness=name==='gold'?.7:.08;
  }
  materials.warm=new T.MeshStandardMaterial({color:0xffdfab,emissive:0xffaf52,emissiveIntensity:1.4});
  materials.cyan=new T.MeshStandardMaterial({color:0xa2e3ed,emissive:0x5ba9c5,emissiveIntensity:.9});
  function group(name,x=0,y=0,z=0,parent=root){const g=new T.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;}
  function shape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
  function panel(w,h,d,x,y,z,c='navy',p=root,r=.07){const m=mesh(new T.ExtrudeGeometry(shape(w,h,r),{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:8}),c,p);m.position.set(x,y,z-d/2);return m;}
  function arch(w,h,thick,x,y,z,c='gold',p=root){const s=shape(w,h,.28);const hole=new T.Path(shape(w-thick*2,h-thick*2,.22).getPoints(24));s.holes.push(hole);const m=mesh(new T.ExtrudeGeometry(s,{depth:.10,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2} ),c,p);m.position.set(x,y,z);return m;}
  function ring(r,t,x,y,z,c,p=root){const m=mesh(new T.TorusGeometry(r,t,8,48),c,p);m.position.set(x,y,z);return m;}
  function oval(r,h,y,c){const m=disk(r,h,0,y,0,c);m.scale.z=.71;return m;}
  oval(4.25,.18,.12,'stone');oval(4.28,.035,.21,'gold');oval(4.22,.09,.27,'navy');
  for(let i=-6;i<=6;i++)box(5.9,.008,.012,0,.323,i*.34,'stone');
  for(let i=-4;i<=4;i++)box(.012,.008,3.9,i*.65,.325,0,'stone');
  // A real open portal with nested architecture; nothing is a flat image billboard.
  box(5.25,.12,2.0,0,.40,-1.00,'stone');
  panel(5.25,3.4,.12,0,2.13,-2.0,'navy');
  for(let i=0;i<5;i++){
    const scale=1-i*.075,z=-.52-i*.32;
    arch(5.30*scale,3.40*scale,.075,0,2.10,z,i===0?'gold':'stone');
    for(const side of [-1,1]){
      panel(.045,.65,.04,side*2.40*scale,2.00,z+.10,'warm');
      box(.15,.05,1.25,side*2.43*scale,.60,z-.30,'gold');
    }
  }
  arch(5.70,3.80,.19,0,2.17,-.35,'red');arch(5.37,3.48,.025,0,2.17,-.22,'gold');
  panel(1.0,1.85,.045,0,1.62,-1.91,'stone');
  ring(.23,.03,0,1.65,-1.85,'gold');ball(.085,0,1.65,-1.81,'warm');
  // Pause badge and timeline make the starting moment explicit.
  const badge=disk(.26,.06,0,4.02,-.20,'ink');badge.rotation.x=Math.PI/2;
  ring(.27,.02,0,4.02,-.15,'gold');
  for(const x of [-.07,.07])panel(.042,.21,.025,x,4.02,-.10,'warm');
  box(4.85,.035,.045,0,.51,-.15,'stone');box(1.65,.035,.05,-1.60,.51,-.12,'warm');ball(.048,-.78,.51,-.085,'warm');
  // Articulated, differently dressed characters, scaled like actors on a set.
  const actors=[];
  function actor(name,x,z,color,yaw){
    const g=group(name,x,.47,z);g.rotation.y=yaw;
    for(const side of [-1,1]){
      const leg=mesh(new T.CapsuleGeometry(.075,.58,4,12),'ink',g);leg.position.set(side*.13,.40,0);
      const shoe=ball(.11,side*.13,.065,.06,'ink',g);shoe.scale.set(.8,.55,1.55);
    }
    const torso=mesh(new T.CylinderGeometry(.19,.23,.52,24),color,g);torso.position.y=.99;
    box(.055,.45,.028,0,1.01,.20,'ink',g);
    for(const side of [-1,1]){const lapel=box(.07,.27,.03,side*.07,1.12,.18,'gold',g);lapel.rotation.z=side*.28;}
    if(name==='Riven'){const coat=mesh(new T.CylinderGeometry(.22,.30,.52,24,1,true),color,g);coat.position.y=.66;}
    const head=group('head',0,1.48,0,g);
    const face=ball(.19,0,0,0,'skin',head);face.scale.y=1.16;
    const hair=mesh(new T.SphereGeometry(.197,24,16,0,Math.PI*2,0,Math.PI*.55),'hair',head);hair.position.y=.05;
    if(name==='Maya')for(const side of [-1,1]){const bob=ball(.08,side*.16,-.02,-.025,'hair',head);bob.scale.y=1.65;}
    for(const side of [-1,1])ball(.015,side*.065,.025,.173,'ink',head);
    ball(.028,0,-.015,.19,'skin',head);
    const arms=[];
    for(const side of [-1,1]){
      const arm=group('gesture',side*.22,1.14,0,g);arms.push(arm);
      line([[0,0,0],[side*.10,-.23,.04],[side*.18,-.20,.22]],.065,color,arm);
      const hand=ball(.072,side*.18,-.20,.24,'skin',arm);hand.scale.set(1,.5,1.2);
    }
    const mouth=ball(.025,0,-.085,.178,'ink',head);mouth.scale.set(1,.20,.22);
    const replyWave=group('reply-wave',0,1.94,.04,g),replyBars=[];
    for(let i=0;i<5;i++)replyBars.push(box(.018,.09,.018,(i-2)*.047,0,0,'warm',replyWave));
    actors.push({g,head,arms,mouth,replyWave,replyBars});return g;
  }
  actor('Maya',-.90,-.38,'ochre',.40).scale.setScalar(1.15);actor('Riven',.88,-.50,'teal',-.40).scale.setScalar(1.15);
  // Portrait stations echo the generated character cards from the app.
  const cards=[];
  for(const [i,x,color] of [[0,-3.08,'ochre'],[1,3.08,'teal']]){
    box(.52,1.1,.45,x,.87,-.49,'stone');
    const card=group(`character-card-${i}`,x,2.25,-.38);cards.push(card);
    panel(.68,1.47,.09,0,0,0,'gold',card);panel(.61,1.40,.025,0,0,.065,'navy',card);
    const shoulders=ball(.21,0,.06,.09,color,card);shoulders.scale.set(1.05,.85,.23);
    const face=ball(.13,0,.34,.09,'skin',card);face.scale.z=.35;
    const hair=ball(.135,0,.40,.09,'hair',card);hair.scale.set(1,.50,.4);
    for(let j=0;j<3;j++)box(.34-j*.045,.014,.015,-j*.02,-.28-j*.10,.095,'gold',card);
    box(.035,1.25,.02,-.27,0,.09,'cyan',card);
  }
  // Three-quarter lounge seating matches the artwork: look into the screen,
  // with the viewer's profile and relaxed posture visible beside the chair back.
  const rug=disk(1.04,.018,-2.18,.343,1.48,'red');rug.scale.z=.82;
  const rugEdge=ring(1.03,.012,-2.18,.355,1.48,'gold');rugEdge.rotation.x=Math.PI/2;rugEdge.scale.y=.82;
  const chair=group('viewer-seat',-2.18,.36,1.48);chair.rotation.y=Math.PI-.95;
  disk(.43,.055,0,.045,0,'gold',chair);disk(.13,.18,0,.14,0,'gold',chair);
  panel(.91,.16,.79,0,.27,.015,'gold',chair);
  panel(.84,.21,.76,0,.37,.025,'red',chair,.10);
  const back=group('upholstered-back',0,.77,-.28,chair);back.rotation.x=-.12;
  panel(.94,.91,.16,0,0,0,'gold',back,.12);
  panel(.87,.85,.20,0,0,.025,'red',back,.12);
  panel(.81,.78,.035,0,0,-.105,'red',back,.10);
  panel(.74,.68,.065,0,.015,.14,'red',back,.12);
  for(const side of [-1,1]){
    panel(.15,.37,.70,side*.46,.48,.035,'red',chair);
    panel(.20,.12,.78,side*.46,.69,.025,'red',chair);
    line([[side*.535,.66,.34],[side*.535,.66,-.30],[side*.535,.32,-.30]],.018,'gold',chair);
  }
  const viewer=group('viewer',0,0,0,chair);
  const upper=group('viewer-upper',0,0,0,viewer);
  const body=ball(.23,0,.78,-.04,'ink',upper);body.scale.set(1,1.35,.70);
  ball(.17,0,1.27,-.04,'skin',upper);
  ball(.035,0,1.25,.127,'skin',upper);
  const hair=mesh(new T.SphereGeometry(.177,20,12,0,Math.PI*2,0,Math.PI*.57),'hair',upper);hair.position.set(0,1.32,-.04);
  const viewerArms=[],viewerLegs=[];
  for(const side of [-1,1]){
    const arm=group('viewer-arm',side*.22,.95,0,upper);viewerArms.push(arm);
    line(side===1?[[0,0,0],[.08,-.25,.17],[.02,.13,.16]]:[[0,0,0],[-.12,-.25,.13],[-.12,-.25,.31]],.065,'ink',arm);
    ball(.06,side===1?.02:-.12,side===1?.13:-.25,side===1?.18:.33,'skin',arm);
    const thigh=group('viewer-leg',side*.12,.50,.04,viewer);
    const leg=mesh(new T.CapsuleGeometry(.075,.28,4,12),'ink',thigh);leg.position.y=-.215;
    const shin=group('knee',0,-.43,0,thigh);
    const calf=mesh(new T.CapsuleGeometry(.07,.32,4,12),'ink',shin);calf.position.y=-.235;
    const shoe=ball(.09,0,-.47,.08,'ink',shin);shoe.scale.set(1,.55,1.6);
    viewerLegs.push({thigh,shin});
  }
  // Preserve the seated viewer for speaking gestures. Entering is a voice mode, not walking.
  root.updateMatrixWorld(true);root.attach(viewer);
  const sideTable=group('viewer-side-table',-1.66,0,2.12);
  disk(.30,.045,0,.78,0,'gold',sideTable);disk(.035,.40,0,.56,0,'gold',sideTable);disk(.23,.03,0,.36,0,'gold',sideTable);
  panel(.38,.15,.18,0,.89,0,'ink',sideTable);
  for(const x of [-.11,.11]){const lens=ball(.065,x,.89,.10,'cyan',sideTable);lens.scale.z=.2;}
  // Vera voice console: brass microphone and a compact animated waveform.
  const console=disk(.72,.16,0,.43,1.65,'stone');console.scale.z=.48;
  const lip=disk(.73,.018,0,.52,1.65,'gold');lip.scale.z=.48;
  disk(.15,.025,-.34,.55,1.65,'gold');disk(.025,.29,-.34,.71,1.65,'gold');
  const mic=mesh(new T.CapsuleGeometry(.09,.20,6,16),'gold');mic.position.set(-.34,.98,1.65);
  for(let i=0;i<5;i++){const grille=ring(.093,.008,-.34,.88+i*.047,1.65,'ink');grille.rotation.x=Math.PI/2;}
  const wave=group('vera-waveform',.17,.54,1.64),bars=[];
  for(let i=0;i<7;i++){const bar=box(.028,.22,.026,(i-3)*.066,.11,0,'cyan',wave);bars.push(bar);}
  // Director station with a folding chair, script and clapperboard.
  const director=group('director-station',2.10,.34,1.48);director.rotation.y=Math.PI+.35;
  for(const side of [-1,1]){
    line([[side*.35,0,-.28],[side*.35,.70,.27]],.027,'gold',director);
    line([[side*.35,0,.28],[side*.35,.70,-.27]],.027,'gold',director);
    line([[side*.35,.60,-.27],[side*.35,1.17,-.27]],.025,'gold',director);
  }
  panel(.72,.10,.55,0,.62,0,'ink',director);panel(.72,.35,.045,0,.98,-.27,'ink',director);
  const slate=group('slate',2.75,.60,1.95);slate.rotation.z=-.10;
  panel(.57,.42,.045,0,0,0,'ink',slate);panel(.60,.08,.05,0,.26,0,'paper',slate);
  for(let i=0;i<4;i++){const stripe=box(.07,.08,.01,-.23+i*.15,.26,.033,'ink',slate);stripe.rotation.z=-.4;}
  for(let i=0;i<3;i++)box(.40,.008,.008,0,.08-i*.10,.029,'paper',slate);
  disk(.28,.045,2.98,.86,1.0,'gold');disk(.04,.48,2.98,.60,1.0,'gold');
  box(.31,.025,.36,2.98,.90,1.0,'paper');
  // Practical lights, small set details and a three-step entrance.
  for(const x of [-3.60,3.60]){
    disk(.14,.025,x,.34,-.20,'gold');disk(.035,.90,x,.80,-.20,'gold');
    const bulb=ball(.065,x,1.31,-.20,'warm');bulb.scale.y=1.7;
    ring(.10,.012,x,1.32,-.20,'gold');
  }
  for(let i=0;i<3;i++)box(2.8+i*.30,.055, .22,0,.40-i*.055,.15+i*.22,'stone');
  // Set dressing: recessed wall modules and floor edge markers.
  for(const side of [-1,1])for(let i=0;i<4;i++){
    panel(.13,.38,.05,side*(2.35-i*.17),1.05,-.47-i*.32,'gold');
    box(.16,.02,.10,side*1.8,.475,-.25-i*.40,'warm');
  }
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;disk(.035,.012,Math.cos(a)*4.05,.322,Math.sin(a)*2.86,'gold');
  }
  const gateway=group('interactive-frame');
  arch(5.37,3.48,.018,0,2.17,-.18,'cyan',gateway);
  // Scan stays within the movie frame; the viewer never leaves their seat.
  const scan=group('scene-scan'),sweep=group('scan-sweep',0,0,0,scan);
  const scanGlow=new T.MeshBasicMaterial({color:0x91efff,transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide});
  const scanBand=new T.Mesh(new T.PlaneGeometry(4.9,.32),scanGlow);
  scanBand.position.set(0,.16,.12);sweep.add(scanBand);
  box(4.9,.018,.018,0,0,.14,'cyan',sweep);
  const detections=actors.map((a,i)=>{
    const target=group(`scan-target-${i}`,a.g.position.x,1.55,.18,scan);
    for(const x of [-.53,.53])for(const y of [-1.02,1.02]){
      box(.19,.024,.018,x-Math.sign(x)*.095,y,0,'cyan',target);
      box(.024,.19,.018,x,y-Math.sign(y)*.095,0,'cyan',target);
    }
    return target;
  });
  root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(root),center=bounds.getCenter(new T.Vector3()),framingPoints=[];
  // Fit the actual circular stage and the individual set pieces, not empty box corners.
  for(let i=0;i<48;i++)for(const y of [0,.33])framingPoints.push(new T.Vector3(Math.cos(i*Math.PI/24)*4.30-center.x,y-bounds.min.y,Math.sin(i*Math.PI/24)*3.05-center.z));
  for(const child of root.children.slice(3)){
    const b=new T.Box3().setFromObject(child);
    for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x-center.x,y-bounds.min.y,z-center.z));
  }
  const preserved=[...actors.map(a=>a.g),...cards,wave,viewer,gateway,scan];
  const model=finish(67,preserved);
  const stories={
    watch:{index:0,step:'01 / WATCHING',title:'You are watching the movie',detail:'Stay in your seat. The characters are part of the scene.'},
    enter:{speaker:'viewer',speech:'Enter the scene.',index:1,step:'02 / YOU SPEAK',title:'“Enter the scene.”',detail:'Your voice command activates the conversation.'},
    scanning:{index:1,step:'02 / SCANNING',title:'Scanning the scene',detail:'Reading the scene and identifying the characters before the conversation begins.'},
    ready:{index:1,step:'02 / CONNECTED',title:'The characters turn to you',detail:'You are still seated. Now you can ask them questions.'},
    askMaya:{speaker:'viewer',speech:'Maya, what happened here?',index:2,step:'03 / YOU ASK',title:'“Maya, what happened here?”',detail:'Maya listens while you ask your question.'},
    maya:{speaker:'maya',speech:'I heard something behind that door. I came back to find out what it was.',index:2,step:'03 / MAYA REPLIES',title:'“I heard something behind that door.”',detail:'“I came back to find out what it was.”'},
    askRiven:{speaker:'viewer',speech:'Riven, should we go inside?',index:3,step:'04 / YOU ASK',title:'“Riven, should we go inside?”',detail:'Riven listens to your follow-up question.'},
    riven:{speaker:'riven',speech:'Stay close. We don’t know who opened it.',index:3,step:'04 / RIVEN REPLIES',title:'“Stay close. We don’t know who opened it.”',detail:'The character responds to your question, within the scene.'},
    end:{index:3,step:'LISTENING',title:'What would you ask next?',detail:'You stay seated. The conversation continues with the movie characters.'}
  };
  const viewerSeat=viewer.position.clone(),viewerYaw=viewer.rotation.y;
  const annotations=[
    {id:'viewer',position:viewerSeat.clone().add(new T.Vector3(0,1.52,0)).toArray()},
    ...actors.map((a,i)=>({id:i===0?'maya':'riven',position:a.g.position.clone().add(new T.Vector3(0,2.05,0)).toArray()}))
  ];
  const actorYaws=actors.map(a=>a.g.rotation.y);
  const facingViewer=actors.map(a=>Math.atan2(viewerSeat.x-a.g.position.x,viewerSeat.z-a.g.position.z));
  const ease=(a,b,t)=>{const u=T.MathUtils.clamp((t-a)/(b-a),0,1);return u*u*(3-2*u);};
  let selected=null,selectionTime=0;
  const cardBase=cards.map(c=>c.position.y);
  const warmLight=new T.PointLight(0xffc68b,3,7,2);warmLight.position.set(0,3.2,.5);model.add(warmLight);
  const coolLight=new T.PointLight(0x83cddd,1.5,5,2);coolLight.position.set(0,1.7,-1.5);model.add(coolLight);
  model.userData={...model.userData,displayBase:false,groundLevel:0,framingPoints,annotations,studioProfile:'paper',contactFootprint:false,initialYaw:.06,initialElevation:.23,
    setStep(index,elapsed){selected=Number.isInteger(index)&&index>=0&&index<4?index:null;selectionTime=elapsed;},
    animate(seconds){
      const starts=[0,2,7,14],lengths=[2,5,7,7];
      const t=selected===null?Math.max(0,seconds)%24:starts[selected]+Math.min(Math.max(0,seconds-selectionTime),lengths[selected]-.001);
      const viewerSpeaking=(t>=2&&t<4)||(t>=7&&t<10)||(t>=14&&t<17);
      const reply=t>=10&&t<14?0:t>=17&&t<21?1:-1;
      model.userData.story=t<2?stories.watch:t<4?stories.enter:t<6.5?stories.scanning:t<7?stories.ready:t<10?stories.askMaya:t<14?stories.maya:t<17?stories.askRiven:t<21?stories.riven:stories.end;
      scan.visible=t>=4&&t<7;
      sweep.visible=t<6.5;
      sweep.position.y=T.MathUtils.lerp(3.72,.53,ease(4,6.5,t));
      scanGlow.opacity=.12*ease(4,4.2,t)*(1-ease(6.25,6.5,t));
      detections.forEach((target,i)=>{target.visible=t>=5.1+i*.18;target.scale.setScalar(.96+.04*ease(5.1+i*.18,5.4+i*.18,t));});
      // The viewer remains seated for every phase: only the interaction mode changes.
      viewer.position.copy(viewerSeat);viewer.rotation.y=viewerYaw;
      upper.position.y=.025;upper.rotation.x=-.10+(viewerSpeaking?.015*Math.sin(t*3):0);
      viewerLegs.forEach(({thigh,shin})=>{thigh.position.y=.50;thigh.rotation.x=-Math.PI/2;shin.rotation.x=Math.PI/2;});
      viewerArms.forEach((arm,i)=>{arm.rotation.x=viewerSpeaking&&i===1?-.24+Math.sin(t*2)*.08:0;});
      const connected=ease(6.5,7,t)*(1-ease(22.5,24,t));
      gateway.visible=connected>.05;
      actors.forEach((a,i)=>{
        const responding=reply===i;
        a.g.rotation.y=T.MathUtils.lerp(actorYaws[i],facingViewer[i],connected);
        a.head.rotation.x=responding?Math.sin(t*3)*.045:0;
        a.head.rotation.y=responding?Math.sin(t*1.5)*.04:0;
        a.arms[0].rotation.x=responding?-.30+Math.sin(t*2.5)*.13:0;
        a.arms[1].rotation.z=responding?Math.sin(t*2)*.07:0;
        a.mouth.scale.y=responding?.25+.85*Math.abs(Math.sin(t*8)):.20;
        a.replyWave.visible=responding;
        a.replyBars.forEach((bar,j)=>{bar.scale.y=.4+1.5*Math.abs(Math.sin(t*4+j));});
      });
      // The console visualizes your voice; character waveforms visualize their replies.
      bars.forEach((bar,i)=>{const h=viewerSpeaking?.08+.28*Math.abs(Math.sin(t*3+i*.7)):.025;bar.scale.y=h/.22;bar.position.y=h/2;});
      cards.forEach((card,i)=>{card.position.y=cardBase[i]+(reply===i?.04:0);});
    },
    setTheme(theme){const dark=theme==='dark';model.userData.studioLightScale=dark?.82:1;warmLight.intensity=dark?4:1.3;coolLight.intensity=dark?1.8:.5;materials.cyan.emissiveIntensity=dark?1.4:.45;materials.warm.emissiveIntensity=dark?2:.7;}
  };
  model.userData.animate(0);model.userData.setTheme('light');return model;
}
