import { medivoiceStudio } from './medivoice-studio.js';

// Shared architectural vocabulary; capability growth, never invented traction.
export function createScaleup(T, initialStage=0) {
  const {root,materials:m,batch}=medivoiceStudio(T);
  for(const [k,color] of Object.entries({stone:0xe6d7b8,cream:0xf5e7ce,jade:0x124b43,glass:0x163c36,gold:0xc79852,terra:0xc47850,mint:0x84cfb5,leaf:0x52735b,wood:0x674c36}))m[k]=new T.MeshStandardMaterial({color,roughness:k==='gold'?.32:.65,metalness:k==='gold'?.7:0});
  m.glow=new T.MeshStandardMaterial({color:0xc9f4d6,emissive:0x78cba7,emissiveIntensity:1.2});
  m.lamp=new T.MeshStandardMaterial({color:0xffe6a7,emissive:0xffc574,emissiveIntensity:.65});
  const group=(x=0,y=0,z=0,parent=root)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;};
  const mesh=(geo,mat,parent=root)=>{const o=new T.Mesh(geo,m[mat]);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
  function box(w,h,d,r,x,y,z,mat,parent=root){
    const g=new T.BoxGeometry(w,h,d,8,8,8),p=g.attributes.position,n=g.attributes.normal;
    for(let i=0;i<p.count;i++){
      const v=new T.Vector3().fromBufferAttribute(p,i),c=new T.Vector3(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));
      const normal=v.clone().sub(c).normalize();v.copy(c).addScaledVector(normal,r);p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z);
    }
    const o=mesh(g,mat,parent);o.position.set(x,y,z);return o;
  }
  function ball(r,x,y,z,mat,parent=root){const o=mesh(new T.SphereGeometry(r,20,12),mat,parent);o.position.set(x,y,z);return o;}
  function disk(r,h,x,y,z,mat,parent=root,top=r){const o=mesh(new T.CylinderGeometry(top,r,h,32),mat,parent);o.position.set(x,y,z);return o;}
  function tube(points,r,mat,parent=root){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));mesh(new T.TubeGeometry(curve,40,r,8,false),mat,parent);return curve;}
  function arch(w,h,d,x,y,z,mat,parent=root){
    const s=new T.Shape(),r=w/2;s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h-r);s.absarc(0,h-r,r,0,Math.PI,false);s.closePath();
    const o=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,steps:1,curveSegments:24}),mat,parent);o.position.set(x,y,z);return o;
  }
  function ring(r,t,x,y,z,mat,parent=root){const o=mesh(new T.TorusGeometry(r,t,10,64),mat,parent);o.position.set(x,y,z);return o;}
  function slab(w,d,h,r,x,y,z,mat,parent){
    const s=new T.Shape(),a=w/2,b=d/2;
    s.moveTo(-a+r,-b);s.lineTo(a-r,-b);s.quadraticCurveTo(a,-b,a,-b+r);s.lineTo(a,b-r);s.quadraticCurveTo(a,b,a-r,b);s.lineTo(-a+r,b);s.quadraticCurveTo(-a,b,-a,b-r);s.lineTo(-a,-b+r);s.quadraticCurveTo(-a,-b,-a+r,-b);
    const o=mesh(new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:16}),mat,parent);o.rotation.x=-Math.PI/2;o.position.set(x,y-h/2,z);return o;
  }
  function label(text,parent){
    if(typeof document==='undefined')return;
    const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#f3e5c9';ctx.font='500 70px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,64);
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(1.12,.14),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));o.position.z=.12;o.userData.noShadow=true;parent.add(o);
  }
  const core=group(),origin=group(),platform=group(),spatial=group(),labels=group();
  slab(5.3,3.5,.16,.3,0,.08,.2,'stone',core);
  slab(8.2,3.65,.10,.4,0,.01,.2,'stone',origin);
  slab(9.7,5.5,.12,.65,0,.01,-.65,'stone',platform);
  slab(9.45,5.25,.015,.55,0,.08,-.65,'jade',platform);
  const cafe=group(0,.16,.18,core);
  box(2.5,2.24,1.48,.06,0,1.12,0,'stone',cafe);
  box(2.7,.16,1.67,.04,0,2.25,0,'cream',cafe);box(2.62,.06,1.59,.02,0,2.36,0,'gold',cafe);
  arch(1.1,.63,.09,0,2.15,.64,'cream',cafe);
  for(const x of [-.84,0,.84]){
    arch(.68,1.68,.05,x,.19,.757,'gold',cafe);arch(.59,1.59,.025,x,.23,.818,'jade',cafe);arch(.49,1.35,.012,x,.42,.852,'glass',cafe);
    box(.022,1.33,.025,.01,x,1.05,.88,'gold',cafe);
    for(const y of [.92,1.48])box(.51,.024,.025,.01,x,y,.88,'gold',cafe);
    if(x===0)ball(.035,x+.2,.83,.9,'gold',cafe);
  }
  for(const side of [-1,1]){
    const w=group(side*1.26,0,0,cafe);w.rotation.y=side*Math.PI/2;
    arch(.75,1.65,.025,0,.22,0,'gold',w);arch(.65,1.54,.025,0,.27,.03,'jade',w);box(.025,1.35,.025,.008,0,1.03,.07,'gold',w);
  }
  for(let i=0;i<11;i++){
    box(.249,.06,.91,.025,-1.245+i*.249,1.96,1.04,i%2?'cream':'terra',cafe).rotation.x=.38;
    box(.249,.16,.065,.03,-1.245+i*.249,1.72,1.47,i%2?'cream':'terra',cafe);
  }
  box(.85,.09,.3,.025,0,.08,1.02,'gold',cafe);
  for(const x of [-1.11,1.11]){tube([[x,1.5,.88],[x,1.67,.96],[x,1.6,1.12],[x,1.4,1.12]],.018,'gold',cafe);ball(.078,x,1.35,1.12,'lamp',cafe);}
  disk(.28,.055,-.65,.66,1.56,'cream',cafe);disk(.025,.46,-.65,.4,1.56,'gold',cafe);disk(.15,.025,-.65,.17,1.56,'gold',cafe);disk(.045,.09,-.65,.73,1.56,'terra',cafe);
  for(const x of [-1.12,-.2]){
    disk(.16,.05,x,.42,1.6,'wood',cafe);
    for(const a of [-1,1])for(const b of [-1,1])tube([[x+a*.1,.41,1.6+b*.1],[x+a*.14,.02,1.6+b*.14]],.014,'gold',cafe);
    tube([[x-.14,.43,1.75],[x-.14,.8,1.75],[x,.91,1.75],[x+.14,.8,1.75],[x+.14,.43,1.75]],.017,'gold',cafe);
    for(let i=0;i<5;i++)tube([[x-.1+i*.05,.47,1.75],[x-.1+i*.05,.8,1.75]],.009,'wood',cafe);
  }
  for(const x of [-1.75,1.75]){
    const g=group(x,.16,.45,core);disk(.19,.35,0,.175,0,'terra',g,.24);disk(.21,.025,0,.35,0,'wood',g);tube([[0,.3,0],[.015,.8,0],[0,1.5,.03]],.024,'wood',g);
    for(let i=0;i<18;i++){
      const a=i*2.4,y=.65+(i%6)*.16,r=.16+(i%3)*.04,x=Math.cos(a)*r,z=Math.sin(a)*r;tube([[0,y-.15,0],[x,y,z]],.008,'wood',g);
      for(let j=0;j<3;j++){const leaf=ball(.065,x+Math.sin(j*2)*.06,y+j*.035,z+Math.cos(j*2)*.06,'leaf',g);leaf.scale.set(.5,1.6,.65);leaf.rotation.z=a;}
    }
  }
  // Ledger, the retained foundation for every subsequent edition.
  const ledger=group(-2.8,.65,1.15,core);ledger.rotation.x=-.9;ledger.rotation.y=-.12;
  for(const side of [-1,1]){
    const p=group(side*.42,0,0,ledger);p.rotation.y=side*-.12;
    box(.83,1.05,.10,.035,0,0,0,'wood',p);box(.77,.99,.07,.025,0,0,.07,'cream',p);
    for(let i=0;i<4;i++){box(.085,.15+i*.09,.045,.015,-.25+i*.16,-.22+i*.045,.12,'mint',p);box(.6,.009,.009,.004,0,.27+i*.065,.115,'gold',p);}
  }
  function chart(p,kind){
    if(kind===0)for(let i=0;i<4;i++)box(.14,.32+i*.2,.035,.015,-.36+i*.24,-.45+i*.1,.1,'mint',p);
    else if(kind===1||kind===4){const pts=Array.from({length:7},(_,i)=>[-.47+i*.155,-.45+i*.14+(kind===4?Math.sin(i*2)*.16:Math.sin(i)*.06),.12]);tube(pts,.018,'mint',p);pts.filter((_,i)=>i%2===0).forEach(v=>ball(.045,...v,'gold',p));}
    else if(kind===2)for(let i=0;i<3;i++){ball(.055,-.39,.37-i*.35,.12,'gold',p);box(.6-i*.12,.065,.025,.012,.08-i*.06,.37-i*.35,.1,'mint',p);}
    else if(kind===3){ball(.12,0,0,.12,'gold',p);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=Math.sin(a)*.44,y=Math.cos(a)*.48;tube([[0,0,.1],[x,y,.1]],.012,'mint',p);ball(.06,x,y,.12,'mint',p);}}
    else{ring(.28,.055,0,.22,.12,'mint',p);for(const x of [-.25,.25])box(.35,.22,.03,.014,x,-.42,.11,'mint',p);}
  }
  function screen(x,y,z,kind,parent,yaw=0){const g=group(x,y,z,parent);g.rotation.y=yaw;box(1.35,1.9,.12,.055,0,0,0,'gold',g);box(1.26,1.81,.05,.024,0,0,.08,'jade',g);chart(g,kind);box(.93,.012,.025,.005,0,-.72,.11,'gold',g);return g;}
  screen(2.9,1.35,.25,1,origin,-.12);disk(.04,.35,2.9,.3,.25,'gold',origin);box(1.55,.1,.5,.04,2.9,.13,.25,'gold',origin);
  const panels=[],panelLabels=[],positions=[[-3.85,1.65,-.25,.3],[-2.7,2.15,-1.55,.18],[-1.05,2.65,-2.35,.07],[1.05,2.65,-2.35,-.07],[2.7,2.15,-1.55,-.18],[3.85,1.65,-.25,-.3]],names=['FINANCIALS','GROWTH COACH','REVIEWS','SOCIAL MEDIA','TRENDS','OVERVIEW'];
  positions.forEach(([x,y,z,yaw],i)=>{
    panels.push(screen(x,y,z,i,platform,yaw));disk(.032,y-.95,x,(y-.95)/2+.1,z,'gold',platform);box(1.45,.07,.4,.03,x,.12,z,'gold',platform);
    const l=group(x,y+.69,z,labels);l.rotation.y=yaw;label(names[i],l);panelLabels.push(l);
  });
  const pts=[[-2.15,.15,-1.3],[-2.15,1.65,-1.3],[-1.6,3.15,-1.3],[0,3.85,-1.3],[1.6,3.15,-1.3],[2.15,1.65,-1.3],[2.15,.15,-1.3]];
  tube(pts,.12,'cream',spatial);tube(pts.map(([x,y,z])=>[x,y,z+.105]),.022,'glow',spatial);
  const headset=group(2.55,.3,1.55,spatial);headset.rotation.y=-.18;
  box(1.85,.12,1.15,.055,0,0,0,'cream',headset);box(1.12,.6,.61,.15,0,.42,0,'cream',headset);box(1.02,.46,.075,.035,0,.43,.33,'gold',headset);box(.94,.39,.07,.03,0,.43,.38,'glass',headset);
  tube([[-.5,.4,-.1],[-.56,.45,-.5],[0,.48,-.77],[.56,.45,-.5],[.5,.4,-.1]],.075,'jade',headset);tube([[0,.63,.1],[0,.91,-.35],[0,.5,-.77]],.06,'jade',headset);
  for(const x of [-.7,.7]){box(.17,.34,.19,.075,x,.21,.36,'cream',headset).rotation.z=x;ring(.12,.025,x,.34,.34,'gold',headset).rotation.x=-.6;ball(.036,x,.37,.42,'jade',headset);}
  const routes=[];
  function route(points,parent,edition){const curve=tube(points,.014,'mint',parent),g=group(),bead=ball(.058,0,0,0,'glow',g);routes.push({curve,g,bead,edition});}
  route([[-2.8,.18,1.9],[-2,.18,2.1],[-1,.18,1.9]],core,0);route([[1.15,.18,1.5],[2.8,.18,1.25],[2.9,.18,.35]],origin,1);
  positions.forEach(([x,,z])=>route([[Math.sign(x)*1.4,.115,.7],[x*.75,.115,z+.65],[x,.115,z+.25]],platform,2));
  batch(core);batch(origin);batch(platform);batch(spatial);
  const stories=[{title:'The consulting idea',detail:'Super AI · 17–19 Jun 2025. Make AI business advice accessible to SMEs.'},{title:'The operating platform',detail:'Bolt.New · 21 Jun 2025. Finance, growth, reviews, social, trends and an overview share one business context.'},{title:'The immersive edition',detail:'OOJU × Manus.AI · 27 Jun 2025. Reimagine the same business intelligence in a spatial consulting environment.'}];
  let selected=initialStage,epoch=0,autoStart=initialStage;
  function animate(t){
    const stage=selected===null?(autoStart+Math.floor(Math.max(0,t-epoch)/9))%3:selected;
    origin.visible=stage===0;platform.visible=stage>=1;spatial.visible=stage===2;labels.visible=stage>=1;
    panels.forEach((p,i)=>{const dy=stage===2?.065*Math.sin(t*.85+i*.75):0;p.position.y=positions[i][1]+dy;panelLabels[i].position.y=positions[i][1]+.69+dy;});
    routes.forEach(({curve,g,bead,edition},i)=>{g.visible=edition===0||(edition===1?stage===0:stage>=1);bead.position.copy(curve.getPointAt((t*.13+i*.16)%1));});
    root.userData.story={index:stage,step:`0${stage+1} / 03`,...stories[stage],tone:'scaleup'};root.userData.currentStage=stage;
  }
  root.userData={conceptual:true,artifactId:36+initialStage,displayBase:false,studioProfile:'scaleup',groundLevel:-.06,initialYaw:-.12,initialElevation:.34,autoOrbit:false,realTimeAnimation:true,framingBounds:new T.Box3(new T.Vector3(-4.85,-.06,-3.4),new T.Vector3(4.85,4,2.25)),setStep(index,t=0){if(index===null){autoStart=root.userData.currentStage;epoch=t;selected=null;}else if(Number.isInteger(index)&&index>=0&&index<3)selected=index;animate(t);},animate};
  animate(0);return root;
}
