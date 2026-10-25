// Small repeatable material tiles, generated locally; no texture downloads.
export function amigoSurfaces(T,m){
  function tile(color,kind){
    const n=256,data=new Uint8Array(n*n*4),base=new T.Color(color).convertLinearToSRGB();let seed=26;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/4294967296;
      const wood=Math.sin(y*.32+Math.sin(x*.025)*3+Math.sin(y*.055))* .09+Math.sin(y*1.8)*.025;
      const weave=((x%4===0?-.08:0)+(y%4===0?-.08:0));
      const mineral=Math.sin(x*.045+Math.sin(y*.04))* .025+(noise>.985?-.17:0);
      const v=1+(kind==='wood'?wood:kind==='linen'?weave:mineral)+(noise-.5)*.08,i=(y*n+x)*4;
      data.set([Math.min(255,base.r*v*255),Math.min(255,base.g*v*255),Math.min(255,base.b*v*255),255],i);
    }
    const map=new T.DataTexture(data,n,n);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
  }
  for(const [key,color,kind] of [['walnut',0x573924,'wood'],['rust',0xac4c32,'linen'],['teal',0x174a4e,'linen'],['stone',0xe5dac5,'mineral']]){
    m[key].map=tile(color,kind);m[key].color.setHex(0xffffff);m[key].roughness=key==='stone'?.72:key==='walnut'?.45:.48;
  }
  m.brass.color.setHex(0xc09a59);m.brass.roughness=.27;m.brass.envMapIntensity=1.25;
  m.signal=new T.MeshStandardMaterial({color:0xffd59a,emissive:0xffa950,emissiveIntensity:.65,roughness:.4});
}
