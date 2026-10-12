import { atlasLand } from './hackatlas-land.js';

// An instrument-scale atlas, with raised geographic land rather than a symbolic map.
// Coastline data: Natural Earth 1:110m, public domain (source in hackatlas-land.js).
export function createAtlasGlobe(THREE) {
  const root = new THREE.Group();
  root.name = 'hackatlas-global-builder-network';
  const materials = {
    ocean: new THREE.MeshPhysicalMaterial({ color: 0x10366c, metalness: .32, roughness: .28, clearcoat: .7, clearcoatRoughness: .25 }),
    land: new THREE.MeshStandardMaterial({ color: 0xe3ceb0, roughness: .59, metalness: .23, side: THREE.DoubleSide }),
    coast: new THREE.MeshStandardMaterial({ color: 0xb49563, roughness: .53, metalness: .6, side: THREE.DoubleSide }),
    brass: new THREE.MeshStandardMaterial({ color: 0xb8985f, metalness: .74, roughness: .27 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x192835, metalness: .65, roughness: .42 }),
    grid: new THREE.LineBasicMaterial({ color: 0xa2b5b6, transparent: true, opacity: .26 }),
    routes: new THREE.MeshStandardMaterial({ color: 0xb4cbbc, emissive: 0x426776, emissiveIntensity: .35, roughness: .35, metalness: .25 }),
    signal: new THREE.MeshStandardMaterial({ color: 0xd1f5e6, emissive: 0x65bfc3, emissiveIntensity: 1.3, roughness: .3 }),
    hub: new THREE.MeshStandardMaterial({ color: 0xe8ca7c, emissive: 0xe1ab35, emissiveIntensity: .55, roughness: .35, metalness: .4 }),
    halo: new THREE.MeshBasicMaterial({ color: 0xc8e9d9, transparent: true, opacity: .48, depthWrite: false }),
  };
  function mesh(geometry, material, parent = root) {
    const m = new THREE.Mesh(geometry, materials[material]);
    m.castShadow = m.receiveShadow = !['signal', 'halo'].includes(material);
    parent.add(m); return m;
  }
  function ring(radius, thickness, material, parent = root, segments = 128) {
    return mesh(new THREE.TorusGeometry(radius, thickness, 10, segments), material, parent);
  }
  function cylinder(radius, height, material, x, y, z, parent = root) {
    const m = mesh(new THREE.CylinderGeometry(radius, radius, height, 40), material, parent);
    m.position.set(x, y, z); return m;
  }
  function mergeGeometry(geometries) {
    const positions = [], normals = [];
    for (const geometry of geometries) {
      const g = geometry.index ? geometry.toNonIndexed() : geometry;
      positions.push(...g.attributes.position.array); normals.push(...g.attributes.normal.array);
      if (g !== geometry) g.dispose(); geometry.dispose();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    g.computeBoundingSphere(); return g;
  }
  const globeMount = new THREE.Group(); root.add(globeMount); globeMount.rotation.z = -.14;
  const outer = ring(1.172, .021, 'brass', globeMount);
  outer.name = 'machined-meridian-gimbal';
  ring(1.202, .006, 'brass', globeMount);
  const equator = ring(1.145, .014, 'brass', globeMount); equator.rotation.x = Math.PI / 2;
  // Graduations remain fixed to the mount, like the scale on a surveying instrument.
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const a = i * Math.PI / 36, r = 1.192, length = i % 6 === 0 ? .041 : .017;
    const g = new THREE.BoxGeometry(.004, length, .009);
    g.rotateZ(-a); g.translate(Math.sin(a) * r, Math.cos(a) * r, .021); ticks.push(g);
  }
  mesh(mergeGeometry(ticks), 'brass', globeMount);
  for (const sign of [-1, 1]) {
    cylinder(.052, .115, 'brass', 0, sign * 1.14, 0, globeMount);
    const axle = cylinder(.073, .055, 'dark', 0, sign * 1.19, 0, globeMount);
    const cap = ring(.052, .008, 'brass', globeMount, 40); cap.rotation.x = Math.PI / 2; cap.position.y = axle.position.y + sign * .03;
  }
  cylinder(.105, .20, 'dark', 0, -1.24, 0);
  cylinder(.19, .035, 'brass', 0, -1.325, 0);
  cylinder(.245, .045, 'dark', 0, -1.363, 0);

  const globe = new THREE.Group(); globe.name = 'geographic-globe'; globeMount.add(globe);
  mesh(new THREE.SphereGeometry(1.02, 96, 64), 'ocean', globe);
  const radians = Math.PI / 180;
  const spherePoint = (lon, lat, radius = 1.045) => {
    // Singapore faces the viewer, so the hub and the Asia-Pacific matches read instantly.
    const lng = (lon - 103.82) * radians, phi = lat * radians;
    return new THREE.Vector3(radius * Math.cos(phi) * Math.sin(lng), radius * Math.sin(phi), radius * Math.cos(phi) * Math.cos(lng));
  };
  const landVertices = [], landNormals = [], coastVertices = [];
  const addLandTriangle = (a, b, c, depth = 0) => {
    const length = (p, q) => Math.hypot((p[0] - q[0]) * Math.cos((p[1] + q[1]) * radians / 2), p[1] - q[1]);
    // Adaptive tessellation keeps broad land triangles above the curved ocean.
    if (depth < 7 && Math.max(length(a, b), length(b, c), length(c, a)) > 9) {
      const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
      addLandTriangle(a, ab, ca, depth + 1); addLandTriangle(ab, b, bc, depth + 1);
      addLandTriangle(ca, bc, c, depth + 1); addLandTriangle(ab, bc, ca, depth + 1); return;
    }
    for (const p of [a, b, c]) { const v = spherePoint(...p); landVertices.push(...v); landNormals.push(...v.normalize()); }
  };
  for (const rings of atlasLand) {
    const contour = rings[0].map(p => new THREE.Vector2(...p));
    const holes = rings.slice(1).map(ring => ring.map(p => new THREE.Vector2(...p)));
    const all = rings.flat();
    const triangles = THREE.ShapeUtils.triangulateShape(contour, holes);
    for (const t of triangles) addLandTriangle(all[t[0]], all[t[1]], all[t[2]]);
    for (const outline of rings) for (let i = 0; i < outline.length; i++) {
      const a = outline[i], b = outline[(i + 1) % outline.length];
      const p = spherePoint(...a), q = spherePoint(...b), lowP = spherePoint(...a, 1.019), lowQ = spherePoint(...b, 1.019);
      for (const v of [p, lowP, q, q, lowP, lowQ]) coastVertices.push(...v);
    }
  }
  const landGeo = new THREE.BufferGeometry();
  landGeo.setAttribute('position', new THREE.Float32BufferAttribute(landVertices, 3));
  landGeo.setAttribute('normal', new THREE.Float32BufferAttribute(landNormals, 3));
  mesh(landGeo, 'land', globe);
  const coastGeo = new THREE.BufferGeometry(); coastGeo.setAttribute('position', new THREE.Float32BufferAttribute(coastVertices, 3)); coastGeo.computeVertexNormals(); mesh(coastGeo, 'coast', globe);
  const gridPoints = [];
  const gridLine = points => { for (let i = 1; i < points.length; i++) gridPoints.push(...points[i - 1], ...points[i]); };
  for (let lon = -180; lon < 180; lon += 20) gridLine(Array.from({ length: 91 }, (_, i) => spherePoint(lon, -90 + i * 2, 1.022)));
  for (let lat = -75; lat < 90; lat += 15) gridLine(Array.from({ length: 181 }, (_, i) => spherePoint(-180 + i * 2, lat, 1.022)));
  const gridGeo = new THREE.BufferGeometry(); gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
  globe.add(new THREE.LineSegments(gridGeo, materials.grid));

  const locations = [
    ['Singapore', 103.82, 1.35], ['Bengaluru', 77.59, 12.97], ['Tokyo', 139.69, 35.68],
    ['Sydney', 151.21, -33.87], ['Dubai', 55.27, 25.20], ['London', -.12, 51.5],
    ['San Francisco', -122.42, 37.77], ['Nairobi', 36.82, -1.29],
  ];
  const pin = new THREE.InstancedMesh(new THREE.SphereGeometry(.032, 14, 10), materials.brass, locations.length);
  pin.castShadow = true; globe.add(pin);
  const collars = new THREE.InstancedMesh(new THREE.TorusGeometry(.048, .006, 6, 24), materials.brass, locations.length);
  globe.add(collars);
  const dummy = new THREE.Object3D();
  locations.forEach(([, lon, lat], i) => {
    dummy.position.copy(spherePoint(lon, lat, 1.071)); dummy.quaternion.identity(); dummy.scale.setScalar(i === 0 ? 1.3 : 1); dummy.updateMatrix(); pin.setMatrixAt(i, dummy.matrix);
    dummy.position.copy(spherePoint(lon, lat, 1.054)); dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dummy.position.clone().normalize()); dummy.scale.setScalar(i === 0 ? 1.45 : 1); dummy.updateMatrix(); collars.setMatrixAt(i, dummy.matrix);
  });
  const hub = new THREE.Group(); hub.position.copy(spherePoint(103.82, 1.35, 1.065));
  hub.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), hub.position.clone().normalize()); globe.add(hub);
  mesh(new THREE.SphereGeometry(.039, 20, 12), 'hub', hub);
  const hubPulse = ring(.096, .0055, 'halo', hub, 64);
  const hubRing = ring(.061, .006, 'brass', hub, 48);
  hubRing.position.z = .003;

  const routes = [], routeGeometry = [];
  const destination = spherePoint(103.82, 1.35, 1).normalize();
  for (let i = 1; i < locations.length; i++) {
    const [, lon, lat] = locations[i], start = spherePoint(lon, lat, 1).normalize();
    const angle = Math.acos(THREE.MathUtils.clamp(start.dot(destination), -1, 1));
    const at = t => {
      const sin = Math.sin(angle);
      const v = start.clone().multiplyScalar(Math.sin((1 - t) * angle) / sin).addScaledVector(destination, Math.sin(t * angle) / sin);
      return v.normalize().multiplyScalar(1.073 + Math.sin(Math.PI * t) * (.13 + .08 * angle));
    };
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: 49 }, (_, j) => at(j / 48)));
    routes.push({ at, curve }); routeGeometry.push(new THREE.TubeGeometry(curve, 60, .006, 5, false));
  }
  mesh(mergeGeometry(routeGeometry), 'routes', globe);
  const signals = new THREE.InstancedMesh(new THREE.SphereGeometry(.024, 12, 8), materials.signal, routes.length * 2);
  signals.name = 'builder-signals'; globe.add(signals);
  root.userData = {
    geographicSource: 'Natural Earth 1:110m public-domain land polygons',
    locations: locations.map(([name]) => name),
    animate(time, state = {}) {
      const t = ((time % 16) + 16) % 16;
      const matched = THREE.MathUtils.clamp(state.matched ?? Math.max(0, Math.floor((t - 4) / 1.2)), 0, 4);
      globe.rotation.y = .035 + Math.sin(t / 16 * Math.PI * 2) * .075;
      const activity = t < 4 ? .62 : t < 12.5 ? 1 : t < 14.5 ? .6 : .35;
      materials.routes.emissiveIntensity = .12 + activity * .28;
      materials.signal.emissiveIntensity = .7 + activity * .85;
      const pulse = (t * .65) % 1;
      hubPulse.scale.setScalar(1 + pulse * .55);
      materials.halo.opacity = (1 - pulse) * (.26 + matched * .07);
      materials.hub.emissiveIntensity = .35 + .28 * Math.sin(t * 3) ** 2 + matched * .07;
      routes.forEach(({ at }, i) => {
        for (let j = 0; j < 2; j++) {
          const progress = (t * (.18 + i * .007) + i * .137 + j * .5) % 1;
          dummy.position.copy(at(progress)); dummy.quaternion.identity();
          dummy.scale.setScalar((.74 + Math.sin(progress * Math.PI) * .35) * activity); dummy.updateMatrix(); signals.setMatrixAt(i * 2 + j, dummy.matrix);
        }
      });
      signals.instanceMatrix.needsUpdate = true;
    },
    setTheme(theme) {
      const dark = theme === 'dark';
      materials.ocean.color.setHex(dark ? 0x103c78 : 0x1a518a);
      materials.land.color.setHex(dark ? 0xe3ceb0 : 0xf0dfbd);
      materials.grid.opacity = dark ? .28 : .32;
    },
  };
  root.userData.animate(0);
  return root;
}
