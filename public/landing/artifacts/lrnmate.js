import { applyMediVoiceAO } from './medivoice-surface.js';
import { lrnmatePeople } from './lrnmate-people.js';
import { lrnmateSurfaces } from './lrnmate-surfaces.js';
import { medivoiceStudio } from './medivoice-studio.js';
// Source-grounded concept: documents → snippets/video → quiz → human feedback.
export function createArtifact(T, options={}) {
 const {root,materials:m,mesh,disk,ball,line,batch,texture}=medivoiceStudio(T);
 for(const [k,c] of Object.entries({paper:0xe6d7bc,ivory:0xf5ead5,blue:0x174f91,red:0xbe4b32,shade:0xb4a184,ink:0x243c4e,gold:0xb99151,wood:0x75553d}))m[k]=new T.MeshStandardMaterial({color:c,roughness:k==='gold'?.3:.66,metalness:k==='gold'?.7:0});
 const surfaces=lrnmateSurfaces(T);
 m.paper.map=surfaces.stone;m.paper.roughness=.92;m.ivory.roughness=.83;
 m.cloth=new T.MeshStandardMaterial({color:0xffffff,map:surfaces.cloth??null,roughness:.84,side:T.DoubleSide});
 m.leaf=new T.MeshStandardMaterial({color:0x8b8552,roughness:.65,metalness:.15});
 const grain=texture('paper');m.paper.bumpMap=surfaces.stone??grain;m.paper.bumpScale=.035;m.ivory.bumpMap=grain;m.ivory.bumpScale=.012;m.paper.color.setHex(0xffffff);m.cloth.bumpMap=surfaces.cloth??grain;m.cloth.bumpScale=.018;m.red.bumpMap=grain;m.red.bumpScale=.014;
 const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
 function box(w,h,d,x,y,z,mat='ivory',p=root,r=.025){
  r=Math.min(r,w/2,h/2,d/2);const geo=new T.BoxGeometry(w,h,d,5,5,5),pos=geo.attributes.position,n=geo.attributes.normal;
  for(let i=0;i<pos.count;i++){const v=new T.Vector3().fromBufferAttribute(pos,i),c=new T.Vector3(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));const nn=v.clone().sub(c).normalize();v.copy(c).addScaledVector(nn,r);pos.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,nn.x,nn.y,nn.z);}
  const o=mesh(geo,mat,p);o.position.set(x,y,z);return o;
 }
 function relief(points,depth,x,y,z,mat,p=root){const s=new T.Shape();points.forEach(([a,b],i)=>i?s.lineTo(a,b):s.moveTo(a,b));s.closePath();const o=mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3}),mat,p);o.position.set(x,y,z);return o;}
 const base=new T.Shape();base.moveTo(-3.35,-1.15);base.lineTo(3.35,-1.15);base.quadraticCurveTo(4,-1.15,4,-.5);base.lineTo(4,.65);base.quadraticCurveTo(4,1.3,3.35,1.3);base.lineTo(-3.35,1.3);base.quadraticCurveTo(-4,1.3,-4,.65);base.lineTo(-4,-.5);base.quadraticCurveTo(-4,-1.15,-3.35,-1.15);
 const slab=mesh(new T.ExtrudeGeometry(base,{depth:.34,bevelEnabled:true,bevelSize:.045,bevelThickness:.045,bevelSegments:4,curveSegments:30}),'paper');slab.rotation.x=-Math.PI/2;slab.position.y=-.075;
 const archive=group(-2.78,.31,-.10);
 // Staggered books show their broad decorated covers, as in the artwork.
 const sizes=[2.52,2.36,2.18,2.02,1.78,1.52,1.28];
 for(let j=0;j<7;j++){
  const h=sizes[j],w=.22+(j%3)*.045;
  const book=group(-.50+j*.20,0,-.24+j*.13,archive);book.rotation.y=-.18;
  box(w,h,.80,0,h/2,0,'paper',book,.018);
  for(const side of [-1,1])box(.025,h+.05,.87,side*w/2,h/2,0,j===1?'blue':j===2?'red':'ivory',book,.01);
  box(w+.02,h,.055,0,h/2,.42,j===2?'red':j===1?'blue':'paper',book);
  for(const y of [.16,.24,h-.20,h-.28])box(w*.8,.014,.012,0,y,.453,'gold',book,.003);
  for(let k=0;k<5;k++)box(w*.6,.008,.009,0,h*.72-k*.035,.456,'shade',book,.002);
 }
 for(const [i,x,z,h] of [[0,.22,.57,1.95],[2,.63,.78,1.34]]){
  const g=group(x,0,z,archive);g.rotation.y=-.24;box(.60,h,.07,0,h/2,0,'ivory',g);
  if(surfaces.covers){const mat=new T.MeshStandardMaterial({map:surfaces.covers[i],roughness:.9});const face=new T.Mesh(new T.PlaneGeometry(.55,h-.08),mat);face.position.set(0,h/2,.041);g.add(face);}
 }
 for(const side of [-1,1]){const x=side<0?-.76:1.0;relief([[-.09,0],[.09,0],[.09,.56],[-.09,.77]],.98,x,0,-.48,'paper',archive);}
 const binder=group(-.02,0,.43,archive);box(.28,2.24,.77,0,1.12,0,'red',binder);
 box(.15,.61,.012,0,1.49,.395,'paper',binder);const hole=mesh(new T.TorusGeometry(.072,.018,16,48),'gold',binder);hole.position.set(0,.39,.40);const black=disk(.060,.012,0,.39,.40,'ink',binder);black.rotation.x=Math.PI/2;
 // Broad folded ribbon, built as a real double-sided surface.
 const curve=new T.CatmullRomCurve3([new T.Vector3(-2.25,1.7,.36),new T.Vector3(-1.3,1.10,.42),new T.Vector3(-.25,.85,.44),new T.Vector3(.75,.65,.40),new T.Vector3(1.50,1.0,-.10)]);
 const ribbon=new T.PlaneGeometry(1,1,150,20),rp=ribbon.attributes.position;
 for(let i=0;i<rp.count;i++){const t=rp.getX(i)+.5,p=curve.getPointAt(t),v=rp.getY(i);rp.setXYZ(i,p.x,p.y+v*.65+Math.sin(t*14+v)*.07,p.z-v*.40);}ribbon.computeVertexNormals();const ribbonMesh=mesh(ribbon,'cloth');const ribbonRest=new Float32Array(rp.array);ribbonMesh.userData.noAO=true;
 const cards=[],cardHeights=[2.05,1.87,1.64];
 function printFace(map,w,h,x,y,z,p){const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.88}));o.position.set(x,y,z);p.add(o);}
 for(let i=0;i<3;i++){
  const g=group(-1.2+i*1.08,cardHeights[i],.08);g.rotation.y=-.10;g.rotation.z=-.05;cards.push(g);
  box(.91,1.37,.09,0,0,0,'ivory',g,.035);
  if(i===0){
   for(const side of [-1,1]){box(.17,.22,.018,-.19+side*.095,.38,.058,'paper',g);for(let j=0;j<4;j++)box(.12,.008,.008,-.19+side*.095,.32+j*.035,.072,'shade',g);}
   for(let j=0;j<5;j++)box(.68-(j%3)*.07,.024,.012,-(j%3)*.035,.09-j*.12,.056,'shade',g,.006);
  }
  if(i===1){printFace(surfaces.landscape,.76,.65,0,.18,.051,g);const play=disk(.18,.035,0,.18,.079,'red',g);play.rotation.x=Math.PI/2;relief([[-.055,-.08],[.085,0],[-.055,.08]],.015,0,.18,.11,'ivory',g);box(.70,.018,.015,0,-.29,.055,'shade',g);box(.28,.025,.018,-.21,-.29,.066,'red',g);ball(.035,-.07,-.29,.08,'ivory',g);for(let j=0;j<2;j++)box(.025,.065,.015,.27+j*.055,-.43,.06,'shade',g);}
  if(i===2)for(let j=0;j<3;j++){const y=.36-j*.35;const circle=mesh(new T.TorusGeometry(.085,.012,12,40),'gold',g);circle.position.set(-.25,y,.066);if(j===1){const badge=disk(.080,.018,-.25,y,.068,'blue',g);badge.rotation.x=Math.PI/2;line([[-.29,y,.083],[-.26,y-.03,.084],[-.20,y+.04,.084]],.012,'ivory',g);}for(let k=0;k<2;k++)box(k?.30:.43,.021,.012,k?.065:.13,y+.03-k*.08,.06,'shade',g);}
 }
 // Shared study table with turned flutes and an open reference book.
 const desk=group(2.40,.29,.52);desk.scale.set(1.48,1.48,1.48);disk(.64,.10,0,.78,0,'ivory',desk);disk(.34,.69,0,.36,0,'paper',desk);
 for(let i=0;i<28;i++){const a=i/28*Math.PI*2;line([[Math.sin(a)*.34,.05,Math.cos(a)*.34],[Math.sin(a)*.34,.70,Math.cos(a)*.34]],.014,'ivory',desk);}
 for(const side of [-1,1]){const p=group(side*.19,.85,.10,desk);p.rotation.z=side*-.10;box(.38,.035,.46,0,0,0,'paper',p);for(let j=0;j<6;j++)box(.28,.005,.008,0,.024,-.15+j*.055,'shade',p,.002);}
 for(let i=0;i<3;i++){box(.25,.055,.32,.43,.86+i*.06,-.19,i===1?'paper':'wood',desk);}
 const laptop=group(0,.85,-.26,desk);box(.48,.025,.25,0,0,0,'gold',laptop);const screen=box(.48,.29,.023,0,.15,-.12,'ink',laptop);screen.rotation.x=-.17;for(let i=0;i<3;i++)box(.3,.012,.012,0,.10+i*.05,-.097,'paper',laptop);
 disk(.065,.10,.43,.88,.06,'ivory',desk);const handle=mesh(new T.TorusGeometry(.04,.009,8,24),'gold',desk);handle.position.set(.50,.89,.06);
 const lamp=group(3.58,.29,-.48);disk(.16,.035,0,.03,0,'gold',lamp);line([[0,.04,0],[0,2.40,0],[-.20,2.57,0],[-.40,2.40,0]],.018,'gold',lamp);const shade=mesh(new T.ConeGeometry(.18,.19,36,1,true),'gold',lamp);shade.position.set(-.40,2.35,0);
 const animatePeople=lrnmatePeople(T,{root,materials:m,mesh,ball,line,box,disk});
 const feedback=new T.CatmullRomCurve3([new T.Vector3(3.15,2.35,-.55),new T.Vector3(2.2,3.10,-.55),new T.Vector3(.9,3.24,-.55),new T.Vector3(-.15,2.75,-.45)]);
 line(Array.from({length:65},(_,i)=>feedback.getPoint(i/64).toArray()),.014,'gold');const movingBeads=[];for(const t of [.36,.75]){const g=group();g.position.copy(feedback.getPointAt(t));ball(.065,0,0,0,'blue',g);movingBeads.push(g);}const tip=mesh(new T.ConeGeometry(.075,.22,24),'gold');tip.position.copy(feedback.getPointAt(1));tip.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),feedback.getTangentAt(1));
 // Small leaves and a ceramic planter frame the human end of the story.
 const plant=group(3.60,.29,-.65);disk(.16,.27,0,.135,0,'paper',plant);
 for(let i=0;i<14;i++){const a=i*2.4,h=.48+i*.09;line([[0,.2,0],[Math.sin(a)*.10,h,Math.cos(a)*.10]],.009,'gold',plant);const leaf=ball(.11,Math.sin(a)*.12,h,Math.cos(a)*.12,'leaf',plant);leaf.scale.set(.45,1.7,.7);leaf.rotation.z=-Math.sin(a)*.7;}
 box(1.45,.25,.035,0,.12,1.20,'gold');printFace(surfaces.plaque,1.4,.22,0,.12,1.224,root);
 root.updateMatrixWorld(true);const framingPoints=[];for(const child of root.children){const b=new T.Box3().setFromObject(child);if(b.isEmpty())continue;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));}
 root.remove(ribbonMesh);batch(root);root.add(ribbonMesh);
 // Keep raised printing from casting harsh stripes across the small card faces.
 cards.forEach(g=>g.traverse(o=>{if(o.isMesh){o.receiveShadow=false;o.userData.noReceiveShadow=true;}}));
 root.userData={framingPoints,conceptual:true,artifactId:34,displayBase:false,studioProfile:'lrnmate',groundLevel:-.12,initialYaw:-.16,initialElevation:.30,autoOrbit:false,realTimeAnimation:true,
  animate(t){
   cards.forEach((c,i)=>{c.position.y=cardHeights[i]+.025*Math.sin(t*.8+i);c.rotation.y=-.10+.025*Math.sin(t*.55+i);});
   animatePeople(t);
   movingBeads.forEach((b,i)=>b.position.copy(feedback.getPointAt((t*.065+i*.48)%1)));
   for(let i=0;i<rp.count;i++){const x=ribbonRest[i*3];rp.setY(i,ribbonRest[i*3+1]+.035*Math.sin(x*3-t*1.6));}rp.needsUpdate=true;ribbon.computeVertexNormals();
  },
  framingBounds:new T.Box3(new T.Vector3(-4.1,0,-1.4),new T.Vector3(4.1,3.35,1.4))};
 root.userData.animate(0);if(!options.bake)applyMediVoiceAO(T,root,{url:new URL('../assets/lrnmate-ao-v1.bin',import.meta.url),label:'LrnMate'});return root;
}
