import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../public/landing/vendor/three.module.js';

// Verify scene integrity and pause/reset behavior after static mesh batching.
for (const [id, name] of [[18, 'checker-app'], [19, 'fasight'], [20, 'co2unter']]) {
  test(`${name}: finite scene, meaningful motion, replay and loop reset`, async () => {
    const { createArtifact } = await import(`../../public/landing/artifacts/${name}.js`);
    const model = createArtifact(THREE);
    assert.equal(model.userData.artifactId, id);
    assert.equal(model.userData.realTimeAnimation, true);
    assert.ok(model.userData.cycleDuration > 0);
    let meshes = 0;
    model.traverse(object => {
      if (!object.isMesh) return;
      meshes++;
      for (const attribute of Object.values(object.geometry.attributes)) {
        assert.ok(attribute.array.every(Number.isFinite), `${object.name}: finite geometry`);
      }
      assert.ok(object.material, 'all meshes have materials');
    });
    assert.ok(meshes > 0);
    const state = time => {
      model.userData.animate(time);
      model.updateMatrixWorld(true);
      const result = [];
      model.traverse(object => result.push(object.visible, ...object.matrixWorld.elements,
        ...(object.material ? [object.material.opacity, object.material.emissiveIntensity] : [])));
      return result;
    };
    const start = state(0), changes = new Set();
    for (let second = 0; second < model.userData.cycleDuration; second += .5) {
      const sample = state(second);
      assert.ok(sample.every(value => value === undefined || typeof value === 'boolean' || Number.isFinite(value)));
      changes.add(JSON.stringify(sample));
      const story = model.userData.story;
      for (const field of ['step', 'title', 'detail']) {
        assert.ok(typeof story?.[field] === 'string' && story[field].length > 0, `story.${field}`);
      }
    }
    assert.ok(changes.size > 2, 'animated objects survive static batching');
    assert.deepEqual(state(0), start, 'reset restores initial state');
    assert.deepEqual(state(model.userData.cycleDuration), start, 'loop returns to initial state');
    const sample = state(3); state(11);
    assert.deepEqual(state(3), sample, 'seeking cannot accumulate drift');
    if ([18, 19, 20].includes(id)) {
      assert.equal(typeof model.userData.setStep, 'function');
      model.userData.setStep(3, 30);
      const selected = state(30);
      assert.equal(model.userData.story.index, 3, 'manual selection opens requested stage');
      assert.deepEqual(state(60), selected, 'inspection stays still as elapsed time advances');
      model.userData.setStep(null, 60);
      assert.deepEqual(state(60), selected, 'autoplay resumes without jumping');
      assert.notDeepEqual(state(70), selected, 'autoplay progresses after resuming');
    }
  });
}
