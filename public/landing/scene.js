import * as THREE from './vendor/three.module.js';
import { createArtifact } from './models.js';

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
export function createGalleryScene({ canvas, container, onError = () => {}, theme = 'dark', initialProject = 81, artifactFactory = createArtifact, projectIds = PROJECTS }) {
  if (!(canvas instanceof HTMLCanvasElement) || !container) {
    throw new TypeError('The gallery needs a canvas and its layout container.');
  }
  if (!Object.hasOwn(THEMES, theme)) throw new RangeError(`Unknown gallery theme: ${theme}`);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    onError(error);
    throw error;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
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
  let drag = null;
  let lastInteraction = 0;

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

  /** Change only the studio presentation, never the artifact or camera state. */
  function setTheme(name) {
    if (disposed || failed) return;
    if (!Object.hasOwn(THEMES, name)) throw new RangeError(`Unknown gallery theme: ${name}`);
    if (currentTheme === name) return;
    const palette = THEMES[name];
    currentTheme = name;
    scene.background.setHex(palette.background);
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
    // Paused views receive one fresh frame. Hidden/inactive views wait until
    // they are visible again; selection, orbit, and pause remain untouched.
    requestFrame();
  }

  function updateCamera() {
    const idle = !paused && !reducedMotion.matches && !drag && performance.now() - lastInteraction > 1800;
    const orbitOffset = idle ? Math.sin(elapsed * 0.4) * 0.14 : 0;
    const angle = yaw + orbitOffset;
    camera.position.set(
      Math.sin(angle) * Math.cos(elevation) * distance,
      target.y + Math.sin(elevation) * distance,
      Math.cos(angle) * Math.cos(elevation) * distance,
    );
    camera.lookAt(target);
  }

  function render(time) {
    frameId = null;
    if (!canRender()) return;
    const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 0.05) : 0;
    lastFrameTime = time;
    if (!paused && !reducedMotion.matches && !drag) elapsed += delta;
    updateCamera();
    try {
      currentModel?.userData.animate?.(elapsed);
      renderer.render(scene, camera);
    } catch (error) {
      reportError(error);
      return;
    }
    if (!paused && !reducedMotion.matches) requestFrame();
  }

  function fitCamera(remeasure = false) {
    if (!currentModel) return;
    if (remeasure || size.lengthSq() === 0) {
      bounds.setFromObject(currentModel);
      bounds.getSize(size);
    }
    const radius = Math.max(Math.hypot(size.x, size.z) * 0.5 + 0.13, 3.1);
    topDisc.scale.set(radius, 1, radius);
    lowerDisc.scale.set(radius * 1.028, 1, radius * 1.028);
    seam.scale.setScalar(radius * 1.013);

    // Exact perspective constraints: fit artifact bounds AND the full circular
    // base. A world-space height estimate misses the near edge of the plinth.
    const points = [];
    for (const x of [bounds.min.x, bounds.max.x]) {
      for (const y of [bounds.min.y, bounds.max.y]) {
        for (const z of [bounds.min.z, bounds.max.z]) points.push({ x, y, z });
      }
    }
    for (let i = 0; i < 64; i += 1) {
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
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });
      model.position.y = 0.025;
      models.set(numericId, model);
      scene.add(model);
    }
    if (currentModel) currentModel.visible = false;
    currentModel = model;
    currentId = numericId;
    model.visible = true;
    yaw = INITIAL_YAW;
    elevation = INITIAL_ELEVATION;
    elapsed = 0;
    fitCamera(true);
    requestFrame();
  }

  function resetView() {
    yaw = INITIAL_YAW;
    elevation = INITIAL_ELEVATION;
    elapsed = 0;
    lastInteraction = performance.now();
    fitCamera();
    requestFrame();
  }

  function setActive(value) {
    if (disposed || failed) return;
    active = Boolean(value);
    if (active) {
      resize();
      requestFrame();
    } else {
      stopFrames();
    }
  }

  function setPaused(value) {
    paused = Boolean(value);
    stopFrames();
    requestFrame();
  }

  const previousTouchAction = canvas.style.touchAction;
  canvas.style.touchAction = 'pan-y';
  if (!canvas.hasAttribute('tabindex')) canvas.tabIndex = 0;
  if (!canvas.hasAttribute('aria-label')) {
    canvas.setAttribute('aria-label', 'Interactive 3D project artifact. Drag to rotate, use arrow keys to orbit, or press Home to reset.');
  }

  canvas.addEventListener('pointerdown', event => {
    if (!active || (event.pointerType === 'mouse' && event.button !== 0)) return;
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
    if (!drag || drag.id !== event.pointerId) return;
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
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    drag = null;
    lastInteraction = performance.now();
    requestFrame();
  }
  canvas.addEventListener('pointerup', endDrag, { signal: events.signal });
  canvas.addEventListener('pointercancel', endDrag, { signal: events.signal });
  canvas.addEventListener('lostpointercapture', endDrag, { signal: events.signal });
  canvas.addEventListener('keydown', event => {
    if (!active) return;
    const step = event.shiftKey ? 0.045 : 0.13;
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
    if (document.hidden) stopFrames();
    else requestFrame();
  }, { signal: events.signal });
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
    canvas.style.touchAction = previousTouchAction;
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
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
  return { setProject, setActive, setPaused, setTheme, resetView, dispose };
}
