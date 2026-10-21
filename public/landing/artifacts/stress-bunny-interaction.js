// Direct manipulation and bounded landing physics, separate from ambient motion.
export function bunnyInteraction(T,model,bunny,shadow,offset,onTouch) {
  const home=bunny.position.clone(),landing=new T.Vector3(),start=new T.Vector3();
  let state='resting',flightTime=0,landingTime=0,velocity=0;
  function groundPoint(point){
    const p=point.clone().sub(offset);
    p.x=T.MathUtils.clamp(p.x,-2.05,2.10);p.z=T.MathUtils.clamp(p.z,-1.05,1.04);
    const edge=Math.hypot(p.x/2.25,p.z/1.22);if(edge>1){p.x/=edge;p.z/=edge;}
    // The pool is off to the side; release over it lands on the nearest bank.
    const dx=(p.x-1.13)/1.5,dz=(p.z-.72)/1.06;
    if(dx*dx+dz*dz<1-1e-6){
      let nearest=null,best=Infinity;
      for(let i=0;i<128;i++){
        const a=i/128*Math.PI*2,x=1.13+Math.cos(a)*1.5,z=.72+Math.sin(a)*1.06;
        if(x>2.1||x< -2.05||z>1.04||z< -1.05||Math.hypot(x/2.25,z/1.22)>1)continue;
        const d=(p.x-x)**2+(p.z-z)**2;if(d<best){best=d;nearest={x,z};}
      }
      p.x=nearest?.x??-.4;p.z=nearest?.z??0;
    }
    p.y=.29;return p.add(offset);
  }
  function publish(){
    model.userData.interactionState=state;
    model.userData.needsInteractionFrame=state==='falling'||state==='landing';
    model.userData.isHeld=state==='held';
    const p=groundPoint(bunny.position);shadow.position.set(p.x,p.y+.005,p.z);
    const height=Math.max(0,bunny.position.y-p.y);shadow.scale.set(1+height*.15,1+height*.15,1);shadow.material.opacity=.30/(1+height*.45);
  }
  const api={
    target:bunny,
    begin(time){state='held';velocity=0;bunny.position.y+=.16;onTouch(time);publish();return bunny.position.clone();},
    move(point,time){
      if(state!=='held')return;
      bunny.position.set(T.MathUtils.clamp(point.x,offset.x-2.05,offset.x+2.1),T.MathUtils.clamp(point.y,offset.y+.45,offset.y+2.05),T.MathUtils.clamp(point.z,offset.z-1.05,offset.z+1.04));
      onTouch(time);publish();
    },
    release(time,immediate=false){
      if(state!=='held')return;
      onTouch(time);landing.copy(groundPoint(bunny.position));start.copy(bunny.position);flightTime=0;velocity=0;
      if(immediate){bunny.position.copy(landing);state='resting';}else state='falling';
      publish();
    },
    update(dt,time,immediate=false){
      if(state==='falling'){
        if(immediate){bunny.position.copy(landing);state='resting';}
        else {
          flightTime+=dt;velocity-=5.5*dt;bunny.position.y+=velocity*dt;
          const travel=1-Math.exp(-flightTime*9);bunny.position.x=T.MathUtils.lerp(start.x,landing.x,travel);bunny.position.z=T.MathUtils.lerp(start.z,landing.z,travel);
          if(bunny.position.y<=landing.y){bunny.position.copy(landing);state='landing';landingTime=0;onTouch(time);}
        }
      }else if(state==='landing'){
        landingTime+=dt;
        if(immediate||landingTime>.45){state='resting';bunny.position.copy(landing);}
        else bunny.position.y=landing.y+Math.sin(landingTime/.45*Math.PI)*.045*(1-landingTime/.45);
      }
      publish();
    },
    reset(){state='resting';bunny.position.copy(home);velocity=0;publish();},
    groundPoint,
  };
  model.userData.manipulation=api;publish();return api;
}
