import { sculpture } from './sculpture.js';

// The concierge connects people to events; the venues are visual metaphors.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  materials.wood.metalness = .45;
  materials.wood.roughness = .4;
  disk(3.4,.22,0,.11,0,'paper');
  disk(3.32,.045,0,.242,0);
  const floor = .265;
  function group(name,x,y,z) {
    const g = new THREE.Group(); g.name=name; g.position.set(x,y,z); root.add(g); return g;
  }
  function ring(radius,tube,x,y,z,color,parent=root) {
    const m=mesh(new THREE.TorusGeometry(radius,tube,8,64),color,parent);m.position.set(x,y,z);return m;
  }
  function character(x,y,z,scale=1,parent=root) {
    const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
    const body=mesh(new THREE.CylinderGeometry(.12,.19,.48,20),'ivory',g);body.position.y=.29;
    ball(.17,0,.7,0,'ivory',g);
    for(const side of [-1,1]){
      const arm=ball(.075,side*.18,.39,0,'ivory',g);arm.scale.y=2;
      const foot=ball(.08,side*.08,.045,.045,'paper',g);foot.scale.z=1.3;
    }
    return g;
  }
  function pin(x,z) {
    disk(.16,.035,x,.3,z,'blue');
    const outline=new THREE.Shape();outline.moveTo(0,0);
    outline.bezierCurveTo(-.09,.13,-.20,.26,-.16,.38);
    outline.bezierCurveTo(-.10,.57,.10,.57,.16,.38);
    outline.bezierCurveTo(.20,.26,.09,.13,0,0);
    const hole=new THREE.Path();hole.absarc(0,.36,.063,0,Math.PI*2,true);outline.holes.push(hole);
    const m=mesh(new THREE.ExtrudeGeometry(outline,{depth:.065,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:2}),'red');
    m.position.set(x,.32,z);return m;
  }

  // A globe on a brass meridian stand, with raised simplified land silhouettes.
  disk(.47,.075,0,.32,-.75,'wood');
  disk(.095,.45,0,.57,-.75,'wood');
  const globe=group('buzo-globe',0,2.02,-.75);
  const oceanMaterial=new THREE.MeshStandardMaterial({color:0x365778,roughness:.72,emissive:0x243f61,emissiveIntensity:0});
  const gridMaterial=new THREE.MeshStandardMaterial({color:0x7798b4,roughness:.8});
  const coastMaterial=new THREE.LineBasicMaterial({color:0x9b8156});
  const ocean=new THREE.Mesh(new THREE.SphereGeometry(1.08,64,48),oceanMaterial);
  ocean.name='globe-ocean';globe.add(ocean);
  function onSphere(lon,lat,r=1.087) {
    const a=THREE.MathUtils.degToRad(lon),b=THREE.MathUtils.degToRad(lat);
    return new THREE.Vector3(r*Math.cos(b)*Math.sin(a),r*Math.sin(b),r*Math.cos(b)*Math.cos(a));
  }
  for(let longitude=0;longitude<180;longitude+=30){
    const r=ring(1.083,.0035,0,0,0,'blue',globe);r.material=gridMaterial;r.rotation.y=longitude*Math.PI/180;
  }
  for(const latitude of [-60,-30,0,30,60]){
    const a=latitude*Math.PI/180;
    const r=ring(1.083*Math.cos(a),.0035,0,1.083*Math.sin(a),0,'blue',globe);r.material=gridMaterial;r.rotation.x=Math.PI/2;
  }
  const lands=[
    [[-168,66],[-140,70],[-122,55],[-100,52],[-82,60],[-58,50],[-76,27],[-88,18],[-100,21],[-116,32],[-131,51]],
    [[-81,12],[-63,10],[-49,-1],[-35,-9],[-43,-24],[-53,-34],[-69,-55],[-76,-34],[-79,-9]],
    [[-18,35],[9,37],[34,30],[43,10],[51,11],[41,-12],[31,-31],[18,-35],[10,-18],[-1,4],[-17,15]],
    [[-10,36],[-10,53],[8,58],[21,71],[37,68],[45,54],[62,55],[85,72],[127,65],[175,64],[151,46],[128,35],[119,17],[105,5],[99,22],[79,8],[70,25],[50,29],[34,42],[23,37],[14,44]],
    [[112,-12],[132,-11],[145,-17],[154,-28],[145,-39],[129,-33],[114,-34]],
    [[-54,59],[-43,60],[-20,77],[-44,83],[-62,76]],
    [[47,-13],[50,-16],[47,-26],[44,-24]],
    [[-6,50],[-3,51],[0,53],[-3,59],[-6,57]],
    [[130,31],[135,34],[139,37],[142,41],[145,44],[142,45],[138,39],[133,35]],
    [[95,5],[99,3],[106,-6],[103,-6],[98,-1]],
    [[109,7],[117,7],[119,1],[115,-4],[109,-2]],
    [[106,-6],[114,-7],[114,-9],[107,-8]],
    [[130,-3],[142,-3],[151,-7],[147,-10],[139,-8]],
    [[166,-34],[174,-39],[178,-38],[175,-43],[168,-47],[166,-45],[172,-41]]
  ];
  for(const polygon of lands){
    const shape=new THREE.Shape(polygon.map(([x,y])=>new THREE.Vector2(x,y)));
    const flat=new THREE.ShapeGeometry(shape).toNonIndexed();
    // Subdivide planar triangles before projecting; large faces otherwise cut into the globe.
    const vertices=[];const p=flat.attributes.position;
    function projectTriangle(a,b,c,depth){
      if(depth){const ab=a.clone().add(b).multiplyScalar(.5),bc=b.clone().add(c).multiplyScalar(.5),ca=c.clone().add(a).multiplyScalar(.5);
        projectTriangle(a,ab,ca,depth-1);projectTriangle(ab,b,bc,depth-1);projectTriangle(ca,bc,c,depth-1);projectTriangle(ab,bc,ca,depth-1);return;}
      for(const v of [a,b,c])vertices.push(...onSphere(v.x,v.y,1.103).toArray());
    }
    for(let i=0;i<p.count;i+=3)projectTriangle(new THREE.Vector2(p.getX(i),p.getY(i)),new THREE.Vector2(p.getX(i+1),p.getY(i+1)),new THREE.Vector2(p.getX(i+2),p.getY(i+2)),4);
    flat.dispose();const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
    const land=mesh(geometry,'ivory',globe);land.name='globe-land';land.castShadow=false;land.receiveShadow=false;
    // Follow the sphere along every coast instead of drawing chords through it.
    const coast=[];
    polygon.forEach(([lon,lat],i)=>{
      const next=polygon[(i+1)%polygon.length];
      const steps=Math.ceil(Math.max(Math.abs(next[0]-lon),Math.abs(next[1]-lat)));
      for(let j=0;j<steps;j++)coast.push(onSphere(THREE.MathUtils.lerp(lon,next[0],j/steps),THREE.MathUtils.lerp(lat,next[1],j/steps),1.105));
    });
    const coastline=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(coast),coastMaterial);globe.add(coastline);
  }
  const meridian=ring(1.2,.035,0,2.02,-.75,'wood');meridian.rotation.z=-.25;
  ball(.07,-.31,3.21,-.75,'wood');

  // Curved red desk, concierge and two waiting visitors.
  const deskShape=new THREE.Shape();
  deskShape.absarc(0,0,.8,0,Math.PI,false);deskShape.absarc(0,0,.62,Math.PI,0,true);deskShape.closePath();
  const deskGeo=new THREE.ExtrudeGeometry(deskShape,{depth:.64,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3});deskGeo.rotateX(-Math.PI/2);
  const desk=mesh(deskGeo,'red');desk.rotation.y=Math.PI;desk.position.set(0,.3,1.42);
  const guide=group('concierge',0,.28,1.4);character(0,0,0,1.12,guide);
  const scarf=ring(.13,.035,0,.61,.015,'red',guide);scarf.rotation.x=Math.PI/2;
  const hand=group('concierge-greeting',-.27,.83,1.44);const palm=ball(.082,0,0,0,'ivory',hand);palm.scale.y=1.2;
  character(-.29,floor,2.55,.84);character(.33,floor,2.62,.76);
  disk(.13,.025,.51,.99,1.85,'wood');
  const bell=ball(.115,.51,1.025,1.85,'wood');bell.scale.y=.65;ball(.025,.51,1.12,1.85,'wood');
  const bubble=group('concierge-conversation',.82,1.42,1.14);
  const bubbleBody=ball(.29,0,0,0,'red',bubble);bubbleBody.scale.set(1.25,.9,.25);
  const tail=mesh(new THREE.ConeGeometry(.08,.2,3),'red',bubble);tail.position.set(-.15,-.25,0);tail.rotation.z=2.9;
  const dots=[];for(const x of [-.15,0,.15])dots.push(ball(.032,x,0,.077,'ivory',bubble));

  // Live music stage with a curved proscenium, curtains and microphone.
  const sx=-2.13,sz=-.08;
  disk(.65,.10,sx,.32,sz,'wood');
  box(1.19,.82,.12,sx,.78,sz-.4,'red');
  for(const side of [-1,1]){
    box(.13,.89,.24,sx+side*.61,.79,sz-.4);
    for(let i=0;i<4;i++){const curtain=ball(.085,sx+side*(.36+i*.057),.79,sz-.30,'red');curtain.scale.set(1,5,1);}
    box(.18,.31,.17,sx+side*.45,.54,sz+.28,'ink');
    for(const y of [.48,.62]){const speaker=ring(.047,.009,sx+side*.45,y,sz+.371,'shade');}
  }
  const arch=mesh(new THREE.TorusGeometry(.61,.075,8,48,Math.PI),'ivory');arch.position.set(sx,1.20,sz-.4);
  const folds=line([[sx-.5,1.27,sz-.28],[sx,1.12,sz-.25],[sx+.5,1.27,sz-.28]],.075,'red');
  disk(.11,.025,sx,.395,sz+.12,'wood');line([[sx,.41,sz+.12],[sx,.94,sz+.12],[sx+.1,.98,sz+.12]],.015,'ink');ball(.034,sx+.11,.98,sz+.12,'wood');

  // Open networking pavilion and a small exhibition behind it.
  const px=2.13,pz=.65;
  disk(.69,.075,px,.31,pz);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3,x=px+Math.cos(a)*.56,z=pz+Math.sin(a)*.56;
    box(.047,.87,.047,x,.78,z);
  }
  const roof=mesh(new THREE.ConeGeometry(.78,.55,6),'ivory');roof.position.set(px,1.42,pz);roof.rotation.y=Math.PI/6;
  ball(.05,px,1.73,pz,'wood');
  character(px-.25,.35,pz,.58);character(px+.15,.35,pz+.18,.63);character(px+.24,.35,pz-.2,.54);
  const ex=1.75,ez=-1.68;
  disk(.66,.075,ex,.31,ez);
  box(1.12,.87,.065,ex,.77,ez-.4,'paper');box(.065,.87,.7,ex-.56,.77,ez-.08,'paper');
  for(const x of [ex-.3,ex+.28]){box(.36,.48,.045,x,.87,ez-.35);const art=ball(.10,x,.87,ez-.32,'shade');art.scale.z=.16;}
  box(.23,.33,.23,ex,.52,ez);ball(.10,ex,.79,ez);
  for(const [x,z] of [[-2.87,-.35],[-2.8,.58],[2.95,.3],[2.69,-1.63]]){
    const tree=ball(.13,x,.62,z,'shade');tree.scale.y=2.5;
    disk(.11,.035,x,.29,z,'paper');
  }
  const venues=[[-1.63,.72],[1.55,1.35],[1.21,-1.07]];
  for(const [x,z] of venues)pin(x,z);
  line([[-.8,.29,1.91],[-1.38,.29,1.55],[-1.63,.29,.72]],.025);
  line([[.8,.29,1.91],[1.4,.29,1.85],[1.55,.29,1.35]],.025);
  line([[.79,.29,1.65],[1.17,.29,.40],[1.21,.29,-1.07]],.025);

  const model=finish(68,[globe,guide,hand,bubble]);
  const bubbleY=bubble.position.y,handY=hand.position.y;
  model.userData.animate=elapsed=>{
    const phase=Math.max(0,elapsed)*Math.PI*2/24;
    globe.rotation.y=-.4+phase;
    bubble.position.y=bubbleY+Math.sin(phase*3)*.035;
    hand.position.y=handY+Math.sin(phase*4)*.04;hand.rotation.z=-.35+Math.sin(phase*4)*.18;
    dots.forEach((dot,i)=>dot.scale.setScalar(.9+.15*Math.sin(phase*8-i*.8)));
  };
  const lights=[];
  const lampMaterial=new THREE.MeshStandardMaterial({color:0xffdeb0,emissive:0xffb85c,emissiveIntensity:0});
  for(const [x,y,z] of [[sx,1.4,sz-.15],[px,1.23,pz],[ex,1.26,ez-.25]]){
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),lampMaterial);lamp.position.set(x,y,z);model.add(lamp);
    const light=new THREE.PointLight(0xffbc73,0,2.3,2);light.position.set(x,y-.1,z+.12);model.add(light);lights.push(light);
  }
  model.userData.setTheme=theme=>{
    const night=theme==='dark';model.userData.studioLightScale=night?.55:1;
    oceanMaterial.emissiveIntensity=night?.22:0;
    lampMaterial.emissiveIntensity=night?3:0;lights.forEach(light=>{light.intensity=night?1.6:0;});
  };
  model.userData.animate(0);model.userData.setTheme('light');
  return model;
}
