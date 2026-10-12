// Broad lights cross the crow at flight height, revealing graphite folds while
// keeping the warm waterfront below as a separate, quieter pool of light.
export function addCrowLighting(THREE, root, city) {
  const illumination = new THREE.Group();
  illumination.name = 'crow-exhibit-lighting';
  root.add(illumination);
  const target = new THREE.Object3D();
  target.position.set(0, 4.1, -.1);
  illumination.add(target);
  const birdKey = new THREE.SpotLight(0xf1f0f5, 48, 15, .69, .75, 2);
  birdKey.position.set(-3.8, 5.7, 5.0);
  birdKey.target = target;
  illumination.add(birdKey);
  const birdRim = new THREE.SpotLight(0xaecfff, 42, 14, .70, .72, 2);
  birdRim.position.set(1.8, 5.8, -4.6);
  birdRim.target = target;
  illumination.add(birdRim);

  // A lower cross-light reaches the underside during each downstroke.
  const birdFill = new THREE.SpotLight(0xc6d9f5, 110, 14, .67, .8, 2);
  birdFill.position.set(4.5, 3.9, 4.1);
  const fillTarget = new THREE.Object3D();
  fillTarget.position.set(.7, 3.25, .15);
  illumination.add(fillTarget);
  birdFill.target = fillTarget;
  illumination.add(birdFill);

  const cityLights = [];
  for (const [x,y,z,power] of [[-1.12,1.45,-.65,2.2],[.55,.8,.87,1.6],[1.32,.85,1.34,1.7]]) {
    const light = new THREE.PointLight(0xffbd72, power, 3.8, 2);
    light.position.set(x * city.scale.x,y * city.scale.y + city.position.y,z * city.scale.z);
    illumination.add(light);
    cityLights.push({light,power});
  }
  const size = 48;
  const pixels = new Uint8Array(size*size*4);
  for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
    const radius = Math.hypot((x+.5-size/2)/(size/2),(y+.5-size/2)/(size/2));
    const i=(y*size+x)*4;
    pixels[i]=255;pixels[i+1]=181;pixels[i+2]=97;
    pixels[i+3]=Math.round(160*Math.pow(Math.max(0,1-radius),3));
  }
  const texture = new THREE.DataTexture(pixels,size,size,THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  const glowMaterial = new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
  const glows = new THREE.Group();
  glows.name = 'city-lantern-glow';
  illumination.add(glows);
  for (const point of city.userData.lanternPositions ?? []) {
    const sprite = new THREE.Sprite(glowMaterial);
    sprite.position.copy(point).multiply(city.scale).add(city.position);
    sprite.scale.set(.28,.28,1);
    glows.add(sprite);
  }
  let night = false;
  let lastTime = 0;
  function animate(time) {
    lastTime = Number.isFinite(time) ? Math.max(0, time) : 0;
    const phase = lastTime % 18 / 18 * Math.PI * 2;
    const arrival = city.userData.destinationAwake ?? 0;
    for (let i = 0; i < cityLights.length; i++) {
      const { light, power } = cityLights[i];
      light.intensity = night ? power * (.96 + .04 * Math.sin(phase * 2 + i * 1.7) + (i === 0 ? arrival * .32 : 0)) : 0;
    }
    glowMaterial.opacity = night ? .9 + .07 * Math.sin(phase * 2) : 0;
  }
  return {
    animate,
    setTheme(theme) {
      const dark = theme === 'dark';
      night = dark;
      root.userData.studioLightScale = dark ? .48 : .92;
      birdKey.intensity = 65;
      birdRim.intensity = dark ? 60 : 30;
      birdFill.intensity = 65;
      glows.visible = dark;
      animate(lastTime);
    },
  };
}
