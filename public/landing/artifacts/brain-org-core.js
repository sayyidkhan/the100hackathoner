// A continuous, folded cortical surface; all detail belongs to the sculpture.
// The two closed hemispheres leave a real longitudinal fissure between them.
export function createBrainCore(THREE) {
  const root = new THREE.Group();
  root.name = 'sculpted-organizational-brain';
  // Animate the sculpture inside its mount, never the exhibit's root transform.
  const sculpture = new THREE.Group();
  sculpture.name = 'responsive-cortex';
  root.add(sculpture);
  const cortex = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, vertexColors: true, metalness: .14, roughness: .40,
    clearcoat: .22, clearcoatRoughness: .32,
  });
  const inner = new THREE.MeshStandardMaterial({ color: 0x071746, metalness: .18, roughness: .5 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd8b779, metalness: .82, roughness: .26 });
  const signal = new THREE.MeshBasicMaterial({ color: 0xb7f4ff, toneMapped: false });
  const colorLow = new THREE.Color(0x102766), colorHigh = new THREE.Color(0x2256c4);
  const tempColor = new THREE.Color();

  // Domain-warped bands make branching gyri, with narrow sulci carved INTO
  // the mesh rather than tubes hovering over an otherwise smooth sphere.
  function relief(x, y, z, side) {
    const a = 13.8 * (y + .23*z) + 2.25 * Math.sin(5.7*z + 3.6*x)
      + 1.55 * Math.sin(6.7*x - 4.1*z + side*.7);
    const b = 14.3 * (z - .12*x) + 2.30 * Math.sin(6.0*y - 4.2*x)
      + 1.05 * Math.sin(8.2*x + 3.3*y);
    const direction = .5 + .5 * Math.sin(2.7*x + 3.5*y - 2.0*z + .4);
    const wave = Math.sin(a + Math.sin(b)*1.6);
    const crossing = Math.sin(b + Math.cos(a*.46)*1.2);
    const crease = Math.abs(wave*.83 + crossing*.17);
    const groove = Math.exp(-Math.pow(crease/.32, 2));
    const secondary = Math.exp(-Math.pow(Math.abs(crossing)/.12, 2)) * (.26 + .18*direction);
    const h = .084 * Math.sqrt(crease*crease + .055) - .052 - .009 * secondary;
    return { h, light: Math.max(0, 1 - groove*.78 - secondary*.24) };
  }

  function surface(theta, phi, side, detailed = true) {
    const nx = Math.cos(theta), ny = Math.sin(theta)*Math.cos(phi), nz = Math.sin(theta)*Math.sin(phi);
    // A broad frontal lobe, rounded crown, and undercut temporal region.
    const width = .812 * (1 + .055*nz - .07*Math.max(0,-ny));
    const x = side * (.025 + width*nx);
    const y = .035 + .558*ny + .048*(1-ny*ny) - .026*nz;
    const z = .600*nz + .035*(1-nz*nz);
    const r = relief(nx, ny, nz, side);
    const n = new THREE.Vector3(side*nx/width, ny/.558, nz/.6).normalize();
    // Soften relief toward the seam to keep the central fissure crisp.
    const edge = Math.min(1, nx*7);
    const displacement = detailed ? r.h * (.42+.58*edge) : 0;
    return { point: new THREE.Vector3(x,y,z).addScaledVector(n,displacement), light:r.light, normal:n };
  }

  const radialSegments = 104, perimeterSegments = 224;
  for (const side of [-1,1]) {
    const positions=[], colors=[], indices=[];
    for(let i=0;i<=radialSegments;i++) {
      const theta = i/radialSegments * Math.PI/2;
      for(let j=0;j<=perimeterSegments;j++) {
        const {point,light}=surface(theta,j/perimeterSegments*Math.PI*2,side);
        positions.push(point.x,point.y,point.z);
        tempColor.copy(colorLow).lerp(colorHigh,.28+light*.72);
        colors.push(tempColor.r,tempColor.g,tempColor.b);
      }
    }
    for(let i=0;i<radialSegments;i++)for(let j=0;j<perimeterSegments;j++) {
      const a=i*(perimeterSegments+1)+j,b=a+perimeterSegments+1;
      if(side>0)indices.push(a,b,a+1,b,b+1,a+1);
      else indices.push(a,a+1,b,b,a+1,b+1);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();
    const hemisphere=new THREE.Mesh(geometry,cortex);hemisphere.name=side<0?'left-cerebral-hemisphere':'right-cerebral-hemisphere';
    hemisphere.castShadow=hemisphere.receiveShadow=true;sculpture.add(hemisphere);

    // Close the inner wall, retaining the visible dark fissure from all angles.
    const capPositions=[side*.025,.06,.025],capIndices=[];
    for(let j=0;j<=perimeterSegments;j++) {
      const p=surface(Math.PI/2,j/perimeterSegments*Math.PI*2,side).point;
      capPositions.push(p.x,p.y,p.z);
      if(j<perimeterSegments) {
        if(side>0)capIndices.push(0,j+2,j+1);else capIndices.push(0,j+1,j+2);
      }
    }
    const capGeometry=new THREE.BufferGeometry();capGeometry.setAttribute('position',new THREE.Float32BufferAttribute(capPositions,3));
    capGeometry.setIndex(capIndices);capGeometry.computeVertexNormals();
    const cap=new THREE.Mesh(capGeometry,inner);cap.castShadow=cap.receiveShadow=true;sculpture.add(cap);
  }

  // Compact medulla and cerebellum complete the silhouette from rear/underside.
  const stemGeometry=new THREE.CylinderGeometry(.10,.065,.30,24,8);
  const stemPositions=stemGeometry.attributes.position;
  for(let i=0;i<stemPositions.count;i++) {
    const y=stemPositions.getY(i),t=(y+.15)/.3;
    stemPositions.setXYZ(i,stemPositions.getX(i),y-.545,stemPositions.getZ(i)-.15-.05*(1-t));
  }
  const stemColors=new Float32Array(stemPositions.count*3);
  for(let i=0;i<stemPositions.count;i++)colorLow.toArray(stemColors,i*3);
  stemGeometry.setAttribute('color',new THREE.BufferAttribute(stemColors,3));stemGeometry.computeVertexNormals();
  const stem=new THREE.Mesh(stemGeometry,cortex);stem.castShadow=stem.receiveShadow=true;sculpture.add(stem);
  const cerebellumGeometry=new THREE.SphereGeometry(1,64,48);
  const cerebellumPositions=cerebellumGeometry.attributes.position,cerebellumColors=[];
  for(let i=0;i<cerebellumPositions.count;i++) {
    const x=cerebellumPositions.getX(i),y=cerebellumPositions.getY(i),z=cerebellumPositions.getZ(i);
    const fold=1-.035*(.5+.5*Math.cos(54*y+4*x));
    cerebellumPositions.setXYZ(i,x*.34*fold,y*.22*fold-.37,z*.28*fold-.31);
    tempColor.copy(colorLow).lerp(colorHigh,.34+.12*fold);cerebellumColors.push(tempColor.r,tempColor.g,tempColor.b);
  }
  cerebellumGeometry.setAttribute('color',new THREE.Float32BufferAttribute(cerebellumColors,3));cerebellumGeometry.computeVertexNormals();
  const cerebellum=new THREE.Mesh(cerebellumGeometry,cortex);cerebellum.castShadow=cerebellum.receiveShadow=true;sculpture.add(cerebellum);

  // A few tiny brass cortical contacts bring the sculpture into the AI exhibit.
  // Contacts and travelling impulse trails share instanced geometry.
  const contacts=[[-1,.70,.72],[-1,1.02,1.60],[-1,.91,5.75],[1,.66,.25],[1,1.14,1.35],[1,1.05,5.25],[1,.88,2.7],[-1,1.16,3.42]];
  const nodeGeometry=new THREE.SphereGeometry(.028,14,10);
  const nodes=new THREE.InstancedMesh(nodeGeometry,brass,contacts.length);
  const pulseGeometry=new THREE.SphereGeometry(.024,10,8);
  const pulses=new THREE.InstancedMesh(pulseGeometry,signal,contacts.length);
  const dummy=new THREE.Object3D(),nodePositions=[];
  contacts.forEach(([side,theta,phi],i)=>{
    const sample=surface(theta,phi,side),p=sample.point.addScaledVector(sample.normal,.007);
    dummy.position.copy(p);dummy.scale.setScalar(1);dummy.updateMatrix();nodes.setMatrixAt(i,dummy.matrix);
    nodePositions.push(p.clone().addScaledVector(sample.normal,.024));
  });
  nodes.castShadow=nodes.receiveShadow=true;sculpture.add(nodes,pulses);

  // Dense surface samples keep the light in contact with the folds. These are
  // neural impulses travelling across the cortex, not loose orbiting particles.
  const traceMaterial=new THREE.MeshBasicMaterial({
    color:0x50cafa,transparent:true,opacity:0,depthWrite:false,toneMapped:false,
  });
  const neuralPaths=[],samplesPerPath=128,trailLength=7;
  for(let i=0;i<8;i++) {
    const side=i<4?-1:1,route=i%4,points=[];
    for(let j=0;j<=samplesPerPath;j++) {
      const u=j/samplesPerPath;
      const theta=.26+u*1.15;
      const phi=route*Math.PI/2+.24+.64*Math.sin(u*Math.PI*1.35+route*.55);
      const sample=surface(theta,phi,side);
      points.push(sample.point.addScaledVector(sample.normal,.018));
    }
    neuralPaths.push(points);
    const curve=new THREE.CatmullRomCurve3(points);
    const trace=new THREE.Mesh(new THREE.TubeGeometry(curve,128,.0045,4,false),traceMaterial);
    trace.name=`cortical-signal-path-${i+1}`;
    sculpture.add(trace);
  }
  const impulses=new THREE.InstancedMesh(pulseGeometry,signal,neuralPaths.length*trailLength);
  impulses.name='travelling-neural-impulses';
  impulses.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  impulses.frustumCulled=false;
  sculpture.add(impulses);

  // A single scan halo blooms out from the mount at the decision moment. The
  // second, broken arc reads as a spatial instrument rather than a solid disc.
  const haloMaterial=new THREE.MeshBasicMaterial({
    color:0x55d7ff,transparent:true,opacity:0,depthWrite:false,toneMapped:false,
    blending:THREE.AdditiveBlending,
  });
  const scanHalo=new THREE.Mesh(new THREE.TorusGeometry(.99,.009,6,96),haloMaterial);
  scanHalo.name='decision-scan-halo';
  scanHalo.rotation.x=Math.PI/2;
  scanHalo.position.y=-.49;
  scanHalo.scale.set(1,.74,1);
  root.add(scanHalo);
  const arcMaterial=haloMaterial.clone();
  const scanArc=new THREE.Mesh(new THREE.TorusGeometry(1.065,.016,6,64,Math.PI*1.25),arcMaterial);
  scanArc.name='neural-activation-arc';
  scanArc.rotation.set(Math.PI/2,0,0);
  scanArc.position.y=-.45;
  scanArc.scale.set(1,.74,1);
  root.add(scanArc);

  const clamp=value=>Math.min(1,Math.max(0,value));
  const smooth=value=>{const u=clamp(value);return u*u*(3-2*u);};
  const cyan=new THREE.Color(0xb7f4ff),mint=new THREE.Color(0xa8ffe1);
  let darkTheme=false,lastActivation=0,lastBreakthrough=0;
  const applyTheme=()=>{
    cortex.roughness=darkTheme?.37:.41;
    cortex.emissive.setHex(darkTheme?0x164abe:0x143ca0);
    cortex.emissiveIntensity=lastActivation*(darkTheme?.19:.08)+lastBreakthrough*.12;
    traceMaterial.opacity=lastActivation*(darkTheme?.29:.20);
  };
  root.userData.animate=(elapsed,state={})=>{
    const t=Math.max(0,Number.isFinite(elapsed)?elapsed:0);
    const phase=Number.isFinite(state.phase)?((state.phase%16)+16)%16:t%16;
    const waking=smooth((phase-2.8)/2.6);
    const settling=1-smooth((phase-14.3)/1.7);
    const activation=clamp(Number.isFinite(state.activation)?state.activation:waking*settling);
    const solved=clamp(Number.isFinite(state.solved)?state.solved:smooth((phase-11.8)/1.2)*settling);
    const breakthrough=Math.sin(Math.PI*clamp((phase-5.1)/1.7));
    const celebration=Math.sin(Math.PI*clamp((phase-12.5)/1.8));
    const breath=Math.sin(phase*Math.PI/8);
    sculpture.position.y=activation*(.025+.024*breath)+.03*breakthrough;
    sculpture.rotation.set(-.024*activation*Math.sin(phase*.65),.045*activation*Math.sin(phase*.55),.018*activation*breath);
    sculpture.scale.setScalar(1+.019*activation+.016*breakthrough);
    lastActivation=activation;lastBreakthrough=breakthrough;applyTheme();
    signal.color.copy(cyan).lerp(mint,solved*.65);
    nodePositions.forEach((p,i)=>{
      const pulse=Math.pow(.5+.5*Math.sin(phase*2.5-i*.74),3);
      dummy.position.copy(p);dummy.scale.setScalar(.24+activation*(.44+.66*pulse)+breakthrough*.32);
      dummy.updateMatrix();pulses.setMatrixAt(i,dummy.matrix);
    });
    pulses.instanceMatrix.needsUpdate=true;
    for(let i=0;i<neuralPaths.length;i++) {
      // Staggered bursts flow from the outer lobes towards the central fissure.
      const travel=((phase*(.37+activation*.16)-i*.137)%1+1)%1;
      const path=neuralPaths[i];
      for(let j=0;j<trailLength;j++) {
        const u=travel-j*.026;
        const shown=u>=0&&u<=1;
        const sample=clamp(u)*samplesPerPath;
        const index=Math.min(samplesPerPath-1,Math.floor(sample));
        dummy.position.copy(path[index]).lerp(path[index+1],sample-index);
        const taper=(1-j/trailLength);
        const edge=smooth(u/.06)*(1-smooth((u-.93)/.07));
        dummy.scale.setScalar(shown?activation*edge*(.45+taper*.55):0);
        dummy.updateMatrix();impulses.setMatrixAt(i*trailLength+j,dummy.matrix);
      }
    }
    impulses.instanceMatrix.needsUpdate=true;
    impulses.visible=activation>.001;
    const expanding=smooth((phase-4.5)/1.7);
    const haloFade=1-smooth((phase-6.7)/1.5);
    const haloStrength=activation*(.14+.65*haloFade)+celebration*.28;
    const radius=.84+expanding*.22+celebration*.035;
    scanHalo.scale.set(radius,radius*.74,1);
    scanHalo.position.y=-.49+.11*breakthrough;
    haloMaterial.opacity=haloStrength;
    arcMaterial.opacity=activation*.46+breakthrough*.24;
    scanArc.rotation.z=.10*activation*Math.sin(phase*.4);
    scanArc.scale.set(.96+.065*breakthrough,(.96+.065*breakthrough)*.74,1);
  };
  root.userData.setTheme=theme=>{
    darkTheme=theme==='dark';applyTheme();
  };
  root.userData.animate(0);root.userData.setTheme('light');
  return root;
}
