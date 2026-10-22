// Small, deterministic material maps. All fields are periodic, including the
// brushed finish, so the plinth and drum have no seams when their UVs repeat.
export function createObservatorySurfaces(T) {
  const size = 256, tau = Math.PI * 2;
  const hash = (x, y, seed = 0) => {
    let n = Math.imul(x + 17 + seed, 374761393) ^ Math.imul(y + 11, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const smooth = x => x * x * (3 - 2 * x);
  const lerp = (a, b, t) => a + (b - a) * t;
  function field(u, v, columns, rows = columns, seed = 0) {
    const x = u * columns, y = v * rows, ix = Math.floor(x), iy = Math.floor(y);
    const sx = smooth(x - ix), sy = smooth(y - iy);
    const sample = (a, b) => hash((a % columns + columns) % columns, (b % rows + rows) % rows, seed);
    return lerp(lerp(sample(ix, iy), sample(ix + 1, iy), sx),
      lerp(sample(ix, iy + 1), sample(ix + 1, iy + 1), sx), sy);
  }
  // Cache the small noise lattices used by the larger architectural maps;
  // millions of per-pixel hash calls would otherwise delay opening the model.
  function sampledField(columns, rows, seed) {
    const stride = columns + 1, lattice = new Float32Array(stride * (rows + 1));
    for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++)
      lattice[y * stride + x] = hash(x % columns, y % rows, seed);
    return (u, v) => {
      const x = (u - Math.floor(u)) * columns, y = (v - Math.floor(v)) * rows;
      const ix = Math.floor(x), iy = Math.floor(y), index = iy * stride + ix;
      const sx = smooth(x - ix), sy = smooth(y - iy);
      return lerp(lerp(lattice[index], lattice[index + 1], sx),
        lerp(lattice[index + stride], lattice[index + stride + 1], sx), sy);
    };
  }
  function texture(pixels, color = false, resolution = size) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = resolution;
    const context = canvas.getContext('2d'), image = context.createImageData(resolution, resolution);
    image.data.set(pixels); context.putImageData(image, 0, 0);
    const map = new T.CanvasTexture(canvas);
    map.colorSpace = color ? T.SRGBColorSpace : T.NoColorSpace;
    map.wrapS = map.wrapT = T.RepeatWrapping;
    map.anisotropy = 4;
    return map;
  }
  const stoneColor = new Uint8ClampedArray(size * size * 4);
  const stoneFinish = new Uint8ClampedArray(size * size * 4);
  const glazeFinish = new Uint8ClampedArray(size * size * 4);
  const metalFinish = new Uint8ClampedArray(size * size * 4);
  const paintColor = new Uint8ClampedArray(size * size * 4);
  const paintFinish = new Uint8ClampedArray(size * size * 4);
  // Red stores height; green stores roughness. Reusing each finish as both a
  // bump and roughness map avoids separate full-size textures per property.
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + .5) / size, v = (y + .5) / size, i = (y * size + x) * 4;
    const mineral = field(u, v, 5, 5, 17), fine = field(u, v, 42, 42, 5);
    const sediment = Math.sin(tau * (v * 3 + mineral * .18));
    const pore = Math.max(0, field(u, v, 72, 72, 31) - .80) * 4;
    const tone = 241 + (mineral - .5) * 13 + sediment * 1.4 + (fine - .5) * 2 - pore * 5;
    stoneColor.set([tone, tone * .997, tone * .985, 255], i);
    stoneFinish.set([
      130 + (mineral - .5) * 9 + (fine - .5) * 19 - pore * 27,
      219 + (mineral - .5) * 14 + pore * 16,
      0, 255,
    ], i);
    // Soft, continuous orange-peel relief only catches grazing highlights;
    // there is no visible salt-and-pepper pixel noise on the painted parts.
    const glaze = field(u, v, 34, 34, 41), glazeCloud = field(u, v, 7, 7, 23);
    glazeFinish.set([128 + (glaze - .5) * 18, 194 + (glazeCloud - .5) * 16, 0, 255], i);
    // Long, fine machining marks, with much less variation along the grain.
    const brush = field(u, v, 3, 112, 73), broadBrush = field(u, v, 2, 19, 61);
    metalFinish.set([128 + (brush - .5) * 18, 185 + (brush - .5) * 39 + (broadBrush - .5) * 10, 0, 255], i);
    // The instrument paint is satin, with fine powder-coat relief and broad
    // roughness variation. It deliberately has no shiny ceramic top coat.
    const paintAge = field(u, v, 5, 5, 149), paintGrain = field(u, v, 73, 73, 157);
    const paintTone = 249 + (paintAge - .5) * 5;
    paintColor.set([paintTone, paintTone, paintTone, 255], i);
    paintFinish.set([128 + (paintGrain - .5) * 13, 209 + (paintAge - .5) * 24, 0, 255], i);
  }
  const stone = texture(stoneColor, true), relief = texture(stoneFinish);
  stone.repeat.set(2, 2); relief.repeat.copy(stone.repeat);
  const glaze = texture(glazeFinish), brushed = texture(metalFinish);
  const painted = texture(paintColor, true), powderCoat = texture(paintFinish);
  // Architecture uses an independent 512px finish. The model maps one tile
  // over roughly half a scene unit: trowel waves remain legible at normal
  // viewing distance, while the smaller rounded pores survive close views.
  const architectureSize = 512;
  const plasterColor = new Uint8ClampedArray(architectureSize * architectureSize * 4);
  const plasterFinish = new Uint8ClampedArray(architectureSize * architectureSize * 4);
  const roofFinish = new Uint8ClampedArray(architectureSize * architectureSize * 4);
  // Keep height at full precision for normal generation; differentiating the
  // 8-bit packed map would introduce false terraces in shallow trowel waves.
  const plasterHeight = new Float32Array(architectureSize * architectureSize);
  const roofHeight = new Float32Array(architectureSize * architectureSize);
  const weatherField = sampledField(3, 3, 101), warpXField = sampledField(4, 4, 109), warpYField = sampledField(4, 4, 113);
  const undulationField = sampledField(6, 7, 127), trowelField = sampledField(13, 20, 139);
  const toothField = sampledField(43, 43, 149), fineField = sampledField(118, 118, 157), poreField = sampledField(91, 91, 163);
  for (let y = 0; y < architectureSize; y++) for (let x = 0; x < architectureSize; x++) {
    const u = (x + .5) / architectureSize, v = (y + .5) / architectureSize;
    const i = (y * architectureSize + x) * 4;
    const weather = weatherField(u, v);
    const warpU = u + (warpXField(u, v) - .5) * .07;
    const warpV = v + (warpYField(u, v) - .5) * .07;
    const undulation = undulationField(warpU, warpV);
    const trowel = trowelField(warpU, warpV);
    const tooth = toothField(warpU, warpV);
    const fine = fineField(u, v);
    const pore = Math.max(0, (.25 - poreField(u, v)) / .25) ** 2;
    // Broad relief supplies the grazing-light shadows. Albedo stays quiet:
    // painting those shadows into the color would look dirty when rotated.
    const tone = 239 + (weather - .5) * 12 + (trowel - .5) * 3 - pore * 5;
    plasterColor.set([tone, tone * .998, tone * .990, 255], i);
    const wallHeight = 128 + (undulation - .5) * 84 + (trowel - .5) * 47 + (tooth - .5) * 15 + (fine - .5) * 5 - pore * 22;
    plasterHeight[y * architectureSize + x] = wallHeight / 255;
    plasterFinish.set([
      wallHeight,
      230 + (weather - .5) * 18 + pore * 9,
      0, 255,
    ], i);
    // The dome has the same mineral-paint character at a lower amplitude,
    // retaining broad matte highlights rather than polished plastic sheen.
    const domeHeight = 128 + (undulation - .5) * 36 + (trowel - .5) * 31 + (tooth - .5) * 14 + (fine - .5) * 5 - pore * 10;
    roofHeight[y * architectureSize + x] = domeHeight / 255;
    roofFinish.set([
      domeHeight,
      224 + (weather - .5) * 19 + (trowel - .5) * 7,
      0, 255,
    ], i);
  }
  const plaster = texture(plasterColor, true, architectureSize);
  const renderFinish = texture(plasterFinish, false, architectureSize);
  const mineralPaint = texture(roofFinish, false, architectureSize);
  function architecturalNormal(height, amplitude) {
    const pixels = new Uint8ClampedArray(architectureSize * architectureSize * 4);
    // Derive world-space slopes for a .5-unit tile, not per-pixel differences
    // that become almost flat in the renderer's screen-derivative bump path.
    const slopeScale = amplitude / (2 * .5 / architectureSize);
    for (let y = 0; y < architectureSize; y++) for (let x = 0; x < architectureSize; x++) {
      const left = (x + architectureSize - 1) % architectureSize, right = (x + 1) % architectureSize;
      const up = (y + architectureSize - 1) % architectureSize, down = (y + 1) % architectureSize;
      const nx = -(height[y * architectureSize + right] - height[y * architectureSize + left]) * slopeScale;
      // Canvas rows descend, while texture V ascends after CanvasTexture's
      // default flipY. The green slope therefore has the opposite sign to X.
      const ny = (height[down * architectureSize + x] - height[up * architectureSize + x]) * slopeScale;
      const length = Math.hypot(nx, ny, 1), i = (y * architectureSize + x) * 4;
      pixels.set([(nx / length * .5 + .5) * 255, (ny / length * .5 + .5) * 255, (1 / length * .5 + .5) * 255, 255], i);
    }
    return texture(pixels, false, architectureSize);
  }
  const plasterNormal = architecturalNormal(plasterHeight, .032);
  const roofNormal = architecturalNormal(roofHeight, .016);
  return {
    limestone: new T.MeshStandardMaterial({
      color: 0xdfd9cc, map: stone, bumpMap: relief, bumpScale: .013,
      roughness: .94, roughnessMap: relief, metalness: 0,
    }),
    enamel: new T.MeshPhysicalMaterial({
      color: 0xbe3827, roughness: .28, roughnessMap: glaze, metalness: .025,
      bumpMap: glaze, bumpScale: .0015,
      clearcoat: 1, clearcoatRoughness: .14, envMapIntensity: 1.15,
    }),
    ceramic: new T.MeshPhysicalMaterial({
      color: 0xf1eadc, roughness: .37, roughnessMap: glaze, metalness: 0,
      bumpMap: glaze, bumpScale: .0025,
      clearcoat: .65, clearcoatRoughness: .19,
    }),
    navy: new T.MeshPhysicalMaterial({
      color: 0x142b46, roughness: .36, roughnessMap: glaze, metalness: .12,
      bumpMap: glaze, bumpScale: .0012,
      clearcoat: .8, clearcoatRoughness: .2,
    }),
    nickel: new T.MeshStandardMaterial({
      color: 0xc4c9ca, roughness: .42, roughnessMap: brushed, metalness: .88,
      bumpMap: brushed, bumpScale: .0012, envMapIntensity: 1.25,
    }),
    // An opaque coated objective keeps the miniature inexpensive to render;
    // the Fresnel clearcoat gives it a readable optical highlight at any angle.
    glass: new T.MeshPhysicalMaterial({
      color: 0x1b5368, roughness: .075, metalness: .38,
      clearcoat: 1, clearcoatRoughness: .055, envMapIntensity: 1.3,
    }),
    window: new T.MeshPhysicalMaterial({
      color: 0xbc874b, emissive: 0xe7a459, emissiveIntensity: .32,
      roughness: .32, metalness: .05, clearcoat: .55, clearcoatRoughness: .17,
    }),
    mortar: new T.MeshStandardMaterial({ color: 0x8e887b, roughness: .96 }),
    // Dedicated architectural/optical finishes preserve the accepted chart
    // palette above while letting the observatory read as an actual building.
    observatoryWall: new T.MeshStandardMaterial({
      color: 0xe5decc, map: plaster, roughness: .99, roughnessMap: renderFinish,
      normalMap: plasterNormal, normalScale: new T.Vector2(.68, .68), metalness: 0,
    }),
    domePaint: new T.MeshStandardMaterial({
      color: 0xeee6d5, map: plaster, roughness: .91, roughnessMap: mineralPaint,
      normalMap: roofNormal, normalScale: new T.Vector2(1, 1), metalness: .015,
    }),
    telescopePaint: new T.MeshStandardMaterial({
      color: 0xac4332, map: painted, roughness: .66, roughnessMap: powderCoat,
      bumpMap: powderCoat, bumpScale: .0013, metalness: .035,
    }),
    anodized: new T.MeshStandardMaterial({
      color: 0x252c32, roughness: .58, roughnessMap: brushed,
      bumpMap: brushed, bumpScale: .0009, metalness: .78, envMapIntensity: .95,
    }),
    windowGlass: new T.MeshPhysicalMaterial({
      color: 0x17252b, roughness: .24, metalness: .10,
      clearcoat: .7, clearcoatRoughness: .09, envMapIntensity: 1,
    }),
    opticalGlass: new T.MeshPhysicalMaterial({
      color: 0x0c1d2b, roughness: .10, metalness: .10,
      clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.15,
    }),
    rock: new T.MeshStandardMaterial({
      color: 0x9e9889, map: stone, roughness: 1, roughnessMap: relief,
      bumpMap: relief, bumpScale: .028, metalness: 0,
    }),
  };
}
