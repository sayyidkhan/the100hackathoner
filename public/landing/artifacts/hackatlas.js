import { sculpture } from './sculpture.js';
import { createAtlasGlobe } from './hackatlas-globe.js';
import { createAtlasTeam } from './hackatlas-team.js';
import { createFitPanel } from './hackatlas-fit.js';

// A precision atlas instrument, a shortlist, and the team it brings together.
export function createArtifact(THREE) {
  const {root,materials,mesh,box,disk,ball,line,finish}=sculpture(THREE);
  materials.brass=new THREE.MeshStandardMaterial({color:0xc2a269,metalness:.78,roughness:.30});
  materials.navy=new THREE.MeshStandardMaterial({color:0x122d4d,metalness:.18,roughness:.43});
  materials.oak=new THREE.MeshStandardMaterial({color:0x9e7148,roughness:.6});
  materials.glow=new THREE.MeshStandardMaterial({color:0x89cee1,emissive:0x42b8dd,emissiveIntensity:.45,roughness:.35});
  materials.mint=new THREE.MeshStandardMaterial({color:0x77b59e,emissive:0x29896d,emissiveIntensity:.22,roughness:.5});
  materials.skin=new THREE.MeshStandardMaterial({color:0xc39473,roughness:.63});
  materials.terra=new THREE.MeshStandardMaterial({color:0xb86146,roughness:.64});
  const preserved=[],profiles=[],connections=[];
  const group=(name,x=0,y=0,z=0,parent=root)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;};
  const keep=(...args)=>{const g=group(...args);preserved.push(g);return g;};
  function rounded(w,h,d,x,y,z,color='ivory',parent=root,r=.05) {
    r=Math.min(r,w/3,h/3,d/3);const s=new THREE.Shape();
    s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
    s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);
    s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const geo=new THREE.ExtrudeGeometry(s,{depth:d-r,bevelEnabled:true,bevelSize:r/2,bevelThickness:r/2,bevelSegments:2,curveSegments:5});
    geo.translate(0,0,-(d-r)/2);const o=mesh(geo,color,parent);o.position.set(x,y,z);return o;
  }
  const ring=(r,t,x,y,z,color='brass',parent=root)=>{const o=mesh(new THREE.TorusGeometry(r,t,8,64),color,parent);o.position.set(x,y,z);return o;};
  // Three finely stepped edges replace the oversized second display disc.
  rounded(6.58,.20,4.36,0,.10,0,'paper',root,.09);
  rounded(6.48,.060,4.26,0,.227,0,'navy',root,.025);
  rounded(6.40,.025,4.18,0,.273,0,'brass',root,.01);
  rounded(6.35,.056,4.12,0,.31,0,'ivory',root,.02);
  for(let x=-2.9;x<3.1;x+=.6)box(.003,.002,3.7,x,.340,0,'shade');
  for(let z=-1.85;z<2;z+=.6)box(6.1,.002,.003,0,.340,z,'shade');
  // A quiet architectural backdrop makes the studio feel like one place.
  rounded(2.72,.81,.12,1.58,.77,-1.84,'paper');
  for(let x=.30;x<2.94;x+=.12)rounded(.040,.70,.038,x,.78,-1.75,'ivory',root,.012);
  rounded(2.79,.055,.21,1.58,1.19,-1.84,'oak');
  rounded(2.83,.017,2.40,1.57,.351,.22,'paper',root,.006);
  // Heavy machined globe foot, with an etched instrument dial.
  disk(.65,.10,-1.58,.385,-.40,'navy');disk(.59,.042,-1.58,.458,-.40,'brass');disk(.51,.043,-1.58,.502,-.40,'ivory');
  for(let i=0;i<48;i++){const a=i*Math.PI/24;const tick=box(i%4===0?.014:.007,.006,i%4===0?.065:.033,-1.58+Math.sin(a)*.55,.485,-.40+Math.cos(a)*.55,'navy');tick.rotation.y=a;}
  const globe=createAtlasGlobe(THREE);globe.position.set(-1.58,1.98,-.40);globe.scale.setScalar(1.10);root.add(globe);preserved.push(globe);
  const team=createAtlasTeam(THREE);team.position.set(1.55,.35,.20);team.scale.setScalar(1.16);root.add(team);preserved.push(team);
  const panel=createFitPanel(THREE);panel.position.set(1.55,2.31,-1.48);root.add(panel);preserved.push(panel);
  for(const x of [.94,2.16]){rounded(.065,1.72,.065,x,1.21,-1.57,'brass',root,.013);rounded(.25,.042,.31,x,.36,-1.57,'navy');}

  // Six anonymous dossiers have real depth, portrait relief and a skill signature.
  const placements=[[-2.81,1.10],[-2.19,1.33],[-1.57,1.46],[-.95,1.49],[-.33,1.40],[.29,1.20]];
  const selection=[0,2,3,5];
  placements.forEach(([x,z],i)=>{
    const profile=keep(`atlas-profile-${i}`,x,.37,z);profile.rotation.y=-.22+i*.07;
    rounded(.55,.055,.28,0,0,0,'navy',profile,.013);
    rounded(.49,.70,.069,0,.38,0,'brass',profile,.03);
    rounded(.45,.663,.074,0,.38,.017,'ivory',profile,.035);
    rounded(.43,.115,.018,0,.650,.066,'navy',profile,.008);
    for(let j=0;j<3;j++)disk(.012,.008,-.155+j*.045,.680,.078,j===0?'glow':'brass',profile).rotation.x=Math.PI/2;
    const portrait=ball(.075,-.092,.47,.076,i%2?'skin':'oak',profile);portrait.scale.set(1,1.13,.35);
    const shoulders=ball(.105,-.092,.369,.073,['navy','terra','blue'][i%3],profile);shoulders.scale.set(1,.58,.26);
    for(let j=0;j<3;j++)rounded(.16-j*.026,.013,.008,.101-j*.013,.49-j*.045,.073,j===0?'navy':'shade',profile,.002);
    for(let j=0;j<3;j++){
      rounded(.34,.023,.008,0,.262-j*.066,.073,'paper',profile,.003);
      rounded(.15+((i*3+j*2)%5)*.033,.021,.010,-.088+((i*3+j*2)%5)*.0165,.262-j*.066,.080,['blue','terra','brass'][j],profile,.003);
    }
    const selected=group('profile-selected',.167,.64,.091,profile);ring(.049,.008,0,0,0,'mint',selected);
    line([[-.026,0,.009],[-.007,-.019,.009],[.026,.022,.009]],.006,'mint',selected);
    const foot=ring(.24,.012,0,-.014,0,'glow',profile);foot.rotation.x=Math.PI/2;foot.scale.y=.64;
    profiles.push({profile,selected,foot,initialY:0,initialTurn:profile.rotation.y});
    const path=new THREE.CatmullRomCurve3([new THREE.Vector3(x,.351,z+.17),new THREE.Vector3(x+.16,.351,z+.37),new THREE.Vector3(.50,.351,1.80),new THREE.Vector3(1.12,.351,1.22)]);
    line(path.points.map(p=>p.toArray()),.009,'brass');
    const link=keep(`profile-route-${i}`);const tube=mesh(new THREE.TubeGeometry(path,64,.014,6,false),'glow',link);tube.position.y=.01;
    const packet=keep(`matched-profile-packet-${i}`);ball(.038,0,.055,0,'glow',packet);
    connections.push({path,link,tube,packet});
  });
  // The shortlist scanner deliberately visits a dossier; selected ones rise in response.
  const scanner=keep('shortlist-scanner');
  for(const sx of [-1,1])for(const sy of [-1,1])line([[sx*.21,sy*.39-.065*sy,0],[sx*.21,sy*.39,0],[sx*.21-.075*sx,sy*.39,0]],.014,'glow',scanner);

  // Brief tablet and an invitation station are functional-looking pieces of the desk.
  const brief=keep('hackathon-brief',-1.84,.39,1.87);brief.rotation.x=-Math.PI/2+.10;
  rounded(.83,.36,.048,0,0,0,'navy',brief,.03);rounded(.73,.28,.009,0,0,.033,'ivory',brief,.013);
  rounded(.17,.04,.006,-.22,.07,.042,'terra',brief,.003);
  for(let j=0;j<3;j++)rounded(.54-j*.07,.013,.006,-j*.025,.0-j*.047,.043,'shade',brief,.002);
  for(let j=0;j<4;j++)rounded(.09,.009,.004,.027+j*.042,.08,.043,'blue',brief,.002);
  const mailbox=keep('invitation-station',1.89,.39,1.77);
  rounded(.95,.08,.40,0,0,0,'navy',mailbox,.025);rounded(.86,.018,.31,0,.052,0,'brass',mailbox,.008);
  const envelope=keep('team-invitation',1.89,.48,1.77);
  rounded(.58,.025,.28,0,0,0,'ivory',envelope,.008);
  line([[-.28,.018,-.13],[0,.022,.02],[.28,.018,-.13]],.008,'brass',envelope);
  rounded(.07,.007,.059,.20,.021,.07,'terra',envelope,.002);
  const confirm=keep('team-ready',1.55,1.58,.20);ring(.22,.018,0,0,0,'mint',confirm);
  line([[-.11,0,.022],[-.03,-.065,.022],[.12,.075,.022]],.022,'mint',confirm);
  const lighting=keep('atlas-lighting');
  const accent=new THREE.PointLight(0x6cbee3,0,3.7,2);accent.position.set(-1.58,2.6,.45);lighting.add(accent);

  // Batch each dossier's fixed details while keeping its selection effects live.
  profiles.forEach(({profile,selected,foot})=>{
    profile.remove(selected,foot);profile.updateWorldMatrix(true,true);
    const inverse=profile.matrixWorld.clone().invert(),batches=new Map();
    profile.traverse(o=>{
      if(!o.isMesh)return;
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
      g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));
      if(!batches.has(o.material))batches.set(o.material,{positions:[],normals:[]});
      const b=batches.get(o.material);
      for(const v of g.attributes.position.array)b.positions.push(v);
      for(const v of g.attributes.normal.array)b.normals.push(v);
      g.dispose();o.geometry.dispose();
    });
    profile.clear();
    for(const [material,b] of batches){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.normals,3));g.computeBoundingSphere();const m=new THREE.Mesh(g,material);m.castShadow=m.receiveShadow=true;profile.add(m);}
    profile.add(selected,foot);
  });
  const model=finish(58,preserved),offset=scanner.position.clone(),envelopeHome=envelope.position.clone(),confirmHome=confirm.position.clone();
  profiles.forEach(p=>p.initialY=p.profile.position.y);
  model.userData.displayBase=false;
  model.userData.framingBounds=new THREE.Box3(new THREE.Vector3(-3.36,0,-2.20),new THREE.Vector3(3.36,3.61,2.20));
  const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b),clamp=THREE.MathUtils.clamp;
  const story={step:'01',title:'A world of builders',detail:'Start with the brief. Explore the network.',tone:'thinking'};
  const state={phase:0,matched:0};let dark=false;
  model.userData.animate=elapsed=>{
    const phase=Math.max(0,Number.isFinite(elapsed)?elapsed:0)%16;
    const reset=1-smooth(14.5,16,phase),matched=phase>=14.5?Math.max(0,4-Math.floor((phase-14.5)/.375)):Math.min(4,Math.max(0,Math.floor((phase-4)/1.12)+1));
    state.phase=phase;state.matched=matched;
    globe.userData.animate?.(phase,state);team.userData.animate?.(phase,state);panel.userData.animate?.(phase,state);
    let focused=phase<4?Math.min(5,Math.floor(phase/4*6)):selection[Math.min(3,Math.max(0,Math.floor((phase-4)/1.12)))];
    profiles.forEach(({profile,selected,foot,initialY,initialTurn},i)=>{
      const order=selection.indexOf(i),progress=order<0?0:smooth(4+order*1.12,4.55+order*1.12,phase)*reset;
      profile.position.y=initialY+progress*.15;profile.rotation.x=-.07*progress;profile.rotation.y=initialTurn+progress*.08;
      selected.visible=progress>.5;foot.visible=progress>.02;foot.scale.x=1+.08*Math.sin(phase*3)*progress;
      const {link,tube,packet,path}=connections[i];link.visible=progress>0;tube.geometry.setDrawRange(0,Math.floor(progress*tube.geometry.index.count/3)*3);
      const u=clamp((phase-4.25-order*1.12)/1.5,0,1);packet.visible=order>=0&&u>0&&u<1;path.getPointAt(u,packet.position).add(offset);
    });
    const [sx,sz]=placements[focused];scanner.position.set(sx,.76,sz+.10).add(offset);scanner.rotation.y=profiles[focused].initialTurn;
    scanner.visible=phase<8.5;scanner.scale.setScalar(.96+.04*Math.sin(phase*Math.PI*2));
    const invite=smooth(11.7,12.4,phase)*reset;
    envelope.position.copy(envelopeHome);envelope.position.y+=invite*.65;envelope.position.x-=invite*.16;
    envelope.rotation.set(invite*.55,invite*-.15,invite*-.08);
    const readiness=smooth(8.5,9.4,phase)*reset;confirm.visible=readiness>0;confirm.scale.setScalar(readiness);confirm.position.copy(confirmHome);confirm.position.y+=readiness*.13;
    accent.intensity=dark?.40+.75*Math.sin(phase/16*Math.PI)**2:.08;
    materials.glow.emissiveIntensity=dark?1.05:.28;materials.mint.emissiveIntensity=dark?.55:.18;
    if(phase<4)Object.assign(story,{step:'01',title:'A world of builders',detail:'Start with the brief. Explore the network.',tone:'thinking'});
    else if(phase<8.5)Object.assign(story,{step:'02',title:'Find strengths that fit together',detail:`${matched} of 4 complementary builders shortlisted`,tone:'flowing'});
    else if(phase<11.7)Object.assign(story,{step:'03',title:'Four roles. One stronger team.',detail:'The shortlist becomes a shared workspace.',tone:'complete'});
    else if(phase<14.5)Object.assign(story,{step:'04',title:'From a match to a conversation',detail:'An invitation is ready for your review.',tone:'complete'});
    else Object.assign(story,{step:'↻',title:'A new brief. A new possibility.',detail:'Explore the next team.',tone:'thinking'});
    model.userData.story=story;model.userData.matchedBuilders=matched;
  };
  model.userData.setTheme=theme=>{dark=theme==='dark';globe.userData.setTheme?.(theme);team.userData.setTheme?.(theme);panel.userData.setTheme?.(theme);model.userData.studioLightScale=dark?.70:1;model.userData.animate(model.userData.phase??0);};
  // Persist the exact pose on theme change, including while paused.
  const animate=model.userData.animate;model.userData.animate=t=>{model.userData.phase=Math.max(0,Number.isFinite(t)?t:0)%16;animate(t);};
  // Fit the actual component silhouettes across the animation, allowing the
  // globe and team to fill the view without clipping a later invitation pose.
  const componentBounds=model.children.map(()=>new THREE.Box3());
  for(let phase=0;phase<16;phase+=.5){model.userData.animate(phase);model.updateMatrixWorld(true);model.children.forEach((child,i)=>componentBounds[i].union(new THREE.Box3().setFromObject(child)));}
  model.userData.framingPoints=[];
  for(const bounds of componentBounds){if(bounds.isEmpty())continue;bounds.expandByScalar(.035);for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])model.userData.framingPoints.push(new THREE.Vector3(x,y,z));}
  model.userData.animate(0);model.userData.setTheme('light');return model;
}
