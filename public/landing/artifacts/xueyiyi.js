import { medivoiceStudio } from './medivoice-studio.js';
import { paintScreen, lessons, screenSizes } from './xueyiyi-screen.js';

export function createXueyiyi(T,edition){
 const {root,materials:m,mesh,box,disk,ball,finish}=medivoiceStudio(T),preserved=[];
 const d=lessons[edition];
 const mat=(color,roughness=.5,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 Object.assign(m,{ink:mat(d.color,.28),silver:new T.MeshPhysicalMaterial({color:0xdce0dd,roughness:.16,metalness:.95,clearcoat:1}),cream:mat(0xfaf5e9,.42),lime:mat(d.accent,.32),edge:mat(0xe9e2d5,.4),glass:new T.MeshPhysicalMaterial({color:0x080b0c,roughness:.14,metalness:.28,clearcoat:1}),lens:mat(0x142f51,.16,.6),inactive:mat(0xbcbeb3,.42),progress:mat(0x454b4e,.24,.25)});
 const group=(x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);root.add(g);return g;};
 function shape(w,h,r){r=Math.min(r,w/2-.001,h/2-.001);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
 function round(w,h,depth,x,y,z,color,parent=root,r=.12){const o=mesh(new T.ExtrudeGeometry(shape(w,h,r),{depth,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:4,curveSegments:16}),color,parent);o.position.set(x,y,z);return o;}
 function map(phase,mode='phone',options){if(typeof document==='undefined')return null;const c=document.createElement('canvas');[c.width,c.height]=screenSizes[mode];paintScreen(c.getContext('2d'),edition,phase,mode,options);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}
 function panel(w,h,z,parent,texture,r=.12){
  const geo=new T.ShapeGeometry(shape(w,h,r),24),p=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/w+.5,p.getY(i)/h+.5);
  const o=new T.Mesh(geo,new T.MeshBasicMaterial({map:texture,color:texture?0xffffff:0xfbf7ef,toneMapped:false}));o.position.z=z;parent.add(o);return o;
 }
 function plaque(){let t=null;if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1000;c.height=120;const ctx=c.getContext('2d');ctx.font='500 58px Arial';ctx.fillStyle=d.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('X U E Y I Y I',500,60);t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;}const g=group(0,.335,1.01);const face=panel(2.3,.18,0,g,t,.01);face.material.transparent=true;face.material.alphaTest=.01;preserved.push(g);}
 const stage=round(7.9,1.90,.11,0,.12,0,'ink',root,.64);stage.rotation.x=-Math.PI/2;
 const inlay=round(7.88,1.88,.022,0,.241,0,edition===2?'lime':'silver',root,.63);inlay.rotation.x=-Math.PI/2;
 const cap=round(7.85,1.85,.13,0,.273,0,'cream',root,.62);cap.rotation.x=-Math.PI/2;plaque();
 const phone=group(0,2.67,.04);phone.name='microlearning-phone';
 round(2.36,4.65,.14,0,0,0,'silver',phone,.30);
 round(2.30,4.59,.13,0,0,.025,'glass',phone,.28);
 round(2.23,4.50,.045,0,0,.145,'silver',phone,.25);
 round(2.19,4.45,.035,0,0,.185,'glass',phone,.24);
 const frames=[0,1,2,3].map(p=>map(p)),screenMap=frames[0],images=frames.map(t=>t?.image);frames.slice(1).forEach(t=>t?.dispose());
 const screen=panel(2.14,4.34,.235,phone,screenMap,.22);screen.name='microlearning-display';
 const quizBlank=map(2,'phone',{selected:false}),quizBlankImage=quizBlank?.image;quizBlank?.dispose();
 const nextMap=map(1),nextScreen=panel(2.14,4.34,.237,phone,nextMap,.22);
 nextScreen.name='screen-transition';nextScreen.material.transparent=true;nextScreen.material.depthWrite=false;
 const tap=new T.Mesh(new T.TorusGeometry(.095,.009,8,64),new T.MeshBasicMaterial({color:d.color,transparent:true,depthWrite:false,toneMapped:false}));
 tap.name='learning-tap';tap.position.z=.251;phone.add(tap);
 round(.66,.17,.018,0,1.98,.255,'glass',phone,.083);ball(.031,.235,1.98,.29,'lens',phone);ball(.010,.243,1.987,.317,'silver',phone);
 box(.032,.42,.08,-1.20,.74,.07,'silver',phone);box(.032,.25,.08,-1.20,.20,.07,'silver',phone);box(.032,.57,.08,1.20,.45,.07,'silver',phone);
 for(const side of [-1,1])for(let i=0;i<5;i++)round(.017,.017,.008,side*(.31+i*.055),-2.324,.075,'glass',phone,.008);
 round(.22,.022,.008,0,-2.324,.075,'glass',phone,.01);
 const bubbles=new T.Group();phone.add(bubbles);bubbles.name='lesson-conversation';
 function bubble(w,h,x,y,z,color,angle){
  const g=new T.Group();g.position.set(x,y,z);g.rotation.z=angle;bubbles.add(g);
  round(w,h,.042,0,0,0,color,g,.15);
  const tail=new T.Shape();tail.moveTo(-w*.25,-h*.38);tail.lineTo(-w*.18,-h*.75);tail.quadraticCurveTo(-w*.14,-h*.79,w*.06,-h*.35);tail.closePath();mesh(new T.ExtrudeGeometry(tail,{depth:.041,bevelEnabled:true,bevelSize:.013,bevelThickness:.012,bevelSegments:3}),color,g);return g;
 }
 const rear=bubble(.52,.40,.59,.31,.29,'lime',-.14);
 const bubbleHomes=[rear.position.clone()];
 const front=bubble(.64,.46,.28,.48,.36,'cream',.12);
 bubbleHomes.push(front.position.clone());const typing=[];
 for(let i=0;i<3;i++){const dot=disk(.029,.012,-.15+i*.15,0,.060,'ink',front);dot.rotation.x=Math.PI/2;typing.push(dot);}
 preserved.push(phone);
 const cards=[];
 for(const [phase,x,y,z,angle] of [[1,-2.49,3.02,-.04,.035],[2,2.49,2.95,-.02,-.035]]){
  const g=group(x,y,z);g.name=phase===1?'lesson-card':'quiz-card';g.rotation.y=angle;
  round(2.20,3.37,.035,0,0,0,'edge',g,.19);
  const face=panel(2.175,3.345,.051,g,map(phase,'card'),.18);
  preserved.push(g);cards.push({g,face,phase,home:null,texture:face.material.map});
 }
 // Match the distinct tile arrangements visible in each approved artwork.
 const tiles=[];
 for(let i=0;i<3;i++){
  const g=edition===1?group(-3.22+i*.73,.83,.14):group(-2.49,1.17-i*.34,.11);
  const w=edition===1?.67:2.20,h=edition===1?.78:.285;
  round(w,h,.035,0,0,0,'edge',g,.10);panel(w-.025,h-.025,.052,g,map(i,edition===1?'tile':'chip'),.09);preserved.push(g);tiles.push(g);
 }
 const progress=group(2.49,.73,.18);round(2.17,.40,.07,0,0,0,'progress',progress,.19);
 const dots=[];for(let i=0;i<4;i++){const dot=disk(.065,.012,-.64+i*.43,0,.09,'inactive',progress);dot.rotation.x=Math.PI/2;dot.name=`lesson-progress-${i}`;dots.push(dot);}preserved.push(progress);
 const feedback=map(3,'card'),feedbackImage=feedback?.image;feedback?.dispose();const quizImage=cards[1].texture?.image;
 const cardBlank=map(2,'card',{selected:false}),cardBlankImage=cardBlank?.image;cardBlank?.dispose();
 const cardNextMap=map(3,'card'),cardTransition=panel(2.175,3.345,.053,cards[1].g,cardNextMap,.18);
 cardTransition.material.transparent=true;cardTransition.material.depthWrite=false;
 const progressRing=new T.Mesh(new T.TorusGeometry(.09,.012,8,64),new T.MeshBasicMaterial({color:d.accent,transparent:true,depthWrite:false,toneMapped:false}));
 progressRing.name='progress-pulse';progressRing.position.z=.11;progress.add(progressRing);
 finish(edition,preserved);cards.forEach(c=>c.home=c.g.position.clone());const tileHomes=tiles.map(g=>g.position.clone());
 // The inactive dot material can otherwise be the only retained material here.
 const completedMaterial=m.lime;
 const titles=['A few minutes. One skill.','Learn one useful idea','Try one quick question','Get feedback. See progress.'];
 const details=[`A ${d.time} microlesson fits into the day. Pick a skill and start.`, 'A short explanation and three practical takeaways keep the lesson focused.', 'Apply the idea to a realistic situation. The example selects the second answer.', 'Explain why the answer works, mark the lesson complete and suggest the next lesson.'];
 let manual=null,offset=0,last=0,previous='',previousNext=-1;
 const ease=v=>{v=T.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
 Object.assign(root.userData,{displayBase:false,studioProfile:'xueyiyi',initialYaw:-.035,initialElevation:.065,autoOrbit:false,realTimeAnimation:true,cycleDuration:24,learningStages:['discover','lesson','quiz','feedback'],
  setStep(index,elapsed=last){if(index===null){if(manual!==null)offset=manual-elapsed;manual=null;}else if(Number.isInteger(index)&&index>=0&&index<4)manual=index*6+3;},
  animate(time){last=time;const t=((manual??time+offset)%24+24)%24,phase=Math.floor(t/6),local=t%6;
   root.userData.story={index:phase,step:`0${phase+1} / 04`,title:titles[phase],detail:details[phase],tone:phase===3?'success':'neutral'};
   const frame=xueyiyiMotion(t),key=`${phase}-${frame.answerSelected}`;
   root.userData.motion=frame;
   if(key!==previous){
    if(screenMap){screenMap.image=phase===2&&!frame.answerSelected?quizBlankImage:images[phase];screenMap.needsUpdate=true;}
    const quizTexture=cards[1].texture;
    if(quizTexture){quizTexture.image=phase===3?feedbackImage:frame.answerSelected?quizImage:cardBlankImage;quizTexture.needsUpdate=true;}
    previous=key;
   }
   const next=(phase+1)%4;
   if(previousNext!==next){
    if(nextMap){nextMap.image=next===2?quizBlankImage:images[next];nextMap.needsUpdate=true;}
    if(cardNextMap){cardNextMap.image=next===3?feedbackImage:cardBlankImage;cardNextMap.needsUpdate=true;}
    previousNext=next;
   }
   nextScreen.material.opacity=frame.transition;nextScreen.visible=frame.transition>0;
   cardTransition.material.opacity=frame.transition;cardTransition.visible=frame.transition>0&&(phase===2||phase===3);
   bubbles.visible=phase===0;
   const intro=ease(local/.65),out=1-frame.transition;
   bubbles.scale.setScalar(phase===0?(.85+.15*intro)*out:1);
   [rear,front].forEach((g,i)=>{g.position.copy(bubbleHomes[i]);if(phase===0){g.position.y+=Math.sin(local*2.4-i*.8)*.035*out;g.position.z+=.045*Math.sin(local*1.6-i)*out;}});
   typing.forEach((o,i)=>o.scale.setScalar(phase===0?1+.3*Math.max(0,Math.sin(local*5-i*1.2)):1));
   cards.forEach(c=>{const active=phase===c.phase||(phase===3&&c.phase===2),amount=active?ease(local/.8)*(1-ease((local-5)/1)):0;c.g.position.copy(c.home);c.g.position.z+=amount*.32;c.g.position.y+=amount*.055;c.g.rotation.x=-amount*.035;c.g.scale.setScalar(1+amount*.025);});
   tiles.forEach((g,i)=>{g.position.copy(tileHomes[i]);const pulse=phase===1?Math.sin(Math.PI*ease((local-i*.85)/.85)):0;g.position.z+=pulse*.16;g.scale.setScalar(1+pulse*.045);});
   // A visible tap connects the narrated action to the actual UI target.
   tap.visible=frame.tapOpacity>0;tap.material.opacity=frame.tapOpacity;tap.scale.setScalar(frame.tapScale);
   const xy=phase===0?[400,1046]:phase===1?[101,793+154*frame.takeaway]:phase===2?[106,754]:[106,263];
   tap.position.set((xy[0]/800-.5)*2.14,(.5-xy[1]/1600)*4.34,.251);
   dots.forEach((o,i)=>{o.material=i<=phase?completedMaterial:m.inactive;o.scale.setScalar(i===phase?1+.25*Math.sin(Math.PI*ease(local/1)):1);});
   progressRing.position.x=-.64+phase*.43;progressRing.scale.setScalar(1+ease(local/1.2)*.85);
   progressRing.material.opacity=(1-ease(local/1.2))*.8;progressRing.visible=progressRing.material.opacity>0;

  }});root.userData.animate(0);return root;
}

// Pure timeline keeps manual scrubbing, pause/resume and looping deterministic.
export function xueyiyiMotion(time){
 const t=((time%24)+24)%24,phase=Math.floor(t/6),local=t%6;
 const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
 const takeaway=Math.min(2,Math.max(0,Math.floor((local-.5)/1.25)));
 const tapStart=phase===0?4.1:phase===1?.5+takeaway*1.25:phase===2?1.5:.7;
 const tapTime=(local-tapStart)/.85,active=tapTime>=0&&tapTime<=1;
 return {phase,local,transition:ease((local-5.25)/.75),answerSelected:phase===2&&local>=2.05,
  takeaway,tapOpacity:active?Math.sin(Math.PI*tapTime)*.85:0,tapScale:1+ease(tapTime)*.8};
}
