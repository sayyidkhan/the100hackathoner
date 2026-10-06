import { sculpture } from './sculpture.js';

// A seekable miniature battle: the shared gallery clock owns pause and reset.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  materials.metal = new THREE.MeshStandardMaterial({color:0x687786,roughness:.38,metalness:.65});
  materials.screen = new THREE.MeshStandardMaterial({color:0x16344d,roughness:.4,emissive:0x123a5b,emissiveIntensity:.3});
  materials.energy = new THREE.MeshStandardMaterial({color:0x70d9ff,emissive:0x249bff,emissiveIntensity:1.1,roughness:.35});
  materials.warning = new THREE.MeshStandardMaterial({color:0xffb86b,emissive:0xff6e21,emissiveIntensity:1,roughness:.45});
  const moving=[];
  function group(name,x=0,y=0,z=0) {
    const g=new THREE.Group();g.name=name;g.position.set(x,y,z);root.add(g);moving.push(g);return g;
  }
  function ring(r,t,x,y,z,color='metal',parent=root) {
    const m=mesh(new THREE.TorusGeometry(r,t,8,32),color,parent);m.position.set(x,y,z);return m;
  }
  function between(object,a,b,radius=1) {
    object.position.copy(a).lerp(b,.5);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());
    object.scale.set(radius,a.distanceTo(b),radius);
  }
  box(7.2,.22,3.8,0,.11,0,'shade');box(7.12,.065,3.72,0,.252,0,'paper');
  for(const x of [-3.42,3.42])for(const z of [-1.7,1.7])disk(.055,.018,x,.297,z,'metal');
  // Etched floor tiles and service trenches ground the miniature in a data hall.
  for(let x=-3.2;x<3.3;x+=.4)for(let z=-1.6;z<1.7;z+=.4)box(.375,.009,.375,x,.291,z,'ivory');
  const path=new THREE.CatmullRomCurve3([[-2.85,.34,-.45],[-2.08,.34,.5],[-.9,.34,.72],[.45,.34,.38],[1.6,.34,.72],[2.83,.34,-.46]].map(p=>new THREE.Vector3(...p)));
  mesh(new THREE.TubeGeometry(path,100,.19,12,false),'blue');
  for(let i=0;i<29;i++) {
    const p=path.getPointAt(i/28),t=path.getTangentAt(i/28);
    const stripe=box(.042,.014,.10,p.x,.527,p.z,'paper');stripe.rotation.y=Math.atan2(t.x,t.z);
  }
  const fans=[],status=[];
  for(const [x,color] of [[-2.87,'blue'],[2.87,'red']]) {
    box(.98,1.57,.83,x,1.09,-.73,'ivory');box(.77,1.37,.025,x,1.07,-.3,'ink');
    for(const dx of [-.47,.47])box(.09,1.64,.1,x+dx,1.09,-.25,'metal');
    for(let i=0;i<6;i++) {
      const y=.48+i*.22;
      box(.66,.175,.07,x,y,-.26,'shade');box(.48,.09,.018,x-.055,y,-.214,'screen');
      for(let j=0;j<5;j++)box(.055,.012,.018,x-.22+j*.082,y,-.2,'metal');
      const led=group('server-status',x+.255,y,-.203);ball(.022,0,0,0,i%3?'energy':'warning',led);status.push(led);
    }
    box(.99,.075,.91,x,1.91,-.73,color);
    for(const dx of [-.24,.24]) {
      disk(.17,.025,x+dx,1.966,-.73,'ink');
      const rotor=group('cooling-fan',x+dx,1.987,-.73);fans.push(rotor);
      for(let j=0;j<4;j++){const blade=box(.18,.015,.062,.055,0,0,'metal',rotor);blade.rotation.y=j*Math.PI/2;blade.position.set(Math.cos(j*Math.PI/2)*.065,0,Math.sin(j*Math.PI/2)*.065);}
      ball(.027,0,.015,0,'metal',rotor);
    }
    box(.03,.51,.03,x-.34,2.20,-1.02,'metal');box(.31,.18,.025,x-.17,2.36,-1.02,color);
    // Cable bundles run down the back of both server racks.
    for(let j=0;j<3;j++)line([[x-.23+j*.23,1.76,-1.17],[x-.23+j*.23,.6,-1.2],[x-.15+j*.16,.32,-1.42]],.018,color);
  }

  const weapons=[];
  for(let i=0;i<5;i++) {
    const x=-1.76+i*.87,z=-.71;
    disk(.35,.1,x,.345,z,'shade');disk(.30,.09,x,.44,z,'ivory');
    const trim=ring(.25,.018,x,.493,z,'metal');trim.rotation.x=Math.PI/2;
    for(let j=0;j<4;j++){const a=j*Math.PI/2;disk(.023,.02,x+Math.cos(a)*.28,.495,z+Math.sin(a)*.28,'metal');}
    const aim=group('defense-'+i,x,.50,z);weapons.push(aim);
    if(i===0) {
      disk(.19,.14,0,.08,0,'blue',aim);ball(.16,0,.24,0,'metal',aim);
      box(.29,.19,.30,0,.30,.045,'blue',aim);
      for(const dx of [-.08,.08]) {
        const barrel=disk(.047,.48,dx,.35,.29,'metal',aim);barrel.rotation.x=Math.PI/2;
        ring(.048,.012,dx,.35,.535,'ink',aim);
      }
    } else if(i===1||i===2) {
      const count=i===1?1:3;
      for(let j=0;j<count;j++) {
        const crystal=mesh(new THREE.OctahedronGeometry(i===1?.22:.145,0),'blue',aim);
        crystal.position.set((j-(count-1)/2)*.19,.35+(j===1?.1:0),0);crystal.scale.y=1.9;
        disk(.09,.09,(j-(count-1)/2)*.19,.10,0,'metal',aim);
      }
      ball(.065,0,.30,.13,'energy',aim);
    } else if(i===3) {
      disk(.065,.62,0,.34,0,'metal',aim);
      for(let j=0;j<5;j++)disk(.19,.043,0,.13+j*.115,0,'blue',aim);
      ball(.14,0,.79,0,'wood',aim);ball(.065,0,.88,0,'energy',aim);
    } else {
      disk(.16,.15,0,.09,0,'metal',aim);
      box(.30,.17,.33,0,.26,0,'red',aim);
      for(const dx of [-.09,.09]) {
        const rocket=disk(.06,.34,dx,.38,.10,'ivory',aim);rocket.rotation.x=.65;
        const tip=mesh(new THREE.ConeGeometry(.061,.15,12),'red',aim);tip.position.set(dx,.575,-.027);tip.rotation.x=.65;
      }
    }
  }

  // Small armored intruders move along the lane rather than standing beside it.
  const enemies=[], healthBars=[], wrecks=[];
  for(let i=0;i<8;i++) {
    const g=group('intruder-'+i);enemies.push(g);
    box(.21,.18,.27,0,.16,0,'red',g);box(.15,.07,.12,0,.285,-.015,'ink',g);
    box(.12,.026,.014,0,.28,.054,'warning',g);
    for(const side of [-1,1])for(const z of [-.075,.075]){const wheel=disk(.06,.035,side*.12,.08,z,'ink',g);wheel.rotation.z=Math.PI/2;}
    box(.035,.1,.025,0,.38,-.05,'metal',g);
    box(.29,.038,.025,0,.52,0,'ink',g);
    const health=box(.25,.021,.033,0,.52,.006,'energy',g);healthBars.push(health);
    const wreck=group('truck-destruction-'+i);wrecks.push(wreck);
    for(let j=0;j<7;j++) {
      const piece=box(j<3?.10:.055,.06,.08,0,.15,0,j<3?'red':'metal',wreck);
      piece.userData.direction=new THREE.Vector3(Math.cos(j*2.4)*.45,.35+(j%3)*.16,Math.sin(j*2.4)*.45);
    }
    const blast=ball(.12,0,.15,0,'warning',wreck);blast.name='blast';
    const smoke=ball(.13,0,.22,0,'shade',wreck);smoke.name='smoke';
  }

  // A distinct movable blue hero at the front of the defenses.
  const hero=group('defender-hero',-.4,.31,1.32);
  disk(.17,.025,0,.014,0,'blue',hero);box(.18,.23,.13,0,.2,0,'blue',hero);
  ball(.105,0,.405,0,'ivory',hero);box(.15,.052,.045,0,.42,.083,'screen',hero);
  for(const side of [-1,1]){box(.07,.12,.08,side*.055,.075,0,'ink',hero);ball(.047,side*.13,.25,.04,'ivory',hero);}
  const shield=ring(.23,.014,0,.27,.15,'energy',hero);

  // Voice controller with a real grille, yoke and pulsing sound-wave rings.
  const mx=-1.45,mz=2.22;
  disk(.34,.06,mx,.03,mz,'red');disk(.26,.025,mx,.074,mz,'metal');disk(.034,.43,mx,.29,mz,'metal');
  const microphone=group('voice-command',mx,.79,mz);
  const capsule=ball(.21,0,0,0,'red',microphone);capsule.scale.y=1.5;
  for(let j=0;j<7;j++)box(.27,.02,.025,0,-.15+j*.052,.182,'ink',microphone);
  line([[-.25,.08,0],[-.25,-.21,0],[0,-.31,0],[.25,-.21,0],[.25,.08,0]],.027,'metal',microphone);
  const waves=[];
  for(let i=0;i<3;i++) {
    const wave=group('voice-wave-'+i,mx+.48+i*.18,.82,mz);
    const arc=mesh(new THREE.TorusGeometry(.19+i*.07,.018,6,24,1.8),'blue',wave);arc.rotation.z=-.9;waves.push(wave);
  }

  // Effects have fixed geometry; frame updates only transform their groups.
  const effects=group('battle-effects');
  const beams=weapons.map((_,i)=>{
    const b=mesh(new THREE.CylinderGeometry(.014,.014,1,6),i===4?'warning':'energy',effects);b.castShadow=false;return b;
  });
  const shots=weapons.map((_,i)=>ball(i===4?.063:.037,0,0,0,i===4?'red':'warning',effects));
  const impacts=weapons.map(()=>{
    const g=new THREE.Group();effects.add(g);
    const halo=ring(.10,.012,0,.015,0,'warning',g);halo.rotation.x=Math.PI/2;
    for(let j=0;j<5;j++){const a=j*2*Math.PI/5;ball(.024,Math.cos(a)*.12,.07+j*.023,Math.sin(a)*.12,'warning',g);}
    return g;
  });
  const lights=group('data-hall-lighting');
  for(const x of [-2.87,2.87]){const light=new THREE.PointLight(x<0?0x77bdff:0xff8559,0,2.5,2);light.position.set(x,1.25,.1);lights.add(light);}
  effects.children.forEach(effect=>{effect.position.y=.8;});
  // Make helper centering irrelevant to all animation-local coordinates.
  const model=finish(64,moving);
  const origin=effects.position.clone();
  const starts=weapons.map((w,i)=>new THREE.Vector3(w.position.x-origin.x,w.position.y-origin.y+(i===3?.87:.38),w.position.z-origin.z));
  const homeHero=hero.position.clone(),waveHome=waves.map(w=>w.position.clone());
  // Precompute real hit/death events, then sample them by time. No frame-count
  // damage: pause, skipped frames and resetting all produce the same battle.
  const waveDuration=24, travelTime=15;
  const trucks=enemies.map((_,i)=>({spawn:i*1.65,hits:[3.5+i*.25,6.1+i*.2,8.2+i*.3]}));
  const events=trucks.flatMap((truck,truckIndex)=>truck.hits.map((age,hit)=>({
    truckIndex,hit,time:truck.spawn+age,point:path.getPointAt(age/travelTime)
  }))).sort((a,b)=>a.time-b.time);
  const available=weapons.map(()=>-Infinity);
  for(const event of events) {
    event.point.y=.70;
    const candidates=starts.map((start,index)=>({index,distance:start.distanceTo(event.point)}))
      .filter(({index})=>available[index]<=event.time-.68).sort((a,b)=>a.distance-b.distance);
    if(!candidates.length)throw new Error('Overlapping defense shots in battle timeline');
    event.weapon=candidates[0].index;available[event.weapon]=event.time+.42;
  }
  model.userData.animate=elapsed=>{
    const t=Math.max(0,elapsed),wave=t%waveDuration;
    enemies.forEach((g,i)=>{
      const truck=trucks[i],age=wave-truck.spawn,death=truck.hits[2];
      const alive=age>=0&&age<death,damage=truck.hits.filter(hit=>age>=hit).length;
      const u=THREE.MathUtils.clamp(age/travelTime,0,1),p=path.getPointAt(u),tangent=path.getTangentAt(u);
      g.visible=alive;g.userData.health=alive?3-damage:0;
      g.position.copy(p).add(origin);g.position.y+=.19+Math.sin(t*10+i)*.008;
      const recent=truck.hits.filter(hit=>hit<=age).at(-1);
      const recoil=recent===undefined?0:Math.max(0,1-(age-recent)/.25);
      g.rotation.set(0,Math.atan2(tangent.x,tangent.z),Math.sin((age-(recent??age))*35)*recoil*.18);
      g.scale.setScalar(Math.min(1,Math.max(0,age)*3));
      healthBars[i].scale.x=(3-damage)/3;healthBars[i].position.x=-.125*(damage/3);
      const wreck=wrecks[i],dt=age-death;
      wreck.visible=dt>=0&&dt<1.35;
      wreck.position.copy(path.getPointAt(death/travelTime)).add(origin);wreck.position.y+=.19;
      const progress=THREE.MathUtils.clamp(dt,0,1.35);
      wreck.children.forEach((piece,j)=>{
        if(j<7) {
          const d=piece.userData.direction;
          piece.position.set(d.x*progress,.15+d.y*progress*2-progress*progress*.65,d.z*progress);
          piece.position.y=Math.max(.015,piece.position.y);
          piece.rotation.set(progress*(j+1),progress*2,progress*j);
          piece.scale.setScalar(Math.max(0,1-Math.max(0,progress-.55)/.8));
        } else if(piece.name==='blast') {
          piece.visible=dt>=0&&dt<.35;piece.scale.setScalar(.5+Math.sin(Math.min(progress/.35,1)*Math.PI)*2);
        } else {
          piece.position.y=.22+progress*.48;piece.scale.setScalar(Math.max(0,Math.sin(progress/1.35*Math.PI))*1.8);
        }
      });
    });
    weapons.forEach((w,i)=>{
      const event=events.find(e=>e.weapon===i&&wave>=e.time-.68&&wave<e.time+.42);
      const next=event??events.find(e=>e.weapon===i&&e.time>wave);
      beams[i].visible=false;shots[i].visible=false;impacts[i].visible=false;
      w.position.y=origin.y+.50+(i===1||i===2?Math.sin(t*2+i)*.025:0);
      const start=starts[i];
      for(const effect of [beams[i],shots[i],impacts[i]]) {
        effect.position.copy(start);effect.rotation.set(0,0,0);effect.scale.setScalar(1);
      }
      if(next)w.rotation.y=Math.atan2(next.point.x-start.x,next.point.z-start.z);
      else w.rotation.y=0;
      if(!event)return;
      const dt=wave-event.time,flight=THREE.MathUtils.clamp((dt+.68)/.68,0,1);
      // Lock each projectile's destination to the hit location, so explosions
      // stay at the wreck rather than following a truck after it disappears.
      if(dt<0) {
        const age=wave-trucks[event.truckIndex].spawn;
        const target=path.getPointAt(THREE.MathUtils.clamp(age/travelTime,0,1));target.y=.70;
        w.rotation.y=Math.atan2(target.x-start.x,target.z-start.z);
        beams[i].visible=i===1||i===2||i===3;
        between(beams[i],start,target,i===3?1.3:1);
        shots[i].visible=i===0||i===4;
        shots[i].position.copy(start).lerp(event.point,flight);
        if(i===4)shots[i].position.y+=Math.sin(flight*Math.PI)*.6;
      } else {
        impacts[i].visible=true;impacts[i].position.copy(event.point);
        impacts[i].scale.setScalar((.4+dt*3)*(1-dt/.42));impacts[i].rotation.y=t+i;
      }
    });
    fans.forEach((f,i)=>{f.rotation.y=t*(i%2?-5:5);});
    status.forEach((led,i)=>{led.scale.setScalar(.65+.35*(.5+.5*Math.sin(t*2+i*1.7)));});
    hero.position.copy(homeHero);hero.position.x+=Math.sin(t*.65)*.38;hero.rotation.y=Math.sin(t*.65)*.3;
    shield.scale.setScalar(1+Math.sin(t*2)*.045);
    microphone.rotation.z=Math.sin(t*1.2)*.025;
    waves.forEach((w,i)=>{const p=(t*.65+i/3)%1;w.position.copy(waveHome[i]);w.position.x+=p*.07;w.scale.setScalar(.75+Math.sin(Math.PI*p)*.3);});
  };
  model.userData.setTheme=theme=>{
    const night=theme==='dark';model.userData.studioLightScale=night?.65:1;
    materials.energy.emissiveIntensity=night?1.8:.65;
    materials.warning.emissiveIntensity=night?1.5:.65;
    materials.screen.emissiveIntensity=night?.85:.15;
    lights.children.forEach(l=>{l.intensity=night?1.7:0;});
  };
  model.userData.animate(0);model.userData.setTheme('light');
  return model;
}
