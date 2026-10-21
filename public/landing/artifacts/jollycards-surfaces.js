// Local, deterministic material maps: no image downloads or texture loading delay.
export function jollySurfaces(T) {
  let seed=4819;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const hash=(x,y)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
  const smooth=t=>t*t*(3-2*t);
  const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),u=smooth(x-ix),v=smooth(y-iy);return T.MathUtils.lerp(T.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),u),T.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),u),v);};
  const fbm=(x,y)=>noise(x,y)*.55+noise(x*2.07,y*2.07)*.27+noise(x*4.13,y*4.13)*.12+noise(x*8.31,y*8.31)*.06;
  function texture(size,paint,color=true){const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');paint(ctx,size);const t=new T.CanvasTexture(c);if(color)t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
  const paper=texture(512,(ctx,n)=>{
    const data=ctx.createImageData(n,n);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4,v=(fbm(x/23,y/23)-.5)*16+(random()-.5)*22;data.data.set([244+v,233+v,212+v,255],i);}ctx.putImageData(data,0,0);
    for(let i=0;i<12000;i++){const x=random()*n,y=random()*n;ctx.strokeStyle=i%2?'#fff6df30':'#99826818';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*3.5,y+random()*1.5);ctx.stroke();}
  });
  const grain=texture(256,(ctx,n)=>{const d=ctx.createImageData(n,n);for(let i=0;i<d.data.length;i+=4){const v=105+random()*80;d.data.set([v,v,v,255],i);}ctx.putImageData(d,0,0);},false);
  grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(3,3);
  const stone=texture(1024,(ctx,n)=>{
    const d=ctx.createImageData(n,n);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const broad=fbm(x/140,y/140),fine=fbm(x/12,y/12),warp=fbm(x/85+7,y/85+3);
      const vein=Math.pow(Math.max(0,1-Math.abs(Math.sin(x*.022+y*.037+warp*17))*9),3);
      const grainValue=(random()-.5)*18,v=(broad-.5)*47+(fine-.5)*38;
      const i=(y*n+x)*4;d.data.set([76+v+vein*95+grainValue,57+v*.8+vein*66+grainValue,42+v*.6+vein*34+grainValue,255],i);
    }ctx.putImageData(d,0,0);
  });
  const weave=texture(256,(ctx,n)=>{const d=ctx.createImageData(n,n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=125+Math.sin(y*Math.PI)*12+(x%3===0?18:0)+(random()-.5)*22;d.data.set([v,v,v,255],(y*n+x)*4);}ctx.putImageData(d,0,0);},false);
  weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(7,2);
  const standard=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness,side:T.DoubleSide});
  const m={
    paper:standard(0xfff8ec,.88), relief:standard(0xf0dfc3,.84), fold:standard(0xfff2d5,.82),
    burgundy:standard(0x650d1b,.72), seam:standard(0x411019,.78), gold:standard(0xc69645,.32,.75),
    stone:standard(0xc3ac8e,.72,.05), edge:standard(0x473022,.48,.2), green:standard(0x30432a,.85),
    leaf:standard(0x304b2a,.8), leafLight:standard(0x516343,.85), twig:standard(0x53412b,.9),
    red:new T.MeshPhysicalMaterial({color:0x991e26,roughness:.38,clearcoat:.25,side:T.DoubleSide}),
    blue:new T.MeshPhysicalMaterial({color:0x071a37,roughness:.19,metalness:.38,clearcoat:1,clearcoatRoughness:.14}),
    berry:new T.MeshPhysicalMaterial({color:0x8b1220,roughness:.27,clearcoat:1}),
    pen:new T.MeshPhysicalMaterial({color:0x350a12,roughness:.18,clearcoat:1,metalness:.15}),
    ribbon:new T.MeshPhysicalMaterial({color:0x071b3d,roughness:.48,metalness:.05,sheen:.8,sheenColor:0x6785b6,sheenRoughness:.5,side:T.DoubleSide}),
  };
  for(const key of ['paper','relief','fold']){m[key].map=paper;m[key].bumpMap=grain;m[key].bumpScale=.004;}
  m.burgundy.bumpMap=grain;m.burgundy.bumpScale=.007;
  m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.017;
  m.ribbon.bumpMap=weave;m.ribbon.bumpScale=.002;
  return {materials:m,random};
}
