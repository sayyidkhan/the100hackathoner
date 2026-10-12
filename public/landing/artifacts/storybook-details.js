// Papercraft details are built from sheets: broad folded silhouettes,
// visible cut edges and a quiet little house at the ribbon's destination.
export function createStorybookDetails(THREE, materials, surfaceHeight) {
  const group = new THREE.Group();
  group.name = 'storybook-cut-paper-forest-and-cottage';
  function mesh(geometry, material, parent = group) {
    const object = new THREE.Mesh(geometry, materials[material] || materials.paper);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(w, h, d, x, y, z, material, parent) {
    const object = mesh(new THREE.BoxGeometry(w, h, d), material, parent);
    object.position.set(x, y, z);
    return object;
  }
  function outline(points) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    return shape;
  }
  function hole(shape, x, y, w, h) {
    const path = new THREE.Path();
    path.moveTo(x, y); path.lineTo(x, y + h); path.lineTo(x + w, y + h); path.lineTo(x + w, y); path.closePath();
    shape.holes.push(path);
  }
  function sheet(shape, material, parent, thickness = .017) {
    return mesh(new THREE.ExtrudeGeometry(shape, {
      depth: thickness, steps: 1, bevelEnabled: false, curveSegments: 6,
    }), material, parent);
  }
  function geometry(positions, uv, indices) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (indices) g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }
  // Shadow baking samples vertices. Refine only the broad cottage sheets so
  // roof shadows resolve across the paper without giant dark triangles.
  function refineSheet(object, maxEdge = .095) {
    const source = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry;
    const position = source.getAttribute('position'), normal = source.getAttribute('normal'), uv = source.getAttribute('uv');
    const positions = [], normals = [], uvs = [], limit = maxEdge * maxEdge;
    const vertex = i => [position.getX(i), position.getY(i), position.getZ(i), normal.getX(i), normal.getY(i), normal.getZ(i), uv.getX(i), uv.getY(i)];
    const distance = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
    for (let i = 0; i < position.count; i += 3) {
      const queue = [[vertex(i), vertex(i + 1), vertex(i + 2)]];
      while (queue.length) {
        const triangle = queue.pop();
        const lengths = triangle.map((v, j) => distance(v, triangle[(j + 1) % 3]));
        const edge = lengths.indexOf(Math.max(...lengths));
        if (lengths[edge] > limit) {
          const a = triangle[edge], b = triangle[(edge + 1) % 3], c = triangle[(edge + 2) % 3];
          const mid = a.map((value, j) => (value + b[j]) * .5);
          const length = Math.hypot(mid[3], mid[4], mid[5]) || 1;
          for (let axis = 3; axis < 6; axis++) mid[axis] /= length;
          queue.push([a, mid, c], [mid, b, c]);
        } else {
          for (const v of triangle) { positions.push(...v.slice(0, 3)); normals.push(...v.slice(3, 6)); uvs.push(v[6], v[7]); }
        }
      }
    }
    const refined = new THREE.BufferGeometry();
    refined.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    refined.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    refined.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    if (source !== object.geometry) source.dispose();
    object.geometry.dispose(); object.geometry = refined;
    return object;
  }

  const cottage = new THREE.Group();
  cottage.name = 'single-sheet-paper-cottage';
  const houseX = 1.58, houseZ = -.95;
  const houseY = Math.max(...[-1, 1].flatMap(x => [-1, 1].map(z => surfaceHeight(houseX + x * .49, houseZ + z * .415))));
  cottage.position.set(houseX, houseY, houseZ);
  group.add(cottage);

  // Fold-out mounting tabs join the flat house to the curving book leaf.
  function mountingFlap(cx, cz, dx, dz, width, parent, originX, originZ, originY) {
    const positions = [], uvs = [], indices = [], steps = 10;
    const length = Math.hypot(dx, dz), nx = -dz / length, nz = dx / length;
    for (let i = 0; i <= steps; i++) for (let edge = 0; edge < 2; edge++) {
      const t = i / steps, lateral = (edge - .5) * width;
      const x = cx + dx * t + nx * lateral;
      const z = cz + dz * t + nz * lateral;
      const page = surfaceHeight(originX + x, originZ + z) - originY;
      const y = .021 * (1 - t) + page * t + Math.sin(Math.PI * t) * .035;
      positions.push(x, y, z); uvs.push(t, edge);
      if (i < steps && edge === 0) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    mesh(geometry(positions, uvs, indices), 'paper', parent);
  }
  mountingFlap(-.404, -.03, -.21, -.015, .51, cottage, houseX, houseZ, houseY);
  mountingFlap(.404, -.03, .19, .03, .51, cottage, houseX, houseZ, houseY);
  mountingFlap(0, -.365, .015, -.20, .63, cottage, houseX, houseZ, houseY);
  box(.84, .02, .75, 0, .013, 0, 'paperWarm', cottage);
  // Continue each wall sheet down to the local page height. This avoids a
  // floating floor when the house stands across a sloping paper contour.
  const perimeter = [[-.414, -.372], [.414, -.372], [.414, .357], [-.414, .357]];
  const skirtPositions = [], skirtUV = [], skirtIndices = [];
  perimeter.forEach(([x, z], edge) => {
    const [endX, endZ] = perimeter[(edge + 1) % perimeter.length];
    const offset = skirtPositions.length / 3;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, px = x + (endX - x) * t, pz = z + (endZ - z) * t;
      const bottom = Math.min(.008, surfaceHeight(houseX + px, houseZ + pz) - houseY - .004);
      skirtPositions.push(px, .018, pz, px, bottom, pz); skirtUV.push(t, .018, t, bottom);
      if (i < 8) { const a = offset + i * 2; skirtIndices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
  });
  refineSheet(mesh(geometry(skirtPositions, skirtUV, skirtIndices), 'paper', cottage));

  // The opening itself forms the door recess; a dark interior stays visibly
  // behind the front sheet, with a gently ajar paper door inside it.
  const facade = outline([[-.415, .018], [-.119, .018], [-.119, .395], [.119, .395], [.119, .018], [.415, .018], [.415, .647], [0, 1.045], [-.415, .647]]);
  hole(facade, -.055, .784, .11, .105);
  const front = refineSheet(sheet(facade, 'paper', cottage, .019));
  front.position.z = .354;
  const back = refineSheet(sheet(outline([[-.415, .018], [.415, .018], [.415, .647], [0, 1.045], [-.415, .647]]), 'paperWarm', cottage));
  back.position.z = -.377;
  box(.227, .373, .016, 0, .205, .267, 'paperShade', cottage);
  const door = refineSheet(box(.222, .363, .011, -.004, .211, .339, 'wood', cottage));
  door.rotation.y = -.045;
  // A turned-in paper jamb catches light along the recessed doorway.
  for (const side of [-1, 1]) box(.011, .374, .028, side * .116, .208, .36, 'paperWarm', cottage);
  box(.242, .012, .028, 0, .397, .36, 'paper', cottage);
  box(.111, .107, .012, 0, .837, .331, 'paperShade', cottage);
  box(.101, .097, .009, 0, .837, .348, 'window', cottage);
  // A cross is cut from the same paper rather than a separate window frame.
  box(.009, .107, .014, 0, .837, .363, 'paperWarm', cottage);
  box(.111, .009, .014, 0, .837, .363, 'paperWarm', cottage);

  for (const side of [-1, 1]) {
    const wallShape = outline([[-.369, .018], [.369, .018], [.369, .647], [-.369, .647]]);
    hole(wallShape, -.235, .298, .139, .187);
    hole(wallShape, .108, .298, .139, .187);
    const wall = refineSheet(sheet(wallShape, side > 0 ? 'paperWarm' : 'paper', cottage, .019));
    wall.rotation.y = Math.PI / 2;
    wall.position.x = side * .407;
    for (const z of [-.178, .164]) {
      box(.018, .184, .137, side * .386, .392, z, 'paperShade', cottage);
      box(.017, .177, .126, side * .398, .392, z, 'window', cottage);
      box(.021, .186, .010, side * .423, .392, z, 'paper', cottage);
    }
    // Narrow turned-under edge of the folded wall sheet.
    box(.031, .626, .008, side * .39, .331, .355, 'paperWarm', cottage);
  }

  // One gently bowed roof leaf on each side. A second thin edge underneath
  // exposes the thickness of the paper, without tiled or timber decoration.
  function roofLeaf(side, lower = false) {
    const positions = [], uv = [], indices = [], across = 18, along = 14;
    for (let j = 0; j <= along; j++) for (let i = 0; i <= across; i++) {
      const u = i / across, v = j / along;
      const x = side * (.485 * u);
      const z = (v - .5) * .893;
      const bow = Math.sin(Math.PI * u) * .019 + Math.sin(Math.PI * v) * u * .008;
      positions.push(x, 1.064 - .459 * u + bow - (lower ? .017 : 0), z);
      uv.push(u, v);
      if (i < across && j < along) {
        const a = j * (across + 1) + i;
        if ((side > 0) !== lower) indices.push(a, a + across + 1, a + 1, a + 1, a + across + 1, a + across + 2);
        else indices.push(a, a + 1, a + across + 1, a + 1, a + across + 2, a + across + 1);
      }
    }
    return mesh(geometry(positions, uv, indices), lower ? 'paperWarm' : 'paper', cottage);
  }
  for (const side of [-1, 1]) {
    roofLeaf(side); roofLeaf(side, true);
    const cutPositions = [], cutUV = [], cutIndices = [];
    for (let i = 0; i <= 18; i++) {
      const u = i / 18, x = side * .485 * u;
      const y = 1.064 - .459 * u + Math.sin(Math.PI * u) * .019;
      cutPositions.push(x, y, .4465, x, y - .017, .4465);
      cutUV.push(u, 0, u, 1);
      if (i < 18) {
        const a = i * 2;
        if (side < 0) cutIndices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        else cutIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    mesh(geometry(cutPositions, cutUV, cutIndices), 'edge', cottage);
  }
  // A small rounded paper fold closes the roof seam, with no added ornament.
  const capPositions = [], capUV = [], capIndices = [], capSteps = 10;
  for (let row = 0; row < 2; row++) for (let i = 0; i <= capSteps; i++) {
    const u = i / capSteps, angle = u * Math.PI;
    capPositions.push(Math.cos(angle) * .017, 1.060 + Math.sin(angle) * .014, (row - .5) * .9);
    capUV.push(u, row);
    if (!row && i < capSteps) { const a = i; capIndices.push(a, a + 1, a + capSteps + 1, a + 1, a + capSteps + 2, a + capSteps + 1); }
  }
  refineSheet(mesh(geometry(capPositions, capUV, capIndices), 'paper', cottage));
  // The path reaches this simple folded threshold.
  box(.268, .02, .139, 0, .026, .402, 'paper', cottage);
  const stoop = sheet(outline([[-.137, 0], [.137, 0], [.137, .014], [-.137, .014]]), 'paper', cottage, .085);
  stoop.position.set(0, .018, .471);

  // Broad fir silhouettes come from two slotted sheets, each creased down
  // the centre. Three clear boughs retain the artwork's simple paper shapes.
  function paperFir(x, z, h, turn, variant = 0) {
    const tree = new THREE.Group();
    tree.name = 'three-bough-folded-paper-fir';
    const ground = surfaceHeight(x, z);
    tree.position.set(x, ground + .004, z);
    tree.rotation.y = turn;
    group.add(tree);
    const halfWidth = h * (.258 + (variant % 3) * .016);
    function half(side, rotation, lighter) {
      const s = new THREE.Shape();
      s.moveTo(0, h);
      s.quadraticCurveTo(side * halfWidth * .22, h * .88, side * halfWidth * .49, h * .714);
      s.lineTo(side * halfWidth * .263, h * .733);
      s.quadraticCurveTo(side * halfWidth * .44, h * .551, side * halfWidth * .77, h * .426);
      s.lineTo(side * halfWidth * .405, h * .45);
      s.quadraticCurveTo(side * halfWidth * .63, h * .251, side * halfWidth, h * .111);
      s.lineTo(side * halfWidth * .132, h * .158);
      s.lineTo(side * halfWidth * .132, h * .012);
      s.lineTo(0, h * .012);
      s.closePath();
      const leaf = sheet(s, lighter ? 'paper' : 'paperWarm', tree, .011);
      const p = leaf.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const px = p.getX(i), py = p.getY(i);
        p.setZ(i, p.getZ(i) + Math.abs(px) * .40 + Math.sin(py / h * Math.PI) * Math.abs(px) * .11);
      }
      p.needsUpdate = true;
      leaf.geometry.computeVertexNormals();
      leaf.rotation.y = rotation;
    }
    for (let sheetIndex = 0; sheetIndex < 2; sheetIndex++) {
      half(-1, sheetIndex * Math.PI / 2, sheetIndex === 0);
      half(1, sheetIndex * Math.PI / 2, sheetIndex !== 0);
    }
    // Wide glue tabs bend down from the trunk and follow the page underneath.
    for (let flap = 0; flap < 2; flap++) {
      const positions = [], uvs = [], indices = [], count = 8;
      const sign = flap ? -1 : 1;
      for (let i = 0; i <= count; i++) for (let edge = 0; edge < 2; edge++) {
        const t = i / count;
        const lx = (edge - .5) * h * .105;
        const lz = sign * h * .18 * t;
        const wx = x + lx * Math.cos(turn) + lz * Math.sin(turn);
        const wz = z - lx * Math.sin(turn) + lz * Math.cos(turn);
        const py = surfaceHeight(wx, wz) - ground + .008 + Math.sin(Math.PI * t) * .018;
        positions.push(lx, py, lz); uvs.push(t, edge);
        if (i < count && edge === 0) {
          const a = i * 2;
          if (sign < 0) indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
          else indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        }
      }
      mesh(geometry(positions, uvs, indices), 'paper', tree);
    }
  }
  [
    [2.10, -1.46, 1.03, .22], [2.28, -.83, .87, .83], [2.30, -.20, .70, -.18],
    [2.12, .69, .99, .48], [2.24, 1.12, .72, -.27], [1.83, 1.24, .51, .17],
    [1.06, -1.45, .83, .06], [.93, -.92, .53, -.38],
    [-2.16, .43, .76, .15], [-1.85, .74, .92, -.25], [-1.55, .99, .69, .38],
  ].forEach(([x, z, h, turn], i) => paperFir(x, z, h, turn, i));

  return {
    group,
    doorstep: { x: houseX, y: houseY + .036, z: houseZ + .405, width: .238 },
    pathTarget: { x: houseX, y: houseY + .043, z: houseZ + .37 },
    animate() {}, setTheme() {},
  };
}
