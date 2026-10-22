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
  function texture(pixels, color = false) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    const context = canvas.getContext('2d'), image = context.createImageData(size, size);
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
  }
  const stone = texture(stoneColor, true), relief = texture(stoneFinish);
  stone.repeat.set(2, 2); relief.repeat.copy(stone.repeat);
  const glaze = texture(glazeFinish), brushed = texture(metalFinish);
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
  };
}
