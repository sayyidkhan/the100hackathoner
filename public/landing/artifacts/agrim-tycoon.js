import { buildAgrimCity } from './agrim-city.js';
import { applyBakedAO } from './buzo-atlas-surface.js';

export function createArtifact(T, { bake = false } = {}) {
  const { root, materials, finish, lampPositions, layoutScale } = buildAgrimCity(T);
  root.updateMatrixWorld(true);
  const framingPoints=[];
  root.traverse(object => {
    if (!object.isMesh) return;
    const geometry=object.geometry, params=geometry.parameters;
    if (geometry.type === 'CylinderGeometry' && params.radiusTop > 1) {
      for(let i=0;i<32;i++)for(const y of [-params.height/2,params.height/2])
        framingPoints.push(new T.Vector3(Math.cos(i*Math.PI/16)*params.radiusTop,y,Math.sin(i*Math.PI/16)*params.radiusTop).applyMatrix4(object.matrixWorld));
    } else if (geometry.type === 'TorusGeometry' && params.radius > 1) {
      for(let i=0;i<48;i++)for(const z of [-params.tube,params.tube])
        framingPoints.push(new T.Vector3(Math.cos(i*Math.PI/24)*(params.radius+params.tube),Math.sin(i*Math.PI/24)*(params.radius+params.tube),z).applyMatrix4(object.matrixWorld));
    } else {
      geometry.computeBoundingBox();const b=geometry.boundingBox;
      for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])
        framingPoints.push(new T.Vector3(x,y,z).applyMatrix4(object.matrixWorld));
    }
  });
  const bounds=new T.Box3().setFromObject(root), center=bounds.getCenter(new T.Vector3());
  framingPoints.forEach(p=>p.sub(new T.Vector3(center.x,bounds.min.y,center.z)));
  const model=finish(76);
  model.userData={...model.userData,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:-.06,initialElevation:.49,framingPoints};
  // Add practical lights after mesh batching so they remain live light sources.
  // Local, shadow-free lights illuminate paths without extra shadow-map passes.
  const nightLights = new T.Group();
  nightLights.name = 'agrim-night-lights';
  const origin = new T.Vector3(center.x,bounds.min.y,center.z);
  const glowSize = 64, pixels = new Uint8Array(glowSize * glowSize * 4);
  for (let y=0;y<glowSize;y++) for (let x=0;x<glowSize;x++) {
    const radius = Math.hypot((x+.5)/glowSize*2-1,(y+.5)/glowSize*2-1);
    const i = (y*glowSize+x)*4;
    pixels[i]=pixels[i+1]=pixels[i+2]=255;
    pixels[i+3]=Math.round(Math.pow(Math.max(0,1-radius),3)*190);
  }
  const glowMap = new T.DataTexture(pixels,glowSize,glowSize);
  glowMap.needsUpdate = true;
  const haloMaterial = new T.SpriteMaterial({map:glowMap,color:0xffb24d,
    transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
  for (const [index, position] of lampPositions.entries()) {
    const light = new T.PointLight(0xffb65c,.85,1.45,2);
    light.position.copy(position).sub(origin);
    // Keep the light budget bounded; every lantern still has its own halo.
    if(index % Math.max(1,Math.ceil(lampPositions.length/9)) === 0) nightLights.add(light);
    const halo = new T.Sprite(haloMaterial);
    halo.position.copy(light.position);
    halo.scale.set(.38,.38,1);
    nightLights.add(halo);
  }
  for (const [x,y,z] of [[0,1.3,-1.15],[1.7,1.15,.1]]) {
    const light = new T.PointLight(0x66cce8,.5,1.65,2);
    light.position.set(x,y,z).multiply(layoutScale).sub(origin);
    nightLights.add(light);
  }
  nightLights.visible = false;
  model.add(nightLights);
  model.traverse(object => {
    if(object.isMesh && ['towerGlass','glow','signal'].some(key => object.material === materials[key])) {
      object.userData.noShadow=true;object.userData.noAO=true;
    }
  });
  // Day mode has no emission or halos; night mode lights the city itself.
  model.userData.setTheme = theme => {
    const night = theme === 'dark';
    nightLights.visible = night;
    materials.glow.color.setHex(night ? 0xffdf9b : 0xb9c7c6);
    materials.glow.emissiveIntensity = night ? 4.5 : 0;
    materials.signal.emissiveIntensity = night ? 3 : 0;
    materials.glass.emissive.setHex(0x397e8c);
    materials.glass.emissiveIntensity = night ? .45 : 0;
  };
  model.userData.annotations = [
    { id: 'community', position: [-1.95, 1.37, .60] },
    { id: 'academy', position: [0, 2.95, -1.75] },
    { id: 'machines', position: [2.0, 2.78, -.20] },
    { id: 'mayor', position: [0, .64, 2.06] },
  ];
  model.userData.annotations.forEach(annotation => { annotation.position = new T.Vector3(...annotation.position).multiply(layoutScale).sub(origin).toArray(); });
  if(!bake && typeof document !== 'undefined') applyBakedAO(T, model, '../assets/agrim-city-ao-v2.bin', 10000);
  return model;
}
