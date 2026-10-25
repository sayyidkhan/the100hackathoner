// Local, deterministic specimen finishes and product UI. No remote textures.
export function co2unterSurfaces(T) {
 const n=512;let seed=202018;
 const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const make=fn=>{const a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=fn(x,y);a.set([...c.map(v=>Math.max(0,Math.min(255,Math.round(v)))),255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=4;t.needsUpdate=true;return t;};
 const banana=make((x,y)=>{const q=rand(),ridge=Math.cos(x/n*Math.PI*10)*5,bruise=q<.006?55+rand()*70:0;return [225+ridge-bruise,178+ridge-bruise,65+ridge-bruise*.55];});
 const bark=make((x,y)=>{const wave=x*.21+Math.sin(y*.029)*.9+Math.sin(y*.11+x*.017)*.35,split=Math.pow(Math.max(0,Math.sin(wave)),11)*48,grain=(rand()-.5)*22+Math.sin(y*.83+x*.07)*8;return [110+grain-split,76+grain*.7-split*.8,46+grain*.5-split*.55];});
 const endgrain=make((x,y)=>{const dx=(x-n/2)/n,dy=(y-n/2)/n,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx),ring=Math.pow(.5+.5*Math.sin(r*170+Math.sin(a*5)*.8+Math.sin(a*11)*.3),5)*66,noise=rand()*10;return [204-ring+noise,163-ring*.9+noise,107-ring*.7+noise];});
 const screenFrames=typeof document==='undefined'?[]:[0,1,2,3].map(stage=>{
  const c=document.createElement('canvas');c.width=900;c.height=1500;const g=c.getContext('2d');
  const rr=(x,y,w,h,r,fill,stroke)=>{g.beginPath();g.roundRect(x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.lineWidth=3;g.strokeStyle=stroke;g.stroke();}};
  const text=(s,x,y,size=34,color='#f5e9d2',font='sans-serif')=>{g.fillStyle=color;g.font=`500 ${size}px ${font}`;g.fillText(s,x,y);};
  g.fillStyle='#102f3b';g.fillRect(0,0,900,1500);
  text('CO₂unter',64,116,74,'#f2d6a0','Georgia');text('CARBON, IN CONTEXT',68,169,25,'#8eb6b5');
  rr(62,225,776,318,30,'#f2eadc');text('YOUR FOOTPRINT',100,287,25,'#716c5b');text('CO₂',100,411,104,'#163c48','Georgia');text('Carbon-emissions input',102,485,34,'#4c6568');
  // A familiar-unit choice is shown without fabricating a quantity or ratio.
  text('COMPARE WITH',68,623,28,'#adc8c3');
  const woodSelected=stage===3,active=stage>=1;
  rr(64,664,374,91,45,active&&!woodSelected?'#d3b06a':'#193f49',active&&!woodSelected?null:'#46636a');
  rr(462,664,374,91,45,woodSelected?'#d3b06a':'#193f49',woodSelected?null:'#46636a');
  text('Bananas',144,723,37,active&&!woodSelected?'#163740':'#dbe5dd');text('Wood',577,723,37,woodSelected?'#163740':'#dbe5dd');
  rr(64,811,772,476,32,'#1c4650');
  if(woodSelected){
   for(const [x,y] of [[335,1044],[505,1044],[420,932]]){rr(x-67,y-56,135,118,24,'#99764b');g.beginPath();g.ellipse(x,y+3,54,48,0,0,Math.PI*2);g.fillStyle='#e0c293';g.fill();for(const r of [12,24,36]){g.beginPath();g.ellipse(x,y+3,r,r*.87,0,0,Math.PI*2);g.strokeStyle='#8d683f';g.lineWidth=3;g.stroke();}}
  }else{
   for(let j=0;j<3;j++){g.beginPath();g.moveTo(285+j*28,950-j*15);g.bezierCurveTo(360,1108,558,1118,600-j*17,915+j*7);g.bezierCurveTo(520,1020,388,1027,285+j*28,950-j*15);g.fillStyle=j===0?'#d6a843':j===1?'#f2ca70':'#e7ba59';g.fill();}
  }
  text(woodSelected?'Wood':'Bananas',101,1190,52,'#f0ddad','Georgia');text('An everyday reference',102,1240,28,'#b7d0ca');
  const steps=['Reading the footprint','Choosing a comparison','Banana comparison','Wood comparison'];
  text(steps[stage],67,1370,29,'#dbc18b');text('Illustrative exhibit · no live measurement',67,1431,22,'#8eafad');
  return c;
 });
 return {banana,bark,endgrain,screenFrames};
}
