export function vanitaScreen(T){
 if(typeof document==='undefined')return {material:new T.MeshStandardMaterial({color:0xf5eee0}),update(){}};
 const c=document.createElement('canvas');c.width=640;c.height=1160;const x=c.getContext('2d');const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;
 let last=-1;const text=(s,a,b,size=28,color='#243949',weight='400')=>{x.fillStyle=color;x.font=`${weight} ${size}px Arial`;x.fillText(s,a,b);};
 function rect(a,b,w,h,color,r=16){x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();}
 function update(s){const tick=Math.floor(s.travel*60)+s.phase*100;if(tick===last)return;last=tick;
 x.fillStyle='#f5f3e9';x.fillRect(0,0,640,1160);rect(0,0,640,205,'#427eb3',0);text('9:41',32,36,21,'#fff');text('vanita',32,108,52,'#fff','600');text('All Delivery',34,168,24,'#fff');text('My Delivery',340,168,24,'#fff');rect(s.phase===0?32:338,184,180,4,'#fff',0);
 text(['Deliver in your neighbourhood','Your delivery is ready','On the way','At the doorstep','Delivery completed'][s.phase],30,256,29,'#203d53','600');
 rect(28,286,584,164,'#fff');text('Neighbourhood delivery',50,329,28,'#203d53','600');text('Collection point → Home',50,370,24,'#6c7b81');text('1 parcel',50,414,24);text(s.phase===0?'Available':'Accepted',440,414,24,'#427eb3','600');
 rect(28,475,584,338,'#dfe8df');
 for(let i=0;i<5;i++){rect(57+i*111,500+(i%2)*30,70,66,'#c2d0bf',5);rect(65+i*108,700,64,72,'#c9d6c8',5);}
 x.strokeStyle='#fffaf0';x.lineWidth=31;x.beginPath();x.moveTo(66,631);x.bezierCurveTo(210,540,360,760,562,607);x.stroke();
 x.strokeStyle='#4c8cbb';x.lineWidth=8;x.beginPath();x.moveTo(66,631);x.bezierCurveTo(210,540,360,760,562,607);x.stroke();
 const u=s.travel,a=1-u,px=a*a*a*66+3*a*a*u*210+3*a*u*u*360+u*u*u*562,py=a*a*a*631+3*a*a*u*540+3*a*u*u*760+u*u*u*607;
 x.fillStyle='#fff';x.beginPath();x.arc(px,py,18,0,Math.PI*2);x.fill();x.fillStyle='#3474aa';x.beginPath();x.arc(px,py,11,0,Math.PI*2);x.fill();
 text('PICK UP',48,797,18,'#52655e','600');text('HOME',510,797,18,'#52655e','600');
 const complete=s.delivered;rect(28,845,584,141,complete?'#d9eadc':'#e5e9ed');text(complete?'✓  Delivery confirmed':['Choose a delivery','Collect your parcel','Following the local route','Handing over the parcel'][s.phase]??'Handing over the parcel',50,897,28,complete?'#25614a':'#31495b','600');text(complete?'One more doorstep reached.':'A local journey. A new opportunity.',50,941,23,'#62766f');text('Delivery. Done. Money. Earned.',38,1046,25,'#427eb3','600');text('Respect. Won.',38,1083,25,'#427eb3','600');text('Concept preview',38,1130,18,'#89928c');tex.needsUpdate=true;
 }
 return {material:new T.MeshBasicMaterial({map:tex,toneMapped:false}),update};
}
