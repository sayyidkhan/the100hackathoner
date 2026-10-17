import { geometryAOHash } from './storybook-surface.js';

// Offline contact occlusion only: live lights/shadows remain free to follow the
// animated cast and day/night theme. A stale bake is ignored atomically.
export function applyPalOcclusion(root) {
  const meshes=[];
  root.traverse(mesh=>{if(mesh.isMesh)meshes.push(mesh);});
  root.userData.bakedAOStatus='loading';
  root.userData.bakedAOPromise=(async()=>{
    try {
      const response=await fetch(new URL('../assets/pal-ao-v1.bin',import.meta.url));
      if(!response.ok)throw new Error('Unavailable Pal surface bake');
      const buffer=await response.arrayBuffer();
      if(root.userData.disposed)return false;
      const view=new DataView(buffer),header=16+meshes.length*16;
      const vertices=meshes.reduce((sum,m)=>sum+m.geometry.attributes.position.count,0);
      let valid=buffer.byteLength===header+vertices*2 && view.getUint32(0,true)===0x324f4142 && view.getUint32(4,true)===meshes.length && view.getUint32(8,true)===vertices;
      let expected=header;const records=[];
      for(let i=0;valid&&i<meshes.length;i++) {
        const count=view.getUint32(16+i*16,true),offset=view.getUint32(20+i*16,true),hash=view.getUint32(24+i*16,true);
        valid=count===meshes[i].geometry.attributes.position.count&&offset===expected&&hash===geometryAOHash(meshes[i].geometry);
        records.push({count,offset});expected+=count*2;
      }
      if(!valid){root.userData.bakedAOStatus='stale';return false;}
      meshes.forEach((mesh,i)=>{
        const color=mesh.geometry.attributes.color;
        if(!color)return;
        const {count,offset}=records[i];const bytes=new Uint8Array(buffer,offset,count*2);
        for(let vertex=0;vertex<count;vertex++) {
          // A shallow bake catches seams and folds without painting deep,
          // immovable shadows onto surfaces near a moving character.
          const strength=mesh.userData.contactShadeStrength??.54;
          const shade=1-strength+strength*Math.pow(bytes[vertex*2]/255,1.6);
          color.setXYZ(vertex,color.getX(vertex)*shade,color.getY(vertex)*shade,color.getZ(vertex)*shade);
        }
        color.needsUpdate=true;
      });
      root.userData.bakedAOStatus='ready';root.userData.requestRender?.();return true;
    }catch{if(!root.userData.disposed)root.userData.bakedAOStatus='unavailable';return false;}
  })();
}
