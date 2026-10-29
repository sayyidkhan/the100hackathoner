import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {structurMoment,STRUCTUR_CYCLE} from './structur-timing.js';
export function createArtifact(T){
 const {root,materials:m,mesh,box,disk,ball,line,finish,batch}=medivoiceStudio(T),live=[];
 for(const [k,color] of Object.entries({stone:0xe9e2d3,cream:0xf6eddd,ink:0x193755,blue:0x2357aa,gold:0xbc9c67,sage:0x7d8d70,terracotta:0xb37055,green:0x299783,light:0x70b4ff,leaf:0x647556,wood:0x77634e}))m[k]=new T.MeshStandardMaterial({color,roughness:k==='gold'?.32:.72,metalness:k==='gold'?.55:0});
 const stone=planningExhibitSurfaces(T).stone;for(const k of ['stone','cream','sage','terracotta']){m[k].map=stone;m[k].bumpMap=stone;m[k].bumpScale=k==='stone'?.017:.006;}m.light.emissive.setHex(0x428dff);m.light.emissiveIntensity=.65;
 function group(x=0,y=0,z=0,p=root){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;}
 function round(w,h,d,x,y,z,key,p=root,r=.08){r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:3,curveSegments:12}),key,p);o.position.set(x,y,z);return o;}
 function slab(w,d,h,x,y,z,key,p=root,r=.18){const o=round(w,d,h,x,y,z,key,p,r);o.rotation.x=-Math.PI/2;return o;}
 function label(str,w,h,x,y,z,p=root,col='#203e61',font='Arial'){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const ctx=c.getContext('2d');ctx.fillStyle=col;ctx.font=`500 ${c.height*.72}px ${font}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(str,512,c.height/2,1000);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);p.add(o);return o;}
 function arch(x,y,z,w,h,d,key,p){const r=w/2,inner=r*.64,s=new T.Shape();s.moveTo(-r,0);s.lineTo(-r,h-r);s.absarc(0,h-r,r,Math.PI,0,true);s.lineTo(r,0);s.lineTo(inner,0);s.lineTo(inner,h-r);s.absarc(0,h-r,inner,0,Math.PI,false);s.lineTo(-inner,0);s.closePath();const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:30}),key,p);o.position.set(x,y,z);return o;}
 function tree(x,y,z,size,p){const g=group(x,y,z,p);const stem=mesh(new T.CylinderGeometry(.018,.035,size,8),'wood',g);stem.position.y=size/2;for(let j=0;j<7;j++){const a=j*2.4,tip=[Math.cos(a)*size*.28,size*(.65+j*.045),Math.sin(a)*size*.14];line([[0,size*.3,0],tip],.008,'wood',g);for(let k=0;k<7;k++){const aa=k*2.4+j,o=mesh(new T.SphereGeometry(1,6,4),'leaf',g);o.position.set(tip[0]+Math.cos(aa)*size*.11,tip[1]+Math.sin(k)*size*.08,tip[2]+Math.sin(aa)*size*.06);o.scale.set(size*.06,size*.022,size*.035);o.rotation.z=aa;}}return g;}
 slab(13.0,4.3,.23,0,0,0,'stone',root,.35);label('Structur3',2.15,.28,-4.55,.13,2.18);
 // One large browser, one section library. The page itself is built from moving 3D modules.
 const page=group(1.65,3.85,-.23);round(7.85,7.20,.16,0,0,0,'blue',page,.24);round(7.74,7.12,.13,0,0,.15,'stone',page,.21);round(7.55,.60,.06,0,3.20,.29,'cream',page,.12);label('Structur3',1.60,.30,-1.76,3.20,.38,page);for(let i=0;i<3;i++)ball(.048,-3.48+i*.17,3.20,.38,i===2?'sage':'blue',page);
 const library=group(-4.83,3.20,-.14);round(2.65,5.91,.17,0,0,0,'blue',library,.20);round(2.60,5.85,.16,0,0,.15,'stone',library,.18);label('SECTIONS',1.95,.27,0,2.53,.35,library);label('Drag into your page',2.08,.17,0,2.18,.35,library);
 const targetPos=[[1.65,5.23,.12],[1.65,2.55,.12],[1.65,.94,.12]],sourcePos=[[-4.83,4.66,.32],[-4.83,3.00,.32],[-4.83,1.34,.32]],sizes=[[7.10,3.03],[7.10,2.10],[7.10,.77]];
 // Empty slots remain visible while a section is being placed.
 for(let i=0;i<3;i++){const [w,h]=sizes[i],[x,y,z]=targetPos[i];round(w,h,.03,x,y,z-.015,'cream');label(['Drop a hero section','Add your selected work','Add a contact section'][i],3.3,.23,x,y,z+.03,root,'#a0a69f');}
 function section(i){const g=group();const [w,h]=sizes[i];round(w,h,.10,0,0,0,i===0?'blue':'cream',g,.13);
 if(i===0){label('FORM & FIELD',2.5,.18,-1.93,1.02,.13,g,'#eee7d8');label('Ideas into',3.0,.49,-1.82,.48,.13,g,'#fff0d7','Georgia');label('places.',3.0,.54,-1.82,-.08,.13,g,'#fff0d7','Georgia');label('A creative studio for considered spaces.',2.95,.16,-1.82,-.60,.13,g,'#d6e0f2');round(1.55,.34,.035,-2.35,-1.05,.12,'cream',g,.14);label('View our work →',1.36,.17,-2.35,-1.05,.17,g);
 arch(.65,-1.43,.13,1.55,1.70,.16,'stone',g);arch(2.13,-1.43,.14,1.92,2.84,.18,'cream',g);for(let j=0;j<4;j++)box(1.05,.085,.17,2.1,-1.40+j*.085,.50-j*.09,'stone',g);round(.60,.52,.31,2.86,-1.18,.30,'stone',g);tree(2.86,-.91,.43,1.35,g);
 }else if(i===1){label('Selected work',2.2,.18,-2.24,.84,.13,g);label('View all →',1.0,.15,2.79,.84,.13,g);
 for(let j=0;j<3;j++){const xx=-2.34+j*2.34;round(2.13,1.25,.05,xx,.05,.12,['blue','sage','terracotta'][j],g,.06);arch(xx+.15,-.54,.19,.87,1.10,.13,j===2?'terracotta':'cream',g);for(let k=0;k<3;k++)box(.53,.065,.12,xx+.12,-.52+k*.065,.40-k*.07,'stone',g);tree(xx-.60,-.52,.36,.60,g);label(['Coastal House','Olive Retreat','The Terrace'][j],1.9,.16,xx,-.77,.13,g);}
 }else{label("LET’S CREATE",2.1,.11,-2.20,.18,.13,g);label('A more human tomorrow.',4.3,.29,-1.15,-.10,.13,g,'#203e61','Georgia');round(1.75,.36,.035,2.37,-.02,.12,'blue',g,.13);label('Start a project →',1.53,.16,2.37,-.02,.17,g,'#f4ead8');}return g;}
 const sections=[],sectionMats=[];
 for(let i=0;i<3;i++){
 const g=section(i);g.name=`structur-section-${i}`;batch(g);g.position.set(...targetPos[i]);g.traverse(o=>{if(o.material?.isMeshBasicMaterial)o.renderOrder=10;});live.push(g);sections.push(g);
 // Independent materials allow a clean dissolve before the next build.
 const clones=new Map();g.traverse(o=>{if(o.isMesh){if(!clones.has(o.material.uuid)){const c=o.material.clone();c.transparent=true;clones.set(o.material.uuid,c);}o.material=clones.get(o.material.uuid);}});sectionMats.push([...clones.values()]);
 const thumb=section(i);thumb.position.set(...sourcePos[i]);thumb.scale.setScalar(.285);round(2.22,1.43,.04,sourcePos[i][0],sourcePos[i][1],.26,'cream',root,.08); // The small source illustration stays available in the library.
 label(['Hero','Gallery','Contact'][i],1.9,.18,sourcePos[i][0],sourcePos[i][1]-.62,.37);
 }
 // Publish button changes state only after approval and network completion.
 const button=group(4.56,7.05,.14);round(1.36,.40,.08,0,0,0,'green',button,.14);const buttonTexts=['Approve','Deploying','✓ Live'].map(t=>label(t,1.13,.20,0,0,.105,button,'#f4f3e9'));live.push(button);
 const status=group(1.0,.26,1.73);status.rotation.x=-Math.PI/2;const captions=['Choose a section · build your page','Review the design · approve to publish','Deploying your website to ICP','Your website is live'].map(t=>label(t,4.80,.18,0,0,.06,status));live.push(status);
 // Small distributed publishing footprint, visually secondary to the actual website.
 const nodes=[];for(let i=0;i<3;i++){const xx=-1.85+i*1.8;const hex=mesh(new T.CylinderGeometry(.36,.36,.15,6),'blue');hex.position.set(xx,.32,.90);const top=group(xx,.41,.90);const ring=mesh(new T.TorusGeometry(.18,.016,6,36),'light',top);ring.rotation.x=-Math.PI/2;live.push(top);nodes.push(top);if(i<2)line([[xx,.29,.90],[xx+1.8,.29,.90]],.019,'blue');}
 line([[1.65,.30,-.23],[1.65,.30,.36],[-1.85,.30,.36],[-1.85,.30,.90]],.018,'blue');round(1.26,.42,.09,4.40,.49,.96,'cream');label('ICP',.56,.25,4.16,.49,1.08);const check=group(4.73,.49,1.08);const d=disk(.12,.025,0,0,0,'green',check);d.rotation.x=Math.PI/2;label('✓',.17,.17,0,0,.025,check,'#ffffff');live.push(check);
 const cursor=group(4.5,7.06,.50);const arrow=new T.Shape();arrow.moveTo(0,0);arrow.lineTo(.04,-.51);arrow.lineTo(.17,-.37);arrow.lineTo(.29,-.59);arrow.lineTo(.40,-.53);arrow.lineTo(.28,-.32);arrow.lineTo(.48,-.30);arrow.closePath();mesh(new T.ExtrudeGeometry(arrow,{depth:.025,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2}),'blue',cursor);live.push(cursor);
 const pulse=group(-1.85,.44,.90);ball(.065,0,0,0,'light',pulse);live.push(pulse);
 const anchor=group();live.push(anchor);root.updateMatrixWorld(true);const framing=[];for(const c of root.children){if(c===cursor||sections.includes(c))continue;const b=new T.Box3().setFromObject(c);if(!b.isEmpty())for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framing.push(new T.Vector3(x,y,z));}
 const model=finish(33,live),offset=anchor.position.clone();model.remove(anchor);
 Object.assign(model.userData,{artifactId:33,displayBase:false,contactFootprint:false,studioProfile:'structur3',groundLevel:0,framingPoints:framing.map(p=>p.add(offset)),cameraFitSway:0,initialYaw:.09,initialElevation:.15,framingTargetY:3.8,autoOrbit:false,realTimeAnimation:true,cycleDuration:STRUCTUR_CYCLE,
 animate(time){const s=structurMoment(time);model.userData.story=s;model.userData.published=s.live;
 sections.forEach((g,i)=>{const f=s.blocks[i],a=new T.Vector3(...sourcePos[i]),b=new T.Vector3(...targetPos[i]);g.position.copy(a.lerp(b,f)).add(offset);g.position.z+=Math.sin(f*Math.PI)*.65;g.scale.setScalar(.285+.715*f);g.rotation.z=Math.sin(f*Math.PI)*-.06;g.visible=f>0&&s.fade>.001;sectionMats[i].forEach(mat=>mat.opacity=s.fade);});
 const active=s.blocks.findIndex(f=>f>0&&f<1);cursor.visible=(active>=0||s.phase==='Approve')&&s.fade>.02;if(active>=0){cursor.position.copy(sections[active].position);cursor.position.x+=1.1;cursor.position.y-=.40;cursor.position.z+=.65;}else cursor.position.set(4.5,7.06,.50).add(offset);
 buttonTexts.forEach((o,i)=>{if(o)o.visible=i===(s.phase==='Restart'?0:s.live?2:s.approved?1:0);});captions.forEach((o,i)=>{if(o)o.visible=i===(s.t<8?0:s.t<11?1:s.t<19?2:3);});
 nodes.forEach((g,i)=>g.visible=s.deploy>i/3&&s.fade>.02);check.visible=s.live&&s.fade>.02;pulse.visible=s.deploy>0&&s.deploy<1;pulse.position.set(-1.85+3.6*s.deploy,.44,.90).add(offset);
 }});model.userData.animate(0);return model;
}
export default createArtifact;
