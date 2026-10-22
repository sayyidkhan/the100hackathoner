// Only the rigid observatory architecture receives this offline contact bake.
// Animated instruments and the moon retain their live lights and shadows.
export const OBSERVATORY_AO_QUANTIZATION = 100000;
export const OBSERVATORY_AO_MAGIC = 0x314f414f; // OAO1: ambient visibility only.

export function geometryObservatoryAOHash(geometry) {
  let hash = 2166136261;
  for (const attribute of [geometry.getAttribute('position'), geometry.getAttribute('normal'), geometry.index]) {
    if (!attribute) continue;
    // Quantization ignores subpixel V8/WebKit trigonometric differences while
    // rejecting changed surfaces, normals, indices or vertex ordering.
    const quantization = attribute === geometry.index ? 1 : OBSERVATORY_AO_QUANTIZATION;
    for (const value of attribute.array) {
      if (!Number.isFinite(value)) return -1;
      const integer = Math.round(value * quantization);
      for (let byte = 0; byte < 4; byte++) hash = Math.imul(hash ^ ((integer >>> (byte * 8)) & 255), 16777619) >>> 0;
    }
  }
  return hash;
}

function patchAmbientMaterial(original) {
  // Root batches share materials with the moving telescope and dome. A clone
  // confines the extra vertex attribute and shader to baked architecture.
  const material = original.clone();
  material.onBeforeCompile = original.onBeforeCompile;
  material.customProgramCacheKey = original.customProgramCacheKey;
  const previousCompile = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey.call(material);
  material.userData.observatoryAO = true;
  material.onBeforeCompile = function (shader, renderer) {
    previousCompile.call(this, shader, renderer);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float observatoryAO;\nvarying float vObservatoryAO;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObservatoryAO = observatoryAO;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vObservatoryAO;')
      .replace('#include <aomap_fragment>', `#include <aomap_fragment>
        float observatoryContact = mix(0.30, 1.0, clamp(vObservatoryAO, 0.0, 1.0));
        reflectedLight.indirectDiffuse *= observatoryContact;
        reflectedLight.indirectSpecular *= observatoryContact;
        #ifdef USE_CLEARCOAT
          clearcoatSpecularIndirect *= observatoryContact;
        #endif
        #ifdef USE_SHEEN
          sheenSpecularIndirect *= observatoryContact;
        #endif
      `);
  };
  material.customProgramCacheKey = () => `${previousKey}:observatory-ambient-contact-v1`;
  material.needsUpdate = true;
  return material;
}

export function applyObservatoryAO(T, root, { url = new URL('../assets/astrodegen-ao-v1.bin', import.meta.url) } = {}) {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (root.userData.observatoryAOPromise) return root.userData.observatoryAOPromise;
  const meshes = [];
  root.traverse(mesh => {
    if (mesh.isMesh && mesh.userData.observatoryAO === true) meshes.push(mesh);
  });
  root.userData.observatoryAOStatus = 'loading';
  root.userData.observatoryAOPromise = (async () => {
    try {
      if (!meshes.length) throw new Error('No rigid observatory receivers.');
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error('Contact bake unavailable.');
      const buffer = await response.arrayBuffer();
      if (root.userData.disposed) return false;
      const view = new DataView(buffer);
      const totalVertices = meshes.reduce((sum, mesh) => sum + (mesh.geometry.getAttribute('position')?.count ?? 0), 0);
      const headerSize = 16 + meshes.length * 16;
      let valid = buffer.byteLength >= headerSize
        && view.getUint32(0, true) === OBSERVATORY_AO_MAGIC
        && view.getUint32(4, true) === meshes.length
        && view.getUint32(8, true) === totalVertices
        && view.getUint32(12, true) === OBSERVATORY_AO_QUANTIZATION
        && buffer.byteLength === headerSize + totalVertices;
      const records = [];
      let expectedOffset = headerSize;
      for (let i = 0; valid && i < meshes.length; i++) {
        const geometry = meshes[i].geometry, positions = geometry.getAttribute('position'), normals = geometry.getAttribute('normal');
        const count = view.getUint32(16 + i * 16, true), offset = view.getUint32(20 + i * 16, true);
        const hash = view.getUint32(24 + i * 16, true);
        valid = positions?.itemSize === 3 && normals?.itemSize === 3
          && count === positions.count && normals.count === count
          && offset === expectedOffset && offset + count <= buffer.byteLength
          && hash === geometryObservatoryAOHash(geometry);
        records.push({ count, offset });
        expectedOffset += count;
      }
      if (!valid) {
        root.userData.observatoryAOStatus = 'stale';
        console.warn('Observatory contact bake is stale; re-run scripts/bake-astrodegen-ao.mjs.');
        return false;
      }
      // Apply only after validating the entire bake: no partial or stale stains.
      const materials = new Map();
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i], { count, offset } = records[i];
        mesh.geometry.setAttribute('observatoryAO', new T.BufferAttribute(new Uint8Array(buffer, offset, count).slice(), 1, true));
        const replace = material => {
          if (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) return material;
          if (!materials.has(material)) materials.set(material, patchAmbientMaterial(material));
          return materials.get(material);
        };
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map(replace) : replace(mesh.material);
        // receiveShadow is intentionally preserved: there is no baked key light.
      }
      root.userData.observatoryAOStatus = 'ready';
      root.userData.requestRender?.();
      return true;
    } catch {
      if (!root.userData.disposed) root.userData.observatoryAOStatus = 'unavailable';
      return false;
    }
  })();
  return root.userData.observatoryAOPromise;
}
