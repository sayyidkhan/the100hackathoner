import {earlyStudio,ease} from './early-exhibit-studio.js';
import {propertyScreen,propertyToken} from './propertyguru-screen.js';
import {propertyArchitecture} from './propertyguru-architecture.js';
import {propertySurfaces} from './propertyguru-surfaces.js';
import {applyObservatoryAO} from './astrodegen-occlusion.js';

export const PROPERTY_CYCLE=24;
export function propertyMoment(time){
 const t=((time%PROPERTY_CYCLE)+PROPERTY_CYCLE)%PROPERTY_CYCLE;
 return {t,stage:t<5?0:t<10?1:t<17?2:t<22?3:0,
  propertySignal:ease((t-1)/3.5),enquirySignal:ease((t-5.3)/3.5),
  recommendation:t>=10&&t<22,ready:t>=17&&t<22,
  reveal:ease((t-10)/1.2)*(1-ease((t-22)/1.3))};
}

export function createArtifact(T,options={}){
 const k=earlyStudio(T),{root,m,mesh,box,disk,line,group,rounded,slab,ellipsoid,texture,finish}=k;
 Object.assign(m,{
  concrete:new T.MeshStandardMaterial({color:0xd8d3bf,roughness:.82}),
  mint:new T.MeshStandardMaterial({color:0x739a8d,roughness:.55}),
  red:new T.MeshPhysicalMaterial({color:0xc95d4d,roughness:.42,clearcoat:.3}),
  navy:new T.MeshStandardMaterial({color:0x273e48,roughness:.55}),
  glazing:new T.MeshPhysicalMaterial({color:0x284c51,roughness:.16,metalness:.48,clearcoat:.8}),
  balconyGlass:new T.MeshPhysicalMaterial({color:0x7dada5,transparent:true,opacity:.32,roughness:.12,metalness:.25,depthWrite:false}),
  timber:new T.MeshStandardMaterial({color:0x866146,roughness:.8}),
  clay:new T.MeshStandardMaterial({color:0xb67558,roughness:.82}),
  paving:new T.MeshStandardMaterial({color:0xc2c7bc,roughness:.9}),
  hedge:new T.MeshStandardMaterial({color:0x627852,roughness:.95}),
  leaf:new T.MeshStandardMaterial({color:0x3f7054,roughness:.85,side:T.DoubleSide}),
  grass:new T.MeshStandardMaterial({color:0x9eac8a,roughness:1}),
  pool:new T.MeshPhysicalMaterial({color:0x64b2b4,metalness:.22,roughness:.15,clearcoat:.9}),
  warmWindow:new T.MeshStandardMaterial({color:0xe8ce8f,emissive:0xf5ce79,emissiveIntensity:.16,roughness:.4}),
  coralLight:new T.MeshBasicMaterial({color:0xffa08b,toneMapped:false}),
  blueLight:new T.MeshBasicMaterial({color:0x82c6df,toneMapped:false}),
 });
 m.concrete.bumpMap=texture('stone');m.concrete.bumpScale=.009;m.timber.map=texture('wood');
 propertySurfaces(T,m);
  slab(9.1,5.9,.23,0,.115,0,'stone',root,.10);
 // Individually jointed limestone paving catches the afternoon light.
 for(let v=0;v<3;v++){m['paver'+v]=m.stone.clone();m['paver'+v].onBeforeCompile=m.stone.onBeforeCompile;m['paver'+v].customProgramCacheKey=m.stone.customProgramCacheKey;m['paver'+v].color.setHex([0xe4d5bd,0xddd0ba,0xeaddc8][v]);}
 for(let row=0;row<18;row++)for(let col=0;col<24;col++){
  const x=-4.37+col*.38+(row%2)*.19;if(x>4.37)continue;
  box(.376,.008,.309,x,.25,-2.68+row*.315,'paver'+(row*7+col*3+Math.floor(col/3))%3);
 }

 const labels=[];
 function label(value,w,h,x,y,z,parent=root,color='#344d52'){
  const g=group(x,y,z,parent);labels.push(g);if(typeof document==='undefined')return g;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${c.height*.63}px sans-serif`;ctx.fillText(value,512,c.height/2,990);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const plane=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,toneMapped:false}));plane.userData.noShadow=true;g.add(plane);return g;
 }

 // A shared floor plan, with three clearly grouped residential types.
 slab(2.43,2.0,.035,-3.00,.237,-1.06,'paving',root,.13);
 slab(2.67,2.62,.04,-.23,.24,-.54,'mint',root,.16);
 slab(2.32,1.45,.04,-2.89,.24,1.04,'paving',root,.13);
 function outline(w,d,x,z,mat,parent=root){return line([[x-w/2,.278,z-d/2],[x+w/2,.278,z-d/2],[x+w/2,.278,z+d/2],[x-w/2,.278,z+d/2],[x-w/2,.278,z-d/2]],.013,mat,parent);}
 outline(2.47,2.04,-3.00,-1.06,'navy');outline(2.73,2.68,-.23,-.54,'navy');outline(2.36,1.49,-2.89,1.04,'clay');
 const {foliage}=propertyArchitecture(T,k);
 // The second input: enquiry patterns, shown as linked tokens on a low desk.
 const enquiries=group(.15,.49,2.24);enquiries.rotation.x=-1.0;
 rounded(5.05,.70,.08,0,0,0,'cream',enquiries,.12);
 label('ENQUIRY PATTERNS',2.08,.12,-1.13,.22,.065,enquiries,'#39444d');
 const nodes=[[-1.84,-.08],[-1.20,-.08],[-.56,-.08],[.48,-.08],[1.12,-.08],[1.76,-.08]];
 const nodeLive=[];
 for(let i=0;i<nodes.length;i++){
  const [x,y]=nodes[i];const p=disk(.18,.037,x,y,.078,i<3?'silver':'red',enquiries);p.rotation.x=Math.PI/2;
  const face=disk(.16,.042,x,y,.103,'cream',enquiries);face.rotation.x=Math.PI/2;
  const icon=propertyToken(T,['building','house','search','building','leaf','people'][i]);icon.position.set(x,y,.132);enquiries.add(icon);labels.push(icon);
  if(i%3!==2){const [xx,yy]=nodes[i+1];line([[x,y,.068],[xx,yy,.068]],.012,i<3?'blueLight':'coralLight',enquiries);}
  const live=ellipsoid(x+.29,y,.092,.025,.025,.014,i<3?'blueLight':'coralLight',enquiries);live.name=`property-enquiry-${i}`;nodeLive.push(live);
 }
 // Two independent evidence streams meet before a recommendation can appear.
 const curves=[new T.CatmullRomCurve3([new T.Vector3(-2.88,.26,-.02),new T.Vector3(-1.42,.26,.30),new T.Vector3(-1.15,.26,1.30),new T.Vector3(.85,.26,1.48)]),
  new T.CatmullRomCurve3([new T.Vector3(-.02,.26,2.04),new T.Vector3(.33,.26,2.04),new T.Vector3(.68,.26,1.80),new T.Vector3(.85,.26,1.48)])];
 const pulses=curves.map((curve,i)=>{
  mesh(new T.TubeGeometry(curve,64,.010,8,false),i?'coralLight':'blueLight');
  const p=ellipsoid(...curve.getPoint(0).toArray(),.055,.055,.055,i?'coralLight':'blueLight');p.position.y+=.04;p.name=`property-signal-${i}`;return p;
 });
 disk(.21,.045,.85,.285,1.48,'silver');disk(.17,.048,.85,.289,1.48,'concrete');disk(.036,.052,.85,.30,1.48,'coralLight');
 const halo=group();outline(2.73,2.68,-.23,-.54,'coralLight',halo);k.batch(halo);halo.name='property-selected-outline';
 // A precise enamel location marker instead of an unrelated key or sold badge.
 const pin=group(.35,3.67,-.98);pin.name='property-match-pin';
 const pinShape=new T.Shape();pinShape.moveTo(0,-.23);pinShape.bezierCurveTo(-.05,-.12,-.16,.02,-.16,.12);pinShape.bezierCurveTo(-.16,.34,.16,.34,.16,.12);pinShape.bezierCurveTo(.16,.02,.05,-.12,0,-.23);
 mesh(new T.ExtrudeGeometry(pinShape,{depth:.035,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:3,curveSegments:20}),'red',pin);
 disk(.066,.018,0,.13,.05,'cream',pin).rotation.x=Math.PI/2;
 k.batch(pin);
 // Reimagined search display: ranked homes, not invented performance numbers.
 const display=group(2.85,.23,-.05);display.rotation.y=-.07;display.name='property-search-display';
 for(const x of [-.90,.90])slab(.31,.50,.04,x,.025,-.04,'navy',display,.025);
 for(const x of [-.90,.90])rounded(.11,.39,.12,x,.24,-.04,'silver',display,.025);
 rounded(3.11,3.17,.10,0,1.96,0,'silver',display,.09);rounded(3.06,3.12,.11,0,1.96,.025,'navy',display,.08);
 rounded(2.90,2.94,.02,0,1.96,.102,'cream',display,.055);
 const screen=propertyScreen(T);screen.group.position.set(0,1.96,.154);display.add(screen.group);
 line([[.85,.26,1.48],[1.35,.26,1.45],[1.74,.26,1.00],[2.55,.26,.60]],.010,'coralLight');
 line([[.85,.26,1.48],[1.08,.26,1.96],[3.78,.26,2.02],[4.0,.26,.56],[3.56,.26,.45]],.009,'blueLight');
 const toScreen=new T.CatmullRomCurve3([new T.Vector3(.85,.30,1.48),new T.Vector3(1.4,.30,1.45),new T.Vector3(1.73,.30,1),new T.Vector3(2.55,.30,.60)]);
 const resultPulse=ellipsoid(.85,.30,1.48,.055,.055,.055,'coralLight');resultPulse.name='property-result-signal';

 const out=finish(3,[foliage,...labels,display,...pulses,...nodeLive,halo,pin,resultPulse]);
 const origin=pulses[0].position.clone().sub(curves[0].getPoint(0).add(new T.Vector3(0,.04,0))),pinRest=pin.position.clone();
 out.traverse(o=>{if(o.isMesh&&[m.coralLight,m.blueLight,m.balconyGlass].includes(o.material)){o.castShadow=false;o.receiveShadow=false;o.userData.noShadow=true;}});
 Object.assign(out.userData,{studioProfile:'propertyguru',initialYaw:.38,initialElevation:.38,cameraFitSway:0,autoOrbit:false,cycle:PROPERTY_CYCLE});
 // Fit the occupied architectural volumes, avoiding the empty upper-front
 // corners of the board's overall box. These bounds also work during orbit.
 const framing=[];
 for(const [min,max] of [
  [[-4.57,0,-2.97],[4.57,.28,2.97]],
  [[-4.30,.28,-2.01],[-1.78,3.66,-.68]],
  [[-1.48,.28,-1.65],[1.04,3.65,.46]],
  [[1.24,.23,-.29],[4.45,3.83,.23]],
  [[-4.5,.28,-2.1],[1.45,1.62,1.98]],
  [[.17,3.46,-1.01],[.53,4.25,-.91]],
 ])for(const x of [min[0],max[0]])for(const y of [min[1],max[1]])for(const z of [min[2],max[2]])framing.push(new T.Vector3(x,y,z));
 out.userData.framingPoints=framing;
 for(const o of out.children)if(o.isMesh&&!o.material.isMeshBasicMaterial&&!o.material.transparent)o.userData.observatoryAO=true;
 if(typeof window!=='undefined'&&!options.bake)applyObservatoryAO(T,out,{url:new URL('../assets/propertyguru-ao-v1.bin',import.meta.url)});
 const stories=[['Find similar properties','Group listings by their shared characteristics.'],['Learn from enquiry patterns','Use similarities in past enquiries as a second recommendation signal.'],['Curate the shortlist','Combine property similarities and enquiry patterns to surface relevant homes.'],['Make the next step easier','The goal: help visitors move from browsing to making an enquiry.']];
 out.userData.animate=time=>{
  const s=propertyMoment(time);screen.update(s.stage);
  pulses.forEach((p,i)=>{const v=i?s.enquirySignal:s.propertySignal;p.visible=v>0&&v<1;p.position.copy(curves[i].getPointAt(v)).add(origin);p.position.y+=.04;});
  nodeLive.forEach((p,i)=>{p.visible=s.t>=5.3+i*.45&&s.t<22;});
  halo.visible=s.recommendation;pin.visible=s.recommendation;pin.position.copy(pinRest);pin.position.y+=.28*(1-ease((s.t-10)/1.2));pin.scale.setScalar(Math.max(.001,s.reveal));
  resultPulse.visible=s.t>=9&&s.t<10;resultPulse.position.copy(toScreen.getPointAt(ease(s.t-9))).add(origin);
  m.warmWindow.emissiveIntensity=.16+.32*s.reveal;
  const story=stories[s.stage];out.userData.story={index:s.stage,step:`0${s.stage+1} / 04`,title:story[0],detail:story[1],tone:s.recommendation?'complete':'neutral'};
 };
 out.userData.animate(0);return out;
}
