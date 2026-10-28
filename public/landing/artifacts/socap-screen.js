export function socapScreen(T,kind='borrower',version=1){
 if(typeof document==='undefined')return {material:new T.MeshStandardMaterial({color:0x266769}),update(){}};
 const phone=kind==='borrower',c=document.createElement('canvas');c.width=phone?720:1600;c.height=phone?1260:900;
 const x=c.getContext('2d'),map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;let last='';
 const text=(s,a,b,size=28,color='#214e52',weight='400')=>{x.fillStyle=color;x.font=`${weight} ${size}px Arial`;x.fillText(s,a,b);};
 const rect=(a,b,w,h,color,r=12)=>{x.fillStyle=color;x.beginPath();x.roundRect(a,b,w,h,r);x.fill();};
 const circle=(a,b,r,color)=>{x.fillStyle=color;x.beginPath();x.arc(a,b,r,0,Math.PI*2);x.fill();};
 function person(a,b,r,color){circle(a,b-r*.28,r*.27,color);x.fillStyle=color;x.beginPath();x.ellipse(a,b+r*.33,r*.52,r*.35,0,0,Math.PI*2);x.fill();}
 function butterfly(a,b,scale){x.save();x.translate(a,b);x.scale(scale,scale);x.lineWidth=2.4;x.strokeStyle='#dce773';for(const side of [-1,1]){x.beginPath();x.moveTo(0,0);x.bezierCurveTo(side*12,-12,side*30,-29,side*27,-12);x.lineTo(side*18,7);x.bezierCurveTo(side*27,27,side*9,31,0,0);x.stroke();}x.restore();}
 function update(s){const k=[s.phase,s.connected,s.sent,s.updated,Math.floor(s.feedback*20),Math.floor(s.fade*12)].join(':');if(last===k)return;last=k;
 x.fillStyle='#f1eee2';x.fillRect(0,0,c.width,c.height);
 if(phone){
 rect(0,0,720,232,'#245f65',0);butterfly(68,81,1.1);text('SOCIAL CAPITAL',120,78,31,'#fff8e3','700');text(version===1?'1.0 / BORROWER':'2.0 / CONNECTED PROFILE',120,118,20,'#c9e19b','600');
 text(version===1?'Your application':'Your digital ledger',38,190,44,'#fff9e8','600');
 const labels=version===1?['Connect your profile','Your social connections','Application sent','Awaiting bank review']:['Connect your profile','Record assembled','Ready for review','Outcome received','Ledger updated'];
 text(labels[s.phase],38,303,35,'#214e52','600');text('Illustrative project journey',38,344,23,'#738681');
 rect(35,385,650,167,'#ffffff');circle(110,468,49,'#dce7df');person(110,468,48,'#3d7776');text('Applicant 01',188,454,34,'#254e52','600');text(s.connected?'Profile connected':'Connecting profile…',188,499,24,'#6e8276');
 ['Mobile details','Social profile','Application details'].forEach((label,i)=>{const done=s.connected>i;rect(35,586+i*113,650,94,done?'#dce8df':'#e6e5db');circle(83,634+i*113,20,done?'#34797c':'#b9c4ba');text(done?'✓':'·',72,644+i*113,27,'#ffffff','600');text(label,130,643+i*113,29);});
 rect(35,973,650,154,'#245f65');text(s.sent?'Sent to lender':'Building your record',65,1025,33,'#f4f2d9','600');text(s.review?'Review is with the institution.':'A clearer picture, one step at a time.',65,1071,24,'#cadbce');
 text('CAPITAL FOR THE PEOPLE',42,1191,21,'#426c6a','600');
 }else{
 rect(0,0,1600,106,'#245f65',0);butterfly(54,49,.9);text('SOCIAL CAPITAL ASIA',103,58,31,'#fff9e8','700');text('2.0 / LENDER WORKSPACE',103,87,18,'#d2e1ba','600');text('ILLUSTRATIVE PORTFOLIO',1220,62,19,'#c7dbd2');
 rect(0,106,267,794,'#173b42',0);['Portfolio','Applicants','Digital ledger','Outcomes'].forEach((v,i)=>{if(i===(s.updated?3:s.review?1:2))rect(14,151+i*76,239,56,'#37777a');text(v,37,186+i*76,25,'#e9eddf');});text('2017 / SO.IMPACT',30,850,18,'#b7cdc4');
 const title=['Connecting the records','A digital ledger takes shape','Review the application','Record the outcome','Learn from the full journey'][s.phase];text(title,310,174,39,'#214e52','600');
 ['Mobile & social','Application record','Loan outcomes'].forEach((v,i)=>{rect(310+i*415,208,391,109,'#ffffff');text(v,330+i*415,249,22,'#66877e');text(i===2?(s.updated?'Updated':'Awaiting outcome'):(s.sent?'Connected':'Receiving…'),330+i*415,289,28,'#275e62','600');});
 rect(310,347,684,365,'#ffffff');text('Applicant queue',338,391,28,'#245e62','600');['01','02','03'].forEach((v,i)=>{const selected=i===0&&s.review;rect(332,414+i*88,640,76,selected?'#e4e9b9':'#edf1e8');circle(368,452+i*88,22,'#c2d7cd');person(368,452+i*88,20,'#397c7c');text('Applicant '+v,407,449+i*88,25);text(i===0&&s.updated?'Outcome recorded':s.sent?'Ready for review':'Record pending',407,477+i*88,19,'#6b8277');text(selected?'→':'·',925,462+i*88,27);});
 rect(1019,347,536,365,'#e4ece4');text(s.review?'Applicant 01 / dossier':'Profile connections',1044,391,27,'#245e62','600');const cx=1285,cy=528;for(let i=0;i<6;i++){const a=i*Math.PI/3,xx=cx+Math.cos(a)*133,yy=cy+Math.sin(a)*79;x.strokeStyle='#8bb5aa';x.lineWidth=3;x.beginPath();x.moveTo(cx,cy);x.lineTo(xx,yy);x.stroke();circle(xx,yy,15,s.connected>i/2?'#347f80':'#bccfc3');}circle(cx,cy,35,'#245f65');person(cx,cy,31,'#f7f0d6');text('Mobile + social + application',1090,678,21,'#5b7d73');
 rect(310,738,1245,120,'#245f65');text(s.updated?'Digital ledger updated':s.phase===3?'Loan outcome → digital ledger':s.review?'Institution review in progress':'Preparing records for review',338,782,28,'#fff7dd','600');const progress=s.updated?1:s.phase===3?s.feedback:s.sent?.5:s.connected/12;rect(338,807,1180,13,'#173e45',5);rect(338,807,Math.max(3,1180*progress),13,'#dce773',5);text('Historical concept / sample records',1160,882,18,'#789084');
 }
 if(s.fade<1){x.fillStyle=`rgba(241,238,226,${1-s.fade})`;x.fillRect(0,phone?232:106,c.width,c.height);}map.needsUpdate=true;
 }
 return {material:new T.MeshBasicMaterial({map,toneMapped:false}),update};
}
