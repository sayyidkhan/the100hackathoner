import { sculpture } from './sculpture.js';
import { createRevenue } from './tycoon-revenue.js';

// The game's five buildable assets, arranged as an operating miniature campus.
export function createArtifact(THREE) {
  const {root,materials,mesh,box,disk,ball,line,finish}=sculpture(THREE);
  const extra={steel:[0x72808b,.55,.4],glass:[0x203d67,.55,.28],cyan:[0x56bddd,.15,.5],green:[0x4aa686,.15,.55],violet:[0x7964ad,.25,.45]};
  for(const [name,[color,metalness,roughness]] of Object.entries(extra))materials[name]=new THREE.MeshStandardMaterial({color,metalness,roughness});
  const led=new THREE.MeshStandardMaterial({color:0x7bdaff,emissive:0x49b9ef,emissiveIntensity:.65,roughness:.45});materials.led=led;
  const chargeMat=new THREE.MeshStandardMaterial({color:0x83dfa5,emissive:0x34a575,emissiveIntensity:.45});materials.charge=chargeMat;
  const coreMat=new THREE.MeshStandardMaterial({color:0xc1afff,emissive:0x8162dd,emissiveIntensity:.65});materials.core=coreMat;
  const preserved=[],fans=[],leds=[],charges=[],panels=[];
  function group(name,x=0,y=0,z=0){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);root.add(g);preserved.push(g);return g;}
  function ring(r,t,x,y,z,color='steel',parent=root){const m=mesh(new THREE.TorusGeometry(r,t,8,40),color,parent);m.position.set(x,y,z);return m;}
  function fan(x,y,z,r=.19){
    disk(r+.025,.02,x,y,z,'ink');
    const rotor=group('cooling-rotor',x,y+.015,z);fans.push(rotor);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;const blade=box(r*.7,.015,r*.26,Math.cos(a)*r*.43,0,Math.sin(a)*r*.43,'steel',rotor);blade.rotation.y=-a+.3;}
    ball(.034,0,.018,0,'steel',rotor);
    const guard=ring(r,.012,x,y+.055,z);guard.rotation.x=Math.PI/2;
    for(const v of [-.07,0,.07])box(r*1.8,.008,.008,x,y+.067,z+v,'steel');
  }

  // Actual 8×8 building grid, with shallow channels between raised floor tiles.
  box(6.5,.14,6.5,0,.07,0,'shade');box(6.46,.045,6.46,0,.162,0,'wood');
  for(let x=0;x<8;x++)for(let z=0;z<8;z++)box(.782,.075,.782,(x-3.5)*.8,.224,(z-3.5)*.8,'ivory');
  for(const x of [-3.10,3.10])for(const z of [-3.10,3.10])disk(.05,.014,x,.27,z,'steel');
  // Perimeter rails and a cutaway cable bridge frame the server hall without hiding it.
  for(const x of [-1.52,1.52]){
    box(.045,1.95,.045,x,1.235,-2.54,'steel');
    box(.12,.09,3.45,x,2.18,-.86,'paper');
    for(let z=-2.45;z<.9;z+=.24)box(.18,.02,.035,x,2.24,z,'steel');
  }
  box(3.15,.08,.17,0,2.18,-2.53,'paper');
  for(let i=0;i<3;i++)line([[-1.48+i*.055,2.255,.62],[-1.48+i*.055,2.255,-2.5],[1.43+i*.05,2.255,-2.5],[1.43+i*.05,2.255,.62]],.012,i===0?'blue':'steel');

  // Six racks in two rows, with seven removable blades, vents and patch ports.
  const racks=[];
  for(const z of [-1.72,-.32])for(const x of [-.94,0,.94]) {
    racks.push([x,z]);
    box(.74,1.51,.69,x,1.04,z,'ink');box(.78,.055,.73,x,1.82,z,'blue');
    for(const dx of [-.36,.36])box(.045,1.52,.045,x+dx,1.045,z+.365,'steel');
    for(let j=0;j<7;j++) {
      const y=.41+j*.19;
      box(.64,.15,.06,x,y,z+.36,'shade');
      box(.51,.108,.018,x-.025,y,z+.399,'ink');
      for(let k=0;k<6;k++)box(.031,.05,.009,x-.225+k*.055,y,z+.414,'steel');
      box(.035,.07,.018,x+.24,y,z+.414,'steel');
      const indicator=group('rack-activity',x+.29,y,z+.412);ball(.018,0,0,0,'led',indicator);leds.push(indicator);
      for(const dx of [-.29,.29])box(.018,.11,.022,x+dx,y,z+.412,'steel');
    }
    fan(x,1.858,z,.21);
    for(let j=0;j<3;j++)line([[x-.20+j*.2,1.5,z-.36],[x-.20+j*.2,.4,z-.39],[x-.2+j*.2,.30,z-.55]],.012,j===0?'blue':'steel');
  }
  // A cold aisle is visible between the server rows.
  for(let i=0;i<13;i++)box(.17,.008,.43,-1.25+i*.21,.269,-1.0,'steel');

  // Tilted solar arrays with individual cells and a rigid metal support frame.
  for(const z of [-1.7,-.1,1.5]) {
    for(const x of [-2.75,-2.12])box(.033,.42,.033,x,.48,z,'steel');
    const panel=group('solar-array',-2.43,.74,z);panel.rotation.x=.38;panels.push(panel);
    box(1.15,.06,1.16,0,0,0,'steel',panel);
    for(let a=0;a<4;a++)for(let b=0;b<5;b++) {
      box(.25,.015,.20,-.405+a*.27,.041,-.43+b*.215,'glass',panel);
      box(.003,.006,.19,-.405+a*.27,.052,-.43+b*.215,'shade',panel);
    }
    box(.10,.09,.16,0,-.075,.42,'ink',panel);
  }

  // Industrial cooling plant: twin rooftop fans, louvres and connected coolant pipes.
  for(const z of [-1.5,.25]) {
    box(1.05,.73,1.30,2.37,.64,z,'paper');box(1.09,.045,1.34,2.37,1.03,z,'steel');
    for(const dz of [-.34,.34])fan(2.37,1.07,z+dz,.225);
    for(let j=0;j<9;j++)box(.82,.021,.021,2.37,.36+j*.066,z+.665,'steel');
    box(.20,.21,.025,2.7,.72,z+.69,'ink');box(.13,.065,.028,2.7,.76,z+.71,'cyan');
    line([[1.87,.66,z],[1.7,.66,z],[1.7,.3,z],[1.18,.3,z]],.038,'cyan');
    line([[1.87,.49,z+.22],[1.59,.49,z+.22],[1.59,.29,z+.22],[1.18,.29,z+.22]],.030,'blue');
    for(const dz of [-.43,.43])box(.11,.11,.14,2.37,.32,z+dz,'steel');
  }

  // Battery cabinets with visible cell packs, terminals and charge level bars.
  for(const x of [-1.0,-.08]) {
    const z=1.85;
    box(.72,.91,.67,x,.735,z,'paper');box(.61,.76,.025,x,.735,z+.347,'ink');
    for(let j=0;j<4;j++){
      disk(.052,.52,x-.21+j*.14,.73,z+.29,'green');
      const bar=group('battery-charge',x-.21+j*.14,.49,z+.365);box(.085,.038,.02,0,0,0,'charge',bar);charges.push(bar);
    }
    disk(.047,.05,x-.20,1.23,z,'red');disk(.047,.05,x+.20,1.23,z,'ink');
    box(.31,.10,.025,x,1.05,z+.365,'steel');
    line([[x+.20,1.24,z],[x+.37,1.26,z-.18],[x+.4,.31,z-.43]],.02,'blue');
  }

  // The source's AI optimizer is an orbiting core on a low octagonal device.
  const ox=1.11,oz=1.78;
  const pedestal=mesh(new THREE.CylinderGeometry(.40,.45,.20,8),'ink');pedestal.position.set(ox,.38,oz);
  const circuit=ring(.33,.025,ox,.51,oz,'violet');circuit.rotation.x=Math.PI/2;
  const optimizer=group('ai-optimizer',ox,.85,oz);
  const core=mesh(new THREE.OctahedronGeometry(.17,0),'core',optimizer);
  const orbits=[];
  for(let i=0;i<3;i++){const orbit=ring(.31+i*.035,.012,0,0,0,'violet',optimizer);orbit.rotation.set(i*.8,.4+i,.2);orbits.push(orbit);}
  for(let j=0;j<6;j++){const a=j*Math.PI/3;box(.055,.03,.1,ox+Math.cos(a)*.38,.51,oz+Math.sin(a)*.38,'steel');}

  // Mobile-edition companion: an angled handheld view of the same building grid.
  const tablet=group('mobile-control',2.55,.32,2.10);tablet.rotation.x=-.38;
  box(.63,.96,.065,0,.48,0,'ink',tablet);box(.55,.82,.014,0,.48,.04,'glass',tablet);
  for(let x=0;x<5;x++)for(let y=0;y<5;y++)box(.081,.081,.012,-.20+x*.1,.34+y*.1,.055,(x+y)%4===0?'cyan':'steel',tablet);
  box(.40,.035,.013,0,.21,.055,'green',tablet);ball(.017,0,.91,.04,'steel',tablet);
  box(.33,.07,.3,2.55,.295,2.10,'shade');

  // Power buses follow the floor; small packets connect generation to storage and racks.
  const routePoints=[
    [[-2.4,.285,1.6],[-1.65,.285,2.55],[-.5,.285,2.55],[-.5,.285,1.8]],
    [[-.5,.29,1.5],[-.5,.29,.9],[.94,.29,.9],[.94,.29,.25]],
    [[1.11,.29,1.35],[1.50,.29,.9],[1.65,.29,-.9],[1.7,.29,-1.5]]
  ];
  const packets=group('power-flow');
  const routes=routePoints.map(points=>{
    line(points,.022,'blue');return new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  });
  const dots=routes.map(()=>ball(.04,0,.3,0,'led',packets));
  // Cool air rises from the cold aisle in restrained blue motes.
  const airflow=group('cold-aisle-airflow');
  const air=Array.from({length:12},()=>ball(.019,0,.4,0,'cyan',airflow));
  const lighting=group('night-practicals');
  for(const [x,y,z] of [[-1.25,1.95,-.9],[1.25,1.95,-.9],[ox,1.1,oz]]){
    const light=new THREE.PointLight(0x7abfff,0,2.6,2);light.position.set(x,y,z);lighting.add(light);
  }
  const model=finish(63,preserved);
  const revenue=createRevenue(THREE,racks);
  revenue.position.copy(packets.position);model.add(revenue);
  model.userData.framingBounds=new THREE.Box3(new THREE.Vector3(-3.25,0,-3.25),new THREE.Vector3(3.25,3.4,3.4));
  let night=false;
  model.userData.animate=elapsed=>{
    const t=Math.max(0,elapsed);
    revenue.userData.animate(t);
    fans.forEach((f,i)=>{f.rotation.y=t*(i<6?3.4:5.2);});
    leds.forEach((l,i)=>{l.scale.setScalar(.65+.35*(.5+.5*Math.sin(t*3+i*1.3)));});
    charges.forEach((c,i)=>{c.scale.x=.30+.70*(.5+.5*Math.sin(t*1.7-i*.7));});
    panels.forEach((p,i)=>{p.rotation.x=.38+Math.sin(t*.24+i*.1)*.025;});
    core.rotation.set(t*.25,t*.7,0);
    orbits.forEach((o,i)=>{o.rotation.set(i*.8+t*.19,.4+i+t*.35,.2+t*.12);});
    coreMat.emissiveIntensity=(night?1.2:.45)+Math.sin(t*1.8)*.18;
    dots.forEach((dot,i)=>{const u=(t*.13+i/3)%1;dot.position.copy(routes[i].getPointAt(u));dot.position.y+=.028;dot.scale.setScalar(.4+.6*Math.sin(Math.PI*u));});
    air.forEach((a,i)=>{const u=(t*.3+i/12)%1;a.position.set(-1.2+(i%6)*.48,.3+u*1.65,-1+Math.sin(u*Math.PI)*.065);a.scale.setScalar(Math.sin(u*Math.PI));});
  };
  model.userData.setTheme=theme=>{
    revenue.userData.setTheme(theme);
    night=theme==='dark';model.userData.studioLightScale=night?.67:1;
    led.emissiveIntensity=night?1.8:.65;chargeMat.emissiveIntensity=night?1.2:.45;
    lighting.children.forEach(light=>{light.intensity=night?1.2:0;});
  };
  model.userData.animate(0);model.userData.setTheme('light');
  return model;
}
