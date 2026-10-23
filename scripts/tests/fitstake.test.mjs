import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import { createArtifact } from '../../public/landing/artifacts/fitstake.js';
import { createFitStakeRunners } from '../../public/landing/artifacts/fitstake-runners.js';

function createModel() {
  // Labels need a canvas; these tests exercise geometry and choreography, not
  // browser font rasterization. Restore the global so other suites stay isolated.
  const previous = globalThis.document;
  globalThis.document = {
    createElement(name) {
      assert.equal(name, 'canvas');
      return { width: 0, height: 0, getContext: () => ({ clearRect() {}, fillText() {} }) };
    },
  };
  try { return createArtifact(T); }
  finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
}

function snapshot(model, time) {
  model.userData.animate(time);
  model.updateMatrixWorld(true);
  const state = [];
  model.traverse(object => {
    state.push(Number(object.visible), ...object.matrixWorld.elements);
  });
  assert.ok(state.every(Number.isFinite), 'animated transforms stay finite');
  return state;
}

test('FitStake visits all five steps, holds a selected step, and resumes from it', () => {
  const model = createModel();
  assert.equal(model.userData.artifactId, 82);
  for (let index = 0; index < 5; index++) {
    model.userData.animate(index * 7 + 1);
    assert.equal(model.userData.story.index, index);
    assert.equal(model.userData.story.step, `${index + 1} / 5`);
    assert.ok(model.userData.story.title && model.userData.story.detail);
  }
  model.userData.animate(35);
  assert.equal(model.userData.story.index, 0, 'automatic walkthrough loops');
  for (let index = 0; index < 5; index++) {
    model.userData.setStep(index, 40);
    model.userData.animate(100);
    assert.equal(model.userData.story.index, index, 'manual selection stays selected');
    model.userData.setStep(null, 100);
    model.userData.animate(100);
    assert.equal(model.userData.story.index, index, 'tour resumes at the selected step');
    model.userData.animate(107.1);
    assert.equal(model.userData.story.index, (index + 1) % 5);
  }
});

test('FitStake geometry is valid and all five animated states can be replayed without drift', () => {
  const model = createModel();
  model.traverse(object => {
    if (!object.isMesh) return;
    const { geometry } = object;
    assert.ok(object.material && geometry.attributes.position);
    for (const [name, attribute] of Object.entries(geometry.attributes)) {
      assert.ok([...attribute.array].every(Number.isFinite), `${name} values are finite`);
    }
    if (geometry.index) {
      for (const index of geometry.index.array) {
        assert.ok(index >= 0 && index < geometry.attributes.position.count, 'triangle indices reference vertices');
      }
    }
  });
  for (let index = 0; index < 5; index++) {
    model.userData.setStep(index);
    const before = snapshot(model, 2.3);
    assert.notDeepEqual(snapshot(model, 4.7), before, 'athletes and scene have motion');
    assert.deepEqual(snapshot(model, 2.3), before, 'seeking backwards restores the same pose');
    assert.deepEqual(snapshot(model, 2.3), before, 'a paused frame does not accumulate motion');
    snapshot(model, 0);
    snapshot(model, 3600);
  }
});

test('FitStake keeps visible geometry within the interactive exhibit budget', () => {
  const model = createModel();
  for (let index = 0; index < 5; index++) {
    model.userData.setStep(index);
    model.userData.animate(3);
    let draws = 0, triangles = 0;
    model.traverseVisible(object => {
      if (!object.isMesh && !object.isLine && !object.isSprite) return;
      draws += Array.isArray(object.material) ? object.geometry.groups.length : 1;
      if (object.isMesh) triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
    });
    // The scene shares the page with other exhibits. Catch accidental per-strand
    // or per-fibre meshes while allowing smooth anatomy and tailored clothing.
    assert.ok(draws <= 600, `step ${index + 1} has ${draws} visible draws (limit 600)`);
    assert.ok(triangles <= 500_000, `step ${index + 1} has ${triangles} visible triangles (limit 500000)`);
  }
});

test('FitStake trainers stay on the track throughout the running stride', () => {
  const root = new T.Group(), runners = createFitStakeRunners(T, root);
  const vertex = new T.Vector3();
  for (let phase = 0; phase < 32; phase++) {
    for (const runner of runners) {
      const stride = Math.sin(phase * Math.PI / 16 + runner.phase);
      runner.legs.forEach(({ hip, knee }, side) => {
        const swing = stride * (side ? 1 : -1);
        hip.rotation.x = swing * .62;
        knee.rotation.x = .12 + Math.max(0, swing) * 1.02;
      });
      runner.ground();
      root.updateMatrixWorld(true);
      let lowest = Infinity;
      runner.g.traverse(object => {
        if (!object.isMesh || object.parent.name !== 'trainer') return;
        const position = object.geometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
          vertex.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld);
          lowest = Math.min(lowest, vertex.y);
        }
      });
      // Check real vertices rather than the analytic contact samples or an AABB.
      assert.ok(Math.abs(lowest - .312) < .002, `planted sole height is ${lowest}`);
    }
  }
});

test('FitStake sculpted head and limbs have outward-facing surface normals', () => {
  const runners = createFitStakeRunners(T, new T.Group());
  runners.forEach((runner, index) => {
    for (const name of ['head', 'hip--1', 'knee']) {
      const bone = runner.g.getObjectByName(name);
      let inspected = 0;
      bone.children.filter(object => object.isMesh).forEach(object => {
        if (object.material.color.getHex() !== (index === 0 ? 0xd6a17d : 0xb8825f)) return;
        const { position, normal } = object.geometry.attributes;
        for (let i = 0; i < position.count; i++) {
          const y = position.getY(i);
          // Sample uninterrupted cross sections, excluding intersecting facial
          // details and end caps whose normals naturally point along the bone.
          if (!(name === 'head' ? y > .12 && y < .16 : y > -.25 && y < -.18)) continue;
          const outward = position.getX(i) * normal.getX(i) + position.getZ(i) * normal.getZ(i);
          assert.ok(outward > 0, `${name} surface faces outward`);
          inspected++;
        }
      });
      assert.ok(inspected >= 32, `sampled a complete cross section of ${name}`);
    }
  });
});

test('FitStake rests its hands beside the thighs and swings them below the shoulders only while running', () => {
  const model = createModel();
  const athletes = ['red', 'blue'].map(color => {
    const athlete = model.getObjectByName(`fitstake-athlete-${color}`);
    const body = athlete.getObjectByName('torso');
    const arms = [-1, 1].map(side => athlete.getObjectByName(`arm-${side}`));
    return {
      color,
      body,
      arms,
      wrists: () => arms.map(arm => body.worldToLocal(arm.getObjectByName('hand').getWorldPosition(new T.Vector3()))),
    };
  });
  for (const step of [0, 1, 2, 4]) {
    model.userData.setStep(step);
    for (const elapsed of [0, .4, 1.3, 2.1, 3.8, 5.9]) {
      model.userData.animate(elapsed);
      model.updateMatrixWorld(true);
      athletes.forEach(({ color, wrists }) => wrists().forEach(position => {
        assert.ok(position.y < .05, `${color} idle wrist stays below the waist in step ${step + 1}`);
      }));
    }
  }
  model.userData.setStep(3);
  const extremes = athletes.map(() => ({ min: Infinity, max: -Infinity }));
  for (let frame = 0; frame < 25; frame++) {
    model.userData.animate(frame * .1);
    model.updateMatrixWorld(true);
    athletes.forEach(({ color, arms, wrists }, index) => {
      const positions = wrists();
      positions.forEach((position, side) => {
        assert.ok(position.y < arms[side].position.y - .05, `${color} running wrist stays below its shoulder`);
      });
      const separation = positions[0].z - positions[1].z;
      extremes[index].min = Math.min(extremes[index].min, separation);
      extremes[index].max = Math.max(extremes[index].max, separation);
    });
  }
  extremes.forEach(({ min, max }, index) => {
    assert.ok(min < -.15 && max > .15, `${athletes[index].color} wrists alternate forward and backward`);
  });
});
