import {medivoiceStudio} from './medivoice-studio.js';
import {planningExhibitSurfaces} from './planning-exhibit-surfaces.js';
import {nestashLandscapes} from './nestash-landscapes.js';
import {applyObservatoryAO} from './astrodegen-occlusion.js';
import {nestashScreen,nestashMoment,NESTASH_STEPS,NESTASH_CYCLE,ease} from './nestash-screen.js';
export {nestashMoment,NESTASH_CYCLE} from './nestash-screen.js';

export function createArtifact(T,options={}){
 const {root,materials:m,mesh,box,disk,ball,line,finish,batch,texture}=medivoiceStudio(T),live=[];
 const mat=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 Object.assign(m,{navy:mat(0x133440,.44,.18),edge:mat(0x091d28,.38,.18),gold:mat(0xb99a61,.3,.78),stone:mat(0xece5d3,.78),white:mat(0xf0f0df,.42,.06),sage:mat(0x72917a,.92),rock:mat(0x8b8975,.95),moss:mat(0x435f4b,.95),soil:mat(0x626955,.95),bark:mat(0x806f4e),leaf:mat(0x53765a),leafLight:mat(0x92ad70),solar:mat(0x183d64,.26,.3),grid:mat(0x94bbca,.36,.5),water:mat(0x4d9eaa,.22,.35),glazing:mat(0x284953,.2,.42),paper:mat(0xf1ead8,.83),mint:new T.MeshStandardMaterial({color:0x94e5b9,emissive:0x48ba8a,emissiveIntensity:.6,roughness:.35})});
 const stone=planningExhibitSurfaces(T).stone;m.stone.map=stone;m.stone.bumpMap=stone;m.stone.bumpScale=.007;
 m.paper.bumpMap=texture('cloth');m.paper.bumpScale=.003;
 // Dense leather grain gives the desk and folio a tactile, low-sheen finish.
 const grainSize=512,grainData=new Uint8Array(grainSize*grainSize*4);let grainSeed=1217;
 const grainRandom=()=>((grainSeed=(Math.imul(grainSeed,1664525)+1013904223)>>>0)/4294967296);
 for(let y=0;y<grainSize;y++)for(let x=0;x<grainSize;x++){
  const v=168+Math.sin(x*.25+Math.sin(y*.34))*5+(grainRandom()-.5)*42,p=(y*grainSize+x)*4;
  grainData.set([v,v,v,255],p);
 }
 const leather=new T.DataTexture(grainData,grainSize,grainSize);leather.colorSpace=T.SRGBColorSpace;leather.wrapS=leather.wrapT=T.RepeatWrapping;leather.minFilter=T.LinearMipmapLinearFilter;leather.magFilter=T.LinearFilter;leather.generateMipmaps=true;leather.anisotropy=8;leather.repeat.set(.8,.8);leather.needsUpdate=true;
 m.navy.map=leather;m.navy.bumpMap=leather;m.navy.bumpScale=.008;m.navy.roughness=.72;m.navy.metalness=.04;
 m.white.color.setHex(0xe5e3d8);m.white.roughness=.62;m.stone.bumpScale=.012;
 m.gold.color.setHex(0xbca379);m.gold.roughness=.34;

 const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
 const rounded=(w,h,d,x,y,z,key,parent=root,r=.045)=>{
  r=Math.min(r,w*.48,h*.48);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:12});geo.translate(0,0,-d/2);const o=mesh(geo,key,parent);o.position.set(x,y,z);return o;
 };
 const slab=(w,d,h,x,y,z,key,parent=root,r=.07)=>{const o=rounded(w,d,h,x,y,z,key,parent,r);o.rotation.x=-Math.PI/2;return o;};
 const ell=(x,y,z,sx,sy,sz,key,parent=root)=>{const o=ball(1,x,y,z,key,parent);o.scale.set(sx,sy,sz);return o;};
 function label(value,w,h,x,y,z,parent=root,color='#eadcbb',size=70){
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font=`500 ${Math.min(size,c.height*.75)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,512,c.height/2,970);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);parent.add(o);return o;
 }
 const ring=(r,t,x,y,z,key,parent=root)=>{const o=mesh(new T.TorusGeometry(r,t,8,96),key,parent);o.position.set(x,y,z);o.rotation.x=-Math.PI/2;return o;};
 slab(7.2,4.35,.21,0,.13,0,'edge',root,.24);slab(7.15,4.3,.025,0,.254,0,'gold',root,.24);slab(7.10,4.25,.04,0,.29,0,'navy',root,.24);
 rounded(2.15,.23,.03,-.20,.13,2.19,'gold');rounded(2.09,.18,.015,-.20,.13,2.213,'edge');label('N E S T A S H   /   2 0 1 7',1.98,.14,-.2,.13,2.245);
 // The search console is the anchor; a true screen, stand, rear shell and bevelled frame.
 const tablet=group(-2.09,.35,-.35);tablet.rotation.x=-.085;
 slab(1.35,.8,.045,0,0,.1,'gold',tablet);rounded(.29,.40,.12,0,.19,-.04,'gold',tablet);
 rounded(2.17,2.98,.14,0,1.78,0,'gold',tablet,.13);rounded(2.11,2.92,.16,0,1.78,.025,'edge',tablet,.12);
 const ui=nestashScreen(T),screen=new T.Mesh(new T.PlaneGeometry(1.93,2.58),ui.material);screen.position.set(0,1.78,.118);screen.name='nestash-screen';tablet.add(screen);live.push(screen);
 ell(0,3.16,.124,.018,.018,.005,'glazing',tablet);box(.43,.014,.008,0,.412,.12,'gold',tablet);
 for(let i=0;i<5;i++)box(.08,.006,.008,-.19+i*.095,.36,-.088,'gold',tablet);
 // Navy folio: visible paper signatures, binding, brass pen and stitched cover.
 const folio=group(-2.17,.35,1.22);folio.rotation.y=-.12;
 slab(1.77,.88,.04,0,0,0,'edge',folio);slab(1.70,.83,.10,.015,.065,0,'paper',folio);slab(1.77,.88,.032,0,.128,0,'navy',folio);
 for(let j=0;j<5;j++)box(1.66,.003,.003,0,.03+j*.017,.42,'gold',folio);
 const ft=label('RESEARCH NOTES',1.31,.16,0,.174,.06,folio);if(ft)ft.rotation.x=-Math.PI/2;
 for(let i=0;i<28;i++)box(.032,.003,.006,-.8+i*.06,.15,.37,'gold',folio);
 const pen=group(-2.13,.38,1.83);pen.rotation.z=Math.PI/2;const pb=mesh(new T.CylinderGeometry(.028,.028,1.1,24),'gold',pen);const tip=mesh(new T.ConeGeometry(.027,.13,20),'edge',pen);tip.position.y=.615;
 // Three miniature themes sit on shallow, turned-stone research platforms.
 const islands=[],radii=[1.13,.86,.86];
 const centers=[[.22,.35,.80],[.65,.72,-1.25],[2.30,.35,-.30]];
 const tags=['CLEAN ENERGY','WATER','SUSTAINABLE CITIES'];
 const selections=[];
 centers.forEach((p,i)=>{
  const g=group(...p);islands.push(g);const r=radii[i];
  disk(r,.09,0,.045,0,'edge',g);disk(r*.99,.028,0,.104,0,'gold',g);disk(r*.965,.16,0,.198,0,'stone',g);disk(r*.90,.028,0,.29,0,'sage',g);ring(r*.94,.008,0,.29,0,'gold',g);
  // Honed stone sides remain continuous, with a fine brass lip.
  const marker=ring(r*.965,.018,0,.304,0,'mint',g);marker.name=`nestash-selection-${i}`;live.push(marker);selections.push(marker);
  rounded(i===2?1.12:.91,.16,.022,0,.16,r+.015,'edge',g,.02);label(tags[i],i===2?1.08:.86,.115,0,.16,r+.051,g,'#e8dfc4',72);
 });
 const {rotors,ripples,flows}=nestashLandscapes(T,{materials:m,mesh,box,disk,line,group,slab,rounded,batch},islands,live);
 // The research card rises only after the search has produced its match.
 const card=group(-.58,.39,1.70);card.rotation.x=-.25;card.name='nestash-shortlist';
 rounded(1.65,.57,.055,0,.1,0,'gold',card,.06);rounded(1.60,.52,.06,0,.1,.018,'paper',card,.055);
 label('CLEAN ENERGY',1.40,.16,0,.22,.076,card,'#214e46',75);label('Saved to research shortlist',1.49,.13,0,.025,.076,card,'#477363',64);
 batch(card);live.push(card);
 // A route carries search signals from the console to the matching landscape.
 const route=new T.CatmullRomCurve3([new T.Vector3(-1.02,.43,.67),new T.Vector3(-.91,.40,1.64),new T.Vector3(-.34,.40,1.91),new T.Vector3(.38,.40,1.78),new T.Vector3(.32,.48,1.50)]);
 mesh(new T.TubeGeometry(route,80,.012,8,false),'gold');const beads=[];
 for(let i=0;i<5;i++){const b=ball(.028,0,0,0,'mint');b.name=`nestash-signal-${i}`;beads.push(b);live.push(b);}
 root.updateMatrixWorld(true);const framingPoints=[];root.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));});for(const o of live)root.attach(o);
 const before=screen.position.clone(),model=finish(12,live),offset=screen.position.clone().sub(before);
 for(const point of framingPoints)point.add(offset);
 const cardY=card.position.y,rotorRest=rotors.map(r=>r.quaternion.clone());
 let selected=null,timeOffset=0;
 Object.assign(model.userData,{artifactId:12,framingPoints,cameraFitSway:0,displayBase:false,studioProfile:'nestash',contactFootprint:false,initialYaw:-.19,initialElevation:.49,autoOrbit:false,realTimeAnimation:true,cycleDuration:NESTASH_CYCLE,
  setStep(index,time=0){if(index!==null&&(!Number.isInteger(index)||index<0||index>3))return;if(index===null){timeOffset=time-(selected??time-timeOffset);selected=null;}else selected=[3.5,8.7,14.7,20.8][index];model.userData.animate(time);},
  animate(time){const s=nestashMoment(selected??time-timeOffset),copy=NESTASH_STEPS[s.index];ui.update(s);screen.userData.phase=s.index;
   model.userData.story={index:s.index,step:`0${s.index+1} / 04`,title:copy[1],detail:copy[2],tone:'teal'};
   rotors.forEach((r,i)=>{r.quaternion.copy(rotorRest[i]);r.rotateZ(-s.t*Math.PI*(i?1/3:1/2));});
   selections.forEach((r,i)=>{r.visible=i===0&&s.selection>0;r.material.emissiveIntensity=.55+.25*Math.sin(s.t*2);r.scale.setScalar(.98+.02*s.selection);});
   card.visible=s.index===3;card.position.y=cardY+s.saved*.32*s.reset;card.scale.setScalar(.90+.10*s.saved);
   ripples.forEach((r,i)=>r.scale.setScalar(.82+.18*Math.sin(s.t*Math.PI/2+i*1.3)));
   flows.forEach((r,i)=>r.scale.x=.85+.15*Math.sin(s.t*Math.PI*2+i*.7));
   beads.forEach((b,i)=>{b.visible=s.index===1||s.index===3;const u=((s.t*.29+i*.17)%1+1)%1;b.position.copy(route.getPointAt(u)).add(offset);});
  }
 });
 for(const o of model.children)if(o.isMesh&&!o.material.isMeshBasicMaterial&&!o.material.transparent&&!live.includes(o))o.userData.observatoryAO=true;
 if(typeof window!=='undefined'&&!options.bake)applyObservatoryAO(T,model,{url:new URL('../assets/nestash-ao-v1.bin',import.meta.url)});
 model.userData.animate(0);return model;
}
