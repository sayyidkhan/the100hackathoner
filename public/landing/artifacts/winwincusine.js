import {earlyStudio,ease} from './early-exhibit-studio.js';
import {cuisineScreen} from './winwincusine-screen.js';

export const CUISINE_CYCLE=22;
export function cuisineMoment(time){
 const t=((time%CUISINE_CYCLE)+CUISINE_CYCLE)%CUISINE_CYCLE;
 const arrivals=[2.6,4.4,6.2];
 return {t,count:arrivals.filter(v=>t>=v).length,matched:t>=9&&t<20,
  journey:arrivals.map(v=>ease((t-v+1.5)/1.5)),reveal:ease((t-9)/1.2)*(1-ease((t-20)/1.4)),
  index:t<6.2?0:t<9?1:t<20?2:0};
}

export function createArtifact(T){
 const k=earlyStudio(T),{root,m,mesh,box,disk,line,group,rounded,slab,ring,ellipsoid,texture,finish}=k;
 Object.assign(m,{
  plaster:new T.MeshStandardMaterial({color:0xd6a083,roughness:.9}),
  mint:new T.MeshStandardMaterial({color:0x6b9981,roughness:.7}),
  jadeTile:new T.MeshPhysicalMaterial({color:0x29685d,roughness:.27,clearcoat:.55}),
  warm:new T.MeshStandardMaterial({color:0xead9b7,roughness:.8}),
  timber:new T.MeshStandardMaterial({color:0x795337,roughness:.6}),
  roast:new T.MeshStandardMaterial({color:0x453224,roughness:.6}),
  terracotta:new T.MeshStandardMaterial({color:0xb75f3f,roughness:.85}),
  coral:new T.MeshStandardMaterial({color:0xd47759,roughness:.68}),
  saffron:new T.MeshStandardMaterial({color:0xd2a34c,roughness:.68}),
  ceramic:new T.MeshPhysicalMaterial({color:0xf1eee0,roughness:.22,clearcoat:.6}),
  cobalt:new T.MeshStandardMaterial({color:0x2b5865,roughness:.4}),
  rice:new T.MeshStandardMaterial({color:0xf7efdc,roughness:.9}),
  broth:new T.MeshPhysicalMaterial({color:0xc58d3c,roughness:.24,clearcoat:.7}),
  leaf:new T.MeshStandardMaterial({color:0x3a6c45,roughness:.85,side:T.DoubleSide}),
  leafLight:new T.MeshStandardMaterial({color:0x789449,roughness:.8,side:T.DoubleSide}),
  glow:new T.MeshBasicMaterial({color:0xa9f0c6,toneMapped:false}),
  bulb:new T.MeshStandardMaterial({color:0xffe3a1,emissive:0xffbe60,emissiveIntensity:.5,roughness:.3}),
  window:new T.MeshStandardMaterial({color:0x8d7954,emissive:0xe3a754,emissiveIntensity:.18,roughness:.6}),
  glass:new T.MeshPhysicalMaterial({color:0xd6ece4,transparent:true,opacity:.3,roughness:.15,metalness:.1,depthWrite:false,side:T.DoubleSide}),
 });
 const wood=texture('wood');m.timber.map=wood;m.timber.bumpMap=wood;m.timber.bumpScale=.012;
 m.plaster.bumpMap=texture('stone');m.plaster.bumpScale=.014;
 const cloth=texture('cloth');for(const name of ['coral','mint','saffron']){m[name].bumpMap=cloth;m[name].bumpScale=.003;}
 // A speckled courtyard floor keeps the shared table grounded in an everyday place.
 const n=256,data=new Uint8Array(n*n*4);let seed=21;
 for(let i=0;i<n*n;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=seed/4294967296;const c=v>.985?[97,124,106]:v>.96?[178,112,83]:[229+v*9,216+v*9,194+v*9];for(let j=0;j<3;j++)data[i*4+j]=c[j];data[i*4+3]=255;}
 const terrazzo=new T.DataTexture(data,n,n);terrazzo.colorSpace=T.SRGBColorSpace;terrazzo.wrapS=terrazzo.wrapT=T.RepeatWrapping;terrazzo.repeat.set(3,2);terrazzo.generateMipmaps=true;terrazzo.minFilter=T.LinearMipmapLinearFilter;terrazzo.magFilter=T.LinearFilter;terrazzo.needsUpdate=true;
 m.terrazzo=new T.MeshStandardMaterial({map:terrazzo,roughness:.8});
 slab(9.2,5.8,.20,0,.10,0,'terrazzo',root,.6);
 const labels=[];
 function label(text,w,h,x,y,z,fg='#244638',bg=null,parent=root){
  const g=group(x,y,z,parent);labels.push(g);if(typeof document==='undefined')return g;
  const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024*h/w));const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);}ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${c.height*.64}px sans-serif`;ctx.fillText(text,512,c.height/2,980);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:!bg,toneMapped:false}));o.userData.noShadow=true;g.add(o);return g;
 }
 // Two-storey shophouse: a genuinely open lower floor, recessed windows and louvres.
 const shop=group(-.25,.21,-1.48);shop.name='cuisine-kopitiam';
 slab(5.3,1.95,.12,0,.06,0,'stone',shop,.02);
 box(5.15,3.9,.12,0,2.0,-.84,'plaster',shop);
 for(const x of [-2.55,2.55]){
  box(.20,3.92,1.85,x,2.0,0,'warm',shop);
  for(const y of [.23,2.13,3.92])box(.31,.15,1.99,x,y,0,'cream',shop);
  box(.32,.44,1.99,x,.32,0,'stone',shop);
  for(let i=0;i<4;i++)box(.24,.035,.04,x,3.5+i*.075,1.0,'cream',shop);
 }
 box(5.0,1.55,.20,0,3.10,.84,'plaster',shop);
 box(5.32,.12,2.03,0,2.25,0,'cream',shop);
 box(5.41,.12,2.09,0,3.96,0,'cream',shop);
 // Quiet decorative tile frieze, each motif in glazed ceramic.
 for(let i=0;i<18;i++){
  const x=-2.37+i*.28;box(.265,.22,.025,x,2.44,.965,'ceramic',shop);
  const flower=box(.07,.07,.012,x,2.44,.986,i%2?'jadeTile':'terracotta',shop);flower.rotation.z=Math.PI/4;
 }
 for(const x of [-1.65,0,1.65]){
  rounded(1.18,1.16,.07,x,3.20,.973,'stone',shop,.13);
  rounded(.96,.99,.04,x,3.20,1.02,'roast',shop,.12);
  rounded(.79,.84,.018,x,3.21,1.046,'window',shop,.10);
  box(.035,.85,.035,x,3.20,1.07,'timber',shop);box(.83,.035,.035,x,3.20,1.07,'timber',shop);
  for(const side of [-1,1]){
   const shutter=group(x+side*.55,3.18,1.12,shop);shutter.rotation.y=side*.26;
   box(.32,1.04,.065,0,0,0,'mint',shutter);
   for(let j=0;j<12;j++){const l=box(.26,.033,.09,0,-.42+j*.077,.04,'mint',shutter);l.rotation.x=.4;}
   for(const sx of [-.14,.14])box(.025,1.02,.025,sx,0,.063,'warm',shutter);
  }
  box(1.30,.08,.32,x,2.63,1.10,'cream',shop);
 }
 // Overlapping half-round clay roof tiles, ridge and a deep cornice.
 for(let x=-2.62;x<2.7;x+=.20)for(let j=0;j<4;j++){
  const tile=mesh(new T.CylinderGeometry(.105,.112,.44,10,1,true,Math.PI/2,Math.PI),'terracotta',shop);tile.rotation.x=Math.PI/2+.20;tile.position.set(x,4.35-j*.085,-.65+j*.42);
 }
 const roof=box(5.65,.065,2.0,0,4.17,.0,'roast',shop);roof.rotation.x=.20;
 for(let i=0;i<28;i++)box(.08,.08,.17,-2.67+i*.198,3.91,1.04,'cream',shop);
 // Interior tiles, timber counter, shelving and mugs.
 for(let x=-2.36;x<2.4;x+=.31)for(let y=.27;y<1.2;y+=.31)box(.294,.294,.025,x,y,-.76,'jadeTile',shop);
 for(let i=0;i<16;i++)for(let j=0;j<5;j++)box(.30,.012,.30,-2.32+i*.31,.13,-.65+j*.31,(i+j)%2?'cream':'mint',shop);
 for(const x of [-1.85,1.85]){
  box(.90,.05,.29,x,1.52,-.58,'timber',shop);box(.90,.05,.29,x,1.04,-.58,'timber',shop);
  for(let j=0;j<4;j++){disk(.065,.13,x-.3+j*.2,1.61,-.58,'ceramic',shop);ring(.05,.008,x-.3+j*.2+.06,1.62,-.58,'ceramic',shop);}
 }
 rounded(1.38,.72,.61,1.45,.53,-.25,'timber',shop,.04);
 slab(1.5,.72,.06,1.45,.92,-.25,'stone',shop,.025);
 for(let j=0;j<10;j++)box(.018,.60,.015,.84+j*.135,.53,.066,'warm',shop);
 rounded(.72,.92,.04,-.90,1.40,-.75,'roast',shop,.025);
 for(let j=0;j<5;j++)box(.46,.016,.01,-.9,1.65-j*.13,-.72,'warm',shop);
 // Timber doors fold out to the sides; the restaurant remains visibly accessible.
 for(const side of [-1,1]){
  const door=group(side*2.16,1.04,.99,shop);door.rotation.y=side*.40;
  box(.57,1.87,.09,0,0,0,'timber',door);
  for(const y of [-.52,.30]){box(.42,.63,.018,0,y,.055,'roast',door);for(const xx of [-.20,.20])box(.023,.63,.025,xx,y,.07,'warm',door);}
  const handle=ring(.055,.008,-side*.18,0,.076,'brass',door);handle.scale.y=2;
 }
 // Fabric awning with scalloped valance and support struts.
 for(let i=0;i<16;i++){
  const x=-2.48+i*.33,canopy=box(.327,.065,.96,x,2.39,1.24,i%2?'cream':'mint',shop);canopy.rotation.x=.23;
  rounded(.327,.23,.035,x,2.20,1.72,i%2?'cream':'mint',shop,.06);
 }
 for(const x of [-2.48,2.48])line([[x,1.82,1.0],[x,2.16,1.72],[x,2.52,.84]],.017,'timber',shop);
 rounded(3.52,.30,.08,0,1.88,1.76,'timber',shop,.035);
 rounded(3.40,.23,.018,0,1.88,1.811,'warm',shop,.02);
 label('GOOD TOGETHER',3.12,.18,0,1.88,1.84,'#503d29',null,shop);
 for(const x of [-1.30,0,1.30]){
  line([[x,2.22,.23],[x,1.75,.23]],.011,'roast',shop);
  mesh(new T.ConeGeometry(.16,.13,24),'brass',shop).position.set(x,1.72,.23);
  ellipsoid(x,1.64,.23,.085,.11,.085,'bulb',shop);
 }
 // The communal table: porcelain dishes and differently coloured seats.
 const table=group(0,.21,1.13);disk(1.20,.13,0,1.03,0,'timber',table);disk(1.17,.018,0,1.107,0,'timber',table);
 for(const x of [-.73,.73])for(const z of [-.58,.58]){
  line([[x*.80,.08,z*.80],[x,.97,z]],.055,'timber',table);
  box(.055,.08,1.2,x,.75,0,'timber',table);
 }
 for(const [x,z,color] of [[-1.1,.53,'coral'],[0,1.18,'mint'],[1.1,.53,'saffron']]){
  disk(.37,.10,x,.59,z,'timber',table);disk(.35,.12,x,.69,z,color,table);
  for(let j=0;j<3;j++){const a=j*Math.PI*2/3;line([[x+Math.cos(a)*.29,.05,z+Math.sin(a)*.29],[x+Math.cos(a)*.21,.55,z+Math.sin(a)*.21]],.035,'timber',table);}
 }
 const dishes=group(0,1.33,1.13);dishes.name='cuisine-shared-meal';
 function bowl(x,z,kind){
  const g=group(x,0,z,dishes),profile=[[0,0],[.20,.005],[.30,.06],[.36,.17],[.37,.22],[.35,.23],[.33,.18],[.28,.09],[0,.07]].map(p=>new T.Vector2(...p));
  mesh(new T.LatheGeometry(profile,40),'ceramic',g);
  const lip=ring(.36,.009,0,.22,0,'cobalt',g);lip.rotation.x=Math.PI/2;
  disk(.31,.013,0,.16,0,kind===0?'broth':'rice',g);
  for(let j=0;j<8;j++){
   const a=j*2.399,r=.08+.12*((j%3)/2);
   if(kind===0)line([[Math.cos(a)*r,.18,Math.sin(a)*r],[Math.cos(a+.5)*r,.21,Math.sin(a+.5)*r],[Math.cos(a+1)*r,.18,Math.sin(a+1)*r]],.014,'rice',g);
   else ellipsoid(Math.cos(a)*r,.20,Math.sin(a)*r,.09,.06,.06,kind===1?'leaf':'broth',g);
  }
  for(let j=0;j<4;j++)ellipsoid(-.16+j*.10,.22,-.08,.035,.022,.035,'terracotta',g);
  if(kind===0){ellipsoid(.12,.21,.12,.09,.03,.12,'rice',g);ellipsoid(.12,.24,.12,.05,.015,.06,'saffron',g);}
  for(let j=0;j<2;j++)line([[-.40-j*.035,.025,-.29],[.17-j*.035,.025,-.51]],.012,'timber',g);
 }
 bowl(-.58,-.28,0);bowl(0,.37,1);bowl(.57,-.28,2);
 for(const x of [-.39,.39]){
  mesh(new T.CylinderGeometry(.09,.07,.26,24,1,true),'glass',dishes).position.set(x,.13,-.63);
  const rim=ring(.09,.006,x,.265,-.63,'ceramic',dishes);rim.rotation.x=Math.PI/2;
  disk(.075,.01,x,.10,-.63,'broth',dishes);
 }
 k.batch(dishes);
 // Three preference cards stay associated with three paths and seats.
 const colors=['coral','mint','saffron'];const routes=[],tokens=[],badges=[];
 slab(2.14,.43,.16,-3.10,.30,1.23,'dark',root,.07);
 for(let i=0;i<3;i++){
  const x=-3.80+i*.7,y=.99+Math.sin(i)*.08;
  const card=group(x,y,1.25);card.rotation.z=(1-i)*.07;
  rounded(.65,1.24,.07,0,0,0,'warm',card,.10);
  const avatar=disk(.17,.018,0,.30,.05,colors[i],card);avatar.rotation.x=Math.PI/2;
  ellipsoid(0,.345,.073,.047,.053,.015,'cream',card);ellipsoid(0,.245,.073,.08,.055,.014,'cream',card);
  label(['NOODLES','VEGGIE','MILD'][i],.56,.10,0,-.40,.06,'#30483b',null,card);
  if(i===0){const b=mesh(new T.SphereGeometry(.13,20,12,0,Math.PI*2,Math.PI/2,Math.PI/2),'timber',card);b.position.set(0,-.09,.07);b.scale.z=.28;for(let j=0;j<3;j++)line([[-.07+j*.06,-.08,.095],[-.05+j*.06,.0,.095]],.009,'brass',card);}
  if(i===1){for(const s of [-1,1]){const leaf=ellipsoid(s*.055,-.05,.083,.05,.11,.015,'leaf',card);leaf.rotation.z=-s*.5;}line([[0,-.2,.09],[0,.04,.09]],.008,'leaf',card);}
  if(i===2)line([[-.10,-.15,.09],[0,-.11,.09],[.09,.02,.09]],.033,'saffron',card);
  const path=new T.CatmullRomCurve3([new T.Vector3(x,.24,1.3),new T.Vector3(x,.24,1.91+i*.16),new T.Vector3(-2.05,.24,2.19),new T.Vector3(-1.62,.24,1.65)]);
  mesh(new T.TubeGeometry(path,48,.025,8,false),colors[i]);routes.push(path);
  const token=ellipsoid(x,.29,1.3,.07,.07,.07,colors[i]);token.name=`cuisine-preference-${i}`;tokens.push(token);
  const badge=ellipsoid(x,.46,1.35,.04,.04,.04,'glow');badges.push(badge);
 }
 const halo=ring(1.68,.015,0,.235,1.13,'glow');halo.rotation.x=Math.PI/2;halo.name='cuisine-table-halo';
 disk(.14,.025,-1.62,.25,1.65,'mint');
 // Result phone is compact, clean and always readable.
 const phone=group(3.14,.21,1.0);phone.rotation.y=-.10;phone.name='cuisine-result-phone';
 slab(1.92,.80,.20,0,.1,0,'terrazzo',phone,.14);
 rounded(1.65,2.68,.15,0,1.54,0,'silver',phone,.17);rounded(1.61,2.64,.16,0,1.54,.025,'dark',phone,.16);
 rounded(1.49,2.48,.025,0,1.54,.12,'warm',phone,.13);
 const screen=cuisineScreen(T);screen.group.position.set(0,1.54,.16);phone.add(screen.group);
 rounded(.40,.065,.012,0,2.73,.159,'dark',phone,.03);
 box(.025,.25,.05,-.84,2.22,0,'silver',phone);
 // Broad tropical foliage rather than low-poly sphere trees.
 for(const px of [-3.38,3.10]){
  const pz=-.76;disk(.32,.49,px,.47,pz,'stone');disk(.28,.014,px,.72,pz,'roast');
  for(let i=0;i<9;i++){
   const a=i*2.399,yy=1.05+(i%4)*.25,x=px+Math.cos(a)*.33,z=pz+Math.sin(a)*.27;
   line([[px,.70,pz],[x,yy-.15,z],[x,yy+.15,z]],.009,'leaf');
   const geo=new T.PlaneGeometry(.30,.69,6,12),pos=geo.attributes.position;
   for(let j=0;j<pos.count;j++){const v=(pos.getY(j)+.345)/.69;pos.setX(j,pos.getX(j)*Math.sin(Math.PI*v)**.7);pos.setZ(j,.09*Math.sin(Math.PI*v));}geo.computeVertexNormals();
   const leaf=mesh(geo,i%3?'leaf':'leafLight');leaf.position.set(x,yy,z);leaf.rotation.set(.2,a,Math.sin(a)*.45);
  }
 }
 const practicals=[];
 for(const x of [-1.3,1.3]){const light=new T.PointLight(0xffce86,1.3,3.5,2);light.position.set(x,1.72,.25);shop.add(light);practicals.push(light);}
 const output=finish(21,[...labels,dishes,phone,halo,...tokens,...badges,...practicals]);
 const offset=tokens[0].position.clone().sub(routes[0].getPoint(0).add(new T.Vector3(0,.05,0))),mealScale=dishes.scale.clone();
 const stories=[['Everyone gets a say','Three friends share what they feel like eating.'],['Bring the tastes together','WinWinCusine combines the group’s food preferences.'],['Find a place for the whole group','One recommendation brings everyone to the same table.']];
 Object.assign(output.userData,{studioProfile:'winwincusine',initialYaw:-.12,initialElevation:.26,autoOrbit:false,cycle:CUISINE_CYCLE});
 output.traverse(o=>{if(o.isMesh&&(o.material===m.glow||o.material===m.glass)){o.castShadow=false;o.receiveShadow=false;}});
 output.userData.animate=time=>{
  const s=cuisineMoment(time);screen.update(s.t>=20?0:s.count,s.matched);
  tokens.forEach((o,i)=>{o.visible=s.journey[i]>0&&s.journey[i]<1;o.position.copy(routes[i].getPointAt(s.journey[i])).add(offset);o.position.y+=.05;});
  badges.forEach((o,i)=>{o.visible=s.t<20&&s.count>i;});
  halo.visible=s.t>=6.2&&s.t<20;halo.scale.setScalar(1+.018*Math.sin(s.t*2));
  dishes.visible=s.reveal>.001;dishes.scale.copy(mealScale).multiplyScalar(Math.max(.001,s.reveal));
  m.bulb.emissiveIntensity=.5+s.reveal*1.0;m.window.emissiveIntensity=.18+s.reveal*.32;
  const story=stories[s.index];output.userData.story={index:s.index,step:`0${s.index+1} / 03`,title:story[0],detail:story[1],tone:s.matched?'complete':'neutral'};
 };
 output.userData.animate(0);return output;
}
