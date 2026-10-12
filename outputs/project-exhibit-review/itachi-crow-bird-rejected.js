// A jointed corvid sculpture: overlapping vanes, shaped flight feathers and a quiet glide.
// All movement lives below the returned group so exhibit placement is never overwritten.
export function createCrowBird(THREE) {
  const root = new THREE.Group();
  root.name = 'itachi-crow-sculpture';
  const flight = new THREE.Group(); root.add(flight);
  const featherMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: .68, metalness: .08, side: THREE.DoubleSide });
  const beakMaterial = new THREE.MeshStandardMaterial({ color: 0x11171e, roughness: .36, metalness: .24 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x05070b, roughness: .42 });
  const irisMaterial = new THREE.MeshStandardMaterial({ color: 0xc82635, emissive: 0x9d091f, emissiveIntensity: .52, roughness: .3 });
  const markingMaterial = new THREE.MeshBasicMaterial({ color: 0x09070b, side: THREE.DoubleSide });
  const glintMaterial = new THREE.MeshBasicMaterial({ color: 0xe7cdd0 });
  const V = (x,y,z) => new THREE.Vector3(x,y,z);
  const clamp = (n,a=0,b=1) => Math.max(a,Math.min(b,n));
  const smooth = n => { n=clamp(n); return n*n*(3-2*n); };
  const featherBase = new THREE.Color(0x252c36);
  let featherCount = 0;
  function mesh(geometry, material, parent) {
    const m = new THREE.Mesh(geometry, material); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  }
  // One batch for each articulated section, including the fine raised rachises.
  function batch() { return { p: [], c: [], i: [] }; }
  function vertex(b,p,color) { const n=b.p.length/3; b.p.push(p.x,p.y,p.z); b.c.push(color.r,color.g,color.b); return n; }
  function quad(b,a,c,d,e) { b.i.push(a,c,e,c,d,e); }
  function finish(b,parent,name) {
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));
    g.setIndex(b.i); g.computeVertexNormals(); g.computeBoundingSphere();
    const m=mesh(g,featherMaterial,parent); m.name=name; return m;
  }
  function feather(b,start,end,width,seed=0,options={}) {
    featherCount++;
    const a=V(...start), d=V(...end).sub(a), length=d.length();
    const normal=options.normal ? V(...options.normal).normalize() : V(0,1,0);
    const side=d.clone().cross(normal).normalize();
    if(side.lengthSq()<.01) side.set(1,0,0);
    const segments=options.segments || 14;
    const across=6, base=b.p.length/3;
    const bend=options.bend ?? .032, ridge=options.ridge ?? width*.13;
    const c=featherBase.clone().multiplyScalar(.91 + (Math.sin(seed*4.79)*.5+.5)*.22);
    function point(t,u) {
      const profile = Math.pow(Math.sin(Math.PI*Math.pow(t,.83)),.55) * (1-.18*t);
      const asymmetry = u<0 ? .85 : 1.10;
      const p=a.clone().addScaledVector(d,t).addScaledVector(side,u*width*.5*profile*asymmetry);
      p.addScaledVector(normal,Math.sin(t*Math.PI)*bend + ridge*profile*Math.pow(1-Math.abs(u),1.1));
      // A slightly swept, unbroken tip and scored feather barbs catch the key light.
      p.addScaledVector(side,Math.sin(t*Math.PI)*width*.05*Math.sin(seed));
      p.addScaledVector(normal,Math.sin(t*segments*2.2 + Math.abs(u)*4)*.0014*Math.abs(u)*profile);
      return p;
    }
    for(let j=0;j<=segments;j++) {
      const t=j/segments;
      for(let k=0;k<=across;k++) {
        const u=k/across*2-1;
        const color=c.clone().multiplyScalar(1 + (1-Math.abs(u))*.12 + t*.06);
        vertex(b,point(t,u),color);
      }
    }
    for(let j=0;j<segments;j++) for(let k=0;k<across;k++) {
      const n=base+j*(across+1)+k; quad(b,n,n+1,n+across+2,n+across+1);
    }
    // A narrow, raised central shaft is geometry, rather than a painted stripe.
    const shaftBase=b.p.length/3, shaftColor=c.clone().multiplyScalar(1.24);
    for(let j=0;j<=segments;j++) {
      const t=.08+j/segments*.84, p=point(t,0); p.addScaledVector(normal,.0018);
      const w=(1-t)*Math.min(.0045,width*.022)+.0006;
      vertex(b,p.clone().addScaledVector(side,-w),shaftColor);
      vertex(b,p.clone().addScaledVector(normal,.002),shaftColor);
      vertex(b,p.clone().addScaledVector(side,w),shaftColor);
    }
    for(let j=0;j<segments;j++) for(let k=0;k<2;k++) {
      const n=shaftBase+j*3+k; quad(b,n,n+1,n+4,n+3);
    }
    if(options.barbs) {
      for(let j=2;j<segments-1;j++) for(const sign of [-1,1]) {
        const t=j/segments, p=point(t,0), q=point(Math.min(.96,t+.037),sign*.82);
        p.addScaledVector(normal,.002); q.addScaledVector(normal,.002);
        const n=vertex(b,p,c.clone().multiplyScalar(1.19));
        vertex(b,q,c); vertex(b,q.clone().add(V(0,.0015,-.004)),c);
        b.i.push(n,n+1,n+2);
      }
    }
    return length;
  }
  // Longitudinal anatomy has an actual neck / breast transition and tapered rump.
  function anatomy(b,stations,seed=0) {
    const around=40, base=b.p.length/3;
    stations.forEach(([z,cy,rx,ry],j) => {
      for(let k=0;k<=around;k++) {
        const angle=k/around*Math.PI*2;
        const p=V(Math.cos(angle)*rx,cy+Math.sin(angle)*ry,z);
        const c=featherBase.clone().multiplyScalar(.97 + Math.max(0,Math.sin(angle))*.16 + Math.sin(j*1.3+k*.7+seed)*.026);
        vertex(b,p,c);
      }
    });
    for(let j=0;j<stations.length-1;j++) for(let k=0;k<around;k++) {
      const n=base+j*(around+1)+k; quad(b,n,n+1,n+around+2,n+around+1);
    }
  }
  const bodyBatch=batch();
  anatomy(bodyBatch,[[-.91,-.05,.01,.015],[-.75,-.04,.16,.12],[-.56,-.01,.27,.21],[-.3,.01,.335,.265],[0,.04,.345,.3],[.21,.09,.30,.28],[.39,.18,.235,.245],[.52,.26,.21,.24],[.65,.3,.16,.18]],2);
  // Mantle, scapulars and flank feathers overlap like scales down the body.
  for(let row=0;row<6;row++) for(let j=0;j<18;j++) {
    const ang=j/18*Math.PI*2, z=.37-row*.155;
    const r=.285-(row>3?(row-3)*.035:0), y=.05+Math.sin(ang)*r*.89;
    const x=Math.cos(ang)*r;
    feather(bodyBatch,[x,y,z],[x*.94,y-.015,z-.24],.09,100+row*18+j,{segments:7,bend:.013,ridge:.012,normal:[Math.cos(ang),Math.sin(ang),0]});
  }
  const breast=finish(bodyBatch,flight,'layered-mantle-and-breast');
  breast.scale.set(1.15,1.14,1.08);
  const head=new THREE.Group(); head.position.set(0,.28,.555); head.scale.setScalar(1.1); flight.add(head);
  const headBatch=batch();
  anatomy(headBatch,[[-.16,.005,.17,.155],[-.06,.055,.235,.21],[.08,.069,.25,.23],[.2,.055,.221,.208],[.29,.011,.156,.145],[.33,-.027,.101,.091]],5);
  for(let row=0;row<3;row++) for(let j=0;j<16;j++) {
    const angle=j/16*Math.PI*2, z=.2-row*.105;
    feather(headBatch,[Math.cos(angle)*.225,.055+Math.sin(angle)*.212,z],[Math.cos(angle)*.20,.055+Math.sin(angle)*.19,z-.12],.066,360+row*16+j,{segments:5,ridge:.006,bend:.008,normal:[Math.cos(angle),Math.sin(angle),0]});
  }
  finish(headBatch,head,'crown-and-nape-feathers');
  // Broad crow culmen: a gently curved upper bill, not a cone or a single spike.
  function bill(upper) {
    const stations=upper
      ? [[.25,-.017,.123,.071],[.38,-.017,.111,.068],[.51,-.034,.081,.044],[.67,-.07,.032,.015],[.73,-.087,.003,.003]]
      : [[.25,-.06,.115,.029],[.40,-.068,.095,.03],[.54,-.077,.061,.024],[.67,-.089,.025,.008],[.72,-.09,.002,.002]];
    const p=[],idx=[],a=20;
    stations.forEach(([z,cy,rx,ry])=>{for(let j=0;j<=a;j++){const t=j/a*Math.PI; p.push(Math.cos(t)*rx,cy+(upper?1:-1)*Math.sin(t)*ry,z);}});
    for(let j=0;j<stations.length-1;j++)for(let k=0;k<a;k++){const n=j*(a+1)+k;idx.push(n,n+1,n+a+1,n+1,n+a+2,n+a+1);}
    if(!upper) for(let j=0;j<idx.length;j+=3) [idx[j+1],idx[j+2]]=[idx[j+2],idx[j+1]];
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();
    return mesh(g,beakMaterial,head);
  }
  bill(true);bill(false);
  for(const sign of [-1,1]) {
    const nostril=mesh(new THREE.SphereGeometry(.017,12,8),ink,head);
    nostril.scale.set(.45,.65,1.5); nostril.position.set(sign*.098,.005,.382);
    const eye=new THREE.Group();eye.position.set(sign*.221,.087,.177);
    eye.quaternion.setFromUnitVectors(V(0,0,1),V(sign*.82,.2,.53).normalize());head.add(eye);
    const socket=mesh(new THREE.SphereGeometry(.061,24,12),ink,eye);socket.scale.set(1.13,.92,.36);
    const iris=mesh(new THREE.CircleGeometry(.047,36),irisMaterial,eye);iris.position.z=.022;
    const pupil=mesh(new THREE.CircleGeometry(.014,24),markingMaterial,eye);pupil.position.z=.025;
    const ring=mesh(new THREE.RingGeometry(.030,.032,40),markingMaterial,eye);ring.position.z=.024;
    const shape=new THREE.Shape();shape.moveTo(0,-.006);shape.bezierCurveTo(-.01,-.006,-.01,.007,-.001,.008);shape.bezierCurveTo(.007,.011,.014,.006,.014,.001);shape.bezierCurveTo(.008,.005,.008,-.006,0,-.006);
    for(let j=0;j<3;j++) {const t=j*Math.PI*2/3;const tomoe=mesh(new THREE.ShapeGeometry(shape,8),markingMaterial,eye);tomoe.position.set(Math.sin(t)*.029,Math.cos(t)*.029,.026);tomoe.rotation.z=-t;}
    const glint=mesh(new THREE.CircleGeometry(.0055,12),glintMaterial,eye);glint.position.set(-.012,.019,.027);
    eye.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;o.userData.noShadow=true;}});
  }
  const wings=[];
  for(const sign of [-1,1]) {
    const shoulder=new THREE.Group();shoulder.name=sign<0?'left-shoulder':'right-shoulder';
    shoulder.position.set(sign*.29,.17,-.02);shoulder.scale.set(sign*.86,1,1.18);flight.add(shoulder);
    const inner=batch();
    // Long overlapping secondaries run from the elbow to the trailing edge.
    for(let j=0;j<14;j++) {
      const t=j/13;
      feather(inner,[.10+t*1.32,.015+t*.065,.12-t*.04],[.35+t*1.35,-.015+t*.055,-.91-t*.13],.225,10+j,{segments:16,bend:.055,barbs:true});
      feather(inner,[.13+t*1.3,-.026+t*.065,.07],[.35+t*1.35,-.038+t*.055,-.87-t*.13],.21,30+j,{segments:10,bend:-.015});
    }
    // Three graduated coverts plus the short leading-edge row make a feathered airfoil.
    for(let row=0;row<4;row++)for(let j=0;j<20;j++) {
      const t=j/19, z=.14-row*.13;
      feather(inner,[.015+t*1.48,.058+t*.04+row*.005,z],[.13+t*1.5,.06+t*.032,z-.23-row*.065],.115+row*.027,60+row*20+j,{segments:8,bend:.022,ridge:.012});
    }
    // Underside coverts preserve a convincing silhouette when the user rotates it.
    for(let j=0;j<22;j++) {
      const t=j/21;
      feather(inner,[.05+t*1.43,-.042+t*.055,.04],[.16+t*1.43,-.06+t*.05,-.43],.135,190+j,{segments:7,bend:-.012,ridge:-.008});
    }
    finish(inner,shoulder,'layered-secondary-feathers');
    const wrist=new THREE.Group();wrist.position.set(1.42,.07,-.03);wrist.name='articulated-wrist';shoulder.add(wrist);
    const outer=batch();
    for(let j=9;j>=0;j--) {
      const t=j/9;
      const sx=.02+t*.24, sz=.15-t*.27;
      const ex=1.49-t*.74, ez=.01-t*1.24;
      feather(outer,[sx,.012,sz],[ex,.13-t*.09,ez],.235-t*.011,240+j,{segments:22,bend:.04,barbs:true});
      feather(outer,[sx,-.017,sz-.018],[ex-.035,.10-t*.09,ez+.025],.21,260+j,{segments:12,bend:.022});
    }
    for(let row=0;row<3;row++)for(let j=0;j<16;j++) {
      const t=j/15;
      feather(outer,[.03+t*.58,.042+row*.008,.19-t*.35-row*.072],[.3+t*.65,.085,.045-t*.55-row*.12],.108+row*.027,300+row*16+j,{segments:8,bend:.022,ridge:.011});
    }
    // The small thumb / alula covers the wrist joint on the leading edge.
    for(let j=0;j<5;j++)feather(outer,[-.13,.085,.16],[.33+j*.078,.13,.15-j*.052],.085,500+j,{segments:10,bend:.015});
    finish(outer,wrist,'separated-primary-flight-feathers');
    wings.push({ shoulder,wrist,sign });
  }
  const tail=new THREE.Group();tail.position.set(0,-.073,-.68);tail.scale.set(1.12,1.1,1.08);flight.add(tail);
  const tailBatch=batch();
  for(let j=0;j<12;j++) {
    const t=(j-5.5)/5.5;
    feather(tailBatch,[t*.12,0,-.02],[t*.46,-.14,-.91+Math.abs(t)*.20],.18,550+j,{segments:19,bend:.038,barbs:true});
  }
  for(let j=0;j<10;j++) {const t=(j-4.5)/4.5;feather(tailBatch,[t*.11,.024,.06],[t*.29,-.015,-.38],.12,575+j,{segments:9,bend:.02});}
  finish(tailBatch,tail,'twelve-feather-tail-fan');
  // Tucked ankles and curled toes form a small recognizable silhouette under the rump.
  function tube(points,r,parent,material=beakMaterial) {return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V(...p))),12,r,6,false),material,parent);}
  for(const sign of [-1,1]) {
    tube([[sign*.15,-.18,-.4],[sign*.20,-.29,-.51],[sign*.18,-.34,-.36]],.036,flight);
    for(let j=0;j<3;j++) {
      const x=sign*.18+(j-1)*.039;
      tube([[x,-.335,-.36],[x,-.36,-.22],[x,-.33,-.14],[x,-.298,-.19]],.012,flight);
    }
    tube([[sign*.18,-.33,-.37],[sign*.18,-.38,-.46],[sign*.18,-.36,-.50]],.012,flight);
  }
  function animate(time) {
    const t=((time%8)+8)%8;
    // Two deliberate strokes occupy the first half, then the wrist settles into a glide.
    let stroke=0, recovery=0;
    if(t<3.8) {
      const u=t/1.9, phase=(u%1)*Math.PI*2;
      const envelope=Math.sin(Math.min(1,t/.26)*Math.PI/2)*(1-smooth((t-3.3)/.5));
      stroke=Math.sin(phase)*envelope;
      recovery=Math.sin(phase-.42)*envelope;
    }
    for(const {shoulder,wrist,sign} of wings) {
      shoulder.rotation.z=sign*(.55 + stroke*.12);
      shoulder.rotation.x=.014+recovery*.025;
      shoulder.rotation.y=sign*(.005+Math.max(0,stroke)*.035);
      wrist.rotation.z=.085+recovery*.045;
      wrist.rotation.y=-.016+Math.max(0,-recovery)*.055;
      wrist.rotation.x=-.012+recovery*.026;
    }
    flight.position.y=Math.sin(t/8*Math.PI*2)*.035;
    flight.rotation.z=Math.sin(t/8*Math.PI*2)*.016;
    flight.rotation.x=Math.sin(t/8*Math.PI*2+.35)*.016;
    head.rotation.y=Math.sin(t/8*Math.PI*2)*.033;
    head.rotation.x=-.016+Math.sin(t/8*Math.PI*2)*.02;
    tail.rotation.x=.025+stroke*.036;
    tail.rotation.z=-Math.sin(t/8*Math.PI*2)*.026;
    irisMaterial.emissiveIntensity=.50+.11*smooth((t-4)/.8)*(1-smooth((t-6.7)/.7));
  }
  function setTheme(theme) {
    const dark=theme==='dark';
    featherMaterial.color.set(dark?0xeff3fb:0xffffff);
    featherMaterial.roughness=dark?.67:.70;
    featherMaterial.metalness=dark?.08:.06;
  }
  root.userData = { animate,setTheme, featherCount, animationDuration:8, conceptual:true };
  animate(0);setTheme('dark');
  return root;
}
