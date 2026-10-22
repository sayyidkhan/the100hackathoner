// Lunar color and topography: NASA's Scientific Visualization Studio,
// CGI Moon Kit (LROC WAC / LOLA), https://svs.gsfc.nasa.gov/4720/.
// The caller owns the single moon's path, phase and fade animation.
export function createLunarMoon(T, { radius = .42, grain } = {}) {
  const geometry = new T.SphereGeometry(radius, 160, 112);
  const position = geometry.attributes.position, uv = geometry.attributes.uv;
  const directions = new Float32Array(position.count * 3);
  const direction = new T.Vector3();
  for (let i = 0; i < position.count; i++) {
    direction.fromBufferAttribute(position, i).normalize();
    directions.set(direction.toArray(), i * 3);
    // NASA's 0° meridian is at u=.5; put the familiar near side at local +Z.
    uv.setX(i, uv.getX(i) + .25);
  }
  geometry.setAttribute('lunarDirection', new T.BufferAttribute(directions, 3));
  geometry.computeBoundingSphere();
  geometry.boundingSphere.radius = radius * 1.015;

  // A small deterministic neutral fallback prevents a blank white globe before
  // the local NASA maps load and keeps geometry tests independent of the DOM.
  const width = 128, height = 64, pixels = new Uint8Array(width * height * 4);
  const heights = new Uint8Array(width * height * 4);
  const seas = [[.43,.36,.075,.085],[.51,.32,.065,.06],[.56,.43,.073,.07],[.40,.48,.085,.13],[.47,.48,.06,.055],[.60,.40,.035,.045]];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const u = x / width, v = y / height;
    let value = .69 + .025 * Math.sin(u * 167 + Math.sin(v * 53)) * Math.sin(v * 119);
    for (const [cx, cy, rx, ry] of seas) {
      const distance = ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2;
      value -= Math.exp(-distance * distance * 1.3) * .14;
    }
    const at = (y * width + x) * 4, c = Math.round(T.MathUtils.clamp(value, .25, .85) * 255);
    pixels.set([c, c, c, 255], at);
    heights.set([128, 128, 128, 255], at);
  }
  const albedoFallback = new T.DataTexture(pixels, width, height, T.RGBAFormat);
  const heightFallback = new T.DataTexture(heights, width, height, T.RGBAFormat);
  function configure(texture, color = false) {
    texture.wrapS = T.RepeatWrapping;
    texture.wrapT = T.ClampToEdgeWrapping;
    texture.anisotropy = 8;
    texture.minFilter = T.LinearMipmapLinearFilter;
    texture.magFilter = T.LinearFilter;
    texture.generateMipmaps = true;
    if (color) texture.colorSpace = T.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }
  albedoFallback.flipY = heightFallback.flipY = true;
  configure(albedoFallback, true);
  configure(heightFallback);

  const sunlight = { value: new T.Vector3(0, 0, -1) };
  const material = new T.MeshStandardMaterial({
    color: 0xffffff, map: albedoFallback, roughness: 1, metalness: 0,
    bumpMap: heightFallback || grain, bumpScale: radius * .010,
    displacementMap: heightFallback, displacementScale: radius * .012,
    displacementBias: -radius * .006, transparent: true,
  });
  material.onBeforeCompile = shader => {
    shader.uniforms.lunarSun = sunlight;
    shader.vertexShader = 'uniform vec3 lunarSun; attribute vec3 lunarDirection; varying vec3 vLunarDirection; varying vec3 vLunarSunView;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vLunarDirection = lunarDirection;
      vLunarSunView = normalize(mat3(modelViewMatrix) * lunarSun);
    `);
    shader.fragmentShader = 'uniform vec3 lunarSun; varying vec3 vLunarDirection; varying vec3 vLunarSunView;\n' + shader.fragmentShader;
    // The actual sun direction drives both crater relief and the curved
    // terminator. Studio lights cannot turn the dark hemisphere blue or cream.
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      float lunarIncidence = dot(normalize(vLunarDirection), normalize(lunarSun));
      float solarVisibility = smoothstep(-0.006, 0.012, lunarIncidence);
      float mu0 = max(dot(normal, normalize(vLunarSunView)), 0.0);
      float mu = max(dot(normal, normalize(vViewPosition)), 0.015);
      // Regolith scattering retains a crisp full-moon disk instead of the
      // plastic-ball limb darkening of a Lambert sphere.
      float lunarScatter = mix(mu0, 2.0 * mu0 / (mu0 + mu + 0.0001), 0.72);
      vec3 lunarAlbedo = mix(vec3(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722))), diffuseColor.rgb, 0.40);
      outgoingLight = lunarAlbedo * (solarVisibility * lunarScatter * 1.32 + 0.012);
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey = () => 'astrodegen-nasa-lunar-regolith-v3';

  const moon = new T.Mesh(geometry, material);
  moon.name = 'traveling-moon';
  moon.castShadow = true;
  moon.receiveShadow = false;
  moon.userData.noReceiveShadow = true;
  moon.userData.sunlight = sunlight;
  moon.userData.textureStatus = 'fallback';
  moon.userData.textureCredit = "NASA's Scientific Visualization Studio — LROC WAC / LOLA CGI Moon Kit";
  moon.userData.textureSource = 'https://svs.gsfc.nasa.gov/4720/';

  // Browser-only loading; Node model/bake tests use the deterministic fallback.
  if (typeof Image !== 'undefined' && typeof document?.createElementNS === 'function') {
    const loader = new T.TextureLoader();
    const requestRender = () => {
      for (let parent = moon; parent; parent = parent.parent) {
        if (parent.userData.requestRender) { parent.userData.requestRender(); break; }
      }
    };
    let loaded = 0;
    const load = (file, color, apply) => loader.load(new URL(`../assets/${file}`, import.meta.url).href, texture => {
      for (let parent = moon; parent; parent = parent.parent) {
        if (parent.userData.disposed) { texture.dispose(); return; }
      }
      configure(texture, color);
      apply(texture);
      material.needsUpdate = true;
      if (++loaded === 2) moon.userData.textureStatus = 'ready';
      requestRender();
    }, undefined, () => { moon.userData.textureStatus = 'fallback'; });
    moon.userData.textureStatus = 'loading';
    load('astrodegen-moon-lroc-2k.jpg', true, texture => {
      material.map = texture;
      albedoFallback.dispose();
    });
    load('astrodegen-moon-lola-1k.jpg', false, texture => {
      material.bumpMap = material.displacementMap = texture;
      heightFallback.dispose();
    });
  }
  return moon;
}
