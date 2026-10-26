import portraits from '../assets/fasight/portraits.js';

// Deterministic, local PBR finishes. Height and roughness are linear data;
// albedo is sRGB. Fine grain is deliberately separate from broad colour variation.
export function fasightFinishes(T,m){
 const n=512;
 function surface(kind){
  const color=new Uint8Array(n*n*4),height=new Uint8Array(n*n*4),rough=new Uint8Array(n*n*4);let seed=1919;
  const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const a=rnd(),b=rnd(),wave=Math.sin(x*.027+Math.sin(y*.036)*2.4),vein=Math.sin(x*.075+y*.018+Math.sin(y*.032)*3);
   let tone=240,h=128,r=190;
   if(kind==='leather'){const cell=Math.sin(x*.71+Math.sin(y*.51)*1.6)*Math.sin(y*.68+Math.sin(x*.43));tone=220+cell*12+a*17;h=125+cell*43+a*22;r=169+cell*18;}
   if(kind==='stone'){const pore=a>.984?(a-.984)*2700:0;tone=243+wave*2+vein-pore;h=139-pore*.75+b*7;r=166+pore;}
   if(kind==='paper'){tone=242+a*12;h=122+a*18+(x%7===0?9:0)+(y%11===0?6:0);r=234;}
   if(kind==='metal'){tone=233+a*12;h=125+Math.sin(y*2.3)*9+a*4;r=100+a*23+Math.sin(y*.15)*12;}
   if(kind==='slate'){tone=207+wave*17+a*22;h=120+vein*25+a*24;r=206+a*22;}
   for(const [data,v] of [[color,tone],[height,h],[rough,r]]){const i=(y*n+x)*4;data.set([v,v,v,255],i);}
  }
  const tex=(data,srgb=false)=>{const t=new T.DataTexture(data,n,n);t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=8;t.needsUpdate=true;return t;};
  return {map:tex(color,true),bumpMap:tex(height),roughnessMap:tex(rough)};
 }
 const stone=surface('stone'),paper=surface('paper'),leather=surface('leather'),metal=surface('metal'),slate=surface('slate');
 Object.assign(m.stone,stone,{color:new T.Color(0xe2d1b5),bumpScale:.006,roughness:.83});
 Object.assign(m.paper,paper,{bumpScale:.0025});
 Object.assign(m.teal,leather,{color:new T.Color(0x103a32),bumpScale:.007,roughness:.78});
 Object.assign(m.brass,metal,{color:new T.Color(0xc49a52),bumpScale:.0012,roughness:.58,metalness:.85});
 Object.assign(m.roof,slate,{color:new T.Color(0x405451),bumpScale:.006,roughness:.95});
 m.portrait=new T.MeshStandardMaterial({color:0xe5d6ba,roughness:.62,bumpMap:paper.bumpMap,bumpScale:.001});
 m.enamel=new T.MeshPhysicalMaterial({color:0x132e2a,roughness:.30,metalness:.22,clearcoat:.45,clearcoatRoughness:.25});
 m.window=new T.MeshStandardMaterial({color:0xedbc78,emissive:0xe8a24a,emissiveIntensity:.32,roughness:.48});
 m.mortar=new T.MeshStandardMaterial({color:0xc4b59b,roughness:.95});
 m.wood=new T.MeshStandardMaterial({color:0x5a3928,roughness:.65,map:leather.map,bumpMap:leather.bumpMap,bumpScale:.002});
 m.signal.color.setHex(0xd9be7e);m.signal.emissive.setHex(0xc49b51);m.signal.emissiveIntensity=.28;m.signal.roughness=.34;m.signal.metalness=.65;
 return {paper};
}

export function carvedPortrait(T,mesh,parent,index=0){
 const source=portraits[index%2],g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(source.positions,3));g.setIndex(source.indices);g.setAttribute('normal',new T.Float32BufferAttribute(source.normals,3));
 // Different three-quarter views of authored faces, compressed into shallow stone relief.
 const p=g.attributes.position,angle=[-.30,.36,.18,-.40,.04][index%5],v=new T.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyAxisAngle(new T.Vector3(0,1,0),angle);p.setXYZ(i,v.x,v.y,v.z*.48+.07);v.fromBufferAttribute(g.attributes.normal,i).applyAxisAngle(new T.Vector3(0,1,0),angle);v.z/=.48;v.normalize();g.attributes.normal.setXYZ(i,v.x,v.y,v.z);}
 const o=mesh(g,'portrait',parent);o.position.z=.065;
 return o;
}

export function miniatureHouse(T,{mesh,box,line,rounded,slab,group},assets){
 const house=group(-.42,.22,-.13,assets);
 slab(.89,.77,.045,0,0,0,'stone',house,.025);
 rounded(.70,.79,.55,0,.44,-.275,'ivory',house,.012);
 // Courses, corner quoins, plinth and cornice create a masonry facade.
 for(let row=0;row<10;row++){
  const y=.10+row*.073;box(.69,.003,.003,0,y,.289,'mortar',house);
  for(const x of [-.334,.334])box(.065,.055,.022,x,y+.029,.295,'stone',house);
 }
 for(const y of [.073,.80])box(.76,.035,.63,0,y,0,'stone',house);
 const gable=new T.Shape();gable.moveTo(-.35,0);gable.lineTo(0,.32);gable.lineTo(.35,0);gable.closePath();
 const wall=mesh(new T.ExtrudeGeometry(gable,{depth:.55,bevelEnabled:false}),'ivory',house);wall.position.set(0,.815,-.275);
 for(const side of [-1,1]){
  const slope=group(0,1.15,0,house);slope.rotation.z=-side*.73;
  const under=box(.53,.022,.79,side*.265,0,0,'roof',slope);
  // Individually lapped slate shingles, staggered joints and raised ridge caps.
  for(let row=0;row<7;row++)for(let col=0;col<8;col++){
   const tile=box(.078,.012,.092,side*(.043+row*.073),.018+row*.0008,-.345+col*.099+(row%2)*.008,'roof',slope);
   tile.rotation.x=Math.sin(row*17+col*31)*.008;
  }
  line([[side*.398,.811,-.405],[side*.398,.811,.405]],.015,'brass',house);
  box(.022,.025,.80,side*.395,.815,0,'ivory',house);
 }
 for(let i=0;i<9;i++){const cap=mesh(new T.CylinderGeometry(.026,.026,.088,16,1,false,0,Math.PI),'roof',house);cap.rotation.x=Math.PI/2;cap.position.set(0,1.154,-.35+i*.088);}
 // Recessed dark reveals surround warm glass; mullions sit above the glass.
 for(const x of [-.21,.21])for(const y of [.32,.62]){
  rounded(.155,.194,.012,x,y,.292,'wood',house,.007);
  rounded(.118,.15,.004,x,y,.309,'glass',house,.003);
  for(const sx of [-1,1])box(.014,.196,.032,x+sx*.077,y,.312,'ivory',house);
  for(const sy of [-1,1])box(.17,.014,.036,x,y+sy*.096,.316,'ivory',house);
  box(.012,.156,.015,x,y,.332,'ivory',house);box(.12,.010,.015,x,y,.333,'ivory',house);
  box(.19,.022,.070,x,y-.107,.318,'stone',house);
 }
 rounded(.13,.245,.025,0,.218,.292,'wood',house,.012);
 for(const y of [.15,.25])rounded(.083,.064,.006,0,y,.323,'teal',house,.005);
 for(const x of [-.08,.08])box(.021,.28,.045,x,.22,.316,'ivory',house);
 box(.19,.024,.048,0,.361,.317,'ivory',house);
 slab(.28,.14,.027,0,.05,.35,'stone',house,.009);slab(.24,.11,.024,0,.08,.32,'stone',house,.009);
 // Brick chimney, recessed flue, coping and rainwater pipe.
 box(.12,.29,.13,.19,1.10,-.20,'mortar',house);
 for(let row=0;row<7;row++)for(let col=0;col<2;col++)box(.052,.032,.137,.162+col*.058,.98+row*.039,-.20,'stone',house);
 box(.15,.022,.16,.19,1.255,-.20,'stone',house);box(.078,.006,.08,.19,1.27,-.20,'groove',house);
 line([[.36,.80,.26],[.38,.74,.29],[.38,.10,.29]],.009,'brass',house);
 return house;
}
