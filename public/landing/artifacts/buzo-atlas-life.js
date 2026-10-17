import { atlasBookMargin, atlasDeckHeight } from './buzo-atlas-paths.js';
// Human-scale activity gives the cultural atlas visible life without moving its
// architecture. People share instanced geometry instead of individual draw calls.
export function createAtlasLife(THREE, root, routes) {
  const group=new THREE.Group();group.name='atlas-people';group.userData.noAO=true;root.add(group);
  const people=[];
  routes.forEach((curve,route)=>{
    const walkers=route===3?5:3,start=route===3?.03:.16,span=route===3?.94:.74;
    for(let i=0;i<walkers;i++)people.push({curve,phase:i*2/walkers+route*.13,start,span,speed:.13/(curve.getLength()*span),role:'walker',outfit:(i+route)%3});
  });
  for(let i=0;i<5;i++){
    const a=.35+i*.60;
    people.push({position:new THREE.Vector3(-3+Math.cos(a)*.88,1.72,-1.65+Math.sin(a)*.63),yaw:Math.PI+a,role:'audience',phase:i*.8,outfit:i%3});
  }
  people.push(
    {position:new THREE.Vector3(-2.9,1.91,-1.84),yaw:0,role:'drummer',phase:0,outfit:1},
    {position:new THREE.Vector3(-3.48,1.91,-1.69),yaw:0,role:'pianist',phase:1,outfit:0},
    {position:new THREE.Vector3(-2.39,1.91,-1.61),yaw:0,role:'bassist',phase:2,outfit:2},
  );
  const count=people.length;
  const coatColors=[0x234054,0xb77547,0x792f37];
  const material=color=>new THREE.MeshStandardMaterial({color,roughness:.8});
  function instances(geometry,mat,parts,name){
    const mesh=new THREE.InstancedMesh(geometry,mat,count*parts);
    mesh.name=name;mesh.userData.noShadow=true;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled=false;group.add(mesh);return mesh;
  }
  const body=instances(new THREE.CylinderGeometry(.035,.048,.13,7),material(0xffffff),1,'atlas-moving-coats');
  const heads=instances(new THREE.SphereGeometry(.033,9,7),material(0xe6bd8f),1,'atlas-moving-heads');
  const hair=instances(new THREE.SphereGeometry(.034,9,6,0,Math.PI*2,0,Math.PI/2),material(0x302321),1,'atlas-moving-hair');
  const legs=instances(new THREE.CylinderGeometry(.011,.013,1,6),material(0x172332),4,'atlas-walking-legs');
  const arms=instances(new THREE.CylinderGeometry(.011,.014,1,6),material(0xffffff),4,'atlas-moving-arms');
  const hands=instances(new THREE.SphereGeometry(.014,7,5),material(0xe6bd8f),2,'atlas-moving-hands');
  const shoes=instances(new THREE.BoxGeometry(.025,.020,.045),material(0x1c1d22),2,'atlas-walking-shoes');
  const shadows=instances(new THREE.CircleGeometry(.07,14),new THREE.MeshBasicMaterial({color:0x1a1a15,transparent:true,opacity:.19,depthWrite:false}),1,'atlas-foot-shadows');
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),a=new THREE.Vector3(),b=new THREE.Vector3(),v=new THREE.Vector3();
  const foot=new THREE.Vector3(),tangent=new THREE.Vector3(),rotation=new THREE.Quaternion();
  let actorWidth=1.12,actorHeight=1.12;
  function point(x,y,z){return v.set(x*actorWidth,y*actorHeight,z*actorWidth).applyQuaternion(rotation).add(foot);}
  function piece(mesh,i,x,y,z,rx=0){
    dummy.position.copy(point(x,y,z));dummy.quaternion.copy(rotation);if(rx)dummy.rotateX(rx);dummy.scale.set(actorWidth,actorHeight,actorWidth);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  }
  function limb(mesh,i,start,end,radius=1){
    a.set(start[0]*actorWidth,start[1]*actorHeight,start[2]*actorWidth).applyQuaternion(rotation).add(foot);b.set(end[0]*actorWidth,end[1]*actorHeight,end[2]*actorWidth).applyQuaternion(rotation).add(foot);
    dummy.position.copy(a).add(b).multiplyScalar(.5);v.copy(b).sub(a);
    dummy.quaternion.setFromUnitVectors(up,v.clone().normalize());dummy.scale.set(radius*actorWidth,v.length(),radius*actorWidth);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  }
  people.forEach((person,i)=>{const color=new THREE.Color(coatColors[person.outfit]);body.setColorAt(i,color);for(let j=0;j<4;j++)arms.setColorAt(i*4+j,color);});
  function update(time){
    people.forEach((person,i)=>{
      const performer=['drummer','pianist','bassist'].includes(person.role);
      actorWidth=performer?1.35:.88;actorHeight=performer?1.7:.94;
      let stride=0,bob=0,slope=0,yaw=person.yaw||0;
      if(person.curve){
        // Walk to the landmark, turn there, then return along the same bridge.
        const cycle=((time*person.speed+person.phase)%2+2)%2;
        const forward=cycle<1,u=forward?cycle:2-cycle;
        // Keep the shared compass junction clear. Walk on the right in both
        // directions, with a gradual lane change and turn at each landing.
        const progress=person.start+u*person.span;
        person.curve.getPointAt(progress,foot);
        person.curve.getTangentAt(progress,tangent);
        const turn=Math.min(1,Math.min(u,1-u)/.055);
        const smooth=turn*turn*(3-2*turn);
        const lane=.058*(forward?1:-1)*smooth;
        const horizontal=Math.hypot(tangent.x,tangent.z);
        foot.x+=tangent.z/horizontal*lane;foot.z-=tangent.x/horizontal*lane;
        if(atlasBookMargin(foot.x,foot.z)>0)foot.y=atlasDeckHeight(foot.x,foot.z,foot.y);
        foot.y+=.006;
        if(!forward)tangent.negate();
        slope=tangent.y/horizontal;
        yaw=Math.atan2(tangent.x,tangent.z);
        yaw+=(forward?1:-1)*(1-smooth)*Math.PI/2;
        stride=Math.sin(time*7+person.phase*12)*(.35+.65*smooth);bob=Math.abs(stride)*.005;
      }else{foot.copy(person.position);bob=.007*Math.sin(time*3+person.phase);}
      rotation.setFromAxisAngle(up,yaw);
      piece(body,i,0,.163+bob,0);
      piece(heads,i,0,.262+bob,0);
      piece(hair,i,0,.268+bob,0);
      for(const side of [-1,1]){
        const j=i*2+(side+1)/2,step=stride*side;
        const lift=Math.max(0,step)*.024;
        const ground=slope*(step*.039+.008),knee=[side*.022,.062+bob,step*.020+.012];
        limb(legs,j*2,[side*.022,.105+bob,0],knee);
        limb(legs,j*2+1,knee,[side*.022,.018+lift+ground,step*.039]);
        piece(shoes,j,side*.022,.014+lift+ground,step*.039+.008,-Math.atan(slope));
        let hand=[side*.059,.125+bob,-step*.042];
        if(person.role==='drummer')hand=[side*.05,.22+.045*Math.sin(time*13+side),.08];
        if(person.role==='pianist')hand=[side*.05,.24+.018*Math.sin(time*11+side*2),.12];
        if(person.role==='bassist')hand=[side*.035,.20+.04*Math.sin(time*5+side),.045];
        if(person.role==='audience')hand=[side*(.014+.028*(.5+.5*Math.sin(time*5+person.phase))),.21,.065];
        const elbow=[side*.060,(.211+bob+hand[1])*.5,hand[2]*.45+.008];
        limb(arms,j*2,[side*.038,.211+bob,0],elbow);limb(arms,j*2+1,elbow,hand);piece(hands,j,...hand);
      }
      piece(shadows,i,0,.001,0,-Math.PI/2-Math.atan(slope));
    });
    for(const mesh of [body,heads,hair,legs,arms,hands,shoes,shadows])mesh.instanceMatrix.needsUpdate=true;
  }
  update(0);
  return {group,update};
}
