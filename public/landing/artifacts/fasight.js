import { medivoiceStudio } from './medivoice-studio.js';
import { fasightLedger } from './fasight-ledger.js';
import { fasightFinishes, carvedPortrait, miniatureHouse } from './fasight-craft.js';

// A shallow paper swell beside the binding; both ink and nib share this surface.
export function fasightPaperHeight(x,y){return .027*Math.sin(Math.min(1,Math.abs(x)/1.31)*Math.PI)-.012*Math.exp(-x*x/ .008)+.004*Math.sin(y*1.4);}

export function fasightMoment(time){
 const t=((time%20)+20)%20,phase=Math.floor(t/5),local=t%5;
 const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
 const writing=Math.max(0,Math.min(2.7,local-1)),row=Math.min(2,Math.floor(writing/.9)),within=writing-row*.9;
 return {t,phase,local,row,ink:(row+smooth(within/.62))/3,stroke:smooth(within/.62),bridge:smooth((within-.62)/.28),pen:smooth(local/.8)*(1-smooth((local-3.8)/.55)),turn:smooth((local-4.35)/.65)};
}

// Fasight's static prototype becomes a physical planning desk: identity,
// assets, trusted people, review. This is a conceptual workflow, not a will.
export function createArtifact(T) {
  const { root, materials:m, mesh, box, disk, finish } = medivoiceStudio(T);
  const mat=(color,roughness=.6,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  Object.assign(m,{stone:mat(0xdcc7a6,.85),paper:mat(0xeee2c9,.86),pageEdge:mat(0xc8b794),teal:mat(0x163c3d,.5),brass:mat(0xb28b48,.32,.76),groove:mat(0x8f8062,.85),roof:mat(0xa69a80,.7),ivory:mat(0xf0e4ce,.7),glass:mat(0x203b3a,.4),signal:mat(0x65b0a2,.35,.25)});
  const finishes=fasightFinishes(T,m);
  m.ivory.bumpMap=finishes.paper.bumpMap;m.ivory.bumpScale=.002;
  const line=(points,r,color,parent=root)=>{const vectors=points.map(p=>new T.Vector3(...p));let curve;if(vectors[0].equals(vectors.at(-1))){curve=new T.CurvePath();for(let i=1;i<vectors.length;i++)curve.add(new T.LineCurve3(vectors[i-1],vectors[i]));}else curve=new T.CatmullRomCurve3(vectors);return mesh(new T.TubeGeometry(curve,Math.max(32,points.length*8),r,12,false),color,parent);};
  const preserved=[];
  const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
  function rounded(w,h,d,x,y,z,color,parent=root,r=.06){
    r=Math.min(r,w/2,h/2);const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const o=mesh(new T.ExtrudeGeometry(s,{depth:d,steps:1,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:10}),color,parent);o.position.set(x,y,z);return o;
  }
  const slab=(w,d,h,x,y,z,color,parent=root,r=.08)=>{const o=rounded(w,d,h,x,y,z,color,parent,r);o.rotation.x=-Math.PI/2;return o;};
  const ring=(r,t,x,y,z,color,parent=root)=>{const o=mesh(new T.TorusGeometry(r,t,10,72),color,parent);o.position.set(x,y,z);return o;};
  const coin=(r,d,x,y,z,color,parent=root)=>{const o=disk(r,d,x,y,z,color,parent);o.rotation.x=Math.PI/2;return o;};
  function label(text,w,x,y,z,parent=root){
    if(typeof document==='undefined')return;
    const c=document.createElement('canvas');c.width=768;c.height=160;const ctx=c.getContext('2d');ctx.font='66px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#d6b676';ctx.fillText(text,384,82,730);
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,w*160/768),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));o.position.set(x,y,z);parent.add(o);preserved.push(o);
  }
  slab(7.3,3.65,.29,0,.02,0,'stone',root,.28);
  slab(7.20,3.55,.035,0,.015,0,'brass',root,.27);
  slab(7.12,3.47,.08,0,-.045,0,'teal',root,.25);
  rounded(1.46,.30,.035,0,.165,1.83,'brass',root,.045);rounded(1.36,.23,.012,0,.165,1.874,'teal',root,.03);label('Fasight',1.06,0,.165,1.917);
  for(const x of [-.64,.64])coin(.022,.012,x,.165,1.918,'brass');

  // Asset tray: miniature house, real coin rims, hinged keepsake box.
  const assets=group(-2.39,.34,.12);
  slab(1.93,1.55,.13,0,0,0,'teal',assets,.10);
  box(1.90,.18,.06,0,.21,-.75,'teal',assets);box(.06,.18,1.48,-.94,.21,0,'teal',assets);box(.06,.18,1.48,.94,.21,0,'teal',assets);box(1.90,.18,.06,0,.21,.75,'teal',assets);
  for(const y of [.17,.285])line([[-.92,y,-.73],[.92,y,-.73],[.92,y,.73],[-.92,y,.73],[-.92,y,-.73]],.004,'brass',assets);
  miniatureHouse(T,{mesh,box,line,rounded,slab,group},assets);
  for(const [x,z,n] of [[.23,-.38,10],[.64,-.12,7],[.65,.48,5]])for(let i=0;i<n;i++){disk(.16,.035,x,.17+i*.04,z,'brass',assets);const rim=ring(.15,.008,x,.19+i*.04,z,'brass',assets);rim.rotation.x=Math.PI/2;for(let j=0;j<32;j++){const a=j*Math.PI/16;const edge=box(.009,.026,.004,x+Math.sin(a)*.16,.17+i*.04,z+Math.cos(a)*.16,'brass',assets);edge.rotation.y=a;}if(i===n-1){const seal=ring(.112,.004,x,.195+i*.04,z,'groove',assets);seal.rotation.x=Math.PI/2;}}
  slab(.71,.43,.19,-.17,.17,.44,'wood',assets,.04);slab(.73,.45,.035,-.17,.37,.44,'wood',assets,.04);slab(.63,.35,.006,-.17,.416,.44,'brass',assets,.025);slab(.60,.32,.006,-.17,.424,.44,'enamel',assets,.023);for(const x of [-.40,.06]){box(.07,.025,.045,x,.37,.225,'brass',assets);}coin(.033,.018,-.17,.29,.672,'brass',assets);

  // Book stands above the desk like the generated artwork: paper, leather,
  // visible page block, seven brass rings, and a gently curled lower corner.
  const book=group(-.05,1.88,-.40);book.rotation.x=-.27;book.scale.setScalar(1.10);
  rounded(2.83,2.85,.14,0,0,-.12,'teal',book,.10);
  for(let i=0;i<22;i++){const jitter=Math.sin(i*19)*.002;for(const side of [-1,1])rounded(1.32+jitter,2.66+jitter,.0015,side*.69,jitter,.025+i*.0035,i%4===0?'pageEdge':'paper',book,.025);}
  rounded(.115,2.54,.019,0,0,.111,'brass',book,.04);
  for(const y of [-1.21,1.21])coin(.023,.008,0,y,.142,'brass',book);
  for(const side of [-1,1])rounded(1.31,2.65,.018,side*.69,0,.105,'paper',book,.04);
  const ledger=fasightLedger(T);ledger.material.bumpMap=finishes.paper.bumpMap;ledger.material.bumpScale=.0016;const pages=new T.Mesh(new T.PlaneGeometry(2.62,2.65,80,40),ledger.material);const pp=pages.geometry.attributes.position;for(let i=0;i<pp.count;i++)pp.setZ(i,fasightPaperHeight(pp.getX(i),pp.getY(i)));pages.geometry.computeVertexNormals();pages.receiveShadow=true;pages.position.z=.149;pages.name='fasight-written-ledger';book.add(pages);preserved.push(pages);
  for(let i=0;i<7;i++){const r=ring(.095,.023,0,-1.13+i*.375,.16,'brass',book);r.rotation.y=.3;}
  // A flexible right-hand sheet turns about the binding after each chapter.
  const turn=group(0,0,.19,book);turn.name='fasight-turning-page';preserved.push(turn);
  const sheetGeometry=new T.PlaneGeometry(1.31,2.65,24,24),sheetPosition=sheetGeometry.attributes.position,sheetUV=sheetGeometry.attributes.uv;
  for(let i=0;i<sheetPosition.count;i++){sheetPosition.setX(i,sheetPosition.getX(i)+.655);sheetUV.setX(i,.5+sheetUV.getX(i)*.5);}
  const sheetRest=new Float32Array(sheetPosition.array),sheet=new T.Mesh(sheetGeometry,ledger.material);sheet.castShadow=sheet.receiveShadow=true;turn.add(sheet);
  // Leather stitching and a satin bookmark supply close-range craft detail.
  for(const side of [-1,1])for(let i=0;i<32;i++)line([[side*1.385,-1.30+i*.083,.045],[side*1.385,-1.274+i*.083,.046]],.0025,'pageEdge',book);
  const bookmark=rounded(.11,.42,.012,1.08,-1.39,.07,'teal',book,.01);

  // A physical brass family tree. Cameos are sculpted profile reliefs, not
  // bobbing cartoon people; the medallions remain anchored to their branches.
  const tree=group(2.50,.35,-.23);
  disk(.62,.18,0,.09,0,'teal',tree);disk(.61,.025,0,.018,0,'brass',tree);disk(.26,.055,0,.21,0,'brass',tree);
  line([[0,.22,0],[.05,.63,0],[0,1.3,0],[.02,2.10,0],[0,3.0,0]],.052,'brass',tree);
  for(let j=0;j<5;j++)line([[.07*Math.cos(j),.23,.05*Math.sin(j)],[.04,.6,0],[.025*Math.cos(j),2.7,.02*Math.sin(j)]],.012,'brass',tree);
  const points=[[-.60,1.02],[.60,1.02],[-.65,2.03],[.65,2.03],[0,2.93]];
  const medallionHighlights=[],branchLights=[];
  const profile=(parent,index=0)=>carvedPortrait(T,mesh,parent,index);
  points.forEach(([x,y],i)=>{line([[0,Math.max(.35,y-.7),0],[x*.4,y-.3,0],[x,y-.24,0]],.032,'brass',tree);
    const glow=line([[0,.23,.062],[0,Math.max(.35,y-.7),.062],[x*.4,y-.3,.062],[x,y-.24,.062]],.008,'signal',tree);glow.name=`fasight-branch-light-${i}`;preserved.push(glow);branchLights.push(glow);const g=group(x,y,0,tree);coin(.33,.045,0,0,0,'enamel',g);ring(.334,.019,0,0,.036,'brass',g);ring(.303,.007,0,0,.049,'brass',g);profile(g,i);for(let j=0;j<64;j++){const a=j*Math.PI/32;const bead=mesh(new T.SphereGeometry(.005,6,4),'brass',g);bead.position.set(Math.sin(a)*.322,Math.cos(a)*.322,.053);}const active=ring(.355,.008,0,0,.05,'signal',g);active.name=`fasight-person-${i}`;preserved.push(active);medallionHighlights.push(active);
    const leaf=group(x*.73,y-.43,.02,tree);const shape=new T.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(-.18,.15,0,.36);shape.quadraticCurveTo(.16,.15,0,0);const l=mesh(new T.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2}),'brass',leaf);leaf.rotation.z=x<0?.8:-.8;line([[0,.01,.022],[0,.32,.022]],.006,'groove',leaf);
  });

  const identity=group(-2.39,.35,1.21);identity.rotation.x=-Math.PI/2;identity.rotation.z=-.12;
  rounded(1.13,.57,.03,0,0,0,'paper',identity,.04);rounded(.26,.34,.018,-.34,0,.045,'pageEdge',identity,.025);const cameo=group(-.34,.01,.047,identity);cameo.scale.setScalar(.55);profile(cameo);
  for(let i=0;i<4;i++)box(.48-i*.05,.014,.008,.15-i*.025,.14-i*.09,.052,'groove',identity);
  const identityMark=box(.69,.017,.012,.04,-.20,.059,'signal',identity);preserved.push(identityMark);
  // The pen follows the same rules being inked on the page, then returns to
  // its cradle before a page turn. It never crosses the paper while lifted.
  const pen=group(0,.40,1.16);pen.name='fasight-writing-pen';preserved.push(pen);
  const barrelGeometry=new T.LatheGeometry([new T.Vector2(.035,-.89),new T.Vector2(.041,-.78),new T.Vector2(.048,-.57),new T.Vector2(.063,-.42),new T.Vector2(.065,.38),new T.Vector2(.057,.56),new T.Vector2(.029,.63),new T.Vector2(0,.65)],48);
  const barrel=mesh(barrelGeometry,'enamel',pen);barrel.rotation.z=-Math.PI/2;
  for(let i=0;i<10;i++){const grip=ring(.048,.002,-.78+i*.018,0,0,'brass',pen);grip.rotation.y=Math.PI/2;}
  for(const x of [-.65,.38,.54]){const r=ring(.057,.006,x,0,0,'brass',pen);r.rotation.y=Math.PI/2;}
  line([[.17,.052,0],[.51,.052,0],[.54,.025,0]],.008,'brass',pen);
  const nib=new T.Shape();nib.moveTo(0,-.06);nib.lineTo(-.22,0);nib.lineTo(0,.06);nib.closePath();const penNib=mesh(new T.ExtrudeGeometry(nib,{depth:.016,bevelEnabled:false}),'brass',pen);penNib.rotation.x=-Math.PI/2;penNib.position.set(-.88,0,0);line([[-1.10,.018,0],[-.94,.018,0]],.002,'groove',pen);const breather=mesh(new T.SphereGeometry(.009,12,8),'groove',pen);breather.position.set(-.94,.018,0);
  for(const x of [-.65,.50]){slab(.18,.20,.04,x,.32,1.16,'teal',root,.03);}
  const route=new T.CatmullRomCurve3([new T.Vector3(-2.39,.36,1.20),new T.Vector3(-1.53,.36,1.10),new T.Vector3(-1.36,.36,.38),new T.Vector3(-.92,.46,.05)]);
  const familyRoute=new T.CatmullRomCurve3([new T.Vector3(1.28,.36,.0),new T.Vector3(1.55,.36,.65),new T.Vector3(2.18,.36,.61),new T.Vector3(2.50,.56,-.23)]);
  for(const path of [route,familyRoute])line(path.getPoints(60).map(v=>v.toArray()),.012,'brass');
  const travelling=group();travelling.name='fasight-data-trail';preserved.push(travelling);
  const trailBeads=Array.from({length:8},(_,i)=>mesh(new T.SphereGeometry(.052-i*.004,16,12),'signal',travelling));
  const assetMark=group(0,.30,0,assets);assetMark.name='fasight-asset-outline';
  line([[-.91,0,-.72],[.91,0,-.72],[.91,0,.72],[-.91,0,.72],[-.91,0,-.72]],.018,'signal',assetMark);preserved.push(assetMark);
  const windowGlow=group(0,0,0,assets);windowGlow.name='fasight-home-windows';
  for(const x of [-.63,-.21])for(const y of [.54,.84]){const pane=rounded(.112,.145,.003,x,y,.184,'window',windowGlow,.003);pane.castShadow=false;}preserved.push(windowGlow);
  // Attach before finish: both batching and the centering transform are retained.
  root.updateMatrixWorld(true);const bookMatrix=book.matrixWorld.clone(),bookRotation=book.getWorldQuaternion(new T.Quaternion());
  const framingPoints=[],whole=new T.Box3().setFromObject(root),centre=whole.getCenter(new T.Vector3()),frameOffset=new T.Vector3(-centre.x,-whole.min.y,-centre.z);
  root.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])framingPoints.push(new T.Vector3(x,y,z).add(frameOffset));});
  for(const g of preserved)root.attach(g);
  const routeOrigin=new T.Vector3(); // Capture centering translation applied by finish.
  const before=travelling.position.clone();const model=finish(19,preserved);routeOrigin.copy(travelling.position).sub(before);
  const story=[
    {step:'01 / 04',index:0,title:'Start with your details',detail:'Personal information and identity documents begin the planning flow.',tone:'neutral'},
    {step:'02 / 04',index:1,title:'Consider what you leave behind',detail:'The prototype collects assets intended for your next of kin.',tone:'neutral'},
    {step:'03 / 04',index:2,title:'Choose someone you trust',detail:'Record a trusted person and your relationship to them.',tone:'neutral'},
    {step:'04 / 04',index:3,title:'Bring the plan together',detail:'See your details, assets and trusted people together in a draft overview.',tone:'neutral'},
  ];
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const penRest=pen.position.clone(),penRestRotation=pen.quaternion.clone(),turnRest=turn.quaternion.clone();
  const writingRotation=bookRotation.clone().multiply(new T.Quaternion().setFromEuler(new T.Euler(0,-.72,1.12)));
  const pointOnPage=(row,u)=>{const x=-1.31+(845+590*u)/1536*2.62,y=1.325-(623+row*235)/1536*2.65;return new T.Vector3(x,y,.154+fasightPaperHeight(x,y));};
  let manualTime=null,timeOffset=0,lastTurn=-1;
  Object.assign(model.userData,{displayBase:false,groundLevel:0,framingPoints,studioProfile:'fasight',contactFootprint:false,initialYaw:-.24,initialElevation:.29,autoOrbit:false,realTimeAnimation:true,cycleDuration:20,
   setStep(index,elapsed=0){if(index===null){timeOffset=elapsed-(manualTime??(elapsed-timeOffset));manualTime=null;}else manualTime=[2.4,7.4,12.8,19.32][Math.max(0,Math.min(3,index))];model.userData.animate(elapsed);}
  });
  model.userData.animate=time=>{
    const state=fasightMoment(manualTime??(time-timeOffset)),{t,phase,local,row,ink,stroke,bridge}=state;model.userData.story=story[phase];
    pages.userData.section=phase;pages.userData.progress=ink;ledger.update(phase,ink);
    identityMark.visible=phase===0;assetMark.visible=phase===1;windowGlow.visible=phase>=1;
    medallionHighlights.forEach((o,i)=>{o.visible=phase>=2&&local>(i*.26+.65)||phase===3;});
    branchLights.forEach((o,i)=>{const progress=phase===2?smooth((local-i*.26)/1.1):phase===3?1:0;o.visible=progress>0;o.geometry.setDrawRange(0,Math.floor(o.geometry.index.count*progress/3)*3);});
    const path=phase===2?familyRoute:route,u=smooth((local-.1)/1.4);
    travelling.visible=phase<3&&local<1.55;
    trailBeads.forEach((bead,i)=>bead.position.copy(path.getPointAt(Math.max(0,u-i*.035))).add(routeOrigin).sub(travelling.position));
    // Nib position and the revealed ink derive from one timeline.
    const nibPoint=pointOnPage(row,stroke);
    if(bridge>0&&row<2){nibPoint.lerp(pointOnPage(row+1,0),bridge);nibPoint.z+=Math.sin(bridge*Math.PI)*.16;}
    nibPoint.applyMatrix4(bookMatrix).add(routeOrigin);
    const scale=1-.45*state.pen,tip=new T.Vector3(-1.10,0,0).multiplyScalar(scale).applyQuaternion(writingRotation);
    pen.position.copy(penRest).lerp(nibPoint.sub(tip),state.pen);pen.position.y+=Math.sin(state.pen*Math.PI)*.25;
    pen.quaternion.copy(penRestRotation).slerp(writingRotation,state.pen);pen.scale.setScalar(scale);
    turn.visible=state.turn>0&&state.turn<1;
    turn.quaternion.copy(turnRest).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-Math.PI*state.turn));
    if(lastTurn!==state.turn){for(let i=0;i<sheetPosition.count;i++){const x=sheetRest[i*3],y=sheetRest[i*3+1];sheetPosition.setXYZ(i,x,y,fasightPaperHeight(x,y)+Math.sin(x/1.31*Math.PI)*Math.sin(state.turn*Math.PI)*.24);}sheetPosition.needsUpdate=true;sheetGeometry.computeVertexNormals();lastTurn=state.turn;}
  };
  model.userData.animate(0);return model;
}
