import { createCrowBird } from './itachi-crow-bird.js';
import { createCrowCity } from './itachi-crow-city.js';
import { addCrowLighting } from './itachi-crow-lighting.js';

/** A folded-paper navigator and the lantern-lit city it brings to life. */
export function createArtifact(THREE) {
  const root = new THREE.Group();
  root.name = 'itachis-crow';
  const islandScale = 1.16;
  const cobalt = new THREE.MeshStandardMaterial({ color: 0x084b7c, roughness: .56, metalness: .14 });
  const enamel = new THREE.MeshStandardMaterial({ color: 0x0a477d, roughness: .54, metalness: .12 });
  const edge = new THREE.MeshStandardMaterial({ color: 0x155483, roughness: .57, metalness: .16 });
  function surface(geometry, material, y = 0) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = y;
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  }

  // The deep cobalt drum and fine eased edges match the artwork's sculptural base.
  const profile = [[0, .018], [2.50, .018], [2.55, .025], [2.572, .045], [2.575, .073],
    [2.575, .458], [2.568, .477], [2.55, .49], [0, .49]];
  surface(new THREE.LatheGeometry(profile.map(([r,y]) => new THREE.Vector2(r * islandScale,y)), 144), cobalt);
  surface(new THREE.CylinderGeometry(2.55 * islandScale, 2.55 * islandScale, .012, 144), enamel, .491);
  const rim = surface(new THREE.TorusGeometry(2.564 * islandScale, .004, 6, 144), edge, .473);
  rim.rotation.x = Math.PI / 2;

  const shadowSize = 96, shadowPixels = new Uint8Array(shadowSize * shadowSize * 4);
  for (let y = 0; y < shadowSize; y++) for (let x = 0; x < shadowSize; x++) {
    const radius = Math.hypot((x + .5) / shadowSize - .5, (y + .5) / shadowSize - .5) * 6.3;
    const distance = Math.max(0, radius - 2.48);
    shadowPixels[(y * shadowSize + x) * 4 + 3] = Math.round(190 * Math.exp(-distance * distance / .035));
  }
  const shadowTexture = new THREE.DataTexture(shadowPixels, shadowSize, shadowSize, THREE.RGBAFormat);
  shadowTexture.magFilter = shadowTexture.minFilter = THREE.LinearFilter;
  shadowTexture.needsUpdate = true;
  const shadow = surface(new THREE.PlaneGeometry(6.3 * islandScale, 6.3 * islandScale), new THREE.MeshBasicMaterial({
    map: shadowTexture, transparent: true, opacity: .48, depthWrite: false, toneMapped: false,
  }), .009);
  shadow.name = 'Soft contact beneath the cobalt drum';
  shadow.rotation.x = -Math.PI / 2;
  shadow.userData.noShadow = true;

  const city = createCrowCity(THREE);
  city.position.y = .50;
  city.scale.set(islandScale, 1, islandScale);
  root.add(city);
  const bird = createCrowBird(THREE);
  bird.position.set(.04, 3.50, -.03);
  // A banking profile reveals the long bill, tail and broad folded wing surfaces.
  bird.rotation.set(.035, -.03, -.10);
  root.add(bird);

  function animate(time) {
    const elapsed = Number.isFinite(time) ? Math.max(0, time) : 0;
    // One navigation journey spans one flight phrase; the slower boats take two.
    const cityTime = elapsed * 18 / bird.userData.animationDuration;
    bird.userData.animate(elapsed);
    city.userData.animate?.(cityTime);
    lighting.animate(cityTime);
  }
  function setTheme(theme) {
    const dark = theme === 'dark';
    bird.userData.setTheme?.(theme);
    city.userData.setTheme?.(theme);
    cobalt.color.setHex(dark ? 0x084b7c : 0x07568c);
    enamel.color.setHex(dark ? 0x0a477d : 0x0a5189);
    shadow.material.opacity = dark ? .48 : .22;
    lighting.setTheme(theme);
  }
  root.userData = { conceptual: true, artifactId: 80, displayBase: false, groundLevel: .015,
    studioProfile: 'crow', initialYaw: .60, initialElevation: .45, animate, setTheme };
  const lighting = addCrowLighting(THREE, root, city);

  // Fit a compact collection of actual component bounds over the entire stroke.
  // Keeping each wing separate avoids fitting the empty corners above the city.
  const points = [];
  const frame = new THREE.Box3();
  const corners = new THREE.Vector3();
  function sample(group) {
    group.traverse(object => {
      if (!object.isMesh || !object.visible) return;
      object.geometry.computeBoundingBox();
      const box = object.geometry.boundingBox;
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        const p = new THREE.Vector3(x,y,z).applyMatrix4(object.matrixWorld);
        points.push(p);
      }
    });
  }
  for (let i = 0; i < 64; i++) {
    animate(i / 64 * bird.userData.animationDuration);
    root.updateMatrixWorld(true);
    sample(bird);
  }
  // The solid city batches have wider bounding boxes than their actual roofline;
  // use a small grid of occupied cells so nearby details remain properly framed.
  const cells = new Map();
  city.traverse(object => {
    if (!object.isMesh) return;
    const position = object.geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      corners.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld);
      const key = `${Math.round(corners.x*4)}:${Math.round(corners.z*4)}`;
      let cell = cells.get(key);
      if (!cell) { cell = new THREE.Box3(); cells.set(key,cell); }
      cell.expandByPoint(corners);
    }
  });
  for (const cell of cells.values()) {
    points.push(cell.min.clone(), cell.max.clone(), new THREE.Vector3(cell.min.x,cell.max.y,cell.max.z), new THREE.Vector3(cell.max.x,cell.max.y,cell.min.z));
  }
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2;
    for (const y of [.015, .495]) points.push(new THREE.Vector3(Math.cos(a)*2.58*islandScale, y, Math.sin(a)*2.58*islandScale));
  }
  // Coalesce nearly identical articulated bounds before camera fitting.
  const unique = new Map();
  for (const p of points) unique.set(`${Math.round(p.x*50)}:${Math.round(p.y*50)}:${Math.round(p.z*50)}`, p);
  frame.setFromPoints([...unique.values()]);
  root.userData.framingBounds = frame.expandByScalar(.045);
  root.userData.framingPoints = [...unique.values()];
  animate(0);
  setTheme('dark');
  return root;
}
