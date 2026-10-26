// Seekable paper-and-ink rendering for Fasight's conceptual planning ledger.
// Content is illustrative, with no personal data or legal-completion claim.
export const FASIGHT_SECTIONS=[
 {title:'Your details',subtitle:'Begin with the person behind the plan.',rows:['Personal information','Identity documents','Contact details'],footer:'A clear starting point'},
 {title:'What matters',subtitle:'Give your possessions a place in the plan.',rows:['Home & property','Savings & accounts','Personal keepsakes'],footer:'An inventory, thoughtfully gathered'},
 {title:'Who matters',subtitle:'Make the important connections clear.',rows:['Your next of kin','A trusted person','Their relationship to you'],footer:'People at the heart of the plan'},
 {title:'Your plan, together',subtitle:'One place to consider the whole picture.',rows:['Personal details gathered','Assets listed','Trusted people recorded'],footer:'Draft overview · ready for your review'},
];
export function fasightLedger(T){
 const canvas=typeof document==='undefined'?null:document.createElement('canvas');
 if(canvas){canvas.width=1536;canvas.height=1536;}
 const ctx=canvas?.getContext('2d');const map=canvas?new T.CanvasTexture(canvas):null;
 if(map){map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;}
 const material=new T.MeshStandardMaterial({color:map?0xffffff:0xeee2c9,map,roughness:.93,side:T.DoubleSide});
 let previous='';
 function update(section,progress){
  const frame=Math.round(Math.max(0,Math.min(1,progress))*54),key=`${section}:${frame}`;
  if(key===previous)return;previous=key;if(!ctx)return;
  const c=ctx,s=FASIGHT_SECTIONS[section];
  c.fillStyle='#ede5d2';c.fillRect(0,0,1536,1536);
  const text=(t,x,y,size,color='#263f36',font='Georgia')=>{c.font=`${size}px ${font}`;c.fillStyle=color;c.fillText(t,x,y);};
  // A gentle binding shadow makes two real pages, not a floating UI overlay.
  const binding=c.createLinearGradient(688,0,836,0);binding.addColorStop(0,'#00000000');binding.addColorStop(.5,'#675a3a30');binding.addColorStop(1,'#00000000');c.fillStyle=binding;c.fillRect(688,0,148,1536);
  text('F A S I G H T',84,117,29,'#8c754c','sans-serif');
  text('A little clarity.',84,255,68);text('For those',84,340,68);text('you love.',84,425,68);
  text('YOUR LEGACY, THOUGHTFULLY PLANNED',84,517,19,'#7b785e','sans-serif');
  c.strokeStyle='#b4a17e';c.lineWidth=2;c.beginPath();c.moveTo(84,584);c.lineTo(661,584);c.stroke();
  for(const [i,label] of ['Your details','Your assets','Trusted people','Review the plan'].entries()){
   const y=714+i*143,active=i===section;c.fillStyle=active?'#244f44':'#dcd2bc';c.beginPath();c.arc(112,y-12,29,0,Math.PI*2);c.fill();
   text(String(i+1).padStart(2,'0'),94,y-3,25,active?'#f5eedb':'#817a63','sans-serif');
   text(label,166,y,44,active?'#234c41':'#8a836e');
   if(i<section){text('✓',614,y,37,'#587766','sans-serif');}
  }
  text('A place for the important things.',84,1382,26,'#7b785e');
  text(`0${section+1}  /  PLANNING NOTES`,844,118,24,'#8c754c','sans-serif');
  text(s.title,844,256,section===3?47:66);
  // Split the subtitle deliberately to keep comfortable page margins.
  const subtitles=[['Begin with the person','behind the plan.'],['Give your possessions','a place in the plan.'],['Make the important','connections clear.'],['One place to consider','the whole picture.']];
  for(const [i,line] of subtitles[section].entries())text(line,846,335+i*43,30,'#7c806d');
  s.rows.forEach((label,i)=>{
   const y=558+i*235,fill=Math.max(0,Math.min(1,frame/54*3-i));
   text(label,894,y,39,'#4d5d4c','sans-serif');
   c.strokeStyle='#c1b697';c.lineWidth=2;c.strokeRect(845,y-24,27,27);
   // The nib follows this exact horizontal rule while it fills in.
   c.strokeStyle='#c8bda4';c.beginPath();c.moveTo(845,y+65);c.lineTo(1435,y+65);c.stroke();
   if(fill>0){c.strokeStyle='#315b4a';c.lineWidth=5;c.beginPath();c.moveTo(845,y+65);c.lineTo(845+590*fill,y+65);c.stroke();}
   if(fill>=1){text('✓',846,y+1,29,'#315b4a','sans-serif');}
  });
  c.fillStyle='#dcdac4';c.beginPath();c.roundRect(843,1265,610,150,12);c.fill();
  text(section===3?'DRAFT OVERVIEW':'PLANNING IN PROGRESS',871,1315,24,'#46604d','sans-serif');
  text(s.footer,871,1370,23,'#6d715a');
  text('Concept preview',1308,1474,19,'#8c8671','sans-serif');
  map.needsUpdate=true;
 }
 update(0,0);return {material,update};
}
