// The human scale of Brain Org: a pair of carefully dressed miniature workspaces.
export function createOfficeDetails(THREE) {
  const root = new THREE.Group();
  root.name = 'brain-org-office';
  const staticRoot = new THREE.Group();
  root.add(staticRoot);
  const mats = {
    ivory: new THREE.MeshStandardMaterial({ color: 0xf4ecdc, roughness: .46 }),
    oak: new THREE.MeshStandardMaterial({ color: 0xb98b58, roughness: .6 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x19459f, roughness: .34 }),
    velvet: new THREE.MeshStandardMaterial({ color: 0x17366e, roughness: .82 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xcba66b, roughness: .27, metalness: .78 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x202e41, roughness: .47 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xd5cbb9, roughness: .84 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xdbaf89, roughness: .62 }),
    skinDark: new THREE.MeshStandardMaterial({ color: 0x976342, roughness: .68 }),
    hair: new THREE.MeshStandardMaterial({ color: 0x2b201c, roughness: .77 }),
    terra: new THREE.MeshStandardMaterial({ color: 0xb96b4e, roughness: .73 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x3c7159, roughness: .62 }),
    leafLight: new THREE.MeshStandardMaterial({ color: 0x79a283, roughness: .65 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x528eae, emissive: 0x528eae, emissiveIntensity: .36, roughness: .25 }),
    pixels: new THREE.MeshStandardMaterial({ color: 0xe8f1e2, emissive: 0x93d6ed, emissiveIntensity: .28, roughness: .5 }),
    lamp: new THREE.MeshStandardMaterial({ color: 0xfff1ca, emissive: 0xffc16c, emissiveIntensity: .4, roughness: .5 }),
  };
  const geometries = new Map(), people = [], progressBars = [], lights = [];
  const geometry = (key, build) => {
    if (!geometries.has(key)) geometries.set(key, build());
    return geometries.get(key);
  };
  const mesh = (geo, material, parent = staticRoot) => {
    const item = new THREE.Mesh(geo, mats[material]);
    item.castShadow = item.receiveShadow = true;
    parent.add(item);
    return item;
  };
  const group = (x, y, z, parent = staticRoot) => {
    const item = new THREE.Group(); item.position.set(x, y, z); parent.add(item); return item;
  };
  function rounded(w, h, d, r, material, x, y, z, parent = staticRoot) {
    const radius = Math.min(r, w / 2, h / 2, d / 2) * .99;
    const key = `rounded:${w}:${h}:${d}:${radius}`;
    const geo = geometry(key, () => {
      const g = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
      const positions = g.attributes.position, normals = g.attributes.normal;
      const sizes = [w, h, d];
      const core = new THREE.Vector3(w / 2 - radius, h / 2 - radius, d / 2 - radius);
      const p = new THREE.Vector3(), nearest = new THREE.Vector3(), normal = new THREE.Vector3();
      for (let i = 0; i < positions.count; i++) {
        const unit = [positions.getX(i), positions.getY(i), positions.getZ(i)];
        const coords = unit.map((v, axis) => {
          const index = Math.round((v + .5) * 5), half = sizes[axis] / 2;
          return [-half, -half + radius * .293, -half + radius, half - radius, half - radius * .293, half][index];
        });
        p.set(...coords);
        nearest.set(THREE.MathUtils.clamp(p.x, -core.x, core.x), THREE.MathUtils.clamp(p.y, -core.y, core.y), THREE.MathUtils.clamp(p.z, -core.z, core.z));
        normal.subVectors(p, nearest).normalize();
        p.copy(nearest).addScaledVector(normal, radius);
        positions.setXYZ(i, p.x, p.y, p.z);
        normals.setXYZ(i, normal.x, normal.y, normal.z);
      }
      g.computeBoundingSphere();
      return g;
    });
    const item = mesh(geo, material, parent); item.position.set(x, y, z); return item;
  }
  function sphere(r, material, x, y, z, sx = 1, sy = 1, sz = 1, parent = staticRoot) {
    const item = mesh(geometry(`sphere:${r}`, () => new THREE.SphereGeometry(r, 18, 12)), material, parent);
    item.position.set(x, y, z); item.scale.set(sx, sy, sz); return item;
  }
  function cylinder(rt, rb, h, material, x, y, z, parent = staticRoot) {
    const item = mesh(geometry(`cylinder:${rt}:${rb}:${h}`, () => new THREE.CylinderGeometry(rt, rb, h, 20)), material, parent);
    item.position.set(x, y, z); return item;
  }
  function bar(a, b, r, material, parent = staticRoot) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
    const item = cylinder(r, r, delta.length(), material, 0, 0, 0, parent);
    item.position.copy(start).add(end).multiplyScalar(.5);
    item.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return item;
  }
  function tube(points, radius, material, parent = staticRoot) {
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 20, radius, 6, false);
    geometries.set(`tube:${geometries.size}`, geo);
    return mesh(geo, material, parent);
  }
  function ring(r, thickness, material, x, y, z, parent = staticRoot) {
    const item = mesh(geometry(`ring:${r}:${thickness}`, () => new THREE.TorusGeometry(r, thickness, 6, 24)), material, parent);
    item.position.set(x, y, z); return item;
  }
  function book(w, h, d, color, x, y, z, parent = staticRoot) {
    rounded(w, h, d, .008, color, x, y, z, parent);
    rounded(w * .74, h * .88, d + .004, .004, 'ivory', x, y, z + .008, parent);
    rounded(w, h, .012, .004, color, x, y, z + d / 2, parent);
    for (const level of [-.31, .30]) rounded(w * .75, .012, .004, .001, 'brass', x, y + h * level, z + d / 2 + .008, parent);
  }

  // A low, open shelving unit: each shelf has its own small composition.
  const shelf = group(-2.21, .22, -1.18);
  rounded(1.13, 1.46, .045, .02, 'cream', 0, .79, -.17, shelf);
  for (const x of [-.53, .53]) rounded(.065, 1.57, .38, .018, 'oak', x, .79, 0, shelf);
  for (const y of [.08, .53, 1.03, 1.55]) rounded(1.15, .06, .40, .02, 'ivory', 0, y, 0, shelf);
  for (const x of [-.43, .43]) cylinder(.032, .032, .12, 'brass', x, .04, .11, shelf);
  const colors = ['blue', 'terra', 'ivory', 'dark', 'cream'];
  for (let i = 0; i < 6; i++) book(.074, .25 + (i % 3) * .038, .19, colors[i % 5], -.37 + i * .083, .675 + (i % 3) * .019, .045, shelf);
  for (let i = 0; i < 4; i++) book(.074, .28 + (i % 2) * .045, .19, colors[(i + 2) % 5], .14 + i * .083, 1.20 + (i % 2) * .0225, .045, shelf);
  rounded(.40, .25, .28, .027, 'blue', -.25, .235, .016, shelf);
  rounded(.37, .025, .27, .008, 'velvet', -.25, .37, .016, shelf);
  rounded(.11, .045, .012, .005, 'brass', -.25, .25, .164, shelf);
  rounded(.24, .21, .27, .022, 'cream', .27, .214, .016, shelf);
  rounded(.075, .018, .012, .004, 'dark', .27, .24, .158, shelf);
  cylinder(.095, .065, .20, 'terra', -.30, 1.17, .045, shelf);
  cylinder(.055, .075, .07, 'terra', -.30, 1.30, .045, shelf);
  sphere(.065, 'leaf', -.30, 1.44, .045, .8, 1.1, .8, shelf);
  for (const side of [-1, 1]) sphere(.045, 'leafLight', -.30 + side * .067, 1.405, .045, 1, .65, .55, shelf).rotation.z = side * .55;
  rounded(.24, .30, .025, .013, 'brass', .32, .80, .03, shelf);
  rounded(.195, .255, .015, .007, 'ivory', .32, .80, .048, shelf);
  sphere(.054, 'blue', .32, .82, .058, 1, 1, .16, shelf);

  // A sculptural rubber plant balances the shelves without blocking the neural core.
  const plant = group(2.40, .21, -1.05);
  cylinder(.215, .165, .30, 'terra', 0, .16, 0, plant);
  cylinder(.22, .214, .046, 'terra', 0, .315, 0, plant);
  cylinder(.190, .190, .011, 'hair', 0, .34, 0, plant);
  for (let i = 0; i < 9; i++) {
    const angle = i * 2.39996, height = .57 + i * .096, extent = .14 + (i % 3) * .065;
    const end = [Math.cos(angle) * extent, height, Math.sin(angle) * extent];
    tube([[0, .34, 0], [Math.cos(angle) * .045, height * .78, Math.sin(angle) * .045], end], .009, 'leaf', plant);
    const leaf = sphere(.12, i % 3 === 0 ? 'leafLight' : 'leaf', ...end, .62, 1.46, .17, plant);
    leaf.rotation.set(Math.sin(angle) * .72, angle, -Math.cos(angle) * .76);
    const vein = bar([0, -.135, .021], [0, .132, .021], .003, 'leafLight', leaf);
    vein.castShadow = false;
  }

  for (const [index, x] of [-2, 2].entries()) {
    const desk = group(x, 0, -.15);
    const side = index === 0 ? -1 : 1;
    // Solid sculpted top, inset desk mat and inset drawer pedestals.
    rounded(1.31, .105, .83, .047, 'ivory', 0, 1.025, 0, desk);
    rounded(1.27, .026, .79, .012, 'oak', 0, .961, 0, desk);
    for (const dx of [-.52, .52]) {
      rounded(.066, .71, .065, .018, 'oak', dx, .60, -.28, desk);
      rounded(.066, .71, .065, .018, 'oak', dx, .60, .29, desk);
      rounded(.075, .065, .074, .012, 'brass', dx, .266, .29, desk);
      rounded(.075, .065, .074, .012, 'brass', dx, .266, -.28, desk);
    }
    const cabinetX = side * .45;
    rounded(.31, .49, .51, .035, 'cream', cabinetX, .67, -.02, desk);
    for (const y of [.54, .78]) {
      rounded(.282, .215, .029, .018, 'ivory', cabinetX, y, .25, desk);
      rounded(.094, .019, .024, .007, 'brass', cabinetX, y + .045, .278, desk);
    }
    rounded(.70, .012, .45, .006, 'velvet', -.035, 1.087, .01, desk);
    // Machined laptop with bevelled rim, a tiny split-screen application, and real keys.
    rounded(.56, .025, .35, .012, 'dark', 0, 1.110, -.01, desk);
    rounded(.525, .013, .319, .006, 'cream', 0, 1.126, -.004, desk);
    const screen = group(0, 1.307, -.183, desk); screen.rotation.x = -.12;
    rounded(.56, .355, .036, .017, 'dark', 0, 0, 0, screen);
    rounded(.509, .304, .008, .004, 'screen', 0, .001, .022, screen);
    rounded(.032, .007, .004, .002, 'dark', 0, .155, .026, screen);
    rounded(.112, .282, .004, .002, 'velvet', -.188, 0, .028, screen);
    for (let i = 0; i < 5; i++) rounded(.067, .009, .004, .002, i === index ? 'pixels' : 'screen', -.190, .098 - i * .042, .032, screen);
    rounded(.286, .014, .004, .002, 'pixels', .064, .117, .029, screen);
    for (let i = 0; i < 4; i++) rounded(.266 - (i % 2) * .049, .008, .004, .002, 'pixels', .05, .07 - i * .028, .029, screen);
    // These bars remain independent of the furniture batches so progress reads live.
    rounded(.279, .048, .004, .002, 'velvet', .055, -.111, .030, screen);
    const liveScreen = group(x, 1.307, -.333, root); liveScreen.rotation.x = -.12;
    const progress = group(-.076, -.111, .034, liveScreen);
    rounded(.257, .028, .006, .002, 'pixels', .1285, 0, 0, progress);
    progressBars.push(progress);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 10; col++) rounded(.031, .006, .026, .003, 'dark', -.20 + col * .044, 1.137, -.12 + row * .037, desk);
    rounded(.15, .006, .055, .003, 'ivory', 0, 1.139, .105, desk);
    rounded(.084, .043, .12, .02, 'ivory', .439, 1.11, .12, desk);
    rounded(.005, .003, .032, .001, 'dark', .439, 1.134, .096, desk);
    // Folded paperwork, a filled coffee cup, and a pen.
    for (let i = 0; i < 3; i++) rounded(.18, .010, .21, .004, i === 0 ? 'blue' : 'ivory', side * .445 + i * .008, 1.094 + i * .012, -.215, desk);
    for (let i = 0; i < 3; i++) rounded(.11 - i * .018, .002, .007, .001, 'cream', side * .445, 1.129, -.26 + i * .026, desk);
    bar([side * .36, 1.095, .21], [side * .50, 1.095, .27], .007, 'brass', desk);
    cylinder(.060, .055, .115, 'terra', -side * .46, 1.145, .22, desk);
    cylinder(.047, .047, .005, 'hair', -side * .46, 1.201, .22, desk);
    ring(.034, .009, 'terra', -side * .531, 1.147, .22, desk).rotation.y = Math.PI / 2;
    // A bent brass lamp and cream shade, with a small warm pool over the keyboard.
    const lampX = -side * .495;
    cylinder(.074, .087, .025, 'brass', lampX, 1.096, -.235, desk);
    tube([[lampX, 1.11, -.235], [lampX, 1.42, -.235], [lampX + side * .025, 1.58, -.20], [lampX + side * .16, 1.59, -.13]], .014, 'brass', desk);
    cylinder(.062, .11, .105, 'ivory', lampX + side * .16, 1.552, -.13, desk);
    cylinder(.095, .095, .012, 'lamp', lampX + side * .16, 1.497, -.13, desk);
    const light = new THREE.PointLight(0xffc87d, .13, 1.4, 2);
    light.position.set(x + lampX + side * .16, 1.473, -.28); root.add(light); lights.push(light);

    // Five-star swivel base and a padded chair shell with separate seat/back cushions.
    const chair = group(x, 0, .425);
    cylinder(.042, .052, .27, 'brass', 0, .43, 0, chair);
    cylinder(.08, .10, .09, 'dark', 0, .29, 0, chair);
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5;
      const dx = Math.cos(angle) * .24, dz = Math.sin(angle) * .24;
      bar([0, .32, 0], [dx, .265, dz], .021, 'brass', chair);
      const wheel = cylinder(.037, .037, .055, 'dark', dx, .234, dz, chair); wheel.rotation.z = Math.PI / 2;
    }
    rounded(.45, .085, .42, .04, 'blue', 0, .615, -.013, chair);
    rounded(.38, .046, .36, .022, 'velvet', 0, .67, -.025, chair);
    const back = rounded(.45, .46, .093, .044, 'blue', 0, .89, .18, chair); back.rotation.x = -.13;
    rounded(.373, .34, .026, .012, 'velvet', 0, .922, .116, chair).rotation.x = -.13;
    for (const dx of [-.22, .22]) {
      tube([[dx, .63, .12], [dx, .85, .11], [dx, .85, -.16]], .015, 'brass', chair);
      rounded(.056, .035, .24, .015, 'blue', dx, .855, -.02, chair);
    }
    const skin = index === 0 ? 'skinDark' : 'skin';
    const shirt = index === 0 ? 'ivory' : 'blue';
    const person = group(x, 0, .37);
    sphere(.155, 'dark', 0, .724, -.025, .98, .56, .81, person);
    // Hip, shoulders and elbows are real pivots. They remain outside staticRoot.
    const upperBody = group(x, .80, .37, root);
    sphere(.158, shirt, 0, .170, -.035, 1.07, 1.39, .68, upperBody).rotation.x = -.1;
    cylinder(.043, .048, .12, skin, 0, .394, -.073, upperBody);
    const arms = [];
    for (const sign of [-1, 1]) {
      const shoulder = group(sign * .145, .275, -.045, upperBody);
      sphere(.063, shirt, 0, 0, 0, .88, 1, 1, shoulder);
      bar([0, 0, 0], [sign * .048, -.135, -.110], .046, shirt, shoulder);
      sphere(.048, shirt, sign * .048, -.135, -.110, 1, 1, 1, shoulder);
      const elbow = group(sign * .048, -.135, -.110, shoulder);
      bar([0, 0, 0], [-sign * .043, .175, -.235], .031, skin, elbow);
      sphere(.039, skin, -sign * .048, .181, -.249, .82, .49, 1.15, elbow);
      arms.push({ shoulder, elbow, sign });
      bar([sign * .083, .725, -.035], [sign * .104, .662, -.22], .065, 'dark', person);
      sphere(.065, 'dark', sign * .104, .662, -.22, 1, 1, 1, person);
      bar([sign * .104, .65, -.22], [sign * .104, .312, -.21], .048, 'dark', person);
      rounded(.115, .068, .19, .027, 'hair', sign * .104, .273, -.259, person);
    }
    const head = group(0, .535, -.081, upperBody);
    sphere(.12, skin, 0, 0, 0, .90, 1.13, .91, head);
    sphere(.024, skin, 0, -.01, -.113, .8, .65, 1, head);
    for (const sign of [-1, 1]) sphere(.023, skin, sign * .102, -.015, 0, .6, 1, .8, head);
    const capGeo = geometry(`haircap:${index}`, () => new THREE.SphereGeometry(.124, 18, 12, 0, Math.PI * 2, 0, Math.PI * .58));
    const cap = mesh(capGeo, 'hair', head); cap.position.y = .018; cap.scale.set(.94, 1.05, .95);
    if (index === 0) sphere(.07, 'hair', 0, .063, .099, 1, 1, .84, head);
    else rounded(.185, .026, .014, .007, 'brass', 0, -.003, -.111, head);
    people.push({ upperBody, head, arms, side });
  }

  // Merge static objects by material while retaining the model's original coordinates.
  staticRoot.updateMatrixWorld(true);
  const batches = new Map();
  staticRoot.traverse(object => {
    if (!object.isMesh) return;
    const source = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    source.applyMatrix4(object.matrixWorld);
    const key = object.material.uuid;
    if (!batches.has(key)) batches.set(key, { material: object.material, positions: [], normals: [] });
    const batch = batches.get(key);
    for (const value of source.attributes.position.array) batch.positions.push(value);
    for (const value of source.attributes.normal.array) batch.normals.push(value);
    source.dispose();
  });
  root.remove(staticRoot);
  for (const batch of batches.values()) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(batch.positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(batch.normals, 3));
    geo.computeBoundingSphere();
    const item = new THREE.Mesh(geo, batch.material); item.castShadow = item.receiveShadow = true; root.add(item);
  }
  const liveGeometries = new Set();
  root.traverse(object => { if (object.isMesh) liveGeometries.add(object.geometry); });
  for (const geo of geometries.values()) if (!liveGeometries.has(geo)) geo.dispose();
  const clamp = value => THREE.MathUtils.clamp(value, 0, 1);
  const ease = value => { const v = clamp(value); return v * v * (3 - 2 * v); };
  const window = (phase, start, rise, end, fall) => ease((phase - start) / rise) * (1 - ease((phase - end) / fall));
  root.userData.animate = (time, state = {}) => {
    const phase = Number.isFinite(state.phase) ? ((state.phase % 16) + 16) % 16 : ((time % 16) + 16) % 16;
    const attention = window(phase, 2.8, .65, 6.25, .75);
    const relief = window(phase, 12.3, .55, 14.05, .85);
    const solved = Number.isFinite(state.solved) ? clamp(state.solved) : ease((phase - 6.3) / 6.3);
    const fade = 1 - ease((phase - 14.3) / 1.7);
    people.forEach(({ upperBody, head, arms, side }, i) => {
      const offset = i * .35;
      const typing = (1 - attention) * (1 - relief);
      // A visible pause, inward glance and lean tell us the workers noticed a problem.
      upperBody.rotation.set(.14 * attention + .08 * relief, side * .22 * attention, side * .035 * relief);
      head.rotation.set(-.07 + .26 * attention + .04 * relief + Math.sin(time * 1.5 + i) * .022 * typing,
        side * (.64 * attention + .30 * relief), 0);
      arms.forEach(({ shoulder, elbow, sign }, j) => {
        const keyStroke = Math.sin(time * 9 + offset + j * Math.PI);
        const raised = j === i ? relief : 0;
        shoulder.rotation.set(.035 * keyStroke * typing + .24 * attention + 1.35 * raised,
          0, -sign * (.04 * attention + .22 * raised));
        elbow.rotation.set(.10 * keyStroke * typing - .16 * attention - .6 * raised,
          0, sign * .07 * Math.sin(time * 9 + j) * raised);
      });
      progressBars[i].scale.x = .08 + .92 * clamp(solved - i * .045) * fade;
    });
  };
  root.userData.setTheme = theme => {
    const dark = theme === 'dark';
    lights.forEach(light => { light.intensity = dark ? .65 : .10; });
    mats.screen.emissiveIntensity = dark ? .75 : .24;
    mats.pixels.emissiveIntensity = dark ? .58 : .15;
    mats.lamp.emissiveIntensity = dark ? 1.4 : .36;
  };
  root.userData.animate(0);
  root.userData.setTheme('light');
  return root;
}
