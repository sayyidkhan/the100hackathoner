import { sculpture } from './sculpture.js';
import { createBrainCore } from './brain-org-core.js';
import { createOfficeDetails } from './brain-org-office.js';

// A working miniature: queue -> diagnosis -> rerouting -> recovered flow.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  materials.brass = new THREE.MeshStandardMaterial({color:0xb89453,metalness:.72,roughness:.30});
  materials.graphite = new THREE.MeshStandardMaterial({color:0x263343,metalness:.2,roughness:.55});
  materials.belt = new THREE.MeshStandardMaterial({color:0x1d4b9b,metalness:.15,roughness:.5});
  materials.ice = new THREE.MeshStandardMaterial({color:0x8aceff,emissive:0x368bea,emissiveIntensity:.35,roughness:.42});
  materials.amber = new THREE.MeshStandardMaterial({color:0xffc367,emissive:0xdf6217,emissiveIntensity:.4,roughness:.4});
  materials.green = new THREE.MeshStandardMaterial({color:0x6ec2a0,emissive:0x237a53,emissiveIntensity:.25,roughness:.4});
  const preserved=[], flowDots=[], indicators=[], belts=[];
  const group=(name,x=0,y=0,z=0,parent=root)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;};
  const keep=(...args)=>{const g=group(...args);preserved.push(g);return g;};
  function rounded(w,h,d,x,y,z,color='ivory',parent=root,r=.05) {
    r=Math.min(r,w/3,h/3,d/3);const s=new THREE.Shape();
    s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
    s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);
    s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const geo=new THREE.ExtrudeGeometry(s,{depth:d-r,bevelEnabled:true,bevelSize:r/2,bevelThickness:r/2,bevelSegments:2,curveSegments:6});
    geo.translate(0,0,-(d-r)/2);const o=mesh(geo,color,parent);o.position.set(x,y,z);return o;
  }
  const ring=(r,t,x,y,z,color='brass',parent=root)=>{const o=mesh(new THREE.TorusGeometry(r,t,8,56),color,parent);o.position.set(x,y,z);return o;};
  function documentCard(parent,color='ivory') {
    rounded(.24,.34,.028,0,.17,0,color,parent,.012);
    rounded(.15,.018,.006,-.018,.25,.020,'blue',parent,.002);
    for(let j=0;j<3;j++)box(.16-j*.025,.009,.006,-j*.01,.19-j*.048,.020,'shade',parent);
    box(.055,.026,.006,.064,.046,.020,'brass',parent);
  }

  // Layered architectural base, fine tile joints and a fluted rear wall.
  rounded(6.65,.22,4.5,0,.11,0,'paper',root,.10);
  rounded(6.53,.045,4.38,0,.247,0,'wood',root,.016);
  rounded(6.46,.055,4.31,0,.292,0,'ivory',root,.018);
  for(let x=-3;x<=3;x+=.50)for(let z=-1.90;z<1.8;z+=.50)box(.003,.002,.46,x,.322,z,'shade');
  for(let z=-1.9;z<1.8;z+=.5)box(6.12,.002,.003,0,.322,z,'shade');
  rounded(6.06,.88,.13,0,.77,-1.99,'paper');
  for(let x=-2.9;x<3;x+=.12)rounded(.039,.77,.035,x,.77,-1.90,'ivory',root,.010);
  rounded(6.15,.065,.20,0,1.24,-1.99,'wood');

  const office=createOfficeDetails(THREE);office.position.y=.13;root.add(office);preserved.push(office);
  // The oversized cortex is the main silhouette, mounted on a real instrument plinth.
  rounded(1.62,.18,.83,0,.42,-1.12,'graphite');
  rounded(1.48,.048,.76,0,.535,-1.12,'brass',root,.018);
  for(const x of [-.57,.57])rounded(.10,1.72,.11,x,1.38,-1.27,'wood');
  rounded(1.43,.11,.46,0,2.23,-1.14,'ivory');
  const brain=createBrainCore(THREE);brain.name='organizational-brain';brain.scale.setScalar(1.17);brain.position.set(0,3.04,-1.18);root.add(brain);preserved.push(brain);
  // Seven routed nodes physically engraved into the situation-room display.
  rounded(1.76,1.18,.13,0,1.55,-.97,'brass');rounded(1.66,1.08,.048,0,1.55,-.865,'graphite');
  const nodes=[[-.62,1.82],[-.62,1.28],[-.12,1.55],[.32,1.86],[.64,1.55],[.32,1.23]];
  for(const [a,b] of [[0,2],[1,2],[2,3],[2,4],[2,5]])line([[nodes[a][0],nodes[a][1],-.82],[(nodes[a][0]+nodes[b][0])/2,nodes[a][1],-.82],[nodes[b][0],nodes[b][1],-.82]],.012,'brass');
  nodes.forEach(([x,y],i)=>{rounded(.23,.16,.032,x,y,-.79,i===2?'red':'ivory');box(.13,.011,.009,x,y+.025,-.765,'blue');});
  const alert=keep('diagnostic-node',-.12,1.55,-.75);ring(.16,.016,0,0,0,'amber',alert);
  const fixed=keep('resolved-node',-.12,1.55,-.75);ring(.16,.016,0,0,0,'green',fixed);
  for(let i=0;i<3;i++) {const g=keep(`stage-indicator-${i}`,-.44+i*.44,1.04,-.75);rounded(.32,.035,.022,0,0,0,['amber','ice','green'][i],g,.005);indicators.push(g);}

  // Broad elevated conveyor with an actual deck, inset ribs, rails, legs and fasteners.
  function conveyor(points,width,color) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
    const vertices=[],indices=[],count=100;
    const edgeA=[],edgeB=[];
    for(let i=0;i<=count;i++) {
      const u=i/count,p=curve.getPointAt(u),t=curve.getTangentAt(u),n=new THREE.Vector3(t.z,0,-t.x).normalize();
      const a=p.clone().addScaledVector(n,width/2),b=p.clone().addScaledVector(n,-width/2);
      vertices.push(...a.toArray(),...b.toArray());edgeA.push([a.x,a.y+.065,a.z]);edgeB.push([b.x,b.y+.065,b.z]);
      if(i<count){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
      if(i%20===0){disk(.023,p.y-.34,p.x,(p.y+.34)/2,p.z,'brass');disk(.087,.035,p.x,.34,p.z,'wood');}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
    materials[color].side=THREE.DoubleSide;mesh(geo,color);line(edgeA,.027,'brass');line(edgeB,.027,'brass');
    const slats=new THREE.InstancedMesh(new THREE.BoxGeometry(width-.08,.018,.032),materials.shade,24);
    const moving=keep(`moving-belt-${belts.length}`);moving.add(slats);
    const pose=new THREE.Object3D(),tangent=new THREE.Vector3();
    const update=distance=>{
      for(let i=0;i<24;i++){
        const u=(i/24+distance)%1;curve.getPointAt(u,pose.position);pose.position.y+=.017;
        curve.getTangentAt(u,tangent);pose.rotation.y=Math.atan2(tangent.x,tangent.z);pose.updateMatrix();slats.setMatrixAt(i,pose.matrix);
      }
      slats.instanceMatrix.needsUpdate=true;
    };
    update(0);belts.push(update);
    return curve;
  }
  const junction=new THREE.Vector3(-.65,.88,.95);
  conveyor([[-2.9,.88,.95],[-1.9,.88,.95],[-.65,.88,.95]],.43,'graphite');
  conveyor([[-.65,.88,.95],[.4,.88,.95],[1.40,.88,.95]],.32,'red');
  const route=conveyor([[-.65,.88,.95],[-.52,.88,1.49],[.15,.88,1.78],[1.22,.88,1.66],[1.88,.88,1.15],[2.56,.88,.95]],.47,'belt');
  for(let i=0;i<7;i++){const g=keep(`flow-beacon-${i}`);line([[-.08,.05,-.055],[0,.05,.055],[.08,.05,-.055]],.017,'ice',g);flowDots.push(g);}
  // A light races along the newly opened bypass before the documents follow it.
  const energized=keep('energized-bypass');
  const routeGlow=mesh(new THREE.TubeGeometry(route,120,.021,6,false),'ice',energized);routeGlow.position.y=.031;
  routeGlow.castShadow=false;

  // A substantial approval checkpoint, alarm beacon and mechanical diverter.
  for(const z of [.68,1.23])rounded(.20,.86,.16,-.17,1.10,z,'red');
  rounded(.25,.17,.76,-.17,1.61,.95,'red');
  for(const z of [.68,1.23])for(const y of [.75,1.49]){const bolt=disk(.028,.016,-.302,y,z,'brass');bolt.rotation.z=Math.PI/2;}
  const beacon=keep('queue-alarm',-.17,1.77,.95);disk(.09,.045,0,-.055,0,'brass',beacon);ball(.064,0,0,0,'amber',beacon);
  const diverter=keep('route-diverter',-.65,.97,1.19);rounded(.045,.11,.41,0,0,-.17,'brass',diverter,.012);
  const barrier=keep('approval-barrier',-.40,1.16,.64);
  rounded(.075,.075,.60,0,0,.28,'ivory',barrier,.016);
  for(let i=0;i<4;i++)rounded(.082,.081,.061,0,0,.055+i*.135,'red',barrier,.007);
  ball(.078,0,0,0,'brass',barrier);
  // Lens on a two-joint inspection arm points directly at the queue.
  disk(.16,.05,-.98,.36,.37,'graphite');
  line([[-.98,.38,.37],[-1.11,1.18,.37],[-.67,1.78,.65],[-.32,1.78,.88]],.030,'brass');
  for(const p of [[-1.11,1.18,.37],[-.67,1.78,.65]])ball(.065,...p,'brass');
  const lens=keep('inspection-lens',-.32,1.78,.90);ring(.24,.035,0,0,0,'brass',lens);
  materials.glass=new THREE.MeshPhysicalMaterial({color:0xa2d3ea,transparent:true,opacity:.15,metalness:.05,roughness:.12,side:THREE.DoubleSide,depthWrite:false});
  const glass=mesh(new THREE.CircleGeometry(.215,48),'glass',lens);glass.position.z=.003;
  const scan=keep('diagnosis-sweep',-.65,.905,.95);const scanRing=ring(.31,.012,0,0,0,'amber',scan);scanRing.rotation.x=Math.PI/2;
  const scanCone=keep('inspection-beam',-.48,1.32,.95);
  const beamMaterial=new THREE.MeshBasicMaterial({color:0x71ceff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
  const cone=new THREE.Mesh(new THREE.ConeGeometry(.37,.80,40,1,true),beamMaterial);cone.castShadow=false;scanCone.add(cone);
  const signalPath=new THREE.CatmullRomCurve3([new THREE.Vector3(-.48,1.78,.95),new THREE.Vector3(.25,2.12,.15),new THREE.Vector3(0,2.52,-1.05)]);
  const signalPackets=Array.from({length:4},(_,i)=>{const g=keep(`diagnosis-packet-${i}`);ball(.043,0,0,0,'ice',g);return g;});
  const ripples=Array.from({length:2},(_,i)=>{const g=keep(`solution-ripple-${i}`,-.48,.343,.95);const m=ring(.35,.012,0,0,0,'ice',g);m.rotation.x=Math.PI/2;return g;});

  // Completed dossier tray and an embossed checkmark on its front face.
  rounded(.72,.12,.70,2.57,.84,.95,'blue');
  for(const x of [2.24,2.90])rounded(.06,.30,.70,x,1.01,.95,'blue');
  rounded(.68,.30,.055,2.57,1.01,.64,'blue');rounded(.68,.14,.055,2.57,.93,1.27,'blue');
  for(const x of [2.33,2.81])for(const z of [.73,1.18])disk(.023,.47,x,.565,z,'brass');
  const badge=keep('completed-check',2.57,1.03,1.34);const face=disk(.18,.033,0,0,0,'ivory',badge);face.rotation.x=Math.PI/2;
  line([[-.09,0,.035],[-.023,-.064,.035],[.105,.068,.035]],.022,'blue',badge);
  const tasks=Array.from({length:6},(_,i)=>{const g=keep(`task-${i}`);documentCard(g);return g;});
  // Completion has one clear payoff, followed by a short, tidy reset.
  const success=keep('workflow-restored',2.57,1.78,.95);
  ring(.28,.025,0,0,0,'green',success);
  line([[-.14,0,.025],[-.04,-.10,.025],[.15,.12,.025]],.031,'green',success);
  const sparks=Array.from({length:16},(_,i)=>{const g=keep(`completion-spark-${i}`);box(.045,.07,.022,0,0,0,i%3?'brass':'ice',g);return g;});
  // Small phase plaque at the front makes the sequence readable at a glance.
  rounded(1.35,.085,.28,0,.38,2.02,'graphite');
  for(let i=0;i<3;i++){const marker=keep(`plaque-stage-${i}`,-.4+i*.4,.43,2.02);disk(.075,.018,0,0,0,['amber','ice','green'][i],marker);indicators.push(marker);}
  const halo=keep('brain-pool-light',0,2.5,-1.05);const coreLight=new THREE.PointLight(0x6ca9ff,0,3.2,2);halo.add(coreLight);

  const model=finish(59,preserved),offset=tasks[0].position.clone();
  // The architecture supplies its own plinth; frame it without a second disc.
  model.userData.displayBase=false;
  const taskPositions=tasks.map((_,i)=>new THREE.Vector3(-.89-i*.32,.92,.95));
  const successHome=success.position.clone(),badgeHome=badge.position.clone();
  const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
  const clamp=THREE.MathUtils.clamp, tangent=new THREE.Vector3();
  const easeOut=x=>1-Math.pow(1-clamp(x,0,1),3);
  const story={step:'01',title:'Work is piling up',detail:'6 tasks · waiting for approval',tone:'blocked'};
  const state={phase:0,activation:0,solved:0};
  // Include the temporary hologram, paper arcs and brain lift in the camera fit.
  model.userData.framingBounds=new THREE.Box3(new THREE.Vector3(-3.38,0,-2.27),new THREE.Vector3(3.38,4.08,2.27));
  let night=false;
  model.userData.animate=elapsed=>{
    const t=Math.max(0,Number.isFinite(elapsed)?elapsed:0),phase=t%16;
    const stage=phase<3?'queue':phase<5.4?'diagnose':phase<6.3?'breakthrough':phase<12.6?'reroute':phase<14.3?'complete':'reset';
    const activation=smooth(3,5.5,phase)*(1-smooth(14.3,16,phase));
    const opened=smooth(5.4,6.15,phase)*(1-smooth(14.3,15.3,phase));
    model.userData.workflowStage=stage;
    let completed=0;
    tasks.forEach((task,i)=>{
      const queued=taskPositions[i],start=6.15+i*.48,travel=phase-start;
      task.rotation.set(0,0,0);task.scale.setScalar(1);task.visible=true;
      if(phase>=14.3){
        // Completed cards fold away; the next queue rises from the feed below.
        const fold=smooth(14.3+i*.08,14.65+i*.08,phase),feed=smooth(15+i*.075,15.45+i*.075,phase);
        if(fold<1){task.position.set(2.57,.92+i*.031,.95);task.rotation.x=-Math.PI/2;task.scale.setScalar(1-fold);}
        else {task.position.copy(queued);task.position.x-=.25;task.position.y-=.22*(1-feed);task.scale.setScalar(feed);task.rotation.z=-.18*(1-feed);}
      } else if(travel<0){
        const push=smooth(.20+i*.15,1.35+i*.15,phase),hit=Math.max(0,phase-(1.35+i*.15));
        task.position.set(queued.x-.25*(1-push),.92,.95);
        task.rotation.z=-.17*Math.sin(hit*10)*Math.exp(-hit*3);
      } else if(travel<.55){
        task.position.copy(queued).lerp(junction,easeOut(travel/.55));task.position.y=.92;
        task.rotation.z=-.13*Math.sin(travel/.55*Math.PI);
      } else if(travel<3.10){
        const u=clamp((travel-.55)/2.55,0,1);route.getPointAt(u,task.position);route.getTangentAt(u,tangent);
        task.position.y+=.04+.035*Math.sin(u*Math.PI*8);task.rotation.y=Math.atan2(-tangent.z,tangent.x)*.5;
        task.rotation.z=-.10*Math.sin(u*Math.PI*2);
      } else if(travel<3.67){
        const u=clamp((travel-3.10)/.57,0,1);task.position.set(2.56,.92+.42*Math.sin(u*Math.PI)+i*.031*u,.95);
        task.rotation.x=-Math.PI/2*smooth(0,1,u);task.rotation.z=.12*Math.sin(u*Math.PI);
      } else {task.position.set(2.57,.92+i*.031,.95);task.rotation.x=-Math.PI/2;completed++;}
      task.position.add(offset);
    });
    model.userData.completedTasks=completed;
    state.phase=phase;state.activation=activation;state.solved=completed/6;
    brain.userData.animate?.(phase,state);office.userData.animate?.(phase,state);
    const diagnosing=phase>=3&&phase<5.7,flowing=phase>=5.4&&phase<14.5;
    alert.visible=phase<5.4||phase>=15;fixed.visible=phase>=5.4&&phase<15;
    alert.scale.setScalar(1+.22*Math.sin(phase*Math.PI*2));beacon.scale.setScalar(1+(phase<5.4?.16*Math.sin(phase*Math.PI*2):0));
    materials.amber.emissiveIntensity=(night?.75:.3)+(phase<5.4?.45*(.5+.5*Math.sin(phase*Math.PI*2)):0);
    scan.visible=diagnosing;scan.scale.setScalar(.7+.5*((phase-3+.5)%1));
    lens.rotation.y=diagnosing?Math.sin((phase-3)*3)*.25:0;lens.rotation.x=-.16*activation;
    scanCone.visible=diagnosing;beamMaterial.opacity=diagnosing?.13+.045*Math.sin((phase-3)*3):0;
    signalPackets.forEach((packet,i)=>{const u=(phase-3.2-i*.16)/1.45;packet.visible=u>=0&&u<=1;signalPath.getPoint(clamp(u,0,1),packet.position).add(offset);packet.scale.setScalar(.7+.8*Math.sin(clamp(u,0,1)*Math.PI));});
    diverter.rotation.y=-opened*Math.PI*.46;
    barrier.rotation.x=-opened*Math.PI*.53;
    if(phase<3)barrier.rotation.x+=.045*Math.sin(phase*8)*smooth(.4,1.7,phase);
    belts[0](phase<2.8?phase*.09:phase<6.15?.252:.252+(phase-6.15)*.13);
    belts[1](0);belts[2](Math.max(0,phase-5.4)*.24);
    energized.visible=flowing;routeGlow.geometry.setDrawRange(0,Math.floor(smooth(5.4,6.2,phase)*routeGlow.geometry.index.count/3)*3);
    flowDots.forEach((dot,i)=>{const u=((phase-5.4)*.27+i/7+10)%1;dot.visible=flowing;route.getPointAt(u,dot.position).add(offset);route.getTangentAt(u,tangent);dot.rotation.y=Math.atan2(tangent.x,tangent.z);dot.scale.setScalar(opened);});
    ripples.forEach((r,i)=>{const u=(phase-5.4-i*.20)/.9;r.visible=u>=0&&u<1;r.scale.setScalar(.4+clamp(u,0,1)*2.3);});
    const index=phase<5.4?0:phase<12.6?1:2;
    indicators.forEach((o,i)=>{o.scale.setScalar(i%3===index?1:.48);});
    const celebrate=smooth(12.05,12.65,phase)*(1-smooth(14.15,14.65,phase));
    success.visible=celebrate>0;success.scale.setScalar(1.35*celebrate);success.position.copy(successHome);success.position.y+=.24*celebrate;
    success.rotation.y=Math.sin((phase-12.05)*2)*.16;
    badge.position.copy(badgeHome);badge.position.y+=completed?.045*Math.sin(phase*5):0;badge.scale.setScalar(1+celebrate*.13);
    sparks.forEach((spark,i)=>{const u=phase-12.30-(i%3)*.06,a=i*2.39996;const age=clamp(u,0,1.35);spark.visible=u>0&&u<1.35;
      spark.position.set(2.57+Math.cos(a)*age*.43,1.9+age*(.7+(i%4)*.13)-age*age*.9,.95+Math.sin(a)*age*.4).add(offset);
      spark.rotation.set(age*3+i,age*2,age*5);spark.scale.setScalar((1-smooth(.85,1.35,age))*.8);
    });
    coreLight.intensity=night?.6+activation*2.0:.12+activation*.28;
    if(stage==='queue'){Object.assign(story,{step:'01',title:'Work is piling up',detail:'6 tasks · one blocked approval',tone:'blocked'});}
    else if(stage==='diagnose'){Object.assign(story,{step:'02',title:'Brain online. Blockage found.',detail:'Tracing the handoff that stopped the team',tone:'thinking'});}
    else if(stage==='breakthrough'){Object.assign(story,{step:'03',title:'A better route opens',detail:'The bypass is ready. Release the queue.',tone:'flowing'});}
    else if(stage==='reroute'){Object.assign(story,{step:'03',title:'Work is moving again',detail:`${completed} of 6 tasks delivered`,tone:'flowing'});}
    else if(stage==='complete'){Object.assign(story,{step:'04',title:'Bottleneck cleared.',detail:'6 of 6 delivered · the team can move on',tone:'complete'});}
    else {Object.assign(story,{step:'↻',title:'Ready for the next challenge',detail:'A new workflow enters the system',tone:'thinking'});}
    model.userData.story=story;
  };
  model.userData.setTheme=theme=>{
    night=theme==='dark';brain.userData.setTheme?.(theme);office.userData.setTheme?.(theme);
    materials.ice.emissiveIntensity=night?1.1:.25;materials.amber.emissiveIntensity=night?.9:.25;materials.green.emissiveIntensity=night?.75:.2;
    model.userData.studioLightScale=night?.68:1;coreLight.intensity=night?1.1:0;
  };
  model.userData.animate(0);model.userData.setTheme('light');return model;
}
