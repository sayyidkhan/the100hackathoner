import { sculpture } from './sculpture.js';

// A miniature evening itinerary: conversation, café, music, rooftop, fallback.
export function createArtifact(THREE) {
  const {root,materials,mesh,box,disk,ball,line,finish}=sculpture(THREE);
  materials.leaf=new THREE.MeshStandardMaterial({color:0x758064,roughness:.92});
  materials.water=new THREE.MeshStandardMaterial({color:0x8aaaba,roughness:.4,metalness:.18});
  materials.lamp=new THREE.MeshStandardMaterial({color:0xffe1a6,emissive:0xffbe69,emissiveIntensity:.15});
  materials.trail=new THREE.MeshStandardMaterial({color:0xffdf94,emissive:0xffbb50,emissiveIntensity:.4});
  const preserved=[],lights=[];
  function group(name,x=0,y=0,z=0){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);root.add(g);preserved.push(g);return g;}
  function ring(r,t,x,y,z,color='wood',parent=root){const m=mesh(new THREE.TorusGeometry(r,t,8,40),color,parent);m.position.set(x,y,z);return m;}
  function lamp(x,y,z,power=.8){ball(.034,x,y,z,'lamp');const g=group('venue-light',x,y-.06,z+.08);const l=new THREE.PointLight(0xffc47d,0,1.8,2);g.add(l);lights.push({l,power});}
  function plant(x,y,z,s=1){
    const pot=mesh(new THREE.CylinderGeometry(.105*s,.075*s,.16*s,16),'wood');pot.position.set(x,y+.08*s,z);
    for(let j=0;j<5;j++){const a=j*2.4;const leaf=ball(.07*s,x+Math.cos(a)*.055*s,y+.24*s+(j%2)*.04*s,z+Math.sin(a)*.055*s,'leaf');leaf.scale.set(.55,2.5,.65);leaf.rotation.z=Math.cos(a)*.45;}
  }
  function tree(x,z,s=.7){disk(.024*s,.23*s,x,.31+.115*s,z,'wood');const crown=ball(.14*s,x,.31+.42*s,z,'leaf');crown.scale.set(.8,1.8,.85);}
  function arch(w,h,depth,x,y,z,color='ivory'){
    const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(-w/2,h-w/2);shape.absarc(0,h-w/2,w/2,Math.PI,0,true);shape.lineTo(w/2,0);shape.closePath();
    const m=mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:16}),color);m.position.set(x,y,z);return m;
  }
  function chair(x,y,z,angle=0,color='blue'){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;root.add(g);
    disk(.115,.035,0,.24,0,color,g);
    for(const dx of [-.08,.08])for(const dz of [-.07,.07])box(.02,.25,.02,dx,.12,dz,color,g);
    line([[-.1,.25,-.07],[-.11,.5,-.07],[0,.58,-.07],[.11,.5,-.07],[.1,.25,-.07]],.017,color,g);
    for(const dx of [-.04,.04])line([[dx,.27,-.07],[dx,.52,-.07]],.012,color,g);
  }
  function cup(x,y,z){disk(.047,.065,x,y+.033,z);ring(.026,.007,x+.05,y+.035,z,'ivory');disk(.065,.013,x,y,z,'paper');disk(.038,.005,x,y+.066,z,'wood');}

  // Folded city map, fine street blocks, a river and two arched footbridges.
  box(6.6,.17,5.1,0,.085,0,'paper');box(6.47,.026,4.97,0,.186,0,'ivory');
  for(let a=0;a<15;a++)for(let b=0;b<11;b++) {
    const x=-3.0+a*.425,z=-2.26+b*.43;
    const tile=box(.34,.012,.32,x,.207,z,(a+b)%4?'paper':'ivory');tile.rotation.y=((a+b)%3-1)*.12;
  }
  const riverPoints=[[1.03,0,-2.45],[1.13,0,-1.75],[1.0,0,-.85],[1.48,0,.25],[.8,0,1.10],[.38,0,2.46]];
  const river=line(riverPoints,.17,'water');river.scale.y=.08;river.position.y=.228;
  for(const [x,z,angle] of [[1.28,.25,.24],[.57,1.84,.34]]) {
    const bridge=new THREE.Group();bridge.position.set(x,.23,z);bridge.rotation.y=angle;root.add(bridge);
    const curve=[];for(let i=0;i<=12;i++){const u=i/12;curve.push([-.38+u*.76,.06+Math.sin(u*Math.PI)*.18,0]);}
    for(const dz of [-.15,.15])line(curve.map(([a,b])=>[a,b+.07,dz]),.025,'ivory',bridge);
    for(let i=0;i<12;i++){const u=(i+.5)/12;const step=box(.07,.04,.30,-.38+u*.76,.06+Math.sin(u*Math.PI)*.18,0,'ivory',bridge);step.rotation.z=Math.cos(u*Math.PI)*.58;}
  }
  // Quiet skyline behind the venues, so the stage stays the visual anchor.
  for(const [x,z,h,w] of [[-2.7,-2.0,.45,.25],[-1.55,-2.13,.70,.3],[-1.1,-2.04,1.03,.25],[-.5,-2.22,.70,.32],[.05,-2.10,.85,.32],[.66,-2.16,.65,.25],[2.65,-2.10,.52,.27],[2.98,-1.63,.36,.22]]){
    box(w,h,.23,x,.23+h/2,z,'paper');
    for(let j=0;j<Math.floor(h/.2);j++)box(.045,.065,.012,x,.34+j*.18,z+.121,'shade');
  }
  const spire=mesh(new THREE.ConeGeometry(.09,.35,4),'paper');spire.position.set(-1.1,1.44,-2.04);
  const dome=ball(.17,.05,1.1,-2.1,'paper');dome.scale.y=.8;

  // Café storefront, scalloped awning, bistro chairs and cups.
  const cx=-2.05,cz=-.9,cy=.26;
  disk(.78,.065,cx,cy,cz);
  box(1.1,.80,.15,cx,.71,cz-.43);box(.38,.62,.02,cx,.66,cz-.343,'wood');
  box(.26,.51,.024,cx,.68,cz-.324,'shade');ball(.021,cx+.09,.65,cz-.30,'wood');
  for(const dx of [-.43,.43])box(.14,.48,.027,cx+dx,.77,cz-.335,'shade');
  for(let i=0;i<7;i++){
    const awning=box(.16,.045,.48,cx-.48+i*.16,1.12,cz-.21,i%2?'paper':'ivory');awning.rotation.x=.28;
    const scallop=ball(.079,cx-.48+i*.16,1.04,cz+.022,i%2?'paper':'ivory');scallop.scale.set(1,.6,.25);
  }
  disk(.29,.035,cx,.70,cz+.22);disk(.035,.39,cx,.485,cz+.22,'wood');disk(.16,.025,cx,.30,cz+.22,'wood');
  chair(cx-.43,.30,cz+.20,-Math.PI/2);chair(cx+.43,.30,cz+.20,Math.PI/2);
  cup(cx-.13,.727,cz+.18);cup(cx+.13,.727,cz+.29);plant(cx-.67,.29,cz-.11,.8);
  const lx=cx+.76,lz=cz-.18;disk(.085,.04,lx,.27,lz,'blue');disk(.023,.92,lx,.74,lz,'blue');
  box(.12,.18,.12,lx,1.22,lz,'lamp');const cap=mesh(new THREE.ConeGeometry(.12,.13,4),'blue');cap.position.set(lx,1.37,lz);cap.rotation.y=Math.PI/4;lamp(lx,1.22,lz,.55);

  // Full theatre proscenium, layered curtains and a miniature live band setup.
  const sz=-.66;
  disk(.83,.12,0,.32,sz,'red');disk(.76,.075,0,.417,sz,'red');
  for(let i=0;i<3;i++)box(.92-i*.12,.055,.14,0,.28+i*.055,sz+.81-i*.10,'red');
  arch(1.48,1.65,.10,0,.45,sz-.44,'red');arch(1.18,1.42,.02,0,.46,sz-.325,'paper');
  for(const side of [-1,1]) {
    box(.14,1.19,.18,side*.69,1.03,sz-.37,'red');disk(.12,.055,side*.69,.47,sz-.37,'red');
    for(let j=0;j<4;j++){
      const x=side*(.37+j*.057);
      line([[x,1.75,sz-.28],[x+side*.06,1.38,sz-.245],[x+side*.10,.94,sz-.24],[x+side*.035,.51,sz-.25]],.048,'ivory');
    }
    line([[side*.3,1.83,sz-.26],[side*.43,1.67,sz-.22],[side*.59,1.71,sz-.26]],.06,'ivory');
    box(.21,.51,.21,side*.66,.71,sz+.26,'blue');
    for(const y of [.59,.79]){const speaker=disk(.065,.015,side*.66,y,sz+.376,'ink');speaker.rotation.x=Math.PI/2;ring(.065,.008,side*.66,y,sz+.39,'shade');}
    lamp(side*.47,1.67,sz-.12,.7);
  }
  // Musical note embossed on the backdrop.
  for(const [x,y] of [[-.13,1.05],[.15,1.13]]){const note=disk(.09,.025,x,y,sz-.26,'blue');note.rotation.x=Math.PI/2;box(.027,.37,.025,x+.066,y+.16,sz-.24,'blue');}
  const beam=box(.31,.055,.025,.07,1.43,sz-.24,'blue');beam.rotation.z=.23;
  const drum=mesh(new THREE.CylinderGeometry(.13,.13,.12,24),'blue');drum.rotation.x=Math.PI/2;drum.position.set(0,.59,sz+.12);ring(.13,.012,0,.59,sz+.19);
  for(const x of [-.22,.22]){disk(.013,.27,x,.59,sz+.04,'ink');disk(.13,.018,x,.75,sz+.04,'wood');}
  for(const x of [-.39,.38]){disk(.07,.018,x,.47,sz+.22,'ink');line([[x,.47,sz+.22],[x,.86,sz+.22],[x+.06,.90,sz+.22]],.011,'ink');ball(.025,x+.06,.90,sz+.22,'ink');}

  // Rooftop lounge: arches below, stairs, seating, festoon bulbs and a true crescent.
  const rx=2.22,rz=-.91;
  disk(.77,.055,rx,.26,rz);box(1.16,.76,1.03,rx,.68,rz);
  for(const dx of [-.34,0,.34])arch(.16,.41,.018,rx+dx,.37,rz+.52,'lamp');
  box(1.30,.07,1.15,rx,1.10,rz);
  for(let i=0;i<7;i++)box(.32,.09,.16,rx-.51,.30+i*.115,rz+.99-i*.13);
  for(const dx of [-.6,.6])box(.045,.28,1.05,rx+dx,1.275,rz);
  box(1.20,.28,.045,rx,1.275,rz-.53);
  for(const dx of [-.37,.37]){
    box(.31,.15,.37,rx+dx,1.225,rz-.05,'paper');box(.31,.22,.075,rx+dx,1.35,rz-.22);box(.25,.035,.28,rx+dx,1.316,rz-.02);
  }
  box(.26,.04,.30,rx,1.31,rz+.02,'wood');box(.04,.16,.04,rx,1.21,rz+.02,'wood');
  for(const dx of [-.62,.62])box(.024,.65,.024,rx+dx,1.48,rz-.45,'ink');
  line([[rx-.62,1.80,rz-.45],[rx,1.66,rz-.45],[rx+.62,1.80,rz-.45]],.01,'ink');
  for(let i=0;i<5;i++)lamp(rx-.5+i*.25,1.68+Math.abs(i-2)*.035,rz-.44,.13);
  plant(rx+.53,1.14,rz+.39,.62);plant(rx-.51,1.14,rz-.39,.6);
  const moonShape=new THREE.Shape();moonShape.moveTo(.16,.36);moonShape.bezierCurveTo(-.45,.42,-.53,-.34,.12,-.38);moonShape.bezierCurveTo(-.13,-.20,-.11,.19,.16,.36);
  const moon=mesh(new THREE.ExtrudeGeometry(moonShape,{depth:.055,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:2}),'red');moon.position.set(rx+.13,2.14,rz-.49);
  box(.018,.68,.018,rx+.04,1.53,rz-.47,'ink');lamp(rx,1.04,rz+.55,.9);

  // A smaller backup venue at the end of the dotted branch.
  const bx=2.0,bz=1.59;
  box(.72,.61,.68,bx,.535,bz);arch(.24,.43,.025,bx,.24,bz+.35,'red');
  const canopy=mesh(new THREE.CylinderGeometry(.23,.23,.36,24,1,false,0,Math.PI),'red');canopy.rotation.z=Math.PI/2;canopy.rotation.y=Math.PI/2;canopy.position.set(bx,.72,bz+.38);
  for(const dx of [-.26,.26])arch(.105,.23,.014,bx+dx,.47,bz+.35,'lamp');
  disk(.12,.025,bx+.36,.53,bz+.55,'wood');disk(.017,.29,bx+.36,.37,bz+.55,'wood');
  plant(bx-.48,.23,bz+.38,.7);plant(bx+.47,.23,bz-.03,.65);lamp(bx,.73,bz+.36,.4);

  const routes=[
    [[-2.15,.25,1.50],[-1.57,.25,1.05],[-1.20,.25,.48],[-2.05,.25,-.04]],
    [[-1.20,.25,.48],[-.7,.25,.43],[0,.25,.24]],
    [[0,.25,.24],[.68,.25,.60],[1.39,.25,.39],[2.22,.25,.07]]
  ];
  const curves=routes.map(points=>{line(points,.042,'blue');return new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));});
  for(const [x,z] of [[-2.05,-.04],[0,.24],[2.22,.07],[1.75,2.04]]){disk(.145,.028,x,.27,z);disk(.112,.02,x,.294,z,'blue');}
  const fallback=new THREE.CatmullRomCurve3([[.28,.25,.56],[.49,.25,1.3],[1.21,.25,1.63],[1.75,.25,2.04]].map(p=>new THREE.Vector3(...p)));
  for(let i=0;i<15;i++){const p=fallback.getPointAt(i/14),t=fallback.getTangentAt(i/14);const dash=box(.025,.018,.075,p.x,p.y,p.z,'blue');dash.rotation.y=Math.atan2(t.x,t.z);}
  const moving=group('itinerary-progress');
  const markers=curves.map(()=>ball(.047,0,.3,0,'trail',moving));

  // Conversation bubble, a readable clock and a perforated ticket at the map edge.
  const bubble=group('ask-buzo-conversation',-2.15,.91,1.48);
  const face=ball(.48,0,0,0,'red',bubble);face.scale.set(1,.79,.17);
  const tail=mesh(new THREE.ConeGeometry(.12,.25,3),'red',bubble);tail.position.set(.06,-.4,0);tail.rotation.z=Math.PI;
  const dots=[-.19,0,.19].map(x=>ball(.042,x,0,.088,'ivory',bubble));disk(.16,.04,-2.10,.27,1.48,'red');
  const clock=group('itinerary-clock',-.96,.55,2.09);clock.rotation.x=-.16;
  ring(.26,.024,0,0,0,'wood',clock);const dial=mesh(new THREE.CylinderGeometry(.25,.25,.035,40),'ivory',clock);dial.rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=box(.012,.043,.012,Math.sin(a)*.206,Math.cos(a)*.206,.026,'wood',clock);tick.rotation.z=-a;}
  const minute=new THREE.Group();clock.add(minute);box(.015,.17,.015,0,.073,.034,'wood',minute);
  const hour=box(.015,.105,.015,-.03,.035,.036,'wood',clock);hour.rotation.z=.65;ball(.022,0,0,.042,'wood',clock);
  const ticket=new THREE.Group();ticket.position.set(-.15,.26,2.12);ticket.rotation.y=-.22;root.add(ticket);
  box(.72,.028,.34,0,0,0,'paper',ticket);
  for(const z of [-.135,.135])box(.59,.005,.009,0,.019,z,'wood',ticket);
  for(const x of [-.29,.29])for(let i=0;i<5;i++)disk(.012,.008,x,.020,-.1+i*.05,'shade',ticket);
  for(const [x,z,s] of [[-3,-1.3,.85],[-2.9,.5,.6],[-2.85,1.68,.7],[-1.23,1.35,.5],[-.50,1.12,.55],[.54,-1.7,.75],[1.22,-2.13,.7],[3.0,-.12,.6],[2.88,1.5,.7],[1.12,2.22,.55],[-1.1,-1.75,.75]])tree(x,z,s);

  const model=finish(62,preserved),bubbleY=bubble.position.y;
  model.userData.animate=elapsed=>{
    const t=Math.max(0,elapsed);
    bubble.position.y=bubbleY+Math.sin(t*1.4)*.025;
    dots.forEach((d,i)=>{d.scale.setScalar(1+.15*Math.sin(t*3-i*.8));});
    minute.rotation.z=-t*.18;
    markers.forEach((m,i)=>{const p=(t*.16+i/3)%1;m.position.copy(curves[i].getPointAt(p));m.position.y+=.036;m.scale.setScalar(.35+.65*Math.sin(Math.PI*p));});
  };
  model.userData.setTheme=theme=>{
    const night=theme==='dark';model.userData.studioLightScale=night?.56:1;
    materials.lamp.emissiveIntensity=night?2.2:.1;materials.trail.emissiveIntensity=night?1.8:.4;
    lights.forEach(({l,power})=>{l.intensity=night?power:0;});
    materials.water.emissive.setHex(0x284d65);materials.water.emissiveIntensity=night?.18:0;
  };
  model.userData.animate(0);model.userData.setTheme('light');return model;
}
