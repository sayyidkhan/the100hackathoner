/** Sculpted, cloth-bound open book. Coordinates are shared with the paper landscape. */
export function createStorybookPages(THREE, materials) {
  const group = new THREE.Group();
  group.name = 'cloth-bound-paper-world';
  const M = materials;
  const add = (geometry, material, name, parent = group) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const surfaceHeight = (x, z) => {
    const s = clamp(Math.abs(x) / 2.82, 0, 1);
    const rise = Math.pow(Math.sin(s * Math.PI * .5), .96);
    const envelope = Math.sin(s * Math.PI * .5);
    const broadFold = .065 * Math.sin(x * 2.15 + z * 1.65) * envelope
      + .034 * Math.sin(z * 3.2 - x * .8) * s * s;
    // A hand-folded ridge crosses the front corner, with a quiet patch under the cottage.
    const crease = .105 * Math.exp(-Math.pow((z - 1.35 + .33 * (Math.abs(x) - 1.7)) / .20, 2))
      * Math.exp(-Math.pow((Math.abs(x) - 1.8) / .9, 2));
    const fineCrease = .010 * (Math.sin(x * 12.4 + z * 8.1) + .55 * Math.sin(x * 17.1 - z * 11.3)) * envelope;
    const pageHeight = .215 + .935 * rise + broadFold + crease + fineCrease;
    // The cottage grows from a shallow folded-paper knoll, with a gentle front approach.
    // A quiet plateau under its footprint avoids an exposed vertical foundation on the sloping leaf.
    const smoothFalloff = (distance, inner, outer) => {
      const t = clamp((distance - inner) / (outer - inner), 0, 1);
      return 1 - t * t * (3 - 2 * t);
    };
    const dx = Math.abs(x - 1.58), dz = z + .95;
    const knoll = smoothFalloff(dx, .52, 1.00) * smoothFalloff(Math.abs(dz), .445, dz > 0 ? 1.02 : .84);
    return pageHeight + Math.max(0, 1.138 - pageHeight) * knoll;
  };
  function roundedShape(width, height, radius) {
    const x = -width / 2, y = -height / 2, r = radius;
    const shape = new THREE.Shape();
    shape.moveTo(x + r, y);
    shape.lineTo(x + width - r, y); shape.quadraticCurveTo(x + width, y, x + width, y + r);
    shape.lineTo(x + width, y + height - r); shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    shape.lineTo(x + r, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }
  function board(side) {
    const geo = new THREE.ExtrudeGeometry(roundedShape(3.045, 4.3, .065), {
      depth: .095, bevelEnabled: true, bevelSegments: 3, bevelSize: .028, bevelThickness: .025, steps: 1, curveSegments: 8,
    });
    geo.rotateX(-Math.PI / 2);
    const mesh = add(geo, M.red, `crimson-cloth-cover-${side}`);
    mesh.position.set(side * 1.532, .055, 0);
    mesh.rotation.z = side * .013;
    // A real inset lining and rounded cover lip remain visible beyond the paper block.
    const lining = new THREE.ExtrudeGeometry(roundedShape(2.94, 4.18, .035), {
      depth: .014, bevelEnabled: true, bevelSegments: 2, bevelSize: .012, bevelThickness: .008, curveSegments: 6,
    });
    lining.rotateX(-Math.PI / 2);
    const inside = add(lining, M.redDark, `endpaper-lining-${side}`);
    inside.position.set(side * 1.518, .149, 0);
    inside.rotation.z = side * .013;
  }
  board(-1); board(1);

  function gridGeometry(fn, nx, nz, side = 1, reverse = false) {
    const positions = [], uvs = [], indices = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const u = i / nx, v = j / nz;
      const p = fn(u, v);
      positions.push(p[0], p[1], p[2]); uvs.push(u, v);
    }
    const flip = (side < 0) !== reverse;
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
      if (flip) indices.push(a, b, c, b, d, c);
      else indices.push(a, c, b, b, c, d);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices); geo.computeVertexNormals();
    return geo;
  }
  function edgeGeometry(points, bottomPoints) {
    const pos = [], uv = [], index = [];
    for (let i = 0; i < points.length; i++) {
      pos.push(...points[i], ...bottomPoints[i]);
      uv.push(i / (points.length - 1), 1, i / (points.length - 1), 0);
      if (i) {
        const a = (i - 1) * 2, b = i * 2;
        index.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(index); geo.computeVertexNormals();
    return geo;
  }
  function paperSheet(fn, side, name, nx = 44, nz = 30, thickness = .009, material = M.paper) {
    add(gridGeometry(fn, nx, nz, side), material, name);
    add(gridGeometry((u, v) => { const p = fn(u, v); p[1] -= thickness; return p; }, nx, nz, side, true), M.paperWarm, `${name}-underside`);
    const outline = [];
    for (let i = 0; i <= nx; i++) outline.push(fn(i / nx, 0));
    for (let i = 1; i <= nz; i++) outline.push(fn(1, i / nz));
    for (let i = 1; i <= nx; i++) outline.push(fn(1 - i / nx, 1));
    for (let i = 1; i <= nz; i++) outline.push(fn(0, 1 - i / nz));
    if (side > 0) outline.reverse();
    add(edgeGeometry(outline, outline.map(p => [p[0], p[1] - thickness, p[2]])), M.paper, `${name}-cut-edge`);
  }
  for (const side of [-1, 1]) {
    // A low, dense stack holds the binding. It never fills the open fan above it.
    const stackPoint = (u, v, t) => {
      const x = side * (.022 + u * (2.998 - .032 * t));
      const z = (v * 2 - 1) * (2.084 - .012 * t + .084 * Math.pow(1 - u, 2));
      const y = .16 + .018 * t + (.034 + .113 * t) * Math.sin(u * Math.PI * .5);
      return [x, y, z];
    };
    const stackOutline = t => {
      const points = [];
      for (let i = 0; i <= 30; i++) points.push(stackPoint(i / 30, 0, t));
      for (let i = 1; i <= 20; i++) points.push(stackPoint(1, i / 20, t));
      for (let i = 1; i <= 30; i++) points.push(stackPoint(1 - i / 30, 1, t));
      for (let i = 1; i <= 20; i++) points.push(stackPoint(0, 1 - i / 20, t));
      if (side > 0) points.reverse();
      return points;
    };
    add(edgeGeometry(stackOutline(1), stackOutline(0)), M.paperWarm, `low-bound-stack-${side}`);
    add(gridGeometry((u, v) => stackPoint(u, v, 1), 30, 20, side), M.paperWarm, `low-stack-top-${side}`);
    for (let layer = 0; layer < 28; layer++) {
      add(edgeGeometry(stackOutline((layer + .76) / 28), stackOutline(layer / 28)),
        layer % 5 === 0 ? M.paperShade : M.paper, `fine-underlying-page-${side}-${layer}`);
    }

    // Each of these is a complete page from the sewn gutter to its free edge.
    // The whole profile opens progressively, producing real air and shadow between leaves.
    for (let leaf = 0; leaf < 9; leaf++) {
      const extent = [3.03, 3.005, 2.962, 2.986, 2.921, 2.891, 2.85, 2.98, 2.90][leaf];
      const fn = (u, v) => {
        const rawX = .021 + u * extent;
        const freeEdge = Math.pow(clamp((rawX - 2.48) / (extent + .021 - 2.48), 0, 1), 1.85);
        const curlStrength = leaf === 8 ? .39 : leaf === 7 ? .23 : 0;
        const rolledTip = leaf === 8 ? .09 : leaf === 7 ? .07 : 0;
        const x = side * (rawX - rolledTip * freeEdge);
        const irregularEdge = .035 * Math.sin(u * Math.PI * 1.4 + leaf * 1.17) * u;
        const edge = 2.105 - leaf * .018 + .078 * Math.pow(1 - u, 2) + irregularEdge;
        const z = (v * 2 - 1) * edge;
        const rise = Math.pow(Math.sin(u * Math.PI * .5), .96);
        const wave = (.010 + leaf * .0035) * Math.sin(z * 2.3 + leaf * .23 + side * .4) * u * u;
        const frontCurl = leaf / 8 * .055 * Math.exp(-Math.pow((z - 1.63) / .35, 2)) * Math.pow(Math.sin(u * Math.PI), 2);
        const peakZ = side > 0 ? -1.30 : .60;
        const sculpturalSweep = Math.exp(-Math.pow((z - peakZ) / 1.0, 2));
        const extraLift = leaf === 8 ? .20 + .60 * sculpturalSweep : leaf === 7 ? .17 + .43 * sculpturalSweep : 0;
        const liftedRim = freeEdge * (curlStrength * (.65 + .35 * Math.sin(v * Math.PI + .30)) + extraLift);
        const y = .172 + leaf * .0048 + (.17 + leaf * .078) * rise + wave + frontCurl + liftedRim;
        return [x, y, z];
      };
      paperSheet(fn, side, `fully-fanned-page-${side}-${leaf}`, 28, 18, .008, leaf % 3 === 1 ? M.paperWarm : M.paper);
    }
    // The hero leaf is actual folded terrain, not a tabletop above the book.
    const hero = (u, v) => {
      const x = side * (.022 + u * 2.798);
      const z = (v * 2 - 1) * (1.946 + .157 * Math.pow(1 - u, 2));
      return [x, surfaceHeight(x, z), z];
    };
    paperSheet(hero, side, `folded-paper-landscape-${side}`, 70, 50, .012, M.paper);
  }
  // A narrow folded cream hinge closes the book's gutter without hiding the front bookmark.
  const gutter = (u, v) => {
    const x = -.036 + u * .072, z = -2.096 + v * 4.192;
    return [x, surfaceHeight(x, z) + .004, z];
  };
  paperSheet(gutter, 1, 'continuous-cream-gutter-fold', 6, 66, .012, M.paperWarm);
  // Crimson hinge follows the binding rather than meeting as two disconnected boxes.
  const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.13, .143, -2.15), new THREE.Vector3(0, .12, -1.45),
    new THREE.Vector3(0, .12, 0), new THREE.Vector3(0, .12, 1.45), new THREE.Vector3(.13, .143, 2.15),
  ]);
  add(new THREE.TubeGeometry(spineCurve, 60, .096, 12, false), M.redDark, 'rounded-cloth-spine');
  // Tiny alternating sewn loops are visible at both ends of the open gutter.
  for (const front of [-1, 1]) for (let stitch = 0; stitch < 15; stitch++) {
    const x = -.17 + stitch * .024;
    const arc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x - .009, .16 + Math.abs(x) * .27, front * 2.079),
      new THREE.Vector3(x, .202 + Math.abs(x) * .22, front * 2.119),
      new THREE.Vector3(x + .009, .16 + Math.abs(x) * .27, front * 2.155),
    ]);
    add(new THREE.TubeGeometry(arc, 6, .008, 5, false), stitch % 3 ? M.red : M.gold, `sewn-headband-${front}-${stitch}`);
  }
  // Fabric bookmark is a broad twisting strip with a cut tail, not a round cable.
  const bookmark = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.01, .185, 1.80), new THREE.Vector3(.02, .17, 2.08),
    new THREE.Vector3(.06, .045, 2.22), new THREE.Vector3(.31, .024, 2.37),
    new THREE.Vector3(.54, .065, 2.30),
  ]);
  const ribbonPos = [], ribbonUV = [], ribbonIndices = [];
  for (let i = 0; i <= 45; i++) {
    const t = i / 45, p = bookmark.getPoint(t), tangent = bookmark.getTangent(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    for (const edge of [-1, 1]) {
      const q = p.clone().addScaledVector(normal, edge * .068);
      q.y += edge * .012 * Math.sin(t * Math.PI * 2);
      ribbonPos.push(q.x, q.y, q.z); ribbonUV.push(edge === -1 ? 0 : 1, t);
    }
    if (i) { const a = (i - 1) * 2, b = i * 2; ribbonIndices.push(a, a + 1, b, a + 1, b + 1, b); }
  }
  const ribbonGeo = new THREE.BufferGeometry();
  ribbonGeo.setAttribute('position', new THREE.Float32BufferAttribute(ribbonPos, 3));
  ribbonGeo.setAttribute('uv', new THREE.Float32BufferAttribute(ribbonUV, 2));
  ribbonGeo.setIndex(ribbonIndices); ribbonGeo.computeVertexNormals();
  add(ribbonGeo, M.red, 'woven-red-bookmark');
  return { group, surfaceHeight, animate() {} };
}
