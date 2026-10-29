// Authored Microsoft Rocketbox skinned meshes; MIT licence retained in shared asset directory.
let sources;
export async function preparePeople(){if(sources)return;const data=await Promise.all(['learner','mentor'].map(async n=>{const r=await fetch(new URL(`../assets/lrnmate-people/${n}.bin`,import.meta.url));if(!r.ok)throw new Error(`Unable to load Punisher ${n}`);return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();}));sources=data;}
export function punisherPeople(T,kit){
 const {root,m,group,mesh}=kit,actors=[];
 for(let i=0;i<2;i++){
  const angel=i===0,pivot=group(angel?-1.62:1.62,.43,-.12);pivot.rotation.y=angel?.38:-.38;pivot.name=angel?'angel':'devil';
  const model=new T.ObjectLoader().parse(sources[i]);pivot.add(model);model.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(model),scale=3.65/(bounds.max.y-bounds.min.y);model.scale.setScalar(scale);model.position.y=-bounds.min.y*scale-1.03;
  const bones={};model.traverse(o=>{if(o.isBone)bones[o.name.replace('Bip01_','')]=o;if(o.isMesh){o.material=m.ivory.clone();o.castShadow=o.receiveShadow=true;o.frustumCulled=false;
   // Clothing stays sculptural: skin, face and hands retain ivory.
   const pos=o.geometry.attributes.position,colors=[];for(let v=0;v<pos.count;v++){const h=pos.getZ(v),x=Math.abs(pos.getX(v));const c=(!angel&&h<145&&h>30&&x<42)?m.wine.color:m.ivory.color;colors.push(c.r,c.g,c.b);}o.geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));o.material.color.setHex(0xffffff);o.material.vertexColors=true;}});
  function aim(name,endName,target){root.updateMatrixWorld(true);const b=bones[name],end=bones[endName],a=b.getWorldPosition(new T.Vector3()),from=end.getWorldPosition(new T.Vector3()).sub(a).normalize(),to=model.localToWorld(new T.Vector3(...target)).sub(a).normalize();const world=new T.Quaternion().setFromUnitVectors(from,to).multiply(b.getWorldQuaternion(new T.Quaternion()));b.quaternion.copy(b.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));}
  function reach(side,target,hint){root.updateMatrixWorld(true);const inv=model.matrixWorld.clone().invert(),pos=b=>b.getWorldPosition(new T.Vector3()).applyMatrix4(inv),a=pos(bones[`${side}_UpperArm`]),b=pos(bones[`${side}_Forearm`]),c=pos(bones[`${side}_Hand`]),goal=new T.Vector3(...target),l1=a.distanceTo(b),l2=b.distanceTo(c),dir=goal.clone().sub(a),d=Math.min(dir.length(),l1+l2-.1);dir.normalize();const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along)),bend=new T.Vector3(...hint).sub(a);bend.addScaledVector(dir,-bend.dot(dir)).normalize();aim(`${side}_UpperArm`,`${side}_Forearm`,a.clone().addScaledVector(dir,along).addScaledVector(bend,height).toArray());aim(`${side}_Forearm`,`${side}_Hand`,target);}
  for(const [side,sign] of [['L',1],['R',-1]]){const foot=bones[`${side}_Foot`].getWorldQuaternion(new T.Quaternion());aim(`${side}_Thigh`,`${side}_Calf`,[sign*13,91,43]);aim(`${side}_Calf`,`${side}_Foot`,[sign*13,51,49]);root.updateMatrixWorld(true);bones[`${side}_Foot`].quaternion.copy(bones[`${side}_Foot`].parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(foot));reach(side,[sign*19,104,32],[sign*38,114,6]);}
  const tracked=['Head','L_UpperArm','L_Forearm','R_UpperArm','R_Forearm'].map(name=>({bone:bones[name],rest:bones[name].quaternion.clone()}));
  // Inner hand reaches toward the folio, with a bent elbow and planted feet.
  reach(angel?'L':'R',[angel?34:-34,139,45],[angel?43:-43,123,8]);
  for(const a of tracked){a.gesture=a.bone.quaternion.clone();a.bone.quaternion.copy(a.rest);}
  // Fine accessories are attached in world-scaled head space, following the skeleton.
  const accessories=group(0,0,0,pivot);
  if(angel){const halo=mesh(new T.TorusGeometry(.37,.018,12,80),'gold',accessories);halo.rotation.x=Math.PI/2-.16;halo.position.y=.55;}
  else for(const side of [-1,1]){const g=new T.CylinderGeometry(.005,.065,.22,20,8);const p=g.attributes.position;for(let j=0;j<p.count;j++)p.setX(j,p.getX(j)+side*.07*((p.getY(j)+.11)/.22)**2);g.computeVertexNormals();const horn=mesh(g,'gold',accessories);horn.position.set(side*.20,.39,0);horn.rotation.z=-side*.16;}
  // Drapery wraps around the body, rather than presenting a flat rectangular sheet.
  const fabric=new T.PlaneGeometry(1,1,80,56),fp=fabric.attributes.position;
  for(let j=0;j<fp.count;j++){const theta=(fp.getX(j)+.5)*Math.PI*2,v=fp.getY(j)+.5,r=.49+.05*(1-v),fold=Math.sin(theta*20+v*3)*.024;fp.setXYZ(j,Math.sin(theta)*(r+fold),.12+1.04*v,Math.cos(theta)*(.27+fold)+.40+Math.sin(v*Math.PI)*.16);}
  fabric.computeVertexNormals();mesh(fabric,angel?'cloth':'wine',pivot).material.side=T.DoubleSide;
  const sash=new T.PlaneGeometry(1,1,72,40),sp=sash.attributes.position;
  for(let v=0;v<sp.count;v++){const angle=(sp.getX(v)+.5)*Math.PI*2,h=sp.getY(v)+.5,fold=Math.cos(angle*15+h*5)*.015;
   sp.setXYZ(v,Math.sin(angle)*(.38+fold),1.04+h*(.95+Math.sin(angle)*.12),Math.cos(angle)*(.245+fold)+.015);}
  sash.computeVertexNormals();mesh(sash,angel?'cloth':'wine',pivot).material.side=T.DoubleSide;
  actors.push({model,pivot,bones,tracked,accessories,angel});
 }
 return s=>{for(const a of actors){const amount=a.angel?s.agree:Math.max(s.approve,s.agree*.75);for(const j of a.tracked)j.bone.quaternion.copy(j.rest).slerp(j.gesture,amount);const head=a.tracked[0];head.bone.quaternion.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.sin(amount*Math.PI)*.10));root.updateMatrixWorld(true);a.accessories.position.copy(a.pivot.worldToLocal(a.bones.Head.getWorldPosition(new T.Vector3())));}};
}
