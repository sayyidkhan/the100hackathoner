import * as THREE from './vendor/three.module.js';
import { createArtifact } from './models.js';
import { createNightlifePost } from './nightlife-post.js';

const BACKGROUND = 0x100f12;
const THEMES = {
  dark: {
    background: 0x100f12,
    plinthTop: 0x09080a,
    plinthSide: 0x070608,
    plinthSeam: 0x494341,
    groundLight: 0x29242e,
    exposure: 0.95,
    environment: 0.35,
    hemisphere: 0.85,
    key: 2.4,
    fill: 0.8,
    rim: 2.2,
    shadowOpacity: 0.32,
  },
  light: {
    background: 0xf6f5f0,
    plinthTop: 0xc8c3b8,
    plinthSide: 0xaaa59b,
    plinthSeam: 0xd5d0c4,
    groundLight: 0x716b61,
    exposure: 0.9,
    environment: 0.32,
    hemisphere: 0.8,
    key: 2.2,
    fill: 0.75,
    rim: 1.6,
    shadowOpacity: 0.19,
  },
};
const PROJECTS = new Set([81, 80, 79]);
const INITIAL_YAW = -0.3;
const INITIAL_ELEVATION = 0.57;
const clamp = THREE.MathUtils.clamp;

/**
 * An isolated studio renderer for the Museum's existing project artifacts.
 * Construct lazily, then call setActive(true) when the 3D view is displayed.
 * Inactive, offscreen and hidden-document states do not run a rendering loop.
 */
export function createGalleryScene({ canvas, container, onError = () => {}, onStoryChange = () => {}, onAnnotations = (_points) => {}, theme = 'dark', initialProject = 81, artifactFactory = createArtifact, projectIds = PROJECTS }) {
  if (!(canvas instanceof HTMLCanvasElement) || !container) {
    throw new TypeError('The gallery needs a canvas and its layout container.');
  }
  if (!Object.hasOwn(THEMES, theme)) throw new RangeError(`Unknown gallery theme: ${theme}`);

  let renderer;
  let nightlifePost;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    onError(error);
    throw error;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, [49, 57].includes(Number(initialProject)) ? 2 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(BACKGROUND, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND);
  scene.fog = new THREE.Fog(BACKGROUND, 28, 58);
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 80);
  const target = new THREE.Vector3(0, 1.4, 0);
  const bounds = new THREE.Box3();
  const size = new THREE.Vector3();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const models = new Map();
  let currentModel = null;
  let currentId = null;
  let currentTheme = null;
  let storyKey;
  let active = false;
  let paused = reducedMotion.matches;
  let inViewport = true;
  let disposed = false;
  let failed = false;
  let frameId = null;
  let lastFrameTime = 0;
  let elapsed = 0;
  let yaw = INITIAL_YAW;
  let elevation = INITIAL_ELEVATION;
  let distance = 16;
  let zoom = 1;
  let drag = null;
  let lastInteraction = 0;
  let guidedCamera = true;

  // A local studio environment gives ivory, metallic trims and paper edges
  // readable reflections without remote HDRIs or colourful sci-fi lighting.
  const environmentScene = new THREE.Scene();
  environmentScene.background = new THREE.Color(0x18171a);
  const environmentPanels = [];
  function environmentPanel(width, height, color, intensity, position) {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(intensity),
      side: THREE.DoubleSide,
    });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    panel.position.set(...position);
    panel.lookAt(0, 1, 0);
    environmentScene.add(panel);
    environmentPanels.push(panel);
  }
  environmentPanel(7, 7, 0xfff4df, 4, [-5, 8, 5]);
  environmentPanel(4, 7, 0xe5e9ff, 2, [6, 4, 2]);
  environmentPanel(3, 8, 0xffffff, 5, [1, 5, -7]);
  if (initialProject === 50) {
    // Broad front softboxes reveal the observatory's machined brass faces;
    // the usual overhead studio leaves these near-vertical metals black.
    environmentScene.background.setHex(0x414b5b);
    environmentPanel(8, 3, 0xffe4bf, 2.8, [-1, 3.6, 9]);
    environmentPanel(5, 2, 0xc9e7ff, 1.5, [5, 1, 6]);
  }
  if (initialProject === 57) {
    environmentPanel(7, 3, 0xffe6c0, 2.4, [-2, 4, 7]);
    environmentPanel(3, 5, 0xccfff0, 1.8, [5, 3, 3]);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  let environment;
  try {
    environment = pmrem.fromScene(environmentScene, 0.08);
  } catch (error) {
    events.abort();
    renderer.dispose();
    onError(error);
    throw error;
  } finally {
    environmentPanels.forEach(panel => {
      panel.geometry.dispose();
      panel.material.dispose();
    });
    pmrem.dispose();
  }
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.35;

  const hemisphere = new THREE.HemisphereLight(0xf8f3e9, 0x29242e, 0.85);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight(0xfff3de, 2.4);
  key.position.set(-5, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -7,
    right: 7,
    top: 8,
    bottom: -7,
    near: 0.5,
    far: 30,
  });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 4;
  key.target.position.set(0, 1, 0);
  scene.add(key, key.target);

  const fill = new THREE.DirectionalLight(0xd4deff, 0.8);
  fill.position.set(6, 4, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfff8e8, 2.2);
  rim.position.set(2, 6, -6);
  scene.add(rim);

  // One physical display base unifies all three artifacts. It stays neutral so
  // the original book red and cobalt paths remain the scene's colour accents.
  const plinth = new THREE.Group();
  scene.add(plinth);
  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0x09080a,
    roughness: 0.86,
    metalness: 0.08,
    envMapIntensity: 0.16,
  });
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0x070608,
    roughness: 0.76,
    metalness: 0.2,
    envMapIntensity: 0.15,
  });
  const topDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.18, 96),
    topMaterial,
  );
  topDisc.position.y = -0.09;
  topDisc.receiveShadow = true;
  topDisc.castShadow = true;
  plinth.add(topDisc);

  const lowerDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.15, 96),
    sideMaterial,
  );
  lowerDisc.position.y = -0.245;
  lowerDisc.receiveShadow = true;
  lowerDisc.castShadow = true;
  plinth.add(lowerDisc);
  const seam = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.006, 6, 128),
    new THREE.MeshStandardMaterial({ color: 0x494341, metalness: 0.4, roughness: 0.65, envMapIntensity: 0.2 }),
  );
  seam.rotation.x = Math.PI / 2;
  seam.position.y = -0.181;
  plinth.add(seam);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshBasicMaterial({ color: BACKGROUND, toneMapped: false, fog: false }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.324;
  scene.add(floor);

  // Separate shadow reception from the unlit backdrop: studio illumination
  // should shape the artifact, never turn the page's black floor into grey.
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.32, toneMapped: false, fog: false, depthWrite: false }),
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = -0.322;
  contactShadow.receiveShadow = true;
  scene.add(contactShadow);

  // The paper exhibit is photographed under a broad studio source. A soft
  // contact footprint avoids a hard, directional silhouette on the backdrop.
  const footprintSize = 192, footprintPixels = new Uint8Array(footprintSize * footprintSize * 4);
  for (let y = 0; y < footprintSize; y++) for (let x = 0; x < footprintSize; x++) {
    const dx = Math.abs((x / (footprintSize - 1) - .5) * 8) - 2.8;
    const dz = Math.abs((y / (footprintSize - 1) - .5) * 6.4) - 1.91;
    const outside = Math.hypot(Math.max(dx, 0), Math.max(dz, 0));
    footprintPixels[(y * footprintSize + x) * 4 + 3] = Math.round(255 * Math.exp(-outside * outside / .095));
  }
  const footprintTexture = new THREE.DataTexture(footprintPixels, footprintSize, footprintSize, THREE.RGBAFormat);
  footprintTexture.magFilter = footprintTexture.minFilter = THREE.LinearFilter;
  footprintTexture.needsUpdate = true;
  const paperContact = new THREE.Mesh(new THREE.PlaneGeometry(8, 6.4), new THREE.MeshBasicMaterial({
    map: footprintTexture, transparent: true, opacity: .23, depthWrite: false, toneMapped: false,
  }));
  paperContact.rotation.x = -Math.PI / 2;
  paperContact.position.set(.10, -.32, .04);
  paperContact.visible = false;
  scene.add(paperContact);

  function canRender() {
    return active && inViewport && !document.hidden && !disposed && !failed;
  }

  function stopFrames() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    lastFrameTime = 0;
  }

  function reportError(error) {
    failed = true;
    stopFrames();
    onError(error);
  }

  function requestFrame() {
    if (canRender() && frameId === null) frameId = requestAnimationFrame(render);
  }

  function applyArtifactLighting() {
    const palette = THEMES[currentTheme];
    const scale = currentModel?.userData.studioLightScale ?? 1;
    const atlas = currentModel?.userData.studioProfile === 'atlas';
    const paper = currentModel?.userData.studioProfile === 'paper';
    const cosmos = currentModel?.userData.studioProfile === 'cosmos';
    const magistock = currentModel?.userData.studioProfile === 'magistock';
    const mapper = currentModel?.userData.studioProfile === 'mapper' || magistock;
    floor.visible = !(cosmos || mapper || atlas);
    if (cosmos || mapper || atlas) {
      scene.background = null;
      scene.fog.color.setHex(atlas ? 0x0c1724 : mapper ? 0x071c17 : 0x100b22);
      renderer.setClearColor(atlas ? 0x0c1724 : mapper ? 0x071c17 : 0x100b22, 0);
    } else {
      scene.background = new THREE.Color(palette.background);
      scene.fog.color.setHex(palette.background);
      renderer.setClearColor(palette.background, 1);
    }
    key.color.setHex(cosmos ? 0xffd5b0 : 0xfff3de);
    fill.color.setHex(cosmos ? 0xb69aff : 0xd4deff);
    rim.color.setHex(cosmos ? 0x9a8aff : 0xfff8e8);
    paperContact.visible = paper && currentModel?.userData.contactFootprint !== false;
    paperContact.scale.set(1, 1, 1);
    paperContact.material.opacity = currentTheme === 'light' ? .23 : .55;
    // The aerial crow uses its own soft footprint below the blue drum, avoiding
    // an oversized wing silhouette on the otherwise seamless exhibit backdrop.
    contactShadow.material.opacity = atlas || mapper || cosmos || paper || currentModel?.userData.studioProfile === 'crow' ? 0 : palette.shadowOpacity;
    hemisphere.intensity = palette.hemisphere * scale;
    key.intensity = palette.key * scale;
    fill.intensity = palette.fill * scale;
    rim.intensity = palette.rim * scale;
    scene.environmentIntensity = palette.environment * scale;
    renderer.toneMappingExposure = palette.exposure;
    key.position.set(...(paper ? [-5, 6, 2.5] : [-5, 9, 7]));
    key.shadow.normalBias = paper ? .006 : .035;
    key.shadow.bias = paper ? -.00008 : -.00025;
    key.shadow.radius = paper ? 3 : 4;
    Object.assign(key.shadow.camera, paper
      ? { left: -4.5, right: 4.5, top: 5.5, bottom: -4.5 }
      : { left: -7, right: 7, top: 8, bottom: -7 });
    key.shadow.camera.updateProjectionMatrix();
    if (paper) {
      hemisphere.intensity = .38;
      key.intensity = 2.8;
      fill.intensity = .22;
      rim.intensity = .7;
      scene.environmentIntensity = .6;
      renderer.toneMappingExposure = 1.02;
    }
    if (cosmos) {
      hemisphere.intensity = .65; hemisphere.color.setHex(0xb9a4e0);
      hemisphere.groundColor.setHex(0x27203d);
      key.intensity = 2.0; fill.intensity = 1.0; rim.intensity = 2.8;
      scene.environmentIntensity = .42;
      renderer.toneMappingExposure = 1.05;
    } else { hemisphere.color.setHex(0xf8f3e9); }
    if (currentModel?.userData.artifactId === 66) {
      const night = currentTheme === 'dark';
      floor.visible = false;
      scene.background = null;
      renderer.setClearColor(night ? 0x11191f : 0xf1e8da, 0);
      hemisphere.color.setHex(night ? 0xbacde6 : 0xfff7e7);
      hemisphere.groundColor.setHex(night ? 0x292c38 : 0x9b8d76);
      hemisphere.intensity = night ? .27 : .6;
      key.color.setHex(night ? 0xffd0a0 : 0xfff0d9);
      key.intensity = night ? 1.1 : 2.5;
      fill.color.setHex(night ? 0x9dbfe8 : 0xe2eaff);
      fill.intensity = night ? .34 : .48;
      rim.intensity = night ? 1.1 : .9;
      scene.environmentIntensity = night ? .30 : .55;
      renderer.toneMappingExposure = night ? .98 : 1.02;
    }
    if (currentModel?.userData.artifactId === 76) {
      // Daylight on warm stone; at night, amber key light and a cool skyline.
      // Keep the paper profile's tight shadow framing in both themes.
      const night = currentTheme === 'dark';
      hemisphere.color.setHex(night ? 0xc4d5ed : 0xfff8ed);
      hemisphere.groundColor.setHex(night ? 0x38312c : 0x9a8e76);
      hemisphere.intensity = night ? .28 : .8;
      key.color.setHex(night ? 0xffd29a : 0xfff1d9);
      key.intensity = night ? 1.1 : 2.65;
      fill.color.setHex(night ? 0x9fc9ed : 0xdceaff);
      fill.intensity = night ? .4 : .65;
      rim.color.setHex(night ? 0xffd6a2 : 0xfff7e5);
      rim.intensity = night ? 1.35 : 1.05;
      scene.environmentIntensity = night ? .3 : .55;
      renderer.toneMappingExposure = night ? .96 : .98;
    }
    if (mapper) {
      hemisphere.color.setHex(0xc7dfca); hemisphere.groundColor.setHex(0x112b23);
      hemisphere.intensity = .8; key.intensity = 3.1; fill.intensity = 1.3; rim.intensity = 2.1;
      key.color.setHex(0xffe2b7); fill.color.setHex(0xb5e4d0); rim.color.setHex(0xffe9c9);
      key.position.set(-3, 7, 5); scene.environmentIntensity = .68;
      renderer.toneMappingExposure = 1.03;
      key.shadow.normalBias = .008; key.shadow.bias = -.00008;
    }
    if (magistock) {
      hemisphere.color.setHex(0xc5ddf3); hemisphere.groundColor.setHex(0x142135);
      key.color.setHex(0xffdfb8); fill.color.setHex(0x98c9f3); rim.color.setHex(0xb6e7ff);
      key.intensity = 3.5; fill.intensity = 1.2; rim.intensity = 2.5;
      scene.environmentIntensity = 1.3; renderer.toneMappingExposure = 1.1;
    }
    if (atlas) {
      hemisphere.color.setHex(0xc4d7ee); hemisphere.groundColor.setHex(0x17263b);
      hemisphere.intensity=.32; key.intensity=1.65; fill.intensity=.38; rim.intensity=1.65;
      key.color.setHex(0xffdfb0); fill.color.setHex(0xa5c2ef); rim.color.setHex(0xffcb83);
      key.position.set(-5,6,2.5); scene.environmentIntensity=.28; renderer.toneMappingExposure=1.0;
      key.shadow.normalBias=.006; key.shadow.bias=-.00008; key.shadow.radius=3;
    }
    if (currentModel?.userData.studioProfile === 'nightlife') {
      // The same architecture has a daylight environment and an amber night scene.
      const night=currentTheme==='dark';
      if(night){scene.background=new THREE.Color(0x202127);renderer.setClearColor(0x202127,1);}
      hemisphere.color.setHex(night?0xb5cadb:0xe6f1ff);
      hemisphere.groundColor.setHex(night?0x594329:0xb6a892);
      hemisphere.intensity=night?.28:.85;
      key.intensity=night?1.05:2.65;fill.intensity=night?.35:.75;rim.intensity=night?1.35:1.05;
      key.color.setHex(night?0xffd8a7:0xfff3df);
      fill.color.setHex(night?0xa7c8de:0xd6eaff);rim.color.setHex(night?0xffb76d:0xffffff);
      key.position.set(...(night?[-3.5,6,4]:[-4.5,8,5]));
      scene.environmentIntensity=night?.65:.75;
      renderer.toneMappingExposure=night?1.08:1.0;
      key.shadow.normalBias=.008;key.shadow.bias=-.00008;key.shadow.radius=4;
      Object.assign(key.shadow.camera,{left:-5,right:5,top:5.5,bottom:-4.5});
      key.shadow.camera.updateProjectionMatrix();
    }
    if (currentModel?.userData.studioProfile === 'bunny') {
      const night=currentTheme==='dark';
      floor.visible=false;scene.background=null;
      renderer.setClearColor(night?0x102623:0xe5ead8,0);contactShadow.material.opacity=0;
      hemisphere.color.setHex(0xe5eedb);hemisphere.groundColor.setHex(night?0x334839:0x929a73);hemisphere.intensity=night?.35:.55;
      key.color.setHex(0xffecd4);key.position.set(-3,6,5);key.intensity=night?1.9:2.3;
      fill.color.setHex(0xc8d4e5);fill.intensity=.40;
      rim.color.setHex(0xffce85);rim.position.set(3,4,-3);rim.intensity=night?2.1:1.7;
      scene.environmentIntensity=.5;renderer.toneMappingExposure=1.02;
      key.shadow.normalBias=.006;key.shadow.bias=-.00008;
      Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-3});key.shadow.camera.updateProjectionMatrix();
    }
    if (['medivoice', 'scaleup'].includes(currentModel?.userData.studioProfile)) {
      const night = currentTheme === 'dark';
      floor.visible = false;
      scene.background = null;
      renderer.setClearColor(night ? 0x0c201f : 0xf0ede4, 0);
      contactShadow.material.opacity = 0;
      hemisphere.color.setHex(0xd9eadd);
      hemisphere.groundColor.setHex(night ? 0x263c35 : 0x9c9c85);
      hemisphere.intensity = night ? .28 : .45;
      key.color.setHex(0xffe3bc); key.intensity = night ? 2.3 : 2.65;
      fill.color.setHex(0xc0e4dd); fill.intensity = .42;
      rim.color.setHex(0xffe5bd); rim.intensity = 1.7;
      key.position.set(-3.5, 6, 5);
      scene.environmentIntensity = .8;
      renderer.toneMappingExposure = 1.02;
      key.shadow.normalBias = .006; key.shadow.bias = -.00008;
      Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 5, bottom: -4 });
      key.shadow.camera.updateProjectionMatrix();
    }
    if (currentModel?.userData.studioProfile === 'coastal') {
      // Warm broad studio light matches the miniature's baked soft key.
      const dark = currentTheme === 'dark';
      hemisphere.color.setHex(0xfff0d8); hemisphere.groundColor.setHex(0x60513c);
      hemisphere.intensity = .48;
      key.color.setHex(0xffe5bf); key.position.set(-5, 6, 2.5); key.intensity = 2.7;
      fill.color.setHex(0xd5e7ec); fill.intensity = .32;
      rim.color.setHex(0xffdfaf); rim.intensity = .95;
      scene.environmentIntensity = .55; renderer.toneMappingExposure = 1.04;
      key.shadow.normalBias = .006; key.shadow.bias = -.00008;
      Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -4 });
      key.shadow.camera.updateProjectionMatrix();
      contactShadow.material.opacity = 0;
      paperContact.visible = true; paperContact.material.opacity = dark ? .55 : .22;
      paperContact.scale.set(1.23, 1.25, 1);
    }
    if (currentModel?.userData.studioProfile === 'tempeh') {
      hemisphere.intensity = .52;
      hemisphere.groundColor.setHex(0x3d2b19);
      key.color.setHex(0xffe4b7); key.position.set(-3.5, 6, 4);
      key.intensity = 3.1;
      fill.color.setHex(0xe8e6dc); fill.intensity = .48;
      rim.color.setHex(0xffdfac); rim.intensity = 1.1;
      scene.environmentIntensity = .55;
      renderer.toneMappingExposure = 1.02;
      contactShadow.material.opacity = .16;
      key.shadow.normalBias = .008; key.shadow.bias = -.00008;
      Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4 });
      key.shadow.camera.updateProjectionMatrix();
    }
    if (currentModel?.userData.studioProfile === 'memory') {
      floor.visible = false; scene.background = null;
      renderer.setClearColor(0x0a1322, 0); contactShadow.material.opacity = 0;
      hemisphere.color.setHex(0xd8e2ec); hemisphere.groundColor.setHex(0x172237); hemisphere.intensity = .48;
      key.color.setHex(0xffe2b4); key.intensity = 3.0; key.position.set(-3.8, 5.5, 5);
      fill.color.setHex(0xaccfff); fill.intensity = .65;
      rim.color.setHex(0xffdfaa); rim.intensity = 2; rim.position.set(2, 5, -4);
      scene.environmentIntensity = .72; renderer.toneMappingExposure = 1.05;
      key.shadow.normalBias = .006; key.shadow.bias = -.00006;
      Object.assign(key.shadow.camera, { left: -4, right: 4, top: 5, bottom: -3.5 });
      key.shadow.camera.updateProjectionMatrix();
    }
    if (currentModel?.userData.studioProfile === 'hedera') {
      floor.visible = false; scene.background = null;
      renderer.setClearColor(0x08110e, 0); contactShadow.material.opacity = 0;
      hemisphere.color.setHex(0xd7e4db); hemisphere.groundColor.setHex(0x101914); hemisphere.intensity = .30;
      key.color.setHex(0xffe3b5); key.intensity = 2.5; key.position.set(-3.8, 5, 4.5);
      fill.color.setHex(0xb8d5e0); fill.intensity = .42;
      rim.color.setHex(0x92ffc8); rim.intensity = 2.1; rim.position.set(3, 4, -4);
      scene.environmentIntensity = .48; renderer.toneMappingExposure = .94;
      key.shadow.normalBias = .004; key.shadow.bias = -.00005; key.shadow.radius = 4;
      Object.assign(key.shadow.camera, { left: -4, right: 4, top: 5, bottom: -4 });
      key.shadow.camera.updateProjectionMatrix();
    }
    if (currentModel?.userData.studioProfile === 'astrodegen') {
      floor.visible = false; scene.background = null;
      renderer.setClearColor(0x191612, 0); contactShadow.material.opacity = 0;
      hemisphere.color.setHex(0xfff4e3); hemisphere.groundColor.setHex(0x554936); hemisphere.intensity = .55;
      key.color.setHex(0xffe7bd); key.intensity = 2.6; key.position.set(-3.8, 6, 4);
      fill.color.setHex(0xe3e9fa); fill.intensity = .55;
      rim.color.setHex(0xfff0d5); rim.intensity = 1.5; rim.position.set(2, 5, -4);
      scene.environmentIntensity = .32; renderer.toneMappingExposure = .96;
      key.shadow.normalBias = .004; key.shadow.bias = -.00005;
      Object.assign(key.shadow.camera, { left: -4, right: 4, top: 5, bottom: -4 });
      key.shadow.camera.updateProjectionMatrix();
    }
    if (currentModel?.userData.studioProfile === 'two-rivers') {
      floor.visible = false; scene.background = null;
      renderer.setClearColor(0x071c20, 0); contactShadow.material.opacity = 0;
      hemisphere.color.setHex(0xd4e7dc); hemisphere.groundColor.setHex(0x253c32); hemisphere.intensity = .55;
      key.color.setHex(0xffe3b2); key.intensity = 3.1; key.position.set(-4, 6, 5);
      fill.color.setHex(0xa4d7df); fill.intensity = .6;
      rim.color.setHex(0xa3edcd); rim.intensity = 2.3; rim.position.set(3, 5, -4);
      scene.environmentIntensity = .65; renderer.toneMappingExposure = 1.06;
      key.shadow.normalBias = .004; key.shadow.bias = -.00005; key.shadow.radius = 4;
      Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -4 });
      key.shadow.camera.updateProjectionMatrix();
    }
    if (currentModel?.userData.studioProfile === 'vibewater') {
      floor.visible = false; scene.background = null;
      renderer.setClearColor(currentTheme === 'dark' ? 0x17191a : 0xe4dfd3, 0);
      contactShadow.material.opacity = 0;
      hemisphere.intensity = .6; hemisphere.groundColor.setHex(0x4a4137);
      key.color.setHex(0xffe8c4); key.intensity = 2.7; key.position.set(-4, 6, 5);
      fill.color.setHex(0xd4e4f1); fill.intensity = .65; rim.intensity = 1.5;
      scene.environmentIntensity = .55; renderer.toneMappingExposure = 1.02;
      key.shadow.normalBias = .006; key.shadow.bias = -.00008; key.shadow.radius = 5;
      Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 5, bottom: -4 });
      key.shadow.camera.updateProjectionMatrix();
    }
    if (currentModel?.userData.studioProfile === 'invitation') {
      floor.visible = false; scene.background = null;
      renderer.setClearColor(currentTheme === 'dark' ? 0x1d201d : 0xeee7da, 0);
      contactShadow.material.opacity = 0;
      hemisphere.intensity = .44; hemisphere.groundColor.setHex(0x514431);
      key.color.setHex(0xffe8c6); key.intensity = 2.8; key.position.set(-3.8, 6, 5);
      fill.color.setHex(0xe4e8e3); fill.intensity = .48;
      rim.color.setHex(0xffd99c); rim.intensity = 1.6;
      scene.environmentIntensity = .50; renderer.toneMappingExposure = 1.05;
      key.shadow.normalBias = .003; key.shadow.bias = -.00004; key.shadow.radius = 5;
      Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 5, bottom: -4 });
      key.shadow.camera.updateProjectionMatrix();
    }
    if (currentModel?.userData.studioProfile === 'jollycards') {
      floor.visible = false; scene.background = null;
      renderer.setClearColor(currentTheme === 'dark' ? 0x1d1918 : 0xf5eddf, 0);
      contactShadow.material.opacity = 0;
      hemisphere.intensity = .55;
      hemisphere.groundColor.setHex(0x46301d);
      key.color.setHex(0xffe3b7); key.intensity = 2.8; key.position.set(-3.5, 6, 5);
      fill.color.setHex(0xe6e3da); fill.intensity = .7; rim.intensity = 1.2;
      scene.environmentIntensity = .6; renderer.toneMappingExposure = 1.03;
      key.shadow.normalBias = .006; key.shadow.bias = -.00008; key.shadow.radius = 5;
      Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -3 });
      key.shadow.camera.updateProjectionMatrix();
    }
    if (currentModel?.userData.studioProfile === 'fitstake') {
      hemisphere.intensity = .7;
      key.intensity = 2.6;
      fill.intensity = .7;
      rim.intensity = 1.8;
      scene.environmentIntensity = .55;
      renderer.toneMappingExposure = 1;
      key.shadow.normalBias = .009;
      key.shadow.radius = 5;
    }
    if (currentModel?.userData.studioProfile === 'pal') {
      // Warm side lighting keeps the carved stone and cloth relief legible.
      hemisphere.intensity = .55 * scale;
      key.intensity = 2.9 * scale;
      fill.intensity = .42 * scale;
      rim.intensity = 1.1 * scale;
      scene.environmentIntensity = .4 * scale;
      key.position.set(-3.5, 7, 5);
      key.shadow.normalBias = .008;
      key.shadow.bias = -.00008;
      key.shadow.radius = 3;
      Object.assign(key.shadow.camera, { left: -4.2, right: 4.2, top: 4.8, bottom: -4.2 });
      key.shadow.camera.updateProjectionMatrix();
      renderer.toneMappingExposure = currentTheme === 'dark' ? 1.05 : .97;
    }
  }

  /** Change only the studio presentation, never the artifact or camera state. */
  function setTheme(name) {
    if (disposed || failed) return;
    if (!Object.hasOwn(THEMES, name)) throw new RangeError(`Unknown gallery theme: ${name}`);
    if (currentTheme === name) return;
    const palette = THEMES[name];
    currentTheme = name;
    if (scene.background) scene.background.setHex(palette.background);
    scene.fog.color.setHex(palette.background);
    renderer.setClearColor(palette.background, 1);
    floor.material.color.setHex(palette.background);
    topMaterial.color.setHex(palette.plinthTop);
    sideMaterial.color.setHex(palette.plinthSide);
    seam.material.color.setHex(palette.plinthSeam);
    topMaterial.metalness = name === 'light' ? 0.02 : 0.08;
    sideMaterial.metalness = name === 'light' ? 0.05 : 0.2;
    seam.material.metalness = name === 'light' ? 0.12 : 0.4;
    renderer.toneMappingExposure = palette.exposure;
    scene.environmentIntensity = palette.environment;
    hemisphere.intensity = palette.hemisphere;
    hemisphere.groundColor.setHex(palette.groundLight);
    key.intensity = palette.key;
    fill.intensity = palette.fill;
    rim.intensity = palette.rim;
    contactShadow.material.opacity = palette.shadowOpacity;
    currentModel?.userData.setTheme?.(name);
    applyArtifactLighting();
    // Paused views receive one fresh frame. Hidden/inactive views wait until
    // they are visible again; selection, orbit, and pause remain untouched.
    requestFrame();
  }

  function updateCamera() {
    const idle = !paused && !reducedMotion.matches && !drag && performance.now() - lastInteraction > 1800;
    const orbitOffset = idle && currentModel?.userData.autoOrbit !== false ? Math.sin(elapsed * 0.4) * 0.14 : 0;
    const cue = guidedCamera ? currentModel?.userData.cameraCue : null;
    const angle = yaw + orbitOffset + (cue?.yaw ?? 0);
    const shotDistance = distance * (cue?.distance ?? 1) / zoom;
    const shotTarget = target.clone().add(new THREE.Vector3(cue?.x ?? 0, cue?.y ?? 0, cue?.z ?? 0));
    camera.position.set(
      shotTarget.x + Math.sin(angle) * Math.cos(elevation) * shotDistance,
      shotTarget.y + Math.sin(elevation) * shotDistance,
      shotTarget.z + Math.cos(angle) * Math.cos(elevation) * shotDistance,
    );
    camera.lookAt(shotTarget);
  }

  function render(time) {
    frameId = null;
    if (!canRender()) return;
    const frameDelta = lastFrameTime ? Math.max(0, (time - lastFrameTime) / 1000) : 0;
    const delta = Math.min(frameDelta, 0.05);
    lastFrameTime = time;
    // Seek-safe performances keep wall-clock pacing at low frame rates. Physics
    // still uses bounded steps; stopFrames resets the clock on pause/visibility changes.
    if (!paused && !reducedMotion.matches && !drag) elapsed += currentModel?.userData.realTimeAnimation ? frameDelta : delta;
    updateCamera();
    try {
      currentModel?.userData.manipulation?.update(delta, elapsed, paused || reducedMotion.matches);
      currentModel?.userData.animate?.(elapsed);
      const interaction=currentModel?.userData.interactionState;
      if(interaction && container.dataset.interaction!==interaction){
        container.dataset.interaction=interaction;
        const status=container.querySelector('[data-manipulation-status]');
        if(status)status.textContent={held:'You’ve got the bunny. Release to let go.',falling:'Letting go…',landing:'A soft landing.',resting:'Pick up the bunny. Let it go. Let it rest.'}[interaction];
      }
      updateCamera();
      const story = currentModel?.userData.story ?? null;
      const nextStoryKey = story ? JSON.stringify([story.step, story.title, story.detail, story.tone]) : null;
      if (storyKey !== nextStoryKey) {
        storyKey = nextStoryKey;
        onStoryChange(story);
      }
      if(currentModel?.userData.studioProfile==='nightlife'&&currentTheme==='dark'){
        nightlifePost??=createNightlifePost(THREE,renderer);
        nightlifePost.render(scene,camera);
      }else renderer.render(scene, camera);
      if (currentModel?.userData.annotations) {
        const points = currentModel.userData.annotations.map(({ id, position }) => {
          const point = new THREE.Vector3(...position).applyMatrix4(currentModel.matrixWorld).project(camera);
          return { id, x: (point.x + 1) * 50, y: (1 - point.y) * 50, visible: point.z > -1 && point.z < 1 };
        });
        onAnnotations(points);
      }
    } catch (error) {
      reportError(error);
      return;
    }
    if ((!paused && !reducedMotion.matches) || currentModel?.userData.needsInteractionFrame) requestFrame();
  }

  function fitCamera(remeasure = false) {
    if (!currentModel) return;
    const showDisplayBase = currentModel.userData.displayBase !== false;
    plinth.visible = showDisplayBase;
    if (remeasure || size.lengthSq() === 0) {
      bounds.setFromObject(currentModel);
      if (currentModel.userData.framingBounds?.isBox3) {
        currentModel.updateWorldMatrix(true, false);
        bounds.union(currentModel.userData.framingBounds.clone().applyMatrix4(currentModel.matrixWorld));
      }
      bounds.getSize(size);
    }
    const groundLevel = currentModel.userData.groundLevel;
    floor.position.y = Number.isFinite(groundLevel) ? currentModel.position.y + groundLevel - .012 : -.324;
    contactShadow.position.y = floor.position.y + .002;
    paperContact.position.y = floor.position.y + .003;
    const radius = Math.max(Math.hypot(size.x, size.z) * 0.5 + 0.13, 3.1);
    topDisc.scale.set(radius, 1, radius);
    lowerDisc.scale.set(radius * 1.028, 1, radius * 1.028);
    seam.scale.setScalar(radius * 1.013);

    // An asymmetric miniature can provide component bounds instead of fitting
    // the empty upper corners of one large box. Older artifacts keep that box.
    const points = [];
    if (currentModel.userData.framingPoints?.length) {
      currentModel.updateWorldMatrix(true, false);
      for (const point of currentModel.userData.framingPoints) points.push(point.clone().applyMatrix4(currentModel.matrixWorld));
    } else {
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) points.push({ x, y, z });
        }
      }
    }
    for (let i = 0; showDisplayBase && i < 64; i += 1) {
      const angle = (i / 64) * Math.PI * 2;
      for (const y of [-0.32, 0]) {
        points.push({ x: Math.cos(angle) * radius * 1.03, y, z: Math.sin(angle) * radius * 1.03 });
      }
    }
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const sidePadding = Math.min(28, width * 0.07);
    const topPadding = Math.min(30, height * 0.08);
    const bottomPadding = Math.min(34, height * 0.09);
    const tanVertical = Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const tanHorizontal = tanVertical * camera.aspect;
    const horizontalLimit = Math.max(1 - (2 * sidePadding) / width, 0.5);
    const topLimit = Math.max(1 - (2 * topPadding) / height, 0.5);
    const bottomLimit = Math.max(1 - (2 * bottomPadding) / height, 0.5);
    const sinElevation = Math.sin(elevation);
    const cosElevation = Math.cos(elevation);

    function distanceForTarget(targetY) {
      let required = 1;
      // Include the full automatic sway so the larger view never clips.
      for (const angle of [yaw - 0.14, yaw, yaw + 0.14]) {
        const sinYaw = Math.sin(angle);
        const cosYaw = Math.cos(angle);
        for (const point of points) {
          const dy = point.y - targetY;
          const viewX = point.x * cosYaw - point.z * sinYaw;
          const viewY = -point.x * sinYaw * sinElevation + dy * cosElevation - point.z * cosYaw * sinElevation;
          const towardCamera = point.x * sinYaw * cosElevation + dy * sinElevation + point.z * cosYaw * cosElevation;
          const horizontalDistance = Math.abs(viewX) / (tanHorizontal * horizontalLimit);
          const verticalDistance = viewY >= 0
            ? viewY / (tanVertical * topLimit)
            : -viewY / (tanVertical * bottomLimit);
          required = Math.max(required, towardCamera + horizontalDistance, towardCamera + verticalDistance);
        }
      }
      return required;
    }

    // The maximum of the perspective constraints is convex in target height.
    // Find the tightest fit, then prefer the bounds' midpoint when it is equally
    // good (wide objects otherwise create an arbitrary flat optimum).
    let low = -0.32;
    let high = bounds.max.y;
    for (let i = 0; i < 22; i += 1) {
      const first = low + (high - low) / 3;
      const second = high - (high - low) / 3;
      if (distanceForTarget(first) < distanceForTarget(second)) high = second;
      else low = first;
    }
    let targetY = (low + high) / 2;
    let fittedDistance = distanceForTarget(targetY);
    const midpoint = (bounds.max.y - 0.32) / 2;
    const midpointDistance = distanceForTarget(midpoint);
    if (midpointDistance <= fittedDistance * 1.002) {
      targetY = midpoint;
      fittedDistance = midpointDistance;
    }
    target.set(0, targetY, 0);
    distance = fittedDistance * 1.008;
    camera.far = Math.max(distance + 35, 80);
    camera.updateProjectionMatrix();
    updateCamera();
  }

  function resize() {
    if (disposed) return;
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    fitCamera();
    requestFrame();
  }

  function setProject(id) {
    if (disposed || failed) return;
    const numericId = Number(id);
    if (!projectIds.has(numericId)) throw new RangeError(`Unknown gallery artifact: ${id}`);
    if (currentId === numericId) return;
    let model = models.get(numericId);
    if (!model) {
      try {
        model = artifactFactory(THREE, numericId);
        if (!model?.isObject3D) throw new TypeError('createArtifact must return a Three.js object.');
      } catch (error) {
        reportError(error);
        throw error;
      }
      model.traverse(object => {
        if (object.isMesh) {
          object.castShadow = !object.userData.noShadow;
          object.receiveShadow = !object.userData.noShadow && !object.userData.noReceiveShadow;
        }
      });
      model.position.y = 0.025;
      model.userData.requestRender = requestFrame;
      models.set(numericId, model);
      scene.add(model);
    }
    if (currentModel) currentModel.visible = false;
    currentModel = model;
    currentId = numericId;
    zoom = 1;
    model.visible = true;
    model.userData.setTheme?.(currentTheme);
    applyArtifactLighting();
    yaw = Number.isFinite(currentModel?.userData.initialYaw) ? currentModel.userData.initialYaw : INITIAL_YAW;
    elevation = Number.isFinite(currentModel?.userData.initialElevation) ? currentModel.userData.initialElevation : INITIAL_ELEVATION;
    elapsed = 0;
    fitCamera(true);
    requestFrame();
  }

  function resetView() {
    zoom = 1;
    cancelManipulation();
    currentModel?.userData.manipulation?.reset();
    guidedCamera = false;
    yaw = Number.isFinite(currentModel?.userData.initialYaw) ? currentModel.userData.initialYaw : INITIAL_YAW;
    elevation = Number.isFinite(currentModel?.userData.initialElevation) ? currentModel.userData.initialElevation : INITIAL_ELEVATION;
    if (!currentModel?.userData.cameraCue) elapsed = 0;
    lastInteraction = performance.now();
    fitCamera();
    requestFrame();
  }

  function zoomBy(factor) {
    if (!Number.isFinite(factor) || factor <= 0) return zoom;
    zoom = clamp(zoom * factor, 1, 2.2);
    lastInteraction = performance.now();
    updateCamera();
    requestFrame();
    return zoom;
  }

  function setStoryStep(index) {
    guidedCamera = true;
    currentModel?.userData.setStep?.(index, elapsed);
    requestFrame();
  }

  function setActive(value) {
    if (disposed || failed) return;
    active = Boolean(value);
    if (active) {
      resize();
      requestFrame();
    } else {
      cancelManipulation();
      stopFrames();
    }
  }

  function setPaused(value) {
    paused = Boolean(value);
    stopFrames();
    requestFrame();
  }

  const previousTouchAction = canvas.style.touchAction;
  canvas.style.touchAction = Number(initialProject)===49 ? 'none' : 'pan-y';
  if (!canvas.hasAttribute('tabindex')) canvas.tabIndex = 0;
  if (!canvas.hasAttribute('aria-label')) {
    canvas.setAttribute('aria-label', 'Interactive 3D project artifact. Drag to rotate, use arrow keys to orbit, or press Home to reset.');
  }

  const pickRay=new THREE.Raycaster(),pickPointer=new THREE.Vector2();
  function rayFromEvent(event){
    const rect=canvas.getBoundingClientRect();
    pickPointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    camera.updateMatrixWorld();currentModel?.updateMatrixWorld(true);pickRay.setFromCamera(pickPointer,camera);
  }
  function cancelManipulation(){
    const pointerId=drag?.id;
    currentModel?.userData.manipulation?.release(elapsed,true);
    drag=null;canvas.style.cursor='grab';
    if(pointerId!==undefined&&canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);
  }
  canvas.addEventListener('pointerdown', event => {
    if (!active || drag || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const manipulation=currentModel?.userData.manipulation;
    if(manipulation){
      rayFromEvent(event);
      const hit=pickRay.intersectObject(manipulation.target,true)[0];
      if(hit){
        event.preventDefault();
        manipulation.begin(elapsed);currentModel.updateMatrixWorld(true);
        const center=manipulation.target.getWorldPosition(new THREE.Vector3());
        drag={id:event.pointerId,kind:'bunny',plane:new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()),hit.point),offset:center.sub(hit.point)};
        canvas.setPointerCapture(event.pointerId);canvas.focus({preventScroll:true});canvas.style.cursor='grabbing';requestFrame();return;
      }
    }
    guidedCamera = false;
    currentModel?.userData.interact?.(elapsed);
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originX: event.clientX,
      originY: event.clientY,
      touch: event.pointerType === 'touch',
      captured: event.pointerType !== 'touch',
    };
    lastInteraction = performance.now();
    if (drag.captured) {
      canvas.setPointerCapture(event.pointerId);
      canvas.focus({ preventScroll: true });
    }
  }, { signal: events.signal });

  canvas.addEventListener('pointermove', event => {
    if (!drag){
      if(currentModel?.userData.manipulation){rayFromEvent(event);canvas.style.cursor=pickRay.intersectObject(currentModel.userData.manipulation.target,true).length?'grab':'move';}
      return;
    }
    if (drag.id !== event.pointerId) return;
    if(drag.kind==='bunny'){
      event.preventDefault();rayFromEvent(event);
      const point=pickRay.ray.intersectPlane(drag.plane,new THREE.Vector3());
      if(point)currentModel.userData.manipulation.move(currentModel.worldToLocal(point.add(drag.offset)),elapsed);
      requestFrame();return;
    }
    if (drag.touch && !drag.captured) {
      const dx = Math.abs(event.clientX - drag.originX);
      const dy = Math.abs(event.clientY - drag.originY);
      if (dy > 8 && dy > dx) {
        drag = null;
        return;
      }
      if (dx < 8) return;
      canvas.setPointerCapture(event.pointerId);
      drag.captured = true;
    }
    if (event.cancelable) event.preventDefault();
    currentModel?.userData.interact?.(elapsed);
    const scale = Math.max(container.clientWidth, 300);
    yaw -= ((event.clientX - drag.x) / scale) * 3.7;
    // Touch reserves the vertical axis for native page scrolling.
    if (!drag.touch) {
      elevation = clamp(elevation + ((event.clientY - drag.y) / scale) * 2.1, 0.21, 1.03);
    }
    fitCamera();
    drag.x = event.clientX;
    drag.y = event.clientY;
    lastInteraction = performance.now();
    requestFrame();
  }, { signal: events.signal });

  function endDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    const wasBunny=drag.kind==='bunny';drag=null;
    if(wasBunny)currentModel?.userData.manipulation?.release(elapsed,paused||reducedMotion.matches||event.type!=='pointerup');
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor='grab';lastInteraction = performance.now();requestFrame();
  }
  canvas.addEventListener('pointerup', endDrag, { signal: events.signal });
  canvas.addEventListener('pointercancel', endDrag, { signal: events.signal });
  canvas.addEventListener('lostpointercapture', endDrag, { signal: events.signal });
  canvas.addEventListener('keydown', event => {
    if (!active) return;
    const manipulation=currentModel?.userData.manipulation;
    if(manipulation && (event.key===' '||event.key==='Enter')){
      event.preventDefault();if(event.repeat)return;
      if(currentModel.userData.isHeld)manipulation.release(elapsed,paused||reducedMotion.matches);else manipulation.begin(elapsed);
      requestFrame();return;
    }
    if(manipulation && event.key==='Escape'){event.preventDefault();cancelManipulation();requestFrame();return;}
    if(manipulation && currentModel.userData.isHeld && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();const point=manipulation.target.position.clone(),amount=event.shiftKey?.06:.18;
      if(event.key==='ArrowLeft')point.x-=amount;if(event.key==='ArrowRight')point.x+=amount;
      if(event.key==='ArrowUp')point.y+=amount;if(event.key==='ArrowDown')point.y-=amount;
      manipulation.move(point,elapsed);requestFrame();return;
    }
    const step = event.shiftKey ? 0.045 : 0.13;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { guidedCamera = false; currentModel?.userData.interact?.(elapsed); }
    if (event.key === 'ArrowLeft') yaw += step;
    else if (event.key === 'ArrowRight') yaw -= step;
    else if (event.key === 'ArrowUp') elevation = clamp(elevation + step, 0.21, 1.03);
    else if (event.key === 'ArrowDown') elevation = clamp(elevation - step, 0.21, 1.03);
    else if (event.key === 'Home') resetView();
    else return;
    event.preventDefault();
    lastInteraction = performance.now();
    fitCamera();
    requestFrame();
  }, { signal: events.signal });

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    reportError(new Error('The 3D graphics context was lost. The artwork view remains available.'));
  }, { signal: events.signal });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelManipulation(); stopFrames(); }
    else requestFrame();
  }, { signal: events.signal });
  window.addEventListener('blur',()=>{cancelManipulation();requestFrame();},{signal:events.signal});
  reducedMotion.addEventListener('change', () => {
    stopFrames();
    requestFrame();
  }, { signal: events.signal });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(entries => {
    inViewport = entries[0].isIntersecting;
    if (inViewport) requestFrame();
    else stopFrames();
  });
  intersectionObserver.observe(container);

  function dispose() {
    if (disposed) return;
    disposed = true;
    stopFrames();
    events.abort();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    models.forEach(model => { model.userData.disposed = true; delete model.userData.requestRender; });
    canvas.style.touchAction = previousTouchAction;
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.customDepthMaterial) materials.add(object.customDepthMaterial);
      if (object.customDistanceMaterial) materials.add(object.customDistanceMaterial);
      const list = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
      list.forEach(material => {
        materials.add(material);
        Object.values(material).forEach(value => {
          if (value?.isTexture) textures.add(value);
        });
      });
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    textures.forEach(texture => texture.dispose());
    nightlifePost?.dispose();
    environment.dispose();
    key.shadow.map?.dispose();
    renderer.dispose();
    models.clear();
  }

  try {
    setTheme(theme);
    setProject(initialProject);
    resize();
  } catch (error) {
    if (!failed) reportError(error);
    dispose();
    throw error;
  }
  return { setProject, setActive, setPaused, setTheme, setStoryStep, resetView, zoomBy, dispose };
}
