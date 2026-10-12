import { sculpture } from './sculpture.js';

// A listening companion turns a constellation of conversations into useful signals.
// Everything is local geometry; the only textures are small, generated labels.
export function createArtifact(THREE) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(THREE);
  materials.ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf5eee0, roughness: .24, metalness: .08, clearcoat: .9 });
  materials.coral = new THREE.MeshPhysicalMaterial({ color: 0xe64636, roughness: .28, metalness: .22, clearcoat: .8 });
  materials.graphite = new THREE.MeshStandardMaterial({ color: 0x18232d, roughness: .38, metalness: .45 });
  materials.screen = new THREE.MeshPhysicalMaterial({ color: 0x081d28, roughness: .18, metalness: .32, clearcoat: 1 });
  materials.silver = new THREE.MeshStandardMaterial({ color: 0xb6c5cd, roughness: .3, metalness: .8 });
  materials.gold = new THREE.MeshStandardMaterial({ color: 0xd3ae71, roughness: .33, metalness: .7 });
  materials.signal = new THREE.MeshStandardMaterial({ color: 0x8cf2ec, emissive: 0x3cd6db, emissiveIntensity: 1.2, roughness: .3 });
  materials.warm = new THREE.MeshStandardMaterial({ color: 0xffd2a2, emissive: 0xff8253, emissiveIntensity: 1.1, roughness: .3 });
  materials.route = new THREE.MeshStandardMaterial({ color: 0x296b80, emissive: 0x157484, emissiveIntensity: .3, roughness: .5, metalness: .45 });
  const preserved = [];
  const keep = (name, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group(); g.name = name; g.position.set(x, y, z);
    root.add(g); preserved.push(g); return g;
  };
  const group = (parent, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g;
  };
  function rounded(w, h, d, x, y, z, color, parent = root, radius = .1) {
    const r = Math.min(radius, w * .48, h * .48), bevel = Math.min(.035, d * .24);
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const geo = new THREE.ExtrudeGeometry(s, { depth: d - bevel * 2, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: bevel, bevelThickness: bevel, curveSegments: 8 });
    geo.translate(0, 0, -d / 2 + bevel);
    const m = mesh(geo, color, parent); m.position.set(x, y, z); return m;
  }
  function ring(radius, tube, x, y, z, color, parent = root, arc = Math.PI * 2) {
    const m = mesh(new THREE.TorusGeometry(radius, tube, 10, 96, arc), color, parent);
    m.position.set(x, y, z); return m;
  }
  function flatRing(radius, tube, y, color, parent = root) {
    const m = ring(radius, tube, 0, y, 0, color, parent); m.rotation.x = Math.PI / 2; return m;
  }
  function label(text, width, x, y, z, parent, color = '#dcecee', size = 46) {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.font = `600 ${size}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color; ctx.fillText(text, 384, 50);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .05, depthWrite: false, toneMapped: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 8), mat);
    m.position.set(x, y, z); parent.add(m); return m;
  }

  // Concentric machined stage, with illuminated seams and a fine perimeter scale.
  disk(2.7, .13, 0, .065, 0, 'graphite');
  disk(2.64, .10, 0, .17, 0, 'silver');
  disk(2.60, .08, 0, .25, 0, 'graphite');
  flatRing(2.63, .018, .205, 'signal');
  flatRing(2.46, .013, .298, 'gold');
  for (let i = 0; i < 64; i++) {
    const a = i * Math.PI / 32;
    const tick = box(.012, .009, i % 4 === 0 ? .10 : .044, Math.sin(a) * 2.51, .295, Math.cos(a) * 2.51, 'silver');
    tick.rotation.y = a;
  }
  disk(1.05, .16, -.25, .37, -.12, 'graphite');
  disk(.98, .055, -.25, .476, -.12, 'gold');
  disk(.91, .045, -.25, .526, -.12, 'screen');
  const pedestalRing = ring(.86, .021, -.25, .557, -.12, 'signal'); pedestalRing.rotation.x = Math.PI / 2;
  for (let i = 0; i < 36; i++) {
    const a = i * Math.PI / 18;
    box(.018, .10, .018, -.25 + Math.cos(a), .375, -.12 + Math.sin(a), 'silver');
  }

  // A monumental conversation halo gives the agent a distinct silhouette.
  const halo = group(root, -.3, 2.08, -.93);
  ring(1.53, .115, 0, 0, 0, 'coral', halo);
  ring(1.53, .025, 0, 0, .106, 'warm', halo);
  ring(1.36, .012, 0, 0, 0, 'gold', halo);
  for (let i = 0; i < 32; i++) {
    const a = i * Math.PI * 2 / 32;
    const t = box(.026, .065, .035, Math.sin(a) * 1.36, Math.cos(a) * 1.36, .012, i % 4 === 0 ? 'warm' : 'gold', halo);
    t.rotation.z = -a;
  }
  for (const x of [-.88, .28]) {
    rounded(.15, .55, .28, x, .55, -.93, 'graphite');
    rounded(.065, .33, .30, x, .52, -.93, 'coral');
  }
  const title = keep('halo-title', -.3, 3.16, -.78);
  rounded(1.15, .27, .09, 0, 0, 0, 'graphite', title);
  label('B R Y A N', 1.15, 0, 0, .054, title, '#fff0dd', 55);

  // Bryan: an oversized ceramic head, smoked visor, headphones and a soft body.
  const bryan = keep('bryan', -.3, 1.28, -.12);
  const body = ball(.45, 0, -.09, 0, 'ceramic', bryan); body.scale.set(1, 1.13, .8);
  ring(.27, .048, 0, .24, 0, 'gold', bryan).rotation.x = Math.PI / 2;
  rounded(.35, .18, .035, 0, -.08, .352, 'graphite', bryan, .075);
  for (let i = 0; i < 3; i++) ball(.025, -.085 + i * .085, -.08, .38, 'signal', bryan);
  rounded(1.32, 1.02, .87, 0, .76, 0, 'ceramic', bryan, .30);
  rounded(1.15, .70, .11, 0, .76, .442, 'silver', bryan, .23);
  rounded(1.07, .63, .13, 0, .76, .493, 'screen', bryan, .21);
  const eyes = [];
  for (const side of [-1, 1]) {
    eyes.push(rounded(.125, .255, .024, side * .235, .80, .573, 'signal', bryan, .06));
    const ear = disk(.26, .16, side * .75, .76, 0, 'coral', bryan); ear.rotation.z = Math.PI / 2;
    const earTrim = disk(.19, .018, side * .844, .76, 0, 'gold', bryan); earTrim.rotation.z = Math.PI / 2;
    const hand = ball(.16, side * .62, -.04, .07, 'ceramic', bryan); hand.scale.set(.82, 1.5, .95); hand.rotation.z = side * -.5;
  }
  const smile = ring(.135, .014, 0, .68, .577, 'signal', bryan, Math.PI * .66);
  smile.rotation.z = Math.PI * 1.17;
  line([[-.79, .67, .06], [-.77, .40, .37], [-.49, .37, .62], [-.34, .42, .65]], .022, 'gold', bryan);
  rounded(.15, .075, .07, -.31, .42, .65, 'graphite', bryan, .03);
  disk(.025, .20, .30, 1.33, 0, 'gold', bryan);
  ball(.071, .30, 1.46, 0, 'warm', bryan);
  // Light beneath the hovering body remains physical, without bloom/postprocessing.
  const hover = keep('hover-rings', -.3, .73, -.12);
  flatRing(.40, .018, 0, 'signal', hover);
  flatRing(.29, .012, .13, 'signal', hover);

  // Floating conversation fragments: voice, rating and a follow-up response.
  const conversations = [];
  function conversation(name, x, y, z, yaw, type) {
    const g = keep(name, x, y, z); g.rotation.y = yaw;
    rounded(1.16, .72, .095, 0, 0, 0, 'silver', g, .12);
    rounded(1.09, .65, .035, 0, 0, .062, 'screen', g, .1);
    const tail = mesh(new THREE.ConeGeometry(.12, .23, 3), 'silver', g); tail.rotation.z = Math.PI; tail.position.set(-.31, -.39, 0);
    const avatar = disk(.105, .017, -.37, .15, .093, 'coral', g); avatar.rotation.x = Math.PI / 2;
    ball(.032, -.37, .17, .114, 'ceramic', g);
    const torso = ball(.046, -.37, .10, .111, 'ceramic', g); torso.scale.set(1, .62, .22);
    rounded(.53, .023, .01, .12, .19, .089, 'silver', g, .01);
    rounded(.31, .018, .01, .01, .105, .089, 'route', g, .008);
    const bars = [];
    if (type === 'voice') {
      for (let i = 0; i < 17; i++) bars.push(rounded(.026, .19, .015, -.40 + i * .05, -.13, .09, 'signal', g, .011));
    } else if (type === 'rating') {
      for (let i = 0; i < 5; i++) {
        const star = new THREE.Shape();
        for (let j = 0; j < 10; j++) { const a = j * Math.PI / 5 + Math.PI / 2, r = j % 2 ? .035 : .078; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (j === 0) star.moveTo(x, y); else star.lineTo(x, y); }
        star.closePath(); const m = mesh(new THREE.ExtrudeGeometry(star, { depth: .015, bevelEnabled: false }), 'warm', g); m.position.set(-.36 + i * .18, -.13, .084);
      }
    } else {
      for (let i = 0; i < 3; i++) rounded(.77 - i * .13, .024, .011, -.04 - i * .065, -.07 - i * .077, .09, i === 0 ? 'signal' : 'silver', g, .01);
    }
    conversations.push({ g, bars, y, yaw }); return g;
  }
  conversation('spoken-feedback', -1.88, 1.83, .35, -.12, 'voice');
  conversation('event-rating', -1.38, .95, 1.67, .13, 'rating');
  conversation('follow-up', 1.29, .82, 1.52, -.21, 'text');

  // A separate insights panel makes the transformation legible at a glance.
  const report = keep('insights-panel', 1.49, 2.08, -.10); report.rotation.y = -.18;
  rounded(1.44, 1.83, .13, 0, 0, 0, 'gold', report, .13);
  rounded(1.34, 1.73, .05, 0, 0, .081, 'screen', report, .10);
  label('EVENT INSIGHTS', 1.35, 0, .67, .117, report, '#d5e6eb', 48);
  rounded(1.08, .012, .014, 0, .48, .119, 'route', report);
  const chartBars = [];
  for (let i = 0; i < 5; i++) {
    const h = [.22, .34, .28, .46, .56][i];
    const bar = rounded(.115, h, .04, -.44 + i * .22, -.13 + h / 2, .125, i === 4 ? 'warm' : 'signal', report, .028);
    chartBars.push({ bar, h });
  }
  rounded(1.08, .016, .015, 0, -.16, .12, 'silver', report);
  for (let i = 0; i < 3; i++) {
    ball(.029, -.49, -.32 - i * .15, .127, i === 0 ? 'warm' : 'signal', report);
    rounded(.82 - i * .11, .027, .012, -.0 - i * .055, -.32 - i * .15, .12, 'silver', report, .01);
  }
  label('LISTEN  /  LEARN  /  IMPROVE', 1.32, 0, -.76, .121, report, '#80cbd0', 29);
  // Small freestanding badge at the front of the installation.
  const plaque = keep('stage-caption', 0, .36, 2.23); plaque.rotation.x = -.32;
  rounded(1.50, .27, .05, 0, 0, 0, 'graphite', plaque, .045);
  label('EVERY VOICE MATTERS', 1.47, 0, 0, .033, plaque, '#c9d8dd', 43);

  // Visible fine rails carry bright packets from attendee conversations to Bryan,
  // then upward into the structured report. Paths stay inside the framing bounds.
  const curves = [
    [[-1.87, 1.45, .35], [-1.84, .85, .65], [-1.05, .64, .62], [-.51, 1.2, .13]],
    [[-1.35, .57, 1.64], [-.99, .42, 1.50], [-.59, .60, .88], [-.30, 1.20, .25]],
    [[1.28, .49, 1.49], [.92, .40, 1.10], [.35, .64, .69], [-.05, 1.21, .24]],
    [[.32, 1.7, -.08], [.62, 2.06, -.15], [.61, 2.57, -.11], [.85, 2.69, -.06]],
  ].map(points => {
    line(points, .015, 'route');
    return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  });
  const packets = keep('feedback-packets');
  const packetMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(.037, 10, 8), materials.signal, 16);
  packetMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); packetMesh.frustumCulled = false; packets.add(packetMesh);
  const matrix = new THREE.Matrix4(), point = new THREE.Vector3();
  // Place instances before finish() measures the stage; identity instances would
  // incorrectly extend the floor below zero and lift the entire installation.
  for (let i = 0; i < 16; i++) {
    curves[Math.floor(i / 4)].getPoint((i % 4) / 4, point);
    matrix.makeTranslation(point.x, point.y, point.z); packetMesh.setMatrixAt(i, matrix);
  }
  packetMesh.computeBoundingBox();
  const lights = keep('practical-lights');
  const cyanLight = new THREE.PointLight(0x56dfe8, 2.8, 4, 2); cyanLight.position.set(-.3, 1.3, 1.1); lights.add(cyanLight);
  const coralLight = new THREE.PointLight(0xff7451, 2.5, 4, 2); coralLight.position.set(-.5, 2.5, -.5); lights.add(coralLight);

  const model = finish(56, preserved);
  const bryanY = bryan.position.y, hoverY = hover.position.y;
  const floating = conversations.map(({ g }) => g.position.y);
  const reportY = report.position.y;
  // finish() moves the packets' parent by the same offset as the static rails.
  // Instances remain in original local path coordinates, so no per-frame offset.
  model.userData.animate = elapsed => {
    bryan.position.y = bryanY + Math.sin(elapsed * 1.6) * .075;
    bryan.rotation.y = Math.sin(elapsed * .65) * .10;
    bryan.rotation.z = Math.sin(elapsed * .9) * .027;
    const blink = elapsed % 5.8;
    eyes.forEach(eye => { eye.scale.y = blink > 5.55 ? .15 + .85 * Math.abs((blink - 5.675) / .125) : 1; });
    hover.position.y = hoverY + Math.sin(elapsed * 1.6 - .5) * .018;
    hover.scale.setScalar(1 + Math.sin(elapsed * 1.6) * .075);
    conversations.forEach(({ g, bars, yaw }, i) => {
      g.position.y = floating[i] + Math.sin(elapsed * 1.05 + i * 1.9) * .045;
      g.rotation.y = yaw + Math.sin(elapsed * .55 + i) * .045;
      bars.forEach((bar, j) => { bar.scale.y = .24 + .76 * Math.abs(Math.sin(elapsed * 3.1 + j * .67)) * Math.sin((j + 1) / 18 * Math.PI); });
    });
    report.position.y = reportY + Math.sin(elapsed * .85 + 1) * .025;
    chartBars.forEach(({ bar, h }, i) => {
      const scale = .85 + .15 * Math.sin(elapsed * 1.3 + i * .7);
      bar.scale.y = scale; bar.position.y = -.13 + h * scale / 2;
    });
    for (let i = 0; i < 16; i++) {
      curves[Math.floor(i / 4)].getPoint((elapsed * .20 + (i % 4) / 4) % 1, point);
      matrix.makeTranslation(point.x, point.y, point.z); packetMesh.setMatrixAt(i, matrix);
    }
    packetMesh.instanceMatrix.needsUpdate = true;
  };
  model.userData.setTheme = theme => {
    const dark = theme === 'dark';
    model.userData.studioLightScale = dark ? .72 : 1;
    materials.signal.emissiveIntensity = dark ? 1.45 : .55;
    materials.warm.emissiveIntensity = dark ? 1.35 : .48;
    materials.route.emissiveIntensity = dark ? .42 : .12;
    cyanLight.intensity = dark ? 3.2 : .55;
    coralLight.intensity = dark ? 3.5 : .4;
  };
  model.userData.animate(0);
  // Reserve the small hover envelope even when opened with reduced motion enabled.
  model.userData.framingBounds = new THREE.Box3().setFromObject(model).expandByScalar(.09);
  model.userData.setTheme('light');
  return model;
}
