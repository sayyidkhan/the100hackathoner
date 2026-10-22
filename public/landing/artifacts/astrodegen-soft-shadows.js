// Local upgrade of the r186 five-tap hardware-PCF kernel. The rest of the
// renderer's shadow machinery stays intact, including moving-caster shadows.
// No global ShaderChunk or shared renderer state is changed.
export function applyObservatorySoftShadows(T, root) {
  if (root.userData.observatorySoftShadowStatus === 'installed') return true;
  const chunk = T.ShaderChunk?.shadowmap_pars_fragment;
  if (typeof chunk !== 'string') {
    root.userData.observatorySoftShadowStatus = 'unsupported';
    return false;
  }
  const functionStart = chunk.indexOf('float getShadow( sampler2DShadow');
  const functionEnd = chunk.indexOf('#elif defined( SHADOWMAP_TYPE_VSM )', functionStart);
  const kernelStart = chunk.indexOf('shadow = (', functionStart);
  const ending = ') * 0.2;';
  const kernelEnd = chunk.indexOf(ending, kernelStart);
  const originalKernel = chunk.slice(kernelStart, kernelEnd + ending.length);
  // A changed vendor implementation should keep native shadows, not receive a
  // partial shader substitution with an unknown sampler or depth convention.
  if (functionStart < 0 || functionEnd < functionStart || kernelStart < functionStart
      || kernelEnd < kernelStart || kernelEnd >= functionEnd
      || (originalKernel.match(/vogelDiskSample\(\s*[0-4],\s*5,\s*phi\s*\)/g) ?? []).length !== 5) {
    root.userData.observatorySoftShadowStatus = 'unsupported';
    return false;
  }
  const taps = 24;
  const samples = Array.from({ length: taps }, (_, index) =>
    `texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( ${index}, ${taps}, phi ) * radius, shadowCoord.z ) )`);
  const kernel = `shadow = (\n${samples.join(' +\n')}\n) * ${(1 / taps).toPrecision(15)};`;
  const localChunk = chunk.slice(0, kernelStart) + kernel + chunk.slice(kernelEnd + ending.length);
  const materials = new Map();
  function receiverMaterial(original) {
    if (!original.isMeshStandardMaterial && !original.isMeshPhysicalMaterial) return original;
    if (original.userData.observatorySoftShadows) return original;
    if (materials.has(original)) return materials.get(original);
    const material = original.clone();
    const previousCompile = original.onBeforeCompile;
    const previousKey = original.customProgramCacheKey.call(original);
    material.onBeforeCompile = function (shader, renderer) {
      previousCompile.call(this, shader, renderer);
      shader.fragmentShader = shader.fragmentShader.replace('#include <shadowmap_pars_fragment>', localChunk);
    };
    material.customProgramCacheKey = () => `${previousKey}:observatory-vogel-pcf-${taps}-v1`;
    material.userData.observatorySoftShadows = true;
    material.needsUpdate = true;
    materials.set(original, material);
    return material;
  }
  root.traverse(mesh => {
    if (!mesh.isMesh || !mesh.receiveShadow || mesh.userData.noShadow
        || mesh.geometry?.getAttribute('lunarDirection')) return;
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(receiverMaterial) : receiverMaterial(mesh.material);
  });
  root.userData.observatorySoftShadowStatus = 'installed';
  root.userData.observatorySoftShadowTaps = taps;
  return true;
}
