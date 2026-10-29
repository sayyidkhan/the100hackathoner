// Physical embroidery maps for the upholstered lid, not a separate screen or card.
export function shoeScreen(T,tribute){
 if(typeof document==='undefined')return {map:null,bumpMap:null,roughnessMap:null,update(){}};
 const w=1536,h=1234;
 const canvas=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const c=canvas(),mask=canvas(),height=canvas(),rough=canvas();
 const ctx=c.getContext('2d'),ink=mask.getContext('2d'),bump=height.getContext('2d'),rctx=rough.getContext('2d');
 ink.fillStyle='#fff';ink.textAlign='center';
 const text=(str,y,size,font='Georgia')=>{ink.font=`${size}px ${font}`;ink.fillText(str,w/2,y,w-180);};
 text('In loving memory',230,94,'italic Georgia');
 text(tribute.name,540,226);
 text(tribute.years,700,94);
 text(tribute.quote,1015,88,'italic Georgia');
 for(const y of [300,798]){ink.lineWidth=3;ink.strokeStyle='#fff';ink.beginPath();ink.moveTo(610,y);ink.lineTo(926,y);ink.stroke();text('◇',y+15,42);}
 ctx.fillStyle='#f0dfbf';ctx.fillRect(0,0,w,h);
 bump.fillStyle='#707070';bump.fillRect(0,0,w,h);
 rctx.fillStyle='#ededed';rctx.fillRect(0,0,w,h);
 // Thread relief and weave share the same UVs as the curved silk mesh.
 // The offline AO baker has no pixel rasterizer; it only needs identical geometry.
 if(ink.getImageData){
   const a=ink.getImageData(0,0,w,h).data;
   const colour=ctx.createImageData(w,h),relief=bump.createImageData(w,h),roughness=rctx.createImageData(w,h);
   let seed=79;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
     const i=(y*w+x)*4,t=a[i+3]/255;
     const weave=2.4*Math.cos(x*Math.PI)+2*Math.cos(y*Math.PI*.67)+(random()-.5)*5;
     const thread=Math.sin((x+y*1.5)*2.2)*7+(random()-.5)*6;
     const silk=[240+weave,223+weave,191+weave],bronze=[72+thread*.35,36+thread*.35,17+thread*.35];
     for(let channel=0;channel<3;channel++){
       colour.data[i+channel]=silk[channel]*(1-t)+bronze[channel]*t;
       relief.data[i+channel]=110+weave*.8+t*(70+thread);
       roughness.data[i+channel]=237-t*65;
     }
     colour.data[i+3]=relief.data[i+3]=roughness.data[i+3]=255;
   }
   ctx.putImageData(colour,0,0);bump.putImageData(relief,0,0);rctx.putImageData(roughness,0,0);
 }
 const texture=source=>{const map=new T.CanvasTexture(source);map.anisotropy=8;return map;};
 const map=texture(c);map.colorSpace=T.SRGBColorSpace;
 return {map,bumpMap:texture(height),roughnessMap:texture(rough),update(){}};
}
