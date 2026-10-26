// A single phase-driven conceptual app display. It never requests camera data.
export function createPestScreen(T) {
  const canvas = typeof document === 'undefined' ? null : document.createElement('canvas');
  if (canvas) { canvas.width = 768; canvas.height = 1536; }
  const ctx = canvas?.getContext('2d');
  const texture = ctx ? new T.CanvasTexture(canvas) : null;
  if (texture) { texture.colorSpace = T.SRGBColorSpace; texture.anisotropy = 4; }
  const material = new T.MeshBasicMaterial({ color: texture ? 0xffffff : 0x17201e, map: texture, toneMapped: false });
  const mesh = new T.Mesh(new T.PlaneGeometry(1.58, 3.16), material);
  mesh.name = 'pestoverflow-app-screen';
  mesh.userData.noShadow = true;
  let currentPhase;
  const colors = { bg:'#151b19', panel:'#202925', ink:'#f4f1e8', muted:'#9eafa5', line:'#36443c', green:'#a4d5b3', coral:'#ee9278' };

  function rounded(x,y,w,h,r,fill,stroke) {
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
  }
  function text(value,x,y,size=28,color=colors.ink,weight=400) {
    ctx.fillStyle=color;ctx.font=`${weight} ${size}px -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
    ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(value,x,y);
  }
  function line(points,color,width=2) {
    ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
  }
  function polygon(points,fill) {
    ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  }
  function circle(x,y,r,color) {ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  function camera(phase) {
    ctx.save();ctx.beginPath();ctx.roundRect(44,314,680,460,24);ctx.clip();
    const light=ctx.createLinearGradient(44,314,724,774);light.addColorStop(0,'#d0bba0');light.addColorStop(1,'#6e5440');ctx.fillStyle=light;ctx.fillRect(44,314,680,460);
    // The same walnut kitchen vocabulary as the physical model: stone counter,
    // panelled cupboards, recessed toe-kick, tiled floor, and a small pest.
    polygon([[44,534],[724,534],[724,774],[44,774]],'#ac967c');
    for(let i=0;i<7;i++)line([[44+i*113,534],[44+(i-3)*194,774]],'#92806a',2);
    for(const y of [585,654,739])line([[44,y],[724,y]],'#c4b299',2);
    polygon([[81,402],[640,402],[691,455],[118,455]],'#d5c6ad');
    polygon([[118,455],[691,455],[691,640],[118,590]],'#60422f');
    polygon([[81,402],[118,455],[118,590],[81,550]],'#775439');
    polygon([[118,455],[691,455],[691,474],[118,472]],'#b9a88d');
    for(let i=0;i<4;i++){
      const x=130+i*136,y=482+i*3;
      polygon([[x,y],[x+120,y],[x+120,602+i*9],[x,593+i*9]],i%2?'#795239':'#835a3c');
      polygon([[x+9,y+10],[x+111,y+10],[x+111,590+i*9],[x+9,582+i*9]],'#704b34');
      line([[x+88,y+18],[x+106,y+18]],'#c7a775',5);
      for(let n=0;n<5;n++)line([[x+17+n*18,y+19],[x+17+n*18,574+i*9]],'#775138',1);
    }
    polygon([[118,590],[691,640],[691,657],[118,608]],'#322d26');
    // Neutral dish and utensil details establish scale without more text.
    ctx.fillStyle='#a79f86';ctx.beginPath();ctx.ellipse(273,425,65,13,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#e3dac6';ctx.lineWidth=6;ctx.stroke();
    rounded(543,368,51,59,10,'#a7ac96');line([[559,368],[551,340]],'#4a5945',7);line([[575,370],[586,343]],'#485640',7);
    // Small realistic silhouette: elongated coat, muzzle, tail and round ear.
    ctx.fillStyle='#655443';ctx.beginPath();ctx.ellipse(455,677,34,17,-.15,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(488,670,18,12,-.22,0,Math.PI*2);ctx.fill();
    polygon([[498,663],[516,671],[499,678]],'#78614c');
    circle(487,657,9,'#8c7865');circle(488,657,5,'#b19683');circle(501,667,2.6,'#171b19');
    line([[424,678],[404,682],[394,674],[382,674]],'#9b7b65',4);
    line([[440,691],[450,691]],'#765740',4);line([[478,684],[487,685]],'#765740',4);
    if(phase!=='monitoring'){
      const x=411,y=634,w=121,h=72,c=colors.coral;
      if(phase==='notified')rounded(x,y,w,h,5,null,c);
      for(const [sx,sy,dx,dy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]])line([[sx+dx*16,sy],[sx,sy],[sx,sy+dy*16]],c,3);
    }
    const shade=ctx.createLinearGradient(0,691,0,774);shade.addColorStop(0,'#14201d00');shade.addColorStop(1,'#14201de8');ctx.fillStyle=shade;ctx.fillRect(44,691,680,83);
    circle(75,744,5,colors.green);text('Camera 01',91,753,24,'#f5f0e4',500);
    ctx.restore();
    rounded(44,314,680,460,24,null,phase==='notified'?'#b46c58':colors.line);
  }
  function update(phase='monitoring') {
    if(!['monitoring','detected','sending','notified'].includes(phase))phase='monitoring';
    if(currentPhase===phase)return;
    currentPhase=phase;mesh.userData.phase=phase;
    const screenOn=phase!=='monitoring';
    mesh.userData.screenOn=screenOn;
    material.color.setHex(texture?0xffffff:screenOn?0x17201e:0x050708);
    if(!ctx)return;
    if(!screenOn){
      // Sleeping phone: no status bar, camera preview, labels or home indicator.
      ctx.fillStyle='#050708';ctx.fillRect(0,0,768,1536);
      texture.needsUpdate=true;
      return;
    }
    const notified=phase==='notified';
    ctx.fillStyle=colors.bg;ctx.fillRect(0,0,768,1536);
    text('9:41',49,49,25,colors.ink,600);
    rounded(666,28,42,19,5,null,colors.ink);rounded(670,32,31,11,2,colors.ink);rounded(710,34,4,7,2,colors.ink);
    text('PestOverflow',44,135,48,colors.ink,650);
    text('Orchard residence',45,180,28,colors.muted);
    // An event-first hierarchy stays legible when the phone is a small part
    // of the exhibit: alert, camera evidence, then delivery receipt.
    rounded(44,218,680,236,24,'#ed8c70');
    text('PEST DETECTED',75,305,64,'#251d17',750);
    text('Kitchen',75,384,60,'#3f3024',600);
    ctx.save();ctx.translate(0,199);ctx.scale(1,.90);camera(phase);ctx.restore();
    text('Camera 01',44,967,43,colors.ink,600);
    if(notified)text('Just now',547,967,35,colors.coral,500);
    rounded(44,1023,680,303,24,notified?'#2b4033':colors.panel);
    if(notified){
      circle(92,1091,25,colors.green);
      line([[80,1090],[89,1100],[106,1080]],'#223a29',5);
      text('Owner notified',76,1180,63,colors.ink,650);
      text('Location attached',76,1240,39,colors.green,500);
    } else {
      circle(91,1091,12,colors.coral);
      text(phase==='sending'?'Sending alert':'Pest detected',76,1177,55,colors.ink,600);
      text(phase==='sending'?'Location attached':'Preparing alert',76,1241,43,colors.muted,500);
    }
    text('Orchard residence',44,1427,33,colors.muted);
    rounded(276,1501,216,6,3,'#c5cec6');
    texture.needsUpdate=true;
  }
  update('monitoring');
  return {mesh,update,dispose(){texture?.dispose();material.dispose();mesh.geometry.dispose();}};
}
