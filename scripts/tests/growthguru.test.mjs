import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import { createArtifact } from '../../public/landing/artifacts/growthguru.js';
import { readFile } from 'node:fs/promises';
import { geometryObservatoryAOHash, OBSERVATORY_AO_MAGIC } from '../../public/landing/artifacts/astrodegen-occlusion.js';

test('GrowthGuru selects paths, tours from the current path, and rejects invalid selections', () => {
  const model = createArtifact(T);
  assert.equal(model.userData.displayBase, false);
  for (let i = 0; i < 3; i++) {
    model.userData.setStep(i, 20);
    model.userData.animate(21);
    assert.equal(model.userData.story.index, i);
    model.userData.setStep(null, 21);
    model.userData.animate(31.1);
    assert.equal(model.userData.story.index, (i + 1) % 3);
  }
  model.userData.setStep(1, 45);
  model.userData.setStep(99, 46);
  model.userData.animate(100);
  assert.equal(model.userData.story.index, 1);
  // A reset clock must immediately produce a valid state.
  model.userData.animate(0);
  assert.equal(model.userData.story.index, 1);
});

test('GrowthGuru geometry is finite and animation can be replayed without drift', () => {
  const model = createArtifact(T);
  model.traverse(o => {
    if (o.isMesh) assert.ok([...o.geometry.attributes.position.array].every(Number.isFinite));
  });
  const state = t => {
    model.userData.animate(t);
    model.updateMatrixWorld(true);
    const values = [];
    model.traverse(o => values.push(o.visible, ...o.matrixWorld.elements));
    return values;
  };
  const before = state(2);
  assert.notDeepEqual(state(6), before);
  assert.deepEqual(state(2), before);
  const bounds = new T.Box3().setFromObject(model);
  assert.ok(bounds.min.y > -.01, 'island sits on the ground');
  assert.ok(bounds.max.y < 6, 'arch and branches fit the composition');
});

test('the complete contact bake matches the shipped sculpture', async () => {
  const model = createArtifact(T), receivers = [];
  model.traverse(o => { if (o.isMesh && o.userData.observatoryAO) receivers.push(o); });
  const bytes = await readFile(new URL('../../public/landing/assets/growthguru-ao-v1.bin', import.meta.url));
  assert.equal(bytes.readUInt32LE(0), OBSERVATORY_AO_MAGIC);
  assert.equal(bytes.readUInt32LE(4), receivers.length);
  let offset = 16 + receivers.length * 16;
  receivers.forEach((mesh, i) => {
    const count = mesh.geometry.attributes.position.count;
    assert.equal(bytes.readUInt32LE(16 + i * 16), count);
    assert.equal(bytes.readUInt32LE(20 + i * 16), offset);
    assert.equal(bytes.readUInt32LE(24 + i * 16), geometryObservatoryAOHash(mesh.geometry));
    offset += count;
  });
  assert.equal(offset, bytes.length);
  assert.ok(receivers.length <= 20, 'rigid scenery stays batched by material');
});
