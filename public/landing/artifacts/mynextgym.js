import { medivoiceStudio } from './medivoice-studio.js';
import { pestSurfaces } from './pestoverflow-surfaces.js';
import { createGymScreen } from './mynextgym-app-screen.js';

// Source-backed location analytics, with footfall explicitly clarified by the owner.
// Routes, candidate sites and strengths illustrate the workflow, not measured data.
export const MYNEXTGYM_CYCLE = 24;
const ease = value => { const x=Math.max(0,Math.min(1,value));return x*x*x*(x*(x*6-15)+10); };
export const CANDIDATES = [
  {id:'A',x:-2.90,z:.55,strength:12/36,footfall:12,sources:['transit'],quality:'LOW'},
  {id:'B',x:-1.15,z:.90,strength:1,footfall:36,sources:['transit','offices','homes'],quality:'HIGH'},
  {id:'C',x:.35,z:.45,strength:20/36,footfall:20,sources:['offices'],quality:'MEDIUM'},
];
export function gymMoment(time) {
  const t=((time%MYNEXTGYM_CYCLE)+MYNEXTGYM_CYCLE)%MYNEXTGYM_CYCLE;
  const fade=1-ease((t-22)/2),index=t<8?0:t<12?1:t<15?2:t<21?3:4;
  return {t,index,phase:['footfall','compare','selected','reveal','review'][index],
    counts:CANDIDATES.map(c=>Math.floor(c.footfall*Math.min(1,t/8))),
    accumulation:Math.min(1,t/8),comparison:t>=8&&t<12?Math.min(2,Math.floor((t-8)/ (4/3))):-1,
    selection:ease((t-12)/2),reveal:ease((t-15)/2.5),fade};
}
export function createArtifact(T) {
  const {root,materials:m,mesh,box,disk,ball,line,texture,finish,batch}=medivoiceStudio(T);
  const material=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  Object.assign(m,{stone:material(0xd9c8aa,.84),cream:material(0xf2e5ce,.74),brass:material(0xb89459,.34,.6),
    ink:material(0x12262c,.52),map:material(0x182c3b,.76),road:material(0x66716f,.8),teal:material(0x4aaba0,.55),
    amber:material(0xe2b764,.50),coral:material(0xc75f43,.56),glass:material(0x335459,.32,.12),
    signal:new T.MeshStandardMaterial({color:0xf6cf86,emissive:0xc09042,emissiveIntensity:.3,roughness:.5}),
    contour:material(0x294b53,.9),park:material(0x4f6855,.9),foliage:material(0x72876a,.85),cyan:new T.MeshStandardMaterial({color:0x73e4d6,emissive:0x2cbfaf,emissiveIntensity:.45,roughness:.5})});
  const stone=texture('stone');m.cream.bumpMap=stone;m.cream.bumpScale=.007;
  const surfaces=pestSurfaces(T);Object.assign(m.stone,surfaces.stone);m.stone.color.setHex(0xffffff);m.stone.roughness=1;m.stone.bumpScale=.012;
  for(const family of [surfaces.oak,surfaces.plaster])for(const tex of Object.values(family))tex.dispose();
  m.glazing=new T.MeshPhysicalMaterial({color:0x8ab8bb,transparent:true,opacity:.26,roughness:.14,metalness:.06,depthWrite:false,side:T.DoubleSide});
  m.floor=new T.MeshStandardMaterial({color:0xc99f64,roughness:.78});
  Object.assign(m,{brick:material(0xb78269,.88),limestone:material(0xe5ded1,.85),concrete:material(0xa5b3b0,.85),frame:material(0x40545a,.48,.3),bark:material(0x80674f,.95),leafDark:material(0x476859,.9),warmWindow:new T.MeshStandardMaterial({color:0xe7c28b,emissive:0xb98a45,emissiveIntensity:.18,roughness:.45}),paving:material(0xb3b4a4,.94)});
  m.glass.roughness=.22;m.glass.metalness=.35;
  const reflectionData=new Uint8Array(64*128*4);
  for(let y=0;y<128;y++)for(let x=0;x<64;x++){
    const light=.70+y/128*.35+Math.sin(x*.075+y*.015)*.08,i=(y*64+x)*4;
    reflectionData[i]=71*light;reflectionData[i+1]=102*light;reflectionData[i+2]=113*light;reflectionData[i+3]=255;
  }
  const reflection=new T.DataTexture(reflectionData,64,128);reflection.colorSpace=T.SRGBColorSpace;reflection.magFilter=T.LinearFilter;reflection.needsUpdate=true;m.glass.map=reflection;m.glass.color.setHex(0xffffff);


  const preserved=[];
  function group(x=0,y=0,z=0,parent=root){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
  function rounded(w,h,d,x,y,z,key,parent=root,r=.05){
    r=Math.min(r,w*.45,h*.45);const s=new T.Shape();
    s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
    s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:8}),key,parent);o.geometry.translate(0,0,-d/2);o.position.set(x,y,z);return o;
  }
  function slab(w,d,h,x,y,z,key,parent=root,r=.05){const o=rounded(w,d,h,x,y,z,key,parent,r);o.rotation.x=-Math.PI/2;return o;}
  function ring(r,t,x,y,z,key,parent=root){const o=mesh(new T.TorusGeometry(r,t,8,64),key,parent);o.position.set(x,y,z);o.rotation.x=-Math.PI/2;return o;}
  function label(text,w,h,x,y,z,parent=root,color='#dfc18a',preserve=true){
    if(typeof document==='undefined')return;
    const c=document.createElement('canvas');c.width=768;c.height=Math.max(16,Math.round(768*h/w));const ctx=c.getContext('2d');let font=c.height*.76;ctx.font=`600 ${font}px sans-serif`;font=Math.min(font,font*(c.width*.93)/ctx.measureText(text).width);ctx.fillStyle=color;ctx.font=`600 ${font}px sans-serif`;ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillText(text,c.width/2,c.height*.52);
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
    const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);o.userData.noShadow=true;parent.add(o);if(preserve)preserved.push(o);return o;
  }
  // One continuous architectural site model. The city is the focal point.
  // The footprint follows the district and the console; no unused front apron.
  const siteOutline=new T.Shape();siteOutline.moveTo(-3.72,-2.02);siteOutline.lineTo(.99,-2.02);siteOutline.quadraticCurveTo(1.20,-2.02,1.20,-1.81);siteOutline.lineTo(1.20,-.87);siteOutline.quadraticCurveTo(1.20,-.64,1.43,-.64);siteOutline.lineTo(2.98,-.64);siteOutline.quadraticCurveTo(3.20,-.64,3.20,-.42);siteOutline.lineTo(3.20,1.80);siteOutline.quadraticCurveTo(3.20,2.02,2.98,2.02);siteOutline.lineTo(-3.72,2.02);siteOutline.quadraticCurveTo(-3.94,2.02,-3.94,1.80);siteOutline.lineTo(-3.94,-1.80);siteOutline.quadraticCurveTo(-3.94,-2.02,-3.72,-2.02);
  const siteGeometry=new T.ExtrudeGeometry(siteOutline,{depth:.20,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:3,curveSegments:12});siteGeometry.rotateX(-Math.PI/2);const siteBase=mesh(siteGeometry,'stone');siteBase.position.y=.35;

  slab(4.92,3.72,.024,-1.25,.554,0,'map',root,.10);
  // App toolbar lies on the map, with labels drawn as crisp UI lettering.
  function mapText(text,w,x,z,color='#e9dbc1',h=.13){const o=label(text,w,h,x,.575,z,root,color);if(o)o.rotation.x=-Math.PI/2;}

  mapText('PEDESTRIAN FLOWS',1.53,-2.70,1.63,'#dfb76e',.12);
  mapText('ILLUSTRATIVE SCENARIO',1.55,-.35,1.63,'#aac7c0',.10);
  // Street fabric is a flat map layer; small urban models remain contextual.
  for(const x of [-3.05,-1.32,.22])slab(.20,2.55,.009,x,.565,.12,'road',root,.015);
  for(const z of [-.71,-.05,.66,1.25])slab(4.25,.17,.009,-1.35,.566,z,'road',root,.015);
  for(const [x,z,w,d] of [[-2.25,-.38,.78,.35],[-2.20,.33,.63,.36],[-.51,-.38,.78,.35],[-.51,1.10,.62,.29],[-3.40,.30,.27,.40]]){
    slab(w,d,.008,x,.569,z,'ink',root,.045);
  }
  // Soft density fields convey pedestrian concentration instead of radar rings.
  const heatSize=128,heatData=new Uint8Array(heatSize*heatSize*4);
  for(let y=0;y<heatSize;y++)for(let x=0;x<heatSize;x++){
    const dx=(x-63.5)/63.5,dy=(y-63.5)/63.5,r=Math.sqrt(dx*dx+dy*dy),i=(y*heatSize+x)*4;
    heatData[i]=92;heatData[i+1]=224;heatData[i+2]=190;heatData[i+3]=Math.round(Math.max(0,Math.exp(-r*r*4.8)-.009)*140);
  }
  const heatMap=new T.DataTexture(heatData,heatSize,heatSize);heatMap.needsUpdate=true;heatMap.colorSpace=T.SRGBColorSpace;
  const densityFields=[];
  for(const [i,c] of CANDIDATES.entries()){
    const radius=i===1?.87:.45;
    const heat=new T.Mesh(new T.PlaneGeometry(radius*2,radius*2),new T.MeshBasicMaterial({map:heatMap,transparent:true,depthWrite:false,toneMapped:false,opacity:i===1?1:.48}));
    heat.rotation.x=-Math.PI/2;heat.position.set(c.x,.585,c.z);heat.userData.noShadow=true;root.add(heat);preserved.push(heat);
    densityFields.push(heat);
    // One irregular edge traces the catchment without concentric circles.
    const points=Array.from({length:45},(_,j)=>{const a=j/44*Math.PI*2,r=radius*(.60+.055*Math.sin(a*3)+.04*Math.cos(a*5));return[c.x+Math.cos(a)*r,.586,c.z+Math.sin(a)*r*.68];});line(points,.005,i===1?'teal':'contour');
  }
  // Three labelled origins: sources of pedestrian activity, not measured counts.
  const origins=[{id:'transit',x:-3.0,z:-1.12,label:'TRANSIT'},{id:'offices',x:-1.4,z:-1.12,label:'OFFICES'},{id:'homes',x:.35,z:-1.12,label:'HOMES'}];
  function originBuilding(x,z,w,d,h,office=false){
    slab(w+.07,d+.07,.03,x,.58,z,'stone');
    rounded(w,h,d,x,.60+h/2,z,'glass',root,.015);
    const rows=office?9:6,columns=office?4:3;
    for(const side of [-1,1]){
      for(let col=0;col<=columns;col++)box(.018,h,.035,x-w/2+col*w/columns,.60+h/2,z+side*(d/2+.01),'cream');
      for(let row=0;row<=rows;row++)box(w+.035,.024,.04,x,.60+row*h/rows,z+side*(d/2+.012),'cream');
      for(let row=0;row<rows;row++)for(let col=0;col<columns;col++)if((row+col)%3===0)box(w/columns*.65,h/rows*.64,.008,x-w/2+(col+.5)*w/columns,.60+(row+.5)*h/rows,z+side*(d/2+.024),'warmWindow');
      for(let row=0;row<=rows;row++)box(.04,.02,d,x+side*w/2,.60+row*h/rows,z,'stone');
    }
    slab(w+.06,d+.06,.04,x,.62+h,z,'cream');slab(w*.76,d*.70,.018,x,.65+h,z,'road');
    for(const side of [-1,1]){box(w,.07,.025,x,.68+h,z+side*d*.47,'cream');box(.025,.07,d,x+side*w*.47,.68+h,z,'cream');}
    rounded(w*.38,.10,d*.35,x+w*.13,.70+h,z,'stone',root,.01);
    for(let j=0;j<5;j++)box(.006,.04,d*.30,x+w*.02+j*.025,.77+h,z,'brass');
    slab(w*.50,.17,.02,x,.84,z+d*.5+.035,'cream');
    for(const side of [-1,1])box(.045,h,.045,x+side*(w/2-.02),.60+h/2,z+d/2+.02,'frame');
    for(let j=0;j<3;j++)box(w*.2,.11,.012,x+(j-1)*w*.28,.68,z+d/2+.035,'warmWindow');
    slab(w+.08,.12,.035,x,.82,z+d/2+.06,'frame');
    if(!office)for(let row=1;row<rows;row++){
      slab(w*.90,.085,.022,x,.62+row*h/rows,z+d/2+.035,'limestone');
      box(w*.88,.035,.012,x,.66+row*h/rows,z+d/2+.075,'frame');
      for(const side of [-1,1])box(.012,.035,.07,x+side*w*.42,.66+row*h/rows,z+d/2+.045,'frame');
    }

  }
  origins.forEach((o,i)=>{
    disk(.13,.025,o.x,.594,o.z,'amber');
    const badge=group(o.x,i===1?2.48:i===2?2.02:1.65,o.z+.09);
    rounded(.94,.22,.035,0,0,0,'ink',badge,.045);label(o.label,.84,.15,0,0,.042,badge,'#f0e6ce');
    if(i===0){
      // Arched glazed railway concourse, curved ribs, platform and small train.
      const station=group(o.x,.60,o.z-.32);slab(.95,.62,.04,0,0,0,'cream',station);
      for(const x of [-.43,.43])box(.025,.30,.025,x,.15,0,'brass',station);
      const roof=mesh(new T.CylinderGeometry(.44,.44,.56,28,1,true,0,Math.PI),'glazing',station);
      roof.rotation.x=Math.PI/2;roof.rotation.z=Math.PI/2;roof.position.y=.30;
      for(const z of [-.28,-.14,0,.14,.28]){
        const arch=Array.from({length:21},(_,j)=>{const a=j/20*Math.PI;return[Math.cos(a)*.44,.30+Math.sin(a)*.40,z];});line(arch,.009,'brass',station);
        for(const x of [-.43,.43])line([[x,0,z],[x,.30,z]],.009,'brass',station);
      }
      for(const x of [-.27,-.09,.09,.27])line([[x,.035,-.30],[x,.035,.30]],.009,'road',station);
      rounded(.62,.13,.21,-.09,.11,.02,'cream',station,.045);
      for(let j=0;j<5;j++)box(.068,.05,.009,-.31+j*.11,.13,.133,'glass',station);
      for(const x of [-.39,.39])box(.025,.47,.025,x,.235,.29,'frame',station);
      box(.80,.05,.025,0,.48,.29,'frame',station);
      rounded(.80,.18,.24,0,.15,.12,'teal',station,.035);
      for(let j=0;j<6;j++){box(.085,.065,.009,-.31+j*.125,.18,.247,'glass',station);box(.009,.12,.01,-.37+j*.125,.14,.25,'cream',station);}
      box(.78,.025,.012,0,.09,.254,'cream',station);
      for(const x of [-.27,.27])for(const z of [.02,.22]){const wheel=disk(.035,.02,x,.055,z,'ink',station);wheel.rotation.x=Math.PI/2;}
      for(const x of [-.46,.46]){box(.08,.04,.48,x,.065,0,'paving',station);for(let z=-.17;z<.2;z+=.08)box(.045,.005,.02,x,.088,z,'amber',station);}

    }else if(i===1){
      originBuilding(o.x-.16,o.z-.30,.58,.47,1.67,true);
      originBuilding(o.x+.30,o.z-.28,.30,.40,1.19,true);
    }else{
      originBuilding(o.x-.23,o.z-.29,.33,.38,1.15);
      originBuilding(o.x+.16,o.z-.23,.34,.35,.92);
      originBuilding(o.x+.45,o.z-.42,.23,.28,1.25);
    }
  });
  const flows=[
    {source:'transit',site:'A',sample:12,points:[[-3,-1.12],[-3.20,-.72],[-3.20,.10],[-2.90,.55]]},
    {source:'transit',site:'B',sample:12,points:[[-3,-1.12],[-2.65,-.72],[-1.72,-.72],[-1.72,.40],[-1.15,.90]]},
    {source:'offices',site:'B',sample:12,points:[[-1.4,-1.12],[-1.10,-.72],[-1.10,.10],[-1.15,.90]]},
    {source:'homes',site:'B',sample:12,points:[[.35,-1.12],[.65,-.72],[.65,-.15],[-.40,-.15],[-.40,.60],[-1.15,.90]]},
    {source:'offices',site:'C',sample:20,points:[[-1.4,-1.12],[-.8,-.67],[.10,-.67],[.10,.12],[.35,.45]]},
  ];
  // Dense but subordinate district fabric: blocks and parks avoid every flow corridor.
  const footprintRoutes=flows.map(f=>new T.CatmullRomCurve3(f.points.map(([x,z])=>new T.Vector3(x,0,z))));
  function nearRoute(x,z){return footprintRoutes.some(c=>Array.from({length:55},(_,i)=>c.getPointAt(i/54)).some(p=>Math.hypot(p.x-x,p.z-z)<.16));}
  let blockIndex=0;
  const plots=[[-3.40,-.25,.28,.46,.34],[-2.72,-.30,.34,.32,.22],[-2.22,-.28,.38,.34,.46],[-2.30,.30,.56,.36,.40],[-3.42,1.30,.26,.28,.18],[-2.72,1.44,.36,.26,.23],[-2.18,1.47,.32,.27,.36],[-.25,-.98,.32,.27,.32],[-.51,-.43,.62,.26,.48],[.65,.08,.25,.26,.24],[.68,1.32,.31,.30,.28],[-.17,1.47,.30,.25,.21],[-3.28,-1.55,.34,.22,.19],[-2.49,-1.52,.31,.26,.28],[-1.95,-1.50,.23,.28,.45],[-.90,-1.50,.25,.22,.29],[-.38,-1.50,.30,.25,.22],[.78,-1.50,.23,.23,.19]];
  for(const [x,z,w,d,baseHeight] of plots){
    const h=baseHeight*1.65;
    if(z<-.99&&origins.some(o=>Math.abs(x-o.x)<.65))continue;
    if(footprintRoutes.some(c=>Array.from({length:70},(_,j)=>c.getPointAt(j/69)).some(p=>Math.abs(p.x-x)<w/2+.06&&Math.abs(p.z-z)<d/2+.06)))continue;
    const i=blockIndex++;
    slab(w+.09,d+.09,.024,x,.565,z,'road',root,.018);
    rounded(w,h,d,x,.58+h/2,z,['limestone','brick','concrete','cream'][i%4],root,.016);
    slab(w+.02,d+.02,.018,x,.59+h,z,'cream',root,.015);
    for(const sign of [-1,1])for(let row=0;row<Math.max(1,Math.floor(h/.11));row++)for(let j=0;j<3;j++){
      box(.039,.052,.012,x-w*.31+j*w*.31,.635+row*.105,z+sign*(d/2+.015),'glass');
      box(.045,.008,.02,x-w*.31+j*w*.31,.603+row*.105,z+sign*(d/2+.02),'brass');
    }
    // Ground-level shops, inset doors, shaded awnings and fine facade seams.
    box(w*.7,.10,.009,x,.65,z+d/2+.023,'glass');
    box(.028,.10,.012,x,.65,z+d/2+.030,'frame');
    slab(w+.055,.10,.023,x,.73,z+d/2+.035,i%2?'teal':'brick',root,.005);
    for(let row=1;row<Math.floor(h/.105);row++)box(w+.015,.008,.018,x,.60+row*.105,z+d/2+.021,'limestone');
    for(const side of [-1,1])box(.012,h,.018,x+side*w*.47,.58+h/2,z+d/2+.02,'frame');
    // Setback upper volumes, roof terraces and mechanical louvers vary the skyline.
    if(i%4===0){rounded(w*.61,.12,d*.67,x,.65+h,z,'stone',root,.012);slab(w*.65,d*.70,.015,x,.72+h,z,'cream',root,.01);}
    else if(i%4===1){slab(w*.65,d*.55,.018,x,.61+h,z,'park');for(let j=0;j<3;j++){const p=ball(.027,x-.055+j*.055,.635+h,z,'foliage');p.scale.y=.6;}}
    else{box(w*.35,.034,d*.35,x,.615+h,z,'road');for(let j=0;j<4;j++)box(.004,.037,d*.30,x-w*.13+j*w*.085,.617+h,z,'brass');}
    if(i%3===1)for(let j=0;j<5;j++)box(.008,h,.028,x-w*.40+j*w*.20,.58+h/2,z+d/2+.02,'brass');
  }
  for(let x=-3.45;x<.9;x+=.28)for(const z of [-1.70,1.66]){
    if(nearRoute(x,z))continue;box(.14,.012,.10,x,.567,z,'park');
    const trunk=mesh(new T.CylinderGeometry(.006,.009,.06,6),'brass');trunk.position.set(x,.605,z);
    for(let i=0;i<3;i++){const leaf=mesh(new T.IcosahedronGeometry(.037,1),'foliage');leaf.position.set(x+(i-1)*.022,.66+(i%2)*.025,z);}
  }
  function streetTree(x,z,size=.10){
    const trunk=mesh(new T.CylinderGeometry(.008,.012,.13,6),'bark');trunk.position.set(x,.64,z);
    for(let j=0;j<5;j++){const a=j*2.4;const leaf=mesh(new T.IcosahedronGeometry(size*(.65+(j%2)*.2),1),j%2?'foliage':'leafDark');leaf.position.set(x+Math.cos(a)*size*.40,.76+(j%3)*size*.3,z+Math.sin(a)*size*.32);}
  }
  for(const [x,z] of [[-3.48,.02],[-3.5,.93],[-2.48,1.38],[-1.86,1.44],[-.61,1.55],[.50,1.53],[.86,-.50],[-2.3,-1.65],[-.58,-1.65]]){
    if(nearRoute(x,z))continue;slab(.18,.17,.035,x,.58,z,'concrete',root,.025);streetTree(x,z);
  }
  for(const [x,z] of [[-3.48,-.55],[-3.45,.72],[-2.47,1.33],[-.58,1.53],[.82,.66],[.82,-.46],[-2.6,-1.60]]){
    const pole=mesh(new T.CylinderGeometry(.006,.009,.28,6),'frame');pole.position.set(x,.72,z);
    line([[x,.85,z],[x+.035,.89,z],[x+.075,.89,z]],.006,'frame');
    box(.065,.018,.035,x+.075,.89,z,'warmWindow');
    slab(.14,.07,.02,x-.05,.64,z+.13,'bark');
    for(const side of [-1,1])box(.012,.05,.05,x-.05+side*.05,.61,z+.13,'frame');
  }
  // Discreet paving joints around the front promenade.
  for(let x=-3.58;x<.96;x+=.12)box(.004,.003,.15,x,.58,1.49,'paving');
  // Sidewalk seams and zebra crossings register this as walkable street fabric.
  for(const [x,z] of [[-3.20,-.37],[-1.10,-.32],[.65,-.37],[-1.72,.10]])for(let i=0;i<4;i++)box(.14,.004,.021,x,.581,z+i*.043,'cream');
  const tokens=[];
  for(const [fi,flow] of flows.entries()){
    const points=flow.points.map(([x,z])=>[x,.601,z]);flow.curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    const street=line(points.map(([x,y,z])=>[x,0,z]),.075,'road');street.scale.y=.08;street.position.y=.58;line(points,.014,flow.site==='B'?'teal':'amber');
    // Fixed arrowheads make the direction readable in a still image.
    for(const t of [.38,.68]){
      const p=flow.curve.getPointAt(t),direction=flow.curve.getTangentAt(t);
      const arrow=mesh(new T.ConeGeometry(.033,.09,3),'amber');arrow.position.copy(p);arrow.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction);
    }
    for(let j=0;j<flow.sample;j++){
      const token=group();token.name=`mynextgym-footstep-${fi}-${j}`;
      const color=flow.site==='B'?'cyan':'signal';
      const head=mesh(new T.SphereGeometry(.017,10,7),color,token);head.position.y=.135;
      const torso=mesh(new T.CylinderGeometry(.021,.014,.055,7),color,token);torso.position.y=.091;
      const bone=(a,b)=>{const start=new T.Vector3(...a),end=new T.Vector3(...b),o=mesh(new T.CylinderGeometry(.006,.007,start.distanceTo(end),5),color,token);o.position.copy(start).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());};
      for(const side of [-1,1]){
        bone([side*.010,.065,0],[side*.015,.032,side*.012]);bone([side*.015,.032,side*.012],[side*.022,.006,side*.022]);
        bone([side*.018,.11,0],[side*.030,.082,-side*.01]);bone([side*.030,.082,-side*.01],[side*.034,.069,-side*.018]);
      }
      batch(token);
      preserved.push(token);const candidate=CANDIDATES.find(c=>c.id===flow.site),a=(j+fi*7)*2.39996;
      const radius=candidate.id==='B'?.48+(j%3)*.065:.26+(j%3)*.035;
      const endpoint=new T.Vector3(candidate.x+Math.cos(a)*radius,.601,candidate.z+Math.sin(a)*radius);
      const personalPoints=flow.curve.getPoints(12).slice(0,-2);personalPoints.push(endpoint);
      const walkCurve=new T.CatmullRomCurve3(personalPoints);
      const arrival=flow.site==='B'?(j*3+fi)*8/36:(j+1)*8/flow.sample;
      tokens.push({g:token,flow,arrival,walkCurve});
    }
  }
  const markers=[];
  CANDIDATES.forEach(c=>{
    const marker=group(c.x,.59,c.z);marker.name=`mynextgym-site-${c.id}`;
    slab(.50,.47,.035,0,.015,0,'brass',marker,.055);
    slab(.45,.42,.025,0,.045,0,'ink',marker,.045);
    const face=rounded(.35,.30,.035,0,.23,.16,'ink',marker,.055);face.material=face.material.clone();
    label(c.id,.24,.23,0,.23,.195,marker,'#fff0d5',false);
    preserved.push(marker);markers.push({g:marker,face,id:c.id});
  });
  // One integrated upright app housing; the dedicated screen owns readable data.
  const panel=group(2.13,.55,-.15);panel.rotation.y=-.13;panel.scale.setScalar(.78);
  slab(2.32,.72,.12,0,.07,0,'stone',panel,.12);
  rounded(2.35,3.56,.18,0,1.84,0,'frame',panel,.14);
  rounded(2.21,3.42,.025,0,1.84,.109,'ink',panel,.11);
  const app=createGymScreen(T);const appMesh=app.mesh??app.group??app.root;
  appMesh.position.set(0,1.84,.15);panel.add(appMesh);preserved.push(appMesh);
  const selection=group(CANDIDATES[1].x,.615,CANDIDATES[1].z);selection.name='mynextgym-selected-B';
  ring(.36,.02,0,0,0,'teal',selection);preserved.push(selection);
  const pin=group(CANDIDATES[1].x,.93,CANDIDATES[1].z-.06);pin.name='mynextgym-pin';
  const pinShape=new T.Shape();pinShape.moveTo(0,-.32);pinShape.bezierCurveTo(-.10,-.15,-.23,.06,-.23,.19);pinShape.absarc(0,.19,.23,Math.PI,0,true);pinShape.bezierCurveTo(.23,.06,.10,-.15,0,-.32);
  mesh(new T.ExtrudeGeometry(pinShape,{depth:.055,bevelEnabled:true,bevelSize:.015,bevelThickness:.012,bevelSegments:3,curveSegments:24}),'coral',pin);
  label('B',.23,.25,0,.18,.085,pin,'#fff4db',false);preserved.push(pin);
  const gym=group(CANDIDATES[1].x,.61,CANDIDATES[1].z);gym.name='mynextgym-proposed-gym';
  slab(.69,.53,.045,0,.025,0,'stone',gym,.035);
  // Four thin physical glazing panels leave a genuinely visible interior.
  slab(.60,.44,.012,0,.055,0,'floor',gym,.012);
  for(const z of [-.225,.225])box(.60,.32,.006,0,.23,z,'glazing',gym);
  for(const x of [-.305,.305])box(.006,.32,.45,x,.23,0,'glazing',gym);
  for(const x of [-.30,.30])for(const z of [-.225,.225])box(.018,.36,.018,x,.23,z,'brass',gym);
  // Two tiny treadmills: deck, belt, uprights and console remain inside the shop.
  for(const x of [-.16,.03]){
    slab(.13,.25,.025,x,.083,-.04,'ink',gym,.012);slab(.095,.20,.006,x,.101,-.04,'road',gym,.006);
    for(const side of [-1,1])line([[x+side*.055,.10,-.12],[x+side*.055,.22,-.13],[x+side*.055,.22,-.04]],.006,'brass',gym);
    rounded(.11,.055,.013,x,.23,-.13,'ink',gym,.008);
  }
  box(.10,.012,.19,.20,.125,0,'ink',gym);
  for(const z of [-.07,.07])box(.012,.06,.012,.20,.09,z,'brass',gym);
  for(let j=0;j<3;j++){const x=-.15+j*.13;line([[x-.03,.14,-.19],[x+.03,.14,-.19]],.005,'brass',gym);for(const side of [-1,1]){const weight=disk(.016,.01,x+side*.03,.14,-.19,'ink',gym);weight.rotation.z=Math.PI/2;}}

  for(const x of [-.30,-.10,.10,.30])box(.019,.36,.026,x,.24,.22,'brass',gym);
  for(const z of [-.23,.23])box(.65,.025,.025,0,.43,z,'brass',gym);
  slab(.73,.59,.045,0,.46,0,'frame',gym,.025);
  slab(.41,.27,.012,-.08,.49,-.03,'glazing',gym,.012);
  for(const x of [-.28,.12])box(.012,.018,.28,x,.50,-.03,'silver',gym);
  for(const z of [-.17,.11])box(.42,.018,.012,-.08,.50,z,'silver',gym);
  slab(.20,.48,.025,.25,.49,0,'park',gym,.01);
  for(let j=0;j<6;j++){const leaf=mesh(new T.IcosahedronGeometry(.035,1),'foliage',gym);leaf.position.set(.25,.52,-.19+j*.075);}
  slab(.48,.17,.015,0,.055,.32,'paving',gym,.01);
  for(const x of [-.26,.26]){disk(.035,.075,x,.09,.31,'stone',gym);const plant=mesh(new T.IcosahedronGeometry(.05,1),'foliage',gym);plant.position.set(x,.16,.31);}

  rounded(.58,.14,.025,0,.38,.25,'teal',gym,.018);
  label('GYM',.41,.115,0,.38,.28,gym,'#a1f0db',false);
  box(.08,.025,.017,-.055,.21,.245,'cream',gym);box(.08,.025,.017,.055,.21,.245,'cream',gym);
  batch(gym);gym.scale.set(1.25,1,1.25);preserved.push(gym);
  // Small engraved controls reinforce the app/tablet reading, not an urban diorama.
  for(let i=0;i<3;i++){const x=-3.21+i*.44;slab(.32,.09,.012,x,.573,1.87,i===0?'teal':'road',root,.03);}
  root.updateMatrixWorld(true);for(const o of preserved)root.attach(o);
  const model=finish(24,preserved);
  const offset=markers[0].g.position.clone().sub(new T.Vector3(CANDIDATES[0].x,.59,CANDIDATES[0].z));
  Object.assign(model.userData,{displayBase:false,groundLevel:0,studioProfile:'mynextgym',contactFootprint:false,initialYaw:-.12,initialElevation:.57,framingTargetY:1.15,autoOrbit:false,realTimeAnimation:true,
    candidateSites:CANDIDATES.map(c=>({id:c.id,sources:[...c.sources],strength:c.strength,footfall:c.footfall})),flowRoutes:flows.map(f=>({source:f.source,site:f.site,sample:f.sample,points:f.points.map(p=>[...p])}))});
  const pinY=pin.position.y;
  const stories=[
    ['01 / FOOTFALL','Count the passing footfall','An illustrative sample follows pedestrians from transit, offices and homes.'],
    ['02 / COMPARE','Compare A, B and C','Compare the same sample: A 12, B 36 and C 20 pedestrian arrivals.'],
    ['03 / SELECT','B receives the strongest footfall','36 sample arrivals converge at B from all three activity sources.'],
    ['04 / PROPOSE','Place the proposed gym at B','The storefront appears only after the footfall comparison selects the site.'],
    ['05 / REVIEW','Review the location decision','An illustrative observed sample, not a live dataset or a verified commercial forecast.'],
  ];
  let selectedStep=null;
  model.userData.setStep=(index,time=0)=>{if(index!==null&&(!Number.isInteger(index)||index<0||index>4))return;selectedStep=index;model.userData.animate(time);};
  model.userData.animate=time=>{
    const s=gymMoment(selectedStep===null?time:[4,10,14,18,21.5][selectedStep]),copy=stories[s.index];
    model.userData.story={index:s.index,phase:s.phase,step:copy[0],title:copy[1],detail:copy[2],tone:'teal',counts:s.counts};
    app.update(s);
    densityFields.forEach((heat,i)=>{heat.material.opacity=(i===1?1:.48)*(s.counts[i]/CANDIDATES[i].footfall)*s.fade;});
    tokens.forEach(({g,arrival,walkCurve})=>{
      const travel=2.3,u=Math.max(0,Math.min(1,(Math.min(s.t,8)-arrival+travel)/travel));
      g.visible=s.t>=Math.max(0,arrival-travel)&&s.fade>.001;
      const p=walkCurve.getPointAt(u),tangent=walkCurve.getTangentAt(u);
      g.position.copy(p).add(offset);g.rotation.y=Math.atan2(tangent.x,tangent.z);g.scale.setScalar(.72*Math.max(.001,s.fade));
    });
    selection.visible=s.t>=12&&s.fade>.001;selection.scale.setScalar(Math.max(.001,s.selection*s.fade));
    pin.visible=s.t>=12&&s.fade>.001;pin.position.y=pinY+.70*(1-s.selection)+.51*s.reveal*s.fade;pin.scale.setScalar(Math.max(.001,s.fade));
    gym.visible=s.t>=15&&s.fade>.001;gym.scale.y=Math.max(.001,s.reveal*s.fade);
    markers.forEach(({g,face,id})=>{g.visible=id!=='B'||s.t<15;face.material.color.setHex(id==='B'&&s.t>=12?0xc75f43:0x142d31);});
  };
  model.userData.framingPoints=[];
  for(const [xs,ys,zs] of [[[-3.94,3.24],[.32,.57],[-2.07,2.07]],[[-3.70,.95],[.58,2.66],[-1.9,-.85]],[[-3.7,.95],[.58,1.55],[-.85,1.85]],[[1.15,3.10],[.55,3.42],[-.50,.30]]])for(const x of xs)for(const y of ys)for(const z of zs)model.userData.framingPoints.push(new T.Vector3(x,y,z).add(offset));
  model.userData.animate(0);return model;
}
