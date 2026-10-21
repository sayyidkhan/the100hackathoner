// Deterministic local maps for polished stone, ceramic, and contact shadows.
export function hederaSurfaces(T) {
  const hash=(x,y)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
  const smooth=t=>t*t*(3-2*t),mix=T.MathUtils.lerp;
  const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),u=smooth(x-ix),v=smooth(y-iy);return mix(mix(hash(ix,iy),hash(ix+1,iy),u),mix(hash(ix,iy+1),hash(ix+1,iy+1),u),v);};
  function texture(n,paint,color=true){const c=document.createElement('canvas');c.width=c.height=n;paint(c.getContext('2d'),n);const t=new T.CanvasTexture(c);if(color)t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
  const stone=texture(512,(ctx,n)=>{const d=ctx.createImageData(n,n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const warp=noise(x/63,y/63)*6+noise(x/24,y/24)*1.2;
    const vein=Math.pow(Math.max(0,1-Math.abs(Math.sin(x*.024+y*.037+warp))*16),2);
    const broad=noise(x/95,y/95)*9,fine=hash(x,y)*3;
    d.data.set([13+broad+fine+vein*84,19+broad+fine+vein*76,18+broad+fine+vein*59,255],(y*n+x)*4);
  }ctx.putImageData(d,0,0);});
  const grain=texture(128,(ctx,n)=>{const d=ctx.createImageData(n,n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=100+hash(x,y)*100;d.data.set([v,v,v,255],(y*n+x)*4);}ctx.putImageData(d,0,0);},false);
  grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(4,4);
  const halo=texture(128,(ctx,n)=>{const g=ctx.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,'rgba(150,255,204,0.7)');g.addColorStop(.2,'rgba(85,230,167,0.25)');g.addColorStop(1,'rgba(60,200,140,0)');ctx.fillStyle=g;ctx.fillRect(0,0,n,n);});
  const shadow=texture(128,(ctx,n)=>{const g=ctx.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);g.addColorStop(0,'rgba(0,0,0,0.8)');g.addColorStop(.35,'rgba(0,0,0,0.55)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,n,n);});
  const physical=(color,roughness,metalness=0,coat=0)=>new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:coat,clearcoatRoughness:.18});
  const m={
    stone:physical(0xc0c9c3,.43,.18,.12), ceramic:physical(0xf4ead4,.26,.06,.6),
    metal:physical(0x52665e,.26,.85), bronze:physical(0x9e8c67,.3,.78),
    dark:physical(0x08110f,.52,.3), rubber:physical(0x101a17,.87),
    visor:physical(0x030b09,.12,.18,1), jade:physical(0x1d7457,.26,.4,.4),
    glow:new T.MeshStandardMaterial({color:0xb4ffda,emissive:0x75ffc0,emissiveIntensity:1.7,roughness:.3}),
    muted:new T.MeshStandardMaterial({color:0x358568,emissive:0x185b40,emissiveIntensity:.35,roughness:.5}),
    ui:new T.MeshStandardMaterial({color:0x081b13,emissive:0x071b12,emissiveIntensity:.4,roughness:.5,transparent:true,opacity:.92,depthWrite:false,side:T.DoubleSide}),
    glass:new T.MeshPhysicalMaterial({color:0x75d6af,roughness:.15,metalness:.05,transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide}),
    shadow:new T.MeshBasicMaterial({map:shadow,transparent:true,depthWrite:false,toneMapped:false}),
    halo:new T.MeshBasicMaterial({map:halo,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}),
  };
  m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.008;m.stone.envMapIntensity=.10;
  m.ceramic.bumpMap=grain;m.ceramic.bumpScale=.0015;m.metal.bumpMap=grain;m.metal.bumpScale=.002;
  return m;
}
