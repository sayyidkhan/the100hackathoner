export function kitarScreen(T){
 if(typeof document==='undefined')return {material:new T.MeshStandardMaterial({color:0x659e80}),update(){}};
 const c=document.createElement('canvas');c.width=720;c.height=1320;const x=c.getContext('2d'),map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;let last='';
 const rect=(a,b,w,h,color,r=18)=>{x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();};
 const text=(s,a,b,size=28,color='#183e32',weight='400')=>{x.fillStyle=color;x.font=`${weight} ${size}px Arial`;x.fillText(s,a,b);};
 const dot=(a,b,r,color)=>{x.fillStyle=color;x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.fill();};
 function update(s){const key=[s.phase,s.detected,Math.floor(s.route*30),Math.floor(s.fade*15)].join(':');if(last===key)return;last=key;
 x.fillStyle='#f6f4e9';x.fillRect(0,0,720,1320);text('9:41',38,48,22);text('KITAR-GO',38,164,61,'#183e32','700');text('Find a bin. Make it count.',40,213,28);
 rect(35,258,650,640,'#dce4cf');x.save();x.beginPath();x.roundRect(35,258,650,640,18);x.clip();
 for(let i=0;i<6;i++){rect(26+i*130,270,12,660,'#f8f6e9',0);rect(30,282+i*121,670,13,'#f8f6e9',0);}for(let i=0;i<16;i++){const a=54+(i%5)*126,b=308+Math.floor(i/5)*143;rect(a,b,76,62,i%3?'#cad4bb':'#b6cfb0',4);}
 x.lineWidth=9;x.strokeStyle='#669e80';x.setLineDash([12,13]);x.beginPath();x.moveTo(144,790);x.bezierCurveTo(186,620,449,654,514,403);x.stroke();x.setLineDash([]);
 const u=s.route,px=144+370*u,py=790-387*u;dot(px,py,29,'#f9faf1');dot(px,py,19,'#5da582');
 x.fillStyle='#194d3b';x.beginPath();x.moveTo(514,431);x.bezierCurveTo(465,375,447,333,514,326);x.bezierCurveTo(581,333,563,375,514,431);x.fill();text('♻',490,379,45,'#fffbe9');x.restore();
 if(s.phase===2||s.phase===3){rect(57,670,606,193,'#173f35');text(s.detected?'Bottle detected':'Recycling bin found',85,729,36,'#f4f5df','600');text(s.phase===3?'Deposit your plastic bottle':'Ready for your bottle',85,780,27,'#9fd9b5');text('AR concept preview',85,827,20,'#b5c6bb');}
 const title=['Locate a nearby bin','Follow the green route','You have arrived','Make your deposit','Deposit successful'][s.phase];
 rect(35,925,650,181,s.reward?'#d8ead7':'#e9eddf');dot(88,989,28,s.reward?'#5d9e73':'#b4c6aa');text(s.reward?'✓':String(s.phase+1),75,1001,31,'#fff','700');text(title,139,989,32,'#1d4939','600');text(s.reward?'Bottle recycled · points earned':s.phase===0?'Choose your target recycling bin':s.phase===1?'Guidance to an existing bin':'Rewards follow the deposit',62,1057,25,'#497454');
 ['Home','Map','Scan','Rewards'].forEach((v,i)=>{dot(107+i*169,1177,11,i===(s.reward?3:s.phase>1?2:1)?'#33775b':'#adb6a7');text(v,75+i*169,1222,22,'#48694f');});text('2019 prototype · illustrative journey',142,1285,19,'#83917d');
 if(s.fade<1){x.fillStyle=`rgba(246,244,233,${1-s.fade})`;x.fillRect(0,258,720,1045);}map.needsUpdate=true;
 }
 return {material:new T.MeshBasicMaterial({map,toneMapped:false}),update};
}
