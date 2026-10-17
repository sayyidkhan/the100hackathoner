import { sculpture } from './sculpture.js';
import { setBuzoFraming } from './buzo-fit.js';
import { applyBakedAO } from './buzo-atlas-surface.js';
import { addBuzoDetails } from './buzo-20-details.js';

// A handcrafted event map: a conversation branches into music, art and people.
export function createArtifact(T, { bake = false } = {}) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(T);
  const material = (name, color, roughness = .75, metalness = 0) => materials[name] = new T.MeshStandardMaterial({ color, roughness, metalness });
  material('paper', 0xe6d7bb); material('ivory', 0xf4e9d5); material('stone', 0xd7c6aa);
  material('red', 0xc74631, .48); material('curtain', 0x9d2c22, .95);
  material('wood', 0xb3945c, .36, .62); material('blue', 0x326a9a, .46, .15);
  material('ink', 0x303333); material('rubber', 0x191e20, .85);
  material('foliage', 0x73856a); material('leafLight', 0x93a080); material('trunk', 0x857254);
  material('water', 0x9bbdc0, .24, .18); material('tile1', 0xe9ddc6); material('tile2', 0xddcfb4);
  material('lamp', 0xffe5b1, .35); materials.lamp.emissive.setHex(0xffc36f);
  material('pulse', 0xffe7ac, .3); materials.pulse.emissive.setHex(0xffc06b);
  // Fine, continuous material variation keeps broad paper and clay surfaces
  // from looking like untextured primitives, without downloading textures.
  for (const name of ['paper','ivory','stone','red','curtain','tile1','tile2']) {
    const m=materials[name];
    m.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBuzoSurface;').replace('#include <begin_vertex>','#include <begin_vertex>\nvBuzoSurface = position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
        varying vec3 vBuzoSurface;
        float buzoNoise(vec3 p) {
          vec3 cell=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
          float n=dot(cell,vec3(1.0,57.0,113.0));
          return mix(mix(mix(fract(sin(n)*43758.5453),fract(sin(n+1.0)*43758.5453),f.x),mix(fract(sin(n+57.0)*43758.5453),fract(sin(n+58.0)*43758.5453),f.x),f.y),mix(mix(fract(sin(n+113.0)*43758.5453),fract(sin(n+114.0)*43758.5453),f.x),mix(fract(sin(n+170.0)*43758.5453),fract(sin(n+171.0)*43758.5453),f.x),f.y),f.z);
        }`).replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb *= .91 + .10*buzoNoise(vBuzoSurface*85.0) + .06*buzoNoise(vBuzoSurface*14.0);')
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
          float clayRelief = .0015*buzoNoise(vBuzoSurface*90.0) + .0008*buzoNoise(vBuzoSurface*24.0);
          vec3 surfaceX=dFdx(-vViewPosition),surfaceY=dFdy(-vViewPosition);
          vec3 reliefX=cross(surfaceY,normal),reliefY=cross(normal,surfaceX);
          float reliefDet=dot(surfaceX,reliefX);
          normal=normalize(abs(reliefDet)*normal-sign(reliefDet)*(dFdx(clayRelief)*reliefX+dFdy(clayRelief)*reliefY));
        `);
    };
    m.customProgramCacheKey=()=>`buzo-paper-grain-v2`;
  }
  const preserved = [], lamps = [], pins = [];
  function group(name, x = 0, y = 0, z = 0, moving = false, parent = root) {
    const g = new T.Group(); g.name = name; g.position.set(x,y,z); parent.add(g);
    if (moving) preserved.push(g);
    return g;
  }
  const ring = (r,t,x,y,z,color='wood',parent=root,arc=Math.PI*2) => {
    const m=mesh(new T.TorusGeometry(r,t,8,48,arc),color,parent);m.position.set(x,y,z);return m;
  };
  function rod(a,b,r,color='wood',parent=root) {
    const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
    const m=mesh(new T.CylinderGeometry(r,r,delta.length(),10),color,parent);
    m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;
  }
  function slab(w,h,d,x,y,z,color='ivory',parent=root) {
    // A restrained bevel catches light at the edges of stone and joinery.
    const r=Math.min(.025,w/8,h/4,d/8),shape=new T.Shape();
    shape.moveTo(-w/2+r,-d/2);shape.lineTo(w/2-r,-d/2);shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);
    shape.lineTo(w/2,d/2-r);shape.quadraticCurveTo(w/2,d/2,w/2-r,d/2);shape.lineTo(-w/2+r,d/2);
    shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);shape.lineTo(-w/2,-d/2+r);shape.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
    const geometry=new T.ExtrudeGeometry(shape,{depth:h-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,steps:1,curveSegments:3});
    geometry.rotateX(-Math.PI/2);geometry.translate(0,-h/2+r,0);
    const m=mesh(geometry,color,parent);m.position.set(x,y,z);return m;
  }
  function person(x,y,z,s=1,angle=0,parent=root) {
    const g=group('visitor',x,y,z,false,parent);g.scale.setScalar(s);g.rotation.y=angle;
    const body=mesh(new T.CylinderGeometry(.105,.145,.34,16),'ivory',g);body.position.y=.28;
    ball(.128,0,.57,0,'ivory',g);
    for(const side of [-1,1]) {
      rod([side*.065,.06,0],[side*.065,.18,0],.043,'ivory',g);
      const foot=ball(.045,side*.065,.04,.028,'stone',g);foot.scale.z=1.5;
      rod([side*.13,.4,0],[side*.18,.26,.04],.042,'ivory',g);
      ball(.044,side*.18,.24,.05,'ivory',g);
      ball(.013,side*.038,.59,.12,'ink',g);
    }
    return g;
  }
  function tree(x,z,s=1) {
    const y=.28;
    disk(.10*s,.045,x,y+.02,z,'stone');rod([x,y,z],[x,y+.46*s,z],.035*s,'trunk');
    for(let i=0;i<5;i++) {
      const a=i*2.4,leaf=ball(.14*s,x+Math.cos(a)*.10*s,y+(.43+(i%2)*.13)*s,z+Math.sin(a)*.09*s,i%2?'leafLight':'foliage');
      leaf.scale.set(.85,1.1,.9);
    }
  }
  function plant(x,y,z,parent=root) {
    const pot=mesh(new T.CylinderGeometry(.075,.055,.11,12),'stone',parent);pot.position.set(x,y+.055,z);
    for(let i=0;i<5;i++) {const a=i*2.4;rod([x,y+.1,z],[x+Math.sin(a)*.065,y+.26+(i%2)*.05,z+Math.cos(a)*.065],.012,'foliage',parent);const leaf=ball(.04,x+Math.sin(a)*.065,y+.25,z+Math.cos(a)*.065,'foliage',parent);leaf.scale.set(.6,2,.65);leaf.rotation.z=Math.sin(a)*.45;}
  }
  function lamp(x,y,z,parent=root) {
    ball(.035,x,y,z,'lamp',parent);
  }
  function practical(x,y,z,power) {
    const g=group('venue-light',x,y,z,true),light=new T.PointLight(0xffc77d,0,3,2);g.add(light);lamps.push({light,power});
  }
  function pin(x,y,z) {
    const g=group('event-pin',x,y,z,true),shape=new T.Shape();
    shape.moveTo(0,0);shape.bezierCurveTo(-.09,.14,-.21,.26,-.16,.4);shape.bezierCurveTo(-.10,.58,.10,.58,.16,.4);shape.bezierCurveTo(.21,.26,.09,.14,0,0);
    const hole=new T.Path();hole.absarc(0,.37,.065,0,Math.PI*2,true);shape.holes.push(hole);
    mesh(new T.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:12}),'red',g);pins.push(g);
  }

  // One shallow brass-edged base, with a continuous folded paper map above it.
  for(const [r,h,y,color] of [[3.5,.10,.05,'wood'],[3.48,.11,.155,'stone'],[3.46,.045,.233,'ivory']]) {const m=disk(r,h,0,y,0,color);m.scale.z=.85;}
  const mapHeight=x=>.36+.15*(1-Math.abs((((x+2.8)%2.8)+2.8)%2.8-1.4)/1.4);
  for(let i=0;i<4;i++) {
    const x=-2.1+i*1.4,rise=i%2===0?.15:-.15,angle=Math.atan2(rise,1.4);
    const panel=slab(Math.hypot(1.4,rise),.055,3.85,x,.435,0,i%2?'paper':'ivory');panel.rotation.z=angle;
    for(let a=0;a<6;a++)for(let b=0;b<11;b++) {
      const px=x-.58+a*.232,pz=-1.72+b*.34;
      const seed=i*97+a*13+b*7, jitter=n=>Math.sin(seed*2.17+n*8.3)*.022;
      const shape=new T.Shape();shape.moveTo(-.10+jitter(0),-.145+jitter(1));shape.lineTo(.10+jitter(2),-.145+jitter(3));shape.lineTo(.10+jitter(4),.145+jitter(5));shape.lineTo(-.10+jitter(6),.145+jitter(7));shape.closePath();
      const geometry=new T.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:1,steps:1});geometry.rotateX(-Math.PI/2);
      const tile=mesh(geometry,(a+b)%3?'tile1':'tile2');tile.position.set(px,mapHeight(px)+.034,pz);tile.rotation.z=angle;
    }
    line([[x-.70,mapHeight(x-.70)+.035,-1.92],[x-.70,mapHeight(x-.70)+.035,1.92]],.008,'stone');
  }
  // A narrow waterway and footbridge add depth to the folded map.
  const river=new T.CatmullRomCurve3([[-.96,0,1.9],[-1.05,0,.86],[-.63,0,.2],[-.72,0,-.8],[-.25,0,-1.9]].map(([x,,z])=>new T.Vector3(x,mapHeight(x)+.045,z)));
  const riverGeo=new T.TubeGeometry(river,70,.15,8,false);
  // Flatten the tube vertically without flattening the underlying sloped route.
  const pos=riverGeo.attributes.position;
  for(let i=0;i<pos.count;i++)pos.setY(i,mapHeight(pos.getX(i))+.045+(pos.getY(i)-mapHeight(pos.getX(i))-.045)*.10);
  riverGeo.computeVertexNormals();mesh(riverGeo,'water');
  for(let i=0;i<11;i++) {
    const x=-1.3+i*.075,y=.57+Math.sin(i/10*Math.PI)*.11;
    slab(.074,.035,.31,x,y,.32,'ivory');
    if(i%2===0)for(const z of [.15,.49])rod([x,y,z],[x,y+.09,z],.013,'stone');
  }
  for(const z of [.15,.49])line(Array.from({length:11},(_,i)=>[-1.3+i*.075,.66+Math.sin(i/10*Math.PI)*.11,z]),.017,'stone');

  // A warm red concierge kiosk, with a real counter, awning and host.
  const k=group('concierge-kiosk',-1.87,.52,1.10);
  disk(.66,.07,0,.035,0,'stone',k);disk(.59,.47,0,.30,0,'red',k);
  for(let i=0;i<32;i++){const a=i*Math.PI*2/32;rod([Math.sin(a)*.593,.11,Math.cos(a)*.593],[Math.sin(a)*.593,.49,Math.cos(a)*.593],.008,'curtain',k);}
  disk(.65,.065,0,.565,0,'wood',k);disk(.63,.025,0,.61,0,'ivory',k);
  // Open front and a curved burgundy back wall.
  const back=mesh(new T.CylinderGeometry(.57,.57,.75,48,1,true,Math.PI/2,Math.PI),'curtain',k);back.position.y=.96;
  for(const x of [-.52,.52]){rod([x,.6,.13],[x,1.37,.13],.024,'wood',k);disk(.048,.03,x,.62,.13,'wood',k);}
  disk(.71,.075,0,1.39,0,'red',k);disk(.68,.025,0,1.44,0,'red',k);
  person(0,.43,.28,1,0,k);
  box(.095,.035,.025,0,.84,.41,'red',k);
  const wave=group('concierge-wave',-1.59,1.44,1.20,true);rod([0,-.17,0],[.10,.02,0],.038,'ivory',wave);ball(.045,.11,.055,0,'ivory',wave);
  slab(.23,.025,.16,-.28,.64,.31,'paper',k);box(.10,.015,.12,.27,.64,.30,'ink',k);
  const visitor=person(-1.28,.49,2.00,1,-.7);slab(.17,.21,.09,0,.29,-.14,'paper',visitor);
  const bubble=group('conversation',-1.98,2.35,1.10,true);
  const speech=ball(.36,0,0,0,'red',bubble);speech.scale.set(1.50,.93,.24);
  const tail=mesh(new T.ConeGeometry(.09,.24,3),'red',bubble);tail.position.set(.16,-.31,0);tail.rotation.z=3.4;
  const dots=[-.23,0,.23].map(x=>ball(.05,x,0,.09,'ivory',bubble));
  practical(-1.87,1.65,1.20,1.4);

  // A concert theatre with scalloped velvet, stage lights and detailed instruments.
  const s=group('concert-theatre',-1.13,.58,-1.27);
  slab(1.80,.14,1.18,0,.07,0,'stone',s);slab(1.72,.055,1.10,0,.165,0,'wood',s);
  for(let i=0;i<9;i++)box(.008,.005,1.04,-.76+i*.19,.196,0,'stone',s);
  for(let i=0;i<3;i++)slab(1.18+i*.12,.065,.16,0,.04-i*.02,.65+i*.14,'ivory',s);
  box(1.58,1.13,.10,0,.76,-.5,'curtain',s);
  for(let i=0;i<17;i++){const fold=ball(.055,-.73+i*.091,.77,-.43,i%2?'red':'curtain',s);fold.scale.set(1,10.1,1);}
  for(const side of [-1,1]) {
    slab(.12,1.20,.18,side*.84,.78,-.48,'ivory',s);
    const fold=ball(.14,side*.66,.82,-.32,'red',s);fold.scale.set(1,3.8,.65);rod([side*.64,.74,-.19],[side*.77,.75,-.19],.02,'wood',s);
    slab(.27,.58,.25,side*.71,.48,.35,'ink',s);
    for(const y of [.36,.61]){ring(.078,.012,side*.71,y,.487,'rubber',s);const cone=disk(.064,.016,side*.71,y,.495,'rubber',s);cone.rotation.x=Math.PI/2;ball(.025,side*.71,y,.509,'ink',s);}
  }
  const arch=ring(.85,.064,0,1.36,-.48,'ivory',s,Math.PI);arch.scale.y=.36;
  for(const x of [-.58,0,.58]){rod([x,1.47,-.38],[x,1.34,-.27],.025,'wood',s);lamp(x,1.32,-.25,s);}
  const drum=disk(.21,.20,.18,.40,.02,'red',s);drum.rotation.x=Math.PI/2;
  for(const z of [-.09,.13]){const face=disk(.19,.014,.18,.40,z,'ivory',s);face.rotation.x=Math.PI/2;ring(.20,.013,.18,.40,z+.012,'wood',s);}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;rod([.18+Math.sin(a)*.20,.40+Math.cos(a)*.20,-.07],[.18+Math.sin(a)*.20,.40+Math.cos(a)*.20,.12],.006,'wood',s);}
  for(const x of [-.08,.49]){rod([x,.20,-.04],[x,.79,-.04],.012,'ink',s);disk(.15,.012,x,.79,-.04,'wood',s);ball(.022,x,.81,-.04,'wood',s);for(const a of [0,2.1,4.2])rod([x,.29,-.04],[x+Math.sin(a)*.11,.20,-.04+Math.cos(a)*.11],.008,'ink',s);}
  disk(.08,.015,-.43,.21,.31,'ink',s);rod([-.43,.22,.31],[-.43,.85,.31],.013,'ink',s);rod([-.43,.85,.31],[-.28,.90,.31],.013,'ink',s);const mic=ball(.033,-.26,.90,.31,'ink',s);mic.scale.x=1.8;
  person(.20,.19,-.28,.70,0,s);pin(-1.13,2.30,-1.75);practical(-1.13,1.9,-1.08,2.5);

  // An open gallery, three framed works, a bench and warm picture lights.
  const g=group('art-gallery',1.61,.57,-1.13);
  slab(1.65,.10,1.17,0,.05,0,'ivory',g);slab(1.54,1.18,.10,0,.67,-.52,'ivory',g);slab(.10,1.18,1.10,.77,.67,0,'ivory',g);
  for(const [i,x] of [-.45,.18].entries()){
    slab(.49,.67,.055,x,.77,-.45,'wood',g);box(.42,.60,.025,x,.77,-.411,'paper',g);
    for(let j=0;j<4;j++){const dot=ball(.09,x+(j%2? .09:-.09),.77+(j<2?.15:-.15),-.39,(j+i)%2?'blue':'red',g);dot.scale.set(j===3?.6:1,j===2?1.5:1,.08);}
    rod([x,1.22,-.43],[x,1.27,-.22],.014,'wood',g);lamp(x,1.25,-.21,g);
  }
  box(.025,.68,.48,.708,.77,.12,'wood',g);box(.019,.60,.40,.687,.77,.12,'paper',g);
  for(let i=0;i<3;i++){const dot=ball(.10,.671,.64+i*.13,.08+(i%2)*.12,i%2?'red':'blue',g);dot.scale.set(.08,1.3,1);}
  slab(.57,.055,.19,.15,.30,.30,'wood',g);for(const x of [-.05,.35])box(.035,.23,.12,x,.17,.30,'stone',g);
  person(-.36,.11,.11,.87,.45,g);plant(.64,.11,.40,g);pin(1.95,1.97,-1.65);practical(1.60,1.65,-1.12,1.8);

  // A ribbed pavilion roof, slender posts, string lights and a small conversation.
  const p=group('networking-pavilion',1.71,.52,1.22);
  disk(.85,.08,0,.04,0,'stone',p);disk(.79,.055,0,.108,0,'ivory',p);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;rod([Math.sin(a)*.67,.14,Math.cos(a)*.67],[Math.sin(a)*.67,1.13,Math.cos(a)*.67],.026,'ivory',p);}
  const roof=mesh(new T.ConeGeometry(.88,.30,64),'ivory',p);roof.position.y=1.29;
  const rim=ring(.87,.025,0,1.14,0,'stone',p);rim.rotation.x=Math.PI/2;
  for(let i=0;i<16;i++){const a=i*Math.PI/8;rod([0,1.445,0],[Math.sin(a)*.86,1.15,Math.cos(a)*.86],.008,'stone',p);}
  ball(.042,0,1.47,0,'wood',p);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;lamp(Math.sin(a)*.61,1.03,Math.cos(a)*.61,p);}
  disk(.23,.035,0,.54,0,'ivory',p);rod([0,.14,0],[0,.52,0],.028,'wood',p);disk(.10,.018,0,.15,0,'wood',p);
  for(const x of [-.40,.40])person(x,.14,.02,.88,x<0?-Math.PI/2:Math.PI/2,p);
  for(const x of [-.08,.08])disk(.024,.04,x,.58,0,'paper',p);
  plant(-.53,.15,.40,p);plant(.53,.15,.40,p);pin(1.71,2.10,1.22);practical(1.71,1.48,1.22,2);

  // Brass compass with engraved ticks and an articulated blue needle.
  disk(.53,.045,0,.57,.05,'wood');disk(.49,.02,0,.607,.05,'ivory');
  const compassRim=ring(.51,.02,0,.63,.05);compassRim.rotation.x=Math.PI/2;
  for(let i=0;i<32;i++){const a=i*Math.PI/16,m=box(.009,.008,i%4?.035:.075,Math.sin(a)*.445,.624,.05+Math.cos(a)*.445,'wood');m.rotation.y=a;}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const tri=new T.BufferGeometry();tri.setAttribute('position',new T.Float32BufferAttribute([0,.628,.05,Math.sin(a-.16)*.15,.628,.05+Math.cos(a-.16)*.15,Math.sin(a)*.39,.628,.05+Math.cos(a)*.39],3));tri.computeVertexNormals();mesh(tri,i%2?'stone':'wood');}
  const needle=group('event-compass',0,.66,.05,true);
  for(const side of [-1,1]){const m=mesh(new T.ConeGeometry(.075,.40,3),side>0?'blue':'red',needle);m.rotation.x=side*Math.PI/2;m.position.z=side*.17;}
  ball(.055,0,.045,0,'wood',needle);
  const routes=[[[ -1.18,1.82],[-.55,1.25],[.01,.78],[-.15,-.43],[-.83,-.53]],[[.01,.78],[.65,.27],[1.14,-.30],[1.61,-.42]],[[.01,.78],[.62,1.05],[.96,1.56]]];
  const travel=group('route-travel',0,0,0,true);
  const curves=routes.map(points=>new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,mapHeight(x)+.065,z))));
  const markers=curves.map(curve=>{mesh(new T.TubeGeometry(curve,64,.024,8,false),'blue');const end=curve.getPoint(1);disk(.105,.019,end.x,end.y,end.z,'blue');return ball(.037,0,0,0,'pulse',travel);});

  // A varied city edge gives the map scale without obscuring the destinations.
  const buildings=[[-2.66,-1.12,.25,.63],[-2.43,-1.78,.31,.85],[-2.76,-.47,.28,.46],[-2.81,.08,.23,.67],[-2.80,.63,.27,.41],[-.25,-2.17,.27,.54],[.22,-2.20,.30,.76],[.67,-2.11,.24,.43],[2.48,-1.64,.26,.56],[2.76,-.97,.28,.75],[2.86,-.38,.25,.47],[2.78,.25,.25,.62],[2.62,.80,.22,.43],[.26,2.22,.29,.46],[.73,2.15,.23,.64],[-.27,2.22,.24,.31]];
  buildings.forEach(([x,z,w,h],i)=>{
    slab(w,h,w*.85,x,.27+h/2,z,i%3?'ivory':'paper');slab(w+.025,.035,w*.85+.025,x,.28+h,z,'stone');
    for(let row=0;row<Math.floor(h/.16);row++)for(const dx of [-w*.22,w*.22]){box(.045,.075,.009,x+dx,.37+row*.16,z+w*.43,'stone');box(.026,.055,.011,x+dx,.37+row*.16,z+w*.44,'lamp');}
    if(i%4===0)slab(w*.65,.10,w*.62,x,.35+h,z,'paper');
  });
  [[-2.7,-1.56,.8],[-2.35,-.58,.8],[-2.82,.40,.75],[-2.67,1.02,.8],[-2.45,1.72,.70],[-.62,-2.0,.8],[.48,-1.90,.72],[1.11,-2.06,.85],[2.47,-1.07,.75],[2.55,-.48,.8],[2.74,.59,.7],[2.38,1.70,.8],[1.10,2.10,.72],[-.05,2.36,.7],[-.67,2.1,.7]].forEach(([x,z,s])=>tree(x,z,s));
  // Small hedges and low stones articulate the venue edges.
  for(let i=0;i<4;i++){const m=ball(.085,-1.98+i*.21,.62,-.64,'foliage');m.scale.set(.9,1.3,.8);}

  const animateDetails=addBuzoDetails(T,{root,materials,mesh,box,disk,ball,line,slab,rod,group,ring,person,plant,tree,mapHeight,preserved,k,s,g,p});
  bubble.scale.setScalar(1.10);
  const model=finish(66,preserved);
  const bubbleY=bubble.position.y,pinY=pins.map(p=>p.position.y);
  model.userData={...model.userData,displayBase:false,studioProfile:'paper',groundLevel:0,initialYaw:-.42,initialElevation:.59,autoOrbit:false,animationDuration:32};
  model.userData.animate=elapsed=>{
    const t=Number.isFinite(elapsed)?Math.max(0,elapsed):0;
    animateDetails(t);
    needle.rotation.y=.35+Math.sin(t*.35)*.65;
    wave.rotation.z=-.15+Math.sin(t*2.4)*.16;
    bubble.position.y=bubbleY+Math.sin(t*1.3)*.025;
    dots.forEach((dot,i)=>dot.scale.setScalar(1+.13*Math.sin(t*3-i*.8)));
    pins.forEach((pin,i)=>pin.position.y=pinY[i]+Math.sin(t*1.1+i)*.018);
    curves.forEach((curve,i)=>{const phase=(t/7+i/3)%1;markers[i].position.copy(curve.getPointAt(phase));markers[i].position.y+=.025;});
  };
  model.userData.setTheme=theme=>{
    const dark=theme==='dark';materials.lamp.emissiveIntensity=dark?1.8:.08;
    materials.blue.emissive.setHex(0x296fa9);materials.blue.emissiveIntensity=dark?.3:0;
    materials.pulse.emissiveIntensity=dark?1.8:.3;
    lamps.forEach(({light,power})=>light.intensity=dark?power:0);
  };
  model.userData.animate(0);model.userData.setTheme('light');
  setBuzoFraming(T,model);model.userData.animate(0);
  if(!bake&&typeof document!=='undefined') {
    applyBakedAO(T,model,'../assets/buzo-20-ao-v2.bin',10000);
    // Retain contact contrast under the bright studio key as well as skylight.
    const shaded=new Set();
    model.traverse(object=>{
      const m=object.material;
      if(!m?.isMeshStandardMaterial||shaded.has(m))return;
      shaded.add(m);
      const previous=m.onBeforeCompile,cache=m.customProgramCacheKey();
      m.onBeforeCompile=function(shader,renderer){previous.call(this,shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('#include <aomap_fragment>','#include <aomap_fragment>\nreflectedLight.directDiffuse *= mix(.65,1.0,clamp(vStorybookAO,0.0,1.0));');};
      m.customProgramCacheKey=()=>`${cache}:buzo-contact-v2`;
    });
  }
  return model;
}
