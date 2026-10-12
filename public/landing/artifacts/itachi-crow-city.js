// A carved waterfront city: districts follow the hill and canal, rather than a grid.
export function createCrowCity(THREE) {
  const root = new THREE.Group();
  root.name = 'Itachi waterfront miniature';
  const masonryHeightScale = 1.20;
  const palette = {
    stone: [0xeadfcb, .79, .04], light: [0xfff2db, .74, .02],
    cut: [0xcaba9c, .87, .01], roof: [0xd7c6a8, .82, .04],
    shadow: [0x514c43, .91, 0], brass: [0xb29863, .45, .54],
    foliage: [0x4e614b, .91, 0], red: [0xa82b28, .48, .12],
    glass: [0xc4a779, .49, .15], lantern: [0xffd79a, .38, .18], water: [0x0f3f6d, .3, .3],
  };
  const materials = Object.fromEntries(Object.entries(palette).map(([key, [color, roughness, metalness]]) => [key,
    new THREE.MeshStandardMaterial({ color, roughness, metalness })]));
  materials.glass.emissive.setHex(0xffb45a);
  materials.glass.emissiveIntensity = .08;
  materials.lantern.emissive.setHex(0xffb85b);
  materials.lantern.emissiveIntensity = .15;
  // Fine, quiet stone grain adds a tactile edge without changing the ivory palette.
  const grainSize=128,grainPixels=new Uint8Array(grainSize*grainSize*4);
  let grainSeed=1731;
  for(let i=0;i<grainSize*grainSize;i++) {
    grainSeed=(Math.imul(grainSeed,1664525)+1013904223)>>>0;
    const value=116+(grainSeed>>>26);
    grainPixels[i*4]=grainPixels[i*4+1]=grainPixels[i*4+2]=value;grainPixels[i*4+3]=255;
  }
  const stoneGrain=new THREE.DataTexture(grainPixels,grainSize,grainSize,THREE.RGBAFormat);
  stoneGrain.wrapS=stoneGrain.wrapT=THREE.RepeatWrapping;
  stoneGrain.magFilter=THREE.LinearFilter;stoneGrain.minFilter=THREE.LinearMipmapLinearFilter;
  stoneGrain.generateMipmaps=true;stoneGrain.needsUpdate=true;
  for(const key of ['stone','light','cut','roof']) {materials[key].bumpMap=stoneGrain;materials[key].bumpScale=.004;}
  const lanternPositions = [];
  const batches = new Map();
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const position = new THREE.Vector3();
  const unitScale = new THREE.Vector3(1, 1, 1);
  function add(geometry, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, applyRelief = true) {
    const source = geometry.index ? geometry.toNonIndexed() : geometry;
    rotation.setFromEuler(euler.set(rx, ry, rz));
    matrix.compose(position.set(x, y, z), rotation, unitScale);
    source.applyMatrix4(matrix);
    if(applyRelief) source.scale(1,masonryHeightScale,1);
    if (!batches.has(material)) batches.set(material, { position: [], normal: [], uv: [] });
    const batch = batches.get(material);
    for (const value of source.attributes.position.array) batch.position.push(value);
    for (const value of source.attributes.normal.array) batch.normal.push(value);
    const pp=source.attributes.position,nn=source.attributes.normal;
    for(let i=0;i<pp.count;i++) {
      const nx=Math.abs(nn.getX(i)),ny=Math.abs(nn.getY(i)),nz=Math.abs(nn.getZ(i));
      if(ny>nx&&ny>nz) batch.uv.push(pp.getX(i)*1.9,pp.getZ(i)*1.9);
      else if(nx>nz) batch.uv.push(pp.getZ(i)*1.9,pp.getY(i)*1.9);
      else batch.uv.push(pp.getX(i)*1.9,pp.getY(i)*1.9);
    }
    if (source !== geometry) source.dispose();
    geometry.dispose();
  }
  const box = (w, h, d, x, y, z, mat = 'stone', ry = 0) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, 0, ry);
  const cylinder = (r, h, x, y, z, mat = 'stone', rTop = r, segments = 12) =>
    add(new THREE.CylinderGeometry(rTop, r, h, segments), mat, x, y, z);
  const sphere = (r, x, y, z, mat = 'foliage', sx = 1, sy = 1, sz = 1) => {
    const geometry = new THREE.SphereGeometry(r, 8, 6); geometry.scale(sx, sy, sz); add(geometry, mat, x, y, z);
  };
  function path(points, radius, material = 'brass', segments = 64) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    add(new THREE.TubeGeometry(curve, segments, radius, 5, false), material);
    return curve;
  }
  function land(outline, height, y = 0, mat = 'stone') {
    const shape = new THREE.Shape();
    outline.forEach(([x, z], i) => i ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 3 });
    geometry.rotateX(-Math.PI / 2);
    add(geometry, mat, 0, y, 0);
  }
  // A true arch cut through the stone; the open profile reaches the ground.
  function arch(w, h, depth, opening, spring, x, y, z, mat = 'stone', ry = 0) {
    const shape = new THREE.Shape();
    const r = opening / 2;
    shape.moveTo(-w / 2, 0); shape.lineTo(-w / 2, h);
    shape.lineTo(w / 2, h); shape.lineTo(w / 2, 0);
    shape.lineTo(r, 0); shape.lineTo(r, spring);
    shape.absarc(0, spring, r, 0, Math.PI, false);
    shape.lineTo(-r, 0); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8 });
    geometry.translate(0, 0, -depth / 2);
    add(geometry, mat, x, y, z, 0, ry);
  }

  // Two asymmetric islands leave an exposed, winding blue channel through the model.
  land([[-.04, 2.19], [-.61, 2.12], [-1.18, 1.89], [-1.72, 1.49], [-2.08, 1], [-2.3, .32], [-2.28, -.42], [-1.97, -1.17], [-1.45, -1.8], [-.82, -2.08], [-.17, -2.17], [.36, -1.98], [.66, -1.61], [.55, -1.11], [.3, -.69], [.21, -.14], [.27, .37], [.17, .88], [.22, 1.38]], .095);
  land([[.79, 1.98], [1.37, 1.71], [1.87, 1.23], [2.17, .64], [2.29, -.07], [2.16, -.74], [1.74, -1.4], [1.24, -1.82], [.91, -1.66], [.84, -1.1], [.66, -.66], [.64, -.11], [.74, .43], [.67, .94]], .09);
  land([[-2.12, -.16], [-1.96, -.93], [-1.4, -1.62], [-.7, -1.9], [.19, -1.77], [.39, -1.29], [.07, -.62], [-.48, -.33], [-1.36, -.05]], .17, .095, 'cut');
  land([[-1.83, -.62], [-1.39, -1.47], [-.88, -1.71], [-.4, -1.55], [-.43, -.84], [-.88, -.51]], .19, .265);
  // Successively narrower terraces make the summit legible from a distance.
  land([[-1.66,-.69],[-1.55,-1.30],[-1.16,-1.57],[-.73,-1.40],[-.60,-.97],[-.83,-.66]], .145, .455, 'cut');
  land([[-1.49,-.79],[-1.41,-1.25],[-1.16,-1.41],[-.86,-1.27],[-.77,-.97],[-.95,-.77]], .10, .60, 'stone');
  // Blocks in the retaining walls give the layered hill a legible scale.
  for (let i = 0; i < 15; i++) {
    box(.102, .034, .025, -1.96 + i * .127, .195, -.038 - Math.sin(i * .2) * .16, 'stone');
  }
  for (let i = 0; i < 11; i++) box(.085, .025, .018, -1.62 + i * .107, .38, -.535 - Math.sin(i * .22) * .048, 'light');

  let buildingCount = 0;
  // Small front and side reveals keep the windows recessed under their lintels.
  function house(x, z, w, d, h, y = .095, variant = 0) {
    buildingCount++;
    const material = variant % 4 === 0 ? 'light' : 'stone';
    if(h>.67) {
      // Narrow fluted monoliths and setbacks create the artwork's vertical city rhythm.
      const shaft=h-.115;
      box(w*.92,shaft,d*.92,x,y+shaft/2,z,material);
      box(w+.024,.065,d+.024,x,y+.032,z,'cut');
      box(w+.032,.025,d+.032,x,y+.077,z,'light');
      for(const side of [-1,1]) {
        const xx=x+side*w*.34;
        box(.019,shaft-.08,.014,xx,y+shaft/2+.015,z+d*.467,'light');
        box(.019,shaft-.08,.014,xx,y+shaft/2+.015,z-d*.467,'light');
        box(.014,shaft-.08,.019,x+w*.467,y+shaft/2+.015,z+side*d*.34,'light');
        box(.016,shaft*.72,.006,x+side*w*.18,y+shaft*.53,z+d*.466,'cut');
        box(.006,shaft*.72,.016,x+w*.466,y+shaft*.53,z+side*d*.18,'cut');
      }
      for(let level=0;level<3;level++) {
        const yy=y+.19+level*(shaft-.25)/3;
        box(.023,.042,.005,x,y+Math.min(shaft-.04,yy-y),z+d*.468,'shadow');
      }
      box(w*.96,.045,d*.96,x,y+shaft+.02,z,'light');
      box(w*.73,.052,d*.72,x,y+shaft+.064,z,material);
      box(w*.50,.028,d*.48,x,y+h-.01,z,'light');
      if(variant%3===0)box(w*.26,.04,d*.26,x,y+h+.022,z,'roof');
      return;
    }
    box(w, h, d, x, y + h / 2, z, material);
    box(w + .025, .033, d + .025, x, y + .035, z, 'cut');
    box(w + .026, .025, d + .026, x, y + h - .008, z, 'light');
    const roofY = y + h + .018;
    box(w - .026, .017, d - .026, x, roofY, z, 'roof');
    // Four slender parapets, with clear recessed roof courtyards.
    box(w + .019, .047, .023, x, roofY + .018, z + d / 2, material);
    box(w + .019, .047, .023, x, roofY + .018, z - d / 2, material);
    box(.023, .047, d, x - w / 2, roofY + .018, z, material);
    box(.023, .047, d, x + w / 2, roofY + .018, z, material);
    const columns = Math.max(1, Math.floor(w / .115));
    const levels = Math.max(1, Math.floor((h - .07) / .135));
    for (let row = 0; row < levels; row++) {
      for (let col = 0; col < columns; col++) {
        const xx = x + (col - (columns - 1) / 2) * (w / (columns + .45));
        const yy = y + .1 + row * ((h - .135) / Math.max(levels - 1, 1));
        const ww = Math.min(.04, w * .19), hh = Math.min(.065, h * .23);
        box(ww + .014, hh + .017, .005, xx, yy, z + d / 2 + .003, 'cut');
        box(ww, hh, .006, xx, yy + .004, z + d / 2 + .006, (row + col + variant) % 4 ? 'shadow' : 'glass');
        box(ww + .024, .01, .02, xx, yy + hh / 2 + .01, z + d / 2 + .008, 'light');
      }
      const sideCount = d > .28 ? 2 : 1;
      for (let col = 0; col < sideCount; col++) {
        const zz = z + (col - (sideCount - 1) / 2) * d / 2.3;
        const yy = y + .1 + row * ((h - .135) / Math.max(levels - 1, 1));
        box(.005, .062, .034, x + w / 2 + .003, yy, zz, (variant + row) % 5 ? 'cut' : 'glass');
      }
    }
    if (variant % 3 === 0) {
      // A sun shelter on some roofs, never every building.
      box(w * .45, .016, d * .43, x - w * .13, roofY + .067, z - d * .12, 'light');
      for (const dx of [-1, 1]) for (const dz of [-1, 1]) box(.014, .055, .014, x - w * .13 + dx * w * .18, roofY + .032, z - d * .12 + dz * d * .16, 'cut');
    } else if (variant % 3 === 1) {
      box(.045, .07, .055, x - w * .24, roofY + .04, z - d * .2, 'light');
    }
  }

  // Waterfront: low tightly packed houses frame an open procession towards the hill.
  const houses = [
    [-.38,1.82,.23,.25,.27,0],[-.76,1.76,.28,.28,.55,1],[-1.1,1.58,.27,.31,1.08,2],[-1.41,1.37,.3,.31,.34,0],[-1.73,1.01,.28,.28,.82,3],[-1.97,.63,.25,.29,.49,1],
    [-.68,1.33,.29,.29,.76,4],[-1.06,1.16,.27,.31,.46,2],[-1.42,.94,.28,.28,1.13,3],[-1.75,.55,.3,.32,.64,5],[-2.03,.18,.2,.26,.28,1],
    [-.03,1.16,.25,.32,.29,2],[-.23,.71,.26,.3,.42,4],[-.77,.79,.3,.27,.63,3],[-1.12,.68,.28,.3,.82,5],[-1.47,.5,.24,.3,1.04,2],
    [-.8,.3,.26,.26,.45,0],[-1.14,.2,.28,.28,.72,1],[-1.7,.12,.3,.26,.33,2],[-.23,.18,.23,.27,.34,3],
    [.92,1.55,.28,.27,.26,1],[1.27,1.43,.27,.26,.29,4],[1.61,1.13,.25,.27,.34,2],[1.88,.79,.25,.31,.28,5],[2.04,.37,.22,.3,.35,3],
    [.98,1.05,.27,.27,.34,2],[1.35,.92,.29,.31,.44,1],[1.62,.63,.25,.29,.43,4],[1.95,-.05,.26,.3,.78,2],
    [.88,.39,.24,.26,.35,3],[1.22,.32,.29,.29,.96,1],[1.59,.17,.27,.28,.47,0],
    [.93,-.11,.26,.28,.4,1],[1.38,-.2,.28,.3,.66,3],[1.89,-.46,.22,.26,.94,5],
    [.93,-.56,.25,.25,.33,4],[1.28,-.66,.28,.28,1.37,2],[1.69,-.81,.24,.3,.84,1],
    [1.11,-1.2,.28,.32,.45,2],[1.45,-1.19,.25,.31,1.06,1],[1.24,-1.55,.23,.22,.31,3],
  ];
  // Leave the waterfront square open, so the bridge has somewhere to arrive.
  houses.filter(([x,z]) => !(x > .8 && x < 1.7 && z > .87 && z < 1.72))
    .forEach(([x,z,w,d,h,v]) => house(x,z,w,d,h,.095,v));
  const hillHouses = [
    [-1.97,-.35,.23,.27,.35,1],[-1.72,-.39,.22,.27,.71,2],[-1.55,-.72,.22,.26,.38,0],[-1.71,-1.0,.23,.25,.35,3],
    [-.22,-.36,.25,.27,.32,4],[.03,-.75,.24,.28,.37,3],[.27,-1.19,.24,.31,.4,1],[.1,-1.55,.25,.29,.66,0],
    [-.21,-1.72,.28,.3,.39,4],[-.43,-1.84,.19,.25,.3,1],[-.74,-1.98,.2,.19,.26,2],
  ];
  hillHouses.forEach(([x,z,w,d,h,v]) => house(x,z,w,d,h,.265,v));
  const ridgeHouses = [[-1.69,-.83,.18,.24,.39,1],[-.70,-1.51,.22,.28,.46,2],[-.51,-1.12,.20,.26,.64,1],[-1.49,-.64,.18,.22,.28,0],[-.69,-.75,.20,.23,.38,4]];
  ridgeHouses.forEach(([x,z,w,d,h,v]) => house(x,z,w,d,h,.455,v));
  // Cut stone pilasters and a sunken arcade give the hill a civic scale.
  for (let i=0;i<3;i++) arch(.24,.25,.09,.145,.10,-1.47+i*.24,.34,-.49,'light');
  box(.82,.045,.15,-1.23,.605,-.49,'light');
  for(const x of [-1.66,-.82]) {
    box(.075,.38,.085,x,.415,-.475,'stone');
    box(.10,.035,.12,x,.612,-.475,'light');
  }

  // A civic arcade at the waterfront: there is daylight behind the columns.
  for (let i = 0; i < 4; i++) arch(.26, .31, .13, .165, .12, -1.69 + i * .255, .095, 1.36, 'light');
  box(1.06, .07, .21, -1.307, .44, 1.36, 'light');
  box(1.02, .015, .18, -1.307, .48, 1.36, 'roof');
  for (let i = 0; i < 13; i++) box(.028,.057,.028,-1.795+i*.08,.513,1.43,'stone');
  box(1.075,.024,.03,-1.307,.548,1.43,'light');
  // Raised piazza arcades along the canal edge.
  for (let i = 0; i < 3; i++) arch(.225, .305, .1, .14, .12, .2, .095, -.2 - i * .215, 'stone', Math.PI / 2);
  box(.17, .038, .74, .2, .42, -.415, 'light');
  buildingCount += 2;

  function tower(x, z, y, height, radius, octagonal = false) {
    buildingCount++;
    const square = (w,h,d,xx,yy,zz,mat='stone') => box(w,h,d,xx,yy,zz,mat);
    const shaftHeight = height - .37;
    if (octagonal) cylinder(radius, shaftHeight, x, y+shaftHeight/2, z, 'stone', radius, 8);
    else square(radius*1.7,shaftHeight,radius*1.7,x,y+shaftHeight/2,z);
    for (const fraction of [.05,.52,.95]) {
      const yy = y + shaftHeight * fraction;
      if (octagonal) cylinder(radius*1.12,.038,x,yy,z,'light',radius*1.12,8);
      else square(radius*1.92,.035,radius*1.92,x,yy,z,'light');
    }
    for (let level = 0; level < 4; level++) for (const side of [-1,1]) {
      const yy = y+.12+level*(shaftHeight-.17)/4;
      box(.028,.063,.006,x+side*radius*.38,yy,z+radius*.87,'shadow');
      box(.006,.063,.028,x+radius*.87,yy,z+side*radius*.38,'cut');
    }
    const crownY = y + shaftHeight + .055;
    for (const dx of [-1,1]) for (const dz of [-1,1]) cylinder(.017,.14,x+dx*radius*.66,crownY,z+dz*radius*.66,'light',.017,8);
    cylinder(radius*.96,.045,x,crownY+.089,z,'light',radius*.96,8);
    cylinder(radius*.81,.17,x,crownY+.195,z,'stone',0,8);
    cylinder(.015,.07,x,crownY+.30,z,'brass',0,8);
  }
  // A slender summit lantern grows from a stepped masonry crown.
  // Its narrow shaft leaves the terraced hill, not a large lighthouse, as the main mass.
  const beaconX=-1.10, beaconZ=-1.04;
  box(.48,.065,.43,beaconX,.735,beaconZ,'cut');
  box(.39,.045,.35,beaconX,.790,beaconZ,'light');
  arch(.29,.22,.25,.13,.09,beaconX,.815,beaconZ,'stone');
  box(.31,.034,.27,beaconX,1.052,beaconZ,'light');
  box(.15,.47,.13,beaconX,1.304,beaconZ,'stone');
  for(const dx of [-1,1])for(const dz of [-1,1])
    box(.018,.48,.019,beaconX+dx*.067,1.306,beaconZ+dz*.058,'light');
  for(const side of [-1,1]) {
    box(.015,.275,.005,beaconX+side*.029,1.303,beaconZ+.067,'cut');
    box(.005,.275,.015,beaconX+.077,1.303,beaconZ+side*.026,'cut');
  }
  box(.185,.028,.165,beaconX,1.548,beaconZ,'light');
  for(const dx of [-1,1])for(const dz of [-1,1])
    box(.016,.12,.016,beaconX+dx*.071,1.613,beaconZ+dz*.060,'light');
  box(.191,.030,.169,beaconX,1.686,beaconZ,'light');
  box(.141,.026,.121,beaconX,1.714,beaconZ,'stone');
  box(.095,.024,.082,beaconX,1.739,beaconZ,'light');
  cylinder(.025,.10,beaconX,1.799,beaconZ,'stone',.005,8);
  buildingCount++;
  tower(1.5,-.41,.095,1.16,.145,false);
  tower(-1.83,.09,.095,1.05,.12,false);
  // The distant tower is deliberately simpler than the destination.
  tower(.035,-1.29,.265,.90,.10,false);

  // Grand stair climbs in two flights, interrupted by a quiet landing.
  const steps = [];
  for (let i = 0; i < 12; i++) {
    const z = 1.55 - i * .135, h = .025 + i * .026;
    box(.315,h,.133,-.4,.095+h/2,z,'light');
    box(.326,.012,.024,-.4,.095+h+.003,z+.062,'stone');
    steps.push([-.4,.095+h+.019,z]);
    for (const side of [-1,1]) box(.025,.04,.127,-.4+side*.174,.095+h+.018,z,'stone');
  }
  box(.43,.075,.37,-.4,.35,-.102,'light');
  for (let i = 0; i < 7; i++) {
    const x = -.59 - i * .093, h = .045 + i * .026;
    box(.094,h,.24,x,.375+h/2,-.33,'light');
    box(.012,.01,.253,x+.04,.375+h+.004,-.33,'stone');
  }
  // The second flight joins an elevated garden walk around the landmark.
  box(.35,.035,.37,-1.27,.553,-.54,'stone');
  path([[-1.45,.59,-.4],[-1.45,.59,-.69],[-1.4,.59,-.81]],.012,'light',12);
  for(let i=0;i<5;i++) {
    const h=.045+i*.044,z=-.55-i*.048;
    box(.235,h,.051,-1.1,.565+h/2,z,'light');
    box(.25,.012,.018,-1.1,.565+h+.004,z+.021,'stone');
  }

  function bridge(x,z,w,depth,height=.46,opening=.61,spring=.085) {
    arch(w,height,depth,opening,spring,x,0,z,'light');
    const top=height+.052;
    box(w+.055,.045,depth+.035,x,height+.022,z,'stone');
    box(w+.065,.014,depth+.05,x,top,z,'light');
    for (const side of [-1,1]) {
      const zz = z+side*(depth/2+.012);
      box(w+.045,.025,.038,x,top+.115,zz,'light');
      for(let i=0;i<11;i++) box(.027,.11,.027,x-w/2+i*w/10,top+.06,zz,'stone');
      // True radial voussoirs stay outside the arch opening.
      for(let i=0;i<13;i++) {
        const a=(i+.5)*Math.PI/13,r=opening/2+.023;
        add(new THREE.BoxGeometry(.052,.042,.015),'cut',x+Math.cos(a)*r,spring+Math.sin(a)*r,zz,0,0,a-Math.PI/2);
      }
    }
    for(const dx of [-1,1]) {
      box(.105,height*.85,depth+.08,x+dx*(w/2-.042),height*.425,z,'stone');
      box(.13,.045,depth+.11,x+dx*(w/2-.042),top+.021,z,'light');
    }
    return top;
  }
  const bridgeTop=bridge(.49,.79,1.11,.30,.60,.76,.12);
  bridge(.55,-.82,.9,.21);
  // Broad, graded approaches connect the raised bridge to the open square.
  for (let i=0;i<8;i++) {
    const h=.54-i*.063;
    box(.064,h,.32,1.087+i*.061,.095+h/2,.79,'light');
    box(.066,.012,.033,1.087+i*.061,.095+h+.006,.957,'stone');
  }
  for(let i=0;i<5;i++) {
    const h=.35-i*.058;
    box(.08,h,.22,-.01-i*.071,.095+h/2,-.82,'light');
  }
  // A small piazza, with paving joints, low seats, and a shared compass table.
  box(.77,.024,.62,1.23,.109,1.23,'light');
  for(let i=0;i<5;i++) box(.74,.002,.006,1.23,.123,1.00+i*.113,'cut');
  for(let i=0;i<6;i++) box(.005,.002,.59,.90+i*.131,.124,1.23,'cut');
  cylinder(.15,.035,1.23,.148,1.25,'cut',.15,32);
  cylinder(.047,.13,1.23,.225,1.25,'stone',.065,12);
  cylinder(.121,.022,1.23,.298,1.25,'light',.121,32);
  add(new THREE.TorusGeometry(.09,.004,5,32),'brass',1.23,.312,1.25,Math.PI/2);
  for(let i=0;i<8;i++) {
    const a=i*Math.PI/4;
    box(.026,.003,.006,1.23+Math.cos(a)*.069,.312,1.25+Math.sin(a)*.069,'brass',-a);
  }
  for(const [x,z,ry] of [[.94,1.52,0],[1.55,1.30,Math.PI/2]]) {
    box(.26,.037,.065,x,.215,z,'roof',ry);
    for(const side of [-1,1]) box(.035,.088,.07,x+Math.cos(ry)*side*.092,.158,z-Math.sin(ry)*side*.092,'stone',ry);
  }
  // A portico frames the square without filling its breathing room.
  for(let i=0;i<3;i++) arch(.21,.29,.11,.128,.12,.98+i*.20,.095,1.70,'light');
  box(.66,.04,.16,1.18,.405,1.70,'light');
  buildingCount++;

  // Moorings and a tiny launch make the water read as a navigable canal.
  box(.36,.025,.12,.54,.035,1.76,'roof');
  for(const dx of [-1,1]) cylinder(.019,.11,.54+dx*.14,.067,1.79,'brass',.019,8);
  for(let i=0;i<9;i++) {
    const z=1.58-i*.32, x=.44+.15*Math.sin(i*.8);
    box(.06+.014*(i%3),.003,.005,x,.017,z,'water',.12);
  }

  function cypress(x,z,y=.095,scale=1) {
    cylinder(.015*scale,.15*scale,x,y+.075*scale,z,'roof',.011*scale,7);
    sphere(.065*scale,x,y+.205*scale,z,'foliage',.75,2.4,.75);
  }
  [[-1.96,.91,.095,.7],[-.93,1.95,.095,.7],[-1.5,-1.45,.265,.8],[-.69,-.53,.265,.8],[1.97,.53,.095,.8],[1.81,-.97,.095,.75],[.93,-1.64,.095,.7],[-1.22,-1.53,.455,.65],[-.06,-1.97,.095,.7]].forEach(p=>cypress(...p));
  // Pal-inspired lanterns are attached to meaningful public places.
  function lantern(x,y,z,standing=true) {
    if(standing) {
      cylinder(.022,.025,x,y-.202,z,'brass',.026,8);
      cylinder(.011,.15,x,y-.12,z,'brass',.011,8);
    }
    box(.067,.013,.060,x,y-.047,z,'brass');
    box(.045,.075,.041,x,y,z,'lantern');
    add(new THREE.ConeGeometry(.052,.042,4),'brass',x,y+.060,z,0,Math.PI/4);
    for(const dx of [-1,1]) for(const dz of [-1,1]) box(.006,.088,.006,x+dx*.027,y,z+dz*.024,'brass');
    add(new THREE.TorusGeometry(.018,.0035,5,16),'brass',x,y+.103,z);
    lanternPositions.push(new THREE.Vector3(x,y*masonryHeightScale,z));
  }
  lantern(-.58,.34,1.85);
  lantern(-.16,.34,1.65);
  lantern(.025,bridgeTop+.24,.79);
  lantern(.95,bridgeTop+.24,.79);
  lantern(.89,.34,1.5);
  lantern(1.63,.34,1.12);
  lantern(-1.40,.91,-.70);
  lantern(-.80,.91,-.70);

  const summitSteps=Array.from({length:5},(_,i)=>[-1.1,.565+.045+i*.044+.018,-.55-i*.048]);
  const routePoints = [[-.37,.123,2.03],[-.4,.137,1.66],...steps,
    [-.4,.404,-.11],[-.55,.427,-.33],[-.79,.492,-.33],[-1.13,.574,-.33],[-1.28,.585,-.51],
    [-1.1,.585,-.52],...summitSteps,[-1.1,.814,-.835]];
  // A single route follows the real stairs to the door below the beacon.
  for(const point of routePoints)point[1]*=masonryHeightScale;
  const routeCurve = new THREE.CurvePath();
  for(let i=1;i<routePoints.length;i++) routeCurve.add(new THREE.LineCurve3(new THREE.Vector3(...routePoints[i-1]),new THREE.Vector3(...routePoints[i])));
  add(new THREE.TubeGeometry(routeCurve,240,.007,6,false),'red',0,0,0,0,0,0,false);
  for(const [x,z,y] of [[-.37,2.03,.12],[-1.1,-.835,.815]]) add(new THREE.TorusGeometry(.031,.006,5,20),'brass',x,y+.002,z,Math.PI/2);

  // Two narrow launches circulate through the open channel, including both bridge arches.
  // Their two lanes meet in the wider pools; boats never reverse or teleport at an endpoint.
  const boatCurve = new THREE.CatmullRomCurve3([
    [.442,.023,1.48],[.397,.023,1.38],[.374,.023,.90],[.438,.023,.43],
    [.370,.023,-.10],[.427,.023,-.64],[.503,.023,-.82],[.642,.023,-1.10],
    [.685,.023,-1.29],[.738,.023,-1.39],[.790,.023,-1.29],[.749,.023,-1.10],
    [.607,.023,-.82],[.537,.023,-.64],[.480,.023,-.10],[.548,.023,.43],
    [.484,.023,.90],[.507,.023,1.38],
  ].map(p=>new THREE.Vector3(...p)), true, 'centripetal');
  const boatSamples = 1024, routeSamples = 512;
  const boatTrack = new Float32Array((boatSamples+1)*4);
  const navigationTrack = new Float32Array((routeSamples+1)*3);
  const samplePoint = new THREE.Vector3(), sampleTangent = new THREE.Vector3();
  for(let i=0;i<=boatSamples;i++) {
    boatCurve.getPointAt(i/boatSamples,samplePoint);
    boatCurve.getTangentAt(i/boatSamples,sampleTangent);
    const j=i*4;boatTrack[j]=samplePoint.x;boatTrack[j+1]=samplePoint.z;
    boatTrack[j+2]=sampleTangent.x;boatTrack[j+3]=sampleTangent.z;
  }
  for(let i=0;i<=routeSamples;i++) {
    const p=routeCurve.getPoint(i/routeSamples),j=i*3;
    navigationTrack[j]=p.x;navigationTrack[j+1]=p.y;navigationTrack[j+2]=p.z;
  }
  function canalSample(progress,out) {
    const cursor=((progress%1)+1)%1*boatSamples;
    const index=Math.floor(cursor),mix=cursor-index,a=index*4,b=(index+1)*4;
    out[0]=boatTrack[a]+(boatTrack[b]-boatTrack[a])*mix;
    out[1]=boatTrack[a+1]+(boatTrack[b+1]-boatTrack[a+1])*mix;
    out[2]=boatTrack[a+2]+(boatTrack[b+2]-boatTrack[a+2])*mix;
    out[3]=boatTrack[a+3]+(boatTrack[b+3]-boatTrack[a+3])*mix;
  }
  function navigationSample(progress,out) {
    const cursor=Math.max(0,Math.min(1,progress))*routeSamples;
    const index=Math.min(routeSamples-1,Math.floor(cursor)),mix=cursor-index,a=index*3,b=(index+1)*3;
    out.set(navigationTrack[a]+(navigationTrack[b]-navigationTrack[a])*mix,
      navigationTrack[a+1]+(navigationTrack[b+1]-navigationTrack[a+1])*mix,
      navigationTrack[a+2]+(navigationTrack[b+2]-navigationTrack[a+2])*mix);
  }
  const wakeMaterial=new THREE.MeshBasicMaterial({color:0xb8d8da,transparent:true,opacity:.23,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  const boatMotion=[];
  function launch(phase,scale,trim) {
    const group=new THREE.Group();group.name='Slow canal launch';root.add(group);
    const hull=new THREE.Shape();hull.moveTo(-.038,-.097);
    hull.quadraticCurveTo(-.054,.030,0,.124);hull.quadraticCurveTo(.054,.030,.038,-.097);hull.closePath();
    const hullGeometry=new THREE.ExtrudeGeometry(hull,{depth:.022,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.004,bevelThickness:.004,curveSegments:8});
    hullGeometry.rotateX(-Math.PI/2);hullGeometry.rotateY(Math.PI);
    function piece(geo,mat,x=0,y=0,z=0) {
      const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);
      mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;
    }
    piece(hullGeometry,materials.light);
    piece(new THREE.BoxGeometry(.062,.016,.110),materials[trim],0,.029,-.015);
    piece(new THREE.BoxGeometry(.046,.031,.047),materials.stone,0,.047,-.014);
    piece(new THREE.BoxGeometry(.052,.007,.057),materials.light,0,.066,-.014);
    piece(new THREE.BoxGeometry(.033,.015,.004),materials.shadow,0,.049,.011);
    const lamp=piece(new THREE.SphereGeometry(.009,8,6),materials.lantern,0,.036,.078);
    lamp.castShadow=false;group.scale.setScalar(scale);
    const wakePositions=new Float32Array(2*13*2*3),wakeIndices=[];
    for(let side=0;side<2;side++)for(let i=0;i<12;i++) {
      const a=side*26+i*2;wakeIndices.push(a,a+1,a+2,a+1,a+3,a+2);
    }
    const wakeGeometry=new THREE.BufferGeometry();
    wakeGeometry.setAttribute('position',new THREE.BufferAttribute(wakePositions,3).setUsage(THREE.DynamicDrawUsage));
    wakeGeometry.setIndex(wakeIndices);
    const wake=new THREE.Mesh(wakeGeometry,wakeMaterial);wake.name='Quiet trailing canal wake';wake.frustumCulled=false;
    wake.userData.noShadow=true;root.add(wake);
    boatMotion.push({group,wake,wakePositions,phase,scale});
  }
  launch(.07,1,'roof');launch(.59,.84,'red');
  const boatSample=new Float32Array(4);
  function moveBoats(time) {
    for(const boat of boatMotion) {
      const progress=time/36+boat.phase;canalSample(progress,boatSample);
      boat.group.position.set(boatSample[0],.024+Math.sin(time*Math.PI/9+boat.phase*Math.PI*2)*.0022,boatSample[1]);
      boat.group.rotation.set(Math.sin(time*Math.PI/9+boat.phase*9)*.006,Math.atan2(boatSample[2],boatSample[3]),0);
      for(let i=0;i<=12;i++) {
        const u=i/12;canalSample(progress-(.018+u*.034)*boat.scale,boatSample);
        const normalX=-boatSample[3],normalZ=boatSample[2];
        const spread=(.026+u*.034)*boat.scale;
        const width=.0038*Math.sin((u*.90+.05)*Math.PI)*boat.scale;
        for(let side=0;side<2;side++)for(let edge=0;edge<2;edge++) {
          const offset=(side===0?-1:1)*spread+(edge===0?-1:1)*width;
          const j=(side*26+i*2+edge)*3;
          boat.wakePositions[j]=boatSample[0]+normalX*offset;
          boat.wakePositions[j+1]=.018;
          boat.wakePositions[j+2]=boatSample[1]+normalZ*offset;
        }
      }
      boat.wake.geometry.attributes.position.needsUpdate=true;
    }
  }

  for(const [key,batch] of batches) {
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(batch.position,3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(batch.normal,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(batch.uv,2));
    geometry.computeBoundingSphere();
    const mesh=new THREE.Mesh(geometry,materials[key]);
    mesh.castShadow=mesh.receiveShadow=true; mesh.name=`City ${key}`; root.add(mesh);
  }
  const pulseMaterial=new THREE.MeshStandardMaterial({color:0xffb672,emissive:0xff8237,emissiveIntensity:.65,roughness:.4});
  const pulse=new THREE.Mesh(new THREE.SphereGeometry(.025,10,8),pulseMaterial);
  pulse.name='A visitor follows the crow';pulse.userData.noShadow=true;root.add(pulse);
  const routeTail=[];
  for(let i=0;i<3;i++) {
    const dot=new THREE.Mesh(new THREE.SphereGeometry(.018-i*.0035,8,6),pulseMaterial);
    dot.name='Warm route breadcrumb';dot.userData.noShadow=true;root.add(dot);routeTail.push(dot);
  }
  const beaconMaterial=new THREE.MeshStandardMaterial({color:0xffd59a,emissive:0xffb54b,emissiveIntensity:.3,roughness:.35});
  const beacon=new THREE.Mesh(new THREE.BoxGeometry(.062,.096*masonryHeightScale,.054),beaconMaterial);
  beacon.position.set(beaconX,1.610*masonryHeightScale,beaconZ);beacon.userData.noShadow=true;root.add(beacon);
  // A soft glow stays inside the architectural lantern, with no floating labels.
  const glowSize=32,glowData=new Uint8Array(glowSize*glowSize*4);
  for(let y=0;y<glowSize;y++)for(let x=0;x<glowSize;x++) {
    const d=Math.hypot((x+.5-glowSize/2)/(glowSize/2),(y+.5-glowSize/2)/(glowSize/2)),i=(y*glowSize+x)*4;
    glowData[i]=255;glowData[i+1]=183;glowData[i+2]=96;glowData[i+3]=Math.round(75*Math.pow(Math.max(0,1-d),2.6));
  }
  const glowTexture=new THREE.DataTexture(glowData,glowSize,glowSize,THREE.RGBAFormat);glowTexture.needsUpdate=true;glowTexture.colorSpace=THREE.SRGBColorSpace;
  const glowMaterial=new THREE.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
  const glow=new THREE.Sprite(glowMaterial);glow.position.copy(beacon.position);glow.scale.set(.28,.28,1);root.add(glow);
  let night=false,arrival=0,beaconBreath=0;
  const smooth=value=>{const t=THREE.MathUtils.clamp(value,0,1);return t*t*(3-2*t);};
  const updateGlow=()=>{
    beaconMaterial.emissiveIntensity=(night?1.1:.14)+arrival*(night?2.5:.65)+beaconBreath*(night?.16:.025);
    glowMaterial.opacity=(night?.36:.04)+arrival*(night?.64:.25)+beaconBreath*(night?.035:.005);
  };
  root.userData.buildingCount=buildingCount;
  root.userData.masonryHeightScale=masonryHeightScale;
  root.userData.routeCurve=routeCurve;
  root.userData.routePoints=routePoints;
  root.userData.lanternPositions=lanternPositions;
  root.userData.destinationPoint=beacon.position.clone();
  root.userData.canalCurve=boatCurve;
  root.userData.boatGroups=boatMotion.map(boat=>boat.group);
  root.userData.cityMotionDuration=36;
  root.userData.animate=(time)=>{
    time=Number.isFinite(time)?time:0;
    const t=((time%18)+18)%18;
    const progress=smooth((t-1)/11);
    navigationSample(progress,pulse.position);pulse.position.y+=.022;
    pulse.scale.setScalar(Math.max(.001,smooth(t/.7)*(1-smooth((t-12.2)/.7))));
    pulse.visible=t<13;
    for(let i=0;i<routeTail.length;i++) {
      const dot=routeTail[i],offset=(i+1)*.010;
      navigationSample(Math.max(0,progress-offset),dot.position);dot.position.y+=.019;
      dot.scale.setScalar(pulse.scale.x*smooth(progress/offset));dot.visible=pulse.visible;
    }
    moveBoats(time);
    beaconBreath=.5-.5*Math.cos(time*Math.PI/9);
    arrival=smooth((t-11.2)/1.3)*(1-smooth((t-15.5)/2));
    glow.scale.setScalar(.28+arrival*.10+beaconBreath*.009);
    updateGlow();
    root.userData.routeProgress=progress;
    root.userData.destinationAwake=arrival;
  };
  root.userData.setTheme=(theme)=>{
    night=theme==='dark';
    wakeMaterial.opacity=night?.20:.26;
    materials.glass.emissiveIntensity=night?1.15:.06;
    materials.lantern.emissiveIntensity=night?2.5:.12;
    materials.glass.color.setHex(night?0xe2b979:0xc4a779);
    pulseMaterial.emissiveIntensity=night?1.25:.2;
    materials.stone.color.setHex(night?0xe6d6ba:0xeadfcb);
    materials.light.color.setHex(night?0xffefd7:0xfff2db);
    updateGlow();
  };
  root.userData.animate(0);
  return root;
}
