// Four builders, one shared table. Coordinates remain local to the exhibit.
export function createAtlasTeam(THREE) {
  const root = new THREE.Group(); root.name = 'hackatlas-team';
  const furniture = new THREE.Group(); root.add(furniture);
  const materials = {
    ivory: new THREE.MeshStandardMaterial({ color: 0xf0e8d7, roughness: .44 }),
    walnut: new THREE.MeshStandardMaterial({ color: 0x77533d, roughness: .47 }),
    woodEdge: new THREE.MeshStandardMaterial({ color: 0xa17c50, roughness: .44 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc6a56a, metalness: .77, roughness: .3 }),
    navy: new THREE.MeshStandardMaterial({ color: 0x18375f, roughness: .77 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x254eb0, roughness: .59 }),
    terra: new THREE.MeshStandardMaterial({ color: 0xb66547, roughness: .73 }),
    sage: new THREE.MeshStandardMaterial({ color: 0x688f80, roughness: .78 }),
    ink: new THREE.MeshStandardMaterial({ color: 0x172638, roughness: .47 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xb9c4c7, metalness: .54, roughness: .36 }),
    skin0: new THREE.MeshStandardMaterial({ color: 0xce986e, roughness: .66 }),
    skin1: new THREE.MeshStandardMaterial({ color: 0x845336, roughness: .66 }),
    skin2: new THREE.MeshStandardMaterial({ color: 0xe7bd96, roughness: .66 }),
    skin3: new THREE.MeshStandardMaterial({ color: 0xb67f58, roughness: .66 }),
    hair: new THREE.MeshStandardMaterial({ color: 0x2b211d, roughness: .88 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x294d72, emissive: 0x386a93, emissiveIntensity: .35, roughness: .25 }),
    pixels: new THREE.MeshStandardMaterial({ color: 0xcde9e6, emissive: 0x86d8cf, emissiveIntensity: .35, roughness: .45 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xfff8e7, roughness: .8 }),
  };
  const cache = new Map(), people = [];
  const geometry = (key, build) => { if (!cache.has(key)) cache.set(key, build()); return cache.get(key); };
  const mesh = (geo, material, parent = furniture) => {
    const object = new THREE.Mesh(geo, typeof material === 'string' ? materials[material] : material);
    object.castShadow = object.receiveShadow = true; parent.add(object); return object;
  };
  const group = (x, y, z, parent = furniture) => {
    const object = new THREE.Group(); object.position.set(x, y, z); parent.add(object); return object;
  };
  function round(w, h, d, radius, material, x, y, z, parent = furniture) {
    const r = Math.min(radius, w / 2, h / 2, d / 2) * .99;
    const geo = geometry(`round:${w}:${h}:${d}:${r}`, () => {
      const result = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
      const p = result.attributes.position, n = result.attributes.normal;
      const core = new THREE.Vector3(w / 2 - r, h / 2 - r, d / 2 - r);
      const point = new THREE.Vector3(), near = new THREE.Vector3(), normal = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        const values = [p.getX(i), p.getY(i), p.getZ(i)].map((v, axis) => {
          const half = [w, h, d][axis] / 2;
          return [-half, -half + r * .293, -half + r, half - r, half - r * .293, half][Math.round((v + .5) * 5)];
        });
        point.set(...values);
        near.set(THREE.MathUtils.clamp(point.x, -core.x, core.x), THREE.MathUtils.clamp(point.y, -core.y, core.y), THREE.MathUtils.clamp(point.z, -core.z, core.z));
        normal.subVectors(point, near).normalize(); point.copy(near).addScaledVector(normal, r);
        p.setXYZ(i, point.x, point.y, point.z); n.setXYZ(i, normal.x, normal.y, normal.z);
      }
      result.computeBoundingSphere(); return result;
    });
    const object = mesh(geo, material, parent); object.position.set(x, y, z); return object;
  }
  function sphere(radius, material, x, y, z, scale = [1, 1, 1], parent = furniture) {
    const object = mesh(geometry(`sphere:${radius}`, () => new THREE.SphereGeometry(radius, 16, 12)), material, parent);
    object.position.set(x, y, z); object.scale.set(...scale); return object;
  }
  function cylinder(top, bottom, height, material, x, y, z, parent = furniture) {
    const object = mesh(geometry(`cylinder:${top}:${bottom}:${height}`, () => new THREE.CylinderGeometry(top, bottom, height, 24)), material, parent);
    object.position.set(x, y, z); return object;
  }
  function bar(a, b, radius, material, parent = furniture) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
    const object = cylinder(radius, radius, delta.length(), material, 0, 0, 0, parent);
    object.position.copy(start).add(end).multiplyScalar(.5);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); return object;
  }
  function ring(radius, thickness, material, x, y, z, parent = furniture) {
    const object = mesh(geometry(`ring:${radius}:${thickness}`, () => new THREE.TorusGeometry(radius, thickness, 6, 32)), material, parent);
    object.position.set(x, y, z); return object;
  }
  function oval(width, depth, height, material, y) {
    const shape = new THREE.Shape(); const radius = depth / 2, middle = width / 2 - radius;
    shape.moveTo(-middle, -radius); shape.lineTo(middle, -radius);
    shape.absarc(middle, 0, radius, -Math.PI / 2, Math.PI / 2, false);
    shape.lineTo(-middle, radius); shape.absarc(-middle, 0, radius, Math.PI / 2, Math.PI * 1.5, false);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: true, bevelSize: .013, bevelThickness: .012, bevelSegments: 3, steps: 1, curveSegments: 24 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, y - height / 2, 0);
    cache.set(`oval:${width}:${depth}:${height}`, geo); return mesh(geo, material);
  }

  // A substantial racetrack table with a fine ivory lip and warm walnut surface.
  oval(1.64, 1.13, .075, 'ivory', .716);
  oval(1.61, 1.10, .027, 'walnut', .771);
  oval(1.50, 1.0, .012, 'woodEdge', .67);
  for (const x of [-.52, .52]) for (const z of [-.31, .31]) {
    bar([x * 1.03, .047, z * 1.04], [x, .68, z], .025, 'brass');
    cylinder(.033, .038, .025, 'ink', x * 1.03, .035, z * 1.04);
  }
  bar([-.51, .35, -.30], [.51, .35, -.30], .017, 'brass');
  bar([-.51, .35, .30], [.51, .35, .30], .017, 'brass');
  // Shared sketch in the centre, colour samples, and a brass pen.
  const plan = group(0, .803, 0); plan.rotation.y = -.16;
  round(.28, .006, .25, .003, 'paper', 0, 0, 0, plan);
  for (let i = 0; i < 3; i++) {
    round(.042, .003, .047, .001, i === 1 ? 'terra' : 'blue', -.082 + i * .082, .005, -.067, plan);
    round(.004, .003, .067, .001, 'woodEdge', -.082 + i * .082, .005, -.01, plan);
  }
  round(.21, .003, .025, .001, 'sage', 0, .005, .044, plan);
  bar([.19, .809, -.09], [.22, .809, .067], .007, 'brass');

  const seats = [
    { x: -.96, z: 0, turn: -Math.PI / 2, shirt: 'ivory', chair: 'navy' },
    { x: .96, z: 0, turn: Math.PI / 2, shirt: 'terra', chair: 'navy' },
    { x: 0, z: -.78, turn: Math.PI, shirt: 'blue', chair: 'sage' },
    { x: 0, z: .74, turn: 0, shirt: 'sage', chair: 'navy' },
  ];
  seats.forEach(({ x, z, turn, shirt, chair: chairColor }, index) => {
    const setting = group(x, 0, z); setting.rotation.y = turn;
    // A moulded upholstered chair, stitched seat, five metal spokes and casters.
    cylinder(.036, .048, .255, 'brass', 0, .25, 0, setting);
    cylinder(.069, .076, .053, 'ink', 0, .122, 0, setting);
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5, xx = .192 * Math.cos(angle), zz = .192 * Math.sin(angle);
      bar([0, .125, 0], [xx, .071, zz], .017, 'brass', setting);
      cylinder(.029, .029, .041, 'ink', xx, .045, zz, setting).rotation.z = Math.PI / 2;
    }
    round(.35, .069, .33, .03, chairColor, 0, .414, 0, setting);
    round(.314, .034, .292, .015, 'navy', 0, .463, -.012, setting);
    round(.363, .359, .08, .039, chairColor, 0, .624, .148, setting).rotation.x = -.1;
    round(.296, .272, .026, .012, chairColor === 'sage' ? 'sage' : 'blue', 0, .643, .099, setting).rotation.x = -.1;
    for (const side of [-1, 1]) {
      bar([side * .173, .435, .10], [side * .173, .646, .05], .011, 'brass', setting);
      round(.039, .025, .192, .012, chairColor, side * .173, .66, -.002, setting);
      // Trouser knees and lower legs, shoes set independently on the floor.
      bar([side * .073, .49, -.015], [side * .081, .432, -.17], .054, 'ink', setting);
      sphere(.052, 'ink', side * .081, .427, -.173, [1, 1, 1], setting);
      bar([side * .081, .423, -.173], [side * .085, .137, -.21], .041, 'ink', setting);
      round(.093, .055, .145, .025, 'hair', side * .085, .104, -.243, setting);
      round(.096, .012, .147, .005, 'ivory', side * .085, .075, -.243, setting);
    }
    sphere(.13, 'ink', 0, .503, -.018, [1.02, .55, .87], setting);

    // Open laptop: metal deck, individual keys and a distinct product screen per role.
    const laptop = group(0, .799, -.419, setting);
    round(.324, .019, .218, .009, 'silver', 0, .008, 0, laptop);
    round(.102, .003, .043, .001, 'ivory', 0, .02, .067, laptop);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 8; col++) round(.026, .006, .022, .003, 'ink', -.124 + col * .035, .023, -.067 + row * .031, laptop);
    const screen = group(0, .127, -.103, laptop); screen.rotation.x = -.16;
    round(.324, .23, .022, .01, 'ink', 0, 0, 0, screen);
    round(.294, .202, .006, .002, 'screen', 0, 0, .014, screen);
    round(.015, .004, .003, .001, 'silver', 0, .106, .015, screen);
    round(.067, .190, .003, .001, 'navy', -.11, 0, .018, screen);
    for (let row = 0; row < 4; row++) round(.043, .007, .003, .001, row === index ? 'pixels' : 'screen', -.11, .069 - row * .037, .021, screen);
    round(.157, .012, .003, .001, 'pixels', .039, .072, .018, screen);
    for (let row = 0; row < 4; row++) round(.142 - row % 2 * .041, .006, .003, .001, 'pixels', .03, .04 - row * .022, .018, screen);
    for (let col = 0; col < 4; col++) round(.024, .032 + col * .009, .003, .001, col === index ? 'sage' : 'blue', -.011 + col * .038, -.062 + col * .0045, .019, screen);
    // Each person has a different notebook and a small filled ceramic cup.
    if (index < 2) {
      round(.122, .022, .176, .008, index === 0 ? 'terra' : 'blue', .238, .805, -.44, setting);
      round(.112, .008, .159, .003, 'paper', .238, .813, -.44, setting);
      round(.005, .003, .163, .001, 'brass', .203, .819, -.44, setting);
    }
    cylinder(.036, .032, .062, 'ivory', -.225, .837, -.414, setting);
    cylinder(.028, .028, .004, 'hair', -.225, .869, -.414, setting);
    ring(.021, .006, 'ivory', -.264, .841, -.414, setting).rotation.y = Math.PI / 2;

    // Moving torso and arms are kept outside the static geometry batches.
    const avatar = group(x, .54, z - 0, root); avatar.rotation.y = turn;
    const body = group(0, 0, -.013, avatar);
    sphere(.134, shirt, 0, .145, -.013, [1.05, 1.3, .67], body).rotation.x = -.1;
    cylinder(.036, .041, .09, `skin${index}`, 0, .32, -.042, body);
    const head = group(0, .408, -.056, body);
    sphere(.099, `skin${index}`, 0, 0, 0, [.9, 1.11, .93], head);
    sphere(.019, `skin${index}`, 0, -.008, -.092, [.77, .71, 1], head);
    for (const side of [-1, 1]) sphere(.018, `skin${index}`, side * .087, -.012, 0, [.57, 1, .74], head);
    const hair = mesh(geometry(`hair:${index}`, () => new THREE.SphereGeometry(.102, 18, 12, 0, Math.PI * 2, 0, Math.PI * (index === 3 ? .64 : .56))), 'hair', head);
    hair.position.y = .014; hair.scale.set(.94, 1.04, .99);
    if (index === 1 || index === 3) sphere(.054, 'hair', 0, .035, .079, [1, 1.1, .87], head);
    if (index === 0) {
      for (const side of [-1, 1]) ring(.031, .004, 'brass', side * .036, .004, -.088, head);
      bar([-.008, .004, -.09], [.008, .004, -.09], .003, 'brass', head);
    }
    const arms = [];
    for (const sign of [-1, 1]) {
      const shoulder = group(sign * .125, .231, -.026, body);
      sphere(.049, shirt, 0, 0, 0, [.88, 1, 1], shoulder);
      bar([0, 0, 0], [sign * .025, -.098, -.088], .038, shirt, shoulder);
      sphere(.038, shirt, sign * .025, -.098, -.088, [1, 1, 1], shoulder);
      const elbow = group(sign * .025, -.098, -.088, shoulder);
      bar([0, 0, 0], [-sign * .025, .108, -.165], .024, `skin${index}`, elbow);
      sphere(.030, `skin${index}`, -sign * .025, .109, -.181, [.85, .55, 1.18], elbow);
      arms.push({ shoulder, elbow, sign });
    }
    const haloMaterial = new THREE.MeshStandardMaterial({ color: 0x42776f, emissive: 0x66e2cc, emissiveIntensity: .1, metalness: .3, roughness: .37, transparent: true, opacity: .32 });
    const halo = ring(.185, .009, haloMaterial, x, .032, z, root); halo.rotation.x = -Math.PI / 2;
    const marker = group(x, .019, z, root); marker.rotation.y = turn;
    round(.157, .021, .077, .01, 'brass', 0, 0, .211, marker);
    for (let i = 0; i <= index; i++) round(.017, .004, .031, .002, haloMaterial, (i - index / 2) * .027, .013, .211, marker);
    people.push({ body, head, arms, halo, haloMaterial, marker, index });
  });

  // Batch the fixed miniature by material, while keeping human motion articulated.
  furniture.updateMatrixWorld(true);
  const batches = new Map();
  furniture.traverse(object => {
    if (!object.isMesh) return;
    const geo = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone(); geo.applyMatrix4(object.matrixWorld);
    const key = object.material.uuid;
    if (!batches.has(key)) batches.set(key, { material: object.material, positions: [], normals: [] });
    const batch = batches.get(key);
    for (const value of geo.attributes.position.array) batch.positions.push(value);
    for (const value of geo.attributes.normal.array) batch.normals.push(value);
    geo.dispose();
  });
  root.remove(furniture);
  for (const batch of batches.values()) {
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(batch.positions, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(batch.normals, 3)); geo.computeBoundingSphere();
    mesh(geo, batch.material, root);
  }
  // Fuse pieces within each individual joint, never across a moving joint.
  const joints = []; root.traverse(object => { if (object.isGroup) joints.push(object); });
  for (const joint of joints) {
    const local = new Map();
    for (const object of joint.children) if (object.isMesh) {
      const key = object.material.uuid;
      if (!local.has(key)) local.set(key, []);
      local.get(key).push(object);
    }
    for (const pieces of local.values()) {
      if (pieces.length < 2) continue;
      const positions = [], normals = [];
      for (const object of pieces) {
        object.updateMatrix();
        const geo = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone(); geo.applyMatrix4(object.matrix);
        for (const value of geo.attributes.position.array) positions.push(value);
        for (const value of geo.attributes.normal.array) normals.push(value);
        geo.dispose(); joint.remove(object);
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3)); geo.computeBoundingSphere();
      mesh(geo, pieces[0].material, joint);
    }
  }
  const live = new Set(); root.traverse(object => { if (object.isMesh) live.add(object.geometry); });
  for (const geo of cache.values()) if (!live.has(geo)) geo.dispose();
  const ease = value => { const v = THREE.MathUtils.clamp(value, 0, 1); return v * v * (3 - 2 * v); };
  const window = (phase, start, rise, end, fall) => ease((phase - start) / rise) * (1 - ease((phase - end) / fall));
  let dark = false;
  root.userData.animate = (time, state = {}) => {
    const safeTime = Number.isFinite(time) ? time : 0;
    const phase = ((Number.isFinite(state.phase) ? state.phase : safeTime) % 16 + 16) % 16;
    const matched = Number.isFinite(state.matched) ? state.matched : Math.floor(THREE.MathUtils.clamp((phase - 4) / 5, 0, 1) * 4);
    const reset = 1 - ease((phase - 14.5) / 1.5);
    people.forEach(({ body, head, arms, halo, haloMaterial, marker, index }) => {
      const selected = matched > index ? reset : 0;
      const acknowledge = window(phase, 4.25 + index * 1.05, .33, 5 + index * 1.05, .55);
      const celebrate = window(phase, 10 + index * .36, .55, 12.85, .8);
      const typing = (1 - celebrate) * (1 - acknowledge * .8);
      body.rotation.set(-.045 * acknowledge + .06 * celebrate, (index % 2 ? -1 : 1) * .18 * celebrate, .014 * Math.sin(safeTime * 1.4 + index) * typing);
      head.rotation.set(-.07 + .16 * acknowledge + .07 * celebrate, .24 * Math.sin(safeTime * .7 + index) * typing + (index % 2 ? -.35 : .35) * celebrate, .02 * Math.sin(safeTime + index));
      arms.forEach(({ shoulder, elbow, sign }, armIndex) => {
        const stroke = Math.sin(safeTime * 8 + index * 1.2 + armIndex * Math.PI);
        const raised = armIndex === index % 2 ? celebrate : 0;
        shoulder.rotation.set(.037 * stroke * typing + 1.21 * raised, 0, -sign * (.19 * raised));
        elbow.rotation.set(.075 * stroke * typing - .55 * raised, 0, sign * .16 * Math.sin(safeTime * 6 + index) * raised);
      });
      halo.scale.setScalar(1 + .09 * acknowledge + .025 * selected * Math.sin(safeTime * 3 + index));
      haloMaterial.opacity = .14 + .8 * selected;
      haloMaterial.emissiveIntensity = (.04 + selected * (.78 + .16 * Math.sin(safeTime * 3 + index))) * (dark ? 1 : .6);
      marker.position.y = .019 + .018 * acknowledge;
    });
  };
  root.userData.setTheme = theme => {
    dark = theme === 'dark';
    materials.screen.emissiveIntensity = dark ? .62 : .18;
    materials.pixels.emissiveIntensity = dark ? .72 : .18;
  };
  root.userData.animate(0); root.userData.setTheme('light');
  return root;
}
