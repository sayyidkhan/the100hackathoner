// Local, authored typography and deterministic paper/wood textures for Checker.
// Document copy is an exhibit example; the revised wording follows the 2018 demo.
export function checkerSurfaces(T) {
  const make=(w,h,draw)=>{
    if(typeof document==='undefined')return null;
    const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');draw(ctx,w,h);
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;return map;
  };
  let seed=1809;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  function paper(ctx,w,h){
    ctx.fillStyle='#eee4cf';ctx.fillRect(0,0,w,h);
    for(let i=0;i<24000;i++){ctx.fillStyle=random()>.5?'rgba(107,81,46,.038)':'rgba(255,252,235,.13)';ctx.fillRect(random()*w,random()*h,random()*3+.5,random()*2+.5);}
    const gradient=ctx.createLinearGradient(0,0,w,0);gradient.addColorStop(0,'rgba(70,44,20,.08)');gradient.addColorStop(.12,'rgba(255,255,255,0)');gradient.addColorStop(1,'rgba(70,44,20,.025)');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  }
  const text=(ctx,value,x,y,size=42,color='#354642',family='Arial')=>{ctx.fillStyle=color;ctx.font=`${size}px ${family}`;ctx.fillText(value,x,y);};
  const rule=(ctx,y)=>{ctx.fillStyle='#b2a483';ctx.fillRect(110,y,980,2);};
  const draft=make(1200,1600,ctx=>{
    paper(ctx,1200,1600);
    text(ctx,'CHECKER  /  ORIGINAL DRAFT',110,160,30,'#6f765e');
    text(ctx,'Administrative',105,330,99,'#253c38','Georgia');text(ctx,'assistant',105,440,99,'#253c38','Georgia');
    rule(ctx,510);text(ctx,'REQUIREMENTS',110,595,31,'#7d7156');
    text(ctx,'female candidates',110,725,58);
    text(ctx,'Pleasant personality',110,940,58);
    text(ctx,'1 year relevant experience',110,1135,43);
    text(ctx,'Microsoft Word & Excel',110,1230,43);
    rule(ctx,1370);text(ctx,'A sample job ad for wording review',110,1450,31,'#7d7156');
  });
  const revised=make(1100,1450,ctx=>{
    paper(ctx,1100,1450);text(ctx,'CHECKER  /  SAMPLE REWRITE',95,145,29,'#6f765e');
    text(ctx,'A clearer',90,290,100,'#253c38','Georgia');text(ctx,'brief.',90,400,100,'#253c38','Georgia');
    ctx.fillStyle='#c9baa0';ctx.fillRect(95,465,910,2);
    text(ctx,'DUTIES & RESPONSIBILITIES',95,550,29,'#7d7156');
    text(ctx,'Supports the team in daily',95,650,43);text(ctx,'administrative tasks:',95,711,43);
    text(ctx,'data entry, documentation.',95,785,43);
    text(ctx,'REQUIREMENTS',95,935,29,'#7d7156');
    text(ctx,'Team player with a keen',95,1030,43);text(ctx,'eye for details.',95,1095,43);
    ctx.fillStyle='#c9baa0';ctx.fillRect(95,1210,910,2);
    text(ctx,'Illustrative result from the 2018 demo',95,1300,28,'#7d7156');
  });
  const note=(title,term,color,sub)=>make(1000,520,ctx=>{
    paper(ctx,1000,520);ctx.fillStyle=color;ctx.fillRect(0,0,18,520);
    text(ctx,title,64,140,71,color,'Georgia');text(ctx,term,64,270,48,'#263b35');text(ctx,sub,64,390,30,'#75674e');
  });
  return {
    draft,revised,
    omit:note('OMIT','female','#ab483b','Remove the gender restriction'),
    improve:note('IMPROVE','Pleasant personality','#936d1b','Make the requirement specific'),
    paper:make(512,512,(ctx,w,h)=>paper(ctx,w,h)),
    wood:make(512,512,(ctx,w,h)=>{
      ctx.fillStyle='#66503a';ctx.fillRect(0,0,w,h);
      for(let i=0;i<650;i++){const y=random()*h;ctx.strokeStyle=`rgba(${random()>.5?'30,18,9':'206,155,95'},${random()*.12})`;ctx.lineWidth=random()*2+.3;ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=w;x+=16)ctx.lineTo(x,y+Math.sin(x*.014+i*.01)*4);ctx.stroke();}
    }),
  };
}
