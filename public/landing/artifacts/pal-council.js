// One visible work cycle, driven by the gallery clock (including pause/reset).
export function animateCouncil(THREE, model, cast, flags) {
  const smooth=x=>{const t=THREE.MathUtils.clamp(x,0,1);return t*t*(3-2*t);};
  const lerp=THREE.MathUtils.lerp;
  const turn=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*smooth(t);
  const rigs=cast.map(g=>({g,rest:g.position.clone(),yaw:g.rotation.y,
    head:g.getObjectByName('head'),right:g.getObjectByName('right-arm'),left:g.getObjectByName('left-arm'),
    feet:[g.getObjectByName('left-foot'),g.getObjectByName('right-foot')],tool:g.getObjectByName('working-tool')}));
  // Sheikh → plan → write → build → review → protect → care → deliver.
  const order=[0,5,2,4,3,6,7,1];
  const material=new THREE.MeshStandardMaterial({color:0xffd27a,emissive:0xe59935,emissiveIntensity:.55,roughness:.45});
  const task=new THREE.Group();task.name='community-task';model.add(task);
  const card=new THREE.Mesh(new THREE.BoxGeometry(.38,.28,.04),new THREE.MeshStandardMaterial({color:0xf4ebd8,roughness:.7}));
  task.add(card);
  const seal=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),material);seal.scale.z=.25;seal.position.set(0,0,.027);task.add(seal);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.34,.018,8,48),material);halo.name='active-companion';halo.rotation.x=Math.PI/2;model.add(halo);
  const sparks=Array.from({length:7},()=>{const m=new THREE.Mesh(new THREE.OctahedronGeometry(.045),material);model.add(m);return m;});
  const route=new THREE.CatmullRomCurve3([rigs[1].rest.clone(),new THREE.Vector3(-1.95,.25,-.55),
    new THREE.Vector3(-2.53,.25,.05),new THREE.Vector3(-2.65,.25,.9),
    new THREE.Vector3(-2.52,.25,1.55),new THREE.Vector3(-2.02,.25,2.30),new THREE.Vector3(-1.38,.25,2.38)],false,'centripetal');
  const point=new THREE.Vector3(),tangent=new THREE.Vector3(),from=new THREE.Vector3(),to=new THREE.Vector3();
  const market=new THREE.Vector3(-1.88,1.03,1.77);
  const deliveryYaw=Math.atan2(market.x+1.38,market.z-2.38);
  const departureYaw=(()=>{route.getTangentAt(0,tangent);return Math.atan2(tangent.x,tangent.z);})();
  const arrivalYaw=(()=>{route.getTangentAt(1,tangent);return Math.atan2(tangent.x,tangent.z);})();
  const cycle=28;
  model.userData.animate=elapsed=>{
    const t=Math.max(0,elapsed)%cycle;
    const phase=Math.min(7,Math.floor(t/1.5)),local=t-phase*1.5;
    const active=order[phase];
    const working=t<12;
    const emphasis=working?Math.sin(Math.PI*Math.min(local/1.5,1)):0;
    rigs.forEach((r,i)=>{
      const selected=(working&&i===active?emphasis:0)+.16*(.5+.5*Math.sin(t*Math.PI*2/7+i));
      const breath=Math.sin(t*Math.PI*2/7+i)*.012;
      r.g.position.copy(r.rest);r.g.position.y+=breath;
      r.g.rotation.set(selected*.04,i===1?r.yaw:turn(r.yaw,0,selected*.55),0);
      r.head.rotation.set(selected*.16,Math.sin(t*Math.PI/7+i)*.09,0);
      r.right.rotation.set(-selected*.8,0,-.12-selected*.3);
      r.left.rotation.set(-selected*.25,0,.12);
      for(const f of r.feet){f.position.y=.095;f.position.z=.04;f.rotation.x=0;}
      if(r.tool){r.tool.rotation.set(-selected*.45,0,Math.sin(t*Math.PI*8/7)*selected*.15);r.tool.position.y=.5+selected*.13;}
      if(i===0){r.right.rotation.x=-.25-selected*.9;r.right.rotation.z=-.25-selected*.55;r.head.rotation.y=Math.sin(t*Math.PI/7)*.24;}
      // Distinct gestures: hammer strikes, reading/inspection, shield salute.
      if(r.g.name==='builder'&&selected){const strike=Math.sin(t*Math.PI*8/7);r.tool.rotation.x=-.35+strike*.75*selected;r.right.rotation.x=-.35+strike*.6*selected;}
      if(r.g.name==='writer'&&selected){r.tool.rotation.z=Math.sin(t*Math.PI*12/7)*.12*selected;r.head.rotation.x=.20*selected;}
      if(r.g.name==='reviewer'&&selected){r.tool.position.y=.5+selected*.25;r.tool.rotation.y=Math.sin(t*Math.PI*4/7)*.25*selected;}
      if(r.g.name==='guardian'&&selected){r.tool.rotation.x=-.5*selected;r.left.rotation.z=.12+selected*.75;}
    });

    const courier=rigs[1];
    let progress=0,walking=false,returning=false;
    if(t>=12.5&&t<18){progress=smooth((t-12.5)/5.5);walking=true;}
    else if(t>=18&&t<21)progress=1;
    else if(t>=21&&t<26.5){progress=1-smooth((t-21)/5.5);walking=true;returning=true;}
    route.getPointAt(progress,point);courier.g.position.copy(point);
    if(walking){
      route.getTangentAt(progress,tangent);
      courier.g.rotation.y=Math.atan2(tangent.x,tangent.z)+(returning?Math.PI:0);
      const gait=Math.sin((t-(returning?21:12.5))*12);
      const envelope=Math.sin(Math.PI*((t-(returning?21:12.5))/5.5));
      courier.g.position.y+=Math.abs(gait)*.075*envelope;
      courier.g.rotation.z=gait*.075*envelope;
      courier.right.rotation.x=gait*.65*envelope;courier.left.rotation.x=-gait*.65*envelope;
      courier.feet.forEach((f,i)=>{const stride=gait*(i===0?1:-1)*envelope;f.position.z=.04+stride*.14;f.position.y=.095+Math.max(0,stride)*.065;f.rotation.x=stride*.3;});
    } else if(t>=12&&t<12.5)courier.g.rotation.y=turn(courier.yaw,departureYaw,(t-12)/.5);
    else if(t>=18&&t<18.6)courier.g.rotation.y=turn(arrivalYaw,deliveryYaw,(t-18)/.6);
    else if(t>=18.6&&t<20.4){courier.g.rotation.y=deliveryYaw;courier.right.rotation.x=-.8;}
    else if(t>=20.4&&t<21)courier.g.rotation.y=turn(deliveryYaw,arrivalYaw+Math.PI,(t-20.4)/.6);
    else if(t>=26.5)courier.g.rotation.y=turn(departureYaw+Math.PI,courier.yaw,(t-26.5)/.7);

    // A single bright task card makes the handoffs legible at gallery scale.
    if(t<12){
      const previous=order[Math.max(0,phase-1)];
      from.copy(rigs[previous].rest);to.copy(rigs[active].rest);
      from.y=previous===0?2.02:1.75;to.y=active===0?2.02:1.75;
      const travel=smooth(local/.55);task.position.lerpVectors(from,to,travel);task.position.y+=Math.sin(travel*Math.PI)*.25;
      task.scale.setScalar(.95+emphasis*.12);
    } else if(t<18.6){task.position.copy(courier.g.position);task.position.y+=1.5;task.scale.setScalar(1);}
    else if(t<19.4){from.copy(courier.g.position);from.y+=1.5;task.position.lerpVectors(from,market,smooth((t-18.6)/.8));task.scale.setScalar(1);}
    else {task.position.copy(market);task.scale.setScalar(1-smooth((t-19.4)/.4));}
    task.rotation.set(-.12,Math.sin(t*Math.PI/7)*.2,Math.sin(t*Math.PI/3.5)*.07);
    task.visible=t<19.8;
    const focus=working?rigs[active].g:courier.g;
    halo.position.copy(focus.position);halo.position.y=.265;halo.scale.setScalar(1+Math.sin(t*Math.PI*2)*.08);
    halo.visible=t<20;
    sparks.forEach((spark,i)=>{
      const age=(t-19.3)/1.1;const burst=THREE.MathUtils.clamp(age,0,1);const a=i*Math.PI*2/7;
      spark.visible=age>=0&&age<1;
      spark.position.set(market.x+Math.cos(a)*burst*.55,market.y+Math.sin(burst*Math.PI)*.5,market.z+Math.sin(a)*burst*.55);
      spark.scale.setScalar(Math.max(.001,1-burst));
    });
    flags.forEach((flag,i)=>{flag.rotation.y=Math.sin(t*Math.PI*2/3.5+i)*.22;flag.rotation.z=Math.sin(t*Math.PI*2/2+i)*.055;});
    model.userData.councilPhase=t<12?cast[active].name:t<18.6?'delivery':t<21?'community-served':'return';
  };
  model.userData.animate(0);
}
