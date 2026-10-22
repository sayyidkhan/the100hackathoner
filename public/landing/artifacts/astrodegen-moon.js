// A single, cratered moon. The caller owns its path, phase and fade animation.
export function createLunarMoon(T, { radius = .42, grain } = {}) {
  const TAU = Math.PI * 2;
  let seed = 42017;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const smooth = v => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
  const hash = (x, y, z) => {
    let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  // Seamless 3D noise keeps the texture continuous at the meridian and poles.
  function noise(x, y, z) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const fx = smooth(x - ix), fy = smooth(y - iy), fz = smooth(z - iz);
    const lerp = (a, b, t) => a + (b - a) * t;
    return lerp(
      lerp(lerp(hash(ix, iy, iz), hash(ix + 1, iy, iz), fx),
        lerp(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), fx), fy),
      lerp(lerp(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), fx),
        lerp(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), fx), fy), fz);
  }
  const normalize = (x, y, z) => {
    const length = Math.hypot(x, y, z);
    return { x: x / length, y: y / length, z: z / length };
  };
  const crater = (x, y, z, r, depth = 1) => ({ ...normalize(x, y, z), r, depth });
  // Several legible basins on the hero face, plus smaller overlapping impacts.
  const craters = [
    crater(-.37, .35, 1, .22), crater(.38, -.37, 1, .185, 1.1),
    crater(.08, .68, 1, .13), crater(-.35, -.46, 1, .14),
    crater(.62, .27, 1, .11), crater(-.7, .02, 1, .16),
    crater(.07, -.10, 1, .085), crater(.62, -.62, -.7, .20),
  ];
  for (let i = 0; i < 64; i++) {
    const y = random() * 2 - 1, angle = random() * TAU;
    const ring = Math.sqrt(1 - y * y);
    craters.push(crater(Math.cos(angle) * ring, y, Math.sin(angle) * ring,
      .025 + random() ** 2 * .105, .65 + random() * .45));
  }
  const maria = [
    { ...normalize(.3, .3, 1), r: .41, darkness: .19 },
    { ...normalize(-.13, -.12, 1), r: .31, darkness: .13 },
    { ...normalize(-.68, .03, .7), r: .29, darkness: .12 },
    { ...normalize(.3, .55, -.7), r: .36, darkness: .16 },
  ];

  function reliefAt(x, y, z) {
    let relief = (noise(x * 9, y * 9, z * 9) - .5) * .005;
    for (const c of craters) {
      const distanceSquared = Math.max(0, 2 - 2 * (x * c.x + y * c.y + z * c.z));
      if (distanceSquared > c.r * c.r * 1.69) continue;
      const d = Math.sqrt(distanceSquared) / c.r;
      const bowl = -.19 * (1 - smooth(d));
      const rim = .075 * Math.exp(-(((d - .94) / .13) ** 2));
      const centralPeak = c.r > .15 ? .035 * Math.exp(-((d / .15) ** 2)) : 0;
      relief += (bowl + rim + centralPeak) * c.r * c.depth;
    }
    return relief;
  }

  // 24,320 triangles: enough for actual silhouettes and raised crater rims.
  const geometry = new T.SphereGeometry(radius, 128, 96);
  const positions = geometry.attributes.position, directions = [];
  for (let i = 0; i < positions.count; i++) {
    const direction = new T.Vector3().fromBufferAttribute(positions, i).normalize();
    const r = radius * (1 + reliefAt(direction.x, direction.y, direction.z));
    positions.setXYZ(i, direction.x * r, direction.y * r, direction.z * r);
    directions.push(direction.x, direction.y, direction.z);
  }
  geometry.setAttribute('lunarDirection', new T.Float32BufferAttribute(directions, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  // Texture the stone itself: subtle lunar seas, impact ejecta and fine dust.
  // Pixel-only canvas operations also support the project's Node texture stub.
  const width = 512, height = 256;
  const albedoCanvas = document.createElement('canvas');
  const bumpCanvas = document.createElement('canvas');
  albedoCanvas.width = bumpCanvas.width = width;
  albedoCanvas.height = bumpCanvas.height = height;
  const albedoContext = albedoCanvas.getContext('2d');
  const bumpContext = bumpCanvas.getContext('2d');
  const albedo = albedoContext.createImageData(width, height);
  const bump = bumpContext.createImageData(width, height);
  for (let py = 0; py < height; py++) {
    const theta = (py + .5) / height * Math.PI;
    for (let px = 0; px < width; px++) {
      const phi = (px + .5) / width * TAU;
      const x = -Math.cos(phi) * Math.sin(theta), y = Math.cos(theta), z = Math.sin(phi) * Math.sin(theta);
      const coarse = noise(x * 6 + 13, y * 6 + 7, z * 6 + 11);
      const fine = noise(x * 75, y * 75, z * 75);
      let tone = .88 + (coarse - .5) * .11 + (fine - .5) * .055;
      for (const sea of maria) {
        const d = Math.sqrt(Math.max(0, 2 - 2 * (x * sea.x + y * sea.y + z * sea.z)));
        tone -= (1 - smooth(d / sea.r + (coarse - .5) * .4)) * sea.darkness;
      }
      for (const c of craters) {
        const distanceSquared = Math.max(0, 2 - 2 * (x * c.x + y * c.y + z * c.z));
        if (distanceSquared > c.r * c.r * 2.25) continue;
        const d = Math.sqrt(distanceSquared) / c.r;
        tone -= .07 * (1 - smooth(d));
        tone += .10 * Math.exp(-(((d - 1) / .17) ** 2));
      }
      const relief = reliefAt(x, y, z);
      const dust = hash(px, py, 42) - .5;
      const color = Math.round(clamp(tone + dust * .022, .5, 1) * 255);
      const elevation = Math.round(clamp(.5 + relief * 7 + (fine - .5) * .09 + dust * .025, 0, 1) * 255);
      const index = (py * width + px) * 4;
      albedo.data.set([color, color, color, 255], index);
      bump.data.set([elevation, elevation, elevation, 255], index);
    }
  }
  albedoContext.putImageData(albedo, 0, 0);
  bumpContext.putImageData(bump, 0, 0);
  const albedoMap = new T.CanvasTexture(albedoCanvas);
  const bumpMap = new T.CanvasTexture(bumpCanvas);
  albedoMap.colorSpace = T.SRGBColorSpace;
  albedoMap.wrapS = bumpMap.wrapS = T.RepeatWrapping;
  albedoMap.anisotropy = bumpMap.anisotropy = 4;

  const sunlight = { value: new T.Vector3(0, 0, -1) };
  const material = new T.MeshStandardMaterial({
    color: 0xffffff, map: albedoMap, roughness: .94, metalness: 0,
    bumpMap: bumpMap || grain, bumpScale: radius * .016,
    transparent: true,
  });
  material.onBeforeCompile = shader => {
    shader.uniforms.lunarSun = sunlight;
    shader.uniforms.lunarCream = { value: new T.Color(0xf7ecd5) };
    shader.uniforms.lunarBlue = { value: new T.Color(0x10213e) };
    shader.vertexShader = 'attribute vec3 lunarDirection; varying vec3 vLunarDirection;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nvLunarDirection = lunarDirection;');
    shader.fragmentShader = 'uniform vec3 lunarSun; uniform vec3 lunarCream; uniform vec3 lunarBlue; varying vec3 vLunarDirection;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float lunarIncidence = dot(normalize(vLunarDirection), lunarSun);
      float moonlight = smoothstep(-0.025, 0.04, lunarIncidence);
      // A narrow penumbra keeps the crescent's curved edge crisp and natural.
      diffuseColor.rgb *= mix(lunarBlue, lunarCream, moonlight);
    `);
  };
  material.customProgramCacheKey = () => 'astrodegen-sculpted-lunar-terminator-v2';

  const moon = new T.Mesh(geometry, material);
  moon.name = 'traveling-moon';
  moon.castShadow = moon.receiveShadow = true;
  moon.userData.sunlight = sunlight;
  return moon;
}
