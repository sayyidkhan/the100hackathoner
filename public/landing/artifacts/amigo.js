import { amigoSurfaces } from './amigo-surfaces.js';
import { earlyStudio, ease } from './early-exhibit-studio.js';

// A conversation café: reciprocal greetings become vocabulary to practise later.
// This is a conceptual illustration of the prototype, not a live calling service.
export function createArtifact(T) {
  const k=earlyStudio(T);
  const {root,m,mesh,box,disk,ball,line,group,rounded,slab,ring,finish,texture}=k;
  for(const [key,color,roughness,metalness] of [
    ['rust',0xb65b37,.9,0],['teal',0x175359,.9,0],['walnut',0x62422a,.5,0],
    ['page',0xf3e6d0,.85,0],['plaster',0xdec8a9,.93,0],['glass',0x21474a,.23,.22],
    ['leaf',0x536744,.78,0],['soil',0x433326,1,0],['apple',0xb83e2b,.38,0],
    ['warm',0xffe1a0,.45,0],['seam',0xbf9672,.9,0]
  ])m[key]=new T.MeshStandardMaterial({color,roughness,metalness});
  amigoSurfaces(T,m);
  for(const key of ['rust','teal']){m[key].roughness=.94;m[key].bumpMap=texture('cloth');m[key].bumpMap.repeat.set(4,4);m[key].bumpScale=.026;}
  m.plaster.bumpMap=texture('stone');m.plaster.bumpScale=.022;
  m.walnut.bumpMap=texture('wood');m.walnut.bumpScale=.008;
  m.warm.emissive.setHex(0xffc56f);m.warm.emissiveIntensity=.8;
  const labels=[];
  function label(value,w,x,y,z,parent=root,color='#443321'){
    const g=group(x,y,z,parent);cardText(T,value,w,g,color);return g;
  }
  function fixedText(value,w,x,y,z,parent=root,color){const g=label(value,w,x,y,z,parent,color);labels.push(g);return g;}
  function puff(sx,sy,sz,x,y,z,color,parent=root,power=.55){
    const geo=new T.SphereGeometry(1,48,32),p=geo.attributes.position;
    const bend=v=>Math.sign(v)*Math.pow(Math.abs(v),power);
    for(let i=0;i<p.count;i++)p.setXYZ(i,bend(p.getX(i))*sx,bend(p.getY(i))*sy,bend(p.getZ(i))*sz);
    geo.computeVertexNormals();const o=mesh(geo,color,parent);o.position.set(x,y,z);return o;
  }
  function stem(a,b,r,color,parent=root){const v=new T.Vector3(...b).sub(new T.Vector3(...a));const o=mesh(new T.CylinderGeometry(r*.72,r,v.length(),12),color,parent);o.position.copy(new T.Vector3(...a).addScaledVector(v,.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
  // One low terrazzo floor, rather than an object display pedestal.
  const floor=disk(3.5,.16,0,.08,0,'rust');floor.scale.z=.80;
  const terrazzo=disk(3.49,.055,0,.181,0,'stone');terrazzo.scale.z=.80;
  // Sparse deterministic stone chips lie flush with the terrazzo surface.
  let seed=26;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<440;i++){
    const a=rand()*Math.PI*2,r=Math.sqrt(rand())*3.42;
    const chip=disk(.009+rand()*.023,.001,r*Math.cos(a),.210,r*Math.sin(a)*.8,i%4===0?'rust':i%3===0?'walnut':'cream');chip.scale.z=.45+rand()*.8;
  }
  // The café wall has an actual arched opening and a dark inset window.
  const wallShape=new T.Shape();wallShape.moveTo(-2.92,.21);wallShape.lineTo(2.92,.21);wallShape.lineTo(2.92,2.45);
  wallShape.quadraticCurveTo(2.92,2.60,2.65,2.62);wallShape.lineTo(1.65,2.77);
  wallShape.bezierCurveTo(1.20,4.12,-1.20,4.12,-1.65,2.77);wallShape.lineTo(-2.65,2.62);wallShape.quadraticCurveTo(-2.92,2.60,-2.92,2.45);wallShape.closePath();
  const hole=new T.Path();hole.moveTo(-1.25,.34);hole.lineTo(-1.25,2.28);hole.bezierCurveTo(-1.25,3.51,1.25,3.51,1.25,2.28);hole.lineTo(1.25,.34);hole.closePath();wallShape.holes.push(hole);
  const wall=mesh(new T.ExtrudeGeometry(wallShape,{depth:.17,bevelEnabled:true,bevelSize:.045,bevelThickness:.035,bevelSegments:4,curveSegments:40}),'plaster');wall.position.z=-1.60;
  const glassShape=new T.Shape();glassShape.moveTo(-1.24,.34);glassShape.lineTo(1.24,.34);glassShape.lineTo(1.24,2.28);glassShape.bezierCurveTo(1.24,3.49,-1.24,3.49,-1.24,2.28);glassShape.closePath();
  const window=mesh(new T.ShapeGeometry(glassShape,48),'glass');window.position.z=-1.57;
  // Quiet garden silhouettes behind the mullions give the window some depth.
  for(let i=0;i<18;i++){
    const x=-1.12+rand()*2.24,h=.8+rand()*1.8;
    stem([x,.37,-1.55],[x+.12,h,-1.55],.012,'leaf');
    for(let j=0;j<5;j++){const l=ball(.065,x+(j%2?-.06:.14),.45+(h-.45)*j/5,-1.53,'leaf');l.scale.set(.45,1.5,.15);l.rotation.z=j%2?.6:-.6;}
  }
  const arch=[];for(let i=0;i<=50;i++){const a=i/50*Math.PI;arch.push([-1.27*Math.cos(a),2.28+Math.sin(a)*.93,-1.36]);}
  line([[-1.27,.32,-1.36],[-1.27,2.28,-1.36],...arch.slice(1),[1.27,.32,-1.36]],.045,'walnut');
  for(const x of [-.63,0,.63])box(.038,x===0?2.86:2.70,.06,x,x===0?1.77:1.68,-1.34,'walnut');
  for(const y of [.83,1.50,2.17])box(2.47,.037,.06,0,y,-1.34,'walnut');
  fixedText('A M I G O',1.12,0,3.47,-1.29,root,'#785130');
  // Side shelves, tiny books, and a botanical print belong to the architecture.
  slab(.85,.30,.055,-2.13,1.58,-1.22,'walnut');
  for(let i=0;i<4;i++){rounded(.095,.37+i%2*.07,.18,-2.24+i*.105,1.81,-1.22,i%2?'rust':'page');box(.065,.012,.005,-2.24+i*.105,1.90,-1.12,'brass');}
  slab(.73,.30,.055,2.15,1.60,-1.22,'walnut');
  rounded(.51,.65,.04,2.13,1.98,-1.27,'walnut');rounded(.43,.57,.018,2.13,1.98,-1.24,'page');
  stem([2.13,1.77,-1.21],[2.13,2.17,-1.21],.006,'leaf');
  for(let i=0;i<4;i++){const l=ball(.06,2.13+(i%2?-.055:.055),1.86+i*.07,-1.20,'leaf');l.scale.set(.55,1,.12);l.rotation.z=i%2?-.6:.6;}

  function chair(x,color,yaw){
    const g=group(x,.21,.03);g.rotation.y=yaw;
    for(const sx of [-.44,.44])for(const sz of [-.38,.38])stem([sx*1.15,0,sz*1.15],[sx,.46,sz],.045,'walnut',g);
    puff(.63,.17,.57,0,.47,0,color,g);
    puff(.54,.13,.49,0,.64,.03,color,g,.48);
    // Continuous padded U-shaped back and arms, with rounded end caps.
    const positions=[],uv=[],indices=[],nu=84,nv=28;
    for(let i=0;i<=nu;i++){
      const a=-2.02+i/nu*4.04,back=Math.max(0,Math.cos(a)),cy=.94+back*.10,ry=.31+back*.20;
      for(let j=0;j<=nv;j++){const v=j/nv*Math.PI*2,r=.62+.15*Math.cos(v);positions.push(Math.sin(a)*r,cy+Math.sin(v)*ry,-Math.cos(a)*r*.85);uv.push(i/nu*3,j/nv);}
    }
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;indices.push(a,a+1,b,b,a+1,b+1);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,color,g);
    for(const s of [-1,1]){const a=s*2.02;puff(.14,.31,.14,Math.sin(a)*.62,.94,-Math.cos(a)*.62*.85,color,g,.8);}
    const pillow=puff(.31,.29,.09,0,1.02,-.32,color==='rust'?'rust':'page',g,.5);pillow.rotation.x=-.18;pillow.rotation.z=color==='rust'?-.12:.12;
    const piping=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;piping.push([.52*Math.cos(a),.66,.03+.47*Math.sin(a)]);}line(piping,.006,'seam',g);
    return g;
  }
  chair(-1.55,'rust',.20);chair(1.55,'teal',-.20);
  // Shared café table: turned pedestal, beveled top, ceramic cups and notebook.
  const table=group(0,.21,.48);
  disk(.36,.055,0,.028,0,'walnut',table);
  const leg=mesh(new T.LatheGeometry([new T.Vector2(.31,0),new T.Vector2(.29,.06),new T.Vector2(.16,.72),new T.Vector2(.14,.82)],64),'walnut',table);leg.position.y=.04;
  disk(.86,.095,0,.92,0,'walnut',table);
  const edge=ring(.85,.014,0,.969,0,'brass',table);edge.rotation.x=Math.PI/2;
  function cup(x,z){
    const g=group(x,.983,z,table);disk(.14,.018,0,.009,0,'cream',g);
    mesh(new T.LatheGeometry([new T.Vector2(.067,.015),new T.Vector2(.086,.045),new T.Vector2(.095,.17),new T.Vector2(.084,.17),new T.Vector2(.074,.055)],48),'cream',g);
    disk(.076,.003,0,.145,0,'walnut',g);ring(.092,.007,0,.173,0,'cream',g).rotation.x=Math.PI/2;
    ring(.049,.010,.104,.104,0,'cream',g).scale.x=.8;
  }
  cup(-.49,-.01);cup(.49,-.01);
  slab(.48,.34,.025,0,.985,.04,'rust',table,.015);
  for(const s of [-1,1]){const page=slab(.22,.32,.012,s*.116,1.008,.04,'page',table,.012);page.rotation.z=s*.08;for(let i=0;i<5;i++)box(.15,.002,.006,s*.12,1.022,-.065+i*.04,'shade',table);}

  // A warm dome lamp frames the café without another giant exhibit arch.
  line([[-2.44,.25,-.88],[-2.44,3.76,-.88],[-2.12,4.03,-.88],[-.80,4.16,-.88],[-.18,3.99,-.88],[-.18,3.87,-.88]],.018,'brass');
  const lamp=mesh(new T.SphereGeometry(.28,48,24,0,Math.PI*2,0,Math.PI/2),'brass');lamp.position.set(-.18,3.70,-.88);
  disk(.276,.015,-.18,3.701,-.88,'warm');
  ball(.07,-.18,3.675,-.88,'warm');
  // Olive tree and a couple of books keep the scene inhabited without avatars.
  const tree=group(2.68,.21,-.61);
  mesh(new T.LatheGeometry([new T.Vector2(.20,0),new T.Vector2(.27,.07),new T.Vector2(.30,.45),new T.Vector2(.28,.48),new T.Vector2(.25,.45)],48),'stone',tree);
  disk(.25,.018,0,.43,0,'soil',tree);
  stem([0,.4,0],[.03,2.03,0],.035,'walnut',tree);
  for(let i=0;i<12;i++){
    const a=i*2.4,y=.85+i*.09,dx=Math.cos(a)*(.35+rand()*.15),dz=Math.sin(a)*.33;
    stem([.01,y-.22,0],[dx,y+.28,dz],.012,'walnut',tree);
    for(let j=0;j<9;j++){const t=j/8;const leaf=ball(.065,dx*t+(j%2?.045:-.045),y-.18+t*.46,dz*t,'leaf',tree);leaf.scale.set(.42,1.35,.18);leaf.rotation.set(.3,a,j%2?.45:-.45);}
  }
  const books=group(-2.45,.21,1.10);books.rotation.y=.12;
  for(let i=0;i<2;i++){slab(.83,.53,.025,0,.02+i*.145,0,i?'rust':'teal',books,.025);slab(.79,.48,.10,.015,.08+i*.145,0,'page',books,.012);slab(.83,.53,.025,0,.14+i*.145,0,i?'rust':'teal',books,.025);rounded(.83,.14,.03,0,.08+i*.145,.25,i?'rust':'teal',books,.012);}
  fixedText('Languages',.55,0,.23,.29,books,'#f4e4c2');
  fixedText('Conversations',.65,0,.085,.29,books,'#f4e4c2');

  // Speech bubbles are graphic sculpture, not duplicate device screens.
  function bubble(word,x){
    const g=group(x,2.50,.07);g.name=word==='Hello'?'amigo-greeting':'amigo-reply';
    rounded(1.15,.54,.10,0,0,0,'cream',g,.25);
    const s=new T.Shape();s.moveTo(-.21,-.19);s.quadraticCurveTo(-.24,-.37,-.40,-.37);s.lineTo(-.36,-.17);s.closePath();mesh(new T.ExtrudeGeometry(s,{depth:.095,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:3}),'cream',g).position.z=-.05;
    label(word,.79,0,.025,.071,g);return g;
  }
  const greeting=bubble('Hello',-1.55),reply=bubble('Hola',1.55);
  const route=new T.CatmullRomCurve3([new T.Vector3(-.93,2.47,.02),new T.Vector3(-.43,2.46,.02),new T.Vector3(.32,2.28,.02),new T.Vector3(.93,2.46,.02)]);
  mesh(new T.TubeGeometry(route,64,.023,12,false),'rust');
  const beads=[];for(let i=0;i<3;i++){const g=group();ball(.065,0,0,0,'warm',g);g.name=`amigo-message-${i}`;beads.push(g);g.position.copy(route.getPointAt((i+1)/4));}
  const exchange=group();exchange.name='amigo-exchange';ball(.09,0,0,0,'warm',exchange);
  const cards=[];
  const ledge=slab(2.03,.65,.13,0,.275,1.89,'stone',root,.22);
  for(let i=0;i<3;i++){
    const x=(i-1)*.63,y=i===1?.87:.77,g=group(x,y,1.91);g.rotation.x=-.10;g.rotation.y=(1-i)*.11;g.name=`amigo-word-${i}`;
    rounded(i===1?.62:.53,i===1?.93:.80,.045,0,0,0,'cream',g,.06);
    slab(.58,.22,.045,x,.36,1.91,'walnut');
    if(i===1){
      const apple=ball(.15,0,.19,.07,'apple',g);apple.scale.set(.95,1,.40);
      stem([0,.29,.08],[-.025,.40,.08],.012,'walnut',g);
      const leaf=ball(.07,.075,.35,.08,'leaf',g);leaf.scale.set(1,.45,.16);leaf.rotation.z=.5;
    }else if(i===0){
      const sun=disk(.11,.02,0,.17,.07,'gold',g);sun.rotation.x=Math.PI/2;
      for(let n=0;n<8;n++){const a=n/8*Math.PI*2;stem([Math.cos(a)*.145,.17+Math.sin(a)*.145,.08],[Math.cos(a)*.195,.17+Math.sin(a)*.195,.08],.009,'gold',g);}
    }else{
      const leaf=ball(.16,0,.16,.07,'leaf',g);leaf.scale.set(.55,1,.15);leaf.rotation.z=-.55;
      stem([-.09,.02,.095],[.09,.31,.095],.005,'page',g);
    }
    label(['sun','apple','leaf'][i],[.22,.32,.24][i],0,-.14,.04,g);
    label(['sol','manzana','hoja'][i],[.18,.43,.24][i],0,-.31,.04,g,'#78634d');cards.push(g);
  }
  // Preserve complete animated assemblies so labels move with their geometry.
  root.updateMatrixWorld(true);const before=greeting.getWorldPosition(new T.Vector3());
  // Fit actual architectural pieces, not the empty upper corners of a huge box.
  const framing=[];
  for(const child of root.children){
    const b=new T.Box3().setFromObject(child);
    if(b.isEmpty()||b.getSize(new T.Vector3()).length()<.30)continue;
    for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y+.05])for(const z of [b.min.z,b.max.z])framing.push(new T.Vector3(x,y,z));
  }
  const out=finish(26,[greeting,reply,exchange,...beads,...cards,...labels]);
  const offset=greeting.position.clone().sub(before),bubbleRest=[greeting.position.clone(),reply.position.clone()],cardRest=cards.map(g=>g.position.clone());
  out.userData.framingPoints=framing.map(p=>p.add(offset));
  out.userData.studioProfile='amigo';out.userData.initialElevation=.18;out.userData.initialYaw=-.06;
  out.userData.animate=time=>{
    const t=((time%14)+14)%14;
    const send=ease((t-1)/.5)*(1-ease((t-4.0)/.6));
    const answer=ease((t-5.2)/.5)*(1-ease((t-8.0)/.6));
    [greeting,reply].forEach((g,i)=>{const a=i?answer:send;g.position.copy(bubbleRest[i]);g.position.y+=a*.07;g.scale.setScalar(1+a*.035);});
    beads.forEach((g,i)=>{g.position.copy(route.getPointAt((i+1)/4)).add(offset);g.scale.setScalar(1+(send+answer)*.24);});
    const sending=t>=1&&t<4.6,replying=t>=5.2&&t<8.6;
    exchange.visible=sending||replying;
    const progress=sending?ease((t-1)/3.6):replying?1-ease((t-5.2)/3.4):0;
    exchange.position.copy(route.getPointAt(progress)).add(offset);
    exchange.scale.setScalar(Math.pow(Math.max(0,Math.sin(progress*Math.PI)),.3));
    cards.forEach((g,i)=>{const lift=ease((t-8.8-i*.20)/.7)*(1-ease((t-11.7-i*.15)/.9));g.position.copy(cardRest[i]);g.position.y+=lift*(i===1?.22:.09);});
  };
  out.userData.animate(0);return out;
}

function cardText(T,value,width,parent,color){
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.height=160;let ctx=c.getContext('2d');ctx.font='96px Georgia';c.width=Math.ceil(ctx.measureText(value).width+28);
  ctx=c.getContext('2d');ctx.font='96px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(value,c.width/2,80);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
  const label=new T.Mesh(new T.PlaneGeometry(width,width*160/c.width),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));label.userData.noShadow=true;parent.add(label);
}
