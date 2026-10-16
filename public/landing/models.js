import { createArtifact as createStorybook } from './artifacts/storybook.js';
import { createArtifact as createItachiCrow } from './artifacts/itachi-crow.js';
import { createArtifact as createBorneo } from './artifacts/long-taa-borneo.js';

/** Original procedural interpretations of the three Museum concept images.
 * These are symbolic project exhibits, not scans or product screenshots.
 */
export function createArtifact(THREE, id) {
  if (Number(id) === 81) return createStorybook(THREE);
  if (Number(id) === 80) return createItachiCrow(THREE);
  if (Number(id) === 79) return createBorneo(THREE);
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

  storybook();
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const center = bounds.getCenter(new THREE.Vector3());
  // Keep the returned object's origin on its floor, regardless of small overhangs.
  for (const child of root.children) child.position.add(new THREE.Vector3(-center.x,-bounds.min.y,-center.z));
  root.updateMatrixWorld(true);
  // The detailed leaves, windows and timbers are baked into material batches.
  // This preserves their silhouettes while avoiding hundreds of draw calls.
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
  root.userData.conceptual = true;
  root.userData.artifactId = Number(id);
  return root;
}
