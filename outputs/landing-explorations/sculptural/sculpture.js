import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createSculpture(host, reduced) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0xe1e3e2, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  const environment = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const environmentMap = generator.fromScene(environment, .035);
  scene.environment = environmentMap.texture;
  environment.dispose();
  generator.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 4.5);
  key.position.set(-8, 12, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -13, right: 13, top: 12, bottom: -12 });
  key.shadow.normalBias = .05;
  scene.add(key, new THREE.HemisphereLight(0xe8efff, 0x5d678c, 2));
  const rim = new THREE.DirectionalLight(0x9db6ff, 3);
  rim.position.set(9, 5, -6);
  scene.add(rim);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShadowMaterial({ color: 0x172040, opacity: .14 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -4.3;
  floor.receiveShadow = true;
  scene.add(floor);

  const blue = new THREE.MeshPhysicalMaterial({
    color: 0x123cff, metalness: .76, roughness: .18,
    clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.8
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xc4cede, metalness: .45, roughness: .12, transparent: true,
    opacity: .47, clearcoat: 1, envMapIntensity: 1.9, depthWrite: false
  });
  const red = new THREE.MeshPhysicalMaterial({
    color: 0xff3a23, metalness: .45, roughness: .18, clearcoat: 1, envMapIntensity: 1.6
  });
  const geometry = new RoundedBoxGeometry(.39, .82, 1.36, 3, .12);
  const complete = new THREE.InstancedMesh(geometry, blue, 80);
  const current = new THREE.InstancedMesh(geometry, red, 1);
  const future = new THREE.InstancedMesh(geometry, glass, 19);
  complete.userData.offset = 0;
  current.userData.offset = 80;
  future.userData.offset = 81;
  const exhibit = new THREE.Group();
  for (const mesh of [complete, current, future]) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    exhibit.add(mesh);
  }
  exhibit.rotation.set(-.1, -.18, -.12);
  scene.add(exhibit);

  // 26 modules trace the one; 37 trace each zero: exactly100 physical attempts.
  const onePath = new THREE.CurvePath();
  const points = [
    new THREE.Vector3(-5.5, 1.95, 0),
    new THREE.Vector3(-4.22, 3.25, 0),
    new THREE.Vector3(-4.22, -3.1, 0),
    new THREE.Vector3(-5.5, -3.1, 0),
    new THREE.Vector3(-2.92, -3.1, 0)
  ];
  for (let i = 1; i < points.length; i++) onePath.add(new THREE.LineCurve3(points[i - 1], points[i]));
  function oval(t, x) {
    const angle = t * Math.PI * 2;
    return new THREE.Vector3(
      x + Math.sign(Math.cos(angle)) * Math.pow(Math.abs(Math.cos(angle)), .58) * 1.42,
      Math.sign(Math.sin(angle)) * Math.pow(Math.abs(Math.sin(angle)), .65) * 3.1,
      0
    );
  }
  const positions = Array.from({ length: 100 }, (_, i) => {
    if (i < 26) return onePath.getPoint(i / 25);
    return oval(((i - 26) % 37) / 37, i < 63 ? -.35 : 3.62);
  });
  const archive = positions.map((_, i) => {
    const angle = i / 100 * Math.PI * 3.7 - Math.PI / 2;
    const radius = 3.6 + Math.sin(i / 100 * Math.PI) * .9;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      (i / 99 - .5) * 5.6,
      Math.sin(angle) * radius
    );
  });
  const transform = new THREE.Object3D();
  const targetQuaternion = new THREE.Quaternion();
  const archiveQuaternion = new THREE.Quaternion();
  const euler = new THREE.Euler();
  let blend = 0;
  let mode = 0;
  let yaw = -.18;
  let pitch = -.1;
  let paused = reduced.matches;
  let visible = true;
  let frame = 0;
  let last = 0;
  let selected = 80;
  let dragging = false;
  let pointerStart = null;
  let hasMoved = false;
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const selectionLabel = document.querySelector('#attempt-label');
  const selectionTitle = document.querySelector('#attempt-title');
  const openButton = document.querySelector('#open-attempt');
  const modeButtons = [...document.querySelectorAll('[data-composition]')];
  const pauseButton = document.querySelector('#pause-scene');

  function select(index) {
    selected = Math.max(0, Math.min(99, index));
    selectionLabel.textContent = String(selected + 1).padStart(3, '0') + ' / 100';
    const record = window.hackathonRecords?.find(item => item.number === selected + 1);
    selectionTitle.textContent = record?.title || (selected > 80 ? 'A story still to be written.' : 'Explore this attempt');
    openButton.disabled = selected > 80;
    host.dispatchEvent(new CustomEvent('attempt-selected', { detail: selected + 1 }));
    render(performance.now(), true);
  }

  function updateMatrices(time) {
    const progress = reduced.matches ? mode : blend;
    for (let i = 0; i < 100; i++) {
      transform.position.copy(positions[i]).lerp(archive[i], progress);
      const tangent = i < 26
        ? onePath.getTangent(Math.min(.999, i / 25))
        : oval((((i - 26) % 37) / 37 + .004) % 1, i < 63 ? -.35 : 3.62).sub(positions[i]).normalize();
      euler.set(0, 0, Math.atan2(tangent.y, tangent.x));
      targetQuaternion.setFromEuler(euler);
      euler.set(.3, i / 100 * Math.PI * 3.7, .25);
      archiveQuaternion.setFromEuler(euler);
      transform.quaternion.copy(targetQuaternion).slerp(archiveQuaternion, progress);
      const swell = i === selected ? 1.15 : 1;
      transform.scale.set(swell, swell, swell);
      transform.updateMatrix();
      if (i < 80) complete.setMatrixAt(i, transform.matrix);
      else if (i === 80) current.setMatrixAt(0, transform.matrix);
      else future.setMatrixAt(i - 81, transform.matrix);
    }
    for (const mesh of [complete, current, future]) mesh.instanceMatrix.needsUpdate = true;
    exhibit.rotation.y += (yaw - exhibit.rotation.y) * .1;
    exhibit.rotation.x += (pitch - exhibit.rotation.x) * .1;
    exhibit.rotation.z = -.09 + (!paused && !reduced.matches ? Math.sin(time * .00025) * .025 : 0);
  }

  function render(time, force = false) {
    if (!force && (!visible || document.hidden)) return;
    if (reduced.matches) blend = mode;
    else blend += (mode - blend) * .065;
    updateMatrices(time);
    renderer.render(scene, camera);
  }
  function loop(time) {
    frame = 0;
    if (!visible || document.hidden) return;
    if (time - last > 32) { render(time); last = time; }
    if (!paused || Math.abs(mode - blend) > .001 || dragging) frame = requestAnimationFrame(loop);
  }
  function start() {
    render(performance.now(), true);
    if (!frame && visible && !document.hidden && (!paused || Math.abs(mode - blend) > .001)) {
      frame = requestAnimationFrame(loop);
    }
  }
  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(3.3, 3.7, camera.aspect < 1.5 ? 22 : 14.5);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    render(performance.now(), true);
  }
  function hit(event) {
    const rect = host.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([complete, current, future]);
    return hits[0] ? hits[0].object.userData.offset + hits[0].instanceId : null;
  }

  host.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragging = true;
    hasMoved = false;
    pointerStart = { x: event.clientX, y: event.clientY, yaw, pitch };
    host.setPointerCapture(event.pointerId);
    host.classList.add('dragging');
    if (!frame) frame = requestAnimationFrame(loop);
  });
  host.addEventListener('pointermove', event => {
    if (!dragging) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) hasMoved = true;
    yaw = pointerStart.yaw + dx * .006;
    pitch = THREE.MathUtils.clamp(pointerStart.pitch + dy * .003, -.6, .6);
    if (paused || reduced.matches) { exhibit.rotation.y = yaw; exhibit.rotation.x = pitch; }
    render(performance.now(), true);
  });
  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    host.classList.remove('dragging');
    if (!hasMoved) { const index = hit(event); if (index !== null) select(index); }
  }
  host.addEventListener('pointerup', endDrag);
  host.addEventListener('pointercancel', () => { dragging = false; host.classList.remove('dragging'); });

  for (const button of modeButtons) button.addEventListener('click', () => {
    mode = Number(button.dataset.composition);
    modeButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    yaw = mode ? -.5 : -.18;
    pitch = mode ? -.15 : -.1;
    document.querySelector('#scene-status').textContent = mode ? 'Every attempt. One continuous journey.' : 'One hundred attempts. One evolving story.';
    start();
  });
  pauseButton.addEventListener('click', () => {
    if (reduced.matches) return;
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? 'Resume motion ↻' : 'Pause motion Ⅱ';
    start();
  });
  document.querySelector('#previous-attempt').addEventListener('click', () => select((selected + 99) % 100));
  document.querySelector('#next-attempt').addEventListener('click', () => select((selected + 1) % 100));
  document.querySelector('#rotate-scene').addEventListener('click', () => {
    yaw += Math.PI / 6;
    exhibit.rotation.y = yaw;
    render(performance.now(), true);
  });
  openButton.addEventListener('click', () => host.dispatchEvent(new CustomEvent('open-attempt', { detail: selected + 1 })));
  host.addEventListener('records-ready', () => select(selected));
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); }).observe(host);
  document.addEventListener('visibilitychange', start);
  reduced.addEventListener('change', () => {
    paused = reduced.matches;
    pauseButton.disabled = reduced.matches;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = reduced.matches ? 'Reduced motion' : 'Pause motion Ⅱ';
    start();
  });
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    visible = false;
    host.classList.remove('webgl-ready');
    renderer.domElement.hidden = true;
    document.querySelector('#scene-status').textContent = 'Interactive artwork unavailable. Explore the real builds below.';
    document.querySelectorAll('.scene-controls button, .attempt-console button').forEach(button => { button.disabled = true; });
  });
  resize();
  select(80);
  host.classList.add('webgl-ready');
  document.querySelectorAll('.scene-controls button, .attempt-console button').forEach(button => { button.disabled = false; });
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.disabled = reduced.matches;
  pauseButton.textContent = reduced.matches ? 'Reduced motion' : 'Pause motion Ⅱ';
  start();
}
