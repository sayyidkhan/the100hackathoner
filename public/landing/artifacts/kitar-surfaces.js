// Fine, non-repeating oak figure: longitudinal fibres and gently curving annual grain.
export function kitarOak(T){
 const n=512,data=new Uint8Array(n*n*4);let seed=28;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const warp=x+5*Math.sin(y*.008)+3*Math.sin(y*.019+x*.009),grain=Math.sin(warp*.17+Math.sin(warp*.034)*2),fibre=Math.sin(warp*1.8+Math.sin(y*.05)*.4),pore=random()>.995?-26:0;
  const v=225+grain*11+fibre*4+(random()-.5)*9+pore,i=(y*n+x)*4;data.set([v,v-5,v-12,255],i);
 }
 const map=new T.DataTexture(data,n,n);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.anisotropy=8;map.needsUpdate=true;return map;
}
