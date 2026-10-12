import { sculpture } from './sculpture.js';
import { createBuzoAtmosphere } from './buzo-atmosphere.js';
import { setBuzoFraming } from './buzo-fit.js';

// A pocket concierge connects a personal shortlist to three possible nights out.
// Venues and screen copy are conceptual, rather than live listings or prices.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  materials.graphite = new THREE.MeshPhysicalMaterial({ color: 0x20242b, roughness: .32, metalness: .3, clearcoat: .5 });
  materials.charcoal = new THREE.MeshStandardMaterial({ color: 0x0d151f, roughness: .52, metalness: .2 });
  materials.coral = new THREE.MeshPhysicalMaterial({ color: 0xec6e58, roughness: .25, metalness: .18, clearcoat: .85 });
  materials.ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf0e9da, roughness: .28, metalness: .02, clearcoat: .6 });
  materials.brass = new THREE.MeshStandardMaterial({ color: 0xcfac72, roughness: .29, metalness: .75 });
  materials.slate = new THREE.MeshStandardMaterial({ color: 0x536577, roughness: .48, metalness: .4 });
  materials.screen = new THREE.MeshPhysicalMaterial({ color: 0x101821, roughness: .17, metalness: .12, clearcoat: 1 });
  materials.card = new THREE.MeshStandardMaterial({ color: 0x24333f, roughness: .48, metalness: .15 });
  materials.purple = new THREE.MeshPhysicalMaterial({ color: 0x896ac5, roughness: .35, metalness: .15, clearcoat: .5 });
  materials.leaf = new THREE.MeshStandardMaterial({ color: 0x496757, roughness: .8 });
  materials.warm = new THREE.MeshStandardMaterial({ color: 0xffd8a0, emissive: 0xffaa57, emissiveIntensity: 1, roughness: .25 });
  materials.signal = new THREE.MeshStandardMaterial({ color: 0xa2e9e5, emissive: 0x5cd9d9, emissiveIntensity: 1.3, roughness: .3 });
  materials.coralLight = new THREE.MeshStandardMaterial({ color: 0xffac83, emissive: 0xff754c, emissiveIntensity: 1.1, roughness: .3 });
  materials.violetLight = new THREE.MeshStandardMaterial({ color: 0xd8b6ff, emissive: 0x9d68f5, emissiveIntensity: 1.2, roughness: .3 });
  const preserved = [];
  function group(name, x = 0, y = 0, z = 0, keep = false, parent = root) {
    const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g);
    if (keep) preserved.push(g);
    return g;
  }
  function rounded(w, h, d, x, y, z, color, parent = root, radius = .08) {
    const r = Math.min(radius, w * .48, h * .48), bevel = Math.min(.022, d * .22);
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2); shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: d - bevel * 2, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, steps: 1, curveSegments: 7 });
    geometry.translate(0, 0, -d / 2 + bevel);
    const m = mesh(geometry, color, parent); m.position.set(x, y, z); return m;
  }
  function ring(radius, tube, x, y, z, color, parent = root, arc = Math.PI * 2) {
    const m = mesh(new THREE.TorusGeometry(radius, tube, 8, 64, arc), color, parent); m.position.set(x, y, z); return m;
  }
  function label(text, width, x, y, z, parent, color = '#f2e8d7', size = 48, weight = 600) {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 112;
    const ctx = canvas.getContext('2d'); ctx.font = `${weight} ${size}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color; ctx.fillText(text, 384, 56);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .05, depthWrite: false, toneMapped: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width * 112 / 768), mat); m.position.set(x, y, z); parent.add(m); return m;
  }
  function flatRing(radius, tube, x, y, z, color, parent = root) {
    const m = ring(radius, tube, x, y, z, color, parent); m.rotation.x = Math.PI / 2; return m;
  }
  function plant(x, y, z, scale = 1, parent = root) {
    const pot = mesh(new THREE.CylinderGeometry(.10, .07, .14, 16), 'ceramic', parent); pot.position.set(x, y + .07, z); pot.scale.setScalar(scale);
    for (let i = 0; i < 4; i++) {
      const a = i * 2.4, leaf = ball(.065 * scale, x + Math.cos(a) * .035 * scale, y + (.21 + i % 2 * .035) * scale, z + Math.sin(a) * .035 * scale, 'leaf', parent);
      leaf.scale.set(.55, 2.1, .7); leaf.rotation.z = Math.cos(a) * .5;
    }
  }
  function pin(x, y, z, color, parent = root) {
    const shape = new THREE.Shape(); shape.moveTo(0, 0);
    shape.bezierCurveTo(-.07, .09, -.17, .21, -.13, .31); shape.bezierCurveTo(-.07, .45, .07, .45, .13, .31); shape.bezierCurveTo(.17, .21, .07, .09, 0, 0);
    const hole = new THREE.Path(); hole.absarc(0, .28, .05, 0, Math.PI * 2, true); shape.holes.push(hole);
    const m = mesh(new THREE.ExtrudeGeometry(shape, { depth: .035, bevelEnabled: true, bevelSize: .008, bevelThickness: .008, bevelSegments: 2 }), color, parent); m.position.set(x, y, z); return m;
  }
  function person(x, y, z, scale = 1, color = 'ceramic', parent = root) {
    const g = group('night-out-guest', x, y, z, false, parent); g.scale.setScalar(scale);
    const body = mesh(new THREE.CylinderGeometry(.06, .10, .23, 14), color, g); body.position.y = .15;
    ball(.085, 0, .36, 0, color, g);
    for (const side of [-1, 1]) {
      const arm = ball(.035, side * .1, .19, 0, color, g); arm.scale.y = 2;
      const foot = ball(.04, side * .045, .025, .02, 'charcoal', g); foot.scale.z = 1.3;
    }
    return g;
  }

  // A low, oval instrument-like display: dark enamel, brass reveal, lit edge.
  const lower = disk(2.92, .16, 0, .08, 0, 'graphite'); lower.scale.z = .70;
  const seam = disk(2.88, .025, 0, .171, 0, 'brass'); seam.scale.z = .70;
  const top = disk(2.84, .08, 0, .22, 0, 'charcoal'); top.scale.z = .70;
  const perimeter = flatRing(2.80, .013, 0, .264, 0, 'coralLight'); perimeter.scale.y = .70;
  for (let i = 0; i < 52; i++) {
    const a = i * Math.PI * 2 / 52;
    const tick = box(.010, .008, i % 4 === 0 ? .065 : .033, Math.sin(a) * 2.69, .265, Math.cos(a) * 1.875, 'brass'); tick.rotation.y = a;
  }

  // The phone is the hero: physical layers, a quiet UI and three credible choices.
  const phone = group('buzo-pocket-concierge', -.64, 2.01, -.74, true); phone.rotation.y = -.07; phone.rotation.x = -.035;
  rounded(1.72, 3.25, .24, 0, 0, 0, 'coral', phone, .24);
  rounded(1.61, 3.13, .12, 0, 0, .148, 'graphite', phone, .21);
  rounded(1.45, 2.91, .048, 0, -.012, .218, 'screen', phone, .16);
  rounded(.42, .065, .020, 0, 1.37, .25, 'charcoal', phone, .03);
  ball(.016, .14, 1.37, .268, 'slate', phone);
  rounded(.032, .34, .095, -.879, .52, -.015, 'brass', phone, .015);
  rounded(.032, .18, .095, .879, .69, -.015, 'brass', phone, .015);
  label('buzo', .82, -.21, 1.10, .255, phone, '#ffae93', 100, 700);
  label('YOUR AI NIGHTLIFE CONCIERGE', 1.25, 0, .89, .255, phone, '#9daeb6', 32, 500);
  label('TONIGHT?', 1.3, 0, .62, .256, phone, '#fff2df', 87, 700);
  rounded(1.22, .27, .026, 0, .29, .253, 'card', phone, .065);
  label('Pick your vibe.', 1.13, 0, .29, .274, phone, '#bbc7c8', 49, 500);
  const rowIndicators = [], rowCards = [], rowGroups = [];
  const rows = [
    { y: -.13, title: 'LIVE MUSIC', sub: 'Lineup · venue · source', material: 'coralLight' },
    { y: -.59, title: 'ROOFTOP', sub: 'Area · timing · mood', material: 'signal' },
    { y: -1.05, title: 'AFTER HOURS', sub: 'Find your next stop', material: 'violetLight' },
  ];
  rows.forEach(({ y, title, sub, material }, i) => {
    const row = group(`choice-${i}`, 0, y, 0, false, phone); rowGroups.push(row);
    const outline = rounded(1.26, .43, .020, 0, 0, .26, material, row, .065);
    outline.material = materials[material].clone(); rowCards.push(outline.material);
    rounded(1.22, .39, .036, 0, 0, .276, 'card', row, .06);
    rounded(.042, .25, .020, -.567, 0, .305, material, row, .015);
    label(title, .97, .066, .073, .313, row, '#f6e9d7', 54, 650);
    label(sub, 1.04, .03, -.065, .314, row, '#9caeb6', 35, 450);
    const indicator = ball(.027, .519, .095, .321, material, row); rowIndicators.push(indicator);
  });
  rounded(.41, .026, .012, 0, -1.375, .252, 'slate', phone, .012);
  // Stable leaning cradle and finely vented spine.
  rounded(.94, .16, .55, -.65, .345, -.73, 'graphite');
  rounded(.80, .052, .45, -.65, .441, -.73, 'coral');
  for (let i = 0; i < 9; i++) box(.027, .11, .018, -1.10 + i * .10, .325, -.434, 'brass');

  // Jazz club on the left: curved portal, drum kit, microphone and club seating.
  const jazz = group('live-music-club', -1.67, .285, .61); jazz.rotation.y = .07;
  const jazzMotion = group('live-musicians', -1.67, .285, .61, true); jazzMotion.rotation.y = .07;
  const cymbals = [];
  disk(.81, .075, 0, .037, 0, 'graphite', jazz);
  disk(.77, .035, 0, .091, 0, 'coral', jazz);
  disk(.71, .024, 0, .123, 0, 'charcoal', jazz);
  rounded(1.31, .53, .085, 0, .397, -.44, 'coral', jazz, .03);
  const arch = ring(.66, .080, 0, .64, -.42, 'coral', jazz, Math.PI);
  ring(.566, .014, 0, .64, -.353, 'warm', jazz, Math.PI);
  for (const side of [-1, 1]) {
    rounded(.14, .60, .14, side * .65, .352, -.40, 'coral', jazz, .025);
    rounded(.025, .55, .025, side * .561, .365, -.32, 'warm', jazz, .01);
    box(.21, .42, .20, side * .55, .34, .23, 'graphite', jazz);
    for (const dy of [.25, .42]) ring(.052, .010, side * .55, dy, .336, 'slate', jazz);
    for (let i = 0; i < 3; i++) {
      const curtain = ball(.061, side * (.43 + i * .05), .495, -.37, 'purple', jazz); curtain.scale.set(1, 5, 1);
    }
  }
  const drum = disk(.18, .17, .12, .31, -.06, 'brass', jazz); drum.rotation.x = Math.PI / 2;
  const drumHead = disk(.157, .015, .12, .31, .034, 'ceramic', jazz); drumHead.rotation.x = Math.PI / 2;
  ring(.17, .012, .12, .31, .047, 'brass', jazz);
  for (const x of [-.15, .37]) { disk(.012, .41, x, .342, -.06, 'brass', jazz); cymbals.push(disk(.125, .015, x, .553, -.06, 'brass', jazzMotion)); }
  disk(.09, .021, -.30, .15, .25, 'brass', jazz);
  line([[-.30, .16, .25], [-.30, .66, .25], [-.19, .70, .24]], .012, 'brass', jazz);
  const mic = ball(.041, -.17, .7, .24, 'graphite', jazz); mic.scale.x = 1.6;
  const singer = person(-.34, .14, -.08, .86, 'ceramic', jazzMotion);
  const jazzLabels = group('jazz-labels', -1.67, .285, .61, true); jazzLabels.rotation.y = jazz.rotation.y;
  label('LIVE MUSIC', .96, 0, .962, -.330, jazzLabels, '#ffe0b2', 55);
  const clubSign = rounded(.83, .20, .08, 0, 1.02, -.43, 'charcoal', jazz);

  // Rooftop at the right: an open pergola, two tables, guests and a tiny garden.
  const roof = group('rooftop-lounge', 1.47, .28, -.68);
  const roofMotion = group('rooftop-guests', 1.47, .28, -.68, true);
  rounded(1.49, .47, 1.17, 0, .235, 0, 'graphite', roof, .06);
  rounded(1.60, .065, 1.28, 0, .515, 0, 'brass', roof, .045);
  rounded(1.55, .040, 1.23, 0, .573, 0, 'charcoal', roof, .04);
  for (const x of [-.51, -.17, .17, .51]) rounded(.18, .25, .018, x, .28, .597, 'warm', roof, .07);
  for (const x of [-.65, .65]) for (const z of [-.49, .47]) box(.036, .87, .036, x, 1.022, z, 'brass', roof);
  for (const x of [-.65, .65]) box(.057, .050, 1.10, x, 1.468, -.01, 'brass', roof);
  for (let i = 0; i < 5; i++) box(1.40, .043, .045, 0, 1.468, -.48 + i * .235, 'brass', roof);
  for (const z of [-.45, .44]) {
    const points = [[-.63, 1.42, z], [0, 1.31, z], [.63, 1.42, z]];
    line(points, .010, 'graphite', roof);
    for (let i = 0; i < 7; i++) ball(.027, -.57 + i * .19, 1.315 + Math.abs(i - 3) * .025, z, 'warm', roof);
  }
  for (const x of [-.31, .31]) {
    disk(.19, .028, x, .887, -.02, 'ceramic', roof); disk(.02, .28, x, .733, -.02, 'brass', roof);
    disk(.027, .065, x - .045, .937, -.02, 'warm', roof);
    for (const z of [-.24, .21]) { disk(.09, .035, x, .72, z, 'purple', roof); disk(.014, .14, x, .635, z, 'brass', roof); }
  }
  const guests = [person(-.34, .597, .24, .76, 'ceramic', roofMotion), person(.32, .597, -.23, .70, 'coral', roofMotion)];
  for (const x of [-.67, .67]) plant(x, .598, .39, .85, roof);
  for (let i = 0; i < 5; i++) box(.31, .065, .16, -.61, .065 + i * .1, .84 - i * .11, 'slate', roof);
  const roofLabels = group('rooftop-labels', 1.47, .28, -.68, true);
  rounded(1.09, .19, .043, 0, 1.535, -.47, 'graphite', roof);
  label('ROOFTOP', 1.02, 0, 1.535, -.440, roofLabels, '#bbf4e8', 63);

  // After-hours stage, a DJ deck and a violet equalizer between twin speakers.
  const club = group('after-hours-stage', 1.34, .28, 1.10); club.rotation.y = -.11;
  const clubMotion = group('nightclub-equalizer', 1.34, .28, 1.10, true); clubMotion.rotation.y = club.rotation.y;
  const speakerRings = [], platters = [];
  disk(.87, .07, 0, .035, 0, 'graphite', club);
  disk(.80, .035, 0, .092, 0, 'purple', club);
  disk(.75, .018, 0, .122, 0, 'charcoal', club);
  rounded(1.37, .81, .085, 0, .52, -.40, 'graphite', club, .09);
  rounded(1.23, .64, .022, 0, .53, -.342, 'screen', club, .06);
  for (const side of [-1, 1]) {
    rounded(.25, .66, .23, side * .64, .462, -.012, 'charcoal', club, .033);
    for (const y of [.31, .57]) { speakerRings.push(ring(.079, .013, side * .64, y, .123, 'violetLight', clubMotion)); ball(.034, side * .64, y, .124, 'graphite', club); }
    line([[side * .47, .91, -.32], [side * .47, .64, -.30], [side * .34, .23, .42]], .009, 'violetLight', club);
  }
  rounded(.90, .24, .29, 0, .314, .15, 'coral', club, .03);
  rounded(.96, .035, .34, 0, .46, .15, 'graphite', club, .025);
  for (const x of [-.26, .26]) {
    disk(.114, .023, x, .493, .15, 'slate', club);
    const platter = group('spinning-deck', x, .508, .15, false, clubMotion); platters.push(platter);
    disk(.077, .008, 0, 0, 0, 'charcoal', platter); flatRing(.093, .007, 0, .002, 0, 'signal', platter);
    box(.009, .007, .045, 0, .008, .053, 'ceramic', platter);
  }
  for (let i = 0; i < 3; i++) { box(.015, .014, .12, -.07 + i * .07, .491, .15, 'brass', club); box(.038, .02, .018, -.07 + i * .07, .51, .13 + i * .02, 'ceramic', club); }
  const dj = person(0, .137, -.09, 1.05, 'ceramic', clubMotion);
  ring(.10, .025, 0, .36, 0, 'purple', dj, Math.PI);
  const equalizer = [];
  for (let i = 0; i < 9; i++) {
    const h = .16 + .18 * Math.sin((i + 1) * .67) ** 2;
    const bar = rounded(.047, h, .021, -.43 + i * .1075, .515 + h / 2, -.316, i % 3 === 0 ? 'coralLight' : 'violetLight', clubMotion, .018);
    equalizer.push({ bar, h });
  }
  label('AFTER HOURS', 1.12, 0, .90, -.337, clubMotion, '#e0c9ff', 52);

  // A small Singapore skyline recedes behind the phone, without competing with it.
  const city = group('singapore-skyline', .72, .278, -1.46);
  for (const x of [-.23, 0, .23]) {
    rounded(.15, .57, .15, x, .285, 0, 'slate', city, .025);
    for (let y = .10; y < .53; y += .13) box(.085, .012, .009, x, y, .081, 'brass', city);
  }
  rounded(.86, .075, .21, 0, .603, 0, 'ceramic', city, .08);
  for (const [x, height] of [[-.52, .27], [.59, .31]]) {
    disk(.025, height, x, height / 2, 0, 'brass', city);
    const crown = ring(.13, .019, x, height, 0, 'purple', city); crown.rotation.x = Math.PI / 2;
    const cap = ball(.126, x, height + .008, 0, 'leaf', city); cap.scale.y = .28;
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; line([[x, height * .35, 0], [x + Math.sin(a) * .12, height, Math.cos(a) * .12]], .007, 'brass', city); }
  }

  // A single route branches from the phone into all three suggested experiences.
  const routePoints = [
    [[-.58, .51, -.41], [-.56, .34, .05], [-.63, .31, .94], [-1.00, .31, 1.24], [-1.48, .37, 1.09]],
    [[-.55, .51, -.42], [-.12, .35, -.30], [.55, .31, -.16], [.69, .48, -.53]],
    [[-.54, .51, -.40], [-.49, .34, .11], [-.38, .31, 1.18], [.13, .31, 1.65], [.64, .34, 1.49]],
  ];
  const packetGroup = group('nightlife-route-packets', 0, 0, 0, true);
  const routeColors = [0xffa378, 0x91ebe0, 0xc89aff];
  const curves = routePoints.map(points => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))));
  const routes = curves.map((curve, i) => {
    const track = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, .024, 6, false), new THREE.MeshStandardMaterial({ color: 0x44515b, roughness: .45, metalness: .4 }));
    packetGroup.add(track);
    const material = new THREE.MeshBasicMaterial({ color: routeColors[i], transparent: true, opacity: 1, toneMapped: false });
    const path = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, .028, 6, false), material);
    packetGroup.add(path);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.068, 14, 10), new THREE.MeshBasicMaterial({ color: routeColors[i], transparent: true, toneMapped: false }));
    packetGroup.add(head);
    const tail = Array.from({ length: 5 }, (_, n) => {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(.049 - n * .006, 10, 7), material); packetGroup.add(bead); return bead;
    });
    return { curve, path, material, head, tail };
  });
  // Initialise positions before finish measures the scene.
  routes.forEach(({ curve, head, tail }) => { curve.getPointAt(0, head.position); tail.forEach(bead => bead.position.copy(head.position)); });

  // A little floating ticket makes the hand-off from discovery to planning clear.
  const ticket = group('saved-night-plan', -.03, 1.59, .32, true); ticket.rotation.y = -.15; ticket.rotation.z = -.065;
  rounded(.72, .60, .07, 0, 0, 0, 'ceramic', ticket, .055);
  rounded(.65, .13, .013, 0, .195, .046, 'coral', ticket, .025);
  label('YOUR NIGHT', .68, 0, .195, .058, ticket, '#1e2931', 54, 700);
  const checks = [];
  for (let i = 0; i < 3; i++) {
    const check = line([[-.263, .041 - i * .082, .055], [-.24, .020 - i * .082, .055], [-.204, .065 - i * .082, .055]], .009, 'leaf', ticket); check.material = materials.leaf.clone(); check.material.transparent = true; checks.push(check);
    rounded(.33 - i * .035, .022, .010, .025 - i * .018, .043 - i * .082, .049, 'slate', ticket, .008);
  }
  line([[-.265, -.18, .052], [-.06, -.18, .052], [.05, -.23, .052], [.245, -.23, .052]], .009, 'coral', ticket);
  const beacons = group('venue-beacons', 0, 0, 0, true);
  const beaconMeshes = [pin(-2.12, 1.59, .21, 'coral', beacons), pin(2.03, 1.98, -.91, 'signal', beacons), pin(1.84, 1.54, .90, 'purple', beacons)];

  // Grounded practical lights shape the night scene without a postprocess glow.
  const practicals = group('nightlife-practical-lights', 0, 0, 0, true);
  const lightSpecs = [[0xffaa60, -1.67, 1.27, .51, 2.5], [0x8ce5da, 1.49, 1.45, -.46, 2], [0xb287ed, 1.3, 1.13, 1.02, 2.6]];
  const lights = lightSpecs.map(([color, x, y, z, intensity]) => { const l = new THREE.PointLight(color, intensity, 3.2, 2); l.position.set(x, y, z); practicals.add(l); return { l, intensity }; });
  const plaque = group('buzo-display-plaque', -.50, .337, 1.70, true); plaque.rotation.x = -.32;
  rounded(1.39, .27, .047, 0, 0, 0, 'graphite', plaque, .045);
  label('FROM A VIBE TO A NIGHT OUT', 1.35, 0, 0, .031, plaque, '#d8c6a7', 40, 500);

  const atmosphere = createBuzoAtmosphere(THREE, root); preserved.push(atmosphere.group);
  const model = finish(55, preserved);
  const ticketHome = ticket.position.clone(), beaconY = beaconMeshes.map(m => m.position.y);
  const clamp = THREE.MathUtils.clamp;
  const smooth = (a, b, value) => THREE.MathUtils.smoothstep(value, a, b);
  const stories = [
    { step: '01 / 04', title: 'Find your vibe.', detail: 'Start with a little live music.', tone: 'thinking' },
    { step: '02 / 04', title: 'Follow the mood.', detail: 'A rooftop stop, connected.', tone: 'flowing' },
    { step: '03 / 04', title: 'Keep the night going.', detail: 'After hours comes alive.', tone: 'flowing' },
    { step: '04 / 04', title: 'Your night, planned.', detail: 'Three stops. One saved plan.', tone: 'complete' },
  ];
  let dark = false;
  model.userData.displayBase = false;
  model.userData.animationDuration = 18;
  model.userData.animate = elapsed => {
    const t = Number.isFinite(elapsed) ? Math.max(0, elapsed) % 18 : 0;
    const step = Math.min(3, Math.floor(t / 4.5));
    const local = t - step * 4.5;
    const reset = 1 - smooth(17.25, 18, t);
    const saved = smooth(13.5, 14.4, t) * reset;
    const energies = rows.map((_, i) => {
      const age = t - i * 4.5;
      return Math.max(smooth(.55, 1.4, age) * (1 - smooth(3.7, 4.5, age)), saved * .8);
    });
    model.userData.story = stories[step];
    routes.forEach(({ curve, path, material, head, tail }, i) => {
      const age = t - i * 4.5;
      const progress = smooth(.10, 1.35, age);
      const complete = age > 1.35;
      const selected = step === i;
      // One leading comet draws the route, then short packets keep it alive.
      const travel = complete ? ((age - 1.35) * .52) % 1 : progress;
      const show = age >= .1 && reset > .01;
      path.visible = show;
      path.geometry.setDrawRange(0, Math.floor(progress * 80) * 6 * 6);
      material.opacity = (selected ? 1 : .30 + saved * .55) * reset;
      head.visible = show; head.scale.setScalar(selected ? 1 : .58);
      head.material.opacity = reset;
      curve.getPointAt(clamp(travel, 0, 1), head.position); head.position.y += .024;
      tail.forEach((bead, n) => {
        const at = travel - (n + 1) * .047;
        bead.visible = show && at >= 0 && selected;
        curve.getPointAt(clamp(at, 0, 1), bead.position); bead.position.y += .024;
      });
      const selection = selected ? smooth(0, .35, local) * (1 - smooth(4.1, 4.5, local)) : saved * .5;
      rowCards[i].emissiveIntensity = (dark ? .15 : .04) + selection * (dark ? 2 : .6);
      rowCards[i].color.setHex(selection > .05 ? routeColors[i] : 0x34444d);
      rowGroups[i].position.z = selection * .07;
      rowGroups[i].scale.setScalar(1 + selection * .035);
      rowIndicators[i].scale.setScalar(.8 + selection * .65);
      checks[i].visible = age >= .9;
      checks[i].material.opacity = smooth(.9, 1.45, age) * reset;
    });
    const beat = Math.sin(t * Math.PI * 4 / 3);
    singer.rotation.z = energies[0] * beat * .13;
    singer.rotation.y = energies[0] * Math.sin(t * Math.PI * 2 / 3) * .20;
    cymbals.forEach((m, i) => { m.rotation.z = energies[0] * Math.sin(t * Math.PI * 8 / 3 + i) * .15; });
    guests.forEach((m, i) => { m.rotation.y = energies[1] * Math.sin(t * Math.PI * 2 / 9 + i * 2) * .40; m.rotation.z = energies[1] * Math.sin(t * Math.PI * 4 / 9 + i) * .06; });
    dj.rotation.z = energies[2] * beat * .16;
    dj.position.y = .137 + energies[2] * (.5 + .5 * beat) * .028;
    platters.forEach((m, i) => { m.rotation.y = t * Math.PI * (i ? -4 : 4); });
    speakerRings.forEach((m, i) => { m.scale.setScalar(1 + energies[2] * (.5 + .5 * Math.sin(t * Math.PI * 4 / 3 + i * .6)) * .20); });
    equalizer.forEach(({ bar, h }, i) => {
      const scale = .15 + (.12 + energies[2] * .78) * (.5 + .5 * Math.sin(t * Math.PI * 8 / 3 + i * 1.3)) ** 2;
      bar.scale.y = scale; bar.position.y = .515 + h * scale / 2;
    });
    ticket.position.copy(ticketHome); ticket.position.y += saved * .12 + Math.sin(t * Math.PI * 2 / 9) * .015;
    ticket.scale.setScalar(.88 + saved * .32);
    ticket.rotation.y = -.15 + saved * .33;
    ticket.rotation.z = -.065 * (1 - saved) + Math.sin(t * Math.PI * 2 / 9) * .012;
    beaconMeshes.forEach((m, i) => {
      m.position.y = beaconY[i] + energies[i] * (.065 + .045 * Math.sin(t * Math.PI * 4 / 3 + i));
      m.rotation.y = energies[i] * Math.sin(t * Math.PI * 2 / 9) * .24;
      m.scale.setScalar(1 + energies[i] * .10);
    });
    lights.forEach(({ l, intensity }, i) => { l.intensity = intensity * (dark ? .30 + energies[i] * 1.4 : .06 + energies[i] * .22); });
    atmosphere.animate(t, energies, dark);
  };
  model.userData.setTheme = theme => {
    dark = theme === 'dark'; model.userData.studioLightScale = dark ? .60 : 1;
    materials.warm.emissiveIntensity = dark ? 1.25 : .32;
    materials.signal.emissiveIntensity = dark ? 1.2 : .35;
    materials.coralLight.emissiveIntensity = dark ? 1.25 : .32;
    materials.violetLight.emissiveIntensity = dark ? 1.20 : .3;
  };
  model.userData.setTheme('light');
  model.userData.animate(0);
  setBuzoFraming(THREE, model);
  model.userData.animate(0);
  return model;
}
