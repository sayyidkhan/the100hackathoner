import { medivoiceStudio } from './medivoice-studio.js';

// Asterix's "Vibe Check Console" — a sculptural interpretation of the
// hackathon's vibe-coding assessment, not a live score or a diagnostic tool.
export function createArtifact(T) {
  const kit = medivoiceStudio(T);
  const { root, materials: m, mesh, box, disk, line, finish, texture } = kit;
  const material = (color, roughness = .65, metalness = 0) => new T.MeshStandardMaterial({ color, roughness, metalness });
  Object.assign(m, {
    ceramic: material(0xe8dfcb, .55), face: material(0xf5ecd9, .8),
    edge: material(0xbfb397), brass: material(0xae8951, .32, .7),
    dark: material(0x183e41, .36), screen: material(0x0b2428, .4),
    teal: material(0x438a83, .5), amber: material(0xdca343, .48),
    coral: material(0xc54c32, .42), cobalt: material(0x286580, .4),
    ink: material(0x4c574e), paper: material(0xf1e9d8, .85),
    signal: new T.MeshStandardMaterial({ color: 0xa1ded0, emissive: 0x65b6ab, emissiveIntensity: .4, roughness: .4 }),
  });
  const grain = texture('stone');
  for (const key of ['ceramic', 'face', 'paper']) { m[key].bumpMap = grain; m[key].bumpScale = .007; }
  const preserved = [];
  function group(x = 0, y = 0, z = 0, parent = root) {
    const g = new T.Group(); g.position.set(x, y, z); parent.add(g); return g;
  }
  function rounded(w, h, d, x, y, z, color, parent = root, radius = .09) {
    const r = Math.min(radius, w / 2, h / 2), s = new T.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const o = mesh(new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: .018, bevelThickness: .018, bevelSegments: 3, curveSegments: 12 }), color, parent);
    o.position.set(x, y, z); return o;
  }
  function coin(r, depth, x, y, z, color, parent = root) {
    const o = disk(r, depth, x, y, z, color, parent); o.rotation.x = Math.PI / 2; return o;
  }
  function ring(r, thickness, x, y, z, color, parent = root) {
    const o = mesh(new T.TorusGeometry(r, thickness, 12, 128), color, parent); o.position.set(x, y, z); return o;
  }
  function arc(inner, outer, start, length, color, parent) {
    const o = mesh(new T.RingGeometry(inner, outer, 48, 1, start, length), color, parent); o.position.z = .305; return o;
  }
  function label(value, w, x, y, z, color, parent = root) {
    const g = group(x, y, z, parent);
    if (typeof document !== 'undefined') {
      const c = document.createElement('canvas'); c.width = 1024; c.height = 160;
      const ctx = c.getContext('2d'); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '600 90px monospace'; ctx.fillText(value, 512, 80, 1000);
      const map = new T.CanvasTexture(c); map.colorSpace = T.SRGBColorSpace;
      const o = new T.Mesh(new T.PlaneGeometry(w, w * 160 / 1024), new T.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }));
      o.userData.noShadow = true; g.add(o);
    }
    preserved.push(g); return g;
  }

  // One softly bevelled ceramic foundation. No extra exhibition turntable.
  const base = rounded(6.5, 3.35, .18, 0, .06, 0, 'ceramic', root, .38);
  base.rotation.x = -Math.PI / 2;
  const inset = rounded(6.26, 3.10, .025, 0, .255, 0, 'face', root, .32);
  inset.rotation.x = -Math.PI / 2;
  for (const x of [-2.65, 2.65]) for (const z of [-1.1, 1.1]) disk(.18, .065, x, .02, z, 'dark');

  // Dominant analog instrument: deep ribbed shell, machined bezel, inset face.
  const dial = group(.08, 1.96, -.35);
  rounded(.62, .61, .52, 0, -1.32, -.25, 'ceramic', dial, .12);
  coin(1.49, .48, 0, 0, -.05, 'ceramic', dial);
  coin(1.43, .035, 0, 0, -.31, 'brass', dial);
  for (let i = 0; i < 100; i++) {
    const a = i / 100 * Math.PI * 2;
    const flute = box(.016, .038, .36, Math.cos(a) * 1.483, Math.sin(a) * 1.483, -.05, 'edge', dial);
    flute.rotation.z = a - Math.PI / 2;
  }
  coin(1.45, .065, 0, 0, .21, 'brass', dial);
  coin(1.37, .06, 0, 0, .265, 'face', dial);
  ring(1.40, .027, 0, 0, .288, 'brass', dial);
  ring(1.31, .013, 0, 0, .31, 'edge', dial);
  // Three possible outcome regions, without inventing assessment cut-offs.
  ['coral', 'amber', 'teal'].forEach((color, i) => arc(1.08, 1.23, .14 + i * .96, .89, color, dial));
  for (let i = 0; i <= 60; i++) {
    const a = .14 + i / 60 * 2.81, length = i % 5 === 0 ? .12 : .055;
    const tick = box(.014, length, .012, Math.cos(a) * (.99 - length / 2), Math.sin(a) * (.99 - length / 2), .305, 'ink', dial);
    tick.rotation.z = a - Math.PI / 2;
  }
  const needle = group(0, 0, .37, dial);
  const pointer = new T.Shape(); pointer.moveTo(-.035, -.18); pointer.lineTo(.035, -.18); pointer.lineTo(.009, 1.04); pointer.lineTo(-.009, 1.04); pointer.closePath();
  mesh(new T.ExtrudeGeometry(pointer, { depth: .025, bevelEnabled: true, bevelSize: .008, bevelThickness: .008, bevelSegments: 2 }), 'coral', needle);
  coin(.125, .055, 0, 0, .415, 'brass', dial); coin(.065, .018, 0, 0, .45, 'coral', dial);
  const asterisk = group(0, -.45, .338, dial);
  for (let i = 0; i < 3; i++) { const spoke = rounded(.052, .36, .025, 0, 0, 0, 'coral', asterisk, .022); spoke.rotation.z = i * Math.PI / 3; }
  label('A S T E R I X', .85, 0, -.79, .338, '#47514a', dial);
  label('V I B E   C H E C K', 1.04, 0, -1.01, .338, '#746746', dial);
  for (const a of [.78, 2.36, 3.92, 5.5]) {
    const x = Math.cos(a) * 1.415, y = Math.sin(a) * 1.415;
    coin(.028, .018, x, y, .285, 'brass', dial); box(.033, .005, .003, x, y, .297, 'ink', dial);
  }

  // Compact code terminal, with a recessed screen and real keycaps.
  const terminal = group(-2.02, .30, .55); terminal.rotation.y = .13;
  rounded(1.44, 1.15, .49, 0, .91, -.23, 'dark', terminal, .18);
  rounded(1.23, .90, .025, 0, .93, .275, 'brass', terminal, .095);
  rounded(1.12, .79, .015, 0, .93, .309, 'screen', terminal, .08);
  for (let i = 0; i < 6; i++) {
    const start = -.44 + (i % 3) * .06;
    box(.024, .027, .008, -.48, 1.20 - i * .10, .339, 'teal', terminal);
    box([.51, .70, .38, .57, .43, .62][i], .024, .008, start + .33, 1.20 - i * .10, .339, i === 2 ? 'amber' : 'signal', terminal);
  }
  const cursor = box(.08, .028, .009, .30, .70, .339, 'signal', terminal);
  rounded(.34, .27, .22, 0, .29, -.08, 'brass', terminal, .05);
  const keyboard = rounded(1.54, .67, .10, 0, .06, .65, 'dark', terminal, .11); keyboard.rotation.x = -Math.PI / 2;
  for (let row = 0; row < 3; row++) for (let col = 0; col < 10; col++) {
    const key = rounded(.10, .105, .028, -.61 + col * .136, .18, .40 + row * .145, col === 9 ? 'coral' : 'ceramic', terminal, .018); key.rotation.x = -Math.PI / 2;
  }
  const space = rounded(.62, .08, .025, -.03, .18, .86, 'brass', terminal, .02); space.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 7; i++) box(.30, .018, .013, 0, .54 + i * .055, -.48, 'ink', terminal);

  // A fan of answer cards, dimensional choices, and a weighted brass holder.
  const cards = group(2.05, .31, .50); cards.rotation.y = -.13;
  rounded(1.47, .18, .65, 0, .06, -.23, 'brass', cards, .07);
  for (let i = 0; i < 3; i++) {
    const card = group((i - 1) * .15, .13, -.19 + i * .12, cards); card.rotation.z = (.14 - i * .13);
    rounded(1.0, 1.47, .043, 0, .78, 0, 'paper', card, .09);
    box(.16, .045, .012, -.29, 1.33, .055, 'coral', card);
    for (let j = 0; j < 2; j++) box(.68 - j * .16, .024, .012, -j * .08, 1.20 - j * .075, .056, 'edge', card);
    for (let j = 0; j < 3; j++) {
      ring(.048, .009, -.31, .85 - j * .22, .058, j === i ? 'coral' : 'brass', card);
      if (j === i) coin(.027, .014, -.31, .85 - j * .22, .06, 'coral', card);
      box(.43, .025, .013, .05, .85 - j * .22, .057, 'edge', card);
    }
  }
  rounded(1.48, .20, .045, 0, .13, .42, 'ceramic', cards, .045);
  // The blue connection remains legible as a single physical cable.
  line([[-1.49,.37,.23],[-1.14,.34,.60],[-.84,.34,.65],[-.55,.35,.38],[-.58,.46,-.12]], .040, 'cobalt');
  line([[.62,.42,-.10],[.89,.34,.39],[1.14,.34,.60],[1.55,.35,.52]], .040, 'cobalt');
  for (let i = 0; i < 3; i++) {
    const swatch = rounded(.42, .17, .025, -.55 + i * .55, .29, 1.25, ['teal','amber','coral'][i], root, .055); swatch.rotation.x = -Math.PI / 2;
  }

  // Preserve the needle and lettering through static material batching.
  root.updateMatrixWorld(true);
  for (const g of [...preserved, needle, cursor]) root.attach(g);
  preserved.push(needle, cursor);
  const model = finish(45, preserved);
  Object.assign(model.userData, { displayBase: false, groundLevel: 0, studioProfile: 'paper', contactFootprint: false, initialYaw: -.18, initialElevation: .27, autoOrbit: false });
  model.userData.animate = time => {
    // A restrained illustrative sweep; paused/reduced-motion behavior is owned by the gallery.
    needle.rotation.z = -.42 + Math.sin(time * .5) * .18;
    cursor.visible = Math.floor(time * 1.4) % 2 === 0;
  };
  model.userData.animate(0);
  return model;
}
