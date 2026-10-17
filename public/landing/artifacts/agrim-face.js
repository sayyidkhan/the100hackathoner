// A sculpted portrait miniature. Features share the head surface, instead of
// stacking primitive blobs in front of it. Front is +Z.
export function buildAgrimFace(T,{parent,materials,mesh}) {
  const colors={mayorSkin:0xc58f6e,mayorLip:0x925d4b,mayorMouth:0x472c29,
    mayorHair:0x231f1c,mayorHairLight:0x38302a,mayorBeard:0x302721,
    mayorFrame:0x332d26,mayorEye:0xf0e3cf,mayorIris:0x4b3227,mayorPupil:0x1c1714,mayorTeeth:0xf6ebd7};
  for(const [key,color]of Object.entries(colors))materials[key]=new T.MeshStandardMaterial({color,roughness:key==='mayorFrame'?.38:key==='mayorHair'?.55:.76,metalness:key==='mayorFrame'?.18:0});
  const face=new T.Group();face.name='agrim-sculpted-face';face.position.set(0,1.335,.012);
  // The city's wide, shallow layout must not flatten the portrait's features.
  face.scale.set(1.03/1.12,1.10,1.10/.78);parent.add(face);
  const sphere=new T.SphereGeometry(1,48,32);
  function add(geometry,key){return mesh(geometry,key,face);}
  function oval(x,y,z,sx,sy,sz,key){const o=add(sphere,key);o.position.set(x,y-1.37,z-.012);o.scale.set(sx,sy,sz);return o;}
  function line(points,r,key){return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],p[1]-1.37,p[2]-.012))),40,r,8,false),key);}
  function surface(theta,phi,offset=0){
    const y=Math.cos(theta),jaw=1-.16*Math.pow(Math.max(0,-y),1.3);
    return [Math.sin(theta)*Math.sin(phi)*(.143*jaw+offset),1.37+Math.cos(theta)*((y<0?.133:.181)+offset),.012+Math.sin(theta)*Math.cos(phi)*(.131+offset)];
  }
  function patch(rows,cols,point,key){
    const p=[],ix=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const v=point(j/rows,i/cols);p.push(v[0],v[1]-1.37,v[2]-.012);}
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i;ix.push(a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
    return add(g,key);
  }
  patch(48,72,(v,u)=>surface(.001+v*(Math.PI-.002),u*Math.PI*2),'mayorSkin');
  for(const side of [-1,1]){
    oval(side*.139,1.373,.004,.022,.036,.022,'mayorSkin');
    oval(side*.150,1.373,.018,.008,.021,.006,'mayorLip');

  }
  // A close-trimmed beard conforms to the jaw, leaving the smile unobstructed.
  patch(24,56,(v,u)=>{
    const phi=(u-.5)*Math.PI*1.24;
    const top=1.290+.105*Math.pow(Math.min(1,Math.abs(phi)/1.45),.72);
    const thetaTop=Math.acos((top-1.37)/(top<1.37?.133:.181));
    return surface(thetaTop+(Math.PI-.035-thetaTop)*v,phi,.003);
  },'mayorBeard');
  // Side-parted hair, with a raised swept forelock and tapered temples.
  function scalp(v,phi){
    const front=Math.max(0,Math.cos(phi)),part=.006*Math.sin(phi-.25);
    const hairline=1.400+.097*Math.pow(front,.55)+part;
    const limit=Math.acos(Math.max(-1,Math.min(1,(hairline-1.37)/.181)));
    const p=surface(.001+v*limit,phi,.010);
    p[1]+=.008*Math.pow(1-v,1.3)+.009*Math.max(0,-Math.sin(phi))*(1-v)*front;
    p[0]-=.013*(1-v);return p;
  }
  patch(32,64,(v,u)=>scalp(v,u*Math.PI*2),'mayorHair');
  for(let i=0;i<11;i++){
    const phi=-1.45+i*.22,pts=[];
    for(let j=0;j<=18;j++){const v=.19+j/18*.77,p=scalp(v,phi+.75*(1-v));p[1]+=.0015;pts.push(p);}
    line(pts,.0007,i%3?'mayorHair':'mayorHairLight');
  }
  // Small almond eyes and lids sit behind the spectacle rims.
  for(const side of [-1,1]){
    const x=side*.055;
    oval(x,1.413,.129,.021,.009,.007,'mayorEye');
    oval(x-side*.001,1.414,.136,.008,.008,.003,'mayorIris');
    oval(x-side*.001,1.414,.139,.0045,.0055,.0015,'mayorPupil');
    oval(x-.002,1.417,.140,.0018,.0018,.001,'mayorTeeth');
    line([[x-.022,1.413,.128],[x,1.422,.134],[x+.022,1.413,.128]],.0025,'mayorLip');
    line([[side*.028,1.447,.123],[side*.055,1.451,.125],[side*.087,1.441,.114]],.004,'mayorHair');
  }
  // Nose bridge, rounded tip and subtle nostril wings, not a single cylinder.
  oval(0,1.391,.137,.012,.033,.014,'mayorSkin');
  oval(0,1.363,.153,.019,.014,.016,'mayorSkin');
  for(const side of [-1,1]){
    oval(side*.016,1.360,.142,.010,.008,.009,'mayorSkin');
    oval(side*.012,1.355,.149,.004,.0025,.002,'mayorLip');
    line([[side*.004,1.342,.146],[side*.023,1.340,.143],[side*.042,1.333,.135]],.005,'mayorBeard');
  }
  function smileShape(key,z,teeth=false){
    const s=new T.Shape();
    if(teeth){s.moveTo(-.039,.004);s.quadraticCurveTo(0,-.004,.039,.004);s.quadraticCurveTo(.029,-.010,0,-.012);s.quadraticCurveTo(-.029,-.010,-.039,.004);}
    else{s.moveTo(-.046,.008);s.quadraticCurveTo(0,-.003,.046,.008);s.quadraticCurveTo(.034,-.023,0,-.025);s.quadraticCurveTo(-.034,-.023,-.046,.008);}
    s.closePath();const o=add(new T.ShapeGeometry(s,24),key);o.position.set(0,1.326-1.37,z-.012);
  }
  smileShape('mayorMouth',.139);smileShape('mayorTeeth',.1405,true);
  line([[-.036,1.311,.139],[0,1.298,.140],[.036,1.311,.139]],.0025,'mayorLip');
  for(const side of [-1,1])line([[side*.047,1.336,.129],[side*.054,1.327,.126],[side*.052,1.317,.124]],.0016,'mayorLip');
  // Rounded rectangular frames, a narrow bridge, and temple arms reaching ears.
  function roundRect(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  for(const side of [-1,1]){
    const shape=roundRect(.096,.058,.018),hole=roundRect(.091,.053,.0155);shape.holes.push(hole);
    const frame=add(new T.ExtrudeGeometry(shape,{depth:.003,bevelEnabled:true,bevelSize:.0008,bevelThickness:.0008,bevelSegments:2,curveSegments:12}),'mayorFrame');frame.position.set(side*.056,1.414-1.37,.149-.012);
    line([[side*.103,1.424,.150],[side*.139,1.425,.072],[side*.145,1.394,.006]],.003,'mayorFrame');
  }
  line([[-.009,1.418,.151],[0,1.424,.155],[.009,1.418,.151]],.003,'mayorFrame');
  return face;
}
