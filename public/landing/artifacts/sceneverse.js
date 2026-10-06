import { sculpture } from './sculpture.js';

// A VR viewer speaks with Neo, who offers a red pill and a blue pill.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  const platform=disk(2.9,.16,0,.08,0,'paper');platform.scale.z=.69;
  const top=disk(2.86,.045,0,.182,0);top.scale.z=.69;
  for(const x of [-1.05,2.43])box(.17,2.48,.17,x,1.53,-.72,'red');
  for(const y of [.37,2.72])box(3.65,.22,.17,.69,y,-.72,'red');
  for(let i=0;i<10;i++)for(const y of [.37,2.72])box(.13,.13,.018,-.83+i*.33,y,-.625);
  for(const x of [2.03,2.17])box(.047,.16,.03,x,2.72,-.60,'blue');
  materials.coat=new THREE.MeshStandardMaterial({color:0x1d222a,roughness:.58,emissive:0x25344c,emissiveIntensity:0});
  materials.screen=new THREE.MeshStandardMaterial({color:0x10231c,roughness:.9});
  materials.matrix=new THREE.MeshStandardMaterial({color:0x467c55,roughness:.8,emissive:0x358756,emissiveIntensity:.15});
  box(3.29,2.12,.045,.69,1.53,-.77,'screen');
  // Abstract vertical light marks evoke the movie world without competing with the people.
  for(let col=0;col<15;col++)for(let row=0;row<10;row++){
    if((col*3+row*7)%5===0)continue;
    box(.022,.055+((col+row)%3)*.02,.012,-.78+col*.21,.58+row*.20,-.738,'matrix');
  }
  const cast=[];
  function figure(name,x,z,yaw,role){
    const g=new THREE.Group();g.name=name;g.position.set(x,.22,z);g.rotation.y=yaw;root.add(g);cast.push(g);
    for(const side of [-1,1]){
      const leg=mesh(new THREE.CylinderGeometry(.10,.115,.55,16),role==='viewer'?'blue':'coat',g);leg.position.set(side*.14,.34,0);
      const shoe=ball(.14,side*.14,.09,.07,role==='viewer'?'red':'coat',g);shoe.scale.set(.85,.55,1.45);
    }
    const body=mesh(new THREE.CylinderGeometry(.24,.29,.64,24),role==='neo'?'coat':'ivory',g);body.position.y=.90;
    const head=new THREE.Group();head.name='head';head.position.y=1.50;g.add(head);
    ball(.245,0,0,0,'paper',head);
    ball(.047,0,-.025,.24,'paper',head);

    const smile=mesh(new THREE.TorusGeometry(.06,.009,6,20,Math.PI),'ink',head);smile.rotation.z=Math.PI;smile.position.set(0,-.08,.222);
    const arm=new THREE.Group();arm.name='speaking-hand';arm.position.set(-.28,1.08,0);arm.rotation.z=-.5;g.add(arm);
    const sleeve=ball(.10,0,-.16,0,role==='neo'?'coat':'ivory',arm);sleeve.scale.y=1.9;
    ball(.09,0,-.31,.09,'paper',arm);
    if(role==='viewer'){const other=ball(.105,.29,.85,0,'ivory',g);other.scale.y=2;}
    if(role==='viewer'){
      // Large wraparound visor, two lenses and both straps make VR unmistakable.
      box(.55,.27,.22,0,.035,.23,'blue',head);
      const strap=mesh(new THREE.TorusGeometry(.245,.036,8,40),'blue',head);strap.rotation.x=Math.PI/2;strap.position.y=.055;
      const overhead=mesh(new THREE.TorusGeometry(.249,.027,8,40,Math.PI),'blue',head);overhead.rotation.y=Math.PI/2;
      for(const side of [-1,1]){
        const lens=ball(.09,side*.135,.04,.355,'ink',head);lens.scale.z=.20;
        const rim=mesh(new THREE.TorusGeometry(.09,.015,8,24),'wood',head);rim.position.set(side*.135,.04,.365);
      }
      box(.23,.15,.025,0,.96,.245,'paper',g);
    } else {
      g.remove(arm);
      arm.traverse(o=>{if(o.geometry)o.geometry.dispose();});
      const hair=mesh(new THREE.SphereGeometry(.248,24,12,0,Math.PI*2,0,Math.PI*.46),'ink',head);hair.position.y=.035;
      for(const side of [-1,1]){
        const lens=ball(.078,side*.087,.035,.227,'ink',head);lens.scale.set(1,.48,.22);
        line([[side*.08,.035,.24],[side*.20,.035,.16],[side*.24,.045,0]],.011,'ink',head);
      }
      box(.07,.014,.014,0,.035,.244,'ink',head);
      const coat=mesh(new THREE.CylinderGeometry(.245,.38,1.08,28),'coat',g);coat.position.y=.77;
      for(const side of [-1,1]){
        const lapel=box(.08,.35,.028,side*.105,1.07,.25,'ink',g);lapel.rotation.z=side*.25;
        // Each pill is parented to its open palm so it follows every gesture.
        const offering=new THREE.Group();offering.name=side<0?'red-pill-hand':'blue-pill-hand';offering.position.set(side*.43,1.02,.35);g.add(offering);
        line([[-side*.17,.13,-.35],[-side*.10,-.04,-.17],[0,0,0]],.085,'coat',offering);
        const palm=ball(.115,0,.04,.08,'paper',offering);palm.scale.set(1,.40,1.12);
        for(let i=0;i<4;i++){const finger=ball(.022,-.069+i*.046,.048,.185,'paper',offering);finger.scale.z=1.5;}
        ball(.04,side*.10,.055,.07,'paper',offering);
        const pill=mesh(new THREE.CapsuleGeometry(.047,.085,6,16),side<0?'red':'blue',offering);pill.name=side<0?'red-pill':'blue-pill';pill.rotation.z=Math.PI/2;pill.position.set(0,.115,.095);
      }
    }
    return g;
  }
  figure('vr-viewer',-1.55,.75,.80,'viewer').scale.setScalar(1.08);
  figure('neo',.65,.20,-.35,'neo').scale.setScalar(1.20);
  const bubbles=[];
  for(const [i,x,y,z] of [[0,-1.53,2.38,.75],[1,.55,2.46,.20]]){
    const g=new THREE.Group();g.name=`conversation-${i}`;g.position.set(x,y,z);root.add(g);bubbles.push(g);
    const oval=ball(.24,0,0,0,i===0?'blue':'ivory',g);oval.scale.set(1.23,.9,.23);
    const tail=mesh(new THREE.ConeGeometry(.065,.15,3),i===0?'blue':'ivory',g);tail.position.set(.11,-.20,0);tail.rotation.z=2.65;
    for(const dx of [-.13,0,.13])ball(.036,dx,0,.065,i===0?'ivory':'red',g);
  }
  const voiceCurves=[
    new THREE.CatmullRomCurve3([new THREE.Vector3(-1.12,1.65,.93),new THREE.Vector3(-.45,1.76,.89),new THREE.Vector3(.32,1.72,.48)]),
    new THREE.CatmullRomCurve3([new THREE.Vector3(-1.14,1.48,.92),new THREE.Vector3(-.43,1.36,.95),new THREE.Vector3(.30,1.56,.54)])
  ];
  const voiceMaterial=new THREE.MeshStandardMaterial({color:0x426aba,roughness:.5,emissive:0x2757aa,emissiveIntensity:0});
  const voiceGroup=new THREE.Group();voiceGroup.name='voice-trails';root.add(voiceGroup);
  for(const curve of voiceCurves)voiceGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve,40,.014,8,false),voiceMaterial));
  const pulses=voiceCurves.map(()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.035,12,8),voiceMaterial);voiceGroup.add(m);return m;});
  const model=finish(67,[...cast,...bubbles,voiceGroup]);
  const bubbleBases=bubbles.map(g=>g.position.y);
  model.userData.animate=elapsed=>{
    const t=Math.max(0,elapsed)%8;
    const active=Math.floor(t/4),beat=Math.sin(t*Math.PI*2);
    cast.forEach((g,i)=>{
      const speaking=i===active;
      g.getObjectByName('head').rotation.x=speaking?beat*.035:0;
      const gesture=g.getObjectByName('speaking-hand');
      if(gesture)gesture.rotation.x=speaking?-.75+beat*.12:-.20;
      if(g.name==='neo')for(const name of ['red-pill-hand','blue-pill-hand']){g.getObjectByName(name).position.y=1.02+(speaking?Math.sin(t*Math.PI)*.025:0);}
      bubbles[i].scale.setScalar(speaking?1.08:1);
      bubbles[i].position.y=bubbleBases[i]+(speaking?Math.sin(t*Math.PI)*.035:0);
    });
    pulses.forEach((pulse,i)=>{const u=(t%2)/2;voiceCurves[i].getPoint(active===0?u:1-u,pulse.position);});
  };
  const warm=new THREE.PointLight(0xffb975,0,4,2);warm.position.set(.70,2.15,-.35);model.add(warm);
  model.userData.setTheme=theme=>{
    const night=theme==='dark';model.userData.studioLightScale=night?.65:1;
    voiceMaterial.emissiveIntensity=night?1.2:0;warm.intensity=night?2.8:0;
    materials.coat.color.setHex(night?0x354151:0x1d222a);materials.coat.emissiveIntensity=night?.28:0;
    materials.matrix.emissiveIntensity=night?1.3:.15;
  };
  model.userData.animate(0);model.userData.setTheme('light');
  return model;
}
