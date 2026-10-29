import {WARRIORS_LABELS} from './warriors-timing.js';
export function warriorsScreen(T){
 if(typeof document==='undefined')return {material:new T.MeshBasicMaterial({color:0xf1e8d4}),update(){}};
 const c=document.createElement('canvas');c.width=840;c.height=1680;const x=c.getContext('2d'),map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;let last='';
 const colors=['#cd7652','#7969ad','#c4a447','#4b8db6','#50977f'];
 const rect=(a,b,w,h,color,r=18)=>{x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();};
 const text=(s,a,b,size=32,color='#203a57',weight='400',font='Arial')=>{x.fillStyle=color;x.font=`${weight} ${size}px ${font}`;x.fillText(s,a,b);};
 function icon(type,cx,cy,scale=1,color='#233d60'){x.save();x.translate(cx,cy);x.scale(scale,scale);x.fillStyle=color;x.strokeStyle=color;x.lineWidth=7;
 if(type==='mage'){x.beginPath();x.moveTo(-58,40);x.quadraticCurveTo(0,61,63,34);x.lineTo(33,20);x.quadraticCurveTo(-2,-20,35,-62);x.quadraticCurveTo(-47,-60,-39,20);x.closePath();x.fill();x.strokeStyle='#d4b57a';x.beginPath();x.moveTo(-35,15);x.lineTo(26,14);x.stroke();}
 else {x.beginPath();x.ellipse(0,-7,43,56,0,Math.PI,Math.PI*2);x.lineTo(40,35);x.lineTo(0,63);x.lineTo(-40,35);x.closePath();x.fill();x.strokeStyle='#f4e9d1';x.beginPath();x.moveTo(-33,-7);x.lineTo(33,-7);x.stroke();for(let j=-1;j<=1;j++){x.beginPath();x.moveTo(j*14,10);x.lineTo(j*14,34);x.stroke();}}x.restore();}
 function update(s){const key=[s.phase,s.selected,...s.amounts.map(v=>Math.round(v)),Math.round(s.fade*20)].join(':');if(last===key)return;last=key;
 x.fillStyle='#f3ebd9';x.fillRect(0,0,840,1680);text('9:41',43,55,23);icon('warrior',367,139,.38);icon('mage',470,139,.38);text('Warriors & Mages',62,248,67,'#203a57','400','Georgia');
 rect(58,281,724,2,'#d5c6a8',0);text('YOUR MONTHLY QUEST',195,344,27,'#7b807f','600');
 if(s.phase===0){text('Choose your path',110,455,59,'#203a57','400','Georgia');
 for(let i=0;i<2;i++){const xx=52+i*378,selected=i===1&&s.selected;rect(xx,535,354,460,selected?'#284e70':'#e7dec9',24);icon(i?'mage':'warrior',xx+177,672,1,selected?'#ead8ac':'#284768');text(i?'Mage':'Warrior',xx+80,827,48,selected?'#fff1d0':'#284768','400','Georgia');text(i?'Reading & reflection':'Exercise & social life',xx+24,904,27,selected?'#c2d5dc':'#6a7780');}
 rect(67,1060,706,126,'#e1e7d9');text(s.selected?'Mage selected':'What matters to you?',108,1115,37,'#345d59','600');text('Build a plan around your interests.',108,1163,27,'#627a74');
 }else {text('$500',277,473,104,'#233e5e','500');text('MONTHLY ALLOWANCE',237,526,25,'#7c827d');
 let a=-Math.PI/2;x.beginPath();x.strokeStyle='#e2d8c4';x.lineWidth=61;x.arc(420,755,164,0,Math.PI*2);x.stroke();
 for(let i=0;i<5;i++){const arc=s.amounts[i]/500*Math.PI*2;if(arc>.02){x.beginPath();x.strokeStyle=colors[i];x.lineWidth=61;x.arc(420,755,164,a+.012,a+arc-.012);x.stroke();}a+=arc;}
 text(s.ready?'PLANNED':'TO ALLOCATE',s.ready?359:333,740,24,'#7d8582');text(s.ready?'100%':`$${Math.round(s.pending)}`,s.ready?334:341,805,61,'#274c69','500');
 WARRIORS_LABELS.forEach((v,i)=>{const yy=1045+i*69;rect(64,yy-22,17,17,colors[i],5);text(v,102,yy,32);text(`$${Math.round(s.amounts[i])}`,670,yy,33,'#233e5e','600');if(i<4)rect(100,yy+22,660,1,'#dfd4bd',0);});}
 rect(62,1432,716,95,'#223f60');icon('mage',107,1478,.33,'#ead3a0');text(s.phase===0?'Your interests. Your journey.':s.phase<3?'Mage · shaping your monthly plan':'$50 towards your savings goal',150,1489,29,'#f7ead0');
 const stage=Math.min(3,s.phase);for(let i=0;i<4;i++)rect(185+i*119,1571,99,7,i<=stage?'#bd9955':'#d9cfb8',3);
 text(['01 / CHOOSE','02 / SET ALLOWANCE','03 / ALLOCATE','04 / YOUR PLAN','MAKE IT A HABIT'][s.phase],280,1623,21,'#76807c');text('Illustrative plan',338,1660,19,'#8c928c');
 if(s.fade<1){x.fillStyle=`rgba(243,235,217,${1-s.fade})`;x.fillRect(0,306,840,1360);}map.needsUpdate=true;
 }
 return {material:new T.MeshBasicMaterial({map,toneMapped:false}),update};
}
