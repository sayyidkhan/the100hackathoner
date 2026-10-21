import { geometryAOHash } from './storybook-surface.js';

// Offline ambient contact shading. Live light and moving shadows remain dynamic.
export function applyMediVoiceAO(T,root) {
  const meshes=[];
  root.traverse(o=>{if(o.isMesh)meshes.push(o);});
  const hashes=meshes.map(mesh=>geometryAOHash(mesh.geometry));
  for(const mesh of meshes){
    const values=new Uint8Array(mesh.geometry.attributes.position.count);values.fill(255);
    mesh.geometry.setAttribute('mediAO',new T.BufferAttribute(values,1,true));
    const m=mesh.material;
    if(!m.isMeshStandardMaterial&&!m.isMeshPhysicalMaterial||m.userData.mediAO)continue;
    m.userData.mediAO=true;
    const compile=m.onBeforeCompile,cache=m.customProgramCacheKey();
    m.onBeforeCompile=function(shader,renderer){
      compile.call(this,shader,renderer);
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float mediAO; varying float vMediAO;').replace('#include <begin_vertex>','#include <begin_vertex>\nvMediAO=mediAO;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vMediAO;').replace('#include <aomap_fragment>',`#include <aomap_fragment>
        float contact = mix(0.32, 1.0, clamp(vMediAO,0.0,1.0));
        reflectedLight.indirectDiffuse *= contact;
        reflectedLight.indirectSpecular *= contact;
        reflectedLight.directDiffuse *= mix(.88,1.0,clamp(vMediAO,0.0,1.0));
      `);
    };
    m.customProgramCacheKey=()=>`${cache}:medivoice-contact-v1`;m.needsUpdate=true;
  }
  root.userData.bakedAOStatus='loading';
  root.userData.bakedAOPromise=(async()=>{
    try{
      const response=await fetch(new URL('../assets/medivoice-ao-v1.bin',import.meta.url));
      if(!response.ok)throw new Error('MediVoice contact bake unavailable');
      const buffer=await response.arrayBuffer();if(root.userData.disposed)return false;
      const view=new DataView(buffer),header=16+meshes.length*16;
      const vertices=meshes.reduce((sum,m)=>sum+m.geometry.attributes.position.count,0);
      let valid=buffer.byteLength===header+vertices*2&&view.getUint32(0,true)===0x324f4142&&view.getUint32(4,true)===meshes.length&&view.getUint32(8,true)===vertices;
      let expected=header;const records=[];
      for(let i=0;valid&&i<meshes.length;i++){
        const count=view.getUint32(16+i*16,true),offset=view.getUint32(20+i*16,true),hash=view.getUint32(24+i*16,true);
        valid=count===meshes[i].geometry.attributes.position.count&&offset===expected&&hash===hashes[i];
        records.push({count,offset});expected+=count*2;
      }
      if(!valid){root.userData.bakedAOStatus='stale';return false;}
      meshes.forEach((mesh,i)=>{
        const {count,offset}=records[i],ao=mesh.geometry.attributes.mediAO;
        for(let j=0;j<count;j++)ao.array[j]=view.getUint8(offset+j*2);
        ao.needsUpdate=true;
      });
      root.userData.bakedAOStatus='ready';root.userData.requestRender?.();return true;
    }catch{if(!root.userData.disposed)root.userData.bakedAOStatus='unavailable';return false;}
  })();
}
