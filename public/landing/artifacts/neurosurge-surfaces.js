// Small deterministic PBR color/height maps, generated locally; no texture fetches.
export function mnemonicSurfaces(T) {
 let seed=2537;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function map(kind) {
  const n=256,data=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++) {
   const a=rnd(),grain=rnd();let rgb;
   if(kind==='stone'){const pore=a>.985?-.28:a>.95?-.10:0,v=pore+(grain-.5)*.06+Math.sin(x*.055+y*.033)*.017;rgb=[230+v*255,216+v*240,188+v*210];}
   else if(kind==='wood'){const wave=Math.sin(x*.14+Math.sin(y*.017)*2.3)+Math.sin(x*.66+Math.sin(y*.025)*1.4)*.30,v=wave*9+grain*13;rgb=[99+v,67+v*.7,44+v*.45];}
   else {const v=grain*17+Math.sin(x*.04+y*.06)*5;rgb=[170+v,108+v*.65,60+v*.35];}
   const i=(y*n+x)*4;data[i]=rgb[0];data[i+1]=rgb[1];data[i+2]=rgb[2];data[i+3]=255;
  }
  const tex=new T.DataTexture(data,n,n);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;return tex;
 }
 return {stone:map('stone'),walnut:map('wood'),copper:map('copper')};
}
