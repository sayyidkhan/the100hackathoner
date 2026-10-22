import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import { riverAtmosphere } from '../../public/landing/artifacts/two-rivers-atmosphere.js';

// Exercise real Three.js resources without needing a WebGL renderer. Retain
// generated pixels so tests can distinguish soft weather from an empty texture.
const previousDocument = globalThis.document;
globalThis.document = {
  createElement(name) {
    assert.equal(name, 'canvas');
    const canvas = {};
    canvas.getContext = () => ({
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: image => { canvas.pixels = image.data; },
      createRadialGradient: () => ({ addColorStop() {} }),
      fillRect() {},
    });
    return canvas;
  },
};
after(() => { globalThis.document = previousDocument; });

const root = new T.Group();
const atmosphere = riverAtmosphere(T, root, { bankDistance: () => -.2 });
const weather = root.getObjectByName('Two Rivers clouds and river mist');
const clouds = weather.children.filter(s => s.name === 'Drifting canopy cloud');
const mist = weather.children.filter(s => s.name === 'Low river mist');
const snapshot = () => weather.children.map(s => [...s.position.toArray(), ...s.scale.toArray()]);

test('large cloud banks and low river mist remain visible in both themes', () => {
  assert.ok(clouds.length >= 4);
  assert.ok(mist.length >= 4);
  for (const theme of ['light', 'dark']) {
    atmosphere.setTheme(theme);
    for (const s of weather.children) {
      assert.ok(s.visible && weather.visible);
      assert.ok(s.material.opacity >= .4, `${theme}: weather opacity too faint`);
      assert.equal(s.material.blending, T.NormalBlending);
      assert.equal(s.material.depthTest, true);
      assert.equal(s.material.depthWrite, false);
      assert.ok(s.scale.x >= 1.5);
    }
  }
  assert.ok(clouds.every(s => s.position.y > 2));
  assert.ok(mist.every(s => s.position.y < 1.3));
});

test('cloud and mist textures contain visible soft density with transparent borders', () => {
  for (const map of new Set(weather.children.map(s => s.material.map))) {
    const pixels = map.image.pixels;
    let dense = 0, soft = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 100) dense++;
      if (pixels[i] > 0 && pixels[i] < 100) soft++;
    }
    assert.ok(dense > 1000, 'weather must have substantial visible density');
    assert.ok(soft > 1000, 'weather must have soft edges');
    for (let x = 0; x < map.image.width; x++) {
      assert.equal(pixels[x * 4 + 3], 0);
      assert.equal(pixels[((map.image.height - 1) * map.image.width + x) * 4 + 3], 0);
    }
  }
});

test('weather changes palettes without replacing resources and motion is seek-safe', () => {
  const materials = weather.children.map(s => s.material);
  atmosphere.setTheme('light');
  const dayColors = materials.map(m => m.color.getHex());
  atmosphere.setTheme('dark');
  assert.ok(materials.every((m, i) => m === weather.children[i].material && m.color.getHex() !== dayColors[i]));
  atmosphere.animate(12);
  const first = snapshot();
  atmosphere.animate(240);
  assert.notDeepEqual(snapshot(), first, 'weather should drift over time');
  atmosphere.animate(12);
  assert.deepEqual(snapshot(), first, 'pause/reduced motion must not accumulate drift');
  atmosphere.animate(12);
  assert.deepEqual(snapshot(), first);
});
