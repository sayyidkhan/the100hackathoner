import { sculpture } from './sculpture.js';

// Conversation, compass and routes are metaphors for the live-events concierge.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  materials.wood.metalness = .45;
  materials.wood.roughness = .4;
  materials.foliage = new THREE.MeshStandardMaterial({ color: 0x637566, roughness: .9 });
  materials.lamp = new THREE.MeshStandardMaterial({ color: 0xffdfa3, emissive: 0xffbf66, emissiveIntensity: 0 });
  materials.pulse = new THREE.MeshStandardMaterial({ color: 0xffecbb, emissive: 0xffce75, emissiveIntensity: .4 });
  const preserved = [], lamps = [];
  function group(name,x,y,z) {
    const g=new THREE.Group();g.name=name;g.position.set(x,y,z);root.add(g);preserved.push(g);return g;
  }
  function ring(r,t,x,y,z,color='wood',parent=root) {
    const m=mesh(new THREE.TorusGeometry(r,t,8,48),color,parent);m.position.set(x,y,z);return m;
  }
  function character(x,y,z,s=1,parent=root) {
    const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);parent.add(g);
    const body=mesh(new THREE.CylinderGeometry(.12,.19,.46,16),'ivory',g);body.position.y=.29;
    ball(.17,0,.69,0,'ivory',g);
    for(const side of [-1,1]) {
      const arm=ball(.07,side*.19,.41,0,'ivory',g);arm.scale.y=1.8;
      const foot=ball(.07,side*.08,.04,.055,'paper',g);foot.scale.z=1.4;
    }
    return g;
  }
  function lamp(x,y,z,power=1) {
    ball(.042,x,y,z,'lamp');
    const g=group('warm-venue-light',x,y-.04,z+.12);
    const light=new THREE.PointLight(0xffbf79,0,2.1,2);g.add(light);lamps.push({light,power});
  }
  function pin(x,y,z) {
    const shape=new THREE.Shape();shape.moveTo(0,0);
    shape.bezierCurveTo(-.1,.14,-.22,.29,-.16,.42);
    shape.bezierCurveTo(-.08,.58,.1,.58,.17,.42);
    shape.bezierCurveTo(.23,.29,.1,.14,0,0);
    const hole=new THREE.Path();hole.absarc(0,.37,.062,0,Math.PI*2,true);shape.holes.push(hole);
    const p=mesh(new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:2}),'red');p.position.set(x,y,z);
  }

  const base=disk(3.45,.18,0,.09,0,'wood');base.scale.z=.83;
  const top=disk(3.45,.055,0,.207,0,'paper');top.scale.z=.83;
  // Four connected accordion folds, with subtle street blocks following each panel.
  const mapHeight=x=>.29+(.28*(1-Math.abs(((x+2.8)%2.8)-1.4)/1.4));
  for(let i=0;i<4;i++) {
    const x=-2.1+i*1.4, rise=i%2===0?.28:-.28;
    const panel=box(Math.hypot(1.4,rise),.045,3.75,x,.43,0,i%2?'paper':'ivory');panel.rotation.z=Math.atan2(rise,1.4);
    for(let a=0;a<4;a++)for(let b=0;b<7;b++) {
      const px=x-.52+a*.34,pz=-1.58+b*.50;
      const tile=box(.26,.008,.38,px,mapHeight(px)+.027,pz,'paper');tile.rotation.z=panel.rotation.z;
    }
  }

  // Concierge kiosk at the start of the visitor's journey.
  const kx=-1.8,kz=1.08,ky=.52;
  disk(.52,.52,kx,ky+.26,kz,'red');disk(.57,.055,kx,ky+.54,kz,'wood');
  disk(.62,.09,kx,ky+1.23,kz,'red');
  for(const side of [-1,1])disk(.025,.7,kx+side*.45,ky+.89,kz+.08,'wood');
  character(kx,ky+.23,kz,1);
  box(.12,.055,.04,kx,ky+.80,kz+.17,'red');
  const hand=group('concierge-wave',kx+.28,ky+.87,kz+.12);
  const palm=ball(.077,0,0,0,'ivory',hand);palm.scale.y=1.35;
  const visitor=character(kx+.5,mapHeight(kx+.5)+.04,kz+.77,.9);visitor.rotation.y=-.7;
  const bubble=group('concierge-conversation',kx-.18,ky+1.77,kz);
  const bubbleBody=ball(.35,0,0,0,'red',bubble);bubbleBody.scale.set(1.45,.90,.26);
  const tail=mesh(new THREE.ConeGeometry(.1,.22,3),'red',bubble);tail.position.set(.18,-.32,0);tail.rotation.z=3.4;
  const dots=[-.22,0,.22].map(x=>ball(.047,x,0,.098,'ivory',bubble));
  lamp(kx,ky+1.16,kz,1.4);

  // Concert stage, a microphone, speakers and a small drum kit.
  const sx=-.95,sz=-1.25,sy=.58;
  box(1.52,.10,1.04,sx,sy,sz,'wood');
  box(1.16,.09,.22,sx,sy-.025,sz+.61,'paper');
  box(1.43,.92,.1,sx,sy+.5,sz-.44,'red');
  for(const side of [-1,1]) {
    box(.08,1.01,.15,sx+side*.73,sy+.55,sz-.43);
    for(let i=0;i<3;i++){const fold=ball(.075,sx+side*(.50+i*.06),sy+.53,sz-.35,'red');fold.scale.y=6;}
    box(.22,.42,.2,sx+side*.61,sy+.27,sz+.33,'ink');
    for(const y of [sy+.19,sy+.36])ring(.057,.011,sx+side*.61,y,sz+.437,'shade');
    lamp(sx+side*.44,sy+1.02,sz-.22,.75);
  }
  const arch=mesh(new THREE.TorusGeometry(.73,.055,8,40,Math.PI),'ivory');arch.scale.y=.35;arch.position.set(sx,sy+1.04,sz-.43);
  pin(sx,sy+1.31,sz-.43);
  disk(.1,.02,sx-.22,sy+.07,sz+.13,'wood');line([[sx-.22,sy+.08,sz+.13],[sx-.22,sy+.61,sz+.13],[sx-.13,sy+.66,sz+.13]],.013,'ink');
  const drum=mesh(new THREE.CylinderGeometry(.17,.17,.18,24),'wood');drum.rotation.x=Math.PI/2;drum.position.set(sx+.23,sy+.23,sz+.13);
  for(const dx of [.05,.4]){disk(.11,.025,sx+dx,sy+.51,sz-.03,'wood');disk(.012,.4,sx+dx,sy+.28,sz-.03,'ink');}

  // Gallery walls and abstract works; open pavilion for meeting people.
  const ex=1.58,ez=-1.18,ey=.58;
  box(1.38,.07,.88,ex,ey,ez);
  box(1.38,.91,.07,ex,ey+.49,ez-.4);box(.07,.91,.82,ex+.66,ey+.49,ez);
  for(const [dx,color] of [[-.38,'red'],[.18,'blue']]) {
    box(.43,.55,.035,ex+dx,ey+.56,ez-.35,'wood');box(.36,.48,.025,ex+dx,ey+.56,ez-.32);
    const dot=ball(.12,ex+dx,ey+.58,ez-.29,color);dot.scale.z=.12;
    lamp(ex+dx,ey+1,ez-.20,.65);
  }
  character(ex,ey+.035,ez+.08,.60);pin(ex+.6,ey+1.02,ez-.38);
  const px=1.72,pz=1.1,py=.55;
  disk(.66,.075,px,py,pz);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;disk(.027,.82,px+Math.cos(a)*.55,py+.45,pz+Math.sin(a)*.55);}
  const roof=mesh(new THREE.ConeGeometry(.75,.30,32),'ivory');roof.position.set(px,py+1.02,pz);
  character(px-.24,py+.04,pz,.64);character(px+.23,py+.04,pz,.64);
  disk(.19,.03,px,py+.45,pz);disk(.025,.38,px,py+.24,pz,'wood');
  pin(px,py+1.2,pz);lamp(px,py+.84,pz,1.2);

  // Compass rose anchors the branches of the event map.
  disk(.58,.06,0,.62,0,'wood');disk(.53,.022,0,.663,0);
  const rim=ring(.55,.022,0,.69,0);rim.rotation.x=Math.PI/2;
  for(let i=0;i<8;i++) {
    const a=i*Math.PI/4;
    const ray=mesh(new THREE.ConeGeometry(.072,i%2?.32:.43,3),'wood');ray.rotation.x=Math.PI/2;ray.rotation.z=-a;ray.position.set(Math.sin(a)*.19,.697,Math.cos(a)*.19);
  }
  const needle=group('event-compass',0,.74,0);
  for(const side of [-1,1]) {
    const arrow=mesh(new THREE.ConeGeometry(.10,.46,3),side===1?'blue':'red',needle);
    arrow.rotation.x=side*Math.PI/2;arrow.position.z=side*.19;
  }
  ball(.064,0,.045,0,'wood',needle);

  const routes=[
    [[-1.2,1.68],[-.7,1.22],[0,.74],[-.1,-.42],[-.7,-.58],[-.95,-.59]],
    [[-1.2,1.68],[-.7,1.22],[0,.74],[.6,.23],[1.12,-.40],[1.58,-.57]],
    [[-1.2,1.68],[-.7,1.22],[0,.74],[.62,1.02],[1.08,1.52]]
  ];
  const travel=group('event-route-markers',0,0,0);
  const curves=routes.map(points=>new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,mapHeight(x)+.08,z))));
  const markers=curves.map(curve=>{
    mesh(new THREE.TubeGeometry(curve,64,.023,8,false),'blue');
    const end=curve.getPoint(1);disk(.11,.03,end.x,end.y,end.z,'blue');
    return ball(.05,0,0,0,'pulse',travel);
  });
  for(const [x,z,h] of [[-2.65,-.6,.48],[-2.52,-1.25,.65],[-2.75,.17,.38],[2.47,-.8,.54],[2.60,.15,.40],[.55,-2,.58],[.1,2,.34]]) {
    box(.24,h,.23,x,.25+h/2,z,'paper');
    box(.035,.1,.015,x-.055,.25+h*.65,z+.125,'lamp');
    const tree=ball(.115,x-.22,.52,z+.17,'foliage');tree.scale.y=1.65;disk(.018,.22,x-.22,.34,z+.17,'wood');
  }
  const model=finish(66,preserved);
  const bubbleY=bubble.position.y;
  model.userData.animate=elapsed=>{
    const t=Math.max(0,elapsed);
    needle.rotation.y=.6+Math.sin(t*.45)*2.3;
    hand.rotation.z=-.3+Math.sin(t*2.4)*.26;
    bubble.position.y=bubbleY+Math.sin(t*1.3)*.025;
    dots.forEach((dot,i)=>dot.scale.setScalar(1+.17*Math.sin(t*3-i*.8)));
    curves.forEach((curve,i)=>{
      const phase=(t/6+i/3)%1;
      markers[i].position.copy(curve.getPointAt(phase));markers[i].position.y+=.035;
      markers[i].scale.setScalar(.5+.5*Math.sin(Math.PI*phase));
    });
  };
  model.userData.setTheme=theme=>{
    const night=theme==='dark';model.userData.studioLightScale=night?.58:1;
    materials.lamp.emissiveIntensity=night?2.5:0;
    materials.blue.emissive.setHex(0x1747c1);materials.blue.emissiveIntensity=night?.48:0;
    materials.pulse.emissiveIntensity=night?2:.4;
    lamps.forEach(({light,power})=>{light.intensity=night?power*1.2:0;});
  };
  model.userData.animate(0);model.userData.setTheme('light');
  return model;
}
