// A compact seven-axis matching instrument for the HackAtlas team workshop.
export function createFitPanel(THREE) {
  const root = new THREE.Group();
  root.name = 'hackatlas-fit-instrument';
  const staticGroup = new THREE.Group();
  root.add(staticGroup);
  const makeMaterial = (color, metalness = 0, roughness = .55) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const housing = makeMaterial(0xebe2d0, .18, .43);
  const brass = makeMaterial(0xbc9b63, .76, .32);
  const ink = makeMaterial(0x0c1d32, .15, .40);
  const gridMaterial = new THREE.MeshBasicMaterial({ color: 0x35506c, transparent: true, opacity: .66 });
  const tickMaterial = new THREE.MeshBasicMaterial({ color: 0x7d9aaa });
  const radarMaterial = new THREE.MeshBasicMaterial({ color: 0x246fec, transparent: true, opacity: .40, side: THREE.DoubleSide, depthWrite: false });
  const cyan = new THREE.MeshBasicMaterial({ color: 0x83d6e5 });
  const muted = new THREE.MeshBasicMaterial({ color: 0x304a60 });
  const scanMaterial = new THREE.MeshBasicMaterial({ color: 0x77d3ec, transparent: true, opacity: .20, side: THREE.DoubleSide, depthWrite: false });
  const add = (geo, material, parent = staticGroup) => {
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = !material.isMeshBasicMaterial;
    mesh.receiveShadow = !material.isMeshBasicMaterial;
    parent.add(mesh);
    return mesh;
  };
  function rounded(width, height, depth, z, radius, material) {
    const shape = new THREE.Shape();
    const x = -width / 2, y = -height / 2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 5 });
    geometry.translate(0, 0, z);
    return add(geometry, material);
  }
  function segment(a, b, width, material, parent = staticGroup) {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const mesh = add(new THREE.CylinderGeometry(width, width, start.distanceTo(end), 5), material, parent);
    mesh.position.copy(start).add(end).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
    return mesh;
  }
  function rectangle(w, h, x, y, z, material, parent = staticGroup) {
    const mesh = add(new THREE.PlaneGeometry(w, h), material, parent);
    mesh.position.set(x, y, z);
    return mesh;
  }
  rounded(1.85, 1.20, .14, -.07, .065, housing);
  rounded(1.79, 1.14, .032, .071, .049, brass);
  rounded(1.71, 1.055, .016, .105, .027, ink);
  // The hardware is tangible even when the display is viewed edge-on.
  for (const x of [-.867, .867]) for (const y of [-.52, .52]) {
    const bolt = add(new THREE.CylinderGeometry(.016, .016, .012, 10), brass);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(x, y, .112);
    rectangle(.016, .0028, x, y, .12, tickMaterial);
  }
  for (let i = 0; i < 9; i++) {
    const vent = add(new THREE.BoxGeometry(.06, .009, .015), ink);
    vent.position.set(-.40 + i * .10, -.582, -.007);
  }
  rectangle(1.53, .003, 0, .307, .126, gridMaterial);
  rectangle(.003, .70, .277, -.097, .126, gridMaterial);
  rectangle(1.53, .003, 0, -.46, .126, gridMaterial);

  const centerX = -.278, centerY = -.075, radius = .345;
  const point = (i, amount, z = .132) => {
    const angle = Math.PI / 2 + i * Math.PI * 2 / 7;
    return [centerX + Math.cos(angle) * radius * amount, centerY + Math.sin(angle) * radius * amount, z];
  };
  for (let ring = 1; ring <= 4; ring++) {
    for (let i = 0; i < 7; i++) segment(point(i, ring / 4), point((i + 1) % 7, ring / 4), .0022, gridMaterial);
  }
  for (let i = 0; i < 7; i++) {
    segment([centerX, centerY, .132], point(i, 1), .0022, gridMaterial);
    segment(point(i, 1.07), point(i, 1.115), .004, tickMaterial);
  }
  // Fine calibration marks are deliberately quiet beside the changing fit shape.
  for (let i = 0; i <= 18; i++) {
    const a = .31 + i / 18 * 2.50;
    const start = [centerX + Math.cos(a) * .402, centerY + Math.sin(a) * .402, .132];
    const end = [centerX + Math.cos(a) * (i % 3 ? .407 : .417), centerY + Math.sin(a) * (i % 3 ? .407 : .417), .132];
    segment(start, end, .0019, tickMaterial);
  }
  const graphPositions = new Float32Array(9 * 3);
  const graphGeometry = new THREE.BufferGeometry();
  graphGeometry.setAttribute('position', new THREE.BufferAttribute(graphPositions, 3));
  const triangles = [];
  for (let i = 1; i <= 7; i++) triangles.push(0, i, i + 1);
  graphGeometry.setIndex(triangles);
  const graph = add(graphGeometry, radarMaterial, root);
  graph.name = 'complementary-skills-radar';
  const outlinePoints = new Float32Array(8 * 3);
  const outlineGeometry = new THREE.BufferGeometry();
  outlineGeometry.setAttribute('position', new THREE.BufferAttribute(outlinePoints, 3));
  const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x94e7ee, transparent: true, opacity: .95 });
  const outline = new THREE.Line(outlineGeometry, outlineMaterial);
  root.add(outline);
  const vertices = Array.from({ length: 7 }, () => add(new THREE.SphereGeometry(.012, 8, 5), cyan, root));
  const scanner = new THREE.Group();
  scanner.position.set(centerX, centerY, .144);
  root.add(scanner);
  const sweep = add(new THREE.CircleGeometry(.352, 36, 0, .52), scanMaterial, scanner);
  segment([0, 0, .001], [.352, 0, .001], .0028, cyan, scanner);

  const roleColors = [0x71badb, 0xb4a4e7, 0xe4b971, 0x8bc5a8];
  const bars = [], lamps = [];
  for (let i = 0; i < 4; i++) {
    const y = .151 - i * .153;
    rectangle(.326, .023, .544, y - .036, .132, muted);
    const barMaterial = new THREE.MeshBasicMaterial({ color: roleColors[i] });
    const bar = rectangle(.326, .023, .381, y - .036, .139, barMaterial, root);
    bar.geometry.translate(.163, 0, 0);
    bars.push(bar);
    const lamp = add(new THREE.SphereGeometry(.013, 10, 6), barMaterial, root);
    lamp.position.set(.747, y + .023, .142);
    lamps.push(lamp);
  }
  // Canvas lettering stays optional, so this asset also validates in Node.
  let labelTexture;
  if (typeof document !== 'undefined' && document.createElement) {
    const canvas = document.createElement('canvas');
    canvas.width = 1536;
    canvas.height = 960;
    const context = canvas.getContext('2d');
    if (context) {
      const px = x => (x / 1.71 + .5) * canvas.width;
      const py = y => (.5 - y / 1.055) * canvas.height;
      const text = (label, x, y, size, color, weight = 500) => {
        context.font = `${weight} ${size}px Arial, sans-serif`;
        context.fillStyle = color;
        context.textBaseline = 'middle';
        context.fillText(label, px(x), py(y));
      };
      text('TEAM FIT', -.745, .405, 58, '#e6e8df', 650);
      text('07 AXES', .446, .405, 28, '#93adb9');
      text('SKILL BALANCE', -.74, -.494, 24, '#93adb9');
      text('LIVE MATCH', .39, -.494, 24, '#87cdcf');
      ['ENGINEER', 'DESIGNER', 'PRODUCT', 'OPERATOR'].forEach((label, i) => {
        text(label, .377, .174 - i * .153, 30, '#d2dce0', 550);
      });
      labelTexture = new THREE.CanvasTexture(canvas);
      labelTexture.colorSpace = THREE.SRGBColorSpace;
      const labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false, toneMapped: false });
      rectangle(1.71, 1.055, 0, 0, .149, labelMaterial, root);
    }
  }
  // Batch the fixed shell and engraved grid by material, leaving only the display articulated.
  staticGroup.updateMatrixWorld(true);
  const batches = new Map();
  staticGroup.traverse(object => {
    if (!object.isMesh) return;
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    if (!batches.has(object.material)) batches.set(object.material, { positions: [], normals: [] });
    const batch = batches.get(object.material);
    batch.positions.push(...geometry.attributes.position.array);
    batch.normals.push(...geometry.attributes.normal.array);
    geometry.dispose();
    object.geometry.dispose();
  });
  staticGroup.clear();
  for (const [material, batch] of batches) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(batch.positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(batch.normals, 3));
    geometry.computeBoundingSphere();
    add(geometry, material);
  }
  const clamp = THREE.MathUtils.clamp;
  const smooth = (a, b, value) => THREE.MathUtils.smoothstep(value, a, b);
  let night = false;
  root.userData.animate = (elapsed, state = {}) => {
    const time = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0);
    const phase = Number.isFinite(state.phase) ? ((state.phase % 16) + 16) % 16 : time % 16;
    const reset = 1 - smooth(14.5, 16, phase);
    const matchProgress = smooth(4, 9, phase) * reset;
    const matched = clamp(Number.isFinite(state.matched) ? state.matched : Math.floor(matchProgress * 4.999), 0, 4);
    const baseline = [.33, .22, .51, .30, .21, .43, .28];
    const target = [.91, .82, .96, .85, .88, .90, .80];
    graphPositions.set([centerX, centerY, .140], 0);
    for (let i = 0; i < 8; i++) {
      const axis = i % 7;
      const scanPulse = phase < 4 ? .016 * Math.sin(time * 3.2 + axis * .75) * Math.sin(Math.PI * phase / 4) : 0;
      const amount = baseline[axis] + (target[axis] - baseline[axis]) * matchProgress + scanPulse;
      const location = point(axis, amount, .140);
      graphPositions.set(location, (i + 1) * 3);
      outlinePoints.set([location[0], location[1], .145], i * 3);
      if (i < 7) vertices[i].position.set(location[0], location[1], .145);
    }
    graphGeometry.attributes.position.needsUpdate = true;
    outlineGeometry.attributes.position.needsUpdate = true;
    graphGeometry.computeBoundingSphere();
    outlineGeometry.computeBoundingSphere();
    scanner.rotation.z = Math.PI / 2 - time * 1.45;
    scanner.visible = phase < 9;
    scanMaterial.opacity = .12 * (1 - smooth(7, 9, phase));
    radarMaterial.opacity = (night ? .46 : .38) + .08 * matchProgress;
    for (let i = 0; i < 4; i++) {
      const start = 4.1 + i * 1.08;
      const fill = (.06 + .94 * smooth(start, start + .85, phase)) * reset;
      bars[i].scale.x = Math.max(.025, fill);
      lamps[i].scale.setScalar(i < matched ? 1.16 : .67);
      bars[i].material.color.setHex(i < matched ? roleColors[i] : 0x55778a);
    }
    root.userData.matched = matched;
  };
  root.userData.setTheme = theme => {
    night = theme === 'dark';
    ink.color.setHex(night ? 0x091728 : 0x0d2037);
    housing.color.setHex(night ? 0xd5cfbf : 0xebe2d0);
    gridMaterial.opacity = night ? .62 : .76;
    outlineMaterial.opacity = night ? .88 : 1;
  };
  root.userData.animate(0);
  root.userData.setTheme('light');
  return root;
}
