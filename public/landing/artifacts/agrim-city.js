import { buildAgrimFace } from './agrim-face.js';
import { sculpture } from './sculpture.js';

// Architecture, terrain and figure share the proportions of the Agrim artwork.
export function buildAgrimCity(T) {
  const { root, materials: m, mesh, box, disk, finish } = sculpture(T);
  let seed=7604;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const colors={ivory:0xddd0b6,paper:0xf1e7d3,shade:0xb5a386,stone:0xc8b496,rock:0xc1ab8b,
    red:0xb55e3c,roof:0xc4774d,blue:0x4697a5,ink:0x244d60,wood:0x726048,
    leaf:0x344d2b,sage:0x596f42,olive:0x6f8055,skin:0xbc8967,hair:0x282321,
    hoodie:0x292c2b,gold:0xc09a51,copper:0xc77b2d,steel:0x8a9a9e,white:0xeee9dc,
    purple:0x9576a7,flower:0xe4d7ad,navy:0x244361,cliff:0xc3ae90,cliffLight:0xd1bea0};
  for(const [key,color] of Object.entries(colors)) {
    m[key]??=new T.MeshStandardMaterial();m[key].color.setHex(color);
    m[key].roughness=['gold','copper','steel'].includes(key)?.36:.84;
    m[key].metalness=['gold','copper','steel'].includes(key)?.65:0;
  }
  m.glow=new T.MeshStandardMaterial({color:0xffdf9b,emissive:0xffb854,emissiveIntensity:0});
  m.signal=new T.MeshStandardMaterial({color:0x80bfc7,emissive:0x55c9e1,emissiveIntensity:0});
  m.glass=new T.MeshStandardMaterial({color:0x3d929f,metalness:.38,roughness:.23,emissive:0x285e69,emissiveIntensity:0});
  m.copper.color.setHex(0xe79739);m.copper.metalness=.25;
  m.cliff.flatShading=m.cliffLight.flatShading=true;
  // A translucent outer shell reveals actual racks and floors inside each tower.
  m.towerGlass=new T.MeshPhysicalMaterial({color:0x358b9e,metalness:.18,roughness:.18,
    transparent:true,opacity:.31,depthWrite:false,side:T.FrontSide});
  for(const key of ['stone','rock','cliff','cliffLight','ivory','paper','shade','red','roof']){
    m[key].onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCitySurface;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCitySurface=position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCitySurface;').replace('#include <color_fragment>',`#include <color_fragment>
        float grain=fract(sin(dot(floor(vCitySurface*155.),vec3(127.1,311.7,74.7)))*43758.5453);
        diffuseColor.rgb*=.91+.09*grain;`);
    };m[key].customProgramCacheKey=()=> 'agrim-mineral-v1';
  }
  const lampPositions=[];
  const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
  const sphere=new T.SphereGeometry(1,14,10),pebble=new T.IcosahedronGeometry(1,0);
  const limestone=new T.IcosahedronGeometry(1,1);
  const rockPositions=limestone.attributes.position;
  for(let i=0;i<rockPositions.count;i++){
    const x=rockPositions.getX(i),y=rockPositions.getY(i),z=rockPositions.getZ(i);
    const n=1+.10*Math.sin(x*17+y*11+z*23);
    rockPositions.setXYZ(i,Math.sign(x)*Math.abs(x)**.48*n,Math.sign(y)*Math.abs(y)**.6*n,Math.sign(z)*Math.abs(z)**.48*n);
  }
  limestone.computeVertexNormals();
  function oval(x,y,z,sx,sy,sz,key='ivory',parent=root){const o=mesh(sphere,key,parent);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;}
  function chunk(x,y,z,sx,sy,sz,key='leaf',parent=root){const o=mesh(key.startsWith('cliff')?limestone:pebble,key,parent);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rand()*.5,rand()*6.28,rand()*.5);return o;}
  function rod(a,b,r,key='gold',parent=root){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);const o=mesh(new T.CylinderGeometry(r,r,delta.length(),8),key,parent);o.position.copy(start).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;}
  function line(points,r,key='gold',parent=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,5,false),key,parent);}
  function ring(r,t,x,y,z,key='gold',parent=root){const o=mesh(new T.TorusGeometry(r,t,6,56),key,parent);o.rotation.x=Math.PI/2;o.position.set(x,y,z);return o;}
  function arch(w,h,d,x,y,z,key='ivory',parent=root,trim=0){
    const s=new T.Shape(),r=w/2;s.moveTo(-r,0);s.lineTo(-r,h-r);s.absarc(0,h-r,r,Math.PI,0,true);s.lineTo(r,0);s.closePath();
    if(trim){const p=new T.Path(),ri=r-trim;p.moveTo(-ri,0);p.lineTo(ri,0);p.lineTo(ri,h-r);p.absarc(0,h-r,ri,0,Math.PI,false);p.closePath();s.holes.push(p);}
    const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:10}),key,parent);o.position.set(x,y,z);return o;
  }
  function foliage(x,y,z,r=.13,key='leaf',parent=root){for(let j=0;j<22;j++){const a=j*2.4,d=r*Math.sqrt((j+.5)/22);chunk(x+Math.cos(a)*d,y+Math.sin(j*3)*r*.3,z+Math.sin(a)*d,r*.24,r*.22,r*.24,j%3?key:'sage',parent);}}
  function flowers(x,y,z,r=.12,parent=root){foliage(x,y,z,r,'leaf',parent);for(let i=0;i<9;i++){const a=i*2.4;oval(x+Math.cos(a)*r*.65,y+r*.3+rand()*.04,z+Math.sin(a)*r*.65,.018,.013,.018,i%3?'purple':'flower',parent);}}
  function cypress(x,y,z,h=.8,parent=root){
    rod([x,y,z],[x,y+h*.8,z],.016,'wood',parent);
    for(let j=0;j<90;j++){const t=j/90,a=j*2.4,r=h*(.075-.060*t);chunk(x+Math.cos(a)*r*.75,y+h*(.16+t*.82),z+Math.sin(a)*r*.75,h*.025,h*.045,h*.025,j%4?'leaf':'sage',parent);}
  }
  function olive(x,y,z,h=.65,parent=root){
    rod([x,y,z],[x+.025,y+h*.7,z],.023,'wood',parent);
    for(let i=0;i<5;i++){const a=i*2.4;rod([x,y+h*.42,z],[x+Math.cos(a)*h*.22,y+h*.75,z+Math.sin(a)*h*.22],.012,'wood',parent);}
    for(let j=0;j<110;j++){const a=j*2.4,r=h*.30*Math.sqrt((j+.5)/110);chunk(x+Math.cos(a)*r,y+h*.79+Math.sin(j*1.7)*h*.12,z+Math.sin(a)*r,h*.047,h*.035,h*.043,j%3?'olive':'sage',parent);}
  }
  function lamp(x,y,z,h=.33){
    disk(.035,.025,x,y,z,'ink');rod([x,y,z],[x,y+h,z],.009,'ink');
    const top=y+h;oval(x,top,z,.024,.040,.024,'glow');
    for(const dx of [-.025,.025])for(const dz of [-.025,.025])rod([x+dx,top-.04,z+dz],[x+dx*.7,top+.04,z+dz*.7],.003,'ink');
    const cap=mesh(new T.ConeGeometry(.045,.035,4),'ink');cap.position.set(x,top+.055,z);cap.rotation.y=Math.PI/4;
    lampPositions.push(new T.Vector3(x,top,z));
  }
  function person(x,y,z,yaw=0,outfit='navy',scale=1){const g=group(x,y,z);g.rotation.y=yaw;g.scale.setScalar(scale);
    for(const side of [-1,1]){rod([side*.018,.02,0],[side*.018,.09,0],.012,'hoodie',g);oval(side*.018,.01,.01,.014,.01,.025,'hair',g);rod([side*.033,.15,0],[side*.043,.09,.01],.011,outfit,g);}
    oval(0,.12,0,.036,.052,.024,outfit,g);oval(0,.19,0,.025,.032,.024,'skin',g);oval(0,.212,-.004,.025,.013,.024,'hair',g);
  }
  function terrace(x,z,r,base,height){
    disk(r,height,x,base+height/2,z,'stone');disk(r+.025,.04,x,base+height+.02,z,'paper');
    for(let row=0;row<Math.ceil(height/.10);row++){
      const y=base+row*.10;ring(r+.002,.003,x,y,z,'shade');
      for(let i=0;i<Math.ceil(r*24);i++){const a=(i+row%2*.5)*Math.PI*2/Math.ceil(r*24);rod([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(a)*r,Math.min(y+.10,base+height),z+Math.sin(a)*r],.003,'shade');}
    }
  }
  // A scalloped limestone outcrop replaces the perfectly circular display puck.
  function outline(a){return 3.25+.12*Math.sin(5*a)+.08*Math.cos(9*a)+.05*Math.sin(13*a);}
  for(let level=0;level<4;level++){
    const s=new T.Shape();for(let i=0;i<=128;i++){const a=i/128*Math.PI*2,r=outline(a)+(3-level)*.045;const x=Math.cos(a)*r,z=Math.sin(a)*r;i?s.lineTo(x,-z):s.moveTo(x,-z);}s.closePath();
    const o=mesh(new T.ExtrudeGeometry(s,{depth:.25,bevelEnabled:true,bevelSize:.035,bevelThickness:.02,bevelSegments:1,steps:1}),'rock');o.rotation.x=-Math.PI/2;o.position.y=-.61+level*.25;
  }
  for(let row=0;row<6;row++)for(let i=0;i<100;i++){
    const a=(i+row*.43)/100*Math.PI*2,r=outline(a)+.03+rand()*.08;
    const o=chunk(Math.cos(a)*r,-.55+row*.155+rand()*.08,Math.sin(a)*r,.15+rand()*.09,.09+rand()*.07,.11+rand()*.05,i%3?'cliff':'cliffLight');o.rotation.y=-a;
  }
  terrace(-1.76,.05,1.35,.39,.22);terrace(1.77,-.12,1.30,.39,.28);
  terrace(0,-1.57,1.53,.39,.43);terrace(0,1.10,1.10,.39,.17);
  for(let i=0;i<76;i++){
    const a=i/76*Math.PI*2,r=outline(a)-.10,x=Math.cos(a)*r,z=Math.sin(a)*r;
    const wall=box(.25,.13,.14,x,.48,z,'ivory');wall.rotation.y=-a+Math.PI/2;
    const cap=box(.27,.03,.17,x,.56,z,'paper');cap.rotation.y=wall.rotation.y;
    if(i%2===0){flowers(x,.59,z,.13);for(let j=0;j<6;j++){const yy=.45-j*.12;foliage(x+Math.cos(a)*(.29+j*.006),yy,z+Math.sin(a)*(.29+j*.006),.075,'leaf');}}
  }
  // Meandering canals are bordered by stone paving, with engraved paving joints.
  for(const side of [-1,1]){
    const curve=new T.CatmullRomCurve3([[side*.54,.416,2.80],[side*1.15,.416,1.90],[side*.99,.416,.85],[side*.78,.416,-.20]].map(p=>new T.Vector3(...p)));
    function ribbon(width,key,y){const vertices=[],indices=[];for(let i=0;i<=80;i++){const p=curve.getPoint(i/80),t=curve.getTangent(i/80);for(const s of [-1,1])vertices.push(p.x+s*t.z*width,p.y+y,p.z-s*t.x*width);if(i<80){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();mesh(g,key);}
    ribbon(.25,'paper',0);ribbon(.09,'blue',.007);
    for(let i=0;i<34;i++){const p=curve.getPoint(i/33),t=curve.getTangent(i/33);for(const s of [-1,1])rod([p.x+t.z*.10*s,.426,p.z-t.x*.10*s],[p.x+t.z*.25*s,.426,p.z-t.x*.25*s],.003,'shade');}
  }
  // Tiered glass academy: broad lower wings, planted setbacks, tall orange fins.
  function classroom(x,y,z,w,h,d){const g=group(x,y,z);
    box(w+.12,.075,d+.10,0,.02,0,'paper',g);box(w,h,d,0,h/2+.06,0,'glass',g);
    for(const side of [-1,1])box(.08,h+.08,d+.08,side*w/2,h/2+.06,0,'ivory',g);
    for(let j=0;j<=Math.floor(w/.16);j++){const xx=-w/2+j*w/Math.floor(w/.16);box(.012,h,.015,xx,h/2+.06,d/2+.012,'gold',g);}
    for(let j=0;j<3;j++)box(w,.012,.02,0,.12+j*h*.36,d/2+.02,'gold',g);
    box(w+.16,.085,d+.15,0,h+.11,0,'paper',g);
    for(let j=0;j<Math.floor(w/.22);j++)box(.09,.013,.024,-w/2+.12+j*.22,h+.025,d/2+.026,'glow',g);
    return g;
  }
  classroom(0,.86,-1.64,2.25,.44,1.05);
  classroom(0,1.42,-1.88,1.65,.48,.98);
  classroom(0,2.02,-2.03,.94,.62,.85);
  for(const side of [-1,1]){
    classroom(side*.99,1.42,-1.78,.66,.48,.87);
    for(let j=0;j<5;j++)box(.035,.70,.09,side*(.51+j*.06),2.36,-1.54,'copper');
    for(const [yy,zz,xx] of [[1.39,-1.03,1.05],[1.99,-1.32,.95],[2.78,-1.66,.42]]){
      box(.24,.08,.21,side*xx,yy,zz,'stone');flowers(side*xx,yy+.09,zz,.11);cypress(side*(xx+.13),yy+.03,zz-.09,.36);
    }
    for(let j=0;j<3;j++){
      const x=side*(.82+j*.17),y=2.03,z=-1.85;
      const panel=box(.14,.018,.32,x,y,z,'navy');panel.rotation.x=.22;
      for(let k=0;k<4;k++)rod([x-.067,y+.008,-1.98+k*.075],[x+.067,y+.008,-1.98+k*.075],.003,'steel');
    }
  }
  for(let j=0;j<3;j++){const panel=box(.24,.018,.32,-.28+j*.28,2.77,-2.12,'navy');panel.rotation.x=.2;}
  // Academy approach, retaining walls, doorways and gathering students.
  for(let i=0;i<9;i++){box(1.36-i*.025,.048,.13,0,.44+i*.045,-.22-i*.12,'paper');for(const side of [-1,1])box(.12,.16,.14,side*(.77-i*.01),.49+i*.045,-.22-i*.12,'stone');}
  for(const side of [-1,1]){arch(.24,.30,.04,side*.82,.46,-.34,'shade');arch(.30,.34,.04,side*.82,.45,-.31,'ivory',root,.035);}
  for(let i=0;i<11;i++){const row=i%5;person(-.42+(i%3)*.34,.465+row*.045,-.24-row*.12,rand()*.7,i%2?'navy':'red',.66);}
  for(const side of [-1,1]){const g=group(side*.09,.95,-1.02);g.rotation.z=-side*.13;box(.17,.035,.24,0,0,0,'paper',g);for(let j=0;j<4;j++)box(.11,.004,.005,0,.02,-.07+j*.04,'shade',g);}
  // Mediterranean community: tiled hip roofs, arcades and striped awnings.
  function house(x,y,z,w=.52,h=.62,yaw=0){const g=group(x,y,z);g.rotation.y=yaw;
    box(w,h,w*.85,0,h/2,0,'ivory',g);box(w+.06,.045,w*.91,0,h*.48,0,'paper',g);
    const roofGeo=new T.BufferGeometry(),d=w*.53,hh=.21;
    const v=[-d,h,-d,d,h,-d,0,h+hh,-d*.55,d,h,-d,d,h,d,0,h+hh,d*.55, d,h,d,-d,h,d,0,h+hh,d*.55,-d,h,d,-d,h,-d,0,h+hh,-d*.55, -d,h,-d,0,h+hh,-d*.55,0,h+hh,d*.55,-d,h,-d,0,h+hh,d*.55,-d,h,d, d,h,-d,d,h,d,0,h+hh,d*.55,d,h,-d,0,h+hh,d*.55,0,h+hh,-d*.55];
    roofGeo.setAttribute('position',new T.Float32BufferAttribute(v,3));roofGeo.computeVertexNormals();mesh(roofGeo,'red',g);
    for(let j=0;j<14;j++){const zz=-d+j*2*d/13;for(const s of [-1,1]){const endZ=Math.max(-d*.55,Math.min(d*.55,zz));rod([s*d,h+.012,zz],[0,h+hh+.012,endZ],.012,j%3?'roof':'red',g);}}
    box(w+.05,.035,w*.94,0,h-.01,0,'paper',g);
    for(const xx of [-w*.28,w*.28]){
      arch(.10,.19,.015,xx,.08,w*.43,'glow',g);arch(.14,.22,.02,xx,.07,w*.45,'paper',g,.018);
      if(h>.55){box(.10,.15,.012,xx,h*.66,w*.435,'glow',g);for(const dx of [-.065,.065])box(.025,.17,.016,xx+dx,h*.66,w*.45,'sage',g);}
    }
    arch(.105,.23,.02,0,0,w*.44,'wood',g);box(.07,.14,.08,w*.28,h+.12,-w*.24,'ivory',g);
    if(h>.55){box(w+.10,.035,.13,0,h*.49,w*.48,'paper',g);for(let j=0;j<7;j++)rod([-w*.46+j*w*.92/6,h*.50,w*.55],[-w*.46+j*w*.92/6,h*.64,w*.55],.004,'gold',g);flowers(-w*.35,h*.52,w*.52,.065,g);}
    return g;
  }
  for(const [x,z,w,h,yaw] of [[-2.52,-.88,.60,.76,.08],[-1.86,-.95,.55,.70,-.08],[-2.87,-.10,.49,.60,.3],[-2.70,.66,.51,.58,.3],[-2.15,1.23,.55,.68,-.1],[-1.52,1.20,.48,.57,.1],[-1.2,-.6,.40,.50,-.12]])house(x,.64,z,w,h,yaw);
  // Bell tower and civic hall anchor the left skyline in the reference.
  const bell=group(-2.55,.64,-1.12);box(.28,1.40,.30,0,.70,0,'ivory',bell);
  for(const yy of [.83,1.08,1.38])box(.34,.035,.35,0,yy,0,'paper',bell);
  for(const side of [-1,1]){arch(.09,.22,.015,side*.08,1.10,.157,'shade',bell);rod([side*.13,1.10,.18],[side*.13,1.39,.18],.016,'paper',bell);}
  const dome=mesh(new T.SphereGeometry(.17,16,10,0,Math.PI*2,0,Math.PI/2),'sage',bell);dome.position.y=1.44;dome.scale.y=1.2;rod([0,1.57,0],[0,1.78,0],.009,'gold',bell);
  disk(.25,.045,-1.92,.68,.17,'stone');disk(.21,.025,-1.92,.71,.17,'blue');disk(.035,.24,-1.92,.83,.17,'paper');disk(.11,.035,-1.92,.94,.17,'paper');
  for(const [i,[x,z]] of [[-2.36,-.20],[-1.51,-.27],[-2.38,.84],[-1.32,.69]].entries()){
    box(.36,.17,.24,x,.75,z,'wood');for(const side of [-1,1])rod([x+side*.20,.65,z],[x+side*.20,1.12,z],.008,'wood');
    for(let j=0;j<8;j++){const g=group(x-.21+j*.06,1.08,z);const stripe=box(.06,.025,.37,0,0,0,j%2?'white':i%2?'blue':'red',g);stripe.rotation.x=.14;box(.06,.065,.018,0,-.055,.18,j%2?'white':i%2?'blue':'red',g);}
    for(let j=0;j<7;j++)oval(x-.13+j*.04,.85,z,.025,.02,.025,j%2?'red':'sage');
  }
  for(const [x,z] of [[-1.70,.54],[-2.45,.35]]){disk(.11,.025,x,.82,z,'wood');rod([x,.65,z],[x,.81,z],.012,'wood');for(const s of [-1,1]){disk(.05,.022,x+s*.16,.74,z,'wood');rod([x+s*.16,.64,z],[x+s*.16,.73,z],.008,'wood');}}
  for(let i=0;i<16;i++){const a=i*2.4,r=.30+(i%3)*.17;person(-1.93+Math.cos(a)*r,.665,.24+Math.sin(a)*r,rand()*6.28,i%3?'navy':'red',.68);}
  // Glass server cylinders with interior racks, fine brass mullions and machinery.
  for(const [x,z,h] of [[1.24,-.40,1.36],[1.94,-.74,1.84],[2.53,-.26,1.50]]){
    disk(.29,h,x,.71+h/2,z,'ink');disk(.345,h,x,.71+h/2,z,'towerGlass');
    for(let row=0;row<13;row++){
      const yy=.82+row*(h-.20)/13;ring(.337,.006,x,yy,z,'steel');
      for(let fin=0;fin<12;fin++){const a=fin*Math.PI/6;
        const rack=box(.10,.065,.025,x+Math.sin(a)*.307,yy,z+Math.cos(a)*.307,'steel');rack.rotation.y=a;
        const led=box(.063,.009,.013,x+Math.sin(a)*.325,yy+.016,z+Math.cos(a)*.325,'signal');led.rotation.y=a;
      }
    }
    for(const yy of [.72,.80,.71+h,.65+h]){disk(.365,.035,x,yy,z,'gold');ring(.365,.01,x,yy+.019,z,'copper');}
    for(let j=0;j<12;j++){const a=j*Math.PI/6;rod([x+Math.cos(a)*.35,.74,z+Math.sin(a)*.35],[x+Math.cos(a)*.35,.70+h,z+Math.sin(a)*.35],.009,'gold');}
    disk(.30,.035,x,.75+h,z,'steel');ring(.19,.012,x,.78+h,z,'ink');
    for(let j=0;j<5;j++){const blade=box(.28,.012,.045,x,.78+h,z,'ink');blade.rotation.y=j*Math.PI/5;}
    rod([x,.77+h,z],[x,.98+h,z],.008,'gold');
  }
  for(const [x,z,w,h] of [[1.30,.45,.48,.38],[2.0,.65,.55,.48],[2.62,.60,.51,.35],[2.92,-.58,.31,.54]]){
    box(w,h,.42,x,.69+h/2,z,'steel');box(w+.025,.035,.45,x,.70+h,z,'ivory');
    for(let j=0;j<7;j++)box(w*.72,.014,.015,x,.75+j*(h-.10)/7,z+.218,'ink');
    disk(.13,.022,x,.73+h,z,'ink');ring(.11,.009,x,.75+h,z,'steel');
    for(let i=0;i<5;i++){const blade=box(.21,.008,.03,x,.75+h,z,'steel');blade.rotation.y=i*Math.PI/5;}
    line([[x-w*.46,.80,z+.22],[x-w*.46,.96+h,z+.26],[x+w*.2,.96+h,z+.26]],.016,'gold');
    for(const side of [-1,1])box(.035,h,.03,x+side*w*.46,.69+h/2,z+.22,'ivory');
  }
  for(const [x,z] of [[2.87,.10],[1.08,.25]]){disk(.09,.37,x,.89,z,'steel');ring(.09,.012,x,1.08,z);line([[x,1.06,z],[x+.13,1.11,z],[x+.20,.73,z]],.016,'gold');}
  const dish=mesh(new T.SphereGeometry(.17,20,12,0,Math.PI*2,0,.45*Math.PI),'white');dish.position.set(3.03,1.53,-.61);dish.rotation.z=-.65;rod([3.03,1.15,-.61],[3.03,1.52,-.61],.014,'steel');
  for(let i=0;i<6;i++)person(1.18+i*.26,.715,.91+Math.sin(i)*.12,rand()*4,'navy',.65);
  // Adult proportions and a readable open-handed gesture, rather than a bobblehead.
  terrace(0,.98,.91,.44,.14);
  const mayor=group(0,.60,.76);
  for(const side of [-1,1]){
    rod([side*.095,.08,0],[side*.095,.54,0],.062,'hoodie',mayor);
    oval(side*.095,.055,.035,.069,.045,.12,'hair',mayor);
    box(.12,.012,.17,side*.095,.025,.045,'shade',mayor);
    line([[side*.11,.12,.055],[side*.12,.32,.059],[side*.09,.50,.060]],.004,'hair',mayor);
  }
  oval(0,.83,0,.215,.30,.135,'hoodie',mayor);
  oval(0,1.07,-.065,.195,.105,.13,'hoodie',mayor);
  disk(.055,.13,0,1.17,0,'skin',mayor);
  buildAgrimFace(T,{parent:mayor,materials:m,mesh});
  for(const side of [-1,1]){
    line([[side*.045,1.10,.12],[side*.04,.95,.138]],.005,'shade',mayor);
    line([[side*.145,.75,.10],[side*.08,.68,.138],[0,.67,.14]],.004,'hair',mayor);
    for(let j=0;j<3;j++)line([[side*.15,.66+j*.08,.085],[side*.11,.68+j*.08,.12]],.003,'shade',mayor);
  }
  line([[0,.58,.13],[0,1.10,.13]],.003,'hair',mayor);
  function sleeve(points){line(points,.059,'hoodie',mayor);}
  sleeve([[.18,1.04,0],[.40,.99,.015],[.66,1.11,.04]]);
  oval(.70,1.13,.05,.065,.032,.046,'skin',mayor);
  for(let i=0;i<4;i++)line([[.72,1.14,.027+i*.018],[.77,1.16,.027+i*.019],[.80,1.185,.027+i*.019]],.008,'skin',mayor);
  line([[.69,1.12,.082],[.73,1.09,.11]],.012,'skin',mayor);
  sleeve([[-.18,1.04,0],[-.30,.88,.16],[-.34,.75,.37]]);
  oval(-.34,.73,.40,.052,.025,.055,'skin',mayor);
  for(let i=0;i<4;i++)rod([-.38+i*.023,.725,.42],[-.38+i*.023,.72,.47],.008,'skin',mayor);
  // Broad gilt planning table: a miniature landscaped city, not blue blocks.
  const deskShape=new T.Shape();deskShape.absarc(0,0,1.0,.10,Math.PI-.10,false);deskShape.absarc(0,0,.59,Math.PI-.10,.10,true);deskShape.closePath();
  const desk=mesh(new T.ExtrudeGeometry(deskShape,{depth:.09,bevelEnabled:true,bevelSize:.015,bevelThickness:.012,bevelSegments:2,curveSegments:48}),'gold');desk.rotation.x=Math.PI/2;desk.position.set(0,1.34,.86);
  for(const x of [-.84,.84]){box(.15,.73,.17,x,.945,1.05,'ivory');disk(.095,.035,x,1.35,1.05,'gold');disk(.065,.12,x,1.43,1.05,'gold');oval(x,1.50,1.05,.065,.025,.065,'gold');}
  for(const r of [.61,.97])line(Array.from({length:49},(_,i)=>{const a=.12+i*(Math.PI-.24)/48;return[Math.cos(a)*r,1.36,.86+Math.sin(a)*r];}),.012,'paper');
  for(let i=0;i<31;i++){
    const a=.17+i*(Math.PI-.34)/30,r=.69+(i%3)*.08,x=Math.cos(a)*r,z=.86+Math.sin(a)*r;
    const tile=box(.10,.012,.12,x,1.349,z,i%4?'sage':'blue');tile.rotation.y=-a;
    if(i%2){box(.034,.05+(i%3)*.018,.045,x,1.38,z,'paper');const roof=mesh(new T.ConeGeometry(.029,.025,4),'red');roof.position.set(x,1.42+(i%3)*.01,z);roof.rotation.y=Math.PI/4;}
    else{oval(x,1.38,z,.018,.045,.018,'leaf');}
  }
  // Concentric paving and stepped terraces under the mayor's feet.
  for(let i=0;i<7;i++){const r=.20+i*.095;ring(r,.0025,0,.603,.98,'shade');for(let j=0;j<18;j++){const a=j*Math.PI/9+i*.15;rod([Math.cos(a)*r,.605,.98+Math.sin(a)*r],[Math.cos(a)*(r+.09),.605,.98+Math.sin(a)*(r+.09)],.002,'shade');}}
  for(let i=0;i<6;i++)box(.95,.033,.115,0,.43+i*.026,2.22-i*.11,'paper');
  for(const side of [-1,1]){
    for(let i=0;i<7;i++){const a=side*(.65+i*.13),x=Math.sin(a)*1.05,z=.98+Math.cos(a)*1.05;
      const wall=box(.16,.14,.13,x,.64,z,'ivory');wall.rotation.y=-a;const cap=box(.18,.03,.16,x,.72,z,'paper');cap.rotation.y=-a;
      if(i%2===0)flowers(x,.75,z,.11);
    }
    lamp(side*.94,.61,1.20,.32);flowers(side*.94,.61,1.81,.17);cypress(side*1.10,.44,1.89,.76);
  }
  // Dense, fine-grained planting softens the architecture and the cliff silhouette.
  for(let i=0;i<38;i++){
    const a=i/38*Math.PI*2,r=outline(a)-.25,x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(Math.abs(x)<.68&&z>2.5)continue;
    cypress(x,.58,z,.45+rand()*.48);if(i%4===0)olive(x*.96,.58,z*.96,.55+rand()*.13);
  }
  for(const [x,y,z,h] of [[-1.18,.65,1.1,.65],[-2.95,.65,.63,.72],[-2.12,.65,.87,.57],[-1.50,.66,-.63,.65],[1.40,.72,.78,.66],[2.70,.72,1.05,.72],[.98,.86,-1.1,.61],[-1.12,.86,-1.14,.67],[0,1.40,-1.29,.56]])olive(x,y,z,h);
  for(const side of [-1,1])for(let i=0;i<6;i++){
    const x=side*(1.26+i*.12),z=-1.10-i*.24;cypress(x,.83,z,.43+(i%3)*.13);
    flowers(side*(.79+i*.11),.46,-.2-i*.14,.085);
  }
  for(const [x,z] of [[-2.72,1.47],[-1.1,2.49],[1.32,2.30],[2.7,1.4],[-2.77,-1.1],[1.0,-1.0]])lamp(x,.57,z);
  for(let i=0;i<8;i++){person(-.76+(i%2)*1.53,.44,1.85-Math.floor(i/2)*.42,rand()*6,'navy',.65);}
  // Preserve an uncluttered approach between the paths and the planning terrace.
  for(const side of [-1,1])for(let i=0;i<5;i++){const x=side*(1.52+i*.19),z=1.70-i*.08;flowers(x,.48,z,.12);}
  // The reference is a broad, shallow diorama. Compress depth before batching
  // rather than letting a deep circular base dominate the perspective fit.
  const layoutScale=new T.Vector3(1.12,1,.78);
  // Scale in world axes so rotated roofs and extruded terrain stay aligned.
  const layout = new T.Group();
  for(const child of [...root.children]) layout.add(child);
  layout.scale.copy(layoutScale);
  root.add(layout);
  lampPositions.forEach(position=>position.multiply(layoutScale));
  return {root,materials:m,finish,lampPositions,layoutScale};
}
