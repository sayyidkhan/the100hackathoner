import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../../public/landing/vendor/three.module.js';
import { boatOpacity, prepareBoatFade } from '../../public/landing/artifacts/two-rivers-boat-fade.js';

function fixture() {
  const hull = new T.MeshStandardMaterial({ color: 0x7f3022, roughness: .8 });
  const lamp = new T.MeshStandardMaterial({ color: 0xffd988, emissive: 0xffb640, emissiveIntensity: 2 });
  const staticMesh = new T.Mesh(new T.BoxGeometry(), hull);
  const makeBoat = () => {
    const boat = new T.Group(), cabin = new T.Group();
    cabin.add(new T.Mesh(new T.BoxGeometry(), hull));
    cabin.add(new T.Mesh(new T.BoxGeometry(), [hull, lamp]));
    boat.add(cabin);
    return boat;
  };
  const a = makeBoat(), b = makeBoat();
  const fadeA = prepareBoatFade(a), fadeB = prepareBoatFade(b);
  return { hull, lamp, staticMesh, a, b, fadeA, fadeB,
    aHull: a.children[0].children[0].material,
    bHull: b.children[0].children[0].material,
    aLamp: a.children[0].children[1].material[1] };
}

test('route entrances and exits ease smoothly through opacity with a hidden wrap interval', () => {
  assert.equal(boatOpacity(0), 0);
  assert.equal(boatOpacity(.075), 1);
  assert.equal(boatOpacity(.5), 1);
  assert.equal(boatOpacity(.86), 1);
  assert.equal(boatOpacity(.985), 0);
  assert.equal(boatOpacity(.99999), 0);
  assert.equal(boatOpacity(1), 0);
  let entrance = 0, exit = 1;
  for (let i = 0; i <= 100; i++) {
    const into = boatOpacity(i / 100 * .075);
    const out = boatOpacity(.86 + i / 100 * .125);
    assert.ok(into >= entrance && into <= 1);
    assert.ok(out <= exit && out >= 0);
    entrance = into; exit = out;
  }
  assert.ok(Math.abs(boatOpacity(.9225) - .5) < 1e-10);
  // Slow acceleration/deceleration prevents a sudden visual change at the ends.
  assert.ok(1 - boatOpacity(.861) < .001);
  assert.ok(boatOpacity(.984) < .001);
});

test('fading one boat isolates shared static surfaces and every other boat', () => {
  const f = fixture();
  f.fadeA.setOpacity(.25);
  assert.notEqual(f.aHull, f.hull);
  assert.notEqual(f.aHull, f.bHull);
  assert.equal(f.a.children[0].children[1].material[0], f.aHull,
    'parts of one boat may reuse the same isolated material');
  assert.equal(f.staticMesh.material, f.hull);
  assert.equal(f.hull.opacity, 1);
  assert.equal(f.hull.transparent, false);
  assert.equal(f.bHull.opacity, 1);
  assert.equal(f.aHull.opacity, .25);
  assert.equal(f.aLamp.opacity, .25);
});

test('exit becomes invisible before teleporting, then reappears gradually after wrap', () => {
  const { a, aHull, fadeA } = fixture();
  fadeA.setOpacity(boatOpacity(.99));
  assert.equal(a.visible, false);
  fadeA.setOpacity(boatOpacity(.01));
  assert.equal(a.visible, true);
  assert.ok(aHull.opacity > 0 && aHull.opacity < 1);
  assert.equal(aHull.depthWrite, false);
  a.traverse(part => { if (part.isMesh) assert.equal(part.castShadow, false); });
  fadeA.setOpacity(boatOpacity(.3));
  assert.equal(aHull.depthWrite, true);
  a.traverse(part => { if (part.isMesh) assert.equal(part.castShadow, true); });
});

test('theme changes preserve the fade and update isolated colors and lights', () => {
  const f = fixture();
  f.fadeA.setOpacity(.4);
  f.hull.color.setHex(0x223344);
  f.lamp.emissive.setHex(0x88aaff);
  f.lamp.emissiveIntensity = .15;
  f.fadeA.syncTheme();
  assert.equal(f.aHull.color.getHex(), 0x223344);
  assert.equal(f.aLamp.emissive.getHex(), 0x88aaff);
  assert.equal(f.aLamp.emissiveIntensity, .15);
  assert.equal(f.aHull.opacity, .4);
  assert.equal(f.aLamp.opacity, .4);
  assert.equal(f.aHull.depthWrite, false);
  assert.equal(f.a.visible, true);
  f.fadeA.setOpacity(0);
  f.fadeA.syncTheme();
  assert.equal(f.a.visible, false);
  assert.equal(f.aLamp.opacity, 0);
});

test('repeated animation times produce identical opacity and visibility', () => {
  const { a, aHull, fadeA } = fixture();
  const sample = phase => {
    fadeA.setOpacity(boatOpacity(phase));
    return [a.visible, aHull.opacity, aHull.depthWrite,
      a.children[0].children[0].castShadow];
  };
  const first = sample(.94);
  sample(.2); sample(.99);
  assert.deepEqual(sample(.94), first);
  assert.deepEqual(sample(.94), first);
});
