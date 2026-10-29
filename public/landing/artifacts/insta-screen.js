export const lessons=[
 {title:'A shared notebook',lines:['Everyone keeps a copy.','No single notebook holds it all.'],analogy:'Think: a notebook shared by a group.'},
 {title:'Add a new page',lines:['New records are grouped together.','Each group is called a block.'],analogy:'Think: filling the next page.'},
 {title:'Link it to the last',lines:['Each block points to the one before.','Together, they form a chain.'],analogy:'Think: numbered pages in order.'},
 {title:'Check it together',lines:['The network follows shared rules','to decide which updates to accept.'],analogy:'Think: comparing everyone’s copies.'},
 {title:'Keep your key safe',lines:['Your private key authorises actions.','Keep it secret. Never share it.'],analogy:'Think: your own signature stamp.'}
];
export function instaScreen(T,lessonOnly=false){
 if(typeof document==='undefined')return {material:new T.MeshBasicMaterial({color:0xf4f0e4}),update(){}};
 const c=document.createElement('canvas');c.width=800;c.height=lessonOnly?940:1400;const x=c.getContext('2d'),map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;let last='';
 const rect=(a,b,w,h,color,r=20)=>{x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();};
 const txt=(s,a,b,size=28,color='#214e4a',weight='400')=>{x.fillStyle=color;x.font=`${weight} ${size}px Arial`;x.fillText(s,a,b);};
 const stroke=(pts,color='#4c8d7b',width=7)=>{x.strokeStyle=color;x.lineWidth=width;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.stroke();};
 function notebook(a,b,scale=1){x.save();x.translate(a,b);x.scale(scale,scale);rect(-78,-95,156,190,'#245f55',12);rect(-67,-85,134,167,'#fff9e9',6);for(let j=0;j<5;j++)rect(-42,-50+j*23,84,5,'#b0c2ab',2);rect(-5,-84,5,165,'#c9ab6b',1);x.restore();}
 function illustration(i){rect(40,185,720,350,'#deeadc');
 if(i===0){stroke([[230,365],[400,280],[570,365],[230,365]]);notebook(230,365,.65);notebook(400,280,.65);notebook(570,365,.65);}
 if(i===1){for(let j=0;j<4;j++)rect(250-j*9,252+j*14,235,205,'#b8cbb8');rect(285,227,235,205,'#fff9e9');for(let j=0;j<5;j++)rect(313,258+j*27,173,7,'#81a58c',2);txt('+',548,368,80,'#3d8c76');}
 if(i===2){for(let j=0;j<3;j++){rect(140+j*190,290,140,140,'#fff9e9');txt(String(j+1),187+j*190,380,61,'#2a7562','600');if(j<2)stroke([[280+j*190,360],[330+j*190,360]],'#b29356',12);}}
 if(i===3){notebook(265,350,.8);notebook(535,350,.8);stroke([[365,350],[393,383],[443,316]],'#2f8d6f',13);}
 if(i===4){x.strokeStyle='#b19353';x.lineWidth=20;x.beginPath();x.arc(345,320,55,0,Math.PI*2);x.stroke();stroke([[384,358],[480,454],[507,427],[483,403]],'#b19353',20);}
 }
 function lesson(i,shift=0){x.save();x.translate(shift,0);const l=lessons[i];txt(`BITE ${String(i+1).padStart(2,'0')}  /  05`,42,58,25,'#548575','600');txt(l.title,42,125,46,'#204f46','600');illustration(i);l.lines.forEach((v,j)=>txt(v,45,610+j*48,32));rect(40,713,720,100,'#e7e9db');txt(l.analogy,65,773,26);for(let j=0;j<5;j++)rect(308+j*39,862,15,15,j===i?'#377d68':'#c3cebd',8);x.restore();}
 function update(s){const key=[s.phase,s.index,Math.round(s.swipe*30),Math.round(s.fade*20),Math.round(s.process*20)].join(':');if(key===last)return;last=key;rect(0,0,800,c.height,'#f5f2e7',0);
 if(lessonOnly){lesson(s.index);}
 else {txt('9:41',43,49,23);txt('Instareadr',43,150,67,'#204f46','600');txt('One idea. One swipe.',45,207,32);rect(40,247,720,2,'#d2ddcc',0);
 if(s.phase<2){txt(s.phase===0?'Start with the long version':'Keep only the key ideas',43,330,36,'#214e4a','600');rect(43,390,714,650,'#e1e8d9');for(let i=0;i<15;i++)rect(78,450+i*32,i%3===2?450:620,7,'#a0ad9c',3);rect(78,982,620*s.process,12,'#3d937a');txt('Turning dense text into 5 short bites',45,1130,29);}
 else {x.save();x.beginPath();x.rect(0,270,800,980);x.clip();x.translate(0,285);lesson(s.index,-s.swipe*800);if(s.index<4&&s.swipe>0)lesson(s.index+1,800-s.swipe*800);x.restore();}
 txt('Read less. Understand the idea.',161,1278,27,'#658171');rect(295,1367,210,7,'#214e4a',4);}
 if(s.fade<1){x.fillStyle=`rgba(245,242,231,${1-s.fade})`;x.fillRect(0,lessonOnly?0:270,800,c.height);}map.needsUpdate=true;
 }return {material:new T.MeshBasicMaterial({map,toneMapped:false}),update};
}
