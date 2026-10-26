// Residents use articulated arm segments and a deterministic hand-to-bin transfer.
export function buildDustbinResidents(T,k,house){
 const {mesh,box,disk,ball,line,group,rounded,slab,ring,m,batch}=k;
 const mat=(color,roughness=.73)=>new T.MeshStandardMaterial({color,roughness});
 Object.assign(m,{skin:mat(0xc68e67),skinLight:mat(0xe0af89),hair:mat(0x302521,.52),lips:mat(0x98634e),trousers:mat(0x384d51),shirt:mat(0xb66b4c),shirtBlue:mat(0x497c87),eye:mat(0x25221f,.3)});
 const ell=(parent,c,x,y,z,sx,sy,sz)=>{const o=ball(1,x,y,z,c,parent);o.scale.set(sx,sy,sz);return o;};
 function segment(parent,a,b,r1,r2,c){const g=new T.Group();parent.add(g);const o=mesh(new T.CylinderGeometry(r1,r2,1,20,1),c,g);const cap1=ell(g,c,0,.5,0,r1,r1,r1),cap2=ell(g,c,0,-.5,0,r2,r2,r2);return {g,o,cap1,cap2,r1,r2};}
 function place(seg,a,b){const d=b.clone().sub(a),len=d.length();seg.g.position.copy(a).addScaledVector(d,.5);seg.g.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());seg.o.scale.y=len;seg.cap1.position.y=len/2;seg.cap2.position.y=-len/2;}
 const V=p=>new T.Vector3(...p);
 function resident({name,x,z,angle,seated,color,skin,female}){
  const g=group(x,.265,z);g.rotation.y=angle;g.name=`dustbin-resident-${name}`;
  const hip=seated?.62:.92,shoulderY=hip+.53;
  // Smooth shaped shirt with a waist, natural shoulders and an open neckline.
  const profile=new T.SplineCurve([[0,hip-.08],[.19,hip-.07],[.19,hip+.12],[.17,hip+.26],[.24,hip+.46],[.22,hip+.54],[.08,hip+.60],[0,hip+.60]].map(p=>new T.Vector2(...p)));
  const geo=new T.LatheGeometry(profile.getPoints(32),40),pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,pos.getZ(i)*.65);geo.computeVertexNormals();mesh(geo,color,g);
  ell(g,'trousers',0,hip-.035,0,.20,.14,.14);
  const neck=mesh(new T.CylinderGeometry(.065,.075,.17,24),skin,g);neck.position.y=hip+.63;
  const head=group(0,hip+.86,.005,g);head.name='resident-head';
  const hg=new T.SphereGeometry(1,36,28),p=hg.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),jaw=y<0?1+y*.22:1;p.setXYZ(i,p.getX(i)*.15*jaw,y*.195,p.getZ(i)*.14);}hg.computeVertexNormals();mesh(hg,skin,head);
  // One continuous scalp follows the brow and wraps behind the ears.
  const hair=new T.SphereGeometry(1,40,24),hp=hair.attributes.position;
  for(let i=0;i<hp.count;i++){const x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i),phi=Math.atan2(z,x),theta=Math.acos(Math.max(-1,Math.min(1,y)))/Math.PI*(1.80-.55*Math.sin(phi));hp.setXYZ(i,.158*Math.cos(phi)*Math.sin(theta),.018+.204*Math.cos(theta),.153*Math.sin(phi)*Math.sin(theta));}hair.computeVertexNormals();mesh(hair,'hair',head);
  if(female){ell(head,'hair',0,-.015,-.15,.105,.10,.09);line([[0,-.01,-.20],[.03,-.16,-.22],[.02,-.28,-.17]],.045,'hair',head);}
  for(const s of [-1,1]){
   ell(head,skin,s*.146,-.01,0,.025,.043,.022);ell(head,'cream',s*.053,.025,.131,.023,.011,.006);ell(head,'eye',s*.052,.025,.137,.009,.009,.004);ell(head,'cream',s*.049,.028,.141,.002,.002,.002);
   line([[s*.03,.066,.126],[s*.053,.073,.126],[s*.079,.066,.115]],.005,'hair',head);
  }
  ell(head,skin,0,-.011,.143,.018,.032,.026);line([[-.025,-.077,.117],[0,-.083,.126],[.025,-.077,.117]],.003,'lips',head);
  for(const side of [-1,1]){
   const h=V([side*.115,hip,0]),knee=V([side*.15,seated?.56:.49,seated?.43:.015]),ankle=V([side*.15,.10,seated?.49:.035]);
   place(segment(g,h,knee,.10,.08,'trousers'),h,knee);place(segment(g,knee,ankle,.073,.044,'trousers'),knee,ankle);
   ell(g,'cream',side*.15,.062,ankle.z+.065,.075,.055,.15);ell(g,'walnut',side*.15,.025,ankle.z+.065,.077,.015,.15);
  }
  // Posed left arm and independently solved right arm: smooth, short-sleeved limbs.
  const shoulder=V([.235,shoulderY,0]),upper=segment(g,shoulder,shoulder,.063,.053,skin),lower=segment(g,shoulder,shoulder,.05,.032,skin);
  const sleeve=segment(g,shoulder,shoulder,.081,.073,color);
  const hand=group(0,0,0,g);ell(hand,skin,0,0,0,.038,.024,.062);
  for(let i=0;i<4;i++)ell(hand,skin,-.024+i*.016,-.006,.047,.010,.013,.035);ell(hand,skin,-.040,-.003,.015,.014,.017,.028);
  const rest=V([.28,hip+.12,.19]);
  const leftS=V([-.235,shoulderY,0]),leftE=V([-.28,hip+.23,.05]),leftH=V([-.25,hip+.07,seated?.32:.09]);
  place(segment(g,leftS,leftE,.066,.050,skin),leftS,leftE);place(segment(g,leftE,leftH,.05,.033,skin),leftE,leftH);place(segment(g,leftS,leftE,.081,.071,color),leftS,leftS.clone().lerp(leftE,.44));ell(g,skin,leftH.x,leftH.y,leftH.z,.036,.026,.055);
  function pose(target,amount){
   const wrist=rest.clone().lerp(target,amount);g.userData.reachDistance=wrist.distanceTo(shoulder);const delta=wrist.clone().sub(shoulder),dist=Math.min(.80,delta.length()),axis=delta.clone().normalize();
   // Two-bone bend projects down and slightly out, keeping the elbow by the body.
   const bend=V([.30,-1,.10]).addScaledVector(axis,-V([.30,-1,.10]).dot(axis)).normalize();
   const elbow=shoulder.clone().addScaledVector(axis,dist*.5).addScaledVector(bend,Math.sqrt(Math.max(.001,.415*.415-dist*dist*.25)));
   place(upper,shoulder,elbow);place(lower,elbow,wrist);place(sleeve,shoulder,shoulder.clone().lerp(elbow,.44));hand.position.copy(wrist);hand.rotation.x=-.15*amount;head.rotation.x=.06*amount;
  }
  pose(rest,0);
  // Batch only static anatomy; articulated segments and hands retain their pivots.
  const moving=[upper.g,lower.g,sleeve.g];moving.forEach(o=>g.remove(o));batch(g);moving.forEach(o=>g.add(o));
  return {g,hand,pose,rest,name,shoulder};
 }
 return [
  resident({name:'study',x:-3.70,z:2,angle:Math.PI/2,seated:true,color:'shirtBlue',skin:'skinLight',female:false}),
  resident({name:'living',x:-2.65,z:-1.85,angle:.10,seated:true,color:'shirt',skin:'skinLight',female:true}),
  resident({name:'kitchen',x:2.94,z:-.73,angle:-Math.PI/2,seated:false,color:'sage',skin:'skin',female:false})
 ];
}
