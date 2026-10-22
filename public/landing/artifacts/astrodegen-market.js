// A miniature, illustrative market instrument driven by the same clock as the moon.
// The price sequence is authored for the exhibit; it is never a live quote or signal.
export function createLunarMarket(T) {
  const root = new T.Group();
  root.name = 'lunar-market-display';
  const clamp = value => T.MathUtils.clamp(Number.isFinite(value) ? value : 0, 0, 1);
  const navy = new T.Color(0x69dacb), coral = new T.Color(0xff886c);
  // Thirteen substantial candles remain distinguishable in the normal card
  // view; each swing has enough height to show a body as well as its wick.
  const values = [.18,.34,.23,.48,.36,.67,.83,.68,.87,.57,.72,.40,.46];
  const count = values.length;
  const xAt = index => -.405 + index / (count - 1) * .81;
  const yAt = value => -.09 + value * .24;
  const closes = values.map(value => 84 + value * 44);
  const candleMaterial = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, toneMapped: false });
  const wickMaterial = new T.MeshBasicMaterial({ color: 0xe2efe8, transparent: true });
  const volumeMaterial = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .53 });
  const lineMaterial = new T.MeshBasicMaterial({ color: 0xefdfb4, transparent: true });
  const cursorMaterial = new T.MeshBasicMaterial({ color: 0x69dacb, transparent: true, opacity: .60 });
  const dotMaterial = new T.MeshStandardMaterial({ color: 0xe9f5e3, emissive: 0x69dacb, emissiveIntensity: .45, roughness: .23, metalness: .12, transparent: true });
  const cube = new T.BoxGeometry(1, 1, 1);
  function instances(material, size, name) {
    const mesh = new T.InstancedMesh(cube, material, size);
    mesh.name = name;
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    // The cursor grows the chart from an initially tiny bounding box.
    mesh.frustumCulled = false;
    root.add(mesh);
    return mesh;
  }
  const bodies = instances(candleMaterial, count, 'lunar-market-candles');
  const wicks = instances(wickMaterial, count, 'lunar-market-wicks');
  const volumes = instances(volumeMaterial, count, 'lunar-market-volume');
  const path = new T.InstancedMesh(new T.CylinderGeometry(1, 1, 1, 6), lineMaterial, count - 1);
  path.name = 'lunar-market-price-path';
  path.instanceMatrix.setUsage(T.DynamicDrawUsage);
  path.frustumCulled = false;
  root.add(path);
  const cursor = new T.Mesh(new T.BoxGeometry(.0022, .30, .001), cursorMaterial);
  cursor.name = 'lunar-market-cursor';
  cursor.position.set(xAt(0), 0, .025);
  root.add(cursor);
  const dot = new T.Mesh(new T.SphereGeometry(.011, 20, 12), dotMaterial);
  dot.name = 'lunar-market-current-price';
  root.add(dot);
  const markerShape = new T.Shape();
  markerShape.moveTo(0, .016);
  markerShape.lineTo(-.021, -.010);
  markerShape.lineTo(-.007, -.010);
  markerShape.lineTo(-.007, -.022);
  markerShape.lineTo(.007, -.022);
  markerShape.lineTo(.007, -.010);
  markerShape.lineTo(.021, -.010);
  markerShape.closePath();
  const markerGeometry = new T.ExtrudeGeometry(markerShape, { depth: .008, bevelEnabled: true, bevelThickness: .0015, bevelSize: .0015, bevelSegments: 2, steps: 1 });
  function tradeMarker(color, name) {
    const marker = new T.Mesh(markerGeometry, new T.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .28, roughness: .25, metalness: .20, transparent: true }));
    marker.name = name;
    root.add(marker);
    return marker;
  }
  const buyMarker = tradeMarker(0x78e4cf, 'lunar-market-buy-entry');
  const sellMarker = tradeMarker(0xff886c, 'lunar-market-sell-entry');
  sellMarker.rotation.z = Math.PI;

  // Fine grid rules are a single draw call and leave the candles visually dominant.
  const grid = [];
  for (let i = 0; i < 5; i++) {
    const y = -.09 + i * .06;
    grid.push(-.435, y, .006, .435, y, .006);
  }
  for (let i = 0; i < 6; i++) {
    const x = -.405 + i * .162;
    grid.push(x, -.15, .006, x, .15, .006);
  }
  grid.push(-.435, -.102, .006, .435, -.102, .006);
  const gridGeometry = new T.BufferGeometry();
  gridGeometry.setAttribute('position', new T.Float32BufferAttribute(grid, 3));
  root.add(new T.LineSegments(gridGeometry, new T.LineBasicMaterial({ color: 0x517486, transparent: true, opacity: .28 })));

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 336;
  const ctx = canvas.getContext('2d');
  const textMap = new T.CanvasTexture(canvas);
  textMap.colorSpace = T.SRGBColorSpace;
  const text = new T.Mesh(new T.PlaneGeometry(.94, .62), new T.MeshBasicMaterial({ map: textMap, toneMapped: false }));
  text.name = 'lunar-market-instrument-screen';
  text.position.z = .002;
  root.add(text);
  let lastLabel = '';
  const phases = ['NEW MOON', 'WAXING CRESCENT', 'FIRST QUARTER', 'WAXING GIBBOUS', 'FULL MOON', 'WANING GIBBOUS', 'LAST QUARTER', 'WANING CRESCENT', 'NEW MOON'];
  function label(progress, illumination, price, signal) {
    const phaseName = phases[Math.round(progress * 8)];
    const content = `${phaseName}|${Math.round(illumination * 100)}|${price.toFixed(1)}|${signal}`;
    if (content === lastLabel) return;
    lastLabel = content;
    const accent = signal === 'sell' ? '#ff886c' : signal === 'buy' ? '#78e4cf' : '#ecdfbe';
    ctx.fillStyle = '#0a1627';
    ctx.fillRect(0, 0, 512, 336);
    ctx.fillStyle = '#12253b';
    ctx.fillRect(0, 0, 512, 80);
    ctx.fillStyle = '#aac0cc';
    ctx.font = '600 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LUNAR / MARKET', 18, 25);
    ctx.fillStyle = '#ecdfbe';
    ctx.textAlign = 'right';
    ctx.fillText('SIM', 494, 25);
    ctx.fillStyle = '#f4f5e8';
    ctx.font = '600 34px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`$${price.toFixed(1)}`, 18, 64);
    ctx.fillStyle = '#78e4cf';
    ctx.font = '600 21px monospace';
    ctx.textAlign = 'right';
    const change = (price / closes[0] - 1) * 100;
    ctx.fillText(`${change >= 0 ? '+' : ''}${change.toFixed(1)}%`, 494, 63);
    ctx.fillStyle = '#31465b';
    ctx.fillRect(18, 78, 476, 1);
    // A separate, large status band makes the lunar trading relationship explicit.
    ctx.fillStyle = '#14293a';
    ctx.fillRect(0, 260, 512, 76);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 260, 512, 2);
    ctx.fillRect(16, 275, 145, 47);
    ctx.fillStyle = '#102234';
    ctx.font = signal === 'observe' ? '700 29px monospace' : '700 36px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(signal === 'observe' ? 'WATCH' : signal.toUpperCase(), 27, 310);
    ctx.fillStyle = '#e5eee8';
    ctx.font = '600 18px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(phaseName, 494, 286);
    ctx.fillStyle = '#8faab8';
    ctx.font = '500 16px monospace';
    ctx.fillText(`${Math.round(illumination * 100)}% ILLUMINATED`, 494, 312);
    textMap.needsUpdate = true;
  }

  const dummy = new T.Object3D(), a = new T.Vector3(), b = new T.Vector3(), up = new T.Vector3(0, 1, 0);
  const bars = values.map((close, index) => {
    const open = index ? values[index - 1] : close - .025;
    const high = Math.min(1, Math.max(open, close) + .045 + (index % 3) * .012);
    const low = Math.max(0, Math.min(open, close) - .035 - (index % 4) * .008);
    const color = close >= open ? navy : coral;
    bodies.setColorAt(index, color);
    volumes.setColorAt(index, color);
    return { open, close, high, low, volume: .009 + Math.abs(close - open) * .12 + (index % 3) * .003 };
  });
  function setBox(mesh, index, x, y, z, width, height, depth) {
    dummy.position.set(x, y, z);
    dummy.quaternion.identity();
    dummy.scale.set(width, height, depth);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  }
  const state = { progress: 0, phase: 0, price: closes[0], visibleCandles: 1, illumination: 0, signal: 'observe' };
  Object.assign(root.userData, {
    state,
    update(progress, phase, time, active = 1) {
      const p = clamp(progress), visibility = clamp(active), indexFloat = p * (count - 1);
      const index = Math.min(count - 1, Math.floor(indexFloat)), fraction = indexFloat - index;
      const next = Math.min(count - 1, index + 1);
      const value = T.MathUtils.lerp(values[index], values[next], fraction);
      const illumination = (1 - Math.cos(Number.isFinite(phase) ? phase : p * Math.PI * 2)) / 2;
      state.progress = p;
      state.phase = Number.isFinite(phase) ? phase : p * Math.PI * 2;
      state.price = 84 + value * 44;
      state.visibleCandles = index + 1;
      state.illumination = illumination;
      state.signal = p < .10 || p > .94 ? 'observe' : p < .45 ? 'buy' : p < .60 ? 'hold' : 'sell';
      bodies.count = wicks.count = volumes.count = state.visibleCandles;
      for (let i = 0; i <= index; i++) {
        const bar = bars[i];
        const growth = i === index && i > 0 && p < 1 ? Math.min(1, fraction / .25) : 1;
        const close = T.MathUtils.lerp(bar.open, bar.close, growth);
        const high = T.MathUtils.lerp(bar.open, bar.high, growth), low = T.MathUtils.lerp(bar.open, bar.low, growth);
        setBox(bodies, i, xAt(i), (yAt(bar.open) + yAt(close)) / 2, .022, .041, Math.max(.006, Math.abs(close - bar.open) * .24), .024);
        setBox(wicks, i, xAt(i), (yAt(high) + yAt(low)) / 2, .021, .004, Math.max(.006, (high - low) * .24), .006);
        setBox(volumes, i, xAt(i), -.15 + bar.volume * growth / 2, .012, .041, Math.max(.001, bar.volume * growth), .010);
      }
      // The last segment is continuously interpolated instead of stepping with candles.
      const segmentCount = Math.min(count - 1, Math.ceil(indexFloat));
      path.count = segmentCount;
      for (let i = 0; i < segmentCount; i++) {
        a.set(xAt(i), yAt(values[i]), .041);
        const portion = Math.min(1, indexFloat - i);
        b.set(T.MathUtils.lerp(xAt(i), xAt(i + 1), portion), yAt(T.MathUtils.lerp(values[i], values[i + 1], portion)), .041);
        dummy.position.copy(a).add(b).multiplyScalar(.5);
        const length = b.sub(a).length();
        dummy.quaternion.setFromUnitVectors(up, b.normalize());
        dummy.scale.set(.0018, Math.max(.00001, length), .0018);
        dummy.updateMatrix();
        path.setMatrixAt(i, dummy.matrix);
      }
      for (const mesh of [bodies, wicks, volumes, path]) mesh.instanceMatrix.needsUpdate = true;
      cursor.position.x = xAt(indexFloat);
      dot.position.set(xAt(indexFloat), yAt(value), .055);
      const signalColor = state.signal === 'sell' ? coral : navy;
      cursorMaterial.color.copy(signalColor);
      dotMaterial.emissive.copy(signalColor);
      candleMaterial.opacity = wickMaterial.opacity = dotMaterial.opacity = visibility;
      lineMaterial.opacity = visibility * .30;
      volumeMaterial.opacity = visibility * .53;
      cursorMaterial.opacity = visibility * .60;
      for (const mesh of [bodies, wicks, volumes, path, cursor, dot]) mesh.visible = visibility > .001;
      buyMarker.position.set(xAt(1.2), yAt(bars[1].low) - .023, .059);
      sellMarker.position.set(xAt(7.2), yAt(bars[7].high) + .010, .059);
      buyMarker.visible = p >= .1 && visibility > .001;
      sellMarker.visible = p >= .6 && visibility > .001;
      buyMarker.material.opacity = sellMarker.material.opacity = visibility;
      label(p, illumination, state.price, state.signal);
    },
  });
  root.traverse(object => {
    if (!object.isMesh && !object.isLineSegments) return;
    object.userData.noShadow = true;
    object.castShadow = object.receiveShadow = false;
  });
  root.userData.update(0, 0, 0);
  return root;
}
