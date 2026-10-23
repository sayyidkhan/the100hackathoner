// Local, deterministic light halos: the artwork's warm practical lighting,
// with no post-processing pass or remote texture dependency.
export function gardenGlow(T, parent) {
  const n=64, data=new Uint8Array(n*n*4);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const r=Math.hypot((x+.5)/n-.5,(y+.5)/n-.5)*2;
    const a=Math.pow(Math.max(0,1-r),3);const i=(y*n+x)*4;
    data.set([255,183,75,Math.round(a*180)],i);
  }
  const map=new T.DataTexture(data,n,n);map.needsUpdate=true;
  map.magFilter=T.LinearFilter;map.minFilter=T.LinearFilter;map.colorSpace=T.SRGBColorSpace;
  const lights=[];
  function add(position,size=.42,phase=0){
    const material=new T.SpriteMaterial({map,color:0xffd298,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
    const s=new T.Sprite(material);s.position.copy(position);s.scale.set(size,size,1);parent.add(s);
    lights.push({s,size,phase});return s;
  }
  function animate(t){for(const {s,size,phase} of lights){const pulse=.94+.06*Math.sin(t*1.6+phase);s.scale.set(size*pulse,size*pulse,1);}}
  return {add,animate};
}
