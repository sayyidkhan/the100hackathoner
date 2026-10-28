import {SAYWHAT_HITS} from './saywhat-timing.js';
export function saywhatScreen(T){
 if(typeof document==='undefined')return {material:new T.MeshStandardMaterial({color:0xeae5d6}),update(){}};
 const c=document.createElement('canvas');c.width=1600;c.height=900;const x=c.getContext('2d'),map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;let last='';
 const text=(s,a,b,size=26,color='#e5e7d8',weight='400')=>{x.fillStyle=color;x.font=`${weight} ${size}px Arial`;x.fillText(s,a,b);};
 function rect(a,b,w,h,color,r=12){x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();}
 function update(s){const key=[s.phase,s.query,s.matches,Math.floor(s.capture*50),Math.floor(s.cursor*130),Math.floor(s.playback*7),Math.floor(s.fade*20)].join(':');if(key===last)return;last=key;
 x.fillStyle='#15382f';x.fillRect(0,0,1600,900);rect(0,0,1600,96,'#214f40',0);text('SayWhat?',38,65,45,'#fff9e8','700');text('YOUR LECTURE. THE EXACT MOMENT.',840,60,22,'#d1e6d5','600');
 rect(0,96,304,804,'#102c25',0);text('MY LIBRARY',28,151,19,'#9ab6a1','600');rect(18,181,268,116,'#2a5141');text('Design &',34,222,25,'#eef1dd','600');text('communication',34,254,25,'#eef1dd','600');text('Lecture 04 · 35 min',34,282,18,'#a3b9a5');
 ['Research methods','Visual thinking','Design principles'].forEach((v,i)=>{text(v,32,352+i*68,21,'#a3b7a6');});text('NUS · CONCEPT ARCHIVE',28,838,16,'#a3b7a6','600');
 text(['A lecture, captured.','Search what you missed.','Find the relevant moments.','Back to the explanation.'][s.phase],348,159,35,'#e5e7d8','600');
 rect(348,193,1202,76,'#ffffff');text(s.phase===0?'Recording lecture…':s.query+(s.phase===1&&s.query.length<7?'|':''),380,241,30,s.phase===0?'#8b948b':'#245841','500');
 if(s.phase>=2)text('3 matches',1365,240,23,'#5c7765');
 if(s.phase<2){rect(348,293,1202,317,'#21473a');text(s.phase===0?'LIVE TRANSCRIPT':'SEARCH THE LECTURE',378,335,19,'#a7c4b0','600');const lines=['Good design begins with understanding people.','Interviews help us discover goals and frustrations.','A persona brings these patterns together.','It keeps the people we design for in focus.'];const n=s.phase===0?Math.floor(s.capture*4):4;lines.slice(0,n).forEach((l,i)=>{if(i===2&&s.phase===1)rect(368,449,1150,44,'#d3dfc5');text(l,380,385+i*48,27,i===2&&s.phase===1?'#234333':'#ccd9c4');});}
 else {SAYWHAT_HITS.forEach((h,i)=>{if(i>=s.matches)return;const selected=s.phase===3&&i===1;rect(348,293+i*105,1202,93,selected?'#e5c883':'#234b3d');rect(370,314+i*105,113,48,selected?'#735723':'#e5ecde',8);text(h.time,385,347+i*105,24,selected?'#fff5d8':'#376a51','600');text(h.title,514,334+i*105,26,selected?'#234333':'#e4ecd9','600');text(i===1?'“A persona brings these patterns together.”':'Design & communication · Lecture 04',514,366+i*105,21,selected?'#5d7262':'#b1c5ae');text(selected?'▶':'↗',1490,348+i*105,26,'#376a51');});}
 rect(348,634,1202,220,'#193d34');text(s.phase===0?'● RECORDING':s.phase===3?(s.playing?'▶ PLAYING MATCH':'SELECTED MOMENT'):'LECTURE TIMELINE',378,676,20,s.phase===0?'#edb687':'#a8c8ad','600');
 const left=385,right=1510,cy=742;for(let i=0;i<110;i++){const u=i/109,h=8+Math.abs(Math.sin(i*1.7)*Math.cos(i*.29))*54;const gold=s.phase===3&&Math.abs(u-SAYWHAT_HITS[1].u)<.04;rect(left+u*(right-left),cy-h/2,5,h,gold?'#ebc16b':(u<=s.capture?'#8fc6a8':'#34564b'),2);}
 if(s.phase>=2)SAYWHAT_HITS.slice(0,s.matches).forEach(h=>{const xx=left+h.u*(right-left);rect(xx,705,2,76,'#d5ab60',0);text(h.time,xx-25,811,17,'#e6d8b4');});
 rect(left+s.cursor*(right-left),698,3,91,'#fff9e3',0);text(s.phase===3?`14:${String(28+Math.floor(s.playback*7)).padStart(2,'0')} / 35:00`:'00:00 / 35:00',1304,675,21,'#e9e9cc');
 if(s.fade<1){x.fillStyle=`rgba(21,56,47,${1-s.fade})`;x.fillRect(304,96,1296,804);}map.needsUpdate=true;
 }
 return {material:new T.MeshBasicMaterial({map,toneMapped:false}),update};
}
