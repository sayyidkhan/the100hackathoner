// Local illustrative data: original repo defines fields, not these values or rates.
export const ACTIVITIES=[
 {name:'Focus',hours:8,color:'#427d76'}, {name:'Learning',hours:2,color:'#70b9ba'},
 {name:'Travel',hours:2,color:'#d6a344'}, {name:'Rest',hours:8,color:'#e2d4b4'}, {name:'Life',hours:4,color:'#c47757'},
];
export const EXAMPLE={rate:20,days:20,valuedHours:10};
export const LIFE_CYCLE=28;
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export function lifeMoment(time){
 const t=((time%LIFE_CYCLE)+LIFE_CYCLE)%LIFE_CYCLE,index=Math.floor(t/7);
 const daily=EXAMPLE.rate*EXAMPLE.valuedHours;
 return {t,index,day:ease(t/5.8),focus:ease((t-7)/1.3),dailyProgress:ease((t-14)/1.1),monthProgress:ease((t-21)/1.4),daily,monthly:daily*EXAMPLE.days,reset:1-ease((t-27)/1)};
}
export function lifeScreen(T){
 const canvas=typeof document==='undefined'?null:document.createElement('canvas');
 if(canvas){canvas.width=1800;canvas.height=2400;}
 const c=canvas?.getContext('2d'),map=canvas?new T.CanvasTexture(canvas):null;
 if(c)c.scale(2,2);
 if(map){map.colorSpace=T.SRGBColorSpace;map.anisotropy=16;}
 // White material preserves the canvas contrast instead of tinting every pixel beige.
 const material=new T.MeshBasicMaterial({map,color:0xffffff,toneMapped:false});let last='';
 const text=(s,x,y,size=44,color='#102f35',weight='500')=>{c.font=`${weight} ${size}px Arial`;c.fillStyle=color;c.fillText(s,x,y);};
 const rect=(x,y,w,h,color,r=0)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
 const titles=['Your 24-hour day','Time to focus','Daily activity value','Monthly perspective'];
 return {material,update(s){const key=`${s.index}:${Math.floor(s.t*10)}`;if(!c||key===last)return;last=key;
  rect(0,0,900,1200,'#fffaf0');
  text('LIFE-WORTH',60,88,40,'#17645c','700');
  text(titles[s.index],60,186,60,'#102f35','700');
  rect(60,226,780,4,'#b2c7bf');
  if(s.index<2){
   let total=0;
   for(const [i,a] of ACTIVITIES.entries()){
    const y=284+i*137,progress=clamp((s.day*24-total)/a.hours);total+=a.hours;
    rect(60,y,780,113,s.index===1&&i<2?'#d8eee4':'#eeeadd',14);
    rect(81,y+23,10,66,a.color,5);
    text(a.name,117,y+53,49,'#102f35','600');
    text(`${a.hours}h`,729,y+53,49,'#102f35','700');
    rect(118,y+80,620,8,'#d1d8ce',4);rect(118,y+80,620*a.hours/8*progress,8,a.color,4);
   }
   text(s.index===0?'24 hours. One whole day.':'Focus + learning = 10 hours',60,1050,43,'#17645c','600');
   text('An illustrative day',60,1130,35,'#465d59');
  }else if(s.index===2){
   text('10 hours × $20 / hour',60,316,49,'#334d49');
   text(`$${s.daily}`,60,516,176,'#135b52','700');
   text('PER DAY',68,581,43,'#135b52','700');
   for(let i=0;i<2;i++){
    const a=ACTIVITIES[i],y=661+i*146;rect(60,y,780,122,'#e0eee5',16);
    text(a.name,90,y+52,46);text(`$${a.hours*EXAMPLE.rate}`,658,y+52,49,'#135b52','700');
    rect(90,y+88,690*a.hours/10*s.dailyProgress,10,a.color,5);
   }
   text('Sample rate · activity value',60,1050,39,'#465d59');
   text('Not a measure of human worth',60,1130,39,'#465d59');
  }else{
   text('$200 per day × 20 days',60,316,49,'#334d49');
   text(`$${s.monthly.toLocaleString('en-US')}`,60,516,168,'#135b52','700');
   text('20-DAY EXAMPLE',68,581,43,'#135b52','700');
   const days=Math.floor(20*s.monthProgress);
   for(let i=0;i<20;i++){const x=60+(i%5)*159,y=650+Math.floor(i/5)*79;rect(x,y,142,65,i<days?'#17645c':'#e2e4da',8);text(String(i+1),x+48,y+46,38,i<days?'#ffffff':'#53665f','600');}
   text('Same rate. A longer view.',60,1050,43,'#17645c','600');
   text('Illustrative, not predicted earnings',60,1130,37,'#465d59');
  }
  map.needsUpdate=true;
 }};
}
