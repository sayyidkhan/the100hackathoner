export function swagScreen(T){
 if(typeof document==='undefined')return {material:new T.MeshBasicMaterial({color:0xeae8dc}),update(){}};
 const c=document.createElement('canvas');c.width=720;c.height=1320;const x=c.getContext('2d'),map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;let last='';
 const colors=['#238c88','#d48465','#cba757','#d1c6af'];
 const rect=(a,b,w,h,color,r=18)=>{x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();};
 const text=(s,a,b,size=28,color='#193f42',weight='400',font='Arial')=>{x.fillStyle=color;x.font=`${weight} ${size}px ${font}`;x.fillText(s,a,b);};
 function update(s){const key=[s.phase,Math.round(s.balance*40),s.selected,s.matched,Math.round(s.fade*20)].join(':');if(last===key)return;last=key;
 x.fillStyle='#f4efe2';x.fillRect(0,0,720,1320);text('9:41',42,48,22);text('swag my life',40,165,70,'#19585b','400','Georgia');text('Your life in Singapore',44,216,30);
 text(['A lifestyle that fits you','Explore a place to call home','Balance the whole month','Discover your neighbourhood','Your lifestyle, connected'][s.phase],43,301,29,'#537275');
 let a=-Math.PI/2;for(let i=0;i<4;i++){x.beginPath();x.strokeStyle=colors[i];x.lineWidth=51;x.arc(360,526,151,a+.016,a+s.allocations[i]*Math.PI*2-.016);x.stroke();a+=s.allocations[i]*Math.PI*2;}
 text(s.phase<2?'YOUR':'ONE',s.phase<2?315:326,516,27,'#6d827d');text('MONTH',292,563,34,'#234b48','600');
 ['Home','Food','Leisure','Reserve'].forEach((v,i)=>{const yy=757+i*68;rect(46,yy-22,16,16,colors[i],4);text(v,83,yy,29);text(`${Math.round(s.allocations[i]*100)}%`,580,yy,28,'#365d59','600');rect(83,yy+15,528,4,'#e3ddcd',1);rect(83,yy+15,528*s.allocations[i],4,colors[i],1);});
 rect(37,1069,646,151,'#1e7776');text(s.matched?'Lifestyle matched':s.phase===0?'Start with your preferences':s.phase===1?'Compare home + lifestyle':s.phase===2?'Leave room for living':'Food. Culture. Close to home.',65,1124,31,'#fff7e7','600');text(s.matched?'A home is part of the whole picture':s.phase<2?'Warrior / Mage · lifestyle preferences':s.phase===2?'Home, food and leisure in balance':'Connecting your selected places',65,1171,24,'#cbe8de');
 text('Illustrative allocation · 2017 concept',139,1268,21,'#7a8980');rect(267,1298,186,6,'#284e4b',3);
 if(s.fade<1){x.fillStyle=`rgba(244,239,226,${1-s.fade})`;x.fillRect(0,250,720,1030);}map.needsUpdate=true;
 }
 return {material:new T.MeshBasicMaterial({map,toneMapped:false}),update};
}
