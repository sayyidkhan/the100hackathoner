import { medivoiceStudio } from './medivoice-studio.js';
import { paintScreen, lessons } from './xueyiyi-screen.js';

// Product-led concept: one short lesson -> one check -> useful feedback.
export function createXueyiyi(T,edition){
 const {root,materials:m,mesh,box,disk,finish}=medivoiceStudio(T),preserved=[];
 const d=lessons[edition];
 const mat=(color,roughness=.5,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 Object.assign(m,{ink:mat(d.color,.38),silver:mat(0xb4bdb3,.25,.8),cream:mat(0xf2f4e9,.7),lime:mat(d.accent,.46),edge:mat(0xd3decb,.6),glass:mat(0x101f1b,.22)});
 const group=(x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);root.add(g);return g;};
 function round(w,h,depth,x,y,z,color,parent=root,r=.12){r=Math.min(r,w/2-.001,h/2-.001);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:12}),color,parent);o.position.set(x,y,z);return o;}
 function map(phase,mode='phone'){if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=800;c.height=mode==='phone'?1440:1120;paintScreen(c.getContext('2d'),edition,phase,mode);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}
 function panel(w,h,z,parent,texture){const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,color:texture?0xffffff:0xf8f9f1,toneMapped:false}));o.position.z=z;parent.add(o);return o;}
 function title(text,w,h,x,y,z){let t=null;if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1600;c.height=140;const ctx=c.getContext('2d');ctx.fillStyle=d.color;ctx.fillRect(0,0,1600,140);ctx.font='500 48px Arial';ctx.fillStyle='#edf6df';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,800,70,1480);t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;}const g=group(x,y,z);panel(w,h,0,g,t);preserved.push(g);}
 // Slim product stage, no furniture or miniature workplace buildings.
 const stage=round(7.9,2.65,.15,0,.12,0,'ink',root,.48);stage.rotation.x=-Math.PI/2;
 const cap=round(7.77,2.52,.035,0,.292,0,'cream',root,.44);cap.rotation.x=-Math.PI/2;
 title(`XUEYIYI ${edition}.0   /   SMALL LESSONS. REAL PROGRESS.`,5.6,.21,0,.22,1.365);
 const phone=group(-.25,2.48,.12);phone.rotation.y=-.035;
 round(2.18,4.30,.18,0,0,0,'silver',phone,.25);round(2.12,4.24,.16,0,0,.04,'glass',phone,.24);
 round(1.99,4.08,.025,0,0,.215,'cream',phone,.19);
 const frames=[0,1,2,3].map(p=>map(p)),screenMap=frames[0],images=frames.map(t=>t?.image);frames.slice(1).forEach(t=>t?.dispose());
 const screen=panel(1.91,3.78,.257,phone,screenMap);screen.position.y=-.02;
 round(.49,.075,.015,0,1.96,.258,'glass',phone,.034);
 box(.038,.40,.08,-1.12,.7,.09,'silver',phone);box(.038,.21,.08,-1.12,.13,.09,'silver',phone);box(.038,.52,.08,1.12,.43,.09,'silver',phone);
 // Bottom speaker perforations and a USB port give the hero device real scale.
 for(const side of [-1,1])for(let i=0;i<5;i++)round(.017,.018,.008,side*(.32+i*.055),-2.125,.13,'glass',phone,.008);
 round(.20,.025,.008,0,-2.125,.13,'glass',phone,.01);preserved.push(phone);
 const cards=[];
 for(const [phase,x,y,z,angle] of [[1,-2.60,2.20,-.16,.10],[2,2.30,2.40,-.12,-.12]]){
  const g=group(x,y,z);g.rotation.y=angle;
  // Thin layered app cards, with actual lesson and answer content.
  round(2.12,2.90,.08,0,0,0,'edge',g,.15);
  const face=panel(1.99,2.59,.105,g,map(phase,'card'));face.position.y=.02;
  const underline=box(1.70,.035,.03,0,-1.36,.11,'lime',g);
  preserved.push(g);cards.push({g,face,underline,phase,home:null,texture:face.material.map});
 }
 // Small stack under the lesson card communicates a library of short lessons.
 for(let i=0;i<3;i++){const tile=round(1.75,.16,.72,-2.57,.48+i*.18,.25,i===2?'lime':'cream',root,.06);tile.rotation.y=-.10+i*.06;}
 const progress=group(2.34,.65,.48);round(2.12,.42,.08,0,0,0,'ink',progress,.13);
 for(let i=0;i<4;i++){const dot=disk(.075,.025,-.61+i*.40,0,.11,'lime',progress);dot.rotation.x=Math.PI/2;dot.name=`lesson-progress-${i}`;}preserved.push(progress);
 const feedback=map(3,'card'),feedbackImage=feedback?.image;feedback?.dispose();
 const quizImage=cards[1].texture?.image;
 finish(edition,preserved);cards.forEach(c=>c.home=c.g.position.clone());
 const titles=['A few minutes. One skill.','Learn one useful idea','Try one quick question','Get feedback. See progress.'];
 const details=[`A ${d.time} microlesson fits into the day. Pick a skill and start.`, 'A short explanation and three practical takeaways keep the lesson focused.', 'Apply the idea to a realistic situation. The example selects the second answer.', 'Explain why the answer works, mark the lesson complete and suggest the next lesson.'];
 let manual=null,offset=0,last=0,previous=-1;
 const ease=v=>{v=T.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
 Object.assign(root.userData,{displayBase:false,studioProfile:'lrnmate',initialYaw:-.10,initialElevation:.16,autoOrbit:false,realTimeAnimation:true,cycleDuration:24,learningStages:['discover','lesson','quiz','feedback'],
  setStep(index,elapsed=last){if(index===null){if(manual!==null)offset=manual-elapsed;manual=null;}else if(Number.isInteger(index)&&index>=0&&index<4)manual=index*6+3;},
  animate(time){last=time;const t=((manual??time+offset)%24+24)%24,phase=Math.floor(t/6),local=t%6;
   root.userData.story={index:phase,step:`0${phase+1} / 04`,title:titles[phase],detail:details[phase],tone:phase===3?'success':'neutral'};
   if(phase!==previous){if(screenMap){screenMap.image=images[phase];screenMap.needsUpdate=true;}const quizTexture=cards[1].texture;if(quizTexture){quizTexture.image=phase===3?feedbackImage:quizImage;quizTexture.needsUpdate=true;}previous=phase;}
   // The relevant content card steps forward to focus attention; no idle wandering.
   cards.forEach(c=>{const active=phase===c.phase||(phase===3&&c.phase===2),amount=active?ease(local/.8):0;c.g.position.copy(c.home);c.g.position.z+=amount*.18;c.g.scale.setScalar(1+amount*.035);c.underline.visible=active;});
   progress.children.forEach(o=>{if(o.name.startsWith('lesson-progress-'))o.visible=Number(o.name.at(-1))<=phase;});
  }});root.userData.animate(0);return root;
}
