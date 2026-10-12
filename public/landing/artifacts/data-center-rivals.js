import { sculpture } from './sculpture.js';
import { createArtifact as createCampus } from './data-center-tycoon.js';

// The advanced edition: two operating facilities race for revenue.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, disk, line, finish } = sculpture(THREE);
  materials.gold = new THREE.MeshStandardMaterial({ color: 0xe7b64c, metalness: .65, roughness: .3 });
  const preserved = [], campuses = [], bars = [], packets = [];
  const keep = (name, x, y, z) => {
    const g = new THREE.Group(); g.name = name; g.position.set(x, y, z);
    root.add(g); preserved.push(g); return g;
  };
  box(8.15, .17, 4.65, 0, .085, 0, 'paper');
  box(.035, .015, 4.25, 0, .18, 0, 'shade');

  for (const [i, x, color] of [[0, -2.02, 'blue'], [1, 2.02, 'red']]) {
    const campus = createCampus(THREE);
    campus.name = i ? 'vermilion-data-center' : 'cobalt-data-center';
    campus.scale.setScalar(.49); campus.position.set(x, .20, -.25);
    // Match each facility's equipment to its team without changing the original.
    const tinted = new Set();
    campus.traverse(o => {
      if (o.material?.color?.getHex() === 0x133fac && !tinted.has(o.material)) {
        tinted.add(o.material); o.material.color.set(i ? 0xa92119 : 0x133fac);
      }
    });
    root.add(campus); preserved.push(campus); campuses.push(campus);

    // Cutaway architecture keeps the operating racks visible inside each building.
    box(3.38, 1.44, .12, x, .94, -1.86, 'ivory');
    for (const side of [-1, 1]) {
      box(.10, 1.44, 3.22, x + side * 1.65, .94, -.30, 'paper');
      box(.16, .10, 3.35, x + side * 1.65, 1.71, -.27, color);
      for (let j = 0; j < 6; j++) box(.025, .75, .045, x + side * 1.71, .90, -1.5 + j * .45, color);
    }
    box(3.45, .10, .19, x, 1.71, -1.84, color);
    // Tall front corner columns and a lintel read as a building, with an open front.
    for (const side of [-1, 1]) box(.13, 1.44, .13, x + side * 1.64, .94, 1.29, color);
    box(3.42, .13, .15, x, 1.69, 1.29, color);
    for (let j = 0; j < 7; j++) box(.27, .035, .035, x - 1.23 + j * .41, 1.46, -1.78, color);

    // Independent performance bars visibly trade the lead over a 24-second loop.
    const bar = keep(`${color}-performance`, x, .23, 1.84);
    box(2.75, .10, .22, 0, 0, 0, 'shade', bar);
    const fill = box(2.65, .12, .17, 0, .045, .015, color, bar);
    bars.push(fill);
    const route = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, .27, 1.60), new THREE.Vector3(x * .65, .27, 2.09), new THREE.Vector3(0, .27, 2.09)
    ]);
    line(route.points.map(p => p.toArray()), .017, color);
    const stream = keep(`${color}-market-orders`, 0, 0, 0);
    const dot = disk(.065, .06, 0, 0, 0, 'gold', stream);
    packets.push({ stream, dot, route });
  }

  // Shared prize between the buildings: business competition, not combat.
  const trophy = keep('competition-trophy', 0, .21, -.30);
  box(.49, .14, .49, 0, .07, 0, 'ink', trophy);
  disk(.18, .07, 0, .18, 0, 'gold', trophy);
  disk(.045, .35, 0, .36, 0, 'gold', trophy);
  const cup = mesh(new THREE.CylinderGeometry(.23, .09, .30, 24), 'gold', trophy); cup.position.y = .65;
  for (const side of [-1, 1]) {
    line([[side * .19, .76, 0], [side * .34, .75, 0], [side * .32, .53, 0], [side * .13, .50, 0]], .027, 'gold', trophy);
  }
  const model = finish(63, preserved);
  const offsets = packets.map(({ stream }) => stream.position.clone());
  model.userData.framingBounds = new THREE.Box3(new THREE.Vector3(-4.1, 0, -2.4), new THREE.Vector3(4.1, 2.25, 2.4));
  model.userData.animate = elapsed => {
    const t = Math.max(0, elapsed), wave = Math.sin(t * Math.PI / 12);
    // Both totals increase monotonically; the lead alternates at equal intervals.
    campuses[0].userData.animate(t + .8 * wave);
    campuses[1].userData.animate(t - .8 * wave);
    bars.forEach((bar, i) => {
      const progress = .64 + (i ? -1 : 1) * .23 * wave;
      bar.scale.x = progress; bar.position.x = -(1 - progress) * 1.325;
    });
    packets.forEach(({ dot, route }, i) => dot.position.copy(route.getPointAt((t * .27 + i * .5) % 1)));
    // Stream parents carry finish()'s centering offset; local paths stay stable.
    packets.forEach(({ stream }, i) => stream.position.copy(offsets[i]));
    trophy.rotation.y = Math.sin(t * .45) * .13;
  };
  model.userData.setTheme = theme => {
    campuses.forEach(c => c.userData.setTheme(theme));
    model.userData.studioLightScale = theme === 'dark' ? .72 : 1;
    materials.gold.emissive.setHex(theme === 'dark' ? 0x513208 : 0x000000);
  };
  model.userData.animate(0); model.userData.setTheme('light');
  return model;
}
