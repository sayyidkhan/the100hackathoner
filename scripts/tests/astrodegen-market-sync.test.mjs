import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import { createArtifact } from '../../public/landing/artifacts/astrodegen.js';

// Check synchronization, usable proportions and the actual signal text. Canvas
// pixels and the final camera composition are still checked in the browser.
function canvasStub() {
  const canvas = { width: 0, height: 0, drawnText: [] };
  const gradient = () => ({ addColorStop() {} });
  const context = {
    canvas,
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    createLinearGradient: gradient,
    createRadialGradient: gradient,
    measureText: text => ({ width: String(text).length * 8 }),
  };
  for (const name of ['putImageData', 'fillRect', 'clearRect', 'strokeRect',
    'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'arcTo', 'ellipse',
    'rect', 'roundRect', 'bezierCurveTo', 'quadraticCurveTo', 'fill', 'stroke',
    'fillText', 'strokeText', 'save', 'restore', 'translate', 'rotate', 'scale',
    'setTransform', 'resetTransform', 'setLineDash', 'clip', 'drawImage']) {
    context[name] = () => {};
  }
  context.fillRect = context.clearRect = (x, y, width, height) => {
    if (x === 0 && y === 0 && width === canvas.width && height === canvas.height) canvas.drawnText = [];
  };
  context.fillText = (text, x, y) => canvas.drawnText.push({ text: String(text), font: context.font, x, y });
  canvas.getContext = () => context;
  return canvas;
}
globalThis.document = { createElement: canvasStub };

const root = createArtifact(T, { bake: true });
const display = root.getObjectByName('lunar-market-display');
assert(display, 'The market display is part of the observatory');
const terminal = root.getObjectByName('lunar-market-terminal');
const screen = display.getObjectByName('lunar-market-instrument-screen');
assert(terminal && screen, 'The market has a full terminal and a rendered instrument face');
const moons = [];
root.traverse(object => {
  if (object.geometry?.attributes.lunarDirection) moons.push(object);
});
assert.equal(moons.length, 1, 'Market animation must preserve the single traveling moon');
const moon = moons[0];

root.updateMatrixWorld(true);
const screenCorners = Array.from({ length: screen.geometry.attributes.position.count }, (_, i) =>
  screen.localToWorld(new T.Vector3().fromBufferAttribute(screen.geometry.attributes.position, i)));
const screenBounds = new T.Box3().setFromPoints(screenCorners);
// The desktop height is the physical support surface, independent of terminal
// scale. This catches enlarging the whole monitor into the table again.
const desktopY = terminal.parent.position.y + .67 + .095 / 2;
assert(screenBounds.min.y > desktopY + .02, 'The visible screen clears its tabletop');
moon.geometry.computeBoundingBox();
const moonDiameter = moon.geometry.boundingBox.getSize(new T.Vector3()).x;
assert(screenBounds.getSize(new T.Vector3()).x >= moonDiameter * 2,
  'The market face remains large enough to read alongside the moon');

// Check the framing envelope in many directions, not just its axis-aligned
// box: a screen can fit an AABB yet still escape the camera's tighter bounds.
const framing = root.userData.framingPoints;
assert(framing?.length, 'The complete composition supplies framing points');
for (let i = 0; i < 192; i++) {
  const y = 1 - 2 * (i + .5) / 192, angle = i * 2.399963229728653;
  const radius = Math.sqrt(1 - y * y);
  const direction = new T.Vector3(radius * Math.cos(angle), y, radius * Math.sin(angle));
  const extent = Math.max(...framing.map(point => point.dot(direction)));
  for (const corner of screenCorners) assert(corner.dot(direction) <= extent + 1e-6,
    'The complete instrument face is included in the camera framing envelope');
}

function frame(time) {
  root.userData.animate(time);
  root.updateMatrixWorld(true);
  const state = display.userData.state;
  assert(state, 'Market display exposes its current synchronized state');
  root.traverse(object => {
    assert([...object.position, ...object.quaternion, ...object.scale].every(Number.isFinite),
      `Finite animation transforms for ${object.name || object.type}`);
  });
  return {
    state: structuredClone(state),
    moonPosition: moon.position.toArray(),
    sunlight: moon.userData.sunlight.value.toArray(),
  };
}

let previousCandles = -Infinity;
const prices = new Set(), signals = new Set(), candleCounts = new Set();
for (let t = 0; t <= 22; t += .25) {
  const { state } = frame(t);
  const progress = (moon.position.x + 2.05) / 4.10;
  assert(Math.abs(state.progress - progress) < 1e-9,
    'Market timeline follows the moon position, including easing');
  assert(Number.isFinite(state.price) && state.price > 0, 'Market price is finite and positive');
  assert(Number.isInteger(state.visibleCandles) && state.visibleCandles >= 0,
    'Visible candle count is a nonnegative integer');
  assert(state.visibleCandles >= previousCandles,
    'Candles build chronologically during the left-to-right pass');
  assert(Number.isFinite(state.illumination), 'Illumination remains finite');
  const expectedIllumination = (1 - Math.cos(progress * Math.PI * 2)) / 2;
  assert(Math.abs(state.illumination - expectedIllumination) < 1e-9,
    'Market phase and moon illumination share the same lunar cycle');
  assert(state.phase !== undefined && state.phase !== '', 'The market identifies its lunar phase');
  assert(typeof state.signal === 'string' && state.signal.length > 0,
    'The market reports its current trading cue');
  const canvas = screen.material.map.image;
  const cue = canvas.drawnText.find(label => label.text === (state.signal === 'observe' ? 'WATCH' : state.signal.toUpperCase()));
  const heading = canvas.drawnText.find(label => label.text === 'LUNAR / MARKET');
  assert(cue && heading, 'The current market signal is actually rendered on the screen');
  const fontSize = label => Number(label.font.match(/([\d.]+)px/)?.[1]);
  assert(fontSize(cue) > fontSize(heading) * 1.5,
    'The current trading cue has greater visual emphasis than the instrument heading');
  previousCandles = state.visibleCandles;
  candleCounts.add(state.visibleCandles);
  prices.add(state.price);
  signals.add(state.signal);
}
assert(candleCounts.size > 2, 'The chart reveals new candles over time');
assert(prices.size > 10, 'The market price changes throughout the lunar journey');
assert(signals.size > 1, 'The trading cue responds to different parts of the cycle');

// The disk's light direction is a useful independent check of the chart's
// illumination: at a new moon z=-1, at a full moon z=+1.
for (const t of [0, 5.5, 11, 16.5, 22]) {
  const { state, sunlight } = frame(t);
  assert(Math.abs(state.illumination - (1 + sunlight[2]) / 2) < 1e-9,
    'Visible lunar phase and display phase agree');
}
const sampled = frame(7.5);
frame(19);
assert.deepEqual(frame(7.5), sampled, 'Seeking restores the same market and moon state');
assert.deepEqual(frame(24), frame(0), 'Moon and market restart together on the 24-second loop');
assert.deepEqual(frame(NaN), frame(0), 'Invalid time recovers to the synchronized initial state');
for (let t = 22; t <= 24; t += .1) frame(t);

console.log('PASS: readable framed terminal, tabletop clearance, visible signal labels, single moon, synchronized chart progress and illumination, progressive candles, changing prices/signals, deterministic loop and seeking, finite transforms');
