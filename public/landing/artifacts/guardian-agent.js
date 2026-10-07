import { sculpture } from './sculpture.js';

// Guardian is an absent colleague's decision proxy, represented by a working office.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  materials.brass = new THREE.MeshStandardMaterial({ color: 0xbb9154, metalness: .65, roughness: .3 });
  materials.leaf = new THREE.MeshStandardMaterial({ color: 0x687855, roughness: .9 });
  materials.proxy = new THREE.MeshPhysicalMaterial({ color: 0x2869dd, emissive: 0x1356d9, emissiveIntensity: .2, metalness: .15, roughness: .25, clearcoat: 1 });
  materials.signal = new THREE.MeshStandardMaterial({ color: 0xbfeaff, emissive: 0x64c8ff, emissiveIntensity: .7 });
  materials.bulb = new THREE.MeshStandardMaterial({ color: 0xffe5b6, emissive: 0xffbf62, emissiveIntensity: .2 });
  const preserved = [], lights = [];
  const keep = (name, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); root.add(g); preserved.push(g); return g;
  };
  const group = (x, y, z, parent = root) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  function round(w, h, d, x, y, z, color = 'ivory', parent = root, radius = .06) {
    const r = Math.min(radius, w / 3, h / 3, d / 3);
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - r, bevelEnabled: true, bevelSize: r / 2, bevelThickness: r / 2, bevelSegments: 2, curveSegments: 5 });
    g.translate(0, 0, -(d - r) / 2);
    const m = mesh(g, color, parent); m.position.set(x, y, z); return m;
  }
  function ring(r, t, x, y, z, color = 'brass', parent = root) {
    const m = mesh(new THREE.TorusGeometry(r, t, 8, 40), color, parent); m.position.set(x, y, z); return m;
  }
  function limb(a, b, radius, color, parent) {
    const p = new THREE.Vector3(...a), q = new THREE.Vector3(...b), delta = q.clone().sub(p);
    const m = mesh(new THREE.CylinderGeometry(radius * .86, radius, delta.length(), 12), color, parent);
    m.position.copy(p.add(q).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    ball(radius, ...b, color, parent); return m;
  }
  function chair(x, z, angle = 0, color = 'blue', parent = root) {
    const g = group(x, .25, z, parent); g.rotation.y = angle;
    disk(.045, .44, 0, .33, 0, 'ink', g);
    for (let j = 0; j < 5; j++) {
      const a = j * Math.PI * 2 / 5, dx = Math.cos(a) * .4, dz = Math.sin(a) * .4;
      limb([0, .15, 0], [dx, .12, dz], .024, 'brass', g);
      const wheel = disk(.065, .065, dx, .08, dz, 'ink', g); wheel.rotation.z = Math.PI / 2;
    }
    round(.67, .12, .66, 0, .57, 0, color, g);
    round(.64, .86, .14, 0, 1.0, -.3, color, g);
    for (let j = 0; j < 4; j++) box(.51, .011, .012, 0, .75 + j * .16, -.222, 'shade', g);
    for (const side of [-1, 1]) {
      line([[side * .36, .59, -.27], [side * .38, .87, -.16], [side * .38, .87, .22], [side * .34, .60, .25]], .022, 'brass', g);
      round(.09, .045, .35, side * .38, .89, .03, 'ink', g);
    }
    return g;
  }
  function seated(x, z, color, angle = 0) {
    const g = keep(`${color}-colleague`, x, .25, z); g.rotation.y = angle;
    const torso = ball(.28, 0, 1.10, 0, color, g); torso.scale.set(1, 1.45, .65);
    disk(.09, .12, 0, 1.47, 0, color, g);
    const head = group(0, 1.69, -.01, g); const face = ball(.22, 0, 0, 0, color, head); face.scale.set(.87, 1.12, .88);
    ball(.045, 0, -.035, .185, color, head);
    for (const side of [-1, 1]) {
      ball(.055, side * .182, -.02, 0, color, head);
      limb([side * .15, .82, 0], [side * .18, .74, .40], .1, color, g);
      limb([side * .18, .74, .40], [side * .19, .22, .43], .075, color, g);
      round(.17, .10, .30, side * .19, .13, .5, color, g);
    }
    const arm = group(-.24, 1.28, 0, g);
    limb([0, 0, 0], [-.16, -.28, .22], .071, color, arm);
    limb([-.16, -.28, .22], [-.12, -.06, .43], .062, color, arm);
    ball(.077, -.12, -.05, .44, color, arm);
    limb([.25, 1.29, 0], [.39, 1.05, .2], .076, color, g);
    limb([.39, 1.05, .2], [.23, 1.03, .48], .067, color, g);
    return { g, head, arm };
  }
  function plant(x, z, scale = 1) {
    const p = group(x, .25, z); p.scale.setScalar(scale);
    const pot = mesh(new THREE.CylinderGeometry(.19, .14, .34, 24), 'paper', p); pot.position.y = .17;
    disk(.17, .02, 0, .34, 0, 'wood', p);
    for (let j = 0; j < 8; j++) {
      const a = j * 2.4, y = .53 + j * .055;
      line([[0, .32, 0], [Math.cos(a) * .1, y, Math.sin(a) * .1]], .012, 'leaf', p);
      const leaf = ball(.13, Math.cos(a) * .18, y, Math.sin(a) * .18, 'leaf', p);
      leaf.scale.set(.5, 1.7, .35); leaf.rotation.z = Math.cos(a) * .8; leaf.rotation.x = Math.sin(a) * .8;
    }
  }
  function paper(x, y, z, parent = root) {
    round(.38, .022, .48, x, y, z, 'ivory', parent, .015);
    for (let j = 0; j < 3; j++) round(.25 - j * .035, .006, .013, x, y + .016, z - .13 + j * .075, 'shade', parent, .004);
  }
  function portrait(x, y, z, parent = root, color = 'blue') {
    round(.32, .43, .045, x, y, z, 'ivory', parent);
    const body = ball(.10, x, y - .09, z + .035, color, parent); body.scale.set(1, .8, .24);
    const head = ball(.063, x, y + .06, z + .035, 'wood', parent); head.scale.z = .28;
  }
  function practical(x, y, z, power, color = 0xffc77d) {
    const g = keep('practical-light', x, y, z); const l = new THREE.PointLight(color, 0, 3.5, 2); g.add(l); lights.push({ l, power });
  }

  // A real workspace: wall fluting, floorboards, cabinetry and an empty seat.
  round(6.6, .22, 4.8, 0, .11, 0, 'paper', root, .15);
  for (let j = 0; j < 14; j++) box(6.15, .016, .012, 0, .229, -2.15 + j * .33, 'shade');
  round(6.25, 2.20, .13, 0, 1.35, -2.23, 'paper');
  for (let j = 0; j < 55; j++) disk(.042, 2.16, -3.04 + j * .113, 1.35, -2.14, j % 3 ? 'ivory' : 'paper');
  round(1.55, .08, .72, -2.20, 1.16, -1.66);
  for (const x of [-2.86, -1.54]) round(.10, .88, .58, x, .68, -1.66, 'wood');
  round(.65, .042, .44, -2.24, 1.23, -1.70, 'shade');box(.05, .009, .045, -2.24, 1.256, -1.70);
  chair(-2.35, -.86, -.14);
  // Small physical AWAY sign, drawn with strokes so no font or texture dependency.
  const away = group(-1.70, 1.37, -1.28); round(.50, .20, .045, 0, 0, 0, 'ivory', away);
  const glyphs = [ [[0,0],[.04,.12],[.08,0],null,[.02,.05],[.06,.05]], [[0,.12],[.02,0],[.04,.07],[.06,0],[.08,.12]], [[0,0],[.04,.12],[.08,0],null,[.02,.05],[.06,.05]], [[0,.12],[.04,.06],[.08,.12],null,[.04,.06],[.04,0]] ];
  glyphs.forEach((points, i) => { let run = []; for (const p of [...points, null]) { if (p) run.push([-.20 + i * .105 + p[0], p[1] - .06, .03]); else { if (run.length > 1) line(run, .008, 'ink', away); run = []; } } });
  plant(-1.23, -1.92, 1.25); plant(2.90, -1.81, .82);
  round(1.25, .73, .54, 2.04, .72, -1.85, 'wood');
  for (const x of [1.5, 2.58]) for (const z of [-2.04, -1.65]) disk(.022, .17, x, .33, z, 'brass');
  for (let j = 0; j < 10; j++) box(.012, .56, .01, 1.52 + j * .115, .72, -1.568, 'shade');
  for (let j = 0; j < 4; j++) round(.075, .22 + j % 2 * .04, .17, 1.71 + j * .087, 1.22, -1.82, j % 2 ? 'paper' : 'ivory');
  const clock = disk(.35, .05, 2.05, 1.96, -2.08); clock.rotation.x = Math.PI / 2; ring(.35, .018, 2.05, 1.96, -2.04);
  for (let j = 0; j < 12; j++) { const a = j * Math.PI / 6; const tick = box(.014, .043, .016, 2.05 + Math.sin(a) * .29, 1.96 + Math.cos(a) * .29, -2.039, 'brass'); tick.rotation.z = -a; }
  line([[1.88, 2.1, -2.025], [2.05, 1.96, -2.025], [2.23, 2.07, -2.025]], .014, 'brass');

  // Rounded fluted decision desk and a blue, human-shaped stand-in.
  const deskX = .16, deskZ = -.55;
  const desk = disk(1, .09, deskX, 1.28, deskZ); desk.scale.set(1.46, 1, .76);
  const base = disk(1, .89, deskX, .80, deskZ, 'wood'); base.scale.set(1.34, 1, .66);
  for (let j = 0; j < 60; j++) { const a = j * Math.PI * 2 / 60; disk(.024, .88, deskX + Math.sin(a) * 1.33, .8, deskZ + Math.cos(a) * .66, 'paper'); }
  chair(.12, -1.3);
  const proxy = seated(.12, -1.3, 'proxy');
  const shield = new THREE.Shape(); shield.moveTo(0, .12); shield.lineTo(.11, .065); shield.lineTo(.09, -.07); shield.quadraticCurveTo(.055, -.13, 0, -.17); shield.quadraticCurveTo(-.055, -.13, -.09, -.07); shield.lineTo(-.11, .065); shield.closePath();
  const badge = mesh(new THREE.ExtrudeGeometry(shield, { depth: .016, bevelEnabled: false }), 'signal', proxy.g); badge.position.set(0, 1.19, .18);
  for (const x of [-.21, .10]) {
    const page = round(.31, .03, .37, x, 1.36, -.72); page.rotation.z = x < 0 ? -.06 : .06;
    for (let j = 0; j < 5; j++) box(.22, .008, .014, x, 1.385, -.85 + j * .06, 'shade');
  }
  for (let j = 0; j < 3; j++) portrait(-.55 + j * .46, 1.54, -.03, root, j === 1 ? 'red' : 'blue');
  round(.46, .022, .19, .86, 1.344, -.38, 'ink');
  for (let a = 0; a < 8; a++) for (let b = 0; b < 3; b++) box(.031, .006, .025, .69 + a * .046, 1.36, -.44 + b * .043, 'shade');
  disk(.16, .04, .98, 1.34, -.94, 'brass');disk(.025, .20, .98, 1.45, -.94, 'brass');
  round(.65, .44, .065, .98, 1.70, -.94, 'brass'); round(.59, .38, .018, .98, 1.70, -.897, 'ink');
  const bars = [];
  const screen = keep('voice-waveform', .98, 1.70, -.879);
  for (let j = 0; j < 17; j++) bars.push(round(.017, .20, .01, -.24 + j * .03, 0, 0, 'signal', screen, .004));
  disk(.13, .035, -.94, 1.35, -.81, 'brass');
  line([[-.94, 1.36, -.81], [-.94, 1.78, -.81], [-.72, 1.98, -.79], [-.48, 1.97, -.77]], .024, 'brass');
  const shade = mesh(new THREE.SphereGeometry(.17, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), 'brass'); shade.position.set(-.48, 1.95, -.77);
  disk(.15, .013, -.48, 1.952, -.77, 'bulb'); practical(-.48, 1.87, -.69, 2.8);
  practical(.15, 1.7, -1.10, .7, 0x669dff);
  for (const x of [-2.7, -.7, 1.2, 2.7]) practical(x, .68, -1.92, 1.1);

  // A teammate consulting by voice. The empty chair stays visibly unoccupied.
  chair(-2.04, 1.21, 2.55, 'paper');
  // Face the decision desk, with a round conversation table between them.
  const teammate = seated(-2.04, 1.21, 'ivory', 2.55);
  disk(.60, .065, -1.37, 1.05, .60, 'wood');
  for (let j = 0; j < 3; j++) { const a = j * Math.PI * 2 / 3; disk(.032, .79, -1.37 + Math.cos(a) * .43, .63, .60 + Math.sin(a) * .43, 'brass'); }
  paper(-1.50, 1.10, .71);
  disk(.10, .033, -1.07, 1.10, .53, 'red');line([[-1.07, 1.10, .53], [-1.07, 1.30, .53], [-1.20, 1.38, .53]], .02, 'brass');
  const microphone = ball(.085, -1.21, 1.40, .53, 'red'); microphone.scale.set(1.4, 1, 1);
  for (let j = 0; j < 3; j++) ring(.052, .006, -1.22 + j * .023, 1.4, .582, 'shade').rotation.y = Math.PI / 2;
  disk(.09, .015, -1.05, 1.103, .82);disk(.06, .12, -1.05, 1.17, .82);disk(.05, .008, -1.05, 1.233, .82, 'wood');ring(.037, .010, -.978, 1.18, .82, 'ivory');
  const bubble = keep('consultation-bubble', -1.61, 1.93, .51);
  round(.57, .31, .07, 0, 0, 0, 'blue', bubble);
  const tail = mesh(new THREE.ConeGeometry(.075, .16, 3), 'blue', bubble); tail.rotation.z = Math.PI; tail.position.set(-.17, -.17, 0);
  const dots = [-.15, 0, .15].map(x => ball(.031, x, 0, .049, 'ivory', bubble));

  // Three legible outcomes, physically connected to the same decision desk.
  const medallions = [], routes = [];
  const outcomes = ['blue', 'red', 'brass'];
  for (let i = 0; i < 3; i++) {
    const x = .12 + i * 1.0, z = 1.42;
    round(.83, .075, .91, x, .30, z, 'paper');
    for (const side of [-1, 1]) round(.065, .19, .91, x + side * .39, .4, z);
    for (const side of [-1, 1]) round(.77, .19, .065, x, .4, z + side * .43);
    paper(x, .365, z + .07);paper(x + .03, .397, z + .04);
    const badgeGroup = keep(`decision-${i}`, x, .71, z - .27);
    const disc = disk(.24, .065, 0, 0, 0, outcomes[i], badgeGroup); disc.rotation.x = Math.PI / 2;ring(.213, .008, 0, 0, .04, 'wood', badgeGroup);
    if (i === 0) line([[-.12, .015, .05], [-.035, -.08, .05], [.13, .09, .05]], .026, 'ivory', badgeGroup);
    if (i === 1) for (const sign of [-1, 1]) line([[-.095, sign * .095, .05], [.095, -sign * .095, .05]], .026, 'ivory', badgeGroup);
    if (i === 2) { line([[0, -.12, .05], [0, .11, .05]], .03, 'ivory', badgeGroup);line([[-.10, .015, .05], [0, .12, .05], [.10, .015, .05]], .03, 'ivory', badgeGroup); }
    medallions.push(badgeGroup);
    const points = [[.65 + i * .19, 1.24, -.23], [.91 + i * .39, 1.05, .23], [x, .50, .70], [x, .47, 1.13]];
    line(points, .028, 'brass');routes.push(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))));
  }
  round(.49, .86, .085, 2.30, .90, .76, 'brass');round(.43, .78, .018, 2.30, .90, .813, 'blue');
  portrait(2.3, .94, .83, root, 'ivory');box(.12, .012, .01, 2.3, .558, .836, 'signal');
  const ringSignal = keep('human-handoff-ring', 2.30, .96, .859);ring(.30, .013, 0, 0, 0, 'signal', ringSignal);
  // A small trail links the voice request to the proxy, then to one outcome at a time.
  const inputPoints = [[-1.18, 1.48, .51], [-.70, 1.66, .38], [-.22, 1.70, -.05], [.1, 1.52, -.57]];
  const inputCurve = new THREE.CatmullRomCurve3(inputPoints.map(p => new THREE.Vector3(...p)));
  const request = keep('travelling-request'); round(.20, .025, .25, 0, 0, 0, 'signal', request);
  const resultCard = keep('routed-decision'); paper(0, 0, 0, resultCard); resultCard.scale.setScalar(.60);
  const result = finish(60, preserved);
  // finish() recentres direct children; preserve that offset when following world paths.
  const offset = request.position.clone(), bubbleY = bubble.position.y;
  let night = false;
  result.userData.setTheme = theme => {
    night = theme === 'dark';
    lights.forEach(({ l, power }) => { l.intensity = night ? power : 0; });
    materials.proxy.emissiveIntensity = night ? .48 : .12;
    materials.signal.emissiveIntensity = night ? 1.25 : .5;
    materials.bulb.emissiveIntensity = night ? 1.5 : .15;
    result.userData.studioLightScale = night ? .38 : 1;
  };
  result.userData.animate = elapsed => {
    const cycle = elapsed % 18, active = Math.floor(cycle / 6), phase = cycle % 6;
    request.visible = phase < 2.1;
    request.position.copy(inputCurve.getPoint(Math.min(phase / 2.1, 1))).add(offset);
    request.rotation.y = elapsed * 1.2;
    resultCard.visible = phase >= 2.8 && phase < 5.25;
    resultCard.position.copy(routes[active].getPoint(THREE.MathUtils.clamp((phase - 2.8) / 2.0, 0, 1))).add(offset);
    const landed = phase > 4.5 ? Math.sin((phase - 4.5) / 1.5 * Math.PI) : 0;
    medallions.forEach((g, i) => g.scale.setScalar(1 + (i === active ? landed * .18 : 0)));
    bars.forEach((bar, i) => { bar.scale.y = .15 + Math.abs(Math.sin(elapsed * 4 + i * .73)) * (.32 + .68 * Math.sin((i + 1) / 18 * Math.PI)); });
    dots.forEach((dot, i) => dot.scale.setScalar(.72 + .28 * Math.sin(elapsed * 3.5 - i * .8)));
    bubble.position.y = bubbleY + Math.sin(elapsed * 1.6) * .035;
    proxy.head.rotation.y = Math.sin(elapsed * .65) * .13;
    proxy.arm.rotation.x = -.12 + Math.sin(elapsed * 1.5) * .10;
    teammate.head.rotation.x = Math.sin(elapsed * 1.3) * .055;
    teammate.arm.rotation.z = Math.sin(elapsed * 1.4) * .14;
    ringSignal.visible = active === 2 && phase > 4.25;
    ringSignal.scale.setScalar(1 + landed * .35);
  };
  result.userData.setTheme('light'); result.userData.animate(0);
  return result;
}
