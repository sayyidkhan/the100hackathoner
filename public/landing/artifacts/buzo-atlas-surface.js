// Vertex ambient occlusion is baked offline against the complete paper world.
// Ambient visibility shapes indirect light; a broad studio key supplies soft
// baked direct shadows. Both use local geometry rather than a screen-space blur.
export function geometryAOHash(geometry) {
  let hash = 2166136261;
  for (const attribute of [geometry.getAttribute('position'), geometry.getAttribute('normal'), geometry.index]) {
    if (!attribute) continue;
    const array = attribute.array;
    const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
    for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619) >>> 0;
  }
  return hash;
}

function addAmbientOcclusion(material) {
  if ((!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) || material.userData.storybookAO) return;
  material.userData.storybookAO = true;
  const previousCompile = material.onBeforeCompile;
  const previousCacheKey = material.customProgramCacheKey.bind(material);
  const cacheKey = previousCacheKey();
  material.onBeforeCompile = function (shader, renderer) {
    previousCompile.call(this, shader, renderer);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float bakedAO;\nattribute float bakedKeyShadow;\nvarying float vStorybookAO;\nvarying float vStorybookKeyShadow;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvStorybookAO = bakedAO;\nvStorybookKeyShadow = bakedKeyShadow;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vStorybookAO;\nvarying float vStorybookKeyShadow;')
      .replace('#include <aomap_fragment>', `#include <aomap_fragment>
        float storybookOcclusion = mix(0.28, 1.0, clamp(vStorybookAO, 0.0, 1.0));
        reflectedLight.indirectDiffuse *= storybookOcclusion;
        reflectedLight.indirectSpecular *= storybookOcclusion;
        float storybookKeyVisibility = clamp(vStorybookKeyShadow, 0.0, 1.0);
        // Keep the gallery key live; use the bake only for ambient contact shading.
        
        #ifdef USE_CLEARCOAT
          clearcoatSpecularIndirect *= storybookOcclusion;
          
        #endif
        #ifdef USE_SHEEN
          sheenSpecularIndirect *= storybookOcclusion;
          
        #endif
      `);
  };
  material.customProgramCacheKey = () => `${cacheKey}:storybook-baked-ao-key-v2`;
  material.needsUpdate = true;
}

export function applyBakedAO(THREE, root) {
  if (root.userData.bakedAOPromise) return root.userData.bakedAOPromise;
  const meshes = [];
  root.traverse(mesh => {
    if (!mesh.isMesh) return;
    meshes.push(mesh);
    const count = mesh.geometry.getAttribute('position').count;
    for (const name of ['bakedAO', 'bakedKeyShadow']) {
      const values = new Uint8Array(count); values.fill(255);
      mesh.geometry.setAttribute(name, new THREE.BufferAttribute(values, 1, true));
    }
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) addAmbientOcclusion(material);
  });
  root.userData.bakedAOStatus = 'loading';
  root.userData.bakedAOPromise = (async () => {
    try {
      const response = await fetch(new URL('../assets/buzo-atlas-ao-v1.bin', import.meta.url), { cache: 'no-cache' });
      if (!response.ok) {
        if (!root.userData.disposed) root.userData.bakedAOStatus = 'unavailable';
        return false;
      }
      const buffer = await response.arrayBuffer();
      if (root.userData.disposed) return false;
      const view = new DataView(buffer);
      const totalVertices = meshes.reduce((sum, mesh) => sum + mesh.geometry.getAttribute('position').count, 0);
      const headerSize = 16 + meshes.length * 16;
      let valid = buffer.byteLength >= headerSize
        && view.getUint32(0, true) === 0x324f4142
        && view.getUint32(4, true) === meshes.length
        && view.getUint32(8, true) === totalVertices
        && buffer.byteLength === headerSize + totalVertices * 2;
      const records = [];
      let expectedOffset = headerSize;
      for (let i = 0; valid && i < meshes.length; i++) {
        const count = view.getUint32(16 + i * 16, true);
        const offset = view.getUint32(20 + i * 16, true);
        const hash = view.getUint32(24 + i * 16, true);
        valid = count === meshes[i].geometry.getAttribute('position').count
          && offset === expectedOffset && offset + count * 2 <= buffer.byteLength
          && hash === geometryAOHash(meshes[i].geometry);
        records.push({ count, offset }); expectedOffset += count * 2;
      }
      if (!valid) {
        root.userData.bakedAOStatus = 'stale';
        console.warn('Storybook AO bake does not match this geometry. Re-run scripts/bake-buzo-atlas-ao.mjs.');
        return false;
      }
      // Validate the entire file first, so one stale mesh cannot leave a mix
      // of baked and unbaked surfaces in the same miniature.
      meshes.forEach((mesh, i) => {
        const { offset, count } = records[i];
        const ao = mesh.geometry.getAttribute('bakedAO');
        const key = mesh.geometry.getAttribute('bakedKeyShadow');
        const bytes = new Uint8Array(buffer, offset, count * 2);
        for (let vertex = 0; vertex < count; vertex++) {
          ao.array[vertex] = bytes[vertex * 2]; key.array[vertex] = bytes[vertex * 2 + 1];
        }
        ao.needsUpdate = true; key.needsUpdate = true;
        // Keep live shadows as the fallback until a complete matching bake
        // has arrived. The soft baked key then replaces hard shadow reception.
        mesh.receiveShadow = true;
      });
      root.userData.bakedAOStatus = 'ready';
      root.userData.requestRender?.();
      return true;
    } catch {
      // A missing bake leaves the sculpture fully lit and interactive.
      if (!root.userData.disposed) root.userData.bakedAOStatus = 'unavailable';
      return false;
    }
  })();
  return root.userData.bakedAOPromise;
}
