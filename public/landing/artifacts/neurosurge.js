import { earlyStudio } from './early-exhibit-studio.js';
import { mnemonicSurfaces } from './neurosurge-surfaces.js';

// The original grocery-learning / recall loop, interpreted as a memory journal.
// The boat, planets and tree are new exhibit mnemonics, not original app screens.
export const CYCLE_SECONDS = 28;
const ease = v => { const x=Math.max(0,Math.min(1,v)); return x*x*(3-2*x); };
export function memoryMoment(time) {
 const t=((time%CYCLE_SECONDS)+CYCLE_SECONDS)%CYCLE_SECONDS;
 const conceal=ease((t-12)/1.2)*(1-ease((t-26.5)/1.5));
 return {t, phase:t<6?0:t<12?1:t<19?2:3, turn:Math.PI*conceal, conceal,
  learned:[0,1,2].map(i=>ease((t-i*1.7)/.65)),
  recalled:[0,1,2].map(i=>ease((t-19-i*1.4)/.65)*(1-ease((t-26)/.5))),
  feedbackVisible:t>=19&&t<26.5};
}
export function createArtifact(T) {
 const k=earlyStudio(T),{root,m,mesh,group,rounded,slab,ball,disk,line,ellipsoid,ring,batch,texture}=k;
 const colors={walnut:0x604332,paper:0xfff3dc,coral:0xc87564,peach:0xf0c4a7,lilac:0xc4b4d6,sage:0xbdc8a0,
  plum:0x4c3456,ink:0x352c3c,leaf:0x477144,lightLeaf:0x83a855,flesh:0xd5dc7a,pit:0x86502f,berry:0x34416a,wave:0x6bafba};
 for(const [name,color] of Object.entries(colors))m[name]=new T.MeshStandardMaterial({color,roughness:name==='berry'?.42:.72,bumpMap:texture(name==='walnut'?'wood':'paper'),bumpScale:name==='walnut'?.012:.003});
 m.walnut.map=mnemonicSurfaces(T).walnut;m.walnut.color.setHex(0xffffff);
 // Crisp, unlit typography stays legible while the physical surfaces catch light.
 function label(value,w,h,x,y,z,parent=root,color='#352c3c') {
  const g=group(x,y,z,parent);
  if(typeof document==='undefined')return g;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font=`500 ${Math.min(c.height*.78,980/Math.max(1,value.length*.58))}px Georgia`;
  ctx.fillText(value,512,c.height/2,980);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
  const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));o.userData.noShadow=true;g.add(o);return g;
 }
 const curve=(points,r,color,p)=>line(points,r,color,p);
 function avocado(p,s=1){
  const g=group(0,0,0,p);g.scale.setScalar(s);
  // Pear silhouette, with the wider base towards the pit.
  const shape=new T.Shape();shape.moveTo(0,.49);shape.bezierCurveTo(.21,.49,.19,.14,.28,-.04);shape.bezierCurveTo(.46,-.46,-.46,-.46,-.28,-.04);shape.bezierCurveTo(-.19,.14,-.21,.49,0,.49);
  const geo=new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:4,bevelSize:.055,bevelThickness:.055,curveSegments:24});
  mesh(geo,'leaf',g);const inner=mesh(geo.clone(),'flesh',g);inner.scale.set(.9,.91,.35);inner.position.z=.155;
  ellipsoid(0,-.09,.23,.17,.18,.105,'pit',g);return g;
 }
 function blueberry(p,x,y,z,r=.1){
  const g=group(x,y,z,p);ball(r,0,0,0,'berry',g);
  const crown=ring(r*.28,r*.055,0,0,r*.96,'ink',g);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipsoid(Math.cos(a)*r*.22,Math.sin(a)*r*.22,r*.97,r*.13,r*.055,r*.025,'lilac',g).rotation.z=a;}
  return g;
 }
 function broccoli(p,s=1){
  const g=group(0,0,0,p);g.scale.setScalar(s);
  curve([[0,-.38,0],[.02,-.08,0],[0,.28,0]],.07,'lightLeaf',g);
  for(let j=0;j<7;j++){
   const a=j*2.4,x=Math.sin(a)*.23,y=.2+(j%3)*.08,z=Math.cos(a)*.16;
   curve([[0,-.07,0],[x*.65,.14,z*.6],[x,y,z]],.034,'lightLeaf',g);
   ball(.15,x,y,z,'leaf',g);
   for(let n=0;n<16;n++){const u=n*2.4,v=Math.acos(1-2*(n+.5)/16);ball(.024,x+.14*Math.sin(v)*Math.cos(u),y+.14*Math.cos(v),z+.14*Math.sin(v)*Math.sin(u),n%7?'leaf':'lightLeaf',g);}
  }
  return g;
 }
 // A quiet desk surface, not a display podium.
 slab(8.8,4.1,.2,0,.1,0,'walnut',root,.45);
 slab(8.74,4.04,.09,0,.245,0,'paper',root,.43);
 rounded(1.7,.24,.035,0,.14,2.065,'brass');label('NeuroSurge',1.48,.21,0,.14,2.101);
 for(const x of [-.75,.75])ball(.018,x,.14,2.092,'walnut');
 // Open journal with genuinely curved paper surfaces and layered page edges.
 slab(4.95,3.15,.09,0,.36,.35,'coral',root,.12);
 function page(side,y,color){
  const geo=new T.PlaneGeometry(2.38,2.94,32,2),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const u=(pos.getX(i)+1.19)/2.38;pos.setXYZ(i,side*(.025+u*2.38),y+.22*Math.sin(u*Math.PI)*Math.exp(-u*.5),.35+pos.getY(i));}
  geo.computeVertexNormals();const material=m[color];material.side=T.DoubleSide;return mesh(geo,color);
 }
 for(let n=0;n<9;n++){for(const side of [-1,1])page(side,.405+n*.016,n===8?'paper':'cream');}
 curve([[0,.425,-1.1],[0,.44,.35],[0,.425,1.82]],.018,'brass');
 // Grocery list and a ceramic tray establish what is being remembered.
 const clip=group(-3.35,1.65,-.57);clip.rotation.y=.10;
 rounded(1.46,2.3,.13,0,0,0,'walnut',clip,.09);
 rounded(1.32,2.13,.035,0,0,.09,'paper',clip,.06);
 rounded(.43,.15,.07,0,1.02,.13,'brass',clip);
 ring(.075,.02,0,1.13,.1,'brass',clip);
 label('Grocery list',1.16,.22,0,.72,.12,clip);
 const listAnswers=group(0,0,0,clip);listAnswers.name='grocery-answers';
 for(let i=0;i<3;i++){
  const y=.28-i*.4;rounded(.11,.11,.008,-.48,y,.12,'sage',listAnswers,.015);
  label(['Avocado','Blueberries','Broccoli'][i],.92,.19,.1,y,.13,listAnswers);
 }
 const hiddenList=group(0,0,0,clip);label('Remember',1.05,.21,0,.16,.13,hiddenList);label('your list?',1.05,.21,0,-.13,.13,hiddenList);
 slab(1.65,1.15,.10,-3.24,.38,1.03,'cream',root,.52);
 const trayRim=ring(.65,.045,-3.24,.46,1.03,'cream');trayRim.rotation.x=-Math.PI/2;trayRim.scale.set(1.21,.78,1);
 const groceries=group(-3.24,.52,1.03);groceries.name='grocery-produce';const av=avocado(groceries,.62);av.position.set(-.34,.1,.03);av.rotation.x=-.7;av.rotation.z=.25;
 const broc=broccoli(groceries,.60);broc.position.set(.36,.25,-.16);
 for(let i=0;i<10;i++)blueberry(groceries,-.02+Math.sin(i*2.4)*.21,.07+(i%2)*.1,.15+Math.cos(i*2.4)*.18,.085);
 // Three association cards. Each sculpture and its text turn as a single object.
 const cards=[],boats=[],orbits=[],trees=[];
 const names=['AVOCADO','BLUEBERRIES','BROCCOLI'],cues=['a little boat','little planets','a leafy tree'],palette=['peach','lilac','sage'];
 for(let i=0;i<3;i++){
  const x=(i-1)*1.52,cy=i===1?2.04:1.94, yaw=(i-1)*-.10;
  rounded(.45,.13,.3,x,.70,-.55,'brass');
  const card=group(x,cy,-.55);card.userData.restY=cy;card.userData.yaw=yaw;cards.push(card);card.name=`mnemonic-card-${i}`;
  rounded(1.42,2.45,.11,0,0,0,'paper',card,.12);
  rounded(1.36,2.39,.025,0,0,.07,palette[i],card,.10);
  label(names[i],1.22,.21,0,.96,.10,card);label(cues[i],1.16,.20,0,-1.01,.10,card);
  const reverse=group(0,0,-.069,card);reverse.rotation.y=Math.PI;
  rounded(1.34,2.36,.018,0,0,0,'plum',reverse,.10);
  label('NEUROSURGE',1.12,.17,0,.93,.034,reverse,'#e9dded');label('?',.7,.87,0,.10,.034,reverse,'#f5e6c6');
  label(`REMEMBER 0${i+1}`,1.1,.17,0,-.91,.034,reverse,'#e9dded');
  const art=group(0,.08,.48,card);art.name=`association-sculpture-${i}`;
  if(i===0){
   const boat=group(0,-.14,.13,art);boats.push(boat);
   const hull=avocado(boat,.90);hull.rotation.x=-.55;hull.rotation.z=-1.15;
   curve([[.02,-.05,.22],[.02,.72,.22]],.015,'brass',boat);
   const sailShape=new T.Shape();sailShape.moveTo(-.02,.65);sailShape.quadraticCurveTo(-.18,.35,-.40,.04);sailShape.lineTo(-.02,.09);sailShape.closePath();
   const sail=mesh(new T.ExtrudeGeometry(sailShape,{depth:.018,bevelEnabled:true,bevelSize:.007,bevelThickness:.007,bevelSegments:2}),'paper',boat);sail.position.z=.23;
   for(let w=0;w<3;w++)curve(Array.from({length:17},(_,j)=>{const x=-.51+j*.064;return[x,-.37-w*.09+Math.sin(j*.65)*.03,.20+w*.025];}),.018,'wave',art);
  }else if(i===1){
   const orbit=group(0,0,.08,art);orbits.push(orbit);const orbitRing=ring(.52,.009,0,0,.06,'brass',orbit);orbitRing.scale.y=1.28;orbitRing.rotation.z=-.5;
   for(let j=0;j<5;j++){const a=j*Math.PI*2/5;blueberry(orbit,Math.cos(a)*.44,Math.sin(a)*.56,.12,.13+(j%2)*.025);}
   for(const [x,y] of [[-.47,.61],[.46,-.56],[.13,.03]]){curve([[x-.035,y,.07],[x+.035,y,.07]],.007,'brass',art);curve([[x,y-.055,.07],[x,y+.055,.07]],.007,'brass',art);}
  }else{
   const tree=broccoli(art,1.3);tree.position.y=.02;trees.push(tree);ellipsoid(0,-.51,.08,.48,.10,.25,'sage',art);
   for(const x of [-.34,.29]){const leaf=ellipsoid(x,-.38,.16,.055,.18,.028,'leaf',art);leaf.rotation.z=x>0?-.5:.5;}
   for(let n=0;n<5;n++)ellipsoid(-.35+n*.16,-.47,.24,.055,.04,.04,'cream',art);
  }
 }
 // Recall tablet: the answers are separate groups, not a baked screenshot.
 const tablet=group(3.37,1.84,-.2);tablet.rotation.y=-.12;tablet.rotation.x=-.09;
 rounded(1.72,2.87,.19,0,0,0,'plum',tablet,.16);
 rounded(1.59,2.73,.025,0,0,.11,'ink',tablet,.13);
 rounded(1.46,2.52,.025,0,.02,.14,'paper',tablet,.10);
 ball(.019,0,1.33,.111,'silver',tablet);
 label('RECALL',1.19,.26,0,1,.181,tablet);
 label('What was on your list?',1.24,.15,0,.72,.181,tablet);
 const answers=[],prompts=[];
 for(let i=0;i<3;i++){
  const y=.34-i*.58;rounded(1.23,.46,.035,0,y,.18,'cream',tablet,.065);
  const prompt=group(0,y,.21,tablet);label(`0${i+1}  __________`,1.08,.16,0,0,0,prompt,'#897a8d');prompts.push(prompt);
  const row=group(0,y,.21,tablet);answers.push(row);row.name=`recall-answer-${i}`;label(['Avocado','Blueberries','Broccoli'][i],.83,.18,-.13,0,.014,row);
  const check=disk(.09,.018,.48,0,.02,'green',row);check.rotation.x=Math.PI/2;
  curve([[.44,0,.04],[.47,-.035,.04],[.53,.04,.04]],.01,'paper',row);
 }
 label('LEARN  /  HIDE  /  REMEMBER',1.22,.11,0,-1.14,.181,tablet);
 const stand=group(3.37,.34,-.48);slab(1.42,.8,.10,0,0,0,'walnut',stand,.12);
 curve([[0,0,-.2],[0,1.2,-.55],[0,1.4,-.30]],.055,'plum',stand);
 // Physical sequence markers and a slender pencil across the page.
 const lights=[];
 for(let i=0;i<3;i++){
  const chip=group((i-1)*1.20,.74,1.32);slab(1.04,.36,.055,0,0,0,palette[i],chip,.17);
  const txt=label(['LEARN','ASSOCIATE','RECALL'][i],.87,.14,0,.045,0,chip);txt.rotation.x=-Math.PI/2;
  const dot=group(-.42,.05,0,chip);ball(.023,0,0,0,'brass',dot);lights.push(dot);
 }
 const pencil=group(1.53,.79,.91);pencil.rotation.y=.22;
 const shaft=mesh(new T.CylinderGeometry(.027,.027,1.35,6),'walnut',pencil);shaft.rotation.z=Math.PI/2;
 const nib=mesh(new T.ConeGeometry(.027,.14,6),'shade',pencil);nib.rotation.z=Math.PI/2;nib.position.x=-.745;
 const tip=mesh(new T.ConeGeometry(.01,.045,6),'ink',pencil);tip.rotation.z=Math.PI/2;tip.position.x=-.83;
 const ferrule=disk(.03,.08,.69,0,0,'brass',pencil);ferrule.rotation.z=Math.PI/2;
 // Keep nested semantic groups intact while merging their static surfaces.
 batch(root);
 let selected=null;
 const descriptions=[
  ['Learn a small list','Start with three groceries: avocado, blueberries and broccoli. The original prototype taught grocery lists before testing recall.'],
  ['Make each item memorable','Imagine an avocado boat, blueberry planets and a broccoli tree. These new visual cues illustrate the project’s mnemonic idea.'],
  ['Hide the cues. Try to remember.','The cards turn away and the grocery cues disappear. Recall the three items before checking the answers.'],
  ['Recall, then check','The answers return one at a time. This is an illustrative learning loop; the original app checked typed answers.']
 ];
 function animate(time){
  const s=memoryMoment(selected===null?time:[3,8,16,23][selected]);
  root.userData.memoryState=s;
  cards.forEach((c,i)=>{c.rotation.y=c.userData.yaw+s.turn;const lift=s.phase===0?.045*Math.sin(Math.PI*s.learned[i]):s.phase===1?.022*Math.sin(s.t*1.5+i):0;c.position.y=c.userData.restY+lift;});
  boats[0].rotation.z=s.phase===1?.05*Math.sin(s.t*2):0;
  orbits[0].rotation.z=s.phase===1?.08*Math.sin(s.t*.9):0;
  trees[0].rotation.z=s.phase===1?.025*Math.sin(s.t*1.5):0;
  listAnswers.visible=s.conceal<.5;hiddenList.visible=!listAnswers.visible;groceries.visible=s.conceal<.5;
  answers.forEach((g,i)=>{g.visible=s.recalled[i]>.001;g.scale.setScalar(Math.max(.001,s.recalled[i]));prompts[i].visible=!g.visible;});
  lights.forEach((g,i)=>g.scale.setScalar((s.phase===0&&i===0)||(s.phase===1&&i===1)||(s.phase>=2&&i===2)?1.8:1));
  const [title,detail]=descriptions[s.phase];root.userData.story={index:s.phase,step:`${s.phase+1} / 4`,title,detail};
 }
 root.userData={conceptual:true,artifactId:25,displayBase:false,studioProfile:'neurosurge',groundLevel:0,contactFootprint:false,initialYaw:-.035,initialElevation:.46,framingTargetY:1.55,autoOrbit:false,realTimeAnimation:true,
  framingPoints:[[-4.45,0,-2.1],[4.45,0,-2.1],[-4.45,.3,2.1],[4.45,.3,2.1],[-4.05,2.95,-.5],[-2.26,3.4,-.65],[2.26,3.4,-.65],[4.22,3.4,-.2]].map(p=>new T.Vector3(...p)),
  framingBounds:new T.Box3(new T.Vector3(-4.5,0,-2.15),new T.Vector3(4.5,3.55,2.15)),
  setStep(index,time=0){if(index!==null&&(!Number.isInteger(index)||index<0||index>3))return;selected=index;animate(time);},animate};
 animate(0);return root;
}
