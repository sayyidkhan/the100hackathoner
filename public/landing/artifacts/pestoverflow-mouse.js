// A small field mouse: a continuous coat surface, thin cupped ears and articulated paws.
// The exhibit owns translation; this module only animates anatomy in local space.
export function pestMouse(T, kit) {
  const group = new T.Group();
  group.name = 'pestoverflow-field-mouse';
  kit.root.add(group);
  const materials = kit.materials ?? kit.m;
  const fur = new T.MeshStandardMaterial({ color: 0xffffff, roughness: .96, vertexColors: true });
  const skin = new T.MeshStandardMaterial({ color: 0xb98c78, roughness: .84 });
  const eyeMaterial = new T.MeshPhysicalMaterial({ color: 0x080908, roughness: .12, clearcoat: 1, clearcoatRoughness: .08 });
  const whiskerMaterial = new T.MeshStandardMaterial({ color: 0xc7ba9f, roughness: .7 });
  const earMaterial = new T.MeshStandardMaterial({ color: 0xffffff, roughness: .88, vertexColors: true, side: T.DoubleSide });
  Object.assign(materials, { mouseCoat: fur, mouseSkin: skin, mouseEye: eyeMaterial, mouseWhisker: whiskerMaterial, mouseEar: earMaterial });

  // Deterministic fine longitudinal fibres; the coat uses one draw call.
  const width = 512, height = 128, fibre = new Uint8Array(width * height * 4);
  let seed = 92841;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let y = 0; y < height; y++) {
    let value = random();
    for (let x = 0; x < width; x++) {
      value = value * .86 + random() * .14;
      const n = Math.round(145 + value * 80 + Math.sin(y * 2.32 + x * .12) * 22);
      const i = (y * width + x) * 4;
      fibre[i] = fibre[i + 1] = fibre[i + 2] = n; fibre[i + 3] = 255;
    }
  }
  const coatTexture = new T.DataTexture(fibre, width, height);
  coatTexture.wrapS = coatTexture.wrapT = T.RepeatWrapping;
  coatTexture.magFilter = T.LinearFilter;
  coatTexture.minFilter = T.LinearMipmapLinearFilter;
  coatTexture.generateMipmaps = true; coatTexture.needsUpdate = true;
  fur.bumpMap = coatTexture; fur.bumpScale = .0022;

  const mesh = (geometry, material, parent = group, name = '') => {
    const result = new T.Mesh(geometry, material);
    result.name = name; result.castShadow = result.receiveShadow = true;
    parent.add(result); return result;
  };
  const ellipsoid = (position, scale, material, parent = group, name = '') => {
    const result = mesh(new T.SphereGeometry(1, 24, 16), material, parent, name);
    result.position.set(...position); result.scale.set(...scale); return result;
  };
  function combine(geometries) {
    const positions = [], normals = [], indices = [];
    for (const g of geometries) {
      const p = g.attributes.position, n = g.attributes.normal, offset = positions.length / 3;
      positions.push(...p.array); normals.push(...n.array);
      for (let i = 0; i < g.index.count; i++) indices.push(g.index.array[i] + offset);
      g.dispose();
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
    g.setIndex(indices); return g;
  }
  const tube = (points, radius, segments = 20) => new T.TubeGeometry(
    new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), segments, radius, 6, false);

  // Rings describe one silhouette from rump to pointed muzzle, with no sphere seams.
  const profile = [
    [-.335, .142, .003, .003], [-.30, .15, .077, .071],
    [-.24, .167, .124, .119], [-.14, .168, .136, .130],
    [-.04, .158, .119, .108], [.055, .164, .096, .082],
    [.135, .185, .077, .074], [.205, .179, .068, .064],
    [.27, .156, .041, .039], [.335, .138, .019, .023], [.365, .135, .004, .008],
  ];
  const interpolate = x => {
    let i = 0;
    while (i < profile.length - 2 && x > profile[i + 1][0]) i++;
    const a = profile[i], b = profile[i + 1], before = profile[Math.max(0, i - 1)], after = profile[Math.min(profile.length - 1, i + 2)];
    const t = (x - a[0]) / (b[0] - a[0]), t2 = t * t, t3 = t2 * t;
    return [1, 2, 3].map(k => {
      const m0 = (b[k] - before[k]) / (b[0] - before[0]) * (b[0] - a[0]);
      const m1 = (after[k] - a[k]) / (after[0] - a[0]) * (b[0] - a[0]);
      return (2*t3 - 3*t2 + 1)*a[k] + (t3 - 2*t2 + t)*m0 + (-2*t3 + 3*t2)*b[k] + (t3 - t2)*m1;
    });
  };
  const bodyGeometry = new T.BufferGeometry(), positions = [], uvs = [], colors = [], indices = [];
  const back = new T.Color(0x4d4438), flank = new T.Color(0x8d8068), belly = new T.Color(0xb8aa8f);
  const rings = 88, sides = 48;
  for (let i = 0; i <= rings; i++) {
    const x = -.335 + .70 * i / rings, [centre, ry, rz] = interpolate(x);
    for (let j = 0; j <= sides; j++) {
      const angle = j / sides * Math.PI * 2, vertical = Math.cos(angle);
      const detail = 1 + .004 * Math.sin(j * 5.1 + i * 3.13);
      positions.push(x, centre + ry * vertical * detail, rz * Math.sin(angle) * detail);
      uvs.push(i / rings, j / sides);
      const color = vertical >= 0 ? flank.clone().lerp(back, vertical * .85) : flank.clone().lerp(belly, -vertical);
      color.multiplyScalar(.97 + .03 * Math.sin(i * 3.47 + j * 6.28));
      colors.push(color.r, color.g, color.b);
      if (i < rings && j < sides) {
        const a = i * (sides + 1) + j, b = a + sides + 1;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
  bodyGeometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  bodyGeometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
  bodyGeometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  bodyGeometry.setIndex(indices); bodyGeometry.computeVertexNormals();
  const body = mesh(bodyGeometry, fur, group, 'mouse-continuous-coat');
  const bodyRest = new Float32Array(positions);

  // A shallow bowl gives each ear a thin lip and a recessed warm inner membrane.
  const ears = [];
  for (const side of [-1, 1]) {
    const ear = new T.Group(); ear.name = `mouse-ear-${side}`;
    ear.position.set(.116, .243, side * .067);
    ear.rotation.x = side * .16; ear.rotation.y = -side * .25; group.add(ear);
    const p = [], c = [], ix = [], nRings = 10, nSides = 48;
    const inner = new T.Color(0xbe9683), outer = new T.Color(0x81735e);
    for (let r = 0; r <= nRings; r++) for (let j = 0; j <= nSides; j++) {
      const f = r / nRings, a = j / nSides * Math.PI * 2;
      p.push(Math.cos(a) * .051 * f, .032 + Math.sin(a) * .070 * f, side * (.014 * (1-f*f) + Math.sin(a)*.002));
      const col = inner.clone().lerp(outer, Math.pow(f, 7));
      c.push(col.r, col.g, col.b);
      if (r < nRings && j < nSides) {
        const a = r*(nSides+1)+j, b = a+nSides+1;
        ix.push(a,b,a+1,b,b+1,a+1);
      }
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(p,3)); g.setAttribute('color', new T.Float32BufferAttribute(c,3));
    g.setIndex(ix); g.computeVertexNormals(); mesh(g,earMaterial,ear,'mouse-ear-membrane');
    ears.push({ ear, rest: ear.rotation.clone() });
    ellipsoid([.228,.204,side*.051], [.018,.018,.011], eyeMaterial,group,`mouse-eye-${side}`);
  }
  ellipsoid([.366,.137,0], [.012,.008,.013], skin,group,'mouse-nose');
  const whiskers = [];
  for (const side of [-1,1]) for (let i = 0; i < 6; i++) {
    whiskers.push(tube([[.312,.143,side*.024],[.34+i*.002,.147+(i-2.5)*.005,side*.08],
      [.32+(i-2.5)*.022,.143+(i-2.5)*.011,side*(.125+i*.006)]], .0009, 12));
  }
  mesh(combine(whiskers),whiskerMaterial,group,'mouse-whiskers');

  // A tapered sweep is shared by the tail and each jointed limb.
  function sweep(points, radii, segments = 18, radial = 10) {
    const geometry = new T.BufferGeometry(), p = new Float32Array((segments+1)*(radial+1)*3), index = [];
    geometry.setAttribute('position',new T.BufferAttribute(p,3));
    for(let i=0;i<segments;i++)for(let j=0;j<radial;j++){
      const a=i*(radial+1)+j,b=a+radial+1; index.push(a,a+1,b,a+1,b+1,b);
    }
    geometry.setIndex(index);
    const update = values => {
      const curve = new T.CatmullRomCurve3(values.map(v=>new T.Vector3(...v)));
      const tangent = new T.Vector3(), normal = new T.Vector3(), binormal = new T.Vector3(), up = new T.Vector3(0,0,1);
      for(let i=0;i<=segments;i++){
        const t=i/segments, centre=curve.getPoint(t);
        tangent.copy(curve.getTangent(t)); normal.crossVectors(tangent,up).normalize(); binormal.crossVectors(tangent,normal).normalize();
        const f=t*(radii.length-1), ri=Math.min(radii.length-2,Math.floor(f)), radius=T.MathUtils.lerp(radii[ri],radii[ri+1],f-ri);
        for(let j=0;j<=radial;j++){
          const a=j/radial*Math.PI*2, k=(i*(radial+1)+j)*3;
          p[k]=centre.x+radius*(Math.cos(a)*normal.x+Math.sin(a)*binormal.x);
          p[k+1]=centre.y+radius*(Math.cos(a)*normal.y+Math.sin(a)*binormal.y);
          p[k+2]=centre.z+radius*(Math.cos(a)*normal.z+Math.sin(a)*binormal.z);
        }
      }
      geometry.attributes.position.needsUpdate=true; geometry.computeVertexNormals(); geometry.computeBoundingSphere();
    };
    update(points); return {geometry, update};
  }
  const tailPoints=[[-.31,.117,0],[-.41,.05,.013],[-.54,.019,.05],[-.68,.015,.10],[-.78,.014,.18]];
  const tail=sweep(tailPoints,[.016,.013,.009,.005,.001],38,10);
  mesh(tail.geometry,skin,group,'mouse-tapered-tail');
  const legs=[];
  for(const front of [false,true])for(const side of [-1,1]){
    const x=front?.155:-.205, z=side*(front?.071:.10), shoulder=[x-(front?.035:0),front?.113:.14,z*.78];
    const points=[shoulder,[x-.035,.067,z],[x,.020,z],[x+.015,.014,z]];
    const limb=sweep(points,front?[.020,.014,.008,.006]:[.037,.025,.012,.008]);
    mesh(limb.geometry,skin,group,`mouse-${front?'front':'hind'}-leg-${side}`);
    const paw=new T.Group(); paw.name=`mouse-${front?'front':'hind'}-paw-${side}`; group.add(paw);
    // Low toes with tiny pads make floor contact visible, including at rest.
    const toes=[];
    for(let j=-1;j<=1;j++)toes.push(tube([[0,.012,j*.007],[.025,.008,j*.010],[.045-Math.abs(j)*.006,.005,j*.011]],.0045,8));
    mesh(combine(toes),skin,paw,'mouse-toes');
    legs.push({front,side,x,z,shoulder,limb,paw,phase:(front?(side===1?0:.5):(side===1?.5:0))});
  }

  function animate(t, walking = false) {
    const amount = typeof walking === 'number' ? T.MathUtils.clamp(walking,0,1) : walking ? 1 : 0;
    // Breathing expands only the flanks; feet, skull and belly do not lift.
    const breath = Math.sin(t*2.7)*.006;
    const a=bodyGeometry.attributes.position;
    for(let i=0;i<a.count;i++){
      const x=bodyRest[i*3], weight=Math.exp(-Math.pow((x+.14)/.14,2));
      a.setXYZ(i,x,bodyRest[i*3+1]+Math.max(0,bodyRest[i*3+1]-.15)*breath*weight,bodyRest[i*3+2]*(1+breath*weight));
    }
    a.needsUpdate=true;
    for(const leg of legs){
      const phase=((t*2.4+leg.phase)%1+1)%1, stance=phase<.64;
      const swing=(phase-.64)/.36;
      const offset=amount*.055*(stance?.5-phase/.64:-.5+(3*swing*swing-2*swing*swing*swing));
      const lift=amount*(stance?0:Math.sin(swing*Math.PI)**2*.025);
      leg.paw.position.set(leg.x+offset,lift,leg.z);
      leg.paw.rotation.z=amount*(stance?0:-Math.sin(swing*Math.PI)*.16);
      leg.limb.update([leg.shoulder,[leg.x-.035+offset*.35,.067+lift*.5,leg.z],[leg.x+offset,.020+lift,leg.z],[leg.x+offset+.015,.014+lift,leg.z]]);
    }
    tail.update(tailPoints.map((p,i)=>[p[0],p[1],p[2]+Math.sin(t*3.4-i*.45)*amount*.014*(i/4)**2]));
    // Small ears track the sniffing head without continuous cartoon flapping.
    for(const {ear,rest} of ears){ear.rotation.copy(rest);ear.rotation.y+=Math.sin(t*2.7)*.012*amount;}
  }
  animate(0,false);
  group.userData = { species: 'field mouse', forwardAxis: '+X', pawFloor: 0, continuousCoat: true };
  return { group, animate };
}
