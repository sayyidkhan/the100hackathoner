// Soft local atmosphere for the Buzo miniature. Coordinates match the original
// (pre-finish) scene; preserve the returned group when batching the sculpture.
export function createBuzoAtmosphere(THREE, parent) {
  const group = new THREE.Group();
  group.name = 'buzo-nightlife-atmosphere';
  group.userData.excludeFromFraming = true;
  parent.add(group);
  const noRaycast = () => {};
  const transparent = {
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  };

  // Open cones taper to the lamp. A view-facing falloff softens their edges;
  // longitudinal fade keeps the top from reading as a solid cut-off surface.
  function beam(name, origin, height, radius, color, phase) {
    const pivot = new THREE.Group();
    pivot.name = name;
    pivot.position.set(...origin);
    pivot.userData.excludeFromFraming = true;
    group.add(pivot);
    const geometry = new THREE.CylinderGeometry(radius, .022, height, 24, 6, true);
    geometry.translate(0, height / 2, 0);
    const material = new THREE.ShaderMaterial({
      ...transparent,
      side: THREE.DoubleSide,
      uniforms: {
        beamColor: { value: new THREE.Color(color) },
        strength: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vUv = uv;
          vec4 p = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = -p.xyz;
          gl_Position = projectionMatrix * p;
        }
      `,
      fragmentShader: `
        uniform vec3 beamColor;
        uniform float strength;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float facing = pow(abs(dot(normalize(vNormal), normalize(vView))), 1.8);
          float foot = smoothstep(0.0, 0.07, vUv.y);
          float top = 1.0 - smoothstep(0.24, 1.0, vUv.y);
          float grain = 0.91 + 0.09 * sin(vUv.y * 38.0);
          float alpha = strength * facing * foot * top * grain;
          gl_FragColor = vec4(beamColor, alpha);
          #include <colorspace_fragment>
        }
      `,
    });
    const cone = new THREE.Mesh(geometry, material);
    cone.name = `${name}-volume`;
    cone.userData.noShadow = true;
    cone.raycast = noRaycast;
    cone.renderOrder = 8;
    pivot.add(cone);
    const sourceMaterial = new THREE.MeshBasicMaterial({ ...transparent, color, opacity: .4 });
    const source = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 8), sourceMaterial);
    source.name = `${name}-lamp`;
    source.userData.noShadow = true;
    source.scale.set(1, .5, 1);
    source.raycast = noRaycast;
    pivot.add(source);
    return { pivot, material, sourceMaterial, phase };
  }
  const beams = [
    beam('live-music-sweep', [-1.86, .92, .49], 2.15, .46, 0xffc688, .2),
    beam('after-hours-sweep', [1.88, .98, 1.08], 2.10, .48, 0xbb9fff, 2.4),
    beam('after-hours-cross-sweep', [.83, .98, 1.09], 2.02, .42, 0x93dce4, 5.4),
  ];

  // Two expanding flat ripples per stage make a selected venue feel alive.
  // The radial alpha curve makes each annulus read as illumination, not metal.
  const pulseRings = [];
  const ringSpecs = [
    { center: [-1.67, .433, .61], color: 0xffb57c, energyIndex: 0, radius: .76 },
    { center: [1.34, .421, 1.10], color: 0xb59aff, energyIndex: 2, radius: .76 },
  ];
  ringSpecs.forEach(({ center, color, energyIndex, radius }, stage) => {
    for (let i = 0; i < 2; i++) {
      const material = new THREE.ShaderMaterial({
        ...transparent,
        side: THREE.DoubleSide,
        uniforms: { ringColor: { value: new THREE.Color(color) }, strength: { value: 0 } },
        vertexShader: `
          varying float vRadius;
          void main() {
            vRadius = length(position.xy);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 ringColor;
          uniform float strength;
          varying float vRadius;
          void main() {
            float edge = smoothstep(0.78, 0.87, vRadius) * (1.0 - smoothstep(0.90, 1.0, vRadius));
            gl_FragColor = vec4(ringColor, strength * edge);
            #include <colorspace_fragment>
          }
        `,
      });
      const m = new THREE.Mesh(new THREE.RingGeometry(.78, 1, 48, 2), material);
      m.name = `venue-${stage}-soft-pulse-${i}`;
      m.userData.noShadow = true;
      m.position.set(...center);
      m.rotation.x = -Math.PI / 2;
      m.raycast = noRaycast;
      m.renderOrder = 7;
      group.add(m);
      pulseRings.push({ m, material, energyIndex, radius, offset: i * .5 + stage * .17 });
    }
  });

  // Camera-facing points above the rooftop: a few warm motes with a calm rise,
  // rather than a field of confetti. Motion lives entirely in the shader.
  const count = 12;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const a = i * 2.399963;
    const r = .16 + .30 * ((i * 7) % 11) / 10;
    positions[i * 3] = 1.47 + Math.cos(a) * r;
    positions[i * 3 + 1] = 1.72;
    positions[i * 3 + 2] = -.68 + Math.sin(a) * r * .8;
    seeds[i] = (i * .61803398875) % 1;
  }
  const bokehGeometry = new THREE.BufferGeometry();
  bokehGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  bokehGeometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
  const bokehMaterial = new THREE.ShaderMaterial({
    ...transparent,
    uniforms: {
      time: { value: 0 },
      strength: { value: 0 },
      moteColor: { value: new THREE.Color(0xffdfaa) },
    },
    vertexShader: `
      attribute float seed;
      uniform float time;
      varying float vAlpha;
      void main() {
        float phase = fract(time / 18.0 + seed);
        vec3 p = position;
        p.y += phase * 0.50;
        p.x += sin(time * 0.34906585 + seed * 21.0) * 0.065;
        p.z += cos(time * 0.34906585 + seed * 17.0) * 0.04;
        vAlpha = sin(phase * 3.14159265) * (0.66 + 0.34 * sin(time * 1.3962634 + seed * 28.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp((0.052 + seed * 0.026) * 700.0 / max(1.0, -mv.z), 1.0, 8.0);
      }
    `,
    fragmentShader: `
      uniform vec3 moteColor;
      uniform float strength;
      varying float vAlpha;
      void main() {
        float radius = length(gl_PointCoord - vec2(0.5)) * 2.0;
        float soft = 1.0 - smoothstep(0.05, 1.0, radius);
        gl_FragColor = vec4(moteColor, soft * soft * vAlpha * strength);
        #include <colorspace_fragment>
      }
    `,
  });
  const bokeh = new THREE.Points(bokehGeometry, bokehMaterial);
  bokeh.name = 'rooftop-warm-bokeh';
  bokeh.frustumCulled = false;
  bokeh.raycast = noRaycast;
  bokeh.renderOrder = 9;
  group.add(bokeh);

  const energy = (energies, i) => Math.max(0, Math.min(1, Number.isFinite(energies[i]) ? energies[i] : 0));
  function animate(t, energies = [1, 1, 1], dark = true) {
    const time = Number.isFinite(t) ? Math.max(0, t) : 0;
    const nightScale = dark ? 1 : .24;
    beams.forEach(({ pivot, material, sourceMaterial, phase }, i) => {
      const e = energy(energies, i === 0 ? 0 : 2);
      pivot.rotation.x = -.12 + Math.sin(time * Math.PI * 2 / 18 + phase) * .18;
      pivot.rotation.z = Math.sin(time * Math.PI * 4 / 18 + phase) * .19;
      material.uniforms.strength.value = (.012 + e * .34) * nightScale;
      sourceMaterial.opacity = (.18 + e * .5) * nightScale;
    });
    pulseRings.forEach(({ m, material, energyIndex, radius, offset }) => {
      const phase = (time * 4 / 18 + offset) % 1;
      m.scale.setScalar(.16 + phase * radius);
      material.uniforms.strength.value = Math.sin(phase * Math.PI) * (1 - phase) * (.035 + energy(energies, energyIndex) * .28) * nightScale;
    });
    bokehMaterial.uniforms.time.value = time;
    bokehMaterial.uniforms.strength.value = (.08 + energy(energies, 1) * .76) * nightScale;
  }

  animate(0);
  return { group, animate };
}
