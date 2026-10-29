export function punisherScreen(T){
 if(typeof document==='undefined')return {map:null,update(){}};
 const c=document.createElement('canvas');c.width=640;c.height=1120;const ctx=c.getContext('2d'),map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;let key='';
 function update(s){const next=[s.index,s.done,s.request,s.approved,s.winner,Math.floor(s.sign*12),Math.floor(s.deliver*12)].join();if(next===key)return;key=next;
 ctx.fillStyle='#f6ecd8';ctx.fillRect(0,0,640,1120);
 function text(t,y,size=28,color='#52212a',font='Georgia'){ctx.fillStyle=color;ctx.font=`${size}px ${font}`;ctx.textAlign='center';ctx.fillText(t,320,y,570);}
 function rect(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
 text('9:41',42,19,'#686253','sans-serif');rect(246,17,148,29,14,'#151619');text('The Punisher',132,51);text('A LITTLE ACCOUNTABILITY. TOGETHER.',174,17,'#9d7b50','sans-serif');
 text(['CHOOSE YOUR ROLES','OUR CONTRACT','YOUR WEEKLY TASKS','PARTNER REVIEW'][s.index],255,22);text('Angel & Devil',307,37);
 rect(57,353,248,54,22,'#e8dac1');rect(330,353,248,54,22,'#e8dac1');text('1 WEEK     ·     2 days left',390,24);
 if(s.index===0){
  text(s.winner?'PAPER WINS':'ROCK · PAPER · SCISSORS',510,s.winner?58:32);
  text(s.winner?'Choose your role first':'Play to choose',585,33);
  text('Angel  /  Devil',712,45);
 } else if(s.index===3){
  ctx.strokeStyle=s.approved?'#3c6955':'#b68a4b';ctx.lineWidth=12;ctx.beginPath();ctx.arc(320,575,96,0,Math.PI*2);ctx.stroke();
  if(s.approved){ctx.beginPath();ctx.moveTo(267,572);ctx.lineTo(307,614);ctx.lineTo(378,531);ctx.stroke();}else{text('…',593,76);}
  text(s.approved?'APPROVED':'REVIEW REQUESTED',740,40);
 } else if(s.index===2){
  text('Buy groceries',505,53);text(s.done?'TASK COMPLETE':'BRING IT HOME',600,42,s.done?'#3c6955':'#702732');
  rect(70,671,500,28,14,'#dfcfb4');if(s.deliver>0)rect(70,671,500*s.deliver,28,14,'#3c6955');text('Bread  ·  Fruit  ·  Greens',760,29);
 } else {
  ['Buy groceries','Tidy the room','No sweet drinks'].forEach((t,i)=>{const y=465+i*94;rect(44,y,552,77,13,'#efe1c9');ctx.textAlign='left';ctx.fillStyle='#3b2d25';ctx.font='34px Georgia';ctx.fillText(t,76,y+49);});
  text(s.sign===1?'AGREED · 1 WEEK':'Agree together',795,28);
 }
 rect(44,839,552,91,40,s.approved?'#3c6955':'#702732');text(s.approved?'Partner approved':s.request?'Awaiting approval':s.index===0?'Choose together':s.index===1?(s.sign===1?'Contract signed':'Finalise contract'):(s.done?'Approve Me':'In progress'),895,31,'#fff0d5');
 text(s.approved?'Grocery task confirmed.':s.request?'Completion needs your partner’s review.':'Agree on tasks and consequences together.',982,20,'#77634f','sans-serif');text('Illustrative original-prototype journey',1040,17,'#99846a','sans-serif');rect(233,1080,174,6,3,'#46382b');map.needsUpdate=true;
 }return {map,update};
}
