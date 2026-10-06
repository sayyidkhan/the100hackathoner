/** Original procedural interpretations of the three Museum concept images.
 * These are symbolic project exhibits, not scans or product screenshots.
 */
export function createArtifact(THREE, id) {
  const root = new THREE.Group();
  const material = (color, options = {}) => new THREE.MeshStandardMaterial({
    color, roughness: .76, metalness: 0, ...options
  });
  const paper = material(0xe7dbc2, { side: THREE.DoubleSide });
  const paperLight = material(0xf4ebd8, { side: THREE.DoubleSide });
  const paperShade = material(0xcbbb9e, { side: THREE.DoubleSide });
  const wood = material(0xc9aa7d);
  const woodDark = material(0x776044);
  const red = material(0xa92119, { roughness: .86 });
  const cobalt = material(0x133fac, { roughness: .23, metalness: .25 });
  const charcoal = material(0x161a21, { roughness: .56, metalness: .08, flatShading: true, side: THREE.DoubleSide });
  let featherHighlight;
  let sharinganRed;
  let crowRig;
  const crowWings = [];

  function mesh(geometry, surface, parent = root) {
    const object = new THREE.Mesh(geometry, surface);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(w, h, d, x, y, z, surface, parent = root) {
    const object = mesh(new THREE.BoxGeometry(w, h, d), surface, parent);
    object.position.set(x, y, z);
    return object;
  }
  function beam(a, b, radius, surface, parent = root, sides = 6) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const object = mesh(new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), sides), surface, parent);
    object.position.copy(start).add(end).multiplyScalar(.5);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
    return object;
  }
  function faces(vertices, triangles, surface, parent = root) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (const triangle of triangles) for (const index of triangle) positions.push(...vertices[index]);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return mesh(geometry, surface, parent);
  }
  function slab(points, depth, y, surface, parent = root) {
    const shape = new THREE.Shape();
    points.forEach(([x, z], index) => index ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 16 });
    geometry.rotateX(-Math.PI / 2);
    const object = mesh(geometry, surface, parent);
    object.position.y = y;
    return object;
  }
  function ribbon(points, width, surface, parent = root) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const vertices = [];
    const indices = [];
    for (let i = 0; i <= 90; i++) {
      const t = i / 90;
      const p = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width / 2);
      vertices.push(p.x + normal.x, p.y, p.z + normal.z, p.x - normal.x, p.y, p.z - normal.z);
      if (i < 90) indices.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const double = surface.clone();
    double.side = THREE.DoubleSide;
    return mesh(geometry, double, parent);
  }
  function pine(x, y, z, height, parent = root) {
    beam([x, y, z], [x, y + height * .84, z], .025, paperShade, parent);
    for (let level = 0; level < 4; level++) {
      const radius = height * (.22 - level * .042);
      const cone = mesh(new THREE.ConeGeometry(radius, height * .45, 4), level % 2 ? paper : paperLight, parent);
      cone.position.set(x, y + height * (.36 + level * .17), z);
      cone.rotation.y = Math.PI / 4;
    }
  }
  function house(x, y, z, scale, parent = root) {
    box(.72 * scale, .62 * scale, .58 * scale, x, y + .31 * scale, z, paperLight, parent);
    faces([
      [x - .44 * scale, y + .6 * scale, z - .39 * scale],
      [x + .44 * scale, y + .6 * scale, z - .39 * scale],
      [x, y + 1.01 * scale, z - .39 * scale],
      [x - .44 * scale, y + .6 * scale, z + .39 * scale],
      [x + .44 * scale, y + .6 * scale, z + .39 * scale],
      [x, y + 1.01 * scale, z + .39 * scale]
    ], [[0, 2, 3], [3, 2, 5], [1, 4, 2], [4, 5, 2], [0, 1, 2], [3, 5, 4]], paper, parent);
    box(.19 * scale, .39 * scale, .012, x, y + .195 * scale, z + .299 * scale, woodDark, parent);
    box(.1 * scale, .1 * scale, .018, x - .2 * scale, y + .45 * scale, z + .3 * scale, paperShade, parent);
  }

  function storybook() {
    // Cloth-covered boards and a curved sewn spine.
    for (const side of [-1, 1]) {
      const cover = box(2.94, .11, 4.08, side * 1.46, .12, 0, red);
      cover.rotation.z = side * .035;
      box(2.84, .04, 3.95, side * 1.46, .21, 0, paperShade);
    }
    const spine = mesh(new THREE.CylinderGeometry(.17, .17, 4.08, 18, 1, true, 0, Math.PI), red);
    spine.rotation.x = Math.PI / 2;
    spine.position.set(0, .2, 0);
    function pageY(x, z, level) {
      const a = Math.abs(x);
      return .26 + level * .023 + a * .1 + Math.sin(a / 2.85 * Math.PI) * (.19 + level * .014)
        + Math.sin(z * 1.5 + a) * .035 * a;
    }
    for (let level = 0; level < 18; level++) for (const side of [-1, 1]) {
      const positions = [];
      const indices = [];
      for (let row = 0; row <= 10; row++) for (let col = 0; col <= 28; col++) {
        const x = side * col / 28 * (2.85 - level * .008);
        const z = (row / 10 - .5) * (3.9 - level * .008);
        positions.push(x, pageY(x, z, level), z);
        if (col < 28 && row < 10) {
          const a = row * 29 + col;
          indices.push(a, a + 29, a + 1, a + 1, a + 29, a + 30);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      mesh(geometry, level % 4 === 0 ? paperLight : paper);
    }
    // Mountain silhouettes are folded sheets, with sharp alternating facets.
    const peaks = [[-1.4, -.8, 2.5, .83], [-2.0, -.25, 1.7, .6], [-.65, -.9, 1.85, .62]];
    for (const [x, z, height, width] of peaks) {
      const y = pageY(x, z, 17);
      faces([
        [x - width, y, z + .42], [x, y + height, z], [x + width, y, z + .42],
        [x - width * .65, y, z - .32], [x + width * .6, y, z - .35],
        [x - width * .12, y + height * .53, z + .17]
      ], [[0, 1, 5], [5, 1, 2], [0, 3, 1], [1, 4, 2], [3, 4, 1]], paperLight);
    }
    const homeX = 1.65;
    const homeZ = -.85;
    house(homeX, pageY(homeX, homeZ, 17) + .015, homeZ, .87);
    const pathXZ = [[-.7, 1.65], [-.35, 1.12], [.25, .84], [.9, .8], [1.12, .35], [.7, -.02], [.97, -.39], [1.64, -.51]];
    ribbon(pathXZ.map(([x, z]) => [x, pageY(x, z, 17) + .045, z]), .19, cobalt);
    for (const [x, z, h] of [[-2.2,.72,.78],[-1.6,.62,.6],[-1.8,1.1,.72],[2.22,-1.16,.95],[2.45,-.62,.74],[2.14,.66,.81],[1.71,1.15,.64]]) {
      pine(x, pageY(x, z, 17) + .015, z, h);
    }
    // Red bookmark and subtle gold cloth edge lend the object a tactile finish.
    ribbon([[0,.26,1.7],[.12,.22,2.02],[.36,.08,2.23],[.68,.055,2.1]], .13, red);
  }

  function crowCity() {
    featherHighlight = material(0x232833, { roughness: .62, flatShading: true, side: THREE.DoubleSide });
    const base = mesh(new THREE.CylinderGeometry(2.38, 2.42, .24, 72), cobalt);
    base.position.y = .12;
    const city = new THREE.Group();
    root.add(city);
    for (let row = -3; row <= 3; row++) for (let col = -3; col <= 3; col++) {
      const x = col * .57;
      const z = row * .54;
      if (x * x + z * z > 4.4 || (col === 0 && row > -2)) continue;
      const seed = Math.abs(row * 13 + col * 7);
      const h = .25 + (seed % 7) * .115 + (row < 0 ? .2 : 0);
      const w = .35 + seed % 3 * .035;
      box(w, h, .39, x, .24 + h / 2, z, seed % 3 ? paperLight : paper, city);
      box(w + .025, .04, .42, x, .24 + h, z, paperShade, city);
      if (seed % 4 === 0) box(w * .58, .17, .24, x, .325 + h, z, paperLight, city);
      for (let story = 0; story < Math.floor(h / .2); story++) for (const side of [-1, 1]) {
        box(.028, .085, .008, x + side * w * .25, .38 + story * .19, z + .201, paperShade, city);
      }
      if (seed % 5 === 0) {
        const tower = mesh(new THREE.CylinderGeometry(.055, .09, .38, 6), paperLight, city);
        tower.position.set(x, .47 + h, z);
        const spire = mesh(new THREE.ConeGeometry(.07, .23, 6), paper, city);
        spire.position.set(x, .77 + h, z);
      }
    }
    // A raised arcade creates depth through actual openings, not painted windows.
    for (const x of [-.56,0,.56]) {
      beam([x,.24,.45],[x,.78,.45],.06,paperLight,city);
      box(.6,.09,.27,x,.8,.45,paperLight,city);
    }
    ribbon([[-.8,.27,1.95],[-.68,.28,1.2],[-.28,.28,.85],[.26,.29,.82],[.47,.3,.12],[.22,.29,-.43],[-.2,.3,-.96]],.043,red,city);
    const bird = new THREE.Group();
    bird.name = 'flying-crow';
    crowRig = bird;
    bird.position.set(.05,2.87,-.04);
    bird.rotation.set(-.08,-.23,.03);
    root.add(bird);
    const body = mesh(new THREE.IcosahedronGeometry(.65, 1), charcoal, bird);
    body.scale.set(.64,.67,1.18);
    const head = mesh(new THREE.IcosahedronGeometry(.32, 0), charcoal, bird);
    head.position.set(0,.15,.7);
    head.scale.set(.9,1,1.05);
    faces([[.17,.16,.85],[-.17,.16,.85],[0,-.12,1.3],[0,.33,.86]],[[0,1,2],[0,2,3],[1,3,2]],charcoal,bird);
    sharinganRed = material(0xe32232, { emissive: 0xd50820, emissiveIntensity: .5, roughness: .45 });
    const eyeInk = new THREE.MeshBasicMaterial({ color: 0x09070c });
    // Raised graphic irises keep the three tomoe crisp when the exhibit is rotated.
    const tomoeShape = new THREE.Shape();
    tomoeShape.moveTo(0, -.012);
    tomoeShape.bezierCurveTo(-.018, -.012, -.019, .013, -.002, .015);
    tomoeShape.bezierCurveTo(.012, .02, .022, .012, .024, .003);
    tomoeShape.bezierCurveTo(.012, .01, .014, -.012, 0, -.012);
    const tomoeGeometry = new THREE.ShapeGeometry(tomoeShape, 12);
    for (const side of [-1,1]) {
      const eye = new THREE.Group();
      eye.name = side < 0 ? 'left-sharingan' : 'right-sharingan';
      eye.position.set(side*.247,.245,.795);
      eye.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), new THREE.Vector3(side*.8,.18,.58).normalize());
      bird.add(eye);
      const socket = mesh(new THREE.SphereGeometry(.091,24,12), eyeInk, eye);
      socket.scale.z = .24;
      const iris = mesh(new THREE.CircleGeometry(.08,48), sharinganRed, eye);
      iris.position.z = .023;
      const ring = mesh(new THREE.RingGeometry(.049,.052,48), eyeInk, eye);
      ring.position.z = .025;
      const pupil = mesh(new THREE.CircleGeometry(.021,24), eyeInk, eye);
      pupil.position.z = .026;
      for (let i=0;i<3;i++) {
        const angle = i / 3 * Math.PI * 2 + Math.PI / 2;
        const tomoe = mesh(tomoeGeometry, eyeInk, eye);
        tomoe.name = 'tomoe';
        tomoe.position.set(Math.cos(angle)*.05, Math.sin(angle)*.05, .027);
        tomoe.rotation.z = angle - Math.PI / 2;
      }
      // Tiny eye markings should not cast shadows onto their own iris.
      eye.traverse(object => { if (object.isMesh) { object.castShadow = false; object.receiveShadow = false; } });
      const wing = new THREE.Group();
      wing.name = side < 0 ? 'left-wing' : 'right-wing';
      wing.position.set(side*.24,.25,-.18);
      bird.add(wing);
      crowWings.push({ wing, side });
      // Each flight feather is an independent folded, ridged four-facet sheet.
      for (let i=0;i<9;i++) {
        const rootX=side*(.24+i*.07);
        const endX=side*(2.64-i*.09);
        const endY=1.31-i*.17;
        const endZ=-.92+i*.19;
        const width=.18;
        faces([
          [rootX,.25,-.18],[side*1.03,.84,-.36],
          [endX,endY,endZ],[endX-side*.27,endY-.11,endZ+width],
          [side*1.46,.78-i*.043,-.36+i*.08]
        ],[[0,1,4],[1,2,4],[2,3,4],[3,0,4]],i%3===0?featherHighlight:charcoal,wing);
      }
      faces([[side*.2,.25,.1],[side*1.05,.85,-.32],[side*.88,.1,-.52],[side*.3,-.28,-.5]],[[0,1,2],[0,2,3]],charcoal,wing);
      // Feather geometry was authored in bird space; articulate at the shoulder.
      for (const feather of wing.children) feather.geometry.translate(-wing.position.x,-wing.position.y,-wing.position.z);
    }
    for (let i=0;i<5;i++) {
      const x=(i-2)*.14;
      faces([[x-.12,-.15,-.3],[x+.12,-.15,-.3],[x*1.5+.09,-.47,-1.32],[x*1.5,-.37,-1.61],[x*1.5-.09,-.47,-1.32]],[[0,1,3],[1,2,3],[0,3,4]],charcoal,bird);
    }
  }

  function borneo() {
    const oval = [];
    for(let i=0;i<80;i++){const a=i/80*Math.PI*2;oval.push([Math.cos(a)*2.95,Math.sin(a)*2.12]);}
    slab(oval,.2,0,paperShade);
    slab(oval.map(([x,z])=>[x*.99,z*.99]),.035,.2,cobalt);
    for(let side of [-1,1]) for(let layer=0;layer<7;layer++) {
      const contour=[];
      for(let i=0;i<=26;i++){
        const z=-1.96+i/26*3.92;
        const river=.48*Math.sin(z*1.8)+.1;
        contour.push([river+side*(.45+layer*.065),z*(1-layer*.025)]);
      }
      for(let i=26;i>=0;i--){
        const z=-1.96+i/26*3.92;
        const edge=2.85*Math.sqrt(Math.max(.03,1-(z/2.14)**2));
        contour.push([side*(edge-layer*.075),z*(1-layer*.025)]);
      }
      slab(contour,.065,.24+layer*.066,layer%2?paper:paperLight);
    }
    const building = new THREE.Group();
    root.add(building);
    const deckY=1.38;
    box(4.2,.13,1.56,0,deckY,-.55,wood,building);
    // Slender cross-braced stilts and structural beams under the veranda.
    for(const x of [-1.9,-1.14,-.38,.38,1.14,1.9]) for(const z of [-1.1,.02]) {
      beam([x,.4,z],[x,deckY,z],.035,wood,building);
      if(x<1.8)beam([x,.55,z],[x+.76,1.27,z],.018,woodDark,building);
    }
    box(3.95,.88,.045,0,1.91,-1.08,paperShade,building);
    box(.06,.88,1.02,-1.95,1.91,-.59,wood,building);
    box(.06,.88,1.02,1.95,1.91,-.59,wood,building);
    for(let i=0;i<50;i++) box(.023,.86,.014,-1.91+i*.078,1.91,-1.052,wood,building);
    for(let i=0;i<6;i++) {
      const x=-1.62+i*.65;
      box(.5,.76,.035,x,1.86,-.19,woodDark,building);
      box(.045,.88,.065,x-.27,1.91,-.15,wood,building);
      box(.43,.04,.045,x,2.18,-.13,wood,building);
      box(.43,.04,.045,x,1.52,-.13,wood,building);
      for(let j=0;j<5;j++)box(.026,.61,.022,x-.19+j*.095,1.86,-.116,paperShade,building);
    }
    // Veranda railing, floorboards and six roof-bearing posts.
    for(let i=0;i<42;i++)box(.018,.055,1.43,-2.03+i*.098,deckY+.075,-.55,paperShade,building);
    beam([-2.02,1.84,.19],[2.02,1.84,.19],.023,wood,building);
    for(let i=0;i<32;i++)beam([-1.98+i*.128,deckY+.08,.19],[-1.98+i*.128,1.84,.19],.012,wood,building);
    for(const x of [-1.95,-1.17,-.39,.39,1.17,1.95])beam([x,deckY,.19],[x,2.48,.19],.024,wood,building);
    const roofVertices=[[-2.25,2.33,-1.41],[2.25,2.33,-1.41],[-2.25,3.16,-.62],[2.25,3.16,-.62],[-2.25,2.33,.37],[2.25,2.33,.37]];
    faces(roofVertices,[[0,1,2],[1,3,2],[2,3,4],[3,5,4],[0,2,4],[1,5,3]],paper,building);
    for(let i=0;i<64;i++){
      const x=-2.24+i*.071;
      beam([x,2.34,-1.42],[x,3.17,-.62],.009,wood,building,4);
      beam([x,3.17,-.62],[x,2.34,.38],.009,wood,building,4);
    }
    beam([-2.29,3.18,-.62],[2.29,3.18,-.62],.028,wood,building);
    // Stairs connect the veranda to a bright red footbridge over the cobalt river.
    for(let i=0;i<7;i++)box(.55,.06,.18,1.49,deckY-i*.115,.34+i*.145,wood,building);
    const bridge = new THREE.Group();
    bridge.position.set(1.53,.55,1.5);
    bridge.rotation.y=-.32;
    root.add(bridge);
    box(1.82,.065,.4,0,0,0,red,bridge);
    for(let i=0;i<8;i++)for(const side of [-1,1])beam([-.84+i*.24,-.12,side*.19],[-.84+i*.24,.28,side*.19],.012,red,bridge);
    for(const side of [-1,1])beam([-.87,.28,side*.19],[.87,.28,side*.19],.014,red,bridge);

    function palm(x,y,z,h,phase) {
      const trunkPoints=[[x,y,z],[x+.07,y+h*.6,z-.03],[x+.15,y+h,z-.06]];
      const curve = new THREE.CatmullRomCurve3(trunkPoints.map(p=>new THREE.Vector3(...p)));
      mesh(new THREE.TubeGeometry(curve,10,.035,5,false),wood);
      const crown=new THREE.Vector3(x+.15,y+h,z-.06);
      for(let frond=0;frond<6;frond++){
        const a=phase+frond/6*Math.PI*2;
        const reach=.65+h*.11;
        const tip=[crown.x+Math.cos(a)*reach,crown.y-.22,crown.z+Math.sin(a)*reach];
        const midpoint=[crown.x+Math.cos(a)*reach*.48,crown.y+.18,crown.z+Math.sin(a)*reach*.48];
        beam(crown.toArray(),midpoint,.012,paperShade);
        beam(midpoint,tip,.009,paperShade);
        for(let leaf=1;leaf<8;leaf++){
          const t=leaf/8;
          const base=new THREE.Vector3(crown.x+Math.cos(a)*reach*t,crown.y+Math.sin(t*Math.PI)*.22-t*.22,crown.z+Math.sin(a)*reach*t);
          const length=.24*Math.sin(t*Math.PI)+.08;
          for(const side of [-1,1]){
            const perpendicular=new THREE.Vector3(-Math.sin(a),0,Math.cos(a)).multiplyScalar(side*length);
            const end=base.clone().add(perpendicular).add(new THREE.Vector3(Math.cos(a)*.1,-.11,Math.sin(a)*.1));
            faces([base.toArray(),[base.x+Math.cos(a)*.115,base.y+.016,base.z+Math.sin(a)*.115],end.toArray()],[[0,1,2]],paperLight);
          }
        }
      }
    }
    for(const [x,z,h,phase] of [[-2.42,-.8,2.25,.2],[-1.8,-1.52,2.45,1.2],[2.32,-1.14,1.94,.6],[-2.35,1.18,1.35,.7],[2.36,.95,1.15,1.4]])palm(x,.6,z,h,phase);
  }

  if (Number(id) === 80) crowCity();
  else if (Number(id) === 79) borneo();
  else storybook();
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const center = bounds.getCenter(new THREE.Vector3());
  // Keep the returned object's origin on its floor, regardless of small overhangs.
  for (const child of root.children) child.position.add(new THREE.Vector3(-center.x,-bounds.min.y,-center.z));
  root.updateMatrixWorld(true);
  // The detailed leaves, windows and timbers are baked into material batches.
  // This preserves their silhouettes while avoiding hundreds of draw calls.
  if (crowRig) root.remove(crowRig);
  const batches = new Map();
  root.traverse(object => {
    if (!object.isMesh) return;
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    let batch = batches.get(object.material.uuid);
    if (!batch) {
      batch = { material: object.material, positions: [], normals: [] };
      batches.set(object.material.uuid, batch);
    }
    for (const value of geometry.attributes.position.array) batch.positions.push(value);
    for (const value of geometry.attributes.normal.array) batch.normals.push(value);
    geometry.dispose();
    object.geometry.dispose();
  });
  root.clear();
  for (const batch of batches.values()) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(batch.positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(batch.normals, 3));
    geometry.computeBoundingSphere();
    mesh(geometry, batch.material);
  }
  if (crowRig) root.add(crowRig);
  root.userData.conceptual = true;
  root.userData.artifactId = Number(id);
  if (Number(id) === 80) {
    const rest = crowRig.position.clone();
    const cycle = 2.4;
    root.userData.animate = elapsed => {
      const phase = (Math.max(0,elapsed) % cycle) / cycle * Math.PI * 2;
      // Broad, restrained strokes with a slight trailing twist and buoyant body.
      const flap = -.08 + .32 * Math.cos(phase);
      for (const { wing, side } of crowWings) {
        wing.rotation.z = side * flap;
        wing.rotation.y = side * Math.sin(phase) * .045;
      }
      crowRig.position.y = rest.y + Math.sin(phase) * .085;
      crowRig.rotation.x = -.08 + Math.sin(phase) * .025;
      crowRig.rotation.z = .03 + Math.sin(phase) * .012;
    };
    // Fit the whole wing stroke, not just the pose visible when the view opens.
    const flightBounds = new THREE.Box3();
    for (let i=0;i<64;i++) {
      root.userData.animate(i / 64 * cycle);
      flightBounds.union(new THREE.Box3().setFromObject(root));
    }
    flightBounds.expandByScalar(.04);
    root.userData.framingBounds = flightBounds;
    root.userData.animate(0);
    // Lift only the bird's shadow tones at night; preserve the city and day palette.
    charcoal.name = 'crow-charcoal';
    featherHighlight.name = 'crow-feather-highlight';
    root.userData.setTheme = theme => {
      const night = theme === 'dark';
      charcoal.color.setHex(night ? 0x364252 : 0x161a21);
      featherHighlight.color.setHex(night ? 0x536278 : 0x232833);
      charcoal.emissive.setHex(0x253248);
      featherHighlight.emissive.setHex(0x2e3d53);
      charcoal.emissiveIntensity = night ? .32 : 0;
      featherHighlight.emissiveIntensity = night ? .25 : 0;
      sharinganRed.emissiveIntensity = night ? .9 : .5;
    };
  }
  return root;
}
