export function goblinScreen(T){
 if(typeof document==='undefined')return {material:new T.MeshStandardMaterial({color:0xe9e0ca}),update(){}};
 const c=document.createElement('canvas');c.width=768;c.height=960;const x=c.getContext('2d');const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;
 const text=(s,a,b,size=30,color='#234637',weight='400')=>{x.fillStyle=color;x.font=`${weight} ${size}px Arial`;x.fillText(s,a,b);};
 const rect=(a,b,w,h,color,r=16)=>{x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();};
 let last='';return {material:new T.MeshBasicMaterial({map:tex,toneMapped:false}),update(s){const d=s.devices[s.active],key=[s.active,s.phase,Math.floor(d.scan*30),s.reuse,s.recycle].join(':');if(last===key)return;last=key;
 x.fillStyle='#eee8d8';x.fillRect(0,0,768,960);text('GOBLIN',40,63,29,'#526b57','600');text('A useful next chapter.',40,126,42,'#214b38','600');text('COMMUNITY E-WASTE COLLECTION',40,173,21,'#798575','600');
 rect(40,207,688,422,'#d9dfcc');rect(275,235,218,355,'#263b36',25);rect(288,260,192,299,s.active===0?'#6c9984':'#434c49',8);rect(345,244,78,6,'#a4b6aa',3);
 if(s.active===0){text('↻',340,420,80,'#e5f3dc','600');text('SMARTPHONE',310,527,18,'#e5f3dc');}
 else {x.strokeStyle='#c5cabd';x.lineWidth=3;x.beginPath();x.moveTo(373,270);x.lineTo(340,357);x.lineTo(403,416);x.lineTo(351,515);x.moveTo(340,357);x.lineTo(288,389);x.moveTo(403,416);x.lineTo(478,378);x.stroke();}
 if(s.phase==='inspect'){rect(289,267+d.scan*279,190,6,'#eacb79',0);}
 const status={collect:'Device received',move:'Moving to inspection',inspect:'Checking the device',sort:s.active===0?'Ready for refurbishment':'Ready for material recovery',complete:s.active===0?'Refurbishment tray':'Recycling tray'}[s.phase];
 text(status,40,682,34,'#214b38','600');text('Collect  /  Inspect  /  Recover',40,725,23,'#778373');
 rect(40,770,331,105,s.reuse?'#215a43':'#d8dfd0');rect(389,770,339,105,s.recycle?'#9c6541':'#e1d8c5');text(s.reuse?'✓  REFURBISH':'REFURBISH',64,832,25,s.reuse?'#fff2d6':'#6b7867','600');text(s.recycle?'✓  RECYCLE':'RECYCLE',418,832,25,s.recycle?'#fff2d6':'#847662','600');text('Illustrative collection flow',40,925,21,'#899081');tex.needsUpdate=true;
 }};
}
