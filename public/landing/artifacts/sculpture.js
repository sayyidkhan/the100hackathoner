// Shared materials and geometry for the research-led project miniatures.
export function sculpture(THREE) {
  const root = new THREE.Group();
  const colors = { paper: 0xe7dbc2, ivory: 0xf4ebd8, shade: 0xcbbb9e, red: 0xa92119, blue: 0x133fac, ink: 0x252831, wood: 0xc9aa7d, lavender: 0xc9a4e7 };
  const materials = Object.fromEntries(Object.entries(colors).map(([key, color]) => [key, new THREE.MeshStandardMaterial({ color, roughness: .76, metalness: 0, side: THREE.DoubleSide })]));
  function mesh(geometry, color = 'ivory', parent = root) {
    const object = new THREE.Mesh(geometry, materials[color]);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(w, h, d, x, y, z, color = 'ivory', parent = root) {
    const m = mesh(new THREE.BoxGeometry(w, h, d), color, parent); m.position.set(x, y, z); return m;
  }
  function disk(r, h, x, y, z, color = 'ivory', parent = root) {
    const m = mesh(new THREE.CylinderGeometry(r, r, h, 48), color, parent); m.position.set(x, y, z); return m;
  }
  function ball(r, x, y, z, color = 'ivory', parent = root) {
    const m = mesh(new THREE.SphereGeometry(r, 20, 12), color, parent); m.position.set(x, y, z); return m;
  }
  function line(points, radius = .04, color = 'blue', parent = root) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 48, radius, 8, false), color, parent);
  }
  function person(x, y, z, scale = 1, color = 'ivory', parent = root) {
    const group = new THREE.Group(); parent.add(group); group.position.set(x, y, z); group.scale.setScalar(scale);
    box(.46, .57, .14, 0, .285, 0, color, group);
    const head = mesh(new THREE.CylinderGeometry(.18, .18, .14, 24), color, group); head.rotation.x = Math.PI / 2; head.position.y = .72;
    return group;
  }
  function finish(id) {
    root.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(root);
    const center = bounds.getCenter(new THREE.Vector3());
    for (const child of root.children) child.position.add(new THREE.Vector3(-center.x, -bounds.min.y, -center.z));
    root.updateMatrixWorld(true);
    const batches = new Map();
    root.traverse(object => {
      if (!object.isMesh) return;
      const g = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
      g.applyMatrix4(object.matrixWorld);
      const key = object.material.uuid;
      if (!batches.has(key)) batches.set(key, { material: object.material, positions: [], normals: [] });
      const b = batches.get(key);
      for (const v of g.attributes.position.array) b.positions.push(v);
      for (const v of g.attributes.normal.array) b.normals.push(v);
      g.dispose(); object.geometry.dispose();
    });
    root.clear();
    for (const b of batches.values()) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(b.positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(b.normals, 3));
      geometry.computeBoundingSphere();
      const m = new THREE.Mesh(geometry, b.material); m.castShadow = m.receiveShadow = true; root.add(m);
    }
    const used = new Set([...batches.values()].map(b => b.material));
    Object.values(materials).forEach(m => { if (!used.has(m)) m.dispose(); });
    root.userData = { conceptual: true, artifactId: id };
    return root;
  }
  return { root, materials, mesh, box, disk, ball, line, person, finish };
}
