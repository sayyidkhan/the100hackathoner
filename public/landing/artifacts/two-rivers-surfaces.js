// Locally generated material maps: no network textures or per-frame canvas work.
export function riverSurfaces(T) {
  const noise = (x, y) => {
    const h=(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};
    const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,s=u*u*(3-2*u),t=v*v*(3-2*v);
    return (h(i,j)*(1-s)+h(i+1,j)*s)*(1-t)+(h(i,j+1)*(1-s)+h(i+1,j+1)*s)*t;
  };
  function pixels(fn, size=512, color=true) {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
    const ctx=canvas.getContext('2d'),img=ctx.createImageData(size,size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++) {const rgba=fn(x/size,y/size);const i=(y*size+x)*4;for(let c=0;c<3;c++)img.data[i+c]=rgba[c];img.data[i+3]=rgba[3]??255;}
    ctx.putImageData(img,0,0);const map=new T.CanvasTexture(canvas);map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=8;if(color)map.colorSpace=T.SRGBColorSpace;return map;
  }
  const stone=pixels((x,y)=>{const grain=noise(x*100,y*150),layers=noise(x*7,y*70),ridge=noise(x*18,y*48+noise(x*6,y*5)*3),n=grain*.32+layers*.25+ridge*.43;return [137+n*85,123+n*77,96+n*67];});
  const soil=pixels((x,y)=>{const n=noise(x*35,y*35)*.7+noise(x*170,y*170)*.3;return [65+n*75,70+n*61,42+n*50];});soil.repeat.set(7,7);
  const wood=pixels((x,y)=>{const n=noise(x*80,y*3)*.6+noise(x*180,y*10)*.25+noise(x*300,y*300)*.15;return [82+n*110,45+n*77,24+n*48];});
  const wave=(x,y)=>noise(x*24,y*24)*.6+noise(x*57+8,y*57)*.25+noise(x*113,y*113)*.15;
  const waterNormal=pixels((x,y)=>{const e=.002,dx=(wave(x+e,y)-wave(x-e,y))*2,dy=(wave(x,y+e)-wave(x,y-e))*2;return [128+dx*100,128+dy*100,250];},256,false);waterNormal.repeat.set(4,4);
  const waterColor=pixels((x,y)=>{const n=noise(x*12,y*16)*.5+noise(x*40,y*40)*.5;return [24+n*20,125+n*35,129+n*40];});waterColor.repeat.set(2,2);
  const warmGlow=pixels((x,y)=>{const d=Math.hypot(x-.5,y-.5)*2;return [255,181,63,Math.pow(Math.max(0,1-d),3)*170];},64);
  const std=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.78,...extra});
  const materials={
    stone:std(0xbdb08d,{map:stone,bumpMap:stone,bumpScale:.028}),
    rock:std(0xaaa78b,{map:stone,bumpMap:stone,bumpScale:.035}),
    soil:std(0xb9c29c,{map:soil,bumpMap:soil,bumpScale:.04}),
    path:std(0xa99873,{map:stone,bumpMap:stone,bumpScale:.015}),
    wood:std(0xe1b27b,{map:wood,bumpMap:wood,bumpScale:.025}),
    darkWood:std(0x916b48,{map:wood,bumpMap:wood,bumpScale:.02}),
    roof:std(0x8c7257,{map:wood,bumpMap:wood,bumpScale:.04}),
    brass:std(0xb59752,{roughness:.29,metalness:.7}),
    bamboo:std(0xc7a66d,{roughness:.64}),
    foliage:std(0xffffff,{side:T.DoubleSide,vertexColors:true,roughness:.95}),
    red:std(0x98392c,{roughness:.38}),
    cream:std(0xe4d8b8),ink:std(0x162b29),solar:std(0x123249,{metalness:.6,roughness:.22}),
    light:std(0xffd490,{emissive:0xffad37,emissiveIntensity:3}),
    window:std(0xbf8b40,{emissive:0xffae35,emissiveIntensity:1.3,roughness:.25}),
    water:new T.MeshPhysicalMaterial({color:0x54b8ad,map:waterColor,normalMap:waterNormal,normalScale:new T.Vector2(.65,.65),vertexColors:true,roughness:.28,metalness:0,envMapIntensity:.15,specularIntensity:.35,clearcoat:.3,clearcoatRoughness:.3,emissive:0x066e70,emissiveIntensity:.08}),
    foam:std(0xb8e0d4,{transparent:true,opacity:.5,depthWrite:false,roughness:.22}),
  };
  return {materials,noise,waterNormal,warmGlow};
}
