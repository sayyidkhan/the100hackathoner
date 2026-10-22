// Architectural shell and articulated optics. Dimensions are kept in the same
// scene coordinates as the lunar tracking rig, so all motion stays deterministic.
export function createObservatory(T, { group, mesh, box, disk, ring, ball, line, materials: m }) {
  const PI = Math.PI, TAU = PI * 2;
  const observatory = group(-1.22, .20, -.25);
  observatory.name = 'lunar-observatory';
  const wall = m.observatoryWall, paint = m.domePaint, red = m.telescopePaint;
  const dark = m.anodized, metal = m.nickel, glass = m.opticalGlass;
  const seam = paint.clone(); seam.color.multiplyScalar(.72); seam.roughness = .8;
  const interior = wall.clone(); interior.color.setHex(0x756c5d); interior.roughness = 1;

  // A substantial stone footing, narrow flashing and weathered rendered walls.
  disk(.775, .075, 0, .0375, 0, wall, observatory);
  disk(.744, .045, 0, .094, 0, wall, observatory);
  ring(.737, .006, 0, .120, 0, seam, observatory, true);
  disk(.65, .025, 0, .135, 0, dark, observatory);

  // The wall is a curved, thick shell with actual openings. A window is not
  // a bright arch pasted on an otherwise solid cylinder.
  const radius = .705, innerRadius = .650, bottom = .12, top = 1.015;
  const openings = [
    { a: 0, width: .35, base: bottom, height: .645, door: true },
    ...[-2.28, -.96, .96, 2.28].map(a => ({ a, width: .15, base: .435, height: .30 })),
  ].sort((a, b) => a.a - b.a);
  const positions = [], normals = [], uvs = [];
  const textureDensity = 2; // One material tile covers about half a scene unit.
  const point = (a, y, r) => new T.Vector3(Math.sin(a) * r, y, Math.cos(a) * r);
  function wallUV(p) {
    // A whole number of circumferential tiles keeps the rear seam continuous.
    // Nine outer / eight inner tiles differ from the height density by <3%.
    const tiles = Math.round(TAU * Math.hypot(p.x, p.z) * textureDensity);
    return [Math.atan2(p.x, p.z) / TAU * tiles, p.y * textureDensity];
  }
  function triangle(a, b, c, normal, uvFor = wallUV) {
    const direction = b.clone().sub(a).cross(c.clone().sub(a));
    const faceNormal = typeof normal === 'function' ? normal(a.clone().add(b).add(c).divideScalar(3)) : normal;
    if (direction.dot(faceNormal) < 0) [b, c] = [c, b];
    for (const p of [a, b, c]) {
      positions.push(...p); normals.push(...(typeof normal === 'function' ? normal(p) : normal));
      uvs.push(...uvFor(p));
    }
  }
  function quad(a, b, c, d, normal, uvFor) { triangle(a, b, c, normal, uvFor); triangle(a, c, d, normal, uvFor); }
  function contactRows(height) {
    // Interior vertices let the AO bake resolve a contact shadow near a sill,
    // cornice or footing without darkening the entire height of the wall.
    const steps = Math.max(1, Math.ceil(height / .06));
    const rows = Array.from({ length: steps + 1 }, (_, i) => i / steps);
    for (const distance of [.012, .03]) if (distance < height / 2) rows.push(distance / height, 1 - distance / height);
    return rows.sort((a, b) => a - b).filter((value, i, list) => !i || value - list[i - 1] > 1e-6);
  }
  function strip(start, end, low, high) {
    const steps = Math.max(3, Math.ceil((end - start) * 72));
    for (let i = 0; i < steps; i++) {
      const a = start + (end - start) * i / steps, b = start + (end - start) * (i + 1) / steps;
      const lowA = low(a), lowB = low(b), highA = high(a), highB = high(b);
      const rows = contactRows(Math.max(highA - lowA, highB - lowB));
      const outward = p => new T.Vector3(p.x, 0, p.z).normalize();
      const inward = p => outward(p).negate();
      for (let row = 0; row < rows.length - 1; row++) {
        const a0 = T.MathUtils.lerp(lowA, highA, rows[row]), a1 = T.MathUtils.lerp(lowA, highA, rows[row + 1]);
        const b0 = T.MathUtils.lerp(lowB, highB, rows[row]), b1 = T.MathUtils.lerp(lowB, highB, rows[row + 1]);
        quad(point(a, a0, radius), point(b, b0, radius), point(b, b1, radius), point(a, a1, radius), outward);
        quad(point(a, a0, innerRadius), point(a, a1, innerRadius), point(b, b1, innerRadius), point(b, b0, innerRadius), inward);
      }
    }
  }
  let start = -PI;
  for (const opening of openings) {
    const half = Math.asin(opening.width / 2 / radius), left = opening.a - half, right = opening.a + half;
    strip(start, left, () => bottom, () => top);
    const roof = a => opening.base + opening.height - opening.width / 2
      + Math.sqrt(Math.max(0, (opening.width / 2) ** 2 - (Math.sin(a - opening.a) * radius) ** 2));
    if (!opening.door) strip(left, right, () => bottom, () => opening.base);
    strip(left, right, roof, () => top);
    const steps = 32, depthSteps = 4;
    let archDistance = 0;
    for (let i = 0; i < steps; i++) {
      const a = left + (right - left) * i / steps, b = left + (right - left) * (i + 1) / steps;
      const roofA = roof(a), roofB = roof(b), edgeLength = point(a, roofA, radius).distanceTo(point(b, roofB, radius));
      const offset = archDistance;
      const roofUV = p => [(offset + edgeLength * (Math.atan2(p.x, p.z) - a) / (b - a)) * textureDensity,
        (radius - Math.hypot(p.x, p.z)) * textureDensity];
      const sillUV = p => [(Math.atan2(p.x, p.z) - left) * radius * textureDensity,
        (radius - Math.hypot(p.x, p.z)) * textureDensity];
      for (let depth = 0; depth < depthSteps; depth++) {
        const outer = T.MathUtils.lerp(radius, innerRadius, depth / depthSteps);
        const inner = T.MathUtils.lerp(radius, innerRadius, (depth + 1) / depthSteps);
        const pa = point(a, roofA, outer), pb = point(b, roofB, outer), pc = point(b, roofB, inner), pd = point(a, roofA, inner);
        const normal = pb.clone().sub(pa).cross(pd.clone().sub(pa)).normalize();
        if (normal.y > 0) normal.negate();
        quad(pa, pb, pc, pd, normal, roofUV);
        if (!opening.door) quad(point(a, opening.base, outer), point(a, opening.base, inner),
          point(b, opening.base, inner), point(b, opening.base, outer), new T.Vector3(0, 1, 0), sillUV);
      }
      archDistance += edgeLength;
    }
    for (const a of [left, right]) {
      const rows = contactRows(roof(a) - opening.base);
      const normal = new T.Vector3(Math.cos(a) * (a === left ? 1 : -1), 0, -Math.sin(a) * (a === left ? 1 : -1));
      const jambUV = p => [(radius - Math.hypot(p.x, p.z)) * textureDensity, p.y * textureDensity];
      for (let row = 0; row < rows.length - 1; row++) for (let depth = 0; depth < depthSteps; depth++) {
        const y0 = T.MathUtils.lerp(opening.base, roof(a), rows[row]), y1 = T.MathUtils.lerp(opening.base, roof(a), rows[row + 1]);
        const outer = T.MathUtils.lerp(radius, innerRadius, depth / depthSteps), inner = T.MathUtils.lerp(radius, innerRadius, (depth + 1) / depthSteps);
        quad(point(a, y0, outer), point(a, y1, outer), point(a, y1, inner), point(a, y0, inner), normal, jambUV);
      }
    }
    start = right;
  }
  strip(start, PI, () => bottom, () => top);
  const wallGeometry = new T.BufferGeometry();
  wallGeometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  wallGeometry.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
  wallGeometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
  mesh(wallGeometry, wall, observatory).name = 'observatory-open-wall';

  function archPath(width, height, path = new T.Shape()) {
    const r = width / 2;
    path.moveTo(-r, 0); path.lineTo(-r, height - r);
    path.absarc(0, height - r, r, PI, 0, true); path.lineTo(r, 0); path.closePath();
    return path;
  }
  function arch(width, height, depth, material, parent, inset = 0) {
    const shape = archPath(width, height);
    if (inset) { const hole = archPath(width - inset * 2, height - inset, new T.Path()); shape.holes.push(hole); }
    const geometry = new T.ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: true, bevelSegments: 3, bevelSize: .0035, bevelThickness: .0035, curveSegments: 32 });
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * textureDensity, uv.getY(i) * textureDensity);
    return mesh(geometry, material, parent);
  }
  const entry = group(0, bottom, .708, observatory);
  arch(.418, .677, .021, wall, entry, .034);
  const door = arch(.344, .634, .017, red, entry); door.position.z = -.068;
  for (const x of [-.115, -.0575, 0, .0575, .115]) box(.0015, .43, .001, x, .25, -.049, seam, entry, .0004);
  box(.021, .058, .008, .113, .29, -.043, dark, entry, .003);
  box(.035, .006, .011, .104, .303, -.034, metal, entry, .002);
  box(.35, .018, .10, 0, .006, -.017, wall, entry, .003);
  for (const o of openings.filter(o => !o.door)) {
    const window = group(Math.sin(o.a) * .707, o.base, Math.cos(o.a) * .707, observatory); window.rotation.y = o.a;
    arch(.188, .321, .012, wall, window, .019);
    const pane = arch(.145, .291, .004, m.windowGlass, window); pane.position.set(0, .003, -.043);
    box(.006, .25, .010, 0, .13, -.028, dark, window, .001);
    box(.14, .007, .010, 0, .13, -.028, dark, window, .001);
    box(.212, .018, .080, 0, -.008, -.012, wall, window, .003);
  }
  // Lower stair risers and fine handrails give an architectural scale cue.
  for (let i = 0; i < 4; i++) {
    box(.55, .035 * (i + 1), .19, 0, .0175 * (i + 1), 1.20 - i * .145, wall, observatory, .005);
    box(.54, .005, .014, 0, .035 * (i + 1) + .002, 1.275 - i * .145, seam, observatory, .001);
  }
  for (const x of [-.32, .32]) {
    line([[x, .18, 1.30], [x, .34, .79]], .006, dark, observatory);
    for (const z of [.88, 1.22]) line([[x, .05, z], [x, z < 1 ? .31 : .20, z]], .005, dark, observatory);
  }
  disk(.719, .035, 0, .995, 0, red, observatory);
  disk(.750, .028, 0, 1.030, 0, paint, observatory);
  ring(.725, .008, 0, 1.050, 0, dark, observatory, true);
  // A slim bearing race replaces the ornamental necklace of large rivets.
  for (let i = 0; i < 48; i++) {
    const a = i * TAU / 48;
    const tooth = box(.013, .012, .012, Math.sin(a) * .731, 1.011, Math.cos(a) * .731, dark, observatory, .0015); tooth.rotation.y = a;
  }

  const dome = group(0, 1.055, 0, observatory, true); dome.name = 'lunar-tracking-dome';
  const azimuth = PI - 2.575, axis = new T.Vector3(Math.cos(azimuth), 0, Math.sin(azimuth));
  const across = new T.Vector3(-axis.z, 0, axis.x), gap = .165, domeRadius = .735;
  function domePoint(u, theta, r) {
    const remaining = Math.sqrt(Math.max(0, r * r - u * u));
    return across.clone().multiplyScalar(u).addScaledVector(axis, remaining * Math.cos(theta)).add(new T.Vector3(0, remaining * Math.sin(theta), 0));
  }
  function panel(side, r, inner = false) {
    const p = [], n = [], uv = [], indices = [], nx = 36, ny = 80;
    for (let x = 0; x <= nx; x++) for (let y = 0; y <= ny; y++) {
      const u = side * (gap + (r - gap) * x / nx), theta = y / ny * PI, v = domePoint(u, theta, r);
      p.push(...v); n.push(...v.clone().normalize().multiplyScalar(inner ? -1 : 1));
      // Equidistant mapping around the side pole keeps physical grain scale
      // bounded across the panel; linear-u mapping stretched to infinity there.
      const distance = r * Math.acos(T.MathUtils.clamp(Math.abs(u) / r, 0, 1));
      uv.push(distance * Math.cos(theta) * textureDensity, distance * Math.sin(theta) * textureDensity);
    }
    for (let x = 0; x < nx; x++) for (let y = 0; y < ny; y++) {
      const a = x * (ny + 1) + y, b = a + ny + 1;
      if ((side < 0) !== inner) indices.push(a, b, a + 1, b, b + 1, a + 1);
      else indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(p, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(n, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(indices);
    const surface = mesh(g, inner ? interior : paint, dome);
    surface.name = `observatory-dome-panel-${side < 0 ? 'left' : 'right'}-${inner ? 'inside' : 'outside'}`;
    return surface;
  }
  for (const side of [-1, 1]) {
    panel(side, domeRadius); panel(side, domeRadius - .023, true);
    // The constant-width slit continues over the zenith, exposing the mount
    // from both sides instead of hiding the whole instrument behind a dome.
    for (const [u, thickness, material] of [[gap, .009, paint], [gap + .021, .0035, dark]]) {
      line(Array.from({ length: 65 }, (_, i) => domePoint(side * u, i / 64 * PI, domeRadius + .002).toArray()), thickness, material, dome);
    }
    for (const u of [.31, .47, .61]) {
      line(Array.from({ length: 49 }, (_, i) => domePoint(side * u, i / 48 * PI, domeRadius + .001).toArray()), .0024, seam, dome);
    }
  }
  // The two low shutter drives sit on the rotation ring, not on the shell.
  for (const side of [-1, 1]) {
    const v = across.clone().multiplyScalar(side * .26).addScaledVector(axis, .64);
    const drive = box(.10, .035, .065, v.x, .012, v.z, dark, dome, .007); drive.rotation.y = -azimuth;
  }

  const mount = group(0, 0, 0, observatory, true);
  disk(.17, .055, 0, 1.09, 0, dark, mount);
  disk(.115, .18, 0, 1.20, 0, paint, mount);
  for (const z of [-.175, .175]) {
    const fork = box(.115, .31, .047, 0, 1.325, z, paint, mount, .012); fork.rotation.z = -.12;
    const hub = disk(.077, .030, 0, 1.46, z + Math.sign(z) * .018, dark, mount); hub.rotation.x = PI / 2;
    const cap = disk(.040, .008, 0, 1.46, z + Math.sign(z) * .036, metal, mount); cap.rotation.x = PI / 2;
  }
  const telescope = group(0, 1.46, 0, observatory, true); telescope.name = 'lunar-tracking-telescope';
  telescope.scale.y = .88;
  // Long refractor with a hollow dew shield and a genuinely recessed objective.
  disk(.091, .91, 0, .30, 0, red, telescope);
  for (const y of [.02, .41]) {
    disk(.101, .032, 0, y, 0, dark, telescope);
    for (const x of [-.10, .10]) box(.025, .035, .040, x, y, 0, metal, telescope, .003);
  }
  box(.050, .49, .033, 0, .21, -.112, dark, telescope, .007);
  const hoodProfile = [[.090, .70], [.122, .73], [.130, .79], [.130, 1.16], [.126, 1.172], [.112, 1.172], [.110, 1.15], [.110, .80], [.088, .77]];
  const hood = mesh(new T.LatheGeometry(hoodProfile.map(p => new T.Vector2(...p)), 96), red, telescope);
  hood.material = red.clone(); hood.material.side = T.DoubleSide;
  ring(.121, .006, 0, 1.169, 0, dark, telescope, true);
  for (const y of [.89, .98, 1.07]) ring(.108, .004, 0, y, 0, dark, telescope, true);
  disk(.107, .008, 0, .87, 0, dark, telescope);
  const objective = mesh(new T.SphereGeometry(.109, 64, 24, 0, TAU, 0, PI / 2), glass, telescope);
  objective.scale.y = .12; objective.position.y = .879;
  ring(.105, .003, 0, .886, 0, metal, telescope, true);
  // Rear focuser, engraved rack, fine adjustment wheel and right-angle eyepiece.
  disk(.070, .17, 0, -.22, 0, dark, telescope);
  disk(.043, .14, 0, -.365, 0, metal, telescope);
  for (let i = 0; i < 14; i++) ring(.071, .0018, 0, -.17 - i * .008, 0, dark, telescope, true);
  for (const x of [-.102, .102]) {
    const wheel = disk(.039, .024, x, -.20, 0, dark, telescope); wheel.rotation.z = PI / 2;
    for (let i = 0; i < 16; i++) { const a = i * TAU / 16; ball(.0025, x, -.20 + Math.sin(a) * .038, Math.cos(a) * .038, metal, telescope); }
  }
  box(.058, .065, .072, 0, -.445, 0, dark, telescope, .008);
  const eyepiece = disk(.024, .11, 0, -.445, .068, dark, telescope); eyepiece.rotation.x = PI / 2;
  ring(.023, .003, 0, -.445, .127, metal, telescope);
  const finder = group(.133, .25, .035, telescope);
  disk(.021, .28, 0, 0, 0, paint, finder); disk(.027, .025, 0, .15, 0, dark, finder);
  disk(.018, .004, 0, .165, 0, glass, finder);
  for (const y of [.15, .34]) box(.066, .016, .020, .113, y, .035, dark, telescope, .003);
  return { observatory, dome, telescope, mount };
}
