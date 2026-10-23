import { medivoiceStudio } from './medivoice-studio.js';
import { mnemonicSurfaces } from './neurosurge-surfaces.js';

// A source-grounded mnemonic kitchen: learn ingredient associations, hide cues,
// retrieve the recipe, then confirm it. Time is supplied by the gallery clock.
export const CYCLE_SECONDS = 22;
const ease = v => {const x=Math.max(0,Math.min(1,v));return x*x*x*(x*(x*6-15)+10);};
export function memoryMoment(time) {
 const t=((time%CYCLE_SECONDS)+CYCLE_SECONDS)%CYCLE_SECONDS;
 return { t, turn:Math.PI*(ease((t-6)/1.2)-ease((t-17.2)/1.2)),
  learned:[0,1,2].map(i=>ease((t-i*1.8)/.6)*(1-ease((t-6)/.6))),
  recalled:[0,1,2].map(i=>ease((t-8-i*2)/.6)*(1-ease((t-17)/.6))),
  feedback:ease((t-14)/2), feedbackVisible:t>=14&&t<17 };
}
export function createArtifact(T) {
 const {root,materials:m,mesh,disk,ball,line,texture,batch}=medivoiceStudio(T);
 const grain=texture('paper'),wood=texture('wood');
 for(const [name,color] of Object.entries({stone:0xe8dcc3,cream:0xf1e6cb,brass:0xb9934d,walnut:0x674936,ink:0x21312e,blue:0x245e8d,leaf:0x586a37,lightLeaf:0x9aab58,pit:0x895638,copper:0xb77542,berry:0x314b7d,ivory:0xece2cd})) {
  m[name]=new T.MeshStandardMaterial({color,roughness:name==='brass'?.32:name==='copper'?.35:.72,metalness:name==='brass'?.75:name==='copper'?.72:0,bumpMap:name==='walnut'?wood:grain,bumpScale:name==='stone'?.025:name==='walnut'?.018:.008});
 }
 const surfaces=mnemonicSurfaces(T);for(const name of ['stone','walnut','copper']){m[name].map=surfaces[name];m[name].color.setHex(0xffffff);}
 const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
 function rounded(w,h,d,x,y,z,mat,p=root,r=.035) {
  r=Math.min(r,w/2,h/2,d/2);const geo=new T.BoxGeometry(w,h,d,4,4,4),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const v=new T.Vector3().fromBufferAttribute(pos,i),c=new T.Vector3(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));v.copy(c).addScaledVector(v.clone().sub(c).normalize(),r);pos.setXYZ(i,v.x,v.y,v.z);}
  geo.computeVertexNormals();const o=mesh(geo,mat,p);o.position.set(x,y,z);return o;
 }
 function textLabel(text,w,h,x,y,z,p=root,bg='#eee4ce',fg='#3e4c39') {
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`500 ${Math.min(c.height*.64,c.width/(text.length*.66))}px Georgia`;ctx.fillText(text,c.width/2,c.height/2);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,roughness:.82}));o.position.set(x,y,z);p.add(o);return o;
 }
 function stem(a,b,r,mat,p){line([a,b],r,mat,p);}
 function asparagus(p,scale=1) {const g=group(0,0,0,p);g.scale.setScalar(scale);
  for(let j=0;j<3;j++){const x=(j-1)*.14,h=.74+(j%2)*.13;stem([x,-.36,0],[x,h-.36,0],.035,'leaf',g);for(let k=0;k<5;k++){const y=h-.42-k*.055;for(const side of [-1,1]){const bud=ball(.04,x+side*.018,y,.01,'lightLeaf',g);bud.scale.set(.65,1.6,.6);bud.rotation.z=side*.4;}}}
  return g;
 }
 function mushroom(p,scale=1) {const g=group(0,0,0,p);g.scale.setScalar(scale);
  for(const [x,y,s] of [[-.18,-.12,.8],[.18,.08,1]]){const a=group(x,y,0,g);a.scale.setScalar(s);const st=disk(.06,.38,0,-.06,0,'cream',a);st.rotation.z=-.12;const cap=mesh(new T.SphereGeometry(.25,32,18,0,Math.PI*2,0,Math.PI/2),'pit',a);cap.position.y=.11;const under=disk(.247,.018,0,.11,0,'cream',a);for(let i=0;i<16;i++){const v=i/16*Math.PI*2;stem([.06*Math.sin(v),.095,.06*Math.cos(v)],[.23*Math.sin(v),.095,.23*Math.cos(v)],.004,'walnut',a);}}
  return g;
 }
 function rosemary(p,scale=1) {const g=group(0,0,0,p);g.scale.setScalar(scale);
  for(const [x,tilt] of [[-.13,-.2],[.1,.2]]){const sprig=group(x,-.38,0,g);sprig.rotation.z=tilt;stem([0,0,0],[0,.84,0],.011,'walnut',sprig);for(let i=1;i<12;i++)for(const sign of [-1,1]){const leaf=ball(.08,sign*.065,i*.06,.02,'leaf',sprig);leaf.scale.set(.32,1,.28);leaf.rotation.z=-sign*.7;}}
  return g;
 }
 const plants=[asparagus,mushroom,rosemary];
 // Beveled travertine podium and thin brass inlay.
 rounded(8,.30,3.25,0,.15,0,'stone',root,.12);
 rounded(7.92,.025,3.17,0,.305,0,'brass',root,.01);
 rounded(7.86,.05,3.11,0,.343,0,'stone',root,.022);
 rounded(1.75,.22,.035,0,.16,1.642,'brass');
 textLabel('NeuroSurge',1.68,.17,0,.16,1.663,root,'#22312e','#d8ba7a');
 // Open walnut grocery cabinet. Plinth, rounded rails, shelves and recessed back.
 const cabinet=group(-2.77,.37,-.08);
 rounded(1.63,1.70,.10,0,.9,-.43,'walnut',cabinet);
 for(const side of [-1,1]){rounded(.12,1.78,1.00,side*.80,.89,0,'walnut',cabinet);rounded(.024,1.65,.024,side*.80,.89,.512,'brass',cabinet);}
 for(const y of [.07,.83,1.74]){rounded(1.7,.10,1.08,0,y,0,'walnut',cabinet);rounded(1.68,.025,.025,0,y,.55,'brass',cabinet);}
 for(let j=0;j<8;j++)rounded(.015,.026,1.01,-.68+j*.19,.89,0,'brass',cabinet,.007);
 // Blueberry bowl in the top compartment.
 const bowl=mesh(new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.16,0),new T.Vector2(.29,.20),new T.Vector2(.30,.24),new T.Vector2(.26,.25),new T.Vector2(.23,.14),new T.Vector2(.12,.04),new T.Vector2(0,.04)],48),'cream',cabinet);bowl.position.set(-.47,.89,.08);
 for(let i=0;i<18;i++){const a=i*2.4,r=.19*Math.sqrt(i/18);const b=ball(.051,-.47+Math.sin(a)*r,1.12+(i%3)*.022,.08+Math.cos(a)*r,'berry',cabinet);const crown=mesh(new T.TorusGeometry(.017,.004,5,12),'ink',cabinet);crown.rotation.x=-Math.PI/2;crown.position.copy(b.position);crown.position.y+=.045;}
 // Avocado half and broccoli are actual dimensional ingredient miniatures.
 const av=group(.13,1.15,.13,cabinet);av.rotation.z=-.25;
 const skin=ball(.24,0,0,0,'leaf',av);skin.scale.set(.7,1.2,.5);const flesh=ball(.22,0,0,.05,'lightLeaf',av);flesh.scale.set(.7,1.2,.37);ball(.09,0,-.05,.14,'pit',av);
 const broc=group(.55,1.17,.05,cabinet);stem([0,-.22,0],[0,.1,0],.035,'lightLeaf',broc);for(let i=0;i<11;i++){const a=i*2.4;const b=ball(.075,Math.cos(a)*.13,.04+(i%3)*.055,Math.sin(a)*.09,'leaf',broc);for(let k=0;k<3;k++)ball(.025,b.position.x+Math.sin(k*2)*.04,b.position.y+.06,b.position.z+Math.cos(k*2)*.04,'lightLeaf',broc);}
 for(let i=0;i<6;i++){const page=rounded(.65,.018,.49,-.35,.15+i*.02,.1,'cream',cabinet,.007);page.rotation.y=(i%3-1)*.04;}
 for(let j=0;j<2;j++){disk(.105,.34,.27+j*.29,.30,.05,'cream',cabinet);disk(.114,.045,.27+j*.29,.49,.05,'brass',cabinet);rounded(.12,.12,.012,.27+j*.29,.30,.16,'stone',cabinet);}
 textLabel('GROCERY CUES',1.32,.13,0,1.60,.54,cabinet,'#674936','#e8dcc3');
 // Three rotating association cards; the backs become recall prompts.
 const cards=[],halos=[],checks=[],cardYs=[];
 for(let i=0;i<3;i++){
  const x=-1.2+i*1.08,z=-.30-i*.08;
  rounded(.73,.085,.50,x,.42,z,'brass');
  const sy=[1.45,1.26,1.08][i],cy=.48+.81*sy;cardYs.push(cy);
  const c=group(x,cy,z);c.scale.y=sy;cards.push(c);
  rounded(.94,1.62,.115,0,0,0,'cream',c,.05);
  for(const side of [-1,1])rounded(.014,1.48,.012,side*.415,0,.064,'brass',c,.005);
  textLabel(['ASPARAGUS','MUSHROOM','ROSEMARY'][i],.79,.15,0,.58,.064,c);
  const plant=plants[i](c,.78);plant.position.set(0,.02,.10);
  for(let j=0;j<3;j++)rounded(.60-j*.07,.012,.008,-j*.035,-.49-j*.07,.067,'brass',c,.003);
  const reverse=group(0,0,-.061,c);reverse.rotation.y=Math.PI;textLabel('RECALL',.76,.17,0,.48,.005,reverse);textLabel('?',.56,.60,0,-.02,.005,reverse);textLabel(String(i+1).padStart(2,'0'),.38,.15,0,-.54,.005,reverse);
  const mat=new T.MeshStandardMaterial({color:0x245e8d,emissive:0x245e8d,emissiveIntensity:0});const h=new T.Mesh(new T.TorusGeometry(.08,.015,8,24),mat);h.position.set(x,.58,z+.14);root.add(h);halos.push(h);
  const tile=group(x,.40,1.03);rounded(.74,.055,.58,0,0,0,'cream',tile);const mini=plants[i](tile,.34);mini.rotation.x=-Math.PI/2;mini.position.set(0,.08,0);
  const check=group(.25,.07,.17,tile);line([[-.05,0,0],[0,0,.05],[.11,0,-.08]],.017,'blue',check);checks.push(check);
 }
 // Compact oven: rounded enamel casing, inset glass, copper cooking vessel.
 const oven=group(2.63,.37,-.06);
 rounded(1.55,1.40,1.17,0,.75,0,'cream',oven,.085);
 rounded(1.30,.86,.04,0,.60,.60,'brass',oven,.018);
 rounded(1.17,.74,.045,0,.60,.63,'ink',oven,.02);
 for(let j=0;j<3;j++)rounded(1.04,.012,.015,0,.41+j*.16,.661,'brass',oven,.005);
 rounded(1.11,.06,.12,0,1.05,.70,'brass',oven);
 for(const x of [-.46,0,.46]){const k=disk(.078,.045,x,1.30,.63,'brass',oven);k.rotation.x=Math.PI/2;rounded(.018,.06,.01,x,1.32,.66,'ink',oven);}
 for(const x of [-.54,.54])for(const z of [-.4,.4])disk(.065,.11,x,.06,z,'walnut',oven);
 for(const x of [-.38,.38]){const burner=mesh(new T.TorusGeometry(.23,.022,8,40),'ink',oven);burner.rotation.x=Math.PI/2;burner.position.set(x,1.46,0);}
 const pan=group(0,1.48,.08,oven);
 const bowlGeo=new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.36,0),new T.Vector2(.46,.09),new T.Vector2(.47,.16),new T.Vector2(.43,.16),new T.Vector2(.38,.05),new T.Vector2(0,.05)],64);mesh(bowlGeo,'copper',pan);
 rounded(.62,.045,.095,.69,.12,0,'walnut',pan,.018);stem([.39,.1,0],[.49,.12,0],.034,'brass',pan);
 const mealA=asparagus(pan,.56);mealA.rotation.x=Math.PI/2;mealA.rotation.z=.4;mealA.position.set(-.12,.11,0);
 const mealM=mushroom(pan,.48);mealM.rotation.x=Math.PI/2;mealM.position.set(.15,.14,.09);
 const bottle=group(3.57,.37,-.64);disk(.14,.67,0,.335,0,'leaf',bottle);disk(.065,.24,0,.79,0,'leaf',bottle);disk(.073,.07,0,.945,0,'brass',bottle);rounded(.16,.24,.015,0,.38,.143,'cream',bottle);textLabel('OIL',.13,.10,0,.38,.153,bottle);
 const sprig=rosemary(root,.8);sprig.position.set(3.5,.75,.60);sprig.rotation.z=-.45;
 // A literal route from remembered ingredients to the prepared recipe.
 const path=new T.CatmullRomCurve3([[-1.35,2.60,-.69],[-.2,2.87,-.72],[1.2,2.70,-.70],[2.63,1.98,-.17]].map(p=>new T.Vector3(...p)));
 line(Array.from({length:33},(_,i)=>path.getPoint(i/32).toArray()),.012,'brass');
 const signals=[];for(let i=0;i<3;i++){const g=group();ball(.052,0,0,0,'blue',g);g.position.copy(path.getPointAt(.12+i*.25));signals.push(g);}
 root.updateMatrixWorld(true);
 const framingBounds=new T.Box3(new T.Vector3(-4.12,-.03,-1.72),new T.Vector3(4.12,3.05,1.72));
 // Static geometry batches, while semantic animated groups retain their identity.
 const preserved=[...cards,...halos,...signals];preserved.forEach(g=>root.remove(g));batch(root);preserved.forEach(g=>root.add(g));
 root.userData={conceptual:true,artifactId:25,displayBase:false,studioProfile:'lrnmate',groundLevel:0,initialYaw:-.12,initialElevation:.34,autoOrbit:false,realTimeAnimation:true,framingBounds,
  animate(time){const b=memoryMoment(time);cards.forEach((c,i)=>{c.rotation.y=b.turn;c.position.y=cardYs[i]+.035*b.learned[i];halos[i].material.emissiveIntensity=b.learned[i]*.75;checks[i].visible=b.recalled[i]>.01;checks[i].scale.setScalar(Math.max(.001,b.recalled[i]));});signals.forEach((s,i)=>{s.visible=b.feedbackVisible;s.position.copy(path.getPointAt(Math.min(1,Math.max(0,b.feedback-i*.055))));s.scale.setScalar(ease((b.t-14)/.3)*(1-ease((b.t-16.6)/.4)));});}
 };
 root.userData.animate(0);return root;
}
