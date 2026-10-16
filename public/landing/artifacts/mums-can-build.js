// Mums Can Build: a tactile miniature voice-to-software studio.
export function createArtifact(T) {
  const root=new T.Group();root.name="mums-can-build-studio";
  const moving=(o,name)=>{o.name=name;for(let p=o;p&&p!==root;p=p.parent)p.userData.motion=true;return o;};
  const tickets=[],statusLights=[];
  let seed=65; const pixels=new Uint8Array(128*128*4);
  for(let i=0;i<pixels.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=125+(seed/4294967296-.5)*75;pixels[i]=pixels[i+1]=pixels[i+2]=n;pixels[i+3]=255;}
  const grain=new T.DataTexture(pixels,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(4,4);grain.needsUpdate=true;
  const paper=(color)=>new T.MeshStandardMaterial({color,roughness:.83,bumpMap:grain,bumpScale:.009,side:T.DoubleSide});
  const mat={cream:paper(0xf1dfbf),light:paper(0xffedcf),shade:paper(0xc4aa82),red:paper(0xba3527),redDark:paper(0x7b201b),blue:paper(0x3b6594),blueDark:paper(0x142d47),blueLight:paper(0x6487ad),gold:paper(0xd9b071),ink:paper(0x66553e),glow:new T.MeshStandardMaterial({color:0xffe9b3,emissive:0xffbb51,emissiveIntensity:1.4,roughness:.6})};
  mat.sage=paper(0x788365);mat.leaf=paper(0x536950);mat.sky=paper(0xf5d798);mat.hair=paper(0x453c31);
  const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
  const mesh=(geo,c='cream',p=root)=>{const m=new T.Mesh(geo,mat[c]);m.castShadow=m.receiveShadow=true;p.add(m);return m;};
  const box=(w,h,d,x,y,z,c='cream',p=root)=>{const m=mesh(new T.BoxGeometry(w,h,d),c,p);m.position.set(x,y,z);return m;};
  function roundShape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
  function extrude(s,d,c,p=root,bevel=.025){return mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:16}),c,p);}
  function rounded(w,h,d,x,y,z,c='cream',p=root,r=.05){const m=extrude(roundShape(w,h,r),d,c,p);m.position.set(x,y,z-d/2);return m;}
  function disk(r,h,x,y,z,c='cream',p=root){const m=mesh(new T.CylinderGeometry(r,r,h,48),c,p);m.position.set(x,y,z);return m;}
  function faceDisk(r,h,x,y,z,c='cream',p=root){const m=disk(r,h,x,y,z,c,p);m.rotation.x=Math.PI/2;return m;}
  function rod(a,b,r,c='cream',p=root){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av);const m=mesh(new T.CylinderGeometry(r,r,v.length(),20),c,p);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;}
  function path(points,r,c,p=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),32,r,8,false),c,p);}
  function polygon(points,d,c,p=root){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return extrude(s,d,c,p,.004);}
  function surface(nx,ny,sample,c,p=root){const pos=[],uv=[],idx=[];for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){pos.push(...sample(i/nx,j/ny));uv.push(i/nx,j/ny);if(i<nx&&j<ny){let a=j*(nx+1)+i;idx.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return mesh(g,c,p);}
  const sphere=(x,y,z,sx,sy,sz,c='cream',p=root)=>{const m=mesh(new T.SphereGeometry(1,24,16),c,p);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;};
  const flat=(w,d,h,x,y,z,c='cream',p=root,r=.08)=>{const m=rounded(w,d,h,0,0,0,c,p,r);m.rotation.x=-Math.PI/2;m.position.set(x,y-h/2,z);return m;};
  // A slim architectural plinth gives the three stations one coherent footprint.
  flat(8.35,3.9,.17,0,.12,0,'cream',root,.34);
  flat(8.25,3.8,.045,0,.23,0,'light',root,.31);
  flat(8.08,3.63,.018,0,.265,0,'cream',root,.28);
  // Seated speaker: upholstered chair, sculpted clothing, swept hair and a speaking gesture.
  const person=group(-3.0,.29,.58);person.rotation.y=.38;
  const chair=group(0,0,-.15,person);
  flat(.70,.69,.12,0,.76,0,'shade',chair,.14);
  rounded(.71,.86,.12,0,1.13,-.33,'cream',chair,.20);
  rounded(.62,.69,.08,0,1.14,-.244,'light',chair,.19);
  for(const x of [-.27,.27])for(const z of [-.24,.24])rod([x*1.2,0,z*1.25],[x,.76,z],.04,'shade',chair);
  sphere(0,.91,.02,.31,.16,.28,'light',person);
  sphere(0,1.31,-.05,.28,.40,.21,'light',person);
  // Tailored skirt drapes across the knees, with a subtly pleated hem.
  const skirt=mesh(new T.CylinderGeometry(.27,.35,.65,40),'cream',person);skirt.position.set(0,.65,.32);skirt.rotation.x=-.22;
  for(let i=-2;i<=2;i++)path([[i*.095,.87,.52],[i*.11,.55,.63],[i*.12,.34,.57]],.007,'light',person);
  for(const x of [-.17,.17]){
    rod([x,.54,.39],[x,.16,.51],.075,'light',person);
    sphere(x,.09,.63,.13,.08,.24,'cream',person);
    flat(.25,.43,.025,x,.035,.64,'shade',person,.08);
  }
  rod([0,1.53,-.04],[0,1.73,-.04],.08,'light',person);
  const head=moving(group(0,1.95,-.025,person),'speaker-head');head.rotation.y=.18;
  sphere(0,0,0,.235,.30,.22,'light',head);
  sphere(-.217,-.035,0,.045,.07,.045,'cream',head);sphere(.217,-.035,0,.045,.07,.045,'cream',head);
  // Layered cream hair cap covers the crown; curved locks sweep into a small bun.
  const cap=mesh(new T.SphereGeometry(.243,32,20,0,Math.PI*2,0,1.75),'cream',head);cap.position.set(0,.035,-.025);cap.scale.y=1.22;
  sphere(-.10,.06,-.25,.16,.18,.14,'shade',head);sphere(-.10,.06,-.275,.15,.17,.12,'cream',head);
  for(const [x,y,z,rx,rz] of [[-.12,.18,.14,.25,-.5],[.02,.24,.11,.3,-.7],[-.20,.03,.07,.2,-.35],[.20,.08,.03,-.1,.25]]){
    const lock=sphere(x,y,z,.085,.21,.065,'cream',head);lock.rotation.set(rx,0,rz);
  }
  for(const x of [-.085,.085])sphere(x,.015,.204,.018,.029,.012,'ink',head);
  sphere(.01,-.045,.219,.026,.034,.034,'cream',head);
  const mouth=polygon([[-.05,0],[.052,0],[.035,-.038],[0,-.055],[-.032,-.036]],.008,'ink',head);mouth.position.set(.012,-.105,.201);moving(mouth,'speaking-mouth');
  // Soft sleeves and bent arms, palms angled towards the microphone.
  for(const [a,b] of [[[-.22,1.48,-.03],[-.36,1.13,.16]],[[.22,1.48,-.03],[.38,1.27,.17]]]){
    rod(a,b,.09,'cream',person);sphere(...b,.09,.09,.09,'cream',person);
  }
  rod([-.36,1.13,.16],[-.10,1.12,.43],.062,'light',person);
  const resting=sphere(-.08,1.12,.45,.10,.045,.07,'light',person);resting.rotation.z=.12;
  const gesture=moving(group(.38,1.27,.17,person),'speaking-hand');
  rod([.38,1.27,.17],[.30,1.54,.41],.06,'light',gesture);
  const palm=sphere(.28,1.60,.43,.075,.12,.04,'light',gesture);palm.rotation.z=-.45;
  for(let i=0;i<3;i++)rod([.245+i*.034,1.63,.45],[.20+i*.034,1.74-i*.014,.46],.016,'light',gesture);
  for(const child of gesture.children)child.position.sub(new T.Vector3(.38,1.27,.17));
  // Round oak-style conversation table and a proper suspended capsule microphone.
  const table=group(-2.22,.28,.93);
  disk(.72,.09,0,1.02,0,'cream',table);disk(.69,.017,0,1.075,0,'light',table);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod([Math.cos(a)*.57,0,Math.sin(a)*.57],[Math.cos(a)*.38,.98,Math.sin(a)*.38],.042,'shade',table);}
  const mic=group(.18,1.09,-.03,table);
  disk(.19,.045,0,.022,0,'redDark',mic);disk(.17,.045,0,.052,0,'red',mic);
  rod([0,.075,0],[0,.35,0],.034,'red',mic);
  path([[-.15,.50,0],[-.16,.31,0],[0,.27,0],[.16,.31,0],[.15,.50,0]],.024,'redDark',mic);
  const capsule=group(0,.53,0,mic);capsule.rotation.z=.22;
  sphere(0,0,0,.12,.22,.11,'red',capsule);
  for(let i=0;i<8;i++){
    const y=-.12+i*.034,w=.095*Math.sqrt(1-(y/.23)**2);
    path([[-w,y,.068],[0,y,.111],[w,y,.068]],.007,'redDark',capsule);
  }
  const recording=moving(faceDisk(.026,.015,0,-.16,.084,'gold',capsule),'recording-light');recording.material=recording.material.clone();recording.material.emissive.setHex(0xe34728);
  path([[.07,.07,-.02],[.27,.01,-.15],[.30,-.60,-.29],[.20,-1.08,-.35],[.88,-1.08,-.50]],.014,'blueDark',mic);
  // Red easel with individually lifted task tickets, clipped edges and status dots.
  const board=group(-.30,.28,-.50);board.rotation.y=-.08;
  for(const x of [-.58,.58])rod([x*1.13,0,.15],[x,2.38,-.08],.041,'shade',board);
  rod([.08,0,-.65],[.08,2.10,-.12],.048,'shade',board);
  rounded(1.60,2.14,.12,0,1.43,0,'redDark',board,.09);
  rounded(1.57,2.11,.065,0,1.43,.075,'red',board,.08);
  rounded(.51,.10,.035,0,2.40,.14,'gold',board,.03);
  for(let i=0;i<3;i++){
    const y=2.02-i*.59;const ticket=moving(group(0,0,0,board),'task-ticket-'+i);tickets.push(ticket);
    rounded(1.34,.47,.055,0,y,.16,'shade',ticket,.045);
    rounded(1.34,.47,.055,0,y+.016,.20,'light',ticket,.045);
    const status=moving(faceDisk(.081,.023,-.49,y+.015,.249,'blue',ticket),'task-status-'+i);status.material=status.material.clone();status.material.emissive.setHex(0xd9b071);statusLights.push(status);
    for(const [j,w] of [[0,.68],[1,.48]])rounded(w,.027,.015,-.01-(.68-w)/2,y+.08-j*.13,.248,'shade',ticket,.012);
    for(let k=0;k<3;k++)rounded(.11,.023,.012,.31+k*.14,y-.12,.249,k<=i?'blueLight':'cream',ticket,.009);
  }
  // A thin, sculptural speech ribbon replaces the oversized pipe.
  const speech=new T.CatmullRomCurve3([new T.Vector3(-2.82,2.22,.79),new T.Vector3(-2.27,2.55,.23),new T.Vector3(-1.72,2.81,.04),new T.Vector3(-1.07,2.75,-.22)]);
  const speechRibbon=moving(surface(1,60,(u,v)=>{const p=speech.getPoint(v),w=.008+.17*Math.sin(v*Math.PI);return [p.x,p.y+(u-.5)*w*2,p.z+.035*Math.sin(v*6)];},'blue'),'speech-ribbon');
  const speechRest=speechRibbon.geometry.attributes.position.array.slice();
  // Builder's bench and browser canvas: UI components sit proud of the surface.
  const bench=group(2.05,.28,-.04);
  flat(2.63,1.30,.11,0,1.03,0,'cream',bench,.08);
  flat(2.58,1.26,.02,0,1.105,0,'light',bench,.075);
  for(const x of [-1.12,1.12])for(const z of [-.49,.49])rod([x,0,z],[x,.99,z],.053,'cream',bench);
  rod([-1.12,.35,-.49],[1.12,.35,-.49],.035,'shade',bench);
  const app=group(-.36,1.13,-.42,bench);app.rotation.x=-.045;
  rounded(1.57,1.48,.12,0,.76,0,'shade',app,.12);
  rounded(1.54,1.45,.065,0,.77,.08,'light',app,.11);
  for(let i=0;i<3;i++)faceDisk(.034,.02,-.59+i*.12,1.36,.126,['red','gold','blue'][i],app);
  rounded(.65,.027,.01,.22,1.36,.121,'cream',app,.012);
  rounded(1.28,1.13,.025,0,.65,.128,'cream',app,.045);
  rounded(.64,.82,.06,-.27,.66,.17,'light',app,.045);
  rounded(.43,.37,.06,.34,.44,.17,'light',app,.04);
  rounded(.43,.35,.025,.34,.89,.16,'shade',app,.035);
  // Diagram lines and a progress meter make it read as software, not blank boxes.
  for(let i=0;i<3;i++)rounded(.42-i*.07,.022,.012,-.29,.82-i*.11,.216,'blueLight',app,.008);
  rounded(.35,.10,.013,-.31,.39,.218,'blue',app,.03);
  rounded(1.10,.035,.01,0,.13,.18,'shade',app,.014);const progress=moving(group(-.55,.13,.19,app),'build-progress');rounded(1.10,.035,.013,.55,0,0,'blue',progress,.014);
  for(let i=0;i<4;i++)rounded(.045,.06+i*.035,.015,.20+i*.085,.42+i*.017,.215,'blueLight',app,.01);
  flat(.36,.29,.20,-.77,1.22,.27,'cream',bench,.035);
  flat(.23,.19,.09,-.43,1.17,.36,'light',bench,.02);
  flat(.25,.22,.12,.63,1.19,.34,'cream',bench,.035);
  // Engineered robot: doubled links, brass axle caps, cables and a two-finger gripper.
  const robot=group(.91,1.11,-.02,bench);
  disk(.27,.10,0,.05,0,'blueDark',robot);disk(.24,.07,0,.135,0,'blue',robot);
  const arm=moving(group(0,0,0,robot),'builder-arm');
  const joints=[[0,.22,0],[.28,1.10,0],[-.31,1.68,0],[-.77,1.40,0]],links=[],axles=[];
  for(let i=0;i<3;i++){
    const a=joints[i],b=joints[i+1],len=new T.Vector3(...a).distanceTo(new T.Vector3(...b));
    const link=moving(group(0,0,0,arm),'arm-link-'+i);links.push({object:link,length:len});
    for(const z of [-.075,.075])rounded(.14,len,.06,0,0,z,'blue',link,.055);
    rounded(.055,len*.66,.012,0,0,.114,'blueLight',link,.018);
    rod([.06,-len*.40,-.13],[.06,len*.40,-.13],.019,'blueDark',link);
  }
  for(let i=0;i<4;i++){
    const axle=moving(group(0,0,0,arm),'arm-axle-'+i);axles.push(axle);
    faceDisk(.14,.22,0,0,0,'blue',axle);faceDisk(.087,.024,0,0,.13,'shade',axle);faceDisk(.057,.018,0,0,.147,'light',axle);
  }
  const claw=moving(group(0,0,0,arm),'builder-gripper');
  rounded(.22,.16,.14,0,0,0,'blueDark',claw,.025);
  const fingers=[];
  for(const sign of [-1,1]){const finger=moving(group(0,0,0,claw),'gripper-finger-'+sign);fingers.push({object:finger,sign});rod([sign*.07,-.06,0],[sign*.17,-.20,0],.035,'blue',finger);rod([sign*.17,-.20,0],[sign*.13,-.33,0],.025,'blue',finger);}
  const component=moving(group(0,0,0,bench),'carried-component');
  rounded(.28,.29,.14,0,0,0,'blue',component,.035);rounded(.21,.21,.012,0,0,.086,'blueLight',component,.025);
  // Delicate dotted transfer arc carries the task into the builder station.
  const transfer=new T.CatmullRomCurve3([new T.Vector3(-.16,2.92,-.55),new T.Vector3(.55,3.25,-.55),new T.Vector3(1.48,3.25,-.47),new T.Vector3(2.15,2.97,-.25)]);
  for(let i=0;i<30;i++){const a=transfer.getPoint(i/30),b=transfer.getPoint((i+.48)/30);rod(a.toArray(),b.toArray(),.009,'blueLight');}
  for(const t of [.19,.48,.78]){const p=transfer.getPoint(t);faceDisk(.095,.035,p.x,p.y,p.z,'blue');faceDisk(.071,.009,p.x,p.y,p.z+.024,'blueLight');}
  const signals=Array.from({length:3},(_,i)=>moving(sphere(0,0,0,.035,.035,.035,'gold'),'task-signal-'+i));
  // Folded foliage and spare building blocks balance the studio without crowding it.
  const plant=group(3.58,.28,.65);
  const pot=mesh(new T.CylinderGeometry(.20,.15,.35,36),'cream',plant);pot.position.y=.175;
  disk(.17,.018,0,.35,0,'shade',plant);
  for(let i=0;i<5;i++){
    const a=(i-2)*.7,dx=Math.sin(a)*.35,dy=.65+(i%3)*.16,dz=Math.cos(a)*.12;
    path([[0,.34,0],[dx*.6,.65,dz*.6],[dx,dy+.32,dz]],.009,'blueDark',plant);
    surface(10,20,(u,v)=>{const w=Math.sin(v*Math.PI)*.11;return [dx*v+(u-.5)*w*2,.37+v*dy,dz*v+Math.abs(u-.5)*.09*Math.sin(v*Math.PI)];},i%2?'blueLight':'blue',plant);
  }
  flat(.39,.36,.12,3.40,.35,1.27,'shade');flat(.30,.29,.22,3.39,.52,1.27,'light');
  // Recessed front-edge wayfinding keeps the three-part flow legible from a distance.
  for(const [x,count] of [[-2.45,1],[-.3,2],[2.05,3]])for(let i=0;i<count;i++)disk(.026,.008,x+(i-(count-1)/2)*.10,.282,1.63,'blue');
  // One seekable 18-second story: speak, structure, dispatch, assemble, report back.
  const duration=18,clamp=T.MathUtils.clamp;
  const ease=(t,a,b)=>{const v=clamp((t-a)/(b-a),0,1);return v*v*(3-2*v);};
  const window=(t,a,b,c,d)=>ease(t,a,b)*(1-ease(t,c,d));
  const wrist=new T.Vector3(),up=new T.Vector3(0,1,0);
  const rest=new T.Vector3(-.77,1.40,0),pickup=new T.Vector3(-.28,.60,.36),place=new T.Vector3(-.93,1.35,-.22);
  function animate(elapsed){
    const t=((elapsed%duration)+duration)%duration;
    const speak=window(t,.3,1,3.8,4.5),reset=1-ease(t,16.8,18);
    head.rotation.x=.035*Math.sin(t*4)*speak;head.rotation.y=.18+.055*Math.sin(t*2)*speak;
    mouth.scale.y=.35+speak*(.35+.30*Math.sin(t*12));
    gesture.rotation.z=.12*Math.sin(t*3)*speak;gesture.rotation.x=.06*Math.sin(t*2)*speak;
    recording.material.emissiveIntensity=.08+.8*speak*(.7+.3*Math.sin(t*9));
    const pos=speechRibbon.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){
      const v=Math.floor(i/2)/60;
      pos.setXYZ(i,speechRest[i*3],speechRest[i*3+1]+.045*Math.sin(v*13-t*7)*Math.sin(v*Math.PI)*speak,speechRest[i*3+2]);
    }
    pos.needsUpdate=true;speechRibbon.geometry.computeVertexNormals();
    tickets.forEach((ticket,i)=>{const lift=window(t,3+i*.65,3.4+i*.65,4.8+i*.65,5.3+i*.65);ticket.position.z=.09*lift;ticket.rotation.x=-.025*lift;const done=ease(t,3.2+i*.65,3.7+i*.65)*reset;statusLights[i].material.color.setHex(done>.5?0xd9b071:0x3b6594);statusLights[i].material.emissiveIntensity=.25*done;});
    signals.forEach((signal,i)=>{const v=(t-5.8-i*.28)/2.5;signal.visible=v>0&&v<1;signal.position.copy(transfer.getPoint(clamp(v,0,1)));const size=.04*Math.sin(Math.PI*clamp(v,0,1));signal.scale.setScalar(size);});
    // Two-link inverse kinematics keeps the shoulder and elbow connected as the gripper reaches.
    wrist.copy(rest);
    if(t<9.3)wrist.lerp(pickup,ease(t,7.4,9.3));
    else if(t<11.1)wrist.copy(pickup).lerp(rest,ease(t,9.6,11.1));
    else if(t<13.2)wrist.lerp(place,ease(t,11.2,13.2));
    else wrist.copy(place).lerp(rest,ease(t,14.1,16.4));
    const yaw=Math.atan2(wrist.z,-wrist.x);arm.rotation.y=yaw;
    const wx=-Math.hypot(wrist.x,wrist.z),wy=wrist.y;
    const target=new T.Vector2(wx+.46,wy+.28-.22),l1=links[0].length,l2=links[1].length,d=target.length();
    const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along)),unit=target.clone().divideScalar(d);
    const elbow=new T.Vector3(unit.x*along+unit.y*height,.22+unit.y*along-unit.x*height,0);
    const pts=[new T.Vector3(0,.22,0),elbow,new T.Vector3(wx+.46,wy+.28,0),new T.Vector3(wx,wy,0)];
    links.forEach(({object,length},i)=>{const v=pts[i+1].clone().sub(pts[i]);object.position.copy(pts[i]).add(pts[i+1]).multiplyScalar(.5);object.quaternion.setFromUnitVectors(up,v.clone().normalize());object.scale.y=v.length()/length;});
    axles.forEach((o,i)=>o.position.copy(pts[i]));
    claw.position.copy(pts[3]);claw.position.y-=.10;
    const opened=window(t,7.5,8.6,9.1,9.6)+window(t,13.2,13.6,15.1,15.6);
    fingers.forEach(({object,sign})=>object.position.x=sign*.055*opened);
    const held=t>=9.4&&t<13.4;
    component.position.set(.91+pickup.x,1.11+pickup.y-.44,-.02+pickup.z);
    if(held)component.position.set(.91+wrist.x,1.11+wrist.y-.44,-.02+wrist.z);
    else if(t>=13.4)component.position.set(.91+place.x,1.11+place.y-.44,-.02+place.z);
    // The inserted component clears before the next cycle; no visible teleport back to the bench.
    const reveal=ease(t,.15,.7)*(1-ease(t,16.6,17.4));component.scale.setScalar(Math.max(.001,reveal));
    progress.scale.x=Math.max(.001,ease(t,9.5,14.5)*reset);
  }
  const bounds=new T.Box3();
  for(let i=0;i<=90;i++){animate(i/90*duration);root.updateMatrixWorld(true);bounds.union(new T.Box3().setFromObject(root));}
  const framingPoints=[];
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])framingPoints.push(new T.Vector3(x,y,z));
  animate(0);root.updateMatrixWorld(true);
  // Batch each rigid branch in its own local coordinates, preserving moving joints.
  function batchBranch(parent){
    const keep=parent.children.filter(o=>o.userData.motion||o.isLight);
    for(const branch of keep)if(!branch.isMesh&&!branch.isLight)batchBranch(branch);
    const inverse=parent.matrixWorld.clone().invert(),batches=new Map();
    for(const branch of parent.children.filter(o=>!keep.includes(o)))branch.traverse(o=>{
      if(!o.isMesh)return;
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
      if(!batches.has(o.material))batches.set(o.material,{p:[],n:[],uv:[]});const b=batches.get(o.material);
      for(const v of g.attributes.position.array)b.p.push(v);for(const v of g.attributes.normal.array)b.n.push(v);
      if(g.attributes.uv)for(const v of g.attributes.uv.array)b.uv.push(v);else for(let i=0;i<g.attributes.position.count;i++)b.uv.push(0,0);
      g.dispose();o.geometry.dispose();
    });
    parent.clear();for(const o of keep)parent.add(o);
    for(const [material,b] of batches){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();const m=new T.Mesh(g,material);m.castShadow=m.receiveShadow=true;parent.add(m);}
  }
  batchBranch(root);
  root.userData={conceptual:true,artifactId:65,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:-.10,initialElevation:.28,framingPoints,animate,animationDuration:duration};
  return root;
}
