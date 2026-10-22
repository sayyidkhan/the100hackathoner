// The family strolls through the clear corridor between the two picture easels.
// Arc-length sampling keeps their pace even; the cosine turnaround slows them
// before they turn. Everything is derived from the gallery's pausable clock.
export const COASTAL_WALKERS = [
  { x: 3.03, z: 1.63, scale: .86, yaw: -.70, points: [[3.03,1.63],[2.30,1.65],[1.83,1.12],[1.88,.32],[1.95,-.52]] },
  { x: 2.49, z: 1.77, scale: .57, yaw: -.55, points: [[2.49,1.77],[2.05,1.50],[1.79,.90],[1.89,.10],[1.94,-.94]] },
];
export function createCoastalWalk(T, height) {
  const period = 34;
  const paths = COASTAL_WALKERS.map(walker => new T.CatmullRomCurve3(walker.points.map(([x,z]) => new T.Vector3(x,0,z))));
  paths.forEach(path => { path.arcLengthDivisions = 300; path.updateArcLengths(); });
  const lengths = paths.map(path => path.getLength());
  const wrap = angle => Math.atan2(Math.sin(angle),Math.cos(angle));
  return seconds => {
    const time = Number.isFinite(seconds) ? Math.max(0,seconds) : 0;
    const phase = time % period / period * Math.PI * 2;
    const progress = (1-Math.cos(phase))/2;
    const facingBack = (1-Math.tanh(Math.sin(phase)*6))/2;
    const entry = T.MathUtils.smoothstep(time,0,1.8);
    return paths.map((path,i) => {
      const walker = COASTAL_WALKERS[i];
      const p = path.getPointAt(progress), tangent = path.getTangentAt(progress);
      const heading = Math.atan2(tangent.x,tangent.z) + Math.PI*facingBack;
      const yaw = walker.yaw + wrap(heading-walker.yaw)*entry;
      const distance = (Math.floor(time/period)*2+(phase<=Math.PI?progress:2-progress))*lengths[i];
      const stride = Math.min(1,lengths[i]*Math.PI/period*Math.abs(Math.sin(phase))/.23)*entry;
      const gait = distance*15;
      // Cancel the rise caused by rotating both legs about the hip, keeping
      // the supporting boot at the map surface instead of making the body float.
      const hipDrop = .38*walker.scale*(1-Math.cos(Math.sin(gait)*.44*stride));
      return { x:p.x, y:height(p.x,p.z)+.015-hipDrop, z:p.z, yaw, gait, stride };
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
