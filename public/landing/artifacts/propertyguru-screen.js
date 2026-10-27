// An illustrative shortlist, not live listings or measured conversion results.
function canvasPlane(T,w,h,width,height){
 const group=new T.Group();if(typeof document==='undefined')return {group};
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
 const plane=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,toneMapped:false}));plane.userData.noShadow=true;group.add(plane);
 return {group,c:canvas.getContext('2d'),map};
}
export function propertyToken(T,kind){
 const {group,c,map}=canvasPlane(T,.23,.23,128,128);if(!c)return group;
 c.strokeStyle=c.fillStyle='#354653';c.lineWidth=8;c.lineCap='round';c.lineJoin='round';
 if(kind==='building'){c.fillRect(28,22,30,88);c.fillRect(68,12,32,98);c.fillStyle='#f2e9d8';for(let y=26;y<100;y+=18)for(const x of [38,77])c.fillRect(x,y,10,9);}
 if(kind==='house'){c.beginPath();c.moveTo(16,60);c.lineTo(64,17);c.lineTo(111,60);c.lineTo(98,60);c.lineTo(98,107);c.lineTo(30,107);c.lineTo(30,60);c.fill();c.clearRect(55,74,20,34);}
 if(kind==='search'){c.beginPath();c.arc(54,53,29,0,Math.PI*2);c.moveTo(77,77);c.lineTo(107,107);c.stroke();}
 if(kind==='leaf'){for(const side of [-1,1]){c.save();c.translate(64,68);c.rotate(side*.6);c.beginPath();c.ellipse(side*16,-15,14,31,side*.2,0,Math.PI*2);c.fill();c.restore();}c.beginPath();c.moveTo(64,112);c.lineTo(64,57);c.stroke();}
 if(kind==='people'){for(const [x,y,r] of [[43,34,15],[84,42,12]]){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.beginPath();c.roundRect(x-r-6,y+r+10,(r+6)*2,43,13);c.fill();}}
 map.needsUpdate=true;return group;
}
export function propertyScreen(T){
 const {group,c,map}=canvasPlane(T,2.82,2.84,1440,1600);group.name='property-recommendations';let last=-1,art;
 function draw(stage){
  if(!c||typeof Image==='undefined')return;const matched=stage>=2;
  const rect=(x,y,w,h,r,col)=>{c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
  const text=(s,x,y,size=38,col='#30343a',bold=false)=>{c.fillStyle=col;c.font=`${bold?'600 ':''}${size}px Arial,sans-serif`;c.fillText(s,x,y);};
  c.clearRect(0,0,1440,1600);c.textAlign='left';rect(0,0,1440,1600,0,'#f4f0e7');rect(0,0,1440,166,0,'#232c34');
  c.strokeStyle='#ed6354';c.lineWidth=12;c.lineJoin='round';for(let i=0;i<3;i++){c.beginPath();c.moveTo(66,101-i*24);c.lineTo(103,65-i*24);c.lineTo(140,101-i*24);c.stroke();}
  text('PropertyGuru',162,96,49,'#faf6ef',true);c.strokeStyle='#eae8df';c.lineWidth=5;c.beginPath();c.arc(1190,77,18,0,Math.PI*2);c.moveTo(1204,92);c.lineTo(1220,109);for(let i=0;i<3;i++){c.moveTo(1295,62+i*17);c.lineTo(1350,62+i*17);}c.stroke();
  text('SMARTER PROPERTY CHOICES',68,266,61,'#30343a',true);
  const crops=[[600,180,420,410],[160,80,400,400],[110,480,460,270]],names=['Recommended home','Similar apartment','Terrace living'];
  for(let i=0;i<3;i++){
   const y=332+i*305,selected=i===0&&matched;rect(64,y,1312,275,17,selected?'#fff0e8':'#ebe7df');
   c.strokeStyle=selected?'#e96654':'#d8d3c9';c.lineWidth=selected?5:2;c.beginPath();c.roundRect(64,y,1312,275,17);c.stroke();
   c.save();c.beginPath();c.roundRect(91,y+25,345,225,8);c.clip();
   if(art)c.drawImage(art,...crops[i],91,y+25,345,225);
   else {rect(91,y+25,345,225,0,'#b9c8c6');for(let b=0;b<3;b++){rect(120+b*85,y+55+b*13,70,180-b*13,0,i===2?'#b97855':'#eee8d9');for(let f=0;f<6;f++)rect(129+b*85,y+69+b*13+f*24,49,13,0,'#587d79');}}
   c.restore();text(i===0&&!matched?'Finding relevant homes':names[i],478,y+81,47,selected?'#d95a49':'#414b4e',true);
   for(let j=0;j<3;j++)rect(478,y+116+j*38,[623,526,359][j],16,3,selected?'#d9bdb0':'#c7c4bd');
   c.strokeStyle=selected?'#df6250':'#717876';c.lineWidth=6;c.beginPath();c.moveTo(1300,y+119);c.lineTo(1320,y+139);c.lineTo(1300,y+159);c.stroke();
  }
  rect(64,1285,1312,145,12,matched?'#d95749':'#8b9999');c.textAlign='center';text(stage===3?'Enquire':matched?'Explore your shortlist':stage===1?'Learning from enquiries…':'Finding similar homes…',720,1376,49,'#fffaf1',true);
  c.textAlign='right';text('ILLUSTRATIVE CONCEPT / 2016',1373,1530,25,'#68716f');map.needsUpdate=true;
 }
 function update(stage){group.userData.stage=stage;if(last===stage)return;last=stage;draw(stage);}
 if(c&&typeof Image!=='undefined'){const img=new Image();img.onload=()=>{art=img;draw(last);for(let parent=group;parent;parent=parent.parent)parent.userData.requestRender?.();};img.src='/landing/assets/projects/003-propertyguru-recommendations-v1.png';}
 update(0);return {group,update};
}
