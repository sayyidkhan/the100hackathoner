// Locally drawn print and stone surfaces; no remote images or runtime requests.
export function lrnmateSurfaces(T) {
  if (typeof document === 'undefined') return {stone:null,cloth:null,plaque:null,covers:[null,null,null],landscape:null};
  function canvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
  let seed=34;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  const stone=canvas(512,512,(x,w,h)=>{x.fillStyle='#d8c5a3';x.fillRect(0,0,w,h);for(let i=0;i<700;i++){x.fillStyle=i%2?'rgba(130,105,75,.08)':'rgba(255,247,225,.18)';x.beginPath();x.ellipse(rand()*w,rand()*h,2+rand()*12,1+rand()*5,rand()*3,0,7);x.fill();}for(let i=0;i<24000;i++){const v=rand();x.fillStyle=v>.6?'rgba(99,71,43,.15)':'rgba(255,248,224,.28)';x.beginPath();x.ellipse(rand()*w,rand()*h,.3+rand()*1.7,.3+rand(),0,0,7);x.fill();}});
  stone.wrapS=stone.wrapT=T.RepeatWrapping;
  const cloth=canvas(256,256,(x,w,h)=>{x.fillStyle='#2b5183';x.fillRect(0,0,w,h);for(let i=0;i<w;i+=3){x.strokeStyle=i%2?'#365f90':'#234976';x.lineWidth=1;x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke();}});cloth.wrapS=cloth.wrapT=T.RepeatWrapping;cloth.repeat.set(5,2);
  const plaque=canvas(1024,192,(x,w,h)=>{x.fillStyle='#182934';x.fillRect(0,0,w,h);x.strokeStyle='#b99254';x.lineWidth=10;x.strokeRect(12,12,w-24,h-24);x.fillStyle='#e2bf7e';x.font='100px Georgia';x.textAlign='center';x.fillText('LrnMate',w/2,130);});
  const covers=['FIELD NOTES','WORKPLACE KNOWLEDGE','LEARNING JOURNAL'].map((title,index)=>canvas(384,640,(x,w,h)=>{x.fillStyle=['#c7b18c','#8e4933','#c5bea8'][index];x.fillRect(0,0,w,h);x.strokeStyle='#76644a';x.lineWidth=3;x.strokeRect(25,25,w-50,h-50);x.fillStyle='#665138';x.textAlign='center';x.font='20px Georgia';x.fillText(title,w/2,80);for(let i=0;i<16;i++){x.beginPath();x.moveTo(w/2,520);x.quadraticCurveTo(w/2+(i%2?1:-1)*90,400-i*8,w/2+(i%2?1:-1)*(30+i*3),180+i*15);x.stroke();}x.font='16px Georgia';x.fillText('LrnMate / 2024',w/2,570);}));
  const landscape=canvas(512,320,(x,w,h)=>{x.fillStyle='#c5b596';x.fillRect(0,0,w,h);for(let layer=0;layer<4;layer++){x.fillStyle=['#b4a789','#9e9477','#807b61','#686a55'][layer];x.beginPath();x.moveTo(0,h);for(let i=0;i<9;i++)x.lineTo(i*w/8,90+layer*40+Math.sin(i*2+layer)*45);x.lineTo(w,h);x.fill();}x.fillStyle='#ded2b5';x.beginPath();x.arc(390,65,24,0,7);x.fill();});
  return {stone,cloth,plaque,covers,landscape};
}
