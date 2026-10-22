// One shared curve drives both the drawn trail and the family's footsteps.
export const COASTAL_TRAIL = [[-1.35,-.29],[-.95,.20],[-.20,.34],[.45,.08],[.95,-.03],[1.35,.48],[1.42,1.01],[2.05,.70],[2.76,.62],[2.98,1.91]];
export const COASTAL_WALKERS = [{scale:.86},{scale:.57}];
export const COASTAL_ARRIVAL = 28;
export function createCoastalTrail(T) {
  return new T.CatmullRomCurve3(COASTAL_TRAIL.map(([x,z])=>new T.Vector3(x,0,z)));
}
export function coastalJourney(seconds) {
  const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
  const u=Math.min(1,time/COASTAL_ARRIVAL);
  // Ease into walking and decelerate at the destination; no teleporting loop.
  const progress=u*u*(3-2*u);
  const landed=time-COASTAL_ARRIVAL;
  const drop=Math.max(0,Math.min(1,landed/.85));
  const bounce=landed>.85&&landed<1.45 ? .10*Math.sin((landed-.85)/.60*Math.PI) : 0;
  return {progress,speed:6*u*(1-u)/COASTAL_ARRIVAL,arrived:landed>=0,
    pinScale:Math.min(1,Math.max(0,landed/.12)),pinHeight:1.8*(1-drop*drop)+bounce};
}
export function createCoastalWalk(T,height) {
  const path=createCoastalTrail(T),length=path.getLength();
  return seconds=>{
    const journey=coastalJourney(seconds);
    return COASTAL_WALKERS.map((walker,i)=>{
      // Adult leads, child follows on the same line with a half-metre gap.
      const start=i===0?.55:0, end=length-(i===0?.50:1.05);
      const distance=start+(end-start)*journey.progress;
      const at=1-distance/length;
      const p=path.getPointAt(at), tangent=path.getTangentAt(at);
      const yaw=Math.atan2(-tangent.x,-tangent.z);
      const gait=(distance-start)*15;
      const stride=Math.min(1,(end-start)*journey.speed/.23);
      const hipDrop=.38*walker.scale*(1-Math.cos(Math.sin(gait)*.44*stride));
      return {x:p.x,y:height(p.x,p.z)+.015-hipDrop,z:p.z,yaw,gait,stride};
    });
  };
}

// Small soft footprints follow the walkers over the actual folded surface.
// They replace baked silhouettes that would otherwise remain at the start point.
export function createWalkingShadows(T, root, height) {
  const n=48,pixels=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const r=Math.hypot((x/(n-1)-.5)*2,(y/(n-1)-.5)*2),at=(y*n+x)*4;
    pixels[at]=pixels[at+1]=pixels[at+2]=255;
    pixels[at+3]=Math.round(105*Math.exp(-r*r*4)*Math.max(0,1-r));
  }
  const texture=new T.DataTexture(pixels,n,n,T.RGBAFormat);
  texture.minFilter=texture.magFilter=T.LinearFilter;texture.needsUpdate=true;
  const material=new T.MeshBasicMaterial({color:0x392718,map:texture,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false});
  const shadows=COASTAL_WALKERS.map(walker=>{
    const geometry=new T.PlaneGeometry(.70*walker.scale,.60*walker.scale,12,10);
    geometry.rotateX(-Math.PI/2);
    const mesh=new T.Mesh(geometry,material);mesh.name='walking-contact-shadow';
    mesh.userData.noShadow=mesh.userData.noReceiveShadow=mesh.userData.noAO=true;
    mesh.frustumCulled=false;root.add(mesh);
    return {mesh,rest:new Float32Array(geometry.attributes.position.array)};
  });
  return poses=>shadows.forEach(({mesh,rest},index)=>{
    const pose=poses[index],positions=mesh.geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const dx=rest[i*3],dz=rest[i*3+2];
      const x=pose.x+Math.cos(pose.yaw)*dx+Math.sin(pose.yaw)*dz;
      const z=pose.z-Math.sin(pose.yaw)*dx+Math.cos(pose.yaw)*dz;
      positions.setXYZ(i,x,height(x,z)+.009,z);
    }
    positions.needsUpdate=true;
  });
}
