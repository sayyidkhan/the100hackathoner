// Unlit canvas lettering stays legible as the miniature turns under the lights.
export function cuisineScreen(T) {
 const group=new T.Group();group.name='cuisine-screen';let ctx,map,last='';
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1280;ctx=canvas.getContext('2d');
  map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  const plane=new T.Mesh(new T.PlaneGeometry(1.44,2.40),new T.MeshBasicMaterial({map,toneMapped:false}));plane.userData.noShadow=true;group.add(plane);
 }
 function update(count,matched){
  group.userData.state=matched?'matched':count===3?'combining':'preferences';group.userData.count=count;
  const key=`${count}:${matched}`;if(key===last)return;last=key;if(!ctx)return;
  const c=ctx;
  function text(s,x,y,size=32,color='#213d36',font='sans-serif'){c.fillStyle=color;c.font=`${size}px ${font}`;c.fillText(s,x,y);}
  function rect(x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
  rect(0,0,768,1280,0,'#f7f1e5');c.textAlign='left';text('WinWinCusine',52,100,34);rect(52,146,664,2,0,'#d6ddcf');
  text(matched?'A place for':'Different tastes.',52,240,61,'#163d34','Georgia');text(matched?'everyone.':'One group.',52,313,61,'#163d34','Georgia');
  const colors=['#d47759','#72a48b','#d2a34c'];
  for(let i=0;i<3;i++){
   const x=155+i*225,filled=count>i;c.fillStyle=filled?colors[i]:'#dddcd2';c.beginPath();c.arc(x,427,58,0,Math.PI*2);c.fill();
   c.fillStyle='#fff8eb';c.beginPath();c.arc(x,411,15,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(x,444,26,18,0,Math.PI,Math.PI*2);c.fill();
  }
  c.textAlign='center';text(`${count} of 3 preferences received`,384,545,30,'#586f61');
  rect(42,610,684,470,28,matched?'#dcebdc':'#edece1');
  if(matched){
   c.strokeStyle='#2a7b5d';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(352,696);c.lineTo(375,719);c.lineTo(420,667);c.stroke();
   text('GOOD TOGETHER',384,803,40);text('Kopitiam',384,859,35,'#4b6b56','Georgia');text('Noodles · Veggie · Mild',384,932,31);rect(104,984,560,58,29,'#286c54');text('GROUP MATCH',384,1023,26,'#fff8ea');
  }else{
   text(count===3?'Finding common ground':'What do you feel like?',384,754,37);
   text(count===3?'Combining the group’s tastes':'Share everyone’s preferences',384,825,29,'#617365');
   for(let i=0;i<3;i++)rect(176+i*151,927,115,9,4,count>i?colors[i]:'#cdd3c5');
  }
  text('Illustrative group recommendation',384,1171,22,'#6e7c6d');rect(276,1240,216,7,4,'#294239');map.needsUpdate=true;
 }
 update(0,false);return {group,update};
}
