export const VAINSTER_CYCLE=28;
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function vainsterMoment(time){
 const t=((time%VAINSTER_CYCLE)+VAINSTER_CYCLE)%VAINSTER_CYCLE;
 const index=t<5?0:t<12?1:t<19?2:3;
 return {t,index,capture:smooth((t-1)/2),scan:clamp((t-5)/6),map:smooth((t-12)/2),journal:smooth((t-19)/5),fade:1-smooth((t-26)/2)};
}
export const VAINSTER_STORIES=[
 ['A moment for yourself','Start with a face capture. This scene uses a sculpted portrait, never your camera.'],
 ['Map the face','A scan follows facial landmarks across the forehead, cheeks and chin.'],
 ['Look a little closer','Facial regions become a visual record for reflection. This is a concept, not a diagnosis.'],
 ['See the week, not just today','Sample journal entries build a weekly view, followed by a gentle check-in.'],
];
export function portraitCanvas(geometry){
 if(typeof document==='undefined')return null;
 const c=document.createElement('canvas');c.width=420;c.height=600;const ctx=c.getContext('2d'),p=geometry.attributes.position,n=geometry.attributes.normal,ix=geometry.index;
 const triangles=[];for(let i=0;i<ix.count;i+=3){const ids=[ix.getX(i),ix.getX(i+1),ix.getX(i+2)];if(ids.reduce((a,j)=>a+n.getZ(j),0)<-.25)continue;triangles.push({ids,z:ids.reduce((a,j)=>a+p.getZ(j),0)});}triangles.sort((a,b)=>a.z-b.z);
 for(const {ids} of triangles){const light=Math.max(0,Math.min(1,ids.reduce((a,j)=>a+(-.45*n.getX(j)+.55*n.getY(j)+.7*n.getZ(j)),0)/3));const v=Math.round(90+light*115);ctx.fillStyle=`rgb(${v*.85},${v},${v*.86})`;ctx.beginPath();ids.forEach((j,k)=>{const x=210+p.getX(j)*165,y=570-p.getY(j)*170;k?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fill();}
 return c;
}
export function vainsterScreen(T,kind,portrait=null){
 if(typeof document==='undefined')return {material:new T.MeshBasicMaterial({color:kind==='phone'?0x102b27:0xeee8da}),update(){}};
 const c=document.createElement('canvas');c.width=kind==='phone'?640:960;c.height=kind==='phone'?1120:1160;const ctx=c.getContext('2d');
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
 const material=new T.MeshBasicMaterial({map,toneMapped:false});let last='';
 function text(s,x,y,size=28,col='#193e35',font='Arial'){ctx.fillStyle=col;ctx.font=`${size}px ${font}`;ctx.fillText(s,x,y);}
 function rect(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
 function face(x,y,s,col){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,0,98,135,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-65,-23);ctx.quadraticCurveTo(-40,-37,-18,-23);ctx.moveTo(18,-23);ctx.quadraticCurveTo(40,-37,65,-23);ctx.moveTo(0,-15);ctx.lineTo(-9,32);ctx.lineTo(13,32);ctx.moveTo(-29,65);ctx.quadraticCurveTo(0,79,29,65);ctx.stroke();ctx.restore();}
 return {material,update(s){const key=`${s.index}:${Math.round(s.scan*40)}:${Math.round(s.journal*30)}:${Math.round(s.capture*10)}:${Math.round(s.fade*10)}`;if(last===key)return;last=key;
 ctx.clearRect(0,0,c.width,c.height);
 if(kind==='phone'){
  ctx.fillStyle='#102b27';ctx.fillRect(0,0,640,1120);text('9:41',38,40,20,'#c5dbcf');text('Vainster',40,135,56,'#f1e8d2','Georgia');text('YOUR DAILY MOMENT',42,180,18,'#91b9a8');
  if(portrait){ctx.globalAlpha=s.index===0?.65+s.capture*.35:1;ctx.drawImage(portrait,142,240,356,510);ctx.globalAlpha=1;}else face(320,480,1.45,s.index===0?'#88a999':'#cfdfd2');
  ctx.strokeStyle='#a8d7c0';ctx.lineWidth=3;for(const [x,y,dx,dy] of [[125,260,1,1],[515,260,-1,1],[125,710,1,-1],[515,710,-1,-1]]){ctx.beginPath();ctx.moveTo(x,y+dy*40);ctx.lineTo(x,y);ctx.lineTo(x+dx*40,y);ctx.stroke();}
  if(s.index===1){const y=290+s.scan*390;ctx.strokeStyle='#b9f4d7';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(140,y);ctx.lineTo(500,y);ctx.stroke();}
  const titles=['Ready when you are','Mapping your face','Capture recorded','A moment, saved'];text(titles[s.index],80,800,30,'#e7eedf');
  ctx.beginPath();ctx.arc(320,906,48,0,Math.PI*2);ctx.fillStyle='#acdbc3';ctx.fill();ctx.beginPath();ctx.arc(320,906,58,0,Math.PI*2);ctx.strokeStyle='#acdbc3';ctx.stroke();
  text(['Capture','Scanning…','View regions','View journal'][s.index],245,1010,25,'#e7eedf');
 }else{
  ctx.fillStyle='#eee8da';ctx.fillRect(0,0,960,1160);text('Vainster',58,120,80,'#173a31','Georgia');text('FACE MAPPING / A DAILY REFLECTION',62,166,22,'#7c826f');
  text(s.index<2?'Your face, a little closer':'A visual record',62,246,40,'#21483e','Georgia');
  const regions=['Forehead','Cheeks','Chin'];for(let i=0;i<3;i++){rect(62+i*284,282,258,260,28,s.index>=2?'#d7e1d1':'#e2dfd3');face(191+i*284,389,.56,'#6a8e7c');ctx.beginPath();ctx.arc(191+i*284,350+i*34,11,0,Math.PI*2);ctx.fillStyle=s.index>=2?'#b78267':'#bebfac';ctx.fill();text(regions[i],116+i*284,511,26);}
  text('Weekly journal',62,632,44,'#21483e','Georgia');text('Illustrative entries · not a health score',64,672,22,'#778474');
  ctx.strokeStyle='#d3d4c4';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(75,725+i*54);ctx.lineTo(875,725+i*54);ctx.stroke();}
  const values=[.3,.55,.40,.7,.6,.8,.72],n=Math.min(7,Math.floor(s.journal*7+.001));ctx.strokeStyle='#4e9a7d';ctx.lineWidth=5;ctx.beginPath();for(let i=0;i<n;i++){const x=95+i*125,y=896-values[i]*170;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();for(let i=0;i<7;i++){const x=95+i*125;ctx.beginPath();ctx.arc(x,896-values[i]*170,i<n?8:4,0,Math.PI*2);ctx.fillStyle=i<n?'#4e9a7d':'#c9d1c1';ctx.fill();text(['M','T','W','T','F','S','S'][i],x-8,940,24,'#697b6a');}
  rect(62,991,836,90,40,s.index===3?'#d0e3d5':'#e2dfd3');text(s.index===3?'How are you feeling today?':'A kinder way to check in',110,1048,32);
  text('2017 HACKATHON CONCEPT',62,1124,18,'#7c826f');
 }
 map.needsUpdate=true;
 }};
}
