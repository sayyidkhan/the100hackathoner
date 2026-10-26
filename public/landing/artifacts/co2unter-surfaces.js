// Local, deterministic specimen finishes and product UI. No remote textures.
export function co2unterSurfaces(T) {
 const n=512;let seed=202018;
 const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const make=fn=>{const a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=fn(x,y);a.set([...c.map(v=>Math.max(0,Math.min(255,Math.round(v)))),255],(y*n+x)*4);}const t=new T.DataTexture(a,n,n);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=4;t.needsUpdate=true;return t;};
 const banana=make((x,y)=>{const q=rand(),ridge=Math.cos(x/n*Math.PI*10)*5,cellX=Math.floor(x/19),cellY=Math.floor(y/23),hash=((cellX*73+cellY*137)%113)/113,spot=Math.hypot((x%19)-5-hash*8,((y%23)-7-hash*9)*.7),bruise=hash>.72&&spot<2.2?65*(1-spot/2.2):q<.006?45:0;return [225+ridge-bruise,178+ridge-bruise,65+ridge-bruise*.55];});
 const bark=make((x,y)=>{const wave=x*.21+Math.sin(y*.029)*.9+Math.sin(y*.11+x*.017)*.35,split=Math.pow(Math.max(0,Math.sin(wave)),11)*48,grain=(rand()-.5)*22+Math.sin(y*.83+x*.07)*8;return [110+grain-split,76+grain*.7-split*.8,46+grain*.5-split*.55];});
 const endgrain=make((x,y)=>{const dx=(x-n/2)/n,dy=(y-n/2)/n,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx),ring=Math.pow(.5+.5*Math.sin(r*170+Math.sin(a*5)*.8+Math.sin(a*11)*.3),5)*38,noise=rand()*10;return [204-ring+noise,163-ring*.9+noise,107-ring*.7+noise];});
 const screenFrames=typeof document==='undefined'?[]:[0,1,2,3].map(stage=>{
  const c=document.createElement('canvas');c.width=900;c.height=1500;const g=c.getContext('2d');
  const rr=(x,y,w,h,r,fill,stroke)=>{g.beginPath();g.roundRect(x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.lineWidth=3;g.strokeStyle=stroke;g.stroke();}};
  const text=(s,x,y,size=34,color='#edf2df',font='sans-serif')=>{g.fillStyle=color;g.font=`500 ${size}px ${font}`;g.fillText(s,x,y);};
  const woodSelected=stage===3,active=stage>=1;
  g.fillStyle='#102d31';g.fillRect(0,0,900,1500);
  text('CO₂unter',64,115,76,'#edf2df','Georgia');
  text('CARBON, MADE TANGIBLE.',68,169,25,'#aac6b2');
  rr(64,226,772,284,32,'#e5ecda');
  text('START WITH YOUR FOOTPRINT',102,281,25,'#526a5e');
  text('CO₂',100,414,120,'#173f40','Georgia');
  text('Carbon emissions',103,472,32,'#526a5e');
  // A connected step marker explains conversion without invented measurements.
  g.strokeStyle='#668f7c';g.lineWidth=3;g.beginPath();g.moveTo(450,510);g.lineTo(450,557);g.stroke();
  text('CHOOSE A FAMILIAR REFERENCE',68,598,27,'#b8d3be');
  rr(64,635,374,94,22,active&&!woodSelected?'#e6be70':'#23464a');
  rr(462,635,374,94,22,woodSelected?'#e6be70':'#23464a');
  text('Bananas',145,697,39,active&&!woodSelected?'#223e3c':'#dbe5dd');
  text('Wood',575,697,39,woodSelected?'#223e3c':'#dbe5dd');
  rr(64,783,772,481,32,active?'#dbe5cf':'#1b3d41');
  if(active){
   if(woodSelected){
    for(const [x,y] of [[353,1027],[529,1027],[440,907]]){rr(x-67,y-56,135,118,24,'#99764b');g.beginPath();g.ellipse(x,y+3,54,48,0,0,Math.PI*2);g.fillStyle='#e0c293';g.fill();for(const r of [12,24,36]){g.beginPath();g.ellipse(x,y+3,r,r*.87,0,0,Math.PI*2);g.strokeStyle='#8d683f';g.lineWidth=3;g.stroke();}}
   }else{
    for(let j=0;j<4;j++){g.beginPath();g.moveTo(255+j*28,930-j*15);g.bezierCurveTo(340,1108,588,1118,630-j*17,875+j*7);g.bezierCurveTo(520,1020,388,1027,255+j*28,930-j*15);g.fillStyle=['#ba862c','#d6a843','#f2ca70','#e7ba59'][j];g.fill();}
   }
   text(woodSelected?'Think in wood.':'Think in bananas.',104,1166,53,'#183e3d','Georgia');
   text('A familiar way to see carbon',104,1220,29,'#526a5e');
  }else{
   text('Big numbers.',105,939,57,'#dbe5cf','Georgia');
   text('Everyday meaning.',105,1010,57,'#dbe5cf','Georgia');
   text('Pick a reference to compare.',105,1160,31,'#9bb9ad');
  }
  const steps=['01   Carbon input','02   Reference selected','03   Banana comparison','04   Wood comparison'];
  text(steps[stage],67,1348,34,'#e4c484');
  for(let i=0;i<4;i++)rr(66+i*196,1386,177,7,3,i<=stage?'#b7d8aa':'#335557');
  text('CONCEPT PREVIEW · NOT A LIVE RESULT',67,1450,22,'#8eafad');
  return c;
 });
 return {banana,bark,endgrain,screenFrames};
}
