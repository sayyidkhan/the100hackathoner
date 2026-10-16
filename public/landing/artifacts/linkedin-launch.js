// Prompt & Pixel: a tactile paper production studio modeled from the concept art.
export function createArtifact(T) {
  const root = new T.Group(); root.name = 'prompt-and-pixel-studio';
  const moving=(o,name)=>{o.name=name;o.userData.motion=true;return o;};
  const rollers=[],slats=[],curtains=[],copyLines=[],bayLights=[],scanners=[];
  let seed=52; const pixels=new Uint8Array(128*128*4);
  for(let i=0;i<pixels.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=125+(seed/4294967296-.5)*75;pixels[i]=pixels[i+1]=pixels[i+2]=n;pixels[i+3]=255;}
  const grain=new T.DataTexture(pixels,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(4,4);grain.needsUpdate=true;
  const paper=(color)=>new T.MeshStandardMaterial({color,roughness:.83,bumpMap:grain,bumpScale:.009,side:T.DoubleSide});
  const mat={cream:paper(0xf1dfbf),light:paper(0xffedcf),shade:paper(0xc4aa82),red:paper(0xba3527),redDark:paper(0x7b201b),blue:paper(0x244c70),blueDark:paper(0x142d47),blueLight:paper(0x426582),gold:paper(0xd9b071),ink:paper(0x66553e),glow:new T.MeshStandardMaterial({color:0xffe9b3,emissive:0xffbb51,emissiveIntensity:1.4,roughness:.6})};
  const group=(x=0,y=0,z=0,p=root)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
  const mesh=(geo,c='cream',p=root)=>{const m=new T.Mesh(geo,mat[c]);m.castShadow=m.receiveShadow=true;p.add(m);return m;};
  const box=(w,h,d,x,y,z,c='cream',p=root)=>{const m=mesh(new T.BoxGeometry(w,h,d),c,p);m.position.set(x,y,z);return m;};
  function roundShape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
  function extrude(s,d,c,p=root,bevel=.025){return mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:16}),c,p);}
  function rounded(w,h,d,x,y,z,c='cream',p=root,r=.05){const m=extrude(roundShape(w,h,r),d,c,p);m.position.set(x,y,z-d/2);return m;}
  function disk(r,h,x,y,z,c='cream',p=root){const m=mesh(new T.CylinderGeometry(r,r,h,48),c,p);m.position.set(x,y,z);return m;}
  function faceDisk(r,h,x,y,z,c='cream',p=root){const m=disk(r,h,x,y,z,c,p);m.rotation.x=Math.PI/2;return m;}
  function rod(a,b,r,c='cream',p=root){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av);const m=mesh(new T.CylinderGeometry(r,r,v.length(),32),c,p);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;}
  function path(points,r,c,p=root){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),48,r,8,false),c,p);}
  function polygon(points,d,c,p=root){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return extrude(s,d,c,p,.004);}
  function surface(nx,ny,sample,c,p=root){const pos=[],uv=[],idx=[];for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){pos.push(...sample(i/nx,j/ny));uv.push(i/nx,j/ny);if(i<nx&&j<ny){let a=j*(nx+1)+i;idx.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return mesh(g,c,p);}
  // Rounded rectangular foundation, with a fine layered paper edge.
  const base=rounded(6.6,3.55,.27,0,0,0,'cream',root,.38);base.rotation.x=-Math.PI/2;base.position.set(0,.155,0);
  const baseTop=rounded(6.53,3.48,.035,0,0,0,'light',root,.36);baseTop.rotation.x=-Math.PI/2;baseTop.position.set(0,.30,0);
  // Enclosed studio shell: three real front apertures and a side intake opening.
  const hx=.77,hy=1.53,hz=-.55,hw=3.63,hh=2.36,hd=1.42;
  const facade=roundShape(hw,hh,.15);
  for(const x of [-.42,.74,1.88]){const hole=roundShape(.94,1.80,.12);facade.holes.push(new T.Path(hole.getPoints(48).map(p=>new T.Vector2(p.x+x-hx,p.y-.20))));}
  const front=extrude(facade,.18,'cream');front.position.set(hx,hy,hz+hd/2-.09);
  rounded(hw,hh,.14,hx,hy,hz-hd/2+.07,'cream',root,.16);
  const leftShape=roundShape(hd,hh,.15), intake=roundShape(1.06,1.54,.13);leftShape.holes.push(new T.Path(intake.getPoints(48).map(p=>new T.Vector2(p.x,p.y-.22))));
  const left=extrude(leftShape,.16,'cream');left.rotation.y=-Math.PI/2;left.position.set(hx-hw/2+.08,hy,hz);
  const right=rounded(hd,hh,.16,0,0,0,'cream',root,.15);right.rotation.y=Math.PI/2;right.position.set(hx+hw/2-.08,hy,hz);
  const roof=rounded(hw,hd,.20,0,0,0,'cream',root,.16);roof.rotation.x=-Math.PI/2;roof.position.set(hx,hy+hh/2-.06,hz);
  // Bay floors, recessed amber ceilings, and output pedestals.
  for(const x of [-.42,.74,1.88]){
    box(.91,.10,1.22,x,.41,-.42,'cream');box(.90,.035,1.13,x,2.17,-.38,'gold');
    const bayLight=new T.PointLight(0xffbc65,1.4,1.8,2);bayLight.position.set(x,1.85,-.18);root.add(bayLight);bayLights.push(bayLight);
    const scanner=moving(rounded(.80,.025,.022,x,1.90,.23,'glow',root,.01),`output-scanner-${scanners.length}`);scanners.push(scanner);
    rounded(.99,.17,.56,x,.40,.56,'cream',root,.045);
  }
  // Conveyor: a continuous loop, segmented top, rollers with recessed hubs.
  const beltStart=-3.02,beltEnd=-.99,beltY=.91,beltZ=-.58,beltW=.90;
  const beltPath=roundShape(beltEnd-beltStart+.38,.38,.19);const inner=roundShape(beltEnd-beltStart+.31,.31,.155);beltPath.holes.push(new T.Path(inner.getPoints(48)));
  const loop=extrude(beltPath,beltW,'blue',root,.006);loop.position.set((beltStart+beltEnd)/2,beltY-.19,beltZ-beltW/2);
  box(beltEnd-beltStart,.045,beltW,beltStart+(beltEnd-beltStart)/2,beltY,beltZ,'blue');
  for(let x=beltStart-.05;x<beltEnd+.06;x+=.18){const slat=moving(box(.012,.007,beltW+.005,x,beltY+.027,beltZ,'blueDark'),'belt-slat');slats.push({slat,x});}
  for(let i=0;i<6;i++){
    const x=beltStart+i*(beltEnd-beltStart)/5,pivot=moving(group(x,beltY-.19,beltZ),`roller-${i}`);rollers.push(pivot);
    const roll=disk(.148,beltW+.04,0,0,0,'cream',pivot);roll.rotation.x=Math.PI/2;
    faceDisk(.080,.018,0,0,beltW/2+.035,'shade',pivot);faceDisk(.049,.025,0,0,beltW/2+.05,'light',pivot);
    rounded(.016,.082,.009,0,0,beltW/2+.067,'cream',pivot,.005);
  }
  for(const x of [beltStart+.10,beltEnd-.08])for(const z of [beltZ-.35,beltZ+.35])rounded(.13,.39,.13,x,.52,z,'cream',root,.02);
  box(2.17,.08,.12,-2.0,.56,beltZ+.34,'shade');box(2.17,.08,.12,-2.0,.56,beltZ-.34,'shade');
  // Individually cut blue intake curtains drape onto the conveyor.
  for(let i=0;i<6;i++){
    const curtain=moving(group(-1.02,2.07,beltZ-.44+i*.145),`intake-curtain-${i}`);
    surface(5,30,(u,v)=>[-.31*Math.pow(v,3),-v*1.13,u*.145+.018*Math.sin(v*5+i)],i%2?'blue':'blueDark',curtain);curtains.push(curtain);
  }
  // Embossed idea card and recognisable bulb, screw base and rays.
  const idea=moving(group(-2.15,1.58,beltZ+.12),'idea-card');idea.rotation.y=-.13;
  rounded(.94,1.26,.075,0,0,0,'red',idea,.07);
  const bulb=new T.Shape();bulb.moveTo(-.10,-.16);bulb.bezierCurveTo(-.11,.0,-.24,.03,-.24,.19);bulb.bezierCurveTo(-.24,.52,.24,.52,.24,.19);bulb.bezierCurveTo(.24,.03,.11,0,.10,-.16);bulb.closePath();
  const bm=extrude(bulb,.04,'light',idea,.008);bm.position.set(0,-.11,.05);
  for(let i=0;i<3;i++)rounded(.21-i*.025,.045,.035,0,-.29-i*.057,.079,'light',idea,.02);
  path([[0,.03,.097],[0,.17,.097],[-.07,.23,.097]],.006,'shade',idea);
  for(let i=0;i<7;i++){const a=-.25+i*Math.PI/6;rod([Math.cos(a)*.33,.13+Math.sin(a)*.33,.065],[Math.cos(a)*.44,.13+Math.sin(a)*.44,.065],.016,'light',idea);}
  // First output: paper copy with raised lines and a sweeping chart.
  const page=moving(group(-.42,1.08,.49),'printed-page');page.rotation.x=-.10;
  rounded(.79,1.26,.052,0,0,0,'light',page,.045);faceDisk(.12,.018,0,.33,.067,'cream',page);
  for(let i=0;i<3;i++){
    const line=moving(group(-.275,.08-i*.13,.039,page),`copy-line-${i}`);
    rounded(.55-i*.05,.025,.017,(.55-i*.05)/2,0,0,'cream',line,.012);copyLines.push(line);
  }
  path([[-.28,-.36,.068],[-.15,-.28,.068],[.03,-.30,.068],[.18,-.39,.068],[.29,-.40,.068]],.013,'cream',page);
  // Layered relief landscapes, shared by the framed image and film cells.
  function landscape(w,h,p,variant=0){
    rounded(w,h,.028,0,0,0,'blueDark',p,.008);
    const m=polygon([[-w/2,-h/2],[-w/2,-h*.06],[-w*.17,h*.19],[w*.04,-h*.06],[w*.23,h*.11],[w/2,-h*.03],[w/2,-h/2]],.017,'blue',p);m.position.z=.026;
    const hill=new T.Shape();hill.moveTo(-w/2,-h/2);hill.lineTo(-w/2,-h*.27);hill.bezierCurveTo(-w*.12,h*.01,w*.02,-h*.40,w/2,-h*.15);hill.lineTo(w/2,-h/2);hill.closePath();const hm=extrude(hill,.018,'blueLight',p,.003);hm.position.z=.050;
    if(variant===1){faceDisk(w*.095,.016,-w*.06,h*.17,.054,'light',p);faceDisk(w*.12,.016,w*.05,h*.18,.054,'light',p);rounded(w*.30,h*.09,.018,0,h*.11,.054,'light',p,.02);}
    else faceDisk(w*.075,.022,w*.25,h*.27,.052,'light',p);
  }
  const picture=moving(group(.74,1.08,.62),'image-output');picture.rotation.x=-.08;
  const fs=roundShape(.91,1.31,.04),fh=roundShape(.69,1.08,.005);fs.holes.push(new T.Path(fh.getPoints(32)));const f=extrude(fs,.085,'red',picture,.021);f.position.z=.005;
  const artwork=moving(group(0,0,0,picture),'assembling-image');landscape(.69,1.08,artwork);
  const imageLayers=artwork.children.map((layer,i)=>{moving(layer,`image-layer-${i}`);return {layer,z:layer.position.z};});
  for(const x of [-.40,.40])path([[x,-.61,.109],[x,.61,.109]],.004,'redDark',picture);
  // Curling film ribbon: continuous perforated paper, not three separate tiles.
  const film=moving(group(1.89,2.12,.10),'film-output');const ribbon=group(0,-2.12,-.10,film);const fw=.92;
  const curve=new T.CatmullRomCurve3([new T.Vector3(0,2.12,.10),new T.Vector3(0,2.05,.35),new T.Vector3(0,1.47,.64),new T.Vector3(0,.77,1.00),new T.Vector3(0,.39,1.43)]);
  function frameAt(t){const q=curve.getPoint(t),v=curve.getTangent(t).normalize();return {q,v,n:new T.Vector3(0,-v.z,v.y)};}
  // Central ribbon plus narrow strips between each actual sprocket hole.
  surface(12,100,(u,v)=>{const {q}=frameAt(v);return [(u-.5)*.68,q.y,q.z];},'light',ribbon);
  for(const side of [-1,1]){
    surface(2,100,(u,v)=>{const {q}=frameAt(v);return [side*(.43+u*.03),q.y,q.z];},'light',ribbon);
    surface(2,100,(u,v)=>{const {q}=frameAt(v);return [side*(.34+u*.022),q.y,q.z];},'light',ribbon);
    for(let i=0;i<22;i++)surface(4,2,(u,v)=>{const {q}=frameAt(Math.min(1,(i+(v*.35))/22));return [side*(.35+u*.09),q.y,q.z];},'light',ribbon);
  }
  for(let i=0;i<3;i++){
    const t=.27+i*.28,cell=group(0,0,0,ribbon);landscape(.63,.43,cell,i%2);
    // Wrap every relief layer onto the ribbon, preserving its raised depth.
    cell.updateMatrixWorld(true);
    cell.traverse(o=>{if(!o.isMesh)return;const pos=o.geometry.attributes.position;
      o.updateMatrix();for(let j=0;j<pos.count;j++){
        const local=new T.Vector3(pos.getX(j),pos.getY(j),pos.getZ(j)).applyMatrix4(o.matrix);
        const {q,n}=frameAt(t-local.y/.43*.20);q.add(n.multiplyScalar(-(.018+local.z)));
        pos.setXYZ(j,local.x,q.y,q.z);
      }
      o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);pos.needsUpdate=true;o.geometry.computeVertexNormals();
    });
  }
  // Open roll at the foot of the film strip, complete with hollow paper core.
  const rollShape=new T.Shape();rollShape.absarc(0,0,.18,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,.135,0,Math.PI*2,true);rollShape.holes.push(hole);
  const curl=extrude(rollShape,fw,'cream',ribbon,.008);curl.rotation.y=Math.PI/2;curl.position.set(-fw/2,.47,1.43);
  // Articulated desk lamp: rounded bell shade, glowing diffuser and hinge washers.
  const lamp=moving(group(.64,2.67,-.56),'desk-lamp');disk(.22,.09,0,.04,0,'cream',lamp);disk(.15,.10,0,.13,0,'cream',lamp);
  const lower=[0,.20,0],upper=[-.25,.86,-.035],neck=[-.52,.65,.035];rod(lower,upper,.048,'cream',lamp);rod(upper,neck,.052,'cream',lamp);
  for(const q of [lower,upper]){faceDisk(.098,.09,...q,'cream',lamp);faceDisk(.041,.025,q[0],q[1],q[2]+.058,'shade',lamp);faceDisk(.024,.030,q[0],q[1],q[2]+.074,'light',lamp);}
  const shade=moving(group(...neck,lamp),'lamp-shade');shade.rotation.z=-.50;shade.rotation.x=-.65;
  const bell=mesh(new T.LatheGeometry([new T.Vector2(.065,.15),new T.Vector2(.12,.13),new T.Vector2(.20,.05),new T.Vector2(.26,-.09),new T.Vector2(.28,-.20),new T.Vector2(.255,-.205),new T.Vector2(.235,-.11),new T.Vector2(.16,.015),new T.Vector2(.085,.08)],64),'cream',shade);
  const rim=mesh(new T.TorusGeometry(.268,.013,8,64),'gold',shade);rim.rotation.x=Math.PI/2;rim.position.y=-.20;
  disk(.250,.009,0,-.191,0,'glow',shade);
  const lampLight=new T.PointLight(0xffc166,1.2,3,2);lampLight.position.set(-.55,.34,.20);lamp.add(lampLight);
  // Clapper board: two striped arms, hinge rivets, real slanted stripes.
  const clap=moving(group(.80,.60,1.46),'clapper-board');clap.rotation.y=-.15;
  rounded(.83,.52,.09,0,0,0,'red',clap,.025);
  function clapBar(p){rounded(.85,.115,.09,0,0,0,'red',p,.012);for(let i=0;i<6;i++){const s=polygon([[-.035,-.057],[.037,-.057],[.095,.057],[.023,.057]],.007,'light',p);s.position.set(-.39+i*.142,0,.063);}}
  const fixed=group(0,.305,.005,clap);clapBar(fixed);const upperBar=moving(group(-.39,.425,0,clap),'clapper-hinge');upperBar.rotation.z=.26;const arm=group(.39,0,0,upperBar);clapBar(arm);
  for(const y of [.24,.38])faceDisk(.024,.017,-.35,y,.070,'gold',clap);
  // One readable story: intake, copy, image, film, then a clapper finish.
  // All poses are seekable and periodic; pause/reduced motion use the viewer clock.
  const duration=14,tau=Math.PI*2;
  const ideaScale=.65;
  // Keep the smaller card resting on the belt rather than floating at its old height.
  const ideaY=beltY+.031+(.63+.025)*ideaScale;
  const smooth=v=>{v=T.MathUtils.clamp(v,0,1);return v*v*(3-2*v);};
  const ramp=(t,a,b)=>smooth((t-a)/(b-a));
  const window=(t,a,b,c,d)=>ramp(t,a,b)*(1-ramp(t,c,d));
  const spring=(t,start,amplitude,frequency=12)=>{
    const age=t-start;return age<0||age>=2?0:amplitude*Math.exp(-age*4)*Math.sin(age*frequency)*(1-ramp(age,1.5,2));
  };
  function animate(elapsed){
    // Open with the outputs inside their bays, ready for the first idea.
    const t=((elapsed%duration)+duration)%duration;
    const reset=ramp(t,12.3,14),feed=ramp(t,.55,3.0),reload=ramp(t,10.8,12.1);
    const intake=window(t,1.6,2.2,3.1,3.7);
    idea.visible=t<3.4||t>10.8;
    const cardScale=ideaScale*(t>10.8?Math.max(.001,reload):1);
    idea.position.set(t>10.8?-3.1+.65*reload:-2.45+2.2*feed,ideaY-(ideaScale-cardScale)*.655+spring(t,.55,.02),beltZ+.12);
    idea.scale.setScalar(cardScale);
    idea.rotation.set(0,-.13,-.07*Math.sin(feed*Math.PI)+spring(t,12.1,.05));
    // Roller rotation is driven by belt distance, so it accelerates with the intake.
    const travel=t/7+feed*1.6+reload*.72;
    rollers.forEach(o=>{o.rotation.z=-travel/4.32*tau*5;});
    slats.forEach(({slat,x})=>{const span=2.16;slat.position.x=beltStart-.08+((x-beltStart+.08+travel)%span+span)%span;});
    curtains.forEach((o,i)=>{o.rotation.z=-intake*(.28+.07*Math.sin(t*9-i*.6));});

    const print=ramp(t,3.0,4.25)*(1-reset),image=ramp(t,5.1,6.3)*(1-reset),reel=ramp(t,6.9,8.8)*(1-reset);
    // Printed sheets slide out of their slots, tip upright and settle on the trays.
    page.position.set(-.42,1.08+(1-print)*.58+spring(t,4.25,.10)*(1-reset),.49-(1-print)*.70);
    page.rotation.x=-.10-(1-print)*.38+spring(t,4.25,.14)*(1-reset);
    copyLines.forEach((o,i)=>{o.scale.x=Math.max(.001,ramp(t,3.6+i*.24,4.15+i*.24)*(1-reset));});
    picture.position.set(.74,1.08+(1-image)*.50+spring(t,6.3,.11)*(1-reset),.62-(1-image)*.80);
    picture.rotation.set(-.08-(1-image)*.35,spring(t,6.3,.14)*(1-reset),spring(t,6.3,.055)*(1-reset));
    imageLayers.forEach(({layer,z},i)=>{
      const assemble=ramp(t,5.4+i*.19,6.0+i*.19)*(1-reset);
      layer.scale.setScalar(Math.max(.001,assemble));layer.position.z=z+(1-assemble)*.14;
    });
    // Feed the continuous ribbon from its top attachment; the curl follows the paper.
    film.scale.set(1,.10+.90*reel,.16+.84*reel);
    film.rotation.x=spring(t,8.8,.065)*(1-reset);
    film.rotation.z=spring(t,8.8,.020)*(1-reset);
    [3.0,5.1,6.9].forEach((start,i)=>{
      const scan=window(t,start-.2,start+.15,start+1.1,start+1.55);
      scanners[i].visible=scan>.01;scanners[i].position.y=2.03-ramp(t,start,start+1.5)*1.36;
      scanners[i].scale.x=.55+.45*scan;bayLights[i].intensity=.7+2.2*scan;
    });
    // The lamp anticipates each station instead of idly wobbling.
    const watchCopy=window(t,2.5,3.1,4.7,5.3),watchImage=window(t,4.7,5.3,6.5,7.1),watchFilm=window(t,6.5,7.1,9.0,9.6);
    lamp.rotation.y=-.32*watchCopy-.60*watchImage-.92*watchFilm;
    shade.rotation.z=-.50-.14*watchCopy-.22*watchImage-.30*watchFilm+spring(t,9.45,.13);
    shade.rotation.x=-.65+.18*watchFilm;
    lampLight.intensity=1.2+1.1*Math.max(watchCopy,watchImage,watchFilm);
    // Anticipation, fast contact, rebound, then a relaxed reopen.
    const ready=ramp(t,8.9,9.35),snap=ramp(t,9.35,9.48),reopen=ramp(t,10.0,10.7);
    upperBar.rotation.z=.40+.20*ready-.60*snap+.40*reopen+Math.max(0,spring(t,9.48,.19,23));
    clap.rotation.z=spring(t,9.48,.045,21);
    clap.position.y=.60+Math.abs(spring(t,9.48,.045,21));
  }
  // Fit the complete motion and batch rigid branches independently of their joints.
  const boxes=new Map();
  for(let frame=0;frame<=48;frame++){
    animate(frame/48*duration);root.updateMatrixWorld(true);
    root.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);if(boxes.has(o))boxes.get(o).union(b);else boxes.set(o,b);});
  }
  const framingPoints=[];for(const b of boxes.values())for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z));
  animate(0);root.updateMatrixWorld(true);
  function batchBranch(parent){
    const keep=parent.children.filter(o=>o.userData.motion||o.isLight);
    for(const branch of keep)if(!branch.isMesh&&!branch.isLight)batchBranch(branch);
    const inverse=parent.matrixWorld.clone().invert(),batches=new Map();
    for(const branch of parent.children.filter(o=>!keep.includes(o)))branch.traverse(o=>{
      if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
      if(!batches.has(o.material))batches.set(o.material,{p:[],n:[],uv:[]});const b=batches.get(o.material);
      for(const v of g.attributes.position.array)b.p.push(v);for(const v of g.attributes.normal.array)b.n.push(v);
      if(g.attributes.uv)for(const v of g.attributes.uv.array)b.uv.push(v);else for(let i=0;i<g.attributes.position.count;i++)b.uv.push(0,0);
      g.dispose();o.geometry.dispose();
    });
    parent.clear();for(const o of keep)parent.add(o);
    for(const [material,b] of batches){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();const m=new T.Mesh(g,material);m.castShadow=m.receiveShadow=true;parent.add(m);}
  }
  batchBranch(root);
  root.userData={conceptual:true,artifactId:52,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:-.53,initialElevation:.34,framingPoints,animate,animationDuration:duration};return root;
}
