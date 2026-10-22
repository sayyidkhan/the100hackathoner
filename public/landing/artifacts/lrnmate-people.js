import {lessonMoment} from './lrnmate-timing.js';
// Authored Microsoft Rocketbox meshes. MIT licence ships beside the local assets.
let assets;
export async function prepareLrnmatePeople(){
  if(assets)return;
  assets=await Promise.all(['learner','mentor'].map(async name=>{
    const response=await fetch(new URL(`../assets/lrnmate-people/${name}.bin`,import.meta.url));
    if(!response.ok)throw new Error(`Unable to load LrnMate ${name}`);
    const data=response.body.pipeThrough(new DecompressionStream('gzip'));
    return new Response(data).json();
  }));
}
export function lrnmatePeople(T,{root,box,disk,line}) {
  if(!assets)throw new Error('LrnMate character assets must be prepared before creating the exhibit.');
  const actors=[];
  for(let i=0;i<2;i++){
    const seated=i===0,model=new T.ObjectLoader().parse(assets[i]),pivot=new T.Group();
    pivot.name=seated?'Rocketbox seated learner':'Rocketbox mentor';root.add(pivot);pivot.add(model);
    model.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(model),scale=(seated?2.35:2.55)/(bounds.max.y-bounds.min.y);
    model.scale.setScalar(scale);model.position.y=-bounds.min.y*scale-(seated?.55:0);
    pivot.position.set(seated?1.63:2.98,.31,seated?.35:-.38);pivot.rotation.y=seated?.85:-.5;
    const bones={};model.traverse(o=>{if(o.isBone)bones[o.name.replace('Bip01_','')]=o;if(o.isMesh){o.castShadow=o.receiveShadow=true;o.frustumCulled=false;o.material.roughness=.82;}});

    function aim(name,child,target){const bone=bones[name],end=bones[child];root.updateMatrixWorld(true);const start=bone.getWorldPosition(new T.Vector3());const from=end.getWorldPosition(new T.Vector3()).sub(start).normalize();const to=model.localToWorld(new T.Vector3(...target)).sub(start).normalize();const delta=new T.Quaternion().setFromUnitVectors(from,to);const world=delta.multiply(bone.getWorldQuaternion(new T.Quaternion()));bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));root.updateMatrixWorld(true);}
    for(const side of ['L','R']){
      const sign=side==='L'?1:-1;
      if(seated){const footWorld=bones[`${side}_Foot`].getWorldQuaternion(new T.Quaternion());aim(`${side}_Thigh`,`${side}_Calf`,[sign*10,92,43]);aim(`${side}_Calf`,`${side}_Foot`,[sign*10,50,43]);bones[`${side}_Foot`].quaternion.copy(bones[`${side}_Foot`].parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(footWorld));}
    }
    // Solve the two-bone arm chain to a desk-space hand target, keeping elbows bent.
    function reach(side,target,hint){
      const upper=bones[`${side}_UpperArm`],fore=bones[`${side}_Forearm`],hand=bones[`${side}_Hand`];root.updateMatrixWorld(true);
      const inv=model.matrixWorld.clone().invert();
      const pos=b=>b.getWorldPosition(new T.Vector3()).applyMatrix4(inv);
      const a=pos(upper),b=pos(fore),c=pos(hand),goal=new T.Vector3(...target);
      const l1=a.distanceTo(b),l2=b.distanceTo(c),direction=goal.clone().sub(a),distance=Math.max(.1,Math.min(direction.length(),l1+l2-.1));direction.normalize();
      const along=(l1*l1-l2*l2+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,l1*l1-along*along));
      const bend=new T.Vector3(...hint).sub(a);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
      const elbow=a.clone().addScaledVector(direction,along).addScaledVector(bend,height);
      aim(`${side}_UpperArm`,`${side}_Forearm`,elbow.toArray());aim(`${side}_Forearm`,`${side}_Hand`,goal.toArray());
    }
    if(seated){reach('L',[18,134,39],[32,115,12]);reach('R',[-8,134,40],[-32,115,10]);}
    else {reach('L',[22,94,30],[35,116,0]);reach('R',[-24,104,28],[-34,115,0]);}
    if(seated){root.updateMatrixWorld(true);const bone=bones.Head;const axis=new T.Vector3(1,0,0).applyQuaternion(model.getWorldQuaternion(new T.Quaternion()));const world=new T.Quaternion().setFromAxisAngle(axis,.24).multiply(bone.getWorldQuaternion(new T.Quaternion()));bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));}
    const tracked=['Head','L_UpperArm','R_UpperArm','L_Forearm','R_Forearm'].map(name=>({name,bone:bones[name],rest:bones[name].quaternion.clone()}));
    // Record a deliberate explaining pose; the supporting hand and legs never drift.
    if(!seated)reach('R',[-28,115,40],[-36,120,8]);
    for(const joint of tracked){joint.explain=joint.bone.quaternion.clone();joint.bone.quaternion.copy(joint.rest);}
    const face=bones.Head,readHead=face.quaternion.clone();
    function headOffset(axis,angle){root.updateMatrixWorld(true);const worldAxis=new T.Vector3(...axis).applyQuaternion(model.getWorldQuaternion(new T.Quaternion()));const world=new T.Quaternion().setFromAxisAngle(worldAxis,angle).multiply(face.getWorldQuaternion(new T.Quaternion()));return face.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world);}
    const lookHead=headOffset([0,1,0],seated?.32:-.24);
    const nodHead=headOffset([1,0,0],.10);
    actors.push({tracked,seated,face,readHead,lookHead,nodHead,reach});
    if(seated){disk(.29,.08,1.63,.97,.35,'paper');box(.49,.46,.09,1.63,1.22,.08,'paper');for(const dx of [-.20,.20])for(const dz of [-.17,.17])line([[1.63+dx,.94,.35+dz],[1.63+dx*1.12,.31,.35+dz*1.15]],.023,'wood');}
  }
  return t=>{
    const beat=lessonMoment(t);
    for(const a of actors){
      for(const joint of a.tracked)joint.bone.quaternion.copy(joint.rest).slerp(joint.explain,a.seated?0:beat.explain);
      a.face.quaternion.copy(a.readHead).slerp(a.lookHead,beat.explain);
      if(!a.seated)a.face.quaternion.slerp(a.nodHead,beat.acknowledge);
      // Only the learner's working hand makes a small stroke, with a fixed desk height.
      if(a.seated&&beat.respond>0)a.reach('R',[-8+beat.stroke*.65,134,40+beat.respond*.3],[-32,115,10]);
    }
  };
}
