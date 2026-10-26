// Local, repeatable material tiles; the exhibit makes no texture network requests.
export function dustbinSurfaces(T,m){
 const entries=[['oak',0xb28655,'wood'],['walnut',0x64462d,'wood'],['cardboard',0xeadcc3,'paper'],['kraft',0xad885a,'paper'],['linen',0xccc1a5,'cloth'],['sage',0x879178,'paint'],['blue',0x176083,'metal'],['rug',0x8b9b8b,'cloth'],['tile',0xd7ba9c,'paint'],['sageDark',0x566d60,'paint']];
 for(const [key,color,kind] of entries){
  const n=256,data=new Uint8Array(n*n*4),bump=new Uint8Array(n*n*4),base=new T.Color(color).convertLinearToSRGB();let seed=29;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/4294967296;
   const grain=kind==='wood'?Math.sin(y*.33+Math.sin(x*.025)*2)*.075+Math.sin(y*1.6)*.02:kind==='cloth'?((x%4===0?-.07:0)+(y%4===0?-.07:0)):0;
   const v=1+grain+(noise-.5)*(kind==='paper'?.13:.05),i=(y*n+x)*4,h=170+grain*250+(noise-.5)*50;
   data.set([base.r*v*255,base.g*v*255,base.b*v*255,255],i);bump.set([h,h,h,255],i);
  }
  function tile(bytes,colorSpace){const tex=new T.DataTexture(bytes,n,n);if(colorSpace)tex.colorSpace=colorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;return tex;}
  m[key]=new T.MeshStandardMaterial({map:tile(data,T.SRGBColorSpace),bumpMap:tile(bump),bumpScale:kind==='cloth'?.018:kind==='paper'?.013:.007,roughness:kind==='metal'?.34:kind==='wood'?.55:.87,metalness:kind==='metal'?.55:0});
 }
 m.window=new T.MeshStandardMaterial({color:0xa8c9c6,roughness:.33,emissive:0x618886,emissiveIntensity:.25});
 m.screen=new T.MeshStandardMaterial({color:0x193f44,emissive:0x193f44,emissiveIntensity:.3});
 m.warmLight=new T.MeshStandardMaterial({color:0xffe5b0,emissive:0xffc578,emissiveIntensity:1.3});
 m.page=new T.MeshStandardMaterial({color:0xf7efd9,roughness:.85});
 m.acrylic=new T.MeshPhysicalMaterial({color:0xe6eeeb,roughness:.17,metalness:.05,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide});
 m.rubber=new T.MeshStandardMaterial({color:0x19201e,roughness:.87});
 m.pcb=new T.MeshStandardMaterial({color:0x163c31,roughness:.57});
 m.route=new T.MeshStandardMaterial({color:0x3b403d,roughness:.96});
 m.coral=new T.MeshStandardMaterial({color:0xbb6544,roughness:.65});
 m.light=new T.MeshStandardMaterial({color:0xb6d9e2,emissive:0x2f89ca,emissiveIntensity:.8});
}
