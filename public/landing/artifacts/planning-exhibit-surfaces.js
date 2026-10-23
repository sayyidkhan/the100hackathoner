// Shared local finishes for exhibits 18–20. Neutral maps tint with each scene's
// material palette; clustered pores remain visible at normal viewing distance.
export function planningExhibitSurfaces(T) {
  const n = 512, rgba = new Uint8Array(n * n * 4);
  let seed = 1820;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const tone = 238 + random() * 16 + Math.sin(x * .043 + Math.sin(y * .019)) * 2;
    rgba.set([tone, tone, tone, 255], (y * n + x) * 4);
  }
  for (let i = 0; i < 2600; i++) {
    const cx = random() * n, cy = random() * n;
    const rx = .35 + random() * 1.7, ry = .35 + random() * 1.1;
    const depth = 16 + random() * 48;
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const distance = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (distance > 1) continue;
      const p = (((y + n) % n) * n + ((x + n) % n)) * 4;
      for (let c = 0; c < 3; c++) rgba[p + c] -= depth * (1 - distance * .6);
    }
  }
  const stone = new T.DataTexture(rgba, n, n);
  stone.colorSpace = T.SRGBColorSpace;
  stone.wrapS = stone.wrapT = T.RepeatWrapping;
  stone.minFilter = T.LinearMipmapLinearFilter;
  stone.magFilter = T.LinearFilter;
  stone.generateMipmaps = true;
  stone.anisotropy = 4;
  stone.needsUpdate = true;
  return { stone };
}
