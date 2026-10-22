import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import { createArtifact } from '../../public/landing/artifacts/astrodegen.js';
import { createObservatory } from '../../public/landing/artifacts/astrodegen-observatory.js';

const noop = () => {};
globalThis.document = { createElement: () => ({ getContext: () => ({
  createImageData: (width, height) => ({ data: new Uint8ClampedArray(width * height * 4) }),
  putImageData: noop, fillRect: noop, clearRect: noop, fillText: noop,
  createRadialGradient: () => ({ addColorStop: noop }),
}) }) };

// Inspect the actual wall before batching. Decorative dependencies are empty
// objects here: only the helper's own architectural geometry is under test.
const fixture = new T.Group(), materialCache = new Map();
const materials = new Proxy({}, { get: (_, key) => {
  if (!materialCache.has(key)) materialCache.set(key, new T.MeshStandardMaterial());
  return materialCache.get(key);
} });
const group = (x = 0, y = 0, z = 0, parent = fixture) => {
  const object = new T.Group(); object.position.set(x, y, z); parent.add(object); return object;
};
const mesh = (geometry, material, parent = fixture) => {
  const object = new T.Mesh(geometry, material); parent.add(object); return object;
};
const fixtureRig = createObservatory(T, {
  group, mesh, materials,
  box: (_w, _h, _d, x, y, z, _material, parent) => group(x, y, z, parent),
  disk: (_r, _h, x, y, z, _material, parent) => group(x, y, z, parent),
  ring: (_r, _t, x, y, z, _material, parent) => group(x, y, z, parent),
  ball: (_r, x, y, z, _material, parent) => group(x, y, z, parent),
  line: noop,
});
fixture.updateMatrixWorld(true);
const wall = fixtureRig.observatory.getObjectByName('observatory-open-wall');
assert(wall, 'The observatory has its own thick architectural wall');
wall.material.side = T.DoubleSide;
const wallRay = new T.Raycaster();
function wallHits(angle, height) {
  const origin = fixtureRig.observatory.localToWorld(new T.Vector3(0, height, 0));
  wallRay.set(origin, new T.Vector3(Math.sin(angle), 0, Math.cos(angle)));
  wallRay.far = .82;
  return wallRay.intersectObject(wall, false);
}
for (const angle of [-2.28, -.96, .96, 2.28]) {
  assert.equal(wallHits(angle, .57).length, 0, 'Each window is a real opening through the wall');
  assert.equal(wallHits(angle, .71).length, 0, 'The upper center of the arched window remains open');
  assert(wallHits(angle, .78).length >= 2, 'The wall continues above each arched window');
  assert(wallHits(angle, .35).length >= 2, 'Both wall surfaces remain solid below each window');
}
assert.equal(wallHits(0, .40).length, 0, 'The doorway is cut through the wall');
assert(wallHits(.46, .57).length >= 2, 'A solid pier separates the door and windows');

// Contact occlusion is interpolated per vertex. Full-height triangles cannot
// distinguish a narrow cornice/footing shadow from the rest of the plaster.
const wallPositions = wall.geometry.attributes.position;
let footingSamples = 0, corniceSamples = 0;
for (let i = 0; i < wallPositions.count; i += 3) {
  const heights = [0, 1, 2].map(offset => wallPositions.getY(i + offset));
  for (let edge = 0; edge < 3; edge++) {
    const a = i + edge, b = i + (edge + 1) % 3;
    const horizontalDistance = Math.hypot(wallPositions.getX(a) - wallPositions.getX(b), wallPositions.getZ(a) - wallPositions.getZ(b));
    if (horizontalDistance < 1e-7) assert(Math.abs(wallPositions.getY(a) - wallPositions.getY(b)) <= .061,
      'Vertical wall edges are short enough to resolve local contact shadows');
  }
  for (const y of heights) {
    if (y > .12 && y < .15) footingSamples++;
    if (y > .985 && y < 1.015) corniceSamples++;
  }
}
assert(footingSamples > 0 && corniceSamples > 0, 'Both wall boundaries have interior contact-shadow samples');
for (const side of ['left', 'right']) for (const surface of ['inside', 'outside']) {
  const panel = fixtureRig.dome.getObjectByName(`observatory-dome-panel-${side}-${surface}`);
  assert(panel, 'The roof exposes each physical panel surface');
  const { position, uv } = panel.geometry.attributes;
  const indices = panel.geometry.index;
  const p0 = new T.Vector3(), p1 = new T.Vector3();
  for (let i = 0; i < indices.count; i += 3) for (let edge = 0; edge < 3; edge++) {
    const a = indices.getX(i + edge), b = indices.getX(i + (edge + 1) % 3);
    const distance = p0.fromBufferAttribute(position, a).distanceTo(p1.fromBufferAttribute(position, b));
    const uvDistance = Math.hypot(uv.getX(a) - uv.getX(b), uv.getY(a) - uv.getY(b));
    if (distance < 1e-7) assert(uvDistance < 1e-7, 'Roof UVs collapse cleanly at the pole');
    else assert(uvDistance / distance > 1.9 && uvDistance / distance < 2.85,
      'Roof texture density remains bounded across the entire dome');
  }
}

const root = createArtifact(T, { bake: true });
const dome = root.getObjectByName('lunar-tracking-dome');
const telescope = root.getObjectByName('lunar-tracking-telescope');
const moon = root.getObjectByName('traveling-moon');
assert(dome && telescope && moon, 'The articulated observatory and single moon survive batching');
const domeMeshes = [], telescopeMeshes = [], staticMeshes = [];
dome.traverse(object => { if (object.isMesh) domeMeshes.push(object); });
telescope.traverse(object => { if (object.isMesh) telescopeMeshes.push(object); });
root.traverse(object => { if (object.userData.observatoryAO) staticMeshes.push(object); });
assert(domeMeshes.length && telescopeMeshes.length && staticMeshes.length,
  'Architecture, dome and telescope retain independent rigid assemblies');
assert(staticMeshes.every(object => object.parent === root),
  'Only fixed architecture receives the root contact-shadow bake');

const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), normal = new T.Vector3();
let checkedFaces = 0;
for (const object of domeMeshes) {
  const geometry = object.geometry, positions = geometry.attributes.position, normals = geometry.attributes.normal;
  assert.equal(positions.count, normals.count, 'Every dome vertex has a normal after batching');
  const count = geometry.index?.count ?? positions.count;
  for (let i = 0; i < count; i += 3) {
    const indices = [0, 1, 2].map(offset => geometry.index ? geometry.index.getX(i + offset) : i + offset);
    a.fromBufferAttribute(positions, indices[0]); b.fromBufferAttribute(positions, indices[1]); c.fromBufferAttribute(positions, indices[2]);
    const faceNormal = b.sub(a).cross(c.sub(a));
    if (faceNormal.lengthSq() < 1e-16) continue; // Collapsed poles of parametric surfaces.
    normal.set(0, 0, 0);
    for (const index of indices) normal.add(new T.Vector3().fromBufferAttribute(normals, index));
    assert(faceNormal.dot(normal) > 0, 'Dome panel winding agrees with its outward or inward surface normal');
    checkedFaces++;
  }
  // Test obstruction from either side of the shell, independently of rendering culling.
  object.material = object.material.clone(); object.material.side = T.DoubleSide;
}
assert(checkedFaces > 0, 'The dome surface was checked');

root.userData.animate(0); root.updateMatrixWorld(true);
const staticMatrices = staticMeshes.map(object => object.matrixWorld.toArray());
const ray = new T.Raycaster(), origin = new T.Vector3(), direction = new T.Vector3();
const moonCenter = new T.Vector3(), worldVertex = new T.Vector3();
let nearestMoonGap = Infinity;
for (let t = 0; t < 24; t += .25) {
  root.userData.animate(t); root.updateMatrixWorld(true);
  telescope.getWorldPosition(origin); moon.getWorldPosition(moonCenter);
  direction.copy(moonCenter).sub(origin).normalize();
  const barrel = telescope.localToWorld(new T.Vector3(0, 1, 0)).sub(origin).normalize();
  assert(barrel.dot(direction) > .999999, 'The physical barrel axis points at the moon');
  const quaternion = telescope.getWorldQuaternion(new T.Quaternion());
  // A center ray and eight rim rays cover the 26 cm-wide optical barrel.
  for (let sample = 0; sample < 9; sample++) {
    const angle = (sample - 1) / 8 * Math.PI * 2;
    const offset = sample ? new T.Vector3(Math.cos(angle) * .13, 0, Math.sin(angle) * .13).applyQuaternion(quaternion) : new T.Vector3();
    ray.set(origin.clone().add(offset), direction); ray.far = 2;
    assert.equal(ray.intersectObjects(domeMeshes, false).length, 0,
      'The moving barrel has a clear dome aperture throughout the lunar transit');
  }
  for (const object of telescopeMeshes) {
    const positions = object.geometry.attributes.position;
    for (let index = 0; index < positions.count; index++) {
      worldVertex.fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld);
      nearestMoonGap = Math.min(nearestMoonGap, worldVertex.distanceTo(moonCenter) - .44);
    }
  }
  assert.deepEqual(staticMeshes.map(object => object.matrixWorld.toArray()), staticMatrices,
    'Moving the optical rig never rotates or shifts the fixed architecture');
}
assert(nearestMoonGap >= .05, 'The telescope stays visibly separated from the moving moon');
console.log(`PASS: real arched openings, localized wall contact sampling, consistent roof texture scale, correct dome winding, clear tracking aperture, independent static batches, telescope/moon gap ${nearestMoonGap.toFixed(3)}`);
