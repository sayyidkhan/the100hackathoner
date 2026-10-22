// Depth-tested, softly shaded cloud banks. Normal alpha blending lets clouds
// remain visible against the light backdrop as well as the night sky.
export function riverWeather(T, root) {
  const group=new T.Group();group.name='Two Rivers clouds and river mist';root.add(group);
  const fract=x=>x-Math.floor(x);
  const hash=(x,y)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453);
  function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy,s=u*u*(3-2*u),t=v*v*(3-2*v);return (hash(ix,iy)*(1-s)+hash(ix+1,iy)*s)*(1-t)+(hash(ix,iy+1)*(1-s)+hash(ix+1,iy+1)*s)*t;}
  const fbm=(x,y)=>noise(x,y)*.55+noise(x*2.1+7,y*2.1)*.27+noise(x*4.3,y*4.3+11)*.13+noise(x*8.9,y*8.9)*.05;
  function texture(mist=false){
    const size=256,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
    const ctx=canvas.getContext('2d'),data=ctx.createImageData(size,size);
    const lobes=mist?[[.2,.55,.25,.25],[.44,.49,.3,.3],[.7,.5,.28,.24],[.85,.52,.18,.2]]:[[.2,.62,.21,.24],[.38,.43,.25,.36],[.57,.48,.23,.3],[.73,.6,.22,.24]];
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const u=x/(size-1),v=y/(size-1),n=fbm(u*7,v*7);let density=0;
      for(const [cx,cy,rx,ry] of lobes){const d=((u-cx)/rx)**2+((v-cy)/ry)**2;density=Math.max(density,Math.exp(-d*1.9));}
      const edge=Math.sin(u*Math.PI)*Math.sin(v*Math.PI);
      const a=Math.max(0,Math.min(1,(density-.06)*(mist?1.25:2.05)))*Math.min(1,edge*5)*(.4+n*.8);
      const shade=(mist?.96:.93)+v*.04+n*.045,i=(y*size+x)*4;
      data.data[i]=Math.min(255,255*shade);data.data[i+1]=Math.min(255,255*shade);data.data[i+2]=Math.min(255,255*shade);data.data[i+3]=a*255;
    }
    ctx.putImageData(data,0,0);const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;return map;
  }
  const cloudMap=texture(),mistMap=texture(true),banks=[];
  function bank(kind,x,y,z,width,height,phase){
    const material=new T.SpriteMaterial({map:kind==='cloud'?cloudMap:mistMap,color:0xffffff,transparent:true,opacity:.7,toneMapped:false,depthWrite:false,depthTest:true});
    const sprite=new T.Sprite(material);sprite.name=kind==='cloud'?'Drifting canopy cloud':'Low river mist';sprite.position.set(x,y,z);sprite.scale.set(width,height,1);group.add(sprite);
    banks.push({sprite,kind,x,y,z,phase,width,height});
  }
  // Clouds sit behind and beside the hero crowns, leaving the architecture clear.
  bank('cloud',-2.5,3.15,-1.8,2.8,1.15,0);
  bank('cloud',2.35,3.45,-1.7,3.1,1.25,2.4);
  bank('cloud',.7,3.9,-2.5,2.5,.75,4.3);
  bank('cloud',-3,2.12,-1.6,2,.7,1.8);
  bank('cloud',3.15,2.35,-1.55,2.1,.75,3.6);
  // Interleaved depths create mist flowing through the banks, across water and
  // behind the bridges rather than a single screen-wide translucent overlay.
  bank('mist',-1.6,.82,-.35,2.35,.6,.2);
  bank('mist',1.55,.78,-.45,2.1,.63,1.9);
  bank('mist',.05,.63,1.45,3.2,.65,3.3);
  bank('mist',-.8,1.2,-1.4,2.4,.72,4.5);
  bank('mist',1.9,1.13,-1.3,2,.6,5.4);
  bank('mist',-2.7,.76,.9,1.8,.5,2.8);

  return {
    group,
    setTheme(theme){
      const isNight=theme==='dark';
      for(const b of banks){b.sprite.material.color.setHex(b.kind==='cloud'?(isNight?0x8ba9c5:0xffffff):(isNight?0x88cbd4:0xe7f5e7));b.sprite.material.opacity=b.kind==='cloud'?(isNight?.6:.84):(isNight?.55:.62);}
    },
    animate(time){
      for(const b of banks){b.sprite.position.set(b.x+Math.sin(time*.045+b.phase)*(b.kind==='cloud'?.24:.32),b.y+Math.sin(time*.09+b.phase)*.035,b.z+Math.cos(time*.035+b.phase)*.06);b.sprite.scale.x=b.width*(1+Math.sin(time*.06+b.phase)*.045);}
    }
  };
}
