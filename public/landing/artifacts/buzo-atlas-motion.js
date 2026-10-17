import { createAtlasLife } from './buzo-atlas-life.js';
// The atlas remains intact while signals travel along its connections.
// Light at each destination answers the arriving signal. One clock owns all motion.
export function createAtlasMotion(THREE, root, { routes, pools, glowMap }) {
  const group = new THREE.Group();
  group.name = 'atlas-living-details';
  group.userData.noAO = true;
  root.add(group);
  const life=createAtlasLife(THREE,root,routes);
  const ATLAS_CYCLE = 12;
  const atlasPhase = time => ((time % ATLAS_CYCLE) + ATLAS_CYCLE) % ATLAS_CYCLE;
  const TAU = Math.PI * 2;
  const clock = { value: 0 };
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const fract = (x) => x - Math.floor(x);
  const smooth = (x) => { const u = clamp(x); return u * u * (3 - 2 * u); };
  const basic = (color, opacity = 1) => new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, side: THREE.DoubleSide,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  });
  function add(geometry, material, name) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name; mesh.userData.noShadow = true; mesh.userData.noAO = true;
    group.add(mesh); return mesh;
  }
  function glow(name, size, color = 0xffc777) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowMap, color, transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, toneMapped: false,
    }));
    sprite.name = name; sprite.scale.setScalar(size); group.add(sprite); return sprite;
  }
  const vertexShader = 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
  const ringGeometry = new THREE.RingGeometry(.965, 1, 80);

  // Longer, continuous comet tails make the connections legible at page scale.
  // All tails share a single draw call; their head follows the bridge itself.
  const tailCount = 36;
  const trailPositions = new Float32Array(routes.length * tailCount * 3);
  const trailColors = new Float32Array(trailPositions.length);
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
  const trail = new THREE.Points(trailGeometry, new THREE.PointsMaterial({
    map: glowMap, size: .15, vertexColors: true, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  trail.name = 'atlas-flowing-connections'; trail.frustumCulled = false; group.add(trail);
  const signals = routes.map((curve, index) => {
    const head = glow(`atlas-route-${index}-head`, .34);
    const arrival = add(ringGeometry, basic(0xffd79a), `atlas-landmark-${index}-response`);
    arrival.rotation.x = -Math.PI / 2;
    arrival.position.copy(curve.getPointAt(1)); arrival.position.y += .035;
    return { curve, head, arrival, phase: index * 2 };
  });
  const point = new THREE.Vector3();
  const compass = glow('atlas-compass-heart', .75);
  compass.position.set(-.4, 1.36, .11);
  const compassRings = Array.from({ length: 2 }, (_, i) => {
    const ring = add(ringGeometry, basic(0xffca75), `atlas-compass-wave-${i}`);
    ring.rotation.x = -Math.PI / 2; ring.position.set(-.4, 1.335 + i * .002, .11);
    return ring;
  });

  // The framed work is a moving silk / ink field, contained inside its gilt frame.
  const artMaterial = new THREE.ShaderMaterial({
    uniforms: { time: clock }, vertexShader,
    fragmentShader: `
      uniform float time; varying vec2 vUv;
      void main(){
        vec2 p=vUv;
        float flow=p.x+.13*sin(p.y*5.8-time*.48)+.055*sin(p.y*13.+time*.25);
        float edge=.50+.07*sin(time*.32);
        vec3 navy=vec3(.025,.075,.14), coral=vec3(.66,.20,.105);
        float silk=.55+.45*sin(flow*20.+p.y*3.-time*.6);
        vec3 color=mix(navy*(.7+silk*.8),coral*(.7+silk*.45),smoothstep(edge-.055,edge+.055,flow));
        float vein=pow(.5+.5*sin(flow*85.+sin(p.y*12.-time*.35)*1.3),24.);
        float sweep=pow(.5+.5*sin(p.y*4.-time*.75),8.);
        color+=vec3(.82,.52,.19)*vein*(.12+.36*sweep);
        float seam=exp(-abs(flow-edge)*65.);
        color+=vec3(.98,.66,.29)*seam*.6;
        gl_FragColor=vec4(color,1.);
        #include <colorspace_fragment>
      }`,
  });
  const artwork = add(new THREE.PlaneGeometry(1.50, 2.00), artMaterial, 'atlas-living-artwork');
  artwork.rotation.y = -.10;
  artwork.position.set(3 + Math.sin(-.10) * .105, 1.34 + 1.37, -2.12 + Math.cos(-.10) * .105);

  // Broad, slow water caustics read as moving water instead of blinking dots.
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms: { time: clock }, vertexShader, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    fragmentShader: `
      uniform float time; varying vec2 vUv;
      void main(){
        vec2 p=(vUv-.5)*2.; float r=length(p);
        float a=sin(p.x*24.+sin(p.y*17.+time*.7)*2.+time*.9);
        float b=sin(p.y*28.+sin(p.x*12.-time*.6)*2.-time*.8);
        float caustic=pow(max(0.,1.-abs(a+b)*.65),8.);
        float ripple=pow(.5+.5*sin(r*44.-time*2.),12.);
        float fade=1.-smoothstep(.75,1.,r);
        gl_FragColor=vec4(vec3(.32,.65,.73),(.16*caustic+.10*ripple)*fade);
      }`,
  });
  pools.forEach((pool, i) => {
    const water = add(new THREE.CircleGeometry(1, 64), waterMaterial, `atlas-water-${i}`);
    water.rotation.x = -Math.PI / 2; water.position.set(pool.x, .355, pool.z);
    water.scale.set(pool.rx, pool.rz, 1);
  });

  // Eight visible water jets, with travelling highlights and a breathing crown.
  const jetMaterial = new THREE.ShaderMaterial({
    uniforms: { time: clock }, vertexShader, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
    fragmentShader: `uniform float time; varying vec2 vUv;
      void main(){float stream=.45+.55*pow(.5+.5*sin(vUv.x*48.-time*8.),4.);
      gl_FragColor=vec4(.5,.83,.94,stream*.65);}`,
  });
  const fountain = new THREE.Group(); fountain.name = 'atlas-fountain-jets';
  fountain.position.set(-.05, .99, 2.98); group.add(fountain);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU;
    const points = Array.from({ length: 33 }, (_, j) => {
      const u = j / 32;
      return new THREE.Vector3(Math.cos(a)*.28*u, .38*(1-u)+.60*4*u*(1-u), Math.sin(a)*.28*u);
    });
    const jet = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 40, .009, 5, false), jetMaterial);
    fountain.add(jet);
  }
  const fountainRings = Array.from({ length: 3 }, (_, i) => {
    const ring = add(ringGeometry, basic(0x8ad9ec), `atlas-fountain-ripple-${i}`);
    ring.rotation.x = -Math.PI / 2; ring.position.set(-.05, .99 + i * .002, 2.98);
    return ring;
  });

  // Four moving heads and feathered beam edges, choreographed as a live stage.
  const beamGeometry = new THREE.ConeGeometry(.31, 1, 32, 1, true);
  const beamMaterial = new THREE.ShaderMaterial({
    uniforms: { strength: { value: .15 } }, vertexShader, transparent: true,
    side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    fragmentShader: `uniform float strength; varying vec2 vUv;
      void main(){float fade=sin(vUv.y*3.14159);gl_FragColor=vec4(1.,.77,.43,fade*strength);}`,
  });
  const up = new THREE.Vector3(0, 1, 0), direction = new THREE.Vector3();
  const beams = [-.72, -.24, .24, .72].map((x, i) => {
    const beam = add(beamGeometry, beamMaterial.clone(), `atlas-stage-beam-${i}`);
    const spot = glow(`atlas-stage-spot-${i}`, .55);
    return { beam, spot, origin: new THREE.Vector3(-3+x, 3.4, -1.94), target: new THREE.Vector3(), i };
  });
  // Animate the existing lights, keeping the same lighting and shadow budget.
  const lights = root.children.filter(object => object.isPointLight).map(light => ({light, base:light.intensity}));

  function update(time) {
    clock.value = time;
    life.update(time);
    signals.forEach(({curve, head, arrival, phase}, index) => {
      const beat = ((time - phase) % ATLAS_CYCLE + ATLAS_CYCLE) % ATLAS_CYCLE;
      const travel = beat / 4.2;
      const visible = smooth(beat / .4) * (1 - smooth((beat - 4.1) / .6));
      curve.getPointAt(clamp(travel), head.position); head.position.y += .15;
      head.material.opacity = visible;
      head.scale.setScalar(.32 + .08 * Math.sin(clamp(travel) * Math.PI));
      for (let j = 0; j < tailCount; j++) {
        const u = travel - j * .007;
        curve.getPointAt(clamp(u), point); point.y += .15;
        const k = (index * tailCount + j) * 3;
        trailPositions[k] = point.x; trailPositions[k+1] = point.y; trailPositions[k+2] = point.z;
        const fade = visible * (u >= 0 && u <= 1 ? (1-j/tailCount)**1.3 : 0);
        trailColors[k] = fade; trailColors[k+1] = fade*.63; trailColors[k+2] = fade*.22;
      }
      const response = clamp((beat - 4) / 2.4);
      arrival.scale.setScalar(.12 + response * .64);
      arrival.material.opacity = Math.sin(response * Math.PI) * .55;
    });
    trailGeometry.attributes.position.needsUpdate = true;
    trailGeometry.attributes.color.needsUpdate = true;
    const heartbeat = .5 + .5 * Math.sin(time * TAU / 6);
    compass.scale.setScalar(.55 + heartbeat * .35); compass.material.opacity = .6 + heartbeat * .3;
    compassRings.forEach((ring, i) => {
      const u = fract(time / 6 + i*.5);
      ring.scale.setScalar(.18 + u*.43); ring.material.opacity = Math.sin(u*Math.PI)*.45;
    });
    fountain.scale.y = .88 + .12 * Math.sin(time * 1.1);
    fountainRings.forEach((ring, i) => {
      const u = fract(time*.55+i/3); ring.scale.setScalar(.05+u*.26); ring.material.opacity = Math.sin(u*Math.PI)*.45;
    });
    beams.forEach(({beam, spot, origin, target, i}) => {
      target.set(-3 + Math.sin(time*.75+i*.85)*.58, 1.91, -1.48 + Math.cos(time*.48+i*1.2)*.32);
      direction.copy(origin).sub(target); const length = direction.length();
      beam.position.copy(origin).add(target).multiplyScalar(.5);
      beam.quaternion.setFromUnitVectors(up, direction.normalize()); beam.scale.y = length;
      const stageCue = Math.sin(clamp((atlasPhase(time)-4)/3)*Math.PI);
      beam.material.uniforms.strength.value = .045 + .06*stageCue + .025*(.5+.5*Math.sin(time*.9+i));
      spot.position.copy(target); spot.position.y += .02; spot.material.opacity = .35;
    });
    lights.forEach(({light, base}, i) => {
      const local = ((time - [0, 4, 2, 0][i] - 4) % ATLAS_CYCLE + ATLAS_CYCLE) % ATLAS_CYCLE;
      light.intensity = base * (1 + .55 * Math.sin(clamp(local/3)*Math.PI));
    });
  }
  update(0);
  return { update, group };
}
