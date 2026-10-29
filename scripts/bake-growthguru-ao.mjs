#!/usr/bin/env node
// Deterministic contact AO for the rigid #31 learning garden only. No direct-light
// shadows are baked, so the moving moon, telescope and dome keep live lighting.
// node scripts/bake-growthguru-ao.mjs [--rays=24] [--distance=.35] [--cell=.014]
// node scripts/bake-growthguru-ao.mjs --model=propertyguru --rays=32 --distance=.45
//   [--limit=1000] benchmarks without writing or replacing an asset.
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from '../public/landing/vendor/three.module.js';
import { geometryObservatoryAOHash, OBSERVATORY_AO_MAGIC, OBSERVATORY_AO_QUANTIZATION } from '../public/landing/artifacts/astrodegen-occlusion.js';

const rootPath = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const options = Object.fromEntries(process.argv.slice(2).map(arg => {
  const match = /^--([a-z]+)=(.+)$/.exec(arg);
  if (!match || !['model', 'rays', 'distance', 'cell', 'limit', 'out'].includes(match[1])) throw new Error(`Unsupported bake option: ${arg}`);
  return [match[1], match[2]];
}));
const modelName=options.model??'growthguru';
if(!['growthguru','propertyguru','nestash','goldigloo'].includes(modelName))throw new Error('Unsupported model');
const {createArtifact}=await import(`../public/landing/artifacts/${modelName}.js`);
const rays = Number(options.rays ?? 24), maxDistance = Number(options.distance ?? .35), cell = Number(options.cell ?? .014);
const limit = options.limit === undefined ? Infinity : Number(options.limit);
const output = resolve(rootPath, options.out ?? `public/landing/assets/${modelName}-ao-v1.bin`);
if (!Number.isInteger(rays) || rays < 4 || rays > 256) throw new Error('rays must be an integer from 4 to 256.');
if (!(maxDistance > 0 && maxDistance < 10) || !(cell > 0 && cell < .1) || !(limit > 0)) throw new Error('Invalid distance, cell or sample limit.');
// Text and procedural texture pixels are irrelevant to geometric ray tests.
globalThis.document = { createElement() {
  const canvas = { width: 0, height: 0 };
  const context = { canvas, createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    createRadialGradient: () => ({ addColorStop() {} }), createLinearGradient: () => ({ addColorStop() {} }),
    measureText: value => ({ width: String(value).length * 8 }) };
  for (const method of ['putImageData','fillRect','clearRect','fillText','strokeRect','beginPath','closePath','moveTo','lineTo','arc','arcTo','ellipse','rect','roundRect','fill','stroke','save','restore','translate','rotate','scale','setTransform','drawImage']) context[method] = () => {};
  canvas.getContext = () => context;
  return canvas;
} };
const started = performance.now();
const model = await createArtifact(THREE, { bake: true });
model.updateMatrixWorld(true);
const meshes = [];
model.traverse(object => { if (object.isMesh && object.userData.observatoryAO === true) meshes.push(object); });
if (!meshes.length) throw new Error('No root-static observatoryAO meshes were marked.');
function skipOcclusion(object) {
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  return object.userData.noShadow || materials.every(material => material.transparent || material.transmission > 0);
}

// Transform once and flatten into one triangle soup, avoiding per-ray Three.js
// Mesh/Raycaster allocations. BVH leaves hold only eight nearby triangles.
const triangles = [], triBounds = [], centroids = [];
const point = new THREE.Vector3();
for (const mesh of meshes) {
  if (skipOcclusion(mesh)) continue;
  const position = mesh.geometry.getAttribute('position'), index = mesh.geometry.index;
  const count = index?.count ?? position.count;
  for (let i = 0; i < count; i += 3) {
    const vertices = [];
    for (let c = 0; c < 3; c++) {
      point.fromBufferAttribute(position, index ? index.getX(i + c) : i + c).applyMatrix4(mesh.matrixWorld);
      vertices.push(point.x, point.y, point.z);
    }
    const [ax, ay, az, bx, by, bz, cx, cy, cz] = vertices;
    const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
    const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
    const crossX = e1y * e2z - e1z * e2y, crossY = e1z * e2x - e1x * e2z, crossZ = e1x * e2y - e1y * e2x;
    if (crossX * crossX + crossY * crossY + crossZ * crossZ < 1e-18) continue;
    triangles.push(ax, ay, az, e1x, e1y, e1z, e2x, e2y, e2z);
    triBounds.push(Math.min(ax, bx, cx), Math.min(ay, by, cy), Math.min(az, bz, cz), Math.max(ax, bx, cx), Math.max(ay, by, cy), Math.max(az, bz, cz));
    centroids.push((ax + bx + cx) / 3, (ay + by + cy) / 3, (az + bz + cz) / 3);
  }
}
const triangleData = new Float32Array(triangles);
const boundsData = new Float32Array(triBounds);
const centroidData = new Float32Array(centroids);
triangles.length = triBounds.length = centroids.length = 0;
const ids = Array.from({ length: triangleData.length / 9 }, (_, i) => i);
const nodes = [];
function build(start, end) {
  const bounds = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  const centers = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = start; i < end; i++) {
    const id = ids[i];
    for (let axis = 0; axis < 3; axis++) {
      bounds[axis] = Math.min(bounds[axis], boundsData[id * 6 + axis]);
      bounds[axis + 3] = Math.max(bounds[axis + 3], boundsData[id * 6 + axis + 3]);
      centers[axis] = Math.min(centers[axis], centroidData[id * 3 + axis]);
      centers[axis + 3] = Math.max(centers[axis + 3], centroidData[id * 3 + axis]);
    }
  }
  const n = nodes.length;
  const node = { bounds, start, end, left: -1, right: -1 };
  nodes.push(node);
  if (end - start > 8) {
    let axis = 0;
    if (centers[4] - centers[1] > centers[3] - centers[0]) axis = 1;
    if (centers[5] - centers[2] > centers[axis + 3] - centers[axis]) axis = 2;
    const sorted = ids.slice(start, end).sort((a, b) => centroidData[a * 3 + axis] - centroidData[b * 3 + axis] || a - b);
    for (let i = 0; i < sorted.length; i++) ids[start + i] = sorted[i];
    const middle = (start + end) >>> 1;
    node.left = build(start, middle); node.right = build(middle, end);
  }
  return n;
}
build(0, ids.length);
console.log(`Built ${nodes.length.toLocaleString()} BVH nodes for ${ids.length.toLocaleString()} triangles in ${((performance.now() - started) / 1000).toFixed(2)}s.`);

const epsilon = .0018;
const stack = [];
function trace(ox, oy, oz, dx, dy, dz, far = maxDistance) {
  let nearest = far;
  const origin = [ox, oy, oz], direction = [dx, dy, dz];
  stack.length = 0; stack.push(0);
  while (stack.length) {
    const node = nodes[stack.pop()], b = node.bounds;
    let lo = epsilon * .4, hi = nearest;
    for (let axis = 0; axis < 3 && hi >= lo; axis++) {
      if (Math.abs(direction[axis]) < 1e-10) {
        if (origin[axis] < b[axis] || origin[axis] > b[axis + 3]) hi = -1;
      } else {
        const a = (b[axis] - origin[axis]) / direction[axis];
        const z = (b[axis + 3] - origin[axis]) / direction[axis];
        lo = Math.max(lo, Math.min(a, z)); hi = Math.min(hi, Math.max(a, z));
      }
    }
    if (hi < lo) continue;
    if (node.left !== -1) { stack.push(node.right, node.left); continue; }
    for (let i = node.start; i < node.end; i++) {
      const j = ids[i] * 9;
      const e1x = triangleData[j + 3], e1y = triangleData[j + 4], e1z = triangleData[j + 5];
      const e2x = triangleData[j + 6], e2y = triangleData[j + 7], e2z = triangleData[j + 8];
      const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
      const det = e1x * px + e1y * py + e1z * pz;
      if (Math.abs(det) < 1e-10) continue;
      const tx = ox - triangleData[j], ty = oy - triangleData[j + 1], tz = oz - triangleData[j + 2];
      const inv = 1 / det, u = (tx * px + ty * py + tz * pz) * inv;
      if (u < 0 || u > 1) continue;
      const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
      const v = (dx * qx + dy * qy + dz * qz) * inv;
      if (v < 0 || u + v > 1) continue;
      const distance = (e2x * qx + e2y * qy + e2z * qz) * inv;
      if (distance > epsilon * .4 && distance < nearest) nearest = distance;
    }
  }
  return nearest;
}

const cache = new Map(), records = [];
const normal = new THREE.Vector3(), tangent = new THREE.Vector3(), bitangent = new THREE.Vector3();
const normalMatrix = new THREE.Matrix3();
let cacheHits = 0, sampled = 0, totalVertices = 0, minAO = 255, maxAO = 0, sumAO = 0;
let nextProgress = performance.now() + 10000;
function sampleAO(x, y, z, nx, ny, nz) {
  const key = `${Math.round(x / cell)},${Math.round(y / cell)},${Math.round(z / cell)}:${Math.round(nx * 16)},${Math.round(ny * 16)},${Math.round(nz * 16)}`;
  if (cache.has(key)) { cacheHits++; return cache.get(key); }
  if (sampled >= limit) return 255;
  sampled++;
  normal.set(nx, ny, nz);
  tangent.set(Math.abs(ny) > .95 ? 1 : 0, Math.abs(ny) > .95 ? 0 : 1, 0).cross(normal).normalize();
  bitangent.crossVectors(normal, tangent);
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619) >>> 0;
  const rotation = hash / 4294967296 * Math.PI * 2;
  let occlusion = 0;
  for (let ray = 0; ray < rays; ray++) {
    const radial = Math.sqrt((ray + .5) / rays), angle = ray * 2.399963229728653 + rotation;
    const a = radial * Math.cos(angle), b = radial * Math.sin(angle), c = Math.sqrt(1 - radial * radial);
    const dx = tangent.x * a + bitangent.x * b + nx * c;
    const dy = tangent.y * a + bitangent.y * b + ny * c;
    const dz = tangent.z * a + bitangent.z * b + nz * c;
    const hit = trace(x + nx * epsilon, y + ny * epsilon, z + nz * epsilon, dx, dy, dz);
    occlusion += (1 - hit / maxDistance) ** 2;
  }
  const value = Math.round(255 * Math.max(0, Math.min(1, 1 - occlusion / rays)));
  cache.set(key, value);
  if (performance.now() > nextProgress) {
    console.log(`Sampled ${sampled.toLocaleString()} unique vertices (${(sampled * rays).toLocaleString()} rays), ${((performance.now() - started) / 1000).toFixed(1)}s elapsed.`);
    nextProgress = performance.now() + 10000;
  }
  return value;
}
for (const mesh of meshes) {
  const position = mesh.geometry.getAttribute('position'), normals = mesh.geometry.getAttribute('normal');
  if (!normals || normals.count !== position.count) throw new Error(`Missing/mismatched normals on ${mesh.name || mesh.type}.`);
  const bytes = new Uint8Array(position.count), skip = skipOcclusion(mesh);
  normalMatrix.getNormalMatrix(mesh.matrixWorld);
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
    normal.fromBufferAttribute(normals, i).applyMatrix3(normalMatrix).normalize();
    if (![point.x, point.y, point.z, normal.x, normal.y, normal.z].every(Number.isFinite)) throw new Error('Non-finite geometry data.');
    const ao = skip || normal.lengthSq() < .1 ? 255 : sampleAO(point.x, point.y, point.z, normal.x, normal.y, normal.z);
    bytes[i] = ao;
    minAO = Math.min(minAO, ao); maxAO = Math.max(maxAO, ao); sumAO += ao;
  }
  totalVertices += position.count;
  records.push({ bytes, vertices: position.count, hash: geometryObservatoryAOHash(mesh.geometry), name: mesh.name || mesh.type });
}
if (limit !== Infinity) {
  console.log(JSON.stringify({ benchmark: true, sampled, raysCast: sampled * rays, cacheHits, totalVertices, elapsedSeconds: +((performance.now() - started) / 1000).toFixed(2) }));
  console.log('Benchmark only: no asset written.');
} else {
  const headerSize = 16 + records.length * 16;
  const binary = Buffer.alloc(headerSize + totalVertices);
  binary.writeUInt32LE(OBSERVATORY_AO_MAGIC, 0);
  binary.writeUInt32LE(records.length, 4);
  binary.writeUInt32LE(totalVertices, 8);
  binary.writeUInt32LE(OBSERVATORY_AO_QUANTIZATION, 12);
  let offset = headerSize;
  const metadata = records.map((record, i) => {
    binary.writeUInt32LE(record.vertices, 16 + i * 16);
    binary.writeUInt32LE(offset, 20 + i * 16);
    binary.writeUInt32LE(record.hash, 24 + i * 16);
    binary.set(record.bytes, offset);
    const entry = { index: i, name: record.name, vertices: record.vertices, offset, hash: record.hash };
    offset += record.bytes.length;
    return entry;
  });
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, binary);
  const stats = { format: 'OAO1', signatureQuantization: OBSERVATORY_AO_QUANTIZATION, rays, maxDistance, keyRays: 0, cell, epsilon, sampled, cacheHits, totalVertices, triangles: ids.length, bytes: binary.length, minAO, maxAO, averageAO: +(sumAO / totalVertices).toFixed(2), meshes: metadata };
  await writeFile(output.replace(/\.bin$/, '') + '.json', JSON.stringify(stats, null, 2) + '\n');
  console.log(JSON.stringify({ ...stats, meshes: metadata.length, output, elapsedSeconds: +((performance.now() - started) / 1000).toFixed(2) }, null, 2));
}
