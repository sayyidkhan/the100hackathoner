// Illustrative microlearning content, not screenshots of the archived product.
export const lessons = {
  1: { title:['Listen before','you solve.'], category:'COMMUNICATION', time:'3 min', tip:['Pause before offering advice.', 'Ask one open question.', 'Summarise what you heard.'], question:['A teammate raises a concern.', 'What should you do first?'], answers:['Offer your solution straight away','Ask what has been difficult','Explain why it is not a problem'], feedback:['An open question creates space', 'to understand before you advise.'], next:'Ask better questions', color:'#184c45', accent:'#d5f590', soft:'#e5efdf' },
  2: { title:['Make feedback','actually useful.'], category:'TEAM SKILLS', time:'4 min', tip:['Describe what you observed.', 'Explain its specific impact.', 'Agree on one next action.'], question:['Which feedback is most useful?','Choose the specific observation.'], answers:['You need to be more professional','Your summary missed the deadline','You always get things wrong'], feedback:['A specific observation makes it', 'easier to agree on a next action.'], next:'Turn feedback into action', color:'#303f75', accent:'#cfe9a4', soft:'#e6eafa' },
};
export function paintScreen(ctx, edition, phase, mode='phone') {
  const d=lessons[edition], W=800,H=mode==='phone'?1440:1120;
  const rect=(x,y,w,h,c,r=24)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
  const text=(s,x,y,size=30,c='#1d302b',weight=400)=>{ctx.fillStyle=c;ctx.font=`${weight} ${size}px Arial`;ctx.fillText(s,x,y);};
  const lines=(ss,x,y,size=48,c='#1d302b',weight=600,gap=size*1.2)=>ss.forEach((s,i)=>text(s,x,y+i*gap,size,c,weight));
  const check=(x,y,c='#184c45')=>{ctx.strokeStyle=c;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-13,y);ctx.lineTo(x-3,y+10);ctx.lineTo(x+18,y-13);ctx.stroke();};
  ctx.fillStyle='#f8f9f1';ctx.fillRect(0,0,W,H);
  text(mode==='phone'?'xueyiyi':'LEARN A LITTLE. USE IT TODAY.',48,mode==='phone'?103:65,mode==='phone'?52:24,d.color,700);
  if(mode==='phone'){text('learn easy',50,144,22,'#6c7c70');text('9:41',55,35,20,d.color,600);rect(682,20,56,19,d.color,5);}
  const top=mode==='phone'?200:110;
  if(phase===0){
    text('YOUR DAILY MICROLESSON',48,top+10,23,'#758075',600);
    lines(['A small lesson.', 'A useful skill.'],48,top+83,58,d.color,700);
    rect(42,top+200,716,490,d.color,32);
    rect(78,top+235,255,44,d.accent,22);text(`${d.time.toUpperCase()}  /  1 SKILL`,100,top+265,22,d.color,700);
    // A graphic conversation motif belongs to the lesson, not a workplace model.
    rect(520,top+243,170,100,d.accent,26);rect(567,top+310,140,92,'#f4f5e6',24);
    text('···',555,top+306,65,d.color,700);text('?',615,top+375,47,d.color,700);
    text(d.category,78,top+410,22,'#c8dabf',600);lines(d.title,78,top+479,55,'#ffffff',600);
    rect(78,top+612,640,52,d.accent);text('Start this lesson     →',112,top+647,28,d.color,700);
    text('A LITTLE EVERY DAY',48,top+766,24,'#758075',600);
    for(let i=0;i<7;i++){rect(48+i*102,top+795,83,70,i<3?d.soft:'#edf0e8',18);text(['M','T','W','T','F','S','S'][i],76+i*102,top+838,25,i<3?d.color:'#949d91',600);}
    text('3 days of learning. Keep going.',48,top+925,29,d.color);
  } else if(phase===1){
    text('01  /  BITE-SIZED LESSON',48,top+10,24,'#758075',600);lines(d.title,48,top+95,60,d.color,700);
    rect(42,top+205,716,200,d.color,28);text('ONE IDEA TO TAKE AWAY',78,top+255,22,d.accent,700);
    lines(edition===1?['Understand first.', 'Solve second.']:['Be specific.', 'Make it actionable.'],78,top+317,45,'#ffffff',600);
    d.tip.forEach((s,i)=>{rect(48,top+451+i*117,64,64,d.soft,20);text(String(i+1),70,top+493+i*117,30,d.color,700);text(s,137,top+491+i*117,29,d.color,500);});
    rect(48,top+867,704,75,d.accent);text('Got it. Try a quick check  →',93,top+915,30,d.color,700);
  } else if(phase===2){
    text('02  /  QUICK KNOWLEDGE CHECK',48,top+10,24,'#758075',600);lines(['Put it into', 'practice.'],48,top+95,60,d.color,700);
    lines(d.question,48,top+256,30,d.color,500,44);
    d.answers.forEach((s,i)=>{rect(42,top+359+i*138,716,110,i===1?d.soft:'#edf0e8');ctx.strokeStyle=i===1?d.color:'#b4c0b1';ctx.lineWidth=3;ctx.beginPath();ctx.arc(89,top+414+i*138,18,0,Math.PI*2);ctx.stroke();if(i===1)check(89,top+414+i*138,d.color);text(s,127,top+423+i*138,28,d.color,500);});
    rect(48,top+856,704,78,d.color);text('Check my answer  →',224,top+905,30,'#ffffff',700);
  } else {
    text('03  /  FEEDBACK & PROGRESS',48,top+10,24,'#758075',600);
    rect(48,top+53,88,88,d.accent,44);check(92,top+97,d.color);
    lines(['That’s the idea.', 'Now use it.'],48,top+220,59,d.color,700);
    lines(d.feedback,48,top+365,30,d.color,400,44);
    rect(42,top+479,716,176,d.soft);text('LESSON COMPLETE',78,top+527,23,d.color,700);text('1 skill learned',78,top+589,49,d.color,700);text('+ 1 daily step',78,top+632,25,d.color);
    text('UP NEXT',48,top+733,24,'#758075',600);text(d.next,48,top+792,37,d.color,600);
    rect(48,top+857,704,78,d.color);text('Keep learning  →',249,top+906,30,'#ffffff',700);
  }
  if(mode==='phone'){
    rect(42,1260,716,4,'#dce3d6',2);['Today','My lessons','Progress'].forEach((s,i)=>text(s,80+i*245,1320,24,i===0?d.color:'#8a9486',i===0?700:400));rect(280,1397,240,8,d.color,4);
  }
}
