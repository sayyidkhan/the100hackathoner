// Contemporary concept UI, matched to the approved artwork; not an archived app screenshot.
export const lessons = {
  1: { title:['Listen before','you solve.'], time:'3 min', tip:[['Pause before','offering advice.'],['Ask one open','question.'],['Summarise what','you heard.']], question:['A teammate raises a concern.', 'What should you do first?'], answers:[['Offer your solution'],['Ask what has been difficult'],['Dismiss the problem']], feedback:['An open question creates space', 'to understand before you advise.'], next:'Ask better questions', color:'#124c48', accent:'#d8ef82', soft:'#edf2d8' },
  2: { title:['Make feedback','actually useful.'], time:'4 min', tip:[['Describe what you','observed.'],['Explain its specific','impact.'],['Agree on one next action.']], question:['Which feedback is most useful?'], answers:[['Be more professional.'],['Your summary missed','the deadline.'],['You always get things','wrong.']], feedback:['A specific observation makes it', 'easier to agree on a next action.'], next:'Turn feedback into action', color:'#252f78', accent:'#d2e88c', soft:'#e6e7ef' },
};
export const screenSizes={phone:[800,1600],card:[800,1240],chip:[800,156],tile:[240,280]};

export function paintScreen(ctx, edition, phase, mode='phone', { selected = true } = {}) {
 const d=lessons[edition],[W,H]=screenSizes[mode],ink=d.color,bg='#fbf7ef';
 const rect=(x,y,w,h,c,r=24,stroke=null)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=c;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}};
 const text=(s,x,y,size=30,c=ink,weight=400)=>{ctx.fillStyle=c;ctx.font=`${weight} ${size}px Arial`;ctx.fillText(s,x,y);};
 const lines=(ss,x,y,size=48,c=ink,weight=600,gap=size*1.18)=>ss.forEach((s,i)=>text(s,x,y+i*gap,size,c,weight));
 const circle=(x,y,r,c)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();};
 const path=(pts,c=ink,width=4)=>{ctx.strokeStyle=c;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
 const check=(x,y,c=ink)=>path([[x-10,y],[x-2,y+8],[x+13,y-10]],c,4);
 function icon(kind,x,y,s=1,c=ink){ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  if(kind==='book'){ctx.strokeStyle=c;ctx.lineWidth=4;ctx.strokeRect(-17,-23,34,44);path([[-8,-12],[9,-12]],c);path([[-8,-2],[9,-2]],c);path([[-8,8],[4,8]],c);}
  if(kind==='target'){for(const r of [22,13,4]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.strokeStyle=c;ctx.lineWidth=4;ctx.stroke();}path([[0,0],[23,-25],[23,-14]],c);}
  if(kind==='bulb'){ctx.beginPath();ctx.arc(0,-6,17,Math.PI*.16,Math.PI*2.84);ctx.strokeStyle=c;ctx.lineWidth=4;ctx.stroke();path([[-9,8],[-8,20],[8,20],[9,8]],c);path([[-6,27],[6,27]],c);}
  if(kind==='chat'){ctx.beginPath();ctx.arc(0,-3,21,0,Math.PI*2);ctx.strokeStyle=c;ctx.lineWidth=4;ctx.stroke();path([[-15,12],[-20,24],[-5,17]],c);}
  if(kind==='home'){path([[-21,-2],[0,-22],[21,-2],[15,-2],[15,22],[3,22],[3,6],[-5,6],[-5,22],[-15,22],[-15,-2]],c,4);}
  if(kind==='list'){for(let i=0;i<3;i++){circle(-18,-16+i*16,3,c);path([[-7,-16+i*16],[20,-16+i*16]],c,3);}}
  if(kind==='bars'){for(let i=0;i<3;i++)rect(-18+i*16,15-i*11,7,16+i*11,c,2);}
  ctx.restore();
 }
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 if(mode==='chip'||mode==='tile'){
  if(mode==='chip'){circle(82,78,55,phase===1?d.accent:'#d9dff5');icon(['book','target','bulb'][phase],82,78,1.25);text(['Clear examples','Real situations','Fast, practical tips'][phase],172,93,38);path([[738,65],[752,78],[738,91]],'#8c8b88',3);}
  else {icon(['book','chat','target'][phase],120,90,1.5);ctx.textAlign='center';text(['Key idea','Example','Try it'][phase],120,189,27,ink,600);rect(74,227,92,8,d.accent,4);ctx.textAlign='left';}return;
 }
 const isPhone=mode==='phone', top=isPhone?205:142;
 if(isPhone){
  text('9:41',62,65,27,ink,600);rect(670,42,48,20,ink,5);for(let i=0;i<4;i++)rect(613+i*10,60-i*4,6,5+i*4,ink,1);
  if(edition===2){ctx.textAlign='center';text('xueyiyi',400,173,76,ink,700);text('learn easy',400,217,26);ctx.textAlign='left';path([[55,145],[86,145]],ink);path([[55,156],[86,156]],ink);path([[55,167],[86,167]],ink);}
  else {text('xueyiyi',56,173,76,ink,700);text('learn easy',60,213,27);}
  circle(716,164,31,'#ede7dc');circle(716,155,9,ink);path([[702,177],[705,170],[727,170],[730,177]],ink,3);
 }else{path([[76,48],[60,64],[76,80]]);for(let i=0;i<3;i++)circle(700+i*13,64,3.5,ink);}
 if(phase===0){
  lines(['A small lesson.','A useful skill.'],52,312,70,ink,700,80);
  const gradient=ctx.createLinearGradient(60,470,740,980);gradient.addColorStop(0,edition===1?'#185c56':'#303d87');gradient.addColorStop(1,edition===1?'#093d3b':'#454a9b');
  rect(42,444,716,515,gradient,40);rect(85,487,188,62,d.accent,31);text(d.time.toUpperCase(),115,529,31,ink,700);
  // Sculpted speech graphics are built as actual 3D objects above this reserved area.
  lines(d.title,82,850,60,'#fffdf6',600,66);
  circle(682,890,40,edition===1?'#2c6961':'#535ba0');path([[666,890],[697,890],[685,877]],'#faffdf',4);path([[697,890],[685,903]],'#faffdf',4);
  rect(42,989,716,115,d.accent,57);ctx.textAlign='center';text('Start this lesson',400,1062,43,ink,600);ctx.textAlign='left';
  for(let i=0;i<3;i++)rect(294+i*73,1145,49,12,i===0?ink:'#d8d6d1',6);
  rect(42,1200,716,196,'#f5f0e6',28);text('This week',70,1250,32,ink,600);text('4/7 lessons',560,1250,27,'#696b7c');
  for(let i=0;i<7;i++){const x=94+i*102;circle(x,1317,30,i<4?d.accent:'#e8e3db');if(i<4)check(x,1317);text(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],x-22,1375,23,i<4?ink:'#a6a29b');}
 }else if(phase===1){
  if(edition===2){rect(56,top-20,180,47,'#cfd8f7',23);text('L E S S O N',79,top+12,23,ink,600);}
  lines(d.title,56,top+edition*24+81,64,ink,700,72);
  const y=top+262;rect(55,y,690,232,d.soft,34);text('K E Y  T A K E A W A Y',91,y+58,24);lines(edition===1?['Understand first.','Solve second.']:['Be specific.','Make it actionable.'],91,y+122,48,ink,600,56);
  d.tip.forEach((ss,i)=>{const cy=y+326+i*154;circle(101,cy,42,edition===1?d.accent:ink);text(String(i+1),89,cy+15,40,edition===1?ink:'#ffffff');lines(ss,192,cy-3,38,ink,400,46);if(i<2)path([[192,cy+92],[720,cy+92]],'#e8e2d8',2);});
 }else if(phase===2){
  rect(56,top-4,130,44,d.accent,22);text('Q U I Z',79,top+27,24,ink,600);text('Put it into practice.',56,top+108,57,ink,700);
  lines(d.question,56,top+234,35,ink,400,48);
  d.answers.forEach((ss,i)=>{const chosen=selected&&i===1,y=top+335+i*150;rect(55,y,690,128,chosen?'#eef3d7':bg,26,chosen?'#b2cb73':'#ddd8d0');circle(106,y+64,24,chosen?ink:'#8f9195');circle(106,y+64,chosen?10:20,chosen?'#f8faef':bg);lines(ss,164,y+ss.length*-21+75,36,ink,400,43);});
  rect(55,top+846,690,103,ink,51);text(edition===1?'Next':'Check answer',140,top+910,40,'#ffffff',600);path([[654,top+895],[686,top+895],[672,top+880]],'#ffffff',4);path([[686,top+895],[672,top+910]],'#ffffff',4);
 }else{
  circle(106,top+58,50,d.accent);check(106,top+58);lines(['That’s the idea.','Now use it.'],56,top+193,64,ink,700,75);lines(d.feedback,56,top+390,36,ink,400,48);
  rect(55,top+515,690,190,d.soft,32);text('LESSON COMPLETE',91,top+567,25);text('1 skill learned',91,top+640,57,ink,600);
  text('UP NEXT',56,top+790,25,'#75776e');text(d.next,56,top+855,37,ink,600);rect(55,top+910,690,97,ink,48);text('Keep learning   →',205,top+972,38,'#ffffff',600);
 }
 if(isPhone){
  for(const [i,kind] of ['home','list','bars'].entries()){const x=150+i*250;icon(kind,x,1467,.9,i===0?ink:'#777980');ctx.textAlign='center';text(['Today','My lessons','Progress'][i],x,1527,27,i===0?ink:'#777980');}ctx.textAlign='left';rect(278,1571,244,7,'#1c2227',4);
 }
}
