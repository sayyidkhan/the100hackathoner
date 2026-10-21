#!/usr/bin/env node
// Offline, deterministic vertex ambient occlusion and soft studio-key shadows.
// No browser, native renderer or runtime dependency is needed. Re-run whenever
// the sculpture geometry changes; the binary records reject stale geometry.
//
// node scripts/bake-storybook-ao.mjs [--rays=48] [--distance=0.9]
//   [--cell=0.018] [--out=public/landing/assets/storybook-ao-v1.bin]
//   [--limit=1000]  (benchmark only: computes at most this many unique samples)
// node scripts/bake-storybook-ao.mjs --model=pal
//   Pal uses shallow contact occlusion, retaining live animated shadows.
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from '../public/landing/vendor/three.module.js';
import { geometryAOHash } from '../public/landing/artifacts/storybook-surface.js';

const rootPath = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const options = Object.fromEntries(process.argv.slice(2).map(arg => {
  const match = /^--([a-z]+)=(.+)$/.exec(arg);
  if (!match) throw new Error(`Expected --name=value, received ${arg}`);
  return [match[1], match[2]];
}));
if (options.model && !['storybook', 'pal', 'medivoice'].includes(options.model)) throw new Error('Unknown bake model.');
const pal = options.model === 'pal';
const medivoice = options.model === 'medivoice';
const animated = pal || medivoice;
const { createArtifact } = await import(medivoice ? '../public/landing/artifacts/medivoice.js' : pal ? '../public/landing/artifacts/kingdom-of-pal.js' : '../public/landing/artifacts/storybook.js');
const rays = Number(options.rays ?? (animated ? 24 : 48));
const maxDistance = Number(options.distance ?? (pal ? .2 : medivoice ? .24 : .9));
const keyRays = animated ? 0 : 16; // Articulated exhibits keep live direct shadows.
const keyPosition = new THREE.Vector3(-5, 6, 2.5);
const keyWidth = 1.5;
const cell = Number(options.cell ?? (pal ? .012 : medivoice ? .015 : .018));
const limit = options.limit === undefined ? Infinity : Number(options.limit);
const output = resolve(rootPath, options.out ?? `public/landing/assets/${medivoice ? 'medivoice' : pal ? 'pal' : 'storybook'}-ao-v1.bin`);
if (!Number.isInteger(rays) || rays < 4 || rays > 256) throw new Error('rays must be an integer from 4 to 256.');
if (!(maxDistance > 0 && maxDistance < 10) || !(cell > 0 && cell < .1)) throw new Error('Invalid distance or cache cell.');
if (!(limit > 0)) throw new Error('limit must be positive.');
const started = performance.now();
const model = await createArtifact(THREE, { bake: true });
model.userData.animate?.(0);
model.updateMatrixWorld(true);
const meshes = [];
model.traverse(object => { if (object.isMesh) meshes.push(object); });
if (!meshes.length) throw new Error('The model has no mesh geometry.');

function skipOcclusion(object) {
  for (let p = object; p && p !== model; p = p.parent) if (p.userData.noAO) return true;
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  return materials.every(material => material.transparent && material.opacity < .5);
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
const keyNormal = new THREE.Vector3(0, 1, 0).sub(keyPosition).normalize();
const keyRight = new THREE.Vector3(0, 1, 0).cross(keyNormal).normalize();
const keyUp = new THREE.Vector3().crossVectors(keyNormal, keyRight);
const keySamples = [];
for (let row = 0; keyRays && row < 4; row++) for (let col = 0; col < 4; col++) {
  keySamples.push(keyPosition.clone()
    .addScaledVector(keyRight, ((col + .5) / 4 - .5) * keyWidth)
    .addScaledVector(keyUp, ((row + .5) / 4 - .5) * keyWidth));
}
let cacheHits = 0, sampled = 0, totalVertices = 0, minAO = 255, maxAO = 0, sumAO = 0, minKey = 255, maxKey = 0, sumKey = 0;
let nextProgress = performance.now() + 10000;
function sampleAO(x, y, z, nx, ny, nz) {
  const key = `${Math.round(x / cell)},${Math.round(y / cell)},${Math.round(z / cell)}:${Math.round(nx * 16)},${Math.round(ny * 16)},${Math.round(nz * 16)}`;
  if (cache.has(key)) { cacheHits++; return cache.get(key); }
  if (sampled >= limit) return [255, 255];
  sampled++;
  normal.set(nx, ny, nz);
  tangent.set(Math.abs(ny) > .95 ? 1 : 0, Math.abs(ny) > .95 ? 0 : 1, 0).cross(normal).normalize();
  bitangent.crossVectors(normal, tangent);
  // The same rotated cosine-weighted hemisphere is reproducible on every run.
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
  let visibleKeySamples = 0;
  const ox = x + nx * epsilon, oy = y + ny * epsilon, oz = z + nz * epsilon;
  for (const lamp of keySamples) {
    const lx = lamp.x - ox, ly = lamp.y - oy, lz = lamp.z - oz;
    const distance = Math.hypot(lx, ly, lz);
    if (trace(ox, oy, oz, lx / distance, ly / distance, lz / distance, distance) >= distance - epsilon) visibleKeySamples++;
  }
  const result = [value, keyRays ? Math.round(255 * visibleKeySamples / keyRays) : 255];
  cache.set(key, result);
  if (performance.now() > nextProgress) {
    console.log(`Sampled ${sampled.toLocaleString()} unique vertices (${(sampled * (rays + keyRays)).toLocaleString()} rays), ${(performance.now() - started).toFixed(0)}ms elapsed.`);
    nextProgress = performance.now() + 10000;
  }
  return result;
}
for (const mesh of meshes) {
  const position = mesh.geometry.getAttribute('position'), normals = mesh.geometry.getAttribute('normal');
  if (!normals || normals.count !== position.count) throw new Error(`Missing/mismatched normals on ${mesh.name || mesh.type}.`);
  const bytes = new Uint8Array(position.count * 2), skip = skipOcclusion(mesh);
  normalMatrix.getNormalMatrix(mesh.matrixWorld);
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
    normal.fromBufferAttribute(normals, i).applyMatrix3(normalMatrix).normalize();
    if (![point.x, point.y, point.z, normal.x, normal.y, normal.z].every(Number.isFinite)) throw new Error('Non-finite geometry data.');
    const [ao, key] = skip || normal.lengthSq() < .1 ? [255, 255] : sampleAO(point.x, point.y, point.z, normal.x, normal.y, normal.z);
    bytes[i * 2] = ao; bytes[i * 2 + 1] = key;
    minAO = Math.min(minAO, ao); maxAO = Math.max(maxAO, ao); sumAO += ao;
    minKey = Math.min(minKey, key); maxKey = Math.max(maxKey, key); sumKey += key;
  }
  totalVertices += position.count;
  records.push({ bytes, vertices: position.count, hash: geometryAOHash(mesh.geometry), name: mesh.name || mesh.type });
}
if (limit !== Infinity) {
  console.log(JSON.stringify({ benchmark: true, sampled, raysCast: sampled * (rays + keyRays), cacheHits, totalVertices, elapsedSeconds: +((performance.now() - started) / 1000).toFixed(2) }));
  console.log('Benchmark only: no asset written.');
} else {
  const headerSize = 16 + records.length * 16;
  const binary = Buffer.alloc(headerSize + totalVertices * 2);
  binary.writeUInt32LE(0x324f4142, 0); // "BAO2": interleaved ambient and soft-key visibility.
  binary.writeUInt32LE(records.length, 4);
  binary.writeUInt32LE(totalVertices, 8);
  binary.writeUInt32LE(rays, 12);
  let offset = headerSize;
  const metadata = records.map((record, i) => {
    binary.writeUInt32LE(record.vertices, 16 + i * 16);
    binary.writeUInt32LE(offset, 20 + i * 16);
    binary.writeUInt32LE(record.hash, 24 + i * 16);
    binary.set(record.bytes, offset);
    const entry = { index: i, name: record.name, vertices: record.vertices, offset, hash: record.hash };
    offset += record.bytes.length; return entry;
  });
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, binary);
  const stats = { format: 'BAO2', rays, maxDistance, keyRays, keyPosition: keyPosition.toArray(), keyWidth, cell, epsilon, sampled, cacheHits, totalVertices, triangles: ids.length, bytes: binary.length, minAO, maxAO, averageAO: +(sumAO / totalVertices).toFixed(2), minKey, maxKey, averageKey: +(sumKey / totalVertices).toFixed(2), meshes: metadata };
  await writeFile(output.replace(/\.bin$/, '') + '.json', JSON.stringify(stats, null, 2) + '\n');
  console.log(JSON.stringify({ ...stats, meshes: metadata.length, output, elapsedSeconds: +((performance.now() - started) / 1000).toFixed(2) }, null, 2));
}
