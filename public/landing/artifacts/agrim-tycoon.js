import { sculpture } from './sculpture.js';

// Innovation City: community, builder academy and machine systems, with the
// mayor directing the districts from the central plaza. Static detail is batched by material.
export function createArtifact(T) {
  const { root, materials, mesh, box, disk, ball, line, finish } = sculpture(T);
  const palette = { ivory: 0xeadfc6, paper: 0xf5ecd8, shade: 0xbfae8f, red: 0xa84330,
    blue: 0x28667b, ink: 0x193b49, wood: 0x70583c, leaf: 0x49634b, sage: 0x81916b, skin: 0xb67a53, hair: 0x211b18, hoodie: 0x272a2a, gold: 0xb99859 };
  for (const [key, color] of Object.entries(palette)) {
    materials[key] ??= new T.MeshStandardMaterial();
    materials[key].color.setHex(color);
    materials[key].roughness = key === 'gold' ? .33 : .78;
    materials[key].metalness = key === 'gold' ? .65 : 0;
  }
  materials.glow = new T.MeshStandardMaterial({ color: 0xffdf9b, emissive: 0xffb854, emissiveIntensity: .55 });
  materials.signal = new T.MeshStandardMaterial({ color: 0x80d8da, emissive: 0x48a9bc, emissiveIntensity: .6 });
  const group = (x,y,z,parent=root) => { const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g; };
  function bevel(w,h,d,x,y,z,c='ivory',p=root,b=.025) {
    const s=new T.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();
    const m=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:2,steps:1}),c,p);
    m.position.set(x,y,z-d/2);return m;
  }
  function roof(w,h,d,x,y,z,c,p) {
    const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();
    const m=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2}),c,p);
    m.position.set(x,y,z-d/2);
  }
  function window(x,y,z,w,h,p) {
    bevel(w+.055,h+.055,.035,x,y,z,'shade',p,.008);
    box(w,h,.025,x,y,z+.027,'glow',p);
    box(.018,h,.016,x,y,z+.045,'wood',p);
    box(w,.018,.016,x,y,z+.045,'wood',p);
  }
  function tree(x,y,z,h= .7,variant=0) {
    disk(.17,.06,x,y+.03,z,'shade');disk(.145,.025,x,y+.07,z,'sage');
    disk(.027,h*.65,x,y+h*.34,z,'wood');
    // Irregular overlapping crowns read as foliage instead of plastic cones.
    for(let i=0;i<(variant?9:7);i++) {
      const a=i*2.399, t=i/8;
      const crown=ball(1,x+Math.cos(a)*h*.13*(1-t),y+h*(.40+t*.55),z+Math.sin(a)*h*.13*(1-t),i%3?'leaf':'sage');
      crown.scale.set(h*(variant?.19:.12)*(1-t*.4),h*(variant?.19:.23),h*(variant?.18:.12)*(1-t*.4));
      for(let sprig=0;sprig<4;sprig++) {
        const q=a+sprig*1.57;
        const leaf=mesh(new T.IcosahedronGeometry(h*.085,1),sprig%2?'leaf':'sage');
        leaf.position.set(crown.position.x+Math.cos(q)*h*.13,crown.position.y+Math.sin(q*2)*h*.09,crown.position.z+Math.sin(q)*h*.13);
      }
    }
  }
  function citizen(x,y,z) {
    disk(.045,.16,x,y+.08,z,'paper');ball(.047,x,y+.205,z,'paper');
    for(const dx of [-.023,.023]) disk(.014,.07,x+dx,y-.02,z,'wood');
  }
  function lamp(x,y,z) {
    disk(.065,.035,x,y,z,'gold');disk(.016,.36,x,y+.18,z,'gold');
    ball(.045,x,y+.38,z,'glow');disk(.065,.018,x,y+.43,z,'gold');
  }
  // Interlocking terraces, masonry courses and a planted island edge.
  function terrace(x,z,r,y,h) {
    disk(r,h,x,y+h/2,z,'shade');disk(r-.025,.045,x,y+h+.022,z,'paper');
    const courses=Math.max(2,Math.ceil(h/.11));
    for(let row=0;row<courses;row++) {
      const count=Math.ceil(r*24);
      for(let i=0;i<count;i++) {
        const a=(i+(row%2)*.5)*Math.PI*2/count;
        const block=box(.012,h/courses-.014,.018,x+Math.cos(a)*(r+.004),y+(row+.5)*h/courses,z+Math.sin(a)*(r+.004),'ivory');block.rotation.y=-a;
      }
      const seam=mesh(new T.TorusGeometry(r+.003,.006,4,96),'ivory');seam.rotation.x=Math.PI/2;seam.position.set(x,y+row*h/courses,z);
    }
  }
  terrace(0,0,3.40,0,.39);
  terrace(-1.65,.05,1.38,.39,.24);
  terrace(1.70,-.15,1.29,.39,.29);
  terrace(0,-1.53,1.47,.39,.41);
  // The front promenade is a stepped overlook, not an empty record-shaped disc.
  terrace(0,1.22,1.14,.39,.12);
  for(let i=0;i<5;i++)box(1.15,.06,.16,0,.10+i*.07,2.65-i*.16,'paper');
  for(let i=0;i<66;i++) {
    const a=i*2.399,r=3.18+(i%3)*.045;
    const foliage=ball(.09+(i%4)*.012,Math.cos(a)*r,.44+(i%3)*.04,Math.sin(a)*r,i%2?'leaf':'sage');foliage.scale.y=.7;
  }
  // Flat canal ribbons avoid the previous raised blue pipe effect.
  function canal(points,width=.11) {
    const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),vertices=[],indices=[];
    for(let i=0;i<=48;i++) {
      const p=curve.getPoint(i/48),t=curve.getTangent(i/48),n=new T.Vector3(-t.z,0,t.x).normalize();
      for(const side of [-1,1])vertices.push(p.x+n.x*width*side,p.y,p.z+n.z*width*side);
      if(i<48){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();mesh(g,'blue');
  }
  for(const side of [-1,1])canal([[side*.55,.435,2.5],[side*1.03,.435,1.75],[side*.95,.435,.65],[side*.65,.435,-.3]]);
  // Academy: modern glass learning campus, flat terraces and orange fins.
  for(let i=0;i<3;i++) disk(1.30-i*.12,.12,0,.44+i*.12,-1.55,'ivory');
  const academy=group(0,.80,-1.70);
  for(let floor=0;floor<2;floor++) {
    const y=.12+floor*.48;
    bevel(2.05,.09,.95,0,y,0,'paper',academy);
    bevel(1.85,.38,.77,0,y+.235,0,'blue',academy);
    for(let j=0;j<8;j++)box(.035,.42,.08,-.85+j*.24,y+.25,.43,'red',academy);
    for(let j=0;j<15;j++)box(.009,.39,.012,-.85+j*.12,y+.25,.405,'gold',academy);
    for(let j=0;j<3;j++)box(1.78,.009,.014,0,y+.09+j*.13,.41,'gold',academy);
    for(let j=0;j<7;j++)box(.07,.014,.025,-.72+j*.24,y+.39,.41,'glow',academy);
    for(const x of [-.94,.94])box(.065,.43,.87,x,y+.25,0,'ivory',academy);
    for(let j=0;j<6;j++)box(.12,.025,.20,-.70+j*.28,y+.09,.17,'wood',academy);
  }
  bevel(2.17,.09,1.03,0,1.10,0,'paper',academy);
  for(let j=0;j<4;j++) {
    const panel=bevel(.34,.025,.48,-.67+j*.44,1.19,-.12,'ink',academy,.008);panel.rotation.x=.18;
    for(let k=0;k<3;k++)box(.27,.008,.012,-.67+j*.44,1.22,-.25+k*.12,'signal',academy);
  }
  // Staggered classroom wings, planted roof decks and glazed curtain walls.
  for(const side of [-1,1]) {
    const wing=group(side*.96,.80,-1.78);
    bevel(.64,.67,.88,0,.34,0,'ivory',wing);
    for(let row=0;row<2;row++)for(let col=0;col<3;col++) {
      box(.15,.24,.025,-.20+col*.20,.20+row*.29,.455,'blue',wing);
      box(.012,.24,.03,-.20+col*.20,.20+row*.29,.475,'gold',wing);
    }
    bevel(.75,.055,.98,0,.72,0,'paper',wing);
    for(let j=0;j<5;j++) {
      box(.10,.08,.16,-.25+j*.12,.80,.28,'shade',wing);
      const shrub=ball(.08,-.25+j*.12,.88,.28,'sage',wing);shrub.scale.y=.65;
    }
    for(let j=0;j<5;j++)disk(.008,.20,-.27+j*.135,.85,-.43,'gold',wing);
    line([[-.31,.95,-.43],[.31,.95,-.43]],.009,'gold',wing);
  }
  // Open-book sign distinguishes teaching from the surrounding neighborhoods.
  for(const side of [-1,1]) {
    const leaf=bevel(.19,.22,.035,side*.10,.92,.51,'paper',academy,.009);leaf.rotation.y=side*.2;
    for(let row=0;row<3;row++)box(.13,.008,.01,side*.10,.87+row*.05,.54,'gold',academy);
  }
  for(let i=0;i<5;i++)box(1.15,.065,.17,0,.43+i*.07,-.32-i*.15,'paper');
  const communityStart=root.children.length;
  // Community: an open marketplace rather than another institutional hall.
  disk(1.10,.12,-1.70,.46,.10,'ivory');disk(1.03,.025,-1.70,.535,.10,'paper');
  disk(.27,.07,-1.65,.59,.05,'shade');disk(.22,.025,-1.65,.64,.05,'blue');
  disk(.045,.20,-1.65,.73,.05,'paper');disk(.13,.025,-1.65,.84,.05,'paper');
  for(const [x,z] of [[-2.15,-.42],[-1.40,-.48]]) {
    bevel(.51,.25,.28,x,.68,z,'wood');
    for(const dx of [-.24,.24])disk(.016,.44,x+dx,.88,z+.06,'gold');
    for(let stripe=0;stripe<6;stripe++) {
      const awning=box(.10,.035,.45,x-.25+stripe*.10,1.10,z+.06,stripe%2?'paper':'red');awning.rotation.x=.14;
    }
    for(let fruit=0;fruit<5;fruit++)ball(.032,x-.18+fruit*.09,.84,z+.03,fruit%2?'red':'sage');
  }
  for(const [x,z] of [[-1.23,.40],[-2.12,.48]]) {
    disk(.13,.035,x,.76,z,'wood');disk(.018,.21,x,.65,z,'gold');
    for(const dx of [-.19,.19]) {disk(.06,.025,x+dx,.64,z,'paper');disk(.013,.10,x+dx,.58,z,'gold');}
  }
  for(const [x,z,angle] of [[-2.55,-.60,-.15],[-2.74,.35,-.4],[-2.10,1.35,.2],[-1.40,1.38,.1]]) {
    const g=group(x,.41,z);g.rotation.y=angle;
    bevel(.42,.38,.43,0,.20,0,'ivory',g,.012);roof(.52,.19,.54,0,.41,0,'red',g);
    for(const dx of [-.12,.12])window(dx,.23,.225,.07,.13,g);
    box(.08,.18,.025,0,.10,.23,'wood',g);box(.065,.20,.07,.14,.51,-.10,'ivory',g);
  }
  for(const [x,z] of [[-1.8,.75],[-1.5,.80],[-1.22,.65],[-2.30,.85],[.45,-.18]])citizen(x,.56,z);
  // Additional two-storey shophouses complete the neighborhood silhouette.
  for(const [x,z,yaw] of [[-2.25,-.87,.15],[-1.65,-.93,0],[-2.78,-.13,.35]]) {
    const g=group(x,.42,z);g.rotation.y=yaw;
    bevel(.45,.76,.46,0,.39,0,'ivory',g,.012);roof(.57,.22,.58,0,.80,0,'red',g);
    for(let row=0;row<2;row++)for(const dx of [-.13,.13])window(dx,.24+row*.35,.24,.10,.19,g);
    box(.52,.045,.13,0,.49,.29,'paper',g);
    for(let j=0;j<6;j++)box(.012,.12,.012,-.23+j*.09,.57,.35,'gold',g);
    for(let j=0;j<10;j++) {
      const ridge=box(.016,.015,.59,-.25+j*.055,.83+.22*(1-Math.abs(-.25+j*.055)/.285),0,'shade',g);ridge.rotation.z=0;
    }
  }
  for(let i=communityStart;i<root.children.length;i++)root.children[i].position.y+=.13;
  // Cylindrical blue server towers match the concept's industrial skyline.
  for(const [x,z,h] of [[1.20,-.32,1.35],[1.91,-.64,1.85],[2.48,-.15,1.48]]) {
    disk(.32,h,x,.71+h/2,z,'ink');
    for(const y of [.72,.80,.71+h,.65+h])disk(.345,.045,x,y,z,'gold');
    for(let fin=0;fin<10;fin++) {
      const a=fin*Math.PI/5;
      disk(.012,h,x+Math.cos(a)*.32,.71+h/2,z+Math.sin(a)*.32,'gold');
      for(let row=0;row<12;row++) {
        const rack=box(.13,.045,.015,x+Math.sin(a)*.323,.84+row*(h-.25)/12,z+Math.cos(a)*.323,'blue');rack.rotation.y=a;
        const led=box(.032,.010,.018,x+Math.sin(a)*.337,.85+row*(h-.25)/12,z+Math.cos(a)*.337,row%3?'signal':'glow');led.rotation.y=a;
      }
    }
    disk(.26,.025,x,.75+h,z,'shade');
    const fan=mesh(new T.TorusGeometry(.17,.012,6,24),'ink');fan.rotation.x=Math.PI/2;fan.position.set(x,.78+h,z);
    for(let j=0;j<4;j++){const blade=box(.27,.012,.035,x,.78+h,z,'ink');blade.rotation.y=j*Math.PI/4;}
    disk(.01,.18,x,.84+h,z,'gold');
  }
  for(const [x,z] of [[1.35,.45],[2.05,.62],[2.67,.50]]) {
    bevel(.40,.26,.36,x,.82,z,'shade');
    for(let j=0;j<5;j++)box(.28,.015,.018,x,.74+j*.04,z+.19,'ink');
    disk(.12,.025,x,.97,z,'ink');
    const fan=mesh(new T.TorusGeometry(.09,.01,5,20),'gold');fan.rotation.x=Math.PI/2;fan.position.set(x,.985,z);
    line([[x,.78,z-.16],[x,.65,z-.30],[x-.20,.65,z-.30]],.025,'gold');
  }
  // Agrim is the focal point: a bespectacled, bearded mayor in his black
  // hoodie, standing at the junction of all three districts over a city map.
  disk(.82,.10,0,.45,.83,'shade');disk(.77,.045,0,.525,.83,'paper');
  const mayor=group(0,.59,.78);
  function oval(x,y,z,sx,sy,sz,color,parent=mayor) {
    const m=ball(1,x,y,z,color,parent);m.scale.set(sx,sy,sz);return m;
  }
  for(const side of [-1,1]) {
    oval(side*.10,.08,.045,.09,.06,.14,'hair');
    disk(.067,.36,side*.10,.27,0,'hoodie',mayor);
  }
  oval(0,.63,0,.215,.31,.135,'hoodie');
  oval(0,.83,-.065,.22,.12,.14,'hoodie');
  disk(.075,.15,0,.94,0,'skin',mayor);
  oval(0,1.16,0,.17,.225,.153,'skin');
  for(const side of [-1,1])oval(side*.167,1.15,0,.027,.052,.035,'skin');
  oval(0,1.31,-.035,.172,.12,.145,'hair');
  oval(-.045,1.35,.033,.13,.08,.12,'hair');
  for(let strand=0;strand<7;strand++)line([[-.13+strand*.035,1.34,.09],[-.10+strand*.035,1.40,.02],[-.08+strand*.03,1.34,-.10]],.009,'hair',mayor);
  // Beard follows the lower face, with a visible skin mouth and nose.
  oval(0,1.04,.10,.136,.09,.065,'hair');
  oval(0,1.075,.162,.065,.022,.009,'skin');
  oval(0,1.14,.15,.028,.040,.032,'skin');
  for(const side of [-1,1]) {
    oval(side*.072,1.21,.143,.011,.013,.010,'hair');
    const glasses=mesh(new T.TorusGeometry(.063,.006,8,32),'gold',mayor);glasses.position.set(side*.075,1.205,.162);glasses.scale.y=.88;
    line([[side*.138,1.21,.16],[side*.17,1.22,.08],[side*.17,1.20,0]],.008,'gold',mayor);
  }
  line([[-.014,1.21,.165],[0,1.22,.17],[.014,1.21,.165]],.008,'gold',mayor);
  for(const side of [-1,1])line([[side*.06,.83,.13],[side*.05,.69,.155]],.008,'shade',mayor);
  // One open hand directs the machine district; the other rests on the map.
  line([[.20,.78,0],[.36,.70,.03],[.52,.84,.04]],.065,'hoodie',mayor);
  oval(.57,.87,.04,.08,.042,.055,'skin');
  line([[-.20,.77,0],[-.33,.59,.12],[-.29,.56,.29]],.063,'hoodie',mayor);
  oval(-.28,.56,.34,.06,.035,.07,'skin');
  // Crescent planning desk wraps around the mayor, with a miniature city map.
  const deskShape=new T.Shape();
  deskShape.absarc(0,0,.79,.12,Math.PI-.12,false);
  deskShape.absarc(0,0,.45,Math.PI-.12,.12,true);deskShape.closePath();
  const desk=mesh(new T.ExtrudeGeometry(deskShape,{depth:.055,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:32}),'gold');
  desk.rotation.x=Math.PI/2;desk.position.set(0,1.13,.88);
  for(const x of [-.68,.68]) {
    bevel(.12,.53,.16,x,.81,1.05,'ivory');disk(.12,.025,x,1.10,1.05,'gold');
  }
  for(let i=0;i<14;i++) {
    const a=.25+i*(Math.PI-.5)/13,x=Math.cos(a)*.62,z=.88+Math.sin(a)*.62;
    const tile=box(.11,.012,.12,x,1.145,z,'blue');tile.rotation.y=-a;
    box(.045,.045+(i%3)*.025,.045,x,1.17+(i%3)*.012,z,'paper');
  }
  // Stone balustrades and lanterns anchor the mayor's overlook.
  for(const side of [-1,1])for(let i=0;i<5;i++) {
    const a=side*(.90+i*.14),x=Math.sin(a)*.94,z=.83+Math.cos(a)*.94;
    disk(.019,.17,x,.64,z,'ivory');
    if(i===2)lamp(x,.72,z);
  }
  // Landscape and street furniture add scale and inhabited detail.
  for(const [i,[x,z]] of [[-2.05,-1.65],[-1.45,-2.35],[1.3,-2.28],[1.75,-1.90],[-2.92,-.25],[-2.60,1.05],[-.91,1.94],[1.65,1.25],[2.35,.85],[2.80,-.8],[.9,2.65],[-1.35,2.48]].entries())tree(x,.40,z,.56+(i%3)*.17,i%2);
  for(const [x,z] of [[-.95,-1.32],[.95,-1.32],[-.88,-1.93],[.88,-1.93]])tree(x,.79,z,.7,1);
  for(const [x,z] of [[-2.2,1.72],[2.50,1.25],[-.7,2.7],[1.7,-1.5],[-2.85,-1.05]])lamp(x,.41,z);
  for(const [x,z] of [[-1.62,1.06],[2.20,.91]]) {
    box(.36,.045,.14,x,.53,z,'wood');box(.36,.12,.03,x,.62,z-.065,'wood');
    for(const dx of [-.13,.13])box(.035,.14,.10,x+dx,.46,z,'gold');
  }
  for(let i=0;i<13;i++){const a=i*.25+.2;const shrub=ball(.11,Math.cos(a)*3.02,.49,Math.sin(a)*3.02,'sage');shrub.scale.y=.75;}
  // Paving joints, stepped approach and planted parapets break up the empty floor.
  for(let ring=0;ring<5;ring++) {
    const r=.22+ring*.16;
    const joint=mesh(new T.TorusGeometry(r,.0035,4,72),'shade');joint.rotation.x=Math.PI/2;joint.position.set(0,.551,.83);
    for(let j=0;j<14;j++) {
      const a=j*Math.PI/7+ring*.12;
      const seam=box(.004,.006,.15,Math.sin(a)*(r+.07),.554,.83+Math.cos(a)*(r+.07),'shade');seam.rotation.y=a;
    }
  }
  for(let i=0;i<6;i++)box(.95,.047,.12,0,.40+i*.025,2.28-i*.12,'paper');
  for(const side of [-1,1]) {
    for(let i=0;i<7;i++) {
      const x=side*(.72+i*.10),z=2.25-i*.13;
      const wall=box(.17,.16,.13,x,.49,z,'ivory');wall.rotation.y=side*.55;
      const cap=box(.19,.035,.16,x,.59,z,'paper');cap.rotation.y=side*.55;
      if(i%2===0) {
        for(let j=0;j<6;j++) {
          const a=j*2.4;
          ball(.035,x+Math.cos(a)*.06,.65+Math.sin(j)*.025,z+Math.sin(a)*.05,j%3?'leaf':'red');
        }
      }
    }
  }
  // Rooftop terrace parapets and a rooftop garden distinguish the academy.
  for(const side of [-1,1]) {
    box(.04,.12,.90,side*1.04,2.0,-1.70,'paper');
    for(let j=0;j<8;j++) {
      ball(.045,side*.99,2.09,-2.08+j*.11,j%3?'leaf':'sage');
    }
  }
  root.updateMatrixWorld(true);
  const framingPoints=[];
  root.traverse(object => {
    if (!object.isMesh) return;
    const geometry=object.geometry, params=geometry.parameters;
    if (geometry.type === 'CylinderGeometry' && params.radiusTop > 1) {
      for(let i=0;i<32;i++)for(const y of [-params.height/2,params.height/2])
        framingPoints.push(new T.Vector3(Math.cos(i*Math.PI/16)*params.radiusTop,y,Math.sin(i*Math.PI/16)*params.radiusTop).applyMatrix4(object.matrixWorld));
    } else if (geometry.type === 'TorusGeometry' && params.radius > 1) {
      for(let i=0;i<48;i++)for(const z of [-params.tube,params.tube])
        framingPoints.push(new T.Vector3(Math.cos(i*Math.PI/24)*(params.radius+params.tube),Math.sin(i*Math.PI/24)*(params.radius+params.tube),z).applyMatrix4(object.matrixWorld));
    } else {
      geometry.computeBoundingBox();const b=geometry.boundingBox;
      for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])
        framingPoints.push(new T.Vector3(x,y,z).applyMatrix4(object.matrixWorld));
    }
  });
  const bounds=new T.Box3().setFromObject(root), center=bounds.getCenter(new T.Vector3());
  framingPoints.forEach(p=>p.sub(new T.Vector3(center.x,bounds.min.y,center.z)));
  const model=finish(76);
  model.userData={...model.userData,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:-.15,initialElevation:.44,framingPoints};
  model.userData.annotations = [
    { id: 'community', position: [-1.85, 1.48, .40] },
    { id: 'academy', position: [0, 2.25, -1.65] },
    { id: 'machines', position: [2.0, 2.78, -.20] },
    { id: 'mayor', position: [0, .58, 1.86] },
  ];
  return model;
}
