import { medivoiceStudio } from './medivoice-studio.js';

// Architectural interpretation of the district/sub-district Tableau prototype.
// All chart heights and parcels are illustrative, not reproduced market data.
export const MYNEXTGYM_CYCLE = 20;
const ease = value => { const x = Math.max(0, Math.min(1, value)); return x*x*x*(x*(x*6-15)+10); };
export function gymMoment(time) {
  const t = ((time % MYNEXTGYM_CYCLE) + MYNEXTGYM_CYCLE) % MYNEXTGYM_CYCLE;
  return { t, phase: t < 6 ? 'district' : t < 11 ? 'subdistrict' : t < 17 ? 'selected' : 'rest',
    route: ease((t - 7) / 4), drop: ease((t - 11) / 1.2), fade: 1 - ease((t - 17) / 2) };
}
export function createArtifact(T) {
  const {root, materials:m, mesh, box, disk, ball, line, texture, finish} = medivoiceStudio(T);
  const material = (color, roughness=.65, metalness=0) => new T.MeshStandardMaterial({color,roughness,metalness});
  Object.assign(m, {stone:material(0xd9c8aa,.84),cream:material(0xf2e5ce,.77),brass:material(0xba9554,.32,.72),
    teal:material(0x164e52,.42),glass:material(0x153738,.28,.24),sage:material(0x7d8d67),rust:material(0xb96340),
    mint:material(0x6d9d91),wood:material(0x8d623c,.82),rubber:material(0x262d29,.9),steel:material(0x48504d,.3,.72),
    leaf:material(0x52613a,.92),leafLight:material(0x7b8650,.86),soil:material(0x595443),road:material(0xc2b69d,.9),
    lamp:new T.MeshStandardMaterial({color:0xffd58b,emissive:0xffbf65,emissiveIntensity:.65}),
    signal:new T.MeshStandardMaterial({color:0xe4c783,emissive:0xd9a74c,emissiveIntensity:.3,metalness:.5,roughness:.35})});
  const stone=texture('stone'),wood=texture('wood');
  for(const k of ['stone','cream','sage','rust','mint','road']) {m[k].bumpMap=stone;m[k].bumpScale=k==='stone'?.018:.007;}
  m.wood.bumpMap=wood;m.wood.bumpScale=.015;
  const preserved=[];
  function group(x=0,y=0,z=0,parent=root){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
  function rounded(w,h,d,x,y,z,key,parent=root,r=.05){
    r=Math.min(r,w*.45,h*.45);const s=new T.Shape();
    s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
    s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:8}),key,parent);o.position.set(x,y,z-d/2);return o;
  }
  function slab(w,d,h,x,y,z,key,parent=root,r=.05){const o=rounded(w,d,h,x,y-h/2,z,key,parent,r);o.rotation.x=-Math.PI/2;return o;}
  function ring(r,t,x,y,z,key,parent=root){const o=mesh(new T.TorusGeometry(r,t,8,64),key,parent);o.position.set(x,y,z);o.rotation.x=-Math.PI/2;return o;}
  function label(text,w,h,x,y,z,parent=root,color='#dfc18a'){
    if(typeof document==='undefined')return;
    const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='500 86px sans-serif';ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillText(text,512,80,990);
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
    const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));o.position.set(x,y,z);o.userData.noShadow=true;parent.add(o);preserved.push(o);
  }
  slab(7.8,5.4,.26,0,.13,0,'stone',root,.28);
  slab(7.56,5.16,.035,0,.28,0,'cream',root,.21);
  rounded(1.8,.23,.025,0,.13,2.723,'brass',root,.025);
  label('My Next Gym',1.54,.16,0,.14,2.765,root,'#243831');
  for(const x of [-.78,.78])ball(.022,x,.13,2.746,'steel');
  // Streets and inset paving seams: one coherent district maquette.
  for(const x of [-1.05,.95,2.82])slab(.25,4.7,.012,x,.31,0,'road');
  for(const z of [-1.58,-.10,1.4])slab(7.05,.25,.012,0,.311,z,'road');
  for(let i=0;i<33;i++){
    const x=-3.5+i*.22;line([[x,.322,-.235],[x,.322,.035]],.0025,'stone');
    line([[x,.322,1.27],[x,.322,1.53]],.0025,'stone');
  }
  for(const x of [-1.05,.95,2.82])for(let i=0;i<21;i++)line([[x-.12,.322,-2.3+i*.22],[x+.12,.322,-2.3+i*.22]],.0025,'stone');
  const parcels=[];
  function parcel(x,z,w,d,key){
    slab(w+.07,d+.07,.025,x,.33,z,'brass');const face=slab(w,d,.025,x,.347,z,key);face.material=face.material.clone();preserved.push(face);parcels.push(face);
  }
  parcel(-.03,-.82,1.58,1.1,'rust');parcel(-.03,.67,1.58,1.06,'sage');parcel(2.47,1.99,1.13,.92,'mint');
  // Piers and spandrels surround genuinely recessed glazing. A smaller core
  // sits behind each facade; windows are never painted onto a solid outer box.
  function building(x,z,w,d,h,variant=0){
    const g=group(x,.37,z);g.name=`mynextgym-building-${variant}`;
    slab(w+.13,d+.13,.04,0,-.01,0,'stone',g);
    const wall=variant%3===1?'stone':'cream',cols=variant%3===2?2:3;
    const rows=Math.max(2,Math.round(h/.28)),pitch=h/rows,pier=.037;
    rounded(w-.11,h-.02,d-.11,0,h/2,0,wall,g,.012);
    // Recessed teal glass skins, with fine mullions and a substantial stone surround.
    for(const side of [-1,1]){
      box(w-.055,h-.065,.014,0,h/2,side*(d/2-.027),'glass',g);
      box(.014,h-.065,d-.055,side*(w/2-.027),h/2,0,'glass',g);
      for(let i=0;i<=cols;i++){
        const xx=-w/2+i*w/cols;
        box(pier,h,.055,xx,h/2,side*(d/2-.012),wall,g);
        box(.008,h-.08,.008,xx+w/(cols*2),h/2,side*(d/2-.004),'brass',g);
      }
      for(let i=0;i<=2;i++)box(.055,h,pier,side*(w/2-.012),h/2,-d/2+i*d/2,wall,g);
      for(let row=0;row<=rows;row++){
        const yy=row*pitch;
        box(w,.065,.066,0,yy,side*(d/2-.005),wall,g);
        box(.066,.065,d,side*(w/2-.005),yy,0,wall,g);
        // Thin projecting ledges give each floor a shadow and a readable scale.
        if(variant%3===1&&row>0&&row<rows)box(w+.04,.018,.085,0,yy-.025,side*(d/2+.011),'stone',g);
      }
    }
    // Alternating curtain-wall fins, sheltered balconies and flat masonry bays.
    if(variant%3===2){
      for(let i=0;i<5;i++)box(.015,h,.07,-w*.42+i*w*.21,h/2,d/2+.025,'brass',g);
    } else if(variant%3===1){
      for(let row=1;row<rows;row++){
        slab(w*.90,.13,.025,0,row*pitch-.025,d/2+.04,'cream',g,.008);
        line([[-w*.42,row*pitch+.055,d/2+.10],[w*.42,row*pitch+.055,d/2+.10]],.006,'steel',g);
        for(let i=0;i<6;i++)box(.006,.08,.006,-w*.42+i*w*.168,row*pitch+.015,d/2+.10,'steel',g);
      }
    }
    slab(w+.055,d+.055,.04,0,h+.015,0,'cream',g,.015);
    slab(w-.07,d-.07,.012,0,h+.04,0,'road',g,.012);
    for(const side of [-1,1]){
      box(w,.10,.045,0,h+.08,side*(d/2-.012),wall,g);
      box(.045,.10,d,side*(w/2-.012),h+.08,0,wall,g);
    }
    // Rooftop services, a planted strip and a set-back penthouse vary the skyline.
    slab(w*.44,d*.28,.035,-w*.15,h+.055,-d*.18,'sage',g,.01);
    for(let i=0;i<4;i++){
      const leaf=mesh(new T.IcosahedronGeometry(.035,1),'leaf',g);leaf.position.set(-w*.31+i*w*.1,h+.085,-d*.18);leaf.scale.y=.7;
    }
    if(variant%4===0){
      rounded(w*.36,.16,d*.37,w*.17,h+.13,d*.10,wall,g,.015);
      slab(w*.38,d*.39,.018,w*.17,h+.22,d*.10,'cream',g,.01);
    }else{
      box(.12,.055,.10,w*.20,h+.08,d*.18,'steel',g);
      for(let i=0;i<4;i++)box(.004,.058,.095,w*.16+i*.025,h+.08,d*.18,'road',g);
    }
    // Deep entrance, paired doors and a cantilevered canopy.
    box(.16,.25,.012,0,.125,d/2+.024,'teal',g);box(.008,.22,.015,0,.125,d/2+.035,'brass',g);
    slab(.24,.15,.018,0,.28,d/2+.045,'cream',g,.01);
    slab(.25,.15,.016,0,.01,d/2+.07,'stone',g,.01);
  }
  [[-2.9,-2.05,.65,.65,.65],[-2.1,-2.03,.70,.72,1.15],[-1.45,-2.10,.48,.6,.88],[-.45,-2.05,.70,.71,1.52],[.36,-2.05,.61,.71,1.1],[-2.73,-.90,.84,.78,1.15],[-1.72,-.82,.64,.82,.73],[1.67,.65,.73,.79,1.03],[2.51,.65,.66,.72,.70],[3.27,-.73,.59,.78,.85],[.05,2.02,.80,.70,.60]].forEach((b,i)=>building(...b,i));
  function tree(x,z,size=.35,y=.36){
    const trunk=line([[x,y,z],[x+.015,y+size*.6,z],[x,y+size,z]],.016,'wood');
    for(let i=0;i<24;i++){
      const a=i*2.39996,r=size*(.13+.22*((i*7)%11)/10),yy=y+size*(.65+.48*((i*3)%13)/12);
      const o=mesh(new T.SphereGeometry(size*(.105+(i%3)*.017),7,4),i%3===0?'leafLight':'leaf');o.position.set(x+Math.cos(a)*r,yy,z+Math.sin(a)*r);o.scale.set(1.25,.75,.85);o.rotation.y=a;
      if(i%10===0)line([[x,y+size*.48,z],[x+Math.cos(a)*r,yy,z+Math.sin(a)*r]],.006,'wood');
    }
    disk(.07,.02,x,y,z,'soil');return trunk;
  }
  for(let i=0;i<7;i++){tree(-.82,-2.25+i*.60,.29+(i%3)*.035);tree(1.17,-1.26+i*.59,.29+(i%2)*.04);}
  for(let i=0;i<7;i++){tree(-3.43+i*.43,-1.38,.30);tree(-.65+i*.52,2.46,.27);}
  for(let i=0;i<5;i++)tree(3.5,-1.7+i*.83,.32);
  // Sidewalk furniture gives the district a human scale without toy figures.
  function streetBench(x,z){
    for(let slat=0;slat<4;slat++)box(.32,.014,.026,x,.47,z+(slat-1.5)*.03,'wood');
    for(const side of [-1,1]){box(.018,.10,.018,x+side*.13,.41,z,'steel');box(.018,.12,.018,x+side*.13,.52,z-.065,'steel');}
    for(let slat=0;slat<3;slat++)box(.32,.023,.012,x,.52+slat*.025,z-.065,'wood');
  }
  streetBench(.22,1.14);streetBench(-.37,-.30);
  for(const [x,z] of [[.75,1.15],[1.25,-1.35],[3.15,1.35],[-1.25,-1.35]]){
    disk(.045,.028,x,.35,z,'steel');line([[x,.37,z],[x,.86,z],[x+.11,.90,z]],.009,'steel');
    slab(.15,.065,.02,x+.08,.895,z,'brass');slab(.10,.045,.008,x+.08,.88,z,'lamp');
  }
  for(const z of [-1.58,1.4])for(let i=0;i<4;i++)slab(.15,.023,.005,.95,.327,z-.075+i*.05,'cream',root,.002);
  // Tiny rain channels and recessed drain grilles, inset rather than floating decals.
  for(const x of [-1.05,2.82])for(const z of [-.10,1.40]){
    box(.085,.005,.09,x-.07,.33,z-.16,'steel');for(let i=0;i<4;i++)box(.004,.007,.072,x-.10+i*.02,.335,z-.16,'rubber');
  }
  // Open-front gym pavilion: treadmills, weight rack, bench and slatted timber wall.
  const gym=group(-2.45,.36,1.25);
  slab(2.18,2.01,.08,0,.04,0,'stone',gym);slab(2.02,1.85,.028,0,.096,0,'rubber',gym);
  box(2.05,1.60,.08,0,.90,-.91,'wood',gym);
  for(let i=0;i<27;i++)box(.027,1.49,.035,-.97+i*.075,.91,-.852,'wood',gym);
  // Tall rear mirror with brass reveal; subtle reflection-like glaze, no fake image.
  rounded(.86,.82,.025,-.48,1.14,-.812,'brass',gym,.015);
  rounded(.81,.77,.014,-.48,1.14,-.787,'glass',gym,.012);
  for(let i=0;i<8;i++)box(1.96,.003,.003,0,.113,-.77+i*.22,'steel',gym);
  for(let i=0;i<10;i++)box(.003,.003,1.75,-.9+i*.2,.113,0,'steel',gym);
  for(const x of [-1,1])for(const z of [-.88,.88])box(.045,1.72,.045,x,.93,z,'brass',gym);
  // Deliberate model cutaway: only rear roof retained, visible exposed rafters.
  slab(2.22,.47,.085,0,1.82,-.79,'cream',gym,.025);
  for(const x of [-1.065,1.065])slab(.09,1.55,.075,x,1.82,.22,'cream',gym,.015);
  slab(2.22,.09,.075,0,1.82,.98,'cream',gym,.015);
  for(const x of [-.80,.80])box(.025,.045,1.54,x,1.765,.20,'brass',gym);
  for(const z of [-.70,-.58])line([[-.94,1.725,z],[.94,1.725,z]],.008,'lamp',gym);
  box(2.14,.17,.06,0,1.68,.98,'teal',gym);box(.06,.17,1.91,1.06,1.68,0,'teal',gym);
  label('G Y M',.72,.17,0,1.68,1.018,gym);
  for(const x of [-.89,.89])line([[x,1.60,-.83],[x,1.60,.85]],.013,'lamp',gym);
  function treadmill(x,z){
    const g=group(x,.14,z,gym);slab(.49,.88,.065,0,.03,0,'steel',g,.05);slab(.35,.74,.02,0,.081,0,'rubber',g,.03);
    for(const side of [-1,1]){line([[side*.22,.07,-.29],[side*.22,.54,-.35],[side*.22,.67,-.27],[side*.22,.60,.05]],.022,'steel',g);}
    const console=group(0,.64,-.34,g);console.rotation.x=-.45;
    rounded(.39,.20,.05,0,0,0,'steel',console,.025);
    rounded(.25,.1,.012,0,.025,.036,'glass',console,.01);
    for(let j=0;j<3;j++)box(.045,.014,.01,-.10+j*.085,-.06,.043,j===2?'rust':'mint',console);
    for(let j=0;j<4;j++)box(.035,.006,.003,-.082+j*.055,.040,.047,'mint',console);
    box(.17,.004,.003,0,.014,.047,'brass',console);
    for(const side of [-1,1]){
      for(let j=0;j<5;j++)box(.007,.018,.023,side*.247,.043,.15+j*.04,'rubber',g);
      const roller=disk(.030,.36,0,.078,.36,'steel',g);roller.rotation.z=Math.PI/2;
    }
    for(let j=0;j<23;j++)box(.33,.002,.002,0,.094,-.32+j*.029,'steel',g);
  }
  treadmill(-.64,.30);treadmill(-.08,.30);
  const bench=group(.65,.15,.35,gym);
  slab(.27,.26,.085,0,.30,.20,'rubber',bench,.05);
  const backrest=slab(.27,.39,.085,0,.36,-.13,'rubber',bench,.045);backrest.rotation.x-=.30;
  line([[0,.15,-.22],[0,.30,-.30]],.017,'steel',bench);
  for(const z of [-.24,.24]){box(.04,.25,.04,0,.13,z,'steel',bench);box(.36,.035,.06,0,.025,z,'steel',bench);}
  for(const x of [.35,.91])line([[x,.15,-.59],[x,.85,-.59]],.022,'steel',gym);
  for(const y of [.39,.70]){
    box(.64,.025,.15,.64,y,-.60,'steel',gym);
    for(let i=0;i<4;i++){
      const x=.40+i*.16;line([[x,y+.055,-.67],[x,y+.055,-.52]],.012,'steel',gym);
      for(const z of [-.67,-.52]){const o=mesh(new T.CylinderGeometry(.045,.045,.035,6),'rubber',gym);o.position.set(x,y+.055,z);o.rotation.x=Math.PI/2;const end=disk(.012,.037,x,y+.055,z,'steel',gym);end.rotation.x=Math.PI/2;}
    }
  }
  // Freestanding data board matches the two actual repository navigation levels.
  const board=group(2.12,.36,-1.96);board.scale.set(.89,.79,1);box(.06,2.71,.06,-1.22,1.35,0,'brass',board);box(.06,2.71,.06,1.22,1.35,0,'brass',board);
  rounded(2.50,2.46,.08,0,1.54,0,'brass',board,.03);rounded(2.40,2.36,.025,0,1.54,.056,'teal',board,.02);
  label('DISTRICT',.82,.12,-.61,2.51,.095,board);label('SUB-DISTRICT',1,.12,.60,2.51,.095,board);
  const bars=[];
  for(let chart=0;chart<2;chart++){
    const cx=-.61+chart*1.22;line([[cx-.46,1.72,.09],[cx-.46,2.29,.09]],.005,'brass',board);line([[cx-.46,1.72,.09],[cx+.46,1.72,.09]],.005,'brass',board);
    for(let j=0;j<4;j++){
      const bar=group(cx-.32+j*.21,1.73,.09,board);const h=[.25,.37,.48,.60][(j+chart)%4];box(.13,h,.02,0,h/2,0,['sage','rust','brass','cream'][j],bar);bars.push({g:bar,chart,height:h});preserved.push(bar);
    }
  }
  line([[0,1.70,.09],[0,2.58,.09]],.005,'brass',board);
  // Abstract parcel diagram, deliberately no invented geographic labels or scores.
  const cells=[
    {points:[[-1.01,.83],[-.70,1.05],[-.47,.97],[-.48,.60],[-.85,.57]],key:'sage'},
    {points:[[-.67,1.07],[-.22,1.19],[-.10,.93],[-.45,.62],[-.44,.97]],key:'mint'},
    {points:[[-.07,.95],[.20,1.06],[.43,.76],[.19,.49],[-.42,.59]],key:'rust'},
    {points:[[.25,1.07],[.63,1.12],[.98,.78],[.46,.77]],key:'sage'},
    {points:[[.48,.73],[1.01,.75],[1.06,.41],[.70,.35],[.23,.47]],key:'mint'},
    {points:[[-.83,.54],[-.45,.56],[.16,.46],[.32,.26],[-.23,.31],[-.66,.37]],key:'teal'}
  ];
  for(const cell of cells){
    const shape=new T.Shape();cell.points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    const face=mesh(new T.ShapeGeometry(shape),cell.key,board);face.material=m[cell.key];face.position.z=.089;
    const edge=cell.points.map(([x,y])=>[x,y,.106]);edge.push(edge[0]);line(edge,.006,'brass',board);
  }
  // Selection path is an actual inset on the street surface, never a floating loop.
  const points=[[-.03,.365,-.82],[.62,.365,-.82],[.91,.365,-.32],[.93,.365,.93],[1.35,.365,1.39],[2.44,.365,1.99]];
  const route=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));line(points,.028,'teal');
  const signal=ball(.055,...points[0],'signal');signal.name='mynextgym-route';preserved.push(signal);
  ring(.23,.025,2.47,.38,1.99,'brass');
  const pin=group(2.47,.40,1.99);pin.name='mynextgym-pin';preserved.push(pin);
  const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.12,.20,-.34,.48,-.34,.69);shape.absarc(0,.69,.34,Math.PI,0,true);shape.bezierCurveTo(.34,.48,.12,.20,0,0);
  const hole=new T.Path();hole.absarc(0,.70,.13,0,Math.PI*2,false);shape.holes.push(hole);
  mesh(new T.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:true,bevelSize:.017,bevelThickness:.017,bevelSegments:3,curveSegments:32}),'rust',pin);
  // Small grounded framing vegetation leaves the gym interior unobstructed.
  for(const x of [-3.53,-1.38]){slab(.19,1.5,.10,x,.40,1.25,'stone');for(let j=0;j<6;j++)tree(x,.67+j*.24,.24,.45);}
  const lights=group();preserved.push(lights);
  const gymLight=new T.PointLight(0xffd49c,.85,3,2);gymLight.position.set(-2.45,1.75,1.4);lights.add(gymLight);
  root.updateMatrixWorld(true);
  for(const o of preserved)root.attach(o);
  const model=finish(24,preserved),pinY=pin.position.y;
  const routeOffset=new T.Vector3(); // finish centres all objects in one fixed coordinate system.
  routeOffset.copy(signal.position).sub(new T.Vector3(...points[0]));
  const originalColors=parcels.map(o=>o.material.color.clone());
  Object.assign(model.userData,{displayBase:false,groundLevel:0,studioProfile:'lrnmate',contactFootprint:false,initialYaw:-.12,initialElevation:.50,autoOrbit:false,realTimeAnimation:true});
  model.userData.animate=time=>{
    const s=gymMoment(time);
    const copy={district:['01 / DISTRICT','Compare the wider area','An illustrative overview of district-level analysis.'],subdistrict:['02 / SUB-DISTRICT','Narrow the search','Follow the analysis into a smaller neighbourhood.'],selected:['03 / LOCATION','A candidate comes into focus','The pin marks an illustrative site, not a real recommendation.'],rest:['04 / REVIEW','Review before deciding','Compare locations before choosing where to open a gym.']}[s.phase];
    model.userData.story={phase:s.phase,illustrative:true,step:copy[0],title:copy[1],detail:copy[2],tone:'teal'};
    bars.forEach(({g,chart},i)=>{const start=chart?6:0;const p=ease((s.t-start-(i%4)*.22)/1.25);g.scale.y=.79*(.10+.90*p*s.fade);});
    parcels.forEach((o,i)=>{o.material.color.copy(originalColors[i]);o.material.emissive.setHex(i===2&&s.t>=11&&s.t<17?0x647d52:0);o.material.emissiveIntensity=.18;});
    signal.visible=s.t>=7&&s.t<11;signal.position.copy(route.getPointAt(s.route)).add(routeOffset);
    pin.visible=s.t>=11&&s.t<19;pin.position.y=pinY+(1-s.drop)*.55;pin.scale.setScalar(Math.max(.001,s.fade));
  };
  model.userData.animate(0);return model;
}
