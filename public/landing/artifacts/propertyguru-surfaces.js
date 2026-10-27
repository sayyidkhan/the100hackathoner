// World-scale mineral finishes: the texture stays consistent across thin ledges,
// broad stone paving and extruded edges rather than stretching with primitive UVs.
export function propertySurfaces(T,m){
 const n=512,data=new Uint8Array(n*n*4);let seed=3103;
 const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const cloud=Math.sin(x*.027+Math.sin(y*.018)*2)*5+Math.sin(y*.073+x*.017)*3;
  const v=225+cloud+(rnd()-.5)*24;const p=(y*n+x)*4;data.set([v+8,v+4,v-3,255],p);
 }
 for(let i=0;i<4200;i++){
  const x=rnd()*n,y=rnd()*n,r=.4+rnd()*1.7,shade=80+rnd()*90;
  for(let yy=Math.floor(y-r);yy<=y+r;yy++)for(let xx=Math.floor(x-r);xx<=x+r;xx++){
   const d=((xx-x)**2+(yy-y)**2)/(r*r);if(d>1)continue;
   const p=(((yy+n)%n)*n+(xx+n)%n)*4;
   for(let c=0;c<3;c++)data[p+c]=data[p+c]*(.65+.35*d)+shade*(.35-.35*d);
  }
 }
 const mineral=new T.DataTexture(data,n,n);mineral.colorSpace=T.SRGBColorSpace;mineral.wrapS=mineral.wrapT=T.RepeatWrapping;mineral.magFilter=T.LinearFilter;mineral.minFilter=T.LinearMipmapLinearFilter;mineral.generateMipmaps=true;mineral.anisotropy=8;mineral.needsUpdate=true;
 m.stone.map=mineral;m.stone.bumpMap=null;m.stone.color.setHex(0xe7dbca);m.stone.roughness=.91;
 const previous=m.stone.onBeforeCompile;
 m.stone.onBeforeCompile=function(shader,renderer){
  previous.call(this,shader,renderer);shader.uniforms.propertyMineral={value:mineral};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vPropertyStone;\nvarying vec3 vPropertyNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\nvPropertyStone = position; vPropertyNormal = normal;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D propertyMineral;\nvarying vec3 vPropertyStone;\nvarying vec3 vPropertyNormal;').replace('#include <map_fragment>',`
    vec3 blend = pow(abs(normalize(vPropertyNormal)),vec3(8.0)); blend /= dot(blend,vec3(1.0));
    vec3 grain = texture2D(propertyMineral,vPropertyStone.yz*2.5).rgb*blend.x
      + texture2D(propertyMineral,vPropertyStone.xz*2.5).rgb*blend.y
      + texture2D(propertyMineral,vPropertyStone.xy*2.5).rgb*blend.z;
    diffuseColor.rgb *= grain;
  `);
 };
 m.stone.customProgramCacheKey=()=> 'property-mineral-triplanar-v1';
 m.cream.color.setHex(0xe9e4da);m.cream.roughness=.7;m.concrete.color.setHex(0xd5cbb8);
 m.glazing.color.setHex(0x477970);m.glazing.metalness=.32;m.glazing.roughness=.12;m.glazing.envMapIntensity=1.25;
 m.red.color.setHex(0xd28069);m.red.roughness=.72;m.red.clearcoat=0;
 m.pool.color.setHex(0x37a5aa);m.pool.roughness=.09;
}
