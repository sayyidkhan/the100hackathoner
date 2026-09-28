import * as THREE from "./node_modules/three/build/three.module.js";

const canvas = document.querySelector("#journey-engine");
const container = document.querySelector(".engine-scene");
const pauseButton = document.querySelector("#motion-toggle");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setClearColor(0x080810, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
camera.position.set(6.2, 4.0, 10.5);
camera.lookAt(0, 0.65, 0);

const rig = new THREE.Group();
scene.add(rig);
scene.add(new THREE.AmbientLight(0x958cd2, 2.5));
const key = new THREE.DirectionalLight(0xeee1ff, 6);
key.position.set(-3, 7, 5);
scene.add(key);
const purple = new THREE.PointLight(0x8844ff, 100, 18);
purple.position.set(-3, 1, 3);
scene.add(purple);
const blue = new THREE.PointLight(0x507bff, 100, 20);
blue.position.set(4, 4, -2);
scene.add(blue);

const palette = [0xa77bff, 0x79cbf8, 0x91ddba];
const silver = new THREE.MeshStandardMaterial({
  color: 0xb5a4d4,
  metalness: 0.75,
  roughness: 0.25,
});
const ink = new THREE.MeshStandardMaterial({
  color: 0x161222,
  metalness: 0.8,
  roughness: 0.3,
});
const accent = new THREE.MeshStandardMaterial({
  color: palette[0],
  emissive: palette[0],
  emissiveIntensity: 0.25,
  metalness: 0.65,
  roughness: 0.25,
});
const lightMaterial = new THREE.MeshBasicMaterial({ color: palette[0] });

function box(width, height, depth, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material,
  );
  mesh.position.set(x, y, z);
  return mesh;
}

function edges(mesh, color = 0xa78cff, opacity = 0.5) {
  const line = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  mesh.add(line);
  return line;
}

function glowTexture() {
  const source = document.createElement("canvas");
  source.width = source.height = 128;
  const context = source.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,.8)");
  gradient.addColorStop(0.18, "rgba(255,255,255,.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(source);
}

const auraMaterial = new THREE.SpriteMaterial({
  map: glowTexture(),
  color: palette[0],
  blending: THREE.AdditiveBlending,
  transparent: true,
  opacity: 0.38,
  depthWrite: false,
});
const aura = new THREE.Sprite(auraMaterial);
aura.position.set(0, 1, -2.5);
aura.scale.set(11, 11, 1);
rig.add(aura);

// The stage is an architectural surface, not a second progress chart.
const stage = box(7.5, 0.16, 5.5, ink, 0, -2.12, 0);
edges(stage, 0x786592, 0.32);
rig.add(stage);
const stageLight = box(7.45, 0.012, 0.02, lightMaterial, 0, -2.035, 2.72);
rig.add(stageLight);
const floorGrid = new THREE.GridHelper(7.5, 25, 0x75649f, 0x352c49);
floorGrid.position.y = -2.028;
floorGrid.material.transparent = true;
floorGrid.material.opacity = 0.4;
rig.add(floorGrid);

const vault = new THREE.Group();
vault.rotation.y = -0.11;
rig.add(vault);
const frames = [];
for (let i = 3; i >= 0; i -= 1) {
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x201331,
    metalness: 0.45,
    roughness: 0.15,
    clearcoat: 1,
    transparent: true,
    opacity: 0.65 - i * 0.09,
  });
  const panel = box(
    3.35,
    4.55,
    0.13,
    material,
    0.1 + i * 0.52,
    0.65 + i * 0.12,
    -0.75 - i * 0.7,
  );
  edges(panel, i === 0 ? 0xcfb4ff : 0x735899, i === 0 ? 0.8 : 0.45);
  panel.rotation.z = i * -0.025;
  vault.add(panel);
  frames.push(panel);
}

// The active record is rendered locally as a typographic physical card.
const labelCanvas = document.createElement("canvas");
labelCanvas.width = 768;
labelCanvas.height = 1024;
const labelContext = labelCanvas.getContext("2d");
const labelTexture = new THREE.CanvasTexture(labelCanvas);
labelTexture.colorSpace = THREE.SRGBColorSpace;
const labelPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(3.25, 4.45),
  new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true }),
);
labelPlane.position.set(0.1, 0.65, -0.675);
vault.add(labelPlane);

function drawLabel(index) {
  const colors = ["#c3a2ff", "#a0dcff", "#b0eed0"];
  const words = [
    ["DRAW YOUR", "WAY HOME."],
    ["ITACHI’S", "CROW."],
    ["LONG TAA", "BORNEO."],
  ];
  labelContext.clearRect(0, 0, 768, 1024);
  labelContext.strokeStyle = "#ffffff20";
  labelContext.lineWidth = 1;
  for (let y = 65; y < 980; y += 40) {
    labelContext.beginPath();
    labelContext.moveTo(45, y);
    labelContext.lineTo(723, y);
    labelContext.stroke();
  }
  labelContext.fillStyle = "#cdc0e2";
  labelContext.font = "22px monospace";
  labelContext.fillText("THE 100 HACKATHONER", 50, 63);
  labelContext.fillText("RECORD / " + (81 - index), 490, 63);
  labelContext.fillStyle = colors[index];
  labelContext.font = "bold 145px Arial";
  labelContext.fillText("0" + (81 - index), 42, 228);
  labelContext.font = "bold 50px Arial";
  labelContext.fillText(words[index][0], 50, 815);
  labelContext.fillText(words[index][1], 50, 870);
  labelContext.font = "18px monospace";
  labelContext.fillStyle = "#d6cde4";
  labelContext.fillText("ONE ATTEMPT. A NEW POSSIBILITY.", 50, 968);
  labelTexture.needsUpdate = true;
}

const artifactStage = new THREE.Group();
artifactStage.position.set(0, 0.65, 0.85);
vault.add(artifactStage);
const models = [];

function addPlatform(group, width = 2.65) {
  const plate = box(width, 0.11, 1.7, silver, 0, -0.75, 0);
  edges(plate, 0xe2d0ff, 0.7);
  group.add(plate);
  const underside = box(width * 0.93, 0.055, 1.55, accent, 0, -0.86, 0);
  group.add(underside);
  const lowerPage = box(width * 1.03, 0.035, 1.79, ink, 0.06, -0.92, 0.03);
  edges(lowerPage, 0x9c88bb, 0.7);
  group.add(lowerPage);
}

// Artifact01: a small, dimensional home emerging from a blank page.
const home = new THREE.Group();
addPlatform(home);
const walls = box(1.18, 1.05, 0.9, silver, 0, -0.18, 0);
edges(walls, 0xe1caff, 0.3);
home.add(walls);
const roofProfile = new THREE.Shape();
roofProfile.moveTo(-0.72, 0);
roofProfile.lineTo(0, 0.59);
roofProfile.lineTo(0.72, 0);
roofProfile.closePath();
const roof = new THREE.Mesh(
  new THREE.ExtrudeGeometry(roofProfile, {
    depth: 1.12,
    bevelEnabled: true,
    bevelSize: 0.02,
    bevelThickness: 0.025,
    bevelSegments: 2,
    steps: 1,
  }),
  accent,
);
roof.position.set(0, 0.37, -0.56);
edges(roof, 0xe4cfff, 0.5);
home.add(roof);
home.add(box(1.43, 0.04, 1.15, ink, 0, 0.355, 0));
home.add(box(0.04, 0.03, 1.19, silver, 0, 0.98, 0));
for (let z = -0.47; z < 0.55; z += 0.13) {
  for (const side of [-1, 1]) {
    const seam = box(0.91, 0.012, 0.012, silver, side * 0.36, 0.67, z);
    seam.rotation.z = side * -0.69;
    home.add(seam);
  }
}
// Fine siding and recessed joinery keep the miniature architectural, not toy-like.
for (let y = -0.59; y < 0.32; y += 0.13) {
  home.add(box(1.19, 0.008, 0.008, ink, 0, y, 0.456));
  home.add(box(0.008, 0.008, 0.9, ink, 0.594, y, 0));
}
home.add(box(0.31, 0.65, 0.03, ink, 0.08, -0.39, 0.475));
home.add(box(0.23, 0.57, 0.015, accent, 0.08, -0.4, 0.493));
home.add(box(0.02, 0.02, 0.025, lightMaterial, 0.15, -0.41, 0.507));
for (const x of [-0.36, 0.39]) {
  home.add(box(0.28, 0.29, 0.045, ink, x, 0.06, 0.48));
  home.add(box(0.22, 0.23, 0.008, lightMaterial, x, 0.06, 0.506));
  home.add(box(0.014, 0.24, 0.015, silver, x, 0.06, 0.52));
  home.add(box(0.24, 0.014, 0.015, silver, x, 0.06, 0.52));
  home.add(box(0.32, 0.025, 0.075, silver, x, -0.1, 0.49));
}
for (let i = 0; i < 3; i += 1)
  home.add(box(0.28, 0.027, 0.11, ink, 0.08, -0.68, 0.53 + i * 0.14));
for (const [x, z, size] of [
  [-0.97, -0.12, 0.8],
  [0.99, -0.16, 1],
  [-0.91, 0.5, 0.55],
]) {
  home.add(box(0.04, 0.35, 0.04, silver, x, -0.54, z));
  for (let tier = 0; tier < 3; tier += 1) {
    const tree = new THREE.Mesh(
      new THREE.ConeGeometry((0.24 - tier * 0.05) * size, 0.4 * size, 9),
      accent,
    );
    tree.position.set(x, -0.35 + tier * 0.18 * size, z);
    home.add(tree);
  }
}
models.push(home);

// Artifact02: a faceted crow over an explorable city.
const city = new THREE.Group();
addPlatform(city);
for (let i = 0; i < 9; i += 1) {
  const height = 0.28 + ((i * 17) % 7) * 0.09;
  const building = box(
    0.27,
    height,
    0.26,
    silver,
    ((i % 3) - 1) * 0.58,
    -0.69 + height / 2,
    (Math.floor(i / 3) - 1) * 0.5,
  );
  edges(building, 0xbce7ff, 0.4);
  city.add(building);
}
const birdShape = new THREE.Shape();
birdShape.moveTo(0, 0.2);
birdShape.bezierCurveTo(-0.35, 0.23, -0.52, 0.68, -1.16, 0.76);
birdShape.lineTo(-0.88, 0.49);
birdShape.lineTo(-1.04, 0.44);
birdShape.lineTo(-0.71, 0.22);
birdShape.lineTo(-0.86, 0.17);
birdShape.quadraticCurveTo(-0.31, -0.12, -0.14, -0.07);
birdShape.lineTo(-0.16, -0.46);
birdShape.lineTo(0.17, -0.46);
birdShape.lineTo(0.15, -0.08);
birdShape.quadraticCurveTo(0.48, 0.04, 0.87, 0.21);
birdShape.lineTo(0.72, 0.27);
birdShape.lineTo(1.07, 0.49);
birdShape.lineTo(0.9, 0.55);
birdShape.lineTo(1.16, 0.81);
birdShape.bezierCurveTo(0.57, 0.73, 0.35, 0.25, 0, 0.2);
birdShape.closePath();
const bird = new THREE.Mesh(
  new THREE.ExtrudeGeometry(birdShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSize: 0.02,
    bevelThickness: 0.02,
    bevelSegments: 2,
    steps: 1,
  }),
  accent,
);
bird.position.set(0, 0.8, 0.2);
bird.rotation.x = -1.05;
edges(bird, 0xe7f5ff, 0.65);
city.add(bird);
const birdBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 10), accent);
birdBody.scale.set(0.7, 0.8, 1.6);
birdBody.position.set(0, 0.84, 0.16);
city.add(birdBody);
const birdHead = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 8), accent);
birdHead.position.set(0, 0.98, 0.39);
city.add(birdHead);
const beak = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.2, 5), silver);
beak.rotation.x = Math.PI / 2;
beak.position.set(0, 0.97, 0.54);
city.add(beak);
models.push(city);

// Artifact03: a raised longhouse, symbolic of the real Borneo visitor project.
const longhouse = new THREE.Group();
addPlatform(longhouse);
longhouse.add(box(1.7, 0.56, 0.74, silver, 0, -0.06, 0));
for (const x of [-0.7, 0, 0.7]) {
  longhouse.add(box(0.05, 0.46, 0.05, accent, x, -0.56, 0.28));
  longhouse.add(box(0.05, 0.46, 0.05, accent, x, -0.56, -0.28));
}
const longRoof = new THREE.Mesh(
  new THREE.CylinderGeometry(0, 1, 0.75, 4),
  accent,
);
longRoof.rotation.y = Math.PI / 4;
longRoof.scale.set(1.55, 1, 0.78);
longRoof.position.y = 0.53;
longhouse.add(longRoof);
for (const x of [-0.52, 0, 0.52])
  longhouse.add(box(0.24, 0.21, 0.025, ink, x, -0.02, 0.385));
models.push(longhouse);
models.forEach((model, index) => {
  model.visible = index === 0;
  artifactStage.add(model);
});

// Long, tilted light rails place the archive in a space rather than a UI card.
const railGroup = new THREE.Group();
for (let i = 0; i < 5; i += 1) {
  const rail = box(
    0.018,
    7.6,
    0.018,
    lightMaterial,
    -2.5 + i * 0.27,
    0.65,
    -2.5,
  );
  rail.rotation.z = -0.15;
  railGroup.add(rail);
}
rig.add(railGroup);
const dustGeometry = new THREE.BufferGeometry();
const dustPositions = new Float32Array(120 * 3);
for (let i = 0; i < 120; i += 1) {
  dustPositions[i * 3] = Math.sin(i * 91.17) * 5;
  dustPositions[i * 3 + 1] = Math.cos(i * 7.79) * 3.5;
  dustPositions[i * 3 + 2] = Math.sin(i * 18.13) * 4;
}
dustGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(dustPositions, 3),
);
const dust = new THREE.Points(
  dustGeometry,
  new THREE.PointsMaterial({
    color: 0xa99ac9,
    size: 0.018,
    transparent: true,
    opacity: 0.5,
  }),
);
rig.add(dust);

let paused = reducedMotion.matches;
let visible = true;
let phase = 0;
let currentChapter = 0;
let transition = 1;
let pointerX = 0;
let pointerY = 0;
let lastTime = performance.now();

function setChapter(index) {
  currentChapter = index;
  models.forEach((model, i) => {
    model.visible = i === index;
  });
  drawLabel(index);
  accent.color.setHex(palette[index]);
  accent.emissive.setHex(palette[index]);
  lightMaterial.color.setHex(palette[index]);
  auraMaterial.color.setHex(palette[index]);
  purple.color.setHex(palette[index]);
  transition = reducedMotion.matches ? 1 : 0;
}
setChapter(0);
document.addEventListener("journey-chapter", (event) =>
  setChapter(event.detail),
);

function updatePause() {
  pauseButton.textContent = paused ? "Play motion ▷" : "Pause motion Ⅱ";
  pauseButton.setAttribute("aria-pressed", String(paused));
}
updatePause();
pauseButton.addEventListener("click", () => {
  paused = !paused;
  updatePause();
});
reducedMotion.addEventListener("change", (event) => {
  paused = event.matches;
  updatePause();
});
container.addEventListener("pointermove", (event) => {
  const rect = container.getBoundingClientRect();
  pointerX = (event.clientX - rect.left) / rect.width - 0.5;
  pointerY = (event.clientY - rect.top) / rect.height - 0.5;
});
container.addEventListener("pointerleave", () => {
  pointerX = 0;
  pointerY = 0;
});
new IntersectionObserver((entries) => {
  visible = entries[0].isIntersecting;
}).observe(container);
new ResizeObserver(() => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.set(width < 600 ? 6.8 : 6.2, 4.0, width < 600 ? 12.0 : 10.5);
  camera.lookAt(0, 0.65, 0);
  camera.updateProjectionMatrix();
}).observe(container);

function animate(time) {
  requestAnimationFrame(animate);
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  if (!visible || document.hidden) return;
  if (!paused) {
    phase += dt;
    rig.rotation.y += (pointerX * 0.18 - rig.rotation.y) * 0.035;
    rig.rotation.x += (pointerY * 0.035 - rig.rotation.x) * 0.035;
    vault.position.y = Math.sin(phase * 0.55) * 0.055;
    artifactStage.rotation.y = Math.sin(phase * 0.3) * 0.08;
    dust.rotation.y = phase * 0.008;
  }
  transition = Math.min(transition + dt * 2.4, 1);
  const ease = 1 - Math.pow(1 - transition, 3);
  models[currentChapter].scale.setScalar(0.82 + ease * 0.18);
  models[currentChapter].rotation.y = (1 - ease) * -0.6;
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
