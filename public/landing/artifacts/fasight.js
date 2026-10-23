import { medivoiceStudio } from './medivoice-studio.js';
import { planningExhibitSurfaces } from './planning-exhibit-surfaces.js';

// Fasight's static prototype becomes a physical planning desk: identity,
// assets, trusted people, review. This is a conceptual workflow, not a will.
export function createArtifact(T) {
  const { root, materials:m, mesh, box, disk, line, finish, texture } = medivoiceStudio(T);
  const mat=(color,roughness=.6,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  Object.assign(m,{stone:mat(0xdcc7a6,.85),paper:mat(0xeee2c9,.86),pageEdge:mat(0xc8b794),teal:mat(0x163c3d,.5),brass:mat(0xb28b48,.32,.76),groove:mat(0x8f8062,.85),roof:mat(0xa69a80,.7),ivory:mat(0xf0e4ce,.7),glass:mat(0x203b3a,.4),signal:mat(0x65b0a2,.35,.25)});
  const stone=texture('stone'),cloth=texture('cloth');
  for(const key of ['stone','paper','ivory']){m[key].bumpMap=stone;m[key].bumpScale=key==='stone'?.018:.006;}
  m.teal.bumpMap=cloth;m.teal.bumpScale=.008;
  m.stone.map=planningExhibitSurfaces(T).stone;m.stone.bumpMap=m.stone.map;m.stone.bumpScale=.028;
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
  rounded(1.46,.30,.035,0,.165,1.83,'brass',root,.045);rounded(1.36,.23,.012,0,.165,1.874,'teal',root,.03);label('Fasight',1.06,0,.165,1.917);
  for(const x of [-.64,.64])coin(.022,.012,x,.165,1.918,'brass');

  // Asset tray: miniature house, real coin rims, hinged keepsake box.
  const assets=group(-2.39,.34,.12);
  slab(1.93,1.55,.13,0,0,0,'teal',assets,.10);
  box(1.90,.18,.06,0,.21,-.75,'teal',assets);box(.06,.18,1.48,-.94,.21,0,'teal',assets);box(.06,.18,1.48,.94,.21,0,'teal',assets);box(1.90,.18,.06,0,.21,.75,'teal',assets);
  slab(.85,.74,.08,-.42,.15,-.13,'pageEdge',assets,.025);
  box(.68,.81,.55,-.42,.61,-.13,'ivory',assets);
  const roofShape=new T.Shape();roofShape.moveTo(-.40,0);roofShape.lineTo(0,.36);roofShape.lineTo(.40,0);roofShape.closePath();const roof=mesh(new T.ExtrudeGeometry(roofShape,{depth:.66,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2}),'roof',assets);roof.position.set(-.42,1.025,-.46);
  for(let i=1;i<8;i++) { const yy=1.025+i*.04, half=.4*(1-i/9);line([[-.42-half,yy,.215],[-.42+half,yy,.215]],.005,'groove',assets); }
  box(.1,.29,.12,-.16,1.30,-.29,'ivory',assets);
  for(const x of [-.63,-.25])for(const y of [.55,.86]){rounded(.13,.17,.012,x,y,.153,'glass',assets,.006);box(.016,.18,.02,x,y,.177,'ivory',assets);box(.14,.015,.02,x,y,.178,'ivory',assets);}
  rounded(.17,.27,.02,-.43,.40,.16,'pageEdge',assets,.018);box(.19,.035,.05,-.43,.55,.18,'ivory',assets);coin(.011,.02,-.38,.40,.20,'brass',assets);
  for(const [x,z,n] of [[.23,-.38,10],[.64,-.12,7],[.65,.48,5]])for(let i=0;i<n;i++){disk(.16,.035,x,.17+i*.04,z,'brass',assets);const rim=ring(.15,.008,x,.19+i*.04,z,'brass',assets);rim.rotation.x=Math.PI/2;}
  slab(.71,.43,.19,-.17,.17,.44,'ivory',assets,.04);slab(.73,.45,.035,-.17,.37,.44,'paper',assets,.04);coin(.033,.018,-.17,.29,.672,'brass',assets);

  // Book stands above the desk like the generated artwork: paper, leather,
  // visible page block, seven brass rings, and a gently curled lower corner.
  const book=group(-.05,1.73,-.40);book.rotation.x=-.27;
  rounded(2.83,2.85,.14,0,0,-.12,'teal',book,.10);
  for(let i=0;i<7;i++){rounded(1.32,2.66,.008,-.69,0,.035+i*.009,'pageEdge',book,.035);rounded(1.32,2.66,.008,.69,0,.035+i*.009,'pageEdge',book,.035);}
  for(const side of [-1,1]){rounded(1.31,2.65,.018,side*.69,0,.105,'paper',book,.04);for(let row=0;row<16;row++)box(1.08,.006,.004,side*.70,1.02-row*.125,.14,'groove',book);}
  for(let i=0;i<7;i++){const r=ring(.095,.023,0,-1.13+i*.375,.16,'brass',book);r.rotation.y=.3;}
  // Mesh sheet at the lower right corner, lifting toward the viewer.
  const curlP=[],curlUV=[],curlIX=[],N=24;
  for(let y=0;y<=N;y++)for(let x=0;x<=N;x++){const u=x/N,v=y/N;const lift=Math.pow(u,4)*Math.pow(1-v,3)*.24;curlP.push(.70+u*.61,-1.30+v*.52,.14+lift);curlUV.push(u,v);}
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const a=y*(N+1)+x;curlIX.push(a,a+1,a+N+1,a+1,a+N+2,a+N+1);}
  const curlGeo=new T.BufferGeometry();curlGeo.setAttribute('position',new T.Float32BufferAttribute(curlP,3));curlGeo.setAttribute('uv',new T.Float32BufferAttribute(curlUV,2));curlGeo.setIndex(curlIX);curlGeo.computeVertexNormals();mesh(curlGeo,'paper',book);
  const reviewed=group(-1.22,-1.13,.151,book);box(2.4,.023,.01,1.2,0,0,'brass',reviewed);preserved.push(reviewed);

  // A physical brass family tree. Cameos are sculpted profile reliefs, not
  // bobbing cartoon people; the medallions remain anchored to their branches.
  const tree=group(2.50,.35,-.23);
  disk(.62,.18,0,.09,0,'teal',tree);disk(.61,.025,0,.018,0,'brass',tree);disk(.26,.055,0,.21,0,'brass',tree);
  line([[0,.22,0],[.05,.63,0],[0,1.3,0],[.02,2.10,0],[0,3.0,0]],.052,'brass',tree);
  for(let j=0;j<5;j++)line([[.07*Math.cos(j),.23,.05*Math.sin(j)],[.04,.6,0],[.025*Math.cos(j),2.7,.02*Math.sin(j)]],.012,'brass',tree);
  const points=[[-.60,1.02],[.60,1.02],[-.65,2.03],[.65,2.03],[0,2.93]];
  const medallionHighlights=[];
  function profile(parent){
    const s=new T.Shape();s.moveTo(-.15,-.20);s.quadraticCurveTo(-.13,-.11,-.05,-.09);s.lineTo(-.05,-.035);s.quadraticCurveTo(-.13,.02,-.11,.13);s.quadraticCurveTo(-.10,.23,.035,.22);s.quadraticCurveTo(.13,.22,.12,.12);s.lineTo(.15,.07);s.lineTo(.11,.045);s.quadraticCurveTo(.13,-.02,.06,-.04);s.lineTo(.07,-.10);s.quadraticCurveTo(.17,-.12,.20,-.20);s.closePath();
    const o=mesh(new T.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelSize:.014,bevelThickness:.012,bevelSegments:3,curveSegments:14}),'ivory',parent);o.position.z=.061;
    for(let i=0;i<5;i++)line([[-.08+i*.025,.15,.105],[-.075+i*.028,.19,.11],[.02+i*.018,.18,.106]],.006,'pageEdge',parent);
  }
  points.forEach(([x,y],i)=>{line([[0,Math.max(.35,y-.7),0],[x*.4,y-.3,0],[x,y-.24,0]],.032,'brass',tree);const g=group(x,y,0,tree);coin(.33,.045,0,0,0,'paper',g);ring(.334,.019,0,0,.036,'brass',g);profile(g);const active=ring(.36,.012,0,0,.05,'signal',g);preserved.push(active);medallionHighlights.push(active);
    const leaf=group(x*.73,y-.43,.02,tree);const shape=new T.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(-.18,.15,0,.36);shape.quadraticCurveTo(.16,.15,0,0);const l=mesh(new T.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2}),'brass',leaf);leaf.rotation.z=x<0?.8:-.8;line([[0,.01,.022],[0,.32,.022]],.006,'groove',leaf);
  });

  const identity=group(-2.39,.35,1.21);identity.rotation.x=-Math.PI/2;identity.rotation.z=-.12;
  rounded(1.13,.57,.03,0,0,0,'paper',identity,.04);rounded(.26,.34,.018,-.34,0,.045,'pageEdge',identity,.025);const cameo=group(-.34,.01,.047,identity);cameo.scale.setScalar(.55);profile(cameo);
  for(let i=0;i<4;i++)box(.48-i*.05,.014,.008,.15-i*.025,.14-i*.09,.052,'groove',identity);
  const identityMark=box(.69,.017,.012,.04,-.20,.059,'signal',identity);preserved.push(identityMark);
  // Brass pen remains on the desk throughout, its nib and cap modelled.
  line([[-.84,.40,1.16],[.58,.40,1.16]],.055,'brass');
  for(const x of [-.65,.38,.54]){const r=ring(.057,.009,x,.40,1.16,'teal');r.rotation.y=Math.PI/2;}
  const nib=new T.Shape();nib.moveTo(0,-.06);nib.lineTo(-.22,0);nib.lineTo(0,.06);nib.closePath();const penNib=mesh(new T.ExtrudeGeometry(nib,{depth:.016,bevelEnabled:false}),'brass');penNib.rotation.x=-Math.PI/2;penNib.position.set(-.88,.40,1.16);
  const route=new T.CatmullRomCurve3([new T.Vector3(-1.95,.36,1.20),new T.Vector3(-1.45,.36,.94),new T.Vector3(-1.36,.36,.38),new T.Vector3(-1.25,.36,.88),new T.Vector3(.72,.36,.97),new T.Vector3(1.68,.36,.67),new T.Vector3(2.16,.36,.18)]);
  for(let i=0;i<40;i++){const p=route.getPointAt(i/39);disk(.025,.012,p.x,p.y,p.z,'brass');}
  const travelling=group();mesh(new T.SphereGeometry(.055,24,16),'signal',travelling);preserved.push(travelling);
  const assetMark=slab(1.77,1.39,.009,0,.145,0,'signal',assets,.06);preserved.push(assetMark);
  // Attach before finish: both batching and the centering transform are retained.
  root.updateMatrixWorld(true);for(const g of preserved)root.attach(g);
  const routeOrigin=new T.Vector3(); // Capture centering translation applied by finish.
  const before=travelling.position.clone();const model=finish(19,preserved);routeOrigin.copy(travelling.position).sub(before);
  const story=[
    {step:'01 / 04',index:0,title:'Start with your details',detail:'Personal information and identity documents begin the planning flow.',tone:'neutral'},
    {step:'02 / 04',index:1,title:'Consider what you leave behind',detail:'The prototype collects assets intended for your next of kin.',tone:'neutral'},
    {step:'03 / 04',index:2,title:'Choose someone you trust',detail:'Record a trusted person and your relationship to them.',tone:'neutral'},
    {step:'04 / 04',index:3,title:'Bring the plan together',detail:'Review is the final step in the concept. The original review screen remains a placeholder.',tone:'neutral'},
  ];
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  Object.assign(model.userData,{displayBase:false,groundLevel:0,studioProfile:'lrnmate',contactFootprint:false,initialYaw:-.10,initialElevation:.29,autoOrbit:false,realTimeAnimation:true,cycleDuration:20});
  model.userData.animate=time=>{
    const t=((time%20)+20)%20,phase=Math.min(3,Math.floor(t/5));model.userData.story=story[phase];
    identityMark.visible=phase===0;assetMark.visible=phase===1;
    medallionHighlights.forEach((o,i)=>{o.visible=phase===2&&i===4;});
    travelling.visible=t>=5&&t<10;travelling.position.copy(route.getPointAt(smooth((t-5)/5))).add(routeOrigin);
    reviewed.visible=phase===3;reviewed.scale.x=Math.max(.001,smooth((t-15)/2));
  };
  model.userData.animate(0);return model;
}
