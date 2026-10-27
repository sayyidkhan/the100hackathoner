// Illustrative themes, not recovered investment records or investment recommendations.
export const NESTASH_CYCLE=24;
export const NESTASH_STEPS=[
 ['Explore','Start with the impact you care about','Explore three illustrative themes: clean energy, water and sustainable cities.'],
 ['Search','Look for clean-energy opportunities','The search focuses on clean energy; the matching landscape comes into view.'],
 ['Compare','Inspect the matching theme','Explore the energy landscape before adding it to your research shortlist.'],
 ['Shortlist','Save a starting point for research','Clean energy is saved as an illustrative research theme. Nestash was the predecessor to Iceigloo.'],
];
const clamp=x=>Math.max(0,Math.min(1,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export function nestashMoment(time){
 const t=((time%NESTASH_CYCLE)+NESTASH_CYCLE)%NESTASH_CYCLE;
 return {t,index:t<5?0:t<11?1:t<17?2:3,query:ease((t-5)/2),selection:ease((t-10)/2),saved:ease((t-17)/1.8),reset:1-ease((t-22.7)/1.3)};
}
export function nestashScreen(T){
 const canvas=typeof document==='undefined'?null:document.createElement('canvas');
 if(canvas){canvas.width=1200;canvas.height=1600;}
 const c=canvas?.getContext('2d'),map=canvas?new T.CanvasTexture(canvas):null;
 if(map){map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;}
 const material=new T.MeshBasicMaterial({map,color:0xffffff,toneMapped:false});let last='';
 const rect=(x,y,w,h,color,r=0)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
 const text=(s,x,y,size,color='#173c40',weight=500)=>{c.fillStyle=color;c.font=`${weight} ${size}px Arial`;c.fillText(s,x,y);};
 return {material,update(s){
  const key=`${s.index}:${Math.round(s.query*12)}:${Math.round(s.saved*10)}`;if(!c||key===last)return;last=key;
  rect(0,0,1200,1600,'#f5f1e5');
  text('N E S T A S H',78,125,48,'#236b66',700);text('IMPACT INVESTING',78,178,22,'#62716b',600);
  text('Invest with',78,295,88,'#153b40',600);text('intention.',78,389,88,'#153b40',600);
  rect(78,449,1044,120,'#e2e8db',24);
  c.strokeStyle='#3b756d';c.lineWidth=5;c.beginPath();c.arc(126,503,18,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(140,518);c.lineTo(154,533);c.stroke();
  text(s.index===0?'Explore impact themes':'Clean energy'.slice(0,Math.ceil(12*s.query)),181,528,43,'#355c59');
  text(s.index===0?'What matters to you?':'YOUR SEARCH',78,652,32,'#62716b',600);
  const names=['Clean energy','Water','Sustainable cities'],sub=['Renewables & infrastructure','Resources & resilience','Places for better living'];
  names.forEach((name,i)=>{
   const y=701+i*190,active=s.index>0&&i===0,muted=s.index>0&&i>0;
   rect(78,y,1044,165,active?'#d0e8d7':muted?'#e8e8de':'#ffffff',22);
   rect(103,y+32,87,99,['#316f65','#548b9b','#a6a079'][i],14);
   text(String(i+1).padStart(2,'0'),118,y+92,37,'#ffffff',600);
   text(name,223,y+67,45,muted?'#79877d':'#153b40',600);text(sub[i],223,y+112,28,muted?'#7b867d':'#526c64');
   if(active)text('✓',1031,y+84,55,'#23775f',700);
  });
  rect(78,1327,1044,135,s.index===3?'#245e53':'#173a40',24);
  text(s.index===3?'✓  Saved to shortlist':'Research shortlist',128,1410,47,'#f7f0db',600);
  text('Concept preview · illustrative themes',78,1532,27,'#6e7e73');
  map.needsUpdate=true;
 }};
}
