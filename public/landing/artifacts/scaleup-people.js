// One pedestrian circuit shared by the three editions. The café, furniture and
// exhibit props sit inside/outside this pavement, never on the walking line.
export const SHOP_WALKWAY = [[.6,2.32],[1.55,2.32],[2.05,1.8],[2.05,-.65],[1.55,-1.10],[-1.55,-1.10],[-2.05,-.65],[-2.05,1.8],[-1.55,2.32]];
export function createShopWalk(T) {
  const curve=new T.CatmullRomCurve3(SHOP_WALKWAY.map(([x,z])=>new T.Vector3(x,.175,z)),true,'centripetal');
  curve.arcLengthDivisions=500;curve.updateArcLengths();
  const length=curve.getLength(),period=54,pause=3;
  return (seconds,index=0)=>{
    const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
    const phase=(time+index*period/3)%period;
    const u=Math.max(0,(phase-pause)/(period-pause));
    // Integrated cosine velocity gives a soft stop/start at the shopfront.
    const progress=u-Math.sin(u*2*Math.PI)/(2*Math.PI);
    const speed=(1-Math.cos(u*2*Math.PI))*length/(period-pause);
    const point=curve.getPointAt(progress),tangent=curve.getTangentAt(progress);
    return {x:point.x,y:point.y,z:point.z,yaw:Math.atan2(tangent.x,tangent.z),
      stride:Math.min(1,speed/.25),gait:progress*length*14};
  };
}

export function createShopPeople(T,root) {
  const crowd=new T.Group();crowd.name='shop-customers';root.add(crowd);
  const mat=(color,roughness=.75)=>new T.MeshStandardMaterial({color,roughness});
  const skin=[mat(0xbb855f),mat(0xe2b995),mat(0x87583d)];
  const coats=[mat(0xb96d48),mat(0x1e6257),mat(0xd5c5a1)];
  const trousers=mat(0x354542),shoes=mat(0x45342c),hair=mat(0x3b2c25),bag=mat(0x946545),ivory=mat(0xf4e5cb);
  const sphere=new T.SphereGeometry(1,16,12);
  const capsule=new T.CapsuleGeometry(1,1,4,10);
  const cylinder=new T.CylinderGeometry(1,1,1,20);
  function part(parent,geometry,material,x,y,z,sx,sy,sz){
    const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
    mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  const rigs=coats.map((coat,index)=>{
    const person=new T.Group();person.name=`shop-customer-${index+1}`;person.scale.setScalar([1,.94,.98][index]);crowd.add(person);
    const body=new T.Group();person.add(body);
    // A tailored coat, collar, head, hair and a small crossbody satchel.
    part(body,sphere,coat,0,.59,0,.145,.215,.10);
    part(body,cylinder,ivory,0,.775,0,.065,.045,.06);
    part(body,sphere,skin[index],0,.885,.008,.10,.13,.095);
    part(body,sphere,hair,0,.953,-.016,.104,.076,.091);
    part(body,sphere,skin[index],0,.88,.10,.025,.028,.025);
    if(index===0){
      part(body,cylinder,ivory,0,.999,0,.17,.026,.14);
      part(body,sphere,ivory,0,1.025,-.005,.108,.07,.10);
    }else if(index===1){
      part(body,sphere,hair,0,.92,-.095,.085,.10,.065);
    }
    part(body,sphere,bag,.15,.49,-.045,.07,.095,.055);
    const strap=part(body,cylinder,bag,0,.61,.101,.012,.32,.012);strap.rotation.z=-.57;
    const legs=[],arms=[];
    for(const side of [-1,1]){
      const leg=new T.Group();leg.position.set(side*.075,.425,0);body.add(leg);legs.push(leg);
      part(leg,capsule,trousers,0,-.17,0,.047,.112,.047);
      part(leg,sphere,shoes,0,-.372,.035,.058,.045,.104);
      const arm=new T.Group();arm.position.set(side*.135,.73,0);body.add(arm);arms.push(arm);
      part(arm,capsule,coat,side*.015,-.125,0,.042,.078,.042);
      part(arm,sphere,skin[index],side*.02,-.265,.012,.04,.048,.038);
    }
    return {person,body,legs,arms};
  });
  const walk=createShopWalk(T);
  return seconds=>rigs.forEach(({person,body,legs,arms},i)=>{
    const pose=walk(seconds,i),swing=Math.sin(pose.gait)*pose.stride;
    person.position.set(pose.x,pose.y,pose.z);person.rotation.y=pose.yaw;
    // Keep the supporting shoe on the pavement as its leg swings.
    body.position.y=-.37*(1-Math.cos(swing*.39));
    body.rotation.z=.018*swing;
    legs[0].rotation.x=.39*swing;legs[1].rotation.x=-.39*swing;
    arms[0].rotation.x=-.30*swing;arms[1].rotation.x=.30*swing;
  });
}
