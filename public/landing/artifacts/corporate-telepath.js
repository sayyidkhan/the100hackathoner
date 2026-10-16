// Corporate Telepath: four review disciplines become one actionable plan.
export function createArtifact(T) {
  const root=new T.Group();root.name="corporate-telepath-studio";
  const moving=(o,name)=>{o.name=name;for(let p=o;p&&p!==root;p=p.parent)p.userData.motion=true;return o;};
  let seed=74; const pixels=new Uint8Array(128*128*4);
  for(let i=0;i<pixels.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=125+(seed/4294967296-.5)*75;pixels[i]=pixels[i+1]=pixels[i+2]=n;pixels[i+3]=255;}
  const grain=new T.DataTexture(pixels,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(4,4);grain.needsUpdate=true;
  const paper=(color)=>new T.MeshStandardMaterial({color,roughness:.83,bumpMap:grain,bumpScale:.009,side:T.DoubleSide});
  const mat={cream:paper(0xf1dfbf),light:paper(0xffedcf),shade:paper(0xc4aa82),red:paper(0xba3527),redDark:paper(0x7b201b),blue:paper(0x244c70),blueDark:paper(0x142d47),blueLight:paper(0x426582),gold:paper(0xd9b071),ink:paper(0x66553e),glow:new T.MeshStandardMaterial({color:0xffe9b3,emissive:0xffbb51,emissiveIntensity:1.4,roughness:.6})};
  mat.sage=paper(0x788365);mat.leaf=paper(0x536950);mat.sky=paper(0xf5d798);mat.hair=paper(0x453c31);
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
  const sphere=(x,y,z,sx,sy,sz,c='cream',p=root)=>{const m=mesh(new T.SphereGeometry(1,24,16),c,p);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;};
  const flat=(w,d,h,x,y,z,c='cream',p=root,r=.08)=>{const m=rounded(w,d,h,0,0,0,c,p,r);m.rotation.x=-Math.PI/2;m.position.set(x,y-h/2,z);return m;};
  mat.gold=new T.MeshStandardMaterial({color:0xb99451,metalness:.68,roughness:.30});
  mat.glass=new T.MeshPhysicalMaterial({color:0xc6dfdf,transparent:true,opacity:.22,roughness:.08,metalness:.1,depthWrite:false});
  flat(9.4,6.3,.30,0,.17,0,'cream',root,.40);
  flat(9.24,6.14,.055,0,.36,0,'light',root,.36);
  function trace(points,width=.032,c='blue'){
    const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));
    surface(1,64,(u,v)=>{const p=curve.getPoint(v),t=curve.getTangent(v);p.addScaledVector(new T.Vector3(-t.z,0,t.x).normalize(),(u-.5)*width);return p.toArray();},c);
  }
  const stations=[[-2.9,-1.55],[-3.0,1.15],[2.9,-1.55],[3.0,1.15]];
  const reviewCurves=[];
  stations.forEach(([x,z])=>{
    reviewCurves.push(new T.CatmullRomCurve3([[x*.66,.49,z*.75],[x*.35,.49,.4],[0,.49,.8]].map(v=>new T.Vector3(...v))));
    trace([[x,.445,z],[x*.65,.445,z*.75],[x*.35,.445,.4],[0,.445,.8]],.038);
    disk(.065,.018,x*.66,.428,z*.75,'gold');
  });
  trace([[0,.69,-.50],[0,.69,.10],[0,.72,.55],[0,.83,.95],[0,1.00,1.34]],.20,'red');
  function desk(x,z,w=1.9,d=1.20){const g=group(x,0,z);
    flat(w-.06,d-.06,.66,0,.79,0,'cream',g,.10);
    flat(w+.02,d+.02,.07,0,.45,0,'shade',g,.10);
    for(const side of [-1,1])for(let i=0;i<12;i++)rod([side*(w/2-.025),.51,-d/2+.10+i*(d-.20)/11],[side*(w/2-.025),1.08,-d/2+.10+i*(d-.20)/11],.009,'shade',g);
    for(const side of [-1,1])rounded(.06,.53,.025,side*(w/2-.19),.80,d/2-.015,'light',g,.01);
    rounded(w-.60,.43,.025,0,.80,d/2-.015,'light',g,.03);
    rounded(.39,.13,.018,0,.80,d/2+.015,'gold',g,.015);
    flat(w,d,.11,0,1.13,0,'cream',g,.10);flat(w-.04,d-.04,.025,0,1.21,0,'light',g,.08);
    rounded(w-.18,.18,.08,0,1.01,d/2-.10,'cream',g,.035);
    rounded(.29,.022,.025,0,1.02,d/2-.04,'gold',g,.01);
    return g;
  }
  // A structural red arch frames the feature under review, like a miniature design studio.
  const gate=group(0,.41,-1.72);
  function portalOutline(w,h,r){const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-r);s.quadraticCurveTo(w/2,h,w/2-r,h);s.lineTo(-w/2+r,h);s.quadraticCurveTo(-w/2,h,-w/2,h-r);s.closePath();return s;}
  function portalFrame(w,h,r,iw,ih,ir,c,z,d){const outer=portalOutline(w,h,r),inner=portalOutline(iw,ih,ir);outer.holes.push(new T.Path(inner.getPoints(24).reverse()));const m=extrude(outer,d,c,gate,.025);m.position.z=z;return m;}
  portalFrame(3.02,3.70,.40,2.40,3.36,.30,'red',-.20,.40);
  portalFrame(2.48,3.41,.33,2.40,3.35,.30,'gold',.23,.025);
  for(const x of [-1.35,1.35]){
    flat(.60,.72,.16,x,.12,0,'redDark',gate,.06);
    disk(.10,.06,x,3.75,0,'gold',gate);sphere(x,3.85,0,.095,.095,.095,'gold',gate);
  }
  // The proposal is layered and visibly suspended from the lintel.
  const suspension=moving(group(0,3.32,.08,gate),'proposal-suspension');
  for(const x of [-.70,.70])rod([x,-.51,0],[x,0,0],.018,'gold',suspension);
  const proposal=group(0,-1.47,.04,suspension);
  rounded(1.91,2.11,.10,.05,-.04,-.07,'shade',proposal,.10);
  rounded(1.91,2.11,.08,0,0,0,'light',proposal,.09);
  // A small dependency map and note column make the proposal read as a feature brief.
  for(const [x,y,w,h] of [[-.45,.45,.50,.52],[-.68,-.40,.30,.27],[-.14,-.40,.30,.27]]){
    rounded(w,h,.012,x,y,.063,'blue',proposal,.015);
    rounded(w-.07,h-.07,.006,x,y,.104,'light',proposal,.01);
  }
  rounded(.18,.22,.01,-.45,.45,.139,'blue',proposal,.012);
  rod([-.45,.17,.10],[-.45,-.16,.10],.008,'blue',proposal);
  rod([-.68,-.16,.10],[-.14,-.16,.10],.008,'blue',proposal);
  for(const x of [-.68,-.14])rod([x,-.16,.10],[x,-.29,.10],.008,'blue',proposal);
  faceDisk(.028,.012,-.45,-.16,.10,'gold',proposal);
  for(let i=0;i<8;i++)rod([[.12,.10,.12][i%3],.75-i*.20,.07],[i%3===0?.65:.77,.75-i*.20,.07],.008,'blueDark',proposal);
  rounded(.17,.40,.025,.64,.96,.06,'red',proposal,.015);
  disk(.92,.12,0,.47,-.75,'shade');disk(.86,.09,0,.58,-.75,'cream');disk(.77,.035,0,.65,-.75,'light');
  const reviewRing=mesh(new T.TorusGeometry(.73,.018,8,72),'gold');reviewRing.rotation.x=Math.PI/2;reviewRing.position.set(0,.68,-.75);
  // ENGINEERING: a laptop, miniature circuit board, and detailed pin grid.
  const engineering=desk(-2.95,-1.48,1.94,1.18);
  const laptop=group(-.35,1.26,.20,engineering);flat(.98,.64,.055,0,0,0,'blueDark',laptop,.045);
  const screen=group(0,.03,-.25,laptop);screen.rotation.x=-.12;
  rounded(.99,.65,.045,0,.32,0,'blue',screen,.05);rounded(.85,.50,.01,0,.33,.035,'blueDark',screen,.025);
  const codeLines=[];
  for(let j=0;j<4;j++){
    rounded(.10+j%2*.05,.016,.005,-.28,.49-j*.09,.046,'gold',screen,.005);
    const line=moving(group(-.13,.49-j*.09,.046,screen),'code-line-'+j);rounded(.24+(j%2)*.12,.016,.005,.18,0,0,'light',line,.005);codeLines.push(line);
  }
  for(let r=0;r<3;r++)for(let c=0;c<8;c++)flat(.072,.048,.008,-.34+c*.094,.036,-.10+r*.07,'blueLight',laptop,.007);
  flat(.26,.11,.008,0,.036,.18,'blueLight',laptop,.014);
  const chip=group(.59,1.68,-.22,engineering);chip.rotation.y=-.15;
  rounded(.55,.63,.08,0,0,0,'blueDark',chip,.035);rounded(.38,.45,.025,0,0,.065,'blue',chip,.025);
  const processor=moving(rounded(.24,.29,.012,0,0,.09,'gold',chip,.018),'processor-status');processor.material=processor.material.clone();processor.material.emissive.setHex(0xe9bb64);
  for(let i=0;i<5;i++)for(const sign of [-1,1]){
    rounded(.045,.11,.045,-.22+i*.11,sign*.36,0,'gold',chip,.008);
    rounded(.11,.045,.045,sign*.32,-.23+i*.115,0,'gold',chip,.008);
  }
  rod([.59,1.24,-.22],[.59,1.43,-.22],.026,'gold',engineering);disk(.16,.025,.59,1.25,-.22,'shade',engineering);
  // FINANCE: clothbound ledgers, a ruled balance sheet, and a real beaded abacus.
  const finance=desk(-3.0,1.10,1.98,1.25);
  for(let i=0;i<3;i++){
    flat(.80,.68,.105,-.40,1.28+i*.13,.12,i%2?'redDark':'blue',finance,.035);
    flat(.72,.62,.07,-.40,1.31+i*.13,.12,'light',finance,.025);
    for(let j=0;j<3;j++)rod([-.72,1.295+i*.13+j*.012,.435],[-.08,1.295+i*.13+j*.012,.435],.003,'shade',finance);
  }
  const ledger=group(-.42,1.70,.10,finance);ledger.rotation.x=-Math.PI/2+.32;
  rounded(.76,.64,.035,0,0,0,'light',ledger,.02);
  for(let i=0;i<5;i++)rod([-.32,-.23+i*.10,.06],[.32,-.23+i*.10,.06],.005,'shade',ledger);
  for(const x of [-.10,.13])rod([x,-.24,.061],[x,.25,.061],.005,'blue',ledger);
  const abacus=group(.53,1.28,-.03,finance);
  for(const x of [-.31,.31])rod([x,0,0],[x,.80,0],.025,'gold',abacus);
  for(const y of [0,.80])rod([-.31,y,0],[.31,y,0],.028,'gold',abacus);
  const beadRows=[];
  for(let row=0;row<4;row++){
    const y=.14+row*.17;rod([-.31,y,0],[.31,y,0],.009,'gold',abacus);
    const beads=moving(group(0,0,0,abacus),'abacus-row-'+row);beadRows.push(beads);
    for(let j=0;j<5;j++)sphere(-.23+j*.10+(row%2?.03:0),y,0,.036,.055,.055,j<row?'red':'blue',beads);
  }
  // LEGAL: balanced pans on chains, with a turned gavel resting on its block.
  const legal=desk(2.95,-1.48,1.94,1.18);
  const scales=group(-.20,1.25,-.12,legal);
  disk(.25,.065,0,.035,0,'gold',scales);rod([0,.05,0],[0,1.13,0],.028,'gold',scales);sphere(0,1.17,0,.065,.065,.065,'gold',scales);
  const beam=moving(group(0,1.01,0,scales),'balance-beam'),pans=[];
  rod([-.62,0,0],[.62,0,0],.026,'gold',beam);
  for(const x of [-.52,.52]){
    const hanging=moving(group(x,0,0,beam),'balance-pan-'+x);pans.push(hanging);
    for(const dx of [-.15,.15])rod([0,0,0],[dx,-.48,0],.008,'gold',hanging);
    const pan=mesh(new T.SphereGeometry(.23,32,12,0,Math.PI*2,Math.PI/2,Math.PI/2),'cream',hanging);pan.position.set(0,-.48,0);pan.scale.y=.35;
    const lip=mesh(new T.TorusGeometry(.23,.012,8,40),'gold',hanging);lip.rotation.x=Math.PI/2;lip.position.set(0,-.48,0);
  }
  flat(.57,.38,.075,.58,1.28,.29,'redDark',legal,.045);
  const gavel=moving(group(.53,1.48,.24,legal),'review-gavel');gavel.rotation.z=-.40;
  disk(.10,.30,0,0,0,'cream',gavel);for(const y of [-.15,.15])disk(.13,.045,0,y,0,'gold',gavel);
  rod([0,0,0],[.46,0,0],.033,'shade',gavel);sphere(.48,0,0,.065,.042,.042,'gold',gavel);
  // PEOPLE: portrait reliefs and conversation cards, not faceless block figures.
  const people=desk(3.0,1.10,1.98,1.25);
  function cameo(x,y,z,r,variant,p){
    const g=group(x,y,z,p);g.scale.setScalar(r/.40);
    faceDisk(.40,.018,0,0,0,'blueDark',g);
    const s=new T.Shape();s.moveTo(-.27,-.29);s.bezierCurveTo(-.23,-.19,-.12,-.18,-.08,-.14);s.lineTo(-.07,-.07);s.bezierCurveTo(-.24,.06,-.17,.27,-.03,.29);s.bezierCurveTo(.10,.31,.17,.24,.15,.13);s.lineTo(.23,.045);s.lineTo(.155,.015);s.lineTo(.16,-.045);s.quadraticCurveTo(.14,-.10,.075,-.10);s.lineTo(.07,-.16);s.bezierCurveTo(.13,-.18,.24,-.20,.26,-.29);s.closePath();
    const relief=extrude(s,.026,'cream',g,.007);relief.position.z=.018;
    path([[-.12,.07,.056],[-.14,.21,.056],[-.02,.27,.056],[.11,.24,.056]],.025,variant%2?'shade':'light',g);
    if(variant%2===0){sphere(-.15,.14,.04,.075,.095,.026,'shade',g);for(let j=0;j<5;j++)path([[-.15+j*.025,.13,.07],[-.12+j*.024,.21,.071],[-.03+j*.023,.26,.065]],.005,'cream',g);}
    else for(let j=0;j<4;j++)path([[-.12,.19+j*.013,.062],[-.04,.26+j*.008,.065],[.09,.25+j*.003,.061]],.005,'shade',g);
    sphere(.12,.11,.056,.012,.012,.008,'ink',g);
    if(variant===2){const glasses=mesh(new T.TorusGeometry(.043,.005,5,20),'gold',g);glasses.position.set(.12,.105,.070);rod([.08,.12,.07],[-.065,.15,.065],.004,'gold',g);}
    path([[-.15,-.20,.052],[-.02,-.30,.054],[.025,-.18,.055]],.005,'shade',g);
  }
  const portraits=[];
  for(let i=0;i<2;i++){
    const x=-.47+i*.72,g=moving(group(x,1.78,-.24,people),'reviewer-'+i);g.rotation.y=i?-.16:.16;portraits.push(g);
    faceDisk(.43,.065,0,0,0,'cream',g);cameo(0,0,.065,.36,i,g);
    rod([x,1.23,-.24],[x,1.38,-.24],.025,'gold',people);
  }
  const conversation=moving(group(.12,1.36,.36,people),'conversation-card');conversation.rotation.x=-.36;
  rounded(.97,.38,.055,0,0,0,'blue',conversation,.08);
  polygon([[-.32,-.12],[-.32,-.28],[-.13,-.12]],.04,'blue',conversation);
  for(let i=0;i<2;i++)rounded(.60-i*.13,.017,.016,-.01,.055-i*.10,.045,'light',conversation,.006);
  // The four reviews converge into one clear action plan at the front of the studio.
  const report=group(0,.72,2.00);report.rotation.x=-Math.PI/2+.24;
  rounded(2.32,1.55,.10,0,0,0,'blueDark',report,.10);
  for(let i=0;i<5;i++)rounded(2.18,1.43,.012,(i%2)*.018,0,.07+i*.017,i%2?'shade':'light',report,.045);
  const checks=[];
  for(let i=0;i<4;i++){
    const y=.43-i*.28;
    rounded(.19,.18,.015,-.80,y,.16,'blue',report,.025);
    const tick=moving(group(-.80,y,.211,report),'result-check-'+i);checks.push(tick);
    path([[-.06,0,0],[-.01,-.04,0],[.07,.055,0]],.012,'light',tick);
    rod([-.54,y+.04,.20],[.70,y+.04,.20],.008,'blueDark',report);
    rod([-.54,y-.045,.20],[.34,y-.045,.20],.006,'shade',report);
    rounded(.12,.19,.02,1.08,y,.15,['red','blue','gold','redDark'][i],report,.018);
  }
  rounded(.47,.20,.07,0,.72,.17,'red',report,.035);
  path([[-.14,.74,.22],[-.17,.96,.22],[0,1.03,.22],[.17,.96,.22],[.14,.74,.22]],.018,'gold',report);
  // Small drafting tools give the model a crafted, working-studio finish.
  for(const x of [-1.63,1.65]){rod([x,.45,1.62],[x+.12,.45,2.29],.023,'blue');rod([x+.12,.45,2.29],[x+.14,.45,2.40],.018,'shade');}
  for(const [x,z] of [[-1.9,.22],[1.9,.22]])disk(.11,.035,x,.44,z,'gold');
  const signals=reviewCurves.map((_,i)=>Array.from({length:3},(_,j)=>moving(sphere(0,0,0,.075,.045,.075,'glow'),'review-signal-'+i+'-'+j)));
  const resultHalo=moving(mesh(new T.TorusGeometry(.73,.028,8,72),'gold'),'synthesis-halo');resultHalo.rotation.x=Math.PI/2;resultHalo.position.set(0,.69,-.75);
  const duration=24;
  const ease=(t,a,b)=>{const u=T.MathUtils.clamp((t-a)/(b-a),0,1);return u*u*(3-2*u);};
  const window=(t,a,b,c,d)=>ease(t,a,b)*(1-ease(t,c,d));
  function animate(elapsed){
    const t=((elapsed%duration)+duration)%duration,phase=t/duration*Math.PI*2;
    const starts=[.8,5.1,9.4,13.7];
    const active=starts.map(a=>window(t,a,a+.55,a+2.6,a+3.3));
    suspension.rotation.z=.025*Math.sin(phase*2);suspension.rotation.x=.018*Math.sin(phase*3);
    processor.material.emissiveIntensity=active[0]*(.45+.35*Math.sin(t*8)**2);
    codeLines.forEach((line,i)=>{line.scale.x=1-active[0]*(.70*(.5+.5*Math.sin(t*5-i)));});
    beadRows.forEach((row,i)=>{row.position.x=active[1]*(.025+.065*Math.sin(t*5-i*.9));});
    const angle=.22*Math.sin((t-starts[2])*3.5)*active[2];beam.rotation.z=angle;pans.forEach(p=>p.rotation.z=-angle);
    const strike=window(t,11.5,11.9,12.1,12.4);gavel.position.y=1.48+.19*strike;gavel.rotation.z=-.40-.48*strike;
    portraits.forEach((p,i)=>{p.rotation.y=(i?-.16:.16)+(i?-1:1)*.22*active[3];});
    conversation.position.y=1.36+.16*active[3];conversation.rotation.z=.035*Math.sin(t*5)*active[3];
    const reset=1-ease(t,22,23.5);
    checks.forEach((tick,i)=>{const reveal=ease(t,starts[i]+3.15,starts[i]+3.65)*reset;tick.scale.setScalar(Math.max(.001,reveal));});
    signals.forEach((pack,i)=>pack.forEach((light,j)=>{
      const u=(t-starts[i]-1.7-j*.22)/1.65;
      light.position.copy(reviewCurves[i].getPoint(T.MathUtils.clamp(u,0,1)));
      const size=Math.max(.001,ease(u,0,.12)*(1-ease(u,.84,1)));light.scale.set(.075,.045,.075).multiplyScalar(size);
    }));
    const complete=window(t,17.4,18.2,21.4,23.1);resultHalo.scale.setScalar(1+.13*complete);resultHalo.position.y=.69+.10*complete;
  }
  const bounds=new T.Box3();
  for(let i=0;i<=96;i++){animate(i/96*duration);root.updateMatrixWorld(true);bounds.union(new T.Box3().setFromObject(root));}
  const framingPoints=[];for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])framingPoints.push(new T.Vector3(x,y,z));
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
  root.userData={conceptual:true,artifactId:74,displayBase:false,groundLevel:0,studioProfile:'paper',initialYaw:.08,initialElevation:.43,framingPoints,animate,animationDuration:duration};
  return root;
}
