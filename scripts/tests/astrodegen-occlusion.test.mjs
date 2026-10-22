import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as T from '../../public/landing/vendor/three.module.js';
import { createArtifact } from '../../public/landing/artifacts/astrodegen.js';
import { applyObservatoryAO } from '../../public/landing/artifacts/astrodegen-occlusion.js';

// Texture drawing is irrelevant to this geometry/loader test. WebGL appearance
// is checked in-browser; these stubs only let the actual artifact instantiate.
globalThis.document = { createElement: () => ({ getContext: () => ({
  createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  putImageData() {}, createRadialGradient: () => ({ addColorStop() {} }),
  fillRect() {}, fillText() {}, clearRect() {}, setTransform() {},
}) }) };

const binary = await readFile(new URL('../../public/landing/assets/astrodegen-ao-v1.bin', import.meta.url));
let fetches = 0;
globalThis.fetch = async () => {
  fetches++;
  return { ok: true, arrayBuffer: async () => binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength) };
};

// Even normal artifact creation must not start a fetch in Node geometry tests.
assert.equal(typeof window, 'undefined');
const root = createArtifact(T);
assert.equal(await applyObservatoryAO(T, root), false);
assert.equal(fetches, 0, 'Node must bypass AO asset fetching');

globalThis.window = {};
const receivers = [], otherMaterials = new Map();
root.traverse(mesh => {
  if (!mesh.isMesh) return;
  if (mesh.userData.observatoryAO === true) {
    receivers.push({ mesh, material: mesh.material, receiveShadow: mesh.receiveShadow });
  } else {
    otherMaterials.set(mesh, mesh.material);
  }
});
assert(receivers.length > 0, 'The model exposes rigid AO receivers');
assert(receivers.some(({ receiveShadow }) => receiveShadow), 'Receivers actually use live shadows');
for (const name of ['lunar-tracking-dome', 'lunar-tracking-telescope', 'lunar-market-display']) {
  const assembly = root.getObjectByName(name);
  assert(assembly, `The real moving assembly ${name} is present`);
  assembly.traverse(mesh => {
    if (mesh.isMesh) assert(otherMaterials.has(mesh), `${name} must be excluded from the bake`);
  });
}
let renderRequests = 0;
root.userData.requestRender = () => renderRequests++;
const pending = applyObservatoryAO(T, root);
assert.equal(applyObservatoryAO(T, root), pending, 'Repeated calls reuse the same loading promise');
assert.equal(await pending, true, 'The checked-in bake must match current static geometry');
assert.equal(root.userData.observatoryAOStatus, 'ready');
assert.equal(fetches, 1);
assert.equal(renderRequests, 1, 'An asynchronous bake requests a render even when motion is paused');

let shadedVertices = 0;
for (const { mesh, material, receiveShadow } of receivers) {
  const ao = mesh.geometry.getAttribute('observatoryAO');
  assert.equal(ao.count, mesh.geometry.getAttribute('position').count);
  assert.equal(ao.normalized, true, 'Byte AO values arrive in the shader normalized');
  assert.equal(mesh.receiveShadow, receiveShadow, 'Baked ambient shading preserves live shadow reception');
  for (const value of ao.array) if (value < 255) shadedVertices++;
  if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
    assert.notEqual(mesh.material, material, 'Receiver materials are isolated from animated assemblies');
    const shader = {
      vertexShader: '#include <common>\n#include <begin_vertex>',
      fragmentShader: '#include <common>\n#include <aomap_fragment>',
    };
    mesh.material.onBeforeCompile(shader, {});
    assert(shader.vertexShader.includes('attribute float observatoryAO'));
    assert(shader.fragmentShader.includes('reflectedLight.indirectDiffuse *= observatoryContact'));
    assert(!shader.fragmentShader.includes('reflectedLight.directDiffuse *='), 'No baked direct-light shadow');
    assert(!shader.fragmentShader.includes('reflectedLight.directSpecular *='), 'Direct reflections stay live');
  }
}
assert(shadedVertices > 0, 'The asset contains actual contact shading');
for (const [mesh, material] of otherMaterials) {
  assert.equal(mesh.material, material, 'All moving materials preserve their original references');
  assert(!mesh.geometry.getAttribute('observatoryAO'), 'No AO attribute leaks onto moving geometry');
}

// Change the LAST receiver: earlier matching records must not be applied before
// the complete bake is validated, or stale architecture would get false stains.
const staleRoot = createArtifact(T, { bake: true }), staleReceivers = [];
staleRoot.traverse(mesh => { if (mesh.isMesh && mesh.userData.observatoryAO === true) staleReceivers.push(mesh); });
const changed = staleReceivers.at(-1).geometry.getAttribute('position');
changed.setX(0, changed.getX(0) + .03);
const beforeStale = new Map(staleReceivers.map(mesh => [mesh, mesh.material]));
let staleRenderRequests = 0;
staleRoot.userData.requestRender = () => staleRenderRequests++;
const warnings = [], previousWarn = console.warn;
try {
  console.warn = message => warnings.push(message);
  assert.equal(await applyObservatoryAO(T, staleRoot), false);
} finally {
  console.warn = previousWarn;
}
assert.equal(staleRoot.userData.observatoryAOStatus, 'stale');
assert(warnings.some(message => message.includes('stale')));
assert.equal(staleRenderRequests, 0);
staleRoot.traverse(mesh => {
  if (!mesh.isMesh) return;
  assert(!mesh.geometry.getAttribute('observatoryAO'), 'Stale rejection must leave every mesh unmodified');
  if (beforeStale.has(mesh)) assert.equal(mesh.material, beforeStale.get(mesh), 'Stale rejection must not patch any material');
});

console.log(`PASS: current bake matches ${receivers.length} static receivers; Node bypass, moving-material isolation, live shadows, render request, ambient-only shader and atomic stale rejection`);
