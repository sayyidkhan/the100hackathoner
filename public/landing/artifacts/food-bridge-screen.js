// Illustrative interface, not a reconstruction of an undocumented original app.
export const FOOD_MENUS=[
 {id:'noodle',stall:'Noodle House',dish:'Chicken noodles',diet:'Contains chicken',price:'$5.50',color:'#b96c50'},
 {id:'garden',stall:'Garden Bowl',dish:'Tofu grain bowl',diet:'Vegetarian',price:'$6.50',color:'#285e44'},
 {id:'fish',stall:'Fish & Rice',dish:'Grilled fish rice',diet:'Contains fish',price:'$7.00',color:'#ad8748'},
];
let photos=null;
export async function prepareFoodScreen(){
 if(photos||typeof Image==='undefined')return;
 photos=await new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=new URL('../assets/projects/014-food-menu-photos-v1.png',import.meta.url).href;});
}
export function foodScreenState(s){return {page:['discover','preferences','dish','directions'][s.index],preference:s.index>=1?'Vegetarian':null,visibleIds:s.index>=2?['garden']:FOOD_MENUS.map(m=>m.id),selectedId:s.index>=2?'garden':null,routeProgress:s.route};}
export function foodBridgeScreen(T){
 const canvas=typeof document==='undefined'?null:document.createElement('canvas');if(canvas){canvas.width=1000;canvas.height=1800;}
 const c=canvas?.getContext('2d');c?.scale(1.25,1.25);
 const map=canvas?new T.CanvasTexture(canvas):null;if(map){map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;}
 const material=new T.MeshBasicMaterial({map,color:0xffffff,toneMapped:false});let previous='';
 const ink='#193d30',muted='#748175',cream='#f6f3e9',green='#245e44';
 const rect=(x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
 const text=(s,x,y,size=28,color=ink,weight=400)=>{c.fillStyle=color;c.font=`${weight} ${size}px Arial`;c.fillText(s,x,y);};
 const rule=y=>{c.strokeStyle='#dedfd3';c.lineWidth=1;c.beginPath();c.moveTo(42,y);c.lineTo(758,y);c.stroke();};
 const circle=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
 function check(x,y,color='#ffffff'){c.strokeStyle=color;c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(x-9,y);c.lineTo(x-2,y+7);c.lineTo(x+12,y-10);c.stroke();}
 function photo(index,x,y,w,h,r=20){
  c.save();c.beginPath();c.roundRect(x,y,w,h,r);c.clip();
  if(photos){const cell=photos.width/3,side=Math.min(cell,photos.height),cropH=w/h>1?side*h/w:side,cropW=w/h>1?side:side*w/h;c.drawImage(photos,cell*index+(cell-cropW)/2,(photos.height-cropH)/2,cropW,cropH,x,y,w,h);}
  else{rect(x,y,w,h,0,['#dcb99d','#b4c7a6','#d5bf8d'][index]);circle(x+w/2,y+h/2,Math.min(w,h)*.36,'#f5ebd4');circle(x+w/2,y+h/2,Math.min(w,h)*.28,FOOD_MENUS[index].color);}
  c.restore();
 }
 function chip(label,x,y,w,selected){rect(x,y,w,58,29,selected?green:'#e9eade');text(label,x+22,y+38,26,selected?'#fffdf2':muted,selected?600:400);}
 function menuCard(index,y,active=false){const m=FOOD_MENUS[index];rect(38,y,724,227,23,'#ffffff');photo(index,52,y+14,190,190,16);text(m.stall,264,y+53,34,ink,600);text(m.dish,264,y+99,27,muted);text(m.price,264,y+151,30,ink,600);rect(264,y+172,220,33,16,index===1?'#e5efdd':'#f2eee5');text(m.diet,280,y+195,20,index===1?green:muted);if(active){circle(708,y+46,18,green);check(708,y+46);}else text('›',710,y+135,43,muted);}
 function button(label,y=1240){rect(40,y,720,84,26,green);text(label,72,y+53,32,'#fffdf3',600);text('→',696,y+54,36,'#fffdf3');}
 function footer(active){rule(1350);for(const [i,label] of ['Explore','Map','Saved'].entries()){const x=142+i*250;c.strokeStyle=i===active?green:'#9ba396';c.lineWidth=3;if(i===0){c.beginPath();c.arc(x,1381,10,0,Math.PI*2);c.moveTo(x+8,1389);c.lineTo(x+16,1397);c.stroke();}else if(i===1){c.strokeRect(x-13,1371,26,25);c.beginPath();c.moveTo(x-4,1371);c.lineTo(x-4,1396);c.moveTo(x+5,1371);c.lineTo(x+5,1396);c.stroke();}else{c.beginPath();c.moveTo(x-9,1397);c.lineTo(x-9,1371);c.lineTo(x+9,1371);c.lineTo(x+9,1397);c.lineTo(x,1390);c.closePath();c.stroke();}text(label,x-29,1427,20,i===active?green:muted,600);}}
 function mapView(s){
  rect(38,324,724,634,26,'#dbe2cc');c.save();c.beginPath();c.roundRect(38,324,724,634,26);c.clip();
  // The three stall footprints share the same order and colours as the physical scene.
  rect(66,357,668,200,15,'#bcc6aa');for(let i=0;i<3;i++){rect(87+i*218,381,182,144,11,FOOD_MENUS[i].color);text(['NOODLES','GARDEN','FISH'][i],108+i*218,438,22,'#faf4de',600);text(['A','B','C'][i],161+i*218,487,28,'#faf4de',600);}
  rect(70,572,660,58,15,'#f4efdc');rect(70,630,660,278,15,'#eee8d7');
  for(const [x,y] of [[125,677],[625,682],[645,845]]){circle(x,y,28,'#b4c19f');circle(x,y,16,'#819a6d');}
  for(const x of [210,550]){circle(x,740,32,'#d4c29b');for(const d of [-42,42])circle(x+d,740,10,'#c0aa80');}
  const route=[[155,858],[320,858],[390,805],[390,606]];c.strokeStyle='#91ad8c';c.lineWidth=12;c.lineCap='round';c.setLineDash([4,20]);c.beginPath();route.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.setLineDash([]);
  const lengths=[165,88,199],total=452;let remain=total*s.route;c.strokeStyle=green;c.lineWidth=11;c.beginPath();c.moveTo(...route[0]);for(let i=0;i<3;i++){const a=route[i],b=route[i+1],u=Math.min(1,remain/lengths[i]);if(u<=0)break;c.lineTo(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u);remain-=lengths[i];}c.stroke();
  circle(155,858,17,'#ffffff');circle(155,858,10,green);text('YOU',123,903,21,green,600);circle(390,588,29,green);check(390,588);c.restore();
  rect(56,974,688,212,24,'#ffffff');photo(1,73,992,150,150,18);text('Garden Bowl',249,1033,36,ink,600);text('Stall B · Food court',249,1077,26,muted);chip('Vegetarian',249,1100,214,true);button(s.route<1?'Follow the route':'You found your menu');
 }
 return {material,update(s){const model=foodScreenState(s),key=`${s.index}:${Math.round(s.filter*18)}:${Math.round(s.route*36)}:${!!photos}:${Math.floor(s.t*12)}`;if(key===previous||!c)return model;previous=key;
  rect(0,0,800,1440,0,cream);text('9:41',42,48,24,ink,600);rect(704,28,42,17,5,ink);rect(749,33,4,8,2,ink);
  circle(61,112,22,green);text('f',54,123,29,'#fffdf2',600);text('smart food bridge',99,123,32,ink,600);text('DEMO',676,120,18,muted,600);rule(156);
  if(s.index===0){text('Good food. Your way.',40,232,46,ink,600);text('Discover menus around you.',40,280,29,muted);rect(38,321,724,82,24,'#e9eadd');text('⌕',60,374,43,muted);text('Search dishes or stalls',112,373,30,muted);chip('All menus',40,429,203,true);chip('Vegetarian',259,429,229,false);chip('Fish',504,429,139,false);text('MENUS TO EXPLORE',42,540,22,muted,600);for(let i=0;i<3;i++)menuCard(i,566+i*247);footer(0);}
  if(s.index===1){text('Find your fit.',40,232,46,ink,600);text('Choose a dietary preference.',40,280,29,muted);rect(38,330,724,695,28,'#ffffff');text('DIETARY PREFERENCE',70,388,22,muted,600);
   for(const [i,label] of ['Any menu','Vegetarian','Pescatarian'].entries()){const y=423+i*166;rect(58,y,684,142,20,i===1?'#e6efde':'#f6f4ec');text(label,88,y+58,35,ink,600);text(['Explore every menu','Plant-based ingredients in this example','Fish and vegetable dishes'][i],88,y+105,23,muted);circle(691,y+64,21,i===1?green:'#d5dbce');if(i===1)check(691,y+64);}
   text('Look for a menu that fits',72,974,27,muted);text('1 matching menu',40,1101,40,ink,600);text('Garden Bowl · Tofu grain bowl',40,1153,28,muted);button('Show my match');footer(0);}
  if(s.index===2){text('A menu for you.',40,232,46,ink,600);chip('✓ Vegetarian',40,265,264,true);photo(1,38,353,724,436,28);rect(58,727,221,45,22,'#f6f3e9');text('MENU MATCH',80,758,23,green,600);text('Tofu grain bowl',40,856,45,ink,600);text('Garden Bowl  ·  Stall B',40,905,30,muted);text('$6.50',622,904,37,ink,600);rule(944);text('WHAT’S IN THE BOWL',40,991,22,muted,600);text('Tofu, brown rice, fresh greens,',40,1040,29);text('cucumber & cherry tomatoes.',40,1084,29);text('Vegetarian menu in this example.',40,1159,25,muted);button('Find this stall');footer(0);}
  if(s.index===3){text('Let’s find your food.',40,232,42,ink,600);text('Follow the route to Stall B.',40,280,29,muted);mapView(s);footer(1);}
  // A visible, seek-safe progress strip makes the playing state legible even
  // while the current screen remains available to read.
  for(let i=0;i<4;i++){const x=40+i*183;rect(x,167,170,5,2,'#dce2d4');const progress=i<s.index?1:i===s.index?(s.t%6)/6:0;if(progress>0)rect(x,167,170*progress,5,2,green);}
  map.needsUpdate=true;return model;
 }};
}
